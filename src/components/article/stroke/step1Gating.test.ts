import { describe, it, expect } from 'vitest';
import { deriveStep1Gating, type Step1GatingInput } from './step1Gating';
import { classifyIvtWindow } from '../../../utils/ivtWindow';

const t = (hh: number, mm: number, dayOffset = 0) => new Date(2026, 2, 10 + dayOffset, hh, mm);

function wakeUpInput(
  asleepAt: Date,
  wokeAt: Date,
  now: Date,
  over: Partial<Step1GatingInput> = {},
): Step1GatingInput {
  const wakeUp = { asleepAt, wokeAt };
  return {
    lkw: null,
    wakeUp,
    ivtWindow: classifyIvtWindow({ lkw: null, wakeUp }, now),
    nihssScore: 0,
    systolicBP: 140,
    diastolicBP: 80,
    hasDisablingSymptom: false,
    ...over,
  };
}

function witnessedInput(hoursAgo: number, over: Partial<Step1GatingInput> = {}): Step1GatingInput {
  const now = t(12, 0);
  const lkw = new Date(now.getTime() - hoursAgo * 3600000);
  return {
    lkw,
    ivtWindow: classifyIvtWindow({ lkw }, now),
    nihssScore: 0,
    systolicBP: 140,
    diastolicBP: 80,
    hasDisablingSymptom: false,
    ...over,
  };
}

describe('deriveStep1Gating, witnessed', () => {
  it('3 h behaves as within the window', () => {
    const g = deriveStep1Gating(witnessedInput(3, { nihssScore: 3, systolicBP: 190 }));
    expect(g.withinTPAWindow).toBe(true);
    expect(g.outsideThromboWindow).toBe(false);
    expect(g.bpTooHigh).toBe(true);
    expect(g.showDisablingSymptomsChecklist).toBe(true);
    expect(g.onDaptPath).toBe(true);
    expect(g.weightRequired).toBe(false);
    expect(g.bpControlWaived).toBe(false);
    expect(g.showExtendedIvtLink).toBe(false);
    expect(g.showWakeUpNotice).toBe(false);
  });
  it('6 h is unchanged: not within, not outside, 220/120 BP limit, link shown, weight required', () => {
    const g = deriveStep1Gating(witnessedInput(6, { nihssScore: 3, systolicBP: 200, diastolicBP: 100 }));
    expect(g.withinTPAWindow).toBe(false);
    expect(g.outsideThromboWindow).toBe(false);
    expect(g.bpTooHigh).toBe(false);
    expect(g.showDisablingSymptomsChecklist).toBe(false);
    expect(g.onDaptPath).toBe(false);
    expect(g.weightRequired).toBe(true);
    expect(g.showExtendedIvtLink).toBe(true);
    expect(g.showWakeUpNotice).toBe(false);
    expect(deriveStep1Gating(witnessedInput(6, { systolicBP: 221 })).bpTooHigh).toBe(true);
  });
  it('10 h is unchanged: outside, weight not required, link shown', () => {
    const g = deriveStep1Gating(witnessedInput(10));
    expect(g.outsideThromboWindow).toBe(true);
    expect(g.withinTPAWindow).toBe(false);
    expect(g.weightRequired).toBe(false);
    expect(g.showExtendedIvtLink).toBe(true);
  });
  it('unset LKW shows nothing and is not entered', () => {
    const g = deriveStep1Gating({
      lkw: undefined,
      ivtWindow: null,
      nihssScore: 0,
      systolicBP: 0,
      diastolicBP: 0,
      hasDisablingSymptom: false,
    });
    expect(g.lkwEntered).toBe(false);
    expect(g.trulyUnknownOnset).toBe(false);
    expect(g.showExtendedIvtLink).toBe(false);
    expect(g.showWakeUpNotice).toBe(false);
  });
});

describe('deriveStep1Gating, truly unknown onset', () => {
  const unknown: Step1GatingInput = {
    lkw: null,
    ivtWindow: null,
    nihssScore: 3,
    systolicBP: 200,
    diastolicBP: 100,
    hasDisablingSymptom: false,
  };
  it('keeps the BP waiver, hides the checklist, shows notice and link', () => {
    const g = deriveStep1Gating(unknown);
    expect(g.trulyUnknownOnset).toBe(true);
    expect(g.bpControlWaived).toBe(true);
    expect(g.showDisablingSymptomsChecklist).toBe(false);
    expect(g.withinTPAWindow).toBe(false);
    expect(g.weightRequired).toBe(true);
    expect(g.showWakeUpNotice).toBe(true);
    expect(g.showExtendedIvtLink).toBe(true);
  });
  it('an unclassifiable wake-up entry falls back to unknown-onset behaviour', () => {
    const g = deriveStep1Gating({
      ...unknown,
      wakeUp: { asleepAt: t(6, 0), wokeAt: t(5, 0) },
    });
    expect(g.trulyUnknownOnset).toBe(true);
    expect(g.bpControlWaived).toBe(true);
    expect(g.showWakeUpNotice).toBe(true);
  });
});

describe('deriveStep1Gating, wake-up entries (C15 items 18 to 21)', () => {
  // Spec rows: 1 = 14:00/15:00 now 17:30; 3 = 23:00/06:00+1 now 07:00+1;
  // 5 = 22:00/06:00+1 now 11:00+1; 6 = same, now 11:01+1.
  it('18: standard tier with BP 200/115 makes bpTooHigh true and BP control required', () => {
    const g = deriveStep1Gating(wakeUpInput(t(14, 0), t(15, 0), t(17, 30), { systolicBP: 200, diastolicBP: 115 }));
    expect(g.withinTPAWindow).toBe(true);
    expect(g.bpTooHigh).toBe(true);
    expect(g.bpControlWaived).toBe(false);
  });
  it('19: standard tier with NIHSS 3 shows the disabling-symptoms checklist', () => {
    const g = deriveStep1Gating(wakeUpInput(t(14, 0), t(15, 0), t(17, 30), { nihssScore: 3 }));
    expect(g.showDisablingSymptomsChecklist).toBe(true);
    expect(g.onDaptPath).toBe(true);
    expect(g.weightRequired).toBe(false);
  });
  it('20: outside tier gives weightRequired false, same as witnessed beyond 9 h', () => {
    const g = deriveStep1Gating(wakeUpInput(t(22, 0), t(6, 0, 1), t(11, 1, 1)));
    expect(g.outsideThromboWindow).toBe(true);
    expect(g.weightRequired).toBe(false);
    expect(g.weightRequired).toBe(deriveStep1Gating(witnessedInput(10)).weightRequired);
  });
  it('extended tier gets neither the checklist nor the within-window BP limit', () => {
    const g = deriveStep1Gating(
      wakeUpInput(t(23, 0), t(6, 0, 1), t(7, 0, 1), { nihssScore: 3, systolicBP: 200 }),
    );
    expect(g.withinTPAWindow).toBe(false);
    expect(g.outsideThromboWindow).toBe(false);
    expect(g.showDisablingSymptomsChecklist).toBe(false);
    expect(g.bpTooHigh).toBe(false);
    expect(g.weightRequired).toBe(true);
  });
  it('21: notice visibility for spec rows 1, 3, 5, 6', () => {
    expect(deriveStep1Gating(wakeUpInput(t(14, 0), t(15, 0), t(17, 30))).showWakeUpNotice).toBe(false);
    expect(deriveStep1Gating(wakeUpInput(t(23, 0), t(6, 0, 1), t(7, 0, 1))).showWakeUpNotice).toBe(true);
    expect(deriveStep1Gating(wakeUpInput(t(22, 0), t(6, 0, 1), t(11, 0, 1))).showWakeUpNotice).toBe(false);
    expect(deriveStep1Gating(wakeUpInput(t(22, 0), t(6, 0, 1), t(11, 1, 1))).showWakeUpNotice).toBe(false);
  });
  it('Extended-IVT link: hidden in standard, shown in extended and outside', () => {
    expect(deriveStep1Gating(wakeUpInput(t(14, 0), t(15, 0), t(17, 30))).showExtendedIvtLink).toBe(false);
    expect(deriveStep1Gating(wakeUpInput(t(23, 0), t(6, 0, 1), t(7, 0, 1))).showExtendedIvtLink).toBe(true);
    expect(deriveStep1Gating(wakeUpInput(t(22, 0), t(6, 0, 1), t(11, 1, 1))).showExtendedIvtLink).toBe(true);
  });
});
