# Architect review — EVT result/action de-clutter

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-06-07
**Class:** D-clinical

## Rationale

This plan does not introduce a new pattern — it finishes a migration the sibling pathways already completed. ELAN (`src/pages/ElanPathway.tsx` lines 680–695) is the exact precedent: a `Copy to EMR` button plus a `ShareButton` live inside the drawer's expanded children action row, while the `PathwayHeader` simultaneously carries `onCopy` and `shareText`. ExtendedIVTPathway (`src/pages/ExtendedIVTPathway.tsx`) is the same shape and even documents the retirement of its inline result card in favor of the drawer (line 1231 comment). EVT is the laggard: it still stacks a bespoke Step-4 result region, a legacy black action-bar copy button, and the drawer all at once. Converging EVT onto the ELAN shape is a duplication-reducing move, not a duplication-creating one.

The blast-radius question has a clean answer: **do it page-level, in the drawer's `children`, with no `CalculatorDrawer` API change.** The `children` prop is already a free-form `React.ReactNode` that renders above the toggle handle (`CalculatorDrawer.tsx` lines 71–72, 171), and EVT already injects bespoke result content there (lines 1889–2004). Adding a copy button to that block touches one file. A footer-action slot on `CalculatorDrawer` would put ~18 consumers in the blast radius to solve a single-surface problem — that is the composability anti-pattern this review exists to catch. The API-change option is rejected.

On the copy-affordance question: keeping header copy/share **and** a drawer copy button is the established, intentional convention here — ELAN and ExtendedIVTPathway both ship it. The header copy is the always-available affordance (works while scrolled up); the drawer copy is the result-local affordance. Do **not** drop the header copy — that would diverge EVT from its siblings and risk a regression to the shared `PathwayHeader` contract for no gain. The genuine de-clutter win is removing the redundant *third* surface: the black action-bar button (line 1797). Two affordances (header + drawer) is the target, not three.

The one real risk is not structural — it is clinical-content relocation. The Step-4 disclaimer, the "discuss with Vascular Neurology / Neurointerventional" clinical-context text (lines 1746–1756), the MeVO risk box, and the four PathwayLearningPearls carry clinician-actionable medical statements. None of them currently carry a `data-claim` attribute, a `claimId` field, or a `claim()` wrapper anywhere in `EvtPathway.tsx` — so the relocation does not move a *tagged* surface, but that is precisely why it needs a human gate: untagged clinical text relocated by hand is exactly where verbatim drift sneaks in. This is correctly **Class D-clinical** and the clinical-reviewer gate is mandatory before merge.

## Required follow-ups

1. **Route the clinical-text relocation to clinical-reviewer before execution.** The Decision-Support disclaimer, Clinical-Context paragraph, MeVO risk/evidence box, and the three 2026 peri-procedural pearls + Clinical-Context-Summary pearl are clinician-actionable statements. clinical-reviewer must confirm byte-for-byte preservation in the new location and produce a `docs/reviews/clinical-evt-declutter.md` artifact. This is a §17 gate, not an option.

2. **Match the ELAN drawer action-row shape exactly** (`ElanPathway.tsx` 680–695): `Copy to EMR` button + `ShareButton`, or `Copy to EMR` alone if EVT keeps share in the header only. Reuse the existing `copySummary` / `buildEmrText` (EvtPathway lines 968–973, 919–966) unchanged. Do not author a new copy handler.

3. **No `CalculatorDrawer` API change.** Inject the copy button into the existing page-level `children` block (inside the `result && drawerState === 'C'` region, before the closing `</div>` at line 2003). Leave the shared component and its ~18 consumers untouched.

4. **Preserve the modal path verbatim.** In `ThrombectomyPathwayModal.tsx` (lines 85–94) EVT renders with `customActionButton` + `isInModal`. The section-3 ternary (lines 1791–1798) already swaps the black button for `customActionButton` when present, so the legacy button only renders in the standalone non-modal case. When you delete line 1797's button, keep the `customActionButton` branch (1792–1795) intact and verify the modal still shows "Return to Stroke Workflow." Confirm the drawer copy button renders inside the modal too (the drawer portals to `document.body` and is not gated by `isInModal`).

5. **Verify drawer overflow headroom after folding the disclaimer + pearls in.** The expanded content region is `max-h-[45dvh] overflow-y-auto` (line 1892). The current children are a compact status/reasoning/assessment-summary block; adding the disclaimer, MeVO box, three pearls, and the Clinical-Context-Summary pearl materially increases content height. Confirm it scrolls cleanly at 375px and does not push the pinned handle off-viewport. If it feels cramped, the References block (lines 1803–1813) should stay in page flow rather than also moving into the drawer — keep that decision conservative.

6. **Action-bar layout after the button is removed.** With the section-3 button gone, `#evt-action-bar` becomes Back + Start Over only. It is `fixed bottom-[4.5rem] md:static` (line 1787) and the drawer is `fixed` z-`[55]`. Two fixed bars stacked at the bottom on mobile is the de-clutter complaint restated. Verify the Back/Start-Over bar and the drawer handle do not visually collide at 375px; if they do, that is a follow-up to reconcile the action bar against the drawer, but it can be a separate scoped change rather than a blocker for this one.

7. **Scope guard — EVT-only.** `#evt-action-bar`, `copySummary`, `buildEmrText`, and the bespoke result content are all local to `EvtPathway.tsx`. No other pathway file is touched. The only shared surface in scope is `CalculatorDrawer` via its `children` (no API change) and `PathwayHeader` (no change — header copy stays). Confirm the diff touches `src/pages/EvtPathway.tsx` plus the two review artifacts only.

## Blocking issues

None. Decision is approve-with-conditions. The structural shape is correct and matches two existing sibling implementations; the conditions are (a) the mandatory clinical-reviewer gate on relocated clinical text, (b) holding the line on no `CalculatorDrawer` API change, and (c) preserving the modal `customActionButton` path. Regression scope to hold byte-for-byte: verdict outcomes, `buildEmrText` output, the `isInModal`/`customActionButton` branch, and the header copy/share flow.
