# Evidence Packet — Eligibility + Per-Arm Protocol Pilot (5 trials)

**Verifier:** evidence-verifier (Opus 4.8) · **Retrieved:** 2026-06-08
**Skill loaded:** clinical-trial-audit
**Scope:** Supplies `FullEligibility` + `ArmDetail[]` source content for `medical-scientist` to transcribe into `src/data/trialData.ts`. Read-only; no source files edited by verifier.
**Interface targets:** `FullEligibility`, `CriteriaGroup`, `ArmDetail` (defined in `src/data/trialData.ts` near the `TrialIntervention` interface).

> **Transcription note:** Every `items[]` string is verbatim from the cited source with only light formatting normalization (markdown/encoding fixes, e.g. `µmol`, `≥`). Clinical wording unchanged. Where registry and publication differ materially, both recorded and the discrepancy flagged; prefer the published protocol for headline window/dose values.

---

## 1. DAWN — `dawn-trial` → NCT02142283

### NCT-verification verdict
**NCT verified:** resolves to "Clinical Mismatch in the Triage of Wake Up and Late Presenting Strokes Undergoing Neurointervention With Trevo (DAWN)" — Device: Trevo Thrombectomy Procedure; Condition: Ischemic Stroke. Matches repo `dawn-trial` (DOI 10.1056/NEJMoa1706442, PMID 29129157, Nogueira et al., NEJM 2018;378(1):11-21). No mismatch.

### Full eligibility — VERBATIM, grouped
- **source:** `clinicaltrials.gov` · **sourceUrl:** `https://clinicaltrials.gov/study/NCT02142283` · **sourceLabel:** `ClinicalTrials.gov NCT02142283` · **retrieved:** `2026-06-08`

**inclusion:**
- **"General Inclusion Criteria"**
  - Clinical signs and symptoms consistent with the diagnosis of acute ischemic stroke, and subject belongs to one of the following two categories: failed IV t-PA therapy (defined as a confirmed persistent occlusion 60 minutes post IV t-PA administration) OR contraindicated for IV t-PA administration
  - Age ≥18
  - Baseline NIHSS ≥10 (assessed within one hour of measuring the core infarct volume)
  - Randomization can be initiated between 6 to 24 hours after time last known well
  - No significant pre-stroke disability (pre-stroke mRS 0 to 1)
  - Anticipated life expectancy of at least 6 months
  - Subject is willing and able to return for protocol-required follow-up visits
  - Subject or subject's Legally Authorized Representative has signed and dated an Informed Consent Form
- **"Imaging Inclusion Criteria"**
  - <1/3 MCA territory involved, as evidenced by CT or MRI
  - Occlusion of the intracranial internal carotid artery and/or the MCA-M1 segment, as evidenced by MRA or CTA
  - Clinical Imaging Mismatch (CIM), defined as one of: (Group A) age ≥80 years, NIHSS ≥10, and core infarct 0 to <21 cc; (Group B) age <80 years, NIHSS ≥10, and core infarct 0 to <31 cc; (Group C) age <80 years, NIHSS ≥20, and core infarct 31 to <51 cc

**exclusion:**
- **"General Exclusion Criteria"**
  - Severe head injury within the past 90 days with residual neurological deficit
  - Rapid neurological improvement to a NIHSS <10 or evidence of vessel recanalization prior to randomization
  - Pre-existing neurological or psychiatric disease that would confound the neurological or functional evaluations (e.g., dementia requiring an anti-cholinesterase inhibitor)
  - Seizures at stroke onset if it precludes obtaining an accurate baseline NIHSS assessment, and the diagnosis is in doubt
  - Baseline blood glucose <50 mg/dL (2.78 mmol) or >400 mg/dL (22.20 mmol)
  - Baseline hemoglobin <7 mmol/L
  - Baseline platelet count <50,000/µL
  - Abnormal baseline electrolytes: sodium <130 mmol/L, potassium <3 or >6 mEq/L
  - Renal failure: serum creatinine >3.0 mg/dL (264 µmol/L) (patients on dialysis are exempt)
  - Known hemorrhagic diathesis, coagulation factor deficiency, or anticoagulant therapy with INR >3.0 or PTT >3 times normal; recent use of a Factor Xa inhibitor within 24-48 hours requires a normal PTT
  - Active or recent hemorrhage within the past 30 days
  - Severe allergy (more than rash) to contrast medium
  - Severe, sustained hypertension: systolic BP >185 mmHg or diastolic BP >110 mmHg (patients are eligible if BP can be reduced with medication)
  - Pregnant or lactating females
  - Current participation in another investigational drug or device study
  - Presumed septic embolus or suspected bacterial endocarditis
  - Prior treatment with cleared thrombectomy devices or intra-arterial neurovascular therapies
- **"Imaging Exclusion Criteria"**
  - Evidence of intracranial hemorrhage on CT or MRI
  - CTA or MRA evidence of a flow-limiting carotid dissection, high-grade stenosis, or complete cervical carotid occlusion requiring stenting
  - Excessive cervical vessel tortuosity that precludes device delivery/deployment
  - Suspected cerebral vasculitis based on medical history and imaging
  - Suspected aortic dissection based on medical history and imaging
  - Intracranial stent in the same vascular territory that precludes safe deployment/removal of the Trevo device
  - Occlusions in multiple vascular territories or clinical evidence of bilateral or multi-territorial strokes
  - Significant mass effect with midline shift on CT or MRI
  - Evidence of intracranial tumor (except small meningioma) on CT or MRI

### Arms
**Arm 1 — intervention** · arm: "Trevo Thrombectomy Procedure + Medical Management" · agent: "Trevo Retriever (Stryker Neurovascular) — stent retriever" · route: "Endovascular (mechanical thrombectomy)" · frequency: "Single procedure (Trevo device only; protocol-mandated retrieval system)" · duration: "One-time procedure" · coInterventions: "+ standard medical management (may include aspirin); no other intra-arterial therapy" · note: "Trevo device only by protocol — results do not generalize to other stent retrievers. Source: CT.gov NCT02142283; device manufacturer from Nogueira NEJM 2018 Methods."

**Arm 2 — control** · arm: "Medical Management" · agent: "Standard of care (no device)" · route: "Medical" · frequency: "Per standard of care" · coInterventions: "Standard of care not including mechanical thrombectomy; no intra-arterial treatment; may include aspirin" · note: "Source: CT.gov NCT02142283 intervention description."

### Discrepancy flags
- Max age: CT.gov lists none, but CIM Groups B/C restrict to age <80 (Group A age ≥80) — captured inside the CIM inclusion item. No action.
- No eligibility/arm discrepancy registry vs publication.

---

## 2. DEFUSE-3 — `defuse-3-trial` → NCT02586415

### NCT-verification verdict
**NCT verified:** resolves to "Endovascular Therapy Following Imaging Evaluation for Ischemic Stroke 3 (DEFUSE 3)" — interventions include Trevo, Solitaire FR, Penumbra, Covidien MindFrame. Matches repo `defuse-3-trial` (DOI 10.1056/NEJMoa1713973, PMID 29364767, Albers et al., NEJM 2018;378(8):708-718). Previously-unverified NCT confirmed correct. No mismatch.

### Full eligibility — VERBATIM, grouped
- **source:** `clinicaltrials.gov` · **sourceUrl:** `https://clinicaltrials.gov/study/NCT02586415` · **sourceLabel:** `ClinicalTrials.gov NCT02586415` · **retrieved:** `2026-06-08`

**inclusion:**
- **"Clinical Inclusion Criteria"**
  - Signs and symptoms consistent with the diagnosis of acute anterior circulation ischemic stroke
  - Age 18-90 years
  - Baseline NIHSS is ≥6 and remains ≥6 immediately prior to randomization
  - Endovascular treatment can be initiated (femoral puncture) between 6 and 16 hours of stroke onset. Stroke onset is defined as the time the patient was last known to be at their neurologic baseline (wake-up strokes are eligible if they meet the above time limits)
  - Modified Rankin Scale less than or equal to 2 prior to qualifying stroke (functionally independent for all ADLs)
  - Patient/Legally Authorized Representative has signed the Informed Consent form
- **"Neuroimaging Inclusion Criteria"**
  - ICA or MCA-M1 occlusion (carotid occlusions can be cervical or intracranial; with or without tandem MCA lesions) by MRA or CTA, AND a Target Mismatch Profile on CT perfusion or MRI (ischemic core volume <70 mL, mismatch ratio ≥1.8, and mismatch volume ≥15 mL)
- **"Alternative Neuroimaging Inclusion Criteria (if perfusion imaging or CTA/MRA is technically inadequate)"**
  - (A) If CTA (or MRA) is technically inadequate: Tmax >6 s perfusion deficit consistent with an ICA or MCA-M1 occlusion AND Target Mismatch Profile (ischemic core volume <70 mL, mismatch ratio >1.8, and mismatch volume >15 mL as determined by RAPID software)
  - (B) If MRP is technically inadequate: ICA or MCA-M1 occlusion (carotid occlusions can be cervical or intracranial; with or without tandem MCA lesions) by MRA (or CTA, if MRA is technically inadequate and a CTA was performed within 60 minutes prior to the MRI) AND DWI lesion volume <25 mL
  - (C) If CTP is technically inadequate: Patient can be screened with MRI and randomized if neuroimaging criteria are met

**exclusion:**
- **"Clinical Exclusion Criteria"**
  - Other serious, advanced, or terminal illness (investigator judgment) or life expectancy is less than 6 months
  - Pre-existing medical, neurological or psychiatric disease that would confound the neurological or functional evaluations
  - Pregnant
  - Unable to undergo a contrast brain perfusion scan with either MRI or CT
  - Known allergy to iodine that precludes an endovascular procedure
  - Treated with tPA >4.5 hours after time last known well
  - Treated with tPA 3-4.5 hours after last known well AND any of the following: age >80, current anticoagulant use, history of diabetes or prior stroke, NIHSS >25
  - Known hereditary or acquired hemorrhagic diathesis, coagulation factor deficiency; recent oral anticoagulant therapy with INR >3 (recent use of one of the new oral anticoagulants is not an exclusion if estimated GFR >30 mL/min)
  - Seizures at stroke onset if it precludes obtaining an accurate baseline NIHSS
  - Baseline blood glucose of <50 mg/dL (2.78 mmol) or >400 mg/dL (22.20 mmol)
  - Baseline platelet count <50,000/µL
  - Severe, sustained hypertension (Systolic BP >185 mmHg or Diastolic BP >110 mmHg)
  - Current participation in another investigational drug or device study
  - Presumed septic embolus; suspicion of bacterial endocarditis
  - Clot retrieval attempted using a neurothrombectomy device prior to 6 hrs from symptom onset
  - Any other condition that, in the opinion of the investigator, precludes an endovascular procedure or poses a significant hazard to the subject if an endovascular procedure was performed
- **"Neuroimaging Exclusion Criteria"**
  - ASPECTS score <6 on non-contrast CT (if patient is enrolled based on CT perfusion criteria)
  - Evidence of intracranial tumor (except small meningioma), acute intracranial hemorrhage, neoplasm, or arteriovenous malformation
  - Significant mass effect with midline shift
  - Evidence of internal carotid artery dissection that is flow limiting or aortic dissection
  - Intracranial stent implanted in the same vascular territory that precludes the safe deployment/removal of the neurothrombectomy device
  - Acute symptomatic arterial occlusions in more than one vascular territory confirmed on CTA/MRA (e.g., bilateral MCA occlusions, or an MCA and a basilar artery occlusion)

### Arms
**Arm 1 — intervention** · arm: "Endovascular thrombectomy + standard medical therapy" · agent: "Stent-retriever / aspiration thrombectomy — protocol-approved devices: Trevo Retriever; Solitaire FR; Penumbra system; Covidien MindFrame (device choice at operator discretion)" · route: "Endovascular" · frequency: "Single procedure, initiated 6–16 h from last known well" · duration: "One-time procedure" · coInterventions: "+ standard medical therapy (IV thrombolysis if eligible per criteria; antiplatelet)" · note: "Device list/operator-discretion verbatim from CT.gov NCT02586415. IV tPA permitted as co-treatment only within label/time constraints."

**Arm 2 — control** · arm: "Medical Management (standard medical therapy alone)" · agent: "Standard medical therapy (no thrombectomy)" · route: "Medical" · coInterventions: "Standard medical therapy alone (IV thrombolysis if eligible + antiplatelet)" · note: "Source: CT.gov NCT02586415 arm description."

### Discrepancy flags
- Headline window 6–16 h matches CT.gov and repo subtitle. Consistent. No registry-vs-publication eligibility discrepancy.

---

## 3. ESCAPE — `escape-trial` → NCT01778335

### NCT-verification verdict
**NCT verified:** resolves to "Endovascular Treatment for Small Core and Anterior Circulation Proximal Occlusion With Emphasis on Minimizing CT to Recanalization Times (ESCAPE) Trial" — Goyal et al., NEJM 2015;372(11):1019-1030 (DOI 10.1056/NEJMoa1414905, PMID 25671798). Confirmed 2015 EVT trial. No mismatch.

### Full eligibility — VERBATIM, grouped
- **source:** `clinicaltrials.gov` · **sourceUrl:** `https://clinicaltrials.gov/study/NCT01778335` · **sourceLabel:** `ClinicalTrials.gov NCT01778335` · **retrieved:** `2026-06-08`

**inclusion:**
- **"Clinical (heterogeneous sampling frame)"**
  - Acute ischemic stroke
  - Age 18 or greater
  - Onset (last-seen-well) time to randomization time <12 hours
  - Disabling stroke defined as a baseline NIHSS >5 at the time of randomization
  - Pre-stroke (24 hours prior to stroke onset) independent functional status in activities of daily living with modified Barthel Index >90. Patient must be living in their own home, apartment or seniors lodge where no nursing care is required
- **"Imaging (homogeneous target population)"**
  - Confirmed symptomatic intracranial occlusion, based on single phase, multiphase or dynamic CTA, at one or more of the following locations: Carotid T/L, M1 MCA, or M1-MCA equivalent (2 or more M2-MCAs). Anterior temporal artery is not considered an M2
  - Non-contrast CT and CTA for trial eligibility performed or repeated at ESCAPE stroke center with endovascular suite on-site
  - Endovascular treatment intended to be initiated (groin puncture) within 60 minutes of baseline non-contrast CT with target baseline non-contrast CT to first recanalization of 90 minutes
  - Signed informed consent or appropriate signed deferral of consent where approved

**exclusion:**
- (single group)
  - Baseline non-contrast CT reveals a moderate/large core defined as extensive early ischemic changes of ASPECTS 0-5 in the territory of symptomatic intracranial occlusion
  - Other confirmation of a moderate to large core defined one of three ways: (a) on single phase, multiphase or dynamic CTA: no or minimal collaterals in a region greater than 50% of the MCA territory when compared to pial filling on the contralateral side (multiphase/dynamic CTA preferred); OR (b) on CT perfusion (>8 cm coverage): a low CBV and very low CBF ASPECTS <6 AND in the symptomatic MCA territory; OR (c) on CT perfusion (<8 cm coverage): a region of low CBV and very low CBF >1/3 of the CTP imaged symptomatic MCA territory
  - Groin puncture is not possible within 60 minutes of the first slice of non-contrast CT acquisition (if CTP is performed it should be done after CTA)
  - No femoral pulses or very difficult endovascular access that will result in a non-contrast CT-to-recanalization time longer than 90 minutes, or an inability to deliver endovascular therapy
  - Pregnancy; if a woman is of child-bearing potential a urine or serum beta HCG test is positive
  - Severe contrast allergy or absolute contraindication to iodinated contrast
  - Suspected intracranial dissection as a cause of stroke
  - Clinical history, past imaging or clinical judgment suggests that the intracranial occlusion is chronic
  - Patient has a severe or fatal comorbid illness that will prevent improvement or follow-up or that will render the procedure unlikely to benefit the patient

### Arms
**Arm 1 — intervention** · arm: "Endovascular thrombectomy/thrombolysis + best medical care" · agent: "Endovascular mechanical thrombectomy (retrievable stents; suction via balloon guide catheter when feasible) and/or endovascular delivery of thrombolytic agent" · route: "Endovascular" · frequency: "Single procedure; groin puncture targeted within 60 min of baseline NCCT, CT-to-first-recanalization target 90 min" · duration: "One-time procedure" · coInterventions: "+ IV alteplase within 4.5 h if eligible (given in both arms); best medical care" · note: "Procedure verbatim from CT.gov; device-agnostic (no specific brand named). Retrievable-stent + balloon-guide aspiration + IV-alteplase-if-eligible from Goyal NEJM 2015 Methods."

**Arm 2 — control** · arm: "Best medical care (control)" · agent: "Standard/best medical care" · route: "Medical" · coInterventions: "Best medical care including IV alteplase within 4.5 h when eligible" · note: "Source: CT.gov NCT01778335 control arm; IV-alteplase-if-eligible both arms per Goyal NEJM 2015."

### Discrepancy flags
- Window <12 h matches repo. Consistent.
- **STATS (out of scope, for trial-statistician/medical-scientist):** WikiJournalClub/published primary common OR **3.1 (95% CI 2.0–4.7)**; repo `effectSize` shows "OR 2.6." Reconcile the `effectSize` value against the primary publication before any stats edit. Does NOT block eligibility/arm transcription.

---

## 4. ECASS III — `ecass3-trial` → NCT00153036

### NCT-verification verdict
**NCT verified:** resolves to ECASS III (Hacke et al., NEJM 2008;359(13):1317-1329, DOI 10.1056/NEJMoa0804656, PMID 18815396). No mismatch.

### Full eligibility — VERBATIM, grouped
- **source:** `clinicaltrials.gov` · **sourceUrl:** `https://clinicaltrials.gov/study/NCT00153036` · **sourceLabel:** `ClinicalTrials.gov NCT00153036` · **retrieved:** `2026-06-08`

> **Headline-window handling:** CT.gov inclusion text reads "between 3 and 4 hours"; CT.gov exclusion text and the official title read "more than 4 hours and 30 minutes" / "3 and 4 Hours 30 Minutes." Published protocol window is **3.0–4.5 hours** (Hacke 2008). Use 3–4.5 h for the headline; both registry strings recorded verbatim for provenance.

**inclusion:** (single group)
  - Female or male inpatients
  - Age: 18 - 80 years
  - Clinical diagnosis of ischemic stroke causing a measurable neurological deficit defined as impairment of language, motor function, cognition and/or gaze, vision or neglect. Ischemic stroke is defined as an event characterized by the sudden onset of an acute focal neurologic deficit presumed to be due to cerebral ischemia after CT scan excludes hemorrhage
  - Onset of symptoms between 3 and 4 hours prior to initiation of administration of study drug *(registry text; published protocol window is 3–4.5 h — see flag)*
  - Stroke symptoms are to be present for at least 30 minutes and have not significantly improved before treatment. Symptoms must be distinguishable from an episode of generalized ischemia (i.e. syncope), seizure, or migraine disorder
  - Patient is willing to participate voluntarily and to sign a written patient informed consent (informed consent obtained from the patient, legally authorized representative or relatives, or deferred where applicable, per the regulatory and legal requirements of the participating country)
  - Patients who are unable to sign but who are able to understand the meaning of participation in the study may give an oral witnessed informed consent
  - Willingness and ability to comply with the protocol

**exclusion:** (single group)
  - Evidence of intracranial hemorrhage (ICH) on the CT-scan
  - Symptoms of ischaemic attack began more than 4 hours and 30 minutes prior to infusion start or when time of symptom onset is unknown
  - Minor neurological deficit or symptoms rapidly improving before start of infusion
  - Severe stroke as assessed clinically (e.g. NIHSS >25) and/or by appropriate imaging techniques
  - Epileptic seizure at onset of stroke
  - Symptoms suggestive of subarachnoid haemorrhage, even if the CT-scan is normal
  - Administration of heparin within the previous 48 hours and a thromboplastin time exceeding the upper limit of normal for laboratory
  - History of prior stroke and concomitant diabetes
  - Prior stroke within the last 3 months
  - Platelet below 100,000/mm³
  - Systolic blood pressure >185 mmHg or diastolic blood pressure >110 mmHg, or aggressive management (IV medication) necessary to reduce BP to these limits
  - Blood glucose <50 or >400 mg/dl (<2.77 or >22.15 mmol/l)
  - Known haemorrhagic diathesis
  - Patients receiving oral anticoagulants
  - Manifest or recent severe or dangerous bleeding
  - Known history of or suspected intracranial haemorrhage
  - Suspected subarachnoid haemorrhage or condition after subarachnoid haemorrhage from aneurysm
  - History of central nervous system damage (i.e. neoplasm, aneurysm, intracranial or spinal surgery)
  - Haemorrhagic retinopathy, e.g. in diabetes (vision disturbances may indicate haemorrhagic retinopathy)
  - Recent (less than 10 days) traumatic external heart massage, obstetrical delivery, recent puncture of a non-compressible blood-vessel (e.g. subclavian or jugular vein puncture)
  - Bacterial endocarditis, pericarditis
  - Acute pancreatitis
  - Documented ulcerative gastrointestinal disease during the last 3 months, oesophageal varices, arterial aneurysm, arterial/venous malformation
  - Neoplasm with increased bleeding risk

### Arms (per-arm dose from publication; CT.gov stores only a combined label)
**Arm 1 — intervention** · arm: "IV Alteplase (rt-PA)" · agent: "Alteplase (rt-PA)" · dose: "0.9 mg/kg (maximum 90 mg)" · route: "IV" · frequency: "10% of the total dose as an initial IV bolus, then the remainder as a continuous IV infusion" · duration: "60-minute infusion (remainder after bolus)" · coInterventions: "+ best medical treatment; per protocol no IV anticoagulants/antiplatelets in first 24 h" · note: "Dose/administration from Hacke NEJM 2008 ('0.9 mg per kilogram … maximum 90 mg, 10% as a bolus and the remainder over 60 minutes')."

**Arm 2 — comparator** · arm: "Placebo" · agent: "Matching placebo" · dose: "Volume-matched to alteplase" · route: "IV" · frequency: "Identical bolus-then-infusion schedule" · duration: "60-minute infusion" · coInterventions: "+ best medical treatment" · note: "Double-blind, placebo-controlled, 1:1. Source: Hacke NEJM 2008; CT.gov NCT00153036."

### Discrepancy flags
- **Window registry-vs-publication (resolved):** registry inclusion "3 and 4 hours" is internally inconsistent with its own exclusion (">4 h 30 min") and the title. Headline = published 3–4.5 h; both registry strings preserved verbatim inside `fullEligibility`. Repo headline already uses "3–4.5 Hours." No repo headline change.
- Age cap 18–80 matches. Consistent.

---

## 5. NINDS — `ninds-trial` → stored NCT00000292 is **WRONG**

### NCT-verification verdict
**NCT MISMATCH — DO NOT USE NCT00000292.** Resolves to "Acute Withdrawal From Smoked Cocaine" (Lead Sponsor: NIDA; Conditions: Cocaine-Related Disorders, Substance Withdrawal Syndrome; Intervention: Cocaine). Unrelated to the 1995 NINDS rt-PA Stroke Study. NINDS (1995) predates the registry (launched 2000); no valid NCT exists. Sourced from publication.

> **Data-integrity action:** `ninds-trial` carries `clinicalTrialsId: 'NCT00000292'` — a wrong-trial linkage that would deep-link clinicians from the NINDS page to a cocaine-withdrawal registry record. **Remove the `clinicalTrialsId` from `ninds-trial`** (NINDS has no NCT); retain the PubMed/DOI affordance. Headline integrity finding of this pilot.

### Full eligibility — from PUBLICATION
- **source:** `publication` · **sourceUrl:** `https://doi.org/10.1056/NEJM199512143332401` · **sourceLabel:** `NINDS rt-PA Stroke Study Group, NEJM 1995;333:1581–1587; PMID 7477192` · **retrieved:** `2026-06-08`

> **Provenance caveat:** The 1995 NEJM paper does not publish a CT.gov-style enumerated list; eligibility is described narratively across Methods + protocol/Appendix, catalogued canonically in Fugate & Rabinstein, *Stroke* 2014. Items below are faithful transcription of the trial's stated entry criteria. `source: 'publication'`; confirm against full text before shipping. Holds this trial at **Medium** confidence.

**inclusion:** (single group)
  - Ischemic stroke with a clearly defined time of onset
  - Treatment able to be initiated within 180 minutes (3 hours) of symptom onset
  - A measurable neurological deficit on the NIHSS
  - Baseline non-contrast CT of the brain showing no evidence of intracranial hemorrhage

**exclusion:** (single group)
  - Stroke or serious head trauma within the preceding 3 months
  - Major surgery within 14 days
  - History of intracranial hemorrhage
  - Systolic blood pressure >185 mmHg or diastolic blood pressure >110 mmHg at the time of treatment (or requiring aggressive treatment to reduce BP to these limits)
  - Rapidly improving or minor symptoms
  - Symptoms suggestive of subarachnoid hemorrhage
  - Gastrointestinal or urinary tract hemorrhage within the preceding 21 days
  - Arterial puncture at a non-compressible site within the preceding 7 days
  - Seizure at the onset of stroke
  - Taking anticoagulants or had received heparin within the 48 hours preceding onset with an elevated aPTT
  - Prothrombin time >15 seconds
  - Platelet count <100,000/mm³
  - Blood glucose <50 mg/dL or >400 mg/dL

### Arms — from PUBLICATION
**Arm 1 — intervention** · arm: "IV Alteplase (t-PA)" · agent: "Alteplase (recombinant tissue plasminogen activator, t-PA)" · dose: "0.9 mg/kg (maximum 90 mg)" · route: "IV" · frequency: "10% of the total dose as an initial IV bolus over 1 minute, then the remainder as a continuous IV infusion" · duration: "60-minute infusion (remainder after bolus)" · coInterventions: "Best medical treatment; protocol prohibited anticoagulants and antiplatelet agents for the first 24 hours; strict BP management (<185/110)" · note: "Dose/administration from NINDS NEJM 1995 Methods. The 24-hour antithrombotic prohibition and mandatory BP control originated in this protocol."

**Arm 2 — comparator** · arm: "Placebo" · agent: "Matching placebo" · dose: "Volume-matched" · route: "IV" · frequency: "Identical bolus-then-infusion schedule" · duration: "60-minute infusion" · coInterventions: "Best medical treatment; same 24-hour antithrombotic prohibition and BP control" · note: "Double-blind, placebo-controlled, 1:1 (two-part design). Source: NINDS NEJM 1995. No NCT (pre-registry)."

### Discrepancy flags
- WRONG NCT (headline integrity finding) — flagged for removal.
- Eligibility provenance: publication-narrative, not a verbatim registry block — Medium confidence; confirm each item vs NEJM 1995 full text before merge.

---

## Section 8 — Expert and editorial caveats (summary depth; scope = eligibility + arms, not new-trial entry)

**DAWN** — 8a Hacke editorial NEJM 2018;378(1):81-83 (imaging not clock defines late-window candidacy; enriched slow-progressor population limits generalizability). 8b NEJM correspondence (early stoppage n=206/500; mid-trial mRS 0–2 coprimary upgrade w/o multiplicity adjustment — disclosed in repo). 8c AHA/ASA §4.7.2 COR 1 LOE A (repo states §4.7.2 COR 1). 8d AURORA IPD meta-analysis Lancet 2022 confirms late-window benefit.

**DEFUSE-3** — 8a **No distinct paired NEJM editorial located** (searched 2026-06-08 via PubMed comment-in, NEJM 378(8) TOC [403/paywall], web; contextualized alongside DAWN) — explicitly stated, not silently omitted. 8b NEJM correspondence 10.1056/NEJMc1803856 (RAPID dependence, early stoppage n=182/476 — disclosed in repo). 8c AHA/ASA §4.7.2 COR 1 LOE B-R. 8d AURORA Lancet 2022; SELECT2/ANGEL-ASPECT 2023 extended EVT to large cores (outside DEFUSE-3's <70 mL ceiling).

**ESCAPE** — 8a single ESCAPE-specific NEJM editorial not isolated (TOC paywalled); interpretation dominated by HERMES — explicitly partial, not silently skipped. 8b NEJM correspondence (early stoppage; optimized workflow median CT-to-reperfusion 84 min; strict collateral/ASPECTS selection — reflected in repo applicability). 8c AHA/ASA COR 1 LOE A. 8d HERMES IPD meta-analysis Lancet 2016;387:1723-1731 (n=1287, adjusted cOR 2.49 [1.76–3.53]). Stats note: published primary cOR 3.1 vs repo effectSize 2.6 — route to trial-statistician.

**ECASS III** — 8a Lyden editorial NEJM 2008;359(13):1393-1395 (supports 4.5 h; benefit decays steeply — extending window ≠ slowing down). 8b post-publication baseline-imbalance critique (more prior strokes/higher NIHSS in placebo arm); repo cautions note OR CI "barely excluded 1.0." 8c AHA/ASA §4.6.3 COR 2a LOE B-R (confirm current class vs cited 2026 guideline). 8d Emberson IPD meta-analysis Lancet 2014;384:1929-1935 (n=6756) confirms net benefit to 4.5 h with time gradient.

**NINDS** — 8a specific 1995 NEJM editorial not isolated (pre-2000 metadata sparse/paywalled) — explicitly unretrievable on search date, not silently skipped. 8b Ingall et al. *Stroke* 2004 independent reanalysis (baseline-NIHSS imbalance — benefit persisted after adjustment). 8c AHA/ASA §4.6.1 COR 1 LOE A. 8d Marler *Neurology* 2000;55:1649-1655 time-stratified (earlier = larger benefit); pooled ATLANTIS/ECASS/NINDS Lancet 2004;363:768-774 (time-benefit curve underpinning door-to-needle targets).

---

## Verification confidence

| Trial | NCT verdict | Eligibility source | Arm source | Confidence | Limiting field |
|---|---|---|---|---|---|
| DAWN | Verified | CT.gov (grouped, verbatim) | CT.gov + Nogueira 2018 | **High** | — |
| DEFUSE-3 | Verified | CT.gov (grouped, verbatim) | CT.gov + Albers 2018 | **High** | — |
| ESCAPE | Verified | CT.gov (grouped, verbatim) | CT.gov + Goyal 2015 | **High** (eligibility/arms) | `effectSize` OR (2.6 repo vs 3.1 published) — outside packet remit |
| ECASS III | Verified | CT.gov (grouped, verbatim) | Publication (Hacke 2008) | **High** (arms/eligibility) | registry window inconsistency (resolved to 3–4.5 h) |
| NINDS | **MISMATCH (NCT wrong)** | Publication (narrative) | Publication (NINDS 1995) | **Medium** | eligibility is publication-narrative — confirm vs NEJM 1995 full text |

**Overall: not a block.** Four registry trials verified, High confidence for eligibility + arms. NINDS Medium (publication-sourced + confirmed bad NCT).

## Data-integrity summary
**3 issues:** (1) **NINDS `clinicalTrialsId: 'NCT00000292'` WRONG** → resolves to a NIDA cocaine-withdrawal study; remove NCT from `ninds-trial`. (2) **ECASS III registry window internally inconsistent** → resolved to published 3–4.5 h for headline, both registry strings preserved. (3) **ESCAPE primary OR mismatch** (repo 2.6 vs published 3.1) → flagged to trial-statistician, outside this eligibility/arm packet. DAWN, DEFUSE-3, ESCAPE NCTs all verified correct.
