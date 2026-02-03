/**
 * Heidelberg Bleeding Classification — hemorrhagic transformation after ischemic stroke and reperfusion therapy
 * Source: von Kummer R, et al. The Heidelberg Bleeding Classification. Stroke. 2015;46(10):2981-6.
 * Radiopaedia: https://radiopaedia.org/articles/heidelberg-bleeding-classification-1
 * Use: Post-tPA or post-thrombectomy hemorrhage classification (not for spontaneous ICH location).
 */

export const HEIDELBERG_CITATION = {
  authors: 'von Kummer R, Broderick J, Campbell B et al.',
  title: 'The Heidelberg Bleeding Classification',
  journal: 'Stroke',
  year: 2015,
  volume: 46,
  issue: 10,
  pages: '2981-2986',
  doi: '10.1161/strokeaha.115.010049',
};

export type HeidelbergClass =
  | '1a'   // HI1: scattered small petechiae, no mass effect
  | '1b'   // HI2: confluent petechiae, no mass effect
  | '1c'   // PH1: hematoma within infarct <30%, no substantive mass effect
  | '2'    // PH2: hematoma ≥30% infarct, obvious mass effect
  | '3a'   // parenchymal hematoma remote from infarct
  | '3b'   // IVH
  | '3c'   // SAH
  | '3d';  // SDH

export type HeidelbergInputs = {
  bleedingClass: HeidelbergClass;
  symptomatic?: boolean; // SICH vs aSICH: neurologic deterioration attributable to hemorrhage
};

export interface HeidelbergResult {
  classification: string;
  shortLabel: string;
  clinicalSignificance: string;
  managementNote: string;
}

export const HEIDELBERG_OPTIONS: { value: HeidelbergClass; label: string; description: string }[] = [
  { value: '1a', label: 'Class 1a (HI1)', description: 'Scattered small petechiae, no mass effect' },
  { value: '1b', label: 'Class 1b (HI2)', description: 'Confluent petechiae, no mass effect' },
  { value: '1c', label: 'Class 1c (PH1)', description: 'Hematoma within infarct <30%, no substantive mass effect' },
  { value: '2', label: 'Class 2 (PH2)', description: 'Hematoma ≥30% of infarct, obvious mass effect' },
  { value: '3a', label: 'Class 3a', description: 'Parenchymal hematoma remote from infarct' },
  { value: '3b', label: 'Class 3b', description: 'Intraventricular hemorrhage' },
  { value: '3c', label: 'Class 3c', description: 'Subarachnoid hemorrhage' },
  { value: '3d', label: 'Class 3d', description: 'Subdural hemorrhage' },
];

const RESULT_MAP: Record<HeidelbergClass, HeidelbergResult> = {
  '1a': {
    classification: 'Class 1a (HI1)',
    shortLabel: '1a',
    clinicalSignificance: 'Hemorrhagic infarction type 1: scattered small petechiae within infarcted tissue, no mass effect. Unlikely relatedness to reperfusion therapy.',
    managementNote: 'Asymptomatic HT; typically no change in management. Imaging within 48h of reperfusion and as needed for new symptoms.',
  },
  '1b': {
    classification: 'Class 1b (HI2)',
    shortLabel: '1b',
    clinicalSignificance: 'Hemorrhagic infarction type 2: confluent petechiae, no mass effect. Possible relatedness to reperfusion if symptomatic.',
    managementNote: 'Monitor; if symptomatic (SICH), consider possible relatedness to intervention. No routine reversal for HI alone.',
  },
  '1c': {
    classification: 'Class 1c (PH1)',
    shortLabel: '1c',
    clinicalSignificance: 'Parenchymal hematoma within infarcted tissue, <30% of infarct, no substantive mass effect. Probable relatedness if within 24h of treatment.',
    managementNote: 'If symptomatic or treatment within 24h, classify relatedness. Consider BP control per protocol.',
  },
  '2': {
    classification: 'Class 2 (PH2)',
    shortLabel: '2',
    clinicalSignificance: 'Parenchymal hematoma occupying ≥30% of infarct with obvious mass effect. Definite/probable relatedness to reperfusion when symptomatic.',
    managementNote: 'Symptomatic PH2 often drives deterioration. BP control, ICP monitoring as indicated; neurosurgery consult if mass effect.',
  },
  '3a': {
    classification: 'Class 3a',
    shortLabel: '3a',
    clinicalSignificance: 'Parenchymal hematoma remote from infarcted brain tissue. Possible relatedness to reperfusion.',
    managementNote: 'Remote hemorrhage; exclude procedural complication (e.g. vessel perforation). Imaging and neurologic monitoring.',
  },
  '3b': {
    classification: 'Class 3b (IVH)',
    shortLabel: '3b',
    clinicalSignificance: 'Intraventricular hemorrhage. Possible relatedness to reperfusion; consider extension from parenchymal hemorrhage.',
    managementNote: 'Assess for hydrocephalus; EVD if indicated. Monitor for worsening.',
  },
  '3c': {
    classification: 'Class 3c (SAH)',
    shortLabel: '3c',
    clinicalSignificance: 'Subarachnoid hemorrhage. Possible relatedness; distinguish from aneurysm rupture if convexity/circumstantial.',
    managementNote: 'Convexity SAH may be CAA-related; if post-reperfusion, possible relatedness. Vascular imaging if not already done.',
  },
  '3d': {
    classification: 'Class 3d (SDH)',
    shortLabel: '3d',
    clinicalSignificance: 'Subdural hemorrhage. Possible relatedness; consider trauma or coagulopathy.',
    managementNote: 'Assess for mass effect and surgical indication. Review anticoagulation and antiplatelet use.',
  },
};

export function classifyHeidelbergBleeding(input: HeidelbergInputs): HeidelbergResult {
  const base = RESULT_MAP[input.bleedingClass];
  return {
    ...base,
    managementNote: input.symptomatic
      ? `${base.managementNote} Symptomatic ICH (SICH): consider ≥4 pt NIHSS increase or ≥2 pt in one subcategory or intervention (intubation, hemicraniectomy, EVD); document relatedness to reperfusion.`
      : base.managementNote,
  };
}
