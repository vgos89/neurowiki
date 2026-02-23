import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';

/** Lazy-load clock picker for smaller initial bundle (mobile performance) */
const AnalogClockPicker = lazy(() => import('./AnalogClockPicker').then(m => ({ default: m.AnalogClockPicker })));

export interface CodeModeStep1Props {
  onComplete: (data: Step1Data) => void;
  onOpenNIHSS: () => void;
  onOpenEligibility?: () => void;
  /** When set, syncs the NIHSS score from the calculator modal into the NIHSS input */
  nihssScoreFromModal?: number | null;
}

export interface Step1Data {
  lkwHours: number;
  lkwUnknown?: boolean;
  /** GWTG: actual LKW timestamp (from clock); null if LKW unknown */
  lkwTimestamp?: Date | null;
  /** GWTG: when symptoms were first noted (optional; for wake-up strokes) */
  symptomDiscoveryTime?: Date | null;
  nihssScore: number;
  systolicBP: number;
  diastolicBP: number;
  glucose: number;
  weightValue: number;
  weightUnit: 'kg' | 'lbs';
  bpControlled: boolean;
  eligibilityChecked: boolean;
  /** True if user viewed AHA low-glucose guidance (treat, recheck, reassess for tPA); recorded in stroke documentation */
  lowGlucoseGuidanceViewed?: boolean;
}

export const CodeModeStep1: React.FC<CodeModeStep1Props> = ({
  onComplete,
  onOpenNIHSS,
  onOpenEligibility,
  nihssScoreFromModal
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
  const _now = new Date();
  const _h = _now.getHours();
  const [lkwHour, setLkwHour] = useState<number>(_h % 12 || 12);
  const [lkwMinute, setLkwMinute] = useState<number>(_now.getMinutes());
  const [lkwPeriod, setLkwPeriod] = useState<'AM' | 'PM'>(_h >= 12 ? 'PM' : 'AM');
  const [clockPickerOpen, setClockPickerOpen] = useState(false);
  const [clockPickerMode, setClockPickerMode] = useState<'lkw' | 'symptomDiscovery'>('lkw');
  /** GWTG: symptom discovery same as LKW (default) or custom time */
  const [symptomDiscoverySameAsLKW, setSymptomDiscoverySameAsLKW] = useState(true);
  const [symptomDiscoveryHour, setSymptomDiscoveryHour] = useState<number>(12);
  const [symptomDiscoveryMinute, setSymptomDiscoveryMinute] = useState<number>(0);
  const [symptomDiscoveryPeriod, setSymptomDiscoveryPeriod] = useState<'AM' | 'PM'>('AM');
  const [lowGlucoseGuidanceViewed, setLowGlucoseGuidanceViewed] = useState(false);
  const [disablingSymptoms, setDisablingSymptoms] = useState<Record<string, boolean>>({
    aphasia: false,
    hemianopia: false,
    truncalAtaxia: false,
    dysphagia: false,
    handWeakness: false
  });

  useEffect(() => {
    if (nihssScoreFromModal != null) {
      setNihssScore(nihssScoreFromModal);
    }
  }, [nihssScoreFromModal]);

  useEffect(() => {
    if (!symptomDiscoverySameAsLKW) {
      setSymptomDiscoveryHour(lkwHour);
      setSymptomDiscoveryMinute(lkwMinute);
      setSymptomDiscoveryPeriod(lkwPeriod);
    }
  }, [symptomDiscoverySameAsLKW]); // eslint-disable-line react-hooks/exhaustive-deps -- only when toggling off

  useEffect(() => {
    if (lkwUnknown) {
      setLkwHours(0);
      return;
    }
    const now = new Date();
    const lkwDate = new Date();
    let hour24 = lkwHour;
    if (lkwPeriod === 'PM' && lkwHour !== 12) hour24 += 12;
    if (lkwPeriod === 'AM' && lkwHour === 12) hour24 = 0;
    lkwDate.setHours(hour24, lkwMinute, 0, 0);
    if (lkwDate > now) lkwDate.setDate(lkwDate.getDate() - 1);
    const hoursAgo = (now.getTime() - lkwDate.getTime()) / (1000 * 60 * 60);
    setLkwHours(Math.max(0, hoursAgo));
  }, [lkwHour, lkwMinute, lkwPeriod, lkwUnknown]);

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
  const lowNIHSS = nihssScore >= 1 && nihssScore <= 5;
  const showDisablingSymptomsChecklist = withinTPAWindow && lowNIHSS && !lkwUnknown;
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

  /** Build Date for today from 12h clock (hour, minute, AM/PM); if result &gt; now, use yesterday */
  const dateFromClock = (h: number, m: number, p: 'AM' | 'PM'): Date => {
    let hour24 = h;
    if (p === 'PM' && h !== 12) hour24 += 12;
    if (p === 'AM' && h === 12) hour24 = 0;
    const d = new Date();
    d.setHours(hour24, m, 0, 0);
    if (d > new Date()) d.setDate(d.getDate() - 1);
    return d;
  };

  const handleComplete = () => {
    if (!isComplete) return;
    const lkwTimestamp = lkwUnknown ? null : dateFromClock(lkwHour, lkwMinute, lkwPeriod);
    const symptomDiscoveryTime = symptomDiscoverySameAsLKW ? lkwTimestamp : (lkwUnknown ? null : dateFromClock(symptomDiscoveryHour, symptomDiscoveryMinute, symptomDiscoveryPeriod));
    onComplete({
      lkwHours,
      lkwUnknown,
      lkwTimestamp: lkwTimestamp ?? undefined,
      symptomDiscoveryTime: symptomDiscoveryTime ?? undefined,
      nihssScore,
      systolicBP,
      diastolicBP,
      glucose,
      weightValue,
      weightUnit,
      bpControlled,
      eligibilityChecked: !!onOpenEligibility,
      lowGlucoseGuidanceViewed: glucoseLow ? lowGlucoseGuidanceViewed : undefined
    });
  };

  const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

  const lkwTimeDisplay = `${lkwHour || 12}:${String(lkwMinute).padStart(2, '0')} ${lkwPeriod}`;
  const lkwTimeSet = !lkwUnknown;

  return (
    <div className="space-y-4">
      {/* Stitch design: single card, two columns */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6">
          {/* Left: Onset Determination */}
          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">
              Onset Determination
            </h3>
            <label className="flex items-center cursor-pointer gap-3 min-h-[44px] py-1">
              <input
                type="checkbox"
                checked={lkwUnknown}
                onChange={(e) => {
                  setLkwUnknown(e.target.checked);
                  if (e.target.checked) setLkwHours(0);
                }}
                className="w-5 h-5 rounded border-slate-300 text-red-600 focus:ring-red-500 flex-shrink-0"
              />
              <span className="text-slate-600 font-medium">LKW Unknown</span>
            </label>
            {!lkwUnknown && (
              <>
                <button
                  type="button"
                  onClick={() => { setClockPickerMode('lkw'); setClockPickerOpen(true); }}
                  className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-lg border-2 border-sky-200 bg-sky-50/50 text-left hover:border-sky-300 transition-colors"
                >
                  <span className="text-slate-900 font-medium">LKW: {lkwTimeDisplay}</span>
                  {lkwTimeSet ? (
                    <span className="px-2.5 py-1 bg-sky-600 text-white text-xs font-bold rounded uppercase">
                      Selected
                    </span>
                  ) : (
                    <span className="text-slate-500 text-sm">Set time</span>
                  )}
                </button>
                {lkwHours > 0 && (
                  <p className="text-sm text-slate-600">
                    ~{lkwHours.toFixed(1)}h ago
                    {lkwHours <= 4.5 && <span className="text-emerald-600 ml-2">Within 4.5h</span>}
                    {lkwHours > 4.5 && lkwHours <= 9 && <span className="text-amber-600 ml-2">Extended window</span>}
                    {lkwHours > 9 && <span className="text-rose-600 ml-2">Outside tPA window</span>}
                  </p>
                )}
                {/* GWTG: optional time of symptom discovery (e.g. wake-up strokes) */}
                <div className="pt-2 border-t border-slate-200 mt-2">
                  <label className="flex items-center gap-2 cursor-pointer min-h-[44px] py-1">
                    <input
                      type="checkbox"
                      checked={symptomDiscoverySameAsLKW}
                      onChange={(e) => setSymptomDiscoverySameAsLKW(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-sky-600 flex-shrink-0"
                    />
                    <span className="text-sm text-slate-600">Symptom discovery same as LKW</span>
                  </label>
                  {!symptomDiscoverySameAsLKW && !lkwUnknown && (
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        Time first noted: {symptomDiscoveryHour}:{String(symptomDiscoveryMinute).padStart(2, '0')} {symptomDiscoveryPeriod}
                      </span>
                      <button
                        type="button"
                        onClick={() => { setClockPickerMode('symptomDiscovery'); setClockPickerOpen(true); }}
                        className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-2 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100"
                      >
                        Set time
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </section>

          {/* Right: Compact vitals cards (BP, GLUCOSE, NIHSS, Weight) */}
          <section className="grid grid-cols-2 gap-3 lg:grid-cols-2 lg:gap-3 content-start">
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm min-w-[140px]">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-1">BP</p>
              <div className="flex items-baseline gap-1.5">
                <input
                  type="number"
                  min={0}
                  max={300}
                  value={systolicBP || ''}
                  onChange={(e) => setSystolicBP(parseInt(e.target.value, 10) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="—"
                  className="min-w-[4.5rem] w-20 min-h-[44px] px-3 py-2 rounded border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white"
                />
                <span className="text-slate-400 font-medium">/</span>
                <input
                  type="number"
                  min={0}
                  max={200}
                  value={diastolicBP || ''}
                  onChange={(e) => setDiastolicBP(parseInt(e.target.value, 10) || 0)}
                  onFocus={(e) => e.target.select()}
                  placeholder="—"
                  className="min-w-[4.5rem] w-20 min-h-[44px] px-3 py-2 rounded border border-slate-200 text-slate-900 text-lg font-bold text-center bg-white"
                />
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm min-w-[120px]">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-1">Glucose</p>
              <input
                type="number"
                min={0}
                value={glucose || ''}
                onChange={(e) => setGlucose(parseInt(e.target.value, 10) || 0)}
                onFocus={(e) => e.target.select()}
                placeholder="—"
                className="w-full min-h-[44px] px-2 py-2 rounded border border-slate-200 text-slate-900 text-lg font-bold"
              />
              {(glucoseLow || glucoseHigh) && (
                <p className={`text-xs mt-0.5 ${glucoseLow ? 'text-amber-600' : 'text-rose-600'}`}>
                  {glucoseLow ? 'Low' : 'High'}
                </p>
              )}
              {glucoseLow && (
                <button
                  type="button"
                  onClick={() => setLowGlucoseGuidanceViewed(true)}
                  className="mt-2 text-xs font-medium text-amber-700 hover:text-amber-900 underline text-left"
                >
                  AHA guidance: treat hypoglycemia and re-assess for tPA
                </button>
              )}
              {glucoseLow && lowGlucoseGuidanceViewed && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900">
                  <strong>Hypoglycemia mimic (AHA):</strong> Give dextrose (e.g. D50 50 mL IV), recheck glucose. If symptoms persist after normoglycemia, reassess for tPA. Document that guidance was reviewed.
                </div>
              )}
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm min-w-[120px]">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-1">NIHSS</p>
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="number"
                  min={0}
                  max={42}
                  value={nihssScore || ''}
                  onChange={(e) => setNihssScore(clamp(parseInt(e.target.value, 10) || 0, 0, 42))}
                  onFocus={(e) => e.target.select()}
                  className="w-14 min-h-[44px] px-2 py-2 rounded border border-slate-200 text-slate-900 text-lg font-bold text-center"
                />
                <button
                  type="button"
                  onClick={onOpenNIHSS}
                  className="min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-3 py-2 text-sm text-purple-600 font-medium rounded-lg border border-purple-200 hover:bg-purple-50"
                >
                  Calculator
                </button>
              </div>
            </div>
            <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm min-w-[120px]">
              <p className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-1">Weight</p>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={weightValue || ''}
                  onChange={(e) => setWeightValue(parseFloat(e.target.value) || 0)}
                  onFocus={(e) => e.target.select()}
                  className="flex-1 w-14 min-h-[44px] px-2 py-2 rounded border border-slate-200 text-slate-900 text-lg font-bold"
                />
                <select
                  value={weightUnit}
                  onChange={(e) => setWeightUnit(e.target.value as 'kg' | 'lbs')}
                  className="min-h-[44px] px-2 py-2 rounded border border-slate-200 text-slate-900 text-sm"
                >
                  <option value="kg">kg</option>
                  <option value="lbs">lbs</option>
                </select>
              </div>
            </div>
          </section>
        </div>
        {bpTooHigh && (
          <>
            <label className="flex items-center gap-2 mt-4 cursor-pointer min-h-[44px] py-1">
              <input
                type="checkbox"
                checked={bpControlled}
                onChange={(e) => setBpControlled(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 flex-shrink-0"
              />
              <span className="text-sm text-slate-600">BP controlled / treating</span>
            </label>
            <div className="mt-4 rounded-lg border-2 border-red-200 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <span className="material-icons-outlined text-red-600 text-xl flex-shrink-0">warning</span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-slate-900">Pre-tPA Blood Pressure Management</h4>
                  <p className="text-sm text-red-700 mt-0.5">BP must be &lt;185/110 mmHg before tPA administration</p>
                  <div className="mt-3 text-sm text-slate-800">
                    <p className="font-bold text-slate-900 mb-1">TREATMENT OPTIONS:</p>
                    <ul className="list-disc list-inside space-y-1 text-slate-700">
                      <li><strong>Labetalol:</strong> 10–20 mg IV push over 1–2 minutes. May repeat every 10–20 minutes. Max: 300 mg total.</li>
                      <li><strong>Nicardipine (Cardene) drip:</strong> 5 mg/hr IV infusion. Increase by 2.5 mg/hr every 5–15 minutes. Max: 15 mg/hr.</li>
                    </ul>
                  </div>
                  <p className="mt-3 text-xs text-red-700 bg-red-100/50 rounded px-2 py-1.5">Guideline: AHA/ASA 2026 — BP must be &lt;185/110 before tPA administration. For BP &gt;220/120 in non-candidates, consider treatment to lower BP.</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {lkwUnknown && (
        <div className="rounded-lg p-3 flex items-start gap-3 bg-amber-50/50 border border-amber-100">
          <span className="material-icons-outlined text-amber-600">help_outline</span>
          <div>
            <p className="font-bold text-amber-900">LKW Unknown - EVT Only</p>
            <p className="text-sm text-amber-700/80">Without a known LKW time, thrombolysis is contraindicated. Consider EVT if LVO is confirmed with appropriate imaging.</p>
          </div>
        </div>
      )}

      {/* Dosing */}
      {weightKg > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-slate-700 mb-2">Thrombolytic dosing ({weightKg} kg)</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-slate-500">tPA:</span>{' '}
              <span className="font-mono font-semibold">{tpaDose} mg</span> (bolus {tpaBolus} + infusion {tpaInfusion})
            </div>
            <div>
              <span className="text-slate-500">TNK:</span>{' '}
              <span className="font-mono font-semibold">{tnkDose} mg</span> single bolus
            </div>
          </div>
        </div>
      )}

      {/* Low NIHSS: assess for disabling symptoms (AHA) — consider TNK after risk/benefit */}
      {showDisablingSymptomsChecklist && (
        <div className="rounded-lg p-4 bg-sky-50 border border-sky-200">
          <p className="text-sm font-bold text-sky-900 mb-2">Low NIHSS — assess for disabling symptoms (AHA)</p>
          <p className="text-xs text-sky-800 mb-3">If any present, consider TNK after discussing risk vs benefits with patient/team.</p>
          <div className="space-y-2">
            {[
              { key: 'aphasia', label: 'Aphasia' },
              { key: 'hemianopia', label: 'Hemianopia' },
              { key: 'truncalAtaxia', label: 'Truncal ataxia (walk the patient)' },
              { key: 'dysphagia', label: 'Dysphagia' },
              { key: 'handWeakness', label: 'Hand weakness affecting livelihood' }
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer min-h-[44px] py-1">
                <input
                  type="checkbox"
                  checked={disablingSymptoms[key as keyof typeof disablingSymptoms] || false}
                  onChange={(e) => setDisablingSymptoms(prev => ({ ...prev, [key]: e.target.checked }))}
                  className="w-4 h-4 rounded border-slate-300 text-sky-600"
                />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
          {hasDisablingSymptom && (
            <p className="mt-3 text-sm font-semibold text-sky-900">Consider TNK after discussing risk vs benefits (AHA).</p>
          )}
        </div>
      )}

      {onOpenEligibility && (
        <button
          type="button"
          onClick={onOpenEligibility}
          className="min-h-[44px] inline-flex items-center justify-center px-4 py-3 text-sm font-medium text-blue-600 hover:underline rounded-lg border border-blue-200 hover:bg-blue-50"
        >
          Check tPA eligibility
        </button>
      )}

      {/* Spacer on mobile so content is not hidden behind sticky CTA */}
      <div className="md:hidden h-20" aria-hidden />

      {/* Sticky bottom CTA on mobile (thumb zone), inline on desktop */}
      <div className="fixed md:relative bottom-0 left-0 right-0 md:bottom-auto md:left-auto md:right-auto z-40 safe-area-inset-bottom md:pb-0 bg-white md:bg-transparent border-t md:border-t-0 border-slate-200 md:border-0 p-4 md:p-0 md:mt-0">
        <button
          type="button"
          onClick={handleComplete}
          disabled={!isComplete}
          className="w-full min-h-[44px] py-4 md:py-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-all"
        >
          Save
        </button>
        {!isComplete && missingFields.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-1.5">
            Still needed: {missingFields.join(' · ')}
          </p>
        )}
      </div>

      {clockPickerOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[90] bg-black/10 flex items-center justify-center" aria-label="Loading clock" />}>
          <AnalogClockPicker
            isOpen={clockPickerOpen}
            onClose={() => setClockPickerOpen(false)}
            onTimeSelect={(h, m, p) => {
              if (clockPickerMode === 'lkw') {
                setLkwHour(h);
                setLkwMinute(m);
                setLkwPeriod(p);
              } else {
                setSymptomDiscoveryHour(h);
                setSymptomDiscoveryMinute(m);
                setSymptomDiscoveryPeriod(p);
              }
            }}
            initialHours={clockPickerMode === 'lkw' ? lkwHour : symptomDiscoveryHour}
            initialMinutes={clockPickerMode === 'lkw' ? lkwMinute : symptomDiscoveryMinute}
            initialPeriod={clockPickerMode === 'lkw' ? lkwPeriod : symptomDiscoveryPeriod}
          />
        </Suspense>
      )}
    </div>
  );
};
