import React, { useState, useMemo, useEffect } from 'react';
import { LKWTimePicker } from './LKWTimePicker';

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

  const weightKg = useMemo(() => {
    if (weightValue === 0) return 0;
    return weightUnit === 'kg'
      ? Math.round(weightValue * 10) / 10
      : Math.round((weightValue / 2.205) * 10) / 10;
  }, [weightValue, weightUnit]);

  const tpaDose = useMemo(() => Math.min(Math.round(weightKg * 0.9 * 10) / 10, 90), [weightKg]);
  const tpaBolus = useMemo(() => Math.round(tpaDose * 0.1 * 10) / 10, [tpaDose]);
  const tpaInfusion = useMemo(() => Math.round(tpaDose * 0.9 * 10) / 10, [tpaDose]);

  const getTNKDose = (kg: number): number => {
    if (kg < 60) return 15;
    if (kg < 70) return 17.5;
    if (kg < 80) return 20;
    if (kg < 90) return 22.5;
    return 25;
  };
  const tnkDose = useMemo(() => getTNKDose(weightKg), [weightKg]);

  const withinTPAWindow = lkwHours > 0 && lkwHours <= 4.5;
  const showDisablingSymptomsChecklist = withinTPAWindow && nihssScore >= 1 && nihssScore <= 5 && !lkwUnknown;
  const hasDisablingSymptom = Object.values(disablingSymptoms).some(Boolean);

  const bpTooHigh = withinTPAWindow
    ? (systolicBP > 185 || diastolicBP > 110)
    : (systolicBP > 220 || diastolicBP > 120);
  const glucoseLow = glucose > 0 && glucose < 50;
  const glucoseHigh = glucose > 400;

  const isComplete =
    (lkwUnknown || lkwHours > 0) &&
    nihssScore > 0 &&
    systolicBP > 0 &&
    diastolicBP > 0 &&
    glucose > 0 &&
    weightValue > 0 &&
    (!bpTooHigh || bpControlled || lkwUnknown);

  const missingFields: string[] = [];
  if (!lkwUnknown && lkwHours <= 0) missingFields.push('LKW time');
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
      eligibilityChecked: !!onOpenEligibility,
      lowGlucoseGuidanceViewed: glucoseLow ? lowGlucoseGuidanceViewed : undefined,
    });
  };

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
  const _h24 = lkwDate.getHours();
  const _h12 = _h24 % 12 || 12;
  const _period = _h24 >= 12 ? 'PM' : 'AM';
  const lkwTimeDisplay = `${_h12}:${String(lkwDate.getMinutes()).padStart(2, '0')} ${_period}`;

  const WindowBadge: React.FC = () => {
    if (lkwUnknown || lkwHours <= 0) return null;
    if (lkwHours <= 4.5)
      return <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-0.5">● Within 4.5h</span>;
    if (lkwHours <= 9)
      return <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2.5 py-0.5">● Extended window</span>;
    return <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-full px-2.5 py-0.5">● Outside tPA window</span>;
  };

  return (
    <div className="space-y-3">

      {/* ── Main card ── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">

        {/* LKW */}
        <div className="p-5 space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Last Known Well</p>

          {!lkwUnknown && (
            <button
              type="button"
              onClick={() => setClockPickerOpen(true)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl border-2 border-sky-200 bg-sky-50/40 hover:border-sky-300 hover:bg-sky-50 transition-colors text-left"
            >
              <span className="text-base font-semibold text-slate-800">🕐 {lkwTimeDisplay}</span>
              <span className="shrink-0 text-xs font-bold uppercase tracking-wide text-sky-700 bg-sky-100 border border-sky-200 px-2.5 py-1 rounded-lg">
                {lkwHours > 0 ? 'Change' : 'Set time'}
              </span>
            </button>
          )}

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {!lkwUnknown && lkwHours > 0 && (
                <span className="text-sm text-slate-500">~{lkwHours.toFixed(1)}h ago</span>
              )}
              <WindowBadge />
            </div>
            <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
              <input
                type="checkbox"
                checked={lkwUnknown}
                onChange={(e) => { setLkwUnknown(e.target.checked); if (e.target.checked) setLkwHours(0); }}
                className="w-4 h-4 rounded border-slate-300 text-red-600 focus:ring-red-500 flex-shrink-0"
              />
              <span className="text-sm text-slate-600 font-medium">LKW Unknown</span>
            </label>
          </div>

          {lkwUnknown && (
            <div className="flex items-start gap-2.5 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
              <span className="text-amber-500 shrink-0 font-bold mt-0.5">⚠</span>
              <p className="text-sm text-amber-800 font-medium">tPA contraindicated without known LKW. Proceed to EVT evaluation if LVO suspected.</p>
            </div>
          )}
        </div>

        <div className="border-t border-slate-100" />

        {/* Vitals */}
        <div className="p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Vitals</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

            {/* BP */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">BP</p>
              <div className="flex items-center gap-1">
                <input
                  type="number" min={0} max={300}
                  value={systolicBP || ''}
                  onChange={(e) => setSystolicBP(parseInt(e.target.value, 10) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="—"
                  className="w-full min-h-[44px] px-1.5 py-2 rounded-lg border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
                />
                <span className="text-slate-300 font-semibold shrink-0">/</span>
                <input
                  type="number" min={0} max={200}
                  value={diastolicBP || ''}
                  onChange={(e) => setDiastolicBP(parseInt(e.target.value, 10) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="—"
                  className="w-full min-h-[44px] px-1.5 py-2 rounded-lg border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
                />
              </div>
              {bpTooHigh && <p className="text-xs font-semibold text-red-600">Above tPA threshold</p>}
            </div>

            {/* Glucose */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Glucose</p>
              <input
                type="number" min={0}
                value={glucose || ''}
                onChange={(e) => setGlucose(parseInt(e.target.value, 10) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="—"
                className="w-full min-h-[44px] px-2 py-2 rounded-lg border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
              />
              {glucoseLow && <p className="text-xs font-semibold text-amber-600">Low — treat first</p>}
              {glucoseHigh && <p className="text-xs font-semibold text-red-600">High</p>}
            </div>

            {/* NIHSS */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">NIHSS</p>
              <div className="flex items-center gap-1.5">
                <input
                  type="number" min={0} max={42}
                  value={nihssScore || ''}
                  onChange={(e) => setNihssScore(clamp(parseInt(e.target.value, 10) || 0, 0, 42))}
                  onFocus={(e) => e.target.select()}
                  placeholder="—"
                  className="w-14 min-h-[44px] px-1.5 py-2 rounded-lg border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={onOpenNIHSS}
                  className="flex-1 min-h-[44px] px-2 py-2 text-xs font-semibold text-violet-600 rounded-lg border border-violet-200 bg-violet-50 hover:bg-violet-100 transition-colors"
                >
                  Calc
                </button>
              </div>
            </div>

            {/* Weight */}
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Weight</p>
              <div className="flex items-center gap-1">
                <input
                  type="number" min={0}
                  value={weightValue || ''}
                  onChange={(e) => setWeightValue(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="—"
                  className="flex-1 min-w-0 min-h-[44px] px-1.5 py-2 rounded-lg border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white focus:ring-2 focus:ring-neuro-400 focus:outline-none"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                  className="min-h-[44px] px-1.5 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-medium bg-white"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </div>

          {/* Glucose guidance */}
          {glucoseLow && (
            <div className="rounded-lg px-3 py-2.5 bg-amber-50 border border-amber-200">
              <button
                type="button"
                onClick={() => setLowGlucoseGuidanceViewed(true)}
                className="text-sm font-semibold text-amber-700 hover:underline text-left"
              >
                AHA: treat hypoglycemia, then reassess for tPA →
              </button>
              {lowGlucoseGuidanceViewed && (
                <p className="mt-1.5 text-sm text-amber-800">Give D50 50 mL IV, recheck glucose. If symptoms persist after normoglycemia, reassess for tPA.</p>
              )}
            </div>
          )}

          {/* BP warning */}
          {bpTooHigh && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 p-4 space-y-3">
              <div>
                <p className="text-sm font-bold text-red-800">BP must be &lt;185/110 mmHg before tPA</p>
                <p className="text-sm text-slate-700 mt-1.5">
                  <strong>Labetalol</strong> 10–20 mg IV push, repeat q10–20 min (max 300 mg)
                  &nbsp;·&nbsp;
                  <strong>Nicardipine</strong> 5 mg/hr, ↑2.5 mg/hr q5–15 min (max 15 mg/hr)
                </p>
                <p className="text-xs text-red-600 mt-1.5">AHA/ASA 2026</p>
              </div>
              <label className="flex items-center gap-2 cursor-pointer min-h-[36px]">
                <input
                  type="checkbox"
                  checked={bpControlled}
                  onChange={(e) => setBpControlled(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-blue-600 flex-shrink-0"
                />
                <span className="text-sm text-slate-700 font-medium">BP being controlled / treated</span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* ── Dosing ── */}
      {weightKg > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">Dosing ({weightKg} kg)</span>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
            <span>
              <span className="text-slate-500 mr-1">tPA</span>
              <span className="font-mono font-bold text-slate-900">{tpaDose} mg</span>
              <span className="text-slate-400 text-xs ml-1">(bolus {tpaBolus} + inf {tpaInfusion})</span>
            </span>
            <span>
              <span className="text-slate-500 mr-1">TNK</span>
              <span className="font-mono font-bold text-slate-900">{tnkDose} mg</span>
              <span className="text-slate-400 text-xs ml-1">single bolus</span>
            </span>
          </div>
        </div>
      )}

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
      <div>
        {withinTPAWindow && isComplete && onOpenEligibility ? (
          <button
            type="button"
            onClick={() => { handleComplete(); onOpenEligibility(); }}
            className="w-full min-h-[48px] py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-sm"
          >
            Save &amp; Check Eligibility →
          </button>
        ) : (
          <button
            type="button"
            onClick={handleComplete}
            disabled={!isComplete}
            className="w-full min-h-[48px] py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all"
          >
            {isComplete ? 'Save →' : `Still needed: ${missingFields.join(' · ')}`}
          </button>
        )}
      </div>

      {/* LKW date + time picker */}
      <LKWTimePicker
        isOpen={clockPickerOpen}
        onClose={() => setClockPickerOpen(false)}
        onConfirm={(date) => setLkwDate(date)}
        onUnknown={() => { setLkwUnknown(true); setClockPickerOpen(false); }}
        initialDate={lkwDate}
      />
    </div>
  );
};
