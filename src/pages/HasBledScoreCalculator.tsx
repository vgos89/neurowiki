import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import {
  HASBLED_CITATION,
  HASBLED_RISK_LABELS,
  HASBLED_BLEEDS_PER_100,
  calculateHASBLEDScore,
  type HASBLEDInputs,
  type HASBLEDRisk,
} from '../data/hasBledScoreData';

const defaultInputs: HASBLEDInputs = {
  hypertension: false,
  abnormalRenal: false,
  abnormalLiver: false,
  strokeHistory: false,
  priorBleeding: false,
  onWarfarin: false,
  labileINR: false,
  elderly: false,
  drugs: false,
  alcohol: false,
};

const riskColors: Record<HASBLEDRisk, string> = {
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-300',
  very_high: 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-100 border-red-400',
};

const CHECKBOX_ITEMS: { key: keyof HASBLEDInputs; label: string; sublabel?: string }[] = [
  { key: 'hypertension', label: 'Hypertension (SBP >160 mmHg)', sublabel: '1 pt' },
  { key: 'abnormalRenal', label: 'Abnormal renal function', sublabel: 'Dialysis, transplant, or Cr >2.26 mg/dL · 1 pt' },
  { key: 'abnormalLiver', label: 'Abnormal liver function', sublabel: 'Cirrhosis or bilirubin >2× or AST/ALT/AP >3× · 1 pt' },
  { key: 'strokeHistory', label: 'Stroke history', sublabel: '1 pt' },
  { key: 'priorBleeding', label: 'Prior major bleeding or predisposition', sublabel: '1 pt' },
  { key: 'elderly', label: 'Elderly (>65 years)', sublabel: '1 pt' },
  { key: 'drugs', label: 'Drugs (antiplatelet or NSAIDs)', sublabel: '1 pt' },
  { key: 'alcohol', label: 'Alcohol (≥8 drinks/week)', sublabel: '1 pt' },
];

export default function HasBledScoreCalculator() {
  const [inputs, setInputs] = useState<HASBLEDInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('has_bled_score');

  const result = calculateHASBLEDScore(inputs);
  const riskColor = riskColors[result.risk];

  const copyToClipboard = () => {
    const lines = [
      `HAS-BLED Score: ${result.score}/9`,
      `Risk: ${HASBLED_RISK_LABELS[result.risk]}`,
      `Major bleeds: ${result.bleedsPer100PatientYears} per 100 patient-years`,
      `Hypertension: ${inputs.hypertension ? 'Yes' : 'No'}`,
      `Abnormal renal: ${inputs.abnormalRenal ? 'Yes' : 'No'}`,
      `Abnormal liver: ${inputs.abnormalLiver ? 'Yes' : 'No'}`,
      `Stroke history: ${inputs.strokeHistory ? 'Yes' : 'No'}`,
      `Prior bleeding: ${inputs.priorBleeding ? 'Yes' : 'No'}`,
      `On warfarin / Labile INR: ${inputs.onWarfarin && inputs.labileINR ? 'Yes' : 'No'}`,
      `Elderly >65: ${inputs.elderly ? 'Yes' : 'No'}`,
      `Drugs (antiplatelet/NSAIDs): ${inputs.drugs ? 'Yes' : 'No'}`,
      `Alcohol ≥8/wk: ${inputs.alcohol ? 'Yes' : 'No'}`,
    ];
    navigator.clipboard.writeText(lines.join('\n'));
    setToast('Copied to clipboard');
    setTimeout(() => setToast(null), 2000);
    trackResult(result.score);
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
    const now = toggleFavorite('has-bled');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('has-bled');

  const setCheck = useCallback((key: keyof HASBLEDInputs, value: boolean) => {
    setInputs((p) => ({ ...p, [key]: value }));
  }, []);

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
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">HAS-BLED Score</div>
                <div className="flex items-baseline gap-1.5" aria-live="polite" aria-atomic="true">
                  <span className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tabular-nums">{result.score}</span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">/ 9</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${riskColor}`}>{HASBLED_RISK_LABELS[result.risk]}</span>
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
        <h1 className="sr-only">HAS-BLED Score Calculator</h1>

        <section className="mb-6 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Important</h2>
          <p className="text-sm text-slate-800 dark:text-slate-200 font-medium">
            HAS-BLED estimates bleeding risk; it does <strong>not</strong> mean &quot;do not anticoagulate.&quot; Address modifiable risks (BP, alcohol, NSAIDs, labile INR) and use for monitoring—not to withhold anticoagulation. Stroke risk (e.g. CHA2DS2-VASc) and shared decision-making drive anticoagulation.
          </p>
        </section>

        <section className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interpretation</h2>
          <p className="text-slate-800 dark:text-slate-200 font-medium">
            {HASBLED_RISK_LABELS[result.risk]} · <strong>{result.bleedsPer100PatientYears}</strong> major bleeds per 100 patient-years
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            {result.risk === 'low' && 'Low bleeding risk. Continue to address modifiable factors.'}
            {result.risk === 'moderate' && 'Moderate risk. Address modifiable factors and monitor.'}
            {(result.risk === 'high' || result.risk === 'very_high') && 'High risk. Fix modifiable risks (BP, alcohol, NSAIDs, INR control); do not withhold anticoagulation for stroke prevention alone.'}
          </p>
        </section>

        <div className="space-y-4">
          {CHECKBOX_ITEMS.map(({ key, label, sublabel }) => (
            <section key={key} aria-labelledby={`hasbled-${key}`}>
              <h2 id={`hasbled-${key}`} className="sr-only">{label}</h2>
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer transition-all border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input
                  type="checkbox"
                  checked={!!inputs[key]}
                  onChange={(e) => setCheck(key, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  aria-describedby={sublabel ? `hasbled-desc-${key}` : undefined}
                />
                <span className="flex-1">
                  <span className="font-semibold text-slate-900 dark:text-white">{label}</span>
                  {sublabel && <span id={`hasbled-desc-${key}`} className="block text-xs text-slate-500 dark:text-slate-400 mt-0.5">{sublabel}</span>}
                </span>
              </label>
            </section>
          ))}

          <section aria-labelledby="hasbled-warfarin-label">
            <h2 id="hasbled-warfarin-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Labile INR (only if on warfarin)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Add 1 point only when the patient is on warfarin and has labile INR (e.g. TTR &lt;60%). Not applicable for DOAC-only.</p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input type="radio" name="warfarin" checked={!inputs.onWarfarin} onChange={() => setInputs((p) => ({ ...p, onWarfarin: false, labileINR: false }))} className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900 dark:text-white">Not on warfarin (0 pt)</span>
              </label>
              <label className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input type="radio" name="warfarin" checked={inputs.onWarfarin && !inputs.labileINR} onChange={() => setInputs((p) => ({ ...p, onWarfarin: true, labileINR: false }))} className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900 dark:text-white">On warfarin, stable INR (0 pt)</span>
              </label>
              <label className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input type="radio" name="warfarin" checked={inputs.onWarfarin && inputs.labileINR} onChange={() => setInputs((p) => ({ ...p, onWarfarin: true, labileINR: true }))} className="w-4 h-4 text-blue-600" />
                <span className="font-medium text-slate-900 dark:text-white">On warfarin, labile INR (1 pt)</span>
              </label>
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{HASBLED_CITATION.authors}. {HASBLED_CITATION.title}. {HASBLED_CITATION.journal}. {HASBLED_CITATION.year};{HASBLED_CITATION.volume}({HASBLED_CITATION.issue}):{HASBLED_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${HASBLED_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> High HAS-BLED does not contraindicate anticoagulation. Use to address modifiable risks and guide monitoring.
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
