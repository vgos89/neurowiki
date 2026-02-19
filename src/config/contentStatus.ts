// Content publication status
// Change published: false → true when ready to go live
// Last updated: 2026-02-17 (v2)

export type ContentItem = {
  published: boolean;
  comingSoonMessage?: string;
};

export type ContentStatus = {
  [path: string]: ContentItem;
};

export const contentStatus: ContentStatus = {
  // ============ GUIDES ============
  '/guide/stroke-basics': {
    published: true,
    comingSoonMessage: 'Stroke basics guide',
  },
  '/guide/stroke-basics-desktop': {
    published: true,
    comingSoonMessage: 'Stroke basics guide',
  },
  '/guide/stroke-basics-mobile': {
    published: true,
    comingSoonMessage: 'Stroke basics guide',
  },
  '/guide/iv-tpa': {
    published: true,
    comingSoonMessage: 'IV tPA eligibility and protocol coming soon',
  },
  '/guide/tpa-eligibility': {
    published: true,
    comingSoonMessage: 'tPA eligibility criteria coming soon',
  },
  '/guide/thrombectomy': {
    published: true,
    comingSoonMessage: 'Thrombectomy guide coming soon',
  },
  '/guide/acute-stroke-mgmt': {
    published: true,
    comingSoonMessage: 'Acute stroke management guide coming soon',
  },
  '/guide/status-epilepticus': {
    published: true,
    comingSoonMessage: 'Status epilepticus guide coming soon',
  },
  '/guide/ich-management': {
    published: true,
    comingSoonMessage: 'ICH management guide coming soon',
  },
  '/guide/meningitis': {
    published: true,
    comingSoonMessage: 'Meningitis guide coming soon',
  },
  '/guide/gbs': {
    published: true,
    comingSoonMessage: 'GBS guide coming soon',
  },
  '/guide/myasthenia-gravis': {
    published: true,
    comingSoonMessage: 'Myasthenia gravis guide coming soon',
  },
  '/guide/myasthenia-crisis': {
    published: true,
    comingSoonMessage: 'Myasthenia crisis guide coming soon',
  },
  '/guide/multiple-sclerosis': {
    published: true,
    comingSoonMessage: 'Multiple sclerosis guide coming soon',
  },
  '/guide/ms-relapse': {
    published: true,
    comingSoonMessage: 'MS relapse guide coming soon',
  },
  '/guide/seizure-workup': {
    published: true,
    comingSoonMessage: 'Seizure workup guide coming soon',
  },
  '/guide/altered-mental-status': {
    published: true,
    comingSoonMessage: 'Altered mental status guide coming soon',
  },
  '/guide/headache-workup': {
    published: true,
    comingSoonMessage: 'Headache workup guide coming soon',
  },
  '/guide/vertigo': {
    published: true,
    comingSoonMessage: 'Vertigo guide coming soon',
  },
  '/guide/weakness-workup': {
    published: true,
    comingSoonMessage: 'Weakness workup guide coming soon',
  },

  // ============ CALCULATORS / PATHWAYS ============
  '/calculators/gca-pathway': {
    published: true,
    comingSoonMessage: 'GCA pathway',
  },
  '/calculators/elan-pathway': {
    published: true,
    comingSoonMessage: 'ELAN pathway',
  },
  '/calculators/evt-pathway': {
    published: true,
    comingSoonMessage: 'EVT pathway',
  },
  '/calculators/se-pathway': {
    published: true,
    comingSoonMessage: 'Status epilepticus pathway',
  },
  '/calculators/migraine-pathway': {
    published: true,
    comingSoonMessage: 'Migraine pathway',
  },
  '/calculators/em-billing': {
    published: true,
    comingSoonMessage: 'E/M Billing calculator',
  },
  '/calculators/nihss': {
    published: true,
    comingSoonMessage: 'NIHSS calculator',
  },
  '/calculators/ich-score': {
    published: true,
    comingSoonMessage: 'ICH Score calculator',
  },
  '/calculators/abcd2-score': {
    published: true,
    comingSoonMessage: 'ABCD² Score calculator',
  },
  '/calculators/has-bled-score': {
    published: true,
    comingSoonMessage: 'HAS-BLED calculator',
  },
  '/calculators/rope-score': {
    published: true,
    comingSoonMessage: 'RoPE Score calculator',
  },
  '/calculators/glasgow-coma-scale': {
    published: true,
    comingSoonMessage: 'GCS calculator',
  },
  '/calculators/heidelberg-bleeding-classification': {
    published: true,
    comingSoonMessage: 'Heidelberg bleeding classification',
  },
  '/calculators/boston-criteria-caa': {
    published: true,
    comingSoonMessage: 'Boston Criteria 2.0 for CAA',
  },
  '/calculators/aspects': {
    published: true,
    comingSoonMessage: 'ASPECTS calculator coming soon',
  },
  '/calculators/tpa-dosing': {
    published: true,
    comingSoonMessage: 'tPA dosing calculator coming soon',
  },
  '/calculators/gcs': {
    published: true,
    comingSoonMessage: 'GCS calculator coming soon',
  },
  '/pathways/thrombectomy': {
    published: true,
    comingSoonMessage: 'Thrombectomy pathway coming soon',
  },
  '/pathways/status-epilepticus': {
    published: true,
    comingSoonMessage: 'Status epilepticus pathway coming soon',
  },

  // ============ TRIALS ============
  '/trials/dawn-trial': {
    published: true,
    comingSoonMessage: 'DAWN trial summary coming soon',
  },
  '/trials/defuse-3-trial': {
    published: true,
    comingSoonMessage: 'DEFUSE-3 trial summary coming soon',
  },
  '/trials/ninds-trial': {
    published: true,
    comingSoonMessage: 'NINDS trial summary coming soon',
  },
  '/trials/ecass3-trial': {
    published: true,
    comingSoonMessage: 'ECASS-III trial summary coming soon',
  },
  '/trials/extend-trial': {
    published: true,
    comingSoonMessage: 'EXTEND trial summary coming soon',
  },
  '/trials/attention-trial': {
    published: true,
    comingSoonMessage: 'ATTENTION trial summary coming soon',
  },
  '/trials/baoche-trial': {
    published: true,
    comingSoonMessage: 'BAOCHE trial summary coming soon',
  },
  '/trials/select2-trial': {
    published: true,
    comingSoonMessage: 'SELECT2 trial summary coming soon',
  },
  '/trials/angel-aspect-trial': {
    published: true,
    comingSoonMessage: 'ANGEL-ASPECT trial summary coming soon',
  },
  '/trials/shine-trial': {
    published: true,
    comingSoonMessage: 'SHINE trial summary coming soon',
  },
  '/trials/elan-study': {
    published: true,
    comingSoonMessage: 'ELAN study summary coming soon',
  },
  '/trials/stroke-af': {
    published: true,
    comingSoonMessage: 'STROKE-AF trial summary coming soon',
  },
  '/trials/eagle-trial': { published: true, comingSoonMessage: 'EAGLE trial summary coming soon' },
  '/trials/original-trial': { published: true, comingSoonMessage: 'ORIGINAL trial summary coming soon' },
  '/trials/wake-up-trial': { published: true, comingSoonMessage: 'WAKE-UP trial summary coming soon' },
  '/calculators/aspects-score': { published: true, comingSoonMessage: 'ASPECTS Score calculator' },
  '/trials/distal-trial': { published: true, comingSoonMessage: 'DISTAL trial summary coming soon' },
  '/trials/escape-mevo-trial': { published: true, comingSoonMessage: 'ESCAPE-MeVO trial summary coming soon' },
  '/trials/nascet-trial': { published: true, comingSoonMessage: 'NASCET trial summary coming soon' },
  '/trials/crest-trial': { published: true, comingSoonMessage: 'CREST trial summary coming soon' },
  '/trials/chance-trial': { published: true, comingSoonMessage: 'CHANCE trial summary coming soon' },
  '/trials/point-trial': { published: true, comingSoonMessage: 'POINT trial summary coming soon' },
  '/trials/sammpris-trial': { published: true, comingSoonMessage: 'SAMMPRIS trial summary coming soon' },
  '/trials/weave-trial': { published: true, comingSoonMessage: 'WEAVE trial summary coming soon' },
  '/trials/socrates-trial': { published: true, comingSoonMessage: 'SOCRATES trial summary coming soon' },
  '/trials/sps3-trial': { published: true, comingSoonMessage: 'SPS3 trial summary coming soon' },
  '/trials/sparcl-trial': { published: true, comingSoonMessage: 'SPARCL trial summary coming soon' },
};

// Check if content is published
export const isPublished = (path: string): boolean => {
  // In development with SHOW_DRAFTS, show everything
  if (import.meta.env.DEV && import.meta.env.VITE_SHOW_DRAFTS === 'true') {
    return true;
  }

  // Default to true — all pages are published unless explicitly marked false
  return contentStatus[path]?.published ?? true;
};

// Get the coming soon message for a path
export const getComingSoonMessage = (path: string): string => {
  return contentStatus[path]?.comingSoonMessage || 'This content is coming soon';
};

// Get all content items by category (useful for admin views)
export const getContentByStatus = (published: boolean) => {
  return Object.entries(contentStatus)
    .filter(([_, item]) => item.published === published)
    .map(([path, item]) => ({ path, ...item }));
};
