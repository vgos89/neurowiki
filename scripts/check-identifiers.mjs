#!/usr/bin/env node
/**
 * check-identifiers — guards the WRONG-IDENTIFIER defect class.
 *
 * Why this exists
 * ---------------
 * The 2026-08 primary-source verification pass found FOUR trial records citing a
 * PMID that resolved to an unrelated paper. ANNEXA-I pointed at a kidney-transplant
 * rejection trial. DECIMAL and DESTINY pointed at papers that are not those trials.
 * In every case the surrounding citation (journal, volume, pages, authors, year) was
 * correct, so nothing looked wrong to a reviewer and no existing check could see it.
 * A clinician following the reference lands somewhere unrelated.
 *
 * How it works
 * ------------
 * src/data/identifier-manifest.json holds the (pmid, doi) pairs that were resolved
 * through PubMed and cross-checked: the PMID was looked up, and the DOI PubMed
 * returned was compared against the DOI in the record. This script runs OFFLINE and
 * fails if:
 *
 *   1. a record's pmid or doi differs from the verified manifest entry  (drift), or
 *   2. a record carries an identifier that has no manifest entry at all  (unverified).
 *
 * Network resolution deliberately does NOT happen here. A pre-commit hook that makes
 * network calls is slow, flaky offline, and gets disabled; developer trust in the
 * hook is the scarce resource. Verification is an explicit, occasional act; this
 * check only enforces that nothing changed since it was performed.
 *
 * When it fails
 * -------------
 * Re-resolve the identifier through PubMed (the bio-research MCP tools, or
 * https://pubmed.ncbi.nlm.nih.gov/<pmid>/) and confirm the returned paper IS the
 * trial the record describes. Then update the manifest entry with the resolved DOI
 * and title. Do NOT hand-edit the manifest to match the code: that inverts the whole
 * point and re-opens the exact hole this was written to close.
 */

import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DATA = path.join(ROOT, 'src/data/trialData.ts');
const MANIFEST = path.join(ROOT, 'src/data/identifier-manifest.json');

const red = (s) => `\x1b[31m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const green = (s) => `\x1b[32m${s}\x1b[0m`;

if (!fs.existsSync(MANIFEST)) {
  console.error(red(`[check-identifiers] missing ${path.relative(ROOT, MANIFEST)}`));
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const verified = manifest.trials || {};
const src = fs.readFileSync(DATA, 'utf8');

// Walk each top-level trial record and pull its own pmid / doi (4-space indent only,
// so nested identifiers inside fullEligibility or relatedTrials are not picked up).
const records = {};
const header = /\n  '([a-z0-9][a-z0-9.\-]*)': \{/g;
let m;
const starts = [];
while ((m = header.exec(src)) !== null) starts.push({ id: m[1], at: m.index });
starts.forEach((s, i) => {
  const end = i + 1 < starts.length ? starts[i + 1].at : src.length;
  const block = src.slice(s.at, end);
  const pmid = block.match(/\n    pmid: '([^']*)'/);
  const doi = block.match(/\n    doi: '([^']*)'/);
  if (pmid || doi) {
    records[s.id] = { pmid: pmid ? pmid[1] : null, doi: doi ? doi[1] : null };
  }
});

const drift = [];
const unverified = [];

for (const [id, rec] of Object.entries(records)) {
  // Only records carrying BOTH can be cross-checked; a doi-only record has nothing
  // to check it against and is reported separately by check:claims coverage work.
  if (!rec.pmid) continue;

  const v = verified[id];
  if (!v) {
    unverified.push({ id, ...rec });
    continue;
  }
  if (v.pmid !== rec.pmid || (v.doi || null) !== (rec.doi || null)) {
    drift.push({ id, was: v, now: rec });
  }
}

const total = Object.values(records).filter((r) => r.pmid).length;

if (drift.length === 0 && unverified.length === 0) {
  console.log(green(`[check-identifiers] OK — ${total} trial identifier(s) match the verified manifest.`));
  process.exit(0);
}

console.error(red('[check-identifiers] FAILED'));

if (drift.length) {
  console.error(red(`\n  ${drift.length} identifier(s) CHANGED since verification:`));
  for (const d of drift) {
    console.error(`    ${d.id}`);
    console.error(`      manifest : pmid ${d.was.pmid}  doi ${d.was.doi}`);
    console.error(`      record   : pmid ${d.now.pmid}  doi ${d.now.doi}`);
    if (d.was.title) console.error(`      verified as: ${d.was.title}`);
  }
}

if (unverified.length) {
  console.error(yellow(`\n  ${unverified.length} identifier(s) have NEVER been resolved:`));
  for (const u of unverified) {
    console.error(`    ${u.id}  pmid ${u.pmid}  doi ${u.doi ?? '(none)'}`);
  }
}

console.error(`
  To clear this: open https://pubmed.ncbi.nlm.nih.gov/<pmid>/ for each one and
  confirm the paper it returns IS the trial the record describes. Then add or update
  its entry in src/data/identifier-manifest.json with the resolved DOI and title.

  Do NOT edit the manifest to match the code without resolving the identifier. Four
  records in this repo cited a PMID pointing at an unrelated paper, with a
  correct-looking citation around it, and that is precisely what this check exists to
  stop from recurring.
`);
process.exit(1);
