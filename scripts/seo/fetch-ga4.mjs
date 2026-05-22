/**
 * Pull GA4 metrics via the GA4 Data API.
 *
 * Returns a comprehensive snapshot for SEO triage:
 *  - Top pages with engagement (views, users, engagement rate, avg engagement time)
 *  - Landing pages with engagement rate + bounce rate
 *  - Sessions by source/medium with engagement rate
 *  - Event counts with key-event flags
 *  - Device category split with engagement
 *  - New vs returning user split with engagement
 *  - Geographic distribution (country) — top 10
 *  - AI-traffic custom-dimension counts (traffic_source_type + ai_agent)
 *
 * Output: structured JSON written to docs/seo-data/ga4/{YYYY-MM-DD}.json
 *
 * Usage:
 *   node --env-file=.env.local scripts/seo/fetch-ga4.mjs [--days=28]
 *
 * Expanded 2026-05-22: added engagement metrics, landing-page bounce,
 * device/new-vs-returning/country breakdowns, custom dimensions, key
 * event marker. V request during GA4 audit follow-up: "have full access
 * to make the best decisions."
 */

import fs from 'node:fs';
import path from 'node:path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGoogleAuthClient, getSeoConfig } from './lib/google-auth.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const days = parseInt(
    args.find((a) => a.startsWith('--days='))?.split('=')[1] || '28',
    10
  );
  return { days };
}

function isoDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const { days } = parseArgs();
  const { oauth2Client } = await getGoogleAuthClient();
  const { ga4PropertyId } = getSeoConfig();

  const analyticsDataClient = new BetaAnalyticsDataClient({
    authClient: oauth2Client,
  });

  const startDate = isoDateNDaysAgo(days);
  const endDate = 'today';
  const property = `properties/${ga4PropertyId}`;

  console.log(`Fetching GA4 data for property ${ga4PropertyId}: ${startDate} → ${endDate}`);

  // ── Top pages — engagement-flavored ─────────────────────────────────────
  const [pagesReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'userEngagementDuration' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 50,
  });

  // ── Landing pages with bounce + engagement ──────────────────────────────
  const [landingReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'landingPage' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagedSessions' },
      { name: 'engagementRate' },
      { name: 'bounceRate' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 25,
  });

  // ── Sessions by source/medium + engagement ──────────────────────────────
  const [sourceReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [
      { name: 'sessions' },
      { name: 'engagementRate' },
      { name: 'engagedSessions' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 25,
  });

  // ── Events with key-event marker ────────────────────────────────────────
  const [eventsReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [
      { name: 'eventCount' },
      { name: 'eventCountPerUser' },
      { name: 'totalUsers' },
      { name: 'keyEvents' },
    ],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 50,
  });

  // ── Device category split ───────────────────────────────────────────────
  const [deviceReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'deviceCategory' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'engagementRate' },
      { name: 'userEngagementDuration' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
  });

  // ── New vs returning ────────────────────────────────────────────────────
  const [newReturningReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'newVsReturning' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'engagementRate' },
    ],
  });

  // ── Country (geo) ───────────────────────────────────────────────────────
  const [countryReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'country' }],
    metrics: [
      { name: 'sessions' },
      { name: 'activeUsers' },
      { name: 'engagementRate' },
    ],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 10,
  });

  // ── AI-traffic custom dimensions (may be empty for 24-48h post-creation) ──
  let aiTrafficReport = null;
  let aiAgentReport = null;
  try {
    const [resp1] = await analyticsDataClient.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'customEvent:traffic_source_type' }],
      metrics: [{ name: 'sessions' }, { name: 'eventCount' }],
      limit: 10,
    });
    aiTrafficReport = resp1;
  } catch (e) {
    console.warn(`  custom dimension traffic_source_type not yet queryable: ${e.message}`);
  }
  try {
    const [resp2] = await analyticsDataClient.runReport({
      property,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'customEvent:ai_agent' }],
      metrics: [{ name: 'sessions' }, { name: 'eventCount' }],
      limit: 10,
    });
    aiAgentReport = resp2;
  } catch (e) {
    console.warn(`  custom dimension ai_agent not yet queryable: ${e.message}`);
  }

  // ── Output ──────────────────────────────────────────────────────────────
  const output = {
    fetchedAt: new Date().toISOString(),
    propertyId: ga4PropertyId,
    dateRange: { startDate, endDate, days },
    topPages: pagesReport.rows ?? [],
    landingPages: landingReport.rows ?? [],
    sessionsBySource: sourceReport.rows ?? [],
    events: eventsReport.rows ?? [],
    deviceSplit: deviceReport.rows ?? [],
    newVsReturning: newReturningReport.rows ?? [],
    countries: countryReport.rows ?? [],
    aiTrafficByType: aiTrafficReport?.rows ?? [],
    aiTrafficByAgent: aiAgentReport?.rows ?? [],
  };

  const outDir = path.join(process.cwd(), 'docs/seo-data/ga4');
  fs.mkdirSync(outDir, { recursive: true });
  const today = isoDateNDaysAgo(0);
  const outFile = path.join(outDir, `${today}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(`✓ Wrote ${outFile}`);
  console.log(`  Top pages:           ${output.topPages.length}`);
  console.log(`  Landing pages:       ${output.landingPages.length}`);
  console.log(`  Sessions by source:  ${output.sessionsBySource.length}`);
  console.log(`  Event types:         ${output.events.length}`);
  console.log(`  Device categories:   ${output.deviceSplit.length}`);
  console.log(`  Countries:           ${output.countries.length}`);
  console.log(`  AI traffic types:    ${output.aiTrafficByType.length}`);
  console.log(`  AI agents:           ${output.aiTrafficByAgent.length}`);
}

main().catch((err) => {
  console.error('GA4 fetch failed:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
