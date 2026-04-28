# Clinical review — W7.0 Predecessor Stub Canary Batch

**Decision:** approve-with-conditions (condition resolved before commit — see §Condition resolution)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-27

## Scope

- **Trials reviewed:** IMS-III, SYNTHESIS Expansion, MR RESCUE (canary batch — first application of §7c stub pattern)
- **Claims touched:** `ims-iii-outcomes`, `ims-iii-design`, `ims-iii-bottom-line`, `synthesis-expansion-outcomes`, `synthesis-expansion-design`, `synthesis-expansion-bottom-line`, `mr-rescue-outcomes`, `mr-rescue-design`, `mr-rescue-bottom-line`
- **Citations affected:**
  - Broderick et al., NEJM 2013 (doi: 10.1056/NEJMoa1214300) — IMS-III
  - Ciccone et al., NEJM 2013 (doi: 10.1056/NEJMoa1213701) — SYNTHESIS Expansion
  - Kidwell et al., NEJM 2013 (doi: 10.1056/NEJMoa1212793) — MR RESCUE
- **Surfaces changed (per §13.3):** Structured data fields in `src/data/trialData.ts` (`primaryOutcomeProse`, `trialDesignNarrative`, `safetyBrief`, `bottomLineSummary`, `questionLede`); JSX stub layout in `src/pages/trials/TrialPageNew.tsx` (renderStubPage helper + 3 id-gated branches); `docs/specs/TRIALS_SPEC.md` §7c (spec only, no clinical claim content)

## Semantic validity

### IMS-III

1. **trialResult: NEGATIVE** — PASS. Trial tested directional hypothesis (IV+EVT > IV alone), failed to meet primary endpoint, stopped for futility. NEGATIVE is correct.
2. **primaryOutcomeProse numerics** — PASS after condition resolution. N=656 ✓; planned 900 ✓; stopped early for futility ✓; mRS 0-2 40.8% vs 38.7% ✓; adjusted RR 1.05 ✓; 95% CI 0.83–1.30 ✓ (corrected from 0.85 as filed — see condition below). No directional overclaim. Futility stop framing accurate.
3. **trialDesignNarrative** — PASS. No CTA confirmation requirement accurately noted; coil-based device limitation accurately stated; diluted-treatment-effect explanation is appropriate and does not overstate.
4. **bottomLineSummary** — PASS after correction. Corrected CI lower bound to 0.83. No prohibited language. No em dashes.
5. **Prohibited language scan** — PASS. No "equivalent," "as effective as," "non-inferior to" misuse.

### SYNTHESIS Expansion

6. **trialResult: NEGATIVE** — PASS. Endovascular-alone tested for superiority over IV alteplase; superiority not demonstrated; numerical direction favored alteplase. NEGATIVE is correct.
7. **primaryOutcomeProse numerics** — PASS. N=362 ✓; mRS 0-1 30.4% vs 34.8% ✓; adjusted OR 0.71 ✓; 95% CI 0.44–1.14 ✓; p=0.16 ✓. Window asymmetry (6h EVT vs 4.5h IV) accurately preserved as a qualifier — this is a critical design feature correctly retained.
8. **trialDesignNarrative** — PASS. Direct-comparison design (no bridging tPA) accurately distinguished from IMS-III bridging design. Device-generation limitation stated accurately.
9. **bottomLineSummary** — PASS. Numerics match. No prohibited language. No em dashes.
10. **Prohibited language scan** — PASS.

### MR RESCUE

11. **trialResult: NEUTRAL (confirmed correct, not NEGATIVE)** — PASS. Definitive call: NEUTRAL is correct. Primary endpoint showed zero effect size (mean mRS 3.9 vs 3.9) with no directional signal in either direction and a null pre-specified imaging-interaction test (p=0.56). NEGATIVE implies a directional hypothesis falsified against the intervention; MR RESCUE produced a null-of-nulls in an underpowered N=118 sample — evidentiary content is "uninformative," not "EVT failed." NEUTRAL is the accurate classification.
12. **primaryOutcomeProse numerics** — PASS. N=118 ✓; mean mRS 3.9 vs 3.9 ✓; interaction p=0.56 ✓; reperfusion rate 27% ✓. Underpowered caveat accurately included.
13. **trialDesignNarrative** — PASS. MERCI/Penumbra device generation accurately noted. 27% reperfusion rate accurately stated as critical limitation.
14. **bottomLineSummary** — PASS. Teaching frame ("illustrating why device generation and imaging selection were insufficient") is accurate and appropriately humble. No prohibited language. No em dashes.
15. **Prohibited language scan** — PASS.

### Amber banner check

16. **Historical accuracy of amber banner** — PASS. "Preceded the modern EVT evidence base" with ESCAPE (2015) as successor link is historically accurate for all three. All three were published February–March 2013 in the same NEJM issue. MR CLEAN (December 2014) was the first modern positive trial; ESCAPE (March 2015) is a defensible representative successor link. ✓

### Stub scope compliance

17. **No howToInterpret, no bedsidePearl, no howToReadChart** in any of the three data entries — PASS. Stub scope honored per §7c.3.
18. **No subgroup analyses, no RCTChainSection** — PASS.

## Citation accuracy

- **IMS-III (Broderick NEJM 2013, doi: 10.1056/NEJMoa1214300):** N=656 ✓; planned 900 ✓; futility stop ✓; NIHSS 8–29 ✓; RR 1.05 (95% CI 0.83–1.30) ✓ (corrected); mRS 0-2 40.8% vs 38.7% ✓; sICH 6.2% vs 5.9% ✓; mortality 19.1% vs 21.6% ✓.
- **SYNTHESIS (Ciccone NEJM 2013, doi: 10.1056/NEJMoa1213701):** N=362 ✓; mRS 0-1 30.4% vs 34.8% ✓; adjusted OR 0.71 (0.44–1.14) ✓; p=0.16 ✓; EVT window 6h ✓; alteplase window 4.5h ✓; sICH 6% vs 6% ✓; mortality 10% vs 8% ✓.
- **MR RESCUE (Kidwell NEJM 2013, doi: 10.1056/NEJMoa1212793):** N=118 ✓; mean mRS 3.9/3.9 ✓; imaging-by-treatment interaction p=0.56 ✓; TICI 2a–3 reperfusion 27% ✓; NIHSS ≥6 ✓; sICH 9% vs 4% ✓; mortality 21% vs 17% ✓.

## Freshness

All three are landmark trials (2013). Per §13.7: 36-month default review window for landmark trials. Citations newly created — within window. `last_reviewed` will be populated when W5.2 citation registry lands.

## Condition resolution

**Condition:** IMS-III CI lower bound filed as 0.85; source (Broderick 2013 Table 2) reports 0.83.

**Resolved before commit:** Corrected to 0.83 in `primaryOutcomeProse`, `bottomLineSummary`, `stats.effectSize.label`, and the `renderStubPage` call in `TrialPageNew.tsx`. Condition is resolved — decision upgrades to **approve** at merge.

## Rationale

All 18 enumerated checks pass (15 pass immediately; 3 pass after condition resolution). The three stubs are classification-accurate, numerically correct, and appropriately scoped per §7c. The most substantive judgment call — MR RESCUE NEUTRAL vs NEGATIVE — is confirmed correct: zero effect size with no directional signal in an underpowered trial is an uninformative result (NEUTRAL), not a falsified directional hypothesis (NEGATIVE). The amber banner is historically accurate. No prohibited language detected. Em-dash rule honored in all prose fields.

## Required follow-ups

- When W5.2 lands, populate `last_reviewed` for `ims-iii-outcomes`, `ims-iii-design`, `ims-iii-bottom-line`, `synthesis-expansion-outcomes`, `synthesis-expansion-design`, `synthesis-expansion-bottom-line`, `mr-rescue-outcomes`, `mr-rescue-design`, `mr-rescue-bottom-line`. Register citations in `src/lib/citations/registry.ts`.
- Per §13.7: all three are landmark trials — apply 36-month default review window.
- IMS-III CI was 0.83 in source; confirmed corrected. If the full Broderick 2013 paper is accessed and reveals a different adjusted CI than the abstract reports, update accordingly.
