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
  /**
   * §13.4 Phase-1 structured-data claim tag for the teach string (adjacent
   * claimId field, scanned by scripts/check-claims.ts). Required whenever
   * `teach` makes a clinical statement (clinical review round 2, BI-4).
   */
  claimId?: string;
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
      { id: 'sleep-only', label: 'Only during sleep, waking the patient ("alarm-clock" headache)', chips: ['onset-only-during-sleep-waking'] },
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
      // Electric-shock quality was previously obtainable ONLY inside the
      // trigeminal-neuralgia branch, which itself only opened after picking
      // "sharp". A clinician whose patient described textbook TN jolts could not
      // say so until they had first mislabeled the pain. Both chips contribute so
      // every criterion that accepts either quality still evaluates.
      // Added 2026-09-07 (headache pathway user review, finding 3). Label is
      // quality-only: duration is asked twice elsewhere (q-duration, tn-brief),
      // and a duration qualifier here discouraged the 90-second-paroxysm and
      // shooting-pain-inside-a-long-attack presentations (medical review, B1).
      // The shared qual-sharp-stabbing chip also opens b-occipital and
      // b-stabbing. INTENDED: occipital neuralgia and primary stabbing headache
      // are the standing differentials for shooting pain (architect rec 10).
      { id: 'qual-shock', label: 'Electric shock-like or shooting', chips: ['qual-electric-shock-shooting', 'qual-sharp-stabbing'] },
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
      // A facial-pain chief complaint previously had no answer on this screen:
      // the options were one side / both sides / around the eye, and a cheek or
      // jaw presentation had to be filed under "one side" with the facial nature
      // lost. ICHD-3 keeps facial pain in Part 3; this routes the §13.1 screen.
      // [PAIR] unilateral + facial-region, mirroring the orbital pattern above.
      // [PAIR - label constraint] This label must NOT mention the eye or orbit:
      // q-location is single-select, and cluster-B / ph-B demote-gates require
      // loc-orbital-temporal, which only the orbital answer above contributes.
      // An "around the eye" phrasing here siphoned periorbital patients off that
      // chip and silently capped cluster and paroxysmal hemicrania at Probable
      // (clinical review 2026-09-07, BC-6; drift guard in the reachability tests).
      { id: 'loc-face', label: 'In the face: cheek, jaw, or upper lip', chips: ['loc-unilateral', 'loc-facial-region'] },
      // A glossopharyngeal presentation previously had no answer on this screen:
      // throat, tongue-base and ear pain had to be filed under "one side" or "in
      // the face", and 13.2.1 was undiagnosable - the reachability defect fixed
      // for facial pain on 2026-09-07, reproduced one chapter over.
      // [PAIR - preserve both] 13.2.1 criterion A requires unilaterality, so this
      // answer contributes loc-unilateral alongside the territory chip, mirroring
      // loc-orbital and loc-face (architect 2026-09-08, condition 3).
      // [PAIR - label constraint] q-location is a clinically DISJOINT single-select
      // partition. ICHD-3 13.2.1 Note 1 puts the ANGLE of the lower jaw in
      // glossopharyngeal territory while 13.1.1 covers the cheek and jaw surface,
      // so "jaw" appears in BOTH this label and loc-face. The drift guard asserts
      // the partition by anatomical keyword, NOT by the word "jaw": this label
      // owns throat / tongue / tonsil / ear; loc-face owns cheek / upper lip;
      // neither may mention the eye or orbit (BC-6 protects loc-orbital-temporal).
      // This answer must NOT contribute loc-facial-region: that chip's label reads
      // "cheek, jaw, or upper lip", and contributing it from a throat-and-ear
      // answer would make the chip label lie about what the clinician affirmed.
      { id: 'loc-throat-ear', label: 'In the throat, back of the tongue, tonsil area, or ear, including under the angle of the jaw', chips: ['loc-unilateral', 'loc-glossopharyngeal-territory'] },
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
      // §3.3 SUNCT/SUNA itemized autonomic features (conjunctival injection + tearing
      // distinguish SUNCT from SUNA). The bundled `sym-autonomic-ipsilateral` chip stays
      // in code for back-compat; anyAutonomicFeature() OR-s all of these.
      { id: 'as-conjunctival', label: 'Red eye (conjunctival injection) on the painful side', chips: ['sym-conjunctival-injection'] },
      { id: 'as-lacrimation', label: 'Tearing / watery eye (lacrimation) on the painful side', chips: ['sym-lacrimation'] },
      { id: 'as-autonomic-other', label: 'Other autonomic feature on the painful side (runny or blocked nose, droopy or swollen lid, forehead sweating)', chips: ['sym-other-cranial-autonomic'] },
      // Vertigo trigger → the vestibular branch fires on this chip.
      { id: 'as-vertigo', label: 'Vertigo or dizziness with the headache', chips: ['vest-vertigo-migrainous'] },
      // Aura-screen trigger (routing flag; contributes to no criterion).
      { id: 'as-reversible-neuro', label: 'Visual disturbance or other reversible neurologic symptoms around the headache (zig-zags, blind spot, one-eye vision loss, tingling, speech trouble)', chips: ['sym-reversible-neuro-reported'] },
    ],
  },
];

// ─── Conditional branches (fire only on their substrate trigger) ──────────────

const has = (s: ReadonlySet<ChipId>, c: ChipId) => s.has(c);
const anyAutonomic = (s: ReadonlySet<ChipId>) => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-conjunctival-injection') || has(s, 'sym-lacrimation') || has(s, 'sym-other-cranial-autonomic') || has(s, 'sym-restlessness');
const migraineSuggestive = (s: ReadonlySet<ChipId>) =>
  has(s, 'qual-pulsating') || has(s, 'sym-nausea-mild') || has(s, 'sym-nausea-moderate-severe') ||
  has(s, 'sym-vomiting') || has(s, 'sym-photophobia');

// ONE clinical concept (the §3.1 cluster attack picture) deliberately split
// across two screens by clinical review BC-9. The two branches must fire and
// stop firing together forever: a widening applied to one and not the other
// reproduces the orphaned-criterion defect this batch fixed (architect review
// 2026-09-08, condition 2).
const clusterPictureFires = (s: ReadonlySet<ChipId>) => has(s, 'dur-15-to-180-min') && has(s, 'loc-unilateral');

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

  // Cluster pattern — fires on the cluster attack picture (15 min-3 h, unilateral);
  // resolves §3.1.1 episodic vs §3.1.2 chronic (ADR-2026-07-06 subtype pass).
  {
    id: 'b-cluster-detail',
    fires: clusterPictureFires,
    question: {
      id: 'q-cluster-detail',
      screen: 8,
      eyebrow: 'Cluster pattern',
      prompt: 'If these are cluster-type attacks, how often do they come during a bout?',
      // Criterion D's chip (freq-cluster-bout) was defined in the engine with its
      // own teach text but NO question option anywhere contributed it, so cluster
      // could never reach a full 3.1 match through the flow; it capped at
      // probable (3.5) for every user. Found by the reachability harness on its
      // first run (2026-09-07). Bout frequency and the episodic/chronic subtype
      // are SEPARATE single-select questions: the subtype pair is mutually
      // exclusive by ICHD-3 definition (3.1.1 vs 3.1.2), and a shared
      // multi-select let both be asserted at once, which the resolver silently
      // read as episodic (clinical review BC-9).
      select: 'single',
      options: [
        { id: 'cluster-bout-freq', label: 'During bouts, attacks come from one every other day up to 8 a day', chips: ['freq-cluster-bout'] },
      ],
    },
  },
  {
    id: 'b-cluster-subtype',
    fires: clusterPictureFires,
    question: {
      id: 'q-cluster-subtype',
      screen: 8,
      eyebrow: 'Bout and remission pattern',
      prompt: 'What is the bout-and-remission pattern?',
      select: 'single',
      options: [
        { id: 'cluster-episodic', label: 'Attacks come in bouts separated by pain-free remissions of 3 months or more', chips: ['cluster-remission-ge-3mo'] },
        { id: 'cluster-chronic', label: 'Attacks continue for a year or more with no remission, or remissions shorter than 3 months', chips: ['cluster-no-remission-or-lt-3mo'] },
      ],
    },
  },

  // Medication-overuse (MOH overlay, §8.2) — fires on chronic frequency (15+ days/month).
  {
    id: 'b-moh',
    fires: (s) => has(s, 'freq-ge-15-per-month'),
    question: {
      id: 'q-moh',
      screen: 8,
      eyebrow: 'Medication use',
      prompt: 'With headache on 15 or more days a month, ask about regular acute-medication use (medication-overuse headache):',
      select: 'multi',
      options: [
        { id: 'moh-simple', label: 'Simple painkillers (paracetamol, NSAIDs, aspirin) on 15 or more days a month', chips: ['moh-overuse-simple-ge-15'] },
        { id: 'moh-specific', label: 'Triptans, ergots, opioids, combination painkillers, or several drug classes on 10 or more days a month', chips: ['moh-overuse-specific-ge-10'] },
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
    // migraineSuggestive alone gated this screen behind pulsating quality or
    // migraine-associated symptoms, which ICHD-3 1.2 does not require: aura is
    // diagnosed on the aura, and 1.2.4 retinal migraine in particular often
    // rides on a non-migrainous headache. A monocular-visual-loss presentation
    // with a mild pressing headache never saw this screen, so retinal migraine
    // AND its amaurosis-fugax caution were unreachable (user review, finding 2).
    fires: (s) => migraineSuggestive(s) || has(s, 'sym-reversible-neuro-reported'),
    question: {
      id: 'q-aura',
      screen: 7,
      eyebrow: 'Aura',
      prompt: 'Are there reversible neurologic symptoms before or with the headache? Select all that apply.',
      select: 'multi',
      // BC-7 vascular-mimic caution — this teach string is its ONLY live
      // surface (HeadacheQuestion.tsx renders question.teach; the chip-level
      // teachWhenSelected surface is dormant in V4, see clinical review round 2
      // BI-3). Wording is the round-2 reviewer's own trim (BI-1 resolution 2):
      // the 1.2 C characteristics are verbatim ichd3-2018; "exclude TIA and
      // seizure" is a workup instruction bounded by do-snnoop10-2019
      // ("N: Neurologic deficit"), not a claim about those diseases' behaviour;
      // the monocular sentence restates the reviewed retinal subtype steer.
      claimId: 'clinic-headache-ichd3-aura-subtypes',
      teach: 'Reversible neurologic symptoms are not specific to migraine aura. ICHD-3 1.2 C characteristics include gradual spread over 5 minutes or more and a symptom duration of 5 to 60 minutes. Exclude TIA and seizure before calling this aura. Monocular visual loss needs amaurosis fugax, retinal artery occlusion, and optic neuropathy excluded before it is called 1.2.4 retinal migraine.',
      options: [
        { id: 'aura-visual', label: 'Visual (zig-zags, blind spot, flashes)', chips: ['aura-visual'] },
        { id: 'aura-sensory', label: 'Sensory (tingling, numbness)', chips: ['aura-sensory'] },
        { id: 'aura-speech', label: 'Speech or language difficulty', chips: ['aura-speech'] },
        // §1.2.2/.3/.4 subtype-discriminating aura symptoms.
        { id: 'aura-motor', label: 'Motor weakness (one-sided arm, leg, or face weakness)', chips: ['aura-motor'] },
        { id: 'aura-brainstem', label: 'Two or more brainstem symptoms (slurred speech, vertigo, double vision, unsteadiness, ringing in the ears)', chips: ['aura-brainstem'] },
        { id: 'aura-retinal', label: 'Loss of vision in ONE eye only (monocular)', chips: ['aura-retinal'] },
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
  // Sleep-related (hypnic) detail — fires when the headache occurs only during sleep (§4.9).
  {
    id: 'b-hypnic',
    fires: (s) => has(s, 'onset-only-during-sleep-waking'),
    question: {
      id: 'q-hypnic',
      screen: 8,
      eyebrow: 'Sleep-related (hypnic) detail',
      prompt: 'About these sleep-only headaches:',
      select: 'multi',
      options: [
        { id: 'hypnic-freq', label: 'They occur on 10 or more days per month', chips: ['freq-ge-10-per-month'] },
        { id: 'hypnic-3mo', label: 'This pattern has lasted more than 3 months', chips: ['pattern-ge-3-months'] },
        { id: 'hypnic-dur', label: 'Each attack lasts from 15 minutes up to 4 hours after waking', chips: ['dur-15min-to-4h'] },
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
    // Previously sharp-stabbing quality was the ONLY key to this screen. A face
    // presentation with any other quality answer, or the new electric-shock
    // option, must open it too (user review, findings 1 and 3).
    fires: (s) => has(s, 'qual-sharp-stabbing') || has(s, 'qual-electric-shock-shooting') || has(s, 'loc-facial-region'),
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
        // §13.1.1 aetiology (if imaging / nerve tests have been done) → classical / secondary / idiopathic subtype.
        { id: 'tn-nvc', label: 'Imaging shows a blood vessel compressing the nerve WITH nerve changes (atrophy/displacement)', chips: ['tn-nvc-morphological-change'] },
        { id: 'tn-secondary-cause', label: 'An underlying cause has been found (MS, a tumour, or AVM)', chips: ['tn-underlying-disease-demonstrated'] },
        { id: 'tn-workup-neg', label: 'MRI and nerve tests were done and were normal (no compression with changes, no underlying cause)', chips: ['tn-adequate-workup-negative'] },
      ],
    },
  },
  // Glossopharyngeal detail — screens for §13.2.1. SIBLING of b-trigeminal and
  // b-pifp, not a co-tenant: share a screen ONLY when two phenotypes have
  // identical fires() (the q-tac-detail precedent); otherwise siblings (the
  // b-occipital / b-stabbing / b-trigeminal precedent). Architect 2026-09-08,
  // condition 2. Do NOT widen b-trigeminal's predicate and do NOT add GPN
  // options to q-trigeminal: a throat-territory patient ticking honestly on a
  // co-tenanted screen can satisfy tn-A, tn-B and tn-C together, because
  // loc-trigeminal-distribution's label says "jaw", tn-trigger's label says
  // "talking", and 13.2.1's own territory note says "angle of the lower jaw"
  // while its trigger criterion says "talking".
  // fires() includes loc-facial-region (clinical pre-gate C1): an angle-of-jaw
  // presentation plausibly files under "In the face: cheek, jaw, or upper lip",
  // and on that route the patient must still reach this screen - otherwise they
  // reach ONLY the TN screen and can collect a confident full TN match while
  // GPN stays invisible. The territory-confirm option below exists for exactly
  // that route: q-location is single-select, so a loc-face answer cannot also
  // contribute the territory chip gpn-A requires.
  {
    id: 'b-glossopharyngeal',
    fires: (s) => has(s, 'loc-glossopharyngeal-territory') || has(s, 'loc-facial-region'),
    question: {
      id: 'q-glossopharyngeal',
      screen: 8,
      eyebrow: 'Throat and ear pain detail',
      prompt: 'If this is brief, shock-like pain in the throat, tongue base, or ear, answer these (glossopharyngeal neuralgia screen):',
      select: 'multi',
      // BC-7-class caution: this teach string is the PRIMARY live surface of the
      // GPN vagal-safety content (clinical pre-gate condition on S5; the card is
      // secondary and opt-in). Attribution "some authors have suggested" is the
      // source's own (pre-gate C7).
      claimId: 'clinic-headache-gpn-vagal-safety',
      teach: 'ICHD-3 13.2.1 permits radiation to the eye, nose, chin, or shoulder, so spread beyond the nerve does not rule it out; 13.1.1 trigeminal neuralgia does not permit it. In rare cases attacks are accompanied by vagal symptoms such as cough, hoarseness, syncope, or bradycardia, and some authors have suggested the term vagoglossopharyngeal neuralgia when pain is accompanied by asystole, convulsions, and syncope, so ask about blackouts with attacks. Pain can be severe enough for patients to lose weight. Major sensory changes or a reduced or missing gag reflex should prompt aetiological investigations; mild sensory deficits do not invalidate the diagnosis.',
      options: [
        // Territory confirm (pre-gate C1): on the loc-face route the territory
        // chip is otherwise unobtainable and gpn-A can never be satisfied. On the
        // loc-throat-ear route this option is redundant but harmless (the chip is
        // already present). Mirrors the gpn-shock idiom for working around a
        // single-select core screen.
        { id: 'gpn-territory', label: 'The pain sits in the throat, back of the tongue, tonsil area, or ear, including under the angle of the jaw', chips: ['loc-glossopharyngeal-territory'] },
        // Mirrors tn-shock: the core q-quality screen is single-select, so a
        // patient who answered "throbbing" or "pressing" has no other route to
        // gpn-B.3. Contributes ONLY qual-electric-shock-shooting, exactly as
        // tn-shock does, so it does not additionally open b-occipital and
        // b-stabbing.
        { id: 'gpn-shock', label: 'The pain is electric-shock-like or shooting', chips: ['qual-electric-shock-shooting'] },
        { id: 'gpn-brief', label: 'Each attack lasts from a few seconds up to 2 minutes', chips: ['dur-few-sec-to-2min'] },
        { id: 'gpn-trigger', label: 'Attacks are triggered by swallowing, coughing, talking, or yawning', chips: ['trigger-swallow-cough-talk-yawn'] },
      ],
    },
  },
  // Persistent facial pain detail — screens for §13.12. Fires on either site
  // chip, matching ICHD-3 13.12 A ("facial and/or oral pain") exactly. SIBLING
  // of b-trigeminal and b-glossopharyngeal (architect condition 2). Deliberately
  // does NOT fire on a quality chip: 13.12's quality is dull, aching or nagging,
  // and the core q-quality screen's nearest answer (pressing or tightening)
  // belongs to §2 TTH; using it as a trigger would be a wider-label
  // false-positive path. The minted qual-dull-aching-nagging chip lives on this
  // screen, so the core single-select partition is untouched.
  {
    id: 'b-pifp',
    fires: (s) => has(s, 'loc-facial-region') || has(s, 'loc-glossopharyngeal-territory'),
    question: {
      id: 'q-pifp',
      screen: 8,
      eyebrow: 'Persistent facial pain detail',
      prompt: 'If this is constant, dull facial or mouth pain rather than brief shocks, answer these (persistent idiopathic facial pain screen):',
      select: 'multi',
      // Discriminators are framed as pointers, not identifications (pre-gate C6):
      // the engine returns match strengths and never declares a diagnosis, and
      // 13.11 / 13.1.1.1.2 have criteria this tool does not collect.
      claimId: 'clinic-headache-ichd3-pifp-criteria',
      teach: 'ICHD-3 13.12 requires a normal clinical neurological examination and a dental cause excluded by appropriate investigations. Sharp exacerbations are allowed, and over time the pain may spread to a wider area of the craniocervical region. Psychophysical or neurophysiological tests may demonstrate sensory abnormalities; the clinical examination is the only normal-findings criterion. Burning pain felt superficially in the oral mucosa points away from 13.12 and toward 13.11 burning mouth syndrome, which shares the same daily-pattern criterion word for word. Triggered shock-like paroxysms on a background ache within a nerve territory point toward trigeminal neuralgia with concomitant continuous pain (13.1.1.1.2 or 13.1.1.3.2), which requires the paroxysms.',
      options: [
        { id: 'pifp-daily', label: 'The pain recurs daily, more than 2 hours a day, for more than 3 months', chips: ['pifp-daily-gt2h-gt3mo'] },
        { id: 'pifp-poorly-loc', label: 'The pain is poorly localized and does not follow the territory of a peripheral nerve', chips: ['pifp-poorly-localized-non-nerve'] },
        { id: 'pifp-quality', label: 'The pain is dull, aching, or nagging', chips: ['qual-dull-aching-nagging'] },
        { id: 'pifp-exam', label: 'The clinical neurological examination is normal', chips: ['exam-neuro-normal'] },
        { id: 'pifp-dental', label: 'A dental cause has been excluded by appropriate investigations', chips: ['pifp-dental-cause-excluded'] },
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
