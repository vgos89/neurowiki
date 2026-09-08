#!/usr/bin/env node
// NeuroWiki SEO — URL Inspection API: how Google currently views one URL
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT).
// Usage: node scripts/seo/inspect-url.mjs https://neurowiki.ai/calculators/nihss
//
// Returns: index status, last crawl time, mobile usability, structured-data
// validity, the canonical Google chose, and any indexing issues. Read-only.

import { google } from 'googleapis';
import { makeAuth } from './_auth.mjs';
import { SITE, normalizePath, inspectionUrlFor } from './config.mjs';

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node inspect-url.mjs <full https://... URL or /path>');
  console.error(`Example: node inspect-url.mjs ${SITE.baseUrl}/calculators/nihss`);
  process.exit(1);
}
// Accept a bare path or any host variant; inspect the form the GSC property
// covers (property-prefix host today, serving host once sc-domain: lands).
const path = normalizePath(arg.startsWith('http') ? arg : `${SITE.baseUrl}${arg.startsWith('/') ? arg : `/${arg}`}`);
const url = inspectionUrlFor(path);

const siteUrl = SITE.gscSiteUrl;

const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters']);
const sc = google.searchconsole({ version: 'v1', auth });

const { data } = await sc.urlInspection.index.inspect({
  requestBody: { inspectionUrl: url, siteUrl },
});

console.log(JSON.stringify({
  source: 'google-search-console-url-inspection',
  inspectedUrl: url,
  siteUrl,
  fetchedAt: new Date().toISOString(),
  inspection: data.inspectionResult ?? {},
}, null, 2));
