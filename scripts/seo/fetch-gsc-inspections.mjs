#!/usr/bin/env node
/**
 * Pull per-URL GSC URL Inspection results — the same data the GSC UI shows
 * under "URL Inspection" / "Test live URL" / "Rich Results detected".
 *
 * Captures the enhancement-error data that the basic searchanalytics query
 * does NOT expose: rich-result validity, duplicate schemas, mobile usability,
 * coverage state per URL.
 *
 * Why this exists: V flagged 2026-05-22 that Codex's manual GSC audit missed
 * a "duplicate FAQPage" critical error on /calculators/glasgow-coma-scale.
 * That error is visible per-URL via the URL Inspection endpoint. Running
 * this script against the full sitemap surfaces enhancement issues across
 * every indexed route in one batch, without depending on UI clicks.
 *
 * Reads route list from public/sitemap.xml (single source of truth).
 * Throttled to stay under GSC's per-minute quota.
 *
 * Usage:
 *   node scripts/seo/fetch-gsc-inspections.mjs                    # all sitemap URLs
 *   node scripts/seo/fetch-gsc-inspections.mjs --limit=20         # first N URLs
 *   node scripts/seo/fetch-gsc-inspections.mjs --filter=calculators  # substring filter
 *   node scripts/seo/fetch-gsc-inspections.mjs --url=https://neurowiki.ai/calculators/nihss  # single URL debug
 *
 * Output: docs/seo-data/gsc/inspections/{YYYY-MM-DD}.json
 *
 * Rate limit: GSC URL Inspection is 2000/day, 600/minute. We throttle at
 * 6 requests/sec (360/min) to stay well under. 165 URLs ≈ 30s + processing.
 */

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { getGoogleAuthClient, getSeoConfig } from './lib/google-auth.mjs';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const SITEMAP_PATH = path.join(PROJECT_ROOT, 'public/sitemap.xml');
const REQUEST_INTERVAL_MS = 175; // ~5.7 req/sec, under the 600/min cap

function parseArgs() {
  const args = process.argv.slice(2);
  const get = (name) => {
    const found = args.find((a) => a.startsWith(`--${name}=`));
    return found ? found.split('=').slice(1).join('=') : null;
  };
  return {
    limit: parseInt(get('limit') ?? '0', 10),
    filter: get('filter'),
    url: get('url'),
  };
}

function loadSitemapUrls() {
  const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
  const locs = [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((m) => m[1]);
  return [...new Set(locs)];
}

async function inspectUrl(searchconsole, siteUrl, inspectionUrl) {
  try {
    const resp = await searchconsole.urlInspection.index.inspect({
      requestBody: { inspectionUrl, siteUrl },
    });
    return resp.data.inspectionResult ?? null;
  } catch (e) {
    return {
      _error: e.message ?? String(e),
      _errorCode: e.code,
    };
  }
}

/**
 * Summarize an inspection result into the fields most relevant for SEO triage.
 * Full result is preserved; this is the at-a-glance view.
 */
function summarize(url, result) {
  if (!result) return { url, status: 'no-result' };
  if (result._error) return { url, status: 'api-error', error: result._error };

  const i = result.indexStatusResult ?? {};
  const r = result.richResultsResult ?? {};
  const m = result.mobileUsabilityResult ?? {};

  const richDetected = (r.detectedItems ?? []).map((d) => ({
    type: d.richResultType,
    itemCount: d.items?.length ?? 0,
    invalidCount: (d.items ?? []).filter((it) => (it.issues ?? []).some((iss) => iss.severity === 'ERROR')).length,
    warningCount: (d.items ?? []).filter((it) => (it.issues ?? []).some((iss) => iss.severity === 'WARNING')).length,
    issues: (d.items ?? []).flatMap((it) => (it.issues ?? []).map((iss) => ({
      itemName: it.name,
      severity: iss.severity,
      message: iss.issueMessage,
    }))),
  }));

  return {
    url,
    verdict: i.verdict,
    coverageState: i.coverageState,
    indexingState: i.indexingState,
    robotsTxtState: i.robotsTxtState,
    lastCrawlTime: i.lastCrawlTime,
    pageFetchState: i.pageFetchState,
    googleCanonical: i.googleCanonical,
    userCanonical: i.userCanonical,
    sitemap: i.sitemap?.[0],
    referringUrlsCount: i.referringUrls?.length ?? 0,
    crawledAs: i.crawledAs,
    mobileUsabilityVerdict: m.verdict,
    mobileUsabilityIssueCount: (m.issues ?? []).length,
    mobileUsabilityIssues: m.issues ?? [],
    richResultsVerdict: r.verdict,
    richResultsDetected: richDetected,
    duplicateRichResultTypes: findDuplicates(richDetected.map((d) => d.type)),
  };
}

function findDuplicates(arr) {
  const counts = arr.reduce((acc, x) => ({ ...acc, [x]: (acc[x] ?? 0) + 1 }), {});
  return Object.entries(counts)
    .filter(([, c]) => c > 1)
    .map(([type, count]) => ({ type, count }));
}

async function main() {
  const { limit, filter, url } = parseArgs();

  const { oauth2Client } = await getGoogleAuthClient();
  const { gscSiteUrl } = getSeoConfig();
  const searchconsole = google.searchconsole({ version: 'v1', auth: oauth2Client });

  let urls;
  if (url) {
    urls = [url];
    console.log(`Single-URL mode: ${url}`);
  } else {
    urls = loadSitemapUrls();
    if (filter) {
      urls = urls.filter((u) => u.includes(filter));
      console.log(`Filtered to substring "${filter}": ${urls.length} URLs`);
    }
    if (limit > 0) urls = urls.slice(0, limit);
    console.log(`Inspecting ${urls.length} URLs from sitemap (throttle ${REQUEST_INTERVAL_MS}ms/req)...`);
  }

  const results = [];
  const t0 = Date.now();
  for (let idx = 0; idx < urls.length; idx++) {
    const u = urls[idx];
    process.stdout.write(`  [${idx + 1}/${urls.length}] ${u}\r`);
    const raw = await inspectUrl(searchconsole, gscSiteUrl, u);
    results.push({ raw, summary: summarize(u, raw) });
    if (idx < urls.length - 1) {
      await new Promise((r) => setTimeout(r, REQUEST_INTERVAL_MS));
    }
  }
  process.stdout.write('\n');

  const elapsedSec = ((Date.now() - t0) / 1000).toFixed(1);

  // Aggregate triage stats.
  const stats = {
    total: results.length,
    onGoogle: results.filter((r) => r.summary.verdict === 'PASS').length,
    notOnGoogle: results.filter((r) => r.summary.verdict === 'FAIL' || r.summary.verdict === 'NEUTRAL').length,
    apiErrors: results.filter((r) => r.summary.status === 'api-error').length,
    withRichResultErrors: results.filter((r) =>
      (r.summary.richResultsDetected ?? []).some((d) => d.invalidCount > 0)
    ).length,
    withDuplicateSchemas: results.filter((r) =>
      (r.summary.duplicateRichResultTypes ?? []).length > 0
    ).length,
    withMobileIssues: results.filter((r) => (r.summary.mobileUsabilityIssueCount ?? 0) > 0).length,
  };

  const output = {
    fetchedAt: new Date().toISOString(),
    siteUrl: gscSiteUrl,
    elapsedSec: parseFloat(elapsedSec),
    stats,
    results: results.map((r) => r.summary), // summary only for size
    rawSample: results.slice(0, 3).map((r) => r.raw), // first 3 raw for debugging
  };

  const today = new Date().toISOString().slice(0, 10);
  const outDir = path.join(PROJECT_ROOT, 'docs/seo-data/gsc/inspections');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${today}.json`);
  fs.writeFileSync(outFile, JSON.stringify(output, null, 2));

  console.log(`\n✓ Wrote ${outFile} (${elapsedSec}s)`);
  console.log(`  Total inspected:        ${stats.total}`);
  console.log(`  On Google:              ${stats.onGoogle}`);
  console.log(`  Not on Google:          ${stats.notOnGoogle}`);
  console.log(`  API errors:             ${stats.apiErrors}`);
  console.log(`  Rich-result errors:     ${stats.withRichResultErrors}`);
  console.log(`  Duplicate schemas:      ${stats.withDuplicateSchemas}`);
  console.log(`  Mobile-usability flags: ${stats.withMobileIssues}`);
}

main().catch((err) => {
  console.error('GSC inspection fetch failed:', err.message);
  if (err.errors) console.error(JSON.stringify(err.errors, null, 2));
  process.exit(1);
});
