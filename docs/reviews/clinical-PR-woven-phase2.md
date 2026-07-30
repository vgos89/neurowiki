# Clinical review — WOVEN Phase 2

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-30

## Scope
- Claims touched: `woven-primary-result` (new)
- Citations affected: `alexander-woven-2021` (new)
- Surfaces changed: structured data (`src/data/trialData.ts` `woven-trial`), computed chart props + JSX (`src/pages/trials/TrialPageNew.tsx` woven block + BottomLineDrawer call site), shared components (`BenchmarkThresholdChart.tsx` reference mode; `BottomLineDrawer.tsx` new `resultBadgeOverride` prop), bedside-pearl surface (claim), catalog/card/legend/sitemap/question wiring
- Evidence-verifier packet: `docs/evidence-packets/2026-07-22-icad-refresh.md` §3 + §8 (WOVEN block added 2026-07-30)
- Trial-statistician report: packet §3 (archetype G, single-arm-registry, descriptive only, Clopper-Pearson CI 4.3–14.8%) and §6 axis-2 guardrail (single-arm safety benchmarks, no efficacy, no class above IIb)

## Semantic validity

**Phase-1 render blocker resolved and verified across all three WOVEN result surfaces.** The prior block was raised because the descriptive single-arm rate was rendered as a false pass/fail. All three result-bearing surfaces are now non-valenced:
- **Chart (Primary Outcome):** `BenchmarkThresholdChart` `mode="reference"` — single-arm track, neutral slate fill/CI/line, pill reads "Single-arm, no control", dashed line labeled a historical reference, aria-label states "shown for context, not a pre-specified benchmark". No two-bar controlled comparison.
- **Bottom Line drawer (the residual block):** the drawer receives `resultBadgeOverride="Single-arm, no control"`. When set, `resultLabel` is replaced and `badgeKey` is forced to `NEUTRAL` (slate), so the `SAFETY_MET` → green "Safety benchmark met" label can no longer render for WOVEN. The handle reads "Bottom Line · Single-arm, no control · WOVEN". WEAVE is not regressed (no override; retains its correct "Safety benchmark met"). `BottomLineDrawer` is the sole consumer of the enum.
- **List-card legend:** `bottomLineTag: 'Safety'`, `keyStat: '8.5% 1-yr (single-arm)'`, single-arm finding — non-valenced.

**`SAFETY_MET` / `safety-threshold-met` tokens ratified.** With the drawer override in place the enum no longer contradicts the "no pre-specified threshold" prose on any surface. The single-arm / no-control / cannot-establish-efficacy / different-population / no-pre-specified-threshold caveats remain prominent on the chart lede, historicalContext caveat, howToReadChart, howToInterpret, and bedsidePearl.

**Numbers vs packet §3 confirmed:** 8.5% (11/129); 7 strokes (6 minor, 1 major); no deaths beyond the periprocedural period; 129 of 152 (~85% retention); 12 of 24 sites; the 8.5% includes the 4 WEAVE periprocedural events; CI 4.3–14.8% Clopper-Pearson exact (computed).

## Citation accuracy
`alexander-woven-2021`: PMID 32561658, DOI 10.1136/neurintsurg-2020-016208, JNIS 2021;13(4):307–310 — all match packet §3. `quoted_text` fully supports `woven-primary-result`. Claim→citation mapping correct (BEDSIDE_PEARL_SURFACE).

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
WOVEN is a new full trial entry, so mandatory-block #8 applies. Packet §8 now contains a dedicated WOVEN block with all four sub-items filled/declared: §8a not applicable with reason (single-arm surveillance report, none located, searched 2026-07-30); §8b explicit "none located, searched 2026-07-30"; §8c anchored to AHA/ASA 2021 SP §5.5 on-label Wingspan Class 2b LOE B-R, no reclassification; §8d no WOVEN-specific subsequent RCT/meta-analysis (CASSISS 2022 + BASIS 2024 cover the subsequent randomized evidence). Verification note updated. No silent omission remains.

## Freshness
`alexander-woven-2021`: last_reviewed 2026-07-22, review_window_months 36; today 2026-07-30 → 8 days, within window. No em-dashes (humanizer gate 0). Pass.

## Rationale
Both prior mandatory blocks are resolved and independently verified: the Bottom Line drawer no longer renders a "Safety benchmark met" claim for WOVEN (a neutral `resultBadgeOverride` replaces the enum-derived label and forces slate styling, WEAVE unregressed), so no surface asserts a pass/fail the trial's own record and cited source say does not exist; and packet §8 now covers WOVEN with all four sub-items explicitly filled or declared. Numbers match packet §3, the citation resolves and supports the claim, freshness is within window, no never-drift-category drift remains. Approved.

## Required follow-ups
- [non-blocking, hardening] `trialResult: 'SAFETY_MET'` is neutralized on WOVEN only by a per-call-site `resultBadgeOverride`. `BottomLineDrawer` is currently the sole consumer of that enum. If a future surface consumes `trialResult` for single-arm registry trials, add a dedicated descriptive result state or a guard so the enum cannot re-introduce a pass/fail badge without an explicit override. Advisory only.
