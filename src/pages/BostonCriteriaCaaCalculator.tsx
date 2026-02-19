import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  BOSTON_CAA_CITATION,
  assessBostonCriteria,
  type BostonCaaInputs,
} from '../data/bostonCriteriaCaaData';

const defaultInputs: BostonCaaInputs = {
  age: 50,
  pathologyDefiniteCAA: false,
  pathologySupportingCAA: false,
  hasQualifyingPresentation: false,
  lobarHemorrhagicLesions: 0,
  whiteMatterFeature: false,
  deepHemorrhagicLesions: false,
  otherCauseOfHemorrhage: false,
};

const riskColors: Record<string, string> = {
  'very-high': 'bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-100 border-red-400',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 border-red-300',
  moderate: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 border-amber-300',
  low: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300',
  'n/a': 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-300',
};

const LOBAR_OPTIONS: { value: 0 | 1 | 2; label: string }[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '≥2' },
];

export default function BostonCriteriaCaaCalculator() {
  const [inputs, setInputs] = useState<BostonCaaInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('boston_caa');

  const result = assessBostonCriteria(inputs);
  const riskColor = riskColors[result.anticoagulationRisk];

  const handleCopy = () => {
    const lines = [
      `Boston Criteria 2.0 for CAA: ${result.label}`,
      `Anticoagulation risk: ${result.anticoagulationRisk}`,
      ...result.criteriaMet.map((c) => `• ${c}`),
      result.clinicalImplications,
      'Recommendations:',
      ...result.recommendations.map((r) => `• ${r}`),
      `Age: ${inputs.age} | Presentation: ${inputs.hasQualifyingPresentation ? 'Yes' : 'No'} | Lobar lesions: ${inputs.lobarHemorrhagicLesions === 2 ? '≥2' : inputs.lobarHemorrhagicLesions} | WM feature: ${inputs.whiteMatterFeature ? 'Yes' : 'No'} | Deep: ${inputs.deepHemorrhagicLesions ? 'Yes' : 'No'} | Other cause: ${inputs.otherCauseOfHemorrhage ? 'Yes' : 'No'}`,
    ];
    trackResult(result.diagnosis);
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
    const now = toggleFavorite('boston-caa');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('boston-caa');

  const setAge = useCallback((v: number) => setInputs((p) => ({ ...p, age: v })), []);
  const setLobar = useCallback((v: 0 | 1 | 2) => setInputs((p) => ({ ...p, lobarHemorrhagicLesions: v })), []);

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
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Boston Criteria 2.0 for CAA</div>
                <div className="flex items-baseline gap-1.5 flex-wrap" aria-live="polite" aria-atomic="true">
                  <span className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white">{result.label}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${riskColor}`}>Anticoagulation risk: {result.anticoagulationRisk.replace('-', ' ')}</span>
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
        <h1 className="sr-only">Boston Criteria 2.0 for Cerebral Amyloid Angiopathy Calculator</h1>

        <section className="mb-6 p-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Interpretation</h2>
          <p className="text-slate-800 dark:text-slate-200 font-medium">{result.clinicalImplications}</p>
          <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
            {result.criteriaMet.map((c, i) => (
              <li key={i}>{c}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">Recommendations:</p>
          <ul className="mt-1 text-sm text-slate-600 dark:text-slate-400 list-disc list-inside space-y-1">
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </section>

        <section className="mb-6 p-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/20" aria-live="polite">
          <h2 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">Important</h2>
          <p className="text-sm text-slate-800 dark:text-slate-200">
            Boston Criteria 2.0 require <strong>age ≥50</strong>, qualifying presentation (spontaneous ICH, TFNE, or cognitive impairment/dementia), and T2*-weighted MRI. Cerebellar hemorrhage does not count as lobar or deep. &quot;Other cause&quot; excludes: head trauma, hemorrhagic transformation of ischemic stroke, AVM, hemorrhagic tumor, warfarin INR &gt;3, vasculitis.
          </p>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="boston-age-label">
            <h2 id="boston-age-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Age (years)</h2>
            <input
              type="number"
              min={18}
              max={120}
              value={inputs.age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 50)}
              className="min-h-[44px] w-24 px-3 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              aria-describedby="boston-age-desc"
            />
            <p id="boston-age-desc" className="text-sm text-slate-500 dark:text-slate-400 mt-1">≥50 required for probable/possible CAA.</p>
          </section>

          <section aria-labelledby="boston-pathology-label">
            <h2 id="boston-pathology-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Pathology (if available)</h2>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input type="checkbox" checked={inputs.pathologyDefiniteCAA} onChange={(e) => setInputs((p) => ({ ...p, pathologyDefiniteCAA: e.target.checked, pathologySupportingCAA: e.target.checked ? false : p.pathologySupportingCAA }))} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                <span className="font-medium text-slate-900 dark:text-white">Definite CAA (full brain post-mortem: severe CAA, no other lesion)</span>
              </label>
              <label className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
                <input type="checkbox" checked={inputs.pathologySupportingCAA} onChange={(e) => setInputs((p) => ({ ...p, pathologySupportingCAA: e.target.checked, pathologyDefiniteCAA: e.target.checked ? false : p.pathologyDefiniteCAA }))} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
                <span className="font-medium text-slate-900 dark:text-white">Probable CAA with supporting pathology (evacuated hematoma or cortical biopsy showing CAA)</span>
              </label>
            </div>
          </section>

          <section aria-labelledby="boston-presentation-label">
            <h2 id="boston-presentation-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Qualifying presentation</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Spontaneous ICH, transient focal neurological episodes (TFNE), or cognitive impairment/dementia.</p>
            <div role="radiogroup" aria-labelledby="boston-presentation-label" className="flex gap-2">
              <button type="button" role="radio" aria-checked={!inputs.hasQualifyingPresentation} onClick={() => setInputs((p) => ({ ...p, hasQualifyingPresentation: false }))} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium ${!inputs.hasQualifyingPresentation ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>No</button>
              <button type="button" role="radio" aria-checked={inputs.hasQualifyingPresentation} onClick={() => setInputs((p) => ({ ...p, hasQualifyingPresentation: true }))} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium ${inputs.hasQualifyingPresentation ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>Yes</button>
            </div>
          </section>

          <section aria-labelledby="boston-lobar-label">
            <h2 id="boston-lobar-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Strictly lobar hemorrhagic lesions (T2*)</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">ICH, microbleeds, cortical superficial siderosis, or convexity SAH; multiple foci count as multiple. Cerebellar not counted as lobar or deep.</p>
            <div role="radiogroup" aria-labelledby="boston-lobar-label" className="flex gap-2">
              {LOBAR_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.lobarHemorrhagicLesions === opt.value} onClick={() => setLobar(opt.value)} className={`flex-1 py-3 px-4 rounded-xl border-2 min-h-[44px] font-medium ${inputs.lobarHemorrhagicLesions === opt.value ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 bg-white dark:bg-slate-800'}`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </section>

          <section aria-labelledby="boston-wm-label">
            <h2 id="boston-wm-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">White matter feature</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Severe centrum semiovale perivascular spaces (&gt;20 in one hemisphere) OR multispot WMH (&gt;10 subcortical FLAIR dots bilaterally).</p>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
              <input type="checkbox" checked={inputs.whiteMatterFeature} onChange={(e) => setInputs((p) => ({ ...p, whiteMatterFeature: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
              <span className="font-medium text-slate-900 dark:text-white">Present</span>
            </label>
          </section>

          <section aria-labelledby="boston-deep-label">
            <h2 id="boston-deep-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Deep hemorrhagic lesions on T2*</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Basal ganglia, thalamus, brainstem, deep white matter. Absence required for probable/possible CAA (improves specificity); ~15% of pathologically proven CAA can have deep microbleeds.</p>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-blue-500 has-[:checked]:bg-blue-50 dark:has-[:checked]:bg-blue-900/20">
              <input type="checkbox" checked={inputs.deepHemorrhagicLesions} onChange={(e) => setInputs((p) => ({ ...p, deepHemorrhagicLesions: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-blue-600" />
              <span className="font-medium text-slate-900 dark:text-white">Present (excludes probable/possible per strict criteria)</span>
            </label>
          </section>

          <section aria-labelledby="boston-other-label">
            <h2 id="boston-other-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Other cause of hemorrhagic lesions</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Head trauma, hemorrhagic transformation of ischemic stroke, AVM, hemorrhagic tumor, warfarin INR &gt;3, vasculitis. If any present, CAA criteria are excluded.</p>
            <label className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-900/20 has-[:checked]:border-red-500">
              <input type="checkbox" checked={inputs.otherCauseOfHemorrhage} onChange={(e) => setInputs((p) => ({ ...p, otherCauseOfHemorrhage: e.target.checked }))} className="w-5 h-5 rounded border-slate-300 text-red-600" />
              <span className="font-medium text-slate-900 dark:text-white">Present (excludes CAA diagnosis by criteria)</span>
            </label>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{BOSTON_CAA_CITATION.authors}. {BOSTON_CAA_CITATION.title}. {BOSTON_CAA_CITATION.journal}. {BOSTON_CAA_CITATION.year};{BOSTON_CAA_CITATION.volume}({BOSTON_CAA_CITATION.issue}):{BOSTON_CAA_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${BOSTON_CAA_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> Boston Criteria 2.0 require T2*-weighted MRI. Probable/definite CAA significantly increases ICH recurrence risk; anticoagulation decision remains shared decision-making with stroke vs bleeding risk.
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Related: <Link to="/calculators/has-bled-score" className="text-blue-600 dark:text-blue-400 hover:underline">HAS-BLED</Link> (bleeding risk); <Link to="/calculators/ich-score" className="text-blue-600 dark:text-blue-400 hover:underline">ICH Score</Link> (mortality).
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
