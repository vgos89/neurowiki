
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
    title: 'Post-Stroke Anticoagulation Timing Calculator',
    description: 'Evidence-based timing of anticoagulation after acute ischemic stroke with atrial fibrillation based on ELAN trial and AHA/ASA 2026 guidelines.'
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
  '/calculators/ich-score': {
    title: 'ICH Score Calculator | NeuroWiki',
    description: 'Calculate ICH Score (GCS, volume, IVH, location, age) and 30-day mortality for intracerebral hemorrhage. Evidence-based, Hemphill et al. Stroke 2001.',
    keywords: 'ICH score, intracerebral hemorrhage, mortality, GCS, IVH, stroke calculator'
  },
  '/calculators/abcd2-score': {
    title: 'ABCD² Score Calculator — TIA Stroke Risk | NeuroWiki',
    description: 'Calculate 2-day stroke risk after TIA with the ABCD² score. Free calculator for residents with interpretation and evidence.',
    keywords: 'ABCD2 calculator, TIA stroke risk, transient ischemic attack'
  },
  '/calculators/has-bled-score': {
    title: 'HAS-BLED Score Calculator — Bleeding Risk | NeuroWiki',
    description: 'Estimate major bleeding risk on anticoagulation. Modifiable risks and monitoring—not a reason to withhold anticoagulation.',
    keywords: 'HAS-BLED calculator, bleeding risk anticoagulation, atrial fibrillation'
  },
  '/calculators/rope-score': {
    title: 'RoPE Score Calculator — PFO Stroke Risk | NeuroWiki',
    description: 'PFO-attributable fraction in cryptogenic stroke. Kent et al.; supports PFO closure discussion.',
    keywords: 'RoPE score calculator, PFO stroke, patent foramen ovale, cryptogenic stroke'
  },
  '/calculators/glasgow-coma-scale': {
    title: 'Glasgow Coma Scale (GCS) Calculator | NeuroWiki',
    description: 'Standard GCS for consciousness. Eye, verbal, motor; intubated and not-testable handling. Links to ICH Score.',
    keywords: 'Glasgow Coma Scale calculator, GCS calculator, consciousness assessment'
  },
  '/calculators/heidelberg-bleeding-classification': {
    title: 'Heidelberg Bleeding Classification Calculator | NeuroWiki',
    description: 'Classify hemorrhagic transformation after ischemic stroke and reperfusion therapy (tPA or thrombectomy). Free online calculator per von Kummer et al. Stroke 2015.',
    keywords: 'Heidelberg bleeding classification, hemorrhagic transformation, ICH classification, post-thrombolysis'
  },
  '/calculators/boston-criteria-caa': {
    title: 'Boston Criteria 2.0 for CAA Calculator | NeuroWiki',
    description: 'Diagnose cerebral amyloid angiopathy using Boston Criteria 2.0. MRI-based CAA classification with anticoagulation risk assessment. Charidimou et al. Lancet Neurol 2022.',
    keywords: 'Boston criteria CAA, cerebral amyloid angiopathy, CAA diagnosis, Boston criteria 2.0'
  },
  '/guide/stroke-basics': {
    title: 'Stroke Code Basics | Acute Stroke Protocol | NeuroWiki',
    description: 'Step-by-step acute stroke code workflow: LKW, imaging, tPA/thrombectomy, GWTG metrics. For residents and attendings. Aligned with AHA/ASA 2026.',
    keywords: 'stroke protocol, acute stroke management, stroke code, door to needle, LKW, tPA eligibility'
  },
  '/guide/ich-management': {
    title: 'ICH Management | Acute Intracerebral Hemorrhage | NeuroWiki',
    description: 'Acute ICH protocol per 2022 AHA/ASA guidelines: BP <140 mmHg, 4-factor PCC reversal, cerebellar surgery criteria, ICP management. Evidence-based.',
    keywords: 'ICH management, intracerebral hemorrhage, AHA ASA 2022, BP control, PCC reversal, cerebellar hemorrhage'
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
