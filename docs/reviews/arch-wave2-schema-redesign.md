# Architect review — Wave 2 schema redesign (design/result split)

**Decision:** approve-with-conditions
**Reviewed:** plan + implementation
**Reviewer:** system-architect (model: claude-opus-4)
**Date:** 2026-05-08

## Rationale
The split from a single conflated `primaryAnalysisType` enum into two orthogonal axes (`primaryDesign` × `primaryResult`, plus a parallel secondary pair) is the correct structural move and resolves the vocabulary collision that prompted clinical-reviewer to block the original schema. The two axes now read as what they are: design is "how the trial was set up to ask its question," result is "what answer it produced." `dose-finding-safety` cleanly replaces the former `dose-harm` design pseudonym, and `harm-stopped` / `terminated-administrative` / `futility-stopped` move into the result enum where they belong. The four-field shape also accommodates the genuine real-world case (ATTEST-2) where a single trial uses two statistical methods — the previous two-field shape could not express this without a coding hack. The change is additive, every field is optional, no existing required field is altered, and `applicability` / `evtContext` / the `@deprecated specialDesign` comment carry over from the original approval untouched.

The structural concern is not the split itself but its coexistence: the file now carries four overlapping result/design vocabularies (`primaryDesign`+`primaryResult`, `trialResult`, `resultSubtype`, `@deprecated specialDesign`), and only one of them has a stated migration path. The schema also encodes the design↔result pairing as a JSDoc invariant ("never render design without result") rather than as a type-level discriminated union, so the renderer is responsible for honoring it. Both are real but not blocking — the redesign itself is sound; what's missing is a coordination plan around the fields that already exist.

## Required follow-ups
- Document how `primaryDesign`/`primaryResult` relate to the existing `trialResult` enum and `resultSubtype` field. Either: (a) state that the new fields supersede them and add `@deprecated` JSDoc to `trialResult` + `resultSubtype` with a migration path matching `specialDesign`, or (b) state explicitly in the interface that they are intentionally parallel and serve different rendering surfaces. Without this, a future contributor will introduce a fifth vocabulary.
- When the first renderer is built that reads `primaryDesign`/`primaryResult`, add a runtime guard (or, preferably, refactor to a discriminated union: `primary?: { design: ...; result: ... }`) so the "never render design without result" invariant is enforced at the type level, not by reviewer vigilance. Defer this until consumption begins — premature now.
- Add a one-line note in the interface, near `primaryDesign`, listing the trials that pair `ordinal-shift` with `not-met` (the ATTEST-2 / TIMELESS / TWIST pattern). Flag it where future contributors will read it to avoid misinterpreting ordinal-shift as implying a positive result.
- The Option Y rule ("renderer suppresses NNT for ordinal-shift, noninferiority, and bayesian-noninferiority") lives in a JSDoc comment on `primaryDesign`. When the renderer ships, this rule needs to be a function in `src/lib/` or `src/utils/`, not duplicated in component code. Track as a follow-up to be created when consumption lands.

## Blocking issues
None.
