# Architect review — GCS Calculator rebuild

**Decision:** approve
**Reviewed:** plan + implementation
**Reviewer:** ui-architect (stand-in for system-architect; W3.4 pending)
**Date:** 2026-04-17

## Rationale

The GCS rebuild is a faithful Archetype 1 application of CALCULATOR_SPEC v1.1 with one well-documented clinical deviation. All five conflicts surfaced in the 7-agent pre-flight swarm were resolved before a single line of code was written.

Not-testable checkboxes are retained as a clinically-essential feature: Teasdale & Jennett 1974 use the T suffix specifically for verbal-not-testable states, and the checkbox-above-radiogroup pattern is spec-compatible (the spec prohibits `border-2`-based selection states, not checkboxes). The checkbox conditionally hides its radiogroup, counts the slot as filled in `selectedCount`, and does not interfere with the Archetype 1 divide-y pattern.

SEVERITY_TOKENS uses `text-amber-700` / `chevronClass: 'text-amber-700'` for moderate, correcting both the current GCS non-compliant colors and the known amber-600 defect in the ICH Score reference implementation. The severity threshold correction (`>= 14` → `>= 13`) is a clinical fact confirmed by medical-scientist against ACRM 1993; it has no architectural consequence.

The Portal drawer follows §1.3 exactly: `createPortal`, `position: fixed`, `bottom: calc(var(--tab-bar-height) + env(...))`, `z-[55]`. The 3-state machine (A/B/C) is applied correctly, counting 3 slots instead of 5, with the `eyeSlotFilled` and `verbalSlotFilled` logic accounting for not-testable checkbox state.

`routeManifest.ts` update (title 47→53 chars, description 186→158 chars) is a purely mechanical fix to bring the GCS entry into SEO compliance. `link-graph.json` additions follow §7.4: full nodes for `calc/gcs`, `calc/nihss`, `article/ich-management`; stubs array for unrouted IDs (`pathway/stroke/step-2`, `trial/hemphill-2001`, `guideline/aha-ich-2022`). No structural or routing changes.

No new dependencies introduced. No cross-boundary mutations. No composability regressions.

## Required follow-ups
- Class B: `IchScoreCalculator.tsx` line 72 — `chevronClass: 'text-amber-600'` → `'text-amber-700'` (pre-existing amber-600 defect; discovered during GCS pre-flight; not blocking this PR)
- Add full nodes for `calc/heidelberg`, `calc/aspects`, `calc/abcd2`, `calc/has-bled`, `calc/rope`, `calc/boston-criteria` to `docs/link-graph.json` during their respective calculator rebuilds

## Blocking issues
None.
