# Architect review — ICAD trial refresh (Phase 1)

**Decision:** approve-with-conditions
**Reviewed:** plan + implementation
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-07-22

## Scope reviewed
Additive trial-catalog content. Phase 1 ships two new trial cards (`cassiss-trial`, `basis-trial`, both archetype A), the `icas-stenting` question wiring, the synthesis rewrite, three new/corrected citations, and the CASSISS PMID correction. WOVEN (`woven-trial`, archetype G) was pulled from this phase and deferred to Phase 2 because its single-arm data cannot render safely through the current trial-page renderer (hardcoded to WEAVE for the archetype-G benchmark chart); that is a clinical-render finding tracked separately.

## Rationale
Textbook additive trial-catalog content that holds up structurally. The two new records mirror the SAMMPRIS archetype-A reference (trialData.ts:8824) field-for-field, introduce no new fields, and carry only values already legal in the type unions: `archetypeId` (A, :244), `trialResult` (NEUTRAL/POSITIVE, :204), `primaryDesign` (binary-superiority, :361), `primaryResult` (not-met/met, :377). No new archetype, no new rendering path, no new component, no new dependency, no schema change, no state. The change reuses the existing composable archetype system exactly as intended (duplication, composability, dependency-weight, state-locality rubric items all clean). Boundaries respected: trial data in trialData.ts, citations in registry.ts, claim bindings in claims.ts.

The `bedsidePearlClaimId` binding is not a new pattern. The field is typed (trialData.ts:240), registered as a scannable surface (schema.ts:75), and already used by an existing trial. Binding each new trial's primary-result claim there, instead of WEAVE's inline `/* claimId */` comment (which the scanner cannot match and which is not registered), is a deliberate consolidation onto the scanner-recognized surface: a boundary-integrity improvement, not drift.

The primary failure mode for this class of change, partial registration, is absent. Both new IDs appear consistently across every surface: trialData.ts, trialCatalogMeta.ts, trialListData.ts (legacyTrialCategories → secondary-prevention), trialListData.cardmeta.generated.ts (regenerated, 110 entries), trial-questions.ts, registry.ts, claims.ts. `trialCount 4` matches `trialIds.length 4`; chronology ordered (2011 → 2019 → 2022 → 2024); `findTrialById` resolves both via restoredLegacyTrials. WOVEN leaves no dangling card reference (verified: zero `woven-trial` card-ID references remain; the `alexander-woven-2021` citation and the synthesis prose mention are intentional).

## Required follow-ups
- **Rollback note (this condition is satisfied):** present at `docs/reviews/rollback-icad-refresh.md`. The change is additive across registration surfaces with no schema or shared-abstraction modification, so revert is a mechanical deletion of the two IDs per surface plus reverting the CASSISS citation correction and the synthesis prose. Low cost.
- Phase 2 (WOVEN) requires a code change to the trial-page renderer and the benchmark-threshold component to display a single-arm result without a fabricated two-bar comparison and without a pass/fail pill against a non-pre-specified threshold. Route through ui-architect + trial-statistician + clinical-reviewer. Out of scope for Phase 1.

## Blocking issues
None.
