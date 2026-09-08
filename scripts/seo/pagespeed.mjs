#!/usr/bin/env node
// NeuroWiki SEO, PageSpeed Watch (weekly)
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); pages and key
// from config.mjs.
//
// A slow page bleeds rankings, and clinicians at the bedside abandon slow
// tools. This asks Google's free PageSpeed Insights API for the mobile score
// of the pages that matter and flags any that dropped hard since last week.
//
// Usage: node scripts/seo/pagespeed.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = SITE.baseUrl

// Keep this list short: every page added is ~25 more seconds per week.
const PAGES = SITE.pagespeedUrls

const HISTORY = join(repoRoot, 'docs', 'seo', 'pagespeed', 'history.json')

let history = {}
try {
  history = JSON.parse(await readFile(HISTORY, 'utf8'))
} catch {
  // first run
}

// Keyless access to the PageSpeed API is heavily rate limited (the whole
// world shares one anonymous pool, and it 429s freely). A free API key from
// the same Google Cloud project the SEO pipeline already uses makes this
// reliable: set PSI_API_KEY in .env.local. Without one, we space requests,
// retry once, and treat a rate-limited week as "skipped", never as a failure.
const KEY = SITE.psiApiKey ? `&key=${SITE.psiApiKey}` : ''
const sleep = (ms) => new Promise((res) => setTimeout(res, ms))

async function psi(url) {
  const endpoint = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=mobile&category=performance${KEY}`
  let r = await fetch(endpoint)
  if (r.status === 429) {
    await sleep(30_000)
    r = await fetch(endpoint)
  }
  return r
}

const results = []
for (const path of PAGES) {
  const url = `${BASE}${path === '/' ? '/' : path}`
  process.stdout.write(`  ${path.padEnd(50)}`)
  try {
    if (results.length > 0) await sleep(10_000) // space requests on the shared pool
    const r = await psi(url)
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
    const j = await r.json()
    const lh = j.lighthouseResult
    const score = Math.round((lh?.categories?.performance?.score ?? 0) * 100)
    const lcp = lh?.audits?.['largest-contentful-paint']?.numericValue
    const cls = lh?.audits?.['cumulative-layout-shift']?.numericValue
    const prev = history[path]?.score ?? null
    const delta = prev === null ? null : score - prev
    results.push({ path, score, prev, delta, lcpMs: lcp ? Math.round(lcp) : null, cls: cls != null ? +cls.toFixed(3) : null })
    console.log(`score ${score}${prev !== null ? ` (was ${prev})` : ''}`)
  } catch (e) {
    results.push({ path, error: e.message })
    console.log(`FAILED: ${e.message}`)
  }
}

const regressions = results.filter((r) => r.delta !== null && r.delta <= -10)
const slow = results.filter((r) => !r.error && r.score < 60)

const fmt = (d) => d.toISOString().slice(0, 10)
const datestamp = fmt(new Date())
const md = [`# PageSpeed Watch, ${datestamp}`, '', '**Strategy:** mobile, Google PageSpeed Insights', '']
if (regressions.length) {
  md.push(`**${regressions.length} page(s) got meaningfully slower since last week. This costs rankings and bedside usability.**`, '')
}
md.push('| Page | Score | Last week | Change | LCP | CLS |')
md.push('|---|---|---|---|---|---|')
for (const r of results) {
  if (r.error) {
    md.push(`| \`${r.path}\` | check failed | | | | |`)
    continue
  }
  md.push(
    `| \`${r.path}\` | ${r.score} | ${r.prev ?? 'first run'} | ${r.delta === null ? '' : (r.delta >= 0 ? '+' : '') + r.delta} | ${r.lcpMs ? (r.lcpMs / 1000).toFixed(1) + 's' : ''} | ${r.cls ?? ''} |`,
  )
}
md.push('')
if (slow.length) {
  md.push(`Pages under 60 need attention: ${slow.map((s) => '`' + s.path + '`').join(', ')}. Propose fixes in the briefing; never edit unattended.`, '')
}

await mkdir(join(repoRoot, 'docs', 'seo', 'pagespeed'), { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'pagespeed-latest.md'), md.join('\n'))
await writeFile(join(repoRoot, 'docs', 'seo', 'pagespeed', `${datestamp}.md`), md.join('\n'))

// Persist scores for next week's comparison
for (const r of results) {
  if (!r.error) history[r.path] = { score: r.score, date: datestamp }
}
await writeFile(HISTORY, JSON.stringify(history, null, 2))

const allRateLimited = results.every((r) => r.error?.includes('429'))
console.log(`\nMarkdown: docs/seo/pagespeed-latest.md`)
if (allRateLimited) {
  console.log('All requests rate limited. Skipped this week; a free PSI_API_KEY in .env.local fixes this permanently.')
  console.log(`Summary: pages=${results.length} skipped=rate-limited`)
  process.exit(0)
}
console.log(`Summary: pages=${results.length} regressions=${regressions.length} under60=${slow.length}`)
process.exit(regressions.length > 0 ? 1 : 0)
