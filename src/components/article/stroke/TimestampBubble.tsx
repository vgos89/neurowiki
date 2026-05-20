import React, { useState, useEffect, useRef } from 'react';
import { Clock, X, CheckCircle, AlertTriangle, AlertCircle, Pencil } from 'lucide-react';

/**
 * parseTimeDigits — extracts hours and minutes from a digits-only (or
 * digits + colon) input. Does NOT resolve AM/PM — the caller pairs the
 * parsed digits with an AM/PM toggle state to produce a final 24-hour
 * time. HH ≥ 13 is flagged as military so the toggle can hide.
 *
 * Accepts: "11:25", "1125", "23:25", "2325", "1:25", "0", "00:00".
 * Rejects: empty strings, malformed digits, hh > 23, mm > 59.
 *
 * Refactored 2026-05-20 per V feedback: timestamp edit row now uses an
 * AM/PM toggle (matching the LKW picker pattern) instead of accepting
 * a free-text "PM" suffix inside the input. User types digits only.
 */
export function parseTimeDigits(raw: string): { hh: number; mm: number; isMilitary: boolean } | null {
  const body = raw.trim().replace(/\s+/g, '').replace(/[^0-9:]/g, '');
  if (!body) return null;
  let hh = 0;
  let mm = 0;
  if (body.includes(':')) {
    const [h, m] = body.split(':');
    if (!/^\d{1,2}$/.test(h) || !/^\d{1,2}$/.test(m)) return null;
    hh = Number(h); mm = Number(m);
  } else if (/^\d{3,4}$/.test(body)) {
    hh = Number(body.slice(0, body.length - 2));
    mm = Number(body.slice(-2));
  } else if (/^\d{1,2}$/.test(body)) {
    hh = Number(body); mm = 0;
  } else {
    return null;
  }
  if (mm < 0 || mm > 59 || hh < 0 || hh > 23) return null;
  return { hh, mm, isMilitary: hh >= 13 };
}

export const STROKE_TIMESTAMP_EVENTS = [
  'Code Activation',
  'Neurology Evaluation',
  'CT Read Time',
  'Neuro IR Contacted',
  'NCC/ICU Sign-out',
] as const;
export type StrokeTimestampEvent = typeof STROKE_TIMESTAMP_EVENTS[number];
/** Internal alias preserved so existing references in this file stay compact. */
const EVENTS = STROKE_TIMESTAMP_EVENTS;
type EventName = StrokeTimestampEvent;

export type StrokeTimestamps = Record<StrokeTimestampEvent, Date | null>;

export const EMPTY_STROKE_TIMESTAMPS: StrokeTimestamps = {
  'Code Activation': null,
  'Neurology Evaluation': null,
  'CT Read Time': null,
  'Neuro IR Contacted': null,
  'NCC/ICU Sign-out': null,
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function getElapsed(from: Date, to: Date): string {
  const diffMs = to.getTime() - from.getTime();
  const totalMinutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) return `+${hours}h ${minutes}m`;
  return `+${minutes}m`;
}

interface TimestampBubbleProps {
  onTpaReversal?: () => void;
  onOrolingualEdema?: () => void;
  /** Called whenever a timestamp is recorded — parent wires this to GWTGMilestones (BUG-02 fix) */
  onStamp?: (event: EventName, date: Date) => void;
  /** When set, stamps CT Read Time externally (e.g. from CodeModeStep2 "Stamp CT Read" button) */
  ctReadExternalTime?: Date | null;
  /** Controlled-mode value. When provided, the component uses this instead of
   *  its own internal state. Pair with `onChange` to receive every mutation.
   *  Added 2026-05-19 so NIHSS standalone can hold the same stamp state and
   *  round-trip it through Save Case / copy / share without rebuilding the UI. */
  value?: StrokeTimestamps;
  /** Required when `value` is provided. */
  onChange?: (next: StrokeTimestamps) => void;
  /** When true, the first click/keydown ANYWHERE in the document auto-stamps
   *  "Neurology Evaluation" if it isn't already stamped. Used by NIHSS and
   *  the stroke pathway per V direction 2026-05-20: the moment a clinician
   *  starts interacting with the calculator or pathway IS the neurology-
   *  evaluation time. One-shot — listener detaches after first fire. */
  autoStampNeuroEvalOnFirstInteraction?: boolean;
}

// Shared left-pointing thought bubble — arrow uses SVG, no inline styles (MED-03 fix)
const ThoughtBubble: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute right-[calc(100%+0.625rem)] top-1/2 -translate-y-1/2 pointer-events-none z-10">
    <div className="relative bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-lg whitespace-nowrap">
      {children}
      {/* SVG right-pointing arrow toward FAB — replaces inline CSS border triangle */}
      <svg
        className="absolute top-1/2 -translate-y-1/2 -right-[7px]"
        width="7" height="12"
        viewBox="0 0 7 12"
        aria-hidden
      >
        <polygon points="0,0 7,6 0,12" className="fill-slate-200" />
        <polygon points="0,1 6,6 0,11" className="fill-white" />
      </svg>
    </div>
  </div>
);

export const TimestampBubble: React.FC<TimestampBubbleProps> = ({
  onTpaReversal,
  onOrolingualEdema,
  onStamp,
  ctReadExternalTime,
  value,
  onChange,
  autoStampNeuroEvalOnFirstInteraction = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showClockThought, setShowClockThought] = useState(true);
  const [showEmergencyThought, setShowEmergencyThought] = useState(true);
  const [showPulse, setShowPulse] = useState(false);
  const [hasBeenOpened, setHasBeenOpened] = useState(false);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [internalTimestamps, setInternalTimestamps] = useState<StrokeTimestamps>({ ...EMPTY_STROKE_TIMESTAMPS });
  // Per-row inline edit state — when set, that row shows a manual time input.
  const [editingEvent, setEditingEvent] = useState<EventName | null>(null);
  const [editValue, setEditValue] = useState<string>('');       // digits only
  const [editPeriod, setEditPeriod] = useState<0 | 1>(0);       // 0 = AM, 1 = PM
  const [editError, setEditError] = useState<boolean>(false);
  // One-shot guard for the auto-stamp listener — survives across renders
  // without re-firing.
  const hasAutoStampedRef = useRef<boolean>(false);
  // Controlled mode: caller owns the state. Uncontrolled mode: we own it.
  const isControlled = value !== undefined && onChange !== undefined;
  const timestamps = isControlled ? value : internalTimestamps;
  const setTimestamps = React.useCallback(
    (updater: StrokeTimestamps | ((prev: StrokeTimestamps) => StrokeTimestamps)) => {
      if (isControlled) {
        const next = typeof updater === 'function' ? updater(value!) : updater;
        onChange!(next);
      } else {
        setInternalTimestamps(updater as React.SetStateAction<StrokeTimestamps>);
      }
    },
    [isControlled, value, onChange]
  );

  // Auto-hide both thought bubbles after 5s
  useEffect(() => {
    const t = setTimeout(() => setShowClockThought(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowEmergencyThought(false), 5000);
    return () => clearTimeout(t);
  }, []);

  // Pulse-ring attention loop (V feedback 2026-05-20: "needs to flash more
  // obviously to grab the eye, and keep flashing until they click on it").
  // Start the pulse at 3 s instead of 10 s, keep it on continuously until
  // either the user opens the FAB or records any stamp via another path.
  // The actual visual is escalated below (larger amber ring on top of the
  // existing neuro ring).
  useEffect(() => {
    const t = setTimeout(() => setShowPulse(true), 3000);
    return () => clearTimeout(t);
  }, []);

  // BUG-02 fix: react to external CT Read stamp from CodeModeStep2 via prop (no DOM events)
  useEffect(() => {
    if (!ctReadExternalTime) return;
    setShowPulse(false);
    setTimestamps(prev => {
      if (prev['CT Read Time']) return prev;
      const updated = { ...prev, 'CT Read Time': ctReadExternalTime };
      onStamp?.('CT Read Time', ctReadExternalTime);
      return updated;
    });
  }, [ctReadExternalTime]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleOpen = () => {
    setShowClockThought(false);
    setShowPulse(false);
    setHasBeenOpened(true);
    setIsExpanded(prev => !prev);
  };

  const handleStamp = (event: EventName) => {
    if (timestamps[event]) return;
    setShowPulse(false);
    const now = new Date();
    setTimestamps(prev => ({ ...prev, [event]: now }));
    onStamp?.(event, now);
  };

  const handleClear = (event: EventName, e: React.MouseEvent) => {
    e.stopPropagation();
    setTimestamps(prev => ({ ...prev, [event]: null }));
  };

  // One-shot listener: auto-stamps Neurology Evaluation on first user click
  // or keydown anywhere in the document. Detaches after firing or after the
  // event is already stamped via other means.
  useEffect(() => {
    if (!autoStampNeuroEvalOnFirstInteraction) return;
    if (hasAutoStampedRef.current) return;
    if (timestamps['Neurology Evaluation']) {
      hasAutoStampedRef.current = true;
      return;
    }
    const handler = () => {
      if (hasAutoStampedRef.current) return;
      hasAutoStampedRef.current = true;
      const now = new Date();
      setTimestamps(prev => {
        if (prev['Neurology Evaluation']) return prev;
        const updated = { ...prev, 'Neurology Evaluation': now };
        onStamp?.('Neurology Evaluation', now);
        return updated;
      });
    };
    document.addEventListener('click', handler, { once: true, capture: true });
    document.addEventListener('keydown', handler, { once: true, capture: true });
    return () => {
      document.removeEventListener('click', handler, { capture: true } as EventListenerOptions);
      document.removeEventListener('keydown', handler, { capture: true } as EventListenerOptions);
    };
  }, [autoStampNeuroEvalOnFirstInteraction, timestamps, setTimestamps, onStamp]);

  // ── Inline edit handlers — digits-only input + AM/PM toggle.
  // Per V feedback 2026-05-20 (follow-up): match the LKW picker
  // pattern. User types digits only; AM/PM is a toggle. If the typed
  // value is military (HH ≥ 13), the toggle hides and the time is
  // interpreted as 24-hour.
  const handleEditOpen = (event: EventName, e: React.MouseEvent) => {
    e.stopPropagation();
    const current = timestamps[event];
    setEditingEvent(event);
    // Pre-fill digits in 12-hour HH:MM form. AM/PM goes into the toggle
    // so the user can adjust either independently.
    if (current) {
      const h12 = current.getHours() % 12 || 12;
      setEditValue(`${String(h12).padStart(2, '0')}:${String(current.getMinutes()).padStart(2, '0')}`);
      setEditPeriod(current.getHours() >= 12 ? 1 : 0);
    } else {
      setEditValue('');
      setEditPeriod(new Date().getHours() >= 12 ? 1 : 0);
    }
    setEditError(false);
  };
  const handleEditCancel = () => {
    setEditingEvent(null);
    setEditValue('');
    setEditError(false);
  };
  const handleEditSave = (event: EventName) => {
    const parsed = parseTimeDigits(editValue);
    if (!parsed) {
      setEditError(true);
      return;
    }
    const { hh, mm, isMilitary } = parsed;
    let h24: number;
    if (isMilitary) {
      h24 = hh;
    } else {
      // 12-hour interpretation. Combine with the toggle.
      if (hh < 1 || hh > 12) {
        setEditError(true);
        return;
      }
      if (editPeriod === 1) h24 = hh === 12 ? 12 : hh + 12;
      else h24 = hh === 12 ? 0 : hh;
    }
    const base = timestamps[event] ?? new Date();
    const next = new Date(base);
    next.setHours(h24, mm, 0, 0);
    setTimestamps(prev => ({ ...prev, [event]: next }));
    onStamp?.(event, next);
    setEditingEvent(null);
    setEditValue('');
    setEditError(false);
  };

  const anchorTime = timestamps['Code Activation'];
  const stampedCount = Object.values(timestamps).filter(Boolean).length;
  // Per V 2026-05-20: keep flashing until the user explicitly OPENS the FAB,
  // not just until any stamp lands (auto-stamps from elsewhere shouldn't
  // silence the prompt — the clinician still needs to see the tracker).
  const needsAttention = showPulse && !hasBeenOpened && !isExpanded;

  const hasEmergency = onTpaReversal || onOrolingualEdema;

  return (
    <>
      {/* ── Emergency FAB — bottom LEFT ── */}
      {hasEmergency && (
        <div className="fixed bottom-24 md:bottom-20 left-4 z-[60]">
          <div className="relative flex flex-col items-start gap-2">
            {/* Emergency thought bubble */}
            {showEmergencyThought && !emergencyOpen && (
              <ThoughtBubble>
                <p className="text-xs font-semibold text-red-600 leading-snug">
                  Emergency protocols
                </p>
                <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
                  tPA reversal · orolingual edema
                </p>
              </ThoughtBubble>
            )}

            {/* Submenus — expand upward */}
            {emergencyOpen && (
              <div className="flex flex-col items-start gap-2">
                {onTpaReversal && (
                  <button
                    type="button"
                    onClick={() => { onTpaReversal(); setEmergencyOpen(false); }}
                    className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors animate-in slide-in-from-bottom-2 duration-200"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" aria-hidden />
                    tPA/TNK Reversal
                  </button>
                )}
                {onOrolingualEdema && (
                  <button
                    type="button"
                    onClick={() => { onOrolingualEdema(); setEmergencyOpen(false); }}
                    className="flex items-center gap-2.5 pl-3 pr-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold rounded-xl shadow-lg transition-colors animate-in slide-in-from-bottom-2 duration-150"
                  >
                    <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden />
                    Orolingual Edema
                  </button>
                )}
              </div>
            )}

            {/* Emergency button */}
            <button
              type="button"
              onClick={() => { setEmergencyOpen(prev => !prev); setShowEmergencyThought(false); }}
              className={`w-10 h-10 rounded-full shadow-lg transition-all border flex items-center justify-center ${
 emergencyOpen
 ? 'bg-slate-800 text-white border-slate-700 hover:bg-slate-700'
 : 'bg-red-600 text-white border-red-700 hover:bg-red-700'
 }`}
              aria-label={emergencyOpen ? 'Close emergency protocols menu' : 'Open emergency protocols'}
              aria-expanded={emergencyOpen}
            >
              {emergencyOpen
                ? <X className="w-5 h-5" aria-hidden />
                : <AlertTriangle className="w-5 h-5" aria-hidden />
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Clock FAB — bottom RIGHT ── */}
      <div className="fixed bottom-36 md:bottom-20 right-4 z-[60]">
        <div className="relative">
        {/* Clock thought bubble */}
        {showClockThought && !isExpanded && (
          <ThoughtBubble>
            <p className="text-xs font-semibold text-slate-700 leading-snug text-center">
              Record Stroke Time Stamps
            </p>
          </ThoughtBubble>
        )}

        {/* Expanded timestamps panel — anchored above clock button */}
        {isExpanded && (
          <div className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-neuro-500" />
                <span className="text-sm font-semibold text-slate-800">Stroke Timestamps</span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Tap to record time of each event</p>
            </div>

            {/* Timestamp Rows */}
            <div className="divide-y divide-slate-100">
              {EVENTS.map((event) => {
                const stamped = timestamps[event];
                const isFirst = event === 'Code Activation';
                const elapsed = stamped && anchorTime && !isFirst
                  ? getElapsed(anchorTime, stamped)
                  : null;

                const isEditing = editingEvent === event;
                return (
                  <div key={event} className="px-4 py-3">
                    {isEditing ? (() => {
                      const parsedDigits = parseTimeDigits(editValue);
                      const isMilitaryInput = parsedDigits?.isMilitary ?? false;
                      return (
                        <div>
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1.5">
                            {event}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <input
                              type="text"
                              inputMode="numeric"
                              autoComplete="off"
                              autoFocus
                              value={editValue}
                              onChange={(e) => { setEditValue(e.target.value); setEditError(false); }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleEditSave(event);
                                if (e.key === 'Escape') handleEditCancel();
                              }}
                              placeholder="11:25"
                              aria-label={`Edit ${event} time. Type 12-hour digits and use the AM PM toggle, or type 24-hour military.`}
                              aria-invalid={editError}
                              className={`flex-1 min-w-[88px] px-2.5 py-1.5 rounded-md border text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                                editError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
                              }`}
                            />
                            {/* AM/PM toggle — hidden when input parses as military (HH ≥ 13).
                                Same rule as the LKW picker. */}
                            {!isMilitaryInput && (
                              <div role="radiogroup" aria-label="AM or PM" className="inline-flex rounded-md overflow-hidden border border-slate-200">
                                {(['AM', 'PM'] as const).map((label, i) => {
                                  const active = i === editPeriod;
                                  return (
                                    <button
                                      key={label}
                                      type="button"
                                      role="radio"
                                      aria-checked={active}
                                      onClick={() => setEditPeriod(i as 0 | 1)}
                                      className={`px-2.5 py-1.5 text-xs font-bold tabular-nums transition-colors ${
                                        active
                                          ? 'bg-neuro-500 text-white'
                                          : 'bg-white text-slate-500 hover:bg-slate-50'
                                      }`}
                                    >
                                      {label}
                                    </button>
                                  );
                                })}
                              </div>
                            )}
                            <button
                              onClick={() => handleEditSave(event)}
                              className="px-3 py-1.5 text-xs font-semibold bg-neuro-500 hover:bg-neuro-600 text-white rounded-lg transition-colors whitespace-nowrap"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleEditCancel}
                              className="text-xs text-slate-500 hover:text-slate-700 transition-colors px-2 py-1.5 rounded"
                            >
                              Cancel
                            </button>
                          </div>
                          {editError && (
                            <p className="mt-1 text-[11px] text-red-600">
                              Enter HH:MM (12-hour) with the AM/PM toggle, or HH:MM 24-hour military.
                            </p>
                          )}
                        </div>
                      );
                    })() : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-0.5">
                            {event}
                          </div>
                          {stamped ? (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                              <span className="text-sm font-semibold text-slate-800 tabular-nums">
                                {formatTime(stamped)}
                              </span>
                              {elapsed && (
                                <span className="text-xs text-neuro-500 font-medium">{elapsed}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Not yet recorded</span>
                          )}
                        </div>

                        {stamped ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleEditOpen(event, e)}
                              className="p-1.5 text-slate-400 hover:text-neuro-600 hover:bg-slate-100 transition-colors rounded"
                              aria-label={`Edit ${event} time`}
                              title="Edit time"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleClear(event, e)}
                              className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1 rounded"
                              title="Clear timestamp"
                            >
                              Clear
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleEditOpen(event, e)}
                              className="p-1.5 text-slate-400 hover:text-neuro-600 hover:bg-slate-100 transition-colors rounded"
                              aria-label={`Type ${event} time`}
                              title="Type time"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleStamp(event)}
                              className="px-3 py-1.5 text-xs font-semibold bg-neuro-500 hover:bg-neuro-600 text-white rounded-lg transition-colors whitespace-nowrap"
                            >
                              Stamp
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            {stampedCount > 0 && (
              <div className="px-4 py-2 bg-slate-50 border-t border-slate-200">
                <button
                  onClick={() => setTimestamps({ 'Code Activation': null, 'Neurology Evaluation': null, 'CT Read Time': null, 'Neuro IR Contacted': null, 'NCC/ICU Sign-out': null })}
                  className="text-xs text-slate-400 hover:text-red-400 transition-colors"
                >
                  Clear all timestamps
                </button>
              </div>
            )}
          </div>
        )}

        {/* Attention halo — extra amber outer ring that pulses behind the
            FAB until the user opens the timestamp tracker. Sits outside the
            button so the button's hit area and animation are not disrupted.
            (V feedback 2026-05-20: flash more obviously, keep flashing until
            clicked.) */}
        {needsAttention && (
          <span
            aria-hidden="true"
            className="absolute inset-0 -m-2 rounded-full bg-amber-400/70 animate-ping pointer-events-none"
          />
        )}
        {/* Clock button */}
        <button
          onClick={handleOpen}
          aria-label="Open timestamp tracker"
          className={`relative w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
            isExpanded
              ? 'bg-slate-700 scale-90'
              : `bg-neuro-600 hover:bg-neuro-700 ${showClockThought ? 'bubble-wobble' : ''} ${needsAttention ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-white animate-pulse shadow-amber-400/50' : ''}`
          }`}
        >
          {isExpanded ? (
            <X className="w-5 h-5 text-white" />
          ) : (
            <div className="relative">
              <Clock className="w-5 h-5 text-white" />
              {stampedCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center leading-none">
                  {stampedCount}
                </span>
              )}
            </div>
          )}
        </button>
        </div>
      </div>
    </>
  );
};
