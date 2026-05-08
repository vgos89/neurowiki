# Architect review — Wave 2: IVT Trial Schema Extension

**Decision:** approve-with-conditions
**Reviewed:** plan + implementation
**Reviewer:** system-architect (model: claude-opus-4)
**Date:** 2026-05-07

## Rationale
Wave 2 adds two optional fields to the `TrialMetadata` interface — `primaryAnalysisType` and `applicability` — and populates them across 21 IVT trials. The design is additive and non-breaking: no existing renderer logic is changed, no required fields are added, and the existing `specialDesign` field is preserved with a `@deprecated` JSDoc annotation rather than removed. The cardinality decision (Option C: primary + optional secondary, not an array) is correct for the rendering use-cases described and avoids the display-ordering complexity of unbounded arrays.

The `applicability` object shape is appropriately loose — all subfields optional — which gives Wave 3 content authors flexibility without locking the schema prematurely. The `evtContext` enum values (`evt-eligible`, `evt-ineligible`, `evt-co-treated`, `evt-unavailable`) map cleanly to distinct clinical and display-logic branches.

The enum vocabulary in `primaryAnalysisType` (`binary-superiority`, `ordinal-shift`, `noninferiority`, `bayesian-noninferiority`, `futility`, `dose-harm`, `negative`) constitutes a clinical taxonomy. Each term encodes a methodological and clinical meaning that affects how results are displayed and interpreted. This vocabulary must be gated by `clinical-reviewer` before the Wave 2 commit is finalized.

## Required follow-ups
- **[Blocking for commit]** `clinical-reviewer` sign-off on the `primaryAnalysisType` enum vocabulary — each value constitutes a clinical methodological claim about how results should be framed (§17.2 artifact required).
- **[Wave 3]** `TrialPageNew.tsx` must consume `primaryAnalysisType` for NNT suppression (Option Y: derive from `primaryAnalysisType` in renderer; no `showNNT` data field). This is a Wave 3 renderer task, not blocking Wave 2 data commit.
- **[Future]** When all 21 IVT trials are fully populated, a follow-up sweep should verify that no trial carries both `primaryAnalysisType` and a conflicting `specialDesign` value. The deprecated field can be removed in a subsequent Class D task once all call sites are confirmed migrated.

## Blocking issues
None for the schema and interface changes. Enum vocabulary clinical review is required before merge (see Required follow-ups above).
