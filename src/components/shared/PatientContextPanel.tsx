import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { formatClinicalDateShort } from '../../utils/clinicalDateTime';
import { LKWTimePicker } from '../article/stroke/LKWTimePicker';

/**
 * PatientContextPanel — collapsible accordion that captures patient-context
 * data (LKW, BP, glucose, anticoagulant use). Consumed by both calculators
 * (NIHSS) and pathway pages (Stroke Code Step 1 as of 2026-05-24, with
 * ELAN / EVT / Status / Migraine to follow).
 *
 * Design: settings-panel style with hairline-divided rows. Each row is
 * label-left + input-right, 44px min tap target, no nested card boxes,
 * which keeps the panel visually skinny even when expanded.
 *
 * Extension point — `extraRows`. Pathways add their own typed rows via
 * `extraRows: PatientContextRow[]`. The panel owns the row container,
 * divider, 44px height, and label-left/input-right layout. Consumers
 * own only the input control. Do not add an anonymous `extraFields`
 * ReactNode slot here; per arch-PR-stroke-code-patient-context.md the
 * typed shape is required for visual consistency across the 4+
 * downstream pathway consumers.
 *
 * Spec references:
 *   - design-tokens skill: rounded-xl container, slate-50/100 hairlines,
 *     canonical eyebrow scale, neuro-* for selected states
 *   - CALCULATOR_SPEC.md §2.4: ≥44×44 touch targets
 *   - docs/reviews/arch-PR-stroke-code-patient-context.md (2026-05-24)
 */

export type Anticoag = 'none' | 'doac' | 'warfarin' | 'antiplatelet';

export interface PatientContextValues {
  /** Last known well — undefined if not set, null if explicitly Unknown / wake-up. */
  lkw: Date | null | undefined;
  /** Systolic BP — string so the input is fully controlled and can be cleared. */
  systolic: string;
  diastolic: string;
  glucose: string;
  /** Multi-select of anticoagulant classes. */
  anticoag: Set<Anticoag>;
  /**
   * Last administered anticoagulant dose. Surfaces conditionally when
   * `anticoag` includes 'doac' or 'warfarin'. Clinically meaningful for
   * reversal decisions (ANNEXA-I 15h-from-last-dose, half-life-of-DOAC
   * calculations) and for EMR documentation. `undefined` = not entered,
   * `null` = explicitly unknown.
   */
  lastAnticoagDose?: Date | null;
}

export const EMPTY_PATIENT_CONTEXT: PatientContextValues = {
  lkw: undefined,
  systolic: '',
  diastolic: '',
  glucose: '',
  anticoag: new Set(),
  lastAnticoagDose: undefined,
};

/**
 * A pathway-specific row inserted after the standard four. The panel owns
 * the row container, divider, 44px min-height, and label-left/input-right
 * layout. The consumer owns only the input control passed via `input`.
 */
export interface PatientContextRow {
  /** Stable React key. */
  id: string;
  /** Left-aligned label. Kept short (one-line target). */
  label: string;
  /** Right-aligned input control (any ReactNode). */
  input: React.ReactNode;
  /** Optional helper text rendered under the row in slate-400 small type. */
  helpText?: string;
}

interface PatientContextPanelProps {
  values: PatientContextValues;
  onChange: (next: PatientContextValues) => void;
  /**
   * Override the eyebrow label. When set, the panel drops the
   * "+ ... (optional)" decoration and uses this label in both
   * collapsed and expanded states. Set this when the context is
   * required (e.g. Stroke Code Step 1) rather than optional.
   */
  label?: string;
  /**
   * Initial expansion state. Defaults to false (NIHSS calculator
   * pattern: optional context that opens on tap). Set to true for
   * pathways where the context is required input, so the user sees
   * the fields without having to tap.
   */
  defaultExpanded?: boolean;
  /**
   * When true, the panel cannot be collapsed — the header is no
   * longer a toggle, it becomes a static label. Use this when the
   * context is required input that must remain visible throughout
   * (e.g. Stroke Code Step 1). Closes UX-audit finding H-4: an
   * accidental tap on the header used to collapse mid-entry.
   */
  lockExpanded?: boolean;
  /**
   * Optional pathway-specific rows rendered after the standard four
   * (LKW / BP / Glucose / Anticoag) and before the disclaimer footer.
   * Use this — not an anonymous ReactNode slot — to add new inputs
   * per pathway (e.g. ELAN anticoagulant timing, EVT LVO context).
   */
  extraRows?: PatientContextRow[];
}

const ANTICOAG_LABELS: Record<Anticoag, string> = {
  none: 'None',
  doac: 'DOAC',
  warfarin: 'Warfarin',
  antiplatelet: 'Antiplatelet',
};

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({
  values,
  onChange,
  label,
  defaultExpanded = false,
  lockExpanded = false,
  extraRows,
}) => {
  const [expanded, setExpanded] = useState(lockExpanded || defaultExpanded);
  const [lkwModalOpen, setLkwModalOpen] = useState(false);
  const [doseModalOpen, setDoseModalOpen] = useState(false);

  // Conditional row: last anticoagulant dose surfaces only for
  // reversible anticoagulants (DOAC + warfarin). Antiplatelets do not
  // have meaningful "last dose" timing for acute decisions; 'none' is
  // by definition no dose.
  const showLastDoseRow = values.anticoag.has('doac') || values.anticoag.has('warfarin');
  const lastDoseDisplay =
    values.lastAnticoagDose === undefined || values.lastAnticoagDose === null
      ? values.lastAnticoagDose === null
        ? 'Unknown'
        : 'Add'
      : formatClinicalDateShort(values.lastAnticoagDose);

  const hasAnyValue =
    values.lkw !== undefined ||
    values.systolic !== '' ||
    values.diastolic !== '' ||
    values.glucose !== '' ||
    values.lastAnticoagDose !== undefined ||
    values.anticoag.size > 0;

  // Header eyebrow shows summary chips if any value is set + collapsed
  const summaryChips = !expanded && hasAnyValue ? buildSummaryChips(values) : null;

  const toggleAnticoag = (key: Anticoag) => {
    const next = new Set(values.anticoag);
    if (next.has(key)) {
      next.delete(key);
    } else {
      // 'None' is mutually exclusive with positive selections — picking
      // None clears DOAC/Warfarin/Antiplatelet; picking any positive
      // clears None. Lets clinicians record the explicit negative
      // ("not on anything") for EMR documentation.
      if (key === 'none') {
        next.clear();
      } else {
        next.delete('none');
      }
      next.add(key);
    }
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
      {/* Header row — toggles expansion unless lockExpanded=true,
          in which case it's a static label. Locked variant is used
          by Stroke Code Step 1 where the context is required input
          and an accidental tap to collapse mid-entry would be a
          UX regression (H-4 from 2026-05-24 UX audit). */}
      <button
        type="button"
        onClick={lockExpanded ? undefined : () => setExpanded((v) => !v)}
        disabled={lockExpanded}
        className={`w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 bg-slate-50 border-b border-slate-100 text-left ${lockExpanded ? 'cursor-default' : 'hover:bg-slate-100 transition-colors cursor-pointer'}`}
        aria-expanded={lockExpanded ? undefined : expanded}
        aria-controls={lockExpanded ? undefined : 'patient-context-body'}
      >
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            {label ?? (expanded ? 'Patient context' : '+ Patient context (optional)')}
          </span>
          {!expanded && (
            <span className="text-xs text-slate-500 mt-0.5 truncate">
              {summaryChips ?? 'tap to add LKW · BP · glucose · anticoag'}
            </span>
          )}
        </div>
        {!lockExpanded && (
          <ChevronDown
            className={`w-4 h-4 text-slate-400 flex-shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden
          />
        )}
      </button>

      {/* Expanded body */}
      {expanded && (
        <div id="patient-context-body" className="divide-y divide-slate-50">
          {/* LKW row — tap opens the canonical LKWTimePicker modal (same
              component as Stroke Code Step 1 + Extended IVT pathway). */}
          <button
            type="button"
            onClick={() => setLkwModalOpen(true)}
            className="w-full min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 hover:bg-slate-50 transition-colors text-left"
            aria-haspopup="dialog"
          >
            <span className="text-xs font-medium text-slate-600 flex-shrink-0">Last known well</span>
            <span className="flex items-center gap-1">
              <span className={`text-sm ${values.lkw === undefined ? 'text-slate-400' : 'text-slate-900'}`}>{lkwDisplay}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden />
            </span>
          </button>

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

          {/* Anti-coag/Antiplatelet row */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
            <label className="text-xs font-medium text-slate-600 flex-shrink-0">Anti-coag/Antiplatelet</label>
            <div className="flex items-center gap-1.5 flex-wrap">
              {(['none', 'doac', 'warfarin', 'antiplatelet'] as const).map((key) => {
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

          {/* Last anticoagulant dose row — conditional. Surfaces only
              when the clinician has marked DOAC or warfarin on the row
              above. Clinically meaningful for reversal decisions and EMR
              documentation; antiplatelets and 'none' do not trigger it. */}
          {showLastDoseRow && (
            <button
              type="button"
              onClick={() => setDoseModalOpen(true)}
              className="w-full min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 hover:bg-slate-50 transition-colors text-left"
              aria-haspopup="dialog"
            >
              <span className="text-xs font-medium text-slate-600 flex-shrink-0">Last dose</span>
              <span className="flex items-center gap-1">
                <span className={`text-sm ${values.lastAnticoagDose === undefined ? 'text-slate-400' : 'text-slate-900'}`}>{lastDoseDisplay}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden />
              </span>
            </button>
          )}

          {/* Pathway-specific extra rows — typed slot per
              arch-PR-stroke-code-patient-context.md. Each row renders in
              the same chrome as the standard four (min-h-[44px], px-4,
              label-left + input-right, hairline divider). */}
          {extraRows?.map((row) => (
            <div key={row.id} className="px-4 py-2">
              <div className="min-h-[44px] flex items-center justify-between gap-3">
                <label className="text-xs font-medium text-slate-600 flex-shrink-0">{row.label}</label>
                <div className="flex items-center gap-1.5">{row.input}</div>
              </div>
              {row.helpText && (
                <p className="text-[10px] text-slate-400 mt-1">{row.helpText}</p>
              )}
            </div>
          ))}

          {/* Disclaimer footer */}
          <div className="px-4 py-2 bg-slate-50/50">
            <p className="text-[10px] text-slate-400 italic">Reference only. Verify against patient chart.</p>
          </div>
        </div>
      )}

      {/* LKW modal — canonical LKWTimePicker (portal). Same component used
          by Stroke Code Step 1 and Extended IVT pathway. showSleepOnset
          enabled so wake-up stroke documentation works in this context too. */}
      <LKWTimePicker
        isOpen={lkwModalOpen}
        onClose={() => setLkwModalOpen(false)}
        onConfirm={(date) => {
          onChange({ ...values, lkw: date });
          setLkwModalOpen(false);
        }}
        onUnknown={() => {
          onChange({ ...values, lkw: null });
          setLkwModalOpen(false);
        }}
        initialDate={values.lkw instanceof Date ? values.lkw : undefined}
        showSleepOnset={true}
      />

      {/* Last-dose modal — second LKWTimePicker instance reused for
          the anticoagulant last-dose timestamp. Sleep-onset tab is
          hidden because last-DOAC-dose timing is unambiguous (the
          patient or family supplies the actual time). */}
      <LKWTimePicker
        isOpen={doseModalOpen}
        onClose={() => setDoseModalOpen(false)}
        onConfirm={(date) => {
          onChange({ ...values, lastAnticoagDose: date });
          setDoseModalOpen(false);
        }}
        onUnknown={() => {
          onChange({ ...values, lastAnticoagDose: null });
          setDoseModalOpen(false);
        }}
        initialDate={values.lastAnticoagDose instanceof Date ? values.lastAnticoagDose : undefined}
        showSleepOnset={false}
      />
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────

function sanitizeNumeric(input: string, maxDigits: number): string {
  const digits = input.replace(/[^0-9]/g, '');
  return digits.slice(0, maxDigits);
}

/** Build a 1-line summary chip string for the collapsed eyebrow. */
function buildSummaryChips(values: PatientContextValues): string {
  const chips: string[] = [];
  if (values.lkw === null) chips.push('LKW: unknown');
  // L-3 fix (UX audit 2026-05-24): show the actual LKW time, not the
  // useless "LKW set" placeholder, in the collapsed-state summary chip.
  else if (values.lkw instanceof Date) chips.push(`LKW ${formatClinicalDateShort(values.lkw)}`);
  if (values.systolic && values.diastolic) chips.push(`BP ${values.systolic}/${values.diastolic}`);
  if (values.glucose) chips.push(`Glu ${values.glucose}`);
  if (values.anticoag.size > 0) {
    const names = Array.from(values.anticoag).map((k) => ANTICOAG_LABELS[k]).join('+');
    chips.push(names);
  }
  if (values.lastAnticoagDose === null) chips.push('dose: unknown');
  else if (values.lastAnticoagDose instanceof Date) chips.push('dose set');
  return chips.join(' · ');
}
