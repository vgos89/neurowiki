import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  ABCD2_CITATION,
  ABCD2_AGE_OPTIONS,
  ABCD2_BP_OPTIONS,
  ABCD2_CLINICAL_OPTIONS,
  ABCD2_DURATION_OPTIONS,
  ABCD2_RISK_LABELS,
  calculateABCD2Score,
  type ABCD2Inputs,
  type ABCD2Risk,
} from '../data/abcd2ScoreData';

type ABCD2State = Partial<ABCD2Inputs>;

const emptyInputs: ABCD2State = {};

const riskColors: Record<ABCD2Risk, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-300',
};

function isABCD2Complete(inputs: ABCD2State): inputs is ABCD2Inputs {
  return (
    inputs.age !== undefined &&
    inputs.bloodPressure !== undefined &&
    inputs.clinicalFeatures !== undefined &&
    inputs.duration !== undefined &&
    inputs.diabetes !== undefined
  );
}

export default function Abcd2ScoreCalculator() {
  const [inputs, setInputs] = useState<ABCD2State>(emptyInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('abcd2_score');

  const complete = isABCD2Complete(inputs);
  const result = complete ? calculateABCD2Score(inputs) : null;
  const riskColor = result ? riskColors[result.risk] : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300';

  const handleCopy = () => {
    let text: string;
    if (complete && result) {
      const lines = [
        `ABCD² Score: ${result.score}/7`,
        `Risk: ${ABCD2_RISK_LABELS[result.risk]}`,
        `2-day stroke risk: ${result.twoDayRiskPercent}%`,
        `Age: ${inputs.age === '60plus' ? '≥60' : '<60'}`,
        `BP: ${inputs.bloodPressure === 'elevated' ? '≥140/90' : '<140/90'}`,
        `Clinical: ${inputs.clinicalFeatures === 'weakness' ? 'Unilateral weakness' : inputs.clinicalFeatures === 'speech' ? 'Speech impairment' : 'Other'}`,
        `Duration: ${inputs.duration === '60plus' ? '≥60 min' : inputs.duration === '10to59' ? '10-59 min' : '<10 min'}`,
        `Diabetes: ${inputs.diabetes ? 'Yes' : 'No'}`,
      ];
      text = lines.join('\n');
      trackResult(result.score);
    } else {
      text = 'ABCD² Score: Incomplete — select all fields.';
    }
    copyToClipboard(text, () => {
      setToast('Copied to clipboard');
      setTimeout(() => setToast(null), 2000);
    });
  };

  const handleReset = () => {
    setInputs(emptyInputs);
    resetTracking();
    setToast('Reset');
    setTimeout(() => setToast(null), 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleFavorite('abcd2');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('abcd2');

  const setAge = useCallback((v: ABCD2Inputs['age']) => setInputs((p) => ({ ...p, age: v })), []);
  const setBP = useCallback((v: ABCD2Inputs['bloodPressure']) => setInputs((p) => ({ ...p, bloodPressure: v })), []);
  const setClinical = useCallback((v: ABCD2Inputs['clinicalFeatures']) => setInputs((p) => ({ ...p, clinicalFeatures: v })), []);
  const setDuration = useCallback((v: ABCD2Inputs['duration']) => setInputs((p) => ({ ...p, duration: v })), []);
  const setDiabetes = useCallback((v: boolean) => setInputs((p) => ({ ...p, diabetes: v })), []);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700" role="banner">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={getBackPath()} className="p-2 -m-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0" aria-label="Back to calculators">
                <ArrowLeft size={20} aria-hidden="true" />
              </Link>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">ABCD² Score</div>
                <div className="flex items-baseline gap-1.5" aria-live="polite" aria-atomic="true">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{result ? result.score : '—'}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">/ 7</span>
                  {result ? (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${riskColor}`}>{ABCD2_RISK_LABELS[result.risk]}</span>
                  ) : (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${riskColor}`}>Complete all fields</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={handleFavToggle} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                <Star size={20} className={isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400 dark:text-slate-500'} aria-hidden="true" />
              </button>
              <button onClick={handleReset} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" aria-label="Reset calculator">
                <RefreshCw size={18} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
              </button>
              <button onClick={handleCopy} className="bg-slate-900 dark:bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-12">
        <h1 className="sr-only">ABCD² Score Calculator</h1>

        <section className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interpretation</h2>
          {result ? (
            <>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {ABCD2_RISK_LABELS[result.risk]} · 2-day stroke risk: <strong>{result.twoDayRiskPercent}%</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {result.risk === 'low' && 'Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score.'}
                {result.risk === 'moderate' && 'Consider admission or same-day/urgent evaluation.'}
                {result.risk === 'high' && 'Admit for workup and stroke prevention.'}
              </p>
            </>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 font-medium">Select all fields above to see score and interpretation.</p>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="abcd2-age-label">
            <h2 id="abcd2-age-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Age</h2>
            <div role="radiogroup" aria-labelledby="abcd2-age-label" className="grid grid-cols-2 gap-2">
              {ABCD2_AGE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.age === opt.value} onClick={() => setAge(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.age === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{opt.points} pt</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="abcd2-bp-label">
            <h2 id="abcd2-bp-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Blood pressure at presentation</h2>
            <div role="radiogroup" aria-labelledby="abcd2-bp-label" className="grid grid-cols-2 gap-2">
              {ABCD2_BP_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.bloodPressure === opt.value} onClick={() => setBP(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.bloodPressure === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{opt.points} pt</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="abcd2-clinical-label">
            <h2 id="abcd2-clinical-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Clinical features</h2>
            <div role="radiogroup" aria-labelledby="abcd2-clinical-label" className="grid grid-cols-1 gap-2">
              {ABCD2_CLINICAL_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.clinicalFeatures === opt.value} onClick={() => setClinical(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.clinicalFeatures === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{opt.points} pt</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="abcd2-duration-label">
            <h2 id="abcd2-duration-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Duration of symptoms</h2>
            <div role="radiogroup" aria-labelledby="abcd2-duration-label" className="grid grid-cols-1 gap-2">
              {ABCD2_DURATION_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.duration === opt.value} onClick={() => setDuration(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.duration === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{opt.points} pt</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="abcd2-diabetes-label">
            <h2 id="abcd2-diabetes-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Diabetes</h2>
            <div role="radiogroup" aria-labelledby="abcd2-diabetes-label" className="flex gap-2">
              <button type="button" role="radio" aria-checked={inputs.diabetes === false} onClick={() => setDiabetes(false)} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${inputs.diabetes === false ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>No (0 pt)</button>
              <button type="button" role="radio" aria-checked={inputs.diabetes === true} onClick={() => setDiabetes(true)} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${inputs.diabetes === true ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>Yes (1 pt)</button>
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{ABCD2_CITATION.authors}. {ABCD2_CITATION.title}. {ABCD2_CITATION.journal}. {ABCD2_CITATION.year};{ABCD2_CITATION.volume}({ABCD2_CITATION.issue}):{ABCD2_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${ABCD2_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> All TIA patients need urgent evaluation. ABCD² does not include imaging; consider ABCD²-I if DWI available. Do not use to delay workup.
          </p>
        </footer>
      </main>

      {toast && (
        <div role="status" aria-live="polite" className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-50">
          {toast}
        </div>
      )}
    </>
  );
}
