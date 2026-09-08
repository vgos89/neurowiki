#!/usr/bin/env node
// NeuroWiki SEO, Keyword Research (Discovery)
// Ported from the Tidbit pipeline 2026-09-07 (SEO-DAILY-PORT); seeds, locale
// and owning-page heuristics from config.mjs.
//
// Different from keyword-opportunities.mjs:
//   - keyword-opportunities.mjs = OPTIMIZE queries the site already ranks for.
//   - keyword-research.mjs = DISCOVER queries it does NOT rank for yet, by
//     expanding clinician-intent seed terms through Google Suggest and
//     subtracting everything GSC already shows.
//
// The NeuroWiki quality bar applies to every output (seo-analytics skill):
// no lay-public queries, no thin pages to chase keywords. Discovery output
// is a punch list of PROPOSALS for supervised sessions.
//
// Usage:
//   node scripts/seo/keyword-research.mjs            # default 90-day GSC window
//   node scripts/seo/keyword-research.mjs 30

import { google } from 'googleapis';
import { makeAuth } from './_auth.mjs';
import { SITE, suggestOwningPage } from './config.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const siteUrl = SITE.gscSiteUrl;

const days = parseInt(process.argv[2] ?? '90', 10);

const SEED_KEYWORDS = SITE.seedKeywords;

// ─── Google Suggest API (free, no auth) ─────────────────────────────────

async function getSuggestions(seed) {
  const { hl, gl } = SITE.suggestLocale;
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(seed)}&hl=${hl}&gl=${gl}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': `Mozilla/5.0 (${SITE.name} SEO research)` } });
    if (!r.ok) return [];
    const text = await r.text();
    // Format: ["seed", ["suggestion1", "suggestion2", ...]]
    const parsed = JSON.parse(text);
    return Array.isArray(parsed?.[1]) ? parsed[1] : [];
  } catch {
    return [];
  }
}

// ─── GSC query fetch (current queries the site ranks for) ───────────────

const auth = await makeAuth(['https://www.googleapis.com/auth/webmasters.readonly']);
const sc = google.searchconsole({ version: 'v1', auth });

const fmt = (d) => d.toISOString().slice(0, 10);
const today = new Date();
const lag = 2 * 86_400_000;
const endDate = new Date(today.getTime() - lag);
const startDate = new Date(endDate.getTime() - (days - 1) * 86_400_000);

const { data: gscData } = await sc.searchanalytics.query({
  siteUrl,
  requestBody: {
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    dimensions: ['query'],
    rowLimit: 5000,
  },
});

const knownQueries = new Set(
  (gscData.rows ?? []).map((r) => r.keys[0].toLowerCase().trim()),
);

console.log(`\n${SITE.name} Keyword Research, ${today.toISOString()}`);
console.log(`Seed keywords: ${SEED_KEYWORDS.length}`);
console.log(`Current GSC vocabulary (last ${days}d): ${knownQueries.size} queries`);
console.log(`Fetching Google Suggest autocompletes...\n`);

// ─── Expand each seed via Suggest, identify gaps ────────────────────────

const allCandidates = new Map(); // suggestion -> { seed, intent }

function classifyIntent(q) {
  const lower = q.toLowerCase();
  if (/\b(how|what|why|when|where|who|can|should|is|are|does|do)\b/.test(lower)) return 'informational';
  if (/\b(calculator|score|scale|criteria|algorithm|mnemonic)\b/.test(lower)) return 'tool';
  if (/\b(vs|versus|compare|difference between)\b/.test(lower)) return 'comparison';
  if (/\b(guideline|recommendation|dose|dosing|protocol|management)\b/.test(lower)) return 'guideline';
  return 'general';
}

// Fetch in series to be polite to the Suggest endpoint
for (const seed of SEED_KEYWORDS) {
  const suggestions = await getSuggestions(seed);
  for (const sug of suggestions) {
    const norm = sug.toLowerCase().trim();
    if (knownQueries.has(norm)) continue;            // already ranks for it
    if (allCandidates.has(norm)) continue;            // dedupe across seeds
    allCandidates.set(norm, {
      query: sug,
      seed,
      intent: classifyIntent(sug),
      suggestedPage: suggestOwningPage(sug),
    });
  }
  await new Promise((r) => setTimeout(r, 250)); // polite delay
}

// ─── Bucket + report ────────────────────────────────────────────────────

const byIntent = {
  tool: [],
  guideline: [],
  informational: [],
  comparison: [],
  general: [],
};
for (const c of allCandidates.values()) {
  byIntent[c.intent].push(c);
}
for (const k of Object.keys(byIntent)) {
  byIntent[k].sort((a, b) => a.query.length - b.query.length);
}

const total = allCandidates.size;

console.log(`Found ${total} gap keywords (in Suggest autocomplete, not yet in GSC):`);
for (const intent of Object.keys(byIntent)) {
  console.log(`  ${intent}: ${byIntent[intent].length}`);
}

function printBucket(intent, items) {
  if (items.length === 0) return;
  console.log(`\n── ${intent.toUpperCase()} (${items.length}) ──`);
  for (const c of items.slice(0, 20)) {
    console.log(`  "${c.query}"`);
    console.log(`    seed: ${c.seed}`);
    console.log(`    suggested owning page: ${c.suggestedPage}`);
  }
  if (items.length > 20) {
    console.log(`  ... and ${items.length - 20} more (see markdown report).`);
  }
}

for (const intent of ['tool', 'guideline', 'informational', 'comparison', 'general']) {
  printBucket(intent, byIntent[intent]);
}

// Markdown report
const datestamp = today.toISOString().slice(0, 10);
const md = [
  `# Keyword Research, ${datestamp}`,
  ``,
  `**Goal:** find clinician queries ${SITE.name} does NOT currently rank for but should consider targeting.`,
  ``,
  `**Source:** Google Suggest autocomplete (free, no auth, hl=${SITE.suggestLocale.hl}, gl=${SITE.suggestLocale.gl}) seeded with ${SEED_KEYWORDS.length} clinician-intent terms.`,
  ``,
  `**GSC baseline:** ${knownQueries.size} queries the site already ranks for in the last ${days} days. Anything in that list is excluded from "gaps".`,
  ``,
  `**Quality bar:** clinician decision-making queries only. Lay-public queries ("what is a stroke") are ceded on purpose; do not build pages for them.`,
  ``,
  `**Run at:** ${today.toISOString()}`,
  ``,
  `## Summary`,
  ``,
  `**${total} gap keywords found.**`,
  ``,
  `| Intent | Count | Why it matters |`,
  `|---|---|---|`,
  `| Tool (calculator/score/criteria) | ${byIntent.tool.length} | Core NeuroWiki ground. Candidates for calculator intro copy, new calculators, or metadata tuning. |`,
  `| Guideline (dose/protocol/management) | ${byIntent.guideline.length} | Guide and pathway material. Any resulting content change is clinical and follows the full review path. |`,
  `| Informational (how/what/when) | ${byIntent.informational.length} | Study-mode and guide-page candidates for the clinician audience. |`,
  `| Comparison (vs) | ${byIntent.comparison.length} | Question-page material (the /trials/q/ format already answers vs-questions well). |`,
  `| General | ${byIntent.general.length} | Review manually for intent. |`,
  ``,
  `---`,
  ``,
];

function mdBucket(intent, items, framing) {
  md.push(`## ${intent.toUpperCase()} (${items.length})`);
  md.push(``);
  md.push(`_${framing}_`);
  md.push(``);
  if (items.length === 0) {
    md.push(`No gap keywords in this intent bucket this run.`);
    md.push(``, `---`, ``);
    return;
  }
  md.push(`| Query | Seed | Suggested owning page |`);
  md.push(`|---|---|---|`);
  for (const c of items) {
    md.push(`| \`${c.query}\` | \`${c.seed}\` | \`${c.suggestedPage}\` |`);
  }
  md.push(``, `---`, ``);
}

mdBucket('Tool', byIntent.tool, 'Calculator/score/criteria intent. Highest affinity with what NeuroWiki already is. Prioritise these first.');
mdBucket('Guideline', byIntent.guideline, 'Dose, protocol, and management intent. Content changes here are clinical work: evidence-verifier, medical-scientist, and clinical-reviewer all apply.');
mdBucket('Informational', byIntent.informational, 'Clinician education intent. Guide-page or study-mode candidates.');
mdBucket('Comparison', byIntent.comparison, 'Versus-style questions. The /trials/q/ question-page format is built for exactly these.');
mdBucket('General', byIntent.general, 'Did not match a clear intent bucket. Review manually.');

md.push(`## How to act on this`);
md.push(``);
md.push(`1. Pick 3-5 keywords per month from this list (start with Tool, then Comparison).`);
md.push(`2. For each, decide: tune an existing page's metadata, extend a page, or propose a new page.`);
md.push(`3. Everything routes through a supervised session with normal task classification; content with clinical meaning takes the clinical review path.`);
md.push(`4. Re-run monthly. Keywords you targeted move OUT of "gap" once GSC starts showing them.`);

await mkdir(join(repoRoot, 'docs', 'seo', 'keyword-research'), { recursive: true });
await writeFile(join(repoRoot, 'docs', 'seo', 'keyword-research-latest.md'), md.join('\n'));
await writeFile(join(repoRoot, 'docs', 'seo', 'keyword-research', `${datestamp}.md`), md.join('\n'));

console.log(`\nMarkdown report: docs/seo/keyword-research-latest.md + docs/seo/keyword-research/${datestamp}.md`);
console.log(`Counts: total=${total} ${Object.entries(byIntent).map(([k, v]) => `${k}=${v.length}`).join(' ')}`);
