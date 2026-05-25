import React, { useState, useMemo, useEffect, useRef } from 'react';
import { X, Copy, Check, ChevronDown, Zap, Info } from 'lucide-react';
import { copyToClipboard } from '../../../utils/clipboard';
import { ShareButton } from '../../calculators/ShareButton';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

export interface ThrombolysisEligibilityData {
  lkwTime: Date | null;
  timeDifferenceHours: number | null;
  inclusionCriteriaMet: boolean;
  absoluteContraindications: string[];
  relativeContraindications: string[];
  eligibilityStatus: 'eligible' | 'relative-contraindication' | 'absolute-contraindication' | 'not-eligible';
  notes: string;
}

interface ThrombolysisEligibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: (data: ThrombolysisEligibilityData) => void;
  initialData?: ThrombolysisEligibilityData | null;
  /** BUG-05 fix: LKW timestamp from Step 1 — used to compute elapsed hours and show 3–4.5h chips */
  lkwDate?: Date | null;
}

// ── Chip data ──────────────────────────────────────────────────────────────

interface Chip { id: string; label: string; detail: string; }

const HARD_STOP_CHIPS: Chip[] = [
  { id: 'ich_on_ct',            label: 'ICH on CT',               detail: 'Any intracranial blood on CT. tPA is absolutely contraindicated.' },
  { id: 'significant_head_trauma', label: 'Head trauma <3mo',     detail: 'Significant head or facial trauma in the past 3 months.' },
  { id: 'prior_stroke_3mo',     label: 'Stroke <3mo',             detail: 'Prior ischemic stroke within 3 months.' },
  { id: 'prior_ich',            label: 'Prior brain bleed',       detail: 'Any prior history of intracranial hemorrhage.' },
  { id: 'sah_symptoms',         label: 'Possible SAH',            detail: 'Thunderclap headache or subarachnoid hemorrhage suspected.' },
  { id: 'ic_surgery',           label: 'Brain/spine surgery',     detail: 'Intracranial or intraspinal surgery within the past 3 months.' },
  { id: 'active_bleeding',      label: 'Active bleeding',         detail: 'Active internal bleeding at any site (excludes menses).' },
  // AHA/ASA 2026 §4.5 row 1 (COR 1, LOE C-LD): treat hypoglycemia at <60 mg/dL.
  // Updated from <50 per audit BLOCKING `stroke-code-glucose-threshold-60`.
  { id: 'hypoglycemia',         label: 'Glucose <60',             detail: 'Treat hypoglycemia (glucose <60 mg/dL) first per AHA/ASA 2026 §4.5; reassess for tPA if symptoms persist after normoglycemia.' },
  { id: 'ct_large_infarct',     label: '>⅓ MCA infarct',          detail: 'Hypodensity >1/3 of the MCA territory on CT.' },
  { id: 'severe_htn',           label: 'BP >185/110',             detail: 'Elevated BP must be controlled to <185/110 before tPA. Treat with labetalol or nicardipine.' },
];

const BLEEDING_LAB_CHIPS: Chip[] = [
  { id: 'platelets',    label: 'PLT <100k',         detail: 'Platelet count below 100,000/mm³.' },
  { id: 'heparin_aptt', label: 'Heparin + ↑aPTT',  detail: 'Heparin administered within 48h with elevated aPTT.' },
  { id: 'warfarin_inr', label: 'INR >1.7',          detail: 'On anticoagulant with INR >1.7 or PT >15 seconds.' },
  { id: 'doac',         label: 'DOAC <48h',         detail: 'Direct thrombin or factor Xa inhibitor taken within 48h, or elevated drug-specific assay.' },
];

const RELATIVE_CHIPS: Chip[] = [
  { id: 'minor_rapid',       label: 'Minor/rapid improvement', detail: 'Mild or rapidly clearing symptoms. Consider if symptoms are still disabling.' },
  { id: 'pregnancy',         label: 'Pregnancy',               detail: 'Get OB consult. Benefit may outweigh risk in severe stroke.' },
  { id: 'seizure_onset',     label: 'Seizure at onset',        detail: "Seizure at stroke onset with residual deficits. May be Todd's paralysis — imaging helps." },
  { id: 'major_surgery',     label: 'Surgery <14d',            detail: 'Major surgery or serious non-head trauma within 14 days.' },
  { id: 'gi_gu_bleed',       label: 'GI/GU bleed <21d',        detail: 'Recent gastrointestinal or urinary tract hemorrhage within 21 days.' },
  { id: 'recent_mi',         label: 'MI <3mo',                 detail: 'Acute myocardial infarction within 3 months. Discuss with cardiology.' },
  { id: 'arterial_puncture', label: 'Arterial access <7d',     detail: 'Arterial puncture at non-compressible site within 7 days.' },
];

/** 3–4.5h window: retired 2026-05-22 per AHA/ASA 2026 §4.6.1. The legacy
 *  ECASS-3 exclusion list has not been re-endorsed:
 *    - Age >80: removed (IST-3 + subsequent evidence support IVT benefit)
 *    - Oral anticoagulant (warfarin INR >1.7, DOAC <48h): already in
 *      HARD_STOP_CHIPS — apply at any time window, not 3–4.5h-specific
 *    - >⅓ MCA hypodensity: already in HARD_STOP_CHIPS — apply at any
 *      time window, not 3–4.5h-specific
 *    - NIHSS >25 + Diabetes-with-prior-stroke: not endorsed as exclusions
 *      in 2026 (severe stroke benefits from IVT; the DM+prior-stroke
 *      combination has no 2026 evidence supporting categorical exclusion)
 *  Section now renders a banner only. Array kept for backward compat with
 *  the extendedContraindications state machinery; intentionally empty.
 *  Closes TASKS entry `ecass-3-exclusions-modernize`. */
const EXTENDED_WINDOW_CHIPS: Chip[] = [];

// Full label map for EMR copy text
const CONTRA_LABELS: Record<string, string> = {
  ich_on_ct: 'ICH on CT',
  significant_head_trauma: 'Significant head trauma within 3 months',
  prior_stroke_3mo: 'Prior ischemic stroke within 3 months',
  prior_ich: 'History of intracranial hemorrhage',
  sah_symptoms: 'Symptoms suggest subarachnoid hemorrhage',
  ic_surgery: 'Recent intracranial or intraspinal surgery',
  active_bleeding: 'Active internal bleeding',
  hypoglycemia: 'Blood glucose <60 mg/dL',
  ct_large_infarct: 'CT: multilobar infarction >1/3 MCA territory',
  severe_htn: 'BP >185/110 mmHg',
  platelets: 'Platelet count <100,000/mm³',
  heparin_aptt: 'Heparin within 48h with elevated aPTT',
  warfarin_inr: 'Anticoagulant use with INR >1.7 or PT >15s',
  doac: 'DOAC with elevated drug-specific assay',
  minor_rapid: 'Minor or rapidly improving stroke symptoms',
  pregnancy: 'Pregnancy',
  seizure_onset: 'Seizure at onset with postictal neurological deficits',
  major_surgery: 'Major surgery or serious trauma within 14 days',
  gi_gu_bleed: 'GI/GU hemorrhage within 21 days',
  recent_mi: 'Acute MI within 3 months',
  arterial_puncture: 'Arterial puncture at non-compressible site within 7 days',
  // 3–4.5h extended window exclusions retired 2026-05-22 per AHA/ASA 2026
  // §4.6.1 (see EXTENDED_WINDOW_CHIPS comment for rationale). EMR labels
  // kept for backward compat in case historical state references these IDs.
  ext_oral_anticoag:   'Oral anticoagulant use — any (legacy 3–4.5h exclusion, retired)',
  ext_nihss_over25:    'NIHSS >25 (legacy 3–4.5h exclusion, retired)',
  ext_dm_prior_stroke: 'Diabetes mellitus with prior stroke (legacy 3–4.5h exclusion, retired)',
  ext_large_mca:       '>1/3 MCA territory on imaging (legacy 3–4.5h exclusion, retired)',
};

// ── Component ─────────────────────────────────────────────────────────────

export const ThrombolysisEligibilityModal: React.FC<ThrombolysisEligibilityModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData,
  lkwDate,
}) => {
  // Refs for focus trap (B-3 a11y fix)
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useModalFocusTrap(isOpen, onClose, dialogRef, closeButtonRef);

  const [absoluteContraindications, setAbsoluteContraindications] = useState<Record<string, boolean>>(
    initialData?.absoluteContraindications.reduce((acc, id) => ({ ...acc, [id]: true }), {}) ?? {}
  );
  const [relativeContraindications, setRelativeContraindications] = useState<Record<string, boolean>>(
    initialData?.relativeContraindications.reduce((acc, id) => ({ ...acc, [id]: true }), {}) ?? {}
  );
  /** HIGH-04: extended window chips — stored as absolute contraindications when active */
  const [extendedContraindications, setExtendedContraindications] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState(initialData?.notes ?? '');
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  const [expandedChip, setExpandedChip] = useState<string | null>(null);

  /** BUG-05 / HIGH-04: hours since LKW — drives visibility of 3–4.5h chip section */
  const lkwHoursElapsed = useMemo(() => {
    if (!lkwDate) return null;
    return (Date.now() - lkwDate.getTime()) / 3_600_000;
  }, [lkwDate]);

  const showExtendedSection = lkwHoursElapsed !== null && lkwHoursElapsed > 3.0 && lkwHoursElapsed <= 4.5;

  useEffect(() => {
    if (initialData) setNotes(initialData.notes ?? '');
  }, [initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key and Tab cycling handled by useModalFocusTrap above.

  const toggleAbsolute = (id: string) =>
    setAbsoluteContraindications(prev => ({ ...prev, [id]: !prev[id] }));

  const toggleRelative = (id: string) =>
    setRelativeContraindications(prev => ({ ...prev, [id]: !prev[id] }));

  const activeAbsolute = useMemo(
    () => [
      ...Object.entries(absoluteContraindications).filter(([, v]) => v).map(([id]) => id),
      ...Object.entries(extendedContraindications).filter(([, v]) => v).map(([id]) => id),
    ],
    [absoluteContraindications, extendedContraindications]
  );
  const activeRelative = useMemo(
    () => Object.entries(relativeContraindications).filter(([, v]) => v).map(([id]) => id),
    [relativeContraindications]
  );

  const eligibilityStatus = useMemo(() => {
    if (activeAbsolute.length > 0)
      return { status: 'absolute-contraindication' as const, label: 'IV tPA CONTRAINDICATED', color: 'red' };
    if (activeRelative.length > 0)
      return { status: 'relative-contraindication' as const, label: 'RELATIVE — DISCUSS RISK/BENEFIT', color: 'amber' };
    return { status: 'eligible' as const, label: 'NO CONTRAINDICATIONS FLAGGED', color: 'emerald' };
  }, [activeAbsolute, activeRelative]);

  /** BUG-05 fix: populate lkwTime and timeDifferenceHours from the lkwDate prop */
  const handleComplete = () => {
    const now = new Date();
    onComplete?.({
      lkwTime: lkwDate ?? null,
      timeDifferenceHours: lkwDate ? (now.getTime() - lkwDate.getTime()) / 3_600_000 : null,
      inclusionCriteriaMet: activeAbsolute.length === 0,
      absoluteContraindications: activeAbsolute,
      relativeContraindications: activeRelative,
      eligibilityStatus: eligibilityStatus.status,
      notes,
    });
    onClose();
  };

  const buildEmrText = (): string => {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    return [
      `tPA/TNK eligibility: ${today}`,
      '',
      `STATUS: ${eligibilityStatus.label}`,
      '',
      activeAbsolute.length > 0
        ? `ABSOLUTE CONTRAINDICATIONS:\n${activeAbsolute.map(id => `  • ${CONTRA_LABELS[id] ?? id}`).join('\n')}`
        : null,
      activeRelative.length > 0
        ? `RELATIVE CONTRAINDICATIONS:\n${activeRelative.map(id => `  • ${CONTRA_LABELS[id] ?? id}`).join('\n')}`
        : null,
      notes ? `NOTES:\n${notes}` : null,
      '',
      `Assessed: ${new Date().toLocaleString()}`,
    ].filter(Boolean).join('\n');
  };

  const handleCopyToEMR = () => {
    copyToClipboard(buildEmrText(), () => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  if (!isOpen) return null;

  // Chassis-variant status banner tint (background + border only;
  // eyebrow text color applied inline below per the chassis palette).
  const statusBg = eligibilityStatus.color === 'emerald'
    ? 'bg-emerald-50 border-emerald-100'
    : eligibilityStatus.color === 'red'
    ? 'bg-red-50 border-red-100'
    : 'bg-amber-50 border-amber-100';

  const statusIcon = eligibilityStatus.color === 'emerald' ? '✓' : eligibilityStatus.color === 'red' ? '✕' : '⚠';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        className="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[88dvh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eligibility-modal-title"
      >
        {/* Header — chassis-aligned 2026-05-24: slate-50 tint for
            cross-surface coherence with the pathway's chassis cards. */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 flex-shrink-0 bg-slate-50">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span id="eligibility-modal-title" className="text-sm font-bold text-slate-900 truncate">IV tPA Eligibility</span>
          </div>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close IV tPA eligibility panel"
          >
            <X className="w-4 h-4 text-slate-500" aria-hidden="true" />
          </button>
        </div>

        {/* Live status banner — chassis-variant 2026-05-24 per V
            decision #2 + arch condition #1. Documented in PM-spec as
            the canonical status-banner pattern: min-h-[48px] (vs
            standard 40px) so it reads as a banner not a section
            card; icon prominent in the semantic eyebrow color;
            tinted body that matches the chassis chrome family
            (not full flood). State signaling preserved via the
            semantic color of the eyebrow + icon + body tint. */}
        <div
          className={`flex items-center gap-2 px-4 border-b flex-shrink-0 min-h-[48px] ${statusBg}`}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          <span className={`font-mono text-base ${eligibilityStatus.color === 'emerald' ? 'text-emerald-700' : eligibilityStatus.color === 'red' ? 'text-red-700' : 'text-amber-700'}`} aria-hidden="true">{statusIcon}</span>
          <span className={`text-[10px] font-bold uppercase tracking-widest ${eligibilityStatus.color === 'emerald' ? 'text-emerald-700' : eligibilityStatus.color === 'red' ? 'text-red-700' : 'text-amber-700'}`}>{eligibilityStatus.label}</span>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5">

          {/* Instruction */}
          <p className="text-xs text-slate-500 leading-relaxed">
            Tap any contraindication that applies to this patient. Tap again to deselect.
            Based on AHA/ASA 2026 criteria for acute ischemic stroke.
          </p>

          {/* ── Hard stops ── */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-2">Hard Stops · Absolute</h3>
            <div className="grid grid-cols-2 gap-2">
              {HARD_STOP_CHIPS.map((chip) => {
                const active = !!absoluteContraindications[chip.id];
                const expanded = expandedChip === chip.id;
                return (
                  <div key={chip.id}>
                    {/* MED-04 fix: chip body toggles contraindication; info icon controls expand only */}
                    <div className={`relative flex min-h-[52px] rounded-xl border overflow-hidden transition-colors ${
                      active ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleAbsolute(chip.id)}
                        aria-pressed={active}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                        style={{ color: 'inherit' }}
                      >
                        <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedChip(expanded ? null : chip.id)}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 ${active ? 'text-red-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {expanded && (
                      <p className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 leading-relaxed">
                        {chip.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Bleeding / Labs ── */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-red-700 mb-2">Bleeding / Labs</h3>
            <div className="grid grid-cols-2 gap-2">
              {BLEEDING_LAB_CHIPS.map((chip) => {
                const active = !!absoluteContraindications[chip.id];
                const expanded = expandedChip === chip.id;
                return (
                  <div key={chip.id}>
                    <div className={`relative flex min-h-[52px] rounded-xl border overflow-hidden transition-colors ${
                      active ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleAbsolute(chip.id)}
                        aria-pressed={active}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                      >
                        <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedChip(expanded ? null : chip.id)}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 ${active ? 'text-red-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {expanded && (
                      <p className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 leading-relaxed">
                        {chip.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── Relative / Consider ── */}
          <section>
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-2">Consider · Relative</h3>
            <div className="grid grid-cols-2 gap-2">
              {RELATIVE_CHIPS.map((chip) => {
                const active = !!relativeContraindications[chip.id];
                const expanded = expandedChip === chip.id;
                return (
                  <div key={chip.id}>
                    <div className={`relative flex min-h-[52px] rounded-xl border overflow-hidden transition-colors ${
                      active ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleRelative(chip.id)}
                        aria-pressed={active}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                      >
                        <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedChip(expanded ? null : chip.id)}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 ${active ? 'text-amber-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                    {expanded && (
                      <p className="mt-1 text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 leading-relaxed">
                        {chip.detail}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ── 3–4.5h window note (AHA/ASA 2026 §4.6.1 harmonization) ──
              Legacy ECASS-3 specific exclusions retired 2026-05-22. The
              exclusions that remain valid in 2026 (warfarin INR >1.7, DOAC
              <48h, >⅓ MCA hypodensity) are now applied uniformly across
              both 0–3h and 3–4.5h windows via HARD_STOP_CHIPS above. */}
          {showExtendedSection && (
            <section className="rounded-xl bg-white border border-slate-100 overflow-hidden">
              <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">3–4.5h Window · Active</p>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-slate-700 leading-relaxed">
                  LKW is in the 3–4.5h window. AHA/ASA 2026 §4.6.1 has harmonized
                  this window with the 0–3h window: legacy ECASS-3-specific
                  exclusions (age &gt;80, NIHSS &gt;25, diabetes with prior stroke)
                  are no longer endorsed. The exclusions that remain valid at any
                  window (warfarin INR &gt;1.7, DOAC &lt;48h, &gt;⅓ MCA hypodensity)
                  are listed in the Absolute contraindications section above.
                </p>
              </div>
            </section>
          )}

          {/* ── Notes (collapsed) ── */}
          <details className="group rounded-xl bg-white border border-slate-100 overflow-hidden">
            <summary className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-widest text-slate-400 cursor-pointer hover:bg-slate-100 transition-colors list-none min-h-[40px]">
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-open:rotate-180 transition-transform shrink-0" aria-hidden />
              Clinical Notes (optional)
            </summary>
            <div className="px-4 pb-4 pt-1">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Document additional considerations..."
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 resize-none"
                rows={3}
              />
            </div>
          </details>

        </div>

        {/* Footer — H-17 fix: switched flex-wrap so the 5-control row
            does not clip at 375px. Touch targets all 44px+. */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between gap-3 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyToEMR}
              className="min-h-[44px] flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copiedToClipboard ? 'Copied!' : 'Copy to EMR'}
            </button>
            <ShareButton
              text={buildEmrText}
              title="Thrombolysis Eligibility"
              onResult={(r) => { if (r === 'shared' || r === 'copied') { setCopiedToClipboard(true); setTimeout(() => setCopiedToClipboard(false), 2000); } }}
              variant="pill"
              label="Send"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-[44px] px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              {onComplete ? 'Cancel' : 'Close'}
            </button>
            {onComplete && (
              <button
                type="button"
                onClick={handleComplete}
                className="min-h-[44px] px-5 text-sm font-semibold text-white bg-neuro-500 hover:bg-neuro-600 rounded-xl transition-colors"
              >
                Save &amp; Return →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
