/**
 * ICH Score Calculator — rebuilt against CALCULATOR_SPEC.md v1.0
 * Archetype 1 (single-page radio) with 4-state persistent bottom drawer.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy
 *   §2.1–2.5 Archetype 1 option rows · §5 Drawer state machine · §6 Severity
 * Medical source: Hemphill et al., Stroke 2001;32(4):891–897
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { Star, RefreshCw } from 'lucide-react';
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
  ICH_SCORE_CITATION,
  calculateICHScore,
  type ICHScoreInputs,
  type ICHCalculatorResult,
  type ICHSeverity,
} from '../data/ichScoreData';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: ICHScoreInputs = {
  gcsPoints: null,
  volume30OrMore: null,
  ivh: null,
  infratentorial: null,
  age80OrOlder: null,
};

/** Severity → drawer visual tokens — CALCULATOR_SPEC.md §6 table */
const SEVERITY_TOKENS: Record<ICHSeverity, {
  borderColor: string;
  headerBg: string;
  headerHover: string;
  labelClass: string;
  statClass: string;
  chevronClass: string;
}> = {
  low: {
    borderColor: '#e2e8f0',
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-900',
    chevronClass: 'text-slate-400',
  },
  moderate: {
    borderColor: '#fed7aa',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-600',
  },
  high: {
    borderColor: '#fecaca',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline SVG back arrow — CALCULATOR_SPEC.md §1.1 */
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

// ─── Main component ───────────────────────────────────────────────────────────

const IchScoreCalculator: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [inputs, setInputs] = useState<ICHScoreInputs>(DEFAULT_INPUTS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refs — not state: mutations must not trigger re-renders
  const wasCompleteRef = useRef<boolean>(false);
  const gcsGroupRef    = useRef<HTMLDivElement>(null);
  const volGroupRef    = useRef<HTMLDivElement>(null);
  const ivhGroupRef    = useRef<HTMLDivElement>(null);
  const origGroupRef   = useRef<HTMLDivElement>(null);
  const ageGroupRef    = useRef<HTMLDivElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { getBackPath } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('ich_score');

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedCount = (Object.values(inputs) as (unknown)[]).filter(v => v !== null).length;
  const isComplete = selectedCount === 5;
  const result: ICHCalculatorResult | null = isComplete ? calculateICHScore(inputs) : null;

  /** Drawer state machine — CALCULATOR_SPEC.md §5
   *  A = empty  B = partial  C = complete (all severities)
   *  State D removed: drawer no longer auto-expands. §5.4 discovery animation
   *  signals completion instead. */
  const drawerState: 'A' | 'B' | 'C' =
    selectedCount === 0 ? 'A' :
    !isComplete         ? 'B' : 'C';

  const isFav = isFavorite('ich');

  // ── Effects ────────────────────────────────────────────────────────────────
  /** Discovery animation — fires once per completion event (§5.4).
   *  Drawer stays collapsed; chevron bounces 3× to signal "tap me". */
  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 1800); // 3 × 600ms
      return () => clearTimeout(timer);
    }
    if (!isComplete && wasCompleteRef.current) {
      wasCompleteRef.current = false;
      setJustCompleted(false);
    }
  }, [isComplete]);

  // ── Setters ────────────────────────────────────────────────────────────────
  const setGcs = useCallback((points: 0 | 1 | 2) => {
    setInputs(prev => ({ ...prev, gcsPoints: points }));
  }, []);
  const setVolume = useCallback((value: boolean) => {
    setInputs(prev => ({ ...prev, volume30OrMore: value }));
  }, []);
  const setIvh = useCallback((value: boolean) => {
    setInputs(prev => ({ ...prev, ivh: value }));
  }, []);
  const setOrigin = useCallback((value: boolean) => {
    setInputs(prev => ({ ...prev, infratentorial: value }));
  }, []);
  const setAge = useCallback((value: boolean) => {
    setInputs(prev => ({ ...prev, age80OrOlder: value }));
  }, []);

  // ── Keyboard navigation — roving tabindex (Accessibility §2) ──────────────
  const makeKeyHandler = (
    groupRef: React.RefObject<HTMLDivElement | null>,
    optionsLen: number,
    currentIdx: number,
    selectFn: (idx: number) => void,
  ) => (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const next =
      (e.key === 'ArrowDown' || e.key === 'ArrowRight')
        ? (currentIdx + 1) % optionsLen
        : (currentIdx - 1 + optionsLen) % optionsLen;
    selectFn(next);
    const buttons = groupRef.current?.querySelectorAll<HTMLButtonElement>('button');
    buttons?.[next]?.focus();
  };

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCopy = useCallback(() => {
    const gcsPts = inputs.gcsPoints;
    const gcsLabel = gcsPts !== null ? ICH_GCS_OPTIONS[gcsPts].label : 'Not selected';
    const parts = [
      `ICH Score: ${isComplete ? result!.score : '—'}/6`,
      `30-day mortality: ${isComplete ? `${result!.mortality}%` : 'Incomplete'}`,
      `GCS: ${gcsLabel}`,
      `ICH volume: ${inputs.volume30OrMore !== null ? (inputs.volume30OrMore ? '≥30 mL' : '<30 mL') : 'Not selected'}`,
      `IVH: ${inputs.ivh !== null ? (inputs.ivh ? 'Yes' : 'No') : 'Not selected'}`,
      `Origin: ${inputs.infratentorial !== null ? (inputs.infratentorial ? 'Infratentorial' : 'Supratentorial') : 'Not selected'}`,
      `Age: ${inputs.age80OrOlder !== null ? (inputs.age80OrOlder ? '≥80 years' : '<80 years') : 'Not selected'}`,
    ];
    if (isComplete) trackResult(result!.score);
    copyToClipboard(parts.join('\n'), () => {
      setToastMessage('Copied to clipboard');
      setTimeout(() => setToastMessage(null), 2000);
    });
  }, [inputs, isComplete, result, trackResult]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setDrawerOpen(false);
    // wasCompleteRef resets via isComplete effect — discovery animation re-arms on next completion
    resetTracking();
    setToastMessage('Reset');
    setTimeout(() => setToastMessage(null), 1500);
  }, [resetTracking]);

  const handleFavToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('ich');
    setToastMessage(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToastMessage(null), 2000);
  }, [toggleFavorite]);

  // ── Drawer helpers ─────────────────────────────────────────────────────────
  const tokens = result ? SEVERITY_TOKENS[result.severity] : null;

  const drawerCollapsedShadow = '0 -2px 12px rgba(15,23,42,0.08)';
  const drawerExpandedShadow  = '0 -4px 24px rgba(15,23,42,0.12)';

  /** Expanded drawer content panel */
  const DrawerContent: React.FC = () => (
    <div
      id="ich-drawer-content"
      role="region"
      aria-label="Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        {/* 1. Interpretation headline — §5.1 */}
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          {result!.interpretation}
        </p>

        {/* 2. Explanation paragraph — §5.1 */}
        <p className="text-slate-600 leading-relaxed mt-3">
          {result!.explanation}
        </p>

        {/* 3. See also — §5.1, link-graph references */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            See also
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            <Link to="/calculators/glasgow-coma-scale" className="text-neuro-600 hover:underline">
              GCS Calculator
            </Link>
            <span className="text-slate-300 mx-2">·</span>
            <Link to="/guide/ich-management" className="text-neuro-600 hover:underline">
              ICH Management
            </Link>
          </p>
        </div>

        {/* 4. Citation + disclaimer — §1.2 */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>
              {ICH_SCORE_CITATION.authors}.{' '}
              {ICH_SCORE_CITATION.title}.{' '}
              {ICH_SCORE_CITATION.journal}.{' '}
              {ICH_SCORE_CITATION.year};{ICH_SCORE_CITATION.volume}({ICH_SCORE_CITATION.issue}):{ICH_SCORE_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${ICH_SCORE_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{ICH_SCORE_CITATION.doi}
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. Not a substitute for clinical judgment.
          </p>
        </div>
      </div>
    </div>
  );

  /** Bottom drawer — rendered as portal, fixed above mobile nav §1.3 */
  const Drawer: React.FC = () => {
    // State A / B — muted, non-interactive
    if (drawerState === 'A' || drawerState === 'B') {
      return (
        <div
          className="bg-slate-100"
          style={{ boxShadow: drawerCollapsedShadow }}
          aria-hidden="true"
        >
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Interpretation
              </div>
              {drawerState === 'A' ? (
                <div className="text-sm text-slate-500">0 of 5 selected</div>
              ) : (
                <div className="text-sm text-slate-600 font-medium">
                  {selectedCount} of 5 selected
                </div>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {drawerState === 'A'
                ? 'Appears when complete'
                : `${5 - selectedCount} more to complete`}
            </div>
          </div>
        </div>
      );
    }

    // State C — complete, tappable header (all severities)
    if (!tokens || !result) return null;
    const isExpanded = drawerOpen;

    return (
      <div
        style={{
          borderTop: `1px solid ${tokens.borderColor}`,
          boxShadow: isExpanded ? drawerExpandedShadow : drawerCollapsedShadow,
        }}
      >
        {/* Header row — collapses / expands on click */}
        <button
          type="button"
          onClick={() => setDrawerOpen(open => !open)}
          aria-expanded={isExpanded}
          aria-controls="ich-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
            isExpanded
              ? `${tokens.headerBg} ${tokens.headerHover}`
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={
              isExpanded
                ? tokens.labelClass
                : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'
            }>
              Interpretation
            </div>
            <div className={
              isExpanded ? tokens.statClass : 'text-sm font-medium text-slate-900'
            }>
              {result.label} · {result.stat}
            </div>
          </div>
          {/* Chevron: discovery bounce fires once on completion; hint bounce after (§5.4) */}
          <Chevron
            direction={isExpanded ? 'down' : 'up'}
            className={
              isExpanded
                ? tokens.chevronClass
                : justCompleted
                  ? `${tokens.chevronClass} drawer-discovery-chevron`
                  : 'text-slate-400 drawer-chevron-hint'
            }
          />
        </button>

        {/* Expanded content */}
        {isExpanded && <DrawerContent />}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* sr-only h1 — exactly one per page, §7.4 */}
      <h1 className="sr-only">ICH Score Calculator — Intracerebral Hemorrhage Mortality</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between gap-2">

            {/* Left cluster: back arrow + score block */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                to={getBackPath()}
                className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0"
                aria-label="Back to calculators"
              >
                <BackArrow />
              </Link>

              <div className="min-w-0">
                {/* Calculator name label — §1.1 */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  ICH Score
                </div>

                {/* Score display row — §1.1 */}
                <div
                  className="flex items-baseline gap-1.5 mt-0.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={
                    isComplete
                      ? `ICH Score ${result!.score} of 6. ${result!.mortality}% 30-day mortality.`
                      : 'ICH Score — not yet calculated'
                  }
                >
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
                    {isComplete ? result!.score : '—'}
                  </span>
                  <span className="text-slate-400 text-sm leading-none">/ 6</span>

                  {/* Severity text — only on complete + non-low (§1.1) */}
                  {isComplete && result!.severity === 'moderate' && (
                    <span className="text-xs font-medium text-amber-700 ml-1.5">
                      Moderate risk
                    </span>
                  )}
                  {isComplete && result!.severity === 'high' && (
                    <span className="text-xs font-medium text-red-600 ml-1.5">
                      High risk
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right cluster: fav, reset, copy — §1.1 */}
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

          {/* 1. Glasgow Coma Scale — GCS, 0–2 pts */}
          <section aria-labelledby="gcs-label">
            <h2
              id="gcs-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              GCS
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="gcs-label"
              ref={gcsGroupRef}
              className="divide-y divide-slate-200"
            >
              {ICH_GCS_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.gcsPoints === opt.points;
                const tabIdx = inputs.gcsPoints !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.points}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setGcs(opt.points)}
                    onKeyDown={makeKeyHandler(
                      gcsGroupRef, ICH_GCS_OPTIONS.length, idx,
                      (i) => setGcs(ICH_GCS_OPTIONS[i].points),
                    )}
                    className={
                      isSelected
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
                );
              })}
            </div>
          </section>

          {/* 2. ICH Volume */}
          <section aria-labelledby="volume-label">
            <h2
              id="volume-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              ICH Volume
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="volume-label"
              ref={volGroupRef}
              className="divide-y divide-slate-200"
            >
              {ICH_VOLUME_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.volume30OrMore === opt.value;
                const tabIdx = inputs.volume30OrMore !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setVolume(opt.value)}
                    onKeyDown={makeKeyHandler(
                      volGroupRef, ICH_VOLUME_OPTIONS.length, idx,
                      (i) => setVolume(ICH_VOLUME_OPTIONS[i].value),
                    )}
                    className={
                      isSelected
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
                );
              })}
            </div>
          </section>

          {/* 3. Intraventricular Hemorrhage */}
          <section aria-labelledby="ivh-label">
            <h2
              id="ivh-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Intraventricular Hemorrhage
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="ivh-label"
              ref={ivhGroupRef}
              className="divide-y divide-slate-200"
            >
              {ICH_IVH_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.ivh === opt.value;
                const tabIdx = inputs.ivh !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setIvh(opt.value)}
                    onKeyDown={makeKeyHandler(
                      ivhGroupRef, ICH_IVH_OPTIONS.length, idx,
                      (i) => setIvh(ICH_IVH_OPTIONS[i].value),
                    )}
                    className={
                      isSelected
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
                );
              })}
            </div>
          </section>

          {/* 4. Hemorrhage Origin */}
          <section aria-labelledby="origin-label">
            <h2
              id="origin-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Hemorrhage Origin
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="origin-label"
              ref={origGroupRef}
              className="divide-y divide-slate-200"
            >
              {ICH_ORIGIN_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.infratentorial === opt.value;
                const tabIdx = inputs.infratentorial !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setOrigin(opt.value)}
                    onKeyDown={makeKeyHandler(
                      origGroupRef, ICH_ORIGIN_OPTIONS.length, idx,
                      (i) => setOrigin(ICH_ORIGIN_OPTIONS[i].value),
                    )}
                    className={
                      isSelected
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
                );
              })}
            </div>
          </section>

          {/* 5. Age */}
          <section aria-labelledby="age-label">
            <h2
              id="age-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Age
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="age-label"
              ref={ageGroupRef}
              className="divide-y divide-slate-200"
            >
              {ICH_AGE_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.age80OrOlder === opt.value;
                const tabIdx = inputs.age80OrOlder !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setAge(opt.value)}
                    onKeyDown={makeKeyHandler(
                      ageGroupRef, ICH_AGE_OPTIONS.length, idx,
                      (i) => setAge(ICH_AGE_OPTIONS[i].value),
                    )}
                    className={
                      isSelected
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
                );
              })}
            </div>
          </section>

        </div>{/* end space-y-10 */}

        {/* Page footer — §1.2 */}
        <footer className="mt-14 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>
              {ICH_SCORE_CITATION.authors}.{' '}
              {ICH_SCORE_CITATION.title}.{' '}
              {ICH_SCORE_CITATION.journal}.{' '}
              {ICH_SCORE_CITATION.year};{ICH_SCORE_CITATION.volume}({ICH_SCORE_CITATION.issue}):{ICH_SCORE_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${ICH_SCORE_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{ICH_SCORE_CITATION.doi}
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only.
          </p>
        </footer>

        {/* Drawer spacer — prevents content hiding behind drawer §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />

      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav §1.3 ───────────── */}
      {createPortal(
        <div
          className="fixed left-0 right-0 z-[55] bg-white"
          style={{ bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))' }}
        >
          <Drawer />
        </div>,
        document.body,
      )}

      {/* ── Toast notification — §z-index table z-[60] ───────────────────── */}
      {toastMessage && createPortal(
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium z-[60]"
        >
          {toastMessage}
        </div>,
        document.body,
      )}
    </>
  );
};

export default IchScoreCalculator;
