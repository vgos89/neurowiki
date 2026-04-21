/**
 * Heidelberg Bleeding Classification Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 1 (single-page radio) with 4-state persistent bottom drawer.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.1–2.5 Archetype 1 option rows · §3.4 detailed-mode two-line option anatomy
 *   §5 Drawer state machine · §6 Severity tokens · §4.5 "Important"-style callout anatomy
 *
 * Clinical-safety deviation from Archetype 1 (documented in ADR-004):
 *   Scope callout above the first section — prevents misuse of the tool for
 *   spontaneous ICH classification. V-approved and clinical-reviewer-approved
 *   as a bedside misuse-prevention boundary that cannot live elsewhere.
 *
 * Medical source: von Kummer R, Broderick J, Campbell B et al. Stroke 2015;46(10):2981–2986.
 * Prose preservation: all eight classification + management-note strings and the SICH
 * append are passthrough from src/data/heidelbergBleedingData.ts (classifyHeidelbergBleeding).
 * Zero prose drift — verified by clinical-reviewer Phase 5 diff.
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
  HEIDELBERG_CITATION,
  HEIDELBERG_OPTIONS,
  calculateHeidelberg,
  type HeidelbergInputs,
  type HeidelbergClass,
  type HeidelbergCalculatorResult,
  type HeidelbergSeverity,
} from '../data/heidelbergBleedingData';

// ─── Constants ────────────────────────────────────────────────────────────────

type HeidelbergState = Partial<HeidelbergInputs>;

const DEFAULT_INPUTS: HeidelbergState = {};

/** Severity → drawer visual tokens — CALCULATOR_SPEC.md §6 table */
const SEVERITY_TOKENS: Record<HeidelbergSeverity, {
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
    chevronClass: 'text-amber-700',
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

/** Link-graph resolution for seeAlso IDs — matches docs/link-graph.json calc/heidelberg node */
const SEE_ALSO_LINKS: Record<string, { path: string; label: string }> = {
  'calc/nihss': { path: '/calculators/nihss', label: 'NIHSS Calculator' },
};

/** SICH (symptomatic status) options — optional second section */
const SICH_OPTIONS: { value: boolean; label: string; sub: string }[] = [
  { value: false, label: 'Asymptomatic (aSICH)', sub: 'No attributable neurologic deterioration' },
  { value: true,  label: 'Symptomatic (SICH)',    sub: '≥4 pt NIHSS increase, ≥2 pt in one subcategory, or intervention' },
];

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

const HeidelbergBleedingCalculator: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [inputs, setInputs]           = useState<HeidelbergState>(DEFAULT_INPUTS);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [toastMessage, setToastMessage]   = useState<string | null>(null);

  const wasCompleteRef  = useRef<boolean>(false);
  const classGroupRef   = useRef<HTMLDivElement>(null);
  const sichGroupRef    = useRef<HTMLDivElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { getBackPath }                = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { trackResult, resetTracking } = useCalculatorAnalytics('heidelberg_bleeding');

  // ── Derived values ─────────────────────────────────────────────────────────
  // Only bleedingClass gates completion. SICH is optional and does not count.
  const isComplete = inputs.bleedingClass !== undefined;
  const result: HeidelbergCalculatorResult | null = isComplete
    ? calculateHeidelberg({
        bleedingClass: inputs.bleedingClass!,
        symptomatic: inputs.symptomatic,
      })
    : null;

  /** Drawer state machine — simplified for single-required-slot calculator.
   *  A = no class selected · C = class selected. No State B (partial) because
   *  there is only one required slot; SICH never blocks completion. */
  const drawerState: 'A' | 'C' = isComplete ? 'C' : 'A';

  const isFav = isFavorite('heidelberg-bleeding');

  // ── Effects ────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setJustCompleted(true);
      const timer = setTimeout(() => setJustCompleted(false), 1800);
      return () => clearTimeout(timer);
    }
    if (!isComplete && wasCompleteRef.current) {
      wasCompleteRef.current = false;
      setJustCompleted(false);
    }
  }, [isComplete]);

  // ── Setters ────────────────────────────────────────────────────────────────
  const setClass = useCallback(
    (v: HeidelbergClass) => setInputs(p => ({ ...p, bleedingClass: v })),
    [],
  );
  const setSymptomatic = useCallback(
    (v: boolean) => setInputs(p => ({ ...p, symptomatic: v })),
    [],
  );

  // ── Keyboard navigation — roving tabindex ──────────────────────────────────
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
    const parts = isComplete && result
      ? [
          `Heidelberg Bleeding Classification: ${result.classification}`,
          result.stat ? `Status: ${result.stat}` : null,
          result.interpretation,
          `Management: ${result.explanation}`,
        ].filter((x): x is string => x !== null)
      : ['Heidelberg Bleeding Classification: Select a bleeding class.'];

    if (isComplete && result) trackResult(result.shortLabel);
    copyToClipboard(parts.join('\n'), () => {
      setToastMessage('Copied to clipboard');
      setTimeout(() => setToastMessage(null), 2000);
    });
  }, [isComplete, result, trackResult]);

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
    const isNowFav = toggleFavorite('heidelberg-bleeding');
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
      id="heidelberg-drawer-content"
      role="region"
      aria-label="Heidelberg Classification Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        {/* 1. Interpretation headline — §5.1 (passthrough clinicalSignificance) */}
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          {result!.interpretation}
        </p>

        {/* 2. Explanation paragraph — §5.1 (passthrough managementNote, SICH-aware) */}
        <p className="text-slate-600 leading-relaxed mt-3">
          {result!.explanation}
        </p>

        {/* 3. See also — §5.1, link-graph references */}
        {result!.seeAlso.length > 0 && (
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
        )}

        {/* 4. Citation + disclaimer — §1.2 */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>
              {HEIDELBERG_CITATION.authors}.{' '}
              {HEIDELBERG_CITATION.title}.{' '}
              {HEIDELBERG_CITATION.journal}.{' '}
              {HEIDELBERG_CITATION.year};{HEIDELBERG_CITATION.volume}({HEIDELBERG_CITATION.issue}):{HEIDELBERG_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${HEIDELBERG_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{HEIDELBERG_CITATION.doi}
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. For hemorrhagic transformation after reperfusion therapy.
          </p>
        </div>
      </div>
    </div>
  );

  /** Bottom drawer — rendered as portal, fixed above mobile nav §1.3 */
  const Drawer: React.FC = () => {
    // State A — muted, non-interactive
    if (drawerState === 'A') {
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
              <div className="text-sm text-slate-500">No class selected</div>
            </div>
            <div className="text-xs text-slate-400">Appears when complete</div>
          </div>
        </div>
      );
    }

    // State C — complete, tappable header
    if (!tokens || !result) return null;
    const isExpanded = drawerOpen;

    return (
      <div
        style={{
          borderTop: `1px solid ${tokens.borderColor}`,
          boxShadow: isExpanded ? drawerExpandedShadow : drawerCollapsedShadow,
        }}
      >
        <button
          type="button"
          onClick={() => setDrawerOpen(open => !open)}
          aria-expanded={isExpanded}
          aria-controls="heidelberg-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
            isExpanded
              ? `${tokens.headerBg} ${tokens.headerHover}`
              : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={
              isExpanded
                ? tokens.labelClass
                : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'
            }>
              Interpretation
            </div>
            <div className={`${isExpanded ? tokens.statClass : 'text-sm font-medium text-slate-900'} truncate`}>
              {result.label}
              {result.stat && (
                <>
                  <span className="text-slate-300 mx-2">·</span>
                  {result.stat}
                </>
              )}
            </div>
          </div>
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

        {isExpanded && <DrawerContent />}
      </div>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">Heidelberg Bleeding Classification Calculator</h1>

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
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Heidelberg Classification
                </div>

                <div
                  className="flex items-baseline gap-1.5 mt-0.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={
                    isComplete
                      ? `Heidelberg ${result!.classification}${result!.stat ? `, ${result!.stat}` : ''}.`
                      : 'Heidelberg Bleeding Classification — no class selected'
                  }
                >
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
                    {isComplete ? result!.shortLabel : '—'}
                  </span>

                  {/* Severity text — only on moderate/high per §1.1 */}
                  {isComplete && result!.severity === 'moderate' && (
                    <span className="text-xs font-medium text-amber-700 ml-1.5">
                      Moderate
                    </span>
                  )}
                  {isComplete && result!.severity === 'high' && (
                    <span className="text-xs font-medium text-red-600 ml-1.5">
                      High
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

        {/* Scope callout — approved Archetype 1 deviation per ADR-004 */}
        <div className="mb-6 pl-3 border-l-2 border-amber-400">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">
            Scope
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            This classification is for hemorrhagic transformation after ischemic stroke and
            reperfusion therapy (tPA or thrombectomy). It is not for spontaneous ICH location.
            Use brain imaging within 48 hours of reperfusion and as needed for new symptoms.
          </p>
        </div>

        <div className="space-y-10">

          {/* 1. Bleeding class — 8 options (required) */}
          <section aria-labelledby="heidelberg-class-label">
            <h2
              id="heidelberg-class-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Bleeding class
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="heidelberg-class-label"
              ref={classGroupRef}
              className="divide-y divide-slate-200"
            >
              {HEIDELBERG_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.bleedingClass === opt.value;
                const tabIdx = inputs.bleedingClass !== undefined
                  ? (isSelected ? 0 : -1)
                  : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setClass(opt.value)}
                    onKeyDown={makeKeyHandler(
                      classGroupRef, HEIDELBERG_OPTIONS.length, idx,
                      (i) => setClass(HEIDELBERG_OPTIONS[i].value),
                    )}
                    className={
                      isSelected
                        ? 'selected-option w-full flex flex-col gap-0.5 py-3 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex flex-col gap-0.5 py-3 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                    }
                  >
                    <span className={isSelected ? 'font-semibold' : 'font-medium text-slate-900'}>
                      {opt.label}
                    </span>
                    <span className={isSelected ? 'text-xs opacity-75' : 'text-xs text-slate-500'}>
                      {opt.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2. Symptomatic status — 2 options (optional) */}
          <section aria-labelledby="heidelberg-sich-label">
            <div className="flex items-baseline justify-between mb-3">
              <h2
                id="heidelberg-sich-label"
                className="text-[10px] font-bold text-slate-400 uppercase tracking-widest"
              >
                Symptomatic status
              </h2>
              <span className="text-[10px] font-medium text-slate-400">Optional</span>
            </div>
            <div
              role="radiogroup"
              aria-labelledby="heidelberg-sich-label"
              ref={sichGroupRef}
              className="divide-y divide-slate-200"
            >
              {SICH_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.symptomatic === opt.value;
                const tabIdx = inputs.symptomatic !== undefined
                  ? (isSelected ? 0 : -1)
                  : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setSymptomatic(opt.value)}
                    onKeyDown={makeKeyHandler(
                      sichGroupRef, SICH_OPTIONS.length, idx,
                      (i) => setSymptomatic(SICH_OPTIONS[i].value),
                    )}
                    className={
                      isSelected
                        ? 'selected-option w-full flex flex-col gap-0.5 py-3 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex flex-col gap-0.5 py-3 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                    }
                  >
                    <span className={isSelected ? 'font-semibold' : 'font-medium text-slate-900'}>
                      {opt.label}
                    </span>
                    <span className={isSelected ? 'text-xs opacity-75' : 'text-xs text-slate-500'}>
                      {opt.sub}
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
              {HEIDELBERG_CITATION.authors}.{' '}
              {HEIDELBERG_CITATION.title}.{' '}
              {HEIDELBERG_CITATION.journal}.{' '}
              {HEIDELBERG_CITATION.year};{HEIDELBERG_CITATION.volume}({HEIDELBERG_CITATION.issue}):{HEIDELBERG_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${HEIDELBERG_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{HEIDELBERG_CITATION.doi}
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. For hemorrhagic transformation after reperfusion therapy.
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

export default HeidelbergBleedingCalculator;
