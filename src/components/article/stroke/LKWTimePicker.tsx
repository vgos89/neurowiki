import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Moon, AlarmClock, Clock } from 'lucide-react';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

export interface LKWTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  onUnknown: () => void;
  initialDate?: Date;
  /** Show the Sleep Onset tab (WAKE-UP trial method). Default: false. */
  showSleepOnset?: boolean;
  /** Which tab to open on. Default: 'specific'. Only used when showSleepOnset=true. */
  defaultMode?: 'specific' | 'sleep';
  /** Called when the clinician confirms sleep onset times. */
  onSleepOnset?: (bedtime: Date, wakeTime: Date) => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DOW = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

/* ─────────────────────────────────────────────
   Drum-roll scroll column
───────────────────────────────────────────── */
interface ScrollColProps {
  items: string[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
  itemH?: number;
  colW?: number;
  /** aria-label for the column (e.g. "Hour", "Minute", "AM/PM"). */
  ariaLabel: string;
}

const ScrollCol: React.FC<ScrollColProps> = ({
  items, selectedIdx, onSelect,
  itemH = 48, colW = 56,
  ariaLabel,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hasMounted = useRef(false);
  const isExternal = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      if (ref.current) ref.current.scrollTop = selectedIdx * itemH;
      return;
    }
    isExternal.current = true;
    ref.current?.scrollTo({ top: selectedIdx * itemH, behavior: 'smooth' });
    const t = setTimeout(() => { isExternal.current = false; }, 450);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedIdx]);

  const handleScroll = () => {
    if (isExternal.current) return;
    clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / itemH);
      const c = Math.max(0, Math.min(items.length - 1, idx));
      onSelect(c);
      ref.current.scrollTo({ top: c * itemH, behavior: 'smooth' });
    }, 120);
  };

  return (
    // `isolation: isolate` creates a fresh stacking context for this column
    // so the selection highlight (z-10), fades (z-20) and item text (z-30)
    // stack predictably on iOS Safari. Without isolation, the scroll
    // container's implicit stacking context (from `-webkit-overflow-scrolling`)
    // hides the selected item's white text behind the solid blue highlight.
    // (V iPhone bug report 2026-05-20.)
    <div
      className="relative select-none flex-shrink-0"
      style={{ width: colW, isolation: 'isolate' }}
    >
      {/* Selection highlight */}
      <div
        className="absolute inset-x-1 rounded-xl bg-neuro-500 pointer-events-none z-10"
        style={{ top: itemH, height: itemH }}
      />
      {/* Fade top */}
      <div
        className="absolute inset-x-0 top-0 bg-gradient-to-b from-white to-transparent pointer-events-none z-20"
        style={{ height: itemH }}
      />
      {/* Fade bottom */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-white to-transparent pointer-events-none z-20"
        style={{ height: itemH }}
      />
      <div
        ref={ref}
        className="relative overflow-y-scroll focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:rounded-xl focus-visible:outline-none"
        style={{
          height: itemH * 3,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
          // Belt-and-suspenders: explicit z-index on the scroll container
          // keeps the items at z-30 above the absolutely-positioned
          // highlight at z-10 even on iOS where the implicit stacking
          // context from the overflow style would otherwise win.
          zIndex: 30,
          // iPhone Sleep Onset glitch fix (2026-05-22): contain momentum
          // scrolling inside this drum so a fling on one column does not
          // bleed into adjacent drums or the modal body. Without this,
          // Sleep Onset's 4 stacked drums hijack each other's momentum
          // on iOS Safari.
          overscrollBehavior: 'contain',
          touchAction: 'pan-y',
        } as React.CSSProperties}
        onScroll={handleScroll}
        // Cancel any in-flight snap timer the instant the user re-grabs
        // this column. Previously the 120ms snap could fire mid-drag of
        // a second touch, snapping the wheel back under the user's
        // finger ("keeps auto-snapping to the same time" iPhone report).
        onTouchStart={() => {
          clearTimeout(snapTimer.current);
          isExternal.current = false;
        }}
        // a11y: keyboard-navigable listbox per WCAG 2.1.1 — previously
        // the drum was scroll-only (mouse/touch) per
        // audit-stroke-code-a11y-2026-05-17.md BLOCKER A-1.
        tabIndex={0}
        role="listbox"
        aria-label={ariaLabel}
        aria-activedescendant={`${ariaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-opt-${selectedIdx}`}
        onKeyDown={(e) => {
          let nextIdx = selectedIdx;
          switch (e.key) {
            case 'ArrowDown':
              nextIdx = Math.min(items.length - 1, selectedIdx + 1);
              break;
            case 'ArrowUp':
              nextIdx = Math.max(0, selectedIdx - 1);
              break;
            case 'PageDown':
              nextIdx = Math.min(items.length - 1, selectedIdx + 5);
              break;
            case 'PageUp':
              nextIdx = Math.max(0, selectedIdx - 5);
              break;
            case 'Home':
              nextIdx = 0;
              break;
            case 'End':
              nextIdx = items.length - 1;
              break;
            default:
              return;
          }
          e.preventDefault();
          if (nextIdx !== selectedIdx) onSelect(nextIdx);
        }}
      >
        <div style={{ height: itemH }} />
        {items.map((item, i) => (
          <div
            key={i}
            id={`${ariaLabel.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-opt-${i}`}
            role="option"
            aria-selected={i === selectedIdx}
            style={{ height: itemH }}
            className={`flex items-center justify-center cursor-pointer tabular-nums font-bold transition-colors relative z-30
              ${i === selectedIdx ? 'text-white text-xl' : 'text-slate-400 text-lg hover:text-slate-600'}
            `}
            onClick={() => {
              onSelect(i);
              ref.current?.scrollTo({ top: i * itemH, behavior: 'smooth' });
            }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: itemH }} />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Shared calendar grid
───────────────────────────────────────────── */
interface CalendarGridProps {
  viewMonth: number;
  viewYear: number;
  selDay: number;
  selMonth: number;
  selYear: number;
  now: Date;
  onSelectDay: (day: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  canNextMonth: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  viewMonth, viewYear, selDay, selMonth, selYear, now,
  onSelectDay, onPrevMonth, onNextMonth, canNextMonth,
}) => {
  const daysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();
  const firstDowMon = (m: number, y: number) => (new Date(y, m, 1).getDay() + 6) % 7;

  const calCells: (number | null)[] = [
    ...Array(firstDowMon(viewMonth, viewYear)).fill(null),
    ...Array.from({ length: daysInMonth(viewMonth, viewYear) }, (_, i) => i + 1),
  ];
  while (calCells.length % 7 !== 0) calCells.push(null);

  const isFuture = (d: number) => new Date(viewYear, viewMonth, d, 23, 59, 59) > now;
  const isSelected = (d: number) => d === selDay && viewMonth === selMonth && viewYear === selYear;
  const isToday = (d: number) =>
    d === now.getDate() && viewMonth === now.getMonth() && viewYear === now.getFullYear();

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-3">
        <button
          type="button"
          onClick={onPrevMonth}
          aria-label="Previous month"
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>
        <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
          {MONTHS[viewMonth]} {viewYear}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={!canNextMonth}
          aria-label="Next month"
          aria-disabled={!canNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" aria-hidden="true" />
        </button>
      </div>

      {/* Day headers Mon–Sun */}
      <div className="grid grid-cols-7 mb-1">
        {DOW.map((d, i) => (
          <div key={i} className="text-center text-[11px] font-semibold text-slate-400 py-0.5">{d}</div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {calCells.map((day, idx) => {
          if (!day) return <div key={idx} />;
          const future = isFuture(day);
          const sel = isSelected(day);
          const tod = isToday(day);
          return (
            <button
              key={idx}
              type="button"
              disabled={future}
              aria-disabled={future || undefined}
              aria-pressed={sel}
              aria-label={`${day} ${MONTHS[viewMonth]} ${viewYear}${future ? ', unavailable' : ''}${sel ? ', selected' : ''}`}
              onClick={() => onSelectDay(day)}
              className={`w-8 h-8 mx-auto flex items-center justify-center text-sm rounded-full font-medium transition-colors
                ${sel ? 'bg-neuro-500 text-white font-bold' : ''}
                ${!sel && tod ? 'ring-2 ring-neuro-400 text-neuro-600 font-bold' : ''}
                ${!sel && !tod && !future ? 'text-slate-700 hover:bg-neuro-50 hover:text-neuro-700' : ''}
                ${future ? 'text-slate-300 cursor-not-allowed' : ''}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   Sleep Onset — compact time row
   Used for both bedtime and wake-up pickers
───────────────────────────────────────────── */
interface SleepTimeRowProps {
  label: string;
  icon: React.ReactNode;
  dayOffset: number;
  onDayOffset: (n: number) => void;
  maxDayOffset: number;
  hourIdx: number;
  onHourIdx: (n: number) => void;
  minuteIdx: number;
  onMinuteIdx: (n: number) => void;
  periodIdx: number;
  onPeriodIdx: (n: number) => void;
  /** True when the user typed a 24-hour value via the manual input. */
  isMilitary: boolean;
  /** Manual-input parsed-time handler — keeps drums + AM/PM in sync with typed text. */
  onParsedTime: (p: ParsedTime) => void;
  accentClass: string;
}

const SleepTimeRow: React.FC<SleepTimeRowProps> = ({
  label, icon, dayOffset, onDayOffset, maxDayOffset,
  hourIdx, onHourIdx, minuteIdx, onMinuteIdx, periodIdx, onPeriodIdx,
  isMilitary, onParsedTime,
  accentClass,
}) => {
  const dayLabels = ['Today', 'Yesterday', '2 days ago'];

  const hourItems  = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteItems = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  // AM/PM scroll column replaced with the horizontal AmPmToggle for parity
  // with the specific-time picker. (V feedback 2026-05-20: Sleep Onset body
  // "looks so AI" — three stacked scroll columns × 2 pickers was the main
  // tell. Replacing the period column tightens the visual.)
  // 2026-05-22: added ManualTimeInput above the drums so clinicians can
  // free-text bedtime / wake time (parity with the Specific Time tab).
  // Also bumped itemH 44→48 to clear iOS Safari's effective 44pt tap
  // target when stacked drums are inside a scrollable modal body.

  return (
    <div className="py-3 px-4">
      {/* Label row */}
      <div className={`flex items-center gap-2 mb-2.5 ${accentClass}`}>
        {icon}
        <span className="text-sm font-semibold tracking-tight">{label}</span>
      </div>

      {/* Day toggle pills */}
      <div className="flex gap-1.5 mb-3 flex-wrap">
        {dayLabels.slice(0, maxDayOffset + 1).map((d, i) => (
          <button
            key={i}
            type="button"
            aria-pressed={dayOffset === i}
            onClick={() => onDayOffset(i)}
            className={`min-h-[44px] px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              dayOffset === i
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Manual time entry (parity with Specific Time tab) — placed above
          the drums so a clinician who knows the time can type it without
          fighting iOS scroll momentum. */}
      <div className="mb-3 -mx-4">
        <ManualTimeInput
          hourIdx={hourIdx}
          minuteIdx={minuteIdx}
          periodIdx={periodIdx}
          isMilitary={isMilitary}
          onParsed={onParsedTime}
        />
      </div>

      {/* Drum rollers + AM/PM toggle */}
      <div className="flex items-center justify-center gap-3">
        <ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={onHourIdx} itemH={48} colW={56} ariaLabel={`${label} hour`} />
        <span className="text-2xl font-light text-slate-300 -mt-1">:</span>
        <ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={onMinuteIdx} itemH={48} colW={56} ariaLabel={`${label} minute`} />
        <AmPmToggle
          periodIdx={periodIdx}
          onSelect={onPeriodIdx}
          hidden={isMilitary}
          size="sm"
          ariaLabel={`${label} AM or PM`}
        />
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   AM/PM toggle — replaces the AM/PM scroll column
   per V feedback 2026-05-20 ("AM/PM should be a
   toggle rather than scroll"). Two-button group.
───────────────────────────────────────────── */
interface AmPmToggleProps {
  periodIdx: number;                 // 0 = AM, 1 = PM
  onSelect: (idx: number) => void;
  /** Hidden when manual entry is in unambiguous 24-hour format. */
  hidden?: boolean;
  /** Visual size — 'lg' for mobile (matches drum height), 'sm' for desktop column. */
  size?: 'sm' | 'lg';
  ariaLabel?: string;
}

const AmPmToggle: React.FC<AmPmToggleProps> = ({
  periodIdx, onSelect, hidden = false, size = 'lg', ariaLabel = 'AM or PM',
}) => {
  if (hidden) {
    // Render a same-width placeholder so the drum layout doesn't reflow.
    return (
      <div
        aria-hidden="true"
        style={{ width: size === 'lg' ? 72 : 56 }}
        className="flex-shrink-0"
      />
    );
  }
  const btnH = size === 'lg' ? 44 : 36;
  return (
    <div
      className="flex flex-col gap-1.5 flex-shrink-0"
      role="radiogroup"
      aria-label={ariaLabel}
      style={{ width: size === 'lg' ? 72 : 56 }}
    >
      {(['AM', 'PM'] as const).map((label, i) => {
        const active = i === periodIdx;
        return (
          <button
            key={label}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(i)}
            className={`w-full rounded-xl text-sm font-bold tabular-nums transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
              active
                ? 'bg-neuro-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
            style={{ height: btnH }}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Manual time-entry input
   Accepts: "11:25 PM", "1:25 am", "1125", "23:25", "2325", "1325".
   - HH:MM with AM/PM suffix → 12-hour interpretation, AM/PM forced.
   - HH:MM with HH ≥ 13 → military, AM/PM hidden.
   - 4 digits "HHMM" interpreted same way.
   Returns parsed { hourIdx, minuteIdx5, periodIdx, isMilitary } or null.
───────────────────────────────────────────── */
interface ParsedTime {
  hourIdx: number;       // 0–11 (matches drum)
  minuteIdx5: number;    // 0–11 (5-minute snap, matches drum)
  periodIdx: number;     // 0 = AM, 1 = PM
  isMilitary: boolean;   // typed value > 12 → suppress AM/PM toggle
}

function parseManualTime(raw: string): ParsedTime | null {
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
  const minuteIdx5 = Math.round(mm / 5) % 12;
  return { hourIdx, minuteIdx5, periodIdx, isMilitary };
}

interface ManualTimeInputProps {
  hourIdx: number;
  minuteIdx: number;
  periodIdx: number;
  isMilitary: boolean;
  onParsed: (p: ParsedTime) => void;
}

const ManualTimeInput: React.FC<ManualTimeInputProps> = ({
  hourIdx, minuteIdx, periodIdx, isMilitary, onParsed,
}) => {
  // Mirror the wheels into the input as a starting value.
  const display = (() => {
    if (isMilitary) {
      const h24 = periodIdx === 1
        ? (hourIdx + 1 === 12 ? 12 : hourIdx + 13)
        : (hourIdx + 1 === 12 ? 0 : hourIdx + 1);
      return `${String(h24).padStart(2, '0')}:${String(minuteIdx * 5).padStart(2, '0')}`;
    }
    const h12 = hourIdx + 1;
    return `${String(h12).padStart(2, '0')}:${String(minuteIdx * 5).padStart(2, '0')} ${periodIdx === 1 ? 'PM' : 'AM'}`;
  })();
  // V feedback 2026-05-20: keep the input blank on mount so clinicians can
  // free-text from the get-go without having to delete the prefilled value.
  // Only mirror the wheels once they actually change (preset click, scroll,
  // etc.) — that lets the input show the wheel state if the user pivots
  // away from typing.
  const [value, setValue] = useState('');
  const [touched, setTouched] = useState(false);
  const initialDisplay = useRef(display);
  useEffect(() => {
    // First render: display === initialDisplay.current, skip — keep blank.
    if (display === initialDisplay.current) return;
    if (!touched) setValue(display);
  }, [display, touched]);
  const parsed = parseManualTime(value);
  const valid = parsed !== null;
  return (
    <div className="px-4 pt-3 pb-1">
      <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1.5">
        Type time
      </label>
      <input
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={value}
        onChange={(e) => {
          setTouched(true);
          setValue(e.target.value);
          const p = parseManualTime(e.target.value);
          if (p) onParsed(p);
        }}
        onBlur={() => {
          if (parsed) setValue(parsed.isMilitary
            ? `${String(parsed.periodIdx === 1 && parsed.hourIdx + 1 !== 12 ? parsed.hourIdx + 13 : (parsed.hourIdx + 1 === 12 ? (parsed.periodIdx === 1 ? 12 : 0) : parsed.hourIdx + 1)).padStart(2, '0')}:${String(parsed.minuteIdx5 * 5).padStart(2, '0')}`
            : `${String(parsed.hourIdx + 1).padStart(2, '0')}:${String(parsed.minuteIdx5 * 5).padStart(2, '0')} ${parsed.periodIdx === 1 ? 'PM' : 'AM'}`,
          );
        }}
        placeholder="11:25 PM  or  23:25"
        aria-label="Type Last Known Well time. Accepts 12-hour with AM or PM, or 24-hour military format."
        aria-invalid={!valid && touched}
        className={`w-full px-3 py-2 rounded-lg border text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
          !valid && touched ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      />
      {!valid && touched && (
        <p className="mt-1 text-[11px] text-red-600">
          Try a format like &quot;11:25 PM&quot; or &quot;23:25&quot;.
        </p>
      )}
    </div>
  );
};

/* ─────────────────────────────────────────────
   Main LKW Time Picker
───────────────────────────────────────────── */
export const LKWTimePicker: React.FC<LKWTimePickerProps> = ({
  isOpen, onClose, onConfirm, onUnknown, initialDate,
  showSleepOnset = false,
  defaultMode = 'specific',
  onSleepOnset,
}) => {
  const nowRef = useRef(new Date());

  const getInitVals = (d: Date) => {
    const h24 = d.getHours();
    const h12 = h24 % 12 || 12;
    const nearestMin5 = Math.round(d.getMinutes() / 5) % 12;
    return {
      month: d.getMonth(),
      year: d.getFullYear(),
      day: d.getDate(),
      hourIdx: h12 - 1,
      minuteIdx: nearestMin5,
      periodIdx: h24 >= 12 ? 1 : 0,
    };
  };

  const init = initialDate || nowRef.current;
  const iv = getInitVals(init);

  /* ── Specific time state ── */
  const [viewMonth, setViewMonth] = useState(iv.month);
  const [viewYear, setViewYear] = useState(iv.year);
  const [selDay, setSelDay] = useState(iv.day);
  const [selMonth, setSelMonth] = useState(iv.month);
  const [selYear, setSelYear] = useState(iv.year);
  const [hourIdx, setHourIdx] = useState(iv.hourIdx);
  const [minuteIdx, setMinuteIdx] = useState(iv.minuteIdx);
  const [periodIdx, setPeriodIdx] = useState(iv.periodIdx);
  // Tracks whether the user entered a 24-hour value via the manual input
  // (e.g. "23:25"). Hides the AM/PM toggle in that case. Wheels never
  // produce military mode — they're always 12-hour with AM/PM.
  const [isMilitary, setIsMilitary] = useState(false);
  // Manual-input handler — keeps wheels and AM/PM toggle in sync with typed value.
  const handleParsedTime = (p: ParsedTime) => {
    setHourIdx(p.hourIdx);
    setMinuteIdx(p.minuteIdx5);
    if (p.periodIdx !== -1) setPeriodIdx(p.periodIdx);
    setIsMilitary(p.isMilitary);
  };
  // Wheel changes always cancel military mode (wheels are 12-hour).
  const setHourIdxFromWheel = (i: number) => { setHourIdx(i); setIsMilitary(false); };
  const setMinuteIdxFromWheel = (i: number) => { setMinuteIdx(i); setIsMilitary(false); };
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [dateExpanded, setDateExpanded] = useState(false);

  /* ── Mode state ── */
  const [mode, setMode] = useState<'specific' | 'sleep'>(defaultMode);

  /* ── a11y: focus trap + dialog ARIA ── */
  // Closes BLOCKER A-1 from audit-stroke-code-a11y-2026-05-17.md (WCAG
  // 2.4.3 + 4.1.2). The drum columns themselves are made keyboard-
  // navigable in the ScrollCol fix above; this hook adds the modal-level
  // focus management (focus-on-open, return-on-close, Escape, Tab cycle).
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef);

  /* ── Sleep onset state ── */
  // Bedtime: defaults to yesterday 11 PM
  const [bdDayOffset, setBdDayOffset] = useState(1);
  const [bdHourIdx, setBdHourIdx] = useState(10);   // index 10 = 11 (1-indexed)
  const [bdMinIdx, setBdMinIdx] = useState(0);
  const [bdPeriodIdx, setBdPeriodIdx] = useState(1); // PM
  const [bdIsMilitary, setBdIsMilitary] = useState(false);
  // Wake-up: defaults to today, 1h before now (rounded to nearest 5min)
  const getDefaultWakeIdx = () => {
    const n = nowRef.current;
    const h24 = Math.max(0, n.getHours() - 1);
    const h12 = h24 % 12 || 12;
    return {
      hourIdx: h12 - 1,
      minuteIdx: Math.round(n.getMinutes() / 5) % 12,
      periodIdx: h24 >= 12 ? 1 : 0,
    };
  };
  const wakeDefaults = getDefaultWakeIdx();
  const [wkDayOffset, setWkDayOffset] = useState(0);
  const [wkHourIdx, setWkHourIdx] = useState(wakeDefaults.hourIdx);
  const [wkMinIdx, setWkMinIdx] = useState(wakeDefaults.minuteIdx);
  const [wkPeriodIdx, setWkPeriodIdx] = useState(wakeDefaults.periodIdx);
  const [wkIsMilitary, setWkIsMilitary] = useState(false);

  // Parsed-time handlers for the Sleep Onset ManualTimeInputs. Mirror the
  // Specific Time tab's handleParsedTime — keep drums + AM/PM in sync with
  // the typed value.
  const handleBedtimeParsed = (p: ParsedTime) => {
    setBdHourIdx(p.hourIdx);
    setBdMinIdx(p.minuteIdx5);
    if (p.periodIdx !== -1) setBdPeriodIdx(p.periodIdx);
    setBdIsMilitary(p.isMilitary);
  };
  const handleWakeParsed = (p: ParsedTime) => {
    setWkHourIdx(p.hourIdx);
    setWkMinIdx(p.minuteIdx5);
    if (p.periodIdx !== -1) setWkPeriodIdx(p.periodIdx);
    setWkIsMilitary(p.isMilitary);
  };
  // Wheel changes always cancel military mode (wheels are 12-hour) —
  // mirrors the Specific Time tab. Without this, typing "23:25" then
  // nudging the hour drum leaves the AM/PM toggle hidden while the
  // drum shows a 12-hour value, which is incoherent.
  const setBdHourFromWheel = (i: number) => { setBdHourIdx(i); setBdIsMilitary(false); };
  const setBdMinFromWheel = (i: number) => { setBdMinIdx(i); setBdIsMilitary(false); };
  const setWkHourFromWheel = (i: number) => { setWkHourIdx(i); setWkIsMilitary(false); };
  const setWkMinFromWheel = (i: number) => { setWkMinIdx(i); setWkIsMilitary(false); };
  const [sleepError, setSleepError] = useState<string | null>(null);
  // Future-time guard for specific-time confirm; mirrors sleepError shape.
  const [specificError, setSpecificError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    nowRef.current = new Date();
    const d = initialDate || nowRef.current;
    const v = getInitVals(d);
    setViewMonth(v.month); setViewYear(v.year);
    setSelDay(v.day); setSelMonth(v.month); setSelYear(v.year);
    setHourIdx(v.hourIdx); setMinuteIdx(v.minuteIdx); setPeriodIdx(v.periodIdx);
    setActivePreset(null); setDateExpanded(false);
    setSpecificError(null); setSleepError(null);
    // Reset mode to defaultMode on open
    setMode(defaultMode);
    // Reset sleep onset state
    setBdDayOffset(1); setBdHourIdx(10); setBdMinIdx(0); setBdPeriodIdx(1);
    setBdIsMilitary(false);
    const wd = getDefaultWakeIdx();
    setWkDayOffset(0); setWkHourIdx(wd.hourIdx); setWkMinIdx(wd.minuteIdx); setWkPeriodIdx(wd.periodIdx);
    setWkIsMilitary(false);
    setSleepError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Future-time enforcement moved to handleConfirm (line ~745) per V
  // feedback 2026-05-20: the previous live scroll-snap clamp here was
  // auto-correcting the wheels back to "now" whenever a user scrolled
  // past the picker-open minute, which made the drums feel unusable
  // ("keeps auto snapping to the same time"). Future days are already
  // disabled in the calendar grid (`isFuture` in CalendarGrid). The
  // confirm-time guard shows an inline error if the composed time is in
  // the future — that's the right enforcement point because it doesn't
  // fight the user during data entry, only at submit.

  if (!isOpen) return null;

  const now = nowRef.current;

  const hourItems = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteItems = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  // periodItems removed — AM/PM now rendered via <AmPmToggle> (V feedback
  // 2026-05-20). Sleep Onset's SleepTimeRow still uses the scroll-column
  // AM/PM internally; that secondary view is unchanged in this commit.

  // 9 presets covering the tPA-window decision zone (0-4.5 h) with denser
  // coverage. Previous list jumped from "Now" to "3 h ago" — left a clinician
  // with a 1-h LKW manually scrolling all three drums. 2026-05-19 V approved.
  const PRESETS = [
    { label: 'Just now', hours: 0 },
    { label: '30 min ago', hours: 0.5 },
    { label: '1 hour ago', hours: 1 },
    { label: '2 hours ago', hours: 2 },
    { label: '3 hours ago', hours: 3 },
    { label: '4 hours ago', hours: 4 },
    { label: '6 hours ago', hours: 6 },
    { label: '12 hours ago', hours: 12 },
    { label: '24 hours ago', hours: 24 },
  ];

  const applyPreset = (label: string, hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 3_600_000);
    const v = getInitVals(d);
    setViewMonth(v.month); setViewYear(v.year);
    setSelDay(v.day); setSelMonth(v.month); setSelYear(v.year);
    setHourIdx(v.hourIdx); setMinuteIdx(v.minuteIdx); setPeriodIdx(v.periodIdx);
    setActivePreset(label); setDateExpanded(false);
  };

  const canNextMonth =
    viewYear < now.getFullYear() ||
    (viewYear === now.getFullYear() && viewMonth < now.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (!canNextMonth) return;
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleSelectDay = (day: number) => {
    setSelDay(day); setSelMonth(viewMonth); setSelYear(viewYear);
    setActivePreset(null); setDateExpanded(false);
  };

  const handleConfirm = () => {
    const d = new Date(selYear, selMonth, selDay);
    let h24 = hourIdx + 1;
    if (periodIdx === 1 && h24 !== 12) h24 += 12;
    if (periodIdx === 0 && h24 === 12) h24 = 0;
    d.setHours(h24, minuteIdx * 5, 0, 0);
    // Future-time guard: a flipped AM/PM scroll can produce a date in the
    // future, which would propagate a negative treatment-window calculation
    // upstream. Surface inline error and abort the confirm. Uses a fresh
    // `new Date()` (not the open-time `nowRef.current`) so a clinician who
    // leaves the picker open for several minutes can still set a time that
    // was briefly "future" at open but is now legitimately past.
    if (d > new Date()) {
      setSpecificError('LKW cannot be in the future. Check AM/PM.');
      return;
    }
    setSpecificError(null);
    onConfirm(d); onClose();
  };

  /** Build a Date from day-offset + drum values. dayOffset=0 → today, 1 → yesterday … */
  const buildDate = (dayOffset: number, hIdx: number, mIdx: number, pIdx: number): Date => {
    const base = new Date(now);
    base.setDate(base.getDate() - dayOffset);
    let h24 = hIdx + 1;
    if (pIdx === 1 && h24 !== 12) h24 += 12;
    if (pIdx === 0 && h24 === 12) h24 = 0;
    base.setHours(h24, mIdx * 5, 0, 0);
    return base;
  };

  const handleSleepConfirm = () => {
    setSleepError(null);
    const bedtime  = buildDate(bdDayOffset, bdHourIdx, bdMinIdx, bdPeriodIdx);
    const wakeTime = buildDate(wkDayOffset, wkHourIdx, wkMinIdx, wkPeriodIdx);
    if (wakeTime <= bedtime) {
      setSleepError('Wake-up time must be after bedtime — check day or time settings.');
      return;
    }
    if (wakeTime > now) {
      setSleepError('Wake-up time cannot be in the future.');
      return;
    }
    onSleepOnset?.(bedtime, wakeTime);
    onClose();
  };

  const selDateObj = new Date(selYear, selMonth, selDay);
  const dateLabelShort = selDateObj.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
  });

  const calendarProps: CalendarGridProps = {
    viewMonth, viewYear, selDay, selMonth, selYear, now,
    onSelectDay: handleSelectDay,
    onPrevMonth: prevMonth,
    onNextMonth: nextMonth,
    canNextMonth,
  };

  /* ── Mode toggle (only shown when showSleepOnset=true) ──
     Wired as a proper tablist for screen readers — each button declares
     role=tab and aria-selected; the visible content panels below should
     declare role=tabpanel + matching aria-labelledby ids. Also removed
     banned shadow-sm utility from the active state. */
  const modeToggle = showSleepOnset ? (
    <div
      role="tablist"
      aria-label="Time entry method"
      className="flex gap-1 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex-shrink-0"
    >
      <button
        type="button"
        role="tab"
        id="lkw-tab-specific"
        aria-selected={mode === 'specific'}
        aria-controls="lkw-panel-specific"
        onClick={() => setMode('specific')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors ${
          mode === 'specific'
            ? 'bg-neuro-500 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Clock size={14} aria-hidden /> Specific Time
      </button>
      <button
        type="button"
        role="tab"
        id="lkw-tab-sleep"
        aria-selected={mode === 'sleep'}
        aria-controls="lkw-panel-sleep"
        onClick={() => setMode('sleep')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors ${
          mode === 'sleep'
            ? 'bg-amber-500 text-white'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        <Moon size={14} aria-hidden /> Sleep Onset
      </button>
    </div>
  ) : null;

  /* ── Sleep Onset body ── */
  const sleepBody = (
    <div className="flex-1 overflow-y-auto min-h-0">
      {/* Method note — terse, no bold-callout. Clinicians who use the
          WAKE-UP / THAWS pathway already know the framework; this line
          is a quick refresher, not a tutorial. */}
      <div className="px-4 pt-3 pb-2">
        <p className="text-[11px] text-amber-700 leading-snug">
          WAKE-UP / THAWS · Treatment window runs 4.5 h from awakening.
        </p>
      </div>

      {/* Bedtime picker */}
      <SleepTimeRow
        label="Last asleep without symptoms"
        icon={<Moon size={14} className="text-slate-500" />}
        dayOffset={bdDayOffset}
        onDayOffset={setBdDayOffset}
        maxDayOffset={2}
        hourIdx={bdHourIdx}
        onHourIdx={setBdHourFromWheel}
        minuteIdx={bdMinIdx}
        onMinuteIdx={setBdMinFromWheel}
        periodIdx={bdPeriodIdx}
        onPeriodIdx={setBdPeriodIdx}
        isMilitary={bdIsMilitary}
        onParsedTime={handleBedtimeParsed}
        accentClass="text-slate-700"
      />

      {/* Hairline divider */}
      <div className="border-t border-slate-100 mx-4" />

      {/* Wake-up picker */}
      <SleepTimeRow
        label="Woke with symptoms"
        icon={<AlarmClock size={14} className="text-amber-600" />}
        dayOffset={wkDayOffset}
        onDayOffset={setWkDayOffset}
        maxDayOffset={1}
        hourIdx={wkHourIdx}
        onHourIdx={setWkHourFromWheel}
        minuteIdx={wkMinIdx}
        onMinuteIdx={setWkMinFromWheel}
        periodIdx={wkPeriodIdx}
        onPeriodIdx={setWkPeriodIdx}
        isMilitary={wkIsMilitary}
        onParsedTime={handleWakeParsed}
        accentClass="text-amber-700"
      />
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-t-xl sm:rounded-xl shadow-lg w-full sm:max-w-3xl flex flex-col overflow-hidden max-h-[92dvh] sm:max-h-[600px]"
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lkw-picker-title"
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
              <Clock size={14} className="text-white" aria-hidden="true" />
            </div>
            <span id="lkw-picker-title" className="text-sm font-bold text-slate-900 truncate">Last Known Well</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Mode toggle */}
        {modeToggle}

        {mode === 'sleep' ? (
          /* ══ SLEEP ONSET LAYOUT ══ */
          <div
            id="lkw-panel-sleep"
            role={showSleepOnset ? 'tabpanel' : undefined}
            aria-labelledby={showSleepOnset ? 'lkw-tab-sleep' : undefined}
            className="contents"
          >
            {sleepBody}
            {/* Validation error — pinned above the footer (outside the
                scrolling body) so the iOS soft keyboard for the manual
                time inputs doesn't push it off-screen. role=alert +
                aria-live=assertive for screen-reader announcement. */}
            <p
              role="alert"
              aria-live="assertive"
              className={`mx-4 mb-2 text-xs text-red-600 rounded-lg px-3 py-2 flex-shrink-0 ${sleepError ? 'bg-red-50 border border-red-200' : ''}`}
            >
              {sleepError ?? ''}
            </p>
            <div className="border-t border-slate-100 px-4 py-3 flex items-center justify-between flex-shrink-0 gap-3">
              <button
                type="button"
                onClick={() => { onUnknown(); onClose(); }}
                className="text-sm text-slate-500 hover:text-slate-700 underline transition-colors"
              >
                Unable to determine
              </button>
              <button
                type="button"
                onClick={handleSleepConfirm}
                className="px-6 py-2 rounded-lg text-sm font-semibold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
              >
                Set Sleep Onset
              </button>
            </div>
          </div>
        ) : (
          /* ══ SPECIFIC TIME LAYOUT ══ */
          <div
            id="lkw-panel-specific"
            role={showSleepOnset ? 'tabpanel' : undefined}
            aria-labelledby={showSleepOnset ? 'lkw-tab-specific' : undefined}
            className="contents"
          >
            {/* ══════════════════════════════════════
                MOBILE LAYOUT  (hidden sm+)
            ══════════════════════════════════════ */}
            <div className="flex sm:hidden flex-col flex-1 overflow-y-auto min-h-0">

              {/* Presets — horizontal scroll row */}
              <div
                className="flex gap-2 px-4 py-3 overflow-x-auto flex-shrink-0 border-b border-slate-100"
                style={{ scrollbarWidth: 'none' }}
              >
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.label, p.hours)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-colors whitespace-nowrap
                      ${activePreset === p.label
                        ? 'bg-neuro-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 active:bg-slate-200'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => { onUnknown(); onClose(); }}
                  className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 border border-amber-200 whitespace-nowrap"
                >
                  Unknown
                </button>
              </div>

              {/* Manual time entry — accepts 12h ("11:25 PM") or 24h ("23:25") */}
              <ManualTimeInput
                hourIdx={hourIdx}
                minuteIdx={minuteIdx}
                periodIdx={periodIdx}
                isMilitary={isMilitary}
                onParsed={handleParsedTime}
              />

              {/* Time drums — large, centered */}
              <div className="flex-1 flex items-center justify-center px-6 py-4">
                <div className="flex items-center gap-4">
                  <ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={setHourIdxFromWheel} itemH={60} colW={72} ariaLabel="Hour" />
                  <span className="text-3xl font-thin text-slate-300 -mt-1">:</span>
                  <ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={setMinuteIdxFromWheel} itemH={60} colW={72} ariaLabel="Minute" />
                  <div className="w-px h-16 bg-slate-200 mx-1" />
                  <AmPmToggle
                    periodIdx={periodIdx}
                    onSelect={setPeriodIdx}
                    hidden={isMilitary}
                    size="lg"
                  />
                </div>
              </div>

              {/* Date row — tap to expand calendar */}
              <div className="border-t border-slate-100 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setDateExpanded(x => !x)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Date</span>
                    <span className="text-sm font-semibold text-slate-700">{dateLabelShort}</span>
                  </div>
                  {dateExpanded
                    ? <ChevronUp className="w-4 h-4 text-slate-400" />
                    : <ChevronDown className="w-4 h-4 text-slate-400" />
                  }
                </button>
                {dateExpanded && (
                  <div className="px-4 pb-4 overflow-y-auto">
                    <CalendarGrid {...calendarProps} />
                  </div>
                )}
              </div>
            </div>

            {/* ══════════════════════════════════════
                DESKTOP LAYOUT  (hidden <sm)
            ══════════════════════════════════════ */}
            <div className="hidden sm:flex flex-1 overflow-hidden min-h-0">

              {/* Left: Presets */}
              <div className="w-[155px] flex-shrink-0 border-r border-slate-100 flex flex-col p-4 gap-2 overflow-y-auto">
                {PRESETS.map(p => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => applyPreset(p.label, p.hours)}
                    className={`w-full text-left px-4 py-2.5 rounded-full text-sm font-medium leading-snug transition-colors
                      ${activePreset === p.label
                        ? 'bg-neuro-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {p.label}
                  </button>
                ))}
                <div className="flex-1 min-h-[8px]" />
                <button
                  type="button"
                  onClick={() => { onUnknown(); onClose(); }}
                  className="w-full text-left px-4 py-2.5 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors border border-amber-200"
                >
                  Unable to determine
                </button>
              </div>

              {/* Center: Calendar */}
              <div className="flex-1 flex flex-col overflow-y-auto min-w-0 p-4">
                <CalendarGrid {...calendarProps} />
              </div>

              {/* Right: Manual entry + time drums */}
              <div className="w-[240px] flex-shrink-0 border-l border-slate-100 flex flex-col px-3 py-4">
                <ManualTimeInput
                  hourIdx={hourIdx}
                  minuteIdx={minuteIdx}
                  periodIdx={periodIdx}
                  isMilitary={isMilitary}
                  onParsed={handleParsedTime}
                />
                <div className="flex-1 flex items-center justify-center mt-2">
                  <div className="flex items-center gap-2">
                    <ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={setHourIdxFromWheel} ariaLabel="Hour" />
                    <span className="text-2xl font-light text-slate-300">:</span>
                    <ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={setMinuteIdxFromWheel} ariaLabel="Minute" />
                    <AmPmToggle
                      periodIdx={periodIdx}
                      onSelect={setPeriodIdx}
                      hidden={isMilitary}
                      size="sm"
                    />
                  </div>
                </div>
              </div>

            </div>

            {/* Specific-time future-time error (mirrors sleepError shape).
                Always in the DOM with role=alert + aria-live so screen
                readers announce the validation message. */}
            <p
              role="alert"
              aria-live="assertive"
              className={`mx-4 mb-2 text-xs text-red-600 rounded-lg px-3 py-2 ${specificError ? 'bg-red-50 border border-red-200' : ''}`}
            >
              {specificError ?? ''}
            </p>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 px-4 py-3 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="min-h-[44px] px-8 py-2 rounded-full text-sm font-medium bg-neuro-500 hover:bg-neuro-600 text-white transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              >
                Set LKW Time
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
