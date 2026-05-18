export interface ClinicalPearl {
  id: string;
  title: string;
  content: string; // Short preview (existing)
  type: 'pearl' | 'trial' | 'guideline';
  section?: string;
  link?: string;
  evidence?: string;

  // 2026 AHA/ASA alignment:
  evidenceClass?: 'I' | 'IIa' | 'IIb' | 'III';  // AHA recommendation class
  evidenceLevel?: 'A' | 'B' | 'C';                // AHA evidence level
  plainEnglish?: string;                          // Resident-friendly one-liner

  detailedContent?: {
    overview: string;
    clinicalTips?: string[];
    evidence?: string;
    reference?: string;
  };
  
  // For future trial integration:
  pmid?: string; // PubMed ID
  nctId?: string; // ClinicalTrials.gov NCT ID
  trialSlug?: string; // Link to Neuro Trials database
}

export interface ClinicalPearlsData {
  [sectionId: string]: {
    quick: ClinicalPearl[];
    deep: ClinicalPearl[];
  };
}

export const STROKE_CLINICAL_PEARLS: ClinicalPearlsData = {
  'step-1': { // Last Known Well
    quick: [
      {
        id: 'lkw-definition',
        title: 'LKW Definition',
        content: 'If patient woke with symptoms, LKW is time last seen normal before sleep. Work backwards: when did they go to bed? Be precise - "yesterday" is not sufficient. Always verify with family, witnesses, or medical records. If exact time is unknown, use the most conservative estimate (earliest possible time).',
        type: 'pearl',
        section: 'step-1',
      },
      {
        id: 'time-is-brain',
        title: 'Time Is Brain',
        content: '1.9 million neurons die per minute during untreated stroke (Saver, Stroke 2006). Every 15-minute delay reduces probability of good outcome by ~4% (Saver, JAMA 2013). Target door-to-needle <60 minutes (ideal <30 minutes).',
        type: 'pearl',
        section: 'step-1',
        evidence: 'Saver JL. Time is brain — quantified. Stroke. 2006;37(1):263–266',
      },
      {
        id: 'treatment-windows-quick',
        title: 'Treatment Windows',
        content: 'IV thrombolysis: 0–4.5h standard; 4.5–9h with perfusion mismatch (extended IVT pathway in app); wake-up stroke eligible with DWI-FLAIR mismatch. Thrombectomy: 0–24h with imaging selection (perfusion or clinical-core mismatch).',
        type: 'pearl',
        section: 'step-1',
      },
    ],
    deep: [
      {
        id: 'lkw-definition-deep',
        title: 'LKW Definition',
        content: 'If patient woke with symptoms, LKW is time last seen normal before sleep. Work backwards: when did they go to bed? Be precise - "yesterday" is not sufficient. Always verify with family, witnesses, or medical records. If exact time is unknown, use the most conservative estimate (earliest possible time).',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'I',
        evidenceLevel: 'C',
        plainEnglish: 'LKW = last time patient was definitely normal. For wake-up stroke, LKW is bedtime.',
        detailedContent: {
          overview: "The \"last known well\" (LKW) time is the precise moment when the patient was last confirmed to be at their baseline neurological function. It determines eligibility for time-sensitive treatments including IV thrombolysis (4.5-hour window) and mechanical thrombectomy (6-24 hour window depending on imaging).",
          clinicalTips: [
            "For wake-up strokes, LKW is bedtime, NOT when they woke up",
            "Interview family members, witnesses, EMS, and review any available documentation",
            "Vague terms like \"yesterday morning\" are insufficient - get exact times",
            "If uncertain, use the earliest possible time (most conservative estimate)",
            "Document your reasoning and all sources consulted in the medical record"
          ],
          evidence: "Standard of care per AHA/ASA 2026 Guidelines for Early Management of Acute Ischemic Stroke",
          reference: "Powers WJ, et al. 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke. Stroke. 2026. https://www.ahajournals.org/doi/10.1161/STR.0000000000000513"
        }
      },
      {
        id: 'time-is-brain-deep',
        title: 'Time Is Brain - The Evidence',
        content: '1.9 million neurons die per minute during untreated stroke (Saver, Stroke 2006). Every 15-minute delay reduces the probability of a good outcome by ~4% (Saver, JAMA 2013, GWTG-Stroke registry). NINDS time-stratified analysis (Marler, Neurology 2000): rt-PA vs placebo adjusted OR for favorable 3-month outcome was 2.11 (95% CI 1.33–3.35) at 0–90 min vs 1.69 (95% CI 1.09–2.62) at 91–180 min. Earlier treatment, greater benefit. Pooled IPD meta-analysis (Emberson, Lancet 2014): OR for good outcome falls from ~2.0 at 60 min to ~1.0 at ~4.5 h. Target door-to-needle <60 minutes (excellence: <30 minutes).',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'I',
        evidenceLevel: 'A',
        plainEnglish: 'Every minute counts. Target door-to-needle <60 min (ideal <30).',
        evidence: 'Saver, Stroke 2006; Saver, JAMA 2013; Marler, Neurology 2000; Emberson, Lancet 2014',
        detailedContent: {
          overview: 'Untreated supratentorial ischemic stroke destroys neurons at a quantifiable rate; treatment benefit decays with time.',
          evidence: 'Saver JL. Time is brain — quantified. Stroke. 2006;37(1):263–266. "The typical patient loses 1.9 million neurons each minute in which stroke is untreated." Saver JL et al, JAMA. 2013;309(23):2480–2488 — every 15-min reduction in door-to-needle time associated with ~4% greater odds of good outcome. Emberson J et al, Lancet 2014;384:1929–1935 — pooled patient-level meta-analysis of alteplase trials.',
          reference: 'Saver JL. Stroke. 2006;37(1):263–266. PMID: 16339467',
        },
      },
      {
        id: 'ninds-trial',
        title: 'NINDS Trial (0-3h)',
        content: 'Landmark trial establishing IV tPA. Part 2 (n=333) 3-month outcomes: mRS 0-1 39% vs 26%; Barthel ≥95 50% vs 38%; global OR 1.7 (95% CI 1.2-2.6, P=0.008). 6.4% sICH per NINDS definition (any ICH with neurological worsening, Parts 1+2 combined); ~2% sICH by ECASS-3 definition. Established the 3-hour window.',
        type: 'trial',
        section: 'step-1',
        link: '/trials/ninds',
        evidence: 'NEJM 1995',
        evidenceClass: 'I',
        evidenceLevel: 'A',
        plainEnglish: 'NINDS proved tPA works in 0-3h. Still the foundation of acute stroke care.',
        trialSlug: '/trials/ninds-trial',
        detailedContent: {
          overview: "The NINDS trial (1995) was the landmark study that established intravenous tissue plasminogen activator (tPA) as the standard of care for acute ischemic stroke within 3 hours of symptom onset.",
          evidence: "The New England Journal of Medicine, 1995",
          reference: "The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group. Tissue plasminogen activator for acute ischemic stroke. N Engl J Med. 1995;333(24):1581-1587."
        }
      },
      {
        id: 'ecass3-trial',
        title: 'ECASS III (3-4.5h)',
        content: 'Extended window to 4.5 hours. 52.4% vs 45.2% favorable outcome (mRS 0-1). Exclusions: Age >80, NIHSS >25, anticoagulants, prior stroke + diabetes. Treatment effect smaller than 0–3h window. AHA/ASA 2026 endorses 3–4.5h treatment for eligible patients.',
        type: 'trial',
        section: 'step-1',
        link: '/trials/ecass-3',
        evidence: 'NEJM 2008',
        evidenceClass: 'I',
        evidenceLevel: 'B',
        trialSlug: '/trials/ecass3-trial',
      },
      {
        id: 'wake-up-trial',
        title: 'WAKE-UP Trial',
        content: 'WAKE-UP enrolled wake-up strokes with DWI-FLAIR mismatch and randomized to alteplase vs placebo. 53.3% vs 41.8% achieved mRS 0–1 at 90 days (OR 1.61). Approximately 14–27% of strokes are detected on awakening; if the bedtime LKW puts the patient outside 4.5h, MRI mismatch makes them eligible.',
        type: 'trial',
        section: 'step-1',
        link: '/trials/wake-up',
        evidence: 'NEJM 2018',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'extend-trial',
        title: 'EXTEND Trial (4.5-9h)',
        content: 'Perfusion-guided thrombolysis 4.5-9h from onset. 35.4% vs 29.5% excellent outcome (mRS 0-1). Requires CT/MR perfusion showing mismatch. Extended window is safe and effective with imaging selection.',
        type: 'trial',
        section: 'step-1',
        link: '/trials/extend',
        evidence: 'NEJM 2019',
        evidenceClass: 'I',
        evidenceLevel: 'B',
        trialSlug: '/trials/extend-trial',
      },
      {
        id: 'contraindications-absolute',
        title: 'Absolute Contraindications',
        content: 'Acute ICH on imaging. Active internal bleeding. BP >185/110 uncontrolled. Platelet <100K. INR >1.7. Therapeutic LMWH <24h. Direct thrombin/Factor Xa inhibitors. Recent neurosurgery/severe head trauma <3mo. Blood glucose <50 mg/dL (hypoglycemia mimic).',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'III',
        evidenceLevel: 'B',
      },
      {
        id: 'contraindications-relative',
        title: 'Relative Contraindications (Often Safe)',
        content: 'Age >80 (IST-3: similar benefit, higher mortality from comorbidities). Mild stroke NIHSS <6 (20-30% still disabled at 3mo). Severe stroke NIHSS >25 (greatest benefit, NNT=3). Recent MI <3mo (risk myocardial rupture). Recent surgery <14d. Seizure at onset (91% of neurologists would treat). Unruptured aneurysm <7mm (appears safe, no ruptures reported).',
        type: 'pearl',
        section: 'step-1',
        evidence: 'Fugate & Rabinstein, Neurohospitalist 2015',
        evidenceClass: 'IIa',
        evidenceLevel: 'B',
      },
      {
        id: 'doac-management-2026',
        title: 'DOAC Management (2026 Update)',
        content: 'Last DOAC dose <48h, or any elevated drug-specific assay: do not give tPA. Last dose >48h with normal renal function and a normal drug-specific assay: tPA is an option (Class IIb). Check anti-Xa for apixaban, rivaroxaban, or edoxaban; check ECT or dilute thrombin time for dabigatran.',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'IIb',
        evidenceLevel: 'C',
        plainEnglish: 'DOAC <48h ago = no tPA. If >48h AND drug-specific lab is normal, tPA may be considered.',
        evidence: 'AHA/ASA 2026 §4.2 (DOAC and IV thrombolysis)',
      },
      {
        id: 'extended-window-exclusions',
        title: '3-4.5h Window ADDITIONAL Exclusions',
        content: 'ECASS III added exclusions for 3-4.5h window ONLY (not 0-3h): Age >80, NIHSS >25, any oral anticoagulant use (regardless of INR), prior stroke + diabetes, imaging shows >1/3 MCA territory infarct. These patients ARE eligible in 0-3h window.',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'I',
        evidenceLevel: 'B',
        plainEnglish: 'Age >80 is OK in 0-3h window but excluded in 3-4.5h window. ECASS III exclusions only apply to extended window.',
        evidence: 'ECASS III 2008, AHA/ASA 2026 Guidelines',
      },
      {
        id: 'stroke-mimics-safety',
        title: 'Stroke Mimics & tPA Safety',
        content: 'Stroke mimics (seizure, migraine, conversion disorder, hypoglycemia) receive tPA in 1–2% of cases. Zinkstok 2013 (n=5,581): sICH 1.0% (95% CI 0.0–5.0) in mimics vs 7.9% (95% CI 7.2–8.7) in true strokes. No fatal ICH in the mimic group. If stroke is the likely diagnosis, give tPA — the mimic-sICH risk is far lower than the disability cost of withholding treatment from a real stroke.',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'IIa',
        evidenceLevel: 'B',
        plainEnglish: 'When clinical suspicion for stroke is high, don\'t delay tPA for extended workup. The low sICH risk in mimics is outweighed by the cost of withholding tPA from a real stroke.',
        evidence: 'Zinkstok et al, Stroke 2013; AHA/ASA 2026 (Class IIa)',
      },
      {
        id: 'pregnancy-tpa',
        title: 'Pregnancy & tPA (2026 Update)',
        content: 'Pregnancy is a RELATIVE contraindication, not absolute. tPA does not cross placenta. Risk: maternal bleeding (uterine, postpartum). For severe disabling stroke, benefits often outweigh risks. Immediate OB consult required. Small case series, n≈15, limited generalizability: 2 sICH (13%), 8 healthy births (67%).',
        type: 'pearl',
        section: 'step-1',
        evidenceClass: 'IIb',
        evidenceLevel: 'C',
        plainEnglish: 'Pregnant with severe stroke? tPA may be appropriate. Get OB involved immediately.',
        evidence: 'AHA/ASA 2026 Guidelines',
      },
      {
        id: 'ist3-trial',
        title: 'IST-3 Trial (Elderly Patients)',
        content: '1,617 patients >80 years. 37% vs 35% alive & independent at 6 months. Age did not attenuate treatment benefit (adjusted analysis); IST-3 supports treating eligible patients >80y. Similar sICH rates. Age alone should NOT exclude treatment.',
        type: 'trial',
        section: 'step-1',
        link: '/trials/ist-3',
        evidence: 'Lancet 2012',
        evidenceClass: 'IIa',
        evidenceLevel: 'B',
      },
    ],
  },

  'step-2': { // LVO Screening
    quick: [
      {
        id: 'cortical-signs-quick',
        title: 'Cortical Signs',
        content: 'Aphasia, neglect, gaze deviation, hemianopia, extinction, apraxia suggest LVO. Multiple signs (≥2) = 89% specificity for M1/M2 occlusion. Alert IR immediately.',
        type: 'pearl',
        section: 'step-2',
      },
      {
        id: 'race-scale-quick',
        title: 'RACE Scale',
        content: 'Rapid Arterial oCclusion Evaluation. Score ≥5 = 85% sensitivity for LVO (Pérez de la Ossa et al, Stroke 2014). Components: Facial palsy, Arm motor, Leg motor, Gaze, Aphasia.',
        type: 'pearl',
        section: 'step-2',
        evidence: 'Pérez de la Ossa et al, Stroke 2014',
      },
      {
        id: 'lvo-benefit-quick',
        title: 'LVO = Thrombectomy Candidate',
        content: 'LVO patients: poor outcomes with tPA alone, excellent with thrombectomy. HERMES primary endpoint was ordinal mRS shift (common OR 2.49, 95% CI 1.76–3.53). Dichotomized secondary framing: mRS 0–2 46% vs 29% (NNT ~6). Activate IR team.',
        type: 'pearl',
        section: 'step-2',
      },
    ],
    deep: [
      {
        id: 'cortical-signs-deep',
        title: 'Cortical Signs & LVO Detection',
        content: 'Cortical signs strongly suggest large vessel occlusion: Aphasia (language), Hemispatial neglect (attention), Gaze deviation (frontal eye fields), Hemianopia (visual cortex), Extinction (sensory attention), Apraxia (motor planning). Single sign: ~60% sensitivity. Multiple signs (≥2): 89% specificity for M1/M2 occlusion. Even with low NIHSS, cortical signs warrant CTA and IR activation.',
        type: 'pearl',
        section: 'step-2',
        evidence: 'Duvekot et al, Stroke 2021',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'race-scale-deep',
        title: 'RACE Scale for LVO',
        content: 'Rapid Arterial oCclusion Evaluation scale predicts LVO. Score components: Facial palsy (1), Arm motor function (2), Leg motor function (2), Gaze deviation (1), Aphasia/Agnosia (2). Score ≥5 has 85% sensitivity and 69% specificity for LVO. Helps pre-hospital triage to thrombectomy centers.',
        type: 'pearl',
        section: 'step-2',
        evidence: 'Pérez de la Ossa et al, Stroke 2014',
        evidenceClass: 'IIa',
        evidenceLevel: 'B',
      },
      {
        id: 'fast-ed-scale',
        title: 'FAST-ED Score',
        content: 'Field Assessment Stroke Triage for Emergency Destination. Components: Facial palsy, Arm weakness, Speech, Time, Eye deviation, Denial/Neglect. AUC 0.81 for LVO detection (Lima et al, Stroke 2016); score ≥4 is the commonly applied LVO-triage cutoff. Alternative to RACE.',
        type: 'pearl',
        section: 'step-2',
        evidence: 'Lima et al, Stroke 2016',
        evidenceClass: 'IIa',
        evidenceLevel: 'B',
      },
      {
        id: 'hermes-meta-analysis',
        title: 'HERMES Meta-Analysis',
        content: 'Pooled 1,287 patients from 5 RCTs (MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT). Primary endpoint was ordinal mRS shift at 90 days: common odds ratio 2.49 (95% CI 1.76–3.53) favoring thrombectomy. Dichotomized secondary framing: mRS 0–2 at 90 days 46% vs 29% (ARR ~17 percentage points; NNT ~6 from this dichotomization, secondary). Benefit consistent across age, NIHSS, and time-window subgroups.',
        type: 'trial',
        section: 'step-2',
        link: '/trials/hermes',
        evidence: 'Lancet 2016',
        evidenceClass: 'I',
        evidenceLevel: 'A',
      },
      {
        id: 'dawn-trial',
        title: 'DAWN Trial (6-24h)',
        content: 'Bayesian-adaptive trial of clinical-core mismatch thrombectomy 6–24h from LKW. Selection by age, NIHSS, and core volume. Co-primary endpoints were utility-weighted mRS and mRS 0–2 at 90 days, analyzed under a Bayesian framework — primary result was posterior probability of superiority >0.999, not a frequentist p-value. Dichotomized secondary framing (mRS 0–2): 48.6% vs 13.1% functional independence (ARR ~36 percentage points; NNT ~3 from this dichotomization, secondary).',
        type: 'trial',
        section: 'step-2',
        link: '/trials/dawn',
        evidence: 'NEJM 2018',
        evidenceClass: 'I',
        evidenceLevel: 'A',
        trialSlug: '/trials/dawn-trial',
      },
      {
        id: 'defuse3-trial',
        title: 'DEFUSE-3 Trial (6-16h)',
        content: 'Perfusion-selected thrombectomy 6–16h from LKW. Selection: core <70 mL, mismatch ratio ≥1.8, penumbra ≥15 mL. Primary endpoint was ordinal mRS shift at 90 days. Dichotomized secondary framing (mRS 0–2): 44.6% vs 16.7% functional independence (ARR ~28 percentage points; NNT ~4 from this dichotomization, secondary).',
        type: 'trial',
        section: 'step-2',
        link: '/trials/defuse-3',
        evidence: 'NEJM 2018',
        evidenceClass: 'I',
        evidenceLevel: 'A',
        trialSlug: '/trials/defuse-3-trial',
      },
      {
        id: 'lvo-workflow',
        title: 'LVO Detection Workflow',
        content: 'If cortical signs present: (1) Give tPA if <4.5h (don\'t delay), (2) STAT CTA/CTP, (3) Alert IR team immediately, (4) Consider direct transfer to angio suite. LVO + tPA + thrombectomy = superior outcomes. Sequential therapy outperforms either alone.',
        type: 'pearl',
        section: 'step-2',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
    ],
  },

  'step-3': { // Laboratory Workup
    quick: [
      {
        id: 'glucose-only-mandatory',
        title: 'Glucose Only Mandatory',
        content: 'Point-of-care glucose is the ONLY mandatory lab before tPA. Takes 10 seconds. Rules out hypoglycemia mimic. All other labs can run during infusion.',
        type: 'pearl',
        section: 'step-3',
      },
      {
        id: 'door-to-needle-quick',
        title: 'Door-to-Needle Priority',
        content: 'Target <60 minutes door-to-needle (excellence: <30 min). Every 15-minute reduction → 4% increase in good outcome. Don\'t delay for non-critical labs.',
        type: 'pearl',
        section: 'step-3',
      },
      {
        id: 'coagulation-quick',
        title: 'Anticoagulation Check',
        content: 'Warfarin: INR must be <1.7. DOACs: If last dose >48h and normal PT/aPTT/TT, may proceed with caution. Therapeutic LMWH <24h = contraindication.',
        type: 'pearl',
        section: 'step-3',
      },
    ],
    deep: [
      {
        id: 'glucose-mandatory-deep',
        title: 'Why Glucose is Mandatory',
        content: 'Point-of-care glucose is the ONLY mandatory lab because: (1) Hypoglycemia (<50) can perfectly mimic stroke with focal deficits - 10-second test prevents inappropriate tPA. (2) Hyperglycemia (>200) worsens ischemia - treat but don\'t delay. (3) All other labs can run during tPA infusion. Exception: Known anticoagulation requires INR/aPTT.',
        type: 'pearl',
        section: 'step-3',
        evidenceClass: 'I',
        evidenceLevel: 'A',
      },
      {
        id: 'door-to-needle-deep',
        title: 'Door-to-Needle Benchmark',
        content: 'Target: 60 minutes door-to-needle (benchmark). Excellence: 30 minutes. Every 15-minute reduction → 4% increase in good outcome. Fonarow (2014): D2N <60min vs >90min - 13% relative improvement in discharge home. Door-to-needle time is the most modifiable determinant of stroke outcomes.',
        type: 'pearl',
        section: 'step-3',
        evidence: 'Fonarow et al, Stroke 2014',
        evidenceClass: 'I',
        evidenceLevel: 'A',
      },
      {
        id: 'anticoag-warfarin',
        title: 'Warfarin & INR',
        content: 'INR >1.7 — contraindication to IV thrombolysis per AHA/ASA 2026. INR 1.4–1.7 in patients on warfarin: AHA permits treatment; some European protocols differ. Subtherapeutic INR (1.0-1.7): Meta-analysis showed 4.1x increased sICH risk, but confounded by age/comorbidities. GWTG registry: after adjustment, no independent increase in sICH. Recommendation: Treat if INR <1.7.',
        type: 'pearl',
        section: 'step-3',
        evidence: 'Xian et al, JAMA 2012',
        evidenceClass: 'III',
        evidenceLevel: 'B',
      },
      {
        id: 'anticoag-doacs',
        title: 'Direct Oral Anticoagulants',
        content: 'Dabigatran (direct thrombin inhibitor): Check TT (most sensitive), aPTT, PT. If all normal AND last dose >48h, may consider. Rivaroxaban/Apixaban (Factor Xa inhibitors): Check anti-Xa level if available. Limited data - only case reports. Generally avoid unless part of research protocol.',
        type: 'pearl',
        section: 'step-3',
        evidence: 'Fugate & Rabinstein, Neurohospitalist 2015',
        evidenceClass: 'III',
        evidenceLevel: 'C',
      },
      {
        id: 'anticoag-lmwh',
        title: 'Low Molecular Weight Heparin',
        content: 'Therapeutic dose LMWH within 24h = absolute contraindication. Evidence: 21 patients (18 within 24h), 38% ICH rate, 3 sICH (OR 8.4 for sICH vs controls), 29% mortality. Prophylactic-dose LMWH may be safer but data limited.',
        type: 'pearl',
        section: 'step-3',
        evidence: 'Matute et al, Cerebrovasc Dis 2012',
        evidenceClass: 'III',
        evidenceLevel: 'B',
      },
      {
        id: 'cardiac-workup',
        title: 'Cardiac Evaluation',
        content: 'ECG: Assess for AF or acute STEMI. Telemetry: Minimum 24h (CRYSTAL-AF: 30-day monitoring detected 3x more AF than 24h Holter). Troponin: Check baseline, repeat if chest pain. TTE: Routine for all. TEE: Higher sensitivity for LA appendage thrombus, PFO, aortic arch atheroma.',
        type: 'pearl',
        section: 'step-3',
        evidence: 'CRYSTAL-AF, Circulation 2014',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'platelet-count',
        title: 'Thrombocytopenia',
        content: 'Platelet <100,000 = contraindication. Evidence: ~20 patients treated with platelets <100K reported, only 1 sICH. Don\'t delay tPA to wait for platelet count unless clinical suspicion of thrombocytopenia (e.g., known ITP, cirrhosis, recent chemotherapy).',
        type: 'pearl',
        section: 'step-3',
        evidence: 'Fugate & Rabinstein, Neurohospitalist 2015',
        evidenceClass: 'III',
        evidenceLevel: 'B',
      },
    ],
  },

  'step-4': { // Vital Signs
    quick: [
      {
        id: 'bp-targets-quick',
        title: 'BP Targets',
        content: 'Pre-tPA: <185/110 (absolute). Post-tPA: <180/105 for 24h. Use labetalol or nicardipine to control. Avoid hydralazine (unpredictable drops).',
        type: 'pearl',
        section: 'step-4',
      },
      {
        id: 'glucose-targets-quick',
        title: 'Glucose Targets',
        content: 'Target 140-180 mg/dL. <70 = hypoglycemia mimic (give D50). >200 = worsens outcomes (insulin drip). Avoid hypoglycemia at all costs.',
        type: 'pearl',
        section: 'step-4',
      },
    ],
    deep: [
      {
        id: 'bp-j-curve',
        title: 'BP J-Curve Phenomenon',
        content: 'BP and stroke outcomes follow J-shaped curve: Too high (>180) increases hemorrhagic transformation. Too low (<120) decreases penumbral perfusion. Sweet spot: 140-160 mmHg systolic. Pre-tPA strict control (<185/110) prevents ICH. Post-tPA moderate control (<180/105) balances hemorrhage prevention with perfusion.',
        type: 'pearl',
        section: 'step-4',
        evidence: 'ENCHANTED 2016, ENOS 2015',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'bp-pretpa-deep',
        title: 'Pre-tPA BP Control',
        content: 'Target <185/110 (absolute requirement). NINDS data: Every 10mmHg SBP increase → 12% increased odds of sICH. Mechanism: Disrupted blood-brain barrier + high pressure = hemorrhagic transformation. Can treat with IV antihypertensives - BP control before tPA is SAFE and necessary.',
        type: 'pearl',
        section: 'step-4',
        evidence: 'NINDS 1995',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'bp-posttpa-deep',
        title: 'Post-tPA BP Control',
        content: 'Target <180/105 for 24h. SITS-ISTR data: SBP >180 associated with 6% → 17% sICH rate (linear relationship). Mechanism: Reperfusion injury + hypertension = bleeding. ENCHANTED trial: Intensive lowering (<140) had mixed results - no clear benefit, possible harm.',
        type: 'pearl',
        section: 'step-4',
        evidence: 'SITS-ISTR 2009; ENCHANTED 2016',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'bp-management-protocol',
        title: 'BP Management Agents',
        content: 'Labetalol (first-line): 10-20mg IV over 1-2 min, repeat q10min (max 300mg). Combined α/β blocker - smooth reduction. Nicardipine (preferred if asthma/COPD): Start 5mg/h, titrate by 2.5mg/h q5-15min (max 15mg/h). Continuous infusion allows precise control. Clevidipine: Ultra-short acting, expensive but ultra-precise. Hydralazine: NOT recommended - unpredictable, can cause precipitous drops.',
        type: 'pearl',
        section: 'step-4',
        evidenceClass: 'I',
        evidenceLevel: 'C',
      },
      {
        id: 'enchanted-trial',
        title: 'ENCHANTED Trial',
        content: 'Intensive BP lowering (<140) vs standard (<180) post-tPA. No benefit from intensive lowering, trend toward worse outcomes. Current practice: Moderate control to balance hemorrhage prevention with perfusion maintenance.',
        type: 'trial',
        section: 'step-4',
        link: '/trials/enchanted',
        evidence: 'Lancet 2016',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'glucose-deep',
        title: 'Glucose Management',
        content: 'Hypoglycemia (<50): Can perfectly mimic stroke with focal deficits, seizures. Give D50 50mL IV → recheck. If symptoms persist after normoglycemia, stroke confirmed. Hyperglycemia (>200): Worsens ischemia, decreases recanalization, increases ICH risk (RIBO 2005). Target 140-180 mg/dL with insulin drip. CRITICAL: Avoid hypoglycemia - more dangerous than hyperglycemia.',
        type: 'pearl',
        section: 'step-4',
        evidence: 'Ribo et al, Stroke 2005',
        evidenceClass: 'I',
        evidenceLevel: 'C',
      },
      {
        id: 'shine-trial',
        title: 'SHINE Trial (Glucose Control)',
        content: 'Intensive glucose control (80-130) vs standard (140-180) in stroke. No benefit from intensive control. Increased hypoglycemia risk. Target 140-180 mg/dL is current standard. Intensive glucose control 80–130 mg/dL is Class III: No Benefit, Level A per AHA/ASA 2026 §4.5.',
        type: 'trial',
        section: 'step-4',
        link: '/trials/shine',
        evidence: 'JAMA 2019',
        evidenceClass: 'I',
        evidenceLevel: 'B',
        trialSlug: '/trials/shine-trial',
        detailedContent: {
          overview: "The SHINE trial investigated whether intensive insulin therapy targeting 80-130 mg/dL improved outcomes compared to standard care targeting <180 mg/dL in acute ischemic stroke patients with hyperglycemia.",
          evidence: "JAMA. 2019;321(20):1978-1987",
          reference: "Johnston KC, et al. Intensive vs Standard Treatment of Hyperglycemia and Functional Outcome in Patients With Acute Ischemic Stroke: The SHINE Randomized Clinical Trial. JAMA. 2019;321(20):1978-1987."
        }
      },
      {
        id: 'gist-uk-trial',
        title: 'GIST-UK Trial',
        content: 'Intensive glucose control (72-126) vs standard (<180) post-stroke. No benefit from intensive control, trend toward worse outcomes. Take-home: Treat hyperglycemia but AVOID hypoglycemia.',
        type: 'trial',
        section: 'step-4',
        link: '/trials/gist-uk',
        evidence: 'Lancet Neurol 2015',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'sparcl-trial',
        title: 'SPARCL Trial (Statin for Secondary Prevention)',
        content: '4,731 patients with recent stroke/TIA randomized to atorvastatin 80mg vs placebo. Primary outcome (stroke recurrence): 11.2% vs 13.1% (16% relative risk reduction, NNT=46). Benefit across all stroke subtypes. Start high-intensity statin immediately unless ICH.',
        type: 'trial',
        section: 'step-4',
        link: '/trials/sparcl',
        evidenceClass: 'I',
        evidenceLevel: 'A',
        plainEnglish: 'Atorvastatin 80mg prevents 1 stroke for every 46 patients treated. Start on day 1.',
        evidence: 'NEJM 2006',
        trialSlug: '/trials/sparcl-trial',
      },
    ],
  },

  'step-5': { // Treatment Orders
    quick: [
      {
        id: 'monitoring-quick',
        title: 'Post-tPA Monitoring',
        content: 'Neuro exams q15min × 2h, then q30min × 6h, then q1h × 16h. Any decline (NIHSS ↑≥4) = STAT CT. sICH typically presents within 6-12h.',
        type: 'pearl',
        section: 'step-5',
      },
      {
        id: 'ct-timing-quick',
        title: 'CT Timing',
        content: 'Routine CT at 24h post-tPA before starting antithrombotics. If any clinical worsening → STAT CT (don\'t wait 24h). Rule out hemorrhage before aspirin.',
        type: 'pearl',
        section: 'step-5',
      },
      {
        id: 'anticoag-hold-quick',
        title: 'Hold Anticoagulation',
        content: 'No antiplatelet or anticoagulation × 24h post-tPA. Increased bleeding risk during tPA clearance. Can start aspirin after 24h CT shows no hemorrhage.',
        type: 'pearl',
        section: 'step-5',
      },
    ],
    deep: [
      {
        id: 'monitoring-protocol-deep',
        title: 'Post-tPA Monitoring Protocol',
        content: 'Neuro exams: q15min × 2h (critical period for sICH), then q30min × 6h, then q1h × 16h. Monitor for sICH signs: sudden neurological deterioration (NIHSS ↑≥4), severe headache, nausea/vomiting, seizure, acute hypertension. Any decline = STAT CT + hold antithrombotics + neurosurgery consult. SITS-MOST registry: 1.7% sICH rate with strict protocol adherence.',
        type: 'pearl',
        section: 'step-5',
        evidence: 'SITS-MOST 2007',
        evidenceClass: 'I',
        evidenceLevel: 'C',
      },
      {
        id: 'sits-most-trial',
        title: 'SITS-MOST Registry',
        content: 'Safe Implementation of Treatments in Stroke - Monitoring Study. 6,483 patients treated with tPA in clinical practice. 1.7% sICH rate with strict protocol adherence. Defined the monitoring protocols used in current practice.',
        type: 'trial',
        section: 'step-5',
        link: '/trials/sits-most',
        evidence: 'Lancet 2007',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'artis-trial',
        title: 'ARTIS Trial (Aspirin Timing)',
        content: '642 patients randomized to aspirin 300mg IV vs placebo within 90min of tPA. Trial stopped early: sICH 4.3% vs 1.6% in aspirin group (p=0.04). No benefit in outcomes. Established standard: NO antiplatelet agents × 24h post-tPA.',
        type: 'trial',
        section: 'step-5',
        link: '/trials/artis',
        evidenceClass: 'III',
        evidenceLevel: 'B',
        plainEnglish: 'Aspirin within 24h of tPA triples bleeding risk without benefit. Wait 24 hours.',
        evidence: 'Stroke 2017',
      },
      {
        id: 'crystal-af-trial',
        title: 'CRYSTAL-AF (Extended Cardiac Monitoring)',
        content: '441 cryptogenic stroke patients randomized to implantable cardiac monitor vs standard monitoring. AF detection: 8.9% at 6mo, 12.4% at 12mo, 16.1% at 36mo vs 1.4% at 6mo, 2.0% at 12mo with standard care. Changed practice: extended monitoring (30 days minimum) for cryptogenic stroke.',
        type: 'trial',
        section: 'step-5',
        link: '/trials/crystal-af',
        evidenceClass: 'I',
        evidenceLevel: 'B',
        plainEnglish: '30-day monitoring detects 3x more AF than 24h Holter. Essential for cryptogenic stroke workup.',
        evidence: 'NEJM 2014',
      },
      {
        id: 'clots3-trial',
        title: 'CLOTS-3 Trial (DVT Prophylaxis)',
        content: '2,876 immobile stroke patients randomized to intermittent pneumatic compression (IPC) vs none. DVT: 12.1% vs 8.5% with IPC (ARR 3.6%, NNT=28). Safe to use immediately post-tPA. Pharmacologic prophylaxis (heparin SQ) starts after 24h once CT confirms no hemorrhage.',
        type: 'trial',
        section: 'step-5',
        link: '/trials/clots-3',
        evidenceClass: 'I',
        evidenceLevel: 'A',
        plainEnglish: 'SCDs prevent 1 DVT for every 28 patients. Start immediately, even post-tPA.',
        evidence: 'Lancet 2013',
      },
      {
        id: 'ct-protocol-deep',
        title: 'CT Imaging Protocol',
        content: 'Routine CT: 24h post-tPA before starting antithrombotics. Detects delayed hemorrhage. Emergency CT: Any neurological worsening (NIHSS ↑≥4), severe headache, nausea/vomiting, seizure, BP spike. ECASS-3 definition of sICH: Any ICH + NIHSS ↑≥4 points, OR any ICH + death, OR ICH requiring surgical intervention.',
        type: 'pearl',
        section: 'step-5',
        evidence: 'ECASS-3 2008',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'anticoagulation-timing',
        title: 'Anticoagulation Restart Timing',
        content: 'Hold all antithrombotics for 24h post-tPA — antiplatelets and anticoagulants both. Systemic fibrinolysis raises bleeding risk everywhere, especially puncture sites. At 24h, get a non-contrast CT; if it is clear, start aspirin 81–325 mg. For AF requiring anticoagulation, AHA/ASA 2026 endorses earlier DOAC starts in selected patients. The ELAN trial (NEJM 2023) gives the operational timing: within 48h for TIA, minor, or moderate stroke; day 6–7 for major stroke; repeat imaging first, and add caution after IVT or EVT.',
        type: 'pearl',
        section: 'step-5',
        evidence: 'ELAN trial 2023',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'telemetry-monitoring',
        title: 'Cardiac Monitoring',
        content: 'Continuous telemetry minimum 24h (ideally 72h) to screen for AF. 30% of cryptogenic strokes have paroxysmal AF. CRYSTAL-AF: 30-day event monitoring detected 16% AF vs 5% with 24h Holter (3x detection). Consider implantable loop recorder if high suspicion + negative workup.',
        type: 'pearl',
        section: 'step-5',
        evidence: 'CRYSTAL-AF, Circulation 2014',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'no-lines-24h',
        title: 'No Central Lines × 24h',
        content: 'Avoid central lines, arterial sticks, Foley catheter × 24h post-tPA. Reason: Bleeding risk at ALL puncture sites during systemic fibrinolysis. If absolutely required: Use compressible sites only (femoral vein OK, subclavian NOT OK). Apply firm pressure × 10 minutes minimum.',
        type: 'pearl',
        section: 'step-5',
        evidenceClass: 'I',
        evidenceLevel: 'C',
      },
      {
        id: 'bp-maintenance-deep',
        title: 'BP Maintenance Post-tPA',
        content: 'Maintain <180/105 for 24h post-tPA. First 24h are critical for sICH prevention. SITS-ISTR: BP >180 associated with 6% → 17% sICH rate. After 24h: Gradual liberalization based on perfusion needs and vascular status.',
        type: 'pearl',
        section: 'step-5',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
    ],
  },

  'step-6': { // Complications
    quick: [
      {
        id: 'sich-incidence-quick',
        title: 'sICH Risk',
        content: '6.4% risk with tPA (NINDS). Risk factors: Age >80, NIHSS >20, early CT changes (ASPECTS <7), hyperglycemia >200, time >3h. Despite sICH, overall mortality unchanged and outcomes improved.',
        type: 'pearl',
        section: 'step-6',
      },
      {
        id: 'hemorrhage-management-quick',
        title: 'Hemorrhage Protocol',
        content: 'Stop tPA immediately. STAT CT. Cryoprecipitate 10 units IV (raises fibrinogen ~50 mg/dL, target >150). TXA is part of the AHA/ASA 2026 Table 5 reversal bundle for post-thrombolysis sICH; TXA is NOT recommended for spontaneous ICH (TICH-2; Class III, Level A per 2022 ICH). BP target <140 mmHg within 1 h; avoid SBP <110. Reverse anticoagulation if applicable (4-factor PCC + vitamin K for warfarin; idarucizumab for dabigatran; andexanet or PCC for Xa inhibitors). Platelet transfusion not routinely recommended (2022). Neurosurgery consult STAT.',
        type: 'pearl',
        section: 'step-6',
      },
    ],
    deep: [
      {
        id: 'sich-definition',
        title: 'sICH Definition (ECASS-3)',
        content: 'Symptomatic intracranial hemorrhage requires: (1) Any ICH on imaging + NIHSS increase ≥4 points within 24h, OR (2) Any ICH + death within 7 days, OR (3) Any ICH requiring surgical intervention. Distinction: Asymptomatic ICH occurs in ~15% but doesn\'t worsen outcomes.',
        type: 'pearl',
        section: 'step-6',
        evidence: 'ECASS-3 2008',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'sich-incidence-deep',
        title: 'sICH Incidence & Risk Factors',
        content: 'Overall incidence: 6.4% per NINDS definition (any ICH with neurological worsening); ~2% sICH by ECASS-3 definition; 1.7–7% range in registries depending on definition used. Risk factors: Age >80 (OR 1.27), NIHSS >20 (linear increase), ASPECTS <7 (early ischemic changes), hyperglycemia >200 mg/dL, time to treatment >3h, uncontrolled BP >185. CRITICAL: Despite increased sICH, overall mortality unchanged because benefit outweighs risk.',
        type: 'pearl',
        section: 'step-6',
        evidence: 'NINDS 1995; Pooled analysis',
        evidenceClass: 'I',
        evidenceLevel: 'A',
      },
      {
        id: 'hemorrhage-recognition',
        title: 'sICH Recognition',
        content: 'Timing: Typically presents 6-12h post-tPA (can be up to 36h). Symptoms: Sudden neurological deterioration (NIHSS ↑≥4), severe headache, nausea/vomiting, decreased level of consciousness, seizure, acute BP spike. Action: IMMEDIATE CT + stop all antithrombotics + neurosurgery page.',
        type: 'pearl',
        section: 'step-6',
        evidenceClass: 'I',
        evidenceLevel: 'C',
      },
      {
        id: 'hemorrhage-reversal-protocol',
        title: 'Coagulopathy Reversal Protocol',
        content: 'STEP 1: Stop the tPA infusion. STEP 2: Cryoprecipitate 10 units IV push to replace fibrinogen; target >150 mg/dL and recheck q30min until you hit it. STEP 3: Do not give TXA routinely. TICH-2 showed no benefit and a signal for thromboembolic harm (Class III, Level A; AHA/ASA 2022 ICH). STEP 4: Do not transfuse platelets routinely; PATCH 2016 showed worse outcomes in spontaneous ICH on antiplatelets. Reserve for severe thrombocytopenia or emergency surgery. STEP 5: Reverse the anticoagulant. Warfarin: 4-factor PCC 25–50 units/kg IV plus vitamin K 10 mg IV, goal INR <1.4; use FFP only if PCC is unavailable. Dabigatran: idarucizumab 5 g IV. Apixaban/rivaroxaban: andexanet alfa, or 4-factor PCC if andexanet is unavailable.',
        type: 'pearl',
        section: 'step-6',
        evidence: 'AHA/ASA 2022 ICH Guidelines, Sections 5.1, 6.2; TICH-2 2018',
        evidenceClass: 'I',
        evidenceLevel: 'C',
      },
      {
        id: 'tich2-trial',
        title: 'TICH-2 Trial (TXA)',
        content: 'Tranexamic acid in spontaneous ICH. 2,325 patients. TXA did not improve functional outcomes; possible increase in thromboembolic events. 2022 AHA/ASA ICH: TXA NOT recommended for routine use (Class III, Level A). Not recommended for tPA-related ICH as routine therapy.',
        type: 'trial',
        section: 'step-6',
        link: '/trials/tich-2',
        evidence: 'Lancet 2018; AHA/ASA 2022 ICH',
        evidenceClass: 'III',
        evidenceLevel: 'A',
      },
      {
        id: 'bp-in-hemorrhage',
        title: 'BP Management in ICH',
        content: 'Target SBP <140 mmHg within 1 hour when feasible (Class I, Level A). Avoid SBP <110 mmHg (ATACH-2: intensive target 110-139 showed no benefit, possible harm). Use nicardipine or labetalol. Contrast with ischemic stroke: in ICH lower BP reduces expansion; in ischemic stroke too low worsens penumbral perfusion.',
        type: 'pearl',
        section: 'step-6',
        evidence: 'AHA/ASA 2022 ICH Guidelines, Section 5.1, Class I, Level A; INTERACT-2, ATACH-2',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'atach2-trial',
        title: 'ATACH-2 Trial',
        content: 'Intensive BP lowering (110-139) vs standard (140-179) in spontaneous ICH. No difference in death or disability; intensive arm had possible harm (e.g. renal). 2022 guidelines: SBP <140 within 1 hour when feasible; avoid SBP <110.',
        type: 'trial',
        section: 'step-6',
        link: '/trials/atach-2',
        evidence: 'NEJM 2016; AHA/ASA 2022 ICH',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'neurosurgery-indications',
        title: 'Surgical Intervention for ICH',
        content: 'STAT neurosurgery consult for: Cerebellar hemorrhage >3 cm with neurological decline or brainstem compression or hydrocephalus (evacuate; Class I, Level B). EVD for hydrocephalus from IVH. Superficial lobar ICH with mass effect + declining GCS (STICH II-type). Any ICH with herniation signs. STICH trials: Benefit for superficial (<1cm from cortex) lobar hemorrhages with mass effect. Deep hemorrhages (basal ganglia, thalamus) generally managed medically.',
        type: 'pearl',
        section: 'step-6',
        evidence: 'AHA/ASA 2022 ICH Guidelines; STICH, STICH II',
        evidenceClass: 'I',
        evidenceLevel: 'B',
      },
      {
        id: 'stich-trial',
        title: 'STICH Trials',
        content: 'Surgery for spontaneous ICH. STICH I: No overall benefit. STICH II: no overall benefit; possible benefit in select superficial lobar hemorrhages (<1cm from cortex) with mass effect. Deep hemorrhages managed medically. 2022 AHA/ASA ICH: Class IIb for surgical evacuation in selected supratentorial lobar ICH.',
        type: 'trial',
        section: 'step-6',
        link: '/trials/stich',
        evidence: 'Lancet 2005, 2013; AHA/ASA 2022 ICH',
        evidenceClass: 'IIb',
        evidenceLevel: 'B',
      },
    ],
  },
};

// Get pearls for a specific section
export const getPearlsForSection = (
  sectionId: string,
  isDeepLearning: boolean = false
): ClinicalPearl[] => {
  const sectionData = STROKE_CLINICAL_PEARLS[sectionId];
  if (!sectionData) return [];
  
  return isDeepLearning ? sectionData.deep : sectionData.quick;
};

// Get all relevant trials
export const getAllTrials = (): ClinicalPearl[] => {
  const allPearls: ClinicalPearl[] = [];
  Object.values(STROKE_CLINICAL_PEARLS).forEach(section => {
    allPearls.push(...section.deep.filter(p => p.type === 'trial'));
  });
  return allPearls;
};

// Get all trials with proper deduplication
export const getUniqueTrials = (): ClinicalPearl[] => {
  const trials = getAllTrials();
  const uniqueTrials = new Map<string, ClinicalPearl>();
  
  trials.forEach(trial => {
    if (!uniqueTrials.has(trial.id)) {
      uniqueTrials.set(trial.id, trial);
    }
  });
  
  return Array.from(uniqueTrials.values());
};
