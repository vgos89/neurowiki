/**
 * headacheBanding — the clinical banding layer for the v4 headache pathway
 * ("live differential narrowing").
 *
 * Pure, deterministic, React-free, and clinical-text-free. It buckets the
 * engine's already-ranked `PhenotypeMatch[]` (from `evaluateHeadachePhenotypes`)
 * into the four v4 bands — Leading / Possible / Less likely / Set aside — for the
 * live differential and the result screen. It introduces NO new clinical claim:
 * a band is a presentation label over `matchStrength` + criteria fraction + rank
 * that the engine already computed. Display is dot meter + bare "N of M" + the
 * band word; NO percentages anywhere.
 *
 * Boundary (architect §17.1): this layer ONLY buckets and applies a deterministic
 * in-tier tie-break for reproducibility. It MUST NOT re-rank across strength
 * tiers — the engine owns primary ranking (its 84-test suite is the contract).
 *
 * Spec: docs/reviews/medsci-headache-v4-clinical-spec.md §1.
 * Clinical gate: docs/reviews/clinical-headache-v4-spec.md — conditions B2 (never
 * "Probable Chronic migraine"), B3 (promoted probable shows its §X.5 label), B4
 * (no invented Leading) are encoded and unit-tested here.
 */
import type { PhenotypeMatch } from './clinicHeadacheData';

export type Band = 'leading' | 'possible' | 'less-likely' | 'set-aside';

export interface BandedMatch {
  match: PhenotypeMatch;
  band: Band;
  /** True only when a `probable` was promoted to Leading because no `full` exists. */
  promoted: boolean;
}

export interface BandedResult {
  leading: BandedMatch[];
  possible: BandedMatch[];
  lessLikely: BandedMatch[];
  setAside: BandedMatch[];
  hasLeading: boolean;
  hasFull: boolean;
}

// Fixed ICHD-3 chapter order — the final, fully-deterministic tie-break
// (spec §1.4 step 3): §1 < §2 < §3 < §4 < appendix; within a chapter by section
// ascending. Removes any dependence on HEADACHE_PHENOTYPES declaration order,
// which is an implementation detail, not a clinical ranking.
const CHAPTER_ORDER: readonly string[] = [
  'migraine-without-aura',   // §1.1
  'migraine-with-aura',      // §1.2
  'chronic-migraine',        // §1.3
  'episodic-tth',            // §2.2
  'chronic-tth',             // §2.3
  'cluster-headache',        // §3.1
  'paroxysmal-hemicrania',   // §3.2
  'sunct-suna',              // §3.3
  'hemicrania-continua',     // §3.4
  'ndph',                    // §4.10
  'vestibular-migraine',     // §A1.6.6
];

const chapterIndex = (m: PhenotypeMatch): number => {
  const i = CHAPTER_ORDER.indexOf(m.phenotypeId);
  return i === -1 ? CHAPTER_ORDER.length : i;
};

const STRENGTH_RANK: Record<PhenotypeMatch['matchStrength'], number> = {
  full: 0, probable: 1, partial: 2, none: 3,
};

/**
 * bandPhenotypes — partition + bucket the engine's matches into the four bands.
 * (spec §1.2; gate B2/B3/B4.)
 *
 * Step 0 partitions `definitionallyExcluded` matches (the EMIT set) into Set
 * aside. Step 1 applies the per-band cut points to the remaining candidates in a
 * deterministic order. The single top-ranked `probable` promotes to Leading ONLY
 * when no `full` match exists; a `partial` never promotes (no invented Leading).
 */
export function bandPhenotypes(matches: PhenotypeMatch[]): BandedResult {
  const setAside: BandedMatch[] = [];
  const candidates: PhenotypeMatch[] = [];
  for (const m of matches) {
    if (m.definitionallyExcluded) setAside.push({ match: m, band: 'set-aside', promoted: false });
    else candidates.push(m);
  }

  // Deterministic tie-break WITHIN strength tier only (spec §1.4). Preserves the
  // engine's primary tier order (full > probable > partial), then a stable
  // secondary order so equal-strength ties are reproducible. Never crosses tiers.
  const sorted = [...candidates].sort((a, b) => {
    const sa = STRENGTH_RANK[a.matchStrength];
    const sb = STRENGTH_RANK[b.matchStrength];
    if (sa !== sb) return sa - sb;                                                   // tier (engine primary)
    if (b.criteriaMet !== a.criteriaMet) return b.criteriaMet - a.criteriaMet;       // higher absolute met
    if (b.criteriaTotal !== a.criteriaTotal) return b.criteriaTotal - a.criteriaTotal; // more fully characterised
    return chapterIndex(a) - chapterIndex(b);                                        // fixed ICHD-3 chapter order
  });

  const hasFull = sorted.some(m => m.matchStrength === 'full');
  const leading: BandedMatch[] = [];
  const possible: BandedMatch[] = [];
  const lessLikely: BandedMatch[] = [];
  let probablePromoted = false;

  for (const m of sorted) {
    if (m.matchStrength === 'full') {
      leading.push({ match: m, band: 'leading', promoted: false });
    } else if (m.matchStrength === 'probable') {
      // No-clean-lead promotion (spec §1.2 / §1.5c): the single top-ranked
      // probable becomes Leading ONLY when nothing reached full. Other probables
      // band Possible. A `partial` is never promoted (B4 — no invented Leading).
      if (!hasFull && !probablePromoted) {
        leading.push({ match: m, band: 'leading', promoted: true });
        probablePromoted = true;
      } else {
        possible.push({ match: m, band: 'possible', promoted: false });
      }
    } else {
      // partial: ≥2 criteria met → Possible; exactly 1 → Less likely (spec §1.2).
      if (m.criteriaMet >= 2) possible.push({ match: m, band: 'possible', promoted: false });
      else lessLikely.push({ match: m, band: 'less-likely', promoted: false });
    }
  }

  return {
    leading,
    possible,
    lessLikely,
    setAside,
    hasLeading: leading.length > 0,
    hasFull,
  };
}

/**
 * bandStrengthLabel — the strength qualifier prefix shown before a banded
 * phenotype name. Encodes the do-not-fabricate guards:
 *  - B2: chronic-migraine never reads "Probable" (ICHD-3 has no §1.5.3 Probable
 *    chronic migraine) — it reads "Partial match for".
 *  - a `full` match needs no qualifier.
 *  - other probables read "Probable"; partials read "Partial match for" (the
 *    anti-anchoring framing that pairs with the partial-match caveat, B1).
 *
 * The UI should render `${bandStrengthLabel(m)} ${m.name}` (qualifier omitted
 * when empty) and never construct the word "Probable" for chronic-migraine on
 * its own.
 */
export function bandStrengthLabel(m: PhenotypeMatch): string {
  if (m.matchStrength === 'full') return '';
  if (m.phenotypeId === 'chronic-migraine') return 'Partial match for';
  if (m.matchStrength === 'probable') return 'Probable';
  return 'Partial match for';
}
