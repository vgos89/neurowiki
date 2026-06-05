import { describe, it, expect } from 'vitest';
import { bandPhenotypes, bandStrengthLabel } from './headacheBanding';
import type { PhenotypeMatch } from './clinicHeadacheData';

// Minimal PhenotypeMatch fixture — only the fields bandPhenotypes/bandStrengthLabel read
// vary; the rest are filled with valid defaults.
function mk(
  phenotypeId: PhenotypeMatch['phenotypeId'],
  matchStrength: PhenotypeMatch['matchStrength'],
  criteriaMet: number,
  criteriaTotal: number,
  definitionallyExcluded = false,
): PhenotypeMatch {
  return {
    phenotypeId,
    name: String(phenotypeId),
    ichd3Section: '1.1',
    displaySection: 'ICHD-3 §1.1',
    matchStrength,
    criteriaMet,
    criteriaTotal,
    metCriteria: [],
    missingCriteria: [],
    definitionallyExcluded,
  };
}

describe('bandPhenotypes — cut points (spec §1.2)', () => {
  it('a full match bands Leading', () => {
    const r = bandPhenotypes([mk('migraine-without-aura', 'full', 4, 4)]);
    expect(r.leading).toHaveLength(1);
    expect(r.leading[0].match.phenotypeId).toBe('migraine-without-aura');
    expect(r.leading[0].promoted).toBe(false);
    expect(r.hasFull).toBe(true);
    expect(r.hasLeading).toBe(true);
  });

  it('with a full match present, probables band Possible (not promoted)', () => {
    const r = bandPhenotypes([
      mk('migraine-without-aura', 'full', 4, 4),
      mk('episodic-tth', 'probable', 2, 3),
    ]);
    expect(r.leading.map(b => b.match.phenotypeId)).toEqual(['migraine-without-aura']);
    expect(r.possible.map(b => b.match.phenotypeId)).toEqual(['episodic-tth']);
    expect(r.possible[0].promoted).toBe(false);
  });

  it('partial with ≥2 criteria → Possible; partial with exactly 1 → Less likely', () => {
    const r = bandPhenotypes([
      mk('cluster-headache', 'partial', 2, 4),
      mk('sunct-suna', 'partial', 1, 4),
    ]);
    expect(r.possible.map(b => b.match.phenotypeId)).toEqual(['cluster-headache']);
    expect(r.lessLikely.map(b => b.match.phenotypeId)).toEqual(['sunct-suna']);
  });

  it('definitionallyExcluded matches go to Set aside, never to a candidate band', () => {
    const r = bandPhenotypes([
      mk('migraine-without-aura', 'full', 4, 4),
      mk('episodic-tth', 'none', 0, 4, true),
    ]);
    expect(r.setAside.map(b => b.match.phenotypeId)).toEqual(['episodic-tth']);
    expect(r.leading.map(b => b.match.phenotypeId)).toEqual(['migraine-without-aura']);
    expect(r.possible).toHaveLength(0);
    expect(r.lessLikely).toHaveLength(0);
  });

  it('empty input yields four empty bands', () => {
    const r = bandPhenotypes([]);
    expect(r).toMatchObject({ leading: [], possible: [], lessLikely: [], setAside: [], hasLeading: false, hasFull: false });
  });
});

describe('bandPhenotypes — promotion + B4 (no invented Leading)', () => {
  it('no full + a probable: the single top probable is promoted to Leading', () => {
    const r = bandPhenotypes([mk('migraine-without-aura', 'probable', 3, 4)]);
    expect(r.leading).toHaveLength(1);
    expect(r.leading[0].promoted).toBe(true);
    expect(r.hasFull).toBe(false);
  });

  it('no full + two probables: only the top promotes; the other bands Possible', () => {
    const r = bandPhenotypes([
      mk('migraine-without-aura', 'probable', 3, 4),
      mk('episodic-tth', 'probable', 2, 3),
    ]);
    expect(r.leading).toHaveLength(1);
    expect(r.leading[0].match.phenotypeId).toBe('migraine-without-aura');
    expect(r.leading[0].promoted).toBe(true);
    expect(r.possible.map(b => b.match.phenotypeId)).toEqual(['episodic-tth']);
  });

  it('B4: no full + no probable (only partials) → NO Leading invented', () => {
    const r = bandPhenotypes([
      mk('cluster-headache', 'partial', 2, 4),
      mk('sunct-suna', 'partial', 1, 4),
    ]);
    expect(r.hasLeading).toBe(false);
    expect(r.leading).toHaveLength(0);
    // the strongest partial bands Possible, not Leading
    expect(r.possible.map(b => b.match.phenotypeId)).toEqual(['cluster-headache']);
  });
});

describe('bandPhenotypes — two-full-match side-by-side (spec §1.4 Leading-tie)', () => {
  it('two full matches both render in Leading, never silently picking one', () => {
    const r = bandPhenotypes([
      mk('migraine-without-aura', 'full', 4, 4),
      mk('episodic-tth', 'full', 3, 3),
    ]);
    expect(r.leading).toHaveLength(2);
    expect(r.leading.map(b => b.match.phenotypeId).sort()).toEqual(['episodic-tth', 'migraine-without-aura']);
  });
});

describe('bandPhenotypes — deterministic tie-break (spec §1.4)', () => {
  it('within a tier, higher absolute criteriaMet ranks first regardless of input order', () => {
    const r = bandPhenotypes([
      mk('cluster-headache', 'partial', 2, 5),
      mk('chronic-migraine', 'partial', 3, 5),
    ]);
    // both ≥2 → Possible; chronic-migraine (3 met) outranks cluster (2 met)
    expect(r.possible.map(b => b.match.phenotypeId)).toEqual(['chronic-migraine', 'cluster-headache']);
  });

  it('equal strength + equal met/total breaks by fixed ICHD-3 chapter order', () => {
    // migraine (§1.1) before cluster (§3.1) before ndph (§4.10)
    const r = bandPhenotypes([
      mk('ndph', 'partial', 2, 4),
      mk('cluster-headache', 'partial', 2, 4),
      mk('migraine-without-aura', 'partial', 2, 4),
    ]);
    expect(r.possible.map(b => b.match.phenotypeId)).toEqual([
      'migraine-without-aura', 'cluster-headache', 'ndph',
    ]);
  });
});

describe('bandStrengthLabel — B2 (never "Probable Chronic migraine")', () => {
  it('chronic-migraine probable reads "Partial match for", never contains "Probable"', () => {
    const label = bandStrengthLabel(mk('chronic-migraine', 'probable', 5, 6));
    expect(label).toBe('Partial match for');
    expect(label).not.toContain('Probable');
  });

  it('chronic-migraine partial also never reads "Probable"', () => {
    expect(bandStrengthLabel(mk('chronic-migraine', 'partial', 4, 6))).not.toContain('Probable');
  });

  it('a full match has no qualifier', () => {
    expect(bandStrengthLabel(mk('migraine-without-aura', 'full', 4, 4))).toBe('');
  });

  it('a non-chronic-migraine probable reads "Probable"', () => {
    expect(bandStrengthLabel(mk('migraine-without-aura', 'probable', 3, 4))).toBe('Probable');
  });

  it('a partial reads "Partial match for"', () => {
    expect(bandStrengthLabel(mk('cluster-headache', 'partial', 2, 4))).toBe('Partial match for');
  });
});
