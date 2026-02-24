import React, { useState, useMemo, useEffect } from 'react';
import { X, Copy, Check, ChevronDown, Zap, Info } from 'lucide-react';
import { copyToClipboard } from '../../../utils/clipboard';

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
  { id: 'hypoglycemia',         label: 'Glucose <50',             detail: 'Treat hypoglycemia first; reassess for tPA if symptoms persist after normoglycemia.' },
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

/** HIGH-04 fix: make 3–4.5h window items interactive chips that affect eligibility */
const EXTENDED_WINDOW_CHIPS: Chip[] = [
  { id: 'ext_age_over80',       label: 'Age >80',               detail: 'Excluded from 3–4.5h window only (fine in 0–3h window).' },
  { id: 'ext_oral_anticoag',    label: 'Any oral anticoagulant', detail: 'Even if INR is normal — excluded from 3–4.5h window.' },
  { id: 'ext_nihss_over25',     label: 'NIHSS >25',             detail: 'Severe stroke has uncertain benefit in 3–4.5h window.' },
  { id: 'ext_dm_prior_stroke',  label: 'Diabetes + prior stroke', detail: 'This combination excluded in 3–4.5h window.' },
  { id: 'ext_large_mca',        label: '>⅓ MCA on imaging',      detail: 'Large ischemic injury on imaging — excluded from 3–4.5h window.' },
];

// Full label map for EMR copy text
const CONTRA_LABELS: Record<string, string> = {
  ich_on_ct: 'ICH on CT',
  significant_head_trauma: 'Significant head trauma within 3 months',
  prior_stroke_3mo: 'Prior ischemic stroke within 3 months',
  prior_ich: 'History of intracranial hemorrhage',
  sah_symptoms: 'Symptoms suggest subarachnoid hemorrhage',
  ic_surgery: 'Recent intracranial or intraspinal surgery',
  active_bleeding: 'Active internal bleeding',
  hypoglycemia: 'Blood glucose <50 mg/dL',
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
  // 3–4.5h extended window exclusions
  ext_age_over80:      'Age >80 (3–4.5h window exclusion)',
  ext_oral_anticoag:   'Oral anticoagulant use — any (3–4.5h window exclusion)',
  ext_nihss_over25:    'NIHSS >25 (3–4.5h window exclusion)',
  ext_dm_prior_stroke: 'Diabetes mellitus with prior stroke (3–4.5h window exclusion)',
  ext_large_mca:       '>1/3 MCA territory on imaging (3–4.5h window exclusion)',
};

// ── Component ─────────────────────────────────────────────────────────────

export const ThrombolysisEligibilityModal: React.FC<ThrombolysisEligibilityModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  initialData,
  lkwDate,
}) => {
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

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

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

  const handleCopyToEMR = () => {
    const text = [
      'IV tPA ELIGIBILITY ASSESSMENT (AHA/ASA 2026)',
      '='.repeat(48),
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

    copyToClipboard(text, () => {
      setCopiedToClipboard(true);
      setTimeout(() => setCopiedToClipboard(false), 2000);
    });
  };

  if (!isOpen) return null;

  const statusBg = eligibilityStatus.color === 'emerald'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : eligibilityStatus.color === 'red'
    ? 'bg-red-50 border-red-200 text-red-800'
    : 'bg-amber-50 border-amber-200 text-amber-800';

  const statusIcon = eligibilityStatus.color === 'emerald' ? '✓' : eligibilityStatus.color === 'red' ? '✕' : '⚠';

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div
        className="relative w-full sm:max-w-lg max-h-[92dvh] sm:max-h-[88vh] bg-white sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="eligibility-modal-title"
      >
        {/* Header — CLAUDE.md standard pattern */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 flex-shrink-0 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
              <Zap className="w-4 h-4 text-white" aria-hidden />
            </div>
            <span id="eligibility-modal-title" className="text-sm font-bold text-slate-900 truncate">IV tPA Eligibility</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Live status banner */}
        <div className={`flex items-center gap-2 px-4 py-2.5 border-b flex-shrink-0 text-sm font-bold ${statusBg}`}>
          <span className="font-mono">{statusIcon}</span>
          <span>{eligibilityStatus.label}</span>
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2">Hard Stops — Absolute</p>
            <div className="grid grid-cols-2 gap-2">
              {HARD_STOP_CHIPS.map((chip) => {
                const active = !!absoluteContraindications[chip.id];
                const expanded = expandedChip === chip.id;
                return (
                  <div key={chip.id}>
                    {/* MED-04 fix: chip body toggles contraindication; info icon controls expand only */}
                    <div className={`relative flex min-h-[52px] rounded-xl border-2 overflow-hidden transition-colors ${
                      active ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleAbsolute(chip.id)}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none"
                        style={{ color: 'inherit' }}
                      >
                        <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedChip(expanded ? null : chip.id)}
                        className={`px-2 flex items-center shrink-0 focus-visible:outline-none ${active ? 'text-red-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden />
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2">Bleeding / Labs</p>
            <div className="grid grid-cols-2 gap-2">
              {BLEEDING_LAB_CHIPS.map((chip) => {
                const active = !!absoluteContraindications[chip.id];
                const expanded = expandedChip === chip.id;
                return (
                  <div key={chip.id}>
                    <div className={`relative flex min-h-[52px] rounded-xl border-2 overflow-hidden transition-colors ${
                      active ? 'bg-red-500 border-red-500' : 'bg-white border-slate-200 hover:border-red-200 hover:bg-red-50'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleAbsolute(chip.id)}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none"
                      >
                        <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedChip(expanded ? null : chip.id)}
                        className={`px-2 flex items-center shrink-0 focus-visible:outline-none ${active ? 'text-red-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden />
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
            <p className="text-[11px] font-bold uppercase tracking-wider text-amber-600 mb-2">Consider — Relative</p>
            <div className="grid grid-cols-2 gap-2">
              {RELATIVE_CHIPS.map((chip) => {
                const active = !!relativeContraindications[chip.id];
                const expanded = expandedChip === chip.id;
                return (
                  <div key={chip.id}>
                    <div className={`relative flex min-h-[52px] rounded-xl border-2 overflow-hidden transition-colors ${
                      active ? 'bg-amber-500 border-amber-500' : 'bg-white border-slate-200 hover:border-amber-200 hover:bg-amber-50'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleRelative(chip.id)}
                        className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none"
                      >
                        <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setExpandedChip(expanded ? null : chip.id)}
                        className={`px-2 flex items-center shrink-0 focus-visible:outline-none ${active ? 'text-amber-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                        aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                      >
                        <Info className="w-3.5 h-3.5" aria-hidden />
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

          {/* ── 3–4.5h window extras — interactive chips (HIGH-04 fix) ── */}
          {showExtendedSection ? (
            <section className="rounded-xl border-2 border-amber-300 bg-amber-50 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-amber-200">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700">3–4.5h Window — Additional Exclusions</span>
                <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-100 border border-amber-200 rounded-full px-2 py-0.5">Active window</span>
              </div>
              <div className="px-4 pb-4 pt-3">
                <p className="text-xs text-amber-700 mb-3">LKW is in the 3–4.5h window. These ALSO exclude the patient — tap if present:</p>
                <div className="grid grid-cols-2 gap-2">
                  {EXTENDED_WINDOW_CHIPS.map((chip) => {
                    const active = !!extendedContraindications[chip.id];
                    const expanded = expandedChip === chip.id;
                    return (
                      <div key={chip.id}>
                        <div className={`relative flex min-h-[52px] rounded-xl border-2 overflow-hidden transition-colors ${
                          active ? 'bg-amber-600 border-amber-600' : 'bg-white border-amber-200 hover:border-amber-400 hover:bg-amber-50'
                        }`}>
                          <button
                            type="button"
                            onClick={() => setExtendedContraindications(prev => ({ ...prev, [chip.id]: !prev[chip.id] }))}
                            className="flex-1 px-3 py-2.5 text-sm font-semibold text-left leading-snug focus-visible:outline-none"
                          >
                            <span className={active ? 'text-white' : 'text-slate-700'}>{chip.label}</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedChip(expanded ? null : chip.id)}
                            className={`px-2 flex items-center shrink-0 focus-visible:outline-none ${active ? 'text-amber-100 hover:text-white' : 'text-slate-300 hover:text-slate-500'}`}
                            aria-label={`${expanded ? 'Hide' : 'Show'} details for ${chip.label}`}
                          >
                            <Info className="w-3.5 h-3.5" aria-hidden />
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
              </div>
            </section>
          ) : (
            <details className="group rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
              <summary className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-amber-700 cursor-pointer hover:bg-amber-100/60 transition-colors list-none">
                <ChevronDown className="w-3.5 h-3.5 text-amber-500 group-open:rotate-180 transition-transform shrink-0" aria-hidden />
                3–4.5h Window — Additional Exclusions
              </summary>
              <div className="px-4 pb-4 pt-1 space-y-2.5">
                <p className="text-xs text-amber-700">If treating in the 3–4.5h window, these ALSO exclude the patient:</p>
                {EXTENDED_WINDOW_CHIPS.map((chip) => (
                  <div key={chip.id} className="text-sm">
                    <span className="font-semibold text-amber-900">• {chip.label}</span>
                    <span className="text-amber-700 ml-1 text-xs">— {chip.detail}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* ── Notes (collapsed) ── */}
          <details className="group rounded-xl border border-slate-200 overflow-hidden">
            <summary className="flex items-center gap-2 px-4 py-3 text-xs font-bold uppercase tracking-wider text-slate-500 cursor-pointer hover:bg-slate-50 transition-colors list-none">
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

        {/* Footer */}
        <div className="px-4 py-3 border-t border-slate-100 bg-white flex items-center justify-between gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={handleCopyToEMR}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copiedToClipboard ? 'Copied!' : 'Copy to EMR'}
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              {onComplete ? 'Cancel' : 'Close'}
            </button>
            {onComplete && (
              <button
                type="button"
                onClick={handleComplete}
                className="px-4 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
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
