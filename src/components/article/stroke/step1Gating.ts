import type { IvtWindowResult } from '../../../utils/ivtWindow';

/**
 * Pure derivation of the Stroke Code Step 1 gating flags from the shared IVT
 * window classifier. No user-facing strings. Keeps the Step 1 gates and the
 * panel chip on one tier so they cannot disagree.
 *
 * Witnessed behaviour is identical to the pre-classifier code. A wake-up entry
 * (lkw null with asleep and woke times) follows its tier: the standard tier
 * gets the witnessed toolset (BP 185/110 gate, disabling-symptoms checklist,
 * DAPT path); extended gets what wake-up got before (neither flag); outside
 * behaves like witnessed more than 9 h. An unclassifiable wake-up entry falls
 * back to unknown-onset behaviour.
 */
export interface Step1GatingInput {
  lkw: Date | null | undefined;
  wakeUp?: { asleepAt: Date; wokeAt: Date };
  ivtWindow: IvtWindowResult | null;
  nihssScore: number;
  systolicBP: number;
  diastolicBP: number;
  hasDisablingSymptom: boolean;
}

export interface Step1Gating {
  lkwEntered: boolean;
  trulyUnknownOnset: boolean;
  withinTPAWindow: boolean;
  outsideThromboWindow: boolean;
  showDisablingSymptomsChecklist: boolean;
  bpTooHigh: boolean;
  onDaptPath: boolean;
  weightRequired: boolean;
  bpControlWaived: boolean;
  showWakeUpNotice: boolean;
  showExtendedIvtLink: boolean;
}

export function deriveStep1Gating(input: Step1GatingInput): Step1Gating {
  const { lkw, wakeUp, ivtWindow, nihssScore, systolicBP, diastolicBP, hasDisablingSymptom } = input;
  const lkwEntered = lkw !== undefined;
  const trulyUnknownOnset = lkw === null && (!wakeUp || ivtWindow === null);
  const withinTPAWindow = ivtWindow?.tier === 'standard';
  const outsideThromboWindow = ivtWindow?.tier === 'outside';
  const showDisablingSymptomsChecklist =
    withinTPAWindow && nihssScore >= 1 && nihssScore <= 5 && !trulyUnknownOnset;
  const bpTooHigh = withinTPAWindow
    ? systolicBP > 185 || diastolicBP > 110
    : systolicBP > 220 || diastolicBP > 120;
  const onDaptPath =
    withinTPAWindow && nihssScore >= 1 && nihssScore <= 3 && !hasDisablingSymptom;
  const weightRequired = !outsideThromboWindow && !onDaptPath;
  const bpControlWaived = trulyUnknownOnset;
  const showWakeUpNotice =
    trulyUnknownOnset ||
    (ivtWindow?.kind === 'wake-up' && ivtWindow.tier === 'extended' && ivtWindow.rec1Open);
  const showExtendedIvtLink =
    lkwEntered && (trulyUnknownOnset || (ivtWindow != null && ivtWindow.tier !== 'standard'));
  return {
    lkwEntered,
    trulyUnknownOnset,
    withinTPAWindow,
    outsideThromboWindow,
    showDisablingSymptomsChecklist,
    bpTooHigh,
    onDaptPath,
    weightRequired,
    bpControlWaived,
    showWakeUpNotice,
    showExtendedIvtLink,
  };
}
