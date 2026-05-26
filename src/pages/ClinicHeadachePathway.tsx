/**
 * Clinic Headache Pathway — adaptive single-question interview.
 *
 * Rewritten 2026-05-25 (Phase 3 of 3, Class D-clinical) to replace the
 * prior flat chip-picker with an adaptive single-question flow that walks
 * the user through ICHD-3 differential by asking one question at a time
 * and surfacing the result via PathwayBottomDrawer.
 *
 * Architecture:
 *   - HEADACHE_QUESTIONS (src/data/clinicHeadacheQuestions.ts) — decision tree
 *   - evaluateHeadachePhenotypes (src/data/clinicHeadacheData.ts) — pure mapper
 *   - QuestionScreen, DifferentialBar, PhenotypePickerSheet — UI primitives
 *   - PathwayBottomDrawer (state + customContent) — interpretation surface
 *
 * State machine (FlowState):
 *   - intro: pre-flow; drawer State A
 *   - question(id): mid-flow; drawer State B with DifferentialBar
 *   - workup: red-flag short-circuit; drawer State C red
 *   - result(phenotypeId): phenotype reached; drawer State C tier-coloured
 *   - power-user-pick: phenotype-select sheet open over current content
 *
 * Claim IDs preserved from the prior cutover:
 *   - clinic-headache-ichd3-{migraine,tension,cluster,hemicrania,ndph}-criteria
 *     (rendered in State C decision card per phenotype)
 *   - clinic-headache-pitfall-mig-vs-tth (rendered in mapper when both surface)
 *   - clinic-headache-{preventive-threshold,cgrp-escalation,moh-gepant-safe}
 *     (rendered in State C for migraine phenotypes)
 *   - clinic-headache-tension-{acute-management,preventive}
 *     (rendered in State C for TTH phenotypes)
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, Lightbulb, RotateCcw } from 'lucide-react';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { PathwayBottomDrawer } from '../components/pathways/PathwayBottomDrawer';
import { QuestionScreen } from '../components/pathways/QuestionScreen';
import { DifferentialBar } from '../components/pathways/DifferentialBar';
import { PhenotypePickerSheet } from '../components/pathways/PhenotypePickerSheet';
import { useFavorites } from '../hooks/useFavorites';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { useRecents } from '../hooks/useRecents';
import { useTeachMode } from '../hooks/useTeachMode';
import {
  HEADACHE_QUESTIONS,
  POWER_USER_PHENOTYPES,
  START_QUESTION_ID,
  chipsForAnswer,
  getQuestion,
  nextNode,
  type Answer,
  type QuestionId,
} from '../data/clinicHeadacheQuestions';
import {
  evaluateHeadachePhenotypes,
  HEADACHE_PHENOTYPES,
  type ChipId,
  type PhenotypeId,
  type PhenotypeMatch,
} from '../data/clinicHeadacheData';

// ─── State machine ────────────────────────────────────────────────────────

type FlowState =
  | { type: 'intro' }
  | { type: 'question'; id: QuestionId }
  | { type: 'workup' }
  | { type: 'result'; phenotypeId: PhenotypeId };

interface HistoryEntry {
  questionId: QuestionId;
  answerIds: string[];
  chipsAdded: ChipId[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────

function topMatch(matches: PhenotypeMatch[]): PhenotypeMatch | undefined {
  return matches[0];
}

function tierFromMatch(match: PhenotypeMatch | undefined): 'Low' | 'Intermediate' | 'High' | 'None' {
  if (!match) return 'None';
  if (match.matchStrength === 'full') return 'Low';
  if (match.matchStrength === 'probable') return 'Intermediate';
  return 'High';
}

// Per-phenotype management blocks are rendered as JSX with literal
// data-claim attributes per phenotype (claim coverage is checked statically
// by scripts/check-claims.ts). See PhenotypeManagement below.

// ─── Component ────────────────────────────────────────────────────────────

const ClinicHeadachePathway: React.FC = () => {
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const isFav = isFavorite('headache-clinic');
  const [teachMode, toggleTeachMode] = useTeachMode();
  const topRef = useRef<HTMLDivElement>(null);

  // FlowState + chip accumulator + answer history (for back navigation)
  const [flow, setFlow] = useState<FlowState>({ type: 'intro' });
  const [selectedChips, setSelectedChips] = useState<Set<ChipId>>(new Set());
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  // Track multi-check answer selections for the current question
  const [pendingAnswers, setPendingAnswers] = useState<string[]>([]);
  const [pendingChips, setPendingChips] = useState<ChipId[]>([]);
  const [powerUserOpen, setPowerUserOpen] = useState(false);

  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'headache-clinic',
      title: 'Clinic Headache Pathway',
      subtitle: 'Adaptive ICHD-3 interview',
      category: 'severe-headache',
      trail: 'Adaptive',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Derived: phenotype matches ───────────────────────────────────────────
  const matches = useMemo(() => evaluateHeadachePhenotypes(selectedChips), [selectedChips]);

  // Differential percentages for the State B bar
  const differentialItems = useMemo(() => {
    return matches
      .filter(m => m.matchStrength !== 'partial' || m.criteriaMet >= 1)
      .slice(0, 4)
      .map(m => ({
        id: m.phenotypeId,
        name: m.name,
        section: m.ichd3Section,
        percent: Math.round((m.criteriaMet / m.criteriaTotal) * 100),
      }));
  }, [matches]);

  // Pitfall: migraine + TTH both present
  const showMigTthPitfall = useMemo(() => {
    const ids = new Set(matches.map(m => m.phenotypeId));
    return (ids.has('migraine-without-aura') || ids.has('migraine-with-aura')) &&
           (ids.has('episodic-tth') || ids.has('chronic-tth'));
  }, [matches]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStart = () => {
    setFlow({ type: 'question', id: START_QUESTION_ID });
    setPendingAnswers([]);
    setPendingChips([]);
  };

  const handleReset = () => {
    setFlow({ type: 'intro' });
    setSelectedChips(new Set());
    setHistory([]);
    setPendingAnswers([]);
    setPendingChips([]);
    setPowerUserOpen(false);
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleBackStep = () => {
    if (history.length === 0) {
      // Back to intro
      setFlow({ type: 'intro' });
      setPendingAnswers([]);
      setPendingChips([]);
      return;
    }
    const last = history[history.length - 1];
    // Remove chips that were added by the last step
    setSelectedChips(prev => {
      const next = new Set(prev);
      for (const chip of last.chipsAdded) next.delete(chip);
      return next;
    });
    setHistory(prev => prev.slice(0, -1));
    setFlow({ type: 'question', id: last.questionId });
    setPendingAnswers([]);
    setPendingChips([]);
  };

  const handleAnswer = (answerId: string) => {
    if (flow.type !== 'question') return;
    const question = getQuestion(flow.id);
    if (!question) return;
    const answer = question.answers.find(a => a.id === answerId) as Answer | undefined;
    if (!answer) return;

    if (question.type === 'multi-check') {
      // Determine if this is a "commit" answer (leadsTo !== current question)
      const isCommit = answer.leadsTo !== flow.id;
      if (isCommit) {
        // Commit: apply pending chips + the commit answer's own chips
        const allChips = [...pendingChips, ...answer.selects];
        const newSet = new Set(selectedChips);
        for (const c of allChips) newSet.add(c);
        setSelectedChips(newSet);
        setHistory(h => [...h, { questionId: flow.id, answerIds: [...pendingAnswers, answer.id], chipsAdded: allChips }]);
        setPendingAnswers([]);
        setPendingChips([]);
        advance(answer);
      } else {
        // Toggle this answer in the pending set
        if (pendingAnswers.includes(answer.id)) {
          setPendingAnswers(prev => prev.filter(id => id !== answer.id));
          setPendingChips(prev => prev.filter(c => !answer.selects.includes(c)));
        } else {
          setPendingAnswers(prev => [...prev, answer.id]);
          setPendingChips(prev => [...prev, ...answer.selects]);
        }
      }
    } else {
      // single-choice — commit immediately
      const chipsAdded = answer.selects;
      const newSet = new Set(selectedChips);
      for (const c of chipsAdded) newSet.add(c);
      setSelectedChips(newSet);
      setHistory(h => [...h, { questionId: flow.id, answerIds: [answer.id], chipsAdded }]);
      advance(answer);
    }
  };

  const advance = (answer: Answer) => {
    const next = answer.leadsTo;
    if (next === 'evaluate') {
      const top = topMatch(evaluateHeadachePhenotypes(new Set([...selectedChips, ...answer.selects, ...pendingChips])));
      if (top) setFlow({ type: 'result', phenotypeId: top.phenotypeId });
      else setFlow({ type: 'workup' });
    } else if (next === 'workup') {
      setFlow({ type: 'workup' });
    } else {
      setFlow({ type: 'question', id: next as QuestionId });
      setPendingAnswers([]);
      setPendingChips([]);
    }
  };

  const handlePowerUserPick = (phenotypeId: string) => {
    setPowerUserOpen(false);
    setFlow({ type: 'result', phenotypeId: phenotypeId as PhenotypeId });
  };

  // ── Drawer content per FlowState ─────────────────────────────────────────
  const drawerState: 'A' | 'B' | 'C' =
    flow.type === 'intro' ? 'A'
    : flow.type === 'question' ? 'B'
    : 'C';

  const drawerTier: 'Low' | 'Intermediate' | 'High' | 'None' =
    flow.type === 'workup' ? 'High'
    : flow.type === 'result' ? tierFromMatch(topMatch(matches)) || 'Low'
    : 'None';

  const drawerCollapsedAction = (() => {
    if (flow.type === 'intro') return '';
    if (flow.type === 'question') {
      if (differentialItems.length === 0) return 'Answer the first question to see candidates';
      return differentialItems.slice(0, 2).map(d => `${d.name} ${d.percent}%`).join(' · ');
    }
    if (flow.type === 'workup') return 'Secondary headache workup required';
    if (flow.type === 'result') {
      const m = matches.find(x => x.phenotypeId === flow.phenotypeId);
      if (m) return `${m.matchStrength === 'full' ? 'Consistent with' : m.matchStrength === 'probable' ? 'Probable' : 'Partial'} ${m.name}`;
      const p = HEADACHE_PHENOTYPES.find(x => x.id === flow.phenotypeId);
      return p ? `Consistent with ${p.name}` : '';
    }
    return '';
  })();

  // ── Drawer custom content per FlowState ──────────────────────────────────
  const drawerCustomContent: React.ReactNode = (() => {
    if (flow.type === 'intro') return null;
    if (flow.type === 'question') {
      return (
        <div className="bg-white px-5 py-4 max-h-[40dvh] overflow-y-auto border-t border-slate-100">
          <DifferentialBar items={differentialItems} />
          {showMigTthPitfall && (
            <div
              data-claim="clinic-headache-pitfall-mig-vs-tth"
              role="note"
              aria-label="Pitfall: migraine vs TTH overlap"
              className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3"
            >
              <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-1">Pitfall — migraine vs TTH overlap</p>
              <p className="text-[12px] text-amber-900 leading-relaxed">
                Migraine (1.1 D) requires nausea/vomiting OR the photophobia+phonophobia pair. TTH (2.2 D) excludes nausea/vomiting and allows at most one of photo/phono. Mild migraine and TTH look similar; the pairing or any nausea tips toward migraine.
              </p>
            </div>
          )}
        </div>
      );
    }
    if (flow.type === 'workup') return <WorkupCard chips={selectedChips} />;
    if (flow.type === 'result') {
      const m = matches.find(x => x.phenotypeId === flow.phenotypeId);
      return <ResultCard match={m} phenotypeId={flow.phenotypeId} teachMode={teachMode} />;
    }
    return null;
  })();

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-dvh bg-slate-50 pb-32" ref={topRef}>
      <PathwayHeader
        pathwayLabel="Clinic Headache"
        onBack={handleBack}
        isFav={isFav}
        onFavToggle={() => toggleFavorite('headache-clinic')}
        onReset={handleReset}
        onCopy={() => { /* no-op for v1; could copy plan summary */ }}
      />

      <div className="max-w-xl mx-auto px-4 pt-4 space-y-4">

        {/* Disclaimer + Teach toggle */}
        <div className="rounded-xl border border-neuro-200 bg-neuro-50 p-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <p className="text-[13px] font-semibold text-neuro-800">Adaptive ICHD-3 interview</p>
              <p className="text-[12px] text-slate-700 leading-relaxed mt-1">
                The tool maps your inputs against ICHD-3 criteria to suggest the most consistent phenotype. It does not diagnose. Patient history of recurrent attacks and clinical judgement remain primary.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTeachMode}
              aria-pressed={teachMode}
              className={`
                flex items-center gap-1.5 rounded-full px-3 py-2 text-[12px] font-semibold
                transition-all touch-manipulation min-h-[44px] flex-shrink-0
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                ${teachMode
                  ? 'bg-neuro-600 text-white hover:bg-neuro-700'
                  : 'bg-white text-neuro-700 border border-neuro-300 hover:bg-neuro-50'}
              `}
            >
              <Lightbulb size={13} aria-hidden="true" />
              Teach {teachMode ? 'on' : 'off'}
            </button>
          </div>
        </div>

        {/* Intro */}
        {flow.type === 'intro' && (
          <div className="space-y-3">
            <div className="rounded-xl bg-white border border-slate-100 p-5" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}>
              <p className="text-[15px] font-semibold text-slate-900">Start the interview</p>
              <p className="text-[13px] text-slate-600 leading-relaxed mt-2">
                One question at a time. The candidate phenotypes update at the bottom as you answer. ~4-6 taps for most patients.
              </p>
              <button
                type="button"
                onClick={handleStart}
                className="
                  mt-4 w-full rounded-xl bg-neuro-600 hover:bg-neuro-700 text-white font-semibold
                  px-4 py-3 text-[14px] min-h-[56px] touch-manipulation
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                "
              >
                Begin →
              </button>
              <button
                type="button"
                onClick={() => setPowerUserOpen(true)}
                className="
                  mt-3 w-full text-center text-[12px] text-neuro-600 hover:text-neuro-700 hover:underline
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 rounded
                  min-h-[44px]
                "
              >
                I already know the diagnosis →
              </button>
            </div>
          </div>
        )}

        {/* Question screen */}
        {flow.type === 'question' && (() => {
          const q = getQuestion(flow.id);
          if (!q) return null;
          // For multi-check, show pending selections. For single-choice, empty selection (auto-advances).
          const selectedForUI = q.type === 'multi-check' ? pendingAnswers : [];
          return (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleBackStep}
                className="
                  inline-flex items-center gap-1 text-[12px] text-slate-500 hover:text-slate-700
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 rounded
                  min-h-[44px] px-1
                "
              >
                <ChevronLeft size={14} aria-hidden="true" />
                Back
              </button>
              <QuestionScreen
                questionId={q.id}
                prompt={q.prompt}
                type={q.type}
                answers={q.answers}
                selectedAnswerIds={selectedForUI}
                onAnswer={handleAnswer}
                teachMode={teachMode}
                helpText={q.helpText}
                ichd3Section={q.ichd3Section}
                onPowerUserExit={() => setPowerUserOpen(true)}
              />
            </div>
          );
        })()}

        {/* Workup / result rendered inside the drawer customContent — page area shows a brief recap */}
        {(flow.type === 'workup' || flow.type === 'result') && (
          <div className="rounded-xl bg-white border border-slate-100 p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Interview complete</p>
            <p className="text-[14px] text-slate-700 leading-relaxed">
              {flow.type === 'workup'
                ? 'A red flag was identified. Tap the drawer below for the recommended workup.'
                : 'A candidate phenotype was reached. Tap the drawer below for management.'}
            </p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleBackStep}
                className="
                  flex-1 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50
                  px-3 py-2 text-[13px] font-medium min-h-[44px] touch-manipulation
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                "
              >
                <ChevronLeft size={14} className="inline-block" aria-hidden="true" /> Edit answers
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="
                  flex-1 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50
                  px-3 py-2 text-[13px] font-medium min-h-[44px] touch-manipulation
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                "
              >
                <RotateCcw size={13} className="inline-block mr-1" aria-hidden="true" /> Start over
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Drawer */}
      <PathwayBottomDrawer
        pathwayName="Headache"
        tier={drawerTier}
        action={drawerCollapsedAction}
        state={drawerState}
        customContent={drawerCustomContent}
        stateBText={{ label: 'Mapping…', hint: `${selectedChips.size} feature${selectedChips.size === 1 ? '' : 's'} entered` }}
      />

      {/* Power-user phenotype picker */}
      <PhenotypePickerSheet
        open={powerUserOpen}
        options={POWER_USER_PHENOTYPES.map(p => ({ id: p.id, label: p.label, section: p.section }))}
        onPick={handlePowerUserPick}
        onClose={() => setPowerUserOpen(false)}
      />
    </div>
  );
};

// ─── Workup card ──────────────────────────────────────────────────────────

const WorkupCard: React.FC<{ chips: Set<ChipId> }> = ({ chips }) => {
  const flagDescriptions: { chip: ChipId; label: string; workup: string }[] = [
    { chip: 'rf-onset-sudden', label: 'Thunderclap onset', workup: 'Non-contrast CT head urgently. If negative within 6 h of onset, may rule out SAH; otherwise LP for xanthochromia. CTA brain for aneurysm.' },
    { chip: 'rf-neuro-deficit', label: 'Focal neurologic deficit', workup: 'Urgent MRI brain with contrast or non-contrast CT if MRI not available. EEG if seizure suspected.' },
    { chip: 'rf-systemic', label: 'Systemic features (fever, weight loss)', workup: 'CBC, ESR, CRP, blood cultures if febrile. LP after imaging if meningitis suspected.' },
    { chip: 'rf-older-age-onset', label: 'First-ever headache after age 50', workup: 'MRI brain with contrast. ESR + CRP to evaluate giant cell arteritis; temporal artery biopsy if clinical suspicion high.' },
    { chip: 'rf-pregnancy', label: 'Pregnancy or postpartum', workup: 'MRI brain (avoid contrast unless essential). MRV for venous sinus thrombosis. Consider PRES, pre-eclampsia/eclampsia, RCVS.' },
    { chip: 'rf-posttraumatic', label: 'Posttraumatic onset', workup: 'CT head non-contrast. MRI with susceptibility-weighted imaging for microbleeds if subacute. Vestibular and concussion evaluation.' },
    { chip: 'rf-papilloedema', label: 'Papilloedema', workup: 'MRI brain with MRV (rule out venous sinus thrombosis, mass, IIH). LP with opening pressure after imaging.' },
    { chip: 'rf-valsalva', label: 'Triggered by Valsalva', workup: 'MRI brain to evaluate posterior fossa lesions (Chiari malformation, tumour, colloid cyst).' },
    { chip: 'rf-positional', label: 'Positional', workup: 'MRI brain with and without contrast to evaluate intracranial hypotension (dural enhancement) or hypertension.' },
    { chip: 'rf-pattern-change', label: 'Recent pattern change', workup: 'MRI brain with contrast. Re-evaluate ICHD-3 phenotype after imaging; consider secondary cause.' },
    { chip: 'rf-immune-pathology', label: 'Immunosuppression / HIV / cancer history', workup: 'MRI brain with contrast (rule out opportunistic infection, metastasis). LP with cytology if neoplastic meningitis suspected.' },
    { chip: 'rf-painkiller-overuse', label: 'Painkiller overuse', workup: 'Detailed analgesic history. Plan medication withdrawal alongside preventive initiation (ICHD-3 §8.2).' },
  ];
  const activeFlags = flagDescriptions.filter(f => chips.has(f.chip));
  return (
    <div className="bg-white px-5 py-4 max-h-[60dvh] overflow-y-auto border-t border-slate-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-red-700">Secondary-headache workup</p>
      <p className="text-[14px] font-semibold text-slate-900 mt-1">Do not assign a primary-headache phenotype until workup is complete.</p>
      <p className="text-[12px] text-slate-600 leading-relaxed mt-2">
        Per SNNOOP10 (Do et al. Neurology 2019), any red flag warrants secondary-cause evaluation before primary-headache classification.
      </p>
      {chips.has('rf-painkiller-overuse') && activeFlags.length === 1 && (
        <p className="text-[12px] text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-2.5 mt-2 leading-relaxed">
          <span className="font-semibold">Note on painkiller overuse:</span> medication-overuse headache (ICHD-3 §8.2) is a primary-headache complication, not a secondary cause. Imaging is not first-line. Plan medication withdrawal alongside preventive initiation.
        </p>
      )}
      <ul className="mt-4 space-y-3">
        {activeFlags.map(f => (
          <li key={f.chip} className="border-l-2 border-red-300 pl-3">
            <p className="text-[13px] font-semibold text-slate-900">{f.label}</p>
            <p className="text-[12px] text-slate-700 leading-relaxed mt-0.5">{f.workup}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Result card ──────────────────────────────────────────────────────────

// Small renderer used by every phenotype's criteria-met/missing block. The
// data-claim attribute is wired by the per-phenotype outer component below,
// so each claim ID appears as a literal in JSX for the static scanner.
const CriteriaList: React.FC<{ match: PhenotypeMatch; teachMode: boolean }> = ({ match, teachMode }) => (
  <div className="rounded-lg bg-slate-50 border border-slate-100 p-3">
    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">ICHD-3 criteria</p>
    {match.metCriteria.length > 0 && (
      <ul className="space-y-1 mb-2">
        {match.metCriteria.map(c => (
          <li key={c.id} className="text-[12px] text-emerald-700 flex items-start gap-1.5">
            <span aria-hidden="true">✓</span>
            <span>{c.label}</span>
          </li>
        ))}
      </ul>
    )}
    {match.missingCriteria.length > 0 && (
      <ul className="space-y-1">
        {match.missingCriteria.map(c => (
          <li key={c.id} className="text-[12px] text-slate-600 flex items-start gap-1.5">
            <span aria-hidden="true">○</span>
            <div>
              <span>Still needed: {c.label}</span>
              {teachMode && <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>}
            </div>
          </li>
        ))}
      </ul>
    )}
  </div>
);

const Bullet: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="text-[13px] text-slate-700 leading-relaxed flex items-start gap-2">
    <span className="text-slate-400 mt-0.5" aria-hidden="true">·</span>
    <span>{children}</span>
  </li>
);

const SectionHeading: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{children}</p>
);

const ResultCard: React.FC<{ match: PhenotypeMatch | undefined; phenotypeId: PhenotypeId; teachMode: boolean }> = ({ match, phenotypeId, teachMode }) => {
  const phenotype = HEADACHE_PHENOTYPES.find(p => p.id === phenotypeId);
  if (!phenotype) return null;
  const matchHeadline = match
    ? match.matchStrength === 'full'
      ? `Features consistent with ${phenotype.name}`
      : match.matchStrength === 'probable'
        ? `Features consistent with Probable ${phenotype.name}`
        : `Partial match for ${phenotype.name}`
    : `Reviewing ${phenotype.name}`;

  return (
    <div className="bg-white px-5 py-4 max-h-[60dvh] overflow-y-auto border-t border-slate-100">
      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{phenotype.ichd3Section}{phenotype.isAppendix ? ' · appendix entity' : ''}</p>
      <p className="text-[17px] font-semibold text-slate-900 leading-snug mt-0.5">{matchHeadline}</p>
      <p className="text-[12px] text-slate-600 mt-2 leading-relaxed">
        Confirm pattern across multiple attacks and review the patient's history before treating. This tool maps features against criteria; the diagnosis remains a clinical judgement.
      </p>

      {/* Per-phenotype management — literal data-claim per phenotype */}
      {(phenotypeId === 'migraine-without-aura' || phenotypeId === 'migraine-with-aura') && (
        <>
          {match && (
            <div data-claim="clinic-headache-ichd3-migraine-criteria" className="mt-4">
              <CriteriaList match={match} teachMode={teachMode} />
            </div>
          )}
          <div data-claim="clinic-headache-moh-gepant-safe" className="mt-4">
            <SectionHeading>Acute treatment</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              {phenotypeId === 'migraine-without-aura' ? (
                <>
                  <Bullet>Triptan (sumatriptan 50–100 mg PO at onset) first-line if no CVD contraindication.</Bullet>
                  <Bullet>NSAID (ibuprofen 600 mg or naproxen 500 mg) for milder attacks.</Bullet>
                  <Bullet>Gepant (ubrogepant, rimegepant) when triptans are contraindicated or in MOH risk (Rizzoli 2024).</Bullet>
                  <Bullet>Add antiemetic if nausea is prominent.</Bullet>
                </>
              ) : (
                <>
                  <Bullet>NSAID at aura onset; triptan once headache phase begins.</Bullet>
                  <Bullet>Gepant or lasmiditan when triptans are contraindicated.</Bullet>
                </>
              )}
            </ul>
          </div>
          <div data-claim="clinic-headache-preventive-threshold" className="mt-4">
            <SectionHeading>Preventive threshold</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>≥4 days/month with disability OR ≥6 days/month regardless OR acute use ≥10 days/month (AHS 2021).</Bullet>
              <Bullet>First-line: propranolol or topiramate.</Bullet>
              <Bullet>Comorbid anxiety/depression: amitriptyline or venlafaxine.</Bullet>
            </ul>
          </div>
          <div data-claim="clinic-headache-cgrp-escalation" className="mt-4">
            <SectionHeading>CGRP escalation</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>After ≥2 conventional preventive failures, escalate to CGRP mAb (erenumab, fremanezumab, galcanezumab, eptinezumab).</Bullet>
              <Bullet>Gepants (atogepant, rimegepant) are oral CGRP options without MOH risk.</Bullet>
            </ul>
          </div>
        </>
      )}

      {(phenotypeId === 'episodic-tth' || phenotypeId === 'chronic-tth') && (
        <>
          {match && (
            <div data-claim="clinic-headache-ichd3-tension-criteria" className="mt-4">
              <CriteriaList match={match} teachMode={teachMode} />
            </div>
          )}
          <div data-claim="clinic-headache-tension-acute-management" className="mt-4">
            <SectionHeading>Acute treatment</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>Ibuprofen 400–600 mg PO first-line (Scher Continuum 2024).</Bullet>
              <Bullet>Aspirin 500–1000 mg PO alternative.</Bullet>
              <Bullet>Acetaminophen 1000 mg PO in pregnancy or NSAID contraindication.</Bullet>
              <Bullet>Avoid opioids and butalbital combinations (MOH and dependence risk).</Bullet>
              <Bullet>Limit acute medication to ≤15 days/month for simple analgesics, ≤10 days/month for triptans/opioids.</Bullet>
            </ul>
          </div>
          {phenotypeId === 'chronic-tth' && (
            <div data-claim="clinic-headache-tension-preventive" className="mt-4">
              <SectionHeading>Preventive treatment</SectionHeading>
              <ul className="mt-2 space-y-1.5">
                <Bullet>Amitriptyline 10–75 mg at bedtime first-line (AAN Level B).</Bullet>
                <Bullet>Venlafaxine 75–150 mg/day if depression or anxiety is comorbid.</Bullet>
                <Bullet>Mirtazapine 15–30 mg at bedtime for sleep + anxiety.</Bullet>
                <Bullet>Topiramate third-line (less evidence for TTH than migraine).</Bullet>
                <Bullet>Combined non-pharmacologic approach (stress management + biofeedback + physical therapy) has Level A evidence.</Bullet>
              </ul>
            </div>
          )}
        </>
      )}

      {phenotypeId === 'cluster-headache' && (
        <>
          {match && (
            <div data-claim="clinic-headache-ichd3-cluster-criteria" className="mt-4">
              <CriteriaList match={match} teachMode={teachMode} />
            </div>
          )}
          <div data-claim="clinic-headache-cluster-acute-management" className="mt-4">
            <SectionHeading>Acute treatment</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>High-flow O₂ 12–15 L/min via non-rebreather, 15 min (Burish 2024, AHS Grade A).</Bullet>
              <Bullet>Sumatriptan 6 mg SC or 20 mg nasal (Burish 2024, AHS Grade A).</Bullet>
              <Bullet>Bridging: ipsilateral GON block with corticosteroid; prednisone 100 mg/day × 5 d then taper.</Bullet>
            </ul>
          </div>
          <div data-claim="clinic-headache-cluster-preventive" className="mt-4">
            <SectionHeading>Preventive treatment</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>Verapamil 80 mg TID, titrate to 360 mg/day. Baseline ECG; recheck after each dose change (PR prolongation).</Bullet>
              <Bullet>Lithium 300 mg BID–TID second-line; requires serum-level monitoring.</Bullet>
              <Bullet>Topiramate 100–200 mg/day third-line; avoid in WOCBP without contraception.</Bullet>
            </ul>
          </div>
        </>
      )}

      {phenotypeId === 'hemicrania-continua' && (
        <>
          {match && (
            <div data-claim="clinic-headache-ichd3-hemicrania-criteria" className="mt-4">
              <CriteriaList match={match} teachMode={teachMode} />
            </div>
          )}
          <div data-claim="clinic-headache-hc-indomethacin-protocol" className="mt-4">
            <SectionHeading>Indomethacin protocol (Goadsby Continuum 2024)</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>Indomethacin 25 mg TID week 1; 50 mg TID week 2 if incomplete (max 150 mg/day per Goadsby 2024 quoted text).</Bullet>
              <Bullet>Co-prescribe PPI for GI protection.</Bullet>
              <Bullet>Complete response within 1–2 weeks confirms the hemicrania continua phenotype. Maintain at lowest effective dose.</Bullet>
            </ul>
          </div>
        </>
      )}

      {phenotypeId === 'ndph' && (
        <>
          {match && (
            <div data-claim="clinic-headache-ichd3-ndph-criteria" className="mt-4">
              <CriteriaList match={match} teachMode={teachMode} />
            </div>
          )}
          <div className="mt-4">
            <SectionHeading>Management</SectionHeading>
            <ul className="mt-2 space-y-1.5">
              <Bullet>NDPH is a diagnosis of exclusion — secondary-cause workup should be complete before treating.</Bullet>
              <Bullet>Treat the most prominent phenotype (migraine-like or TTH-like) the headache resembles.</Bullet>
              <Bullet>Counselling about uncertain prognosis is part of the plan.</Bullet>
            </ul>
          </div>
        </>
      )}

      {phenotypeId === 'vestibular-migraine' && match && (
        <div className="mt-4 rounded-lg bg-slate-50 border border-slate-100 p-3">
          <p className="text-[12px] text-slate-700 leading-relaxed">
            Vestibular migraine lives in the ICHD-3 appendix (A1.6.5) as research criteria. Treat per the migraine phenotype most closely matching the patient's other features.
          </p>
          <div className="mt-3">
            <CriteriaList match={match} teachMode={teachMode} />
          </div>
        </div>
      )}

      {/* Teach pearl */}
      {teachMode && phenotype.teachPearl && (
        <div className="mt-4 rounded-lg bg-neuro-50 border border-neuro-100 p-3">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-700 mb-1">Learn this pattern</p>
          <p className="text-[12px] text-slate-700 leading-relaxed">{phenotype.teachPearl}</p>
        </div>
      )}
    </div>
  );
};

export default ClinicHeadachePathway;
