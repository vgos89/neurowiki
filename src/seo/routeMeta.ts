
interface MetaData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

const DEFAULT_META: MetaData = {
  title: 'NeuroWiki | The Digital Neurology Companion',
  description: 'Comprehensive neurological encyclopedia, clinical calculators, and decision support tools for medical professionals.',
  keywords: 'neurology, stroke, calc, nihss, medical tools',
  image: 'https://neurowiki.ai/og-default.png' // Ensure this asset exists or remove
};

const ROUTE_REGISTRY: Record<string, MetaData> = {
  '/': DEFAULT_META,
  '/guide': {
    title: 'Resident Guide | NeuroWiki',
    description: 'Clinical protocols and quick reference guides for neurology residents and practitioners.'
  },
  '/trials': {
    title: 'Landmark Neuro Trials | NeuroWiki',
    description: 'Summaries of pivotal clinical trials in vascular neurology, epilepsy, and more.'
  },
  '/calculators': {
    title: 'Clinical Calculators | NeuroWiki',
    description: 'Interactive scoring tools including NIHSS, ABCD2, ICH Score, and more.'
  },
  '/calculators/nihss': {
    title: 'NIH Stroke Scale (NIHSS) Calculator',
    description: 'Interactive NIHSS calculator with built-in pearls and resident/attending modes.'
  },
  '/calculators/evt-pathway': {
    title: 'Thrombectomy Eligibility Pathway',
    description: 'Decision support for Endovascular Thrombectomy (EVT) based on DAWN, DEFUSE-3, and recent trials.'
  },
  '/calculators/elan-pathway': {
    title: 'ELAN Protocol Calculator',
    description: 'Timing of anticoagulation after acute ischemic stroke in atrial fibrillation.'
  },
  '/calculators/se-pathway': {
    title: 'Status Epilepticus Algorithm',
    description: 'Step-by-step management of status epilepticus based on ESETT and neurocritical care guidelines.'
  },
  '/calculators/migraine-pathway': {
    title: 'Acute Migraine Cocktail Pathway',
    description: 'Emergency department and inpatient management protocol for severe migraine.'
  },
  '/calculators/gca-pathway': {
    title: 'GCA Diagnostic Pathway',
    description: 'Risk stratification and management aid for Giant Cell Arteritis.'
  },
  '/calculators/aspects': {
    title: 'ASPECTS Score Calculator',
    description: 'Interactive brain map for scoring early ischemic changes on CT.'
  }
};

export const getRouteMeta = (pathname: string): MetaData => {
  // 1. Exact Match
  if (ROUTE_REGISTRY[pathname]) {
    return { ...DEFAULT_META, ...ROUTE_REGISTRY[pathname] };
  }

  // 2. Dynamic Calculator Match (/calculators/abcd2)
  if (pathname.startsWith('/calculators/')) {
    const id = pathname.split('/')[2];
    const name = id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' ');
    return {
      ...DEFAULT_META,
      title: `${name} Calculator | NeuroWiki`,
      description: `Calculate ${name} score and view clinical interpretation.`
    };
  }

  // 3. Dynamic Guide/Trial Match
  if (pathname.startsWith('/guide/') || pathname.startsWith('/trials/')) {
    const slug = pathname.split('/').pop() || '';
    const title = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const type = pathname.startsWith('/trials/') ? 'Clinical Trial' : 'Clinical Guide';
    return {
      ...DEFAULT_META,
      title: `${title} - ${type} | NeuroWiki`,
      description: `Detailed ${type.toLowerCase()} summary for ${title}.`
    };
  }

  // 4. Default Fallback
  return DEFAULT_META;
};
