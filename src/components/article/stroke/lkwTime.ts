/**
 * Pure time helpers for LKWTimePicker (parsing, formatting, date building).
 * No React and no DOM, so they can be unit-tested in a node environment.
 */

export interface ParsedTime {
  hourIdx: number;       // 0-11 (matches the Specific Time drum; hour12 = hourIdx + 1)
  minuteIdx5: number;    // 0-11 (5-minute snap, matches the Specific Time drum)
  minute: number;        // 0-59 exact minute as typed
  periodIdx: number;     // 0 = AM, 1 = PM, -1 = keep the caller's current AM/PM
  isMilitary: boolean;   // typed value was unambiguous 24-hour (0 or >= 13)
}

/**
 * Accepts: "11:25 PM", "1:25 am", "1125", "23:25", "2325", "0630", "7".
 * - HH:MM with AM/PM suffix: 12-hour interpretation, AM/PM forced.
 * - HH >= 13 or HH = 0: military, AM/PM not applicable.
 * - 1-12 without suffix: periodIdx = -1 (caller keeps its current AM/PM).
 * - 3 or 4 digits: the last two are minutes.
 * Returns null when the text is not a valid time.
 */
export function parseManualTime(raw: string): ParsedTime | null {
  const s = raw.trim().toLowerCase().replace(/\s+/g, '');
  if (!s) return null;
  // Detect explicit am/pm suffix.
  let suffix: 'am' | 'pm' | null = null;
  let body = s;
  if (s.endsWith('am')) { suffix = 'am'; body = s.slice(0, -2); }
  else if (s.endsWith('pm')) { suffix = 'pm'; body = s.slice(0, -2); }
  body = body.replace(/[^0-9:]/g, '');
  let hh = 0;
  let mm = 0;
  if (body.includes(':')) {
    const [h, m] = body.split(':');
    if (h === '' || m === '' || !/^\d{1,2}$/.test(h) || !/^\d{1,2}$/.test(m)) return null;
    hh = Number(h); mm = Number(m);
  } else if (/^\d{3,4}$/.test(body)) {
    // 3 or 4 digits: last two are minutes
    hh = Number(body.slice(0, body.length - 2));
    mm = Number(body.slice(-2));
  } else if (/^\d{1,2}$/.test(body)) {
    hh = Number(body); mm = 0;
  } else {
    return null;
  }
  if (mm < 0 || mm > 59) return null;
  if (hh < 0 || hh > 23) return null;
  let isMilitary: boolean;
  let h12: number;
  let periodIdx: number;
  if (suffix) {
    // AM/PM explicit → 12-hour
    if (hh < 1 || hh > 12) return null;
    isMilitary = false;
    h12 = hh % 12; // 12 → 0
    periodIdx = suffix === 'pm' ? 1 : 0;
  } else if (hh >= 13) {
    // Military
    isMilitary = true;
    h12 = (hh - 12) % 12;
    periodIdx = 1;
  } else if (hh === 0) {
    // Military midnight
    isMilitary = true;
    h12 = 0;
    periodIdx = 0;
  } else {
    // 1–12 without suffix — assume the current AM/PM keeps; not military.
    isMilitary = false;
    h12 = hh % 12;
    periodIdx = -1; // sentinel: caller keeps existing periodIdx
  }
  const hourIdx = (h12 + 11) % 12; // h12=1 → idx 0; h12=12/0 → idx 11
  // Clamp, never wrap: Math.round(58 / 5) = 12 would otherwise map to :00 and
  // silently move 11:58 to 11:00 of the same hour. The Specific Time wheels are
  // 5-minute granular (idx 0-11), so :58 and :59 snap down to the :55 slot.
  const minuteIdx5 = Math.min(11, Math.round(mm / 5));
  return { hourIdx, minuteIdx5, minute: mm, periodIdx, isMilitary };
}

/** 12-hour clock + AM/PM index to 24-hour (12 AM → 0, 12 PM → 12). */
export function to24h(hour12: number, periodIdx: number): number {
  const h = hour12 % 12;
  return periodIdx === 1 ? h + 12 : h;
}

/** dayOffset 0 = today, 1 = yesterday. Seconds and milliseconds are zeroed. */
export function buildSleepDate(
  now: Date,
  dayOffset: number,
  hour12: number,
  minute: number,
  periodIdx: number,
): Date {
  const d = new Date(now);
  d.setDate(d.getDate() - dayOffset);
  d.setHours(to24h(hour12, periodIdx), minute, 0, 0);
  return d;
}

/** "11:00 PM", or "23:00" when the clinician typed 24-hour time. */
export function formatSleepField(
  hour12: number,
  minute: number,
  periodIdx: number,
  isMilitary: boolean,
): string {
  const mm = String(minute).padStart(2, '0');
  if (isMilitary) return `${String(to24h(hour12, periodIdx)).padStart(2, '0')}:${mm}`;
  return `${hour12}:${mm} ${periodIdx === 1 ? 'PM' : 'AM'}`;
}

/** Whole calendar days between `d` and today (0 if the same calendar day). */
export function sleepDayOffset(now: Date, d: Date): number {
  const a = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  const b = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.round((a - b) / 86_400_000);
}
