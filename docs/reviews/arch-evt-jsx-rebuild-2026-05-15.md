# Architect review — EVT JSX rebuild

**Decision:** approve-with-conditions
**Reviewed:** plan only (plan + spot reads of `EvtPathway.tsx`, `PathwayBottomDrawer.tsx`, `CalculatorDrawer.tsx`, `PATHWAY_SPEC.md`, `ElanPathway.tsx`, `MigrainePathway.tsx`)
**Reviewer:** system-architect
**Date:** 2026-05-15

## Rationale

The plan correctly composes `CalculatorDrawer` via the existing `PathwayBottomDrawer` wrapper (no fork), names files concretely, scopes non-goals well, and ships rollback-by-revert which is clean because the surface is stateless. The six proposed primitives roughly track §3.1–§3.7 of `PATHWAY_SPEC.md` v1.4, so each has a spec section it answers to. The structural risk is concentrated in three places: (1) the v4-1 cascade-notice requirement says "render adjacent to the changed field," but `PathwayCascadeNotice` is named/placed as if it belongs in the rail — without an explicit prop contract, the build will likely default to rail-placement and re-introduce the very bug v4-1 is supposed to fix; (2) the plan is silent on where the EVT state machine and `calculateLvoProtocol`/`calculateMevoProtocol` live in the new file, which matters because that ~600 lines of clinical logic is the highest-value asset to preserve verbatim and the most dangerous to subtly mutate during a "rewrite"; (3) no tests are mentioned for an interpretation function that has ~25 distinct verdict branches and is undergoing 4 Class E clinical-logic changes in the same commit. None of these are blockers — they are answerable in the plan doc before V approves execution. The call is approve-with-conditions.

## Required follow-ups

1. **Add a "logic-preservation" section to the plan** stating: `calculateLvoProtocol`, `calculateMevoProtocol`, `evtStatusToTier`, `getEvidenceBadge`, `getNihssNumeric`, and `getNextRenderedField` are lifted into the new file **as a verbatim copy first**, and only then mutated for the 4 Class E fix-manifest items (A3, A8, A9 + dominant M2 0–6h gating). The 18 Class C-clinical patches are applied as *append-only* additions to the same functions. A reviewer must be able to diff the old and new interpretation function and see one Class E change at a time — not a wholesale rewrite mixed with patches.

2. **Specify `PathwayCascadeNotice`'s prop contract before build.** Per spec §3.6 + v4-1, the notice renders "immediately below the changed category-row," not in the rail. The primitive should accept `{ visible, changedFieldLabel, clearedFields, onUndo, onDismiss }` and be **rendered inline at the field-row level by `EvtPathway.tsx`**, not lifted into `PathwayRail`. State the placement contract in the plan. Without this, the build will default to rail-placement and re-introduce the v4-1 bug.

3. **State the state-machine location explicitly.** The plan's open question (3) hints at this but doesn't commit. Recommendation: keep state + interpretation in `EvtPathway.tsx` for this commit; **do NOT** extract `usePathwayState.ts` yet. Rationale below in Composability. Add this as a non-goal: "State machine remains colocated in `EvtPathway.tsx`; no shared `usePathwayState` hook introduced. ELAN/SE/Migraine state shapes (verified: `Inputs` differs per pathway, e.g. ElanPathway uses `StrokeSize` + onset date, Migraine uses `RedFlags` + `SafetyState` + `CocktailState`) are structurally distinct and do not justify a shared abstraction at n=1."

4. **Add a "tests required" line to acceptance checks.** Minimum: a Vitest unit-test file `src/pages/__tests__/EvtPathway.interpret.test.ts` covering the 25 verdict branches in `calculateLvoProtocol` + `calculateMevoProtocol`. Pure-function tests, no React rendering — the Class E threshold changes (A3, A8, A9, dominant M2) deserve regression coverage that's faster than the 4 manual walk-throughs in acceptance check #1. Cite `testing-patterns` skill.

5. **Clarify pearl-data location.** Plan says "pull verbatim from current EvtPathway.tsx." Pearls are currently inline `<LearningPearl>` JSX. State whether they stay inline (acceptable) or move to a `const EVT_PEARLS` data array (cleaner, but adds a migration risk). Recommendation: **keep inline for this commit** — moving them is a separate refactor and would muddy the diff.

6. **Disambiguate "PathwayBranchChip" target.** Per spec §3.4, tapping a chip "returns to source step with the relevant category-row accordion pre-opened." The chip needs to know **which field** to scroll to, not which step. Confirm the prop is `targetFieldId: keyof Inputs` (or `string`), not `targetStepIndex: number`. Otherwise the chip can only land on the step boundary, not the field that produced the branch — and v4-1's adjacency requirement can't compose because the chip and cascade notice are pointing at different anchors.

7. **Route the 4 Class E items through `clinical-reviewer` pre-execution.** The plan's "Routing through the agent system" mentions this, but the §17.2 clinical artifact must exist *before* `ui-architect`/`medical-scientist` touch the file. List the 4 specific claim IDs that change: A3, A8, A9, dominant-M2-0–6h gating. The C-clinical items (16) can be gated post-implementation per §11.

8. **Drawer composition — keep the wrapper.** The plan does not propose retiring `PathwayBottomDrawer.tsx`. Good. Confirm this in the plan as an explicit non-goal: "`PathwayBottomDrawer.tsx` remains the pathway-stable seam over `CalculatorDrawer`; not deprecated in this commit." This is the right call — `PathwayBottomDrawer` owns the tier-vocabulary remap that does not belong in `CalculatorDrawer`'s calculator-tier vocabulary. Composing `CalculatorDrawer` directly from `EvtPathway` would duplicate the `TIER_TOKENS` map.

## Composability assessment

The six primitives are roughly the right cut, but two are at the wrong granularity and one is at risk of premature abstraction.

- **Right cut:** `PathwayCategoryRow`, `PathwayBranchChip`, `PathwayLearningPearl`, `PathwayStepIcon`. Each maps cleanly to a spec section (§3.7, §3.4, §4.5, §3.3) and each will be reused identically across ELAN/SE/Migraine because the spec mandates pixel-identical anatomy.
- **Wrong granularity — merge candidate:** `PathwayRail` + `PathwayStepIcon`. Per spec §3.1–§3.3, the rail segment, node circle, and step eyebrow + icon are a single visual unit; the icon is rendered "inline next to the eyebrow," not floating. Splitting `PathwayStepIcon` into a separate file creates a 4-glyph SVG component that exists only to be slotted into the rail's eyebrow. Recommendation: fold the four step icons into a `STEP_ICONS` constant exported from `PathwayRail.tsx`, and let consumers pass `iconKey: 'triage' | 'clinical' | 'imaging' | 'decision'`. Saves one file, keeps the visual unit together.
- **Premature abstraction risk:** `PathwayCascadeNotice` is the most pathway-specific of the six because its content (which field cleared, what cascade unwinds) is computed from the pathway's own state machine. Either (a) accept it'll be a thin presentational primitive whose props are owned by each pathway's parent, or (b) defer extraction until the second pathway (ELAN) confirms the prop shape. Recommendation: ship as presentational primitive with the prop contract in follow-up #2; do not try to make it "smart" about cascade semantics.
- **State machine — do NOT extract `usePathwayState.ts` at n=1.** I verified ELAN/Migraine have structurally distinct `Inputs` types (Tri-state booleans + date string vs. nested `SafetyState`/`CocktailState` objects). The premise of a shared hook only holds if the state shapes converge — they don't. Wait for the 3rd pathway rebuild before deciding whether a shared hook is justified; the current evidence is n=1 and the cost of premature abstraction is high (every pathway's verdict function gets coupled to a shared state shape that doesn't fit).

## Recommended changes to the plan (before V approval)

- Add follow-up #1 as a new bullet under "Preserve verbatim" (§6): "Interpretation functions (`calculateLvoProtocol`, `calculateMevoProtocol`, `evtStatusToTier`, `getEvidenceBadge`, `getNihssNumeric`, `getNextRenderedField`) lifted verbatim first; Class E mutations applied as 4 named subsequent edits; Class C-clinical patches applied as append-only additions."
- Add follow-up #2 under "Visual structure" (§2): explicit `PathwayCascadeNotice` prop contract + placement rule.
- Add follow-up #3 under "Non-goals": "No `usePathwayState` hook. State remains in `EvtPathway.tsx`."
- Add follow-up #4 under "Acceptance checks": Vitest unit test for interpretation branches.
- Add follow-up #5 in "Preserve verbatim": pearls stay inline.
- Add follow-up #6 under "Files touched" → `PathwayBranchChip.tsx`: prop contract `{ targetFieldId, label, onClick }`.
- Add follow-up #7 under "Routing": Class E §17.2 artifact must exist before any code is written; list the 4 claim IDs.
- Add follow-up #8 under "Non-goals": `PathwayBottomDrawer.tsx` retained.
- Reconsider `PathwayStepIcon.tsx` as a standalone file — fold into `PathwayRail.tsx` per Composability above. Drops the file count from 6 to 5.
