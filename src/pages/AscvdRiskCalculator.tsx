/**
 * ASCVD 10-year Risk Calculator (Pooled Cohort Equations)
 *
 * Source: Goff DC Jr et al. 2013 ACC/AHA Guideline on the Assessment of
 * Cardiovascular Risk. Circulation 2014;129(Suppl 2):S49-S73, Appendix 7.
 * Risk tier thresholds: Arnett DK et al. 2019 ACC/AHA Primary Prevention
 * Guideline (Circulation 2019;140:e596-e646).
 *
 * Applies to adults 40-79 without prior clinical ASCVD.
 * After ischaemic stroke, the patient is already in secondary prevention
 * (automatic statin indication). Use this only for primary prevention.
 */

import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Info } from 'lucide-react';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { useDrawerState } from '../hooks/useDrawerState';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import type { SeverityTokens } from '../lib/calculators/severityTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type Sex = 'male' | 'female';
type Race = 'white' | 'aa' | 'other';
type YesNo = 'yes' | 'no';

interface PceInputs {
  age: number;
  sex: Sex;
  race: Race;
  totalCholesterol: number;   // mg/dL
  hdlCholesterol: number;     // mg/dL
  systolicBp: number;         // mmHg
  bpTreated: YesNo;
  diabetes: YesNo;
  smoker: YesNo;
}

interface PceCoefficients {
  lnAge: number;
  lnAgeSq: number;
  lnTC: number;
  lnAgeLnTC: number;
  lnHDL: number;
  lnAgeLnHDL: number;
  lnTreatedSBP: number;
  lnAgeLnTreatedSBP: number;
  lnUntreatedSBP: number;
  lnAgeLnUntreatedSBP: number;
  smoker: number;
  lnAgeSmoker: number;
  diabetes: number;
  mean: number;
  baselineSurvival: number;
}

// ─── PCE coefficients (Goff 2014, Appendix 7, Tables A and B) ────────────────
//
// "other race" uses the white coefficients per the original guidance —
// surfaced with an explicit caveat in the UI.

const COEFFICIENTS: Record<'whiteFemale' | 'aaFemale' | 'whiteMale' | 'aaMale', PceCoefficients> = {
  whiteFemale: {
    lnAge: -29.799,    lnAgeSq: 4.884,
    lnTC: 13.540,      lnAgeLnTC: -3.114,
    lnHDL: -13.578,    lnAgeLnHDL: 3.149,
    lnTreatedSBP: 2.019,   lnAgeLnTreatedSBP: 0,
    lnUntreatedSBP: 1.957, lnAgeLnUntreatedSBP: 0,
    smoker: 7.574,     lnAgeSmoker: -1.665,
    diabetes: 0.661,
    mean: -29.18,
    baselineSurvival: 0.9665,
  },
  aaFemale: {
    lnAge: 17.114,     lnAgeSq: 0,
    lnTC: 0.940,       lnAgeLnTC: 0,
    lnHDL: -18.920,    lnAgeLnHDL: 4.475,
    lnTreatedSBP: 29.291,   lnAgeLnTreatedSBP: -6.432,
    lnUntreatedSBP: 27.820, lnAgeLnUntreatedSBP: -6.087,
    smoker: 0.691,     lnAgeSmoker: 0,
    diabetes: 0.874,
    mean: 86.61,
    baselineSurvival: 0.9533,
  },
  whiteMale: {
    lnAge: 12.344,     lnAgeSq: 0,
    lnTC: 11.853,      lnAgeLnTC: -2.664,
    lnHDL: -7.990,     lnAgeLnHDL: 1.769,
    lnTreatedSBP: 1.797,   lnAgeLnTreatedSBP: 0,
    lnUntreatedSBP: 1.764, lnAgeLnUntreatedSBP: 0,
    smoker: 7.837,     lnAgeSmoker: -1.795,
    diabetes: 0.658,
    mean: 61.18,
    baselineSurvival: 0.9144,
  },
  aaMale: {
    lnAge: 2.469,      lnAgeSq: 0,
    lnTC: 0.302,       lnAgeLnTC: 0,
    lnHDL: -0.307,     lnAgeLnHDL: 0,
    lnTreatedSBP: 1.916,   lnAgeLnTreatedSBP: 0,
    lnUntreatedSBP: 1.809, lnAgeLnUntreatedSBP: 0,
    smoker: 0.549,     lnAgeSmoker: 0,
    diabetes: 0.645,
    mean: 19.54,
    baselineSurvival: 0.8954,
  },
};

function selectGroup(sex: Sex, race: Race): PceCoefficients {
  // "Other" race uses white coefficients per Goff 2014 guidance; a UI caveat is shown.
  const isAA = race === 'aa';
  if (sex === 'female') return isAA ? COEFFICIENTS.aaFemale : COEFFICIENTS.whiteFemale;
  return isAA ? COEFFICIENTS.aaMale : COEFFICIENTS.whiteMale;
}

function calculatePce(inputs: PceInputs): number {
  const c = selectGroup(inputs.sex, inputs.race);
  const lnAge = Math.log(inputs.age);
  const lnTC = Math.log(inputs.totalCholesterol);
  const lnHDL = Math.log(inputs.hdlCholesterol);
  const lnSBP = Math.log(inputs.systolicBp);
  const treated = inputs.bpTreated === 'yes' ? 1 : 0;
  const smoker = inputs.smoker === 'yes' ? 1 : 0;
  const diabetes = inputs.diabetes === 'yes' ? 1 : 0;

  let sum =
    c.lnAge * lnAge +
    c.lnAgeSq * lnAge * lnAge +
    c.lnTC * lnTC +
    c.lnAgeLnTC * lnAge * lnTC +
    c.lnHDL * lnHDL +
    c.lnAgeLnHDL * lnAge * lnHDL +
    c.smoker * smoker +
    c.lnAgeSmoker * lnAge * smoker +
    c.diabetes * diabetes;

  if (treated === 1) {
    sum += c.lnTreatedSBP * lnSBP + c.lnAgeLnTreatedSBP * lnAge * lnSBP;
  } else {
    sum += c.lnUntreatedSBP * lnSBP + c.lnAgeLnUntreatedSBP * lnAge * lnSBP;
  }

  const risk = 1 - Math.pow(c.baselineSurvival, Math.exp(sum - c.mean));
  return risk * 100;
}

// ─── Risk tier interpretation (Arnett 2019) ──────────────────────────────────

type RiskTier = 'low' | 'borderline' | 'intermediate' | 'high';

function tierOf(riskPct: number): RiskTier {
  if (riskPct < 5) return 'low';
  if (riskPct < 7.5) return 'borderline';
  if (riskPct < 20) return 'intermediate';
  return 'high';
}

interface TierMeta {
  label: string;
  band: string;
  headlineColor: string;
  recommendation: string;
  explanation: string;
}

const TIER_META: Record<RiskTier, TierMeta> = {
  low: {
    label: 'Low risk',
    band: '<5%',
    headlineColor: 'text-emerald-700',
    recommendation: 'Lifestyle intervention. Statin not recommended on risk basis alone.',
    explanation: 'For adults 40-79 without prior clinical ASCVD, a 10-year risk under 5% does not meet the threshold for primary-prevention statin therapy. Focus on diet, exercise, weight, smoking cessation, and BP control. Re-assess every 4 to 6 years.',
  },
  borderline: {
    label: 'Borderline risk',
    band: '5% to <7.5%',
    headlineColor: 'text-amber-700',
    recommendation: 'Lifestyle intervention. Statin reasonable if risk-enhancing factors are present.',
    explanation: 'In the borderline range, the statin decision depends on risk-enhancing factors. Consider treatment if any are present: family history of premature ASCVD, persistent LDL-C ≥160 mg/dL, metabolic syndrome, CKD, chronic inflammatory disease, Lp(a) ≥50 mg/dL, ApoB ≥130 mg/dL, ABI <0.9, history of pre-eclampsia, or early menopause.',
  },
  intermediate: {
    label: 'Intermediate risk',
    band: '7.5% to <20%',
    headlineColor: 'text-amber-700',
    recommendation: 'Moderate-intensity statin recommended (COR 1, LOE A).',
    explanation: 'Initiate moderate-intensity statin (atorvastatin 10 to 20 mg or rosuvastatin 5 to 10 mg). If the decision is uncertain, coronary artery calcium scoring can refine the call: CAC = 0 supports deferral in selected patients; CAC ≥100 or ≥75th percentile favours treatment. Use high-intensity statin if risk-enhancing factors are also present.',
  },
  high: {
    label: 'High risk',
    band: '≥20%',
    headlineColor: 'text-red-700',
    recommendation: 'High-intensity statin recommended (COR 1, LOE A). Target ≥50% LDL-C reduction.',
    explanation: 'Initiate high-intensity statin (atorvastatin 40 to 80 mg or rosuvastatin 20 to 40 mg) targeting ≥50% LDL-C reduction. Optimise blood pressure to <130/80 mmHg, support smoking cessation, and address glycaemic control if diabetic. Re-check LDL-C at 4 to 12 weeks after initiation.',
  },
};

// Drawer severity tokens — CALCULATOR_SPEC.md §6 mapping
const SEVERITY_TOKENS: Record<RiskTier, SeverityTokens> = {
  low: {
    borderColor: '#e2e8f0',
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-900',
    chevronClass: 'text-slate-400',
  },
  borderline: {
    borderColor: '#fde68a',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-700',
  },
  intermediate: {
    borderColor: '#fed7aa',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-700',
  },
  high: {
    borderColor: '#fecaca',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
};

// ─── Validation ──────────────────────────────────────────────────────────────

interface InputState {
  age: string;
  sex: Sex | null;
  race: Race | null;
  totalCholesterol: string;
  hdlCholesterol: string;
  systolicBp: string;
  bpTreated: YesNo | null;
  diabetes: YesNo | null;
  smoker: YesNo | null;
}

interface ValidationResult {
  inputs: PceInputs | null;
  warnings: string[];
  missing: string[];
  outOfRange: string[];
}

function validate(state: InputState): ValidationResult {
  const warnings: string[] = [];
  const missing: string[] = [];
  const outOfRange: string[] = [];

  const age = parseFloat(state.age);
  const tc = parseFloat(state.totalCholesterol);
  const hdl = parseFloat(state.hdlCholesterol);
  const sbp = parseFloat(state.systolicBp);

  if (!state.age || isNaN(age)) missing.push('Age');
  else if (age < 40 || age > 79) outOfRange.push(`Age ${age} is outside the PCE validated range of 40-79. The calculator does not produce a valid result outside this range.`);

  if (!state.sex) missing.push('Sex');
  if (!state.race) missing.push('Race');
  if (!state.totalCholesterol || isNaN(tc)) missing.push('Total cholesterol');
  else if (tc < 130 || tc > 320) warnings.push('Total cholesterol outside PCE derivation range (130-320 mg/dL)');
  if (!state.hdlCholesterol || isNaN(hdl)) missing.push('HDL-C');
  else if (hdl < 20 || hdl > 100) warnings.push('HDL-C outside PCE derivation range (20-100 mg/dL)');
  if (!state.systolicBp || isNaN(sbp)) missing.push('Systolic BP');
  else if (sbp < 90 || sbp > 200) warnings.push('SBP outside PCE derivation range (90-200 mmHg)');

  if (!state.bpTreated) missing.push('BP treatment status');
  if (!state.diabetes) missing.push('Diabetes');
  if (!state.smoker) missing.push('Smoker status');

  if (missing.length > 0 || outOfRange.length > 0) {
    return { inputs: null, warnings, missing, outOfRange };
  }

  return {
    inputs: {
      age, sex: state.sex!, race: state.race!,
      totalCholesterol: tc, hdlCholesterol: hdl, systolicBp: sbp,
      bpTreated: state.bpTreated!, diabetes: state.diabetes!, smoker: state.smoker!,
    },
    warnings,
    missing: [],
    outOfRange: [],
  };
}

// ─── Component ────────────────────────────────────────────────────────────────

const AscvdRiskCalculator: React.FC = () => {
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite('ascvd-risk');
  const [copyConfirm, setCopyConfirm] = useState(false);

  const [state, setState] = useState<InputState>({
    age: '', sex: null, race: null,
    totalCholesterol: '', hdlCholesterol: '', systolicBp: '',
    bpTreated: null, diabetes: null, smoker: null,
  });

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'ascvd-risk',
      title: 'ASCVD 10-year Risk',
      subtitle: 'Pooled Cohort Equations',
      category: 'stroke',
      trail: 'Primary prevention',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const validation = useMemo(() => validate(state), [state]);
  const result = useMemo(
    () => (validation.inputs ? calculatePce(validation.inputs) : null),
    [validation.inputs],
  );
  const tier = result !== null ? tierOf(result) : null;
  const tierMeta = tier ? TIER_META[tier] : null;
  const tokens = tier ? SEVERITY_TOKENS[tier] : null;

  // Inline age-range detection — fires as soon as user types an out-of-range value
  const ageNum = parseFloat(state.age);
  const ageEntered = state.age !== '' && !isNaN(ageNum);
  const ageOutOfRange = ageEntered && (ageNum < 40 || ageNum > 79);

  // Drawer state per CALCULATOR_SPEC.md §5: A (no inputs), B (partial), C (complete + valid)
  const totalRequired = 9; // age, sex, race, TC, HDL, SBP, bpTreated, diabetes, smoker
  const selectedCount =
    (state.age && !isNaN(ageNum) ? 1 : 0) +
    (state.sex ? 1 : 0) +
    (state.race ? 1 : 0) +
    (state.totalCholesterol && !isNaN(parseFloat(state.totalCholesterol)) ? 1 : 0) +
    (state.hdlCholesterol && !isNaN(parseFloat(state.hdlCholesterol)) ? 1 : 0) +
    (state.systolicBp && !isNaN(parseFloat(state.systolicBp)) ? 1 : 0) +
    (state.bpTreated ? 1 : 0) +
    (state.diabetes ? 1 : 0) +
    (state.smoker ? 1 : 0);
  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer } =
    useDrawerState({ mode: 'partial-complete', selectedCount, totalRequired });

  const handleReset = () => {
    setState({
      age: '', sex: null, race: null,
      totalCholesterol: '', hdlCholesterol: '', systolicBp: '',
      bpTreated: null, diabetes: null, smoker: null,
    });
    resetDrawer();
    window.scrollTo(0, 0);
  };

  const handleCopy = () => {
    if (result === null || !tierMeta) return;
    const summary = `ASCVD 10-year risk: ${result.toFixed(1)}% (${tierMeta.label}) | NeuroWiki`;
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  };

  const setField = <K extends keyof InputState>(k: K, v: InputState[K]) =>
    setState(prev => ({ ...prev, [k]: v }));

  return (
    <div className="min-h-dvh bg-slate-50 pb-24">
      <CalculatorHeader
        name="ASCVD 10-year Risk"
        scoreDisplay={
          result !== null
            ? <span className="text-[20px] font-bold text-slate-900">{result.toFixed(1)}<span className="text-slate-500 text-[14px]">%</span></span>
            : <span className="text-[20px] font-bold text-slate-400">–</span>
        }
        scoreAriaLabel={result !== null ? `10-year ASCVD risk ${result.toFixed(1)} percent` : '10-year ASCVD risk not yet computed'}
        onBack={handleBack}
        onReset={handleReset}
        onCopy={handleCopy}
        onFavToggle={() => toggleFavorite('ascvd-risk')}
        isFav={isFav}
      />

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">

        {/* Scope notice */}
        <div className="rounded-xl border border-neuro-200 bg-neuro-50 p-3">
          <div className="flex items-start gap-2.5">
            <Info size={16} className="text-neuro-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-[13px] font-semibold text-neuro-800">Primary prevention only</p>
              <p className="text-[12px] text-slate-700 mt-1 leading-relaxed">
                Pooled Cohort Equations apply to adults 40-79 without prior clinical ASCVD. Patients with a prior stroke, MI, or other clinical ASCVD are already in secondary prevention and require statin therapy regardless of the PCE result. Use the Post-Stroke Lipid Management pathway instead.
              </p>
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="bg-white border border-slate-100 rounded-xl p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Demographics</p>

          <label className="block text-[13px] font-medium text-slate-700 mb-1">Age (40-79)</label>
          <input
            type="number" min="40" max="79" placeholder="e.g. 62"
            value={state.age}
            onChange={e => setField('age', e.target.value)}
            aria-invalid={ageOutOfRange}
            aria-describedby={ageOutOfRange ? 'age-out-of-range' : undefined}
            className={`w-full rounded-xl border bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:border-transparent ${
              ageOutOfRange
                ? 'border-amber-400 focus:ring-amber-400'
                : 'border-slate-200 focus:ring-neuro-500'
            }`}
          />
          {ageOutOfRange && (
            <div id="age-out-of-range" role="alert" className="mt-2 rounded-lg bg-amber-50 border border-amber-300 p-2.5 flex items-start gap-2">
              <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="text-[12px] text-amber-900 leading-relaxed">
                <span className="font-semibold">Age {ageNum} is outside the PCE validated range (40-79).</span> The calculator cannot produce a valid 10-year ASCVD risk for this patient. {ageNum < 40 ? 'In adults <40, the PCE underestimates lifetime risk; consider risk-enhancing factors.' : 'In adults >79, the PCE overestimates risk; the statin decision rests on clinical judgement.'}
              </div>
            </div>
          )}

          <label className="block text-[13px] font-medium text-slate-700 mt-3 mb-1">Sex</label>
          <div className="grid grid-cols-2 gap-2">
            {(['male', 'female'] as const).map(s => (
              <button key={s} onClick={() => setField('sex', s)}
                className={`rounded-xl border py-2.5 text-[14px] font-semibold transition-all min-h-[44px] ${state.sex === s ? 'border-neuro-500 bg-neuro-50 text-neuro-700' : 'border-slate-200 text-slate-700 hover:border-neuro-200'}`}>
                {s === 'male' ? 'Male' : 'Female'}
              </button>
            ))}
          </div>

          <label className="block text-[13px] font-medium text-slate-700 mt-3 mb-1">Race</label>
          <div className="grid grid-cols-3 gap-2">
            {([{ id: 'white', label: 'White' }, { id: 'aa', label: 'African American' }, { id: 'other', label: 'Other' }] as const).map(r => (
              <button key={r.id} onClick={() => setField('race', r.id)}
                className={`rounded-xl border py-2.5 px-2 text-[12px] font-semibold transition-all min-h-[44px] ${state.race === r.id ? 'border-neuro-500 bg-neuro-50 text-neuro-700' : 'border-slate-200 text-slate-700 hover:border-neuro-200'}`}>
                {r.label}
              </button>
            ))}
          </div>
          {state.race === 'other' && (
            <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
              The PCE has coefficients only for non-Hispanic White and African American adults. For "Other", the White coefficients are applied per the 2013 ACC/AHA guidance; this may over- or under-estimate risk in other ethnic groups.
            </p>
          )}
        </div>

        {/* Lipids + BP */}
        <div className="bg-white border border-slate-100 rounded-xl p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Lipids and blood pressure</p>

          <label className="block text-[13px] font-medium text-slate-700 mb-1">Total cholesterol (mg/dL)</label>
          <input type="number" min="130" max="320" placeholder="e.g. 192" value={state.totalCholesterol}
            onChange={e => setField('totalCholesterol', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent" />

          <label className="block text-[13px] font-medium text-slate-700 mt-3 mb-1">HDL-C (mg/dL)</label>
          <input type="number" min="20" max="100" placeholder="e.g. 48" value={state.hdlCholesterol}
            onChange={e => setField('hdlCholesterol', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent" />

          <label className="block text-[13px] font-medium text-slate-700 mt-3 mb-1">Systolic BP (mmHg)</label>
          <input type="number" min="90" max="200" placeholder="e.g. 138" value={state.systolicBp}
            onChange={e => setField('systolicBp', e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-[15px] font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-neuro-500 focus:border-transparent" />

          <label className="block text-[13px] font-medium text-slate-700 mt-3 mb-1">On BP medication?</label>
          <div className="grid grid-cols-2 gap-2">
            {(['yes', 'no'] as const).map(v => (
              <button key={v} onClick={() => setField('bpTreated', v)}
                className={`rounded-xl border py-2.5 text-[14px] font-semibold transition-all min-h-[44px] ${state.bpTreated === v ? 'border-neuro-500 bg-neuro-50 text-neuro-700' : 'border-slate-200 text-slate-700 hover:border-neuro-200'}`}>
                {v === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* Conditions */}
        <div className="bg-white border border-slate-100 rounded-xl p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Conditions</p>

          <label className="block text-[13px] font-medium text-slate-700 mb-1">Diabetes</label>
          <div className="grid grid-cols-2 gap-2">
            {(['yes', 'no'] as const).map(v => (
              <button key={v} onClick={() => setField('diabetes', v)}
                className={`rounded-xl border py-2.5 text-[14px] font-semibold transition-all min-h-[44px] ${state.diabetes === v ? 'border-neuro-500 bg-neuro-50 text-neuro-700' : 'border-slate-200 text-slate-700 hover:border-neuro-200'}`}>
                {v === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>

          <label className="block text-[13px] font-medium text-slate-700 mt-3 mb-1">Current smoker</label>
          <div className="grid grid-cols-2 gap-2">
            {(['yes', 'no'] as const).map(v => (
              <button key={v} onClick={() => setField('smoker', v)}
                className={`rounded-xl border py-2.5 text-[14px] font-semibold transition-all min-h-[44px] ${state.smoker === v ? 'border-neuro-500 bg-neuro-50 text-neuro-700' : 'border-slate-200 text-slate-700 hover:border-neuro-200'}`}>
                {v === 'yes' ? 'Yes' : 'No'}
              </button>
            ))}
          </div>
        </div>

        {/* Limitations */}
        <div className="bg-white border border-slate-100 rounded-xl p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Limitations</p>
          <ul className="text-[12px] text-slate-700 space-y-1.5 leading-relaxed list-disc pl-4">
            <li>The PCE was derived from four U.S. cohorts. It may overestimate risk in contemporary populations and underestimate risk in some non-White, non-AA groups.</li>
            <li>Race-specific coefficients reflect historical cohort composition, not biology. They are imperfect and under active revision.</li>
            <li>The PCE does not apply to patients with prior clinical ASCVD. Those patients need statin regardless of calculated risk.</li>
            <li>Risk-enhancing factors (family history of premature ASCVD, Lp(a) ≥50 mg/dL, persistent LDL-C ≥160, CKD, metabolic syndrome, ApoB ≥130, ABI &lt;0.9, chronic inflammation, pre-eclampsia history, early menopause) should refine the decision at borderline or intermediate risk.</li>
            <li>Coronary artery calcium scoring can refine the decision when risk is intermediate and clinical judgement is uncertain.</li>
          </ul>
        </div>

        {/* Drawer spacer — prevents content hiding behind drawer per CALCULATOR_SPEC §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />
      </div>

      {/* ── Drawer portal — fixed above mobile bottom nav, CALCULATOR_SPEC §1.3 ── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="ascvd-drawer-content"
        stateAText={{ label: '0 of 9 entered', hint: 'Fill the form to see risk' }}
        stateBText={{ label: `${selectedCount} of 9 entered`, hint: `${totalRequired - selectedCount} more to complete` }}
        collapsedStat={
          result !== null && tierMeta
            ? `${tierMeta.label} · ${result.toFixed(1)}%`
            : ageOutOfRange
              ? 'Age out of PCE range, no result'
              : 'Complete'
        }
      >
        {result !== null && tierMeta && tier && (
          <div id="ascvd-drawer-content" role="region" aria-label="ASCVD risk interpretation" className="max-h-[60dvh] overflow-y-auto">
            <div className="px-5 pt-4 pb-6">
              {/* Headline */}
              <p data-claim="ascvd-pce-formula-2013" className={`text-xl font-semibold leading-tight ${tierMeta.headlineColor}`}>
                10-year ASCVD risk {result.toFixed(1)}%: {tierMeta.label.toLowerCase()}
              </p>
              <p className="text-sm text-slate-500 mt-1">{tierMeta.band} (Arnett 2019)</p>

              {/* Recommendation */}
              <p data-claim="ascvd-risk-tiers-2019" className="text-slate-800 font-medium leading-relaxed mt-4">
                {tierMeta.recommendation}
              </p>

              {/* Explanation */}
              <p className="text-slate-600 leading-relaxed mt-3 text-sm">
                {tierMeta.explanation}
              </p>

              {/* Derivation-range warnings */}
              {validation.warnings.length > 0 && (
                <div className="mt-4 rounded-lg bg-amber-50 border border-amber-200 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700">Outside derivation range</p>
                      <ul className="text-[12px] text-slate-700 mt-1 space-y-0.5">
                        {validation.warnings.map((w, i) => <li key={i}>{w}</li>)}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Citation + disclaimer */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Goff DC Jr et al. 2013 ACC/AHA Guideline on the Assessment of Cardiovascular Risk. Circulation 2014;129(Suppl 2):S49-S73. Risk-tier thresholds: Arnett DK et al. 2019 ACC/AHA Primary Prevention Guideline. Circulation 2019;140:e596-e646.
                </p>
                <p className="mt-3 text-xs text-slate-400 leading-relaxed">
                  Educational use only. Not a substitute for clinical judgment.
                </p>
              </div>
            </div>
          </div>
        )}
      </CalculatorDrawer>
    </div>
  );
};

export default AscvdRiskCalculator;
