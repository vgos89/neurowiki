#!/usr/bin/env node
/**
 * scripts/strip-dark-mode.mjs
 *
 * One-shot cleanup script — removes all `dark:*` Tailwind utility classes
 * from source files. Dark mode was decided to be scrapped previously but
 * the `dark:` utilities were never fully removed.
 *
 * After this script runs, the @custom-variant dark block in index.css can
 * be safely removed (Tailwind will no longer encounter dark: utilities).
 *
 * Usage:
 *   node scripts/strip-dark-mode.mjs
 *
 * Idempotent: running twice is a no-op.
 *
 * What it does:
 *   1. Walks src/ for .ts, .tsx, .js, .jsx files.
 *   2. Strips `dark:TOKEN` patterns where TOKEN is a Tailwind class
 *      (alphanumerics, dashes, slashes, dots, colons for modifier chains,
 *      brackets and # for arbitrary values, etc.).
 *   3. Collapses double-spaces inside double-quoted className strings.
 *   4. Reports per-file removal count and total.
 *
 * What it does NOT do:
 *   - Edit index.css (do that manually after this script).
 *   - Touch comments (dark: in /* ... *\/ stays).
 *   - Strip dark: outside className strings (e.g., in plain JS variables).
 *     The regex matches anywhere, but Tailwind dark: tokens only appear
 *     in className strings in practice.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'src');

// Pattern: `dark:` followed by a Tailwind class token.
// Class token = anything that is NOT whitespace, quote, backtick, or template-literal close.
// Allows `:` for modifier chains (dark:hover:bg-X), `[]` for arbitrary values,
// `/` for opacity (dark:bg-X/30), `.` rare but possible, `#` for arbitrary colors.
const DARK_PATTERN = /\s*\bdark:[^\s"'`}<>]+/g;

// Cleanup: collapse multiple spaces inside `className="..."` to single spaces.
const CLASSNAME_DOUBLE_QUOTE = /className="([^"]*)"/g;
const CLASSNAME_TEMPLATE = /className=\{`([^`]*)`\}/g;

let totalRemoved = 0;
let filesChanged = 0;

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
      processFile(full);
    }
  }
}

function processFile(file) {
  const original = fs.readFileSync(file, 'utf8');
  if (!original.includes('dark:')) return;

  const matches = original.match(DARK_PATTERN) || [];
  if (matches.length === 0) return;

  let next = original.replace(DARK_PATTERN, '');

  // Collapse double-spaces inside className double-quoted strings.
  next = next.replace(CLASSNAME_DOUBLE_QUOTE, (_m, classes) => {
    const cleaned = classes.replace(/\s+/g, ' ').trim();
    return `className="${cleaned}"`;
  });

  // Collapse double-spaces inside className template literals (preserve ${} interpolations).
  next = next.replace(CLASSNAME_TEMPLATE, (_m, classes) => {
    const cleaned = classes.replace(/[ \t]+/g, ' ');
    return `className={\`${cleaned}\`}`;
  });

  if (next !== original) {
    fs.writeFileSync(file, next);
    const removed = matches.length;
    totalRemoved += removed;
    filesChanged += 1;
    const rel = path.relative(ROOT, file);
    console.log(`${rel}: removed ${removed}`);
  }
}

walk(SRC);
console.log(`---`);
console.log(`Files changed: ${filesChanged}`);
console.log(`Total dark: tokens removed: ${totalRemoved}`);
