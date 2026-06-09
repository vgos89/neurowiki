#!/usr/bin/env node
/**
 * check-humanizer.mjs — site-wide AI-fingerprint scanner.
 *
 * Per .claude/skills/humanizer/SKILL.md, scans user-visible content for
 * the AI-writing patterns the skill catalogs. Designed to run in CI and
 * pre-commit (npm run check:humanizer).
 *
 * Scope is intentionally narrow: only fields/strings that the renderer
 * pipes to the user. Internal field names, file paths, comments, and
 * config strings are excluded. The goal is to catch new AI-style text
 * before it ships, not to flag every em-dash in the repository.
 *
 * SCANNED:
 *   - src/data/trialData.ts  (subtitle, bedsidePearl, bottomLineSummary,
 *     pearls items, howToReadChart.answer, howToInterpret.*, cautions,
 *     populationExclusions, inclusion/exclusionCriteria)
 *   - src/data/trial-questions.ts  (text, meta fields only — array values
 *     in trialIds are skipped, comments are skipped)
 *   - src/data/strokeClinicalPearls.ts  (content, plainEnglish)
 *   - src/data/guideContent.ts  (template-string body content)
 *   - src/pages/QuestionDetailPage.tsx  (visible prose)
 *   - src/pages/TrialsPage.tsx  (visible prose)
 *
 * NOT SCANNED:
 *   - Comments (// or block)
 *   - Import statements
 *   - JSX attribute names
 *   - Internal helper functions
 *
 * Each finding is severity-classified:
 *   ERROR   — hard AI tell (delve, leverage, in today's, tapestry, etc.)
 *   WARN    — soft AI tell (em-dash >1/paragraph, "not just X, but Y")
 *   INFO    — recommendation only (single em-dash joining clauses)
 *
 * Exit code: 0 if no ERROR, 1 if any ERROR. WARN does not fail the build
 * by default; pass --strict to treat WARN as failure.
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const ROOT = process.cwd();
const STRICT = process.argv.includes('--strict');

// ────────────────────────────────────────────────────────────────────────────
// Pattern definitions (sourced from .claude/skills/humanizer/SKILL.md)
// ────────────────────────────────────────────────────────────────────────────

const HARD_PHRASES = [
  // Signal phrases — delete on sight
  /\bit'?s worth noting\b/i,
  /\bit is worth noting\b/i,
  /\bit'?s important to note\b/i,
  /\bit is important to note\b/i,
  /\bit'?s crucial to\b/i,
  /\bit is crucial to\b/i,
  /\bit'?s essential to\b/i,
  /\bdelve into\b/i,
  /\bdeep dive\b/i,
  /\bin today'?s [a-z\s]*landscape\b/i,
  /\bin the realm of\b/i,
  /\bin the world of\b/i,
  /\bin conclusion,/i,
  /\bto put it simply,/i,
  /\bgoes without saying\b/i,
  /\bdue to the fact that\b/i,
  /\bmarks a pivotal moment\b/i,
  /\brepresents a significant shift\b/i,
  /\bbroader trends\b/i,
  /\bcutting-edge\b/i,
  /\bgame-chang(ing|er)\b/i,
  /\bstate-of-the-art\b/i,
  /\btapestry\b/i,
];

// AI-vocabulary cluster words. A single instance is INFO; a cluster of ≥3
// in the same string is WARN.
const VOCAB_CLUSTER = [
  'leverag', 'seamless', 'robust technical', 'vibrant', 'nestled', 'harness',
  'cultivat', 'foster', 'enhance', 'showcase', 'garner', 'bolster',
  'enduring', 'interplay', 'intricate', 'meticulous', 'pivotal', 'underscore',
];

// Specific structural patterns
const PATTERNS = {
  notJustButAlso: /\bnot just [^.!?]{2,40}, but (also )?\b/i,
  notXButY: /\bit'?s not [a-z]+, it'?s\b/i,
  despiteFaces: /despite its [a-z\s]{2,30}, [a-z\s]+ faces (challenges|limitations|concerns)/i,
  titleAsProperNoun: /\*\*[A-Z][A-Za-z0-9\s-]+\*\* refers to /,
};

// ────────────────────────────────────────────────────────────────────────────
// Targeted-extraction scanners
// ────────────────────────────────────────────────────────────────────────────

/**
 * For trialData.ts and trial-questions.ts: extract VALUE STRINGS only.
 * Skip comments, skip imports, skip field-name identifiers.
 */
function extractDataStrings(src) {
  const out = [];
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Strip line-comments
    const commentStart = line.indexOf('//');
    const code = commentStart >= 0 ? line.slice(0, commentStart) : line;
    // Extract all quoted strings (single, double, or backtick)
    const re = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      const str = m[1] ?? m[2] ?? m[3] ?? '';
      if (str.length < 8) continue;       // Skip short keys/identifiers
      if (/^\/[\w/-]+$/.test(str)) continue; // Skip paths
      if (/^[\w-]+:[\w-]+$/.test(str)) continue; // Skip kind:id keys
      out.push({ line: i + 1, text: str });
    }
  }
  return out;
}

/**
 * For .tsx files: extract JSX text content + string literal props.
 * Skip imports, function names, className strings, hex colors.
 */
function extractJsxStrings(src) {
  const out = [];
  const lines = src.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*import /.test(line)) continue;
    if (/^\s*(\/\/|\/\*|\*)/.test(line)) continue;
    const commentStart = line.indexOf('//');
    const code = commentStart >= 0 ? line.slice(0, commentStart) : line;
    const re = /'([^'\\]*(?:\\.[^'\\]*)*)'|"([^"\\]*(?:\\.[^"\\]*)*)"|`([^`\\]*(?:\\.[^`\\]*)*)`/g;
    let m;
    while ((m = re.exec(code)) !== null) {
      const str = m[1] ?? m[2] ?? m[3] ?? '';
      if (str.length < 10) continue;
      if (str.length > 500) continue;     // Likely a className or generated string
      if (/^[a-z][\w-]*(\s+[a-z][\w-]*)+$/i.test(str)) continue; // className-like
      if (/^#[0-9a-f]{3,8}$/i.test(str)) continue; // hex color
      out.push({ line: i + 1, text: str });
    }
    // Also capture JSX text content (lines that look like rendered prose).
    // Heuristic: lines with no quotes/braces, ≥3 words, starting with a capital.
    const trimmed = line.trim();
    if (
      trimmed.length > 20 &&
      /^[A-Z]/.test(trimmed) &&
      !trimmed.startsWith('//') &&
      !trimmed.startsWith('<') &&
      !trimmed.includes('=') &&
      !trimmed.includes('{') &&
      /\s/.test(trimmed)
    ) {
      out.push({ line: i + 1, text: trimmed });
    }
  }
  return out;
}

// ────────────────────────────────────────────────────────────────────────────
// Detection
// ────────────────────────────────────────────────────────────────────────────

function countEmDashes(s) {
  // Any em-dash (U+2014) in rendered text. En-dash (U+2013, used in numeric
  // ranges like 3–5 and CIs) is intentionally NOT matched — those are allowed.
  return (s.match(/—/g) || []).length;
}

function countVocabCluster(s) {
  const lower = s.toLowerCase();
  let n = 0;
  for (const v of VOCAB_CLUSTER) {
    if (lower.includes(v)) n += 1;
  }
  return n;
}

function detect(str) {
  const findings = [];
  for (const re of HARD_PHRASES) {
    if (re.test(str)) {
      findings.push({ severity: 'ERROR', rule: re.source, sample: str.slice(0, 120) });
    }
  }
  for (const [name, re] of Object.entries(PATTERNS)) {
    if (re.test(str)) {
      findings.push({ severity: 'WARN', rule: name, sample: str.slice(0, 120) });
    }
  }
  const dashCount = countEmDashes(str);
  if (dashCount >= 1) {
    // Em-dash in rendered prose is a hard AI tell and is BANNED in authored
    // content (CLAUDE.md S10.3). Replace with comma, colon, or parentheses.
    // The en-dash (U+2013) for numeric ranges (3-5, CIs) is allowed and is
    // not matched by countEmDashes.
    findings.push({
      severity: 'ERROR',
      rule: 'em-dash-banned',
      sample: str.slice(0, 120),
    });
  }
  const clusterCount = countVocabCluster(str);
  if (clusterCount >= 3) {
    findings.push({
      severity: 'WARN',
      rule: `vocab-cluster-${clusterCount}`,
      sample: str.slice(0, 120),
    });
  }
  return findings;
}

// ────────────────────────────────────────────────────────────────────────────
// File targets
// ────────────────────────────────────────────────────────────────────────────

const TARGETS = [
  { path: 'src/data/trialData.ts', extractor: extractDataStrings },
  { path: 'src/data/trialListData.ts', extractor: extractDataStrings },
  { path: 'src/data/trialCatalogMeta.ts', extractor: extractDataStrings },
  { path: 'src/data/trial-questions.ts', extractor: extractDataStrings },
  { path: 'src/data/strokeClinicalPearls.ts', extractor: extractDataStrings },
  { path: 'src/data/guideContent.ts', extractor: extractDataStrings },
  { path: 'src/pages/QuestionDetailPage.tsx', extractor: extractJsxStrings },
  { path: 'src/pages/TrialsPage.tsx', extractor: extractJsxStrings },
];

// ────────────────────────────────────────────────────────────────────────────
// Run
// ────────────────────────────────────────────────────────────────────────────

let errorCount = 0;
let warnCount = 0;
let infoCount = 0;

console.log('[check-humanizer] Scanning per humanizer skill v2 rules...\n');

for (const { path, extractor } of TARGETS) {
  const abs = resolve(ROOT, path);
  if (!existsSync(abs)) continue;
  const src = readFileSync(abs, 'utf8');
  const strings = extractor(src);
  const fileFindings = [];
  for (const { line, text } of strings) {
    for (const f of detect(text)) {
      fileFindings.push({ line, ...f });
    }
  }
  if (fileFindings.length === 0) continue;

  console.log(`\n${path}`);
  for (const f of fileFindings) {
    const tag = f.severity === 'ERROR' ? '\x1b[31mERROR\x1b[0m'
              : f.severity === 'WARN'  ? '\x1b[33mWARN \x1b[0m'
              : '\x1b[36mINFO \x1b[0m';
    console.log(`  ${tag} L${f.line}  [${f.rule}]  ${f.sample.replace(/\s+/g, ' ')}`);
    if (f.severity === 'ERROR') errorCount += 1;
    else if (f.severity === 'WARN') warnCount += 1;
    else infoCount += 1;
  }
}

console.log(`\n[check-humanizer] Summary: ${errorCount} ERROR, ${warnCount} WARN, ${infoCount} INFO`);

if (errorCount > 0) {
  console.log('\n\x1b[31m[check-humanizer] FAILED — hard AI tells present; rewrite per humanizer skill.\x1b[0m');
  process.exit(1);
}
if (STRICT && warnCount > 0) {
  console.log('\n\x1b[33m[check-humanizer] FAILED (--strict) — WARN-level issues present.\x1b[0m');
  process.exit(1);
}
console.log('\n[check-humanizer] PASS.');
process.exit(0);
