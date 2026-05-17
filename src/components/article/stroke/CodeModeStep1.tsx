import React, { useState, useMemo, useEffect } from 'react';
import { LKWTimePicker } from './LKWTimePicker';
import { getTNKDose, getTpaDoses, toKg } from '../../../utils/strokeDosing';

export interface CodeModeStep1Props {
  onComplete: (data: Step1Data) => void;
  onOpenNIHSS: () => void;
  onOpenEligibility?: () => void;
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
  nihssScoreFromModal,
}) => {
  const [lkwHours, setLkwHours] = useState<number>(0);
  const [lkwUnknown, setLkwUnknown] = useState(false);
  const [nihssScore, setNihssScore] = useState<number>(0);
  const [systolicBP, setSystolicBP] = useState<number>(0);
  const [diastolicBP, setDiastolicBP] = useState<number>(0);
  const [glucose, setGlucose] = useState<number>(0);
  const [weightValue, setWeightValue] = useState<number>(0);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [bpControlled, setBpControlled] = useState(false);
  const [lowGlucoseGuidanceViewed, setLowGlucoseGuidanceViewed] = useState(false);

  const [lkwDate, setLkwDate] = useState<Date>(() => new Date());
  const [clockPickerOpen, setClockPickerOpen] = useState(false);

  // lkwEntered disambiguates "not yet entered" (lkwHours=0 by initial useState/useEffect)
  // from "LKW = right now" (lkwHours≈0, witnessed-now stroke). Without this flag,
  // `lkwHours > 0` falsely treats a valid same-minute LKW as unentered.
  // Fixed 2026-05-17 per audit-stroke-code-connectivity-2026-05-17.md HIGH finding.
  const [lkwEntered, setLkwEntered] = useState(false);

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

  useEffect(() => {
    if (lkwUnknown) { setLkwHours(0); return; }
    const now = new Date();
    setLkwHours(Math.max(0, (now.getTime() - lkwDate.getTime()) / (1000 * 60 * 60)));
  }, [lkwDate, lkwUnknown]);

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
    weightValue > 0 &&
    (!bpTooHigh || bpControlled || lkwUnknown);

  const missingFields: string[] = [];
  if (!lkwEntered) missingFields.push('LKW time');
  if (nihssScore <= 0) missingFields.push('NIHSS');
  if (systolicBP <= 0 || diastolicBP <= 0) missingFields.push('BP');
  if (glucose <= 0) missingFields.push('Glucose');
  if (weightValue <= 0) missingFields.push('Weight');

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
  const _h24 = lkwDate.getHours();
  const _h12 = _h24 % 12 || 12;
  const _period = _h24 >= 12 ? 'PM' : 'AM';
  const lkwTimeDisplay = `${_h12}:${String(lkwDate.getMinutes()).padStart(2, '0')} ${_period}`;

  const WindowBadge: React.FC = () => {
    if (!lkwEntered || lkwUnknown) return null;
    if (lkwHours <= 4.5)
      return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">● Within 4.5h</span>;
    if (lkwHours <= 9)
      return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">● Extended window</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5">● Outside tPA window</span>;
  };

  return (
    <div className="space-y-3 px-1">

      {/* ── LKW Section ── */}
      <div className="bg-white border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 pt-4 pb-1">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Last Known Well</p>
          {!lkwUnknown && (
            <div className="flex items-center justify-between gap-2 mb-2">
              <button
                type="button"
                onClick={() => setClockPickerOpen(true)}
                className="text-2xl font-semibold text-slate-900 tracking-tight hover:text-neuro-600 transition-colors whitespace-nowrap"
              >
                {lkwTimeDisplay}
              </button>
              <div className="flex items-center gap-2">
                <WindowBadge />
                <button
                  type="button"
                  onClick={() => setClockPickerOpen(true)}
                  className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                >
                  Change
                </button>
              </div>
            </div>
          )}
          {lkwEntered && !lkwUnknown && (
            <p className="text-xs text-slate-400 mb-2">~{lkwHours.toFixed(1)}h ago</p>
          )}
          <label className="flex items-center gap-2 cursor-pointer min-h-[36px] mb-3">
            <input
              type="checkbox"
              checked={lkwUnknown}
              onChange={(e) => {
                setLkwUnknown(e.target.checked);
                if (e.target.checked) {
                  setLkwHours(0);
                  setLkwEntered(true);  // "Unknown" is a definitive entry
                } else {
                  setLkwEntered(false);  // unchecking returns to "not entered" until picker confirms
                }
              }}
              className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 flex-shrink-0"
            />
            <span className="text-sm text-slate-500">LKW Unknown</span>
          </label>
        </div>

        {lkwUnknown && (
          <div className="px-4 pb-4 bg-amber-50 border-t border-amber-100">
            <p className="text-xs font-semibold text-amber-700 pt-3 mb-1">Wake-up / unknown onset</p>
            <p className="text-xs text-amber-600">Consider MRI DWI-FLAIR mismatch for late-window eligibility.</p>
          </div>
        )}
      </div>

      {/* ── Vitals Section ── */}
      <div className="bg-white border border-slate-100 rounded-xl p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Vitals</p>
        <div className="grid grid-cols-2 gap-2 mb-3">

          {/* BP Card */}
          <div className={`p-3 rounded-lg border ${bpTooHigh ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${bpTooHigh ? 'text-red-600' : 'text-slate-400'}`}>
              Blood pressure
            </p>
            <div className="flex items-center gap-1">
              <input
                type="number" min={0} max={300}
                value={systolicBP || ''}
                onChange={(e) => setSystolicBP(parseInt(e.target.value, 10) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="—"
                className={`w-full min-h-[44px] px-1.5 py-2 rounded-lg border text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none ${bpTooHigh ? 'border-red-200 text-red-700' : 'border-slate-200 text-slate-900'}`}
              />
              <span className="text-slate-400 text-sm font-medium flex-shrink-0">/</span>
              <input
                type="number" min={0} max={200}
                value={diastolicBP || ''}
                onChange={(e) => setDiastolicBP(parseInt(e.target.value, 10) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="—"
                className={`w-full min-h-[44px] px-1.5 py-2 rounded-lg border text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none ${bpTooHigh ? 'border-red-200 text-red-700' : 'border-slate-200 text-slate-900'}`}
              />
            </div>
            {bpTooHigh && <p className="text-[10px] font-semibold text-red-600 mt-1.5">Above tPA limit</p>}
          </div>

          {/* Glucose Card */}
          <div className={`p-3 rounded-lg border ${glucoseLow ? 'bg-amber-50 border-amber-200' : glucoseHigh ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'}`}>
            <p className={`text-[10px] font-semibold uppercase tracking-wide mb-1.5 ${glucoseLow ? 'text-amber-600' : glucoseHigh ? 'text-red-600' : 'text-slate-400'}`}>
              Glucose
            </p>
            <input
              type="number" min={0} max={600}
              value={glucose || ''}
              onChange={(e) => setGlucose(parseInt(e.target.value, 10) || 0)}
              onFocus={(e) => e.target.select()}
              placeholder="—"
              className={`w-full min-h-[44px] px-2 py-2 rounded-lg border text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none ${glucoseLow ? 'border-amber-200 text-amber-700' : glucoseHigh ? 'border-red-200 text-red-700' : 'border-slate-200 text-slate-900'}`}
            />
            {glucoseLow && <p className="text-[10px] font-semibold text-amber-600 mt-1.5">Low — treat first</p>}
            {glucoseHigh && <p className="text-[10px] font-semibold text-red-600 mt-1.5">High</p>}
            {!glucoseLow && !glucoseHigh && glucose > 0 && <p className="text-[10px] font-semibold text-emerald-600 mt-1.5">Normal</p>}
          </div>
        </div>

        {/* BP Alert */}
        {bpTooHigh && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2 mb-3">
            <p className="text-xs font-bold text-red-800">BP must be &lt;185/110 mmHg before tPA</p>
            <p className="text-xs text-slate-700">
              <strong>Labetalol</strong> 10–20 mg IV push, repeat q10–20 min (max 300 mg)
              &nbsp;·&nbsp;
              <strong>Nicardipine</strong> 5 mg/hr, ↑2.5 mg/hr q5–15 min (max 15 mg/hr)
            </p>
            <p className="text-[10px] text-red-600">AHA/ASA 2026</p>
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={bpControlled}
                onChange={(e) => setBpControlled(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 flex-shrink-0"
              />
              <span className="text-xs text-slate-700 font-medium">BP being controlled / treated</span>
            </label>
          </div>
        )}

        {/* Glucose guidance */}
        {glucoseLow && (
          <div className="rounded-lg px-3 py-2.5 bg-amber-50 border border-amber-200 mb-3">
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
      </div>

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
              type="number" min={0} max={42}
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
            type="number" min={0}
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
                <p className="text-[9px] font-bold uppercase tracking-widest text-neuro-500 mb-1">tPA</p>
                <p className="text-base font-semibold text-neuro-700">{tpaDose} mg</p>
                <p className="text-[10px] text-neuro-500">{tpaBolus} bolus + {tpaInfusion} inf</p>
              </div>
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
                <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-600 mb-1">TNK</p>
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
        <div className="rounded-xl p-4 bg-sky-50 border border-sky-200 space-y-3">
          <div>
            <p className="text-sm font-bold text-sky-900">Low NIHSS — assess for disabling symptoms (AHA)</p>
            <p className="text-xs text-sky-700 mt-0.5">Check any that are present. If so, consider TNK after discussing risk/benefit.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0.5">
            {[
              { key: 'aphasia', label: 'Aphasia' },
              { key: 'hemianopia', label: 'Hemianopia' },
              { key: 'truncalAtaxia', label: 'Truncal ataxia (walk the patient)' },
              { key: 'dysphagia', label: 'Dysphagia' },
              { key: 'handWeakness', label: 'Hand weakness affecting livelihood' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer min-h-[40px] py-0.5">
                <input
                  type="checkbox"
                  checked={disablingSymptoms[key as keyof typeof disablingSymptoms] || false}
                  onChange={(e) => setDisablingSymptoms(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600 flex-shrink-0"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
          {hasDisablingSymptom && (
            <p className="text-sm font-semibold text-sky-900">→ Consider TNK after discussing risk/benefit with patient and team.</p>
          )}
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

      {/* LKW date + time picker */}
      <LKWTimePicker
        isOpen={clockPickerOpen}
        onClose={() => setClockPickerOpen(false)}
        onConfirm={(date) => { setLkwDate(date); setLkwEntered(true); }}
        onUnknown={() => { setLkwUnknown(true); setLkwEntered(true); setClockPickerOpen(false); }}
        initialDate={lkwDate}
      />
    </div>
  );
};
