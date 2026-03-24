import { LEGACY_TRIAL_CATALOG_META } from './trialCatalogMeta';

export type TrialCategoryKey =
  | 'prehospital-triage'
  | 'ivt'
  | 'evt'
  | 'acute-management'
  | 'surgical-interventions'
  | 'secondary-prevention';

export interface TrialItem {
  id: string;
  name: string;
  year: number;
  category: TrialCategoryKey;
  doi: string;
  path: string;
  isPlaceholder: boolean;
  description?: string;
  clinicalContext?: string;
}

export const categoryStyles: Record<
  TrialCategoryKey,
  { dot: string; text: string; border: string; pillBg: string; pillText: string; pillActive: string }
> = {
  'prehospital-triage': {
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    border: 'border-l-amber-500',
    pillBg: 'bg-amber-50 border-amber-200',
    pillText: 'text-amber-700',
    pillActive: 'bg-amber-600 text-white border-amber-600',
  },
  ivt: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700',
    border: 'border-l-emerald-500',
    pillBg: 'bg-emerald-50 border-emerald-200',
    pillText: 'text-emerald-700',
    pillActive: 'bg-emerald-600 text-white border-emerald-600',
  },
  evt: {
    dot: 'bg-blue-500',
    text: 'text-blue-700',
    border: 'border-l-blue-500',
    pillBg: 'bg-blue-50 border-blue-200',
    pillText: 'text-blue-700',
    pillActive: 'bg-blue-600 text-white border-blue-600',
  },
  'acute-management': {
    dot: 'bg-rose-500',
    text: 'text-rose-700',
    border: 'border-l-rose-500',
    pillBg: 'bg-rose-50 border-rose-200',
    pillText: 'text-rose-700',
    pillActive: 'bg-rose-600 text-white border-rose-600',
  },
  'surgical-interventions': {
    dot: 'bg-violet-500',
    text: 'text-violet-700',
    border: 'border-l-violet-500',
    pillBg: 'bg-violet-50 border-violet-200',
    pillText: 'text-violet-700',
    pillActive: 'bg-violet-600 text-white border-violet-600',
  },
  'secondary-prevention': {
    dot: 'bg-teal-500',
    text: 'text-teal-700',
    border: 'border-l-teal-500',
    pillBg: 'bg-teal-50 border-teal-200',
    pillText: 'text-teal-700',
    pillActive: 'bg-teal-600 text-white border-teal-600',
  },
};

export const categoryNames: Record<TrialCategoryKey, string> = {
  'prehospital-triage': 'Prehospital & Triage',
  ivt: 'Acute Reperfusion: Intravenous Thrombolysis (IVT)',
  evt: 'Acute Reperfusion: Endovascular Thrombectomy (EVT)',
  'acute-management': 'Acute In-Hospital Management',
  'surgical-interventions': 'Surgical Interventions',
  'secondary-prevention': 'Secondary Prevention',
};

export const categoryDescriptions: Record<TrialCategoryKey, string> = {
  'prehospital-triage': 'Field identification, destination strategy, and prehospital treatment trials.',
  ivt: 'Intravenous thrombolysis studies across standard, extended, and imaging-selected windows.',
  evt: 'Landmark thrombectomy studies spanning LVO, MeVO, technique, and bridging strategies.',
  'acute-management': 'Blood pressure, neuroprotection, and early in-hospital stroke care trials.',
  'surgical-interventions': 'Decompressive and surgical management studies for malignant infarction.',
  'secondary-prevention': 'Trials shaping anticoagulation and recurrent stroke prevention timing.',
};

export const TRIAL_CATEGORY_IDS: TrialCategoryKey[] = [
  'ivt',
  'evt',
  'secondary-prevention',
  'surgical-interventions',
  'acute-management',
  'prehospital-triage',
];

const buildTrial = (
  id: string,
  name: string,
  category: TrialCategoryKey,
  doi: string,
  options?: { isPlaceholder?: boolean; description?: string }
): Omit<TrialItem, 'year'> => ({
  id,
  name,
  category,
  doi,
  path: `/trials/${id}`,
  isPlaceholder: options?.isPlaceholder ?? true,
  description: options?.description,
});

const manualTrials: Omit<TrialItem, 'year'>[] = [
  buildTrial('b-proud-trial', 'B_PROUD', 'prehospital-triage', '10.1001/jama.2020.26345', {
    isPlaceholder: false,
    description: 'Berlin prospective MSU dispatch study showing better 90-day disability outcomes than conventional ambulance alone.',
  }),
  buildTrial('best-msu-trial', 'BEST-MSU', 'prehospital-triage', '10.1056/NEJMoa2103879', {
    isPlaceholder: false,
    description: 'Multicenter US MSU trial showing faster thrombolysis and better 90-day outcomes in tPA-eligible patients.',
  }),
  buildTrial('racecat-trial', 'RACECAT', 'prehospital-triage', '10.1001/jama.2022.4404', {
    isPlaceholder: false,
    description: 'Cluster-randomized Catalonia trial comparing direct CSC transport with initial local stroke center routing for suspected LVO.',
  }),
  buildTrial('triage-stroke-trial', 'TRIAGE-STROKE', 'prehospital-triage', '10.1161/STROKEAHA.123.043875', {
    isPlaceholder: false,
    description: 'Randomized Danish transport trial in IVT-eligible suspected LVO patients comparing PSC-first vs CSC-first routing.',
  }),
  buildTrial('right-2-trial', 'RIGHT-2', 'prehospital-triage', '10.1016/S0140-6736(19)30194-1', {
    isPlaceholder: false,
    description: 'Ambulance-based sham-controlled trial of ultra-early glyceryl trinitrate in presumed stroke.',
  }),
  buildTrial('mr-asap-trial', 'MR ASAP', 'prehospital-triage', '10.1016/S1474-4422(22)00333-7', {
    isPlaceholder: false,
    description: 'Dutch prehospital GTN trial stopped early after a signal of early harm in intracerebral hemorrhage.',
  }),
  buildTrial('interact4-trial', 'INTERACT4', 'prehospital-triage', '10.1056/NEJMoa2314741', {
    isPlaceholder: false,
    description: 'Prehospital blood-pressure lowering before imaging confirmation: neutral overall, divergent by stroke type.',
  }),

  buildTrial('timeless-trial', 'TIMELESS', 'ivt', '10.1056/NEJMoa2310392', {
    isPlaceholder: false,
    description: 'Late-window tenecteplase after perfusion selection was neutral in a largely EVT-treated LVO population.',
  }),
  buildTrial('trace-iii-trial', 'TRACE-III', 'ivt', '10.1056/NEJMoa2402980', {
    isPlaceholder: false,
    description: 'Late-window tenecteplase for ICA/MCA occlusion when EVT is not available.',
  }),
  buildTrial('prisms-trial', 'PRISMS', 'ivt', '10.1001/jama.2018.8496', {
    isPlaceholder: false,
    description: 'Alteplase did not outperform aspirin in minor nondisabling stroke and caused more symptomatic ICH.',
  }),
  buildTrial('aramis-trial', 'ARAMIS', 'ivt', '10.1001/jama.2023.7827', {
    isPlaceholder: false,
    description: 'Dual antiplatelet therapy was noninferior to alteplase in minor nondisabling stroke within 4.5 hours.',
  }),
  buildTrial('act-trial', 'AcT', 'ivt', '10.1016/S0140-6736(22)01054-6', {
    isPlaceholder: false,
    description: 'Canadian registry-linked trial showing tenecteplase 0.25 mg/kg was noninferior to alteplase.',
  }),
  buildTrial('attest-2-trial', 'ATTEST-2', 'ivt', '10.1016/S1474-4422(24)00377-6', {
    isPlaceholder: false,
    description: 'Large UK trial confirming noninferiority of tenecteplase to alteplase within 4.5 hours.',
  }),
  buildTrial('nor-test-trial', 'NOR-TEST', 'ivt', '10.1016/S1474-4422(17)30253-3', {
    isPlaceholder: false,
    description: 'High-dose tenecteplase 0.4 mg/kg was similar to alteplase in a predominantly mild-stroke cohort.',
  }),
  buildTrial('nor-test-2-part-a-trial', 'NOR-TEST 2 (Part A)', 'ivt', '10.1016/S1474-4422(22)00124-7', {
    isPlaceholder: false,
    description: 'Tenecteplase 0.4 mg/kg performed worse than alteplase in moderate-to-severe stroke and raised safety concerns.',
  }),
  buildTrial('trace-2-trial', 'TRACE-2', 'ivt', '10.1016/S0140-6736(22)02600-9', {
    isPlaceholder: false,
    description: 'Chinese phase 3 trial showing tenecteplase was noninferior to alteplase in EVT-ineligible stroke.',
  }),
  buildTrial('taste-trial', 'TASTE', 'ivt', '10.1016/S1474-4422(24)00206-0', {
    isPlaceholder: false,
    description: 'Perfusion-selected early-window trial that largely supported tenecteplase, with noninferiority clearest in per-protocol analysis.',
  }),
  buildTrial('thaws-trial', 'THAWS', 'ivt', '10.1161/STROKEAHA.119.028127', {
    isPlaceholder: false,
    description: 'MRI-selected unknown-onset stroke treated with low-dose alteplase.',
  }),
  buildTrial('twist-trial', 'TWIST', 'ivt', '10.1016/S1474-4422(22)00484-7', {
    isPlaceholder: false,
    description: 'Wake-up stroke trial using non-contrast CT alone; tenecteplase did not improve 90-day outcomes.',
  }),
  buildTrial('raise-trial', 'RAISE', 'ivt', '10.1056/NEJMoa2400314', {
    isPlaceholder: false,
    description: 'Reteplase improved excellent outcomes over alteplase in early-window ischemic stroke.',
  }),
  buildTrial('prost-trial', 'PROST', 'ivt', '10.1001/jamanetworkopen.2023.25415', {
    isPlaceholder: false,
    description: 'Phase 3 rhPro-UK trial showing noninferiority to alteplase with less systemic bleeding.',
  }),
  buildTrial('prost-2-trial', 'PROST-2', 'ivt', '10.1016/S1474-4422(24)00436-8', {
    isPlaceholder: false,
    description: 'Large phase 3 prourokinase trial confirming noninferiority to alteplase with lower bleeding rates.',
  }),

  buildTrial('mr-clean-trial', 'MR CLEAN', 'evt', '10.1056/NEJMoa1411587', {
    isPlaceholder: false,
    description: 'Landmark first modern positive thrombectomy trial for anterior circulation LVO.',
  }),
  buildTrial('escape-trial', 'ESCAPE', 'evt', '10.1056/NEJMoa1414905', {
    isPlaceholder: false,
    description: 'Rapid EVT trial using collateral-based CT selection and strict workflow targets.',
  }),
  buildTrial('revascat-trial', 'REVASCAT', 'evt', '10.1056/NEJMoa1503780', {
    isPlaceholder: false,
    description: 'Registry-embedded Spanish thrombectomy trial confirming benefit within 8 hours.',
  }),
  buildTrial('extend-ia-trial', 'EXTEND-IA', 'evt', '10.1056/NEJMoa1414792', {
    isPlaceholder: false,
    description: 'Perfusion-selected thrombectomy trial showing major reperfusion and functional gains.',
  }),
  buildTrial('swift-prime-trial', 'SWIFT PRIME', 'evt', '10.1056/NEJMoa1415061', {
    isPlaceholder: false,
    description: 'Solitaire thrombectomy trial showing large functional gains over IV tPA alone.',
  }),
  buildTrial('thrace-trial', 'THRACE', 'evt', '10.1016/S1474-4422(16)30177-6', {
    isPlaceholder: false,
    description: 'French bridging-therapy trial showing benefit from adding thrombectomy to alteplase.',
  }),
  buildTrial('direct-mt-trial', 'DIRECT-MT', 'evt', '10.1056/NEJMoa2001123', {
    isPlaceholder: false,
    description: 'Early direct-EVT noninferiority trial in alteplase-eligible anterior circulation LVO.',
  }),
  buildTrial('devt-trial', 'DEVT', 'evt', '10.1001/jama.2020.23523', {
    isPlaceholder: false,
    description: 'Chinese direct-EVT trial meeting noninferiority against alteplase plus thrombectomy.',
  }),
  buildTrial('skip-trial', 'SKIP', 'evt', '10.1001/jama.2020.23522', {
    isPlaceholder: false,
    description: 'Japanese direct-EVT study that was directionally reassuring but statistically inconclusive.',
  }),
  buildTrial('mr-clean-no-iv-trial', 'MR CLEAN-NO IV', 'evt', '10.1056/NEJMoa2107727', {
    isPlaceholder: false,
    description: 'European direct-EVT trial showing neither superiority nor noninferiority over bridging therapy.',
  }),
  buildTrial('direct-safe-trial', 'DIRECT-SAFE', 'evt', '10.1016/S0140-6736(22)00564-5', {
    isPlaceholder: false,
    description: 'International direct-EVT trial that did not support skipping thrombolysis.',
  }),
  buildTrial('swift-direct-trial', 'SWIFT DIRECT', 'evt', '10.1016/S0140-6736(22)00537-2', {
    isPlaceholder: false,
    description: 'Western direct-EVT trial missing noninferiority and showing lower reperfusion without alteplase.',
  }),
  buildTrial('laste-trial', 'LASTE', 'evt', '10.1056/NEJMoa2314063', {
    isPlaceholder: false,
    description: 'Large-core thrombectomy trial showing better outcomes and lower mortality despite more bleeding.',
  }),
  buildTrial('tension-trial', 'TENSION', 'evt', '10.1016/S0140-6736(23)02032-9', {
    isPlaceholder: false,
    description: 'Large-core EVT trial using pragmatic non-contrast CT selection rather than perfusion imaging.',
  }),
  buildTrial('escape-mevo-trial', 'ESCAPE-MeVO', 'evt', '10.1056/NEJMoa2411668', {
    isPlaceholder: false,
    description: 'Parallel MeVO thrombectomy trial across M2/M3, ACA, and PCA targets.',
  }),
  buildTrial('distal-trial', 'DISTAL', 'evt', '10.1056/NEJMoa2408954', {
    isPlaceholder: false,
    description: 'Randomized EVT trial for medium and distal vessel occlusions.',
  }),
  buildTrial('compass-trial', 'COMPASS', 'evt', '10.1016/S0140-6736(19)30297-1', {
    isPlaceholder: false,
    description: 'Device-strategy trial showing aspiration-first thrombectomy was noninferior to stent retrievers.',
  }),
  buildTrial('aster-trial', 'ASTER', 'evt', '10.1001/jama.2017.9644', {
    isPlaceholder: false,
    description: 'Device-comparison trial showing no clear advantage for aspiration over stent retrievers.',
  }),
  buildTrial('aster2-trial', 'ASTER2', 'evt', '10.1001/jama.2021.13827', {
    isPlaceholder: false,
    description: 'Technical EVT trial showing no final reperfusion advantage from upfront combined strategy.',
  }),
  buildTrial('choice-trial', 'CHOICE', 'evt', '10.1001/jama.2022.1645', {
    isPlaceholder: false,
    description: 'Post-thrombectomy adjunct IA alteplase trial suggesting better excellent outcomes.',
  }),
  buildTrial('rescue-bt-trial', 'RESCUE BT', 'evt', '10.1001/jama.2022.12584', {
    isPlaceholder: false,
    description: 'Adjunct pre-EVT tirofiban trial showing no functional benefit.',
  }),

  buildTrial('enchanted-trial', 'ENCHANTED', 'acute-management', '10.1016/S0140-6736(19)30038-8', {
    isPlaceholder: false,
    description: 'BP lowering during alteplase reduced bleeding but did not improve 90-day disability.',
  }),
  buildTrial('best-ii-trial', 'BEST-II', 'acute-management', '10.1001/jama.2023.14330', {
    isPlaceholder: false,
    description: 'Phase 2 futility trial suggesting low probability that lower post-EVT BP targets help.',
  }),
  buildTrial('bp-target-trial', 'BP-TARGET', 'acute-management', '10.1016/S1474-4422(20)30483-X', {
    isPlaceholder: false,
    description: 'Randomized post-EVT BP trial showing no hemorrhage reduction with intensive targets.',
  }),
  buildTrial('optimal-bp-trial', 'OPTIMAL-BP', 'acute-management', '10.1001/jama.2023.14590', {
    isPlaceholder: false,
    description: 'Intensive BP lowering after successful EVT worsened functional independence.',
  }),
  buildTrial('charm-trial', 'CHARM', 'acute-management', '10.1016/S1474-4422(24)00425-3', {
    isPlaceholder: false,
    description: 'Phase 3 glibenclamide trial for malignant edema prevention after large hemispheric stroke.',
  }),
  buildTrial('escape-na1-trial', 'ESCAPE-NA1', 'acute-management', '10.1016/S0140-6736(20)30258-0', {
    isPlaceholder: false,
    description: 'Nerinetide neuroprotection trial during thrombectomy, neutral overall with an alteplase interaction.',
  }),

  buildTrial('decimal-trial', 'DECIMAL', 'surgical-interventions', '10.1161/STROKEAHA.107.485235', {
    isPlaceholder: false,
    description: 'Early hemicraniectomy trial showing major mortality reduction in malignant MCA infarction.',
  }),
  buildTrial('destiny-trial', 'DESTINY', 'surgical-interventions', '10.1161/STROKEAHA.107.485649', {
    isPlaceholder: false,
    description: 'German decompressive surgery trial confirming a strong survival benefit in malignant MCA stroke.',
  }),
  buildTrial('hamlet-trial', 'HAMLET', 'surgical-interventions', '10.1016/S1474-4422(09)70047-X', {
    isPlaceholder: false,
    description: 'Trial showing decompressive surgery works best when performed within 48 hours.',
  }),
  buildTrial('destiny-ii-trial', 'DESTINY II', 'surgical-interventions', '10.1056/NEJMoa1311367', {
    isPlaceholder: false,
    description: 'Hemicraniectomy trial in patients older than 60 years with malignant MCA infarction.',
  }),

  buildTrial('timing-trial', 'TIMING', 'secondary-prevention', '10.1161/CIRCULATIONAHA.122.060666', {
    isPlaceholder: false,
    description: 'Registry-based randomized trial supporting early NOAC start after AF-related ischemic stroke.',
  }),
  buildTrial('optimas-trial', 'OPTIMAS', 'secondary-prevention', '10.1016/S0140-6736(24)02197-4', {
    isPlaceholder: false,
    description: 'Large phase 4 trial showing early DOAC initiation was noninferior to delayed start.',
  }),
];

const legacyTrialCategories: Record<string, TrialCategoryKey> = {
  'ninds-trial': 'ivt',
  'original-trial': 'ivt',
  'ecass3-trial': 'ivt',
  'extend-trial': 'ivt',
  'eagle-trial': 'ivt',
  'wake-up-trial': 'ivt',
  'defuse-3-trial': 'evt',
  'dawn-trial': 'evt',
  'select2-trial': 'evt',
  'angel-aspect-trial': 'evt',
  'attention-trial': 'evt',
  'baoche-trial': 'evt',
  'chance-trial': 'secondary-prevention',
  'point-trial': 'secondary-prevention',
  'sammpris-trial': 'secondary-prevention',
  'weave-trial': 'secondary-prevention',
  'socrates-trial': 'secondary-prevention',
  'sps3-trial': 'secondary-prevention',
  'sparcl-trial': 'secondary-prevention',
  'elan-study': 'secondary-prevention',
  'thales-trial': 'secondary-prevention',
  'inspires-trial': 'secondary-prevention',
  'chance-2-trial': 'secondary-prevention',
  'enrich-trial': 'surgical-interventions',
};

function enrichTrial(item: Omit<TrialItem, 'year'>): TrialItem {
  return {
    ...item,
    year: 0,
  };
}

const manualTrialIds = new Set(manualTrials.map((trial) => trial.id));

const restoredLegacyTrials: TrialItem[] = Object.entries(LEGACY_TRIAL_CATALOG_META)
  .filter(([id]) => !manualTrialIds.has(id))
  .map(([id, metadata]) => {
    return {
      id,
      name: metadata.name,
      year: metadata.year,
      category: legacyTrialCategories[id],
      doi: metadata.doi,
      path: `/trials/${id}`,
      isPlaceholder: false,
      description: metadata.description,
      clinicalContext: metadata.clinicalContext,
    };
  });

export const trials: TrialItem[] = [...manualTrials.map(enrichTrial), ...restoredLegacyTrials].sort((a, b) => {
  const categoryIndex = TRIAL_CATEGORY_IDS.indexOf(a.category) - TRIAL_CATEGORY_IDS.indexOf(b.category);
  if (categoryIndex !== 0) return categoryIndex;
  if (b.year !== a.year) return b.year - a.year;
  return a.name.localeCompare(b.name);
});

export function groupTrialsByCategory(trialsList: TrialItem[]): Record<TrialCategoryKey, TrialItem[]> {
  const groups = {} as Record<TrialCategoryKey, TrialItem[]>;
  TRIAL_CATEGORY_IDS.forEach((cat) => {
    groups[cat] = [];
  });
  trialsList.forEach((trial) => {
    groups[trial.category].push(trial);
  });
  TRIAL_CATEGORY_IDS.forEach((cat) => {
    groups[cat].sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year;
      return a.name.localeCompare(b.name);
    });
  });
  return groups;
}

export function findTrialById(id: string): TrialItem | undefined {
  return trials.find((trial) => trial.id === id);
}
