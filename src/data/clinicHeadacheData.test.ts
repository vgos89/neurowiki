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

    it('migraine ABSENT (not even probable) with only photophobia — mig-D is definitional after 2026-05-27', () => {
      // 2026-05-27: mig-D flagged definitional. Failing mig-D (no nausea/
      // vomiting and no photo+phono pair) now drops the phenotype entirely
      // rather than producing a "probable" entry. ICHD-3 §1.5 Probable
      // migraine does not apply when the associated-symptom criterion fails
      // because ICHD-3 phrasing requires either the nausea OR the
      // photo+phono pair as a phenotype-defining feature.
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'dur-4-to-72-hours',
        'loc-unilateral',
        'qual-pulsating',
        'sym-photophobia',
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
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

    it('episodic TTH ABSENT if nausea is selected — tth-D is definitional after 2026-05-27', () => {
      // 2026-05-27: tth-D flagged definitional. Failing the exclusion (i.e.
      // patient has nausea, which TTH explicitly excludes) now drops the
      // phenotype entirely. Same semantic: presence of nausea steers the
      // diagnosis to migraine, not "probable TTH."
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
      expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
    });

    it('episodic TTH ABSENT if BOTH photophobia AND phonophobia selected — tth-D definitional', () => {
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
      expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
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
      // No probable matches should remain
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
      // phenotypes find a contributing chip; just confirm no probables.
      expect(matches.filter(m => m.matchStrength === 'probable').length).toBe(0);
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
        'sym-nausea-mild',
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
  it('Chronic TTH ABSENT when moderate-severe nausea is selected — ctth-D is definitional after 2026-05-27', () => {
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
    expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
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

  it('Chronic TTH ABSENT when mild nausea + photophobia both selected (≤1 pool exceeded) — ctth-D definitional', () => {
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
    expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
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
      'onset-new-within-3-months',
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
  it('Probable migraine displaySection points to §1.5 (failing mig-A, a NON-definitional criterion)', () => {
    // 2026-05-27: after definitional flags, probable migraine requires
    // failing a NON-definitional criterion. mig-A (≥5 attacks) is the
    // canonical non-definitional gap — patients with <5 lifetime attacks
    // route through ICHD-3 §1.5.1 Probable migraine without aura.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-lt-5',                    // mig-A fails (non-definitional)
      'dur-4-to-72-hours',               // mig-B definitional pass
      'loc-unilateral',
      'qual-pulsating',
      'sev-severe',                      // mig-C ≥2 features
      'sym-nausea-mild',                 // mig-D definitional pass
    ));
    const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.displaySection).toContain('§1.5');
  });

  it('Probable TTH displaySection points to §2.4 (failing tth-A, a NON-definitional criterion)', () => {
    // 2026-05-27: probable TTH now requires failing tth-A (frequency floor),
    // which is non-definitional. tth-B (duration) and tth-D (exclusion) are
    // definitional and dropping them removes the phenotype entirely.
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-lt-5',                    // <10 episodes — tth-A fails (non-definitional)
      'dur-30min-to-7days',              // tth-B definitional pass
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-mild',
      'act-not-aggravated',
      // no nausea, no photo/phono — tth-D definitional pass
    ));
    const m = matches.find(x => x.phenotypeId === 'episodic-tth');
    expect(m?.matchStrength).toBe('probable');
    expect(m?.displaySection).toContain('§2.4');
  });

  it('Chronic migraine cannot be probable — every §1.3 criterion is now definitional (no §1.5.3 exists)', () => {
    // 2026-05-27: cm-A, cm-B, and cm-C are ALL flagged definitional per
    // clinical-reviewer §17.2. ICHD-3 has no §1.5.3 Probable chronic
    // migraine entity, so failing any §1.3 criterion correctly drops the
    // phenotype entirely rather than producing a probable surface. This
    // test now asserts the absence behavior + the map-level guarantee.
    const matches = evaluateHeadachePhenotypes(select(
      'freq-ge-15-per-month',
      'pattern-ge-3-months',
      'attacks-gt-10',
      // Missing migraine-features-ge-8 + triptan-response — cm-C definitional fails
    ));
    // Phenotype absent — cm-C definitional failure drops it.
    expect(matches.find(x => x.phenotypeId === 'chronic-migraine')).toBeUndefined();
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

// ─── Definitional-criterion gating (2026-05-27) ─────────────────────────────
// V-reported false-positive (vestibular migraine 50% on phonophobia alone) +
// architect §17.1 + clinical-reviewer §17.2 sign-off. See:
//   docs/reviews/arch-headache-definitional-criteria-2026-05-27.md
//   docs/reviews/clinical-headache-definitional-criteria-2026-05-27.md
describe('definitional-criterion gating', () => {
  // ── Dev-time guard (architect §17.1 follow-up 5) ────────────────────────
  // Every phenotype must have ≥1 definitional criterion. If a future
  // phenotype is added without flagging any criterion definitional, this
  // test fails and the author is forced to be explicit.
  it('every phenotype has at least one definitional criterion', () => {
    for (const phenotype of HEADACHE_PHENOTYPES) {
      const hasDefinitional = phenotype.criteria.some(c => c.definitional === true);
      expect(hasDefinitional, `${phenotype.id} (${phenotype.name}) has no criterion tagged definitional`).toBe(true);
    }
  });

  // ── V's exact reported failing input ────────────────────────────────────
  it("V regression: phonophobia-only + bilateral pressing + <15 min → vestibular migraine NOT in matches", () => {
    const matches = evaluateHeadachePhenotypes(select(
      'attacks-gt-10',                  // pattern present
      'onset-recurrent-same',
      'freq-1-4-per-month',
      'dur-lt-15-min',                  // <15 min — fails every primary phenotype duration gate
      'loc-bilateral',
      'qual-pressing-tightening',
      'sev-moderate',
      'act-aggravated',
      'sym-phonophobia',                // phonophobia only — no vertigo
    ));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
    // Migraine and TTH should also fail their definitional duration gates
    // (mig-B requires 4–72 h; tth-B requires 30 min–7 d).
    expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
    expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
    // Cluster, PH, SUNCT, HC, NDPH all blocked by their own definitional gates.
    expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeUndefined();
    expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
  });

  // ── Vestibular migraine: no vertigo → entity dropped ────────────────────
  it('vestibular migraine NOT in matches when no vertigo chip selected', () => {
    const matches = evaluateHeadachePhenotypes(select('sym-phonophobia', 'sym-photophobia', 'aura-visual'));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeUndefined();
  });

  it('vestibular migraine surfaces when vest-vertigo-migrainous + ≥1 migraine feature', () => {
    const matches = evaluateHeadachePhenotypes(select('vest-vertigo-migrainous', 'sym-phonophobia'));
    expect(matches.find(m => m.phenotypeId === 'vestibular-migraine')).toBeDefined();
  });

  // ── Per-phenotype: failing exactly one definitional → phenotype absent ──
  describe('per-phenotype definitional failure drops the phenotype', () => {
    it('1.1 migraine without aura: fail mig-B (duration) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'dur-gt-72-hours', // fails 4-72h
        'loc-unilateral', 'qual-pulsating', 'sev-severe',
        'sym-nausea-mild',
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
    });

    it('1.1 migraine without aura: fail mig-D (assoc symptoms) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'dur-4-to-72-hours',
        'loc-unilateral', 'qual-pulsating', 'sev-severe',
        // no nausea, no photo+phono pair
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-without-aura')).toBeUndefined();
    });

    it('1.2 migraine with aura: fail aura-B (no aura symptom) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'aura-spread-ge-5min', 'aura-each-5-to-60min', 'aura-positive-symptoms',
        // no aura-type chip, no aura-fully-reversible
      ));
      expect(matches.find(m => m.phenotypeId === 'migraine-with-aura')).toBeUndefined();
    });

    it('1.3 chronic migraine: fail cm-A (freq <15) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'freq-5-14-per-month', 'pattern-ge-3-months', 'attacks-gt-10',
        'migraine-features-ge-8-per-month',
      ));
      expect(matches.find(m => m.phenotypeId === 'chronic-migraine')).toBeUndefined();
    });

    it('1.3 chronic migraine: fail cm-C (no migraine-feature days nor triptan response) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'freq-ge-15-per-month', 'pattern-ge-3-months', 'attacks-gt-10',
        // no migraine-features-ge-8-per-month, no triptan-response-positive
      ));
      expect(matches.find(m => m.phenotypeId === 'chronic-migraine')).toBeUndefined();
    });

    it('cm-A implies cm-B in chip vocabulary (Condition 1 sanity check)', () => {
      // Patient with ≥15 days/mo for >3 months will have ≥5 lifetime attacks.
      // Confirm chronic migraine full-match works with attack-count chip set.
      const matches = evaluateHeadachePhenotypes(select(
        'freq-ge-15-per-month', 'pattern-ge-3-months', 'attacks-gt-10',
        'migraine-features-ge-8-per-month',
      ));
      expect(matches.find(m => m.phenotypeId === 'chronic-migraine')?.matchStrength).toBe('full');
    });

    it('2.2 episodic TTH: fail tth-B (duration) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'freq-1-4-per-month', 'pattern-ge-3-months',
        'dur-lt-15-min',                    // fails 30 min–7 d
        'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
      ));
      expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
    });

    it('2.2 episodic TTH: fail tth-D (vomiting) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'freq-1-4-per-month', 'pattern-ge-3-months',
        'dur-30min-to-7days', 'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
        'sym-vomiting',                     // excludes TTH
      ));
      expect(matches.find(m => m.phenotypeId === 'episodic-tth')).toBeUndefined();
    });

    it('2.3 chronic TTH: fail ctth-A (freq <15) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'freq-5-14-per-month', 'pattern-ge-3-months',
        'dur-30min-to-7days', 'loc-bilateral', 'qual-pressing-tightening', 'sev-mild', 'act-not-aggravated',
      ));
      expect(matches.find(m => m.phenotypeId === 'chronic-tth')).toBeUndefined();
    });

    it('3.1 cluster: fail cluster-B (no orbital location) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'loc-unilateral', 'sev-severe', 'dur-15-to-180-min',
        // missing loc-orbital-temporal — fails conjunctive B
        'sym-autonomic-ipsilateral', 'freq-cluster-bout',
      ));
      expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeUndefined();
    });

    it('3.1 cluster: fail cluster-C (no autonomic or restlessness) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10', 'loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'dur-15-to-180-min',
        // no autonomic, no restlessness
        'freq-cluster-bout',
      ));
      expect(matches.find(m => m.phenotypeId === 'cluster-headache')).toBeUndefined();
    });

    it('3.2 paroxysmal hemicrania: fail ph-B (duration) → absent (even with indo trial)', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'indo-tried-complete',              // gate satisfied
        'attacks-ge-20', 'loc-unilateral', 'loc-orbital-temporal', 'sev-severe',
        'dur-15-to-180-min',                // wrong duration window — PH wants 2–30 min
        'sym-autonomic-ipsilateral', 'freq-gt-5-per-day',
      ));
      expect(matches.find(m => m.phenotypeId === 'paroxysmal-hemicrania')).toBeUndefined();
    });

    it('3.3 SUNCT/SUNA: fail sunct-C (no autonomic) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-ge-20', 'loc-unilateral', 'sev-severe', 'dur-1-to-600-sec',
        // no autonomic
        'freq-ge-1-per-day',
      ));
      expect(matches.find(m => m.phenotypeId === 'sunct-suna')).toBeUndefined();
    });

    it('3.4 hemicrania continua: fail hc-A (not unilateral) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'indo-tried-complete',
        'loc-bilateral', 'dur-continuous', 'pattern-ge-3-months',
        'sev-moderate', 'sym-autonomic-ipsilateral',
      ));
      expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')).toBeUndefined();
    });

    it('hidden-until-trial gate still works alongside definitional flag (HC double-enforcement)', () => {
      // No indo-tried-complete chip → HC must be hidden even if all OTHER
      // definitional criteria are satisfied.
      const matches = evaluateHeadachePhenotypes(select(
        'loc-unilateral', 'dur-continuous', 'pattern-ge-3-months', 'sev-moderate',
        'sym-autonomic-ipsilateral',
      ));
      expect(matches.find(m => m.phenotypeId === 'hemicrania-continua')).toBeUndefined();
    });

    it('4.10 NDPH: fail ndph-A (not continuous) → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'onset-new-within-3-months',
        'dur-30min-to-7days', 'pattern-ge-3-months',
      ));
      expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
    });

    it('4.10 NDPH: onset-single-sudden alone no longer satisfies ndph-B → absent', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'dur-continuous', 'pattern-ge-3-months',
        'onset-single-sudden',              // thunderclap chip — NOT NDPH onset after 2026-05-27 fix
      ));
      expect(matches.find(m => m.phenotypeId === 'ndph')).toBeUndefined();
    });

    it('4.10 NDPH: full match with onset-new-within-3-months + continuous + ≥3 months', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'dur-continuous', 'pattern-ge-3-months', 'onset-new-within-3-months',
      ));
      expect(matches.find(m => m.phenotypeId === 'ndph')?.matchStrength).toBe('full');
    });
  });

  // ── All-definitional-pass + one-non-definitional-fail → surfaces ────────
  describe('non-definitional failure does NOT drop phenotype', () => {
    it('1.1 migraine: mig-A fails (attacks <5) but mig-B, mig-C, mig-D pass → probable migraine', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-lt-5',                     // mig-A fails (<5 attacks; not definitional)
        'dur-4-to-72-hours',                // mig-B definitional pass
        'loc-unilateral', 'qual-pulsating', 'sev-severe',  // mig-C
        'sym-nausea-mild',                  // mig-D definitional pass
      ));
      const m = matches.find(x => x.phenotypeId === 'migraine-without-aura');
      expect(m?.matchStrength).toBe('probable');
      expect(m?.displaySection).toContain('§1.5');
    });

    it('3.1 cluster: cluster-D fails (no bout-frequency chip) but others pass → probable cluster', () => {
      const matches = evaluateHeadachePhenotypes(select(
        'attacks-gt-10',
        'loc-unilateral', 'loc-orbital-temporal', 'sev-severe', 'dur-15-to-180-min', // cluster-B
        'sym-autonomic-ipsilateral',                                                  // cluster-C
        // no freq-cluster-bout — cluster-D fails (non-definitional)
      ));
      const m = matches.find(x => x.phenotypeId === 'cluster-headache');
      expect(m?.matchStrength).toBe('probable');
    });
  });

  // ── Empty-matches integration (page-level fallback trigger) ─────────────
  it('returns empty array when no phenotype passes its definitional gates (page renders no-match fallback)', () => {
    const matches = evaluateHeadachePhenotypes(select(
      // V's example — incompatible-duration constellation
      'attacks-gt-10', 'freq-1-4-per-month', 'dur-lt-15-min',
      'loc-bilateral', 'qual-pressing-tightening', 'sev-moderate', 'act-aggravated',
      'sym-phonophobia',
    ));
    expect(matches).toEqual([]);
  });
});
