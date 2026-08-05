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
      text: "Implementation of educational programs on stroke recognition in patients of all ages and the need to seek emergency care (calling 9-1-1) should be used.",
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
      text: "For prehospital stroke triage, use of a brief stroke assessment tool by prehospital personnel should be used because it improves early stroke identification, including large vessel occlusion (LVO) stroke.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "Prehospital personnel should provide advance notification to the receiving hospital of an inbound suspected stroke to reduce in-hospital evaluation times, increase thrombolytic use, and decrease mortality.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Ambulance-initiated remote ischemic conditioning (RIC) with arm blood pressure cuff inflation has not improved outcomes and should not be used routinely.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "Prehospital initiation of stroke treatment with transdermal glyceryl trinitrate (GTN/nitroglycerin) has not improved outcomes and may cause harm.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "Intensive BP control in the field to a target of 130–140 mm Hg systolic has not improved outcomes.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "For pediatric prehospital stroke triage, the usefulness of common adult stroke screening tools is uncertain because they perform poorly for identification of stroke.",
    },
  ],

  emsDestination: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In areas without well-coordinated SSOC and rapid interhospital transfer, in patients with suspected stroke with LVO features, direct transport to the closest EVT-capable center (TSC or CSC) can reasonably be considered when travel time to the EVT center does not exceed travel time to a closer non-EVT center by more than 30–60 minutes.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In areas with well-coordinated SSOC and local hospitals with rapid DIDO times for thrombectomy transfers, bypassing the closest thrombolytic-capable hospital to go directly to an EVT center should not be used routinely.",
    },
  ],

  // §2.5 Mobile Stroke Units. Corrected and completed against the published PDF
  // on 2026-08-05. Two of the four recommendations were absent, and BOTH of the
  // two that were present carried the wrong level of evidence: recommendation 1
  // read B-R where the guideline says A, and recommendation 4 read B-R where the
  // guideline says B-NR. Recommendation 4 was also written in 2b language ("may
  // help triage") for a 2a recommendation, and dropped the prehospital
  // notification clause.
  mobileStrokeUnits: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with suspected AIS, the use of MSUs over conventional EMS where available is recommended for the transport and management of thrombolytic-eligible patients to ensure the fastest achievable onset-to-treatment time and improve functional outcomes.",
    },
    {
      cor: "1",
      loe: "A",
      text: "In patients with suspected acute stroke, MSUs must be equipped to diagnose and treat patients with IVT.",
    },
    {
      cor: "1",
      loe: "B-R",
      text: "In patients with suspected acute stroke, MSU care, including streamlined protocols and use of neurological expertise, either in-person or remote telemedicine consultation, is beneficial for emergent evaluation and treatment of patient symptoms without safety concerns.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "In endovascular thrombectomy-eligible patients, use of MSUs can be beneficial to identify and triage patients to the appropriate thrombectomy-capable facility with prehospital notification of receiving stroke teams.",
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
      text: "Neuroimaging of the brain should be used before initiating any specific therapy to treat AIS to exclude brain hemorrhage and non-vascular etiologies of neurological dysfunction.",
    },
    {
      cor: "1",
      loe: "A",
      text: "Noncontrast CT of the brain should be used as the initial diagnostic imaging study for most patients with suspected AIS.",
    },
    {
      cor: "1",
      loe: "A",
      text: "MRI (DWI) should be used as an alternative to CT in institutions with appropriate expertise and where it can be performed without delaying treatment.",
    },
  ],
  vascular: [
    {
      cor: "1",
      loe: "A",
      text: "Noninvasive intracranial vascular imaging (CTA or MRA) should be used for identifying candidates for mechanical thrombectomy in patients with suspected acute LVO stroke.",
    },
  ],
  pediatric: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "For pediatric patients with suspected AIS, emergent brain and vascular imaging with MRI/MRA of the cervical and intracranial vessels can reasonably be considered to identify patients with LVO and differentiate arterial ischemic stroke from hemorrhagic stroke or stroke mimics.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "For pediatric patients with suspected AIS, emergent brain and vascular imaging with CT/CTA can reasonably be considered if MRI/MRA is not available immediately (within 25 minutes).",
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
      text: "For AIS, hypotension and hypovolemia should be corrected to maintain systemic perfusion levels necessary to support organ function.",
    },
    {
      cor: "1",
      loe: "C-EO",
      text: "For AIS, early treatment of hypertension is indicated when required by comorbid conditions (e.g., concomitant acute coronary event, acute heart failure, aortic dissection, post-thrombolysis sICH, or preeclampsia/eclampsia).",
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
      text: "In patients for whom EVT is planned and who have not received IVT therapy, it can reasonably be considered to maintain BP ≤185/110 mm Hg before the procedure.",
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
      text: "In patients with mild to moderate severity AIS who have been treated with IVT, intensive SBP reduction (target of <140 mm Hg compared with <180 mm Hg) should not be used routinely because it is not associated with an improvement in functional outcome.",
    },
  ],
  afterEVT: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "After EVT, it can reasonably be considered to maintain BP at a level ≤180/105 mm Hg during and for 24 hours after the procedure.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "In patients with AIS with LVO of the anterior circulation who have been successfully recanalized by EVT (mTICI 2b, 2c, or 3) and without other indication for BP management target, intensive SBP reduction target of <140 mm Hg for the first 72 hours is harmful and should be avoided.",
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
    text: "If the patient have hyperthermia, targeting normothermia, including using nurse-initiated protocols for managing fever, should be used for improving functional outcomes and reducing death.",
  },
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with AIS and hyperthermia, sources of hyperthermia such as infection should be identified and treated.",
  },
  {
    cor: "3: No Benefit",
    loe: "B-R",
    text: "In patients with AIS and normothermia, treatment with induced hypothermia or prophylactic fever prevention should not be used routinely for the purpose of improving outcomes.",
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
    text: "In patients with AIS, it is reasonable to treat persistent hyperglycemia to achieve blood glucose levels in a range of 140 to 180 mg/dL with close monitoring to prevent worse functional outcomes.",
  },
  {
    cor: "3: No Benefit",
    loe: "A",
    text: "In hospitalized patients with AIS with hyperglycemia, treatment with IV insulin to achieve blood glucose levels in the range of 80 to 130 mg/dL is not recommended to improve 3-month functional outcomes.",
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
      text: "If the patient is otherwise eligible for IVT with early ischemic change of mild to moderate extent (other than frank hypodensity attributable to the clinical presentation) on initial brain imaging, IVT should be used.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In eligible adult patients with AIS presenting with mild non-disabling stroke deficits (e.g., isolated sensory syndrome in many cases) within 4.5 hours, IVT should not be used routinely as it has not shown superiority in improving functional outcomes compared to dual antiplatelet treatment.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "In patients with AIS taking single or dual antiplatelet therapy (DAPT) and otherwise eligible for IVT, IVT should be used because it improves functional outcomes despite a small absolute increased risk of sICH (~0.9%–1.2%), outweighed by anticipated treatment benefit (~8%).",
    },
    {
      // CORRECTED 2026-08-04 against §4.6.1 (e38). Two separate recommendations had
      // been merged into one entry, and the merge demoted a Class 1 directive to
      // Class 2a. The "do not delay IVT to obtain MRI" clause is rec 11, COR 1 /
      // B-NR, and now stands as its own entry below at its real strength.
      cor: "2a",
      loe: "B-NR",
      text: "In patients with AIS with 1–10 cerebral microbleeds (CMBs) on pretreatment MRI, treatment with IVT can reasonably be considered.",
    },
    {
      // §4.6.1 rec 11, previously folded into the entry above at COR 2a.
      cor: "1",
      loe: "B-NR",
      text: "In patients with AIS who are eligible for IVT within 4.5 hours of symptom onset with unknown burden of cerebral microbleeds (CMB), it is recommended that IVT be administered without first obtaining MRI to exclude CMBs.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS with high burden of CMBs (>10) on pretreatment MRI, IVT may be associated with increased risk of sICH; weigh risks carefully.",
    },
  ],

  agentChoice: [
    {
      cor: "1",
      loe: "A",
      text: "In adult patients with AIS presenting within 4.5 hours of symptom onset or last known well and eligible for IVT, TENECTEPLASE at 0.25 mg/kg body weight (max 25 mg) OR ALTEPLASE at 0.9 mg/kg body weight (max 90 mg) should be used because it improves functional outcomes. Both agents are equivalent first-line choices.",
      keyDosing: {
        tenecteplase: "0.25 mg/kg IV bolus (max 25 mg)",
        alteplase: "0.9 mg/kg IV (max 90 mg): 10% as bolus, 90% over 60 min",
      },
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "Tenecteplase at a dose of 0.4 mg/kg body weight should not be used routinely (higher dose not shown to be superior and may increase risk).",
    },
  ],

  extendedWindows: [
    {
      cor: "2a",
      loe: "B-R",
      text: "If the patient (a) have unknown time of onset and are within 4.5 hours from symptom recognition AND (b) have an MRI-DWI lesion smaller than one-third of the MCA territory with no marked FLAIR signal change (DWI-FLAIR mismatch), IVT administered within 4.5 hours of symptom recognition may help.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "If the patient have salvageable ischemic penumbra detected on automated perfusion imaging AND who (a) awoke with stroke symptoms within 9 hours from the midpoint of sleep OR (b) are 4.5–9 hours from last known well, IV thrombolysis may be considered.",
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
      text: "IV desmoteplase should not be used routinely for eligible patients with AIS presenting 3–9 hours from last known normal.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "IV streptokinase should not be administered: does not improve functional independence and is associated with increased early mortality.",
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "Sonothrombolysis as adjunctive therapy to IVT compared with IVT alone should not be used routinely: did not increase early neurological improvement or improve functional outcome at 90 days.",
    },
  ],

  specialCircumstances: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In eligible adult patients with AIS with known sickle cell disease, IVT may help improve functional outcome without increased sICH or life-threatening systemic hemorrhage.",
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
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours from onset of symptoms, with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS 3–10, EVT should be used because it improves functional clinical outcomes and reduce mortality.",
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
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting between 6 and 24 hours from onset, with NIHSS ≥6, prestroke mRS 0–1, and ASPECTS ≥6, EVT should be used.",
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
      text: "In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting between 6 and 24 hours from onset of symptoms, with age <80 years, NIHSS score ≥6, prestroke mRS score 0 to 1, ASPECTS 3 to 5, and without significant mass effect on imaging, EVT is recommended to improve functional clinical outcomes and reduce mortality.",
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
      text: "In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1 presenting within 6 hours from onset of symptoms, with age <80 years, NIHSS score ≥6, prestroke mRS 0 to 1, ASPECTS 0 to 2, and without significant mass effect on imaging, EVT is reasonable to improve functional clinical outcomes and reduce mortality.",
      note: "Limited generalizability in individuals >80 years, significant head/neck vessel tortuosity, life expectancy <6 months.",
    },
    // Mild prestroke disability (mRS 2)
    {
      cor: "2a",
      loe: "B-NR",
      timeWindow: "0–6 hours",
      prestrokeMRS: "2",
      text: "In patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting within 6 hours, with NIHSS ≥6 and ASPECTS ≥6, who have a prestroke mRS score of 2, EVT can reasonably be considered to improve functional clinical outcomes and reduce accumulated disability.",
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
      text: "In patients with AIS from occlusion of the dominant proximal M2 division of the MCA, presenting within 6 hours, with prestroke mRS 0–1, NIHSS ≥6, and ASPECTS ≥6, EVT can reasonably be considered to improve functional outcomes, but benefits are uncertain.",
    },
    // Non-dominant M2, distal vessels — NOT recommended
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "In patients with AIS from occlusion of the proximal nondominant or codominant M2 segment of the MCA, or distal MCA, anterior cerebral artery (ACA), or posterior cerebral artery (PCA), EVT should not be used routinely to improve functional outcomes.",
    },
  ],

  // Corrected 2026-07-30. The previous pair split §4.7.3 by TIME WINDOW (COR 1/B-R within 6 h,
  // COR 2a/B-R for 6-24 h) and omitted PC-ASPECTS entirely. The guideline splits by NIHSS
  // SEVERITY across a single 24-hour window, and grades the NIHSS >=10 stratum Level A, not B-R.
  // Verbatim text below from docs/evidence-packets/2026-05-15-evt-pathway-aha-2026-PDF-VERIFIED.md
  // (read page-by-page off the guideline PDF, pages e53-e61); agrees with the registry citation
  // aha-asa-2026-4.7.3. The wrong pair was generating false positives against correct content,
  // because this file's own header designates it a validation reference.
  posteriorCirculation: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0 to 1, NIHSS score ≥10 at presentation, and PC-ASPECTS ≥6 (mild ischemic damage), EVT within 24 hours from onset of symptoms is recommended to achieve better functional outcome and reduce mortality.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0 to 1, NIHSS score 6 to 9 at presentation, and PC-ASPECTS ≥6 (mild ischemic damage), the effectiveness of EVT within 24 hours to improve functional outcomes and reduce mortality is not well established.",
    },
  ],

  // §4.7.4 Endovascular Techniques. Transcribed from the published guideline PDF
  // on 2026-08-05. This whole section was previously absent from the mirror, which
  // is why the RESCUE BT page carried no guideline verdict and the medium-vessel
  // trials carried none either. Recommendation numbering follows the published table.
  techniques: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS due to an LVO, EVT with stent retrievers, contact aspiration, or combination techniques is recommended to achieve rapid and adequate reperfusion.",
    },
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS undergoing EVT, reperfusion to an extended TICI grade 2b/2c/3 is recommended as early as possible within the therapeutic window to achieve maximum functional benefit at 90 days.",
    },
    {
      cor: "1",
      loe: "B-R",
      text: "In patients with AIS undergoing EVT, either general anesthesia or procedural sedation are recommended to facilitate EVT.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients with AIS undergoing EVT, the use of a proximal balloon to guide catheters to achieve improved outcomes remains uncertain.",
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "In patients with AIS from occlusion of medium or distal vessels of the anterior, middle (non-dominant or codominant M2, M3), or posterior cerebral arteries, EVT with stent retrievers is of no benefit for improving functional outcomes.",
      details: "Recommendation 5 of §4.7.4. This is the guideline verdict covering the medium and distal vessel occlusion trials (ESCAPE-MeVO, DISTAL). Note the scope: non-dominant or codominant M2 and M3, not M2 generally.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS undergoing EVT in the setting of tandem extracranial-intracranial anterior circulation occlusions, acute treatment of both, including emergent extracranial stenting, may be reasonable to achieve higher good functional outcome.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS in the setting of failed EVT, the use of rescue intracranial balloon angioplasty and/or stenting to improve functional outcome remains uncertain.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients with AIS who achieve complete or near-complete EVT (modified TICI 2b or greater), the administration of adjunctive intraarterial thrombolytics with urokinase, alteplase, or tenecteplase may be reasonable to improve cerebral reperfusion and 90-day functional outcome.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In the management of patients with AIS in the setting of LVO, preoperative administration of tirofiban before EVT is not useful to improve 90-day functional outcome.",
      details: "Recommendation 9 of §4.7.4. This is the guideline verdict on RESCUE BT. The supporting text notes the trial showed no functional benefit at 90 days and a higher incidence of symptomatic hemorrhage; the trial itself reported that hemorrhage difference as 3.3%, 95% CI −0.2% to +6.8%, which does not exclude zero.",
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
      text: "In pediatric patients aged 28 days to 6 years with AIS due to LVO, within 24 hours from symptom onset, and with potentially salvageable brain tissue, EVT performed by neurointerventionalists with pediatric experience may be considered.",
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
      text: "For AIS, administration of aspirin should be used within 48 hours after stroke onset to reduce risk of death and dependency.",
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
      text: "In patients with ischemic stroke and AF without active CAD or recent intravascular stent, the routine addition of antiplatelet therapy to oral anticoagulation is potentially harmful due to increased bleeding risk and should not be used routinely.",
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
      cor: "2b",
      loe: "B-R",
      text: "In patients with recent (<24 hours) minor (NIHSS score ≤5) noncardioembolic AIS or high-risk TIA (ABCD2 score ≥6 or symptomatic intracranial or extracranial ≥50% stenosis of an artery that could account for TIA) who did not receive IVT, DAPT with ticagrelor (including loading dose) plus aspirin for 30 days may be considered to reduce the risk of 30-day recurrent stroke.",
      details: "Recommendation 13 of §4.8. This is the recommendation that covers THALES (reference 26). It is distinct from the COR 3 below, which cites SOCRATES (reference 15) and concerns ticagrelor used INSTEAD OF aspirin.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with minor (NIHSS ≤5) noncardioembolic AIS or high-risk TIA (ABCD2 ≥4) within 24–72 hours from stroke onset, or NIHSS 4–5 within 24 hours, who did NOT receive IVT, with presumed atherosclerotic cause (≥50% stenosis of intracranial or extracranial artery likely accounting for the presentation), DAPT (clopidogrel + aspirin) for 21 days followed by SAPT can reasonably be considered.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients with minor (NIHSS ≤3) noncardioembolic AIS or high-risk TIA (ABCD2 ≥4) within 24 hours who did NOT receive IVT and carry the CYP2C19 loss-of-function allele, DAPT with ticagrelor + aspirin for 21 days (followed by ticagrelor monotherapy) may be considered in preference over DAPT with clopidogrel + aspirin.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In patients with minor (NIHSS score ≤3) noncardioembolic AIS or high-risk TIA (ABCD2 score ≥4), ticagrelor is not recommended over aspirin to reduce the composite endpoint of stroke, myocardial infarction, or death.",
      details: "Recommendation 9 of §4.8, cited to reference 15 (Johnston/Amarenco, ticagrelor versus aspirin, ie SOCRATES). This concerns ticagrelor monotherapy in place of aspirin. It does NOT cover ticagrelor plus aspirin DAPT, which is recommendation 13 at COR 2b above.",
    },
  ],

  inSettingOfIVT: [
    {
      cor: "2b",
      loe: "B-NR",
      text: "If the patient have received IVT, the risk of antiplatelet therapy in the first 24 hours after IVT is uncertain. Use might be considered in the presence of concomitant conditions for which such treatment given in the absence of IVT is known to provide substantial benefit.",
    },
    {
      cor: "3: Harm",
      loe: "B-R",
      text: "In patients with AIS eligible for IVT, IV aspirin should NOT be administered concurrently or within 90 minutes after the start of IVT given the risk of hemorrhage.",
    },
    {
      cor: "3: Harm",
      loe: "B-R",
      text: "If the patient is otherwise eligible for IVT or mechanical thrombectomy, aspirin should not be used routinely as a substitute for acute stroke treatment.",
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
    // CORRECTED 2026-08-04 against §4.9 (e68). Three defects: LOE was B-R and the
    // source says A (ELAN, OPTIMAS and TIMING are three RCTs); the patient-selection
    // qualifier "carefully selected (eg, milder severity)" had been dropped; and
    // "oral anticoagulation" had been narrowed to "a DOAC".
    cor: "2a",
    loe: "A",
    text: "In carefully selected (eg, milder severity) patients with AIS with atrial fibrillation, a strategy of early oral anticoagulation poststroke is low risk and is reasonable compared with a strategy of delayed anticoagulation, although the efficacy of early anticoagulation for prevention of early recurrent stroke is not established.",
  },
  {
    cor: "2b",
    loe: "B-NR",
    text: "In patients with an AIS and ipsilateral, high-grade ICA stenosis, the benefit of urgent anticoagulation is not well established.",
  },
  {
    cor: "3: No Benefit",
    loe: "A",
    text: "For AIS, early anticoagulation (within 48 hours of stroke onset) has not reduced early neurologic worsening or improved functional outcome and should not be used routinely.",
  },
  {
    cor: "3: No Benefit",
    loe: "A",
    text: "For AIS, the use of argatroban is not effective as an adjunctive therapy with IVT to improve long-term functional outcomes.",
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
    text: "Hemodynamic augmentation using hemodilution, high-dose albumin, or chemical vasodilators such as pentoxifylline should not be used routinely to improve functional clinical outcomes.",
  },
  {
    treatment: "Neuroprotective agents",
    cor: "3: No Benefit",
    loe: "A",
    text: "At present, pharmacological or nonpharmacological neuroprotective treatments are should not be used routinely to improve functional outcome.",
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
      text: "In patients with AIS of all ages, treatment within an organized inpatient stroke care unit supported by a specialty-trained, interdisciplinary care team (acute stroke units, rehabilitation stroke units, comprehensive stroke units, or mixed rehabilitation units) that incorporates standardized stroke care order sets and protocols should be used to reduce the odds of poor outcomes and death.",
    },
  ],

  dysphagia: [
    {
      cor: "1",
      loe: "C-EO",
      text: "For AIS, performing a bedside swallow screening prior to initiation of liquid or food intake should be used to screen for patients at increased risk for aspiration.",
    },
    {
      cor: "2a",
      loe: "C-LD",
      text: "For AIS, it can reasonably be considered for dysphagia screening to be performed by speech pathologists or other trained health care professionals.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with stroke with dysphagia, treatment with pharyngeal electrical stimulation (PES) may help reduce dysphagia severity and decrease the risk of aspiration.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with severe stroke with dysphagia requiring tracheotomy and mechanical ventilation, treatment with PES after ventilator weaning may help decrease dysphagia severity, reduce aspiration risk, and expedite decannulation.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "For AIS, an oral hygiene protocol may be considered to reduce the risk of pneumonia.",
    },
  ],

  vtePrevention: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS with restricted mobility, use of intermittent pneumatic compression devices (IPC) should be used to reduce the risk of DVT.",
    },
    {
      cor: "3: Harm",
      loe: "A",
      text: "For AIS, graded compression stockings (GCS) are potentially harmful and should not be used routinely for prevention of DVT.",
    },
  ],

  depression: [
    {
      cor: "2a",
      loe: "B-R",
      text: "For AIS, screening for poststroke depression (PSD) with a validated screening tool can reasonably be considered at regular intervals.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "In patients with AIS and confirmed poststroke depression, treatment with SSRIs can reasonably be considered to improve depressive symptoms.",
    },
    {
      cor: "3: No Benefit",
      loe: "A",
      text: "Prophylactic use of SSRIs (fluoxetine) in non-depressed patients with AIS to improve motor recovery should not be used routinely.",
    },
  ],

  oxygenation: [
    {
      // CORRECTED 2026-08-04 against §4.1 (e31-e32). The entry conflated THREE
      // separate recommendations. It took the COR/LOE of rec 5 but dropped its
      // "who are ineligible for EVT" scoping, generalising a narrow no-benefit
      // statement to all nonhypoxic AIS patients, which directly contradicts the
      // COR 2b recommendation that normobaric hyperoxia before EVT may be
      // reasonable. It then grafted on an SpO2 target belonging to rec 2, a
      // COR 1 recommendation, and rendered it as >=94% where the source says >94%.
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In patients with AIS without hypoxia who are ineligible for EVT, supplemental oxygen is not recommended to improve functional outcomes.",
    },
    {
      // §4.1 rec 2, previously conflated into the entry above.
      cor: "1",
      loe: "C-LD",
      text: "In patients with AIS with hypoxia, supplemental oxygen should be provided to maintain oxygen saturation (SpO₂) >94%.",
    },
  ],

  earlyMobilization: [
    {
      // CORRECTED 2026-08-04 against §5.7 (e80). COR was right; LOE was inflated from
      // B-R to A. Note this is the OPPOSITE direction from D2 and D4, which is why
      // the packet concluded the LOE values were reconstructed rather than transcribed.
      cor: "3: Harm",
      loe: "B-R",
      text: "In patients with AIS, high-dose, very early mobilization within 24 hours of stroke onset is not recommended to improve the odds of a favorable outcome at 3 months and may be harmful.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: ACUTE COMPLICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export const acuteComplicationsRecommendations = {
  // §6.1 Brain Swelling (General Recommendations). Transcribed from the published
  // guideline PDF on 2026-08-05. This subsection was previously absent.
  brainSwellingGeneral: [
    {
      cor: "1",
      loe: "C-EO",
      text: "In patients with large cerebral or cerebellar infarctions at high risk for developing brain swelling and herniation, an early discussion of care options and possible outcomes should take place with patients (if feasible) and family or next of kin to ascertain patient-centered preferences in shared decision-making, especially during prognosis formation and when considering interventions or limitations in care.",
    },
    {
      cor: "1",
      loe: "C-EO",
      text: "In patients with large cerebral or cerebellar infarctions, close monitoring of the patient for signs of neurological worsening during the first days after stroke is recommended to rapidly evaluate the need for potential interventions.",
    },
    {
      cor: "1",
      loe: "C-LD",
      text: "In patients with large cerebral or cerebellar infarctions who are at increased risk for malignant brain swelling, early transfer to an institution with appropriate neurosurgical and critical care expertise is recommended to ensure timely treatment.",
    },
  ],

  // §6.2 Brain Swelling (Medical Management). Corrected against the published PDF
  // on 2026-08-05. The osmotic-therapy entry previously read LOE B-NR and was
  // scoped to "mild to moderate cerebral edema ... as a temporizing measure to
  // control elevated ICP". The guideline says C-LD and scopes it to patients with
  // neurological DECLINE, as a bridge TO SURGERY. The glibenclamide COR 3 was absent.
  brainSwelling: [
    {
      cor: "2a",
      loe: "C-LD",
      text: "In patients with large cerebral or cerebellar infarctions and neurological decline from brain swelling, the use of osmotic therapy as a bridge to a surgical intervention is reasonable to improve functional outcome and reduce mortality.",
    },
    {
      cor: "3: No Benefit",
      loe: "B-R",
      text: "In patients with large hemispheric infarction 18 to 70 years of age, the use of IV glibenclamide does not improve functional outcome.",
      details: "Recommendation 2 of §6.2, citing the CHARM trial.",
    },
  ],

  // §6.3 Supratentorial Infarction (Surgical Management). Corrected and completed
  // against the published PDF on 2026-08-05. The mirror previously carried two
  // paraphrases of this section inside brainSwelling, both wrong: the ≤60
  // recommendation was graded LOE B-R (the guideline says A) with every scoping
  // condition dropped, and the >60 recommendation was graded COR 2a (the guideline
  // says 2b) and framed around functional outcomes when the guideline states
  // mortality reduction only. Recommendations 1 and 4 were absent entirely.
  supratentorialSurgical: [
    {
      cor: "2a",
      loe: "B-NR",
      text: "In patients with large territorial cerebral infarctions at high risk for developing brain swelling and herniation, decreased level of consciousness attributed to brain swelling is a reasonable trigger for decompressive hemicraniectomy selection.",
    },
    {
      cor: "1",
      loe: "A",
      text: "In patients ≤60 years of age with unilateral MCA infarctions who deteriorate neurologically within 48 hours from brain swelling despite medical therapy, decompressive craniectomy with dural expansion is beneficial to reduce mortality and improve functional outcome.",
      details: "Recommendation 2 of §6.3. Supported by DECIMAL, DESTINY and HAMLET.",
    },
    {
      cor: "2b",
      loe: "B-R",
      text: "In patients >60 years of age with unilateral MCA infarctions who deteriorate neurologically within 48 hours from brain swelling despite medical therapy, decompressive craniectomy with dural expansion may be considered to reduce mortality.",
      details: "Recommendation 3 of §6.3, supported by DESTINY II. Note the stated benefit is mortality reduction alone, not functional outcome. Most survivors in this age band are mRS 4 to 5.",
    },
    {
      cor: "2b",
      loe: "B-NR",
      text: "In patients with AIS who received IV tPA thrombolysis and develop malignant cerebral edema despite medical therapy, early decompressive craniectomy within 48 hours may still be considered without additional safety concerns.",
    },
  ],

  // §6.4 Cerebellar Infarction (Surgical Management). Corrected against the
  // published PDF on 2026-08-05. The ventriculostomy recommendation was absent,
  // and the craniectomy entry dropped the ≥35 mL volume threshold and the dural
  // expansion, and understated the benefit as mortality only.
  cerebellarInfarction: [
    {
      cor: "1",
      loe: "C-LD",
      text: "In patients with cerebellar infarction and obstructive hydrocephalus, ventriculostomy is recommended to improve neurological function and decrease mortality. Concomitant or subsequent decompressive craniectomy may or may not be necessary on the basis of factors such as the size of the infarction, neurological condition, degree of brainstem compression, and effectiveness of medical management.",
    },
    {
      cor: "1",
      loe: "B-NR",
      text: "In patients with cerebellar infarction causing neurological deterioration from brainstem compression or volumes ≥35 mL, decompressive suboccipital craniectomy with dural expansion should be performed to improve outcomes and decrease mortality.",
    },
  ],

  seizures: [
    {
      cor: "3: No Benefit",
      loe: "B-NR",
      text: "Prophylactic use of antiepileptic drugs in patients with AIS who have not had seizures should not be used routinely.",
    },
    {
      cor: "1",
      loe: "C-EO",
      text: "If the patient have a clinical seizure, treatment with antiepileptic drugs should be used.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.6: OROLINGUAL ANGIOEDEMA
// ─────────────────────────────────────────────────────────────────────────────

export const orolyngualAngioedemaRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients developing orolingual angioedema during or shortly after IV alteplase or tenecteplase administration, the infusion should be stopped immediately and the airway assessed and managed urgently with anesthesia/ENT backup.",
  },
  {
    cor: "2a",
    loe: "C-LD",
    text: "In patients with orolingual angioedema related to ACE inhibitor use following IVT, icatibant (bradykinin B2-receptor antagonist, 30 mg SC) or C1-esterase inhibitor concentrate can reasonably be considered to reverse angioedema rapidly.",
  },
  {
    cor: "2a",
    loe: "C-EO",
    text: "In patients with orolingual angioedema after IVT, IV diphenhydramine, IV methylprednisolone (125 mg), and epinephrine (0.1% solution, 0.3 mL IM or as nebulizer) should be administered; airway protection is the immediate priority.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 4.3: HEAD POSITIONING
// ─────────────────────────────────────────────────────────────────────────────

export const headPositioningRecommendations = [
  {
    cor: "3: No Benefit",
    loe: "B-R",
    text: "Routine flat (0°) head positioning compared with 30° head elevation for the first 24 hours in patients with AIS should not be used routinely, as it does not improve functional outcomes or reduce stroke progression.",
  },
  {
    // CORRECTED 2026-08-04 against the published PDF, §4.2 Head Positioning (e34).
    // The entry previously here was a COR 2b / C-EO head-of-bed-elevation
    // recommendation that DOES NOT EXIST in §4.2, and the genuine second
    // recommendation below was absent entirely. Same failure mode as the §4.7.3
    // basilar defect: invented text with an invented strength, in a file that
    // declares itself a validation reference. §4.2 contains exactly two
    // recommendations and both are COR 3: No Benefit / B-R.
    // NOTE, stated rather than assumed: §6.1-6.2 (Brain Swelling) was not read in
    // that pass, so a head-elevation statement may exist elsewhere. It does not
    // exist HERE, at that strength.
    cor: "3: No Benefit",
    loe: "B-R",
    text: "In patients with AIS with probable large artery atherosclerosis cause for whom no reperfusion intervention is available, there is no benefit of routine head-down positioning (−20 degrees) compared with 0- to 30-degree head positioning to improve functional outcome.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 6: HEMORRHAGIC TRANSFORMATION
// ─────────────────────────────────────────────────────────────────────────────

export const hemorrhagicTransformationRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with suspected symptomatic intracranial hemorrhage (sICH) after IVT: stop infusion immediately, obtain emergent CBC/PT/aPTT/fibrinogen and type & cross-match, and perform urgent noncontrast CT head.",
  },
  {
    cor: "1",
    loe: "C-EO",
    text: "In patients with sICH after IVT, administer cryoprecipitate 10 U IV over 10–30 min (target fibrinogen ≥150 mg/dL) plus tranexamic acid 1000 mg IV over 10 min OR aminocaproic acid 4–5 g IV over 1 hour; obtain hematology and neurosurgery consultation.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "In patients with asymptomatic hemorrhagic transformation (HI-1, HI-2, PH-1) on post-treatment imaging, continuation of antithrombotic therapy (if clinically indicated) is generally reasonable without mandatory interruption, with close clinical and imaging monitoring.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: CARDIAC MONITORING
// ─────────────────────────────────────────────────────────────────────────────

export const cardiacMonitoringRecommendations = [
  {
    cor: "1",
    loe: "B-NR",
    text: "For AIS, cardiac monitoring (ECG and continuous cardiac telemetry) should be used for at least the first 24 hours after stroke onset to detect atrial fibrillation and other potentially serious cardiac arrhythmias that may necessitate emergency cardiac interventions.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "In patients with AIS without AF identified on initial evaluation, prolonged cardiac rhythm monitoring (at least 30 days) with ambulatory cardiac monitoring can reasonably be considered to detect paroxysmal AF.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: INFECTION MANAGEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const infectionManagementRecommendations = {
  pneumonia: [
    {
      // CORRECTED 2026-08-04 against §5.6 (e79). LOE was B-R; the source says A.
      // The previous text also carried a grammatical corruption, "are should not",
      // which is itself a sign the entry was retyped rather than transcribed.
      cor: "3: No Benefit",
      loe: "A",
      text: "In patients with AIS, routine use of prophylactic antibiotics has not been shown to be beneficial in improving functional outcomes.",
    },
  ],
  urinary: [
    {
      // CORRECTED 2026-08-04 against §5.6 (e79). BOTH fields were wrong, and the COR
      // error softened a harm finding: the guideline says this causes HARM, the
      // mirror said it merely does not help. LOE C-LD was also overstated to B-R.
      cor: "3: Harm",
      loe: "C-LD",
      text: "In patients with AIS, routine placement of indwelling bladder catheters should not be performed because of the associated risk of catheter-associated urinary tract infections (UTIs).",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5: NUTRITION & EARLY MOBILIZATION SUPPORT
// ─────────────────────────────────────────────────────────────────────────────

export const nutritionRecommendations = [
  {
    cor: "1",
    loe: "C-EO",
    text: "If the patient cannot safely take food or fluids orally due to dysphagia or impaired consciousness, early nutritional support via nasogastric (NG) tube should be initiated within the first 24–48 hours.",
  },
  {
    cor: "2b",
    loe: "B-R",
    text: "If the patient require long-term enteral nutrition (>2–3 weeks) and cannot swallow safely, percutaneous endoscopic gastrostomy (PEG) tube may be considered over continued NG tube feeding for comfort and patient preference.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 3/5: TELEMEDICINE & TELESTROKE
// ─────────────────────────────────────────────────────────────────────────────

export const telemedicineRecommendations = [
  {
    cor: "1",
    loe: "B-R",
    text: "Telestroke consultation (using audio-video technology to enable real-time neurological assessment by a remote stroke specialist) should be used to increase access to IVT and EVT in hospitals without on-site stroke expertise.",
  },
  {
    cor: "1",
    loe: "B-NR",
    text: "Teleradiology systems enabling remote review of CT/MRI brain imaging by qualified physicians should be used to support time-sensitive stroke triage and treatment decisions at non-specialist centers.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "Prehospital telemedicine (connecting paramedics in the ambulance directly to a remote stroke specialist for real-time evaluation) can reasonably be considered to expedite stroke identification, triage, and destination decisions before hospital arrival.",
  },
] as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 5/7: SECONDARY PREVENTION (EARLY IN-HOSPITAL PHASE)
// ─────────────────────────────────────────────────────────────────────────────

export const secondaryPreventionEarlyRecommendations = {
  statins: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS attributable to atherosclerosis, high-intensity statin therapy (e.g. atorvastatin 40–80 mg or rosuvastatin 20–40 mg daily) should be used to reduce risk of recurrent stroke and major cardiovascular events.",
    },
    {
      cor: "2a",
      loe: "B-NR",
      text: "For AIS, initiating or continuing statin therapy during the acute hospitalization can reasonably be considered to establish the habit and improve long-term medication adherence.",
    },
  ],
  bloodPressureLowering: [
    {
      cor: "1",
      loe: "A",
      text: "After the hyperacute phase (>24–48 h post-AIS), antihypertensive therapy should be used to reduce risk of recurrent stroke, with a general target of SBP <130 mm Hg in most patients with established hypertension.",
    },
  ],
  afAnticoagulation: [
    {
      cor: "1",
      loe: "A",
      text: "In patients with AIS and AF (paroxysmal, persistent, or permanent), long-term anticoagulation with a DOAC should be used over warfarin (when no contraindication) to prevent recurrent cardioembolic stroke.",
    },
    {
      cor: "2a",
      loe: "B-R",
      text: "For most patients with AIS and AF, initiating anticoagulation at 4–14 days (guided by stroke severity: minor stroke early, severe stroke delayed) can reasonably be considered to balance recurrent stroke prevention against hemorrhagic risk.",
    },
  ],
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// SECTION 8: QUALITY IMPROVEMENT
// ─────────────────────────────────────────────────────────────────────────────

export const qualityImprovementRecommendations = [
  {
    cor: "1",
    loe: "B-NR",
    text: "Participation in organized stroke data registries (e.g., Get With The Guidelines–Stroke) with performance benchmarking should be used to identify care gaps, implement best practices, and improve patient outcomes across institutions.",
  },
  {
    cor: "1",
    loe: "B-NR",
    text: "Stroke programs should use validated risk-adjustment methods (incorporating NIHSS and other baseline variables) to enable fair comparison of outcomes across centers and over time.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "Continuous quality feedback loops (including regular multidisciplinary case review, door-to-needle time tracking, and protocol update cycles) can reasonably be considered to sustain improvements in stroke care delivery.",
  },
  {
    cor: "2a",
    loe: "B-NR",
    text: "Systematic tracking of performance metrics (DTN time, door-to-groin time, TICI reperfusion scores, 90-day mRS distribution) and reporting to care teams can reasonably be considered to drive accountability and guideline adherence.",
  },
] as const;

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
  "Mobile stroke units (MSU) enable rapid identification and treatment of thrombolytic-eligible patients with AIS. When available, MSUs should be used based on their safety and benefit over conventional EMS.",

  "Direct transport to the closest EVT-capable hospital (TSC or CSC) should be considered when well-functioning systems with rapid interhospital transfer are not available.",

  "Both TENECTEPLASE (0.25 mg/kg, max 25 mg) and ALTEPLASE (0.9 mg/kg, max 90 mg) are first-line options for IVT within the 4.5-hour window. Treat disabling deficits rapidly regardless of NIHSS score without requiring advanced imaging.",

  "For patients with non-disabling deficits (e.g., isolated sensory syndrome) in the 4.5-hour window, IVT should not be used routinely. Dual antiplatelet therapy (DAPT) is preferred.",

  "EVT is now recommended for anterior circulation LVO with ASPECTS 3–5 (large core infarcts) within 24 hours, expanding eligibility compared to prior guidelines.",

  "EVT for basilar artery occlusion should be used within 24 hours from symptom onset in patients with baseline mRS 0 to 1, NIHSS ≥10, and PC-ASPECTS ≥6; for NIHSS 6 to 9 with the same baseline mRS and PC-ASPECTS, the effectiveness of EVT within 24 hours is not well established.",

  "After successful EVT recanalization (mTICI 2b/2c/3), intensive SBP reduction to <140 mm Hg is harmful and should be avoided. Target ≤180/105 mm Hg.",

  "Intensive glucose control (80–130 mg/dL) should not be used routinely. Target 140–180 mg/dL for hyperglycemia. Treat hypoglycemia (<60 mg/dL) immediately.",

  "Early DOAC initiation for AF-related stroke is safe (noninferior to delayed initiation) but efficacy for reducing recurrent stroke is not established.",

  "Pharyngeal electrical stimulation (PES) is a new recommendation: beneficial for reducing dysphagia severity and aspiration risk in patients with poststroke dysphagia.",
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
