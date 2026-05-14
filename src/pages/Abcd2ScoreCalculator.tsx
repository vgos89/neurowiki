/**
 * ABCD² Score Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 1 (single-page radio) with 4-state persistent bottom drawer.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.1–2.5 Archetype 1 option rows · §5 Drawer state machine · §6 Severity tokens
 *
 * No structural deviations from Archetype 1 (ABCD² has no misuse-scope gate
 * warranting a top-of-main callout; clinical caveats live in the footer).
 *
 * Medical source: Johnston SC et al. Lancet 2007;369(9558):283–292.
 * Prose preservation: interpretation headline + three per-tier action directives
 * are passthrough from src/data/abcd2ScoreData.ts. Footer safety disclaimer
 * preserved byte-for-byte from pre-rebuild component.
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
import { Chevron } from '../components/calculators/Chevron';
import { BackArrow } from '../components/calculators/BackArrow';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import {
  ABCD2_CITATION,
  ABCD2_AGE_OPTIONS,
  ABCD2_BP_OPTIONS,
  ABCD2_CLINICAL_OPTIONS,
  ABCD2_DURATION_OPTIONS,
  calculateABCD2,
  type ABCD2Inputs,
  type ABCD2CalculatorResult,
  type ABCD2Severity,
} from '../data/abcd2ScoreData';

// ─── Constants ────────────────────────────────────────────────────────────────

type ABCD2State = Partial<ABCD2Inputs>;

const DEFAULT_INPUTS: ABCD2State = {};

/** Severity → drawer visual tokens — CALCULATOR_SPEC.md §6 table */
const SEVERITY_TOKENS: Record<ABCD2Severity, {
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

/** Diabetes options — inline since ABCD²'s boolean field is best rendered as a radiogroup */
const DIABETES_OPTIONS = [
  { value: false, label: 'No diabetes', points: 0 },
  { value: true,  label: 'Diabetes',    points: 1 },
];

// ─── Main component ───────────────────────────────────────────────────────────

const Abcd2ScoreCalculator: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [inputs, setInputs]           = useState<ABCD2State>(DEFAULT_INPUTS);
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);
  const [toastMessage, setToastMessage]   = useState<string | null>(null);

  const wasCompleteRef = useRef<boolean>(false);
  const ageGroupRef      = useRef<HTMLDivElement>(null);
  const bpGroupRef       = useRef<HTMLDivElement>(null);
  const clinicalGroupRef = useRef<HTMLDivElement>(null);
  const durationGroupRef = useRef<HTMLDivElement>(null);
  const diabetesGroupRef = useRef<HTMLDivElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleBack }                 = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView }                 = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('abcd2_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'abcd2',
      title: 'ABCD² Score',
      subtitle: 'TIA stroke risk',
      category: 'risk',
      trail: '0–7',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedCount =
    (inputs.age              !== undefined ? 1 : 0) +
    (inputs.bloodPressure    !== undefined ? 1 : 0) +
    (inputs.clinicalFeatures !== undefined ? 1 : 0) +
    (inputs.duration         !== undefined ? 1 : 0) +
    (inputs.diabetes         !== undefined ? 1 : 0);
  const isComplete = selectedCount === 5;
  const result: ABCD2CalculatorResult | null = isComplete
    ? calculateABCD2(inputs as ABCD2Inputs)
    : null;

  /** Drawer state machine — §5. A = empty, B = partial, C = complete. */
  const drawerState: 'A' | 'B' | 'C' =
    selectedCount === 0 ? 'A' :
    !isComplete         ? 'B' : 'C';

  const isFav = isFavorite('abcd2');

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
  const setAge       = useCallback((v: ABCD2Inputs['age'])              => setInputs(p => ({ ...p, age: v })), []);
  const setBP        = useCallback((v: ABCD2Inputs['bloodPressure'])    => setInputs(p => ({ ...p, bloodPressure: v })), []);
  const setClinical  = useCallback((v: ABCD2Inputs['clinicalFeatures']) => setInputs(p => ({ ...p, clinicalFeatures: v })), []);
  const setDuration  = useCallback((v: ABCD2Inputs['duration'])         => setInputs(p => ({ ...p, duration: v })), []);
  const setDiabetes  = useCallback((v: boolean)                         => setInputs(p => ({ ...p, diabetes: v })), []);

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
          `ABCD² Score: ${result.score} / 7`,
          `${result.label} · 2-day stroke risk: ${result.twoDayRiskPercent}%`,
          `Age: ${inputs.age === '60plus' ? '≥60' : '<60'}`,
          `BP: ${inputs.bloodPressure === 'elevated' ? '≥140/90' : '<140/90'}`,
          `Clinical: ${inputs.clinicalFeatures === 'weakness' ? 'Unilateral weakness' : inputs.clinicalFeatures === 'speech' ? 'Speech impairment' : 'Other'}`,
          `Duration: ${inputs.duration === '60plus' ? '≥60 min' : inputs.duration === '10to59' ? '10–59 min' : '<10 min'}`,
          `Diabetes: ${inputs.diabetes ? 'Yes' : 'No'}`,
        ]
      : ['ABCD² Score: Incomplete — select all fields.'];

    if (isComplete && result) trackResult(result.score);
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
    const isNowFav = toggleFavorite('abcd2');
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
      id="abcd2-drawer-content"
      role="region"
      aria-label="ABCD² Score Interpretation"
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

        {/* 3. Citation + disclaimer — §1.2 (no seeAlso for ABCD² — empty array) */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>
              {ABCD2_CITATION.authors}.{' '}
              {ABCD2_CITATION.title}.{' '}
              {ABCD2_CITATION.journal}.{' '}
              {ABCD2_CITATION.year};{ABCD2_CITATION.volume}({ABCD2_CITATION.issue}):{ABCD2_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${ABCD2_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{ABCD2_CITATION.doi}
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. All TIA patients need urgent evaluation. ABCD² does not include imaging; consider ABCD²-I if DWI available. Do not use to delay workup.
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
        {/* Content renders ABOVE the button so the handle stays at viewport bottom (§1.3) */}
        {isExpanded && <DrawerContent />}
        <button
          type="button"
          onClick={() => setDrawerOpen(open => !open)}
          aria-expanded={isExpanded}
          aria-controls="abcd2-drawer-content"
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
      <h1 className="sr-only">ABCD² Score Calculator — TIA Stroke Risk</h1>

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
                  ABCD² Score
                </div>

                <div
                  className="flex items-baseline gap-1.5 mt-0.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={
                    isComplete
                      ? `ABCD² Score ${result!.score} of 7. ${result!.label}, 2-day stroke risk ${result!.twoDayRiskPercent} percent.`
                      : 'ABCD² Score — not yet calculated'
                  }
                >
                  <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
                    {isComplete ? result!.score : '—'}
                  </span>
                  <span className="text-slate-400 text-sm leading-none">/ 7</span>

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

          {/* 1. Age — A */}
          <section aria-labelledby="abcd2-age-label">
            <h2
              id="abcd2-age-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Age
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="abcd2-age-label"
              ref={ageGroupRef}
              className="divide-y divide-slate-200"
            >
              {ABCD2_AGE_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.age === opt.value;
                const tabIdx = inputs.age !== undefined ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setAge(opt.value)}
                    onKeyDown={makeKeyHandler(
                      ageGroupRef, ABCD2_AGE_OPTIONS.length, idx,
                      (i) => setAge(ABCD2_AGE_OPTIONS[i].value),
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

          {/* 2. Blood pressure — B */}
          <section aria-labelledby="abcd2-bp-label">
            <h2
              id="abcd2-bp-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Blood Pressure at Presentation
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="abcd2-bp-label"
              ref={bpGroupRef}
              className="divide-y divide-slate-200"
            >
              {ABCD2_BP_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.bloodPressure === opt.value;
                const tabIdx = inputs.bloodPressure !== undefined ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setBP(opt.value)}
                    onKeyDown={makeKeyHandler(
                      bpGroupRef, ABCD2_BP_OPTIONS.length, idx,
                      (i) => setBP(ABCD2_BP_OPTIONS[i].value),
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

          {/* 3. Clinical features — C */}
          <section aria-labelledby="abcd2-clinical-label">
            <h2
              id="abcd2-clinical-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Clinical Features
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="abcd2-clinical-label"
              ref={clinicalGroupRef}
              className="divide-y divide-slate-200"
            >
              {ABCD2_CLINICAL_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.clinicalFeatures === opt.value;
                const tabIdx = inputs.clinicalFeatures !== undefined ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setClinical(opt.value)}
                    onKeyDown={makeKeyHandler(
                      clinicalGroupRef, ABCD2_CLINICAL_OPTIONS.length, idx,
                      (i) => setClinical(ABCD2_CLINICAL_OPTIONS[i].value),
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

          {/* 4. Duration — D */}
          <section aria-labelledby="abcd2-duration-label">
            <h2
              id="abcd2-duration-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Duration of Symptoms
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="abcd2-duration-label"
              ref={durationGroupRef}
              className="divide-y divide-slate-200"
            >
              {ABCD2_DURATION_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.duration === opt.value;
                const tabIdx = inputs.duration !== undefined ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setDuration(opt.value)}
                    onKeyDown={makeKeyHandler(
                      durationGroupRef, ABCD2_DURATION_OPTIONS.length, idx,
                      (i) => setDuration(ABCD2_DURATION_OPTIONS[i].value),
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

          {/* 5. Diabetes — D (second D) */}
          <section aria-labelledby="abcd2-diabetes-label">
            <h2
              id="abcd2-diabetes-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Diabetes
            </h2>
            <div
              role="radiogroup"
              aria-labelledby="abcd2-diabetes-label"
              ref={diabetesGroupRef}
              className="divide-y divide-slate-200"
            >
              {DIABETES_OPTIONS.map((opt, idx) => {
                const isSelected = inputs.diabetes === opt.value;
                const tabIdx = inputs.diabetes !== undefined ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => setDiabetes(opt.value)}
                    onKeyDown={makeKeyHandler(
                      diabetesGroupRef, DIABETES_OPTIONS.length, idx,
                      (i) => setDiabetes(DIABETES_OPTIONS[i].value),
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

        {/* Page footer — §1.2. Safety disclaimer preserved byte-for-byte from pre-rebuild component. */}
        <footer className="mt-14 pt-6 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>
              {ABCD2_CITATION.authors}.{' '}
              {ABCD2_CITATION.title}.{' '}
              {ABCD2_CITATION.journal}.{' '}
              {ABCD2_CITATION.year};{ABCD2_CITATION.volume}({ABCD2_CITATION.issue}):{ABCD2_CITATION.pages}.
            </cite>{' '}
            <a
              href={`https://doi.org/${ABCD2_CITATION.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline ml-0.5"
            >
              doi:{ABCD2_CITATION.doi}
            </a>
          </p>
          <p className="mt-3 text-xs text-slate-400 leading-relaxed">
            Educational use only. All TIA patients need urgent evaluation. ABCD² does not include imaging; consider ABCD²-I if DWI available. Do not use to delay workup.
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

export default Abcd2ScoreCalculator;
