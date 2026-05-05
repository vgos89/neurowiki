/**
 * CHA₂DS₂-VASc Score — Stroke risk in non-valvular atrial fibrillation
 *
 * Primary source:
 *   Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ.
 *   Refining clinical risk stratification for predicting stroke and thromboembolism
 *   in atrial fibrillation using a novel risk factor-based approach: the Euro Heart
 *   Survey on Atrial Fibrillation. Chest. 2010;137(2):263-272.
 *   DOI: 10.1378/chest.09-1584
 *
 * Guideline: 2023 ACC/AHA/ACCP/HRS Guideline for Diagnosis and Management of Atrial
 * Fibrillation (Joglar JA et al. JACC 2024;83(1):109-279).
 *   DOI: 10.1016/j.jacc.2023.08.017
 *
 * Clinical intent:
 *   Score ≥2 (men) or ≥3 (women, i.e. ≥1 non-sex clinical risk factor + sex):
 *   anticoagulation recommended (COR 1). Clinical score = 1 (men score=1; women score=2
 *   from sex + one factor): anticoagulation is reasonable (COR 2a). Female sex alone
 *   (total score = 1, no other risk factors) does not confer net anticoagulation benefit.
 *
 * Sex-aware tier logic (per 2023 guideline):
 *   Recommendation tier is derived from the *clinical risk score* (CHA₂DS₂-VASc minus
 *   the female sex point). This ensures that women at total score=2 due to sex + one
 *   non-sex factor receive COR 2a ("is reasonable"), not COR 1 ("recommended") — the
 *   COR 1 threshold for women is total score ≥3 (= clinical score ≥2).
 */

export interface Cha2ds2VascInputs {
  /** Congestive heart failure / LV dysfunction — 1 pt */
  chf: boolean;
  /** Hypertension — 1 pt */
  hypertension: boolean;
  /** Age ≥75 — 2 pts (mutually exclusive with age65to74) */
  age75plus: boolean;
  /** Age 65–74 — 1 pt (mutually exclusive with age75plus) */
  age65to74: boolean;
  /** Diabetes mellitus — 1 pt */
  diabetes: boolean;
  /** Prior stroke / TIA / thromboembolism — 2 pts */
  strokeTia: boolean;
  /** Vascular disease (prior MI, PAD, aortic plaque) — 1 pt */
  vascularDisease: boolean;
  /** Female sex — 1 pt */
  female: boolean;
}

export type Cha2ds2VascRisk = 'very_low' | 'low_moderate' | 'moderate_high' | 'high';

export interface Cha2ds2VascResult {
  /** Total CHA₂DS₂-VASc score (0–9) */
  score: number;
  /**
   * Risk / recommendation tier, derived from clinical score (score minus sex point)
   * to implement the sex-stratified guideline thresholds correctly.
   */
  risk: Cha2ds2VascRisk;
  /** Approximate annual stroke rate per 100 patient-years (Lip 2010, Euro Heart Survey) */
  annualStrokeRate: number;
}

/**
 * Unadjusted annual stroke/thromboembolism rate per 100 patient-years by CHA₂DS₂-VASc
 * score. Lip GY et al. Chest. 2010;137(2):263-272, Table 3.
 * Note: the dip at score 7 (9.6% vs 9.8% at score 6) is a known artifact of the
 * original Euro Heart Survey cohort sample size; rates are reproduced as published.
 */
export const ANNUAL_STROKE_RATE: Record<number, number> = {
  0: 0,
  1: 1.3,
  2: 2.2,
  3: 3.2,
  4: 4.0,
  5: 6.7,
  6: 9.8,
  7: 9.6,
  8: 12.5,
  9: 15.2,
};

export const RISK_LABELS: Record<Cha2ds2VascRisk, string> = {
  very_low: 'Very low risk',
  low_moderate: 'Low-moderate risk',
  moderate_high: 'Moderate-high risk',
  high: 'High risk',
};

/**
 * Anticoagulation guidance per 2023 ACC/AHA/ACCP/HRS guideline
 * (Joglar JA et al. JACC 2024;83(1):109-279).
 *
 * Tier mapping (sex-aware, derived from clinical score):
 *   very_low     clinical score 0 → no anticoagulation
 *   low_moderate clinical score 1 → COR 2a: anticoagulation is reasonable
 *   moderate_high clinical score 2–3 → COR 1: anticoagulation recommended
 *   high         clinical score ≥4  → COR 1: anticoagulation recommended (elevated rate)
 */
export const RISK_GUIDANCE: Record<Cha2ds2VascRisk, string> = {
  very_low:
    'Anticoagulation not recommended. Address modifiable stroke risk factors.',
  low_moderate:
    'Anticoagulation is reasonable (COR 2a). Weigh stroke risk against bleeding risk in shared decision-making. DOAC preferred over warfarin if anticoagulation is initiated.',
  moderate_high:
    'Anticoagulation recommended (COR 1). DOAC preferred over warfarin for non-valvular AF.',
  high:
    'Anticoagulation recommended (COR 1). DOAC preferred. Substantially elevated annual stroke rate — prioritize anticoagulation and address modifiable bleeding risk factors.',
};

/**
 * Calculate CHA₂DS₂-VASc score and derive the sex-aware recommendation tier.
 *
 * The risk tier uses the *clinical score* (total score minus the female sex point)
 * to implement sex-stratified guideline thresholds:
 *   Men  ≥2  / Women ≥3  → COR 1 recommended   (clinical score ≥2)
 *   Men  = 1 / Women = 2 → COR 2a reasonable    (clinical score = 1)
 *   Men  = 0 / Women ≤1  → not recommended       (clinical score = 0)
 */
export function calculateCha2ds2Vasc(inputs: Cha2ds2VascInputs): Cha2ds2VascResult {
  let score = 0;
  if (inputs.chf) score += 1;
  if (inputs.hypertension) score += 1;
  if (inputs.age75plus) score += 2;
  else if (inputs.age65to74) score += 1;
  if (inputs.diabetes) score += 1;
  if (inputs.strokeTia) score += 2;
  if (inputs.vascularDisease) score += 1;
  if (inputs.female) score += 1;

  // Clinical score excludes the sex point — drives the sex-aware recommendation tier
  const clinicalScore = inputs.female ? score - 1 : score;

  const risk: Cha2ds2VascRisk =
    clinicalScore === 0
      ? 'very_low'
      : clinicalScore === 1
      ? 'low_moderate'
      : clinicalScore <= 3
      ? 'moderate_high'
      : 'high';

  const annualStrokeRate = ANNUAL_STROKE_RATE[Math.min(score, 9)] ?? 15.2;

  return { score, risk, annualStrokeRate };
}

export const PRIMARY_CITATION = {
  authors: 'Lip GY, Nieuwlaat R, Pisters R, Lane DA, Crijns HJ',
  title:
    'Refining clinical risk stratification for predicting stroke and thromboembolism in atrial fibrillation using a novel risk factor-based approach: the Euro Heart Survey on Atrial Fibrillation',
  journal: 'Chest',
  year: 2010,
  volume: 137,
  issue: 2,
  pages: '263-272',
  doi: '10.1378/chest.09-1584',
};

export const GUIDELINE_CITATION = {
  authors: 'Joglar JA, Chung MK, Armbruster AL, et al.',
  title:
    '2023 ACC/AHA/ACCP/HRS Guideline for Diagnosis and Management of Atrial Fibrillation',
  journal: 'J Am Coll Cardiol',
  year: 2024,
  volume: 83,
  issue: 1,
  pages: '109-279',
  doi: '10.1016/j.jacc.2023.08.017',
};
