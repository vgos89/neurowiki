import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatClinicalDateShort } from '../../utils/clinicalDateTime';

/**
 * PatientContextPanel — optional collapsible accordion that captures
 * patient-context data alongside the calculator (LKW, BP, glucose,
 * anticoagulant use). Currently used by the NIHSS calculator; designed
 * to be reusable for any calculator that benefits from this context
 * surfacing in its EMR copy/share output.
 *
 * Design: settings-panel style with hairline-divided rows. Each row is
 * label-left + input-right, 44px min tap target, no nested card boxes —
 * keeps the panel visually skinny even when expanded.
 *
 * Spec references:
 *   - design-tokens skill: rounded-xl container, slate-50/100 hairlines,
 *     canonical eyebrow scale, neuro-* for selected states
 *   - CALCULATOR_SPEC.md §2.4: ≥44×44 touch targets
 */

export type Anticoag = 'doac' | 'warfarin' | 'antiplatelet';

export interface PatientContextValues {
  /** Last known well — undefined if not set, null if explicitly Unknown / wake-up. */
  lkw: Date | null | undefined;
  /** Systolic BP — string so the input is fully controlled and can be cleared. */
  systolic: string;
  diastolic: string;
  glucose: string;
  /** Multi-select of anticoagulant classes. */
  anticoag: Set<Anticoag>;
}

export const EMPTY_PATIENT_CONTEXT: PatientContextValues = {
  lkw: undefined,
  systolic: '',
  diastolic: '',
  glucose: '',
  anticoag: new Set(),
};

interface PatientContextPanelProps {
  values: PatientContextValues;
  onChange: (next: PatientContextValues) => void;
}

const ANTICOAG_LABELS: Record<Anticoag, string> = {
  doac: 'DOAC',
  warfarin: 'Warfarin',
  antiplatelet: 'Antiplatelet',
};

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({ values, onChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [lkwPickerOpen, setLkwPickerOpen] = useState(false);

  const hasAnyValue =
    values.lkw !== undefined ||
    values.systolic !== '' ||
    values.diastolic !== '' ||
    values.glucose !== '' ||
    values.anticoag.size > 0;

  // Header eyebrow shows summary chips if any value is set + collapsed
  const summaryChips = !expanded && hasAnyValue ? buildSummaryChips(values) : null;

  const toggleAnticoag = (key: Anticoag) => {
    const next = new Set(values.anticoag);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    onChange({ ...values, anticoag: next });
  };

  const lkwDisplay =
    values.lkw === undefined
      ? 'Add'
      : values.lkw === null
      ? 'Unknown / wake-up'
      : formatClinicalDateShort(values.lkw);

  return (
    <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
      {/* Header row — always visible, tap toggles expansion */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
        aria-expanded={expanded}
        aria-controls="patient-context-body"
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {expanded ? 'Patient context' : '+ Patient context (optional)'}
          </span>
          {!expanded && (
            <span className="text-xs text-slate-500 mt-0.5 truncate">
              {summaryChips ?? 'tap to add LKW · BP · glucose · anticoag'}
            </span>
          )}
        </div>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {/* Expanded body */}
      {expanded && (
        <div id="patient-context-body" className="divide-y divide-slate-50">
          {/* LKW row */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3">
            <label className="text-xs font-medium text-slate-600 flex-shrink-0">Last known well</label>
            <button
              type="button"
              onClick={() => setLkwPickerOpen((v) => !v)}
              className="flex items-center gap-1 text-sm text-slate-900 hover:bg-slate-50 px-2 py-1 -my-1 rounded transition-colors"
              aria-expanded={lkwPickerOpen}
            >
              <span className={values.lkw === undefined ? 'text-slate-400' : ''}>{lkwDisplay}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${lkwPickerOpen ? 'rotate-180' : ''}`} aria-hidden />
            </button>
          </div>

          {/* LKW picker — inline expansion */}
          {lkwPickerOpen && (
            <div className="px-4 py-3 bg-slate-50/50 space-y-2">
              <LkwInlinePicker
                value={values.lkw}
                onChange={(next) => {
                  onChange({ ...values, lkw: next });
                  setLkwPickerOpen(false);
                }}
              />
            </div>
          )}

          {/* BP row */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3">
            <label className="text-xs font-medium text-slate-600 flex-shrink-0">Blood pressure</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                value={values.systolic}
                onChange={(e) => onChange({ ...values, systolic: sanitizeNumeric(e.target.value, 3) })}
                placeholder="Sys"
                className="w-[60px] text-right text-sm text-slate-900 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none px-1 py-1 placeholder:text-slate-300"
                aria-label="Systolic blood pressure"
              />
              <span className="text-slate-400 text-sm">/</span>
              <input
                type="text"
                inputMode="numeric"
                value={values.diastolic}
                onChange={(e) => onChange({ ...values, diastolic: sanitizeNumeric(e.target.value, 3) })}
                placeholder="Dia"
                className="w-[60px] text-right text-sm text-slate-900 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none px-1 py-1 placeholder:text-slate-300"
                aria-label="Diastolic blood pressure"
              />
            </div>
          </div>

          {/* Glucose row */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3">
            <label className="text-xs font-medium text-slate-600 flex-shrink-0">Glucose</label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                inputMode="numeric"
                value={values.glucose}
                onChange={(e) => onChange({ ...values, glucose: sanitizeNumeric(e.target.value, 4) })}
                placeholder="—"
                className="w-[60px] text-right text-sm text-slate-900 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none px-1 py-1 placeholder:text-slate-300"
                aria-label="Glucose"
              />
              <span className="text-xs text-slate-400 ml-0.5">mg/dL</span>
            </div>
          </div>

          {/* Blood thinner row */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
            <label className="text-xs font-medium text-slate-600 flex-shrink-0">Blood thinner</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['doac', 'warfarin', 'antiplatelet'] as const).map((key) => {
                const selected = values.anticoag.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAnticoag(key)}
                    className={`min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors ${
                      selected
                        ? 'bg-neuro-50 border-neuro-200 text-neuro-700'
                        : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                    aria-pressed={selected}
                  >
                    {ANTICOAG_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Disclaimer footer */}
          <div className="px-4 py-2 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 italic">Reference only — verify against patient chart.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Inline LKW picker — compact variant of LKWTimePicker stripped of sleep-onset
// mode complexity. Three quick presets + custom date/time + Unknown.
// ──────────────────────────────────────────────────────────────────────────────

interface LkwInlinePickerProps {
  value: Date | null | undefined;
  onChange: (next: Date | null) => void;
}

const LkwInlinePicker: React.FC<LkwInlinePickerProps> = ({ value, onChange }) => {
  const now = new Date();

  // Custom date/time fields — initialize from current value or now
  const initial = value instanceof Date ? value : now;
  const [dateInput, setDateInput] = useState(toDateInputValue(initial));
  const [timeInput, setTimeInput] = useState(toTimeInputValue(initial));

  const applyCustom = () => {
    if (!dateInput || !timeInput) return;
    const [y, m, d] = dateInput.split('-').map(Number);
    const [h, min] = timeInput.split(':').map(Number);
    const next = new Date(y, m - 1, d, h, min, 0, 0);
    onChange(next);
  };

  const applyMinutesAgo = (mins: number) => {
    const next = new Date(Date.now() - mins * 60_000);
    onChange(next);
  };

  return (
    <>
      {/* Quick presets */}
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'Just now', mins: 0 },
          { label: '30 min ago', mins: 30 },
          { label: '1 hr ago', mins: 60 },
          { label: '2 hr ago', mins: 120 },
          { label: '4 hr ago', mins: 240 },
        ].map((opt) => (
          <button
            key={opt.label}
            type="button"
            onClick={() => applyMinutesAgo(opt.mins)}
            className="min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border bg-white border-slate-200 text-slate-600 hover:border-slate-300 transition-colors"
          >
            {opt.label}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onChange(null)}
          className={`min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors ${
            value === null
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
          }`}
        >
          Unknown / wake-up
        </button>
      </div>

      {/* Custom date + time */}
      <div className="flex items-center gap-2 pt-2 mt-1 border-t border-slate-100">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex-shrink-0">
          Custom
        </span>
        <input
          type="date"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
          className="text-xs text-slate-900 bg-white border border-slate-200 rounded px-2 py-1.5 focus:border-neuro-500 focus:outline-none"
          aria-label="Custom date"
        />
        <input
          type="time"
          value={timeInput}
          onChange={(e) => setTimeInput(e.target.value)}
          className="text-xs text-slate-900 bg-white border border-slate-200 rounded px-2 py-1.5 focus:border-neuro-500 focus:outline-none"
          aria-label="Custom time"
        />
        <button
          type="button"
          onClick={applyCustom}
          className="min-h-[36px] py-1.5 px-3 text-xs font-semibold rounded-full bg-neuro-500 hover:bg-neuro-600 text-white transition-colors"
        >
          Set
        </button>
      </div>
    </>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function sanitizeNumeric(input: string, maxDigits: number): string {
  const digits = input.replace(/[^0-9]/g, '');
  return digits.slice(0, maxDigits);
}

function toDateInputValue(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeInputValue(d: Date): string {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/** Build a 1-line summary chip string for the collapsed eyebrow. */
function buildSummaryChips(values: PatientContextValues): string {
  const chips: string[] = [];
  if (values.lkw === null) chips.push('LKW: unknown');
  else if (values.lkw instanceof Date) chips.push(`LKW set`);
  if (values.systolic && values.diastolic) chips.push(`BP ${values.systolic}/${values.diastolic}`);
  if (values.glucose) chips.push(`Glu ${values.glucose}`);
  if (values.anticoag.size > 0) {
    const names = Array.from(values.anticoag).map((k) => ANTICOAG_LABELS[k]).join('+');
    chips.push(names);
  }
  return chips.join(' · ');
}
