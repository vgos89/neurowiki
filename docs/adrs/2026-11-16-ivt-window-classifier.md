# ADR 2026-11-16: one IV-thrombolysis time-window classifier, rendered by the patient panel

**Status:** accepted (V direction 2026-11-16: the window badge must show directly under the Last Known Well row on both stroke surfaces, including wake-up entries). Architect review: docs/reviews/arch-PLAN-lkw-window-badge-2026-11-16.md (approve-with-conditions).

## Context

The time-window badge existed twice with different labels, colours and placement:

- `PatientContextPanel` (`ivt` block, NIHSS only, claim-tagged) directly under the LKW row.
- `CodeModeStep1` (`WindowBadge`, Stroke Code, untagged) as a sibling BELOW the whole panel, about 590 px under the LKW row at phone width, so on a phone the clinician set a time and saw no badge.

Wake-up entries (`lkw === null` plus `wakeUp { asleepAt, wokeAt }`, added 2026-11-16) had no badge on either surface. The 4.5 h and 9 h comparisons were also inlined in several other places.

## Decision

1. **One pure classifier**, `src/utils/ivtWindow.ts`, next to `strokeDosing.ts`. It returns a tier and numbers only (which clock decided, elapsed and remaining minutes). No user-facing strings, no classes, no JSX: `src/utils` is outside the humanizer scanner, and claim tags live on JSX.
2. **One chip**, rendered by `PatientContextPanel` directly under the LKW row, for witnessed LKW and for wake-up entries. Labels and aria-labels stay in the panel's claim-tagged JSX.
3. **A narrow prop**, `showWindowChip`, enables the chip row alone. `showThrombolysisTiming` implies it. A render slot was rejected because it would let each page bring its own chip again.
4. **`CodeModeStep1` deletes its private badge** and derives its Step 1 window gating from the same classifier, so the badge and the gating cannot disagree. The gating flags are computed by a second pure helper, `src/components/article/stroke/step1Gating.ts`, so the clinical gating rules are unit-tested without rendering the page.
5. **Two claim ids, two literal JSX branches.** The witnessed chip keeps `ivt-window-4.5h`; the wake-up chip is `ivt-window-wake-up` (different evidence base; clinical review ruling). The claims scanner only matches literal `data-claim` attributes, so the panel renders two literal branches rather than one element with a computed attribute.
6. The clinical rule for wake-up entries and all visible wording are owned by the clinical spec and its review (docs/2026_11_16/spec-lkw-window-chip.md; docs/reviews/clinical-PLAN-lkw-window-chip-2026-11-16.md), not by this ADR.

## Not decided here (tracked in TASKS.md)

- `ExtendedIVTPathway` keeps its own midpoint timer; it drives a live verdict and compares with `< 4.5` where the panel uses `<= 4.5`. Converging it is a separate clinical change.
- The Stroke Code sticky context bar and `CodeModeStep2` keep their inline thresholds for now.
- `StrokeBasicsLayout` mounts the whole Stroke Code page twice (desktop and phone trees). Pre-existing; separate task.

## Rollback

Revert the commit. No persistence change: `wakeUp` already exists in drafts and saved cases. Revert the claim entry together with the chip markup (a tag without a registry entry fails the claims hook).
