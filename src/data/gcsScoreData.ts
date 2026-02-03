/**
 * Glasgow Coma Scale (GCS) - Level of consciousness
 * Source: Teasdale G, Jennett B. Assessment of coma and impaired consciousness. Lancet. 1974;2(7872):81-84.
 * Used in: trauma, neuro ICU, ICH Score, stroke severity communication
 */

export const GCS_CITATION = {
  authors: 'Teasdale G, Jennett B',
  title: 'Assessment of coma and impaired consciousness',
  journal: 'Lancet',
  year: 1974,
  volume: 2,
  issue: 7872,
  pages: '81-84',
  doi: '10.1016/S0140-6736(74)91639-0',
};

export type GCSInputs = {
  eye: 1 | 2 | 3 | 4;
  verbal: 1 | 2 | 3 | 4 | 5;
  motor: 1 | 2 | 3 | 4 | 5 | 6;
  verbalNotTestable?: boolean;
  eyeNotTestable?: boolean;
};

export type GCSSeverity = 'mild' | 'moderate' | 'severe' | 'deep_coma';

export interface GCSResult {
  total: number;
  display: string;
  severity: GCSSeverity;
  eye: number;
  verbal: number | 'T';
  motor: number;
}

export const GCS_EYE_OPTIONS = [
  { value: 4 as const, label: '4', description: 'Spontaneous' },
  { value: 3 as const, label: '3', description: 'To verbal command' },
  { value: 2 as const, label: '2', description: 'To pain' },
  { value: 1 as const, label: '1', description: 'None' },
];

export const GCS_VERBAL_OPTIONS = [
  { value: 5 as const, label: '5', description: 'Oriented' },
  { value: 4 as const, label: '4', description: 'Confused conversation' },
  { value: 3 as const, label: '3', description: 'Inappropriate words' },
  { value: 2 as const, label: '2', description: 'Incomprehensible sounds' },
  { value: 1 as const, label: '1', description: 'None' },
];

export const GCS_MOTOR_OPTIONS = [
  { value: 6 as const, label: '6', description: 'Obeys commands' },
  { value: 5 as const, label: '5', description: 'Localizes to pain' },
  { value: 4 as const, label: '4', description: 'Withdraws from pain' },
  { value: 3 as const, label: '3', description: 'Abnormal flexion (decorticate)' },
  { value: 2 as const, label: '2', description: 'Abnormal extension (decerebrate)' },
  { value: 1 as const, label: '1', description: 'None' },
];

export const GCS_SEVERITY_LABELS: Record<GCSSeverity, string> = {
  mild: 'Mild impairment (14–15)',
  moderate: 'Moderate impairment (9–13)',
  severe: 'Severe impairment / coma (3–8)',
  deep_coma: 'Deep coma (3)',
};

export function calculateGCS(inputs: GCSInputs): GCSResult {
  const eye = inputs.eyeNotTestable ? 0 : inputs.eye;
  const verbalNum = inputs.verbalNotTestable ? 0 : inputs.verbal;
  const motor = inputs.motor;

  const total = eye + verbalNum + motor;
  const display = inputs.verbalNotTestable
    ? `${inputs.eye + inputs.motor}T`
    : inputs.eyeNotTestable
      ? `E=C V${inputs.verbal} M${inputs.motor}`
      : String(total);

  let severity: GCSSeverity =
    total >= 14 ? 'mild' : total >= 9 ? 'moderate' : total >= 4 ? 'severe' : 'deep_coma';
  if (total === 3) severity = 'deep_coma';

  return {
    total: inputs.verbalNotTestable ? inputs.eye + inputs.motor : total,
    display,
    severity,
    eye: inputs.eye,
    verbal: inputs.verbalNotTestable ? 'T' : inputs.verbal,
    motor,
  };
}
