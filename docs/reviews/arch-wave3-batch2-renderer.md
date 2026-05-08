# Architect review — Wave 3 Batch 2 (renderer schema wiring)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-08

## Rationale

The plan is structurally sound for a Wave 3 wiring step. It replaces brittle string-sniffing heuristics with a typed schema gate, preserves the legacy branch as a clean fallback for un-migrated trials, and is contained to one file with a trivial revert path. The `hasSchemaDriven` union gate is the right call given the Wave 2 schema requires `primaryDesign` and `primaryResult` to be rendered together. What's risky is the accretion of classification logic inside the existing `stats` useMemo: that block was already over-stuffed (mixing flags with raw stats) and this change adds more flags plus pass-through fields against a Wave 4 consumer that does not yet exist. The classifier is exactly the kind of pure function that wants to live in `src/lib/trials/`, and extracting it now would make Wave 4's archetype components plug in cleanly instead of importing display state from this page. The `hasSchemaDriven` boolean gate is the right backward-compat strategy; per-field gates would allow silent half-migrations. The `as never` casts are a type-system gap — replaceable with `ReadonlyArray<TrialMetadata['primaryDesign']>`.

## Required follow-ups

- Replace `as never` casts with `ReadonlyArray<TrialMetadata['primaryDesign']>` (and the matching `primaryResult` union type). Type-safe and self-documenting; no runtime change.
- In the `hasSchemaDriven` branch, assert that both `primaryDesign` and `primaryResult` are present together; warn in dev if only one is set on a trial. Prevents silent half-migrations from picking inconsistent branches.
- Before Wave 4: extract the classifier into `src/lib/trials/classifyTrial.ts` returning a typed `TrialClassification` object (`{ isNegative, suppressNNT, isNI, isBayesianSuperiority, isEstimation, designType, resultType }`). The `stats` useMemo and any Wave 4 visualization component should both consume it. Do not let Wave 4 components reach into `stats` for these flags.
- Defer `designType` and `resultType` pass-through fields on `stats` until Wave 4 actually consumes them. Shipping unread fields creates implicit API surface.
- File a tracking task: decide whether the EXTEND canary (lines 358+) migrates onto the schema-driven path or is formally retired as a one-off. Wave 4 archetype components should not have to support two divergent rendering paths.

## Blocking issues

None.
