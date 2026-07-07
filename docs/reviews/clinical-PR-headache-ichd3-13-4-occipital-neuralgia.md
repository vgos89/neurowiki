# Clinical review — ICHD-3 §13.4 Occipital neuralgia (new diagnosis)

**Decision:** approve-with-conditions (condition C1 applied pre-commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (new diagnosis) · headache clinic pathway engine

## Scope
- **Claims touched:** new `clinic-headache-ichd3-occipital-neuralgia-criteria` (§13.4).
- **Citations affected:** `ichd3-2018` (§13.4 verbatim added to `quoted_text` + `section`). `last_reviewed` 2026-05-25, window 24 months → within window.
- **Surfaces changed:** new phenotype criteria surface (registered via `HiddenClaimMarkers`), 5 new chips, new `b-occipital` branch question.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/headacheBanding.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`.
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-06-ichd3-13-4-occipital-neuralgia.md` (ICHD-3 PDF p.176 verbatim, HIGH confidence).

## Semantic validity
Faithful for on-A/on-C/on-D and the on-B ≥2-of-3 count against verbatim §13.4 A–D. `on-C` correctly encodes C1 AND (C2a OR C2b) via the tenderness-or-trigger disjunction chip. `on-D` block-response is a mandatory lettered criterion — `hiddenUntilTrial` + suppress-gate placement faithful, mirrors HC/PH indomethacin. Differential steer in teachPearl faithful to the p.176 Comment.

**Three ruled-on decisions upheld:**
1. **`on-B` as a boolean suppress-gate** (`countOf-style >= 2`) is correct — §13.4 has no §13.4.5 Probable tier, so a scorable near-miss would surface a homeless `probable` band; the suppress-gate delivers the required full-or-nothing (consistent with the tn-B ruling and sm-C1).
2. **Criterion D as `hiddenUntilTrial` + suppress-gate** is faithful — the nerve-block response is a mandatory lettered ICHD-3 criterion (unlike carbamazepine-for-TN, which the source does NOT list as a criterion).
3. **Dedicated laterality-agnostic `loc-occipital-nerve` chip** is correct — §13.4 A permits bilateral pain, so reusing `loc-unilateral` would import a constraint the source does not impose.

## Condition (applied before commit)
- **C1 — criterion B.3 "shooting" coverage.** §13.4 B.3 is "shooting, stabbing **or** sharp"; the reused `qual-sharp-stabbing` chip was labeled only "Sharp or stabbing," and `on-B` counted only that chip — a shooting-quality occipital patient could be under-counted on criterion B (and could fail to reach the `b-occipital` branch, which fires on `qual-sharp-stabbing`). **Resolved:** (a) the primary quality option label and the shared `qual-sharp-stabbing` chip label now read "Sharp, stabbing, or shooting" (so a shooting patient selects it, reaches the branch, and is credited); (b) `on-B` now counts B.3 as one characteristic satisfied by either `qual-sharp-stabbing` OR `qual-electric-shock-shooting` (no double-count). Verified: 228/228 tests still pass; the shared-chip consumers (§4.7 stabbing, TN, ON) all read correctly with the expanded label; migraine/TTH do not use this chip.

## Citation accuracy & freshness
`ichd3-2018` §13.4 `quoted_text` matches the evidence-packet §4 transcription word-for-word (A–E + Comment); `section` includes 13.4; the claim resolves to the live registry entry and renders on a real JSX surface. `last_reviewed` within window; §13.4 read verbatim this session; no §13.6 refresh required.

## Rationale
A faithful, verbatim-anchored encoding of §13.4 with all three design decisions upheld (on-B full-or-nothing suppress; on-D mandatory-block hiddenUntilTrial; laterality-agnostic loc chip). The single Category-3 gap (B.3 "shooting" under-representation) was corrected pre-commit as C1.

## Required follow-ups (non-blocking)
- **Advisory:** Note 1 ("There may or may not be simultaneous dysaesthesia") intentionally not encoded — criterion C.1 formally requires dysaesthesia/allodynia; Note 1 attaches only to the prose Description. No action.
- **Advisory:** `compliance-legal` to confirm verbatim ICHD-3 criteria on a public surface is within the IHS educational-use grant before public deploy (applies to all ICHD-3 phenotype surfaces, not just §13.4).

## Verification state at gate time
- `check:claims` passes; `npx vitest run` → 228/228 (incl. 4 §13.4 tests: full / hiddenUntilTrial-hides-until-block / on-B-only-1-of-3-drops / on-C-both-required-drops); `tsc --noEmit` clean; `check:humanizer` PASS.
