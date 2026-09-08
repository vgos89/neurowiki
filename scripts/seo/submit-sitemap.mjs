#!/usr/bin/env node
// NeuroWiki SEO — submit the sitemap to Google Search Console for (re)indexing
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); defaults from
// config.mjs. This is one of the TWO permitted external writes of the daily
// job (.claude/rules/seo-daily-governance.md), the other being budgeted
// request-indexing clicks.
//
// Usage:
//   node scripts/seo/submit-sitemap.mjs --confirm                     # config default
//   node scripts/seo/submit-sitemap.mjs https://... --confirm         # explicit URL
//
// The --confirm flag is required to actually submit (prevents accidents).
// Without --confirm, prints what WOULD be submitted and exits.

import { google } from 'googleapis';
import { makeAuth } from './_auth.mjs';
import { SITE } from './config.mjs';

const args = process.argv.slice(2);
const confirmed = args.includes('--confirm');
const urlArg = args.find((a) => a.startsWith('https://'));
const sitemapUrl = urlArg ?? SITE.sitemapUrl;

if (!sitemapUrl || !sitemapUrl.startsWith('https://')) {
  console.error('Usage: node submit-sitemap.mjs [full https://... sitemap URL] --confirm');
  process.exit(1);
}

const siteUrl = SITE.gscSiteUrl;

if (!confirmed) {
  console.log(JSON.stringify({
    action: 'dry-run',
    wouldSubmit: { siteUrl, feedpath: sitemapUrl },
    note: 'Re-run with --confirm to actually submit.',
  }, null, 2));
  process.exit(0);
}

const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters']);
const sc = google.searchconsole({ version: 'v1', auth });

await sc.sitemaps.submit({ siteUrl, feedpath: sitemapUrl });

// sitemaps.submit returns 204 No Content on success; fetch the updated record to confirm.
const { data } = await sc.sitemaps.get({ siteUrl, feedpath: sitemapUrl });

console.log(JSON.stringify({
  action: 'submitted',
  siteUrl,
  feedpath: sitemapUrl,
  submittedAt: new Date().toISOString(),
  gscRecord: data,
  note: 'Google will re-crawl within hours-to-days. Use list-sitemaps.mjs to check status.',
}, null, 2));
