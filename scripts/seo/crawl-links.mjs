#!/usr/bin/env node
// NeuroWiki SEO, Site Crawl: dead links + orphan pages + link opportunities
// New for the SEO-DAILY-PORT (2026-09-07). Replaces two Tidbit scripts that
// were coupled to a blog data file (deadlinks.mjs, internal-links.mjs):
// NeuroWiki's body content and links live in JSX, but every route is
// prerendered to static HTML, so the LIVE SITE is the reliable link source.
//
// One weekly crawl, three reports:
//   1. Dead links      — every internal href on every page, checked.
//   2. Orphan pages    — sitemap pages no other page links to.
//   3. Link plan       — not-indexed pages (from indexation-latest.md)
//                        ranked by how few inbound links they have. These
//                        are SUGGESTIONS for the briefing; on NeuroWiki
//                        links live in JSX, so applying one is always a
//                        supervised code change, never unattended.
//
// Usage: node scripts/seo/crawl-links.mjs
// Exit codes: 0 = clean, 1 = broken links found (findings), 2 = setup error.

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE, normalizePath, kindOf } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = SITE.baseUrl
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ─── Page inventory ─────────────────────────────────────────────────────
let snapshot
try {
  snapshot = JSON.parse(await readFile(join(repoRoot, SITE.reportRoot, 'pages-snapshot-latest.json'), 'utf8'))
} catch {
  console.error('Missing pages-snapshot-latest.json. Run: npx tsx scripts/seo/lib/site-pages.ts first.')
  process.exit(2)
}
const sitemapPaths = snapshot.pages.filter((p) => p.inSitemap).map((p) => p.path)
const knownPaths = new Set(snapshot.pages.map((p) => p.path))

// ─── Crawl every sitemap page ───────────────────────────────────────────
console.log(`\n${SITE.name} Site Crawl`)
console.log(`Crawling ${sitemapPaths.length} pages from the live site...\n`)

const isInternal = (href) =>
  href.startsWith('/') || /^https?:\/\/(www\.)?neurowiki\.ai/i.test(href)
const isAsset = (p) =>
  p.startsWith('/assets/') ||
  p.startsWith('/api/') ||
  /\.(png|jpg|jpeg|gif|svg|ico|css|js|woff2?|ttf|otf|pdf|xml|txt|json|webp|webmanifest)$/i.test(p)

const pageStatus = new Map() // path -> {status}
const inbound = new Map() // target path -> Set of source paths
const edges = [] // {from, to}
let crawlFailures = 0

for (const [i, path] of sitemapPaths.entries()) {
  const url = path === '/' ? `${BASE}/` : `${BASE}${path}`
  try {
    // Follow redirects so the HTML still gets read (the apex host 307s to
    // www, and vercel.json carries internal 301s), but record the hop: a
    // sitemap entry that redirects is itself a finding.
    const r = await fetch(url, { redirect: 'follow' })
    pageStatus.set(path, { status: r.status, location: r.redirected ? r.url : null })
    if (r.ok) {
      const html = await r.text()
      // Anchor hrefs only; the prerendered shell uses plain <a> links.
      for (const m of html.matchAll(/<a[^>]+href="([^"#?]+)[^"]*"/g)) {
        const href = m[1]
        if (!isInternal(href)) continue
        const to = normalizePath(href)
        if (isAsset(to) || to === path) continue
        if (!inbound.has(to)) inbound.set(to, new Set())
        inbound.get(to).add(path)
        edges.push({ from: path, to })
      }
    }
  } catch (e) {
    pageStatus.set(path, { status: 0, error: e.message })
    crawlFailures++
  }
  if ((i + 1) % 25 === 0) console.log(`  ...${i + 1}/${sitemapPaths.length}`)
  await sleep(60)
}

// ─── Check link targets that are not sitemap pages ──────────────────────
const externalTargets = [...inbound.keys()].filter((t) => !pageStatus.has(t))
for (const t of externalTargets) {
  const url = t === '/' ? `${BASE}/` : `${BASE}${t}`
  try {
    const r = await fetch(url, { method: 'HEAD', redirect: 'manual' })
    pageStatus.set(t, { status: r.status, location: r.headers.get('location'), linkedOnly: true })
  } catch (e) {
    pageStatus.set(t, { status: 0, error: e.message, linkedOnly: true })
  }
  await sleep(80)
}

// ─── Categorize ─────────────────────────────────────────────────────────
const broken = [] // 404/5xx/fetch-fail targets that something links to (or sitemap pages)
const redirects = []
for (const [path, s] of pageStatus) {
  const sources = [...(inbound.get(path) ?? [])]
  if (s.status === 404 || s.status >= 500 || s.status === 0) {
    broken.push({ path, status: s.status, error: s.error, linkedFrom: sources.slice(0, 5), inSitemap: knownPaths.has(path) && !s.linkedOnly })
  } else if ((s.status >= 300 && s.status < 400) || s.location) {
    // Manual-HEAD 3xx (linked-only targets) or a followed hop (sitemap pages).
    // Same-path host hops (apex→www) are the known canonical redirect and
    // would be 182 lines of noise; report them as one line elsewhere.
    const samePath = s.location && normalizePath(s.location) === path
    if (!samePath) redirects.push({ path, location: s.location, linkedFrom: sources.slice(0, 5) })
  }
}

// SPA note: Vercel rewrites unknown paths to index.html (200), so a truly
// wrong internal link can still answer 200. Cross-check: a linked path that
// answers 200 but is neither in the inventory nor a Vercel redirect is
// suspicious and listed for review rather than called broken.
const suspicious = externalTargets.filter((t) => {
  const s = pageStatus.get(t)
  return s && s.status === 200 && !knownPaths.has(t)
})

// Orphans: sitemap pages with zero inbound links from other pages.
const orphans = sitemapPaths.filter((p) => (inbound.get(p)?.size ?? 0) === 0)

// ─── Link opportunities: not-indexed pages with weakest inbound ─────────
let notIndexed = []
try {
  const idxMd = await readFile(join(repoRoot, 'docs', 'seo', 'indexation-latest.md'), 'utf8')
  let current = null
  for (const line of idxMd.split('\n')) {
    if (line.startsWith('## Discovered')) current = 'd'
    else if (line.startsWith('## Crawled')) current = 'c'
    else if (line.startsWith('## ')) current = null
    else if (current && line.startsWith('| `')) {
      const m = line.match(/^\| `([^`]*)`/)
      if (m) notIndexed.push(m[1] || '/')
    }
  }
} catch {
  // No indexation report yet (first week); the opportunities section stays empty.
}
const opportunities = notIndexed
  .map((p) => ({
    path: p,
    kind: kindOf(p),
    inboundCount: inbound.get(p)?.size ?? 0,
    linkedFrom: [...(inbound.get(p) ?? [])].slice(0, 3),
  }))
  .sort((a, b) => a.inboundCount - b.inboundCount)
  .slice(0, 12)

// ─── Console summary ────────────────────────────────────────────────────
console.log(`\nPages crawled: ${sitemapPaths.length} (${crawlFailures} fetch failures)`)
console.log(`Internal link edges: ${edges.length} | Unique targets: ${inbound.size}`)
console.log(`Broken: ${broken.length} | Redirected: ${redirects.length} | Suspicious 200s: ${suspicious.length} | Orphans: ${orphans.length}`)
console.log(`Link opportunities (not-indexed, weakest inbound): ${opportunities.length}\n`)

// ─── Reports ────────────────────────────────────────────────────────────
const datestamp = new Date().toISOString().slice(0, 10)

// 1. Dead links
const dl = [`# Dead-link Sweep, ${datestamp}`, ``]
dl.push(`**Pages crawled:** ${sitemapPaths.length} (live prerendered HTML)`)
dl.push(`**Internal link edges found:** ${edges.length}`)
dl.push(``, `## Summary`, ``)
dl.push(`| Status | Count |`)
dl.push(`|---|---|`)
dl.push(`| Broken (404 / 5xx / no answer) | ${broken.length} |`)
dl.push(`| Redirects | ${redirects.length} |`)
dl.push(`| 200 but unrecognized path (SPA fallback risk) | ${suspicious.length} |`)
dl.push(`| Orphan pages (in sitemap, zero inbound links) | ${orphans.length} |`)
dl.push(``)
if (broken.length) {
  dl.push(`## Broken (action required)`, ``)
  dl.push(`| Path | Status | In sitemap | Linked from |`)
  dl.push(`|---|---|---|---|`)
  for (const b of broken) {
    dl.push(`| \`${b.path}\` | ${b.status || b.error} | ${b.inSitemap ? 'yes' : 'no'} | ${b.linkedFrom.map((s) => `\`${s}\``).join(', ') || '-'} |`)
  }
  dl.push(``)
}
if (redirects.length) {
  dl.push(`## Redirects (update the link to the final destination)`, ``)
  dl.push(`| Path | Redirects to | Linked from |`)
  dl.push(`|---|---|---|`)
  for (const r of redirects) {
    dl.push(`| \`${r.path}\` | \`${r.location ?? '?'}\` | ${r.linkedFrom.map((s) => `\`${s}\``).join(', ') || '(sitemap)'} |`)
  }
  dl.push(``)
}
if (suspicious.length) {
  dl.push(`## Answered 200 but not a known page`, ``)
  dl.push(`The hosting rewrites unknown paths to the app shell, so a wrong link can still answer 200. Verify these render real content:`, ``)
  for (const s of suspicious) dl.push(`- \`${s}\` (linked from ${[...(inbound.get(s) ?? [])].slice(0, 3).map((x) => `\`${x}\``).join(', ')})`)
  dl.push(``)
}
if (orphans.length) {
  dl.push(`## Orphan pages (zero inbound links)`, ``)
  dl.push(`In the sitemap, but no crawled page links to them. Google treats unlinked pages as low-priority.`, ``)
  for (const o of orphans) dl.push(`- \`${o}\``)
  dl.push(``)
}

await mkdir(join(repoRoot, 'docs', 'seo', 'deadlinks'), { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'deadlinks-latest.md'), dl.join('\n'))
await writeFile(join(repoRoot, 'docs', 'seo', 'deadlinks', `${datestamp}.md`), dl.join('\n'))

// 2. Link opportunities
const il = [`# Internal Link Plan, ${datestamp}`, ``]
il.push(`**Not-indexed pages considered:** ${notIndexed.length} (from indexation-latest.md)`)
il.push(`**Ranked by inbound-link count, weakest first.**`, ``)
il.push(`On NeuroWiki, links live in page code, so every suggestion below is a PROPOSAL for a supervised session; the morning job never edits pages. A good link comes from a topically related page a clinician would plausibly follow.`, ``)
if (opportunities.length === 0) {
  il.push(`_Nothing to suggest: either everything is indexed, or the indexation report has not run yet._`, ``)
} else {
  il.push(`| # | Not-indexed page | Kind | Inbound links today | Linked from |`)
  il.push(`|---|---|---|---|---|`)
  opportunities.forEach((o, i) => {
    il.push(`| ${i + 1} | \`${o.path}\` | ${o.kind} | ${o.inboundCount} | ${o.linkedFrom.map((s) => `\`${s}\``).join(', ') || '(none)'} |`)
  })
  il.push(``)
}
await mkdir(join(repoRoot, 'docs', 'seo', 'internal-links'), { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'internal-links-latest.md'), il.join('\n'))
await writeFile(join(repoRoot, 'docs', 'seo', 'internal-links', `${datestamp}.md`), il.join('\n'))

// 3. Machine-readable crawl
await mkdir(join(repoRoot, 'docs', 'seo', 'crawl'), { recursive: true })
await writeFile(
  join(repoRoot, 'docs', 'seo', 'crawl', `${datestamp}.json`),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      pagesCrawled: sitemapPaths.length,
      edges: edges.length,
      inbound: Object.fromEntries([...inbound.entries()].map(([k, v]) => [k, v.size])),
      broken,
      redirects,
      suspicious,
      orphans,
      opportunities,
    },
    null,
    2,
  ),
)

console.log(`Markdown: docs/seo/deadlinks-latest.md + docs/seo/internal-links-latest.md`)
console.log(`JSON: docs/seo/crawl/${datestamp}.json`)
console.log(`Summary: crawled=${sitemapPaths.length} broken=${broken.length} redirects=${redirects.length} orphans=${orphans.length} opportunities=${opportunities.length}`)

process.exit(broken.length > 0 ? 1 : 0)
