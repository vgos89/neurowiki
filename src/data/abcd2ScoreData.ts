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

// ─── Canonical CALCULATOR_SPEC.md v1.1 §8 exports ────────────────────────────
// Additive: exports above are preserved byte-for-byte. Added 2026-04-21 for the
// Archetype 1 rebuild of Abcd2ScoreCalculator.tsx.

export type ABCD2Severity = ABCD2Risk;

/**
 * Per-tier action directives — relocated byte-for-byte from the pre-rebuild
 * Abcd2ScoreCalculator.tsx inline JSX (lines 147–149 of the pre-rebuild file).
 * Not new prose; preserved text.
 */
// AHA/ASA 2026 §4.8 daptForMinorAIS Rec 1 (COR 1, LOE A): high-risk TIA
// (ABCD² ≥4) within 24h who do NOT receive IVT should be started on DAPT
// (clopidogrel + aspirin with loading dose) for 21 days then SAPT.
// Source trials: CHANCE, POINT, INSPIRES. Added 2026-05-22 per audit
// BLOCKING abcd2-dapt-cross-reference; the explanations now surface the
// DAPT recommendation rather than implying observation alone.
const ABCD2_DRAWER_EXPLANATION: Record<ABCD2Risk, string> = {
  low: 'Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score. DAPT is not indicated below ABCD2 4; single antiplatelet therapy is appropriate for this tier.',
  moderate: 'ABCD2 score 4-5 meets the guideline threshold for high-risk TIA (ABCD2 ≥4). Start DAPT within 24h × 21 days (clopidogrel + aspirin, loading dose) then SAPT per AHA/ASA 2026 §4.8 (COR 1, LOE A; CHANCE/POINT/INSPIRES). Consider admission or same-day urgent evaluation for workup.',
  high: 'High-risk TIA. Start DAPT within 24h × 21 days (clopidogrel + aspirin, loading dose) then SAPT per AHA/ASA 2026 §4.8 (COR 1, LOE A; CHANCE/POINT/INSPIRES). Admit for workup and stroke prevention.',
};

/**
 * Canonical calculator result shape per CALCULATOR_SPEC.md §8. Wraps
 * ABCD2Result with drawer-anatomy fields. `severity` is a type alias of
 * `risk` — ABCD² encodes severity in its validated risk tiers (Johnston et al.
 * Lancet 2007); no new clinical categorization is introduced by the wrapper.
 */
export interface ABCD2CalculatorResult {
  score: number;
  maxScore: 7;
  risk: ABCD2Risk;
  severity: ABCD2Severity;
  twoDayRiskPercent: number;
  label: string;
  stat: string;
  interpretation: string;
  explanation: string;
  seeAlso: string[];
}

/**
 * calculateABCD2 — canonical calculator function per §8.
 * Delegates to calculateABCD2Score() for the score and risk tier. Adds label,
 * stat, interpretation, explanation. All clinical strings are drawn from
 * existing exports (ABCD2_RISK_LABELS, ABCD2_TWO_DAY_RISK) or the relocated
 * pre-rebuild component text in ABCD2_DRAWER_EXPLANATION.
 */
export function calculateABCD2(inputs: ABCD2Inputs): ABCD2CalculatorResult {
  const base = calculateABCD2Score(inputs);
  const label = ABCD2_RISK_LABELS[base.risk];
  return {
    score: base.score,
    maxScore: 7,
    risk: base.risk,
    severity: base.risk,
    twoDayRiskPercent: base.twoDayRiskPercent,
    label,
    stat: `${base.twoDayRiskPercent}%`,
    interpretation: `${label} · 2-day stroke risk: ${base.twoDayRiskPercent}%.`,
    explanation: ABCD2_DRAWER_EXPLANATION[base.risk],
    seeAlso: [],
  };
}
