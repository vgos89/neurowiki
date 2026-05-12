# Clinical review — PR #phase2a

**Decision:** approve-with-conditions (condition: PR artifact explicitly frames scope; resolved in this document)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-11

## Scope
- Claims touched: none — pure UI rendering gate; no clinical text edited
- Citations affected: none
- Surfaces changed: static JSX conditional guards in `src/pages/trials/TrialPageNew.tsx` (8 sites: lines 540, 939, 1175, 1259, 1496, 1579, 1748, 2666)
- Evidence-verifier packet: not applicable — no clinical claim text changed
- Trial-statistician report: approved — NNT (1/ARD) is invalid for ordinal common-OR designs; inverting a common OR imposes an unspecified binary dichotomization the trial never pre-specified

## SCOPE STATEMENT — THIS IS A DEFENSIVE JSX GATE ONLY

This PR closes 8 JSX bypass sites that read `trialMetadata.calculations?.nnt` without checking `stats.suppressNNT`. It does NOT complete NNT suppression for ordinal-shift trials. Residual NNT prose (nntExplanation, pearls, legend.keyStat) exists in `trialData.ts` for DEFUSE-3, SELECT2, and ANGEL-ASPECT and renders through other code paths not gated by this fix. That data-layer cleanup is a separate follow-up task (see Required follow-ups).

## Semantic validity

Fix is mechanically correct. The 8 bypass sites now match the canonical gated render site at line 7353:
- Before: `{trialMetadata.calculations?.nnt != null && (`
- After: `{trialMetadata.calculations?.nnt != null && !stats.suppressNNT && (`

`stats.suppressNNT` is computed once in the parent useMemo (lines 205–209) from `NNT_SUPPRESSED_DESIGNS.includes(trialMetadata.primaryDesign!)`. Semantics are identical to the canonical path. No claim text was changed — the five never-drift categories do not apply to this UI gate change.

The 8 bypass sites are in custom JSX blocks for EXTEND, WAKE-UP, CHANCE, POINT, SPARCL, THALES, BEST-MSU, TRACE-III — all currently binary-superiority trials where NNT is statistically valid. The fix is preventive: it closes the bypass before any future ordinal-shift trial gets custom JSX that would silently leak an invalid NNT display.

Confirmed: DEFUSE-3/SELECT2/ANGEL-ASPECT currently render NNT through the canonical gated path at line 7353 (already correct). The 8 fixed sites do not currently display invalid NNT for these trials.

Residual gap (not a regression from this PR): `trialData.ts` prose for DEFUSE-3 (lines 4628–4633, 4648), SELECT2 (lines 4791–4793), ANGEL-ASPECT (lines 4868–4870) contains `nntExplanation`, pearl text, and `legend.keyStat: 'NNT X.X'` that propagate the statistically-invalid NNT claim through pearl lists, tooltip surfaces, and legend tiles. These predate this PR and are tracked in the follow-up task below.

## Citation accuracy
Not applicable — no citations modified.

## Freshness
Not applicable — no citations modified.

## Rationale

The 8 JSX gate additions are mechanically correct, statistically endorsed by trial-statistician, and do not alter any clinical claim, recommendation, or interpretation. The pre-merge condition (clear scope framing) is satisfied by the SCOPE STATEMENT section above. The approve-with-conditions decision is issued rather than a clean approve because the data-layer residual NNT prose in trialData.ts remains unaddressed — merging without this note would misrepresent the completion state of ordinal-shift NNT suppression.

## Required follow-ups

**Deferred (post-merge — tracked as new TASKS.md item):**
1. Class E follow-up: clean up `nntExplanation`, pearl text, and `legend.keyStat` NNT prose from DEFUSE-3 (lines 4628–4633, 4648), SELECT2 (lines 4791–4793), ANGEL-ASPECT (lines 4868–4870) in `src/data/trialData.ts`. Either replace with ordinal-appropriate cOR framing or gate every consumer of these fields behind `stats.suppressNNT`. Trial-statistician must sign off on approach.
2. Systematically audit all trials with `primaryDesign ∈ NNT_SUPPRESSED_DESIGNS` for NNT prose in `bedsidePearl`, `keyMessage`, `howToInterpret`, `pearls`, `nntExplanation`, `legend.keyStat`, `bottomLineSummary`, `listDescription`, and Q&A `answer` fields.
3. Add regression check (Phase 5A scope): fails if any trial with `primaryDesign ∈ NNT_SUPPRESSED_DESIGNS` has a non-null `calculations.nnt` that reaches a non-gated render surface.
4. Consider refactor: switch the 8 fixed sites from `trialMetadata.calculations?.nnt` to `stats.nnt` (already gated through isNegativeTrial + suppressNNT + ARR>0 in useMemo) to unify all NNT renders on a single computation path.
