#!/usr/bin/env node
// NeuroWiki SEO, Anomaly Alarm
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); config from config.mjs.
//
// The daily run reports; this alarms. It answers one question: did something
// break badly enough that V should hear about it TODAY, not in a trend line?
//
// Checks, all against hard thresholds:
//   1. Site up: homepage answers 200 on the live domain
//   2. robots.txt: reachable and not accidentally blocking the whole site
//   3. sitemap.xml: reachable, parses, still lists a sane URL count
//   4. GSC sitemap status: Google reports errors on the submitted sitemap
//   5. Traffic collapse: yesterday's GA4 sessions under 40% of the prior
//      7-day average (only when the average is big enough to mean anything)
//   6. Search collapse: latest GSC impressions under 40% of prior 7-day avg
//
// Exit 0 = all quiet. Exit 1 = findings, listed loudly. The daily-run wrapper
// treats 1 as "ran, has findings" and the briefing leads with them.
//
// Manual actions (Google penalties) have NO public API; they stay a monthly
// browser check in the procedure. This script covers what an API can see.

import { writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'
import { makeAuth } from './_auth.mjs'
import { SITE } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const BASE = SITE.baseUrl
const alarms = []
const notes = []

// ─── 1-3: plain HTTP health ─────────────────────────────────────────────
async function httpCheck(path, name) {
  try {
    const r = await fetch(`${BASE}${path}`, { redirect: 'follow' })
    if (!r.ok) {
      alarms.push(`${name}: ${BASE}${path} answered HTTP ${r.status}. Visitors and crawlers are hitting an error.`)
      return null
    }
    return await r.text()
  } catch (e) {
    alarms.push(`${name}: ${BASE}${path} did not answer at all (${e.message}). The site may be down.`)
    return null
  }
}

const home = await httpCheck('/', 'Site down check')
if (home && !home.includes(SITE.homepageMarker)) {
  alarms.push(`Homepage answered 200 but does not contain "${SITE.homepageMarker}". Wrong content is being served.`)
}

const robots = await httpCheck('/robots.txt', 'robots.txt check')
if (robots) {
  // The catastrophic misconfiguration is "Disallow: /" applying to Google or
  // to all crawlers. A "Disallow: /" under a SPECIFIC bot's section is
  // policy, not a bug, so walk the file tracking which user-agent each rule
  // belongs to (lesson inherited from the Tidbit pipeline's first run).
  let agents = []
  for (const raw of robots.split('\n')) {
    const line = raw.trim().toLowerCase()
    if (line.startsWith('user-agent:')) {
      const ua = line.slice('user-agent:'.length).trim()
      // Consecutive user-agent lines share the rule block that follows.
      if (agents.length && agents._closed) agents = []
      agents.push(ua)
      agents._closed = false
    } else if (line.startsWith('disallow:') || line.startsWith('allow:')) {
      agents._closed = true
      if (line === 'disallow: /' && agents.some((a) => a === '*' || a.includes('googlebot'))) {
        alarms.push(
          'robots.txt contains "Disallow: /" applying to Google or to all crawlers. This deindexes the entire site if it stays.',
        )
      }
    }
  }
}

const sitemap = await httpCheck('/sitemap.xml', 'sitemap check')
let sitemapCount = 0
if (sitemap) {
  sitemapCount = (sitemap.match(/<loc>/g) ?? []).length
  if (sitemapCount < SITE.sitemapUrlFloor) {
    alarms.push(`sitemap.xml lists only ${sitemapCount} URLs (normally ~182). Pages may have dropped out of the sitemap.`)
  } else {
    notes.push(`Sitemap lists ${sitemapCount} URLs.`)
  }
}

// ─── 4: GSC sitemap status ──────────────────────────────────────────────
const siteUrl = SITE.gscSiteUrl
const auth = await makeAuth([
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
])
const sc = google.searchconsole({ version: 'v1', auth })

try {
  const { data } = await sc.sitemaps.list({ siteUrl })
  for (const sm of data.sitemap ?? []) {
    const errs = parseInt(sm.errors ?? '0', 10)
    const warns = parseInt(sm.warnings ?? '0', 10)
    if (errs > 0) alarms.push(`Google reports ${errs} error(s) on submitted sitemap ${sm.path}.`)
    else if (warns > 0) notes.push(`Google reports ${warns} warning(s) on sitemap ${sm.path}. Not urgent.`)
  }
} catch (e) {
  notes.push(`Could not read GSC sitemap status (${e.message}). Non-fatal.`)
}

// ─── 5: GA4 traffic collapse ────────────────────────────────────────────
const propertyId = SITE.ga4PropertyId
const client = await auth.getClient()
const token = (await client.getAccessToken()).token
const fmt = (d) => d.toISOString().slice(0, 10)

async function ga4Sessions(startDaysAgo, endDaysAgo) {
  const start = new Date(Date.now() - startDaysAgo * 86_400_000)
  const end = new Date(Date.now() - endDaysAgo * 86_400_000)
  const r = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        dateRanges: [{ startDate: fmt(start), endDate: fmt(end) }],
        metrics: [{ name: 'sessions' }],
      }),
    },
  )
  if (!r.ok) throw new Error(`GA4 ${r.status}`)
  const j = await r.json()
  return parseInt(j.rows?.[0]?.metricValues?.[0]?.value ?? '0', 10)
}

try {
  const yesterday = await ga4Sessions(1, 1)
  const prior7 = await ga4Sessions(8, 2)
  const avg = prior7 / 7
  if (avg >= 10 && yesterday < avg * 0.4) {
    alarms.push(
      `Traffic collapse: ${yesterday} sessions yesterday against a 7-day average of ${avg.toFixed(1)}. Something changed: check the site is up and nothing was deindexed.`,
    )
  } else {
    notes.push(`GA4: ${yesterday} sessions yesterday vs 7-day avg ${avg.toFixed(1)}. Normal.`)
  }
} catch (e) {
  notes.push(`GA4 collapse check failed (${e.message}). Non-fatal.`)
}

// ─── 6: GSC impressions collapse ────────────────────────────────────────
try {
  const q = async (sd, ed) => {
    const { data } = await sc.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: fmt(sd), endDate: fmt(ed), dimensions: [], rowLimit: 1 },
    })
    return data.rows?.[0]?.impressions ?? 0
  }
  // GSC lags ~2 days
  const d3 = new Date(Date.now() - 3 * 86_400_000)
  const latest = await q(d3, d3)
  const prior = await q(new Date(Date.now() - 10 * 86_400_000), new Date(Date.now() - 4 * 86_400_000))
  const avg = prior / 7
  if (avg >= 20 && latest < avg * 0.4) {
    alarms.push(
      `Search visibility collapse: ${latest} impressions on ${fmt(d3)} against a 7-day average of ${avg.toFixed(0)}. Check GSC for manual actions or indexing problems.`,
    )
  } else {
    notes.push(`GSC: ${latest} impressions (${fmt(d3)}) vs avg ${avg.toFixed(0)}. Normal.`)
  }
} catch (e) {
  notes.push(`GSC collapse check failed (${e.message}). Non-fatal.`)
}

// ─── Output ─────────────────────────────────────────────────────────────
const datestamp = fmt(new Date())
console.log(`\n${SITE.name} Anomaly Alarm, ${datestamp}`)
if (alarms.length === 0) {
  console.log('All quiet. No alarms.')
} else {
  console.log(`\nALARMS (${alarms.length}):`)
  for (const a of alarms) console.log(`  !! ${a}`)
}
for (const n of notes) console.log(`  ok ${n}`)

const md = [
  `# Anomaly Alarm, ${datestamp}`,
  '',
  alarms.length === 0 ? '**All quiet.**' : `**${alarms.length} ALARM(S). Read these first.**`,
  '',
  ...alarms.map((a) => `- **ALARM:** ${a}`),
  '',
  '## Routine checks',
  ...notes.map((n) => `- ${n}`),
  '',
]
await mkdir(join(repoRoot, 'docs', 'seo', 'anomaly'), { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'anomaly-latest.md'), md.join('\n'))
await writeFile(join(repoRoot, 'docs', 'seo', 'anomaly', `${datestamp}.md`), md.join('\n'))
console.log(`\nSummary: alarms=${alarms.length}`)
process.exit(alarms.length > 0 ? 1 : 0)
