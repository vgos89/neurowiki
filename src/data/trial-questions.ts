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
    meta: 'space-occupying MCA infarction — HAMLET, DECIMAL, and DESTINY',
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
    text: 'DAPT after stroke or TIA — yes or no?',
    icon: 'layers',
    meta: 'dual antiplatelet for TIA and minor ischaemic stroke',
    trialCount: 4,
    trialIds: [
      'chance-trial',    // CHANCE 2013 — clopidogrel + aspirin after TIA/minor stroke (China)
      'point-trial',     // POINT 2018 — clopidogrel + aspirin in TIA/minor stroke (US/Canada)
      'thales-trial',    // THALES 2020 — ticagrelor + aspirin after stroke/TIA
      'inspires-trial',  // INSPIRES 2024 — DAPT for atherosclerotic minor stroke/TIA ≤72 h
      // NOTE: chance-2-trial (ticagrelor + aspirin for CYP2C19 LOF allele carriers) also
      // in data. Excluded here (specific subgroup). TODO (V review): raise trialCount to 5
      // and add chance-2-trial in a C-clinical-editorial pass.
    ],
  },
];
