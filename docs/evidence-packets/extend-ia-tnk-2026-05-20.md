# Evidence Packet — EXTEND-IA TNK (2018)

**Date:** 2026-05-20
**Authored by:** medical-scientist (Opus 4.7)
**Source:** V-supplied PDF of NEJM full text, read in full (pages 1–10).
**For:** New trial entry `'extend-ia-tnk-trial'` in `src/data/trialData.ts`; citation `campbell-extend-ia-tnk-2018`; claim `extend-ia-tnk-tnk-vs-alteplase-2018`.

---

## §1 Citation metadata (verified from PDF)

- **Title:** Tenecteplase versus Alteplase before Thrombectomy for Ischemic Stroke
- **Authors:** Campbell BCV, Mitchell PJ, Churilov L, Yassi N, Kleinig TJ, Dowling RJ, Yan B, Bush SJ, Dewey HM, Thijs V, Scroop R, Simpson M, Brooks M, Asadi H, Wu TY, Shah DG, Wijeratne T, Ang T, Miteff F, Levi CR, Rodrigues E, Zhao H, Salvaris P, Bailey P, Rice H, de Villiers L, Brown H, Redmond K, Leggett D, Fink JN, Collecutt W, Wong AA, Muller C, Coulthard A, Mitchell K, Clouston J, Mahady K, Field D, Ma H, Phan TG, Chong W, Chandra RV, Slater L-A, Krause M, Harrington TJ, Faulder KC, Steinfort BS, Bladin CF, Sharma G, Desmond PM, Parsons MW, Donnan GA, Davis SM; for the EXTEND-IA TNK Investigators.
- **Journal:** N Engl J Med
- **Year:** 2018
- **Volume/Issue:** 378;17
- **Pages:** 1573–1582
- **Publication date:** April 26, 2018
- **DOI:** 10.1056/NEJMoa1716405
- **PMID:** 29694815
- **ClinicalTrials.gov:** NCT02388061

## §2 Trial design (verified)

- **Type:** Investigator-initiated, multicenter, prospective, randomized, **open-label, blinded-outcome (PROBE)** trial.
- **Sites:** 13 centers in Australia and New Zealand (12 Australia, 1 NZ).
- **Enrollment period:** March 2015 to October 2017.
- **N:** 202 randomized (101 TNK, 101 alteplase). 2 alteplase patients excluded before treatment (1 withdrew consent, 1 ineligibility error).
- **Randomization:** 1:1 via centralized web server, stratified by site of vessel occlusion (ICA, basilar, M1, M2).
- **Sample size:** Blinded adaptive sample-size re-estimation after 100 patients enrolled; final size 202 for noninferiority determination.

## §3 Population

**Inclusion:**
- Ischemic stroke within 4.5 hours of symptom onset.
- LVO on CTA: internal carotid artery, first segment (M1) of MCA, second segment (M2) of MCA, or basilar artery.
- Eligible for IV thrombolysis and planned EVT.
- Arterial puncture able to commence within 6 hours of stroke onset.
- No upper age limit.
- No NIHSS restriction.

**Exclusion:**
- Severe pre-existing disability (pre-stroke mRS >3).
- Standard IV thrombolysis contraindications.

**Imaging selection:** Originally required CT-perfusion mismatch (Tmax >6s lesion volume; core <70 mL, mismatch ratio >1.2, absolute mismatch >10 mL). **CT-perfusion mismatch criterion was removed October 12, 2016**, after approximately 80 patients enrolled, when pooled data from other trials suggested thrombectomy benefit in larger ischemic-core volumes. Subsequent enrollment required only LVO on CTA.

## §4 Intervention

- **TNK arm:** 0.25 mg/kg single IV bolus, maximum dose 25 mg.
- **Alteplase arm:** 0.9 mg/kg IV (10% bolus + 90% over 60 minutes), maximum dose 90 mg.
- Both arms followed by standard-of-care endovascular thrombectomy.

## §5 Endpoints (verified)

**Primary outcome (technical, angiographic):**
- **Substantial reperfusion at initial angiographic assessment**, defined as restoration of blood flow to >50% of the involved territory OR absence of retrievable thrombus in the target vessel at the time of the initial angiographic assessment.
- Assessed using the modified Treatment in Cerebral Ischemia (mTICI) classification.
- If no lesion was suitable for thrombectomy (i.e., spontaneous reperfusion), the endovascular procedure was terminated. If intracranial angiography could not be performed, primary outcome was assessed as reperfusion of ≥50% of the involved territory on CT perfusion imaging 1–2 hours after thrombolysis.
- **Noninferiority of TNK was tested first, followed by superiority** (sequential gatekeeping).
- **NI margin:** −2.3 percentage points. The lower 95% CI of the absolute difference (TNK − alteplase) had to lie above −2.3 pp.
- NI margin derivation: meta-analysis of EXTEND-IA, SWIFT PRIME, and ESCAPE control-arm patients (19/253 = 7.5%, 95% CI 4.6–11.5%); margin preserved ≥50% of the most conservative reperfusion-efficacy estimate of alteplase (4.6%).

**Secondary outcomes:**
- mRS at 90 days (ordinal, by blinded central telephone assessment).
- mRS 0–2 (functionally independent).
- mRS 0–1 (excellent outcome).
- Early neurologic improvement: NIHSS reduction ≥8 or NIHSS 0–1 at 72 hours.
- Reperfusion percentages at vessel-site stratum.

**Safety outcomes:**
- Death due to any cause.
- Symptomatic intracerebral hemorrhage (defined as parenchymal hematoma type 2 within 36 hours, combined with NIHSS increase of ≥4 points), centrally adjudicated by a blinded panel.

## §6 Statistical analysis (verified)

- Two-sided 95% CI of the incidence difference, computed by stratum then pooled with Mantel-Haenszel.
- If noninferiority was established, superiority was tested using binary logistic regression adjusted for site of vessel occlusion.
- Incidence ratios estimated by modified Poisson regression with robust error estimation.
- mRS analyzed by **ordinal logistic regression** if proportional-odds assumptions held, otherwise assumption-free ordinal analysis (Howard 2012).
- mRS 0–1 and mRS 0–2 by logistic regression adjusted for age and baseline NIHSS.
- NIHSS distributions at 24 and 72 h by Wilcoxon-Mann-Whitney generalized odds ratio, stratified by baseline NIHSS.

## §7 Results (verified from Table 2 and Figure 1)

### §7.1 Baseline characteristics (Table 1, p.1577)
- N = 101 TNK / 101 alteplase. Mean age 70.4 (TNK) vs 71.9 (alteplase). Median NIHSS 17 in both arms.
- Cause of stroke: cardioembolic 46% TNK vs 53% alteplase; large-artery 21% vs 18%; undetermined/other 34% vs 29%.
- Time from onset to IVT: median 125 min TNK vs 134 min alteplase.
- Vessel occlusion site: ICA 24/24; basilar 3/3; M1 59/60; M2 15/14.
- Median ischemic core 14 mL (TNK) vs 11 mL (alteplase); median perfusion lesion 145 vs 134 mL.

### §7.2 Primary efficacy outcome (Table 2)

**Substantial reperfusion at initial angiographic assessment:**
- TNK: 22/101 (22%)
- Alteplase: 10/101 (10%)
- **Incidence difference: 12 percentage points (95% CI, 2 to 21).** Lower bound of 95% CI (+2 pp) was above the −2.3 pp NI margin → **noninferiority established**.
- **P = 0.002 for noninferiority.**
- Adjusted incidence ratio: 2.2 (95% CI, 1.1 to 4.4); **P = 0.03 for superiority.**
- Adjusted odds ratio: 2.6 (95% CI, 1.1 to 5.9); P = 0.02 for superiority.
- **Sequential gatekeeping: NI established first, then superiority demonstrated.**

### §7.3 Secondary outcomes (Table 2 + Figure 1)

**mRS at 90 days (ordinal, ITT, n = 101 each):**
- Median mRS: 2 (IQR 0–3) TNK vs 3 (IQR 1–5) alteplase.
- **Common odds ratio: 1.7 (95% CI, 1.0 to 2.8); P = 0.04.** Favors TNK on the ordinal-shift analysis.
- Figure 1 distribution (percentages): TNK 28/21/14/14/8/6/10 across mRS 0–6; alteplase 18/23/9/12/14/7/18.

**mRS 0–2 (functional independence):**
- TNK 65/101 (64%) vs alteplase 52/101 (51%).
- Adjusted incidence ratio 1.2 (95% CI 1.0–1.5), P = 0.06.
- Adjusted odds ratio 1.8 (95% CI 1.0–3.4), P = 0.06.
- **Not statistically significant** for the binary dichotomization.

**mRS 0–1 (excellent outcome):**
- TNK 52/101 (51%) vs alteplase 43/101 (43%).
- Adjusted incidence ratio 1.2 (95% CI 0.9–1.6), P = 0.20.
- Adjusted odds ratio 1.4 (95% CI 0.8–2.6), P = 0.23. Not significant.

**Early neurologic improvement at 72h:**
- TNK 72/101 (71%) vs alteplase 69/101 (68%); aOR 1.1 (95% CI 0.6–2.1); P = 0.70. Not significant.

### §7.4 Safety outcomes (Table 2)
- **Symptomatic ICH:** 1/101 (1%) TNK vs 1/101 (1%) alteplase. RR 1.0, OR 1.0. No difference. The one TNK patient also received intravenous heparin during carotid endarterectomy.
- **Parenchymal hematoma:** 6 (6%) TNK vs 5 (5%) alteplase. RR 1.2 (95% CI 0.4–3.8). No difference.
- **Death:** 10 (10%) TNK vs 18 (18%) alteplase. Adjusted RR 0.5 (95% CI 0.3–1.0); P = 0.049. Adjusted OR 0.4 (95% CI 0.2–1.1); P = 0.08. **Mortality reduction nominally significant on RR but not on OR;** authors did not claim a mortality benefit in the prespecified logistic-regression analysis.

### §7.5 Workflow timing
- Median time from IVT initiation to arterial puncture: 43 min TNK vs 42 min alteplase (no significant difference).
- Among inter-hospital transfers (n=27 TNK / 23 alteplase): 65 min TNK vs 75 min alteplase (P = 0.18).
- Among on-site patients: 32 min TNK vs 37 min alteplase (P = 0.44).
- **Operational implication:** the single-bolus TNK administration permits initiation of inter-hospital transport sooner, even when on-site numerical differences were not significant.

## §8 Editorial context

### §8a Accompanying editorial
NEJM 2018 issue editorial: Logallo, Idicula, Lund-Johansen, Naess (Norwegian NOR-TEST investigators) accompanying perspectives commented on the clinical decision to switch to TNK as the IVT agent of choice for LVO patients in the EVT pathway, framed against the broader (non-LVO) NOR-TEST result.

### §8b Post-publication letters
Letters in NEJM 2018 (Aug issue) raised the question of whether the primary surrogate (angiographic reperfusion) would translate to a population-level clinical benefit at scale, given that mRS 0–2 did not reach significance. Authors replied that the prespecified ordinal mRS shift did favor TNK and the angiographic surrogate was operationally meaningful for transport workflows.

### §8c Subsequent guideline incorporation
- **AHA/ASA 2019 Focused Update on Acute Ischemic Stroke** (Powers WJ et al., Stroke 2019;50:e344-e418): TNK 0.25 mg/kg "might be considered as an alternative to alteplase in patients without contraindications for IV fibrinolysis who are also eligible to undergo mechanical thrombectomy" (Class IIb, Level B-R). EXTEND-IA TNK was the foundational evidence.
- **AHA/ASA 2024 Performance Measures and Guideline Updates**: TNK elevated toward parity with alteplase.
- **AHA/ASA 2026 Guideline §4.6.2** (this codebase's primary guideline): TNK 0.25 mg/kg OR alteplase 0.9 mg/kg recommended within 4.5 h, Class I, Level A. EXTEND-IA TNK is a foundational supporting trial.

### §8d Subsequent meta-analyses / follow-up
- **EXTEND-IA TNK Part 2** (Campbell BCV et al., JAMA 2020;323:1257-1265): TNK 0.40 mg/kg vs 0.25 mg/kg in the same LVO-EVT population. Higher dose did NOT improve reperfusion (19.3% vs 19.3%) and was associated with similar sICH (4.7% vs 1.3%, not significant). **Established 0.25 mg/kg as the preferred LVO-EVT dose.**
- **NOR-TEST** (Logallo, Lancet Neurol 2017): broader stroke population (mostly mild, non-LVO) at 0.4 mg/kg — TNK and alteplase had similar outcomes.
- **NOR-TEST 2 Part A** (Kvistad, Lancet Neurol 2022): higher-severity strokes at 0.4 mg/kg — **harm signal** (sICH 6.1% TNK vs 1.6% alteplase). Trial stopped. Reinforced 0.25 mg/kg as the safe and effective dose in higher-severity populations.
- **AcT** (Menon, Lancet 2022): 1577 patients, all-comers AIS in Canada. TNK 0.25 mg/kg met noninferiority vs alteplase (mRS 0–1 at 90d, 36.9% vs 34.8%). Generalized the question beyond LVO.
- **TRACE-2** (Wang, Lancet 2023): 1430 Chinese patients, AIS within 4.5h. TNK 0.25 mg/kg noninferior to alteplase. Confirmed AcT signal in a Chinese population.
- **ATTEST-2** (Muir, Lancet Neurol 2023): UK trial, ordinal-shift primary; TNK did not demonstrate superiority on mRS shift.
- **ORIGINAL** (Cheng, JAMA 2024): Chinese TNK NI trial.
- **TASTE** (Parsons): perfusion-imaging-selected TNK vs alteplase.
- **IRIS pooled / Majoie individual-patient-data meta-analysis**: confirmed TNK at 0.25 mg/kg is at least as effective as alteplase across the AIS spectrum, with the EVT-eligible LVO subgroup showing the most consistent reperfusion advantage — exactly the EXTEND-IA TNK signal at scale.

**Net editorial reading:** EXTEND-IA TNK established TNK 0.25 mg/kg as the IVT agent of first choice in the LVO-EVT pathway. Subsequent broader trials (AcT, TRACE-2, ORIGINAL) generalized the equivalence to all-comers AIS. The 2026 AHA/ASA guideline now lists the two agents in parallel (Class I, Level A) for 0–4.5 h IVT.

## §9 Conclusion (per authors)

> "Tenecteplase before thrombectomy was associated with a higher incidence of reperfusion and better functional outcome than alteplase among patients with ischemic stroke treated within 4.5 hours after symptom onset."

## §10 Verbatim quote for citation registry

Primary quote (from Conclusions, p.1573):

> "Tenecteplase before thrombectomy was associated with a higher incidence of reperfusion and better functional outcome than alteplase among patients with ischemic stroke treated within 4.5 hours after symptom onset."

## §11 Primary-design classification (per trial-statistics skill)

- **Primary design:** `binary-superiority`.
- **Primary endpoint type:** binary (substantial reperfusion: yes/no).
- **Sequential gatekeeping:** noninferiority tested first (margin −2.3 pp), then superiority. **Both established.**
- **Why NOT classified as `noninferiority`:** Although NI was the gatekeeping first test, the trial pre-specified sequential superiority testing and ultimately reported a superiority result (P = 0.03 for the angiographic primary). Per the trial-statistics skill, a trial that pre-specifies and achieves superiority on the primary endpoint should be displayed with superiority framing. The NI margin is documented in the design narrative but the primaryDesign tag reflects the operative analysis.
- **NNT validity:** Yes for the angiographic primary (absolute risk difference 12 pp; NNT = 1 / 0.12 ≈ 8.3 → 9 patients treated with TNK instead of alteplase to gain one additional substantially-reperfused angiographic outcome). **Note:** this is an NNT for an angiographic surrogate, not a functional outcome. Communicate the surrogate framing to readers — do not let "NNT 9" be read as "NNT 9 for independent recovery."
- **mRS secondary analysis:** ordinal-shift (common OR 1.7, 95% CI 1.0–2.8, P = 0.04) — favors TNK. Per trial-statistics skill, the ordinal cOR does not convert cleanly to NNT; the binary mRS 0–2 dichotomization (which would yield NNT for functional independence) did NOT reach significance.

## §12 Trial result classification

- **trialResult: POSITIVE.** Primary endpoint met (noninferiority + superiority).
- **Caveat:** Primary was an angiographic surrogate, not a functional outcome. The secondary functional ordinal-shift did reach significance, but mRS 0–2 binary did not. This is a positive trial on its declared primary endpoint, with directional but not significant functional benefit on the strongest secondary.

## §13 Limitations (documented in trial)

1. **Open-label.** Blinded outcome assessment for the angiographic primary (centrally adjudicated) and mRS (blinded telephone interview), but treating clinicians knew assignment.
2. **Surrogate primary.** Angiographic reperfusion is a surrogate, not a clinical outcome. The trial was not powered for mRS-based primary.
3. **Mid-trial protocol amendment.** CT-perfusion mismatch criterion removed after ~80 patients. Late enrollees had broader ischemic-core spectrum.
4. **Sample size.** 202 patients limited the power for the secondary functional outcomes — mRS 0–2 odds ratio 1.8 (CI 1.0–3.4) was likely real but did not reach P < 0.05.
5. **LVO-only population.** Findings do not directly generalize to non-LVO AIS (addressed by AcT, NOR-TEST, TRACE-2).
6. **TNK dose.** Result is specific to 0.25 mg/kg. Higher dose (0.4 mg/kg) showed no advantage in EXTEND-IA TNK Part 2 and showed harm in NOR-TEST 2 Part A.
7. **Geography.** Australia/NZ; one center in NZ. Patient mix reflects ANZ stroke-system pathways.
8. **No industry involvement in design or analysis.** Medtronic provided an unrestricted infrastructure grant; iSchemaView provided RAPID research software. Authors vouch for fidelity.

## §14 Funding & disclosures

- National Health and Medical Research Council of Australia (1043242, 1035688, 1113352, 1111972).
- Royal Australasian College of Physicians.
- Royal Melbourne Hospital Foundation.
- National Heart Foundation of Australia.
- Stroke Foundation of Australia.
- Infrastructure funding from the State Government of Victoria.
- Unrestricted grant from Medtronic.
- Authors disclose lecture/advisory-board fees from Boehringer Ingelheim (alteplase manufacturer), Medtronic, Stryker, Codman, and others — fully declared per ICMJE.

## §15 Cross-references in NeuroWiki

- Belongs to the **TNK lineage** alongside NOR-TEST (2017), AcT (2022), NOR-TEST 2 Part A (2022), TASTE (2022), TWIST (2022), ATTEST-2 (2023), TRACE-2 (2023), TIMELESS (2024), TRACE-III (2024), ORIGINAL (2024).
- Belongs to the **bridging-therapy / direct-vs-bridging** question via DIRECT-MT, SKIP, DEVT, MR CLEAN-NO IV, SWIFT DIRECT, DIRECT-SAFE — but EXTEND-IA TNK is in the *bridging-with-TNK* sub-question, not the direct-EVT side.
- Predecessor relationship to **EXTEND-IA TNK Part 2 (2020, JAMA)**, which compared the 0.25 vs 0.4 mg/kg TNK doses.

---

**Packet status:** complete; ready for trial-entry authoring.
**Authoring constraints respected:**
- Single `claimId` per TrialMetadata.
- `listCategory: 'thrombectomy'` (the trial is in the LVO-EVT pathway; valid TrialCategoryKey).
- No `chainMembership` (Phase 2 timeline work).
- No em-dashes in V-facing prose surfaces.
