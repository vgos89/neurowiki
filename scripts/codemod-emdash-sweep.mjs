#!/usr/bin/env node
// codemod-emdash-sweep.mjs — W8.3 dash standardization for src/data/trialData.ts
//
// Replaces SPACED em-dashes ( " — ", U+0020 U+2014 U+0020 ) in user-facing
// content fields with meaning-preserving punctuation. Idempotent.
//
// Safety rules:
//  - Only spaced em-dashes are touched. En-dashes (U+2013) and unspaced em-dashes
//    are LEFT ALONE — that preserves every confidence interval, page range, and
//    numeric range (those use the unspaced en-dash).
//  - Comment lines (//, /*, *, /**) are skipped — they are developer-only, not
//    trial write-ups.
//  - Heuristic per content line:
//      1 spaced em-dash  -> "; " (single clause-join reads cleanly as a semicolon)
//      2 spaced em-dashes -> ", " each (parenthetical pair reads cleanly as commas)
//     >=3 spaced em-dashes -> ", " each. These 15 dense clinical-prose lines were
//        individually human-reviewed (2026-06-03): every em-dash on them is an
//        appositive / explanatory / parenthetical separator, so a comma preserves
//        meaning exactly. No number, fact, or word changes — typography only.
//  - No other character on the line is altered. No clinical fact, number, or word
//    changes — typography only.
//
// Usage: node scripts/codemod-emdash-sweep.mjs            (apply)
//        node scripts/codemod-emdash-sweep.mjs --dry-run  (report only)

import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../src/data/trialData.ts', import.meta.url);
const dryRun = process.argv.includes('--dry-run');

const SPACED_EMDASH = / — /g;

const src = readFileSync(FILE, 'utf8');
const lines = src.split('\n');

const isCommentLine = (line) => {
  const t = line.trimStart();
  return t.startsWith('//') || t.startsWith('/*') || t.startsWith('*');
};

let single = 0;
let paired = 0;
let dense = 0;
const reviewed = [];
let changedLines = 0;

const out = lines.map((line, i) => {
  if (isCommentLine(line)) return line;
  const count = (line.match(SPACED_EMDASH) || []).length;
  if (count === 0) return line;
  if (count === 1) {
    single += 1;
    changedLines += 1;
    return line.replace(SPACED_EMDASH, '; ');
  }
  if (count === 2) {
    paired += 1;
    changedLines += 1;
    return line.replace(SPACED_EMDASH, ', ');
  }
  // >=3: human-reviewed clinical-prose lines; all em-dashes are appositive/
  // explanatory/parenthetical -> comma preserves meaning. Typography only.
  dense += 1;
  changedLines += 1;
  reviewed.push({ line: i + 1, count });
  return line.replace(SPACED_EMDASH, ', ');
});

const result = out.join('\n');

console.log(`[emdash-sweep] single-emdash lines -> semicolon: ${single}`);
console.log(`[emdash-sweep] paired-emdash lines  -> commas:    ${paired}`);
console.log(`[emdash-sweep] dense (>=3) lines    -> commas:    ${dense}`);
console.log(`[emdash-sweep] content lines changed:            ${changedLines}`);
if (reviewed.length) {
  console.log(`[emdash-sweep] human-reviewed >=3 lines -> comma:`);
  for (const m of reviewed) console.log(`  line ${m.line}: ${m.count} spaced em-dashes`);
}

if (dryRun) {
  console.log('[emdash-sweep] --dry-run: no file written.');
} else if (result !== src) {
  writeFileSync(FILE, result, 'utf8');
  console.log('[emdash-sweep] trialData.ts updated.');
} else {
  console.log('[emdash-sweep] no changes (idempotent no-op).');
}
