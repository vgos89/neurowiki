/**
 * Pull GA4 metrics via the GA4 Data API.
 *
 * Returns: top pages by views, sessions by source, calculator usage events,
 * over a date range.
 * Output: structured JSON written to docs/seo-data/ga4/{YYYY-MM-DD}.json
 *
 * Usage:
 *   node scripts/seo/fetch-ga4.mjs [--days=28]
 */

import fs from 'node:fs';
import path from 'node:path';
import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { getGoogleAuthClient, getSeoConfig } from './lib/google-auth.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const days = parseInt(
    args.find(a => a.startsWith('--days='))?.split('=')[1] || '28',
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

  // BetaAnalyticsDataClient accepts any google-auth-library client as authClient.
  // The OAuth2Client carries the refresh token and auto-refreshes the access token.
  const analyticsDataClient = new BetaAnalyticsDataClient({
    authClient: oauth2Client,
  });

  const startDate = isoDateNDaysAgo(days);
  const endDate = 'today';
  const property = `properties/${ga4PropertyId}`;

  console.log(`Fetching GA4 data for property ${ga4PropertyId}: ${startDate} → ${endDate}`);

  // Top pages by views
  const [pagesReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'pagePath' }, { name: 'pageTitle' }],
    metrics: [
      { name: 'screenPageViews' },
      { name: 'activeUsers' },
      { name: 'averageSessionDuration' },
    ],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 50,
  });

  // Sessions by source/medium
  const [sourceReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
    metrics: [{ name: 'sessions' }],
    orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    limit: 25,
  });

  // Custom events — calculator_used + select_role etc. (defined in src/utils/analytics.ts)
  const [eventsReport] = await analyticsDataClient.runReport({
    property,
    dateRanges: [{ startDate, endDate }],
    dimensions: [{ name: 'eventName' }],
    metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
    orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
    limit: 30,
  });

  const output = {
    fetchedAt: new Date().toISOString(),
    propertyId: ga4PropertyId,
    dateRange: { startDate, endDate },
    topPages: pagesReport.rows || [],
    sessionsBySource: sourceReport.rows || [],
    events: eventsReport.rows || [],
  };

  // Write to disk
  const outDir = path.join(process.cwd(), 'docs/seo-data/ga4');
  fs.mkdirSync(outDir, { recursive: true });
  const today = isoDateNDaysAgo(0);
  const outFile = path.join(outDir, `${today}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(`✓ Wrote ${outFile}`);
  console.log(`  Top pages:           ${output.topPages.length}`);
  console.log(`  Sessions by source:  ${output.sessionsBySource.length}`);
  console.log(`  Event types:         ${output.events.length}`);
}

main().catch(err => {
  console.error('GA4 fetch failed:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
