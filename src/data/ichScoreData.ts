/**
 * ICH Score - Clinical specification
 * Source: Hemphill JC 3rd, et al. The ICH Score: A simple, reliable grading scale for intracerebral hemorrhage.
 * Stroke. 2001;32(4):891-897. doi: 10.1161/01.str.32.4.891
 *
 * Evidence: Class IIa, Level B (validated prognostic scale)
 * Used for: 30-day mortality prediction in spontaneous intracerebral hemorrhage
 */

export const ICH_SCORE_CITATION = {
  authors: 'Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC',
  title: 'The ICH Score: A simple, reliable grading scale for intracerebral hemorrhage',
  journal: 'Stroke',
  year: 2001,
  volume: 32,
  issue: 4,
  pages: '891-897',
  doi: '10.1161/01.str.32.4.891',
  pubmedId: '11283388',
};

/** GCS component: 0–2 points */
export const ICH_GCS_OPTIONS = [
  { value: 0, label: '13–15', description: 'Mild impairment', points: 0 },
  { value: 1, label: '5–12', description: 'Moderate impairment', points: 1 },
  { value: 2, label: '3–4', description: 'Severe impairment', points: 2 },
] as const;

/** ICH volume: 0 or 1 point. ≥30 mL = 1 point. */
export const ICH_VOLUME_THRESHOLD = 30; // mL
export const ICH_VOLUME_OPTIONS = [
  { value: false, label: '< 30 mL', points: 0 },
  { value: true, label: '≥ 30 mL', points: 1 },
] as const;

/** IVH: 0 or 1 point */
export const ICH_IVH_OPTIONS = [
  { value: false, label: 'No', points: 0 },
  { value: true, label: 'Yes', points: 1 },
] as const;

/** Infratentorial origin: 0 or 1 point */
export const ICH_ORIGIN_OPTIONS = [
  { value: 'supratentorial', label: 'Supratentorial', points: 0 },
  { value: 'infratentorial', label: 'Infratentorial', points: 1 },
] as const;

/** Age: 0 or 1 point. ≥80 years = 1 point. */
export const ICH_AGE_THRESHOLD = 80;
export const ICH_AGE_OPTIONS = [
  { value: false, label: '< 80 years', points: 0 },
  { value: true, label: '≥ 80 years', points: 1 },
] as const;

/**
 * 30-day mortality by ICH Score (0–6)
 * Hemphill et al. Stroke 2001
 */
export const ICH_MORTALITY_BY_SCORE: Record<number, number> = {
  0: 0,
  1: 13,
  2: 26,
  3: 72,
  4: 97,
  5: 99,
  6: 100,
};

export const ICH_SEVERITY_LABELS: Record<number, string> = {
  0: 'Very low risk',
  1: 'Low risk',
  2: 'Moderate risk',
  3: 'High risk',
  4: 'Very high risk',
  5: 'Very high risk',
  6: 'Very high risk',
};

export type ICHScoreInputs = {
  gcsPoints: 0 | 1 | 2;
  volume30OrMore: boolean; // true = ≥30 mL = 1 pt
  ivh: boolean;
  infratentorial: boolean;
  age80OrOlder: boolean; // true = ≥80 years = 1 pt
};

export function calculateICHScore(inputs: ICHScoreInputs): number {
  let score = 0;
  score += inputs.gcsPoints;
  score += inputs.volume30OrMore ? 1 : 0;
  score += inputs.ivh ? 1 : 0;
  score += inputs.infratentorial ? 1 : 0;
  score += inputs.age80OrOlder ? 1 : 0;
  return Math.min(6, Math.max(0, score));
}

