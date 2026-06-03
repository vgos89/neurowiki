// One-off codemod: replace inlined compact trial title <h1> blocks in
// src/pages/trials/TrialPageNew.tsx with the shared <TrialTitleHeading /> component.
// arch-PR-trial-header-bar-extraction.md, Phase 2.
//
// Targets ONLY the compact 3-line form (105 instances), all sharing the exact
// className "text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]"
// and a body of `{VAR.title}: {VAR.subtitle}` where VAR is `trialMetadata` or `tm`.
// The expanded multi-line form (EXTEND, line ~478) and the two non-matching
// headers ("Trial Not Found" line ~9518; catalog-fallback with year span line
// ~9550) do NOT match and are left untouched by design.
//
// The heading color expression is captured verbatim and passed through as the
// `color` prop, so the per-branch isPositive/isHarm derivation stays at the call
// site (mechanical, no derivation lifted). The four observed colors:
//   '#1746A2'  ·  isPositive ? '#1746A2' : '#1e293b'  ·  '#1e293b'  ·  isHarm ? '#7f1d1d' : '#1e293b'
//
// Usage: node scripts/codemod-trial-title-heading.mjs [--limit N] [--dry]
//   --limit N : convert at most N occurrences this run (for batched commits)
//   --dry     : report matches without writing
//
// Idempotent: converted blocks no longer match, so re-running converts the next N.

import { readFileSync, writeFileSync } from 'node:fs';

const FILE = 'src/pages/trials/TrialPageNew.tsx';
const args = process.argv.slice(2);
const dry = args.includes('--dry');
const limIdx = args.indexOf('--limit');
const limit = limIdx >= 0 ? parseInt(args[limIdx + 1], 10) : Infinity;

let src = readFileSync(FILE, 'utf8');

// Exact compact block. Per-line leading whitespace is tolerant ([ \t]*). The
// color expression is captured non-greedily from inside the inline style. The
// metadata variable name (trialMetadata|tm) is captured and back-referenced so
// title and subtitle must use the SAME object — any other body is skipped.
const block = new RegExp(
  '(?<indent>[ \\t]*)<h1 className="text-\\[19px\\] sm:text-\\[22px\\] font-medium tracking-\\[-0\\.01em\\] leading-\\[1\\.3\\]" style=\\{\\{ color: (?<color>.*?) \\}\\}>\\n' +
  '[ \\t]*\\{(?<var>trialMetadata|tm)\\.title\\}: \\{\\k<var>\\.subtitle\\}\\n' +
  '[ \\t]*</h1>',
  'g'
);

let converted = 0;
const colors = [];
src = src.replace(block, (match, ...rest) => {
  const groups = rest[rest.length - 1]; // named groups object
  const { indent, color, var: v } = groups;
  if (converted >= limit) return match; // leave the rest for a later batch
  // Guard: color expression must be a plain JSX expression (no nested braces / quotes-in-attr hazards).
  if (color.includes('{') || color.includes('}')) return match;
  converted++;
  colors.push(color);
  return `${indent}<TrialTitleHeading title={${v}.title} subtitle={${v}.subtitle} color={${color}} />`;
});

// Ensure the import exists (add once, after the TrialHeaderBar sibling import).
const importLine = "import { TrialTitleHeading } from '../../components/trials/TrialTitleHeading';";
if (converted > 0 && !src.includes(importLine)) {
  src = src.replace(
    "import { TrialHeaderBar } from '../../components/trials/TrialHeaderBar';",
    "import { TrialHeaderBar } from '../../components/trials/TrialHeaderBar';\n" + importLine
  );
}

console.log(`[codemod] matched+converted this run: ${converted}`);
const tally = colors.reduce((m, c) => ((m[c] = (m[c] || 0) + 1), m), {});
console.log('[codemod] color tally:', JSON.stringify(tally));

if (!dry) {
  writeFileSync(FILE, src, 'utf8');
  console.log(`[codemod] wrote ${FILE}`);
} else {
  console.log('[codemod] dry run — no write');
}
