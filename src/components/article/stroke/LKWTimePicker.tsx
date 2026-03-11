import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, Moon, AlarmClock } from 'lucide-react';

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
}

const ScrollCol: React.FC<ScrollColProps> = ({
  items, selectedIdx, onSelect,
  itemH = 48, colW = 56,
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
    <div className="relative select-none flex-shrink-0" style={{ width: colW }}>
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
        className="relative overflow-y-scroll"
        style={{
          height: itemH * 3,
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch',
        } as React.CSSProperties}
        onScroll={handleScroll}
      >
        <div style={{ height: itemH }} />
        {items.map((item, i) => (
          <div
            key={i}
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
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="text-sm font-bold text-slate-800 flex items-center gap-1">
          {MONTHS[viewMonth]} {viewYear}
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </span>
        <button
          type="button"
          onClick={onNextMonth}
          disabled={!canNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-4 h-4 text-slate-500" />
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
  accentClass: string;
}

const SleepTimeRow: React.FC<SleepTimeRowProps> = ({
  label, icon, dayOffset, onDayOffset, maxDayOffset,
  hourIdx, onHourIdx, minuteIdx, onMinuteIdx, periodIdx, onPeriodIdx,
  accentClass,
}) => {
  const dayLabels = ['Today', 'Yesterday', '2 days ago'];

  const hourItems  = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteItems = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  const periodItems = ['AM', 'PM'];

  return (
    <div className="py-4 px-4">
      {/* Label row */}
      <div className={`flex items-center gap-2 mb-3 ${accentClass}`}>
        {icon}
        <span className="text-sm font-bold">{label}</span>
      </div>

      {/* Day toggle pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {dayLabels.slice(0, maxDayOffset + 1).map((d, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onDayOffset(i)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
              dayOffset === i
                ? 'bg-amber-500 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Drum rollers */}
      <div className="flex items-center justify-center gap-3">
        <ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={onHourIdx} itemH={44} colW={56} />
        <span className="text-2xl font-light text-slate-300 -mt-1">:</span>
        <ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={onMinuteIdx} itemH={44} colW={56} />
        <div className="w-px h-12 bg-slate-150 mx-1" />
        <ScrollCol items={periodItems} selectedIdx={periodIdx} onSelect={onPeriodIdx} itemH={44} colW={56} />
      </div>
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
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [dateExpanded, setDateExpanded] = useState(false);

  /* ── Mode state ── */
  const [mode, setMode] = useState<'specific' | 'sleep'>(defaultMode);

  /* ── Sleep onset state ── */
  // Bedtime: defaults to yesterday 11 PM
  const [bdDayOffset, setBdDayOffset] = useState(1);
  const [bdHourIdx, setBdHourIdx] = useState(10);   // index 10 = 11 (1-indexed)
  const [bdMinIdx, setBdMinIdx] = useState(0);
  const [bdPeriodIdx, setBdPeriodIdx] = useState(1); // PM
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
  const [sleepError, setSleepError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    nowRef.current = new Date();
    const d = initialDate || nowRef.current;
    const v = getInitVals(d);
    setViewMonth(v.month); setViewYear(v.year);
    setSelDay(v.day); setSelMonth(v.month); setSelYear(v.year);
    setHourIdx(v.hourIdx); setMinuteIdx(v.minuteIdx); setPeriodIdx(v.periodIdx);
    setActivePreset(null); setDateExpanded(false);
    // Reset mode to defaultMode on open
    setMode(defaultMode);
    // Reset sleep onset state
    setBdDayOffset(1); setBdHourIdx(10); setBdMinIdx(0); setBdPeriodIdx(1);
    const wd = getDefaultWakeIdx();
    setWkDayOffset(0); setWkHourIdx(wd.hourIdx); setWkMinIdx(wd.minuteIdx); setWkPeriodIdx(wd.periodIdx);
    setSleepError(null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!isOpen) return null;

  const now = nowRef.current;

  const hourItems = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteItems = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));
  const periodItems = ['AM', 'PM'];

  const PRESETS = [
    { label: 'Now', hours: 0 },
    { label: '3 hours ago', hours: 3 },
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

  /* ── Mode toggle (only shown when showSleepOnset=true) ── */
  const modeToggle = showSleepOnset ? (
    <div className="flex gap-1 px-4 py-2.5 border-b border-slate-100 bg-slate-50 flex-shrink-0">
      <button
        type="button"
        onClick={() => setMode('specific')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors ${
          mode === 'specific'
            ? 'bg-neuro-500 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        ⏰ Specific Time
      </button>
      <button
        type="button"
        onClick={() => setMode('sleep')}
        className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full text-xs font-semibold transition-colors ${
          mode === 'sleep'
            ? 'bg-amber-500 text-white shadow-sm'
            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
        }`}
      >
        🌙 Sleep Onset
      </button>
    </div>
  ) : null;

  /* ── Sleep Onset body ── */
  const sleepBody = (
    <div className="flex-1 overflow-y-auto min-h-0">
      {/* Clinical note */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 leading-relaxed">
          <strong>WAKE-UP / THAWS method:</strong> LKW = last time asleep without symptoms (bedtime). Treatment window = 4.5h from awakening.
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 mt-3" />

      {/* Bedtime picker */}
      <SleepTimeRow
        label="Went to sleep (Last Known Well)"
        icon={<Moon size={14} className="text-slate-500" />}
        dayOffset={bdDayOffset}
        onDayOffset={setBdDayOffset}
        maxDayOffset={2}
        hourIdx={bdHourIdx}
        onHourIdx={setBdHourIdx}
        minuteIdx={bdMinIdx}
        onMinuteIdx={setBdMinIdx}
        periodIdx={bdPeriodIdx}
        onPeriodIdx={setBdPeriodIdx}
        accentClass="text-slate-700"
      />

      {/* Divider */}
      <div className="border-t border-slate-100 mx-4" />

      {/* Wake-up picker */}
      <SleepTimeRow
        label="Woke with symptoms (Recognition time)"
        icon={<AlarmClock size={14} className="text-amber-600" />}
        dayOffset={wkDayOffset}
        onDayOffset={setWkDayOffset}
        maxDayOffset={1}
        hourIdx={wkHourIdx}
        onHourIdx={setWkHourIdx}
        minuteIdx={wkMinIdx}
        onMinuteIdx={setWkMinIdx}
        periodIdx={wkPeriodIdx}
        onPeriodIdx={setWkPeriodIdx}
        accentClass="text-amber-700"
      />

      {/* Error */}
      {sleepError && (
        <p className="mx-4 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {sleepError}
        </p>
      )}
    </div>
  );

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[600px]"
        onClick={e => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
              <span className="text-white text-sm leading-none">🕐</span>
            </div>
            <span className="text-sm font-bold text-slate-900 truncate">Last Known Well</span>
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
          <>
            {sleepBody}
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
          </>
        ) : (
          /* ══ SPECIFIC TIME LAYOUT ══ */
          <>
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

              {/* Time drums — large, centered */}
              <div className="flex-1 flex items-center justify-center px-6 py-4">
                <div className="flex items-center gap-4">
                  <ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={setHourIdx} itemH={60} colW={72} />
                  <span className="text-3xl font-thin text-slate-300 -mt-1">:</span>
                  <ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={setMinuteIdx} itemH={60} colW={72} />
                  <div className="w-px h-16 bg-slate-150 mx-1" />
                  <ScrollCol items={periodItems} selectedIdx={periodIdx} onSelect={setPeriodIdx} itemH={60} colW={72} />
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

              {/* Right: Time drums */}
              <div className="w-[210px] flex-shrink-0 border-l border-slate-100 flex items-center justify-center px-3 py-6">
                <div className="flex items-center gap-2">
                  <ScrollCol items={hourItems} selectedIdx={hourIdx} onSelect={setHourIdx} />
                  <span className="text-2xl font-light text-slate-300">:</span>
                  <ScrollCol items={minuteItems} selectedIdx={minuteIdx} onSelect={setMinuteIdx} />
                  <ScrollCol items={periodItems} selectedIdx={periodIdx} onSelect={setPeriodIdx} />
                </div>
              </div>

            </div>

            {/* ── Footer ── */}
            <div className="border-t border-slate-100 px-4 py-3 flex justify-end flex-shrink-0">
              <button
                type="button"
                onClick={handleConfirm}
                className="px-8 py-2 rounded-lg text-base font-semibold text-slate-500 hover:text-neuro-600 transition-colors"
              >
                OK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
