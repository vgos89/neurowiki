/**
 * scripts/check-claims.ts — Pre-commit claim/citation scanner (Phase 1)
 *
 * Enforces per CLAUDE.md §13.5:
 *   Check 1 — Every claim tag in src/ resolves to a CLAIM_REGISTRY entry.
 *   Check 2 — Bidirectional surface cross-check: declared ↔ tagged.
 *   Check 3 — Every Citation has a current last_reviewed within its window.
 *             Skipped with warning when registry.ts is absent (before W5.2).
 *
 * Phase 1 surfaces (regex-based): jsx · data · computed
 *
 * Phase 2 TODO: plug in AST-based handlers for remaining §13.4 surfaces:
 *   const PHASE_2_HANDLERS = {
 *     computed: scanComputedSurfaces,   // claim() via full AST walk
 *     markdown: scanMarkdownSurfaces,   // <!-- @claim: claim-id -->
 *     json:     scanJsonSurfaces,       // "claim_id": "claim-id"
 *   };
 *
 * Usage:
 *   npm run check:claims
 *   tsx scripts/check-claims.ts [--src-root <path>] [--claims-file <path>] [--registry-file <path>]
 *
 * Exit 0 on pass. Non-zero on any failure. All failures reported before exit.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

// ── Config ─────────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function parseCliArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const out: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--') && args[i + 1] !== undefined) {
      out[args[i].slice(2)] = args[++i];
    }
  }
  return out;
}

const cli         = parseCliArgs();
const SRC_ROOT    = path.resolve(ROOT, cli['src-root']      ?? 'src');
const CLAIMS_FILE = path.resolve(ROOT, cli['claims-file']   ?? 'src/lib/citations/claims.ts');
const REG_FILE    = path.resolve(ROOT, cli['registry-file'] ?? 'src/lib/citations/registry.ts');

// ── Phase 1 regex patterns (CLAUDE.md §13.4) ──────────────────────────────

const ID = '[a-z0-9][a-z0-9._-]*';

// The claim text in `claim("...", "id")` is arbitrary clinical prose and WILL contain
// apostrophes ("the clinician's judgment", "doesn't"). The previous pattern used
// [^"']* for that argument, which excludes BOTH quote characters regardless of which
// one opened the string, so any tag whose text contained an apostrophe silently failed
// to match and the tag became invisible to every check below: a tagged claim would
// read as untagged, which is the false-sense-of-coverage failure §13.3 exists to stop.
//
// Fixed with an alternation of complete quoted strings (each terminated only by its own
// quote character, with escapes honoured). All groups are non-capturing so the claim ID
// stays capture group 1, which the extraction below relies on.
const QUOTED = `(?:"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|\`(?:[^\`\\\\]|\\\\.)*\`)`;

const PHASE1: Record<string, RegExp> = {
  jsx:          new RegExp(`\\bdata-claim=["'](${ID})["']`, 'g'),
  data:         new RegExp(`\\bclaimId\\s*:\\s*["'](${ID})["']`, 'g'),
  computed:     new RegExp(`\\bclaim\\s*\\(\\s*${QUOTED}\\s*,\\s*["'](${ID})["']\\s*\\)`, 'g'),
  bedsidePearl: new RegExp(`\\bbedsidePearlClaimId\\s*:\\s*["'](${ID})["']`, 'g'),
  // A registry claim tag written in BLOCK-COMMENT form:
  //
  //     /* claimId: annexa-i-andexanet-fxa-ich-2024 */
  //
  // Enforced identically to the quoted `claimId:` field above: same registry lookup
  // (Check 1), same surface rules (Check 2). Before this existed, writing a claim tag
  // as a comment made it invisible to every check below, which is the
  // false-sense-of-coverage failure §13.3 exists to stop. It found 3 on first run.
  //
  // THE DISCRIMINATOR IS THE SOURCE NOTE, NOT THE ID SHAPE. A bare annotation is a
  // registry claim tag; one carrying `| source: …` is a statistic-level provenance
  // note and is handled by Check 5 instead. An earlier version of this split on
  // whether the ID contained a dot, which was wrong: 107 provenance notes use
  // hyphenated IDs indistinguishable in shape from registry IDs, and requiring them
  // to exist in CLAIM_REGISTRY would have been a false failure on 107 correct
  // annotations. The `[^|*]` in the ID position is what keeps them apart.
  dataComment:  new RegExp(`/\\*\\s*claimId:\\s*(${ID})\\s*\\*/`, 'g'),
};

// ── Statistic-level provenance annotations ─────────────────────────────────
//
// A SECOND, separate convention lives in trialData.ts and is NOT a registry claim:
//
//     /* claimId: extend.sich       | source: NEJM 2019 Table 2 p.1800 */
//     /* claimId: eagle-safety-ae   | source: Schumacher Ophthalmology 2010 Table 3 */
//
// The ID names one STATISTIC or section on one trial, and the `source:` note is its
// provenance. There are 136. They must NOT be forced into CLAIM_REGISTRY: the
// registry maps a CLAIM to its CITATIONS, whereas these map a single number to the
// page of the paper it came from. Different jobs, and 107 of the 136 are not
// registered precisely because they were never meant to be.
//
// Nothing checked them either, so one could lose its source note, or be malformed,
// and stay invisible. An annotation that asserts provenance without giving any is
// worse than none, because it reads as checked. Check 5 enforces the contract: if it
// carries the `|` separator, the source must be non-empty.
const STAT_ANNOTATION = /\/\*\s*claimId:\s*([A-Za-z0-9_.-]+)\s*(\|\s*source:\s*([^*]*?))?\s*\*\//g;

// ── TS module loader ───────────────────────────────────────────────────────

type DynamicModule = Record<string, unknown>;

async function loadTsModule(filePath: string): Promise<DynamicModule> {
  const source = fs.readFileSync(filePath, 'utf8');
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  const dataUrl = `data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`;
  return import(dataUrl) as Promise<DynamicModule>;
}

// ── File walker ────────────────────────────────────────────────────────────

// lib/citations is the citation infrastructure itself — not a claim surface.
// Excluding it prevents false positives from JSDoc examples and type comments.
const EXCLUDE_DIRS = new Set(['node_modules']);
const EXCLUDE_PATHS = ['lib/citations']; // relative to SRC_ROOT

function walkSrc(dir: string): string[] {
  const out: string[] = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const rel  = path.relative(SRC_ROOT, full);
    const skip = EXCLUDE_DIRS.has(entry.name) || EXCLUDE_PATHS.some(p => rel.startsWith(p));
    if (entry.isDirectory() && !skip) {
      out.push(...walkSrc(full));
    } else if (!skip && /\.(tsx?|md)$/.test(entry.name)) {
      out.push(full);
    }
  }
  return out;
}

// ── Tag collection ─────────────────────────────────────────────────────────

interface Tag { claimId: string; surface: string; file: string; line: number; }

function collectTags(srcRoot: string): Tag[] {
  const tags: Tag[] = [];
  for (const file of walkSrc(srcRoot)) {
    const content = fs.readFileSync(file, 'utf8');
    for (const [surface, pattern] of Object.entries(PHASE1)) {
      const re = new RegExp(pattern.source, pattern.flags);
      let m: RegExpExecArray | null;
      while ((m = re.exec(content)) !== null) {
        const line = content.slice(0, m.index).split('\n').length;
        // A comment-form claim tag IS a data-surface tag. It differs only in how it
        // is written, so it must satisfy the same `surfaces: [DATA_SURFACE]`
        // declaration a quoted `claimId:` field would. Without this alias, Check 2
        // rejects every one of them as an undeclared surface.
        const surfaceType = surface === 'dataComment' ? 'data' : surface;
        tags.push({ claimId: m[1], surface: surfaceType, file: path.relative(ROOT, file), line });
      }
    }
  }
  return tags;
}

// ── Freshness ──────────────────────────────────────────────────────────────

const WINDOW_DEFAULTS: Record<string, number> = {
  guideline: 6, trial: 36, review: 6, textbook: 36, definition: 6,
};

function daysAgo(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000);
}

// ── Main ───────────────────────────────────────────────────────────────────

const failures: string[] = [];

const claimsMod = await loadTsModule(CLAIMS_FILE);
const CLAIM_REGISTRY = claimsMod['CLAIM_REGISTRY'] as Record<string, {
  citation_ids: string[];
  surfaces: Array<{ type: string }>;
}>;

const tags = collectTags(SRC_ROOT);

// Check 1 — Unregistered claim IDs
for (const tag of tags) {
  if (!CLAIM_REGISTRY[tag.claimId]) {
    failures.push(
      `Check 1 — Unregistered claim ID: "${tag.claimId}"\n` +
      `  at ${tag.file}:${tag.line}`,
    );
  }
}

// Check 2 — Surface cross-check (forward: declared → found)
for (const [id, entry] of Object.entries(CLAIM_REGISTRY)) {
  for (const surf of entry.surfaces) {
    if (!tags.some(t => t.claimId === id && t.surface === surf.type)) {
      failures.push(
        `Check 2 — Surface mismatch (forward): claim "${id}" declares "${surf.type}" surface ` +
        `but no matching tag found under ${path.relative(ROOT, SRC_ROOT)}/`,
      );
    }
  }
}

// Check 2 — Surface cross-check (reverse: found → declared)
for (const tag of tags) {
  const entry = CLAIM_REGISTRY[tag.claimId];
  if (!entry) continue; // already caught by Check 1
  if (!entry.surfaces.some(s => s.type === tag.surface)) {
    failures.push(
      `Check 2 — Surface mismatch (reverse): "${tag.surface}" tag for "${tag.claimId}" ` +
      `at ${tag.file}:${tag.line} not declared in registry surfaces`,
    );
  }
}

// Check 3 — Citation freshness (skipped if registry.ts absent)
if (!fs.existsSync(REG_FILE)) {
  process.stderr.write(
    `[check-claims] WARNING: ${path.relative(ROOT, REG_FILE)} not found — ` +
    `freshness check skipped. Expected before W5.2 lands.\n`,
  );
} else {
  const regMod = await loadTsModule(REG_FILE);
  const CITATION_REGISTRY = regMod['CITATION_REGISTRY'] as Record<string, {
    source: string;
    last_reviewed?: string;
    review_window_months?: number;
  }>;

  for (const [claimId, entry] of Object.entries(CLAIM_REGISTRY)) {
    for (const citId of entry.citation_ids) {
      if (!CITATION_REGISTRY[citId]) {
        failures.push(
          `Check 3 — Citation not found: claim "${claimId}" references ` +
          `"${citId}" which does not exist in registry.ts`,
        );
      }
    }
  }

  for (const [citId, cit] of Object.entries(CITATION_REGISTRY)) {
    if (!cit.last_reviewed) {
      failures.push(`Check 3 — Citation "${citId}" missing last_reviewed`);
      continue;
    }
    const window = cit.review_window_months ?? WINDOW_DEFAULTS[cit.source] ?? 6;
    const days = daysAgo(cit.last_reviewed);
    if (days > window * 30.44) {
      failures.push(
        `Check 3 — Citation "${citId}" stale: last reviewed ${cit.last_reviewed} ` +
        `(${days} days ago) exceeds ${window}-month window`,
      );
    }
  }
}

// ── Check 4 — NNT validity per trial-statistics design taxonomy ───────────
//
// Per `.claude/skills/trial-statistics/` Option Y rule and the 2026-05-19
// trial-statistician audit, `calculations.nnt` is valid only for designs
// that produce a single-event ARR-derivable NNT:
//   - binary-superiority      (standard ARR NNT)
//   - bayesian-superiority    (canonical exception, DAWN pattern)
//
// `calculations.nnt` MUST NOT be set for:
//   - ordinal-shift           (common OR is the right stat; binary NNT misleads)
//   - noninferiority          (NI doesn't yield a meaningful NNT)
//   - bayesian-noninferiority (same)
//   - single-arm-registry     (no comparator)
//   - estimation-strategy     (point-estimate framework, not threshold-based)
//   - dose-finding-safety     (safety endpoint, not efficacy)
//
// Grandfather list captures known offenders awaiting Class E fixes
// (Tier 1 #7 + #8 from docs/research/2026-05-19-trial-audit/). Remove from
// the list as each fix lands.

const NNT_VALID_DESIGNS = new Set<string>([
  'binary-superiority',
  'bayesian-superiority',
]);

// Trials with `ordinal-shift` design that are EXPLICITLY ALLOWED to keep
// calculations.nnt because they have a co-secondary binary endpoint with
// full prose disclosure throughout (pearls/cautions/applicability). These
// are NOT awaiting fix — the disclosure pattern is the canonical reference.
const NNT_EXPLICIT_ALLOW: Set<string> = new Set([
  // DEFUSE-3: ordinal mRS shift primary + coprimary mRS 0-2 binary (52% vs
  // 17%). NNT 3.6 with explicit "from coprimary mRS 0-2" disclosure. Canonical
  // reference for the disclosure pattern other 2015 EVT trials should adopt.
  'defuse-3-trial',
]);

const NNT_GRANDFATHERED: Set<string> = new Set([
  // Tier 1 #7 — 2015 EVT cluster: bare "NNT" labels appear in legend.keyStat
  // and bedsidePearl prose, not in calculations.nnt (those fields are unset
  // on these trials, so they don't currently trip this check). Listed here
  // for completeness so a future PR setting calculations.nnt on them is
  // caught by the grandfather WARN path rather than failing the build.
  'mr-clean-trial',
  'escape-trial',
  'revascat-trial',
  'swift-prime-trial',
  // 'best-msu-trial' removed 2026-05-20 — the original audit recorded
  // BEST-MSU's primary as ordinal-shift, but the NEJM 2021 full text shows
  // the primary outcome is utility-weighted mRS DICHOTOMIZED at ≥0.91
  // (approximates mRS 0-1, aOR 2.12, P<0.001). That is a binary-superiority
  // design and the NNT 12.5 is valid for the dichotomized primary. BEST-MSU
  // now carries primaryDesign='binary-superiority' / primaryResult='met'
  // and passes the NNT validity check naturally.
]);

const TRIAL_DATA_FILE = path.resolve(ROOT, 'src/data/trialData.ts');
if (fs.existsSync(TRIAL_DATA_FILE)) {
  try {
    const tdMod = await loadTsModule(TRIAL_DATA_FILE);
    const TRIAL_DATA = tdMod['TRIAL_DATA'] as Record<string, {
      id?: string;
      primaryDesign?: string;
      primaryResult?: string;
      calculations?: { nnt?: number | null };
    }> | undefined;
    if (TRIAL_DATA) {
      for (const [id, trial] of Object.entries(TRIAL_DATA)) {
        const nnt = trial?.calculations?.nnt;
        const design = trial?.primaryDesign;
        const result = trial?.primaryResult;
        if (nnt == null) continue;

        // A NULL design used to `continue` here, which silently exempted every
        // record that omits primaryDesign from the only hook-enforced NNT guard
        // in the repo. That is backwards: a record with no declared design is
        // exactly the one whose NNT nobody has validated. Records legitimately
        // omit the field when no enum member fits (PRIMA's continuous
        // mean-difference primary), and those records must not silently acquire
        // an NNT later. Found 2026-07-31 by trial-statistician.
        if (design == null) {
          failures.push(
            `Check 4 — NNT validity: trial "${id}" has calculations.nnt=${nnt} ` +
            `but declares no primaryDesign, so the NNT cannot be validated. ` +
            `Set primaryDesign, or remove the NNT.`,
          );
          continue;
        }

        // A NOT-MET primary has no valid superiority absolute risk difference,
        // so it has no valid NNT, whatever the design. Previously only the
        // design was checked, so a binary-superiority trial that MISSED its
        // primary could carry an NNT through the hook untouched.
        if (result != null && result !== 'met' && !NNT_EXPLICIT_ALLOW.has(id)) {
          failures.push(
            `Check 4 — NNT validity: trial "${id}" has calculations.nnt=${nnt} ` +
            `but primaryResult="${result}". Only a met primary supports an NNT: ` +
            `a null or noninferiority result has no valid superiority absolute ` +
            `risk difference. See .claude/skills/trial-statistics/.`,
          );
          continue;
        }

        if (!NNT_VALID_DESIGNS.has(design)) {
          if (NNT_EXPLICIT_ALLOW.has(id)) {
            // Permanently allowed — coprimary binary endpoint with full
            // disclosure throughout. Not awaiting fix.
            continue;
          }
          if (NNT_GRANDFATHERED.has(id)) {
            process.stderr.write(
              `[check-claims] WARN: Check 4 grandfathered — trial "${id}" has ` +
              `calculations.nnt=${nnt} on disallowed design "${design}". ` +
              `Awaiting Tier 1 fix (see docs/research/2026-05-19-trial-audit/).\n`,
            );
          } else {
            failures.push(
              `Check 4 — NNT validity: trial "${id}" has calculations.nnt=${nnt} ` +
              `but primaryDesign="${design}" does not support NNT. Valid designs: ` +
              `${[...NNT_VALID_DESIGNS].join(', ')}. See ` +
              `.claude/skills/trial-statistics/ for the rule.`,
            );
          }
        }
      }
    } else {
      process.stderr.write(
        `[check-claims] WARN: Check 4 skipped — TRIAL_DATA not exported from ` +
        `${path.relative(ROOT, TRIAL_DATA_FILE)}.\n`,
      );
    }
  } catch (e) {
    process.stderr.write(
      `[check-claims] WARN: Check 4 skipped — could not load ` +
      `${path.relative(ROOT, TRIAL_DATA_FILE)}: ${e instanceof Error ? e.message : e}\n`,
    );
  }
}

// ── Check 5 — statistic-level provenance annotations ──────────────────────
//
// Every `/* claimId: <dotted.id> | source: … */` annotation must carry a non-empty
// source. These annotate individual trial statistics with the page of the paper the
// number came from. Until now nothing read them at all, so a malformed or
// provenance-less one was invisible: it looked like a checked number and was not.
//
// Registry-shaped IDs (kebab-case, no dot) are NOT handled here. Those are real claim
// tags and are picked up by the `dataComment` pattern above, then run through Checks
// 1 to 3 exactly like a quoted `claimId:` field.
{
  let annotated = 0;
  let missingSource = 0;
  for (const file of walkSrc(SRC_ROOT)) {
    const content = fs.readFileSync(file, 'utf8');
    const re = new RegExp(STAT_ANNOTATION.source, STAT_ANNOTATION.flags);
    let m: RegExpExecArray | null;
    while ((m = re.exec(content)) !== null) {
      const id = m[1];
      // No `|` separator at all => a bare registry claim tag, already enforced above
      // by the `dataComment` pattern and Checks 1 to 3. Not our business.
      if (m[2] === undefined) continue;
      annotated += 1;
      const source = (m[3] ?? '').trim();
      if (source === '') {
        missingSource += 1;
        const line = content.slice(0, m.index).split('\n').length;
        failures.push(
          `Check 5 — Statistic annotation without provenance: "${id}" at ` +
          `${path.relative(ROOT, file)}:${line} declares a claimId but gives no ` +
          `"| source: …" note. Either add the source (journal, year, table or page) ` +
          `or remove the annotation. An annotation that asserts provenance without ` +
          `giving any reads as checked and is not.`,
        );
      }
    }
  }
  process.stdout.write(
    `[check-claims] Check 5 — ${annotated} statistic-level provenance annotation(s), ` +
    `${annotated - missingSource} with a source.\n`,
  );
}

// ── Output & exit ──────────────────────────────────────────────────────────

if (failures.length === 0) {
  process.stdout.write('[check-claims] All checks passed. ✓\n');
  process.exit(0);
} else {
  for (const f of failures) {
    process.stderr.write(`[check-claims] FAIL: ${f}\n`);
  }
  process.stderr.write(`\n[check-claims] ${failures.length} check(s) failed.\n`);
  process.exit(1);
}
