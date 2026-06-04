# Clinical review — PR stroke-dead-control-fixes

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-06-03

## Scope
- Claims touched: none (no claim text modified). The `fxa-reversal-4fpcc-andexanet-withdrawn` claim string appears in two edited files (StrokeIchProtocolStep.tsx ICH_PROTOCOL_ITEMS index-2, HemorrhageProtocol.tsx STEPS index-5) and is byte-identical before and after.
- Citations affected: none modified. Mapped citations for the in-file claim verified still present and within window: aha-asa-2022-ich-anticoag-reversal, fda-andexxa-safety-2024, astrazeneca-andexxa-withdrawal-2025.
- Surfaces changed: static JSX + component event wiring in `src/components/article/stroke/` (StrokeIchProtocolStep.tsx, HemorrhageProtocol.tsx, PostTPAOrders.tsx). No clinical-data surface (`src/data/`, `src/lib/citations/`) touched.
- Evidence-verifier packet: not applicable — no new or changed clinical claim.
- Trial-statistician report: not applicable — no trial data changed.

## Semantic validity
Confirmed. The three changes are wiring-only:
1. StrokeIchProtocolStep — "Mark ICH protocol complete" button rewired from a no-op `onComplete` to an internal completed-state toggle that still calls `onComplete()`. No clinical text changed; ICH_PROTOCOL_ITEMS array byte-identical.
2. HemorrhageProtocol — added `handlePrint()` that re-emits the existing STEPS array text verbatim into a print window. No clinical text changed.
3. PostTPAOrders — added `handlePrint()` that re-emits the existing ORDERS array text verbatim. No clinical text changed.
New operational strings introduced ("ICH protocol marked complete", "Marked complete — continue documentation or start a new code.") carry no clinical assertion, dose, threshold, or recommendation.

## Citation accuracy
No citation text, section, year, or quote changed. The single in-file claimId and its three mapped citations are untouched.

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
Not applicable — no new trial entry in this PR.

## Freshness
All three citations mapped to the in-file claim remain within their §13.7 windows; no `last_reviewed` refresh required because no claim was re-asserted or modified.

## Rationale
This PR restores three dead interactive controls (one no-op completion button, two no-onClick print buttons) without altering any clinical claim, dose, threshold, drug name, evidence grade, or interpretation string. Print handlers re-emit existing array text verbatim. No clinical risk introduced.

## Required follow-ups
- none
