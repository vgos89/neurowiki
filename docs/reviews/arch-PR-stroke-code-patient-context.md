# Architect review — PR # (Stroke Code Patient-Context Accordion)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: Opus 4.7)
**Date:** 2026-05-24

## Rationale

Reusing `PatientContextPanel` for Stroke Code Step 1 is the right structural call and the cheapest path to V's stated outcome — the primitive's docstring explicitly anticipates this reuse, its controlled-component API (`values` + `onChange` over `PatientContextValues`) is already proven by `NihssCalculator.tsx`, and the four cards being retired (LKW, Vitals BP, Vitals Glucose, Weight) overlap almost exactly with the four panel rows that already exist (LKW, BP, Glucose, Anticoag) — so this is consolidation, not parallel construction (rubric 1: strong pass). Where the plan is structurally weakest is the `extraFields?: React.ReactNode` extension point: dropping arbitrary JSX through a single named slot is the lowest-information shape available and silently couples every future consumer (ELAN, EVT, Status, Migraine) to the panel's internal divider/padding rhythm. That shape is acceptable for one pathway today, but is the wrong shape if V actually rolls this to 4+ pathways as stated in the intent. Two concerns also need explicit notes before code lands: (a) the boundary direction — a primitive currently living under `src/components/calculators/` is about to be consumed by a pathway page, which is a real architectural inversion worth deciding on now rather than discovering later; (b) the existing Stroke Code Step 1 surface carries logic the panel does not model (the `WindowBadge`, the BP-tPA-limit red state with `bpControlled` checkbox, the glucoseLow/glucoseHigh callouts, the `lkwEntered` disambiguation flag), and the plan needs to state explicitly where each of these lives after the swap. None of this is blocking; all of it is addressable with notes in the plan plus one architectural decision V should make.

## Required follow-ups

1. **Rubric 2 (boundary integrity) — Move the primitive before adding the second consumer.** `PatientContextPanel` is named, located, and documented as a *calculator* primitive (`src/components/calculators/`, docstring says "alongside the calculator"). Stroke Code Step 1 is a pathway page, not a calculator. A pathway component importing from `src/components/calculators/` reverses the normal dependency direction in this codebase and will read as accidental coupling to the next reader. Pick one before Commit 1 lands: (a) move the file to `src/components/shared/PatientContextPanel.tsx` and update the NIHSS import (one-line change, low risk), or (b) explicitly accept the cross-boundary import and add a one-line comment at the top of the file stating "consumed by both calculators and pathway pages — do not narrow." Option (a) is cleaner and matches the multi-pathway intent V stated. Either is acceptable; silently doing neither is not.

2. **Rubric 3 (composability) — `extraFields: ReactNode` is the wrong shape for a 4-pathway rollout.** A single anonymous-JSX slot works for one consumer because there's no risk of inconsistency. The moment ELAN, EVT, Status, and Migraine each pass their own `extraFields`, each pathway will style its rows differently (label alignment, hairline divider, input width, 44px tap target), and the panel's visual coherence — the explicit selling point of the chassis — quietly degrades. Two better shapes, pick one:
   - **Preferred — `extraRows: PatientContextRow[]`** where `PatientContextRow = { id; label; input: ReactNode; helpText?: string }`. The panel owns the divider, the `min-h-[44px]` row container, the label-left/input-right layout. The consumer owns only the input control. This matches the existing row pattern exactly (BP row, Glucose row, Anticoag row are all label + input within a panel-owned row container). One file change, ~15 lines, future-proof.
   - **Acceptable — `extraFields: ReactNode` shipped now, with a docstring note that adding the second consumer triggers an automatic refactor to `extraRows[]`.** Lower upfront cost, deferred discipline cost. Only pick this if V explicitly wants to defer.

   The current plan as written ("optional `extraFields?: React.ReactNode` slot") is the worst of both: it ships the weaker shape with no exit ramp.

3. **Rubric 2/3 — State the migration target for the four pieces of behavior the panel does NOT currently model.** `CodeModeStep1.tsx` carries non-obvious behavior tied to the cards being retired:
   - `WindowBadge` (lines 148-170) renders Within-4.5h / Extended-window / Outside-tPA chips inside the LKW card. The panel's LKW row shows only `lkwDisplay` text. Decide: does the badge move into the panel's collapsed-summary chip (and the panel grows a `lkwEvaluation?` prop), or is the badge lifted *outside* the panel as a sibling element that reads from the same `patientContext.lkw` value? Plan must say.
   - `bpTooHigh` red-state styling + `bpControlled` checkbox + BP-treatment guidance block (lines 282-302). This is clinical UI tied to the BP input — the panel currently has no concept of validation states or supplementary guidance. Decide: lift outside the panel as a sibling that reads `patientContext.systolic/diastolic`, or extend the panel with a per-row `helperContent?: ReactNode` slot. Plan must say.
   - `glucoseLow` / `glucoseHigh` callouts (lines 304-318). Same question as BP. Same answer should be the same answer.
   - `lkwEntered` flag (lines 59 + 92, 106-107, 116) — the panel's `lkw === undefined` / `null` / `Date` tri-state should map cleanly to this, but the plan needs to state the mapping explicitly: `lkw === undefined → !lkwEntered`, `lkw === null → lkwEntered && lkwUnknown`, `lkw instanceof Date → lkwEntered && !lkwUnknown`. Confirm Step 2 unlock-gate logic survives this translation without behavior change.

   The acceptance criteria say "Step 1 progression must behave identically" — that gate cannot be evaluated without each of the four items above resolved in the plan.

4. **Rubric 4 (state locality) — Keep `lkwHours`, `bpTooHigh`, etc. derived, not duplicated.** Currently `CodeModeStep1` derives `lkwHours` from `lkwDate` via `useEffect`, `bpTooHigh` from `systolicBP/diastolicBP` inline, etc. After the swap, the source of truth becomes `patientContext` (`Date | null | undefined` for LKW, string for BP). Do not introduce a second `lkwHoursState` or `bpTooHighState` synchronized via `useEffect` — derive each per render from the panel values via `useMemo`. The plan should state this explicitly so the swap doesn't accidentally create a sync-bug surface that today's structure avoids.

5. **Rubric 5 (dependency weight) — Pass.** No new packages. The change is a swap to an existing primitive.

6. **Rubric 6 (migration exit) — Single-pathway scope is the correct rollback boundary.** The non-goal "no rollout beyond Stroke Code in this PR" is the right call and should stay non-negotiable. If this swap regresses Step 1 progression for any reason (LKW mapping, missing weight field, badge missing, BP validation absent), revert is a single-file revert of `CodeModeStep1.tsx`. Add to the PR body: "Rollback: `git revert <sha>` of CodeModeStep1.tsx is clean; PatientContextPanel and NIHSS consumer are untouched."

7. **Rubric 1 (duplication risk) revisited — Verify no third pattern.** Confirm before code: there is no third place in `src/components/article/stroke/` or `src/components/calculators/` that already renders a "stacked patient-context inputs" chassis. I checked — there isn't (the only adjacent surface is `LKWTimePicker` which both files already share). Pass, but state this verification in the plan so future architects don't re-litigate.

8. **Class boundary — Class D is correct.** No clinical-content text changes (chassis swap only), no `-clinical` flag needed *provided* the four pieces of behavior in follow-up #3 are preserved verbatim (specifically: BP-too-high guidance text, glucose guidance text, the AHA citation strings inside `CodeModeStep1`'s alert blocks). If any of those strings move or change wording during the lift, this becomes D-clinical and `clinical-reviewer` must gate per §16. State this trigger in the plan.

9. **Mobile / a11y verification — explicit in acceptance gate.** The acceptance criteria mention 375px and keyboard accessibility; add to gate-pass criteria a side-by-side 375px screenshot of NIHSS-with-panel vs Stroke-Code-with-panel to confirm the panel renders identically under both consumers (no parent CSS bleed) and a keyboard-tab traversal note from `mobile-first-developer` and `accessibility-specialist` respectively.

## Blocking issues

None. The plan is structurally fixable in-place; no architectural rewrite is needed before V approves.

---

**Files reviewed:**
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/calculators/PatientContextPanel.tsx`
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/components/article/stroke/CodeModeStep1.tsx`
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/NihssCalculator.tsx` (consumer reference)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/guide/StrokeBasicsWorkflowV2.tsx` (parent orchestration, props wiring)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/reviews/arch-PR-stroke-code-refactor-2026-05-19.md` (prior architect review for tone/format calibration)
