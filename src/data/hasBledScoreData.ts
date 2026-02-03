/**
 * HAS-BLED Score - Major bleeding risk on anticoagulation
 * Source: Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-1100.
 * Note: High score does NOT mean withhold anticoagulation; address modifiable risks and monitor.
 */

export const HASBLED_CITATION = {
  authors: 'Pisters R, Lane DA, Nieuwlaat R, de Vos CB, Crijns HJ, Lip GY',
  title: 'A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation',
  journal: 'Chest',
  year: 2010,
  volume: 138,
  issue: 5,
  pages: '1093-1100',
  doi: '10.1378/chest.10-0134',
};

export type HASBLEDInputs = {
  hypertension: boolean;
  abnormalRenal: boolean;
  abnormalLiver: boolean;
  strokeHistory: boolean;
  priorBleeding: boolean;
  onWarfarin: boolean;
  labileINR: boolean;
  elderly: boolean;
  drugs: boolean;
  alcohol: boolean;
};

export type HASBLEDRisk = 'low' | 'moderate' | 'high' | 'very_high';

export interface HASBLEDResult {
  score: number;
  risk: HASBLEDRisk;
  bleedsPer100PatientYears: number;
}

/** Major bleeding events per 100 patient-years (Pisters et al. Chest 2010) */
export const HASBLED_BLEEDS_PER_100: Record<number, number> = {
  0: 1.13,
  1: 1.02,
  2: 1.88,
  3: 3.74,
  4: 8.70,
  5: 8.70,
  6: 8.70,
  7: 8.70,
  8: 8.70,
  9: 8.70,
};

export const HASBLED_RISK_LABELS: Record<HASBLEDRisk, string> = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
  very_high: 'Very high risk',
};

export function calculateHASBLEDScore(inputs: HASBLEDInputs): HASBLEDResult {
  let score = 0;
  if (inputs.hypertension) score += 1;
  if (inputs.abnormalRenal) score += 1;
  if (inputs.abnormalLiver) score += 1;
  if (inputs.strokeHistory) score += 1;
  if (inputs.priorBleeding) score += 1;
  if (inputs.onWarfarin && inputs.labileINR) score += 1;
  if (inputs.elderly) score += 1;
  if (inputs.drugs) score += 1;
  if (inputs.alcohol) score += 1;

  const risk: HASBLEDRisk =
    score === 0 ? 'low' : score <= 2 ? 'moderate' : score === 3 ? 'high' : 'very_high';
  const bleedsPer100PatientYears = HASBLED_BLEEDS_PER_100[Math.min(score, 9)] ?? 8.70;

  return { score, risk, bleedsPer100PatientYears };
}
