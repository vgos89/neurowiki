import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import {
  HEIDELBERG_CITATION,
  HEIDELBERG_OPTIONS,
  classifyHeidelbergBleeding,
  type HeidelbergClass,
  type HeidelbergInputs,
} from '../data/heidelbergBleedingData';

type HeidelbergState = Partial<HeidelbergInputs>;

const emptyInputs: HeidelbergState = {};

export default function HeidelbergBleedingCalculator() {
  const [inputs, setInputs] = useState<HeidelbergState>(emptyInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('heidelberg_bleeding');

  const hasClass = inputs.bleedingClass != null;
  const result = hasClass ? classifyHeidelbergBleeding({ bleedingClass: inputs.bleedingClass!, symptomatic: inputs.symptomatic }) : null;

  const copyToClipboard = () => {
    if (result && hasClass) {
      const lines = [
        `Heidelberg Bleeding Classification: ${result.classification}`,
        result.clinicalSignificance,
        `Management: ${result.managementNote}`,
        `Symptomatic (SICH): ${inputs.symptomatic ? 'Yes' : 'No'}`,
      ];
      navigator.clipboard.writeText(lines.join('\n'));
      trackResult(result.shortLabel);
    } else {
      navigator.clipboard.writeText('Heidelberg Bleeding Classification: Select a bleeding class.');
    }
    setToast('Copied to clipboard');
    setTimeout(() => setToast(null), 2000);
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
    const now = toggleFavorite('heidelberg-bleeding');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('heidelberg-bleeding');
  const setClass = useCallback((v: HeidelbergClass) => setInputs((p) => ({ ...p, bleedingClass: v })), []);
  const setSymptomatic = useCallback((v: boolean) => setInputs((p) => ({ ...p, symptomatic: v })), []);

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
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Heidelberg Bleeding Classification</div>
                <div className="flex items-baseline gap-1.5" aria-live="polite" aria-atomic="true">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{result ? result.shortLabel : '—'}</span>
                  {!result && <span className="text-sm text-slate-500 dark:text-slate-400">Select class</span>}
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
              <button onClick={copyToClipboard} className="bg-slate-900 dark:bg-slate-700 text-white px-3 md:px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors">
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-12">
        <h1 className="sr-only">Heidelberg Bleeding Classification Calculator</h1>

        <section className="mb-6 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Scope</h2>
          <p className="text-sm text-slate-800 dark:text-slate-200">
            This classification is for <strong>hemorrhagic transformation after ischemic stroke and reperfusion therapy</strong> (tPA or thrombectomy). It is not for spontaneous ICH location. Use brain imaging within 48 hours of reperfusion and as needed for new symptoms.
          </p>
        </section>

        {result && (
          <section className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50" aria-live="polite">
            <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interpretation</h2>
            <p className="text-slate-800 dark:text-slate-200 font-medium">{result.classification}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{result.clinicalSignificance}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{result.managementNote}</p>
          </section>
        )}

        <div className="space-y-6">
          <section aria-labelledby="heidelberg-class-label">
            <h2 id="heidelberg-class-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Bleeding class</h2>
            <div role="radiogroup" aria-labelledby="heidelberg-class-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HEIDELBERG_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  role="radio"
                  aria-checked={inputs.bleedingClass === opt.value}
                  onClick={() => setClass(opt.value)}
                  className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.bleedingClass === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}
                >
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</span>
                </button>
              ))}
            </div>
          </section>

          {hasClass && (
            <section aria-labelledby="heidelberg-symptomatic-label">
              <h2 id="heidelberg-symptomatic-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Symptomatic ICH (SICH)?</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">New hemorrhage associated with ≥4 pt NIHSS increase, ≥2 pt in one subcategory, or leading to intubation/hemicraniectomy/EVD, with no other explanation.</p>
              <div role="radiogroup" aria-labelledby="heidelberg-symptomatic-label" className="flex gap-2">
                <button type="button" role="radio" aria-checked={inputs.symptomatic === false} onClick={() => setSymptomatic(false)} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${inputs.symptomatic === false ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>Asymptomatic (aSICH)</button>
                <button type="button" role="radio" aria-checked={inputs.symptomatic === true} onClick={() => setSymptomatic(true)} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium transition-all ${inputs.symptomatic === true ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>Symptomatic (SICH)</button>
              </div>
            </section>
          )}
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{HEIDELBERG_CITATION.authors}. {HEIDELBERG_CITATION.title}. {HEIDELBERG_CITATION.journal}. {HEIDELBERG_CITATION.year};{HEIDELBERG_CITATION.volume}({HEIDELBERG_CITATION.issue}):{HEIDELBERG_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${HEIDELBERG_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> For hemorrhagic transformation after reperfusion therapy. Does not replace clinical judgment. HI = hemorrhagic infarction; PH = parenchymal hematoma (ECASS terminology).
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
