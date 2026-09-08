#!/usr/bin/env node
// NeuroWiki SEO, Daily Traffic Snapshot
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); config moved
// to config.mjs, conversion events renamed to "clinician actions".
//
// 5-second summary of yesterday's GA4 traffic:
//   - How many clinicians visited
//   - Where they came from
//   - What pages they hit
//   - Which clinician actions fired (calculator use, pathway steps, copies)
//
// Usage:
//   node scripts/seo/daily-snapshot.mjs        # default: yesterday
//   node scripts/seo/daily-snapshot.mjs 7      # last 7 days

import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeAuth } from './_auth.mjs';
import { SITE } from './config.mjs';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const propertyId = SITE.ga4PropertyId;

const days = parseInt(process.argv[2] ?? '1', 10);

const auth = await makeAuth(['https://www.googleapis.com/auth/analytics.readonly']);
const client = await auth.getClient();
const accessToken = (await client.getAccessToken()).token;

const fmt = (d) => d.toISOString().slice(0, 10);
const endDate = new Date(Date.now() - 86_400_000); // yesterday
const startDate = new Date(endDate.getTime() - (days - 1) * 86_400_000);

async function runReport(body) {
  const r = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    },
  );
  if (!r.ok) throw new Error(`GA4 query failed: ${r.status} ${await r.text()}`);
  return r.json();
}

// GA4 keeps counting a day for up to 48 hours after it ends, so anything
// pulled the next morning is a floor rather than a final count. Fresh numbers
// are labeled "still settling" and restated once final; the ledger below
// tracks which days have settled.
const SETTLED_AFTER_DAYS = 3; // guarantees at least 48h after the day ended

const daysAgo = (dateStr) =>
  Math.round((Date.parse(fmt(new Date())) - Date.parse(dateStr)) / 86_400_000);
const isSettled = (dateStr) => daysAgo(dateStr) >= SETTLED_AFTER_DAYS;

const CONV_EVENTS = SITE.conversionEvents;
const convFilter = {
  orGroup: {
    expressions: CONV_EVENTS.map((value) => ({
      filter: { fieldName: 'eventName', stringFilter: { value } },
    })),
  },
};

// Headline totals for one finished day, used to restate an earlier report.
async function fetchDayTotals(dateStr) {
  const range = [{ startDate: dateStr, endDate: dateStr }];
  const h = await runReport({
    dateRanges: range,
    metrics: [
      { name: 'totalUsers' }, { name: 'sessions' }, { name: 'screenPageViews' },
      { name: 'engagedSessions' }, { name: 'averageSessionDuration' },
    ],
  });
  const v = (h.rows?.[0]?.metricValues ?? []).map((x) => Number(x.value));
  const e = await runReport({
    dateRanges: range,
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }],
    dimensionFilter: convFilter,
    limit: 20,
  });
  return {
    totalUsers: v[0] ?? 0,
    sessions: v[1] ?? 0,
    pageViews: v[2] ?? 0,
    engagedSessions: v[3] ?? 0,
    avgDuration: v[4] ?? 0,
    conversions: (e.rows ?? []).reduce((sum, r) => sum + Number(r.metricValues[0].value), 0),
  };
}

// Headline metrics
const headline = await runReport({
  dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
  metrics: [
    { name: 'totalUsers' },
    { name: 'sessions' },
    { name: 'screenPageViews' },
    { name: 'engagedSessions' },
    { name: 'averageSessionDuration' },
  ],
});

const m = headline.rows?.[0]?.metricValues ?? [];
const totalUsers = parseInt(m[0]?.value ?? '0', 10);
const sessions = parseInt(m[1]?.value ?? '0', 10);
const pageViews = parseInt(m[2]?.value ?? '0', 10);
const engagedSessions = parseInt(m[3]?.value ?? '0', 10);
const avgDuration = parseFloat(m[4]?.value ?? '0');
const engagementRate = sessions > 0 ? (engagedSessions / sessions) * 100 : 0;

// Source breakdown
const sources = await runReport({
  dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
  dimensions: [{ name: 'sessionDefaultChannelGroup' }, { name: 'sessionSource' }],
  metrics: [{ name: 'sessions' }],
  limit: 20,
});

// Top pages
const pages = await runReport({
  dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
  dimensions: [{ name: 'pagePath' }],
  metrics: [{ name: 'screenPageViews' }, { name: 'averageSessionDuration' }],
  orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
  limit: 10,
});

// Clinician actions
const convEvents = await runReport({
  dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
  dimensions: [{ name: 'eventName' }],
  metrics: [{ name: 'eventCount' }],
  dimensionFilter: convFilter,
  limit: 20,
});

// ─── Output ─────────────────────────────────────────────────────────────

const window = days === 1 ? `Yesterday (${fmt(endDate)})` : `Last ${days} days (${fmt(startDate)} to ${fmt(endDate)})`;
console.log(`\n${SITE.name} Daily Traffic Snapshot`);
console.log(`Window: ${window}\n`);

console.log(`Headline:`);
console.log(`  Users: ${totalUsers} | Sessions: ${sessions} | Page views: ${pageViews}`);
console.log(`  Engagement: ${engagementRate.toFixed(1)}% | Avg session: ${avgDuration.toFixed(0)}s\n`);

console.log(`Top sources:`);
for (const row of (sources.rows ?? []).slice(0, 8)) {
  const [channel, source] = row.dimensionValues.map((v) => v.value);
  const s = row.metricValues[0].value;
  console.log(`  ${channel} / ${source}: ${s} session${s === '1' ? '' : 's'}`);
}
if ((sources.rows ?? []).length === 0) console.log(`  (no sessions in window)`);
console.log('');

console.log(`Top pages:`);
for (const row of (pages.rows ?? []).slice(0, 8)) {
  const [path] = row.dimensionValues.map((v) => v.value);
  const views = row.metricValues[0].value;
  const dur = parseFloat(row.metricValues[1].value).toFixed(0);
  console.log(`  ${path}: ${views} view${views === '1' ? '' : 's'} (avg ${dur}s)`);
}
if ((pages.rows ?? []).length === 0) console.log(`  (no page views)`);
console.log('');

const convCount = (convEvents.rows ?? []).reduce((sum, r) => sum + parseInt(r.metricValues[0].value, 10), 0);
console.log(`Clinician actions (${convCount} total):`);
for (const row of convEvents.rows ?? []) {
  const [evt] = row.dimensionValues.map((v) => v.value);
  const n = row.metricValues[0].value;
  console.log(`  ${evt}: ${n}`);
}
if (convCount === 0) console.log(`  (none fired in window)`);
console.log('');

// ─── Provisional numbers, and restating them once they settle ───────────
const reportedDay = fmt(endDate);
const provisional = days === 1 && !isSettled(reportedDay);
const corrections = [];

if (days === 1) {
  const ledgerPath = join(repoRoot, 'docs', 'seo', 'traffic-ledger.json');
  let ledger = [];
  try { ledger = JSON.parse(await readFile(ledgerPath, 'utf8')); } catch { ledger = []; }
  if (!Array.isArray(ledger)) ledger = [];

  // Any earlier day that has now finished counting gets re-pulled and corrected.
  for (const entry of ledger) {
    if (entry.settled || entry.date === reportedDay || !isSettled(entry.date)) continue;
    const before = { ...entry.numbers };
    const after = await fetchDayTotals(entry.date);
    entry.numbers = after;
    entry.settled = true;
    entry.settledOn = fmt(new Date());
    const moved = Object.keys(after).some(
      (k) => Math.round(after[k]) !== Math.round(before[k] ?? 0),
    );
    if (moved) {
      entry.restatedFrom = before;
      corrections.push({ date: entry.date, before, after });
    }
  }

  const todayNumbers = {
    totalUsers, sessions, pageViews, engagedSessions, avgDuration,
    conversions: convCount,
  };
  const existing = ledger.find((e) => e.date === reportedDay);
  if (existing) {
    if (!existing.settled) {
      existing.numbers = todayNumbers;
      existing.pulledAt = new Date().toISOString();
      existing.settled = !provisional;
    }
  } else {
    ledger.push({
      date: reportedDay,
      pulledAt: new Date().toISOString(),
      settled: !provisional,
      numbers: todayNumbers,
    });
  }

  ledger.sort((a, b) => a.date.localeCompare(b.date));
  if (ledger.length > 60) ledger = ledger.slice(-60);
  await writeFile(ledgerPath, JSON.stringify(ledger, null, 2) + '\n');

  if (provisional) {
    console.log('Numbers are still settling; tomorrow restates this day.');
  }
  for (const c of corrections) {
    console.log(`Restated ${c.date}: sessions ${c.before.sessions} -> ${c.after.sessions}, actions ${c.before.conversions} -> ${c.after.conversions}`);
  }
  console.log('');
}

// Markdown report
const datestamp = fmt(new Date());
const md = [`# Daily Traffic Snapshot, ${datestamp}`, ``];
md.push(`**Window:** ${window}`);
md.push(`**Property:** \`${propertyId}\``);
if (days === 1) {
  md.push(``);
  if (provisional) {
    md.push(
      `**These numbers are still settling.** Google keeps counting a day for up ` +
      `to two days after it ends, so treat the figures below as a floor. Visits, ` +
      `page views and clinician actions will rise. An engagement rate of 0.0% here ` +
      `almost always means Google has not finished working it out yet, not that ` +
      `nobody engaged. A later run restates this day once the count is final.`,
    );
  } else {
    md.push(`**These numbers are final.** Google has finished counting this day.`);
  }
}
md.push(``, `## Headline`, ``);
md.push(`| Metric | Value |`);
md.push(`|---|---|`);
md.push(`| Total users | ${totalUsers} |`);
md.push(`| Sessions | ${sessions} |`);
md.push(`| Page views | ${pageViews} |`);
md.push(`| Engagement rate | ${engagementRate.toFixed(1)}% |`);
md.push(`| Avg session duration | ${avgDuration.toFixed(0)}s |`);
if (corrections.length) {
  const rate = (n) => (n.sessions ? `${((n.engagedSessions / n.sessions) * 100).toFixed(1)}%` : 'n/a');
  md.push(``, `## Corrections to earlier reports`, ``);
  md.push(
    `These days have now finished counting. The first figure is what we reported ` +
    `at the time, the second is final.`,
  );
  md.push(``, `| Day | Visits | Page views | Engagement | Clinician actions |`);
  md.push(`|---|---|---|---|---|`);
  for (const c of corrections) {
    md.push(
      `| ${c.date} | ${c.before.sessions} to ${c.after.sessions} ` +
      `| ${c.before.pageViews} to ${c.after.pageViews} ` +
      `| ${rate(c.before)} to ${rate(c.after)} ` +
      `| ${c.before.conversions} to ${c.after.conversions} |`,
    );
  }
}

md.push(``, `## Top sources`, ``);
if ((sources.rows ?? []).length === 0) {
  md.push(`_No sessions in window._`);
} else {
  md.push(`| Channel | Source | Sessions |`);
  md.push(`|---|---|---|`);
  for (const row of sources.rows) {
    const [channel, source] = row.dimensionValues.map((v) => v.value);
    md.push(`| ${channel} | ${source} | ${row.metricValues[0].value} |`);
  }
}
md.push(``, `## Top pages`, ``);
if ((pages.rows ?? []).length === 0) {
  md.push(`_No page views._`);
} else {
  md.push(`| Page | Views | Avg duration |`);
  md.push(`|---|---|---|`);
  for (const row of pages.rows) {
    const [path] = row.dimensionValues.map((v) => v.value);
    md.push(`| \`${path}\` | ${row.metricValues[0].value} | ${parseFloat(row.metricValues[1].value).toFixed(0)}s |`);
  }
}
md.push(``, `## Clinician actions`, ``);
if (convCount === 0) {
  md.push(`_No clinician-action events fired in window._`);
} else {
  md.push(`| Event | Count |`);
  md.push(`|---|---|`);
  for (const row of convEvents.rows) {
    md.push(`| \`${row.dimensionValues[0].value}\` | ${row.metricValues[0].value} |`);
  }
}

const docsDir = join(repoRoot, 'docs', 'seo', 'daily-snapshot');
await mkdir(docsDir, { recursive: true });
// A multi-day run must not overwrite the 1-day "latest" file: the dashboard
// labels that file's numbers "yesterday" (lesson inherited from the Tidbit
// pipeline, caught 2026-08-21 there).
const latestName = days === 1 ? 'daily-snapshot-latest.md' : `daily-snapshot-${days}day-latest.md`;
const datedName = days === 1 ? `${datestamp}.md` : `${datestamp}-${days}day.md`;
await writeFile(join(repoRoot, 'docs', 'seo', latestName), md.join('\n'));
await writeFile(join(docsDir, datedName), md.join('\n'));

console.log(`Markdown report: docs/seo/${latestName}`);
console.log(`Summary: users=${totalUsers} sessions=${sessions} pageviews=${pageViews} actions=${convCount}`);
