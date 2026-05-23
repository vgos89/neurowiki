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
import { Link } from 'react-router-dom';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorFooter } from '../components/calculators/CalculatorFooter';
import { CalculatorTrialEvidence } from '../components/calculators/CalculatorTrialEvidence';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { CalculatorToast } from '../components/calculators/CalculatorToast';
import { useDrawerState } from '../hooks/useDrawerState';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { useCaseReload } from '../hooks/useCaseReload';
import { copyToClipboard } from '../utils/clipboard';
import type { SeverityTokens } from '../lib/calculators/severityTokens';
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
const SEVERITY_TOKENS: Record<ICHSeverity, SeverityTokens> = {
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

// ─── Main component ───────────────────────────────────────────────────────────

const IchScoreCalculator: React.FC = () => {
  // ── State ──────────────────────────────────────────────────────────────────
  const [inputs, setInputs]               = useState<ICHScoreInputs>(DEFAULT_INPUTS);
  const [justCompleted, setJustCompleted] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  // Refs — not state: mutations must not trigger re-renders
  const wasCompleteRef = useRef<boolean>(false);
  const gcsGroupRef    = useRef<HTMLDivElement>(null);
  const volGroupRef    = useRef<HTMLDivElement>(null);
  const ivhGroupRef    = useRef<HTMLDivElement>(null);
  const origGroupRef   = useRef<HTMLDivElement>(null);
  const ageGroupRef    = useRef<HTMLDivElement>(null);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('ich_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'ich',
      title: 'ICH Score',
      subtitle: '30-day mortality for ICH',
      category: 'severity',
      trail: '0–6',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived values ─────────────────────────────────────────────────────────
  const selectedCount = (Object.values(inputs) as (unknown)[]).filter(v => v !== null).length;
  const isComplete = selectedCount === 5;
  const result: ICHCalculatorResult | null = isComplete ? calculateICHScore(inputs) : null;

  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer, toast, showToast } =
    useDrawerState({ mode: 'partial-complete', selectedCount, totalRequired: 5 });

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

  // Fix 3: Publish drawer floor height so FeedbackButton lifts above the drawer.
  // 52px ≈ py-3.5 (14px × 2) + content row (~24px).
  useEffect(() => {
    document.documentElement.style.setProperty('--drawer-floor-height', '52px');
    return () => {
      document.documentElement.style.setProperty('--drawer-floor-height', '0px');
    };
  }, []);

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
  const buildEmrText = useCallback(() => {
    if (!isComplete || !result) {
      return 'ICH Score: Incomplete — select all five components.';
    }
    // Build components list — only items that contributed points
    const components: string[] = [];
    if (inputs.gcsPoints !== null && inputs.gcsPoints > 0) {
      components.push(`GCS ${ICH_GCS_OPTIONS[inputs.gcsPoints].label}`);
    }
    if (inputs.volume30OrMore === true)  components.push('ICH volume ≥30 mL');
    if (inputs.ivh === true)             components.push('IVH present');
    if (inputs.infratentorial === true)  components.push('infratentorial origin');
    if (inputs.age80OrOlder === true)    components.push('age ≥80');

    const componentStr = components.length > 0 ? components.join(', ') : 'none';
    return [
      `ICH Score — ${result.score}/6 (30-day mortality ${result.mortality}%)`,
      `Components: ${componentStr}.`,
    ].join('\n');
  }, [inputs, isComplete, result]);

  const handleCopy = useCallback(() => {
    if (isComplete) trackResult(result!.score);
    copyToClipboard(buildEmrText(), () => {
      showToast('Copied to clipboard');
    });
  }, [buildEmrText, isComplete, result, trackResult, showToast]);

  // Reload from saved case (?caseId query param) — restores `inputs` from
  // the case's payload and wires update-in-place via currentCaseId.
  useCaseReload({
    payloadKey: 'ich-score',
    restore: (payload) => {
      if (payload.inputs) setInputs(payload.inputs as ICHScoreInputs);
    },
    onCaseLoaded: setCurrentCaseId,
    onSuccess: (initials) => showToast(`Opened ${initials} from My Cases`, 2500),
  });

  const handleReset = useCallback(() => {
    setInputs(DEFAULT_INPUTS);
    setCurrentCaseId(null);
    resetDrawer();
    // wasCompleteRef resets via isComplete effect — discovery animation re-arms on next completion
    resetTracking();
    showToast('Reset', 1500);
  }, [resetTracking, resetDrawer, showToast]);

  const handleFavToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('ich');
    showToast(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
  }, [toggleFavorite, showToast]);

  // ── Drawer helpers ─────────────────────────────────────────────────────────
  const tokens = result ? SEVERITY_TOKENS[result.severity] : null;

  /** Expanded drawer content panel */
  const DrawerContent: React.FC = () => (
    <div
      id="ich-drawer-content"
      role="region"
      aria-label="Interpretation"
      className="max-h-[60dvh] overflow-y-auto"
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


  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* sr-only h1 — exactly one per page, §7.4 */}
      <h1 className="sr-only">ICH Score Calculator — Intracerebral Hemorrhage Mortality</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <CalculatorHeader
        name="ICH Score"
        scoreDisplay={
          <>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
              {isComplete ? result!.score : '—'}
            </span>
            <span className="text-slate-400 text-sm leading-none">/ 6</span>
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
          </>
        }
        scoreAriaLabel={
          isComplete
            ? `ICH Score ${result!.score} of 6. ${result!.mortality}% 30-day mortality.`
            : 'ICH Score — not yet calculated'
        }
        onBack={handleBack}
        onReset={handleReset}
        onCopy={handleCopy}
        shareText={buildEmrText}
        shareTitle="ICH Score"
        onShareResult={(r) => {
          if (r === 'shared') showToast('Sent');
          else if (r === 'copied') showToast('Copied to clipboard');
        }}
        onFavToggle={handleFavToggle}
        isFav={isFav}
        saveCase={{
          source: { type: 'calculator', id: 'ich-score', title: 'ICH Score' },
          existingCaseId: currentCaseId ?? undefined,
          onSaved: (id) => {
            setCurrentCaseId(id);
            showToast(currentCaseId ? 'Case updated' : 'Case saved', 2000);
          },
          buildData: () => ({
            payload: {
              'ich-score': {
                headline: result ? `ICH Score: ${result.score}` : 'ICH Score: incomplete',
                subline: result ? `${result.mortality}% 30-day mortality` : undefined,
                score: result?.score,
                inputs,
                mortality: result?.mortality,
                severity: result?.severity,
              },
            },
          }),
        }}
      />

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

        {/* Trials informing thresholds — STRONG-confidence per
            calculatorTrialMap (V approval 2026-05-21). */}
        <CalculatorTrialEvidence calculatorId="ich-score" />

        {/* Page footer — §1.2 */}
        <CalculatorFooter
          citation={
            <>
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
            </>
          }
          disclaimer="Educational use only."
        />

        {/* Drawer spacer — prevents content hiding behind drawer §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />

      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav §1.3 ───────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="ich-drawer-content"
        stateAText={{ label: '0 of 5 selected', hint: 'Appears when complete' }}
        stateBText={{ label: `${selectedCount} of 5 selected`, hint: `${5 - selectedCount} more to complete` }}
        collapsedStat={result ? `${result.label} · ${result.stat}` : ''}
        justCompleted={justCompleted}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
};

export default IchScoreCalculator;
