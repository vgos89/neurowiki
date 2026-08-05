export interface LegacyTrialCatalogMeta {
  name: string;
  year: number;
  doi: string;
  description: string;
  clinicalContext: string;
}

export const LEGACY_TRIAL_CATALOG_META: Record<string, LegacyTrialCatalogMeta> = {
  'ninds-trial': {
    name: 'NINDS',
    year: 1995,
    doi: '10.1056/NEJM199512143332401',
    description: 'Foundational IV alteplase trial establishing benefit within 3 hours of ischemic stroke onset.',
    clinicalContext: 'Foundational IV alteplase trial establishing benefit within 3 hours of ischemic stroke onset.',
  },
  'original-trial': {
    name: 'ORIGINAL',
    year: 2024,
    doi: '10.1001/jama.2024.14721',
    description: 'Large noninferiority trial showing tenecteplase 0.25 mg/kg performed similarly to alteplase within 4.5 hours.',
    clinicalContext: 'Large noninferiority trial showing tenecteplase 0.25 mg/kg performed similarly to alteplase within 4.5 hours.',
  },
  'ecass3-trial': {
    name: 'ECASS III',
    year: 2008,
    doi: '10.1056/NEJMoa0804656',
    description: 'Extended the alteplase treatment window to 4.5 hours in selected ischemic stroke patients.',
    clinicalContext: 'Extended the alteplase treatment window to 4.5 hours in selected ischemic stroke patients.',
  },
  'extend-trial': {
    name: 'EXTEND',
    year: 2019,
    doi: '10.1056/NEJMoa1813046',
    description: 'Perfusion-selected late-window alteplase trial supporting tissue-based rather than strictly time-based thrombolysis.',
    clinicalContext: 'Perfusion-selected late-window alteplase trial supporting tissue-based rather than strictly time-based thrombolysis.',
  },
  'eagle-trial': {
    name: 'EAGLE',
    year: 2010,
    doi: '10.1016/j.ophtha.2010.03.061',
    description: 'Negative intra-arterial fibrinolysis trial for central retinal artery occlusion with higher adverse events.',
    clinicalContext: 'Negative intra-arterial fibrinolysis trial for central retinal artery occlusion with higher adverse events.',
  },
  'wake-up-trial': {
    name: 'WAKE-UP',
    year: 2018,
    doi: '10.1056/NEJMoa1804355',
    description: 'MRI DWI-FLAIR mismatch trial supporting alteplase for wake-up and unknown-onset stroke.',
    clinicalContext: 'MRI DWI-FLAIR mismatch trial supporting alteplase for wake-up and unknown-onset stroke.',
  },
  'defuse-3-trial': {
    name: 'DEFUSE-3',
    year: 2018,
    doi: '10.1056/NEJMoa1713973',
    description: 'Late-window thrombectomy trial using perfusion imaging to identify salvageable tissue up to 16 hours.',
    clinicalContext: 'Late-window thrombectomy trial using perfusion imaging to identify salvageable tissue up to 16 hours.',
  },
  'dawn-trial': {
    name: 'DAWN',
    year: 2018,
    doi: '10.1056/NEJMoa1706442',
    description: 'Clinical-imaging mismatch trial that redefined thrombectomy eligibility out to 24 hours.',
    clinicalContext: 'Clinical-imaging mismatch trial that redefined thrombectomy eligibility out to 24 hours.',
  },
  'select2-trial': {
    name: 'SELECT-2',
    year: 2023,
    doi: '10.1056/NEJMoa2214403',
    description: 'Large-core stroke trial showing thrombectomy still benefits selected patients with substantial infarct burden.',
    clinicalContext: 'Large-core stroke trial showing thrombectomy still benefits selected patients with substantial infarct burden.',
  },
  'angel-aspect-trial': {
    name: 'ANGEL-ASPECT',
    year: 2023,
    doi: '10.1056/NEJMoa2213379',
    description: 'Large-core thrombectomy trial supporting EVT in patients previously considered poor candidates.',
    clinicalContext: 'Large-core thrombectomy trial supporting EVT in patients previously considered poor candidates.',
  },
  'attention-trial': {
    name: 'ATTENTION',
    year: 2022,
    doi: '10.1056/NEJMoa2206317',
    description: 'Basilar artery occlusion thrombectomy trial showing clear functional benefit within 12 hours.',
    clinicalContext: 'Basilar artery occlusion thrombectomy trial showing clear functional benefit within 12 hours.',
  },
  'baoche-trial': {
    name: 'BAOCHE',
    year: 2022,
    doi: '10.1056/NEJMoa2207576',
    description: 'Late-window basilar thrombectomy trial extending posterior-circulation EVT evidence to 24 hours.',
    clinicalContext: 'Late-window basilar thrombectomy trial extending posterior-circulation EVT evidence to 24 hours.',
  },
  'chance-trial': {
    name: 'CHANCE',
    year: 2013,
    doi: '10.1056/NEJMoa1215340',
    description: 'Established short-course clopidogrel plus aspirin after minor stroke or high-risk TIA in a Chinese population.',
    clinicalContext: 'Established short-course clopidogrel plus aspirin after minor stroke or high-risk TIA in a Chinese population.',
  },
  'point-trial': {
    name: 'POINT',
    year: 2018,
    doi: '10.1056/NEJMoa1800410',
    description: 'Western DAPT replication trial showing reduced ischemic events but increased major bleeding.',
    clinicalContext: 'Western DAPT replication trial showing reduced ischemic events but increased major bleeding.',
  },
  // PFO closure for MIGRAINE (2008-2017). Distinct indication from the
  // PFO-for-stroke trials: all three missed their primary endpoint, and both
  // SCAI 2022 and VA/DoD 2023 recommend against the procedure for migraine.
  // PFO ANTITHROMBOTIC CHOICE (2002-2021). Anticoagulation vs antiplatelet when
  // a PFO is not closed. Not one of these is an adequately powered trial of that
  // question: PICSS is a subgroup of a substudy, and both ESUS trials carry PFO
  // as a subgroup. Every within-trial interaction test is null.
  'picss-trial': {
    name: 'PICSS',
    year: 2002,
    doi: '10.1161/01.CIR.0000017498.88393.44',
    description: 'Warfarin versus aspirin in the PFO substudy of WARSS; in cryptogenic stroke with PFO, 4 of 42 versus 10 of 56 (HR 0.52, 95% CI 0.16 to 1.67).',
    clinicalContext: 'A non-prespecified subgroup of a substudy, 98 patients and 14 events, using low-intensity warfarin (INR 1.4 to 2.8) rather than modern anticoagulation. Its own headline finding was that having a PFO did not raise recurrence risk on medical therapy.',
  },
  'navigate-esus-trial': {
    name: 'NAVIGATE-ESUS',
    year: 2018,
    doi: '10.1016/S1474-4422(18)30319-3',
    description: 'Rivaroxaban 15 mg versus aspirin in embolic stroke of undetermined source; the prespecified PFO subgroup gave HR 0.54 (95% CI 0.22 to 1.36).',
    clinicalContext: 'Stopped early for futility plus excess bleeding, leaving the PFO analysis at 45% power. PFO was detected in only 7.4% against the 33.8% PICSS detected in a cohort that did undergo transesophageal echocardiography, because neither ESUS trial mandated an echo bubble study.',
  },
  'respect-esus-trial': {
    name: 'RE-SPECT ESUS',
    year: 2021,
    doi: '10.1161/STROKEAHA.120.031237',
    description: 'Dabigatran versus aspirin in embolic stroke of undetermined source; the PFO interaction was null (p=0.8290).',
    clinicalContext: 'Adding this trial to the 2018 pooled analysis moved the estimate from OR 0.48 to OR 0.70 and it stopped being significant. Its own conclusion: insufficient evidence to recommend anticoagulation over antiplatelet therapy.',
  },
  'mist-trial': {
    name: 'MIST',
    year: 2008,
    doi: '10.1161/CIRCULATIONAHA.107.727271',
    description: 'Sham-controlled STARFlex closure for migraine with aura; migraine cessation occurred in 3 of 74 versus 3 of 73 (P=0.51).',
    clinicalContext: 'First sham-controlled PFO-closure migraine trial, and negative. Its one positive signal came from an exploratory analysis that excluded 2 outliers; a Correction was published and two members of the trial steering committee declined authorship over that exclusion.',
  },
  'prima-trial': {
    name: 'PRIMA',
    year: 2016,
    doi: '10.1093/eurheartj/ehw027',
    description: 'Unblinded Amplatzer closure versus medical therapy for migraine with aura; monthly migraine days fell 2.9 versus 1.7 (P=0.17).',
    clinicalContext: 'Primary endpoint not met. Aura-specific secondary measures did separate, but the trial was unblinded with no sham arm, was stopped early for slow enrolment, and reached adjudicated closure in only 35 of 53 randomized to the device.',
  },
  'premium-trial': {
    name: 'PREMIUM',
    year: 2017,
    doi: '10.1016/j.jacc.2017.09.1105',
    description: 'Sham-controlled Amplatzer closure for refractory migraine; responder rate 38.5% versus 32.0% (P=0.32).',
    clinicalContext: 'The largest and best-blinded of the three trials, and the one that most cleanly missed its efficacy endpoint. Its co-primary safety endpoint was met: the procedure was safe in this population, it simply did not prevent migraine.',
  },
  'sammpris-trial': {
    name: 'SAMMPRIS',
    year: 2011,
    doi: '10.1056/NEJMoa1105335',
    description: 'Showed aggressive medical therapy outperformed Wingspan stenting for symptomatic intracranial stenosis.',
    clinicalContext: 'Showed aggressive medical therapy outperformed Wingspan stenting for symptomatic intracranial stenosis.',
  },
  'weave-trial': {
    name: 'WEAVE',
    year: 2019,
    doi: '10.1161/STROKEAHA.118.023996',
    description: 'Registry-based Wingspan safety study in highly selected intracranial stenosis patients after SAMMPRIS.',
    clinicalContext: 'Registry-based Wingspan safety study in highly selected intracranial stenosis patients after SAMMPRIS.',
  },
  'woven-trial': {
    name: 'WOVEN',
    year: 2021,
    doi: '10.1136/neurintsurg-2020-016208',
    description: 'One-year follow-up of the WEAVE on-label Wingspan cohort: single-arm stroke or death rate 8.5% at 1 year, no efficacy comparison.',
    clinicalContext: 'One-year follow-up of the WEAVE on-label Wingspan cohort: single-arm stroke or death rate 8.5% at 1 year, no efficacy comparison.',
  },
  'cassiss-trial': {
    name: 'CASSISS',
    year: 2022,
    doi: '10.1001/jama.2022.12000',
    description: 'Chinese randomized trial in which adding intracranial stenting to aggressive medical therapy gave no benefit at one year.',
    clinicalContext: 'Chinese randomized trial in which adding intracranial stenting to aggressive medical therapy gave no benefit at one year.',
  },
  'basis-trial': {
    name: 'BASIS',
    year: 2024,
    doi: '10.1001/jama.2024.12829',
    description: 'First positive endovascular ICAS trial: submaximal balloon angioplasty lowered the 12-month composite versus medical therapy at expert Chinese centers.',
    clinicalContext: 'First positive endovascular ICAS trial: submaximal balloon angioplasty lowered the 12-month composite versus medical therapy at expert Chinese centers.',
  },
  'socrates-trial': {
    name: 'SOCRATES',
    year: 2016,
    doi: '10.1056/NEJMoa1603060',
    description: 'Compared ticagrelor with aspirin after minor stroke or TIA and did not show overall superiority.',
    clinicalContext: 'Compared ticagrelor with aspirin after minor stroke or TIA and did not show overall superiority.',
  },
  'sps3-trial': {
    name: 'SPS3',
    year: 2012,
    doi: '10.1056/NEJMoa1204133',
    description: 'Lacunar stroke trial showing more bleeding without benefit from long-term dual antiplatelet therapy.',
    clinicalContext: 'Lacunar stroke trial showing more bleeding without benefit from long-term dual antiplatelet therapy.',
  },
  'sparcl-trial': {
    name: 'SPARCL',
    year: 2006,
    doi: '10.1056/NEJMoa061894',
    description: 'Established high-intensity atorvastatin as standard secondary prevention after stroke or TIA.',
    clinicalContext: 'Established high-intensity atorvastatin as standard secondary prevention after stroke or TIA.',
  },
  'elan-study': {
    name: 'ELAN',
    year: 2023,
    doi: '10.1056/NEJMoa2303048',
    description: 'Early versus later DOAC initiation trial after AF-related ischemic stroke showing low bleeding risk with early treatment.',
    clinicalContext: 'Early versus later DOAC initiation trial after AF-related ischemic stroke showing low bleeding risk with early treatment.',
  },
  'thales-trial': {
    name: 'THALES',
    year: 2020,
    doi: '10.1056/NEJMoa1916870',
    description: 'Ticagrelor plus aspirin trial after minor stroke or TIA with modest efficacy and substantially more bleeding.',
    clinicalContext: 'Ticagrelor plus aspirin trial after minor stroke or TIA with modest efficacy and substantially more bleeding.',
  },
  'inspires-trial': {
    name: 'INSPIRES',
    year: 2024,
    doi: '10.1056/NEJMoa2309137',
    description: 'Atherosclerotic minor stroke and TIA trial extending the DAPT initiation window out to 72 hours.',
    clinicalContext: 'Atherosclerotic minor stroke and TIA trial extending the DAPT initiation window out to 72 hours.',
  },
  'chance-2-trial': {
    name: 'CHANCE-2',
    year: 2021,
    doi: '10.1056/NEJMoa2111749',
    description: 'Pharmacogenomic DAPT trial favoring ticagrelor over clopidogrel in CYP2C19 loss-of-function carriers.',
    clinicalContext: 'Pharmacogenomic DAPT trial favoring ticagrelor over clopidogrel in CYP2C19 loss-of-function carriers.',
  },
  'enrich-trial': {
    name: 'ENRICH',
    year: 2024,
    doi: '10.1056/NEJMoa2308440',
    description: 'Positive minimally invasive surgery trial for selected lobar ICH; the anterior basal ganglia stratum was stopped for futility.',
    clinicalContext: 'Positive minimally invasive surgery trial for selected lobar ICH; the anterior basal ganglia stratum was stopped for futility.',
  },
};
