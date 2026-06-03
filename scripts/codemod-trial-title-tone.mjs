// One-off codemod: convert <TrialTitleHeading … color={…}> call sites in
// src/pages/trials/TrialPageNew.tsx to the semantic `tone` prop.
// arch-PR-trial-title-heading-extraction.md, condition #6 (tone-enum cleanup).
//
// The component now owns its color vocabulary (TrialTitleHeading.tsx → TONE_COLORS),
// so each call site passes a tone instead of a resolved hex. Every tone resolves to
// the EXACT hex previously passed inline, so rendered output is byte-identical:
//   positive → '#1746A2' (cobalt)   neutral → '#1e293b' (ink)   harm → '#7f1d1d' (maroon)
//
// Four exact color expressions appear across the 105 call sites (verified counts):
//   color={'#1746A2'}                          79×  → tone="positive"
//   color={'#1e293b'}                          11×  → tone="neutral"
//   color={isPositive ? '#1746A2' : '#1e293b'} 12×  → tone={isPositive ? 'positive' : 'neutral'}
//   color={isHarm ? '#7f1d1d' : '#1e293b'}      3×  → tone={isHarm ? 'harm' : 'neutral'}
//
// Usage: node scripts/codemod-trial-title-tone.mjs [--dry]
// Idempotent: converted sites carry `tone=` not `color=`, so re-running is a no-op.

import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/pages/trials/TrialPageNew.tsx';
const dry = process.argv.slice(2).includes('--dry');

let src = readFileSync(FILE, 'utf8');

// Exact-literal substitutions. Order does not matter — the expressions are disjoint.
const subs = [
  [`color={'#1746A2'}`, `tone="positive"`],
  [`color={'#1e293b'}`, `tone="neutral"`],
  [`color={isPositive ? '#1746A2' : '#1e293b'}`, `tone={isPositive ? 'positive' : 'neutral'}`],
  [`color={isHarm ? '#7f1d1d' : '#1e293b'}`, `tone={isHarm ? 'harm' : 'neutral'}`],
];

const tally = {};
let total = 0;
for (const [from, to] of subs) {
  const parts = src.split(from);
  const n = parts.length - 1;
  if (n > 0) {
    src = parts.join(to);
    tally[from] = n;
    total += n;
  }
}

console.log(`[codemod] converted this run: ${total}`);
console.log('[codemod] tally:', JSON.stringify(tally, null, 0));

// Sanity: no stray color= props should remain on TrialTitleHeading.
const stray = (src.match(/<TrialTitleHeading[^>]*\bcolor=/g) || []).length;
if (stray > 0) {
  console.error(`[codemod] WARNING: ${stray} TrialTitleHeading call site(s) still carry a color= prop (unconverted color expression). Inspect before committing.`);
}

if (!dry) {
  writeFileSync(FILE, src, 'utf8');
  console.log(`[codemod] wrote ${FILE}`);
} else {
  console.log('[codemod] dry run — no write');
}
