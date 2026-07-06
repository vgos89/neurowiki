/**
 * Clinic Headache Pathway — structured data + pure phenotype evaluator.
 *
 * React-free, JSX-free, no DOM imports (architect §17.1 hard rule).
 * Consumers: ClinicHeadachePathway page + Vitest tests.
 *
 * Sources (all in src/lib/citations/registry.ts):
 *   - ICHD-3 2018 (ichd3-2018) — diagnostic criteria
 *   - Scher Continuum 2024 (scher-tth-2024-continuum) — TTH management
 *   - Goadsby Continuum 2024 (goadsby-2024-continuum-indomethacin) — HC
 *   - Lipton Continuum 2024 (lipton-2024-continuum-preventive) — preventive
 *   - Ailani AHS 2021 (ailani-ahs-2021) — preventive threshold + CGRP
 *   - Rizzoli Continuum 2024 (rizzoli-2024-continuum-moh) — MOH
 *   - Burish Continuum 2024 (burish-2024-continuum-cluster) — cluster
 *   - Do 2019 SNNOOP10 (do-snnoop10-2019) — red flags
 *
 * Output language rule: this module never declares "diagnosis." It returns
 * match strengths against ICHD-3 criteria. The clinician owns the diagnosis.
 */

// ─── Chip ID union (the entire feature vocabulary) ────────────────────────

export type ChipId =
  // Pattern: lifetime attacks
  | 'attacks-lt-5' | 'attacks-ge-2' | 'attacks-5-to-10' | 'attacks-gt-10' | 'attacks-ge-20'
  // Pattern: frequency
  | 'freq-1-4-per-month' | 'freq-5-14-per-month' | 'freq-ge-15-per-month' | 'freq-cluster-bout'
  | 'freq-gt-5-per-day' | 'freq-ge-1-per-day'
  // Pattern: pattern duration in time
  | 'pattern-lt-3-months' | 'pattern-ge-3-months'
  // Pattern: duration per attack
  | 'dur-lt-15-min' | 'dur-1-to-600-sec' | 'dur-2-to-30-min'
  | 'dur-15-to-180-min' | 'dur-30min-to-7days'
  | 'dur-4-to-72-hours' | 'dur-gt-72-hours' | 'dur-continuous'
  // Pattern: onset
  | 'onset-recurrent-same' | 'onset-new-within-3-months' | 'onset-single-sudden' | 'onset-abrupt-continuous-24h'
  // §4.7 Primary stabbing headache
  | 'onset-spontaneous-stab' | 'dur-stab-seconds' | 'freq-stab-one-to-many-per-day'
  // Pain location
  | 'loc-unilateral' | 'loc-bilateral' | 'loc-orbital-temporal'
  // Pain quality
  | 'qual-pulsating' | 'qual-pressing-tightening' | 'qual-sharp-stabbing'
  // Pain severity
  | 'sev-mild' | 'sev-moderate' | 'sev-severe' | 'sev-very-severe'
  // Activity
  | 'act-aggravated' | 'act-not-aggravated'
  // Associated symptoms
  // ICHD-3 §2.3 D requires distinguishing mild nausea (allowed) from moderate-severe
  // nausea + vomiting (excluded). Split per clinical-reviewer §17.2 condition 5.
  | 'sym-nausea-mild' | 'sym-nausea-moderate-severe' | 'sym-vomiting'
  | 'sym-photophobia' | 'sym-phonophobia'
  | 'sym-restlessness' | 'sym-autonomic-ipsilateral'
  // Chronic migraine — ICHD-3 §1.3 criterion C disjunction
  | 'migraine-features-ge-8-per-month' | 'triptan-response-positive'
  // Aura features
  | 'aura-visual' | 'aura-sensory' | 'aura-speech' | 'aura-motor' | 'aura-brainstem' | 'aura-retinal'
  | 'aura-fully-reversible' | 'aura-spread-ge-5min' | 'aura-each-5-to-60min'
  | 'aura-multi-symptoms-succession' | 'aura-positive-symptoms' | 'aura-headache-within-60min'
  | 'aura-symptom-unilateral'
  // Vestibular
  | 'vest-vertigo-migrainous' | 'vest-motion-sensitivity'
  | 'vest-episodes-ge-5' | 'vest-intensity-mod-severe' | 'vest-duration-5min-72h' | 'vest-migrainous-half'
  | 'migraine-history-established'
  // Indomethacin response (hemicrania continua gate)
  | 'indo-not-tried' | 'indo-tried-complete' | 'indo-tried-partial' | 'indo-tried-no-response'
  // SNNOOP10 red flags
  | 'rf-systemic'
  | 'rf-neoplasm'
  | 'rf-neuro-deficit'
  | 'rf-onset-sudden'
  | 'rf-older-age-onset'
  | 'rf-pattern-change'
  | 'rf-positional'
  | 'rf-valsalva'
  | 'rf-papilloedema'
  | 'rf-progressive'
  | 'rf-pregnancy'
  | 'rf-painful-eye-autonomic'
  | 'rf-posttraumatic'
  | 'rf-immune-pathology'
  | 'rf-painkiller-overuse';

export interface Chip {
  id: ChipId;
  label: string;
  teachWhenSelected?: string;
}

export interface ChipGroup {
  id: string;
  label: string;
  eyebrow: string;
  defaultCollapsed?: boolean;
  chips: Chip[];
}

// ─── Phenotype shape ──────────────────────────────────────────────────────

export type PhenotypeId =
  | 'migraine-without-aura'
  | 'migraine-with-aura'
  | 'chronic-migraine'              // §1.3 — added 2026-05-25 per medsci audit
  | 'probable-migraine'
  | 'episodic-tth'
  | 'chronic-tth'
  | 'probable-tth'
  | 'cluster-headache'
  | 'paroxysmal-hemicrania'         // §3.2 — added 2026-05-25
  | 'sunct-suna'                    // §3.3 — added 2026-05-25
  | 'hemicrania-continua'
  | 'probable-tac'
  | 'primary-stabbing-headache'     // §4.7 — added 2026-07-06
  | 'ndph'
  | 'vestibular-migraine';

/**
 * Criterion role — three-way classification replacing the old `definitional?: boolean`.
 *
 * Implemented 2026-06-04 per medsci spec + arch §17.1 + clinical-reviewer §17.2.
 *
 * - 'scorable'     — counts toward met/total; failure only lowers the fraction.
 *                    Never gates (does not hide or demote on its own).
 * - 'demote-gate'  — failure keeps the phenotype but caps matchStrength at
 *                    'probable' (if sole miss) / 'partial' (if multiple miss).
 *                    Used for features/windows the patient has not yet confirmed
 *                    that have a §X.5 Probable ICHD-3 home.
 * - 'suppress-gate'— failure HIDES the phenotype (positive evidence for a
 *                    different phenotype, OR defines substrate/chronicity, OR
 *                    is an absent confirmatory test). The EMIT set (tth-D,
 *                    ctth-D, cm-C) surfaces the phenotype with
 *                    definitionallyExcluded:true; the DROP set continues silently.
 */
export type CriterionRole = 'scorable' | 'demote-gate' | 'suppress-gate';

export interface Criterion {
  id: string;
  label: string;
  description: string;
  evaluate: (selected: Set<ChipId>) => boolean;
  contributingChips: ChipId[];
  /**
   * Role of this criterion in the ranking/flagging engine.
   *
   * Required — omission is a type error (arch §17.1 follow-up 1: the enum must
   * be non-optional so a future author cannot accidentally leave a criterion
   * unclassified and silently mis-default to wrong behavior).
   *
   * Replaces the legacy `definitional?: boolean` field (2026-06-04 refactor).
   * `suppress-gate` covers what was formerly `definitional: true` for HIDE
   * semantics; `demote-gate` is new for criteria that previously dropped the
   * phenotype but now surface a near-miss.
   */
  role: CriterionRole;
}

export interface Phenotype {
  id: PhenotypeId;
  name: string;
  ichd3Section: string;
  isAppendix?: boolean;
  /**
   * Typed trial-gate per architect §17.1 condition 1 (2026-05-25). The
   * phenotype does not surface in results until the gate chip is selected.
   * Hemicrania continua + paroxysmal hemicrania both gate on
   * `indo-tried-complete` per ICHD-3 §3.4 D / §3.2 E (suppress-gate).
   *
   * NOTE on overlap with `Criterion.role === 'suppress-gate'` (architect §17.1
   * follow-up 1, 2026-05-27, 2026-06-04): `hiddenUntilTrial.gateChip` is
   * semantically a suppress-gate. HC's hc-D and PH's ph-E are both
   * `hiddenUntilTrial.gateChip` AND tagged `role: 'suppress-gate'`. Both checks
   * are idempotent — failed suppress-gate drops the phenotype; missing gate chip
   * also drops it. Do NOT add a fifth phenotype-suppression mechanism without
   * considering unification first.
   */
  hiddenUntilTrial?: { gateChip: ChipId };
  suppressIfContinuous?: boolean;
  teachPearl?: string;
  pitfalls?: string[];
  criteria: Criterion[];
}

export interface PhenotypeMatch {
  phenotypeId: PhenotypeId;
  name: string;
  ichd3Section: string;
  /**
   * Section reference for the user-facing label. When matchStrength is
   * 'probable', this is the §X.5 reference (e.g. ICHD-3 §1.5 Probable
   * migraine) per the ICHD-3 Probable framework. Otherwise the phenotype's
   * parent ichd3Section. Architect-recommended Phase 2 relabel (2026-05-25).
   */
  displaySection: string;
  matchStrength: 'full' | 'probable' | 'partial' | 'none';
  criteriaMet: number;
  criteriaTotal: number;
  /**
   * Met-criteria detail with `contributingChipLabels` — the labels of the
   * chips the user selected that satisfied this criterion. Enables the
   * drawer + management cards to surface "Criterion C ✓ — unilateral,
   * pulsating, severe" instead of bare criterion labels (V usability
   * request 2026-05-25, item 4: 'indicate how you came to that diagnosis
   * based on the selections that the user made').
   */
  metCriteria: { id: string; label: string; contributingChipLabels: string[] }[];
  missingCriteria: { id: string; label: string; description: string }[];
  isAppendix?: boolean;
  /**
   * True when the phenotype was considered but suppressed because a suppress-gate
   * criterion failed on positive contradicting evidence (EMIT set: tth-D,
   * ctth-D, cm-C). The match is present in the output array so the result screen
   * can render a "considered and set aside" tray, but must NOT be treated as an
   * active phenotype match (matchStrength will be 'none' when definitionallyExcluded is true).
   *
   * False for all normally-matched phenotypes (full / probable / partial).
   * DROP-set suppressions (aura-B, cm-A, ctth-A, etc.) never appear in output.
   *
   * Added 2026-06-04 per arch §17.1 follow-up 7 + clinical §17.2 condition 5.
   */
  definitionallyExcluded: boolean;
  /**
   * When definitionallyExcluded is true, names the failed criterion/gate in
   * neutral terms using existing criterion label/description text from the engine.
   * Contains no UI band words, no diagnosis label, no percentage.
   * The Stage Two copy layer owns any clinician-facing sentence built from this.
   */
  exclusionReason?: string;
}

// ─── Helper predicates (composable, pure) ─────────────────────────────────

const has = (s: Set<ChipId>, id: ChipId) => s.has(id);
const hasAny = (s: Set<ChipId>, ids: ChipId[]) => ids.some(id => s.has(id));
const countOf = (s: Set<ChipId>, ids: ChipId[]) => ids.filter(id => s.has(id)).length;

// ─── Chip groups (ordered as they appear on the page) ─────────────────────

export const HEADACHE_CHIP_GROUPS: ChipGroup[] = [
  {
    id: 'pattern',
    label: 'Pattern',
    eyebrow: 'ICHD-3 separates primary headaches first by attack count, frequency, duration, and onset.',
    chips: [
      { id: 'attacks-lt-5', label: 'Fewer than 5 lifetime attacks so far', teachWhenSelected: '1.1 Migraine requires ≥5 attacks. With <5, only 1.5 Probable migraine can apply.' },
      { id: 'attacks-ge-2', label: 'At least 2 lifetime attacks', teachWhenSelected: '§1.2 A Migraine with aura requires ≥2 attacks (fewer than for §1.1\'s ≥5).' },
      // A-m4 (2026-07-06): boundary made non-overlapping at 10 so §2.2 TTH (≥10 episodes)
      // is inclusive of exactly 10. The `attacks-5-to-10` id now means 5–9 and
      // `attacks-gt-10` means ≥10 (per these labels + the question options); no evaluate
      // logic changed (≥5/≥2 checks OR both, so their union is unaffected).
      { id: 'attacks-5-to-10', label: '5 to 9 lifetime attacks', teachWhenSelected: 'Meets the ≥5 attack criterion for 1.1 Migraine and 3.1 Cluster headache.' },
      { id: 'attacks-gt-10', label: '10 or more lifetime attacks', teachWhenSelected: 'Meets the ≥10 episode criterion for 2.2 Episodic TTH and the ≥5 criterion for migraine.' },

      { id: 'freq-1-4-per-month', label: '1 to 4 headache days per month' },
      { id: 'freq-5-14-per-month', label: '5 to 14 headache days per month' },
      { id: 'freq-ge-15-per-month', label: '15 or more headache days per month', teachWhenSelected: 'Crosses the chronic threshold (Chronic migraine, Chronic TTH, or MOH territory).' },
      { id: 'freq-cluster-bout', label: 'Frequency 1 every other day to 8/day during bouts', teachWhenSelected: '3.1 Cluster criterion D: pattern in active bouts.' },

      { id: 'pattern-lt-3-months', label: 'Pattern present <3 months' },
      { id: 'pattern-ge-3-months', label: 'Pattern present ≥3 months', teachWhenSelected: 'Required for 2.2/2.3 TTH and 3.4 Hemicrania continua diagnoses.' },

      { id: 'dur-lt-15-min', label: 'Attacks <15 minutes' },
      { id: 'dur-15-to-180-min', label: 'Attacks 15 to 180 minutes', teachWhenSelected: '3.1 Cluster headache attack length.' },
      { id: 'dur-30min-to-7days', label: 'Attacks 30 minutes to 7 days', teachWhenSelected: '2.2 Episodic TTH attack length.' },
      { id: 'dur-4-to-72-hours', label: 'Attacks 4 to 72 hours (untreated)', teachWhenSelected: '1.1 Migraine criterion B: untreated or unsuccessfully treated.' },
      { id: 'dur-gt-72-hours', label: 'Attacks >72 hours' },
      { id: 'dur-continuous', label: 'Headache is continuous and unremitting', teachWhenSelected: '3.4 Hemicrania continua or 3.3 NDPH territory; episodic phenotypes will not apply.' },

      { id: 'onset-recurrent-same', label: 'Recurrent attacks with the same pattern' },
      { id: 'onset-new-within-3-months', label: 'New onset in the last 3 months' },
      { id: 'onset-abrupt-continuous-24h', label: 'Clearly-remembered onset that became continuous within 24 hours', teachWhenSelected: '4.10 NDPH criterion B: a distinct, clearly-remembered onset with pain becoming continuous and unremitting within 24 hours. This is the NDPH signature that distinguishes it from a gradually-evolving chronic daily headache.' },
      { id: 'onset-single-sudden', label: 'Single sudden episode (first-ever)', teachWhenSelected: 'Single sudden attacks need workup. See red flags below.' },
      // §4.7 Primary stabbing headache
      { id: 'onset-spontaneous-stab', label: 'Pain comes on spontaneously as a single stab or series of stabs', teachWhenSelected: 'ICHD-3 4.7 A: head pain occurring spontaneously as a single stab or series of stabs.' },
      { id: 'dur-stab-seconds', label: 'Each stab lasts up to a few seconds (usually 3 seconds or less)', teachWhenSelected: 'ICHD-3 4.7 B / Note 1: 80% of stabs last 3 seconds or less; rarely 10 to 120 seconds.' },
      { id: 'freq-stab-one-to-many-per-day', label: 'Stabs recur irregularly, from one to many per day', teachWhenSelected: 'ICHD-3 4.7 C: stabs recur with irregular frequency, one to many per day.' },
    ],
  },
  {
    id: 'pain-character',
    label: 'Pain character',
    eyebrow: 'Quality, location, severity, and activity-relation are the four discriminators in ICHD-3 1.1 C and 2.2 C.',
    chips: [
      { id: 'loc-unilateral', label: 'Unilateral location', teachWhenSelected: '1.1 C feature 1 (migraine) and 3.1 (cluster). 3.4 Hemicrania continua is strictly unilateral.' },
      { id: 'loc-bilateral', label: 'Bilateral location', teachWhenSelected: '2.2 C feature 1 (TTH).' },
      { id: 'loc-orbital-temporal', label: 'Orbital, supraorbital, or temporal location', teachWhenSelected: '3.1 Cluster criterion B location.' },

      { id: 'qual-pulsating', label: 'Throbbing or pulsating quality', teachWhenSelected: '1.1 C feature 2 (migraine).' },
      { id: 'qual-pressing-tightening', label: 'Pressing or tightening (non-pulsating)', teachWhenSelected: '2.2 C feature 2 (TTH).' },
      { id: 'qual-sharp-stabbing', label: 'Sharp or stabbing' },

      { id: 'sev-mild', label: 'Mild intensity', teachWhenSelected: '2.2 C feature 3 (TTH).' },
      { id: 'sev-moderate', label: 'Moderate intensity', teachWhenSelected: '1.1 C feature 3 (migraine) at moderate; 2.2 C feature 3 (TTH).' },
      { id: 'sev-severe', label: 'Severe intensity', teachWhenSelected: '1.1 C feature 3 (migraine) at severe; 3.1 B (cluster).' },
      { id: 'sev-very-severe', label: 'Very severe intensity', teachWhenSelected: '3.1 B Cluster: severe or very severe pain.' },

      { id: 'act-aggravated', label: 'Aggravated by or causing avoidance of routine activity', teachWhenSelected: '1.1 C feature 4 (migraine). Also satisfies 3.4 Hemicrania continua criterion C.2 (aggravation of pain by movement).' },
      { id: 'act-not-aggravated', label: 'Not aggravated by routine activity', teachWhenSelected: '2.2 C feature 4 (TTH).' },
    ],
  },
  {
    id: 'associated',
    label: 'Associated symptoms',
    eyebrow: 'ICHD-3 1.1 D requires nausea/vomiting OR (photophobia AND phonophobia). TTH excludes nausea/vomiting and allows ≤1 of photo/phono.',
    chips: [
      { id: 'sym-nausea-mild', label: 'Mild nausea during attacks', teachWhenSelected: 'Satisfies 1.1 D (migraine). Allowed in 2.3 Chronic TTH D (counts in the ≤1 of mild-nausea/photo/phono pool). Excludes 2.2 Episodic TTH D.' },
      { id: 'sym-nausea-moderate-severe', label: 'Moderate or severe nausea during attacks', teachWhenSelected: 'Satisfies 1.1 D (migraine). Excludes both 2.2 and 2.3 TTH D.' },
      { id: 'sym-vomiting', label: 'Vomiting during attacks', teachWhenSelected: 'Satisfies 1.1 D (migraine). Excludes TTH.' },
      { id: 'sym-photophobia', label: 'Bothered by light during attacks', teachWhenSelected: 'For migraine 1.1 D, photophobia AND phonophobia together satisfy criterion.' },
      { id: 'sym-phonophobia', label: 'Bothered by sound during attacks', teachWhenSelected: 'For migraine 1.1 D, paired with photophobia satisfies criterion.' },
      { id: 'sym-restlessness', label: 'Restlessness or agitation during attacks', teachWhenSelected: '3.1 Cluster criterion C alternative: restlessness OR autonomic features.' },
      { id: 'sym-autonomic-ipsilateral', label: 'Ipsilateral autonomic features (tearing, conjunctival injection, rhinorrhoea, ptosis, miosis, eyelid oedema, facial sweating)', teachWhenSelected: '3.1 Cluster and 3.4 Hemicrania continua criterion C.' },
    ],
  },
  {
    id: 'aura',
    label: 'Aura features',
    eyebrow: 'ICHD-3 1.2 requires aura B (≥1 reversible aura type) and C (≥3 of 6 characteristics).',
    defaultCollapsed: true,
    chips: [
      { id: 'aura-visual', label: 'Visual aura (scotoma, fortification, scintillation)' },
      { id: 'aura-sensory', label: 'Sensory aura (paraesthesia, numbness)' },
      { id: 'aura-speech', label: 'Speech or language aura (dysphasia)' },
      { id: 'aura-motor', label: 'Motor aura (weakness)', teachWhenSelected: 'Motor aura indicates 1.2.3 Hemiplegic migraine. Refer for genetic evaluation.' },
      { id: 'aura-brainstem', label: 'Brainstem aura (dysarthria, vertigo, tinnitus, diplopia, ataxia)' },
      { id: 'aura-retinal', label: 'Retinal aura (monocular visual symptoms)' },
      { id: 'aura-fully-reversible', label: 'Aura is fully reversible' },
      { id: 'aura-spread-ge-5min', label: 'Aura spreads gradually over ≥5 minutes' },
      { id: 'aura-each-5-to-60min', label: 'Each aura symptom lasts 5 to 60 minutes' },
      { id: 'aura-multi-symptoms-succession', label: 'Two or more aura symptoms occur in succession' },
      { id: 'aura-positive-symptoms', label: 'At least one positive (rather than purely negative) aura symptom' },
      { id: 'aura-headache-within-60min', label: 'Headache follows aura within 60 minutes' },
      // New chip: §1.2 C characteristic 4 — laterality of the aura symptom itself,
      // distinct from headache-pain location. Rewires auraCharacteristicCount off
      // loc-unilateral (2026-06-04, clinical condition 10 / aura-laterality fix).
      { id: 'aura-symptom-unilateral', label: 'At least one aura symptom is one-sided', teachWhenSelected: '§1.2 C characteristic 4: laterality of the aura itself (e.g. a one-sided visual or sensory disturbance), distinct from headache-pain location.' },
    ],
  },
  {
    id: 'vestibular',
    label: 'Vestibular features',
    eyebrow: 'Vestibular migraine (ICHD-3 Appendix A1.6.6) is research criteria. Treat as a possibility, not a primary classification.',
    defaultCollapsed: true,
    chips: [
      { id: 'vest-vertigo-migrainous', label: 'Vertigo episodes with migrainous symptoms (photophobia, phonophobia, visual aura)' },
      { id: 'vest-motion-sensitivity', label: 'Motion sensitivity between episodes' },
      // A1.6.6 quantitative gates added 2026-07-06 (A-M1) from the source-verified
      // §A1.6.6 criteria (Bárány/Lempert 2012, adopted verbatim into ICHD-3 2018).
      { id: 'vest-episodes-ge-5', label: 'At least 5 separate vertigo or dizziness episodes', teachWhenSelected: 'ICHD-3 A1.6.6 criterion A: at least five episodes, each fulfilling criteria C (intensity + duration) and D (migraine features).' },
      { id: 'vest-intensity-mod-severe', label: 'Vertigo is moderate (interferes with daily activity) or severe (stops daily activity)', teachWhenSelected: 'ICHD-3 A1.6.6 criterion C / Note 3: moderate = interferes with but does not prevent daily activities; severe = daily activities cannot be continued. Mild vertigo does not qualify.' },
      { id: 'vest-duration-5min-72h', label: 'Each vertigo episode lasts from 5 minutes to 72 hours', teachWhenSelected: 'ICHD-3 A1.6.6 criterion C / Note 4: episode duration 5 minutes to 72 hours (seconds-long recurrent attacks are summed as the total window during which they recur).' },
      { id: 'vest-migrainous-half', label: 'At least half of the vertigo episodes come with a migraine feature (a migraine-type headache with ≥2 typical features, both light and sound sensitivity together, or visual aura)', teachWhenSelected: 'ICHD-3 A1.6.6 criterion D: ≥50% of episodes accompanied by ≥1 of: migraine-type headache (≥2 of unilateral, pulsating, moderate/severe, activity-aggravated); photophobia AND phonophobia together; or visual aura.' },
      // A1.6.6 criterion B — established migraine history (suppress gate for VM;
      // substrate-defining). Added 2026-06-04.
      { id: 'migraine-history-established', label: 'Established current or past history of migraine (with or without aura)', teachWhenSelected: 'ICHD-3 A1.6.6 criterion B: vestibular migraine requires an established 1.1/1.2 migraine diagnosis; distinguishes it from BPPV, Menière, vestibular paroxysmia.' },
    ],
  },
  {
    id: 'indomethacin',
    label: 'Indomethacin response',
    eyebrow: 'Hemicrania continua (ICHD-3 3.4) requires absolute response to therapeutic-dose indomethacin. This is a suppress-gate, not contributory.',
    defaultCollapsed: true,
    chips: [
      { id: 'indo-not-tried', label: 'Indomethacin trial not yet done' },
      { id: 'indo-tried-complete', label: 'Therapeutic dose tried: complete response', teachWhenSelected: '3.4 Hemicrania continua criterion D met. Suppress-gate.' },
      { id: 'indo-tried-partial', label: 'Therapeutic dose tried: partial response', teachWhenSelected: 'Does not satisfy 3.4 D (absolute response required).' },
      { id: 'indo-tried-no-response', label: 'Therapeutic dose tried: no response', teachWhenSelected: 'Rules out 3.4 Hemicrania continua.' },
    ],
  },
  {
    id: 'red-flags',
    label: 'Red flags (SNNOOP10)',
    eyebrow: 'Any red flag prompts secondary-headache workup before any primary-headache phenotype is assigned (Do et al. Neurology 2019).',
    defaultCollapsed: true,
    chips: [
      { id: 'rf-systemic', label: 'Systemic features (fever, weight loss)' },
      { id: 'rf-neoplasm', label: 'History of neoplasm' },
      { id: 'rf-neuro-deficit', label: 'Focal neurologic deficit, altered mental status, or seizure' },
      { id: 'rf-onset-sudden', label: 'Sudden or thunderclap onset' },
      { id: 'rf-older-age-onset', label: 'New headache onset after age 50' },
      { id: 'rf-pattern-change', label: 'Recent pattern change or new headache type' },
      { id: 'rf-positional', label: 'Positional headache (worse standing or supine)' },
      { id: 'rf-valsalva', label: 'Precipitated by Valsalva (cough, sneeze, exercise)' },
      { id: 'rf-papilloedema', label: 'Papilloedema on exam' },
      { id: 'rf-progressive', label: 'Progressive or atypical course' },
      { id: 'rf-pregnancy', label: 'Pregnancy or puerperium' },
      { id: 'rf-painful-eye-autonomic', label: 'Painful eye with autonomic features' },
      { id: 'rf-posttraumatic', label: 'Posttraumatic onset' },
      { id: 'rf-immune-pathology', label: 'Immune-system pathology (HIV, immunosuppression)' },
      { id: 'rf-painkiller-overuse', label: 'Painkiller overuse or new drug at onset' },
    ],
  },
  {
    // Added 2026-05-25 per medsci audit + architect §17.1 condition 4.
    // TAC-specific duration / frequency chips collapsed by default so they
    // do not bloat the resting picker for typical migraine-or-TTH patients.
    id: 'tac-detail',
    label: 'TAC detail',
    eyebrow: 'Trigeminal autonomic cephalalgia (TAC) specifics: open when the patient may have paroxysmal hemicrania, SUNCT/SUNA, or related short-attack disorders.',
    defaultCollapsed: true,
    chips: [
      { id: 'attacks-ge-20', label: '20 or more lifetime attacks', teachWhenSelected: 'ICHD-3 §3.2 A (paroxysmal hemicrania) and §3.3 A (SUNCT/SUNA) both require ≥20 attacks.' },
      { id: 'dur-2-to-30-min', label: 'Attacks 2 to 30 minutes', teachWhenSelected: '§3.2 Paroxysmal hemicrania attack duration window.' },
      { id: 'dur-1-to-600-sec', label: 'Attacks 1 to 600 seconds', teachWhenSelected: '§3.3 SUNCT/SUNA attack duration window. Very short.' },
      { id: 'freq-gt-5-per-day', label: 'More than 5 attacks per day (most days)', teachWhenSelected: '§3.2 Paroxysmal hemicrania frequency criterion D.' },
      { id: 'freq-ge-1-per-day', label: '1 or more attacks per day', teachWhenSelected: '§3.3 SUNCT/SUNA frequency criterion D.' },
    ],
  },
  {
    // Chronic migraine §1.3 — features-day frequency + triptan-response gate
    id: 'chronic-migraine-detail',
    label: 'Chronic migraine detail',
    eyebrow: 'Open when the patient has ≥15 headache days/month and you suspect chronic migraine (ICHD-3 §1.3).',
    defaultCollapsed: true,
    chips: [
      { id: 'migraine-features-ge-8-per-month', label: '≥8 days/month meet migraine criteria', teachWhenSelected: '§1.3 C.1: ≥8 days/month fulfill 1.1 B-D or 1.2 B-C.' },
      { id: 'triptan-response-positive', label: 'Headache relieved by triptan or ergot', teachWhenSelected: '§1.3 C.3: patient-reported triptan/ergot relief satisfies the migraine-day criterion.' },
    ],
  },
];

// ─── Red-flag set (used by the short-circuit logic) ───────────────────────

export const RED_FLAG_CHIPS: Set<ChipId> = new Set<ChipId>([
  'rf-systemic', 'rf-neoplasm', 'rf-neuro-deficit', 'rf-onset-sudden',
  'rf-older-age-onset', 'rf-pattern-change', 'rf-positional', 'rf-valsalva',
  'rf-papilloedema', 'rf-progressive', 'rf-pregnancy', 'rf-painful-eye-autonomic',
  'rf-posttraumatic', 'rf-immune-pathology', 'rf-painkiller-overuse',
]);

export function anyRedFlagActive(selected: Set<ChipId>): boolean {
  for (const id of RED_FLAG_CHIPS) if (selected.has(id)) return true;
  return false;
}

// ─── Phenotypes (ICHD-3 criteria encoded as evaluators) ───────────────────

const MIGRAINE_C_CHARACTER: ChipId[] = ['loc-unilateral', 'qual-pulsating', 'sev-moderate', 'sev-severe', 'act-aggravated'];
// 1.1 C: ≥2 of (unilateral, pulsating, mod-severe, aggravated). Treat
// sev-moderate OR sev-severe as the same feature (mod-or-severe = 1 count).
const migraineCharacterCount = (s: Set<ChipId>): number => {
  let n = 0;
  if (has(s, 'loc-unilateral')) n++;
  if (has(s, 'qual-pulsating')) n++;
  if (has(s, 'sev-moderate') || has(s, 'sev-severe')) n++;
  if (has(s, 'act-aggravated')) n++;
  return n;
};

const TTH_C_CHARACTER = (s: Set<ChipId>): number => {
  let n = 0;
  if (has(s, 'loc-bilateral')) n++;
  if (has(s, 'qual-pressing-tightening')) n++;
  if (has(s, 'sev-mild') || has(s, 'sev-moderate')) n++;
  if (has(s, 'act-not-aggravated')) n++;
  return n;
};

// auraCharacteristicCount — the six §1.2 C characteristics:
// 1. spread gradually ≥5 min → aura-spread-ge-5min
// 2. ≥2 symptoms in succession → aura-multi-symptoms-succession
// 3. each symptom 5–60 min → aura-each-5-to-60min
// 4. at least one aura symptom is UNILATERAL → aura-symptom-unilateral
//    (was loc-unilateral — wrong chip, pain laterality; fixed 2026-06-04
//     clinical condition 10; the aura characteristic is a property of the
//     aura symptom itself, not the headache location. ICHD-3 §1.2 C item 4.)
// 5. ≥1 positive symptom → aura-positive-symptoms
// 6. headache within 60 min → aura-headache-within-60min
const auraCharacteristicCount = (s: Set<ChipId>): number =>
  countOf(s, [
    'aura-spread-ge-5min',
    'aura-multi-symptoms-succession',
    'aura-each-5-to-60min',
    'aura-positive-symptoms',
    'aura-headache-within-60min',
  ]) + (has(s, 'aura-symptom-unilateral') ? 1 : 0);

// ─── Minimum-evidence floors (display-suppression thresholds) ──────────────
//
// These are NOT claimed ICHD-3 criteria. They are display-suppression guards
// that prevent a feature-only phenotype surfacing off one incidental chip.
// Required per clinical-reviewer §17.2 conditions 1 + 2 + 7 (mandatory for
// §1.1, §2.2, §3.1 which have no natural suppress-gate criterion).
//
// The strengthened dev-time invariant (eval loop §H) accepts these floors as
// the suppression path for the three affected phenotypes.

/**
 * §1.1 migraine floor: surface only if ≥2 migraine-pointing chips incl. ≥1 §1.1 C feature.
 * Migraine-pointing = C features ∪ D symptoms. ≥1 C feature required so that
 * two associated-symptom chips alone (e.g. nausea + phonophobia, the TTH-overlap zone)
 * do not surface a "Probable migraine."
 */
const MIGRAINE_C_CHIPS: ChipId[] = ['loc-unilateral', 'qual-pulsating', 'sev-moderate', 'sev-severe', 'act-aggravated'];
const MIGRAINE_D_CHIPS: ChipId[] = ['sym-nausea-mild', 'sym-nausea-moderate-severe', 'sym-vomiting', 'sym-photophobia', 'sym-phonophobia'];
function migraineEvidenceFloor(selected: Set<ChipId>): boolean {
  const cCount = countOf(selected, MIGRAINE_C_CHIPS);
  if (cCount === 0) return false; // need ≥1 C feature
  const dCount = countOf(selected, MIGRAINE_D_CHIPS);
  return (cCount + dCount) >= 2; // ≥2 migraine-pointing total, incl. ≥1 C
}

/**
 * §2.2 episodic TTH floor: surface only if ≥2 TTH-pointing chips incl. ≥1 §2.2 C feature.
 * Required per clinical-reviewer condition 2 (upgraded from recommended to mandatory).
 */
const TTH_C_CHIPS: ChipId[] = ['loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'sev-moderate', 'act-not-aggravated'];
function tthEvidenceFloor(selected: Set<ChipId>): boolean {
  const cCount = countOf(selected, TTH_C_CHIPS);
  if (cCount === 0) return false; // need ≥1 C feature
  // Count ALL tth-A/B/C contributing chips that are positive to allow
  // a B-criterion chip (dur-30min-to-7days) + a C chip to satisfy the floor.
  const allTthChips: ChipId[] = [
    ...TTH_C_CHIPS,
    'attacks-gt-10', 'freq-1-4-per-month', 'freq-5-14-per-month', 'pattern-ge-3-months', 'dur-30min-to-7days',
  ];
  const total = countOf(selected, allTthChips);
  return total >= 2; // ≥2 total, incl. ≥1 C
}

/**
 * §3.1 cluster floor: surface only if ≥2 cluster-pointing chips incl. ≥1 §3.1 C defining feature.
 * §3.1 C defining features = the distinguishing unilateral-orbital-severe-short constellation
 * encoded by cluster-B + cluster-C chips. Required per clinical-reviewer condition 1.
 * Constructed mechanically from the chips already referenced by the §3.1 phenotype criteria.
 */
const CLUSTER_C_DEFINING_CHIPS: ChipId[] = ['loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'sev-very-severe', 'dur-15-to-180-min'];
const CLUSTER_ALL_CHIPS: ChipId[] = [
  ...CLUSTER_C_DEFINING_CHIPS,
  'sym-autonomic-ipsilateral', 'sym-restlessness',
  'attacks-5-to-10', 'attacks-gt-10', 'freq-cluster-bout',
];
function clusterEvidenceFloor(selected: Set<ChipId>): boolean {
  const cDefCount = countOf(selected, CLUSTER_C_DEFINING_CHIPS);
  if (cDefCount === 0) return false; // need ≥1 defining feature
  const total = countOf(selected, CLUSTER_ALL_CHIPS);
  return total >= 2; // ≥2 total, incl. ≥1 defining
}

export const HEADACHE_PHENOTYPES: Phenotype[] = [
  // ─── 1.1 Migraine without aura ──────────────────────────────────────────
  {
    id: 'migraine-without-aura',
    name: 'Migraine without aura',
    ichd3Section: 'ICHD-3 §1.1',
    teachPearl:
      'Migraine without aura is the most common migraine phenotype. The four character features (unilateral, pulsating, moderate-severe, aggravated by activity) reflect activation of the trigeminovascular system; ≥2 are required, not all 4. Photophobia and phonophobia together count as one criterion, equivalent to nausea/vomiting in criterion D.',
    pitfalls: [
      'Migraine and TTH overlap heavily in mild attacks. The discriminator is nausea/vomiting (any) OR the photophobia+phonophobia pair: both satisfy migraine 1.1 D; TTH 2.2 D excludes nausea/vomiting and allows at most one of photo/phono.',
      'Bilateral pressing headache can still be migraine if it carries nausea or the photo+phono pair. Do not exclude migraine on bilateral location alone.',
    ],
    criteria: [
      // mig-A: scorable. §1.5.1 Probable migraine explicitly covers <5 attacks;
      // gating it would close the §1.5 path. Its miss simply lowers the fraction.
      { id: 'mig-A', label: 'At least 5 lifetime attacks', description: 'ICHD-3 1.1 A: diagnosis requires ≥5 attacks fulfilling B–D.', evaluate: s => has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10'), contributingChips: ['attacks-5-to-10', 'attacks-gt-10'], role: 'scorable' },
      // mig-B: demote-gate. §1.1 B is one of the A–D criteria §1.5 says you may miss
      // exactly one of. A patient missing only duration is textbook §1.5.1.
      // Feature/window not-yet-confirmed → demote (was definitional:true).
      { id: 'mig-B', label: 'Duration 4 to 72 hours (untreated)', description: 'ICHD-3 1.1 B: duration 4–72 h untreated or unsuccessfully treated.', evaluate: s => has(s, 'dur-4-to-72-hours'), contributingChips: ['dur-4-to-72-hours'], role: 'demote-gate' },
      // mig-C: scorable. Graded count (≥2 of 4); §1.5 tolerates its miss.
      { id: 'mig-C', label: '≥2 of: unilateral, pulsating, moderate/severe, aggravated by activity', description: 'ICHD-3 1.1 C: ≥2 of 4 character features.', evaluate: s => migraineCharacterCount(s) >= 2, contributingChips: MIGRAINE_C_CHARACTER, role: 'scorable' },
      // mig-D: demote-gate. §1.1 D is an A–D criterion; §1.5 covers its single miss.
      // Associated-symptom window not-yet-confirmed → demote (was definitional:true).
      { id: 'mig-D', label: 'Nausea/vomiting OR (photophobia AND phonophobia)', description: 'ICHD-3 1.1 D: ≥1 of: nausea and/or vomiting; photophobia AND phonophobia together.', evaluate: s => has(s, 'sym-nausea-mild') || has(s, 'sym-nausea-moderate-severe') || has(s, 'sym-vomiting') || (has(s, 'sym-photophobia') && has(s, 'sym-phonophobia')), contributingChips: ['sym-nausea-mild', 'sym-nausea-moderate-severe', 'sym-vomiting', 'sym-photophobia', 'sym-phonophobia'], role: 'demote-gate' },
    ],
    // Suppression path: migraineEvidenceFloor (§1.1 minimum-evidence floor).
    // §1.1 has no suppress-gate criterion because mig-B + mig-D both demote.
    // The floor is the faithful suppression mechanism (not a claimed ICHD-3
    // criterion). Accepted by the dev-time invariant as the §1.1 suppression path.
  },

  // ─── 1.2 Migraine with aura ─────────────────────────────────────────────
  {
    id: 'migraine-with-aura',
    name: 'Migraine with aura',
    ichd3Section: 'ICHD-3 §1.2',
    teachPearl:
      'Aura is a focal cortical event, usually visual, lasting 5 to 60 minutes per symptom. Criterion C requires ≥3 of 6 aura characteristics; the 6th is "at least one aura symptom is unilateral" (the aura symptom, not headache-pain location), surfaced via the aura-symptom-unilateral chip.',
    pitfalls: [
      'Motor aura suggests 1.2.3 Hemiplegic migraine, distinct entity, genetic evaluation indicated.',
      'Brainstem aura requires ≥2 brainstem symptoms simultaneously (dysarthria, vertigo, tinnitus, diplopia, ataxia, decreased consciousness).',
    ],
    criteria: [
      // aura-A: scorable. §1.2 A is one of A–C; §1.5.2 covers its single miss.
      // Rewired 2026-06-04: drops attacks-lt-5 (includes 1-attack patients), adds
      // attacks-ge-2 to express "≥2 attacks" correctly. (medsci spec §4b)
      { id: 'aura-A', label: 'At least 2 attacks fulfilling B and C', description: 'ICHD-3 1.2 A: ≥2 attacks of aura.', evaluate: s => has(s, 'attacks-ge-2') || has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10'), contributingChips: ['attacks-ge-2', 'attacks-5-to-10', 'attacks-gt-10'], role: 'scorable' },
      // aura-B: suppress-gate (DROP on failure). Aura is the SUBSTRATE of
      // "migraine with aura." No aura symptom at all = not an aura disorder.
      // Substrate-absence → suppress silently.
      { id: 'aura-B', label: '≥1 fully reversible aura symptom (visual, sensory, speech, motor, brainstem, or retinal)', description: 'ICHD-3 1.2 B: one or more fully reversible aura symptoms.', evaluate: s => hasAny(s, ['aura-visual', 'aura-sensory', 'aura-speech', 'aura-motor', 'aura-brainstem', 'aura-retinal']) && has(s, 'aura-fully-reversible'), contributingChips: ['aura-visual', 'aura-sensory', 'aura-speech', 'aura-motor', 'aura-brainstem', 'aura-retinal', 'aura-fully-reversible'], role: 'suppress-gate' },
      // aura-C: scorable. Graded count (≥3 of 6); §1.5.2 tolerates single miss.
      // contributingChips updated: aura-symptom-unilateral replaces loc-unilateral
      // for characteristic 4 (aura-laterality fix, 2026-06-04).
      { id: 'aura-C', label: '≥3 of 6 aura characteristics', description: 'ICHD-3 1.2 C: at least 3 of: spreading ≥5 min, ≥2 symptoms in succession, each 5–60 min, at least one aura symptom is unilateral, positive features, headache within 60 min.', evaluate: s => auraCharacteristicCount(s) >= 3, contributingChips: ['aura-spread-ge-5min', 'aura-multi-symptoms-succession', 'aura-each-5-to-60min', 'aura-positive-symptoms', 'aura-headache-within-60min', 'aura-symptom-unilateral'], role: 'scorable' },
    ],
  },

  // ─── 2.2 Frequent episodic TTH ──────────────────────────────────────────
  {
    id: 'episodic-tth',
    name: 'Frequent episodic tension-type headache',
    ichd3Section: 'ICHD-3 §2.2',
    teachPearl:
      'TTH attacks are pressing or tightening, bilateral, mild to moderate, and NOT aggravated by routine activity, the inverse of migraine on most features. The diagnostic discriminator from migraine is criterion D: TTH has no nausea/vomiting and at most one of photophobia or phonophobia.',
    pitfalls: [
      'A patient can carry 1.1 Migraine and 2.2 TTH concurrently. ICHD-3 General Principles allows multiple primary diagnoses. Treat each separately.',
    ],
    criteria: [
      // tth-A: scorable. §2.4.1 Probable episodic TTH covers its single miss.
      { id: 'tth-A', label: '≥10 episodes on 1–14 days/month for >3 months', description: 'ICHD-3 2.2 A: ≥10 episodes on 1–14 days/month, pattern ≥3 months.', evaluate: s => (has(s, 'attacks-gt-10')) && (has(s, 'freq-1-4-per-month') || has(s, 'freq-5-14-per-month')) && has(s, 'pattern-ge-3-months'), contributingChips: ['attacks-gt-10', 'freq-1-4-per-month', 'freq-5-14-per-month', 'pattern-ge-3-months'], role: 'scorable' },
      // tth-B: demote-gate. §2.2 B is an A–D criterion; §2.4 covers single miss.
      // Feature/window not-yet-confirmed → demote (was definitional:true).
      { id: 'tth-B', label: 'Duration 30 minutes to 7 days', description: 'ICHD-3 2.2 B: attack duration 30 min to 7 days.', evaluate: s => has(s, 'dur-30min-to-7days'), contributingChips: ['dur-30min-to-7days'], role: 'demote-gate' },
      // tth-C: scorable. Graded count (≥2 of 4); §2.4 tolerates single miss.
      { id: 'tth-C', label: '≥2 of: bilateral, pressing/tightening, mild-moderate, NOT aggravated', description: 'ICHD-3 2.2 C: ≥2 of 4 character features.', evaluate: s => TTH_C_CHARACTER(s) >= 2, contributingChips: ['loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'sev-moderate', 'act-not-aggravated'], role: 'scorable' },
      // tth-D: suppress-gate (EMIT on failure). Exclusion criterion. Its failure
      // is positive evidence for a DIFFERENT phenotype: nausea/vomiting is
      // migraine-defining (§1.1 D). Suppresses with definitionallyExcluded:true
      // so the result screen can surface "considered and set aside — nausea/
      // vomiting present." The hasPositiveEvidence floor prevents empty-input match.
      { id: 'tth-D', label: 'No nausea/vomiting; ≤1 of photophobia or phonophobia', description: 'ICHD-3 2.2 D: exclude nausea/vomiting and allow at most one of photo/phono.', evaluate: s => !has(s, 'sym-nausea-mild') && !has(s, 'sym-nausea-moderate-severe') && !has(s, 'sym-vomiting') && countOf(s, ['sym-photophobia', 'sym-phonophobia']) <= 1, contributingChips: ['sym-nausea-mild', 'sym-nausea-moderate-severe', 'sym-vomiting', 'sym-photophobia', 'sym-phonophobia'], role: 'suppress-gate' },
    ],
    // Suppression path: tth-D (suppress-gate) + tthEvidenceFloor.
  },

  // ─── 2.3 Chronic TTH ────────────────────────────────────────────────────
  {
    id: 'chronic-tth',
    name: 'Chronic tension-type headache',
    ichd3Section: 'ICHD-3 §2.3',
    teachPearl:
      'Chronic TTH is the chronic counterpart to 2.2: ≥15 days/month, pattern ≥3 months, with the same B–D character features. Chronic TTH allows mild nausea OR a single photo/phono symptom but not moderate-severe nausea or vomiting.',
    criteria: [
      // ctth-A: suppress-gate (DROP). Chronicity threshold. A sub-15-day patient
      // is episodic, a different entity — not "probable chronic TTH." §2.4 Probable
      // TTH exists but a sub-chronic frequency is a different band, not a missed
      // feature. Suppress silently.
      { id: 'ctth-A', label: '≥15 headache days/month for >3 months', description: 'ICHD-3 2.3 A: headache on ≥15 days/month, pattern ≥3 months.', evaluate: s => has(s, 'freq-ge-15-per-month') && has(s, 'pattern-ge-3-months'), contributingChips: ['freq-ge-15-per-month', 'pattern-ge-3-months'], role: 'suppress-gate' },
      // ctth-B: demote-gate. §2.3 B is a duration criterion; §2.4 covers single miss.
      // Feature/window not-yet-confirmed → demote (was definitional:true).
      { id: 'ctth-B', label: 'Hours to continuous, or unremitting', description: 'ICHD-3 2.3 B: attack duration hours to days, or unremitting.', evaluate: s => has(s, 'dur-30min-to-7days') || has(s, 'dur-gt-72-hours') || has(s, 'dur-continuous'), contributingChips: ['dur-30min-to-7days', 'dur-gt-72-hours', 'dur-continuous'], role: 'demote-gate' },
      // ctth-C: scorable. Graded count; §2.4 tolerates single miss.
      { id: 'ctth-C', label: '≥2 of: bilateral, pressing/tightening, mild-moderate, NOT aggravated', description: 'ICHD-3 2.3 C: same as 2.2 C.', evaluate: s => TTH_C_CHARACTER(s) >= 2, contributingChips: ['loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'sev-moderate', 'act-not-aggravated'], role: 'scorable' },
      // ctth-D: suppress-gate (EMIT on failure). Exclusion criterion. Failure
      // (moderate/severe nausea or vomiting) is positive evidence for migraine
      // (§1.1 D / chronic migraine §1.3). Same emit-set logic as tth-D.
      // ctth-D verbatim ICHD-3 §2.3 D fix (clinical-reviewer 2026-05-25 §17.2 Condition 5):
      // "Both of the following: 1) no more than one of photophobia, phonophobia or mild nausea;
      // 2) neither moderate or severe nausea nor vomiting."
      { id: 'ctth-D', label: '≤1 of {mild nausea, photophobia, phonophobia}; no moderate/severe nausea; no vomiting', description: 'ICHD-3 2.3 D: both: (1) no more than one of photophobia, phonophobia or mild nausea; (2) neither moderate or severe nausea nor vomiting.', evaluate: s => !has(s, 'sym-nausea-moderate-severe') && !has(s, 'sym-vomiting') && countOf(s, ['sym-nausea-mild', 'sym-photophobia', 'sym-phonophobia']) <= 1, contributingChips: ['sym-nausea-mild', 'sym-nausea-moderate-severe', 'sym-vomiting', 'sym-photophobia', 'sym-phonophobia'], role: 'suppress-gate' },
    ],
  },

  // ─── 3.1 Cluster headache ───────────────────────────────────────────────
  {
    id: 'cluster-headache',
    name: 'Cluster headache',
    ichd3Section: 'ICHD-3 §3.1',
    teachPearl:
      'Cluster headache (3.1) presents as severe unilateral orbital, supraorbital, or temporal pain, 15 to 180 minutes, with ipsilateral autonomic features and/or restlessness, attacking in bouts. Imaging studies (May et al. Lancet 1998) implicate hypothalamic activation and the trigeminal-autonomic reflex. Memorise: severe + unilateral orbital + autonomic + short attacks + bouts.',
    pitfalls: [
      'A patient pacing during a severe unilateral orbital headache is the bedside signature. Migraine patients lie still; cluster patients cannot.',
      'Frequency criterion (1 every other day to 8/day) only applies during active bouts. Patients are pain-free between bouts.',
    ],
    criteria: [
      // cluster-A: scorable. §3.5.1 Probable cluster covers attack-count shortfall.
      { id: 'cluster-A', label: 'At least 5 attacks', description: 'ICHD-3 3.1 A: ≥5 attacks fulfilling B–D.', evaluate: s => has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10'), contributingChips: ['attacks-5-to-10', 'attacks-gt-10'], role: 'scorable' },
      // cluster-B: demote-gate. §3.1 B is an A–D criterion; §3.5.1 covers single miss.
      // The between-bouts clinic use case: patient cannot confirm 15–180 min right now.
      // Feature/window not-yet-confirmed → demote (was definitional:true).
      { id: 'cluster-B', label: 'Severe/very severe unilateral orbital, supraorbital, or temporal pain lasting 15–180 minutes', description: 'ICHD-3 3.1 B: severe-very severe unilateral orbital/supraorbital/temporal, 15–180 min untreated.', evaluate: s => has(s, 'loc-unilateral') && has(s, 'loc-orbital-temporal') && (has(s, 'sev-severe') || has(s, 'sev-very-severe')) && has(s, 'dur-15-to-180-min'), contributingChips: ['loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'sev-very-severe', 'dur-15-to-180-min'], role: 'demote-gate' },
      // cluster-C: demote-gate. §3.1 C is an A–D criterion; §3.5.1 covers single miss.
      // A between-bouts patient may simply not have reported autonomic features yet.
      // Failure is NOT positive evidence for another phenotype → demote (was definitional:true).
      // Clinical-reviewer §17.2 condition 1 confirms this is demote, not suppress.
      { id: 'cluster-C', label: 'Ipsilateral autonomic features OR restlessness/agitation', description: 'ICHD-3 3.1 C: either or both of ipsilateral cranial autonomic symptoms; restlessness/agitation.', evaluate: s => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness'), contributingChips: ['sym-autonomic-ipsilateral', 'sym-restlessness'], role: 'demote-gate' },
      // cluster-D: scorable. Already intentionally non-gating: between-bouts
      // encounters cannot surface bout-frequency via chips.
      { id: 'cluster-D', label: 'Frequency 1 every other day to 8/day during bouts', description: 'ICHD-3 3.1 D: frequency 1 every other day to 8/day during active periods.', evaluate: s => has(s, 'freq-cluster-bout'), contributingChips: ['freq-cluster-bout'], role: 'scorable' },
    ],
    // Suppression path: clusterEvidenceFloor (§3.1 minimum-evidence floor).
    // §3.1 has no suppress-gate criterion because cluster-B/C both demote.
    // The floor is the faithful suppression mechanism.
  },

  // ─── 3.4 Hemicrania continua ────────────────────────────────────────────
  // Hidden until indomethacin response is entered, because the response is
  // a suppress-gate (absent confirmatory test), not contributory.
  {
    id: 'hemicrania-continua',
    name: 'Hemicrania continua',
    ichd3Section: 'ICHD-3 §3.4',
    hiddenUntilTrial: { gateChip: 'indo-tried-complete' },
    teachPearl:
      'Hemicrania continua is a continuous, strictly unilateral headache with exacerbations, ipsilateral autonomic features or restlessness, and ABSOLUTE response to therapeutic indomethacin. The indomethacin response is the diagnostic test. Without it, the diagnosis cannot be made (Goadsby Continuum 2024).',
    criteria: [
      // hc-A: suppress-gate (DROP). Substrate + laterality + chronicity combined.
      // Non-unilateral or non-continuous headache is a different entity.
      { id: 'hc-A', label: 'Continuous strictly unilateral headache present >3 months', description: 'ICHD-3 3.4 A: unilateral continuous headache, >3 months.', evaluate: s => has(s, 'loc-unilateral') && has(s, 'dur-continuous') && has(s, 'pattern-ge-3-months'), contributingChips: ['loc-unilateral', 'dur-continuous', 'pattern-ge-3-months'], role: 'suppress-gate' },
      // hc-B: scorable. Already non-gating. §3.5.4 covers single miss.
      { id: 'hc-B', label: 'Exacerbations of moderate or greater intensity', description: 'ICHD-3 3.4 B: exacerbations of moderate or greater intensity.', evaluate: s => has(s, 'sev-moderate') || has(s, 'sev-severe'), contributingChips: ['sev-moderate', 'sev-severe'], role: 'scorable' },
      // hc-C: demote-gate. §3.4 C is an A–D criterion; §3.5.4 covers single miss.
      // Not positive evidence for another phenotype → demote (was definitional:true).
      // Clinical-reviewer §17.2 confirms demote is correct for autonomic/restlessness.
      // 2026-07-06 fix (A-m6): §3.4 C.2 is "restlessness/agitation OR aggravation of
      // pain by movement." The label/description already promised the movement clause;
      // now the logic honors it via the existing `act-aggravated` chip (surfaced as
      // "Makes it worse, or makes them avoid activity"). Regression-safe: the other HC
      // gates (hc-A unilateral+continuous+>3mo, hc-D indomethacin) prevent any migraine
      // patient who ticked `act-aggravated` from spuriously matching HC.
      { id: 'hc-C', label: 'Ipsilateral autonomic features OR restlessness/movement aggravation', description: 'ICHD-3 3.4 C: ipsilateral cranial autonomic symptoms and/or restlessness or aggravation by movement.', evaluate: s => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness') || has(s, 'act-aggravated'), contributingChips: ['sym-autonomic-ipsilateral', 'sym-restlessness', 'act-aggravated'], role: 'demote-gate' },
      // hc-D: suppress-gate (DROP via the gate). Absent confirmatory test, double-
      // enforced by hiddenUntilTrial gate. Both checks are idempotent (arch §17.1).
      { id: 'hc-D', label: 'Absolute response to therapeutic-dose indomethacin', description: 'ICHD-3 3.4 D: suppress-gate. Complete indomethacin response is required.', evaluate: s => has(s, 'indo-tried-complete'), contributingChips: ['indo-tried-complete'], role: 'suppress-gate' },
    ],
  },

  // ─── 4.10 NDPH ──────────────────────────────────────────────────────────
  // ICHD-3 places NDPH at §4.10 (Other primary headache disorders), NOT §3.3.
  // §3.3 in ICHD-3 is SUNCT/SUNA. Section relabel per medsci audit + clinical-
  // reviewer §17.2 Condition 5 (2026-05-25).
  {
    id: 'ndph',
    name: 'New daily persistent headache',
    ichd3Section: 'ICHD-3 §4.10',
    teachPearl:
      'NDPH is defined by the patient being able to pinpoint the moment the headache began and it never resolving since. Onset to continuous and unremitting must occur within 24 hours, and the pattern must persist >3 months. NDPH is a diagnosis of exclusion. Workup for secondary causes is mandatory.',
    criteria: [
      // ndph-A: suppress-gate (DROP). Substrate + chronicity. Non-continuous or
      // <3-month headache is not NDPH by definition.
      { id: 'ndph-A', label: 'Persistent headache >3 months', description: 'ICHD-3 4.10 A: persistent headache, >3 months.', evaluate: s => has(s, 'dur-continuous') && has(s, 'pattern-ge-3-months'), contributingChips: ['dur-continuous', 'pattern-ge-3-months'], role: 'suppress-gate' },
      // ndph-B: suppress-gate (DROP). The diagnostic signature of NDPH. §4.10 has
      // NO §X.5 Probable counterpart in ICHD-3, so a single miss has no Probable
      // home — must suppress, not demote.
      // 2026-05-27 fix: onset-single-sudden dropped (thunderclap, not NDPH onset).
      // 2026-07-06 fix (A-M3): ndph-B now requires the actual §4.10 B signature
      // (clearly-remembered onset becoming continuous within 24h) via
      // `onset-abrupt-continuous-24h`, not mere recency (`onset-new-within-3-months`).
      // Recency alone over-called NDPH against any long-standing continuous headache.
      { id: 'ndph-B', label: 'Distinct, clearly-remembered onset; becomes continuous and unremitting within 24 hours', description: 'ICHD-3 4.10 B: distinct and clearly-remembered onset, with pain becoming continuous and unremitting within 24 hours. Confirm with patient that they can pinpoint the exact day or hour of onset.', evaluate: s => has(s, 'onset-abrupt-continuous-24h'), contributingChips: ['onset-abrupt-continuous-24h'], role: 'suppress-gate' },
    ],
  },

  // ─── 4.7 Primary stabbing headache ───────────────────────────────────────
  // ICHD-3 §4.7 (with §4.7.1 Probable). Flat additive phenotype, encoded
  // 2026-07-06 from the source-verified evidence packet (ICHD-3 PDF p. 53-54).
  // Key discriminator: NO cranial autonomic symptoms (criterion D) — their
  // presence steers to §3.3 SUNCT/SUNA, so psh-D is an EMIT suppress-gate
  // ("considered and set aside") rather than a silent drop.
  {
    id: 'primary-stabbing-headache',
    name: 'Primary stabbing headache',
    ichd3Section: 'ICHD-3 §4.7',
    teachPearl:
      'Primary stabbing headache ("ice-pick" pains) is brief, spontaneous stabs lasting up to a few seconds (80% are 3 seconds or less), recurring irregularly from one to many per day, with NO cranial autonomic symptoms. Absence of autonomic features is the key discriminator from 3.3 SUNCT/SUNA. It is more common in people with migraine, where stabs localize to the habitual migraine site. Strictly localized stabs warrant excluding a structural lesion of the affected cranial nerve.',
    criteria: [
      // psh-A: suppress-gate (DROP). Substrate — spontaneous stab(s) of stabbing quality.
      { id: 'psh-A', label: 'Spontaneous single stab or series of stabs', description: 'ICHD-3 4.7 A: head pain occurring spontaneously as a single stab or series of stabs, fulfilling B and C.', evaluate: s => has(s, 'onset-spontaneous-stab') && has(s, 'qual-sharp-stabbing'), contributingChips: ['onset-spontaneous-stab', 'qual-sharp-stabbing'], role: 'suppress-gate' },
      // psh-B: demote-gate. §4.7.1 Probable ("two only of three") covers a single miss.
      { id: 'psh-B', label: 'Each stab lasts up to a few seconds', description: 'ICHD-3 4.7 B: each stab lasts for up to a few seconds (80% are 3 seconds or less).', evaluate: s => has(s, 'dur-stab-seconds'), contributingChips: ['dur-stab-seconds'], role: 'demote-gate' },
      // psh-C: demote-gate. §4.7.1 Probable covers a single miss.
      { id: 'psh-C', label: 'Stabs recur irregularly, one to many per day', description: 'ICHD-3 4.7 C: stabs recur with irregular frequency, from one to many per day.', evaluate: s => has(s, 'freq-stab-one-to-many-per-day'), contributingChips: ['freq-stab-one-to-many-per-day'], role: 'demote-gate' },
      // psh-D: suppress-gate (EMIT). Exclusion — cranial autonomic symptoms present is
      // positive evidence for §3.3 SUNCT/SUNA; surface "considered and set aside."
      { id: 'psh-D', label: 'No cranial autonomic symptoms', description: 'ICHD-3 4.7 D: no cranial autonomic symptoms. Their presence differentiates 3.3 SUNCT/SUNA from primary stabbing headache.', evaluate: s => !has(s, 'sym-autonomic-ipsilateral'), contributingChips: ['sym-autonomic-ipsilateral'], role: 'suppress-gate' },
    ],
  },

  // ─── A1.6.6 Vestibular migraine (appendix entity) ────────────────────────
  // ICHD-3 places Vestibular migraine at §A1.6.6 (§A1.6.5 is Alternating
  // hemiplegia of childhood). 2026-07-06 (A-M1): the Bárány/Lempert 2012
  // criteria, adopted verbatim into ICHD-3 2018 §A1.6.6, are now fully encoded
  // from the source-verified evidence packet. All four core criteria are
  // suppress-gates (A ≥5 episodes, B migraine history, C moderate/severe +
  // 5min-72h, D ≥50% of episodes with a migraine feature): VM surfaces only
  // when the full picture is affirmed, else it is hidden. This closes the prior
  // over-call (VM fired on vertigo + a single symptom chip) and the
  // photophobia-OR-phonophobia error (criterion D requires photophobia AND
  // phonophobia). Probable VM (§A1.6.6.1) is a separate future entity (Track C).
  {
    id: 'vestibular-migraine',
    name: 'Vestibular migraine',
    ichd3Section: 'ICHD-3 Appendix §A1.6.6',
    isAppendix: true,
    teachPearl:
      'Vestibular migraine lives in the ICHD-3 appendix as research criteria, not main classification. All four criteria are required: (A) at least 5 vertigo episodes; (B) a current or past history of 1.1/1.2 migraine; (C) moderate or severe intensity lasting 5 minutes to 72 hours; (D) a migraine feature (migraine-type headache, photophobia AND phonophobia, or visual aura) during at least half of the episodes. The Bárány Society / IHS joint criteria are widely used clinically despite appendix status.',
    criteria: [
      // vm-A: ICHD-3 A1.6.6 criterion A — ≥5 vestibular episodes (vertigo substrate
      // present). suppress-gate (DROP): no vertigo or <5 episodes = not VM.
      { id: 'vm-A', label: 'At least 5 vertigo/dizziness episodes', description: 'ICHD-3 A1.6.6 A: at least five episodes of vestibular symptoms, each fulfilling criteria C and D.', evaluate: s => has(s, 'vest-vertigo-migrainous') && has(s, 'vest-episodes-ge-5'), contributingChips: ['vest-vertigo-migrainous', 'vest-episodes-ge-5'], role: 'suppress-gate' },
      // vm-B: ICHD-3 A1.6.6 criterion B — established migraine history. suppress-gate
      // (DROP). The discriminator from BPPV / Menière / vestibular paroxysmia.
      { id: 'vm-B', label: 'Current or past history of 1.1 or 1.2 migraine', description: 'ICHD-3 A1.6.6 B: a current or past history of 1.1 Migraine without aura or 1.2 Migraine with aura.', evaluate: s => has(s, 'migraine-history-established'), contributingChips: ['migraine-history-established'], role: 'suppress-gate' },
      // vm-C: ICHD-3 A1.6.6 criterion C — moderate/severe intensity, 5 min–72 h
      // (Notes 3–4). suppress-gate (DROP): the anti-over-call intensity/duration gate.
      { id: 'vm-C', label: 'Moderate or severe vertigo lasting 5 minutes to 72 hours', description: 'ICHD-3 A1.6.6 C: vestibular symptoms of moderate (interferes with daily activity) or severe (prevents daily activity) intensity, lasting between 5 minutes and 72 hours.', evaluate: s => has(s, 'vest-intensity-mod-severe') && has(s, 'vest-duration-5min-72h'), contributingChips: ['vest-intensity-mod-severe', 'vest-duration-5min-72h'], role: 'suppress-gate' },
      // vm-D: ICHD-3 A1.6.6 criterion D — ≥50% of episodes with ≥1 migraine feature.
      // suppress-gate (DROP). The VM-specific composite chip fixes the prior
      // photophobia-OR-phonophobia error and the headache-attack vs vertigo-episode
      // conflation (criterion D is about the vertigo episodes, not headache attacks).
      { id: 'vm-D', label: 'Migraine features during at least half of the vertigo episodes', description: 'ICHD-3 A1.6.6 D: at least half of episodes accompanied by ≥1 migraine feature: migraine-type headache (≥2 of unilateral, pulsating, moderate/severe, activity-aggravated), photophobia AND phonophobia together, or visual aura.', evaluate: s => has(s, 'vest-migrainous-half'), contributingChips: ['vest-migrainous-half'], role: 'suppress-gate' },
    ],
  },

  // ─── 1.3 Chronic migraine ───────────────────────────────────────────────
  // Added 2026-05-25 per medsci audit. The single most clinically important
  // gap in the prior evaluator: a clinic patient with ≥15 headache days/month
  // and ≥8 days of migraine features was routing to Chronic TTH (incorrect)
  // because §1.3 was not encoded.
  {
    id: 'chronic-migraine',
    name: 'Chronic migraine',
    ichd3Section: 'ICHD-3 §1.3',
    teachPearl:
      'Chronic migraine is migraine that has crossed the chronicity threshold: ≥15 headache days/month for >3 months, of which ≥8 days fulfill migraine features OR are triptan/ergot-responsive. ICHD-3 §1.3 Note 1 instructs to code 1.3 in preference to 2.3 Chronic TTH when criteria are met. Acute and preventive management diverge from episodic migraine: onabotulinumtoxinA is approved for chronic migraine only (PREEMPT trials, ailani-ahs-2021); CGRP mAbs are first-line per AHS 2021 after ≥2 conventional preventive failures.',
    pitfalls: [
      'Do not confuse Chronic migraine (≥8 migraine-feature days/month + ≥15 headache days) with Chronic TTH (≥15 days, no migraine features). The triptan-response disjunction in criterion C catches treatment-responsive days that the patient may not self-identify as migraine.',
    ],
    criteria: [
      // cm-A: suppress-gate (DROP). Chronicity threshold. A 5–14-day patient is
      // episodic — not "probable chronic migraine." §1.3 has no §1.5.3 Probable
      // counterpart (verified), so a single miss has no Probable home.
      { id: 'cm-A', label: 'Headache on ≥15 days/month for >3 months', description: 'ICHD-3 1.3 A: headache (tension-type-like and/or migraine-like) on ≥15 days/month, for >3 months.', evaluate: s => has(s, 'freq-ge-15-per-month') && has(s, 'pattern-ge-3-months'), contributingChips: ['freq-ge-15-per-month', 'pattern-ge-3-months'], role: 'suppress-gate' },
      // cm-B: scorable. "Must have had" historical gate, but chronicity chips
      // presuppose attack count in chip vocabulary, so it cannot independently
      // fail when cm-A passes. No §1.5.3 to demote into. Score contributor.
      { id: 'cm-B', label: '≥5 prior attacks fulfilling 1.1 or 1.2 criteria', description: 'ICHD-3 1.3 B: patient has had at least five attacks fulfilling criteria for 1.1 Migraine without aura or 1.2 Migraine with aura.', evaluate: s => has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10'), contributingChips: ['attacks-5-to-10', 'attacks-gt-10'], role: 'scorable' },
      // cm-C: suppress-gate (EMIT). Distinguishes chronic migraine from chronic
      // TTH. With no §1.5.3 Probable, a single miss has no Probable home.
      // Failure means the chronic pattern is TTH-type, not migraine-type —
      // positive contradicting evidence → EMIT "considered and set aside."
      // Clinical-reviewer §17.2 condition 5 confirms EMIT is correct.
      // "see Chronic TTH" steer belongs to Stage Two copy layer, NOT here.
      { id: 'cm-C', label: '≥8 days/month meet migraine criteria OR triptan-responsive', description: 'ICHD-3 1.3 C: on ≥8 days/month for >3 months, fulfilling either: C.1 criteria C and D for 1.1 Migraine without aura, C.2 criteria B and C for 1.2 Migraine with aura, or C.3 believed by the patient to be migraine at onset and relieved by a triptan or ergot derivative.', evaluate: s => has(s, 'migraine-features-ge-8-per-month') || has(s, 'triptan-response-positive'), contributingChips: ['migraine-features-ge-8-per-month', 'triptan-response-positive'], role: 'suppress-gate' },
    ],
  },

  // ─── 3.2 Paroxysmal hemicrania ──────────────────────────────────────────
  // Indomethacin-absolute, distinct from 3.1 cluster (shorter attacks, more
  // frequent) and 3.4 HC (continuous). Gated on indomethacin complete trial
  // per architect §17.1 Condition 1 typed-gate refactor.
  {
    id: 'paroxysmal-hemicrania',
    name: 'Paroxysmal hemicrania',
    ichd3Section: 'ICHD-3 §3.2',
    hiddenUntilTrial: { gateChip: 'indo-tried-complete' },
    teachPearl:
      'Paroxysmal hemicrania attacks are severe unilateral orbital/supraorbital/temporal pain 2–30 min, ≥5/day for more than half the time, with ipsilateral autonomic features or restlessness, and absolute response to indomethacin. Same indomethacin protocol as hemicrania continua: 25 mg TID titrating to 50 mg TID (max 150 mg/day per Goadsby Continuum 2024).',
    criteria: [
      // ph-A: scorable. §3.5.2 covers attack-count shortfall.
      { id: 'ph-A', label: '≥20 attacks fulfilling B–E', description: 'ICHD-3 3.2 A: at least 20 attacks fulfilling criteria B–E.', evaluate: s => has(s, 'attacks-ge-20'), contributingChips: ['attacks-ge-20'], role: 'scorable' },
      // ph-B: demote-gate. §3.2 B is one of A–E; §3.5.2 covers single miss.
      // Feature/window not-yet-confirmed → demote (was definitional:true).
      { id: 'ph-B', label: 'Severe unilateral orbital/supraorbital/temporal pain, 2–30 minutes', description: 'ICHD-3 3.2 B: severe unilateral orbital, supraorbital, and/or temporal pain lasting 2–30 minutes.', evaluate: s => has(s, 'loc-unilateral') && has(s, 'loc-orbital-temporal') && (has(s, 'sev-severe') || has(s, 'sev-very-severe')) && has(s, 'dur-2-to-30-min'), contributingChips: ['loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'sev-very-severe', 'dur-2-to-30-min'], role: 'demote-gate' },
      // ph-C: demote-gate. §3.2 C is one of A–E; §3.5.2 covers single miss.
      // Not positive evidence for another phenotype → demote (was definitional:true).
      { id: 'ph-C', label: 'Ipsilateral autonomic features OR restlessness', description: 'ICHD-3 3.2 C: either or both of ipsilateral cranial autonomic symptoms; restlessness or agitation.', evaluate: s => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness'), contributingChips: ['sym-autonomic-ipsilateral', 'sym-restlessness'], role: 'demote-gate' },
      // ph-D: scorable. Already intentionally non-gating: between-bouts
      // bout-frequency cannot be surfaced via chips.
      { id: 'ph-D', label: '>5 attacks per day for more than half the time', description: 'ICHD-3 3.2 D: attack frequency >5/day for more than half of the time when the disorder is active.', evaluate: s => has(s, 'freq-gt-5-per-day'), contributingChips: ['freq-gt-5-per-day'], role: 'scorable' },
      // ph-E: suppress-gate (DROP via the gate). Absent confirmatory test, double-
      // enforced by hiddenUntilTrial gate. Both are idempotent (arch §17.1).
      { id: 'ph-E', label: 'Absolute response to therapeutic-dose indomethacin', description: 'ICHD-3 3.2 E: suppress-gate. Prevented absolutely by therapeutic doses of indomethacin.', evaluate: s => has(s, 'indo-tried-complete'), contributingChips: ['indo-tried-complete'], role: 'suppress-gate' },
    ],
  },

  // ─── 3.3 SUNCT / SUNA ───────────────────────────────────────────────────
  // Very short attacks (1–600 sec) with autonomic features. SUNCT vs SUNA
  // subtypes (§3.3.1 / §3.3.2) deferred — both surface as the §3.3 parent.
  {
    id: 'sunct-suna',
    name: 'Short-lasting unilateral neuralgiform headache attacks (SUNCT/SUNA)',
    ichd3Section: 'ICHD-3 §3.3',
    teachPearl:
      'SUNCT and SUNA are very-short-attack TACs (1–600 seconds). SUNCT (3.3.1) requires both conjunctival injection and lacrimation; SUNA (3.3.2) requires one or neither of those plus other cranial autonomic features. First-line preventive is lamotrigine (Burish Continuum 2024); carbamazepine is second-line.',
    criteria: [
      // sunct-A: scorable. §3.5.3 covers attack-count shortfall.
      { id: 'sunct-A', label: '≥20 attacks fulfilling B–D', description: 'ICHD-3 3.3 A: at least 20 attacks fulfilling criteria B–D.', evaluate: s => has(s, 'attacks-ge-20'), contributingChips: ['attacks-ge-20'], role: 'scorable' },
      // sunct-B: demote-gate. §3.3 B is an A–D criterion; §3.5.3 covers single miss.
      // Feature/window not-yet-confirmed → demote (was definitional:true).
      { id: 'sunct-B', label: 'Moderate–severe unilateral trigeminal-distribution pain, 1–600 seconds', description: 'ICHD-3 3.3 B: moderate or severe unilateral head pain, with orbital, supraorbital, temporal and/or other trigeminal-distribution location, lasting 1–600 seconds.', evaluate: s => has(s, 'loc-unilateral') && (has(s, 'sev-moderate') || has(s, 'sev-severe') || has(s, 'sev-very-severe')) && has(s, 'dur-1-to-600-sec'), contributingChips: ['loc-unilateral', 'sev-moderate', 'sev-severe', 'sev-very-severe', 'dur-1-to-600-sec'], role: 'demote-gate' },
      // sunct-C: suppress-gate (DROP). SUBSTRATE of SUNCT/SUNA. Cranial autonomic
      // accompaniment is defining (the "C/A" in the name). Zero autonomic = not
      // SUNCT/SUNA territory. Substrate-absence → suppress.
      // Clinical-reviewer §17.2 condition 8 confirms suppress is correct despite
      // §3.5.3's literal "all but one" — autonomic is the phenotype substrate.
      { id: 'sunct-C', label: '≥1 ipsilateral cranial autonomic feature', description: 'ICHD-3 3.3 C: accompanied by at least one ipsilateral cranial autonomic symptom (conjunctival injection, lacrimation, nasal congestion, rhinorrhoea, eyelid oedema, forehead/facial sweating, miosis, ptosis).', evaluate: s => has(s, 'sym-autonomic-ipsilateral'), contributingChips: ['sym-autonomic-ipsilateral'], role: 'suppress-gate' },
      // sunct-D: scorable. Frequency criterion; same between-bouts rationale.
      { id: 'sunct-D', label: '≥1 attack per day during the active period', description: 'ICHD-3 3.3 D: attack frequency at least one per day for more than half the time when the disorder is active.', evaluate: s => has(s, 'freq-ge-1-per-day'), contributingChips: ['freq-ge-1-per-day'], role: 'scorable' },
    ],
  },
];

// ─── ICHD-3 X.5 Probable framework — section reference map ────────────────
// When matchStrength is 'probable', the user-facing badge reads "Probable
// Migraine · ICHD-3 §1.5" instead of the parent §1.1. Added 2026-05-25.
//
// SCOPE — IMPORTANT: ICHD-3 §1.5 Probable migraine covers only §1.5.1
// (Probable migraine without aura) and §1.5.2 (Probable migraine with aura).
// There is NO §1.5.3 Probable chronic migraine — §1.3 Chronic migraine has
// no probable counterpart in ICHD-3. Do NOT add `chronic-migraine` to this
// map (clinical-reviewer §17.2 Phase 2 Condition 1, 2026-05-25). A patient
// who meets only 2-of-3 §1.3 criteria falls through to the §1.3 parent
// section label and the page renders the headline as "Partial match for
// Chronic migraine" rather than "Probable Chronic migraine" (which is an
// ICHD-3 entity that does not exist).
//
// §2.4 Probable TTH covers 2.4.1 / 2.4.2 / 2.4.3 (one per episodic/chronic TTH).
// §3.5 Probable TAC covers 3.5.1 (Probable cluster), 3.5.2 (Probable
// paroxysmal hemicrania), 3.5.3 (Probable SUNCT/SUNA), 3.5.4 (Probable
// hemicrania continua) — all four chapter-3 entities have §3.5 counterparts.
const PROBABLE_SECTION_FOR: Partial<Record<PhenotypeId, string>> = {
  'migraine-without-aura': 'ICHD-3 §1.5 Probable migraine',
  'migraine-with-aura': 'ICHD-3 §1.5 Probable migraine',
  // chronic-migraine intentionally omitted — see scope comment above.
  'episodic-tth': 'ICHD-3 §2.4 Probable tension-type headache',
  'chronic-tth': 'ICHD-3 §2.4 Probable tension-type headache',
  'cluster-headache': 'ICHD-3 §3.5 Probable trigeminal autonomic cephalalgia',
  'paroxysmal-hemicrania': 'ICHD-3 §3.5 Probable trigeminal autonomic cephalalgia',
  'sunct-suna': 'ICHD-3 §3.5 Probable trigeminal autonomic cephalalgia',
  'hemicrania-continua': 'ICHD-3 §3.5 Probable trigeminal autonomic cephalalgia',
  // §4.7.1 is a real ICHD-3 Probable sub-form (unlike §4.10 NDPH, which has none).
  'primary-stabbing-headache': 'ICHD-3 §4.7.1 Probable primary stabbing headache',
};

// ─── EMIT set — suppress gates that surface with definitionallyExcluded:true ─
// tth-D, ctth-D, cm-C: positive-contradicting-evidence suppressions where
// emitting "considered and set aside" is clinically useful.
// psh-D: cranial autonomic symptoms present → set aside, steer to §3.3 SUNCT/SUNA.
// All other suppress gates (aura-B, cm-A, ctth-A, sunct-C, hc-A, hc-D, ph-E,
// ndph-A, ndph-B, vm-A, vm-B, vm-C, vm-D, psh-A) DROP silently (substrate-absence).
const EMIT_CRITERION_IDS = new Set<string>(['tth-D', 'ctth-D', 'cm-C', 'psh-D']);

// ─── Dev-time invariant: every phenotype must have a suppression path ──────
// Checked at module-load in dev (import.meta.env.DEV). Fails loudly if a
// future phenotype is added without one of the three accepted paths:
//   (a) ≥1 criterion with role === 'suppress-gate'
//   (b) a hiddenUntilTrial gate
//   (c) a registered minimum-evidence floor (§1.1 / §2.2 / §3.1)
//
// This is the structural guarantee (clinical §17.2 condition 7 + arch §17.1 follow-up 4):
// no feature-only phenotype can surface off a single incidental chip.
const PHENOTYPES_WITH_EVIDENCE_FLOOR: Set<PhenotypeId> = new Set([
  'migraine-without-aura',  // §1.1 — migraineEvidenceFloor
  'episodic-tth',           // §2.2 — tthEvidenceFloor
  'cluster-headache',       // §3.1 — clusterEvidenceFloor
]);

if (typeof import.meta !== 'undefined' && import.meta.env?.DEV) {
  for (const phenotype of HEADACHE_PHENOTYPES) {
    const hasSuppressGate = phenotype.criteria.some(c => c.role === 'suppress-gate');
    const hasTrial = !!phenotype.hiddenUntilTrial;
    const hasFloor = PHENOTYPES_WITH_EVIDENCE_FLOOR.has(phenotype.id);
    if (!hasSuppressGate && !hasTrial && !hasFloor) {
      throw new Error(
        `[clinicHeadacheData] Invariant violated: phenotype "${phenotype.id}" (${phenotype.name}) ` +
        `has no suppress-gate criterion, no hiddenUntilTrial gate, and no registered minimum-evidence ` +
        `floor. Add one of the three before shipping. This prevents the phenotype from surfacing off ` +
        `a single incidental chip (clinical §17.2 condition 7).`
      );
    }
  }
}

// ─── Pure evaluator ───────────────────────────────────────────────────────

/**
 * Evaluate the user's chip selections against ICHD-3 criteria for every
 * phenotype. Returns matches ranked by match strength.
 *
 * Rules (updated 2026-06-04 — SUPPRESS/DEMOTE split):
 *   - All criteria met → matchStrength: 'full'
 *   - All scorable+demote criteria met, one demote-gate fails → 'probable' (X.5)
 *   - Some criteria met but more than one missing → 'partial'
 *   - No criteria met → 'none' (excluded from output)
 *
 *   - suppress-gate failure (DROP set): phenotype skipped silently.
 *   - suppress-gate failure (EMIT set: tth-D, ctth-D, cm-C): phenotype emitted
 *     with definitionallyExcluded:true and exclusionReason. NOT an active match.
 *   - demote-gate failure: phenotype KEPT; its miss surfaces in missingCriteria;
 *     the probable branch is now reachable for one-demote-miss cases.
 *
 *   - Minimum-evidence floors for §1.1/§2.2/§3.1 prevent single-chip surfacing.
 *   - Phenotypes with hiddenUntilTrial are hidden until the gate chip is selected.
 *   - Continuous-headache selection suppresses purely episodic phenotypes.
 *   - Probable-X cannot co-exist with a fulfilled X (X.5 exclusion clause).
 */
export function evaluateHeadachePhenotypes(selected: Set<ChipId>): PhenotypeMatch[] {
  const matches: PhenotypeMatch[] = [];

  for (const phenotype of HEADACHE_PHENOTYPES) {
    // ── Hidden-until-trial gate. ──────────────────────────────────────────
    // Typed per architect §17.1 condition 1.
    if (phenotype.hiddenUntilTrial && !selected.has(phenotype.hiddenUntilTrial.gateChip)) continue;

    // ── Suppress purely episodic phenotypes when patient reports continuous ─
    // headache. NOTE: 1.3 Chronic migraine, 3.4 HC, 4.10 NDPH are NOT in this
    // list — each is by ICHD-3 definition continuous-pattern compatible
    // (medsci audit + clinical-reviewer 2026-05-25).
    const episodicPhenotypes: PhenotypeId[] = ['migraine-without-aura', 'migraine-with-aura', 'episodic-tth', 'cluster-headache', 'paroxysmal-hemicrania', 'sunct-suna'];
    if (episodicPhenotypes.includes(phenotype.id) && selected.has('dur-continuous')) continue;

    // ── ICHD-3 §2.3 Note 1: code only 1.3 when both 1.3 and 2.3 are met. ─
    if (phenotype.id === 'chronic-tth') {
      const cmCriteria = HEADACHE_PHENOTYPES.find(p => p.id === 'chronic-migraine')?.criteria;
      const cmAllMet = cmCriteria?.every(c => c.evaluate(selected));
      if (cmAllMet) continue;
    }

    // ── Require at least one positive chip contributing to this phenotype. ─
    // Prevents phenotypes with "absence" criteria (e.g. TTH "no vomiting")
    // from trivially partial-matching on empty input.
    const allContributingChips = new Set<ChipId>();
    for (const c of phenotype.criteria) for (const cc of c.contributingChips) allContributingChips.add(cc);
    let hasPositiveEvidence = false;
    for (const id of allContributingChips) if (selected.has(id)) { hasPositiveEvidence = true; break; }
    if (!hasPositiveEvidence) continue;

    // ── Minimum-evidence floors (§1.1 / §2.2 / §3.1). ───────────────────
    // Prevent feature-only phenotypes surfacing off one incidental chip.
    // Applied before the suppress-gate check so floors can short-circuit
    // before the loop (avoids unnecessary criterion evaluation).
    if (phenotype.id === 'migraine-without-aura' && !migraineEvidenceFloor(selected)) continue;
    if (phenotype.id === 'episodic-tth' && !tthEvidenceFloor(selected)) continue;
    if (phenotype.id === 'cluster-headache' && !clusterEvidenceFloor(selected)) continue;

    // ── SUPPRESS-gate check (replaces the blanket definitional continue). ─
    // Find any suppress-gate criterion that fails.
    let suppressGateFailed: Criterion | null = null;
    for (const criterion of phenotype.criteria) {
      if (criterion.role === 'suppress-gate' && !criterion.evaluate(selected)) {
        suppressGateFailed = criterion;
        break;
      }
    }

    if (suppressGateFailed !== null) {
      // Decide: EMIT or DROP?
      if (EMIT_CRITERION_IDS.has(suppressGateFailed.id)) {
        // EMIT — positive contradicting evidence (tth-D, ctth-D, cm-C).
        // The result screen can render a "considered and set aside" tray.
        // exclusionReason reuses existing criterion label text (no new clinical sentences).
        matches.push({
          phenotypeId: phenotype.id,
          name: phenotype.name,
          ichd3Section: phenotype.ichd3Section,
          displaySection: phenotype.ichd3Section,
          matchStrength: 'none',
          criteriaMet: 0,
          criteriaTotal: phenotype.criteria.length,
          metCriteria: [],
          missingCriteria: [{ id: suppressGateFailed.id, label: suppressGateFailed.label, description: suppressGateFailed.description }],
          isAppendix: phenotype.isAppendix,
          definitionallyExcluded: true,
          exclusionReason: suppressGateFailed.label,
        });
      }
      // DROP — substrate-absence (aura-B, cm-A, ctth-A, sunct-C, hc-A, hc-D,
      // ph-E, ndph-A, ndph-B, vm-A, vm-B, vm-C, vm-D): continue silently.
      continue;
    }

    // ── Score met/missing across scorable and demote-gate criteria. ────────
    // suppress-gates that passed are counted in the total so the clinician
    // sees them in metCriteria (they contributed positively).
    const met: { id: string; label: string; contributingChipLabels: string[] }[] = [];
    const missing: { id: string; label: string; description: string }[] = [];
    let demoteGateFailed = false;

    for (const criterion of phenotype.criteria) {
      if (criterion.evaluate(selected)) {
        const contributingChipLabels = criterion.contributingChips
          .filter(chipId => selected.has(chipId))
          .map(chipId => getChip(chipId)?.label ?? chipId);
        met.push({ id: criterion.id, label: criterion.label, contributingChipLabels });
      } else {
        missing.push({ id: criterion.id, label: criterion.label, description: criterion.description });
        if (criterion.role === 'demote-gate') demoteGateFailed = true;
      }
    }

    const total = phenotype.criteria.length;
    const metCount = met.length;
    let strength: 'full' | 'probable' | 'partial' | 'none';
    if (metCount === total) {
      strength = 'full';
    } else if (metCount === total - 1 && demoteGateFailed) {
      // One demote-gate criterion missed — the §X.5 probable near-miss.
      // This branch was previously unreachable because suppress-gates dropped
      // the phenotype before reaching this code. Now that suppress-gates are
      // checked separately (above), this branch is reachable as intended.
      strength = 'probable';
    } else if (metCount === total - 1) {
      // One scorable criterion missed (not a demote-gate miss).
      // Still qualifies as probable per X.5 "all but one" framework.
      strength = 'probable';
    } else if (metCount > 0) {
      strength = 'partial';
    } else {
      strength = 'none';
    }

    if (strength === 'none') continue;

    matches.push({
      phenotypeId: phenotype.id,
      name: phenotype.name,
      ichd3Section: phenotype.ichd3Section,
      displaySection: strength === 'probable'
        ? PROBABLE_SECTION_FOR[phenotype.id] ?? phenotype.ichd3Section
        : phenotype.ichd3Section,
      matchStrength: strength,
      criteriaMet: metCount,
      criteriaTotal: total,
      metCriteria: met,
      missingCriteria: missing,
      isAppendix: phenotype.isAppendix,
      definitionallyExcluded: false,
    });
  }

  // ── ICHD-3 X.5 exclusion clause. ─────────────────────────────────────────
  // "Probable [phenotype]" requires "does not fulfil criteria for another ICHD-3
  // disorder." If ANY phenotype is a full match, suppress all probable matches.
  // Note: definitionallyExcluded:true entries (matchStrength:'none') are not
  // active matches and are not promoted to probable — they are unaffected.
  const hasFullMatch = matches.some(m => m.matchStrength === 'full');
  if (hasFullMatch) {
    for (let i = matches.length - 1; i >= 0; i--) {
      if (matches[i].matchStrength === 'probable') matches.splice(i, 1);
    }
  }

  // ── Sort: full > probable > partial; then by criteriaMet/Total ratio. ───
  // definitionallyExcluded:true entries (matchStrength:'none') sort last.
  matches.sort((a, b) => {
    const strengthOrder = { full: 0, probable: 1, partial: 2, none: 3 };
    const sa = strengthOrder[a.matchStrength];
    const sb = strengthOrder[b.matchStrength];
    if (sa !== sb) return sa - sb;
    return b.criteriaMet / b.criteriaTotal - a.criteriaMet / a.criteriaTotal;
  });

  return matches;
}

// ─── Lookup helpers ───────────────────────────────────────────────────────

export function getPhenotype(id: PhenotypeId): Phenotype | undefined {
  return HEADACHE_PHENOTYPES.find(p => p.id === id);
}

export function getChip(id: ChipId): Chip | undefined {
  for (const group of HEADACHE_CHIP_GROUPS) {
    const chip = group.chips.find(c => c.id === id);
    if (chip) return chip;
  }
  return undefined;
}
