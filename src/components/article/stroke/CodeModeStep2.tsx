import React, { useState, useMemo, useEffect } from 'react';
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
  doorToCTMinutes?: number;
  doorToNeedleMinutes?: number;
}

interface CodeModeStep2Props {
  step1Data: Step1Data;
  /** GWTG: door time for "minutes from door" on Record now buttons */
  doorTime?: Date | null;
  onComplete: (data: Step2Data) => void;
  onOpenEVTPathway?: () => void;
  /** Record GWTG milestone: 'doorToCT' | 'doorToNeedle' | 'ctOrderedTime' | 'ctFirstImageTime' | 'ctInterpretedTime' | 'tpaBolusTime' | 'groinPunctureTime' | 'firstDeviceTime' | 'firstReperfusionTime' */
  onRecordMilestone?: (milestone: string, time: Date) => void;
  /** Current GWTG milestones (to show already-recorded times and minutes from door) */
  milestones?: {
    ctOrderedTime?: Date | null;
    ctFirstImageTime?: Date | null;
    ctInterpretedTime?: Date | null;
    tpaBolusTime?: Date | null;
    groinPunctureTime?: Date | null;
    firstDeviceTime?: Date | null;
    firstReperfusionTime?: Date | null;
  };
  /** When set, show mandatory prompts: absolute → do not give TNK; relative → discuss risk vs benefits */
  eligibilityResult?: ThrombolysisEligibilityData | null;
  /** Called when user selects "ICH detected"; e.g. open hemorrhage protocol modal */
  onIchSelected?: () => void;
}

function minutesFromDoor(door: Date | undefined | null, eventTime: Date | undefined | null): number | null {
  if (!door || !eventTime) return null;
  return Math.round((eventTime.getTime() - door.getTime()) / 60000);
}

export const CodeModeStep2: React.FC<CodeModeStep2Props> = ({
  step1Data,
  doorTime,
  onComplete,
  onOpenEVTPathway,
  onRecordMilestone,
  milestones = {},
  eligibilityResult = null,
  onIchSelected
}) => {
  const [ctResult, setCtResult] = useState<string>('');
  const [treatmentGiven, setTreatmentGiven] = useState<string>('');
  const [ctaOrdered, setCtaOrdered] = useState(false);
  const [lvoPresent, setLvoPresent] = useState<string>(''); // 'yes' | 'no' | 'pending'
  const [doorToCTMinutes, setDoorToCTMinutes] = useState<number | ''>('');
  const [doorToNeedleMinutes, setDoorToNeedleMinutes] = useState<number | ''>('');
  const [ctMilestoneRecorded, setCtMilestoneRecorded] = useState(false);
  const [needleMilestoneRecorded, setNeedleMilestoneRecorded] = useState(false);

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

  useEffect(() => {
    if (doorToCTMinutes !== '' && typeof doorToCTMinutes === 'number' && onRecordMilestone && !ctMilestoneRecorded) {
      const time = new Date(Date.now() - doorToCTMinutes * 60 * 1000);
      onRecordMilestone('doorToCT', time);
      setCtMilestoneRecorded(true);
    }
  }, [doorToCTMinutes, ctMilestoneRecorded, onRecordMilestone]);

  useEffect(() => {
    if (
      doorToNeedleMinutes !== '' &&
      typeof doorToNeedleMinutes === 'number' &&
      onRecordMilestone &&
      !needleMilestoneRecorded &&
      (treatmentGiven === 'tpa' || treatmentGiven === 'tnk')
    ) {
      const time = new Date(Date.now() - doorToNeedleMinutes * 60 * 1000);
      onRecordMilestone('doorToNeedle', time);
      setNeedleMilestoneRecorded(true);
    }
  }, [doorToNeedleMinutes, needleMilestoneRecorded, treatmentGiven, onRecordMilestone]);

  const canComplete =
    ctResult !== '' &&
    (doorToCTMinutes !== '' && typeof doorToCTMinutes === 'number') &&
    (isICH || (isNoBleed && treatmentGiven !== '') || ctResult === 'other');

  const handleComplete = () => {
    if (!canComplete) return;
    const treatmentForComplete = treatmentGiven === 'tpa' || treatmentGiven === 'tnk' ? treatmentGiven : 'none';
    const payload: Step2Data = {
      ctResult: ctResultForComplete,
      treatmentGiven: treatmentForComplete,
      ctaOrdered,
      doorToCTMinutes: typeof doorToCTMinutes === 'number' ? doorToCTMinutes : undefined,
      lvoPresent: lvoPresent === 'yes' ? true : lvoPresent === 'no' ? false : undefined,
      thrombectomyPlan: lvoPresent || undefined
    };
    if (treatmentForComplete === 'tpa' || treatmentForComplete === 'tnk') {
      payload.tpaDose = treatmentForComplete === 'tpa' ? tpaDose : undefined;
      payload.tnkDose = treatmentForComplete === 'tnk' ? tnkDose : undefined;
      payload.doorToNeedleMinutes = typeof doorToNeedleMinutes === 'number' ? doorToNeedleMinutes : undefined;
    }
    onComplete(payload);
  };

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

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
            <span className="material-icons-outlined text-red-600 text-xl">warning</span>
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
        <div className="flex items-center gap-3 mb-4">
          <span className="material-icons-outlined text-slate-400">psychology</span>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">CT Head Result</h3>
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
          <span className="material-icons-outlined text-amber-600 text-xl flex-shrink-0">warning</span>
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

      {/* Eligibility mandatory prompts: absolute → do not give TNK; relative → discuss risk vs benefits */}
      {isNoBleed && eligibilityResult && (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
        <div className={`rounded-lg p-4 border-2 ${eligibilityResult.eligibilityStatus === 'absolute-contraindication' ? 'border-red-300 bg-red-50' : 'border-amber-300 bg-amber-50'}`}>
          <div className="flex items-start gap-3">
            <span className={`material-icons-outlined text-xl ${eligibilityResult.eligibilityStatus === 'absolute-contraindication' ? 'text-red-600' : 'text-amber-600'}`}>warning</span>
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
            <span className="material-icons-outlined text-slate-400">medication</span>
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
          <span className="material-icons-outlined text-slate-400">science</span>
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
                <span className="material-icons-outlined text-lg">open_in_new</span>
                EVT Pathway
              </button>
            )}
          </div>
        )}
      </div>

      {/* GWTG Brain Imaging Times – Record now */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
          <span className="material-icons-outlined text-slate-400">schedule</span>
          <h3 className="text-base font-semibold tracking-tight text-slate-900">Brain Imaging Times (GWTG)</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">Target: Door-to-CT (first image) &lt;25 min; CT interpreted ≤45 min (rural).</p>
        <div className="flex flex-wrap gap-2">
          {onRecordMilestone && (
            <>
              <button
                type="button"
                onClick={() => onRecordMilestone('ctOrderedTime', new Date())}
                className="min-h-[44px] min-w-[44px] inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium"
              >
                <span className="material-icons-outlined text-lg">add_circle</span>
                CT ordered
                {milestones.ctOrderedTime && doorTime && (
                  <span className="font-mono text-[10px] text-slate-500">{minutesFromDoor(doorTime, milestones.ctOrderedTime)}m</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  onRecordMilestone('ctFirstImageTime', new Date());
                  const min = doorTime ? Math.round((new Date().getTime() - doorTime.getTime()) / 60000) : null;
                  if (min != null && doorToCTMinutes === '') setDoorToCTMinutes(min);
                }}
                className="min-h-[44px] min-w-[44px] inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-sky-200 bg-sky-50/50 hover:bg-sky-100 text-sky-800 text-xs font-medium"
              >
                <span className="material-icons-outlined text-lg">image</span>
                First image (Door-to-CT)
                {milestones.ctFirstImageTime && doorTime && (
                  <span className="font-mono text-[10px]">{minutesFromDoor(doorTime, milestones.ctFirstImageTime)}m</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => onRecordMilestone('ctInterpretedTime', new Date())}
                className="min-h-[44px] min-w-[44px] inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium"
              >
                <span className="material-icons-outlined text-lg">visibility</span>
                Interpreted
                {milestones.ctInterpretedTime && doorTime && (
                  <span className="font-mono text-[10px] text-slate-500">{minutesFromDoor(doorTime, milestones.ctInterpretedTime)}m</span>
                )}
              </button>
            </>
          )}
        </div>
        {isNoBleed && (treatmentGiven === 'tpa' || treatmentGiven === 'tnk') && (
          <div className="mt-4 pt-4 border-t border-slate-200">
            <label className="block text-sm font-medium text-slate-700 mb-1">Door-to-Needle time (minutes)</label>
            <p className="text-xs text-rose-600 font-medium mb-2">Target: Door-to-Needle &lt;60 min</p>
            <div className="flex flex-wrap gap-2 items-center">
              {onRecordMilestone && (
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date();
                    onRecordMilestone('tpaBolusTime', now);
                    onRecordMilestone('doorToNeedle', now);
                    if (doorTime) setDoorToNeedleMinutes(Math.round((now.getTime() - doorTime.getTime()) / 60000));
                  }}
                  className="min-h-[44px] px-3 py-2 rounded-lg bg-rose-100 text-rose-800 text-sm font-medium border border-rose-200"
                >
                  Record tPA bolus now
                </button>
              )}
              <input
                type="number"
                min={0}
                max={999}
                value={doorToNeedleMinutes === '' ? '' : doorToNeedleMinutes}
                onChange={(e) => setDoorToNeedleMinutes(e.target.value === '' ? '' : clamp(parseInt(e.target.value, 10) || 0, 0, 999))}
                onFocus={(e) => e.target.select()}
                className="w-24 min-h-[44px] px-3 py-2 rounded-lg border border-slate-300 text-slate-900 font-mono"
              />
            </div>
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 mt-2">
              <p className="text-xs text-rose-800">Time-critical: &lt;60 min national benchmark</p>
            </div>
          </div>
        )}
      </div>

      {/* Thrombectomy times (optional) – show when CTA + LVO */}
      {ctaOrdered && lvoPresent === 'yes' && onRecordMilestone && (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <span className="material-icons-outlined text-orange-500">local_hospital</span>
            <h3 className="text-base font-semibold tracking-tight text-slate-900">Thrombectomy Times (GWTG)</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onRecordMilestone('groinPunctureTime', new Date())}
              className="min-h-[44px] inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-orange-200 bg-orange-50/50 hover:bg-orange-100 text-orange-800 text-xs font-medium"
            >
              <span className="material-icons-outlined text-lg">radio_button_checked</span>
              Groin puncture
              {milestones.groinPunctureTime && doorTime && (
                <span className="font-mono text-[10px]">{minutesFromDoor(doorTime, milestones.groinPunctureTime)}m</span>
              )}
            </button>
            <button
              type="button"
              onClick={() => onRecordMilestone('firstDeviceTime', new Date())}
              className="min-h-[44px] inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium"
            >
              First device
            </button>
            <button
              type="button"
              onClick={() => onRecordMilestone('firstReperfusionTime', new Date())}
              className="min-h-[44px] inline-flex flex-col items-center justify-center px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium"
            >
              First reperfusion
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={handleComplete}
        disabled={!canComplete}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
      >
        Mark Complete & Continue →
      </button>
    </div>
  );
};
