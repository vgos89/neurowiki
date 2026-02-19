/**
 * Trial list for Neuro Trials filter page.
 * Layout matches Clinical Tools (Calculators): categories, pills, card list with blurbs.
 *
 * HOW TO ADD A NEW TRIAL TO THIS LIST:
 * 1. Add the trial entry to `TRIAL_DATA` in `trialData.ts`
 * 2. Set `listCategory` (required) and `listDescription` (optional) on the entry
 * 3. Done — the trial will appear automatically on the /trials page
 *
 * The `trials` array is derived from `TRIAL_DATA` at module load time.
 * No need to manually update this file.
 *
 * STUB TRIALS (no full detail page yet — listed here manually):
 * Add entries to `STUB_TRIALS` below for trials that only have a listing entry
 * but no full TrialPageNew page yet.
 */

import { TRIAL_DATA } from './trialData';

export type TrialCategoryKey =
  | 'thrombolysis'
  | 'thrombectomy'
  | 'antiplatelets'
  | 'carotid'
  | 'acute';

export interface TrialItem {
  id: string;
  name: string;
  description: string;
  category: TrialCategoryKey;
  path: string;
}

export const categoryStyles: Record<
  string,
  { dot: string; text: string; border: string; pillBg: string; pillText: string; pillActive: string }
> = {
  thrombolysis: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-l-emerald-500',
    pillBg: 'bg-emerald-50 border-emerald-200',
    pillText: 'text-emerald-700',
    pillActive: 'bg-emerald-600 text-white border-emerald-600',
  },
  thrombectomy: {
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-l-blue-500',
    pillBg: 'bg-blue-50 border-blue-200',
    pillText: 'text-blue-700',
    pillActive: 'bg-blue-600 text-white border-blue-600',
  },
  antiplatelets: {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-l-amber-500',
    pillBg: 'bg-amber-50 border-amber-200',
    pillText: 'text-amber-700',
    pillActive: 'bg-amber-600 text-white border-amber-600',
  },
  carotid: {
    dot: 'bg-violet-500',
    text: 'text-violet-700',
    border: 'border-l-violet-500',
    pillBg: 'bg-violet-50 border-violet-200',
    pillText: 'text-violet-700',
    pillActive: 'bg-violet-600 text-white border-violet-600',
  },
  acute: {
    dot: 'bg-slate-500',
    text: 'text-slate-700',
    border: 'border-l-slate-500',
    pillBg: 'bg-slate-100 border-slate-200',
    pillText: 'text-slate-700',
    pillActive: 'bg-slate-600 text-white border-slate-600',
  },
};

export const categoryNames: Record<TrialCategoryKey, string> = {
  thrombolysis: 'Thrombolysis',
  antiplatelets: 'Antiplatelets & Prevention',
  thrombectomy: 'Thrombectomy',
  carotid: 'Carotid & Intracranial',
  acute: 'Acute Management',
};

/**
 * Stub trials that have a listing entry but no full TrialPageNew detail page yet.
 * Once you build the full page, move the entry to trialData.ts instead.
 */
const STUB_TRIALS: TrialItem[] = [
  { id: 'nascet-trial', name: 'NASCET', description: 'Carotid endarterectomy for symptomatic stenosis.', category: 'carotid', path: '/trials/nascet-trial' },
  { id: 'crest-trial', name: 'CREST', description: 'Carotid stenting vs endarterectomy.', category: 'carotid', path: '/trials/crest-trial' },
  { id: 'shine-trial', name: 'SHINE', description: 'Intensive vs standard BP in intracerebral hemorrhage.', category: 'acute', path: '/trials/shine-trial' },
];

/**
 * Flat list of trials derived automatically from TRIAL_DATA.
 * Any trial with a `listCategory` field will appear here.
 * Order matches the insertion order of TRIAL_DATA keys.
 */
const DERIVED_TRIALS: TrialItem[] = Object.values(TRIAL_DATA)
  .filter((t): t is typeof t & { listCategory: TrialCategoryKey } => !!t.listCategory)
  .map((t) => ({
    id: t.id,
    name: t.title,
    description: t.listDescription ?? (t.clinicalContext.slice(0, 110) + '…'),
    category: t.listCategory,
    path: `/trials/${t.id}`,
  }));

/** Flat list of all trials for the filter/list page. */
export const trials: TrialItem[] = [...DERIVED_TRIALS, ...STUB_TRIALS];

export const TRIAL_CATEGORY_IDS: TrialCategoryKey[] = [
  'thrombolysis',
  'thrombectomy',
  'antiplatelets',
  'carotid',
  'acute',
];

export function groupTrialsByCategory(trialsList: TrialItem[]): Record<string, TrialItem[]> {
  const groups: Record<string, TrialItem[]> = {};
  TRIAL_CATEGORY_IDS.forEach((cat) => {
    groups[cat] = [];
  });
  trialsList.forEach((t) => {
    if (groups[t.category]) groups[t.category].push(t);
  });
  Object.keys(groups).forEach((key) => {
    if (groups[key].length === 0) delete groups[key];
  });
  return groups;
}
