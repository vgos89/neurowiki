/**
 * ClinicHeadachePathwayV4 — the v4 "live differential narrowing" headache pathway.
 *
 * Sibling rebuild of ClinicHeadachePathway.tsx against the approved v4 mockup
 * (docs/specs/mockups/headache-pathway-v4-flow.html) + the gated specs
 * (docs/reviews/medsci-headache-v4-clinical-spec.md, clinical-headache-v4-spec.md,
 * arch-headache-v4-full-rebuild.md). Built wired to nothing; the live route flips
 * to it in the final commit (architect Q6 — every interim commit ships a coherent
 * page, revert is a one-line import flip).
 *
 * State model (architect Q1): one page machine.
 *   phase: 'safety' | 'questions' | 'result'
 *   answers: per-question option ids — the SINGLE source the chip set derives from.
 *            Revisiting a question replaces that question's entry and lets useMemo
 *            re-rank; NO cascade-clear, no wiped downstream answers.
 *   selected = ⋃ chips(answers) ∪ redFlags  → matches = evaluate(selected)
 *            → banded = bandPhenotypes(matches) ; activeQuestions = getActiveQuestions(selected).
 *   "See result", "Back", and the live differential all read the SAME `banded` memo.
 *
 * No clinical claim is authored here; every clinical string comes from the engine,
 * the gated question config, or the verbatim-mounted management block. No percentages.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import {
  evaluateHeadachePhenotypes,
  anyRedFlagActive,
  type ChipId,
} from '../data/clinicHeadacheData';
import { bandPhenotypes } from '../data/headacheBanding';
import {
  CORE_QUESTIONS,
  CONDITIONAL_BRANCHES,
  getActiveQuestions,
  type HeadacheQuestion as HeadacheQuestionConfig,
  type AnswerOption,
} from '../data/headacheQuestions';
import { HeadacheSafetyScreen } from '../components/pathways/headache/HeadacheSafetyScreen';
import { HeadacheDifferentialPanel } from '../components/pathways/headache/HeadacheDifferentialPanel';
import { HeadacheQuestion } from '../components/pathways/headache/HeadacheQuestion';
import { HeadacheResultV4 } from '../components/pathways/headache/HeadacheResultV4';

// Question lookup across the core spine + every branch.
const QUESTION_BY_ID: Map<string, HeadacheQuestionConfig> = new Map();
for (const q of CORE_QUESTIONS) QUESTION_BY_ID.set(q.id, q);
for (const b of CONDITIONAL_BRANCHES) QUESTION_BY_ID.set(b.question.id, b.question);

const CORE_SCREEN_COUNT = new Set(CORE_QUESTIONS.map(q => q.screen)).size; // 6

type Phase = 'safety' | 'questions' | 'result';

const ClinicHeadachePathwayV4: React.FC = () => {
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite('headache-clinic');

  const [phase, setPhase] = useState<Phase>('safety');
  const [answers, setAnswers] = useState<Record<string, string[]>>({});
  const [redFlags, setRedFlags] = useState<Set<ChipId>>(new Set());
  const [questionIndex, setQuestionIndex] = useState(0);
  const [setAsideOpen, setSetAsideOpen] = useState(false);
  const [copyConfirm, setCopyConfirm] = useState(false);

  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'headache-clinic',
      title: 'Clinic Headache Pathway',
      subtitle: 'ICHD-3 phenotype + management',
      category: 'severe-headache',
      trail: 'Live differential',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Single source: answers (+ red flags) → selected → matches → banded. ──
  const selected = useMemo(() => {
    const s = new Set<ChipId>();
    for (const [qid, optIds] of Object.entries(answers)) {
      const q = QUESTION_BY_ID.get(qid);
      if (!q) continue;
      for (const oid of optIds) {
        const opt = q.options.find(o => o.id === oid);
        opt?.chips.forEach(c => s.add(c));
      }
    }
    redFlags.forEach(f => s.add(f));
    return s;
  }, [answers, redFlags]);

  const matches = useMemo(() => evaluateHeadachePhenotypes(selected), [selected]);
  const banded = useMemo(() => bandPhenotypes(matches), [matches]);
  const activeQuestions = useMemo(() => getActiveQuestions(selected), [selected]);
  const redFlagActive = useMemo(() => anyRedFlagActive(selected), [selected]);

  // Clamp the index if the active-question list shrank (a branch un-fired).
  const safeIndex = Math.min(questionIndex, Math.max(0, activeQuestions.length - 1));
  const currentQuestion = activeQuestions[safeIndex];
  const totalScreens = Math.max(CORE_SCREEN_COUNT, ...activeQuestions.map(q => q.screen));

  // ── Mutators ──────────────────────────────────────────────────────────────
  const setAnswer = (qid: string, optIds: string[]) =>
    setAnswers(prev => ({ ...prev, [qid]: optIds }));

  const toggleMulti = (qid: string, optId: string) =>
    setAnswers(prev => {
      const cur = new Set(prev[qid] ?? []);
      if (cur.has(optId)) cur.delete(optId);
      else cur.add(optId);
      return { ...prev, [qid]: [...cur] };
    });

  const advance = () => {
    if (safeIndex >= activeQuestions.length - 1) setPhase('result');
    else setQuestionIndex(safeIndex + 1);
  };
  const back = () => {
    if (safeIndex === 0) setPhase('safety');
    else setQuestionIndex(safeIndex - 1);
  };

  const handleReset = () => {
    setAnswers({});
    setRedFlags(new Set());
    setQuestionIndex(0);
    setSetAsideOpen(false);
    setPhase('safety');
  };

  const handleCopy = () => {
    const lead = banded.leading[0]?.match;
    const summary = redFlagActive
      ? 'Clinic Headache | NeuroWiki\nSNNOOP10 red flag present, secondary workup indicated.'
      : lead
        ? `Clinic Headache | NeuroWiki\n${lead.name} (${lead.displaySection}). Not a diagnosis.`
        : 'Clinic Headache | NeuroWiki\nDifferential in progress.';
    navigator.clipboard?.writeText(summary).catch(() => {});
    setCopyConfirm(true);
    setTimeout(() => setCopyConfirm(false), 2000);
  };

  // ── Render ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-slate-50">
      <PathwayHeader
        pathwayLabel="Headache pattern finder"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={() => toggleFavorite('headache-clinic')}
        onReset={handleReset}
        onCopy={handleCopy}
        copyConfirm={copyConfirm}
      />

      {/* ICHD-3 context caption row (matches the approved mockup). */}
      <div className="text-[12px] text-slate-500 leading-snug px-4 py-2 border-b border-slate-100 bg-white">
        <span className="inline-flex items-center rounded-full bg-neuro-50 text-neuro-700 text-[11px] font-semibold px-2 py-0.5 mr-1.5 align-middle">
          ICHD-3
        </span>
        matches features to criteria to narrow the differential. Not a diagnosis.
      </div>

      <main className="max-w-2xl mx-auto px-5 pt-5 pb-24">
        {phase === 'safety' && (
          <HeadacheSafetyScreen
            onNoFlags={() => {
              setQuestionIndex(0);
              setPhase('questions');
            }}
            onFlagsConfirmed={flags => {
              setRedFlags(flags);
              setPhase('result');
            }}
          />
        )}

        {phase === 'questions' && currentQuestion && (
          <div className="space-y-5">
            <HeadacheDifferentialPanel
              banded={banded}
              setAsideOpen={setAsideOpen}
              onToggleSetAside={() => setSetAsideOpen(o => !o)}
            />
            <HeadacheQuestion
              question={currentQuestion}
              selectedOptionIds={new Set(answers[currentQuestion.id] ?? [])}
              position={currentQuestion.screen}
              total={totalScreens}
              onSelectSingle={opt => {
                setAnswer(currentQuestion.id, [opt.id]);
                advance();
              }}
              onToggleMulti={(opt: AnswerOption) => toggleMulti(currentQuestion.id, opt.id)}
              onContinue={advance}
              onSkip={advance}
            />
          </div>
        )}

        {phase === 'result' && (
          <HeadacheResultV4
            banded={banded}
            selected={selected}
            redFlagActive={redFlagActive}
            redFlags={redFlags}
            onReconsider={() => {
              setQuestionIndex(Math.max(0, activeQuestions.length - 1));
              setPhase('questions');
            }}
          />
        )}
      </main>

      {/* Bottom bar — only during the question phase (Back · progress · See result).
          Sits above the global MobileBottomNav (z-40, 60px + safe-area).
          House pattern: fixed bottom-[4.5rem] md:static z-30, matching EvtPathway.
          Inner padding uses safe-area-inset-bottom so the content clears the home
          indicator on notched iPhones. */}
      {phase === 'questions' && (
        <div className="fixed bottom-[4.5rem] md:static inset-x-0 bg-white/95 backdrop-blur-sm border-t border-slate-100 px-4 py-3 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] md:shadow-none">
          {/* Right inset clears the global feedback bubble (fixed bottom-24 right-4,
              ~44px icon-only on phones, wider with its label at sm+). The bar is
              fixed until md, so the inset tracks the bubble width; zero on desktop
              where the bar reflows into normal flow. */}
          <div className="max-w-2xl mx-auto flex items-center justify-between pr-14 sm:pr-28 md:pr-0 pb-[max(0px,env(safe-area-inset-bottom,0px))] md:pb-0">
            <button
              type="button"
              onClick={back}
              className="p-2 -m-1 text-slate-500 hover:text-slate-900 transition-colors flex items-center gap-1 text-[13px] font-medium min-h-[44px]"
            >
              <ChevronLeft className="w-[18px] h-[18px]" aria-hidden="true" />
              Back
            </button>
            <div className="flex items-center gap-2" aria-label={`Screen ${currentQuestion?.screen ?? 1} of ${totalScreens}`}>
              {Array.from({ length: totalScreens }).map((_, i) => (
                <span
                  key={i}
                  className={`w-2 h-2 rounded-full ${i < (currentQuestion?.screen ?? 1) ? 'bg-neuro-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPhase('result')}
              className="text-[13px] font-semibold text-neuro-600 hover:text-neuro-700 flex items-center gap-0.5 min-h-[44px] px-2"
            >
              See result
              <ChevronRight className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClinicHeadachePathwayV4;
