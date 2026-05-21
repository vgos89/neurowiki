/**
 * calculatorTrialMap — which trials informed each calculator's clinical thresholds.
 *
 * STATUS: data-layer only, NOT YET WIRED to any UI surface. This is the input
 * to a future <CalculatorTrialEvidence calculatorId="..." /> component
 * (see docs/audits/link-graph-audit-2026-05-21.md §4.3). UI rollout is gated
 * on `clinical-reviewer` confirming the trial assignments below — each entry
 * asserts "trial X informed calculator Y's threshold," which is a clinical
 * claim that needs ratification before exposure on user-facing pages.
 *
 * The map is sourced from the link-graph audit's §4.2 table. Architect
 * confidence per calculator is annotated below — STRONG / MEDIUM / WEAK.
 * WEAK entries (ABCD2, HAS-BLED, Boston Criteria) are derivation studies
 * that don't have a clean trial-page anchor in the catalog and may be best
 * left without a "trials informing thresholds" footer rather than forcing
 * a tenuous mapping.
 *
 * Source: docs/audits/link-graph-audit-2026-05-21.md §4
 * V approval: 2026-05-21 ("same thing with the calculators page trials
 *   that inform the thresholds")
 * Clinical-reviewer ratification: PENDING
 */

export type CalculatorId =
  | 'nihss'
  | 'aspects-score'
  | 'abcd2-score'
  | 'has-bled-score'
  | 'glasgow-coma-scale'
  | 'ich-score'
  | 'rope-score'
  | 'cha2ds2-vasc'
  | 'heidelberg-bleeding-classification'
  | 'boston-criteria-caa'
  | 'em-billing';

export interface CalculatorTrialMapEntry {
  /** Ordered list of trial IDs whose results informed this calculator's
   *  thresholds. Each id must resolve in TRIAL_DATA / findTrialById. */
  trialIds: string[];
  /** Architect confidence in the mapping; informs whether to render a
   *  "trials informing thresholds" section on the calculator page. */
  confidence: 'strong' | 'medium' | 'weak' | 'na';
  /** One-paragraph note shown above the trial list, if rendered. */
  note?: string;
}

export const CALCULATOR_TRIAL_MAP: Record<CalculatorId, CalculatorTrialMapEntry> = {
  // STRONG — NIHSS thresholds appear in nearly every modern IVT/EVT trial as
  // an inclusion or stratification criterion. NINDS established the score as
  // a treatment-effect modifier.
  nihss: {
    confidence: 'strong',
    note: 'Trials in which NIHSS thresholds shaped eligibility, randomization, or interpretation of acute-stroke treatment.',
    trialIds: [
      'ninds-trial',        // NIHSS as treatment-effect modifier (foundational)
      'ecass3-trial',       // NIHSS upper bound 25 for the 3–4.5 h window
      'wake-up-trial',      // NIHSS ≥6 inclusion in many subgroup analyses
      'extend-trial',       // NIHSS upper bound 26 in late-window perfusion-IVT
      'prisms-trial',       // NIHSS 0–5 minor non-disabling stroke (boundary)
      'dawn-trial',         // NIHSS ≥10 (DAWN selection)
      'aramis-trial',       // NIHSS ≤5 minor stroke DAPT NI to IVT
      'inspires-trial',     // NIHSS ≤5 atherosclerotic minor stroke
    ],
  },

  // STRONG — ASPECTS ≥6 was the early-window EVT standard; large-core five
  // (RJL, SELECT2, ANGEL-ASPECT, TENSION, LASTE) extended into ≤5 territory.
  'aspects-score': {
    confidence: 'strong',
    note: 'Trials that defined or extended the ASPECTS threshold for EVT eligibility.',
    trialIds: [
      'mr-clean-trial',
      'escape-trial',
      'extend-ia-trial',
      'swift-prime-trial',
      'revascat-trial',
      'dawn-trial',
      'defuse-3-trial',
      'rescue-japan-limit-trial',  // First positive ASPECTS 3–5 EVT
      'select2-trial',
      'angel-aspect-trial',
      'tension-trial',
      'laste-trial',
    ],
  },

  // STRONG — ICH Score validated against multiple ICH cohorts; the listed
  // trials shape modern ICH management against which the score is
  // operationalized at the bedside.
  'ich-score': {
    confidence: 'strong',
    note: 'Trials that inform the 30-day mortality framework around which the ICH Score is applied.',
    trialIds: [
      'stich-i-trial',
      'stich-ii-trial',
      'mistie-iii-trial',
      'enrich-trial',
      'annexa-i-trial',
      'patch-trial',
    ],
  },

  // STRONG — RoPE risk-stratification is operationalized inside the PFO
  // closure cohort: enrollment criteria and post-hoc interaction analyses.
  'rope-score': {
    confidence: 'strong',
    note: 'PFO closure trials whose patient stratification operationalized the RoPE risk concept.',
    trialIds: [
      'close-trial',
      'respect-trial',
      'reduce-trial',
    ],
  },

  // MEDIUM — Heidelberg classification anchors in IVT/EVT trials that
  // established symptomatic ICH and post-treatment hemorrhage definitions.
  'heidelberg-bleeding-classification': {
    confidence: 'medium',
    note: 'Trials that anchor the symptomatic ICH and post-treatment hemorrhage definitions in modern stroke care.',
    trialIds: [
      'ecass3-trial',       // Symptomatic ICH framework
      'extend-trial',
      'wake-up-trial',
      'mr-clean-trial',
      'enchanted-trial',
    ],
  },

  // WEAK — CHA₂DS₂-VASc is derivation-based, but DOAC-timing trials operationalize
  // the score for "when to anticoagulate" decisions in AF stroke.
  'cha2ds2-vasc': {
    confidence: 'weak',
    note: 'DOAC-timing trials that operationalize CHA₂DS₂-VASc for anticoagulation decisions after AF-related stroke.',
    trialIds: [
      'timing-trial',
      'optimas-trial',
      'elan-study',
    ],
  },

  // WEAK — Same logic as CHA₂DS₂-VASc; HAS-BLED has no direct RCT match in
  // the current catalog but is co-applied with the anticoag-timing trials.
  'has-bled-score': {
    confidence: 'weak',
    note: 'Trials that inform the bleeding-risk side of the anticoagulation decision the HAS-BLED score quantifies.',
    trialIds: [
      'timing-trial',
      'optimas-trial',
      'elan-study',
    ],
  },

  // WEAK — ABCD2 derivation is observational (Johnston 2007 Lancet). The
  // listed trials operationalize TIA risk-stratification for DAPT decisions.
  // FLAG for clinical-reviewer: is this an over-stretch?
  'abcd2-score': {
    confidence: 'weak',
    note: 'Trials that operationalize TIA risk-stratification for short-course DAPT decisions, applied alongside ABCD2.',
    trialIds: [
      'chance-trial',
      'point-trial',
      'thales-trial',
      'inspires-trial',
    ],
  },

  // NA — GCS predates modern RCTs; no clean trial-page anchor.
  // Suggest leaving the "trials informing thresholds" section unrendered
  // for this calculator.
  'glasgow-coma-scale': {
    confidence: 'na',
    note: 'GCS is a clinical instrument that predates the modern RCT catalog; thresholds are not trial-informed in this database.',
    trialIds: [],
  },

  // NA — Boston Criteria 2.0 is a diagnostic-criteria framework, not
  // RCT-derived. No trial-page anchor.
  'boston-criteria-caa': {
    confidence: 'na',
    note: 'Boston Criteria 2.0 is diagnostic, not trial-derived; no trial-page anchor in the catalog.',
    trialIds: [],
  },

  // NA — Administrative calculator, out of clinical-trial scope.
  'em-billing': {
    confidence: 'na',
    note: 'Administrative coding tool; outside the clinical-trial catalog.',
    trialIds: [],
  },
};

/**
 * Helper for the future <CalculatorTrialEvidence /> component. Returns the
 * map entry when confidence is high enough to render and the trial list is
 * non-empty; returns null otherwise so the component can no-op cleanly.
 */
export function getCalculatorTrialEvidence(
  calculatorId: CalculatorId
): CalculatorTrialMapEntry | null {
  const entry = CALCULATOR_TRIAL_MAP[calculatorId];
  if (!entry || entry.confidence === 'na' || entry.trialIds.length === 0) {
    return null;
  }
  return entry;
}
