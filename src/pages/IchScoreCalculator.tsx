import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  ICH_GCS_OPTIONS,
  ICH_VOLUME_OPTIONS,
  ICH_IVH_OPTIONS,
  ICH_ORIGIN_OPTIONS,
  ICH_AGE_OPTIONS,
  ICH_MORTALITY_BY_SCORE,
  ICH_SEVERITY_LABELS,
  ICH_SCORE_CITATION,
  calculateICHScore,
  type ICHScoreInputs,
} from '../data/ichScoreData';

const defaultInputs: ICHScoreInputs = {
  gcsPoints: 0,
  volume30OrMore: false,
  ivh: false,
  infratentorial: false,
  age80OrOlder: false,
};

const IchScoreCalculator: React.FC = () => {
  const [inputs, setInputs] = useState<ICHScoreInputs>(defaultInputs);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('ich_score');

  const { score } = calculateICHScore(inputs);
  const mortality = ICH_MORTALITY_BY_SCORE[score] ?? 0;
  const severityLabel = ICH_SEVERITY_LABELS[score] ?? '—';

  const setGcs = useCallback((points: 0 | 1 | 2) => {
    setInputs((prev) => ({ ...prev, gcsPoints: points }));
  }, []);
  const setVolume = useCallback((value: boolean) => {
    setInputs((prev) => ({ ...prev, volume30OrMore: value }));
  }, []);
  const setIvh = useCallback((value: boolean) => {
    setInputs((prev) => ({ ...prev, ivh: value }));
  }, []);
  const setOrigin = useCallback((value: boolean) => {
    setInputs((prev) => ({ ...prev, infratentorial: value }));
  }, []);
  const setAge = useCallback((value: boolean) => {
    setInputs((prev) => ({ ...prev, age80OrOlder: value }));
  }, []);

  const handleCopy = () => {
    const parts = [
      `ICH Score: ${score}/6`,
      `30-day mortality: ${mortality}%`,
      `GCS: ${ICH_GCS_OPTIONS[inputs.gcsPoints].label}`,
      `ICH volume: ${inputs.volume30OrMore ? '≥30 mL' : '<30 mL'}`,
      `IVH: ${inputs.ivh ? 'Yes' : 'No'}`,
      `Origin: ${inputs.infratentorial ? 'Infratentorial' : 'Supratentorial'}`,
      `Age: ${inputs.age80OrOlder ? '≥80 years' : '<80 years'}`,
    ];
    trackResult(score);
    copyToClipboard(parts.join('\n'), () => {
      setToastMessage('Copied to clipboard');
      setTimeout(() => setToastMessage(null), 2000);
    });
  };

  const handleReset = () => {
    setInputs(defaultInputs);
    resetTracking();
    setToastMessage('Reset');
    setTimeout(() => setToastMessage(null), 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('ich');
    setToastMessage(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const isFav = isFavorite('ich');

  return (
    <>
      {/* Sticky header - mobile-friendly */}
      <header
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to={getBackPath()}
                className="p-2 -m-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
                aria-label="Back to calculators"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </Link>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ICH Score
                </div>
                <div
                  className="flex items-baseline gap-1.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`ICH Score ${score} out of 6. Estimated 30-day mortality ${mortality} percent.`}
                >
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
                    {score}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">/ 6</span>
<span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  · {mortality}% 30d mortality
                </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleFavToggle}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={20}
                  className={isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400 dark:text-slate-500'}
                  aria-hidden="true"
                />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Reset calculator"
              >
                <RefreshCw size={18} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
              </button>
              <button
                onClick={handleCopy}
                className="bg-slate-900 dark:bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
              >
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-12" id="ich-calculator-main">
        <h1 className="sr-only">ICH Score Calculator</h1>

        {/* Interpretation */}
        <section
          className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
          aria-live="polite"
        >
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
            Interpretation
          </h2>
          <p className="text-slate-800 dark:text-slate-200 font-medium">
            {severityLabel} · 30-day mortality estimate: <strong>{mortality}%</strong>
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            The ICH Score predicts 30-day mortality. Use with clinical judgment for goals-of-care discussions and prognosis.
          </p>
        </section>

        {/* 5 components */}
        <div className="space-y-6">
          {/* 1. GCS */}
          <section aria-labelledby="ich-gcs-label">
            <h2 id="ich-gcs-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              1. Glasgow Coma Scale (GCS)
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="ich-gcs-label"
              className="grid grid-cols-3 gap-2"
            >
              {ICH_GCS_OPTIONS.map((opt, idx) => (
                <button
                  key={idx}
                  type="button"
                  role="radio"
                  aria-checked={inputs.gcsPoints === opt.points}
                  onClick={() => setGcs(opt.points as 0 | 1 | 2)}
                  className={`p-3 rounded-xl border-2 text-left transition-all min-h-[44px] ${
                    inputs.gcsPoints === opt.points
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'
                  }`}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</span>
                  <span className="text-[10px] font-bold text-slate-400 mt-1">{opt.points} pt</span>
                </button>
              ))}
            </div>
          </section>

          {/* 2. ICH volume */}
          <section aria-labelledby="ich-volume-label">
            <h2 id="ich-volume-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              2. ICH volume
            </h2>
            <div role="radiogroup" aria-labelledby="ich-volume-label" className="flex gap-2">
              {ICH_VOLUME_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="radio"
                  aria-checked={inputs.volume30OrMore === opt.value}
                  onClick={() => setVolume(opt.value)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${
                    inputs.volume30OrMore === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label} ({opt.points} pt)
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ≥30 mL = 1 point. Use ABC/2 or planimetry to estimate volume.
            </p>
          </section>

          {/* 3. IVH */}
          <section aria-labelledby="ich-ivh-label">
            <h2 id="ich-ivh-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              3. Intraventricular hemorrhage (IVH)
            </h2>
            <div role="radiogroup" aria-labelledby="ich-ivh-label" className="flex gap-2">
              {ICH_IVH_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="radio"
                  aria-checked={inputs.ivh === opt.value}
                  onClick={() => setIvh(opt.value)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${
                    inputs.ivh === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label} ({opt.points} pt)
                </button>
              ))}
            </div>
          </section>

          {/* 4. Origin */}
          <section aria-labelledby="ich-origin-label">
            <h2 id="ich-origin-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              4. Infratentorial origin
            </h2>
            <div role="radiogroup" aria-labelledby="ich-origin-label" className="flex gap-2">
              {ICH_ORIGIN_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={inputs.infratentorial === (opt.value === 'infratentorial')}
                  onClick={() => setOrigin(opt.value === 'infratentorial')}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${
                    inputs.infratentorial === (opt.value === 'infratentorial')
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label} ({opt.points} pt)
                </button>
              ))}
            </div>
          </section>

          {/* 5. Age */}
          <section aria-labelledby="ich-age-label">
            <h2 id="ich-age-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
              5. Age
            </h2>
            <div role="radiogroup" aria-labelledby="ich-age-label" className="flex gap-2">
              {ICH_AGE_OPTIONS.map((opt) => (
                <button
                  key={String(opt.value)}
                  type="button"
                  role="radio"
                  aria-checked={inputs.age80OrOlder === opt.value}
                  onClick={() => setAge(opt.value)}
                  className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${
                    inputs.age80OrOlder === opt.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
                      : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {opt.label} ({opt.points} pt)
                </button>
              ))}
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              ≥80 years = 1 point.
            </p>
          </section>
        </div>

        {/* Evidence citation */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong>{' '}
            <cite>
              {ICH_SCORE_CITATION.authors}. {ICH_SCORE_CITATION.title}. {ICH_SCORE_CITATION.journal}. {ICH_SCORE_CITATION.year};{ICH_SCORE_CITATION.volume}({ICH_SCORE_CITATION.issue}):{ICH_SCORE_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${ICH_SCORE_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              DOI
            </a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> This tool is for clinical decision support and education. It is not a substitute for professional medical judgment. Do not enter patient-identifying information. Verify calculations independently when used in patient care.
          </p>
        </footer>
      </main>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full shadow-lg text-sm font-medium z-50"
        >
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default IchScoreCalculator;
