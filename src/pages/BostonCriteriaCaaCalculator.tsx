/**
 * Boston Criteria 2.0 CAA Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 3 (Mixed Input): checkboxes (A3 row pattern) + radio rows (A1 pattern) + number input.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.2–2.3 Option row anatomy (radio rows) · §4.1–4.3 Checkbox row anatomy · §5 Drawer state machine
 *
 * Architect conditions (arch-l55c-aspects-boston-rebuild.md):
 *   - Keep <input type="number"> with inputMode="numeric" added for mobile — no number-input archetype in spec
 *   - Bespoke-per-file is the accepted L5.5 pattern; extraction deferred to L5.6
 *   - No dark:* variants — light-only theme matching ABCD²
 *   - No new clinical claim surfaces introduced
 *
 * Clinical prose preservation: assessBostonCriteria() result strings are byte-for-byte from data module.
 * Drawer code from L5.5b is untouched.
 *
 * Medical source: Charidimou A, et al. Lancet Neurol. 2022;21(8):714–725.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Star, RefreshCw } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  BOSTON_CAA_CITATION,
  assessBostonCriteria,
  type BostonCaaInputs,
} from '../data/bostonCriteriaCaaData';

// ── Constants ─────────────────────────────────────────────────────────────────

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

const LOBAR_OPTIONS: { value: 0 | 1 | 2; label: string }[] = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '≥2' },
];

// ── Severity tokens — CALCULATOR_SPEC.md §6 ──────────────────────────────────

type BostonRisk = 'very-high' | 'high' | 'moderate' | 'low' | 'n/a';

const BOSTON_SEVERITY_TOKENS: Record<BostonRisk, {
  borderColor: string;
  headerBg: string;
  headerHover: string;
  labelClass: string;
  statClass: string;
  chevronClass: string;
}> = {
  'very-high': {
    borderColor: '#f87171',
    headerBg: 'bg-red-100',
    headerHover: 'hover:bg-red-200',
    labelClass: 'text-[10px] font-bold text-red-800 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-800',
    chevronClass: 'text-red-700',
  },
  high: {
    borderColor: '#fca5a5',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
  moderate: {
    borderColor: '#fed7aa',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-600',
  },
  low: {
    borderColor: '#a7f3d0',
    headerBg: 'bg-emerald-50',
    headerHover: 'hover:bg-emerald-100',
    labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-emerald-700',
    chevronClass: 'text-emerald-600',
  },
  'n/a': {
    borderColor: '#e2e8f0',
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-700',
    chevronClass: 'text-slate-400',
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

/** Inline SVG back arrow — §1.1 */
const BackArrow: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

/** Chevron SVG — direction prop controls up vs down */
const Chevron: React.FC<{ direction: 'up' | 'down'; className?: string }> = ({
  direction,
  className = '',
}) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    {direction === 'up'
      ? <polyline points="18 15 12 9 6 15" />
      : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

// ── Component ─────────────────────────────────────────────────────────────────

export default function BostonCriteriaCaaCalculator() {
  const [inputs, setInputs] = useState<BostonCaaInputs>(defaultInputs);
  const [toast, setToast] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('boston_caa');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'boston-caa',
      title: 'Boston Criteria 2.0',
      subtitle: 'CAA diagnosis from MRI',
      category: 'classification',
      trail: 'Class',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = assessBostonCriteria(inputs);

  // ── Drawer derived values ──────────────────────────────────────────────────
  const drawerState: 'A' | 'C' = hasInteracted ? 'C' : 'A';
  const tokens = BOSTON_SEVERITY_TOKENS[result.anticoagulationRisk as BostonRisk];
  const isExpanded = drawerOpen;
  const drawerCollapsedShadow = '0 -2px 12px rgba(15,23,42,0.08)';
  const drawerExpandedShadow = '0 -4px 24px rgba(15,23,42,0.12)';

  const isFav = isFavorite('boston-caa');

  // ── Setters ────────────────────────────────────────────────────────────────
  const setAge = useCallback((v: number) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, age: v }));
  }, []);

  const setLobar = useCallback((v: 0 | 1 | 2) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, lobarHemorrhagicLesions: v }));
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
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
    setDrawerOpen(false);
    setHasInteracted(false);
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

  // ── Drawer sub-components ──────────────────────────────────────────────────
  // DO NOT TOUCH — drawer code from L5.5b is correct.

  const DrawerContent = () => (
    <div
      id="boston-drawer-content"
      role="region"
      aria-label="Boston Criteria 2.0 Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        <p className="text-xl font-semibold text-slate-900 leading-tight">{result.label}</p>
        <p className="text-slate-600 leading-relaxed mt-2">{result.clinicalImplications}</p>

        {result.criteriaMet.length > 0 && (
          <ul className="mt-3 text-sm text-slate-600 list-disc list-inside space-y-1">
            {result.criteriaMet.map((c, i) => <li key={i}>{c}</li>)}
          </ul>
        )}

        {result.recommendations.length > 0 && (
          <div className="mt-3">
            <p className="text-sm font-medium text-slate-700">Recommendations:</p>
            <ul className="mt-1 text-sm text-slate-600 list-disc list-inside space-y-1">
              {result.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          </div>
        )}

        {/* Important callout */}
        <div className="mt-4 pl-3 border-l-2 border-amber-400">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Important</div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Boston Criteria 2.0 require <strong>age ≥50</strong>, qualifying presentation (spontaneous ICH, TFNE, or cognitive impairment/dementia), and T2*-weighted MRI.
            Cerebellar hemorrhage does not count as lobar or deep. &quot;Other cause&quot; excludes: head trauma, hemorrhagic transformation of ischemic stroke, AVM, hemorrhagic tumor, warfarin INR &gt;3, vasculitis.
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{BOSTON_CAA_CITATION.authors}. {BOSTON_CAA_CITATION.title}. {BOSTON_CAA_CITATION.journal}. {BOSTON_CAA_CITATION.year};{BOSTON_CAA_CITATION.volume}({BOSTON_CAA_CITATION.issue}):{BOSTON_CAA_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${BOSTON_CAA_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Educational use only. Probable/definite CAA significantly increases ICH recurrence risk; anticoagulation decision remains shared decision-making.
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
              <div className="text-sm text-slate-500">No inputs selected</div>
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
          aria-controls="boston-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
            isExpanded ? `${tokens.headerBg} ${tokens.headerHover}` : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={isExpanded ? tokens.labelClass : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'}>
              Interpretation
            </div>
            <div className={isExpanded ? tokens.statClass : 'text-sm font-medium text-slate-900'}>
              {result.label}
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

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">Boston Criteria 2.0 for Cerebral Amyloid Angiopathy Calculator</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between gap-2">

            {/* Left cluster */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0"
                aria-label="Back to calculators"
              >
                <BackArrow />
              </button>

              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Boston Criteria 2.0 for CAA
                </div>

                <div
                  className="flex items-baseline gap-1.5 mt-0.5 flex-wrap"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="text-xl font-semibold text-slate-900 leading-tight">
                    {hasInteracted ? result.label : '—'}
                  </span>

                  {hasInteracted && result.anticoagulationRisk !== 'n/a' && (
                    <span className={`text-xs font-medium ml-1.5 ${
                      result.anticoagulationRisk === 'very-high' || result.anticoagulationRisk === 'high'
                        ? 'text-red-600'
                        : result.anticoagulationRisk === 'moderate'
                        ? 'text-amber-700'
                        : 'text-emerald-700'
                    }`}>
                      Anticoag risk: {result.anticoagulationRisk.replace('-', ' ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right cluster */}
            <div className="flex items-center gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={handleFavToggle}
                className="p-2 rounded-full hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={18}
                  className={isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}
                  aria-hidden="true"
                />
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Reset calculator"
              >
                <RefreshCw size={17} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        <div className="space-y-10">

          {/* Age — styled number input (no archetype in spec; keep as-is per arch review) */}
          <section aria-labelledby="boston-age-label">
            <h2
              id="boston-age-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Age
            </h2>
            <input
              type="number"
              inputMode="numeric"
              min={18}
              max={120}
              value={inputs.age}
              onChange={(e) => setAge(parseInt(e.target.value, 10) || 50)}
              className="min-h-[44px] w-28 px-4 py-2 rounded-lg border border-slate-200 bg-white text-slate-900 font-medium focus:border-neuro-500 focus:outline-none focus:ring-2 focus:ring-neuro-500/20"
              aria-describedby="boston-age-desc"
            />
            <p id="boston-age-desc" className="text-xs text-slate-500 mt-2">
              ≥50 required for probable/possible CAA.
            </p>
          </section>

          {/* Pathology — A3 checkbox rows (mutually exclusive) */}
          <section aria-labelledby="boston-pathology-label">
            <h2
              id="boston-pathology-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Pathology (if available)
            </h2>
            <div>
              <label className={`flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors ${inputs.pathologyDefiniteCAA ? 'bg-neuro-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={inputs.pathologyDefiniteCAA}
                  onChange={(e) => {
                    setHasInteracted(true);
                    setInputs((p) => ({
                      ...p,
                      pathologyDefiniteCAA: e.target.checked,
                      pathologySupportingCAA: e.target.checked ? false : p.pathologySupportingCAA,
                    }));
                  }}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 accent-neuro-500"
                />
                <span className="flex-1 min-w-0">
                  <span className={inputs.pathologyDefiniteCAA ? 'block font-semibold text-neuro-700' : 'block font-medium text-slate-900'}>
                    Definite CAA
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">Full brain post-mortem: severe CAA, no other lesion</span>
                </span>
              </label>
              <div className="divider-hair" />
              <label className={`flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors ${inputs.pathologySupportingCAA ? 'bg-neuro-50' : ''}`}>
                <input
                  type="checkbox"
                  checked={inputs.pathologySupportingCAA}
                  onChange={(e) => {
                    setHasInteracted(true);
                    setInputs((p) => ({
                      ...p,
                      pathologySupportingCAA: e.target.checked,
                      pathologyDefiniteCAA: e.target.checked ? false : p.pathologyDefiniteCAA,
                    }));
                  }}
                  className="mt-0.5 w-5 h-5 rounded border-slate-300 accent-neuro-500"
                />
                <span className="flex-1 min-w-0">
                  <span className={inputs.pathologySupportingCAA ? 'block font-semibold text-neuro-700' : 'block font-medium text-slate-900'}>
                    Probable CAA with supporting pathology
                  </span>
                  <span className="block text-xs text-slate-500 mt-0.5">Evacuated hematoma or cortical biopsy showing CAA</span>
                </span>
              </label>
            </div>
          </section>

          {/* Qualifying presentation — A1 radio rows */}
          <section aria-labelledby="boston-presentation-label">
            <h2
              id="boston-presentation-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Qualifying presentation
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Spontaneous ICH, transient focal neurological episodes (TFNE), or cognitive impairment/dementia.
            </p>
            <div role="radiogroup" aria-labelledby="boston-presentation-label">
              <button
                type="button"
                role="radio"
                aria-checked={!inputs.hasQualifyingPresentation}
                onClick={() => {
                  setHasInteracted(true);
                  setInputs((p) => ({ ...p, hasQualifyingPresentation: false }));
                }}
                className={!inputs.hasQualifyingPresentation
                  ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                  : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                }
              >
                <span className={!inputs.hasQualifyingPresentation ? 'font-semibold' : 'font-medium text-slate-900'}>No</span>
              </button>
              <div className="divider-hair" />
              <button
                type="button"
                role="radio"
                aria-checked={inputs.hasQualifyingPresentation}
                onClick={() => {
                  setHasInteracted(true);
                  setInputs((p) => ({ ...p, hasQualifyingPresentation: true }));
                }}
                className={inputs.hasQualifyingPresentation
                  ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                  : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                }
              >
                <span className={inputs.hasQualifyingPresentation ? 'font-semibold' : 'font-medium text-slate-900'}>Yes</span>
              </button>
            </div>
          </section>

          {/* Lobar hemorrhagic lesions — A1 radio rows (3 options) */}
          <section aria-labelledby="boston-lobar-label">
            <h2
              id="boston-lobar-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Strictly lobar hemorrhagic lesions (T2*)
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              ICH, microbleeds, cortical superficial siderosis, or convexity SAH; multiple foci count as multiple. Cerebellar not counted as lobar or deep.
            </p>
            <div role="radiogroup" aria-labelledby="boston-lobar-label">
              {LOBAR_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.lobarHemorrhagicLesions === opt.value;
                return (
                  <React.Fragment key={opt.value}>
                    {idx > 0 && <div className="divider-hair" />}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setLobar(opt.value)}
                      className={isSelected
                        ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                      }
                    >
                      <span className={isSelected ? 'font-semibold' : 'font-medium text-slate-900'}>
                        {opt.label}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* White matter feature — A3 single checkbox */}
          <section aria-labelledby="boston-wm-label">
            <h2
              id="boston-wm-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              White matter feature
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Severe centrum semiovale perivascular spaces (&gt;20 in one hemisphere) OR multispot WMH (&gt;10 subcortical FLAIR dots bilaterally).
            </p>
            <label className={`flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors ${inputs.whiteMatterFeature ? 'bg-neuro-50' : ''}`}>
              <input
                type="checkbox"
                checked={inputs.whiteMatterFeature}
                onChange={(e) => {
                  setHasInteracted(true);
                  setInputs((p) => ({ ...p, whiteMatterFeature: e.target.checked }));
                }}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 accent-neuro-500"
              />
              <span className={inputs.whiteMatterFeature ? 'font-semibold text-neuro-700' : 'font-medium text-slate-900'}>
                Present
              </span>
            </label>
          </section>

          {/* Deep hemorrhagic lesions — A3 single checkbox */}
          <section aria-labelledby="boston-deep-label">
            <h2
              id="boston-deep-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Deep hemorrhagic lesions on T2*
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Basal ganglia, thalamus, brainstem, deep white matter. Absence required for probable/possible CAA (improves specificity); ~15% of pathologically proven CAA can have deep microbleeds.
            </p>
            <label className={`flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors ${inputs.deepHemorrhagicLesions ? 'bg-neuro-50' : ''}`}>
              <input
                type="checkbox"
                checked={inputs.deepHemorrhagicLesions}
                onChange={(e) => {
                  setHasInteracted(true);
                  setInputs((p) => ({ ...p, deepHemorrhagicLesions: e.target.checked }));
                }}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 accent-neuro-500"
              />
              <span className={inputs.deepHemorrhagicLesions ? 'font-semibold text-neuro-700' : 'font-medium text-slate-900'}>
                Present (excludes probable/possible per strict criteria)
              </span>
            </label>
          </section>

          {/* Other cause of hemorrhagic lesions — A3 single checkbox, red exclusion coloring */}
          <section aria-labelledby="boston-other-label">
            <h2
              id="boston-other-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Other cause of hemorrhagic lesions
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Head trauma, hemorrhagic transformation of ischemic stroke, AVM, hemorrhagic tumor, warfarin INR &gt;3, vasculitis. If any present, CAA criteria are excluded.
            </p>
            <label className={`flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-red-50/40 cursor-pointer transition-colors border border-red-200 ${inputs.otherCauseOfHemorrhage ? 'bg-red-50' : 'bg-red-50/30'}`}>
              <input
                type="checkbox"
                checked={inputs.otherCauseOfHemorrhage}
                onChange={(e) => {
                  setHasInteracted(true);
                  setInputs((p) => ({ ...p, otherCauseOfHemorrhage: e.target.checked }));
                }}
                className="mt-0.5 w-5 h-5 rounded border-slate-300 accent-red-500"
              />
              <span className={inputs.otherCauseOfHemorrhage ? 'font-semibold text-red-700' : 'font-medium text-slate-900'}>
                Present (excludes CAA diagnosis by criteria)
              </span>
            </label>
          </section>

        </div>{/* end space-y-10 */}

        {/* Page footer — §1.2 */}
        <footer className="mt-14 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{BOSTON_CAA_CITATION.authors}. {BOSTON_CAA_CITATION.title}. {BOSTON_CAA_CITATION.journal}. {BOSTON_CAA_CITATION.year};{BOSTON_CAA_CITATION.volume}({BOSTON_CAA_CITATION.issue}):{BOSTON_CAA_CITATION.pages}.</cite>{' '}
            <a
              href={`https://doi.org/${BOSTON_CAA_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              DOI
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. Boston Criteria 2.0 require T2*-weighted MRI. Probable/definite CAA significantly increases ICH recurrence risk; anticoagulation decision remains shared decision-making.
          </p>
          <p className="mt-3 text-xs text-slate-400">
            Related: <Link to="/calculators/has-bled-score" className="text-neuro-600 hover:underline">HAS-BLED</Link> (bleeding risk);{' '}
            <Link to="/calculators/ich-score" className="text-neuro-600 hover:underline">ICH Score</Link> (mortality).
          </p>
        </footer>

        {/* Drawer spacer — §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />

      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav §1.3 ───────────── */}
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
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium z-[60]"
        >
          {toast}
        </div>,
        document.body,
      )}
    </>
  );
}
