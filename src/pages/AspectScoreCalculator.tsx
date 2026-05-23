/**
 * ASPECTS Score Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 2 visual treatment (A2 option-row anatomy, hairline dividers, selected-option class)
 * with role="checkbox" retained — each region is an independent binary toggle per arch review.
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.2–2.3 Option row anatomy (shared with A2) · §3.2 Item labels · §5 Drawer state machine
 *
 * Architect conditions (arch-l55c-aspects-boston-rebuild.md):
 *   - Keep role="checkbox" — ASPECTS regions are independent binary toggles, not radio-single-select
 *   - Section headers: text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3
 *   - Bespoke-per-file is the accepted L5.5 pattern; extraction deferred to L5.6
 *   - No new clinical claim surfaces introduced
 *
 * Clinical prose preservation: getScoreInfo() return strings are byte-for-byte identical.
 * Drawer code from L5.5b is untouched.
 *
 * Medical source: Barber PA, et al. Lancet. 2000;355(9216):1670–1674.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorFooter } from '../components/calculators/CalculatorFooter';
import { CalculatorTrialEvidence } from '../components/calculators/CalculatorTrialEvidence';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { CalculatorToast } from '../components/calculators/CalculatorToast';
import { useDrawerState } from '../hooks/useDrawerState';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useFavorites } from '../hooks/useFavorites';
import { useCaseReload } from '../hooks/useCaseReload';
import { useRecents } from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { copyToClipboard } from '../utils/clipboard';
import type { SeverityTokens } from '../lib/calculators/severityTokens';

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
// 3–5 and 0–2 strings updated 2026-05-22 to align with AHA/ASA 2026 §4.7.2.
// Both strata now carry all four mirror qualifiers (age <80, NIHSS ≥6,
// prestroke mRS 0–1, no significant mass effect) and the correct COR/LOE.
// See docs/audits/aha-2026-audit-2026-05-22.md §4.2 + clinical review
// docs/reviews/clinical-PR-aspects-cor-2a-correction-2026-05-22.md.

interface ScoreInfo {
  label: string;
  evtText: string;
  badgeBg: string;
  /** When present, the rendered evtText is tagged with this data-claim id. */
  claimId?: string;
}

function getScoreInfo(score: number): ScoreInfo {
  if (score >= 8) {
    return {
      label: 'Small or No Infarct',
      evtText: 'EVT strongly indicated — Class I recommendation (AHA/ASA 2026). Small or no established infarct core; excellent candidacy.',
      badgeBg: 'bg-emerald-500',
    };
  }
  if (score >= 6) {
    return {
      label: 'Moderate Core',
      evtText: 'EVT generally indicated — Class I recommendation (AHA/ASA 2026). ASPECTS ≥6 is the primary threshold for EVT eligibility across early and late windows.',
      badgeBg: 'bg-yellow-500',
    };
  }
  if (score >= 3) {
    return {
      label: 'Large Core',
      evtText:
        'EVT recommended (AHA/ASA 2026 §4.7.2, COR 1, LOE A) in selected patients with anterior-circulation proximal LVO (ICA/M1), presenting 6–24 hours from onset, age <80, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 3–5, and no significant mass effect. Supported by SELECT-2, ANGEL-ASPECT, TENSION, and LASTE.',
      badgeBg: 'bg-orange-500',
      claimId: 'aspects-evt-eligibility-2026',
    };
  }
  return {
    label: 'Extensive Infarct',
    evtText:
      'EVT can reasonably be considered (AHA/ASA 2026 §4.7.2, COR 2a, LOE B-R) in selected patients with anterior-circulation proximal LVO (ICA/M1) presenting within 6 hours, age <80, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 0–2, and no significant mass effect. Outside these criteria, EVT is not routinely indicated; ASPECTS 0–2 carries a high futile-reperfusion risk in unselected patients. Vascular Neurology / Neurointerventional consultation recommended.',
    badgeBg: 'bg-red-500',
    claimId: 'aspects-evt-eligibility-2026',
  };
}

// ── Severity tokens — CALCULATOR_SPEC.md §6 ──────────────────────────────────

type AspectsSeverity = 'small' | 'moderate' | 'large' | 'extensive';

function getAspectsSeverity(score: number): AspectsSeverity {
  if (score >= 8) return 'small';
  if (score >= 6) return 'moderate';
  if (score >= 3) return 'large';
  return 'extensive';
}

const ASPECTS_SEVERITY_TOKENS: Record<AspectsSeverity, SeverityTokens> = {
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

// ── Component ─────────────────────────────────────────────────────────────────

const AspectScoreCalculator: React.FC = () => {
  const [involved, setInvolved] = useState<Set<RegionId>>(new Set());
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('aspects_score');

  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer, toast, showToast } =
    useDrawerState({ mode: 'binary', hasInteracted });

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
  const aspectsSeverity = getAspectsSeverity(score);
  const tokens = ASPECTS_SEVERITY_TOKENS[aspectsSeverity];

  const isFav = isFavorite('aspects');

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

  const buildEmrText = () => {
    let regionLine: string;
    if (involved.size === 0) {
      regionLine = 'No regions involved.';
    } else if (involved.size === 1) {
      regionLine = `Involved region: ${[...involved][0]}.`;
    } else {
      regionLine = `Involved regions (${involved.size}): ${[...involved].join(', ')}.`;
    }
    return [
      `ASPECTS — ${score}/10 (${scoreInfo.label})`,
      regionLine,
    ].join('\n');
  };

  const handleCopy = () => {
    trackResult(score);
    copyToClipboard(buildEmrText(), () => {
      showToast('Copied to clipboard');
    });
  };

  // ASPECTS stores state as a Set<RegionId> (not an `inputs` object like the
  // other 8 generic calcs), so the restore reads `involvedRegions: string[]`
  // from the payload and rebuilds the Set.
  useCaseReload({
    payloadKey: 'aspects-score',
    restore: (payload) => {
      const regions = payload.involvedRegions;
      if (Array.isArray(regions)) {
        setInvolved(new Set(regions as RegionId[]));
        setHasInteracted(true);
      }
    },
    onCaseLoaded: setCurrentCaseId,
    onSuccess: (initials) => showToast(`Opened ${initials} from My Cases`, 2500),
  });

  const handleReset = () => {
    setInvolved(new Set());
    setCurrentCaseId(null);
    setHasInteracted(false);
    resetDrawer();
    resetTracking();
    showToast('Reset', 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('aspects');
    showToast(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
  };

  // ── Drawer content ─────────────────────────────────────────────────────────
  // DrawerContent stays per-calculator — clinical interpretation prose is unique.

  const DrawerContent = () => (
    <div
      id="aspects-drawer-content"
      role="region"
      aria-label="ASPECTS Interpretation"
      className="max-h-[60dvh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          ASPECTS {score}/10 — {scoreInfo.label}
        </p>
        {/* Render variant: when the current scoreInfo carries a claimId, emit
            a literal data-claim="aspects-evt-eligibility-2026" attribute so the
            pre-commit claim scanner (jsx-surface regex matches literal strings
            only) picks it up. The ≥6 and ≥8 branches deliberately do not
            carry the claim — they fall under separate citation coverage. */}
        {scoreInfo.claimId === 'aspects-evt-eligibility-2026' ? (
          <p
            data-claim="aspects-evt-eligibility-2026"
            className="text-slate-600 leading-relaxed mt-3"
          >
            {scoreInfo.evtText}
          </p>
        ) : (
          <p className="text-slate-600 leading-relaxed mt-3">
            {scoreInfo.evtText}
          </p>
        )}
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


  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">ASPECTS Score Calculator — Alberta Stroke Program Early CT Score</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <CalculatorHeader
        name="ASPECTS Score"
        scoreDisplay={
          <>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
              {score}
            </span>
            <span className="text-slate-400 text-sm leading-none">/ 10</span>
            {involved.size > 0 && (
              <span className={`text-xs font-medium ml-1.5 ${
                score >= 8 ? 'text-emerald-700' :
                score >= 6 ? 'text-yellow-700' :
                score >= 3 ? 'text-orange-700' : 'text-red-600'
              }`}>
                {scoreInfo.label}
              </span>
            )}
          </>
        }
        scoreAriaLabel={`ASPECTS Score ${score} out of 10. ${scoreInfo.label}.`}
        onBack={handleBack}
        onReset={handleReset}
        onCopy={handleCopy}
        shareText={buildEmrText}
        shareTitle="ASPECTS"
        onShareResult={(r) => {
          if (r === 'shared') showToast('Sent');
          else if (r === 'copied') showToast('Copied to clipboard');
        }}
        onFavToggle={handleFavToggle}
        isFav={isFav}
        saveCase={{
          source: { type: 'calculator', id: 'aspects-score', title: 'ASPECTS Score' },
          existingCaseId: currentCaseId ?? undefined,
          onSaved: (id) => {
            setCurrentCaseId(id);
            showToast(currentCaseId ? 'Case updated' : 'Case saved', 2000);
          },
          buildData: () => ({
            payload: {
              'aspects-score': {
                headline: `ASPECTS: ${score}/10`,
                subline: scoreInfo.label,
                score,
                involvedRegions: Array.from(involved),
              },
            },
          }),
        }}
      />

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        <div className="space-y-10">

          {/* Cortical regions section — A2 visual treatment, role="checkbox" per arch review */}
          <section aria-labelledby="aspects-cortical-label">
            <h2
              id="aspects-cortical-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Cortical regions (M1–M6)
            </h2>
            <div role="group" aria-labelledby="aspects-cortical-label">
              {CORTICAL_REGIONS.map((region, idx) => {
                const isInvolved = involved.has(region.id);
                return (
                  <React.Fragment key={region.id}>
                    {idx > 0 && <div className="divider-hair" />}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isInvolved}
                      onClick={() => toggleRegion(region.id)}
                      className={isInvolved
                        ? 'selected-option w-full flex items-baseline justify-between py-3 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                      }
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className={isInvolved
                          ? 'text-xs font-bold uppercase tracking-wider opacity-75 flex-shrink-0 w-7'
                          : 'text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 w-7'
                        }>
                          {region.label}
                        </span>
                        <span className={isInvolved
                          ? 'font-semibold truncate'
                          : 'font-medium text-slate-900 truncate'
                        }>
                          {region.fullName}
                        </span>
                      </div>
                      <span className={isInvolved ? 'text-sm opacity-75' : 'text-sm text-slate-400'}>
                        −1
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Subcortical regions section */}
          <section aria-labelledby="aspects-subcortical-label">
            <h2
              id="aspects-subcortical-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Subcortical regions
            </h2>
            <div role="group" aria-labelledby="aspects-subcortical-label">
              {SUBCORTICAL_REGIONS.map((region, idx) => {
                const isInvolved = involved.has(region.id);
                return (
                  <React.Fragment key={region.id}>
                    {idx > 0 && <div className="divider-hair" />}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={isInvolved}
                      onClick={() => toggleRegion(region.id)}
                      className={isInvolved
                        ? 'selected-option w-full flex items-baseline justify-between py-3 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                      }
                    >
                      <div className="flex items-baseline gap-3 min-w-0">
                        <span className={isInvolved
                          ? 'text-xs font-bold uppercase tracking-wider opacity-75 flex-shrink-0 w-7'
                          : 'text-xs font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 w-7'
                        }>
                          {region.label}
                        </span>
                        <span className={isInvolved
                          ? 'font-semibold truncate'
                          : 'font-medium text-slate-900 truncate'
                        }>
                          {region.fullName}
                        </span>
                      </div>
                      <span className={isInvolved ? 'text-sm opacity-75' : 'text-sm text-slate-400'}>
                        −1
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* EVT Pathway CTA */}
          <div>
            <Link
              to="/pathways/evt"
              className="flex items-center justify-between w-full p-4 rounded-xl bg-neuro-50 border border-neuro-200 hover:bg-neuro-100 transition-colors group"
            >
              <div>
                <div className="text-sm font-semibold text-neuro-700">Assess full EVT eligibility</div>
                <div className="text-xs text-neuro-600 mt-0.5">EVT Eligibility Pathway — time window, NIHSS, occlusion type</div>
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-neuro-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0"
                aria-hidden="true"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </Link>
          </div>

        </div>{/* end space-y-10 */}

        {/* Trials informing thresholds — STRONG-confidence per
            calculatorTrialMap (V approval 2026-05-21). */}
        <CalculatorTrialEvidence calculatorId="aspects-score" />

        {/* Page footer — §1.2 */}
        <CalculatorFooter
          citation={
            <>
              <cite>
                Barber PA, et al. Validity and reliability of a quantitative computed tomography score in predicting outcome of hyperacute stroke before thrombolytic therapy.{' '}
                <em>Lancet.</em> 2000;355(9216):1670–1674.
              </cite>{' '}
              <a
                href="https://doi.org/10.1016/s0140-6736(00)02237-6"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neuro-600 hover:underline ml-0.5"
              >
                doi:10.1016/s0140-6736(00)02237-6
              </a>
              {' · Updated per 2026 AHA/ASA Stroke Guidelines (Prabhakaran et al. DOI: 10.1161/STR.0000000000000513).'}
            </>
          }
          disclaimer="Educational use only. This tool is for clinical decision support and education. It is not a substitute for professional medical judgment or formal radiology interpretation. Do not enter patient-identifying information. Verify independently when used in patient care."
        />

        {/* Drawer spacer — §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />

      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav §1.3 ───────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="aspects-drawer-content"
        stateAText={{ label: '0 of 10 regions marked', hint: 'Appears when complete' }}
        collapsedStat={`ASPECTS ${score}/10 · ${scoreInfo.label}`}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
};

export default AspectScoreCalculator;
