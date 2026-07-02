# Clinical review - PR aspects-evt-two-tier

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-01

## Scope
- Claims touched: aspects-evt-eligibility-2026
- Citations affected: aha-asa-2026-4.7.2, select2-trial-2023, angel-aspect-trial-2023, tension-trial-2023, laste-trial-2024
- Surfaces changed: getScoreInfo() 3-5 "Large Core" evtText in src/pages/AspectScoreCalculator.tsx (data-claim rendered) + the aspects-evt-eligibility-2026 description in src/lib/citations/claims.ts. Two surfaces per section 13.3.
- Evidence-verifier packet: not applicable (no new trial entry or statistics display; existing large-core EVT trial records unchanged).
- Trial-statistician report: not applicable (no p-values, NNT, mRS shift, or archetype change).

## Semantic validity
All six points confirmed against the authoritative in-repo mirror (src/data/aha2026StrokeGuideline.ts evtRecommendations.adults, lines 415-504) and registry quoted_text (aha-asa-2026-4.7.2).

1. 0-6h ASPECTS 3-5 = COR 1, LOE A as part of the ASPECTS 3-10 recommendation, gated only on NIHSS >=6 + prestroke mRS 0-1, no age or mass-effect gate. CONFIRMED (source lines 418-431; 3-5 is a subset of 3-10).
2. 6-24h ASPECTS 3-5 = COR 1, LOE A, selected (age <80, NIHSS >=6, prestroke mRS 0-1, no significant mass effect). CONFIRMED (source lines 448-464; registry quoted_text sentence 1).
3. 0-6h ASPECTS 0-2 = COR 2a, LOE B-R, selected (age <80, NIHSS >=6, prestroke mRS 0-1, no significant mass effect). CONFIRMED (source lines 466-473; both surfaces use "can reasonably be considered", not "recommended").
4. Trial attribution SELECT-2 / ANGEL-ASPECT / TENSION to the 3-5 strata and LASTE to the 0-2 stratum, not lumped. CONFIRMED (all four citation records resolve).
5. The two surfaces are mutually consistent (identical COR/LOE, qualifier sets, windows, trial attribution). CONFIRMED.
6. No overstatement, no invented statistics, no em-dashes in claim text; certainty markers map to COR (recommended = COR 1; can reasonably be considered = COR 2a). CONFIRMED.

Never-drift sweep: recommendation strength, action verbs, per-stratum qualifiers, certainty markers, and temporal constraints all preserved. The 0-6h 3-5 tier correctly omits the age/mass-effect gate because the governing 3-10 recommendation omits it.

## Citation accuracy
aha-asa-2026-4.7.2 version current; quoted_text supports both surfaces. Four large-core trial citations resolve with valid PMIDs (SELECT2 36762865, ANGEL-ASPECT 36762852, TENSION 37837989, LASTE 38718358).

## Freshness
aha-asa-2026-4.7.2 last_reviewed 2026-05-22 (about 6 weeks ago); within the 3-month thrombectomy window and the 6-month guideline default (section 13.7). Trial citations last_reviewed 2026-05-19, landmark; within window. Pass.

## Rationale
Both surfaces faithfully render the 2026 AHA/ASA section 4.7.2 large-core EVT recommendations as a correct two-tier structure. No never-drift category is violated, certainty markers map correctly to recommendation class, trial attribution is stratum-specific, all citations resolve and are in-window, and no mandatory-block condition is triggered.

## Required follow-ups
- (Optional, non-blocking) A code comment in AspectScoreCalculator.tsx used an em-dash; normalized to a hyphen for house style during commit. Not a claim-surface issue.
