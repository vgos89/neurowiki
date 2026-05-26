// HUB_SPEC §1 — Calculators hub data (single source of truth for hub display)
// HUB_SPEC §1.5 — fnCategory drives section grouping: severity | risk | classification
// HUB_SPEC §1.6.4 — scoreRange drives trail slot; scoreLabel for classification entries
// Calculator tool identity: id matches useFavorites key

export type FnCategory = 'severity' | 'risk' | 'classification';

export interface CalculatorEntry {
  id: string;
  name: string;
  description: string;
  fnCategory: FnCategory;
  path: string;
  scoreRange?: { min: string; max: string }; // numeric range — max is bolded per §1.6.4
  scoreLabel?: string;                        // classification calcs: e.g. 'Class', 'Code'
}

// HUB_SPEC §5 — section sort: alphabetical by name within each fnCategory
export const CALCULATORS: CalculatorEntry[] = [
  // ── Severity ────────────────────────────────────────────────────────────────
  {
    id: 'aspects',
    name: 'ASPECTS',
    description: 'Alberta Stroke Program Early CT Score — ischemic burden in MCA territory.',
    fnCategory: 'severity',
    path: '/calculators/aspects-score',
    scoreRange: { min: '0', max: '10' },
  },
  {
    id: 'gcs',
    name: 'Glasgow Coma Scale',
    description: '3-item conscious-level score: eye, verbal, motor response.',
    fnCategory: 'severity',
    path: '/calculators/glasgow-coma-scale',
    scoreRange: { min: '3', max: '15' },
  },
  {
    id: 'ich',
    name: 'ICH Score',
    description: '30-day mortality prediction for intracerebral hemorrhage.',
    fnCategory: 'severity',
    path: '/calculators/ich-score',
    scoreRange: { min: '0', max: '6' },
  },
  {
    id: 'nihss',
    name: 'NIHSS',
    description: '15-item stroke severity exam validated for IVT/EVT decisions.',
    fnCategory: 'severity',
    path: '/calculators/nihss',
    scoreRange: { min: '0', max: '42' },
  },
  // ── Risk ─────────────────────────────────────────────────────────────────────
  {
    id: 'abcd2',
    name: 'ABCD² Score',
    description: 'TIA stroke risk prediction within 2 days.',
    fnCategory: 'risk',
    path: '/calculators/abcd2-score',
    scoreRange: { min: '0', max: '7' },
  },
  {
    id: 'ascvd-risk',
    name: 'ASCVD 10-Year Risk',
    description: 'ACC/AHA Pooled Cohort Equations — 10-year atherosclerotic CV event risk.',
    fnCategory: 'risk',
    path: '/calculators/ascvd-risk',
    scoreRange: { min: '0%', max: '≥20%' },
  },
  {
    id: 'chads-vasc',
    name: 'CHA₂DS₂-VASc',
    description: 'Annual stroke risk in non-valvular AFib; guides anticoagulation decision.',
    fnCategory: 'risk',
    path: '/calculators/chads-vasc',
    scoreRange: { min: '0', max: '9' },
  },
  {
    id: 'has-bled',
    name: 'HAS-BLED',
    description: 'Major bleeding risk on anticoagulation.',
    fnCategory: 'risk',
    path: '/calculators/has-bled-score',
    scoreRange: { min: '0', max: '9' },
  },
  {
    id: 'rope',
    name: 'RoPE Score',
    description: 'PFO-attributable fraction in cryptogenic stroke.',
    fnCategory: 'risk',
    path: '/calculators/rope-score',
    scoreRange: { min: '0', max: '10' },
  },
  // ── Classification ───────────────────────────────────────────────────────────
  {
    id: 'boston-caa',
    name: 'Boston Criteria 2.0',
    description: 'Diagnose cerebral amyloid angiopathy from MRI findings.',
    fnCategory: 'classification',
    path: '/calculators/boston-criteria-caa',
    scoreLabel: 'Class',
  },
  {
    id: 'em-billing',
    name: 'E/M Billing',
    description: 'CPT code selection via MDM and time-based billing (2021 AMA).',
    fnCategory: 'classification',
    path: '/calculators/em-billing',
    scoreLabel: 'Code',
  },
  {
    id: 'heidelberg-bleeding',
    name: 'Heidelberg Bleeding',
    description: 'Hemorrhagic transformation after reperfusion (tPA/thrombectomy).',
    fnCategory: 'classification',
    path: '/calculators/heidelberg-bleeding-classification',
    scoreLabel: 'Class',
  },
];

export const FN_CATEGORIES: { id: FnCategory; label: string; dotClass: string; lede: string }[] = [
  {
    id: 'severity',
    label: 'Severity',
    dotClass: 'dot-severity',
    lede: 'Quantify how severe a deficit, injury, or insult is.',
  },
  {
    id: 'risk',
    label: 'Risk',
    dotClass: 'dot-risk',
    lede: 'Predict the probability of an outcome over time.',
  },
  {
    id: 'classification',
    label: 'Classification',
    dotClass: 'dot-classification',
    lede: 'Assign a category, grade, or stage.',
  },
];
