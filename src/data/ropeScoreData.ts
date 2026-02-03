/**
 * RoPE Score - PFO-attributable fraction in cryptogenic stroke
 * Source: Kent DM, et al. An index to identify stroke-related vs incidental patent foramen ovale in cryptogenic stroke. Stroke. 2013;44(5):1449-1452.
 * Used for: Likelihood that PFO is causative; informs PFO closure discussion (RESPECT, CLOSE, REDUCE)
 */

export const ROPE_CITATION = {
  authors: 'Kent DM, Thaler DE',
  title: 'An index to identify stroke-related vs incidental patent foramen ovale in cryptogenic stroke',
  journal: 'Stroke',
  year: 2013,
  volume: 44,
  issue: 5,
  pages: '1449-1452',
  doi: '10.1161/STROKEAHA.111.000158',
};

export type RoPEAgeBand = 'under30' | '30_39' | '40_49' | '50_59' | '60_69' | '70plus';

export type RoPEInputs = {
  ageBand: RoPEAgeBand;
  noHypertension: boolean;
  noDiabetes: boolean;
  noPriorStrokeTIA: boolean;
  nonsmoker: boolean;
  corticalInfarct: boolean;
};

export interface ROPEResult {
  score: number;
  pfoAttributablePercent: number;
}

export const ROPE_AGE_POINTS: Record<RoPEAgeBand, number> = {
  under30: 5,
  '30_39': 4,
  '40_49': 3,
  '50_59': 2,
  '60_69': 1,
  '70plus': 0,
};

export const ROPE_AGE_OPTIONS: { value: RoPEAgeBand; label: string; points: number }[] = [
  { value: 'under30', label: '< 30 years', points: 5 },
  { value: '30_39', label: '30–39 years', points: 4 },
  { value: '40_49', label: '40–49 years', points: 3 },
  { value: '50_59', label: '50–59 years', points: 2 },
  { value: '60_69', label: '60–69 years', points: 1 },
  { value: '70plus', label: '≥ 70 years', points: 0 },
];

/** PFO-attributable fraction (%) by RoPE score - Kent et al. Stroke 2013 */
export const ROPE_PFO_ATTRIBUTABLE: Record<number, number> = {
  0: 0,
  1: 0,
  2: 0,
  3: 0,
  4: 38,
  5: 34,
  6: 62,
  7: 72,
  8: 84,
  9: 88,
  10: 88,
};

export function calculateROPEScore(inputs: RoPEInputs): ROPEResult {
  let score = ROPE_AGE_POINTS[inputs.ageBand];
  if (inputs.noHypertension) score += 1;
  if (inputs.noDiabetes) score += 1;
  if (inputs.noPriorStrokeTIA) score += 1;
  if (inputs.nonsmoker) score += 1;
  if (inputs.corticalInfarct) score += 1;

  const pfoAttributablePercent = ROPE_PFO_ATTRIBUTABLE[score] ?? 0;
  return { score, pfoAttributablePercent };
}
