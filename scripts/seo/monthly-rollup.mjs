#!/usr/bin/env node
// NeuroWiki SEO, Monthly Rollup
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); config from
// config.mjs, conversions replaced by the clinician-action event set.
//
// Thirty daily briefings tell you what happened each day. None of them tell
// you whether the month worked. This compares the last 28 days against the
// 28 before them and writes the one-page story.
//
// Usage: node scripts/seo/monthly-rollup.mjs

import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { google } from 'googleapis'
import { makeAuth } from './_auth.mjs'
import { SITE } from './config.mjs'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const siteUrl = SITE.gscSiteUrl
const propertyId = SITE.ga4PropertyId

const auth = await makeAuth([
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/analytics.readonly',
])
const client = await auth.getClient()
const token = (await client.getAccessToken()).token
const sc = google.searchconsole({ version: 'v1', auth })

const fmt = (d) => d.toISOString().slice(0, 10)
const day = 86_400_000
// GSC lags ~2 days; use the same windows for GA4 so the two agree.
const curEnd = new Date(Date.now() - 2 * day)
const curStart = new Date(curEnd.getTime() - 27 * day)
const prevEnd = new Date(curStart.getTime() - 1 * day)
const prevStart = new Date(prevEnd.getTime() - 27 * day)

async function ga4(startDate, endDate, extra = {}) {
  const r = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }], ...extra }),
    },
  )
  if (!r.ok) throw new Error(`GA4 ${r.status}: ${await r.text()}`)
  return r.json()
}

async function gaTotals(s, e) {
  const j = await ga4(s, e, {
    metrics: [
      { name: 'totalUsers' },
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'averageSessionDuration' },
    ],
  })
  const m = (j.rows?.[0]?.metricValues ?? []).map((v) => parseFloat(v.value))
  return { users: m[0] ?? 0, sessions: m[1] ?? 0, engaged: m[2] ?? 0, avgDur: m[3] ?? 0 }
}

async function gaChannels(s, e) {
  const j = await ga4(s, e, {
    dimensions: [{ name: 'sessionDefaultChannelGroup' }],
    metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }],
  })
  const out = {}
  for (const r of j.rows ?? []) {
    out[r.dimensionValues[0].value] = {
      sessions: parseInt(r.metricValues[0].value, 10),
      engaged: parseInt(r.metricValues[1].value, 10),
    }
  }
  return out
}

async function gaActions(s, e) {
  const j = await ga4(s, e, {
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: {
      orGroup: {
        expressions: SITE.conversionEvents.map(
          (v) => ({ filter: { fieldName: 'eventName', stringFilter: { value: v } } }),
        ),
      },
    },
  })
  const out = {}
  for (const r of j.rows ?? []) out[r.dimensionValues[0].value] = parseInt(r.metricValues[0].value, 10)
  return out
}

async function gscTotals(s, e) {
  const { data } = await sc.searchanalytics.query({
    siteUrl,
    requestBody: { startDate: fmt(s), endDate: fmt(e), dimensions: [], rowLimit: 1 },
  })
  const r = data.rows?.[0]
  return { clicks: r?.clicks ?? 0, impressions: r?.impressions ?? 0, position: r?.position ?? 0 }
}

const [gaCur, gaPrev, chCur, chPrev, actCur, actPrev, gscCur, gscPrev] = await Promise.all([
  gaTotals(curStart, curEnd),
  gaTotals(prevStart, prevEnd),
  gaChannels(curStart, curEnd),
  gaChannels(prevStart, prevEnd),
  gaActions(curStart, curEnd),
  gaActions(prevStart, prevEnd),
  gscTotals(curStart, curEnd),
  gscTotals(prevStart, prevEnd),
])

// Indexed count from the latest indexation report, if present
let indexedLine = 'not measured this month'
try {
  const idx = await readFile(join(repoRoot, 'docs', 'seo', 'indexation-latest.md'), 'utf8')
  const m = idx.match(/\| Indexed \| (\d+) \|/)
  const total = (idx.match(/Sitemap URLs inspected:\*\* (\d+)/) ?? [])[1]
  if (m) indexedLine = `${m[1]} of ${total ?? '?'} sitemap URLs`
} catch {}

// Proposal-experiment ledger verdicts
let ledgerLine = 'no experiments yet'
try {
  const ledger = JSON.parse(await readFile(join(repoRoot, 'docs', 'seo', 'rewrite-ledger.json'), 'utf8'))
  const counts = {}
  for (const e of ledger) counts[e.verdict] = (counts[e.verdict] ?? 0) + 1
  ledgerLine = Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(', ')
} catch {}

const pct = (cur, prev) => {
  if (prev === 0) return cur === 0 ? 'flat' : 'new'
  const d = ((cur - prev) / prev) * 100
  return `${d >= 0 ? '+' : ''}${d.toFixed(0)}%`
}
const engRate = (t) => (t.sessions > 0 ? ((t.engaged / t.sessions) * 100).toFixed(0) + '%' : '0%')

const month = fmt(new Date()).slice(0, 7)
const md = [`# Monthly SEO Rollup, ${month}`, '']
md.push(`**Windows:** ${fmt(curStart)} to ${fmt(curEnd)} vs ${fmt(prevStart)} to ${fmt(prevEnd)}`, '')

md.push('## The month in five numbers', '')
md.push('| Metric | This period | Prior period | Change |')
md.push('|---|---|---|---|')
md.push(`| Users | ${gaCur.users} | ${gaPrev.users} | ${pct(gaCur.users, gaPrev.users)} |`)
md.push(`| Engagement rate | ${engRate(gaCur)} | ${engRate(gaPrev)} | |`)
md.push(`| Search clicks (Google) | ${gscCur.clicks} | ${gscPrev.clicks} | ${pct(gscCur.clicks, gscPrev.clicks)} |`)
md.push(`| Search impressions | ${gscCur.impressions} | ${gscPrev.impressions} | ${pct(gscCur.impressions, gscPrev.impressions)} |`)
md.push(`| Avg position | ${gscCur.position.toFixed(1)} | ${gscPrev.position.toFixed(1)} | ${(gscPrev.position - gscCur.position).toFixed(1)} spots |`)
md.push('')

md.push('## Clinician actions', '')
md.push('| Event | This period | Prior |')
md.push('|---|---|---|')
for (const k of SITE.conversionEvents) {
  md.push(`| ${k} | ${actCur[k] ?? 0} | ${actPrev[k] ?? 0} |`)
}
md.push('')

md.push('## Channels', '')
md.push('| Channel | Sessions | Prior | Engaged now |')
md.push('|---|---|---|---|')
const allCh = [...new Set([...Object.keys(chCur), ...Object.keys(chPrev)])]
allCh.sort((a, b) => (chCur[b]?.sessions ?? 0) - (chCur[a]?.sessions ?? 0))
for (const c of allCh) {
  const cur = chCur[c] ?? { sessions: 0, engaged: 0 }
  const prev = chPrev[c] ?? { sessions: 0 }
  const er = cur.sessions ? ((cur.engaged / cur.sessions) * 100).toFixed(0) + '%' : ''
  md.push(`| ${c} | ${cur.sessions} | ${prev.sessions} | ${er} |`)
}
md.push('')

md.push('## Program health', '')
md.push(`- Indexed pages: ${indexedLine}`)
md.push(`- Snippet experiments: ${ledgerLine}`)
md.push('')

await mkdir(join(repoRoot, 'docs', 'seo', 'monthly'), { recursive: true })
await writeFile(join(repoRoot, 'docs', 'seo', 'monthly', `${month}.md`), md.join('\n'))
await writeFile(join(repoRoot, 'docs', 'seo', 'monthly-latest.md'), md.join('\n'))

console.log(`\nMonthly rollup written: docs/seo/monthly/${month}.md`)
console.log(
  `Summary: users=${gaCur.users}(${pct(gaCur.users, gaPrev.users)}) clicks=${gscCur.clicks}(${pct(gscCur.clicks, gscPrev.clicks)}) impressions=${gscCur.impressions}(${pct(gscCur.impressions, gscPrev.impressions)})`,
)
