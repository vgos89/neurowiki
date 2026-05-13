import React, { useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Copy, Star, ChevronRight } from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';

// ── Region definitions ──────────────────────────────────────────────────────

const CORTICAL_REGIONS = [
  { id: 'M1', label: 'M1', fullName: 'Anterior MCA cortex', detail: 'Frontal operculum / anterior cortex' },
  { id: 'M2', label: 'M2', fullName: 'MCA cortex lateral to insular ribbon', detail: 'Anterior temporal / insular cortex' },
  { id: 'M3', label: 'M3', fullName: 'Posterior MCA cortex', detail: 'Posterior temporal cortex' },
  { id: 'M4', label: 'M4', fullName: 'Anterior MCA cortex (superior)', detail: 'Superior to M1; above sylvian fissure' },
  { id: 'M5', label: 'M5', fullName: 'Lateral MCA cortex (superior)', detail: 'Superior to M2; suprasylvian' },
  { id: 'M6', label: 'M6', fullName: 'Posterior MCA cortex (superior)', detail: 'Superior to M3; posterior suprasylvian' },
] as const;

const SUBCORTICAL_REGIONS = [
  { id: 'C',  label: 'C',  fullName: 'Caudate',           detail: 'Head of caudate nucleus' },
  { id: 'L',  label: 'L',  fullName: 'Lentiform nucleus', detail: 'Putamen + globus pallidus' },
  { id: 'IC', label: 'IC', fullName: 'Internal capsule',  detail: 'Posterior limb of internal capsule' },
  { id: 'I',  label: 'I',  fullName: 'Insular ribbon',    detail: 'Insular cortex / extreme capsule' },
] as const;

type RegionId = (typeof CORTICAL_REGIONS)[number]['id'] | (typeof SUBCORTICAL_REGIONS)[number]['id'];

// ── Score interpretation ─────────────────────────────────────────────────────

interface ScoreInfo {
  label: string;
  evtText: string;
  colorClass: string;
  borderClass: string;
  bgClass: string;
  textClass: string;
  badgeBg: string;
}

function getScoreInfo(score: number): ScoreInfo {
  if (score >= 8) {
    return {
      label: 'Small or No Infarct',
      evtText: 'EVT strongly indicated — Class I recommendation (AHA/ASA 2026). Small or no established infarct core; excellent candidacy.',
      colorClass: 'text-emerald-700 dark:text-emerald-400',
      borderClass: 'border-emerald-300 dark:border-emerald-700',
      bgClass: 'bg-emerald-50 dark:bg-emerald-900/20',
      textClass: 'text-emerald-800 dark:text-emerald-200',
      badgeBg: 'bg-emerald-500',
    };
  }
  if (score >= 6) {
    return {
      label: 'Moderate Core',
      evtText: 'EVT generally indicated — Class I recommendation (AHA/ASA 2026). ASPECTS ≥6 is the primary threshold for EVT eligibility across early and late windows.',
      colorClass: 'text-yellow-700 dark:text-yellow-400',
      borderClass: 'border-yellow-300 dark:border-yellow-700',
      bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
      textClass: 'text-yellow-800 dark:text-yellow-200',
      badgeBg: 'bg-yellow-500',
    };
  }
  if (score >= 3) {
    return {
      label: 'Large Core',
      evtText: 'EVT may benefit — Class I for ASPECTS 3–5 per SELECT-2 / ANGEL-ASPECT trials (AHA/ASA 2026 update). Age <80, no significant mass effect, mRS 0–1 required.',
      colorClass: 'text-orange-700 dark:text-orange-400',
      borderClass: 'border-orange-300 dark:border-orange-700',
      bgClass: 'bg-orange-50 dark:bg-orange-900/20',
      textClass: 'text-orange-800 dark:text-orange-200',
      badgeBg: 'bg-orange-500',
    };
  }
  return {
    label: 'Extensive Infarct',
    evtText: 'EVT typically not indicated — ASPECTS 0–2 indicates extensive established infarction. High futile reperfusion risk. Exceptional cases (age <80, no mass effect, Class IIa) require individualized Vascular Neurology / Neurointerventional consultation.',
    colorClass: 'text-red-700 dark:text-red-400',
    borderClass: 'border-red-300 dark:border-red-700',
    bgClass: 'bg-red-50 dark:bg-red-900/20',
    textClass: 'text-red-800 dark:text-red-200',
    badgeBg: 'bg-red-500',
  };
}

// ── Severity tokens ──────────────────────────────────────────────────────────

type AspectsSeverity = 'small' | 'moderate' | 'large' | 'extensive';

function getAspectsSeverity(score: number): AspectsSeverity {
  if (score >= 8) return 'small';
  if (score >= 6) return 'moderate';
  if (score >= 3) return 'large';
  return 'extensive';
}

const ASPECTS_SEVERITY_TOKENS: Record<AspectsSeverity, {
  borderColor: string;
  headerBg: string;
  headerHover: string;
  labelClass: string;
  statClass: string;
  chevronClass: string;
}> = {
  small: {
    borderColor: '#6ee7b7',
    headerBg: 'bg-emerald-50',
    headerHover: 'hover:bg-emerald-100',
    labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-emerald-700',
    chevronClass: 'text-emerald-600',
  },
  moderate: {
    borderColor: '#fde68a',
    headerBg: 'bg-yellow-50',
    headerHover: 'hover:bg-yellow-100',
    labelClass: 'text-[10px] font-bold text-yellow-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-yellow-700',
    chevronClass: 'text-yellow-600',
  },
  large: {
    borderColor: '#fdba74',
    headerBg: 'bg-orange-50',
    headerHover: 'hover:bg-orange-100',
    labelClass: 'text-[10px] font-bold text-orange-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-orange-700',
    chevronClass: 'text-orange-600',
  },
  extensive: {
    borderColor: '#fca5a5',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
};

// ── Chevron sub-component ────────────────────────────────────────────────────

const Chevron: React.FC<{ direction: 'up' | 'down'; className?: string }> = ({ direction, className = '' }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
    {direction === 'up' ? <polyline points="18 15 12 9 6 15" /> : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

// ── Component ────────────────────────────────────────────────────────────────

const AspectScoreCalculator: React.FC = () => {
  const [involved, setInvolved] = useState<Set<RegionId>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('aspects_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'aspects',
      title: 'ASPECTS',
      subtitle: 'Ischemic burden in MCA territory',
      category: 'severity',
      trail: '0–10',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const score = 10 - involved.size;
  const scoreInfo = getScoreInfo(score);

  // ── Drawer derived values ──────────────────────────────────────────────────
  const drawerState: 'A' | 'C' = hasInteracted ? 'C' : 'A';
  const aspectsSeverity = getAspectsSeverity(score);
  const tokens = ASPECTS_SEVERITY_TOKENS[aspectsSeverity];
  const isExpanded = drawerOpen;
  const drawerCollapsedShadow = '0 -2px 12px rgba(15,23,42,0.08)';
  const drawerExpandedShadow = '0 -4px 24px rgba(15,23,42,0.12)';

  const toggleRegion = useCallback((id: RegionId) => {
    setHasInteracted(true);
    setInvolved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCopy = () => {
    const involvedList = [...involved].join(', ') || 'None';
    const text = [
      `ASPECTS Score: ${score}/10`,
      `Interpretation: ${scoreInfo.label}`,
      `Involved regions (${involved.size}): ${involvedList}`,
      `EVT implication: ${scoreInfo.evtText}`,
    ].join('\n');
    trackResult(score);
    copyToClipboard(text, () => {
      setToastMessage('Copied to clipboard');
      setTimeout(() => setToastMessage(null), 2000);
    });
  };

  const handleReset = () => {
    setInvolved(new Set());
    setDrawerOpen(false);
    setHasInteracted(false);
    resetTracking();
    setToastMessage('Reset');
    setTimeout(() => setToastMessage(null), 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('aspects');
    setToastMessage(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
    setTimeout(() => setToastMessage(null), 2000);
  };

  const isFav = isFavorite('aspects');

  // ── Drawer sub-components ──────────────────────────────────────────────────

  const DrawerContent = () => (
    <div
      id="aspects-drawer-content"
      role="region"
      aria-label="ASPECTS Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          ASPECTS {score}/10 — {scoreInfo.label}
        </p>
        <p className="text-slate-600 leading-relaxed mt-3">
          {scoreInfo.evtText}
        </p>
        <div className="mt-5 pt-4 border-t border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">See also</div>
          <p className="text-sm text-slate-600">
            <Link to="/pathways/evt" className="text-neuro-600 hover:underline">EVT Eligibility Pathway</Link>
            <span className="text-slate-300 mx-2">·</span>
            <a href="https://doi.org/10.1016/s0140-6736(00)02237-6" target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">Barber et al. Lancet 2000</a>
          </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            Educational use only. Verify independently when used in patient care.
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
              <div className="text-sm text-slate-500">0 of 10 regions marked</div>
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
          aria-controls="aspects-drawer-content"
          className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
            isExpanded ? `${tokens.headerBg} ${tokens.headerHover}` : 'bg-white hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={isExpanded ? tokens.labelClass : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'}>
              Interpretation
            </div>
            <div className={isExpanded ? tokens.statClass : 'text-sm font-medium text-slate-900'}>
              ASPECTS {score}/10 · {scoreInfo.label}
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
      <h1 className="sr-only">ASPECTS Score Calculator — Alberta Stroke Program Early CT Score</h1>
      {/* ── Sticky Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-700"
        role="banner"
      >
        <div className="max-w-2xl mx-auto px-4 md:px-6 py-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={handleBack}
                className="p-2 -m-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0"
                aria-label="Back to calculators"
              >
                <ArrowLeft size={20} aria-hidden="true" />
              </button>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  ASPECTS Score
                </div>
                <div
                  className="flex items-baseline gap-1.5"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`ASPECTS Score ${score} out of 10. ${scoreInfo.label}.`}
                >
                  <span className={`text-2xl md:text-3xl font-bold tabular-nums ${scoreInfo.colorClass}`}>
                    {score}
                  </span>
                  <span className="text-slate-400 dark:text-slate-500 text-sm">/ 10</span>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    · {scoreInfo.label}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={handleFavToggle}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star
                  size={20}
                  className={isFav ? 'text-amber-500 fill-amber-500' : 'text-slate-400 dark:text-slate-500'}
                  aria-hidden="true"
                />
              </button>
              <button
                onClick={handleReset}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Reset calculator"
              >
                <RefreshCw size={18} className="text-slate-500 dark:text-slate-400" aria-hidden="true" />
              </button>
              <button
                onClick={handleCopy}
                className="bg-neuro-500 hover:bg-neuro-600 text-white px-3 md:px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              >
                <span className="hidden sm:inline">Copy</span>
                <Copy size={18} className="sm:hidden inline" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ──────────────────────────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-4 md:px-6 py-6 pb-4" id="aspects-calculator-main">
        <h1 className="sr-only">ASPECTS Score Calculator — Alberta Stroke Program Early CT Score</h1>

        {/* How to use */}
        <section className="mb-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Score 10 MCA territory regions on non-contrast CT. <strong className="text-slate-800 dark:text-slate-200">Mark each region with early ischemic change</strong> — each involved region subtracts 1 from baseline 10.
          </p>
        </section>

        {/* ── Region Grid ─── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">

          {/* Cortical — left */}
          <section aria-labelledby="aspects-cortical-label">
            <h2
              id="aspects-cortical-label"
              className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3"
            >
              Cortical Regions (M1–M6)
            </h2>
            <div className="space-y-2">
              {CORTICAL_REGIONS.map((region) => {
                const isInvolved = involved.has(region.id);
                return (
                  <button
                    key={region.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isInvolved}
                    onClick={() => toggleRegion(region.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all min-h-[52px] ${
                      isInvolved
                        ? 'border-red-400 bg-red-50 dark:bg-red-900/25 dark:border-red-600'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold flex-shrink-0 transition-colors ${
                          isInvolved
                            ? 'bg-red-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {region.label}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold leading-tight ${isInvolved ? 'text-red-800 dark:text-red-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          {region.fullName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{region.detail}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Subcortical — right */}
          <section aria-labelledby="aspects-subcortical-label">
            <h2
              id="aspects-subcortical-label"
              className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3"
            >
              Subcortical Regions
            </h2>
            <div className="space-y-2">
              {SUBCORTICAL_REGIONS.map((region) => {
                const isInvolved = involved.has(region.id);
                return (
                  <button
                    key={region.id}
                    type="button"
                    role="checkbox"
                    aria-checked={isInvolved}
                    onClick={() => toggleRegion(region.id)}
                    className={`w-full p-3 rounded-xl border-2 text-left transition-all min-h-[52px] ${
                      isInvolved
                        ? 'border-orange-400 bg-orange-50 dark:bg-orange-900/25 dark:border-orange-600'
                        : 'border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-sm font-bold flex-shrink-0 transition-colors ${
                          isInvolved
                            ? 'bg-orange-500 text-white'
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {region.label}
                      </span>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold leading-tight ${isInvolved ? 'text-orange-800 dark:text-orange-200' : 'text-slate-800 dark:text-slate-200'}`}>
                          {region.fullName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{region.detail}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Score summary inside subcortical column — visible on desktop */}
            <div className={`hidden sm:block mt-4 p-3 rounded-xl border-2 ${scoreInfo.borderClass} ${scoreInfo.bgClass}`}>
              <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Score</div>
              <div className={`text-4xl font-black tabular-nums ${scoreInfo.colorClass}`}>{score}<span className="text-lg font-normal text-slate-400">/10</span></div>
              <div className={`text-sm font-semibold mt-1 ${scoreInfo.textClass}`}>{scoreInfo.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{involved.size} region{involved.size !== 1 ? 's' : ''} involved</div>
            </div>
          </section>
        </div>

        {/* ── EVT Pathway CTA ── */}
        <div className="mt-4">
          <Link
            to="/pathways/evt"
            className="flex items-center justify-between w-full p-4 rounded-xl bg-neuro-50 dark:bg-neuro-900/20 border border-neuro-200 dark:border-neuro-800 hover:bg-neuro-100 dark:hover:bg-neuro-900/30 transition-colors group"
          >
            <div>
              <div className="text-sm font-semibold text-neuro-700 dark:text-neuro-300">Assess full EVT eligibility</div>
              <div className="text-xs text-neuro-600 dark:text-neuro-400 mt-0.5">EVT Eligibility Pathway — time window, NIHSS, occlusion type</div>
            </div>
            <ChevronRight size={18} className="text-neuro-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0" aria-hidden="true" />
          </Link>
        </div>

        {/* ── Citation ── */}
        <footer className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            <strong>Source:</strong>{' '}
            <cite>
              Barber PA, et al. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke before thrombolytic therapy.{' '}
              <em>Lancet.</em> 2000;355(9216):1670–1674.
            </cite>{' '}
            <a
              href="https://doi.org/10.1016/s0140-6736(00)02237-6"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neuro-600 hover:underline"
            >
              DOI
            </a>
            {' '}· Updated per 2026 AHA/ASA Stroke Guidelines (Prabhakaran et al. DOI: 10.1161/STR.0000000000000513).
          </p>
          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            <strong>Educational use only.</strong> This tool is for clinical decision support and education. It is not a substitute for professional medical judgment or formal radiology interpretation. Do not enter patient-identifying information. Verify independently when used in patient care.
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

export default AspectScoreCalculator;
