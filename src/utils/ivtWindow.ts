/**
 * IV thrombolysis time-window classifier. Pure arithmetic: no user-facing
 * strings, no Tailwind classes, no JSX. Labels and colours live in the
 * claim-tagged JSX of PatientContextPanel so the em-dash scanner and the claims
 * scanner both see them.
 *
 * Witnessed last known well (LKW): standard if <= 270 min (4.5 h), extended if
 * <= 540 min (9 h), outside otherwise. Per AHA/ASA 2026 §4.6.1/§4.6.2 (standard)
 * and §4.6.3 Rec 2(b) (4.5 to 9 h from LKW).
 *
 * Wake-up entry (asleep and woke times both entered):
 *   aMin = minutes since last asleep (the last known well)
 *   wMin = minutes since waking with symptoms (symptom recognition)
 *   mMin = minutes since the sleep midpoint
 *   standard if aMin <= 270
 *   else extended if wMin <= 270 (Rec 1) OR mMin <= 540 (Rec 2a)
 *   else outside
 *
 * C1: the midpoint clock is measured to the CURRENT time, the treatment-time
 * reading of AHA/ASA 2026 §4.6.3 Rec 2(a) ("within 9 hours from the midpoint of
 * sleep"). This matches ExtendedIVTPathway (hoursSinceMidpoint <= 9) and is the
 * conservative reading: the chip leaves the extended tier earlier, never later.
 * All boundaries are inclusive. Minutes are whole, floored and clamped at 0.
 * Rec 2(b) needs no clause in the wake-up rule because the midpoint is never
 * before asleepAt, so mMin <= aMin always.
 *
 * Invalid input returns null. No returned number is ever NaN.
 */

export type IvtTier = 'standard' | 'extended' | 'outside';

export interface WitnessedIvtWindow {
  kind: 'witnessed';
  tier: IvtTier;
  elapsedMin: number;
  /** 270 minus elapsedMin, floored at 0. Meaningful in the standard tier. */
  minutesLeft: number;
  /** Standard tier with 30 min or less remaining. */
  lastHalfHour: boolean;
}

export interface WakeUpIvtWindow {
  kind: 'wake-up';
  tier: IvtTier;
  /** Minutes since last asleep (the LKW clock). */
  aMin: number;
  /** Minutes since waking with symptoms. */
  wMin: number;
  /** Minutes since the sleep midpoint. */
  mMin: number;
  /** 270 minus aMin, floored at 0. */
  minutesLeft: number;
  lastHalfHour: boolean;
  /** Woke within 270 min (Rec 1 route time-open). */
  rec1Open: boolean;
  /** Within 540 min of the sleep midpoint (Rec 2a route time-open). */
  rec2aOpen: boolean;
}

export type IvtWindowResult = WitnessedIvtWindow | WakeUpIvtWindow;

const STANDARD_MIN = 270;
const EXTENDED_MIN = 540;
const MS_PER_MIN = 60000;

function validTime(d: Date | null | undefined): d is Date {
  return d instanceof Date && Number.isFinite(d.getTime());
}

function wholeMinutes(ms: number): number {
  return Math.max(0, Math.floor(ms / MS_PER_MIN));
}

export function classifyWitnessed(lkw: Date, now: Date): WitnessedIvtWindow | null {
  if (!validTime(lkw) || !validTime(now)) return null;
  // A future LKW clamps to 0 (standard).
  const elapsedMin = wholeMinutes(now.getTime() - lkw.getTime());
  const tier: IvtTier =
    elapsedMin <= STANDARD_MIN ? 'standard' : elapsedMin <= EXTENDED_MIN ? 'extended' : 'outside';
  const minutesLeft = Math.max(0, STANDARD_MIN - elapsedMin);
  return {
    kind: 'witnessed',
    tier,
    elapsedMin,
    minutesLeft,
    lastHalfHour: tier === 'standard' && minutesLeft <= 30,
  };
}

export function classifyWakeUp(
  asleepAt: Date | null | undefined,
  wokeAt: Date | null | undefined,
  now: Date,
): WakeUpIvtWindow | null {
  if (!validTime(asleepAt) || !validTime(wokeAt) || !validTime(now)) return null;
  const a = asleepAt.getTime();
  const w = wokeAt.getTime();
  const n = now.getTime();
  if (a > w) return null;
  if (w > n) return null;
  const midpoint = a + (w - a) / 2;
  const aMin = wholeMinutes(n - a);
  const wMin = wholeMinutes(n - w);
  const mMin = wholeMinutes(n - midpoint);
  const rec1Open = wMin <= STANDARD_MIN;
  const rec2aOpen = mMin <= EXTENDED_MIN;
  const tier: IvtTier =
    aMin <= STANDARD_MIN ? 'standard' : rec1Open || rec2aOpen ? 'extended' : 'outside';
  const minutesLeft = Math.max(0, STANDARD_MIN - aMin);
  return {
    kind: 'wake-up',
    tier,
    aMin,
    wMin,
    mMin,
    minutesLeft,
    lastHalfHour: tier === 'standard' && minutesLeft <= 30,
    rec1Open,
    rec2aOpen,
  };
}

/**
 * Witnessed result when `lkw` is a valid Date; wake-up result when `lkw` is null
 * and `wakeUp` is present and valid; otherwise null (unset, unknown onset, or
 * an unclassifiable wake-up entry).
 */
export function classifyIvtWindow(
  input: { lkw: Date | null | undefined; wakeUp?: { asleepAt: Date; wokeAt: Date } },
  now: Date,
): IvtWindowResult | null {
  if (input.lkw instanceof Date) {
    return classifyWitnessed(input.lkw, now);
  }
  if (input.lkw === null && input.wakeUp) {
    return classifyWakeUp(input.wakeUp.asleepAt, input.wakeUp.wokeAt, now);
  }
  return null;
}
