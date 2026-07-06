# Clinical review — ICHD-3 §13.1.1 Trigeminal neuralgia (new diagnosis, clinical parent)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (new diagnosis) · headache clinic pathway engine

## Scope
- **Claims touched:** new `clinic-headache-ichd3-trigeminal-neuralgia-criteria` (§13.1.1).
- **Citations affected:** `ichd3-2018` (`quoted_text` += verbatim §13.1.1 A–D + Note 4 + aetiology subtree; `section` += 13.1.1). `last_reviewed` unchanged (within window).
- **Surfaces changed:** new phenotype criteria surface (registered via `HiddenClaimMarkers`), 4 new chips, new `b-trigeminal` branch question.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/headacheBanding.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-13-1-trigeminal-neuralgia.md` (ICHD-3 PDF pp.166-169 verbatim, HIGH confidence).

## The escalated decision — `tn-B` suppress-gate vs demote-gate: CONFIRMED suppress (binary full/hidden)
ICHD-3 Chapter 13 has **no §13.1.5 Probable trigeminal neuralgia**. A demote-gate on `tn-B` would route a feature-miss into the `strength = 'probable'` branch pointing at a non-existent §X.5 section (or mislabel via the `?? ichd3Section` fallback) — clinically false, since a patient not meeting criterion B is *unclassified*, not "probable TN." Making all three criteria (`tn-A`/`tn-B`/`tn-C`) DROP-set suppress-gates yields the correct binary behavior (TN surfaces only on the complete A+B+C picture, else hidden), proven by the "feature miss → absent" test. Consistent with the `sm-C1` precedent. Suppress is right; do not demote.

## Semantic validity (no never-drift violations)
- `tn-A` (`loc-unilateral && loc-trigeminal-distribution`, suppress): faithful to A + Note 1 (no radiation beyond).
- `tn-B` (`dur-fraction-sec-to-2min && sev-severe && (qual-electric-shock-shooting || qual-sharp-stabbing)`, suppress): exact "all of / any-one-of-quality" structure; temporal window (≤2 min) and severity ("severe" only) preserved.
- `tn-C` (`trigger-innocuous-stimulus`, suppress): faithful to C + Note 4 (trigger required even when attacks appear spontaneous).
- **No fabricated criteria:** no carbamazepine-response gate; drug response appears only in the teachPearl, explicitly labeled "supports the diagnosis clinically but is NOT an ICHD-3 criterion" (faithful to the §13.1.1.1.1 comment).
- **Secondary-TN red-flag steer** faithful to §13.1.1.2 Note 1 and clinically sound (sensory deficit / bilateral / age <40 / poor drug response → MRI + refer; causes MS / CPA tumour / AVM).
- **No conflation with §13.1.2** painful trigeminal neuropathy — only the paroxysmal trigger-provoked neuralgia encoded.

## Two-stage scope — confirmed clinically safe
Encoding only Stage 1 (flat clinical parent §13.1.1 A–C) as Class E, with the classical/secondary/idiopathic aetiology deferred to the subtype-hierarchy layer (ADR-2026-07-06, pending) and carried as teachPearl guidance + a secondary-TN imaging/referral steer, is appropriate: aetiology subtyping needs MRI/electrophysiology results the chip engine does not collect, and a three-way exclusive investigation branch cannot be expressed in the current single-gate shape. A flat TN match + imaging/referral steer does not overstate aetiology certainty.

## Citation accuracy & freshness
`ichd3-2018` resolves (PMID 29368949). Extended `quoted_text` reproduces §13.1.1 A–C + D + Note 4 verbatim; `section` includes 13.1.1; claim maps to the live registry entry and renders on a real JSX surface. `last_reviewed` 2026-05-25, window 24 months → within window; §13.1.1 read verbatim this session; no §13.6 refresh triggered.

## Mandatory-block sweep
All eight cleared (no drift; single source; citation resolves; quoted_text supports claim; artifact = this file; no refresh performed; not a trial PR; §8 trial-editorial not applicable to a classification entry).

## Rationale
A faithful, verbatim-anchored encoding of §13.1.1 with correct structural handling of the "no Probable-TN section" problem (suppress, not demote — a demote would manufacture a non-existent diagnostic category). No fabricated criteria, no §13.1.2 conflation, faithful secondary-TN red-flag steer, all bindings resolve within window.

## Required follow-ups (non-blocking)
- **Stage 2 aetiology subtyping** (classical/secondary/idiopathic) deferred pending ADR-2026-07-06 approval + the subtype-hierarchy layer. When it lands, add distinct claim bindings for §13.1.1.1/.2/.3 with investigation-gated criteria and re-gate.

## Verification state at gate time
- `check:claims` passes; `npx vitest run` → 224/224 (incl. 5 §13.1 tests, incl. the no-Probable-TN drop test); `tsc --noEmit` clean; `check:humanizer` PASS.
