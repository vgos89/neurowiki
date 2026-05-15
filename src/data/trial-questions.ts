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
    trialCount: 7,
    trialIds: [
      'ninds-trial',        // NINDS rt-PA 1995 — 0-3 h alteplase, landmark RCT
      'ecass3-trial',       // ECASS III 2008 — 3-4.5 h alteplase
      'wake-up-trial',      // WAKE-UP 2018 — unknown onset, MRI-guided
      'extend-trial',       // EXTEND 2019 — perfusion-imaging 4.5-9 h
      'thaws-trial',        // THAWS 2023 — tenecteplase 4.5-24 h without EVT
      'original-trial',     // ORIGINAL 2024 — tenecteplase non-inferiority
      'act-trial',          // ACT 2022 — tenecteplase vs alteplase (Canada)
      // TODO (V review): consider adding nor-test-trial, attest-2-trial (tenecteplase
      // alternatives) and trace-iii-trial (low-dose alteplase, unknown onset, China)
      // if trialCount is raised to 10. eagle-trial EXCLUDED — CRAO, not ischaemic stroke.
    ],
  },
  {
    id: 'lvo-evt',
    text: 'Does my LVO patient need EVT?',
    icon: 'target',
    meta: 'early window, late window, large-core, and direct-MT',
    trialCount: 11,
    trialIds: [
      'mr-clean-trial',       // MR CLEAN 2015 — first positive EVT RCT
      'escape-trial',         // ESCAPE 2015 — early window, small-core
      'extend-ia-trial',      // EXTEND-IA 2015 — perfusion-selected early window
      'swift-prime-trial',    // SWIFT PRIME 2015 — early window stent retriever
      'revascat-trial',       // REVASCAT 2015 — early window Catalan
      'defuse-3-trial',       // DEFUSE-3 2018 — late window 6-16 h, perfusion-guided
      'dawn-trial',           // DAWN 2018 — late window to 24 h, clinical-core mismatch
      'laste-trial',          // LASTE 2022 — late window 6.5-24 h general population
      'tension-trial',        // TENSION 2023 — large-core (ASPECTS 3-5), unrestricted
      'select2-trial',        // SELECT2 2023 — large-core, non-contrast CT selected
      'angel-aspect-trial',   // ANGEL-ASPECT 2023 — large-core (China)
      // NOTE: task spec suggested 'mr-clean-late-trial' — does not exist in data;
      // laste-trial covers late-window EVT evidence.
      // TODO (V review): thrace-trial (bridging vs direct EVT) and escape-mevo-trial
      // (medium vessel occlusion) may warrant a separate EVT-strategy question.
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
    meta: 'space-occupying MCA infarction. HAMLET, DECIMAL, and DESTINY.',
    trialCount: 3,
    trialIds: [
      'decimal-trial',  // DECIMAL 2007 — decompressive craniectomy ≤55 yo
      'destiny-trial',  // DESTINY 2007 — decompressive craniectomy ≤60 yo
      'hamlet-trial',   // HAMLET 2009 — hemicraniectomy ≤25 h onset
      // NOTE: destiny-ii-trial (>60 yo) also in data. trialCount kept at 3 (the
      // three pooled-analysis RCTs). TODO (V review): add destiny-ii-trial and
      // update trialCount to 4 in a C-clinical-editorial pass.
    ],
  },
  {
    id: 'bp-control',
    text: 'How aggressive should BP control be?',
    icon: 'waveform',
    meta: 'acute BP lowering in ischaemic stroke and post-EVT',
    trialCount: 5,
    trialIds: [
      'enchanted-trial',   // ENCHANTED 2019 — intensive BP lowering during IV alteplase
      'best-ii-trial',     // BEST-II 2022 — BP targets after successful EVT
      'bp-target-trial',   // BP-TARGET 2020 — intensive vs standard BP post-EVT
      'optimal-bp-trial',  // OPTIMAL-BP 2022 — conventional vs intensive BP after EVT
      'interact4-trial',   // INTERACT4 2023 — prehospital BP reduction before stroke type known
    ],
  },
  {
    id: 'dapt',
    text: 'DAPT after stroke or TIA. Yes or no?',
    icon: 'layers',
    meta: 'dual antiplatelet for TIA and minor ischaemic stroke',
    trialCount: 5,
    trialIds: [
      'chance-trial',    // CHANCE 2013 — clopidogrel + aspirin after TIA/minor stroke (China)
      'point-trial',     // POINT 2018 — clopidogrel + aspirin in TIA/minor stroke (US/Canada)
      'thales-trial',    // THALES 2020 — ticagrelor + aspirin after stroke/TIA
      'chance-2-trial',  // CHANCE-2 2021 — ticagrelor vs clopidogrel DAPT in CYP2C19 LOF carriers
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
    meta: 'patient-level functional outcomes from prehospital MSU programs',
    trialCount: 2,
    trialIds: [
      'b-proud-trial',   // B_PROUD 2021 — Berlin, quasi-experimental, ordinal mRS shift cOR 0.71
      'best-msu-trial',  // BEST-MSU 2021 — US, alternating-week cluster, utility-weighted mRS
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
    meta: 'head-to-head IVT comparisons in the 0–4.5h window across geographies',
    trialCount: 6,
    trialIds: [
      'nor-test-trial',          // NOR-TEST 2017 — 0.4 mg/kg TNK vs alteplase (mostly mild, positive)
      'act-trial',               // AcT 2022 — TNK 0.25 vs alteplase non-inferiority (Canada)
      'taste-trial',             // TASTE 2022 — TNK vs alteplase, perfusion-imaging selected
      'attest-2-trial',          // ATTEST-2 2023 — TNK vs alteplase (UK, ordinal-shift primary, neutral)
      'original-trial',          // ORIGINAL 2024 — TNK NI vs alteplase (China)
      'trace-2-trial',           // TRACE-2 2023 — TNK NI vs alteplase (China, larger)
      // NOTE: nor-test-2-part-a (high-dose 0.4 mg/kg, stopped for safety) and trace-iii-trial
      // (unknown onset, low-dose alteplase) are TNK-related but address different questions.
    ],
  },
  {
    id: 'direct-vs-bridging',
    text: 'Direct thrombectomy or bridging with IV thrombolysis first?',
    icon: 'layers',
    meta: 'EVT-eligible LVO: skip the IVT or bridge?',
    trialCount: 4,
    trialIds: [
      'direct-mt-trial',       // DIRECT-MT 2020 — China, direct EVT NI vs bridging (NI met)
      'mr-clean-no-iv-trial',  // MR CLEAN-NO IV 2021 — Europe, NI failed
      'swift-direct-trial',    // SWIFT DIRECT 2022 — Europe, NI failed
      'direct-safe-trial',     // DIRECT-SAFE 2022 — multinational, NI failed
      // skip-trial (Japan) is also direct-MT-related; consider for inclusion in a future pass.
    ],
  },
];
