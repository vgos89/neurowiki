# Architect review — Batch 3 Wave 1 (schema extensions: estimation-strategy, single-arm-registry, safety-threshold-met, harmSignal)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (trialData.ts interface; TrialPageNew.tsx consumers; BottomLineDrawer.tsx; trialNarrative.ts; DeltaBandChart.tsx)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-08

## Rationale

The plan extends two existing unions and adds one new annotation field. Touched scope is small (one file, ~35 lines of interface + JSDoc, no data population this wave) and the migration exit is trivial — additive optional unions on a pre-existing interface. The unions follow the conventions Batch 2 established and stay inside the `src/data/` boundary. No boundary crossings, no new packages, no state changes.

The structural concern is **rubric 1, duplication risk**, which this plan does not solve and modestly worsens. The codebase carries four parallel vocabularies for "what kind of trial / what was the result": `trialResult` (legacy 7-value enum, actively read by BottomLineDrawer), `specialDesign` (deprecated string, but still the live branch at TrialPageNew.tsx:178 for estimation-trial NNT suppression), `archetypeId` (drives layout selection), and `primaryDesign` + `primaryResult` (Batch 2 unions, currently **pure data — no consumer switches on them yet**). Adding `'estimation-strategy'` is the *third* way to flag ELAN-style trials; adding `'single-arm-registry'` + `'safety-threshold-met'` is the *fourth* way to flag WEAVE-style benchmark trials, which already have `archetypeId: 'G'`, `trialResult: 'SAFETY_MET'`, and a structured `benchmark`/`observedEventRate` block. The new values are not wrong — they correctly model what these trials are — but they ship without any consumer pruning the redundancy. This is how vocabulary debt compounds.

On the specific architecture questions:

1. **`estimation-strategy` on `primaryDesign`** — defensible. `primaryDesign` is "statistical framework for the primary analysis" and an estimation strategy is a framework choice. A separate `studyType` would be cleaner ontologically but introducing a fifth vocabulary to fix a four-vocabulary problem goes the wrong direction. Stay on `primaryDesign`.
2. **`safety-threshold-met` on `primaryResult`** — semantically awkward but acceptable. The other result values are frequentist comparator outcomes; `safety-threshold-met` is a one-sample threshold check. The renderer drives Archetype G off `benchmark`/`observedEventRate`, not off `primaryResult`. Adding this value is a labeling change with no rendering consequence today — acceptable, but requires a clear JSDoc note (applied inline in the commit).
3. **`harmSignal?: string`** — the right shape. A boolean + prose-in-`safetyProfile` would push interpretive text into numeric fields. Three near-synonymous safety-prose fields (`safetyBrief`, `safetyData`, `harmSignal`) require authoring guidance to prevent drift (applied inline in the JSDoc).
4. **Combinatorial explosion** — currently zero consumer branches on `primaryDesign`/`primaryResult` outside `trialData.ts`. Risk is deferred. A legal-pairing comment table has been added to the `primaryDesign` JSDoc block in the commit.
5. **Vocabulary coexistence** — unchanged at four vocabularies. This wave does not retire `specialDesign` or `trialResult`. Net: vocabulary count holds, two vocabularies gain new values, no migration path.

## Required follow-ups

- `primaryResult` JSDoc block explicitly notes that `safety-threshold-met` is paired only with `single-arm-registry` and is a one-sample threshold outcome — applied inline in this commit.
- Option Y suppression comment updated to include `estimation-strategy` and `single-arm-registry` — applied inline in this commit.
- Legal `(primaryDesign, primaryResult)` pairing table added as JSDoc comment — applied inline in this commit.
- Safety-prose-field distinction (`safetyBrief` vs `safetyData` vs `harmSignal`) documented in `harmSignal` JSDoc — applied inline in this commit.
- **Open tracking task (non-blocking):** vocabulary-consolidation ADR covering `trialResult` / `specialDesign` / `primaryDesign+primaryResult` / `archetypeId`. Third batch to defer it. The `@deprecated` tag on `specialDesign` is theoretical until consolidation lands.
- **No clinical-reviewer routing required for this wave** — interface-declaration-only, no claim text, no citation, no `last_reviewed` impact. When data population happens (Batch 3 Wave 2+), trials touching `harmSignal` (POINT, SPS3, SPARCL, THALES, INSPIRES, SAMMPRIS) will need clinical-reviewer sign-off on harm-tradeoff prose per §17.2.

## Blocking issues

None.
