/**
 * check-guideline-mirror — verifies the in-repo 2026 AHA/ASA guideline mirror
 * against independently-verified citation text.
 *
 * WHY THIS EXISTS
 * ---------------
 * `src/data/aha2026StrokeGuideline.ts` declares itself a VALIDATION REFERENCE that
 * all stroke content "MUST be cross-checked against". Nothing checked the reference
 * itself. On 2026-07-30 it was found to render §4.7.3 (basilar EVT) split by TIME
 * WINDOW at COR 1/B-R and COR 2a/B-R, when the guideline stratifies by SEVERITY at
 * COR 1/LOE A and COR 2b/LOE B-R. It had been wrong for months, it produced FALSE
 * POSITIVES against correct content during an audit, and it nearly caused a correct
 * clinical recommendation to be downgraded.
 *
 * The markdown files that look like the primary source are not: they are the
 * Claude-authored build plans that GENERATED the mirror, so diffing against them
 * compares a transcription with its own draft. No PDF is checked in. The only
 * independently-reviewed guideline text in this repo is `quoted_text` on the
 * registered citations, which clinical-reviewer verifies per §13.6.
 *
 * WHAT THIS CHECKS
 * ----------------
 * For every recommendation in the mirror whose text is verbatim-contained in a
 * registered AHA-2026 citation's quoted_text, assert that the mirror's COR and LOE
 * match the strength recorded in that citation. A mismatch is the exact defect above
 * and fails the commit.
 *
 * It also holds a floor on coverage: if a recommendation that was previously verified
 * stops matching its citation (because someone edited the mirror text away from the
 * verified quote), the verified count drops and the check fails. That closes the
 * "silently drift away from the source" path.
 *
 * WHAT THIS DOES NOT CHECK
 * ------------------------
 * Most of the mirror. Coverage is reported honestly on every run precisely so the
 * unverified majority stays visible rather than being mistaken for validated. A
 * section becomes checkable only when someone reads the actual guideline and records
 * a verified quoted_text for it. Raising coverage is clinical work, not scanner work.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as MIRROR from '../src/data/aha2026StrokeGuideline';
import { CITATION_REGISTRY } from '../src/lib/citations/registry';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const LOCK = resolve(ROOT, 'scripts/guideline-mirror.lock.json');

interface Rec { cor: string; loe: string; text: string }
const isRec = (v: unknown): v is Rec =>
  !!v && typeof v === 'object' &&
  typeof (v as Rec).cor === 'string' &&
  typeof (v as Rec).text === 'string';

/** Strip the "(COR x, LOE y)" terminator and reduce to comparable word content. */
const norm = (s: string): string =>
  s.replace(/\(COR[^)]*\)\.?/gi, '').replace(/[^a-z0-9]+/gi, ' ').toLowerCase().trim();

/** Collect every recommendation in the mirror with its dotted path. */
function collectRecs(): { path: string; rec: Rec }[] {
  const out: { path: string; rec: Rec }[] = [];
  for (const [expName, exp] of Object.entries(MIRROR as Record<string, unknown>)) {
    if (Array.isArray(exp)) {
      exp.forEach((r) => { if (isRec(r)) out.push({ path: expName, rec: r }); });
    } else if (exp && typeof exp === 'object') {
      for (const [key, arr] of Object.entries(exp as Record<string, unknown>)) {
        if (Array.isArray(arr)) arr.forEach((r) => { if (isRec(r)) out.push({ path: `${expName}.${key}`, rec: r }); });
      }
    }
  }
  return out;
}

/**
 * Registered AHA-2026 citations, split into INDIVIDUAL recommendations.
 *
 * A single quoted_text routinely holds several recommendations, each ending in its
 * own "(COR x, LOE y)" terminator: aha-asa-2026-4.5 carries three (COR 1 / COR 2a /
 * COR 3 No Benefit). Reading only the first terminator and comparing every matched
 * mirror entry against it produces false mismatches on the correct entries, which is
 * exactly how a noisy check earns itself an --no-verify. Split first, then match each
 * mirror entry against the specific recommendation it reproduces.
 */
function collectQuotes() {
  const TERM = /\(COR\s+([^,)]+?)(?:,\s*LOE\s+([^)]+?))?\.?\)/gi;
  const out: { id: string; norm: string; cor: string | null; loe: string | null }[] = [];

  for (const c of Object.values(CITATION_REGISTRY as Record<string, any>)) {
    if (typeof c?.id !== 'string' || !c.id.startsWith('aha-asa-2026-') || !c.quoted_text) continue;
    const text = c.quoted_text as string;

    const parts: { body: string; cor: string | null; loe: string | null }[] = [];
    let last = 0;
    for (const m of text.matchAll(TERM)) {
      parts.push({
        body: text.slice(last, m.index!),
        cor: m[1]?.trim() ?? null,
        loe: m[2]?.trim() ?? null,
      });
      last = m.index! + m[0].length;
    }

    if (parts.length === 0) {
      // No machine-readable strength. Still usable for text verification, but the
      // strength comparison is skipped rather than guessed.
      out.push({ id: c.id, norm: norm(text), cor: null, loe: null });
      continue;
    }
    for (const p of parts) out.push({ id: c.id, norm: norm(p.body), cor: p.cor, loe: p.loe });
    // Trailing prose after the final terminator (rare) stays matchable, strength-free.
    const tail = text.slice(last);
    if (norm(tail).length > 20) out.push({ id: c.id, norm: norm(tail), cor: null, loe: null });
  }
  return out;
}

const errors: string[] = [];
const recs = collectRecs();
const quotes = collectQuotes();

const verified: { path: string; cite: string; text: string }[] = [];

for (const { path, rec } of recs) {
  const tn = norm(rec.text);
  if (!tn) continue;
  const hit = quotes.find((q) => q.norm.includes(tn));
  if (!hit) continue;

  verified.push({ path, cite: hit.id, text: rec.text.slice(0, 80) });

  // The strength fields are the never-drift core: this is the exact defect class.
  // Compare on alphanumerics only: the mirror writes "3: No Benefit" where the
  // guideline text writes "3 No Benefit". Same class, different punctuation.
  const strength = (v: string) => v.replace(/[^a-z0-9]/gi, '').toLowerCase();
  if (hit.cor && strength(rec.cor) !== strength(hit.cor)) {
    errors.push(
      `COR mismatch at ${path}\n` +
      `    mirror says   COR ${rec.cor}\n` +
      `    citation says COR ${hit.cor}   (${hit.id})\n` +
      `    text: ${rec.text.slice(0, 90)}...`
    );
  }
  if (hit.loe && strength(rec.loe) !== strength(hit.loe)) {
    errors.push(
      `LOE mismatch at ${path}\n` +
      `    mirror says   LOE ${rec.loe}\n` +
      `    citation says LOE ${hit.loe}   (${hit.id})\n` +
      `    text: ${rec.text.slice(0, 90)}...`
    );
  }
}

// ── Coverage floor ─────────────────────────────────────────────────────────
// A recommendation that silently stops matching its citation is drift away from
// the verified source, so the verified set may grow but must never shrink.
const lockExists = existsSync(LOCK);
const lock: { verifiedCount: number; verifiedPaths: string[] } = lockExists
  ? JSON.parse(readFileSync(LOCK, 'utf8'))
  : { verifiedCount: 0, verifiedPaths: [] };

const currentPaths = [...new Set(verified.map((v) => `${v.path}::${v.cite}`))].sort();

if (process.argv.includes('--update-lock')) {
  writeFileSync(LOCK, JSON.stringify({ verifiedCount: verified.length, verifiedPaths: currentPaths }, null, 2) + '\n');
  console.log(`[check-guideline-mirror] lock updated: ${verified.length} verified recommendation(s).`);
} else if (lockExists) {
  if (verified.length < lock.verifiedCount) {
    errors.push(
      `Coverage regression: ${lock.verifiedCount} recommendation(s) were verified against a citation, now ${verified.length}.\n` +
      `    A mirror text was edited away from its verified quoted_text, or a citation lost its quote.\n` +
      `    Lost: ${lock.verifiedPaths.filter((p) => !currentPaths.includes(p)).join(', ') || '(path set unchanged; a duplicate was removed)'}\n` +
      `    If the change is intended and re-verified, run: npx tsx scripts/check-guideline-mirror.ts --update-lock`
    );
  }
}

// ── Report ─────────────────────────────────────────────────────────────────
const sections = new Set(recs.map((r) => r.path));
const verifiedSections = new Set(verified.map((v) => v.path));

console.log('[check-guideline-mirror] Verifying the guideline mirror against verified citation text...\n');
console.log(`  recommendations in mirror : ${recs.length}`);
console.log(`  verified against a source : ${verified.length}`);
console.log(`  NOT verified              : ${recs.length - verified.length}  <- not checked by anything`);
console.log(`  sections                  : ${verifiedSections.size} of ${sections.size} with any verified content\n`);

if (errors.length) {
  for (const e of errors) console.log(`  \x1b[31mERROR\x1b[0m ${e}\n`);
  console.log(`[check-guideline-mirror] FAILED — ${errors.length} problem(s).`);
  process.exit(1);
}

console.log('[check-guideline-mirror] PASS.');
console.log(
  `  Note: ${recs.length - verified.length} of ${recs.length} recommendations have no independently-verified\n` +
  `  source in this repo and are therefore NOT validated by this or any other check.\n` +
  `  Raising that number requires reading the published guideline and recording a\n` +
  `  quoted_text per section; see TASKS.md guideline-mirror-verification-backlog.`
);
