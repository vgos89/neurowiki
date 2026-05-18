/**
 * HAS-BLED Score Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 3 (Mixed Input): checkboxes (A3 row pattern) + radio rows (A1 pattern).
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.2–2.3 Option row anatomy (radio rows) · §4.1–4.3 Checkbox row anatomy · §5 Drawer state machine
 *
 * Architect conditions (arch-l55c-aspects-boston-rebuild.md, inherited):
 *   - Drawer infrastructure from L5.5b stays byte-identical
 *   - Light-only theme — no dark-mode handling in layout
 *   - Bespoke-per-file pattern under L5.6 cap
 *   - No new clinical claim surfaces introduced
 *
 * Clinical prose preservation: calculateHASBLEDScore() result strings are byte-for-byte from data module.
 * riskColors const removed — replaced by inline severity text per spec §1.1.
 *
 * Medical source: Pisters R, et al. Chest. 2010;138(5):1093-1100.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorFooter } from '../components/calculators/CalculatorFooter';
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
  HASBLED_CITATION,
  HASBLED_RISK_LABELS,
  calculateHASBLEDScore,
  type HASBLEDInputs,
  type HASBLEDRisk,
} from '../data/hasBledScoreData';

// ── Constants ─────────────────────────────────────────────────────────────────

const defaultInputs: HASBLEDInputs = {
  hypertension: false,
  abnormalRenal: false,
  abnormalLiver: false,
  strokeHistory: false,
  priorBleeding: false,
  onWarfarin: false,
  labileINR: false,
  elderly: false,
  drugs: false,
  alcohol: false,
};

const CHECKBOX_ITEMS: { key: keyof HASBLEDInputs; label: string; sublabel?: string }[] = [
  { key: 'hypertension', label: 'Hypertension (SBP >160 mmHg)' },
  { key: 'abnormalRenal', label: 'Abnormal renal function', sublabel: 'Dialysis, transplant, or Cr >2.26 mg/dL' },
  { key: 'abnormalLiver', label: 'Abnormal liver function', sublabel: 'Cirrhosis or bilirubin >2× or AST/ALT/AP >3×' },
  { key: 'strokeHistory', label: 'Stroke history' },
  { key: 'priorBleeding', label: 'Prior major bleeding or predisposition' },
  { key: 'elderly', label: 'Elderly (>65 years)' },
  { key: 'drugs', label: 'Drugs (antiplatelet or NSAIDs)' },
  { key: 'alcohol', label: 'Alcohol (≥8 drinks/week)' },
];

// ── Severity tokens — CALCULATOR_SPEC.md §6 ──────────────────────────────────

const HASBLED_SEVERITY_TOKENS: Record<HASBLEDRisk, SeverityTokens> = {
  low: {
    borderColor: '#a7f3d0',
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
  high: {
    borderColor: '#fca5a5',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
  very_high: {
    borderColor: '#f87171',
    headerBg: 'bg-red-100',
    headerHover: 'hover:bg-red-200',
    labelClass: 'text-[10px] font-bold text-red-800 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-800',
    chevronClass: 'text-red-700',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function HasBledScoreCalculator() {
  const [inputs, setInputs] = useState<HASBLEDInputs>(defaultInputs);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('has_bled_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'has-bled',
      title: 'HAS-BLED',
      subtitle: 'Bleeding risk on anticoagulation',
      category: 'risk',
      trail: '0–9',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = calculateHASBLEDScore(inputs);

  // ── Drawer derived values ──────────────────────────────────────────────────
  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer, toast, showToast } =
    useDrawerState({ mode: 'binary', hasInteracted });
  const tokens = HASBLED_SEVERITY_TOKENS[result.risk];

  const isFav = isFavorite('has-bled');

  // ── Setters ────────────────────────────────────────────────────────────────
  const setCheck = useCallback((key: keyof HASBLEDInputs, value: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, [key]: value }));
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const buildEmrText = () => {
    const positiveFactors: string[] = [];
    if (inputs.hypertension) positiveFactors.push('HTN');
    if (inputs.abnormalRenal) positiveFactors.push('abnormal renal');
    if (inputs.abnormalLiver) positiveFactors.push('abnormal liver');
    if (inputs.strokeHistory) positiveFactors.push('prior stroke');
    if (inputs.priorBleeding) positiveFactors.push('prior bleeding');
    if (inputs.onWarfarin && inputs.labileINR) positiveFactors.push('labile INR on warfarin');
    if (inputs.elderly) positiveFactors.push('age >65');
    if (inputs.drugs) positiveFactors.push('antiplatelet/NSAID use');
    if (inputs.alcohol) positiveFactors.push('alcohol ≥8/wk');
    const factorsLine = positiveFactors.length > 0 ? positiveFactors.join(', ') : 'none';
    return [
      `HAS-BLED — ${result.score}/9 (major bleed ${result.bleedsPer100PatientYears}/100 patient-years)`,
      `Risk factors: ${factorsLine}.`,
    ].join('\n');
  };

  const handleCopy = () => {
    trackResult(result.score);
    copyToClipboard(buildEmrText(), () => {
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
    const now = toggleFavorite('has-bled');
    showToast(now ? 'Saved to favorites' : 'Removed from favorites');
  };

  // ── Drawer sub-components ──────────────────────────────────────────────────
  // DO NOT TOUCH — drawer code from L5.5b is correct.

  const DrawerContent = () => (
    <div
      id="hasbled-drawer-content"
      role="region"
      aria-label="HAS-BLED Interpretation"
      className="max-h-[60vh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        {/* Interpretation */}
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          {HASBLED_RISK_LABELS[result.risk]}
        </p>
        <p className="text-slate-600 leading-relaxed mt-2">
          <strong>{result.bleedsPer100PatientYears}</strong> major bleeds per 100 patient-years.{' '}
          {result.risk === 'low' && 'Low bleeding risk. Continue to address modifiable factors.'}
          {result.risk === 'moderate' && 'Moderate risk. Address modifiable factors and monitor.'}
          {(result.risk === 'high' || result.risk === 'very_high') && 'High risk. Fix modifiable risks (BP, alcohol, NSAIDs, INR control); do not withhold anticoagulation for stroke prevention alone.'}
        </p>

        {/* Important callout */}
        <div className="mt-4 pl-3 border-l-2 border-amber-400">
          <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Important</div>
          <p className="text-sm text-slate-700 leading-relaxed">
            HAS-BLED estimates bleeding risk; it does <strong>not</strong> mean &quot;do not anticoagulate.&quot;
            Address modifiable risks (BP, alcohol, NSAIDs, labile INR) and use for monitoring—not to withhold anticoagulation.
            Stroke risk (CHA₂DS₂-VASc) and shared decision-making drive anticoagulation.
          </p>
        </div>

        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{HASBLED_CITATION.authors}. {HASBLED_CITATION.title}. {HASBLED_CITATION.journal}. {HASBLED_CITATION.year};{HASBLED_CITATION.volume}({HASBLED_CITATION.issue}):{HASBLED_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${HASBLED_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
          <p className="mt-2 text-xs text-slate-400 leading-relaxed">
            Educational use only. High HAS-BLED does not contraindicate anticoagulation.
          </p>
        </div>
      </div>
    </div>
  );


  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">HAS-BLED Score Calculator</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <CalculatorHeader
        name="HAS-BLED Score"
        scoreDisplay={
          <>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
              {hasInteracted ? result.score : '—'}
            </span>
            <span className="text-slate-400 text-sm leading-none">/ 9</span>
            {hasInteracted && (
              <span className={`text-xs font-medium ml-1.5 ${
                result.risk === 'low' ? 'text-emerald-700' :
                result.risk === 'moderate' ? 'text-amber-700' :
                'text-red-600'
              }`}>
                {HASBLED_RISK_LABELS[result.risk]}
              </span>
            )}
          </>
        }
        scoreAriaLabel={
          hasInteracted
            ? `HAS-BLED Score ${result.score} of 9. ${HASBLED_RISK_LABELS[result.risk]}.`
            : 'HAS-BLED Score — not yet calculated'
        }
        onBack={handleBack}
        onReset={handleReset}
        onCopy={handleCopy}
        shareText={buildEmrText}
        shareTitle="HAS-BLED Score"
        onShareResult={(r) => {
          if (r === 'shared') showToast('Sent');
          else if (r === 'copied') showToast('Copied to clipboard');
        }}
        onFavToggle={handleFavToggle}
        isFav={isFav}
      />

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        <div className="space-y-10">

          {/* Risk factors — 8 checkboxes as A3 row pattern (§4.1–4.3) */}
          <section aria-labelledby="hasbled-risk-factors-label">
            <h2
              id="hasbled-risk-factors-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Risk factors
            </h2>
            <div>
              {CHECKBOX_ITEMS.map(({ key, label, sublabel }, idx) => {
                const isChecked = !!inputs[key];
                return (
                  <React.Fragment key={key}>
                    {idx > 0 && <div className="divider-hair" />}
                    <label
                      className={`flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors ${isChecked ? 'bg-neuro-50' : ''}`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => setCheck(key, e.target.checked)}
                        className="mt-0.5 w-5 h-5 rounded border-slate-300 accent-neuro-500"
                        aria-describedby={sublabel ? `hasbled-desc-${key}` : undefined}
                      />
                      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          <span className={isChecked ? 'block font-semibold text-neuro-700' : 'block font-medium text-slate-900'}>
                            {label}
                          </span>
                          {sublabel && (
                            <span
                              id={`hasbled-desc-${key}`}
                              className="block text-xs text-slate-500 mt-0.5"
                            >
                              {sublabel}
                            </span>
                          )}
                        </div>
                        <span className={isChecked ? 'text-sm opacity-75 flex-shrink-0' : 'text-sm text-slate-400 flex-shrink-0'}>
                          1 pt
                        </span>
                      </div>
                    </label>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Warfarin / Labile INR — A1 radio rows (§2.2–2.3) */}
          <section aria-labelledby="hasbled-warfarin-label">
            <h2
              id="hasbled-warfarin-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Warfarin / labile INR
            </h2>
            <p className="text-xs text-slate-500 mb-3">
              Add 1 point only when the patient is on warfarin and has labile INR (e.g. TTR &lt;60%). Not applicable for DOAC-only.
            </p>
            <div role="radiogroup" aria-labelledby="hasbled-warfarin-label">
              {[
                { label: 'Not on warfarin', points: 0, onWarfarin: false, labileINR: false, isSelected: !inputs.onWarfarin },
                { label: 'On warfarin, stable INR', points: 0, onWarfarin: true, labileINR: false, isSelected: inputs.onWarfarin && !inputs.labileINR },
                { label: 'On warfarin, labile INR', points: 1, onWarfarin: true, labileINR: true, isSelected: inputs.onWarfarin && inputs.labileINR },
              ].map((opt, idx) => (
                <React.Fragment key={opt.label}>
                  {idx > 0 && <div className="divider-hair" />}
                  <button
                    type="button"
                    role="radio"
                    aria-checked={opt.isSelected}
                    onClick={() => {
                      setHasInteracted(true);
                      setInputs((p) => ({ ...p, onWarfarin: opt.onWarfarin, labileINR: opt.labileINR }));
                    }}
                    className={opt.isSelected
                      ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                      : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                    }
                  >
                    <span className={opt.isSelected ? 'font-semibold' : 'font-medium text-slate-900'}>{opt.label}</span>
                    <span className={opt.isSelected ? 'text-sm opacity-75' : 'text-sm text-slate-400'}>{opt.points} pt</span>
                  </button>
                </React.Fragment>
              ))}
            </div>
          </section>

        </div>{/* end space-y-10 */}

        {/* Page footer — §1.2 */}
        <CalculatorFooter
          citation={
            <>
              <cite>{HASBLED_CITATION.authors}. {HASBLED_CITATION.title}. {HASBLED_CITATION.journal}. {HASBLED_CITATION.year};{HASBLED_CITATION.volume}({HASBLED_CITATION.issue}):{HASBLED_CITATION.pages}.</cite>{' '}
              <a href={`https://doi.org/${HASBLED_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline ml-0.5">DOI</a>
            </>
          }
          disclaimer="Educational use only. High HAS-BLED does not contraindicate anticoagulation. Use to address modifiable risks and guide monitoring."
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
        ariaContentId="hasbled-drawer-content"
        stateAText={{ label: '0 of 9 selected', hint: 'Appears when complete' }}
        collapsedStat={`${HASBLED_RISK_LABELS[result.risk]} · ${result.bleedsPer100PatientYears} bleeds/100 pt-yr`}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
}
