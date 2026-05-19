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
import {
  PatientContextPanel,
  EMPTY_PATIENT_CONTEXT,
  type PatientContextValues,
  type Anticoag,
} from '../components/calculators/PatientContextPanel';
import { formatClinicalDateTime } from '../utils/clinicalDateTime';
import { SaveCaseModal } from '../components/cases/SaveCaseModal';
import type { SavedCaseData } from '../lib/cases/types';

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
  const [justCompleted, setJustCompleted] = useState(false);

  // Auto-captured "Performed" timestamp — set on first NIHSS item input.
  // Reset clears this back to null along with the rest of the calculator state.
  const [performedAt, setPerformedAt] = useState<Date | null>(null);

  // Optional patient context — LKW + BP + glucose + anticoagulant class.
  // All optional; appears in EMR output only when populated.
  const [patientContext, setPatientContext] = useState<PatientContextValues>({
    ...EMPTY_PATIENT_CONTEXT,
    anticoag: new Set(),
  });

  // Save Case modal — opens from the bottom drawer when the clinician
  // wants to persist this exam to /my-cases (IndexedDB, on-device only).
  const [saveCaseOpen, setSaveCaseOpen] = useState(false);

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
    // Capture "Performed" timestamp on first input — clinical convention is
    // that NIHSS time = when the exam started, not when the page opened.
    if (performedAt === null) {
      setPerformedAt(new Date());
    }
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

  const buildText = () => {
    const severityBracket = (() => {
      if (total === 0) return 'no stroke symptoms';
      if (total <= 4) return 'minor stroke';
      if (total <= 15) return 'moderate stroke';
      if (total <= 20) return 'moderate-severe stroke';
      return 'severe stroke';
    })();
    const itemLines = [
      `1a. LOC: ${nihssValues['1a'] ?? 0}`,
      `1b. LOC Questions: ${nihssValues['1b'] ?? 0}`,
      `1c. LOC Commands: ${nihssValues['1c'] ?? 0}`,
      `2. Best Gaze: ${nihssValues['2'] ?? 0}`,
      `3. Visual Fields: ${nihssValues['3'] ?? 0}`,
      `4. Facial Palsy: ${nihssValues['4'] ?? 0}`,
      `5a. Motor L Arm: ${nihssValues['5a'] ?? 0}`,
      `5b. Motor R Arm: ${nihssValues['5b'] ?? 0}`,
      `6a. Motor L Leg: ${nihssValues['6a'] ?? 0}`,
      `6b. Motor R Leg: ${nihssValues['6b'] ?? 0}`,
      `7. Limb Ataxia: ${nihssValues['7'] ?? 0}`,
      `8. Sensory: ${nihssValues['8'] ?? 0}`,
      `9. Best Language: ${nihssValues['9'] ?? 0}`,
      `10. Dysarthria: ${nihssValues['10'] === 9 ? 'UN' : (nihssValues['10'] ?? 0)}`,
      `11. Extinction/Neglect: ${nihssValues['11'] ?? 0}`,
    ];

    // ── Patient-context lines (each optional; omitted if not populated) ──────
    const contextLines: string[] = [];
    if (performedAt) {
      contextLines.push(`Exam Performed: ${formatClinicalDateTime(performedAt)}`);
    }
    if (patientContext.lkw === null) {
      contextLines.push(`LKW: Unknown / wake-up`);
    } else if (patientContext.lkw instanceof Date) {
      contextLines.push(`LKW: ${formatClinicalDateTime(patientContext.lkw)}`);
    }
    if (patientContext.systolic && patientContext.diastolic) {
      const glu = patientContext.glucose ? ` · Glucose: ${patientContext.glucose} mg/dL` : '';
      contextLines.push(`BP: ${patientContext.systolic}/${patientContext.diastolic}${glu}`);
    } else if (patientContext.glucose) {
      contextLines.push(`Glucose: ${patientContext.glucose} mg/dL`);
    }
    if (patientContext.anticoag.size > 0) {
      const ANTICOAG_LABELS: Record<Anticoag, string> = {
        doac: 'DOAC',
        warfarin: 'Warfarin',
        antiplatelet: 'Antiplatelet',
      };
      const list = Array.from(patientContext.anticoag).map((k) => ANTICOAG_LABELS[k]).join(', ');
      contextLines.push(`Anti-Coag/Antiplatelet: ${list}`);
    }

    const header = `NIHSS — ${total} (${severityBracket})`;
    const blocks: string[] = [header];
    if (contextLines.length > 0) {
      blocks.push(contextLines.join('\n'));
    }
    blocks.push(itemLines.join('\n'));
    return blocks.join('\n\n');
  };

  const copyNihss = () => {
    navigator.clipboard.writeText(buildText());
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
    setPerformedAt(null);
    setPatientContext({ ...EMPTY_PATIENT_CONTEXT, anticoag: new Set() });
    reset();
    showToast('Reset', 1500);
  };

  /** Normal exam shortcut — Phase 7E §3.5: set all 15 items to 0, open drawer */
  const handleNormalExam = () => {
    const allZero = Object.fromEntries(NIHSS_ITEMS.map(item => [item.id, 0]));
    // Capture Performed timestamp on shortcut too — the exam was just done.
    if (performedAt === null) {
      setPerformedAt(new Date());
    }
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

        {/* Copy + Save row */}
        <div className="mt-1 flex gap-2">
          <button
            type="button"
            onClick={() => { copyNihss(); setDrawerOpen(false); /* collapses drawer after copy */ }}
            className="flex-1 min-h-[44px] bg-neuro-500 hover:bg-neuro-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Copy to clipboard
          </button>
          {isComplete && (
            <button
              type="button"
              onClick={() => setSaveCaseOpen(true)}
              className="min-h-[44px] py-2.5 px-4 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            >
              Save case
            </button>
          )}
        </div>

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
          // V direction (2026-05-19): tally moved out of header (still shown
          // in the bottom drawer); Rapid/Detailed toggle takes the slot.
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
        }
        scoreAriaLabel={`NIH Stroke Scale — ${nihssMode} mode. Score visible in bottom drawer.`}
        onBack={handleBack}
        onReset={handleReset}
        onCopy={copyNihss}
        shareText={buildText}
        shareTitle="NIHSS"
        onShareResult={(r) => {
          if (r === 'shared') showToast('Sent');
          else if (r === 'copied') showToast('Copied to clipboard');
        }}
        onFavToggle={handleFavToggle}
        isFav={isFav}
      />

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">
        {/* Auto-captured Performed timestamp — single muted line, appears
            as soon as any NIHSS item is scored. */}
        {performedAt && (
          <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400 mb-3">
            Exam Performed · {formatClinicalDateTime(performedAt)}
          </p>
        )}

        {/* Optional patient-context panel — collapsible accordion above items.
            Captures LKW + BP + glucose + anticoagulant for inclusion in the
            EMR copy/share output. Skinny settings-panel style. */}
        <div className="mb-4">
          <PatientContextPanel values={patientContext} onChange={setPatientContext} />
        </div>

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
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} aria-hidden="true" />
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

      {/* ── Save Case modal ──────────────────────────────────────────────────
          Persists the current NIHSS score + patient context to IndexedDB
          under the clinician's chosen initials. On-device only; no server. */}
      <SaveCaseModal
        isOpen={saveCaseOpen}
        onClose={() => setSaveCaseOpen(false)}
        source={{ type: 'calculator', id: 'nihss', title: 'NIHSS' }}
        buildData={(): SavedCaseData => ({
          nihss: {
            score: total,
            values: nihssValues,
            mode: nihssMode,
            severity: SEVERITY_LABEL[severity],
            performedAt: performedAt ? performedAt.getTime() : undefined,
          },
          patientContext: {
            lkw: patientContext.lkw instanceof Date
              ? patientContext.lkw.getTime()
              : patientContext.lkw,
            systolic: patientContext.systolic || undefined,
            diastolic: patientContext.diastolic || undefined,
            glucose: patientContext.glucose || undefined,
            anticoag: patientContext.anticoag.size > 0
              ? Array.from(patientContext.anticoag)
              : undefined,
          },
        })}
        onSaved={() => showToast('Saved to My Cases')}
      />
    </>
  );
};

export default NihssCalculator;
