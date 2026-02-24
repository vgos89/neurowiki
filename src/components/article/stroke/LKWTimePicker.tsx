import React, { useState, useRef, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';

export interface LKWTimePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (date: Date) => void;
  onUnknown: () => void;
  initialDate?: Date;
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
   Main LKW Time Picker
───────────────────────────────────────────── */
export const LKWTimePicker: React.FC<LKWTimePickerProps> = ({
  isOpen, onClose, onConfirm, onUnknown, initialDate,
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

  useEffect(() => {
    if (!isOpen) return;
    nowRef.current = new Date();
    const d = initialDate || nowRef.current;
    const v = getInitVals(d);
    setViewMonth(v.month); setViewYear(v.year);
    setSelDay(v.day); setSelMonth(v.month); setSelYear(v.year);
    setHourIdx(v.hourIdx); setMinuteIdx(v.minuteIdx); setPeriodIdx(v.periodIdx);
    setActivePreset(null); setDateExpanded(false);
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

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-3xl flex flex-col overflow-hidden max-h-[92vh] sm:max-h-[580px]"
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
      </div>
    </div>
  );
};
