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
  category: TrialCategoryKey;
  doi: string;
  path: string;
  isPlaceholder: boolean;
  description?: string;
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

const buildTrial = (
  id: string,
  name: string,
  category: TrialCategoryKey,
  doi: string,
  options?: { isPlaceholder?: boolean; description?: string }
): TrialItem => ({
  id,
  name,
  category,
  doi,
  path: `/trials/${id}`,
  isPlaceholder: options?.isPlaceholder ?? true,
  description: options?.description,
});

export const trials: TrialItem[] = [
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

  buildTrial('timeless-trial', 'TIMELESS', 'ivt', '10.1056/NEJMoa2310392'),
  buildTrial('trace-iii-trial', 'TRACE-III', 'ivt', '10.1056/NEJMoa2402980', {
    isPlaceholder: false,
    description: 'Late-window tenecteplase for ICA/MCA occlusion when EVT is not available.',
  }),
  buildTrial('prisms-trial', 'PRISMS', 'ivt', '10.1001/jama.2018.8496'),
  buildTrial('aramis-trial', 'ARAMIS', 'ivt', '10.1001/jama.2023.7827'),
  buildTrial('act-trial', 'AcT', 'ivt', '10.1016/S0140-6736(22)01054-6'),
  buildTrial('attest-2-trial', 'ATTEST-2', 'ivt', '10.1016/S1474-4422(24)00377-6'),
  buildTrial('nor-test-trial', 'NOR-TEST', 'ivt', '10.1016/S1474-4422(17)30253-3'),
  buildTrial('nor-test-2-part-a-trial', 'NOR-TEST 2 (Part A)', 'ivt', '10.1016/S1474-4422(22)00124-7'),
  buildTrial('trace-2-trial', 'TRACE-2', 'ivt', '10.1016/S0140-6736(22)02600-9'),
  buildTrial('taste-trial', 'TASTE', 'ivt', '10.1016/S1474-4422(24)00206-0'),
  buildTrial('thaws-trial', 'THAWS', 'ivt', '10.1161/STROKEAHA.119.028127', {
    isPlaceholder: false,
    description: 'MRI-selected unknown-onset stroke treated with low-dose alteplase.',
  }),
  buildTrial('twist-trial', 'TWIST', 'ivt', '10.1016/S1474-4422(22)00484-7'),
  buildTrial('raise-trial', 'RAISE', 'ivt', '10.1056/NEJMoa2400314'),
  buildTrial('prost-trial', 'PROST', 'ivt', '10.1001/jamanetworkopen.2023.25415'),
  buildTrial('prost-2-trial', 'PROST-2', 'ivt', '10.1016/S1474-4422(24)00436-8'),

  buildTrial('mr-clean-trial', 'MR CLEAN', 'evt', '10.1056/NEJMoa1411587'),
  buildTrial('escape-trial', 'ESCAPE', 'evt', '10.1056/NEJMoa1414905'),
  buildTrial('revascat-trial', 'REVASCAT', 'evt', '10.1056/NEJMoa1503780'),
  buildTrial('extend-ia-trial', 'EXTEND-IA', 'evt', '10.1056/NEJMoa1414792'),
  buildTrial('swift-prime-trial', 'SWIFT PRIME', 'evt', '10.1056/NEJMoa1415061'),
  buildTrial('thrace-trial', 'THRACE', 'evt', '10.1016/S1474-4422(16)30177-6'),
  buildTrial('direct-mt-trial', 'DIRECT-MT', 'evt', '10.1056/NEJMoa2001123'),
  buildTrial('devt-trial', 'DEVT', 'evt', '10.1001/jama.2020.23523'),
  buildTrial('skip-trial', 'SKIP', 'evt', '10.1001/jama.2020.23522'),
  buildTrial('mr-clean-no-iv-trial', 'MR CLEAN-NO IV', 'evt', '10.1056/NEJMoa2107727'),
  buildTrial('direct-safe-trial', 'DIRECT-SAFE', 'evt', '10.1016/S0140-6736(22)00564-5'),
  buildTrial('swift-direct-trial', 'SWIFT DIRECT', 'evt', '10.1016/S0140-6736(22)00537-2'),
  buildTrial('laste-trial', 'LASTE', 'evt', '10.1056/NEJMoa2314063'),
  buildTrial('tension-trial', 'TENSION', 'evt', '10.1016/S0140-6736(23)02032-9'),
  buildTrial('escape-mevo-trial', 'ESCAPE-MeVO', 'evt', '10.1056/NEJMoa2411668', {
    isPlaceholder: false,
    description: 'Parallel MeVO thrombectomy trial across M2/M3, ACA, and PCA targets.',
  }),
  buildTrial('distal-trial', 'DISTAL', 'evt', '10.1056/NEJMoa2408954', {
    isPlaceholder: false,
    description: 'Randomized EVT trial for medium and distal vessel occlusions.',
  }),
  buildTrial('compass-trial', 'COMPASS', 'evt', '10.1016/S0140-6736(19)30297-1'),
  buildTrial('aster-trial', 'ASTER', 'evt', '10.1001/jama.2017.9644'),
  buildTrial('aster2-trial', 'ASTER2', 'evt', '10.1001/jama.2021.13827'),
  buildTrial('choice-trial', 'CHOICE', 'evt', '10.1001/jama.2022.1645'),
  buildTrial('rescue-bt-trial', 'RESCUE BT', 'evt', '10.1001/jama.2022.12584'),

  buildTrial('enchanted-trial', 'ENCHANTED', 'acute-management', '10.1016/S0140-6736(19)30038-8'),
  buildTrial('best-ii-trial', 'BEST-II', 'acute-management', '10.1001/jama.2023.14330'),
  buildTrial('bp-target-trial', 'BP-TARGET', 'acute-management', '10.1016/S1474-4422(20)30483-X'),
  buildTrial('optimal-bp-trial', 'OPTIMAL-BP', 'acute-management', '10.1001/jama.2023.14590'),
  buildTrial('charm-trial', 'CHARM', 'acute-management', '10.1016/S1474-4422(24)00425-3'),
  buildTrial('escape-na1-trial', 'ESCAPE-NA1', 'acute-management', '10.1016/S0140-6736(20)30258-0'),

  buildTrial('decimal-trial', 'DECIMAL', 'surgical-interventions', '10.1161/STROKEAHA.107.485235'),
  buildTrial('destiny-trial', 'DESTINY', 'surgical-interventions', '10.1161/STROKEAHA.107.485649'),
  buildTrial('hamlet-trial', 'HAMLET', 'surgical-interventions', '10.1016/S1474-4422(09)70047-X'),
  buildTrial('destiny-ii-trial', 'DESTINY II', 'surgical-interventions', '10.1056/NEJMoa1311367'),

  buildTrial('timing-trial', 'TIMING', 'secondary-prevention', '10.1161/CIRCULATIONAHA.122.060666'),
  buildTrial('optimas-trial', 'OPTIMAS', 'secondary-prevention', '10.1016/S0140-6736(24)02197-4'),
];

export const TRIAL_CATEGORY_IDS: TrialCategoryKey[] = [
  'prehospital-triage',
  'ivt',
  'evt',
  'acute-management',
  'surgical-interventions',
  'secondary-prevention',
];

export function groupTrialsByCategory(trialsList: TrialItem[]): Record<TrialCategoryKey, TrialItem[]> {
  const groups = {} as Record<TrialCategoryKey, TrialItem[]>;
  TRIAL_CATEGORY_IDS.forEach((cat) => {
    groups[cat] = [];
  });
  trialsList.forEach((trial) => {
    groups[trial.category].push(trial);
  });
  return groups;
}

export function findTrialById(id: string): TrialItem | undefined {
  return trials.find((trial) => trial.id === id);
}
