#!/usr/bin/env node
// NeuroWiki SEO — rank delta this week vs last week
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); config from config.mjs.
// Usage: node scripts/seo/rank-deltas.mjs
// Pulls last 14 days from GSC, splits into [w-2..w-1] vs [w-1..now], reports rank changes by query+page.

import { google } from 'googleapis';
import { makeAuth } from './_auth.mjs';
import { SITE } from './config.mjs';

const siteUrl = SITE.gscSiteUrl;

const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
const sc = google.searchconsole({ version: 'v1', auth });

const fmt = (d) => d.toISOString().slice(0, 10);

// GSC lag ~2 days. "This week" = [today-9, today-2]. "Last week" = [today-16, today-9].
const day = 86_400_000;
const lagEnd = new Date(Date.now() - 2 * day);
const thisStart = new Date(lagEnd.getTime() - 6 * day);
const lastEnd = new Date(thisStart.getTime() - day);
const lastStart = new Date(lastEnd.getTime() - 6 * day);

async function pull(startDate, endDate) {
  const { data } = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ['query', 'page'],
      rowLimit: 5000,
    },
  });
  const map = new Map();
  for (const r of data.rows ?? []) {
    const [query, page] = r.keys ?? [];
    map.set(`${query}${page}`, {
      query,
      page,
      position: r.position,
      impressions: r.impressions,
      clicks: r.clicks,
    });
  }
  return map;
}

const [thisWeek, lastWeek] = await Promise.all([pull(thisStart, lagEnd), pull(lastStart, lastEnd)]);

const deltas = [];
for (const [key, now] of thisWeek) {
  const prev = lastWeek.get(key);
  if (!prev) continue;
  // Lower position is better; positive delta = improved rank.
  const positionDelta = prev.position - now.position;
  if (Math.abs(positionDelta) < 0.5 && Math.abs(now.impressions - prev.impressions) < 10) continue;
  deltas.push({
    query: now.query,
    page: now.page,
    positionNow: Number(now.position.toFixed(1)),
    positionPrev: Number(prev.position.toFixed(1)),
    positionDelta: Number(positionDelta.toFixed(1)),
    impressionsNow: now.impressions,
    impressionsPrev: prev.impressions,
    impressionsDelta: now.impressions - prev.impressions,
    clicksNow: now.clicks,
    clicksPrev: prev.clicks,
  });
}

deltas.sort((a, b) => Math.abs(b.positionDelta) - Math.abs(a.positionDelta));

const winners = deltas.filter((d) => d.positionDelta > 0).slice(0, 10);
const losers = deltas.filter((d) => d.positionDelta < 0).slice(0, 10);

const report = {
  source: 'google-search-console',
  siteUrl,
  thisWeek: { startDate: fmt(thisStart), endDate: fmt(lagEnd) },
  lastWeek: { startDate: fmt(lastStart), endDate: fmt(lastEnd) },
  fetchedAt: new Date().toISOString(),
  totalDeltas: deltas.length,
  topWinners: winners,
  topLosers: losers,
};

console.log(JSON.stringify(report, null, 2));
