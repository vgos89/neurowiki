import React, { useState, useMemo } from 'react';
import { AlertTriangle, ExternalLink, FlaskConical, Brain } from 'lucide-react';
import type { Step1Data } from './CodeModeStep1';
import type { ThrombolysisEligibilityData } from './ThrombolysisEligibilityModal';

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
}

export const CodeModeStep2: React.FC<CodeModeStep2Props> = ({
  step1Data,
  onComplete,
  onOpenEVTPathway,
  eligibilityResult = null,
  onIchSelected,
  onOpenEligibility,
}) => {
  const [ctResult, setCtResult] = useState<string>('');
  const [treatmentGiven, setTreatmentGiven] = useState<string>('');
  const [ctaOrdered, setCtaOrdered] = useState(false);
  const [lvoPresent, setLvoPresent] = useState<string>(''); // 'yes' | 'no' | 'pending'
  const [ctReadStamped, setCtReadStamped] = useState(false);

  // Pre-fill doses from Step 1 weight
  const weightKg = useMemo(() => {
    if (!step1Data?.weightValue) return 0;
    return step1Data.weightUnit === 'kg'
      ? Math.round(step1Data.weightValue * 10) / 10
      : Math.round((step1Data.weightValue / 2.205) * 10) / 10;
  }, [step1Data?.weightValue, step1Data?.weightUnit]);

  const tpaDose = useMemo(() => (weightKg > 0 ? Math.min(Math.round(weightKg * 0.9 * 10) / 10, 90) : 0), [weightKg]);
  const tpaBolus = useMemo(() => (tpaDose > 0 ? Math.round(tpaDose * 0.1 * 10) / 10 : 0), [tpaDose]);
  const tpaInfusion = useMemo(() => (tpaDose > 0 ? Math.round(tpaDose * 0.9 * 10) / 10 : 0), [tpaDose]);

  const getTNKDose = (kg: number): number => {
    if (kg < 60) return 15;
    if (kg < 70) return 17.5;
    if (kg < 80) return 20;
    if (kg < 90) return 22.5;
    return 25;
  };
  const tnkDose = useMemo(() => (weightKg > 0 ? getTNKDose(weightKg) : 0), [weightKg]);

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
    window.dispatchEvent(new CustomEvent('stroke:stamp-ct-read'));
    setCtReadStamped(true);
  };

  return (
    <div className="space-y-4">
      {/* Step 1 summary */}
      {step1Data && (
        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
          <div className="text-sm text-blue-800 space-y-1">
            <div><strong>LKW:</strong> {step1Data.lkwUnknown ? 'Unknown' : `${step1Data.lkwHours?.toFixed(1) ?? 0}h ago`}</div>
            <div><strong>NIHSS:</strong> {step1Data.nihssScore ?? '—'}</div>
            <div><strong>BP:</strong> {step1Data.systolicBP}/{step1Data.diastolicBP} mmHg</div>
            <div><strong>Weight:</strong> {step1Data.weightValue}{step1Data.weightUnit} ({weightKg}kg)</div>
          </div>
        </div>
      )}

      {/* BP intervention prompts (AHA): pre-thrombolysis >185/110; general >220/120 */}
      {step1Data && (step1Data.systolicBP > 185 || step1Data.diastolicBP > 110) && (
        <div className="rounded-lg p-4 border-2 border-red-200 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-red-900 space-y-2">
              {(treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (step1Data.systolicBP > 185 || step1Data.diastolicBP > 110) && (
                <>
                  <p className="font-bold">Pre-thrombolysis BP &gt;185/110 — treat before giving tPA/TNK (AHA)</p>
                  <ul className="list-disc list-inside space-y-0.5 text-xs">
                    <li><strong>Labetalol:</strong> 10–20 mg IV over 1–2 min; may repeat every 10–20 min (max 300 mg).</li>
                    <li><strong>Nicardipine drip:</strong> Start 5 mg/h; titrate by 2.5 mg/h every 5–15 min, target SBP &lt;185 and DBP &lt;110.</li>
                  </ul>
                </>
              )}
              {(step1Data.systolicBP > 220 || step1Data.diastolicBP > 120) && (
                <p className="font-bold">BP &gt;220/120: Consider treatment to lower BP (AHA), even when not a thrombolysis candidate.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CT Result Selection */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-slate-400" />
            <h3 className="text-base font-semibold tracking-tight text-slate-900">CT Head Result</h3>
          </div>
          {/* CT Read Time stamp — syncs with TimestampBubble */}
          <button
            type="button"
            onClick={handleStampCtRead}
            disabled={ctReadStamped}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              ctReadStamped
                ? 'bg-green-100 text-green-700 border border-green-200 cursor-default'
                : 'bg-neuro-50 text-neuro-700 border border-neuro-200 hover:bg-neuro-100'
            }`}
            title="Record CT Read Time in timestamp tracker"
          >
            {ctReadStamped ? (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                CT Read Stamped
              </>
            ) : (
              <>
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path strokeLinecap="round" d="M12 6v6l4 2"/></svg>
                Stamp CT Read Time
              </>
            )}
          </button>
        </div>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="ctResult"
              checked={ctResult === 'no-bleed'}
              onChange={() => setCtResult('no-bleed')}
              className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
            />
            <span className="font-medium text-slate-900">No acute hemorrhage</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="ctResult"
              checked={ctResult === 'ich'}
              onChange={() => {
                setCtResult('ich');
                onIchSelected?.();
              }}
              className="w-4 h-4 text-rose-600 border-slate-300 focus:ring-rose-500"
            />
            <span className="font-medium text-slate-900">ICH detected</span>
          </label>
          <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
            <input
              type="radio"
              name="ctResult"
              checked={ctResult === 'other'}
              onChange={() => setCtResult('other')}
              className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
            />
            <span className="font-medium text-slate-900">Other finding</span>
          </label>
        </div>
      </div>

      {/* ICH callout + button to open hemorrhage protocol modal */}
      {isICH && (
        <div className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-start gap-3 bg-amber-50 border border-amber-200">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-amber-900">Thrombolysis contraindicated</p>
            <p className="text-sm text-amber-800 mt-1">Proceed to hemorrhage protocol (2022 AHA/ASA ICH). Consider EVT pathway if LVO suspected with appropriate imaging.</p>
            <button
              type="button"
              onClick={() => onIchSelected?.()}
              className="mt-3 min-h-[44px] px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition-colors inline-flex items-center gap-2"
            >
              View hemorrhage protocol
            </button>
          </div>
        </div>
      )}

      {/* Eligibility not checked warning */}
      {isNoBleed && !eligibilityResult && (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
        <div className="rounded-lg p-4 border-2 border-amber-300 bg-amber-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-amber-900">Eligibility not checked — screen for tPA/TNK contraindications before giving.</p>
              {onOpenEligibility && (
                <button
                  type="button"
                  onClick={onOpenEligibility}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                >
                  Open tPA Eligibility Checklist →
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Eligibility mandatory prompts: absolute → do not give TNK; relative → discuss risk vs benefits */}
      {isNoBleed && eligibilityResult && (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
        <div className={`rounded-lg p-4 border-2 ${eligibilityResult.eligibilityStatus === 'absolute-contraindication' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
          <div className="flex items-start gap-3">
            <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${eligibilityResult.eligibilityStatus === 'absolute-contraindication' ? 'text-red-600' : 'text-amber-600'}`} />
            <div className="text-sm">
              {eligibilityResult.eligibilityStatus === 'absolute-contraindication' && (
                <p className="font-bold text-red-900">Do not give tPA/TNK — major exclusion(s) identified. Check eligibility in Step 1.</p>
              )}
              {eligibilityResult.eligibilityStatus === 'relative-contraindication' && (
                <p className="font-bold text-amber-900">Discuss risk vs benefits with patient and other involved teams before proceeding (AHA).</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Treatment Decision - only if no acute hemorrhage */}
      {isNoBleed && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /><rect x="3" y="3" width="18" height="18" rx="3" /></svg>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">Treatment Decision</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="treatment"
                checked={treatmentGiven === 'tpa'}
                onChange={() => setTreatmentGiven('tpa')}
                className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
              />
              <span className="font-medium text-slate-900">tPA</span>
              {weightKg > 0 && <span className="text-sm text-slate-500">({tpaDose} mg — bolus {tpaBolus} + infusion {tpaInfusion})</span>}
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="treatment"
                checked={treatmentGiven === 'tnk'}
                onChange={() => setTreatmentGiven('tnk')}
                className="w-4 h-4 text-purple-600 border-slate-300 focus:ring-purple-500"
              />
              <span className="font-medium text-slate-900">TNK</span>
              {weightKg > 0 && <span className="text-sm text-slate-500">({tnkDose} mg single bolus)</span>}
            </label>
            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors">
              <input
                type="radio"
                name="treatment"
                checked={treatmentGiven === 'none' || treatmentGiven === 'contraindicated'}
                onChange={() => setTreatmentGiven('contraindicated')}
                className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
              />
              <span className="font-medium text-slate-900">None / Contraindicated</span>
            </label>
          </div>
        </div>
      )}

      {/* CTA & LVO Screening */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <FlaskConical className="w-5 h-5 text-slate-400" />
          <h3 className="text-base font-semibold tracking-tight text-slate-900">CTA & LVO Screening</h3>
        </div>
        <label className="flex items-center gap-3 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={ctaOrdered}
            onChange={(e) => setCtaOrdered(e.target.checked)}
            className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-slate-700 font-medium">CTA ordered</span>
        </label>
        {ctaOrdered && (
          <div className="space-y-3 pl-8 border-l-2 border-slate-200">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">LVO detected?</p>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lvo"
                  checked={lvoPresent === 'yes'}
                  onChange={() => setLvoPresent('yes')}
                  className="w-4 h-4 text-orange-600 border-slate-300 focus:ring-orange-500"
                />
                <span className="text-sm text-slate-700">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lvo"
                  checked={lvoPresent === 'no'}
                  onChange={() => setLvoPresent('no')}
                  className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">No</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="lvo"
                  checked={lvoPresent === 'pending'}
                  onChange={() => setLvoPresent('pending')}
                  className="w-4 h-4 text-slate-600 border-slate-300 focus:ring-slate-500"
                />
                <span className="text-sm text-slate-700">Pending</span>
              </label>
            </div>
            {lvoPresent === 'yes' && onOpenEVTPathway && (
              <button
                type="button"
                onClick={onOpenEVTPathway}
                className="mt-3 w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                EVT Pathway
              </button>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleComplete}
        disabled={!canComplete}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
      >
        Save
      </button>
    </div>
  );
};
