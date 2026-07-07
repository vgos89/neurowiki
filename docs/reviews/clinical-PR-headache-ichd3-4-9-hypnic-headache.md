# Clinical review — ICHD-3 §4.9 Hypnic headache (new diagnosis)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (new diagnosis) · headache clinic pathway engine

## Scope
- **Claims touched:** new `clinic-headache-ichd3-hypnic-criteria` (§4.9).
- **Citations affected:** `ichd3-2018` (`quoted_text` += verbatim §4.9 A–F + Notes 1–2 + §4.9.1 A–E; `section` += 4.9). `last_reviewed` 2026-05-25, within window.
- **Surfaces changed:** new phenotype criteria surface (registered via `HiddenClaimMarkers`), 3 new chips, new `sleep-only` onset option + `b-hypnic` branch question.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/headacheBanding.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-4-9-hypnic-headache.md` (ICHD-3 PDF p.54-55 verbatim, HIGH confidence; §8 non-applicability explicitly stated).

## The design decision — `hypnic-E` as suppress-gate EMIT: AFFIRMED (correct clinical + safety call)
Both readings are defensible on the page, but only suppress-EMIT is safe in a decision-support engine. Under a demote-gate encoding, a patient with only-during-sleep + confirmed frequency + confirmed duration **but with autonomic features/restlessness** would surface as "Probable hypnic §4.9.1" — because the engine cannot enforce §4.9.1's own criterion D ("not fulfilling ICHD-3 criteria for any other headache disorder"), the cross-phenotype cluster/TAC check that autonomic features trip. That pushes the clinician toward hypnic in exactly the scenario §4.9 Note 1 ("distinction from the trigeminal autonomic cephalalgias, especially 3.1 Cluster headache, is necessary") demands the opposite. Suppress-EMIT fails safe: contradicting evidence sets hypnic aside with a visible reason, while the §4.9.1 two-of-three near-miss branch stays reachable for the benign single misses (C or D absent, E intact). §4 clinical-safety-first, correctly applied. Verified by trace + the EMIT-on-autonomic test (`definitionallyExcluded === true`, never probable).

## Semantic validity
- **Numeric watch-points all correct:** `freq-ge-10-per-month` (≥10, NOT ≥15 — chip teach text carries an explicit guard); `dur-15min-to-4h` (15 min–4 h, NOT 180 min); criterion E a single combined exclusion (`!autonomic && !restlessness`). No never-drift drift.
- **No fabricated criteria:** lithium/caffeine/melatonin/indomethacin appear only in the teachPearl as "reported treatments but NOT diagnostic criteria"; no treatment-response gate added.
- **teachPearl faithful:** "usually begins after age 50 (late onset alone is not a red flag here)" matches p.55 Comments + packet (late onset is *typical*, must not block); secondary rule-outs (sleep apnoea, nocturnal HTN, hypoglycaemia, MOH, intracranial) match Note 2 exactly.

## Citation accuracy & freshness
`ichd3-2018` `quoted_text` §4.9 + §4.9.1 verbatim block matches the packet on every criterion and threshold; `section` includes 4.9; claim resolves to the live registry entry and renders on a real JSX surface. `last_reviewed` within 24-month window; source re-read verbatim this session; no §13.6 refresh required. (The reviewer's non-blocking note — §4.9 Note 1 had been compressed to "3.1 Cluster headache" — was **applied in this commit**: `quoted_text` Note 1 now reads "the trigeminal autonomic cephalalgias, especially 3.1 Cluster headache.")

## Mandatory-block check
All eight cleared (source resolves; quoted_text supports the claim; bindings register the surface; packet §8 non-applicability explicitly stated for a classification entry).

## Rationale
A faithful Class E encoding of §4.9 with the one genuine design tension (criterion-E role) resolved correctly toward clinical safety (suppress-EMIT → cluster steer). All numeric watch-points correct, no fabricated criteria, all bindings resolve within window.

## Required follow-ups
- None blocking. (Applied in-commit: widened the §4.9 Note-1 phrasing in `quoted_text` to name the TACs, not just cluster.)

## Verification state at gate time
- `check:claims` passes; `npx vitest run` → 232/232 (incl. 4 §4.9 tests: full / Probable §4.9.1 / EMIT-on-autonomic / drop-without-sleep-substrate); `tsc --noEmit` clean; `check:humanizer` PASS.
