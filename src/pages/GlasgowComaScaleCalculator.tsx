import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  GCS_CITATION,
  GCS_EYE_OPTIONS,
  GCS_VERBAL_OPTIONS,
  GCS_MOTOR_OPTIONS,
  GCS_SEVERITY_LABELS,
  calculateGCS,
  type GCSInputs,
  type GCSSeverity,
} from '../data/gcsScoreData';

type GCSState = Partial<GCSInputs> & { verbalNotTestable?: boolean; eyeNotTestable?: boolean };

const emptyInputs: GCSState = {
  verbalNotTestable: false,
  eyeNotTestable: false,
};

const severityColors: Record<GCSSeverity, string> = {
  mild: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300',
  severe: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-300',
  deep_coma: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-100 border-red-400',
};

function isGCSComplete(inputs: GCSState): inputs is GCSInputs {
  const hasMotor = inputs.motor !== undefined;
  const hasEye = inputs.eyeNotTestable === true || inputs.eye !== undefined;
  const hasVerbal = inputs.verbalNotTestable === true || inputs.verbal !== undefined;
  return hasMotor && hasEye && hasVerbal;
}

export default function GlasgowComaScaleCalculator() {
  const [inputs, setInputs] = useState<GCSState>(emptyInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('gcs');

  const complete = isGCSComplete(inputs);
  const fullInputsForScore: GCSInputs | null = complete
    ? {
        eye: (inputs.eye ?? 1) as GCSInputs['eye'],
        verbal: (inputs.verbal ?? 1) as GCSInputs['verbal'],
        motor: inputs.motor!,
        verbalNotTestable: inputs.verbalNotTestable ?? false,
        eyeNotTestable: inputs.eyeNotTestable ?? false,
      }
    : null;
  const result = fullInputsForScore ? calculateGCS(fullInputsForScore) : null;
  const severityColor = result ? severityColors[result.severity] : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300';

  const handleCopy = () => {
    let text: string;
    if (complete && result) {
      const vLabel = result.verbal === 'T' ? 'T (not testable)' : String(result.verbal);
      const lines = [
        `GCS: ${result.display}`,
        `Severity: ${GCS_SEVERITY_LABELS[result.severity]}`,
        `Eye: ${result.eye}${inputs.eyeNotTestable ? ' (not testable)' : ''}`,
        `Verbal: ${vLabel}`,
        `Motor: ${result.motor}`,
      ];
      text = lines.join('\n');
      trackResult(result.total);
    } else {
      text = 'GCS: Incomplete — select Eye, Verbal, and Motor.';
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
    const now = toggleFavorite('gcs');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('gcs');

  const setEye = useCallback((v: GCSInputs['eye']) => setInputs((p) => ({ ...p, eye: v })), []);
  const setVerbal = useCallback((v: GCSInputs['verbal']) => setInputs((p) => ({ ...p, verbal: v })), []);
  const setMotor = useCallback((v: GCSInputs['motor']) => setInputs((p) => ({ ...p, motor: v })), []);
  const setVerbalNotTestable = useCallback((v: boolean) => setInputs((p) => ({ ...p, verbalNotTestable: v })), []);
  const setEyeNotTestable = useCallback((v: boolean) => setInputs((p) => ({ ...p, eyeNotTestable: v })), []);

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
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Glasgow Coma Scale</div>
                <div className="flex items-baseline gap-1.5" aria-live="polite" aria-atomic="true">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{result ? result.display : '—'}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">/ 15</span>
                  {result ? (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${severityColor}`}>{GCS_SEVERITY_LABELS[result.severity]}</span>
                  ) : (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${severityColor}`}>Select E, V, M</span>
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
        <h1 className="sr-only">Glasgow Coma Scale Calculator</h1>

        <section className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interpretation</h2>
          {result ? (
            <>
              <p className="text-slate-800 dark:text-slate-200 font-medium">
                {GCS_SEVERITY_LABELS[result.severity]}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                GCS ≤8 often indicates need for airway protection. Document &quot;T&quot; when verbal is not testable (e.g. intubated). GCS = global consciousness (trauma, coma, ICU); NIHSS = focal stroke severity.
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Used in <Link to="/calculators/ich-score" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">ICH Score</Link> (GCS 13–15 = 0 pt, 5–12 = 1 pt, 3–4 = 2 pt).
              </p>
            </>
          ) : (
            <p className="text-slate-600 dark:text-slate-400 font-medium">Select Eye, Verbal, and Motor above to see score and interpretation.</p>
          )}
        </section>

        <div className="space-y-6">
          <section aria-labelledby="gcs-eye-label">
            <h2 id="gcs-eye-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Eye (1–4)</h2>
            <label className="flex items-center gap-2 mb-2 p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
              <input type="checkbox" checked={!!inputs.eyeNotTestable} onChange={(e) => setEyeNotTestable(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Eye not testable (e.g. closed, swollen)</span>
            </label>
            {!inputs.eyeNotTestable && (
              <div role="radiogroup" aria-labelledby="gcs-eye-label" className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {GCS_EYE_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" role="radio" aria-checked={inputs.eye === opt.value} onClick={() => setEye(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.eye === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                    <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="gcs-verbal-label">
            <h2 id="gcs-verbal-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Verbal (1–5)</h2>
            <label className="flex items-center gap-2 mb-2 p-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20">
              <input type="checkbox" checked={!!inputs.verbalNotTestable} onChange={(e) => setVerbalNotTestable(e.target.checked)} className="w-4 h-4 rounded text-blue-600" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Verbal not testable (e.g. intubated)</span>
            </label>
            {!inputs.verbalNotTestable && (
              <div role="radiogroup" aria-labelledby="gcs-verbal-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {GCS_VERBAL_OPTIONS.map((opt) => (
                  <button key={opt.value} type="button" role="radio" aria-checked={inputs.verbal === opt.value} onClick={() => setVerbal(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.verbal === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                    <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                    <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</span>
                  </button>
                ))}
              </div>
            )}
          </section>

          <section aria-labelledby="gcs-motor-label">
            <h2 id="gcs-motor-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Motor (1–6)</h2>
            <div role="radiogroup" aria-labelledby="gcs-motor-label" className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {GCS_MOTOR_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.motor === opt.value} onClick={() => setMotor(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.motor === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
                  <span className="font-semibold text-slate-900 dark:text-white">{opt.label}</span>
                  <span className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.description}</span>
                </button>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{GCS_CITATION.authors}. {GCS_CITATION.title}. {GCS_CITATION.journal}. {GCS_CITATION.year};{GCS_CITATION.volume}({GCS_CITATION.issue}):{GCS_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${GCS_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> Confounders (sedation, aphasia, intubation) affect interpretation; document not-testable components.
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
