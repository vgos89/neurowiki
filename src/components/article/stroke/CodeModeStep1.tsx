import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Check, AlertTriangle, XCircle } from 'lucide-react';
import { getTNKDose, getTpaDoses, toKg } from '../../../utils/strokeDosing';
import {
  PatientContextPanel,
  EMPTY_PATIENT_CONTEXT,
  type PatientContextValues,
} from '../../shared/PatientContextPanel';

export interface CodeModeStep1Props {
  onComplete: (data: Step1Data) => void;
  onOpenNIHSS: () => void;
  onOpenEligibility?: () => void;
  /** Opens the Extended IVT pathway as a modal — used when LKW > 4.5h
   *  ago or unknown (potential wake-up stroke). Wired by the parent
   *  StrokeBasicsWorkflowV2; CodeModeStep1 only triggers, doesn't own
   *  the modal state. */
  onOpenExtendedIVT?: () => void;
  nihssScoreFromModal?: number | null;
}

export interface Step1Data {
  lkwHours: number;
  lkwUnknown?: boolean;
  lkwTimestamp?: Date | null;
  symptomDiscoveryTime?: Date | null;
  nihssScore: number;
  systolicBP: number;
  diastolicBP: number;
  glucose: number;
  weightValue: number;
  weightUnit: 'kg' | 'lbs';
  bpControlled: boolean;
  eligibilityChecked: boolean;
  lowGlucoseGuidanceViewed?: boolean;
}

export const CodeModeStep1: React.FC<CodeModeStep1Props> = ({
  onComplete,
  onOpenNIHSS,
  onOpenEligibility,
  onOpenExtendedIVT,
  nihssScoreFromModal,
}) => {
  // Patient context — LKW + BP + Glucose + Anticoag — now lives in a single
  // shared PatientContextPanel (arch-PR-stroke-code-patient-context.md
  // 2026-05-24). Anticoag is captured but does not feed the Step 1
  // completion gate; it surfaces in EMR copy and downstream eligibility.
  const [patientContext, setPatientContext] = useState<PatientContextValues>({
    ...EMPTY_PATIENT_CONTEXT,
  });

  const [nihssScore, setNihssScore] = useState<number>(0);
  const [weightValue, setWeightValue] = useState<number>(0);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [bpControlled, setBpControlled] = useState(false);
  const [lowGlucoseGuidanceViewed, setLowGlucoseGuidanceViewed] = useState(false);

  // Derived from patientContext — see arch review rubric 4 (state locality):
  // do NOT introduce a second synchronized state for these.
  const lkwEntered = patientContext.lkw !== undefined;
  const lkwUnknown = patientContext.lkw === null;
  const lkwDate = useMemo(
    () => (patientContext.lkw instanceof Date ? patientContext.lkw : new Date()),
    [patientContext.lkw],
  );
  const systolicBP = useMemo(() => parseInt(patientContext.systolic, 10) || 0, [patientContext.systolic]);
  const diastolicBP = useMemo(() => parseInt(patientContext.diastolic, 10) || 0, [patientContext.diastolic]);
  const glucose = useMemo(() => parseInt(patientContext.glucose, 10) || 0, [patientContext.glucose]);

  // Re-derive lkwHours per render. Wall-clock dependency means the value
  // refreshes on every state change (good enough for clinician UX; not
  // worth a setInterval).
  const lkwHours = useMemo(() => {
    if (lkwUnknown || !lkwEntered) return 0;
    const now = new Date();
    return Math.max(0, (now.getTime() - lkwDate.getTime()) / (1000 * 60 * 60));
  }, [lkwUnknown, lkwEntered, lkwDate]);

  const [disablingSymptoms, setDisablingSymptoms] = useState<Record<string, boolean>>({
    aphasia: false,
    hemianopia: false,
    truncalAtaxia: false,
    dysphagia: false,
    handWeakness: false,
  });

  useEffect(() => {
    if (nihssScoreFromModal != null) setNihssScore(nihssScoreFromModal);
  }, [nihssScoreFromModal]);

  // Shared dosing util — MED-02 (DRY)
  const weightKg = useMemo(
    () => (weightValue === 0 ? 0 : toKg(weightValue, weightUnit)),
    [weightValue, weightUnit]
  );

  const { total: tpaDose, bolus: tpaBolus, infusion: tpaInfusion } = useMemo(
    () => getTpaDoses(weightKg),
    [weightKg]
  );

  const tnkDose = useMemo(() => getTNKDose(weightKg), [weightKg]);

  const withinTPAWindow = lkwEntered && !lkwUnknown && lkwHours <= 4.5;
  // Outside the thrombolytic window (LKW > 9h). Beyond this point, neither
  // standard nor extended IVT is supported — weight is no longer required
  // because no thrombolytic dose will be computed (per V direction 2026-05-17).
  const outsideThromboWindow = lkwEntered && !lkwUnknown && lkwHours > 9;
  const showDisablingSymptomsChecklist = withinTPAWindow && nihssScore >= 1 && nihssScore <= 5 && !lkwUnknown;
  const hasDisablingSymptom = Object.values(disablingSymptoms).some(Boolean);

  const bpTooHigh = withinTPAWindow
    ? (systolicBP > 185 || diastolicBP > 110)
    : (systolicBP > 220 || diastolicBP > 120);
  const glucoseLow = glucose > 0 && glucose < 50;
  const glucoseHigh = glucose > 400;

  const isComplete =
    lkwEntered &&
    nihssScore > 0 &&
    systolicBP > 0 &&
    diastolicBP > 0 &&
    glucose > 0 &&
    (outsideThromboWindow || weightValue > 0) &&
    (!bpTooHigh || bpControlled || lkwUnknown);

  const missingFields: string[] = [];
  if (!lkwEntered) missingFields.push('LKW time');
  if (nihssScore <= 0) missingFields.push('NIHSS');
  if (systolicBP <= 0 || diastolicBP <= 0) missingFields.push('BP');
  if (glucose <= 0) missingFields.push('Glucose');
  if (weightValue <= 0 && !outsideThromboWindow) missingFields.push('Weight');

  const handleComplete = () => {
    if (!isComplete) return;
    const lkwTimestamp = lkwUnknown ? null : lkwDate;
    onComplete({
      lkwHours,
      lkwUnknown,
      lkwTimestamp: lkwTimestamp ?? undefined,
      symptomDiscoveryTime: lkwTimestamp ?? undefined,
      nihssScore,
      systolicBP,
      diastolicBP,
      glucose,
      weightValue,
      weightUnit,
      bpControlled,
      eligibilityChecked: false, // BUG-04 fix: parent sets this true only after modal is actually completed
      lowGlucoseGuidanceViewed: glucoseLow ? lowGlucoseGuidanceViewed : undefined,
    });
  };

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const WindowBadge: React.FC = () => {
    if (!lkwEntered || lkwUnknown) return null;
    if (lkwHours <= 4.5)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">
          <Check size={14} aria-hidden="true" />
          Within 4.5h
        </span>
      );
    if (lkwHours <= 9)
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">
          <AlertTriangle size={14} aria-hidden="true" />
          Extended window
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5">
        <XCircle size={14} aria-hidden="true" />
        Outside tPA window
      </span>
    );
  };

  return (
    <div className="space-y-3 px-1">

      {/* ── Patient Info (LKW + BP + Glucose + Anticoag) ──
          Replaces the chunky stacked LKW + Vitals cards with the shared
          PatientContextPanel chassis (also used by the NIHSS calculator).
          Per arch-PR-stroke-code-patient-context.md 2026-05-24:
          - panel renders pure layout
          - WindowBadge, BP-too-high alert, glucose callouts, and the
            LKW-Unknown wake-up notice live as siblings BELOW the panel
            and read from patientContext state (single source of truth)
          - defaultExpanded=true because for Stroke Code the context is
            required input (not optional like in the NIHSS calc) */}
      <PatientContextPanel
        values={patientContext}
        onChange={setPatientContext}
        label="Patient info"
        defaultExpanded
      />

      {/* WindowBadge — sibling, reads patientContext.lkw via derived
          lkwEntered/lkwHours. Renders the same green/amber/rose chip
          that used to live inside the LKW card. */}
      {lkwEntered && !lkwUnknown && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-slate-400">~{lkwHours.toFixed(1)}h since LKW</span>
          <WindowBadge />
        </div>
      )}

      {/* LKW Unknown — wake-up / unknown-onset notice. Sibling
          alert, conditional on lkwUnknown. */}
      {lkwUnknown && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Wake-up / unknown onset</p>
          <p className="text-xs text-amber-600">Consider MRI DWI-FLAIR mismatch for late-window eligibility.</p>
        </div>
      )}

      {/* BP Alert — sibling, conditional on bpTooHigh. Carries the
          treatment guidance + bpControlled checkbox + AHA citation
          (text preserved verbatim — changing it reclassifies to
          D-clinical per arch review condition #8). */}
      {bpTooHigh && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 space-y-2">
          <p className="text-xs font-bold text-red-800">BP must be &lt;185/110 mmHg before tPA</p>
          <p className="text-xs text-slate-700">
            <strong>Labetalol</strong> 10–20 mg IV push, repeat q10–20 min (max 300 mg)
            &nbsp;·&nbsp;
            <strong>Nicardipine</strong> 5 mg/hr, ↑2.5 mg/hr q5–15 min (max 15 mg/hr)
          </p>
          <p className="text-[10px] text-red-600">AHA/ASA 2026 §4.3 (BP before IV thrombolysis)</p>
          <label className="flex items-center gap-2 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={bpControlled}
              onChange={(e) => setBpControlled(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-neuro-600 flex-shrink-0"
            />
            <span className="text-xs text-slate-700 font-medium">BP being controlled / treated</span>
          </label>
        </div>
      )}

      {/* Glucose guidance — sibling, conditional on glucoseLow.
          Text preserved verbatim per arch review condition #8. */}
      {glucoseLow && (
        <div className="rounded-xl px-3 py-2.5 bg-amber-50 border border-amber-200">
          <button
            type="button"
            onClick={() => setLowGlucoseGuidanceViewed(true)}
            className="text-xs font-semibold text-amber-700 hover:underline text-left"
          >
            AHA: treat hypoglycemia, then reassess for tPA →
          </button>
          {lowGlucoseGuidanceViewed && (
            <p className="mt-1.5 text-xs text-amber-800">Give D50 50 mL IV, recheck glucose. If symptoms persist after normoglycemia, reassess for tPA.</p>
          )}
        </div>
      )}

      {/* Glucose high — sibling, conditional on glucoseHigh. */}
      {glucoseHigh && (
        <div className="rounded-xl px-3 py-2.5 bg-red-50 border border-red-200">
          <p className="text-xs font-semibold text-red-700">Glucose &gt;400 mg/dL — verify and document; severe hyperglycemia worsens stroke outcomes.</p>
        </div>
      )}

      {/* ── NIHSS Section ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">NIHSS</p>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <span className="text-4xl font-semibold text-slate-900 tabular-nums">
              {nihssScore > 0 ? nihssScore : '—'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            {nihssScore > 0 && (
              <>
                <p className="text-sm font-semibold text-slate-900">
                  {nihssScore <= 4 ? 'Minor' : nihssScore <= 10 ? 'Moderate' : nihssScore <= 20 ? 'Moderate-severe' : 'Severe'}
                </p>
                <p className="text-xs text-slate-400">
                  LVO probability {nihssScore >= 10 ? '≥50%' : nihssScore >= 6 ? '~35%' : '<20%'}
                </p>
              </>
            )}
            {nihssScore === 0 && (
              <p className="text-xs text-slate-400">Tap Calc to score</p>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <input
              type="text" inputMode="numeric" min={0} max={42}
              value={nihssScore || ''}
              onChange={(e) => setNihssScore(clamp(parseInt(e.target.value, 10) || 0, 0, 42))}
              onFocus={(e) => e.target.select()}
              placeholder="—"
              className="w-12 min-h-[44px] px-1 py-2 rounded-lg border border-slate-200 text-slate-900 text-sm font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
            />
            <button
              type="button"
              onClick={onOpenNIHSS}
              className="min-h-[44px] px-3 py-2 text-xs font-semibold text-neuro-600 rounded-lg border border-neuro-200 bg-neuro-50 hover:bg-neuro-100 transition-colors"
            >
              Calc
            </button>
          </div>
        </div>
      </div>

      {/* ── Weight + Dosing Section ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Weight & Dosing</p>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text" inputMode="decimal" min={0}
            value={weightValue || ''}
            onChange={(e) => setWeightValue(parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="—"
            className="w-24 min-h-[44px] px-2 py-2 rounded-lg border border-slate-200 text-slate-900 text-xl font-semibold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
          />
          <select
            value={weightUnit}
            onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
            className="min-h-[44px] px-2 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium bg-white"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
          {weightKg > 0 && (
            <span className="text-xs text-slate-400 ml-1">— tap to edit</span>
          )}
        </div>

        {weightKg > 0 && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-lg bg-neuro-50 border border-neuro-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-500 mb-1">tPA</p>
                <p className="text-base font-semibold text-neuro-700">{tpaDose} mg</p>
                <p className="text-[10px] text-neuro-500">{tpaBolus} bolus + {tpaInfusion} inf</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-1">TNK</p>
                <p className="text-base font-semibold text-emerald-700">{tnkDose} mg</p>
                <p className="text-[10px] text-emerald-500">Single bolus</p>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 italic mt-1">Reference only — verify against institutional protocol before administration.</p>
          </>
        )}
      </div>

      {/* ── Disabling symptoms ── */}
      {showDisablingSymptomsChecklist && (
        <div className="rounded-xl p-4 bg-amber-50 border border-amber-200 space-y-3">
          <div>
            <p className="text-sm font-bold text-amber-900">Low NIHSS — assess for disabling symptoms (AHA)</p>
            <p className="text-xs text-amber-700 mt-0.5">Check any that are present. If so, consider TNK after discussing risk/benefit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
            {[
              { key: 'aphasia', label: 'Aphasia' },
              { key: 'hemianopia', label: 'Hemianopia' },
              { key: 'truncalAtaxia', label: 'Truncal ataxia (walk the patient)' },
              { key: 'dysphagia', label: 'Dysphagia' },
              { key: 'handWeakness', label: 'Hand weakness affecting livelihood' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer min-h-[44px] py-0.5">
                <input
                  type="checkbox"
                  checked={disablingSymptoms[key as keyof typeof disablingSymptoms] || false}
                  onChange={(e) => setDisablingSymptoms(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-neuro-600 flex-shrink-0"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
          {hasDisablingSymptom && (
            <p className="text-sm font-semibold text-amber-900">→ Consider TNK after discussing risk/benefit with patient and team.</p>
          )}
          {/* Non-disabling branch — AHA/ASA 2026 §4.6.1 + §4.8. Added
              2026-05-23 per audit BLOCKING stroke-code-minor-non-disabling-
              branch. When the clinician has worked through the disabling
              checklist and found NO disabling symptoms, route to DAPT as
              the appropriate alternative (COR 1, LOE A vs COR 3 No
              Benefit for IVT in this stratum). The chip is rendered
              alongside the existing TNK chip so both forks are visible
              and the clinician sees the explicit decision rather than
              defaulting to IVT. */}
          {!hasDisablingSymptom && nihssScore <= 3 && (
            <div className="border-t border-amber-200 pt-3 space-y-2">
              <p className="text-sm font-semibold text-amber-900">
                → No disabling deficit present? DAPT is the recommended pathway.
              </p>
              <p className="text-xs text-amber-700 leading-snug">
                AHA/ASA 2026 §4.6.1 (COR 3 No Benefit) advises against routine IVT in mild non-disabling deficits within 4.5h. §4.8 (COR 1, LOE A) recommends DAPT (aspirin + clopidogrel × 21 days) within 24h for NIHSS ≤3 noncardioembolic AIS — CHANCE, POINT, INSPIRES.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Extended IVT cross-link ──
          Surfaces when LKW is past the standard 4.5h tPA window OR is unknown
          (potential wake-up stroke). Routes clinician to the dedicated Extended
          IVT pathway, which carries the WAKE-UP / EXTEND / TRACE-III decision
          trees for 4.5h–9h windows and the DWI-FLAIR mismatch path. Added
          2026-05-17 per V direction. */}
      {lkwEntered && (lkwUnknown || lkwHours > 4.5) && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 mb-1">
            Extended-window IVT
          </p>
          <p className="text-sm text-slate-700 mb-3 leading-snug">
            {lkwUnknown
              ? 'LKW unknown — if patient woke with symptoms, they may qualify for thrombolysis using DWI-FLAIR mismatch criteria.'
              : lkwHours <= 24
              ? `LKW is ${lkwHours.toFixed(1)}h ago — past the standard 4.5h window. Patient may qualify for extended-window thrombolysis (4.5h–9h) or late-window options (9h–24h).`
              : `LKW is ${lkwHours.toFixed(1)}h ago — beyond standard thrombolysis windows. Confirm late-window options against current AHA/ASA guidance.`}
          </p>
          <button
            type="button"
            onClick={() => onOpenExtendedIVT?.()}
            disabled={!onOpenExtendedIVT}
            className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 bg-neuro-500 hover:bg-neuro-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
          >
            Open Extended IVT Pathway
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        </div>
      )}

      {/* ── CTA ── */}
      <div className="space-y-2">
        {withinTPAWindow && isComplete && onOpenEligibility ? (
          <button
            type="button"
            onClick={() => { handleComplete(); onOpenEligibility(); }}
            className="w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl transition-all text-sm"
          >
            Check tPA Eligibility →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isComplete}
            className="w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
          >
            {isComplete ? 'Save & Continue →' : `Still needed: ${missingFields.join(' · ')}`}
          </button>
        )}
      </div>

      {/* LKWTimePicker is now owned by the PatientContextPanel above.
          The Stroke-Code-specific sleep-onset cross-link to Extended IVT
          pathway is preserved via the "Extended-window IVT" sibling
          block earlier in this render (triggers on lkwUnknown ||
          lkwHours > 4.5). */}
    </div>
  );
};
