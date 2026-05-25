# Missing Trials Tracker

Trials identified as clinically relevant but not yet in `src/data/trialData.ts`.
Update this file whenever clinical context work (any -clinical task) surfaces a new trial reference.

## How to add a trial
1. Add entry below with source context and priority
2. When the trial is added to the app, move it to ## Added and note the commit

---

## Pending Addition

### HIGH PRIORITY — Secondary Stroke Prevention / Dyslipidemia

**FOURIER**
- **Full citation:** Sabatine MS et al. NEJM 2017;376:1713-1722.
- **PMID:** 28304224
- **What it showed:** Evolocumab (PCSK9 inhibitor) reduces MACE including ischemic stroke in patients with stable ASCVD on statin therapy. ~5,000 prior-stroke subgroup showed consistent benefit (HR ~0.79 for stroke).
- **Why neurology cares:** Foundational RCT underpinning the COR 1 / LOE A PCSK9 mAb recommendation in the 2026 ACC/AHA Dyslipidemia Guideline for secondary stroke prevention; directly applicable to ischemic stroke patients with ASCVD.
- **Identified during:** Wave 1 dyslipidemia integration (2026-05-24)

**ODYSSEY OUTCOMES**
- **Full citation:** Schwartz GG et al. NEJM 2018;379:2097-2107.
- **PMID:** 30403574
- **What it showed:** Alirocumab reduces MACE in post-ACS patients on high-intensity statin. Stroke-specific subgroup published separately; consistent directional benefit for ischemic stroke.
- **Why neurology cares:** Paired with FOURIER as the dual foundational CVOT for PCSK9 mAbs; post-ACS population overlaps significantly with cardioembolic and large-artery stroke patients. Required for comprehensive PCSK9 mAb evidence presentation.
- **Identified during:** Wave 1 dyslipidemia integration (2026-05-24)

**IMPROVE-IT**
- **Full citation:** Cannon CP et al. NEJM 2015;372:2387-2397.
- **PMID:** 26039521
- **What it showed:** Ezetimibe + simvastatin vs. simvastatin alone post-ACS; ezetimibe add-on reduced MACE (HR 0.936, p=0.016). LDL-C lowered from ~69 to ~54 mg/dL in combo arm.
- **Why neurology cares:** Established the "lower is better" LDL-C principle that now underpins all guideline LDL-C targets in stroke secondary prevention. Foundational evidence for COR 1 ezetimibe add-on recommendation when LDL-C goal not met on statin alone.
- **Identified during:** Wave 1 dyslipidemia integration (2026-05-24)

---

### MEDIUM PRIORITY — Additional LDL-Lowering Escalation Agents

**CLEAR Outcomes**
- **Full citation:** Nissen SE et al. NEJM 2023;388:1353-1364.
- **PMID:** 36876740
- **What it showed:** Bempedoic acid in statin-intolerant patients with ASCVD or high risk reduced the primary composite endpoint (MACE) vs. placebo. ARR ~1.6% over 3 years; NNT ~63.
- **Why neurology cares:** Supports the COR 2a recommendation for bempedoic acid in statin-intolerant stroke patients who cannot achieve LDL-C targets. Bempedoic acid does not cause myopathy, making it the primary add-on option for this subgroup.
- **Identified during:** Wave 1 dyslipidemia integration (2026-05-24)

**ORION-10 / ORION-11**
- **Full citation:** Ray KK et al. NEJM 2020;382:1507-1519.
- **PMIDs:** 32302303 (ORION-10) / 32302304 (ORION-11)
- **What it showed:** Inclisiran (siRNA targeting PCSK9) achieves ~50% LDL-C reduction with twice-yearly dosing in ASCVD and high-risk patients. MACE exploratory OR 0.74 (95% CI 0.58-0.94) in pooled analysis.
- **Why neurology cares:** Supports COR 2a recommendation for inclisiran as second-line PCSK9-pathway agent; twice-yearly dosing may improve adherence in stroke patients with complex polypharmacy. Cardiovascular outcomes trial (ORION-4) is ongoing.
- **Identified during:** Wave 1 dyslipidemia integration (2026-05-24)

---

## Added (moved here when shipped)

_None yet._
