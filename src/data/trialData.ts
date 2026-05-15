export interface TrialStats {
  sampleSize: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
  };
  primaryEndpoint: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
  };
  pValue: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
    highlight?: boolean; // For positive/negative highlighting
  };
  effectSize: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
    highlight?: boolean; // For positive/negative highlighting
  };
  absoluteReduction?: {
    value: string;
    label: string;
    info?: string; // Tooltip with detailed explanation
    highlight?: boolean;
  };
}

export interface TrialDesign {
  type: string[];
  timeline: string;
  sampleSize?: {
    value: string;
    info?: string;
  };
  primaryEndpoint?: {
    value: string;
    info?: string;
  };
  pValue?: {
    value: string;
    info?: string;
  };
  nnt?: {
    value: string;
    info?: string;
  };
}

export interface EfficacyResults {
  treatment: {
    percentage: number;
    label: string;
    name: string;
  };
  control: {
    percentage: number;
    label: string;
    name: string;
  };
}

export interface TrialIntervention {
  treatment: string | {
    name: string;
    description: string;
    details?: string[];
  };
  control: string | {
    name: string;
    description: string;
    details?: string[];
  };
}

export interface TrialCalculations {
  nnt?: number; // Number Needed to Treat
  nntExplanation?: string; // Trial-specific explanation
}

export interface AdditionalResults {
  recurrentStroke?: {
    early: number;
    later: number;
    label: string;
  };
  symptomaticICH?: {
    early: number;
    later: number;
    label: string;
  };
}

export interface ProceduralDetails {
  reperfusionRate?: {
    value: string;
    label: string;
    tooltip?: string;
    color?: 'warning' | 'success' | 'danger';
  };
  imagingToPuncture?: {
    value: string;
    label: string;
    tooltip?: string;
    color?: 'warning' | 'success' | 'danger';
  };
}

export interface SafetyMetricEntry {
  evt: number;
  control: number;
  label: string;
  tooltip?: string;
  color?: 'warning' | 'success' | 'danger';
}

export interface SafetyProfile {
  mortality?: SafetyMetricEntry;
  sICH?: SafetyMetricEntry;
  majorBleeding?: SafetyMetricEntry;
  hemorrhagicStroke?: SafetyMetricEntry;
  adverseEvents?: SafetyMetricEntry;
  severeHemorrhage?: SafetyMetricEntry;
}

export interface TrialMetadata {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  stats: TrialStats;
  trialDesign: TrialDesign;
  efficacyResults: EfficacyResults;
  intervention: TrialIntervention;
  clinicalContext: string;
  pearls: string[];
  conclusion: string;
  source: string;
  clinicalTrialsId?: string;
  calculations?: TrialCalculations; // Trial-specific calculations (NNT, etc.)
  additionalResults?: AdditionalResults; // Additional outcome data (e.g., ELAN)
  /** @deprecated Use primaryDesign + primaryResult instead. Retained for backward compatibility with existing trial entries that have not yet been migrated. Do not add new values. */
  specialDesign?: string; // Special trial design (e.g., 'estimation-trial', 'non-inferiority', 'negative-trial')
  keyMessage?: string; // Key clinical takeaway message
  trialResult?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HARM' | 'SAFETY_MET' | 'SAFETY_FAILED' | 'INCONCLUSIVE'; // Overall trial result
  proceduralDetails?: ProceduralDetails; // Procedural/technical details
  safetyProfile?: SafetyProfile; // Safety outcomes
  doi?: string; // DOI for the publication
  pmid?: string; // PubMed ID
  limitations?: string[]; // Study limitations
  clinicalApplication?: string; // How to apply in practice (can be detailed text)
  safetyData?: string; // Detailed safety information
  educationalContext?: string; // Extended educational content (why it worked, etc.)
  /** Category shown on the /trials listing page. Set this on every new trial to auto-register it. */
  listCategory?: 'thrombolysis' | 'thrombectomy' | 'antiplatelets' | 'carotid' | 'acute';
  /** One-line resident-focused blurb shown on the /trials listing page. Falls back to truncated clinicalContext if omitted. */
  listDescription?: string;
  /** Inclusion criteria for the trial. One string per criterion. */
  inclusionCriteria?: string[];
  /** Exclusion criteria for the trial. One string per criterion. */
  exclusionCriteria?: string[];
  /** Q&A pairs for the 'How to read this chart' teaching well (Archetype A). */
  howToReadChart?: { question: string; answer: string }[];
  /** Structured interpretation for the 'How to interpret this trial' teaching well. */
  howToInterpret?: { proves: string; doesNotProve: string; cautions: string };
  /** Single plain-text string shown in the bedside pearl block. No em dashes. */
  bedsidePearl?: string;
  /** 1-2 sentence plain-language summary for the bottom-line drawer body. No em dashes. */
  bottomLineSummary?: string;
  /** Archetype identifier for the new trial page layout. 'A' = DeltaBand; 'B' = GrottaBar; 'G' = BenchmarkThreshold. Omitted = legacy layout. */
  archetypeId?: 'A' | 'B' | 'G';
  /** Result subtype for BottomLineDrawer badge variant. 'non-inferiority' drives "Non-inferiority met" pill when trialResult='NEUTRAL'. */
  resultSubtype?: 'non-inferiority' | 'superiority' | 'safety';
  /** mRS 0-6 distribution per arm. Required for Archetype B. pct[i] is % of patients in mRS i; should sum to ~100. */
  mrsDistribution?: { arm: string; n: number; pct: number[] }[];
  /** Common odds ratio from ordinal logistic regression. Required for Archetype B primary stat row (TRIALS_SPEC v1.1 §3.3). */
  ordinalStats?: {
    commonOR: number;
    ciLow: number;
    ciHigh: number;
    direction: 'positive' | 'negative' | 'neutral' | 'harm';
    pValue?: number;
  };
  /** Pre-specified subgroup analyses rendered in the collapsible subgroup-well (TRIALS_SPEC v1.1 §3.4a). */
  subgroupAnalyses?: {
    label: string;
    description?: string;
    winnerArm: 'intervention' | 'control' | null;
    armDistributions: { arm: string; n: number; pct: number[] }[];
    stats: {
      commonOR: number;
      ciLow: number;
      ciHigh: number;
      direction: 'positive' | 'negative' | 'neutral' | 'harm';
    };
  }[];
  /** Amber caveat text shown at top of subgroup well. Required when subgroupAnalyses is present. */
  subgroupCaveat?: string;
  // ── Archetype G: Benchmark-Threshold (TRIALS_SPEC v1.1 §7a, W6.6.1) ──
  /** Pre-specified safety/efficacy benchmark (Archetype G). */
  benchmark?: {
    rate: number;
    label: string;
    direction: 'below-is-good' | 'above-is-good';
    scaleMax?: number;
  };
  /** Observed event rate and CI (Archetype G). */
  observedEventRate?: {
    rate: number;
    ciLow: number;
    ciHigh: number;
    ciMethod: string;
    numEvents: number;
    total: number;
    description: string;
  };
  /** Historical comparator rows promoted to first-class section (Archetype G §7a.4). Null explicitly omits the section. */
  historicalContext?: {
    rows: {
      label: string;
      year: number;
      n: number;
      design?: string;
      rate: number;
      isCurrentTrial?: boolean;
    }[];
  } | null;
  // ── Stub trial fields (TRIALS_SPEC v1.3 §7c) ─────────────────────────────
  /** True for predecessor reference stubs. Omit or false on full-page trials. */
  isStub?: boolean;
  /** PICO-style question lede rendered below H1. Used on stub pages. */
  questionLede?: string;
  /** Prose paragraph for primary outcome (stub layout — no archetype viz). Tagged with inline claimId comment. */
  primaryOutcomeProse?: string;
  /** One-paragraph trial design narrative (stub layout). Tagged with inline claimId comment. */
  trialDesignNarrative?: string;
  /** 1-2 sentence safety summary (stub layout). */
  safetyBrief?: string;
  /** ID of the representative successor trial for the mandatory amber banner link (§7c.5). */
  successorTrialId?: string;
  /** Display name for the successor trial shown in the amber banner link and see-also chip,
   *  e.g. "ESCAPE (2015)" or "ENRICH (2024)". Stub pages use this instead of hardcoding. */
  successorTrialDisplay?: string;
  /** Completes the amber banner sentence "See [successor] [clause]."
   *  REQUIRED on stubs. Examples:
   *    EVT chain → "for the modern successor trial that established EVT as standard of care"
   *    Basilar chain → "for the modern successor trial that established endovascular thrombectomy for basilar artery occlusion"
   *    Antiplatelet chain → "for the modern successor trial that defined the appropriate short-duration window for dual antiplatelet therapy after minor stroke"
   *    ICH surgery chain → "for the modern successor trial that established minimally invasive evacuation for selected lobar intracerebral hemorrhage"
   *  Fallback if absent: "for current evidence". */
  successorTrialClause?: string;
  // Chain-specific summary used in stub pages (e.g. for the bedsidePearl slot).
  // Examples:
  //   EVT chain → "modern stent-retriever technology and CTA-based patient selection"
  //   Basilar chain → "selective use of EVT for basilar artery occlusion based on imaging and time"
  //   Antiplatelet chain → "short-duration dual antiplatelet therapy after minor stroke"
  //   ICH surgery chain → "minimally invasive evacuation of selected lobar hematomas"
  chainContext?: string;
  /**
   * Statistical framework used for the primary analysis.
   * Drives display logic: ordinal-shift → stacked mRS bar + cOR; noninferiority → NI margin plot;
   * binary-superiority → risk-difference bars; bayesian-noninferiority → posterior probability (NI);
   * bayesian-superiority → posterior probability of superiority + risk-difference bars + NNT (DAWN pattern);
   * dose-finding-safety → dose arm comparison only;
   * estimation-strategy → exploratory estimation design not formally powered for NI or superiority (ELAN
   *   pattern); produces point estimates + CI to inform practice; no formal hypothesis test; NNT suppressed.
   * single-arm-registry → post-market registry with no comparator arm (WEAVE pattern); event rate compared
   *   to a regulatory threshold; NNT suppressed.
   *
   * Option Y rule (NNT suppression): ordinal-shift, noninferiority, bayesian-noninferiority,
   * dose-finding-safety, estimation-strategy, and single-arm-registry all suppress the NNT card.
   * bayesian-SUPERIORITY is NOT suppressed — treat like binary-superiority
   * (DAWN: absolute risk difference 36pp, NNT ~3 is clinically meaningful).
   *
   * Legal (primaryDesign, primaryResult) pairings:
   *   binary-superiority      → met | not-met | futility-stopped | harm-stopped | terminated-administrative
   *   ordinal-shift           → met | not-met | futility-stopped | terminated-administrative
   *   noninferiority          → noninferiority-established | noninferiority-not-established | terminated-administrative
   *   bayesian-noninferiority → noninferiority-established | noninferiority-not-established
   *   bayesian-superiority    → met | not-met
   *   dose-finding-safety     → met | not-met | harm-stopped
   *   estimation-strategy     → leave both null; document in applicability prose instead
   *   single-arm-registry     → safety-threshold-met | harm-stopped
   *
   * Note: ordinal-shift + not-met trials = DISTAL, ESCAPE-MeVO, RESCUE BT, TIMELESS, TWIST (ATTEST-2 primary).
   * Pair with primaryResult to give the full picture. Never render design without result.
   */
  primaryDesign?: 'binary-superiority' | 'ordinal-shift' | 'noninferiority'
    | 'bayesian-noninferiority' | 'bayesian-superiority' | 'dose-finding-safety'
    | 'estimation-strategy' | 'single-arm-registry';
  /**
   * Outcome of the primary analysis.
   * met → primary endpoint achieved; not-met → endpoint missed (adequately powered);
   * noninferiority-established → NI margin met; noninferiority-not-established → NI margin not met;
   * futility-stopped → pre-specified futility boundary crossed or data clearly futile;
   * harm-stopped → trial stopped for safety signal in the intervention arm;
   * terminated-administrative → early stop for enrollment, funding, or operational reasons (underpowered);
   * safety-threshold-met → single-arm registry primary met: periprocedural event rate below regulatory
   *   ceiling (paired ONLY with single-arm-registry; this is a one-sample threshold outcome, NOT a
   *   frequentist comparator result — the renderer drives Archetype G from benchmark/observedEventRate,
   *   not from this value).
   * Never render without the paired primaryDesign.
   */
  primaryResult?: 'met' | 'not-met' | 'noninferiority-established' | 'noninferiority-not-established'
    | 'futility-stopped' | 'harm-stopped' | 'terminated-administrative' | 'safety-threshold-met';
  /** Secondary analysis design for trials using two methods (e.g. ATTEST-2: ordinal-shift primary + NI secondary). */
  secondaryDesign?: 'binary-superiority' | 'ordinal-shift' | 'noninferiority'
    | 'bayesian-noninferiority' | 'bayesian-superiority' | 'dose-finding-safety'
    | 'estimation-strategy' | 'single-arm-registry';
  /** Outcome of the secondary analysis. Pair with secondaryDesign; never render alone. */
  secondaryResult?: 'met' | 'not-met' | 'noninferiority-established' | 'noninferiority-not-established'
    | 'futility-stopped' | 'harm-stopped' | 'terminated-administrative' | 'safety-threshold-met';
  /**
   * Brief annotation of a significant safety tradeoff or harm signal. One sentence, ≤120 chars.
   * Rendered as an inline safety annotation strip alongside the primary result.
   * Populate when primaryResult === 'harm-stopped' OR when a substantial safety tradeoff exists despite
   * efficacy (e.g. POINT benefit-harm crossover at ~21 days, SPS3 mortality excess, SPARCL hemorrhagic
   * stroke increase, THALES severe bleeding 0.5% vs 0.1%, INSPIRES mod-severe bleeding 0.9% vs 0.4%).
   *
   * Field distinction vs other safety fields:
   *   safetyBrief  → stub-layout primary safety section heading (structural, existing field)
   *   safetyData   → legacy long-form detailed safety prose (existing field)
   *   harmSignal   → one-line inline annotation rendered with the result card (this field, Batch 3+)
   */
  harmSignal?: string;
  /**
   * Design-quality disclaimer per TRIALS_SPEC §1.6. Standardized amber callout surfaced
   * above the primary visualization for trials whose design weakens the strength of any
   * conclusion drawn from the primary endpoint — quasi-experimental, single-arm vs
   * historical, high-crossover, stopped-early-for-efficacy/futility, or other open-label
   * adjudication of subjective endpoints. Authored by medical-scientist; gated by
   * clinical-reviewer on Class E rebuilds. Wording sourced from the trial publication's
   * Methods or Limitations section.
   *
   * UI rendering of this callout is a separate ui-architect task; this field carries the
   * data so the wording is registered now and ready when the visual treatment lands.
   */
  designDisclaimer?: {
    category: 'quasi-experimental' | 'single-arm-vs-historical' | 'high-crossover' | 'stopped-early-efficacy' | 'stopped-early-futility' | 'other';
    text: string;  // 1–2 sentences, ≤220 chars
    source?: string;  // citation pointer if paraphrased; required if category === 'other'
  };
  /** Applicability context. Surfaces patient-selection and generalizability constraints for bedside use. */
  applicability?: {
    /** Populations or scenarios this trial explicitly does NOT apply to. One string per exclusion. */
    populationExclusions?: string[];
    /** EVT access context at time of thrombolysis decision. Critical for late-window and bridging trials. */
    evtContext?: 'evt-eligible' | 'evt-ineligible' | 'evt-co-treated' | 'evt-unavailable';
    /** Required imaging selection method. e.g. 'MRI DWI-FLAIR mismatch' or 'CT perfusion mismatch'. */
    imagingSelection?: string;
    /** Dose-specific caveat when the trial dose differs from standard practice. */
    doseSpecific?: string;
    /** Geographic or regulatory context limiting generalizability. */
    geography?: string;
  };
  /**
   * Legend-card presentation slice. The headline values shown on the /trials list page.
   * Authored per trial; do not derive at render time.
   */
  legend?: {
    /**
     * One-line plain-English finding. ≤120 chars. Sentence case, ends with a period.
     * Falls back to listDescription if absent.
     * Example: "Alteplase 4.5–9 h with perfusion-selected imaging improves recovery."
     */
    finding?: string;
    /**
     * Verdict tag for the .bl-tag chip. 6–16 chars, no trailing period. Categorical or numeric.
     * Examples: "+6 / 100" · "Non-inferior" · "No benefit" · "NNT 17" · "Superior" · "Harm"
     * If absent, the chip slot is omitted on render.
     */
    bottomLineTag?: string;
    /**
     * Key statistic for the slate-trailing stat. 6–24 chars including unit.
     * Examples: "NNT 17" · "aOR 1.61 (1.06–1.6)" · "HR 0.92" · "N = 1,430"
     * Should be a DIFFERENT facet of the trial than bottomLineTag — tag = verdict, keyStat = number behind it.
     * If absent, the slot is omitted on render.
     */
    keyStat?: string;
  };
  // ─────────────────────────────────────────────────────────────────────────
  /** RCT predecessor chain for "what changed" teaching (TRIALS_SPEC v1.2 §7b).
   *  Mutually exclusive with historicalContext -- a trial should not have both. */
  rctChain?: {
    chainName: string;
    chainNarrative: string;
    predecessors: Array<{
      trialId?: string;
      trialName: string;
      year: number;
      journal: string;
      n?: number;
      designNotes?: string;
      keyResult: string;
      whatWasMissing: string;
    }>;
    currentTrialResult: string;
    whatChanged: string;
  };
}

export const TRIAL_DATA: Record<string, TrialMetadata> = {
  'ninds-trial': {
    id: 'ninds-trial',
    title: 'NINDS Trial',
    subtitle: 'IV tPA for Acute Ischemic Stroke (0-3 Hours)',
    category: 'Neuro Trials',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    pmid: '7477192',
    doi: '10.1056/NEJM199512143332401',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    inclusionCriteria: [
      'Ischemic stroke with clearly defined onset time',
      'Treatment initiation within 180 minutes of onset',
      'Measurable NIHSS deficit',
      'Non-contrast CT without intracranial hemorrhage',
    ],
    exclusionCriteria: [
      'SBP >185 or DBP >110 mmHg',
      'Rapidly improving or minor symptoms',
      'Recent surgery, stroke, or trauma',
      'Anticoagulants with elevated PTT',
      'Platelets <100,000; glucose <50 or >400 mg/dL',
      'Seizure at stroke onset',
    ],
    safetyProfile: {
      sICH: {
        evt: 6.4,
        control: 0.6,
        label: 'Symptomatic ICH within 36h',
        tooltip: 'Combined Parts 1+2: 6.4% tPA vs 0.6% placebo (P<0.001). Of 28 sICH patients, 17 (61%) died by 3 months. ICH risk is the central safety trade-off of IV thrombolysis.',
        color: 'warning',
      },
      mortality: {
        evt: 17,
        control: 21,
        label: '90-day mortality',
        tooltip: '17% tPA vs 21% placebo (P=0.30). No significant difference despite higher sICH — fatal outcomes were balanced by improved functional outcomes overall.',
      },
    },
    bedsidePearl: 'NINDS established IV alteplase for 0–3 h acute ischemic stroke (NNT ~7 for mRS 0–1). Time-stratified analysis (Marler 2000) confirmed earlier treatment is better — door-to-needle <60 min, target <30 min.',
    bottomLineSummary: 'NINDS is the foundational trial for IV alteplase in acute ischemic stroke 0–3 hours from onset. Functional independence (mRS 0–1) at 90 days improved from 27.2% to 42.6% (Part 2 favorable global outcome OR 1.7, 95% CI 1.2–2.6). sICH 6.4% vs 0.6% (P<0.001); 90-day mortality unchanged. AHA/ASA 2026 §4.6.1 COR 1.',
    stats: {
      sampleSize: {
        value: '624',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.05',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '15.4%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Two-part randomized controlled trial',
        'Double-blind, placebo-controlled',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled 1991-1994'
    },
    efficacyResults: {
      treatment: {
        percentage: 42.6,
        label: 'Minimal disability (mRS 0-1) at 3 months',
        name: 'tPA Group'
      },
      control: {
        percentage: 27.2,
        label: 'Minimal disability (mRS 0-1) at 3 months',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: 'IV Alteplase (0.9 mg/kg, max 90 mg)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'The NINDS tPA Stroke Study established intravenous alteplase (tPA) as the first FDA-approved treatment for acute ischemic stroke.',
    calculations: {
      nnt: 6.5, // 1 / (0.426 - 0.272) = 6.5
      nntExplanation: 'For every 6.5 patients treated with tPA, one additional patient achieves minimal disability (mRS 0-1) compared to placebo'
    },
    pearls: [
      'Time is Brain: Established the 3-hour window',
      'Safety Trade-off: Significantly improved functional outcomes at the cost of a ~6% risk of symptomatic hemorrhage, but with no increase in overall mortality',
      'BP Control: Strict blood pressure control (< 185/110 mmHg) was mandatory and remains a cornerstone of safety',
      'Odds Ratio: 1.7 (95% CI 1.2–2.6) for favorable outcome',
      'Mortality: No significant difference in mortality at 3 months (17% vs 21%)'
    ],
    conclusion: '',
    source: 'The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group (NEJM 1995)',
    clinicalTrialsId: 'NCT00000292',
    listCategory: 'thrombolysis',
    listDescription: 'Foundational trial establishing IV tPA within 3 hours; 42.6% vs 27.2% favorable outcome.',
    legend: {
      finding: 'Alteplase within 3 h improves functional independence (42.6% vs 27.2% mRS 0–1).',
      bottomLineTag: '+15 / 100',
      keyStat: 'NNT 6.5',
    },
  },
  'original-trial': {
    id: 'original-trial',
    title: 'ORIGINAL Trial',
    subtitle: 'Tenecteplase vs Alteplase for Acute Ischemic Stroke (0–4.5 Hours)',
    category: 'Neuro Trials',
    doi: '10.1001/jama.2024.14721',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'China (domestic rhTNK-tPA formulation — not equivalent to international tenecteplase brands)',
      populationExclusions: [
        'Direct comparison to international tenecteplase products (different formulation)',
        'Chinese cohort only — lower baseline severity (median NIHSS 6) than AcT (Canada, median ~9–10); ~41% NIHSS <6 (mild predominance)',
        'Open-label, blinded-endpoint (PROBE) design — not double-blind',
        'Noninferiority design — NNT is not the primary framing; do not derive NNT from RR 1.03',
      ],
    },
    trialResult: 'POSITIVE',
    stats: {
      sampleSize: {
        value: '1,465',
        label: 'Patients (Full Analysis Set)'
      },
      primaryEndpoint: {
        value: 'mRS 0–1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'Non-inf',
        label: 'Margin Met (RR 0.937)'
      },
      effectSize: {
        value: '72.7% vs 70.3%',
        label: 'TNK vs Alteplase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label blinded-endpoint (PROBE) trial',
        'Active-controlled noninferiority design',
        '1:1 allocation (Tenecteplase 0.25 mg/kg vs Alteplase 0.9 mg/kg)',
        '55 neurology clinics and stroke centers in China'
      ],
      timeline: 'Enrolled July 2021 – July 2023'
    },
    efficacyResults: {
      treatment: {
        percentage: 72.7,
        label: 'Excellent outcome (mRS 0–1) at 90 days',
        name: 'Tenecteplase Group (n=732)'
      },
      control: {
        percentage: 70.3,
        label: 'Excellent outcome (mRS 0–1) at 90 days',
        name: 'Alteplase Group (n=733)'
      }
    },
    intervention: {
      treatment: 'IV Tenecteplase 0.25 mg/kg (max 25 mg), given as a single IV bolus over 5–10 seconds',
      control: 'IV Alteplase 0.9 mg/kg (max 90 mg), given as 10% bolus + 60-minute infusion'
    },
    clinicalContext: 'Tenecteplase is a bioengineered variant of alteplase with greater fibrin specificity, longer half-life, and resistance to plasminogen activator inhibitor-1, enabling single-bolus dosing. Prior trials (NOR-TEST, AcT) had shown mixed results. ORIGINAL tested noninferiority in a large Chinese population, directly comparing both agents head-to-head within the 4.5-hour thrombolysis window.',
    calculations: {
      nnt: null,
      nntExplanation: 'Noninferiority trial — NNT is not the primary framing. Tenecteplase was noninferior to alteplase (RR 1.03, 95% CI 0.97–1.09; noninferiority threshold of RR ≥0.937 met).'
    },
    pearls: [
      'Noninferiority confirmed: RR 1.03 (95% CI 0.97–1.09); noninferiority margin of 0.937 met',
      'Symptomatic ICH (ECASS III definition): 1.2% in both groups (RR 1.01, 95% CI 0.37–2.70), identical safety profiles',
      '90-day mortality: 4.6% (TNK) vs 5.8% (alteplase), numerically lower with TNK but not statistically significant (RR 0.80, 95% CI 0.51–1.23)',
      'Single-bolus advantage: Tenecteplase eliminates the 60-minute IV infusion pump requirement, a practical benefit for drip-and-ship and inter-hospital transfer',
      'Population: Chinese patients with AIS, NIHSS 1–25, treated within 4.5h; 30.4% female; mean age ~65',
      'Alongside AcT (Canada 2022) and NOR-TEST 2 (Norway), this trial provides the multi-ethnic evidence base for AHA/ASA 2026 COR 1 equivalence',
      'AHA/ASA 2026 §4.6.2: COR 1 — "tenecteplase at a dose of 0.25 mg/kg (max 25 mg) OR alteplase at a dose of 0.9 mg/kg is recommended" (equivalent first-line alternatives within 4.5h)',
      'Published: JAMA 2024;332(17):1437–1445. Online Sept 12, 2024; print Nov 5, 2024. DOI: 10.1001/jama.2024.14721'
    ],
    conclusion: '',
    source: 'Meng X et al. (JAMA 2024)',
    clinicalTrialsId: 'NCT04915729',
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase noninferior to alteplase for AIS within 4.5h; 72.7% vs 70.3% mRS 0–1 (JAMA 2024).',
  },

  'ecass3-trial': {
    id: 'ecass3-trial',
    title: 'ECASS III Trial',
    subtitle: 'IV tPA for Acute Ischemic Stroke (3–4.5 Hours)',
    category: 'Neuro Trials',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa0804656',
    pmid: '18815396',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    inclusionCriteria: [
      'Age 18 to 80 years',
      'Acute ischemic stroke, symptom onset 3–4.5 hours before IV alteplase',
      'Symptoms ≥30 minutes without significant improvement before treatment',
      'Measurable neurological deficit (NIHSS)',
    ],
    exclusionCriteria: [
      'Intracranial hemorrhage on imaging',
      'Symptom onset unknown (e.g., wake-up stroke)',
      'NIHSS >25 or imaging-defined severe stroke (>1/3 MCA territory)',
      'Oral anticoagulant use (regardless of INR)',
      'Combination of prior stroke AND diabetes mellitus',
      'SBP >185 or DBP >110 mmHg',
      'Platelets <100,000/mm³; glucose <50 or >400 mg/dL',
    ],
    safetyProfile: {
      sICH: {
        evt: 2.4,
        control: 0.2,
        label: 'Symptomatic ICH (ECASS III definition)',
        tooltip: '10/418 alteplase vs 1/403 placebo (OR 9.85, 95% CI 1.26–77.32; P=0.008). ECASS III definition: ICH on follow-up imaging with NIHSS ≥4 deterioration or death.',
        color: 'warning',
      },
      mortality: {
        evt: 7.7,
        control: 8.4,
        label: '90-day mortality',
        tooltip: '32/418 alteplase vs 34/403 placebo (OR 0.90, 95% CI 0.54–1.49; P=0.68). No mortality penalty from extended-window thrombolysis.',
      },
    },
    bedsidePearl: 'For eligible patients within 3–4.5 hours of symptom onset, IV alteplase improves the chance of mRS 0–1 at 90 days (NNT 14). The benefit is smaller than the 0–3 hour window (NINDS) — start treatment as soon as you confirm eligibility.',
    bottomLineSummary: 'ECASS III extended the IV alteplase window from 3h to 4.5h for selected patients. Functional independence (mRS 0–1) at 90 days improved from 45.2% to 52.4% (NNT 14, P=0.04). Symptomatic ICH rose to 2.4% from 0.2% but mortality was unchanged. AHA/ASA 2026 §4.6.3 COR 2a for ECASS III-eligible patients.',
    stats: {
      sampleSize: {
        value: '821',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '7.2%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Double-blind, placebo-controlled',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled 2003-2007'
    },
    efficacyResults: {
      treatment: {
        percentage: 52.4,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'tPA Group'
      },
      control: {
        percentage: 45.2,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: 'IV Alteplase (0.9 mg/kg)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'ECASS III investigated whether the window for IV tPA could be safely extended from 3 hours (NINDS) to 4.5 hours.',
    calculations: {
      nnt: 13.9, // 1 / (0.524 - 0.452) = 13.9
      nntExplanation: 'For every 13.9 patients treated with tPA in the 3-4.5 hour window, one additional patient achieves favorable outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'Extended Window: Successfully expanded the treatment window to 4.5 hours for eligible patients',
      'Efficacy Decay: The treatment effect (OR 1.34) was smaller than in the 0-3 hour window (OR 1.7 in NINDS), reinforcing that earlier treatment is better',
      'Key Exclusions: Age > 80 years, baseline NIHSS > 25, patients taking oral anticoagulants (regardless of INR), and patients with both diabetes and prior stroke',
      'Guideline evolution: The trial excluded age >80 and warfarin users, but AHA/ASA 2026 guidelines support considering treatment in these groups within 3–4.5h after individual risk assessment',
      'Symptomatic ICH: 2.4% in tPA group vs 0.2% in Placebo group (P=0.008)'
    ],
    conclusion: '',
    source: 'Hacke et al. (NEJM 2008)',
    clinicalTrialsId: 'NCT00153036',
    listCategory: 'thrombolysis',
    listDescription: 'Extended IV tPA window to 4.5 hours; 52.4% vs 45.2% mRS 0-1.',
    legend: {
      finding: 'Alteplase benefit extends from 3 h to 4.5 h after onset.',
      bottomLineTag: '+7 / 100',
      keyStat: 'NNT 14',
    },
  },
  'extend-trial': {
    id: 'extend-trial',
    title: 'EXTEND Trial',
    subtitle: 'tPA for Acute Ischemic Stroke (4.5-9 Hours)',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'CT perfusion or MRI perfusion mismatch required — not a general 4.5–9h licence',
      evtContext: 'evt-ineligible',
    },
    stats: {
      sampleSize: {
        value: '225',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '5.9%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Placebo-controlled',
        'Perfusion imaging selection (CTP or DWI)',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled 2010-2018'
    },
    efficacyResults: {
      treatment: {
        percentage: 35.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Alteplase Group'
      },
      control: {
        percentage: 29.5,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: 'IV Alteplase (0.9 mg/kg)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'Can we thrombolyse patients beyond 4.5 hours if they have salvageable tissue? The EXTEND trial tested IV alteplase between 4.5 and 9 hours after stroke onset (or wake-up stroke within 9 hours of sleep midpoint), selecting patients by automated CT or MR perfusion imaging (small core, salvageable penumbra).',
    calculations: {
      nnt: 16.9, // 1 / (0.354 - 0.295) = 16.9
      nntExplanation: 'For every 16.9 patients treated with tPA in the 4.5-9 hour window with favorable perfusion, one additional patient achieves excellent outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'Tissue Window: Proved that the "tissue window" (perfusion mismatch) is more relevant than the rigid "time window" for thrombolysis, similar to mechanical thrombectomy',
      'Wake-Up Stroke: Provided evidence for treating wake-up strokes guided by CTP (alternative to the MRI DWI-FLAIR mismatch strategy from WAKE-UP trial)',
      'Selection Criteria: Core < 70 ml (CTP or DWI), Mismatch: Penumbra > 10 ml and > 1.2x Core volume',
      'Clinical Implementation: Many centers now use this protocol for patients < 9 hours who are not thrombectomy candidates (e.g., distal occlusions) but have favorable perfusion profiles',
      'Symptomatic ICH: 6.2% in Alteplase group vs 0.9% in Placebo group',
      'Adjusted Risk Ratio: 1.44 (P=0.04)'
    ],
    conclusion: '',
    source: 'Ma et al. (NEJM 2019)',
    clinicalTrialsId: 'NCT00887328',
    listCategory: 'thrombolysis',
    listDescription: 'tPA 4.5–9h and wake-up stroke with perfusion mismatch selection.',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa1813046',
    safetyProfile: {
      sICH: {
        /* claimId: extend.sich | source: NEJM 2019 Table 2 p.1800 */
        evt: 6.2,
        control: 0.9,
        label: 'Symptomatic ICH within 36h',
        tooltip: 'Parenchymal hematoma type 2 with NIHSS increase of 4 or more points within 36h of intervention. Adjusted RR 7.22 (95% CI 0.97 to 53.54), P=0.053. Source: Ma et al., NEJM 2019 Table 2 p.1800.',
        color: 'danger',
      },
      mortality: {
        /* claimId: extend.mortality | source: NEJM 2019 Table 2 p.1800 */
        evt: 11.5,
        control: 8.9,
        label: 'Mortality at 90 days',
        tooltip: 'Death within 90 days after intervention. Adjusted RR 1.17 (95% CI 0.57 to 2.40), P=0.67. Not significantly different between groups. Source: Ma et al., NEJM 2019 Table 2 p.1800.',
      },
    },
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with onset 4.5 to 9 hours prior (or wake-up stroke)',
      'CT perfusion or DWI/FLAIR mismatch confirming ischemic penumbra',
      'Core infarct volume under 70 mL on perfusion imaging',
      'Penumbra volume over 10 mL',
      'Penumbra-to-core ratio above 1.2',
    ],
    exclusionCriteria: [
      'Prior stroke within 3 months',
      'Intracranial hemorrhage on baseline imaging',
      'NIHSS above 25 or below 4',
      'Blood glucose below 50 or above 400 mg/dL',
      'Platelet count below 100,000',
      'Anticoagulation with INR above 1.7 or direct anticoagulant taken within 48 hours',
      'Any standard contraindication to IV alteplase',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: '100 dots stand for 100 patients in each group. A filled dot is a patient who had an excellent recovery at 90 days (mRS 0 or 1); an empty dot is one who did not.',
      },
      {
        question: 'What should I look at first?',
        answer: 'Count the filled dots in each group. The difference is the absolute benefit. The cobalt band marks exactly those extra patients.',
      },
      {
        question: 'What does it mean for my patient?',
        answer: '6 more patients per 100 recovered with alteplase. You would need to treat roughly 17 patients to help one additional person reach this outcome (NNT 17).',
      },
    ],
    howToInterpret: {
      /* claimId: extend.interpret | source: NEJM 2019 p.1798-1801, Table 2 p.1800 */
      proves: 'In the specific group of patients selected by perfusion imaging (small core, large penumbra), giving alteplase between 4.5 and 9 hours improved the chance of an excellent recovery at 90 days.',
      doesNotProve: 'It does not show benefit in patients without perfusion mismatch. It also does not prove a shift across the full mRS scale, because the secondary ordinal analysis did not reach significance.',
      cautions: 'The trial stopped early at 73% of planned enrollment, which reduced statistical power. The confidence interval barely excluded 1.0 (lower bound 1.01), so the true effect could be smaller than the point estimate suggests. The adjusted analysis was significant; the unadjusted analysis was not. The ordinal shift across the full mRS scale (a prespecified secondary outcome) did not reach statistical significance. Other secondary outcomes directionally favored alteplase but were not corrected for multiple comparisons. Median door-to-needle time was approximately 2 hours in this trial, which exceeds current guideline targets and does not reflect achievable times in practice.', /* claimId: extend.interpret | source: NEJM 2019 Discussion p.1801 */
    },
    /* claimId: extend.bedside-pearl | source: NEJM 2019 Table 2 p.1800 */
    bedsidePearl: 'Symptomatic ICH ran 6.2% vs 0.9% in EXTEND. When you consent, quote both numbers: the 6 extra recoveries and the 5 extra hemorrhages per 100 treated. The trial\'s answer applies to perfusion-selected patients only.',
    bottomLineSummary: 'EXTEND showed that alteplase given 4.5 to 9 hours after stroke onset, or within 9 hours of the midpoint of sleep for wake-up stroke, improved excellent outcome at 90 days in patients selected by perfusion mismatch. The benefit was modest and the confidence interval was wide because the trial stopped early.',
    legend: {
      finding: 'Alteplase 4.5–9 h with perfusion-selected imaging improves recovery.',
      bottomLineTag: '+6 / 100',
      keyStat: 'NNT 17',
    },
  },
  'eagle-trial': {
    id: 'eagle-trial',
    title: 'EAGLE Trial',
    subtitle: 'Intra-Arterial tPA for Central Retinal Artery Occlusion',
    category: 'Neuro Trials',
    doi: '10.1016/j.ophtha.2010.03.061',
    primaryDesign: 'binary-superiority',
    primaryResult: 'futility-stopped',
    applicability: {
      populationExclusions: [
        'IV alteplase for CRAO — EAGLE studied intra-arterial route only',
        'Does not address ultra-early IV thrombolysis for CRAO (see THEIA trial)',
        'Arteritic CRAO (non-arteritic population only)',
      ],
    },
    stats: {
      sampleSize: {
        value: '84',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'BCVA Change',
        label: 'at 1 Month'
      },
      pValue: {
        value: '0.69',
        label: 'Not Significant'
      },
      effectSize: {
        value: '-2.9%',
        label: 'No Benefit'
      }
    },
    trialDesign: {
      type: [
        'Prospective randomized multicenter trial',
        'Open-label (non-blinded)',
        '1:1 allocation (LIF vs. CST)'
      ],
      timeline: 'Enrolled 2002-2007'
    },
    efficacyResults: {
      treatment: {
        percentage: 57.1,
        label: 'Clinically significant visual improvement',
        name: 'LIF Group (IA tPA)'
      },
      control: {
        percentage: 60.0,
        label: 'Clinically significant visual improvement',
        name: 'CST Group (Conservative)'
      }
    },
    intervention: {
      treatment: 'Local Intra-arterial Fibrinolysis (max 50mg tPA) via microcatheter in ophthalmic artery',
      control: 'Conservative Standard Treatment (hemodilution, ocular massage, timolol, acetazolamide)'
    },
    clinicalContext: 'Central Retinal Artery Occlusion (CRAO) is an ophthalmologic emergency with poor prognosis. Intra-arterial (IA) fibrinolysis was hypothesized to improve visual outcomes by recanalizing the ophthalmic artery. The EAGLE trial was the first randomized controlled trial to test this.',
    calculations: {
      // Negative trial - no NNT
    },
    pearls: [
      'Negative Trial: IA tPA showed no efficacy benefit over conservative therapy',
      'Safety Hazard: The intervention carried significantly higher risks (37.1% adverse events vs 4.3% in control, including 2 hemorrhages) without benefit',
      'Study Stopped: The trial was terminated early by the Data Safety Monitoring Board due to futility and safety concerns',
      'Guideline Impact: Based on EAGLE, IA tPA is generally not recommended for CRAO in standard practice, though IV tPA within 4.5h is still considered by some centers',
      'Time Window: Within 20 hours of symptom onset',
      'Primary Outcome: Change in Best Corrected Visual Acuity (BCVA) at 1 month'
    ],
    conclusion: '',
    source: 'Schumacher et al. (Ophthalmology 2010)',
    clinicalTrialsId: 'NCT00622778',
    listCategory: 'thrombolysis',
    listDescription: 'IA tPA for central retinal artery occlusion; negative trial; stopped early for futility.',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      adverseEvents: {
        evt: 37.1,
        control: 4.3,
        label: 'Adverse events (LIF vs conservative)',
        tooltip: 'Adverse events including 2 procedure-related intracranial hemorrhages in the LIF arm; 0 hemorrhages in the conservative arm. The 8.6x higher adverse event rate with no efficacy signal was the basis for early DSMB termination. /* claimId: eagle-safety-ae | source: Schumacher Ophthalmology 2010 Table 3 */',
        color: 'danger',
      },
    },
    inclusionCriteria: [
      'Central retinal artery occlusion with onset within 20 hours of symptom onset',
      'BCVA of hand motion or worse in the affected eye',
      'Age 18 years or older',
      'Appropriate for catheter angiography',
    ],
    exclusionCriteria: [
      'Onset more than 20 hours prior to treatment',
      'Contraindication to fibrinolytic therapy',
      'Prior significant ocular disease in the affected eye',
      'Evidence of carotid or aortic dissection',
    ],
    howToReadChart: [
      {
        question: 'What endpoint does this chart display, and why not the primary?',
        answer: 'The chart displays the secondary dichotomized endpoint: proportion of patients with clinically meaningful visual improvement (gain of 15 or more ETDRS letters) at 1 month. The primary endpoint was continuous change in logMAR BCVA, which showed P=0.69 (no significant difference). The dichotomized secondary is shown here for visual clarity because the continuous primary cannot be meaningfully represented in a dot proportion chart. /* claimId: eagle-primary-negative | source: Schumacher Ophthalmology 2010 */',
      },
      {
        question: 'Why does the conservative arm appear to have a higher rate?',
        answer: 'CST (conservative treatment) showed 60.0% with visual improvement vs 57.1% in the LIF (IA tPA) arm, a difference that was not statistically significant. The key finding is that there is no benefit from IA fibrinolysis in either the primary or secondary analysis. The DSMB stopped the trial at 84 of 200 planned patients for futility and safety.',
      },
      {
        question: 'How serious was the safety signal?',
        answer: 'Adverse events occurred in 37.1% of the LIF arm versus 4.3% of the conservative arm, including 2 procedure-related intracranial hemorrhages with no hemorrhages in the control arm. This 8-fold difference in adverse events with zero efficacy gain defines the unfavorable risk-benefit profile. /* claimId: eagle-safety-ae | source: Schumacher Ophthalmology 2010 */',
      },
    ],
    howToInterpret: {
      proves: 'In patients with CRAO presenting within 20 hours, local intra-arterial fibrinolysis (up to 50 mg tPA via ophthalmic artery microcatheter) did not improve visual acuity compared with conservative treatment on either the primary continuous BCVA endpoint (P=0.69) or the secondary dichotomized endpoint (57.1% vs 60.0% with meaningful improvement). The trial was stopped early for futility and safety by the DSMB. /* claimId: eagle-primary-negative | source: Schumacher Ophthalmology 2010 */',
      doesNotProve: 'It does not prove that any thrombolytic approach is ineffective in CRAO within the first few hours. IV tPA within 4.5 hours of CRAO onset was outside the EAGLE protocol window and is still considered by some centers based on stroke-mechanism analogy. EAGLE was conducted with a 20-hour window; early window trials are a separate question.',
      cautions: 'The trial enrolled only 84 of 200 planned patients before early stopping, reducing statistical power and widening confidence intervals. Open-label design prevents blinding of treatment allocation. The heterogeneous conservative treatment (hemodilution, ocular massage, timolol, acetazolamide) may not reflect current standard of care.',
    },
    bedsidePearl: 'EAGLE definitively showed that IA tPA for CRAO causes significant harm (37% adverse events including intracranial hemorrhage) with no visual benefit. The procedure is not indicated for CRAO. The current clinical debate is about IV tPA in the very early window (within 4.5 hours), which was not tested in EAGLE. If a CRAO patient presents within hours, the stroke team conversation is about IV tPA eligibility, not IA fibrinolysis.',
    bottomLineSummary: 'Local intra-arterial fibrinolysis for CRAO presenting within 20 hours showed no improvement in visual acuity compared with conservative treatment (primary P=0.69; secondary dichotomized endpoint 57.1% vs 60.0% with clinically meaningful improvement) and caused significantly more adverse events (37.1% vs 4.3%), including procedure-related intracranial hemorrhage. The DSMB stopped the trial at 84 patients for futility and safety. IA tPA is not recommended for CRAO.',
  },
  'mr-clean-trial': {
    id: 'mr-clean-trial',
    title: 'MR CLEAN Trial',
    subtitle: 'Intra-arterial Treatment for Anterior Circulation LVO',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      populationExclusions: [
        'Heterogeneous older-generation devices used — not representative of current stent-retriever or aspiration technique',
        'Landmark historical trial (2015); imaging selection was minimal vs modern perfusion-guided protocols',
      ],
    },
    stats: {
      sampleSize: {
        value: '500',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'Significant',
        label: 'Adjusted OR 1.67'
      },
      effectSize: {
        value: '+13.5%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'Pragmatic phase 3 randomized trial',
        'Open-label with blinded endpoint assessment',
        'Intra-arterial therapy plus usual care vs usual care alone',
        'Treatment possible within 6 hours of onset'
      ],
      timeline: 'Enrolled at 16 Dutch centers'
    },
    efficacyResults: {
      treatment: {
        percentage: 32.6,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Intra-arterial Treatment + Usual Care'
      },
      control: {
        percentage: 19.1,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Usual Care Alone'
      }
    },
    intervention: {
      treatment: 'Intra-arterial treatment (predominantly stent-retriever thrombectomy) plus usual care, including alteplase when eligible',
      control: 'Usual care alone, including alteplase when eligible'
    },
    clinicalContext: 'MR CLEAN was the first modern positive thrombectomy trial and established that endovascular treatment improves disability outcomes for anterior circulation large-vessel occlusion when patients are selected with vessel imaging and treated rapidly.',
    pearls: [
      'First positive modern EVT trial that reopened the field after earlier neutral endovascular studies',
      'Most patients also received IV alteplase before randomization (89%)',
      'Functional independence improved from 19.1% to 32.6%',
      'Adjusted common odds ratio for better disability outcome was 1.67',
      'No significant increase in mortality or symptomatic intracerebral hemorrhage was seen'
    ],
    conclusion: '',
    source: 'Berkhemer et al. (NEJM 2015)',
    specialDesign: 'landmark-evt',
    keyMessage: 'MR CLEAN established modern EVT as effective therapy for anterior circulation LVO.',
    listCategory: 'thrombectomy',
    listDescription: 'First modern positive thrombectomy trial for anterior circulation large-vessel occlusion.',
    archetypeId: 'B',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa1411587',
    pmid: '25517348',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with NIHSS of 2 or more',
      'Proximal arterial occlusion in the anterior circulation (intracranial ICA, M1 or M2 of MCA, A1 or A2 of ACA) confirmed on CTA, MRA, or DSA',
      'Intra-arterial treatment feasible within 6 hours of symptom onset',
      'Pre-stroke functional independence (mRS 0 to 2 by history)',
    ],
    exclusionCriteria: [
      'Onset of stroke symptoms more than 6 hours before groin puncture',
      'No demonstrable proximal anterior circulation occlusion on vessel imaging',
      'Severe pre-existing dependency (mRS greater than 2)',
      'Pregnancy or breastfeeding',
      'Standard contraindications to endovascular treatment, including uncorrectable coagulopathy',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'A stacked bar across mRS 0 to 6 for each arm, where mRS 0 is no symptoms and mRS 6 is death. The width of each segment is the percentage of patients in that disability category at 90 days.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'Functional independence (mRS 0 to 2) was 32.6% with intra-arterial treatment versus 19.1% with usual care. The full ordinal shift is captured by the adjusted common odds ratio of 1.67, meaning intervention patients had 1.67 times the odds of being one mRS point better.',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'MR CLEAN was a pragmatic trial done in 16 Dutch centers with no perfusion or collateral imaging requirement, and only 89% received IV alteplase. Workflow times and patient selection in current practice are tighter, which can shift baseline outcomes.',
      },
    ],
    howToInterpret: {
      /* claimId: mr-clean-primary-result | source: Berkhemer NEJM 2015 */
      proves: 'In patients with imaging-confirmed proximal anterior circulation large-vessel occlusion treatable within 6 hours, intra-arterial treatment (predominantly stent-retriever thrombectomy) added to usual care reduced disability across the full mRS distribution at 90 days (adjusted common OR 1.67, 95% CI 1.21 to 2.30) and increased functional independence from 19.1% to 32.6%.',
      doesNotProve: 'It does not address late-window EVT (beyond 6 hours), which was tested by DAWN and DEFUSE-3. It does not establish efficacy in posterior circulation occlusion, large established infarcts (low ASPECTS), or patients with severe pre-stroke disability, all of which were excluded.',
      cautions: 'Pragmatic Dutch trial with heterogeneous device use including older first-generation devices in some patients; modern stent-retriever and aspiration platforms produce higher reperfusion rates. About 89% received IV alteplase. ASPECTS was not required for enrollment, so a small fraction of patients had low ASPECTS and may not represent current selection. Open-label design with blinded outcome assessment.',
    },
    /* claimId: mr-clean-bedside-pearl | source: Berkhemer NEJM 2015 */
    bedsidePearl: 'When CTA confirms a proximal anterior circulation occlusion within 6 hours and the patient was independent before the stroke, MR CLEAN is consistent with proceeding to thrombectomy without waiting for IV alteplase to finish, in line with current AHA/ASA practice. The absolute gain in functional independence was 13.5 percentage points (NNT about 7).',
    bottomLineSummary: 'MR CLEAN was the first modern positive thrombectomy trial. In anterior circulation LVO treated within 6 hours, adding intra-arterial therapy to usual care raised functional independence from 19.1% to 32.6% and shifted the entire mRS distribution toward better outcomes.',
    ordinalStats: {
      commonOR: 1.67,
      ciLow: 1.21,
      ciHigh: 2.30,
      direction: 'positive',
    },
    legend: {
      finding: 'First positive EVT trial — thrombectomy benefit in proximal LVO.',
      bottomLineTag: '+13 / 100',
      keyStat: 'NNT 7',
    },
  },
  'escape-trial': {
    id: 'escape-trial',
    title: 'ESCAPE Trial',
    subtitle: 'Rapid EVT for Small-Core LVO With Good Collaterals',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'Small core (ASPECTS ≥6) + good collaterals on multiphase CTA required',
      populationExclusions: [
        'Stopped early for efficacy — effect size may be inflated',
      ],
    },
    stats: {
      sampleSize: {
        value: '316',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 2.6',
        label: 'Better Disability Outcome'
      }
    },
    trialDesign: {
      type: [
        'International randomized trial',
        'Standard care vs standard care plus EVT',
        'CT/CTA selection for small core and moderate-good collaterals',
        'Treatment allowed up to 12 hours from onset'
      ],
      timeline: 'Stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 53.0,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'EVT + Standard Care'
      },
      control: {
        percentage: 29.3,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Standard Care Alone'
      }
    },
    intervention: {
      treatment: 'Rapid endovascular thrombectomy plus standard care',
      control: 'Standard care alone, including alteplase when eligible'
    },
    clinicalContext: 'ESCAPE emphasized workflow discipline, collateral selection, and rapid reperfusion. It showed that thrombectomy works best when imaging confirms a small core and treatment delays are aggressively minimized.',
    pearls: [
      'Marked absolute gain in independence: 53.0% vs 29.3%',
      'Mortality was reduced: 10.4% vs 19.0%',
      'Median CT-to-first reperfusion time in the EVT arm was only 84 minutes',
      'Used collateral imaging to exclude patients with poor tissue reserve',
      'One of the five 2015 trials that cemented EVT as standard of care'
    ],
    conclusion: '',
    source: 'Goyal et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01778335',
    listCategory: 'thrombectomy',
    listDescription: 'Fast thrombectomy trial using collateral-based CT selection and strict workflow targets.',
    archetypeId: 'B',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa1414905',
    pmid: '25671798',
    inclusionCriteria: [
      'Age 18 years or older with disabling acute ischemic stroke',
      'NIHSS greater than 5',
      'Pre-stroke functional independence (Barthel index 90 or higher)',
      'Small infarct core on noncontrast CT (ASPECTS 6 to 10)',
      'Moderate to good collateral circulation on multiphase CTA (filling of 50% or more of pial arterial circulation in the affected MCA territory)',
      'Proximal anterior circulation occlusion (intracranial ICA or M1 MCA, including M1-equivalent)',
      'Treatment achievable within 12 hours of symptom onset',
    ],
    exclusionCriteria: [
      'Large established infarct core (ASPECTS less than 6)',
      'Poor collateral circulation on multiphase CTA',
      'Posterior circulation stroke',
      'Severe pre-stroke disability',
      'Standard contraindications to endovascular therapy',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Stacked distribution of mRS 0 to 6 at 90 days for each arm. The fraction of dark green segments (mRS 0 to 2) reflects functional independence; the rightmost segment (mRS 6) is mortality.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'Functional independence rose from 29.3% to 53.0% with EVT. The common odds ratio of 2.6 (95% CI 1.7 to 3.8) means EVT patients had 2.6 times the odds of being at a better mRS level. Mortality also fell from 19.0% to 10.4%.',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'ESCAPE selected patients with small infarct cores and good collaterals using multiphase CTA. The benefit shown does not generalize to patients with low ASPECTS or poor collaterals, who were specifically excluded. The trial was stopped early for efficacy, which can inflate effect estimates.',
      },
    ],
    howToInterpret: {
      /* claimId: escape-primary-result | source: Goyal NEJM 2015 */
      proves: 'In patients with small infarct cores (ASPECTS 6 to 10) and moderate-to-good collaterals on multiphase CTA, rapid endovascular thrombectomy added to standard care within 12 hours of onset reduced disability across the full mRS distribution (common OR 2.6, 95% CI 1.7 to 3.8; P less than 0.001), increased functional independence from 29.3% to 53.0%, and reduced 90-day mortality from 19.0% to 10.4%.',
      doesNotProve: 'It does not establish benefit in patients excluded by the imaging selection criteria, particularly low ASPECTS or poor collaterals. It does not address EVT beyond 12 hours, which was later tested by DAWN and DEFUSE-3 with perfusion-based selection.',
      cautions: 'ESCAPE was stopped early at 316 of a planned 500 patients after positive interim analysis, which can overestimate effect size. Workflow times in ESCAPE were exceptional (median CT-to-first-reperfusion 84 minutes) and may not be reproducible in less specialized centers. Multiphase CTA collateral assessment requires reader expertise.',
    },
    /* claimId: escape-bedside-pearl | source: Goyal NEJM 2015 */
    bedsidePearl: 'For an LVO patient up to 12 hours from onset with ASPECTS of 6 or higher and good collaterals on multiphase CTA, ESCAPE supports thrombectomy with a striking absolute mortality reduction of about 9 percentage points. Aim to keep the CT-to-puncture interval as short as the trial achieved.',
    bottomLineSummary: 'ESCAPE showed that rapid thrombectomy in patients with small infarct cores and good collaterals improves functional outcome and reduces mortality within a 12-hour window. Both effects were large enough to stop the trial early.',
    /* mrsDistribution — source: Wiki Journal Club secondary summary of Goyal NEJM 2015 Figure 2.
       Primary-source extraction against Goyal Figure 2 deferred to W5.2 (citation registry milestone).
       Values are provisional placeholders; clinical-reviewer to re-verify when W5.2 ships. */
    mrsDistribution: [
      { arm: 'EVT + Standard Care', n: 165, pct: [15, 21, 18, 16, 13, 7, 10] },
      { arm: 'Standard Care Alone', n: 150, pct: [7, 10, 12, 15, 25, 12, 19] },
    ],
    ordinalStats: {
      commonOR: 2.6,
      ciLow: 1.7,
      ciHigh: 3.8,
      direction: 'positive',
      pValue: 0.001,
    },
    legend: {
      finding: 'Small-core LVO thrombectomy raised independence to 53% vs 29%; mortality cut from 19% to 10%.',
      bottomLineTag: '+24 / 100',
      keyStat: 'NNT 4.2',
    },
  },
  'revascat-trial': {
    id: 'revascat-trial',
    title: 'REVASCAT Trial',
    subtitle: 'Solitaire Thrombectomy Within 8 Hours',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'ASPECTS ≥7 (CT) or ≥6 (MR); Solitaire device only',
      geography: 'Spain (single-country)',
      populationExclusions: [
        'Solitaire-only — results may not generalize to all retrieval devices',
        '0–8h time window; later-window applicability requires DAWN/DEFUSE-3 evidence',
      ],
    },
    stats: {
      sampleSize: {
        value: '206',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'Significant',
        label: 'Adjusted OR 1.7'
      },
      effectSize: {
        value: '+15.5%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'Randomized trial embedded in a population-based registry',
        'Thrombectomy plus medical therapy vs medical therapy alone',
        'Anterior circulation LVO without large infarct',
        'Treatment window up to 8 hours'
      ],
      timeline: 'Conducted at 4 centers in Catalonia, Spain'
    },
    efficacyResults: {
      treatment: {
        percentage: 43.7,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Solitaire Thrombectomy + Medical Therapy'
      },
      control: {
        percentage: 28.2,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Solitaire stent-retriever thrombectomy plus medical therapy',
      control: 'Medical therapy alone, including alteplase when eligible'
    },
    clinicalContext: 'REVASCAT confirmed that stent-retriever thrombectomy improves disability outcomes when used in carefully selected anterior circulation LVO patients, including those in whom alteplase failed or was contraindicated.',
    pearls: [
      'Functional independence improved to 43.7% vs 28.2%',
      'Ordinal disability outcome also favored thrombectomy (adjusted OR 1.7)',
      'Symptomatic intracranial hemorrhage was identical in both groups at 1.9%',
      'Trial helped extend confidence in EVT use out to 8 hours in selected patients'
    ],
    conclusion: '',
    source: 'Jovin et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01692379',
    listCategory: 'thrombectomy',
    listDescription: 'Spanish registry-embedded RCT confirming Solitaire thrombectomy benefit within 8 hours.',
    archetypeId: 'B',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa1503780',
    pmid: '25882510',
    inclusionCriteria: [
      'Age 18 to 80 years (extended to 85 years during the trial)',
      'Acute ischemic stroke with proximal anterior circulation occlusion (intracranial ICA or M1 MCA)',
      'NIHSS of 6 or greater at the time of randomization',
      'Pre-stroke functional independence (mRS 0 or 1)',
      'Treatment feasible within 8 hours of symptom onset',
      'Absence of large infarct on imaging (ASPECTS 7 or greater on CT, or 6 or greater on diffusion MRI)',
      'Contraindication to IV alteplase, or failure of alteplase to recanalize after 30 minutes',
    ],
    exclusionCriteria: [
      'Large established infarct on baseline imaging',
      'Severe pre-stroke disability',
      'Comorbidities or coagulopathy precluding endovascular treatment',
      'Pregnancy',
      'Symptom onset to randomization beyond 8 hours',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Distribution of mRS scores at 90 days as stacked segments per arm. Each segment is the percentage of patients at that disability level. Lower scores (left side) are better.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'Functional independence (mRS 0 to 2) was 43.7% with Solitaire thrombectomy versus 28.2% with medical therapy alone, an absolute increase of 15.5 percentage points. The adjusted common odds ratio for shifting one mRS level was 1.7 (95% CI 1.05 to 2.8).',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'REVASCAT enrolled within an 8-hour window in 4 Catalan centers and required either alteplase contraindication or alteplase failure to enter. The 206-patient sample is relatively small, and some patients in the medical arm crossed over after the 8-hour window. Late-window selection now uses perfusion or clinical-core mismatch (DAWN, DEFUSE-3).',
      },
    ],
    howToInterpret: {
      /* claimId: revascat-primary-result | source: Jovin NEJM 2015 */
      proves: 'In patients with proximal anterior circulation occlusion presenting up to 8 hours from onset, Solitaire stent-retriever thrombectomy added to medical therapy reduced disability across the full mRS distribution at 90 days (adjusted OR for one-point shift 1.7, 95% CI 1.05 to 2.8) and increased functional independence from 28.2% to 43.7%.',
      doesNotProve: 'It does not establish benefit beyond 8 hours, which required perfusion or clinical-core mismatch selection in DAWN and DEFUSE-3. It does not address patients with large established infarcts (ASPECTS less than 7 on CT) or those with severe pre-stroke disability, who were excluded.',
      cautions: 'Modest sample size (n=206) and registry-embedded design at 4 Spanish centers. Most patients had ICA or M1 occlusion; M2 occlusions were not the focus. Mortality was not reduced (18.4% vs 15.5%). The trial was stopped early after positive interim analyses in the other 2015 trials, which can inflate effect estimates.',
    },
    /* claimId: revascat-bedside-pearl | source: Jovin NEJM 2015 */
    bedsidePearl: 'For an anterior circulation LVO patient between 4.5 and 8 hours from onset, especially when alteplase is contraindicated or has failed, REVASCAT supports proceeding to Solitaire thrombectomy provided ASPECTS is 7 or higher on CT. The functional independence gain is about 15 percentage points (NNT about 7).',
    bottomLineSummary: 'REVASCAT showed that Solitaire stent-retriever thrombectomy improved 90-day functional outcome in anterior circulation LVO treated within 8 hours, including in patients ineligible for or refractory to IV alteplase. The mRS distribution shifted toward better outcomes despite no mortality reduction.',
    ordinalStats: {
      commonOR: 1.7,
      ciLow: 1.05,
      ciHigh: 2.8,
      direction: 'positive',
    },
  },
  'extend-ia-trial': {
    id: 'extend-ia-trial',
    title: 'EXTEND-IA Trial',
    subtitle: 'Perfusion-Selected EVT After Alteplase',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    secondaryDesign: 'ordinal-shift',
    secondaryResult: 'met',
    applicability: {
      imagingSelection: 'CT or MR perfusion mismatch required (RAPID: core <70 mL, mismatch ratio ≥1.8)',
      populationExclusions: [
        'Stopped early at N=70 — very small trial, effect size likely inflated',
        'All patients received IV tPA (bridging context only)',
      ],
    },
    stats: {
      sampleSize: {
        value: '70',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Reperfusion',
        label: '24-Hour Coprimary Endpoint'
      },
      pValue: {
        value: '<0.001',
        label: 'Reperfusion Benefit'
      },
      effectSize: {
        value: '+31%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'Randomized trial after IV alteplase',
        'Perfusion-imaging selection for salvageable tissue',
        'Solitaire FR thrombectomy vs alteplase alone',
        'Occlusion in ICA or MCA with core <70 mL'
      ],
      timeline: 'Stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 71,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy + Alteplase'
      },
      control: {
        percentage: 40,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Alteplase Alone'
      }
    },
    intervention: {
      treatment: 'Solitaire FR thrombectomy after IV alteplase',
      control: 'IV alteplase alone'
    },
    clinicalContext: 'EXTEND-IA showed that CT perfusion imaging could identify patients with salvageable tissue most likely to benefit from thrombectomy. Reperfusion at 24h improved from 37% to 100% in the EVT group.',
    pearls: [
      'Used CT perfusion to target salvageable tissue and avoid large completed infarcts',
      'Reperfusion at 24 hours improved from 37% to 100%',
      'Early neurologic improvement at day 3 was 80% vs 37%',
      'Functional independence at 90 days rose to 71% vs 40%'
    ],
    conclusion: '',
    source: 'Campbell et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01492725',
    listCategory: 'thrombectomy',
    listDescription: 'Perfusion-imaging thrombectomy trial showing major reperfusion and functional gains.',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa1414792',
    pmid: '25671797',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with anterior circulation large-vessel occlusion (intracranial ICA or M1 or M2 MCA) on CTA or MRA',
      'IV alteplase started within 4.5 hours of symptom onset',
      'Endovascular thrombectomy achievable within 6 hours of onset',
      'CT perfusion or MRI perfusion-diffusion mismatch confirming salvageable tissue (ischemic core less than 70 mL, mismatch ratio greater than 1.2, mismatch volume greater than 10 mL)',
      'Pre-stroke functional independence (mRS 0 to 1)',
    ],
    exclusionCriteria: [
      'Large established infarct core (greater than 70 mL)',
      'No perfusion mismatch (target mismatch profile not met)',
      'Severe pre-stroke disability',
      'Standard contraindications to endovascular treatment',
      'Posterior circulation stroke',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The chart displays the secondary functional outcome (mRS 0 to 2 at 90 days): 71% with thrombectomy plus alteplase versus 40% with alteplase alone. The two co-primary endpoints (24-hour reperfusion of 100% vs 37% and early neurological improvement at day 3 of 80% vs 37%) were both met before this secondary outcome was assessed.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'A 31 percentage point absolute gain in functional independence corresponds to an NNT of about 3 in this perfusion-selected population, the largest absolute effect in any 2015 EVT trial. Reperfusion was near-complete in the EVT arm (100% versus 37% with alteplase alone).',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'Only 70 patients were randomized before the trial was stopped early for efficacy. The very strict CT perfusion selection (small core, large mismatch) limits generalizability. Most patients received alteplase before randomization, so the trial does not address direct thrombectomy without bridging.',
      },
    ],
    howToInterpret: {
      /* claimId: extend-ia-primary-result | source: Campbell NEJM 2015 */
      proves: 'In patients with anterior circulation LVO selected by CT perfusion (core less than 70 mL, mismatch ratio greater than 1.2) who had received IV alteplase within 4.5 hours, adding Solitaire FR thrombectomy markedly improved both co-primary endpoints: reperfusion at 24 hours (100% vs 37%, P less than 0.001) and early neurological improvement at day 3 (80% vs 37%, P less than 0.001). The secondary outcome of functional independence at 90 days (71% vs 40%) was consistent with these effects.',
      doesNotProve: 'It does not establish thrombectomy benefit in patients without perfusion mismatch, who were specifically excluded. With only 70 patients and early termination, the trial cannot precisely estimate the size of the mRS shift, and subgroup analyses are underpowered. It does not test direct thrombectomy without alteplase.',
      cautions: 'Stopped early at 70 patients after positive interim analysis, which inflates effect estimates and widens confidence intervals. CT perfusion automated post-processing (RAPID) may not be available at all centers and requires consistent quality control. Strict mismatch criteria selected an enriched population likely to benefit; real-world effect sizes are typically smaller.',
    },
    /* claimId: extend-ia-bedside-pearl | source: Campbell NEJM 2015 */
    bedsidePearl: 'When CT perfusion shows a small core and a large penumbra in an LVO patient who has just received alteplase, EXTEND-IA supports moving immediately to thrombectomy. The reperfusion gap (100% vs 37%) is the mechanistic anchor for the functional benefit; the mRS gain (71% vs 40%) is the bedside number to quote.',
    bottomLineSummary: 'EXTEND-IA established that adding Solitaire thrombectomy to alteplase in patients with perfusion-imaging mismatch dramatically improves reperfusion and early neurological recovery, with a large secondary gain in 90-day functional independence (71% vs 40%). The trial was stopped early after only 70 patients.',
  },
  'swift-prime-trial': {
    id: 'swift-prime-trial',
    title: 'SWIFT PRIME Trial',
    subtitle: 'Stent-Retriever EVT Plus IV tPA vs IV tPA Alone',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'RAPID perfusion imaging required (core <50 mL, mismatch ratio ≥1.8)',
      populationExclusions: [
        'Solitaire device only — results may not generalize to all retrieval devices',
        'All patients received IV tPA (bridging context only)',
        'Stopped early for efficacy — effect size may be inflated',
      ],
    },
    stats: {
      sampleSize: {
        value: '196',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '+25%',
        label: 'mRS 0-2 Benefit'
      }
    },
    trialDesign: {
      type: [
        'International multicenter randomized trial',
        'IV tPA alone vs IV tPA plus Solitaire thrombectomy',
        'Imaging-confirmed proximal anterior circulation occlusion',
        'Large ischemic cores excluded'
      ],
      timeline: 'Stopped early for efficacy after 196 patients'
    },
    efficacyResults: {
      treatment: {
        percentage: 60,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Stent Retriever + IV tPA'
      },
      control: {
        percentage: 35,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'IV tPA Alone'
      }
    },
    intervention: {
      treatment: 'Solitaire stent-retriever thrombectomy plus IV tPA',
      control: 'IV tPA alone'
    },
    clinicalContext: 'SWIFT PRIME reinforced that high-quality imaging selection and rapid stent-retriever reperfusion substantially improve disability outcomes in anterior circulation LVO.',
    pearls: [
      'Functional independence improved from 35% to 60%',
      'Substantial reperfusion at end of procedure reached 88%',
      'Median imaging-to-groin puncture time was 57 minutes',
      'No significant increase in mortality or symptomatic intracranial hemorrhage'
    ],
    conclusion: '',
    source: 'Saver et al. (NEJM 2015)',
    clinicalTrialsId: 'NCT01657461',
    listCategory: 'thrombectomy',
    listDescription: 'Solitaire thrombectomy trial showing large gains over IV tPA alone.',
    archetypeId: 'B',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa1415061',
    pmid: '25882376',
    inclusionCriteria: [
      'Age 18 to 80 years',
      'Acute ischemic stroke with NIHSS 8 to 29',
      'Proximal anterior circulation occlusion (intracranial ICA or M1 MCA) on CTA or MRA',
      'IV alteplase initiated within 4.5 hours of symptom onset',
      'Groin puncture achievable within 6 hours of onset',
      'Pre-stroke functional independence (mRS 0 or 1)',
      'Imaging selection excluding large established infarct core (initially RAPID-based core less than 50 mL; later simplified to ASPECTS 6 or higher)',
    ],
    exclusionCriteria: [
      'Large established infarct on baseline imaging',
      'Severe pre-stroke disability',
      'Standard contraindications to endovascular treatment',
      'Posterior circulation stroke',
      'Symptom onset to anticipated puncture beyond 6 hours',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Distribution of mRS 0 to 6 at 90 days for each arm as stacked segments. The shift toward lower scores in the EVT arm reflects the primary mRS shift analysis.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'Functional independence (mRS 0 to 2) was 60% with stent retriever plus alteplase versus 35% with alteplase alone, a 25 percentage point absolute gain (NNT of 4). The mRS shift analysis was significant at P less than 0.001.',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'SWIFT PRIME was stopped early at 196 of a planned 833 patients after positive interim analysis, which can inflate effect estimates. The trial is industry-sponsored (Covidien/Medtronic) and used the Solitaire device exclusively. Imaging selection criteria evolved during the trial.',
      },
    ],
    howToInterpret: {
      /* claimId: swift-prime-primary-result | source: Saver NEJM 2015 */
      proves: 'In patients with anterior circulation LVO who had started IV alteplase within 4.5 hours, Solitaire stent-retriever thrombectomy added to alteplase reduced disability across the full mRS distribution at 90 days (P less than 0.001 for shift analysis) and increased functional independence from 35% to 60%.',
      doesNotProve: 'It does not establish efficacy beyond the 6-hour treatment window or in patients without alteplase eligibility. It does not test direct thrombectomy without alteplase. With early termination at 196 patients, subgroup precision is limited.',
      cautions: 'Stopped early after 196 of 833 planned patients, increasing the risk of overestimating treatment effect. Industry-sponsored. Imaging eligibility criteria changed mid-trial from RAPID core to ASPECTS, limiting consistency. The high reperfusion rate (88% TICI 2b/3) and median imaging-to-puncture time of 57 minutes reflect highly experienced centers.',
    },
    /* claimId: swift-prime-bedside-pearl | source: Saver NEJM 2015 */
    bedsidePearl: 'For an alteplase-eligible LVO patient inside 6 hours with a small infarct core, SWIFT PRIME supports proceeding to Solitaire thrombectomy without delay. The primary mRS shift was significant and the functional independence gap was the largest of any 2015 trial that used a uniform device protocol (60% vs 35%, NNT of 4).',
    bottomLineSummary: 'SWIFT PRIME showed that adding Solitaire stent-retriever thrombectomy to IV alteplase in anterior circulation LVO patients within 6 hours of onset shifted the entire mRS distribution toward better outcomes and raised functional independence from 35% to 60%. The trial was stopped early for efficacy.',
    ordinalStats: {
      commonOR: 2.75,
      ciLow: 1.53,
      ciHigh: 4.95,
      direction: 'positive',
      pValue: 0.001,
    },
  },
  'thrace-trial': {
    id: 'thrace-trial',
    title: 'THRACE Trial',
    subtitle: 'Bridging Thrombectomy After Alteplase',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      populationExclusions: [
        'Bridging EVT+IVT vs IV alteplase alone — NOT a direct-EVT vs bridging-EVT comparison',
        'Heterogeneous devices and workflow; use as confirmatory landmark not current technical standard',
        'LVO ≤4h from stroke onset',
      ],
      geography: 'France',
    },
    stats: {
      sampleSize: {
        value: '414',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.028',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 1.55',
        label: 'Functional Independence Benefit'
      }
    },
    trialDesign: {
      type: [
        'Randomized controlled trial across 26 French centers',
        'IV alteplase alone vs IV alteplase plus mechanical thrombectomy',
        'Proximal cerebral artery occlusion',
        'IVT within 4 hours and thrombectomy within 5 hours'
      ],
      timeline: 'Enrolled 2010-2015'
    },
    efficacyResults: {
      treatment: {
        percentage: 53,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'IV Alteplase + Mechanical Thrombectomy'
      },
      control: {
        percentage: 42,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'IV Alteplase Alone'
      }
    },
    intervention: {
      treatment: 'IV alteplase followed by mechanical thrombectomy',
      control: 'IV alteplase alone'
    },
    clinicalContext: 'THRACE tested whether bridging thrombectomy improves outcomes after standard-dose alteplase in patients with proximal occlusions and supported bridging thrombectomy as the standard early EVT approach.',
    pearls: [
      'Functional independence increased from 42% to 53%',
      'Mortality and symptomatic intracranial hemorrhage were similar between groups',
      'Supports bridging therapy for eligible anterior circulation large-vessel occlusions',
      'Conducted before the widespread consolidation of modern thrombectomy practice'
    ],
    conclusion: '',
    source: 'Bracard et al. (Lancet Neurol 2016)',
    clinicalTrialsId: 'NCT01062698',
    listCategory: 'thrombectomy',
    listDescription: 'French bridging-therapy trial showing benefit from adding thrombectomy to alteplase.',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    inclusionCriteria: [
      'Age 18 to 80 years',
      'Acute ischemic stroke with NIHSS 10 to 25',
      'Proximal anterior circulation occlusion (intracranial ICA, M1, or upper basilar) confirmed by CTA or MRA',
      'IV alteplase started within 4 hours of symptom onset (0.9 mg/kg, max 90 mg)',
      'Mechanical thrombectomy able to begin within 5 hours of symptom onset',
    ],
    exclusionCriteria: [
      'Standard contraindications to IV alteplase',
      'Pre-stroke mRS greater than 1',
      'Intracranial hemorrhage on baseline imaging',
      'Established large infarct on baseline CT or MRI',
      'Severe comorbid disease limiting expected survival',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Functional independence (mRS 0 to 2) at 3 months in each arm. The bars compare IV alteplase plus thrombectomy versus IV alteplase alone for proximal anterior circulation occlusions treated within the early window.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'Functional independence was 53% with bridging thrombectomy versus 42% with alteplase alone (OR 1.55, 95% CI 1.05 to 2.30, P=0.028). The 11 percentage point absolute gain corresponds to a number needed to treat of 9 for one additional patient to be independent at 3 months.',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'THRACE enrolled from 2010 to 2015, before modern device standardization and before the direct-EVT trials. Results predate DIRECT-MT, MR CLEAN NO IV, SWIFT-DIRECT, and DEVT, so THRACE speaks to bridging therapy versus alteplase alone, not to whether alteplase can be safely skipped.',
      },
    ],
    howToInterpret: {
      /* claimId: thrace-primary-result | source: Bracard Lancet Neurol 2016 */
      proves: 'In alteplase-eligible patients aged 18 to 80 with proximal anterior circulation occlusion and NIHSS 10 to 25, adding mechanical thrombectomy to IV alteplase within 5 hours of onset increased functional independence (mRS 0 to 2) at 3 months from 42% to 53% (OR 1.55, 95% CI 1.05 to 2.30, P=0.028) without increasing mortality or symptomatic intracranial hemorrhage.',
      doesNotProve: 'It does not address whether direct thrombectomy without IV alteplase produces comparable outcomes. It does not extend evidence beyond 5 hours from onset, and it does not speak to patients with low NIHSS, distal occlusions, or large established infarcts.',
      cautions: 'THRACE predates the direct-EVT era (DIRECT-MT 2020, MR CLEAN NO IV 2021, SWIFT-DIRECT 2022, DEVT 2021), so its result that bridging therapy works does not settle the modern question of whether alteplase can be omitted. Devices, technique, and time-to-puncture metrics have all evolved since enrollment closed in 2015. Read THRACE alongside the 2015 stent-retriever trials, not as a stand-alone modern reference.',
    },
    /* claimId: thrace-bedside-pearl | source: Bracard Lancet Neurol 2016 */
    bedsidePearl: 'For an alteplase-eligible patient with proximal anterior circulation LVO and NIHSS 10 to 25 inside the early window, THRACE supports starting IV alteplase and proceeding to thrombectomy without delay. The 53% versus 42% gain (NNT 9) is consistent with the broader 2015 stent-retriever evidence base.',
    bottomLineSummary: 'THRACE showed that adding mechanical thrombectomy to IV alteplase in proximal anterior circulation LVO patients treated within 5 hours raised functional independence from 42% to 53% at 3 months, without increasing mortality or symptomatic hemorrhage.',
  },
  'direct-mt-trial': {
    id: 'direct-mt-trial',
    title: 'DIRECT-MT Trial',
    subtitle: 'Thrombectomy Alone vs Bridging Alteplase',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'Noninferiority margin was relatively permissive (lower bound mRS shift OR ≥0.80)',
        'Reperfusion before EVT favored bridging arm — do not use to justify routine IVT omission in Western practice',
        'Not adopted in US/European guidelines as basis for skipping IV thrombolysis',
      ],
    },
    stats: {
      sampleSize: {
        value: '656',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.04',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: 'OR 1.07',
        label: 'Met NI Margin'
      }
    },
    trialDesign: {
      type: [
        'Multicenter Chinese noninferiority trial',
        'Thrombectomy alone vs alteplase followed by thrombectomy',
        'Anterior circulation LVO within 4.5 hours',
        'Primary analysis based on mRS distribution at 90 days'
      ],
      timeline: 'Conducted at 41 tertiary centers'
    },
    efficacyResults: {
      treatment: {
        percentage: 79.4,
        label: 'Overall successful reperfusion',
        name: 'Thrombectomy Alone'
      },
      control: {
        percentage: 84.5,
        label: 'Overall successful reperfusion',
        name: 'Alteplase + Thrombectomy'
      }
    },
    intervention: {
      treatment: 'Direct endovascular thrombectomy alone',
      control: 'IV alteplase followed by endovascular thrombectomy'
    },
    clinicalContext: 'DIRECT-MT was one of the first large randomized trials testing whether IV alteplase can be omitted before thrombectomy in directly presenting eligible patients.',
    pearls: [
      'Met its prespecified noninferiority margin for functional outcome',
      'Pre-thrombectomy reperfusion was lower without alteplase: 2.4% vs 7.0%',
      'Overall reperfusion was also slightly lower in the direct EVT arm',
      'Mortality was similar: 17.7% vs 18.8%',
      'Helped launch the direct-EVT versus bridging-therapy debate'
    ],
    conclusion: '',
    source: 'Yang et al. (NEJM 2020)',
    doi: '10.1056/NEJMoa2001123',
    clinicalTrialsId: 'NCT03469206',
    specialDesign: 'non-inferiority',
    listCategory: 'thrombectomy',
    listDescription: 'Early direct-EVT noninferiority trial that intensified the bridge-vs-direct debate.',
    archetypeId: 'A',
    trialResult: 'NEUTRAL',
    resultSubtype: 'non-inferiority',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with anterior circulation large vessel occlusion (intracranial ICA, M1, or proximal M2)',
      'Eligible for IV alteplase per Chinese guidelines',
      'Endovascular treatment initiable within 4.5 hours of last known well',
      'NIHSS 2 or greater at presentation',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Contraindication to IV alteplase',
      'Posterior circulation occlusion',
      'Pre-existing functional disability (mRS 2 or greater)',
      'Anticipated delay in EVT initiation beyond 4.5 hours',
      'Pregnancy',
      'Life expectancy under 6 months',
    ],
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'Adjusted common odds ratio for the ordinal mRS shift at 90 days, comparing direct EVT to IV alteplase plus EVT. The point estimate is 1.07 with 95% CI 0.81 to 1.40. Values near 1.0 indicate similar distributions of disability across both arms.',
      },
      {
        question: 'How is non-inferiority judged here?',
        answer: 'The pre-specified non-inferiority margin was a lower 95% CI bound above 0.80 for the common OR. The observed lower bound was 0.81, just clearing the margin (P for NI = 0.04). Functional independence (mRS 0-2) at 90 days was 62.0% with direct EVT vs 58.5% with bridging.',
      },
      {
        question: 'What about pre-EVT reperfusion?',
        answer: 'Pre-EVT reperfusion was lower without alteplase: 2.4% (direct EVT) vs 7.0% (bridging). sICH (4.3% in both arms) and 90-day mortality (17.7% vs 18.8%) were similar.',
      },
    ],
    /* claimId: direct-mt-noninferiority | source: Yang NEJM 2020 */
    howToInterpret: {
      proves: 'In a Chinese tertiary-center population presenting within 4.5 hours of LVO stroke, omitting IV alteplase before EVT produced 90-day functional outcomes non-inferior to bridging therapy at a non-inferiority margin of OR 0.80. The lower bound of the CI cleared the margin by a narrow margin (0.81 vs 0.80).',
      doesNotProve: 'The trial does not establish superiority of direct EVT. It does not generalize to populations with longer EMS-to-EVT transfer times, to drip-and-ship workflows, or to non-Chinese cohorts where alteplase practice patterns and stroke-system logistics differ. It does not address tenecteplase.',
      cautions: 'Pre-EVT reperfusion was lower without alteplase (2.4% vs 7.0%), which matters for cases where EVT is delayed or fails. The narrow CI margin (lower bound 0.81 vs threshold 0.80) means the NI result is statistically fragile. Most patients were transferred directly to EVT-capable centers; results may not apply to mothership versus drip-and-ship decisions.',
    },
    /* claimId: direct-mt-bedside | source: Yang NEJM 2020 */
    bedsidePearl: 'DIRECT-MT met non-inferiority for direct EVT vs bridging in Chinese centers with short door-to-puncture times. Do not extrapolate to systems where transfer delays make pre-EVT reperfusion (lost from 7.0% to 2.4%) clinically meaningful. Continue IV thrombolysis per AHA/ASA recommendations unless local data and workflow support omission.',
    bottomLineSummary: 'Direct EVT was non-inferior to IV alteplase plus EVT for 90-day mRS shift in Chinese centers with rapid EVT access. The CI just cleared the pre-specified margin. Pre-EVT reperfusion was lower without alteplase. Does not establish superiority and does not generalize to drip-and-ship workflows.',
  },
  'devt-trial': {
    id: 'devt-trial',
    title: 'DEVT Trial',
    subtitle: 'Direct EVT vs Alteplase Plus EVT',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'Stopped early for efficacy — effect may be inflated',
        'NI margin −10% absolute on mRS 0-2; relatively permissive',
        'Not adopted in US/European guidelines as basis for skipping IV thrombolysis',
      ],
    },
    stats: {
      sampleSize: {
        value: '234',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.003',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: '+7.7%',
        label: 'Functional Independence Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized noninferiority trial',
        'Direct thrombectomy vs alteplase plus thrombectomy',
        'Proximal anterior circulation occlusion within 4.5 hours',
        'Conducted at 33 stroke centers in China'
      ],
      timeline: 'Enrolled 2018-2020; stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 54.3,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Direct EVT'
      },
      control: {
        percentage: 46.6,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Alteplase + EVT'
      }
    },
    intervention: {
      treatment: 'Endovascular thrombectomy alone',
      control: 'IV alteplase followed by endovascular thrombectomy'
    },
    clinicalContext: 'DEVT added further evidence from China that direct thrombectomy may achieve similar outcomes to bridging therapy in selected directly presenting alteplase-eligible patients.',
    pearls: [
      'Met its noninferiority threshold for 90-day functional independence',
      'Functional independence was numerically higher with direct EVT: 54.3% vs 46.6%',
      'Symptomatic intracerebral hemorrhage and mortality were similar between groups',
      'Interpretation depends on whether clinicians accept the prespecified noninferiority margin'
    ],
    conclusion: '',
    source: 'Zi et al. (JAMA 2021)',
    doi: '10.1001/jama.2020.23523',
    specialDesign: 'non-inferiority',
    listCategory: 'thrombectomy',
    listDescription: 'Chinese direct-EVT trial meeting noninferiority against alteplase plus thrombectomy.',
    archetypeId: 'A',
    trialResult: 'NEUTRAL',
    resultSubtype: 'non-inferiority',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with anterior circulation proximal large vessel occlusion (ICA or M1)',
      'Eligible for both IV alteplase and EVT',
      'Treatment initiable within 4.5 hours of symptom onset',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Contraindication to IV alteplase',
      'Posterior circulation or distal M2 occlusion',
      'Pre-existing functional disability',
      'Anticipated EVT initiation beyond 4.5-hour window',
      'Severe comorbidity limiting 90-day follow-up',
    ],
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'Proportion achieving functional independence (mRS 0-2) at 90 days. Direct EVT 54.3% vs IV alteplase plus EVT 46.6%. Risk difference +7.7 percentage points (95% CI -2.9 to 18.2).',
      },
      {
        question: 'How is non-inferiority judged here?',
        answer: 'The pre-specified non-inferiority margin was -10 percentage points. The lower CI bound (-2.9 pp) cleared this margin (P for NI = 0.003), meeting the NI threshold. The trial was stopped early at interim analysis.',
      },
      {
        question: 'Why is the wide NI margin a concern?',
        answer: 'A -10 pp margin is clinically large. The trial could meet NI while still permitting up to a 10-percentage-point absolute reduction in functional independence. Early stopping further inflates effect estimates. sICH (4.3% vs 3.4%) and mortality (14.7% vs 18.8%) were not significantly different.',
      },
    ],
    /* claimId: devt-noninferiority | source: Zi JAMA 2021 */
    howToInterpret: {
      proves: 'In Chinese stroke centers within 4.5 hours of proximal anterior circulation LVO, direct EVT met non-inferiority for 90-day mRS 0-2 vs IV alteplase plus EVT at a -10 percentage point margin. The trial was stopped early for efficacy of non-inferiority.',
      doesNotProve: 'The numerical advantage for direct EVT (54.3% vs 46.6%) does not establish superiority. Early stopping inflates the apparent effect size, and the wide -10 pp NI margin permits clinically meaningful harm that the data cannot exclude. Results do not generalize to populations with longer transfer logistics or different alteplase eligibility patterns.',
      cautions: 'The -10 pp NI margin is wider than most clinicians would accept as clinically equivalent. Early stopping limits precision. Sample size (N=234) is modest. Apply only to populations and workflows resembling Chinese tertiary centers with rapid EVT access.',
    },
    /* claimId: devt-bedside | source: Zi JAMA 2021 */
    bedsidePearl: 'DEVT met its non-inferiority threshold but at a -10 pp margin and after early stopping. The numerical 7.7 pp benefit favoring direct EVT is not superiority; treat as hypothesis-generating. Continue IV thrombolysis per guidelines unless local data and workflow specifically support omission.',
    bottomLineSummary: 'Direct EVT met non-inferiority vs alteplase plus EVT at a -10 pp margin in 234 Chinese patients with proximal LVO. Trial was stopped early. The wide margin and early stopping mean the numerical advantage for direct EVT cannot be interpreted as superiority. Does not change guideline-recommended bridging therapy.',
  },
  'skip-trial': {
    id: 'skip-trial',
    title: 'SKIP Trial',
    subtitle: 'Mechanical Thrombectomy Without vs With IV Thrombolysis',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-not-established',
    applicability: {
      doseSpecific: 'Japan-standard alteplase 0.6 mg/kg used (not the Western 0.9 mg/kg dose) — results not directly comparable to Western bridging trials',
      geography: 'Japan',
      populationExclusions: [
        'Wide confidence interval crosses the noninferiority boundary — inconclusive, not positive',
      ],
    },
    stats: {
      sampleSize: {
        value: '204',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.18',
        label: 'Failed NI Test'
      },
      effectSize: {
        value: 'OR 1.09',
        label: 'Wide CI; NI Not Proven'
      }
    },
    trialDesign: {
      type: [
        'Investigator-initiated Japanese noninferiority trial',
        'Mechanical thrombectomy alone vs low-dose alteplase plus thrombectomy',
        'LVO stroke without large ischemic core',
        'Open-label with randomized allocation'
      ],
      timeline: 'Enrolled 2017-2019 across 23 networks'
    },
    efficacyResults: {
      treatment: {
        percentage: 59.4,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy Alone'
      },
      control: {
        percentage: 57.3,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'IV Alteplase + Thrombectomy'
      }
    },
    intervention: {
      treatment: 'Mechanical thrombectomy alone',
      control: 'IV alteplase 0.6 mg/kg plus mechanical thrombectomy'
    },
    clinicalContext: 'SKIP tested whether direct thrombectomy could replace bridging therapy in Japan, where alteplase was given at a lower approved dose than in many Western trials.',
    pearls: [
      'Did not demonstrate noninferiority despite similar point estimates',
      'Functional independence was 59.4% vs 57.3%, but the confidence interval was too wide',
      'Any intracerebral hemorrhage was lower without IV thrombolysis',
      'Symptomatic hemorrhage and mortality were similar'
    ],
    conclusion: '',
    source: 'Suzuki et al. (JAMA 2021)',
    doi: '10.1001/jama.2020.23522',
    specialDesign: 'non-inferiority',
    archetypeId: 'A' as const,
    keyMessage: 'SKIP tested direct EVT against low-dose alteplase plus EVT in Japan and failed to demonstrate non-inferiority; statistically inconclusive.',
    listCategory: 'thrombectomy',
    listDescription: 'Japanese direct-EVT study that was inconclusive for noninferiority.',
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'The bar compares the proportion of patients reaching mRS 0-2 (functional independence) at 90 days in the thrombectomy-alone arm versus the alteplase-plus-thrombectomy arm. SKIP used Japan-approved low-dose alteplase 0.6 mg/kg in the bridging arm, not the Western 0.9 mg/kg dose.',
      },
      {
        question: 'How is non-inferiority judged here?',
        answer: 'The pre-specified non-inferiority margin was a one-sided lower 97.5% CI bound of common OR greater than 0.75. The observed OR was 1.09 (95% CI 0.72-1.64) with P for non-inferiority = 0.18. Because the lower CI bound (0.72) fell below the 0.75 threshold, non-inferiority was not met despite numerically similar mRS 0-2 rates (59.4% vs 57.3%).',
      },
      {
        question: 'What about safety and secondary outcomes?',
        answer: 'Any intracranial hemorrhage was significantly lower with thrombectomy alone (19.6% vs 28.4%, P = 0.04). Symptomatic ICH was numerically lower (4.9% vs 7.8%, not significant). 90-day mortality was similar (11.8% vs 13.7%).',
      },
    ],
    /* claimId: skip-noninferiority | source: Suzuki JAMA 2021 */
    howToInterpret: {
      proves: 'In a Japanese population using low-dose alteplase 0.6 mg/kg, mRS 0-2 rates at 90 days were numerically similar between thrombectomy alone and bridging alteplase plus thrombectomy (59.4% vs 57.3%, OR 1.09). However, the pre-specified non-inferiority threshold was not met: the lower 95% CI bound (0.72) fell below the margin of 0.75. Any ICH was significantly lower with thrombectomy alone (19.6% vs 28.4%, P = 0.04).',
      doesNotProve: 'Similar point estimates do not establish non-inferiority; the confidence interval was too wide to exclude clinically meaningful inferiority. SKIP does not support omitting alteplase before thrombectomy. Findings do not generalize to standard-dose alteplase (0.9 mg/kg) or to non-Japanese populations, and cannot be extrapolated to settings outside the 4.5-hour window.',
      cautions: 'The bridging comparator used Japan-approved 0.6 mg/kg alteplase, which is lower-intensity than the 0.9 mg/kg dose used in MR CLEAN-NO IV and SWIFT DIRECT. Even against this weaker comparator, non-inferiority failed. The trial was open-label and modestly sized (N=204), limiting precision. Numerical direction favored thrombectomy alone, but statistical inconclusiveness must be respected at the bedside.',
    },
    /* claimId: skip-bedside | source: Suzuki JAMA 2021 */
    bedsidePearl: 'Do not skip alteplase before thrombectomy on the basis of SKIP. Even with low-dose Japanese alteplase as comparator, non-inferiority failed. Give standard-dose IV thrombolysis in eligible LVO patients while activating the EVT pathway in parallel.',
    bottomLineSummary: 'Japanese non-inferiority trial of thrombectomy alone vs low-dose alteplase plus thrombectomy in LVO stroke within 4.5 hours. mRS 0-2 was numerically similar (59.4% vs 57.3%) but non-inferiority was not met (OR 1.09, 95% CI 0.72-1.64, lower bound below 0.75 margin). Lower any-ICH with direct EVT.',
    inclusionCriteria: [
      'Age 18 or older',
      'Acute ischemic stroke with LVO of intracranial ICA, M1, M2, or basilar artery',
      'NIHSS 6 to 29',
      'Eligible for IV thrombolysis',
      'Treatment within 4.5 hours of last known well',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Contraindication to IV alteplase',
      'Pre-stroke mRS greater than 1',
      'NIHSS less than 6 or greater than 29',
      'Presentation beyond 4.5 hours from last known well',
    ],
  },
  'mr-clean-no-iv-trial': {
    id: 'mr-clean-no-iv-trial',
    title: 'MR CLEAN-NO IV Trial',
    subtitle: 'Direct EVT in European Alteplase-Eligible Patients',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-not-established',
    applicability: {
      populationExclusions: [
        'Neither superiority nor non-inferiority of direct EVT was demonstrated',
        'Should be interpreted as a caution against routine omission of IV alteplase prior to EVT',
      ],
      geography: 'Europe (Netherlands)',
    },
    stats: {
      sampleSize: {
        value: '539',
        label: 'Patients in Analysis'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.28',
        label: 'Neither Superiority nor NI'
      },
      effectSize: {
        value: 'OR 0.84',
        label: 'Direct EVT Not Better'
      }
    },
    trialDesign: {
      type: [
        'Open-label multicenter European randomized trial',
        'Direct EVT vs alteplase followed by EVT',
        'Direct-to-EVT-center patients eligible for both treatments',
        'Tested superiority and noninferiority of EVT alone'
      ],
      timeline: 'Conducted across Europe'
    },
    efficacyResults: {
      treatment: {
        percentage: 20.5,
        label: 'Mortality at 90 days (lower is better)',
        name: 'EVT Alone'
      },
      control: {
        percentage: 15.8,
        label: 'Mortality at 90 days (lower is better)',
        name: 'Alteplase + EVT'
      }
    },
    intervention: {
      treatment: 'Endovascular treatment alone',
      control: 'IV alteplase followed by endovascular treatment'
    },
    clinicalContext: 'MR CLEAN-NO IV tested the direct-EVT strategy in a non-Asian population and did not support omitting alteplase before thrombectomy in directly presenting eligible patients.',
    pearls: [
      'EVT alone was neither superior nor noninferior to bridging therapy',
      'Median 90-day mRS favored the bridging arm: 2 vs 3',
      'Mortality was numerically higher with direct EVT: 20.5% vs 15.8%',
      'Symptomatic intracerebral hemorrhage was similar between groups'
    ],
    conclusion: '',
    source: 'LeCouffe et al. (NEJM 2021)',
    doi: '10.1056/NEJMoa2107727',
    specialDesign: 'non-inferiority',
    archetypeId: 'B' as const,
    keyMessage: 'MR CLEAN-NO IV argues against routinely skipping alteplase before EVT in eligible direct presenters.',
    listCategory: 'thrombectomy',
    listDescription: 'European direct-EVT trial showing neither superiority nor noninferiority over bridging therapy.',
    ordinalStats: { commonOR: 0.84, ciLow: 0.62, ciHigh: 1.15, direction: 'negative' as const, pValue: 0.28 },
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The forest-style display shows the adjusted common odds ratio for the ordinal mRS shift at 90 days, comparing direct EVT to alteplase 0.9 mg/kg plus EVT in patients presenting directly to an EVT-capable center. An OR less than 1.0 favors the bridging (alteplase plus EVT) arm.',
      },
      {
        question: 'How is the test judged here?',
        answer: 'The trial tested both superiority and non-inferiority. The adjusted common OR was 0.84 (95% CI 0.62-1.15, P = 0.28), so superiority of direct EVT was not demonstrated. The non-inferiority margin (-10 percentage points on mRS 0-2) was also not met. The point estimate (0.84) numerically favors bridging therapy.',
      },
      {
        question: 'What about safety and secondary outcomes?',
        answer: 'Median mRS was 3 with direct EVT vs 2 with bridging. mRS 0-2 was approximately 39.7% vs 44.3%. sICH was similar (5.9% vs 5.3%). 90-day mortality was numerically higher with direct EVT (20.5% vs 15.8%) but not statistically significant. TICI 2b-3 reperfusion was similar between arms.',
      },
    ],
    /* claimId: mr-clean-no-iv-ordinal | source: LeCouffe NEJM 2021 */
    howToInterpret: {
      proves: 'In a European population presenting directly to EVT centers within 4.5 hours, direct EVT was neither superior nor non-inferior to alteplase 0.9 mg/kg plus EVT for ordinal mRS at 90 days (adjusted common OR 0.84, 95% CI 0.62-1.15, P = 0.28). The non-inferiority margin was not met. The point estimate numerically favored bridging therapy, with median mRS of 2 (bridging) vs 3 (direct EVT).',
      doesNotProve: 'The trial does not prove that omitting alteplase causes harm; the CI crosses 1.0. However, near-equal numbers do not establish non-inferiority either. The confidence interval was too wide to exclude clinically meaningful inferiority of direct EVT, and the point estimate is on the harm side.',
      cautions: 'This is the most consistently negative trial in the direct-EVT family: numerically lower mRS 0-2 and numerically higher mortality with direct EVT, against the strongest comparator (standard-dose alteplase in a Western population). Patients arrived directly at EVT-capable centers; results do not address drip-and-ship workflows. Both superiority and non-inferiority were tested and neither was met, which is methodologically distinct from a pure non-inferiority design.',
    },
    /* claimId: mr-clean-no-iv-bedside | source: LeCouffe NEJM 2021 */
    bedsidePearl: 'Even at an EVT-capable center with thrombectomy minutes away, give IV alteplase 0.9 mg/kg first if the patient is eligible. MR CLEAN-NO IV showed numerically worse functional outcomes and higher mortality without alteplase, with the entire point estimate favoring bridging.',
    bottomLineSummary: 'European trial of direct EVT vs alteplase 0.9 mg/kg plus EVT in direct presenters at EVT centers within 4.5 hours. Adjusted common OR 0.84 (95% CI 0.62-1.15, P = 0.28). Neither superiority nor non-inferiority of direct EVT was demonstrated. Point estimate favors bridging therapy.',
    inclusionCriteria: [
      'Age 18 or older',
      'Direct presentation at an EVT-capable center',
      'Anterior or posterior circulation LVO',
      'Eligible for IV alteplase within 4.5 hours of symptom onset',
      'Eligible for endovascular treatment',
      'Pre-stroke mRS 0 to 2',
    ],
    exclusionCriteria: [
      'Contraindication to IV alteplase',
      'Transferred from a non-EVT center',
      'Pre-stroke mRS greater than 2',
      'Presentation beyond 4.5 hours from symptom onset',
    ],
  },
  'direct-safe-trial': {
    id: 'direct-safe-trial',
    title: 'DIRECT-SAFE Trial',
    subtitle: 'Direct EVT vs Bridging Therapy Within 4.5 Hours',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-not-established',
    applicability: {
      populationExclusions: [
        'Included basilar artery occlusions (mixed population)',
        'International multi-country cohort (AU/NZ/China/Vietnam) — heterogeneous systems of care',
        'Non-inferiority not established — do not use to justify skipping IVT',
      ],
    },
    stats: {
      sampleSize: {
        value: '295',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: 'Not Met',
        label: 'NI Margin Missed'
      },
      effectSize: {
        value: '-5.1%',
        label: 'Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'International multicenter randomized noninferiority trial',
        'Direct EVT vs bridging thrombolysis plus EVT',
        'Included ICA, M1, M2, and basilar occlusions',
        'Open-label with blinded endpoint assessment'
      ],
      timeline: 'Enrolled 2018-2021 across Australia, New Zealand, China, and Vietnam'
    },
    efficacyResults: {
      treatment: {
        percentage: 55,
        label: 'Functional independence (mRS 0-2 or return to baseline) at 90 days',
        name: 'Direct EVT'
      },
      control: {
        percentage: 61,
        label: 'Functional independence (mRS 0-2 or return to baseline) at 90 days',
        name: 'Bridging Therapy'
      }
    },
    intervention: {
      treatment: 'Direct endovascular thrombectomy',
      control: 'IV thrombolysis (alteplase or tenecteplase) followed by EVT'
    },
    clinicalContext: 'DIRECT-SAFE broadened the direct-EVT question to a more diverse international population and vascular anatomy, including posterior circulation and M2 occlusions.',
    pearls: [
      'Did not show noninferiority of direct EVT',
      'Functional independence favored bridging therapy: 61% vs 55%',
      'Safety outcomes were similar, including 1% symptomatic hemorrhage in both arms',
      'Guideline interpretation generally remains in favor of bridging therapy when alteplase eligible'
    ],
    conclusion: '',
    source: 'Mitchell et al. (Lancet 2022)',
    doi: '10.1016/S0140-6736(22)00564-5',
    clinicalTrialsId: 'NCT03494920',
    specialDesign: 'non-inferiority',
    archetypeId: 'A' as const,
    listCategory: 'thrombectomy',
    listDescription: 'International direct-EVT trial that did not support skipping thrombolysis.',
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'The bar compares the proportion of patients achieving mRS 0-2 or return to pre-stroke neurological baseline at 90 days, in direct EVT vs IV thrombolysis (alteplase or tenecteplase) plus EVT. Both arms received thrombectomy.',
      },
      {
        question: 'How is non-inferiority judged here?',
        answer: 'The pre-specified non-inferiority margin was -12 percentage points on adjusted risk difference. The observed primary outcome was 55.0% (direct EVT) vs 61.4% (bridging), with adjusted RD -5.1% (95% CI -15.4% to 5.3%). Because the lower CI bound (-15.4%) crossed the -12 pp margin, non-inferiority was not met.',
      },
      {
        question: 'What about safety and secondary outcomes?',
        answer: 'Symptomatic ICH was identical and very low in both arms (1.0% vs 1.0%), suggesting thrombolytics were not driving harm. 90-day mortality was similar between arms. Tenecteplase was permitted in some centers within the bridging arm.',
      },
    ],
    /* claimId: direct-safe-noninferiority | source: Mitchell Lancet 2022 */
    howToInterpret: {
      proves: 'In a geographically diverse cohort across Australia, New Zealand, China, and Vietnam, direct EVT did not meet non-inferiority versus IV thrombolysis plus EVT for the composite of mRS 0-2 or return to pre-stroke baseline at 90 days (55.0% vs 61.4%; adjusted RD -5.1%, 95% CI -15.4% to 5.3%). The lower CI bound (-15.4%) crossed the pre-specified non-inferiority margin of -12 percentage points. sICH was identical at 1.0% in both arms.',
      doesNotProve: 'Similar point estimates do not establish non-inferiority; the confidence interval was too wide to exclude clinically meaningful inferiority, and the lower bound crossed the margin by more than 3 percentage points. The trial does not support omitting thrombolysis before thrombectomy.',
      cautions: 'Tenecteplase was allowed alongside alteplase in the bridging arm, introducing heterogeneity that cannot be resolved at this sample size (N=295). The cohort included posterior circulation and M2 occlusions, broadening generalizability but reducing precision within subgroups. The very low sICH rate (1%) in both arms differs from other direct-EVT trials and may reflect population or technique differences.',
    },
    /* claimId: direct-safe-bedside | source: Mitchell Lancet 2022 */
    bedsidePearl: 'Give IV thrombolysis (alteplase or tenecteplase) in eligible LVO patients within 4.5 hours and do not delay for thrombectomy. DIRECT-SAFE failed non-inferiority by more than 3 percentage points beyond the margin, across diverse geography and vascular anatomy.',
    bottomLineSummary: 'International non-inferiority trial of direct EVT vs IV thrombolysis (alteplase or tenecteplase) plus EVT in LVO stroke within 4.5 hours. mRS 0-2 or pre-stroke baseline: 55.0% vs 61.4%; adjusted RD -5.1% (95% CI -15.4% to 5.3%). Non-inferiority not met (lower CI crossed -12 pp margin). sICH 1.0% in both arms.',
    inclusionCriteria: [
      'Age 18 or older',
      'Acute ischemic stroke with LVO of ICA, M1, M2, or basilar artery',
      'NIHSS 2 or greater',
      'Eligible for IV thrombolysis within 4.5 hours of symptom onset',
      'Pre-stroke mRS 0 to 2',
    ],
    exclusionCriteria: [
      'Contraindication to IV thrombolysis',
      'Pre-stroke mRS greater than 2',
      'Presentation beyond 4.5 hours from symptom onset',
      'NIHSS less than 2',
    ],
  },
  'swift-direct-trial': {
    id: 'swift-direct-trial',
    title: 'SWIFT DIRECT Trial',
    subtitle: 'Thrombectomy Alone vs Alteplase Plus Thrombectomy',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-not-established',
    applicability: {
      populationExclusions: [
        'Solitaire device only',
        'Non-inferiority not established; lower reperfusion without alteplase was a safety concern',
        'Do not combine with DIRECT-MT/DEVT as evidence that direct EVT is acceptable in Western practice',
      ],
    },
    stats: {
      sampleSize: {
        value: '423',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: 'Not Met',
        label: 'NI Margin Crossed'
      },
      effectSize: {
        value: '-7.3%',
        label: 'Adjusted Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'European and Canadian randomized noninferiority trial',
        'Thrombectomy alone vs alteplase plus thrombectomy',
        'Direct presenters at endovascular centers',
        'Primary endpoint: mRS 0-2 at 90 days'
      ],
      timeline: 'Enrolled 2017-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 57,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy Alone'
      },
      control: {
        percentage: 65,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Alteplase + Thrombectomy'
      }
    },
    intervention: {
      treatment: 'Stent-retriever thrombectomy alone',
      control: 'IV alteplase plus stent-retriever thrombectomy'
    },
    clinicalContext: 'SWIFT DIRECT was one of the major Western direct-EVT trials and found lower reperfusion rates when alteplase was omitted.',
    pearls: [
      'Failed to show noninferiority of thrombectomy alone',
      'Functional independence favored bridging therapy: 65% vs 57%',
      'Successful reperfusion was lower without alteplase: 91% vs 96%',
      'Symptomatic intracranial hemorrhage remained low in both groups'
    ],
    conclusion: '',
    source: 'Fischer et al. (Lancet 2022)',
    doi: '10.1016/S0140-6736(22)00537-2',
    clinicalTrialsId: 'NCT03192332',
    specialDesign: 'non-inferiority',
    archetypeId: 'A' as const,
    listCategory: 'thrombectomy',
    listDescription: 'Western direct-EVT trial that missed noninferiority and had lower reperfusion without alteplase.',
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'The bar compares the proportion of patients reaching mRS 0-2 (functional independence) at 90 days in stent-retriever thrombectomy alone vs alteplase 0.9 mg/kg plus stent-retriever thrombectomy. The trial enrolled direct presenters at comprehensive stroke centers within 4.5 hours.',
      },
      {
        question: 'How is non-inferiority judged here?',
        answer: 'The pre-specified non-inferiority margin was -10 percentage points on adjusted risk difference. The observed mRS 0-2 was 57.0% (thrombectomy alone) vs 65.0% (bridging), with adjusted RD -7.3% (95% CI -14.0% to -0.6%). The lower CI bound (-14.0%) crossed the -10 pp margin AND the upper bound (-0.6%) is also negative: the entire plausible range favors bridging.',
      },
      {
        question: 'What about safety and secondary outcomes?',
        answer: 'Final TICI 2b-3 reperfusion was significantly lower without alteplase (91% vs 96%). Pre-EVT vessel reopening on first angiogram was also significantly lower (1.4% vs 5.7%). sICH was similar (4.4% vs 3.3%) and 90-day mortality was approximately 15% in both arms.',
      },
    ],
    /* claimId: swift-direct-noninferiority | source: Fischer Lancet 2022 */
    howToInterpret: {
      proves: 'In a European and Canadian cohort presenting directly to comprehensive stroke centers within 4.5 hours, stent-retriever thrombectomy alone did not meet non-inferiority versus alteplase 0.9 mg/kg plus thrombectomy (mRS 0-2: 57.0% vs 65.0%; adjusted RD -7.3%, 95% CI -14.0% to -0.6%). The lower CI bound crossed the -10 pp non-inferiority margin, and the entire CI is negative: even the most optimistic plausible estimate favors bridging therapy. Reperfusion was also lower without alteplase (TICI 2b-3: 91% vs 96%).',
      doesNotProve: 'Similar point estimates do not establish non-inferiority. SWIFT DIRECT goes further than other direct-EVT trials: the upper CI bound (-0.6%) is below zero, so the data do not support equivalence either. The trial does not prove harm at the individual patient level, but it does rule out that thrombectomy alone is at least as good as bridging.',
      cautions: 'Restricted to anterior circulation proximal LVO (ICA or M1), age 18-80, and stent-retriever technique; does not address aspiration-first or distal occlusions. The mechanistic finding of lower reperfusion without alteplase (91% vs 96%) is biologically plausible: alteplase appears to assist catheter-based revascularization, not just precede it. Together with MR CLEAN-NO IV and DIRECT-SAFE, SWIFT DIRECT is the Western counterpart to the Asian direct-EVT trials and most strongly argues against omitting alteplase.',
    },
    /* claimId: swift-direct-bedside | source: Fischer Lancet 2022 */
    bedsidePearl: 'Give IV alteplase 0.9 mg/kg before thrombectomy in eligible anterior-circulation LVO. SWIFT DIRECT showed an 8-point absolute reduction in mRS 0-2 and 5-point lower TICI 2b-3 without alteplase, with the entire confidence interval favoring bridging therapy.',
    bottomLineSummary: 'European and Canadian non-inferiority trial of stent-retriever thrombectomy alone vs alteplase 0.9 mg/kg plus thrombectomy in anterior-circulation LVO within 4.5 hours. mRS 0-2: 57.0% vs 65.0%; adjusted RD -7.3% (95% CI -14.0% to -0.6%). Non-inferiority not met; the entire CI favors bridging. TICI 2b-3 reperfusion was significantly lower without alteplase.',
    inclusionCriteria: [
      'Age 18 to 80',
      'Direct presentation at a comprehensive stroke center',
      'Anterior circulation proximal LVO (ICA or M1)',
      'NIHSS 2 or greater',
      'Eligible for IV alteplase within 4.5 hours of symptom onset',
      'Pre-stroke mRS 0 to 2',
    ],
    exclusionCriteria: [
      'Contraindication to IV alteplase',
      'Posterior circulation occlusion',
      'M2 or more distal occlusion',
      'Age greater than 80',
      'Transferred from non-EVT center',
      'Pre-stroke mRS greater than 2',
    ],
  },
  'laste-trial': {
    id: 'laste-trial',
    title: 'LASTE Trial',
    subtitle: 'Thrombectomy for Large Infarct of Unrestricted Size',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'No upper core size limit — unrestricted large-core selection (cf. SELECT2/ANGEL-ASPECT which used ASPECTS/perfusion gates)',
      populationExclusions: [
        'Stopped early after external large-core evidence (SELECT2/ANGEL-ASPECT)',
        'Benefit represents disability shift and mortality reduction, not functional independence — many patients still severely disabled',
        'Higher sICH and procedural complications must be disclosed alongside efficacy',
      ],
    },
    stats: {
      sampleSize: {
        value: '333',
        label: 'Assigned Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 1.63',
        label: 'Better Disability Outcome'
      }
    },
    trialDesign: {
      type: [
        'Randomized large-core trial',
        'Thrombectomy plus medical care vs medical care alone',
        'Anterior circulation proximal occlusion with ASPECTS <=5',
        'Imaging by CT or MRI within 6.5 hours'
      ],
      timeline: 'Stopped early after external positive large-core data'
    },
    efficacyResults: {
      treatment: {
        percentage: 36.1,
        label: 'Death at 90 days (lower is better)',
        name: 'Thrombectomy + Medical Care'
      },
      control: {
        percentage: 55.5,
        label: 'Death at 90 days (lower is better)',
        name: 'Medical Care Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular thrombectomy plus medical care',
      control: 'Medical care alone'
    },
    clinicalContext: 'LASTE extended EVT evidence into patients with large established infarcts, including infarct volumes not capped by a strict upper limit, showing benefit despite higher hemorrhage risk.',
    pearls: [
      'Median 90-day mRS improved from 6 to 4 with thrombectomy',
      'Mortality fell substantially: 36.1% vs 55.5%',
      'Symptomatic intracerebral hemorrhage was higher with thrombectomy: 9.6% vs 5.7%',
      'Supports EVT in selected large-core patients rather than excluding them automatically'
    ],
    conclusion: '',
    source: 'Costalat et al. (NEJM 2024)',
    clinicalTrialsId: 'NCT03811769',
    listCategory: 'thrombectomy',
    listDescription: 'Large-core thrombectomy trial showing better outcomes and lower mortality despite more bleeding.',
    archetypeId: 'B',
    trialResult: 'POSITIVE',
    inclusionCriteria: [
      'Age 18 years or older (no upper age limit)',
      'Acute ischemic stroke from anterior circulation large vessel occlusion (intracranial ICA or M1)',
      'Large established infarct on imaging defined as ASPECTS 5 or lower on non-contrast CT, or DWI ASPECTS 5 or lower on MRI, with no lower limit on ASPECTS or infarct volume',
      'Treatment feasible within 6.5 hours of last-known-well',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Pre-stroke mRS greater than 1',
      'Intracranial hemorrhage on baseline imaging',
      'Posterior circulation occlusion',
      'Standard contraindications to endovascular thrombectomy',
      'Comorbid illness expected to limit 90-day follow-up',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The full mRS 0 to 6 distribution at 90 days for each arm. Because LASTE included unrestricted infarct size, the medical-care arm carries a heavy concentration in mRS 5 and 6, and the thrombectomy arm shifts that mass leftward toward lower disability scores.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'The median 90-day mRS was 4 with thrombectomy versus 6 with medical care alone. The generalized odds ratio for a one-step better mRS was 1.63 (95% CI 1.29 to 2.06, P less than 0.001), and 90-day mortality fell from 55.5% to 36.1% (adjusted RR 0.65, 95% CI 0.50 to 0.84). The number needed to treat for one patient to have a lower mRS at 90 days was 4.',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'Symptomatic intracerebral hemorrhage was higher with thrombectomy (9.6% versus 5.7%), and the trial was stopped early after external positive large-core data emerged. Most patients still ended with substantial disability; LASTE moves the curve, it does not normalize outcomes.',
      },
    ],
    howToInterpret: {
      /* claimId: laste-primary-result | source: Costalat NEJM 2024 */
      proves: 'In patients with anterior circulation LVO and a large established infarct (ASPECTS 5 or lower, with no lower limit on ASPECTS or infarct volume) treated within 6.5 hours, thrombectomy plus medical care shifted the full mRS distribution toward better outcomes at 90 days (generalized OR 1.63, 95% CI 1.29 to 2.06, P less than 0.001) and lowered all-cause mortality from 55.5% to 36.1% (adjusted RR 0.65, 95% CI 0.50 to 0.84). The median 90-day mRS improved from 6 to 4.',
      doesNotProve: 'It does not establish benefit beyond 6.5 hours from last-known-well, and it does not test thrombectomy in posterior circulation large infarcts. It does not show that most LASTE patients return to functional independence; the shift is from death and severe disability toward moderate or moderately-severe disability.',
      cautions: 'Symptomatic intracerebral hemorrhage was higher with thrombectomy (9.6% versus 5.7%), and 11 procedure-related complications occurred in the EVT arm. Most surviving patients remained dependent. The trial was stopped early on the basis of external large-core data, which can amplify estimated effect size. Selection of which large-core patients gain the most still requires individualized judgment about pre-stroke function, comorbidity, and goals of care.',
    },
    /* claimId: laste-bedside-pearl | source: Costalat NEJM 2024 */
    bedsidePearl: 'A very low ASPECTS is no longer an automatic disqualifier. For an anterior circulation LVO patient inside 6.5 hours with ASPECTS 5 or lower, even with no measured floor on infarct volume, LASTE supports offering thrombectomy. Frame the conversation around mortality reduction (55.5% to 36.1%) and median mRS shift from 6 to 4, not around full functional recovery.',
    bottomLineSummary: 'LASTE showed that thrombectomy benefits patients with large established infarcts (ASPECTS 5 or lower, with no lower bound) treated within 6.5 hours, shifting median 90-day mRS from 6 to 4 and lowering mortality from 55.5% to 36.1%, at the cost of more symptomatic hemorrhage.',
    ordinalStats: {
      commonOR: 1.63,
      ciLow: 1.29,
      ciHigh: 2.06,
      direction: 'positive',
      pValue: 0.0009, // Published Costalat NEJM 2024 reports P<0.001; store <0.001 so JSX conditional renders correctly
    },
  },
  'tension-trial': {
    id: 'tension-trial',
    title: 'TENSION Trial',
    subtitle: 'EVT for Large-Core Stroke Selected Mainly by Non-Contrast CT',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'NCCT ASPECTS 3–5 — no mandatory perfusion imaging; simpler selection than SELECT2/DEFUSE-3',
      populationExclusions: [
        'Stopped early for efficacy',
        'Large-core context — benefit is disability/mortality shift; independence rates remain low',
      ],
    },
    stats: {
      sampleSize: {
        value: '253',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.0001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 2.58',
        label: 'Better Disability Outcome'
      }
    },
    trialDesign: {
      type: [
        'Prospective multicenter randomized large-core trial',
        'EVT plus medical treatment vs medical treatment alone',
        'Anterior circulation LVO with ASPECTS 3-5',
        'Predominantly non-contrast CT selection up to 12 hours'
      ],
      timeline: 'Enrolled 2018-2023; stopped early for efficacy'
    },
    efficacyResults: {
      treatment: {
        percentage: 6,
        label: 'Symptomatic intracranial hemorrhage',
        name: 'EVT + Medical Treatment'
      },
      control: {
        percentage: 5,
        label: 'Symptomatic intracranial hemorrhage',
        name: 'Medical Treatment Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular thrombectomy plus medical treatment',
      control: 'Medical treatment alone'
    },
    clinicalContext: 'TENSION demonstrated large-core EVT benefit using mostly non-contrast CT, making it more applicable to real-world stroke systems without advanced perfusion imaging.',
    pearls: [
      'Functional outcome improved substantially with EVT (adjusted common OR 2.58)',
      'Mortality was lower with thrombectomy (hazard ratio 0.67)',
      'Used pragmatic ASPECTS 3-5 selection with non-contrast CT predominant',
      'Supports offering EVT to selected large-core patients even without advanced imaging'
    ],
    conclusion: '',
    source: 'Bendszus et al. (Lancet 2023)',
    clinicalTrialsId: 'NCT03094715',
    listCategory: 'thrombectomy',
    listDescription: 'Large-core EVT trial using pragmatic non-contrast CT selection rather than perfusion imaging.',
    archetypeId: 'B',
    trialResult: 'POSITIVE',
    inclusionCriteria: [
      'Age 18 years or older, with a pre-specified upper bound of 80 years per protocol',
      'Acute ischemic stroke from anterior circulation large vessel occlusion (intracranial ICA or M1)',
      'Large established infarct defined as ASPECTS 3 to 5 on non-contrast CT or DWI; perfusion imaging not required',
      'Treatment feasible within 12 hours of stroke onset or last-known-well',
      'NIHSS less than 26',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Pre-stroke mRS greater than 1',
      'High-grade extracranial stenosis requiring stent placement during EVT',
      'Vascular access or anatomy precluding endovascular thrombectomy',
      'Acute intracranial hemorrhage or significant mass effect',
      'Standard contraindications to endovascular thrombectomy',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The full mRS 0 to 6 distribution at 90 days in each arm. The TENSION population was selected almost entirely by non-contrast CT ASPECTS 3 to 5, so the chart represents pragmatic real-world selection without perfusion imaging.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'The median 90-day mRS was 4 with thrombectomy versus 5 with medical treatment alone. The adjusted common odds ratio for a one-step better mRS was 2.58 (95% CI 1.60 to 4.15, P=0.0001), and 90-day mortality fell from 51% to 40% (P=0.038). Symptomatic intracranial hemorrhage was similar in both arms (5%).',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'TENSION enrolled 253 patients before stopping early at the first interim analysis, which can inflate estimated effect size. The trial used pragmatic ASPECTS 3 to 5 selection and did not extend below ASPECTS 3, so it does not directly inform decisions in patients with ASPECTS 0 to 2.',
      },
    ],
    howToInterpret: {
      /* claimId: tension-primary-result | source: Bendszus Lancet 2023 */
      proves: 'In patients with anterior circulation LVO and a large established infarct defined as ASPECTS 3 to 5 by mostly non-contrast CT (perfusion imaging not required) treated within 12 hours, endovascular thrombectomy plus medical treatment shifted the full mRS distribution toward better outcomes at 90 days (adjusted common OR 2.58, 95% CI 1.60 to 4.15, P=0.0001) and lowered 90-day mortality from 51% to 40% without increasing symptomatic hemorrhage. Median 90-day mRS improved from 5 to 4.',
      doesNotProve: 'It does not establish benefit for ASPECTS 0 to 2, for posterior circulation large infarcts, or for treatment beyond 12 hours. It does not test thrombectomy versus medical treatment in patients with NIHSS 26 or higher. The trial was not powered to compare CT-only versus perfusion-based selection head to head.',
      cautions: 'TENSION used pragmatic ASPECTS 3 to 5 selection by non-contrast CT, often without CT perfusion or MRI; this is a feature for generalizability but means the trial cannot adjudicate whether perfusion imaging would identify a non-responder subset. The trial stopped early at the first interim analysis at 253 of a planned 665 patients, which can inflate estimated effect size. As with all large-core EVT, most surviving patients remain dependent.',
    },
    /* claimId: tension-bedside-pearl | source: Bendszus Lancet 2023 */
    bedsidePearl: 'For an anterior circulation LVO patient with ASPECTS 3 to 5 inside 12 hours, TENSION supports proceeding to thrombectomy on non-contrast CT alone; you do not need to wait for perfusion imaging to make the decision. Frame the discussion around mortality reduction (51% to 40%) and median mRS shift from 5 to 4, not around independence.',
    bottomLineSummary: 'TENSION showed that endovascular thrombectomy benefits anterior circulation LVO patients with large established infarcts (ASPECTS 3 to 5) selected mainly by non-contrast CT and treated within 12 hours, shifting median 90-day mRS from 5 to 4 and lowering mortality from 51% to 40% with no increase in symptomatic hemorrhage.',
    ordinalStats: {
      commonOR: 2.58,
      ciLow: 1.60,
      ciHigh: 4.15,
      direction: 'positive',
      pValue: 0.0001,
    },
  },
  'compass-trial': {
    id: 'compass-trial',
    title: 'COMPASS Trial',
    subtitle: 'Aspiration First Pass vs Stent Retriever First Line',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      populationExclusions: [
        'Device/technique strategy trial — not evidence that EVT itself helps vs no treatment',
        'Aspiration-first was noninferior to stent-retriever-first; supports either as first-line approach',
      ],
      geography: 'United States',
    },
    stats: {
      sampleSize: {
        value: '270',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'Noninferiority at 90 Days'
      },
      pValue: {
        value: '0.0014',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: '+2%',
        label: 'mRS 0-2 Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label noninferiority trial',
        'Aspiration first pass vs stent retriever first line',
        'Anterior circulation LVO within 6 hours',
        'Blinded outcome assessment with core-lab adjudication'
      ],
      timeline: 'Conducted at 15 North American sites'
    },
    efficacyResults: {
      treatment: {
        percentage: 52,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Aspiration First Pass'
      },
      control: {
        percentage: 50,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Stent Retriever First Line'
      }
    },
    intervention: {
      treatment: 'Direct aspiration first-pass thrombectomy',
      control: 'Stent retriever first-line thrombectomy'
    },
    clinicalContext: 'COMPASS compared two frontline thrombectomy strategies and helped legitimize aspiration-first approaches as an alternative to stent-retriever-first treatment.',
    pearls: [
      'Aspiration first pass was noninferior to stent retriever first line',
      'Functional independence was similar: 52% vs 50%',
      'All-cause mortality was identical at 22% in both groups',
      'Trial supported operator choice and device flexibility in modern EVT'
    ],
    conclusion: '',
    source: 'Turk et al. (Lancet 2019)',
    doi: '10.1016/S0140-6736(19)30297-1',
    clinicalTrialsId: 'NCT02466893',
    specialDesign: 'non-inferiority',
    listCategory: 'thrombectomy',
    listDescription: 'Device-strategy trial showing aspiration-first thrombectomy was noninferior to stent retrievers.',
    archetypeId: 'A',
    trialResult: 'NEUTRAL',
    resultSubtype: 'non-inferiority',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with anterior circulation large vessel occlusion (ICA terminus, M1, or M2)',
      'Groin puncture initiable within 6 hours of last known well',
      'NIHSS 6 or greater',
      'Pre-stroke mRS 0 or 1',
      'ASPECTS 6 or greater',
    ],
    exclusionCriteria: [
      'Posterior circulation occlusion',
      'Pre-existing functional disability (mRS 2 or greater)',
      'Tandem cervical occlusion requiring stenting',
      'Contraindication to contrast or anesthesia',
      'Life expectancy under 6 months',
    ],
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'Proportion achieving functional independence (mRS 0-2) at 90 days. Aspiration-first 52% vs stent-retriever-first 50%. Difference +2 percentage points (95% CI -8 to 11).',
      },
      {
        question: 'How is non-inferiority judged here?',
        answer: 'The pre-specified non-inferiority margin was -7 percentage points. The primary Bayesian analysis met NI (P for NI = 0.0014), though the frequentist CI lower bound (-8 pp) marginally crossed the margin. Despite lower aspiration first-pass reperfusion (68.9% vs 76.3% with stent retriever), clinical outcomes were equivalent.',
      },
      {
        question: 'What about reperfusion rates and procedure time?',
        answer: 'First-pass reperfusion was lower with aspiration first (68.9% vs 76.3% with stent retriever). Aspiration was faster (24 min vs 35 min to first reperfusion attempt). Mortality was identical at 22% in both arms. Overall mTICI 2b-3 at end of procedure was approximately 83% in both arms, with rescue device crossover closing the first-pass gap.',
      },
    ],
    /* claimId: compass-noninferiority | source: Turk Lancet 2019 */
    howToInterpret: {
      proves: 'In North American comprehensive stroke centers, contact-aspiration as first-line technique was non-inferior to stent-retriever first-line for 90-day mRS 0-2 in anterior circulation LVO treated within 6 hours. Operator and device flexibility is supported.',
      doesNotProve: 'The trial does not establish superiority of either technique. It does not address combined techniques (BADDASS), distal-medium-vessel occlusion, or basilar occlusion. It does not address newer-generation aspiration catheters or stent retrievers introduced after 2019.',
      cautions: 'Aspiration first-pass produced lower first-pass reperfusion rates (68.9% vs 76.3%); rescue with stent retriever was common and partially closed the gap. The frequentist CI lower bound (-8 pp) marginally crossed the -7 pp NI threshold. Results assume operator proficiency in both techniques and ready availability of rescue devices.',
    },
    /* claimId: compass-bedside | source: Turk Lancet 2019 */
    bedsidePearl: 'COMPASS supports operator choice between aspiration-first and stent-retriever-first as initial EVT technique. Lower first-pass reperfusion with aspiration (68.9% vs 76.3%) did not translate to worse 90-day outcomes when rescue devices were available. Choose based on clot characteristics, operator experience, and access anatomy.',
    bottomLineSummary: 'Contact-aspiration as first-line technique was non-inferior to stent-retriever first-line for 90-day functional outcome in anterior circulation LVO. Aspiration produced lower first-pass reperfusion but equivalent clinical outcomes. Supports flexibility in initial technique choice.',
  },
  'aster-trial': {
    id: 'aster-trial',
    title: 'ASTER Trial',
    subtitle: 'Contact Aspiration vs Stent Retriever Revascularization',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    primaryDesign: 'binary-superiority',
    primaryResult: 'not-met',
    applicability: {
      populationExclusions: [
        'Contact aspiration was not superior to stent retriever for first-line revascularization',
        'Device/technique comparison — supports either approach depending on anatomy and operator expertise',
        'France only (single-country)',
      ],
    },
    stats: {
      sampleSize: {
        value: '381',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mTICI 2b-3',
        label: 'Successful Revascularization'
      },
      pValue: {
        value: '0.53',
        label: 'Not Significant'
      },
      effectSize: {
        value: '85.4% vs 83.1%',
        label: 'No Primary Difference'
      }
    },
    trialDesign: {
      type: [
        'Randomized open-label, blinded endpoint trial',
        'First-line contact aspiration vs first-line stent retriever',
        'Anterior circulation LVO within 6 hours',
        'Conducted in 8 French comprehensive stroke centers'
      ],
      timeline: 'Enrolled 2015-2016'
    },
    efficacyResults: {
      treatment: {
        percentage: 85.4,
        label: 'Successful revascularization (mTICI 2b-3)',
        name: 'Contact Aspiration First Line'
      },
      control: {
        percentage: 83.1,
        label: 'Successful revascularization (mTICI 2b-3)',
        name: 'Stent Retriever First Line'
      }
    },
    intervention: {
      treatment: 'First-line contact aspiration thrombectomy',
      control: 'First-line stent retriever thrombectomy'
    },
    clinicalContext: 'ASTER directly compared aspiration-first and stent-retriever-first approaches at a time when device strategy was still unsettled in daily EVT practice.',
    pearls: [
      'No significant difference in final successful revascularization',
      'Clinical outcomes at 90 days were also similar',
      'Trial suggests either strategy is acceptable as a first-line approach',
      'Addresses device selection rather than patient selection; aspiration and stent retriever are interchangeable as first-line approaches'
    ],
    conclusion: '',
    source: 'Lapergue et al. (JAMA 2017)',
    doi: '10.1001/jama.2017.9644',
    clinicalTrialsId: 'NCT02523261',
    specialDesign: 'neutral-trial',
    listCategory: 'thrombectomy',
    listDescription: 'Device-comparison trial showing no clear advantage for aspiration over stent retrievers.',
    archetypeId: 'A',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with anterior circulation large vessel occlusion (ICA, M1, or M2)',
      'Groin puncture initiable within 6 hours of symptom onset',
      'NIHSS 6 or greater',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Posterior circulation occlusion',
      'Pre-existing functional disability',
      'Contraindication to general anesthesia or sedation',
      'Tandem cervical lesion requiring stenting',
      'Life expectancy under 6 months',
    ],
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'Successful revascularization (mTICI 2b-3) at end of procedure: 85.4% with contact aspiration first vs 83.1% with stent retriever first. P = 0.53. Note: this is a procedural endpoint, not a clinical outcome measure.',
      },
      {
        question: 'What about clinical outcomes?',
        answer: 'mRS 0-2 at 90 days was 45.3% (aspiration) vs 50.3% (stent retriever); P = 0.19. sICH was identical at 8.8% in both arms. Mortality was 25.0% vs 21.9% (P = 0.49). No statistically significant difference in any clinical endpoint.',
      },
      {
        question: 'Why does the rescue rate matter?',
        answer: 'Rescue stent retriever was used in 25.2% of patients in the aspiration arm. The 85.4% reperfusion figure includes patients who needed crossover. Operator readiness to switch techniques is part of how this equivalent result was achieved.',
      },
    ],
    /* claimId: aster-null-difference | source: Lapergue JAMA 2017 */
    howToInterpret: {
      proves: 'Contact aspiration as first-line technique produced similar end-of-procedure revascularization rates to stent retriever first-line in French comprehensive stroke centers. Clinical outcomes including mRS 0-2 (45.3% vs 50.3%) were not significantly different between arms.',
      doesNotProve: 'The primary endpoint was procedural (mTICI 2b-3), not clinical. The trial was not powered to detect modest clinical differences. The numerically lower mRS 0-2 rate with aspiration (45.3% vs 50.3%) is not statistically significant but is not excluded by the data. The trial does not address combined techniques or distal occlusions.',
      cautions: 'Rescue stent retriever was used in 25.2% of the aspiration arm; the headline reperfusion figure depends on this crossover. Procedural endpoints do not always translate to clinical outcomes. ASTER chose mTICI as primary, which limits clinical inference. Single-country (French) cohort enrolled 2015 to 2016.',
    },
    /* claimId: aster-bedside | source: Lapergue JAMA 2017 */
    bedsidePearl: 'ASTER showed no significant difference between aspiration-first and stent-retriever-first for revascularization or 90-day outcomes, but rescue device use was 25.2% in the aspiration arm. Choice of first-line technique is operator-dependent; readiness to switch techniques is part of getting equivalent outcomes.',
    bottomLineSummary: 'No significant difference between contact-aspiration first-line and stent-retriever first-line for end-of-procedure revascularization (85.4% vs 83.1%) or 90-day mRS 0-2 (45.3% vs 50.3%). Rescue stent retriever was used in 25.2% of the aspiration arm. Supports operator choice with readiness to switch.',
  },
  'aster2-trial': {
    id: 'aster2-trial',
    title: 'ASTER2 Trial',
    subtitle: 'Combined Aspiration + Stent Retriever vs Stent Retriever Alone',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    primaryDesign: 'binary-superiority',
    primaryResult: 'not-met',
    applicability: {
      populationExclusions: [
        'Combined aspiration + stent retriever first-line was not superior to stent retriever alone',
        'Device/technique strategy trial — no standard-of-care change implied',
      ],
      geography: 'France',
    },
    stats: {
      sampleSize: {
        value: '408',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'eTICI 2c-3',
        label: 'End-of-Procedure Reperfusion'
      },
      pValue: {
        value: '0.17',
        label: 'Not Significant'
      },
      effectSize: {
        value: '+6.6%',
        label: 'Primary Endpoint Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label, blinded-endpoint trial',
        'Combined contact aspiration plus stent retriever vs stent retriever alone',
        'Anterior circulation LVO within 8 hours',
        'Conducted in 11 French comprehensive stroke centers'
      ],
      timeline: 'Enrolled 2017-2018 with 12-month follow-up'
    },
    efficacyResults: {
      treatment: {
        percentage: 64.5,
        label: 'Near-total or total reperfusion (eTICI 2c-3)',
        name: 'Combined Aspiration + Stent Retriever'
      },
      control: {
        percentage: 57.9,
        label: 'Near-total or total reperfusion (eTICI 2c-3)',
        name: 'Stent Retriever Alone'
      }
    },
    intervention: {
      treatment: 'Initial thrombectomy with combined contact aspiration and stent retriever',
      control: 'Initial thrombectomy with stent retriever alone'
    },
    clinicalContext: 'ASTER2 asked whether combining the two leading thrombectomy techniques from the outset could improve angiographic results over standard stent-retriever-first treatment.',
    pearls: [
      'Primary endpoint was not significantly improved',
      'Combined therapy improved some secondary angiographic measures after the assigned initial pass',
      'Final clinical implication: routine combined first-line use was not established',
      'Useful trial for EVT technique optimization rather than selection of who should receive EVT'
    ],
    conclusion: '',
    source: 'Lapergue et al. (JAMA 2021)',
    doi: '10.1001/jama.2021.13827',
    clinicalTrialsId: 'NCT03290885',
    specialDesign: 'neutral-trial',
    listCategory: 'thrombectomy',
    listDescription: 'Technical EVT trial showing no clear final reperfusion advantage from upfront combined strategy.',
    archetypeId: 'A',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with anterior circulation large vessel occlusion (ICA, M1, or M2)',
      'Groin puncture initiable within 8 hours of symptom onset',
      'NIHSS 6 or greater',
      'Pre-stroke mRS 0 or 1',
    ],
    exclusionCriteria: [
      'Posterior circulation occlusion',
      'Pre-existing functional disability',
      'Contraindication to anesthesia or contrast',
      'Tandem cervical lesion requiring stenting',
      'Life expectancy under 6 months',
    ],
    howToReadChart: [
      {
        question: 'What does the bar show?',
        answer: 'Near-total reperfusion (eTICI 2c-3) at end of procedure: 64.5% with combined aspiration plus stent retriever (BADDASS technique) vs 57.9% with stent retriever alone. P = 0.17. Note: this is a procedural endpoint, not a clinical outcome measure.',
      },
      {
        question: 'What about clinical outcomes?',
        answer: 'mRS 0-2 at 90 days was 48.5% (combined) vs 49.5% (stent retriever alone). Mortality was 21.7% vs 19.7% (P = 0.58). sICH was 6.9% vs 5.4%. No clinical endpoint differed significantly.',
      },
      {
        question: 'Why does eTICI 2c-3 matter?',
        answer: 'eTICI 2c-3 represents near-complete reperfusion, which correlates more tightly with good clinical outcome than mTICI 2b. ASTER2 hypothesized that combining techniques would improve this endpoint. The 6.6 pp numerical advantage was not statistically significant, and combined technique required longer procedure time.',
      },
    ],
    /* claimId: aster2-null-difference | source: Lapergue JAMA 2021 */
    howToInterpret: {
      proves: 'Combining contact aspiration with stent retriever (BADDASS technique) as first-pass technique did not significantly improve near-total reperfusion (eTICI 2c-3) compared to stent retriever alone in French comprehensive stroke centers. Clinical outcomes including mRS 0-2 (48.5% vs 49.5%) were not significantly different.',
      doesNotProve: 'The trial does not exclude a small benefit from combined technique that this sample size could not detect. It does not address the role of combined technique as rescue after stent-retriever failure. It does not address newer aspiration catheters or balloon-guide configurations.',
      cautions: 'Combined technique required longer procedure time and higher device burden. The 6.6 pp numerical advantage in eTICI 2c-3 (64.5% vs 57.9%) was not statistically significant but is not excluded. Procedural endpoint was primary; clinical inference is secondary. Single-country (French) cohort enrolled 2017 to 2018.',
    },
    /* claimId: aster2-bedside | source: Lapergue JAMA 2021 */
    bedsidePearl: 'ASTER2 did not show that routine first-pass combined aspiration plus stent retriever improves reperfusion or clinical outcome over stent retriever alone. The 6.6 pp numerical advantage in eTICI 2c-3 came at the cost of longer procedure time and added device burden. Reserve combined technique for rescue or operator-specific indications.',
    bottomLineSummary: 'Routine first-pass combined aspiration plus stent retriever (BADDASS) did not significantly improve near-total reperfusion (64.5% vs 57.9%) or 90-day mRS 0-2 (48.5% vs 49.5%) compared to stent retriever alone. Combined technique took longer. Does not support routine first-pass combination; reserve for rescue.',
  },
  'choice-trial': {
    id: 'choice-trial',
    title: 'CHOICE Trial',
    subtitle: 'Adjunct Intra-arterial Alteplase After Successful Thrombectomy',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      populationExclusions: [
        'Small trial (N=121); stopped early due to alteplase supply shortage — underpowered, effect size likely inflated',
        'Requires confirmation; CHOICE-2 replication trial in progress',
        'Adjunct IA alteplase after successful EVT only (eTICI ≥2b) — not a pre-EVT or bridging intervention',
      ],
    },
    stats: {
      sampleSize: {
        value: '121',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.047',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '+18.4%',
        label: 'Adjusted Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Phase 2b randomized double-blind placebo-controlled trial',
        'Adjunct intra-arterial alteplase after successful thrombectomy',
        'Large vessel occlusion with eTICI 2b50-3 reperfusion',
        'Conducted at 7 stroke centers in Catalonia'
      ],
      timeline: 'Enrolled 2018-2021; stopped early during the pandemic'
    },
    efficacyResults: {
      treatment: {
        percentage: 59.0,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Intra-arterial Alteplase'
      },
      control: {
        percentage: 40.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Adjunct intra-arterial alteplase infused after successful thrombectomy',
      control: 'Placebo after successful thrombectomy'
    },
    clinicalContext: 'CHOICE tested whether incomplete microvascular reperfusion after technically successful thrombectomy could be improved with low-dose intra-arterial alteplase.',
    pearls: [
      'Adjunct IA alteplase increased excellent outcome from 40.4% to 59.0%',
      'Symptomatic intracranial hemorrhage was not increased',
      'Trial stopped early and was relatively small, so replication is still needed',
      'Small study stopped early; replication needed before routine use of adjunct IA alteplase post-thrombectomy'
    ],
    conclusion: '',
    source: 'Renu et al. (JAMA 2022)',
    clinicalTrialsId: 'NCT03876119',
    listCategory: 'thrombectomy',
    listDescription: 'Post-thrombectomy adjunct IA alteplase trial suggesting better excellent outcomes.',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke from large vessel occlusion treated with thrombectomy within 24 hours of onset',
      'Successful reperfusion after thrombectomy defined as expanded TICI (eTICI) 2b50 or higher',
      'Pre-stroke functional independence',
      'Adjunct intra-arterial alteplase administered immediately after the procedure (0.225 mg/kg, max 22.5 mg, infused over 15 to 30 minutes)',
    ],
    exclusionCriteria: [
      'Any contraindication to IV alteplase per local guidelines (other than time to therapy)',
      'Admission NIHSS greater than 25',
      'Complete clinical recovery during the angiography procedure',
      'ASPECTS less than 6 on non-contrast CT if symptom duration was less than 4.5 hours',
      'Use of oral anticoagulants (a major exclusion in practice)',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The proportion of patients reaching an excellent outcome (mRS 0 to 1) at 90 days in each arm after successful reperfusion (eTICI 2b50 or higher) from thrombectomy. The comparator is placebo, not no thrombectomy.',
      },
      {
        question: 'What do the numbers mean clinically?',
        answer: 'Excellent outcome was 59.0% with adjunct intra-arterial alteplase versus 40.4% with placebo (adjusted risk difference 18.4%, 95% CI 0.3% to 36.4%, P=0.047). Functional independence (mRS 0 to 2) was 83.6% versus 63.5%. Symptomatic intracranial hemorrhage at 24 hours was 0% versus 3.8%.',
      },
      {
        question: 'What is the key limitation to keep in mind?',
        answer: 'CHOICE was a Phase 2b trial that enrolled only 121 of a planned 200 patients before stopping early during the COVID-19 pandemic and placebo supply expiration. The 95% CI for the primary outcome reached the floor of 0.3%, meaning the result is statistically significant but borderline. Replication in a larger Phase 3 trial is needed before routine adoption.',
      },
    ],
    howToInterpret: {
      /* claimId: choice-primary-result | source: Renu JAMA 2022 */
      proves: 'In a Phase 2b trial of 121 patients with large vessel occlusion stroke who achieved eTICI 2b50 or higher reperfusion from thrombectomy, adjunct intra-arterial alteplase (0.225 mg/kg, max 22.5 mg) immediately after the procedure increased the rate of excellent functional outcome (mRS 0 to 1) at 90 days from 40.4% to 59.0% (adjusted risk difference 18.4%, 95% CI 0.3% to 36.4%, P=0.047), with no excess symptomatic intracranial hemorrhage at 24 hours.',
      doesNotProve: 'Because the primary endpoint was mRS 0 to 1 rather than mRS 0 to 2, CHOICE does not establish a benefit for the standard functional independence threshold used in most thrombectomy trials. It does not establish a population-wide standard of care; the 95% CI lower bound of 0.3% means the magnitude of benefit is highly uncertain. It does not address adjunct intra-arterial therapy after incomplete reperfusion (eTICI less than 2b50).',
      cautions: 'CHOICE is Phase 2b evidence (N=121), stopped early at 60% of planned enrollment during the pandemic, with a confidence interval that nearly crosses zero. Patients on oral anticoagulants were excluded, and only about 7% of thrombectomy patients in participating centers were eligible, limiting generalizability. Replication in a larger Phase 3 trial is required before routine use of adjunct intra-arterial alteplase after successful thrombectomy.',
    },
    /* claimId: choice-bedside-pearl | source: Renu JAMA 2022 */
    bedsidePearl: 'CHOICE is hypothesis-generating, not practice-changing. After successful thrombectomy (eTICI 2b50 or higher), adjunct intra-arterial alteplase improved excellent outcome from 40.4% to 59.0% in 121 patients, but the trial was stopped early during COVID and the lower bound of the 95% CI was 0.3%. Wait for Phase 3 replication before adopting routinely.',
    bottomLineSummary: 'CHOICE was a small Phase 2b trial (N=121) suggesting that adjunct intra-arterial alteplase after successful thrombectomy improves excellent functional outcome (mRS 0 to 1) at 90 days from 40.4% to 59.0%. The trial stopped early during COVID, the confidence interval was wide, and replication is needed before routine use.',
  },
  'rescue-bt-trial': {
    id: 'rescue-bt-trial',
    title: 'RESCUE BT Trial',
    subtitle: 'Intravenous Tirofiban Before Endovascular Thrombectomy',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'not-met',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'IV tirofiban before EVT did not improve functional outcome vs placebo',
        'Does not support routine GP IIb/IIIa pretreatment before EVT',
        'May remain relevant for rescue stenting/ICAS subgroups — not proven broadly',
      ],
    },
    stats: {
      sampleSize: {
        value: '948',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.51',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.08',
        label: 'No Disability Benefit'
      }
    },
    trialDesign: {
      type: [
        'Investigator-initiated randomized double-blind placebo-controlled trial',
        'IV tirofiban vs placebo before EVT',
        'Proximal intracranial LVO within 24 hours',
        'Conducted at 55 hospitals in China'
      ],
      timeline: 'Enrolled 2018-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 36.3,
        label: 'mRS 0-1 or return to premorbid baseline at 90 days',
        name: 'IV Tirofiban + EVT'
      },
      control: {
        percentage: 32.4,
        label: 'mRS 0-1 or return to premorbid baseline at 90 days',
        name: 'Placebo + EVT'
      }
    },
    intervention: {
      treatment: 'Intravenous tirofiban before endovascular thrombectomy',
      control: 'Placebo before endovascular thrombectomy'
    },
    clinicalContext: 'RESCUE BT tested whether aggressive antiplatelet therapy before thrombectomy could improve microvascular patency and overall outcomes in LVO stroke.',
    pearls: [
      'No significant improvement in 90-day disability distribution with tirofiban',
      'Symptomatic intracranial hemorrhage was numerically higher: 9.7% vs 6.4%',
      'Mortality was similar between groups',
      'Does not support routine pre-EVT tirofiban use'
    ],
    conclusion: '',
    source: 'RESCUE BT Investigators (JAMA 2022)',
    doi: '10.1001/jama.2022.12584',
    specialDesign: 'negative-trial',
    archetypeId: 'B' as const,
    listCategory: 'thrombectomy',
    listDescription: 'Adjunct pre-EVT tirofiban trial showing no functional benefit.',
    ordinalStats: { commonOR: 1.08, ciLow: 0.87, ciHigh: 1.34, direction: 'positive' as const, pValue: 0.51 },
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The forest-style display shows the adjusted common odds ratio for the ordinal mRS shift at 90 days, comparing IV tirofiban (10 mcg/kg bolus then 0.15 mcg/kg/min for 24 hours) given before and during thrombectomy vs IV placebo. Both arms received endovascular thrombectomy.',
      },
      {
        question: 'How is the test judged here?',
        answer: 'The trial was a superiority design. Adjusted common OR was 1.08 (95% CI 0.87-1.34, P = 0.51), which crosses 1.0 and is not statistically significant. mRS 0-1 was 36.3% (tirofiban) vs 32.4% (placebo) and mRS 0-2 was approximately 53-54% in both arms.',
      },
      {
        question: 'What about safety and secondary outcomes?',
        answer: 'Symptomatic ICH was significantly higher with tirofiban (9.7% vs 6.4%, P = 0.04). 90-day mortality was similar (18.3% vs 17.3%). Successful reperfusion (TICI 2b-3) was approximately 83% in both arms. The combination of null efficacy and increased sICH represents a net harm signal.',
      },
    ],
    /* claimId: rescue-bt-ordinal | source: RESCUE BT Investigators JAMA 2022 */
    howToInterpret: {
      proves: 'In Chinese patients with acute LVO stroke treated with thrombectomy within 24 hours, peri-procedural IV tirofiban did not improve 90-day functional outcome compared with placebo (adjusted common OR 1.08, 95% CI 0.87-1.34, P = 0.51). Symptomatic ICH was significantly higher with tirofiban (9.7% vs 6.4%, P = 0.04). The combination of null efficacy and a significant safety signal argues against routine peri-EVT tirofiban use.',
      doesNotProve: 'The trial does not exclude potential benefit in narrowly defined subgroups (for example, intracranial atherosclerotic disease with rescue stenting), which were not the primary question. It does not address tirofiban given for other indications such as carotid stenting or post-procedural reocclusion management.',
      cautions: 'Single-country (China) cohort, which limits generalizability; population includes posterior circulation and broader LVO definitions. The sICH increase (P = 0.04) is the most actionable finding from a null efficacy trial: when adding an antiplatelet agent does not help and increases bleeding, the default position is not to add it. Reperfusion rates were similar (~83%), so the harm is not offset by mechanical benefit.',
    },
    /* claimId: rescue-bt-bedside | source: RESCUE BT Investigators JAMA 2022 */
    bedsidePearl: 'Do not give peri-procedural IV tirofiban as routine adjunct to thrombectomy. RESCUE BT showed no functional benefit and a significant increase in symptomatic ICH (9.7% vs 6.4%). Reserve GP IIb/IIIa inhibitors for selected indications such as rescue stenting in intracranial atherosclerosis, not for general LVO thrombectomy.',
    bottomLineSummary: 'Chinese double-blind placebo-controlled trial of peri-procedural IV tirofiban vs placebo during thrombectomy in LVO stroke within 24 hours. Adjusted common OR 1.08 (95% CI 0.87-1.34, P = 0.51): no functional benefit. Symptomatic ICH significantly higher with tirofiban (9.7% vs 6.4%, P = 0.04). Net harm signal.',
    inclusionCriteria: [
      'Age 18 to 80',
      'Acute ischemic stroke with intracranial LVO (anterior or posterior circulation)',
      'NIHSS 4 or greater',
      'Treatment within 24 hours of last known well',
      'Pre-stroke mRS 0 to 2',
    ],
    exclusionCriteria: [
      'Active bleeding or high bleeding risk',
      'Recent major surgery or trauma',
      'Contraindication to GP IIb/IIIa inhibitors',
      'Pre-stroke mRS greater than 2',
      'Presentation beyond 24 hours from last known well',
    ],
  },
  'enchanted-trial': {
    id: 'enchanted-trial',
    title: 'ENCHANTED Trial',
    subtitle: 'Intensive Blood Pressure Reduction During IV Alteplase Treatment',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '2196',
        label: 'Alteplase-Eligible Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.87',
        label: 'No Functional Difference'
      },
      effectSize: {
        value: 'OR 0.75',
        label: 'Less Any ICH'
      }
    },
    trialDesign: {
      type: [
        'International randomized open-label trial with blinded endpoint assessment',
        'Intensive SBP target 130-140 mm Hg vs guideline target <180 mm Hg',
        'Adults with acute ischemic stroke eligible for IV alteplase',
        'Blood pressure strategy applied for 72 hours'
      ],
      timeline: 'Conducted at 110 sites in 15 countries'
    },
    efficacyResults: {
      treatment: {
        percentage: 14.8,
        label: 'Any intracranial hemorrhage (lower is better)',
        name: 'Intensive BP Lowering'
      },
      control: {
        percentage: 18.7,
        label: 'Any intracranial hemorrhage (lower is better)',
        name: 'Guideline BP Lowering'
      }
    },
    intervention: {
      treatment: 'Target systolic blood pressure 130-140 mm Hg within 1 hour, maintained for 72 hours during and after alteplase treatment',
      control: 'Guideline blood pressure treatment with systolic blood pressure kept below 180 mm Hg'
    },
    clinicalContext: 'ENCHANTED tested whether more aggressive early blood pressure lowering during IV alteplase therapy could reduce hemorrhagic complications enough to improve longer-term disability outcomes.',
    pearls: [
      'Primary functional outcome was neutral despite lower achieved blood pressure in the intensive arm',
      'Any intracranial hemorrhage was reduced: 14.8% vs 18.7%',
      'The reduction in bleeding did not translate into better 90-day disability outcomes',
      'Supports the safety of modestly more aggressive BP control, but not a major change from standard alteplase-era targets'
    ],
    conclusion: '',
    source: 'Anderson et al. (Lancet 2019)',
    clinicalTrialsId: 'NCT01422616',
    specialDesign: 'neutral-trial',
    keyMessage: 'Intensive post-alteplase BP lowering reduced any-ICH as a secondary outcome but did not improve 90-day disability. Primary functional endpoint was null.',
    archetypeId: 'B' as const,
    doi: '10.1016/S0140-6736(19)30038-8',
    listCategory: 'acute',
    listDescription: 'Null primary (mRS shift OR 1.01, P=0.87); secondary any-ICH reduced (14.8% vs 18.7%) but did not translate to functional benefit. Lancet 2019.',
    ordinalStats: { commonOR: 1.01, ciLow: 0.87, ciHigh: 1.17, direction: 'neutral' as const, pValue: 0.87 },
    howToReadChart: [
      {
        question: 'What does OR 1.01 represent?',
        answer: 'OR 1.01 is the adjusted odds ratio for the PRIMARY outcome: mRS ordinal shift at 90 days in 2196 patients. OR 1.01 (95% CI 0.87-1.17, P=0.87) is clinically and statistically indistinguishable from no difference. A pre-specified secondary outcome (any ICH at 24 hours) was reduced (14.8% vs 18.7%, OR 0.75, P=0.014), labeled separately because it is secondary.',
      },
      {
        question: 'Why is the secondary ICH finding shown separately and not as the main result?',
        answer: 'ENCHANTED was powered and pre-specified to detect a functional benefit on mRS ordinal shift. The primary endpoint was null. Surfacing the secondary ICH reduction as the main result would misrepresent the trial design and overstate the clinical significance of a significant secondary finding in a null primary trial.',
      },
      {
        question: 'Why did reducing ICH not improve functional outcomes?',
        answer: 'ENCHANTED reduced all-grade any-ICH, including small asymptomatic hemorrhagic transformation, not specifically symptomatic or large ICH. Asymptomatic radiographic hemorrhage may not be a primary driver of 90-day disability. The disconnect between bleeding reduction and functional improvement is the defining finding of this trial.',
      },
    ],
    /* claimId: enchanted-interpret | source: Anderson et al. Lancet 2019 */
    howToInterpret: {
      proves: 'In 2196 patients with acute ischemic stroke eligible for IV alteplase, intensive BP lowering (target SBP 130-140 mm Hg for 72 hours) did not improve the primary outcome of mRS ordinal shift at 90 days compared with guideline management (SBP below 180 mm Hg): adjusted OR 1.01, 95% CI 0.87-1.17, P=0.87. A pre-specified secondary outcome (any ICH at 24 hours) was reduced: 14.8% vs 18.7%, OR 0.75, P=0.014. This secondary finding did not alter the null primary result.',
      doesNotProve: 'A statistically significant secondary outcome (ICH reduction) does not establish clinical benefit when the primary endpoint is null. ENCHANTED does not prove that intensive BP lowering after alteplase improves functional outcome or reduces clinically important ICH. Reducing all-grade any-ICH, which includes small asymptomatic hemorrhagic transformation, did not shift 90-day disability. This trial does not provide functional evidence to justify adopting stricter post-alteplase BP targets.',
      cautions: 'Open-label trial with blinded endpoint assessment across 110 sites in 15 countries. The secondary ICH reduction was in all-grade any-ICH, not restricted to symptomatic or large hemorrhages. Inference to clinical practice based on the secondary ICH finding requires explicit recognition that the primary function-based endpoint was null. International heterogeneity across 15 countries is substantial.',
    },
    /* claimId: enchanted-pearl | source: Anderson et al. Lancet 2019 */
    bedsidePearl: 'ENCHANTED showed intensive post-alteplase BP lowering reduced any-ICH as a secondary outcome but did not improve 90-day disability (primary null). Do not use the secondary ICH finding to justify changing post-alteplase BP targets. Current standard (SBP below 180 mm Hg) remains the evidence-based practice.',
    bottomLineSummary: 'Multicenter RCT in 2196 alteplase-eligible patients: intensive SBP target 130-140 mm Hg vs guideline less than 180 mm Hg for 72 hours. Primary outcome (mRS ordinal shift at 90 days) was null: OR 1.01, 95% CI 0.87-1.17, P=0.87. Pre-specified secondary any-ICH was reduced (14.8% vs 18.7%, P=0.014) but did not translate to functional benefit.',
    inclusionCriteria: [
      'Age 18 or older',
      'Acute ischemic stroke eligible for IV alteplase',
      'SBP 150 mm Hg or greater at randomization',
      'Measurable neurological deficit on NIHSS',
      'Randomization within 6 hours of symptom onset',
    ],
    exclusionCriteria: [
      'SBP below 150 mm Hg at presentation',
      'Contraindication to antihypertensive therapy',
      'Hemorrhagic stroke on baseline imaging',
      'Pre-stroke mRS 3 or greater',
    ],
  },
  'best-ii-trial': {
    id: 'best-ii-trial',
    title: 'BEST-II Trial',
    subtitle: 'Blood Pressure Targets After Successful Endovascular Therapy',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '120',
        label: 'Randomized EVT Patients'
      },
      primaryEndpoint: {
        value: 'Futility Design',
        label: 'Infarct Volume and Utility-Weighted mRS'
      },
      pValue: {
        value: '0.93',
        label: 'Futility Not Met'
      },
      effectSize: {
        value: '14-25%',
        label: 'Predicted Success of Future Trial'
      }
    },
    trialDesign: {
      type: [
        'Phase 2 randomized open-label blinded-endpoint futility trial',
        'Three post-EVT systolic blood pressure targets: <140, <160, and <=180 mm Hg',
        'Successful endovascular therapy required before randomization',
        'Blood pressure strategy initiated within 60 minutes and maintained for 24 hours'
      ],
      timeline: 'Three US comprehensive stroke centers, 2020-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 51,
        label: 'Mean utility-weighted mRS at 90 days (x100)',
        name: 'Target <140 mm Hg'
      },
      control: {
        percentage: 58,
        label: 'Mean utility-weighted mRS at 90 days (x100)',
        name: 'Target <=180 mm Hg'
      }
    },
    intervention: {
      treatment: 'Lower post-EVT systolic blood pressure target, primarily <140 mm Hg',
      control: 'Guideline-level post-EVT systolic blood pressure target <=180 mm Hg'
    },
    clinicalContext: 'BEST-II was a dose-finding and futility study testing whether a lower systolic BP target after technically successful EVT would be promising enough to justify a large superiority trial.',
    pearls: [
      'Neither lower target met prespecified futility boundaries, so definitive harm could not be declared',
      'Signals still favored the higher target rather than aggressive BP lowering',
      'Predicted probability of success for a future superiority trial was low: about 25% for <140 mm Hg and 14% for <160 mm Hg',
      'The highest-target group had the best mean utility-weighted mRS in this small phase 2 study'
    ],
    conclusion: '',
    source: 'Mistry et al. (JAMA 2023)',
    clinicalTrialsId: 'NCT04116112',
    specialDesign: 'futility-trial',
    keyMessage: 'BEST-II did not definitively close the question, but it made meaningful benefit from lower post-EVT BP look unlikely.',
    archetypeId: 'A' as const,
    doi: '10.1001/jama.2023.14330',
    listCategory: 'acute',
    listDescription: 'Phase 2 futility trial: lower post-EVT BP targets showed low predicted success (14-25%) vs <=180 mm Hg. JAMA 2023.',
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'The chart compares utility-weighted mRS at 90 days, scaled by 100. Utility-weighted mRS assigns quality-of-life weights to each mRS level (0 for death, 1 for no symptoms). The <140 mm Hg arm scored 51 versus 58 for the <=180 mm Hg arm on this 0-100 scale.',
      },
      {
        question: 'Why are both values so close?',
        answer: 'This was a small 3-arm phase 2 futility study with approximately 40 patients per arm, not a superiority trial. The close values reflect limited statistical power and absence of a large treatment effect. Futility designs are built to flag whether further study is worthwhile, not to prove superiority.',
      },
      {
        question: 'What does futility P=0.93 mean?',
        answer: 'A high futility p-value means neither lower target formally crossed the futility boundary; definitive harm cannot be declared. But the predicted probability of success in a future large superiority trial was only 14-25% for the lower targets, casting significant doubt on their promise. OPTIMAL-BP subsequently demonstrated functional harm from SBP <140 mm Hg.',
      },
    ],
    /* claimId: best-ii-interpret | source: Mistry et al. JAMA 2023 */
    howToInterpret: {
      proves: 'In 120 patients at three US comprehensive stroke centers, no lower post-EVT BP target formally crossed the futility boundary (futility P=0.93). The highest-target arm (<=180 mm Hg) produced the best utility-weighted mRS: 0.58 versus 0.51 for <140 mm Hg and 0.55 for <160 mm Hg. The predicted probability of success in a future large superiority trial was 14-25% for the lower targets.',
      doesNotProve: 'BEST-II does not prove that lower BP targets cause harm; the formal futility boundary was not crossed. It also cannot confirm any benefit; the 120-patient phase 2 design lacked statistical power. The trial does not address patients with unsuccessful EVT, posterior circulation LVO, or baseline mRS greater than 2.',
      cautions: 'Open-label phase 2 design with approximately 40 patients per arm. Utility-weighted mRS is not a standard clinical metric in daily practice. OPTIMAL-BP subsequently enrolled 306 patients and showed significant functional harm from SBP <140 mm Hg after successful EVT, providing stronger and more definitive evidence.',
    },
    /* claimId: best-ii-pearl | source: Mistry et al. JAMA 2023 */
    bedsidePearl: 'BEST-II and OPTIMAL-BP together make a consistent case: permissive BP management (SBP up to 180 mm Hg) is safer than aggressive lowering after successful EVT. BEST-II showed low predicted benefit from lower targets; OPTIMAL-BP confirmed functional harm. Do not force SBP below 140 mm Hg in the first 24 hours after successful reperfusion.',
    bottomLineSummary: 'Phase 2 futility trial testing three BP targets after successful EVT in 120 patients. The <=180 mm Hg arm had the highest utility-weighted mRS (0.58 vs 0.51 for <140 mm Hg). No lower target formally crossed the futility boundary, but predicted success in a future superiority trial was only 14-25%. OPTIMAL-BP later confirmed functional harm from SBP <140 mm Hg after EVT.',
    inclusionCriteria: [
      'Age 18 or older',
      'Anterior circulation LVO stroke',
      'Successful EVT (mTICI 2c or better)',
      'BP target initiated within 60 minutes of procedure end',
      'Treatment maintained for 24 hours',
    ],
    exclusionCriteria: [
      'Unsuccessful EVT (mTICI below 2c)',
      'Severe heart failure (EF below 30%)',
      'LVAD or extracorporeal membrane oxygenation',
      'Pre-stroke mRS greater than 2',
      'Unable to maintain assigned BP target',
    ],
  },
  'bp-target-trial': {
    id: 'bp-target-trial',
    title: 'BP-TARGET Trial',
    subtitle: 'Intensive vs Standard Blood Pressure Control After Successful EVT',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '324',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Radiographic ICH',
        label: 'at 24-36 Hours'
      },
      pValue: {
        value: '0.84',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'aOR 0.96',
        label: 'No Reduction in Hemorrhage'
      }
    },
    trialDesign: {
      type: [
        'Multicenter open-label randomized controlled trial',
        'Successful large-vessel EVT required before randomization',
        'SBP target 100-129 mm Hg vs 130-185 mm Hg',
        'Target achieved within 1 hour and maintained for 24 hours'
      ],
      timeline: 'Four academic stroke centers in France'
    },
    efficacyResults: {
      treatment: {
        percentage: 42,
        label: 'Radiographic intraparenchymal hemorrhage at 24-36 hours (lower is better)',
        name: 'Intensive SBP Target'
      },
      control: {
        percentage: 43,
        label: 'Radiographic intraparenchymal hemorrhage at 24-36 hours (lower is better)',
        name: 'Standard SBP Target'
      }
    },
    intervention: {
      treatment: 'Intensive systolic blood pressure target of 100-129 mm Hg after successful EVT',
      control: 'Standard systolic blood pressure target of 130-185 mm Hg after successful EVT'
    },
    clinicalContext: 'BP-TARGET was the first randomized trial focused specifically on whether lower blood pressure targets after successful reperfusion could prevent post-EVT hemorrhagic injury.',
    pearls: [
      'Primary hemorrhage endpoint was almost identical between groups: 42% vs 43%',
      'Symptomatic intraparenchymal hemorrhage was numerically higher in the intensive arm',
      'Functional outcomes at 3 months did not differ',
      'This early randomized signal did not support routine aggressive BP lowering after reperfusion'
    ],
    conclusion: '',
    source: 'Mazighi et al. (Lancet Neurol 2021)',
    clinicalTrialsId: 'NCT03160677',
    specialDesign: 'negative-trial',
    keyMessage: 'Lowering SBP aggressively after successful thrombectomy did not improve post-EVT hemorrhage outcomes.',
    archetypeId: 'A' as const,
    doi: '10.1016/S1474-4422(20)30483-X',
    listCategory: 'acute',
    listDescription: 'First RCT of post-EVT BP: intensive SBP 100-129 mm Hg did not reduce radiographic hemorrhage vs standard 130-185 mm Hg. Lancet Neurol 2021.',
    howToReadChart: [
      {
        question: 'What does the primary outcome measure?',
        answer: 'The primary endpoint was any radiographic intraparenchymal hemorrhage (iPH) on 24-36 hour imaging, not symptomatic ICH or functional outcome. Both arms showed essentially identical iPH rates: 42% intensive versus 43% standard.',
      },
      {
        question: 'What does aOR 0.96 mean here?',
        answer: 'An adjusted odds ratio of 0.96 (95% CI 0.60-1.51, P=0.84) means patients in the intensive BP arm had essentially the same odds of radiographic hemorrhage as the standard arm. An aOR of 1.0 is perfect equivalence; 0.96 is statistically indistinguishable from no difference.',
      },
      {
        question: 'Why was radiographic hemorrhage the primary endpoint rather than mRS?',
        answer: 'BP-TARGET was a phase 2 signal-finding trial. Radiographic iPH was chosen as a measurable surrogate to detect any hemorrhage-prevention signal. Functional outcome (mRS) was pre-specified as a secondary endpoint. The null radiographic result removed the primary rationale for aggressive BP lowering as a hemorrhage-prevention strategy after successful reperfusion.',
      },
    ],
    /* claimId: bp-target-interpret | source: Mazighi et al. Lancet Neurol 2021 */
    howToInterpret: {
      proves: 'BP-TARGET was the first randomized trial designed to test whether intensive BP management (SBP 100-129 mm Hg) after successful EVT reduces post-reperfusion hemorrhage. In 324 patients at four French academic stroke centers, the intensive arm showed no reduction in any radiographic iPH (42% vs 43%, aOR 0.96, 95% CI 0.60-1.51, P=0.84). Symptomatic ICH rates were similar. Functional independence at 3 months trended numerically lower in the intensive arm (58% vs 65%) without statistical significance.',
      doesNotProve: 'BP-TARGET was underpowered to detect functional harm from intensive BP lowering; it was designed to show hemorrhage reduction. It does not establish the optimal post-EVT BP target -- only that SBP 100-129 mm Hg does not reduce radiographic iPH compared with SBP 130-185 mm Hg.',
      cautions: 'Open-label design with blinded endpoint assessment. Surrogate primary endpoint (radiographic iPH rather than functional outcome). Single-country French cohort at four centers, limiting generalizability. The standard arm permitted SBP up to 185 mm Hg, which is wider than current guideline recommendations.',
    },
    /* claimId: bp-target-pearl | source: Mazighi et al. Lancet Neurol 2021 */
    bedsidePearl: 'BP-TARGET answered a narrow question: intensive BP lowering after successful EVT does not reduce radiographic hemorrhage. Combined with OPTIMAL-BP confirming functional harm from SBP <140 mm Hg, the evidence base is consistent. Do not target SBP below 140 mm Hg after successful reperfusion.',
    bottomLineSummary: 'First RCT of post-EVT BP management: 324 patients randomized to intensive (SBP 100-129 mm Hg) vs standard (130-185 mm Hg) at four French centers. Primary endpoint of any radiographic iPH at 24-36 hours was identical (42% vs 43%, aOR 0.96, P=0.84). Functional outcomes numerically favored standard management. No benefit from intensive BP lowering was demonstrated.',
    inclusionCriteria: [
      'Age 18 or older',
      'Anterior circulation LVO stroke',
      'Successful EVT (mTICI 2b or better)',
      'SBP greater than 130 mm Hg within 1 hour of EVT',
      'Randomization within 1 hour of procedure end',
      'Pre-stroke mRS 0 to 2',
    ],
    exclusionCriteria: [
      'SBP below 130 mm Hg at eligibility',
      'Hemorrhagic complication occurring during EVT',
      'Severe comorbidity precluding 24-hour protocol participation',
      'Pre-stroke mRS greater than 2',
    ],
  },
  'optimal-bp-trial': {
    id: 'optimal-bp-trial',
    title: 'OPTIMAL-BP Trial',
    subtitle: 'Intensive vs Conventional BP Lowering After EVT',
    category: 'Neuro Trials',
    trialResult: 'HARM',
    stats: {
      sampleSize: {
        value: '306',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.03',
        label: 'Worse With Intensive BP'
      },
      effectSize: {
        value: '-15.1%',
        label: 'Functional Independence Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial with blinded endpoint evaluation',
        'Patients had successful reperfusion after EVT (mTICI 2b or greater)',
        'Intensive SBP target <140 mm Hg vs conventional target 140-180 mm Hg',
        'Blood pressure strategy maintained for 24 hours'
      ],
      timeline: '19 South Korean stroke centers, 2020-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 39.4,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'Intensive BP Management'
      },
      control: {
        percentage: 54.4,
        label: 'Functional independence (mRS 0-2) at 3 months',
        name: 'Conventional BP Management'
      }
    },
    intervention: {
      treatment: 'Systolic blood pressure target <140 mm Hg for 24 hours after successful EVT',
      control: 'Systolic blood pressure target 140-180 mm Hg for 24 hours after successful EVT'
    },
    clinicalContext: 'OPTIMAL-BP directly tested whether tighter blood pressure control after reperfusion improves outcomes, and unlike earlier smaller studies, it showed a clear signal against intensive lowering.',
    pearls: [
      'Functional independence was significantly lower with intensive BP control: 39.4% vs 54.4%',
      'Trial stopped early because of safety concerns and poorer outcomes in the intensive arm',
      'Symptomatic intracerebral hemorrhage rates were similar, so harm was not explained by more sICH',
      'Provides strong evidence to avoid routine aggressive BP lowering below 140 mm Hg after successful EVT'
    ],
    conclusion: '',
    source: 'Nam et al. (JAMA 2023)',
    clinicalTrialsId: 'NCT04205305',
    specialDesign: 'negative-trial',
    keyMessage: 'Do not routinely target SBP <140 mm Hg after successful thrombectomy.',
    archetypeId: 'A' as const,
    doi: '10.1001/jama.2023.14590',
    listCategory: 'acute',
    listDescription: 'STOPPED FOR SAFETY: intensive SBP <140 mm Hg after EVT reduced functional independence 15 pp and increased malignant edema 8-fold. JAMA 2023.',
    howToReadChart: [
      {
        question: 'What does the primary outcome measure?',
        answer: 'The primary endpoint was functional independence (mRS 0-2) at 3 months, the most clinically meaningful stroke outcome. The intensive BP arm (SBP <140 mm Hg) achieved only 39.4% functional independence versus 54.4% in the conventional arm (SBP 140-180 mm Hg), a 15.1 percentage-point difference favoring conventional management.',
      },
      {
        question: 'Why does the control arm appear as the winner?',
        answer: 'OPTIMAL-BP was stopped early for safety by the DSMB: the intensive BP arm showed significantly worse functional outcomes. The chart correctly marks conventional BP management as the winning arm. This is a trial where the treatment caused harm rather than benefit.',
      },
      {
        question: 'What does adjusted OR 0.56 mean?',
        answer: 'An adjusted OR of 0.56 for functional independence (95% CI 0.33-0.96, P=0.03) means patients on intensive BP management had 44% lower odds of achieving mRS 0-2 at 3 months. Combined with nearly 8-fold higher malignant cerebral edema (adjusted OR 7.88, 95% CI 1.05-59.0, P=0.01), the signal against SBP <140 mm Hg after successful EVT is consistent across multiple outcomes.',
      },
    ],
    /* claimId: optimal-bp-interpret | source: Nam et al. JAMA 2023 */
    howToInterpret: {
      proves: 'STOPPED FOR SAFETY. In 306 patients at 19 South Korean stroke centers, intensive BP management targeting SBP <140 mm Hg after successful EVT caused significantly lower functional independence compared with conventional management targeting SBP 140-180 mm Hg (39.4% vs 54.4%, absolute difference -15.1 percentage points, adjusted OR 0.56, 95% CI 0.33-0.96, P=0.03). Malignant cerebral edema was nearly 8-fold more frequent in the intensive arm (adjusted OR 7.88, 95% CI 1.05-59.0, P=0.01). The DSMB terminated enrollment at 306 of 450 planned patients.',
      doesNotProve: 'The harm is specific to targeting SBP <140 mm Hg; it does not prove that any BP reduction below 180 mm Hg is harmful. Symptomatic ICH rates did not significantly differ between groups, so sICH was not the mechanism of harm. This was a Korean population; the magnitude of harm may differ in other populations.',
      cautions: 'Open-label design with blinded endpoint assessment. Terminated early at 68% of planned enrollment; early stopping can inflate treatment effect estimates. Single-country Korean cohort at 19 centers. The mechanism by which intensive BP lowering increased malignant edema (possibly reduced collateral perfusion post-reperfusion) is biologically plausible but not definitively established.',
    },
    /* claimId: optimal-bp-pearl | source: Nam et al. JAMA 2023 */
    bedsidePearl: 'OPTIMAL-BP stopped early for harm: SBP <140 mm Hg after successful EVT reduced functional independence by 15 percentage points and increased malignant cerebral edema 8-fold. After successful reperfusion, allow SBP up to 180 mm Hg. Do not target SBP below 140 mm Hg.',
    bottomLineSummary: 'OPTIMAL-BP randomized 306 patients to intensive BP management (SBP <140 mm Hg) vs conventional (140-180 mm Hg) for 24 hours after successful EVT at 19 South Korean centers. Stopped early by DSMB for safety: functional independence at 3 months was 39.4% vs 54.4% (P=0.03) and malignant cerebral edema was nearly 8-fold higher in the intensive arm. Do not target SBP below 140 mm Hg after successful thrombectomy.',
    inclusionCriteria: [
      'Age 20 or older',
      'LVO stroke with successful EVT (mTICI 2b or better)',
      'SBP 140 mm Hg or greater on two measurements within 2 hours of final reperfusion',
      'Randomization within 2 hours of final reperfusion',
      'Pre-stroke mRS 0 to 2',
    ],
    exclusionCriteria: [
      'SBP below 140 mm Hg at eligibility',
      'Symptomatic ICH after EVT',
      'Serious concurrent illness',
      'Pre-stroke mRS 3 to 5',
      'Planned hemicraniectomy',
    ],
  },
  'charm-trial': {
    id: 'charm-trial',
    title: 'CHARM Trial',
    subtitle: 'Intravenous Glibenclamide for Cerebral Edema After Large Hemispheric Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '535',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.42',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'cOR 1.17',
        label: 'No Functional Benefit'
      }
    },
    trialDesign: {
      type: [
        'Phase 3 double-blind placebo-controlled randomized trial',
        'Large hemispheric infarction defined by ASPECTS 1-5 or core 80-300 mL',
        'Study drug started within 10 hours of stroke onset',
        'Primary efficacy analysis focused on patients aged 18-70 years'
      ],
      timeline: '143 stroke centers in 21 countries; stopped early for operational reasons'
    },
    efficacyResults: {
      treatment: {
        percentage: 43,
        label: 'mRS 0-4 at 90 days',
        name: 'Intravenous Glibenclamide'
      },
      control: {
        percentage: 42,
        label: 'mRS 0-4 at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Intravenous glibenclamide 8.6 mg over 72 hours',
      control: 'Placebo infusion'
    },
    clinicalContext: 'CHARM evaluated whether pharmacologic edema reduction could improve outcome after large hemispheric infarction, a setting with high mortality and limited medical therapies.',
    pearls: [
      'No favorable shift in disability at 90 days with glibenclamide',
      'Mortality was not improved and was numerically higher in the active-treatment arm',
      'Hypoglycemia was more common with glibenclamide: 6% vs 2%',
      'Trial was underpowered after early termination, so small subgroup effects remain uncertain'
    ],
    conclusion: '',
    source: 'Sheth et al. (Lancet Neurol 2024)',
    clinicalTrialsId: 'NCT02864953',
    specialDesign: 'negative-trial',
    keyMessage: 'CHARM does not support routine intravenous glibenclamide for malignant edema prevention after large hemispheric stroke.',
    archetypeId: 'B' as const,
    listCategory: 'acute',
    listDescription: 'Phase 3 glibenclamide for large hemispheric infarction: null primary (cOR 1.17, P=0.42); stopped early for COVID. Lancet Neurol 2024.',
    ordinalStats: { commonOR: 1.17, ciLow: 0.80, ciHigh: 1.71, direction: 'neutral' as const, pValue: 0.42 },
    howToReadChart: [
      {
        question: 'What does cOR 1.17 represent?',
        answer: 'The common odds ratio of 1.17 (95% CI 0.80-1.71, P=0.42) is the primary result of ordinal logistic regression on mRS at 90 days in patients aged 18-70. An OR above 1.0 nominally favors glibenclamide, but the confidence interval spans both benefit and harm, and P=0.42 confirms this is not statistically significant.',
      },
      {
        question: 'Why is the confidence interval so wide?',
        answer: 'CHARM was stopped early due to COVID-19 operational disruptions before completing planned enrollment. At 535 patients (approximately 71% of target), the trial was substantially underpowered. Wide confidence intervals reflect this loss of precision; any effect estimate from this trial is highly uncertain.',
      },
      {
        question: 'Does an OR above 1.0 suggest a trend toward benefit?',
        answer: 'No reliable trend conclusion can be drawn from an underpowered early-stopped trial. The CI (0.80-1.71) spans meaningful harm to meaningful benefit. Mortality was numerically higher in the glibenclamide arm and hypoglycemia was 3-fold more common (6% vs 2%). These safety signals add to the uncertainty.',
      },
    ],
    /* claimId: charm-interpret | source: Sheth et al. Lancet Neurol 2024 */
    howToInterpret: {
      proves: 'In 535 patients with large hemispheric infarction (ASPECTS 1-5 or DWI core 80-300 mL, age 18-70), IV glibenclamide 8.6 mg over 72 hours did not improve 90-day mRS ordinal shift compared with placebo: cOR 1.17, 95% CI 0.80-1.71, P=0.42. Mortality was not improved and was numerically higher with glibenclamide. Hypoglycemia occurred in 6% of glibenclamide patients vs 2% of placebo patients. The trial was stopped early due to COVID-19 operational disruptions before reaching planned enrollment.',
      doesNotProve: 'CHARM does not establish that glibenclamide is effective in large hemispheric stroke, nor does it definitively establish inefficacy -- the trial was substantially underpowered after early stopping. An exploratory analysis in patients with core volume less than 125 mL showed a numerically larger effect, but this is hypothesis-generating only and cannot serve as a clinical recommendation.',
      cautions: 'Stopped early for COVID-19 operational reasons (not for safety or futility) at approximately 71% of planned enrollment; findings are inconclusive. The confidence interval (0.80-1.71) is too wide to exclude clinically meaningful benefit or harm. Hypoglycemia monitoring is required with glibenclamide. The core volume less than 125 mL exploratory subgroup should not change clinical practice.',
    },
    /* claimId: charm-pearl | source: Sheth et al. Lancet Neurol 2024 */
    bedsidePearl: 'CHARM stopped early for COVID and was underpowered; results are inconclusive. Glibenclamide did not significantly improve disability and caused 3-fold higher hypoglycemia. Do not use IV glibenclamide for malignant edema outside a clinical trial. Hemicraniectomy (DESTINY II, HAMLET, DECIMAL) remains the only intervention with survival evidence in eligible malignant MCA infarction patients.',
    bottomLineSummary: 'Phase 3 double-blind trial of IV glibenclamide vs placebo for large hemispheric infarction in 535 patients across 143 centers. Stopped early for COVID-19. Primary outcome (mRS ordinal shift at 90 days, age 18-70) was null: cOR 1.17, 95% CI 0.80-1.71, P=0.42. Mortality numerically higher with glibenclamide; hypoglycemia 6% vs 2%. Findings are inconclusive due to underpowering from early stopping.',
    inclusionCriteria: [
      'Age 18-80 (primary efficacy analysis age 18-70)',
      'Large hemispheric infarction: ASPECTS 1-5 or DWI core 80-300 mL',
      'Study drug initiated within 10 hours of stroke onset',
      'Patient or surrogate able to provide consent',
    ],
    exclusionCriteria: [
      'Core volume below 80 mL or above 300 mL',
      'Severe hepatic or renal impairment',
      'Known sulfonylurea hypersensitivity',
      'Planned early hemicraniectomy precluding 72-hour drug administration',
      'Pregnancy',
    ],
  },
  'escape-na1-trial': {
    id: 'escape-na1-trial',
    title: 'ESCAPE-NA1 Trial',
    subtitle: 'Nerinetide Neuroprotection During EVT for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '1105',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.35',
        label: 'Not Significant Overall'
      },
      effectSize: {
        value: 'RR 1.04',
        label: 'No Overall Benefit'
      }
    },
    trialDesign: {
      type: [
        'Multicenter double-blind placebo-controlled randomized trial',
        'All patients underwent thrombectomy for large-vessel occlusion',
        'Treatment window up to 12 hours with favorable imaging selection',
        'Stratified by alteplase use and declared first EVT device'
      ],
      timeline: '48 hospitals in 8 countries'
    },
    efficacyResults: {
      treatment: {
        percentage: 61.4,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Nerinetide'
      },
      control: {
        percentage: 59.2,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Single-dose intravenous nerinetide before or during EVT',
      control: 'Placebo infusion'
    },
    clinicalContext: 'ESCAPE-NA1 was a major modern neuroprotection trial embedded in the thrombectomy era, testing whether nerinetide could reduce reperfusion injury and improve post-EVT outcomes.',
    pearls: [
      'Overall trial was neutral: 61.4% vs 59.2% achieved mRS 0-2',
      'A prespecified interaction suggested benefit only in patients who did not receive alteplase',
      'In the no-alteplase subgroup, mRS 0-2 was 59.3% with nerinetide vs 49.8% with placebo',
      'Findings raised concern for a drug-drug interaction between alteplase and nerinetide'
    ],
    conclusion: '',
    source: 'Hill et al. (Lancet 2020)',
    clinicalTrialsId: 'NCT02930018',
    specialDesign: 'negative-trial',
    keyMessage: 'ESCAPE-NA1 was negative overall. The alteplase-free subgroup interaction is hypothesis-generating only and does not establish clinical benefit.',
    archetypeId: 'A' as const,
    doi: '10.1016/S0140-6736(20)30258-0',
    listCategory: 'acute',
    listDescription: 'Nerinetide neuroprotection in EVT: null overall (mRS 0-2, 61.4% vs 59.2%, P=0.35). Alteplase-free subgroup interaction is hypothesis-generating only. Lancet 2020.',
    howToReadChart: [
      {
        question: 'What does the primary outcome show?',
        answer: 'The chart shows the proportion achieving functional independence (mRS 0-2) at 90 days. Nerinetide: 61.4%, placebo: 59.2%. The 2.2 percentage point difference was not statistically significant (adjusted RR 1.04, 95% CI 0.96-1.13, P=0.35). The trial was adequately powered and clearly null overall.',
      },
      {
        question: 'Why are both bars so similar?',
        answer: 'ESCAPE-NA1 enrolled patients with LVO stroke undergoing EVT within 12 hours with favorable imaging -- a population that already achieves high functional outcomes (59.2% mRS 0-2 in the placebo arm). High baseline outcome rates limit room for improvement, but the trial was powered to detect this benefit if present.',
      },
      {
        question: 'What about the alteplase-free subgroup?',
        answer: 'A prespecified interaction analysis showed a numerically larger effect in patients not receiving alteplase (nerinetide 59.3% vs placebo 49.8%), raising a hypothesis about alteplase degrading nerinetide. This is hypothesis-generating only; it cannot be used to recommend nerinetide (an unapproved drug) or to alter alteplase decisions.',
      },
    ],
    /* claimId: escape-na1-interpret | source: Hill et al. Lancet 2020 */
    howToInterpret: {
      proves: 'In 1105 patients with LVO stroke undergoing EVT within 12 hours with favorable imaging, a single IV dose of nerinetide did not improve functional independence (mRS 0-2) at 90 days compared with placebo: 61.4% vs 59.2%, adjusted RR 1.04, 95% CI 0.96-1.13, P=0.35. Mortality and symptomatic ICH rates were similar between groups.',
      doesNotProve: 'ESCAPE-NA1 does not establish benefit of nerinetide in any subpopulation. The prespecified interaction suggesting differential benefit in alteplase-free patients (59.3% vs 49.8%) is hypothesis-generating only and does not constitute clinical evidence for any practice change. Nerinetide is not approved for clinical use. No clinical decision, including alteplase withholding, should be based on a subgroup interaction in an overall neutral trial.',
      cautions: 'The alteplase-free subgroup (approximately 30% of enrolled patients) showed a numerically large difference (59.3% vs 49.8%), and the interaction was prespecified. However, this requires independent replication before clinical translation. Nerinetide is not approved; the ESCAPE-NEXT trial was designed to address this interaction in the alteplase-free population. Any inference of clinical actionability from this subgroup is premature.',
    },
    /* claimId: escape-na1-pearl | source: Hill et al. Lancet 2020 */
    bedsidePearl: 'ESCAPE-NA1 was negative overall for nerinetide in EVT patients. The alteplase-free subgroup signal is hypothesis-generating only; do not alter thrombolysis decisions or advocate for nerinetide use based on this finding. Neuroprotection after EVT remains unproven.',
    bottomLineSummary: 'Double-blind RCT of nerinetide in 1105 LVO stroke patients undergoing EVT within 12 hours. Primary endpoint (mRS 0-2 at 90 days) was null: 61.4% vs 59.2%, adjusted RR 1.04, P=0.35. A prespecified interaction showed numerically larger effect in alteplase-free patients (59.3% vs 49.8%), raising a hypothesis about alteplase-nerinetide interaction that requires dedicated confirmation.',
    inclusionCriteria: [
      'Age 18 or older',
      'Acute ischemic stroke with LVO (anterior or posterior circulation)',
      'EVT eligible and planned within 12 hours of last known well',
      'ASPECTS 5 or greater or equivalent favorable perfusion imaging',
      'Pre-stroke mRS 0-1',
    ],
    exclusionCriteria: [
      'ASPECTS below 5 on baseline CT',
      'Pre-stroke mRS 2 or greater',
      'Contraindication to contrast or study drug',
      'Large intracranial hemorrhage on baseline imaging',
      'Pregnant or breastfeeding',
    ],
  },
  'decimal-trial': {
    id: 'decimal-trial',
    title: 'DECIMAL Trial',
    subtitle: 'Early Decompressive Craniectomy in Malignant MCA Infarction',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '38',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS <=3',
        label: 'at 6 Months'
      },
      pValue: {
        value: '0.18',
        label: 'Underpowered for Primary Endpoint'
      },
      effectSize: {
        value: '-52.8%',
        label: 'Absolute Mortality Reduction'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Early decompressive craniectomy plus medical therapy vs medical therapy alone',
        'Patients aged 18-55 years with malignant MCA infarction',
        'Sequential design with blinded primary endpoint assessment'
      ],
      timeline: 'France, 2001-2005; stopped early for pooled analysis'
    },
    trialResult: 'NEUTRAL',
    specialDesign: 'neutral-trial',
    archetypeId: 'A' as const,
    doi: '10.1161/STROKEAHA.107.485235',
    listCategory: 'acute',
    efficacyResults: {
      treatment: {
        percentage: 75,
        label: '6-month survival (mortality 25%)',
        name: 'Decompressive Craniectomy'
      },
      control: {
        percentage: 22,
        label: '6-month survival (mortality 78%)',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Early decompressive hemicraniectomy plus standard medical therapy',
      control: 'Standard medical therapy alone'
    },
    clinicalContext: 'DECIMAL was one of the foundational European decompressive hemicraniectomy trials for malignant middle cerebral artery infarction, evaluating whether early surgery could reduce the extreme mortality of space-occupying infarction.',
    inclusionCriteria: [
      'Age 18-55 years',
      'Clinical and imaging signs of malignant MCA infarction (diffusion-restricted volume greater than 145 mL or greater than 50% of MCA territory)',
      'Randomization within 24 hours of symptom onset (extended to 30 hours in some patients)',
      'NIHSS greater than 15',
    ],
    exclusionCriteria: [
      'Age greater than 55 years',
      'Significant pre-existing disability (mRS greater than 1)',
      'Bilateral fixed dilated pupils or other signs of herniation before randomization',
      'Hemorrhagic transformation before randomization',
      'Major comorbidities limiting life expectancy',
    ],
    pearls: [
      'Small trial stopped early at 38 patients; underpowered for its primary functional endpoint',
      'Primary 6-month mRS less than or equal to 3 was not statistically significant (P=0.18)',
      'Mortality was reduced from 78% to 25%, an absolute reduction of 52.8 percentage points (P=0.001)',
      'DECIMAL is most influential through its contribution to pooled European craniectomy analyses',
    ],
    howToReadChart: [
      {
        question: 'What does the bar chart show here?',
        answer: '6-month survival rates, not functional independence rates. Treatment arm: 75% survived (25% mortality). Control arm: 22% survived (78% mortality). Absolute risk reduction in mortality: 52.8 percentage points.',
      },
      {
        question: 'Why is mortality shown instead of the primary endpoint?',
        answer: "DECIMAL's primary endpoint was mRS less than or equal to 3 at 6 months. That endpoint was not statistically significant (P=0.18) because the trial enrolled only 38 patients, far too few for functional outcome detection. Mortality, though a secondary endpoint, reached significance and is the clinically meaningful finding.",
      },
      {
        question: 'Does surviving mean recovering?',
        answer: 'Not reliably. Most surgical survivors in DECIMAL had mRS 4 or 5, meaning severe disability or complete dependence. Surgery prevents death, not functional recovery. Families must understand this distinction clearly before consent.',
      },
    ],
    /* claimId: decimal-interpret | source: Vahedi et al. Stroke 2007 */
    howToInterpret: {
      proves: 'In 38 patients (20 surgery, 18 medical therapy), early decompressive hemicraniectomy reduced 6-month mortality from 78% to 25%, an absolute reduction of 52.8 percentage points (P=0.001). This mortality benefit is the primary established finding from DECIMAL. The trial was stopped early at 38 of a planned 70 patients because pooled European analysis data became available.',
      doesNotProve: 'The primary endpoint (mRS less than or equal to 3 at 6 months) was not statistically significant in this sample (25% surgery vs 5.6% medical, P=0.18). DECIMAL does not prove that surgery restores functional independence. Survivors in the surgical arm were predominantly mRS 4 or mRS 5. The trial cannot establish quality of life or long-term functional benefit.',
      cautions: 'DECIMAL enrolled only 38 of a planned 70 patients; small sample inflates observed effect sizes. All patients were aged 18-55 years, limiting generalizability to older patients. Surgery was performed within approximately 30-35 hours of symptom onset; results may not apply to delayed intervention. Pooled analysis of DECIMAL, DESTINY, and HAMLET within 48 hours of stroke onset (HAMLET 2009, Figure 3) showed mortality ARR 49.9 percentage points (95% CI 33.9-65.9) and mRS greater than 4 ARR 41.9 percentage points (95% CI 25.2-58.6) favoring surgery.',
    },
    /* claimId: decimal-pearl | source: Vahedi et al. Stroke 2007 */
    bedsidePearl: 'DECIMAL shows hemicraniectomy prevents death in malignant MCA infarction for patients under 56 years. Before consent, tell the family explicitly: most survivors will have severe disability (mRS 4-5) and will not return to independent function. Surgery saves life, not function. The pooled analysis (DECIMAL, DESTINY, HAMLET within 48 hours) provides the most reliable estimate of benefit and risk -- use it for family counseling.',
    bottomLineSummary: 'Early hemicraniectomy (within 30-35 hours) reduces mortality by 52.8 percentage points in malignant MCA infarction in patients aged 18-55. The primary functional endpoint was not met due to small sample size. Most survivors remain severely disabled.',
    conclusion: '',
    source: 'Vahedi et al. (Stroke 2007)',
    keyMessage: 'Early hemicraniectomy reduces mortality in malignant MCA infarction. Most survivors remain severely disabled.',
  },
  'destiny-trial': {
    id: 'destiny-trial',
    title: 'DESTINY Trial',
    subtitle: 'Decompressive Surgery for Malignant MCA Infarction',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '32',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 6 Months'
      },
      pValue: {
        value: '0.23',
        label: 'Primary Endpoint NS'
      },
      effectSize: {
        value: '+41%',
        label: '30-Day Survival Benefit'
      }
    },
    trialDesign: {
      type: [
        'Prospective multicenter randomized controlled trial',
        'Hemicraniectomy vs conservative therapy',
        'Sequential design with 30-day mortality assessed first',
        'Primary functional endpoint based on mRS 0-3 at 6 months'
      ],
      timeline: 'Germany; stopped after pooled European data emerged'
    },
    trialResult: 'NEUTRAL',
    specialDesign: 'neutral-trial',
    archetypeId: 'A' as const,
    listCategory: 'acute',
    efficacyResults: {
      treatment: {
        percentage: 88,
        label: '30-day and 6-month survival (mortality 12%)',
        name: 'Hemicraniectomy'
      },
      control: {
        percentage: 47,
        label: '30-day and 6-month survival (mortality 53%)',
        name: 'Conservative Therapy'
      }
    },
    intervention: {
      treatment: 'Early decompressive hemicraniectomy plus intensive medical management',
      control: 'Conservative medical management'
    },
    clinicalContext: 'DESTINY evaluated whether the mortality benefit of hemicraniectomy in malignant MCA infarction could be achieved without merely shifting patients into extremely severe disability.',
    inclusionCriteria: [
      'Age 18-60 years',
      'Clinical and imaging criteria for malignant MCA infarction',
      'Randomization within 36 hours of symptom onset',
      'NIHSS greater than 18 for non-dominant hemisphere or greater than 20 for dominant hemisphere',
    ],
    exclusionCriteria: [
      'Age greater than 60 years',
      'Significant pre-existing disability',
      'Signs of herniation before randomization',
      'Bilateral infarcts or brainstem involvement',
      'Major organ failure or terminal illness',
    ],
    pearls: [
      '30-day survival improved substantially: 88% vs 47% (P=0.02)',
      'The prespecified 6-month primary endpoint mRS 0-3 was not statistically significant (P=0.23) in this 32-patient sample',
      'Distribution of mRS scores showed numerical improvement favoring surgery across categories',
      'DESTINY was central to the pooled European hemicraniectomy evidence base',
    ],
    howToReadChart: [
      {
        question: 'What does the bar chart show here?',
        answer: '30-day and 6-month survival rates. Treatment arm: 88% survived (12% mortality). Control arm: 47% survived (53% mortality). Absolute risk reduction in mortality: 41 percentage points (P=0.02).',
      },
      {
        question: 'Why is survival shown instead of the primary endpoint?',
        answer: "DESTINY's primary endpoint was mRS 0-3 at 6 months. In only 32 patients, 47% of surgical patients versus 27% of medical patients achieved mRS 0-3, but this did not reach statistical significance (P=0.23). Survival reached significance and reflects the dominant clinical reality: this surgery is a life-saving, not function-restoring, intervention.",
      },
      {
        question: 'If the functional primary was not significant, does surgery help functional outcomes at all?',
        answer: 'DESTINY showed a numerical shift in mRS distribution favoring surgery, but functional independence (mRS 0-2) was rare in both groups. Surgery prevents death more reliably than it restores function. The pooled analysis of all three European craniectomy trials provides the strongest evidence for family counseling.',
      },
    ],
    /* claimId: destiny-interpret | source: Juttler et al. Stroke 2007 */
    howToInterpret: {
      proves: 'In 32 patients (17 surgery, 15 conservative therapy), early hemicraniectomy reduced 30-day mortality from 53% to 12%, an absolute reduction of 41 percentage points (P=0.02). Six-month survival rates were consistent: 88% vs 47%. This survival benefit is the primary established finding from DESTINY.',
      doesNotProve: 'The primary endpoint (mRS 0-3 at 6 months) was not statistically significant in this 32-patient sample (47% surgery vs 27% conservative, P=0.23). DESTINY does not prove that surgery restores functional independence. The mRS distribution shift observed was numerical only. The trial cannot establish quality of life benefit.',
      cautions: 'DESTINY enrolled only 32 patients; effect sizes should be interpreted with caution due to wide confidence intervals expected from small samples. All patients were aged 18-60 years, limiting generalizability to patients over 60. The trial was stopped early when pooled European analysis data became available. Pooled analysis of DECIMAL, DESTINY, and HAMLET within 48 hours of stroke onset (HAMLET 2009, Figure 3) showed mortality ARR 49.9 percentage points (95% CI 33.9-65.9) and mRS greater than 4 ARR 41.9 percentage points (95% CI 25.2-58.6) favoring surgery.',
    },
    /* claimId: destiny-pearl | source: Juttler et al. Stroke 2007 */
    bedsidePearl: 'DESTINY confirms the pattern from DECIMAL: hemicraniectomy prevents death in malignant MCA infarction in patients under 61 years, but does not reliably restore functional independence. For family counseling, lead with the survival benefit, then explicitly state that most survivors will have severe to moderate disability and will not return to independent living. Use the pooled analysis (DECIMAL, DESTINY, HAMLET within 48 hours) for the most precise risk-benefit estimate.',
    bottomLineSummary: 'Early hemicraniectomy reduces 30-day and 6-month mortality by approximately 41 percentage points in malignant MCA infarction in patients aged 18-60. The primary functional endpoint (mRS 0-3 at 6 months) was not met in this 32-patient trial. The pooled European analysis is the more reliable efficacy estimate.',
    conclusion: '',
    source: 'Juttler et al. (Stroke 2007)',
    keyMessage: 'DESTINY reinforced that early hemicraniectomy improves survival in malignant MCA infarction. Most survivors have severe disability.',
  },
  'hamlet-trial': {
    id: 'hamlet-trial',
    title: 'HAMLET Trial',
    subtitle: 'Hemicraniectomy for Space-Occupying Hemispheric Infarction',
    category: 'Neuro Trials',
    trialResult: 'NEUTRAL',
    stats: {
      sampleSize: {
        value: '64',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 1 Year'
      },
      pValue: {
        value: 'ARR 0%',
        label: 'No Primary Benefit Overall'
      },
      effectSize: {
        value: 'ARR 38%',
        label: 'Case Fatality Reduction'
      }
    },
    trialDesign: {
      type: [
        'Multicenter open randomized trial',
        'Surgical decompression vs best medical treatment',
        'Patients randomized within 4 days of stroke onset',
        'Primary endpoint based on mRS 0-3 at 1 year'
      ],
      timeline: 'Netherlands, 2002-2007'
    },
    specialDesign: 'neutral-trial',
    archetypeId: 'A' as const,
    doi: '10.1016/S1474-4422(09)70047-X',
    listCategory: 'acute',
    efficacyResults: {
      treatment: {
        percentage: 78,
        label: '1-year survival (mortality 22%)',
        name: 'Surgical Decompression'
      },
      control: {
        percentage: 41,
        label: '1-year survival (mortality 59%)',
        name: 'Best Medical Treatment'
      }
    },
    intervention: {
      treatment: 'Decompressive surgery plus best medical treatment',
      control: 'Best medical treatment alone'
    },
    clinicalContext: 'HAMLET extended the decompressive surgery question beyond the earliest time window and showed surgery reduces death, with functional benefit strongest when performed within 48 hours of onset.',
    inclusionCriteria: [
      'Age 18-60 years',
      'Space-occupying hemispheric infarction with declining consciousness',
      'Randomization within 4 days (96 hours) of symptom onset',
      'CT or MRI confirmation of malignant MCA infarction',
    ],
    exclusionCriteria: [
      'Age greater than 60 years',
      'Pre-existing severe disability',
      'Bilateral infarcts or posterior fossa involvement',
      'Terminal illness or major organ failure',
      'Hemorrhagic transformation before randomization',
    ],
    pearls: [
      'Primary outcome mRS 0-3 at 1 year was neutral overall; patients randomized after 48 hours diluted the treatment effect',
      'Case fatality was reduced by an absolute 38 percentage points (P=0.002)',
      'Functional benefit (and strongest mortality benefit) was concentrated in patients operated within 48 hours',
      'The trial showed that delayed surgery (48-96 hours) may save lives without clearly improving functional independence',
    ],
    howToReadChart: [
      {
        question: 'What does the bar chart show here?',
        answer: '1-year survival rates for the overall trial (enrollment up to 96 hours). Treatment arm: 78% survived (22% mortality). Control arm: 41% survived (59% mortality). Absolute case fatality reduction: 38 percentage points.',
      },
      {
        question: 'Why is the primary endpoint listed as neutral?',
        answer: "HAMLET's primary endpoint was mRS 0-3 at 1 year. In 64 patients enrolled up to 96 hours after onset, the difference in mRS 0-3 rates was not statistically significant. Patients randomized after 48 hours diluted the functional treatment effect. Mortality was significantly reduced across all timing groups.",
      },
      {
        question: 'What is the significance of the 48-hour window?',
        answer: "HAMLET's within-48-hour subgroup, when pooled with DECIMAL and DESTINY patients also treated within 48 hours, showed both mortality reduction and reduction in poor functional outcome (mRS greater than 4). The primary endpoint neutrality is attributable to including patients enrolled up to 96 hours, in whom functional benefit was not observed. Timing is the decisive variable.",
      },
    ],
    /* claimId: hamlet-interpret | source: Hofmeijer et al. Lancet Neurol 2009 */
    howToInterpret: {
      proves: 'In 64 patients (32 surgical, 32 medical), decompressive surgery reduced 1-year case fatality from 59% to 22%, an absolute reduction of 38 percentage points (P=0.002). This mortality benefit was consistent across the enrollment window up to 96 hours. HAMLET established that surgery saves lives even beyond the 30-48 hour window studied by DECIMAL and DESTINY.',
      doesNotProve: 'The primary endpoint (mRS 0-3 at 1 year) was not statistically significant overall, due to inclusion of patients randomized up to 96 hours after onset, in whom functional benefit was not demonstrated. HAMLET does not prove that surgery improves functional independence when performed beyond 48 hours. The overall neutral primary endpoint means this trial alone cannot support a broad functional benefit claim.',
      cautions: 'HAMLET enrolled patients up to 96 hours after onset; functional benefit was concentrated in patients treated within 48 hours and was not demonstrated for patients treated between 48 and 96 hours. Patients were aged 18-60 years. The 64-patient sample is small. Pooled analysis of DECIMAL, DESTINY, and HAMLET within 48 hours of stroke onset (HAMLET 2009, Figure 3) showed mortality ARR 49.9 percentage points (95% CI 33.9-65.9) and mRS greater than 4 ARR 41.9 percentage points (95% CI 25.2-58.6) favoring surgery.',
    },
    /* claimId: hamlet-pearl | source: Hofmeijer et al. Lancet Neurol 2009 */
    bedsidePearl: "HAMLET's most important teaching is the 48-hour window. Mortality benefit from hemicraniectomy is seen across the enrollment window (up to 96 hours), but functional benefit (and the strongest mortality benefit) is concentrated in patients operated within 48 hours of onset. For patients presenting after 48 hours and before 96 hours, surgery may still reduce death but does not reliably improve functional independence. Tell families explicitly: operating after 48 hours means accepting a higher chance the patient survives with severe disability. The pooled analysis (DECIMAL, DESTINY, HAMLET within 48 hours) is the definitive evidence base for counseling when operating within the 48-hour window.",
    bottomLineSummary: 'HAMLET demonstrates mortality benefit from decompressive surgery up to 96 hours after malignant MCA infarction onset (38 percentage point case fatality reduction, P=0.002). The primary functional endpoint was neutral overall. Functional benefit is restricted to the within-48-hour window per pooled analysis.',
    conclusion: '',
    source: 'Hofmeijer et al. (Lancet Neurol 2009)',
    keyMessage: 'For malignant hemispheric infarction, timing is critical: hemicraniectomy within 48 hours offers both mortality and functional benefit. After 48 hours, surgery may save life but functional benefit is not established.',
  },
  'destiny-ii-trial': {
    id: 'destiny-ii-trial',
    title: 'DESTINY II Trial',
    subtitle: 'Hemicraniectomy in Older Patients With Malignant MCA Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '112',
        label: 'Patients Aged 61+ Years'
      },
      primaryEndpoint: {
        value: 'mRS 0-4',
        label: 'at 6 Months'
      },
      pValue: {
        value: '0.04',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '+20%',
        label: 'Survival Without Severe Disability'
      }
    },
    trialDesign: {
      type: [
        'Randomized controlled trial in older adults',
        'Hemicraniectomy vs conservative intensive care treatment',
        'Malignant MCA infarction with treatment within 48 hours',
        'Primary endpoint: survival without severe disability (mRS 0-4) at 6 months'
      ],
      timeline: 'Germany; patients aged 61-82 years'
    },
    trialResult: 'POSITIVE',
    specialDesign: 'positive-trial',
    archetypeId: 'A' as const,
    doi: '10.1056/NEJMoa1311367',
    listCategory: 'acute',
    efficacyResults: {
      treatment: {
        percentage: 38,
        label: 'Survived without being bedbound or dead (mRS 0-4) at 6 months',
        name: 'Hemicraniectomy'
      },
      control: {
        percentage: 18,
        label: 'Survived without being bedbound or dead (mRS 0-4) at 6 months',
        name: 'Conservative Treatment'
      }
    },
    intervention: {
      treatment: 'Early decompressive hemicraniectomy within 48 hours',
      control: 'Conservative intensive care treatment'
    },
    clinicalContext: 'DESTINY II addressed the unresolved question left by the earlier decompressive trials: whether patients over 60 years also benefit from surgery for malignant MCA infarction. The trial is positive for its primary endpoint, but the clinical interpretation requires careful attention to the functional outcomes of survivors.',
    inclusionCriteria: [
      'Age 61 years or older',
      'Malignant MCA infarction with clinical and imaging criteria for expected fatal brain swelling',
      'Surgery within 48 hours of stroke onset',
      'Pre-stroke mRS 0-1',
    ],
    exclusionCriteria: [
      'Age younger than 61 years',
      'Pre-existing disability (mRS 2 or higher)',
      'Posterior circulation or bilateral infarcts',
      'Hemorrhagic transformation before randomization',
      'Major comorbidities limiting life expectancy',
    ],
    pearls: [
      'Primary endpoint (mRS 0-4) was met: 38% vs 18%, OR 2.91, P=0.04',
      'Mortality was dramatically reduced: 33% vs 70%, a real, large survival benefit',
      '0% of patients in either group achieved mRS 0-2 (good functional outcome)',
      'Virtually all surgical survivors who met the primary endpoint had mRS 4 (severe disability, dependent for most bodily needs)',
    ],
    howToReadChart: [
      {
        question: 'What does the bar chart show?',
        answer: "The bars show the primary endpoint: survival without being bedbound or dead (mRS 0-4) at 6 months. Treatment arm: 38%. Control arm: 18%. The 20 percentage point difference is the trial's positive result. Critically: 0% of patients in either group achieved mRS 0-2 (good outcome, able to perform daily activities independently).",
      },
      {
        question: 'What does mRS 0-4 actually mean clinically?',
        answer: 'mRS 0-4 is a wide range. In DESTINY II, virtually all surgical survivors who counted toward the primary endpoint were mRS 4: severe disability, unable to walk unaided, requiring assistance for most bodily needs. The primary outcome difference in this trial is largely the difference between severe disability (alive but highly dependent) and bedbound or dead. mRS 0-2 (independent function) was achieved by no patient in either arm.',
      },
      {
        question: 'Why does mortality matter separately from the primary endpoint?',
        answer: 'Surgery reduced mortality from 70% to 33%, a 37 percentage point reduction. That is a real and large survival benefit. But survival and functional recovery are different outcomes. Of surgical survivors, nearly all were mRS 4 or mRS 5 (requires constant nursing care and cannot be left alone). DESTINY II is a positive trial for preventing death -- not a trial demonstrating functional recovery in this age group.',
      },
    ],
    /* claimId: destiny-ii-interpret | source: Juttler et al. NEJM 2014 */
    howToInterpret: {
      proves: 'In 112 patients aged 61-82 years, early hemicraniectomy significantly improved the primary endpoint of survival without being bedbound or dead (mRS 0-4) at 6 months: 38% vs 18%, OR 2.91, 95% CI 1.06-7.49, P=0.04. Mortality was dramatically reduced: 33% vs 70%. However, 0% of patients in either group achieved mRS 0-2 (functional independence). Virtually all surgical survivors who met the primary endpoint had mRS 4, meaning severe disability requiring assistance for most bodily needs. The trial proves that surgery prevents death and completely bedbound status in patients over 60 -- not that it restores function.',
      doesNotProve: 'DESTINY II does not prove that hemicraniectomy preserves functional independence or quality of life in patients aged 60 or older. The 0% mRS 0-2 rate in both arms means no patient achieved good functional recovery regardless of treatment assignment. The trial does not establish a meaningful rate of independence, return to daily activities, or quality of life that patients or families might find acceptable. It does not generalize to patients under 60 (DECIMAL, DESTINY, HAMLET address that population). The trial also cannot inform decisions about individual patients\' values or their definition of an acceptable outcome.',
      cautions: 'DESTINY II enrolled 112 of a planned 188 patients; stopped early for enrollment difficulty, which may inflate effect estimates. The CI is wide (OR 1.06-7.49), meaning the true effect could be modest. Mean age was approximately 70 years; results may not apply uniformly across the 61-82 age range. Most surgical survivors had severe disability (mRS 4), not moderate disability -- clinicians should not present this trial to families as evidence of recovery. The trial defines the ethical question for older patients: whether survival with severe disability is consistent with the patient\'s values is not answerable by the trial.',
    },
    /* claimId: destiny-ii-pearl | source: Juttler et al. NEJM 2014 */
    bedsidePearl: "DESTINY II is a positive trial for survival and surgery is a legitimate option -- but it must be offered with the right framing. Tell the family: 'Surgery reduces the chance of dying from 70% to 33%. But 0% of patients who had surgery regained the ability to care for themselves. Nearly all surgical survivors needed help for most bodily needs (mRS 4).' Do not show this trial to a family as evidence that their loved one will do well. Show it as evidence that surgery shifts the outcome from death to severe disability. The family and patient (if able) must decide whether that shift is consistent with their values.",
    bottomLineSummary: 'DESTINY II randomized 112 patients aged 61-82 to early hemicraniectomy vs conservative intensive care. Primary endpoint (mRS 0-4 at 6 months) was met: 38% vs 18%, OR 2.91 (95% CI 1.06-7.49), P=0.04. Mortality was reduced: 33% vs 70%. But 0% of patients in either group achieved mRS 0-2 (independent function). Virtually all surgical survivors had mRS 4 (severe disability). The trial is positive for preventing death; it does not establish good functional recovery in this age group.',
    conclusion: '',
    source: 'Juttler et al. (NEJM 2014)',
    keyMessage: 'DESTINY II is positive for preventing death in older patients, but 0% achieved good functional recovery. Surgery shifts the outcome from death to severe disability -- families must decide whether that is consistent with patient values.',
  },
  'timing-trial': {
    id: 'timing-trial',
    title: 'TIMING Trial',
    subtitle: 'Early vs Delayed NOAC Initiation After AF-Related Ischemic Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '888',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Composite Outcome',
        label: 'Stroke, sICH, or Death at 90 Days'
      },
      pValue: {
        value: '0.004',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: '-1.79%',
        label: 'Absolute Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Registry-based randomized noninferiority trial',
        'Early NOAC initiation <=4 days vs delayed initiation 5-10 days',
        'Patients with acute ischemic stroke and atrial fibrillation',
        'Open-label with blinded endpoint assessment'
      ],
      timeline: 'Swedish Stroke Register, 2017-2020'
    },
    trialResult: 'NEUTRAL',
    resultSubtype: 'non-inferiority',
    archetypeId: 'A' as const,
    listCategory: 'acute',
    efficacyResults: {
      treatment: {
        percentage: 6.89,
        label: 'Composite: recurrent stroke, sICH, or death at 90 days',
        name: 'Early NOAC (within 4 days)'
      },
      control: {
        percentage: 8.68,
        label: 'Composite: recurrent stroke, sICH, or death at 90 days',
        name: 'Delayed NOAC (5-10 days)'
      }
    },
    intervention: {
      treatment: 'NOAC initiated within 4 days after ischemic stroke onset',
      control: 'NOAC initiated 5-10 days after ischemic stroke onset'
    },
    clinicalContext: 'TIMING addressed a common bedside question in atrial-fibrillation stroke care: how soon can oral anticoagulation be restarted without provoking intracranial hemorrhage.',
    inclusionCriteria: [
      'Acute ischemic stroke with atrial fibrillation',
      'Indication for long-term oral anticoagulation',
      'Randomized via the Swedish Stroke Register',
      'Ability to initiate NOAC within 4 days or 5-10 days of stroke onset',
    ],
    exclusionCriteria: [
      'Mechanical heart valve',
      'Prior therapeutic anticoagulation at time of stroke',
      'Severe renal failure (eGFR below 15 mL/min)',
      'High bleeding risk precluding any anticoagulation',
    ],
    pearls: [
      'Early NOAC initiation (within 4 days) was non-inferior to delayed initiation (5-10 days) for the 90-day composite endpoint',
      'Zero symptomatic intracranial hemorrhages in either arm',
      'Recurrent ischemic stroke and death were numerically lower with early initiation',
      'Registry-based randomization made the trial highly pragmatic and practice-relevant',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Rates of the composite primary endpoint (recurrent stroke, symptomatic ICH, or death at 90 days). Early arm: 6.89%. Delayed arm: 8.68%. Absolute risk difference: -1.79 percentage points. This is a noninferiority result: early NOAC was not worse than delayed, and events trended numerically lower with early initiation.',
      },
      {
        question: 'Why is P=0.004 for NI, and how does that differ from P=0.05 for superiority?',
        answer: 'In a noninferiority trial, the P-value tests whether the risk difference exceeds the prespecified NI margin (here: 3 percentage points absolute). P=0.004 means strong evidence that early NOAC does not cause an unacceptable increase in adverse events relative to delayed. It does not mean early is superior to delayed.',
      },
      {
        question: 'Zero symptomatic ICH in either arm: what does that mean?',
        answer: 'No symptomatic intracranial hemorrhages occurred in either arm, a reassuring finding suggesting that early NOAC initiation within 4 days did not produce detectable bleeding harm in this registry-based trial. This supports moving away from the traditional practice of waiting 2 weeks.',
      },
    ],
    /* claimId: timing-interpret | source: Oldgren et al. Circulation 2022 */
    howToInterpret: {
      proves: 'In 888 patients with AF-related ischemic stroke, early NOAC initiation within 4 days was non-inferior to delayed initiation (5-10 days) for the 90-day composite of recurrent stroke, symptomatic ICH, or death. The absolute risk difference was -1.79 percentage points (early 6.89% vs delayed 8.68%), and the upper confidence interval bound did not exceed the prespecified non-inferiority margin (P for NI = 0.004). No symptomatic intracranial hemorrhages occurred in either arm.',
      doesNotProve: 'TIMING does not establish superiority of early over delayed NOAC initiation. The trial cannot determine the optimal specific day of initiation within the early window (any day from 1-4 was grouped together). It does not address initiation within 24 hours, or patients with large infarcts, active hemorrhagic transformation, or significant leukoaraiosis. The open-label design means prescribing behavior could differ between arms.',
      cautions: 'Registry-based randomization via the Swedish Stroke Register is pragmatic but less controlled than a hospital-based double-blind RCT. The sample size (888 patients) was designed for a 3 percentage point NI margin; smaller absolute differences would require larger trials. Event rates were low overall (6.89% and 8.68%), meaning conclusions apply primarily to patients at modest-to-moderate risk. OPTIMAS (3621 patients, 100 UK hospitals) provides a larger, more definitive NI result with a wider delayed-initiation window (7-14 days).',
    },
    /* claimId: timing-pearl | source: Oldgren et al. Circulation 2022 */
    bedsidePearl: 'TIMING met its non-inferiority margin and supports early NOAC initiation within 4 days after AF-related ischemic stroke as safe. This does not mandate same-day initiation; the early window was days 1-4. Individualize timing based on infarct size, hemorrhagic transformation risk, and NIHSS. OPTIMAS (N=3621) provides larger, more definitive evidence and reached the same NI conclusion with a delayed window of 7-14 days.',
    bottomLineSummary: 'Registry-based randomized noninferiority trial of 888 patients with AF-related stroke. Early NOAC within 4 days was non-inferior to delayed (5-10 days) for the 90-day composite of recurrent stroke, sICH, or death (6.89% vs 8.68%, risk difference -1.79 pp, P for NI = 0.004). Zero sICH in either arm. Noninferiority met; superiority not tested. Published Circulation 2022.',
    conclusion: '',
    source: 'Oldgren et al. (Circulation 2022)',
    clinicalTrialsId: 'NCT02961348',
    specialDesign: 'non-inferiority',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      populationExclusions: [
        'AF-related ischemic stroke only — does not apply to non-AF acute stroke',
        'Noninferiority margin: 3 percentage points absolute; NI established (P=0.004)',
        'Early window 1–4 days — does not address same-day initiation within 24 hours',
      ],
    },
    keyMessage: 'TIMING supports early NOAC initiation within 4 days after AF-related ischemic stroke. Noninferiority met; superiority not established.',
  },
  'optimas-trial': {
    id: 'optimas-trial',
    title: 'OPTIMAS Trial',
    subtitle: 'Optimal Timing of DOACs After AF-Related Ischemic Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '3621',
        label: 'Modified Intention-to-Treat Patients'
      },
      primaryEndpoint: {
        value: 'Composite Outcome',
        label: 'Stroke, sICH, or Systemic Embolism at 90 Days'
      },
      pValue: {
        value: '0.0003',
        label: 'For Noninferiority'
      },
      effectSize: {
        value: 'RD 0.000',
        label: 'Event Rates Identical'
      }
    },
    trialDesign: {
      type: [
        'Multicenter open-label blinded-endpoint phase 4 randomized trial',
        'Early DOAC initiation <=4 days vs delayed initiation 7-14 days',
        'Adults with AF-related acute ischemic stroke',
        'Gatekeeper design testing noninferiority then superiority'
      ],
      timeline: '100 UK hospitals, 2019-2024'
    },
    trialResult: 'NEUTRAL',
    resultSubtype: 'non-inferiority',
    archetypeId: 'A' as const,
    listCategory: 'acute',
    efficacyResults: {
      treatment: {
        percentage: 3.3,
        label: 'Composite: recurrent stroke, sICH, or systemic embolism at 90 days',
        name: 'Early DOAC (within 4 days)'
      },
      control: {
        percentage: 3.3,
        label: 'Composite: recurrent stroke, sICH, or systemic embolism at 90 days',
        name: 'Delayed DOAC (7-14 days)'
      }
    },
    intervention: {
      treatment: 'Direct oral anticoagulant initiated within 4 days of stroke onset',
      control: 'Direct oral anticoagulant initiated 7-14 days after stroke onset'
    },
    clinicalContext: 'OPTIMAS provided the largest randomized test of early versus delayed anticoagulation timing after atrial-fibrillation-associated ischemic stroke, directly challenging the traditional tendency to delay for 2 weeks.',
    inclusionCriteria: [
      'Adults with acute ischemic stroke and confirmed atrial fibrillation',
      'Clinical indication for long-term anticoagulation',
      'Randomization at 100 UK stroke centers',
    ],
    exclusionCriteria: [
      'Mechanical heart valve',
      'Active major bleeding or very high bleeding risk',
      'Severe renal impairment precluding DOAC use',
      'Inability to consent or take oral medication',
    ],
    pearls: [
      'Primary composite event rates were identical: 3.3% vs 3.3% (risk difference 0.000)',
      'Noninferiority was met (P = 0.0003); superiority was not demonstrated',
      'Symptomatic ICH was rare and similar in both groups',
      'Largest trial of DOAC timing after AF-related stroke (N=3621); provides most definitive evidence',
    ],
    howToReadChart: [
      {
        question: 'What do the identical bars mean?',
        answer: 'Both bars show 3.3% event rates for the 90-day composite endpoint (recurrent stroke, symptomatic ICH, systemic embolism). The risk difference is 0.000: identical rates. In a noninferiority context, this is the most favorable possible result: early DOAC was not worse than delayed, with exactly equal event rates.',
      },
      {
        question: 'With identical rates, why was superiority not declared?',
        answer: 'OPTIMAS used a gatekeeper design: noninferiority was tested first, then superiority. Superiority requires demonstrating that early initiation is significantly better than delayed. With identical event rates (3.3% vs 3.3%), there is no numerical advantage to test. The trial met its primary NI objective; it cannot support superiority claims.',
      },
      {
        question: 'How does OPTIMAS compare to TIMING?',
        answer: 'OPTIMAS (3621 patients, 100 UK hospitals) is more than four times larger than TIMING (888 patients, Swedish registry). Both met noninferiority. OPTIMAS tested a wider delayed window (7-14 days vs 5-10 days in TIMING) and was powered to detect smaller absolute differences. Consistent NI results across different countries and delayed-window definitions strengthens confidence in early DOAC initiation.',
      },
    ],
    /* claimId: optimas-interpret | source: Werring et al. Lancet 2024 */
    howToInterpret: {
      proves: 'In 3621 patients with AF-related acute ischemic stroke at 100 UK hospitals, early DOAC initiation within 4 days was non-inferior to delayed initiation (7-14 days) for the primary composite of recurrent stroke, symptomatic ICH, or systemic embolism at 90 days. Event rates were identical: 3.3% in both arms (absolute risk difference 0.000, P for NI = 0.0003). Symptomatic ICH was rare and similar in both groups.',
      doesNotProve: 'OPTIMAS does not establish superiority of early over delayed DOAC initiation. The trial cannot determine the optimal specific day within the early window (days 1-4 were grouped together). It does not address patients with large hemispheric infarcts or active hemorrhagic transformation at randomization. The open-label design means the clinical team knew the assigned treatment.',
      cautions: 'The delayed window in OPTIMAS (7-14 days) differs from TIMING (5-10 days), making direct numerical comparison between trials difficult. Event rates were very low (3.3%), limiting power to detect rare outcomes like sICH. The 100 UK hospitals reflect organized stroke services; generalizability to less-resourced settings requires consideration. The trial included only patients with clear indication for long-term anticoagulation.',
    },
    /* claimId: optimas-pearl | source: Werring et al. Lancet 2024 */
    bedsidePearl: 'OPTIMAS is the largest and most definitive trial supporting early DOAC initiation after AF-related stroke. Early within 4 days was non-inferior to waiting 7-14 days, with identical 3.3% event rates. This does not mandate same-day initiation; individualize based on infarct size and hemorrhagic transformation risk. For most patients with small-to-moderate AF-related stroke without hemorrhagic transformation, starting within 4 days is well-supported by the evidence.',
    bottomLineSummary: 'Largest trial of DOAC timing after AF-related stroke: 3621 patients at 100 UK hospitals. Early DOAC within 4 days was non-inferior to delayed (7-14 days) for the 90-day composite of recurrent stroke, sICH, or systemic embolism. Event rates were identical (3.3% vs 3.3%, risk difference 0.000, P for NI = 0.0003). Superiority not demonstrated. Provides the most robust evidence for early DOAC initiation in AF-related ischemic stroke. Published Lancet 2024.',
    conclusion: '',
    source: 'Werring et al. (Lancet 2024)',
    clinicalTrialsId: 'NCT03759938',
    specialDesign: 'non-inferiority',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      populationExclusions: [
        'AF-related ischemic stroke with confirmed indication for long-term anticoagulation only',
        'Noninferiority margin: 2 percentage points absolute (Werring Lancet 2024); NI established (P=0.0003)',
        'Delayed window 7–14 days; does not address day 5–6 initiation timing',
      ],
    },
    keyMessage: 'OPTIMAS provides the most definitive evidence for early DOAC initiation after AF-related stroke. Noninferiority met; superiority not established.',
  },
  'distal-trial': {
    id: 'distal-trial',
    title: 'DISTAL Trial',
    subtitle: 'EVT for Medium/Distal Vessel Occlusion Stroke',
    category: 'Neuro Trials',
    trialResult: 'NEGATIVE',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'not-met',
    applicability: {
      populationExclusions: [
        'Does NOT support routine EVT for distal medium vessel occlusions',
        'Numerically higher sICH in EVT arm (5.9% vs 2.6%) — safety signal',
        'Isolated medium/distal vessel occlusions; pairs with ESCAPE-MeVO as convergent negative evidence',
      ],
    },
    stats: {
      sampleSize: {
        value: '543',
        label: 'Patients (M2/M3/ACA/PCA occlusions)'
      },
      primaryEndpoint: {
        value: 'mRS at 90 days',
        label: 'Modified Rankin Scale (disability)'
      },
      pValue: {
        value: '0.50',
        label: 'NOT Significant (p=0.50)'
      },
      effectSize: {
        value: 'OR 0.90',
        label: 'No Benefit (95% CI: 0.67-1.22)'
      }
    },
    trialDesign: {
      type: [
        'International, multicenter, assessor-blinded RCT',
        '1:1 randomization: EVT + BMT vs BMT alone',
        'Pragmatic design - any EVT technique allowed',
        'Treated within 24 hours of last seen well'
      ],
      timeline: 'Dec 2021 – Jul 2024, 55 sites, 11 countries (mostly Europe)'
    },
    efficacyResults: {
      treatment: {
        percentage: 34.7, // Excellent outcome (mRS 0-1)
        label: 'Median mRS: 2.0',
        name: 'EVT + Best Medical Treatment'
      },
      control: {
        percentage: 37.5, // Excellent outcome (mRS 0-1)
        label: 'Median mRS: 2.0',
        name: 'Best Medical Treatment Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Best Medical Treatment',
      control: 'Best Medical Treatment alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'EVT is proven effective for large-vessel occlusions (ICA, M1, basilar) and dominant M2 occlusions. However, benefit for medium/distal vessel occlusions remained uncertain. DISTAL tested whether EVT could help patients with smaller, more distal occlusions (nondominant M2, M3, M4, ACA, PCA segments). These vessels are technically harder to reach and have less collateral blood flow.',
    calculations: {
      // Negative trial - no NNT
    },
    proceduralDetails: {
      reperfusionRate: {
        value: '71.7%',
        label: 'Successful Reperfusion (TICI 2b-3)',
        tooltip: 'Only 71.7% achieved good reperfusion - LOWER than typical 85-90% in large-vessel EVT trials. This low reperfusion rate may explain why EVT failed. Medium/distal vessels are technically challenging.',
        color: 'warning'
      },
      imagingToPuncture: {
        value: '70 min',
        label: 'Median Time: Imaging to Groin Puncture',
        tooltip: 'Median 70 minutes exceeded the 60-minute target. Delays may have reduced EVT effectiveness, especially for distal vessels with limited collaterals.',
        color: 'warning'
      }
    },
    safetyProfile: {
      mortality: {
        evt: 15.5,
        control: 14.0,
        label: 'All-cause mortality at 90 days - SIMILAR',
        tooltip: 'Death rates were nearly identical (15.5% vs 14.0%), confirming EVT neither helped nor significantly harmed patients overall.'
      },
      sICH: {
        evt: 5.9,
        control: 2.6,
        label: 'Symptomatic ICH - HIGHER with EVT',
        tooltip: 'Symptomatic intracranial hemorrhage was MORE than doubled with EVT (5.9% vs 2.6%), though this did not translate to worse disability or death. This represents the main safety concern.',
        color: 'warning'
      }
    },
    pearls: [
      'EVT provided no disability reduction compared to medical treatment alone',
      'Primary outcome p=0.50 (not significant) - essentially no difference between groups',
      'Median mRS 2.0 in both groups at 90 days',
      'Only 71.7% achieved successful reperfusion - lower than large-vessel trials (85-90%)',
      'Symptomatic ICH doubled with EVT (5.9% vs 2.6%) without mortality benefit',
      'Median age 77 years, NIHSS 6 (relatively mild strokes)',
      'Occlusion locations: 44% M2, 27% M3, 13% P2, 6% P1',
      '65% received IV thrombolysis before/during EVT',
      'Imaging-to-puncture time: 70 min (exceeded 60-min target)',
      'No subgroup showed benefit; not younger patients, not higher NIHSS, not specific occlusion locations',
      'Clinical implication: EVT is not recommended for medium/distal vessel occlusions',
      'Low reperfusion (71.7%), longer treatment delays, and technically demanding access to distal vessels likely contributed to the negative result'
    ],
    conclusion: '',
    source: 'Psychogios M, Brehm A, et al. N Engl J Med. 2025;392(14):1374-1384',
    clinicalTrialsId: 'NCT05029414',
    specialDesign: 'negative-trial',
    keyMessage: 'EVT is ineffective for medium/distal vessel occlusions; medical treatment is standard',
    listCategory: 'thrombectomy',
    listDescription: 'EVT for medium and distal vessel occlusions; negative trial (NEJM 2025).',
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'Medium or distal vessel occlusion (M2, M3, M4, ACA, or PCA segment)',
      'Age 18 or older',
      'NIHSS 4 or higher',
      'Pre-morbid mRS 2 or lower',
      'Last known well within 24 hours',
    ],
    exclusionCriteria: [
      'Large vessel occlusion (ICA, M1, or basilar artery)',
      'ASPECTS below 4 on CT or DWI-ASPECTS below 4 on MRI',
      'Severe comorbidity',
    ],
    mrsDistribution: [
      { arm: 'EVT + Best Medical Treatment', n: 271, pct: [13.3, 21.4, 21.8, 17.3, 9.6, 1.1, 15.5] },
      { arm: 'Best Medical Treatment Alone', n: 269, pct: [17.5, 20.1, 17.1, 21.2, 8.9, 1.2, 14.0] },
    ],
    ordinalStats: { commonOR: 0.90, ciLow: 0.67, ciHigh: 1.22, direction: 'negative' as const, pValue: 0.50 },
    howToReadChart: [
      {
        question: 'What does the bar chart show?',
        answer: 'The Grotta-style stacked bar shows the full mRS distribution from 0 to 6 at 90 days for each arm: EVT plus best medical therapy vs best medical therapy alone in medium and distal vessel occlusions. Each color band represents one mRS grade. Median mRS was 2 in both arms.',
      },
      {
        question: 'How is the ordinal shift judged here?',
        answer: 'The primary endpoint was the ordinal mRS shift at 90 days. Adjusted common OR was 0.90 (95% CI 0.67-1.22, P = 0.50), which crosses 1.0 and is not statistically significant. mRS 0-2 rates were essentially equal: 56.5% (EVT) vs 54.7% (BMT). The EVT arm shows slightly more deaths (mRS 6: 15.5% vs 14.0%), but the distributions overlap heavily.',
      },
      {
        question: 'What about safety and reperfusion?',
        answer: 'Symptomatic ICH more than doubled with EVT (5.9% vs 2.6%). TICI 2b-3 reperfusion was 71.7%, notably lower than the 85-90% typical of large-vessel EVT, reflecting technical difficulty in distal vasculature. 90-day mortality was similar (15.5% vs 14.0%). The safety cost without functional benefit is the central trade-off.',
      },
    ],
    /* claimId: distal-noninferiority | source: Psychogios NEJM 2025 */
    howToInterpret: {
      proves: 'In medium and distal vessel occlusions (predominantly M2, M3, P1, and P2) treated within 24 hours, adding EVT to best medical therapy did not improve 90-day ordinal mRS compared with BMT alone (adjusted common OR 0.90, 95% CI 0.67-1.22, P = 0.50). mRS 0-2 was nearly identical (56.5% vs 54.7%) and median mRS was 2 in both arms. Symptomatic ICH was more than doubled with EVT (5.9% vs 2.6%), and TICI 2b-3 reperfusion was only 71.7%.',
      doesNotProve: 'The neutral primary result does not exclude benefit in selected subgroups (for example, dominant M2 with high NIHSS, or specific posterior circulation segments) that were underpowered individually. It also does not extend to large-vessel occlusions, where EVT benefit remains established. A negative trial in a heterogeneous population does not equal absence of benefit in every patient within that population.',
      cautions: 'Distal vessels are technically harder: TICI 2b-3 of 71.7% is meaningfully lower than the 85-90% seen in large-vessel EVT. The doubled sICH rate (5.9% vs 2.6%) is the dominant safety signal. Predominantly European cohort (11 countries, 55 sites). Any EVT technique was allowed, reflecting real-world practice but limiting inference about specific devices. Treatment window extended to 24 hours; results may not apply uniformly across that range.',
    },
    bedsidePearl: 'DISTAL and ESCAPE-MeVO together provide strong evidence against routine EVT for unselected medium or distal vessel occlusions. The 71.7% reperfusion rate, well below the 85-90% seen in large-vessel trials, reflects the technical challenge of accessing M3-M4 and ACA/PCA segments. Symptomatic ICH was more than doubled with EVT (5.9% vs 2.6%) without mortality benefit. Current evidence does not support routine EVT for MeVO outside of highly selected cases or ongoing trials.',
    bottomLineSummary: 'In 543 patients with medium or distal vessel occlusion (M2-M4, ACA, or PCA) treated within 24 hours, EVT plus best medical treatment did not improve 90-day mRS distribution versus medical treatment alone (cOR 0.90, 95% CI 0.67-1.22, p=0.50). Median mRS was 2.0 in both groups. Symptomatic ICH was more than doubled with EVT (5.9% vs 2.6%). Reperfusion was achieved in only 71.7% of EVT patients. Together with ESCAPE-MeVO, DISTAL argues strongly against routine EVT for unselected medium or distal vessel occlusions.',
  },
  'escape-mevo-trial': {
    id: 'escape-mevo-trial',
    title: 'ESCAPE-MeVO Trial',
    subtitle: 'EVT for Medium Vessel Occlusions',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'not-met',
    applicability: {
      populationExclusions: [
        'Does NOT support routine EVT for broad medium/distal vessel occlusion populations',
        'Signal for higher mortality and sICH in EVT arm — requires cautious safety framing',
        'M2/M3/A2+/P2+ occlusions — not an anterior LVO trial',
      ],
    },
    stats: {
      sampleSize: {
        value: '530',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.61',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'Possible Harm',
        label: '41.6% vs 43.1%'
      }
    },
    trialDesign: {
      type: [
        'Multicenter prospective randomized trial',
        'Open-label (PROBE design)',
        '1:1 allocation (EVT + Usual Care vs. Usual Care)'
      ],
      timeline: 'Enrolled 2019-2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 41.6,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'EVT + Usual Care'
      },
      control: {
        percentage: 43.1,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Usual Care Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Usual Care',
      control: 'Usual Care alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Conducted in parallel with DISTAL, the ESCAPE-MeVO trial investigated the efficacy and safety of endovascular thrombectomy for Medium Vessel Occlusions (MeVO), specifically targeting the M2/M3 MCA, A2/A3 ACA, and P2/P3 PCA segments.',
    calculations: {
      // Negative trial with harm signal - no NNT
    },
    pearls: [
      'No functional benefit (mRS 0-2: 41.6% vs 43.1%, rate ratio 0.95; P=0.61); 90-day mortality was higher with EVT',
      '90-day mortality 13.3% vs 8.4% (HR 1.82, 95% CI 1.06-3.12)',
      'sICH significantly more frequent in EVT arm (5.4% vs 2.2%)',
      '12-hour treatment window from last known well',
      'NIHSS above 5 or disabling deficit of 3 to 5, with favorable baseline imaging',
      'EVT is not recommended for routine use in medium vessel occlusions'
    ],
    conclusion: '',
    source: 'Goyal et al. (NEJM 2025)',
    clinicalTrialsId: 'NCT05151172',
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    safetyProfile: {
      sICH: {
        /* claimId: escape-mevo.sich | source: ESCAPE-MeVO Investigators, NEJM 2025, Table 2 */
        evt: 5.4,
        control: 2.2,
        label: 'Symptomatic ICH',
        tooltip: 'Symptomatic intracranial hemorrhage occurred in 5.4% of the EVT group vs 2.2% of the usual-care group. Procedural risk in medium-caliber vessels contributed to the absence of net benefit. Source: ESCAPE-MeVO Investigators, NEJM 2025, Table 2.',
        color: 'danger',
      },
      mortality: {
        /* claimId: escape-mevo.mortality | source: ESCAPE-MeVO Investigators, NEJM 2025, Table 2 */
        evt: 13.3,
        control: 8.4,
        label: 'Mortality at 90 days',
        tooltip: 'All-cause mortality at 90 days was 13.3% (EVT) vs 8.4% (usual care), HR 1.82 (95% CI 1.06-3.12). Higher sICH and mortality without functional gain led to the NEGATIVE overall verdict. Source: ESCAPE-MeVO Investigators, NEJM 2025, Table 2.',
        color: 'danger',
      },
    },
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with medium vessel occlusion confirmed on vessel imaging (M2, M3, A1, A2, P1, P2 segments)',
      'NIHSS score above 5, or disabling neurological deficit with NIHSS 3 to 5',
      'Treatment possible within 12 hours of last known well',
      'Favorable baseline imaging without large established infarct',
      'Pre-stroke modified Rankin Scale 0 to 2',
    ],
    exclusionCriteria: [
      'Large vessel occlusion (ICA, M1, basilar) — EVT-eligible by established evidence',
      'Large established infarct on baseline imaging',
      'Pre-stroke mRS above 2',
      'Recent major surgery or intracranial bleeding within 3 months',
      'Contraindication to contrast or thrombectomy procedure',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: '100 dots represent 100 patients in each arm. A filled dot is a patient who was functionally independent at 90 days (mRS 0-2); an open dot is one who was not.',
      },
      {
        question: 'What should I look at first?',
        answer: 'The EVT arm has slightly fewer filled dots than the medical arm (42 vs 43). The direction is reversed compared to a positive trial. There is no cobalt band because the result is negative.',
      },
      {
        question: 'What does this mean for my patient?',
        answer: 'Routine EVT for medium vessel occlusion is not supported. Procedural risk in smaller caliber vessels (sICH 5.4% vs 2.2%, mortality 13.3% vs 8.4%) without functional gain argues against standard EVT for MeVO. Highly selected cases at centers with specific expertise remain a clinical judgment.',
      },
    ],
    howToInterpret: {
      /* claimId: escape-mevo.interpret | source: ESCAPE-MeVO Investigators, NEJM 2025 */
      proves: 'In unselected patients with medium vessel occlusion treated within 12 hours, EVT did not improve 90-day functional independence compared with best medical management.',
      doesNotProve: 'It does not prove that no MeVO patient can benefit from EVT. It does not generalize to all imaging selection strategies, all device approaches, or centers with exceptional MeVO-specific technical expertise.',
      cautions: 'EVT carries real procedural risk in medium caliber vessels: sICH was more than doubled (5.4% vs 2.2%) and mortality was significantly higher (13.3% vs 8.4%, HR 1.82). The rate ratio for functional independence was 0.95 (95% CI 0.82 to 1.10), consistent with possible modest harm. Parallel neutral results from DISTAL reinforce this finding for unselected MeVO populations.',
    },
    /* claimId: escape-mevo.bedside-pearl | source: ESCAPE-MeVO Investigators, NEJM 2025 */
    bedsidePearl: 'ESCAPE-MeVO stopped the routine-EVT-for-MeVO question: sICH was 5.4% vs 2.2% and mortality was 13.3% vs 8.4% with no functional gain. Medium vessel occlusion is not a thrombectomy trigger by default. Procedural risk vs uncertain benefit must be discussed individually.',
    bottomLineSummary: 'ESCAPE-MeVO showed that EVT for medium vessel occlusion (M2, M3, ACA, PCA branches) did not improve functional independence at 90 days compared with best medical management, and was associated with higher rates of symptomatic hemorrhage and 90-day mortality. Routine EVT for MeVO is not supported by this evidence.',
    listCategory: 'thrombectomy',
    listDescription: 'EVT for medium vessel occlusion (MeVO); no functional benefit, higher sICH and mortality (NEJM 2025).',
  },
  'defuse-3-trial': {
    id: 'defuse-3-trial',
    title: 'DEFUSE 3 Trial',
    subtitle: 'Thrombectomy for Ischemic Stroke (6-16 Hours)',
    category: 'Neuro Trials',
    doi: '10.1056/NEJMoa1713973',
    pmid: '29364767',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'CT or MR perfusion mismatch required (RAPID: core <70 mL, mismatch ratio ≥1.8, mismatch volume ≥15 mL); pre-stroke mRS 0–1; anterior LVO (ICA or M1)',
      populationExclusions: [
        '6–16h time window only — does not apply to early window (0-6h) or ultra-late window (>16h)',
        'Stopped early for efficacy at pre-specified interim (n=182 of planned 476) — truncation bias may inflate effect size',
        'Primary endpoint is the ordinal mRS distribution (common OR 2.77, 95% CI 1.63–4.70); the mRS 0–2 dichotomization (45% vs 17%) is a SECONDARY outcome — NNT 3.6 derived from this secondary must carry explicit labeling per clinical-trial-audit',
        'Posterior circulation excluded; M2 occlusions enrolled only one patient — generalizability limited',
      ],
    },
    stats: {
      sampleSize: {
        value: '182',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-2',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '28%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Blinded-endpoint assessment',
        'Perfusion imaging selection (CTP/MRI)',
        '1:1 allocation (Thrombectomy vs. Medical)'
      ],
      timeline: 'Enrolled 2016-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 45,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy + Medical'
      },
      control: {
        percentage: 17,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Standard Medical Therapy',
      control: 'Standard Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Historically, mechanical thrombectomy was limited to 6 hours from symptom onset. The DEFUSE 3 trial aimed to determine if patients with salvageable tissue on perfusion imaging (penumbra) would benefit from treatment in the extended 6–16 hour window.',
    calculations: {
      nnt: 3.6, // 1 / (0.45 - 0.17) = 3.57 ≈ 3.6
      nntExplanation: 'For every 3.6 patients treated with thrombectomy in the 6-16 hour window, one additional patient achieves functional independence (mRS 0-2) compared to medical therapy alone'
    },
    pearls: [
      'Primary endpoint is the ordinal mRS distribution (common OR 2.77, 95% CI 1.63–4.70). NNT 3.6 is derived from the SECONDARY mRS 0–2 outcome (45% vs 17%); ordinal-shift primaries do not yield valid NNT per clinical-trial-audit',
      'Late window: Along with DAWN, DEFUSE-3 shifted selection from time-based to tissue-based; perfusion mismatch over clock',
      'Selection Criteria: Infarct Core < 70 ml, Mismatch Ratio ≥ 1.8, Mismatch Volume ≥ 15 ml; pre-stroke mRS 0–1; ICA or M1 occlusion',
      'Mortality Reduction: 14% in EVT group vs 26% in Control group (P=0.05) — secondary outcome, borderline significant',
      'Safety: sICH 7% vs 4% (P=0.75) — no significant difference',
      'Implementation: Requires automated perfusion software (e.g., RAPID) for standardized core/penumbra calculation',
      'AHA/ASA 2026 §4.7.2 COR 1: EVT recommended for anterior LVO 6–24h with imaging selection (NIHSS ≥6, ASPECTS ≥3, age <80, prestroke mRS 0–1)'
    ],
    conclusion: '',
    source: 'Albers et al. (NEJM 2018;378(8):708–718)',
    clinicalTrialsId: 'NCT02586415',
    listCategory: 'thrombectomy',
    listDescription: 'Thrombectomy 6–16 hours with perfusion imaging selection.',
    legend: {
      finding: 'Perfusion-selected thrombectomy at 6–16 h triples functional independence (45% vs 17%).',
      bottomLineTag: '+28 / 100',
      keyStat: 'NNT 3.6',
    },
  },
  'dawn-trial': {
    id: 'dawn-trial',
    title: 'DAWN Trial',
    subtitle: 'Thrombectomy for Ischemic Stroke (6-24 Hours)',
    category: 'Neuro Trials',
    doi: '10.1056/NEJMoa1706442',
    pmid: '29129157',
    primaryDesign: 'bayesian-superiority',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'Clinical-imaging mismatch required by age strata (≥80y: NIHSS≥10 + core<21mL; <80y: NIHSS≥10 + core<31mL, or NIHSS≥20 + core 31–<51mL)',
      populationExclusions: [
        'Trevo device only — results may not generalize to all retrieval systems',
        '6–24h last-known-well window — not applicable to patients with known onset <6h (use early-window evidence)',
        'Stopped early at 31 months for predictive probability of success ≥95% on first coprimary endpoint (utility-weighted mRS) — truncation bias likely',
        'Bayesian design — superiority established by posterior probability >0.999, not a frequentist p-value. The second coprimary (mRS 0–2 binary, 49% vs 13%) was upgraded from secondary at FDA request 30 months into the trial while still blinded; no multiplicity adjustment',
        'NNT 2.8 is derived from the binary coprimary (mRS 0–2). NNT not formally valid for Bayesian primaries; displayed with explicit posterior-probability annotation per existing renderer',
      ],
    },
    stats: {
      sampleSize: {
        value: '206',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Utility-weighted mRS',
        label: 'at 90 Days'
      },
      pValue: {
        value: '>99.9%',
        label: 'Superiority'
      },
      effectSize: {
        value: '36%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter prospective randomized trial',
        'Open-label adaptive design',
        'Clinical-core mismatch selection',
        '1:1 allocation (Thrombectomy vs. Control)'
      ],
      timeline: 'Enrolled 2014-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 49,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy + Medical'
      },
      control: {
        percentage: 13,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Therapy Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Standard Medical Therapy',
      control: 'Standard Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'The DAWN trial investigated whether thrombectomy is effective in patients with a "Wake-Up" stroke or late presentation (6 to 24 hours) who demonstrate a clinical-core mismatch (severe deficit but small infarct core).',
    calculations: {
      nnt: 2.8, // 1 / (0.49 - 0.13) = 2.78 ≈ 2.8
      nntExplanation: 'For every 2.8 patients treated with thrombectomy in the 6-24 hour window, one additional patient achieves functional independence (mRS 0-2) compared to medical therapy alone - one of the strongest treatment effects in stroke history'
    },
    pearls: [
      'MASSIVE BENEFIT: Absolute difference in mRS 0–2 functional independence was 36%, yielding derived NNT 2.8 — one of the largest effects in stroke history. The trial primary is utility-weighted mRS (Bayesian); the mRS 0–2 binary is the second coprimary',
      'Probability of Superiority: >99.9% (Bayesian posterior, not a frequentist p-value)',
      'Patient Selection: Age/NIHSS-adjusted clinical-core mismatch (Group A: Age ≥80, NIHSS ≥10, Core <21ml; Group B: Age <80, NIHSS ≥10, Core <31ml; Group C: Age <80, NIHSS ≥20, Core 31–<51ml)',
      'Wake-Up Strokes: First randomized evidence for treating patients with unknown onset time if clinical-imaging mismatch is favorable',
      'Clinical-Core Mismatch: Unlike DEFUSE-3 which uses flat core/penumbra cutoff, DAWN uses age/NIHSS-adjusted criteria',
      'Stopped early at interim (31 mo, n=206 of planned 500) for predictive probability of success ≥95%',
      'AHA/ASA 2026 §4.7.2 COR 1: EVT recommended for anterior LVO 6–24h with imaging selection — DAWN and DEFUSE-3 are foundational'
    ],
    conclusion: '',
    source: 'Nogueira et al. (NEJM 2018;378(1):11–21)',
    clinicalTrialsId: 'NCT02142283',
    listCategory: 'thrombectomy',
    listDescription: 'Thrombectomy 6–24 hours with clinical–imaging mismatch.',
    legend: {
      finding: 'Thrombectomy to 24 h with clinical–core mismatch: 49% vs 13% independence, NNT 2.8.',
      bottomLineTag: '+36 / 100',
      keyStat: 'NNT 2.8',
    },
  },
  'select2-trial': {
    id: 'select2-trial',
    title: 'SELECT2 Trial',
    subtitle: 'Large Core Thrombectomy',
    category: 'Neuro Trials',
    doi: '10.1056/NEJMoa2214403',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'ASPECTS 3–5 OR perfusion-based core ≥50 mL required; ≤24h anterior LVO; age ≤85; pre-stroke mRS 0–1',
      populationExclusions: [
        'Stopped early for efficacy (2nd interim)',
        'Large-core context — primary endpoint is ordinal mRS shift (gOR 1.51, 95% CI 1.20–1.89); functional independence (mRS 0–2) is a secondary outcome at 20% vs 7%. Do not overstate as "independence restored"',
        'Vascular complications and mortality must be presented alongside efficacy (sICH 0.6% vs 1.1% NS; 90-d mortality 38.4% vs 41.5% NS)',
        'NNT 7.7 is derived from the SECONDARY mRS 0–2 outcome — display with explicit secondary-outcome label per clinical-trial-audit skill rules (ordinal-shift primaries do not yield valid NNT)',
      ],
    },
    stats: {
      sampleSize: {
        value: '352',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS distribution',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '13%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Randomized open-label international trial',
        'Large core selection (ASPECTS 3-5 or Core ≥50ml)',
        '1:1 allocation (Thrombectomy vs. Medical)'
      ],
      timeline: 'Enrolled 2019-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 20,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Thrombectomy'
      },
      control: {
        percentage: 7,
        label: 'Functional independence (mRS 0-2) at 90 days',
        name: 'Medical Management'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Medical Management',
      control: 'Medical Management alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Patients with large ischemic cores (ASPECTS < 6 or Core Volume > 50ml) were historically excluded from thrombectomy trials due to fears of futile reperfusion and hemorrhagic transformation. SELECT2 challenged this dogma.',
    calculations: {
      nnt: 7.7, // 1 / (0.20 - 0.07) = 7.69 ≈ 7.7
      nntExplanation: 'For every 7.7 patients with large core treated with thrombectomy, one additional patient achieves functional independence (mRS 0-2) compared to medical management alone'
    },
    pearls: [
      'Large core: No longer an absolute contraindication; SELECT2 showed ordinal disability shift even at ASPECTS 3–5',
      'Selection Criteria: ASPECTS 3-5 on NCCT OR Core volume ≥ 50 ml on CTP; age ≤85; pre-stroke mRS 0–1',
      'Generalized Odds Ratio: 1.51 (95% CI 1.20–1.89) — this is the primary statistic, not the mRS 0–2 dichotomization',
      'NNT framing: NNT 7.7 is for the secondary outcome mRS 0–2 (20% vs 7%). The ordinal-shift primary does not yield a valid NNT per clinical-trial-audit',
      'Risk/Benefit: While outcomes are generally poorer than small-core patients, EVT shifts disability one step lower on average (e.g., walking-with-assistance vs bedbound)',
      'Safety: sICH 0.6% EVT vs 1.1% medical (NS); 90-d mortality 38.4% vs 41.5% (NS) — no significant safety penalty',
      'AHA/ASA 2026 §4.7.2 COR 1: EVT recommended for ASPECTS 3–5 LVO patients within 6h (and reasonable within 6–24h, COR 2a)'
    ],
    conclusion: '',
    source: 'Sarraj et al. (NEJM 2023;388(14):1259–1271)',
    clinicalTrialsId: 'NCT03876457',
    listCategory: 'thrombectomy',
    listDescription: 'Large core thrombectomy (ASPECTS 3–5, 0–6h and extended window).',
  },
  'angel-aspect-trial': {
    id: 'angel-aspect-trial',
    title: 'ANGEL-ASPECT Trial',
    subtitle: 'Large Core Thrombectomy (China)',
    category: 'Neuro Trials',
    doi: '10.1056/NEJMoa2213379',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'ASPECTS 3–5 (no core limit) OR ASPECTS 0–2 with core 70–100 mL OR ASPECTS >5 with core 70–100 mL (6–24h window); ≤24h anterior LVO; age ≤80; NIHSS 6–30; pre-stroke mRS 0–1',
      geography: 'China',
      populationExclusions: [
        'China-only — imaging criteria and any-ICH/sICH distinction differ from SELECT2',
        'Stopped early for efficacy (2nd interim)',
        'Large-core context — primary is ordinal mRS shift (gOR 1.37, 95% CI 1.11–1.69); functional independence (mRS 0–2) is a secondary outcome at 30% vs 11.6%',
        'NNT 5.4 is derived from the SECONDARY mRS 0–2 outcome — display with explicit secondary-outcome label (ordinal-shift primaries do not yield valid NNT)',
        'Higher any-ICH (49.1% vs 17.3%, P<0.001) and sICH trend (6.1% vs 2.7%) than SELECT2 — careful BP management and patient selection required',
      ],
    },
    stats: {
      sampleSize: {
        value: '456',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS distribution',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.004',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'gOR 1.37',
        label: 'Generalized OR (primary)'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Conducted in China',
        'Large core selection (ASPECTS 3-5 or Core 70-100ml; also ASPECTS 0–2 with core 70–100mL)',
        '1:1 allocation (Thrombectomy vs. Medical)',
        'Stopped early for efficacy (2nd interim)'
      ],
      timeline: 'Enrolled 2020-2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 30,
        label: 'Functional independence (mRS 0-2) at 90 days (secondary)',
        name: 'Thrombectomy'
      },
      control: {
        percentage: 11.6,
        label: 'Functional independence (mRS 0-2) at 90 days (secondary)',
        name: 'Medical Therapy'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Medical Therapy',
      control: 'Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Conducted in China, ANGEL-ASPECT complemented SELECT2 by investigating thrombectomy in patients with large infarct cores, including those with cores up to 100ml.',
    calculations: {
      nnt: 5.4, // 1 / (0.30 - 0.116) = 5.43 ≈ 5.4
      nntExplanation: 'For every 5.4 patients with large core (up to 100ml) treated with thrombectomy, one additional patient achieves functional independence (mRS 0-2) compared to medical therapy alone'
    },
    pearls: [
      'Confirmation: Validated SELECT2 findings in a Chinese population with broader volume criteria (cores up to 100ml; ASPECTS 0–2 with cores 70–100 mL also enrolled)',
      'Selection Criteria: ASPECTS 3–5 (no core limit) OR ASPECTS 0–2 with core 70–100 mL OR ASPECTS >5 with core 70–100 mL (6–24h)',
      'Generalized Odds Ratio: 1.37 (95% CI 1.11–1.69), P=0.004 — primary statistic for ordinal mRS shift',
      'NNT framing: NNT 5.4 is for the SECONDARY mRS 0–2 outcome (30% vs 11.6%). The ordinal-shift primary does not yield a valid NNT',
      'Hemorrhage Risk: sICH trend higher (6.1% vs 2.7%, NS); any ICH significantly higher (49.1% vs 17.3%, P<0.001). Careful BP management required',
      '90-day mortality: 21.7% vs 20.0% (NS) — no mortality penalty despite higher ICH',
      'AHA/ASA 2026 §4.7.2 COR 1: EVT recommended for ASPECTS 3–5 LVO patients within 6h; COR 2a for 6–24h window with significant mass effect exclusion'
    ],
    conclusion: '',
    source: 'Huo et al. (NEJM 2023;388(14):1272–1283)',
    clinicalTrialsId: 'NCT04551664',
    listCategory: 'thrombectomy',
    listDescription: 'Large core thrombectomy; China cohort (ASPECTS 3–5 or core ≥70 mL).',
  },
  'thaws-trial': {
    id: 'thaws-trial',
    title: 'THAWS Trial',
    subtitle: 'Low-Dose Alteplase for Unknown-Onset Ischemic Stroke',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'terminated-administrative',
    applicability: {
      doseSpecific: '0.6 mg/kg alteplase (Japan standard) — not the international standard 0.9 mg/kg',
      imagingSelection: 'MRI DWI-FLAIR mismatch required',
      populationExclusions: ['Does not disprove WAKE-UP — underpowered and stopped early after WAKE-UP results'],
    },
    trialResult: 'NEGATIVE',
    stats: {
      sampleSize: {
        value: '131',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.89',
        label: 'Not Significant'
      },
      effectSize: {
        value: '-1.2%',
        label: 'No Benefit'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized trial',
        'Open-label with blinded endpoint assessment',
        'MRI DWI-positive / FLAIR-negative selection',
        '1:1 allocation (Alteplase vs. Standard treatment)'
      ],
      timeline: 'Stopped early at 131 of planned 300 patients'
    },
    efficacyResults: {
      treatment: {
        percentage: 47.1,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Alteplase 0.6 mg/kg'
      },
      control: {
        percentage: 48.3,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Standard Medical Treatment'
      }
    },
    intervention: {
      treatment: 'IV Alteplase 0.6 mg/kg (10% bolus, remainder over 60 min)',
      control: 'Standard medical treatment with antithrombotic therapy per local practice'
    },
    clinicalContext: 'THAWS tested whether MRI-selected wake-up or unclear-onset ischemic stroke could benefit from low-dose alteplase (0.6 mg/kg), the dose used in Japan, using a DWI-positive and FLAIR-negative selection strategy.',
    pearls: [
      'Neutral Trial: No difference in mRS 0-1 at 90 days (47.1% vs 48.3%; P=0.89)',
      'Early Termination: The study stopped after WAKE-UP was published, leaving it underpowered for definitive conclusions',
      'Dose Distinction: THAWS evaluated alteplase 0.6 mg/kg rather than the standard 0.9 mg/kg used in WAKE-UP',
      'Safety: Symptomatic ICH was uncommon (1/71 vs 0/60), and 90-day mortality was 2/71 vs 2/60',
      'Case Mix: Investigators noted relatively mild strokes and frequent absence of large-artery occlusion'
    ],
    conclusion: '',
    source: 'Koga et al. (Stroke 2020)',
    doi: '10.1161/STROKEAHA.119.028127',
    clinicalTrialsId: 'NCT02002325',
    listCategory: 'thrombolysis',
    listDescription: 'Low-dose alteplase 0.6 mg/kg for MRI-selected unknown-onset stroke; stopped early after WAKE-UP, inconclusive.',
    inclusionCriteria: [
      'Acute ischemic stroke with unknown time of onset (including wake-up stroke)',
      'DWI-positive and FLAIR-negative on MRI (DWI-FLAIR mismatch)',
      'Met standard thrombolysis criteria except for unknown onset time',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Known time of onset within the standard treatment window',
      'FLAIR hyperintensity in the DWI lesion region (established infarct)',
      'Contraindication to IV thrombolysis',
      'Severe stroke with NIHSS >25',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 90 days. Alteplase 0.6 mg/kg reached 47.1 per 100 patients; standard medical treatment 48.3. The relative risk 0.97 (95% CI 0.68-1.41, P=0.892) shows no difference. The two groups were essentially identical in outcomes.',
      },
      {
        question: 'Why was THAWS stopped early?',
        answer: 'THAWS was not stopped for harm — it was stopped pragmatically after the WAKE-UP trial demonstrated efficacy of alteplase 0.9 mg/kg in the same DWI-FLAIR mismatch population. With WAKE-UP already providing an answer for the 0.9 mg/kg dose, continuing THAWS for the Japan-specific 0.6 mg/kg dose was considered impractical with only 131 of 300 planned patients enrolled.',
      },
      {
        question: 'Can we conclude 0.6 mg/kg does not work for wake-up stroke?',
        answer: 'No. THAWS enrolled only 131 patients (44% of planned 300) and is severely underpowered. Findings should be interpreted as inconclusive rather than definitively negative. The numerical similarity (47.1% vs 48.3%) could represent a true null effect or simply insufficient power. WAKE-UP with 0.9 mg/kg provides the more reliable answer.',
      },
    ],
    howToInterpret: {
      proves: 'In MRI-selected unknown-onset stroke patients (DWI-positive, FLAIR-negative), low-dose alteplase 0.6 mg/kg did not demonstrate benefit over standard medical treatment for mRS 0-1 at 90 days (47.1% vs 48.3%, RR 0.97, 95% CI 0.68-1.41, P=0.892), with one sICH in the alteplase arm and none in controls.',
      doesNotProve: 'THAWS does not definitively prove that low-dose alteplase 0.6 mg/kg is ineffective in wake-up stroke. The trial was stopped at 44% enrollment and was severely underpowered. It also does not apply to standard-dose alteplase 0.9 mg/kg, which showed efficacy in WAKE-UP using the same imaging selection strategy.',
      cautions: 'The trial was stopped early following publication of WAKE-UP — not for safety reasons. At 131 of 300 planned patients (44% enrollment), findings are inconclusive rather than definitively negative; the observed null result may reflect insufficient power rather than true absence of effect. The 0.6 mg/kg dose is specific to Japan-approved practice and is not the internationally used dose.',
    },
    bedsidePearl: 'THAWS tested the Japan-specific 0.6 mg/kg alteplase dose in DWI-FLAIR mismatch wake-up stroke and found no benefit, but the trial was stopped at 44% enrollment — findings are inconclusive. The correct reference for MRI-guided wake-up stroke treatment is WAKE-UP (alteplase 0.9 mg/kg, mRS 0-1 53.3% vs 41.8%, OR 1.61, P=0.02). Use standard-dose alteplase.',
    bottomLineSummary: 'THAWS found no benefit of low-dose alteplase 0.6 mg/kg vs standard medical treatment in DWI-FLAIR mismatch wake-up stroke (47.1% vs 48.3%, P=0.892), but was stopped at 44% of planned enrollment after WAKE-UP demonstrated efficacy of 0.9 mg/kg. Results are inconclusive due to severe underpowering. The 0.6 mg/kg dose is specific to Japanese practice guidelines.',
  },
  'trace-iii-trial': {
    id: 'trace-iii-trial',
    title: 'TRACE-III Trial',
    subtitle: 'Tenecteplase for Ischemic Stroke 4.5-24 Hours Without Thrombectomy',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      evtContext: 'evt-unavailable',
      populationExclusions: ['EVT-capable systems — TRACE-III enrolled patients without access to or planned EVT'],
    },
    stats: {
      sampleSize: {
        value: '516',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.03',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '8.8%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized controlled trial',
        'Conducted in China',
        'Perfusion imaging selection',
        '1:1 allocation (Tenecteplase vs. Standard treatment)'
      ],
      timeline: 'Published 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 33.0,
        label: 'No disability (mRS 0-1) at 90 days',
        name: 'Tenecteplase Group'
      },
      control: {
        percentage: 24.2,
        label: 'No disability (mRS 0-1) at 90 days',
        name: 'Standard Medical Treatment'
      }
    },
    intervention: {
      treatment: 'IV Tenecteplase 0.25 mg/kg (max 25 mg)',
      control: 'Standard medical treatment without routine thrombectomy access'
    },
    clinicalContext: 'TRACE-III tested late-window tenecteplase in patients with ICA or MCA occlusion, salvageable tissue on perfusion imaging, and no access to endovascular thrombectomy.',
    calculations: {
      nnt: 11.4,
      nntExplanation: 'For every 11.4 perfusion-selected late-window LVO patients treated with tenecteplase when EVT is unavailable, one additional patient achieves mRS 0-1 at 90 days compared with standard medical treatment'
    },
    pearls: [
      'Late-Window Basis: TRACE-III is the key trial supporting thrombolysis up to 24 hours for selected ICA/MCA occlusions when EVT cannot be performed',
      'Selection Criteria: Required salvageable tissue on perfusion imaging and enrollment 4.5-24 hours from last-known-well',
      'Wake-Up Eligible: Stroke on awakening and unwitnessed stroke were included if within 24 hours from last-known-well',
      'Not a Bridging Trial: Patients were enrolled because thrombectomy was not available; this does not justify delaying rapid EVT',
      'Safety Trade-off: Symptomatic ICH was higher with tenecteplase (3.0% vs 0.8%), while mortality was similar (13.3% vs 13.1%)'
    ],
    conclusion: '',
    source: 'Xiong et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2402980',
    clinicalTrialsId: 'NCT05141305',
    listCategory: 'thrombolysis',
    listDescription: 'Late-window tenecteplase 4.5-24h for ICA/MCA occlusion without EVT access; POSITIVE, NNT 11.',
    trialResult: 'POSITIVE',
    safetyProfile: {
      sICH: {
        evt: 3.0,
        control: 0.8,
        label: 'Symptomatic intracranial hemorrhage within 36 hours',
        color: 'warning',
        tooltip: 'sICH was higher with tenecteplase (3.0% vs 0.8%), a tradeoff to weigh against the 8.8 pp efficacy gain. Mortality was similar (13.3% vs 13.1%).',
      },
    },
    inclusionCriteria: [
      'ICA or MCA occlusion confirmed on vascular imaging',
      'Salvageable tissue on perfusion imaging (mismatch criteria)',
      '4.5 to 24 hours from last known well (including wake-up and unwitnessed stroke)',
      'No access to or not proceeding with endovascular thrombectomy',
    ],
    exclusionCriteria: [
      'Access to and agreement to endovascular thrombectomy',
      'Large established infarct core (no mismatch on perfusion imaging)',
      'Contraindication to IV thrombolysis',
      'Prior stroke with significant disability (mRS >1)',
    ],
    howToReadChart: [
      {
        question: 'What does this chart show?',
        answer: 'mRS 0-1 (no disability) at 90 days in patients with ICA/MCA occlusion treated 4.5-24 hours after stroke onset when EVT was not available. Tenecteplase reached 33.0 per 100; standard medical treatment 24.2. The 8.8 pp absolute difference (relative rate 1.37, P=0.03, NNT 11) was statistically significant.',
      },
      {
        question: 'Why is sICH higher but mortality similar?',
        answer: 'Late-window IVT carries higher hemorrhagic risk than the standard window (ischemic core is more established). Tenecteplase caused 3.0% sICH versus 0.8% — but the 8.8 pp efficacy gain outweighed this hemorrhagic risk on net for the enrolled population. Mortality was 13.3% vs 13.1% (not different), suggesting sICH events were nonfatal in most cases.',
      },
      {
        question: 'How does TRACE-III compare to TIMELESS?',
        answer: 'Both tested tenecteplase 4.5-24 hours in LVO patients with perfusion mismatch. TIMELESS (N=458) enrolled patients who mostly proceeded to EVT — tenecteplase added nothing when thrombectomy was available. TRACE-III (N=516) enrolled patients without EVT access — tenecteplase was beneficial. Together they define the boundary: late IVT helps when EVT is unavailable.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with ICA or MCA occlusion, salvageable tissue on perfusion imaging, and no access to endovascular thrombectomy, tenecteplase administered 4.5 to 24 hours after stroke onset achieved a higher rate of no disability at 90 days compared with standard medical treatment (33.0% vs 24.2%, relative rate 1.37, 95% CI 1.04-1.81, P=0.03, NNT 11). This is the late window (4.5-24h) and EVT-unavailable population.',
      doesNotProve: 'TRACE-III does not prove late-window tenecteplase is beneficial when EVT is available (see TIMELESS — neutral result in that population). It does not establish safety in patients outside the trial criteria (non-LVO, no perfusion mismatch). The China-only setting and absence of EVT access limit generalizability to systems where EVT is routinely available.',
      cautions: 'TRACE-III was conducted exclusively in China, where EVT access is limited. This is not a "bridging" IVT-before-EVT trial — it is specifically for settings without EVT access. sICH was higher with tenecteplase (3.0% vs 0.8%); this tradeoff is acceptable at the population level but should inform individual patient counseling. Perfusion imaging selection is required — do not apply to unselected patients.',
    },
    bedsidePearl: 'TRACE-III is the key trial for late-window IVT when EVT cannot be performed. In perfusion-selected LVO patients 4.5-24 hours from onset without EVT access, tenecteplase 0.25 mg/kg improved mRS 0-1 from 24.2% to 33.0% (NNT 11, P=0.03). This is not a reason to delay EVT when it is available — TIMELESS showed no benefit when EVT was performed.',
    bottomLineSummary: 'TRACE-III showed tenecteplase 0.25 mg/kg improved functional independence at 90 days versus standard medical treatment in perfusion-selected LVO patients treated 4.5-24 hours after stroke onset when EVT was unavailable (33.0% vs 24.2%, relative rate 1.37, P=0.03, NNT 11). sICH was higher (3.0% vs 0.8%). Results apply specifically to EVT-unavailable settings with LVO confirmed on imaging.',
  },
  'wake-up-trial': {
    id: 'wake-up-trial',
    title: 'WAKE-UP Trial',
    subtitle: 'MRI-Guided Thrombolysis for Stroke with Unknown Time of Onset',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      imagingSelection: 'MRI DWI-FLAIR mismatch required — not CT-based selection',
      populationExclusions: ['CT-only centres without MRI availability', 'Known-onset stroke'],
    },
    stats: {
      sampleSize: {
        value: '503',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.02',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '11.5%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multi-center randomized controlled trial',
        'Double-blind, placebo-controlled',
        '1:1 allocation (Alteplase vs. Placebo)'
      ],
      timeline: 'Enrolled Sep 2012 – Jun 2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 53.3,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Alteplase Group'
      },
      control: {
        percentage: 41.8,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Placebo Group'
      }
    },
    intervention: {
      treatment: '0.9 mg/kg IV (10% bolus, 90% over 60 min)',
      control: 'Placebo + Best Medical Treatment'
    },
    clinicalContext: 'WAKE-UP tested whether MRI DWI-FLAIR mismatch could identify patients with unknown-onset ischemic stroke who were still likely within a treatable thrombolysis window despite uncertain clock time.',
    calculations: {
      nnt: 8.7, // 1 / (0.533 - 0.418) = 8.70 ≈ 8.7
      nntExplanation: 'For every 8.7 patients with wake-up stroke and DWI-FLAIR mismatch treated with tPA, one additional patient achieves excellent outcome (mRS 0-1) compared to placebo'
    },
    pearls: [
      'First randomized evidence that MRI-selected unknown-onset stroke can benefit from alteplase',
      'Tissue Clock: DWI-FLAIR mismatch identifies patients likely within the prior 4.5 hours despite uncertain onset',
      'Functional Benefit: mRS 0-1 at 90 days improved from 41.8% to 53.3% (NNT 8.7)',
      'Important Exclusion: Patients with planned thrombectomy were excluded from WAKE-UP',
      'Safety: Symptomatic ICH was 2.0% vs 0.4%, and mortality was numerically higher at 4.1% vs 1.2%'
    ],
    conclusion: '',
    source: 'Thomalla et al. (NEJM 2018)',
    doi: '10.1056/NEJMoa1804355',
    clinicalTrialsId: 'NCT01525290',
    trialResult: 'POSITIVE',
    safetyProfile: {
      sICH: {
        /* claimId: wake-up.sich | source: Thomalla et al. NEJM 2018;379:617 Table 2 */
        evt: 2.0,
        control: 0.4,
        label: 'Symptomatic ICH at 7 days (ECASS III definition)',
        tooltip: 'Parenchymal hematoma type 2 with NIHSS worsening of 4 or more points within 7 days. 2.0% alteplase vs 0.4% placebo; P=0.15 (not statistically significant in this sample of 503 patients). Source: Thomalla et al., NEJM 2018, Table 2.',
        color: 'warning',
      },
      mortality: {
        /* claimId: wake-up.mortality | source: Thomalla et al. NEJM 2018;379:617 Table 2 */
        evt: 4.1,
        control: 1.2,
        label: 'Mortality at 90 days',
        tooltip: 'All-cause mortality at 90 days was 4.1% (alteplase) vs 1.2% (placebo). This numerical difference should be interpreted cautiously: the trial enrolled 503 of 800 planned patients and was not powered to detect mortality differences reliably. Source: Thomalla et al., NEJM 2018, Table 2.',
      },
    },
    inclusionCriteria: [
      'Age 18 to 80 years',
      'Acute ischemic stroke with wake-up presentation or unknown time of onset',
      'MRI showing positive DWI lesion with negative FLAIR in the same territory (tissue-based mismatch)',
      'NIHSS score 1 to 25',
      'Treatment able to start within 4.5 hours of first recognition of deficit',
      'No plan for mechanical thrombectomy',
    ],
    exclusionCriteria: [
      'FLAIR lesion clearly positive in the same territory as DWI (suggesting onset over 4.5 hours)',
      'DWI lesion exceeding one third of the MCA territory',
      'Standard contraindication to IV alteplase (active hemorrhage, recent surgery, anticoagulation)',
      'NIHSS below 1 or above 25',
      'Planned or already performed mechanical thrombectomy',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: '100 dots represent 100 patients in each group. A filled dot is a patient who reached excellent recovery at 90 days (mRS 0 or 1); an open dot is one who did not.',
      },
      {
        question: 'What should I look at first?',
        answer: 'Count the filled dots in each arm. The cobalt band spans the roughly 11 extra recoveries in the alteplase arm (53 vs 42 per 100). That is the absolute benefit driving the NNT of approximately 9.',
      },
      {
        question: 'What does this mean at the bedside?',
        answer: 'About 9 patients with DWI-FLAIR mismatch wake-up stroke would need alteplase for one additional person to achieve excellent recovery. Mortality was numerically higher in the alteplase arm (4.1% vs 1.2%), though this difference did not reach significance in this small sample.',
      },
    ],
    howToInterpret: {
      /* claimId: wake-up.interpret | source: Thomalla et al. NEJM 2018;379:611-622 */
      proves: 'In patients with acute ischemic stroke of unknown onset selected by DWI-FLAIR mismatch on MRI, IV alteplase improved the chance of excellent functional outcome (mRS 0-1) at 90 days, with an adjusted odds ratio of 1.61.',
      doesNotProve: 'It does not show that all wake-up strokes benefit, only those with DWI-FLAIR mismatch. It does not establish safety in patients with DWI lesions larger than one third of the MCA territory, and it does not confirm a mortality benefit.',
      cautions: 'The trial enrolled only 503 of 800 planned patients before funding lapsed; this was not a prespecified efficacy stopping rule. The wide confidence interval (1.09 to 2.36) reflects limited precision. Mortality was numerically higher in the alteplase arm (4.1% vs 1.2%) and symptomatic ICH was numerically higher (2.0% vs 0.4%); neither difference reached statistical significance, but the small sample limits interpretation of these safety signals.',
    },
    /* claimId: wake-up.bedside-pearl | source: Thomalla et al. NEJM 2018;379:617 Table 2 */
    bedsidePearl: 'WAKE-UP showed an NNT of roughly 9 for excellent recovery, better than EXTEND (NNT 17). The tradeoff is real: sICH was 2.0% vs 0.4% and mortality was numerically higher (4.1% vs 1.2%) in the alteplase arm, though neither reached significance in 503 patients. The DWI-FLAIR mismatch criterion is the gatekeeping rule; without it, you do not have WAKE-UP evidence.',
    bottomLineSummary: 'In wake-up stroke and unknown-onset ischemic stroke selected by DWI-FLAIR mismatch on MRI, IV alteplase improved excellent functional outcome at 90 days compared with placebo. The trial stopped early due to funding constraints rather than a prespecified stopping rule, so estimates are imprecise and the numerical excess in mortality warrants discussion during consent.',
    listCategory: 'thrombolysis',
    listDescription: 'MRI DWI-FLAIR mismatch for thrombolysis in unknown-onset stroke.',
  },
  // ========== BASILAR ARTERY TRIALS ==========
  'attention-trial': {
    id: 'attention-trial',
    title: 'ATTENTION Trial',
    subtitle: 'Basilar Artery EVT',
    category: 'Neuro Trials',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa2206317',
    pmid: '36239644',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    inclusionCriteria: [
      'Age ≥18 (≥80 with pre-stroke mRS 0 only)',
      'Acute basilar artery occlusion confirmed on CTA/MRA/DSA',
      'NIHSS ≥10 at randomization',
      'Within 12 hours of estimated onset',
      'PC-ASPECTS ≥6 (<80y) or ≥8 (≥80y); pre-stroke mRS ≤2',
    ],
    exclusionCriteria: [
      'Anterior circulation LVO (use HERMES-era evidence)',
      'Complete bilateral thalamic/brainstem infarction',
      'Spontaneous recanalization before randomization',
      'Excessive vascular tortuosity; bilateral mydriasis',
      'Advanced cancer, severe anemia, bleeding diathesis',
    ],
    safetyProfile: {
      sICH: {
        evt: 5,
        control: 0,
        label: 'Symptomatic ICH (SITS-MOST, 24–72h)',
        tooltip: '12/226 EVT vs 0/114 control. Periprocedural risk, but mortality reduction outweighs.',
        color: 'warning',
      },
      mortality: {
        evt: 37,
        control: 55,
        label: '90-day mortality',
        tooltip: '83/226 EVT vs 63/114 control (adjusted RR 0.66, 95% CI 0.52–0.82). One of the few stroke interventions shown to significantly reduce mortality.',
        color: 'success',
      },
    },
    bedsidePearl: 'In acute basilar artery occlusion with NIHSS ≥10, PC-ASPECTS ≥6, and pre-stroke mRS ≤2, EVT within 12 hours roughly halves mortality (37% vs 55%) and doubles the chance of mRS 0–3 at 90 days. mRS 0–3 (not 0–2) is used because BAO carries up to 80% untreated mortality.',
    bottomLineSummary: 'ATTENTION establishes EVT for basilar artery occlusion within 12 hours. mRS 0–3 at 90 days: 46% vs 23% (adjusted RR 2.06, 95% CI 1.46–2.91, P<0.001; NNT 4.3). 90-day mortality 37% vs 55%. Chinese cohort with ~44% intracranial atherosclerosis. AHA/ASA 2026 §4.7.3 COR 1.',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'Basilar artery occlusion only — results do not apply to anterior circulation LVO',
        'NIHSS ≥10 required; mRS 0–3 (not 0–2) was the primary outcome given the anticipated poor prognosis of basilar-artery occlusion — mRS 3 (ambulatory with assistance) is a patient-meaningful endpoint that anterior-circulation trials can afford to exclude but posterior-circulation cannot',
        '0–12h window; for 6–24h BAO see BAOCHE',
        'Stopped early for efficacy',
        'China-only enrollment — high prevalence of intracranial atherosclerosis (~44% LAA); generalizability to Western embolic-predominant populations limited',
      ],
    },
    stats: {
      sampleSize: {
        value: '340',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '23%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Conducted in China',
        '1:1 allocation (EVT vs. BMT)'
      ],
      timeline: 'Enrolled 2020-2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 46,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'EVT + BMT'
      },
      control: {
        percentage: 23,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'BMT Alone'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (EVT) (+/- tPA) + Best Medical Therapy',
      control: 'Best Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Basilar Artery Occlusion (BAO) carries high mortality (>80% without treatment). Early trials (BEST, BASICS) were inconclusive due to crossover and slow recruitment. ATTENTION (and BAOCHE) provided definitive evidence.',
    calculations: {
      nnt: 4.3, // 1 / (0.46 - 0.23) = 4.35 ≈ 4.3
      nntExplanation: 'For every 4.3 patients with basilar artery occlusion treated with thrombectomy within 12 hours, one additional patient achieves good functional status (mRS 0-3) compared to best medical therapy alone'
    },
    pearls: [
      'Why mRS 0–3 (not 0–2): BAO carries up to 80% mortality untreated. The paper explicitly uses mRS 0–3 as the patient-meaningful threshold "given the anticipated poor prognosis from basilar-artery occlusion" (consistent with BEST and BASICS)',
      'Mortality Reduction: One of the few stroke interventions shown to significantly reduce mortality (37% vs 55%, adjusted RR 0.66, 95% CI 0.52–0.82). Derived NNT ~5.6 is from a secondary outcome (mortality) — display with explicit secondary-outcome label',
      'Bridging: ~31% of EVT patients received IV thrombolysis (vs 34% in control; Chinese cohort, lower thrombolysis utilization than Western trials)',
      'Time Window: Within 12 hours of estimated onset',
      'Symptomatic ICH: 5% in EVT vs 0% in BMT — periprocedural risk, but mortality reduction outweighs',
      'Selection criteria: PC-ASPECTS ≥6 (<80y) or ≥8 (≥80y); pre-stroke mRS ≤2; bilateral thalamic/brainstem infarction excluded'
    ],
    conclusion: '',
    source: 'Tao et al. (NEJM 2022)',
    clinicalTrialsId: 'NCT04751708',
    listCategory: 'thrombectomy',
    listDescription: 'Basilar artery thrombectomy within 12 hours; China trial.',
  },
  'baoche-trial': {
    id: 'baoche-trial',
    title: 'BAOCHE Trial',
    subtitle: 'Basilar EVT 6-24 Hours',
    category: 'Neuro Trials',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    doi: '10.1056/NEJMoa2207576',
    pmid: '36239645',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    inclusionCriteria: [
      'Age 18–80',
      'Acute basilar artery or bilateral intracranial vertebral occlusion',
      '6–24 hours from last-known-well',
      'NIHSS ≥6 (post-amendment; initially ≥10)',
      'PC-ASPECTS ≥6, Pons-Midbrain Index ≤2, pre-stroke mRS 0–1',
    ],
    exclusionCriteria: [
      'Anterior circulation LVO',
      'Pre-stroke mRS ≥2',
      'PC-ASPECTS <6 or Pons-Midbrain Index >2',
      'Recent ICH or amyloid angiopathy',
      'Age >80',
    ],
    safetyProfile: {
      sICH: {
        evt: 6,
        control: 1,
        label: 'Symptomatic ICH (SITS-MOST, primary safety)',
        tooltip: '6/102 EVT vs 1/88 control (RR 5.18, 95% CI 0.64–42.18). Trending higher but not statistically significant.',
        color: 'warning',
      },
      mortality: {
        evt: 31,
        control: 42,
        label: '90-day mortality',
        tooltip: '34/110 EVT vs 45/107 control (adjusted RR 0.75, 95% CI 0.54–1.04). Direction favorable but NOT statistically significant — do not claim mortality benefit for BAOCHE alone.',
      },
    },
    bedsidePearl: 'For basilar artery occlusion 6–24 hours after last-known-well with NIHSS ≥6, PC-ASPECTS ≥6, and Pons-Midbrain Index ≤2, EVT is reasonable. Note: primary outcome was amended mid-trial (mRS 0–4 → mRS 0–3); the original mRS 0–4 result was NEGATIVE. Trial stopped early — effect size likely overestimated.',
    bottomLineSummary: 'BAOCHE extends basilar EVT to 6–24 hours after last-known-well. mRS 0–3 at 90 days: 46% vs 24% (adjusted RR 1.81, 95% CI 1.26–2.60, P<0.001; NNT 4.5). Primary outcome amended mid-trial from mRS 0–4 (negative) to mRS 0–3 (positive). Stopped early at interim. AHA/ASA 2026 §4.7.3 COR 1.',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'Basilar artery occlusion 6–24h only — for early-window (0–12h) BAO see ATTENTION',
        'Primary outcome was amended mid-trial (mRS 0–4 → mRS 0–3) on Feb 23, 2021 before unblinding; the original mRS 0–4 primary was NEGATIVE (RR 1.21, 95% CI 0.95–1.54). Display the revised positive mRS 0–3 result with this disclosure',
        'Stopped early for efficacy at planned interim (Apr 2022) — early-stopping truncation bias likely overestimates effect size',
        'Han Chinese population, predominantly atherothrombotic — limited generalizability to embolic-predominant Western populations',
        'NIHSS ≥6 (amended after 61 patients from initial ≥10); pre-stroke mRS 0–1; age 18–80; Pons-Midbrain Index ≤2',
      ],
    },
    stats: {
      sampleSize: {
        value: '217',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-3',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '22%',
        label: 'Absolute Increase'
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized open-label trial',
        'Conducted in China',
        'Late window (6-24 hours)',
        '1:1 allocation (Thrombectomy vs. Medical)',
        'Stopped early at interim for efficacy (Apr 2022) after 212/318 planned patients'
      ],
      timeline: 'Enrolled Aug 2016 – Jun 2021 (stopped early Apr 2022 for efficacy)'
    },
    efficacyResults: {
      treatment: {
        percentage: 46,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'Thrombectomy'
      },
      control: {
        percentage: 24,
        label: 'Good functional status (mRS 0-3) at 90 days',
        name: 'Best Medical Therapy'
      }
    },
    intervention: {
      treatment: 'Endovascular Thrombectomy (stent-retriever/aspiration) + Best Medical Therapy',
      control: 'Best Medical Therapy alone (IV thrombolysis if eligible + antiplatelet)'
    },
    clinicalContext: 'Following the success of extended window thrombectomy in the anterior circulation (DAWN/DEFUSE-3), BAOCHE examined the 6-24 hour window for Basilar Artery Occlusion.',
    calculations: {
      nnt: 4.5, // 1 / (0.46 - 0.24) = 4.55 ≈ 4.5
      nntExplanation: 'For every 4.5 patients with basilar artery occlusion treated with thrombectomy in the 6-24 hour window, one additional patient achieves good functional status (mRS 0-3) compared to medical therapy alone'
    },
    pearls: [
      'Late Window Basilar: Confirms that the basilar artery also has a "late window" benefit, likely due to collateral flow from the posterior communicating arteries',
      'High Efficacy: The effect size was remarkably similar to the early window ATTENTION trial (46% good outcome in both)',
      'Protocol amendment caveat: Primary outcome was changed from mRS 0–4 to mRS 0–3 mid-trial (Feb 2021, before unblinding). The original mRS 0–4 primary was NEGATIVE (RR 1.21, 95% CI 0.95–1.54) — display NNT with this disclosure',
      'Mortality: 31% in EVT vs 42% in Control (adjusted RR 0.75, 95% CI 0.54–1.04) — direction favorable but NOT statistically significant; do not claim mortality benefit for BAOCHE alone',
      'Imaging selection: PC-ASPECTS ≥6 (range 0–10) + Pons-Midbrain Index ≤2; perfusion mismatch not strictly required',
      'Recommendation: EVT is reasonable for BAO 6–24h in eligible patients (AHA/ASA 2026 §4.7.3 COR 1: BAO, NIHSS ≥10, pre-stroke mRS 0–1, PC-ASPECTS ≥6, within 24h)'
    ],
    conclusion: '',
    source: 'Jovin et al. (NEJM 2022)',
    clinicalTrialsId: 'NCT02737189',
    listCategory: 'thrombectomy',
    listDescription: 'Basilar EVT 6–24 hours with imaging selection.',
  },
  // ========== ANTIPLATELET & SECONDARY PREVENTION TRIALS ==========
  'chance-trial': {
    id: 'chance-trial',
    title: 'CHANCE Trial',
    subtitle: 'Clopidogrel with Aspirin in Acute Minor Stroke or Transient Ischemic Attack',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      populationExclusions: [
        'Minor ischemic stroke (NIHSS ≤3) or high-risk TIA (ABCD2 ≥4) within 24 hours only',
        '21-day DAPT then clopidogrel monotherapy to 90 days (not 90-day DAPT)',
        'Does not apply to cardioembolic source, severe stroke (NIHSS ≥4), or lacunar disease (see SPS3)',
      ],
    },
    stats: {
      sampleSize: {
        value: '5,170',
        label: 'Randomized Patients',
        info: 'Included patients with: (1) Minor ischemic stroke (NIHSS ≤3), OR (2) High-risk TIA (ABCD² ≥4). All enrolled within 24 hours of symptom onset. Demographics: median age 62 years, 33.8% female, 72% had minor stroke, 28% had TIA. Conducted at 114 centers in China.'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence',
        label: 'at 90 Days',
        info: 'Primary outcome was ANY stroke (ischemic or hemorrhagic) within 90 days of randomization. This endpoint captures the critical high-risk period after TIA/minor stroke, when most recurrent strokes occur (especially in the first 48-72 hours).'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.',
        info: 'p<0.001 means the benefit of dual antiplatelet therapy is EXTREMELY unlikely to be due to chance (less than 0.1% probability). This is one of the strongest levels of statistical significance in clinical trials.',
        highlight: true
      },
      effectSize: {
        value: '3.5%',
        label: 'Absolute Reduction',
        info: 'Absolute risk reduction: 11.7% (aspirin alone) - 8.2% (clopidogrel + aspirin) = 3.5%. This means that for every 100 patients treated with dual therapy instead of aspirin alone, 3.5 fewer strokes occur over 90 days. This translates to a Number Needed to Treat (NNT) of 29.',
        highlight: true
      },
      absoluteReduction: {
        value: '3.5%',
        label: 'Absolute Benefit',
        info: 'For every 100 patients treated with DAPT instead of aspirin alone, 3.5 fewer strokes occur over 90 days. Combined with the highly significant p-value (<0.001) and narrow confidence interval, this demonstrates both statistical significance AND clinical meaningfulness.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        'Conducted in China (114 centers)',
        '1:1 allocation (DAPT vs. Aspirin)',
        'Double-dummy design to maintain blinding'
      ],
      timeline: 'Enrolled 2009-2012',
      sampleSize: {
        value: '5,170 patients',
        info: 'Sample size calculation: 5,100 patients needed to detect 22% relative risk reduction with 90% power, two-sided alpha 0.05, assuming 14% event rate in aspirin group and 5% withdrawal rate. Final enrollment: 5,170 patients randomized at 114 centers. Excellent retention: only 0.7% lost to follow-up (36/5170 patients).'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence at 90 days',
        info: 'Any stroke (ischemic or hemorrhagic) within 90 days of randomization, assessed by blinded adjudication committee. Ischemic stroke defined as acute focal infarction with neurologic deficit lasting ≥24 hours or <24 hours with neuroimaging evidence of new infarction.'
      },
      pValue: {
        value: 'HR 0.68 (95% CI: 0.57-0.81), p<0.001',
        info: 'Hazard ratio 0.68 represents a 32% relative risk reduction in stroke recurrence with dual antiplatelet therapy compared to aspirin alone. The narrow confidence interval (0.57-0.81) indicates high precision of the estimate.'
      },
      nnt: {
        value: '29',
        info: 'Number Needed to Treat (NNT) = 29. Calculated from absolute risk reduction: 1 / (0.117 - 0.082) = 1 / 0.035 = 28.6 ≈ 29. This means treating 29 patients with DAPT instead of aspirin alone prevents one stroke over 90 days. For context: NNT <10 is very effective, NNT 10-30 is clinically worthwhile, NNT >100 is marginal. CHANCE\'s NNT of 29 is considered excellent for secondary prevention.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 8.2,
        label: 'Stroke recurrence (ischemic or hemorrhagic) at 90 days',
        name: 'DAPT (Clopidogrel + Aspirin)'
      },
      control: {
        percentage: 11.7,
        label: 'Stroke recurrence (ischemic or hemorrhagic) at 90 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'Clopidogrel (300mg load, then 75mg/d) + Aspirin (75mg/d) for 21 days, followed by Clopidogrel monotherapy',
        description: 'Day 1: Clopidogrel 300mg loading dose + aspirin 75-300mg (clinician-determined). Days 2-21: Clopidogrel 75mg daily + aspirin 75mg daily. Days 22-90: Clopidogrel 75mg daily alone.',
        details: [
          'Loading dose on Day 1: Clopidogrel 300mg + aspirin 75-300mg',
          'Dual therapy Days 2-21: Clopidogrel 75mg + aspirin 75mg daily',
          'Monotherapy Days 22-90: Clopidogrel 75mg daily alone',
          'Median time to treatment: 13 hours from symptom onset',
          '49.5% enrolled within 12 hours of symptom onset'
        ]
      },
      control: {
        name: 'Aspirin (75mg/d) for 90 days',
        description: 'Day 1: Aspirin 75-300mg + placebo clopidogrel. Days 2-90: Aspirin 75mg daily + placebo clopidogrel.',
        details: [
          'Day 1: Aspirin 75-300mg + placebo clopidogrel',
          'Days 2-90: Aspirin 75mg daily + placebo clopidogrel',
          'Double-dummy design to maintain blinding'
        ]
      }
    },
    clinicalContext: 'After TIA or minor stroke, 10-20% of patients have recurrent stroke within 3 months, with most occurring in the first 2 days. This "high-risk window" represents an opportunity for aggressive early prevention. Previous trials of long-term dual antiplatelet therapy (MATCH, CHARISMA, SPS3) showed no benefit and increased bleeding because they enrolled weeks/months after the event and did not target the acute high-risk period. CHANCE tested whether starting dual therapy within 24 hours and continuing for only 21 days (the highest-risk period) could prevent early recurrent strokes while minimizing bleeding risk. The mechanism: Aspirin and clopidogrel synergistically inhibit platelet aggregation through different mechanisms (COX-1 vs P2Y12 pathways). This dual inhibition is most beneficial when platelet activation is highest - immediately after an acute thrombotic event.',
    calculations: {
      nnt: 29, // 1 / (0.117 - 0.082) = 28.57 ≈ 29
      nntExplanation: 'For every 29 patients with minor stroke or high-risk TIA treated with DAPT for 21 days, one additional stroke recurrence is prevented compared to aspirin alone. The benefit was most pronounced in the first 7 days when stroke risk is highest, with Kaplan-Meier curves diverging dramatically in the first week then remaining parallel.'
    },
    pearls: [
      'Clopidogrel + aspirin reduced stroke by 32% (HR 0.68, p<0.001)',
      'Absolute risk reduction: 3.5% → NNT = 29 to prevent one stroke over 90 days',
      'Benefit most pronounced in first 7 days when stroke risk is highest',
      'No increase in severe hemorrhage (0.3% both groups)',
      'No increase in hemorrhagic stroke (0.3% both groups)',
      'Mild bleeding slightly increased (2.3% vs 1.6%, p=0.09 not significant)',
      'Treatment must start within 24 hours of symptom onset',
      'Treatment duration: 21 days of dual therapy, then clopidogrel alone to day 90',
      'Loading dose strategy: Clopidogrel 300mg + aspirin 75-300mg on Day 1',
      'Population: Minor stroke (NIHSS ≤3) or high-risk TIA (ABCD² ≥4) only',
      'Median NIHSS = 3, indicating mild deficits despite "minor" label',
      'Median time to treatment: 13 hours (range: 8-18 hours)',
      '49.5% enrolled within 12 hours',
      'Benefit consistent across all subgroups; no significant interactions',
      'Excellent retention: Only 0.7% lost to follow-up (36/5170 patients)',
      'Conducted entirely in China - generalizability initially questioned',
      'POINT trial (US) later confirmed results with tighter time window (<12h)',
      'Kaplan-Meier curves diverged dramatically in first week, then plateaued',
      'Changed international guidelines: AHA/ASA now recommends DAPT for 21 days (Class IIa)',
      'Combined with POINT, established DAPT as standard of care for minor stroke/high-risk TIA'
    ],
    conclusion: '',
    source: 'Wang Y, Wang Y, Zhao X, et al. Clopidogrel with aspirin in acute minor stroke or transient ischemic attack. N Engl J Med. 2013;369(1):11-19.',
    doi: '10.1056/NEJMoa1215340',
    pmid: '23803136',
    clinicalTrialsId: 'NCT00979589',
    keyMessage: 'Start clopidogrel + aspirin within 24 hours of minor stroke or high-risk TIA to prevent early recurrent stroke. Dual therapy for 21 days, then clopidogrel alone.',
    safetyData: 'No increase in severe hemorrhage. Moderate-to-severe hemorrhage (GUSTO criteria): 0.3% (7/2584) in DAPT group vs 0.3% (8/2586) in aspirin group, p=0.73. Hemorrhagic stroke: 0.3% in both groups, p=0.98. Any bleeding: 2.3% vs 1.6%, p=0.09 (not significant), driven by MILD bleeding (bruising, oozing) that did not require transfusion. The trial demonstrated that short-term (21 days) dual antiplatelet therapy in carefully selected patients (minor stroke/high-risk TIA, no contraindications) can provide substantial benefit WITHOUT increasing the risk of major hemorrhage.',
    educationalContext: 'CHANCE worked where MATCH, CHARISMA, and SPS3 failed by targeting the acute high-risk window. Those earlier trials enrolled patients weeks to months after the event and used long-term dual therapy — both decisions raised bleeding risk without capturing the period when recurrence risk peaks. Limiting dual therapy to 21 days starting within 24 hours hit the recurrence peak while keeping hemorrhage risk low.',
    clinicalApplication: 'ELIGIBLE PATIENTS: (1) Minor stroke (NIHSS ≤3) OR high-risk TIA (ABCD² ≥4), (2) Within 24 hours of symptom onset (ideally within 12 hours), (3) No contraindication to antiplatelet therapy, (4) No indication for anticoagulation (e.g., atrial fibrillation), (5) No recent major surgery or GI bleeding, (6) Independent at baseline (mRS ≤2). TREATMENT PROTOCOL: Day 1: Clopidogrel 300mg loading + aspirin 75-300mg; Days 2-21: Clopidogrel 75mg + aspirin 75mg daily; Days 22-90: Clopidogrel 75mg daily alone. EXPECTED BENEFIT: 32% relative risk reduction, 3.5% absolute reduction, NNT=29, no increase in severe bleeding. DO NOT USE IF: Atrial fibrillation, recent major surgery/GI bleeding (<3 months), severe stroke (NIHSS >3), low-risk TIA (ABCD² <4), known high bleeding risk, planned revascularization. PRACTICAL TIPS: Start ASAP after stroke/TIA onset, obtain brain imaging to exclude hemorrhage first, calculate ABCD² score for TIA patients, counsel about mild bleeding risk (bruising common but safe), transition to monotherapy at Day 22 (set reminder).',
    limitations: [
      'Conducted entirely in China - generalizability to other populations uncertain at time (later confirmed by POINT trial in US)',
      'Higher prevalence of intracranial atherosclerosis in Chinese population vs Western populations',
      'Genetic polymorphisms affecting clopidogrel metabolism (CYP2C19) more common in Asian populations',
      'Open-label aspirin on Day 1 (dose 75-300mg at clinician discretion)',
      'Excluded low-risk TIA patients (ABCD² <4) - results do not apply to this group',
      'Excluded patients with severe stroke (NIHSS ≥4) - results do not apply to moderate/severe strokes',
      'Excluded patients with clear indication for anticoagulation (e.g., atrial fibrillation)',
      'Short follow-up (90 days) - long-term outcomes unknown',
      'TIA diagnosis can be challenging - potential for enrollment of "TIA mimics" despite exclusion criteria'
    ],
    safetyProfile: {
      sICH: {
        /* claimId: chance.hemorrhage | source: Wang Y et al. NEJM 2013;369:17 Table 2 */
        evt: 0.3,
        control: 0.3,
        label: 'Moderate-to-severe hemorrhage at 90 days',
        tooltip: 'Moderate-to-severe hemorrhage (GUSTO criteria): 0.3% DAPT vs 0.3% aspirin (P=0.73). No significant increase in severe bleeding with short-term dual antiplatelet therapy. Hemorrhagic stroke was 0.3% in both groups (P=0.98). Source: Wang Y et al., NEJM 2013, Table 2.',
        color: 'success',
      },
    },
    inclusionCriteria: [
      'Age 40 years or older',
      'Minor ischemic stroke (NIHSS 0 to 3) or high-risk TIA (ABCD2 score 4 or higher)',
      'Randomization within 24 hours of symptom onset',
      'No clear indication for anticoagulation (no atrial fibrillation, no prosthetic valve)',
      'Independent at baseline',
    ],
    exclusionCriteria: [
      'Hemorrhagic stroke on baseline imaging',
      'Severe stroke (NIHSS 4 or higher)',
      'Low-risk TIA (ABCD2 below 4)',
      'Clear indication for anticoagulation (atrial fibrillation, valvular disease)',
      'Recent major surgery or GI bleeding within 3 months',
      'Contraindication to clopidogrel or aspirin',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: '100 dots represent 100 patients in each group. A filled dot is a patient who was stroke-free at 90 days; an open dot is one who had a recurrent stroke. The treatment arm (DAPT) has more stroke-free patients (92 vs 88 per 100).',
      },
      {
        question: 'What should I look at first?',
        answer: 'The cobalt band spans 4 extra stroke-free patients in the DAPT arm. That is the absolute benefit: 3.5 percentage points fewer strokes with dual therapy, driving an NNT of 29.',
      },
      {
        question: 'What does this mean at the bedside?',
        answer: '29 patients with TIA or minor stroke need dual antiplatelet therapy for 21 days to prevent one recurrent stroke. The benefit was concentrated in the first 7 days when stroke risk is highest. Major hemorrhage was identical at 0.3% in both groups.',
      },
    ],
    howToInterpret: {
      /* claimId: chance.interpret | source: Wang Y et al. NEJM 2013;369:11-19 */
      proves: 'In patients with minor ischemic stroke (NIHSS 0-3) or high-risk TIA (ABCD2 at least 4) enrolled within 24 hours, clopidogrel plus aspirin for 21 days reduced stroke recurrence at 90 days compared with aspirin alone, with a hazard ratio of 0.68 and an NNT of 29.',
      doesNotProve: 'It does not apply to moderate or severe stroke (NIHSS 4 or higher), low-risk TIA (ABCD2 below 4), or patients with atrial fibrillation. It does not show benefit for dual therapy extending beyond 21 days (the POINT trial showed increasing hemorrhage risk with longer duration).',
      cautions: 'The trial was conducted entirely in China, where higher rates of intracranial atherosclerosis and different CYP2C19 metabolizer frequencies may affect generalizability. The POINT trial confirmed the finding in a Western population but with a 600mg clopidogrel load and 90-day duration, where bleeding risk was significantly increased. The 21-day duration used in CHANCE represents the current guideline recommendation to capture benefit while limiting hemorrhage.',
    },
    /* claimId: chance.bedside-pearl | source: Wang Y et al. NEJM 2013;369:11-19 */
    bedsidePearl: 'CHANCE: start clopidogrel 300mg load + aspirin within 24 hours of minor stroke or high-risk TIA. Run dual therapy for 21 days, then switch to monotherapy. NNT=29, major hemorrhage 0.3% in both groups. Do not extend to 90 days without considering POINT bleeding data.',
    bottomLineSummary: 'CHANCE showed that clopidogrel plus aspirin started within 24 hours of minor stroke or high-risk TIA reduced 90-day stroke recurrence by 32% (NNT 29) without increasing major hemorrhage. The 21-day dual therapy duration is the guideline standard; AHA/ASA 2026 rates this strategy Class I.',
    listCategory: 'antiplatelets',
    listDescription: 'DAPT (clopidogrel + aspirin) after TIA/minor stroke; NNT=29. AHA 2026 COR 1.',
  },
  'point-trial': {
    id: 'point-trial',
    title: 'POINT Trial',
    subtitle: 'DAPT in International Population',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '4,881',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Ischemic events',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.02',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '1.5%',
        label: 'Absolute Reduction'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind international trial',
        '1:1 allocation (DAPT vs. Aspirin)'
      ],
      timeline: 'Enrolled 2010-2017'
    },
    efficacyResults: {
      treatment: {
        percentage: 5.0,
        label: 'Major ischemic events (stroke, MI, or ischemic vascular death) at 90 days',
        name: 'DAPT (Clopidogrel + Aspirin)'
      },
      control: {
        percentage: 6.5,
        label: 'Major ischemic events (stroke, MI, or ischemic vascular death) at 90 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: 'Clopidogrel (600mg load, then 75mg/d) + Aspirin (50-325mg/d) for 90 days',
      control: 'Aspirin alone'
    },
    clinicalContext: 'Following the CHANCE trial in China, the POINT trial sought to confirm the benefits of DAPT in an international (Western) population with slightly different loading protocols.',
    calculations: {
      nnt: 66.7, // 1 / (0.065 - 0.050) = 66.67 ≈ 66.7
      nntExplanation: 'For every 66.7 patients with minor stroke or high-risk TIA treated with DAPT for 90 days, one additional major ischemic event is prevented compared to aspirin alone'
    },
    pearls: [
      'Confirms CHANCE: Validated the efficacy of DAPT for minor stroke/TIA in a Western population',
      'Bleeding Risk: Unlike CHANCE, POINT showed a statistically significant increase in major hemorrhage (0.9% vs 0.4%, P=0.02)',
      'Time Course: Benefit was driven primarily by reduction in stroke during the first 7 to 21 days. The bleeding risk persisted throughout the 90 days',
      'Guideline Consensus: Combined with CHANCE, this led to guidelines recommending DAPT for 21 days only, rather than the 90 days tested in POINT, to balance efficacy vs safety',
      'Population: Minor ischemic stroke (NIHSS ≤ 3) or high-risk TIA (ABCD² ≥ 4) within 12 hours'
    ],
    conclusion: '',
    source: 'Johnston et al. (NEJM 2018)',
    doi: '10.1056/NEJMoa1800410',
    clinicalTrialsId: 'NCT00991029',
    trialResult: 'POSITIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    harmSignal: 'Benefit-harm crossover at ~21d: major hemorrhage 0.9% vs 0.4% (HR 2.32, p=0.02); informs current 21-day DAPT practice guideline',
    applicability: {
      populationExclusions: [
        'Minor ischemic stroke (NIHSS ≤3) or high-risk TIA (ABCD2 ≥4) within 12 hours only',
        '90-day DAPT duration tested — guideline caps at 21 days (CHANCE) due to this hemorrhage signal',
        'Does not apply to cardioembolic source, severe stroke (NIHSS ≥4), or atrial fibrillation',
      ],
    },
    safetyProfile: {
      sICH: {
        /* claimId: point.hemorrhage | source: Johnston SC et al. NEJM 2018;379:222 Table 2 */
        evt: 0.9,
        control: 0.4,
        label: 'Major hemorrhage at 90 days',
        tooltip: 'Major hemorrhage: 0.9% DAPT vs 0.4% aspirin (HR 2.32, 95% CI 1.10-4.87, P=0.02). Unlike CHANCE, POINT showed a statistically significant increase in major hemorrhage with 90-day dual therapy. This excess risk, concentrated after day 21, drove the guideline recommendation to limit DAPT to 21 days. Source: Johnston SC et al., NEJM 2018, Table 2.',
        color: 'warning',
      },
    },
    inclusionCriteria: [
      'Age 18 years or older',
      'Minor ischemic stroke (NIHSS 0 to 3) or high-risk TIA (ABCD2 score 4 or higher)',
      'Randomization within 12 hours of symptom onset',
      'No clear indication for anticoagulation',
      'Independent at baseline (mRS 0 to 2)',
    ],
    exclusionCriteria: [
      'Hemorrhagic stroke on baseline imaging',
      'Severe stroke (NIHSS 4 or higher)',
      'Low-risk TIA (ABCD2 below 4)',
      'Indication for anticoagulation (atrial fibrillation)',
      'Recent major surgery or GI bleeding',
      'Contraindication to clopidogrel or aspirin',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: '100 dots represent 100 patients in each group. A filled dot is a patient free of major ischemic events at 90 days; an open dot had a stroke, MI, or ischemic vascular death. The DAPT arm has 2 fewer events per 100 patients (95 vs 93.5 stroke-free).',
      },
      {
        question: 'What should I look at first?',
        answer: 'The cobalt band spans the 1.5 extra event-free patients in the DAPT arm. The absolute benefit is modest (NNT 67), but major hemorrhage was significantly higher in the DAPT arm (0.9% vs 0.4%).',
      },
      {
        question: 'What does this mean at the bedside?',
        answer: 'POINT confirms CHANCE in a Western population: DAPT reduces early stroke risk after TIA/minor stroke. But major hemorrhage rose significantly with 90-day dual therapy, concentrated after day 21. Guidelines therefore recommend 21-day DAPT (CHANCE protocol) rather than the 90-day protocol tested here.',
      },
    ],
    howToInterpret: {
      /* claimId: point.interpret | source: Johnston SC et al. NEJM 2018;379:215-225 */
      proves: 'In patients with minor ischemic stroke (NIHSS 0-3) or high-risk TIA (ABCD2 at least 4) enrolled within 12 hours, clopidogrel plus aspirin for 90 days reduced major ischemic events at 90 days vs aspirin alone (HR 0.75, NNT 67) in an international Western population, confirming CHANCE.',
      doesNotProve: 'It does not prove that 90-day DAPT is safe: major hemorrhage was significantly increased (HR 2.32, P=0.02). It does not compare different DAPT durations head-to-head. It does not apply to severe stroke (NIHSS 4 or higher) or patients with atrial fibrillation.',
      cautions: 'Major hemorrhage risk was significantly higher with 90-day dual therapy (0.9% vs 0.4%, P=0.02), driven primarily by events after day 21. The benefit-to-risk ratio favored DAPT overall at 90 days, but the temporal pattern led guidelines to recommend the shorter 21-day protocol from CHANCE. The loading dose in POINT was 600mg clopidogrel vs 300mg in CHANCE; this pharmacologic difference may contribute to the higher hemorrhage rate but has not been tested head-to-head.',
    },
    /* claimId: point.bedside-pearl | source: Johnston SC et al. NEJM 2018;379:222 Table 2 */
    bedsidePearl: 'POINT confirmed CHANCE in Western patients but showed major hemorrhage was significantly higher at 90 days (0.9% vs 0.4%, P=0.02). The hemorrhage excess emerged after day 21. Use the 21-day CHANCE protocol, not the 90-day POINT duration.',
    bottomLineSummary: 'POINT confirmed in an international population that clopidogrel plus aspirin reduces major ischemic events after TIA or minor stroke, but also showed significantly increased major hemorrhage with 90-day dual therapy. Together with CHANCE, it established that the optimal DAPT duration is 21 days rather than 90.',
    listCategory: 'antiplatelets',
    listDescription: 'Dual antiplatelet in TIA and minor stroke (Western population); confirms CHANCE but major hemorrhage higher at 90 days.',
  },
  'sammpris-trial': {
    id: 'sammpris-trial',
    title: 'SAMMPRIS Trial',
    subtitle: 'ICAD Stenting vs Medical',
    category: 'Neuro Trials',
    doi: '10.1056/NEJMoa1105335',
    pmid: '21899409',
    stats: {
      sampleSize: {
        value: '451',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Stroke/death',
        label: 'within 30 Days'
      },
      pValue: {
        value: '0.002',
        label: 'Stenting WORSE'
      },
      effectSize: {
        value: 'Harm',
        label: '14.7% vs 5.8%'
      }
    },
    trialDesign: {
      type: [
        'Randomized open-label trial',
        'Stopped early due to harm',
        '1:1 allocation (Stenting vs. Medical)'
      ],
      timeline: 'Enrolled 2008-2011 (stopped early)'
    },
    efficacyResults: {
      treatment: {
        percentage: 14.7,
        label: '30-day stroke/death rate',
        name: 'Stenting + AMM'
      },
      control: {
        percentage: 5.8,
        label: '30-day stroke/death rate',
        name: 'Aggressive Medical Management (AMM)'
      }
    },
    intervention: {
      treatment: 'Percutaneous Transluminal Angioplasty and Stenting (PTAS) with Gateway PTA balloon + Wingspan self-expanding stent (Stryker Neurovascular) + Aggressive Medical Management',
      control: 'Aggressive Medical Management alone (Aspirin 325mg/d + Clopidogrel 75mg/d for 90 days, Rosuvastatin to LDL <70 mg/dL, SBP <140 mmHg [<130 if diabetes], lifestyle program)'
    },
    clinicalContext: 'Intracranial Atherosclerotic Disease (ICAD) carries a high risk of recurrent stroke. SAMMPRIS investigated whether percutaneous transluminal angioplasty and stenting (PTAS) was superior to aggressive medical management alone in patients with symptomatic 70–99% intracranial stenosis within 30 days of qualifying TIA or stroke.',
    calculations: {
      // Negative trial - stenting carries periprocedural harm in this population
    },
    pearls: [
      'Periprocedural harm signal: Stenting in this population (symptomatic ICAS 70–99% within 30 days of TIA/stroke, off-label Wingspan use as initial therapy) carries a high periprocedural stroke risk. The trial was halted early by the DSMB for safety + futility',
      'Symptomatic ICH 4.5% vs 0% (P=0.04, Fisher exact) — the dominant procedural harm. Of 33 strokes in PTAS within 30 days, 25 occurred within 1 day of the procedure',
      'Aggressive Medical Management (AMM): The "Control" group did markedly better than historical WASID controls, establishing AMM (DAPT 90d + High-intensity Statin to LDL <70 + SBP <140) as a highly effective strategy',
      '1-Year Results: 20.0% (PTAS) vs 12.2% (Medical) cumulative stroke/death (P=0.009). Beyond 30 days, same-territory ischemic stroke was 13 in each arm — the entire between-arm difference is driven by periprocedural events',
      'Boundary conditions: SAMMPRIS does NOT establish that all intracranial stenting is harmful. Specific to Wingspan, symptomatic 70–99%, within 30 days of qualifying event. Does NOT apply to asymptomatic ICAS, hemodynamic-failure selection, or post-AMM-failure salvage (see WEAVE for on-label registry context)',
      'Standard of Care: AMM is first-line for symptomatic ICAD (AHA/ASA 2021 secondary-prevention COR 1). PTAS with Wingspan as initial treatment is COR 3 No Benefit/Harm, LOE B-R',
      'Erratum (NEJM 2012;367(1):93): Procedural-bookkeeping correction only (16 PTAS patients unstented vs prior 15; 5 angioplasty-alone vs prior 4). No change to any primary or safety statistic',
      'Population: Patients with 70-99% stenosis of a major intracranial artery (mean ~80%) and a recent (last 30 days) TIA or stroke; 62–65% were on antithrombotics at the time of the qualifying event (on-treatment failures)'
    ],
    conclusion: '',
    source: 'Chimowitz et al. (NEJM 2011;365(11):993–1003)',
    clinicalTrialsId: 'NCT00576693',
    listCategory: 'carotid',
    listDescription: 'Intracranial Wingspan stenting vs aggressive medical therapy for symptomatic 70–99% ICAS; medical management wins.',
    primaryDesign: 'binary-superiority',
    primaryResult: 'harm-stopped',
    harmSignal: '14.7% (PTAS) vs 5.8% (AMM) 30-day stroke/death; stopped at 451/764 planned (P=0.002); periprocedural stroke (25/33 within 24h of procedure) + sICH 4.5% vs 0% drove excess',
    applicability: {
      populationExclusions: [
        'ICAS 70–99% stenosis with recent TIA or stroke within 30 days only',
        'Wingspan stent + Gateway balloon specifically; results may not generalize to other stent systems (but VISSIT 2015 confirmed harm direction with balloon-expandable Vitesse)',
        'NOT for asymptomatic ICAD, hemodynamic-failure-selected populations, or salvage stenting after documented AMM failure',
        'Trial population excludes M2/distal occlusions, posterior circulation only, and pre-stroke severe disability',
        'PTAS in this initial-treatment role is AHA/ASA 2021 Class III No Benefit/Harm, LOE B-R; AMM is Class I',
      ],
    },
  },
  'weave-trial': {
    id: 'weave-trial',
    title: 'WEAVE Trial',
    subtitle: 'Wingspan Stent System Post-Market Surveillance',
    category: 'Neuro Trials',
    // ── Archetype G canary (W6.6.1) — BenchmarkThresholdChart ───────────────
    archetypeId: 'G',
    trialResult: 'SAFETY_MET',
    primaryDesign: 'single-arm-registry',
    primaryResult: 'safety-threshold-met',
    doi: '10.1161/STROKEAHA.118.023996',
    clinicalTrialsId: 'NCT02034058',
    source: 'Alexander et al. (Stroke 2019;50:889-894)',
    listCategory: 'carotid',
    listDescription: 'FDA-mandated post-market surveillance: on-label Wingspan stenting met the 4% periprocedural safety benchmark.',
    // ── Legacy required fields (not used by Archetype G rendering) ─────────
    stats: {
      sampleSize: {
        value: '152',
        label: 'Consecutive Patients'
      },
      primaryEndpoint: {
        value: 'Stroke or death',
        label: 'within 72 Hours'
      },
      pValue: {
        value: 'N/A',
        label: 'Single-Arm Study'
      },
      effectSize: {
        value: '2.6%',
        label: 'Safety Benchmark Met'
      }
    },
    trialDesign: {
      type: [
        'Prospective single-arm post-market surveillance',
        'FDA-mandated safety study (IDE S140022)',
        'On-label use only at experienced neurointerventional centers',
      ],
      timeline: 'Enrolled 2014 to 2017'
    },
    efficacyResults: {
      // Single-arm: "control" field holds SAMMPRIS stent arm for legacy compatibility only.
      // Archetype G rendering uses observedEventRate + benchmark, not these fields.
      treatment: {
        percentage: 2.6,
        label: 'Periprocedural stroke or death within 72 hours',
        name: 'Wingspan Stent (on-label)'
      },
      control: {
        percentage: 14.7,
        label: 'Historical reference (SAMMPRIS stenting arm)',
        name: 'SAMMPRIS Stent Arm'
      }
    },
    intervention: {
      treatment: 'Angioplasty and Stenting with Wingspan Stent System (strict on-label criteria, experienced operators)',
      control: 'No randomized control arm. FDA pre-specified safety benchmark: periprocedural event rate below 4%.'
    },
    clinicalContext: 'After SAMMPRIS demonstrated a 14.7% periprocedural stroke or death rate with off-label Wingspan use, the FDA mandated the WEAVE post-market surveillance study to test whether strict on-label use by experienced operators could achieve an acceptable safety profile. The pre-specified benchmark was a 72-hour stroke or death rate below 4%.',
    calculations: {},
    pearls: [
      'Patient selection: 2.6% event rate vs 14.7% in SAMMPRIS demonstrates that strict on-label criteria and operator experience are critical determinants of safety',
      'Role of stenting: WEAVE restored Wingspan as a viable salvage option for patients with refractory intracranial atherosclerotic disease who fail optimal medical therapy',
      'On-label criteria: symptomatic ICAD 70-99%, at least 2 strokes in territory despite medical therapy, age 22-80, mRS 3 or less, more than 8 days from last stroke',
      'Study design: single-arm benchmark study; does not establish superiority or non-inferiority to medical therapy',
    ],
    conclusion: '',
    // ── Archetype G specific fields ───────────────────────────────────────────
    benchmark: {
      rate: 4,
      label: 'FDA pre-specified benchmark',
      direction: 'below-is-good',
      scaleMax: 10,
    },
    observedEventRate: {
      rate: 2.6,
      ciLow: 0.7,
      ciHigh: 6.6,
      ciMethod: 'Clopper-Pearson exact',
      numEvents: 4,
      total: 152,
      description: 'Periprocedural stroke or death within 72 hours',
    },
    historicalContext: {
      rows: [
        {
          label: 'HDE Approval Study',
          year: 2007,
          n: 44,
          design: 'Single-arm, initial FDA approval data',
          rate: 4.5,
        },
        {
          label: 'NIH Wingspan Registry',
          year: 2008,
          n: 158,
          design: 'Registry, mixed on/off-label use',
          rate: 6.2,
        },
        {
          label: 'US Wingspan Registry',
          year: 2007,
          n: 129,
          design: 'Registry, mixed on/off-label use',
          rate: 6.2,
        },
        {
          label: 'SAMMPRIS stent arm',
          year: 2011,
          n: 224,
          design: 'Randomized vs medical therapy, off-label use',
          rate: 14.7,
        },
        {
          label: 'WEAVE Trial',
          year: 2019,
          n: 152,
          design: 'Single-arm, on-label only, experienced operators',
          rate: 2.6,
          isCurrentTrial: true,
        },
      ],
    },
    inclusionCriteria: [
      'Symptomatic intracranial atherosclerotic stenosis 70 to 99%',
      'At least 2 strokes or TIAs in the territory of the stenotic vessel despite optimal medical therapy',
      'Age 22 to 80 years',
      'Modified Rankin Score 3 or less at enrollment',
      'More than 8 days since most recent qualifying ischemic event',
      'Target vessel diameter 2.0 to 4.5 mm; lesion length 9 mm or less',
    ],
    exclusionCriteria: [
      'Off-label use of the Wingspan stent system',
      'Acute stroke or TIA within 8 days of enrollment',
      'Allergy to aspirin, clopidogrel, or contrast media',
      'Untreated coagulopathy or platelet count below 100,000',
      'Pregnancy or breastfeeding',
      'Concurrent participation in another investigational device trial',
    ],
    howToReadChart: [
      {
        question: 'What does the horizontal bar show?',
        answer: 'The green bar represents the observed 72-hour periprocedural stroke or death rate: 4 events in 152 patients (2.6%). The bar length is proportional to this rate on the 0 to 20% scale. A shorter bar closer to zero indicates fewer events.',
      },
      {
        question: 'What is the shaded CI band?',
        answer: 'The shaded region spans the 95% confidence interval from 0.7% to 6.6% (Clopper-Pearson exact method). With only 4 events, the CI is wide. The point estimate (2.6%) falls well below the benchmark, and the upper CI bound (6.6%) exceeds it, meaning the benchmark-met result has meaningful uncertainty at the boundary.',
      },
      {
        question: 'What does the dashed vertical line represent?',
        answer: 'The amber dashed line is the FDA pre-specified safety benchmark of 4%. The primary analysis was a one-sample test asking: does the observed event rate fall below this threshold? A result to the left of the dashed line means the benchmark was met. This is not a comparison to a concurrent control arm.',
      },
    ],
    howToInterpret: {
      proves: 'In 152 consecutive patients undergoing Wingspan stenting under strict on-label criteria at experienced centers, the 72-hour periprocedural stroke or death rate was 2.6% (4 events; 95% CI 0.7 to 6.6% by Clopper-Pearson exact method). This result met the FDA pre-specified safety benchmark of a rate below 4%. /* claimId: weave-primary-result | source: Alexander Stroke 2019 Table 1 */',
      doesNotProve: 'WEAVE does not demonstrate that Wingspan stenting is superior to or equivalent to optimal medical therapy for preventing recurrent stroke. The study has no randomized control arm and provides no efficacy data against medical management. Long-term outcomes beyond 72 hours were not the primary focus of this mandated safety study. The result does not generalize to lower-volume centers, off-label use, or broader patient populations.',
      cautions: 'All patients were enrolled at experienced neurointerventional centers; the result reflects operator expertise and strict case selection that may not be reproducible in general practice. The upper bound of the CI (6.6%) exceeds the 4% benchmark, meaning the result is statistically uncertain near the boundary. The minimum 8-day waiting period and requirement for demonstrated medical therapy failure narrow the eligible population substantially. The study cannot address whether stenting improves outcomes compared to continued medical management.',
    },
    bedsidePearl: 'WEAVE restored Wingspan stenting as a salvage option for highly selected patients who fail optimal medical therapy for intracranial atherosclerotic disease. The criteria are strict: 70 to 99% symptomatic stenosis, 2 or more strokes in territory despite optimal medications, mRS 3 or less, more than 8 days from last stroke, and experienced operator. The 2.6% periprocedural event rate met the FDA benchmark under these conditions. For most patients with intracranial atherosclerotic disease, optimal medical therapy (high-intensity statin plus dual antiplatelet therapy) remains first-line.',
    bottomLineSummary: 'In 152 consecutive patients with symptomatic intracranial atherosclerotic stenosis undergoing Wingspan stenting under strict on-label criteria at experienced centers, the 72-hour periprocedural stroke or death rate was 2.6% (4 events; 95% CI 0.7 to 6.6%), meeting the FDA pre-specified safety benchmark of below 4%. WEAVE does not assess efficacy versus medical therapy; it provides regulatory safety evidence for stenting in a highly selected, refractory population only.',
  },
  'socrates-trial': {
    id: 'socrates-trial',
    title: 'SOCRATES Trial',
    subtitle: 'Ticagrelor vs Aspirin',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '13,199',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Stroke/MI/death',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.07',
        label: 'Not Significant'
      },
      effectSize: {
        value: '0.8%',
        label: 'Trend (Not Significant)'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind trial',
        '1:1 allocation (Ticagrelor vs. Aspirin)'
      ],
      timeline: 'Enrolled 2014-2015'
    },
    efficacyResults: {
      treatment: {
        percentage: 6.7,
        label: 'Composite of stroke, MI, or death at 90 days',
        name: 'Ticagrelor'
      },
      control: {
        percentage: 7.5,
        label: 'Composite of stroke, MI, or death at 90 days',
        name: 'Aspirin'
      }
    },
    intervention: {
      treatment: 'Ticagrelor (180mg load, then 90mg BID)',
      control: 'Aspirin (300mg load, then 100mg daily)'
    },
    clinicalContext: 'Ticagrelor is a potent antiplatelet agent used in cardiology. SOCRATES aimed to see if Ticagrelor monotherapy was superior to Aspirin monotherapy for acute stroke/TIA.',
    calculations: {
      // Negative trial - not significant
    },
    pearls: [
      'Negative Trial: Ticagrelor was not superior to Aspirin in the broad population of minor stroke/TIA',
      'Subgroup Analysis: There was a suggestion of benefit in patients with ipsilateral stenosis, but this was exploratory',
      'THALES Trial: A subsequent trial (THALES) later showed that Ticagrelor + Aspirin (DAPT) was superior to Aspirin alone, but with increased bleeding, similar to the CHANCE/POINT results for Clopidogrel',
      'Current Use: Clopidogrel + Aspirin remains the preferred DAPT regimen unless there is Clopidogrel resistance (CYP2C19 status)',
      'Population: Acute mild-to-moderate ischemic stroke (NIHSS ≤ 5) or high-risk TIA'
    ],
    conclusion: '',
    source: 'Johnston et al. (NEJM 2016)',
    clinicalTrialsId: 'NCT01994720',
    listCategory: 'antiplatelets',
    listDescription: 'Ticagrelor vs aspirin monotherapy in acute ischemic stroke; not superior.',
    trialResult: 'NEGATIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'not-met',
    applicability: {
      populationExclusions: [
        'Acute non-cardioembolic ischemic stroke (NIHSS ≤5) or high-risk TIA (ABCD2 ≥4) within 24 hours',
        'Ticagrelor monotherapy vs aspirin monotherapy — does not address DAPT composition question',
        'Does not apply to patients with cardioembolic source or atrial fibrillation',
      ],
    },
    safetyProfile: {
      majorBleeding: {
        evt: 0.5,
        control: 0.6,
        label: 'Major bleeding at 90 days',
        tooltip: 'No significant difference in major bleeding between ticagrelor and aspirin (P=NS). /* claimId: socrates-safety-bleed | source: Johnston NEJM 2016 Table 2 */',
        color: 'success',
      },
    },
    inclusionCriteria: [
      'Age 40 years or older',
      'Acute non-cardioembolic ischemic stroke with NIHSS score 5 or less, or high-risk TIA (ABCD2 score 4 or higher)',
      'Able to randomize within 24 hours of symptom onset',
      'No definite indication for anticoagulation',
    ],
    exclusionCriteria: [
      'Cardioembolic source requiring anticoagulation',
      'Prior stroke with modified Rankin Score greater than 2',
      'Planned carotid revascularization within 90 days',
      'Concomitant antiplatelet therapy other than the study drug',
      'High bleeding risk or active bleeding',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Each arm shows the percentage of patients free from composite events (stroke, MI, or death) at 90 days. Ticagrelor 93.3% vs Aspirin 92.5%, a 0.8 percentage-point difference that did not reach significance.',
      },
      {
        question: 'Why is there no cobalt band?',
        answer: 'SOCRATES is a NEGATIVE trial (HR 0.89, 95% CI 0.78 to 1.01, P=0.07). The confidence interval crosses 1.0, meaning no statistically significant difference was demonstrated. /* claimId: socrates-primary-hr | source: Johnston NEJM 2016 Table 2 */',
      },
      {
        question: 'What does 0.8% absolute difference mean at the bedside?',
        answer: 'If the result had been significant it would imply NNT of roughly 125 -- a modest clinical effect even under the most optimistic reading. Given non-significance, no NNT should be applied clinically.',
      },
    ],
    howToInterpret: {
      proves: 'SOCRATES enrolled 13,199 patients and found a composite event rate of 6.7% with ticagrelor versus 7.5% with aspirin (HR 0.89, 95% CI 0.78 to 1.01, P=0.07). Ticagrelor monotherapy was not statistically superior to aspirin monotherapy for prevention of stroke, MI, or death at 90 days. /* claimId: socrates-primary-result | source: Johnston NEJM 2016 */',
      doesNotProve: 'It does not prove that ticagrelor monotherapy is equivalent to aspirin; the confidence interval is wide and includes a modest benefit. An exploratory subgroup suggested possible benefit in patients with ipsilateral atherosclerotic stenosis, but this finding requires prospective confirmation.',
      cautions: 'The trial tested monotherapy head-to-head, not dual antiplatelet therapy. Subsequent trials (THALES) tested ticagrelor plus aspirin versus aspirin alone and found superiority with increased bleeding. SOCRATES does not speak to the DAPT question. Generalizability to patients with CYP2C19 loss-of-function variants is untested in this dataset.',
    },
    bedsidePearl: 'SOCRATES showed ticagrelor monotherapy did not beat aspirin alone (P=0.07). The relevant question at the bedside is now DAPT composition: CHANCE/POINT established clopidogrel plus aspirin reduces early recurrence by roughly 30%; THALES showed ticagrelor plus aspirin works similarly but bleeds more. In patients with known or suspected CYP2C19 loss-of-function, ticagrelor-based DAPT may be considered, though direct head-to-head DAPT comparison data are limited.',
    bottomLineSummary: 'In acute non-cardioembolic minor ischemic stroke or high-risk TIA, ticagrelor monotherapy was not superior to aspirin monotherapy for the 90-day composite of stroke, MI, or death (HR 0.89, 95% CI 0.78 to 1.01, P=0.07). Major bleeding was similar between arms. The result supports aspirin as the appropriate monotherapy comparator and does not justify substituting ticagrelor for aspirin outside of a DAPT regimen.',
  },
  'sps3-trial': {
    id: 'sps3-trial',
    title: 'SPS3 Trial',
    subtitle: 'DAPT in Lacunar Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '3,020',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Recurrent stroke',
        label: 'per Year'
      },
      pValue: {
        value: '0.48',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'No Benefit',
        label: '2.5% vs 2.7%'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind multicenter trial',
        'Stopped early due to harm',
        '1:1 allocation (DAPT vs. Aspirin)'
      ],
      timeline: 'Enrolled 2003-2011 (stopped early)'
    },
    efficacyResults: {
      treatment: {
        percentage: 2.5,
        label: 'Recurrent stroke rate per year',
        name: 'DAPT (Aspirin + Clopidogrel)'
      },
      control: {
        percentage: 2.7,
        label: 'Recurrent stroke rate per year',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: 'Aspirin (325mg) + Clopidogrel (75mg)',
      control: 'Aspirin (325mg) + Placebo'
    },
    clinicalContext: 'Small subcortical strokes (lacunar infarcts) are common. SPS3 investigated two questions: BP targets (Standard vs Intensive) and Antiplatelets (DAPT vs Aspirin) for secondary prevention. This entry focuses on the Antiplatelet arm.',
    calculations: {
      // Negative/harmful trial - no NNT
    },
    pearls: [
      'Do NOT use DAPT for Lacunes: Unlike large vessel disease or acute minor stroke (CHANCE/POINT), long-term DAPT is harmful in established lacunar stroke patients',
      'Mortality Signal: The trial was stopped early due to lack of benefit and increased mortality/bleeding in the DAPT arm (HR 1.52, P=0.004)',
      'Major Bleeding: Nearly doubled in DAPT group (2.1% vs 1.1%)',
      'Mechanism: Lacunar disease is often a small vessel lipohyalinosis pathology, which may be less responsive to aggressive platelet inhibition compared to large artery atherosclerosis, but is prone to hemorrhage',
      'Population: MRI-confirmed symptomatic lacunar infarctions'
    ],
    conclusion: '',
    source: 'SPS3 Investigators (NEJM 2012)',
    clinicalTrialsId: 'NCT00059306',
    listCategory: 'antiplatelets',
    listDescription: 'DAPT not beneficial in lacunar stroke; increased bleeding without stroke reduction.',
    trialResult: 'NEGATIVE',
    primaryDesign: 'binary-superiority',
    // harm-stopped considered; not-met chosen: trial completed enrollment; mortality+bleeding excess were results, not a stopping reason; harm context carried by harmSignal
    primaryResult: 'not-met',
    harmSignal: 'Long-term DAPT (mean 3.4y): mortality HR 1.52 (95% CI 1.14–2.04, p=0.004), major hemorrhage HR 1.97 (95% CI 1.41–2.71, p<0.001)',
    applicability: {
      populationExclusions: [
        'MRI-confirmed symptomatic lacunar infarction only — does not apply to acute TIA or minor stroke',
        'Long-term DAPT (mean 3.4y) context — short-term DAPT (21 days, CHANCE/POINT) is a separate evidence base',
        'Aspirin monotherapy remains standard for long-term secondary prevention in lacunar disease',
      ],
    },
    safetyProfile: {
      mortality: {
        evt: 2.1,
        control: 1.4,
        label: 'All-cause mortality (DAPT arm higher, HR 1.52, P=0.004)',
        tooltip: 'Mortality was significantly higher in the DAPT arm. This finding triggered early stopping. /* claimId: sps3-mortality-harm | source: SPS3 Investigators NEJM 2012 Table 3 */',
        color: 'danger',
      },
      majorBleeding: {
        evt: 2.1,
        control: 1.1,
        label: 'Major bleeding (DAPT vs Aspirin)',
        tooltip: 'Major hemorrhage nearly doubled in the DAPT arm. /* claimId: sps3-bleeding-harm | source: SPS3 Investigators NEJM 2012 Table 3 */',
        color: 'danger',
      },
    },
    inclusionCriteria: [
      'MRI-confirmed symptomatic lacunar infarction within the prior 6 months',
      'No significant ipsilateral large-artery disease or cardioembolic source',
      'Modified Rankin Scale 3 or less at entry',
      'Able to tolerate aspirin and clopidogrel',
    ],
    exclusionCriteria: [
      'Cortical infarct or infarct larger than 1.5 cm on MRI (non-lacunar mechanism)',
      'Significant carotid or intracranial stenosis as likely cause',
      'Cardioembolic source requiring anticoagulation',
      'Prior intracranial hemorrhage or high bleeding risk',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Annual recurrent stroke rate: DAPT 2.5% vs aspirin 2.7% per year, a 0.2 percentage-point difference that was not significant (P=0.48). The chart uses annual event rates because the trial ran for a median of 3.4 years, not a fixed short window.',
      },
      {
        question: 'Why is this labeled NEGATIVE with a harm signal?',
        answer: 'SPS3 found no reduction in recurrent stroke with DAPT but did find significantly higher mortality (HR 1.52, P=0.004) and near-doubled major bleeding (2.1% vs 1.1%). The trial was stopped early by the DSMB because of this harm signal, not futility alone. /* claimId: sps3-stopped-harm | source: SPS3 Investigators NEJM 2012 */',
      },
      {
        question: 'How does this differ from CHANCE and POINT?',
        answer: 'CHANCE and POINT used DAPT for 21-90 days in the hyperacute period of TIA or minor stroke and found net benefit. SPS3 used long-term DAPT (mean 3.4 years) in patients with established lacunar stroke and found net harm. Duration and timing are the key variables.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with MRI-confirmed symptomatic lacunar infarction, long-term DAPT (aspirin plus clopidogrel) did not reduce recurrent stroke compared with aspirin alone (2.5% vs 2.7% per year, HR 0.92, 95% CI 0.72 to 1.16, P=0.48) and significantly increased mortality (HR 1.52, P=0.004) and major bleeding (2.1% vs 1.1%). /* claimId: sps3-primary-result | source: SPS3 Investigators NEJM 2012 */',
      doesNotProve: 'It does not prove that any antiplatelet is ineffective in lacunar stroke; aspirin monotherapy remains standard. It also does not generalize to short-duration DAPT (21 days or less) in acute presentations, which is the CHANCE/POINT evidence base.',
      cautions: 'The trial was stopped early (3,020 of planned 3,600 enrolled), which may reduce statistical precision for secondary endpoints. The dose of aspirin (325 mg) is higher than commonly used in Europe. The BP-lowering arm of SPS3 ran in parallel; interpretation of the antiplatelet arm is independent but conducted in the same population.',
    },
    bedsidePearl: 'SPS3 is a HARM signal trial: long-term DAPT in lacunar stroke increases mortality and bleeding with no stroke reduction. This is the opposite of CHANCE/POINT, which show short-term DAPT benefit in acute presentations. The practical rule: DAPT is for the first 21 days after TIA or minor stroke, not for chronic secondary prevention in lacunar disease. Aspirin monotherapy remains the long-term standard in this population.',
    bottomLineSummary: 'In patients with MRI-confirmed symptomatic lacunar infarction, long-term DAPT (aspirin 325 mg plus clopidogrel 75 mg) was stopped early because DAPT did not reduce recurrent stroke (HR 0.92, P=0.48) and significantly increased all-cause mortality (HR 1.52, P=0.004) and major bleeding. Aspirin monotherapy remains the standard of long-term secondary prevention in established lacunar stroke. Short-duration DAPT immediately following TIA or minor stroke is a separate evidence base and is not contraindicated by SPS3.',
  },
  'sparcl-trial': {
    id: 'sparcl-trial',
    title: 'SPARCL Trial',
    subtitle: 'Statins in Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '4,731',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Fatal or non-fatal stroke',
        label: 'Recurrence'
      },
      pValue: {
        value: '0.03',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: '1.9%',
        label: 'Absolute Reduction'
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        '1:1 allocation (Atorvastatin vs. Placebo)'
      ],
      timeline: 'Enrolled 2001-2005'
    },
    efficacyResults: {
      treatment: {
        percentage: 11.2,
        label: 'Fatal or non-fatal stroke recurrence',
        name: 'Atorvastatin 80mg'
      },
      control: {
        percentage: 13.1,
        label: 'Fatal or non-fatal stroke recurrence',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'Atorvastatin 80 mg daily',
      control: 'Placebo'
    },
    clinicalContext: 'Statins are known to reduce stroke risk in patients with coronary artery disease. The SPARCL trial investigated whether high-dose atorvastatin reduces the risk of recurrent stroke in patients with recent stroke or TIA without known coronary heart disease.',
    calculations: {
      nnt: 52.6, // 1 / (0.131 - 0.112) = 52.63 ≈ 52.6
      nntExplanation: 'For every 52.6 patients with recent stroke or TIA treated with high-intensity atorvastatin, one additional stroke recurrence is prevented compared to placebo'
    },
    pearls: [
      'Standard of Care: Established high-intensity statin (Atorvastatin 80mg) as the standard of care for secondary prevention of non-cardioembolic ischemic stroke',
      'Hemorrhage Risk: There was a small but statistically significant increase in hemorrhagic stroke in the Atorvastatin group (2.3% vs 1.4%), though the overall benefit for ischemic stroke reduction outweighed this risk',
      'LDL Reduction: The treatment group achieved a mean LDL of 73 mg/dL compared to 129 mg/dL in the placebo group',
      'Major Coronary Events: Significant reduction (HR 0.65)',
      'Population: Stroke or TIA within 1–6 months, LDL 100–190 mg/dL, and no known coronary heart disease'
    ],
    conclusion: '',
    source: 'Amarenco et al. (NEJM 2006)',
    clinicalTrialsId: 'NCT00147602',
    listCategory: 'antiplatelets',
    listDescription: 'High-intensity statin (atorvastatin 80mg) for secondary stroke prevention; NNT=53.',
    trialResult: 'POSITIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    harmSignal: 'Hemorrhagic stroke: 55 vs 33 events (atorvastatin vs placebo) despite 1.9% absolute overall stroke reduction',
    safetyProfile: {
      hemorrhagicStroke: {
        evt: 2.3,
        control: 1.4,
        label: 'Hemorrhagic stroke (atorvastatin vs placebo)',
        tooltip: 'Atorvastatin significantly increased hemorrhagic stroke risk (HR 1.66, P=0.02). The absolute excess was 0.9 percentage points over 4.9 years. This risk is highest in patients with prior hemorrhagic stroke -- atorvastatin is relatively contraindicated in that group. /* claimId: sparcl-hemorrhagic-stroke | source: Amarenco NEJM 2006 Table 3 */',
        color: 'warning',
      },
    },
    inclusionCriteria: [
      'Age 18 years or older',
      'Ischemic stroke or TIA within 1 to 6 months of randomization',
      'LDL cholesterol 100 to 190 mg/dL (2.6 to 4.9 mmol/L)',
      'No known coronary heart disease at entry',
    ],
    exclusionCriteria: [
      'Known coronary heart disease or prior coronary revascularization',
      'Prior statin use within 3 months (washout required)',
      'Cardioembolic stroke requiring anticoagulation as primary prevention',
      'Severe hepatic disease or creatine kinase elevation',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Cumulative 5-year recurrent stroke rates: atorvastatin 11.2% vs placebo 13.1%. The chart displays stroke-free survival, so more filled dots represent better outcomes in the atorvastatin arm. The absolute difference translates to an NNT of 53 over 4.9 years. /* claimId: sparcl-primary-result | source: Amarenco NEJM 2006 Table 2 */',
      },
      {
        question: 'Why is there a warning in the safety section despite a positive result?',
        answer: 'Hemorrhagic stroke was significantly higher with atorvastatin (2.3% vs 1.4%, HR 1.66, P=0.02). The overall ischemic benefit outweighed this risk in the trial population, but the hemorrhagic signal is clinically important, especially in patients with prior hemorrhagic stroke.',
      },
      {
        question: 'What is the NNT and how should it be framed?',
        answer: 'NNT is 53 over 4.9 years (1 stroke prevented per 53 patients treated). In absolute terms, one additional hemorrhagic stroke occurs per roughly 111 patients treated over the same period, yielding a net benefit ratio of approximately 2:1 for ischemic prevention versus hemorrhagic harm.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with recent non-cardioembolic stroke or TIA and LDL 100 to 190 mg/dL without known coronary heart disease, high-dose atorvastatin (80 mg daily) reduced fatal or non-fatal recurrent stroke over 4.9 years (11.2% vs 13.1%, HR 0.84, 95% CI 0.71 to 0.99, P=0.03) and significantly reduced major coronary events (HR 0.65). /* claimId: sparcl-primary-result | source: Amarenco NEJM 2006 */',
      doesNotProve: 'It does not prove that all statins at all doses are equivalent. The trial used atorvastatin 80 mg. Patients with known coronary heart disease were excluded, so SPARCL evidence is specific to the secondary stroke prevention population without established CAD.',
      cautions: 'Hemorrhagic stroke was significantly increased (HR 1.66, P=0.02). In patients with prior hemorrhagic stroke, this risk-benefit calculation shifts materially; most guideline bodies consider prior ICH a relative contraindication to high-intensity statin therapy. Liver enzyme elevations were more common in the atorvastatin group.',
    },
    bedsidePearl: 'SPARCL established atorvastatin 80 mg as a standard in secondary stroke prevention, but the hemorrhagic stroke signal (HR 1.66) is real and matters. The net benefit is favorable in ischemic stroke patients, but in a patient with prior hemorrhagic stroke, you are adding a drug that independently increases hemorrhagic stroke by 66% without clear ischemic benefit in that subgroup. In hemorrhagic stroke, statin use post-discharge is a shared decision, not a reflex.',
    bottomLineSummary: 'In patients with recent ischemic stroke or TIA and LDL 100 to 190 mg/dL without known coronary heart disease, atorvastatin 80 mg reduced recurrent stroke by 16% relative (NNT=53 over 4.9 years) but significantly increased hemorrhagic stroke risk (HR 1.66, 2.3% vs 1.4%). High-intensity statin therapy is now standard secondary prevention for ischemic stroke; caution is warranted in patients with prior hemorrhagic stroke.',
  },
  'elan-study': {
    id: 'elan-study',
    title: 'ELAN Trial',
    subtitle: 'Early versus Later Anticoagulation for Stroke with Atrial Fibrillation',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '2,013',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'Composite at 30d',
        label: 'Stroke/Embolism/Bleeding/Death'
      },
      pValue: {
        value: 'N/A',
        label: 'Estimation Design (Not Superiority)'
      },
      effectSize: {
        value: '-1.18%',
        label: 'Risk Difference (95% CI: -2.84 to 0.47)'
      }
    },
    trialDesign: {
      type: [
        'International, multicenter, open-label, assessor-blinded trial',
        '1:1 randomization to early vs later DOAC initiation',
        'Imaging-based stroke severity classification (minor/moderate/major)'
      ],
      timeline: 'Enrolled Nov 2017 – Sep 2022, 103 sites, 15 countries'
    },
    efficacyResults: {
      treatment: {
        percentage: 2.9,
        label: 'Primary composite outcome at 30 days',
        name: 'Early DOAC (within 48h minor/moderate, day 6-7 major)'
      },
      control: {
        percentage: 4.1,
        label: 'Primary composite outcome at 30 days',
        name: 'Later DOAC (day 3-4 minor, 6-7 moderate, 12-14 major)'
      }
    },
    additionalResults: {
      recurrentStroke: {
        early: 1.4,
        later: 2.5,
        label: 'Recurrent ischemic stroke at 30 days (most important component)'
      },
      symptomaticICH: {
        early: 0.2,
        later: 0.2,
        label: 'Symptomatic intracranial hemorrhage - EQUAL (safe)'
      }
    },
    intervention: {
      treatment: 'Early DOAC initiation: Within 48h for minor/moderate stroke, Day 6-7 for major stroke. Any approved DOAC at appropriate dose.',
      control: 'Later DOAC initiation (1-3-6-12 day rule): Day 3-4 for minor, Day 6-7 for moderate, Day 12-14 for major stroke'
    },
    clinicalContext: 'Approximately 14-27% of acute ischemic strokes occur with unknown onset time in patients with atrial fibrillation. The optimal timing of DOAC initiation after acute stroke has been debated - early initiation may increase hemorrhagic transformation risk, while delayed initiation may increase recurrent stroke risk. ELAN investigated whether early, imaging-guided DOAC initiation is safe compared to guideline-based later initiation using the widely-followed "1-3-6-12 day rule" based on stroke severity.',
    calculations: {
      // Estimation trial - NNT not applicable in traditional sense
      // Risk difference: -1.18% (95% CI: -2.84 to 0.47)
    },
    pearls: [
      'Estimation trial (not superiority): establishes safe range for practice',
      'Risk difference: -1.18% (95% CI: -2.84 to 0.47) - early treatment ranges from 2.8% better to 0.5% worse',
      'Recurrent ischemic stroke: 1.4% (early) vs 2.5% (later) - trend favoring early treatment',
      'Symptomatic ICH: 0.2% in both groups, bleeding risk not increased with early treatment',
      'Imaging-based classification (not NIHSS-based) used to determine timing',
      'Stroke severity: 37% minor, 40% moderate, 23% major',
      'Used any approved DOAC at appropriate dose (not drug-specific)',
      '98% probability that early treatment increases risk by no more than 0.5 percentage points',
      'Primary outcome at 90 days (exploratory): 3.7% (early) vs 5.6% (later)',
      'Most patients were from European centers - generalizability to other populations unclear'
    ],
    conclusion: '',
    source: 'Fischer U, et al. N Engl J Med. 2023;388(26):2411-2421',
    clinicalTrialsId: 'NCT03148457',
    specialDesign: 'estimation-trial',
    trialResult: 'NEUTRAL',
    keyMessage: 'Early DOAC initiation is safe — use if clinically indicated after imaging review',
    inclusionCriteria: [
      'Age 18 years or older',
      'Acute ischemic stroke with confirmed atrial fibrillation (permanent, persistent, or paroxysmal)',
      'Imaging-based stroke severity classification: minor (small infarct, NIHSS 0-5), moderate (NIHSS 6-15, non-cortical dominant or non-large infarct), or major (NIHSS 16 or higher, or large cortical/hemispheric infarct)',
      'Planned DOAC anticoagulation for secondary prevention',
      'Randomization within 48 hours for minor or moderate stroke; within 6 to 24 hours for major stroke',
    ],
    exclusionCriteria: [
      'Hemorrhagic transformation on baseline imaging (symptomatic)',
      'Very large infarct with high hemorrhagic transformation risk at the treating clinician\'s discretion',
      'Prior stroke within 3 months',
      'Contraindication to anticoagulation (active bleeding, severe thrombocytopenia)',
      'Mechanical prosthetic heart valve (requires warfarin)',
      'Severe renal impairment precluding DOAC use',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: '100 dots represent 100 patients in each group. A filled dot is a patient who had the primary composite event (recurrent ischemic stroke, symptomatic ICH, systemic embolism, major extracranial bleeding, or vascular death) within 30 days. This is a low-event-rate trial: only 3 dots (early) vs 4 dots (later) per 100 are filled.',
      },
      {
        question: 'Why is there no significance value and no cobalt band?',
        answer: 'ELAN was an estimation trial, not a superiority test. The goal was to establish whether the confidence interval around the risk difference was narrow enough to support safe early treatment. No p-value was the primary framing; the CI (-2.84 to +0.47 percentage points) was the result.',
      },
      {
        question: 'What does this mean at the bedside?',
        answer: 'Early DOAC initiation was not significantly worse than delayed, with the upper 95% confidence limit suggesting early treatment increases composite risk by at most 0.47 percentage points. Symptomatic ICH was 0.2% in both groups. The trial supports early initiation when clinically indicated, with individualized imaging review.',
      },
    ],
    howToInterpret: {
      /* claimId: elan.interpret | source: Fischer U et al. NEJM 2023;388:2411-2421 */
      proves: 'In patients with AF-related acute ischemic stroke, early DOAC initiation (within 48 hours for minor/moderate, within 6-24 hours for major stroke) was not significantly worse than delayed initiation, with a primary composite event rate of 2.9% vs 4.1% and a risk difference of -1.18 percentage points (95% CI -2.84 to +0.47).',
      doesNotProve: 'ELAN was not designed to show that early anticoagulation is superior to delayed. It does not establish the optimal DOAC or dose, and it does not apply to patients with prosthetic heart valves or those requiring warfarin. It does not prove that early initiation is safe in all large infarcts.',
      cautions: 'This is an estimation trial with an open-label design (blinded endpoint assessment). The 95% CI upper bound of +0.47 percentage points means early treatment could be slightly worse than delayed in some scenarios. The trial used imaging-based severity classification rather than NIHSS alone, which requires familiarity with the ELAN definitions. The primary composite included heterogeneous outcomes (ischemic stroke, ICH, systemic embolism, major extracranial bleeding, vascular death), making interpretation of individual component trends exploratory.',
    },
    /* claimId: elan.bedside-pearl | source: Fischer U et al. NEJM 2023;388:2411-2421 */
    bedsidePearl: 'ELAN showed sICH 0.2% in both groups, recurrent ischemic stroke 1.4% (early) vs 2.5% (later). The trial supports early DOAC in AF stroke when imaging allows it. The risk difference upper bound of +0.47pp means early treatment could be at most marginally worse than delayed, not substantially more dangerous.',
    bottomLineSummary: 'ELAN was an estimation trial showing that early DOAC initiation after AF-related ischemic stroke, timed by imaging-based severity classification, was not significantly more harmful than the traditional delayed approach. The primary composite event rate was 2.9% with early vs 4.1% with later initiation, with identical symptomatic ICH rates. The result supports early anticoagulation when clinically indicated and imaging permits.',
    listCategory: 'antiplatelets',
    listDescription: 'Early vs delayed DOAC in AF stroke: estimation trial supporting early initiation when imaging allows it.',
    archetypeId: 'A' as const,
    applicability: {
      populationExclusions: [
        'Estimation trial (not superiority) — primaryDesign/primaryResult intentionally left null per schema contract',
        'AF-related acute ischemic stroke only; imaging-based severity classification (not NIHSS-alone)',
        'Does not establish superiority of early over delayed DOAC; supports safe early initiation when imaging permits',
      ],
    },
    doi: '10.1056/NEJMoa2303048',
  },

  // ─── THALES TRIAL ─────────────────────────────────────────────────────────
  'thales-trial': {
    id: 'thales-trial',
    title: 'THALES Trial',
    subtitle: 'Ticagrelor + Aspirin vs Aspirin Alone After Minor Stroke or TIA',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    harmSignal: 'Severe bleeding 0.5% vs 0.1% (P<0.001); noncardioembolic stroke only',
    applicability: {
      populationExclusions: [
        'Noncardioembolic minor stroke (NIHSS ≤5) or high-risk TIA (ABCD2 ≥6) within 24 hours only',
        'AHA/ASA 2026 COR 3 (No Benefit) for general population — NNT=91, severe bleeding 5× higher vs clopidogrel DAPT (NNT=28)',
        'Reserve for confirmed CYP2C19 LOF carriers when clopidogrel pharmacologically inadequate (see CHANCE-2, COR 2b)',
      ],
    },
    stats: {
      sampleSize: {
        value: '11,016',
        label: 'Randomized Patients',
        info: 'Patients with acute noncardioembolic minor ischemic stroke (NIHSS ≤5) or high-risk TIA (ABCD2 ≥6) enrolled within 24 hours. 414 sites, 28 countries. Mean age 65 years, 37% female.'
      },
      primaryEndpoint: {
        value: 'Stroke/death',
        label: 'at 30 Days',
        info: 'Composite of stroke (ischemic or hemorrhagic) or death within 30 days of randomization.'
      },
      pValue: {
        value: '0.02',
        label: 'Stat. Significant',
        info: 'p=0.02 — statistically significant but AHA/ASA 2026 rates ticagrelor as COR 3: No Benefit over aspirin alone: NNT=91 and severe bleeding 5× higher outweigh benefit vs clopidogrel DAPT (CHANCE NNT=28).',
        highlight: false
      },
      effectSize: {
        value: '1.1%',
        label: 'Absolute Reduction',
        info: 'Absolute risk reduction: 6.6% (aspirin) − 5.5% (ticagrelor+aspirin) = 1.1%. NNT=91. Far less efficient than clopidogrel DAPT (CHANCE NNT=28). Severe bleeding 5× higher with ticagrelor.',
        highlight: false
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        'International — 414 sites, 28 countries',
        '1:1 allocation (ticagrelor + aspirin vs aspirin + placebo)',
        '30-day treatment duration'
      ],
      timeline: 'Enrolled 2018–2019; published NEJM 2020',
      sampleSize: {
        value: '11,016 patients',
        info: 'Largest DAPT trial for minor stroke/TIA. Global enrollment across 28 countries.'
      },
      primaryEndpoint: {
        value: 'Stroke or death at 30 days',
        info: 'Composite of any stroke or death within 30 days. Centrally adjudicated.'
      },
      pValue: {
        value: 'HR 0.83 (95% CI 0.71–0.96), p=0.02',
        info: '17% relative risk reduction — statistically significant but absolute benefit (1.1%) modest with disproportionate bleeding.'
      },
      nnt: {
        value: '91',
        info: 'NNT=91 at 30 days. Compare: CHANCE NNT=28 at 90 days. 91 patients need ticagrelor+aspirin to prevent one event, while each patient faces 5× higher severe bleeding risk.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 5.5,
        label: 'Stroke or death at 30 days',
        name: 'Ticagrelor + Aspirin'
      },
      control: {
        percentage: 6.6,
        label: 'Stroke or death at 30 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'Ticagrelor 180mg load → 90mg BID + Aspirin 300–325mg load → 75–100mg/d × 30 days',
        description: 'Ticagrelor plus aspirin for 30 days, initiated within 24 hours of symptom onset.',
        details: [
          'Ticagrelor 180mg loading dose on Day 1, then 90mg twice daily',
          'Aspirin 300–325mg loading dose Day 1, then 75–100mg daily',
          'Continued for 30 days total',
          'Mean time to treatment ~11 hours from symptom onset'
        ]
      },
      control: {
        name: 'Aspirin 300–325mg load → 75–100mg/d × 30 days + placebo ticagrelor',
        description: 'Aspirin monotherapy for 30 days. Double-dummy design.',
        details: [
          'Aspirin 300–325mg loading dose Day 1, then 75–100mg daily',
          'Placebo ticagrelor twice daily (double-dummy)'
        ]
      }
    },
    clinicalContext: 'THALES tested ticagrelor (a more potent P2Y12 inhibitor than clopidogrel) vs aspirin alone for minor stroke/TIA. It enrolled a broader population (NIHSS ≤5 vs ≤3 in CHANCE) using a 30-day protocol. While statistically significant, the 2026 AHA/ASA guidelines rate ticagrelor as COR 3: No Benefit for this indication. The NNT of 91 is far worse than clopidogrel DAPT (NNT 28–67) and severe bleeding was 5× higher. Ticagrelor-based DAPT is only appropriate for confirmed CYP2C19 loss-of-function carriers (see CHANCE-2, COR 2b).',
    calculations: {
      nnt: 91,
      nntExplanation: 'NNT=91 at 30 days — 91 patients must be treated to prevent one stroke/death, while each patient faces severe bleeding risk 5× higher than aspirin alone.'
    },
    pearls: [
      'AHA/ASA 2026: COR 3: No Benefit; ticagrelor NOT recommended over aspirin alone for minor stroke/TIA',
      'Statistically significant (p=0.02) but clinically inadequate: NNT=91, severe bleeding 5× higher',
      'Severe hemorrhage: 0.5% (ticagrelor+ASA) vs 0.1% (ASA alone), p<0.001',
      'Net clinical benefit unfavorable vs clopidogrel DAPT: CHANCE NNT=28 with comparable safety',
      'Broader eligibility (NIHSS ≤5, ABCD2 ≥6) vs CHANCE (NIHSS ≤3, ABCD2 ≥4)',
      'Ticagrelor dyspnea in ~12%, pharmacologic, not cardiac, but common discontinuation reason',
      'NOT equivalent to clopidogrel DAPT; do not substitute ticagrelor for clopidogrel routinely',
      'Exception: CYP2C19 poor metabolizers may benefit from ticagrelor DAPT (CHANCE-2, COR 2b)',
      'Benefit consistent across atherosclerotic and non-atherosclerotic causes',
      'Published: Johnston SC et al. N Engl J Med. 2020;383(3):207–217. DOI: 10.1056/NEJMoa1916870'
    ],
    conclusion: '',
    source: 'Johnston SC, et al. (NEJM 2020)',
    doi: '10.1056/NEJMoa1916870',
    pmid: '32668111',
    clinicalTrialsId: 'NCT03354429',
    keyMessage: 'AHA/ASA 2026 COR 3: No Benefit — ticagrelor NOT recommended over aspirin for minor stroke/TIA. Use clopidogrel-based DAPT (CHANCE protocol) instead.',
    limitations: [
      'Broader eligibility (NIHSS ≤5, ABCD2 ≥6) makes direct comparison with CHANCE/POINT difficult',
      '30-day endpoint vs 90-day in CHANCE — different time horizons complicate NNT comparison',
      'No head-to-head comparison with clopidogrel-based DAPT in the same trial',
      'Ticagrelor dyspnea (~12%) may have introduced differential dropout bias',
      '57% Asian patients — higher CYP2C19 LOF prevalence may have partially confounded results'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'Ticagrelor + aspirin vs aspirin alone; AHA 2026 COR 3: No Benefit. NNT=91, bleeding 5× higher.',
    safetyProfile: {
      severeHemorrhage: {
        evt: 0.5,
        control: 0.1,
        label: 'Severe hemorrhage at 30 days (ticagrelor+ASA vs ASA alone)',
        tooltip: 'Severe bleeding was 5x higher with ticagrelor plus aspirin versus aspirin alone (0.5% vs 0.1%, P<0.001). This disproportionate hemorrhagic risk relative to the 1.1% absolute efficacy gain is the basis for the AHA/ASA 2026 COR 3 downgrade. /* claimId: thales-severe-hemorrhage | source: Johnston NEJM 2020 Table 3 */',
        color: 'danger',
      },
    },
    inclusionCriteria: [
      'Age 40 years or older',
      'Acute non-cardioembolic ischemic stroke with NIHSS score 5 or less, or high-risk TIA (ABCD2 score 6 or higher)',
      'Randomization within 24 hours of symptom onset',
      'No indication for anticoagulation',
    ],
    exclusionCriteria: [
      'NIHSS score greater than 5 at baseline',
      'Planned carotid endarterectomy or stenting within 30 days',
      'Prior hemorrhagic stroke or significant bleeding risk',
      'Concurrent anticoagulation requirement',
      'Thrombolysis or thrombectomy for the index event',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'Event-free rates at 30 days: ticagrelor plus aspirin 94.5% vs aspirin alone 93.4%. The 1.1% absolute difference was statistically significant (HR 0.83, 95% CI 0.71 to 0.96, P=0.02, NNT=91). /* claimId: thales-primary-result | source: Johnston NEJM 2020 Table 2 */',
      },
      {
        question: 'If this trial is POSITIVE, why does the AHA 2026 give COR 3 (No Benefit)?',
        answer: 'COR 3 reflects net clinical benefit versus available alternatives, not just statistical significance. The NNT is 91 versus CHANCE NNT of 28 for clopidogrel-based DAPT, and severe bleeding is 5x higher (0.5% vs 0.1%). Guideline bodies concluded that ticagrelor DAPT is statistically significant but clinically inferior to clopidogrel DAPT in most patients.',
      },
      {
        question: 'When might ticagrelor DAPT still be chosen?',
        answer: 'In confirmed CYP2C19 loss-of-function carriers, clopidogrel is less effective and ticagrelor-based DAPT may be preferred (CHANCE-2 trial; AHA/ASA 2026 COR 2b for this specific subgroup). Genetic testing informs this decision.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with acute non-cardioembolic minor ischemic stroke or high-risk TIA enrolled within 24 hours, ticagrelor plus aspirin for 30 days reduced composite stroke or death compared with aspirin alone (5.5% vs 6.6%, HR 0.83, 95% CI 0.71 to 0.96, P=0.02, NNT=91). /* claimId: thales-primary-result | source: Johnston NEJM 2020 */',
      doesNotProve: 'It does not prove that ticagrelor DAPT is preferable to clopidogrel DAPT. No head-to-head comparison exists within THALES. The trial does not establish whether extending the treatment window from 21 to 30 days adds incremental benefit over clopidogrel-based protocols.',
      cautions: 'Severe hemorrhage was significantly higher with ticagrelor plus aspirin (0.5% vs 0.1%, P<0.001). The AHA/ASA 2026 downgraded this regimen to COR 3 (No Benefit over alternatives) for the general population. Ticagrelor-related dyspnea affected approximately 12% of the treatment arm and may have influenced discontinuation. Asian patients made up 57% of the trial, limiting generalizability in Western populations.',
    },
    bedsidePearl: 'THALES is statistically positive (P=0.02) but the guideline verdict is COR 3 (No Benefit) because the NNT of 91 and a 5x increase in severe bleeding make it clinically inferior to clopidogrel DAPT (CHANCE NNT=28, similar safety). In practice: use aspirin plus clopidogrel for 21 days in most patients with TIA or minor stroke. Reserve ticagrelor-based DAPT for confirmed CYP2C19 poor metabolizers (CHANCE-2, COR 2b), where clopidogrel is pharmacologically inadequate.',
    bottomLineSummary: 'Ticagrelor plus aspirin for 30 days statistically reduced composite stroke or death versus aspirin alone after minor stroke or TIA (HR 0.83, P=0.02, NNT=91), but severe hemorrhage was 5x higher (0.5% vs 0.1%). AHA/ASA 2026 guidelines rate ticagrelor DAPT COR 3: No Benefit for the general population given unfavorable risk-benefit versus clopidogrel-based DAPT. Clopidogrel plus aspirin remains the preferred DAPT regimen; ticagrelor is considered only in confirmed CYP2C19 poor metabolizers (COR 2b).',
  },

  // ─── INSPIRES TRIAL ───────────────────────────────────────────────────────
  'inspires-trial': {
    id: 'inspires-trial',
    title: 'INSPIRES Trial',
    subtitle: 'DAPT for Atherosclerotic Minor Stroke or TIA Within 72 Hours',
    category: 'Neuro Trials',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    inclusionCriteria: [
      'Age 35–80',
      'Acute mild ischemic stroke (NIHSS ≤5) OR high-risk TIA (ABCD² ≥4)',
      'Within 24–72 hours of symptom onset',
      'Presumed atherosclerotic mechanism: ≥50% stenosis of intracranial/extracranial artery OR multiple acute infarctions of presumed large-artery origin',
    ],
    exclusionCriteria: [
      'Received thrombolysis or endovascular therapy',
      'Presumed cardioembolic cause (AF, prosthetic valve)',
      'Other determined cause (dissection, vasculitis)',
      'Pre-existing disability (mRS ≥2)',
      'ICH history; planned surgery within 90 days',
      'Dual antiplatelet or intensive statin within prior 2 weeks',
    ],
    safetyProfile: {
      majorBleeding: {
        evt: 0.9,
        control: 0.4,
        label: 'Moderate-to-severe bleeding (GUSTO) at 90d',
        tooltip: 'HR 2.08 (95% CI 1.07–4.04, P=0.03). Bleeding risk approximately doubles with DAPT. NNH ~200 — favorable net clinical benefit vs efficacy NNT 53, but bleeding risk is real.',
        color: 'warning',
      },
      hemorrhagicStroke: {
        evt: 0.5,
        control: 0.2,
        label: 'Hemorrhagic stroke (secondary)',
        tooltip: 'HR 3.01 (95% CI 1.09–8.28). Uncommon but elevated. Exclude ICH history, uncontrolled hypertension, MRI microbleeds when feasible.',
        color: 'warning',
      },
    },
    bedsidePearl: 'For atherosclerotic minor stroke or high-risk TIA presenting 24–72 hours after onset, clopidogrel + aspirin × 21 days then clopidogrel alone through day 90 reduces recurrent stroke (NNT ≈ 53). Requires ≥50% stenosis on vascular imaging. Within 24h, CHANCE/POINT remain the primary evidence base.',
    bottomLineSummary: 'INSPIRES extends the DAPT initiation window to 72 hours for atherosclerotic minor stroke/TIA. New stroke at 90 days: 7.3% vs 9.2% (HR 0.79, 95% CI 0.66–0.94, P=0.008; NNT ≈ 53). Bleeding HR 2.08 (NNH ≈ 200). AHA/ASA 2026 §4.8 COR 2a.',
    harmSignal: 'Moderate-severe bleeding (GUSTO) 0.9% vs 0.4% (HR 2.08, 95% CI 1.07–4.04)',
    applicability: {
      populationExclusions: [
        'Atherosclerotic etiology only (≥50% intracranial or extracranial stenosis confirmed on vascular imaging)',
        'Minor stroke (NIHSS ≤5) or TIA (ABCD2 ≥4) within 72 hours — 21-day DAPT then clopidogrel monotherapy to 90 days',
        'Does NOT apply to non-atherosclerotic, cardioembolic, or lacunar etiology',
      ],
    },
    stats: {
      sampleSize: {
        value: '6,100',
        label: 'Randomized Patients',
        info: 'Patients with mild ischemic stroke (NIHSS ≤5) or high-risk TIA (ABCD2 ≥4) of presumed atherosclerotic cause (≥50% intracranial or extracranial stenosis) enrolled within 72 hours. 222 centers in China.'
      },
      primaryEndpoint: {
        value: 'New stroke',
        label: 'at 90 Days',
        info: 'Primary outcome: new stroke (ischemic or hemorrhagic) within 90 days. INSPIRES extends DAPT eligibility to 72 hours and targets atherosclerotic etiology specifically.'
      },
      pValue: {
        value: '0.008',
        label: 'Statistically Sig.',
        info: 'p=0.008 — highly significant. AHA/ASA 2026: COR 2a, LOE B-R for atherosclerotic etiology within 24–72 hours.',
        highlight: true
      },
      effectSize: {
        value: '1.9%',
        label: 'Absolute Reduction',
        info: 'Absolute risk reduction: 9.2% − 7.3% = 1.9%. NNT≈53. Benefit maintained even with 24–72h initiation in atherosclerotic stroke.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Multicenter randomized double-blind 2×2 factorial trial',
        '222 centers in China',
        '1:1 allocation (DAPT vs aspirin) in antiplatelet arm',
        'Second factor: intensive vs standard statin (independent)',
        'Treatment window: within 72 hours of symptom onset'
      ],
      timeline: 'Enrolled 2019–2023; published NEJM 2024',
      sampleSize: {
        value: '6,100 patients',
        info: '2×2 factorial simultaneously testing antiplatelet and statin intensification in atherosclerotic stroke. Powered for 20% relative risk reduction.'
      },
      primaryEndpoint: {
        value: 'New stroke at 90 days',
        info: 'Any stroke (ischemic or hemorrhagic) within 90 days. Centrally adjudicated.'
      },
      pValue: {
        value: 'HR 0.79 (95% CI 0.66–0.94), p=0.008',
        info: '21% relative risk reduction. Benefit consistent across 0–24h and 24–72h initiation subgroups.'
      },
      nnt: {
        value: '53',
        info: 'NNT≈53 (AHA/ASA 2026 cited). For every 53 atherosclerotic minor stroke/TIA patients treated with DAPT × 21 days, one stroke is prevented over 90 days.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 7.3,
        label: 'New stroke at 90 days',
        name: 'Clopidogrel + Aspirin (DAPT)'
      },
      control: {
        percentage: 9.2,
        label: 'New stroke at 90 days',
        name: 'Aspirin Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'Clopidogrel 300mg load → 75mg/d + Aspirin 100–300mg load → 100mg/d × 21 days, then clopidogrel',
        description: 'Clopidogrel + aspirin for 21 days, then clopidogrel monotherapy to 90 days. Initiated within 72 hours.',
        details: [
          'Clopidogrel 300mg loading dose at enrollment',
          'Aspirin 100–300mg loading dose at enrollment',
          'Days 2–21: Clopidogrel 75mg + Aspirin 100mg daily',
          'Days 22–90: Clopidogrel 75mg daily alone',
          'Can initiate up to 72 hours after onset (extends CHANCE 24h window)'
        ]
      },
      control: {
        name: 'Aspirin 100–300mg load → 100mg/d × 90 days + placebo clopidogrel',
        description: 'Aspirin monotherapy for 90 days with placebo clopidogrel.',
        details: [
          'Aspirin 100–300mg loading dose at enrollment',
          'Days 2–90: Aspirin 100mg daily',
          'Placebo clopidogrel throughout'
        ]
      }
    },
    clinicalContext: 'CHANCE/POINT established DAPT within 24 hours for minor stroke/TIA. INSPIRES addresses two clinically important extensions: (1) the 24–72 hour window for delayed presenters, and (2) atherosclerotic etiology (≥50% stenosis), a subtype particularly prone to early recurrence from in-situ thrombosis. AHA/ASA 2026 incorporated INSPIRES to support COR 2a: DAPT is reasonable for atherosclerotic minor stroke/TIA within 24–72 hours.',
    calculations: {
      nnt: 53,
      nntExplanation: 'NNT≈53 at 90 days. Benefit maintained even when DAPT started 24–72h post-onset in atherosclerotic etiology patients.'
    },
    pearls: [
      'AHA/ASA 2026: COR 2a; DAPT reasonable for atherosclerotic minor stroke/TIA within 24–72 hours',
      'Key eligibility: ≥50% intracranial OR extracranial stenosis on vascular imaging (must confirm etiology)',
      'Extends CHANCE/POINT paradigm: DAPT benefit persists even with 24–72h initiation',
      'NNT≈53 at 90 days, clinically meaningful even with delayed initiation',
      'Bleeding: moderate-to-severe 0.9% (DAPT) vs 0.4% (aspirin), small but statistically significant',
      'Same 21-day DAPT → monotherapy protocol as CHANCE; consistent guideline regimen',
      'NOT applicable to cardioembolic, lacunar (without stenosis), or non-atherosclerotic etiology',
      '2×2 factorial: statin intensification arm showed neutral effect (separate analysis)',
      'Critical use case: patient arriving 30–72h after onset with confirmed stenosis on CTA/MRA',
      'Published: Gao Y, et al. N Engl J Med. 2023;389(26):2413–2424. DOI: 10.1056/NEJMoa2309137'
    ],
    conclusion: '',
    source: 'Gao Y, et al. (NEJM 2023)',
    doi: '10.1056/NEJMoa2309137',
    pmid: '38157499',
    clinicalTrialsId: 'NCT03635749',
    keyMessage: 'Atherosclerotic minor stroke/TIA within 24–72h: clopidogrel+aspirin × 21 days is reasonable (COR 2a). Requires ≥50% stenosis confirmed on vascular imaging.',
    limitations: [
      'Conducted entirely in China — higher intracranial atherosclerosis prevalence may limit generalizability',
      'Requires vascular imaging to confirm ≥50% stenosis — not always available within 72h in all settings',
      '2×2 factorial design: antiplatelet and statin arms may interact',
      'Excludes non-atherosclerotic etiology — results do not generalize to all minor stroke/TIA patients'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'DAPT for atherosclerotic minor stroke/TIA within 72 hours. NNT=53. AHA 2026 COR 2a.',
  },

  // ─── CHANCE-2 TRIAL ───────────────────────────────────────────────────────
  'chance-2-trial': {
    id: 'chance-2-trial',
    title: 'CHANCE-2 Trial',
    subtitle: 'Ticagrelor vs Clopidogrel DAPT in CYP2C19 Loss-of-Function Carriers',
    category: 'Neuro Trials',
    archetypeId: 'A',
    trialResult: 'POSITIVE',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    inclusionCriteria: [
      'Age ≥40',
      'Acute nondisabling ischemic stroke (NIHSS ≤3) OR high-risk TIA (ABCD² ≥4)',
      'Within 24 hours of symptom onset',
      'Confirmed CYP2C19 *2 or *3 loss-of-function allele (point-of-care genotyping)',
    ],
    exclusionCriteria: [
      'IV thrombolysis or mechanical thrombectomy',
      'mRS 3–5 at baseline',
      'ICH or amyloid angiopathy history',
      'DAPT in prior 72h',
      'Anticoagulation indication (AF, prosthetic valve, endocarditis)',
      'Contraindication to ticagrelor, clopidogrel, or aspirin',
    ],
    safetyProfile: {
      majorBleeding: {
        evt: 0.3,
        control: 0.3,
        label: 'Severe/moderate bleeding (GUSTO) at 90d',
        tooltip: 'HR 0.82 (95% CI 0.34–1.98, P=0.66). No significant difference in major bleeding between ticagrelor and clopidogrel arms.',
      },
      adverseEvents: {
        evt: 16.8,
        control: 13.3,
        label: 'Any adverse event',
        tooltip: 'Dyspnea and arrhythmia more frequent with ticagrelor (class effect). Mild bleeding also increased (5.3% vs 2.5%) but severe bleeding unchanged.',
        color: 'warning',
      },
    },
    bedsidePearl: 'In confirmed CYP2C19 loss-of-function carriers with minor stroke (NIHSS ≤3) or high-risk TIA within 24h, ticagrelor + aspirin × 21 days then ticagrelor alone outperforms standard clopidogrel DAPT (NNT 63). If rapid genotyping is unavailable, use clopidogrel DAPT now — do NOT delay treatment for testing.',
    bottomLineSummary: 'CHANCE-2 tests genotype-guided DAPT in CYP2C19 LOF carriers (15-30% Europeans, 50-60% Asians). Stroke recurrence at 90 days: 6.0% (ticagrelor) vs 7.6% (clopidogrel), HR 0.77 (95% CI 0.64–0.94, P=0.008; NNT 63). Severe bleeding unchanged. AHA/ASA 2026 §4.8 COR 2b for confirmed LOF carriers.',
    applicability: {
      populationExclusions: [
        'Confirmed CYP2C19 *2 or *3 loss-of-function allele required — normal metabolizers excluded',
        'Minor stroke (NIHSS ≤3) or high-risk TIA (ABCD2 ≥4) within 24 hours only',
        '21-day DAPT then ticagrelor monotherapy to 90 days — do not delay treatment for genotyping if unavailable',
      ],
    },
    stats: {
      sampleSize: {
        value: '6,412',
        label: 'Randomized Patients',
        info: 'Patients with minor stroke (NIHSS ≤3) or high-risk TIA (ABCD2 ≥4) positive for CYP2C19 loss-of-function alleles (*2 or *3). Enrolled within 24 hours. 202 centers in China. Rapid point-of-care genotyping required at enrollment.'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence',
        label: 'at 90 Days',
        info: 'Primary outcome: new stroke (ischemic or hemorrhagic) within 90 days. CYP2C19 LOF carriers have reduced clopidogrel activation — CHANCE-2 tests whether ticagrelor overcomes this resistance.'
      },
      pValue: {
        value: '0.009',
        label: 'Statistically Sig.',
        info: 'p=0.009 for 90-day primary. AHA/ASA 2026: COR 2b — ticagrelor DAPT may be reasonable over clopidogrel DAPT for confirmed CYP2C19 LOF carriers within 24 hours.',
        highlight: true
      },
      effectSize: {
        value: '1.6%',
        label: 'Absolute Reduction',
        info: 'Stroke recurrence: 6.0% (ticagrelor) vs 7.6% (clopidogrel). NNT=63 (AHA/ASA 2026). 1-year benefit confirmed: HR 0.80, p=0.007.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Randomized double-blind placebo-controlled trial',
        '202 centers in China',
        '1:1 allocation (ticagrelor+aspirin vs clopidogrel+aspirin)',
        'CYP2C19 *2 or *3 LOF allele required for enrollment',
        'Rapid point-of-care bedside genotyping (30–60 min)'
      ],
      timeline: 'Enrolled 2019–2021; published NEJM 2021',
      sampleSize: {
        value: '6,412 CYP2C19 LOF carriers',
        info: 'First large stroke trial requiring mandatory pharmacogenomic eligibility. Only LOF carriers enrolled after rapid bedside CYP2C19 genotyping. Normal metabolizers excluded.'
      },
      primaryEndpoint: {
        value: 'Stroke recurrence at 90 days',
        info: 'Any stroke within 90 days. 1-year secondary endpoint also assessed.'
      },
      pValue: {
        value: 'HR 0.77 (95% CI 0.64–0.94), p=0.009; 1-year HR 0.80, p=0.007',
        info: '23% relative risk reduction at 90 days. Durable benefit confirmed at 1 year.'
      },
      nnt: {
        value: '63',
        info: 'NNT=63 (AHA/ASA 2026). For every 63 CYP2C19 LOF carriers treated with ticagrelor+aspirin instead of clopidogrel+aspirin, one additional stroke is prevented at 90 days.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 6.0,
        label: 'Stroke recurrence at 90 days',
        name: 'Ticagrelor + Aspirin'
      },
      control: {
        percentage: 7.6,
        label: 'Stroke recurrence at 90 days',
        name: 'Clopidogrel + Aspirin'
      }
    },
    intervention: {
      treatment: {
        name: 'Ticagrelor 180mg load → 90mg BID + Aspirin × 21 days, then ticagrelor 90mg BID alone',
        description: 'Ticagrelor-based DAPT for 21 days, then ticagrelor monotherapy to 90 days. Direct-acting — no CYP2C19 conversion needed.',
        details: [
          'Ticagrelor 180mg loading dose on Day 1',
          'Aspirin 75–300mg loading dose on Day 1',
          'Days 2–21: Ticagrelor 90mg BID + Aspirin 75mg daily',
          'Days 22–90: Ticagrelor 90mg BID alone',
          'Direct-acting P2Y12 inhibitor — bypasses CYP2C19 pathway entirely'
        ]
      },
      control: {
        name: 'Clopidogrel 300mg load → 75mg/d + Aspirin × 21 days, then clopidogrel 75mg/d alone',
        description: 'Standard clopidogrel DAPT. CYP2C19 LOF reduces active metabolite by ~25–30%, causing suboptimal platelet inhibition.',
        details: [
          'Clopidogrel 300mg loading dose on Day 1',
          'Aspirin 75–300mg loading dose on Day 1',
          'Days 2–21: Clopidogrel 75mg + Aspirin 75mg daily',
          'Days 22–90: Clopidogrel 75mg daily alone',
          'LOF carriers: ~25–30% reduced clopidogrel active metabolite'
        ]
      }
    },
    clinicalContext: 'Clopidogrel requires CYP2C19 enzymatic conversion to its active metabolite. CYP2C19 *2 (loss-of-function) allele is present in 15–30% of Europeans and 50–60% of East Asians. LOF carriers have significantly reduced clopidogrel efficacy and may have higher recurrence risk on clopidogrel DAPT. Ticagrelor is a direct-acting, reversible P2Y12 inhibitor that does not require CYP2C19 conversion, making it genotype-independent. CHANCE-2 is the first large trial of pharmacogenomically-guided antiplatelet therapy in stroke.',
    calculations: {
      nnt: 63,
      nntExplanation: 'NNT=63 at 90 days. For every 63 CYP2C19 LOF carriers treated with ticagrelor instead of clopidogrel DAPT, one additional stroke recurrence is prevented.'
    },
    pearls: [
      'AHA/ASA 2026: COR 2b; ticagrelor DAPT may be reasonable over clopidogrel DAPT in CYP2C19 LOF carriers',
      'CYP2C19 *2/*3 LOF alleles present in ~15–30% Europeans, ~50–60% East Asians',
      'Rapid point-of-care genotyping (30–60 min) available at many comprehensive stroke centers',
      'Ticagrelor direct-acting P2Y12 inhibitor; genotype-independent, no CYP2C19 conversion needed',
      'Severe/moderate bleeding: 0.28% (ticagrelor) vs 0.39% (clopidogrel), no significant difference',
      'Dyspnea: ~15% with ticagrelor vs ~5% clopidogrel, pharmacologic not cardiac, manageable',
      '1-year benefit confirmed: HR 0.80 (95% CI 0.68–0.95), p=0.007; durable effect',
      'Only CYP2C19 LOF carriers benefit; normal metabolizers should use standard clopidogrel DAPT',
      'If testing unavailable within 24h: use clopidogrel DAPT NOW; do NOT delay treatment for genotyping',
      'Published: Wang Y, et al. N Engl J Med. 2021;385(27):2520–2530. DOI: 10.1056/NEJMoa2111749'
    ],
    conclusion: '',
    source: 'Wang Y, et al. (NEJM 2021)',
    doi: '10.1056/NEJMoa2111749',
    pmid: '34708996',
    clinicalTrialsId: 'NCT04078737',
    keyMessage: 'CYP2C19 LOF confirmed: use ticagrelor+aspirin × 21 days (COR 2b). Testing unavailable: use clopidogrel DAPT now — do NOT delay.',
    limitations: [
      'Conducted entirely in China — CYP2C19 *2 more prevalent in Asian populations',
      'Rapid genotyping not universally available at all stroke centers',
      'COR 2b (weak) — regulatory and cost barriers with ticagrelor in many systems',
      'No direct comparison with aspirin alone — only vs clopidogrel DAPT',
      'Ticagrelor dyspnea (~15%) may reduce adherence in patients with pulmonary disease'
    ],
    listCategory: 'antiplatelets',
    listDescription: 'Ticagrelor vs clopidogrel DAPT in CYP2C19 loss-of-function carriers. NNT=63. AHA 2026 COR 2b.',
  },

  // ─── ENRICH TRIAL ─────────────────────────────────────────────────────────
  'enrich-trial': {
    id: 'enrich-trial',
    title: 'ENRICH Trial',
    subtitle: 'Minimally Invasive Surgical Evacuation of Intracerebral Hemorrhage',
    category: 'Neuro Trials',
    trialResult: 'POSITIVE',
    primaryDesign: 'bayesian-superiority',
    primaryResult: 'met',
    stats: {
      sampleSize: {
        value: '300',
        label: 'Randomized Patients',
        info: 'Patients with lobar or anterior basal ganglia ICH (30–80 mL) within 24 hours. 37 US hospitals. Bayesian response-adaptive randomized design. Final allocation: 150 surgery / 150 medical. Median age 64 (surgery) / 62 (control); female 48% (surgery) / 52% (control).'
      },
      primaryEndpoint: {
        value: 'UW-mRS',
        label: 'at 180 Days',
        info: 'Utility-weighted mRS (UW-mRS) at 180 days. Weights mRS by quality-of-life utility: mRS 0=1.0, 1=0.91, 2=0.76, 3=0.65, 4=0.33, 5–6=0.0. Captures functional outcome AND mortality in one continuous score.'
      },
      pValue: {
        value: 'P(sup)=0.981',
        label: 'Bayesian posterior',
        info: 'Bayesian posterior probability of superiority = 0.981 (prespecified threshold 0.975). No frequentist p-value reported in the primary analysis. FIRST randomized trial of supratentorial ICH evacuation to meet its prespecified primary endpoint — STICH I (2005), STICH II (2013), MISTIE III (2019) all neutral on functional outcome.',
        highlight: true
      },
      effectSize: {
        value: '0.458 vs 0.374',
        label: 'UW-mRS (surgery vs medical)',
        info: 'UW-mRS between-group difference +0.084 (95% Bayesian credible interval 0.005 to 0.163). 30-day mortality 9.3% (surgery) vs 18.0% (medical), ARD −8.7 pp (95% CrI −16.4 to −1.0), posterior P=0.987.',
        highlight: true
      }
    },
    trialDesign: {
      type: [
        'Multicenter Bayesian response-adaptive randomized trial',
        '37 US hospitals (Dec 2016 – Aug 2022)',
        'MIPS — trans-sulcal parafascicular approach',
        'BrainPath® + Myriad® (NICO Corporation — industry-funded)',
        'Surgery within 24 hours of last known well',
        'Anterior basal ganglia subgroup halted for futility at interim 2'
      ],
      timeline: 'Enrolled Dec 1, 2016 – Aug 24, 2022; published NEJM April 2024',
      sampleSize: {
        value: '300 patients (adaptive design)',
        info: 'Bayesian adaptive design: allocation ratio adjusted by interim results. Final: 150 surgery, 150 medical. Adaptive design maintains validity with smaller n than traditional RCTs.'
      },
      primaryEndpoint: {
        value: 'UW-mRS at 180 days',
        info: 'Quality-adjusted functional survival at 180 days using utility weights from the general population.'
      },
      pValue: {
        value: 'UW-mRS difference +0.084 (95% Bayesian CrI 0.005–0.163); posterior P(superiority)=0.981',
        info: 'Bayesian posterior probability of superiority exceeded the prespecified threshold of 0.975. No frequentist p-value reported.'
      },
      nnt: {
        value: '~12 (safety endpoint only)',
        info: 'Derived from 30-day mortality 18.0% vs 9.3% (ARD 8.7 pp). NNT not formally valid for Bayesian designs and is here from the PRIMARY SAFETY endpoint, not the primary efficacy endpoint. Per clinical-trial-audit skill: display only with explicit "safety-endpoint approximate" label.'
      }
    },
    efficacyResults: {
      treatment: {
        percentage: 45.8,
        label: 'Mean UW-mRS ×100 at 180 days',
        name: 'Minimally Invasive Surgery (MIPS)'
      },
      control: {
        percentage: 37.4,
        label: 'Mean UW-mRS ×100 at 180 days',
        name: 'Medical Management Alone'
      }
    },
    intervention: {
      treatment: {
        name: 'MIPS: BrainPath® + Myriad® within 24 hours of last known well',
        description: 'Trans-sulcal parafascicular approach: tubular retractor placed through sulcal corridor to reach hematoma without traversing cortex. Myriad aspirator removes clot.',
        details: [
          'BrainPath® tubular retractor (28 or 33 mm) via sulcal corridor',
          'Myriad® rotary morcellator-aspirator for hematoma evacuation',
          'Goal: ≥80% hematoma evacuation',
          'Surgery within 24 hours of last known well',
          'Plus standard medical management (same as control)'
        ]
      },
      control: {
        name: 'Guideline-based medical management alone (no surgery)',
        description: 'Standard ICH management: BP control, coagulopathy reversal, supportive care.',
        details: [
          'Target SBP 130–150 mmHg per AHA/ASA ICH guidelines',
          'Reversal of anticoagulation if applicable',
          'Seizure management as indicated',
          'DVT prophylaxis',
          'No hematoma evacuation'
        ]
      }
    },
    clinicalContext: 'ICH carries ~30–40% 30-day mortality and only ~20% functional independence at 1 year. Prior surgical trials consistently failed: STICH I (2005), STICH II (2013), and MISTIE III (2019) all showed no benefit, largely due to open craniotomy trauma and non-selective patient selection. ENRICH tested MIPS, which avoids crossing brain parenchyma via natural sulcal corridors, in a tightly selected population: lobar or anterior basal ganglia ICH (30–80 mL) only, avoiding the deep and posterior fossa regions where surgical risk is highest.',
    calculations: {
      nnt: 12,
      nntExplanation: 'NNT≈12 is approximate, derived from the primary SAFETY endpoint (30-day mortality 18.0% vs 9.3%, ARD 8.7 pp). Per clinical-trial-audit, NNT is not formally valid for Bayesian designs nor for safety endpoints used as efficacy framing. Displayed for audience reference only with this disclaimer.'
    },
    pearls: [
      'First randomized trial of supratentorial ICH evacuation to meet its prespecified primary endpoint — STICH I (2005), STICH II (2013), and MISTIE III (2019) were all neutral on functional outcome. Avoid "halves mortality" overclaim',
      '30-day mortality: 9.3% (surgery) vs 18.0% (medical); ARD −8.7 pp (95% Bayesian CrI −16.4 to −1.0), posterior P=0.987. Per audit skill, NNT 12 derived here is approximate and from a safety endpoint',
      'Primary benefit was in LOBAR ICH (+0.127 UW-mRS, 95% CrI 0.035–0.219); anterior basal ganglia subgroup was halted for futility at interim 2 (point estimate −0.013, CrI crossing zero) — no benefit demonstrated in that location',
      'UW-mRS at 180d: 0.458 (surgery) vs 0.374 (medical), between-group +0.084 (95% CrI 0.005–0.163), posterior P(superiority)=0.981',
      'MIPS trans-sulcal parafascicular approach avoids cortical transgression; key advantage vs open craniotomy',
      'Requires BrainPath® + Myriad® devices (NICO Corporation — industry funder); 59 trained neurosurgeons across 37 US centers; needs manufacturer training. Generalizability outside trained centers is unestablished',
      'Eligibility: LOBAR or ANTERIOR BASAL GANGLIA ICH only, volume 30–80 mL, within 24 hours',
      'NOT applicable to: deep (thalamic/putaminal) ICH, posterior fossa ICH, brainstem ICH',
      'NOT applicable to: volume <30 mL (less severe) or >80 mL (typically non-survivable)',
      'Bayesian adaptive design — superiority established by posterior probability, not a frequentist p-value. No frequentist p was reported in the primary analysis',
      'Per AHA/ASA 2022 ICH Guideline: minimally invasive surgery may be considered (Class IIb) — ENRICH is the first positive RCT; guideline may update with future focused review',
      'Published: Pradilla G, Ratcliff JJ, Hall AJ, et al. N Engl J Med. 2024;390(14):1277–1289. DOI: 10.1056/NEJMoa2308440'
    ],
    conclusion: '',
    source: 'Pradilla G, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2308440',
    pmid: '38598795',
    clinicalTrialsId: 'NCT02880878',
    keyMessage: 'Lobar (or selected anterior basal ganglia) ICH 30–80 mL within 24h: MIPS reduces 30-day mortality (9.3% vs 18.0%) and improves 180-day UW-mRS (Bayesian P>0.98). Requires BrainPath+Myriad and trained neurosurgical team. Anterior basal ganglia subgroup was halted for futility — benefit is in lobar ICH.',
    limitations: [
      'Small n=300 (adaptive) — subgroup analyses underpowered',
      'Anterior basal ganglia subgroup halted for futility at interim 2 — no benefit in that location; benefit concentrated in LOBAR ICH',
      'BrainPath + Myriad system required — specialty equipment not universally available; 59 trained neurosurgeons across 37 US centers',
      'Industry-funded by NICO Corporation (device manufacturer)',
      'US-only trial — generalizability to other healthcare systems uncertain',
      'Open-label — mitigated by central blinded mRS adjudication via redacted audio recordings of structured interviews',
      'Adaptive randomization ratio changed over time — potential allocation bias',
      'Does not address deep ICH (thalamus/putamen), posterior fossa, or volumes outside 30–80 mL',
      'Longer-term outcomes (>180 days) not reported',
      'UW-mRS endpoint not specifically validated for ICH (population utility weights)'
    ],
    listCategory: 'acute',
    listDescription: 'First positive randomized minimally-invasive surgical ICH trial; 30-day mortality 9.3% vs 18.0% (Bayesian P>0.98). NEJM 2024.',
  },
  'b-proud-trial': {
    id: 'b-proud-trial',
    title: 'B_PROUD Trial',
    subtitle: 'Mobile Stroke Unit Dispatch vs Conventional Ambulance in Berlin',
    category: 'Neuro Trials',
    doi: '10.1001/jama.2020.26345',
    pmid: '33528537',
    clinicalTrialsId: 'NCT03027453',
    primaryDesign: 'estimation-strategy',
    designDisclaimer: {
      category: 'quasi-experimental',
      text: 'Allocation was by mobile-stroke-unit availability, not patient-level randomization. Outcome adjudication was blinded but patients and clinicians were not. Treatment effect may include unmeasured site-level confounding.',
      source: 'Ebinger 2021 Methods + Limitations (JAMA 2021;325(5):454–466)'
    },
    stats: {
      sampleSize: {
        value: '1543',
        label: 'Included Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 0.71',
        label: 'Common OR for Worse mRS'
      }
    },
    trialDesign: {
      type: [
        'Prospective, nonrandomized controlled intervention study (quasi-experimental)',
        'Allocation by MSU availability — not patient-level randomization',
        'MSU dispatch plus ambulance vs conventional ambulance alone',
        'Pragmatic Berlin stroke system evaluation (3 MSU base stations, 24/7 staffing, paramedic + radiology tech + emergency neurologist)'
      ],
      timeline: 'Berlin, Germany; February 1, 2017 to October 30, 2019 (final inclusion target reached May 8, 2019)'
    },
    efficacyResults: {
      treatment: {
        percentage: 80.3,
        label: 'mRS 0-3 or living at home at 90 days',
        name: 'MSU Dispatch'
      },
      control: {
        percentage: 78.0,
        label: 'mRS 0-3 or living at home at 90 days',
        name: 'Conventional Ambulance'
      }
    },
    intervention: {
      treatment: 'Simultaneous dispatch of a mobile stroke unit with on-board CT, laboratory testing, and thrombolysis capability plus conventional ambulance',
      control: 'Conventional ambulance transport to hospital stroke unit'
    },
    clinicalContext: 'Prehospital thrombolysis is highly time dependent, but prior MSU studies had focused mainly on process metrics. B_PROUD asked whether dispatching an MSU improves 90-day disability outcomes for patients with acute ischemic stroke in a real urban stroke system. Note: this is a prospective observational cohort with natural-experiment allocation (MSU availability), not a randomized trial — the strongest reading is association, not causation.',
    calculations: {
      // NNT suppressed per clinical-trial-audit skill rules: observational/quasi-experimental
      // designs do not yield valid NNT because confounding prevents causal ARD interpretation.
      // Prior value (43.5) was derived from the coprimary dichotomized disability outcome;
      // retaining it would imply a causal estimate the underlying study cannot support.
      nntExplanation: 'NNT is not displayed for B_PROUD. The study uses a quasi-experimental design (allocation by MSU availability rather than patient-level randomization); per clinical-trial-audit skill, NNT is not allowed for non-randomized comparisons because residual confounding prevents causal absolute-risk-difference interpretation. The primary analysis used an ordinal mRS shift (common OR 0.71, 95% CI 0.58–0.86, P<0.001) which is the appropriate effect-size summary.'
    },
    pearls: [
      'Primary analysis was an ordinal shift in disability with MSU dispatch: common OR 0.71 (95% CI 0.58–0.86, P<0.001) for worse mRS',
      'Median 90-day mRS was 1 with MSU dispatch vs 2 with conventional ambulance',
      'MSU dispatch increased thrombolysis use: 60.2% vs 48.1% (adjusted OR 1.62, P<0.001); dispatch-to-tPA shortened by ~26 min',
      'Dispatch-to-imaging time improved by about 15 minutes; tPA within 60 min of onset 12.8% vs 4.0% (adj OR 2.96)',
      'Symptomatic secondary intracranial hemorrhage was similar: 3.2% vs 2.8% (adj OR 1.20, 95% CI 0.66–2.19) — no safety penalty',
      'Quasi-experimental allocation (by MSU availability) — not randomized. Treatment effect may include unmeasured site-level confounding despite adjustment',
      'Berlin-specific MSU infrastructure (3 base stations, daytime-only 7am–11pm, paramedic + radiology tech + neurologist on board) — generalizability to other systems uncertain',
      'AHA/ASA 2026 §2.5 COR 1: "In patients with suspected AIS, the use of MSUs over conventional EMS where available is recommended for the transport and management of thrombolytic-eligible patients to ensure the fastest achievable onset-to-treatment time"',
      'Companion trial: BEST-MSU (Grotta 2021, US, alternating-week cluster) — same direction of effect, different allocation mechanism'
    ],
    conclusion: '',
    source: 'Ebinger M, et al. (JAMA 2021;325(5):454–466)',
    trialResult: 'POSITIVE',
    applicability: {
      geography: 'Berlin, Germany — daytime-only operating hours (7am–11pm); 3 MSU base stations across 3.8 million population. Berlin Fire Brigade EMS dispatch system.',
      populationExclusions: [
        'Allocation was by MSU availability, NOT patient-level randomization — association rather than causation. Treatment effect may include unmeasured site-level confounding despite multivariable adjustment.',
        'Berlin-specific MSU infrastructure (paramedic + radiology tech + emergency neurologist on board, point-of-care CT + labs + thrombolysis capability). Generalizability to systems without this infrastructure is uncertain.',
        'Daytime-only operating hours (7am–11pm) — overnight strokes not represented.',
        'Stroke mimics excluded by design — analysis is in patients with final diagnosis of acute ischemic stroke or TIA.',
        'Median NIHSS 4 — lower-severity cohort than typical US ED stroke; effect estimate may not transfer 1:1 to higher-severity populations.',
        'Workflow takeaways (dispatch-to-tPA reduction, increased thrombolysis use, treatment within 60 min of onset) are more transferable than absolute effect estimates.',
      ],
    },
    safetyProfile: {
      sICH: {
        evt: 3.2,
        control: 2.8,
        label: 'Symptomatic secondary intracranial hemorrhage',
        tooltip: 'Rates of symptomatic secondary intracranial hemorrhage were similar despite more frequent prehospital reperfusion treatment with MSU dispatch.'
      },
      mortality: {
        evt: 7.1,
        control: 8.8,
        label: 'Death at 90 days',
        tooltip: 'Death at 90 days was numerically lower with MSU dispatch in the coprimary disability categorization.'
      }
    }
  },
  'best-msu-trial': {
    id: 'best-msu-trial',
    title: 'BEST-MSU Trial',
    subtitle: 'Mobile Stroke Units vs Standard EMS in Acute Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1515',
        label: 'Enrolled Patients'
      },
      primaryEndpoint: {
        value: 'Utility-Weighted mRS',
        label: 'at 90 Days in tPA-Eligible Patients'
      },
      pValue: {
        value: '<0.001',
        label: 'Statistically Sig.'
      },
      effectSize: {
        value: 'OR 2.14',
        label: 'Adjusted Odds of Excellent Outcome'
      }
    },
    trialDesign: {
      type: [
        'Prospective, multicenter, alternating-week controlled trial',
        'Observational comparison of MSU vs standard EMS',
        'Primary analysis in patients adjudicated eligible for thrombolysis'
      ],
      timeline: 'United States; August 2014 to August 2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 53.5,
        label: 'mRS 0-1 at 90 days in tPA-eligible patients',
        name: 'MSU Care'
      },
      control: {
        percentage: 45.5,
        label: 'mRS 0-1 at 90 days in tPA-eligible patients',
        name: 'Standard EMS'
      }
    },
    intervention: {
      treatment: 'Mobile stroke unit evaluation with on-board CT, vascular imaging capability, stroke expertise, and prehospital tPA',
      control: 'Standard EMS transport to hospital for in-hospital stroke evaluation and reperfusion treatment'
    },
    clinicalContext: 'BEST-MSU addressed whether the impressive process advantages of mobile stroke units in the US translate into better clinical outcomes. Unlike earlier feasibility studies, it focused on patient-centered 90-day outcomes in a multicenter real-world framework.',
    calculations: {
      nnt: 12.5,
      nntExplanation: 'For every 12.5 tPA-eligible patients managed by MSU instead of standard EMS, one additional patient achieved mRS 0-1 at 90 days (53.5% vs 45.5%).'
    },
    pearls: [
      'Median onset-to-tPA time was reduced from 108 minutes to 72 minutes with MSU care',
      'Among tPA-eligible patients, 97.1% received thrombolysis with MSU vs 79.5% with standard EMS',
      'Excellent 90-day outcome improved from 45.5% to 53.5%, with adjusted OR 2.14 for utility-weighted excellent outcome',
      'About one-third of MSU-treated patients received thrombolysis within 60 minutes of onset, compared with 2.6% in standard EMS',
      'Symptomatic intracerebral hemorrhage remained about 2% in both groups despite faster reperfusion'
    ],
    conclusion: '',
    source: 'Grotta JC, et al. (NEJM 2021)',
    doi: '10.1056/NEJMoa2103879',
    clinicalTrialsId: 'NCT02190500',
    trialResult: 'POSITIVE',
    safetyProfile: {
      mortality: {
        evt: 8.9,
        control: 11.9,
        label: 'Death at 90 days',
        tooltip: 'Mortality at 90 days was numerically lower with MSU care.'
      }
    },
    listCategory: 'acute',
    listDescription: 'Prehospital mobile stroke unit vs standard EMS in tPA-eligible stroke; positive quasi-experimental study.',
    inclusionCriteria: [
      'Acute stroke symptoms within 24 hours',
      'Located within the MSU service area of Houston, TX',
      'Alert or minimally drowsy on initial evaluation',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Comatose or unresponsive at presentation',
      'Traumatic etiology',
      'Location outside MSU service area at time of activation',
    ],
    howToReadChart: [
      {
        question: 'What does this chart show?',
        answer: 'mRS 0-1 (excellent functional outcome) at 90 days in patients adjudicated as tPA-eligible. MSU care reached 53.5 per 100; standard EMS reached 45.5 per 100, an 8 percentage point absolute difference driven by a 36-minute reduction in onset-to-treatment time.',
      },
      {
        question: 'Why is AOR used instead of a standard risk ratio?',
        answer: 'The primary endpoint was utility-weighted mRS — a composite ordinal score. The AOR 2.14 reflects adjusted odds of excellent outcome across all mRS categories. The 53.5% vs 45.5% shown here is the secondary dichotomized mRS 0-1 rate, presented for visual clarity.',
      },
      {
        question: 'What is the NNT?',
        answer: 'NNT ≈ 13: approximately 13 tPA-eligible stroke patients must be managed by MSU instead of standard EMS for one additional patient to achieve mRS 0-1 at 90 days. The benefit is time-mediated — faster treatment, fewer dead neurons.',
      },
    ],
    howToInterpret: {
      proves: 'In tPA-eligible patients with acute ischemic stroke in Houston, TX, MSU-based prehospital care improved excellent functional outcome at 90 days compared with standard EMS transport (53.5% vs 45.5%, AOR 2.14, P<0.001), with median onset-to-treatment time 36 minutes shorter than EMS.',
      doesNotProve: 'BEST-MSU does not prove benefit for non-tPA-eligible patients or those with hemorrhagic stroke. The single-city US setting may not generalize to different health systems, hospital proximity patterns, or EMS infrastructure. The benefit is not separable from other concurrent quality improvements during the study period.',
      cautions: 'Design quality: BEST-MSU used alternating-week allocation rather than individual randomization, making it a quasi-experimental controlled study. Secular trends, seasonal variation, or unmeasured confounders across alternating weeks could bias results. The infrastructure cost of MSU deployment is high, limiting generalizability to resource-limited settings.',
    },
    bedsidePearl: 'BEST-MSU showed that prehospital MSU care saved 36 minutes and improved outcomes in tPA-eligible patients (NNT 13). The mechanism is faster treatment, not better treatment. For hospitals without MSU access, the equivalent message is: every minute saved on door-to-needle time translates to measurable benefit.',
    bottomLineSummary: 'In a quasi-experimental alternating-week study from Houston, mobile stroke unit care reduced onset-to-treatment time by 36 minutes and improved excellent functional outcome at 90 days in tPA-eligible patients (53.5% vs 45.5%, AOR 2.14, P<0.001). The benefit is time-mediated; the non-randomized design limits causal certainty.',
  },
  'interact4-trial': {
    id: 'interact4-trial',
    title: 'INTERACT4 Trial',
    subtitle: 'Prehospital Blood-Pressure Reduction Before Stroke Type Is Known',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '2404',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '1.00',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.00',
        label: 'Common OR for Poor Outcome'
      }
    },
    trialDesign: {
      type: [
        'Randomized, open-label, blinded-endpoint trial',
        'Ambulance-based blood-pressure lowering before imaging diagnosis',
        'Undifferentiated stroke population with SBP >=150 mm Hg within 2 hours'
      ],
      timeline: 'China; prehospital acute stroke network'
    },
    efficacyResults: {
      treatment: {
        percentage: 40.7,
        label: 'mRS 0-2 at 90 days',
        name: 'Immediate BP Reduction'
      },
      control: {
        percentage: 38.7,
        label: 'mRS 0-2 at 90 days',
        name: 'Usual Care'
      }
    },
    intervention: {
      treatment: 'Immediate ambulance blood-pressure lowering to a systolic target of 130-140 mm Hg',
      control: 'Usual prehospital blood-pressure management'
    },
    clinicalContext: 'Before imaging distinguishes ischemic from hemorrhagic stroke, ambulance clinicians face a major uncertainty: aggressive blood-pressure lowering could help intracerebral hemorrhage but harm ischemic stroke by reducing perfusion. INTERACT4 directly tested that tradeoff in the field.',
    pearls: [
      'Overall trial result was neutral: common OR 1.00 for poor functional outcome',
      'Stroke type mattered: prehospital BP reduction improved outcomes in hemorrhagic stroke (OR 0.75) but worsened outcomes in ischemic stroke (OR 1.30)',
      'Almost half the cohort ultimately had hemorrhagic stroke, which is unusually high for many EMS systems',
      'By hospital arrival, systolic BP was lowered by about 11 mm Hg (159 vs 170 mm Hg)',
      'Serious adverse events were similar overall, so the main issue was efficacy heterogeneity rather than clear global toxicity'
    ],
    conclusion: '',
    source: 'INTERACT4 Investigators (NEJM 2024)',
    doi: '10.1056/NEJMoa2314741',
    trialResult: 'NEUTRAL',
    archetypeId: 'B',
    inclusionCriteria: [
      'Age 18 or older',
      'FAST score ≥2 with arm motor deficit',
      'Systolic BP ≥150 mm Hg',
      'Treatment initiation within 2 hours of onset or last known well',
    ],
    exclusionCriteria: [
      'Coma or severe comorbidity',
      'Epilepsy, recent head injury, or hypoglycemia',
      'Inability to confirm eligibility or initiate treatment within 2 hours',
    ],
    bottomLineSummary: 'Prehospital IV blood-pressure reduction in undifferentiated acute stroke had no overall effect on 90-day functional outcome (cOR 1.00, 95% CI 0.87-1.15). The critical finding is the divergent subgroup effect: the intervention significantly reduced poor outcomes in hemorrhagic stroke (cOR 0.75, 95% CI 0.60-0.92) but significantly increased poor outcomes in ischemic stroke (cOR 1.30, 95% CI 1.06-1.60). Because nearly half the cohort had hemorrhagic stroke (unusually high for many EMS systems), the net result was null. In populations with a lower hemorrhagic fraction, the same intervention would likely cause net harm.',
    bedsidePearl: 'Type-blind prehospital BP lowering is a zero-sum strategy: you help your hemorrhagic strokes and hurt your ischemic strokes in roughly equal measure. The overall null result is not reassurance that early BP reduction is safe across the board. Without imaging to confirm stroke type, aggressive prehospital BP reduction is not routinely indicated.',
    mrsDistribution: [
      { arm: 'Intensive BP Reduction', n: 1205, pct: [13.8, 19.0, 7.9, 14.0, 11.1, 11.6, 22.5] },
      { arm: 'Usual Care', n: 1199, pct: [16.1, 16.3, 6.3, 14.8, 10.9, 13.0, 22.6] },
    ],
    ordinalStats: {
      commonOR: 1.00,
      ciLow: 0.87,
      ciHigh: 1.15,
      direction: 'neutral',
    },
    subgroupAnalyses: [
      {
        label: 'Ischemic stroke',
        description: 'Pre-specified subgroup; includes 53 patients with TIA. OR reported as for poor functional outcome.',
        winnerArm: 'control',
        armDistributions: [
          { arm: 'Intensive BP Reduction', n: 599, pct: [18.6, 19.6, 7.9, 12.2, 8.8, 10.5, 22.5] },
          { arm: 'Usual Care', n: 600, pct: [21.8, 19.9, 8.4, 13.0, 7.9, 11.8, 17.1] },
        ],
        stats: {
          commonOR: 1.30,
          ciLow: 1.06,
          ciHigh: 1.60,
          direction: 'negative',
        },
      },
      {
        label: 'Hemorrhagic stroke',
        description: 'Pre-specified subgroup; includes 12 patients with subarachnoid hemorrhage. OR reported as for poor functional outcome.',
        winnerArm: 'intervention',
        armDistributions: [
          { arm: 'Intensive BP Reduction', n: 522, pct: [3.9, 18.1, 8.3, 16.9, 14.2, 14.4, 24.3] },
          { arm: 'Usual Care', n: 519, pct: [5.5, 11.4, 3.9, 17.8, 15.0, 15.6, 30.8] },
        ],
        stats: {
          commonOR: 0.75,
          ciLow: 0.60,
          ciHigh: 0.92,
          direction: 'positive',
        },
      },
    ],
    subgroupCaveat: 'These subgroup analyses were pre-specified but not part of a hierarchical testing plan with adjustment for multiple comparisons. The divergent effects by stroke type are hypothesis-generating and should not override the overall null primary result for clinical decision-making without imaging confirmation of stroke type.',
    safetyProfile: {
      mortality: {
        evt: 22.5,
        control: 22.6,
        label: 'Death within 90 days',
        tooltip: 'Overall 90-day mortality was essentially identical between groups.'
      }
    }
  },
  'mr-asap-trial': {
    id: 'mr-asap-trial',
    title: 'MR ASAP Trial',
    subtitle: 'Prehospital Glyceryl Trinitrate Within 3 Hours of Presumed Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '325',
        label: 'Included Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NS',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 0.92',
        label: 'Adjusted Common OR (Target Population)'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, randomized, open-label, blinded-endpoint trial',
        'Ambulance-based glyceryl trinitrate vs standard care',
        'Deferred-consent prehospital stroke trial'
      ],
      timeline: 'Netherlands; April 2018 to February 2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 51,
        label: 'mRS 0-2 at 90 days (target population)',
        name: 'Glyceryl Trinitrate'
      },
      control: {
        percentage: 49,
        label: 'mRS 0-2 at 90 days (target population)',
        name: 'Standard Care'
      }
    },
    intervention: {
      treatment: 'Transdermal glyceryl trinitrate 5 mg/day for 24 hours started prehospital plus standard care',
      control: 'Standard prehospital and in-hospital stroke care alone'
    },
    clinicalContext: 'Earlier pooled analyses had suggested that very early glyceryl trinitrate might improve outcomes after stroke, but RIGHT-2 challenged that signal. MR ASAP revisited the question in a Dutch ambulance-based trial that treated presumed stroke within 3 hours of onset.',
    pearls: [
      'The trial was stopped early after only 380 randomizations because of safety concerns in patients with intracerebral hemorrhage',
      'There was no overall functional benefit in either the total or target population',
      'In the target population, mRS 0-2 at 90 days was essentially unchanged: 51% vs 49%',
      'Early death within 7 days was numerically higher with glyceryl trinitrate, especially in intracerebral hemorrhage',
      'The study reinforced the concern from RIGHT-2 that prehospital GTN should not be used before imaging excludes hemorrhage'
    ],
    conclusion: '',
    source: 'van den Berg SA, et al. (Lancet Neurol 2022)',
    doi: '10.1016/S1474-4422(22)00333-7',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      mortality: {
        evt: 15,
        control: 14,
        label: 'Death within 90 days',
        tooltip: 'Overall 90-day mortality was similar, but early death within 7 days was higher with glyceryl trinitrate.'
      }
    },
    keyMessage: 'No benefit overall, with a signal of early harm in intracerebral hemorrhage. Prehospital GTN should be avoided in presumed stroke before imaging.',
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'Age 18 or older',
      'Presumed stroke with FAST score 2 or higher',
      'Onset or last known well within 3 hours',
      'Systolic blood pressure 120 mm Hg or higher',
    ],
    exclusionCriteria: [
      'Hypotension (systolic BP below 120 mm Hg)',
      'Nitrate use within 12 hours',
      'Known intracranial hemorrhage',
      'Severe comorbidity or reduced life expectancy',
    ],
    mrsDistribution: [
      { arm: 'Glyceryl Trinitrate', n: 170, pct: [6, 19, 26, 13, 12, 8, 15] },
      { arm: 'Standard Care', n: 148, pct: [13, 17, 22, 18, 11, 6, 14] },
    ],
    ordinalStats: { commonOR: 0.97, ciLow: 0.65, ciHigh: 1.47, direction: 'neutral' as const },
    bedsidePearl: 'MR ASAP and RIGHT-2 together make the strongest case against prehospital GTN for undifferentiated stroke: no functional benefit in either trial, and an early harm signal in ICH patients treated before imaging. Early 7-day mortality was numerically higher with GTN in the ICH subgroup. Do not administer prehospital nitrates for presumed stroke before CT excludes hemorrhage.',
    bottomLineSummary: 'In ambulance-treated patients with presumed stroke within 3 hours of onset, prehospital transdermal glyceryl trinitrate did not improve 90-day mRS distribution (cOR 0.97, 95% CI 0.65-1.47 in target population). The trial was stopped after 380 randomizations due to a safety signal in ICH patients: early 7-day mortality was numerically higher with GTN in this subgroup. mRS 0-2 at 90 days was 51% vs 49% in the target population.',
  },
  'racecat-trial': {
    id: 'racecat-trial',
    title: 'RACECAT Trial',
    subtitle: 'Direct CSC Transport vs Local Stroke Center for Suspected LVO',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1401',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days in Ischemic Stroke'
      },
      pValue: {
        value: 'NS',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.03',
        label: 'Adjusted Common OR'
      }
    },
    trialDesign: {
      type: [
        'Population-based, cluster-randomized trial',
        'Nonurban suspected LVO triage strategy study',
        'Direct CSC routing vs nearest local stroke center first'
      ],
      timeline: 'Catalonia, Spain; March 2017 to June 2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 48.8,
        label: 'Underwent thrombectomy in target ischemic stroke population',
        name: 'Direct to CSC'
      },
      control: {
        percentage: 39.4,
        label: 'Underwent thrombectomy in target ischemic stroke population',
        name: 'Local Stroke Center First'
      }
    },
    intervention: {
      treatment: 'Direct transport to a thrombectomy-capable comprehensive stroke center',
      control: 'Initial transport to the nearest local stroke center with secondary transfer if needed'
    },
    clinicalContext: 'In nonurban systems, suspected LVO triage creates a classic tradeoff: bypassing the nearest stroke center may speed thrombectomy but can delay thrombolysis and overtriage patients without true LVO. RACECAT tested this in a real regional stroke network.',
    pearls: [
      'Primary outcome was neutral: no 90-day disability difference despite more direct access to thrombectomy-capable centers',
      'Direct CSC routing decreased IV tPA use (47.5% vs 60.4%) but increased thrombectomy use (48.8% vs 39.4%)',
      'Overall 90-day mortality was identical at about 27%',
      'The trial was stopped early for futility after interim analysis',
      'RACECAT argues against a universal mothership strategy in nonurban suspected LVO systems'
    ],
    conclusion: '',
    source: 'Pérez de la Ossa N, et al. (JAMA 2022)',
    doi: '10.1001/jama.2022.4404',
    clinicalTrialsId: 'NCT02795962',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      mortality: {
        evt: 27.3,
        control: 27.2,
        label: 'Death at 90 days',
        tooltip: 'Mortality was not different despite differences in thrombolysis and thrombectomy rates.'
      }
    },
    keyMessage: 'More thrombectomy does not automatically translate into better functional outcomes when IVT delays and overtriage offset the gain.',
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'Suspected large vessel occlusion in nonurban ambulance catchment',
      'Onset within the acute treatment window',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Direct CSC admission clinically indicated',
      'Participation in another trial',
    ],
    mrsDistribution: [
      { arm: 'Direct to CSC', n: 467, pct: [10.8, 11.8, 10.8, 17.2, 12.0, 14.5, 22.9] },
      { arm: 'Local Stroke Center First', n: 482, pct: [9.0, 12.0, 11.8, 19.5, 12.0, 12.2, 23.5] },
    ],
    ordinalStats: { commonOR: 1.03, ciLow: 0.82, ciHigh: 1.29, direction: 'positive' as const },
    bedsidePearl: 'RACECAT shows that in a real nonurban stroke network, bypassing the nearest center to speed thrombectomy did not improve population-level outcomes. The thrombectomy gains were offset by IVT delays and overtriage of non-LVO patients. This is a strong argument against a universal mothership (CSC-direct) protocol in nonurban systems. Triage algorithms should account for LVO prevalence, transfer times, and IVT eligibility window for your specific system.',
    bottomLineSummary: 'In a cluster-randomized nonurban Catalan stroke network, direct transport to a thrombectomy-capable CSC did not improve 90-day mRS distribution in ischemic stroke or TIA compared with nearest local stroke center first (adjusted cOR 1.03, 95% CI 0.82-1.29). More patients in the CSC-direct group underwent thrombectomy (48.8% vs 39.4%) but fewer received IVT (47.5% vs 60.4%). Mortality at 90 days was identical at approximately 27%. The trial was stopped early for futility.',
  },
  'right-2-trial': {
    id: 'right-2-trial',
    title: 'RIGHT-2 Trial',
    subtitle: 'Ultra-Acute Prehospital Glyceryl Trinitrate in Presumed Stroke',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '1149',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days in Confirmed Stroke/TIA'
      },
      pValue: {
        value: '0.083',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.25',
        label: 'Adjusted OR for Poor Outcome'
      }
    },
    trialDesign: {
      type: [
        'Paramedic-delivered, randomized, sham-controlled phase 3 trial',
        'Prehospital GTN vs sham dressing',
        'Blinded endpoint assessment'
      ],
      timeline: 'United Kingdom; October 2015 to May 2018'
    },
    efficacyResults: {
      treatment: {
        percentage: 32,
        label: 'mRS 0-2 at 90 days in confirmed stroke/TIA cohort',
        name: 'GTN'
      },
      control: {
        percentage: 31,
        label: 'mRS 0-2 at 90 days in confirmed stroke/TIA cohort',
        name: 'Sham'
      }
    },
    intervention: {
      treatment: 'Transdermal glyceryl trinitrate 5 mg once daily for 4 days started in the ambulance',
      control: 'Sham dressing plus standard stroke care'
    },
    clinicalContext: 'RIGHT-2 tested whether nitroglycerin given in the first few hours after presumed stroke could improve outcome by lowering blood pressure and augmenting nitric oxide signaling. It was one of the largest ambulance-based stroke intervention trials ever performed.',
    pearls: [
      'RIGHT-2 was negative for its primary endpoint: no improvement in 90-day disability with GTN',
      'Blood pressure did fall with GTN, but this did not translate into better functional outcome',
      'The signal trended in the wrong direction for confirmed stroke/TIA: adjusted OR 1.25 for poorer outcome',
      'Secondary outcomes, death, and serious adverse events were not significantly improved',
      'Together with MR ASAP, RIGHT-2 makes a strong case against routine prehospital GTN for undifferentiated stroke'
    ],
    conclusion: '',
    source: 'RIGHT-2 Investigators (Lancet 2019)',
    doi: '10.1016/S0140-6736(19)30194-1',
    trialResult: 'NEGATIVE',
    archetypeId: 'B' as const,
    /* claimId: right-2.inclusion | source: RIGHT-2 Investigators, Lancet 2019 */
    inclusionCriteria: [
      'Adults (18 years or older) with presumed acute stroke',
      'FAST score 2 or 3 on paramedic assessment',
      'Systolic blood pressure 120 mm Hg or higher',
      'Able to start treatment within 4 hours of symptom onset',
      'Randomized and treated by trained paramedic in the ambulance',
    ],
    exclusionCriteria: [
      'Residence in a nursing home',
      'Reduced consciousness (GCS below 8)',
      'Hypoglycemia (capillary glucose below 2.5 mmol/L)',
      'Witnessed seizure at onset',
      'Recent nitrate use or PDE-5 inhibitor use',
    ],
    /* claimId: right-2.interpret | source: RIGHT-2 Investigators, Lancet 2019, Table 2 */
    howToInterpret: {
      proves: 'RIGHT-2 showed that transdermal GTN started in the ambulance within 4 hours of presumed stroke did not improve 90-day functional outcome in patients with confirmed stroke or TIA. The trial also demonstrated that ambulance-based paramedic-delivered stroke intervention trials are feasible in the UK.',
      doesNotProve: 'This trial does not support transdermal GTN as an ultra-acute prehospital treatment for undifferentiated stroke. It does not establish whether later in-hospital administration has different effects.',
      cautions: 'Safety signals were concentrated in patients with intracerebral hemorrhage: larger hematoma, more mass effect, and a non-significant trend toward worse functional outcome (OR 1.87, 95% CI 0.98 to 3.57, p=0.057). The ICH subgroup was small and these analyses are hypothesis-generating. GTN may be particularly hazardous in very early ICH due to disruption of early vasoconstrictive hemostasis. Adherence was low; only 36% of cohort 2 received all 4 days of treatment, which may have reduced exposure and attenuated any potential effect. RIGHT-2 completed planned enrollment, unlike the related prehospital nitrate trial MR ASAP which was stopped early for an ICH harm signal.',
    },
    /* claimId: right-2.bedside-pearl | source: RIGHT-2 Investigators, Lancet 2019 */
    bedsidePearl: 'In ultra-acute presumed stroke, transdermal GTN shows no functional benefit and a safety signal in intracerebral hemorrhage patients treated before imaging. The trial\'s main contribution is feasibility: UK paramedics can randomize and treat stroke patients in the ambulance. For blood pressure management in suspected stroke before imaging, RIGHT-2 argues against routine prehospital intervention.',
    /* claimId: right-2.bottom-line | source: RIGHT-2 Investigators, Lancet 2019 */
    bottomLineSummary: 'In the RIGHT-2 trial, transdermal glyceryl trinitrate started by paramedics within 4 hours of presumed stroke did not improve 90-day mRS distribution in patients with confirmed stroke or TIA (cohort 1, N=852; adjusted common OR for poor outcome 1.25, 95% CI 0.97 to 1.60, p=0.083). The full ITT result was similarly null (cohort 2, N=1149; OR 1.04, 95% CI 0.84 to 1.29, p=0.69). Safety signals including symptomatic hypotension and larger hematoma with GTN in ICH patients reinforce the case against prehospital nitrates before imaging.',
  },
  'triage-stroke-trial': {
    id: 'triage-stroke-trial',
    title: 'TRIAGE-STROKE Trial',
    subtitle: 'PSC-First vs CSC-First Routing in IVT-Eligible Suspected LVO',
    category: 'Neuro Trials',
    stats: {
      sampleSize: {
        value: '171',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days in AIS'
      },
      pValue: {
        value: '0.31',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.42',
        label: 'Ordinal OR for Better Outcome'
      }
    },
    trialDesign: {
      type: [
        'National, multicenter, randomized assessor-blinded trial',
        'IVT-eligible suspected LVO transport strategy study',
        'Nearest PSC vs direct CSC admission'
      ],
      timeline: 'Denmark; September 2018 to May 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 83,
        label: 'mRS 0-3 at 90 days (post hoc exploratory)',
        name: 'Direct CSC First'
      },
      control: {
        percentage: 64,
        label: 'mRS 0-3 at 90 days (post hoc exploratory)',
        name: 'PSC First'
      }
    },
    intervention: {
      treatment: 'Direct transport to comprehensive stroke center prioritizing EVT access',
      control: 'Transport to nearest primary stroke center prioritizing IV thrombolysis'
    },
    clinicalContext: 'TRIAGE-STROKE focused on a narrower group than RACECAT: patients within 4 hours who were still eligible for IVT and had suspected LVO in the catchment of a PSC. It tested whether bypassing the PSC would improve outcomes enough to justify delayed thrombolysis.',
    pearls: [
      'The trial was underpowered after early termination and enrolled only 171 patients, 104 of whom had acute ischemic stroke',
      'Primary outcome was neutral: ordinal OR 1.42 for better mRS, but with wide confidence intervals crossing no effect',
      'Direct CSC routing shortened onset-to-groin time by 35 minutes for LVO patients',
      'PSC-first routing shortened onset-to-needle time by 30 minutes',
      'Post hoc analysis suggested more patients achieved mRS 0-3 with CSC-first transport, but this was exploratory and should not override the neutral primary result'
    ],
    conclusion: '',
    source: 'Behrndtz A, et al. (Stroke 2023)',
    doi: '10.1161/STROKEAHA.123.043875',
    clinicalTrialsId: 'NCT03542188',
    trialResult: 'NEGATIVE',
    keyMessage: 'Underpowered but mechanistically informative: CSC-first speeds EVT, PSC-first speeds IVT, and the net clinical effect remains system dependent.',
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'Age 18 or older',
      'Suspected LVO stroke (RACE score 5 or higher)',
      'Within 4 hours of onset or last known well',
      'Eligible for IV thrombolysis',
      'Within catchment area of a primary stroke center',
    ],
    exclusionCriteria: [
      'Pre-morbid mRS greater than 2',
      'Direct CSC admission clinically indicated',
      'Enrollment in another trial',
    ],
    mrsDistribution: [
      { arm: 'Direct CSC First', n: 52, pct: [17, 24, 15, 26, 4, 9, 4] },
      { arm: 'PSC First', n: 52, pct: [19, 17, 16, 12, 12, 12, 12] },
    ],
    ordinalStats: { commonOR: 1.42, ciLow: 0.72, ciHigh: 2.82, direction: 'positive' as const, pValue: 0.31 },
    bedsidePearl: 'TRIAGE-STROKE was stopped early (N=171 of planned 424) and cannot provide definitive guidance on bypass strategy. The mechanistic signal is informative: CSC-first shortened onset-to-groin time by 35 minutes; PSC-first shortened onset-to-needle time by 30 minutes. The net clinical effect is system dependent and this underpowered trial should not be used alone to mandate a bypass protocol.',
    bottomLineSummary: 'In IVT-eligible patients with suspected LVO within 4 hours of onset, direct routing to a CSC versus PSC-first transport did not significantly improve 90-day functional outcome in the acute ischemic stroke population (ordinal OR 1.42, 95% CI 0.72-2.82, p=0.31). The trial was stopped early at 171 of a planned 424 patients. Direct CSC routing shortened onset-to-groin time by 35 minutes; PSC-first shortened onset-to-needle time by 30 minutes.',
  },
  'act-trial': {
    id: 'act-trial',
    title: 'AcT Trial',
    subtitle: 'Tenecteplase vs Alteplase in Canada',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'Canada (pragmatic, broad population)',
    },
    stats: {
      sampleSize: {
        value: '1577',
        label: 'ITT Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90-120 Days'
      },
      pValue: {
        value: 'NI Met',
        label: 'Noninferiority'
      },
      effectSize: {
        value: '+2.1%',
        label: 'Absolute Difference'
      }
    },
    trialDesign: {
      type: [
        'Pragmatic, multicenter, open-label, registry-linked randomized noninferiority trial',
        'Tenecteplase 0.25 mg/kg vs alteplase 0.9 mg/kg',
        'Canadian routine-practice thrombolysis trial across 22 stroke centres'
      ],
      timeline: 'Canada; December 2019 to January 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 36.9,
        label: 'mRS 0-1 at 90-120 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 34.8,
        label: 'mRS 0-1 at 90-120 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg as a single bolus',
      control: 'IV alteplase 0.9 mg/kg with bolus plus infusion'
    },
    clinicalContext: 'AcT tested whether the practical advantages of tenecteplase in routine stroke care could replace alteplase without sacrificing outcomes. Unlike earlier efficacy-focused trials, it was deliberately pragmatic, embedded in real-world Canadian practice, and enrolled patients with disabling ischemic stroke who met standard thrombolysis criteria within 4.5 hours.',
    pearls: [
      'Tenecteplase achieved noninferiority to alteplase for excellent functional outcome',
      'Symptomatic intracranial hemorrhage was similar: 3.4% vs 3.2%',
      'Mortality at 90 days was essentially identical: 15.3% vs 15.4%',
      'AcT is the largest pragmatic Canadian trial supporting tenecteplase 0.25 mg/kg as a first-line alternative'
    ],
    conclusion: '',
    source: 'Menon BK, et al. (Lancet 2022)',
    doi: '10.1016/S0140-6736(22)01054-6',
    clinicalTrialsId: 'NCT03889249',
    trialResult: 'NEUTRAL',
    safetyProfile: {
      sICH: {
        evt: 3.4,
        control: 3.2,
        label: 'Symptomatic intracranial hemorrhage at 24 hours'
      },
      mortality: {
        evt: 15.3,
        control: 15.4,
        label: 'Death within 90 days'
      }
    },
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase vs alteplase in routine Canadian stroke practice; non-inferiority confirmed.',
    inclusionCriteria: [
      'Acute ischemic stroke with disabling deficits',
      'Treatable within 4.5 hours of symptom onset',
      'Standard IV thrombolysis criteria met per local guidelines',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Contraindication to IV thrombolysis per local guidelines',
      'Hemorrhagic stroke on baseline imaging',
      'Received tenecteplase or alteplase before enrolment',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 (excellent functional outcome) at 90-120 days in routine Canadian practice. Tenecteplase reached 36.9 per 100 patients; alteplase reached 34.8. The 2.1 percentage point numerical advantage for tenecteplase is within the prespecified NI margin of −5 pp, confirming non-inferiority.',
      },
      {
        question: 'Why is there no delta band?',
        answer: 'AcT was designed to prove non-inferiority, not superiority. The superiority p-value was 0.21 — not significant. A delta band would misrepresent the result as an efficacy advantage. The two arms meet the prespecified non-inferiority margin for this endpoint.',
      },
      {
        question: 'What does NI P<0.001 mean?',
        answer: 'The lower 95% CI bound for the risk difference was −1.4 pp, comfortably above the NI margin of −5 pp. AcT provides strong evidence that tenecteplase does not clinically sacrifice efficacy versus alteplase in routine stroke care.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with disabling acute ischemic stroke treated within 4.5 hours in routine Canadian practice, tenecteplase 0.25 mg/kg showed non-inferiority to alteplase 0.9 mg/kg for excellent functional outcome at 90-120 days within the prespecified margin of −5 percentage points (RD +2.1 pp, 95% CI −1.4 to +5.6, NI P<0.001).',
      doesNotProve: 'AcT does not prove superiority of tenecteplase over alteplase for functional outcomes. It does not establish equivalent benefit in bridging EVT patients, who were not the primary population. Registry-linked outcome ascertainment differs from blinded endpoint adjudication in traditional RCTs.',
      cautions: 'Open-label design with registry-based outcomes may introduce assessment bias. The NI margin of −5 pp, while prespecified, means a difference up to 5% would still be declared non-inferior. Superiority was not met (P=0.21), so the trial supports replacement of alteplase but does not establish tenecteplase as the superior agent.',
    },
    bedsidePearl: 'AcT confirmed tenecteplase 0.25 mg/kg as a practical replacement for alteplase in routine IVT (NI met, RD +2.1 pp). The workflow advantage is the single-bolus administration versus a bolus-plus-infusion for alteplase. Symptomatic ICH rates were similar (3.4% vs 3.2%). Together with TRACE-2 and ATTEST-2, AcT supports the 2026 guideline endorsement of tenecteplase.',
    bottomLineSummary: 'AcT showed non-inferiority of tenecteplase 0.25 mg/kg to alteplase 0.9 mg/kg for excellent 90-day outcome in routine Canadian stroke practice (36.9% vs 34.8%, RD +2.1 pp, 95% CI −1.4 to +5.6). The single-bolus advantage is validated without sacrificing efficacy or safety.',
  },
  'aramis-trial': {
    id: 'aramis-trial',
    title: 'ARAMIS Trial',
    subtitle: 'Dual Antiplatelet Therapy vs Alteplase for Minor Nondisabling Stroke',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'Disabling deficits (NIHSS ≥6) — minor nondisabling stroke only',
        'Patients who are EVT candidates',
      ],
    },
    stats: {
      sampleSize: {
        value: '760',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.001',
        label: 'Noninferiority'
      },
      effectSize: {
        value: '+2.3%',
        label: 'Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Multicenter, open-label, blinded-endpoint randomized noninferiority trial',
        'Minor nondisabling acute ischemic stroke within 4.5 hours',
        'DAPT vs IV alteplase'
      ],
      timeline: 'China; October 2018 to April 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 93.8,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'DAPT'
      },
      control: {
        percentage: 91.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'Clopidogrel plus aspirin followed by guideline-based antiplatelet therapy',
      control: 'IV alteplase 0.9 mg/kg followed by delayed antiplatelet therapy'
    },
    clinicalContext: 'For minor nondisabling stroke, the net value of thrombolysis has always been uncertain because the baseline prognosis is good and even low rates of hemorrhage matter. ARAMIS directly challenged the assumption that alteplase is needed in this subgroup.',
    pearls: [
      'DAPT was noninferior to alteplase in minor nondisabling stroke',
      'Excellent 90-day outcome was very high in both groups: 93.8% vs 91.4%',
      'Symptomatic intracranial hemorrhage remained rare and numerically lower with DAPT: 0.3% vs 0.9%',
      'ARAMIS complements PRISMS by strengthening the case against routine alteplase for clearly nondisabling deficits'
    ],
    conclusion: '',
    source: 'Chen HS, et al. (JAMA 2023)',
    doi: '10.1001/jama.2023.7827',
    clinicalTrialsId: 'NCT03661411',
    trialResult: 'NEUTRAL',
    safetyProfile: {
      sICH: {
        evt: 0.3,
        control: 0.9,
        label: 'Symptomatic intracranial hemorrhage at 24 hours',
        color: 'success',
        tooltip: 'sICH was numerically lower with DAPT (0.3% vs 0.9%), consistent with an antithrombotic approach without plasminogen activation.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Dual antiplatelet therapy vs alteplase for minor nondisabling stroke; non-inferiority confirmed.',
    inclusionCriteria: [
      'Acute minor nondisabling ischemic stroke (not causing significant disability)',
      'NIHSS ≤5 at presentation',
      'Treatable within 4.5 hours of onset',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Disabling stroke (significant functional impairment)',
      'Prior use of antiplatelet or anticoagulant therapy',
      'Contraindication to clopidogrel or aspirin',
      'Planned IV alteplase treatment',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 (excellent outcome) at 90 days in patients with minor nondisabling acute ischemic stroke. DAPT reached 93.8 per 100 patients; alteplase reached 91.4. The 2.4 pp difference favors DAPT numerically, and non-inferiority was confirmed (NI P<0.001).',
      },
      {
        question: 'Why are both rates so high?',
        answer: 'Minor nondisabling stroke has a good baseline prognosis — most patients recover regardless of treatment. This is precisely why thrombolysis was uncertain in this population: when baseline outcomes are already excellent, even a low rate of alteplase-related sICH (0.9%) tips the benefit-risk balance unfavorably.',
      },
      {
        question: 'Does DAPT superiority follow from these rates?',
        answer: 'No. ARAMIS was a non-inferiority trial. The numerically higher DAPT rate is consistent with NI, not with proven superiority. The superiority P-value was not separately reported. The conclusion is that DAPT is a safe alternative to alteplase for clearly nondisabling deficits, not that it is better.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with minor nondisabling acute ischemic stroke treated within 4.5 hours, dual antiplatelet therapy showed non-inferiority to IV alteplase for excellent functional outcome at 90 days within the prespecified margin of −3 percentage points (DAPT 93.8% vs alteplase 91.4%, RD +2.4 pp, NI P<0.001), with lower sICH (0.3% vs 0.9%).',
      doesNotProve: 'ARAMIS does not prove DAPT is superior to alteplase. It does not apply to patients with disabling neurological deficits, where alteplase retains standard-of-care status. The benefit may be partly driven by avoiding alteplase-associated sICH in a population with otherwise-favorable prognosis.',
      cautions: 'Open-label design. The enrolled population had NIHSS ≤5 with nondisabling deficits — not the typical thrombolysis candidate. ARAMIS complements but does not replace alteplase for patients with disabling stroke. Results require careful patient selection to apply correctly in practice.',
    },
    bedsidePearl: 'ARAMIS showed DAPT is non-inferior to alteplase for minor nondisabling stroke (NNT context: both arms excellent, 93.8% vs 91.4%). The key bedside application: for clearly minor, nondisabling deficits within 4.5 hours, DAPT is a reasonable alternative that avoids the 0.9% sICH risk of alteplase. Do not apply to disabling stroke.',
    bottomLineSummary: 'In patients with minor nondisabling acute ischemic stroke, DAPT was non-inferior to IV alteplase for excellent 90-day outcome (93.8% vs 91.4%, RD +2.4 pp, NI P<0.001), with lower sICH (0.3% vs 0.9%). ARAMIS supports DAPT as an alternative to thrombolysis for clearly nondisabling deficits but does not displace alteplase for disabling stroke.',
  },
  'attest-2-trial': {
    id: 'attest-2-trial',
    title: 'ATTEST-2 Trial',
    subtitle: 'Tenecteplase vs Alteplase Within 4.5 Hours',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'not-met',
    secondaryDesign: 'noninferiority',
    secondaryResult: 'noninferiority-established',
    stats: {
      sampleSize: {
        value: '1777',
        label: 'Treated Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.0001',
        label: 'Noninferiority'
      },
      effectSize: {
        value: 'OR 1.07',
        label: 'Ordinal OR'
      }
    },
    trialDesign: {
      type: [
        'Prospective, randomized, parallel-group, open-label trial with masked endpoints',
        'Tenecteplase 0.25 mg/kg vs alteplase 0.9 mg/kg',
        '39 UK stroke centres'
      ],
      timeline: 'United Kingdom; January 2017 to May 2023'
    },
    efficacyResults: {
      treatment: {
        percentage: 44,
        label: 'Excellent neurological recovery (mRS 0-1) at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 42,
        label: 'Excellent neurological recovery (mRS 0-1) at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'ATTEST-2 was designed as a large UK confirmatory trial after earlier tenecteplase studies suggested workflow advantages and at least similar efficacy compared with alteplase.',
    pearls: [
      'Tenecteplase was noninferior, but not superior, to alteplase for 90-day ordinal mRS distribution',
      'Excellent recovery occurred in 44% vs 42%',
      'Mortality was identical at about 8% in both groups',
      'This large UK cohort confirms tenecteplase and alteplase are interchangeable at 0.25 mg/kg'
    ],
    conclusion: '',
    source: 'Muir KW, et al. (Lancet Neurol 2024)',
    doi: '10.1016/S1474-4422(24)00377-6',
    clinicalTrialsId: 'NCT02814409',
    trialResult: 'NEUTRAL',
    resultSubtype: 'non-inferiority' as const,
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'Acute ischemic stroke eligible for IV thrombolysis',
      'Within 4.5 hours of onset',
      'Age 18 or older',
      'NIHSS 4 or higher, or disabling deficit',
    ],
    exclusionCriteria: [
      'Standard thrombolysis contraindications',
      'Prior thrombolysis within 3 months',
      'Significant anticoagulation',
    ],
    mrsDistribution: [
      { arm: 'Tenecteplase 0.25 mg/kg', n: 889, pct: [15, 30, 24, 12, 9, 3, 8] },
      { arm: 'Alteplase 0.9 mg/kg', n: 888, pct: [15, 28, 22, 14, 8, 4, 9] },
    ],
    ordinalStats: { commonOR: 1.07, ciLow: 0.90, ciHigh: 1.27, direction: 'positive' as const },
    bedsidePearl: 'ATTEST-2 is the largest UK trial confirming that tenecteplase 0.25 mg/kg is noninferior to alteplase 0.9 mg/kg for standard-window IVT (NI p<0.0001). The single-bolus dosing advantage is now validated across three major trials (AcT, TRACE-2, ATTEST-2). Symptomatic ICH and mortality were identical in both arms. For centers transitioning to tenecteplase, ATTEST-2 provides reassurance that this is a direct substitution, not a clinical downgrade.',
    bottomLineSummary: 'In 1777 treated patients across 39 UK stroke centres, tenecteplase 0.25 mg/kg was noninferior to alteplase 0.9 mg/kg for 90-day mRS distribution (adjusted OR 1.07, 95% CI 0.90-1.27; NI p<0.0001). Superiority was not demonstrated. mRS 0-1 was achieved in 44% vs 42%. Mortality was approximately 8% in both groups. Together with AcT and TRACE-2, ATTEST-2 firmly establishes tenecteplase 0.25 mg/kg as a noninferior replacement for alteplase in standard-window IVT.',
  },
  'nor-test-trial': {
    id: 'nor-test-trial',
    title: 'NOR-TEST Trial',
    subtitle: 'Tenecteplase 0.4 mg/kg vs Alteplase',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-not-established',
    applicability: {
      doseSpecific: '0.4 mg/kg tenecteplase — not the standard 0.25 mg/kg stroke dose',
      populationExclusions: [
        'Evidence for 0.25 mg/kg tenecteplase — different dose, different evidence base',
        'Severe stroke patients — mild cohort (median NIHSS 4, ~17% mimics)',
      ],
    },
    stats: {
      sampleSize: {
        value: '1100',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.52',
        label: 'Not Superior'
      },
      effectSize: {
        value: 'OR 1.08',
        label: 'Odds Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, randomized, open-label, blinded-endpoint superiority trial',
        'Tenecteplase 0.4 mg/kg vs alteplase 0.9 mg/kg',
        'Included wake-up stroke and bridging patients'
      ],
      timeline: 'Norway; September 2012 to September 2016'
    },
    efficacyResults: {
      treatment: {
        percentage: 64,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 63,
        label: 'Excellent outcome (mRS 0-1) at 3 months',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.4 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'NOR-TEST was an early large tenecteplase phase 3 study, but its interpretation was complicated by a cohort dominated by mild stroke and stroke mimics, which limited its ability to clarify performance in more severe stroke.',
    pearls: [
      'Tenecteplase 0.4 mg/kg was not superior to alteplase',
      'Most patients had mild stroke, with median NIHSS 4',
      'Serious adverse events and mortality were similar between groups',
      'The neutral result in mild stroke raised concern about whether the 0.4 mg/kg dose was adequate for more severe stroke'
    ],
    conclusion: '',
    source: 'Logallo N, et al. (Lancet Neurol 2017)',
    doi: '10.1016/S1474-4422(17)30253-3',
    clinicalTrialsId: 'NCT01949948',
    trialResult: 'NEUTRAL',
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase 0.4 mg/kg vs alteplase; not superior in a predominantly mild-stroke cohort.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours',
      'Standard thrombolysis criteria met',
      'NIHSS ≥2 (broad eligibility; most enrolled had NIHSS ≤4)',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Contraindication to thrombolysis',
      'Hemorrhagic stroke on baseline imaging',
      'Severe stroke (high NIHSS) — enrolled in small numbers',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 3 months. Tenecteplase reached 64 per 100; alteplase 63. The 1% absolute difference and OR 1.08 (95% CI 0.84-1.38) show no meaningful difference. The trial tested superiority and did not find it (P=0.52).',
      },
      {
        question: 'Why did NOR-TEST fail to show superiority?',
        answer: 'The enrolled population had median NIHSS 4 — very mild stroke. With a baseline excellent-outcome rate of 63%, the ceiling effect was substantial. Even an effective treatment would struggle to show improvement. NOR-TEST is considered underpowered to detect benefit in more severe stroke.',
      },
      {
        question: 'How does NOR-TEST relate to NOR-TEST 2?',
        answer: 'NOR-TEST used 0.4 mg/kg and enrolled mainly mild stroke — null result. NOR-TEST 2 (Part A) tested the same 0.4 mg/kg dose in moderate-severe stroke and had to be stopped for harm. Together, they establish that 0.4 mg/kg is not the right dose: it does not improve mild stroke and causes harm in severe stroke.',
      },
    ],
    howToInterpret: {
      proves: 'In a predominantly mild-stroke population (median NIHSS 4) treated within 4.5 hours, tenecteplase 0.4 mg/kg was not superior to alteplase 0.9 mg/kg for excellent functional outcome at 3 months (64% vs 63%, OR 1.08, 95% CI 0.84-1.38, P=0.52).',
      doesNotProve: 'NOR-TEST does not prove tenecteplase is equivalent to alteplase — it was a superiority trial, not an NI trial. Nor does it prove tenecteplase is safe in moderate-severe stroke. The mild case mix substantially limits the interpretability of the efficacy estimate.',
      cautions: 'The case mix (median NIHSS 4) was dominated by mild and potentially nondisabling stroke, including possible stroke mimics. This severely limits the ability to generalize results to the broader thrombolysis population. The 0.4 mg/kg dose has since been shown harmful in NOR-TEST 2 Part A and is not the dose used in contemporary practice.',
    },
    bedsidePearl: 'NOR-TEST tested tenecteplase 0.4 mg/kg in predominantly mild stroke and found no benefit — but the case mix was too mild to show it even if it existed. The 0.4 mg/kg dose is not used in current practice; guideline-endorsed dose is 0.25 mg/kg. NOR-TEST is historically important context for NOR-TEST 2 Part A (harm signal at 0.4 mg/kg in moderate-severe stroke).',
    bottomLineSummary: 'NOR-TEST found tenecteplase 0.4 mg/kg was not superior to alteplase for mRS 0-1 at 3 months in a predominantly mild-stroke cohort (64% vs 63%, OR 1.08, P=0.52). The mild case mix limits interpretability, and the 0.4 mg/kg dose was subsequently shown harmful in moderate-severe stroke in NOR-TEST 2 Part A.',
  },
  'nor-test-2-part-a-trial': {
    id: 'nor-test-2-part-a-trial',
    title: 'NOR-TEST 2 (Part A)',
    subtitle: 'Tenecteplase 0.4 mg/kg vs Alteplase in Moderate-Severe Stroke',
    category: 'Neuro Trials',
    primaryDesign: 'dose-finding-safety',
    primaryResult: 'harm-stopped',
    applicability: {
      doseSpecific: '0.4 mg/kg tenecteplase — HARM SIGNAL at this dose in moderate-severe stroke',
      populationExclusions: [
        '0.25 mg/kg tenecteplase — this harm does NOT apply to the standard dose',
        'Do not use to justify any dose of tenecteplase in moderate-severe stroke without further evidence',
      ],
    },
    stats: {
      sampleSize: {
        value: '204',
        label: 'Modified ITT Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 3 Months'
      },
      pValue: {
        value: '0.0064',
        label: 'Worse with Tenecteplase'
      },
      effectSize: {
        value: 'OR 0.45',
        label: 'Odds Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, randomized, open-label, blinded-endpoint noninferiority trial',
        'Moderate to severe acute ischemic stroke only',
        'Stopped early for safety at tenecteplase 0.4 mg/kg'
      ],
      timeline: 'Norway; October 2019 to September 2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 32,
        label: 'Favorable outcome (mRS 0-1) at 3 months',
        name: 'Tenecteplase 0.4 mg/kg'
      },
      control: {
        percentage: 51,
        label: 'Favorable outcome (mRS 0-1) at 3 months',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.4 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'NOR-TEST 2 was launched to answer the question NOR-TEST could not: how does tenecteplase 0.4 mg/kg perform in patients with genuinely moderate or severe ischemic stroke? The answer was concerning enough that the trial stopped early.',
    pearls: [
      'Tenecteplase 0.4 mg/kg performed worse than alteplase in moderate-severe stroke',
      'Any intracranial hemorrhage was substantially higher with tenecteplase: 21% vs 7%',
      'Mortality was also higher: 16% vs 5%',
      'NOR-TEST 2 was the key signal that the 0.4 mg/kg dose is too high for routine acute stroke use'
    ],
    conclusion: '',
    source: 'Kvistad CE, et al. (Lancet Neurol 2022)',
    doi: '10.1016/S1474-4422(22)00124-7',
    clinicalTrialsId: 'NCT03854500',
    trialResult: 'HARM',
    safetyProfile: {
      sICH: {
        evt: 6,
        control: 1,
        label: 'Symptomatic intracranial hemorrhage',
        color: 'danger',
        tooltip: 'sICH was 6× higher with tenecteplase 0.4 mg/kg (6% vs 1%), the primary safety signal that prompted DSMB-mandated trial termination.',
      },
      mortality: {
        evt: 16,
        control: 5,
        label: 'Mortality at 3 months',
        color: 'danger',
        tooltip: 'Mortality was 3× higher with tenecteplase 0.4 mg/kg (16% vs 5%). This finding was the key harm signal alongside the sICH excess.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase 0.4 mg/kg vs alteplase in moderate-severe stroke; STOPPED FOR HARM; sICH 6x higher, mortality 3x higher.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours of onset',
      'NIHSS ≥6 (moderate-severe stroke only)',
      'Standard thrombolysis criteria met',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Mild stroke (NIHSS <6) — enrolled in NOR-TEST, not NOR-TEST 2',
      'Contraindication to IV thrombolysis',
      'Hemorrhagic transformation or large established infarct on baseline imaging',
    ],
    howToReadChart: [
      {
        question: 'What does this chart show?',
        answer: 'mRS 0-1 at 3 months. Alteplase (control) reached 51 per 100; tenecteplase 0.4 mg/kg (treatment) reached only 32 per 100. This 19 percentage point gap (OR 0.45, P=0.006) was the efficacy signal that reinforced the DSMB safety findings and led to trial termination.',
      },
      {
        question: 'Why does the control arm have the winning accent?',
        answer: 'Standard-dose alteplase was clearly the better treatment in this trial. Tenecteplase 0.4 mg/kg caused substantially more harm (sICH 6% vs 1%, mortality 16% vs 5%) and worse functional outcomes. The control arm represents the safer, more effective therapy in this comparison.',
      },
      {
        question: 'How does this harm square with the 0.25 mg/kg NI results?',
        answer: 'Dose matters. The 0.25 mg/kg dose (used in AcT, TRACE-2, ATTEST-2) consistently showed safety similar to alteplase. The 0.4 mg/kg dose in NOR-TEST 2 caused clear harm in moderate-severe stroke. NOR-TEST 2 Part A effectively closes the question on 0.4 mg/kg: it is too high.',
      },
    ],
    howToInterpret: {
      proves: 'STOPPED FOR HARM. In patients with moderate-to-severe acute ischemic stroke (NIHSS ≥6) treated within 4.5 hours, tenecteplase 0.4 mg/kg was inferior to standard-dose alteplase for excellent functional outcome (32% vs 51%, OR 0.45, 95% CI 0.25-0.82, P=0.006), with 6× higher sICH (6% vs 1%) and 3× higher mortality (16% vs 5%). The DSMB terminated the trial early for safety.',
      doesNotProve: 'NOR-TEST 2 Part A does not prove that tenecteplase at any dose is harmful. The harm was specific to the 0.4 mg/kg dose in moderate-severe stroke. It does not apply to tenecteplase 0.25 mg/kg, which has been validated as safe and non-inferior to alteplase in multiple large RCTs.',
      cautions: 'N=204 (stopped early), so estimates are imprecise. The trial was designed as a non-inferiority study for the 0.4 mg/kg dose; the harm signal emerged despite, not because of, the NI framing. The confidence interval for OR (0.25-0.82) does not cross 1.0, making the harm finding robust despite small sample size.',
    },
    bedsidePearl: 'NOR-TEST 2 Part A is a clear harm signal: tenecteplase 0.4 mg/kg in moderate-severe stroke caused 6× more sICH and 3× more deaths than alteplase. The 0.4 mg/kg dose is not used in practice. Current guidelines endorse tenecteplase 0.25 mg/kg as a safe alternative based on entirely separate trials (AcT, TRACE-2). Do not conflate the doses.',
    bottomLineSummary: 'NOR-TEST 2 Part A was stopped early for harm after tenecteplase 0.4 mg/kg showed substantially worse outcomes than alteplase in moderate-severe stroke: mRS 0-1 32% vs 51%, sICH 6% vs 1%, and mortality 16% vs 5%. The 0.4 mg/kg dose is contraindicated. This trial does not affect the safety profile of tenecteplase 0.25 mg/kg.',
  },
  'prisms-trial': {
    id: 'prisms-trial',
    title: 'PRISMS Trial',
    subtitle: 'Alteplase vs Aspirin in Minor Nondisabling Stroke',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'futility-stopped',
    applicability: {
      populationExclusions: [
        'Disabling minor stroke — PRISMS enrolled nondisabling deficits only (mRS ≤1 at baseline)',
        'Results stopped early at 33% of planned enrollment — certainty limited',
      ],
    },
    stats: {
      sampleSize: {
        value: '313',
        label: 'Enrolled Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NS',
        label: 'No Benefit'
      },
      effectSize: {
        value: '-1.1%',
        label: 'Adjusted Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Phase 3b, double-blind, double-placebo randomized trial',
        'Minor nondisabling stroke within 3 hours',
        'IV alteplase vs aspirin'
      ],
      timeline: 'United States; May 2014 to December 2016'
    },
    efficacyResults: {
      treatment: {
        percentage: 78.2,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Alteplase'
      },
      control: {
        percentage: 81.5,
        label: 'Favorable outcome (mRS 0-1) at 90 days',
        name: 'Aspirin'
      }
    },
    intervention: {
      treatment: 'IV alteplase 0.9 mg/kg plus oral placebo',
      control: 'Aspirin 325 mg plus IV placebo'
    },
    clinicalContext: 'PRISMS directly addressed one of the most common thrombolysis gray zones: patients with very mild symptoms that are not clearly disabling. The question is whether tPA meaningfully improves outcome enough to justify hemorrhage risk.',
    pearls: [
      'Alteplase did not improve 90-day favorable outcome over aspirin',
      'Symptomatic intracranial hemorrhage occurred only in the alteplase arm: 3.2% vs 0%',
      'The trial was stopped early and therefore underpowered, but its direction did not favor alteplase',
      'PRISMS is the best randomized evidence against routine alteplase in clearly nondisabling deficits'
    ],
    conclusion: '',
    source: 'Khatri P, et al. (JAMA 2018)',
    doi: '10.1001/jama.2018.8496',
    clinicalTrialsId: 'NCT02072226',
    trialResult: 'NEGATIVE',
    safetyProfile: {
      sICH: {
        evt: 3.2,
        control: 0,
        label: 'Symptomatic intracranial hemorrhage',
        color: 'danger',
        tooltip: 'sICH occurred in 3.2% of alteplase-treated patients and 0% of aspirin-treated patients. This hemorrhagic risk with no efficacy benefit is the core finding against routine alteplase in nondisabling minor stroke.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Alteplase vs aspirin for minor nondisabling stroke; no efficacy benefit with sICH signal; stopped early at 33%.',
    inclusionCriteria: [
      'Minor ischemic stroke not causing significant disability',
      'NIHSS ≤5 at enrollment',
      'Treatable within 3 hours of symptom onset',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Disabling neurological deficits (significant motor, language, or visual impairment)',
      'NIHSS >5',
      'Prior stroke with residual deficits',
      'Contraindication to alteplase or aspirin',
    ],
    howToReadChart: [
      {
        question: 'What does this chart show?',
        answer: 'mRS 0-1 at 90 days. Aspirin (control) reached 81.5 per 100; alteplase (treatment) reached only 78.2. The adjusted risk difference was −1.1% (95% CI −5.6 to +3.4%), not statistically significant. Aspirin arm had marginally better outcomes and zero sICH.',
      },
      {
        question: 'Why does the aspirin (control) arm have the winning accent?',
        answer: 'Aspirin numerically outperformed alteplase and had zero sICH versus 3.2% for alteplase. In a population with excellent baseline prognosis (81.5% excellent outcome on aspirin), alteplase added bleeding risk without measurable functional benefit. The aspirin arm represents the better net-benefit option.',
      },
      {
        question: 'Can we conclude alteplase is harmful in minor stroke?',
        answer: 'PRISMS was stopped at 33% of its planned sample (313 of 948 patients), leaving it severely underpowered. Findings should be interpreted as inconclusive rather than definitively negative — the direction disfavors alteplase but the true effect cannot be established from this underpowered sample. The sICH signal is the most interpretable finding.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with minor nondisabling acute ischemic stroke treated within 3 hours, alteplase 0.9 mg/kg did not improve excellent functional outcome at 90 days versus aspirin (78.2% vs 81.5%, adjusted RD −1.1%, 95% CI −5.6 to +3.4%, P not significant), with symptomatic intracranial hemorrhage occurring only in the alteplase arm (3.2% vs 0%).',
      doesNotProve: 'PRISMS does not definitively prove that alteplase is harmful or ineffective in minor stroke — the trial was stopped at 33% enrollment and was severely underpowered for its primary endpoint. It also does not apply to patients with disabling stroke, where alteplase retains a strong evidence base.',
      cautions: 'The trial was stopped early after the steering committee determined it was unlikely to achieve its primary endpoint — not for a formal safety finding. At 33% enrollment, findings are inconclusive rather than definitively negative; the observed direction may not represent the true effect. The sICH signal (3.2% vs 0%) is the most robust finding and aligns with the known hemorrhagic risk of alteplase.',
    },
    bedsidePearl: 'PRISMS tested alteplase vs aspirin in minor nondisabling stroke and found no functional benefit with a 3.2% sICH rate vs 0% for aspirin. The trial was underpowered (stopped at 33%), so findings are inconclusive rather than definitively negative. In clinical practice: for clearly nondisabling minor stroke, shared decision-making about thrombolysis is appropriate, with aspirin or DAPT as reasonable alternatives.',
    bottomLineSummary: 'PRISMS found no functional benefit of alteplase over aspirin in minor nondisabling stroke (78.2% vs 81.5%, adjusted RD −1.1%, NS) and a 3.2% sICH rate versus 0% for aspirin. The trial was stopped at 33% enrollment and results are inconclusive for the primary endpoint. The sICH signal supports caution about routine thrombolysis for clearly nondisabling deficits.',
  },
  'prost-trial': {
    id: 'prost-trial',
    title: 'PROST Trial',
    subtitle: 'Recombinant Human Prourokinase vs Alteplase',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'rhPro-UK is not approved in US or EU — requires regulatory clearance before clinical use',
        'Broad NI margin — requires independent external validation',
      ],
    },
    stats: {
      sampleSize: {
        value: '663',
        label: 'Modified ITT Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NI Met',
        label: 'Noninferiority'
      },
      effectSize: {
        value: '+0.9%',
        label: 'Risk Difference'
      }
    },
    trialDesign: {
      type: [
        'Randomized, alteplase-controlled, open-label phase 3 trial',
        'rhPro-UK vs alteplase within 4.5 hours',
        '35 centres in China'
      ],
      timeline: 'China; May 2018 to May 2020'
    },
    efficacyResults: {
      treatment: {
        percentage: 65.2,
        label: 'mRS 0-1 at 90 days',
        name: 'rhPro-UK'
      },
      control: {
        percentage: 64.3,
        label: 'mRS 0-1 at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'Intravenous recombinant human prourokinase',
      control: 'Intravenous alteplase 0.9 mg/kg'
    },
    clinicalContext: 'PROST addressed the need for thrombolytic alternatives to alteplase, especially in regions where supply, cost, or bleeding profile may matter. Recombinant human prourokinase had shown promise in phase 2 testing.',
    pearls: [
      'rhPro-UK was noninferior to alteplase for excellent 90-day outcome',
      'Symptomatic intracranial hemorrhage was similar: 1.5% vs 1.8%',
      'Systemic bleeding was markedly lower with rhPro-UK: 25.8% vs 42.2%',
      'PROST showed a viable fibrinolytic alternative beyond tenecteplase, with lower systemic bleeding'
    ],
    conclusion: '',
    source: 'PROST Investigators (JAMA Netw Open 2023)',
    doi: '10.1001/jamanetworkopen.2023.25415',
    trialResult: 'NEUTRAL',
    safetyProfile: {
      sICH: {
        evt: 1.5,
        control: 1.8,
        label: 'Symptomatic intracranial hemorrhage at 90 days',
        color: 'success',
        tooltip: 'sICH was similar and numerically lower with rhPro-UK (1.5% vs 1.8%, P>0.99). Systemic bleeding was significantly lower: 25.8% vs 42.2%.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Recombinant human prourokinase vs alteplase within 4.5 hours; non-inferiority confirmed with lower systemic bleeding.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours of onset',
      'Age 18 to 80 years',
      'Standard thrombolysis criteria met',
      'NIHSS assessed at baseline',
    ],
    exclusionCriteria: [
      'Hemorrhagic stroke or large established infarct on baseline imaging',
      'Contraindication to IV thrombolysis',
      'Severe hepatic or renal impairment',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 90 days. rhPro-UK reached 65.2 per 100 patients; alteplase 64.3. The risk difference of 0.89 pp (95.4% CI −6.52 to +8.29%) is well within the prespecified NI margin of 10 percentage points, confirming non-inferiority.',
      },
      {
        question: 'Why is the CI so wide?',
        answer: 'The NI margin for PROST was relatively generous at 10%, reflecting the early-phase nature of the trial. N=663 provides adequate power for NI within this wide margin but would be underpowered for a more stringent margin (e.g., −5%). PROST-2 (N=1552) confirmed NI with a tighter estimate.',
      },
      {
        question: 'What makes rhPro-UK distinctive from tenecteplase?',
        answer: 'rhPro-UK is a fibrin-specific plasminogen activator that acts mainly at the thrombus site, reducing systemic fibrinogen depletion. PROST showed systemic bleeding (25.8% vs 42.2%) was dramatically lower with rhPro-UK — not a trivial safety advantage in patients at risk of systemic complications.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with acute ischemic stroke treated within 4.5 hours, recombinant human prourokinase (rhPro-UK) showed non-inferiority to alteplase for excellent functional outcome at 90 days within the prespecified 10 percentage point margin (65.2% vs 64.3%, RD +0.89 pp, 95.4% CI −6.52 to +8.29, NI met). Systemic bleeding was significantly lower with rhPro-UK (25.8% vs 42.2%, P<0.001).',
      doesNotProve: 'PROST does not prove rhPro-UK is superior to alteplase for functional outcomes. The NI margin of 10% is wider than used in most modern NI thrombolysis trials. PROST is a Chinese single-country trial; generalizability to other populations and health systems is uncertain.',
      cautions: 'Open-label design. The NI margin of 10 pp is generous — a 10% absolute difference in mRS 0-1 outcomes would be clinically significant. PROST-2 used a tighter NI margin and larger sample (N=1552), providing more definitive evidence. rhPro-UK is not yet approved outside China.',
    },
    bedsidePearl: 'PROST showed rhPro-UK was non-inferior to alteplase with dramatically lower systemic bleeding (25.8% vs 42.2%). For patients at high risk of systemic complications (active GI ulcer, recent surgery, coagulopathy), rhPro-UK may offer a meaningful safety advantage if approved in your setting. Confirmed and expanded in PROST-2.',
    bottomLineSummary: 'PROST demonstrated non-inferiority of rhPro-UK to alteplase for excellent 90-day outcome in acute ischemic stroke within 4.5 hours (65.2% vs 64.3%, RD +0.89 pp). Systemic bleeding was significantly lower with rhPro-UK (25.8% vs 42.2%). Results confirmed and expanded in PROST-2 (N=1552).',
  },
  'prost-2-trial': {
    id: 'prost-2-trial',
    title: 'PROST-2 Trial',
    subtitle: 'Large Phase 3 Prourokinase vs Alteplase Trial',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'rhPro-UK is not approved in US or EU — regulatory availability required',
      ],
    },
    stats: {
      sampleSize: {
        value: '1552',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '<0.0001',
        label: 'Noninferiority'
      },
      effectSize: {
        value: 'RR 1.04',
        label: 'Risk Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, open-label, noninferiority randomized trial',
        'Patients ineligible for or refusing EVT',
        'Prourokinase vs alteplase within 4.5 hours'
      ],
      timeline: 'China; January 2023 to March 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 72.0,
        label: 'mRS 0-1 at 90 days',
        name: 'Prourokinase'
      },
      control: {
        percentage: 68.7,
        label: 'mRS 0-1 at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'Recombinant human prourokinase 15 mg bolus plus 20 mg infusion over 30 minutes',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'PROST-2 expanded the prourokinase evidence base into a much larger phase 3 population, with particular relevance during global thrombolytic shortages and for patients who are not EVT candidates.',
    pearls: [
      'Prourokinase was noninferior to alteplase for excellent functional outcome',
      'Symptomatic intracranial hemorrhage was lower: 0.3% vs 1.3%',
      'Major bleeding at 7 days was also lower: 0.5% vs 2.1%',
      'PROST-2 suggests prourokinase may be both a supply alternative and a potentially cleaner bleeding-profile option'
    ],
    conclusion: '',
    source: 'PROST-2 Investigators (Lancet Neurol 2024)',
    doi: '10.1016/S1474-4422(24)00436-8',
    clinicalTrialsId: 'NCT05700591',
    trialResult: 'NEUTRAL',
    safetyProfile: {
      sICH: {
        evt: 0.3,
        control: 1.3,
        label: 'Symptomatic intracranial hemorrhage',
        color: 'success',
        tooltip: 'sICH was significantly lower with prourokinase (0.3% vs 1.3%), a key safety advantage alongside lower major bleeding (0.5% vs 2.1%).',
      },
      majorBleeding: {
        evt: 0.5,
        control: 2.1,
        label: 'Major bleeding at 7 days',
        color: 'success',
        tooltip: 'Major bleeding was significantly lower with prourokinase (0.5% vs 2.1%), consistent with its fibrin-specific mechanism limiting systemic plasminogen activation.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Prourokinase vs alteplase (N=1552) within 4.5 hours; non-inferiority with better safety profile confirmed.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours of onset',
      'Ineligible for or refusing endovascular thrombectomy',
      'Standard thrombolysis criteria met',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Eligible for and agreeing to endovascular thrombectomy',
      'Hemorrhagic stroke or large infarct core on baseline imaging',
      'Contraindication to IV thrombolysis',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 90 days. Prourokinase reached 72.0 per 100; alteplase 68.7. The risk ratio 1.04 (lower bound above the prespecified NI margin of 0.93) confirms non-inferiority. The 3.3 pp numerical advantage is consistent with NI but superiority was not separately tested.',
      },
      {
        question: 'Why was the NI margin set at RR 0.93?',
        answer: 'A risk ratio NI margin of 0.93 means prourokinase must achieve at least 93% of alteplase\'s efficacy. With alteplase achieving 68.7%, this requires prourokinase to reach at least 63.9% — and it reached 72.0%, far exceeding the margin. PROST-2 provides strong NI evidence with a rigorous margin.',
      },
      {
        question: 'How does PROST-2 build on PROST?',
        answer: 'PROST-2 enrolled 1552 patients (vs 663 in PROST), used a stricter NI margin (RR ≥0.93 vs RD ≤10%), and confirmed sICH was lower (0.3% vs 1.3%) and major bleeding lower (0.5% vs 2.1%). PROST-2 is the definitive prourokinase trial; PROST was the Phase 3 pilot.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with acute ischemic stroke within 4.5 hours who were ineligible for or refusing EVT, prourokinase showed non-inferiority to alteplase within the prespecified RR margin of 0.93 for excellent functional outcome at 90 days (72.0% vs 68.7%, RR 1.04, NI P<0.0001), with lower sICH (0.3% vs 1.3%) and lower major bleeding (0.5% vs 2.1%).',
      doesNotProve: 'PROST-2 does not prove prourokinase is superior to alteplase for functional outcomes. It does not establish whether prourokinase is beneficial as a bridging agent before EVT. Trial was conducted exclusively in China; generalizability to other populations is uncertain.',
      cautions: 'Open-label design. The population was restricted to patients ineligible for or refusing EVT, limiting generalizability to the broader thrombolysis population. Prourokinase is not approved outside of China. The regulatory pathway to broad clinical use is unclear.',
    },
    bedsidePearl: 'PROST-2 confirmed prourokinase as non-inferior to alteplase with better safety: sICH 0.3% vs 1.3% and major bleeding 0.5% vs 2.1%. It is currently available only in China. For clinicians in systems where prourokinase is approved, PROST-2 supports it as a first-line IVT alternative — particularly when minimizing bleeding is a priority.',
    bottomLineSummary: 'PROST-2 demonstrated non-inferiority of prourokinase to alteplase for excellent 90-day outcome in EVT-ineligible stroke patients (72.0% vs 68.7%, RR 1.04, NI P<0.0001), with significantly lower sICH (0.3% vs 1.3%) and major bleeding (0.5% vs 2.1%). Results confirm and extend PROST, but are currently applicable only in China where prourokinase is approved.',
  },
  'raise-trial': {
    id: 'raise-trial',
    title: 'RAISE Trial',
    subtitle: 'Reteplase vs Alteplase for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    primaryDesign: 'binary-superiority',
    primaryResult: 'met',
    applicability: {
      geography: 'China',
      populationExclusions: [
        'Reteplase is not approved in the US or EU — regulatory availability required',
        'Higher sICH rate than alteplase (3.1% vs 2.0%) warrants caution outside trial context',
      ],
    },
    stats: {
      sampleSize: {
        value: '1412',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.002',
        label: 'Superior to Alteplase'
      },
      effectSize: {
        value: 'RR 1.13',
        label: 'Risk Ratio'
      }
    },
    trialDesign: {
      type: [
        'Randomized controlled superiority trial',
        'Reteplase double bolus vs alteplase infusion',
        'Treatment within 4.5 hours'
      ],
      timeline: 'China; NEJM 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 79.5,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Reteplase'
      },
      control: {
        percentage: 70.4,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV reteplase 18 mg bolus followed by a second 18 mg bolus 30 minutes later',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'RAISE tested whether reteplase, a fibrinolytic already familiar in cardiology, could outperform alteplase in early ischemic stroke while preserving acceptable safety.',
    pearls: [
      'Reteplase improved excellent functional outcome over alteplase: 79.5% vs 70.4%',
      'Symptomatic intracranial hemorrhage was similar: 2.4% vs 2.0%',
      'Any intracranial hemorrhage and overall adverse events were higher with reteplase',
      'RAISE is one of the most provocative recent IVT trials because it suggests a thrombolytic may exceed alteplase rather than simply match it'
    ],
    conclusion: '',
    source: 'Li S, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2400314',
    clinicalTrialsId: 'NCT05295173',
    trialResult: 'POSITIVE',
    safetyProfile: {
      sICH: {
        evt: 2.4,
        control: 2.0,
        label: 'Symptomatic intracranial hemorrhage within 36 hours',
        color: 'warning',
        tooltip: 'sICH was similar between arms (RR 1.21, 95% CI 0.54-2.75, P not significant). Any intracranial hemorrhage at 90 days was higher with reteplase (7.7% vs 4.9%, RR 1.59, 95% CI 1.00-2.51).',
      },
      adverseEvents: {
        evt: 91.6,
        control: 82.4,
        label: 'Any adverse events',
        color: 'warning',
        tooltip: 'Overall adverse events were higher with reteplase (91.6% vs 82.4%, RR 1.11, 95% CI 1.03-1.20). Any intracranial hemorrhage was 7.7% vs 4.9%.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Reteplase double-bolus vs alteplase; superior for mRS 0-1 but higher ICH and adverse event rates.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours of onset',
      'Standard IV thrombolysis criteria met',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'Contraindication to thrombolysis',
      'Hemorrhagic stroke on baseline imaging',
      'Severe hepatic impairment or known bleeding diathesis',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 90 days. Reteplase reached 79.5 per 100 patients; alteplase 70.4. The risk ratio 1.13 (95% CI 1.05-1.21) was significant for both non-inferiority (P<0.001) and superiority (P=0.002). This is one of the few IVT trials where a new agent was statistically superior to alteplase.',
      },
      {
        question: 'Why is the delta band wide despite the high rates?',
        answer: 'The 9.1 percentage point absolute difference between reteplase (79.5%) and alteplase (70.4%) is large by IVT trial standards. NNT ≈ 11. However, any intracranial hemorrhage was also higher with reteplase (7.7% vs 4.9%), creating a meaningful safety tradeoff to weigh against the efficacy benefit.',
      },
      {
        question: 'Does this mean reteplase is now the preferred thrombolytic?',
        answer: 'Not in current guidelines. RAISE is a single trial from China, and reteplase is approved for stroke only in selected regions. The elevated any-ICH rate (7.7% vs 4.9%) and higher adverse event burden (91.6% vs 82.4%) mean the net benefit across all patients is uncertain. Independent replication and guideline assessment are needed.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with acute ischemic stroke within 4.5 hours, reteplase double-bolus (18 mg + 18 mg) was superior to alteplase for excellent functional outcome at 90 days (79.5% vs 70.4%, RR 1.13, 95% CI 1.05-1.21, superiority P=0.002), with similar symptomatic ICH (2.4% vs 2.0%).',
      doesNotProve: 'RAISE does not prove reteplase is safe for all patients or should replace alteplase or tenecteplase in routine practice. Any intracranial hemorrhage was higher (7.7% vs 4.9%), and adverse events were higher (91.6% vs 82.4%). A single Chinese trial cannot establish a new standard of care without independent replication.',
      cautions: 'RAISE is currently the only large RCT showing a thrombolytic superior to alteplase for stroke. Any-ICH was higher with reteplase (RR 1.59, CI 1.00-2.51, borderline significant). High adverse event rates (91.6%) warrant scrutiny. Reteplase is not approved for stroke in the US or most of Europe. Independent replication is needed before practice change.',
    },
    bedsidePearl: 'RAISE is the first RCT showing a thrombolytic (reteplase) superior to alteplase for stroke (79.5% vs 70.4%, NNT 11, P=0.002). However, any-ICH was higher (7.7% vs 4.9%) and adverse events were higher (91.6%). Reteplase is not guideline-endorsed for stroke outside of select regions. Watch for replication trials and guideline updates.',
    bottomLineSummary: 'RAISE demonstrated reteplase double-bolus was superior to alteplase for mRS 0-1 at 90 days in Chinese stroke patients within 4.5 hours (79.5% vs 70.4%, RR 1.13, P=0.002). Any intracranial hemorrhage was higher with reteplase (7.7% vs 4.9%). RAISE is provocative but requires independent replication before guideline adoption.',
  },
  'taste-trial': {
    id: 'taste-trial',
    title: 'TASTE Trial',
    subtitle: 'Tenecteplase vs Alteplase with Perfusion-Imaging Selection',
    category: 'Neuro Trials',
    primaryDesign: 'bayesian-noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      imagingSelection: 'CT perfusion mismatch required — results apply to imaging-selected early-window stroke only',
      populationExclusions: [
        'Stopped early at 680/832 patients — full ITT result was borderline; NI formally met only in per-protocol analysis',
      ],
    },
    stats: {
      sampleSize: {
        value: '680',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 3 Months'
      },
      pValue: {
        value: 'PP NI Only',
        label: 'Nuanced Result'
      },
      effectSize: {
        value: '+3%',
        label: 'Standardized Risk Difference (ITT)'
      }
    },
    trialDesign: {
      type: [
        'International, multicenter, open-label noninferiority trial',
        'Perfusion-imaging selected early-window stroke',
        'Tenecteplase 0.25 mg/kg vs alteplase 0.9 mg/kg'
      ],
      timeline: 'Eight countries; March 2014 to October 2023'
    },
    efficacyResults: {
      treatment: {
        percentage: 57,
        label: 'mRS 0-1 at 3 months (intention-to-treat)',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 55,
        label: 'mRS 0-1 at 3 months (intention-to-treat)',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'TASTE focused on a more selected early-window population defined by perfusion mismatch and no planned EVT, asking whether tenecteplase remains at least as good as alteplase when imaging confirms salvageable tissue.',
    pearls: [
      'In intention-to-treat analysis, tenecteplase numerically favored alteplase but narrowly missed clean noninferiority',
      'Per-protocol analysis supported noninferiority more clearly',
      'Symptomatic intracranial hemorrhage was low and similar: 3% vs 2%',
      'TASTE adds to the tenecteplase body of evidence but its result is less clear-cut than AcT or TRACE-2'
    ],
    conclusion: '',
    source: 'TASTE Investigators (Lancet Neurol 2024)',
    doi: '10.1016/S1474-4422(24)00206-0',
    trialResult: 'NEUTRAL',
    safetyProfile: {
      sICH: {
        evt: 3,
        control: 2,
        label: 'Symptomatic intracranial hemorrhage',
        color: 'warning',
        tooltip: 'sICH was similar between arms (3% vs 2%, unadjusted RD 0.01, 95% CI −0.01 to +0.03). Mortality at 90 days: 7% tenecteplase vs 4% alteplase.',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase vs alteplase in perfusion-selected early-window stroke; NI met in per-protocol analysis only.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours or last known well',
      'Aged 18 or older',
      'Not being considered for EVT',
      'Target mismatch on brain perfusion imaging (CT or MRI)',
    ],
    exclusionCriteria: [
      'Planned endovascular thrombectomy',
      'Contraindication to IV thrombolysis',
      'Large established infarct core on perfusion imaging',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 3 months. Tenecteplase reached 57 per 100; alteplase 55. The standardized risk difference of 0.03 (95% CI −0.033 to +0.10) met the NI threshold only in the per-protocol analysis (p=0.01) and narrowly missed in the intention-to-treat analysis (p=0.031). Non-inferiority was partially met.',
      },
      {
        question: 'Why did the trial stop early?',
        answer: 'TASTE was stopped after other trials (including AcT and TRACE-2) conclusively demonstrated NI of tenecteplase in the broader standard-window population. With those results available, continuing to enroll for a more selected subgroup was considered unnecessary. The early stop means TASTE is underpowered for its prespecified margin in the ITT analysis.',
      },
      {
        question: 'What does the nuanced NI result mean in practice?',
        answer: 'TASTE adds to the body of evidence supporting tenecteplase 0.25 mg/kg but its result is less definitive than AcT or TRACE-2. The per-protocol result supports NI; the ITT result is borderline. Most clinicians and guidelines weigh the totality of tenecteplase evidence, not TASTE alone. TASTE does not change the current endorsement of tenecteplase.',
      },
    ],
    howToInterpret: {
      proves: 'In perfusion-imaging-selected patients with early-window acute ischemic stroke not proceeding to EVT, tenecteplase 0.25 mg/kg showed non-inferiority to alteplase for mRS 0-1 at 3 months in the per-protocol analysis (57% vs 55%, SRD 0.05, 95% CI −0.02 to +0.12, NI p=0.01). ITT NI was borderline (SRD 0.03, p=0.031).',
      doesNotProve: 'TASTE does not prove clean non-inferiority in the ITT population — the NI threshold was missed by a narrow margin. It does not establish efficacy for perfusion-selected patients beyond what is already known from larger unselected trials. It does not prove superiority.',
      cautions: 'TASTE stopped early at 680 of 832 planned patients, meaning it was underpowered for its prespecified ITT analysis. The NI margin was SRD ≥−0.03, which the ITT result did not meet. Perfusion-imaging selection adds workflow complexity not present in routine practice. The nuanced result warrants care when extrapolating TASTE alone; the broader tenecteplase evidence base is more reliable.',
    },
    bedsidePearl: 'TASTE supports tenecteplase in perfusion-selected early-window stroke (per-protocol NI met, ITT borderline). This does not change practice — tenecteplase is already endorsed based on larger, cleaner trials (AcT, TRACE-2). TASTE is relevant for centers considering perfusion-CT-guided patient selection for thrombolysis, where it confirms feasibility.',
    bottomLineSummary: 'TASTE demonstrated non-inferiority of tenecteplase 0.25 mg/kg to alteplase in the per-protocol analysis (57% vs 55% mRS 0-1, SRD 0.05, NI p=0.01) in perfusion-selected early-window stroke, but the ITT result was borderline. Stopped early at 680 of 832 patients. Adds to the tenecteplase evidence base without changing current practice.',
  },
  'timeless-trial': {
    id: 'timeless-trial',
    title: 'TIMELESS Trial',
    subtitle: 'Tenecteplase 4.5-24 Hours with Perfusion-Imaging Selection',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'not-met',
    applicability: {
      evtContext: 'evt-co-treated',
      imagingSelection: 'CT or MRI perfusion mismatch required (ICA/MCA occlusion with salvageable tissue 4.5-24h)',
      populationExclusions: [
        '77% of patients underwent EVT — result applies to bridge IVT context, not IVT-alone at late window',
        'No benefit demonstrated; late-window IVT benefit only in EVT-unavailable settings (TRACE-III)',
      ],
    },
    stats: {
      sampleSize: {
        value: '458',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.45',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.13',
        label: 'Adjusted Common OR'
      }
    },
    trialDesign: {
      type: [
        'Multicenter, double-blind, placebo-controlled trial',
        'ICA/MCA occlusion with salvageable tissue 4.5-24 hours',
        'Most patients subsequently underwent EVT'
      ],
      timeline: 'NEJM 2024'
    },
    efficacyResults: {
      treatment: {
        percentage: 46.0,
        label: 'Functional independence at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 42.4,
        label: 'Functional independence at 90 days',
        name: 'Placebo'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'Placebo'
    },
    clinicalContext: 'TIMELESS addressed whether tenecteplase adds value in the late window when perfusion imaging shows salvageable tissue, but when modern thrombectomy is already available to most patients.',
    pearls: [
      'TIMELESS was neutral for its primary ordinal mRS outcome',
      'More than three-quarters of enrolled patients underwent thrombectomy, which likely diluted any incremental IV thrombolytic effect',
      'Recanalization at 24 hours was higher with tenecteplase, but clinical benefit did not emerge',
      'TIMELESS and TRACE-III together help define an important boundary: late-window IVT may be more useful when EVT is not available'
    ],
    conclusion: '',
    source: 'Albers GW, et al. (NEJM 2024)',
    doi: '10.1056/NEJMoa2310392',
    clinicalTrialsId: 'NCT03785678',
    trialResult: 'NEGATIVE',
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'ICA or MCA (M1 or proximal M2) occlusion on CTA',
      'Perfusion imaging mismatch confirming salvageable tissue',
      '4.5 to 24 hours from stroke onset',
      'Age 18 or older',
    ],
    exclusionCriteria: [
      'ASPECTS below 6 on CT or DWI-ASPECTS below 6 on MRI',
      'Contraindication to thrombolysis',
      'No large vessel occlusion on imaging',
    ],
    mrsDistribution: [
      { arm: 'Tenecteplase', n: 226, pct: [15.5, 16.8, 13.7, 15.0, 12.8, 6.6, 19.5] },
      { arm: 'Placebo', n: 229, pct: [13.5, 13.1, 15.7, 14.8, 17.9, 5.7, 19.2] },
    ],
    ordinalStats: { commonOR: 1.13, ciLow: 0.82, ciHigh: 1.57, direction: 'positive' as const, pValue: 0.45 },
    bedsidePearl: 'TIMELESS is not evidence against late-window IVT in all settings. It is specifically negative for bridging tenecteplase before thrombectomy in the 4.5-24 hour window (77% of patients underwent EVT). The contrast is TRACE-III: in perfusion-selected LVO patients without EVT access, late-window tenecteplase improved mRS 0-1 from 24.2% to 33.0% (NNT 11). The rule is: late-window IVT may help when EVT is unavailable; it adds nothing as a bridge when EVT is being performed.',
    bottomLineSummary: 'In perfusion-selected LVO patients treated 4.5-24 hours after stroke onset, tenecteplase 0.25 mg/kg before planned thrombectomy (77% of patients) did not improve 90-day mRS distribution (adjusted cOR 1.13, 95% CI 0.82-1.57, p=0.45). Functional independence occurred in 46.0% vs 42.4%. Symptomatic ICH was 2.0% vs 2.2%. TIMELESS and TRACE-III together define the role of late-window IVT: benefit only when EVT is unavailable.',
  },
  'trace-2-trial': {
    id: 'trace-2-trial',
    title: 'TRACE-2 Trial',
    subtitle: 'Tenecteplase vs Alteplase in EVT-Ineligible Stroke',
    category: 'Neuro Trials',
    primaryDesign: 'noninferiority',
    primaryResult: 'noninferiority-established',
    applicability: {
      evtContext: 'evt-ineligible',
      geography: 'China',
    },
    stats: {
      sampleSize: {
        value: '1430',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS 0-1',
        label: 'at 90 Days'
      },
      pValue: {
        value: 'NI Met',
        label: 'Noninferiority'
      },
      effectSize: {
        value: 'RR 1.07',
        label: 'Risk Ratio'
      }
    },
    trialDesign: {
      type: [
        'Phase 3, multicenter, open-label, blinded-endpoint noninferiority trial',
        'Standard-window IVT in EVT-ineligible or EVT-refusing stroke',
        'Tenecteplase 0.25 mg/kg vs alteplase'
      ],
      timeline: 'China; June 2021 to May 2022'
    },
    efficacyResults: {
      treatment: {
        percentage: 62,
        label: 'mRS 0-1 at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 58,
        label: 'mRS 0-1 at 90 days',
        name: 'Alteplase'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg',
      control: 'IV alteplase 0.9 mg/kg'
    },
    clinicalContext: 'TRACE-2 was a major Chinese phase 3 confirmation study of tenecteplase in patients eligible for standard IVT but not proceeding to thrombectomy, helping determine whether the AcT signal generalizes across systems and populations.',
    pearls: [
      'Tenecteplase was noninferior to alteplase for excellent outcome',
      'Symptomatic intracranial hemorrhage was similar at about 2% in both groups',
      'TRACE-2 provides important non-Canadian confirmation of tenecteplase 0.25 mg/kg',
      'Together with AcT and ATTEST-2, it solidifies the 0.25 mg/kg tenecteplase dose'
    ],
    conclusion: '',
    source: 'Wang Y, et al. (Lancet 2023)',
    doi: '10.1016/S0140-6736(22)02600-9',
    clinicalTrialsId: 'NCT04797013',
    trialResult: 'NEUTRAL',
    safetyProfile: {
      sICH: {
        evt: 2,
        control: 2,
        label: 'Symptomatic intracranial hemorrhage within 36 hours',
        color: 'success',
        tooltip: 'sICH was identical between arms (2% each, RR 1.18, 95% CI 0.56-2.50). Mortality was 7% tenecteplase vs 5% alteplase (RR 1.31, CI 0.86-2.01, not significant).',
      },
    },
    listCategory: 'thrombolysis',
    listDescription: 'Tenecteplase vs alteplase (N=1430) in EVT-ineligible stroke; non-inferiority confirmed.',
    inclusionCriteria: [
      'Acute ischemic stroke within 4.5 hours of onset',
      'Eligible for standard IV thrombolysis',
      'Ineligible for or refusing EVT',
      'NIHSS 5-25 at enrollment',
      'Premorbid mRS ≤1',
    ],
    exclusionCriteria: [
      'Eligible for and agreeing to endovascular thrombectomy',
      'NIHSS <5 or >25',
      'Premorbid disability (mRS >1)',
      'Contraindication to IV thrombolysis',
    ],
    howToReadChart: [
      {
        question: 'What does the chart show?',
        answer: 'mRS 0-1 at 90 days in EVT-ineligible or EVT-refusing stroke patients. Tenecteplase reached 62 per 100; alteplase 58. RR 1.07 (95% CI 0.98-1.16) — the lower bound (0.98) exceeds the prespecified NI margin of 0.937, confirming non-inferiority.',
      },
      {
        question: 'Why is TRACE-2 considered a landmark trial for tenecteplase?',
        answer: 'TRACE-2 (N=1430) is one of the largest tenecteplase vs alteplase RCTs and was conducted in a strictly defined EVT-ineligible population — the most common IVT candidate. It was published in the Lancet (2023) and provided major international validation (Chinese population) of AcT\'s Canadian findings.',
      },
      {
        question: 'Does TRACE-2 show superiority?',
        answer: 'No. The RR of 1.07 and the CI of 0.98-1.16 are consistent with NI. The CI crosses 1.0 for superiority would require the lower bound to exceed 1.0. TRACE-2 confirms equivalence, not superiority. Combined with AcT and ATTEST-2, it firmly establishes tenecteplase as a non-inferior alternative.',
      },
    ],
    howToInterpret: {
      proves: 'In patients with acute ischemic stroke (NIHSS 5-25) within 4.5 hours who were ineligible for or refusing EVT, tenecteplase 0.25 mg/kg showed non-inferiority to alteplase 0.9 mg/kg for excellent functional outcome at 90 days within the prespecified RR margin of 0.937 (62% vs 58%, RR 1.07, 95% CI 0.98-1.16, NI confirmed), with similar sICH (2% each).',
      doesNotProve: 'TRACE-2 does not prove superiority of tenecteplase over alteplase. It does not establish NI for mild stroke (NIHSS <5 were excluded), severe stroke (NIHSS >25 excluded), or bridging EVT candidates. The Chinese-only population limits generalizability.',
      cautions: 'Open-label design. NIHSS eligibility range (5-25) excludes the mild-stroke gray zone where ARAMIS and PRISMS are more relevant. Mortality at 90 days was numerically higher with tenecteplase (7% vs 5%, RR 1.31, CI 0.86-2.01), though not statistically significant — this warrants monitoring across the tenecteplase literature.',
    },
    bedsidePearl: 'TRACE-2 is a major validation of tenecteplase 0.25 mg/kg for standard-window IVT in EVT-ineligible patients (NI confirmed, RR 1.07, sICH 2% each). Together with AcT and ATTEST-2, TRACE-2 provides the evidence base for the 2026 guideline endorsement of tenecteplase as an acceptable alternative to alteplase. Single-bolus administration simplifies door-to-needle workflows.',
    bottomLineSummary: 'TRACE-2 confirmed non-inferiority of tenecteplase 0.25 mg/kg to alteplase 0.9 mg/kg for mRS 0-1 at 90 days in EVT-ineligible stroke patients (62% vs 58%, RR 1.07, 95% CI 0.98-1.16, NI P confirmed). Safety was similar (sICH 2% each). TRACE-2 is a key pillar of the tenecteplase evidence base alongside AcT and ATTEST-2.',
  },
  'twist-trial': {
    id: 'twist-trial',
    title: 'TWIST Trial',
    subtitle: 'Wake-Up Stroke Treated with Tenecteplase Selected by Non-Contrast CT',
    category: 'Neuro Trials',
    primaryDesign: 'ordinal-shift',
    primaryResult: 'not-met',
    applicability: {
      imagingSelection: 'Non-contrast CT only — no MRI or CT perfusion; results do not apply to advanced-imaging-selected wake-up stroke (cf. WAKE-UP trial)',
      populationExclusions: [
        'No significant benefit on mRS shift (OR 1.18, p=0.27) — trial does not support IVT in this population with NCCT selection alone',
      ],
    },
    stats: {
      sampleSize: {
        value: '578',
        label: 'Randomized Patients'
      },
      primaryEndpoint: {
        value: 'mRS Shift',
        label: 'at 90 Days'
      },
      pValue: {
        value: '0.27',
        label: 'Not Significant'
      },
      effectSize: {
        value: 'OR 1.18',
        label: 'Adjusted OR'
      }
    },
    trialDesign: {
      type: [
        'Investigator-initiated, multicenter, open-label randomized trial',
        'Wake-up stroke selected with non-contrast CT only',
        'Tenecteplase vs no thrombolysis'
      ],
      timeline: 'Ten countries; June 2017 to September 2021'
    },
    efficacyResults: {
      treatment: {
        percentage: 45,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Tenecteplase'
      },
      control: {
        percentage: 38,
        label: 'Excellent outcome (mRS 0-1) at 90 days',
        name: 'Control'
      }
    },
    intervention: {
      treatment: 'IV tenecteplase 0.25 mg/kg within 4.5 hours of awakening',
      control: 'No thrombolysis'
    },
    clinicalContext: 'TWIST asked whether wake-up stroke could be treated without MRI or perfusion imaging, using only non-contrast CT. If positive, it would have dramatically expanded access to reperfusion in imaging-limited settings.',
    pearls: [
      'TWIST was neutral for its primary ordinal outcome despite numerically more mRS 0-1 outcomes with tenecteplase',
      'Symptomatic intracranial hemorrhage remained low: 2% vs 1%',
      'The trial does not support using non-contrast CT alone to select wake-up stroke patients for tenecteplase',
      'TWIST helps define the boundary between imaging simplification and overtreatment risk'
    ],
    conclusion: '',
    source: 'Roaldsen MB, et al. (Lancet Neurol 2023)',
    doi: '10.1016/S1474-4422(22)00484-7',
    clinicalTrialsId: 'NCT03181360',
    trialResult: 'NEGATIVE',
    archetypeId: 'B' as const,
    inclusionCriteria: [
      'Wake-up stroke or stroke with unwitnessed onset',
      'Treatable within 4.5 hours of awakening or recognition',
      'ASPECTS 4 or higher on non-contrast CT',
      'Age 18 to 80',
    ],
    exclusionCriteria: [
      'Known time of symptom onset (wake-up criterion not met)',
      'Early ischemic changes beyond one-third MCA territory on NCCT',
      'Standard thrombolysis contraindications',
    ],
    mrsDistribution: [
      { arm: 'Tenecteplase', n: 289, pct: [14, 31, 16, 20, 7, 2, 10] },
      { arm: 'Control', n: 289, pct: [11, 27, 21, 20, 9, 3, 8] },
    ],
    ordinalStats: { commonOR: 1.18, ciLow: 0.88, ciHigh: 1.58, direction: 'positive' as const, pValue: 0.27 },
    bedsidePearl: 'TWIST is a negative trial for non-contrast CT-only selection of wake-up stroke for tenecteplase. Numerically more patients achieved mRS 0-1 with tenecteplase (45% vs 38%) but the ordinal shift was not significant. The take-home is imaging-specific: NCCT alone cannot reliably select patients likely to benefit. MRI DWI-FLAIR mismatch (WAKE-UP trial) or CTP penumbra remain the evidence-based selection strategies where available.',
    bottomLineSummary: 'In wake-up stroke patients selected by non-contrast CT (ASPECTS 4 or higher), tenecteplase 0.25 mg/kg within 4.5 hours of awakening did not significantly improve 90-day mRS distribution compared with no thrombolysis (adjusted OR 1.18, 95% CI 0.88-1.58, p=0.27). mRS 0-1 was achieved in 45% vs 38% (exploratory). Symptomatic ICH was 2% vs 1%. TWIST does not support non-contrast CT as the sole imaging modality for wake-up stroke thrombolytic selection.',
  },

  // ── W7.0 Predecessor Stubs — EVT 2015 chain (canary batch, §7c) ──────────

  'ims-iii-trial': {
    id: 'ims-iii-trial',
    title: 'IMS-III Trial',
    subtitle: 'Endovascular Therapy After IV Alteplase for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1056/NEJMoa1214300',
    source: 'Broderick et al. (NEJM 2013)',
    listCategory: 'thrombectomy',
    listDescription: 'First-generation endovascular therapy added to IV tPA: no benefit (mRS 0-2 40.8% vs 38.7%, RR 1.05, 95% CI 0.85-1.30). Stopped early for futility. Historical predecessor; ESCAPE (2015) established modern EVT.',
    stats: {
      sampleSize: { value: '656', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'mRS 0-2', label: 'at 90 Days' },
      pValue: { value: 'NS', label: 'Not Significant' },
      effectSize: { value: 'RR 1.05', label: 'No Added Benefit (CI 0.83-1.30)' },
    },
    trialDesign: {
      type: [
        'Multicenter open-label RCT, US and international sites',
        'IV alteplase given first; randomized within 40 minutes of alteplase start',
        'Endovascular arm: intra-arterial tPA and/or coil-based mechanical devices',
        'No CTA-confirmed large-vessel occlusion required for enrollment',
      ],
      timeline: 'Stopped early for futility; 656 of planned 900 enrolled',
    },
    efficacyResults: {
      treatment: { percentage: 40.8, label: 'mRS 0-2 at 90 days', name: 'Endovascular + IV tPA' },
      control: { percentage: 38.7, label: 'mRS 0-2 at 90 days', name: 'IV tPA Alone' },
    },
    intervention: {
      treatment: 'Endovascular therapy (intra-arterial tPA and/or mechanical clot retrieval) after IV alteplase',
      control: 'IV alteplase alone (standard care)',
    },
    clinicalContext: 'IMS-III tested whether adding endovascular therapy to IV alteplase improved outcomes. Most patients in the endovascular arm did not have CTA-confirmed vessel occlusion, and coil-based retrieval devices achieved modest reperfusion rates. The trial demonstrates why device generation and imaging selection are the critical variables.',
    pearls: [
      'Stopped early for futility: no benefit of adding endovascular to IV alteplase',
      'mRS 0-2 at 90 days: 40.8% vs 38.7% (adjusted RR 1.05, 95% CI 0.85-1.30)',
      'Endovascular arm used mostly older coil-based devices; modern stent retrievers unavailable',
      'Less than half of endovascular-arm patients had CTA-confirmed vessel occlusion',
    ],
    conclusion: '',
    questionLede: 'In patients with moderate-to-severe acute ischemic stroke (NIHSS 8 or greater) treated with IV alteplase within 3 hours, does adding endovascular therapy improve 90-day functional independence compared with IV alteplase alone?',
    /* claimId: ims-iii-outcomes | source: Broderick et al., NEJM 2013, doi: 10.1056/NEJMoa1214300 */
    primaryOutcomeProse: 'In 656 patients with moderate-to-severe ischemic stroke (NIHSS 8 or greater) who received IV alteplase within 3 hours, adding endovascular therapy did not improve functional independence at 90 days. mRS 0-2 was achieved in 40.8% of the endovascular group versus 38.7% in the IV-only group (adjusted RR 1.05, 95% CI 0.83 to 1.30), a difference that was not statistically significant. The trial was stopped early at a planned interim analysis for futility -- the data safety monitoring board concluded the primary endpoint was very unlikely to be met with full enrollment.',
    /* claimId: ims-iii-design | source: Broderick et al., NEJM 2013 */
    trialDesignNarrative: 'IMS-III enrolled patients who received IV alteplase (0.9 mg/kg standard dose) within 3 hours of stroke onset and had an NIHSS of 8 or greater. Patients were randomized within 40 minutes of alteplase infusion start to continue IV alteplase alone or proceed to endovascular therapy. The endovascular arm used intra-arterial tPA and, in many cases, coil-based mechanical devices (MERCI retriever, early Penumbra system). Critically, CTA or MRA confirmation of large-vessel occlusion was not required -- a substantial proportion of enrolled patients likely had no retrievable thrombus, diluting any treatment effect.',
    safetyBrief: 'Symptomatic intracranial hemorrhage was 6.2% endovascular versus 5.9% IV-only (p=0.83). Mortality at 90 days was 19.1% versus 21.6% (p=0.33). No significant safety difference between arms.',
    successorTrialId: 'escape-trial',
    successorTrialDisplay: 'ESCAPE (2015)',
    successorTrialClause: 'for the modern successor trial that established EVT as standard of care',
    chainContext: 'modern stent-retriever technology and CTA-based patient selection',
    /* claimId: ims-iii-bottom-line | source: Broderick et al., NEJM 2013 */
    bottomLineSummary: 'IMS-III stopped early for futility after enrolling 656 of 900 planned patients. In moderate-severe stroke (NIHSS >=8) treated with IV alteplase within 3 hours, adding endovascular therapy (mostly older coil-based devices, no mandatory vessel-occlusion confirmation) did not improve 90-day mRS 0-2: 40.8% vs 38.7% (adjusted RR 1.05, 95% CI 0.83-1.30). The trial predates modern stent retrievers and CTA-based patient selection.',
    inclusionCriteria: [
      'Age 18 to 82 years',
      'Acute ischemic stroke with onset within 3 hours',
      'IV alteplase initiated (0.9 mg/kg standard dose)',
      'NIHSS 8 to 29 (moderate to severe stroke)',
      'CT or MRI excluding hemorrhage',
    ],
    exclusionCriteria: [
      'Rapidly improving neurological status (NIHSS below 8 at randomization)',
      'Intracranial hemorrhage on baseline imaging',
      'Major contraindication to alteplase or contrast material',
      'Endovascular treatment not achievable within 7 hours of onset',
      'Severe pre-stroke disability',
    ],
  },

  'synthesis-expansion-trial': {
    id: 'synthesis-expansion-trial',
    title: 'SYNTHESIS Expansion Trial',
    subtitle: 'Endovascular Therapy Alone Versus IV Alteplase for Acute Ischemic Stroke',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1056/NEJMoa1213701',
    source: 'Ciccone et al. (NEJM 2013)',
    listCategory: 'thrombectomy',
    listDescription: 'Endovascular therapy alone (no IV tPA first) vs IV alteplase: no superiority (mRS 0-1 30.4% vs 34.8%, OR 0.71, 95% CI 0.44-1.14, p=0.16). Historical predecessor; ESCAPE (2015) established modern EVT.',
    stats: {
      sampleSize: { value: '362', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'mRS 0-1', label: 'Disability-Free Survival at 90 Days' },
      pValue: { value: '0.16', label: 'Not Significant' },
      effectSize: { value: 'OR 0.71', label: 'No Superiority (CI 0.44-1.14)' },
    },
    trialDesign: {
      type: [
        'Multicenter open-label RCT, 24 Italian stroke centers',
        'Endovascular arm received no IV alteplase before the procedure',
        'No CTA-confirmed large-vessel occlusion required for enrollment',
        'IV alteplase window: within 4.5 hours; endovascular window: within 6 hours',
        'Older mechanical devices supplemented with intra-arterial tPA as needed',
      ],
      timeline: '362 patients enrolled; planned sample size achieved',
    },
    efficacyResults: {
      treatment: { percentage: 30.4, label: 'Disability-free survival (mRS 0-1) at 90 days', name: 'Endovascular Therapy' },
      control: { percentage: 34.8, label: 'Disability-free survival (mRS 0-1) at 90 days', name: 'IV Alteplase' },
    },
    intervention: {
      treatment: 'Endovascular therapy alone (intra-arterial approach with or without mechanical devices; no IV alteplase)',
      control: 'IV alteplase (0.9 mg/kg) within 4.5 hours of onset',
    },
    clinicalContext: 'SYNTHESIS Expansion posed a different question from IMS-III: not whether to add endovascular therapy to IV alteplase, but whether to replace IV alteplase with endovascular therapy entirely. The trial found no superiority -- numerically fewer patients achieved independence with the endovascular approach, though not significantly, and the endovascular arm had a longer allowed time window.',
    pearls: [
      'Endovascular therapy alone was not superior to IV alteplase: mRS 0-1 in 30.4% vs 34.8%',
      'Endovascular arm received no IV tPA before the procedure, a direct comparison, not bridging therapy',
      'Numerically worse outcomes in the endovascular arm (not statistically significant)',
      'No vessel-occlusion confirmation required: many enrolled patients may have had no retrievable thrombus',
    ],
    conclusion: '',
    questionLede: 'In patients with acute ischemic stroke within 4.5 hours, is endovascular therapy alone superior to IV alteplase in achieving disability-free survival (mRS 0-1) at 90 days?',
    /* claimId: synthesis-expansion-outcomes | source: Ciccone et al., NEJM 2013, doi: 10.1056/NEJMoa1213701 */
    primaryOutcomeProse: 'In 362 patients with ischemic stroke, endovascular therapy alone was not superior to IV alteplase in achieving disability-free survival (mRS 0-1) at 90 days. The primary endpoint was achieved in 30.4% of the endovascular group versus 34.8% of the alteplase group (adjusted OR 0.71, 95% CI 0.44 to 1.14, p=0.16). Results numerically favored IV alteplase, though this difference did not reach statistical significance. Notably, the endovascular arm received no pre-procedure IV alteplase, and the endovascular treatment window extended to 6 hours versus 4.5 hours for the alteplase arm.',
    /* claimId: synthesis-expansion-design | source: Ciccone et al., NEJM 2013 */
    trialDesignNarrative: 'SYNTHESIS Expansion randomized patients with ischemic stroke to endovascular therapy alone (without IV alteplase) or IV alteplase (0.9 mg/kg standard dose within 4.5 hours). The endovascular group had a longer treatment window -- up to 6 hours from onset. Endovascular therapy used intra-arterial recombinant tPA and first-generation mechanical devices. Enrollment did not require CTA or MRA confirmation of large-vessel occlusion, meaning a substantial proportion of enrolled patients may have had occlusions not amenable to endovascular retrieval. This design difference from IMS-III (which used bridging therapy) makes direct comparison difficult.',
    safetyBrief: 'Symptomatic intracranial hemorrhage was similar between groups (6% endovascular vs 6% alteplase). Mortality at 3 months was 10% versus 8%, a non-significant difference (p=0.53). No significant safety signal in either direction.',
    successorTrialId: 'escape-trial',
    successorTrialDisplay: 'ESCAPE (2015)',
    successorTrialClause: 'for the modern successor trial that established EVT as standard of care',
    chainContext: 'modern stent-retriever technology and CTA-based patient selection',
    /* claimId: synthesis-expansion-bottom-line | source: Ciccone et al., NEJM 2013 */
    bottomLineSummary: 'SYNTHESIS Expansion randomized 362 patients with ischemic stroke to endovascular therapy alone (no IV tPA, window up to 6 hours) or standard IV alteplase within 4.5 hours. Disability-free survival (mRS 0-1) at 90 days: 30.4% endovascular vs 34.8% alteplase (adjusted OR 0.71, 95% CI 0.44-1.14, p=0.16). Endovascular therapy did not demonstrate superiority. The trial used older devices and did not require confirmed vessel occlusion.',
    inclusionCriteria: [
      'Age 18 to 80 years',
      'Acute ischemic stroke with limb paresis or aphasia',
      'Onset within 4.5 hours (IV alteplase arm) or 6 hours (endovascular arm)',
      'Eligible for IV alteplase or endovascular therapy',
      'CT excluding hemorrhage',
    ],
    exclusionCriteria: [
      'Intracranial hemorrhage on baseline CT',
      'Rapidly resolving symptoms',
      'Contraindication to IV alteplase (in alteplase arm)',
      'Large established infarct on baseline CT',
      'Severe pre-stroke disability',
    ],
  },

  'mr-rescue-trial': {
    id: 'mr-rescue-trial',
    title: 'MR RESCUE Trial',
    subtitle: 'Penumbral Imaging to Select Patients for Mechanical Embolectomy',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEUTRAL',
    archetypeId: 'A' as const,
    doi: '10.1056/NEJMoa1212793',
    source: 'Kidwell et al. (NEJM 2013)',
    listCategory: 'thrombectomy',
    listDescription: 'Penumbral imaging-guided mechanical embolectomy: mean mRS 3.9 vs 3.9 in embolectomy vs standard care (NS). Penumbral imaging did not identify benefiting patients. Historical predecessor. ESCAPE (2015) established modern EVT.',
    stats: {
      sampleSize: { value: '118', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'Mean mRS', label: 'at 90 Days' },
      pValue: { value: 'NS', label: 'No Significant Difference' },
      effectSize: { value: '3.9 vs 3.9', label: 'No Difference in Outcome' },
    },
    trialDesign: {
      type: [
        'Multicenter phase 2 RCT, 9 US centers',
        'MRI or CT perfusion penumbral-mismatch stratification prior to randomization',
        'Mechanical embolectomy (MERCI retriever or Penumbra system) vs standard care',
        'Proximal anterior circulation LVO required (CTA or MRA confirmed)',
        'Treatment within 8 hours of symptom onset',
      ],
      timeline: '118 patients; planned sample size achieved',
    },
    efficacyResults: {
      treatment: { percentage: 21.7, label: 'mRS 0-2 at 90 days (exploratory; primary was mean mRS)', name: 'Embolectomy' },
      control: { percentage: 22.4, label: 'mRS 0-2 at 90 days (exploratory; primary was mean mRS)', name: 'Standard Care' },
    },
    intervention: {
      treatment: 'Mechanical embolectomy (MERCI retriever or Penumbra aspiration system) within 8 hours',
      control: 'Standard care including IV alteplase if eligible within 3 hours',
    },
    clinicalContext: 'MR RESCUE tested whether penumbral mismatch imaging -- showing a large at-risk zone relative to the infarct core -- could identify patients most likely to benefit from embolectomy. The finding that mean mRS was identical (3.9 vs 3.9) in both arms, regardless of penumbral imaging pattern, challenged this hypothesis. The trial used first-generation devices with a reperfusion rate of only 27%.',
    pearls: [
      'Mean mRS at 90 days identical in both arms: 3.9 embolectomy vs 3.9 standard care',
      'Penumbral imaging did not identify a benefiting subgroup (imaging-by-treatment interaction p=0.56)',
      'Only 27% of embolectomy-arm patients achieved successful reperfusion -- far below modern stent-retriever rates',
      'The trial was underpowered to detect small effects; N=118 limits conclusions',
    ],
    conclusion: '',
    questionLede: 'In patients with proximal large-vessel occlusion stroke within 8 hours, does penumbral mismatch imaging identify patients who benefit from mechanical embolectomy, and does embolectomy improve functional outcome compared with standard care?',
    /* claimId: mr-rescue-outcomes | source: Kidwell et al., NEJM 2013, doi: 10.1056/NEJMoa1212793 */
    primaryOutcomeProse: 'In 118 patients with proximal anterior circulation LVO stroke randomized within 8 hours, mechanical embolectomy did not improve functional outcome compared with standard care. Mean mRS at 90 days was 3.9 in both the embolectomy group and the standard-care group. Penumbral imaging pattern (favorable mismatch vs unfavorable) did not predict benefit from embolectomy -- the imaging-by-treatment interaction was not significant (p=0.56). The trial was underpowered to detect small treatment effects, and the embolectomy arm achieved successful reperfusion in only 27% of patients.',
    /* claimId: mr-rescue-design | source: Kidwell et al., NEJM 2013 */
    trialDesignNarrative: 'MR RESCUE enrolled patients with proximal anterior circulation LVO (ICA or M1 MCA, confirmed on CTA or MRA) within 8 hours of symptom onset and performed penumbral imaging (MRI or CT perfusion) to classify patients as having favorable mismatch (large penumbra, small core) or unfavorable pattern (large established infarct). Patients were randomized within each stratum to mechanical embolectomy or standard care. Embolectomy used the MERCI retriever or Penumbra aspiration system -- first-generation devices with substantially lower reperfusion efficacy than modern stent retrievers. Only 27% of the embolectomy arm achieved TIMI 2-3 reperfusion.',
    safetyBrief: 'Symptomatic intracranial hemorrhage occurred in 9% of the embolectomy group versus 4% of the standard-care group (not statistically significant in this small trial). Mortality at 90 days was 21% versus 17% (NS). No significant safety difference was demonstrated.',
    successorTrialId: 'escape-trial',
    successorTrialDisplay: 'ESCAPE (2015)',
    successorTrialClause: 'for the modern successor trial that established EVT as standard of care',
    chainContext: 'modern stent-retriever technology and CTA-based patient selection',
    /* claimId: mr-rescue-bottom-line | source: Kidwell et al., NEJM 2013 */
    bottomLineSummary: 'MR RESCUE randomized 118 patients with proximal LVO stroke to mechanical embolectomy (MERCI or Penumbra) or standard care within 8 hours, stratified by penumbral imaging pattern. Mean mRS at 90 days was 3.9 in both arms. Penumbral imaging did not identify a benefiting subgroup (interaction p=0.56). Successful reperfusion was achieved in only 27% of the embolectomy arm, reflecting low first-generation device efficacy. The trial does not establish benefit or harm; its teaching value is illustrating why device generation and imaging selection were insufficient in the first-generation EVT era.',
    inclusionCriteria: [
      'Age 18 to 85 years',
      'Proximal anterior circulation LVO (ICA or M1 MCA) on CTA or MRA',
      'Penumbral imaging (MRI or CT perfusion) feasible before randomization',
      'Treatment achievable within 8 hours of symptom onset',
      'NIHSS 6 or greater',
    ],
    exclusionCriteria: [
      'Intracranial hemorrhage on baseline imaging',
      'Pre-stroke mRS greater than 2',
      'Established large infarct (ASPECTS below 6 or equivalent)',
      'Unable to undergo MRI or CT perfusion',
      'Posterior circulation stroke',
    ],
  },

  // ── W7.0 Predecessor Stubs — Batch 2 ─────────────────────────────────────
  // Sub-batch 1: Basilar EVT chain (§7c) — BEST, BASICS → ATTENTION (2022)
  // Sub-batch 2: Antiplatelet chain (§7c) — MATCH, CHARISMA → POINT (2018)
  // Sub-batch 3: ICH surgical chain (§7c) — STICH I, STICH II, MISTIE III → ENRICH (2024)

  'best-trial': {
    id: 'best-trial',
    title: 'BEST Trial',
    subtitle: 'Basilar Artery Occlusion — Endovascular Intervention vs Standard Medical Treatment',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEUTRAL',
    archetypeId: 'A' as const,
    doi: '10.1016/S1474-4422(19)30395-3',
    source: 'Liu et al. (Lancet Neurol 2020)',
    listCategory: 'thrombectomy',
    listDescription: 'First RCT of EVT for basilar artery occlusion. ITT primary (mRS 0-3 at 90 days): 42% vs 32% (OR 1.74, CI 0.81–3.74, p=0.23). Terminated early for crossover and low enrollment. Preceded ATTENTION (2022).',
    stats: {
      sampleSize: { value: '131', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'mRS 0-3', label: 'at 90 Days' },
      pValue: { value: '0.23', label: 'Not Significant (ITT)' },
      effectSize: { value: 'OR 1.74', label: 'Favors EVT, CI 0.81–3.74' },
    },
    trialDesign: {
      type: [
        'Multicenter open-label RCT, 28 centers in China',
        'CTA-confirmed basilar artery occlusion required',
        'EVT arm: any approved stent retriever or aspiration device',
        'Treatment window: within 8 hours of onset or last known well',
      ],
      timeline: 'Terminated early: 131 of 240 planned patients enrolled',
    },
    efficacyResults: {
      treatment: { percentage: 42, label: 'mRS 0-3 at 90 days (ITT)', name: 'Endovascular Therapy' },
      control: { percentage: 32, label: 'mRS 0-3 at 90 days (ITT)', name: 'Best Medical Management' },
    },
    intervention: {
      treatment: 'Endovascular thrombectomy (stent retriever, aspiration, or combined) within 8 hours',
      control: 'Best medical management including IV alteplase if eligible',
    },
    clinicalContext: 'BEST was the first RCT to directly compare EVT versus medical management in basilar artery occlusion. It preceded the definitive ATTENTION and BAOCHE trials. High crossover (22 of 65 medical-arm patients received EVT) and premature termination substantially compromised the ITT analysis. The per-protocol analysis showed a nominally significant benefit, but early termination limits interpretation. BEST established neither definitive benefit nor harm for basilar EVT.',
    pearls: [
      'Terminated early: 131 of 240 planned patients due to slow enrollment and crossover',
      'ITT primary: mRS 0-3 at 90 days 42% vs 32%, OR 1.74 (CI 0.81–3.74), p=0.23; not significant',
      'Per-protocol: OR 2.90 (CI 1.20–7.03), p=0.016; nominally significant; cautious interpretation required',
      '22 of 65 medical-arm patients crossed over to EVT, diluting the ITT effect toward null',
      'sICH higher in EVT arm (~14%) vs medical arm (~3%); 90-day mortality similar between arms',
    ],
    conclusion: '',
    questionLede: 'In patients with acute basilar artery occlusion within 8 hours, does endovascular thrombectomy improve 90-day favorable functional outcome (mRS 0-3) compared with best medical management?',
    /* claimId: best-outcomes | source: Liu et al., Lancet Neurol 2020, doi: 10.1016/S1474-4422(19)30395-3 */
    primaryOutcomeProse: 'In 131 patients with CTA-confirmed basilar artery occlusion randomized at 28 Chinese centers, endovascular thrombectomy did not significantly improve favorable functional outcome (mRS 0-3) at 90 days in the intention-to-treat analysis. mRS 0-3 was achieved in 42% of the EVT group versus 32% of the medical management group (OR 1.74, 95% CI 0.81 to 3.74, P=0.23). The trial was terminated early after enrolling 131 of 240 planned patients due to slow enrollment and high crossover: 22 patients randomized to medical management crossed over to EVT, substantially diluting the ITT analysis toward the null. A per-protocol analysis was nominally significant (OR 2.90, 95% CI 1.20 to 7.03, P=0.016), which is hypothesis-generating given the early termination and crossover contamination.',
    /* claimId: best-design | source: Liu et al., Lancet Neurol 2020 */
    trialDesignNarrative: 'BEST enrolled patients with acute basilar artery occlusion confirmed by CTA at 28 Chinese stroke centers between 2015 and 2019. Patients within 8 hours of symptom onset (or last known well) were randomized 1:1 to EVT (any available stent retriever or aspiration device) or best medical management (including IV alteplase at 0.9 mg/kg if eligible). Enrollment was hampered because physicians and families were reluctant to accept randomization to medical management alone for a high-mortality condition when EVT was available -- 22 medical-arm patients crossed over, leading to termination at 131 of 240 participants. Crossover diluted the ITT analysis toward the null; per-protocol analysis showed nominal significance.',
    safetyBrief: 'Symptomatic intracranial hemorrhage was higher in the EVT group (approximately 14%) than the medical group (approximately 3%). Mortality at 90 days was similar between arms (approximately 32% EVT vs 35% medical, non-significant). The elevated sICH rate in the EVT arm reflects reperfusion hemorrhage in basilar territory.',
    successorTrialId: 'attention-trial',
    successorTrialDisplay: 'ATTENTION (2022)',
    successorTrialClause: 'for the modern successor trial that established endovascular thrombectomy for basilar artery occlusion',
    chainContext: 'selective use of endovascular thrombectomy for basilar artery occlusion based on imaging and time window',
    /* claimId: best-bottom-line | source: Liu et al., Lancet Neurol 2020 */
    bottomLineSummary: 'BEST was the first RCT for basilar EVT and was terminated early (131/240 patients) due to crossover and slow enrollment. ITT primary (mRS 0-3 at 90 days): 42% EVT vs 32% medical (OR 1.74, 95% CI 0.81–3.74, P=0.23) — not significant. Per-protocol: OR 2.90 (1.20–7.03, P=0.016) — nominally significant but requires cautious interpretation. ATTENTION (2022) provided definitive evidence for basilar EVT.',
    inclusionCriteria: [
      'Age 18 to 80 years',
      'CTA-confirmed acute basilar artery occlusion',
      'Symptom onset or last known well within 8 hours',
      'No large established infarct on baseline CT',
      'Ability to undergo EVT at study center',
    ],
    exclusionCriteria: [
      'Intracranial hemorrhage on baseline CT',
      'Large established infarct on baseline imaging',
      'Rapidly improving neurological status',
      'Pre-stroke severe disability (mRS 3 or greater)',
      'Life expectancy less than 90 days',
    ],
  },

  'basics-trial': {
    id: 'basics-trial',
    title: 'BASICS Trial',
    subtitle: 'Basilar Artery International Cooperation Study — EVT vs Best Medical Treatment',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEUTRAL',
    archetypeId: 'A' as const,
    doi: '10.1056/NEJMoa2030297',
    source: 'Langezaal et al. (NEJM 2021)',
    listCategory: 'thrombectomy',
    listDescription: 'Multinational RCT of EVT for basilar artery occlusion within 6 hours. Primary (mRS 0-3 at 90 days): 44.2% EVT vs 37.7% medical (RR 1.18, CI 0.92–1.50, P=0.19). Statistically negative; CI did not rule out meaningful benefit. Preceded ATTENTION (2022).',
    stats: {
      sampleSize: { value: '300', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'mRS 0-3', label: 'at 90 Days' },
      pValue: { value: '0.19', label: 'Not Significant' },
      effectSize: { value: 'RR 1.18', label: 'Favors EVT, CI 0.92–1.50' },
    },
    trialDesign: {
      type: [
        'Multicenter open-label RCT, 11 countries (Europe and Asia)',
        'CTA- or MRA-confirmed basilar artery occlusion',
        'EVT plus best medical treatment vs best medical treatment alone',
        'Treatment window: within 6 hours of onset',
        'Best medical treatment included IV alteplase if eligible (~40% of medical arm)',
      ],
      timeline: '300 patients enrolled; full enrollment target achieved',
    },
    efficacyResults: {
      treatment: { percentage: 44.2, label: 'mRS 0-3 at 90 days', name: 'EVT + Best Medical Treatment' },
      control: { percentage: 37.7, label: 'mRS 0-3 at 90 days', name: 'Best Medical Treatment Alone' },
    },
    intervention: {
      treatment: 'Endovascular thrombectomy (any approved technique) plus best medical treatment within 6 hours',
      control: 'Best medical treatment alone, including IV alteplase (0.9 mg/kg) if eligible within 4.5 hours',
    },
    clinicalContext: 'BASICS was a multinational trial that attempted to resolve the equipoise left by BEST. It achieved full enrollment (300 patients) but was underpowered to detect a clinically plausible treatment effect. The primary endpoint was statistically non-significant, but the confidence interval included a relative rate increase of up to 50%, leaving the true treatment effect uncertain. ATTENTION and BAOCHE (both NEJM 2022) subsequently provided definitive evidence that basilar EVT is beneficial.',
    pearls: [
      'Primary: mRS 0-3 at 90 days 44.2% EVT vs 37.7% medical (RR 1.18, CI 0.92–1.50, P=0.19); not significant',
      'CI upper bound 1.50: a 50% relative increase in favorable outcome was not excluded',
      '~40% of the medical arm received IV alteplase as part of best medical treatment',
      'Mortality numerically lower with EVT (38.0% vs 43.2%), not statistically significant',
      'sICH 4.5% EVT vs 0.7% medical (P=0.07); trending toward significance',
    ],
    conclusion: '',
    questionLede: 'In patients with acute basilar artery occlusion within 6 hours, does EVT plus best medical treatment improve 90-day favorable functional outcome (mRS 0-3) compared with best medical treatment alone?',
    /* claimId: basics-outcomes | source: Langezaal et al., NEJM 2021, doi: 10.1056/NEJMoa2030297 */
    primaryOutcomeProse: 'In 300 patients with CTA- or MRA-confirmed basilar artery occlusion enrolled across 11 countries, EVT plus best medical treatment did not significantly improve favorable functional outcome (mRS 0-3) at 90 days compared with best medical treatment alone. mRS 0-3 was achieved in 44.2% (68 of 154) of the EVT group versus 37.7% (55 of 146) of the medical group (rate ratio 1.18, 95% CI 0.92 to 1.50, P=0.19). The confidence interval was wide and included a potential 50% relative increase in favorable outcomes with EVT, meaning the trial did not exclude a clinically meaningful benefit. Mortality was numerically lower in the EVT arm (38.0% vs 43.2%), though not statistically significant.',
    /* claimId: basics-design | source: Langezaal et al., NEJM 2021 */
    trialDesignNarrative: 'BASICS was an international open-label RCT enrolling patients with acute basilar artery occlusion at centers in Europe and Asia. Patients within 6 hours of onset (or last known well) with CTA- or MRA-confirmed basilar occlusion were randomized to EVT plus best medical treatment or best medical treatment alone. Best medical treatment included IV alteplase (0.9 mg/kg) if eligible; approximately 40% of the medical arm received alteplase. EVT could use any approved thrombectomy technique. The trial was designed to detect a 10-percentage-point difference in mRS 0-3 but the enrolled population had higher baseline severity than anticipated, limiting statistical power.',
    safetyBrief: 'Symptomatic intracranial hemorrhage occurred in 4.5% of the EVT group versus 0.7% of the medical group (P=0.07). Mortality at 90 days was 38.0% EVT versus 43.2% medical, a non-significant difference. The sICH difference trended toward significance, consistent with reperfusion hemorrhage risk in the basilar territory.',
    successorTrialId: 'attention-trial',
    successorTrialDisplay: 'ATTENTION (2022)',
    successorTrialClause: 'for the modern successor trial that established endovascular thrombectomy for basilar artery occlusion',
    chainContext: 'selective use of endovascular thrombectomy for basilar artery occlusion based on imaging and time window',
    /* claimId: basics-bottom-line | source: Langezaal et al., NEJM 2021 */
    bottomLineSummary: 'BASICS randomized 300 patients with basilar artery occlusion at international centers within 6 hours. Primary (mRS 0-3 at 90 days): 44.2% EVT vs 37.7% medical (RR 1.18, CI 0.92–1.50, P=0.19) — not significant but with wide CI not ruling out meaningful benefit. Mortality favored EVT numerically (38.0% vs 43.2%). sICH higher in EVT (4.5% vs 0.7%). ATTENTION (2022) subsequently demonstrated definitive benefit for basilar EVT.',
    inclusionCriteria: [
      'Age 18 years or older',
      'CTA- or MRA-confirmed basilar artery occlusion',
      'Symptom onset or last known well within 6 hours',
      'No contraindication to EVT or best medical treatment',
    ],
    exclusionCriteria: [
      'Bilateral fixed dilated pupils or GCS 5 or lower (catastrophic presentation)',
      'Large established infarct on baseline imaging',
      'Intracranial hemorrhage on baseline CT',
      'Pre-stroke severe disability (mRS 3 or greater)',
      'Contraindication to antiplatelet or antithrombotic therapy',
    ],
  },

  // ── Sub-batch 2: Antiplatelet chain ────────────────────────────────────────

  'match-trial': {
    id: 'match-trial',
    title: 'MATCH Trial',
    subtitle: 'Management of Atherothrombosis with Clopidogrel in High-Risk Patients',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1016/S0140-6736(04)16721-4',
    source: 'Diener et al. (Lancet 2004)',
    listCategory: 'antiplatelets',
    listDescription: 'Aspirin added to clopidogrel vs clopidogrel alone for 18 months after stroke/TIA: no efficacy benefit (15.7% vs 16.7%, RR 0.94, CI 0.84–1.05, P=0.244) and major bleeding doubled (2.6% vs 1.3%). Preceded POINT (2018).',
    stats: {
      sampleSize: { value: '7,599', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'Composite', label: 'Stroke/MI/Vascular Death/Rehospitalization' },
      pValue: { value: '0.244', label: 'Not Significant' },
      effectSize: { value: 'RR 0.94', label: 'No Benefit, Harm Signal (CI 0.84–1.05)' },
    },
    trialDesign: {
      type: [
        'Multinational double-blind placebo-controlled RCT',
        'Recent ischemic stroke or TIA plus at least one additional vascular risk factor',
        'Aspirin 75 mg/day added to clopidogrel 75 mg/day vs clopidogrel alone for 18 months',
        'Comparator arm was clopidogrel monotherapy, not aspirin monotherapy',
      ],
      timeline: '7,599 patients enrolled; 18-month follow-up per patient',
    },
    efficacyResults: {
      treatment: { percentage: 15.7, label: 'Composite endpoint at 18 months', name: 'Aspirin + Clopidogrel' },
      control: { percentage: 16.7, label: 'Composite endpoint at 18 months', name: 'Clopidogrel Alone' },
    },
    intervention: {
      treatment: 'Aspirin 75 mg/day plus clopidogrel 75 mg/day for 18 months',
      control: 'Clopidogrel 75 mg/day plus aspirin-matched placebo for 18 months',
    },
    clinicalContext: 'MATCH tested whether adding aspirin to long-term clopidogrel therapy after stroke or TIA would reduce recurrent vascular events. It found no efficacy benefit and a doubling of major bleeding, establishing that long-duration DAPT causes net harm. This set the stage for CHANCE (2013) and POINT (2018), which showed that short-duration DAPT (21 days) is beneficial. The critical teaching insight: duration of DAPT, not the combination itself, is the key variable.',
    pearls: [
      'No efficacy benefit: 15.7% vs 16.7% composite endpoint (RR 0.94, CI 0.84–1.05, P=0.244)',
      'Major bleeding doubled: 2.6% combination vs 1.3% clopidogrel alone',
      'Comparator was clopidogrel alone, not aspirin alone: important for interpreting results vs CHARISMA',
      '18-month treatment duration; harm emerged with prolonged exposure',
      'Established that long-term DAPT after stroke causes net harm; duration is the critical variable',
    ],
    conclusion: '',
    questionLede: 'In patients with recent ischemic stroke or TIA with at least one additional vascular risk factor already receiving clopidogrel, does adding aspirin reduce recurrent vascular events over 18 months?',
    /* claimId: match-outcomes | source: Diener et al., Lancet 2004, doi: 10.1016/S0140-6736(04)16721-4 */
    primaryOutcomeProse: 'In 7,599 patients with recent ischemic stroke or TIA plus at least one additional vascular risk factor already receiving clopidogrel, adding aspirin 75 mg/day did not reduce the composite endpoint of ischemic stroke, myocardial infarction, vascular death, or rehospitalization for acute ischemia over 18 months. The primary endpoint occurred in 15.7% of the combination group versus 16.7% of the clopidogrel-alone group (relative risk 0.94, 95% CI 0.84 to 1.05, P=0.244). Major bleeding and life-threatening bleeding were both significantly higher with the combination (2.6% vs 1.3%), establishing that adding aspirin to long-term clopidogrel causes harm without efficacy benefit.',
    /* claimId: match-design | source: Diener et al., Lancet 2004 */
    trialDesignNarrative: 'MATCH enrolled patients within 3 months of a qualifying ischemic stroke or TIA who had at least one additional vascular risk factor (prior stroke or TIA, diabetes, symptomatic peripheral arterial disease, or ischemic heart disease). All patients were already receiving clopidogrel 75 mg/day and were randomized to aspirin 75 mg/day or matching placebo for 18 months. The comparator arm was clopidogrel monotherapy, not aspirin monotherapy, a critical design difference from CHARISMA. The primary composite endpoint included ischemic stroke, MI, vascular death, and rehospitalization for acute ischemia.',
    safetyBrief: 'Life-threatening bleeding occurred in 2.6% of the combination group versus 1.3% of the clopidogrel-alone group (absolute difference 1.3%). Major bleeding was similarly doubled. Fatal and intracranial hemorrhage were both numerically higher with the combination. The net harm of adding aspirin to long-term clopidogrel was unambiguous and statistically significant.',
    successorTrialId: 'point-trial',
    successorTrialDisplay: 'POINT (2018)',
    successorTrialClause: 'for the modern successor trial that defined the appropriate short-duration window for dual antiplatelet therapy after minor stroke',
    chainContext: 'short-duration dual antiplatelet therapy after minor stroke or high-risk TIA',
    /* claimId: match-bottom-line | source: Diener et al., Lancet 2004 */
    bottomLineSummary: 'MATCH enrolled 7,599 patients with recent stroke/TIA on clopidogrel and randomized them to add aspirin vs continue clopidogrel alone for 18 months. No efficacy benefit: 15.7% vs 16.7% composite endpoint (RR 0.94, CI 0.84–1.05, P=0.244). Major bleeding doubled: 2.6% vs 1.3%. Established that long-duration DAPT after stroke causes net harm. POINT (2018) subsequently showed short-duration DAPT (21 days) is beneficial; duration is the key variable.',
    inclusionCriteria: [
      'Age 40 years or older',
      'Recent ischemic stroke (within 3 months) or TIA with at least one additional vascular risk factor',
      'Currently receiving clopidogrel 75 mg/day',
      'No contraindication to antiplatelet therapy',
    ],
    exclusionCriteria: [
      'Contraindication to aspirin or clopidogrel',
      'Planned surgical procedure requiring antiplatelet discontinuation',
      'Active bleeding or high bleeding risk',
      'Use of warfarin or other anticoagulation',
      'Severe renal or hepatic impairment',
    ],
  },

  'charisma-trial': {
    id: 'charisma-trial',
    title: 'CHARISMA Trial',
    subtitle: 'Clopidogrel for High Atherothrombotic Risk and Ischemic Stabilization, Management, and Avoidance',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1056/NEJMoa060989',
    source: 'Bhatt et al. (NEJM 2006)',
    listCategory: 'antiplatelets',
    listDescription: 'Aspirin + clopidogrel vs aspirin alone for median 28 months in broad CV risk population: no overall benefit (6.8% vs 7.3%, RR 0.93, CI 0.83–1.05, P=0.22) and harm in asymptomatic subgroup. Preceded POINT (2018).',
    stats: {
      sampleSize: { value: '15,603', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'MI/Stroke/CV Death', label: 'Median 28 Months Follow-up' },
      pValue: { value: '0.22', label: 'Not Significant (Overall)' },
      effectSize: { value: 'RR 0.93', label: 'No Significant Overall Benefit (CI 0.83–1.05)' },
    },
    trialDesign: {
      type: [
        'International double-blind placebo-controlled RCT, 45 countries',
        'Broad CV risk: established CV disease (symptomatic) OR multiple CV risk factors (asymptomatic)',
        'Aspirin + clopidogrel 75 mg/day vs aspirin + placebo; median 28 months',
        'Enrolled both symptomatic (prior stroke/TIA/MI) and asymptomatic high-risk patients',
      ],
      timeline: '15,603 patients; median 28-month follow-up',
    },
    efficacyResults: {
      treatment: { percentage: 6.8, label: 'MI/stroke/CV death (28 months)', name: 'Aspirin + Clopidogrel' },
      control: { percentage: 7.3, label: 'MI/stroke/CV death (28 months)', name: 'Aspirin Alone' },
    },
    intervention: {
      treatment: 'Aspirin (75–162 mg/day per local standard) plus clopidogrel 75 mg/day',
      control: 'Aspirin (75–162 mg/day) plus clopidogrel-matched placebo',
    },
    clinicalContext: 'CHARISMA used a broader population than MATCH, comparing aspirin plus clopidogrel versus aspirin alone across a large heterogeneous cardiovascular risk cohort. The overall trial was negative. A pre-specified subgroup showed modest benefit in symptomatic patients (prior MI, stroke, or ACS) but excess harm in asymptomatic primary-prevention patients. This reinforced that long-duration DAPT is not appropriate as a general cardiovascular prevention strategy and contributed to the design of POINT (2018), which focused on short-duration DAPT in high-risk symptomatic stroke and TIA patients.',
    pearls: [
      'Overall primary: 6.8% combination vs 7.3% aspirin alone (RR 0.93, CI 0.83–1.05, P=0.22); not significant',
      'Pre-specified symptomatic subgroup: RR 0.88 (CI 0.77–0.99); modest benefit signal, not practice-changing alone',
      'Pre-specified asymptomatic subgroup: RR 1.20 (CI 0.91–1.59); excess harm with combination',
      'Moderate bleeding significantly higher with combination: 2.1% vs 1.3%',
      'Reinforced that DAPT harm scales with duration and is especially pronounced in low-risk primary prevention',
    ],
    conclusion: '',
    questionLede: 'In patients with established cardiovascular disease or multiple cardiovascular risk factors, does adding clopidogrel to aspirin reduce MI, stroke, or cardiovascular death over a median 28-month follow-up?',
    /* claimId: charisma-outcomes | source: Bhatt et al., NEJM 2006, doi: 10.1056/NEJMoa060989 */
    primaryOutcomeProse: 'In 15,603 patients with established cardiovascular disease or multiple cardiovascular risk factors, aspirin plus clopidogrel did not significantly reduce the composite of myocardial infarction, stroke, or cardiovascular death over a median 28 months. The primary endpoint occurred in 6.8% of the combination group versus 7.3% of the aspirin-alone group (relative risk 0.93, 95% CI 0.83 to 1.05, P=0.22). A pre-specified symptomatic subgroup analysis showed a nominally favorable signal in patients with prior symptomatic atherothrombotic disease (RR 0.88, 95% CI 0.77 to 0.99), interpreted as hypothesis-generating, while the asymptomatic primary-prevention subgroup showed excess harm (RR 1.20, 95% CI 0.91 to 1.59). Overall there was no significant benefit and a clear bleeding excess with combination therapy.',
    /* claimId: charisma-design | source: Bhatt et al., NEJM 2006 */
    trialDesignNarrative: 'CHARISMA enrolled patients from two populations: established symptomatic atherothrombotic disease (prior MI, ischemic stroke, or symptomatic peripheral arterial disease) and asymptomatic patients with multiple cardiovascular risk factors. All received aspirin at country-standard dose (75–162 mg/day) and were randomized to clopidogrel 75 mg/day or matching placebo. The trial was conducted across 768 centers in 45 countries with a median 28-month follow-up, far longer than the short-duration DAPT studied in CHANCE (2013) and POINT (2018). The duration difference is central to understanding why CHARISMA was negative while short-term trials were positive.',
    safetyBrief: 'Moderate bleeding occurred in 2.1% of the combination group versus 1.3% of the aspirin-alone group (P<0.001). Severe bleeding was similar between groups. There was no significant difference in fatal bleeding. The bleeding excess persisted across the 28-month treatment period, with absolute risk increasing over time.',
    successorTrialId: 'point-trial',
    successorTrialDisplay: 'POINT (2018)',
    successorTrialClause: 'for the modern successor trial that defined the appropriate short-duration window for DAPT in the cerebrovascular subset of patients CHARISMA studied',
    chainContext: 'short-duration dual antiplatelet therapy after minor stroke or high-risk TIA',
    /* claimId: charisma-bottom-line | source: Bhatt et al., NEJM 2006 */
    bottomLineSummary: 'CHARISMA enrolled 15,603 patients with established CV disease or multiple risk factors and compared aspirin+clopidogrel vs aspirin alone over median 28 months. Primary (MI/stroke/CV death): 6.8% vs 7.3% (RR 0.93, CI 0.83–1.05, P=0.22), not significant overall. Symptomatic subgroup: nominally favorable signal (RR 0.88, hypothesis-generating). Asymptomatic subgroup: excess harm (RR 1.20). Moderate bleeding doubled. POINT (2018) showed short-duration DAPT after minor stroke/TIA is beneficial.',
    inclusionCriteria: [
      'Age 45 years or older',
      'Established cardiovascular disease (prior MI, ischemic stroke, or symptomatic PAD) OR multiple cardiovascular risk factors without established disease',
      'Stable on aspirin (75–162 mg/day)',
      'No recent unstable coronary syndrome requiring immediate revascularization',
    ],
    exclusionCriteria: [
      'Need for oral anticoagulation or NSAID therapy',
      'High bleeding risk (recent surgery, active peptic ulcer)',
      'Prior intolerance to aspirin or clopidogrel',
      'Severe renal impairment (creatinine above 2.0 mg/dL)',
      'Life expectancy less than 2 years',
    ],
  },

  // ── Sub-batch 3: ICH surgical chain ────────────────────────────────────────

  'stich-i-trial': {
    id: 'stich-i-trial',
    title: 'STICH I Trial',
    subtitle: 'Surgical Treatment of Intracerebral Hemorrhage',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1016/S0140-6736(05)17826-X',
    source: 'Mendelow et al. (Lancet 2005)',
    listDescription: 'Early surgery vs initial conservative management for supratentorial ICH: no benefit (favorable GOS 26% vs 24%, OR 0.89, CI 0.66–1.19, P=0.414). Post-hoc lobar subgroup signal led to STICH II. Preceded ENRICH (2024).',
    stats: {
      sampleSize: { value: '1,033', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'Favorable GOS', label: 'at 6 Months' },
      pValue: { value: '0.414', label: 'Not Significant' },
      effectSize: { value: 'OR 0.89', label: 'No Benefit (CI 0.66–1.19)' },
    },
    trialDesign: {
      type: [
        'International multicenter RCT, 83 centers in 27 countries',
        'Spontaneous supratentorial ICH within 72 hours of onset',
        'Early surgery (within 24 hours of randomization) vs initial conservative management',
        'Conservative arm permitted delayed surgery if clinical deterioration',
        'Equipoise required: surgeon must have been uncertain which treatment was better',
      ],
      timeline: '1,033 patients enrolled; 27 countries; 6-month follow-up',
    },
    efficacyResults: {
      treatment: { percentage: 26, label: 'Favorable GOS at 6 months', name: 'Early Surgery' },
      control: { percentage: 24, label: 'Favorable GOS at 6 months', name: 'Initial Conservative Management' },
    },
    intervention: {
      treatment: 'Early surgical evacuation within 24 hours of randomization (craniotomy in most cases)',
      control: 'Initial best medical management; delayed surgery permitted if neurological deterioration',
    },
    clinicalContext: 'STICH I was the largest surgical ICH trial of its era. The equipoise requirement excluded definitive surgical and medical candidates, selecting a middle-ground population. Most procedures were open craniotomies, whose invasiveness may have offset the benefit of hematoma removal. A post-hoc subgroup suggested that lobar ICH within 1 cm of the cortical surface might benefit from surgery -- the hypothesis pursued in STICH II. ENRICH (2024) later demonstrated benefit using minimally invasive trans-sulcal surgery, suggesting technique was the barrier, not the concept of hematoma evacuation.',
    pearls: [
      'No significant benefit of early surgery: favorable GOS 26% vs 24% (OR 0.89, CI 0.66–1.19, P=0.414)',
      'Equipoise requirement excluded the clearest surgical and medical candidates',
      'Post-hoc lobar subgroup (ICH within 1 cm of cortex): trend toward benefit; hypothesis-generating only',
      'Predominantly open craniotomy; surgical trauma may have offset hematoma evacuation benefit',
      'Led directly to STICH II targeting the lobar subgroup signal in a dedicated trial',
    ],
    conclusion: '',
    questionLede: 'In patients with spontaneous supratentorial intracerebral hemorrhage, does early surgical evacuation improve 6-month functional outcome compared with initial best medical management?',
    /* claimId: stich-i-outcomes | source: Mendelow et al., Lancet 2005, doi: 10.1016/S0140-6736(05)17826-X */
    primaryOutcomeProse: 'In 1,033 patients with spontaneous supratentorial ICH enrolled at 83 centers across 27 countries, early surgery did not significantly improve favorable functional outcome at 6 months compared with initial conservative management. A favorable outcome on the Glasgow Outcome Scale was achieved in 26% of the early surgery group versus 24% of the initial conservative group (OR 0.89, 95% CI 0.66 to 1.19, P=0.414). The conservative arm allowed delayed surgery if neurological deterioration occurred; 26% of initially conservative patients ultimately underwent surgery. A post-hoc subgroup analysis suggested a possible benefit for superficial lobar ICH within 1 cm of the cortical surface, generating the hypothesis tested in STICH II.',
    /* claimId: stich-i-design | source: Mendelow et al., Lancet 2005 */
    trialDesignNarrative: 'STICH I enrolled patients with spontaneous supratentorial ICH within 72 hours of onset at centers across 27 countries. The critical design feature was the equipoise requirement: surgeons enrolled only those patients for whom they were genuinely uncertain whether surgery or conservative management was superior. This excluded patients with clear indications in either direction. Most surgical procedures were open craniotomies, which carry their own morbidity from brain retraction and cortical transgression. The primary outcome was the Glasgow Outcome Scale (GOS) at 6 months, dichotomized as favorable (good recovery or moderate disability) versus unfavorable.',
    safetyBrief: 'Unfavorable outcome (death or severe disability on GOS) at 6 months was 74% in the surgical group versus 76% in the conservative group, a non-significant difference. Mortality at 6 months was approximately 36% in the surgical group and 37% in the conservative group, a non-significant difference. No significant difference in safety outcomes was demonstrated between early surgery and conservative management.',
    successorTrialId: 'enrich-trial',
    successorTrialDisplay: 'ENRICH (2024)',
    successorTrialClause: 'for the modern successor trial that established minimally invasive evacuation for selected lobar intracerebral hemorrhage',
    chainContext: 'minimally invasive evacuation of selected lobar intracerebral hematomas',
    /* claimId: stich-i-bottom-line | source: Mendelow et al., Lancet 2005 */
    bottomLineSummary: 'STICH I enrolled 1,033 patients with supratentorial ICH from 27 countries. Early surgery showed no significant benefit: favorable GOS at 6 months 26% vs 24% (OR 0.89, CI 0.66–1.19, P=0.414). The equipoise requirement and predominant use of open craniotomy limited the detectable benefit. Post-hoc lobar subgroup signal led to STICH II. ENRICH (2024) later showed benefit with minimally invasive trans-sulcal surgery in selected lobar ICH.',
    inclusionCriteria: [
      'Spontaneous supratentorial ICH confirmed on CT',
      'Within 72 hours of ictus',
      'Surgeon uncertain whether surgery or conservative management was better (equipoise required)',
      'Hematoma volume and location deemed surgically accessible',
    ],
    exclusionCriteria: [
      'Infratentorial hemorrhage (posterior fossa)',
      'ICH secondary to known cause (aneurysm, AVM, tumor, anticoagulation)',
      'GCS 3 or 4 (catastrophic)',
      'Definitive surgical or definitive conservative indication (no equipoise)',
      'Significant pre-stroke disability',
    ],
  },

  'stich-ii-trial': {
    id: 'stich-ii-trial',
    title: 'STICH II Trial',
    subtitle: 'Surgical Treatment of Intracerebral Hemorrhage II — Superficial Lobar ICH',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1016/S0140-6736(13)60986-1',
    source: 'Mendelow et al. (Lancet 2013)',
    listDescription: 'Early surgery vs conservative management for superficial lobar ICH (10–100 mL, within 1 cm of cortex): no significant benefit (unfavorable outcome 59% surgery vs 62% conservative, OR 0.86, CI 0.62–1.20, P=0.367). STICH I lobar subgroup signal not confirmed. Preceded ENRICH (2024).',
    stats: {
      sampleSize: { value: '601', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'Unfavorable Outcome', label: 'at 6 Months' },
      pValue: { value: '0.367', label: 'Not Significant' },
      effectSize: { value: 'OR 0.86', label: 'Slight Favor Surgery, Not Significant (CI 0.62–1.20)' },
    },
    trialDesign: {
      type: [
        'International multicenter RCT; designed to test STICH I lobar subgroup signal',
        'Lobar ICH only: 10–100 mL, within 1 cm of cortical surface, no IVH',
        'Early craniotomy within 12 hours of randomization vs initial conservative management',
        'GCS 5 or greater required at enrollment',
        'Equipoise requirement retained from STICH I design',
      ],
      timeline: '601 patients enrolled; full enrollment target achieved',
    },
    efficacyResults: {
      treatment: { percentage: 59, label: 'Unfavorable outcome at 6 months', name: 'Early Surgery' },
      control: { percentage: 62, label: 'Unfavorable outcome at 6 months', name: 'Initial Conservative Management' },
    },
    intervention: {
      treatment: 'Early craniotomy and hematoma evacuation within 12 hours of randomization',
      control: 'Initial best medical management; delayed surgery permitted if clinical deterioration',
    },
    clinicalContext: 'STICH II was a focused test of the hypothesis that superficial lobar ICH specifically benefits from early surgery. Despite recruiting 601 patients meeting these criteria, the primary endpoint was not met. The absolute difference was 3 percentage points (59% vs 62% unfavorable) with a wide confidence interval. Open craniotomy remained the predominant technique. ENRICH (2024) later tested minimally invasive trans-sulcal surgery in a similar population and demonstrated a positive result, suggesting that the surgical approach rather than the concept was the barrier.',
    pearls: [
      'Lobar ICH-specific: excluded all deep and posterior fossa hemorrhages',
      'Primary (unfavorable outcome at 6 months): 59% surgery vs 62% conservative (OR 0.86, CI 0.62–1.20, P=0.367)',
      'STICH I lobar subgroup signal was not confirmed in this dedicated powered trial',
      'Absolute difference was 3 percentage points with wide CI: insufficient precision',
      'Predominantly used open craniotomy, the same technique limitation as STICH I',
    ],
    conclusion: '',
    questionLede: 'In patients with spontaneous superficial lobar intracerebral hemorrhage (10–100 mL, within 1 cm of cortex), does early surgical evacuation improve 6-month functional outcome compared with initial best medical management?',
    /* claimId: stich-ii-outcomes | source: Mendelow et al., Lancet 2013, doi: 10.1016/S0140-6736(13)60986-1 */
    primaryOutcomeProse: 'In 601 patients with spontaneous superficial lobar ICH (10–100 mL, within 1 cm of the cortical surface, no intraventricular extension) enrolled using equipoise-based randomization, early surgical evacuation did not significantly reduce unfavorable functional outcome at 6 months. Unfavorable outcome occurred in 59% (174 of 307) of the surgical group versus 62% (178 of 286) of the conservative group (OR 0.86, 95% CI 0.62 to 1.20, P=0.367). The STICH I lobar subgroup signal was not confirmed in this dedicated, adequately powered trial.',
    /* claimId: stich-ii-design | source: Mendelow et al., Lancet 2013 */
    trialDesignNarrative: 'STICH II was designed based on the STICH I post-hoc finding that lobar ICH within 1 cm of the cortical surface might benefit from early surgery. The trial enrolled patients with spontaneous superficial lobar ICH (10–100 mL, within 1 cm of cortex, no intraventricular extension, GCS 5 or greater) using the same equipoise-based design as STICH I. Early surgery was required within 12 hours of randomization and was predominantly craniotomy. The conservative arm allowed delayed surgery if the patient deteriorated; 21% of initially conservative patients ultimately required surgery. The primary outcome was a prognosis-adjusted endpoint: favorable or unfavorable outcome at 6 months.',
    safetyBrief: 'Mortality at 6 months was 18% in the surgical group versus 24% in the conservative group (not statistically significant). Surgical complications and rebleeding were not significantly different between groups. The surgical arm had more early procedure-related events but achieved numerically lower mortality; neither difference was statistically significant.',
    successorTrialId: 'enrich-trial',
    successorTrialDisplay: 'ENRICH (2024)',
    successorTrialClause: 'for the modern successor trial that established minimally invasive evacuation for selected lobar intracerebral hemorrhage',
    chainContext: 'minimally invasive evacuation of selected lobar intracerebral hematomas',
    /* claimId: stich-ii-bottom-line | source: Mendelow et al., Lancet 2013 */
    bottomLineSummary: 'STICH II enrolled 601 patients with superficial lobar ICH to test the STICH I lobar subgroup signal. Primary (unfavorable outcome at 6 months): 59% surgery vs 62% conservative (OR 0.86, CI 0.62–1.20, P=0.367) — not significant. The STICH I hypothesis was not confirmed. ENRICH (2024) subsequently demonstrated benefit using minimally invasive trans-sulcal surgery, suggesting technique was the critical variable.',
    inclusionCriteria: [
      'Spontaneous lobar ICH confirmed on CT',
      'Hematoma volume 10 to 100 mL',
      'Hematoma within 1 cm of the cortical surface (superficial lobar)',
      'No intraventricular hemorrhage',
      'GCS 5 or greater at enrollment',
      'Surgeon uncertain whether surgery or conservative management was better',
    ],
    exclusionCriteria: [
      'Deep ICH (basal ganglia, thalamus, internal capsule)',
      'Posterior fossa hemorrhage',
      'Intraventricular extension',
      'ICH secondary to identified cause (AVM, aneurysm, tumor)',
      'GCS 3 or 4 (catastrophic presentation)',
      'Significant pre-stroke disability',
    ],
  },

  'mistie-iii-trial': {
    id: 'mistie-iii-trial',
    title: 'MISTIE III Trial',
    subtitle: 'Minimally Invasive Surgery Plus rt-PA for ICH Evacuation',
    category: 'Neuro Trials',
    isStub: true,
    trialResult: 'NEGATIVE',
    archetypeId: 'A' as const,
    doi: '10.1016/S0140-6736(19)30195-3',
    source: 'Hanley et al. (Lancet 2019)',
    listDescription: 'Image-guided catheter plus alteplase vs conservative management for ICH 30 mL or larger: no primary benefit (mRS 0-3 at 1 year 45% vs 41%, OR 1.20, CI 0.81–1.81, P=0.33). Pre-specified end-of-treatment hematoma ≤15 mL subgroup showed benefit. Preceded ENRICH (2024).',
    stats: {
      sampleSize: { value: '506', label: 'Randomized Patients' },
      primaryEndpoint: { value: 'mRS 0-3', label: 'at 1 Year' },
      pValue: { value: '0.33', label: 'Not Significant' },
      effectSize: { value: 'OR 1.20', label: 'No Significant Benefit (CI 0.81–1.81)' },
    },
    trialDesign: {
      type: [
        'International multicenter phase 3 RCT',
        'Supratentorial ICH 30 mL or larger confirmed on CT',
        'CT-guided stereotactic catheter into hematoma; intermittent alteplase (1 mg every 8 hours, up to 9 doses)',
        'Treatment target: residual hematoma volume 15 mL or less before catheter removal',
        'Compared with standard medical management (no hematoma evacuation)',
      ],
      timeline: '506 patients; completed as planned; 1-year follow-up',
    },
    efficacyResults: {
      treatment: { percentage: 45, label: 'mRS 0-3 at 1 year', name: 'MISTIE (Catheter + Alteplase)' },
      control: { percentage: 41, label: 'mRS 0-3 at 1 year', name: 'Standard Medical Management' },
    },
    intervention: {
      treatment: 'CT-guided stereotactic catheter into hematoma with intermittent alteplase (1 mg every 8 hours, up to 9 doses) targeting residual volume 15 mL or less',
      control: 'Standard medical management (no hematoma evacuation)',
    },
    clinicalContext: 'MISTIE III tested a catheter-based approach to hematoma evacuation: image-guided placement followed by intermittent alteplase to lyse and drain the clot. The overall trial was negative, but a pre-specified subgroup showed benefit in patients achieving end-of-treatment hematoma volume 15 mL or less, suggesting that the degree of clot clearance, not just the technique, is the critical variable. This observation informed ENRICH, which used a trans-sulcal surgical approach achieving faster and more complete evacuation in selected lobar ICH.',
    pearls: [
      'Primary negative: mRS 0-3 at 1 year 45% vs 41% (OR 1.20, CI 0.81–1.81, P=0.33)',
      'Pre-specified end-of-treatment hematoma ≤15 mL subgroup: OR approximately 1.79 (CI 1.03–3.12); significant',
      'Procedural sICH 5.8% MISTIE vs 1.9% control during treatment period',
      'Established that greater hematoma reduction (≤15 mL residual) correlates with better outcomes',
      'ENRICH (2024) achieved more complete evacuation with trans-sulcal surgery; positive result',
    ],
    conclusion: '',
    questionLede: 'In patients with supratentorial intracerebral hemorrhage of 30 mL or larger, does image-guided catheter placement plus intermittent alteplase improve 1-year functional outcome compared with standard medical management?',
    /* claimId: mistie-iii-outcomes | source: Hanley et al., Lancet 2019, doi: 10.1016/S0140-6736(19)30195-3 */
    primaryOutcomeProse: 'In 506 patients with supratentorial ICH 30 mL or larger randomized to image-guided catheter plus alteplase or standard medical management, MISTIE did not significantly improve functional independence (mRS 0-3) at 1 year. mRS 0-3 was achieved in 45% (110 of 245) in the MISTIE group versus 41% (103 of 250) in the standard care group (adjusted OR 1.20, 95% CI 0.81 to 1.81, P=0.33). A pre-specified subgroup analysis showed a significant benefit in patients achieving end-of-treatment hematoma volume 15 mL or less (OR approximately 1.79, 95% CI 1.03 to 3.12), suggesting that the degree of hematoma reduction, not just the technique, is the critical determinant of outcome.',
    /* claimId: mistie-iii-design | source: Hanley et al., Lancet 2019 */
    trialDesignNarrative: 'MISTIE III was an international phase 3 RCT enrolling patients with supratentorial ICH 30 mL or larger who were at least 12 hours from ictus and clinically stable. A CT-guided stereotactic catheter was placed into the hematoma and alteplase (1 mg every 8 hours, up to 9 doses over approximately 72 hours) was instilled to lyse the clot; fluid was drained passively. The target was residual hematoma 15 mL or less before catheter removal. The 1-year follow-up was longer than most surgical ICH trials. MISTIE differed fundamentally from ENRICH in technique: catheter-based lysis versus trans-sulcal surgical aspiration, with the latter achieving faster and more complete evacuation.',
    safetyBrief: 'Procedural symptomatic intracranial hemorrhage occurred in 5.8% of MISTIE patients during the treatment period versus 1.9% in the standard care group. Bacterial meningitis or ventriculitis occurred in 5.7% of MISTIE patients from prolonged catheter indwelling. There was no significant difference in overall 1-year mortality between groups.',
    successorTrialId: 'enrich-trial',
    successorTrialDisplay: 'ENRICH (2024)',
    successorTrialClause: 'for the modern successor trial that established minimally invasive evacuation for selected lobar intracerebral hemorrhage',
    chainContext: 'minimally invasive evacuation of selected lobar intracerebral hematomas',
    /* claimId: mistie-iii-bottom-line | source: Hanley et al., Lancet 2019 */
    bottomLineSummary: 'MISTIE III enrolled 506 patients with ICH 30 mL or larger and tested catheter-based clot lysis vs standard care. Primary negative: mRS 0-3 at 1 year 45% vs 41% (OR 1.20, CI 0.81–1.81, P=0.33). Pre-specified end-of-treatment hematoma ≤15 mL subgroup showed benefit (OR ~1.79, CI 1.03–3.12). Established that greater hematoma reduction correlates with better outcomes. ENRICH (2024) achieved this more reliably with trans-sulcal surgical access.',
    inclusionCriteria: [
      'Supratentorial spontaneous ICH 30 mL or larger on baseline CT',
      'Age 18 years or older',
      'At least 12 hours post-ictus (clinical stability required)',
      'Hematoma accessible for stereotactic catheter placement',
      'GCS 5 or greater',
    ],
    exclusionCriteria: [
      'Infratentorial (posterior fossa) hemorrhage',
      'ICH secondary to anticoagulation, AVM, aneurysm, or tumor',
      'Planned early craniotomy within 24 hours',
      'Intraventricular hemorrhage causing obstructive hydrocephalus requiring immediate intervention',
      'INR above 1.5 or platelets below 100,000 at enrollment',
    ],
  },
};
