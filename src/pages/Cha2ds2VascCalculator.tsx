/**
 * CHA₂DS₂-VASc Score Calculator — rebuilt against CALCULATOR_SPEC.md v1.1
 * Archetype 3 (Mixed Input): radio rows (A1 pattern) + checkboxes (A3 row pattern).
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer anatomy (Portal)
 *   §2.2–2.3 Option row anatomy (A1 radio rows) · §4.1–4.3 Checkbox row anatomy · §5 Drawer state machine
 *
 * Shell components: CalculatorHeader · CalculatorDrawer · CalculatorToast · CalculatorFooter
 * Hook: useDrawerState (binary mode — any interaction triggers State C)
 *
 * Clinical prose preservation: RISK_LABELS, RISK_GUIDANCE, PRIMARY_CITATION, GUIDELINE_CITATION,
 * score legend table data are byte-for-byte identical to cha2ds2VascData module. No scoring change.
 *
 * Medical source: Lip GY, et al. Chest. 2010;137(2):263-272.
 * Guideline: Joglar JA et al. JACC 2024;83(1):109-279.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorFooter } from '../components/calculators/CalculatorFooter';
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
import {
  calculateCha2ds2Vasc,
  RISK_LABELS,
  RISK_GUIDANCE,
  PRIMARY_CITATION,
  GUIDELINE_CITATION,
  type Cha2ds2VascInputs,
  type Cha2ds2VascRisk,
} from '../data/cha2ds2VascData';

// ── Constants ─────────────────────────────────────────────────────────────────

const defaultInputs: Cha2ds2VascInputs = {
  chf: false,
  hypertension: false,
  age75plus: false,
  age65to74: false,
  diabetes: false,
  strokeTia: false,
  vascularDisease: false,
  female: false,
};

interface CheckItem {
  key: keyof Cha2ds2VascInputs;
  label: string;
  points: number;
  sublabel?: string;
}

const CHECKBOX_ITEMS: CheckItem[] = [
  {
    key: 'chf',
    label: 'Congestive heart failure / LV dysfunction',
    points: 1,
    sublabel: 'Moderate-severe systolic or diastolic dysfunction on echo, or HF requiring treatment',
  },
  {
    key: 'hypertension',
    label: 'Hypertension',
    points: 1,
    sublabel: 'Resting BP >140/90 mmHg on ≥2 occasions, or antihypertensive treatment',
  },
  {
    key: 'diabetes',
    label: 'Diabetes mellitus',
    points: 1,
    sublabel: 'Fasting glucose >125 mg/dL (7 mmol/L) or treatment with oral hypoglycaemic agent or insulin',
  },
  {
    key: 'strokeTia',
    label: 'Stroke / TIA / thromboembolism',
    points: 2,
    sublabel: '2 pts — prior stroke, TIA, or systemic thromboembolism',
  },
  {
    key: 'vascularDisease',
    label: 'Vascular disease',
    points: 1,
    sublabel: 'Prior MI, peripheral arterial disease, or aortic plaque',
  },
  {
    key: 'female',
    label: 'Female sex',
    points: 1,
    sublabel: 'Sex category — adds 1 pt; does not independently indicate anticoagulation',
  },
];

// ── Severity tokens — CALCULATOR_SPEC.md §6 ──────────────────────────────────

const CHADS_SEVERITY_TOKENS: Record<Cha2ds2VascRisk, SeverityTokens> = {
  very_low: {
    borderColor: '#a7f3d0',
    headerBg: 'bg-emerald-50',
    headerHover: 'hover:bg-emerald-100',
    labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-emerald-700',
    chevronClass: 'text-emerald-600',
  },
  low_moderate: {
    borderColor: '#fed7aa',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-600',
  },
  moderate_high: {
    borderColor: '#fdba74',
    headerBg: 'bg-orange-50',
    headerHover: 'hover:bg-orange-100',
    labelClass: 'text-[10px] font-bold text-orange-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-orange-700',
    chevronClass: 'text-orange-600',
  },
  high: {
    borderColor: '#fca5a5',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Cha2ds2VascCalculator() {
  const [inputs, setInputs] = useState<Cha2ds2VascInputs>(defaultInputs);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const { handleBack } = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('chads_vasc_score');

  useEffect(() => {
    recordView({
      type: 'calculator',
      id: 'chads-vasc',
      title: 'CHA₂DS₂-VASc',
      subtitle: 'AF stroke risk — anticoagulation threshold',
      category: 'risk',
      trail: '0–9',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const result = calculateCha2ds2Vasc(inputs);

  // ── Drawer derived values ──────────────────────────────────────────────────
  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer, toast, showToast } =
    useDrawerState({ mode: 'binary', hasInteracted });
  const tokens = hasInteracted ? CHADS_SEVERITY_TOKENS[result.risk] : null;

  const isFav = isFavorite('chads-vasc');

  // ── Setters ────────────────────────────────────────────────────────────────
  const setCheck = useCallback((key: keyof Cha2ds2VascInputs, value: boolean) => {
    setHasInteracted(true);
    setInputs((p) => ({ ...p, [key]: value }));
  }, []);

  const setAge = useCallback((age: 'under65' | '65to74' | '75plus') => {
    setHasInteracted(true);
    setInputs((p) => ({
      ...p,
      age75plus: age === '75plus',
      age65to74: age === '65to74',
    }));
  }, []);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const buildEmrText = () => {
    const positiveFactors: string[] = [];
    if (inputs.chf) positiveFactors.push('CHF');
    if (inputs.hypertension) positiveFactors.push('HTN');
    if (inputs.age75plus) positiveFactors.push('age ≥75');
    if (inputs.age65to74) positiveFactors.push('age 65–74');
    if (inputs.diabetes) positiveFactors.push('DM');
    if (inputs.strokeTia) positiveFactors.push('prior stroke/TIA');
    if (inputs.vascularDisease) positiveFactors.push('vascular disease');
    if (inputs.female) positiveFactors.push('female sex');
    const factorsLine = positiveFactors.length > 0 ? positiveFactors.join(', ') : 'none';
    // Em-dash replaced with colon in exported summary for clean EMR paste.
    // Annual stroke rate is a derived statistic (not an interpretation tier)
    // and is kept. (V direction 2026-05-20.)
    return [
      `CHA₂DS₂-VASc: ${result.score}/9 (annual stroke ${result.annualStrokeRate}%)`,
      `Risk factors: ${factorsLine}.`,
    ].join('\n');
  };

  const handleCopy = () => {
    trackResult(result.score);
    copyToClipboard(buildEmrText(), () => {
      showToast('Copied to clipboard');
    });
  };

  useCaseReload({
    payloadKey: 'chads-vasc',
    restore: (payload) => {
      if (payload.inputs) setInputs(payload.inputs as Cha2ds2VascInputs);
    },
    onCaseLoaded: setCurrentCaseId,
    onSuccess: (initials) => showToast(`Opened ${initials} from My Cases`, 2500),
  });

  const handleReset = () => {
    setInputs(defaultInputs);
    setCurrentCaseId(null);
    setHasInteracted(false);
    resetDrawer();
    resetTracking();
    showToast('Reset', 1500);
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const now = toggleFavorite('chads-vasc');
    showToast(now ? 'Saved to favorites' : 'Removed from favorites');
  };

  // ── Drawer content ─────────────────────────────────────────────────────────

  const DrawerContent = () => (
    <div
      id="chads-drawer-content"
      role="region"
      aria-label="CHA₂DS₂-VASc Interpretation"
      className="max-h-[60dvh] overflow-y-auto"
    >
      <div className="px-5 pt-4 pb-6">
        <p className="text-xl font-semibold text-slate-900 leading-tight">
          {RISK_LABELS[result.risk]}
        </p>
        {result.annualStrokeRate > 0 && (
          <p className="text-slate-600 leading-relaxed mt-2">
            Approximately <strong>{result.annualStrokeRate}%</strong> annual stroke rate.
          </p>
        )}
        <p className="text-slate-700 leading-relaxed mt-3">
          {RISK_GUIDANCE[result.risk]}
        </p>
        {(result.risk === 'moderate_high' || result.risk === 'high') && (
          <div className="mt-4 pl-3 border-l-2 border-amber-400">
            <div className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">See also</div>
            <p className="text-sm text-slate-700 leading-relaxed">
              Assess bleeding risk with{' '}
              <Link to="/calculators/has-bled-score" className="text-neuro-600 hover:underline font-medium">
                HAS-BLED Score
              </Link>
              . High HAS-BLED does not contraindicate anticoagulation — address modifiable risks.
            </p>
          </div>
        )}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400 leading-relaxed">
            <cite>{PRIMARY_CITATION.authors}. {PRIMARY_CITATION.title}. {PRIMARY_CITATION.journal}. {PRIMARY_CITATION.year};{PRIMARY_CITATION.volume}({PRIMARY_CITATION.issue}):{PRIMARY_CITATION.pages}.</cite>{' '}
            <a href={`https://doi.org/${PRIMARY_CITATION.doi}`} target="_blank" rel="noopener noreferrer" className="text-neuro-600 hover:underline">DOI</a>
          </p>
        </div>
      </div>
    </div>
  );

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">CHA₂DS₂-VASc Score Calculator</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <CalculatorHeader
        name="CHA₂DS₂-VASc Score"
        scoreDisplay={
          <>
            <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">
              {hasInteracted ? result.score : '—'}
            </span>
            <span className="text-slate-400 text-sm leading-none">/ 9</span>
            {hasInteracted && (
              <span className={`text-xs font-medium ml-1.5 ${
                result.risk === 'very_low' ? 'text-emerald-700' :
                result.risk === 'low_moderate' ? 'text-amber-700' :
                result.risk === 'moderate_high' ? 'text-orange-700' :
                'text-red-600'
              }`}>
                {RISK_LABELS[result.risk]}
              </span>
            )}
          </>
        }
        scoreAriaLabel={
          hasInteracted
            ? `CHA₂DS₂-VASc Score ${result.score} of 9. ${RISK_LABELS[result.risk]}${result.annualStrokeRate > 0 ? `, ${result.annualStrokeRate}% annual stroke rate.` : '.'}`
            : 'CHA₂DS₂-VASc Score — not yet calculated'
        }
        onBack={handleBack}
        onReset={handleReset}
        onCopy={handleCopy}
        shareText={buildEmrText}
        shareTitle="CHA₂DS₂-VASc Score"
        onShareResult={(r) => {
          if (r === 'shared') showToast('Sent');
          else if (r === 'copied') showToast('Copied to clipboard');
        }}
        onFavToggle={handleFavToggle}
        isFav={isFav}
        saveCase={{
          source: { type: 'calculator', id: 'chads-vasc', title: 'CHA₂DS₂-VASc' },
          existingCaseId: currentCaseId ?? undefined,
          onSaved: (id) => {
            setCurrentCaseId(id);
            showToast(currentCaseId ? 'Case updated' : 'Case saved', 2000);
          },
          buildData: () => ({
            payload: {
              'chads-vasc': {
                headline: `CHA₂DS₂-VASc: ${result.score}/9`,
                subline: `${result.annualStrokeRate}% annual stroke risk`,
                score: result.score,
                annualStrokeRate: result.annualStrokeRate,
                risk: result.risk,
                inputs,
              },
            },
          }),
        }}
      />

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        <div className="space-y-10">

          {/* Age — A1 vertical radio rows */}
          <section aria-labelledby="chads-age-label">
            <h2
              id="chads-age-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Age
            </h2>
            <div role="radiogroup" aria-labelledby="chads-age-label">
              {(
                [
                  { value: 'under65', label: 'Under 65', points: '0 pts' },
                  { value: '65to74', label: '65–74',    points: '1 pt'  },
                  { value: '75plus', label: '≥75',      points: '2 pts' },
                ] as const
              ).map(({ value, label, points }, idx) => {
                const isSelected =
                  value === '75plus'
                    ? inputs.age75plus
                    : value === '65to74'
                    ? inputs.age65to74
                    : !inputs.age75plus && !inputs.age65to74;
                return (
                  <React.Fragment key={value}>
                    {idx > 0 && <div className="divider-hair" />}
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setAge(value)}
                      className={isSelected
                        ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                      }
                    >
                      <span className={isSelected ? 'font-semibold' : 'font-medium text-slate-900'}>
                        {label}
                      </span>
                      <span className={isSelected ? 'text-sm opacity-75' : 'text-sm text-slate-400'}>
                        {points}
                      </span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Risk factors — 6 checkboxes as A3 row pattern (§4.1–4.3) */}
          <section aria-labelledby="chads-risk-factors-label">
            <h2
              id="chads-risk-factors-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Risk factors
            </h2>
            <div>
              {CHECKBOX_ITEMS.map(({ key, label, points, sublabel }, idx) => {
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
                        aria-describedby={sublabel ? `chads-desc-${key}` : undefined}
                      />
                      <div className="flex-1 min-w-0 flex items-baseline justify-between gap-3">
                        <div className="min-w-0">
                          <span className={isChecked ? 'block font-semibold text-neuro-700' : 'block font-medium text-slate-900'}>
                            {label}
                          </span>
                          {sublabel && (
                            <span
                              id={`chads-desc-${key}`}
                              className="block text-xs text-slate-500 mt-0.5"
                            >
                              {sublabel}
                            </span>
                          )}
                        </div>
                        <span className={isChecked ? 'text-sm opacity-75 flex-shrink-0' : 'text-sm text-slate-400 flex-shrink-0'}>
                          {points === 2 ? '2 pts' : '1 pt'}
                        </span>
                      </div>
                    </label>
                  </React.Fragment>
                );
              })}
            </div>
          </section>

          {/* Score legend — reference table, stays in <main> */}
          <section aria-label="Score reference table">
            <h2
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3"
            >
              Annual Stroke Risk by Score
            </h2>
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-slate-600">
                {[
                  { score: 0, rate: '0%',    note: 'Very low' },
                  { score: 1, rate: '~1.3%', note: 'Low-moderate' },
                  { score: 2, rate: '~2.2%', note: 'Moderate-high' },
                  { score: 3, rate: '~3.2%', note: '' },
                  { score: 4, rate: '~4.0%', note: '' },
                  { score: 5, rate: '~6.7%', note: 'High' },
                  { score: 6, rate: '~9.8%', note: '' },
                  { score: 7, rate: '~9.6%', note: '' },
                  { score: 8, rate: '~12.5%', note: '' },
                  { score: 9, rate: '~15.2%', note: '' },
                ].map(({ score, rate, note }) => (
                  <div
                    key={score}
                    className={`flex justify-between py-0.5 ${
                      hasInteracted && result.score === score ? 'bg-neuro-50 text-neuro-700 font-semibold rounded px-1 -mx-1' : ''
                    }`}
                  >
                    <span>
                      Score {score}
                      {note ? <span className="text-slate-400 ml-1">({note})</span> : ''}
                    </span>
                    <span>{rate}</span>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-400">
                Unadjusted rates per 100 patient-years, Euro Heart Survey cohort (Lip GY et al. Chest 2010, Table 3). Rates in other AF registries vary.
              </p>
            </div>
          </section>

        </div>{/* end space-y-10 */}

        {/* Page footer — §1.2 */}
        <CalculatorFooter
          citation={
            <>
              <cite>{PRIMARY_CITATION.authors}. {PRIMARY_CITATION.title}. {PRIMARY_CITATION.journal}. {PRIMARY_CITATION.year};{PRIMARY_CITATION.volume}({PRIMARY_CITATION.issue}):{PRIMARY_CITATION.pages}.</cite>{' '}
              <a
                href={`https://doi.org/${PRIMARY_CITATION.doi}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-neuro-600 hover:underline ml-0.5"
              >
                DOI
              </a>
              {' · '}{GUIDELINE_CITATION.title} ({GUIDELINE_CITATION.year}).
            </>
          }
          disclaimer="Educational use only. Anticoagulation decisions require shared decision-making accounting for individual bleeding risk, patient preferences, and comorbidities."
          related={
            <>
              Related:{' '}
              <Link to="/calculators/has-bled-score" className="text-neuro-600 hover:underline">
                HAS-BLED
              </Link>{' '}
              (bleeding risk on anticoagulation)
            </>
          }
        />

        {/* Drawer spacer — §1.3 */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />

      </main>

      {/* ── Drawer portal — fixed above mobile bottom nav §1.3 ───────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen((v) => !v)}
        ariaContentId="chads-drawer-content"
        stateAText={{ label: '0 of 7 selected', hint: 'Appears when complete' }}
        collapsedStat={
          hasInteracted
            ? `${RISK_LABELS[result.risk]}${result.annualStrokeRate > 0 ? ` · ~${result.annualStrokeRate}%/yr` : ''}`
            : ''
        }
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast notification — z-[60] above drawer ─────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
}
