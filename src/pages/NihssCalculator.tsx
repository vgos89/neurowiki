/**
 * NIHSS Calculator — rebuilt against CALCULATOR_SPEC.md v1.1 §3 (Archetype 2)
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer (Portal)
 *   §3.1 Two-row header · §3.2 Item numbering · §3.3 Per-item warnings
 *   §3.4 Rapid/Detailed toggle · §3.5 Shortcut buttons · §5 Drawer state machine
 *
 * Drawer note (Option A per PM approval):
 *   Shell drawer — severity bracket from established NIHSS thresholds + RACE-derived
 *   LVO label derived from already-computed lvoData. No new clinical prose authored.
 *   Interpretation strings (Class E) are deferred to a follow-up task.
 *
 * NIHSS severity thresholds (Adams et al. 1999; standard clinical convention):
 *   0   → No stroke symptoms
 *   1–4 → Minor
 *   5–15 → Moderate
 *   16–20 → Moderate-to-severe
 *   21–42 → Severe
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { Star, RefreshCw } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { NIHSS_ITEMS, calculateTotal, getItemWarning, calculateLvoProbability } from '../utils/nihssShortcuts';
import { getMainScrollElement, scrollWithinMainOrWindow } from '../utils/mainScroll';
import NihssItemCard from '../components/NihssItemCard';

// ─── Severity helpers ─────────────────────────────────────────────────────────

type NIHSSSeverity = 'none' | 'minor' | 'moderate' | 'moderate-severe' | 'severe';

function getNihssSeverity(total: number): NIHSSSeverity {
  if (total === 0)       return 'none';
  if (total <= 4)        return 'minor';
  if (total <= 15)       return 'moderate';
  if (total <= 20)       return 'moderate-severe';
  return 'severe';
}

const SEVERITY_LABEL: Record<NIHSSSeverity, string> = {
  'none':             'No symptoms',
  'minor':            'Minor',
  'moderate':         'Moderate',
  'moderate-severe':  'Moderate to severe',
  'severe':           'Severe',
};

/** Text color class per severity — matches CALCULATOR_SPEC.md §6 */
const SEVERITY_COLOR: Record<NIHSSSeverity, string> = {
  'none':             'text-slate-500',
  'minor':            'text-emerald-600 dark:text-emerald-400',
  'moderate':         'text-amber-700 dark:text-amber-400',
  'moderate-severe':  'text-red-600 dark:text-red-400',
  'severe':           'text-red-700 dark:text-red-400',
};

/** Border color for drawer header (State C) per severity */
const SEVERITY_BORDER: Record<NIHSSSeverity, string> = {
  'none':             '#e2e8f0',
  'minor':            '#a7f3d0',
  'moderate':         '#fed7aa',
  'moderate-severe':  '#fecaca',
  'severe':           '#fecaca',
};

/** Header background (State C expanded) per severity */
const SEVERITY_HEADER_BG: Record<NIHSSSeverity, string> = {
  'none':             'bg-white',
  'minor':            'bg-emerald-50',
  'moderate':         'bg-amber-50',
  'moderate-severe':  'bg-red-50',
  'severe':           'bg-red-50',
};

// ─── Back arrow SVG (spec §1.1) ───────────────────────────────────────────────

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

/** Chevron — direction prop controls up vs down */
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

const NihssCalculator: React.FC = () => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [userMode] = useState<'resident' | 'attending'>('resident');
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showLvoTooltip, setShowLvoTooltip] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const lvoTooltipRef = useRef<HTMLDivElement>(null);
  const nihssHeaderRef = useRef<HTMLDivElement>(null);
  const wasCompleteRef = useRef(false);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();

  // ── Side effects ───────────────────────────────────────────────────────────

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'nihss',
      title: 'NIHSS',
      subtitle: 'NIH Stroke Scale',
      category: 'severity',
      trail: '0–42',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Publish drawer floor height so FeedbackButton lifts above the drawer (§1.3)
  useEffect(() => {
    document.documentElement.style.setProperty('--drawer-floor-height', '52px');
    return () => {
      document.documentElement.style.setProperty('--drawer-floor-height', '0px');
    };
  }, []);

  // Close LVO tooltip on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (lvoTooltipRef.current && !lvoTooltipRef.current.contains(event.target as Node)) {
        setShowLvoTooltip(false);
      }
    };
    if (showLvoTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showLvoTooltip]);

  // ── Derived values ─────────────────────────────────────────────────────────

  const lvoData = useMemo(() => calculateLvoProbability(nihssValues), [nihssValues]);
  const total = calculateTotal(nihssValues);
  const answeredCount = NIHSS_ITEMS.filter(i => nihssValues[i.id] !== undefined).length;
  const totalItems = NIHSS_ITEMS.length;
  const isComplete = answeredCount === totalItems;
  const severity = getNihssSeverity(total);

  /** Drawer state machine — CALCULATOR_SPEC.md §5 */
  const drawerState: 'A' | 'B' | 'C' =
    answeredCount === 0 ? 'A' :
    !isComplete         ? 'B' : 'C';

  const isFav = isFavorite('nihss');

  // Discovery animation fires once per completion (§5.4)
  useEffect(() => {
    if (isComplete && !wasCompleteRef.current) {
      wasCompleteRef.current = true;
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 1800);
      return () => clearTimeout(t);
    }
    if (!isComplete && wasCompleteRef.current) {
      wasCompleteRef.current = false;
      setJustCompleted(false);
    }
  }, [isComplete]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleNihssChange = (id: string, val: number) => {
    setNihssValues((prev) => ({ ...prev, [id]: val }));
    const idx = NIHSS_ITEMS.findIndex((i) => i.id === id);
    if (idx >= 0 && idx < NIHSS_ITEMS.length - 1) {
      setTimeout(() => {
        const nextItem = NIHSS_ITEMS[idx + 1];
        const el = document.getElementById(`nihss-row-${nextItem.id}`);
        if (el) {
          const mainNavHeight = 64;
          const nihssHeaderHeight = nihssHeaderRef.current?.offsetHeight || 120;
          const offset = mainNavHeight + nihssHeaderHeight + 20;
          const main = getMainScrollElement();
          if (main) {
            const elementTop = el.offsetTop - main.offsetTop;
            main.scrollTo({ top: elementTop - offset, behavior: 'smooth' });
          } else {
            scrollWithinMainOrWindow(el, offset);
          }
        }
      }, 300);
    }
  };

  const setAllMotor = (val: number) => {
    setNihssValues((prev) => ({ ...prev, '5a': val, '5b': val, '6a': val, '6b': val }));
  };

  const copyNihss = () => {
    const breakdown = NIHSS_ITEMS.map((i) => `${i.shortName}: ${nihssValues[i.id] ?? 0}`).join('\n');
    navigator.clipboard.writeText(`NIHSS Total: ${total}\n\n${breakdown}`);
    setToastMessage('Copied to clipboard');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('nihss');
    setToastMessage(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleReset = () => {
    setNihssValues({});
    setDrawerOpen(false);
    setToastMessage('Reset');
    setTimeout(() => setToastMessage(null), 1500);
  };

  /** Normal exam shortcut — Phase 7E §3.5: set all 15 items to 0, open drawer */
  const handleNormalExam = () => {
    const allZero = Object.fromEntries(NIHSS_ITEMS.map(item => [item.id, 0]));
    setNihssValues(allZero);
    setDrawerOpen(true);
  };

  // ── Portal drawer ──────────────────────────────────────────────────────────

  const drawerCollapsedShadow = '0 -2px 12px rgba(15,23,42,0.08)';
  const drawerExpandedShadow  = '0 -4px 24px rgba(15,23,42,0.12)';

  /** Expanded drawer content — severity bracket + LVO label (Option A shell) */
  const DrawerContent: React.FC = () => (
    <div
      id="nihss-drawer-content"
      role="region"
      aria-label="NIHSS Score Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        {/* Partial score note — State B only */}
        {drawerState === 'B' && (
          <div className="mb-3 flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In progress</span>
            <span className="text-xs text-slate-400">{answeredCount} of {totalItems} items scored</span>
          </div>
        )}
        {/* Severity row */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`text-xl font-semibold ${SEVERITY_COLOR[severity]}`}>
            {SEVERITY_LABEL[severity]}
          </span>
          <span className="text-sm text-slate-400">NIHSS {total}</span>
        </div>

        {/* Severity scale */}
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 mb-4">
          {[
            { range: '0', label: 'No symptoms' },
            { range: '1–4', label: 'Minor' },
            { range: '5–15', label: 'Moderate' },
            { range: '16–20', label: 'Moderate to severe' },
            { range: '21–42', label: 'Severe' },
          ].map(({ range, label }) => (
            <div key={range} className="flex items-center gap-2">
              <span className="w-12 text-right tabular-nums text-slate-400">{range}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* LVO probability divider */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-700 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            LVO Probability (RACE)
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-sm font-semibold ${
              lvoData.label === 'High'
                ? 'text-red-600 dark:text-red-400'
                : lvoData.label === 'Moderate'
                ? 'text-amber-700 dark:text-amber-400'
                : 'text-green-600 dark:text-green-400'
            }`}>
              {lvoData.label}
            </span>
            <span className="text-sm text-slate-500">{lvoData.probability}%</span>
            <span className="text-xs text-slate-400">· RACE {lvoData.raceScore}/9</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-2 leading-relaxed">
            RACE ≥5 has 85% sensitivity for LVO — consider urgent vascular imaging.
          </p>
        </div>

        {/* Copy shortcut */}
        <button
          type="button"
          onClick={() => { copyNihss(); setDrawerOpen(false); }}
          className="w-full mt-1 bg-neuro-500 hover:bg-neuro-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          Copy to clipboard
        </button>

        {/* Disclaimer */}
        <p className="mt-4 text-xs text-slate-400 leading-relaxed">
          Educational use only. Not a substitute for clinical judgment.
        </p>
      </div>
    </div>
  );

  /** Bottom drawer portal — CALCULATOR_SPEC.md §1.3, §5 */
  const Drawer: React.FC = () => {
    // State A — no items answered, muted non-interactive
    if (drawerState === 'A') {
      return (
        <div
          className="bg-slate-100 dark:bg-slate-800"
          style={{ boxShadow: drawerCollapsedShadow }}
          aria-hidden="true"
        >
          <div className="px-5 py-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Interpretation
              </div>
              <div className="text-sm text-slate-500">0 of {totalItems} selected</div>
            </div>
            <div className="text-xs text-slate-400">Appears when complete</div>
          </div>
        </div>
      );
    }

    // States B + C — live, tappable (B shows partial note inside DrawerContent)
    const isExpanded = drawerOpen;
    const borderColor = SEVERITY_BORDER[severity];
    const headerBg = isExpanded ? SEVERITY_HEADER_BG[severity] : 'bg-white dark:bg-slate-900';

    return (
      <div
        style={{
          borderTop: `1px solid ${borderColor}`,
          boxShadow: isExpanded ? drawerExpandedShadow : drawerCollapsedShadow,
        }}
      >
        {/* Content renders ABOVE the button so the handle stays at viewport bottom (§1.3) */}
        {isExpanded && <DrawerContent />}
        <button
          type="button"
          onClick={() => setDrawerOpen(open => !open)}
          aria-expanded={isExpanded}
          aria-controls="nihss-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${headerBg} hover:brightness-95`}
        >
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Interpretation
            </div>
            <div className={`text-sm font-medium ${SEVERITY_COLOR[severity]}`}>
              {SEVERITY_LABEL[severity]} · NIHSS {total}
            </div>
          </div>
          <Chevron
            direction={isExpanded ? 'up' : 'down'}
            className={
              isExpanded
                ? SEVERITY_COLOR[severity]
                : justCompleted
                  ? `${SEVERITY_COLOR[severity]} drawer-discovery-chevron`
                  : 'text-slate-400 drawer-chevron-hint'
            }
          />
        </button>
      </div>
    );
  };

  const drawerPortalTarget = typeof document !== 'undefined' ? document.body : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <h1 className="sr-only">NIHSS Calculator — NIH Stroke Scale Online</h1>

      {/* ── Sticky header — CALCULATOR_SPEC.md §1.1 + §3.1 ──────────────── */}
      <header
        ref={nihssHeaderRef}
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-100 dark:border-slate-700"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-5 py-3">

          {/* Row 1: back + score + actions (§1.1) */}
          <div className="flex items-center justify-between gap-2">

            {/* Left cluster: back arrow + score block */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0"
                aria-label="Back to calculators"
              >
                <BackArrow />
              </button>

              <div className="min-w-0">
                {/* Calculator name label — §1.1 */}
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  NIH Stroke Scale
                </div>

                {/* Score display row — §1.1 */}
                <div
                  className="flex items-baseline gap-1.5 mt-0.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={
                    isComplete
                      ? `NIHSS ${total} of 42. ${SEVERITY_LABEL[severity]}.`
                      : 'NIH Stroke Scale — not yet calculated'
                  }
                >
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white tabular-nums leading-none">
                    {isComplete ? total : '—'}
                  </span>
                  <span className="text-slate-400 text-sm leading-none">/ 42</span>

                  {/* Severity text — only on moderate+ (§1.1) */}
                  {isComplete && severity === 'moderate' && (
                    <span className="text-xs font-medium text-amber-700 dark:text-amber-400 ml-1.5">
                      Moderate
                    </span>
                  )}
                  {isComplete && (severity === 'moderate-severe' || severity === 'severe') && (
                    <span className="text-xs font-medium text-red-600 dark:text-red-400 ml-1.5">
                      {SEVERITY_LABEL[severity]}
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
                className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                className="p-2 rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Reset calculator"
              >
                <RefreshCw size={17} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={copyNihss}
                className="ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Row 2: LVO cluster + mode toggle — §3.1 */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">

            {/* LVO cluster */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                LVO
              </span>
              <span className={`text-sm font-semibold leading-none ${
                lvoData.label === 'High'
                  ? 'text-red-600 dark:text-red-400'
                  : lvoData.label === 'Moderate'
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {lvoData.label} · {lvoData.probability}%
              </span>
              <div className="relative" ref={lvoTooltipRef}>
                <button
                  type="button"
                  onClick={() => setShowLvoTooltip(!showLvoTooltip)}
                  className="p-2 -m-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="LVO probability information"
                  aria-expanded={showLvoTooltip}
                >
                  <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>

                {showLvoTooltip && (
                  <div className="fixed md:absolute inset-x-4 md:inset-x-auto top-32 md:top-full md:left-0 md:mt-2 w-auto md:w-80 max-w-md mx-auto md:mx-0 p-4 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 z-50">
                    <div className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                      LVO Probability (RACE Scale)
                    </div>

                    {/* RACE score breakdown */}
                    <div className="mb-3 p-2 bg-slate-100 dark:bg-slate-700/50 rounded-lg">
                      <div className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                        RACE Score: {lvoData.raceScore}/9
                      </div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 space-y-0.5">
                        <div>Facial Palsy: {lvoData.breakdown.facial}/2</div>
                        <div>Arm Motor (worst): {lvoData.breakdown.arm}/2</div>
                        <div>Leg Motor (worst): {lvoData.breakdown.leg}/2</div>
                        <div>Gaze Deviation: {lvoData.breakdown.gaze}/1</div>
                        <div>Aphasia: {lvoData.breakdown.aphasia}/2</div>
                        <div>Agnosia/Neglect: {lvoData.breakdown.agnosia}/1</div>
                      </div>
                    </div>

                    {/* RACE interpretation */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1 mb-3">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">RACE Interpretation:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><strong>0–4:</strong> Low — 20% LVO probability</li>
                        <li><strong>5–6:</strong> Moderate — 55% LVO probability</li>
                        <li><strong>7–9:</strong> High — 85% LVO probability</li>
                      </ul>
                    </div>

                    {/* Source */}
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-2">
                      Pérez de la Ossa N et al. Stroke. 2014.
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLvoTooltip(false)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mode toggle — rounded-full per §3.1 */}
            <div className="flex items-center gap-0.5 bg-slate-100 dark:bg-slate-700 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setNihssMode('rapid')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  nihssMode === 'rapid'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Rapid
              </button>
              <button
                type="button"
                onClick={() => setNihssMode('detailed')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  nihssMode === 'detailed'
                    ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        {/* Normal exam shortcut — Phase 7E §3.5 */}
        <div className="flex justify-start mb-2">
          <button
            type="button"
            onClick={handleNormalExam}
            className="text-[10px] font-semibold text-neuro-600 underline-offset-2 hover:underline"
          >
            Normal exam
          </button>
        </div>
        <div className="grid grid-cols-1 gap-6">
          {NIHSS_ITEMS.map((item) => {
            const warning = userMode === 'resident' ? getItemWarning(item.id, nihssValues[item.id] ?? 0, nihssValues) : null;
            const showPearl = userMode === 'resident' || activePearl === item.id;
            const isRequired = item.id === '1a';

            if (item.id === '5a') {
              return (
                <React.Fragment key="motor-header">
                  <div className="flex justify-between items-end mb-2">
                    <h3 className="font-black text-sm text-slate-400 dark:text-slate-500 uppercase tracking-widest">Motor</h3>
                    {/* Shortcut button — §3.5 */}
                    <button
                      type="button"
                      onClick={() => setAllMotor(0)}
                      className="text-[10px] font-semibold text-neuro-600 underline-offset-2 hover:underline"
                    >
                      Normal all motor
                    </button>
                  </div>
                  <NihssItemCard
                    key={item.id}
                    item={item}
                    value={nihssValues[item.id] ?? 0}
                    onChange={(v) => handleNihssChange(item.id, v)}
                    mode={nihssMode}
                    userMode={userMode}
                    showPearl={showPearl}
                    onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))}
                    warning={warning}
                  />
                </React.Fragment>
              );
            }
            return (
              <NihssItemCard
                key={item.id}
                item={item}
                value={nihssValues[item.id] ?? 0}
                onChange={(v) => handleNihssChange(item.id, v)}
                mode={nihssMode}
                userMode={userMode}
                showPearl={showPearl}
                onShowPearl={() => setActivePearl((p) => (p === item.id ? null : item.id))}
                warning={warning}
                isRequired={isRequired}
              />
            );
          })}
        </div>

        {/* Footer — §1.2 */}
        <footer className="mt-14 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-xs text-slate-400 leading-relaxed">
            Brott T et al. Measurements of acute cerebral infarction: a clinical examination scale.
            Stroke. 1989;20(7):864–870.
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. Not a substitute for clinical judgment.
          </p>
        </footer>

        {/* Drawer spacer — prevents content hiding behind fixed drawer (§1.3) */}
        <div style={{ height: drawerOpen ? '380px' : '80px' }} aria-hidden="true" />
      </main>

      {/* ── Portal bottom drawer — §1.3 ──────────────────────────────────── */}
      {drawerPortalTarget && createPortal(
        <div
          style={{
            position: 'fixed',
            bottom: 'calc(var(--tab-bar-height, 0px) + env(safe-area-inset-bottom, 0px))',
            left: 0,
            right: 0,
            zIndex: 55,
          }}
        >
          <Drawer />
        </div>,
        drawerPortalTarget,
      )}

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl text-sm font-bold animate-in fade-in zoom-in-95 duration-200 z-[60] whitespace-nowrap">
          {toastMessage}
        </div>
      )}
    </>
  );
};

export default NihssCalculator;
