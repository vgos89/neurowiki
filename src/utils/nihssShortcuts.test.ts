import { describe, it, expect } from 'vitest';
import { calculateTotal, getItemWarning } from './nihssShortcuts';

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
