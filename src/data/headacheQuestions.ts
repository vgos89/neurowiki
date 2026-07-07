/**
 * headacheQuestions — the v4 "live differential narrowing" question flow config.
 *
 * Declarative, engine-anchored. Each answer option maps to the exact ChipId(s)
 * it contributes to the engine's `selected` set; the engine re-evaluates after
 * every answer and the live differential re-ranks (bandPhenotypes). Six core
 * screens form the spine; conditional branches fire only when their substrate
 * trigger appears, so the dangerous-to-miss phenotypes (cluster, the
 * indomethacin-responsive TACs, SUNCT, aura, vestibular, chronic migraine) can
 * climb out of "Less likely" when warranted.
 *
 * Spec: docs/reviews/medsci-headache-v4-clinical-spec.md §2.
 * Clinical gate: docs/reviews/clinical-headache-v4-spec.md — conditions:
 *   Q1 attack-count folded into the spine (migraine/cluster/TTH can reach full);
 *   Q2 every branch fires on its substrate features (tested);
 *   Q3 aura-branch reachability resolved (fires on migraine-suggestive features —
 *      the "migraine in contention" gate, documented per the gate's option b);
 *   Q4 [PAIR] many-to-one chip contributions preserved (orbital → unilateral +
 *      orbital-temporal), enforced by the drift guard test.
 * The SNNOOP10 red-flag short-circuit (Frame 1 / `anyRedFlagActive`) runs before
 * any of these and is owned by the page state machine, not this config.
 */
import type { ChipId } from './clinicHeadacheData';

export interface AnswerOption {
  /** Stable id for the answer (UI keys, analytics). */
  id: string;
  /** Displayed answer text (em-dash-free per humanizer). */
  label: string;
  /** Engine chips this answer contributes. MANY-TO-ONE preserved where the
   *  engine's criteria require a chip pair (the [PAIR] cases). */
  chips: ChipId[];
}

export interface HeadacheQuestion {
  id: string;
  /** 1-based screen group, for the progress dots. Several fields can share a screen. */
  screen: number;
  /** "Question N · Topic" eyebrow. */
  eyebrow: string;
  /** The question text. */
  prompt: string;
  select: 'single' | 'multi';
  options: AnswerOption[];
  /** Optional faint teach-mode pearl. */
  teach?: string;
}

export interface ConditionalBranch {
  id: string;
  /** Fires (surfaces the branch question) when its substrate features are selected. */
  fires: (selected: ReadonlySet<ChipId>) => boolean;
  question: HeadacheQuestion;
}

// ─── Core spine (6 screens) ───────────────────────────────────────────────────

export const CORE_QUESTIONS: HeadacheQuestion[] = [
  // Screen 1 — pattern over time
  {
    id: 'q-onset',
    screen: 1,
    eyebrow: 'Pattern',
    prompt: 'How does the headache behave over time?',
    select: 'single',
    options: [
      { id: 'recurrent', label: 'Separate attacks, the same pattern each time', chips: ['onset-recurrent-same'] },
      { id: 'new-3mo', label: 'New, started in the last 3 months', chips: ['onset-new-within-3-months'] },
      { id: 'new-continuous-24h', label: 'New, with a clearly-remembered start that became constant within 24 hours', chips: ['onset-abrupt-continuous-24h', 'onset-new-within-3-months', 'dur-continuous'] },
      { id: 'single-sudden', label: 'One sudden, first-ever episode', chips: ['onset-single-sudden'] },
      { id: 'continuous', label: 'Continuous, never fully goes away', chips: ['dur-continuous'] },
    ],
  },

  // Screen 2 — frequency, duration, count, chronicity (four linked selects)
  {
    id: 'q-frequency',
    screen: 2,
    eyebrow: 'Frequency',
    prompt: 'How many days a month does the headache occur?',
    select: 'single',
    options: [
      { id: 'f-1-4', label: '1 to 4 days a month', chips: ['freq-1-4-per-month'] },
      { id: 'f-5-14', label: '5 to 14 days a month', chips: ['freq-5-14-per-month'] },
      { id: 'f-ge15', label: '15 or more days a month', chips: ['freq-ge-15-per-month'] },
    ],
  },
  {
    id: 'q-duration',
    screen: 2,
    eyebrow: 'Duration',
    prompt: 'Untreated, how long does each attack last?',
    select: 'single',
    options: [
      { id: 'd-lt15', label: 'Under 15 minutes', chips: ['dur-lt-15-min'] },
      { id: 'd-15-180', label: '15 minutes to 3 hours', chips: ['dur-15-to-180-min'] },
      { id: 'd-4-72h', label: '4 to 72 hours', chips: ['dur-4-to-72-hours'] },
      { id: 'd-30min-7d', label: '30 minutes to 7 days', chips: ['dur-30min-to-7days'] },
      { id: 'd-gt72h', label: 'More than 72 hours', chips: ['dur-gt-72-hours'] },
    ],
  },
  {
    id: 'q-attack-count',
    screen: 2,
    eyebrow: 'Attacks so far',
    prompt: 'Roughly how many of these attacks has the patient had in total?',
    select: 'single',
    // attacks-ge-2 folded in for the migraine-with-aura floor (≥5 implies ≥2).
    options: [
      { id: 'c-lt5', label: 'Fewer than 5', chips: ['attacks-lt-5'] },
      { id: 'c-5-10', label: '5 to 9', chips: ['attacks-5-to-10', 'attacks-ge-2'] },
      { id: 'c-gt10', label: '10 or more', chips: ['attacks-gt-10', 'attacks-ge-2'] },
    ],
  },
  {
    id: 'q-chronicity',
    screen: 2,
    eyebrow: 'How long established',
    prompt: 'How long has this pattern been going on?',
    select: 'single',
    options: [
      { id: 'ch-ge3', label: '3 months or longer', chips: ['pattern-ge-3-months'] },
      { id: 'ch-lt3', label: 'Less than 3 months', chips: ['pattern-lt-3-months'] },
    ],
  },

  // Screen 3 — pain quality
  {
    id: 'q-quality',
    screen: 3,
    eyebrow: 'Pain quality',
    prompt: 'How would the patient describe the pain?',
    select: 'single',
    teach: 'Pulsating points to migraine, pressing to tension-type. Quality alone never decides it.',
    options: [
      { id: 'qual-throb', label: 'Throbbing or pulsating', chips: ['qual-pulsating'] },
      { id: 'qual-press', label: 'Pressing or tightening', chips: ['qual-pressing-tightening'] },
      { id: 'qual-sharp', label: 'Sharp, stabbing, or shooting', chips: ['qual-sharp-stabbing'] },
    ],
  },

  // Screen 4 — location + severity
  {
    id: 'q-location',
    screen: 4,
    eyebrow: 'Location',
    prompt: 'Where is the pain?',
    select: 'single',
    options: [
      { id: 'loc-one', label: 'One side', chips: ['loc-unilateral'] },
      { id: 'loc-both', label: 'Both sides', chips: ['loc-bilateral'] },
      // [PAIR — preserve both] orbital answer must add unilateral + orbital-temporal,
      // or cluster-B / ph-B / sunct-B never fire (clinical gate Q4).
      { id: 'loc-orbital', label: 'Around or behind one eye, or the temple', chips: ['loc-unilateral', 'loc-orbital-temporal'] },
    ],
  },
  {
    id: 'q-severity',
    screen: 4,
    eyebrow: 'Severity',
    prompt: 'How severe is it?',
    select: 'single',
    options: [
      { id: 'sev-mild', label: 'Mild', chips: ['sev-mild'] },
      { id: 'sev-mod', label: 'Moderate', chips: ['sev-moderate'] },
      { id: 'sev-sev', label: 'Severe', chips: ['sev-severe'] },
      { id: 'sev-vsev', label: 'Very severe or excruciating', chips: ['sev-very-severe'] },
    ],
  },

  // Screen 5 — activity effect
  {
    id: 'q-activity',
    screen: 5,
    eyebrow: 'Effect of activity',
    prompt: 'What does routine activity (walking, stairs) do to it?',
    select: 'single',
    options: [
      { id: 'act-worse', label: 'Makes it worse, or makes them avoid activity', chips: ['act-aggravated'] },
      { id: 'act-none', label: 'No effect', chips: ['act-not-aggravated'] },
    ],
  },

  // Screen 6 — associated symptoms (multi-select)
  {
    id: 'q-associated',
    screen: 6,
    eyebrow: 'Associated symptoms',
    prompt: 'What comes with the headache? Select all that apply.',
    select: 'multi',
    options: [
      { id: 'as-nausea-mild', label: 'Mild nausea', chips: ['sym-nausea-mild'] },
      { id: 'as-nausea-modsev', label: 'Moderate or severe nausea', chips: ['sym-nausea-moderate-severe'] },
      { id: 'as-vomit', label: 'Vomiting', chips: ['sym-vomiting'] },
      { id: 'as-photo', label: 'Light bothers them', chips: ['sym-photophobia'] },
      { id: 'as-phono', label: 'Sound bothers them', chips: ['sym-phonophobia'] },
      { id: 'as-restless', label: 'Restless, cannot stay still', chips: ['sym-restlessness'] },
      { id: 'as-autonomic', label: 'Watery eye, runny nose, or droopy lid on the painful side', chips: ['sym-autonomic-ipsilateral'] },
      // Vertigo trigger → the vestibular branch fires on this chip.
      { id: 'as-vertigo', label: 'Vertigo or dizziness with the headache', chips: ['vest-vertigo-migrainous'] },
    ],
  },
];

// ─── Conditional branches (fire only on their substrate trigger) ──────────────

const has = (s: ReadonlySet<ChipId>, c: ChipId) => s.has(c);
const anyAutonomic = (s: ReadonlySet<ChipId>) => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness');
const migraineSuggestive = (s: ReadonlySet<ChipId>) =>
  has(s, 'qual-pulsating') || has(s, 'sym-nausea-mild') || has(s, 'sym-nausea-moderate-severe') ||
  has(s, 'sym-vomiting') || has(s, 'sym-photophobia');

export const CONDITIONAL_BRANCHES: ConditionalBranch[] = [
  // TAC short-attack detail — surfaces paroxysmal hemicrania (§3.2) and SUNCT/SUNA (§3.3).
  {
    id: 'b-tac-detail',
    fires: (s) => has(s, 'dur-lt-15-min') && has(s, 'loc-unilateral') && anyAutonomic(s),
    question: {
      id: 'q-tac-detail',
      screen: 7,
      eyebrow: 'Short-attack detail',
      prompt: 'These short, one-sided attacks: how many, how long, and how often? Select all that fit.',
      select: 'multi',
      options: [
        { id: 'tac-ge20', label: '20 or more attacks in total', chips: ['attacks-ge-20'] },
        { id: 'tac-2-30min', label: 'Each lasts 2 to 30 minutes', chips: ['dur-2-to-30-min'] },
        { id: 'tac-1-600sec', label: 'Each lasts seconds to a few minutes (under 10 minutes)', chips: ['dur-1-to-600-sec'] },
        { id: 'tac-gt5day', label: 'More than 5 attacks a day, most days', chips: ['freq-gt-5-per-day'] },
        { id: 'tac-ge1day', label: 'At least 1 attack a day', chips: ['freq-ge-1-per-day'] },
      ],
    },
  },

  // Indomethacin response — unlocks hemicrania continua (§3.4) and paroxysmal hemicrania (§3.2),
  // both hidden until a complete indomethacin response is recorded.
  {
    id: 'b-indomethacin',
    fires: (s) =>
      has(s, 'loc-unilateral') && anyAutonomic(s) && (has(s, 'dur-continuous') || has(s, 'dur-lt-15-min')),
    question: {
      id: 'q-indomethacin',
      screen: 7,
      eyebrow: 'Indomethacin trial',
      prompt: 'Has a full-dose indomethacin trial been done, and what happened?',
      select: 'single',
      teach: 'An absolute response to indomethacin defines hemicrania continua and paroxysmal hemicrania.',
      options: [
        { id: 'indo-none', label: 'Not tried yet', chips: ['indo-not-tried'] },
        { id: 'indo-complete', label: 'Complete response', chips: ['indo-tried-complete'] },
        { id: 'indo-partial', label: 'Partial response only', chips: ['indo-tried-partial'] },
        { id: 'indo-no', label: 'No response', chips: ['indo-tried-no-response'] },
      ],
    },
  },

  // Aura detail — fires when migraine is in contention (clinical gate Q3, option b).
  {
    id: 'b-aura',
    fires: (s) => migraineSuggestive(s),
    question: {
      id: 'q-aura',
      screen: 7,
      eyebrow: 'Aura',
      prompt: 'Are there reversible neurologic symptoms before or with the headache? Select all that apply.',
      select: 'multi',
      options: [
        { id: 'aura-visual', label: 'Visual (zig-zags, blind spot, flashes)', chips: ['aura-visual'] },
        { id: 'aura-sensory', label: 'Sensory (tingling, numbness)', chips: ['aura-sensory'] },
        { id: 'aura-speech', label: 'Speech or language difficulty', chips: ['aura-speech'] },
        { id: 'aura-onesided', label: 'At least one symptom is one-sided', chips: ['aura-symptom-unilateral'] },
        { id: 'aura-reversible', label: 'Fully reversible', chips: ['aura-fully-reversible'] },
        { id: 'aura-spread', label: 'Spreads gradually over 5 minutes or more', chips: ['aura-spread-ge-5min'] },
        { id: 'aura-5-60', label: 'Each symptom lasts 5 to 60 minutes', chips: ['aura-each-5-to-60min'] },
        { id: 'aura-succession', label: 'Two or more symptoms in succession', chips: ['aura-multi-symptoms-succession'] },
        { id: 'aura-then-ha', label: 'Headache follows within 60 minutes', chips: ['aura-headache-within-60min'] },
      ],
    },
  },

  // Chronic-migraine detail — fires at ≥15 days/month with migraine features; unlocks cm-C.
  {
    id: 'b-chronic-migraine',
    fires: (s) => has(s, 'freq-ge-15-per-month') && migraineSuggestive(s),
    question: {
      id: 'q-chronic-migraine',
      screen: 7,
      eyebrow: 'Chronic migraine detail',
      prompt: 'On the frequent-headache days, how migraine-like is it?',
      select: 'multi',
      options: [
        { id: 'cm-features', label: '8 or more days a month are clearly migraine-like', chips: ['migraine-features-ge-8-per-month'] },
        { id: 'cm-triptan', label: 'A triptan or ergot relieves the headache', chips: ['triptan-response-positive'] },
      ],
    },
  },

  // Vestibular detail — fires when vertigo/dizziness is reported with the headache.
  {
    id: 'b-vestibular',
    fires: (s) => has(s, 'vest-vertigo-migrainous'),
    question: {
      id: 'q-vestibular',
      screen: 7,
      eyebrow: 'Vestibular detail',
      prompt: 'About the vertigo episodes and the patient’s migraine history:',
      select: 'multi',
      options: [
        { id: 'vest-ge5', label: 'At least 5 separate vertigo or dizziness episodes', chips: ['vest-episodes-ge-5'] },
        { id: 'vest-intensity', label: 'The vertigo is moderate (interferes with activity) or severe (stops activity)', chips: ['vest-intensity-mod-severe'] },
        { id: 'vest-duration', label: 'Each episode lasts from 5 minutes to 72 hours', chips: ['vest-duration-5min-72h'] },
        { id: 'vest-migr-half', label: 'At least half of the episodes come with a migraine feature (a migraine-type headache with ≥2 typical features, both light and sound sensitivity together, or visual aura)', chips: ['vest-migrainous-half'] },
        { id: 'vest-motion', label: 'Motion sensitivity between episodes', chips: ['vest-motion-sensitivity'] },
        { id: 'vest-history', label: 'An established current or past migraine diagnosis', chips: ['migraine-history-established'] },
      ],
    },
  },
  // Occipital / posterior-scalp detail — fires on sharp/stabbing quality; screens for §13.4 occipital neuralgia.
  {
    id: 'b-occipital',
    fires: (s) => has(s, 'qual-sharp-stabbing'),
    question: {
      id: 'q-occipital',
      screen: 8,
      eyebrow: 'Occipital / posterior scalp detail',
      prompt: 'If this is shooting or stabbing pain at the BACK of the head, answer these (occipital neuralgia screen):',
      select: 'multi',
      options: [
        { id: 'on-loc', label: 'Pain is at the back of the scalp, in the greater/lesser/third occipital nerve area', chips: ['loc-occipital-nerve'] },
        { id: 'on-dur', label: 'Paroxysmal attacks lasting a few seconds to minutes', chips: ['dur-seconds-to-minutes'] },
        { id: 'on-dysaes', label: 'Abnormal or heightened sensation (dysaesthesia/allodynia) when the scalp or hair is lightly touched', chips: ['scalp-dysaesthesia-allodynia'] },
        { id: 'on-tender', label: 'Tenderness over the occipital nerve, or a trigger point at the nerve emergence / C2 area', chips: ['occipital-nerve-tenderness-or-trigger'] },
        { id: 'on-block', label: 'Pain is temporarily eased by a local anaesthetic block of the nerve', chips: ['occipital-block-response-positive'] },
      ],
    },
  },
  // Facial pain detail — fires on sharp/stabbing quality; screens for §13.1 trigeminal neuralgia.
  {
    id: 'b-trigeminal',
    fires: (s) => has(s, 'qual-sharp-stabbing'),
    question: {
      id: 'q-trigeminal',
      screen: 8,
      eyebrow: 'Facial pain detail',
      prompt: 'If this is brief, shock-like FACIAL pain, answer these (trigeminal neuralgia screen):',
      select: 'multi',
      options: [
        { id: 'tn-distribution', label: 'Pain is confined to the face in one or more trigeminal areas (cheek, jaw, around the eye), not spreading beyond', chips: ['loc-trigeminal-distribution'] },
        { id: 'tn-shock', label: 'The pain is electric-shock-like or shooting', chips: ['qual-electric-shock-shooting'] },
        { id: 'tn-brief', label: 'Each attack lasts from a fraction of a second up to 2 minutes', chips: ['dur-fraction-sec-to-2min'] },
        { id: 'tn-trigger', label: 'Attacks are triggered by light touch, chewing, talking, brushing teeth, or cold air on the face', chips: ['trigger-innocuous-stimulus'] },
      ],
    },
  },
  // Prolonged attack (>72 h) — fires when the duration is >72 h (§1.4.1 status migrainosus).
  {
    id: 'b-status-migrainosus',
    fires: (s) => has(s, 'dur-gt-72-hours'),
    question: {
      id: 'q-status-migrainosus',
      screen: 7,
      eyebrow: 'Prolonged attack (>72 h)',
      prompt: 'This attack has lasted more than 72 hours. About the patient and the attack:',
      select: 'multi',
      options: [
        { id: 'status-migraine-hx', label: 'The patient has an established current or past migraine diagnosis (1.1 or 1.2)', chips: ['migraine-history-established'] },
        { id: 'status-debilitating', label: 'The pain and/or associated symptoms are debilitating (unable to function)', chips: ['sev-debilitating'] },
      ],
    },
  },
  // Stabbing detail — fires when sharp/stabbing quality is reported (§4.7 primary stabbing).
  {
    id: 'b-stabbing',
    fires: (s) => has(s, 'qual-sharp-stabbing'),
    question: {
      id: 'q-stabbing',
      screen: 7,
      eyebrow: 'Stabbing detail',
      prompt: 'About the sharp, stabbing pains:',
      select: 'multi',
      options: [
        { id: 'stab-spontaneous', label: 'They come on spontaneously, as a single stab or a series of stabs', chips: ['onset-spontaneous-stab'] },
        { id: 'stab-seconds', label: 'Each stab lasts only up to a few seconds', chips: ['dur-stab-seconds'] },
        { id: 'stab-freq', label: 'They recur irregularly, from one to many per day', chips: ['freq-stab-one-to-many-per-day'] },
      ],
    },
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Every ChipId referenced by any answer option (core + branches). Used by the
 *  drift-guard test to assert each resolves via getChip(). */
export function allQuestionChips(): ChipId[] {
  const out: ChipId[] = [];
  const collect = (q: HeadacheQuestion) => q.options.forEach(o => o.chips.forEach(c => out.push(c)));
  CORE_QUESTIONS.forEach(collect);
  CONDITIONAL_BRANCHES.forEach(b => collect(b.question));
  return out;
}

/** The questions to show for the current `selected` set: the core spine plus any
 *  branch whose trigger has fired. Order: core (by screen), then fired branches. */
export function getActiveQuestions(selected: ReadonlySet<ChipId>): HeadacheQuestion[] {
  const fired = CONDITIONAL_BRANCHES.filter(b => b.fires(selected)).map(b => b.question);
  return [...CORE_QUESTIONS, ...fired];
}
