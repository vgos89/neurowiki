import { LEGACY_TRIAL_CATALOG_META } from './trialCatalogMeta';
// trialData.ts is intentionally NOT imported here (Phase 6B).
// legend is populated lazily by each lazy route that needs it
// (TrialsPage, QuestionDetailPage) — keeping it out of the home-page bundle.

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
  /** Legend-card presentation slice. Projected from TrialMetadata.legend. */
  legend?: {
    finding?: string;
    bottomLineTag?: string;
    keyStat?: string;
  };
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
  options?: { isPlaceholder?: boolean; description?: string; year?: number }
): Omit<TrialItem, 'year'> & { year?: number } => ({
  id,
  name,
  category,
  doi,
  path: `/trials/${id}`,
  isPlaceholder: options?.isPlaceholder ?? true,
  description: options?.description,
  ...(options?.year !== undefined ? { year: options.year } : {}),
});

const manualTrials: (Omit<TrialItem, 'year'> & { year?: number })[] = [
  buildTrial('b-proud-trial', 'B_PROUD', 'prehospital-triage', '10.1001/jama.2020.26345', {
    isPlaceholder: false,
    description: 'Berlin prospective MSU dispatch study showing better 90-day disability outcomes than conventional ambulance alone.',
    year: 2021,
  }),
  buildTrial('best-msu-trial', 'BEST-MSU', 'prehospital-triage', '10.1056/NEJMoa2103879', {
    isPlaceholder: false,
    description: 'Multicenter US MSU trial showing faster thrombolysis and better 90-day outcomes in tPA-eligible patients.',
    year: 2021,
  }),
  buildTrial('racecat-trial', 'RACECAT', 'prehospital-triage', '10.1001/jama.2022.4404', {
    isPlaceholder: false,
    description: 'Cluster-randomized Catalonia trial comparing direct CSC transport with initial local stroke center routing for suspected LVO.',
    year: 2022,
  }),
  buildTrial('triage-stroke-trial', 'TRIAGE-STROKE', 'prehospital-triage', '10.1161/STROKEAHA.123.043875', {
    isPlaceholder: false,
    description: 'Randomized Danish transport trial in IVT-eligible suspected LVO patients comparing PSC-first vs CSC-first routing.',
    year: 2023,
  }),
  buildTrial('right-2-trial', 'RIGHT-2', 'prehospital-triage', '10.1016/S0140-6736(19)30194-1', {
    isPlaceholder: false,
    description: 'Ambulance-based sham-controlled trial of ultra-early glyceryl trinitrate in presumed stroke.',
    year: 2019,
  }),
  buildTrial('mr-asap-trial', 'MR ASAP', 'prehospital-triage', '10.1016/S1474-4422(22)00333-7', {
    isPlaceholder: false,
    description: 'Dutch prehospital GTN trial stopped early after a signal of early harm in intracerebral hemorrhage.',
    year: 2022,
  }),
  buildTrial('interact4-trial', 'INTERACT4', 'prehospital-triage', '10.1056/NEJMoa2314741', {
    isPlaceholder: false,
    description: 'Prehospital blood-pressure lowering before imaging confirmation: neutral overall, divergent by stroke type.',
    year: 2024,
  }),

  buildTrial('timeless-trial', 'TIMELESS', 'ivt', '10.1056/NEJMoa2310392', {
    isPlaceholder: false,
    description: 'Late-window tenecteplase after perfusion selection was neutral in a largely EVT-treated LVO population.',
    year: 2024,
  }),
  buildTrial('trace-iii-trial', 'TRACE-III', 'ivt', '10.1056/NEJMoa2402980', {
    isPlaceholder: false,
    description: 'Late-window tenecteplase for ICA/MCA occlusion when EVT is not available.',
    year: 2024,
  }),
  buildTrial('prisms-trial', 'PRISMS', 'ivt', '10.1001/jama.2018.8496', {
    isPlaceholder: false,
    description: 'Alteplase did not outperform aspirin in minor nondisabling stroke and caused more symptomatic ICH.',
    year: 2018,
  }),
  buildTrial('aramis-trial', 'ARAMIS', 'ivt', '10.1001/jama.2023.7827', {
    isPlaceholder: false,
    description: 'Dual antiplatelet therapy was noninferior to alteplase in minor nondisabling stroke within 4.5 hours.',
    year: 2023,
  }),
  buildTrial('act-trial', 'AcT', 'ivt', '10.1016/S0140-6736(22)01054-6', {
    isPlaceholder: false,
    description: 'Canadian registry-linked trial showing tenecteplase 0.25 mg/kg was noninferior to alteplase.',
    year: 2022,
  }),
  buildTrial('attest-2-trial', 'ATTEST-2', 'ivt', '10.1016/S1474-4422(24)00377-6', {
    isPlaceholder: false,
    description: 'Large UK trial confirming noninferiority of tenecteplase to alteplase within 4.5 hours.',
    year: 2024,
  }),
  buildTrial('nor-test-trial', 'NOR-TEST', 'ivt', '10.1016/S1474-4422(17)30253-3', {
    isPlaceholder: false,
    description: 'High-dose tenecteplase 0.4 mg/kg was similar to alteplase in a predominantly mild-stroke cohort.',
    year: 2017,
  }),
  buildTrial('nor-test-2-part-a-trial', 'NOR-TEST 2 (Part A)', 'ivt', '10.1016/S1474-4422(22)00124-7', {
    isPlaceholder: false,
    description: 'Tenecteplase 0.4 mg/kg performed worse than alteplase in moderate-to-severe stroke and raised safety concerns.',
    year: 2022,
  }),
  buildTrial('trace-2-trial', 'TRACE-2', 'ivt', '10.1016/S0140-6736(22)02600-9', {
    isPlaceholder: false,
    description: 'Chinese phase 3 trial showing tenecteplase was noninferior to alteplase in EVT-ineligible stroke.',
    year: 2023,
  }),
  buildTrial('taste-trial', 'TASTE', 'ivt', '10.1016/S1474-4422(24)00206-0', {
    isPlaceholder: false,
    description: 'Perfusion-selected early-window trial that largely supported tenecteplase, with noninferiority clearest in per-protocol analysis.',
    year: 2024,
  }),
  buildTrial('thaws-trial', 'THAWS', 'ivt', '10.1161/STROKEAHA.119.028127', {
    isPlaceholder: false,
    description: 'MRI-selected unknown-onset stroke treated with low-dose alteplase.',
    year: 2020,
  }),
  buildTrial('twist-trial', 'TWIST', 'ivt', '10.1016/S1474-4422(22)00484-7', {
    isPlaceholder: false,
    description: 'Wake-up stroke trial using non-contrast CT alone; tenecteplase did not improve 90-day outcomes.',
    year: 2023,
  }),
  buildTrial('raise-trial', 'RAISE', 'ivt', '10.1056/NEJMoa2400314', {
    isPlaceholder: false,
    description: 'Reteplase improved excellent outcomes over alteplase in early-window ischemic stroke.',
    year: 2024,
  }),
  buildTrial('prost-trial', 'PROST', 'ivt', '10.1001/jamanetworkopen.2023.25415', {
    isPlaceholder: false,
    description: 'Phase 3 rhPro-UK trial showing noninferiority to alteplase with less systemic bleeding.',
    year: 2023,
  }),
  buildTrial('prost-2-trial', 'PROST-2', 'ivt', '10.1016/S1474-4422(24)00436-8', {
    isPlaceholder: false,
    description: 'Large phase 3 prourokinase trial confirming noninferiority to alteplase with lower bleeding rates.',
    year: 2024,
  }),
  // THEIA: first phase 3 RCT of IV alteplase for non-arteritic CRAO within
  // 4.5h. Neutral primary (underpowered, N=70); safety reassuring (0 sICH).
  // Categorised under 'ivt' (Acute Reperfusion: IVT) — listCategory in
  // trialData.ts is 'thrombolysis' (string literal). Predecessor: EAGLE
  // (intra-arterial fibrinolysis, 2010).
  buildTrial('theia-trial', 'THEIA', 'ivt', '10.1016/S1474-4422(25)00308-4', {
    isPlaceholder: false,
    description: 'First phase 3 RCT of IV alteplase vs aspirin for non-arteritic CRAO within 4.5h. Directionally favourable but underpowered (N=70); zero symptomatic ICH.',
    year: 2025,
  }),

  buildTrial('mr-clean-trial', 'MR CLEAN', 'evt', '10.1056/NEJMoa1411587', {
    isPlaceholder: false,
    description: 'Landmark first modern positive thrombectomy trial for anterior circulation LVO.',
    year: 2015,
  }),
  buildTrial('escape-trial', 'ESCAPE', 'evt', '10.1056/NEJMoa1414905', {
    isPlaceholder: false,
    description: 'Rapid EVT trial using collateral-based CT selection and strict workflow targets.',
    year: 2015,
  }),
  buildTrial('revascat-trial', 'REVASCAT', 'evt', '10.1056/NEJMoa1503780', {
    isPlaceholder: false,
    description: 'Registry-embedded Spanish thrombectomy trial confirming benefit within 8 hours.',
    year: 2015,
  }),
  buildTrial('extend-ia-trial', 'EXTEND-IA', 'evt', '10.1056/NEJMoa1414792', {
    isPlaceholder: false,
    description: 'Perfusion-selected thrombectomy trial showing major reperfusion and functional gains.',
    year: 2015,
  }),
  buildTrial('swift-prime-trial', 'SWIFT PRIME', 'evt', '10.1056/NEJMoa1415061', {
    isPlaceholder: false,
    description: 'Solitaire thrombectomy trial showing large functional gains over IV tPA alone.',
    year: 2015,
  }),
  buildTrial('thrace-trial', 'THRACE', 'evt', '10.1016/S1474-4422(16)30177-6', {
    isPlaceholder: false,
    description: 'French bridging-therapy trial showing benefit from adding thrombectomy to alteplase.',
    year: 2016,
  }),
  buildTrial('direct-mt-trial', 'DIRECT-MT', 'evt', '10.1056/NEJMoa2001123', {
    isPlaceholder: false,
    description: 'Early direct-EVT noninferiority trial in alteplase-eligible anterior circulation LVO.',
    year: 2020,
  }),
  buildTrial('devt-trial', 'DEVT', 'evt', '10.1001/jama.2020.23523', {
    isPlaceholder: false,
    description: 'Chinese direct-EVT trial meeting noninferiority against alteplase plus thrombectomy.',
    year: 2021,
  }),
  buildTrial('skip-trial', 'SKIP', 'evt', '10.1001/jama.2020.23522', {
    isPlaceholder: false,
    description: 'Japanese direct-EVT study that was directionally reassuring but statistically inconclusive.',
    year: 2021,
  }),
  buildTrial('mr-clean-no-iv-trial', 'MR CLEAN-NO IV', 'evt', '10.1056/NEJMoa2107727', {
    isPlaceholder: false,
    description: 'European direct-EVT trial showing neither superiority nor noninferiority over bridging therapy.',
    year: 2021,
  }),
  buildTrial('direct-safe-trial', 'DIRECT-SAFE', 'evt', '10.1016/S0140-6736(22)00564-5', {
    isPlaceholder: false,
    description: 'International direct-EVT trial that did not support skipping thrombolysis.',
    year: 2022,
  }),
  buildTrial('swift-direct-trial', 'SWIFT DIRECT', 'evt', '10.1016/S0140-6736(22)00537-2', {
    isPlaceholder: false,
    description: 'Western direct-EVT trial missing noninferiority and showing lower reperfusion without alteplase.',
    year: 2022,
  }),
  buildTrial('laste-trial', 'LASTE', 'evt', '10.1056/NEJMoa2314063', {
    isPlaceholder: false,
    description: 'Large-core thrombectomy trial showing better outcomes and lower mortality despite more bleeding.',
    year: 2024,
  }),
  buildTrial('tension-trial', 'TENSION', 'evt', '10.1016/S0140-6736(23)02032-9', {
    isPlaceholder: false,
    description: 'Large-core EVT trial using pragmatic non-contrast CT selection rather than perfusion imaging.',
    year: 2023,
  }),
  buildTrial('escape-mevo-trial', 'ESCAPE-MeVO', 'evt', '10.1056/NEJMoa2411668', {
    isPlaceholder: false,
    description: 'Parallel MeVO thrombectomy trial across M2/M3, ACA, and PCA targets.',
    year: 2025,
  }),
  buildTrial('distal-trial', 'DISTAL', 'evt', '10.1056/NEJMoa2408954', {
    isPlaceholder: false,
    description: 'Randomized EVT trial for medium and distal vessel occlusions.',
    year: 2025,
  }),
  buildTrial('compass-trial', 'COMPASS', 'evt', '10.1016/S0140-6736(19)30297-1', {
    isPlaceholder: false,
    description: 'Device-strategy trial showing aspiration-first thrombectomy was noninferior to stent retrievers.',
    year: 2019,
  }),
  buildTrial('aster-trial', 'ASTER', 'evt', '10.1001/jama.2017.9644', {
    isPlaceholder: false,
    description: 'Device-comparison trial showing no clear advantage for aspiration over stent retrievers.',
    year: 2017,
  }),
  buildTrial('aster2-trial', 'ASTER2', 'evt', '10.1001/jama.2021.13827', {
    isPlaceholder: false,
    description: 'Technical EVT trial showing no final reperfusion advantage from upfront combined strategy.',
    year: 2021,
  }),
  buildTrial('choice-trial', 'CHOICE', 'evt', '10.1001/jama.2022.1645', {
    isPlaceholder: false,
    description: 'Post-thrombectomy adjunct IA alteplase trial suggesting better excellent outcomes.',
    year: 2022,
  }),
  buildTrial('rescue-bt-trial', 'RESCUE BT', 'evt', '10.1001/jama.2022.12584', {
    isPlaceholder: false,
    description: 'Adjunct pre-EVT tirofiban trial showing no functional benefit.',
    year: 2022,
  }),

  buildTrial('enchanted-trial', 'ENCHANTED', 'acute-management', '10.1016/S0140-6736(19)30038-8', {
    isPlaceholder: false,
    description: 'BP lowering during alteplase reduced bleeding but did not improve 90-day disability.',
    year: 2019,
  }),
  buildTrial('best-ii-trial', 'BEST-II', 'acute-management', '10.1001/jama.2023.14330', {
    isPlaceholder: false,
    description: 'Phase 2 futility trial suggesting low probability that lower post-EVT BP targets help.',
    year: 2023,
  }),
  buildTrial('bp-target-trial', 'BP-TARGET', 'acute-management', '10.1016/S1474-4422(20)30483-X', {
    isPlaceholder: false,
    description: 'Randomized post-EVT BP trial showing no hemorrhage reduction with intensive targets.',
    year: 2021,
  }),
  buildTrial('optimal-bp-trial', 'OPTIMAL-BP', 'acute-management', '10.1001/jama.2023.14590', {
    isPlaceholder: false,
    description: 'Intensive BP lowering after successful EVT worsened functional independence.',
    year: 2023,
  }),
  buildTrial('charm-trial', 'CHARM', 'acute-management', '10.1016/S1474-4422(24)00425-3', {
    isPlaceholder: false,
    description: 'Phase 3 glibenclamide trial for malignant edema prevention after large hemispheric stroke.',
    year: 2024,
  }),
  buildTrial('escape-na1-trial', 'ESCAPE-NA1', 'acute-management', '10.1016/S0140-6736(20)30258-0', {
    isPlaceholder: false,
    description: 'Nerinetide neuroprotection trial during thrombectomy, neutral overall with an alteplase interaction.',
    year: 2020,
  }),

  buildTrial('decimal-trial', 'DECIMAL', 'surgical-interventions', '10.1161/STROKEAHA.107.485235', {
    isPlaceholder: false,
    description: 'Early hemicraniectomy trial showing major mortality reduction in malignant MCA infarction.',
    year: 2007,
  }),
  buildTrial('destiny-trial', 'DESTINY', 'surgical-interventions', '10.1161/STROKEAHA.107.485649', {
    isPlaceholder: false,
    description: 'German decompressive surgery trial confirming a strong survival benefit in malignant MCA stroke.',
    year: 2007,
  }),
  buildTrial('hamlet-trial', 'HAMLET', 'surgical-interventions', '10.1016/S1474-4422(09)70047-X', {
    isPlaceholder: false,
    description: 'Trial showing decompressive surgery works best when performed within 48 hours.',
    year: 2009,
  }),
  buildTrial('destiny-ii-trial', 'DESTINY II', 'surgical-interventions', '10.1056/NEJMoa1311367', {
    isPlaceholder: false,
    description: 'Hemicraniectomy trial in patients older than 60 years with malignant MCA infarction.',
    year: 2014,
  }),

  buildTrial('timing-trial', 'TIMING', 'secondary-prevention', '10.1161/CIRCULATIONAHA.122.060666', {
    isPlaceholder: false,
    description: 'Registry-based randomized trial supporting early NOAC start after AF-related ischemic stroke.',
    year: 2022,
  }),
  buildTrial('optimas-trial', 'OPTIMAS', 'secondary-prevention', '10.1016/S0140-6736(24)02197-4', {
    isPlaceholder: false,
    description: 'Large phase 4 trial showing early DOAC initiation was noninferior to delayed start.',
    year: 2024,
  }),
  // PRoFESS: long-term antiplatelet monotherapy comparison. listCategory in trialData.ts
  // is 'antiplatelets' (not a TrialCategoryKey); mapped to 'secondary-prevention' here.
  buildTrial('profess-trial', 'PRoFESS', 'secondary-prevention', '10.1056/NEJMoa0805002', {
    isPlaceholder: false,
    description: 'ASA + ER-dipyridamole vs clopidogrel monotherapy after stroke. NI margin not met; ICH higher with ASA–ERDP.',
    year: 2008,
  }),
  // CREST: carotid stenting vs endarterectomy. listCategory in trialData.ts is 'carotid'
  // (not a TrialCategoryKey); mapped to 'surgical-interventions' here.
  buildTrial('crest-trial', 'CREST', 'surgical-interventions', '10.1056/NEJMoa0912321', {
    isPlaceholder: false,
    description: 'CAS vs CEA in average-risk carotid stenosis. No primary 4-yr difference; CAS↑stroke, CEA↑MI/cranial nerve palsy; age-dependent.',
    year: 2010,
  }),
  // CREST-2: two parallel RCTs of revascularization vs modern intensive medical
  // management in asymptomatic ≥70% carotid stenosis. listCategory in trialData.ts
  // is 'carotid' (not a TrialCategoryKey); mapped to 'surgical-interventions' here
  // following the CREST 2010 precedent.
  buildTrial('crest-2-trial', 'CREST-2', 'surgical-interventions', '10.1056/NEJMoa2508800', {
    isPlaceholder: false,
    description: 'Asymptomatic ≥70% carotid stenosis. Stenting beat modern intensive medical management (2.8% vs 6.0%, NNT 31). Endarterectomy did not (3.7% vs 5.3%, P=0.24).',
    year: 2026,
  }),

  // ─── 2017 PFO closure cluster (CLOSE, RESPECT long-term, REDUCE) ─────────
  //     All three NEJM 2017;377(11), September 14 issue. listCategory in
  //     trialData.ts is 'antiplatelets' (closest valid match — comparator
  //     arm is antiplatelet medical therapy; neither 'thrombolysis',
  //     'thrombectomy', 'carotid', nor 'acute' fits cleanly). Mapped here to
  //     'secondary-prevention' (TrialCategoryKey) since PFO closure is a
  //     secondary-prevention procedure. See evidence packets in
  //     docs/evidence-packets/{close,respect-longterm,reduce}-2017-2026-05-20.md
  buildTrial('close-trial', 'CLOSE', 'secondary-prevention', '10.1056/NEJMoa1705915', {
    isPlaceholder: false,
    description: 'Cryptogenic stroke <60y with PFO + atrial septal aneurysm OR large shunt. PFO closure + antiplatelet abolished recurrent stroke vs antiplatelet alone (0% vs 6.0%, HR 0.03, NNT 20 over 5y). AF excess 4.6% vs 0.9%.',
    year: 2017,
  }),
  buildTrial('respect-trial', 'RESPECT (long-term)', 'secondary-prevention', '10.1056/NEJMoa1610057', {
    isPlaceholder: false,
    description: 'Cryptogenic stroke 18–60y with PFO. Extended 5.9-year follow-up of Amplatzer PFO Occluder vs medical therapy: recurrent ischemic stroke 3.6% vs 5.8% (HR 0.55, P=0.046, NNT 42). VTE higher with closure.',
    year: 2017,
  }),
  buildTrial('reduce-trial', 'REDUCE', 'secondary-prevention', '10.1056/NEJMoa1707404', {
    isPlaceholder: false,
    description: 'Cryptogenic stroke 18–59y with PFO. Gore HELEX/Cardioform closure + antiplatelet vs antiplatelet alone: clinical stroke 1.4% vs 5.4% (HR 0.23, P=0.002, NNT ~28 over 2y). AF excess 6.6% vs 0.4%.',
    year: 2017,
  }),

  // ─── PFO closure precursor trials (2012–2018) — added 2026-05-23 ──────────
  //     CLOSURE-I (2012), PC (2013), original RESPECT (2013), DEFENSE-PFO (2018).
  //     These four trials frame the 2017 PFO cluster by establishing the
  //     pre-2017 ambiguity (CLOSURE-I, PC, original RESPECT all missed primary
  //     ITT) and the post-2017 high-risk-anatomy confirmation (DEFENSE-PFO).
  //     The 'respect-original-trial' slug is DISTINCT from 'respect-trial'
  //     (which is the 2017 long-term extension). listCategory in trialData.ts
  //     is 'antiplatelets'; mapped here to 'secondary-prevention' following
  //     the CLOSE/RESPECT/REDUCE precedent.
  buildTrial('closure-i-trial', 'CLOSURE I', 'secondary-prevention', '10.1056/NEJMoa1009639', {
    isPlaceholder: false,
    description: 'First major PFO closure RCT (N=909, age 18–60). STARFlex device + antithrombotic vs medical therapy for cryptogenic stroke/TIA. Primary 2-year composite not met (5.5% vs 6.8%, HR 0.78, P=0.37). AF excess 5.7% vs 0.7%. STARFlex since withdrawn; broad inclusion likely diluted any signal.',
    year: 2012,
  }),
  buildTrial('pc-trial', 'PC Trial', 'secondary-prevention', '10.1056/NEJMoa1211716', {
    isPlaceholder: false,
    description: 'European RCT (N=414, age <60) of Amplatzer PFO Occluder vs medical therapy after cryptogenic stroke, TIA, or peripheral embolism. Primary composite 3.4% vs 5.2% (HR 0.63, P=0.34). Underpowered — only 18 primary events. Negative.',
    year: 2013,
  }),
  buildTrial('respect-original-trial', 'RESPECT (Original 2013)', 'secondary-prevention', '10.1056/NEJMoa1301440', {
    isPlaceholder: false,
    description: 'Original RESPECT primary publication (DISTINCT from the 2017 long-term extension). N=980, age 18–60, cryptogenic stroke + PFO, Amplatzer Occluder. ITT primary NOT MET at median 2.1y (HR 0.49, P=0.08 borderline). Per-protocol HR 0.37 (P=0.03); as-treated HR 0.27 (P=0.007). The 2017 extended follow-up converted the result.',
    year: 2013,
  }),
  buildTrial('defense-pfo-trial', 'DEFENSE-PFO', 'secondary-prevention', '10.1016/j.jacc.2018.02.046', {
    isPlaceholder: false,
    description: 'Korean RCT (N=120) of PFO closure vs medical therapy in cryptogenic stroke with HIGH-RISK PFO anatomy (atrial septal aneurysm, hypermobility ≥10 mm, or PFO size ≥2 mm). 2-year primary composite 0% vs 12.9% (log-rank P=0.013); ischemic stroke 0% vs 10.5% (P=0.023). Confirmed morphology-enrichment hypothesis.',
    year: 2018,
  }),

  // ─── 1997 foundational aspirin-in-AIS pair (IST + CAST) ────────────────────
  //     Lancet 1997;349(9065,9066). Together ~40,000 patients within 48h of
  //     acute ischaemic stroke. listCategory in trialData.ts is 'antiplatelets'
  //     (not a TrialCategoryKey); mapped to 'secondary-prevention' here
  //     following the PRoFESS / 2017 PFO cluster precedent. See evidence
  //     packets at docs/evidence-packets/{ist,cast}-1997-2026-05-20.md.
  buildTrial('ist-trial', 'IST', 'secondary-prevention', '10.1016/S0140-6736(97)04011-7', {
    isPlaceholder: false,
    description: 'International factorial 2x2 trial (N=19,435; UK CTSU + 36 countries) of aspirin 300 mg/d and/or subcutaneous heparin within 48h of acute ischaemic stroke. Aspirin reduced 14-day death or non-fatal recurrent stroke (11.3% vs 12.4%, 2p=0.02). Heparin (low or medium dose) showed no net 6-month benefit and increased haemorrhagic stroke.',
    year: 1997,
  }),
  buildTrial('cast-trial', 'CAST', 'secondary-prevention', '10.1016/S0140-6736(97)04010-5', {
    isPlaceholder: false,
    description: 'Chinese double-blind placebo-controlled trial (N=21,106 across 413 hospitals) of aspirin 160 mg/d vs placebo within 48h of acute ischaemic stroke. In-hospital mortality 3.3% vs 3.9% (2p=0.04); combined 4-week death or non-fatal stroke 5.3% vs 5.9% (2p=0.03). Paired with IST in Chen et al. 2000 pooled analysis.',
    year: 1997,
  }),

  // ─── ICH anticoagulation reversal chain (2026-05-21) ─────────────────────
  //     PATCH (2016), ANNEXA-4 (2019), and Sarode 2013 — three trials added
  //     to the ich-anticoagulation-reversal question alongside ANNEXA-I.
  //     listCategory in trialData.ts is 'acute' (valid TrialCategoryKey
  //     wrapper 'acute-management' is the closest match here — all three
  //     are acute reversal interventions during the hyperacute ICH window).
  //     Evidence packets in docs/evidence-packets/.
  buildTrial('patch-trial', 'PATCH', 'acute-management', '10.1016/S0140-6736(16)30392-0', {
    isPlaceholder: false,
    description: 'Open-label RCT in 190 patients with spontaneous antiplatelet-associated ICH within 6h. Platelet transfusion INCREASED odds of death or dependence at 3 months (adjusted common OR 2.05, 95% CI 1.18-3.56, P=0.0114). Establishes AHA/ASA 2022 Class III: Harm against routine platelet transfusion in antiplatelet-ICH.',
    year: 2016,
  }),
  buildTrial('annexa-4-trial', 'ANNEXA-4', 'acute-management', '10.1056/NEJMoa1814051', {
    isPlaceholder: false,
    description: 'Single-arm prospective cohort of 352 patients with acute major bleeding (64% intracranial) on FXa inhibitors. Anti-FXa activity reduced 92%; excellent/good hemostasis at 12 h in 82%. Supported FDA accelerated approval of andexanet alfa (May 2018). Randomized confirmation in ICH = ANNEXA-I (NEJM 2024).',
    year: 2019,
  }),
  buildTrial('sarode-2013-trial', 'Sarode 2013', 'acute-management', '10.1161/CIRCULATIONAHA.113.002283', {
    isPlaceholder: false,
    description: 'Phase IIIb open-label NI RCT in 202 VKA-treated adults with acute major bleeding. 4F-PCC noninferior to FFP for hemostatic efficacy (+7.1 pp, 95% CI -5.8 to +19.9) and superior for rapid INR reduction (62.2% vs 9.6% at 30 min). Underwrote FDA approval of Kcentra (April 2013) and AHA/ASA 2022 Class I, Level A.',
    year: 2013,
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

function enrichTrial(item: Omit<TrialItem, 'year'> & { year?: number }): TrialItem {
  const { year, ...rest } = item;
  return {
    ...rest,
    year: year ?? 0,
    // legend omitted — populated by lazy routes that need it (TrialsPage, QuestionDetailPage)
  };
}

const manualTrialIds = new Set(manualTrials.map((trial) => trial.id));

const restoredLegacyTrials: TrialItem[] = Object.entries(LEGACY_TRIAL_CATALOG_META)
  .filter(([id]) => !manualTrialIds.has(id))
  .map(([id, metadata]) => {
    if (import.meta.env.DEV && !legacyTrialCategories[id]) {
      console.warn(`[trialListData] Legacy trial "${id}" has no category mapping — defaulting to 'ivt'. Add it to legacyTrialCategories.`);
    }
    return {
      id,
      name: metadata.name,
      year: metadata.year,
      category: legacyTrialCategories[id] ?? 'ivt',
      doi: metadata.doi,
      path: `/trials/${id}`,
      isPlaceholder: false,
      description: metadata.description,
      clinicalContext: metadata.clinicalContext,
      // legend: omitted — see Phase 6B comment at top of file
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
