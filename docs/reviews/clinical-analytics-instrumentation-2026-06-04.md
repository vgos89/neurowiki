# Clinical review — analytics instrumentation (disclaimer funnel + calculator usage)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-04
**Change origin:** External agent (Codex) drafted the diff per an approved analytics plan; verified and gated in-repo per CLAUDE.md §6 (audit ≠ approval) and §13.1 (metadata validity ≠ medical validity).

## Scope
- Claims touched: none
- Citations affected: none
- Surfaces changed: calculator interpretation surfaces (NIHSS, ASCVD pages) and the global disclaimer modal — instrumentation only, no clinical copy
- Evidence-verifier packet: not applicable — no trial/guideline data changed
- Trial-statistician report: not applicable

## Semantic validity
Independently verified each file against the analytics-only claim:
- `src/utils/analytics.ts` — new `trackDisclaimerShown()` fires a single gtag `disclaimer_shown` event (`event_category: 'compliance'`); no clinical text.
- `src/components/DisclaimerModal.tsx` — adds a best-effort lazy-import call after the pre-existing `setIsOpen(true)`; disclaimer wording, version gating, and acknowledgment logic untouched.
- `src/pages/NihssCalculator.tsx` — `calculateTotal` / `calculateLvoProbability` imports and `total` computation unchanged; `trackResult(total)` and `trackResult(0)` pass the already-computed score, not a recomputation; `total, trackResult` correctly added to the useEffect deps; NIHSS_ITEMS, point values, severity brackets, LVO/RACE prose byte-identical.
- `src/pages/AscvdRiskCalculator.tsx` — `result` (useMemo) unchanged; tier decision `tierOf(result)`, TIER_META, display, and EMR summary all consume **full-precision** `result`. The `Number(result.toFixed(1))` rounding is confined to the GA4 event payload and never flows back into any displayed score or tier decision.

## Citation accuracy
Not applicable — no citations touched.

## Editorial / expert context
Not applicable — no new trial entry in this change.

## Freshness
Not applicable — no citation `last_reviewed` dates touched.

## Rationale
Pure instrumentation. No clinical claim, scoring value, threshold, or interpretation string was altered in any of the four files. The single semantic risk — the ASCVD payload rounding — was confirmed isolated to analytics and never reaches clinical logic or display. No never-drift category implicated.

## Required follow-ups
- none
