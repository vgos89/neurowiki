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
  | 'attacks-lt-5' | 'attacks-5-to-10' | 'attacks-gt-10'
  // Pattern: frequency
  | 'freq-1-4-per-month' | 'freq-5-14-per-month' | 'freq-ge-15-per-month' | 'freq-cluster-bout'
  // Pattern: pattern duration in time
  | 'pattern-lt-3-months' | 'pattern-ge-3-months'
  // Pattern: duration per attack
  | 'dur-lt-15-min' | 'dur-15-to-180-min' | 'dur-30min-to-7days'
  | 'dur-4-to-72-hours' | 'dur-gt-72-hours' | 'dur-continuous'
  // Pattern: onset
  | 'onset-recurrent-same' | 'onset-new-within-3-months' | 'onset-single-sudden'
  // Pain location
  | 'loc-unilateral' | 'loc-bilateral' | 'loc-orbital-temporal'
  // Pain quality
  | 'qual-pulsating' | 'qual-pressing-tightening' | 'qual-sharp-stabbing'
  // Pain severity
  | 'sev-mild' | 'sev-moderate' | 'sev-severe' | 'sev-very-severe'
  // Activity
  | 'act-aggravated' | 'act-not-aggravated'
  // Associated symptoms
  | 'sym-nausea' | 'sym-vomiting'
  | 'sym-photophobia' | 'sym-phonophobia'
  | 'sym-restlessness' | 'sym-autonomic-ipsilateral'
  // Aura features
  | 'aura-visual' | 'aura-sensory' | 'aura-speech' | 'aura-motor' | 'aura-brainstem' | 'aura-retinal'
  | 'aura-fully-reversible' | 'aura-spread-ge-5min' | 'aura-each-5-to-60min'
  | 'aura-multi-symptoms-succession' | 'aura-positive-symptoms' | 'aura-headache-within-60min'
  // Vestibular
  | 'vest-vertigo-migrainous' | 'vest-motion-sensitivity'
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
  | 'probable-migraine'
  | 'episodic-tth'
  | 'chronic-tth'
  | 'probable-tth'
  | 'cluster-headache'
  | 'hemicrania-continua'
  | 'probable-tac'
  | 'ndph'
  | 'vestibular-migraine';

export interface Criterion {
  id: string;
  label: string;
  description: string;
  evaluate: (selected: Set<ChipId>) => boolean;
  contributingChips: ChipId[];
}

export interface Phenotype {
  id: PhenotypeId;
  name: string;
  ichd3Section: string;
  isAppendix?: boolean;
  hiddenUntilTrial?: boolean;
  suppressIfContinuous?: boolean;
  teachPearl?: string;
  pitfalls?: string[];
  criteria: Criterion[];
}

export interface PhenotypeMatch {
  phenotypeId: PhenotypeId;
  name: string;
  ichd3Section: string;
  matchStrength: 'full' | 'probable' | 'partial' | 'none';
  criteriaMet: number;
  criteriaTotal: number;
  metCriteria: { id: string; label: string }[];
  missingCriteria: { id: string; label: string; description: string }[];
  isAppendix?: boolean;
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
      { id: 'attacks-5-to-10', label: '5 to 10 lifetime attacks', teachWhenSelected: 'Meets the ≥5 attack criterion for 1.1 Migraine and 3.1 Cluster headache.' },
      { id: 'attacks-gt-10', label: 'More than 10 lifetime attacks', teachWhenSelected: 'Meets the ≥10 episode criterion for 2.2 Episodic TTH and the ≥5 criterion for migraine.' },

      { id: 'freq-1-4-per-month', label: '1 to 4 headache days per month' },
      { id: 'freq-5-14-per-month', label: '5 to 14 headache days per month' },
      { id: 'freq-ge-15-per-month', label: '15 or more headache days per month', teachWhenSelected: 'Crosses the chronic threshold (Chronic migraine, Chronic TTH, or MOH territory).' },
      { id: 'freq-cluster-bout', label: 'Frequency 1 every other day to 8/day during bouts', teachWhenSelected: '3.1 Cluster criterion D — pattern in active bouts.' },

      { id: 'pattern-lt-3-months', label: 'Pattern present <3 months' },
      { id: 'pattern-ge-3-months', label: 'Pattern present ≥3 months', teachWhenSelected: 'Required for 2.2/2.3 TTH and 3.4 Hemicrania continua diagnoses.' },

      { id: 'dur-lt-15-min', label: 'Attacks <15 minutes' },
      { id: 'dur-15-to-180-min', label: 'Attacks 15 to 180 minutes', teachWhenSelected: '3.1 Cluster headache attack length.' },
      { id: 'dur-30min-to-7days', label: 'Attacks 30 minutes to 7 days', teachWhenSelected: '2.2 Episodic TTH attack length.' },
      { id: 'dur-4-to-72-hours', label: 'Attacks 4 to 72 hours (untreated)', teachWhenSelected: '1.1 Migraine criterion B — untreated or unsuccessfully treated.' },
      { id: 'dur-gt-72-hours', label: 'Attacks >72 hours' },
      { id: 'dur-continuous', label: 'Headache is continuous and unremitting', teachWhenSelected: '3.4 Hemicrania continua or 3.3 NDPH territory; episodic phenotypes will not apply.' },

      { id: 'onset-recurrent-same', label: 'Recurrent attacks with the same pattern' },
      { id: 'onset-new-within-3-months', label: 'New onset in the last 3 months' },
      { id: 'onset-single-sudden', label: 'Single sudden episode (first-ever)', teachWhenSelected: 'Single sudden attacks need workup — see red flags below.' },
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
      { id: 'sev-very-severe', label: 'Very severe intensity', teachWhenSelected: '3.1 B Cluster — severe or very severe pain.' },

      { id: 'act-aggravated', label: 'Aggravated by or causing avoidance of routine activity', teachWhenSelected: '1.1 C feature 4 (migraine).' },
      { id: 'act-not-aggravated', label: 'Not aggravated by routine activity', teachWhenSelected: '2.2 C feature 4 (TTH).' },
    ],
  },
  {
    id: 'associated',
    label: 'Associated symptoms',
    eyebrow: 'ICHD-3 1.1 D requires nausea/vomiting OR (photophobia AND phonophobia). TTH excludes nausea/vomiting and allows ≤1 of photo/phono.',
    chips: [
      { id: 'sym-nausea', label: 'Nausea during attacks', teachWhenSelected: 'Satisfies 1.1 D (migraine). Excludes 2.2 D (TTH) at moderate-severe levels.' },
      { id: 'sym-vomiting', label: 'Vomiting during attacks', teachWhenSelected: 'Satisfies 1.1 D (migraine). Excludes TTH.' },
      { id: 'sym-photophobia', label: 'Bothered by light during attacks', teachWhenSelected: 'For migraine 1.1 D, photophobia AND phonophobia together satisfy criterion.' },
      { id: 'sym-phonophobia', label: 'Bothered by sound during attacks', teachWhenSelected: 'For migraine 1.1 D, paired with photophobia satisfies criterion.' },
      { id: 'sym-restlessness', label: 'Restlessness or agitation during attacks', teachWhenSelected: '3.1 Cluster criterion C alternative — restlessness OR autonomic features.' },
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
      { id: 'aura-motor', label: 'Motor aura (weakness)', teachWhenSelected: 'Motor aura indicates 1.2.3 Hemiplegic migraine — refer for genetic evaluation.' },
      { id: 'aura-brainstem', label: 'Brainstem aura (dysarthria, vertigo, tinnitus, diplopia, ataxia)' },
      { id: 'aura-retinal', label: 'Retinal aura (monocular visual symptoms)' },
      { id: 'aura-fully-reversible', label: 'Aura is fully reversible' },
      { id: 'aura-spread-ge-5min', label: 'Aura spreads gradually over ≥5 minutes' },
      { id: 'aura-each-5-to-60min', label: 'Each aura symptom lasts 5 to 60 minutes' },
      { id: 'aura-multi-symptoms-succession', label: 'Two or more aura symptoms occur in succession' },
      { id: 'aura-positive-symptoms', label: 'At least one positive (rather than purely negative) aura symptom' },
      { id: 'aura-headache-within-60min', label: 'Headache follows aura within 60 minutes' },
    ],
  },
  {
    id: 'vestibular',
    label: 'Vestibular features',
    eyebrow: 'Vestibular migraine (ICHD-3 Appendix A1.6.5) is research criteria. Treat as a possibility, not a primary classification.',
    defaultCollapsed: true,
    chips: [
      { id: 'vest-vertigo-migrainous', label: 'Vertigo episodes with migrainous symptoms (photophobia, phonophobia, visual aura)' },
      { id: 'vest-motion-sensitivity', label: 'Motion sensitivity between episodes' },
    ],
  },
  {
    id: 'indomethacin',
    label: 'Indomethacin response',
    eyebrow: 'Hemicrania continua (ICHD-3 3.4) requires absolute response to therapeutic-dose indomethacin. This is definitional, not contributory.',
    defaultCollapsed: true,
    chips: [
      { id: 'indo-not-tried', label: 'Indomethacin trial not yet done' },
      { id: 'indo-tried-complete', label: 'Therapeutic dose tried — complete response', teachWhenSelected: '3.4 Hemicrania continua criterion D met. Definitional.' },
      { id: 'indo-tried-partial', label: 'Therapeutic dose tried — partial response', teachWhenSelected: 'Does not satisfy 3.4 D (absolute response required).' },
      { id: 'indo-tried-no-response', label: 'Therapeutic dose tried — no response', teachWhenSelected: 'Rules out 3.4 Hemicrania continua.' },
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

const auraCharacteristicCount = (s: Set<ChipId>): number =>
  countOf(s, [
    'aura-spread-ge-5min',
    'aura-multi-symptoms-succession',
    'aura-each-5-to-60min',
    'aura-positive-symptoms',
    'aura-headache-within-60min',
  ]) + (has(s, 'loc-unilateral') ? 1 : 0);
// 6th characteristic per ICHD-3 1.2 C is "at least one aura symptom is unilateral"
// — surfaced through loc-unilateral.

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
      { id: 'mig-A', label: 'At least 5 lifetime attacks', description: 'ICHD-3 1.1 A — diagnosis requires ≥5 attacks fulfilling B–D.', evaluate: s => has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10'), contributingChips: ['attacks-5-to-10', 'attacks-gt-10'] },
      { id: 'mig-B', label: 'Duration 4 to 72 hours (untreated)', description: 'ICHD-3 1.1 B — duration 4–72 h untreated or unsuccessfully treated.', evaluate: s => has(s, 'dur-4-to-72-hours'), contributingChips: ['dur-4-to-72-hours'] },
      { id: 'mig-C', label: '≥2 of: unilateral, pulsating, moderate/severe, aggravated by activity', description: 'ICHD-3 1.1 C — ≥2 of 4 character features.', evaluate: s => migraineCharacterCount(s) >= 2, contributingChips: MIGRAINE_C_CHARACTER },
      { id: 'mig-D', label: 'Nausea/vomiting OR (photophobia AND phonophobia)', description: 'ICHD-3 1.1 D — ≥1 of: nausea and/or vomiting; photophobia AND phonophobia together.', evaluate: s => has(s, 'sym-nausea') || has(s, 'sym-vomiting') || (has(s, 'sym-photophobia') && has(s, 'sym-phonophobia')), contributingChips: ['sym-nausea', 'sym-vomiting', 'sym-photophobia', 'sym-phonophobia'] },
    ],
  },

  // ─── 1.2 Migraine with aura ─────────────────────────────────────────────
  {
    id: 'migraine-with-aura',
    name: 'Migraine with aura',
    ichd3Section: 'ICHD-3 §1.2',
    teachPearl:
      'Aura is a focal cortical event, usually visual, lasting 5 to 60 minutes per symptom. Criterion C requires ≥3 of 6 aura characteristics; the 6th is "at least one aura symptom is unilateral," surfaced via the location chip.',
    pitfalls: [
      'Motor aura suggests 1.2.3 Hemiplegic migraine — distinct entity, genetic evaluation indicated.',
      'Brainstem aura requires ≥2 brainstem symptoms simultaneously (dysarthria, vertigo, tinnitus, diplopia, ataxia, decreased consciousness).',
    ],
    criteria: [
      { id: 'aura-A', label: 'At least 2 attacks fulfilling B and C', description: 'ICHD-3 1.2 A — ≥2 attacks of aura.', evaluate: s => has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10') || has(s, 'attacks-lt-5'), contributingChips: ['attacks-lt-5', 'attacks-5-to-10', 'attacks-gt-10'] },
      { id: 'aura-B', label: '≥1 fully reversible aura symptom (visual, sensory, speech, motor, brainstem, or retinal)', description: 'ICHD-3 1.2 B — one or more fully reversible aura symptoms.', evaluate: s => hasAny(s, ['aura-visual', 'aura-sensory', 'aura-speech', 'aura-motor', 'aura-brainstem', 'aura-retinal']) && has(s, 'aura-fully-reversible'), contributingChips: ['aura-visual', 'aura-sensory', 'aura-speech', 'aura-motor', 'aura-brainstem', 'aura-retinal', 'aura-fully-reversible'] },
      { id: 'aura-C', label: '≥3 of 6 aura characteristics', description: 'ICHD-3 1.2 C — at least 3 of: spreading ≥5 min, ≥2 symptoms in succession, each 5–60 min, unilateral, positive features, headache within 60 min.', evaluate: s => auraCharacteristicCount(s) >= 3, contributingChips: ['aura-spread-ge-5min', 'aura-multi-symptoms-succession', 'aura-each-5-to-60min', 'aura-positive-symptoms', 'aura-headache-within-60min', 'loc-unilateral'] },
    ],
  },

  // ─── 2.2 Frequent episodic TTH ──────────────────────────────────────────
  {
    id: 'episodic-tth',
    name: 'Frequent episodic tension-type headache',
    ichd3Section: 'ICHD-3 §2.2',
    teachPearl:
      'TTH attacks are pressing or tightening, bilateral, mild to moderate, and NOT aggravated by routine activity — the inverse of migraine on most features. The diagnostic discriminator from migraine is criterion D: TTH has no nausea/vomiting and at most one of photophobia or phonophobia.',
    pitfalls: [
      'A patient can carry 1.1 Migraine and 2.2 TTH concurrently — ICHD-3 General Principles allows multiple primary diagnoses. Treat each separately.',
    ],
    criteria: [
      { id: 'tth-A', label: '≥10 episodes on 1–14 days/month for >3 months', description: 'ICHD-3 2.2 A — ≥10 episodes on 1–14 days/month, pattern ≥3 months.', evaluate: s => (has(s, 'attacks-gt-10')) && (has(s, 'freq-1-4-per-month') || has(s, 'freq-5-14-per-month')) && has(s, 'pattern-ge-3-months'), contributingChips: ['attacks-gt-10', 'freq-1-4-per-month', 'freq-5-14-per-month', 'pattern-ge-3-months'] },
      { id: 'tth-B', label: 'Duration 30 minutes to 7 days', description: 'ICHD-3 2.2 B — attack duration 30 min to 7 days.', evaluate: s => has(s, 'dur-30min-to-7days'), contributingChips: ['dur-30min-to-7days'] },
      { id: 'tth-C', label: '≥2 of: bilateral, pressing/tightening, mild-moderate, NOT aggravated', description: 'ICHD-3 2.2 C — ≥2 of 4 character features.', evaluate: s => TTH_C_CHARACTER(s) >= 2, contributingChips: ['loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'sev-moderate', 'act-not-aggravated'] },
      { id: 'tth-D', label: 'No nausea/vomiting; ≤1 of photophobia or phonophobia', description: 'ICHD-3 2.2 D — exclude nausea/vomiting and allow at most one of photo/phono.', evaluate: s => !has(s, 'sym-nausea') && !has(s, 'sym-vomiting') && countOf(s, ['sym-photophobia', 'sym-phonophobia']) <= 1, contributingChips: ['sym-nausea', 'sym-vomiting', 'sym-photophobia', 'sym-phonophobia'] },
    ],
  },

  // ─── 2.3 Chronic TTH ────────────────────────────────────────────────────
  {
    id: 'chronic-tth',
    name: 'Chronic tension-type headache',
    ichd3Section: 'ICHD-3 §2.3',
    teachPearl:
      'Chronic TTH is the chronic counterpart to 2.2 — ≥15 days/month, pattern ≥3 months, with the same B–D character features. Chronic TTH allows mild nausea OR a single photo/phono symptom but not moderate-severe nausea or vomiting.',
    criteria: [
      { id: 'ctth-A', label: '≥15 headache days/month for >3 months', description: 'ICHD-3 2.3 A — headache on ≥15 days/month, pattern ≥3 months.', evaluate: s => has(s, 'freq-ge-15-per-month') && has(s, 'pattern-ge-3-months'), contributingChips: ['freq-ge-15-per-month', 'pattern-ge-3-months'] },
      { id: 'ctth-B', label: 'Hours to continuous, or unremitting', description: 'ICHD-3 2.3 B — attack duration hours to days, or unremitting.', evaluate: s => has(s, 'dur-30min-to-7days') || has(s, 'dur-gt-72-hours') || has(s, 'dur-continuous'), contributingChips: ['dur-30min-to-7days', 'dur-gt-72-hours', 'dur-continuous'] },
      { id: 'ctth-C', label: '≥2 of: bilateral, pressing/tightening, mild-moderate, NOT aggravated', description: 'ICHD-3 2.3 C — same as 2.2 C.', evaluate: s => TTH_C_CHARACTER(s) >= 2, contributingChips: ['loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'sev-moderate', 'act-not-aggravated'] },
      { id: 'ctth-D', label: 'No moderate/severe nausea, no vomiting', description: 'ICHD-3 2.3 D — exclude moderate/severe nausea and vomiting; allow mild nausea OR ≤1 of photo/phono.', evaluate: s => !has(s, 'sym-vomiting'), contributingChips: ['sym-vomiting', 'sym-nausea'] },
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
      { id: 'cluster-A', label: 'At least 5 attacks', description: 'ICHD-3 3.1 A — ≥5 attacks fulfilling B–D.', evaluate: s => has(s, 'attacks-5-to-10') || has(s, 'attacks-gt-10'), contributingChips: ['attacks-5-to-10', 'attacks-gt-10'] },
      { id: 'cluster-B', label: 'Severe/very severe unilateral orbital, supraorbital, or temporal pain lasting 15–180 minutes', description: 'ICHD-3 3.1 B — severe-very severe unilateral orbital/supraorbital/temporal, 15–180 min untreated.', evaluate: s => has(s, 'loc-unilateral') && has(s, 'loc-orbital-temporal') && (has(s, 'sev-severe') || has(s, 'sev-very-severe')) && has(s, 'dur-15-to-180-min'), contributingChips: ['loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'sev-very-severe', 'dur-15-to-180-min'] },
      { id: 'cluster-C', label: 'Ipsilateral autonomic features OR restlessness/agitation', description: 'ICHD-3 3.1 C — either or both of ipsilateral cranial autonomic symptoms; restlessness/agitation.', evaluate: s => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness'), contributingChips: ['sym-autonomic-ipsilateral', 'sym-restlessness'] },
      { id: 'cluster-D', label: 'Frequency 1 every other day to 8/day during bouts', description: 'ICHD-3 3.1 D — frequency 1 every other day to 8/day during active periods.', evaluate: s => has(s, 'freq-cluster-bout'), contributingChips: ['freq-cluster-bout'] },
    ],
  },

  // ─── 3.4 Hemicrania continua ────────────────────────────────────────────
  // Hidden until indomethacin response is entered, because the response is
  // definitional, not contributory.
  {
    id: 'hemicrania-continua',
    name: 'Hemicrania continua',
    ichd3Section: 'ICHD-3 §3.4',
    hiddenUntilTrial: true,
    teachPearl:
      'Hemicrania continua is a continuous, strictly unilateral headache with exacerbations, ipsilateral autonomic features or restlessness, and ABSOLUTE response to therapeutic indomethacin. The indomethacin response is the diagnostic test — without it, the diagnosis cannot be made (Goadsby Continuum 2024).',
    criteria: [
      { id: 'hc-A', label: 'Continuous strictly unilateral headache present >3 months', description: 'ICHD-3 3.4 A — unilateral continuous headache, >3 months.', evaluate: s => has(s, 'loc-unilateral') && has(s, 'dur-continuous') && has(s, 'pattern-ge-3-months'), contributingChips: ['loc-unilateral', 'dur-continuous', 'pattern-ge-3-months'] },
      { id: 'hc-B', label: 'Exacerbations of moderate or greater intensity', description: 'ICHD-3 3.4 B — exacerbations of moderate or greater intensity.', evaluate: s => has(s, 'sev-moderate') || has(s, 'sev-severe'), contributingChips: ['sev-moderate', 'sev-severe'] },
      { id: 'hc-C', label: 'Ipsilateral autonomic features OR restlessness/movement aggravation', description: 'ICHD-3 3.4 C — ipsilateral cranial autonomic symptoms and/or restlessness or aggravation by movement.', evaluate: s => has(s, 'sym-autonomic-ipsilateral') || has(s, 'sym-restlessness'), contributingChips: ['sym-autonomic-ipsilateral', 'sym-restlessness'] },
      { id: 'hc-D', label: 'Absolute response to therapeutic-dose indomethacin', description: 'ICHD-3 3.4 D — definitional. Complete indomethacin response is required.', evaluate: s => has(s, 'indo-tried-complete'), contributingChips: ['indo-tried-complete'] },
    ],
  },

  // ─── 3.3 NDPH ───────────────────────────────────────────────────────────
  {
    id: 'ndph',
    name: 'New daily persistent headache',
    ichd3Section: 'ICHD-3 §3.3',
    teachPearl:
      'NDPH is defined by the patient being able to pinpoint the moment the headache began and it never resolving since. Onset to continuous and unremitting must occur within 24 hours, and the pattern must persist >3 months. NDPH is a diagnosis of exclusion — workup for secondary causes is mandatory.',
    criteria: [
      { id: 'ndph-A', label: 'Persistent headache >3 months', description: 'ICHD-3 3.3 A — persistent headache, >3 months.', evaluate: s => has(s, 'dur-continuous') && has(s, 'pattern-ge-3-months'), contributingChips: ['dur-continuous', 'pattern-ge-3-months'] },
      { id: 'ndph-B', label: 'Distinct, clearly-remembered onset; continuous within 24 hours', description: 'ICHD-3 3.3 B — distinct and clearly-remembered onset, becoming continuous and unremitting within 24 hours.', evaluate: s => has(s, 'onset-new-within-3-months') || has(s, 'onset-single-sudden'), contributingChips: ['onset-new-within-3-months', 'onset-single-sudden'] },
    ],
  },

  // ─── A1.6.5 Vestibular migraine (appendix entity) ────────────────────────
  {
    id: 'vestibular-migraine',
    name: 'Vestibular migraine',
    ichd3Section: 'ICHD-3 Appendix §A1.6.5',
    isAppendix: true,
    teachPearl:
      'Vestibular migraine lives in the ICHD-3 appendix as research criteria, not main classification. Diagnostic features: ≥5 vertigo episodes of moderate or severe intensity lasting 5 minutes to 72 hours, current or past history of 1.1/1.2 migraine, and ≥1 migraine feature (headache, photophobia/phonophobia, visual aura) during at least half of the vertigo episodes. The Bárány Society / IHS joint criteria are widely used clinically despite appendix status.',
    criteria: [
      { id: 'vm-A', label: 'Vertigo episodes with migrainous symptoms', description: 'Appendix A1.6.5 — vertigo episodes accompanied by migraine features (photophobia, phonophobia, visual aura, headache).', evaluate: s => has(s, 'vest-vertigo-migrainous'), contributingChips: ['vest-vertigo-migrainous'] },
      { id: 'vm-B', label: 'Migrainous features (photophobia/phonophobia, visual aura)', description: 'Appendix A1.6.5 — at least one migrainous feature during episodes.', evaluate: s => has(s, 'sym-photophobia') || has(s, 'sym-phonophobia') || has(s, 'aura-visual'), contributingChips: ['sym-photophobia', 'sym-phonophobia', 'aura-visual'] },
    ],
  },
];

// ─── Pure evaluator ───────────────────────────────────────────────────────

/**
 * Evaluate the user's chip selections against ICHD-3 criteria for every
 * phenotype. Returns matches ranked by match strength.
 *
 * Rules:
 *   - All criteria met → matchStrength: 'full'
 *   - All but one criterion met → matchStrength: 'probable' (X.5 framework)
 *   - Some criteria met but more than one missing → 'partial'
 *   - No criteria met → 'none' (excluded from output)
 *   - Phenotypes with hiddenUntilTrial=true are hidden until the
 *     definitional chip is selected (e.g. hemicrania continua / indo-tried-complete)
 *   - Continuous-headache selection suppresses purely episodic phenotypes
 *     (1.1 Migraine, 1.2 Migraine with aura, 2.2 Episodic TTH, 3.1 Cluster)
 *   - Probable-X cannot co-exist with a fulfilled X (X.5 exclusion clause).
 *     Handled by the caller: if migraine-without-aura is full match, the
 *     probable-migraine result is suppressed.
 */
export function evaluateHeadachePhenotypes(selected: Set<ChipId>): PhenotypeMatch[] {
  const matches: PhenotypeMatch[] = [];

  for (const phenotype of HEADACHE_PHENOTYPES) {
    // Hidden-until-trial gate (hemicrania continua)
    if (phenotype.hiddenUntilTrial) {
      const gateChip = phenotype.criteria.find(c => c.id === 'hc-D')?.contributingChips[0];
      if (gateChip && !selected.has(gateChip)) continue;
    }

    // Suppress episodic phenotypes when patient reports continuous headache
    const episodicPhenotypes: PhenotypeId[] = ['migraine-without-aura', 'migraine-with-aura', 'episodic-tth', 'cluster-headache'];
    if (episodicPhenotypes.includes(phenotype.id) && selected.has('dur-continuous')) continue;

    // Require at least one positive chip contributing to this phenotype. This
    // prevents phenotypes with "absence" criteria (e.g. TTH "no vomiting")
    // from trivially partial-matching on empty input.
    const allContributingChips = new Set<ChipId>();
    for (const c of phenotype.criteria) for (const cc of c.contributingChips) allContributingChips.add(cc);
    let hasPositiveEvidence = false;
    for (const id of allContributingChips) if (selected.has(id)) { hasPositiveEvidence = true; break; }
    if (!hasPositiveEvidence) continue;

    const met: { id: string; label: string }[] = [];
    const missing: { id: string; label: string; description: string }[] = [];

    for (const criterion of phenotype.criteria) {
      if (criterion.evaluate(selected)) met.push({ id: criterion.id, label: criterion.label });
      else missing.push({ id: criterion.id, label: criterion.label, description: criterion.description });
    }

    const total = phenotype.criteria.length;
    const metCount = met.length;
    let strength: 'full' | 'probable' | 'partial' | 'none';
    if (metCount === total) strength = 'full';
    else if (metCount === total - 1) strength = 'probable';
    else if (metCount > 0) strength = 'partial';
    else strength = 'none';

    if (strength === 'none') continue;

    matches.push({
      phenotypeId: phenotype.id,
      name: phenotype.name,
      ichd3Section: phenotype.ichd3Section,
      matchStrength: strength,
      criteriaMet: metCount,
      criteriaTotal: total,
      metCriteria: met,
      missingCriteria: missing,
      isAppendix: phenotype.isAppendix,
    });
  }

  // Probable-X exclusion: if X is full match, suppress probable-X (currently
  // we have no separate "probable-X" phenotype entries — Probable framework is
  // encoded by matchStrength: 'probable' on the same phenotype. So this is
  // already handled by construction.)

  // Sort: full > probable > partial; then by criteriaMet/Total ratio
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
