#!/usr/bin/env node
// NeuroWiki, AI Traffic Detector
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); config from
// config.mjs; "leads" replaced with the clinician-action event set.
//
// Queries GA4 for sessions referred from AI assistants (ChatGPT, Perplexity,
// Claude, Gemini, Copilot, etc.). For each source, reports total sessions,
// landing pages, and whether any clinician actions fired.
//
// Why this exists: clinicians increasingly ask AI assistants for calculators
// and pathway answers. This is the earliest signal that AI search surfaces
// NeuroWiki. Even 1-2 sessions per week from chatgpt.com is worth knowing.
// (The site also tags AI arrivals itself via the traffic_source_type /
// ai_agent custom dimensions in src/utils/analytics.ts; fetch-ga4.mjs pulls
// those. This report is the referrer-based cross-check.)
//
// Usage:
//   node scripts/seo/ai-traffic.mjs            # default 30-day window
//   node scripts/seo/ai-traffic.mjs 60         # 60-day window

import { makeAuth } from './_auth.mjs';
import { SITE } from './config.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const propertyId = SITE.ga4PropertyId;

const days = parseInt(process.argv[2] ?? '30', 10);

// AI assistant referral domains (lowercase, partial match)
const AI_SOURCES = [
  'chatgpt.com',
  'chat.openai.com',
  'openai.com',
  'perplexity.ai',
  'claude.ai',
  'anthropic.com',
  'gemini.google.com',
  'you.com',
  'copilot.microsoft.com',
  'bravesearch.com',
  'brave.com',
  'duckduckgo.com',
  'phind.com',
  'kagi.com',
  'andi.com',
  'metaphor.systems',
  'exa.ai',
  'openevidence.com',
];

const auth = await makeAuth(['https://www.googleapis.com/auth/analytics.readonly']);
const client = await auth.getClient();
const accessToken = (await client.getAccessToken()).token;

const fmt = (d) => d.toISOString().slice(0, 10);
const endDate = new Date(Date.now() - 86_400_000);
const startDate = new Date(endDate.getTime() - (days - 1) * 86_400_000);

// Pull sessions by source + landing page
const sessionsRes = await fetch(
  `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
      dimensions: [{ name: 'sessionSource' }, { name: 'landingPagePlusQueryString' }],
      metrics: [{ name: 'sessions' }, { name: 'engagedSessions' }, { name: 'averageSessionDuration' }],
      limit: 1000,
    }),
  },
);

if (!sessionsRes.ok) {
  console.error(`GA4 sessions query failed: ${sessionsRes.status}`);
  console.error(await sessionsRes.text());
  process.exit(1);
}

const sessionsData = await sessionsRes.json();
const allRows = sessionsData.rows ?? [];

// Filter to AI sources
function matchesAI(source) {
  const lower = (source || '').toLowerCase();
  return AI_SOURCES.some((domain) => lower.includes(domain));
}

const aiRows = allRows.filter((r) => matchesAI(r.dimensionValues[0].value));

// Aggregate by source
const bySource = new Map();
for (const r of aiRows) {
  const [source, landing] = r.dimensionValues.map((v) => v.value);
  const sessions = parseInt(r.metricValues[0].value, 10);
  const engaged = parseInt(r.metricValues[1].value, 10);
  const avgDuration = parseFloat(r.metricValues[2].value);
  if (!bySource.has(source)) {
    bySource.set(source, { source, sessions: 0, engaged: 0, durationWeighted: 0, landings: new Map() });
  }
  const agg = bySource.get(source);
  agg.sessions += sessions;
  agg.engaged += engaged;
  agg.durationWeighted += avgDuration * sessions;
  agg.landings.set(landing, (agg.landings.get(landing) ?? 0) + sessions);
}

// Pull clinician actions from AI sources
const actionsRes = await fetch(
  `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
  {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      dateRanges: [{ startDate: fmt(startDate), endDate: fmt(endDate) }],
      dimensions: [{ name: 'sessionSource' }, { name: 'eventName' }],
      metrics: [{ name: 'eventCount' }],
      dimensionFilter: {
        orGroup: {
          expressions: SITE.conversionEvents.map((value) => ({
            filter: { fieldName: 'eventName', stringFilter: { value, matchType: 'EXACT' } },
          })),
        },
      },
      limit: 200,
    }),
  },
);
const actionsData = actionsRes.ok ? await actionsRes.json() : { rows: [] };
const actionsBySource = new Map();
for (const r of actionsData.rows ?? []) {
  const source = r.dimensionValues[0].value;
  if (matchesAI(source)) {
    actionsBySource.set(source, (actionsBySource.get(source) ?? 0) + parseInt(r.metricValues[0].value, 10));
  }
}

// Output
const totalAISessions = Array.from(bySource.values()).reduce((sum, a) => sum + a.sessions, 0);
const totalAIActions = Array.from(actionsBySource.values()).reduce((sum, c) => sum + c, 0);
const totalSessions = allRows.reduce((sum, r) => sum + parseInt(r.metricValues[0].value, 10), 0);
const aiShare = totalSessions > 0 ? (totalAISessions / totalSessions) * 100 : 0;

console.log(`\nAI Traffic Detector, ${new Date().toISOString()}`);
console.log(`Window: ${fmt(startDate)} to ${fmt(endDate)} (${days} days)`);
console.log(`Total sessions (all sources): ${totalSessions}`);
console.log(`AI-sourced sessions: ${totalAISessions} (${aiShare.toFixed(2)}% of total)`);
console.log(`Clinician actions from AI visits: ${totalAIActions}\n`);

if (bySource.size === 0) {
  console.log('No AI-sourced traffic detected in this window.');
  console.log('AI assistants typically take 4-12 weeks to start citing a domain.');
  console.log('Re-run weekly. The first AI session is a meaningful milestone.\n');
}

const sorted = Array.from(bySource.values()).sort((a, b) => b.sessions - a.sessions);
for (const agg of sorted) {
  const engagementRate = agg.sessions > 0 ? (agg.engaged / agg.sessions) * 100 : 0;
  const avgDur = agg.sessions > 0 ? agg.durationWeighted / agg.sessions : 0;
  const actions = actionsBySource.get(agg.source) ?? 0;
  console.log(`── ${agg.source} ──`);
  console.log(`  Sessions: ${agg.sessions} | Engaged: ${agg.engaged} (${engagementRate.toFixed(0)}%) | Avg dur: ${avgDur.toFixed(0)}s | Actions: ${actions}`);
  const topLandings = Array.from(agg.landings.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);
  for (const [page, n] of topLandings) {
    console.log(`    ${page}: ${n} session${n === 1 ? '' : 's'}`);
  }
  console.log('');
}

// Markdown report
const datestamp = fmt(new Date());
const md = [
  `# AI Traffic Report, ${datestamp}`,
  ``,
  `**Window:** ${fmt(startDate)} to ${fmt(endDate)} (${days} days)`,
  `**Total sessions:** ${totalSessions}`,
  `**AI-sourced sessions:** ${totalAISessions} (${aiShare.toFixed(2)}% of total)`,
  `**Clinician actions from AI visits:** ${totalAIActions}`,
  ``,
  `---`,
  ``,
];

if (bySource.size === 0) {
  md.push(`## No AI-sourced traffic in this window`);
  md.push(``);
  md.push(`AI assistants typically take 4-12 weeks to start citing a domain in their answers, and clinicians often open cited links on desktop later rather than clicking through.`);
  md.push(``);
  md.push(`Re-run weekly. The first AI-sourced session is a meaningful milestone: it confirms an assistant has both crawled and chosen to cite ${SITE.name}.`);
} else {
  md.push(`## Per-source breakdown`);
  md.push(``);
  md.push(`| Source | Sessions | Engaged % | Avg dur | Actions | Top landing page |`);
  md.push(`|---|---|---|---|---|---|`);
  for (const agg of sorted) {
    const engagementRate = agg.sessions > 0 ? (agg.engaged / agg.sessions) * 100 : 0;
    const avgDur = agg.sessions > 0 ? agg.durationWeighted / agg.sessions : 0;
    const actions = actionsBySource.get(agg.source) ?? 0;
    const topLanding = Array.from(agg.landings.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? '?';
    md.push(`| ${agg.source} | ${agg.sessions} | ${engagementRate.toFixed(0)}% | ${avgDur.toFixed(0)}s | ${actions} | \`${topLanding}\` |`);
  }
}

const docsDir = join(repoRoot, 'docs', 'seo', 'ai-traffic');
await mkdir(docsDir, { recursive: true });
await writeFile(join(repoRoot, 'docs', 'seo', 'ai-traffic-latest.md'), md.join('\n'));
await writeFile(join(docsDir, `${datestamp}.md`), md.join('\n'));

console.log(`Markdown report saved: docs/seo/ai-traffic-latest.md + docs/seo/ai-traffic/${datestamp}.md`);
