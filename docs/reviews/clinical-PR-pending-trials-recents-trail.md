# Clinical review — PR (branch: trials-polish-and-cleanup-5g2)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-07

## Scope
- **Claims touched:** none authored. `legend.keyStat` (e.g., "NNT 6.5") re-surfaced verbatim from existing catalog data — no rewording, no new derivation.
- **Citations affected:** none. No citation records modified; no `last_reviewed` dates touched.
- **Surfaces changed (per §13.3):** none new. `RecentEntry.trail` slot rendered through `ToolRowCard` inside `RecentlyViewed.tsx` is an **existing** surface already live for `calculator`, `pathway`, and `guide` entry types. Adding `type: 'trial'` consumers does not introduce a new surface category — same field, same component, same renderer, same string-literal pathway. §13.3 new-surface gate does not trigger.

## Semantic validity
- Trail value is `catalogTrial?.legend?.keyStat` — a direct field reference, not a constructed string, not a template, not a paraphrase.
- Optional-chaining (`?.legend?.keyStat`) means trials without a populated legend record `undefined` → `RecentlyViewed` renders no trail at all. Fail-closed behavior — no fabricated trail, no fallback string.
- Never-drift categories: n/a (keyStat is a numeric/effect-size descriptor; no transformation applied).

## Citation accuracy
No citation records changed. The keyStat values on `catalogTrial.legend` were author-reviewed under prior commits in the trials-polish series. This PR does not alter, regenerate, or re-derive those values.

## Freshness
No `last_reviewed` field modified. No refresh required — no clinical claim text is authored, modified, or re-derived.

## No clinical logic change
Confirmed. No scoring thresholds, interpretation strings, algorithm branches, dose/route/window values, or recommendation gates touched. This is a presentation-layer wiring change: existing field → existing renderer slot via existing recents store.

## Rationale
Class C-clinical where the `-clinical` flag is precautionary, not substantive. The diff routes an already-reviewed string (`catalogTrial.legend.keyStat`) into an already-existing rendering surface (`RecentEntry.trail` → trail slot). No new claim is authored, no synthesis occurs, no logic changes. Clinical-safety surface area is identical to what shipped in prior commits that populated the legend records. Approve.

## Required follow-ups
- Non-blocking: if `legend.keyStat` is ever changed from a verbatim author-reviewed field to a runtime-derived string (e.g., recomputed from trial efficacy results), that change re-triggers a Class C-clinical or Class E review. Park as a forward note for any future PR touching the legend slice schema.
