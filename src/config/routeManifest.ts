export interface MetaData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

// LAYOUT_SPEC §7 — width zone for main content wrapper
export type Zone = 'reading' | 'reference' | 'none';
// LAYOUT_SPEC §2 / §6.1.2 — nav tab identifiers
export type NavTab = 'home' | 'trials' | 'calculators' | 'pathways' | 'guide' | 'cases';

export type StaticRouteKey =
  | 'home'
  | 'calculators'
  | 'aspect-score'
  | 'nihss'
  | 'ich-score'
  | 'abcd2-score'
  | 'has-bled-score'
  | 'rope-score'
  | 'chads-vasc'
  | 'glasgow-coma-scale'
  | 'heidelberg-bleeding-classification'
  | 'boston-criteria-caa'
  | 'em-billing'
  | 'pathways-hub'
  | 'pathways-elan'
  | 'pathways-evt'
  | 'pathways-late-ivt'
  | 'pathways-se'
  | 'pathways-migraine'
  | 'pathways-stroke-code'
  | 'guide-hub'
  | 'aha-2026-guideline'
  | 'stroke-basics'
  | 'iv-tpa'
  | 'thrombectomy'
  | 'acute-stroke-mgmt'
  | 'status-epilepticus'
  | 'ich-management'
  | 'meningitis'
  | 'gbs'
  | 'myasthenia-gravis'
  | 'multiple-sclerosis'
  | 'seizure-workup'
  | 'altered-mental-status'
  | 'headache-workup'
  | 'vertigo'
  | 'weakness-workup'
  | 'trials-hub'
  | 'privacy'
  | 'terms'
  | 'accessibility'
  | 'my-cases'
  | 'import-cases';

export interface RouteDefinition {
  key: StaticRouteKey;
  path: string;
  publishGate?: boolean;
  published?: boolean;
  includeInSitemap?: boolean;
  comingSoonMessage?: string;
  meta: MetaData;
  zone: Zone;           // LAYOUT_SPEC §7 — width zone for main content wrapper
  bottomNavTab: NavTab | null; // LAYOUT_SPEC §2 — which mobile nav tab is active on this route (null for private utility routes)
  railItem: NavTab | null;     // LAYOUT_SPEC §6.1.2 — which desktop rail item is active (null for private utility routes)
}

// v=3 bump (2026-05-19): new OG image generated via Nano Banana from
// docs/og-image-brief.md. Query suffix forces social platforms to refetch.
const DEFAULT_IMAGE = 'https://neurowiki.ai/og-image.png?v=3';

export const DEFAULT_META: MetaData = {
  title: 'NeuroWiki | Neurology Calculators, Pathways & Trials',
  description: 'Free stroke calculators, clinical pathways, and landmark trial summaries for neurologists and residents. NIHSS, EVT eligibility, long-window IVT, and more.',
  keywords: 'neurology calculators, NIHSS calculator, stroke pathway, EVT eligibility, IVT calculator, stroke calculator, neurology trials, neurology resident tools, clinical decision support',
  image: DEFAULT_IMAGE,
};

export const STATIC_ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    key: 'home',
    path: '/',
    published: true,
    includeInSitemap: true,
    zone: 'reference',
    bottomNavTab: 'home',
    railItem: 'home',
    meta: DEFAULT_META,
  },
  {
    key: 'calculators',
    path: '/calculators',
    published: true,
    includeInSitemap: true,
    zone: 'reference',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'Neurology Calculators — NIHSS, ICH Score, GCS | NeuroWiki',
      description: 'Free online neurology calculators: NIHSS, ICH Score, ABCD2, GCS, HAS-BLED, RoPE, Heidelberg, Boston Criteria 2.0. Tools for stroke and neurocritical care.',
      keywords: 'neurology calculators, NIHSS calculator, stroke calculator, ICH score, GCS calculator, HAS-BLED calculator, medical calculators for residents',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'aspect-score',
    path: '/calculators/aspects-score',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'ASPECTS Score calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'ASPECTS Score — Alberta Stroke Program Early CT | NeuroWiki',
      description: 'Free ASPECTS calculator for MCA stroke. Score 10 CT regions (M1–M6, Caudate, Lentiform, Internal Capsule, Insular Ribbon). EVT eligibility per AHA/ASA 2026.',
      keywords: 'ASPECTS score calculator, Alberta Stroke Program Early CT Score, ASPECTS thrombectomy eligibility, ASPECTS score stroke, MCA territory infarct, large core stroke EVT',
    },
  },
  {
    key: 'nihss',
    path: '/calculators/nihss',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'NIHSS calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'NIHSS Calculator — NIH Stroke Scale Online | NeuroWiki',
      description: 'Free NIHSS calculator for stroke severity assessment. Step-by-step NIH Stroke Scale scoring with LVO probability estimate and clinical interpretation.',
      keywords: 'NIHSS calculator, NIH stroke scale, stroke severity calculator, stroke assessment tool, LVO probability, neurology calculator online',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'ich-score',
    path: '/calculators/ich-score',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'ICH Score calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'ICH Score Calculator — Hemorrhage Prognosis | NeuroWiki',
      description: 'ICH Score calculator for 30-day mortality prediction in intracerebral hemorrhage. Covers GCS, volume, IVH, location, and age. Neurology clinical tool.',
      keywords: 'ICH score calculator, intracerebral hemorrhage mortality, ICH prognosis, GCS ICH, hemorrhage volume calculator, stroke calculator',
    },
  },
  {
    key: 'abcd2-score',
    path: '/calculators/abcd2-score',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'ABCD² Score calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'ABCD² Score Calculator — TIA Stroke Risk | NeuroWiki',
      description: 'Calculate 2-day stroke risk after TIA using the ABCD² score. Age, BP, clinical features, duration, diabetes. Clinical interpretation per AHA/ASA guidelines.',
      keywords: 'ABCD2 calculator, ABCD2 score TIA, TIA stroke risk, transient ischemic attack risk calculator, 2-day stroke risk after TIA',
    },
  },
  {
    key: 'has-bled-score',
    path: '/calculators/has-bled-score',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'HAS-BLED calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'HAS-BLED Score — Bleeding Risk, Anticoagulation | NeuroWiki',
      description: 'Estimate major bleeding risk on anticoagulation. Identifies modifiable risk factors. Not a reason to withhold anticoagulation in high-stroke-risk AF.',
      keywords: 'HAS-BLED calculator, HAS-BLED score, bleeding risk anticoagulation, atrial fibrillation bleeding risk, warfarin bleeding risk',
    },
  },
  {
    key: 'rope-score',
    path: '/calculators/rope-score',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'RoPE Score calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'RoPE Score — PFO-Attributable Stroke Risk | NeuroWiki',
      description: 'Calculate PFO-attributable fraction in cryptogenic stroke using the RoPE Score. Supports shared decision-making for PFO closure. Based on Kent et al.',
      keywords: 'RoPE score calculator, PFO stroke calculator, patent foramen ovale stroke risk, cryptogenic stroke PFO, PFO closure decision',
    },
  },
  {
    key: 'chads-vasc',
    path: '/calculators/chads-vasc',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'CHA₂DS₂-VASc Score calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'CHA₂DS₂-VASc Score — AF Stroke Risk Calculator | NeuroWiki',
      description: 'Calculate stroke risk in non-valvular atrial fibrillation using the CHA₂DS₂-VASc score. Anticoagulation thresholds per 2023 ACC/AHA/ACCP/HRS guidelines.',
      keywords: 'CHA2DS2-VASc calculator, CHA2DS2-VASc score, atrial fibrillation stroke risk, AF anticoagulation decision, AF stroke calculator, warfarin DOAC AF risk',
    },
  },
  {
    key: 'glasgow-coma-scale',
    path: '/calculators/glasgow-coma-scale',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'GCS calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'Glasgow Coma Scale (GCS) Score Calculator | NeuroWiki',
      description: 'GCS calculator for bedside consciousness assessment. Handles intubated patients and not-testable responses. Eye, verbal, and motor scoring with severity band.',
      keywords: 'Glasgow Coma Scale calculator, GCS calculator, GCS score, consciousness assessment, neurological exam, intubated GCS',
    },
  },
  {
    key: 'heidelberg-bleeding-classification',
    path: '/calculators/heidelberg-bleeding-classification',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Heidelberg bleeding classification',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'Heidelberg Bleeding Classification | NeuroWiki',
      description: 'Classify hemorrhagic transformation after ischemic stroke and reperfusion. Per von Kummer et al. Stroke 2015. Post-tPA and post-thrombectomy management.',
      keywords: 'Heidelberg bleeding classification, hemorrhagic transformation calculator, HI1 HI2 PH1 PH2, post-thrombolysis hemorrhage, post-tPA bleeding classification, stroke reperfusion hemorrhage',
    },
  },
  {
    key: 'boston-criteria-caa',
    path: '/calculators/boston-criteria-caa',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Boston Criteria 2.0 for CAA',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'Boston Criteria 2.0 — CAA Diagnosis | NeuroWiki',
      description: 'Diagnose CAA using Boston Criteria 2.0. MRI-based classification with anticoagulation risk stratification. Charidimou et al. Lancet Neurology 2022.',
      keywords: 'Boston criteria CAA, cerebral amyloid angiopathy diagnosis, Boston criteria 2.0, CAA MRI criteria, CAA anticoagulation risk, lobar hemorrhage',
    },
  },
  {
    key: 'pathways-hub',
    path: '/pathways',
    published: true,
    includeInSitemap: true,
    zone: 'reference',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    meta: {
      title: 'Clinical Pathways — Neurology Decision Support | NeuroWiki',
      description: 'Clinical decision pathways for neurology: Stroke Code, EVT, Extended IVT, ELAN anticoagulation, Status Epilepticus, Migraine, and GCA. Updated for AHA/ASA 2026.',
      keywords: 'neurology clinical pathways, stroke pathway, EVT decision tool, status epilepticus protocol, migraine pathway, GCA pathway, neurology workflows',
    },
  },
  // Removed 2026-05-15: pathways-gca. The scoring tool was not validated;
  // see commit log + docs/audits/2026-05-15/missing-trials-catalog.md context.
  // /pathways/gca-pathway now redirects to /pathways via App.tsx.
  {
    key: 'pathways-elan',
    path: '/pathways/elan-pathway',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    zone: 'reading',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    comingSoonMessage: 'ELAN pathway',
    meta: {
      title: 'ELAN Pathway — Post-Stroke DOAC Timing | NeuroWiki',
      description: 'DOAC anticoagulation timing after ischemic stroke with AF. Based on ELAN trial (NEJM 2023) and AHA/ASA 2026. Covers stroke size and hemorrhagic transformation.',
      keywords: 'ELAN anticoagulation pathway, post-stroke anticoagulation timing, DOAC after stroke, atrial fibrillation stroke anticoagulation, ELAN trial, post-stroke DOAC timing calculator',
    },
  },
  {
    key: 'pathways-evt',
    path: '/pathways/evt',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    zone: 'reading',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    comingSoonMessage: 'EVT pathway',
    meta: {
      title: 'EVT Eligibility Tool — Thrombectomy Decision | NeuroWiki',
      description: 'EVT eligibility pathway for mechanical thrombectomy in acute ischemic stroke. Based on DAWN, DEFUSE-3, SELECT-2, ANGEL-ASPECT, and AHA/ASA 2026 guidelines.',
      keywords: 'EVT eligibility calculator, thrombectomy eligibility criteria, mechanical thrombectomy decision support, DAWN trial criteria, DEFUSE-3 criteria, EVT pathway stroke, ASPECTS score stroke',
    },
  },
  {
    key: 'pathways-late-ivt',
    path: '/pathways/late-window-ivt',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    zone: 'reading',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    comingSoonMessage: 'Late Window IVT',
    meta: {
      title: 'Late Window IVT — Wake-Up Stroke & Thrombolysis | NeuroWiki',
      description: 'Late window IVT eligibility for wake-up stroke and perfusion-selected 4.5–9h thrombolysis. Based on WAKE-UP, EXTEND, TIMELESS, TRACE-3, and AHA/ASA 2026.',
      keywords: 'late window IVT, wake-up stroke thrombolysis, extended window tPA, DWI FLAIR mismatch eligibility, WAKE-UP trial criteria, TIMELESS trial tenecteplase, late window thrombolysis calculator, unknown onset stroke tPA',
    },
  },
  {
    key: 'pathways-se',
    path: '/pathways/se-pathway',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    zone: 'reading',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    comingSoonMessage: 'Status epilepticus pathway',
    meta: {
      title: 'Status Epilepticus — Management Pathway | NeuroWiki',
      description: 'Status epilepticus management pathway. Covers early SE, established SE, refractory SE, and super-refractory SE. Based on ESETT trial and NCC guidelines.',
      keywords: 'status epilepticus protocol, status epilepticus treatment algorithm, refractory status epilepticus, status epilepticus first line treatment, benzodiazepine status epilepticus, SE management pathway',
    },
  },
  {
    key: 'pathways-migraine',
    path: '/pathways/migraine-pathway',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    zone: 'reading',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    comingSoonMessage: 'Migraine pathway',
    meta: {
      title: 'Acute Migraine Pathway — ED & Inpatient | NeuroWiki',
      description: 'Acute migraine management pathway for emergency department and inpatient settings. Migraine cocktail, abortive therapy, and refractory headache protocols.',
      keywords: 'acute migraine treatment protocol, migraine cocktail ED, inpatient migraine management, refractory migraine treatment, acute headache pathway, migraine abortive therapy',
    },
  },
  {
    key: 'pathways-stroke-code',
    path: '/pathways/stroke-code',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    zone: 'reading',
    bottomNavTab: 'pathways',
    railItem: 'pathways',
    meta: {
      title: 'Stroke Code Protocol — Acute Stroke Workflow | NeuroWiki',
      description: 'Stroke code workflow covering last known well, thrombolysis eligibility, CTA decision-making, thrombectomy escalation, and resident-ready admit orders.',
      keywords: 'stroke code protocol, acute stroke workflow, stroke code steps, stroke resident guide, thrombolysis checklist, thrombectomy workflow',
    },
  },
  {
    key: 'em-billing',
    path: '/calculators/em-billing',
    publishGate: true,
    published: true,
    comingSoonMessage: 'E/M Billing calculator',
    zone: 'reading',
    bottomNavTab: 'calculators',
    railItem: 'calculators',
    meta: {
      title: 'E/M Billing Calculator — CPT 99202–99215 | NeuroWiki',
      description: 'Free E/M billing calculator. Select the correct CPT code (99202–99215, 99221–99233) using 2021 AMA MDM or time-based criteria. Neurology, hospitalist, and IM.',
      keywords: 'EM billing calculator, E/M billing calculator neurology, CPT 99202 99205 99212 99215 calculator, MDM calculator 2021, medical decision making calculator, evaluation and management billing physician, hospitalist EM billing calculator, inpatient EM coding 99221 99222 99223 99231 99232 99233, time vs MDM calculator, 2021 AMA EM coding, neurology CPT code calculator, evaluation and management calculator free',
    },
  },
  {
    key: 'guide-hub',
    path: '/guide',
    published: true,
    includeInSitemap: true,
    zone: 'reference',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Neurology Toolkit — Clinical Guides & Protocols | NeuroWiki',
      description: 'Neurology protocols and clinical guides for residents, attendings, and medical students. Stroke code, EVT, status epilepticus, ASPECTS, NIHSS, and more.',
      keywords: 'neurology toolkit, neurology protocols for residents, neurology resident guide, clinical neurology reference, stroke guide, epilepsy protocol, neurology calculators',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'aha-2026-guideline',
    path: '/guide/aha-2026-guideline',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: '2026 AHA/ASA Stroke Guideline mindmap coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: '2026 AHA/ASA Stroke Guideline Mindmap | NeuroWiki',
      description: 'Interactive mindmap summary of the 2026 AHA/ASA acute ischemic stroke guideline with class-of-recommendation and level-of-evidence context for bedside review.',
      keywords: '2026 AHA stroke guideline, AHA ASA stroke 2026, stroke guideline mindmap, ischemic stroke guideline summary',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'stroke-basics',
    path: '/guide/stroke-basics',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Stroke basics guide',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Acute Stroke Basics — Resident Reference Guide | NeuroWiki',
      description: 'Acute ischemic stroke reference for residents: last known well, NIHSS, tPA eligibility, CT/CTA imaging, thrombectomy criteria, and admit orders. AHA/ASA 2026.',
      keywords: 'acute stroke basics, stroke resident reference, ischemic stroke guide, NIHSS, tPA eligibility, thrombectomy criteria, LKW',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'iv-tpa',
    path: '/guide/iv-tpa',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'IV tPA eligibility and protocol coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'IV tPA Protocol — Alteplase & Tenecteplase | NeuroWiki',
      description: 'IV thrombolysis protocol for acute ischemic stroke. Alteplase 0.9 mg/kg and tenecteplase 0.25 mg/kg eligibility, dosing, and monitoring. AHA/ASA 2026 COR 1.',
      keywords: 'IV tPA protocol stroke, alteplase stroke dosing, tenecteplase stroke eligibility, tenecteplase vs alteplase stroke, tPA eligibility criteria, thrombolysis stroke protocol, IV thrombolysis inclusion exclusion, tPA 0.9 mg kg, tenecteplase 0.25 mg kg, tenecteplase alteplase equivalent',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'thrombectomy',
    path: '/guide/thrombectomy',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Thrombectomy guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Mechanical Thrombectomy Guide — EVT Criteria | NeuroWiki',
      description: 'Mechanical thrombectomy guide for LVO stroke. EVT eligibility, imaging selection (ASPECTS, perfusion), and post-procedure management. DAWN, DEFUSE-3, 2026.',
      keywords: 'mechanical thrombectomy guide, EVT stroke criteria, thrombectomy eligibility, LVO stroke treatment, ASPECTS score thrombectomy, thrombectomy time window, stent retriever thrombectomy',
    },
  },
  {
    key: 'acute-stroke-mgmt',
    path: '/guide/acute-stroke-mgmt',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Acute stroke management guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Acute Stroke Management — Inpatient Protocol | NeuroWiki',
      description: 'Acute ischemic stroke management: BP targets, glucose control, dysphagia screening, antiplatelet initiation, DVT prophylaxis, and secondary prevention.',
      keywords: 'acute stroke management protocol, stroke inpatient management, stroke blood pressure targets, dual antiplatelet stroke, stroke glucose management, dysphagia stroke screening, secondary prevention stroke',
    },
  },
  {
    key: 'status-epilepticus',
    path: '/guide/status-epilepticus',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Status epilepticus guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Status Epilepticus Guide — First to Refractory | NeuroWiki',
      description: 'Status epilepticus: lorazepam first-line, levetiracetam/valproate/fosphenytoin second-line, propofol/midazolam/ketamine for refractory SE. Based on ESETT trial.',
      keywords: 'status epilepticus management, status epilepticus treatment protocol, refractory status epilepticus treatment, lorazepam status epilepticus, ESETT trial, super-refractory status epilepticus, SE benzodiazepine',
    },
  },
  {
    key: 'ich-management',
    path: '/guide/ich-management',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'ICH management guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'ICH Management — Intracerebral Hemorrhage | NeuroWiki',
      description: 'Acute ICH management per 2022 AHA/ASA: SBP <140 mmHg, 4-factor PCC reversal, cerebellar hemorrhage surgery criteria, hematoma expansion prevention.',
      keywords: 'ICH management protocol, intracerebral hemorrhage treatment, ICH blood pressure target, 4-factor PCC reversal, cerebellar hemorrhage surgery, hematoma expansion, ICH guidelines 2022',
    },
  },
  {
    key: 'meningitis',
    path: '/guide/meningitis',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Meningitis guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Bacterial Meningitis — Workup & Treatment | NeuroWiki',
      description: 'Bacterial meningitis workup and treatment: empiric antibiotics, dexamethasone timing, LP interpretation, CSF analysis, and antibiotic tailoring.',
      keywords: 'bacterial meningitis treatment, meningitis antibiotic protocol, meningitis LP CSF analysis, dexamethasone meningitis, empiric meningitis antibiotics, meningitis workup residents',
    },
  },
  {
    key: 'gbs',
    path: '/guide/gbs',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'GBS guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Guillain-Barré Syndrome (GBS) — Diagnosis | NeuroWiki',
      description: 'GBS clinical guide: Brighton criteria, NCS findings, CSF albumino-cytologic dissociation, IVIG vs. plasmapheresis, and respiratory monitoring (NIF, FVC).',
      keywords: 'Guillain-Barre syndrome treatment, GBS IVIG protocol, GBS plasmapheresis, GBS respiratory monitoring NIF FVC, GBS diagnosis criteria, acute inflammatory demyelinating polyneuropathy',
    },
  },
  {
    key: 'myasthenia-gravis',
    path: '/guide/myasthenia-gravis',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Myasthenia gravis guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Myasthenia Gravis — Crisis & Treatment | NeuroWiki',
      description: 'Myasthenia gravis guide: pyridostigmine dosing, myasthenic crisis management, IVIG/plasmapheresis, thymectomy indications, and long-term immunosuppression.',
      keywords: 'myasthenia gravis treatment, myasthenic crisis management, MG pyridostigmine dosing, IVIG myasthenia gravis, myasthenia gravis thymectomy, acetylcholine receptor antibody MG',
    },
  },
  {
    key: 'multiple-sclerosis',
    path: '/guide/multiple-sclerosis',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Multiple sclerosis guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Multiple Sclerosis — Diagnosis, Relapse & DMT | NeuroWiki',
      description: 'MS clinical guide: McDonald criteria, relapse management with high-dose methylprednisolone, disease-modifying therapy overview, and monitoring.',
      keywords: 'multiple sclerosis treatment protocol, MS relapse treatment, MS disease modifying therapy, McDonald criteria MS, MS diagnosis, MS methylprednisolone protocol, MS DMT overview',
    },
  },
  {
    key: 'seizure-workup',
    path: '/guide/seizure-workup',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Seizure workup guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Seizure Workup — First Seizure Evaluation | NeuroWiki',
      description: 'First seizure workup: EEG, MRI brain, LP indications, seizure mimics, AED initiation criteria, and recurrence risk. For emergency and neurology residents.',
      keywords: 'first seizure workup, seizure evaluation, new onset seizure diagnosis, EEG first seizure, seizure vs syncope, seizure MRI protocol, AED initiation first seizure',
    },
  },
  {
    key: 'altered-mental-status',
    path: '/guide/altered-mental-status',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Altered mental status guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Altered Mental Status Workup — Diagnostic | NeuroWiki',
      description: 'Approach to altered mental status (AMS): differential diagnosis, initial workup, delirium vs. encephalopathy, reversible causes, and empiric treatment.',
      keywords: 'altered mental status workup, AMS differential diagnosis, delirium encephalopathy diagnosis, AMS neurology workup, altered consciousness evaluation, toxic metabolic encephalopathy',
    },
  },
  {
    key: 'headache-workup',
    path: '/guide/headache-workup',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Headache workup guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Headache Workup — Differential & Red Flags | NeuroWiki',
      description: 'Headache workup: primary vs. secondary differentiation, thunderclap headache evaluation, SNOOP4 red flags, LP for SAH, and imaging criteria.',
      keywords: 'headache workup, headache differential diagnosis, thunderclap headache evaluation, headache red flags SNOOP, subarachnoid hemorrhage headache, LP after headache CT scan',
    },
  },
  {
    key: 'vertigo',
    path: '/guide/vertigo',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Vertigo guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Vertigo — BPPV, Central vs Peripheral & HINTS | NeuroWiki',
      description: 'Vertigo clinical guide: BPPV Epley maneuver, HINTS exam for stroke vs. peripheral cause, Dix-Hallpike, vestibular neuritis vs. cerebellar stroke.',
      keywords: 'vertigo diagnosis, HINTS exam stroke, BPPV Epley maneuver, central vs peripheral vertigo, vestibular neuritis treatment, cerebellar stroke vertigo, Dix-Hallpike maneuver',
    },
  },
  {
    key: 'weakness-workup',
    path: '/guide/weakness-workup',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Weakness workup guide coming soon',
    zone: 'reading',
    bottomNavTab: 'guide',
    railItem: 'guide',
    meta: {
      title: 'Weakness Workup — Upper vs Lower Motor Neuron | NeuroWiki',
      description: 'Systematic weakness evaluation: UMN vs. LMN localization, neuromuscular junction, myopathy workup, MRC grading, diagnostic algorithm. Neurology residents.',
      keywords: 'weakness workup neurology, upper motor neuron lower motor neuron, UMN LMN weakness, neuromuscular junction weakness, myopathy evaluation, weakness localization neurology, MRC grading weakness',
    },
  },
  {
    key: 'trials-hub',
    path: '/trials',
    published: true,
    includeInSitemap: true,
    zone: 'reference',
    bottomNavTab: 'trials',
    railItem: 'trials',
    meta: {
      title: 'Stroke Clinical Trials — Evidence Summaries | NeuroWiki',
      description: '79 landmark stroke trials: DAWN, DEFUSE-3, NINDS, ORIGINAL, MR CLEAN, INSPIRES, ENRICH, TRACE-III, ELAN, CHANCE, POINT, and more. NNT and mRS outcomes.',
      keywords: 'landmark stroke clinical trials, stroke trial results, thrombectomy trials, IV thrombolysis trials, DAWN trial, DEFUSE-3 trial, NINDS tPA trial, ORIGINAL tenecteplase trial, MR CLEAN trial, INSPIRES DAPT stroke, ENRICH ICH surgery, secondary prevention stroke trials, NNT stroke, NEJM stroke trials, vascular neurology clinical trials',
      image: DEFAULT_IMAGE,
    },
  },
  // Legal / compliance pages — Phase 4D. Excluded from sitemap.
  {
    key: 'privacy',
    path: '/privacy',
    published: true,
    zone: 'reading',
    bottomNavTab: 'home',
    railItem: 'home',
    meta: {
      title: 'Privacy Policy · NeuroWiki',
      description: 'How NeuroWiki handles your data — Google Analytics, local storage, feedback submissions, and your GDPR/CCPA rights.',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'terms',
    path: '/terms',
    published: true,
    zone: 'reading',
    bottomNavTab: 'home',
    railItem: 'home',
    meta: {
      title: 'Terms of Use · NeuroWiki',
      description: 'Terms of use for NeuroWiki — clinical reference only, no warranty, governing law.',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'accessibility',
    path: '/accessibility',
    published: true,
    zone: 'reading',
    bottomNavTab: 'home',
    railItem: 'home',
    meta: {
      title: 'Accessibility Statement · NeuroWiki',
      description: 'NeuroWiki targets WCAG 2.1 AA compliance. Learn what we have implemented and how to report accessibility issues.',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'my-cases',
    path: '/my-cases',
    publishGate: false,
    published: true,
    includeInSitemap: false, // private surface; on-device data, not crawlable
    zone: 'reference',
    bottomNavTab: 'cases',
    railItem: null,
    meta: {
      title: 'My Cases · NeuroWiki',
      description: 'Patient cases saved locally on this device. Initials only; never sent to any server.',
      keywords: '',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'import-cases',
    path: '/import',
    publishGate: false,
    published: true,
    includeInSitemap: false, // private utility route; not crawlable
    zone: 'reference',
    bottomNavTab: null,
    railItem: null,
    meta: {
      title: 'Import Cases · NeuroWiki',
      description: 'Receive a case transfer from another device using a 6-digit code and 4-digit PIN.',
      keywords: '',
      image: DEFAULT_IMAGE,
    },
  },
];

export const STATIC_ROUTE_LOOKUP: Record<string, RouteDefinition> = Object.fromEntries(
  STATIC_ROUTE_DEFINITIONS.map((route) => [route.path, route])
);

export const STATIC_ROUTE_META_LOOKUP: Record<string, MetaData> = Object.fromEntries(
  STATIC_ROUTE_DEFINITIONS.map((route) => [route.path, { ...DEFAULT_META, ...route.meta }])
);

export const STATIC_SITEMAP_ROUTES = STATIC_ROUTE_DEFINITIONS
  .filter((route) => route.includeInSitemap)
  .map((route) => route.path);

export function getStaticRouteDefinition(path: string): RouteDefinition | undefined {
  return STATIC_ROUTE_LOOKUP[path];
}
