#!/usr/bin/env node
// NeuroWiki SEO, Page Refresh Planner
// Rework of the Tidbit blog-refresh planner (SEO-DAILY-PORT, 2026-09-07).
// The blog-specific data loader is replaced by the page inventory that
// scripts/seo/lib/site-pages.ts emits, so the planner covers every page:
// calculators, pathways, guides, trials, question pages, hubs.
//
// It joins 28 days of Search Console query data against the live inventory
// and ranks every page by what work it needs, evidence attached. On
// NeuroWiki the output is PROPOSAL material only: the morning job drafts
// up to 3 snippet rewordings from the top of this queue and V applies them
// in a supervised session (.claude/rules/seo-daily-governance.md).
//
// Classifications, in priority order:
//   REWRITE_SNIPPET   Google shows the page but nobody clicks. Title and
//                     description are the problem, not the content.
//   STRIKING_DISTANCE Ranking just off page one. Depth is the gap.
//   STALE             Old sitemap lastmod on a page still earning impressions.
//   INVISIBLE         Published but earning nothing. Linking or intent problem.
//   HEALTHY           Leave it alone.
//
// Usage:
//   node scripts/seo/page-refresh.mjs            # 28-day window
//   node scripts/seo/page-refresh.mjs 90         # 90-day window

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'
import { makeAuth } from './_auth.mjs'
import { SITE, normalizePath } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')

const days = parseInt(process.argv[2] ?? '28', 10)
if (Number.isNaN(days) || days < 7 || days > 180) {
  console.error('Usage: node page-refresh.mjs [days 7-180]')
  process.exit(1)
}

const siteUrl = SITE.gscSiteUrl

// ─── Thresholds ─────────────────────────────────────────────────────────
// NeuroWiki is still a low-volume site; these numbers are deliberately
// small (inherited from the Tidbit pipeline at the same stage). Raising
// them would silence every real signal. Revisit once any single page
// clears 100 impressions in a month.
const T = {
  minImpressionsToJudge: 3, // below this, the sample says nothing
  snippetMaxPosition: 20, // being seen on pages 1-2
  snippetMaxCtr: 2.0, // percent
  strikingMin: 4, // position band where more depth moves the needle
  strikingMax: 25,
  staleDays: 180, // clinical reference pages age slower than blog posts
}

// ─── Load the page inventory ────────────────────────────────────────────
// Produced by `npx tsx scripts/seo/lib/site-pages.ts` (daily-run step
// "page-inventory"), which consumes the exact metadata the site serves.
async function loadPages() {
  const p = join(repoRoot, SITE.reportRoot, 'pages-snapshot-latest.json')
  let raw
  try {
    raw = await readFile(p, 'utf8')
  } catch {
    console.error(`Missing ${p}. Run: npx tsx scripts/seo/lib/site-pages.ts first.`)
    process.exit(1)
  }
  return JSON.parse(raw)
}

const snapshot = await loadPages()

// ─── Pull Search Console ────────────────────────────────────────────────
const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters.readonly'])
const sc = google.searchconsole({ version: 'v1', auth })

const fmt = (d) => d.toISOString().slice(0, 10)
const end = new Date(Date.now() - 2 * 86_400_000) // GSC lags ~2 days
const start = new Date(end.getTime() - (days - 1) * 86_400_000)

const { data } = await sc.searchanalytics.query({
  siteUrl,
  requestBody: {
    startDate: fmt(start),
    endDate: fmt(end),
    dimensions: ['query', 'page'],
    rowLimit: 5000,
  },
})

const rows = data.rows ?? []

// ─── Join on path ───────────────────────────────────────────────────────
const byPath = new Map()
for (const p of snapshot.pages) {
  byPath.set(p.path, {
    path: p.path,
    kind: p.kind,
    title: p.title,
    description: p.description,
    lastmod: p.lastmod,
    inSitemap: p.inSitemap,
    impressions: 0,
    clicks: 0,
    positionWeighted: 0,
    queries: [],
  })
}

const offInventory = new Map() // queries landing on paths we do not recognize

for (const r of rows) {
  const [query, page] = r.keys
  const path = normalizePath(page)
  const rec = byPath.get(path)
  if (!rec) {
    const cur = offInventory.get(path) ?? { path, impressions: 0, clicks: 0, queries: [] }
    cur.impressions += r.impressions
    cur.clicks += r.clicks
    cur.queries.push({ query, impressions: r.impressions, clicks: r.clicks, position: r.position })
    offInventory.set(path, cur)
    continue
  }
  rec.impressions += r.impressions
  rec.clicks += r.clicks
  rec.positionWeighted += r.position * r.impressions
  rec.queries.push({ query, impressions: r.impressions, clicks: r.clicks, position: r.position })
}

const today = new Date()
const ageDays = (iso) => (iso ? Math.round((today - new Date(iso)) / 86_400_000) : null)

const pages = [...byPath.values()].map((p) => {
  const avgPosition = p.impressions > 0 ? p.positionWeighted / p.impressions : null
  const ctr = p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0
  const staleness = ageDays(p.lastmod)
  p.queries.sort((a, b) => b.impressions - a.impressions)

  let action = 'HEALTHY'
  let reason = ''
  let score = 0

  if (p.kind === 'legal') {
    // Privacy/terms pages are not SEO targets; never queue them for work.
    reason = 'Legal page, not an SEO target.'
  } else if (p.impressions < T.minImpressionsToJudge) {
    action = 'INVISIBLE'
    reason =
      p.impressions === 0
        ? 'Google is not showing this page for anything. Either it is not indexed, or nothing on the site points to it.'
        : `Only ${p.impressions} impressions in ${days} days. Too little to rank on, too little to judge.`
    score = 20 + Math.min((staleness ?? 0) / 10, 15)
  } else if (avgPosition <= T.snippetMaxPosition && ctr < T.snippetMaxCtr) {
    action = 'REWRITE_SNIPPET'
    reason = `Shown ${p.impressions} times at average position ${avgPosition.toFixed(1)}, clicked ${p.clicks}. People see the headline and scroll past it. This is a title and description problem, not a content problem.`
    score = 100 + p.impressions * 2 - avgPosition
  } else if (avgPosition >= T.strikingMin && avgPosition <= T.strikingMax) {
    action = 'STRIKING_DISTANCE'
    reason = `Average position ${avgPosition.toFixed(1)} across ${p.impressions} impressions. Close enough that added depth on the queries below can push it onto page one.`
    score = 80 + p.impressions - avgPosition
  } else if (staleness !== null && staleness > T.staleDays) {
    action = 'STALE'
    reason = `Sitemap lastmod is ${staleness} days old and the page still earns ${p.impressions} impressions. A content review protects rankings already won.`
    score = 50 + staleness / 5
  } else {
    reason = `Position ${avgPosition ? avgPosition.toFixed(1) : 'n/a'}, CTR ${ctr.toFixed(1)}%. Nothing to fix today.`
    score = 0
  }

  return { ...p, avgPosition, ctr, staleness, action, reason, score }
})

pages.sort((a, b) => b.score - a.score)

const actionable = pages.filter((p) => p.action !== 'HEALTHY')

// ─── Console output ─────────────────────────────────────────────────────
const bar = (s) => `\n── ${s} ──`
console.log(`\n${SITE.name} Page Refresh Planner`)
console.log(`Window: ${fmt(start)} to ${fmt(end)} (${days} days)`)
console.log(`Pages: ${pages.length} | Needing work: ${actionable.length}\n`)

const groups = ['REWRITE_SNIPPET', 'STRIKING_DISTANCE', 'STALE', 'INVISIBLE']
const labels = {
  REWRITE_SNIPPET: 'Propose a title and description rewrite',
  STRIKING_DISTANCE: 'Add depth, ranking is close',
  STALE: 'Review, content is aging',
  INVISIBLE: 'Not earning impressions',
}

for (const g of groups) {
  const items = pages.filter((p) => p.action === g)
  if (!items.length) continue
  console.log(bar(`${labels[g]} (${items.length})`))
  for (const p of items.slice(0, 6)) {
    console.log(`  ${p.path} [${p.kind}]`)
    console.log(`    ${p.reason}`)
    if (p.queries.length) {
      const top = p.queries.slice(0, 3)
      console.log(
        `    Top queries: ${top.map((q) => `"${q.query}" (${q.impressions} imp, pos ${q.position.toFixed(0)})`).join('; ')}`,
      )
    }
  }
}

// ─── Markdown report ────────────────────────────────────────────────────
const datestamp = fmt(new Date())
const md = [`# Page Refresh Plan, ${datestamp}`, '']
md.push(`**Window:** ${fmt(start)} to ${fmt(end)} (${days} days)  `)
md.push(`**Pages analysed:** ${pages.length}  `)
md.push(`**Needing work:** ${actionable.length}`)
md.push('', 'Ranked by expected value. The top item is the best proposal available today. Nothing here is applied unattended: the morning job drafts wording, V approves and applies.', '')

md.push('## Priority queue', '')
md.push('| # | Page | Kind | What it needs | Impressions | Avg position | CTR | Lastmod age |')
md.push('|---|---|---|---|---|---|---|---|')
actionable.slice(0, 15).forEach((p, i) => {
  md.push(
    `| ${i + 1} | \`${p.path}\` | ${p.kind} | ${labels[p.action]} | ${p.impressions} | ${p.avgPosition ? p.avgPosition.toFixed(1) : 'n/a'} | ${p.ctr.toFixed(1)}% | ${p.staleness ?? '?'}d |`,
  )
})

md.push('', '## Detail', '')
for (const p of actionable.slice(0, 15)) {
  md.push(`### ${p.path}`, '')
  md.push(`**Current title:** ${p.title ?? '(none recorded)'}  `)
  md.push(`**Current description:** ${p.description ?? '(none recorded)'}  `)
  md.push(`**Kind:** ${p.kind} | **In sitemap:** ${p.inSitemap ? 'yes' : 'no'}  `)
  md.push(`**Verdict:** ${labels[p.action]}`, '')
  md.push(p.reason, '')
  if (p.queries.length) {
    md.push('| Query | Impressions | Clicks | Position |')
    md.push('|---|---|---|---|')
    for (const q of p.queries.slice(0, 8)) {
      md.push(`| ${q.query.replace(/\|/g, '\\|').slice(0, 110)} | ${q.impressions} | ${q.clicks} | ${q.position.toFixed(1)} |`)
    }
    md.push('')
  } else {
    md.push('_No queries recorded in this window._', '')
  }
}

// ─── Cannibalization: two of our pages competing for one query ─────────
const byQuery = new Map()
for (const r of rows) {
  const [query, page] = r.keys
  const path = normalizePath(page)
  const cur = byQuery.get(query) ?? new Map()
  const p = cur.get(path) ?? { impressions: 0, clicks: 0, positionW: 0 }
  p.impressions += r.impressions
  p.clicks += r.clicks
  p.positionW += r.position * r.impressions
  cur.set(path, p)
  byQuery.set(query, cur)
}
const cannibalized = []
for (const [query, pagesForQuery] of byQuery) {
  // Two or more URLs, each with real impressions, is competition. One URL
  // with 1 stray impression next to a strong one is noise, not a problem.
  const serious = [...pagesForQuery.entries()].filter(([, p]) => p.impressions >= 2)
  if (serious.length >= 2) {
    cannibalized.push({
      query,
      pages: serious
        .map(([path, p]) => ({
          path,
          impressions: p.impressions,
          avgPosition: p.positionW / p.impressions,
        }))
        .sort((a, b) => b.impressions - a.impressions),
    })
  }
}
cannibalized.sort(
  (a, b) =>
    b.pages.reduce((s, p) => s + p.impressions, 0) - a.pages.reduce((s, p) => s + p.impressions, 0),
)

// Queries landing on unrecognized paths (redirect leftovers, legacy URLs).
const offSorted = [...offInventory.values()].sort((a, b) => b.impressions - a.impressions)
md.push('## Search demand landing on unrecognized paths', '')
md.push('Google matched these queries to paths that are not in the page inventory (legacy URLs, redirect sources, or pages missing from the sitemap and route list).', '')
if (offSorted.length === 0) {
  md.push('_None in this window._', '')
} else {
  md.push('| Path | Impressions | Clicks | Top query |')
  md.push('|---|---|---|---|')
  for (const o of offSorted.slice(0, 12)) {
    const top = o.queries.sort((a, b) => b.impressions - a.impressions)[0]
    md.push(
      `| \`${o.path}\` | ${o.impressions} | ${o.clicks} | ${top ? top.query.replace(/\|/g, '\\|').slice(0, 90) : 'n/a'} |`,
    )
  }
  md.push('')
}

md.push('## Cannibalization: our own pages competing for one query', '')
if (cannibalized.length === 0) {
  md.push('_None detected in this window._', '')
} else {
  md.push('Google usually demotes both pages when this happens. The fix is to make one page clearly THE answer and have the other link to it. Consolidations are supervised work, never unattended.', '')
  for (const c of cannibalized.slice(0, 8)) {
    md.push(`- **"${c.query.slice(0, 100)}"**`)
    for (const p of c.pages) {
      md.push(`  - \`${p.path}\` (${p.impressions} imp, pos ${p.avgPosition.toFixed(1)})`)
    }
  }
  md.push('')
}

md.push('## Inventory drift', '')
if ((snapshot.sitemapOnly ?? []).length === 0 && (snapshot.manifestOnly ?? []).length === 0) {
  md.push('_Sitemap and the app route list agree._', '')
} else {
  if ((snapshot.manifestOnly ?? []).length) {
    md.push(`**Live in the app but missing from the sitemap** (Google may never find these): ${snapshot.manifestOnly.map((p) => `\`${p}\``).join(', ')}`, '')
  }
  if ((snapshot.sitemapOnly ?? []).length) {
    md.push(`**In the sitemap but not the app's exported route list** (${snapshot.sitemapOnly.length} paths, usually question pages and placeholder trials; verify they render): ${snapshot.sitemapOnly.slice(0, 10).map((p) => `\`${p}\``).join(', ')}${snapshot.sitemapOnly.length > 10 ? ` and ${snapshot.sitemapOnly.length - 10} more` : ''}`, '')
  }
}

const healthy = pages.filter((p) => p.action === 'HEALTHY')
md.push('## Healthy or not judged, no action', '')
md.push(`${healthy.length} pages. Full list in the JSON.`)
md.push('')

const docsDir = join(repoRoot, 'docs', 'seo', 'page-refresh')
await mkdir(docsDir, { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'page-refresh-latest.md'), md.join('\n'))
await writeFile(join(docsDir, `${datestamp}.md`), md.join('\n'))

// JSON for the agent to consume without re-parsing markdown
await writeFile(
  join(docsDir, `${datestamp}.json`),
  JSON.stringify(
    {
      generatedAt: new Date().toISOString(),
      window: { startDate: fmt(start), endDate: fmt(end), days },
      pages: pages.map(({ positionWeighted, ...rest }) => rest),
      cannibalized,
      offInventory: offSorted,
      inventoryDrift: { sitemapOnly: snapshot.sitemapOnly ?? [], manifestOnly: snapshot.manifestOnly ?? [] },
    },
    null,
    2,
  ),
)

console.log(`\nMarkdown report: docs/seo/page-refresh-latest.md + docs/seo/page-refresh/${datestamp}.md`)
console.log(`JSON: docs/seo/page-refresh/${datestamp}.json`)
console.log(
  `Summary: pages=${pages.length} actionable=${actionable.length} rewrite=${pages.filter((p) => p.action === 'REWRITE_SNIPPET').length} striking=${pages.filter((p) => p.action === 'STRIKING_DISTANCE').length} stale=${pages.filter((p) => p.action === 'STALE').length} invisible=${pages.filter((p) => p.action === 'INVISIBLE').length}`,
)
