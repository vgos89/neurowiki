/**
 * Clinical question taxonomy for the /trials Questions view.
 * Six starter questions; icon key maps to QuestionIcon in TrialsPage.
 *
 * Expand to ~24 questions in a future C-clinical-editorial pass
 * (see TASKS.md parking lot 2026-04-28).
 *
 * trialIds: ordered chronologically (oldest publication first).
 * trialCount kept explicit — avoids re-counting at render and serves
 * as a cross-check against the resolved list in QuestionDetailPage.
 *
 * trialIds were verified against TRIAL_DATA keys in trialData.ts on 2026-05-01.
 * Any ID that did not resolve was dropped; see per-question TODO comments.
 */

export type QuestionIconKey =
  | 'clock'
  | 'target'
  | 'pill'
  | 'brain'
  | 'waveform'
  | 'layers';

export interface TrialQuestion {
  id: string;
  text: string;
  icon: QuestionIconKey;
  /** Short contextual phrase shown under the H1 on the detail page. */
  meta: string;
  /** Approximate number of trials that address this question. Matches trialIds.length. */
  trialCount: number;
  /**
   * Ordered list of trial IDs that form the evidence base for this question.
   * Chronological by trial publication year (oldest first).
   * IDs must resolve in TRIAL_DATA / findTrialById — verified on 2026-05-01.
   */
  trialIds: string[];
}

export const TRIAL_QUESTIONS: TrialQuestion[] = [
  {
    id: 'tpa-timing',
    text: 'When can I give tPA?',
    icon: 'clock',
    meta: '0–3 h classic window through imaging-selected extended window',
    trialCount: 14,
    trialIds: [
      'ninds-trial',              // NINDS rt-PA 1995 — 0-3 h alteplase, landmark RCT
      'ecass3-trial',             // ECASS III 2008 — 3-4.5 h alteplase
      'wake-up-trial',            // WAKE-UP 2018 — unknown onset, MRI-guided
      'prisms-trial',             // PRISMS 2018 — minor non-disabling stroke; tPA did not outperform aspirin (severity threshold)
      'extend-trial',             // EXTEND 2019 — perfusion-imaging 4.5-9 h
      'act-trial',                // AcT 2022 — tenecteplase vs alteplase (Canada)
      'nor-test-2-part-a-trial',  // NOR-TEST 2 Part A 2022 — high-dose TNK 0.4 mg/kg harm (dose-escalation boundary)
      'twist-trial',              // TWIST 2022 — TNK in wake-up stroke (imaging-free wake-up window)
      'aramis-trial',             // ARAMIS 2023 — DAPT NI to alteplase in minor non-disabling stroke (reframes "give tPA?" decision)
      'thaws-trial',              // THAWS 2023 — tenecteplase 4.5-24 h without EVT
      'original-trial',           // ORIGINAL 2024 — tenecteplase non-inferiority
      'timeless-trial',           // TIMELESS 2024 — perfusion-selected late-window TNK in LVO with EVT
      'trace-iii-trial',          // TRACE-III 2024 — late-window TNK 4.5-24 h when EVT unavailable
      'raise-trial',              // RAISE 2024 — reteplase superior to alteplase (agent-choice dimension)
    ],
  },
  {
    id: 'lvo-evt',
    text: 'Does my LVO patient need EVT?',
    icon: 'target',
    meta: 'early window, late window, large-core, and MeVO boundary',
    trialCount: 14,
    trialIds: [
      'mr-clean-trial',       // MR CLEAN 2015 — first positive EVT RCT
      'escape-trial',         // ESCAPE 2015 — early window, small-core
      'extend-ia-trial',      // EXTEND-IA 2015 — perfusion-selected early window
      'swift-prime-trial',    // SWIFT PRIME 2015 — early window stent retriever
      'revascat-trial',       // REVASCAT 2015 — early window Catalan
      'thrace-trial',         // THRACE 2016 — French bridging-therapy LVO-EVT
      'defuse-3-trial',       // DEFUSE-3 2018 — late window 6-16 h, perfusion-guided
      'dawn-trial',           // DAWN 2018 — late window to 24 h, clinical-core mismatch
      'laste-trial',          // LASTE 2022 — late window 6.5-24 h general population
      'tension-trial',        // TENSION 2023 — large-core (ASPECTS 3-5), unrestricted
      'select2-trial',        // SELECT2 2023 — large-core, non-contrast CT selected
      'angel-aspect-trial',   // ANGEL-ASPECT 2023 — large-core (China)
      'escape-mevo-trial',    // ESCAPE-MeVO 2024 — extends LVO question into M2/M3, ACA, PCA territory
      'distal-trial',         // DISTAL 2024 — distal occlusion boundary (negative end of EVT)
    ],
  },
  {
    id: 'anticoagulation',
    text: 'Should I anticoagulate this patient?',
    icon: 'pill',
    meta: 'AF timing, ESUS, and recurrence prevention',
    trialCount: 3,
    // trialCount updated from hardcoded 9 → 3 (only 3 AF anticoag timing trials
    // currently in the data layer). Original count of 9 was aspirational.
    // TODO (V review, Class D-clinical): add NAVIGATE-ESUS, ENGAGE AF-TIMI 48,
    // ARISTOTLE, ROCKET-AF, RESPECT, REDUCE, CLOSE, DEFENSE-PFO when those trials
    // are added to the data layer. Raise trialCount to match.
    trialIds: [
      'timing-trial',   // TIMING 2022 — early vs delayed NOAC after AF stroke
      'optimas-trial',  // OPTIMAS 2024 — optimal DOAC timing after AF stroke
      'elan-study',     // ELAN 2023 — early vs later anticoag for AF stroke
    ],
  },
  {
    id: 'hemicraniectomy',
    text: 'Is hemicraniectomy indicated?',
    icon: 'brain',
    meta: 'space-occupying MCA infarction across the age spectrum + adjunct edema therapy',
    trialCount: 5,
    trialIds: [
      'decimal-trial',     // DECIMAL 2007 — decompressive craniectomy ≤55 yo
      'destiny-trial',     // DESTINY 2007 — decompressive craniectomy ≤60 yo
      'hamlet-trial',      // HAMLET 2009 — hemicraniectomy ≤25 h onset
      'destiny-ii-trial',  // DESTINY-II 2014 — hemicraniectomy in patients >60 years (age-ceiling)
      'charm-trial',       // CHARM 2024 — glibenclamide for malignant edema prevention (adjunct, same population)
    ],
  },
  {
    id: 'bp-control',
    text: 'How aggressive should BP control be?',
    icon: 'waveform',
    meta: 'prehospital, IV alteplase coadministration, and post-EVT targets',
    trialCount: 7,
    trialIds: [
      'right-2-trial',     // RIGHT-2 2019 — prehospital GTN in presumed stroke (earliest time-point BP lowering)
      'enchanted-trial',   // ENCHANTED 2019 — intensive BP lowering during IV alteplase
      'bp-target-trial',   // BP-TARGET 2020 — intensive vs standard BP post-EVT
      'mr-asap-trial',     // MR ASAP 2022 — prehospital GTN stopped early after early-harm signal in ICH
      'best-ii-trial',     // BEST-II 2022 — BP targets after successful EVT
      'optimal-bp-trial',  // OPTIMAL-BP 2022 — conventional vs intensive BP after EVT
      'interact4-trial',   // INTERACT4 2023 — prehospital BP reduction before stroke type known
    ],
  },
  {
    id: 'dapt',
    text: 'DAPT after stroke or TIA. Yes or no?',
    icon: 'layers',
    meta: 'dual antiplatelet for TIA and minor ischaemic stroke, with duration and population boundaries',
    trialCount: 8,
    trialIds: [
      'sps3-trial',      // SPS3 2012 — long-term DAPT for lacunar stroke: harm without benefit (duration boundary)
      'chance-trial',    // CHANCE 2013 — clopidogrel + aspirin after TIA/minor stroke (China)
      'socrates-trial',  // SOCRATES 2016 — ticagrelor monotherapy vs aspirin (adjacent "if not DAPT, then what?" question)
      'point-trial',     // POINT 2018 — clopidogrel + aspirin in TIA/minor stroke (US/Canada)
      'thales-trial',    // THALES 2020 — ticagrelor + aspirin after stroke/TIA
      'chance-2-trial',  // CHANCE-2 2021 — ticagrelor vs clopidogrel DAPT in CYP2C19 LOF carriers
      'aramis-trial',    // ARAMIS 2023 — DAPT noninferior to alteplase in minor non-disabling stroke ≤4.5 h
      'inspires-trial',  // INSPIRES 2024 — DAPT for atherosclerotic minor stroke/TIA ≤72 h
    ],
  },
  {
    id: 'basilar-evt',
    text: 'Does my basilar artery occlusion patient benefit from EVT?',
    icon: 'target',
    meta: 'evolution of basilar EVT evidence: BEST/BASICS (neutral) to ATTENTION/BAOCHE (positive)',
    trialCount: 4,
    trialIds: [
      'best-trial',       // BEST 2020 — basilar EVT (negative ITT; substantial crossover)
      'basics-trial',     // BASICS 2021 — basilar EVT (neutral; 80% control received IV alteplase)
      'attention-trial',  // ATTENTION 2022 — basilar EVT 0–12h (positive, China)
      'baoche-trial',     // BAOCHE 2022 — basilar EVT 6–24h (positive, stopped early; mid-trial primary amendment)
    ],
  },
  {
    id: 'ich-surgery',
    text: 'Should this intracerebral hemorrhage be surgically evacuated?',
    icon: 'brain',
    meta: 'four decades of surgical ICH trials: STICH I/II, MISTIE III, ENRICH',
    trialCount: 4,
    trialIds: [
      'stich-i-trial',    // STICH I 2005 — early surgery vs medical for supratentorial ICH (neutral)
      'stich-ii-trial',   // STICH II 2013 — lobar ICH, no IVH (neutral; directional signal in lobar)
      'mistie-iii-trial', // MISTIE III 2019 — minimally invasive catheter + tPA (neutral on functional outcome)
      'enrich-trial',     // ENRICH 2024 — minimally invasive parafascicular surgery, lobar + anterior BG (positive; Bayesian)
    ],
  },
  {
    id: 'msu-dispatch',
    text: 'Does mobile stroke unit dispatch improve outcomes?',
    icon: 'clock',
    meta: 'patient-level functional outcomes from prehospital MSU programs and adjacent prehospital intervention trials',
    trialCount: 4,
    trialIds: [
      'right-2-trial',     // RIGHT-2 2019 — sham-controlled prehospital GTN via ambulance (operational analogue)
      'b-proud-trial',     // B_PROUD 2021 — Berlin, quasi-experimental, ordinal mRS shift cOR 0.71
      'best-msu-trial',    // BEST-MSU 2021 — US, alternating-week cluster, utility-weighted mRS
      'interact4-trial',   // INTERACT4 2023 — prehospital BP lowering (same operational paradigm)
    ],
  },
  {
    id: 'icas-stenting',
    text: 'Does symptomatic intracranial atherosclerosis benefit from stenting?',
    icon: 'target',
    meta: 'Wingspan stent: RCT harm, post-market on-label safety signal',
    trialCount: 2,
    trialIds: [
      'sammpris-trial',  // SAMMPRIS 2011 — PTAS vs aggressive medical (stopped for harm + futility)
      'weave-trial',     // WEAVE 2019 — FDA post-market on-label registry (Archetype G, 2.6% 72h)
      // TODO (V review): add VISSIT (Zaidat 2015 JAMA — Vitesse balloon-expandable, confirmed harm direction)
      // and CASSISS (Gao 2022 JAMA — Chinese RCT, no significant benefit at 1y) when those entries land.
    ],
  },
  {
    id: 'tnk-vs-alteplase',
    text: 'Tenecteplase or alteplase?',
    icon: 'pill',
    meta: 'head-to-head IVT comparisons across geographies, dose, and time-window extensions',
    trialCount: 11,
    trialIds: [
      'nor-test-trial',           // NOR-TEST 2017 — 0.4 mg/kg TNK vs alteplase (mostly mild, positive)
      'act-trial',                // AcT 2022 — TNK 0.25 vs alteplase non-inferiority (Canada)
      'nor-test-2-part-a-trial',  // NOR-TEST 2 Part A 2022 — high-dose TNK 0.4 mg/kg HARM (safety boundary)
      'taste-trial',              // TASTE 2022 — TNK vs alteplase, perfusion-imaging selected
      'twist-trial',              // TWIST 2022 — TNK in wake-up stroke (extends TNK question to wake-up window)
      'attest-2-trial',           // ATTEST-2 2023 — TNK vs alteplase (UK, ordinal-shift primary, neutral)
      'trace-2-trial',            // TRACE-2 2023 — TNK NI vs alteplase (China, larger)
      'original-trial',           // ORIGINAL 2024 — TNK NI vs alteplase (China)
      'timeless-trial',           // TIMELESS 2024 — late-window TNK in LVO with EVT (extends to late window)
      'trace-iii-trial',          // TRACE-III 2024 — late-window TNK 4.5-24 h for ICA/MCA when EVT unavailable
      'raise-trial',              // RAISE 2024 — reteplase superior to alteplase (expands agent-choice dimension)
    ],
  },
  {
    id: 'direct-vs-bridging',
    text: 'Direct thrombectomy or bridging with IV thrombolysis first?',
    icon: 'layers',
    meta: 'EVT-eligible LVO: skip the IVT or bridge? Six RCTs across China, Japan, Europe, and multinational',
    trialCount: 7,
    trialIds: [
      'thrace-trial',          // THRACE 2016 — French comparator predecessor (bridging-therapy framing)
      'direct-mt-trial',       // DIRECT-MT 2020 — China, direct EVT NI vs bridging (NI met)
      'devt-trial',            // DEVT 2020 — China, direct EVT NI vs bridging (NI met)
      'skip-trial',            // SKIP 2020 — Japan, direct EVT vs bridging (NI not met)
      'mr-clean-no-iv-trial',  // MR CLEAN-NO IV 2021 — Europe, NI failed
      'swift-direct-trial',    // SWIFT DIRECT 2022 — Europe, NI failed
      'direct-safe-trial',     // DIRECT-SAFE 2022 — multinational, NI failed
    ],
  },
];
