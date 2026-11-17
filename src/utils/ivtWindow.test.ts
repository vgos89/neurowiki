import { describe, it, expect } from 'vitest';
import { classifyWitnessed, classifyWakeUp, classifyIvtWindow } from './ivtWindow';

/** Build a Date on 2026-03-10 plus a day offset, local time. */
const t = (hh: number, mm: number, dayOffset = 0, ss = 0) =>
  new Date(2026, 2, 10 + dayOffset, hh, mm, ss);

function noNaN(r: object | null) {
  if (!r) return;
  for (const v of Object.values(r)) {
    if (typeof v === 'number') expect(Number.isNaN(v)).toBe(false);
  }
}

describe('classifyWakeUp, spec section 7 boundary rows', () => {
  it('row 1: short nap, standard', () => {
    const r = classifyWakeUp(t(14, 0), t(15, 0), t(17, 30))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([210, 150, 180]);
    expect(r.tier).toBe('standard');
    expect(r.lastHalfHour).toBe(false);
    noNaN(r);
  });
  it('row 2: standard with 20 min left', () => {
    const r = classifyWakeUp(t(14, 0), t(15, 0), t(18, 10))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([250, 190, 220]);
    expect(r.tier).toBe('standard');
    expect(r.minutesLeft).toBe(20);
    expect(r.lastHalfHour).toBe(true);
  });
  it('row 3: Rec 1 and Rec 2a both open', () => {
    const r = classifyWakeUp(t(23, 0), t(6, 0, 1), t(7, 0, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([480, 60, 270]);
    expect(r.tier).toBe('extended');
    expect(r.rec1Open).toBe(true);
    expect(r.rec2aOpen).toBe(true);
  });
  it('row 4: Rec 1 only', () => {
    const r = classifyWakeUp(t(20, 0), t(10, 0, 1), t(13, 0, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([1020, 180, 600]);
    expect(r.tier).toBe('extended');
    expect(r.rec1Open).toBe(true);
    expect(r.rec2aOpen).toBe(false);
  });
  it('row 5: Rec 2a only, midpoint exactly 9 h (inclusive)', () => {
    const r = classifyWakeUp(t(22, 0), t(6, 0, 1), t(11, 0, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([780, 300, 540]);
    expect(r.tier).toBe('extended');
    expect(r.rec1Open).toBe(false);
    expect(r.rec2aOpen).toBe(true);
  });
  it('row 6: both clocks expired, outside', () => {
    const r = classifyWakeUp(t(22, 0), t(6, 0, 1), t(11, 1, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([781, 301, 541]);
    expect(r.tier).toBe('outside');
    expect(r.rec1Open).toBe(false);
    expect(r.rec2aOpen).toBe(false);
  });
  it('row 7: woke exactly 4.5 h (inclusive)', () => {
    const r = classifyWakeUp(t(20, 0), t(10, 0, 1), t(14, 30, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([1110, 270, 690]);
    expect(r.tier).toBe('extended');
    expect(r.rec1Open).toBe(true);
  });
  it('row 8: everything past', () => {
    const r = classifyWakeUp(t(20, 0), t(10, 0, 1), t(14, 31, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([1111, 271, 691]);
    expect(r.tier).toBe('outside');
  });
  it('row 9: LKW exactly 4.5 h, standard with 0 min left', () => {
    const r = classifyWakeUp(t(1, 0), t(3, 0), t(5, 30))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([270, 150, 210]);
    expect(r.tier).toBe('standard');
    expect(r.minutesLeft).toBe(0);
    expect(r.lastHalfHour).toBe(true);
  });
  it('row 10: no gap after standard', () => {
    const r = classifyWakeUp(t(1, 0), t(3, 0), t(5, 31))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([271, 151, 211]);
    expect(r.tier).toBe('extended');
    expect(r.minutesLeft).toBe(0);
    expect(r.lastHalfHour).toBe(false);
  });
  it('row 11: everything expired', () => {
    const r = classifyWakeUp(t(22, 0), t(6, 0, 1), t(12, 0, 1))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([840, 360, 600]);
    expect(r.tier).toBe('outside');
  });
  it('row 12: invalid order returns null', () => {
    expect(classifyWakeUp(t(6, 0), t(5, 0), t(9, 0))).toBeNull();
    expect(classifyWakeUp(t(6, 0), t(5, 0), t(23, 0))).toBeNull();
  });
});

describe('classifyWitnessed regressions', () => {
  const lkw = t(8, 0);
  const at = (min: number) => new Date(lkw.getTime() + min * 60000);
  it('270 min is standard', () => {
    const r = classifyWitnessed(lkw, at(270))!;
    expect(r.tier).toBe('standard');
    expect(r.elapsedMin).toBe(270);
    expect(r.minutesLeft).toBe(0);
  });
  it('271 min is extended', () => {
    expect(classifyWitnessed(lkw, at(271))!.tier).toBe('extended');
  });
  it('540 min is extended', () => {
    expect(classifyWitnessed(lkw, at(540))!.tier).toBe('extended');
  });
  it('541 min is outside', () => {
    expect(classifyWitnessed(lkw, at(541))!.tier).toBe('outside');
  });
  it('future LKW clamps to 0 and is standard', () => {
    const r = classifyWitnessed(at(60), lkw)!;
    expect(r.elapsedMin).toBe(0);
    expect(r.tier).toBe('standard');
    expect(r.minutesLeft).toBe(270);
    noNaN(r);
  });
  it('invalid Date returns null', () => {
    expect(classifyWitnessed(new Date(NaN), lkw)).toBeNull();
  });
});

describe('classifyWakeUp, C15 additions', () => {
  it('13: Rec 2a-only with aMin <= 540', () => {
    const r = classifyWakeUp(t(1, 0), t(3, 0), t(9, 30))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([510, 390, 450]);
    expect(r.tier).toBe('extended');
    expect(r.rec1Open).toBe(false);
    expect(r.rec2aOpen).toBe(true);
  });
  it('14: wokeAt after now returns null', () => {
    expect(classifyWakeUp(t(1, 0), t(6, 0), t(5, 0))).toBeNull();
  });
  it('15: asleepAt equals wokeAt', () => {
    const r = classifyWakeUp(t(10, 0), t(10, 0), t(14, 30))!;
    expect([r.aMin, r.wMin, r.mMin]).toEqual([270, 270, 270]);
    expect(r.tier).toBe('standard');
    expect(r.minutesLeft).toBe(0);
    noNaN(r);
  });
  it('16a: sub-minute flooring keeps 270 min 59 s in standard', () => {
    const r = classifyWakeUp(t(10, 0), t(10, 30), t(14, 30, 0, 59))!;
    expect(r.aMin).toBe(270);
    expect(r.tier).toBe('standard');
  });
  it('16b: odd-minute midpoint is floored (asleep 22:00, woke 06:01, now 11:00:59)', () => {
    // Span 481 min, midpoint 02:00:30. now minus midpoint = 540 min 29 s, floored to 540.
    const r = classifyWakeUp(t(22, 0), t(6, 1, 1), t(11, 0, 1, 59))!;
    expect(r.aMin).toBe(780);
    expect(r.wMin).toBe(299);
    expect(r.mMin).toBe(540);
    expect(r.tier).toBe('extended');
    expect(r.rec2aOpen).toBe(true);
  });
  it('17: missing or invalid inputs return null', () => {
    expect(classifyWakeUp(undefined, t(6, 0), t(9, 0))).toBeNull();
    expect(classifyWakeUp(t(1, 0), undefined, t(9, 0))).toBeNull();
    expect(classifyWakeUp(null, null, t(9, 0))).toBeNull();
    expect(classifyWakeUp(new Date(NaN), t(6, 0), t(9, 0))).toBeNull();
    expect(classifyWakeUp(t(1, 0), t(6, 0), new Date(NaN))).toBeNull();
  });
});

describe('classifyIvtWindow dispatch', () => {
  const now = t(12, 0);
  it('returns the witnessed result for a valid LKW', () => {
    const r = classifyIvtWindow({ lkw: t(10, 0) }, now)!;
    expect(r.kind).toBe('witnessed');
  });
  it('returns the wake-up result when lkw is null and wakeUp present', () => {
    const r = classifyIvtWindow({ lkw: null, wakeUp: { asleepAt: t(1, 0), wokeAt: t(3, 0) } }, now)!;
    expect(r.kind).toBe('wake-up');
  });
  it('returns null for unknown onset, unset, and invalid wake-up', () => {
    expect(classifyIvtWindow({ lkw: null }, now)).toBeNull();
    expect(classifyIvtWindow({ lkw: undefined }, now)).toBeNull();
    expect(
      classifyIvtWindow({ lkw: null, wakeUp: { asleepAt: t(6, 0), wokeAt: t(5, 0) } }, now),
    ).toBeNull();
  });
  it('prefers the witnessed clock when lkw is a Date even if wakeUp is present', () => {
    const r = classifyIvtWindow(
      { lkw: t(10, 0), wakeUp: { asleepAt: t(1, 0), wokeAt: t(3, 0) } },
      now,
    )!;
    expect(r.kind).toBe('witnessed');
  });
});
