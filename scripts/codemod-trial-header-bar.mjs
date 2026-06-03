// One-off codemod: replace inlined compact "sticky header bar" blocks in
// src/pages/trials/TrialPageNew.tsx with the shared <TrialHeaderBar /> component.
// arch-PR-trial-header-bar-extraction.md, Phase 1.
//
// Targets ONLY the compact single-line-button form (~105 instances). The
// expanded multi-line form (e.g. EXTEND) and the placeholder header (line ~395,
// no `sticky top-0 z-40`) do NOT match and are left untouched by design.
//
// Usage: node scripts/codemod-trial-header-bar.mjs [--limit N] [--dry]
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

// Exact compact block. Per-line leading whitespace is tolerant ([ \t]*); the
// abbreviation is captured (non-greedy) from inside the styled span. The badge
// content must be literally {categoryBadgeLabel} — branches using any other
// expression are intentionally skipped.
const block = new RegExp(
  '(?<indent>[ \\t]*)<div className="bg-white border-b border-slate-100 sticky top-0 z-40">\\n' +
  '[ \\t]*<div className="max-w-2xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">\\n' +
  '[ \\t]*<button type="button" onClick=\\{handleBack\\} className="inline-flex items-center gap-2 text-slate-500 hover:text-\\[#1746A2\\] transition-colors cursor-pointer bg-transparent border-0">\\n' +
  '[ \\t]*<ArrowLeft className="w-4 h-4" aria-hidden="true" />\\n' +
  '[ \\t]*<span style=\\{\\{ fontSize: 13, fontWeight: 700, color: \'#1e293b\', letterSpacing: \'0.02em\' \\}\\}>(?<abbr>.*?)</span>\\n' +
  '[ \\t]*</button>\\n' +
  '[ \\t]*<span className="text-xs px-2.5 py-0.5 bg-\\[#EEF2FF\\] text-\\[#1746A2\\] rounded-full font-semibold">\\{categoryBadgeLabel\\}</span>\\n' +
  '[ \\t]*</div>\\n' +
  '[ \\t]*</div>',
  'g'
);

let converted = 0;
const abbrevs = [];
src = src.replace(block, (match, indent, abbr) => {
  if (converted >= limit) return match; // leave the rest for a later batch
  // Guard: abbreviation must be plain text safe for a double-quoted JSX attr.
  if (abbr.includes('"') || abbr.includes('{') || abbr.includes('<')) return match;
  converted++;
  abbrevs.push(abbr);
  return `${indent}<TrialHeaderBar abbreviation="${abbr}" categoryBadgeLabel={categoryBadgeLabel} onBack={handleBack} />`;
});

// Ensure the import exists (add once, after the SubgroupWell sibling import).
const importLine = "import { TrialHeaderBar } from '../../components/trials/TrialHeaderBar';";
if (converted > 0 && !src.includes(importLine)) {
  src = src.replace(
    "import { SubgroupWell } from '../../components/trials/SubgroupWell';",
    "import { SubgroupWell } from '../../components/trials/SubgroupWell';\n" + importLine
  );
}

console.log(`[codemod] matched+converted this run: ${converted}`);
console.log(`[codemod] abbreviations: ${abbrevs.join(' | ')}`);

if (!dry) {
  writeFileSync(FILE, src, 'utf8');
  console.log(`[codemod] wrote ${FILE}`);
} else {
  console.log('[codemod] dry run — no write');
}
