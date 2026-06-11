import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronDown, Mic, MicOff } from 'lucide-react';

// Web Speech API — not yet in lib.dom.d.ts for all runtimes. Narrow cast here
// rather than adding a global augmentation that would spill into other files.
type SpeechRecognitionCtor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: { results: SpeechRecognitionResultList; resultIndex: number }) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
};
type BrowserWindow = Window & {
  SpeechRecognition?: SpeechRecognitionCtor;
  webkitSpeechRecognition?: SpeechRecognitionCtor;
};
import { formatClinicalDateShort } from '../../utils/clinicalDateTime';
import { LKWTimePicker } from '../article/stroke/LKWTimePicker';
import { MrsPickerModal } from '../calculators/MrsPickerModal';

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

/**
 * Anticoagulant / antiplatelet class. 'none' removed: an empty Set is "none".
 * 'heparin' covers the Heparin/LMWH chip (the IVT gate is the aPTT lab value).
 */
export type Anticoag = 'antiplatelet' | 'doac' | 'warfarin' | 'heparin';

/** 0–6 modified Rankin Scale grade. Full scale (MrsPickerModal needs grade 6). */
export type MRSGrade = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Pre-stroke baseline mRS, constrained to 0–5: a baseline of 6 (dead) is not meaningful. */
export type PrestrokeMrsGrade = 0 | 1 | 2 | 3 | 4 | 5;

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
  /**
   * Pre-stroke modified Rankin Scale grade (0–5). Records the patient's
   * functional baseline before the current event. Used for EVT eligibility
   * assessment (mRS 0–1 vs ≥2) and outcome comparison. `undefined` = not yet
   * recorded. Grade 6 (dead) is excluded: this is a baseline measure.
   */
  prestrokeMrs?: PrestrokeMrsGrade;
  /** Free-text documentation of pre-existing neurological deficits, entered by nursing staff. */
  preExistingDeficits: string;
  // ── Per-drug IV-thrombolysis eligibility (rendered only when showThrombolysisTiming) ──
  /** DOAC last dose relative to the 48h window. */
  doacTiming?: 'lt48h' | 'gte48h';
  /** Optional DOAC drug name (free text). */
  doacDrug?: string;
  /** Warfarin INR bucket relative to the 1.7 threshold. */
  warfarinInr?: 'le1_7' | 'gt1_7';
  /** Heparin/LMWH aPTT bucket relative to the 40s threshold. */
  heparinAptt?: 'le40s' | 'gt40s';
}

export const EMPTY_PATIENT_CONTEXT: PatientContextValues = {
  lkw: undefined,
  systolic: '',
  diastolic: '',
  glucose: '',
  anticoag: new Set(),
  lastAnticoagDose: undefined,
  prestrokeMrs: undefined,
  preExistingDeficits: '',
  doacTiming: undefined,
  doacDrug: undefined,
  warfarinInr: undefined,
  heparinAptt: undefined,
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
  /**
   * Opt-in thrombolysis-timing aid (currently NIHSS). When true and a
   * witnessed LKW timestamp is set, the panel shows time since onset, a
   * within/beyond-4.5h window chip, and reframes the elevated-BP note as a
   * "Thrombolytic candidate: BP goal <185/110" prompt while in window. These
   * are live bedside aids and are not part of any copy export. Off by default
   * so the Stroke Code steps and the mRS picker that share this panel are
   * unchanged.
   */
  showThrombolysisTiming?: boolean;
}

const ANTICOAG_LABELS: Record<Anticoag, string> = {
  antiplatelet: 'Antiplatelet',
  doac: 'DOAC',
  warfarin: 'Warfarin',
  heparin: 'Heparin/LMWH',
};

/** Display + render order for the anticoag chips and their sub-rows. */
const ANTICOAG_KEYS: Anticoag[] = ['antiplatelet', 'doac', 'warfarin', 'heparin'];

/**
 * Dense "quiet chip" classes for the eligibility controls (Variation C, V pick
 * 2026-06-10). Smaller (h-7), lower-contrast, square-cornered (rounded-md) so the
 * panel reads lighter and shorter on a 375px phone. 28px height meets WCAG 2.2 AA
 * target size (24px floor); the chips sit in 44px rows with gap spacing.
 * CHIP_CAUT is the amber selected-state for a value that excludes / cautions IVT.
 */
const CHIP_BASE =
  'h-7 px-2.5 inline-flex items-center justify-center text-[11px] font-medium rounded-md border transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-1 focus-visible:outline-none';
const CHIP_ON = 'bg-neuro-50 border-neuro-200 text-neuro-700';
// slate-500 (not slate-400) so unselected chip text clears WCAG AA 4.5:1 on white.
const CHIP_OFF = 'bg-white border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-600';
const CHIP_CAUT = 'bg-amber-50 border-amber-200 text-amber-700';

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({
  values,
  onChange,
  label,
  defaultExpanded = false,
  lockExpanded = false,
  extraRows,
  showThrombolysisTiming = false,
}) => {
  const [expanded, setExpanded] = useState(lockExpanded || defaultExpanded);
  const [lkwModalOpen, setLkwModalOpen] = useState(false);
  const [mrsModalOpen, setMrsModalOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [speechSupported] = useState(() =>
    typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
  );
  const recognitionRef = useRef<InstanceType<SpeechRecognitionCtor> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mrsHelpRef = useRef<HTMLButtonElement>(null);

  // Refs so onresult always sees fresh values without stale closure.
  const onChangeRef = useRef(onChange);
  const valuesRef = useRef(values);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { valuesRef.current = values; }, [values]);

  // Per-session accumulator — grows only within a single listening session.
  // Reset to '' each time the mic is activated.
  const sessionTextRef = useRef('');
  // Highest result index already committed as final. Guards against browsers
  // (Chrome on mobile) that fire resultIndex=0 on every event, causing the
  // loop to re-walk already-finalized results and duplicate them.
  const lastFinalIndexRef = useRef(-1);

  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, []);

  useEffect(() => { autoResize(); }, [values.preExistingDeficits, autoResize]);

  const toggleSpeech = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      setInterimText('');
      return;
    }
    const bw = window as BrowserWindow;
    const SR = bw.webkitSpeechRecognition ?? bw.SpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;   // real-time word-by-word display
    rec.lang = 'en-US';

    // Snapshot existing text at the moment the session starts.
    // All finalized phrases are appended to this — never re-read
    // from values (which would be stale after the first result).
    const baseText = valuesRef.current.preExistingDeficits;
    sessionTextRef.current = '';
    lastFinalIndexRef.current = -1;

    rec.onresult = (e) => {
      let interimAccum = '';
      let newFinal = '';

      for (let i = e.resultIndex; i < e.results.length; i++) {
        const text = e.results[i][0].transcript;
        if (e.results[i].isFinal) {
          // Skip results already committed — guards against browsers that
          // fire resultIndex=0 on every event and cause re-processing.
          if (i <= lastFinalIndexRef.current) continue;
          lastFinalIndexRef.current = i;
          newFinal += text;
        } else {
          interimAccum += text;
        }
      }

      // Append finalized phrases to the session accumulator
      if (newFinal.trim()) {
        const corrected = applyMedicalCorrections(newFinal.trim());
        sessionTextRef.current = sessionTextRef.current
          ? `${sessionTextRef.current} ${corrected}`
          : corrected;
        const combined = baseText
          ? `${baseText} ${sessionTextRef.current}`
          : sessionTextRef.current;
        onChangeRef.current({ ...valuesRef.current, preExistingDeficits: combined });
      }

      // Interim text shown live below the textarea — clears on next final
      setInterimText(interimAccum);
    };

    rec.onerror = () => { setIsListening(false); setInterimText(''); };
    rec.onend   = () => { setIsListening(false); setInterimText(''); };
    recognitionRef.current = rec;
    rec.start();
    setIsListening(true);
  }, [isListening]);

  const hasAnyValue =
    values.lkw !== undefined ||
    values.systolic !== '' ||
    values.diastolic !== '' ||
    values.glucose !== '' ||
    values.lastAnticoagDose !== undefined ||
    values.anticoag.size > 0 ||
    values.prestrokeMrs !== undefined ||
    values.preExistingDeficits !== '';

  // Header eyebrow shows summary chips if any value is set + collapsed
  const summaryChips = !expanded && hasAnyValue ? buildSummaryChips(values) : null;
  // Attention cue (V-approved Option A): a slow breathing indigo highlight on
  // the collapsed, still-empty optional panel so clinicians notice it. Stops
  // the moment the panel is opened or any value is entered.
  const showAttentionCue = !expanded && !lockExpanded && !hasAnyValue;

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

  // Thrombolysis-timing aid (opt-in via showThrombolysisTiming, currently
  // NIHSS). Computes time since a witnessed LKW and the IV thrombolysis window
  // tier. Recomputed each render so it stays current as the clinician
  // interacts. Returns null unless a real LKW Date is set (wake-up / unknown /
  // unset have no onset clock). Standard ≤4.5h per AHA/ASA 2026 §4.6.1/§4.6.2;
  // perfusion/MRI-selected extended 4.5–9h per EXTEND + WAKE-UP (COR 2a). Note:
  // §4.6.3 is the separate late-window TNK-for-LVO recommendation (4.5–24h), not
  // this extended IVT window.
  const ivt = (() => {
    if (!showThrombolysisTiming || !(values.lkw instanceof Date)) return null;
    const elapsedMin = Math.max(0, Math.floor((Date.now() - values.lkw.getTime()) / 60000));
    const hh = Math.floor(elapsedMin / 60);
    const mm = elapsedMin % 60;
    const elapsedLabel = hh > 0 ? `${hh} h ${mm} min` : `${mm} min`;
    const elapsedHours = elapsedMin / 60;
    // Three tiers: standard ≤4.5h, perfusion-selected extended 4.5–9h, outside
    // >9h. inWindow stays the ≤4.5h standard window (it gates the BP prompt and
    // the countdown; V direction: BP prompt only in the 4.5h window).
    const tier = elapsedHours <= 4.5 ? 'standard' : elapsedHours <= 9 ? 'extended' : 'outside';
    const inWindow = tier === 'standard';
    const minutesLeft = Math.max(0, Math.round((4.5 - elapsedHours) * 60));
    const lastHalfHour = inWindow && minutesLeft <= 30;
    // Window-chip appearance: green standard, orange extended, red outside.
    // The amber countdown sits between green and orange in the final 30 min.
    const chip =
      tier === 'standard'
        ? lastHalfHour
          ? { cls: 'text-amber-700 bg-amber-50 border-amber-200', label: `${minutesLeft} min left` }
          : { cls: 'text-emerald-700 bg-emerald-50 border-emerald-200', label: 'Within 4.5h' }
        : tier === 'extended'
        ? { cls: 'text-orange-700 bg-orange-50 border-orange-200', label: '4.5–9h window' }
        : { cls: 'text-rose-700 bg-rose-50 border-rose-200', label: 'Beyond 9h' };
    return { elapsedLabel, inWindow, minutesLeft, lastHalfHour, tier, chip };
  })();

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
        aria-disabled={lockExpanded ? true : undefined}
        tabIndex={lockExpanded ? -1 : undefined}
        className={`w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 border-b text-left transition-colors ${
          lockExpanded
            ? 'bg-slate-50 border-slate-100 cursor-default'
            : expanded
              ? 'bg-neuro-50 border-neuro-100 hover:bg-neuro-100 cursor-pointer'
              : showAttentionCue
                ? 'pc-attention bg-neuro-50 border-neuro-100 hover:bg-neuro-100 cursor-pointer'
                : 'bg-slate-50 border-slate-100 hover:bg-slate-100 cursor-pointer'
        }`}
        aria-expanded={lockExpanded ? undefined : expanded}
        aria-controls={lockExpanded ? undefined : 'patient-context-body'}
      >
        <div className="flex flex-col min-w-0">
          <span className={`text-[10px] font-bold uppercase tracking-widest ${(expanded || showAttentionCue) && !lockExpanded ? 'text-neuro-500' : 'text-slate-400'}`}>
            {label ?? (expanded ? 'Patient context' : '+ Patient context (optional)')}
          </span>
          {!expanded && (
            <span className="text-xs text-slate-500 mt-0.5 truncate">
              {summaryChips ?? 'Tap to add last known well, blood pressure, glucose, anticoagulation, and pre-stroke mRS'}
            </span>
          )}
        </div>
        {!lockExpanded && (
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 motion-safe:transition-transform ${expanded ? 'rotate-180 text-neuro-500' : showAttentionCue ? 'text-neuro-400' : 'text-slate-400'}`}
            aria-hidden
          />
        )}
      </button>

      {/* Expanded body — H-18 fix (UX audit 2026-05-24): always rendered
          and toggled via the `hidden` attribute rather than conditional
          mount/unmount. This guarantees that the `aria-controls` target
          referenced by the header button exists in the DOM at all times,
          per ARIA 1.2 spec. Hidden-attribute is equivalent to display:
          none and is honored by assistive tech as truly hidden. */}
      <div
        id="patient-context-body"
        className="divide-y divide-slate-50"
        hidden={!expanded}
      >
        {expanded && (
          <>
          {/* LKW row — tap opens the canonical LKWTimePicker modal (same
              component as Stroke Code Step 1 + Extended IVT pathway).
              M-13 fix: explicit aria-label so screen readers don't read
              the concatenation "Last known well Add" awkwardly. */}
          <button
            type="button"
            onClick={() => setLkwModalOpen(true)}
            className="w-full min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 hover:bg-slate-50 transition-colors text-left focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-haspopup="dialog"
            aria-label={`Set last known well time — currently ${lkwDisplay}`}
          >
            <span className="text-xs font-medium text-slate-600 flex-shrink-0">Last known well</span>
            <span className="flex items-center gap-1">
              <span className={`text-sm ${values.lkw === undefined ? 'text-slate-400' : 'text-slate-900'}`}>{lkwDisplay}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" aria-hidden />
            </span>
          </button>

          {/* Thrombolysis timing — opt-in (NIHSS). Time since onset plus a
              three-tier window chip (green ≤4.5h, orange 4.5–9h, red >9h).
              Live bedside aid; the chip is not part of the copy export (only
              the time-since-onset line is). */}
          {ivt && (
            <div
              data-claim="ivt-window-4.5h"
              className="px-4 pb-2 -mt-0.5 flex items-center gap-2 flex-wrap"
              role="status"
              aria-live="polite"
            >
              <span className="text-xs text-slate-500">~{ivt.elapsedLabel} since onset</span>
              <span
                className={`inline-flex items-center text-[11px] font-semibold rounded-full px-2 py-0.5 border ${ivt.chip.cls}`}
              >
                {ivt.chip.label}
              </span>
            </div>
          )}
          {showThrombolysisTiming && values.lkw === null && (
            <div className="px-4 pb-2 -mt-0.5">
              <span className="text-xs text-slate-400">
                Wake-up or unknown onset, so time since onset is not shown.
              </span>
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

          {/* BP threshold alert — AHA/ASA 2019 Table 5: SBP >185 or DBP >110
              is a contraindication to IV thrombolysis. Alert fires on OR-logic
              (matching the guideline's OR-logic exclusion criterion). Scoped to
              pre-treatment context only — PatientContextPanel is an initial-
              assessment surface, not a post-bolus monitoring surface.
              data-claim: bp-ivt-threshold-185-110 */}
          {(() => {
            const sys = parseInt(values.systolic, 10);
            const dia = parseInt(values.diastolic, 10);
            const elevated =
              (values.systolic !== '' && !isNaN(sys) && sys >= 185) ||
              (values.diastolic !== '' && !isNaN(dia) && dia >= 110);
            if (!elevated) return null;
            // On the thrombolysis-timing surface (NIHSS), only prompt the BP
            // target when the patient is confirmed inside the 4.5h window. Out
            // of window, or before LKW is entered, the <185/110 pre-thrombolysis
            // target does not apply, so no BP prompt is shown. Surfaces without
            // the timing aid keep the generic note. (V direction 2026-06-10.)
            if (showThrombolysisTiming && !ivt?.inWindow) return null;
            return (
              <div
                data-claim="bp-ivt-threshold-185-110"
                className="px-4 pb-2 -mt-0.5 flex items-start gap-1.5"
                role="status"
                aria-live="polite"
              >
                <span className="text-amber-600 text-xs font-bold flex-shrink-0 leading-snug" aria-hidden="true">!</span>
                <p className="text-xs text-amber-700 leading-snug">
                  {ivt?.inWindow
                    ? 'If thrombolysis planned: BP goal <185/110'
                    : 'BP above tPA/TNK threshold. Lower to ≤185/110 before treatment'}
                </p>
              </div>
            );
          })()}

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

          {/* Hypoglycemia caution: glucose <60 mg/dL. Mirrors the Stroke Code
              pathway alert (CodeModeStep1); gated to the thrombolysis surface
              (NIHSS) so it does not double up with Stroke Code's own alert.
              Threshold <60 per AHA/ASA 2026 §4.5 (COR 1, LOE C-LD). */}
          {showThrombolysisTiming && (() => {
            const glu = parseInt(values.glucose, 10);
            if (values.glucose === '' || isNaN(glu) || glu <= 0 || glu >= 60) return null;
            return (
              <div
                data-claim="ivt-hypoglycemia-60"
                className="px-4 pb-2 -mt-0.5 flex items-start gap-1.5"
                role="status"
                aria-live="polite"
              >
                <span className="text-amber-600 text-xs font-bold flex-shrink-0 leading-snug" aria-hidden="true">!</span>
                <p className="text-xs text-amber-700 leading-snug">
                  {'Hypoglycemia (glucose <60): treat with D50 50 mL IV, recheck, reassess for tPA if symptoms persist.'}
                </p>
              </div>
            );
          })()}

          {/* Anti-coag/Antiplatelet class selector. role="group" gives screen
              reader users the context that the chips are one selection group. */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
            <span id="anticoag-label" className="text-xs font-medium text-slate-600 flex-shrink-0">Anti-coag/Antiplatelet</span>
            <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-labelledby="anticoag-label">
              {ANTICOAG_KEYS.map((key) => {
                const selected = values.anticoag.has(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAnticoag(key)}
                    className={`${CHIP_BASE} ${selected ? CHIP_ON : CHIP_OFF}`}
                    aria-pressed={selected}
                  >
                    {ANTICOAG_LABELS[key]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Per-drug IV-thrombolysis eligibility sub-rows. Only on the
              thrombolysis surface (NIHSS via showThrombolysisTiming); Stroke
              Code keeps its own engine and sees only the class selector above.
              Each selected class reveals its eligibility input as dense quiet
              chips (Variation C); the contraindication cue is a thin inline note.
              Criteria: AHA/ASA 2026 §4.6.1 (antiplatelet not a contraindication)
              and §4.6.5 + Table 8 (DOAC <48h relative; INR >1.7 and aPTT >40s
              absolute). */}
          {showThrombolysisTiming && values.anticoag.has('antiplatelet') && (
            <div data-claim="ivt-anticoag-antiplatelet-ok" className="px-4 pb-2 -mt-0.5">
              <p className="text-xs text-slate-400 italic">
                Single or dual antiplatelet use is not a contraindication to IV thrombolysis.
              </p>
            </div>
          )}

          {showThrombolysisTiming && values.anticoag.has('doac') && (
            <>
              <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
                <span id="doac-label" className="text-xs font-medium text-slate-600 flex-shrink-0">Last DOAC dose</span>
                <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-labelledby="doac-label">
                  {/* Drug-name box first, then the timing toggle (V alignment
                      preference 2026-06-10). */}
                  <input
                    type="text"
                    value={values.doacDrug ?? ''}
                    onChange={(e) => onChange({ ...values, doacDrug: e.target.value || undefined })}
                    placeholder="drug, optional"
                    className="w-[104px] text-right text-sm text-slate-900 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none px-1 py-1 placeholder:text-slate-300"
                    aria-label="DOAC drug name"
                  />
                  {([['lt48h', '<48 h'], ['gte48h', '≥48 h']] as const).map(([val, lbl]) => {
                    const selected = values.doacTiming === val;
                    return (
                      <button key={val} type="button"
                        onClick={() => onChange({ ...values, doacTiming: selected ? undefined : val })}
                        className={`${CHIP_BASE} ${selected ? (val === 'lt48h' ? CHIP_CAUT : CHIP_ON) : CHIP_OFF}`} aria-pressed={selected}>
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
              {values.doacTiming === 'lt48h' && (
                <div data-claim="ivt-anticoag-doac-48h" className="px-4 pb-2 -mt-0.5 flex items-start gap-1.5" role="status" aria-live="polite">
                  <span className="text-amber-600 text-xs font-bold flex-shrink-0 leading-snug" aria-hidden="true">!</span>
                  <p className="text-xs text-amber-700 leading-snug">{'DOAC <48h: individualize, IV thrombolysis safety unknown.'}</p>
                </div>
              )}
            </>
          )}

          {showThrombolysisTiming && values.anticoag.has('warfarin') && (
            <>
              <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
                <span id="warfarin-label" className="text-xs font-medium text-slate-600 flex-shrink-0">INR</span>
                <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-labelledby="warfarin-label">
                  {([['le1_7', '≤1.7'], ['gt1_7', '>1.7']] as const).map(([val, lbl]) => {
                    const selected = values.warfarinInr === val;
                    return (
                      <button key={val} type="button"
                        onClick={() => onChange({ ...values, warfarinInr: selected ? undefined : val })}
                        className={`${CHIP_BASE} ${selected ? (val === 'gt1_7' ? CHIP_CAUT : CHIP_ON) : CHIP_OFF}`} aria-pressed={selected}>
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
              {values.warfarinInr === 'gt1_7' && (
                <div data-claim="ivt-anticoag-warfarin-inr" className="px-4 pb-2 -mt-0.5 flex items-start gap-1.5" role="status" aria-live="polite">
                  <span className="text-amber-600 text-xs font-bold flex-shrink-0 leading-snug" aria-hidden="true">!</span>
                  <p className="text-xs text-amber-700 leading-snug">{'INR >1.7: excluded from IV thrombolysis.'}</p>
                </div>
              )}
            </>
          )}

          {showThrombolysisTiming && values.anticoag.has('heparin') && (
            <>
              <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap">
                <span id="heparin-label" className="text-xs font-medium text-slate-600 flex-shrink-0">aPTT</span>
                <div className="flex items-center gap-1.5 flex-wrap" role="group" aria-labelledby="heparin-label">
                  {([['le40s', '≤40 s'], ['gt40s', '>40 s']] as const).map(([val, lbl]) => {
                    const selected = values.heparinAptt === val;
                    return (
                      <button key={val} type="button"
                        onClick={() => onChange({ ...values, heparinAptt: selected ? undefined : val })}
                        className={`${CHIP_BASE} ${selected ? (val === 'gt40s' ? CHIP_CAUT : CHIP_ON) : CHIP_OFF}`} aria-pressed={selected}>
                        {lbl}
                      </button>
                    );
                  })}
                </div>
              </div>
              {values.heparinAptt === 'gt40s' && (
                <div data-claim="ivt-anticoag-ufh-aptt" className="px-4 pb-2 -mt-0.5 flex items-start gap-1.5" role="status" aria-live="polite">
                  <span className="text-amber-600 text-xs font-bold flex-shrink-0 leading-snug" aria-hidden="true">!</span>
                  <p className="text-xs text-amber-700 leading-snug">{'IV heparin, aPTT >40 s: excluded from IV thrombolysis.'}</p>
                </div>
              )}
            </>
          )}

          {/* Pre-stroke mRS — compact number chips (inline select). The label
              doubles as the opener for the slide-up grade explainer, cued by the
              "(full scale)" subscript (V direction 2026-06-10: restore the
              labelled opener in place of the "?" icon). Range 0-5: a pre-stroke
              baseline of 6 (dead) is not meaningful. Records functional baseline
              for EVT eligibility (mRS 0-1 independent vs >=2 dependent). */}
          <div className="min-h-[44px] flex items-center justify-between px-4 py-2 gap-3">
            <button
              ref={mrsHelpRef}
              id="prestroke-mrs-label"
              type="button"
              onClick={() => setMrsModalOpen(true)}
              aria-haspopup="dialog"
              className="text-xs font-medium text-slate-600 flex-shrink-0 inline-flex items-center gap-1 hover:text-neuro-600 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none rounded"
            >
              Pre-stroke mRS
              <span className="text-[10px] text-slate-400 font-normal">(full scale)</span>
            </button>
            <div
              role="group"
              aria-labelledby="prestroke-mrs-label"
              className="flex items-center gap-1"
            >
              {([0, 1, 2, 3, 4, 5] as PrestrokeMrsGrade[]).map((grade) => {
                const selected = values.prestrokeMrs === grade;
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() =>
                      onChange({
                        ...values,
                        prestrokeMrs: selected ? undefined : grade,
                      })
                    }
                    className={`h-7 w-7 inline-flex items-center justify-center rounded-md text-[11px] font-medium border transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                      selected ? CHIP_ON : CHIP_OFF
                    }`}
                    aria-pressed={selected}
                    aria-label={`Pre-stroke mRS ${grade}`}
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Pre-existing deficits — free-text nursing documentation.
              Single-line textarea that auto-expands with content.
              Mic button triggers Web Speech API when supported by device. */}
          <div className="px-4 py-2.5">
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <label
                htmlFor="pre-existing-deficits"
                className="text-xs font-medium text-slate-600 flex-shrink-0 pt-1"
              >
                Pre-existing deficits
              </label>
              {speechSupported && (
                /* Relative wrapper so the ping ring is positioned behind the button */
                <span className="relative flex-shrink-0 flex items-center justify-center">
                  {/* Outward ping ring — only rendered while listening */}
                  {isListening && (
                    <span
                      className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-60 animate-ping"
                      aria-hidden
                    />
                  )}
                  <button
                    type="button"
                    onClick={toggleSpeech}
                    className={`relative p-2 rounded-full border-2 transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${
                      isListening
                        ? 'bg-red-500 border-red-500 text-white shadow-md'
                        : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'
                    }`}
                    aria-label={isListening ? 'Stop dictation' : 'Start dictation'}
                    aria-pressed={isListening}
                  >
                    {isListening
                      ? <MicOff className="w-4 h-4" aria-hidden />
                      : <Mic className="w-4 h-4" aria-hidden />}
                  </button>
                </span>
              )}
            </div>
            <textarea
              id="pre-existing-deficits"
              ref={textareaRef}
              rows={1}
              value={values.preExistingDeficits}
              onChange={(e) => {
                onChange({ ...values, preExistingDeficits: e.target.value });
                autoResize();
              }}
              placeholder="e.g. right arm weakness from prior stroke, aphasia at baseline…"
              className="w-full resize-none overflow-hidden text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 focus:border-neuro-500 focus:outline-none placeholder:text-slate-300 leading-snug"
            />
            {/* Live interim transcript — appears word-by-word as the user
                speaks, disappears when the phrase is finalized and locked
                into the textarea. Grey italic matches iOS/Android dictation
                UX. Only visible while mic is active and browser is
                mid-phrase. */}
            {isListening && interimText && (
              <p className="mt-1 px-1 text-xs text-slate-500 italic leading-snug" aria-live="polite" aria-atomic="false">
                {interimText}
                <span className="inline-block w-1.5 h-3 bg-slate-300 ml-0.5 animate-pulse rounded-sm align-middle" aria-hidden />
              </p>
            )}
          </div>

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
          </>
        )}
      </div>

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

      {/* Pre-stroke mRS grade explainer: slide-up sheet opened by the "?" next
          to the mRS label. maxGrade=5 (grade 6 "Dead" is not a baseline). */}
      <MrsPickerModal
        isOpen={mrsModalOpen}
        onClose={() => { setMrsModalOpen(false); mrsHelpRef.current?.focus(); }}
        value={values.prestrokeMrs}
        maxGrade={5}
        onChange={(grade) => {
          onChange({ ...values, prestrokeMrs: grade as PrestrokeMrsGrade | undefined });
          setMrsModalOpen(false);
        }}
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

/**
 * Lightweight medical term autocorrection for voice dictation.
 * Speech engines commonly mishear neurological terms. This runs on each
 * finalized phrase and silently fixes the most frequent errors.
 * Case-insensitive match; preserves original capitalisation of surrounding text.
 */
// Simple string-to-string corrections only — keeps the type clean and avoids
// the string|function union complexity. Function-based replacements are
// handled inline in applyMedicalCorrections where needed.
const MEDICAL_CORRECTIONS: [RegExp, string][] = [
  // Neurological conditions — common speech-engine mishearings
  [/\baph?asia\b/gi, 'aphasia'],
  [/\bdys?arth?ria\b/gi, 'dysarthria'],
  [/\bhemi(paresis|plegia)\b/gi, 'hemi$1'],
  [/\bhemipar[ae]sis\b/gi, 'hemiparesis'],
  [/\batax[ei]a\b/gi, 'ataxia'],
  [/\bnys?tagm?us\b/gi, 'nystagmus'],
  [/\bdysph?agia\b/gi, 'dysphagia'],
  [/\bdiplo?pia\b/gi, 'diplopia'],
  [/\baniso?coria\b/gi, 'anisocoria'],
  [/\bpapill?ede?ma\b/gi, 'papilledema'],
  [/\bpare?sthes[ei]a\b/gi, 'paresthesia'],
  [/\banosog?nos[ei]a\b/gi, 'anosognosia'],
  [/\bapraxi?a\b/gi, 'apraxia'],
  [/\bhemi?anop[si]a\b/gi, 'hemianopia'],
  [/\bquadrant?anop[si]a\b/gi, 'quadrantanopia'],
  // Common dictation mishearings
  [/\bwrite (arm|leg|hand|foot|side)\b/gi, 'right $1'],
  [/\bdrif?t\b/gi, 'drift'],
  [/\bbasel?ine\b/gi, 'baseline'],
  [/\bpre ?exist/gi, 'pre-exist'],
];

function applyMedicalCorrections(text: string): string {
  let result = text;
  for (const [pattern, replacement] of MEDICAL_CORRECTIONS) {
    // TypeScript: replacement may be string or function — cast to any to allow both
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    result = result.replace(pattern, replacement as any);
  }
  return result;
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
  if (values.prestrokeMrs !== undefined) chips.push(`mRS ${values.prestrokeMrs}`);
  if (values.preExistingDeficits) chips.push('deficits noted');
  return chips.join(' · ');
}
