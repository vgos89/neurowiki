#!/usr/bin/env node
/**
 * Synthesize an SEO audit action list from the latest GSC + GA4 data
 * artifacts written by fetch-gsc.mjs, fetch-gsc-inspections.mjs, and
 * fetch-ga4.mjs.
 *
 * No API calls — reads the JSON snapshots on disk and produces a single
 * prioritized findings report at docs/seo-data/audits/{YYYY-MM-DD}.md.
 *
 * Run the fetchers first:
 *   npm run seo:fetch-ga4
 *   npm run seo:fetch-gsc
 *   node --env-file=.env.local scripts/seo/fetch-gsc-inspections.mjs
 *   node scripts/seo/audit.mjs
 *
 * Output: markdown report with sections in priority order:
 *   1. Critical structured-data errors (broken rich results / duplicate schemas)
 *   2. Indexing blockers (Crawled-not-indexed for high-engagement pages)
 *   3. Mobile usability issues
 *   4. Title/description opportunities (high impressions, low CTR)
 *   5. Key Event gaps (events firing but not flagged as conversions)
 *   6. High-bounce engagement-time opportunities (CTA candidates)
 *
 * V request 2026-05-22: "have full access to make the best decisions."
 * This script is the "best decision" layer on top of the raw API pulls.
 */

import fs from 'node:fs';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const GA4_DIR = path.join(PROJECT_ROOT, 'docs/seo-data/ga4');
const GSC_DIR = path.join(PROJECT_ROOT, 'docs/seo-data/gsc');
const GSC_INSPECTIONS_DIR = path.join(GSC_DIR, 'inspections');
const OUTPUT_DIR = path.join(PROJECT_ROOT, 'docs/seo-data/audits');

function latestFile(dir) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')).sort();
  return files.length ? path.join(dir, files[files.length - 1]) : null;
}

function loadJson(p) {
  if (!p || !fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function fmtPct(s) {
  if (s === undefined || s === null) return '—';
  const n = parseFloat(s);
  if (Number.isNaN(n)) return '—';
  return `${(n * 100).toFixed(1)}%`;
}

// ── Section 1: structured-data errors + duplicates ────────────────────────
function findStructuredDataErrors(inspectionData) {
  if (!inspectionData?.results) return [];
  return inspectionData.results
    .map((r) => {
      const errors = (r.richResultsDetected ?? []).filter((d) => d.invalidCount > 0);
      const duplicates = r.duplicateRichResultTypes ?? [];
      if (errors.length === 0 && duplicates.length === 0) return null;
      return { url: r.url, errors, duplicates };
    })
    .filter(Boolean);
}

// ── Section 2: indexing blockers ──────────────────────────────────────────
function findIndexingBlockers(inspectionData, ga4Data) {
  if (!inspectionData?.results) return [];
  // Build a map of page → sessions from GA4 (try landingPages first, then topPages).
  const trafficByPath = new Map();
  for (const r of ga4Data?.landingPages ?? []) {
    const p = r.dimensionValues?.[0]?.value;
    const s = parseInt(r.metricValues?.[0]?.value ?? '0', 10);
    if (p) trafficByPath.set(p, s);
  }
  for (const r of ga4Data?.topPages ?? []) {
    const p = r.dimensionValues?.[0]?.value;
    const s = parseInt(r.metricValues?.[0]?.value ?? '0', 10);
    if (p && !trafficByPath.has(p)) trafficByPath.set(p, s);
  }
  return inspectionData.results
    .map((r) => {
      const blocked = r.coverageState && !r.coverageState.toLowerCase().includes('indexed') &&
                       !r.coverageState.toLowerCase().includes('submitted');
      // Treat "Crawled - currently not indexed" and "Discovered - currently not indexed"
      // and "Page with redirect" as blockers.
      const flag = r.coverageState?.includes('not indexed') ||
                   r.coverageState?.includes('redirect') ||
                   r.coverageState?.includes('Excluded');
      if (!flag) return null;
      const pathOnly = (r.url ?? '').replace(/^https?:\/\/neurowiki\.ai/i, '') || '/';
      const sessions = trafficByPath.get(pathOnly) ?? 0;
      return {
        url: r.url,
        coverageState: r.coverageState,
        lastCrawlTime: r.lastCrawlTime,
        sessions,
        verdict: r.verdict,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.sessions - a.sessions);
}

// ── Section 3: mobile usability ───────────────────────────────────────────
function findMobileIssues(inspectionData) {
  if (!inspectionData?.results) return [];
  return inspectionData.results
    .filter((r) => (r.mobileUsabilityIssueCount ?? 0) > 0)
    .map((r) => ({
      url: r.url,
      issues: r.mobileUsabilityIssues,
    }));
}

// ── Section 4: title/description opportunities (high impressions, low CTR) ─
function findCtrOpportunities(gscData) {
  if (!gscData?.topQueries) return [];
  return gscData.topQueries
    .filter((q) => q.impressions >= 10 && q.ctr < 0.05 && q.position <= 20)
    .map((q) => ({
      query: q.keys?.[0],
      impressions: q.impressions,
      clicks: q.clicks,
      ctr: q.ctr,
      position: q.position,
    }))
    .sort((a, b) => b.impressions - a.impressions);
}

// ── Section 5: Key Event gaps ─────────────────────────────────────────────
function findKeyEventGaps(ga4Data) {
  if (!ga4Data?.events) return [];
  const KEY_CANDIDATES = new Set([
    'calculator_used',
    'calculator_copied',
    'calculator_shared',
    'pathway_step_advanced',
    'external_citation_clicked',
    'trial_card_clicked',
    'deep_learning_opened',
    'feedback_submitted',
    'ai_traffic_detected',
  ]);
  return ga4Data.events
    .filter((r) => {
      const name = r.dimensionValues?.[0]?.value;
      const count = parseInt(r.metricValues?.[0]?.value ?? '0', 10);
      const keyCount = parseInt(r.metricValues?.[3]?.value ?? '0', 10);
      return KEY_CANDIDATES.has(name) && count > 0 && keyCount === 0;
    })
    .map((r) => ({
      event: r.dimensionValues[0].value,
      count: parseInt(r.metricValues[0].value, 10),
      users: parseInt(r.metricValues[2].value, 10),
    }));
}

// ── Section 6: high engagement-time, high bounce — CTA candidates ────────
function findCtaCandidates(ga4Data) {
  if (!ga4Data?.landingPages) return [];
  return ga4Data.landingPages
    .filter((r) => {
      const sessions = parseInt(r.metricValues?.[0]?.value ?? '0', 10);
      const bounce = parseFloat(r.metricValues?.[3]?.value ?? '0');
      const avgDur = parseFloat(r.metricValues?.[4]?.value ?? '0');
      // ≥5 sessions, bounce ≥60%, but avg session duration ≥30s (engaged-then-left).
      return sessions >= 5 && bounce >= 0.6 && avgDur >= 30;
    })
    .map((r) => ({
      page: r.dimensionValues[0].value,
      sessions: parseInt(r.metricValues[0].value, 10),
      bounce: parseFloat(r.metricValues[3].value),
      avgDuration: parseFloat(r.metricValues[4].value),
    }))
    .sort((a, b) => b.sessions - a.sessions);
}

// ── Markdown rendering ────────────────────────────────────────────────────
function renderReport(payload) {
  const {
    ga4Data,
    gscData,
    inspectionData,
    structuredDataErrors,
    indexingBlockers,
    mobileIssues,
    ctrOpportunities,
    keyEventGaps,
    ctaCandidates,
  } = payload;
  const lines = [];
  const today = new Date().toISOString().slice(0, 10);

  lines.push(`# SEO Audit — ${today}`);
  lines.push('');
  lines.push(`Generated by \`scripts/seo/audit.mjs\` from the latest GSC + GA4 snapshots.`);
  lines.push('');
  lines.push(`**Inputs:**`);
  lines.push(`- GA4: ${ga4Data ? `${ga4Data.dateRange.startDate} → ${ga4Data.dateRange.endDate} (${ga4Data.dateRange.days} days)` : 'NOT LOADED'}`);
  lines.push(`- GSC searchanalytics: ${gscData ? `${gscData.dateRange.startDate} → ${gscData.dateRange.endDate}` : 'NOT LOADED'}`);
  lines.push(`- GSC URL Inspection: ${inspectionData ? `${inspectionData.stats.total} URLs inspected (${inspectionData.elapsedSec}s)` : 'NOT LOADED'}`);
  lines.push('');

  lines.push('## 1. Critical structured-data errors');
  lines.push('');
  if (structuredDataErrors.length === 0) {
    lines.push('No rich-result errors or duplicate-schema findings in the indexed GSC view. (Note: live changes may not have been recrawled yet — check again in 24-72h after a sitemap resubmit.)');
  } else {
    lines.push(`Found ${structuredDataErrors.length} URL(s) with structured-data issues:`);
    lines.push('');
    for (const e of structuredDataErrors.slice(0, 25)) {
      lines.push(`### ${e.url}`);
      if (e.duplicates.length > 0) {
        lines.push(`- **Duplicate schemas:** ${e.duplicates.map((d) => `${d.type} (×${d.count})`).join(', ')}`);
      }
      for (const err of e.errors) {
        lines.push(`- **${err.type}**: ${err.invalidCount} invalid item(s), ${err.warningCount} warning(s)`);
        for (const iss of err.issues.slice(0, 5)) {
          lines.push(`  - \`${iss.itemName}\` — ${iss.severity}: ${iss.message}`);
        }
      }
      lines.push('');
    }
  }

  lines.push('## 2. Indexing blockers (sorted by GA4 traffic)');
  lines.push('');
  if (indexingBlockers.length === 0) {
    lines.push('All inspected URLs are indexed or properly excluded.');
  } else {
    lines.push(`Found ${indexingBlockers.length} URL(s) crawled but not indexed:`);
    lines.push('');
    lines.push('| URL | Coverage state | Last crawl | GA4 sessions |');
    lines.push('|---|---|---|---|');
    for (const b of indexingBlockers.slice(0, 30)) {
      const last = b.lastCrawlTime ? b.lastCrawlTime.slice(0, 10) : '—';
      lines.push(`| ${b.url} | ${b.coverageState} | ${last} | ${b.sessions} |`);
    }
    lines.push('');
    lines.push(`Action: "Request indexing" via GSC URL Inspection on the top 5-10 high-traffic blocked URLs. For systemic patterns (many similar URLs blocked), investigate underlying cause (sitemap freshness, content uniqueness, internal linking).`);
  }
  lines.push('');

  lines.push('## 3. Mobile usability');
  lines.push('');
  if (mobileIssues.length === 0) {
    lines.push('No mobile usability issues flagged.');
  } else {
    lines.push(`Found ${mobileIssues.length} URL(s) with mobile usability issues:`);
    for (const m of mobileIssues.slice(0, 20)) {
      lines.push(`- ${m.url}`);
      for (const i of m.issues) {
        lines.push(`  - ${i.issueType}: ${i.message}`);
      }
    }
  }
  lines.push('');

  lines.push('## 4. Title/description opportunities (high impressions, low CTR)');
  lines.push('');
  if (ctrOpportunities.length === 0) {
    lines.push('No queries currently meet the low-CTR-high-impression threshold (≥10 impressions, <5% CTR, position ≤20). Site is too new — recheck in 2-4 weeks.');
  } else {
    lines.push(`Found ${ctrOpportunities.length} quer(ies) with optimization opportunity:`);
    lines.push('');
    lines.push('| Query | Impressions | Clicks | CTR | Position |');
    lines.push('|---|---|---|---|---|');
    for (const q of ctrOpportunities) {
      lines.push(`| ${q.query} | ${q.impressions} | ${q.clicks} | ${fmtPct(q.ctr)} | ${q.position.toFixed(1)} |`);
    }
  }
  lines.push('');

  lines.push('## 5. Key Event gaps');
  lines.push('');
  if (keyEventGaps.length === 0) {
    lines.push('All instrumented Key Event candidates are flagged as Key Events. ✓');
  } else {
    lines.push(`These events are firing but NOT flagged as Key Events. Toggle in GA4 Admin → Events:`);
    lines.push('');
    lines.push('| Event name | Firings | Users |');
    lines.push('|---|---|---|');
    for (const e of keyEventGaps) {
      lines.push(`| \`${e.event}\` | ${e.count} | ${e.users} |`);
    }
  }
  lines.push('');

  lines.push('## 6. CTA candidates (high session duration + high bounce)');
  lines.push('');
  if (ctaCandidates.length === 0) {
    lines.push('No clear CTA candidates — either bounce is low or session duration is short across landing pages.');
  } else {
    lines.push(`Pages where users engage (≥30s avg session) but then leave (≥60% bounce). Best candidates for "Next steps" cards:`);
    lines.push('');
    lines.push('| Page | Sessions | Bounce | Avg session (s) |');
    lines.push('|---|---|---|---|');
    for (const c of ctaCandidates) {
      lines.push(`| ${c.page} | ${c.sessions} | ${fmtPct(c.bounce)} | ${c.avgDuration.toFixed(1)} |`);
    }
  }
  lines.push('');

  lines.push('---');
  lines.push('');
  lines.push(`Generated ${new Date().toISOString()}`);
  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────
async function main() {
  const ga4Data = loadJson(latestFile(GA4_DIR));
  const gscData = loadJson(latestFile(GSC_DIR));
  const inspectionData = loadJson(latestFile(GSC_INSPECTIONS_DIR));

  const structuredDataErrors = findStructuredDataErrors(inspectionData);
  const indexingBlockers = findIndexingBlockers(inspectionData, ga4Data);
  const mobileIssues = findMobileIssues(inspectionData);
  const ctrOpportunities = findCtrOpportunities(gscData);
  const keyEventGaps = findKeyEventGaps(ga4Data);
  const ctaCandidates = findCtaCandidates(ga4Data);

  const report = renderReport({
    ga4Data,
    gscData,
    inspectionData,
    structuredDataErrors,
    indexingBlockers,
    mobileIssues,
    ctrOpportunities,
    keyEventGaps,
    ctaCandidates,
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  const today = new Date().toISOString().slice(0, 10);
  const outFile = path.join(OUTPUT_DIR, `${today}.md`);
  fs.writeFileSync(outFile, report);

  console.log(`✓ Wrote ${outFile} (${report.length.toLocaleString()} bytes)`);
  console.log('');
  console.log('Findings counts:');
  console.log(`  Critical structured-data errors:    ${structuredDataErrors.length}`);
  console.log(`  Indexing blockers:                  ${indexingBlockers.length}`);
  console.log(`  Mobile usability issues:            ${mobileIssues.length}`);
  console.log(`  CTR opportunities:                  ${ctrOpportunities.length}`);
  console.log(`  Key Event gaps:                     ${keyEventGaps.length}`);
  console.log(`  CTA candidates:                     ${ctaCandidates.length}`);
}

main().catch((e) => {
  console.error('Audit failed:', e);
  process.exit(1);
});
