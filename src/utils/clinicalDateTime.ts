/**
 * Clinical date/time formatters.
 *
 * Used in NIHSS + other calculators to display:
 *   - "Performed" timestamp (auto-captured on first input)
 *   - LKW (Last Known Well) selection
 *   - Any clinician-facing date/time in EMR copy/share output
 *
 * Timezone abbreviation is derived from the user's local device
 * (Intl.DateTimeFormat with timeZoneName: 'short'). This gives:
 *   - 'EST' / 'EDT' for America/New_York
 *   - 'PST' / 'PDT' for America/Los_Angeles
 *   - 'IST' for Asia/Kolkata
 *   - etc.
 *
 * No external dependencies (no moment, date-fns, dayjs).
 */

/** Pull the short timezone abbreviation (EST / PST / IST / etc.) from the device. */
export function getTimezoneAbbreviation(date: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZoneName: 'short',
    }).formatToParts(date);
    const tz = parts.find((p) => p.type === 'timeZoneName')?.value;
    return tz ?? '';
  } catch {
    return '';
  }
}

/**
 * Format for EMR copy/share output and the header meta line.
 * Example: "March 19, 2026 · 2:32 PM EST"
 */
export function formatClinicalDateTime(date: Date): string {
  const datePart = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const tz = getTimezoneAbbreviation(date);
  return tz ? `${datePart} · ${timePart} ${tz}` : `${datePart} · ${timePart}`;
}

/**
 * Compact format for in-panel display where horizontal space is tight.
 * Example: "Mar 19 · 2:32 PM EST" or, if same day, "Today, 2:32 PM EST".
 */
export function formatClinicalDateShort(date: Date, now: Date = new Date()): string {
  const sameDay = isSameLocalDay(date, now);
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = isSameLocalDay(date, yesterday);

  const timePart = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  const tz = getTimezoneAbbreviation(date);
  const tzSuffix = tz ? ` ${tz}` : '';

  if (sameDay) return `Today, ${timePart}${tzSuffix}`;
  if (isYesterday) return `Yesterday, ${timePart}${tzSuffix}`;

  const monthDay = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${monthDay} · ${timePart}${tzSuffix}`;
}

/** Compare two dates by local calendar day. */
function isSameLocalDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
