import React, { useState, useMemo, useEffect } from 'react';
import { ArrowRight, Check, AlertTriangle, XCircle } from 'lucide-react';
import { getTNKDose, getTpaDoses, toKg } from '../../../utils/strokeDosing';
import {
  PatientContextPanel,
  EMPTY_PATIENT_CONTEXT,
  type PatientContextValues,
  type PatientContextRow,
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
  /** Whether the IV tPA eligibility checklist has been completed.
   *  Parent (StrokeBasicsWorkflowV2) sets this to true after the
   *  user clicks "Save & Return" inside the eligibility modal.
   *  When in the tPA window, Save & Continue is gated on this:
   *  the CTA shows "Check tPA Eligibility" first (opens modal only,
   *  no Step 1 save) and only transforms to "Save & Continue" once
   *  the checklist has been completed. Closes the BL-1 patient-
   *  safety gap from the 2026-05-24 UX audit. */
  eligibilityChecked?: boolean;
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
  eligibilityChecked = false,
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

  // H-2 fix (UX audit 2026-05-24): weight is only required when a
  // thrombolytic dose will actually be computed. DAPT-path patients
  // (NIHSS ≤3 + within tPA window + no disabling symptoms checked)
  // are headed to aspirin+clopidogrel, not tPA/TNK — forcing a
  // weight entry is meaningless data tax. Same logic for outside-
  // thrombolytic-window patients (already accommodated).
  const onDaptPath = withinTPAWindow && nihssScore >= 1 && nihssScore <= 3 && !hasDisablingSymptom;
  const weightRequired = !outsideThromboWindow && !onDaptPath;

  const isComplete =
    lkwEntered &&
    nihssScore > 0 &&
    systolicBP > 0 &&
    diastolicBP > 0 &&
    glucose > 0 &&
    (!weightRequired || weightValue > 0) &&
    (!bpTooHigh || bpControlled || lkwUnknown);

  const missingFields: string[] = [];
  if (!lkwEntered) missingFields.push('LKW time');
  if (nihssScore <= 0) missingFields.push('NIHSS');
  if (systolicBP <= 0 || diastolicBP <= 0) missingFields.push('BP');
  if (glucose <= 0) missingFields.push('Glucose');
  if (weightValue <= 0 && weightRequired) missingFields.push('Weight');

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
    if (lkwHours <= 4.5) {
      // M-1 fix (UX audit 2026-05-24): show a countdown when the
      // remaining tPA window is < 30 min so the resident does not
      // lose time in EMR and cross the boundary unnoticed.
      const minutesLeft = Math.max(0, Math.round((4.5 - lkwHours) * 60));
      const isLastHalfHour = minutesLeft <= 30;
      return (
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-0.5 border ${
            isLastHalfHour
              ? 'text-amber-700 bg-amber-50 border-amber-200'
              : 'text-emerald-700 bg-emerald-50 border-emerald-200'
          }`}
          aria-label={isLastHalfHour ? `Only ${minutesLeft} minutes left in tPA window` : `Within 4.5 hour tPA window`}
        >
          {isLastHalfHour ? (
            <AlertTriangle size={14} aria-hidden="true" />
          ) : (
            <Check size={14} aria-hidden="true" />
          )}
          {isLastHalfHour ? `${minutesLeft} min left` : 'Within 4.5h'}
        </span>
      );
    }
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

  // NIHSS + Weight as panel extra-rows. Per V request 2026-05-24:
  // these no longer warrant their own chunky cards; they live inline in
  // the Patient Info dropdown alongside LKW/BP/Glucose/Anticoag. The
  // tPA/TNK dose-display chips are lifted OUT of the Weight card to
  // a sibling block below the panel (only renders when weightKg > 0).
  const nihssSeverity =
    nihssScore <= 4 ? 'Minor'
    : nihssScore <= 10 ? 'Moderate'
    : nihssScore <= 20 ? 'Moderate-severe'
    : 'Severe';
  const nihssLvoProb =
    nihssScore >= 10 ? '≥50%'
    : nihssScore >= 6 ? '~35%'
    : '<20%';

  const extraRows: PatientContextRow[] = [
    {
      id: 'nihss',
      label: 'NIHSS',
      input: (
        <>
          <input
            type="text"
            inputMode="numeric"
            min={0}
            max={42}
            value={nihssScore || ''}
            onChange={(e) => setNihssScore(clamp(parseInt(e.target.value, 10) || 0, 0, 42))}
            onFocus={(e) => e.target.select()}
            placeholder="—"
            aria-label="NIHSS score"
            className="w-12 text-right text-sm font-semibold text-slate-900 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none px-1 py-1 placeholder:text-slate-300"
          />
          <button
            type="button"
            onClick={onOpenNIHSS}
            className="min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border border-neuro-200 bg-neuro-50 text-neuro-700 hover:bg-neuro-100 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Open NIHSS calculator"
          >
            Calc
          </button>
        </>
      ),
      helpText: nihssScore > 0
        ? `${nihssSeverity} · LVO probability ${nihssLvoProb}`
        : 'Tap Calc to score',
    },
    {
      id: 'weight',
      label: 'Weight',
      input: (
        <>
          <input
            type="text"
            inputMode="decimal"
            min={0}
            value={weightValue || ''}
            onChange={(e) => setWeightValue(parseFloat(e.target.value) || 0)}
            onFocus={(e) => e.target.select()}
            placeholder="—"
            aria-label="Weight"
            className="w-16 text-right text-sm text-slate-900 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none px-1 py-1 placeholder:text-slate-300"
          />
          <select
            value={weightUnit}
            onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
            aria-label="Weight unit"
            className="text-xs font-medium text-slate-600 bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none py-1 px-1"
          >
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </>
      ),
    },
  ];

  return (
    <div className="space-y-3 px-1">

      {/* ── Patient Info (LKW + BP + Glucose + Anticoag + NIHSS + Weight) ──
          Replaces the chunky stacked cards (LKW + Vitals + NIHSS +
          Weight) with the shared PatientContextPanel chassis. Per
          arch-PR-stroke-code-patient-context.md 2026-05-24 and V
          follow-up 2026-05-24:
          - panel renders pure layout
          - WindowBadge, BP-too-high alert, glucose callouts, the
            LKW-Unknown wake-up notice, and the computed-dosing card
            live as siblings BELOW the panel and read from
            patientContext / extraRow state (single source of truth)
          - defaultExpanded=true because for Stroke Code the context is
            required input (not optional like in the NIHSS calc)
          - NIHSS and Weight are extraRows so they share the same 44px
            row chrome as LKW/BP/Glucose/Anticoag instead of their own
            chunky cards (V request 2026-05-24) */}
      <PatientContextPanel
        values={patientContext}
        onChange={setPatientContext}
        label="Patient info"
        defaultExpanded
        lockExpanded
        extraRows={extraRows}
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

      {/* Sibling alert blocks — all four use the same chassis as the
          PatientContextPanel above: rounded-xl white card with a tinted
          eyebrow header and a white body. Semantic color (amber/red)
          telegraphs severity without flooding the whole card. Clinical
          text preserved verbatim per arch review condition #8. */}

      {/* LKW Unknown — wake-up / unknown-onset notice.
          BL-4 fix: role="alert" so screen readers announce when the
          state changes (e.g., clinician toggles LKW Unknown checkbox). */}
      {lkwUnknown && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden" role="alert">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Wake-up / Unknown Onset</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-700">Consider MRI DWI-FLAIR mismatch for late-window eligibility.</p>
          </div>
        </div>
      )}

      {/* BP-above-tPA-limit alert + treatment guidance + controlled checkbox + AHA citation. */}
      {bpTooHigh && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden" role="alert">
          <div className="px-4 py-2 bg-red-50 border-b border-red-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">BP Above tPA Limit</p>
          </div>
          <div className="px-4 py-3 space-y-2">
            <p className="text-xs font-semibold text-slate-900">BP must be &lt;185/110 mmHg before tPA</p>
            <p className="text-xs text-slate-700">
              <strong>Labetalol</strong> 10–20 mg IV push, repeat q10–20 min (max 300 mg)
              &nbsp;·&nbsp;
              <strong>Nicardipine</strong> 5 mg/hr, ↑2.5 mg/hr q5–15 min (max 15 mg/hr)
            </p>
            <p className="text-[10px] text-slate-500">AHA/ASA 2026 §4.3 (BP before IV thrombolysis)</p>
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
        </div>
      )}

      {/* Hypoglycemia alert with progressive disclosure for the D50 treatment text. */}
      {glucoseLow && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden" role="alert">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Hypoglycemia</p>
          </div>
          <div className="px-4 py-3">
            <button
              type="button"
              onClick={() => setLowGlucoseGuidanceViewed(true)}
              className="text-xs font-semibold text-amber-700 hover:underline text-left"
            >
              AHA: treat hypoglycemia, then reassess for tPA →
            </button>
            {lowGlucoseGuidanceViewed && (
              <p className="mt-1.5 text-xs text-slate-700">Give D50 50 mL IV, recheck glucose. If symptoms persist after normoglycemia, reassess for tPA.</p>
            )}
          </div>
        </div>
      )}

      {/* Severe hyperglycemia notice. */}
      {glucoseHigh && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden" role="alert">
          <div className="px-4 py-2 bg-red-50 border-b border-red-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-700">Severe Hyperglycemia</p>
          </div>
          <div className="px-4 py-3">
            <p className="text-xs text-slate-700">Glucose &gt;400 mg/dL. Verify and document; severe hyperglycemia worsens stroke outcomes.</p>
          </div>
        </div>
      )}

      {/* Computed Dosing — sibling block, renders only when weightKg > 0.
          Lifted out of the old Weight & Dosing card per V request
          2026-05-24 so that Weight itself can be a 44px inline row in
          the Patient Info dropdown. The tPA/TNK chips keep their
          neuro/emerald color treatment because dose values are
          high-stakes information the clinician needs to read at a
          glance. "Reference only" footer text preserved verbatim per
          arch review condition #8. */}
      {weightKg > 0 && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Computed Dosing</p>
          </div>
          <div className="px-4 py-3 space-y-2">
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
            <p className="text-[10px] text-slate-400 italic">Reference only — verify against institutional protocol before administration.</p>
          </div>
        </div>
      )}

      {/* ── Disabling symptoms — chassis-aligned 2026-05-24 ──
          Tinted amber header + white body. Clinical wording (AHA §4.6.1
          + §4.8 citation, CHANCE/POINT/INSPIRES list, "Consider TNK"
          line, "DAPT is the recommended pathway" line) preserved
          verbatim per arch review condition #8. Non-disabling branch
          context unchanged from 2026-05-23 implementation.
          UX-audit H-7 fix: AlertTriangle icon + "Decision Required"
          badge in the header bar to telegraph that this is a required
          clinical decision, not an info alert. */}
      {showDisablingSymptomsChecklist && (
        <div className="rounded-xl bg-white border border-amber-200 overflow-hidden ring-1 ring-amber-100">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" aria-hidden="true" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700 truncate">Low NIHSS · Assess for Disabling Symptoms (AHA)</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-white bg-amber-600 rounded-full px-2 py-0.5 flex-shrink-0">Decision</span>
          </div>
          <div className="px-4 py-3 space-y-3">
            {/* M-10 fix (UX audit 2026-05-24): fieldset + legend gives
                screen readers the group context they need before
                reading each individual checkbox. */}
            <fieldset>
              <legend className="text-xs text-slate-700 mb-1">Check any disabling symptom present. If so, consider TNK after discussing risk/benefit.</legend>
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
            </fieldset>
            {hasDisablingSymptom && (
              <p className="text-sm font-semibold text-slate-900">→ Consider TNK after discussing risk/benefit with patient and team.</p>
            )}
            {!hasDisablingSymptom && nihssScore <= 3 && (
              <div className="border-t border-slate-100 pt-3 space-y-2">
                <p className="text-sm font-semibold text-slate-900">
                  → No disabling deficit present? DAPT is the recommended pathway.
                </p>
                <p className="text-xs text-slate-600 leading-snug">
                  AHA/ASA 2026 §4.6.1 (COR 3 No Benefit) advises against routine IVT in mild non-disabling deficits within 4.5h. §4.8 (COR 1, LOE A) recommends DAPT (aspirin + clopidogrel × 21 days) within 24h for NIHSS ≤3 noncardioembolic AIS — CHANCE, POINT, INSPIRES.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Extended IVT cross-link — chassis-aligned 2026-05-24 ──
          Surfaces when LKW is past the standard 4.5h tPA window OR is
          unknown (potential wake-up stroke). Routes the clinician to
          the dedicated Extended IVT pathway, which carries the WAKE-UP
          / EXTEND / TRACE-III decision trees for 4.5h–9h windows and
          the DWI-FLAIR mismatch path. Added 2026-05-17 per V direction;
          chassis-aligned per V follow-up 2026-05-24. */}
      {lkwEntered && (lkwUnknown || lkwHours > 4.5) && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Extended-Window IVT</p>
          </div>
          <div className="px-4 py-3 space-y-3">
            <p className="text-sm text-slate-700 leading-snug">
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
        </div>
      )}

      {/* ── CTA — BL-1 fix (UX audit 2026-05-24) ──
          When in the tPA window the eligibility check must be the
          gate before advance, not a side-effect of advance. Click on
          "Check tPA Eligibility" opens the modal only — it does NOT
          save Step 1 or advance to Step 2. Once the eligibility
          modal completes (user taps Save & Return inside), parent
          flips `eligibilityChecked` to true and this CTA transforms
          to "Save & Continue". Outside the tPA window, the eligibility
          step is irrelevant so we go straight to Save & Continue. */}
      <div className="space-y-2">
        {withinTPAWindow && isComplete && onOpenEligibility && !eligibilityChecked ? (
          <button
            type="button"
            onClick={() => onOpenEligibility()}
            className="w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-xl transition-all text-sm focus-visible:ring-2 focus-visible:ring-neuro-700 focus-visible:outline-none"
            aria-label="Check tPA eligibility"
          >
            Check tPA Eligibility <span aria-hidden="true">→</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isComplete}
            className="w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm focus-visible:ring-2 focus-visible:ring-neuro-700 focus-visible:outline-none"
            aria-label={isComplete ? 'Save and continue to Step 2' : `Still needed: ${missingFields.join(', ')}`}
          >
            {isComplete ? (
              <>Save &amp; Continue <span aria-hidden="true">→</span></>
            ) : (
              `Still needed: ${missingFields.join(' · ')}`
            )}
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
