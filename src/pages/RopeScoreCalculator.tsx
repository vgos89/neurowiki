/**
 * RoPE Score Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 1 (radio rows) + embedded A3 checkboxes for other criteria.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.2–2.3 Option row anatomy (radio rows, A1) · §4.1 Checkbox row anatomy (A3) · §5 Drawer state machine
 *
 * Architect conditions (arch-l55c-aspects-boston-rebuild.md, inherited):
 *   - Drawer infrastructure from L5.5b stays byte-identical
 *   - Light-only theme — no in layout
 *   - Bespoke-per-file pattern under L5.6 cap
 *   - No new clinical claim surfaces introduced
 *
 * Clinical prose preservation: calculateROPEScore() result objects are byte-for-byte from data module.
 *
 * Medical source: Kent DM, Thaler DE. Stroke. 2013;44(5):1449-1452.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { BackArrow } from '../components/calculators/BackArrow';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { CalculatorToast } from '../components/calculators/CalculatorToast';
import { useDrawerState } from '../hooks/useDrawerState';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import type { SeverityTokens } from '../lib/calculators/severityTokens';
import {
  ROPE_CITATION,
  ROPE_AGE_OPTIONS,
  calculateROPEScore,
  type RoPEInputs,
  type RoPEAgeBand,
} from '../data/ropeScoreData';

// ── Constants ─────────────────────────────────────────────────────────────────

const defaultInputs: RoPEInputs = {
  ageBand: '50_59',
  noHypertension: false,
  noDiabetes: false,
  noPriorStrokeTIA: false,
  nonsmoker: false,
  corticalInfarct: false,
};

// ── Severity tokens — CALCULATOR_SPEC.md §6 ──────────────────────────────────

type RoPESeverity = 'high' | 'moderate' | 'low';

function getRoPESeverity(pct: number): RoPESeverity {
  if (pct >= 60) return 'high';
  if (pct >= 40) return 'moderate';
  return 'low';
}

const ROPE_SEVERITY_TOKENS: Record<RoPESeverity, SeverityTokens> = {
  high: {
    borderColor: '#6ee7b7',
    headerBg: 'bg-emerald-50',
    headerHover: 'hover:bg-emerald-100',
    labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-emerald-700',
    chevronClass: 'text-emerald-600',
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
    borderColor: '#e2e8f0',
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-700',
    chevronClass: 'text-slate-400',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function RopeScoreCalculator() {
  const [inputs, setInputs] = useState<RoPEInputs>(defaultInputs);
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
  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer, toast, showToast } =
    useDrawerState({ mode: 'binary', hasInteracted });
  const ropeSeverity = getRoPESeverity(result.pfoAttributablePercent);
  const tokens = ROPE_SEVERITY_TOKENS[ropeSeverity];

  const isFav = isFavorite('rope');

  // ── Setters ────────────────────────────────────────────────────────────────
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

  // ── Handlers ───────────────────────────────────────────────────────────────
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
      showToast('Copied to clipboard');
    });
  };

  const handleReset = () => {
    setInputs(defaultInputs);
    setHasInteracted(false);
    resetDrawer();
    resetTracking();
    showToast('Reset', 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleFavorite('rope');
    showToast(now ? 'Saved to favorites' : 'Removed from favorites');
  };

  // ── Drawer sub-components ──────────────────────────────────────────────────
  // DO NOT TOUCH — drawer code from L5.5b is correct.

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


  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">RoPE Score Calculator</h1>

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
                  RoPE Score
                </div>

                <div
                  className="flex items-baseline gap-1.5 mt-0.5"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
                    {hasInteracted ? result.score : '—'}
                  </span>
                  <span className="text-slate-400 text-sm leading-none">/ 10</span>

                  {hasInteracted && (
                    <span className={`text-xs font-medium ml-1.5 ${
 result.pfoAttributablePercent >= 60 ? 'text-emerald-700' :
 result.pfoAttributablePercent >= 40 ? 'text-amber-700' :
 'text-slate-500'
 }`}>
                      PFO-attributable {result.pfoAttributablePercent}%
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

          {/* Age — A1 radio rows, vertical (§2.2–2.3) */}
          <section aria-labelledby="rope-age-label">
            <h2
              id="rope-age-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Age
            </h2>
            <div role="radiogroup" aria-labelledby="rope-age-label">
              {ROPE_AGE_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.ageBand === opt.value;
                return (
                  <React.Fragment key={opt.value}>
                    {idx > 0 && <div className="divider-hair" />}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setAge(opt.value)}
                      className={isSelected
                        ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                      }
                    >
                      <span className={isSelected ? 'font-semibold' : 'font-medium text-slate-900'}>
                        {opt.label}
                      </span>
                      <span className={isSelected ? 'text-sm opacity-75' : 'text-sm text-slate-400'}>
                        {opt.points} pt
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Other criteria — 5 checkboxes as A3 row pattern (§4.1) */}
          <section aria-labelledby="rope-checkboxes-label">
            <h2
              id="rope-checkboxes-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Other criteria
            </h2>
            <div>
              {[
                { key: 'noHypertension' as const, label: 'No hypertension', set: setNoHypertension, val: inputs.noHypertension },
                { key: 'noDiabetes' as const, label: 'No diabetes', set: setNoDiabetes, val: inputs.noDiabetes },
                { key: 'noPriorStrokeTIA' as const, label: 'No stroke/TIA before index event', set: setNoPriorStrokeTIA, val: inputs.noPriorStrokeTIA },
                { key: 'nonsmoker' as const, label: 'Nonsmoker', set: setNonsmoker, val: inputs.nonsmoker },
                { key: 'corticalInfarct' as const, label: 'Cortical infarct on imaging', set: setCorticalInfarct, val: inputs.corticalInfarct },
              ].map(({ key, label, set, val }, idx) => (
                <React.Fragment key={key}>
                  {idx > 0 && <div className="divider-hair" />}
                  <label
                    className={`flex items-baseline gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors ${val ? 'bg-neuro-50' : ''}`}
                  >
                    <input
                      type="checkbox"
                      checked={val}
                      onChange={(e) => set(e.target.checked)}
                      className="w-5 h-5 rounded border-slate-300 accent-neuro-500 flex-shrink-0 self-center"
                    />
                    <span className={val ? 'flex-1 min-w-0 font-semibold text-neuro-700' : 'flex-1 min-w-0 font-medium text-slate-900'}>
                      {label}
                    </span>
                    <span className={val ? 'text-sm opacity-75 flex-shrink-0' : 'text-sm text-slate-400 flex-shrink-0'}>
                      1 pt
                    </span>
                  </label>
                </React.Fragment>
              ))}
            </div>
          </section>

        </div>{/* end space-y-10 */}

        {/* Page footer — §1.2 */}
        <footer className="mt-14 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{ROPE_CITATION.authors}. {ROPE_CITATION.title}. {ROPE_CITATION.journal}. {ROPE_CITATION.year};{ROPE_CITATION.volume}({ROPE_CITATION.issue}):{ROPE_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${ROPE_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline ml-0.5">DOI</a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. For cryptogenic stroke when PFO is detected or suspected. Does not replace multidisciplinary decision-making for PFO closure.
          </p>
        </footer>

        {/* Drawer spacer — §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />

      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav §1.3 ───────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="rope-drawer-content"
        stateAText={{ label: '0 of 6 selected', hint: 'Appears when complete' }}
        collapsedStat={`PFO-attributable: ${result.pfoAttributablePercent}%`}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
}
