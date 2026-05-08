# Architect review — Batch 3 Wave 2 (data population: 13 secondary-prevention trials)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (trialData.ts entries; TrialPageNew.tsx renderer gate; BottomLineDrawer.tsx SAFETY_MET consumer)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-08

## Rationale

Single-file data-population wave against an interface that shipped in Wave 1 (commit 657f004). Structural blast radius is narrow: no interface change, no renderer change, no new module, no new dependency. Every proposed `(primaryDesign, primaryResult)` pair is legal per the schema's documented pairing table (lines 278–286). ELAN's deliberate omission of both fields is consistent with the documented "estimation-strategy → leave both null" contract at line 285, and the renderer's `bothSchemaFieldsSet` fallback gate handles the absent pair without regression.

The risks are vocabulary and surface-introduction risks, not structural-shape risks. WEAVE will carry four parallel encodings of the same "single-arm safety-threshold" concept: `archetypeId: 'G'` + `trialResult: 'SAFETY_MET'` (legacy, still consumed by BottomLineDrawer) and now `primaryDesign: 'single-arm-registry'` + `primaryResult: 'safety-threshold-met'` (new, consumed by TrialPageNew renderer after Wave 3). Neither vocabulary is being retired in this PR — acceptable as debt, not acceptable as long-term state.

`harmSignal` is being populated for the first time on 6 entries. No renderer reads the field yet. This means (a) semantic errors in `harmSignal` text do not immediately surface to clinicians, which is a staged-rollout benefit; and (b) the §13.5 pre-commit hook will not detect untagged claims in `harmSignal` because the CLAIM_REGISTRY is the empty-stub state (W5.2 not yet landed). The hook passes on metadata grounds but cannot validate semantic correctness. This is the §13.1 metadata-vs-medical-validity situation. It is handled by the clinical-reviewer pre-execution gate and a documented follow-up for claim tagging.

On the three architect questions:

1. **ELAN omission is correct** — "estimation-strategy → leave both null" is the documented schema contract; a stub result pairing would require a new result value or a renderer change. Keep null.
2. **`harmSignal` populating 6 of 13 this wave is structurally acceptable** — field is documented with a 120-char cap and authoring guidelines (lines 316–328); harm-signal content is a clinical reviewer gate, not an architect gate.
3. **WEAVE quad-vocabulary: approve as-is** — vocabulary consolidation is the separate ADR follow-up; blocking this wave for a pre-existing structural debt is disproportionate.

## Required follow-ups

- **`harmSignal` claim-surface tagging:** the field ships untagged (no adjacent `claimId` per §13.4 Phase 1). The clinical-reviewer pre-execution gate is the semantic validation. Track: when W5.2 populates the registry, each `harmSignal` entry needs a paired `claimId` and a registry record with `quoted_text`. Document this as `blocked:awaiting-registry-population` in TASKS.md.
- **PR body note:** state explicitly that `harmSignal` is data-only this wave — no renderer reads the field. Prevents reviewers from expecting a UI change.
- **ADR (separate Class D task, non-blocking):** retire `archetypeId` + `trialResult` in favor of `primaryDesign` + `primaryResult` once Wave 3+ population is complete. Mark the legacy fields `@deprecated`. Third consecutive batch deferral — must not slip to Batch 4.
- **Verify `applicability` field consumption** before the next batch populates it further. Currently zero call sites outside the data layer.

## Blocking issues

None. Clinical-reviewer pre-execution gate required for `harmSignal` text — in progress.
