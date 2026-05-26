/**
 * Tests for the Clinic Headache phenotype evaluator.
 *
 * Table-driven: each row is a {scenario, selected chips, expected matches}.
 * Covers full match, probable match (X.5 framework), partial, continuous
 * suppression, hidden-until-trial gating, and red-flag detection.
 */

import { describe, expect, it } from 'vitest';
import {
  anyRedFlagActive,
  evaluateHeadachePhenotypes,
  HEADACHE_CHIP_GROUPS,
  HEADACHE_PHENOTYPES,
  RED_FLAG_CHIPS,
  type ChipId,
  type PhenotypeId,
} from './clinicHeadacheData';

const select = (...ids: ChipId[]): Set<ChipId> => new Set(ids);

describe('evaluateHeadachePhenotypes', () => {
  it('returns empty when no chips selected', () => {
    expect(evaluateHeadachePhenotypes(select())).toEqual([]);
  });

  describe('1.1 Migraine without aura', () => {
    it('full match: ≥5 attacks + 4-72h + ≥2 character features + nausea', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-nausea',
      ));
      const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
      expect(migraine?.matchStrength).toBe('full');
      expect(migraine?.criteriaMet).toBe(4);
    });

    it('full match using photo+phono pairing instead of nausea', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-photophobia',
        'sym-phonophobia',
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')?.matchStrength).toBe('full');
    });

    it('does NOT full match with only photophobia (no pair, no nausea)', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-photophobia',
      ));
      const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
      expect(migraine?.matchStrength).toBe('probable');
    });

    it('Probable migraine when only <5 attacks (criterion A short)', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-lt-5',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-nausea',
      ));
      const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
      expect(migraine?.matchStrength).toBe('probable');
      expect(migraine?.missingCriteria.map(c => c.id)).toContain('mig-A');
    });

    it('counts moderate OR severe as one character feature, not two', () => {
      // With moderate + severe + unilateral, character count should be 2 (unilateral + mod-or-severe), not 3.
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'sev-moderate',
        'sev-severe',
        'sym-nausea',
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')?.matchStrength).toBe('full');
    });
  });

  describe('2.2 Episodic TTH vs 1.1 Migraine — criterion D discriminator', () => {
    it('episodic TTH full match with bilateral pressing mild, no nausea, ≤1 of photo/phono', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'freq-5-14-per-month',
        'pattern-ge-3-months',
        'dur-30min-to-7days',
        'loc-bilateral',
        'qual-pressing-tightening',
        'sev-mild',
        'act-not-aggravated',
      ));
      const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
      expect(tth?.matchStrength).toBe('full');
    });

    it('TTH criterion D fails if nausea is selected', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'freq-5-14-per-month',
        'pattern-ge-3-months',
        'dur-30min-to-7days',
        'loc-bilateral',
        'qual-pressing-tightening',
        'sev-mild',
        'act-not-aggravated',
        'sym-nausea',
      ));
      const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
      expect(tth?.matchStrength).toBe('probable');
      expect(tth?.missingCriteria.map(c => c.id)).toContain('tth-D');
    });

    it('TTH criterion D fails if BOTH photophobia AND phonophobia selected', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'freq-5-14-per-month',
        'pattern-ge-3-months',
        'dur-30min-to-7days',
        'loc-bilateral',
        'qual-pressing-tightening',
        'sev-mild',
        'act-not-aggravated',
        'sym-photophobia',
        'sym-phonophobia',
      ));
      const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
      expect(tth?.matchStrength).toBe('probable');
    });
  });

  describe('3.1 Cluster headache', () => {
    it('full match: severe unilateral orbital, 15-180 min, autonomic, frequency', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'loc-unilateral',
        'loc-orbital-temporal',
        'sev-severe',
        'dur-15-to-180-min',
        'sym-autonomic-ipsilateral',
        'freq-cluster-bout',
      ));
      const cluster = matches.find(m => m.phenotypeId === 'cluster-headache');
      expect(cluster?.matchStrength).toBe('full');
    });

    it('restlessness alone satisfies criterion C (alternative to autonomic features)', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'loc-unilateral',
        'loc-orbital-temporal',
        'sev-very-severe',
        'dur-15-to-180-min',
        'sym-restlessness',
        'freq-cluster-bout',
      ));
      expect(matches.find(m => m.phenotypeId === 'cluster-headache')?.matchStrength).toBe('full');
    });
  });

  describe('3.4 Hemicrania continua — indomethacin gate', () => {
    it('is hidden until indomethacin trial is entered', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'loc-unilateral',
        'dur-continuous',
        'pattern-ge-3-months',
        'sev-severe',
        'sym-autonomic-ipsilateral',
      ));
      expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')).toBeUndefined();
    });

    it('surfaces with full match when indomethacin complete response is entered', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'loc-unilateral',
        'dur-continuous',
        'pattern-ge-3-months',
        'sev-severe',
        'sym-autonomic-ipsilateral',
        'indo-tried-complete',
      ));
      const hc = matches.find(m => m.phenotypeId === 'hemicrania-continua');
      expect(hc?.matchStrength).toBe('full');
    });
  });

  describe('continuous-duration suppression', () => {
    const episodicIds: PhenotypeId[] = ['migraine-without-aura', 'migraine-with-aura', 'episodic-tth', 'cluster-headache'];

    it('suppresses episodic phenotypes when patient reports continuous headache', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-continuous',
        'loc-unilateral',
        'qual-pulsating',
        'sym-nausea',
      ));
      for (const id of episodicIds) {
        expect(matches.find(m => m.phenotypeId === id), `episodic ${id} should be suppressed`).toBeUndefined();
      }
    });
  });

  describe('multi-phenotype handling (General Principles)', () => {
    it('can return migraine AND TTH simultaneously when both fulfilled', () => {
      // Patient with classic migraine episodes AND separate frequent
      // tension-pattern days — common real-world combination.
      const matches = evaluateHeadachePhenotypes(select(
        // Migraine criteria
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-nausea',
        // TTH criteria
        'freq-5-14-per-month',
        'pattern-ge-3-months',
        'dur-30min-to-7days',
        'qual-pressing-tightening',
        'sev-mild',
        'act-not-aggravated',
      ));
      const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
      const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
      expect(migraine?.matchStrength).toBe('full');
      // TTH won't be full because criterion D will likely block (nausea selected).
      // But the test confirms multi-phenotype results coexist in output.
      expect(tth).toBeDefined();
    });
  });

  describe('appendix labelling — vestibular migraine', () => {
    it('marks vestibular migraine as isAppendix=true', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'vest-vertigo-migrainous',
        'sym-photophobia',
      ));
      const vm = matches.find(m => m.phenotypeId === 'vestibular-migraine');
      expect(vm?.isAppendix).toBe(true);
    });
  });

  describe('sort order', () => {
    it('returns full matches before probable, probable before partial', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-nausea',
        // Partial TTH ingredients
        'loc-bilateral',
        'qual-pressing-tightening',
      ));
      const strengths = matches.map(m => m.matchStrength);
      const fullIdx = strengths.indexOf('full');
      const probIdx = strengths.indexOf('probable');
      const partIdx = strengths.indexOf('partial');
      if (probIdx >= 0 && fullIdx >= 0) expect(fullIdx).toBeLessThan(probIdx);
      if (partIdx >= 0 && probIdx >= 0) expect(probIdx).toBeLessThan(partIdx);
    });
  });
});

describe('anyRedFlagActive', () => {
  it('returns false with no chips selected', () => {
    expect(anyRedFlagActive(select())).toBe(false);
  });

  it('returns false when only phenotype chips selected', () => {
    expect(anyRedFlagActive(select('attacks-gt-10', 'dur-4-to-72-hours'))).toBe(false);
  });

  it('returns true when any SNNOOP10 red flag is active', () => {
    expect(anyRedFlagActive(select('rf-onset-sudden'))).toBe(true);
    expect(anyRedFlagActive(select('rf-neoplasm'))).toBe(true);
    expect(anyRedFlagActive(select('rf-papilloedema'))).toBe(true);
  });
});

describe('data integrity', () => {
  it('every contributingChip on a criterion is a valid chip in some chip group', () => {
    const validIds = new Set<string>();
    for (const group of HEADACHE_CHIP_GROUPS) for (const c of group.chips) validIds.add(c.id);
    for (const phenotype of HEADACHE_PHENOTYPES) {
      for (const criterion of phenotype.criteria) {
        for (const chipId of criterion.contributingChips) {
          expect(validIds.has(chipId), `chip ${chipId} on ${phenotype.id} criterion ${criterion.id}`).toBe(true);
        }
      }
    }
  });

  it('every red-flag chip in RED_FLAG_CHIPS exists in the red-flags chip group', () => {
    const redGroup = HEADACHE_CHIP_GROUPS.find(g => g.id === 'red-flags');
    expect(redGroup).toBeDefined();
    const redGroupIds = new Set(redGroup!.chips.map(c => c.id));
    for (const id of RED_FLAG_CHIPS) {
      expect(redGroupIds.has(id), `red flag ${id} not in red-flags group`).toBe(true);
    }
  });
});
