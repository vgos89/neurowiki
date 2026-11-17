import { describe, it, expect } from 'vitest';
import {
  parseManualTime,
  to24h,
  buildSleepDate,
  formatSleepField,
  sleepDayOffset,
} from './lkwTime';

describe('parseManualTime', () => {
  it('reads 0630 as 24-hour 6:30 in the morning (leading zero)', () => {
    const p = parseManualTime('0630')!;
    expect(p.hourIdx).toBe(5);
    expect(p.minute).toBe(30);
    expect(p.minuteIdx5).toBe(6);
    expect(p.periodIdx).toBe(0);
    expect(p.isMilitary).toBe(true);
  });

  it('reads every leading-zero hour form as a 24-hour morning time', () => {
    // V decision 2026-11-17: with PM selected, "0800" used to become 8:00 PM.
    expect(parseManualTime('08:02')).toMatchObject({ hourIdx: 7, minute: 2, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('0800')).toMatchObject({ hourIdx: 7, minute: 0, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('0130')).toMatchObject({ hourIdx: 0, minute: 30, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('09')).toMatchObject({ hourIdx: 8, minute: 0, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('09:59')).toMatchObject({ hourIdx: 8, minute: 59, periodIdx: 0, isMilitary: true });
  });

  it('keeps the selected AM/PM when there is no leading zero and no suffix', () => {
    // 630, 8:02 and 7 carry no 24-hour signal. 10, 11 and 12 cannot carry a
    // leading zero, so 1030 must not be forced to the morning.
    for (const raw of ['630', '8:02', '7', '1030', '10:30', '11:15', '1200', '12:15']) {
      const p = parseManualTime(raw)!;
      expect(p.periodIdx, raw).toBe(-1);
      expect(p.isMilitary, raw).toBe(false);
    }
  });

  it('pins the leading-zero boundaries (clinical review 2026-11-17)', () => {
    // Lowest leading-zero hour.
    expect(parseManualTime('01')).toMatchObject({ hourIdx: 0, minute: 0, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('0100')).toMatchObject({ hourIdx: 0, minute: 0, periodIdx: 0, isMilitary: true });
    // Bare two-digit form named in the docstring.
    expect(parseManualTime('06')).toMatchObject({ hourIdx: 5, minute: 0, periodIdx: 0, isMilitary: true });
    // Hour zero stays midnight through its own branch, however it is written.
    expect(parseManualTime('0:30')).toMatchObject({ hourIdx: 11, minute: 30, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('00:30')).toMatchObject({ hourIdx: 11, minute: 30, periodIdx: 0, isMilitary: true });
    // Three digits: the hour text is the single digit "0", so this is 00:12.
    expect(parseManualTime('012')).toMatchObject({ hourIdx: 11, minute: 12, periodIdx: 0, isMilitary: true });
  });

  it('lets an explicit AM/PM win over a leading zero', () => {
    expect(parseManualTime('08:30 pm')).toMatchObject({ hourIdx: 7, minute: 30, periodIdx: 1, isMilitary: false });
    expect(parseManualTime('0630am')).toMatchObject({ hourIdx: 5, minute: 30, periodIdx: 0, isMilitary: false });
  });

  it('parses "6:30 pm"', () => {
    const p = parseManualTime('6:30 pm')!;
    expect(p).toMatchObject({ hourIdx: 5, minute: 30, periodIdx: 1, isMilitary: false });
  });

  it('parses 23:25 as military', () => {
    const p = parseManualTime('23:25')!;
    expect(p).toMatchObject({ hourIdx: 10, minute: 25, minuteIdx5: 5, periodIdx: 1, isMilitary: true });
  });

  it('never wraps :58 into the same hour (regression)', () => {
    const p = parseManualTime('1158 pm')!;
    expect(p.hourIdx).toBe(10);
    expect(p.minute).toBe(58);
    expect(p.minuteIdx5).toBe(11);
    expect(p.minuteIdx5).not.toBe(0);
    expect(p.periodIdx).toBe(1);
  });

  it('keeps exact :59', () => {
    const p = parseManualTime('1159')!;
    expect(p.minute).toBe(59);
    expect(p.minuteIdx5).toBe(11);
  });

  it('parses a bare hour', () => {
    const p = parseManualTime('7')!;
    expect(p).toMatchObject({ hourIdx: 6, minute: 0, periodIdx: -1, isMilitary: false });
  });

  it('treats 0000 as military midnight and 1200 pm as noon', () => {
    expect(parseManualTime('0000')).toMatchObject({ hourIdx: 11, periodIdx: 0, isMilitary: true });
    expect(parseManualTime('12:00 pm')).toMatchObject({ hourIdx: 11, periodIdx: 1, isMilitary: false });
  });

  it('rejects invalid input', () => {
    expect(parseManualTime('2400')).toBeNull();
    expect(parseManualTime('12:60')).toBeNull();
    expect(parseManualTime('abc')).toBeNull();
    expect(parseManualTime('')).toBeNull();
    expect(parseManualTime('13 pm')).toBeNull();
  });
});

describe('to24h', () => {
  it('handles the 12 o clock edges', () => {
    expect(to24h(12, 0)).toBe(0);
    expect(to24h(12, 1)).toBe(12);
    expect(to24h(1, 1)).toBe(13);
    expect(to24h(11, 1)).toBe(23);
    expect(to24h(1, 0)).toBe(1);
  });
});

describe('buildSleepDate', () => {
  const now = new Date(2026, 10, 15, 9, 41, 27, 500); // Nov 15 2026

  it('offset 0 is today with seconds zeroed', () => {
    const d = buildSleepDate(now, 0, 7, 5, 0);
    expect(d.getFullYear()).toBe(2026);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(15);
    expect(d.getHours()).toBe(7);
    expect(d.getMinutes()).toBe(5);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
  });

  it('offset 1 and 2 go back whole days', () => {
    expect(buildSleepDate(now, 1, 11, 0, 1).getDate()).toBe(14);
    expect(buildSleepDate(now, 1, 11, 0, 1).getHours()).toBe(23);
    expect(buildSleepDate(now, 2, 12, 30, 0).getDate()).toBe(13);
    expect(buildSleepDate(now, 2, 12, 30, 0).getHours()).toBe(0);
  });

  it('crosses a month boundary', () => {
    const first = new Date(2026, 11, 1, 6, 0, 0, 0);
    const d = buildSleepDate(first, 1, 11, 58, 1);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(30);
    expect(d.getHours()).toBe(23);
    expect(d.getMinutes()).toBe(58);
    const d2 = buildSleepDate(first, 2, 10, 0, 1);
    expect(d2.getMonth()).toBe(10);
    expect(d2.getDate()).toBe(29);
  });
});

describe('formatSleepField', () => {
  it('formats 12-hour', () => {
    expect(formatSleepField(11, 0, 1, false)).toBe('11:00 PM');
    expect(formatSleepField(12, 5, 0, false)).toBe('12:05 AM');
    expect(formatSleepField(6, 58, 0, false)).toBe('6:58 AM');
  });

  it('formats military', () => {
    expect(formatSleepField(11, 0, 1, true)).toBe('23:00');
    expect(formatSleepField(12, 30, 0, true)).toBe('00:30');
    expect(formatSleepField(12, 30, 1, true)).toBe('12:30');
  });
});

describe('sleepDayOffset', () => {
  const now = new Date(2026, 10, 15, 0, 10);

  it('is 0 for the same calendar day', () => {
    expect(sleepDayOffset(now, new Date(2026, 10, 15, 23, 59))).toBe(0);
  });

  it('is 1 for yesterday, across midnight', () => {
    expect(sleepDayOffset(now, new Date(2026, 10, 14, 23, 55))).toBe(1);
  });

  it('counts calendar days across a month boundary', () => {
    expect(sleepDayOffset(new Date(2026, 11, 1, 8, 0), new Date(2026, 10, 29, 22, 0))).toBe(2);
  });
});
