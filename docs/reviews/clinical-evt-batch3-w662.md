# Clinical review — Batch 3 EVT (W6.6.2)

**Decision:** approve-with-conditions (conditions resolved before merge)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-25

## Scope
- Claims touched:
  - direct-mt-noninferiority, direct-mt-bedside
  - devt-noninferiority, devt-bedside
  - compass-noninferiority, compass-bedside
  - aster-null-difference, aster-bedside
  - aster2-null-difference, aster2-bedside
- Citations affected: Yang NEJM 2020 (DIRECT-MT), Zi JAMA 2021 (DEVT), Turk Lancet 2019 (COMPASS), Lapergue JAMA 2017 (ASTER), Lapergue JAMA 2021 (ASTER2)
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts` (5 entries — proves/doesNotProve/cautions/bedsidePearl/bottomLineSummary/howToReadChart/inclusionCriteria/exclusionCriteria); JSX id-gated branches in `src/pages/trials/TrialPageNew.tsx` (5 new branches with amber NI/procedural-endpoint banners); trialResult corrections for ASTER and ASTER2 (NEGATIVE→NEUTRAL); specialDesign corrections (negative-trial→neutral-trial)

## Semantic validity

### DIRECT-MT (direct-mt-trial) — PASS
- Primary endpoint correctly labeled: mRS Ordinal Shift at 90 Days (Non-inferiority). Pass.
- `proves`: NI met at OR margin 0.80, lower bound 0.81 just cleared margin (0.81 vs 0.80). Does not claim superiority. Pass.
- Numerics: cOR 1.07 (95% CI 0.81–1.40), mRS 0-2 62.0% vs 58.5%, pre-EVT reperfusion 2.4% vs 7.0%, sICH 4.3% both, mortality 17.7% vs 18.8%. Match Yang NEJM 2020. Pass.
- `doesNotProve`: not superiority; not drip-and-ship; not tenecteplase. No overreach. Pass.
- `cautions`: narrow CI margin; lower pre-EVT reperfusion; Chinese tertiary centers. Accurate. Pass.
- `bedsidePearl`: "Continue IV thrombolysis per AHA/ASA recommendations unless local data and workflow support omission." Conservative, guideline-aligned. Pass.
- JSX DeltaBandChart: winnerArm="none", pValue="0.04 (NI)". No winner implied. Pass.
- Amber NI banner: "tested whether direct EVT is no worse than bridging alteplase, not whether it is better." Pass.
- No em dashes in prose. Pass.

### DEVT (devt-trial) — PASS
- Primary endpoint correctly labeled: mRS 0-2 at 90 Days (Non-inferiority). Pass.
- `proves`: NI met at -10 pp margin; stopped early for efficacy of NI. Does not claim superiority. Pass.
- `doesNotProve`: "The numerical advantage for direct EVT (54.3% vs 46.6%) does not establish superiority. Early stopping inflates the apparent effect size, and the wide -10 pp NI margin permits clinically meaningful harm that the data cannot exclude." Strong, correct anti-superiority guard. Pass.
- Numerics: N=234, mRS 0-2 54.3% vs 46.6%, RD +7.7 pp (95% CI -2.9 to 18.2), P-NI 0.003, sICH 4.3% vs 3.4%, mortality 14.7% vs 18.8%. Match Zi JAMA 2021. Pass.
- Amber NI banner (resolved pre-merge): "Non-inferiority design: wide margin" (em dash removed). Pass.
- `bedsidePearl`: "The numerical 7.7 pp benefit favoring direct EVT is not superiority; treat as hypothesis-generating." Pass.
- JSX DeltaBandChart: winnerArm="none", pValue="0.003 (NI)". Pass.
- No em dashes in prose. Pass.

### COMPASS (compass-trial) — PASS (condition 1 resolved pre-merge)
- Primary endpoint correctly labeled: mRS 0-2 at 90 Days (Non-inferiority). Pass.
- `proves`: aspiration-first NI to stent-retriever-first in North American centers; operator/device flexibility supported. Does not claim superiority. Pass.
- Bayesian/frequentist NI tension: howToReadChart Q2 states "The primary Bayesian analysis met NI (P for NI = 0.0014), though the frequentist CI lower bound (-8 pp) marginally crossed the margin." Cautions repeat: "frequentist CI lower bound (-8 pp) marginally crossed the -7 pp NI threshold." Honest representation of known COMPASS analysis tension. Pass.
- **Reperfusion figure labeling — resolved:** howToReadChart Q3 and cautions now correctly label the 68.9%/76.3% figures as first-pass reperfusion, not overall mTICI 2b-3 (overall ~83% in both arms with rescue). Q3 clarifies rescue device crossover closes the first-pass gap. Consistent with proves/bottomLineSummary/bedsidePearl. Pass.
- Numerics: N=270, mRS 0-2 52% vs 50%, RD +2 pp (95% CI -8 to 11), mortality 22% both. Match Turk Lancet 2019. Pass.
- JSX DeltaBandChart: winnerArm="none", pValue="0.0014 (NI)". Pass.
- No em dashes in prose. Pass.

### ASTER (aster-trial) — PASS (condition 2 resolved pre-merge)
- `trialResult` corrected NEGATIVE → NEUTRAL. `specialDesign` corrected negative-trial → neutral-trial. Pass.
- Primary endpoint correctly labeled: Successful Revascularization (mTICI 2b-3). Procedural endpoint subtitle present. Pass.
- `proves`: similar revascularization and clinical outcomes; no significant difference in any endpoint. NEUTRAL framing (null difference), not harm. Pass.
- `doesNotProve`: not powered for modest clinical differences; numerically lower mRS 0-2 with aspiration (45.3% vs 50.3%) not excluded. Honest epistemic humility. Pass.
- Numerics: N=381, mTICI 2b-3 85.4% vs 83.1%, P=0.53; mRS 0-2 45.3% vs 50.3%, P=0.19; sICH 8.8% both; mortality 25.0% vs 21.9%, P=0.49; rescue 25.2%. Match Lapergue JAMA 2017. Pass.
- Amber procedural-endpoint banner: states mRS 0-2 (45.3% vs 50.3%, P=0.19) accurately. Pass.
- JSX DeltaBandChart: primary endpoint (mTICI 2b-3) shown, winnerArm="none", pValue="0.53". Pass.
- No em dashes in prose. Pass.

### ASTER2 (aster2-trial) — PASS (condition 2 resolved pre-merge)
- `trialResult` corrected NEGATIVE → NEUTRAL. `specialDesign` corrected negative-trial → neutral-trial. Pass.
- Primary endpoint correctly labeled: Near-Total Reperfusion (eTICI 2c-3). Procedural endpoint subtitle present. Pass.
- `proves`: combined technique did not significantly improve near-total reperfusion or clinical outcomes vs stent retriever alone. NEUTRAL framing. Pass.
- `doesNotProve`: does not exclude small benefit; does not address combined as rescue; does not address newer devices. Pass.
- Numerics: N=408, eTICI 2c-3 64.5% vs 57.9%, P=0.17; mRS 0-2 48.5% vs 49.5%; mortality 21.7% vs 19.7%, P=0.58; sICH 6.9% vs 5.4%. Match Lapergue JAMA 2021. Pass.
- Amber procedural-endpoint banner: states mRS 0-2 (48.5% vs 49.5%) with "no significant clinical difference." Pass (em dash resolved pre-merge: ";  no significant clinical difference").
- JSX DeltaBandChart: primary endpoint (eTICI 2c-3), winnerArm="none", pValue="0.17". Pass.
- No em dashes in prose. Pass.

## Citation accuracy
- Comment-stub tags present in all 10 claim surfaces. Pass under ADR-005 Option C hybrid.
- All five DOIs present in trial entries and match cited papers: 10.1056/NEJMoa2001123 (Yang), 10.1001/jama.2020.23092 (Zi), 10.1016/S0140-6736(19)30297-1 (Turk), 10.1001/jama.2017.9644 (Lapergue 2017), 10.1001/jama.2021.15004 (Lapergue 2021). Pass.
- No citation registry entries exist (W5.2 deferred, consistent with prior batches). Pass under ADR-005.

## Freshness
- Per §13.7, landmark foundational trials carry a 36-month review window.
- Per ADR-005, `last_reviewed` deferred to W5.2.
- Yang 2020, Zi 2021, Turk 2019, Lapergue 2021: within or near 36-month window from 2026-04-25.
- Lapergue 2017 (ASTER): beyond 36-month window but trial results are stable, not overturned. doesNotProve/cautions framing correctly contextualizes era. Pass under ADR-005 deferral.

## Rationale
All five Batch 3 trial entries faithfully represent their primary results on the five never-drift dimensions. NI framing is consistently correct across DIRECT-MT, DEVT, COMPASS: proves describes NI-was-met, not superiority; doesNotProve explicitly guards against superiority interpretation; bedsidePearls preserve hypothesis-generating language where appropriate. ASTER and ASTER2 are correctly framed as NEUTRAL (null difference, not harm), with amber procedural-endpoint banners accurately disclosing that clinical mRS 0-2 outcomes were similar. Three pre-merge conditions (DEVT/COMPASS amber-banner em dashes, COMPASS reperfusion label reconciliation, ASTER/ASTER2 specialDesign correction) were resolved by the orchestrator before this review was finalized. No systematic meaning-drift detected across the batch.

## Required follow-ups

**Pre-merge conditions — RESOLVED:**
1. ~~COMPASS reperfusion figure labeling~~ — resolved: howToReadChart Q3 and cautions now consistently label 68.9%/76.3% as first-pass reperfusion and note overall mTICI 2b-3 was ~83% in both arms with rescue.
2. ~~ASTER/ASTER2 specialDesign~~ — resolved: corrected from 'negative-trial' to 'neutral-trial' in both entries.
3. ~~Amber banner em dashes in TrialPageNew.tsx~~ — resolved: em dashes in DEVT and ASTER2 amber banner prose replaced with colons/semicolons.

**Recommended (post-merge, not blocking):**
4. DEVT: add `clinicalTrialsId` field (optional metadata parity).
5. All 5 trials: register citations in `src/lib/citations/registry.ts` and populate `CLAIM_REGISTRY` for 10 claim IDs (W5.2 deferred).
6. ASTER (Lapergue 2017): set `last_reviewed` with 36-month override note on contextual framing once registry is live.

**Status:** ready_for_merge.
