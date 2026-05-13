/**
 * Glasgow Coma Scale Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 1 (single-page radio) with 4-state persistent bottom drawer.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.1–2.5 Archetype 1 option rows · §5 Drawer state machine · §6 Severity tokens
 *   §1.1/§6: amber-700 for moderate (WCAG AA 5.14:1 on white)
 * Medical source: Teasdale G, Jennett B. Lancet. 1974;2(7872):81–84. PMID: 4136544
 * Severity thresholds: ACRM 1993 (mild TBI: GCS ≥13)
 *
 * Clinical deviation from Archetype 1 (documented in ADR-001):
 *   Eye and Verbal sections include "not testable" checkboxes above their radiogroups.
 *   Clinically essential: intubated patients require T-suffix notation (Teasdale 1974).
 *   Checkbox hides the radiogroup when checked; the slot counts as filled in selectedCount.
 *   Does not conflict with divide-y / selected-option spec requirements.
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
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  GCS_CITATION,
  GCS_EYE_OPTIONS,
  GCS_VERBAL_OPTIONS,
  GCS_MOTOR_OPTIONS,
  calculateGCS,
  type GCSInputs,
  type GCSResult,
  type GCSSeverity,
} from '../data/gcsScoreData';

// ─── Constants ────────────────────────────────────────────────────────────────

const DEFAULT_INPUTS: GCSInputs = {
  eye: null,
  verbal: null,
  motor: null,
  eyeNotTestable: false,
  verbalNotTestable: false,
};

/** Severity → drawer visual tokens — CALCULATOR_SPEC.md §6 table */
const SEVERITY_TOKENS: Record<GCSSeverity, {
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
    chevronClass: 'text-amber-700',  // amber-700 per CALCULATOR_SPEC v1.1 §1.1 (WCAG AA 5.14:1)
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

/** Link-graph resolution for seeAlso IDs — Wave 5 infrastructure pending */
const SEE_ALSO_LINKS: Record<string, { path: string; label: string }> = {
  'calc/ich-score': { path: '/calculators/ich-score', label: 'ICH Score Calculator' },
  'calc/nihss':    { path: '/calculators/nihss',      label: 'NIHSS Calculator' },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Inline SVG back arrow — avoids lucide import for icon not used elsewhere */
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

const GlasgowComaScaleCalculator: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [inputs, setInputs]           = useState<GCSInputs>(DEFAULT_INPUTS);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [toastMessage, setToastMessage]   = useState<string | null>(null);

  // Refs — mutations must not trigger re-renders
  const wasCompleteRef = useRef<boolean>(false);
  const eyeGroupRef    = useRef<HTMLDivElement>(null);
  const verbalGroupRef = useRef<HTMLDivElement>(null);
  const motorGroupRef  = useRef<HTMLDivElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleBack }                 = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView }                 = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('gcs');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'gcs',
      title: 'Glasgow Coma Scale',
      subtitle: 'Conscious-level assessment',
      category: 'severity',
      trail: '3–15',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  // Slot filling: not-testable checkbox counts the slot as filled even without
  // a radio selection — so the progress counter and drawer state update immediately.
  const eyeSlotFilled    = inputs.eyeNotTestable   || inputs.eye    !== null;
  const verbalSlotFilled = inputs.verbalNotTestable || inputs.verbal !== null;
  const motorSlotFilled  = inputs.motor !== null;
  const selectedCount = [eyeSlotFilled, verbalSlotFilled, motorSlotFilled].filter(Boolean).length;
  const isComplete = selectedCount === 3;
  const result: GCSResult | null = isComplete ? calculateGCS(inputs) : null;

  /** Drawer state machine — CALCULATOR_SPEC.md §5
   *  A = empty (0 of 3)  B = partial  C = complete (all severities)
   *  State D removed: drawer no longer auto-expands. Discovery animation signals
   *  completion instead. */
  const drawerState: 'A' | 'B' | 'C' =
    selectedCount === 0 ? 'A' :
    !isComplete         ? 'B' : 'C';

  const isFav = isFavorite('gcs');

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

  // Fix 3: Publish drawer floor height so FeedbackButton lifts above the drawer.
  // 52px ≈ py-3.5 (14px × 2) + content row (~24px).
  useEffect(() => {
    document.documentElement.style.setProperty('--drawer-floor-height', '52px');
    return () => {
      document.documentElement.style.setProperty('--drawer-floor-height', '0px');
    };
  }, []);

  // ── Setters ────────────────────────────────────────────────────────────────
  const setEye      = useCallback((v: 1 | 2 | 3 | 4)         => setInputs(p => ({ ...p, eye: v })),      []);
  const setVerbal   = useCallback((v: 1 | 2 | 3 | 4 | 5)     => setInputs(p => ({ ...p, verbal: v })),   []);
  const setMotor    = useCallback((v: 1 | 2 | 3 | 4 | 5 | 6) => setInputs(p => ({ ...p, motor: v })),    []);
  const setEyeNT    = useCallback((v: boolean) => setInputs(p => ({ ...p, eyeNotTestable: v })),    []);
  const setVerbalNT = useCallback((v: boolean) => setInputs(p => ({ ...p, verbalNotTestable: v })), []);

  // ── Keyboard navigation — roving tabindex (CALCULATOR_SPEC.md §2.5) ────────
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
    const eyeLabel    = inputs.eyeNotTestable
      ? 'not testable'
      : inputs.eye !== null ? String(inputs.eye) : 'not selected';
    const verbalLabel = inputs.verbalNotTestable
      ? 'not testable (intubated)'
      : inputs.verbal !== null ? String(inputs.verbal) : 'not selected';
    const motorLabel  = inputs.motor !== null ? String(inputs.motor) : 'not selected';

    const parts = isComplete && result
      ? [
          `GCS: ${result.display} / 15`,
          `Severity: ${result.label}`,
          `Eye (E): ${eyeLabel}`,
          `Verbal (V): ${verbalLabel}`,
          `Motor (M): ${motorLabel}`,
        ]
      : ['GCS: Incomplete — select Eye, Verbal, and Motor.'];

    if (isComplete) trackResult(result!.total);
    copyToClipboard(parts.join('\n'), () => {
      setToastMessage('Copied to clipboard');
      setTimeout(() => setToastMessage(null), 2000);
    });
  }, [inputs, isComplete, result, trackResult]);

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setDrawerOpen(false);
    resetTracking();
    setToastMessage('Reset');
    setTimeout(() => setToastMessage(null), 1500);
  }, [resetTracking]);

  const handleFavToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('gcs');
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
      id="gcs-drawer-content"
      role="region"
      aria-label="GCS Score Interpretation"
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
            {result!.seeAlso.map((nodeId, i) => {
              const link = SEE_ALSO_LINKS[nodeId];
              if (!link) return null;
              return (
                <React.Fragment key={nodeId}>
                  {i > 0 && <span className="text-slate-300 mx-2">·</span>}
                  <Link to={link.path} className="text-neuro-600 hover:underline">
                    {link.label}
                  </Link>
                </React.Fragment>
              );
            })}
          </p>
        </div>

        {/* 4. Citation + disclaimer — §1.2 */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>
              {GCS_CITATION.authors}.{' '}
              {GCS_CITATION.title}.{' '}
              {GCS_CITATION.journal}.{' '}
              {GCS_CITATION.year};{GCS_CITATION.volume}({GCS_CITATION.issue}):{GCS_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${GCS_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{GCS_CITATION.doi}
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
                <div className="text-sm text-slate-500">0 of 3 selected</div>
              ) : (
                <div className="text-sm text-slate-600 font-medium">
                  {selectedCount} of 3 selected
                </div>
              )}
            </div>
            <div className="text-xs text-slate-400">
              {drawerState === 'A'
                ? 'Appears when complete'
                : `${3 - selectedCount} more to complete`}
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
        {/* Content renders ABOVE the button so the handle stays at viewport bottom (§1.3) */}
        {isExpanded && <DrawerContent />}
        {/* Header row — collapses / expands on click */}
        <button
          type="button"
          onClick={() => setDrawerOpen(open => !open)}
          aria-expanded={isExpanded}
          aria-controls="gcs-drawer-content"
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
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* sr-only h1 — exactly one per page, §7.4 */}
      <h1 className="sr-only">Glasgow Coma Scale (GCS) Score Calculator</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-5 py-4">
          <div className="flex items-center justify-between gap-2">

            {/* Left cluster: back arrow + score block */}
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
                {/* Calculator name label — §1.1 */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Glasgow Coma Scale
                </div>

                {/* Score display row — §1.1 */}
                <div
                  className="flex items-baseline gap-1.5 mt-0.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={
                    isComplete
                      ? `GCS ${result!.display} of 15. ${result!.label}.`
                      : 'Glasgow Coma Scale — not yet calculated'
                  }
                >
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
                    {isComplete ? result!.display : '—'}
                  </span>
                  <span className="text-slate-400 text-sm leading-none">/ 15</span>

                  {/* Severity text — only on moderate/high, not low (§1.1) */}
                  {isComplete && result!.severity === 'moderate' && (
                    <span className="text-xs font-medium text-amber-700 ml-1.5">
                      Moderate impairment
                    </span>
                  )}
                  {isComplete && result!.severity === 'high' && (
                    <span className="text-xs font-medium text-red-600 ml-1.5">
                      Severe impairment
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

          {/* 1. Eye Opening — E */}
          <section aria-labelledby="gcs-eye-label">
            <h2
              id="gcs-eye-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Eye Opening (E)
            </h2>

            {/* Not-testable checkbox — above radiogroup, clinical deviation per ADR-001 */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inputs.eyeNotTestable}
                onChange={(e) => setEyeNT(e.target.checked)}
                className="w-4 h-4 rounded text-neuro-600"
              />
              <span className="text-sm text-slate-600">
                Eye not testable (e.g. swollen shut, orbital trauma)
              </span>
            </label>

            {/* Radiogroup — hidden when not-testable is checked */}
            {!inputs.eyeNotTestable && (
              <div
                role="radiogroup"
                aria-labelledby="gcs-eye-label"
                ref={eyeGroupRef}
                className="divide-y divide-slate-200"
              >
                {GCS_EYE_OPTIONS.map((opt, idx) => {
                  const isSelected = inputs.eye === opt.value;
                  const tabIdx = inputs.eye !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={tabIdx}
                      onClick={() => setEye(opt.value)}
                      onKeyDown={makeKeyHandler(
                        eyeGroupRef, GCS_EYE_OPTIONS.length, idx,
                        (i) => setEye(GCS_EYE_OPTIONS[i].value),
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
                        {opt.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 2. Verbal Response — V */}
          <section aria-labelledby="gcs-verbal-label">
            <h2
              id="gcs-verbal-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Verbal Response (V)
            </h2>

            {/* Not-testable checkbox */}
            <label className="flex items-center gap-2 mb-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inputs.verbalNotTestable}
                onChange={(e) => setVerbalNT(e.target.checked)}
                className="w-4 h-4 rounded text-neuro-600"
              />
              <span className="text-sm text-slate-600">
                Verbal not testable (intubated — score displays with T suffix)
              </span>
            </label>

            {/* Radiogroup — hidden when not-testable is checked */}
            {!inputs.verbalNotTestable && (
              <div
                role="radiogroup"
                aria-labelledby="gcs-verbal-label"
                ref={verbalGroupRef}
                className="divide-y divide-slate-200"
              >
                {GCS_VERBAL_OPTIONS.map((opt, idx) => {
                  const isSelected = inputs.verbal === opt.value;
                  const tabIdx = inputs.verbal !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      tabIndex={tabIdx}
                      onClick={() => setVerbal(opt.value)}
                      onKeyDown={makeKeyHandler(
                        verbalGroupRef, GCS_VERBAL_OPTIONS.length, idx,
                        (i) => setVerbal(GCS_VERBAL_OPTIONS[i].value),
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
                        {opt.value}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 3. Motor Response — M (no not-testable option) */}
          <section aria-labelledby="gcs-motor-label">
            <h2
              id="gcs-motor-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Motor Response (M)
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="gcs-motor-label"
              ref={motorGroupRef}
              className="divide-y divide-slate-200"
            >
              {GCS_MOTOR_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.motor === opt.value;
                const tabIdx = inputs.motor !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setMotor(opt.value)}
                    onKeyDown={makeKeyHandler(
                      motorGroupRef, GCS_MOTOR_OPTIONS.length, idx,
                      (i) => setMotor(GCS_MOTOR_OPTIONS[i].value),
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
                      {opt.value}
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
              {GCS_CITATION.authors}.{' '}
              {GCS_CITATION.title}.{' '}
              {GCS_CITATION.journal}.{' '}
              {GCS_CITATION.year};{GCS_CITATION.volume}({GCS_CITATION.issue}):{GCS_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${GCS_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{GCS_CITATION.doi}
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
          className="fixed right-0 z-[55] bg-white"
          style={{ bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))', left: 'var(--nav-rail-width, 0px)' }}
        >
          <Drawer />
        </div>,
        document.body,
      )}

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
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

export default GlasgowComaScaleCalculator;
