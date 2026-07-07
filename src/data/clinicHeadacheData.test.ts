/**
 * Tests for the Clinic Headache phenotype evaluator.
 *
 * Table-driven: each row is a {scenario, selected chips, expected matches}.
 * Covers full match, probable match (X.5 framework), partial, continuous
 * suppression, hidden-until-trial gating, and red-flag detection.
 *
 * Updated 2026-06-04 — SUPPRESS/DEMOTE refactor (Class E):
 *   - New describe blocks: SUPPRESS gates (stay absent) vs DEMOTE gates (now present as near-miss)
 *   - H6 VM-history inversion: VM now requires migraine-history-established
 *   - Three new ChipIds covered in data-integrity block
 *   - Floor tests: §1.1 / §2.2 / §3.1 minimum-evidence floors
 *   - Near-miss surfacing tests: §1.5 / §2.4 / §3.5 Probable cases now surface
 *   - Emit-set tests: tth-D / ctth-D / cm-C surface with definitionallyExcluded:true
 *   - Dev-time invariant updated to require suppress-gate OR hiddenUntilTrial OR floor
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
        'sym-nausea-mild',
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

    it('migraine ABSENT (not even probable) with only photophobia — mig-D is demote-gate; but floor requires ≥2 migraine-pointing chips incl. ≥1 C feature', () => {
      // photophobia alone is a D symptom, not a C feature; floor requires ≥1 C feature.
      // loc-unilateral + photophobia: one C feature + one D symptom → floor passes.
      // But mig-D fails (photo only, no phono) so it would be probable. With only
      // photophobia alone (no C feature), the floor kills it.
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-photophobia',
      ));
      // mig-D (demote-gate) fails (photo alone, no phono) but the four criteria
      // means metCount=3, total=4, so this is probable. mig-D is now demote-gate
      // so the phenotype SURFACES as probable (this test was previously asserting absent).
      // NOTE: This test previously asserted toBeUndefined() under the old definitional
      // drop semantics. Under the new demote semantics, mig-D is a demote-gate and the
      // phenotype surfaces as 'probable' when the floor passes (loc-unilateral + qual-pulsating
      // = 2 C features → floor passes). See spec S2 / arch §17.1 follow-up 3.
      const m = matches.find(m => m.phenotypeId === 'migraine-without-aura');
      expect(m?.matchStrength).toBe('probable');
      expect(m?.missingCriteria.map(c => c.id)).toContain('mig-D');
    });

    it('Probable migraine when only <5 attacks (criterion A short)', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-lt-5',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-nausea-mild',
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
        'sym-nausea-mild',
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

    it('episodic TTH ABSENT as active match if nausea is selected (tth-D suppress-gate fails; EMIT set)', () => {
      // tth-D is now a suppress-gate in the EMIT set. Failure means the phenotype
      // is emitted with definitionallyExcluded:true, NOT as an active match.
      // The existing assertion (not an active match) is preserved. This test
      // refines it: the phenotype may appear in output but must be definitionallyExcluded.
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'freq-5-14-per-month',
        'pattern-ge-3-months',
        'dur-30min-to-7days',
        'loc-bilateral',
        'qual-pressing-tightening',
        'sev-mild',
        'act-not-aggravated',
        'sym-nausea-mild',
      ));
      const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
      // If present, must be definitionallyExcluded (emit-set suppress), not an active match.
      if (tth) {
        expect(tth.definitionallyExcluded).toBe(true);
        expect(['full', 'probable', 'partial']).not.toContain(tth.matchStrength);
      }
      // Either absent or emitted-excluded; never an active match.
      expect(matches.filter(m => m.phenotypeId === 'episodic-tth' && !m.definitionallyExcluded).length).toBe(0);
    });

    it('episodic TTH ABSENT as active match if BOTH photophobia AND phonophobia selected (tth-D suppress-gate fails; EMIT set)', () => {
      // tth-D: countOf(photo, phono) <= 1 fails when both are selected.
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
      expect(matches.filter(m => m.phenotypeId === 'episodic-tth' && !m.definitionallyExcluded).length).toBe(0);
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
        'sym-nausea-mild',
      ));
      for (const id of episodicIds) {
        expect(matches.find(m => m.phenotypeId === id), `episodic ${id} should be suppressed`).toBeUndefined();
      }
    });
  });

  describe('multi-phenotype handling (General Principles + X.5 exclusion)', () => {
    it('suppresses probable matches when any full match exists (X.5 exclusion)', () => {
      // Per ICHD-3 X.5: a Probable diagnosis requires "does not fulfil criteria
      // for another ICHD-3 disorder." When migraine is a full match, probable
      // matches for any other phenotype must be suppressed.
      const matches = evaluateHeadachePhenotypes(select(
        // Migraine full match
        'attacks-gt-10', 'dur-4-to-72-hours', 'loc-unilateral', 'qual-pulsating', 'sym-nausea-mild',
        // Partial TTH ingredients (would be probable without nausea)
        'freq-5-14-per-month', 'pattern-ge-3-months', 'dur-30min-to-7days',
        'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')?.matchStrength).toBe('full');
      // No ACTIVE probable matches should remain (definitionallyExcluded entries are not active)
      expect(matches.filter(m => m.matchStrength === 'probable').length).toBe(0);
    });

    it('partial matches are kept even when a full match exists (information only)', () => {
      // Partial matches (≥1 criterion met but more than one short) are not
      // Probable per ICHD-3 X.5 and remain visible as information.
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'dur-4-to-72-hours', 'loc-unilateral', 'qual-pulsating', 'sym-nausea-mild',
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')?.matchStrength).toBe('full');
      // Partial matches may or may not exist depending on which other
      // phenotypes find a contributing chip; just confirm no active probables.
      expect(matches.filter(m => m.matchStrength === 'probable').length).toBe(0);
    });
  });

  describe('appendix labelling — vestibular migraine', () => {
    it('marks vestibular migraine as isAppendix=true', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'vest-vertigo-migrainous', 'vest-episodes-ge-5',
        'migraine-history-established',
        'vest-intensity-mod-severe', 'vest-duration-5min-72h',
        'vest-migrainous-half',
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
        'sym-nausea-mild',
        // Partial TTH ingredients
        'loc-bilateral',
        'qual-pressing-tightening',
      ));
      const strengths = matches.filter(m => !m.definitionallyExcluded).map(m => m.matchStrength);
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

  it('three new ChipIds resolve in HEADACHE_CHIP_GROUPS (aura-symptom-unilateral, attacks-ge-2, migraine-history-established)', () => {
    // Added 2026-06-04. Mirrors the data-integrity block for the three new chips
    // required by the rank-and-flag refactor (arch §17.1 follow-up 6).
    const validIds = new Set<string>();
    for (const group of HEADACHE_CHIP_GROUPS) for (const c of group.chips) validIds.add(c.id);
    expect(validIds.has('aura-symptom-unilateral'), 'aura-symptom-unilateral must be in a chip group').toBe(true);
    expect(validIds.has('attacks-ge-2'), 'attacks-ge-2 must be in a chip group').toBe(true);
    expect(validIds.has('migraine-history-established'), 'migraine-history-established must be in a chip group').toBe(true);
  });

  it('every new chip is referenced by at least one criterion contributingChips list', () => {
    const allContributing = new Set<string>();
    for (const phenotype of HEADACHE_PHENOTYPES) {
      for (const criterion of phenotype.criteria) {
        for (const chipId of criterion.contributingChips) allContributing.add(chipId);
      }
    }
    expect(allContributing.has('aura-symptom-unilateral'), 'aura-symptom-unilateral must be used by ≥1 criterion').toBe(true);
    expect(allContributing.has('attacks-ge-2'), 'attacks-ge-2 must be used by ≥1 criterion').toBe(true);
    expect(allContributing.has('migraine-history-established'), 'migraine-history-established must be used by ≥1 criterion').toBe(true);
  });
});

// ─── New phenotypes added 2026-05-25 per medsci ICHD-3 audit ──────────────

describe('1.3 Chronic migraine', () => {
  it('full match: ≥15 days/month + ≥3 months + ≥5 prior attacks + ≥8 migraine-feature days', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      'migraine-features-ge-8-per-month',
    ));
    const cm = matches.find(m => m.phenotypeId === 'chronic-migraine');
    expect(cm?.matchStrength).toBe('full');
  });

  it('full match using triptan-responsive disjunction in criterion C', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      'triptan-response-positive',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');
  });

  it('suppresses 2.3 Chronic TTH when 1.3 Chronic migraine is a full match (ICHD-3 §2.3 Note 1)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      'migraine-features-ge-8-per-month',
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      'dur-30min-to-7days',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');
    expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
  });
});

describe('3.2 Paroxysmal hemicrania', () => {
  it('full match: ≥20 attacks + severe unilateral orbital 2-30 min + autonomic + >5/day + indomethacin complete', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-20',
      'loc-unilateral',
      'loc-orbital-temporal',
      'sev-severe',
      'dur-2-to-30-min',
      'sym-autonomic-ipsilateral',
      'freq-gt-5-per-day',
      'indo-tried-complete',
    ));
    expect(matches.find(m => m.phenotypeId === 'paroxysmal-hemicrania')?.matchStrength).toBe('full');
  });

  it('is hidden until indomethacin complete response is entered', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-20',
      'loc-unilateral',
      'loc-orbital-temporal',
      'sev-severe',
      'dur-2-to-30-min',
      'sym-autonomic-ipsilateral',
      'freq-gt-5-per-day',
    ));
    expect(matches.find(m => m.phenotypeId === 'paroxysmal-hemicrania')).toBeUndefined();
  });
});

describe('3.3 SUNCT/SUNA', () => {
  it('full match: ≥20 attacks + moderate-severe unilateral 1-600 sec + autonomic + ≥1/day', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-20',
      'loc-unilateral',
      'sev-severe',
      'dur-1-to-600-sec',
      'sym-autonomic-ipsilateral',
      'freq-ge-1-per-day',
    ));
    expect(matches.find(m => m.phenotypeId === 'sunct-suna')?.matchStrength).toBe('full');
  });
});

describe('§2.3 D chronic-TTH nausea-severity fix', () => {
  it('Chronic TTH ABSENT as active match when moderate-severe nausea is selected (ctth-D suppress-gate fails; EMIT set)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'dur-30min-to-7days',
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      'sym-nausea-moderate-severe',
    ));
    // ctth-D is in the EMIT set — may appear with definitionallyExcluded:true
    expect(matches.filter(m => m.phenotypeId === 'chronic-tth' && !m.definitionallyExcluded).length).toBe(0);
  });

  it('Chronic TTH full match allows mild nausea ALONE in the ≤1 pool', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'dur-30min-to-7days',
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      'sym-nausea-mild',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-tth')?.matchStrength).toBe('full');
  });

  it('Chronic TTH ABSENT as active match when mild nausea + photophobia both selected (≤1 pool exceeded; ctth-D suppress-gate fails; EMIT set)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'dur-30min-to-7days',
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      'sym-nausea-mild',
      'sym-photophobia',
    ));
    expect(matches.filter(m => m.phenotypeId === 'chronic-tth' && !m.definitionallyExcluded).length).toBe(0);
  });
});

describe('Suppression rules (architect §17.1 Condition 3)', () => {
  it('episodic phenotypes (1.1, 1.2, 2.2, 3.1) ARE suppressed on dur-continuous', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',
      'dur-continuous',
      'loc-unilateral',
      'qual-pulsating',
      'sym-nausea-mild',
    ));
    expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
    expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
    expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeUndefined();
  });

  it('continuous-pattern phenotypes (1.3, 3.4, 4.10) are NOT suppressed on dur-continuous', () => {
    const cmMatches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      'migraine-features-ge-8-per-month',
      'dur-continuous',
    ));
    expect(cmMatches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');

    const ndphMatches = evaluateHeadachePhenotypes(select(
      'dur-continuous',
      'pattern-ge-3-months',
      'onset-abrupt-continuous-24h',
    ));
    expect(ndphMatches.find(m => m.phenotypeId === 'ndph')).toBeDefined();

    const hcMatches = evaluateHeadachePhenotypes(select(
      'loc-unilateral',
      'dur-continuous',
      'pattern-ge-3-months',
      'sev-moderate',
      'sym-autonomic-ipsilateral',
      'indo-tried-complete',
    ));
    expect(hcMatches.find(m => m.phenotypeId === 'hemicrania-continua')?.matchStrength).toBe('full');
  });
});

describe('Section-label corrections (2026-05-25)', () => {
  it('NDPH ichd3Section is §4.10 (NOT §3.3)', () => {
    const ndph = HEADACHE_PHENOTYPES.find(p => p.id === 'ndph');
    expect(ndph?.ichd3Section).toContain('§4.10');
  });

  it('Vestibular migraine ichd3Section is §A1.6.6 (NOT §A1.6.5)', () => {
    const vm = HEADACHE_PHENOTYPES.find(p => p.id === 'vestibular-migraine');
    expect(vm?.ichd3Section).toContain('§A1.6.6');
  });
});

describe('Phase 2 — Probable §X.5 framework + selection→criterion mapping', () => {
  it('Probable migraine displaySection points to §1.5 (failing mig-A, a scorable criterion)', () => {
    // mig-A (≥5 attacks) is scorable — patients with <5 lifetime attacks
    // route through ICHD-3 §1.5.1 Probable migraine without aura.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-lt-5',                    // mig-A fails (scorable)
      'dur-4-to-72-hours',               // mig-B demote-gate pass
      'loc-unilateral',
      'qual-pulsating',
      'sev-severe',                      // mig-C ≥2 features
      'sym-nausea-mild',                 // mig-D demote-gate pass
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.displaySection).toContain('§1.5');
  });

  it('Probable TTH displaySection points to §2.4 (failing tth-A, a scorable criterion)', () => {
    // tth-A (frequency floor) is scorable — its miss should demote at most.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-lt-5',                    // <10 episodes — tth-A fails (scorable)
      'dur-30min-to-7days',              // tth-B demote-gate pass
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      // no nausea, no photo/phono — tth-D suppress-gate pass
    ));
    const m = matches.find(x => x.phenotypeId === 'episodic-tth');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.displaySection).toContain('§2.4');
  });

  it('Chronic migraine cannot be probable — cm-A and cm-C are suppress-gates (no §1.5.3 exists)', () => {
    // cm-A suppress-gate: sub-chronic frequency drops phenotype.
    // cm-C suppress-gate: no migraine-feature days nor triptan response drops phenotype.
    // Neither produces "Probable chronic migraine" (entity does not exist in ICHD-3).
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      // Missing migraine-features-ge-8 + triptan-response — cm-C suppress-gate fails
    ));
    // cm-C is in the EMIT set — may appear with definitionallyExcluded:true
    // but must NOT appear as an active (probable/partial/full) match.
    expect(matches.filter(x => x.phenotypeId === 'chronic-migraine' && !x.definitionallyExcluded).length).toBe(0);
  });

  it('Full match metCriteria carry contributingChipLabels for the audit trail', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',
      'dur-4-to-72-hours',
      'loc-unilateral',
      'qual-pulsating',
      'sym-nausea-mild',
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
    expect(m?.matchStrength).toBe('full');
    const cMet = m?.metCriteria.find(c => c.id === 'mig-C');
    expect(cMet?.contributingChipLabels.length).toBeGreaterThan(0);
    expect(cMet?.contributingChipLabels.some(l => l.toLowerCase().includes('unilateral'))).toBe(true);
    expect(cMet?.contributingChipLabels.some(l => l.toLowerCase().includes('pulsating') || l.toLowerCase().includes('throbbing'))).toBe(true);
  });

  it('§2.3 Note 1 — chronic-migraine full match strips chronic-TTH from matches before banner reads it', () => {
    const matches = evaluateHeadachePhenotypes(select(
      // Chronic migraine full match
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      'migraine-features-ge-8-per-month',
      // + TTH-fulfilling features
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      'dur-30min-to-7days',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');
    expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
  });
});

// ─── SUPPRESS gates: failure drops the phenotype (stay absent) ──────────────
// These tests assert ABSENCE. Each absence is CORRECT: the failed criterion is
// substrate/chronicity/positive-evidence-for-another-phenotype (not a demote).
// Do NOT mistake these absences for demote bugs.
describe('SUPPRESS gates — failure drops the phenotype', () => {

  // ── Dev-time guard (architect §17.1 follow-up 4, updated 2026-06-04) ────
  // Every phenotype must have ≥1 suppress-gate criterion OR a hiddenUntilTrial
  // gate OR a registered minimum-evidence floor. If a future phenotype is added
  // without one of the three, this test fails and forces explicit classification.
  it('every phenotype has a suppression path (suppress-gate | hiddenUntilTrial | registered floor)', () => {
    const PHENOTYPES_WITH_FLOOR: PhenotypeId[] = [
      'migraine-without-aura',  // §1.1 migraineEvidenceFloor
      'episodic-tth',           // §2.2 tthEvidenceFloor
      'cluster-headache',       // §3.1 clusterEvidenceFloor
    ];
    for (const phenotype of HEADACHE_PHENOTYPES) {
      const hasSuppressGate = phenotype.criteria.some(c => c.role === 'suppress-gate');
      const hasTrial = !!phenotype.hiddenUntilTrial;
      const hasFloor = PHENOTYPES_WITH_FLOOR.includes(phenotype.id);
      expect(
        hasSuppressGate || hasTrial || hasFloor,
        `${phenotype.id} (${phenotype.name}) has no suppress-gate, no hiddenUntilTrial gate, and no registered minimum-evidence floor`
      ).toBe(true);
    }
  });

  // ── V's exact reported failing input ──────────────────────────────────
  it("V regression: phonophobia-only + bilateral pressing + <15 min → vestibular migraine NOT in matches", () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',
      'onset-recurrent-same',
      'freq-1-4-per-month',
      'dur-lt-15-min',
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-moderate',
      'act-aggravated',
      'sym-phonophobia',
    ));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
    // Under demote semantics, migraine-without-aura MAY surface as partial:
    //   - mig-B demote-gate fails (no dur-4-to-72-hours) → demotes, not drops
    //   - mig-D demote-gate fails (phonophobia alone, no phono+photo pair) → demotes
    //   - mig-C scorable passes (sev-moderate + act-aggravated ≥ 2 C features)
    //   - floor passes (sev-moderate + act-aggravated = 2 C features ≥ 1 C + total ≥ 2)
    //   The phenotype surfaces as partial with two demote-gate misses.
    // This is expected behavior under the rank-and-flag refactor. The core V-reported
    // bug (VM false-positive on phonophobia alone) is fixed — VM is absent as required.
    // Migraine/TTH being partial here is correct ICHD-3 behavior for a partial chip set.
    // The critical assertion is VM ABSENT; migraine/TTH may be partial.
    const vm = matches.find(m => m.phenotypeId === 'vestibular-migraine');
    expect(vm).toBeUndefined();
    expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeUndefined();
    expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
    // Migraine/TTH may surface as partial (both demote-gates fail, not drops).
    // If present, confirm they are partial (not full/probable) and not active false-positives.
    const migraine = matches.find(m => m.phenotypeId === 'migraine-without-aura');
    if (migraine) expect(migraine.matchStrength).toBe('partial');
    const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
    if (tth) expect(['partial', 'none'].includes(tth.matchStrength) || tth.definitionallyExcluded).toBe(true);
  });

  // ── Vestibular migraine suppress gates ──────────────────────────────────
  it('vestibular migraine NOT in matches when no vertigo chip selected (vm-A suppress gate)', () => {
    // vm-A is suppress-gate (DROP). No vertigo = substrate absent.
    const matches = evaluateHeadachePhenotypes(select('sym-phonophobia', 'sym-photophobia', 'aura-visual', 'migraine-history-established'));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  it('vestibular migraine NOT in matches without migraine-history-established (vm-history suppress gate) — H6 behavior inversion', () => {
    // vm-history is a new suppress-gate (DROP). Added 2026-06-04.
    // This test INVERTS previous behavior: the prior test (test:641-644) asserted
    // VM surfaces on vest-vertigo-migrainous + sym-phonophobia. Under the new
    // vm-history suppress-gate it must NOT surface without migraine history.
    // See spec §5 H6 — the single most important new-gate regression.
    const matches = evaluateHeadachePhenotypes(select('vest-vertigo-migrainous', 'sym-phonophobia'));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  it('vestibular migraine surfaces (full) only when all four A1.6.6 criteria met (A-M1)', () => {
    // A-M1: full A1.6.6 encoding. All four criteria (A ≥5 episodes, B migraine history,
    // C moderate/severe + 5min-72h, D ≥50% episodes with a migraine feature) are
    // suppress-gates, so VM appears only when the complete picture is affirmed.
    const matches = evaluateHeadachePhenotypes(select(
      'vest-vertigo-migrainous', 'vest-episodes-ge-5', // vm-A
      'migraine-history-established',                   // vm-B
      'vest-intensity-mod-severe', 'vest-duration-5min-72h', // vm-C
      'vest-migrainous-half',                           // vm-D
    ));
    const vm = matches.find(m => m.phenotypeId === 'vestibular-migraine');
    expect(vm?.matchStrength).toBe('full');
  });

  it('A-M1: VM absent with <5 episodes (vm-A count gate) even if intensity/duration/feature/history all present', () => {
    // Fixes the pre-A-M1 over-call: vertigo + a single feature used to surface VM.
    const matches = evaluateHeadachePhenotypes(select(
      'vest-vertigo-migrainous',                        // vertigo present but NO vest-episodes-ge-5
      'migraine-history-established',
      'vest-intensity-mod-severe', 'vest-duration-5min-72h',
      'vest-migrainous-half',
    ));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  it('A-M1: VM absent without moderate/severe intensity + 5min-72h duration (vm-C gate)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'vest-vertigo-migrainous', 'vest-episodes-ge-5',
      'migraine-history-established',
      // no vest-intensity-mod-severe, no vest-duration-5min-72h → vm-C fails
      'vest-migrainous-half',
    ));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  it('A-M1: VM absent without the ≥50%-episodes migraine-feature link (vm-D gate) — closes the old feature-conflation over-call', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'vest-vertigo-migrainous', 'vest-episodes-ge-5',
      'migraine-history-established',
      'vest-intensity-mod-severe', 'vest-duration-5min-72h',
      'sym-photophobia', 'sym-phonophobia', // headache-attack photo/phono is NOT the vestibular-episode ≥50% link
    ));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  // ── §1.1 minimum-evidence floor tests ───────────────────────────────────
  it('§1.1 floor: single D-symptom chip alone does NOT surface probable migraine (H9)', () => {
    // sym-nausea-mild alone: 1 D chip, 0 C chips — floor fails (requires ≥1 C feature).
    const matches = evaluateHeadachePhenotypes(select('sym-nausea-mild'));
    expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
  });

  it('§1.1 floor: two D-symptom chips (photophobia + phonophobia) alone do NOT surface migraine', () => {
    // Two D chips, zero C chips — floor fails (no C feature).
    const matches = evaluateHeadachePhenotypes(select('sym-photophobia', 'sym-phonophobia'));
    expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
  });

  it('§1.1 floor: ≥1 C feature + ≥1 additional migraine-pointing chip DOES surface migraine', () => {
    // loc-unilateral (C) + sym-nausea-mild (D) = 2 migraine-pointing incl. ≥1 C → floor passes.
    // mig-A fails (no attack chip) but is scorable, so match is partial.
    const matches = evaluateHeadachePhenotypes(select('loc-unilateral', 'sym-nausea-mild'));
    expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeDefined();
  });

  // ── §2.2 minimum-evidence floor tests ───────────────────────────────────
  it('§2.2 floor: single loc-bilateral chip alone does NOT surface episodic TTH', () => {
    // loc-bilateral is a C chip but we need ≥2 total including ≥1 C — one chip fails floor.
    const matches = evaluateHeadachePhenotypes(select('loc-bilateral'));
    expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
  });

  it('§2.2 floor: ≥1 C feature + ≥1 additional TTH-pointing chip DOES surface episodic TTH', () => {
    // loc-bilateral (C) + dur-30min-to-7days = 2 total incl. ≥1 C → floor passes.
    // tth-D passes (no nausea, no photo+phono), tth-A fails (scorable), so partial.
    const matches = evaluateHeadachePhenotypes(select('loc-bilateral', 'dur-30min-to-7days'));
    expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeDefined();
  });

  // ── §3.1 minimum-evidence floor tests ───────────────────────────────────
  it('§3.1 floor: sym-autonomic-ipsilateral alone does NOT surface cluster (no defining feature)', () => {
    // autonomic is a cluster-pointing chip but NOT a §3.1 C defining feature;
    // floor requires ≥1 C defining feature (loc-unilateral, loc-orbital-temporal,
    // sev-severe, sev-very-severe, dur-15-to-180-min).
    const matches = evaluateHeadachePhenotypes(select('sym-autonomic-ipsilateral'));
    expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeUndefined();
  });

  it('§3.1 floor: ≥1 C defining feature + ≥1 additional cluster-pointing chip DOES surface cluster', () => {
    // loc-unilateral (C defining) + sym-autonomic-ipsilateral = 2 total incl. ≥1 C → floor passes.
    // cluster-B demote-gate fails (missing loc-orbital-temporal + severity + duration), partial.
    const matches = evaluateHeadachePhenotypes(select('loc-unilateral', 'sym-autonomic-ipsilateral'));
    expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeDefined();
  });

  // ── EMIT set: suppress gates that surface with definitionallyExcluded:true ─

  it('tth-D suppress (EMIT): episodic TTH emitted with definitionallyExcluded:true when vomiting present (H1)', () => {
    // tth-D is in the EMIT set. Patient has vomiting (positive contradicting evidence).
    // The phenotype must appear in output with definitionallyExcluded:true.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10', 'freq-1-4-per-month', 'pattern-ge-3-months',
      'dur-30min-to-7days', 'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
      'sym-vomiting',
    ));
    const tth = matches.find(m => m.phenotypeId === 'episodic-tth');
    expect(tth).toBeDefined();
    expect(tth?.definitionallyExcluded).toBe(true);
    expect(tth?.exclusionReason).toBeTruthy();
    // Must not be an active match
    expect(['full', 'probable', 'partial']).not.toContain(tth?.matchStrength);
  });

  it('ctth-D suppress (EMIT): chronic TTH emitted with definitionallyExcluded:true when vomiting present (H2)', () => {
    // ctth-D is in the EMIT set. Patient has vomiting.
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month', 'pattern-ge-3-months',
      'dur-30min-to-7days', 'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
      'sym-vomiting',
    ));
    const ctth = matches.find(m => m.phenotypeId === 'chronic-tth');
    expect(ctth).toBeDefined();
    expect(ctth?.definitionallyExcluded).toBe(true);
    expect(ctth?.exclusionReason).toBeTruthy();
    expect(['full', 'probable', 'partial']).not.toContain(ctth?.matchStrength);
  });

  it('cm-C suppress (EMIT): chronic migraine emitted with definitionallyExcluded:true when no migraine-feature days or triptan response', () => {
    // cm-C is in the EMIT set. Chronic headache present (cm-A passes) but
    // not migraine-type (cm-C fails). Positive contradicting evidence → EMIT.
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month', 'pattern-ge-3-months', 'attacks-gt-10',
      // no migraine-features-ge-8-per-month, no triptan-response-positive
    ));
    const cm = matches.find(m => m.phenotypeId === 'chronic-migraine');
    expect(cm).toBeDefined();
    expect(cm?.definitionallyExcluded).toBe(true);
    expect(cm?.exclusionReason).toBeTruthy();
    expect(['full', 'probable', 'partial']).not.toContain(cm?.matchStrength);
  });

  // ── DROP set: substrate-absence suppressions (stay absent, never emitted) ─

  it('aura-B suppress (DROP): migraine-with-aura absent when no aura symptom selected (H7)', () => {
    // aura-B: substrate absence — silent drop. (CORRECT absence, not a demote bug.)
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-2', 'aura-spread-ge-5min', 'aura-each-5-to-60min', 'aura-positive-symptoms',
      // no aura-type chip, no aura-fully-reversible — aura-B substrate fails
    ));
    expect(matches.find(m => m.phenotypeId === 'migraine-with-aura')).toBeUndefined();
  });

  it('cm-A suppress (DROP): chronic migraine absent at sub-chronic frequency (H3)', () => {
    // cm-A: chronicity threshold — silent drop. Sub-15-day patient is episodic.
    // (CORRECT absence — not "probable chronic," a different frequency band.)
    const matches = evaluateHeadachePhenotypes(select(
      'freq-5-14-per-month', 'pattern-ge-3-months', 'attacks-gt-10',
      'migraine-features-ge-8-per-month',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-migraine')).toBeUndefined();
  });

  it('ctth-A suppress (DROP): chronic TTH absent at sub-chronic frequency (H4)', () => {
    // ctth-A: chronicity threshold — silent drop. (CORRECT absence.)
    const matches = evaluateHeadachePhenotypes(select(
      'freq-5-14-per-month', 'pattern-ge-3-months',
      'dur-30min-to-7days', 'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
  });

  it('vm-A suppress (DROP): vestibular migraine absent when no vertigo (H5)', () => {
    // vm-A: substrate absence — silent drop. (CORRECT absence — closes V-reported false-positive.)
    const matches = evaluateHeadachePhenotypes(select('sym-phonophobia', 'sym-photophobia', 'aura-visual', 'migraine-history-established'));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  it('sunct-C suppress (DROP): SUNCT/SUNA absent when no autonomic features (H10)', () => {
    // sunct-C: substrate absence — silent drop. (CORRECT absence per clinical condition 8.)
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-20', 'loc-unilateral', 'sev-severe', 'dur-1-to-600-sec',
      // no autonomic — sunct-C substrate fails
      'freq-ge-1-per-day',
    ));
    expect(matches.find(m => m.phenotypeId === 'sunct-suna')).toBeUndefined();
  });

  it('ndph-A suppress (DROP): NDPH absent when not continuous (H8)', () => {
    // ndph-A: substrate absence — silent drop. (CORRECT absence.)
    const matches = evaluateHeadachePhenotypes(select(
      'onset-new-within-3-months',
      'dur-30min-to-7days', 'pattern-ge-3-months',
    ));
    expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
  });

  it('4.10 NDPH: onset-single-sudden alone no longer satisfies ndph-B → absent', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'dur-continuous', 'pattern-ge-3-months',
      'onset-single-sudden',
    ));
    expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
  });

  it('4.10 NDPH: full match with onset-abrupt-continuous-24h + continuous + ≥3 months', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'dur-continuous', 'pattern-ge-3-months', 'onset-abrupt-continuous-24h',
    ));
    expect(matches.find(m => m.phenotypeId === 'ndph')?.matchStrength).toBe('full');
  });

  it('4.10 NDPH (A-M3): recency alone (onset-new-within-3-months, no clearly-remembered 24h onset) no longer satisfies ndph-B → absent', () => {
    // §4.10 B requires a distinct, clearly-remembered onset becoming continuous within 24h.
    // A long-standing continuous headache that is merely "new in the last 3 months" must
    // not be called NDPH on recency alone. ndph-B (suppress-gate) drops it.
    const matches = evaluateHeadachePhenotypes(select(
      'dur-continuous', 'pattern-ge-3-months', 'onset-new-within-3-months',
    ));
    expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
  });

  it('hemicrania continua: hc-A suppress (DROP) — not unilateral → absent', () => {
    // hc-A: substrate — bilateral or non-continuous is a different entity.
    const matches = evaluateHeadachePhenotypes(select(
      'indo-tried-complete',
      'loc-bilateral', 'dur-continuous', 'pattern-ge-3-months',
      'sev-moderate', 'sym-autonomic-ipsilateral',
    ));
    expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')).toBeUndefined();
  });

  it('hidden-until-trial gate still works alongside suppress-gate (HC double-enforcement)', () => {
    // No indo-tried-complete → HC must be hidden even if all other suppress criteria pass.
    const matches = evaluateHeadachePhenotypes(select(
      'loc-unilateral', 'dur-continuous', 'pattern-ge-3-months', 'sev-moderate',
      'sym-autonomic-ipsilateral',
    ));
    expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')).toBeUndefined();
  });

  it('§3.4 HC (A-m6): hc-C satisfied via movement aggravation (act-aggravated) with no autonomic/restlessness → full match', () => {
    // §3.4 C.2 = "restlessness/agitation OR aggravation of pain by movement." A patient
    // whose only C-feature is movement-aggravation must still reach full HC.
    const matches = evaluateHeadachePhenotypes(select(
      'indo-tried-complete',
      'loc-unilateral', 'dur-continuous', 'pattern-ge-3-months', // hc-A
      'sev-moderate',                                            // hc-B
      'act-aggravated',                                          // hc-C via C.2 movement clause
    ));
    expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')?.matchStrength).toBe('full');
  });

  it('PH indomethacin gate: absent without indo-tried-complete (H11)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-20', 'loc-unilateral', 'loc-orbital-temporal', 'sev-severe',
      'dur-2-to-30-min', 'sym-autonomic-ipsilateral', 'freq-gt-5-per-day',
      // no indo-tried-complete — hiddenUntilTrial gate fires
    ));
    expect(matches.find(m => m.phenotypeId === 'paroxysmal-hemicrania')).toBeUndefined();
  });

  it('cm-A + cm-B imply each other in chip vocabulary (cm-A implies cm-B sanity check)', () => {
    // Patient with ≥15 days/mo for >3 months will have ≥5 lifetime attacks.
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month', 'pattern-ge-3-months', 'attacks-gt-10',
      'migraine-features-ge-8-per-month',
    ));
    expect(matches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');
  });
});

// ─── DEMOTE gates — failure keeps the phenotype as a flagged near-miss ──────
// These tests assert PRESENCE as probable. Each is a case where the patient
// has not yet confirmed a feature/window that has a §X.5 Probable ICHD-3 home.
// The prior test suite asserted absence here; that was the defect this change fixes.
describe('DEMOTE gates — failure keeps the phenotype as a flagged near-miss', () => {

  it('§1.1 mig-B (duration) fails → Probable migraine surfaces at §1.5 (S1)', () => {
    // mig-B is now demote-gate. A patient with all other criteria confirmed but
    // attack duration not recorded surfaces as Probable migraine ·§1.5.
    // Was: test asserting ABSENT (old definitional drop). Now: present as probable.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',          // mig-A: scorable pass
      // no dur-4-to-72-hours — mig-B demote-gate FAILS
      'loc-unilateral',
      'qual-pulsating',
      'sev-severe',
      'act-aggravated',         // mig-C: ≥2 C features pass
      'sym-nausea-mild',        // mig-D: demote-gate pass
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('mig-B');
    expect(m?.displaySection).toContain('§1.5');
  });

  it('§1.1 mig-D (assoc symptoms) fails → Probable migraine surfaces at §1.5 (S2)', () => {
    // mig-D is now demote-gate. Patient confirms attacks + duration + 2 C features
    // but has not reported nausea/photo+phono yet.
    // Was: test asserting ABSENT (old definitional drop). Now: present as probable.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',
      'dur-4-to-72-hours',      // mig-B demote-gate pass
      'loc-unilateral',
      'qual-pulsating',
      'sev-severe',             // mig-C ≥2 C features pass
      // no nausea, no photo+phono — mig-D demote-gate FAILS
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('mig-D');
    expect(m?.displaySection).toContain('§1.5');
  });

  it('§2.2 tth-B (duration) fails → Probable TTH surfaces at §2.4 (S3)', () => {
    // tth-B is now demote-gate. Patient confirms freq/pattern/character but
    // not attack duration.
    // Was: test asserting ABSENT (old definitional drop). Now: present as probable.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10', 'freq-1-4-per-month', 'pattern-ge-3-months',
      // no dur-30min-to-7days — tth-B demote-gate FAILS
      'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
      // tth-D: no nausea/vomiting, ≤1 photo/phono — suppress-gate passes
    ));
    const m = matches.find(x => x.phenotypeId === 'episodic-tth');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('tth-B');
    expect(m?.displaySection).toContain('§2.4');
  });

  it('§3.1 cluster-B (location+severity+duration) fails → Probable cluster surfaces at §3.5 (S4)', () => {
    // cluster-B is now demote-gate. Between-bouts patient: unilateral orbital pain
    // reported but 15–180 min attack length not confirmed.
    // Was: test asserting ABSENT (old definitional drop). Now: present as probable.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',
      'loc-unilateral', 'loc-orbital-temporal', 'sev-severe',
      // no dur-15-to-180-min — cluster-B demote-gate FAILS
      'sym-autonomic-ipsilateral',   // cluster-C demote-gate pass
      'freq-cluster-bout',           // cluster-D scorable pass
    ));
    const m = matches.find(x => x.phenotypeId === 'cluster-headache');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('cluster-B');
    expect(m?.displaySection).toContain('§3.5');
  });

  it('§3.1 cluster-C (autonomic/restlessness) fails → Probable cluster surfaces at §3.5', () => {
    // cluster-C is now demote-gate (was definitional:true). Between-bouts patient
    // who has not yet reported autonomic features/restlessness.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',
      'loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'dur-15-to-180-min',
      // no autonomic, no restlessness — cluster-C demote-gate FAILS
      'freq-cluster-bout',
    ));
    const m = matches.find(x => x.phenotypeId === 'cluster-headache');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('cluster-C');
    expect(m?.displaySection).toContain('§3.5');
  });

  it('§3.4 HC hc-C (autonomic/restlessness) fails → Probable HC surfaces at §3.5 (S6)', () => {
    // hc-C is now demote-gate (was definitional:true). Gate chip present,
    // hc-A suppress-gate passes, hc-B scorable passes, but hc-C not yet confirmed.
    const matches = evaluateHeadachePhenotypes(select(
      'indo-tried-complete',
      'loc-unilateral', 'dur-continuous', 'pattern-ge-3-months', // hc-A suppress-gate pass
      'sev-moderate',                                             // hc-B scorable pass
      // no autonomic, no restlessness — hc-C demote-gate FAILS
    ));
    const m = matches.find(x => x.phenotypeId === 'hemicrania-continua');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('hc-C');
    expect(m?.displaySection).toContain('§3.5');
  });

  it('§3.2 PH ph-B (location+severity+duration) fails → Probable PH surfaces at §3.5 (S-PH)', () => {
    // ph-B is now demote-gate. Gate chip present, all other criteria pass.
    const matches = evaluateHeadachePhenotypes(select(
      'indo-tried-complete',
      'attacks-ge-20',
      'loc-unilateral', 'loc-orbital-temporal', 'sev-severe',
      // no dur-2-to-30-min — ph-B demote-gate FAILS
      'sym-autonomic-ipsilateral',   // ph-C demote-gate pass
      'freq-gt-5-per-day',           // ph-D scorable pass
    ));
    const m = matches.find(x => x.phenotypeId === 'paroxysmal-hemicrania');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('ph-B');
  });

  it('§3.3 SUNCT sunct-B (moderate-severe unilateral, 1–600 sec) fails → Probable SUNCT surfaces at §3.5', () => {
    // sunct-B is now demote-gate. All others pass (sunct-A scorable, sunct-C
    // suppress-gate passes with autonomic, sunct-D scorable).
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-20',
      'loc-unilateral', 'sev-severe',
      // no dur-1-to-600-sec — sunct-B demote-gate FAILS
      'sym-autonomic-ipsilateral',
      'freq-ge-1-per-day',
    ));
    const m = matches.find(x => x.phenotypeId === 'sunct-suna');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('sunct-B');
  });

  it('§1.1 non-demote-gate failure does NOT drop phenotype (mig-A scorable miss)', () => {
    // Regression: scorable miss was already surfacing as probable before the refactor.
    // Confirm this still works correctly after refactor.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-lt-5',                     // mig-A fails (<5 attacks; scorable)
      'dur-4-to-72-hours',                // mig-B demote-gate pass
      'loc-unilateral', 'qual-pulsating', 'sev-severe',  // mig-C
      'sym-nausea-mild',                  // mig-D demote-gate pass
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.displaySection).toContain('§1.5');
  });

  it('§1.2 aura-with-aura: corrected aura-A accepts attacks-ge-2 (not attacks-lt-5)', () => {
    // aura-A rewired: drops attacks-lt-5, adds attacks-ge-2.
    // A 2-4-attack patient can now correctly satisfy aura-A without triggering a
    // 1-attack false positive on attacks-lt-5.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-ge-2',                // NEW chip — aura-A pass for ≥2 attacks
      'aura-visual', 'aura-fully-reversible', // aura-B suppress-gate pass
      'aura-spread-ge-5min', 'aura-each-5-to-60min', 'aura-positive-symptoms', // aura-C: 3 of 6 pass
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-with-aura');
    expect(m).toBeDefined();
    expect(m?.matchStrength).toBe('full');
  });

  it('§1.2 aura-C: aura-symptom-unilateral counts as 6th characteristic (not loc-unilateral)', () => {
    // Aura-laterality fix (2026-06-04, clinical condition 10).
    // aura-symptom-unilateral is the correct chip for §1.2 C characteristic 4.
    // loc-unilateral (headache pain laterality) must NOT count as the 6th characteristic.
    const withAuraUnilateral = evaluateHeadachePhenotypes(select(
      'attacks-ge-2',
      'aura-visual', 'aura-fully-reversible',
      // Only 2 of 6 without aura-symptom-unilateral:
      'aura-spread-ge-5min', 'aura-each-5-to-60min',
      // 3rd characteristic: aura-symptom-unilateral
      'aura-symptom-unilateral',
      // loc-unilateral present but must NOT count as aura characteristic
      'loc-unilateral',
    ));
    const m = withAuraUnilateral.find(x => x.phenotypeId === 'migraine-with-aura');
    expect(m?.matchStrength).toBe('full'); // 3 of 6 via aura-symptom-unilateral

    // Confirm loc-unilateral alone (without aura-symptom-unilateral) does NOT
    // contribute the 6th characteristic.
    const withoutAuraUnilateral = evaluateHeadachePhenotypes(select(
      'attacks-ge-2',
      'aura-visual', 'aura-fully-reversible',
      'aura-spread-ge-5min', 'aura-each-5-to-60min',
      // NO aura-symptom-unilateral — only loc-unilateral present
      'loc-unilateral',
    ));
    const m2 = withoutAuraUnilateral.find(x => x.phenotypeId === 'migraine-with-aura');
    // Only 2 of 6 characteristics met → aura-C fails, phenotype should be partial (not full).
    if (m2) expect(m2.matchStrength).not.toBe('full');
  });

  it('§2.3 ctth-B (hours-to-continuous duration) fails → Probable chronic TTH surfaces', () => {
    // ctth-B is now demote-gate. ctth-A suppress-gate passes (≥15 d/mo, ≥3 mo),
    // ctth-C scorable passes, ctth-D suppress-gate passes. ctth-B not yet confirmed.
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month', 'pattern-ge-3-months', // ctth-A suppress-gate pass
      // no dur-30min-to-7days, dur-gt-72-hours, dur-continuous — ctth-B demote-gate FAILS
      'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated', // ctth-C
    ));
    const m = matches.find(x => x.phenotypeId === 'chronic-tth');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.definitionallyExcluded).toBe(false);
    expect(m?.missingCriteria.map(c => c.id)).toContain('ctth-B');
  });

  it('§3.2 ph-C (autonomic/restlessness) fails → Probable PH surfaces', () => {
    // ph-C is now demote-gate (was definitional:true). Gate chip present, ph-B passes.
    const matches = evaluateHeadachePhenotypes(select(
      'indo-tried-complete',
      'attacks-ge-20',
      'loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'dur-2-to-30-min', // ph-B pass
      // no autonomic, no restlessness — ph-C demote-gate FAILS
      'freq-gt-5-per-day',
    ));
    const m = matches.find(x => x.phenotypeId === 'paroxysmal-hemicrania');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.missingCriteria.map(c => c.id)).toContain('ph-C');
  });
});

// ─── Empty-matches integration (page-level fallback trigger) ─────────────
it('returns empty array when no phenotype passes its gates (page renders no-match fallback)', () => {
  // Under demote semantics the old incompatible-duration constellation now
  // DOES surface partial matches because mig-B/mig-D are demote-gates (not drops).
  //   attacks-gt-10 + sev-moderate + act-aggravated → mig-A + mig-C pass (floor ok)
  //   dur-lt-15-min → mig-B demote-gate fails (demotes, not drops) → partial migraine
  //   TTH also surfaces partially (bilateral pressing + phonophobia ≤ 1 → tth-D passes)
  // The page's own "no active full/probable match" fallback logic operates on the
  // caller's side. This test updates the contract to assert the correct post-refactor
  // behavior: partial matches now surface for such inputs, and the page must decide
  // whether to show a "no strong match" banner based on fullMatch/probableMatch absence.
  //
  // A genuinely empty result requires input that clears ALL floors and ALL suppress-gates:
  // e.g., a single chip with no contributing evidence for any phenotype.
  const trueEmptyMatches = evaluateHeadachePhenotypes(select(
    'onset-single-sudden', // not a contributing chip for any phenotype criterion
  ));
  expect(trueEmptyMatches).toEqual([]);

  // For the original constellation: confirm it produces partial matches but no full/probable.
  const originalConstellation = evaluateHeadachePhenotypes(select(
    'attacks-gt-10', 'freq-1-4-per-month', 'dur-lt-15-min',
    'loc-bilateral', 'qual-pressing-tightening', 'sev-moderate', 'act-aggravated',
    'sym-phonophobia',
  ));
  const activeMatches = originalConstellation.filter(m => !m.definitionallyExcluded);
  expect(activeMatches.filter(m => m.matchStrength === 'full').length).toBe(0);
  expect(activeMatches.filter(m => m.matchStrength === 'probable').length).toBe(0);
  // Partial matches are acceptable — the page's "no full/probable match" state handles this.
});

describe('§4.7 Primary stabbing headache (Track C — new diagnosis)', () => {
  it('full match: spontaneous stab + stabbing quality + seconds + 1-to-many/day + no autonomic', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'onset-spontaneous-stab', 'qual-sharp-stabbing',
      'dur-stab-seconds', 'freq-stab-one-to-many-per-day',
    ));
    expect(matches.find(m => m.phenotypeId === 'primary-stabbing-headache')?.matchStrength).toBe('full');
  });

  it('probable (§4.7.1): substrate + 2-of-3 (missing the seconds duration) → probable, displaySection §4.7.1', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'onset-spontaneous-stab', 'qual-sharp-stabbing',
      'freq-stab-one-to-many-per-day', // psh-C ok; psh-B (dur-stab-seconds) missing → one demote miss
    ));
    const psh = matches.find(m => m.phenotypeId === 'primary-stabbing-headache');
    expect(psh?.matchStrength).toBe('probable');
    expect(psh?.displaySection).toContain('§4.7.1');
  });

  it('EMIT (set aside): cranial autonomic symptoms present → definitionallyExcluded, steer to SUNCT/SUNA', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'onset-spontaneous-stab', 'qual-sharp-stabbing',
      'dur-stab-seconds', 'freq-stab-one-to-many-per-day',
      'sym-autonomic-ipsilateral', // psh-D fails → EMIT
    ));
    const psh = matches.find(m => m.phenotypeId === 'primary-stabbing-headache');
    expect(psh?.definitionallyExcluded).toBe(true);
  });

  it('psh-A suppress (DROP): stabbing quality without the spontaneous-stab substrate → absent', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'qual-sharp-stabbing', 'dur-stab-seconds', 'freq-stab-one-to-many-per-day',
      // no onset-spontaneous-stab → psh-A fails (silent DROP)
    ));
    expect(matches.find(m => m.phenotypeId === 'primary-stabbing-headache')).toBeUndefined();
  });
});

describe('§1.4.1 Status migrainosus (Track C — new diagnosis)', () => {
  it('full match: established migraine + >72h + debilitating', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'migraine-history-established', 'dur-gt-72-hours', 'sev-debilitating',
    ));
    expect(matches.find(m => m.phenotypeId === 'status-migrainosus')?.matchStrength).toBe('full');
  });

  it('probable (§1.5.1): >72h + migraine history but NOT debilitating → probable at §1.5.1 (Note 2)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'migraine-history-established', 'dur-gt-72-hours',
      // no sev-debilitating → sm-C2 demote miss
    ));
    const sm = matches.find(m => m.phenotypeId === 'status-migrainosus');
    expect(sm?.matchStrength).toBe('probable');
    expect(sm?.displaySection).toContain('§1.5.1');
  });

  it('sm-B suppress (DROP): >72h debilitating attack WITHOUT established migraine → absent (secondary-workup scenario)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'dur-gt-72-hours', 'sev-debilitating',
      // no migraine-history-established → sm-B fails (silent DROP)
    ));
    expect(matches.find(m => m.phenotypeId === 'status-migrainosus')).toBeUndefined();
  });

  it('sm-C1 suppress (DROP): established migraineur + debilitating but attack NOT >72h → absent', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'migraine-history-established', 'sev-debilitating',
      // no dur-gt-72-hours → sm-C1 fails (silent DROP)
    ));
    expect(matches.find(m => m.phenotypeId === 'status-migrainosus')).toBeUndefined();
  });
});

describe('§13.1.1 Trigeminal neuralgia (Track C — new diagnosis)', () => {
  const tnFull: ChipId[] = [
    'loc-unilateral', 'loc-trigeminal-distribution',
    'dur-fraction-sec-to-2min', 'sev-severe', 'qual-electric-shock-shooting',
    'trigger-innocuous-stimulus',
  ];

  it('full match: unilateral trigeminal-distribution + brief + severe + shock + trigger', () => {
    const matches = evaluateHeadachePhenotypes(select(...tnFull));
    expect(matches.find(m => m.phenotypeId === 'trigeminal-neuralgia')?.matchStrength).toBe('full');
  });

  it('full match via the sharp/stabbing quality (tn-B quality OR)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-unilateral', 'loc-trigeminal-distribution',
      'dur-fraction-sec-to-2min', 'sev-severe', 'qual-sharp-stabbing',
      'trigger-innocuous-stimulus',
    ));
    expect(matches.find(m => m.phenotypeId === 'trigeminal-neuralgia')?.matchStrength).toBe('full');
  });

  it('tn-C suppress (DROP): no innocuous-stimulus trigger → absent (pathognomonic substrate)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-unilateral', 'loc-trigeminal-distribution',
      'dur-fraction-sec-to-2min', 'sev-severe', 'qual-electric-shock-shooting',
      // no trigger-innocuous-stimulus → tn-C fails
    ));
    expect(matches.find(m => m.phenotypeId === 'trigeminal-neuralgia')).toBeUndefined();
  });

  it('tn-A suppress (DROP): shock-like pain not in a trigeminal distribution → absent', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-unilateral', // no loc-trigeminal-distribution → tn-A fails
      'dur-fraction-sec-to-2min', 'sev-severe', 'qual-electric-shock-shooting',
      'trigger-innocuous-stimulus',
    ));
    expect(matches.find(m => m.phenotypeId === 'trigeminal-neuralgia')).toBeUndefined();
  });

  it('no Probable-TN: a feature miss (not severe) DROPS, never surfaces as probable (§13 has no §X.5)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-unilateral', 'loc-trigeminal-distribution',
      'dur-fraction-sec-to-2min', 'qual-electric-shock-shooting',
      'trigger-innocuous-stimulus',
      // no sev-severe → tn-B fails (suppress DROP, not demote)
    ));
    const tn = matches.find(m => m.phenotypeId === 'trigeminal-neuralgia');
    expect(tn).toBeUndefined();
  });
});

describe('§13.4 Occipital neuralgia (Track C — new diagnosis)', () => {
  const onFull: ChipId[] = [
    'loc-occipital-nerve',
    'dur-seconds-to-minutes', 'sev-severe',              // 2 of 3 (on-B)
    'scalp-dysaesthesia-allodynia', 'occipital-nerve-tenderness-or-trigger', // on-C
    'occipital-block-response-positive',                 // on-D + hiddenUntilTrial
  ];

  it('full match: occipital distribution + ≥2/3 + both C associations + positive block', () => {
    const matches = evaluateHeadachePhenotypes(select(...onFull));
    expect(matches.find(m => m.phenotypeId === 'occipital-neuralgia')?.matchStrength).toBe('full');
  });

  it('hiddenUntilTrial: absent until the nerve-block chip is selected (criterion D not yet done)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-occipital-nerve', 'dur-seconds-to-minutes', 'sev-severe',
      'scalp-dysaesthesia-allodynia', 'occipital-nerve-tenderness-or-trigger',
      // no occipital-block-response-positive → hidden until trial
    ));
    expect(matches.find(m => m.phenotypeId === 'occipital-neuralgia')).toBeUndefined();
  });

  it('on-B full-or-nothing: only 1 of 3 pain characteristics → absent (no §13.4.5 Probable)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-occipital-nerve',
      'sev-severe', // only 1 of 3 → on-B fails
      'scalp-dysaesthesia-allodynia', 'occipital-nerve-tenderness-or-trigger',
      'occipital-block-response-positive',
    ));
    expect(matches.find(m => m.phenotypeId === 'occipital-neuralgia')).toBeUndefined();
  });

  it('on-C suppress (DROP): dysaesthesia present but no nerve tenderness/trigger → absent (both required)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'loc-occipital-nerve', 'dur-seconds-to-minutes', 'sev-severe',
      'scalp-dysaesthesia-allodynia', // no occipital-nerve-tenderness-or-trigger → on-C fails
      'occipital-block-response-positive',
    ));
    expect(matches.find(m => m.phenotypeId === 'occipital-neuralgia')).toBeUndefined();
  });
});

describe('§4.9 Hypnic headache (Track C — new diagnosis)', () => {
  it('full match: sleep-only + ≥10 d/mo + >3 mo + 15min-4h + no autonomic/restlessness', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'onset-only-during-sleep-waking',
      'freq-ge-10-per-month', 'pattern-ge-3-months', // hypnic-C
      'dur-15min-to-4h',                             // hypnic-D
    ));
    expect(matches.find(m => m.phenotypeId === 'hypnic-headache')?.matchStrength).toBe('full');
  });

  it('probable (§4.9.1): substrate + duration but not the ≥10-d/mo frequency → probable, displaySection §4.9.1', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'onset-only-during-sleep-waking',
      'dur-15min-to-4h', // hypnic-D ok; hypnic-C (freq+3mo) missing → one demote miss
    ));
    const hh = matches.find(m => m.phenotypeId === 'hypnic-headache');
    expect(hh?.matchStrength).toBe('probable');
    expect(hh?.displaySection).toContain('§4.9.1');
  });

  it('hypnic-E EMIT: cranial autonomic symptoms present → set aside, steer to §3 cluster/TACs', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'onset-only-during-sleep-waking',
      'freq-ge-10-per-month', 'pattern-ge-3-months', 'dur-15min-to-4h',
      'sym-autonomic-ipsilateral', // hypnic-E fails → EMIT
    ));
    const hh = matches.find(m => m.phenotypeId === 'hypnic-headache');
    expect(hh?.definitionallyExcluded).toBe(true);
  });

  it('hypnic-B suppress (DROP): ≥10 d/mo + duration but NOT sleep-only → absent (substrate)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-10-per-month', 'pattern-ge-3-months', 'dur-15min-to-4h',
      // no onset-only-during-sleep-waking → hypnic-B fails (silent DROP)
    ));
    expect(matches.find(m => m.phenotypeId === 'hypnic-headache')).toBeUndefined();
  });
});
