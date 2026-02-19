/**
 * Trial list for Neuro Trials filter page.
 * Layout matches Clinical Tools (Calculators): categories, pills, card list with blurbs.
 * Blurbs: one-line, resident-focused, actionable (content-writer style).
 */

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

/** Flat list of trials with blurbs for the filter/list page. */
export const trials: TrialItem[] = [
  { id: 'ninds-trial', name: 'NINDS IV tPA (0-3h)', description: 'Landmark trial establishing IV tPA within 3 hours; 42.6% vs 27.2% favorable outcome.', category: 'thrombolysis', path: '/trials/ninds-trial' },
  { id: 'original-trial', name: 'ORIGINAL Tenecteplase vs Alteplase', description: 'Tenecteplase noninferior to alteplase for AIS within 4.5h; 72.7% vs 70.3% mRS 0–1 (JAMA 2024).', category: 'thrombolysis', path: '/trials/original-trial' },
  { id: 'ecass3-trial', name: 'ECASS III IV tPA (3-4.5h)', description: 'Extended IV tPA window to 4.5 hours; 52.4% vs 45.2% mRS 0-1.', category: 'thrombolysis', path: '/trials/ecass3-trial' },
  { id: 'extend-trial', name: 'EXTEND tPA 4.5-9 Hours', description: 'tPA 4.5–9h and wake-up stroke with perfusion mismatch selection.', category: 'thrombolysis', path: '/trials/extend-trial' },
  { id: 'eagle-trial', name: 'EAGLE IA tPA for CRAO', description: 'IV tPA for central retinal artery occlusion.', category: 'thrombolysis', path: '/trials/eagle-trial' },
  { id: 'wake-up-trial', name: 'WAKE-UP MRI-Guided Thrombolysis', description: 'MRI DWI–FLAIR mismatch for thrombolysis in unknown-onset stroke.', category: 'thrombolysis', path: '/trials/wake-up-trial' },
  { id: 'distal-trial', name: 'DISTAL EVT for Medium/Distal Vessels', description: 'EVT for medium and distal vessel occlusions.', category: 'thrombectomy', path: '/trials/distal-trial' },
  { id: 'escape-mevo-trial', name: 'ESCAPE-MeVO EVT for MeVO', description: 'EVT for medium vessel occlusion (MeVO).', category: 'thrombectomy', path: '/trials/escape-mevo-trial' },
  { id: 'defuse-3-trial', name: 'DEFUSE 3 Thrombectomy 6-16 Hours', description: 'Thrombectomy 6–16 hours with perfusion imaging selection.', category: 'thrombectomy', path: '/trials/defuse-3-trial' },
  { id: 'dawn-trial', name: 'DAWN Thrombectomy 6-24 Hours', description: 'Thrombectomy 6–24 hours with clinical–imaging mismatch.', category: 'thrombectomy', path: '/trials/dawn-trial' },
  { id: 'select2-trial', name: 'SELECT2 Large Core Thrombectomy', description: 'Large core thrombectomy (ASPECTS 3–5, 0–6h and extended window).', category: 'thrombectomy', path: '/trials/select2-trial' },
  { id: 'angel-aspect-trial', name: 'ANGEL-ASPECT Large Core (China)', description: 'Large core thrombectomy; China cohort.', category: 'thrombectomy', path: '/trials/angel-aspect-trial' },
  { id: 'attention-trial', name: 'ATTENTION Basilar Artery EVT', description: 'Basilar artery thrombectomy; China trial.', category: 'thrombectomy', path: '/trials/attention-trial' },
  { id: 'baoche-trial', name: 'BAOCHE Basilar EVT 6-24h', description: 'Basilar EVT 6–24 hours with imaging selection.', category: 'thrombectomy', path: '/trials/baoche-trial' },
  { id: 'chance-trial', name: 'CHANCE', description: 'DAPT (clopidogrel + aspirin) after TIA/minor stroke.', category: 'antiplatelets', path: '/trials/chance-trial' },
  { id: 'point-trial', name: 'POINT', description: 'Dual antiplatelet in TIA and minor stroke.', category: 'antiplatelets', path: '/trials/point-trial' },
  { id: 'inspires-trial', name: 'INSPIRES', description: 'DAPT for atherosclerotic minor stroke/TIA within 72 hours. NNT=53. AHA 2026 COR 2a.', category: 'antiplatelets', path: '/trials/inspires-trial' },
  { id: 'chance-2-trial', name: 'CHANCE-2', description: 'Ticagrelor vs clopidogrel DAPT in CYP2C19 loss-of-function carriers. NNT=63. AHA 2026 COR 2b.', category: 'antiplatelets', path: '/trials/chance-2-trial' },
  { id: 'thales-trial', name: 'THALES', description: 'Ticagrelor + aspirin vs aspirin alone — AHA 2026 COR 3: No Benefit. NNT=91, bleeding 5× higher.', category: 'antiplatelets', path: '/trials/thales-trial' },
  { id: 'sps3-trial', name: 'SPS3', description: 'Antiplatelet choice in lacunar stroke.', category: 'antiplatelets', path: '/trials/sps3-trial' },
  { id: 'socrates-trial', name: 'SOCRATES', description: 'Ticagrelor vs aspirin in acute ischemic stroke.', category: 'antiplatelets', path: '/trials/socrates-trial' },
  { id: 'elan-study', name: 'ELAN', description: 'Timing of anticoagulation after stroke with atrial fibrillation.', category: 'antiplatelets', path: '/trials/elan-study' },
  { id: 'sparcl-trial', name: 'SPARCL', description: 'High-intensity statin for secondary stroke prevention.', category: 'antiplatelets', path: '/trials/sparcl-trial' },
  { id: 'nascet-trial', name: 'NASCET', description: 'Carotid endarterectomy for symptomatic stenosis.', category: 'carotid', path: '/trials/nascet-trial' },
  { id: 'crest-trial', name: 'CREST', description: 'Carotid stenting vs endarterectomy.', category: 'carotid', path: '/trials/crest-trial' },
  { id: 'sammpris-trial', name: 'SAMMPRIS', description: 'Intracranial stenting vs medical therapy for stenosis.', category: 'carotid', path: '/trials/sammpris-trial' },
  { id: 'weave-trial', name: 'WEAVE', description: 'Perioperative outcomes of carotid stenting.', category: 'carotid', path: '/trials/weave-trial' },
  { id: 'enrich-trial', name: 'ENRICH', description: 'First positive surgical ICH trial — MIPS halves 30-day mortality (9.3% vs 18.0%). NEJM 2024.', category: 'acute', path: '/trials/enrich-trial' },
  { id: 'shine-trial', name: 'SHINE', description: 'Intensive vs standard BP in intracerebral hemorrhage.', category: 'acute', path: '/trials/shine-trial' },
];

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
