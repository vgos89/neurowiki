# Architect review — PR #PLAN (lkw-window-badge)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-5-5)
**Date:** 2026-11-16

## Rubric
1. **Duplication risk: concern.** Removing `WindowBadge` from `CodeModeStep1.tsx` (L180-219, L328-333) is the right consolidation. But "no second copy of the thresholds" is not true after this plan. The 4.5 h / 9 h comparisons stay inline in four places:
   - `CodeModeStep1.tsx` L116 and L120 (`withinTPAWindow`, `outsideThromboWindow`)
   - `CodeModeStep2.tsx` L66 (`> 9`)
   - the sticky context bar in `StrokeBasicsWorkflowV2.tsx` L480-484, which has a third label set ('IVT Window' / 'Extended Window' / 'Outside IVT')
   - `ExtendedIVTPathway.tsx` L698-701, which uses `< 4.5` where the panel uses `<= 4.5`, so the two disagree at exactly 4.5 h
2. **Boundary integrity: pass, with one condition.** The new module must be pure. It returns the tier plus numbers (elapsed and remaining minutes, which time decided the tier) and contains no user-facing strings, no Tailwind classes and no JSX. Reason: neither `src/utils/` nor `src/lib/` is in the em-dash/humanizer scanner's directory list (`SCAN_DIRS`; only `src/lib/cases` is), and claim tags live on JSX. Chip labels moved into the module would fall outside both checks. Labels stay in the panel's claim-tagged JSX.
3. **Composability: pass.** One classifier, one tier type and one chip inside the shared panel is the reusable shape.
4. **State locality: pass.** Everything stays derived from `values.lkw` / `values.wakeUp` with no new state, consistent with the note at `CodeModeStep1.tsx` L70-71. The duplicate mount (follow-up 6) is a separate, pre-existing problem.
5. **Dependency weight: pass.** No new package.
6. **Migration exit: pass, with conditions.** About 4-6 files: the new module and its test, `PatientContextPanel.tsx`, `CodeModeStep1.tsx`, and the claim/citation registry entries. The new prop is additive and off by default. One revert undoes it all. Rollback note below.

## Rulings on (a)-(f)
- **(a) Location.** `src/utils/ivtWindow.ts` is accepted. The repo has precedent both ways (`src/utils/strokeDosing.ts`, `src/lib/pathwayVerdict.ts`). `strokeDosing.ts` is the nearest sibling: pure thrombolysis arithmetic with a co-located test. Put the test next to it as `ivtWindow.test.ts`, matching `strokeDosing.test.ts`. Do not use `src/lib/citations/`.
- **(b) Prop design.** A second boolean is accepted. Derive it once as `const windowChip = showWindowChip || showThrombolysisTiming;` and use that one value to gate both the chip row and the wake-up handling.
  - Render slot: rejected. It would let each page bring its own chip, which recreates the duplication this plan removes.
  - Splitting `showThrombolysisTiming` into finer flags: deferred. It gates about ten separate blocks (L534, 586, 625, 673-743, 888, 976). Splitting it now widens the change for no user benefit.
  - The existing wake-up sentence (L534-540) must be gated on `windowChip` and shown only for truly unknown onset (`lkw === null && !wakeUp`). Wake-up entries get the new chip instead.
- **(c) Blast radius of deleting `WindowBadge`.** Low structurally. It is local to the file, not exported, and no test or export references its labels or "since LKW". `lkwHours` must stay: it feeds `onComplete`, then `Step1Data`, which is read by `CodeModeStep2`, `CodeModeStep3` (summary and copy text), `StrokeCardGrid` and the sticky bar. What does change on Stroke Code is user-visible:
  - "Extended window" becomes "4.5–9h window" and "Outside tPA window" becomes "Beyond 9h".
  - The extended tier changes from amber to orange.
  - "~X.Xh since LKW" becomes "~X h Y min since onset".
  - The badge loses its Check / AlertTriangle / XCircle icons (a cue that does not depend on colour) and its explicit aria-label.

  The wording changes need clinical sign-off. The icon and aria loss needs a quick accessibility check: the panel's row is `role="status"` with visible text, which is probably enough. After the delete, check whether those three icons are still used elsewhere in the file and drop unused imports so the compile check passes.
- **(d) Duplicate mount.** Confirmed, and it is not inside `CodeModeStep1` or its direct parent. `src/pages/guide/StrokeBasicsLayout.tsx` renders `{mainContent}` twice: L103 inside `hidden lg:flex` and L114 inside `lg:hidden`. `StrokeBasicsWorkflowV2` passes `<MainContent />`, so the whole workflow is mounted twice: all step state, the modals, timers, `CodeModeStep1` and both panels. Consequences:
  - Data is silently lost when the screen width crosses 1024 px (tablet rotation, split screen).
  - DOM ids repeat (`patient-context-body`, `card-content-panel`), so `aria-controls` points at an ambiguous target.
  - Every effect and interval runs twice.
  - `data-claim` markers are emitted twice.

  This is a real defect worth its own big-change task. It is out of scope here.
- **(e) ADR.** Agreed, there is no new architectural decision. However, the §16 artifact list for Class E inherits the Class D list, which includes an ADR. Either write a half-page ADR (classifier location plus where the wake-up rule lives) or have V waive it explicitly in the TASKS.md entry. That is the orchestrator's and V's call.
- **(f) Rollback.** See below.
- **Plan item 4 (`ExtendedIVTPathway`).** Leave it untouched in this change. Do not import the midpoint helper yet. That page drives a live verdict on its own 30-second interval, and its boundary differs (`< 4.5`). Moving it onto a shared helper changes clinical arithmetic, so it is its own clinical change.

## Rationale
The plan has the right shape. It moves the window classification into a pure, tested module, puts one claim-tagged chip in the shared panel directly under the Last Known Well row, and deletes the separate, untagged Stroke Code badge, which also fixes its ~590 px distance from the LKW row on phones. The risks are narrow:
- The plan claims one source of thresholds while four inline copies and a third label set remain.
- After this change the Stroke Code page will show a wake-up tier in Step 1 while the sticky bar above it still says "Unknown".
- The Stroke Code badge's wording, colour and icons change. That is clinical copy, not pure refactoring.

None of these block. They are scoping and labelling conditions.

## Required follow-ups
1. **In this change:** replace `CodeModeStep1.tsx` L116/L120 with the classifier's tier, so the Step 1 badge and the Step 1 gating (BP limit, DAPT path, weight-required) cannot disagree. Write a TASKS.md item covering the sticky bar (`StrokeBasicsWorkflowV2.tsx` L480-484), `CodeModeStep2.tsx` L66 and `ExtendedIVTPathway.tsx` L698-701, and record the `< 4.5` vs `<= 4.5` difference at exactly 4.5 h as a clinical question.
2. The classifier must handle every input:
   - a wake time before the asleep time, future times, and missing input each return an explicit tier, never NaN
   - unknown onset (`lkw === null`, no `wakeUp`) is distinct from wake-up
   - unit tests cover exactly 4.5 h and 9 h, and the same boundaries computed from the sleep midpoint
3. The wake-up chip gets its own claim ID with a citation and `quoted_text`. It must not reuse `ivt-window-4.5h`, because the evidence base is different (WAKE-UP / EXTEND). It needs every binding: the registry entry, the `claims.ts` entry and the `data-claim` tag on the JSX.
4. **Route the clinical parts to clinical-reviewer before execution:** the wake-up rule, the new chip wording, the Stroke Code label and colour change, and how Step 1's "Wake-up / Unknown Onset" notice (`CodeModeStep1.tsx` L344-353) reads alongside the new chip. Also run an accessibility check on the dropped icons and aria-label.
5. Product question for V: the sticky context bar will still say "Unknown" for wake-up while Step 1 shows a tier. Either accept this for now (and note it in the follow-up task) or include the bar in scope.
6. New big-change task: `StrokeBasicsLayout.tsx` mounts `mainContent` twice. Render a single tree, either with CSS-only responsive layout or a media-query hook choosing one branch. Until then, QA selectors for this change must target the visible copy.
7. Later clinical task: converge `ExtendedIVTPathway`'s midpoint arithmetic onto the shared helper once the medical-scientist rule has landed.
8. ADR or explicit V waiver, per (e).

## Rollback note (for the PR body)
Revert the single commit (or the commits in reverse order if the wake-up rule lands separately). Nothing about persistence changes: `wakeUp` is already part of the saved NIHSS draft (`nihssDraft.ts`) and the case format (`cases/types.ts`), and this change does not touch them. After a revert, Stroke Code goes back to its old badge below the panel, and NIHSS goes back to the in-panel chip with no wake-up tier. Revert the claim and citation entries together with the chip markup. A leftover registry entry is harmless, but a tag without a registry entry fails the claims hook. No feature flag is needed: the new prop is off by default and only Stroke Code turns it on.

## Blocking issues
None.
