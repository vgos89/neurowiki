// HOME_SPEC §1.4.3 — scenario manifest
// HOME_SPEC §4.1 — data shape
// HOME_SPEC §4.2 — resolveTool helper
import { findTrialById } from './trialListData';

export type ScenarioId =
  | 'acute-stroke'
  | 'ich'
  | 'status-epilepticus'
  | 'severe-headache'
  | 'altered-mental-status';

export type ScenarioToolType = 'trial' | 'calculator' | 'pathway' | 'guide';

export type ScenarioToolRef = {
  type: ScenarioToolType;
  id: string;
};

export type Scenario = {
  id: ScenarioId;
  pillLabel: string;
  title: string;
  lede: string;
  categoryColor: string;
  pillDotClass: string;
  tools: ScenarioToolRef[];
};

export type ToolRowData = {
  href: string;
  category: string;
  title: string;
  titleMeta?: string;
  description: string;
};

// Map TrialItem.category → row class (HUB_SPEC Appendix A)
const TRIAL_CATEGORY_TO_ROW: Record<string, string> = {
  ivt: 'ivt',
  evt: 'evt',
  'secondary-prevention': 'prevention',
  'surgical-interventions': 'surgical',
  'acute-management': 'status',
  'prehospital-triage': 'status',
};

// Lookup table for non-trial tools (calculators / pathways / guides)
const NON_TRIAL_TOOLS: Record<
  string,
  { title: string; description: string; href: string; category: string }
> = {
  // pathways
  'stroke-code': {
    title: 'Stroke Code',
    description: 'Door-to-needle protocol.',
    href: '/pathways/stroke-code',
    category: 'evt',
  },
  'late-window-ivt': {
    title: 'Late-Window IVT',
    description: 'tPA in 4.5–9 h or wake-up stroke.',
    href: '/pathways/late-window-ivt',
    category: 'ivt',
  },
  'evt-pathway': {
    title: 'EVT Pathway',
    description: 'LVO triage from imaging to groin puncture.',
    href: '/pathways/evt-pathway',
    category: 'evt',
  },
  'se-pathway': {
    title: 'SE Pathway',
    description: 'Stage 1–3 status epilepticus management.',
    href: '/pathways/se-pathway',
    category: 'status',
  },
  'migraine-pathway': {
    title: 'Migraine Pathway',
    description: 'ED and inpatient headache management.',
    href: '/pathways/migraine-pathway',
    category: 'prevention',
  },
  'gca-pathway': {
    title: 'GCA Pathway',
    description: 'Suspected giant cell arteritis workup.',
    href: '/pathways/gca-pathway',
    category: 'prevention',
  },
  // calculators
  nihss: {
    title: 'NIHSS',
    description: '11-item neurological deficit scale. Range 0–42.',
    href: '/calculators/nihss',
    category: 'cobalt',
  },
  'aspects-score': {
    title: 'ASPECTS',
    description: '10-region ischemic change score. Range 0–10.',
    href: '/calculators/aspects-score',
    category: 'cobalt',
  },
  'ich-score': {
    title: 'ICH Score',
    description: '30-day mortality prediction. Range 0–6.',
    href: '/calculators/ich-score',
    category: 'cobalt',
  },
  'heidelberg-bleeding-classification': {
    title: 'Heidelberg Bleeding',
    description: 'Classifies HT after reperfusion therapy.',
    href: '/calculators/heidelberg-bleeding-classification',
    category: 'cobalt',
  },
  'glasgow-coma-scale': {
    title: 'Glasgow Coma Scale',
    description: 'Eye, verbal, motor — range 3–15.',
    href: '/calculators/glasgow-coma-scale',
    category: 'cobalt',
  },
  'boston-criteria-caa': {
    title: 'Boston Criteria 2.0',
    description: 'Cerebral amyloid angiopathy diagnosis.',
    href: '/calculators/boston-criteria-caa',
    category: 'cobalt',
  },
  // guides
  'ich-management': {
    title: 'ICH Management',
    description: 'Blood pressure, reversal, and surgical considerations.',
    href: '/guide/ich-management',
    category: 'surgical',
  },
  'status-epilepticus': {
    title: 'Status Epilepticus Mgmt',
    description: 'Protocol for refractory SE management.',
    href: '/guide/status-epilepticus',
    category: 'status',
  },
  'seizure-workup': {
    title: 'Seizure Workup',
    description: 'First seizure evaluation and EEG interpretation.',
    href: '/guide/seizure-workup',
    category: 'status',
  },
  'headache-workup': {
    title: 'Headache Workup',
    description: 'Red flags, thunderclap, and secondary causes.',
    href: '/guide/headache-workup',
    category: 'prevention',
  },
  'altered-mental-status': {
    title: 'AMS Workup',
    description: 'Systematic approach to acute confusion.',
    href: '/guide/altered-mental-status',
    category: 'cobalt',
  },
  meningitis: {
    title: 'Meningitis',
    description: 'Empiric antibiotics, LP, CSF analysis.',
    href: '/guide/meningitis',
    category: 'cobalt',
  },
};

// HOME_SPEC §4.2 — dispatches by ref.type to the appropriate data source.
// Returns null when the referenced tool is missing (with a dev console warning).
export function resolveTool(ref: ScenarioToolRef): ToolRowData | null {
  if (ref.type === 'trial') {
    const trial = findTrialById(ref.id);
    if (!trial) {
      if (import.meta.env.DEV) {
        console.warn(`[scenarios] Trial not found: ${ref.id}`);
      }
      return null;
    }
    return {
      href: trial.path,
      category: TRIAL_CATEGORY_TO_ROW[trial.category] ?? 'general',
      title: trial.name,
      titleMeta: trial.year > 0 ? String(trial.year) : undefined,
      description: trial.legend?.finding ?? trial.description ?? trial.name,
    };
  }
  const meta = NON_TRIAL_TOOLS[ref.id];
  if (!meta) {
    if (import.meta.env.DEV) {
      console.warn(`[scenarios] Tool not found: ${ref.type}/${ref.id}`);
    }
    return null;
  }
  return {
    href: meta.href,
    category: meta.category,
    title: meta.title,
    description: meta.description,
  };
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'acute-stroke',
    pillLabel: 'Acute stroke',
    title: 'Acute ischemic stroke',
    lede: 'Within 24 h of onset.',
    categoryColor: '#10b981',
    pillDotClass: 'dot-ivt',
    tools: [
      { type: 'pathway', id: 'stroke-code' },
      { type: 'pathway', id: 'late-window-ivt' },
      { type: 'pathway', id: 'evt-pathway' },
      { type: 'calculator', id: 'nihss' },
      { type: 'calculator', id: 'aspects-score' },
    ],
  },
  {
    id: 'ich',
    pillLabel: 'ICH',
    title: 'ICH',
    lede: 'Intracerebral haemorrhage.',
    categoryColor: '#7c3aed',
    pillDotClass: 'dot-surgical',
    tools: [
      // ICH Management exists only as a guide article; HOME_SPEC §1.4.3 labels it
      // pathway. Tracked as a surfaced issue in the rebuild report.
      { type: 'guide', id: 'ich-management' },
      { type: 'calculator', id: 'ich-score' },
      { type: 'calculator', id: 'heidelberg-bleeding-classification' },
      { type: 'trial', id: 'enrich-trial' },
    ],
  },
  {
    id: 'status-epilepticus',
    pillLabel: 'Status',
    title: 'Status epilepticus',
    lede: 'Ongoing or recurrent seizure.',
    categoryColor: '#f59e0b',
    pillDotClass: 'dot-status',
    tools: [
      { type: 'pathway', id: 'se-pathway' },
      { type: 'guide', id: 'status-epilepticus' },
      { type: 'guide', id: 'seizure-workup' },
    ],
  },
  {
    id: 'severe-headache',
    pillLabel: 'Headache',
    title: 'Severe headache',
    lede: 'Thunderclap, red flags, or refractory.',
    categoryColor: '#0891b2',
    pillDotClass: 'dot-prevention',
    tools: [
      { type: 'pathway', id: 'migraine-pathway' },
      { type: 'pathway', id: 'gca-pathway' },
      { type: 'guide', id: 'headache-workup' },
      { type: 'calculator', id: 'boston-criteria-caa' },
    ],
  },
  {
    id: 'altered-mental-status',
    pillLabel: 'AMS',
    title: 'Altered mental status',
    lede: 'Acute confusion or encephalopathy.',
    categoryColor: '#94a3b8',
    pillDotClass: 'dot-general',
    tools: [
      { type: 'calculator', id: 'glasgow-coma-scale' },
      { type: 'guide', id: 'altered-mental-status' },
      { type: 'guide', id: 'meningitis' },
    ],
  },
];

export const VISIBLE_BEFORE_FOLD = 3;

export function getScenario(id: string): Scenario | undefined {
  return SCENARIOS.find((s) => s.id === id);
}
