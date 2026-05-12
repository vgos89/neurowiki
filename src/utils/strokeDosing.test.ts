import { describe, it, expect } from 'vitest';
import { getTNKDose, getTpaDoses, toKg } from './strokeDosing';

// ── getTNKDose ───────────────────────────────────────────────────────────────

describe('getTNKDose', () => {
  it('returns 15mg for weight < 60kg', () => {
    expect(getTNKDose(50)).toBe(15);
    expect(getTNKDose(59.9)).toBe(15);
  });

  it('returns 17.5mg for 60-69kg', () => {
    expect(getTNKDose(60)).toBe(17.5);
    expect(getTNKDose(65)).toBe(17.5);
    expect(getTNKDose(69.9)).toBe(17.5);
  });

  it('returns 20mg for 70-79kg', () => {
    expect(getTNKDose(70)).toBe(20);
    expect(getTNKDose(75)).toBe(20);
    expect(getTNKDose(79.9)).toBe(20);
  });

  it('returns 22.5mg for 80-89kg', () => {
    expect(getTNKDose(80)).toBe(22.5);
    expect(getTNKDose(85)).toBe(22.5);
    expect(getTNKDose(89.9)).toBe(22.5);
  });

  it('returns 25mg for weight >= 90kg (max dose)', () => {
    expect(getTNKDose(90)).toBe(25);
    expect(getTNKDose(120)).toBe(25);
    expect(getTNKDose(150)).toBe(25);
  });

  it('handles 0kg without throwing', () => {
    expect(getTNKDose(0)).toBe(15);
  });
});

// ── getTpaDoses ──────────────────────────────────────────────────────────────

describe('getTpaDoses', () => {
  it('returns zeros for 0kg weight', () => {
    const d = getTpaDoses(0);
    expect(d.total).toBe(0);
    expect(d.bolus).toBe(0);
    expect(d.infusion).toBe(0);
  });

  it('calculates correct total for 70kg (63mg)', () => {
    expect(getTpaDoses(70).total).toBe(63);
  });

  it('caps total at 90mg for 100kg', () => {
    expect(getTpaDoses(100).total).toBe(90);
  });

  it('caps total at 90mg for weights well above 100kg', () => {
    expect(getTpaDoses(150).total).toBe(90);
  });

  it('does not cap at exactly 100kg boundary — 100kg × 0.9 = 90mg exactly', () => {
    expect(getTpaDoses(100).total).toBe(90);
    expect(getTpaDoses(99).total).toBeCloseTo(89.1, 1);
  });

  it('bolus is 10% of total for 70kg', () => {
    const d = getTpaDoses(70);
    expect(d.bolus).toBeCloseTo(d.total * 0.1, 1);
  });

  it('infusion is 90% of total for 70kg', () => {
    const d = getTpaDoses(70);
    expect(d.infusion).toBeCloseTo(d.total * 0.9, 1);
  });

  it('bolus + infusion approximately equals total (within rounding)', () => {
    // Each component is independently rounded to 1 decimal, so sum may differ by 0.1
    const d = getTpaDoses(75);
    expect(d.bolus + d.infusion).toBeCloseTo(d.total, 0);
  });

  it('bolus + infusion approximately equals total for capped 100kg weight', () => {
    const d = getTpaDoses(100);
    expect(d.bolus + d.infusion).toBeCloseTo(d.total, 0);
  });
});

// ── toKg ────────────────────────────────────────────────────────────────────

describe('toKg', () => {
  it('returns kg value unchanged when unit is kg', () => {
    expect(toKg(70, 'kg')).toBe(70);
    expect(toKg(85.5, 'kg')).toBe(85.5);
  });

  it('converts lbs to kg correctly for 154 lbs (≈ 69.8kg)', () => {
    expect(toKg(154, 'lbs')).toBeCloseTo(69.8, 0);
  });

  it('converts 220 lbs to approximately 99.8kg', () => {
    expect(toKg(220, 'lbs')).toBeCloseTo(99.8, 0);
  });

  it('returns 0 for 0 weight regardless of unit', () => {
    expect(toKg(0, 'kg')).toBe(0);
    expect(toKg(0, 'lbs')).toBe(0);
  });

  it('rounds kg to 1 decimal place', () => {
    expect(toKg(70.12345, 'kg')).toBe(70.1);
  });
});
