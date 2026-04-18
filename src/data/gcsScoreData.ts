/**
 * Glasgow Coma Scale (GCS) — Clinical Data
 * Source: Teasdale G, Jennett B. Assessment of coma and impaired consciousness:
 *   a practical scale. Lancet. 1974;2(7872):81–84.
 *   doi: 10.1016/S0140-6736(74)91639-0   PMID: 4136544
 *
 * Severity thresholds: ACRM 1993 (mild TBI ≥13), Teasdale & Jennett 1974 consensus.
 * T suffix: verbal not testable (intubated) — Teasdale & Jennett 1974.
 * GCS uses an inverse scale: lower score = worse impairment.
 *
 * CALCULATOR_SPEC.md §8 — canonical data file for GlasgowComaScaleCalculator.tsx
 */

export const GCS_CITATION = {
  authors: 'Teasdale G, Jennett B',
  title: 'Assessment of coma and impaired consciousness: a practical scale',
  journal: 'Lancet',
  year: 1974,
  volume: 2,
  issue: 7872,
  pages: '81–84',
  doi: '10.1016/S0140-6736(74)91639-0',
  pubmedId: '4136544',
};

// ─── Input types ─────────────────────────────────────────────────────────────
// null = field not yet selected (distinguishes from minimum score selections)

export type GCSInputs = {
  eye: 1 | 2 | 3 | 4 | null;
  verbal: 1 | 2 | 3 | 4 | 5 | null;
  motor: 1 | 2 | 3 | 4 | 5 | 6 | null;
  eyeNotTestable: boolean;
  verbalNotTestable: boolean;
};

export type GCSSeverity = 'low' | 'moderate' | 'high';

// ─── Canonical result type — CALCULATOR_SPEC.md §8 ───────────────────────────

export interface GCSResult {
  total: number;          // numeric GCS total (verbal = 0 when NT)
  display: string;        // e.g. "12" or "9T" for verbal-not-testable
  severity: GCSSeverity;
  label: string;          // e.g. "Mild impairment"
  stat: string;           // e.g. "GCS 13–15" — drawer header right side
  interpretation: string; // drawer headline (1 sentence)
  explanation: string;    // drawer paragraph (3–4 sentences)
  seeAlso: string[];      // link-graph node IDs → "See also" section
  eye: number;
  verbal: number | 'T';
  motor: number;
}

// ─── Option arrays ────────────────────────────────────────────────────────────

/** Eye opening: 4–1 pts (Teasdale & Jennett 1974, Table 1) */
export const GCS_EYE_OPTIONS = [
  { value: 4 as const, label: 'Opens spontaneously' },
  { value: 3 as const, label: 'Opens to voice' },
  { value: 2 as const, label: 'Opens to pain' },
  { value: 1 as const, label: 'No eye opening' },
] as const;

/** Verbal response: 5–1 pts (Teasdale & Jennett 1974, Table 1) */
export const GCS_VERBAL_OPTIONS = [
  { value: 5 as const, label: 'Oriented, converses normally' },
  { value: 4 as const, label: 'Confused, disoriented conversation' },
  { value: 3 as const, label: 'Inappropriate words only' },
  { value: 2 as const, label: 'Incomprehensible sounds' },
  { value: 1 as const, label: 'No verbal response' },
] as const;

/** Motor response: 6–1 pts (Teasdale & Jennett 1974, Table 1) */
export const GCS_MOTOR_OPTIONS = [
  { value: 6 as const, label: 'Follows commands' },
  { value: 5 as const, label: 'Localizes to pain' },
  { value: 4 as const, label: 'Withdraws from pain' },
  { value: 3 as const, label: 'Abnormal flexion (decorticate)' },
  { value: 2 as const, label: 'Abnormal extension (decerebrate)' },
  { value: 1 as const, label: 'No motor response' },
] as const;

// ─── Severity thresholds — CALCULATOR_SPEC.md §6 ─────────────────────────────
// Source: Teasdale & Jennett 1974; ACRM 1993 (mild TBI: GCS 13–15).
// Threshold 13 (not 14): per ACRM 1993 and established neurology consensus.

function getSeverity(total: number): GCSSeverity {
  if (total >= 13) return 'low';
  if (total >= 9)  return 'moderate';
  return 'high';
}

// ─── Interpretation copy ──────────────────────────────────────────────────────
// Medical Scientist verified (2026-04-17).
// Humanizer pass complete: 0 em-dashes, named citations throughout,
// 0 vague attributions. T-suffix and sedation-confounder caveats are
// non-negotiable per Medical Scientist.

const INTERPRETATION: Record<GCSSeverity, {
  label: string;
  stat: string;
  interpretation: string;
  explanation: string;
}> = {
  low: {
    label: 'Mild impairment',
    stat: 'GCS 13–15',
    interpretation: 'A GCS of 13–15 indicates mild impairment of consciousness.',
    explanation:
      'Teasdale and Jennett (Lancet 1974) defined this range as mildly impaired wakefulness and' +
      ' responsiveness. The American Congress of Rehabilitation Medicine (ACRM 1993) placed GCS' +
      ' 13–15 at presentation as the threshold for mild traumatic brain injury. A score in this' +
      ' range does not rule out serious intracranial pathology — CT imaging decisions rest on' +
      ' clinical context, not GCS alone. Serial reassessment matters: evolving hemorrhage or' +
      ' edema can drive rapid deterioration despite a reassuring initial score.',
  },
  moderate: {
    label: 'Moderate impairment',
    stat: 'GCS 9–12',
    interpretation: 'A GCS of 9–12 indicates moderate impairment of consciousness.',
    explanation:
      'The GCS 9–12 range reflects significant depression of consciousness, with disorganized' +
      ' or incomplete responses to stimulation. In traumatic brain injury, ACRM 1993 defines' +
      ' this band as moderate TBI. Airway assessment is essential — protective reflexes may be' +
      ' unreliable at this level. Rapid imaging and neurosurgical consultation are warranted if' +
      ' hemorrhage or mass effect is suspected. A GCS of 9 and a GCS of 12 can represent' +
      ' substantially different clinical states; trajectory over time carries more information' +
      ' than any single score.',
  },
  high: {
    label: 'Severe impairment',
    stat: 'GCS 3–8',
    interpretation: 'A GCS of 3–8 indicates severe impairment of consciousness or coma.',
    explanation:
      'GCS ≤8 is the threshold commonly used to define coma and guide airway management' +
      ' decisions (Teasdale & Jennett, Lancet 1974). In the ICH Score (Hemphill et al.,' +
      ' Stroke 2001), GCS 3–4 carries the highest point weight (2 points) and GCS 5–12' +
      ' carries 1 point, reflecting the prognostic importance of this threshold. When verbal' +
      ' is not testable due to intubation, document with the T suffix (e.g., "9T" = E4 + M5,' +
      ' verbal not assessed). Sedation, metabolic encephalopathy, and postictal state can' +
      ' suppress GCS independent of structural injury and must be considered before' +
      ' assigning prognostic weight to a single score.',
  },
};

// ─── Score calculation — CALCULATOR_SPEC.md §8 ───────────────────────────────

/**
 * calculateGCS — returns canonical GCSResult.
 * null inputs treated as minimum (1) for score calculation.
 * Guard with (selectedCount === 3) before calling in the component.
 *
 * verbalNotTestable: verbal excluded from total; display gets "T" suffix.
 * eyeNotTestable: eye scored as 1 (cannot assess opening); slot fills selectedCount.
 */
export function calculateGCS(inputs: GCSInputs): GCSResult {
  const eyeScore    = inputs.eyeNotTestable    ? 1 : (inputs.eye    ?? 1);
  const verbalScore = inputs.verbalNotTestable ? 0 : (inputs.verbal ?? 1);
  const motorScore  = inputs.motor ?? 1;

  const total    = eyeScore + verbalScore + motorScore;
  const severity = getSeverity(total);
  const { label, stat, interpretation, explanation } = INTERPRETATION[severity];

  const display = inputs.verbalNotTestable
    ? `${eyeScore + motorScore}T`
    : String(total);

  return {
    total,
    display,
    severity,
    label,
    stat,
    interpretation,
    explanation,
    seeAlso: ['calc/ich-score', 'calc/nihss'],
    eye: eyeScore,
    verbal: inputs.verbalNotTestable ? 'T' : (inputs.verbal ?? 1),
    motor: motorScore,
  };
}
