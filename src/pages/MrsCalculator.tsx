/**
 * mRS Calculator — modified Rankin Scale
 * Archetype 1 variant (single-selection) with 4-state persistent bottom drawer.
 *
 * Spec citations:
 *   §1.1 Sticky header · §1.2 Main content · §1.3 Drawer anatomy
 *   §2.1–2.5 Option rows · §5 Drawer state machine · §6 Severity tokens
 *
 * Two scoring modes:
 *   Direct — tap to select from 7 grade cards (default; fastest at the bedside)
 *   Guided — 4-question structured-interview cascade for family history
 *
 * Two contexts:
 *   Pre-stroke — captures baseline for EVT/IVT eligibility triage
 *   Current    — captures post-stroke or clinic functional status
 *
 * Medical sources:
 *   van Swieten JC et al. Stroke. 1988;19(5):604–607 (scale modification)
 *   Wilson JL et al. Stroke. 2002;33(9):2243–2246 (structured interview)
 *   Quinn TJ et al. Stroke. 2009;40(10):3467–3469 (simplified assessment)
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

// ─── Types ────────────────────────────────────────────────────────────────────

type MRSGrade  = 0 | 1 | 2 | 3 | 4 | 5 | 6;
type MRSContext = 'pre-stroke' | 'current';
type MRSMode   = 'direct' | 'guided';

// ─── Grade definitions ────────────────────────────────────────────────────────

interface GradeData {
  grade:      MRSGrade;
  label:      string;   // Short display label
  definition: string;   // One-sentence description (matches van Swieten 1988)
  example:    string;   // Concrete clinical example for quick orientation
}

const MRS_GRADES: GradeData[] = [
  {
    grade:      0,
    label:      'No symptoms',
    definition: 'No disability whatsoever',
    example:    'Fully active — no symptoms from any prior neurological event',
  },
  {
    grade:      1,
    label:      'No significant disability',
    definition: 'Symptoms but carries out all usual duties and activities',
    example:    'Notices mild weakness or speech change; still works, drives, exercises',
  },
  {
    grade:      2,
    label:      'Slight disability',
    definition: 'Unable to carry out all previous activities; independent in own affairs',
    example:    'Gave up driving or a sport; manages all personal care and daily errands alone',
  },
  {
    grade:      3,
    label:      'Moderate disability',
    definition: 'Requires some help; able to walk without assistance',
    example:    'Needs help with shopping or cooking; walks with cane or independently',
  },
  {
    grade:      4,
    label:      'Moderately severe disability',
    definition: 'Unable to walk without assistance; unable to attend to own bodily needs',
    example:    'Uses walker or wheelchair; needs help with dressing, bathing, or toileting',
  },
  {
    grade:      5,
    label:      'Severe disability',
    definition: 'Bedridden, incontinent, requires constant nursing care',
    example:    'Bed- or chair-bound; fully dependent for all basic needs',
  },
  {
    grade:      6,
    label:      'Dead',
    definition: 'Deceased',
    example:    '',
  },
];

// ─── Guided interview ─────────────────────────────────────────────────────────
// 4-question decision cascade derived from Wilson et al. 2002 structured interview.
// Typical completion: 3 questions. Maximum: 4 questions.

type InterviewStep = 'walk' | 'bedridden' | 'daily-help' | 'activities' | 'symptoms';

interface InterviewQuestion {
  id:         InterviewStep;
  preStroke:  string;  // Phrased as past tense for pre-stroke context
  current:    string;  // Phrased as present tense for current context
  hint:       string;  // Clarifying note shown below the question
}

const INTERVIEW_QUESTIONS: Record<InterviewStep, InterviewQuestion> = {
  walk: {
    id:        'walk',
    preStroke: 'Could they walk without physical help from another person?',
    current:   'Can they walk without physical help from another person?',
    hint:      'Using a cane, walker, or brace counts as YES — physical assistance from a person is the threshold',
  },
  bedridden: {
    id:        'bedridden',
    preStroke: 'Were they mostly bed- or chair-bound and dependent on others for all care?',
    current:   'Are they mostly bed- or chair-bound and dependent on others for all care?',
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

// Transition table: yes path → next step or final grade; no path → next step or final grade
// Numeric value = final mRS grade; string = next InterviewStep
const TRANSITIONS: Record<InterviewStep, { yes: InterviewStep | MRSGrade; no: InterviewStep | MRSGrade }> = {
  walk:          { yes: 'daily-help', no: 'bedridden' },
  bedridden:     { yes: 5,           no: 4            },
  'daily-help':  { yes: 3,           no: 'activities' },
  activities:    { yes: 2,           no: 'symptoms'   },
  symptoms:      { yes: 1,           no: 0            },
};

// ─── Visual tokens ────────────────────────────────────────────────────────────

/** Bottom-drawer severity tokens — CALCULATOR_SPEC.md §6 */
const GRADE_TOKENS: Record<MRSGrade, SeverityTokens> = {
  0: { borderColor: '#e2e8f0', headerBg: 'bg-white',      headerHover: 'hover:bg-slate-50',   labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',   statClass: 'text-sm font-medium text-slate-700',   chevronClass: 'text-slate-400'   },
  1: { borderColor: '#a7f3d0', headerBg: 'bg-emerald-50', headerHover: 'hover:bg-emerald-100',labelClass: 'text-[10px] font-bold text-emerald-700 uppercase tracking-widest', statClass: 'text-sm font-medium text-emerald-700', chevronClass: 'text-emerald-600' },
  2: { borderColor: '#bae6fd', headerBg: 'bg-sky-50',     headerHover: 'hover:bg-sky-100',    labelClass: 'text-[10px] font-bold text-sky-700 uppercase tracking-widest',     statClass: 'text-sm font-medium text-sky-700',     chevronClass: 'text-sky-600'     },
  3: { borderColor: '#fed7aa', headerBg: 'bg-amber-50',   headerHover: 'hover:bg-amber-100',  labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',   statClass: 'text-sm font-medium text-amber-700',   chevronClass: 'text-amber-600'   },
  4: { borderColor: '#fecaca', headerBg: 'bg-red-50',     headerHover: 'hover:bg-red-100',    labelClass: 'text-[10px] font-bold text-red-600 uppercase tracking-widest',     statClass: 'text-sm font-medium text-red-600',     chevronClass: 'text-red-500'     },
  5: { borderColor: '#fecaca', headerBg: 'bg-red-50',     headerHover: 'hover:bg-red-100',    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',     statClass: 'text-sm font-medium text-red-700',     chevronClass: 'text-red-600'     },
  6: { borderColor: '#e2e8f0', headerBg: 'bg-slate-100',  headerHover: 'hover:bg-slate-200',  labelClass: 'text-[10px] font-bold text-slate-500 uppercase tracking-widest',   statClass: 'text-sm font-medium text-slate-600',   chevronClass: 'text-slate-500'   },
};

/** Badge (circle) classes per grade */
const GRADE_BADGE: Record<MRSGrade, string> = {
  0: 'bg-slate-100  text-slate-600',
  1: 'bg-emerald-100 text-emerald-700',
  2: 'bg-sky-100    text-sky-700',
  3: 'bg-amber-100  text-amber-700',
  4: 'bg-red-100    text-red-600',
  5: 'bg-red-200    text-red-700',
  6: 'bg-slate-200  text-slate-600',
};

/** Text color per grade */
const GRADE_TEXT: Record<MRSGrade, string> = {
  0: 'text-slate-700',
  1: 'text-emerald-700',
  2: 'text-sky-700',
  3: 'text-amber-700',
  4: 'text-red-600',
  5: 'text-red-700',
  6: 'text-slate-600',
};

// ─── Main component ───────────────────────────────────────────────────────────

const MrsCalculator: React.FC = () => {

  // ── State ──────────────────────────────────────────────────────────────────
  const [grade,         setGrade]         = useState<MRSGrade | null>(null);
  const [context,       setContext]       = useState<MRSContext>('pre-stroke');
  const [mode,          setMode]          = useState<MRSMode>('direct');
  const [interviewStep, setInterviewStep] = useState<InterviewStep>('walk');
  const [justCompleted, setJustCompleted] = useState(false);
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);

  const wasCompleteRef = useRef(false);

  // ── Hooks ──────────────────────────────────────────────────────────────────
  const { handleBack }                     = useNavigationSource();
  const { toggleFavorite, isFavorite }     = useFavorites();
  const { recordView }                     = useRecents();
  const { trackResult, resetTracking }     = useCalculatorAnalytics('mrs');

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

  // Publish drawer floor height so FeedbackButton lifts above the drawer.
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

  // ── Discovery animation — fires once per completion ────────────────────────
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
  const handleGradeSelect = useCallback((g: MRSGrade) => {
    setGrade(g);
    if (mode === 'guided') {
      // In guided mode open the drawer immediately on result
      setTimeout(() => setDrawerOpen(true), 50);
    }
  }, [mode, setDrawerOpen]);

  const handleInterviewAnswer = useCallback((answer: boolean) => {
    const { yes, no } = TRANSITIONS[interviewStep];
    const next = answer ? yes : no;
    if (typeof next === 'number') {
      handleGradeSelect(next as MRSGrade);
    } else {
      setInterviewStep(next);
    }
  }, [interviewStep, handleGradeSelect]);

  const switchMode = useCallback((newMode: MRSMode) => {
    setMode(newMode);
    setGrade(null);
    setInterviewStep('walk');
    resetDrawer();
  }, [resetDrawer]);

  const switchContext = useCallback((newCtx: MRSContext) => {
    setContext(newCtx);
    // Keep the grade — just re-interpret it
  }, []);

  const buildEmrText = useCallback(() => {
    if (grade === null) return 'mRS: Not yet selected.';
    const g   = MRS_GRADES[grade];
    const ctx = context === 'pre-stroke' ? 'Pre-stroke mRS' : 'mRS';
    return [
      `${ctx}: ${grade} — ${g.label}`,
      g.definition + '.',
    ].join('\n');
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

  // Restore from saved case
  useCaseReload({
    payloadKey: 'mrs',
    restore: (payload) => {
      if (payload.grade !== undefined) setGrade(payload.grade as MRSGrade);
      if (payload.context) setContext(payload.context as MRSContext);
    },
    onCaseLoaded: setCurrentCaseId,
    onSuccess: (initials) => showToast(`Opened ${initials} from My Cases`, 2500),
  });

  // ── Derived display tokens ─────────────────────────────────────────────────
  const tokens    = grade !== null ? GRADE_TOKENS[grade] : null;
  const gradeData = grade !== null ? MRS_GRADES[grade]   : null;

  // ── Drawer content ─────────────────────────────────────────────────────────
  const DrawerContent: React.FC = () => {
    if (grade === null || gradeData === null) return null;

    const isPrestroke = context === 'pre-stroke';

    /** Clinical interpretation block — tagged for claim registry */
    const renderInterpretation = () => {
      if (grade === 6) return null;

      let headline = '';
      let body     = '';

      if (isPrestroke) {
        if (grade <= 1) {
          headline = 'Standard EVT and IVT eligibility';
          body     =
            'Prestroke mRS 0–1 satisfies the baseline-function criterion for EVT across standard and extended time-windows, and for IVT within 4.5 h, per AHA/ASA 2026. No baseline-disability exclusion applies at this grade.';
        } else if (grade === 2) {
          headline = 'Borderline — clinical judgment required';
          body     =
            'Most landmark EVT trials (DAWN, DEFUSE-3, SELECT-2, ANGEL-ASPECT) used prestroke mRS 0–1 as an inclusion criterion. Prestroke mRS 2 is a relative contraindication; individual institutions and guidelines vary. Document the discussion if proceeding.';
        } else {
          headline = 'High baseline disability — goals-of-care discussion';
          body     =
            'Standard EVT and IVT trials excluded prestroke mRS ≥2 as routine care. At mRS 3–5, a goals-of-care and expected-outcome discussion with the patient and family is appropriate before committing to acute intervention.';
        }
      } else {
        // Current / outcome context
        if (grade <= 2) {
          headline = '"Good outcome" — functional independence';
          body     =
            'mRS 0–2 is the standard "good outcome" definition in acute stroke RCTs (NINDS tPA, DAWN, DEFUSE-3, SELECT-2). At 90 days, mRS ≤2 represents independent function.';
        } else if (grade === 3) {
          headline = 'Dependent for some activities; ambulatory';
          body     =
            'mRS 3 falls below the mRS 0–2 "good outcome" threshold used in most stroke trials, but the patient retains independent ambulation. Relevant to rehabilitation goal-setting and trajectory discussions.';
        } else {
          headline = 'Dependent — poor functional outcome range';
          body     =
            'mRS 4–5 corresponds to the "poor outcome" range used in stroke trial endpoint analyses. Rehabilitation ceiling and long-term care planning discussions are relevant at this stage.';
        }
      }

      // Two separate elements with static data-claim attributes so the
      // pre-commit scanner can locate both tags via literal string match.
      if (isPrestroke) {
        return (
          <div
            data-claim="mrs-prestroke-evt-eligibility"
            className="pt-4 border-t border-slate-100 mt-4"
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
          className="pt-4 border-t border-slate-100 mt-4"
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
          <div className="flex items-center gap-3 mb-1">
            <span className={`w-9 h-9 flex items-center justify-center rounded-full text-base font-bold flex-shrink-0 ${GRADE_BADGE[grade]}`}>
              {grade}
            </span>
            <p className={`text-lg font-semibold leading-tight ${GRADE_TEXT[grade]}`}>
              {gradeData.label}
            </p>
          </div>
          <p className="text-sm text-slate-500 mb-4 ml-12">{gradeData.definition}</p>

          {/* Clinical interpretation */}
          {renderInterpretation()}

          {/* Full scale reference — data-claim for registry */}
          <div
            data-claim="mrs-grade-definitions"
            className="mt-5 pt-4 border-t border-slate-100"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Scale reference
            </div>
            <div className="space-y-1">
              {MRS_GRADES.map(({ grade: g, label }) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`w-full flex items-center gap-3 py-1.5 px-2 rounded-lg text-left transition-colors ${
                    g === grade ? 'bg-slate-100' : 'hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${GRADE_BADGE[g]}`}>
                    {g}
                  </span>
                  <span className={`text-sm ${g === grade ? 'font-semibold text-slate-900' : 'text-slate-500'}`}>
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Copy button */}
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

  // ── Guided interview question display ──────────────────────────────────────
  const currentQuestion = INTERVIEW_QUESTIONS[interviewStep];
  const questionText    = context === 'pre-stroke'
    ? currentQuestion.preStroke
    : currentQuestion.current;

  // ── Collapsed drawer stat ──────────────────────────────────────────────────
  const collapsedStat = grade !== null
    ? `mRS ${grade} — ${MRS_GRADES[grade].label}`
    : '';

  // ── Header score badge ─────────────────────────────────────────────────────
  const renderHeaderBadge = () => {
    if (grade === null) {
      return (
        <>
          <span className="text-2xl font-semibold text-slate-900 tabular-nums leading-none">—</span>
          <span className="text-slate-400 text-sm leading-none">/ 6</span>
        </>
      );
    }
    return (
      <>
        <span className={`text-2xl font-semibold tabular-nums leading-none ${GRADE_TEXT[grade]}`}>
          {grade}
        </span>
        <span className="text-slate-400 text-sm leading-none">/ 6</span>
        {grade <= 1 && (
          <span className={`text-xs font-medium ml-1.5 ${context === 'pre-stroke' ? 'text-emerald-700' : 'text-emerald-700'}`}>
            {context === 'pre-stroke' ? 'EVT eligible' : 'Good outcome'}
          </span>
        )}
        {grade === 2 && context === 'pre-stroke' && (
          <span className="text-xs font-medium text-sky-700 ml-1.5">Borderline</span>
        )}
        {grade >= 3 && grade < 6 && (
          <span className={`text-xs font-medium ml-1.5 ${grade >= 4 ? 'text-red-600' : 'text-amber-700'}`}>
            {grade >= 4 ? 'Dependent' : 'Mod. disability'}
          </span>
        )}
      </>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <h1 className="sr-only">mRS Calculator — modified Rankin Scale for Stroke Disability</h1>

      {/* ── Sticky header — §1.1 ──────────────────────────────────────────── */}
      <CalculatorHeader
        name="modified Rankin Scale"
        scoreDisplay={renderHeaderBadge()}
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

      {/* ── Main scrollable content — §1.2 ───────────────────────────────── */}
      <main className="max-w-2xl mx-auto px-5 pt-6 pb-4">

        {/* ── Context + Mode toggles ──────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-3 mb-4">

          {/* Context: Pre-stroke / Current */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => switchContext('pre-stroke')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                context === 'pre-stroke'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Pre-stroke
            </button>
            <button
              type="button"
              onClick={() => switchContext('current')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                context === 'current'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Current
            </button>
          </div>

          {/* Mode: Direct / Guided */}
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => switchMode('direct')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                mode === 'direct'
                  ? 'bg-white text-slate-900 shadow-sm'
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
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Guided
            </button>
          </div>
        </div>

        {/* Context label */}
        <p className="text-xs text-slate-400 mb-5 leading-relaxed">
          {context === 'pre-stroke'
            ? 'Capturing function before the current event — used for EVT and IVT eligibility triage.'
            : 'Capturing current or recent function — for outcome tracking or clinic follow-up.'}
          {mode === 'guided' && (
            <span className="ml-1 text-slate-400">Answer YES / NO to reach a grade.</span>
          )}
        </p>

        {/* ── DIRECT MODE: 7-grade radio list ──────────────────────────────── */}
        {mode === 'direct' && (
          <section aria-label="mRS grade selection">
            <div
              role="radiogroup"
              aria-label="Modified Rankin Scale — select a grade"
              className="divide-y divide-slate-200"
            >
              {MRS_GRADES.map((g) => {
                const isSelected = grade === g.grade;
                return (
                  <button
                    key={g.grade}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => handleGradeSelect(g.grade)}
                    className={
                      isSelected
                        ? 'selected-option w-full flex items-start gap-3 py-3.5 pl-4 pr-3 text-left rounded-lg'
                        : 'w-full flex items-start gap-3 py-3.5 px-3 text-left hover:bg-slate-50/60 rounded-lg transition-colors'
                    }
                  >
                    {/* Grade badge */}
                    <span className={`mt-0.5 w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${
                      isSelected ? GRADE_BADGE[g.grade] : 'bg-slate-100 text-slate-500'
                    }`}>
                      {g.grade}
                    </span>

                    {/* Label + definition + example */}
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm font-semibold ${isSelected ? GRADE_TEXT[g.grade] : 'text-slate-900'}`}>
                        {g.label}
                      </span>
                      <span className="block text-xs text-slate-500 mt-0.5 leading-snug">
                        {g.definition}
                      </span>
                      {g.example && (
                        <span className="block text-[11px] text-slate-400 mt-0.5 leading-snug italic">
                          {g.example}
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {/* ── GUIDED MODE: interview not yet complete ───────────────────────── */}
        {mode === 'guided' && grade === null && (
          <section aria-label="Guided mRS structured interview">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">

              {/* Question */}
              <div className="px-5 pt-5 pb-5">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                  {context === 'pre-stroke' ? 'Before this event' : 'Currently'}
                </p>
                <p className="text-base font-semibold text-slate-900 leading-snug">
                  {questionText}
                </p>
                {currentQuestion.hint && (
                  <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">
                    {currentQuestion.hint}
                  </p>
                )}
              </div>

              {/* YES / NO tap targets */}
              <div className="grid grid-cols-2 border-t border-slate-200 divide-x divide-slate-200">
                <button
                  type="button"
                  onClick={() => handleInterviewAnswer(false)}
                  className="py-4 text-sm font-semibold text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors min-h-[56px]"
                >
                  No
                </button>
                <button
                  type="button"
                  onClick={() => handleInterviewAnswer(true)}
                  className="py-4 text-sm font-semibold text-neuro-600 hover:bg-neuro-50 active:bg-neuro-100 transition-colors min-h-[56px]"
                >
                  Yes
                </button>
              </div>
            </div>

            {/* Restart only visible after first answer */}
            {interviewStep !== 'walk' && (
              <button
                type="button"
                onClick={() => setInterviewStep('walk')}
                className="mt-3 text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline transition-colors"
              >
                ← Restart interview
              </button>
            )}
          </section>
        )}

        {/* ── GUIDED MODE: result card ──────────────────────────────────────── */}
        {mode === 'guided' && grade !== null && (
          <section aria-label="Interview result">
            <div
              className="rounded-2xl border p-5 bg-white"
              style={{ borderColor: GRADE_TOKENS[grade].borderColor }}
            >
              <div className="flex items-center gap-3">
                <span className={`w-11 h-11 flex items-center justify-center rounded-full text-lg font-bold flex-shrink-0 ${GRADE_BADGE[grade]}`}>
                  {grade}
                </span>
                <div>
                  <p className={`font-semibold ${GRADE_TEXT[grade]}`}>{MRS_GRADES[grade].label}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{MRS_GRADES[grade].definition}</p>
                </div>
              </div>
              <p className="text-xs text-slate-400 mt-3 italic leading-snug">
                {MRS_GRADES[grade].example}
              </p>
              <button
                type="button"
                onClick={() => { setGrade(null); setInterviewStep('walk'); resetDrawer(); }}
                className="mt-4 text-xs text-slate-400 hover:text-slate-600 underline-offset-2 hover:underline transition-colors"
              >
                ← Retake interview
              </button>
            </div>
          </section>
        )}

        {/* ── Footer — citation + disclaimer ───────────────────────────────── */}
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
                Improving the assessment of outcomes in stroke: use of a structured interview
                to assign grades on the modified Rankin Scale.{' '}
                <em>Stroke</em>. 2002;33(9):2243–2246.
              </cite>
            </>
          }
          disclaimer="Educational use only. Not a substitute for clinical judgment."
        />

        {/* Spacer prevents content hiding behind the drawer */}
        <div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} aria-hidden="true" />

      </main>

      {/* ── Bottom drawer — fixed above mobile nav §1.3 ───────────────────── */}
      <CalculatorDrawer
        state={drawerState}
        tokens={tokens}
        isExpanded={drawerOpen}
        onToggle={() => setDrawerOpen(open => !open)}
        ariaContentId="mrs-drawer-content"
        stateAText={{ label: 'No grade selected', hint: 'Tap a grade above' }}
        stateBText={{ label: '—', hint: '' }}
        collapsedStat={collapsedStat}
        justCompleted={justCompleted}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Toast notification ─────────────────────────────────────────────── */}
      <CalculatorToast message={toast} />
    </>
  );
};

export default MrsCalculator;
