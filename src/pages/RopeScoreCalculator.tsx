import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
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

// ── Severity tokens ──────────────────────────────────────────────────────────

type RoPESeverity = 'high' | 'moderate' | 'low';

function getRoPESeverity(pct: number): RoPESeverity {
  if (pct >= 60) return 'high';
  if (pct >= 40) return 'moderate';
  return 'low';
}

const ROPE_SEVERITY_TOKENS: Record<RoPESeverity, {
  borderColor: string; headerBg: string; headerHover: string;
  labelClass: string; statClass: string; chevronClass: string;
}> = {
  high: {
    borderColor: '#6ee7b7', headerBg: 'bg-emerald-50', headerHover: 'hover:bg-emerald-100',
    labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-emerald-700', chevronClass: 'text-emerald-600',
  },
  moderate: {
    borderColor: '#fed7aa', headerBg: 'bg-amber-50', headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700', chevronClass: 'text-amber-600',
  },
  low: {
    borderColor: '#e2e8f0', headerBg: 'bg-white', headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-700', chevronClass: 'text-slate-400',
  },
};

// ── Chevron sub-component ────────────────────────────────────────────────────

const Chevron: React.FC<{ direction: 'up' | 'down'; className?: string }> = ({ direction, className = '' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {direction === 'up' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

export default function RopeScoreCalculator() {
  const [inputs, setInputs] = useState<RoPEInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('rope_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'rope',
      title: 'RoPE Score',
      subtitle: 'PFO-attributable fraction',
      category: 'risk',
      trail: '0–10',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = calculateROPEScore(inputs);

  // ── Drawer derived values ──────────────────────────────────────────────────
  const drawerState: 'A' | 'C' = hasInteracted ? 'C' : 'A';
  const ropeSeverity = getRoPESeverity(result.pfoAttributablePercent);
  const tokens = ROPE_SEVERITY_TOKENS[ropeSeverity];
  const isExpanded = drawerOpen;
  const drawerCollapsedShadow = '0 -2px 12px rgba(15,23,42,0.08)';
  const drawerExpandedShadow = '0 -4px 24px rgba(15,23,42,0.12)';

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
    setDrawerOpen(false);
    setHasInteracted(false);
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

  const setAge = useCallback((v: RoPEAgeBand) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, ageBand: v }));
  }, []);
  const setNoHypertension = useCallback((v: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, noHypertension: v }));
  }, []);
  const setNoDiabetes = useCallback((v: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, noDiabetes: v }));
  }, []);
  const setNoPriorStrokeTIA = useCallback((v: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, noPriorStrokeTIA: v }));
  }, []);
  const setNonsmoker = useCallback((v: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, nonsmoker: v }));
  }, []);
  const setCorticalInfarct = useCallback((v: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, corticalInfarct: v }));
  }, []);

  // ── Drawer sub-components ──────────────────────────────────────────────────

  const DrawerContent = () => (
    <div
      id="rope-drawer-content"
      role="region"
      aria-label="RoPE Score Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          PFO-attributable fraction: {result.pfoAttributablePercent}%
        </p>
        <p className="text-slate-600 leading-relaxed mt-3">
          Percentage of the cryptogenic stroke likely attributable to the PFO.
          Higher RoPE = more likely PFO is causative; useful when considering PFO closure (RESPECT, CLOSE, REDUCE).
          Use with imaging and cardiology input.
        </p>
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{ROPE_CITATION.authors}. {ROPE_CITATION.title}. {ROPE_CITATION.journal}. {ROPE_CITATION.year};{ROPE_CITATION.volume}({ROPE_CITATION.issue}):{ROPE_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${ROPE_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Educational use only. Does not replace multidisciplinary decision-making for PFO closure.
          </p>
        </div>
      </div>
    </div>
  );

  const Drawer = () => {
    if (drawerState === 'A') {
      return (
        <div className="bg-slate-100" style={{ boxShadow: drawerCollapsedShadow }} aria-hidden="true">
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interpretation</div>
              <div className="text-sm text-slate-500">0 of 6 selected</div>
            </div>
            <div className="text-xs text-slate-400">Appears when complete</div>
          </div>
        </div>
      );
    }

    return (
      <div style={{ borderTop: `1px solid ${tokens.borderColor}`, boxShadow: isExpanded ? drawerExpandedShadow : drawerCollapsedShadow }}>
        {/* Content before button — handle stays at viewport bottom */}
        {isExpanded && <DrawerContent />}
        <button
          type="button"
          onClick={() => setDrawerOpen(open => !open)}
          aria-expanded={isExpanded}
          aria-controls="rope-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
            isExpanded ? `${tokens.headerBg} ${tokens.headerHover}` : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={isExpanded ? tokens.labelClass : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'}>
              Interpretation
            </div>
            <div className={isExpanded ? tokens.statClass : 'text-sm font-medium text-slate-900'}>
              PFO-attributable: {result.pfoAttributablePercent}%
            </div>
          </div>
          <Chevron
            direction={isExpanded ? 'down' : 'up'}
            className={isExpanded ? tokens.chevronClass : 'text-slate-400 drawer-chevron-hint'}
          />
        </button>
      </div>
    );
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700" role="banner">
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={handleBack} className="p-2 -m-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0" aria-label="Back to calculators">
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
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
              <button onClick={handleCopy} className="bg-neuro-500 hover:bg-neuro-600 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-4">
        <h1 className="sr-only">RoPE Score Calculator</h1>

        <div className="space-y-6">
          <section aria-labelledby="rope-age-label">
            <h2 id="rope-age-label" className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Age</h2>
            <div role="radiogroup" aria-labelledby="rope-age-label" className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ROPE_AGE_OPTIONS.map((opt) => (
                <button key={opt.value} type="button" role="radio" aria-checked={inputs.ageBand === opt.value} onClick={() => setAge(opt.value)} className={`p-3 rounded-xl border-2 text-left min-h-[44px] transition-all ${inputs.ageBand === opt.value ? 'border-neuro-500 bg-neuro-50 text-neuro-700' : 'border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 bg-white dark:bg-slate-800'}`}>
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
                <label key={key} className="flex items-center gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50">
                  <input type="checkbox" checked={val} onChange={(e) => set(e.target.checked)} className="w-5 h-5 rounded border-slate-300 text-neuro-600 focus:ring-neuro-500" />
                  <span className="font-medium text-slate-900 dark:text-white">{label}</span>
                </label>
              ))}
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{ROPE_CITATION.authors}. {ROPE_CITATION.title}. {ROPE_CITATION.journal}. {ROPE_CITATION.year};{ROPE_CITATION.volume}({ROPE_CITATION.issue}):{ROPE_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${ROPE_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> For cryptogenic stroke when PFO is detected or suspected. Does not replace multidisciplinary decision-making for PFO closure.
          </p>
        </footer>

        {/* Drawer spacer */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />
      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav ────────────────── */}
      {createPortal(
        <div
          className="fixed right-0 z-[55] bg-white"
          style={{ bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))', left: 'var(--nav-rail-width, 0px)' }}
        >
          <Drawer />
        </div>,
        document.body,
      )}

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
      {toast && createPortal(
        <div role="status" aria-live="polite" className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium z-[60]">
          {toast}
        </div>,
        document.body,
      )}
    </>
  );
}
