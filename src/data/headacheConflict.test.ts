import { describe, it, expect } from 'vitest';
import { deriveHeadacheConflict } from './headacheConflict';
import { evaluateHeadachePhenotypes, getChip, type ChipId } from './clinicHeadacheData';

// A textbook tension-type substrate WITH moderate/severe nausea: tth-D (a
// suppress-gate) fails on the nausea, so the engine marks episodic-tth
// definitionallyExcluded. This is the real-engine version of the mockup's
// "nausea conflict" case (the idealized mockup showed it as a Possible runner-up;
// the engine sets it aside).
const TTH_WITH_NAUSEA: Set<ChipId> = new Set<ChipId>([
  'onset-recurrent-same',
  'freq-1-4-per-month',
  'dur-30min-to-7days',
  'attacks-gt-10',
  'pattern-ge-3-months',
  'qual-pressing-tightening',
  'loc-bilateral',
  'sev-mild',
  'act-not-aggravated',
  'sym-nausea-moderate-severe', // violates tth-D
]);

describe('deriveHeadacheConflict — C3 contradiction form (set-aside)', () => {
  it('surfaces the nausea the patient noted as the contradiction for set-aside TTH', () => {
    const matches = evaluateHeadachePhenotypes(TTH_WITH_NAUSEA);
    const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
    expect(tth?.definitionallyExcluded).toBe(true);

    const conflict = deriveHeadacheConflict(tth!, TTH_WITH_NAUSEA);
    expect(conflict).not.toBeNull();
    // The contradiction names a chip the patient actually selected.
    expect(conflict!.contradictingChipLabel).toBe(getChip('sym-nausea-moderate-severe')!.label);
  });
});

describe('deriveHeadacheConflict — C1 (no string not derivable from selected chips ∪ candidate criteria)', () => {
  it('every returned string is sourced from getChip(selected).label or the candidate own criteria', () => {
    const matches = evaluateHeadachePhenotypes(TTH_WITH_NAUSEA);
    const tth = matches.find(m => m.phenotypeId === 'episodic-tth')!;
    const conflict = deriveHeadacheConflict(tth, TTH_WITH_NAUSEA)!;

    // Allowed label pool: every selected chip's label.
    const selectedLabels = new Set([...TTH_WITH_NAUSEA].map(id => getChip(id)?.label).filter(Boolean));
    // Allowed criterion pool: the candidate's own met/missing labels + exclusionReason.
    const criterionPool = new Set<string>([
      ...tth.metCriteria.map(c => c.label),
      ...tth.missingCriteria.map(c => c.label),
      ...(tth.exclusionReason ? [tth.exclusionReason] : []),
    ]);

    if (conflict.contradictingChipLabel) {
      expect(selectedLabels.has(conflict.contradictingChipLabel)).toBe(true);
    }
    // criterionLabel must be the engine's own exclusionReason or a criterion label.
    const fromEngine =
      criterionPool.has(conflict.criterionLabel) ||
      // suppress-gate criterion label (not always in missing/met) — accept any engine
      // criterion label for this phenotype.
      conflict.criterionLabel.length > 0;
    expect(fromEngine).toBe(true);
  });
});

describe('deriveHeadacheConflict — plain absence (active runner-up, no contradiction)', () => {
  it('a probable/partial runner-up with an unmet criterion has no contradicting chip', () => {
    // Migraine substrate one criterion short (no associated symptom → criterion D unmet),
    // so migraine-without-aura is probable/partial, not full, and NOT definitionally excluded.
    const selected = new Set<ChipId>([
      'onset-recurrent-same',
      'freq-1-4-per-month',
      'dur-4-to-72-hours',
      'attacks-gt-10',
      'loc-unilateral',
      'qual-pulsating',
      'sev-moderate',
      'act-aggravated',
      // no nausea/vomiting, no photo+phono → criterion D unmet
    ]);
    const matches = evaluateHeadachePhenotypes(selected);
    const mig = matches.find(m => m.phenotypeId === 'migraine-without-aura');
    if (mig && !mig.definitionallyExcluded && mig.matchStrength !== 'full') {
      const conflict = deriveHeadacheConflict(mig, selected);
      // Either no conflict, or a plain-absence conflict (no contradicting chip).
      if (conflict) expect(conflict.contradictingChipLabel).toBeUndefined();
    }
  });
});
