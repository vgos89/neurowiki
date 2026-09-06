import React, { useState, useRef, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { parseTimeDigits } from '../article/stroke/TimestampBubble';

/**
 * The NIHSS evaluation time, shown and editable directly above the scoring items.
 *
 * WHY THIS IS ITS OWN VISIBLE FIELD
 * ---------------------------------
 * This timestamp feeds hospital quality metrics, so it has to be both correct
 * and correctable. It used to be captured invisibly, and captured at the wrong
 * moment: a document-wide first-interaction listener stamped it the instant the
 * clinician touched anything, including typing the patient's blood pressure.
 * The real workflow is that EMS hands over, the clinician enters patient details
 * while listening, and only starts scoring minutes later. The old behaviour
 * recorded the handover, not the exam.
 *
 * It now fills in when scoring actually begins, and the clinician can see and
 * change it. "Not set" is shown honestly rather than pre-filling a guess.
 *
 * Reuses parseTimeDigits from TimestampBubble so 12-hour entry with the AM/PM
 * toggle and 24-hour military entry behave identically to every other time field
 * in the app.
 */
interface NihssEvalTimeRowProps {
  value: Date | null;
  onChange: (next: Date) => void;
}

const fmt = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

export const NihssEvalTimeRow: React.FC<NihssEvalTimeRowProps> = ({ value, onChange }) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [period, setPeriod] = useState<0 | 1>(0);
  const [error, setError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const parsed = parseTimeDigits(draft);
  const isMilitary = parsed?.isMilitary ?? false;

  const openEditor = () => {
    setDraft(value ? `${value.getHours() % 12 || 12}:${String(value.getMinutes()).padStart(2, '0')}` : '');
    setPeriod(value && value.getHours() >= 12 ? 1 : 0);
    setError(false);
    setEditing(true);
  };

  const commit = () => {
    const p = parseTimeDigits(draft);
    if (!p) { setError(true); return; }
    let hh = p.hh;
    if (!p.isMilitary) {
      hh = hh % 12;
      if (period === 1) hh += 12;
    }
    // Anchor to today, matching every other time field on this surface.
    const next = new Date();
    next.setHours(hh, p.mm, 0, 0);
    onChange(next);
    setEditing(false);
  };

  const setNow = () => {
    onChange(new Date());
    setEditing(false);
  };

  return (
    <div className="bg-white border border-slate-100 rounded-xl px-4 py-2.5 mb-3">
      <div className="min-h-[44px] flex items-center justify-between gap-3 flex-wrap">
        <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5 flex-shrink-0">
          <Clock className="w-3.5 h-3.5 text-slate-400" aria-hidden />
          NIHSS evaluation time
        </span>

        {!editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openEditor}
              className={`text-sm tabular-nums px-2 py-1 rounded-md transition-colors hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                value ? 'text-slate-900 font-medium' : 'text-slate-400 italic'
              }`}
              aria-label={value ? `NIHSS evaluation time ${fmt(value)}. Tap to edit.` : 'NIHSS evaluation time not set. Tap to set.'}
            >
              {value ? fmt(value) : 'Not set'}
            </button>
            <button
              type="button"
              onClick={setNow}
              className="px-2.5 py-1 text-xs font-semibold text-neuro-700 bg-neuro-50 hover:bg-neuro-100 border border-neuro-200 rounded-lg transition-colors"
            >
              Now
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 flex-wrap">
            <input
              ref={inputRef}
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={draft}
              onChange={(e) => { setDraft(e.target.value); setError(false); }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') commit();
                if (e.key === 'Escape') setEditing(false);
              }}
              placeholder="11:25"
              aria-label="Edit NIHSS evaluation time. Type 12-hour digits and use the AM PM toggle, or type 24-hour military."
              aria-invalid={error}
              className={`w-[84px] px-2 py-1.5 rounded-md border text-sm tabular-nums focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                error ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-white'
              }`}
            />
            {!isMilitary && (
              <div role="radiogroup" aria-label="AM or PM" className="inline-flex rounded-md overflow-hidden border border-slate-200">
                {(['AM', 'PM'] as const).map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    role="radio"
                    aria-checked={i === period}
                    onClick={() => setPeriod(i as 0 | 1)}
                    className={`px-2 py-1.5 text-xs font-bold transition-colors ${
                      i === period ? 'bg-neuro-500 text-white' : 'bg-white text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
            <button type="button" onClick={setNow} className="px-2.5 py-1.5 text-xs font-semibold text-neuro-700 bg-neuro-50 hover:bg-neuro-100 border border-neuro-200 rounded-lg transition-colors">Now</button>
            <button type="button" onClick={commit} className="px-2.5 py-1.5 text-xs font-semibold bg-neuro-500 hover:bg-neuro-600 text-white rounded-lg transition-colors">Save</button>
            <button type="button" onClick={() => setEditing(false)} className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 transition-colors">Cancel</button>
          </div>
        )}
      </div>
      {!value && !editing && (
        <p className="text-[11px] text-slate-400 mt-0.5">
          Set automatically when you start scoring. Edit any time.
        </p>
      )}
    </div>
  );
};
