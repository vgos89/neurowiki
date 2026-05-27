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

## Headache pathway — primary trials registered in citations (2026-05-25)

The following trials were added to `src/lib/citations/registry.ts` during the headache primary-trial citation rewire (V direction: reference primary trials, not Continuum reviews). Not yet in `trialData.ts` — adding to trial-detail pages is a separate follow-on.

**Cohen 2009 — High-flow oxygen for cluster headache**
- Citation: JAMA 2009;302(22):2451-2457. PMID 19996400.
- Why: anchors cluster acute O₂ (78% vs 20% pain-free at 15 min).

**Sumatriptan Cluster Headache Study Group 1991 — SC sumatriptan**
- Citation: NEJM 1991;325(5):322-326. PMID 1647496.
- Why: AHS Grade A cluster acute.

**Leone 2000 — Verapamil RCT for cluster**
- Citation: Neurology 2000;54(6):1382-1385. PMID 10746617.
- Why: First-line cluster preventive.

**Bussone 1990 — Lithium vs verapamil head-to-head**
- Citation: Headache 1990;30(7):411-417. PMID 2205598.
- Why: Establishes lithium as second-line cluster preventive.

**Newman 1994 — HC case series + indomethacin response**
- Citation: Neurology 1994;44(11):2111-2114. PMID 7969968.
- Why: Foundational HC series; ICHD-3 §3.4 D anchor.

**Antonaci 1998 — "Indotest" diagnostic protocol**
- Citation: Headache 1998;38(2):122-128. PMID 9529768.
- Why: PH + HC parenteral-indomethacin diagnostic test.

**Lipton 2019 — Rimegepant ACHIEVE-I**
- Citation: NEJM 2019;381(2):142-149. PMID 31291516.
- Why: First gepant acute migraine RCT; MOH-safe.

**Dodick 2019 — Ubrogepant ACHIEVE-I**
- Citation: NEJM 2019;381(23):2230-2241. PMID 31800988.
- Why: Second gepant acute migraine RCT.

**Aurora PREEMPT 1 (2010) — OnabotulinumtoxinA part 1**
- Citation: Cephalalgia 2010;30(7):793-803. PMID 20647170.
- Why: Half of the FDA chronic-migraine indication evidence (did not meet primary endpoint individually).

**Diener PREEMPT 2 (2010) — OnabotulinumtoxinA part 2**
- Citation: Cephalalgia 2010;30(7):804-814. PMID 20647171.
- Why: Met primary endpoint; anchors chronic-migraine botox indication.

**Dodick PREEMPT pooled (2010) — regulatory anchor**
- Citation: Headache 2010;50(6):921-936. PMID 20487038.
- Why: Pooled n=1384 analysis; FDA chronic-migraine indication.

**Tepper 2017 — Erenumab chronic migraine**
- Citation: Lancet Neurology 2017;16(6):425-434. PMID 28460892.
- Why: First CGRP mAb chronic-migraine RCT.

**Silberstein HALO-CM (2017) — Fremanezumab chronic migraine**
- Citation: NEJM 2017;377(22):2113-2122. PMID 29171818.
- Why: Second CGRP mAb chronic-migraine pivotal trial.

**Mulleners CONQUER (2020) — Galcanezumab in ≥2-failure migraine**
- Citation: Lancet Neurology 2020;19(10):814-825. PMID 32949542.
- Why: Refractory-migraine CGRP mAb evidence.

**Lipton PROMISE-2 (2020) — Eptinezumab chronic migraine**
- Citation: Neurology 2020;94(13):e1365-e1377. PMID 32209650.
- Why: IV-dosed CGRP mAb option.

**Ailani ADVANCE (2021) — Atogepant preventive**
- Citation: NEJM 2021;385(8):695-706. PMID 34407343.
- Why: Oral CGRP receptor antagonist for prevention; broadens "gepants don't cause MOH."

**D'Andrea 2001 — Lamotrigine for SUNCT case series**
- Citation: Neurology 2001;57(9):1723-1725. PMID 11706123.
- Why: First-line preventive for SUNCT/SUNA (RCT not feasible due to rarity).

**Cohen Brain 2006 — SUNCT/SUNA cohort**
- Citation: Brain 2006;129(Pt 10):2746-2760. PMID 16905753.
- Why: Largest SUNCT/SUNA phenotype cohort; lamotrigine most consistently effective.

- **Identified during:** headache primary-trial audit (2026-05-25)

---

## Added (moved here when shipped)

_None yet._
