#!/usr/bin/env node
// NeuroWiki SEO — list sitemaps currently registered with Google Search Console
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT).
// Usage: node scripts/seo/list-sitemaps.mjs
// Read-only — only calls sitemaps.list.

import { google } from 'googleapis';
import { makeAuth } from './_auth.mjs';
import { SITE } from './config.mjs';

const siteUrl = SITE.gscSiteUrl;

const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters.readonly']);

const sc = google.searchconsole({ version: 'v1', auth });
const { data } = await sc.sitemaps.list({ siteUrl });

const report = {
  source: 'google-search-console',
  siteUrl,
  fetchedAt: new Date().toISOString(),
  sitemapCount: data.sitemap?.length ?? 0,
  sitemaps: data.sitemap ?? [],
};

console.log(JSON.stringify(report, null, 2));
