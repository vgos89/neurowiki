/**
 * Generate a plain-English weekly SEO report from the most-recent GA4 + GSC
 * fetches in docs/seo-data/{ga4,gsc}/.
 *
 * Output: docs/seo-data/weekly/{YYYY-MM-DD}-report.md
 *
 * Usage:
 *   node scripts/seo/generate-weekly-report.mjs
 *
 * Prereqs: fetch-ga4.mjs and fetch-gsc.mjs already ran today (or you pass
 * --date=YYYY-MM-DD to target an older snapshot).
 */

import fs from 'node:fs';
import path from 'node:path';

function parseArgs() {
  const args = process.argv.slice(2);
  const date = args.find(a => a.startsWith('--date='))?.split('=')[1]
    || new Date().toISOString().slice(0, 10);
  return { date };
}

function loadLatest(dir, dateHint) {
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
  if (files.length === 0) return null;
  // Pick the file matching dateHint if it exists; otherwise the latest
  const exact = files.find(f => f.startsWith(dateHint));
  const target = exact || files[files.length - 1];
  return JSON.parse(fs.readFileSync(path.join(dir, target), 'utf-8'));
}

function topN(rows, n = 10) {
  return (rows || []).slice(0, n);
}

function formatGA4PageRow(row) {
  const [path, title] = row.dimensionValues.map(v => v.value);
  const views = row.metricValues[0]?.value || '0';
  return `| ${path} | ${views} | ${title || ''} |`;
}

function formatGSCQueryRow(row) {
  const query = row.keys?.[0] || '(unknown)';
  return `| ${query} | ${row.clicks ?? 0} | ${row.impressions ?? 0} | ${((row.ctr ?? 0) * 100).toFixed(1)}% | ${row.position?.toFixed(1) || '—'} |`;
}

function formatGSCPageRow(row) {
  const page = row.keys?.[0] || '(unknown)';
  return `| ${page} | ${row.clicks ?? 0} | ${row.impressions ?? 0} | ${((row.ctr ?? 0) * 100).toFixed(1)}% |`;
}

function main() {
  const { date } = parseArgs();
  const ga4 = loadLatest(path.join(process.cwd(), 'docs/seo-data/ga4'), date);
  const gsc = loadLatest(path.join(process.cwd(), 'docs/seo-data/gsc'), date);

  if (!ga4 && !gsc) {
    console.error('No GA4 or GSC data found. Run fetch-ga4.mjs and fetch-gsc.mjs first.');
    process.exit(1);
  }

  const sections = [];
  sections.push(`# Weekly SEO Report — ${date}\n`);
  sections.push(`Auto-generated from GA4 + Google Search Console APIs.\n`);

  if (gsc) {
    sections.push(`## Google Search Console — ${gsc.dateRange.startDate} to ${gsc.dateRange.endDate}\n`);
    sections.push(`Site: \`${gsc.siteUrl}\`\n`);

    sections.push(`### Top queries (by clicks)\n`);
    sections.push('| Query | Clicks | Impressions | CTR | Avg position |');
    sections.push('|---|---|---|---|---|');
    topN(gsc.topQueries, 20).forEach(r => sections.push(formatGSCQueryRow(r)));
    sections.push('');

    sections.push(`### Top landing pages (from search)\n`);
    sections.push('| Page | Clicks | Impressions | CTR |');
    sections.push('|---|---|---|---|');
    topN(gsc.topPages, 20).forEach(r => sections.push(formatGSCPageRow(r)));
    sections.push('');

    if (gsc.sitemaps?.length) {
      sections.push(`### Sitemaps\n`);
      gsc.sitemaps.forEach(s => {
        sections.push(`- \`${s.path}\` — submitted ${s.lastSubmitted || '—'}, type ${s.type || '—'}`);
      });
      sections.push('');
    }
  }

  if (ga4) {
    sections.push(`## GA4 — ${ga4.dateRange.startDate} to ${ga4.dateRange.endDate}\n`);
    sections.push(`Property: \`${ga4.propertyId}\`\n`);

    sections.push(`### Top pages (by views)\n`);
    sections.push('| Path | Views | Title |');
    sections.push('|---|---|---|');
    topN(ga4.topPages, 20).forEach(r => sections.push(formatGA4PageRow(r)));
    sections.push('');

    sections.push(`### Sessions by source/medium\n`);
    sections.push('| Source / Medium | Sessions |');
    sections.push('|---|---|');
    topN(ga4.sessionsBySource, 15).forEach(r => {
      const source = r.dimensionValues[0]?.value || '(direct)';
      const medium = r.dimensionValues[1]?.value || '(none)';
      const sessions = r.metricValues[0]?.value || '0';
      sections.push(`| ${source} / ${medium} | ${sessions} |`);
    });
    sections.push('');

    sections.push(`### Custom events\n`);
    sections.push('| Event | Count | Users |');
    sections.push('|---|---|---|');
    topN(ga4.events, 20).forEach(r => {
      const name = r.dimensionValues[0]?.value || '(unknown)';
      const count = r.metricValues[0]?.value || '0';
      const users = r.metricValues[1]?.value || '0';
      sections.push(`| ${name} | ${count} | ${users} |`);
    });
    sections.push('');
  }

  const outDir = path.join(process.cwd(), 'docs/seo-data/weekly');
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${date}-report.md`);
  fs.writeFileSync(outFile, sections.join('\n'));

  console.log(`✓ Wrote ${outFile}`);
}

main();
