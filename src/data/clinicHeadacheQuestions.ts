/**
 * Clinic Headache Pathway — adaptive interview decision tree.
 *
 * Pure data + functions. React-free, JSX-free (architect hard rule).
 *
 * Each QuestionNode asks ONE question. Each Answer translates to a set of
 * ChipIds that get added to the evaluator's selected-set, plus a `leadsTo`
 * pointer to the next node (or a terminator: 'evaluate' / 'workup').
 *
 * The interview is hand-coded for v1 per architect plan-review (option A —
 * deterministic, table-testable, auditable). Entropy-driven question
 * selection is a v2 enhancement that can replace this module without
 * touching the evaluator, components, or page state machine.
 *
 * Source: ICHD-3 (2018) — diagnostic interview structure.
 */

import type { ChipId, PhenotypeId } from './clinicHeadacheData';

export type QuestionId =
  | 'red-flag-screen'
  | 'pattern'
  | 'episodic-duration'
  | 'episodic-character'
  | 'episodic-associated'
  | 'episodic-lifetime-attacks'
  | 'cluster-confirm'
  | 'continuous-laterality'
  | 'continuous-autonomic'
  | 'continuous-indomethacin'
  | 'continuous-pattern-duration'
  | 'continuous-onset';

export type LeadsTo = QuestionId | 'evaluate' | 'workup';

export interface Answer {
  id: string;
  label: string;
  /** Chips added to the evaluator's selected-set when this answer is chosen. */
  selects: ChipId[];
  leadsTo: LeadsTo;
}

export interface QuestionNode {
  id: QuestionId;
  prompt: string;
  /** Optional teach-mode help text rendered under the prompt. */
  helpText?: string;
  /** ICHD-3 section reference for the Teach-mode "Why this question?" expander. */
  ichd3Section?: string;
  /** 'single-choice' renders 2-4 large tap buttons; 'multi-check' renders checkbox-style multi-select. */
  type: 'single-choice' | 'multi-check';
  answers: Answer[];
}

export const START_QUESTION_ID: QuestionId = 'red-flag-screen';

// ─── Decision tree ────────────────────────────────────────────────────────

export const HEADACHE_QUESTIONS: QuestionNode[] = [
  // ─── Q1: red flags ──────────────────────────────────────────────────────
  {
    id: 'red-flag-screen',
    prompt: 'Are any of these red flags present?',
    helpText: 'Any positive red flag prompts secondary-headache workup before assigning a primary-headache phenotype.',
    ichd3Section: 'SNNOOP10 (Do et al. Neurology 2019)',
    type: 'multi-check',
    answers: [
      { id: 'rf-none', label: 'None of the below', selects: [], leadsTo: 'pattern' },
      { id: 'rf-thunderclap', label: 'Thunderclap onset (sudden, peak in seconds)', selects: ['rf-onset-sudden'], leadsTo: 'workup' },
      { id: 'rf-deficit', label: 'New focal neurologic deficit or seizure', selects: ['rf-neuro-deficit'], leadsTo: 'workup' },
      { id: 'rf-systemic', label: 'Fever, weight loss, or systemic illness', selects: ['rf-systemic'], leadsTo: 'workup' },
      { id: 'rf-older', label: 'First-ever headache after age 50', selects: ['rf-older-age-onset'], leadsTo: 'workup' },
      { id: 'rf-pregnancy', label: 'Pregnancy or postpartum', selects: ['rf-pregnancy'], leadsTo: 'workup' },
      { id: 'rf-trauma', label: 'Posttraumatic onset', selects: ['rf-posttraumatic'], leadsTo: 'workup' },
      { id: 'rf-papilloedema', label: 'Papilloedema on exam', selects: ['rf-papilloedema'], leadsTo: 'workup' },
      { id: 'rf-valsalva', label: 'Triggered by cough, sneeze, or exercise', selects: ['rf-valsalva'], leadsTo: 'workup' },
      { id: 'rf-positional', label: 'Worse standing or supine (positional)', selects: ['rf-positional'], leadsTo: 'workup' },
      { id: 'rf-pattern-change', label: 'Recent change in pattern or new headache type', selects: ['rf-pattern-change'], leadsTo: 'workup' },
      { id: 'rf-immune', label: 'Immunosuppression, HIV, or cancer history', selects: ['rf-immune-pathology'], leadsTo: 'workup' },
      { id: 'rf-overuse', label: 'Painkiller use ≥10-15 days/month', selects: ['rf-painkiller-overuse'], leadsTo: 'workup' },
    ],
  },

  // ─── Q2: pattern ────────────────────────────────────────────────────────
  {
    id: 'pattern',
    prompt: 'What is the overall headache pattern?',
    helpText: 'ICHD-3 separates primary headaches first by whether attacks come and go (episodic) or are continuous.',
    type: 'single-choice',
    answers: [
      {
        id: 'episodic',
        label: 'Episodic — pain-free intervals between attacks',
        selects: ['onset-recurrent-same'],
        leadsTo: 'episodic-duration',
      },
      {
        id: 'continuous',
        label: 'Continuous — constant or near-constant pain',
        selects: ['dur-continuous'],
        leadsTo: 'continuous-laterality',
      },
    ],
  },

  // ─── Q3 (episodic): duration ────────────────────────────────────────────
  {
    id: 'episodic-duration',
    prompt: 'How long does a typical attack last?',
    helpText: 'Attack duration is the single strongest discriminator between cluster (15-180 min), migraine (4-72 h), and TTH (30 min to 7 days).',
    type: 'single-choice',
    answers: [
      {
        id: 'lt-15',
        label: 'Less than 15 minutes',
        selects: ['dur-lt-15-min'],
        leadsTo: 'episodic-character',
      },
      {
        id: '15-180',
        label: '15 to 180 minutes',
        selects: ['dur-15-to-180-min'],
        leadsTo: 'cluster-confirm',
      },
      {
        id: '4-72',
        label: '4 to 72 hours (untreated)',
        selects: ['dur-4-to-72-hours'],
        leadsTo: 'episodic-character',
      },
      {
        id: '30min-7d',
        label: '30 minutes to several days',
        selects: ['dur-30min-to-7days'],
        leadsTo: 'episodic-character',
      },
    ],
  },

  // ─── Q3b (episodic): cluster-confirm — short-attack pivot ───────────────
  {
    id: 'cluster-confirm',
    prompt: 'Is the pain severe, unilateral around one eye, with tearing or restlessness?',
    helpText: '15-180 minute attacks with severe unilateral orbital pain plus autonomic features or restlessness is the cluster signature (ICHD-3 §3.1).',
    ichd3Section: 'ICHD-3 §3.1',
    type: 'single-choice',
    answers: [
      {
        id: 'cluster-yes',
        label: 'Yes, severe unilateral orbital with autonomic features or restlessness',
        selects: ['loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'sym-autonomic-ipsilateral', 'sym-restlessness', 'freq-cluster-bout'],
        leadsTo: 'episodic-lifetime-attacks',
      },
      {
        id: 'cluster-no',
        label: 'No, different character',
        selects: [],
        leadsTo: 'episodic-character',
      },
    ],
  },

  // ─── Q4 (episodic, non-cluster): pain character ─────────────────────────
  {
    id: 'episodic-character',
    prompt: 'What is the pain character? (Tap all that apply.)',
    helpText: 'Migraine criterion C (1.1 C) requires ≥2 of: unilateral, pulsating, moderate-severe, aggravated by activity. TTH 2.2 C is the inverse.',
    type: 'multi-check',
    answers: [
      { id: 'unilateral', label: 'Unilateral (one side)', selects: ['loc-unilateral'], leadsTo: 'episodic-character' },
      { id: 'bilateral', label: 'Bilateral (both sides)', selects: ['loc-bilateral'], leadsTo: 'episodic-character' },
      { id: 'pulsating', label: 'Throbbing or pulsating', selects: ['qual-pulsating'], leadsTo: 'episodic-character' },
      { id: 'pressing', label: 'Pressing or tightening', selects: ['qual-pressing-tightening'], leadsTo: 'episodic-character' },
      { id: 'mild', label: 'Mild intensity', selects: ['sev-mild'], leadsTo: 'episodic-character' },
      { id: 'moderate', label: 'Moderate intensity', selects: ['sev-moderate'], leadsTo: 'episodic-character' },
      { id: 'severe', label: 'Severe intensity', selects: ['sev-severe'], leadsTo: 'episodic-character' },
      { id: 'aggravated', label: 'Aggravated by routine activity', selects: ['act-aggravated'], leadsTo: 'episodic-character' },
      { id: 'not-aggravated', label: 'Not aggravated by routine activity', selects: ['act-not-aggravated'], leadsTo: 'episodic-character' },
      // Special "done" answer
      { id: 'character-done', label: 'Continue', selects: [], leadsTo: 'episodic-associated' },
    ],
  },

  // ─── Q5 (episodic): associated symptoms ─────────────────────────────────
  {
    id: 'episodic-associated',
    prompt: 'Which associated symptoms occur during attacks? (Tap all that apply.)',
    helpText: 'Migraine 1.1 D: nausea/vomiting OR (photophobia AND phonophobia). TTH 2.2 D excludes nausea/vomiting and allows at most one of photo/phono.',
    type: 'multi-check',
    answers: [
      { id: 'nausea', label: 'Nausea', selects: ['sym-nausea'], leadsTo: 'episodic-associated' },
      { id: 'vomiting', label: 'Vomiting', selects: ['sym-vomiting'], leadsTo: 'episodic-associated' },
      { id: 'photo', label: 'Sensitive to light during attacks', selects: ['sym-photophobia'], leadsTo: 'episodic-associated' },
      { id: 'phono', label: 'Sensitive to sound during attacks', selects: ['sym-phonophobia'], leadsTo: 'episodic-associated' },
      { id: 'autonomic', label: 'Tearing, droopy eyelid, or other autonomic features on the painful side', selects: ['sym-autonomic-ipsilateral'], leadsTo: 'episodic-associated' },
      { id: 'restlessness', label: 'Restlessness or agitation during attacks', selects: ['sym-restlessness'], leadsTo: 'episodic-associated' },
      { id: 'none-assoc', label: 'None of these', selects: [], leadsTo: 'episodic-lifetime-attacks' },
      { id: 'associated-done', label: 'Continue', selects: [], leadsTo: 'episodic-lifetime-attacks' },
    ],
  },

  // ─── Q6 (episodic): lifetime attacks ────────────────────────────────────
  {
    id: 'episodic-lifetime-attacks',
    prompt: 'How many lifetime attacks have occurred so far?',
    helpText: 'ICHD-3 1.1 Migraine requires ≥5 attacks; 1.2 Migraine with aura ≥2 attacks; 3.1 Cluster ≥5 attacks. <5 attacks lands in Probable territory (1.5 / 3.5).',
    type: 'single-choice',
    answers: [
      { id: 'lt-5', label: 'Fewer than 5', selects: ['attacks-lt-5'], leadsTo: 'evaluate' },
      { id: '5-10', label: '5 to 10', selects: ['attacks-5-to-10'], leadsTo: 'evaluate' },
      { id: 'gt-10', label: 'More than 10', selects: ['attacks-gt-10'], leadsTo: 'evaluate' },
    ],
  },

  // ─── Q3' (continuous): laterality ───────────────────────────────────────
  {
    id: 'continuous-laterality',
    prompt: 'Is the continuous pain strictly one-sided or both sides?',
    helpText: 'Strictly unilateral continuous pain raises hemicrania continua (ICHD-3 §3.4). Bilateral pattern points to chronic TTH or NDPH.',
    type: 'single-choice',
    answers: [
      {
        id: 'unilateral',
        label: 'Strictly one-sided',
        selects: ['loc-unilateral'],
        leadsTo: 'continuous-autonomic',
      },
      {
        id: 'bilateral',
        label: 'Both sides',
        selects: ['loc-bilateral'],
        leadsTo: 'continuous-pattern-duration',
      },
    ],
  },

  // ─── Q4' (continuous unilateral): autonomic features ────────────────────
  {
    id: 'continuous-autonomic',
    prompt: 'Are there ipsilateral autonomic features (tearing, conjunctival injection, ptosis) during exacerbations?',
    helpText: 'Hemicrania continua (3.4 C) requires ipsilateral autonomic features and/or restlessness or movement aggravation.',
    ichd3Section: 'ICHD-3 §3.4',
    type: 'single-choice',
    answers: [
      {
        id: 'autonomic-yes',
        label: 'Yes',
        selects: ['sym-autonomic-ipsilateral', 'pattern-ge-3-months', 'sev-moderate'],
        leadsTo: 'continuous-indomethacin',
      },
      {
        id: 'autonomic-no',
        label: 'No',
        selects: ['pattern-ge-3-months'],
        leadsTo: 'continuous-pattern-duration',
      },
    ],
  },

  // ─── Q5' (continuous unilateral autonomic): indomethacin gate ───────────
  {
    id: 'continuous-indomethacin',
    prompt: 'Has indomethacin been tried? If so, what was the response?',
    helpText: 'Hemicrania continua diagnosis (3.4 D) requires ABSOLUTE response to therapeutic-dose indomethacin. Without trial or response, only a tentative hemicrania-continua suspicion can be raised.',
    ichd3Section: 'ICHD-3 §3.4 D',
    type: 'single-choice',
    answers: [
      {
        id: 'indo-complete',
        label: 'Complete response to therapeutic dose',
        selects: ['indo-tried-complete'],
        leadsTo: 'evaluate',
      },
      {
        id: 'indo-partial',
        label: 'Partial response',
        selects: ['indo-tried-partial'],
        leadsTo: 'evaluate',
      },
      {
        id: 'indo-none',
        label: 'No response',
        selects: ['indo-tried-no-response'],
        leadsTo: 'evaluate',
      },
      {
        id: 'indo-not-tried',
        label: 'Not tried yet',
        selects: ['indo-not-tried'],
        leadsTo: 'evaluate',
      },
    ],
  },

  // ─── Q4'' (continuous): pattern duration ────────────────────────────────
  {
    id: 'continuous-pattern-duration',
    prompt: 'How long has the headache been present?',
    helpText: 'Chronic TTH (2.3) and hemicrania continua (3.4) require ≥3 months. NDPH (3.3) requires distinct onset >3 months ago.',
    type: 'single-choice',
    answers: [
      {
        id: 'pd-lt-3',
        label: 'Less than 3 months',
        selects: ['pattern-lt-3-months'],
        leadsTo: 'continuous-onset',
      },
      {
        id: 'pd-ge-3',
        label: '3 months or longer',
        selects: ['pattern-ge-3-months', 'freq-ge-15-per-month'],
        leadsTo: 'continuous-onset',
      },
    ],
  },

  // ─── Q5'' (continuous): onset character ─────────────────────────────────
  {
    id: 'continuous-onset',
    prompt: 'Does the patient remember a distinct moment when the headache started and never resolved since?',
    helpText: 'NDPH (ICHD-3 3.3 B) requires a distinct, clearly-remembered onset becoming continuous within 24 hours.',
    ichd3Section: 'ICHD-3 §3.3',
    type: 'single-choice',
    answers: [
      {
        id: 'sudden-distinct',
        label: 'Yes, distinct onset within 24 hours',
        selects: ['onset-new-within-3-months'],
        leadsTo: 'evaluate',
      },
      {
        id: 'gradual',
        label: 'No, gradual or unclear onset',
        selects: [],
        leadsTo: 'evaluate',
      },
    ],
  },
];

// ─── Lookup + helpers ─────────────────────────────────────────────────────

export function getQuestion(id: QuestionId): QuestionNode | undefined {
  return HEADACHE_QUESTIONS.find(q => q.id === id);
}

export function getAnswer(questionId: QuestionId, answerId: string): Answer | undefined {
  return getQuestion(questionId)?.answers.find(a => a.id === answerId);
}

/**
 * Translate an answer selection into the chips it contributes.
 * For multi-check questions, the page calls this multiple times.
 */
export function chipsForAnswer(questionId: QuestionId, answerId: string): ChipId[] {
  return getAnswer(questionId, answerId)?.selects ?? [];
}

/**
 * Next-node helper. Used by the page state machine after the user
 * commits an answer.
 */
export function nextNode(questionId: QuestionId, answerId: string): LeadsTo | null {
  return getAnswer(questionId, answerId)?.leadsTo ?? null;
}

// ─── Phenotype list for power-user exit ───────────────────────────────────

/**
 * Phenotypes a power-user can pick directly from the "I already know the
 * diagnosis" sheet. Order is approximate prevalence in outpatient practice.
 */
export const POWER_USER_PHENOTYPES: { id: PhenotypeId; label: string; section: string }[] = [
  { id: 'migraine-without-aura', label: 'Migraine without aura', section: 'ICHD-3 §1.1' },
  { id: 'migraine-with-aura', label: 'Migraine with aura', section: 'ICHD-3 §1.2' },
  { id: 'episodic-tth', label: 'Episodic tension-type headache', section: 'ICHD-3 §2.2' },
  { id: 'chronic-tth', label: 'Chronic tension-type headache', section: 'ICHD-3 §2.3' },
  { id: 'cluster-headache', label: 'Cluster headache', section: 'ICHD-3 §3.1' },
  { id: 'hemicrania-continua', label: 'Hemicrania continua', section: 'ICHD-3 §3.4' },
  { id: 'ndph', label: 'New daily persistent headache', section: 'ICHD-3 §3.3' },
];
