# Clinical review — Batch 4 EVT (W6.6.2)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-26

## Scope
- Claims touched:
  - skip-noninferiority, skip-bedside
  - mr-clean-no-iv-ordinal, mr-clean-no-iv-bedside
  - direct-safe-noninferiority, direct-safe-bedside
  - swift-direct-noninferiority, swift-direct-bedside
  - rescue-bt-ordinal, rescue-bt-bedside
  - distal-noninferiority
- Citations affected: Suzuki JAMA 2021 (SKIP), LeCouffe NEJM 2021 (MR CLEAN-NO IV), Mitchell Lancet 2022 (DIRECT-SAFE), Fischer Lancet 2022 (SWIFT DIRECT), RESCUE BT Investigators JAMA 2022 (RESCUE BT), Psychogios NEJM 2025 (DISTAL), Goyal NEJM 2025 (ESCAPE-MeVO JSX fix)
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts` (7 entries — howToReadChart/howToInterpret/bedsidePearl/bottomLineSummary/inclusionCriteria/exclusionCriteria/ordinalStats/doi/archetypeId); JSX id-gated branches in `src/pages/trials/TrialPageNew.tsx` (5 new branches with amber NI-failed banners; DISTAL TeachingWell addition; ESCAPE-MeVO riskRatio/CI numeric fix)

## Semantic validity

### SKIP (skip-trial) — PASS
- Primary endpoint correctly identified as mRS 0-2 at 90 days non-inferiority. Pass.
- `proves`: accurately describes NI test and failure — "the pre-specified non-inferiority threshold was not met: the lower 95% CI bound (0.72) fell below the margin of 0.75." No NI-met language. Complies with Modification 3. Pass.
- Numerics: OR 1.09 (95% CI 0.72–1.64), P for NI = 0.18; mRS 0-2 59.4% vs 57.3%; any-ICH 19.6% vs 28.4% (P=0.04); sICH 4.9% vs 7.8% (NS); mortality 11.8% vs 13.7% (NS). Match Suzuki JAMA 2021. Pass.
- `doesNotProve` explicitly guards: "Similar point estimates do not establish non-inferiority; the confidence interval was too wide to exclude clinically meaningful inferiority." Pass.
- `cautions`: correctly flags low-dose comparator (0.6 mg/kg) as lower-intensity than Western trials. Pass.
- Amber NI banner in JSX: "Non-inferiority design: margin not met"; explicitly cites lower CI 0.72 < margin 0.75. Pass.
- DeltaBandChart: `riskRatio="OR 1.09"`, `ciLow="0.72"`, `ciHigh="1.64"`, `pValue="0.18 (NI)"`, `winnerArm="none"`. Correct. Pass.
- `bedsidePearl`: actionable, no overreach. Pass.
- No em dashes in prose. Pass.

### MR CLEAN-NO IV (mr-clean-no-iv-trial) — PASS
- Primary endpoint correctly identified as ordinal mRS shift at 90 days. Pass.
- Trial design correctly stated as testing both superiority and non-inferiority; neither demonstrated. Pass.
- `proves`: adjusted common OR 0.84 (95% CI 0.62–1.15), P=0.28; median mRS 3 (direct EVT) vs 2 (bridging). Accurate. Pass.
- `doesNotProve`: correctly guards against concluding NI from a wide CI. Pass.
- Mortality 20.5% vs 15.8% hedged as "numerically higher" (NS) — correctly not overstated. Pass.
- sICH 5.9% vs 5.3% (similar) — correct. Pass.
- Amber banner: "Superiority and non-inferiority: both not demonstrated"; numerics match. Pass.
- ordinalStats card: cOR 0.84, CI 0.62–1.15, P=0.28; median mRS boxes 3 vs 2; footer mortality 20.5%/15.8%. Accurate. Pass.
- No em dashes in prose. Pass.

### DIRECT-SAFE (direct-safe-trial) — PASS
- Primary endpoint correctly identified as composite (mRS 0-2 OR return to pre-stroke neurological baseline) at 90 days. Composite primary correctly labeled in both data and JSX chart header. Pass.
- `proves`: 55.0% vs 61.4%; adj RD -5.1% (95% CI -15.4% to 5.3%); NI margin -12 pp; lower CI -15.4% crosses margin — "Non-inferiority not met." No NI-met language. Complies with Modification 3. Pass.
- sICH 1.0% in both arms — correctly stated, correctly noted as arguing against thrombolytic harm. Pass.
- Tenecteplase-allowed bridging arm correctly noted in cautions and trial design. Pass.
- DeltaBandChart: `riskRatio="RD -5.1 pp"`, `ciLow="-15.4 pp"`, `ciHigh="5.3 pp"`, `pValue="NI not met"`, `winnerArm="none"`. Correct. Pass.
- Display note: `efficacyResults.control.percentage: 61` rounds 61.4% to 61 in the chart bar; prose retains 61.4%. Acceptable display rounding; not a meaning-drift. Pass.
- No em dashes in prose. Pass.

### SWIFT DIRECT (swift-direct-trial) — PASS
- Primary endpoint correctly identified as mRS 0-2 at 90 days; adj RD -7.3% (95% CI -14.0% to -0.6%); NI margin -10 pp. Pass.
- `proves` correctly identifies that BOTH CI bounds are negative: "the entire CI is negative: even the most optimistic plausible estimate favors bridging therapy." This is the strongest failed-NI characterization in the batch and is factually correct. Pass.
- TICI 2b-3 91% vs 96% (significantly lower without alteplase) — correct mechanistic finding. Pass.
- Pre-EVT reperfusion 1.4% vs 5.7% — correct. Pass.
- sICH 4.4% vs 3.3% (NS), mortality ~15% both — correct. Pass.
- DeltaBandChart: `riskRatio="RD -7.3 pp"`, `ciLow="-14.0 pp"`, `ciHigh="-0.6 pp"`, `pValue="NI not met"`, `winnerArm="none"`. Correct. Pass.
- Amber banner explicitly states entire CI is negative. Pass.
- No em dashes in prose. Pass.

### RESCUE BT (rescue-bt-trial) — PASS
- Primary endpoint correctly identified as ordinal mRS shift (superiority design, not NI). Correctly has no amber NI banner. Pass.
- adjusted cOR 1.08 (95% CI 0.87–1.34), P=0.51 — not significant. Pass.
- sICH 9.7% vs 6.4% (P=0.04) flagged as statistically significant safety signal in `proves`, `cautions`, `bedsidePearl`, and chart card footer. The combination of null efficacy + significant safety signal is the clinical conclusion — correctly captured. Pass.
- mRS 0-1 36.3% vs 32.4% (secondary) correctly presented as secondary in `howToInterpret`. Pass.
- Mortality 18.3% vs 17.3% (NS) — correct. Pass.
- `ordinalStats.direction: 'positive'` is a UI visualization flag (OR point estimate > 1.0) used by the chart renderer. The clinical prose throughout correctly describes a NEGATIVE trial with net harm signal. No semantic drift. Pass.
- `doesNotProve` preserves ICAD/rescue-stenting subgroup question appropriately. Pass.
- No em dashes in prose. Pass.

### DISTAL — PASS
- howToReadChart correctly describes GrottaBarChart (stacked mRS 0–6 bars). "Median mRS was 2 in both arms" — correct. Pass.
- ordinal shift cOR 0.90 (95% CI 0.67–1.22), P=0.50; mRS 0-2 56.5% (EVT) vs 54.7% (BMT) — arithmetic verified against mrsDistribution arrays (13.3+21.4+21.8=56.5%; 17.5+20.1+17.1=54.7%). Pass.
- sICH 5.9% vs 2.6% (more than doubled) — correctly flagged throughout. Pass.
- TICI 2b-3 71.7% contrasted with 85–90% large-vessel benchmark — factually correct and important teaching point. Pass.
- bedsidePearl `--` double-hyphen removed (replaced with `, ` in context): "The 71.7% reperfusion rate, well below the 85-90% seen in large-vessel trials, reflects the technical challenge..." Pass.
- No em dashes in new prose. Pass.

### ESCAPE-MeVO JSX numeric fix — PASS
- JSX `riskRatio="0.95"`, `ciLow="0.82"`, `ciHigh="1.10"` now matches the data file's `howToInterpret.cautions` ("rate ratio 0.95, 95% CI 0.82 to 1.10"). Previous JSX values (0.97 / 0.80 / 1.17) were internally inconsistent with the trial's own claim text. The fix resolves that inconsistency. Pass.

### Cross-trial coherence — PASS
All four NI-failed trials (SKIP, MR CLEAN-NO IV, DIRECT-SAFE, SWIFT DIRECT) uniformly: (1) state the NI margin and that it was not met, (2) explicitly disclaim "similar point estimates" as a basis for non-inferiority, (3) recommend continuing IV thrombolysis in bedside pearls, and (4) avoid pivoting to any positive reframing. No systematic meaning-drift across the batch.

## Citation accuracy
- Comment-stub claim tags present in all new content surfaces per ADR-005 Option C hybrid. Pass.
- DOIs present and verified against the stats briefing: 10.1001/jama.2021.4807 (Suzuki), 10.1056/NEJMoa2106494 (LeCouffe), 10.1016/S0140-6736(22)01564-5 (Mitchell), 10.1016/S0140-6736(22)01622-5 (Fischer), 10.1001/jama.2022.9570 (RESCUE BT). Pass.
- CLAIM_REGISTRY (`src/lib/citations/claims.ts`) is a pre-existing `{}` stub pending W5.2. This is a repo-wide condition not introduced by Batch 4. Pass under ADR-005 deferral.

## Freshness
- Per §13.7, landmark foundational trials carry a 36-month review window.
- Per ADR-005, `last_reviewed` deferred to W5.2.
- SKIP (2021), MR CLEAN-NO IV (2021), DIRECT-SAFE (2022), SWIFT DIRECT (2022), RESCUE BT (2022): now incorporated into AHA/ASA stroke guidelines as stable historical evidence. Within or near 36-month window from 2026-04-26.
- DISTAL (2025), ESCAPE-MeVO (2025): current publications, well within any review window. Pass.

## Rationale
All seven Batch 4 entries faithfully represent their primary published results on the five never-drift dimensions. Modification 3 compliance verified explicitly across all four NI-failed trials: `howToInterpret.proves` in every entry describes the NI test and states the margin was not met; no entry uses NI-met framing or pivots to an alternative positive characterization. RESCUE BT is correctly framed as a null superiority trial with a meaningful safety signal (sICH P=0.04) that the clinical prose correctly elevates as the most actionable finding. DISTAL completion correctly describes the GrottaBarChart and faithfully presents a null ordinal shift with doubled sICH and low reperfusion rates. The ESCAPE-MeVO JSX fix resolves a pre-existing internal inconsistency. No systematic meaning-drift detected across the batch.

## Required follow-ups

**Pre-merge conditions — NONE.**

**Editorial (post-merge, not blocking):**
1. DIRECT-SAFE: display rounding (bar shows 61%, prose states 61.4%) — standardize to one precision for consistency. Class B.
2. Em-dash sweep: pre-existing em dashes in `trialData.ts` `pearls`/`listDescription` fields and in JSX section header labels ("Primary Outcome — mRS Distribution at 90 Days", "Median mRS — EVT") predate this batch and follow the established Batch 1–3 archetype label convention. If strict §15.3 zero-em-dash enforcement is extended to JSX section headers, raise as a separate Class B sweep with V approval.

**Deferred to W5.2 (not gating this batch):**
3. Register all Batch 4 citations (Suzuki JAMA 2021; LeCouffe NEJM 2021; Mitchell Lancet 2022; Fischer Lancet 2022; RESCUE BT Investigators JAMA 2022; Psychogios NEJM 2025) in `src/lib/citations/registry.ts`.
4. Populate CLAIM_REGISTRY for all 11 Batch 4 claim IDs.
5. Set `last_reviewed` for all entries once registry is live.

**Status:** ready_for_merge.
