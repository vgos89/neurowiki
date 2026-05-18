/**
 * Pull Google Search Console data via the Search Console API.
 *
 * Returns the top N queries + pages by clicks/impressions over a date range.
 * Output: structured JSON written to docs/seo-data/gsc/{YYYY-MM-DD}.json
 *
 * Usage:
 *   node scripts/seo/fetch-gsc.mjs [--days=28] [--limit=100]
 */

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { getGoogleAuthClient, getSeoConfig } from './lib/google-auth.mjs';

function parseArgs() {
  const args = process.argv.slice(2);
  const days = parseInt(
    args.find(a => a.startsWith('--days='))?.split('=')[1] || '28',
    10
  );
  const limit = parseInt(
    args.find(a => a.startsWith('--limit='))?.split('=')[1] || '100',
    10
  );
  return { days, limit };
}

function isoDateNDaysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const { days, limit } = parseArgs();
  const { jwtClient } = await getGoogleAuthClient();
  const { gscSiteUrl } = getSeoConfig();

  const searchconsole = google.searchconsole({
    version: 'v1',
    auth: jwtClient,
  });

  const startDate = isoDateNDaysAgo(days);
  const endDate = isoDateNDaysAgo(1); // GSC has ~2-day delay

  console.log(`Fetching GSC data for ${gscSiteUrl}: ${startDate} → ${endDate}`);

  // Top queries
  const queriesResp = await searchconsole.searchanalytics.query({
    siteUrl: gscSiteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['query'],
      rowLimit: limit,
    },
  });

  // Top pages
  const pagesResp = await searchconsole.searchanalytics.query({
    siteUrl: gscSiteUrl,
    requestBody: {
      startDate,
      endDate,
      dimensions: ['page'],
      rowLimit: limit,
    },
  });

  // Indexability summary (via URL Inspection — list-mode unavailable; use sitemap data instead)
  const sitemapsResp = await searchconsole.sitemaps.list({ siteUrl: gscSiteUrl });

  const output = {
    fetchedAt: new Date().toISOString(),
    siteUrl: gscSiteUrl,
    dateRange: { startDate, endDate },
    topQueries: queriesResp.data.rows || [],
    topPages: pagesResp.data.rows || [],
    sitemaps: sitemapsResp.data.sitemap || [],
  };

  // Write to disk
  const outDir = path.join(process.cwd(), 'docs/seo-data/gsc');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${endDate}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(`✓ Wrote ${outFile}`);
  console.log(`  Top queries: ${output.topQueries.length}`);
  console.log(`  Top pages:   ${output.topPages.length}`);
  console.log(`  Sitemaps:    ${output.sitemaps.length}`);
}

main().catch(err => {
  console.error('GSC fetch failed:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
