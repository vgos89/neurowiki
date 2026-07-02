/**
 * mRS Calculator — modified Rankin Scale
 * Archetype 1 variant (single-selection) with 4-state persistent bottom drawer.
 *
 * Design: matches CALCULATOR_SPEC.md option-row anatomy (§2.1–2.5).
 *   Rows:    divide-y divide-slate-200 · selected-option · items-baseline justify-between
 *   Sublabel: nested span pattern (CHA₂DS₂-VASc §4 reference)
 *   Keyboard: roving tabindex per §2.4 (GCS / ICH Score pattern)
 *
 * Two scoring modes:
 *   Direct  — 7 radio rows, one tap (default; fastest at the bedside)
 *   Guided  — 4-question YES/NO interview (for collateral / family history)
 *
 * Context toggle (in header scoreDisplay):
 *   Pre-stroke — baseline function for EVT / IVT eligibility
 *   Current    — post-stroke or clinic functional status
 *
 * Medical sources:
 *   van Swieten JC et al. Stroke. 1988;19(5):604–607 (grade definitions)
 *   Wilson JL et al. Stroke. 2002;33(9):2243–2246 (structured interview)
 */

import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { Link } from 'react-router-dom';
import { CalculatorHeader }       from '../components/calculators/CalculatorHeader';
import { CalculatorFooter }       from '../components/calculators/CalculatorFooter';
import { CalculatorDrawer }       from '../components/calculators/CalculatorDrawer';
import { CalculatorToast }        from '../components/calculators/CalculatorToast';
import { useDrawerState }         from '../hooks/useDrawerState';
import { useNavigationSource }    from '../hooks/useNavigationSource';
import { useFavorites }           from '../hooks/useFavorites';
import { useRecents }             from '../hooks/useRecents';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import { useCaseReload }          from '../hooks/useCaseReload';
import { copyToClipboard }        from '../utils/clipboard';
import type { SeverityTokens }    from '../lib/calculators/severityTokens';

// ─── Types ────────────────────────────────────────────────────────────────────

type MRSGrade   = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type MRSContext = 'pre-stroke' | 'current';
type MRSMode    = 'direct' | 'guided';

// ─── Grade data (van Swieten 1988 wording) ────────────────────────────────────

interface GradeData {
  grade:      MRSGrade;
  label:      string;   // Primary display label
  sublabel:   string;   // Clarifying one-liner below the label
}

const MRS_GRADES: GradeData[] = [
  {
    grade:    0,
    label:    'No symptoms',
    sublabel: 'No disability — fully active as before',
  },
  {
    grade:    1,
    label:    'No significant disability',
    sublabel: 'Symptoms present but carries out all usual duties and activities',
  },
  {
    grade:    2,
    label:    'Slight disability',
    sublabel: 'Unable to carry out all previous activities; independent in daily affairs',
  },
  {
    grade:    3,
    label:    'Moderate disability',
    sublabel: 'Requires some help; able to walk without physical assistance',
  },
  {
    grade:    4,
    label:    'Moderately severe disability',
    sublabel: 'Unable to walk without assistance; unable to attend to own bodily needs',
  },
  {
    grade:    5,
    label:    'Severe disability',
    sublabel: 'Bedridden, incontinent, requires constant nursing care',
  },
  {
    grade:    6,
    label:    'Dead',
    sublabel: 'Deceased',
  },
];

// ─── Guided interview ─────────────────────────────────────────────────────────
// Decision cascade derived from Wilson et al. 2002 structured interview.
// Resolves in 3–4 YES/NO answers. Phrased for pre-stroke or current context.

type InterviewStep = 'walk' | 'bedridden' | 'daily-help' | 'activities' | 'symptoms';

interface Question {
  id:        InterviewStep;
  preStroke: string;
  current:   string;
  hint:      string;
}

const QUESTIONS: Record<InterviewStep, Question> = {
  walk: {
    id:        'walk',
    preStroke: 'Could they walk without physical help from another person?',
    current:   'Can they walk without physical help from another person?',
    hint:      'Using a cane, walker, or brace counts as YES — needing another person counts as NO',
  },
  bedridden: {
    id:        'bedridden',
    preStroke: 'Were they mostly bed- or chair-bound, fully dependent on others for all care?',
    current:   'Are they mostly bed- or chair-bound, fully dependent on others for all care?',
    hint:      'Typically includes incontinence and need for constant nursing attention',
  },
  'daily-help': {
    id:        'daily-help',
    preStroke: 'Did they need help from others for daily activities?',
    current:   'Do they need help from others for daily activities?',
    hint:      'Shopping, cooking, housework, finances — help with any of these counts as YES',
  },
  activities: {
    id:        'activities',
    preStroke: 'Did they give up any activities or hobbies they used to do?',
    current:   'Have they given up any activities or hobbies they used to do?',
    hint:      'Stopping driving, a regular sport, or a social activity counts as YES',
  },
  symptoms: {
    id:        'symptoms',
    preStroke: 'Did they have any persistent symptoms from a prior neurological event?',
    current:   'Do they have any persistent neurological symptoms?',
    hint:      'Weakness, speech difficulty, vision change, or coordination problem — even minor',
  },
};

// YES → next step or final grade; NO → next step or final grade
const TRANSITIONS: Record<InterviewStep, { yes: InterviewStep | MRSGrade; no: InterviewStep | MRSGrade }> = {
  walk:          { yes: 'daily-help', no: 'bedridden' },
  bedridden:     { yes: 5,           no: 4            },
  'daily-help':  { yes: 3,           no: 'activities' },
  activities:    { yes: 2,           no: 'symptoms'   },
  symptoms:      { yes: 1,           no: 0            },
};

// ─── Severity tokens — CALCULATOR_SPEC.md §6 ─────────────────────────────────

const GRADE_TOKENS: Record<MRSGrade, SeverityTokens> = {
  0: { borderColor: '#e2e8f0', headerBg: 'bg-white',      headerHover: 'hover:bg-slate-50',    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',   statClass: 'text-sm font-medium text-slate-700',   chevronClass: 'text-slate-400'   },
  1: { borderColor: '#a7f3d0', headerBg: 'bg-emerald-50', headerHover: 'hover:bg-emerald-100', labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest', statClass: 'text-sm font-medium text-emerald-700', chevronClass: 'text-emerald-600' },
  2: { borderColor: '#bae6fd', headerBg: 'bg-sky-50',     headerHover: 'hover:bg-sky-100',     labelClass: 'text-[10px] font-bold text-sky-700 uppercase tracking-widest',     statClass: 'text-sm font-medium text-sky-700',     chevronClass: 'text-sky-600'     },
  3: { borderColor: '#fed7aa', headerBg: 'bg-amber-50',   headerHover: 'hover:bg-amber-100',   labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',   statClass: 'text-sm font-medium text-amber-700',   chevronClass: 'text-amber-600'   },
  4: { borderColor: '#fecaca', headerBg: 'bg-red-50',     headerHover: 'hover:bg-red-100',     labelClass: 'text-[10px] font-bold text-red-600 uppercase tracking-widest',     statClass: 'text-sm font-medium text-red-600',     chevronClass: 'text-red-500'     },
  5: { borderColor: '#fecaca', headerBg: 'bg-red-50',     headerHover: 'hover:bg-red-100',     labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',     statClass: 'text-sm font-medium text-red-700',     chevronClass: 'text-red-600'     },
  6: { borderColor: '#e2e8f0', headerBg: 'bg-slate-100',  headerHover: 'hover:bg-slate-200',   labelClass: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest',   statClass: 'text-sm font-medium text-slate-600',   chevronClass: 'text-slate-500'   },
};

const GRADE_TEXT: Record<MRSGrade, string> = {
  0: 'text-slate-700',
  1: 'text-emerald-700',
  2: 'text-sky-700',
  3: 'text-amber-700',
  4: 'text-red-600',
  5: 'text-red-700',
  6: 'text-slate-600',
};

// ─── Keyboard helper (roving tabindex — CALCULATOR_SPEC.md §2.4) ──────────────

function makeKeyHandler(
  groupRef: React.RefObject<HTMLDivElement | null>,
  total: number,
  currentIdx: number,
  selectFn: (idx: number) => void,
) {
  return (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
    e.preventDefault();
    const next =
      e.key === 'ArrowDown' || e.key === 'ArrowRight'
        ? (currentIdx + 1) % total
        : (currentIdx - 1 + total) % total;
    selectFn(next);
    groupRef.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
  };
}

// ─── Main component ───────────────────────────────────────────────────────────

const MrsCalculator: React.FC = () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const [grade,          setGrade]          = useState<MRSGrade | null>(null);
  const [context,        setContext]        = useState<MRSContext>('pre-stroke');
  const [mode,           setMode]           = useState<MRSMode>('direct');
  const [interviewStep,  setInterviewStep]  = useState<InterviewStep>('walk');
  const [justCompleted,  setJustCompleted]  = useState(false);
  const [currentCaseId,  setCurrentCaseId]  = useState<string | null>(null);

  const wasCompleteRef = useRef(false);
  const gradeGroupRef  = useRef<HTMLDivElement>(null);   // direct mode radiogroup
  const yesNoGroupRef  = useRef<HTMLDivElement>(null);   // guided mode YES/NO group

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleBack }                 = useNavigationSource();
  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView }                 = useRecents();
  const { trackResult, resetTracking } = useCalculatorAnalytics('mrs');

  useEffect(() => {
    recordView({
      type:     'calculator',
      id:       'mrs',
      title:    'mRS',
      subtitle: 'modified Rankin Scale',
      category: 'severity',
      trail:    '0–6',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--drawer-floor-height', '52px');
    return () => {
      document.documentElement.style.setProperty('--drawer-floor-height', '0px');
    };
  }, []);

  // ── Derived ────────────────────────────────────────────────────────────────
  const isComplete = grade !== null;

  const { state: drawerState, drawerOpen, setDrawerOpen, reset: resetDrawer, toast, showToast } =
    useDrawerState({ mode: 'partial-complete', selectedCount: isComplete ? 1 : 0, totalRequired: 1 });

  const isFav = isFavorite('mrs');

  // ── Discovery animation ────────────────────────────────────────────────────
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

  // ── Grade selection ────────────────────────────────────────────────────────
  const handleGradeSelect = useCallback((g: MRSGrade) => {
    setGrade(g);
  }, []);

  // ── Interview answer ───────────────────────────────────────────────────────
  const handleInterviewAnswer = useCallback((answer: boolean) => {
    const next = answer ? TRANSITIONS[interviewStep].yes : TRANSITIONS[interviewStep].no;
    if (typeof next === 'number') {
      // Interview resolved — set grade; guided mode shows the radio list in its resolved state
      handleGradeSelect(next as MRSGrade);
    } else {
      setInterviewStep(next);
    }
  }, [interviewStep, handleGradeSelect]);

  const restartInterview = useCallback(() => {
    setGrade(null);
    setInterviewStep('walk');
    resetDrawer();
  }, [resetDrawer]);

  const switchMode = useCallback((newMode: MRSMode) => {
    setMode(newMode);
    setGrade(null);
    setInterviewStep('walk');
    resetDrawer();
  }, [resetDrawer]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const buildEmrText = useCallback(() => {
    if (grade === null) return 'mRS: Not yet selected.';
    const g   = MRS_GRADES[grade];
    const ctx = context === 'pre-stroke' ? 'Pre-stroke mRS' : 'mRS';
    return [`${ctx}: ${grade} — ${g.label}`, g.sublabel + '.'].join('\n');
  }, [grade, context]);

  const handleCopy = useCallback(() => {
    if (grade !== null) trackResult(grade);
    copyToClipboard(buildEmrText(), () => showToast('Copied to clipboard'));
  }, [buildEmrText, grade, trackResult, showToast]);

  const handleReset = useCallback(() => {
    setGrade(null);
    setInterviewStep('walk');
    setCurrentCaseId(null);
    resetDrawer();
    resetTracking();
    showToast('Reset', 1500);
  }, [resetDrawer, resetTracking, showToast]);

  const handleFavToggle = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('mrs');
    showToast(isNowFav ? 'Saved to favorites' : 'Removed from favorites');
  }, [toggleFavorite, showToast]);

  useCaseReload({
    payloadKey: 'mrs',
    restore: (payload) => {
      if (payload.grade !== undefined) setGrade(payload.grade as MRSGrade);
      if (payload.context) setContext(payload.context as MRSContext);
    },
    onCaseLoaded: setCurrentCaseId,
    onSuccess: (initials) => showToast(`Opened ${initials} from My Cases`, 2500),
  });

  // ── Tokens ─────────────────────────────────────────────────────────────────
  const tokens    = grade !== null ? GRADE_TOKENS[grade] : null;
  const gradeData = grade !== null ? MRS_GRADES[grade]   : null;

  // ── Header score display ───────────────────────────────────────────────────
  // Context toggle lives here (matches NIHSS rapid/detailed toggle placement).
  const renderScoreDisplay = () => (
    <>
      {/* Grade number */}
      <span className={`text-2xl font-semibold tabular-nums leading-none ${grade !== null ? GRADE_TEXT[grade] : 'text-slate-900'}`}>
        {grade !== null ? grade : '—'}
      </span>
      <span className="text-slate-400 text-sm leading-none">/ 6</span>

      {/* Pre-stroke / Current context toggle */}
      <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5 ml-1">
        <button
          type="button"
          onClick={() => setContext('pre-stroke')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            context === 'pre-stroke'
              ? 'bg-white text-slate-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Pre-stroke
        </button>
        <button
          type="button"
          onClick={() => setContext('current')}
          className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-colors ${
            context === 'current'
              ? 'bg-white text-slate-900'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Current
        </button>
      </div>
    </>
  );

  // ── Drawer content ─────────────────────────────────────────────────────────
  const DrawerContent: React.FC = () => {
    if (grade === null || gradeData === null) return null;

    const isPrestroke = context === 'pre-stroke';

    const renderInterpretation = () => {
      if (grade === 6) return null;

      let headline = '';
      let body     = '';

      if (isPrestroke) {
        if (grade <= 1) {
          headline = 'Standard EVT and IVT eligibility';
          body     = 'Prestroke mRS 0–1 satisfies the baseline-function criterion for EVT in standard and extended windows, and for IVT within 4.5 h, per AHA/ASA 2026. No baseline-disability exclusion applies.';
        } else if (grade === 2) {
          headline = 'EVT can reasonably be considered (COR 2a)';
          body     = 'Prestroke mRS 2 is not a contraindication. Per AHA/ASA 2026, for anterior-circulation proximal LVO within 6 h with NIHSS ≥6 and ASPECTS ≥6, EVT can reasonably be considered (COR 2a, Level B-NR). The landmark trials (DAWN, DEFUSE-3, SELECT-2) enrolled prestroke mRS 0–1, so trial-level evidence is strongest at mRS 0–1; the mRS 2 recommendation reflects current guidance. Individualize and document.';
        } else {
          headline = 'High baseline disability — goals-of-care discussion';
          body     = 'Standard EVT and IVT trials excluded prestroke mRS ≥2 as routine care. At mRS 3–5, a goals-of-care discussion with the patient and family is appropriate before committing to acute intervention.';
        }
      } else {
        if (grade <= 2) {
          headline = '"Good outcome" — functional independence';
          body     = 'mRS 0–2 is the standard "good outcome" in most acute stroke RCTs (NINDS, DAWN, DEFUSE-3, SELECT-2). At 90 days, mRS ≤2 represents independent function.';
        } else if (grade === 3) {
          headline = 'Dependent for some activities; ambulatory';
          body     = 'mRS 3 falls below the mRS 0–2 "good outcome" threshold used in most stroke trials, but the patient retains independent ambulation. Relevant for rehabilitation goal-setting and trajectory discussions.';
        } else {
          headline = 'Dependent — poor functional outcome range';
          body     = 'mRS 4–5 corresponds to the "poor outcome" range in stroke trial endpoint analyses. Rehabilitation ceiling and long-term care planning discussions are relevant at this stage.';
        }
      }

      // Static data-claim tags — two separate elements so the scanner finds them
      if (isPrestroke) {
        return (
          <div
            data-claim="mrs-prestroke-evt-eligibility"
            className="mt-4 pt-4 border-t border-slate-100"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              Pre-stroke eligibility
            </div>
            <p className={`text-sm font-semibold mb-1 ${GRADE_TEXT[grade]}`}>{headline}</p>
            <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
          </div>
        );
      }
      return (
        <div
          data-claim="mrs-outcome-context"
          className="mt-4 pt-4 border-t border-slate-100"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            Outcome context
          </div>
          <p className={`text-sm font-semibold mb-1 ${GRADE_TEXT[grade]}`}>{headline}</p>
          <p className="text-xs text-slate-600 leading-relaxed">{body}</p>
        </div>
      );
    };

    return (
      <div
        id="mrs-drawer-content"
        role="region"
        aria-label="mRS Interpretation"
        className="max-h-[60dvh] overflow-y-auto"
      >
        <div className="px-5 pt-4 pb-6">

          {/* Grade headline */}
          <p className={`text-xl font-semibold leading-tight ${GRADE_TEXT[grade]}`}>
            {gradeData.label}
          </p>
          <p className="text-slate-600 leading-relaxed mt-1 text-sm">
            {gradeData.sublabel}
          </p>

          {/* Clinical interpretation */}
          {renderInterpretation()}

          {/* Full scale reference */}
          <div
            data-claim="mrs-grade-definitions"
            className="mt-5 pt-4 border-t border-slate-100"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Scale reference
            </div>
            <div className="space-y-0.5">
              {MRS_GRADES.map(({ grade: g, label }) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`w-full flex items-baseline justify-between gap-3 py-1.5 px-2 rounded text-left transition-colors text-sm ${
                    g === grade
                      ? 'bg-slate-100 font-semibold text-slate-900'
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>{label}</span>
                  <span className={`text-xs font-medium tabular-nums flex-shrink-0 ${
                    g === grade ? 'text-slate-600' : 'text-slate-400'
                  }`}>{g}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy */}
          <button
            type="button"
            onClick={() => { handleCopy(); setDrawerOpen(false); }}
            className="w-full mt-5 min-h-[44px] bg-neuro-500 hover:bg-neuro-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors"
          >
            Copy to clipboard
          </button>

          {/* See also */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">See also</div>
            <p className="text-sm text-slate-600 leading-relaxed">
              <Link to="/calculators/nihss" className="text-neuro-600 hover:underline">NIHSS</Link>
              <span className="text-slate-300 mx-2">·</span>
              <Link to="/calculators/aspects-score" className="text-neuro-600 hover:underline">ASPECTS</Link>
              <span className="text-slate-300 mx-2">·</span>
              <Link to="/pathways/stroke-code" className="text-neuro-600 hover:underline">Stroke Code</Link>
            </p>
          </div>

          <p className="mt-4 text-xs text-slate-400 leading-relaxed">
            Educational use only. Not a substitute for clinical judgment.
          </p>
        </div>
      </div>
    );
  };

  // ── Current guided-mode question ───────────────────────────────────────────
  const currentQ  = QUESTIONS[interviewStep];
  const qText     = context === 'pre-stroke' ? currentQ.preStroke : currentQ.current;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">mRS Calculator — modified Rankin Scale for Stroke Disability</h1>

      {/* ── Sticky header ─────────────────────────────────────────────────── */}
      <CalculatorHeader
        name="modified Rankin Scale"
        scoreDisplay={renderScoreDisplay()}
        scoreAriaLabel={
          grade !== null
            ? `mRS ${grade} — ${MRS_GRADES[grade].label}`
            : 'mRS — no grade selected'
        }
        onBack={handleBack}
        onReset={handleReset}
        onCopy={handleCopy}
        shareText={buildEmrText}
        shareTitle="mRS"
        onShareResult={(r) => {
          if (r === 'shared')  showToast('Sent');
          if (r === 'copied') showToast('Copied to clipboard');
        }}
        onFavToggle={handleFavToggle}
        isFav={isFav}
        saveCase={{
          source: { type: 'calculator', id: 'mrs', title: 'mRS' },
          existingCaseId: currentCaseId ?? undefined,
          onSaved: (id) => {
            setCurrentCaseId(id);
            showToast(currentCaseId ? 'Case updated' : 'Case saved', 2000);
          },
          buildData: () => ({
            payload: {
              mrs: {
                headline: grade !== null ? `mRS: ${grade}` : 'mRS: incomplete',
                subline:  grade !== null ? MRS_GRADES[grade].label : undefined,
                grade,
                context,
              },
            },
          }),
        }}
      />

      {/* ── Main scrollable content ───────────────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">

        {/* ── Mode switch — above the radiogroup ─────────────────────────── */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-xs text-slate-400 leading-relaxed max-w-[220px]">
            {context === 'pre-stroke'
              ? 'Baseline before the current event'
              : 'Current or recent functional status'}
          </p>
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => switchMode('direct')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                mode === 'direct'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Direct
            </button>
            <button
              type="button"
              onClick={() => switchMode('guided')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                mode === 'guided'
                  ? 'bg-white text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Guided
            </button>
          </div>
        </div>

        {/* ── DIRECT MODE: 7-grade radio rows ──────────────────────────────── */}
        {mode === 'direct' && (
          <section aria-label="mRS grade selection">
            <div
              role="radiogroup"
              aria-label="Modified Rankin Scale — select a grade"
              ref={gradeGroupRef}
              className="divide-y divide-slate-200"
            >
              {MRS_GRADES.map((g, idx) => {
                const isSelected = grade === g.grade;
                const tabIdx     = grade !== null ? (isSelected ? 0 : -1) : (idx === 0 ? 0 : -1);
                return (
                  <button
                    key={g.grade}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => handleGradeSelect(g.grade)}
                    onKeyDown={makeKeyHandler(
                      gradeGroupRef, MRS_GRADES.length, idx,
                      (i) => handleGradeSelect(MRS_GRADES[i].grade),
                    )}
                    className={
                      isSelected
                        ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                    }
                  >
                    {/* Label + sublabel */}
                    <span className="flex-1 min-w-0 pr-3">
                      <span className={isSelected ? 'block font-semibold' : 'block font-medium text-slate-900'}>
                        {g.label}
                      </span>
                      <span className={`block text-xs mt-0.5 leading-snug ${isSelected ? 'opacity-75' : 'text-slate-400'}`}>
                        {g.sublabel}
                      </span>
                    </span>
                    {/* Grade number — right side */}
                    <span className={isSelected ? 'text-sm font-medium opacity-75 flex-shrink-0' : 'text-sm text-slate-400 flex-shrink-0'}>
                      {g.grade}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── GUIDED MODE: interview in progress ────────────────────────────── */}
        {mode === 'guided' && grade === null && (
          <section aria-labelledby="mrs-interview-label">
            {/* Question — section header pattern */}
            <h2
              id="mrs-interview-label"
              className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2"
            >
              {context === 'pre-stroke' ? 'Before this event' : 'Currently'}
            </h2>
            <p className="text-sm font-medium text-slate-800 leading-snug mb-2">
              {qText}
            </p>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              {currentQ.hint}
            </p>

            {/* YES / NO as standard radio rows */}
            <div
              role="radiogroup"
              aria-labelledby="mrs-interview-label"
              ref={yesNoGroupRef}
              className="divide-y divide-slate-200"
            >
              {([
                { answer: true,  label: 'Yes' },
                { answer: false, label: 'No'  },
              ] as const).map(({ answer, label }, idx) => (
                <button
                  key={label}
                  type="button"
                  role="radio"
                  aria-checked={false}
                  tabIndex={idx === 0 ? 0 : -1}
                  onClick={() => handleInterviewAnswer(answer)}
                  onKeyDown={(e) => {
                    if (!['ArrowDown', 'ArrowRight', 'ArrowUp', 'ArrowLeft'].includes(e.key)) return;
                    e.preventDefault();
                    const next = idx === 0 ? 1 : 0;
                    yesNoGroupRef.current?.querySelectorAll<HTMLButtonElement>('button')[next]?.focus();
                  }}
                  className="w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors"
                >
                  <span className="font-medium text-slate-900">{label}</span>
                </button>
              ))}
            </div>

            {/* Restart — only visible after first answer */}
            {interviewStep !== 'walk' && (
              <button
                type="button"
                onClick={restartInterview}
                className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline transition-colors"
              >
                ← Restart
              </button>
            )}
          </section>
        )}

        {/* ── GUIDED MODE: interview resolved — show grade list selected ─────── */}
        {mode === 'guided' && grade !== null && (
          <section aria-label="Interview result">
            {/* Grade list with resolved grade highlighted — same rows as direct */}
            <div
              role="radiogroup"
              aria-label="Modified Rankin Scale — grade resolved by interview"
              ref={gradeGroupRef}
              className="divide-y divide-slate-200"
            >
              {MRS_GRADES.map((g, idx) => {
                const isSelected = grade === g.grade;
                const tabIdx     = isSelected ? 0 : -1;
                return (
                  <button
                    key={g.grade}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    tabIndex={tabIdx}
                    onClick={() => handleGradeSelect(g.grade)}
                    onKeyDown={makeKeyHandler(
                      gradeGroupRef, MRS_GRADES.length, idx,
                      (i) => handleGradeSelect(MRS_GRADES[i].grade),
                    )}
                    className={
                      isSelected
                        ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors'
                    }
                  >
                    <span className="flex-1 min-w-0 pr-3">
                      <span className={isSelected ? 'block font-semibold' : 'block font-medium text-slate-900'}>
                        {g.label}
                      </span>
                      <span className={`block text-xs mt-0.5 leading-snug ${isSelected ? 'opacity-75' : 'text-slate-400'}`}>
                        {g.sublabel}
                      </span>
                    </span>
                    <span className={isSelected ? 'text-sm font-medium opacity-75 flex-shrink-0' : 'text-sm text-slate-400 flex-shrink-0'}>
                      {g.grade}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Retake link */}
            <button
              type="button"
              onClick={restartInterview}
              className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline transition-colors"
            >
              ← Retake interview
            </button>
          </section>
        )}

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <CalculatorFooter
          citation={
            <>
              <cite>
                van Swieten JC, Koudstaal PJ, Visser MC, Schouten HJA, van Gijn J.
                Interobserver agreement for the assessment of handicap in stroke patients.{' '}
                <em>Stroke</em>. 1988;19(5):604–607.
              </cite>
              {' · '}
              <cite>
                Wilson JL, Hareendran A, Grant M, et al.
                Improving the assessment of outcomes in stroke.{' '}
                <em>Stroke</em>. 2002;33(9):2243–2246.
              </cite>
            </>
          }
          disclaimer="Educational use only. Not a substitute for clinical judgment."
        />

        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} aria-hidden="true" />
      </main>

      {/* ── Bottom drawer ─────────────────────────────────────────────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="mrs-drawer-content"
        stateAText={{ label: 'No grade selected', hint: 'Tap a grade above' }}
        stateBText={{ label: '—', hint: '' }}
        collapsedStat={grade !== null ? `mRS ${grade} — ${MRS_GRADES[grade].label}` : ''}
        justCompleted={justCompleted}
      >
        <DrawerContent />
      </CalculatorDrawer>

      <CalculatorToast message={toast} />
    </>
  );
};

export default MrsCalculator;
