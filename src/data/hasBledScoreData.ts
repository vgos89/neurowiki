/**
 * HAS-BLED Score - Major bleeding risk on anticoagulation
 * Source: Pisters R, et al. A novel user-friendly score (HAS-BLED) to assess 1-year risk of major bleeding in patients with atrial fibrillation. Chest. 2010;138(5):1093-1100.
 * Risk tiers (3-tier, per Pisters 2010 and standard AF guidance): low 0-1, moderate 2, high >=3.
 * Per-score bleeding rates are taken from the HAS-BLED column of Table 5. Scores >=5 have too few
 * patients for a stable per-score rate and are reported as one aggregate high-risk band (see below).
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

export type HASBLEDRisk = 'low' | 'moderate' | 'high';

export interface HASBLEDResult {
  score: number;
  risk: HASBLEDRisk;
  bleedsPer100PatientYears: number;
  /** True when the score is >=5, where the displayed rate is an aggregate high-risk floor, not a measured per-score rate. */
  rateIsAggregateBand: boolean;
}

/**
 * Major bleeding events per 100 patient-years, HAS-BLED column of Pisters et al. Chest 2010, Table 5.
 * Verbatim source values (No. patients / No. bleeds / rate per 100 py):
 *   0: 798 / 9  -> 1.13
 *   1: 1,286 / 13 -> 1.02
 *   2: 744 / 14 -> 1.88
 *   3: 187 / 7  -> 3.74
 *   4: 46 / 4   -> 8.70
 *   5: 8 / 1    -> 12.50 (single event; not a stable rate)
 *   6: 2 / 0    -> 0.0   (no events in 2 patients; not interpretable)
 *   7-9: 0 patients -> no data (reported as "..." in the source)
 *
 * Scores 0-4 use the measured, monotonically increasing derivation-cohort rates.
 * Scores >=5 are reported here as a single aggregate high-risk band. The source per-score
 * values above 4 are unreliable (score 5 rests on one event; score 6 on zero events in two
 * patients; scores 7-9 have no patients). Displaying them verbatim would be misleading and
 * non-monotonic (e.g. score 6 = 0.0). The band therefore uses the score-4 rate (8.70) as a
 * floor and is flagged via HASBLEDResult.rateIsAggregateBand so callers can label it as a
 * ">=5, high risk" band rather than a precise per-score estimate.
 */
export const HASBLED_BLEEDS_PER_100: Record<number, number> = {
  0: 1.13,
  1: 1.02,
  2: 1.88,
  3: 3.74,
  4: 8.70,
};

/** Floor rate for the aggregate score >=5 high-risk band (Pisters 2010 score-4 rate). */
export const HASBLED_HIGH_BAND_FLOOR = 8.70;

export const HASBLED_RISK_LABELS: Record<HASBLEDRisk, string> = {
  low: 'Low risk',
  moderate: 'Moderate risk',
  high: 'High risk',
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

  // 3-tier scheme (Pisters 2010; standard AF guidance): low 0-1, moderate 2, high >=3.
  const risk: HASBLEDRisk = score <= 1 ? 'low' : score === 2 ? 'moderate' : 'high';

  // Scores 0-4 use measured per-score rates; scores >=5 use the aggregate high-risk floor.
  const rateIsAggregateBand = score >= 5;
  const bleedsPer100PatientYears = rateIsAggregateBand
    ? HASBLED_HIGH_BAND_FLOOR
    : HASBLED_BLEEDS_PER_100[score] ?? HASBLED_HIGH_BAND_FLOOR;

  return { score, risk, bleedsPer100PatientYears, rateIsAggregateBand };
}
