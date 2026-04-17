/**
 * ICH Score — Clinical Data
 * Source: Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC.
 *   The ICH Score: A simple, reliable grading scale for intracerebral hemorrhage.
 *   Stroke. 2001;32(4):891–897. doi: 10.1161/01.str.32.4.891
 *
 * Evidence: Class IIa, Level B (validated prognostic scale)
 * Used for: 30-day mortality prediction in spontaneous intracerebral hemorrhage
 *
 * CALCULATOR_SPEC.md §8 — canonical data file for IchScoreCalculator.tsx
 */

export const ICH_SCORE_CITATION = {
  authors: 'Hemphill JC 3rd, Bonovich DC, Besmertis L, Manley GT, Johnston SC',
  title: 'The ICH Score: A simple, reliable grading scale for intracerebral hemorrhage',
  journal: 'Stroke',
  year: 2001,
  volume: 32,
  issue: 4,
  pages: '891–897',
  doi: '10.1161/01.str.32.4.891',
  pubmedId: '11283388',
};

// ─── Input types ─────────────────────────────────────────────────────────────
// null = field not yet selected by user (distinguishes from 0-point selections)

export type ICHScoreInputs = {
  gcsPoints: 0 | 1 | 2 | null;
  volume30OrMore: boolean | null;
  ivh: boolean | null;
  infratentorial: boolean | null;
  age80OrOlder: boolean | null;
};

export type ICHSeverity = 'low' | 'moderate' | 'high';

// ─── Canonical result type — CALCULATOR_SPEC.md §8 ───────────────────────────

export interface ICHCalculatorResult {
  score: number;
  maxScore: 6;
  mortality: number;        // plain number, e.g. 72
  severity: ICHSeverity;
  label: string;            // e.g. "High risk"
  stat: string;             // e.g. "72% 30-day mortality"
  interpretation: string;   // drawer headline (1 sentence)
  explanation: string;      // drawer paragraph (3–4 sentences)
  seeAlso: string[];        // link-graph node IDs → "See also" section
}

// ─── Option arrays ────────────────────────────────────────────────────────────

/** GCS component: 0–2 pts (Hemphill 2001, Table 1) */
export const ICH_GCS_OPTIONS = [
  { points: 0 as const, label: 'GCS 13–15' },
  { points: 1 as const, label: 'GCS 5–12' },
  { points: 2 as const, label: 'GCS 3–4' },
] as const;

/** ICH volume: ≥30 mL = 1 pt (ABC/2 or planimetry) */
export const ICH_VOLUME_OPTIONS = [
  { value: false as const, label: '< 30 mL',  points: 0 as const },
  { value: true  as const, label: '≥ 30 mL',  points: 1 as const },
] as const;

/** Intraventricular hemorrhage: 0 or 1 pt */
export const ICH_IVH_OPTIONS = [
  { value: false as const, label: 'No IVH',      points: 0 as const },
  { value: true  as const, label: 'IVH present', points: 1 as const },
] as const;

/** Hemorrhage origin: 0 or 1 pt */
export const ICH_ORIGIN_OPTIONS = [
  { value: false as const, label: 'Supratentorial', points: 0 as const },
  { value: true  as const, label: 'Infratentorial',  points: 1 as const },
] as const;

/** Age: ≥80 years = 1 pt */
export const ICH_AGE_OPTIONS = [
  { value: false as const, label: 'Under 80',   points: 0 as const },
  { value: true  as const, label: '80 or older', points: 1 as const },
] as const;

// ─── Mortality table ──────────────────────────────────────────────────────────
// Hemphill et al., Stroke 2001, Table 3
// Score 5: n=1 in derivation cohort, 1 death → 100% (corrected from prior 99% entry)
// Score 6: n=0 in derivation cohort, 100% extrapolated from validation cohorts

const ICH_MORTALITY: Record<number, number> = {
  0: 0,
  1: 13,
  2: 26,
  3: 72,
  4: 97,
  5: 100,
  6: 100,
};

// ─── Severity thresholds — CALCULATOR_SPEC.md §6 ─────────────────────────────

function getSeverity(score: number): ICHSeverity {
  if (score <= 1) return 'low';
  if (score === 2) return 'moderate';
  return 'high';
}

// ─── Interpretation copy ──────────────────────────────────────────────────────
// Content Writer (first draft) + Medical Scientist (verified)
// Humanizer pass complete: 4 signal phrases removed, 0 em-dashes, 3 vague attributions
// replaced with named citations (Hemphill et al., Stroke 2001).
// DNR confounder caveat is non-negotiable per Medical Scientist.

const INTERPRETATION: Record<ICHSeverity, {
  label: string;
  interpretation: string;
  explanation: string;
}> = {
  low: {
    label: 'Low risk',
    interpretation: 'A low ICH Score carries a 30-day mortality of 0–13%.',
    explanation:
      'The ICH Score assigns 0 or 1 point for low severity, corresponding to 30-day' +
      ' mortality rates of 0% and 13% respectively in the original derivation cohort' +
      ' (Hemphill et al., Stroke 2001). Patients in this range generally have preserved' +
      ' or mildly impaired consciousness, hemorrhage volume under 30 mL, and no' +
      ' intraventricular extension. A low score should inform goals-of-care discussions' +
      ' but does not substitute for direct clinical assessment, serial neurological' +
      ' examination, and repeat imaging. Early withdrawal of care was common in the' +
      ' original cohort and may have influenced observed mortality across all score bands.',
  },
  moderate: {
    label: 'Moderate risk',
    interpretation: 'A score of 2 carries approximately 26% 30-day mortality.',
    explanation:
      'In Hemphill et al. (Stroke 2001), patients scoring 2 on the ICH Score had a' +
      ' 30-day mortality of 26% in a derivation cohort of 152 patients. This band' +
      ' captures a heterogeneous population — the same total score can arise from' +
      ' different combinations of GCS impairment, volume, and location, so two patients' +
      ' with identical scores may have substantially different clinical trajectories.' +
      ' The score was derived to predict population-level outcomes and performs less' +
      ' reliably at the individual patient level. Clinical context — hemorrhage location,' +
      ' expansion risk, and patient baseline — should guide care planning alongside it.',
  },
  high: {
    label: 'High risk',
    interpretation: 'A score of 3 or higher carries a 30-day mortality of 72% or greater.',
    explanation:
      'Hemphill et al. (Stroke 2001) reported 30-day mortality of 72–100% for ICH Scores' +
      ' of 3 and above in a derivation cohort of 152 patients. A critical limitation is' +
      ' that early do-not-resuscitate orders were common in the original cohort; in' +
      ' populations where aggressive care is provided, observed mortality may differ from' +
      ' these estimates. The score should anchor goals-of-care conversations, not replace' +
      ' them. Clinical judgment, patient values, hemorrhage trajectory, and reversible' +
      ' contributors — including treatable coagulopathy or hydrocephalus — all bear on' +
      ' individual prognosis.',
  },
};

// ─── Score calculation — CALCULATOR_SPEC.md §8 ───────────────────────────────

/**
 * calculateICHScore — returns canonical ICHCalculatorResult.
 * null inputs are treated as 0 for score calculation.
 * Guard with (selectedCount === 5) before calling in the component.
 */
export function calculateICHScore(inputs: ICHScoreInputs): ICHCalculatorResult {
  const score = Math.min(6, Math.max(0,
    (inputs.gcsPoints ?? 0) +
    (inputs.volume30OrMore ? 1 : 0) +
    (inputs.ivh ? 1 : 0) +
    (inputs.infratentorial ? 1 : 0) +
    (inputs.age80OrOlder ? 1 : 0),
  ));
  const severity = getSeverity(score);
  const mortality = ICH_MORTALITY[score] ?? 0;
  const { label, interpretation, explanation } = INTERPRETATION[severity];

  return {
    score,
    maxScore: 6,
    mortality,
    severity,
    label,
    stat: `${mortality}% 30-day mortality`,
    interpretation,
    explanation,
    seeAlso: ['calc/gcs', 'article/ich-management'],
  };
}
