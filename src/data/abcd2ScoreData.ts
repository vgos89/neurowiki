/**
 * ABCD² Score - TIA stroke risk prediction
 * Source: Johnston SC, et al. Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack. Lancet. 2007;369(9558):283-292.
 * Used for: 2-day (and 7-day, 90-day) stroke risk after TIA; triage admission vs urgent outpatient
 */

export const ABCD2_CITATION = {
  authors: 'Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al.',
  title: 'Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack',
  journal: 'Lancet',
  year: 2007,
  volume: 369,
  issue: 9558,
  pages: '283-292',
  doi: '10.1016/S0140-6736(07)60150-0',
};

export type ABCD2Inputs = {
  age: 'under60' | '60plus';
  bloodPressure: 'normal' | 'elevated';
  clinicalFeatures: 'weakness' | 'speech' | 'other';
  duration: 'under10' | '10to59' | '60plus';
  diabetes: boolean;
};

export type ABCD2Risk = 'low' | 'moderate' | 'high';

export interface ABCD2Result {
  score: number;
  risk: ABCD2Risk;
  twoDayRiskPercent: number;
}

export const ABCD2_AGE_OPTIONS = [
  { value: 'under60' as const, label: '< 60 years', points: 0 },
  { value: '60plus' as const, label: '≥ 60 years', points: 1 },
];

export const ABCD2_BP_OPTIONS = [
  { value: 'normal' as const, label: '< 140/90 mmHg', points: 0 },
  { value: 'elevated' as const, label: '≥ 140/90 mmHg', points: 1 },
];

export const ABCD2_CLINICAL_OPTIONS = [
  { value: 'weakness' as const, label: 'Unilateral weakness', points: 2 },
  { value: 'speech' as const, label: 'Speech impairment without weakness', points: 1 },
  { value: 'other' as const, label: 'Other', points: 0 },
];

export const ABCD2_DURATION_OPTIONS = [
  { value: '60plus' as const, label: '≥ 60 minutes', points: 2 },
  { value: '10to59' as const, label: '10–59 minutes', points: 1 },
  { value: 'under10' as const, label: '< 10 minutes', points: 0 },
];

export const ABCD2_TWO_DAY_RISK: Record<ABCD2Risk, number> = {
  low: 1.0,
  moderate: 4.1,
  high: 8.1,
};

export const ABCD2_RISK_LABELS: Record<ABCD2Risk, string> = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
};

export function calculateABCD2Score(inputs: ABCD2Inputs): ABCD2Result {
  let score = 0;
  if (inputs.age === '60plus') score += 1;
  if (inputs.bloodPressure === 'elevated') score += 1;
  if (inputs.clinicalFeatures === 'weakness') score += 2;
  else if (inputs.clinicalFeatures === 'speech') score += 1;
  if (inputs.duration === '60plus') score += 2;
  else if (inputs.duration === '10to59') score += 1;
  if (inputs.diabetes) score += 1;

  const risk: ABCD2Risk = score <= 3 ? 'low' : score <= 5 ? 'moderate' : 'high';
  const twoDayRiskPercent = ABCD2_TWO_DAY_RISK[risk];

  return { score, risk, twoDayRiskPercent };
}
