#!/usr/bin/env node
// NeuroWiki SEO, Indexation Bucketing
// Port of the Tidbit indexation-check REPORT layer only (SEO-DAILY-PORT,
// architect condition 5): the API pulling is NOT duplicated here. The
// existing scripts/seo/fetch-gsc-inspections.mjs already loops the URL
// Inspection API over every sitemap URL (~35s for 182 at 175ms/req) and
// writes docs/seo-data/gsc/inspections/<date>.json. This script reads the
// newest of those snapshots and classifies every URL into the buckets the
// rest of the pipeline consumes (crawl-links reads the not-indexed buckets;
// monthly-rollup and the dashboard read the summary table).
//
// Run order in daily-run.sh (Mondays): url-inspections (fetch) → indexation.
//
// Usage: node scripts/seo/indexation-check.mjs
// Exit codes: 0 = everything indexed, 1 = pages have indexing issues
// (findings, not a failure), 2 = no inspections snapshot to read.

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE, normalizePath } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const inspectionsDir = join(repoRoot, SITE.rawDataRoot, 'gsc', 'inspections')

// ─── Load the newest inspections snapshot ───────────────────────────────
let files = []
try {
  files = (await readdir(inspectionsDir)).filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f)).sort()
} catch {}
if (files.length === 0) {
  console.error(`No inspections snapshot in ${inspectionsDir}. Run: node scripts/seo/fetch-gsc-inspections.mjs first.`)
  process.exit(2)
}
const newest = files[files.length - 1]
const snapshot = JSON.parse(await readFile(join(inspectionsDir, newest), 'utf8'))
const snapshotAgeDays = Math.round((Date.now() - Date.parse(newest.replace('.json', ''))) / 86_400_000)

const results = (snapshot.results ?? []).map((r) => ({
  ...r,
  path: normalizePath(r.url),
}))

// ─── Classify + recommend action (Tidbit bucket taxonomy) ───────────────
function classify(r) {
  if (r.status === 'api-error' || r._error) return { bucket: 'API Error', action: `Investigate API error: ${(r.error ?? '').slice(0, 120)}` }
  const s = (r.coverageState ?? '').toLowerCase()
  const canonicalMismatch =
    r.userCanonical && r.googleCanonical && r.userCanonical !== r.googleCanonical

  if (s.includes('submitted and indexed') || s === 'indexed' || s.includes('only indexed') || r.verdict === 'PASS') {
    return {
      bucket: 'Indexed',
      action: canonicalMismatch
        ? `Indexed but Google picked a different canonical (${r.googleCanonical}). Investigate.`
        : 'No action.',
    }
  }
  if (s.includes('discovered')) {
    return {
      bucket: 'Discovered, not indexed',
      action: 'Add internal links from indexed pages. Candidate for a request-indexing morning slot.',
    }
  }
  if (s.includes('crawled')) {
    return {
      bucket: 'Crawled, not indexed',
      action: 'Google crawled but rejected. Likely a content-quality or duplication signal. Strengthen content + internal linking (proposal, not unattended work).',
    }
  }
  if (s.includes('redirect') || r.pageFetchState === 'REDIRECT_ERROR') {
    return {
      bucket: 'Redirect',
      action: 'Confirm the redirect destination is correct and the destination is indexed.',
    }
  }
  if (s.includes('not found') || r.pageFetchState === 'NOT_FOUND') {
    return {
      bucket: '404',
      action: 'Remove from sitemap if intentionally deleted, or fix the route if it should exist.',
    }
  }
  if (s.includes('excluded') && s.includes('noindex')) {
    return {
      bucket: 'noindex',
      action: 'Intentional? Verify it should NOT be in the sitemap.',
    }
  }
  if (canonicalMismatch) {
    return {
      bucket: 'Canonical mismatch',
      action: `Google chose ${r.googleCanonical} instead of ${r.userCanonical}. Consolidate or update the canonical tag.`,
    }
  }
  return { bucket: 'Other', action: `Coverage state: ${r.coverageState ?? 'unknown'}. Manual review.` }
}

for (const r of results) {
  const c = classify(r)
  r.bucket = c.bucket
  r.recommendedAction = c.action
}

// ─── Aggregate + output ─────────────────────────────────────────────────
const byBucket = {}
for (const r of results) {
  byBucket[r.bucket] = byBucket[r.bucket] ?? []
  byBucket[r.bucket].push(r)
}

const summary = Object.entries(byBucket)
  .map(([k, v]) => `${k}=${v.length}`)
  .sort()
  .join(' ')

console.log(`\n${SITE.name} Indexation Check (from inspections snapshot ${newest}, ${snapshotAgeDays}d old)`)
console.log(`Found: ${summary}\n`)

// Rich-result errors are a NeuroWiki bonus: the inspections fetch captures
// them and Tidbit's original never had the data.
const richErrors = results.filter((r) => (r.richResultsDetected ?? []).some((d) => d.invalidCount > 0))
const dupSchemas = results.filter((r) => (r.duplicateRichResultTypes ?? []).length > 0)

const bucketOrder = [
  'Indexed',
  'Discovered, not indexed',
  'Crawled, not indexed',
  'Canonical mismatch',
  'Redirect',
  '404',
  'noindex',
  'API Error',
  'Other',
]

for (const bucket of bucketOrder) {
  const group = byBucket[bucket] ?? []
  if (group.length === 0) continue
  console.log(`── ${bucket} (${group.length}) ──`)
  for (const r of group.slice(0, 10)) {
    console.log(`  ${r.path}`)
    if (r.lastCrawlTime) console.log(`    Last crawl: ${String(r.lastCrawlTime).slice(0, 10)}`)
    if (r.recommendedAction !== 'No action.') console.log(`    Action: ${r.recommendedAction}`)
  }
  if (group.length > 10) console.log(`  ... and ${group.length - 10} more`)
  console.log('')
}

// ─── Markdown report (format-compatible with the Tidbit pipeline: the
// crawl-links planner and monthly-rollup parse these exact patterns) ─────
const datestamp = new Date().toISOString().slice(0, 10)
const md = [
  `# Indexation Check, ${datestamp}`,
  ``,
  `**Site:** \`${snapshot.siteUrl}\``,
  `**Sitemap URLs inspected:** ${results.length}`,
  `**Inspections snapshot:** ${newest} (${snapshotAgeDays} day(s) old)`,
  `**Run at:** ${new Date().toISOString()}`,
  ``,
  `## Summary by status`,
  ``,
  `| Bucket | Count |`,
  `|---|---|`,
]
for (const bucket of bucketOrder) {
  const count = (byBucket[bucket] ?? []).length
  if (count > 0) md.push(`| ${bucket} | ${count} |`)
}
md.push(``, `---`, ``)

for (const bucket of bucketOrder) {
  const group = byBucket[bucket] ?? []
  if (group.length === 0) continue
  md.push(`## ${bucket} (${group.length})`, ``)
  md.push(`| URL | Last crawl | User canonical | Google canonical | Recommended action |`)
  md.push(`|---|---|---|---|---|`)
  for (const r of group) {
    const crawl = r.lastCrawlTime ? String(r.lastCrawlTime).slice(0, 10) : '-'
    const userC = r.userCanonical ? normalizePath(r.userCanonical) : '-'
    const googleC = r.googleCanonical ? normalizePath(r.googleCanonical) : '-'
    md.push(`| \`${r.path}\` | ${crawl} | \`${userC}\` | \`${googleC}\` | ${r.recommendedAction} |`)
  }
  md.push(``)
}

if (richErrors.length || dupSchemas.length) {
  md.push(`## Rich-result problems (from the same inspection pull)`, ``)
  if (richErrors.length) {
    md.push(`**Pages with rich-result ERRORs:** ${richErrors.map((r) => `\`${r.path}\``).join(', ')}`, ``)
  }
  if (dupSchemas.length) {
    md.push(`**Pages with duplicate schema types:** ${dupSchemas.map((r) => `\`${r.path}\` (${r.duplicateRichResultTypes.map((d) => d.type).join('/')})`).join(', ')}`, ``)
  }
}

md.push(`---`, ``, `## Methodology note`, ``)
md.push(`Bucketing over the URL Inspection snapshot written by \`scripts/seo/fetch-gsc-inspections.mjs\` (read-only API). Requesting indexing for priority URLs stays a budgeted browser step in the morning procedure (2 per day, 14-day cooldown).`)

const docsDir = join(repoRoot, 'docs', 'seo', 'indexation')
await mkdir(docsDir, { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'indexation-latest.md'), md.join('\n'))
await writeFile(join(docsDir, `${datestamp}.md`), md.join('\n'))

console.log(`Markdown report: docs/seo/indexation-latest.md + docs/seo/indexation/${datestamp}.md`)

const problemBuckets = ['Discovered, not indexed', 'Crawled, not indexed', 'Canonical mismatch', '404', 'API Error']
const hasProblems = problemBuckets.some((b) => (byBucket[b] ?? []).length > 0)
process.exit(hasProblems ? 1 : 0)
