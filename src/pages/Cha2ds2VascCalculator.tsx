import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  calculateCha2ds2Vasc,
  RISK_LABELS,
  RISK_GUIDANCE,
  PRIMARY_CITATION,
  GUIDELINE_CITATION,
  type Cha2ds2VascInputs,
  type Cha2ds2VascRisk,
} from '../data/cha2ds2VascData';

const defaultInputs: Cha2ds2VascInputs = {
  chf: false,
  hypertension: false,
  age75plus: false,
  age65to74: false,
  diabetes: false,
  strokeTia: false,
  vascularDisease: false,
  female: false,
};

const riskColors: Record<Cha2ds2VascRisk, string> = {
  very_low:
    'bg-emerald-100 text-emerald-800 border-emerald-300',
  low_moderate:
    'bg-amber-100 text-amber-800 border-amber-300',
  moderate_high:
    'bg-orange-100 text-orange-800 border-orange-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

interface CheckItem {
  key: keyof Cha2ds2VascInputs;
  label: string;
  points: number;
  sublabel?: string;
}

const CHECKBOX_ITEMS: CheckItem[] = [
  {
    key: 'chf',
    label: 'Congestive heart failure / LV dysfunction',
    points: 1,
    sublabel: 'Moderate-severe systolic or diastolic dysfunction on echo, or HF requiring treatment',
  },
  {
    key: 'hypertension',
    label: 'Hypertension',
    points: 1,
    sublabel: 'Resting BP >140/90 mmHg on ≥2 occasions, or antihypertensive treatment',
  },
  {
    key: 'diabetes',
    label: 'Diabetes mellitus',
    points: 1,
    sublabel: 'Fasting glucose >125 mg/dL (7 mmol/L) or treatment with oral hypoglycaemic agent or insulin',
  },
  {
    key: 'strokeTia',
    label: 'Stroke / TIA / thromboembolism',
    points: 2,
    sublabel: '2 pts — prior stroke, TIA, or systemic thromboembolism',
  },
  {
    key: 'vascularDisease',
    label: 'Vascular disease',
    points: 1,
    sublabel: 'Prior MI, peripheral arterial disease, or aortic plaque',
  },
  {
    key: 'female',
    label: 'Female sex',
    points: 1,
    sublabel: 'Sex category — adds 1 pt; does not independently indicate anticoagulation',
  },
];

export default function Cha2ds2VascCalculator() {
  const [inputs, setInputs] = useState<Cha2ds2VascInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('chads_vasc_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'chads-vasc',
      title: 'CHA₂DS₂-VASc',
      subtitle: 'AF stroke risk — anticoagulation threshold',
      category: 'risk',
      trail: '0–9',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = calculateCha2ds2Vasc(inputs);
  const riskColor = riskColors[result.risk];

  const handleCopy = () => {
    const ageLabel = inputs.age75plus
      ? 'Age ≥75 (2 pts)'
      : inputs.age65to74
      ? 'Age 65–74 (1 pt)'
      : 'Age <65 (0 pts)';
    const lines = [
      `CHA₂DS₂-VASc Score: ${result.score}/9`,
      `Risk: ${RISK_LABELS[result.risk]}`,
      `Annual stroke rate: ~${result.annualStrokeRate}% per year`,
      `CHF / LV dysfunction: ${inputs.chf ? 'Yes' : 'No'}`,
      `Hypertension: ${inputs.hypertension ? 'Yes' : 'No'}`,
      ageLabel,
      `Diabetes: ${inputs.diabetes ? 'Yes' : 'No'}`,
      `Stroke/TIA/thromboembolism: ${inputs.strokeTia ? 'Yes' : 'No'}`,
      `Vascular disease: ${inputs.vascularDisease ? 'Yes' : 'No'}`,
      `Female sex: ${inputs.female ? 'Yes' : 'No'}`,
    ];
    trackResult(result.score);
    copyToClipboard(lines.join('\n'), () => {
      setToast('Copied to clipboard');
      setTimeout(() => setToast(null), 2000);
    });
  };

  const handleReset = () => {
    setInputs(defaultInputs);
    resetTracking();
    setToast('Reset');
    setTimeout(() => setToast(null), 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleFavorite('chads-vasc');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('chads-vasc');

  const setCheck = useCallback((key: keyof Cha2ds2VascInputs, value: boolean) => {
    setInputs((p) => ({ ...p, [key]: value }));
  }, []);

  const setAge = useCallback((age: 'under65' | '65to74' | '75plus') => {
    setInputs((p) => ({
      ...p,
      age75plus: age === '75plus',
      age65to74: age === '65to74',
    }));
  }, []);

  return (
    <>
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 -m-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0"
                aria-label="Back to calculators"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  CHA₂DS₂-VASc Score
                </div>
                <div
                  className="flex items-baseline gap-1.5"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 tabular-nums">
                    {result.score}
                  </span>
                  <span className="text-slate-400 text-sm">/ 9</span>
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded border ${riskColor}`}
                  >
                    {RISK_LABELS[result.risk]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleFavToggle}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={20}
                  className={
                    isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400'
                  }
                  aria-hidden="true"
                />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Reset calculator"
              >
                <RefreshCw size={18} className="text-slate-500" aria-hidden="true" />
              </button>
              <button
                onClick={handleCopy}
                className="bg-neuro-500 hover:bg-neuro-600 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-12">
        <h1 className="sr-only">CHA₂DS₂-VASc Score Calculator</h1>

        {/* Interpretation panel */}
        <section
          className="mb-6 p-4 rounded-xl border border-slate-100 bg-white"
          aria-live="polite"
        >
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Interpretation
          </h2>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-bold text-slate-900">
              {RISK_LABELS[result.risk]}
            </span>
            {result.annualStrokeRate > 0 && (
              <span className="text-sm text-slate-600">
                ·{' '}
                <strong className="text-slate-800">
                  ~{result.annualStrokeRate}%
                </strong>{' '}
                annual stroke rate
              </span>
            )}
          </div>
          <p className="text-sm text-slate-700">
            {RISK_GUIDANCE[result.risk]}
          </p>
          {(result.risk === 'moderate_high' || result.risk === 'high') && (
            <p className="text-xs text-slate-500 mt-2">
              Assess bleeding risk with{' '}
              <Link
                to="/calculators/has-bled-score"
                className="text-neuro-600 hover:underline font-medium"
              >
                HAS-BLED Score
              </Link>
              . High HAS-BLED does not contraindicate anticoagulation — address modifiable risks.
            </p>
          )}
        </section>

        {/* Age selector */}
        <section className="mb-4" aria-labelledby="chads-age-label">
          <h2
            id="chads-age-label"
            className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2"
          >
            Age
          </h2>
          <div className="flex flex-wrap gap-2">
            {(
              [
                { value: 'under65', label: 'Under 65 (0 pts)' },
                { value: '65to74', label: '65–74 (1 pt)' },
                { value: '75plus', label: '≥75 (2 pts)' },
              ] as const
            ).map(({ value, label }) => {
              const checked =
                value === '75plus'
                  ? inputs.age75plus
                  : value === '65to74'
                  ? inputs.age65to74
                  : !inputs.age75plus && !inputs.age65to74;
              return (
                <label
                  key={value}
                  className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer transition-all border-slate-200 hover:border-slate-300 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50"
                >
                  <input
                    type="radio"
                    name="chads-age"
                    checked={checked}
                    onChange={() => setAge(value)}
                    className="w-4 h-4 text-neuro-600 focus:ring-neuro-500"
                  />
                  <span className="font-medium text-slate-900 text-sm">
                    {label}
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        {/* Clinical risk factor checkboxes */}
        <div className="space-y-3">
          {CHECKBOX_ITEMS.map(({ key, label, points, sublabel }) => (
            <section key={key} aria-labelledby={`chads-${key}`}>
              <h2 id={`chads-${key}`} className="sr-only">
                {label}
              </h2>
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer transition-all border-slate-200 hover:border-slate-300 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50">
                <input
                  type="checkbox"
                  checked={!!inputs[key]}
                  onChange={(e) => setCheck(key, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-neuro-600 focus:ring-neuro-500"
                  aria-describedby={sublabel ? `chads-desc-${key}` : undefined}
                />
                <span className="flex-1">
                  <span className="font-semibold text-slate-900">{label}</span>
                  <span className="ml-1.5 text-xs font-medium text-slate-400">
                    {points === 2 ? '2 pts' : '1 pt'}
                  </span>
                  {sublabel && (
                    <span
                      id={`chads-desc-${key}`}
                      className="block text-xs text-slate-500 mt-0.5"
                    >
                      {sublabel}
                    </span>
                  )}
                </span>
              </label>
            </section>
          ))}
        </div>

        {/* Score legend */}
        <section
          className="mt-8 p-4 rounded-xl border border-slate-100 bg-slate-50"
          aria-label="Score reference table"
        >
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
            Annual Stroke Risk by Score
          </h2>
          <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600">
            {[
              { score: 0, rate: '0%', note: 'Very low' },
              { score: 1, rate: '~1.3%', note: 'Low-moderate' },
              { score: 2, rate: '~2.2%', note: 'Moderate-high' },
              { score: 3, rate: '~3.2%', note: '' },
              { score: 4, rate: '~4.0%', note: '' },
              { score: 5, rate: '~6.7%', note: 'High' },
              { score: 6, rate: '~9.8%', note: '' },
              { score: 7, rate: '~9.6%', note: '' },
              { score: 8, rate: '~12.5%', note: '' },
              { score: 9, rate: '~15.2%', note: '' },
            ].map(({ score, rate, note }) => (
              <div
                key={score}
                className={`flex justify-between py-0.5 ${
 result.score === score ? 'text-neuro-700 font-semibold' : ''
 }`}
              >
                <span>
                  Score {score}
                  {note ? <span className="text-slate-400 ml-1">({note})</span> : ''}
                </span>
                <span>{rate}</span>
              </div>
            ))}
          </div>
          <p className="mt-2 text-[10px] text-slate-400">
            Unadjusted rates per 100 patient-years, Euro Heart Survey cohort (Lip GY et al. Chest 2010, Table 3). Rates in other AF registries vary.
          </p>
        </section>

        {/* Footer citations */}
        <footer className="mt-8 pt-6 border-t border-slate-200 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Score derivation
            </p>
            <p className="text-xs text-slate-500">
              <cite>
                {PRIMARY_CITATION.authors}. {PRIMARY_CITATION.title}.{' '}
                <em>{PRIMARY_CITATION.journal}</em>. {PRIMARY_CITATION.year};
                {PRIMARY_CITATION.volume}({PRIMARY_CITATION.issue}):{PRIMARY_CITATION.pages}.
              </cite>{' '}
              <a
                href={`https://doi.org/${PRIMARY_CITATION.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neuro-600 hover:underline"
              >
                DOI
              </a>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Guideline
            </p>
            <p className="text-xs text-slate-500">
              <cite>
                {GUIDELINE_CITATION.authors}. {GUIDELINE_CITATION.title}.{' '}
                <em>{GUIDELINE_CITATION.journal}</em>. {GUIDELINE_CITATION.year};
                {GUIDELINE_CITATION.volume}({GUIDELINE_CITATION.issue}):{GUIDELINE_CITATION.pages}.
              </cite>{' '}
              <a
                href={`https://doi.org/${GUIDELINE_CITATION.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neuro-600 hover:underline"
              >
                DOI
              </a>
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 mb-1">
              Supporting evidence
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stroke reduction with anticoagulation demonstrated in landmark AF trials: AFASAK
              (warfarin vs aspirin), BAFTA (warfarin in elderly), RE-LY (dabigatran; Connolly 2009{' '}
              <em>NEJM</em>), and ARISTOTLE (apixaban; Granger 2011 <em>NEJM</em>).
            </p>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            <strong>Educational use only.</strong> Validated for non-valvular AF. Recommendation
            tier uses the sex-stratified guideline thresholds: COR 1 at total score ≥2 in men or
            ≥3 in women (i.e., ≥2 non-sex clinical risk factors plus female sex). Female sex alone
            does not warrant anticoagulation. Confirm with institutional guidelines and exercise
            clinical judgment.
          </p>
        </footer>
      </main>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-50"
        >
          {toast}
        </div>
      )}
    </>
  );
}
