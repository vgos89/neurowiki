import React, { useState, useMemo } from 'react';
import { AlertTriangle, ExternalLink, FlaskConical } from 'lucide-react';
import type { Step1Data } from './CodeModeStep1';
import type { ThrombolysisEligibilityData } from './ThrombolysisEligibilityModal';
import { getTNKDose, getTpaDoses, toKg } from '../../../utils/strokeDosing';

export interface Step2Data {
  ctResult: string; // 'no-bleed' | 'bleed' (ICH) | 'other'
  treatmentGiven?: string; // 'tpa' | 'tnk' | 'none'
  tnkDose?: number;
  tpaDose?: number;
  ctaOrdered?: boolean;
  thrombectomyPlan?: string; // 'yes' | 'no' | 'pending'
  lvoPresent?: boolean | null;
}

interface CodeModeStep2Props {
  step1Data: Step1Data;
  onComplete: (data: Step2Data) => void;
  onOpenEVTPathway?: () => void;
  /** When set, show mandatory prompts: absolute → do not give TNK; relative → discuss risk vs benefits */
  eligibilityResult?: ThrombolysisEligibilityData | null;
  /** Called when user selects "ICH detected"; e.g. open hemorrhage protocol modal */
  onIchSelected?: () => void;
  /** Opens the tPA eligibility modal without navigating away */
  onOpenEligibility?: () => void;
  /** Called when user clicks "Stamp CT Read Time" — parent wires to TimestampBubble */
  onCtReadStamped?: () => void;
}

export const CodeModeStep2: React.FC<CodeModeStep2Props> = ({
  step1Data,
  onComplete,
  onOpenEVTPathway,
  eligibilityResult = null,
  onIchSelected,
  onOpenEligibility,
  onCtReadStamped,
}) => {
  const [ctResult, setCtResult] = useState<string>('');
  const [treatmentGiven, setTreatmentGiven] = useState<string>('');
  const [ctaOrdered, setCtaOrdered] = useState(false);
  const [lvoPresent, setLvoPresent] = useState<string>(''); // 'yes' | 'no' | 'pending'
  const [ctReadStamped, setCtReadStamped] = useState(false);

  // Pre-fill doses from Step 1 weight (shared dosing util — MED-02)
  const weightKg = useMemo(
    () => (step1Data?.weightValue ? toKg(step1Data.weightValue, step1Data.weightUnit) : 0),
    [step1Data?.weightValue, step1Data?.weightUnit]
  );

  const { total: tpaDose, bolus: tpaBolus, infusion: tpaInfusion } = useMemo(
    () => (weightKg > 0 ? getTpaDoses(weightKg) : { total: 0, bolus: 0, infusion: 0 }),
    [weightKg]
  );

  const tnkDose = useMemo(() => (weightKg > 0 ? getTNKDose(weightKg) : 0), [weightKg]);

  // Outside thrombolytic window (LKW > 9h, not unknown). Neither standard
  // nor extended IVT is supported beyond this point — surface "Not indicated"
  // in the treatment-decision card instead of dosing (per V direction
  // 2026-05-17). The buttons stay visible for UX consistency; the dose text
  // changes to a contraindication callout. Clinician can still mark
  // "None / Contraindicated" to proceed.
  const outsideThromboWindow =
    !!step1Data && !step1Data.lkwUnknown && (step1Data.lkwHours ?? 0) > 9;

  const isICH = ctResult === 'ich';
  const isNoBleed = ctResult === 'no-bleed';

  // Map to 'bleed' for workflow compatibility when ICH selected
  const ctResultForComplete = ctResult === 'ich' ? 'bleed' : ctResult;

  const canComplete =
    ctResult !== '' &&
    (isICH || (isNoBleed && treatmentGiven !== '') || ctResult === 'other');

  const handleComplete = () => {
    if (!canComplete) return;
    const treatmentForComplete = treatmentGiven === 'tpa' || treatmentGiven === 'tnk' ? treatmentGiven : 'none';
    const payload: Step2Data = {
      ctResult: ctResultForComplete,
      treatmentGiven: treatmentForComplete,
      ctaOrdered,
      lvoPresent: lvoPresent === 'yes' ? true : lvoPresent === 'no' ? false : undefined,
      thrombectomyPlan: lvoPresent || undefined
    };
    if (treatmentForComplete === 'tpa' || treatmentForComplete === 'tnk') {
      payload.tpaDose = treatmentForComplete === 'tpa' ? tpaDose : undefined;
      payload.tnkDose = treatmentForComplete === 'tnk' ? tnkDose : undefined;
    }
    onComplete(payload);
  };

  const handleStampCtRead = () => {
    if (ctReadStamped) return;
    onCtReadStamped?.();
    setCtReadStamped(true);
  };

  return (
    <div className="space-y-3 px-1">

      {/* Step 1 summary bar */}
      {step1Data && (
        <div className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
          <p className="text-xs text-slate-400">
            LKW {step1Data.lkwUnknown ? 'Unknown' : `${step1Data.lkwHours?.toFixed(1) ?? 0}h ago`}
            {' · '}NIHSS {step1Data.nihssScore ?? '—'}
            {' · '}BP {step1Data.systolicBP}/{step1Data.diastolicBP}
            {' · '}{weightKg > 0 ? `${weightKg} kg` : 'Weight not set'}
          </p>
        </div>
      )}

      {/* BP alert — only when BP high and treatment selected */}
      {step1Data && (step1Data.systolicBP > 185 || step1Data.diastolicBP > 110) && (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
        <div className="rounded-xl p-3 border border-red-200 bg-red-50">
          <p className="text-xs font-bold text-red-800 mb-1">Pre-thrombolysis BP &gt;185/110 — treat before giving tPA/TNK (AHA)</p>
          <p className="text-xs text-slate-700">
            <strong>Labetalol</strong> 10–20 mg IV push, repeat q10–20 min (max 300 mg)
            {' · '}
            <strong>Nicardipine</strong> 5 mg/hr, ↑2.5 mg/hr q5–15 min (max 15 mg/hr)
          </p>
        </div>
      )}

      {/* CT Head Result */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CT Head Result</p>
          <button
            type="button"
            onClick={handleStampCtRead}
            disabled={ctReadStamped}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors focus:outline-none ${
              ctReadStamped
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                : 'bg-neuro-50 text-neuro-700 border border-neuro-200 hover:bg-neuro-100'
            }`}
          >
            {ctReadStamped ? '✓ CT Stamped' : 'Stamp CT Time'}
          </button>
        </div>
        <div role="radiogroup" aria-label="CT Result" className="space-y-2">
          {[
            { value: 'no-bleed', label: 'No acute hemorrhage' },
            { value: 'ich', label: 'ICH detected' },
            { value: 'other', label: 'Other finding' },
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={ctResult === option.value}
              onClick={() => {
                setCtResult(option.value);
                if (option.value === 'ich') onIchSelected?.();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                ctResult === option.value
                  ? 'border-neuro-500 bg-neuro-50'
                  : 'border-slate-200 bg-white hover:bg-slate-50'
              }`}
            >
              <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                ctResult === option.value ? 'border-neuro-500' : 'border-slate-300'
              }`}>
                {ctResult === option.value && (
                  <div className="w-2 h-2 rounded-full bg-neuro-500" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                ctResult === option.value ? 'text-neuro-900' : 'text-slate-700'
              }`}>
                {option.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ICH — show protocol button */}
      {isICH && (
        <div className="rounded-xl p-3 border border-red-200 bg-red-50">
          <p className="text-xs font-bold text-red-800 mb-2">ICH detected — do not give thrombolytics</p>
          <button
            type="button"
            onClick={onIchSelected}
            className="text-xs font-semibold text-red-700 underline"
          >
            View hemorrhage protocol →
          </button>
        </div>
      )}

      {/* Eligibility not checked warning */}
      {isNoBleed && !eligibilityResult && (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
        <div className="rounded-xl p-3 border border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold text-amber-900 mb-2">Eligibility not checked — screen for contraindications before giving.</p>
          {onOpenEligibility && (
            <button
              type="button"
              onClick={onOpenEligibility}
              className="text-xs font-bold text-amber-700 underline"
            >
              Open tPA Eligibility Checklist →
            </button>
          )}
        </div>
      )}

      {/* Eligibility contraindication warning */}
      {isNoBleed && eligibilityResult &&
        (eligibilityResult.eligibilityStatus === 'absolute-contraindication' || eligibilityResult.eligibilityStatus === 'relative-contraindication') &&
        (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
        <div className={`rounded-lg p-3 border ${
          eligibilityResult.eligibilityStatus === 'absolute-contraindication'
            ? 'border-red-200 bg-red-50'
            : 'border-amber-200 bg-amber-50'
        }`}>
          <p className={`text-xs font-bold ${
            eligibilityResult.eligibilityStatus === 'absolute-contraindication' ? 'text-red-900' : 'text-amber-900'
          }`}>
            {eligibilityResult.eligibilityStatus === 'absolute-contraindication'
              ? 'Do not give tPA/TNK — major exclusion(s) identified.'
              : 'Discuss risk vs benefits before proceeding (AHA).'}
          </p>
        </div>
      )}

      {/* Treatment Decision */}
      {isNoBleed && (
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Treatment Decision</p>
          <div className="space-y-2">
            {[
              {
                value: 'tpa',
                label: 'tPA',
                sub: outsideThromboWindow
                  ? 'Not indicated (LKW > 9h, outside thrombolytic window)'
                  : weightKg > 0
                  ? `${tpaDose} mg — bolus ${tpaBolus} + inf ${tpaInfusion}`
                  : 'Enter weight for dose',
              },
              {
                value: 'tnk',
                label: 'TNK',
                sub: outsideThromboWindow
                  ? 'Not indicated (LKW > 9h, outside thrombolytic window)'
                  : weightKg > 0
                  ? `${tnkDose} mg single bolus`
                  : 'Enter weight for dose',
              },
              {
                value: 'contraindicated',
                label: 'None / Contraindicated',
                sub: 'No thrombolytic given',
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTreatmentGiven(option.value)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  treatmentGiven === option.value
                    ? 'border-neuro-500 bg-neuro-50'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className={`w-4 h-4 rounded-full border flex-shrink-0 flex items-center justify-center ${
                  treatmentGiven === option.value ? 'border-neuro-500' : 'border-slate-300'
                }`}>
                  {treatmentGiven === option.value && (
                    <div className="w-2 h-2 rounded-full bg-neuro-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${treatmentGiven === option.value ? 'text-neuro-900' : 'text-slate-900'}`}>
                    {option.label}
                  </p>
                  <p className="text-xs text-slate-400">{option.sub}</p>
                </div>
              </button>
            ))}
          </div>
          {weightKg > 0 && !outsideThromboWindow && (
            <p className="mt-2 text-[10px] text-slate-400 italic">Reference only — verify against institutional protocol before administration.</p>
          )}
        </div>
      )}

      {/* CTA & LVO Screening */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">CTA & LVO Screening</p>
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={ctaOrdered}
            onChange={(e) => setCtaOrdered(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-neuro-600 focus:ring-neuro-500"
          />
          <span className="text-sm font-medium text-slate-700">CTA ordered</span>
        </label>
        {ctaOrdered && (
          <div className="mt-3 space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">LVO detected?</p>
            <div className="flex gap-2">
              {['yes', 'no', 'pending'].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setLvoPresent(val)}
                  className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold transition-colors capitalize ${
                    lvoPresent === val
                      ? 'border-neuro-500 bg-neuro-50 text-neuro-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
            {lvoPresent === 'yes' && onOpenEVTPathway && (
              <button
                type="button"
                onClick={onOpenEVTPathway}
                className="w-full min-h-[44px] py-2.5 bg-neuro-500 hover:bg-neuro-600 text-white font-semibold rounded-full transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <AlertTriangle className="w-4 h-4 text-amber-300" aria-hidden />
                EVT Pathway
              </button>
            )}
          </div>
        )}
      </div>

      {/* Save CTA */}
      <button
        type="button"
        onClick={handleComplete}
        disabled={!canComplete}
        className="w-full min-h-[52px] py-3.5 bg-neuro-500 hover:bg-neuro-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all text-sm"
      >
        {canComplete ? 'Save & Continue →' : <span className="italic opacity-75">Select CT result to continue</span>}
      </button>

    </div>
  );
};
