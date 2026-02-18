/**
 * 2026 AHA/ASA Guideline for Early Management of Acute Ischemic Stroke
 *
 * Source: Prabhakaran et al. "2026 Guideline for the Early Management of
 * Patients With Acute Ischemic Stroke: A Guideline From the American Heart
 * Association/American Stroke Association."
 * Stroke. 2026;57:e00–e00. DOI: 10.1161/STR.0000000000000513
 *
 * PURPOSE: This file is a VALIDATION REFERENCE for all stroke-related content
 * in NeuroWiki. Any code, copy, or clinical data related to acute ischemic
 * stroke MUST be cross-checked against these recommendations for accuracy.
 *
 * COR = Class of Recommendation
 *   COR 1     = Strong recommendation (benefit >>> risk)
 *   COR 2a    = Moderate recommendation (benefit >> risk)
 *   COR 2b    = Weak recommendation (benefit ≥ risk, uncertain)
 *   COR 3 No Benefit = Not recommended (no proven benefit)
 *   COR 3 Harm = Contraindicated (proven harm)
 *
 * LOE = Level of Evidence
 *   A    = High quality (multiple RCTs or meta-analyses)
 *   B-R  = Moderate quality (single RCT or nonrandomized with limitations)
 *   B-NR = Moderate quality (nonrandomized/observational)
 *   C-LD = Limited data
 *   C-EO = Expert opinion/consensus
 */

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 2: PREHOSPITAL & SYSTEMS OF CARE
// ─────────────────────────────────────────────────────────────────────────────

export const prehospitalRecommendations = {
  strokeAwareness: [
    {
      cor: "1",
      loe: "B-R",
      text: "For the general public, implementation of educational programs on stroke recognition in patients of all ages and the need to seek emergency care (calling 9-1-1) is recommended.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "Educational programs on stroke recognition should be designed to reach diverse communities and populations to reduce knowledge gaps across all demographics.",
    },
  ],

  emsSystems: [
    {
      cor: "1",
      loe: "B-NR",
      text: "Health care policy makers should establish regional systems of stroke care to increase access to time-sensitive therapies, including determination of IVT-capable and EVT-capable centers.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "EMS leaders should develop prehospital triage protocols to ensure patients with suspected stroke are rapidly identified, assessed with a validated screening tool, and transported to the most appropriate facility.",
    },
  ],

  prehospitalAssessment: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with suspected stroke transported by ambulance, use of a brief stroke assessment tool by prehospital personnel is recommended to improve early stroke identification, including large vessel occlusion (LVO) stroke.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "Prehospital personnel should provide advance notification to the receiving hospital of an inbound suspected stroke to reduce in-hospital evaluation times, increase thrombolytic use, and decrease mortality.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Ambulance-initiated remote ischemic conditioning (RIC) with arm blood pressure cuff inflation does not improve functional outcome and is not recommended.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "Prehospital initiation of stroke treatment with transdermal glyceryl trinitrate (GTN/nitroglycerin) does not improve functional outcome and is potentially harmful.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Intensive BP control in the field to a target of 130–140 mm Hg systolic does not improve functional outcome.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In pediatric patients with suspected stroke transported by ambulance, the usefulness of common adult stroke screening tools is uncertain because they perform poorly for identification of stroke.",
    },
  ],

  emsDestination: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In areas without well-coordinated SSOC and rapid interhospital transfer, in patients with suspected stroke with LVO features, direct transport to the closest EVT-capable center (TSC or CSC) is reasonable when travel time to the EVT center does not exceed travel time to a closer non-EVT center by more than 30–60 minutes.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In areas with well-coordinated SSOC and local hospitals with rapid DIDO times for thrombectomy transfers, bypassing the closest thrombolytic-capable hospital to go directly to an EVT center is not recommended.",
    },
  ],

  mobileStrokeUnits: [
    {
      cor: "1",
      loe: "B-R",
      text: "For patients with AIS who are eligible for IVT, treatment with IVT on a mobile stroke unit (MSU) is recommended to improve functional outcomes compared with standard EMS transport.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In endovascular thrombectomy-eligible patients, MSU dispatch can be beneficial to triage patients to the appropriate thrombectomy-capable center.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3: IMAGING
// ─────────────────────────────────────────────────────────────────────────────

export const imagingRecommendations = {
  initial: [
    {
      cor: "1",
      loe: "A",
      text: "Neuroimaging of the brain is recommended before initiating any specific therapy to treat AIS to exclude brain hemorrhage and non-vascular etiologies of neurological dysfunction.",
    },
    {
      cor: "1",
      loe: "A",
      text: "Noncontrast CT of the brain is recommended as the initial diagnostic imaging study for most patients with suspected AIS.",
    },
    {
      cor: "1",
      loe: "A",
      text: "MRI (DWI) is recommended as an alternative to CT in institutions with appropriate expertise and where it can be performed without delaying treatment.",
    },
  ],
  vascular: [
    {
      cor: "1",
      loe: "A",
      text: "Noninvasive intracranial vascular imaging (CTA or MRA) is recommended for identifying candidates for mechanical thrombectomy in patients with suspected acute LVO stroke.",
    },
  ],
  pediatric: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In pediatric patients with suspected AIS, emergent brain and vascular imaging with MRI/MRA of the cervical and intracranial vessels is reasonable to identify patients with LVO and differentiate arterial ischemic stroke from hemorrhagic stroke or stroke mimics.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In pediatric patients with suspected AIS, emergent brain and vascular imaging with CT/CTA is reasonable if MRI/MRA is not available immediately (within 25 minutes).",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.3: BLOOD PRESSURE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const bloodPressureRecommendations = {
  general: [
    {
      cor: "1",
      loe: "C-LD",
      text: "In patients with AIS, hypotension and hypovolemia should be corrected to maintain systemic perfusion levels necessary to support organ function.",
    },
    {
      cor: "1",
      loe: "C-EO",
      text: "In patients with AIS, early treatment of hypertension is indicated when required by comorbid conditions (e.g., concomitant acute coronary event, acute heart failure, aortic dissection, post-thrombolysis sICH, or preeclampsia/eclampsia).",
    },
    {
      cor: "2b",
      loe: "C-EO",
      text: "In patients with BP ≥220/120 mm Hg who did not receive IVT or EVT and have no comorbid conditions requiring urgent antihypertensive treatment, the benefit of initiating or reinitiating treatment within the first 48–72 hours is uncertain.",
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "In patients with BP <220/120 mm Hg who did not receive IVT or EVT and do not have a comorbid condition requiring urgent antihypertensive treatment, initiating or reinitiating treatment of hypertension within the first 48–72 hours is not effective to prevent death or dependency.",
    },
  ],
  beforeReperfusion: [
    {
      cor: "1",
      loe: "B-NR",
      text: "Patients with AIS who have elevated BP and are otherwise eligible for IVT should have their SBP lowered to <185 mm Hg and DBP <110 mm Hg before IVT therapy is initiated to reduce hemorrhagic complications.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients for whom EVT is planned and who have not received IVT therapy, it is reasonable to maintain BP ≤185/110 mm Hg before the procedure.",
    },
  ],
  afterIVT: [
    {
      cor: "1",
      loe: "B-R",
      text: "BP should be maintained at <180/105 mm Hg for at least the first 24 hours after IVT treatment.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In patients with mild to moderate severity AIS who have been treated with IVT, intensive SBP reduction (target of <140 mm Hg compared with <180 mm Hg) is NOT recommended because it is not associated with an improvement in functional outcome.",
    },
  ],
  afterEVT: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients who undergo EVT, it is reasonable to maintain BP at a level ≤180/105 mm Hg during and for 24 hours after the procedure.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "In patients with AIS with LVO of the anterior circulation who have been successfully recanalized by EVT (mTICI 2b, 2c, or 3) and without other indication for BP management target, intensive SBP reduction target of <140 mm Hg for the first 72 hours is HARMFUL and not recommended.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.4: TEMPERATURE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const temperatureRecommendations = [
  {
    cor: "1",
    loe: "B-R",
    text: "In patients with AIS who have hyperthermia, targeting normothermia, including using nurse-initiated protocols for managing fever, is recommended for improving functional outcomes and reducing death.",
  },
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with AIS and hyperthermia, sources of hyperthermia such as infection should be identified and treated.",
  },
  {
    cor: "3: No Benefit",
    loe: "B-R",
    text: "In patients with AIS and normothermia, treatment with induced hypothermia or prophylactic fever prevention is NOT recommended for the purpose of improving outcomes.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.5: BLOOD GLUCOSE MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const glucoseRecommendations = [
  {
    cor: "1",
    loe: "C-LD",
    text: "In patients with AIS, hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications.",
  },
  {
    cor: "2a",
    loe: "C-LD",
    text: "In patients with AIS, it is reasonable to treat persistent hyperglycemia to achieve blood glucose levels in a range of 140–180 mg/dL with close monitoring to prevent worse functional outcomes.",
  },
  {
    cor: "3: No Benefit",
    loe: "A",
    text: "In hospitalized patients with AIS with hyperglycemia, treatment with IV insulin to achieve blood glucose levels in the range of 80–130 mg/dL is NOT recommended to improve 3-month functional outcomes.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.6: IV THROMBOLYTICS (IVT)
// ─────────────────────────────────────────────────────────────────────────────

export const ivtRecommendations = {
  decisionMaking: [
    {
      cor: "1",
      loe: "A",
      text: "In adult patients with AIS with disabling deficits (regardless of NIHSS score) and eligible for IVT, faster treatment improves functional outcomes.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "In adult patients with AIS eligible for IVT within 4.5 hours of symptom onset, treatment should be initiated as quickly as possible, avoiding potential delays associated with additional multimodal neuroimaging such as CTA/MRA and CT/MR perfusion imaging.",
    },
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS who are otherwise eligible for IVT with early ischemic change of mild to moderate extent (other than frank hypodensity attributable to the clinical presentation) on initial brain imaging, IVT is recommended.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In eligible adult patients with AIS presenting with mild non-disabling stroke deficits (e.g., isolated sensory syndrome in many cases) within 4.5 hours, IVT is NOT recommended as it has not shown superiority in improving functional outcomes compared to dual antiplatelet treatment.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "In patients with AIS taking single or dual antiplatelet therapy (DAPT) and otherwise eligible for IVT, IVT is recommended to improve functional outcomes despite a small absolute increased risk of sICH (~0.9%–1.2%), outweighed by anticipated treatment benefit (~8%).",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients with AIS with 1–10 cerebral microbleeds (CMBs) on pretreatment MRI, treatment with IVT is reasonable. Do NOT delay IVT to obtain MRI to screen for CMBs.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS with high burden of CMBs (>10) on pretreatment MRI, IVT may be associated with increased risk of sICH — weigh risks carefully.",
    },
  ],

  agentChoice: [
    {
      cor: "1",
      loe: "A",
      text: "In adult patients with AIS presenting within 4.5 hours of symptom onset or last known well and eligible for IVT, TENECTEPLASE at 0.25 mg/kg body weight (max 25 mg) OR ALTEPLASE at 0.9 mg/kg body weight (max 90 mg) is recommended to improve functional outcomes. Both agents are equivalent first-line choices.",
      keyDosing: {
        tenecteplase: "0.25 mg/kg IV bolus (max 25 mg)",
        alteplase: "0.9 mg/kg IV (max 90 mg) — 10% as bolus, 90% over 60 min",
      },
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "Tenecteplase at a dose of 0.4 mg/kg body weight is NOT recommended (higher dose not shown to be superior and may increase risk).",
    },
  ],

  extendedWindows: [
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS who (a) have unknown time of onset and are within 4.5 hours from symptom recognition AND (b) have an MRI-DWI lesion smaller than one-third of the MCA territory with no marked FLAIR signal change (DWI-FLAIR mismatch), IVT administered within 4.5 hours of symptom recognition can be beneficial.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS who have salvageable ischemic penumbra detected on automated perfusion imaging AND who (a) awoke with stroke symptoms within 9 hours from the midpoint of sleep OR (b) are 4.5–9 hours from last known well, IV thrombolysis may be reasonable.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients with AIS due to LVO with salvageable ischemic penumbra, presenting within 4.5–24 hours from symptom onset or last known well, who CANNOT receive EVT, IVT directed by individuals with expertise in thrombolytic stroke care may be beneficial.",
    },
  ],

  contraindicated: [
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "IV desmoteplase is not recommended for eligible patients with AIS presenting 3–9 hours from last known normal.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "IV streptokinase should not be administered — does not improve functional independence and is associated with increased early mortality.",
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "Sonothrombolysis as adjunctive therapy to IVT compared with IVT alone is not recommended — did not increase early neurological improvement or improve functional outcome at 90 days.",
    },
  ],

  specialCircumstances: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In eligible adult patients with AIS with known sickle cell disease, IVT can be beneficial to improve functional outcome without increased sICH or life-threatening systemic hemorrhage.",
    },
    {
      cor: "2b",
      loe: "C-LD",
      text: "In adults with acute nonarteritic central retinal artery occlusion (CRAO) causing disabling visual loss, and otherwise eligible for IVT, the usefulness of IVT within 4.5 hours is uncertain.",
    },
    {
      cor: "2b",
      loe: "C-LD",
      text: "In pediatric patients aged 28 days to 18 years with confirmed AIS presenting within 4.5 hours with disabling deficits, IVT with alteplase may be considered as it is safe, but efficacy is uncertain.",
    },
  ],

  concomitantWithEVT: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS eligible for BOTH IVT and EVT, IVT is safe and recommended to improve overall reperfusion efficacy and clinical outcomes. Do NOT skip IVT to facilitate EVT.",
    },
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS eligible for both IVT and EVT, IVT should be administered as rapidly as possible WITHOUT observation to assess clinical response or delay in initiating EVT.",
    },
  ],

  sICHManagement: {
    note: "For symptomatic intracranial bleeding within 24 hours after IVT:",
    steps: [
      "Stop alteplase infusion or tenecteplase (if still being pushed)",
      "Emergent CBC, PT (INR), aPTT, fibrinogen level, and type and cross-match",
      "Emergent noncontrast head CT if clinical concern exists",
      "Cryoprecipitate 10 U infused over 10–30 min (target fibrinogen ≥150 mg/dL)",
      "Tranexamic acid 1000 mg IV over 10 min OR aminocaproic acid 4–5 g over 1 h, then 1 g IV until bleeding controlled",
      "Hematology and neurosurgery consultations as necessary",
    ],
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.7: ENDOVASCULAR THROMBECTOMY (EVT)
// ─────────────────────────────────────────────────────────────────────────────

export const evtRecommendations = {
  adults: [
    // 0–6 hours, ASPECTS 3–10
    {
      cor: "1",
      loe: "A",
      timeWindow: "0–6 hours",
      aspects: "3–10",
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours from onset of symptoms, with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS 3–10, EVT is recommended to improve functional clinical outcomes and reduce mortality.",
      criteria: {
        occlusion: "ICA or M1 (anterior circulation)",
        timeWindow: "0–6 hours from onset",
        nihss: "≥6",
        prestrokeMRS: "0–1",
        aspects: "3–10",
      },
    },
    // 6–24 hours, ASPECTS ≥6
    {
      cor: "1",
      loe: "A",
      timeWindow: "6–24 hours",
      aspects: "≥6",
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting between 6 and 24 hours from onset, with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS ≥6, EVT is recommended.",
      criteria: {
        occlusion: "ICA or M1 (anterior circulation)",
        timeWindow: "6–24 hours",
        nihss: "≥6",
        prestrokeMRS: "0–1",
        aspects: "≥6",
      },
    },
    // 6–24 hours, ASPECTS 3–5 (large core)
    {
      cor: "1",
      loe: "A",
      timeWindow: "6–24 hours",
      aspects: "3–5",
      text: "In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting between 6 and 24 hours from onset, with age <80 years, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 3–5, and without significant mass effect, EVT is recommended.",
      criteria: {
        occlusion: "ICA or M1 (anterior circulation)",
        timeWindow: "6–24 hours",
        age: "<80 years",
        nihss: "≥6",
        prestrokeMRS: "0–1",
        aspects: "3–5",
        massEffect: "None significant",
      },
      note: "Limited generalizability in: individuals >80 years, renal failure, refractory hypertension (SBP ≥185 or DBP ≥110), comorbid psychiatric/medical illness confounding neurological assessment, life expectancy <3 months.",
    },
    // 0–6 hours, ASPECTS 0–2 (very large core)
    {
      cor: "2a",
      loe: "B-R",
      timeWindow: "0–6 hours",
      aspects: "0–2",
      text: "In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours, with age <80 years, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 0–2, and without significant mass effect, EVT is reasonable.",
      note: "Limited generalizability in individuals >80 years, significant head/neck vessel tortuosity, life expectancy <6 months.",
    },
    // Mild prestroke disability (mRS 2)
    {
      cor: "2a",
      loe: "B-NR",
      timeWindow: "0–6 hours",
      prestrokeMRS: "2",
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours, with NIHSS ≥6 and ASPECTS ≥6, who have a prestroke mRS score of 2, EVT is reasonable to improve functional clinical outcomes and reduce accumulated disability.",
    },
    // Moderate prestroke disability (mRS 3–4)
    {
      cor: "2b",
      loe: "B-NR",
      timeWindow: "0–6 hours",
      prestrokeMRS: "3–4",
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours, with NIHSS ≥6 and ASPECTS ≥6, who have a prestroke mRS score of 3–4, EVT MIGHT be reasonable to improve functional clinical outcomes and reduce accumulated disability.",
    },
    // Dominant M2 occlusion
    {
      cor: "2a",
      loe: "B-NR",
      timeWindow: "0–6 hours",
      occlusion: "Dominant proximal M2",
      text: "In patients with AIS from occlusion of the dominant proximal M2 division of the MCA, presenting within 6 hours, with prestroke mRS 0–1, NIHSS ≥6, and ASPECTS ≥6, EVT is reasonable to improve functional outcomes, but benefits are uncertain.",
    },
    // Non-dominant M2, distal vessels — NOT recommended
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "In patients with AIS from occlusion of the proximal nondominant or codominant M2 segment of the MCA, or distal MCA, anterior cerebral artery (ACA), or posterior cerebral artery (PCA), EVT is NOT recommended to improve functional outcomes.",
    },
  ],

  posteriorCirculation: [
    {
      cor: "1",
      loe: "B-R",
      text: "In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0–1, NIHSS ≥10 at presentation, and within 6 hours from symptom onset, EVT is recommended to improve functional outcomes and reduce mortality.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS and basilar artery occlusion, a baseline mRS score of 0–1, NIHSS ≥10, and presenting 6–24 hours from symptom onset, EVT is reasonable with potential salvageable brain tissue.",
    },
  ],

  pediatric: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In pediatric patients ≥6 years with acute neurological symptoms and ischemic stroke due to LVO within 6 hours from symptom onset, EVT can be effective if performed by experienced neurointerventionalists.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In pediatric patients ≥6 years with AIS due to LVO, 6–24 hours from symptom onset, and with potentially salvageable brain tissue, EVT can be effective to improve functional outcomes.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In pediatric patients aged 28 days to 6 years with AIS due to LVO, within 24 hours from symptom onset, and with potentially salvageable brain tissue, EVT performed by neurointerventionalists with pediatric experience may be reasonable.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.8: ANTIPLATELET TREATMENT
// ─────────────────────────────────────────────────────────────────────────────

export const antiplateletRecommendations = {
  general: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS, administration of aspirin is recommended within 48 hours after stroke onset to reduce risk of death and dependency.",
    },
    {
      cor: "1",
      loe: "A",
      text: "In patients with noncardioembolic AIS or TIA, antiplatelet therapy is indicated in preference to oral anticoagulation to reduce the risk of recurrent ischemic stroke and other cardiovascular events, while minimizing bleeding risk.",
    },
    {
      cor: "3: Harm",
      loe: "B-R",
      text: "In patients with noncardioembolic ischemic stroke, treatment with TRIPLE antiplatelet therapy (aspirin + clopidogrel + dipyridamole) for secondary stroke prevention should NOT be administered due to increased risk of bleeding.",
    },
    {
      cor: "3: Harm",
      loe: "B-NR",
      text: "In patients with ischemic stroke and AF without active CAD or recent intravascular stent, the routine addition of antiplatelet therapy to oral anticoagulation is potentially harmful due to increased bleeding risk and is not recommended.",
    },
  ],

  daptForMinorAIS: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with minor (NIHSS ≤3) noncardioembolic AIS or high-risk TIA (ABCD2 score ≥4) who did NOT receive IVT, DAPT (aspirin + clopidogrel with loading dose of clopidogrel) should be initiated early (within 24 hours after symptom onset) and continued for 21 days, followed by single antiplatelet therapy (SAPT) to reduce 90-day risk of recurrent ischemic stroke.",
      details: "Clopidogrel loading dose: 300–600 mg then 75 mg/day; Aspirin 75–100 mg/day; Duration: 21 days DAPT, then SAPT.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with minor (NIHSS ≤5) noncardioembolic AIS or high-risk TIA (ABCD2 ≥4) within 24–72 hours from stroke onset, or NIHSS 4–5 within 24 hours, who did NOT receive IVT, with presumed atherosclerotic cause (≥50% stenosis of intracranial or extracranial artery likely accounting for the presentation), DAPT (clopidogrel + aspirin) for 21 days followed by SAPT is reasonable.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients with minor (NIHSS ≤3) noncardioembolic AIS or high-risk TIA (ABCD2 ≥4) within 24 hours who did NOT receive IVT and carry the CYP2C19 loss-of-function allele, DAPT with ticagrelor + aspirin for 21 days (followed by ticagrelor monotherapy) may be reasonable in preference over DAPT with clopidogrel + aspirin.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In patients with minor (NIHSS ≤3) noncardioembolic AIS or high-risk TIA (ABCD2 ≥4), ticagrelor is NOT recommended over aspirin to reduce the composite endpoint of stroke, MI, or death.",
    },
  ],

  inSettingOfIVT: [
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS who have received IVT, the risk of antiplatelet therapy in the first 24 hours after IVT is uncertain. Use might be considered in the presence of concomitant conditions for which such treatment given in the absence of IVT is known to provide substantial benefit.",
    },
    {
      cor: "3: Harm",
      loe: "B-R",
      text: "In patients with AIS eligible for IVT, IV aspirin should NOT be administered concurrently or within 90 minutes after the start of IVT given the risk of hemorrhage.",
    },
    {
      cor: "3: Harm",
      loe: "B-R",
      text: "In patients with AIS who are otherwise eligible for IVT or mechanical thrombectomy, aspirin is NOT recommended as a substitute for acute stroke treatment.",
    },
  ],

  daptTrialsSummary: {
    note: "Key DAPT trials for minor AIS/high-risk TIA:",
    trials: [
      {
        name: "CHANCE",
        inclusion: "AIS (NIHSS ≤3) or TIA (ABCD2 ≥4)",
        regimen: "Clopidogrel 300 mg load then 75 mg/d + Aspirin 75 mg × 21 days, then clopidogrel",
        lkn: "24 hours",
        nnt: 28,
      },
      {
        name: "POINT",
        inclusion: "AIS (NIHSS ≤3) or TIA (ABCD2 ≥4)",
        regimen: "Clopidogrel 600 mg load then 75 mg/d + Aspirin 50–325 mg/d × 90 days",
        lkn: "12 hours",
        nnt: 67,
      },
      {
        name: "THALES",
        inclusion: "AIS (NIHSS ≤5) or TIA (ABCD2 ≥6)",
        regimen: "Ticagrelor 180 mg load then 90 mg BID + Aspirin 300–325 mg load then 75–100 mg/d × 30 days",
        lkn: "24 hours",
        nnt: 91,
      },
      {
        name: "CHANCE-2",
        inclusion: "AIS (NIHSS ≤3) or TIA (ABCD2 ≥4) with CYP2C19 loss-of-function allele",
        regimen: "Ticagrelor 180 mg load then 90 mg BID + Aspirin × 21 days, then ticagrelor",
        lkn: "24 hours",
        nnt: 63,
      },
      {
        name: "INSPIRES",
        inclusion: "AIS (NIHSS ≤5) or TIA (ABCD2 ≥4) with presumed atherosclerotic cause",
        regimen: "Clopidogrel 300 mg load then 75 mg/d + Aspirin 100–300 mg load then 100 mg/d × 21 days, then clopidogrel",
        lkn: "72 hours",
        nnt: 53,
      },
    ],
  },
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.9: ANTICOAGULATION
// ─────────────────────────────────────────────────────────────────────────────

export const anticoagulationRecommendations = [
  {
    cor: "2a",
    loe: "B-R",
    text: "In patients with AIS and AF who are selected for anticoagulation poststroke, a strategy of early initiation of a DOAC rather than delayed initiation is safe and reasonable compared with a strategy of delayed anticoagulation, although the efficacy of early anticoagulation for prevention of early recurrent stroke is not established.",
  },
  {
    cor: "2b",
    loe: "B-NR",
    text: "In patients with an AIS and ipsilateral, high-grade ICA stenosis, the benefit of urgent anticoagulation is not well established.",
  },
  {
    cor: "3: No Benefit",
    loe: "A",
    text: "In patients with AIS, early anticoagulation (within 48 hours of stroke onset) does NOT reduce the likelihood of early neurological worsening or increase the likelihood of favorable functional outcome and is NOT recommended.",
  },
  {
    cor: "3: No Benefit",
    loe: "A",
    text: "In patients with AIS, the use of argatroban is not effective as an adjunctive therapy with IVT to improve long-term functional outcomes.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.10–4.11: ADJUNCTIVE TREATMENTS — NOT RECOMMENDED
// ─────────────────────────────────────────────────────────────────────────────

export const adjunctiveTreatmentsNotRecommended = [
  {
    treatment: "Hemodynamic augmentation (hemodilution, high-dose albumin, vasodilators)",
    cor: "3: No Benefit",
    loe: "A",
    text: "Hemodynamic augmentation using hemodilution, high-dose albumin, or chemical vasodilators such as pentoxifylline is NOT recommended to improve functional clinical outcomes.",
  },
  {
    treatment: "Neuroprotective agents",
    cor: "3: No Benefit",
    loe: "A",
    text: "At present, pharmacological or nonpharmacological neuroprotective treatments are NOT recommended to improve functional outcome.",
  },
  {
    treatment: "Emergency carotid endarterectomy (without intracranial clot)",
    cor: "3: No Benefit",
    loe: "B-NR",
    text: "In patients with AIS or unstable neurological status caused by high-grade carotid stenosis or occlusion WITHOUT intracranial occlusion, emergent carotid endarterectomy (within 48 hours) is NOT beneficial to improve functional outcomes.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: IN-HOSPITAL MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const inHospitalManagementRecommendations = {
  strokeUnit: [
    {
      cor: "1",
      loe: "B-R",
      text: "In patients with AIS of all ages, treatment within an organized inpatient stroke care unit supported by a specialty-trained, interdisciplinary care team (acute stroke units, rehabilitation stroke units, comprehensive stroke units, or mixed rehabilitation units) that incorporates standardized stroke care order sets and protocols is recommended to reduce the odds of poor outcomes and death.",
    },
  ],

  dysphagia: [
    {
      cor: "1",
      loe: "C-EO",
      text: "In patients with AIS, performing a bedside swallow screening prior to initiation of liquid or food intake is recommended to screen for patients at increased risk for aspiration.",
    },
    {
      cor: "2a",
      loe: "C-LD",
      text: "In patients with AIS, it is reasonable for dysphagia screening to be performed by speech pathologists or other trained health care professionals.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with stroke with dysphagia, treatment with pharyngeal electrical stimulation (PES) can be beneficial to reduce dysphagia severity and decrease the risk of aspiration.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with severe stroke with dysphagia requiring tracheotomy and mechanical ventilation, treatment with PES after ventilator weaning can be beneficial to decrease dysphagia severity, reduce aspiration risk, and expedite decannulation.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS, an oral hygiene protocol may be reasonable to reduce the risk of pneumonia.",
    },
  ],

  vtePrevention: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS with restricted mobility, use of intermittent pneumatic compression devices (IPC) is recommended to reduce the risk of DVT.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "In patients with AIS, graded compression stockings (GCS) are potentially harmful and are NOT recommended for prevention of DVT.",
    },
  ],

  depression: [
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS, screening for poststroke depression (PSD) with a validated screening tool is reasonable at regular intervals.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS and confirmed poststroke depression, treatment with SSRIs is reasonable to improve depressive symptoms.",
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "Prophylactic use of SSRIs (fluoxetine) in non-depressed patients with AIS to improve motor recovery is NOT recommended.",
    },
  ],

  oxygenation: [
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Supplemental oxygen in nonhypoxic patients with AIS is not recommended (targets normal oxygen saturation SpO2 ≥94%).",
    },
  ],

  earlyMobilization: [
    {
      cor: "3: Harm",
      loe: "A",
      text: "Very early (within 24 hours of stroke onset) high-intensity out-of-bed activities (sitting, standing, walking) is potentially harmful and is not recommended.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: ACUTE COMPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const acuteComplicationsRecommendations = {
  brainSwelling: [
    {
      cor: "1",
      loe: "B-R",
      text: "In patients with AIS and malignant cerebral edema who are candidates for surgical intervention, early decompressive hemicraniectomy is recommended to reduce mortality and improve functional outcomes in patients ≤60 years of age.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS and malignant cerebral edema, decompressive hemicraniectomy may be considered in patients >60 years of age, with individualized decision-making regarding functional outcomes.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients with AIS and mild to moderate cerebral edema, osmotic therapy (mannitol or hypertonic saline) is reasonable as a temporizing measure to control elevated ICP.",
    },
  ],

  cerebellarInfarction: [
    {
      cor: "1",
      loe: "B-NR",
      text: "In patients with AIS due to large cerebellar infarction with significant mass effect, posterior fossa decompressive surgery is recommended to reduce mortality.",
    },
  ],

  seizures: [
    {
      cor: "3: No Benefit",
      loe: "B-NR",
      text: "Prophylactic use of antiepileptic drugs in patients with AIS who have not had seizures is NOT recommended.",
    },
    {
      cor: "1",
      loe: "C-EO",
      text: "In patients with AIS who have a clinical seizure, treatment with antiepileptic drugs is recommended.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// KEY ABBREVIATIONS (Guideline-Defined)
// ─────────────────────────────────────────────────────────────────────────────

export const guidelineAbbreviations = {
  AIS: "acute ischemic stroke",
  ASPECTS: "Alberta Stroke Program Early CT Score",
  DAPT: "dual antiplatelet therapy",
  DOAC: "direct oral anticoagulant",
  DTN: "door-to-needle",
  EVT: "endovascular thrombectomy",
  FLAIR: "fluid-attenuated inversion recovery",
  ICA: "internal carotid artery",
  ICH: "intracerebral hemorrhage",
  IVT: "intravenous thrombolytics",
  LVO: "large vessel occlusion",
  MCA: "middle cerebral artery",
  mRS: "modified Rankin Scale",
  MSU: "mobile stroke unit",
  NIHSS: "National Institutes of Health Stroke Scale",
  PES: "pharyngeal electrical stimulation",
  SAPT: "single antiplatelet therapy",
  SBP: "systolic blood pressure",
  sICH: "symptomatic intracranial hemorrhage",
  SSOC: "stroke systems of care",
  TIA: "transient ischemic attack",
  TICI: "thrombolysis in cerebral infarction",
  TSC: "thrombectomy-capable stroke center",
  CSC: "comprehensive stroke center",
  PSC: "primary stroke center",
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TOP TAKE-HOME MESSAGES (2026 Guideline)
// ─────────────────────────────────────────────────────────────────────────────

export const topTakeHomeMessages = [
  "Mobile stroke units (MSU) enable rapid identification and treatment of thrombolytic-eligible patients with AIS. When available, MSUs are recommended based on their safety and benefit over conventional EMS.",

  "Direct transport to the closest EVT-capable hospital (TSC or CSC) is endorsed in the absence of well-functioning systems with rapid interhospital transfer processes.",

  "Both TENECTEPLASE (0.25 mg/kg, max 25 mg) and ALTEPLASE (0.9 mg/kg, max 90 mg) are first-line options for IVT within the 4.5-hour window. Treat disabling deficits rapidly regardless of NIHSS score without requiring advanced imaging.",

  "For patients with non-disabling deficits (e.g., isolated sensory syndrome) in the 4.5-hour window, IVT is NOT recommended. Dual antiplatelet therapy (DAPT) is preferred.",

  "EVT is now recommended for anterior circulation LVO with ASPECTS 3–5 (large core infarcts) within 24 hours — expanding eligibility compared to prior guidelines.",

  "EVT for basilar artery occlusion is recommended for eligible patients within 6 hours (NIHSS ≥10), and reasonable from 6–24 hours with potentially salvageable tissue.",

  "After successful EVT recanalization (mTICI 2b/2c/3), intensive SBP reduction to <140 mm Hg is HARMFUL. Target ≤180/105 mm Hg.",

  "Intensive glucose control (80–130 mg/dL) is NOT recommended. Target 140–180 mg/dL for hyperglycemia. Treat hypoglycemia (<60 mg/dL) immediately.",

  "Early DOAC initiation for AF-related stroke is safe (noninferior to delayed initiation) but efficacy for reducing recurrent stroke is not established.",

  "Pharyngeal electrical stimulation (PES) is a new recommendation — beneficial for reducing dysphagia severity and aspiration risk in patients with poststroke dysphagia.",
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// GUIDELINE METADATA
// ─────────────────────────────────────────────────────────────────────────────

export const guidelineMetadata = {
  title: "2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke",
  organization: "American Heart Association / American Stroke Association (AHA/ASA)",
  chair: "Shyam Prabhakaran, MD, MS, FAHA",
  doi: "10.1161/STR.0000000000000513",
  journal: "Stroke. 2026;57:e00–e00",
  replaces: "2018 AIS Guidelines and 2019 Update",
  literatureSearchPeriod: "September–December 2024 (additional high-impact studies through March 2025)",
  endorsedBy: [
    "American Association of Neurological Surgeons/Congress of Neurological Surgeons",
    "Neurocritical Care Society",
    "Society for Academic Emergency Medicine",
    "Society of NeuroInterventional Surgery",
    "Society of Vascular and Interventional Neurology",
  ],
  affirmedBy: "American Academy of Neurology (as educational tool for neurologists)",
  keyUpdates: [
    "Tenecteplase endorsed as equivalent to alteplase for IVT within 4.5-hour window",
    "Extended window thrombolysis recommendations for unknown onset and 4.5–9 hour window",
    "Expanded EVT eligibility to large-core infarcts (ASPECTS 3–5, 0–6 hours and 6–24 hours)",
    "EVT recommendations for pediatric patients (≥6 years, and 28 days to 6 years)",
    "Mobile stroke unit recommendations added",
    "Intensive BP lowering after successful EVT shown HARMFUL (COR 3: Harm)",
    "Pharyngeal electrical stimulation (PES) recommended for poststroke dysphagia",
    "Management of hyperglycemia: intensive glucose control (80–130 mg/dL) NOT recommended",
    "Early DOAC initiation for AF-related stroke endorsed as safe",
    "Comprehensive modification of IVT contraindications table",
  ],
} as const;
