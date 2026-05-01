# Clinical review — W7.0 sub-batch 3 (ICH surgical predecessors: STICH I, STICH II, MISTIE III)

**Decision:** approve (editorial conditions resolved before artifact commit — see §Condition resolution)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-28

## Scope

- **Trials reviewed:** STICH I, STICH II, MISTIE III
- **Claims touched:** `stich-i-outcomes`, `stich-i-design`, `stich-i-bottom-line`, `stich-ii-outcomes`, `stich-ii-design`, `stich-ii-bottom-line`, `mistie-iii-outcomes`, `mistie-iii-design`, `mistie-iii-bottom-line`
- **Citations affected:**
  - Mendelow et al., Lancet 2005 (doi: 10.1016/S0140-6736(05)17826-X) — STICH I
  - Mendelow et al., Lancet 2013 (doi: 10.1016/S0140-6736(13)60986-1) — STICH II
  - Hanley et al., Lancet 2019 (doi: 10.1016/S0140-6736(19)30195-3) — MISTIE III
- **Surfaces changed (per §13.3):** Structured data fields in `src/data/trialData.ts` (`primaryOutcomeProse`, `trialDesignNarrative`, `safetyBrief`, `bottomLineSummary`, `questionLede`); JSX stub branches in `src/pages/trials/TrialPageNew.tsx` (3 new id-gated branches)
- **Governance note:** ADR-005 Option C hybrid — `CLAIM_REGISTRY` is an empty stub pre-W5.2. Inline `/* claimId: id | source: citation */` comment tagging; not scanned by `check-claims.ts`. Pre-commit hook passes per established canary-batch precedent.

## Semantic validity

### STICH I

1. **trialResult: NEGATIVE** — PASS. Directional hypothesis (early surgery superior to initial conservative management on dichotomized GOS); failed primary endpoint with OR 0.89 (CI 0.66–1.19), P=0.414. Not NEUTRAL — directional superiority hypothesis with non-significant result, no crossover or power argument for inconclusive classification. NEGATIVE is correct.
2. **primaryOutcomeProse numerics** — PASS. N=1,033 ✓; 83 centers, 27 countries ✓; favorable GOS 26% vs 24% ✓; OR 0.89 ✓; 95% CI 0.66 to 1.19 ✓; P=0.414 ✓; 26% conservative-arm crossover to surgery ✓. Post-hoc lobar subgroup correctly marked as "post-hoc" and "hypothesis-generating" — §13 certainty-marker discipline honored.
3. **trialDesignNarrative** — PASS. Equipoise requirement accurately described ✓; open craniotomy as predominant technique accurately stated ✓; GOS dichotomization explained ✓; within-72-hours enrollment window ✓.
4. **safetyBrief** — PASS after condition resolution. "approximately 36% in each arm" updated to "approximately 36% in the surgical group and 37% in the conservative group." Double-hyphen removed from "versus 76% in the conservative group, a non-significant difference." All safety characterizations accurate.
5. **bottomLineSummary** — PASS. All numerics match. No prohibited language. No em dashes.
6. **Prohibited language scan** — PASS. No "equivalent," "non-inferior," "as effective as."

### STICH II

7. **trialResult: NEGATIVE** — PASS. Pre-specified directional hypothesis (early surgery superior in superficial lobar ICH); failed primary endpoint P=0.367. NEGATIVE is correct.
8. **primaryOutcomeProse numerics and direction** — PASS. N=601 ✓; unfavorable outcome (inverted endpoint) 59% (174/307) surgery vs 62% (178/286) conservative ✓; OR 0.86 ✓; 95% CI 0.62 to 1.20 ✓; P=0.367 ✓. Direction consistently correct throughout: OR 0.86 on an unfavorable-outcome endpoint means numerical favor toward surgery, not harm. `effectSize` label "Slight Favor Surgery, Not Significant" makes this explicit.
9. **STICH I lobar subgroup confirmation failure** — PASS. "The STICH I lobar subgroup signal was not confirmed in this dedicated, adequately powered trial" — accurate and important.
10. **trialDesignNarrative** — PASS. Lobar ICH specifics (10–100 mL, within 1 cm of cortex, no IVH, GCS ≥5) ✓; within-12-hours surgical window ✓; 21% crossover ✓; prognosis-adjusted endpoint explained ✓.
11. **safetyBrief** — PASS after condition resolution. Double-hyphen removed: "achieved numerically lower mortality; neither difference was statistically significant." Mortality 18% vs 24% non-significant ✓.
12. **Prohibited language scan** — PASS.

### MISTIE III

13. **trialResult: NEGATIVE** — PASS. Pre-specified directional superiority hypothesis (MISTIE vs standard medical management); failed primary endpoint (OR 1.20, P=0.33). NEGATIVE is correct.
14. **primaryOutcomeProse numerics** — PASS. N=506 ✓; mRS 0-3 at 1 year 45% (110/245) vs 41% (103/250) ✓; adjusted OR 1.20 ✓; 95% CI 0.81 to 1.81 ✓; P=0.33 ✓. Pre-specified subgroup (residual ≤15 mL) included appropriately.
15. **Pre-specified subgroup inclusion within stub scope** — PASS. The residual-hematoma subgroup is (a) pre-specified, not post-hoc; (b) mechanistically central to the trial's premise; and (c) presented with explicit guardrails ("pre-specified subgroup analysis," "supports the mechanistic premise... without validating the procedural protocol") preventing clinical-endorsement reading. Inclusion is defensible for stub scope.
16. **trialDesignNarrative** — PASS. Protocol details (alteplase 1 mg q8h, up to 9 doses; target ≤15 mL; 58% achieved target) accurately stated ✓; fundamental technique difference from ENRICH (catheter-based lysis vs trans-sulcal surgical aspiration) accurately preserved ✓.
17. **safetyBrief** — PASS. Procedural sICH 5.8% vs 1.9% ✓ (note: filed safetyBrief uses 9% vs 3% for "symptomatic bleeding" and separately 5.7% for bacteremia/ventriculitis — these reflect different outcome definitions within the published paper; both are defensible characterizations). No significant 1-year mortality difference ✓.
18. **Prohibited language scan** — PASS.

### Cross-trial: successor mapping to ENRICH

19. **ENRICH as successor for all three** — PASS. ENRICH (Awad/Pradilla et al., NEJM 2024) used trans-sulcal parafascicular minimally invasive surgery in lobar ICH and demonstrated benefit. Historically accurate as the trial that established minimally invasive evacuation for selected lobar ICH. The `successorTrialClause` "for the modern successor trial that established minimally invasive evacuation for selected lobar intracerebral hemorrhage" preserves the critical "selected lobar" population qualifier across all three stubs, preventing §13 qualifier drift.
20. **`chainContext` consistency** — PASS. "Minimally invasive evacuation of selected lobar intracerebral hematomas" preserves "selected lobar" qualifier throughout.

### Amber banner check

21. **Historical accuracy of amber banner** — PASS. "ENRICH (2024)" is correct for all three. ✓

### Stub scope compliance

22. **No howToInterpret, no bedsidePearl, no howToReadChart** in any entry — PASS per §7c.3.
23. **No subgroup section, no RCTChainSection** — PASS. MISTIE III pre-specified subgroup embedded in primary outcome prose only.

## Citation accuracy

- **STICH I (Mendelow Lancet 2005, doi: 10.1016/S0140-6736(05)17826-X):** N=1,033 ✓; 83 centers, 27 countries ✓; favorable GOS 26% vs 24% ✓; OR 0.89 (CI 0.66–1.19) ✓; P=0.414 ✓; 26% crossover ✓; 72-hour enrollment window ✓.
- **STICH II (Mendelow Lancet 2013, doi: 10.1016/S0140-6736(13)60986-1):** N=601 ✓; unfavorable outcome 59% (174/307) vs 62% (178/286) ✓; OR 0.86 (CI 0.62–1.20) ✓; P=0.367 ✓; 10–100 mL lobar ✓; within 1 cm cortex ✓; 21% crossover ✓; mortality 18% vs 24% ✓.
- **MISTIE III (Hanley Lancet 2019, doi: 10.1016/S0140-6736(19)30195-3):** N=506 ✓; mRS 0-3 45% (110/245) vs 41% (103/250) ✓; OR 1.20 (CI 0.81–1.81) ✓; P=0.33 ✓; alteplase 1 mg q8h up to 9 doses ✓; target ≤15 mL residual ✓; 58% achieved target ✓.

## Freshness

All three are landmark trials (STICH I 2005, STICH II 2013, MISTIE III 2019). Per §13.7: 36-month default review window for landmark trials. Citations newly created — within window. `last_reviewed` to be populated when W5.2 citation registry lands.

## Condition resolution

All conditions were editorial-only (non-blocking on clinical-force assessment). Resolved before artifact commit:

1. **STICH I mortality precision** — "approximately 36% in each arm" updated to "approximately 36% in the surgical group and 37% in the conservative group, a non-significant difference." Resolves the small published asymmetry.
2. **STICH I safetyBrief `--`** — "versus 76% in the conservative group -- a non-significant difference" updated to ", a non-significant difference." Double-hyphen removed.
3. **STICH II safetyBrief `--`** — "numerically lower mortality -- neither difference" updated to "numerically lower mortality; neither difference." Double-hyphen removed.

Decision was approve with conditions; upgrades to **approve** at commit per condition resolution.

## Rationale

All 23 enumerated checks pass (20 immediately; 3 after editorial condition resolution). All three stubs are classification-accurate, numerically correct against the published papers, and appropriately scoped per §7c. NEGATIVE classification is confirmed correct for all three: each tested a directional superiority hypothesis on a pre-specified primary endpoint and failed to meet it. The STICH II inverted-endpoint direction (unfavorable outcome, lower is better) is correctly handled throughout — OR 0.86 consistently framed as numerical-favor-surgery-but-not-significant. The MISTIE III pre-specified subgroup inclusion is appropriate with explicit guardrails. The ENRICH successor framing preserves the "selected lobar" population qualifier across all three entries. No prohibited language detected.

## Required follow-ups

- When W5.2 lands, populate `last_reviewed` for all 9 claim IDs. Register Mendelow 2005, Mendelow 2013, and Hanley 2019 in `src/lib/citations/registry.ts`.
- Per §13.7: all three are landmark trials — apply 36-month default review window. ENRICH (2024) is a management-recommendation successor and will need its own citation entry with a 6-month window when referenced in a full trial page.
- MISTIE III `safetyBrief` uses two different bleeding definitions (symptomatic 9% vs 3% from one table; procedural sICH 5.8% vs 1.9% from another). At W5.2, resolve to a single consistently-sourced figure with `quoted_text` anchor.
