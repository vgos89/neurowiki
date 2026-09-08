#!/usr/bin/env node
// NeuroWiki SEO, Keyword Opportunity Miner
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); config from config.mjs.
//
// Pulls 28 days of GSC query data + identifies high-leverage opportunities:
//   1. PAGE-1-PUSH: queries at positions 5-12 with meaningful impressions
//   2. CTR-DRAG: queries with high impressions but unusually low CTR
//   3. WINNERS: queries with strongest impression growth (vs prior 28d)
//   4. LOSERS: queries with biggest impression drops (vs prior 28d)
//   5. NEAR-MISS: queries with impressions but zero clicks
//
// Each opportunity names the page that owns the query, the metric that
// triggered it, and a one-line "what to do" hint. On NeuroWiki all hints are
// PROPOSAL material: the morning job suggests, V applies (suggest-only rule,
// .claude/rules/seo-daily-governance.md).
//
// Output: stdout + docs/seo/keyword-opportunities-latest.md + dated copy.
// Exit codes: 0 = ran, output rendered. 1 = setup error.

import { google } from 'googleapis';
import { makeAuth } from './_auth.mjs';
import { SITE } from './config.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const siteUrl = SITE.gscSiteUrl;

const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
const sc = google.searchconsole({ version: 'v1', auth });

const fmt = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const lag = 2 * 86_400_000;
const window28End = new Date(today.getTime() - lag);
const window28Start = new Date(window28End.getTime() - 27 * 86_400_000);
const window56Start = new Date(window28End.getTime() - 55 * 86_400_000);
const window56End = new Date(window28Start.getTime() - 86_400_000);

async function fetchQueries(startDate, endDate) {
  const { data } = await sc.searchanalytics.query({
    siteUrl,
    requestBody: {
      startDate: fmt(startDate),
      endDate: fmt(endDate),
      dimensions: ['query', 'page'],
      rowLimit: 1000,
    },
  });
  return data.rows ?? [];
}

const current = await fetchQueries(window28Start, window28End);
const prior = await fetchQueries(window56Start, window56End);

// Aggregate by query (sum across pages, keep top page per query)
function aggregate(rows) {
  const map = new Map();
  for (const r of rows) {
    const [query, page] = r.keys;
    if (!map.has(query)) {
      map.set(query, {
        query,
        clicks: 0,
        impressions: 0,
        ctr: 0,
        position: 0,
        topPage: page,
        topPageImpressions: 0,
        pageCount: 0,
      });
    }
    const agg = map.get(query);
    agg.clicks += r.clicks;
    agg.impressions += r.impressions;
    agg.position += r.position * r.impressions; // impression-weighted
    agg.pageCount++;
    if (r.impressions > agg.topPageImpressions) {
      agg.topPage = page;
      agg.topPageImpressions = r.impressions;
    }
  }
  // Normalize position + CTR
  for (const agg of map.values()) {
    agg.position = agg.impressions > 0 ? agg.position / agg.impressions : 0;
    agg.ctr = agg.impressions > 0 ? agg.clicks / agg.impressions : 0;
  }
  return map;
}

const currentByQuery = aggregate(current);
const priorByQuery = aggregate(prior);

// ─── Opportunities ──────────────────────────────────────────────────────

const opportunities = {
  page1Push: [],     // pos 5-12, >= 20 impressions
  ctrDrag: [],       // >= 50 impressions, CTR < 2%
  winners: [],       // biggest absolute impression growth
  losers: [],        // biggest absolute impression drop
  nearMiss: [],      // impressions > 0, clicks = 0, pos <= 30
};

for (const [query, c] of currentByQuery) {
  // Skip branded queries from page1Push + ctrDrag (they behave differently)
  const isBranded = SITE.brandedQueryPattern.test(query);
  const p = priorByQuery.get(query);

  // Page-1-push: rank pos 5-12, >= 20 impressions
  if (!isBranded && c.position >= 5 && c.position <= 12 && c.impressions >= 20) {
    opportunities.page1Push.push({
      ...c,
      hint: `Currently ranks ~${c.position.toFixed(1)}. Propose: refresh page copy, add internal links, or rewrite meta to push to page 1.`,
    });
  }

  // CTR-drag: impressions >= 50, CTR < 2% (excluding branded which are usually 50%+)
  if (!isBranded && c.impressions >= 50 && c.ctr < 0.02 && c.position <= 20) {
    opportunities.ctrDrag.push({
      ...c,
      hint: `${(c.ctr * 100).toFixed(1)}% CTR at pos ${c.position.toFixed(1)}. Propose a title + meta description rewrite to better match query intent.`,
    });
  }

  // Near-miss: > 0 impressions, 0 clicks, pos within 30
  if (c.impressions > 0 && c.clicks === 0 && c.position <= 30) {
    opportunities.nearMiss.push({
      ...c,
      hint: `${c.impressions} impressions but 0 clicks. Title/meta mismatch with query intent, or page got shown but not chosen.`,
    });
  }

  // Winners + losers (vs prior 28d)
  if (p) {
    const delta = c.impressions - p.impressions;
    const pctChange = p.impressions > 0 ? (delta / p.impressions) * 100 : null;
    if (delta >= 20 && pctChange !== null && pctChange >= 30) {
      opportunities.winners.push({
        ...c,
        priorImpressions: p.impressions,
        delta,
        pctChange,
        hint: `Impressions up ${pctChange.toFixed(0)}% (+${delta}). Capitalise: propose a refresh and interlinks.`,
      });
    }
    if (delta <= -20 && pctChange !== null && pctChange <= -30) {
      opportunities.losers.push({
        ...c,
        priorImpressions: p.impressions,
        delta,
        pctChange,
        hint: `Impressions down ${Math.abs(pctChange).toFixed(0)}% (${delta}). Investigate: GSC URL inspector, recent algo update, competitor SERP.`,
      });
    }
  }
}

// Sort each bucket and cap at 15
opportunities.page1Push.sort((a, b) => b.impressions - a.impressions).splice(15);
opportunities.ctrDrag.sort((a, b) => b.impressions - a.impressions).splice(15);
opportunities.winners.sort((a, b) => b.delta - a.delta).splice(15);
opportunities.losers.sort((a, b) => a.delta - b.delta).splice(15);
opportunities.nearMiss.sort((a, b) => b.impressions - a.impressions).splice(15);

// ─── Output ─────────────────────────────────────────────────────────────

const totals = {
  page1Push: opportunities.page1Push.length,
  ctrDrag: opportunities.ctrDrag.length,
  winners: opportunities.winners.length,
  losers: opportunities.losers.length,
  nearMiss: opportunities.nearMiss.length,
};

const datestamp = today.toISOString().slice(0, 10);
const timestamp = today.toISOString();

console.log(`\n${SITE.name} Keyword Opportunities, ${timestamp}`);
console.log(`Window: ${fmt(window28Start)} to ${fmt(window28End)} (28 days), vs prior 28 days`);
console.log(`Site: ${siteUrl}`);
console.log(`Found: page1Push=${totals.page1Push} ctrDrag=${totals.ctrDrag} winners=${totals.winners} losers=${totals.losers} nearMiss=${totals.nearMiss}\n`);

function printBucket(title, items, fieldRows) {
  if (items.length === 0) {
    console.log(`── ${title} ── (none)\n`);
    return;
  }
  console.log(`── ${title} (${items.length}) ──`);
  for (const o of items) {
    console.log(`  "${o.query}"`);
    for (const f of fieldRows(o)) console.log(`    ${f}`);
    console.log(`    Page: ${o.topPage}`);
    console.log(`    Hint: ${o.hint}\n`);
  }
}

printBucket('Page-1 Push (rank 5-12, decent impressions)', opportunities.page1Push, (o) => [
  `Impressions: ${o.impressions}, Clicks: ${o.clicks}, CTR: ${(o.ctr * 100).toFixed(1)}%, Avg Pos: ${o.position.toFixed(1)}`,
]);
printBucket('CTR Drag (high impressions, weak click-through)', opportunities.ctrDrag, (o) => [
  `Impressions: ${o.impressions}, Clicks: ${o.clicks}, CTR: ${(o.ctr * 100).toFixed(1)}%, Avg Pos: ${o.position.toFixed(1)}`,
]);
printBucket('Winners (impressions up >= 30% vs prior 28d)', opportunities.winners, (o) => [
  `Now: ${o.impressions} impressions. Was: ${o.priorImpressions}. Delta: +${o.delta} (${o.pctChange.toFixed(0)}%)`,
]);
printBucket('Losers (impressions down >= 30% vs prior 28d)', opportunities.losers, (o) => [
  `Now: ${o.impressions} impressions. Was: ${o.priorImpressions}. Delta: ${o.delta} (${o.pctChange.toFixed(0)}%)`,
]);
printBucket('Near-Miss (impressions but zero clicks)', opportunities.nearMiss, (o) => [
  `Impressions: ${o.impressions}, CTR: 0%, Avg Pos: ${o.position.toFixed(1)}`,
]);

// Markdown report
const md = [`# Keyword Opportunities, ${datestamp}`, ``, `**Site:** \`${siteUrl}\``];
md.push(`**Window:** ${fmt(window28Start)} to ${fmt(window28End)} (28 days)`);
md.push(`**Prior window:** ${fmt(window56Start)} to ${fmt(window56End)}`);
md.push(`**Run at:** ${timestamp}`);
md.push(``, `## Summary`, ``);
md.push(`| Bucket | Count |`);
md.push(`|---|---|`);
md.push(`| Page-1 Push (rank 5-12) | ${totals.page1Push} |`);
md.push(`| CTR Drag (low CTR, high impressions) | ${totals.ctrDrag} |`);
md.push(`| Winners (impressions up ≥30%) | ${totals.winners} |`);
md.push(`| Losers (impressions down ≥30%) | ${totals.losers} |`);
md.push(`| Near-Miss (impressions, 0 clicks) | ${totals.nearMiss} |`);
md.push(``, `---`, ``);

function mdBucket(title, items, helper) {
  md.push(`## ${title}`);
  if (items.length === 0) {
    md.push(``, `_None in this window._`, ``, `---`, ``);
    return;
  }
  md.push(``);
  md.push(`| Query | Metrics | Page | What to do |`);
  md.push(`|---|---|---|---|`);
  for (const o of items) {
    md.push(`| \`${o.query}\` | ${helper(o)} | \`${o.topPage}\` | ${o.hint} |`);
  }
  md.push(``, `---`, ``);
}

mdBucket('Page-1 Push opportunities', opportunities.page1Push, (o) =>
  `imp ${o.impressions} / clk ${o.clicks} / CTR ${(o.ctr * 100).toFixed(1)}% / pos ${o.position.toFixed(1)}`,
);
mdBucket('CTR Drag opportunities', opportunities.ctrDrag, (o) =>
  `imp ${o.impressions} / clk ${o.clicks} / CTR ${(o.ctr * 100).toFixed(1)}% / pos ${o.position.toFixed(1)}`,
);
mdBucket('Winners (refresh + capitalise)', opportunities.winners, (o) =>
  `now ${o.impressions} / was ${o.priorImpressions} / Δ +${o.delta} (${o.pctChange.toFixed(0)}%)`,
);
mdBucket('Losers (investigate)', opportunities.losers, (o) =>
  `now ${o.impressions} / was ${o.priorImpressions} / Δ ${o.delta} (${o.pctChange.toFixed(0)}%)`,
);
mdBucket('Near-Miss (title or meta mismatch)', opportunities.nearMiss, (o) =>
  `imp ${o.impressions} / clk 0 / pos ${o.position.toFixed(1)}`,
);

await mkdir(join(repoRoot, 'docs', 'seo', 'keyword-opportunities'), { recursive: true });
await writeFile(join(repoRoot, 'docs', 'seo', 'keyword-opportunities-latest.md'), md.join('\n'));
await writeFile(join(repoRoot, 'docs', 'seo', 'keyword-opportunities', `${datestamp}.md`), md.join('\n'));

console.log(`Markdown report saved: docs/seo/keyword-opportunities-latest.md + docs/seo/keyword-opportunities/${datestamp}.md`);
