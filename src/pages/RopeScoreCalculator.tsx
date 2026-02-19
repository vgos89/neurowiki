import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  ROPE_CITATION,
  ROPE_AGE_OPTIONS,
  calculateROPEScore,
  type RoPEInputs,
  type RoPEAgeBand,
} from '../data/ropeScoreData';

const defaultInputs: RoPEInputs = {
  ageBand: '50_59',
  noHypertension: false,
  noDiabetes: false,
  noPriorStrokeTIA: false,
  nonsmoker: false,
  corticalInfarct: false,
};

export default function RopeScoreCalculator() {
  const [inputs, setInputs] = useState<RoPEInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('rope_score');

  const result = calculateROPEScore(inputs);

  const handleCopy = () => {
    const lines = [
      `RoPE Score: ${result.score}/10`,
      `PFO-attributable fraction: ${result.pfoAttributablePercent}%`,
      `Age band: ${ROPE_AGE_OPTIONS.find((o) => o.value === inputs.ageBand)?.label ?? inputs.ageBand}`,
      `No hypertension: ${inputs.noHypertension ? 'Yes' : 'No'}`,
      `No diabetes: ${inputs.noDiabetes ? 'Yes' : 'No'}`,
      `No prior stroke/TIA: ${inputs.noPriorStrokeTIA ? 'Yes' : 'No'}`,
      `Nonsmoker: ${inputs.nonsmoker ? 'Yes' : 'No'}`,
      `Cortical infarct on imaging: ${inputs.corticalInfarct ? 'Yes' : 'No'}`,
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
    const now = toggleFavorite('rope');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('rope');

  const setAge = useCallback((v: RoPEAgeBand) => setInputs((p) => ({ ...p, ageBand: v })), []);
  const setNoHypertension = useCallback((v: boolean) => setInputs((p) => ({ ...p, noHypertension: v })), []);
  const setNoDiabetes = useCallback((v: boolean) => setInputs((p) => ({ ...p, noDiabetes: v })), []);
  const setNoPriorStrokeTIA = useCallback((v: boolean) => setInputs((p) => ({ ...p, noPriorStrokeTIA: v })), []);
  const setNonsmoker = useCallback((v: boolean) => setInputs((p) => ({ ...p, nonsmoker: v })), []);
  const setCorticalInfarct = useCallback((v: boolean) => setInputs((p) => ({ ...p, corticalInfarct: v })), []);

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
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">RoPE Score</div>
                <div className="flex items-baseline gap-1.5" aria-live="polite" aria-atomic="true">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{result.score}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">/ 10</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400">· PFO-attributable {result.pfoAttributablePercent}%</span>
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
        <h1 className="sr-only">RoPE Score Calculator</h1>

        <section className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interpretation</h2>
          <p className="text-slate-800 dark:text-slate-200 font-medium">
            PFO-attributable fraction: <strong>{result.pfoAttributablePercent}%</strong>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Percentage of the cryptogenic stroke likely attributable to the PFO. Higher RoPE = more likely PFO is causative; useful when considering PFO closure (RESPECT, CLOSE, REDUCE). Use with imaging and cardiology input.
          </p>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="rope-age-label">
            <h2 id="rope-age-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Age</h2>
            <div role="radiogroup" aria-labelledby="rope-age-label" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROPE_AGE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.ageBand === opt.value} onClick={() => setAge(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.ageBand === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1 block">{opt.points} pt</span>
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="rope-checkboxes-label">
            <h2 id="rope-checkboxes-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Other criteria (1 point each)</h2>
            <div className="space-y-2">
              {[
                { key: 'noHypertension' as const, label: 'No hypertension', set: setNoHypertension, val: inputs.noHypertension },
                { key: 'noDiabetes' as const, label: 'No diabetes', set: setNoDiabetes, val: inputs.noDiabetes },
                { key: 'noPriorStrokeTIA' as const, label: 'No stroke/TIA before index event', set: setNoPriorStrokeTIA, val: inputs.noPriorStrokeTIA },
                { key: 'nonsmoker' as const, label: 'Nonsmoker', set: setNonsmoker, val: inputs.nonsmoker },
                { key: 'corticalInfarct' as const, label: 'Cortical infarct on imaging', set: setCorticalInfarct, val: inputs.corticalInfarct },
              ].map(({ key, label, set, val }) => (
                <label key={key} className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                  <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                  <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{ROPE_CITATION.authors}. {ROPE_CITATION.title}. {ROPE_CITATION.journal}. {ROPE_CITATION.year};{ROPE_CITATION.volume}({ROPE_CITATION.issue}):{ROPE_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${ROPE_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> For cryptogenic stroke when PFO is detected or suspected. Does not replace multidisciplinary decision-making for PFO closure.
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
