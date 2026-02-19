
interface MetaData {
  title: string;
  description: string;
  keywords?: string;
  image?: string;
}

const DEFAULT_META: MetaData = {
  title: 'NeuroWiki | Neurology Calculators & Stroke Protocols',
  description: 'Free neurology calculators (NIHSS, ASPECTS, ICH Score, ABCD2) and evidence-based stroke protocols. For residents and neurologists. AHA/ASA 2026 aligned.',
  keywords: 'neurology calculators, NIHSS calculator, stroke protocol, stroke calculator, neurology resources, clinical decision support',
  image: 'https://neurowiki.ai/og-image.png',
};

const ROUTE_REGISTRY: Record<string, MetaData> = {
  // ── Hub pages ──────────────────────────────────────────────────────────────
  '/': DEFAULT_META,

  '/guide': {
    title: 'Neurology Resident Guide — Protocols & Clinical Reference | NeuroWiki',
    description: 'Evidence-based neurology protocols and clinical guides for residents, attendings, and medical students. Stroke, epilepsy, neuromuscular, and more.',
    keywords: 'neurology protocols for residents, neurology resident guide, clinical neurology reference, stroke guide, epilepsy protocol',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/trials': {
    title: 'Landmark Neurology Trials — Stroke, EVT & Antiplatelet | NeuroWiki',
    description: 'Summaries of pivotal clinical trials in vascular neurology: DAWN, DEFUSE-3, NINDS, ELAN, CHANCE, POINT, and more. Evidence-based decision support.',
    keywords: 'landmark neurology trials, stroke trials, EVT trials, DAWN trial, DEFUSE-3, NINDS trial, CHANCE trial, antiplatelet stroke',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/calculators': {
    title: 'Neurology Calculators — NIHSS, ICH Score, GCS & More | NeuroWiki',
    description: 'Free online neurology calculators: NIHSS, ICH Score, ABCD2, GCS, HAS-BLED, RoPE, Heidelberg, Boston Criteria 2.0. Stroke and neurocritical care tools for physicians.',
    keywords: 'neurology calculators, NIHSS calculator, stroke calculator, ICH score, GCS calculator, HAS-BLED calculator, medical calculators for residents',
    image: 'https://neurowiki.ai/og-image.png',
  },

  // ── Calculators ─────────────────────────────────────────────────────────────
  '/calculators/aspects-score': {
    title: 'ASPECTS Score Calculator — Alberta Stroke Program Early CT Score | NeuroWiki',
    description: 'Free ASPECTS calculator for MCA stroke. Score 10 regions (M1–M6, Caudate, Lentiform, Internal Capsule, Insular Ribbon) on non-contrast CT. Color-coded EVT eligibility per AHA/ASA 2026 guidelines.',
    keywords: 'ASPECTS score calculator, Alberta Stroke Program Early CT Score, ASPECTS thrombectomy eligibility, ASPECTS score stroke, MCA territory infarct, large core stroke EVT',
  },

  '/calculators/nihss': {
    title: 'NIHSS Calculator — NIH Stroke Scale Online | NeuroWiki',
    description: 'Free NIHSS calculator for stroke severity assessment. Calculate NIH Stroke Scale score with step-by-step guidance, LVO probability estimate, and clinical interpretation. Used by neurology residents and attendings.',
    keywords: 'NIHSS calculator, NIH stroke scale, stroke severity calculator, stroke assessment tool, LVO probability, neurology calculator online',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/calculators/ich-score': {
    title: 'ICH Score Calculator — Hemorrhage Mortality Prediction | NeuroWiki',
    description: 'Calculate ICH Score for 30-day mortality prediction in intracerebral hemorrhage. Includes GCS, hemorrhage volume, IVH, infratentorial location, and age. Based on Hemphill et al., Stroke 2001.',
    keywords: 'ICH score calculator, intracerebral hemorrhage mortality, ICH prognosis, GCS ICH, hemorrhage volume calculator, stroke calculator',
  },

  '/calculators/abcd2-score': {
    title: 'ABCD² Score Calculator — TIA Stroke Risk | NeuroWiki',
    description: 'Calculate 2-day stroke risk after TIA using the ABCD² score. Free online calculator with clinical interpretation. Age, blood pressure, clinical features, duration, diabetes. AHA/ASA evidence-based.',
    keywords: 'ABCD2 calculator, ABCD2 score TIA, TIA stroke risk, transient ischemic attack risk calculator, 2-day stroke risk after TIA',
  },

  '/calculators/has-bled-score': {
    title: 'HAS-BLED Score — Bleeding Risk on Anticoagulation | NeuroWiki',
    description: 'Estimate major bleeding risk with the HAS-BLED score for patients on anticoagulation. Identifies modifiable risk factors. Note: not a reason to withhold anticoagulation in high-stroke-risk AF.',
    keywords: 'HAS-BLED calculator, HAS-BLED score, bleeding risk anticoagulation, atrial fibrillation bleeding risk, warfarin bleeding risk',
  },

  '/calculators/rope-score': {
    title: 'RoPE Score — PFO-Attributable Stroke Risk | NeuroWiki',
    description: 'Calculate PFO-attributable fraction in cryptogenic stroke using the RoPE Score. Supports shared decision-making for PFO closure. Based on Kent et al.',
    keywords: 'RoPE score calculator, PFO stroke calculator, patent foramen ovale stroke risk, cryptogenic stroke PFO, PFO closure decision',
  },

  '/calculators/glasgow-coma-scale': {
    title: 'Glasgow Coma Scale (GCS) Calculator | NeuroWiki',
    description: 'Standard GCS calculator for consciousness and neurological assessment. Handles intubated patients and not-testable responses. Eye, verbal, and motor scoring with clinical interpretation.',
    keywords: 'Glasgow Coma Scale calculator, GCS calculator, GCS score, consciousness assessment, neurological exam, intubated GCS',
  },

  '/calculators/heidelberg-bleeding-classification': {
    title: 'Heidelberg Bleeding Classification — Hemorrhagic Transformation | NeuroWiki',
    description: 'Classify hemorrhagic transformation after ischemic stroke and reperfusion therapy. Free online calculator per von Kummer et al. Stroke 2015. Guides post-tPA and post-thrombectomy management.',
    keywords: 'Heidelberg bleeding classification, hemorrhagic transformation calculator, HI1 HI2 PH1 PH2, post-thrombolysis hemorrhage, post-tPA bleeding classification, stroke reperfusion hemorrhage',
  },

  '/calculators/boston-criteria-caa': {
    title: 'Boston Criteria 2.0 for CAA — Cerebral Amyloid Angiopathy | NeuroWiki',
    description: 'Diagnose cerebral amyloid angiopathy using Boston Criteria 2.0. MRI-based CAA classification with anticoagulation risk stratification. Charidimou et al., Lancet Neurology 2022.',
    keywords: 'Boston criteria CAA, cerebral amyloid angiopathy diagnosis, Boston criteria 2.0, CAA MRI criteria, CAA anticoagulation risk, lobar hemorrhage',
  },

  // ── Pathways ─────────────────────────────────────────────────────────────
  '/calculators/evt-pathway': {
    title: 'EVT Eligibility Tool — Thrombectomy Decision Support | NeuroWiki',
    description: 'Interactive EVT eligibility pathway for mechanical thrombectomy in acute ischemic stroke. Based on DAWN, DEFUSE-3, SELECT-2, ANGEL-ASPECT, and AHA/ASA 2026 guidelines. Covers LVO, ASPECTS, time windows.',
    keywords: 'EVT eligibility calculator, thrombectomy eligibility criteria, mechanical thrombectomy decision support, DAWN trial criteria, DEFUSE-3 criteria, EVT pathway stroke, ASPECTS score stroke',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/calculators/elan-pathway': {
    title: 'ELAN Anticoagulation Pathway — Post-Stroke DOAC Timing | NeuroWiki',
    description: 'Evidence-based timing of DOAC anticoagulation after acute ischemic stroke with atrial fibrillation. Based on ELAN trial (NEJM 2023) and AHA/ASA 2026 guidelines. Covers stroke size, hemorrhagic transformation, and timing.',
    keywords: 'ELAN anticoagulation pathway, post-stroke anticoagulation timing, DOAC after stroke, atrial fibrillation stroke anticoagulation, ELAN trial, post-stroke DOAC timing calculator',
  },

  '/calculators/se-pathway': {
    title: 'Status Epilepticus Protocol — Interactive Management Pathway | NeuroWiki',
    description: 'Step-by-step interactive status epilepticus management pathway. Covers early SE, established SE, refractory SE, and super-refractory SE. Based on ESETT trial and neurocritical care guidelines.',
    keywords: 'status epilepticus protocol, status epilepticus treatment algorithm, refractory status epilepticus, status epilepticus first line treatment, benzodiazepine status epilepticus, SE management pathway',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/calculators/migraine-pathway': {
    title: 'Acute Migraine Pathway — ED & Inpatient Management | NeuroWiki',
    description: 'Evidence-based acute migraine and headache management pathway for emergency department and inpatient settings. Migraine cocktail, abortive therapy, and refractory headache protocols.',
    keywords: 'acute migraine treatment protocol, migraine cocktail ED, inpatient migraine management, refractory migraine treatment, acute headache pathway, migraine abortive therapy',
  },

  '/calculators/gca-pathway': {
    title: 'GCA Pathway — Giant Cell Arteritis Diagnostic Workup | NeuroWiki',
    description: 'Risk stratification and diagnostic pathway for giant cell arteritis (GCA) and polymyalgia rheumatica (PMR). Covers clinical features, ESR/CRP, temporal artery biopsy, and corticosteroid initiation.',
    keywords: 'giant cell arteritis pathway, GCA diagnostic criteria, temporal arteritis workup, GCA ESR CRP, temporal artery biopsy, polymyalgia rheumatica GCA, GCA corticosteroid treatment',
  },

  '/calculators/em-billing': {
    title: 'E/M Billing Calculator — 2021 CPT Code Selection | NeuroWiki',
    description: 'Select the correct outpatient E/M CPT code (99202–99215) based on 2021 AMA guidelines. Medical decision-making and time-based billing for neurologists and residents.',
    keywords: 'E/M billing calculator, CPT code selection, evaluation and management billing, outpatient E/M codes, 2021 AMA billing, MDM billing, neurology billing calculator',
  },

  // ── Guide Articles ─────────────────────────────────────────────────────────
  '/guide/stroke-basics': {
    title: 'Stroke Code Protocol — Acute Stroke Workflow for Residents | NeuroWiki',
    description: 'Complete acute stroke code protocol: last known well, tPA eligibility, NIHSS, CT/CTA imaging, thrombectomy criteria, GWTG metrics, and admit orders. AHA/ASA 2026 aligned. For neurology residents.',
    keywords: 'stroke code protocol, acute stroke management, stroke workflow residents, door to needle time, tPA eligibility criteria, stroke code steps, acute ischemic stroke protocol, LKW stroke',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/guide/iv-tpa': {
    title: 'IV tPA Protocol — Alteplase & Tenecteplase Eligibility | NeuroWiki',
    description: 'Complete IV thrombolysis protocol for acute ischemic stroke. Alteplase 0.9 mg/kg and tenecteplase 0.25 mg/kg eligibility, dosing, inclusions/exclusions, and monitoring. AHA/ASA 2026 COR 1 for both agents.',
    keywords: 'IV tPA protocol stroke, alteplase stroke dosing, tenecteplase stroke eligibility, tPA eligibility criteria, thrombolysis stroke protocol, IV thrombolysis inclusion exclusion, tPA 0.9 mg kg, tenecteplase 0.25 mg kg',
    image: 'https://neurowiki.ai/og-image.png',
  },

  '/guide/tpa-eligibility': {
    title: 'IV tPA Protocol — Alteplase & Tenecteplase Eligibility | NeuroWiki',
    description: 'Complete IV thrombolysis protocol for acute ischemic stroke. Alteplase 0.9 mg/kg and tenecteplase 0.25 mg/kg eligibility, dosing, inclusions/exclusions, and monitoring. AHA/ASA 2026 COR 1 for both agents.',
    keywords: 'tPA eligibility criteria, IV tPA stroke, alteplase eligibility, tenecteplase stroke, thrombolysis eligibility calculator',
  },

  '/guide/thrombectomy': {
    title: 'Mechanical Thrombectomy Guide — EVT Criteria & Technique | NeuroWiki',
    description: 'Evidence-based guide to mechanical thrombectomy for LVO stroke. EVT eligibility criteria, imaging selection (ASPECTS, perfusion), procedure overview, and post-procedure management. DAWN, DEFUSE-3, AHA/ASA 2026.',
    keywords: 'mechanical thrombectomy guide, EVT stroke criteria, thrombectomy eligibility, LVO stroke treatment, ASPECTS score thrombectomy, thrombectomy time window, stent retriever thrombectomy',
  },

  '/guide/acute-stroke-mgmt': {
    title: 'Acute Stroke Management — Comprehensive Inpatient Protocol | NeuroWiki',
    description: 'Comprehensive acute ischemic stroke management protocol: BP targets, glucose control, dysphagia screening, antiplatelet initiation, DVT prophylaxis, and secondary prevention. AHA/ASA 2026 guidelines.',
    keywords: 'acute stroke management protocol, stroke inpatient management, stroke blood pressure targets, dual antiplatelet stroke, stroke glucose management, dysphagia stroke screening, secondary prevention stroke',
  },

  '/guide/ich-management': {
    title: 'ICH Management — Intracerebral Hemorrhage Protocol | NeuroWiki',
    description: 'Acute ICH management per 2022 AHA/ASA guidelines: rapid BP reduction to <140 mmHg, 4-factor PCC reversal, cerebellar hemorrhage surgery criteria, ICP management, and hematoma expansion prevention.',
    keywords: 'ICH management protocol, intracerebral hemorrhage treatment, ICH blood pressure target, 4-factor PCC reversal, cerebellar hemorrhage surgery, hematoma expansion, ICH guidelines 2022',
  },

  '/guide/status-epilepticus': {
    title: 'Status Epilepticus Management Guide — First Line to Refractory | NeuroWiki',
    description: 'Evidence-based status epilepticus management: lorazepam first-line, levetiracetam/valproate/fosphenytoin second-line, propofol/midazolam/ketamine for refractory SE. ESETT-based. For neurology residents.',
    keywords: 'status epilepticus management, status epilepticus treatment protocol, refractory status epilepticus treatment, lorazepam status epilepticus, ESETT trial, super-refractory status epilepticus, SE benzodiazepine',
  },

  '/guide/meningitis': {
    title: 'Bacterial Meningitis — Workup & Treatment Protocol | NeuroWiki',
    description: 'Evidence-based bacterial meningitis workup and treatment: empiric antibiotics, dexamethasone timing, LP interpretation, CSF analysis, and antibiotic tailoring. For emergency and inpatient neurology.',
    keywords: 'bacterial meningitis treatment, meningitis antibiotic protocol, meningitis LP CSF analysis, dexamethasone meningitis, empiric meningitis antibiotics, meningitis workup residents',
  },

  '/guide/altered-mental-status': {
    title: 'Altered Mental Status Workup — Diagnostic Approach | NeuroWiki',
    description: 'Systematic approach to altered mental status (AMS): differential diagnosis, initial workup, delirium vs. encephalopathy, reversible causes, and empiric treatment. Neurology and emergency medicine.',
    keywords: 'altered mental status workup, AMS differential diagnosis, delirium encephalopathy diagnosis, AMS neurology workup, altered consciousness evaluation, toxic metabolic encephalopathy',
  },

  '/guide/gbs': {
    title: 'Guillain-Barré Syndrome (GBS) — Diagnosis & Treatment | NeuroWiki',
    description: 'GBS clinical guide: Brighton criteria, NCS findings, CSF albumino-cytologic dissociation, IVIG vs. plasmapheresis, respiratory monitoring (NIF, FVC), and prognosis. For neurology residents.',
    keywords: 'Guillain-Barre syndrome treatment, GBS IVIG protocol, GBS plasmapheresis, GBS respiratory monitoring NIF FVC, GBS diagnosis criteria, acute inflammatory demyelinating polyneuropathy',
  },

  '/guide/myasthenia-gravis': {
    title: 'Myasthenia Gravis — Diagnosis, Crisis, & Treatment | NeuroWiki',
    description: 'Myasthenia gravis clinical guide: acetylcholinesterase inhibitor dosing, myasthenic crisis management, IVIG/plasmapheresis, thymectomy indications, and long-term immunosuppression. For neurology residents.',
    keywords: 'myasthenia gravis treatment, myasthenic crisis management, MG pyridostigmine dosing, IVIG myasthenia gravis, myasthenia gravis thymectomy, acetylcholine receptor antibody MG',
  },

  '/guide/multiple-sclerosis': {
    title: 'Multiple Sclerosis — Diagnosis, Relapse & DMT | NeuroWiki',
    description: 'MS clinical guide: McDonald criteria, relapse management with high-dose methylprednisolone, disease-modifying therapy overview, and monitoring. For neurology residents and students.',
    keywords: 'multiple sclerosis treatment protocol, MS relapse treatment, MS disease modifying therapy, McDonald criteria MS, MS diagnosis, MS methylprednisolone protocol, MS DMT overview',
  },

  '/guide/seizure-workup': {
    title: 'Seizure Workup — First Seizure Evaluation & Diagnostic Approach | NeuroWiki',
    description: 'Evidence-based first seizure workup: EEG, MRI brain, LP indications, seizure mimics, AED initiation criteria, and recurrence risk. For emergency and neurology residents.',
    keywords: 'first seizure workup, seizure evaluation, new onset seizure diagnosis, EEG first seizure, seizure vs syncope, seizure MRI protocol, AED initiation first seizure',
  },

  '/guide/headache-workup': {
    title: 'Headache Workup — Differential Diagnosis & Red Flags | NeuroWiki',
    description: 'Systematic headache workup: primary vs. secondary headache differentiation, thunderclap headache evaluation, SNOOP4 red flags, LP for SAH, and imaging criteria. For neurology residents.',
    keywords: 'headache workup, headache differential diagnosis, thunderclap headache evaluation, headache red flags SNOOP, subarachnoid hemorrhage headache, LP after headache CT scan',
  },

  '/guide/vertigo': {
    title: 'Vertigo — BPPV, Central vs Peripheral, & HINTS Exam | NeuroWiki',
    description: 'Vertigo clinical guide: BPPV Epley maneuver, HINTS exam for stroke vs. peripheral cause, Dix-Hallpike, vestibular neuritis vs. cerebellar stroke. For neurology and emergency medicine.',
    keywords: 'vertigo diagnosis, HINTS exam stroke, BPPV Epley maneuver, central vs peripheral vertigo, vestibular neuritis treatment, cerebellar stroke vertigo, Dix-Hallpike maneuver',
  },

  '/guide/weakness-workup': {
    title: 'Weakness Workup — Upper vs Lower Motor Neuron Approach | NeuroWiki',
    description: 'Systematic weakness evaluation: UMN vs. LMN localization, neuromuscular junction, myopathy workup, MRC grading, and diagnostic algorithm. For neurology residents.',
    keywords: 'weakness workup neurology, upper motor neuron lower motor neuron, UMN LMN weakness, neuromuscular junction weakness, myopathy evaluation, weakness localization neurology, MRC grading weakness',
  },

  // ── Trial Pages ────────────────────────────────────────────────────────────
  // Thrombolysis
  '/trials/ninds-trial': {
    title: 'NINDS Trial — tPA for Acute Ischemic Stroke | NeuroWiki',
    description: 'NINDS rt-PA Stroke Study (1995): landmark trial establishing IV alteplase (tPA) within 3 hours of stroke onset. 30% improvement in outcome at 3 months. Foundation of IV thrombolysis.',
    keywords: 'NINDS trial stroke, NINDS tPA trial, alteplase stroke 3 hours, IV thrombolysis landmark trial, rt-PA stroke study 1995',
  },

  '/trials/ecass3-trial': {
    title: 'ECASS-3 Trial — tPA 3–4.5 Hour Extended Window | NeuroWiki',
    description: 'ECASS-3 trial (2008): established IV alteplase efficacy in the 3–4.5 hour window for ischemic stroke. Exclusions: age >80, NIHSS >25, prior stroke + diabetes, anticoagulation.',
    keywords: 'ECASS-3 trial, tPA 3 to 4.5 hours stroke, extended window thrombolysis, alteplase 4.5 hours, ECASS-3 exclusion criteria',
  },

  '/trials/extend-trial': {
    title: 'EXTEND Trial — Perfusion-Guided Late-Window tPA | NeuroWiki',
    description: 'EXTEND trial (2019): IV alteplase in perfusion-selected patients 4.5–9 hours after stroke onset or wake-up stroke. Penumbra-based patient selection with CT perfusion.',
    keywords: 'EXTEND trial stroke, late window tPA, tPA beyond 4.5 hours, perfusion-guided thrombolysis, wake-up stroke tPA, CT perfusion thrombolysis',
  },

  '/trials/eagle-trial': {
    title: 'EAGLE Trial — Tenecteplase vs Alteplase in Stroke | NeuroWiki',
    description: 'EAGLE trial: head-to-head comparison of tenecteplase (TNK) versus alteplase for acute ischemic stroke thrombolysis. Key evidence supporting tenecteplase adoption.',
    keywords: 'EAGLE trial stroke, tenecteplase vs alteplase, TNK vs tPA stroke, EAGLE stroke trial results, tenecteplase stroke thrombolysis',
  },

  '/trials/wake-up-trial': {
    title: 'WAKE-UP Trial — MRI-Guided tPA for Unknown Onset Stroke | NeuroWiki',
    description: 'WAKE-UP trial (2018): MRI DWI-FLAIR mismatch to guide IV alteplase in unknown onset stroke (wake-up stroke). Significantly improved functional outcomes vs. placebo.',
    keywords: 'WAKE-UP trial stroke, unknown onset stroke tPA, wake-up stroke treatment, DWI FLAIR mismatch thrombolysis, MRI guided tPA stroke',
  },

  // Thrombectomy
  '/trials/dawn-trial': {
    title: 'DAWN Trial — Late-Window Thrombectomy (6–24 Hours) | NeuroWiki',
    description: 'DAWN trial (2018): clinical-imaging mismatch selection for EVT 6–24 hours after stroke onset. 49% vs 13% functional independence. Redefined late-window thrombectomy eligibility.',
    keywords: 'DAWN trial stroke, DAWN trial thrombectomy, 6 to 24 hour thrombectomy, late window EVT, clinical-imaging mismatch, DAWN trial eligibility criteria, thrombectomy extended window',
  },

  '/trials/defuse-3-trial': {
    title: 'DEFUSE-3 Trial — Perfusion-Selected Thrombectomy (6–16 Hours) | NeuroWiki',
    description: 'DEFUSE-3 trial (2018): CT/MR perfusion-based patient selection for thrombectomy 6–16 hours after stroke. Ischemic core <70 mL, mismatch ratio ≥1.8. Confirmed late-window EVT benefit.',
    keywords: 'DEFUSE-3 trial, DEFUSE-3 thrombectomy, perfusion imaging thrombectomy, 6 to 16 hour thrombectomy, late window EVT, ischemic core 70 mL, DEFUSE-3 eligibility criteria',
  },

  '/trials/select2-trial': {
    title: 'SELECT-2 Trial — Thrombectomy for Large Infarct Core | NeuroWiki',
    description: 'SELECT-2 trial (2023): EVT vs. medical management for large infarct core (ASPECTS 3–5 or infarct ≥50 mL). Demonstrated benefit of thrombectomy despite large core. AHA/ASA 2026 COR 1.',
    keywords: 'SELECT-2 trial stroke, large core infarct thrombectomy, ASPECTS 3 to 5 EVT, large infarct EVT, SELECT-2 EVT results',
  },

  '/trials/angel-aspect-trial': {
    title: 'ANGEL-ASPECT Trial — EVT for Large Core Stroke | NeuroWiki',
    description: 'ANGEL-ASPECT trial (2023): thrombectomy benefit in large infarct (ASPECTS 3–5) and large core (31–80 mL). Supporting evidence for EVT in large core ischemic stroke alongside SELECT-2.',
    keywords: 'ANGEL-ASPECT trial, large core stroke thrombectomy, ASPECTS 3 4 5 EVT, ANGEL-ASPECT results, thrombectomy large infarct',
  },

  '/trials/distal-trial': {
    title: 'DISTAL Trial — EVT for Distal Medium Vessel Occlusion | NeuroWiki',
    description: 'DISTAL trial: thrombectomy for distal medium vessel occlusions (DMVOs) including M2, M3, ACA, PCA segment strokes. Evidence for expanding EVT eligibility to non-LVO occlusions.',
    keywords: 'DISTAL trial stroke, distal vessel occlusion thrombectomy, M2 occlusion EVT, DMVO stroke treatment, distal medium vessel occlusion',
  },

  '/trials/escape-mevo-trial': {
    title: 'ESCAPE-MEVO Trial — Medium Vessel Occlusion Thrombectomy | NeuroWiki',
    description: 'ESCAPE-MEVO trial: EVT for medium vessel occlusions (M2 segment MCA and other distal vessels). Expanding evidence base for thrombectomy beyond classical LVO definition.',
    keywords: 'ESCAPE-MEVO trial, medium vessel occlusion EVT, M2 occlusion thrombectomy, MEVO stroke trial, distal thrombectomy',
  },

  '/trials/attention-trial': {
    title: 'ATTENTION Trial — EVT for Basilar Artery Occlusion | NeuroWiki',
    description: 'ATTENTION trial (2022): thrombectomy for basilar artery occlusion within 12 hours. Significant functional outcome benefit vs. medical management. Supports EVT for posterior circulation LVO.',
    keywords: 'ATTENTION trial basilar artery, basilar artery occlusion thrombectomy, posterior circulation stroke EVT, ATTENTION trial stroke, basilar artery stroke treatment',
  },

  '/trials/baoche-trial': {
    title: 'BAOCHE Trial — Late-Window Basilar Artery Thrombectomy | NeuroWiki',
    description: 'BAOCHE trial (2022): EVT for basilar artery occlusion in the late window (12–24 hours). Combined with ATTENTION, supports extending EVT to posterior circulation and late windows.',
    keywords: 'BAOCHE trial basilar artery, late window basilar thrombectomy, basilar artery occlusion 24 hours, posterior circulation late EVT, BAOCHE stroke results',
  },

  // Antiplatelet & Secondary Prevention
  '/trials/chance-trial': {
    title: 'CHANCE Trial — Dual Antiplatelet Therapy for Minor Stroke & TIA | NeuroWiki',
    description: 'CHANCE trial (2013): clopidogrel + aspirin vs. aspirin alone in first 21 days after minor stroke or high-risk TIA. 32% relative risk reduction in stroke recurrence. Asian population.',
    keywords: 'CHANCE trial antiplatelet, dual antiplatelet TIA, clopidogrel aspirin minor stroke, CHANCE stroke trial, DAPT after TIA, minor stroke recurrence prevention',
  },

  '/trials/point-trial': {
    title: 'POINT Trial — Dual Antiplatelet Therapy for TIA & Minor Stroke | NeuroWiki',
    description: 'POINT trial (2018): clopidogrel + aspirin vs. aspirin alone within 12 hours of TIA or minor stroke. 25% relative risk reduction in ischemic events at 90 days. Western population replication of CHANCE.',
    keywords: 'POINT trial stroke, dual antiplatelet TIA stroke, clopidogrel aspirin TIA, POINT trial antiplatelet, DAPT TIA minor stroke, antiplatelet stroke prevention',
  },

  '/trials/sammpris-trial': {
    title: 'SAMMPRIS Trial — Stenting vs. Medical Therapy for Intracranial Stenosis | NeuroWiki',
    description: 'SAMMPRIS trial (2011): aggressive medical management superior to Wingspan stenting for symptomatic intracranial atherosclerosis. DAPT + lifestyle modification as standard care.',
    keywords: 'SAMMPRIS trial intracranial stenosis, intracranial stenting vs medical therapy, symptomatic ICAS treatment, Wingspan stent trial, intracranial atherosclerosis DAPT',
  },

  '/trials/weave-trial': {
    title: 'WEAVE Trial — Wingspan Stenting for Intracranial Stenosis | NeuroWiki',
    description: 'WEAVE trial: Wingspan stent safety in highly selected patients with intracranial atherosclerotic disease after SAMMPRIS. Periprocedural complication rate in real-world registry.',
    keywords: 'WEAVE trial Wingspan stent, intracranial stenting safety, Wingspan stent complication, ICAS stenting, WEAVE trial stroke',
  },

  '/trials/socrates-trial': {
    title: 'SOCRATES Trial — Ticagrelor vs Aspirin in Minor Stroke & TIA | NeuroWiki',
    description: 'SOCRATES trial (2016): ticagrelor vs. aspirin monotherapy in first 24 hours after minor stroke or TIA. No significant superiority over aspirin in overall population.',
    keywords: 'SOCRATES trial stroke, ticagrelor vs aspirin TIA, ticagrelor minor stroke, SOCRATES antiplatelet, TIA antiplatelet therapy comparison',
  },

  '/trials/sps3-trial': {
    title: 'SPS3 Trial — Antiplatelet & BP Control for Lacunar Stroke | NeuroWiki',
    description: 'SPS3 trial: aspirin + clopidogrel vs. aspirin alone AND intensive vs. usual BP control for lacunar stroke. Dual antiplatelet showed increased bleeding without benefit; intensive BP lowering beneficial.',
    keywords: 'SPS3 trial lacunar stroke, lacunar stroke antiplatelet, SPS3 blood pressure lacunar, small vessel stroke prevention, lacunar stroke dual antiplatelet',
  },

  '/trials/sparcl-trial': {
    title: 'SPARCL Trial — High-Dose Statin After Stroke | NeuroWiki',
    description: 'SPARCL trial (2006): atorvastatin 80 mg vs. placebo after recent stroke or TIA. 16% relative risk reduction in stroke recurrence. Established high-intensity statin as standard of care post-stroke.',
    keywords: 'SPARCL trial stroke statin, atorvastatin 80mg stroke, high intensity statin after stroke, SPARCL atorvastatin, post-stroke statin therapy, stroke secondary prevention statin',
  },

  '/trials/elan-study': {
    title: 'ELAN Trial — Early vs Late DOAC After Cardioembolic Stroke | NeuroWiki',
    description: 'ELAN trial (NEJM 2023): early (<48h for TIA/minor stroke, <6d for moderate stroke) vs. late (≥7d) DOAC initiation in AF-related ischemic stroke. No significant difference in recurrence or bleeding.',
    keywords: 'ELAN trial anticoagulation, ELAN trial DOAC stroke, early anticoagulation after stroke, DOAC timing atrial fibrillation stroke, ELAN trial results NEJM, post-stroke anticoagulation timing AF',
  },
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
