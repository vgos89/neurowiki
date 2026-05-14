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
import { useNavigationSource } from '../hooks/useNavigationSource';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorFooter } from '../components/calculators/CalculatorFooter';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { CalculatorToast } from '../components/calculators/CalculatorToast';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useDrawerState } from '../hooks/useDrawerState';
import type { SeverityTokens } from '../lib/calculators/severityTokens';
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
  'minor':            'text-emerald-600',
  'moderate':         'text-amber-700',
  'moderate-severe':  'text-red-600',
  'severe':           'text-red-700',
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

// ─── Main component ───────────────────────────────────────────────────────────

const NihssCalculator: React.FC = () => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({});
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [userMode] = useState<'resident' | 'attending'>('resident');
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [showLvoTooltip, setShowLvoTooltip] = useState(false);
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

  const { state: drawerState, drawerOpen, setDrawerOpen, reset, toast, showToast } = useDrawerState({
    mode: 'partial-complete',
    selectedCount: answeredCount,
    totalRequired: totalItems,
  });

  const nihssTokens: SeverityTokens = {
    borderColor: SEVERITY_BORDER[severity],
    headerBg: SEVERITY_HEADER_BG[severity],
    headerHover: 'hover:brightness-95',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: `text-sm font-medium ${SEVERITY_COLOR[severity]}`,
    chevronClass: SEVERITY_COLOR[severity],
  };

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
    showToast('Copied to clipboard', 2000);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('nihss');
    showToast(isNowFav ? 'Saved to favorites' : 'Removed from favorites', 2000);
  };

  const handleReset = () => {
    setNihssValues({});
    reset();
    showToast('Reset', 1500);
  };

  /** Normal exam shortcut — Phase 7E §3.5: set all 15 items to 0, open drawer */
  const handleNormalExam = () => {
    const allZero = Object.fromEntries(NIHSS_ITEMS.map(item => [item.id, 0]));
    setNihssValues(allZero);
    setDrawerOpen(true);
  };

  // ── Drawer content ─────────────────────────────────────────────────────────

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
          <div className="mb-3 flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 rounded-lg">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">In progress</span>
            <span className="text-xs text-slate-400">{answeredCount} of {totalItems} items scored</span>
          </div>
        )}
        {/* Severity row */}
        <div className="flex items-baseline gap-3 mb-3">
          <span className={`text-xl font-semibold leading-tight ${SEVERITY_COLOR[severity]}`}>
            {SEVERITY_LABEL[severity]}
          </span>
          <span className="text-sm text-slate-400">NIHSS {total}</span>
        </div>

        {/* Severity scale */}
        <div className="text-xs text-slate-500 space-y-1 mb-4">
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
        <div className="pt-3 border-t border-slate-100 mb-3">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            LVO Probability (RACE)
          </div>
          <div className="flex items-baseline gap-2">
            <span className={`text-sm font-semibold ${
 lvoData.label === 'High'
 ? 'text-red-600'
 : lvoData.label === 'Moderate'
 ? 'text-amber-700'
 : 'text-green-600'
 }`}>
              {lvoData.label}
            </span>
            <span className="text-sm text-slate-500">{lvoData.probability}%</span>
            <span className="text-xs text-slate-400">· RACE {lvoData.raceScore}/9</span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed">
            RACE ≥5 has 85% sensitivity for LVO — consider urgent vascular imaging.
          </p>
        </div>

        {/* Copy shortcut */}
        <button
          type="button"
          onClick={() => { copyNihss(); setDrawerOpen(false); /* collapses drawer after copy */ }}
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

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <h1 className="sr-only">NIHSS Calculator — NIH Stroke Scale Online</h1>

      {/* ── Sticky header — CALCULATOR_SPEC.md §1.1 + §3.1 ──────────────── */}
      <CalculatorHeader
        name="NIH Stroke Scale"
        headerRef={nihssHeaderRef}
        scoreDisplay={
          <>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
              {isComplete ? total : '—'}
            </span>
            <span className="text-slate-400 text-sm leading-none">/ 42</span>
            {isComplete && severity === 'moderate' && (
              <span className="text-xs font-medium text-amber-700 ml-1.5">
                Moderate
              </span>
            )}
            {isComplete && (severity === 'moderate-severe' || severity === 'severe') && (
              <span className="text-xs font-medium text-red-600 ml-1.5">
                {SEVERITY_LABEL[severity]}
              </span>
            )}
          </>
        }
        scoreAriaLabel={
          isComplete
            ? `NIHSS ${total} of 42. ${SEVERITY_LABEL[severity]}.`
            : 'NIH Stroke Scale — not yet calculated'
        }
        secondaryRow={
          <>
            {/* LVO cluster */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                LVO
              </span>
              <span className={`text-sm font-semibold leading-none ${
                lvoData.label === 'High'
                  ? 'text-red-600'
                  : lvoData.label === 'Moderate'
                  ? 'text-amber-700'
                  : 'text-green-600'
              }`}>
                {lvoData.label} · {lvoData.probability}%
              </span>
              <div className="relative" ref={lvoTooltipRef}>
                <button
                  type="button"
                  onClick={() => setShowLvoTooltip(!showLvoTooltip)}
                  className="p-2 -m-2 rounded-full hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="LVO probability information"
                  aria-expanded={showLvoTooltip}
                >
                  <svg className="w-3.5 h-3.5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>

                {showLvoTooltip && (
                  <div className="fixed md:absolute inset-x-4 md:inset-x-auto top-32 md:top-full md:left-0 md:mt-2 w-auto md:w-80 max-w-md mx-auto md:mx-0 p-4 bg-white rounded-lg shadow-xl border border-slate-200 z-50">
                    <div className="text-sm font-bold text-slate-900 mb-3">
                      LVO Probability (RACE Scale)
                    </div>

                    {/* RACE score breakdown */}
                    <div className="mb-3 p-2 bg-slate-100 rounded-lg">
                      <div className="text-xs font-bold text-slate-700 mb-1">
                        RACE Score: {lvoData.raceScore}/9
                      </div>
                      <div className="text-[10px] text-slate-600 space-y-0.5">
                        <div>Facial Palsy: {lvoData.breakdown.facial}/2</div>
                        <div>Arm Motor (worst): {lvoData.breakdown.arm}/2</div>
                        <div>Leg Motor (worst): {lvoData.breakdown.leg}/2</div>
                        <div>Gaze Deviation: {lvoData.breakdown.gaze}/1</div>
                        <div>Aphasia: {lvoData.breakdown.aphasia}/2</div>
                        <div>Agnosia/Neglect: {lvoData.breakdown.agnosia}/1</div>
                      </div>
                    </div>

                    {/* RACE interpretation */}
                    <div className="text-xs text-slate-600 space-y-1 mb-3">
                      <p className="font-semibold text-slate-700">RACE Interpretation:</p>
                      <ul className="list-disc list-inside space-y-0.5 ml-2">
                        <li><strong>0–4:</strong> Low — 20% LVO probability</li>
                        <li><strong>5–6:</strong> Moderate — 55% LVO probability</li>
                        <li><strong>7–9:</strong> High — 85% LVO probability</li>
                      </ul>
                    </div>

                    {/* Source */}
                    <div className="text-[10px] text-slate-500 border-t border-slate-200 pt-2">
                      Pérez de la Ossa N et al. Stroke. 2014.
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowLvoTooltip(false)}
                      className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label="Close"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Mode toggle — rounded-full per §3.1 */}
            <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5">
              <button
                type="button"
                onClick={() => setNihssMode('rapid')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  nihssMode === 'rapid'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Rapid
              </button>
              <button
                type="button"
                onClick={() => setNihssMode('detailed')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  nihssMode === 'detailed'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Detailed
              </button>
            </div>
          </>
        }
        onBack={handleBack}
        onReset={handleReset}
        onCopy={copyNihss}
        onFavToggle={handleFavToggle}
        isFav={isFav}
      />

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
                    <h3 className="font-black text-sm text-slate-400 uppercase tracking-widest">Motor</h3>
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
        <CalculatorFooter
          citation="Brott T et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864–870."
          disclaimer="Educational use only. Not a substitute for clinical judgment."
        />

        {/* Drawer spacer — prevents content hiding behind fixed drawer (§1.3) */}
        <div style={{ height: drawerOpen ? '380px' : '80px' }} aria-hidden="true" />
      </main>

      {/* ── Bottom drawer — §1.3 ─────────────────────────────────────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={nihssTokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="nihss-drawer-content"
        ariaLabel="Toggle NIHSS interpretation"
        stateBTappable={true}
        stateAText={{ label: `0 of ${totalItems} selected`, hint: 'Appears when complete' }}
        stateBText={{ label: `${answeredCount} of ${totalItems} selected`, hint: `${totalItems - answeredCount} more to complete` }}
        collapsedStat={`${SEVERITY_LABEL[severity]} · NIHSS ${total}`}
        justCompleted={justCompleted}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
};

export default NihssCalculator;
