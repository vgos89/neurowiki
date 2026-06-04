/**
 * scripts/check-card-meta.ts — drift guard for the generated trial-card metadata.
 *
 * Enforces the architect's mandatory condition (docs/reviews/arch-PR-trial-card-meta-split.md):
 * src/data/trialListData.cardmeta.generated.ts is a derived projection of
 * src/data/trialData.ts. If it drifts out of sync (e.g. a legend edit in trialData.ts
 * without regenerating), the two consumer pages would render STALE clinical legend
 * text — a §13.1 semantic-validity failure. This guard regenerates in-memory and
 * fails the commit on any byte difference.
 *
 * Usage:
 *   npm run check:card-meta
 *   tsx scripts/check-card-meta.ts
 *
 * Exit 0 if in sync. Non-zero (with the fix command) on any drift.
 */

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { renderCardMeta, GENERATED_FILE } from './gen-trial-card-meta';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const rel = path.relative(ROOT, GENERATED_FILE);

let committed: string;
try {
  committed = readFileSync(GENERATED_FILE, 'utf8');
} catch {
  console.error(`[check-card-meta] FAIL — generated file missing: ${rel}`);
  console.error('  Fix: npx tsx scripts/gen-trial-card-meta.ts');
  process.exit(1);
}

const expected = renderCardMeta();

if (committed === expected) {
  console.log(`[check-card-meta] OK — ${rel} is in sync with src/data/trialData.ts`);
  process.exit(0);
}

console.error(`[check-card-meta] FAIL — ${rel} is STALE relative to src/data/trialData.ts.`);
console.error('  The trial-card projection drifted from the source of truth.');
console.error('  Fix: npx tsx scripts/gen-trial-card-meta.ts  (then re-stage the generated file)');
process.exit(1);
