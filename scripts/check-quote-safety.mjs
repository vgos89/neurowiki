#!/usr/bin/env node
/**
 * check-quote-safety — catches an unescaped apostrophe inside a single-quoted
 * TypeScript string literal in the clinical data files.
 *
 * NOT extended to catch an inner QUOTED PHRASE (e.g. '>3 cm' nested inside a
 * single-quoted literal). That variant adds TWO quotes, so parity misses it, and
 * every pattern broad enough to catch it also fires on ordinary lines carrying
 * several string values, of which this file has hundreds: a type union, an object
 * literal with three string fields. A guard that reports 100+ false positives gets
 * disabled, which is worse than the gap. The compiler catches that variant
 * immediately anyway; it is the silent possessive that needed a named check.
 *
 * Why this exists: authoring clinical prose into single-quoted TS strings, an
 * apostrophe in a possessive ("CLOSE's", "Kasner's", "the arm's own baseline")
 * silently terminates the literal. tsc catches it, but only after the edit has
 * been written and only as a confusing "',' expected" at a column number. This
 * names the actual problem and the actual word. Three occurrences in one
 * session on 2026-07-31 prompted it.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const FILES = [
  'src/data/trialData.ts',
  'src/data/trialCatalogMeta.ts',
  'src/data/clinicalSynthesesByQuestion.ts',
  'src/data/trial-questions.ts',
  'src/data/guidelineTimelines.ts',
  'src/lib/citations/registry.ts',
  'src/lib/citations/claims.ts',
  'src/seo/routeMeta.ts',
  'src/seo/schema.ts',
];

let failures = 0;
for (const rel of FILES) {
  let src;
  try {
    src = readFileSync(resolve(ROOT, rel), 'utf8');
  } catch {
    continue;
  }
  src.split('\n').forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*')) return;
    // A possessive or contraction between two word characters, sitting inside
    // what looks like a single-quoted value.
    // Count unescaped single quotes on the line. A value line with an odd
    // count has an unterminated literal. This catches the possessive case and
    // anything else, including apostrophes my earlier pattern-based version
    // missed twice on the same line.
    const unescaped = (line.match(/(?<!\\)'/g) || []).length;
    const looksLikeValue = /:\s*'/.test(line) || /^\s*'/.test(line);
    const m = unescaped % 2 === 1 && looksLikeValue
      ? line.match(/\b[A-Za-z]+'[a-z]+\b/) || [line.trim().slice(0, 40)]
      : null;
    if (m) {
      process.stderr.write(
        `[check-quote-safety] ${rel}:${idx + 1} unescaped apostrophe inside a single-quoted string near ${JSON.stringify(m[0].slice(-24))}\n` +
        `  Rewrite without the possessive, or switch the literal to double quotes.\n`,
      );
      failures += 1;
    }
  });
}

if (failures) {
  process.stderr.write(`[check-quote-safety] ${failures} issue(s).\n`);
  process.exit(1);
}
process.stdout.write('[check-quote-safety] PASS.\n');
