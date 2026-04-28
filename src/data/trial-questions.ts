/**
 * Clinical question taxonomy for the /trials Questions view.
 * Six starter questions; icon key maps to QuestionIcon in TrialsPage.
 *
 * Expand to ~24 questions in a future C-clinical-editorial pass
 * (see TASKS.md parking lot 2026-04-28).
 * Trial counts are hardcoded until a question↔trial mapping layer is built.
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
  /** Approximate number of trials that address this question. Hardcoded until mapping layer ships. */
  trialCount: number;
}

export const TRIAL_QUESTIONS: TrialQuestion[] = [
  {
    id: 'tpa-timing',
    text: 'When can I give tPA?',
    icon: 'clock',
    trialCount: 7,
  },
  {
    id: 'lvo-evt',
    text: 'Does my LVO patient need EVT?',
    icon: 'target',
    trialCount: 11,
  },
  {
    id: 'anticoagulation',
    text: 'Should I anticoagulate this patient?',
    icon: 'pill',
    trialCount: 9,
  },
  {
    id: 'hemicraniectomy',
    text: 'Is hemicraniectomy indicated?',
    icon: 'brain',
    trialCount: 3,
  },
  {
    id: 'bp-control',
    text: 'How aggressive should BP control be?',
    icon: 'waveform',
    trialCount: 5,
  },
  {
    id: 'dapt',
    text: 'DAPT after stroke or TIA — yes or no?',
    icon: 'layers',
    trialCount: 4,
  },
];
