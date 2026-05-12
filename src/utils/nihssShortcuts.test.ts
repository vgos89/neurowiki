import { describe, it, expect } from 'vitest';
import { calculateTotal, getItemWarning, calculateLvoProbability } from './nihssShortcuts';

// ── calculateTotal ──────────────────────────────────────────────────────────

describe('calculateTotal', () => {
  it('returns 0 for empty scores', () => {
    expect(calculateTotal({})).toBe(0);
  });

  it('sums standard scores correctly', () => {
    expect(calculateTotal({ '1a': 1, '1b': 2, '2': 1 })).toBe(4);
  });

  it('excludes UN value (9) from total', () => {
    expect(calculateTotal({ '10': 9, '1a': 2 })).toBe(2);
  });

  it('multiple UN values all excluded', () => {
    expect(calculateTotal({ '10': 9, '1a': 9 })).toBe(0);
  });

  it('returns max possible score of 42', () => {
    const max: Record<string, number> = {
      '1a': 3, '1b': 2, '1c': 2, '2': 2, '3': 3, '4': 3,
      '5a': 4, '5b': 4, '6a': 4, '6b': 4, '7': 2, '8': 2,
      '9': 3, '10': 2, '11': 2,
    };
    expect(calculateTotal(max)).toBe(42);
  });

  it('returns 0 for all-zero scores', () => {
    const allZero = Object.fromEntries(
      ['1a','1b','1c','2','3','4','5a','5b','6a','6b','7','8','9','10','11'].map(k => [k, 0])
    );
    expect(calculateTotal(allZero)).toBe(0);
  });

  it('handles single item', () => {
    expect(calculateTotal({ '1a': 3 })).toBe(3);
  });

  it('treats missing items as 0 (not NaN)', () => {
    expect(calculateTotal({ '9': 3 })).toBe(3);
  });
});

// ── getItemWarning ──────────────────────────────────────────────────────────

describe('getItemWarning', () => {
  it('warns when severe aphasia (2) but commands normal (0)', () => {
    const w = getItemWarning('9', 2, { '1c': 0 });
    expect(w).toBeTruthy();
    expect(w).toContain('Aphasia');
  });

  it('warns when global aphasia (3) but commands normal (0)', () => {
    const w = getItemWarning('9', 3, { '1c': 0 });
    expect(w).toBeTruthy();
  });

  it('no warning for severe aphasia when commands impaired', () => {
    expect(getItemWarning('9', 2, { '1c': 1 })).toBeNull();
    expect(getItemWarning('9', 2, { '1c': 2 })).toBeNull();
  });

  it('no warning for mild aphasia (score 1) regardless of commands', () => {
    expect(getItemWarning('9', 1, { '1c': 0 })).toBeNull();
  });

  it('warns when ataxia scored and left arm fully paralyzed (Motor=4)', () => {
    const w = getItemWarning('7', 1, { '5a': 4 });
    expect(w).toBeTruthy();
    expect(w).toContain('Ataxia');
  });

  it('warns when ataxia scored and right leg fully paralyzed', () => {
    expect(getItemWarning('7', 2, { '6b': 4 })).toBeTruthy();
  });

  it('no ataxia warning when no limb is score 4', () => {
    expect(getItemWarning('7', 1, { '5a': 3, '6a': 3 })).toBeNull();
  });

  it('ataxia score of 0 never triggers warning even with paralysis', () => {
    expect(getItemWarning('7', 0, { '5a': 4 })).toBeNull();
  });

  it('warns for severe dysarthria without facial palsy or aphasia', () => {
    const w = getItemWarning('10', 2, { '9': 0, '4': 0 });
    expect(w).toBeTruthy();
  });

  it('no dysarthria warning when aphasia present', () => {
    expect(getItemWarning('10', 2, { '9': 1, '4': 0 })).toBeNull();
  });

  it('no dysarthria warning when facial palsy present', () => {
    expect(getItemWarning('10', 2, { '9': 0, '4': 1 })).toBeNull();
  });

  it('no dysarthria warning for mild dysarthria (score 1)', () => {
    expect(getItemWarning('10', 1, { '9': 0, '4': 0 })).toBeNull();
  });

  it('returns null for items with no warning logic', () => {
    expect(getItemWarning('1a', 3, {})).toBeNull();
    expect(getItemWarning('8', 2, {})).toBeNull();
    expect(getItemWarning('3', 3, {})).toBeNull();
  });
});

// ── calculateLvoProbability ─────────────────────────────────────────────────

describe('calculateLvoProbability', () => {
  it('returns Low / 20% for empty scores', () => {
    const r = calculateLvoProbability({});
    expect(r.label).toBe('Low');
    expect(r.raceScore).toBe(0);
    expect(r.probability).toBe(20);
  });

  it('returns High / 85% for severe stroke pattern', () => {
    const r = calculateLvoProbability({
      '4': 3, '5a': 4, '5b': 4, '6a': 4, '6b': 4, '2': 2, '9': 3, '11': 2,
    });
    expect(r.label).toBe('High');
    expect(r.raceScore).toBeGreaterThanOrEqual(7);
    expect(r.probability).toBe(85);
  });

  it('returns Moderate / 55% for RACE 5-6', () => {
    // facial=2, arm=2, gaze=1 = 5
    const r = calculateLvoProbability({ '4': 3, '5a': 4, '5b': 4, '2': 2 });
    expect(r.label).toBe('Moderate');
    expect(r.probability).toBe(55);
  });

  it('gaze maps NIHSS 0 → 0, NIHSS 1-2 → 1 (not 2)', () => {
    expect(calculateLvoProbability({ '2': 0 }).breakdown.gaze).toBe(0);
    expect(calculateLvoProbability({ '2': 1 }).breakdown.gaze).toBe(1);
    expect(calculateLvoProbability({ '2': 2 }).breakdown.gaze).toBe(1);
  });

  it('agnosia maps NIHSS 0 → 0, NIHSS 1-2 → 1', () => {
    expect(calculateLvoProbability({ '11': 0 }).breakdown.agnosia).toBe(0);
    expect(calculateLvoProbability({ '11': 1 }).breakdown.agnosia).toBe(1);
    expect(calculateLvoProbability({ '11': 2 }).breakdown.agnosia).toBe(1);
  });

  it('arm score uses worst of 5a and 5b', () => {
    expect(calculateLvoProbability({ '5a': 4, '5b': 0 }).breakdown.arm).toBe(2);
    expect(calculateLvoProbability({ '5a': 0, '5b': 4 }).breakdown.arm).toBe(2);
  });

  it('leg score uses worst of 6a and 6b', () => {
    expect(calculateLvoProbability({ '6a': 4, '6b': 0 }).breakdown.leg).toBe(2);
    expect(calculateLvoProbability({ '6a': 0, '6b': 4 }).breakdown.leg).toBe(2);
  });

  it('raceScore is always 0–10 (facial+arm+leg+gaze+aphasia+agnosia max)', () => {
    // facial(2)+arm(2)+leg(2)+gaze(1)+aphasia(2)+agnosia(1) = 10
    const r = calculateLvoProbability({
      '4': 3, '5a': 4, '5b': 4, '6a': 4, '6b': 4, '2': 2, '9': 3, '11': 2,
    });
    expect(r.raceScore).toBeGreaterThanOrEqual(0);
    expect(r.raceScore).toBeLessThanOrEqual(10);
  });

  it('aphasia maps NIHSS 0 → 0, 1 → 1, 2-3 → 2', () => {
    expect(calculateLvoProbability({ '9': 0 }).breakdown.aphasia).toBe(0);
    expect(calculateLvoProbability({ '9': 1 }).breakdown.aphasia).toBe(1);
    expect(calculateLvoProbability({ '9': 2 }).breakdown.aphasia).toBe(2);
    expect(calculateLvoProbability({ '9': 3 }).breakdown.aphasia).toBe(2);
  });
});
