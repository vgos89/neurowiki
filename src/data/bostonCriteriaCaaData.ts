/**
 * Boston Criteria 2.0 for Cerebral Amyloid Angiopathy (CAA)
 * Source: Charidimou A, et al. The Boston Criteria Version 2.0 for Cerebral Amyloid Angiopathy. Lancet Neurol. 2022;21(8):714-25.
 * Radiopaedia: https://radiopaedia.org/articles/boston-criteria-20-for-cerebral-amyloid-angiopathy
 * Use: MRI-based diagnosis of CAA in patients ≥50 with spontaneous ICH, TFNE, or cognitive impairment/dementia.
 */

export const BOSTON_CAA_CITATION = {
  authors: 'Charidimou A, Boulouis G, Frosch M et al.',
  title: 'The Boston Criteria Version 2.0 for Cerebral Amyloid Angiopathy: A Multicentre, Retrospective, MRI–neuropathology Diagnostic Accuracy Study',
  journal: 'Lancet Neurol',
  year: 2022,
  volume: 21,
  issue: 8,
  pages: '714-725',
  doi: '10.1016/s1474-4422(22)00208-3',
};

export type BostonCaaDiagnosis = 'definite-CAA' | 'probable-CAA-supporting-pathology' | 'probable-CAA' | 'possible-CAA' | 'unlikely-CAA' | 'excluded';

export type BostonCaaInputs = {
  age: number;
  /** Pathology: definite = full autopsy CAA; supporting = evacuated hematoma or cortical biopsy showing CAA */
  pathologyDefiniteCAA: boolean;
  pathologySupportingCAA: boolean;
  /** Presentation: spontaneous ICH, TFNE, or cognitive impairment/dementia */
  hasQualifyingPresentation: boolean;
  /** Strictly lobar hemorrhagic lesions: 0, 1, or ≥2 (ICH, microbleeds, cortical superficial siderosis, convexity SAH); multiple foci count as multiple */
  lobarHemorrhagicLesions: 0 | 1 | 2;
  /** White matter: severe centrum semiovale PVS >20 in one hemisphere OR multispot WMH >10 subcortical FLAIR dots bilaterally */
  whiteMatterFeature: boolean;
  /** Deep hemorrhagic lesions on T2* (basal ganglia, thalamus, brainstem, deep white matter). If present, strict criteria exclude CAA (specificity); ~15% of pathologically proven CAA can have deep microbleeds */
  deepHemorrhagicLesions: boolean;
  /** Other cause: head trauma, hemorrhagic transformation of ischemic stroke, AVM, hemorrhagic tumor, warfarin INR >3, vasculitis */
  otherCauseOfHemorrhage: boolean;
};

export interface BostonCaaResult {
  diagnosis: BostonCaaDiagnosis;
  label: string;
  criteriaMet: string[];
  clinicalImplications: string;
  anticoagulationRisk: 'very-high' | 'high' | 'moderate' | 'low' | 'n/a';
  recommendations: string[];
}

export const BOSTON_DIAGNOSIS_LABELS: Record<BostonCaaDiagnosis, string> = {
  'definite-CAA': 'Definite CAA',
  'probable-CAA-supporting-pathology': 'Probable CAA (supporting pathology)',
  'probable-CAA': 'Probable CAA',
  'possible-CAA': 'Possible CAA',
  'unlikely-CAA': 'CAA unlikely',
  excluded: 'Excluded (other cause or criteria not met)',
};

function excludedResult(criteriaMet: string[]): BostonCaaResult {
  return {
    diagnosis: 'excluded',
    label: BOSTON_DIAGNOSIS_LABELS.excluded,
    criteriaMet,
    clinicalImplications: 'Another cause of hemorrhage or exclusion criterion present. Do not apply Boston CAA criteria for diagnosis.',
    anticoagulationRisk: 'n/a',
    recommendations: ['Address identified cause of hemorrhage.', 'Reassess anticoagulation indication separately if applicable.'],
  };
}

function unlikelyResult(criteriaMet: string[]): BostonCaaResult {
  return {
    diagnosis: 'unlikely-CAA',
    label: BOSTON_DIAGNOSIS_LABELS['unlikely-CAA'],
    criteriaMet,
    clinicalImplications: 'Imaging and clinical picture do not meet possible CAA. CAA is still a differential in elderly with lobar hemorrhage.',
    anticoagulationRisk: 'moderate',
    recommendations: ['Consider CAA in differential if future lobar hemorrhage or TFNE.', 'Anticoagulation decision per stroke vs bleeding risk (e.g. CHA2DS2-VASc vs HAS-BLED).'],
  };
}

export function assessBostonCriteria(input: BostonCaaInputs): BostonCaaResult {
  if (input.otherCauseOfHemorrhage) {
    return excludedResult(['Other cause of hemorrhagic lesions present (trauma, hemorrhagic transformation, AVM, tumor, warfarin INR >3, vasculitis).']);
  }

  if (input.pathologyDefiniteCAA) {
    return {
      diagnosis: 'definite-CAA',
      label: BOSTON_DIAGNOSIS_LABELS['definite-CAA'],
      criteriaMet: ['Full brain post-mortem: severe CAA with vasculopathy, no other diagnostic lesion.'],
      clinicalImplications: 'Pathology-proven CAA. High recurrence risk for lobar hemorrhage; anticoagulation carries very high ICH risk.',
      anticoagulationRisk: 'very-high',
      recommendations: ['Avoid anticoagulation if possible; consider left atrial appendage closure or antiplatelet per shared decision-making.', 'BP control; avoid antiplatelets when not clearly indicated.', 'Counsel on recurrence risk.'],
    };
  }

  if (input.pathologySupportingCAA) {
    return {
      diagnosis: 'probable-CAA-supporting-pathology',
      label: BOSTON_DIAGNOSIS_LABELS['probable-CAA-supporting-pathology'],
      criteriaMet: ['Pathological tissue (evacuated hematoma or cortical biopsy) showing CAA, no other diagnostic lesion.'],
      clinicalImplications: 'Probable CAA with pathological support. High recurrence risk; anticoagulation carries high ICH risk.',
      anticoagulationRisk: 'high',
      recommendations: ['Avoid anticoagulation if feasible; discuss alternatives.', 'BP control; minimize antiplatelet use unless indicated.', 'Counsel on recurrence risk.'],
    };
  }

  if (input.age < 50) {
    return unlikelyResult([`Age ${input.age} < 50 years; Boston 2.0 criteria require age ≥50 for probable/possible CAA.`]);
  }

  if (!input.hasQualifyingPresentation) {
    return unlikelyResult(['No qualifying presentation (spontaneous ICH, TFNE, or cognitive impairment/dementia).']);
  }

  const lobarCount = input.lobarHemorrhagicLesions; // 0, 1, or 2 (≥2)
  const hasDeep = input.deepHemorrhagicLesions;
  const hasWM = input.whiteMatterFeature;

  if (hasDeep && lobarCount === 0 && !hasWM) {
    return unlikelyResult(['Deep hemorrhagic lesions present; no lobar or white matter features. Strict criteria improve specificity; deep microbleeds can occur in ~15% of proven CAA.']);
  }

  if (hasDeep && lobarCount < 2 && !hasWM) { // lobarCount 2 means ≥2
    return unlikelyResult(['Deep hemorrhagic lesions present; Boston 2.0 requires absence of deep hemorrhagic lesions for probable/possible CAA (improves specificity).']);
  }

  if (lobarCount === 2 && !hasDeep) { // 2 = ≥2 lobar lesions
    return {
      diagnosis: 'probable-CAA',
      label: BOSTON_DIAGNOSIS_LABELS['probable-CAA'],
      criteriaMet: ['Age ≥50', 'Qualifying presentation', '≥2 strictly lobar hemorrhagic lesions (ICH, microbleeds, cortical superficial siderosis, or convexity SAH)', 'No deep hemorrhagic lesions', 'No other cause'],
      clinicalImplications: 'Probable CAA by imaging. High recurrence risk; anticoagulation significantly increases ICH risk.',
      anticoagulationRisk: 'high',
      recommendations: ['Avoid anticoagulation if possible; consider LAA closure or antiplatelet.', 'BP control; limit antiplatelet to clear indications.', 'Counsel on recurrence risk (e.g. ~5–10% per year).'],
    };
  }

  if (lobarCount >= 1 && hasWM && !hasDeep) { // 1 lobar + 1 white matter feature
    return {
      diagnosis: 'probable-CAA',
      label: BOSTON_DIAGNOSIS_LABELS['probable-CAA'],
      criteriaMet: ['Age ≥50', 'Qualifying presentation', 'One lobar hemorrhagic lesion + one white matter feature (severe centrum semiovale PVS or multispot WMH)', 'No deep hemorrhagic lesions', 'No other cause'],
      clinicalImplications: 'Probable CAA by imaging (lobar + white matter). High recurrence risk; anticoagulation carries high ICH risk.',
      anticoagulationRisk: 'high',
      recommendations: ['Avoid anticoagulation if feasible.', 'BP control; minimize antiplatelet use.', 'Counsel on recurrence risk.'],
    };
  }

  if (lobarCount >= 1 && !hasDeep) { // 1 lobar, no WM (possible CAA)
    return {
      diagnosis: 'possible-CAA',
      label: BOSTON_DIAGNOSIS_LABELS['possible-CAA'],
      criteriaMet: ['Age ≥50', 'Qualifying presentation', 'One strictly lobar hemorrhagic lesion', 'No deep hemorrhagic lesions', 'No other cause'],
      clinicalImplications: 'Possible CAA. Moderate recurrence risk; anticoagulation increases ICH risk.',
      anticoagulationRisk: 'moderate',
      recommendations: ['Shared decision-making for anticoagulation; consider HAS-BLED and stroke risk.', 'BP control.', 'Repeat MRI if TFNE or recurrent symptoms.'],
    };
  }

  if (hasWM && !hasDeep && lobarCount === 0) {
    return {
      diagnosis: 'possible-CAA',
      label: BOSTON_DIAGNOSIS_LABELS['possible-CAA'],
      criteriaMet: ['Age ≥50', 'Qualifying presentation', 'One white matter feature (severe centrum semiovale PVS or multispot WMH)', 'No deep hemorrhagic lesions', 'No other cause'],
      clinicalImplications: 'Possible CAA (white matter feature only). Lower sensitivity; consider CAA in differential.',
      anticoagulationRisk: 'moderate',
      recommendations: ['Consider CAA in differential; follow up for new hemorrhagic lesions.', 'Anticoagulation decision per stroke vs bleeding risk.'],
    };
  }

  return unlikelyResult(['Does not meet probable or possible CAA imaging criteria.']);
}
