export interface MetaData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

export type StaticRouteKey =
  | 'home'
  | 'calculators'
  | 'aspect-score'
  | 'nihss'
  | 'ich-score'
  | 'abcd2-score'
  | 'has-bled-score'
  | 'rope-score'
  | 'glasgow-coma-scale'
  | 'heidelberg-bleeding-classification'
  | 'boston-criteria-caa'
  | 'gca-pathway'
  | 'elan-pathway'
  | 'evt-pathway'
  | 'late-window-ivt'
  | 'se-pathway'
  | 'migraine-pathway'
  | 'stroke-code'
  | 'em-billing'
  | 'guide-hub'
  | 'aha-2026-guideline'
  | 'stroke-basics'
  | 'stroke-basics-desktop'
  | 'stroke-basics-mobile'
  | 'iv-tpa'
  | 'tpa-eligibility'
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
  | 'trials-hub';

export interface RouteDefinition {
  key: StaticRouteKey;
  path: string;
  publishGate?: boolean;
  published?: boolean;
  includeInSitemap?: boolean;
  comingSoonMessage?: string;
  meta: MetaData;
}

const DEFAULT_IMAGE = 'https://neurowiki.ai/og-image.png';

export const DEFAULT_META: MetaData = {
  title: 'NeuroWiki | Neurology Calculators, Pathways & Trials',
  description: 'Free stroke calculators, clinical pathways, and landmark trial summaries for neurologists and residents. NIHSS, EVT eligibility, long-window IVT, ICH Score, Status Epilepticus, and more.',
  keywords: 'neurology calculators, NIHSS calculator, stroke pathway, EVT eligibility, IVT calculator, stroke calculator, neurology trials, neurology resident tools, clinical decision support',
  image: DEFAULT_IMAGE,
};

export const STATIC_ROUTE_DEFINITIONS: RouteDefinition[] = [
  {
    key: 'home',
    path: '/',
    published: true,
    includeInSitemap: true,
    meta: DEFAULT_META,
  },
  {
    key: 'calculators',
    path: '/calculators',
    published: true,
    includeInSitemap: true,
    meta: {
      title: 'Neurology Calculators — NIHSS, ICH Score, GCS & More | NeuroWiki',
      description: 'Free online neurology calculators: NIHSS, ICH Score, ABCD2, GCS, HAS-BLED, RoPE, Heidelberg, Boston Criteria 2.0. Stroke and neurocritical care tools for physicians.',
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
    meta: {
      title: 'ASPECTS Score Calculator — Alberta Stroke Program Early CT Score | NeuroWiki',
      description: 'Free ASPECTS calculator for MCA stroke. Score 10 regions (M1–M6, Caudate, Lentiform, Internal Capsule, Insular Ribbon) on non-contrast CT. Color-coded EVT eligibility per AHA/ASA 2026 guidelines.',
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
    meta: {
      title: 'ICH Score Calculator — Hemorrhage Mortality Prediction | NeuroWiki',
      description: 'Calculate ICH Score for 30-day mortality prediction in intracerebral hemorrhage. Includes GCS, hemorrhage volume, IVH, infratentorial location, and age. Based on Hemphill et al., Stroke 2001.',
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
    meta: {
      title: 'ABCD² Score Calculator — TIA Stroke Risk | NeuroWiki',
      description: 'Calculate 2-day stroke risk after TIA using the ABCD² score. Free online calculator with clinical interpretation. Age, blood pressure, clinical features, duration, diabetes. Based on AHA/ASA guidelines.',
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
    meta: {
      title: 'HAS-BLED Score — Bleeding Risk on Anticoagulation | NeuroWiki',
      description: 'Estimate major bleeding risk with the HAS-BLED score for patients on anticoagulation. Identifies modifiable risk factors. Note: not a reason to withhold anticoagulation in high-stroke-risk AF.',
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
    meta: {
      title: 'RoPE Score — PFO-Attributable Stroke Risk | NeuroWiki',
      description: 'Calculate PFO-attributable fraction in cryptogenic stroke using the RoPE Score. Supports shared decision-making for PFO closure. Based on Kent et al.',
      keywords: 'RoPE score calculator, PFO stroke calculator, patent foramen ovale stroke risk, cryptogenic stroke PFO, PFO closure decision',
    },
  },
  {
    key: 'glasgow-coma-scale',
    path: '/calculators/glasgow-coma-scale',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'GCS calculator',
    meta: {
      title: 'Glasgow Coma Scale (GCS) Calculator | NeuroWiki',
      description: 'Standard GCS calculator for consciousness and neurological assessment. Handles intubated patients and not-testable responses. Eye, verbal, and motor scoring with clinical interpretation.',
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
    meta: {
      title: 'Heidelberg Bleeding Classification — Hemorrhagic Transformation | NeuroWiki',
      description: 'Classify hemorrhagic transformation after ischemic stroke and reperfusion therapy. Free online calculator per von Kummer et al. Stroke 2015. Guides post-tPA and post-thrombectomy management.',
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
    meta: {
      title: 'Boston Criteria 2.0 for CAA — Cerebral Amyloid Angiopathy | NeuroWiki',
      description: 'Diagnose cerebral amyloid angiopathy using Boston Criteria 2.0. MRI-based CAA classification with anticoagulation risk stratification. Charidimou et al., Lancet Neurology 2022.',
      keywords: 'Boston criteria CAA, cerebral amyloid angiopathy diagnosis, Boston criteria 2.0, CAA MRI criteria, CAA anticoagulation risk, lobar hemorrhage',
    },
  },
  {
    key: 'gca-pathway',
    path: '/calculators/gca-pathway',
    publishGate: true,
    published: true,
    comingSoonMessage: 'GCA pathway',
    meta: {
      title: 'GCA Pathway — Giant Cell Arteritis Diagnostic Workup | NeuroWiki',
      description: 'Risk stratification and diagnostic pathway for giant cell arteritis (GCA) and polymyalgia rheumatica (PMR). Covers clinical features, ESR/CRP, temporal artery biopsy, and corticosteroid initiation.',
      keywords: 'giant cell arteritis pathway, GCA diagnostic criteria, temporal arteritis workup, GCA ESR CRP, temporal artery biopsy, polymyalgia rheumatica GCA, GCA corticosteroid treatment',
    },
  },
  {
    key: 'elan-pathway',
    path: '/calculators/elan-pathway',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'ELAN pathway',
    meta: {
      title: 'ELAN Anticoagulation Pathway — Post-Stroke DOAC Timing | NeuroWiki',
      description: 'DOAC anticoagulation timing after acute ischemic stroke with atrial fibrillation. Based on ELAN trial (NEJM 2023) and AHA/ASA 2026 guidelines. Covers stroke size, hemorrhagic transformation, and timing.',
      keywords: 'ELAN anticoagulation pathway, post-stroke anticoagulation timing, DOAC after stroke, atrial fibrillation stroke anticoagulation, ELAN trial, post-stroke DOAC timing calculator',
    },
  },
  {
    key: 'evt-pathway',
    path: '/calculators/evt-pathway',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'EVT pathway',
    meta: {
      title: 'EVT Eligibility Tool — Thrombectomy Decision Support | NeuroWiki',
      description: 'Interactive EVT eligibility pathway for mechanical thrombectomy in acute ischemic stroke. Based on DAWN, DEFUSE-3, SELECT-2, ANGEL-ASPECT, and AHA/ASA 2026 guidelines. Covers LVO, ASPECTS, time windows.',
      keywords: 'EVT eligibility calculator, thrombectomy eligibility criteria, mechanical thrombectomy decision support, DAWN trial criteria, DEFUSE-3 criteria, EVT pathway stroke, ASPECTS score stroke',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'late-window-ivt',
    path: '/calculators/late-window-ivt',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Late Window IVT',
    meta: {
      title: 'Late Window IVT — Wake-Up Stroke & Thrombolysis Eligibility | NeuroWiki',
      description: 'Interactive late window IVT eligibility pathway for wake-up stroke, perfusion-selected 4.5–9h thrombolysis, and selected late-window LVO cases up to 24h from last known well. Based on WAKE-UP, EXTEND, TIMELESS, TRACE-3, and 2026 AHA/ASA guidelines.',
      keywords: 'late window IVT, wake-up stroke thrombolysis, extended window tPA, DWI FLAIR mismatch eligibility, WAKE-UP trial criteria, TIMELESS trial tenecteplase, late window thrombolysis calculator, unknown onset stroke tPA',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'se-pathway',
    path: '/calculators/se-pathway',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    comingSoonMessage: 'Status epilepticus pathway',
    meta: {
      title: 'Status Epilepticus Protocol — Interactive Management Pathway | NeuroWiki',
      description: 'Step-by-step interactive status epilepticus management pathway. Covers early SE, established SE, refractory SE, and super-refractory SE. Based on ESETT trial and neurocritical care guidelines.',
      keywords: 'status epilepticus protocol, status epilepticus treatment algorithm, refractory status epilepticus, status epilepticus first line treatment, benzodiazepine status epilepticus, SE management pathway',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'migraine-pathway',
    path: '/calculators/migraine-pathway',
    publishGate: true,
    published: true,
    comingSoonMessage: 'Migraine pathway',
    meta: {
      title: 'Acute Migraine Pathway — ED & Inpatient Management | NeuroWiki',
      description: 'Acute migraine and headache management pathway for emergency department and inpatient settings. Migraine cocktail, abortive therapy, and refractory headache protocols.',
      keywords: 'acute migraine treatment protocol, migraine cocktail ED, inpatient migraine management, refractory migraine treatment, acute headache pathway, migraine abortive therapy',
    },
  },
  {
    key: 'stroke-code',
    path: '/calculators/stroke-code',
    publishGate: true,
    published: true,
    includeInSitemap: true,
    meta: {
      title: 'Stroke Code Protocol — Acute Stroke Workflow for Residents | NeuroWiki',
      description: 'Interactive stroke code workflow covering last known well, thrombolysis eligibility, CTA decision-making, thrombectomy escalation, and resident-ready admit orders.',
      keywords: 'stroke code protocol, acute stroke workflow, stroke code steps, stroke resident guide, thrombolysis checklist, thrombectomy workflow',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'em-billing',
    path: '/calculators/em-billing',
    publishGate: true,
    published: true,
    comingSoonMessage: 'E/M Billing calculator',
    meta: {
      title: 'E/M Billing Calculator — CPT Code 99202–99215 | MDM & Time-Based | NeuroWiki',
      description: 'Free E/M billing calculator for physicians. Select the correct CPT code (99202–99215, 99221–99233) using 2021 AMA MDM or time-based criteria. Neurology, hospitalist, IM, and emergency medicine. NPI lookup included.',
      keywords: 'EM billing calculator, E/M billing calculator neurology, CPT 99202 99205 99212 99215 calculator, MDM calculator 2021, medical decision making calculator, evaluation and management billing physician, hospitalist EM billing calculator, inpatient EM coding 99221 99222 99223 99231 99232 99233, time vs MDM calculator, 2021 AMA EM coding, neurology CPT code calculator, evaluation and management calculator free',
    },
  },
  {
    key: 'guide-hub',
    path: '/guide',
    published: true,
    includeInSitemap: true,
    meta: {
      title: 'Neurology Toolkit — Clinical Guides, Protocols & Calculators | NeuroWiki',
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
    meta: {
      title: 'Stroke Code Protocol — Acute Stroke Workflow for Residents | NeuroWiki',
      description: 'Complete acute stroke code protocol: last known well, tPA eligibility, NIHSS, CT/CTA imaging, thrombectomy criteria, GWTG metrics, and admit orders. AHA/ASA 2026 aligned. For neurology residents.',
      keywords: 'stroke code protocol, acute stroke management, stroke workflow residents, door to needle time, tPA eligibility criteria, stroke code steps, acute ischemic stroke protocol, LKW stroke',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'stroke-basics-desktop',
    path: '/guide/stroke-basics-desktop',
    publishGate: true,
    published: true,
    comingSoonMessage: 'Stroke basics guide',
    meta: {
      title: 'Stroke Code Protocol — Desktop Layout | NeuroWiki',
      description: 'Desktop-oriented stroke code workflow reference covering the same NeuroWiki acute stroke protocol with a wide-screen layout optimized for workstations.',
      keywords: 'stroke code protocol desktop, acute stroke workflow desktop, stroke code residents desktop',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'stroke-basics-mobile',
    path: '/guide/stroke-basics-mobile',
    publishGate: true,
    published: true,
    comingSoonMessage: 'Stroke basics guide',
    meta: {
      title: 'Stroke Code Protocol — Mobile Layout | NeuroWiki',
      description: 'Mobile-oriented stroke code workflow reference covering last known well, thrombolysis, EVT escalation, and admit orders for bedside use.',
      keywords: 'stroke code protocol mobile, stroke workflow mobile, bedside stroke guide',
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
    meta: {
      title: 'IV tPA Protocol — Alteplase & Tenecteplase Eligibility | NeuroWiki',
      description: 'Complete IV thrombolysis protocol for acute ischemic stroke. Alteplase 0.9 mg/kg and tenecteplase 0.25 mg/kg eligibility, dosing, inclusions/exclusions, and monitoring. AHA/ASA 2026 COR 1 for both agents.',
      keywords: 'IV tPA protocol stroke, alteplase stroke dosing, tenecteplase stroke eligibility, tenecteplase vs alteplase stroke, tPA eligibility criteria, thrombolysis stroke protocol, IV thrombolysis inclusion exclusion, tPA 0.9 mg kg, tenecteplase 0.25 mg kg, tenecteplase alteplase equivalent',
      image: DEFAULT_IMAGE,
    },
  },
  {
    key: 'tpa-eligibility',
    path: '/guide/tpa-eligibility',
    publishGate: true,
    published: true,
    comingSoonMessage: 'tPA eligibility criteria coming soon',
    meta: {
      title: 'IV tPA Protocol — Alteplase & Tenecteplase Eligibility | NeuroWiki',
      description: 'Complete IV thrombolysis protocol for acute ischemic stroke. Alteplase 0.9 mg/kg and tenecteplase 0.25 mg/kg eligibility, dosing, inclusions/exclusions, and monitoring. AHA/ASA 2026 COR 1 for both agents.',
      keywords: 'tPA eligibility criteria, IV tPA stroke, alteplase eligibility, tenecteplase stroke, thrombolysis eligibility calculator',
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
    meta: {
      title: 'Mechanical Thrombectomy Guide — EVT Criteria & Technique | NeuroWiki',
      description: 'Mechanical thrombectomy guide for LVO stroke. EVT eligibility criteria, imaging selection (ASPECTS, perfusion), procedure overview, and post-procedure management. DAWN, DEFUSE-3, AHA/ASA 2026.',
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
    meta: {
      title: 'Acute Stroke Management — Inpatient Protocol | NeuroWiki',
      description: 'Acute ischemic stroke management protocol: BP targets, glucose control, dysphagia screening, antiplatelet initiation, DVT prophylaxis, and secondary prevention. AHA/ASA 2026 guidelines.',
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
    meta: {
      title: 'Status Epilepticus Management Guide — First Line to Refractory | NeuroWiki',
      description: 'Status epilepticus management: lorazepam first-line, levetiracetam/valproate/fosphenytoin second-line, propofol/midazolam/ketamine for refractory SE. Based on ESETT trial. For neurology residents.',
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
    meta: {
      title: 'ICH Management — Intracerebral Hemorrhage Protocol | NeuroWiki',
      description: 'Acute ICH management per 2022 AHA/ASA guidelines: rapid BP reduction to <140 mmHg, 4-factor PCC reversal, cerebellar hemorrhage surgery criteria, ICP management, and hematoma expansion prevention.',
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
    meta: {
      title: 'Bacterial Meningitis — Workup & Treatment Protocol | NeuroWiki',
      description: 'Bacterial meningitis workup and treatment: empiric antibiotics, dexamethasone timing, LP interpretation, CSF analysis, and antibiotic tailoring. For emergency and inpatient neurology.',
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
    meta: {
      title: 'Guillain-Barré Syndrome (GBS) — Diagnosis & Treatment | NeuroWiki',
      description: 'GBS clinical guide: Brighton criteria, NCS findings, CSF albumino-cytologic dissociation, IVIG vs. plasmapheresis, respiratory monitoring (NIF, FVC), and prognosis. For neurology residents.',
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
    meta: {
      title: 'Myasthenia Gravis — Diagnosis, Crisis, & Treatment | NeuroWiki',
      description: 'Myasthenia gravis clinical guide: acetylcholinesterase inhibitor dosing, myasthenic crisis management, IVIG/plasmapheresis, thymectomy indications, and long-term immunosuppression. For neurology residents.',
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
    meta: {
      title: 'Multiple Sclerosis — Diagnosis, Relapse & DMT | NeuroWiki',
      description: 'MS clinical guide: McDonald criteria, relapse management with high-dose methylprednisolone, disease-modifying therapy overview, and monitoring. For neurology residents and students.',
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
    meta: {
      title: 'Seizure Workup — First Seizure Evaluation & Diagnostic Approach | NeuroWiki',
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
    meta: {
      title: 'Altered Mental Status Workup — Diagnostic Approach | NeuroWiki',
      description: 'Systematic approach to altered mental status (AMS): differential diagnosis, initial workup, delirium vs. encephalopathy, reversible causes, and empiric treatment. Neurology and emergency medicine.',
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
    meta: {
      title: 'Headache Workup — Differential Diagnosis & Red Flags | NeuroWiki',
      description: 'Systematic headache workup: primary vs. secondary headache differentiation, thunderclap headache evaluation, SNOOP4 red flags, LP for SAH, and imaging criteria. For neurology residents.',
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
    meta: {
      title: 'Vertigo — BPPV, Central vs Peripheral, & HINTS Exam | NeuroWiki',
      description: 'Vertigo clinical guide: BPPV Epley maneuver, HINTS exam for stroke vs. peripheral cause, Dix-Hallpike, vestibular neuritis vs. cerebellar stroke. For neurology and emergency medicine.',
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
    meta: {
      title: 'Weakness Workup — Upper vs Lower Motor Neuron Approach | NeuroWiki',
      description: 'Systematic weakness evaluation: UMN vs. LMN localization, neuromuscular junction, myopathy workup, MRC grading, and diagnostic algorithm. For neurology residents.',
      keywords: 'weakness workup neurology, upper motor neuron lower motor neuron, UMN LMN weakness, neuromuscular junction weakness, myopathy evaluation, weakness localization neurology, MRC grading weakness',
    },
  },
  {
    key: 'trials-hub',
    path: '/trials',
    published: true,
    includeInSitemap: true,
    meta: {
      title: 'Stroke Clinical Trials — Evidence Summaries for Neurologists | NeuroWiki',
      description: 'Summaries of 79 landmark stroke clinical trials: DAWN, DEFUSE-3, NINDS, ORIGINAL, MR CLEAN, INSPIRES, ENRICH, TRACE-III, ELAN, CHANCE, POINT, and more. NNT, mRS outcomes, AHA/ASA 2026 guideline recommendations. For neurologists and residents.',
      keywords: 'landmark stroke clinical trials, stroke trial results, thrombectomy trials, IV thrombolysis trials, DAWN trial, DEFUSE-3 trial, NINDS tPA trial, ORIGINAL tenecteplase trial, MR CLEAN trial, INSPIRES DAPT stroke, ENRICH ICH surgery, secondary prevention stroke trials, NNT stroke, NEJM stroke trials, vascular neurology clinical trials',
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
