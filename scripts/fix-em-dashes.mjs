#!/usr/bin/env node
/**
 * fix-em-dashes.mjs — mechanical fixer for em-dashes in user-visible content.
 *
 * Per V's directive (2026-05-15): zero em-dashes in rendered prose.
 * Replaces ` — ` (space + em-dash + space) inside QUOTED STRINGS and JSX
 * text content with `. ` (period + space) and capitalizes the next word.
 * Skips:
 *   - Code comments (// and block)
 *   - Imports
 *   - className-like strings
 *   - hex colors / paths / ids
 *
 * USAGE:
 *   node scripts/fix-em-dashes.mjs           # dry-run, print diff
 *   node scripts/fix-em-dashes.mjs --write   # write changes
 *
 * Always re-run `npm run check:humanizer` after to verify.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const WRITE = process.argv.includes('--write');

const TARGETS = [
  'src/data/trialData.ts',
  'src/data/trial-questions.ts',
  'src/data/strokeClinicalPearls.ts',
  'src/data/guideContent.ts',
  'src/pages/QuestionDetailPage.tsx',
  'src/pages/TrialsPage.tsx',
  'src/pages/StrokeCode.tsx',
];

/**
 * Replace ` — ` with `. ` and capitalize the next alphabetic character.
 */
function rewriteString(s) {
  // First the simple case: " — X" where X is alphanumeric content.
  // Replace with ". X" with capitalized X if it starts lowercase.
  return s.replace(/ — ([^"'`])/g, (_match, next) => {
    const cap = next.match(/[a-z]/) ? next.toUpperCase() : next;
    return `. ${cap}`;
  });
}

/**
 * Process a single file. Walk line by line. For each line, find quoted-string
 * literals and rewrite their content. Skip comment lines and import lines.
 *
 * The replacement is intentionally non-greedy: we only touch the content
 * INSIDE quote pairs, never structural characters.
 */
function processFile(path) {
  const abs = resolve(ROOT, path);
  if (!existsSync(abs)) return { path, changes: 0, output: null };
  const src = readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  let totalChanges = 0;
  const out = [];

  let inBlockComment = false;
  for (const line of lines) {
    if (inBlockComment) {
      out.push(line);
      if (line.includes('*/')) inBlockComment = false;
      continue;
    }
    if (line.trim().startsWith('/*')) {
      out.push(line);
      if (!line.includes('*/')) inBlockComment = true;
      continue;
    }
    if (/^\s*\/\//.test(line) || /^\s*\*/.test(line)) {
      out.push(line);
      continue;
    }
    if (/^\s*import /.test(line)) {
      out.push(line);
      continue;
    }
    // Strip the trailing line comment so we don't rewrite em-dashes in it.
    const commentIdx = line.indexOf('//');
    const codePart = commentIdx >= 0 ? line.slice(0, commentIdx) : line;
    const commentPart = commentIdx >= 0 ? line.slice(commentIdx) : '';

    // Rewrite quoted strings only.
    let modifiedCode = codePart;
    const stringRe = /(['"`])((?:\\.|(?!\1)[^\\])*?)\1/g;
    let m;
    let changedThisLine = 0;
    const replacements = [];
    while ((m = stringRe.exec(codePart)) !== null) {
      const quote = m[1];
      const body = m[2];
      if (!body.includes(' — ')) continue;
      // Skip className-like strings: kebab-tokens separated by whitespace
      if (/^[a-z][\w-]*(\s+[a-z][\w-]*)+$/i.test(body)) continue;
      // Skip CSS/style strings (contain "px" or ":")
      if (/(?:^|\s)\d+(px|rem|em|%)(?:\s|$|,|;|\))/.test(body)) continue;
      const rewritten = rewriteString(body);
      if (rewritten !== body) {
        replacements.push({ start: m.index, end: m.index + m[0].length, replacement: quote + rewritten + quote });
        changedThisLine += 1;
      }
    }
    // Apply replacements from right to left so indices stay valid.
    for (let i = replacements.length - 1; i >= 0; i--) {
      const r = replacements[i];
      modifiedCode = modifiedCode.slice(0, r.start) + r.replacement + modifiedCode.slice(r.end);
    }
    out.push(modifiedCode + commentPart);
    totalChanges += changedThisLine;
  }

  return { path, changes: totalChanges, output: out.join('\n') };
}

let grandTotal = 0;
for (const path of TARGETS) {
  const result = processFile(path);
  if (result.output === null) {
    console.log(`(skipped — not found) ${path}`);
    continue;
  }
  console.log(`${result.changes.toString().padStart(4)} fixes  ${path}`);
  grandTotal += result.changes;
  if (WRITE && result.changes > 0) {
    writeFileSync(resolve(ROOT, path), result.output);
  }
}

console.log(`\nTotal: ${grandTotal} em-dashes ${WRITE ? 'rewritten' : 'WOULD BE rewritten (re-run with --write)'}.`);
if (!WRITE) {
  console.log('Re-run with --write to apply changes. Then `npm run check:humanizer` to verify.');
}
