#!/usr/bin/env node
/**
 * check-source-coverage — guards the OMITTED-HALF and NO-SOURCE defect classes.
 *
 * Why this exists
 * ---------------
 * Two things the 2026-08 primary-source pass found that NO other check in this repo
 * can see, because in both cases nothing on the page is false:
 *
 *   1. OMITTING THE UNFAVOURABLE HALF.
 *      PICSS charted a favourable 98-patient non-prespecified subgroup while the
 *      comparison the trial actually published, which points the OTHER way, appeared
 *      nowhere in the codebase at all. DECIMAL, DESTINY and HAMLET each showed the
 *      pooled mortality benefit and omitted the pooled functional outcome, whose
 *      interval touches zero. No statement was wrong. A statement was missing.
 *
 *   2. NO SOURCE AT ALL.
 *      62 of 117 trial records had not a single displayed statistic tied to a source,
 *      and 58 carried no PMID, so nothing on those pages could be followed or checked.
 *
 * What it enforces
 * ----------------
 * RATCHETS, not absolute bars. The backlog is real and is being worked down; a hard
 * gate would fail on day one and get disabled. These fail only if the numbers get
 * WORSE than the recorded baseline, so the debt can shrink but never grow.
 *
 *   - trials with zero statistic-level provenance  must not exceed the baseline
 *   - trials with no PMID                          must not exceed the baseline
 *
 * Plus one hard rule that IS absolute:
 *
 *   - any record whose chart draws subgroup / post-hoc / secondary data must appear
 *     on the reviewed list. Charting a non-primary result is legitimate and sometimes
 *     the only option, but it has to be a decision somebody made and recorded, not a
 *     default. A NEW one appearing unreviewed is exactly the PICSS shape.
 *
 * Whether a record adequately presents the primary alongside a subgroup chart cannot
 * be decided textually, so this does not try. It forces a human to look once, and
 * records that they did.
 *
 * Lowering a baseline
 * -------------------
 * When you tie more statistics to sources, re-run with UPDATE_BASELINE=1 to ratchet
 * the numbers down. The script refuses to raise a baseline.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'src/data/trialData.ts');
const BASELINE = path.join(ROOT, 'src/data/source-coverage.json');

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

const src = fs.readFileSync(DATA, 'utf8');
const base = JSON.parse(fs.readFileSync(BASELINE, 'utf8'));

const header = /\n  '([a-z0-9][a-z0-9.\-]*)': \{/g;
const starts = [];
let m;
while ((m = header.exec(src)) !== null) starts.push({ id: m[1], at: m.index });

const blocks = {};
starts.forEach((s, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].at : src.length;
  blocks[s.id] = src.slice(s.at, end);
});

const PROVENANCE = /\/\*\s*claimId:[^*]*\|\s*source:/;
const HAS_PMID = /\n    pmid: '/;
const NON_PRIMARY = /(non-prespecified|subgroup|post[ -]hoc|secondary)/i;

const noProvenance = [];
const noPmid = [];
const subgroupCharts = [];

for (const [id, block] of Object.entries(blocks)) {
  if (!PROVENANCE.test(block)) noProvenance.push(id);
  if (!HAS_PMID.test(block)) noPmid.push(id);

  const eff = block.match(/efficacyResults: \{([\s\S]*?)\n    \}/);
  if (eff && NON_PRIMARY.test(eff[1])) subgroupCharts.push(id);
}

const reviewed = new Set(Object.keys(base.subgroupChartsReviewed || {}));
const unreviewed = subgroupCharts.filter((id) => !reviewed.has(id));

if (process.env.UPDATE_BASELINE === '1') {
  const next = {
    ...base,
    noProvenanceMax: Math.min(base.noProvenanceMax, noProvenance.length),
    noPmidMax: Math.min(base.noPmidMax, noPmid.length),
    _updatedOn: new Date().toISOString().slice(0, 10),
  };
  fs.writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
  console.log(green(`[check-source-coverage] baseline ratcheted: noProvenance ${next.noProvenanceMax}, noPmid ${next.noPmidMax}`));
  process.exit(0);
}

const failures = [];
if (noProvenance.length > base.noProvenanceMax) {
  failures.push(
    `trials with NO statistic tied to a source rose to ${noProvenance.length} (baseline ${base.noProvenanceMax})`
  );
}
if (noPmid.length > base.noPmidMax) {
  failures.push(`trials with NO PMID rose to ${noPmid.length} (baseline ${base.noPmidMax})`);
}
if (unreviewed.length) {
  failures.push(`${unreviewed.length} record(s) chart non-primary data without review: ${unreviewed.join(', ')}`);
}

console.log(
  `[check-source-coverage] ${Object.keys(blocks).length} trials · ` +
    `${noProvenance.length}/${base.noProvenanceMax} without provenance · ` +
    `${noPmid.length}/${base.noPmidMax} without a PMID · ` +
    `${subgroupCharts.length} charting non-primary data (${reviewed.size} reviewed)`
);

if (!failures.length) {
  console.log(green('[check-source-coverage] OK — no regression against baseline.'));
  if (noProvenance.length < base.noProvenanceMax || noPmid.length < base.noPmidMax) {
    console.log(
      yellow('  Coverage improved. Run UPDATE_BASELINE=1 npm run check:coverage to lock the gain in.')
    );
  }
  process.exit(0);
}

console.error(red('\n[check-source-coverage] FAILED'));
for (const f of failures) console.error(red(`  - ${f}`));

if (unreviewed.length) {
  console.error(`
  A record charts subgroup, post-hoc or secondary data. That is sometimes the only
  option, but it must be a recorded decision. Check that the page ALSO presents the
  trial's primary result, then add the record to "subgroupChartsReviewed" in
  src/data/source-coverage.json with a one-line note on what was checked.

  PICSS charted a favourable subgroup while the trial's own published comparison,
  which pointed the other way, appeared nowhere in this repository. Nothing was
  false, so nothing flagged it.`);
}
if (noProvenance.length > base.noProvenanceMax || noPmid.length > base.noPmidMax) {
  console.error(`
  A new trial record shipped without a source. Add a PMID, and tie its displayed
  statistics to the publication with /* claimId: ... | source: ... */ annotations.
  These baselines only ratchet DOWN; they are not meant to be raised.`);
}
process.exit(1);
