
export interface GuideTopic {
  id: string;
  title: string;
  category: string;
  content: string;
}

export const GUIDE_CONTENT: Record<string, GuideTopic> = {
  // --- NEURO TRIALS (Vascular Neurology) ---
  'shine-trial': {
    id: 'shine-trial',
    title: 'SHINE Trial: Glycemic Control in Acute Stroke',
    category: 'Neuro Trials',
    content: `
## Clinical Context
Hyperglycemia occurs in up to 40% of patients with acute ischemic stroke and is associated with worse clinical outcomes, increased infarct expansion, and higher risk of hemorrhagic transformation. The SHINE trial (Stroke Hyperglycemia Insulin Network Effort) sought to determine if intensive glucose control improved 90-day functional outcomes.

## Trial Summary
*   **Design:** Multicenter, randomized, open-label, blinded-endpoint trial.
*   **Population:** 1,151 patients with acute ischemic stroke and hyperglycemia (glucose >110 mg/dL if diabetic, >150 mg/dL if non-diabetic).
*   **Intervention:** Intensive insulin (IV infusion, target 80–130 mg/dL) vs. Standard care (SC insulin, target <180 mg/dL).
*   **Outcome:** No significant difference in favorable functional outcome (mRS) at 90 days.

## Clinical PEARLS
*   **No Benefit to Intensive Control:** Targeting a tight range of 80–130 mg/dL with IV insulin did not improve 90-day outcomes compared to standard subcutaneous sliding scale targeting <180 mg/dL.
*   **Hypoglycemia Risk:** Intensive therapy significantly increased the risk of severe hypoglycemia (2.6% vs. 0%), often leading to premature discontinuation of the infusion.
*   **Practical Threshold:** Current [Acute Stroke Management](/guide/acute-stroke-mgmt) protocols utilize a threshold of 180 mg/dL for treatment initiation based on these results.
*   **Nursing Burden:** Intensive IV insulin required significantly more frequent monitoring (often hourly), which increased nursing workload without improving patient recovery.
*   **Standard of Care:** Meticulous glucose monitoring is still required, but "permissive" hyperglycemia up to 180 mg/dL is safer than aggressive lowering.

## Conclusion
The SHINE trial reinforces that for acute ischemic stroke, "less is more" regarding glycemic intensity. Clinicians should prioritize avoiding hypoglycemia while maintaining blood glucose below 180 mg/dL using standard subcutaneous regimens.

*Source: [SHINE Trial Investigators (JAMA 2019)](https://pmc.ncbi.nlm.nih.gov/articles/PMC6652154/)*
`
  },

  // --- VASCULAR NEUROLOGY ---
  'acute-stroke-mgmt': {
    id: 'acute-stroke-mgmt',
    title: 'Acute Management of LVO Stroke',
    category: 'Vascular Neurology',
    content: `
## 1. Thrombolysis Protocol
While thrombectomy is the definitive treatment for LVO, bridging thrombolysis remains a cornerstone.
*   **Preferred Agent:** **Tenecteplase (TNK)** is increasingly preferred over Alteplase (rtPA) due to single-bolus convenience and non-inferiority.
    *   **TNK Dosing:** 0.25 mg/kg (Max 25 mg) as a single IV bolus over 5–10 seconds.
    *   **Alteplase (rtPA) Dosing:** 0.9 mg/kg (Max 90 mg). Give 10% as initial bolus over 1 min, then remaining 90% as infusion over 60 mins.
*   **Blood Pressure Goals:**
    *   Pre-thrombolysis: < 185/110 mmHg.
    *   Post-thrombolysis: < 180/105 mmHg.
*   **Complication Management:** If bleeding is suspected, **stop rtPA infusion immediately** and initiate the reversal protocol (Cryoprecipitate, PCC, and Platelets).

## 2. Thrombectomy Selection (EVT)
Candidacy for Endovascular Thrombectomy (EVT) has expanded significantly:
*   **Late Window (6-24h):** Based on DAWN/DEFUSE-3 trials (Perfusion mismatch).
*   **Large Core Infarcts:** Now eligible based on SELECT2/ANGEL-ASPECT (ASPECTS 3-5).
*   **Distal Occlusions:** Considered based on technical feasibility and deficit severity.

## 3. Neurocritical ICU Monitoring
After admission to the Neuro-ICU, the primary goal is preventing secondary injury.
*   **Neurologic Exams:** Performed every 15 minutes immediately post-EVT, then spaced to every 1-2 hours by 8 hours post-procedure.
*   **Hemodynamics:** Avoid excessive BP variability. For non-recanalized patients, permissive hypertension (up to 220 mmHg systolic) may be reasonable to support the penumbra.
*   **Metabolic Targets:**
    *   **Glucose:** Maintain between 140 mg/dL and 180 mg/dL (See [SHINE Trial Pearls](/guide/shine-trial)). Meticulously avoid hypoglycemia (< 60 mg/dL).
    *   **Temperature:** Aggressively treat hyperthermia (> 37.5°C) to prevent exacerbation of the ischemic cascade.

## 4. Post-Thrombectomy Complications
*   **Access Site:** Monitor for groin hematoma, retroperitoneal bleed, or distal limb ischemia (especially with femoral access).
*   **Cerebral Edema:** "Malignant cerebral edema" carries 80% mortality if untreated. 
    *   *Risk Factors:* NIHSS > 20, carotid T occlusion, early CT hypodensity.
    *   *Management:* HOB > 30°, hyperosmolar therapy (Mannitol/Hypertonic Saline), and early consideration for **Hemicraniectomy** within 24-48h for patients < 60 years.
*   **Hemorrhagic Transformation:** Classified by the Heidelberg scale (HI1/2, PH1/2). PH2 (mass effect) carries the worst 90-day prognosis.

## 5. Secondary Prevention & Rehabilitation
*   **Secondary Stroke Prevention:** Perform protocolized evaluation for etiology (Atrial Fibrillation, Carotid Disease, ICAD). 
*   **Antithrombotics:** Decisions on initiation (Aspirin/Anticoagulation) must balance existing ischemic damage against the risk of hemorrhage.
*   **Early Mobilization:** While bedrest is often favored for 24h post-EVT, interprofessional rehab (PT/OT/SLP) should be initiated early to optimize independence.
`
  },
  'stroke-basics': {
    id: 'stroke-basics',
    title: 'Stroke Code Basics',
    category: 'Vascular Neurology',
    content: `
## 1. Immediate Assessment (The "Golden Hour")
*   **Establish Last Known Well (LKW):** Critical for eligibility. If wake-up stroke, LKW is time last seen normal before sleep.
*   **Vitals:** BP, HR, O2 Sat, Temp.
*   **POC Glucose:** Rule out hypoglycemia (< 50 mg/dL), which is a common mimic.
*   **NIHSS:** Perform baseline assessment by certified examiner.
    *   *Pearls:* Specifically assess for disabling deficits (e.g., isolated aphasia, visual field cut, hand weakness) even if total score is low.
    *   *History:* Screen for trauma, recent surgery (<14 days), active bleeding, anticoagulant use (time of last dose).

## 2. Acute Imaging Protocol
*   **Goal:** "Imaging is Brain". Initiate within 25 mins of arrival.
*   **Standard Protocol (0 - 6 Hours):**
    *   **NCCT Head:** Rule out hemorrhage. Assess ASPECTS (early ischemic changes).
    *   **CTA Head & Neck:** Identify Large Vessel Occlusion (LVO) in ICA, MCA (M1/M2), PCA, or Basilar artery. Detect carotid webs or dissection.
*   **Extended Window / Wake-up Protocol:**
    *   **CT Perfusion (CTP):** Required for 6-24 hour window to assess Core vs Penumbra mismatch (DAWN/DEFUSE 3 criteria).
    *   **MRI Brain:** DWI/FLAIR mismatch can identify wake-up stroke candidates likely within < 4.5h window. DWI is superior for posterior fossa and small strokes.

## 3. Laboratory Workup
*   **Stat:** Glucose, INR/PT/PTT, CBC (Platelets), Troponin.
*   **Do not delay tPA/EVT for labs** unless there is clinical suspicion of coagulopathy or known anticoagulant use.
*   **Secondary:** A1c, Lipids, Tox screen, Pregnancy test (women of childbearing age).

## 4. Cardiac Evaluation
*   **ECG:** Assess for Atrial Fibrillation or acute STEMI (can occur concurrently).
*   **Telemetry:** Minimum 24 hours to detect paroxysmal AF (STROKE-AF trial).
*   **Echocardiography:**
    *   **TTE:** Routine screening for structural source.
    *   **TEE:** Higher sensitivity for LA appendage clot, PFO, or aortic arch disease. Consider if TTE non-diagnostic and suspicion for embolic source is high.
`
  },
  'iv-tpa': {
    id: 'iv-tpa',
    title: 'IV Thrombolytic Protocol',
    category: 'Vascular Neurology',
    content: `
## Thrombolytic Agents
*   **Alteplase (tPA):** 0.9 mg/kg (Max 90 mg).
    *   **Bolus:** 10% of total dose IV push over 1 minute.
    *   **Infusion:** Remaining 90% over 60 minutes.
*   **Tenecteplase (TNK):** 0.25 mg/kg (Max 25 mg) single IV Bolus.
    *   Evidence suggests non-inferiority to Alteplase.
    *   Preferred for LVO patients being transferred (drip-and-ship) due to single bolus convenience.

## Blood Pressure Management
*   **Pre-treatment:** BP must be **< 185/110 mmHg**.
    *   *Rx:* Labetalol 10-20mg IV push (may repeat) OR Nicardipine infusion 5-15 mg/hr.
    *   *Note:* If BP remains refractory despite aggressive treatment, do not treat with lytics.
*   **Post-treatment:** Maintain BP **< 180/105 mmHg** for at least 24 hours. Monitor q15min x 2h, then q30min x 6h, then q1h x 16h.

## Inclusion Criteria
1.  Clinical diagnosis of ischemic stroke with **disabling** neurologic deficit.
2.  Time from Last Known Well < **4.5 hours**.
3.  Age >= 18 years.

## Key Exclusions (DO NOT GIVE)
*   **Hemorrhage:** Any ICH or SAH on CT.
*   **Coagulopathy:** Platelets < 100,000, INR > 1.7, PTT > 40s.
*   **Anticoagulants:**
    *   LMWH (therapeutic dose) within 24h.
    *   DOAC (Eliquis, Xarelto, etc.) within 48h (unless normal thrombin time/anti-Xa activity confirmed).
*   **Head History:** Severe head trauma or stroke within 3 months.
*   **Surgery:** Major intracranial or intraspinal surgery within 3 months.
*   **Bleeding Risk:** GI malignancy or bleed within 21 days; Suspected aortic arch dissection; Active internal bleeding.
*   **Imaging:** CT shows extensive hypodensity (> 1/3 MCA territory).

## Relative Exclusions (Weigh Risk vs Benefit)
*   Minor or rapidly improving symptoms (Treat if disabling!).
*   Major surgery or trauma < 14 days.
*   Seizure at onset (Treat if imaging confirms stroke).
*   Pregnancy.
*   Recent MI (< 3 months).

## Wake-Up / Unknown Onset
*   Patients with unknown onset may be eligible if:
    *   **MRI:** DWI positive (acute) + FLAIR negative (no signal change) suggests onset < 4.5h.
    *   **Perfusion:** Favorable penumbral salvage profile.
`
  },
  'thrombectomy': {
    id: 'thrombectomy',
    title: 'Mechanical Thrombectomy (EVT)',
    category: 'Vascular Neurology',
    content: `
## Indications
Use the **[Thrombectomy Calculator](/calculators?id=evt&returnTo=/guide/thrombectomy)** to stratify patients by trial criteria.

*   **Occlusion:** Proximal Large Vessel Occlusion (LVO) in Anterior Circulation (ICA, M1).
*   **Pre-stroke Function:** mRS 0-1 (Independent).
*   **Time:** 0 - 24 hours from Last Known Well.

## Selection Criteria by Time Window
1.  **Early Window (0 - 6 Hours):**
    *   NCCT **ASPECTS >= 6** (Small core infarct).
    *   *New Evidence:* **Large Core** (ASPECTS 3-5 or Core > 50cc) now shown to benefit (SELECT2, ANGEL-ASPECT, RESCUE-Japan trials).
2.  **Late Window (6 - 24 Hours):**
    *   Must meet **DAWN** or **DEFUSE-3** criteria.
    *   Requires CTP or MRI to demonstrate **Clinical-Core Mismatch** (small core, large clinical deficit/penumbra).

## Posterior Circulation & Distal Occlusions
*   **Basilar Artery Occlusion:** Strong evidence for EVT up to 24 hours (ATTENTION, BAOCHE trials).
*   **Distal/Medium Vessel:** M2/M3 MCA branches, ACA, and PCA occlusions are increasingly treated based on technical feasibility and deficit severity.

## Procedural Management
*   **Bridging Therapy:** Administer IV Thrombolytic (tPA/TNK) if eligible. **Do not delay** transport to angio suite to wait for lytic effect.
*   **Anesthesia:** Conscious sedation preferred to monitor neuro status, unless airway unprotected or patient agitated (then GETA).
*   **BP Goals:** Avoid hypotension. Maintain SBP > 140 mmHg typically to support collaterals until reperfusion.
*   **Intracranial Atherosclerosis (ICAD):** If underlying stenosis found (common in Asian populations), may require angioplasty/stenting and antiplatelet load (e.g., Tirofiban/Aspirin).

## Complications to Monitor
*   **Reperfusion Injury:** Hemorrhagic transformation (monitor BP strict < 140-160 post-procedure depending on recanalization status).
*   **Groin:** Hematoma, retroperitoneal bleed.
*   **Vessel:** Dissection, perforation, embolization to new territory.
`
  },
  'hemorrhagic-stroke': {
    id: 'hemorrhagic-stroke',
    title: 'Hemorrhagic Stroke & ICH',
    category: 'Vascular Neurology',
    content: `
## Causes of Hemorrhage
*   **Hypertension:** Small lenticulostriate (lipohyalinosis/microaneurysms). 70% deep structures/basal ganglia, 10% cerebellum, 10% pons.
*   **Amyloid:** Lobar.
*   **Vascular:** AVM or Cavernoma (lobar).
*   **Inflammation:** Vasculitis.
*   **Tumor:** Melanoma, Renal Cell, Lung, Chorio, Thyroid, Breast.
*   **Infectious:** HSV.
*   **Dyscrasias:** Abnormal PT/PTT/INR.
*   **Trauma:** Capillary telangiectasias/venous anomalies (rarely bleed).

## [ICH Score](/calculators?id=ich&returnTo=/guide/hemorrhagic-stroke) (Mortality Prediction)
| Component | Criteria | Points |
|---|---|---|
| **[GCS](/calculators?id=gcs&returnTo=/guide/hemorrhagic-stroke)** | 3-4 | 2 |
| | 5-12 | 1 |
| **ICH Volume** | ≥ 30 cc | 1 |
| **IVH Extension** | Yes | 1 |
| **Infratentorial** | Yes | 1 |
| **Age** | ≥ 80 | 1 |

**Mortality Estimate:**
*   Score 0: 0%
*   Score 1: 13%
*   Score 2: 26%
*   Score 3: 72%
*   Score 4: 97%
*   Score 5-6: 100%
`
  },
  'anticoagulation-reversal': {
    id: 'anticoagulation-reversal',
    title: 'Anticoagulation Reversal',
    category: 'Vascular Neurology',
    content: `
## Immediate Reversal Agents
*   **Coumadin:** Vitamin K 5-10mg IV (over 10 mins) + PCC (Prothrombin Complex Concentrate).
*   **Heparin:** Protamine sulfate (1mg per 100u heparin in last 2-3 hrs).
*   **LMWH:** Andexxa or Protamine sulfate.
*   **Antiplatelets:** Platelet transfusion (1u if ASA, 2u if Plavix/Dual). DDVAP (0.4mcg/kg IV).
*   **Anti-Xa (Eliquis/Xarelto):** Andexxa.
*   **Pradaxa:** Praxbind (5g IV).

## Management of Elevated INR
| INR | Bleeding | Treatment |
|---|---|---|
| < 5 | None/Minimal | Hold warfarin 1-2 days or decrease dose. |
| 5-9 | None/Minimal | Hold warfarin. Resume when INR therapeutic. Oral Vit K (1-2.5mg) if high risk. |
| > 9 | None/Minimal | Hold warfarin. High dose oral Vit K (2.5-5mg). |
| Any | Serious/Life Threatening | Hold warfarin. **IV Vitamin K + PCC**. |
`
  },

  // --- NEUROCRITICAL CARE ---
  'icp-mgmt': {
    id: 'icp-mgmt',
    title: 'Management of Increased ICP',
    category: 'Neurocritical Care',
    content: `
**Formula:** CPP = MAP - ICP.
**Goal:** ICP < 20-25 mmHg. CPP > 60 mmHg.

## Interventions
1.  **Airway:** Intubate if [GCS](/calculators?id=gcs&returnTo=/guide/icp-mgmt) < 8.
2.  **Imaging:** STAT CT Head.
3.  **Position:** HOB 30 degrees. Avoid lateral neck flexion or constriction.
4.  **Hyperventilation:** Target PCO2 30-35 mmHg.
    *   *Note: Only temporary (bridge). Do not drop < 25 mmHg.*
5.  **Hyperosmolar Agents:**
    *   **Mannitol:** 1g/kg bolus -> 0.25g/kg q6h. Monitor Serum Osm (Keep < 320). Euvolmia maintenance.
    *   **Hypertonic Saline (3%):** 100ml bolus -> Infusion to Na goal 150-155. Check Na q2-4h. Can use 23.4% (30ml) via central line for crisis.
6.  **Sedation/Analgesia:** Control pain/cough.
7.  **Seizure/Fever:** Control aggressively.
8.  **Refractory:** Hypothermia (32-34C). Barbiturate coma (Pentobarbital) as last resort.
`
  },
  'sah-mgmt': {
    id: 'sah-mgmt',
    title: 'Aneurysmal SAH Management',
    category: 'Neurocritical Care',
    content: `
## Initial Management
*   Intubate if [GCS](/calculators?id=gcs&returnTo=/guide/sah-mgmt) < 8.
*   Reverse anticoagulation.
*   **BP Goal:** SBP < 160 (Labetalol, Nicardipine). *Avoid Nitroprusside/Nitroglycerin (increases cerebral blood volume/ICP).*
*   **Nimodipine:** 60mg q4h for 21 days (improves outcomes, prevents delayed ischemia).

## Modified Fisher Scale (Vasospasm Risk)
| Grade | Criteria | Vasospasm Risk |
|---|---|---|
| 0 | No SAH/IVH | 0% |
| 1 | Thin SAH (<1mm), No IVH | 24% |
| 2 | Thin SAH, IVH present | 33% |
| 3 | Thick SAH (≥1mm), No IVH | 33% |
| 4 | Thick SAH, IVH present | 40% |
`
  },
  'hypoxic-brain': {
    id: 'hypoxic-brain',
    title: 'Hypoxic Brain Injury & Brain Death',
    category: 'Neurocritical Care',
    content: `
## Hypoxic Brain Injury Workup
*   Long term video EEG.
*   CT Head non-contrast and MRI Brain.
*   SSEP (Median Nerve).
*   NSE (Neuron Specific Enolase).

## Brain Death Protocol
*   2 Exams of cerebral and brain stem function 6 hours apart.
*   **Apnea Test** (Performed at end of 2nd exam):
    1.  Pre-oxygenate 100% for 10 min.
    2.  Reduce RR to 10 and PEEP to 5.
    3.  Draw baseline ABG.
    4.  Discontinue Vent, place O2 NC at carina 6L.
    5.  ABG immediately and after 5 min.
    *   **Positive Result:** No spontaneous breathing AND (PCO2 > 55 OR PCO2 increase by >20) OR pH <= 7.25.
`
  },

  // --- EPILEPSY ---
  'status-epilepticus': {
    id: 'status-epilepticus',
    title: 'Management of Status Epilepticus',
    category: 'Epilepsy',
    content: `
1.  **Initial:** ABCs, O2, IV Access. Labs (Chem-7, Mg, Ca, CBC, LFTs, AED levels, Tox screen).
2.  **Thiamine:** 100mg IV + D50 50mL (unless glucose known).
3.  **Benzodiazepine:**
    *   Lorazepam 2mg IV (Max 8mg).
    *   Alt: Diazepam 20mg PR or Midazolam 10mg IM.
4.  **Anti-Epileptic:** Fosphenytoin 20mg/kg IV @ 150mg/min (Monitor BP/EKG).
5.  **Refractory (Intubation Required):**
    *   **Midazolam Drip:** Load 0.2mg/kg. Rate 0.1-2.9 mg/kg/hr.
    *   **Propofol Drip:** Load 1-2mg/kg. Rate 1-15 mg/kg/hr. *(Watch for Propofol Infusion Syndrome)*.
    *   **Pentobarbital:** Load 5mg/kg. Rate 1-10 mg/kg/hr.
`
  },
  'emu-orders': {
    id: 'emu-orders',
    title: 'EMU Orders',
    category: 'Epilepsy',
    content: `
*   Long term video EEG.
*   **Labs:** CK, Urine drug screen.
*   **Nursing Orders:**
    *   Sleep deprivation until 2am.
    *   Photic stimulation.
    *   Hyperventilation.
*   **Medications:** AEDs per attending. Ativan PRN.
*   **Precautions:** Seizure, Fall, Aspiration.
`
  },

  // --- INFECTIOUS & GENERAL WORKUP ---
  'meningitis': {
    id: 'meningitis',
    title: 'Meningitis',
    category: 'Infectious Disease',
    content: `
## CSF Profiles
| Type | Glucose (40-70) | Protein (15-45) | Cells |
|---|---|---|---|
| **Acute Bacterial** | Low | High | PMNs > 300 |
| **Acute Viral** | Normal | Normal/High | Mono < 300 |
| **Tuberculous** | Low | High | Mono/PMN < 300 |
| **Fungal** | Low | High | < 300 |
| **Malignant** | Low | High | Mononuclear |

## Management
*   **Tests:** Cell count, protein, glucose, culture, encephalitis panel.
*   **Empiric Tx:** Vancomycin + Ceftriaxone + Acyclovir (10mg/kg q8h).
`
  },
  'workups': {
    id: 'workups',
    title: 'General Neurology Workups',
    category: 'General Neurology',
    content: `
## Hypercoagulable Workup
Protein S, Protein C, Antithrombin III, Anticardiolipin Ab, Lupus anticoagulant, Beta 2 glycan, Homocysteine, Factor VIII, Factor V Leiden, Prothrombin Mutation.

## Vasculitis Workup
ANA, RF, RPR/VDRL, Hep B/C Panel, ESR, Cryoglobulins, HSV, HIV, CRP, ACE, C1Q, SSA/SSB, ANCA (p/c), C3/C4, SPEP, Anti-Ds DNA, Lyme.

## Neuropathy Workup
CBC, BMP, HbA1c, TFTs, B12, Folate, Methylmalonic Acid, SPEP, HIV, Hepatitis, Lyme, RPR.
*   **Toxic:** Heavy metals, alcohol.
*   **Genetic:** If indicated (CMT).
*   **Paraneoplastic:** If indicated.

## Myopathy Workup
CPK, ESR, CRP, TFT, ANA/Autoimmune, EMG/NCS, Muscle Biopsy.
`
  },
  'dementia-workup': {
    id: 'dementia-workup',
    title: 'Dementia Workup',
    category: 'Cognitive Neurology',
    content: `
*   **History:** Drug review (anticholinergics, sedatives).
*   **Cognitive:** MMSE or MoCA.
*   **Labs:** CBC, BMP, TSH, B12, MMA, Homocysteine, Thiamine, RPR.
*   **Advanced:** Heavy metal, Paraneoplastic, APOE (AD), 14-3-3 (CJD).
*   **Imaging:** MRI Brain or CT Head.
*   **Procedures:** EEG, LP, Neuropsych testing.
`
  },
  
  // --- NEUROMUSCULAR & IMMUNOLOGY ---
  'myasthenia-gravis': {
    id: 'myasthenia-gravis',
    title: 'Myasthenia Gravis',
    category: 'Neuromuscular',
    content: `
## Workup
*   TFTs
*   AChR antibodies (Binding, Blocking, Modulating).
*   MuSK antibodies.
*   CT Chest (Thymoma).
*   EMG/NCS (Repetitive stim, Single fiber).

## Treatment (Crisis)
*   **Respiratory:** Monitor NIF and FVC q4h. Intubate if NIF < 20 or FVC < 1L.
*   **Acute:** Plasmapheresis (PLEX) or IVIG (0.4g/kg/day x 5 days).
*   **Contraindicated Meds:** Aminoglycosides, Fluoroquinolones, Macrolides, Beta-blockers, Magnesium.
`
  },
  'gbs': {
    id: 'gbs',
    title: 'Guillain-Barre Syndrome',
    category: 'Neuromuscular',
    content: `
## Workup
*   **LP:** Albuminocytologic dissociation (High protein, Normal WBC).
*   **EMG/NCS:** Demyelinating features (slow conduction, prolonged latency, blocks) or Axonal features.
*   **MRI Spine:** Enhancement of nerve roots/cauda equina.
*   **Antibodies:** Anti-GQ1b (Miller Fisher).

## Treatment
*   **IVIG:** 0.4g/kg for 5 days (Check IgA level first).
*   **PLEX:** 40-50ml/kg for 5 doses.
*   **Monitoring:** NIF/FVC q4h (Intubate if NIF < 20 / FVC < 1L). Cardiac monitoring (autonomic instability). DVT ppx.
`
  },
  'multiple-sclerosis': {
    id: 'multiple-sclerosis',
    title: 'Multiple Sclerosis',
    category: 'Neuroimmunology',
    content: `
## Initial Workup
*   MRI Brain and Neuro-axis (C/T spine) with/without contrast.
*   **LP (CSF):** Oligoclonal bands (paired with serum), IgG Index, Myelin Basic Protein, Cell count.
*   **Labs:** NMO/AQP-4, Anti-MOG, ACE, Lyme, B12, ANA.
*   Visual Evoked Potentials (VEP).

## Acute Treatment
*   **Methylprednisolone:** 1000mg IV daily x 3-5 days.
*   GI prophylaxis (PPI).
*   Sliding scale insulin.
*   Oral prednisone taper often follows.
`
  }
};
