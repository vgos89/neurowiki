# Clinical review: RCT predecessor chain (first-generation thrombectomy 2013 to modern EVT 2015)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05

## Scope
- Claims touched: rctChain.chainNarrative + rctChain.whatChanged on mr-clean-trial; predecessor cards for IMS-III, SYNTHESIS Expansion, MR RESCUE; currentTrialResult (MR CLEAN).
- Citations affected: Berkhemer NEJM 2015 (MR CLEAN); predecessor facts sourced from the reviewed W7.0 stubs (Broderick NEJM 2013, Ciccone NEJM 2013, Kidwell NEJM 2013).
- Surfaces changed (§13.3): structured data in src/data/trialData.ts (rctChain on mr-clean-trial) rendered as a "what changed" predecessor timeline on the MR CLEAN page (TrialPageNew §7b).
- Evidence-verifier packet: not applicable (predecessor facts reuse already-reviewed stubs).
- Trial-statistician report: not applicable.

## Resolution of the prior block
The first pass blocked on one synthesis error with three parts, all now fixed:
1. MR RESCUE mischaracterization resolved. chainNarrative now states MR RESCUE required a confirmed proximal occlusion and failed due to first-generation device reperfusion plus non-discriminating penumbral imaging. Matches the mr-rescue-trial stub (inclusion: proximal anterior circulation LVO on CTA or MRA; ~27% reperfusion; interaction p=0.56). The "no CTA-confirmed LVO" property is now scoped to IMS-III and SYNTHESIS only.
2. Device descriptor corrected: "coil-based retrieval devices" replaced with "first-generation devices (intra-arterial tPA, MERCI, Penumbra)", accurate across all three predecessors.
3. whatChanged corrected: CTA selection is now attributed as "the ingredient IMS-III and SYNTHESIS lacked", not universally absent.

## Semantic validity
Confirmed. No drift in any never-drift category. Causal framing is appropriately hedged ("device generation, reperfusion success, and patient selection, not the concept of thrombectomy"). Per-card facts (IMS-III 40.8% vs 38.7%, RR 1.05; SYNTHESIS mRS 0-1 OR 0.71; MR RESCUE mean mRS 3.9 vs 3.9) and MR CLEAN currentTrialResult (adjusted common OR 1.67, 95% CI 1.21 to 2.30; mRS 0-2 32.6% vs 19.1%) match their sources. No new overstatement.

## Citation accuracy
Predecessor facts cross-checked against the reviewed stubs. The chain card IMS-III CI (95% CI 0.83 to 1.30) matches the published adjusted figure. MR CLEAN ordinal statistics are consistent across rctChain.currentTrialResult, ordinalStats, and howToInterpret.proves.

## Freshness
Landmark trials (36-month window per §13.7). Within window. No refresh triggered by this copy addition.

## Required follow-ups
1. Non-blocking, pre-existing, out of scope for this change: the ims-iii-trial stub is internally inconsistent on the IMS-III 95% CI lower bound. listDescription and pearls read "0.85-1.30"; stats.effectSize.label, primaryOutcomeProse, and bottomLineSummary read "0.83-1.30". The published adjusted value is 0.83. Normalize all five fields in the stub to 0.83 in a separate C-clinical task. The rctChain card is already correct (0.83) and is unaffected.
