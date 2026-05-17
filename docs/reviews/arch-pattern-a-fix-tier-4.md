# Architect review — Pattern A fix Tier 4 (EVT drawer migration)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-16

## Rubric scoring

| # | Item | Score | Rationale |
|---|---|---|---|
| 1 | Duplication risk | pass | Plan retires `PathwayBottomDrawer` (the parallel pattern) and routes EVT through the spec-mandated `CalculatorDrawer`. Net negative duplication. Material Symbols → inline SVG also consolidates onto canonical icon strategy. |
| 2 | Boundary integrity | pass | Drawer is a UI primitive; result-content moves into it as `children`. PathwayTier→SeverityTokens map lives next to its caller. Interpretation logic (`calculateLvoProtocol`, `calculateMevoProtocol`, `evtStatusToTier`, `CASCADE_MAP`, `getEvidenceBadge`) is untouched. |
| 3 | Composability | concern | `CalculatorDrawer` was designed for scoring calculators; EVT is verdict-shaped. Existing `PathwayBottomDrawer` already solved this by overloading `tierLabel + action` → "Eligible · Standard Window 0-6h". Reuse the same composition: pass `${tierLabel} · ${action}` as `collapsedStat`. **Do NOT add a new "verdict mode" prop on `CalculatorDrawer`** — would fragment the calculator API for one consumer. |
| 4 | State locality | pass | `isExpanded` lives at the drawer call site (same scope `PathwayBottomDrawer` uses today). No new hoisting. Cascade-event repositioning moves the render site inline but does not change the state owner. |
| 5 | Dependency weight | pass | No new external dependencies. C-3 enables Material Symbols font retirement (not in scope here, just unblocked). |
| 6 | Migration exit | concern | Single-file change but substantial surface delta. Needs explicit rollback note in PR body. `PathwayBottomDrawer.tsx` stays on disk one commit so `git revert` is clean; deletion is a follow-up commit after a week of clean live signal. |

## Rationale

The shape is right. EVT is the sole remaining consumer of `PathwayBottomDrawer` (confirmed: SE has only a comment-reference, no import; Migraine has no reference). `PathwayBottomDrawer` already demonstrated the composition pattern — it wraps `CalculatorDrawer` with a tier→tokens map and a verdict-style `collapsedStat`. Tier 4 effectively says "do the same composition inline at the EVT call site, then delete the wrapper." Cleanest possible exit.

Areas requiring conditions, not blocks:

1. **State B (provisional) UX discoverability.** EVT's existing in-body Provisional verdict banner (commit 9e34761) is at clinician eye-level inside Step 4. Moving the provisional signal exclusively into a State B `stateBTappable: true` drawer at viewport-bottom changes the surface. State B with `stateBTappable: true` is functionally identical to State C chrome (visible, tappable, color-cued) but bottom-of-viewport rather than in-flow. UX-classification question — flag for clinical-reviewer awareness, do not block architecturally.

2. **Bottom action bar (C-5).** Keeping Back/Next indefinitely is the right pragmatic call for EVT given Step 3 (Imaging) density. Creates a precedent of "rail auto-advance + explicit Back/Next coexisting" that the spec did not anticipate. Downgrading visual weight (drop `shadow-lg shadow-neuro-200`) is the correct call — signals "secondary nav." Do not let this slide into other pathways without rejustification.

3. **`sectionRefs` removal (C-6).** The scroll-mt-4 wrappers serve `sectionRefs.current[N]`, consumed by the `useEffect` at lines 778–783 that auto-scrolls the active step into view. Removing wrappers + refs without removing or rewiring this effect leaves a dangling-ref scroll. Coupled change.

4. **C-7 cascade notice scoping.** Render the inline notice immediately under `<div id={"field-" + cascadeEvent.changedField}>` — single-event semantics, matches current state shape, no new event scoping.

## Required follow-ups (conditions for approve)

1. **Reuse the `TIER_TOKENS` constant from `PathwayBottomDrawer.tsx` lines 54–87 verbatim** when extracting to the new call site (or to a small `src/lib/pathways/tierTokens.ts`). Do not rebuild the mapping.

2. **Build `collapsedStat` as `${tierLabel} · ${action}`** matching `PathwayBottomDrawer` line 108 — keeps verdict-style header consistent. Do not add new "verdict mode" prop to `CalculatorDrawer`.

3. **Resolve the `sectionRefs` useEffect (lines 778–783) as part of C-6.** Either delete it with the wrappers, or rewire to `stepContainerRef`. State the choice; do not leave dangling.

4. **State the cascade-notice anchor in C-7.** "Inline below the row whose id matches `field-${cascadeEvent.changedField}`" — confirm or correct.

5. **State B placement note for clinical-reviewer.** Provisional verdict moves from in-body banner to drawer State B `stateBTappable: true`. Flag this surface change explicitly so clinical-reviewer can confirm clinician discoverability of the "provisional" signal at viewport bottom.

6. **Confirm all 7 CLIN-2 verbatim phrases survive verbatim** in drawer-rendered result content. The strings live in `result.reason` / `result.details` produced by `calculateLvoProtocol` / `calculateMevoProtocol` — neither function is touched, so phrases are preserved by construction. Confirm in PR body to make auditable.

7. **Rollback note in PR body.** "PathwayBottomDrawer.tsx kept on disk this commit; revert restores EVT to prior shape in one step. File deletion is a separate follow-up commit after one week of clean live signal."

8. **Route the §17.2 clinical-reviewer artifact** for CLIN-2 preservation check + State B discoverability question. Architectural side is approve-with-conditions; clinical side is its own gate. **This upgrades Tier 4 from Class D to Class D-clinical.**

## Blocking issues

None. The shape fits; conditions above are clarifications that need to land in the plan before execution, not structural rebuilds.

---

**Files inspected**

- `docs/reviews/audit-pattern-a-content-2026-05-16.md`
- `src/components/calculators/CalculatorDrawer.tsx`
- `src/components/pathways/PathwayBottomDrawer.tsx`
- `src/lib/calculators/severityTokens.ts`
- `src/pages/EvtPathway.tsx` (lines 85–112, 770–810, 1000–1120, 1590–1830)
- `src/pages/StatusEpilepticusPathway.tsx` (confirmed: comment-only reference; no import; EVT is sole consumer)
