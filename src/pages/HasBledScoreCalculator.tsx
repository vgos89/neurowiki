import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, RefreshCw, Copy, Star } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  HASBLED_CITATION,
  HASBLED_RISK_LABELS,
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

// ── Severity tokens ──────────────────────────────────────────────────────────

const HASBLED_SEVERITY_TOKENS: Record<HASBLEDRisk, {
  borderColor: string; headerBg: string; headerHover: string;
  labelClass: string; statClass: string; chevronClass: string;
}> = {
  low: {
    borderColor: '#a7f3d0',
    headerBg: 'bg-emerald-50', headerHover: 'hover:bg-emerald-100',
    labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-emerald-700', chevronClass: 'text-emerald-600',
  },
  moderate: {
    borderColor: '#fed7aa',
    headerBg: 'bg-amber-50', headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700', chevronClass: 'text-amber-600',
  },
  high: {
    borderColor: '#fca5a5',
    headerBg: 'bg-red-50', headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700', chevronClass: 'text-red-600',
  },
  very_high: {
    borderColor: '#f87171',
    headerBg: 'bg-red-100', headerHover: 'hover:bg-red-200',
    labelClass: 'text-[10px] font-bold text-red-800 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-800', chevronClass: 'text-red-700',
  },
};

// ── Chevron sub-component ────────────────────────────────────────────────────

const Chevron: React.FC<{ direction: 'up' | 'down'; className?: string }> = ({ direction, className = '' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {direction === 'up' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

export default function HasBledScoreCalculator() {
  const [inputs, setInputs] = useState<HASBLEDInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('has_bled_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'has-bled',
      title: 'HAS-BLED',
      subtitle: 'Bleeding risk on anticoagulation',
      category: 'risk',
      trail: '0–9',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = calculateHASBLEDScore(inputs);
  const riskColor = riskColors[result.risk];

  // ── Drawer derived values ──────────────────────────────────────────────────
  const drawerState: 'A' | 'C' = hasInteracted ? 'C' : 'A';
  const tokens = HASBLED_SEVERITY_TOKENS[result.risk];
  const isExpanded = drawerOpen;
  const drawerCollapsedShadow = '0 -2px 12px rgba(15,23,42,0.08)';
  const drawerExpandedShadow = '0 -4px 24px rgba(15,23,42,0.12)';

  const handleCopy = () => {
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
    const now = toggleFavorite('has-bled');
    setToast(now ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToast(null), 2000);
  };

  const isFav = isFavorite('has-bled');

  const setCheck = useCallback((key: keyof HASBLEDInputs, value: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, [key]: value }));
  }, []);

  // ── Drawer sub-components ──────────────────────────────────────────────────

  const DrawerContent = () => (
    <div
      id="hasbled-drawer-content"
      role="region"
      aria-label="HAS-BLED Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        {/* Interpretation */}
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          {HASBLED_RISK_LABELS[result.risk]}
        </p>
        <p className="text-slate-600 leading-relaxed mt-2">
          <strong>{result.bleedsPer100PatientYears}</strong> major bleeds per 100 patient-years.{' '}
          {result.risk === 'low' && 'Low bleeding risk. Continue to address modifiable factors.'}
          {result.risk === 'moderate' && 'Moderate risk. Address modifiable factors and monitor.'}
          {(result.risk === 'high' || result.risk === 'very_high') && 'High risk. Fix modifiable risks (BP, alcohol, NSAIDs, INR control); do not withhold anticoagulation for stroke prevention alone.'}
        </p>

        {/* Important callout */}
        <div className="mt-4 pl-3 border-l-2 border-amber-400">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Important</div>
          <p className="text-sm text-slate-700 leading-relaxed">
            HAS-BLED estimates bleeding risk; it does <strong>not</strong> mean &quot;do not anticoagulate.&quot;
            Address modifiable risks (BP, alcohol, NSAIDs, labile INR) and use for monitoring—not to withhold anticoagulation.
            Stroke risk (CHA₂DS₂-VASc) and shared decision-making drive anticoagulation.
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{HASBLED_CITATION.authors}. {HASBLED_CITATION.title}. {HASBLED_CITATION.journal}. {HASBLED_CITATION.year};{HASBLED_CITATION.volume}({HASBLED_CITATION.issue}):{HASBLED_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${HASBLED_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Educational use only. High HAS-BLED does not contraindicate anticoagulation.
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
              <div className="text-sm text-slate-500">0 of 9 selected</div>
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
          aria-controls="hasbled-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
            isExpanded ? `${tokens.headerBg} ${tokens.headerHover}` : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={isExpanded ? tokens.labelClass : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'}>
              Interpretation
            </div>
            <div className={isExpanded ? tokens.statClass : 'text-sm font-medium text-slate-900'}>
              {HASBLED_RISK_LABELS[result.risk]} · {result.bleedsPer100PatientYears} bleeds/100 pt-yr
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
              <button onClick={handleCopy} className="bg-neuro-500 hover:bg-neuro-600 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-4">
        <h1 className="sr-only">HAS-BLED Score Calculator</h1>

        <div className="space-y-4">
          {CHECKBOX_ITEMS.map(({ key, label, sublabel }) => (
            <section key={key} aria-labelledby={`hasbled-${key}`}>
              <h2 id={`hasbled-${key}`} className="sr-only">{label}</h2>
              <label className="flex items-start gap-3 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer transition-all border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50">
                <input
                  type="checkbox"
                  checked={!!inputs[key]}
                  onChange={(e) => setCheck(key, e.target.checked)}
                  className="mt-1 w-5 h-5 rounded border-slate-300 text-neuro-600 focus:ring-neuro-500"
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
              <label className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50">
                <input type="radio" name="warfarin" checked={!inputs.onWarfarin} onChange={() => { setHasInteracted(true); setInputs((p) => ({ ...p, onWarfarin: false, labileINR: false })); }} className="w-4 h-4 text-neuro-600" />
                <span className="font-medium text-slate-900 dark:text-white">Not on warfarin (0 pt)</span>
              </label>
              <label className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50">
                <input type="radio" name="warfarin" checked={inputs.onWarfarin && !inputs.labileINR} onChange={() => { setHasInteracted(true); setInputs((p) => ({ ...p, onWarfarin: true, labileINR: false })); }} className="w-4 h-4 text-neuro-600" />
                <span className="font-medium text-slate-900 dark:text-white">On warfarin, stable INR (0 pt)</span>
              </label>
              <label className="inline-flex items-center gap-2 p-3 rounded-xl border-2 min-h-[44px] cursor-pointer border-slate-200 dark:border-slate-600 hover:border-slate-300 has-[:checked]:border-neuro-500 has-[:checked]:bg-neuro-50">
                <input type="radio" name="warfarin" checked={inputs.onWarfarin && inputs.labileINR} onChange={() => { setHasInteracted(true); setInputs((p) => ({ ...p, onWarfarin: true, labileINR: true })); }} className="w-4 h-4 text-neuro-600" />
                <span className="font-medium text-slate-900 dark:text-white">On warfarin, labile INR (1 pt)</span>
              </label>
            </div>
          </section>
        </div>

        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong> <cite>{HASBLED_CITATION.authors}. {HASBLED_CITATION.title}. {HASBLED_CITATION.journal}. {HASBLED_CITATION.year};{HASBLED_CITATION.volume}({HASBLED_CITATION.issue}):{HASBLED_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${HASBLED_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> High HAS-BLED does not contraindicate anticoagulation. Use to address modifiable risks and guide monitoring.
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
