/**
 * headacheConflict — the Frame 3 runner-up "why this is not leading" derivation.
 *
 * Pure, React-free, clinical-text-free at the policy layer. It returns ONLY
 * references the result screen is allowed to render, per the clinical gate
 * (docs/reviews/clinical-headache-v4-spec.md, conditions C1–C3):
 *
 *   C1 (block): the line is derivable ONLY from (a) the candidate's own criterion
 *       label (its `missingCriteria`/`exclusionReason`, already engine-authored)
 *       and (b) the label of a chip the patient actually selected (getChip().label).
 *       This util never composes a new clinical claim — it points at two existing
 *       engine strings.
 *   C2: only ever called on a candidate present in the engine's output array; a
 *       phenotype absent from the array (hiddenUntilTrial pre-indomethacin) is
 *       never passed in, so no conflict line can be fabricated for it.
 *   C3: the "Conflicts with the [feature] you noted" contradiction form is emitted
 *       ONLY when the candidate's own EXCLUSION criterion (a suppress-gate) is
 *       violated by a chip the patient selected — same discriminator, opposite
 *       polarity. Otherwise the caller renders the plain-absence form ("Not noted
 *       yet"), never asserting a cross-phenotype contradiction the engine did not
 *       compute.
 */
import {
  HEADACHE_PHENOTYPES,
  getChip,
  type ChipId,
  type PhenotypeMatch,
} from './clinicHeadacheData';

export interface HeadacheConflict {
  /**
   * The candidate's own criterion that explains why it is not leading — verbatim
   * from the engine (`exclusionReason`, the failed suppress-gate label, or the top
   * missing criterion). Never reworded here.
   */
  criterionLabel: string;
  /**
   * A chip the patient selected that directly violates that criterion (C3). Present
   * ONLY for a genuine same-discriminator contradiction; absent → the caller uses
   * the plain-absence phrasing.
   */
  contradictingChipLabel?: string;
}

/**
 * Derive the runner-up conflict for a banded candidate. Returns null when there is
 * nothing to explain (a full match, or no missing/excluded criterion).
 */
export function deriveHeadacheConflict(
  candidate: PhenotypeMatch,
  selected: ReadonlySet<ChipId>,
): HeadacheConflict | null {
  const pheno = HEADACHE_PHENOTYPES.find(p => p.id === candidate.phenotypeId);

  // Set-aside (definitionallyExcluded): a suppress-gate failed on contradicting
  // evidence. Surface the failed criterion + the offending selected chip (C3).
  if (candidate.definitionallyExcluded) {
    if (pheno) {
      for (const crit of pheno.criteria) {
        if (crit.role !== 'suppress-gate') continue;
        // The gate that actually failed on the current selections.
        if (crit.evaluate(selected as Set<ChipId>)) continue;
        const offending = crit.contributingChips.find(id => selected.has(id));
        if (offending) {
          const chip = getChip(offending);
          return {
            criterionLabel: candidate.exclusionReason ?? crit.label,
            contradictingChipLabel: chip?.label,
          };
        }
      }
    }
    // Excluded but no selected chip pinpoints it — fall back to the neutral reason.
    if (candidate.exclusionReason) return { criterionLabel: candidate.exclusionReason };
    return null;
  }

  // Active runner-up (probable / partial): its top missing criterion. Plain absence
  // unless that very criterion is an exclusion the patient already violated (rare —
  // such a case would normally be definitionallyExcluded above; handled for safety).
  const missing = candidate.missingCriteria[0];
  if (!missing) return null;

  let contradictingChipLabel: string | undefined;
  const critDef = pheno?.criteria.find(c => c.id === missing.id);
  if (critDef && critDef.role === 'suppress-gate') {
    const offending = critDef.contributingChips.find(id => selected.has(id));
    if (offending) contradictingChipLabel = getChip(offending)?.label;
  }

  return { criterionLabel: missing.label, contradictingChipLabel };
}
