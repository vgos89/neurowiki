import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, Copy, Brain, Info, AlertTriangle, AlertCircle,
  InfoIcon, FlaskConical, Eye, FileText as FileTextIcon, Zap, BookOpen,
  ChevronDown, GraduationCap,
} from 'lucide-react';
import { StrokeBasicsLayout } from './StrokeBasicsLayout';
import { TimestampBubble } from '../../components/article/stroke/TimestampBubble';
import { QuickReferenceCard } from '../../components/article/stroke/QuickReferenceCard';
import { StrokeCardGrid } from '../../components/article/stroke/StrokeCardGrid';
import type { ClinicalPearlsData } from '../../data/strokeClinicalPearls';
import { CodeModeStep1 } from '../../components/article/stroke/CodeModeStep1';
import type { Step1Data } from '../../components/article/stroke/CodeModeStep1';
import type { Step2Data } from '../../components/article/stroke/CodeModeStep2';

/** Lazy-load modals for smaller initial bundle (mobile performance) */
const DeepLearningModal = lazy(() => import('../../components/article/stroke/DeepLearningModal').then(m => ({ default: m.DeepLearningModal })));
const ThrombectomyPathwayModal = lazy(() => import('../../components/article/stroke/ThrombectomyPathwayModal').then(m => ({ default: m.ThrombectomyPathwayModal })));
const ThrombolysisEligibilityModal = lazy(() => import('../../components/article/stroke/ThrombolysisEligibilityModal').then(m => ({ default: m.ThrombolysisEligibilityModal })));
import type { ThrombolysisEligibilityData } from '../../components/article/stroke/ThrombolysisEligibilityModal';
const AnalogClockPicker = lazy(() => import('../../components/article/stroke/AnalogClockPicker').then(m => ({ default: m.AnalogClockPicker })));
const TpaReversalProtocolModal = lazy(() => import('../../components/article/stroke/TpaReversalProtocolModal').then(m => ({ default: m.TpaReversalProtocolModal })));
const OrolingualEdemaProtocolModal = lazy(() => import('../../components/article/stroke/OrolingualEdemaProtocolModal').then(m => ({ default: m.OrolingualEdemaProtocolModal })));
const HemorrhageProtocolModal = lazy(() => import('../../components/article/stroke/HemorrhageProtocolModal').then(m => ({ default: m.HemorrhageProtocolModal })));

/** Lazy-load heavy step components and NIHSS embed to shorten critical path */
const CodeModeStep2 = lazy(() => import('../../components/article/stroke/CodeModeStep2').then(m => ({ default: m.CodeModeStep2 })));
const CodeModeStep3 = lazy(() => import('../../components/article/stroke/CodeModeStep3').then(m => ({ default: m.CodeModeStep3 })));
const CodeModeStep4 = lazy(() => import('../../components/article/stroke/CodeModeStep4').then(m => ({ default: m.CodeModeStep4 })));
const StrokeIchProtocolStep = lazy(() => import('../../components/article/stroke/StrokeIchProtocolStep').then(m => ({ default: m.StrokeIchProtocolStep })));
const NihssCalculatorEmbed = lazy(() => import('../../components/article/stroke/NihssCalculatorEmbed').then(m => ({ default: m.NihssCalculatorEmbed })));

/** Get With The Guidelines (GWTG) stroke metrics — single source of truth for timestamps */
export interface GWTGMilestones {
  doorTime?: Date | null;
  doorToData?: Date;
  doorToCT?: Date;
  doorToNeedle?: Date;
  lkwTime?: Date | null;
  symptomDiscoveryTime?: Date | null;
  neurologistEvaluationTime?: Date | null;
  ctOrderedTime?: Date | null;
  ctFirstImageTime?: Date | null;
  ctInterpretedTime?: Date | null;
  tpaBolusTime?: Date | null;
  groinPunctureTime?: Date | null;
  firstDeviceTime?: Date | null;
  firstReperfusionTime?: Date | null;
}

const DEFAULT_STEP1_DATA: Step1Data = {
  lkwHours: 2,
  lkwUnknown: false,
  nihssScore: 5,
  systolicBP: 140,
  diastolicBP: 90,
  glucose: 100,
  weightValue: 70,
  weightUnit: 'kg',
  bpControlled: true,
  eligibilityChecked: false,
};

const DEFAULT_STEP2_DATA: Step2Data = {
  ctResult: 'no-bleed',
  treatmentGiven: 'none',
  ctaOrdered: false,
  lvoPresent: null,
};

// ── sessionStorage persistence (HIGH-02) ────────────────────────────────────

const SESSION_KEY = 'neuro_stroke_workflow_v2';
const SESSION_TTL_MS = 2 * 60 * 60 * 1000;

interface PersistedState {
  ts: number;
  step1Data: Step1Data | null;
  step2Data: Step2Data | null;
  step4Orders: string[];
  milestones: Record<string, string | null>;
  eligibilityResult: ThrombolysisEligibilityData | null;
  workflowMode: 'code' | 'study';
  activeCard: number;
}

function serializeMilestones(m: GWTGMilestones): Record<string, string | null> {
  const out: Record<string, string | null> = {};
  for (const [k, v] of Object.entries(m)) {
    out[k] = v instanceof Date ? v.toISOString() : (v ?? null);
  }
  return out;
}

function deserializeMilestones(raw: Record<string, string | null>): GWTGMilestones {
  const out: GWTGMilestones = {};
  for (const [k, v] of Object.entries(raw)) {
    (out as Record<string, Date | null>)[k] = v ? new Date(v) : null;
  }
  return out;
}

function loadSession(): Partial<PersistedState> {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return {};
    const parsed: PersistedState = JSON.parse(raw);
    if (Date.now() - parsed.ts > SESSION_TTL_MS) {
      sessionStorage.removeItem(SESSION_KEY);
      return {};
    }
    if (parsed.step1Data?.lkwTimestamp) {
      parsed.step1Data.lkwTimestamp = new Date(parsed.step1Data.lkwTimestamp as unknown as string);
    }
    if (parsed.step1Data?.symptomDiscoveryTime) {
      parsed.step1Data.symptomDiscoveryTime = new Date(parsed.step1Data.symptomDiscoveryTime as unknown as string);
    }
    return parsed;
  } catch {
    return {};
  }
}

function saveSession(state: Omit<PersistedState, 'ts'>) {
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify({ ...state, ts: Date.now() }));
  } catch {
    // storage quota exceeded — swallow
  }
}

// ── Live LKW hours (HIGH-01) ─────────────────────────────────────────────────

function computeLkwHours(d: Step1Data | null): number {
  if (!d || d.lkwUnknown || !d.lkwTimestamp) return d?.lkwHours ?? 0;
  return Math.max(0, (Date.now() - (d.lkwTimestamp as Date).getTime()) / 3_600_000);
}

// ── Study pearls button ───────────────────────────────────────────────────────

const StudyPearlsButton: React.FC<{ count: number; onClick: () => void }> = ({ count, onClick }) =>
  count > 0 ? (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neuro-50 border border-neuro-200 text-neuro-700 hover:bg-neuro-100 transition-colors text-xs font-semibold mb-3"
    >
      <GraduationCap className="w-3.5 h-3.5" aria-hidden />
      {count} Clinical Pearl{count !== 1 ? 's' : ''}
    </button>
  ) : null;

// ── MainContent — self-contained (HIGH-03 fix: no 35-prop drilling) ──────────

const MainContent: React.FC = () => {
  const session = useRef(loadSession()).current;

  const [workflowMode, setWorkflowMode] = useState<'code' | 'study'>(session.workflowMode ?? 'code');
  const [activeCard, setActiveCardRaw] = useState<number>(session.activeCard ?? 1);

  const [step1Data, setStep1DataRaw] = useState<Step1Data | null>(session.step1Data ?? null);
  const [step2Data, setStep2DataRaw] = useState<Step2Data | null>(session.step2Data ?? null);
  const [step4Orders, setStep4OrdersRaw] = useState<string[]>(session.step4Orders ?? []);
  const [eligibilityResult, setEligibilityResultRaw] = useState<ThrombolysisEligibilityData | null>(session.eligibilityResult ?? null);
  const [milestones, setMilestonesRaw] = useState<GWTGMilestones>(() =>
    session.milestones ? deserializeMilestones(session.milestones) : { doorTime: new Date() }
  );

  // HIGH-01: live LKW hours, refreshed every 30s
  const [liveLkwHours, setLiveLkwHours] = useState(() => computeLkwHours(session.step1Data ?? null));
  useEffect(() => {
    if (!step1Data?.lkwTimestamp || step1Data.lkwUnknown) return;
    const id = setInterval(() => setLiveLkwHours(computeLkwHours(step1Data)), 30_000);
    return () => clearInterval(id);
  }, [step1Data]);

  // BUG-02: CT Read external time prop for TimestampBubble
  const [ctReadExternalTime, setCtReadExternalTime] = useState<Date | null>(null);

  // BUG-04: track whether user actually completed the eligibility modal
  const [eligibilityCheckedByUser, setEligibilityCheckedByUser] = useState(false);

  // Modal states
  const [step1ModalOpen, setStep1ModalOpen] = useState(false);
  const [step2ModalOpen, setStep2ModalOpen] = useState(false);
  const [step3ModalOpen, setStep3ModalOpen] = useState(false);
  const [nihssModalOpen, setNihssModalOpen] = useState(false);
  const [nihssFromModal, setNihssFromModal] = useState<number | null>(null);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [thrombectomyModalOpen, setThrombectomyModalOpen] = useState(false);
  const [thrombectomyRecommendation, setThrombectomyRecommendation] = useState<string | null>(null);
  const [doorTimePickerOpen, setDoorTimePickerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tpaReversalModalOpen, setTpaReversalModalOpen] = useState(false);
  const [orolingualEdemaModalOpen, setOrolingualEdemaModalOpen] = useState(false);
  const [hemorrhageProtocolModalOpen, setHemorrhageProtocolModalOpen] = useState(false);
  const [pearlsData, setPearlsData] = useState<ClinicalPearlsData | null>(null);

  useEffect(() => {
    import('../../data/strokeClinicalPearls').then(m => setPearlsData(m.STROKE_CLINICAL_PEARLS));
  }, []);

  // ── Persisting setters ───────────────────────────────────────────────────

  const buildPersist = (overrides: Partial<Omit<PersistedState, 'ts'>>) =>
    saveSession({
      step1Data,
      step2Data,
      step4Orders,
      milestones: serializeMilestones(milestones),
      eligibilityResult,
      workflowMode,
      activeCard: activeCard,
      ...overrides,
    });

  const setStep1Data = (d: Step1Data | null) => {
    setStep1DataRaw(d);
    setLiveLkwHours(computeLkwHours(d));
    buildPersist({ step1Data: d });
  };
  const setStep2Data = (d: Step2Data | null) => { setStep2DataRaw(d); buildPersist({ step2Data: d }); };
  const setStep4Orders = (o: string[]) => { setStep4OrdersRaw(o); buildPersist({ step4Orders: o }); };
  const setActiveCard = (id: number) => { setActiveCardRaw(id); buildPersist({ activeCard: id }); };
  const setEligibilityResult: React.Dispatch<React.SetStateAction<ThrombolysisEligibilityData | null>> = (action) => {
    setEligibilityResultRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      buildPersist({ eligibilityResult: next });
      return next;
    });
  };
  const setMilestones: React.Dispatch<React.SetStateAction<GWTGMilestones>> = (action) => {
    setMilestonesRaw(prev => {
      const next = typeof action === 'function' ? action(prev) : action;
      buildPersist({ milestones: serializeMilestones(next) });
      return next;
    });
  };

  // ── Derived values ────────────────────────────────────────────────────────

  const step1DataLive: Step1Data | null = step1Data ? { ...step1Data, lkwHours: liveLkwHours } : null;
  const doorTimeForPicker = milestones.doorTime ?? new Date();
  const pearls = pearlsData ?? {};

  const doorTimeTo12h = (d: Date) => {
    let h = d.getHours();
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return { hour: h, minute: d.getMinutes(), period };
  };
  const doorTimeFrom12h = (hour: number, minute: number, period: 'AM' | 'PM'): Date => {
    let h24 = hour;
    if (period === 'PM' && hour !== 12) h24 += 12;
    if (period === 'AM' && hour === 12) h24 = 0;
    const d = new Date();
    d.setHours(h24, minute, 0, 0);
    if (d > new Date()) d.setDate(d.getDate() - 1);
    return d;
  };

  return (
    <Suspense fallback={null}>
      <>
        {/* Unified FAB stack */}
        <TimestampBubble
          onTpaReversal={() => setTpaReversalModalOpen(true)}
          onOrolingualEdema={() => setOrolingualEdemaModalOpen(true)}
          ctReadExternalTime={ctReadExternalTime}
          onStamp={(event, date) => {
            // BUG-02 fix: wire stamps to GWTGMilestones
            if (event === 'Code Activation') setMilestones(p => ({ ...p, doorTime: date }));
            else if (event === 'Neurology Evaluation') setMilestones(p => ({ ...p, neurologistEvaluationTime: date }));
            else if (event === 'CT Read Time') setMilestones(p => ({ ...p, ctInterpretedTime: date }));
          }}
        />

        {/* Back + Header */}
        <div className="mb-3 sm:mb-4 px-3 sm:px-6 pt-2 sm:pt-6">
          <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
            <Link
              to="/guide"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-3 py-2 sm:px-4 sm:py-3 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 flex-shrink-0"
              aria-label="Back to Resident Guide"
            >
              <ArrowLeft size={18} aria-hidden />
              <span className="hidden sm:inline">Back to Resident Guide</span>
              <span className="sm:hidden">Back</span>
            </Link>
            {/* LOW-05: role="radiogroup" on mode toggle */}
            <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
              <div className="inline-flex rounded-2xl bg-slate-100/80 p-1" role="radiogroup" aria-label="Workflow mode">
                <button
                  role="radio"
                  aria-checked={workflowMode === 'code'}
                  onClick={() => setWorkflowMode('code')}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-8 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    workflowMode === 'code' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="hidden sm:inline">CODE MODE</span>
                  <span className="sm:hidden">Code</span>
                </button>
                <button
                  role="radio"
                  aria-checked={workflowMode === 'study'}
                  onClick={() => setWorkflowMode('study')}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-8 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    workflowMode === 'study' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="hidden sm:inline">STUDY MODE</span>
                  <span className="sm:hidden">Study</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">
                {workflowMode === 'code' ? 'Fast-track decisions' : 'Evidence + clinical pearls'}
              </p>
            </div>
          </div>
          <h1 className="text-xl sm:text-3xl font-black text-slate-900 mb-0 sm:mb-1">Stroke Code Basics</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0 flex items-center gap-1.5">
            <span className="sm:hidden">3 sections · tap any to open</span>
            <span className="hidden sm:flex items-center gap-1.5">
              {workflowMode === 'code'
                ? <><Zap className="w-3.5 h-3.5 inline-block" /> Fast-track clinical decisions during active stroke code &bull; all 3 sections open immediately</>
                : <><BookOpen className="w-3.5 h-3.5 inline-block" /> Evidence-based learning with trials and clinical pearls &bull; 3 sections</>}
            </span>
          </p>
        </div>

        <QuickReferenceCard />

        {/* Clinical Context Bar */}
        {step1DataLive && (
          <div className="mx-3 sm:mx-6 mb-4 px-4 py-2.5 rounded-xl bg-slate-800 dark:bg-slate-900 border border-slate-700 flex flex-wrap items-center gap-x-4 gap-y-1.5" role="status" aria-label="Clinical context summary">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">NIHSS</span>
              <span className="text-base font-mono font-bold text-white">{step1DataLive.nihssScore}</span>
            </div>
            <div className="w-px h-4 bg-slate-600 hidden sm:block" aria-hidden />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">BP</span>
              <span className="text-base font-mono font-bold text-white">{step1DataLive.systolicBP}/{step1DataLive.diastolicBP}</span>
            </div>
            <div className="w-px h-4 bg-slate-600 hidden sm:block" aria-hidden />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">Glucose</span>
              <span className="text-base font-mono font-bold text-white">{step1DataLive.glucose}</span>
            </div>
            <div className="w-px h-4 bg-slate-600 hidden sm:block" aria-hidden />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-slate-400">LKW</span>
              {step1DataLive.lkwUnknown
                ? <span className="text-sm font-semibold text-amber-400">Unknown</span>
                : <span className="text-base font-mono font-bold text-white">{liveLkwHours.toFixed(1)}h ago</span>}
            </div>
            {!step1DataLive.lkwUnknown && liveLkwHours > 0 && (
              <>
                <div className="w-px h-4 bg-slate-600 hidden sm:block" aria-hidden />
                {/* LOW-04: Tailwind tokens only, no hardcoded colors */}
                <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wide ${
                  liveLkwHours <= 4.5 ? 'bg-emerald-600 text-white' : liveLkwHours <= 9 ? 'bg-amber-500 text-white' : 'bg-red-600 text-white'
                }`}>
                  {liveLkwHours <= 4.5 ? 'IVT Window' : liveLkwHours <= 9 ? 'Extended Window' : 'Outside IVT'}
                </span>
              </>
            )}
          </div>
        )}

        <StrokeCardGrid
          activeCard={activeCard}
          onSelectCard={setActiveCard}
          step1Data={step1DataLive}
          step2Data={step2Data}
          step4Orders={step4Orders}
          doorTime={milestones.doorTime ?? new Date()}
          tpaBolusTime={milestones.tpaBolusTime}
        />

        <div id="card-content-panel" className="px-3 sm:px-6 mt-1 pb-2">

          {/* Card 1: LKW & Vitals */}
          {activeCard === 1 && (
            <div>
              {workflowMode === 'study' && (
                <StudyPearlsButton count={pearls['step-1']?.deep?.length || 0} onClick={() => setStep1ModalOpen(true)} />
              )}
              <CodeModeStep1
                onComplete={(data) => {
                  setStep1Data({ ...data, eligibilityChecked: eligibilityCheckedByUser });
                  setMilestones(prev => ({
                    ...prev,
                    doorToData: new Date(),
                    lkwTime: data.lkwTimestamp ?? null,
                    symptomDiscoveryTime: data.symptomDiscoveryTime ?? null,
                  }));
                  setActiveCard(2); // Auto-advance → clear visual feedback that save succeeded
                }}
                onOpenNIHSS={() => setNihssModalOpen(true)}
                onOpenEligibility={() => setEligibilityModalOpen(true)}
                nihssScoreFromModal={nihssFromModal}
              />
              {workflowMode === 'study' && (
                <details className="mt-4 group rounded-lg border border-blue-200 bg-blue-50 overflow-hidden">
                  <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-blue-800 hover:bg-blue-100/60 transition-colors list-none">
                    <InfoIcon className="w-4 h-4 text-blue-600 flex-shrink-0" aria-hidden />
                    <span>Evidence: Last Known Well &amp; Treatment Windows</span>
                    <ChevronDown className="w-4 h-4 text-blue-500 ml-auto group-open:rotate-180 transition-transform" aria-hidden />
                  </summary>
                  <div className="px-4 pb-4 pt-1 space-y-3">
                    <p className="text-sm text-blue-800 leading-relaxed">
                      The &quot;last known well&quot; (LKW) time is the most critical piece of information in acute stroke management, determining eligibility for time-sensitive reperfusion therapies. For IV thrombolysis (tPA/TNK), the standard window is <strong>0-4.5 hours</strong>, with extended windows possible up to 9 hours using perfusion imaging (EXTEND trial). For mechanical thrombectomy, treatment is possible <strong>up to 24 hours</strong> with appropriate imaging showing salvageable tissue (DAWN/DEFUSE-3 trials).
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>Time is Brain:</strong> During untreated stroke, 1.9 million neurons die per minute. Every 15-minute delay in treatment reduces the probability of good outcome by 4% (Emberson et al, Lancet 2014).
                    </p>
                    <p className="text-sm text-blue-800 leading-relaxed">
                      <strong>Wake-Up Strokes:</strong> If the patient woke with symptoms, LKW is when they were last seen normal before sleep, NOT when they woke up. The WAKE-UP trial (2018) showed MRI-guided treatment using DWI-FLAIR mismatch resulted in 53.3% vs 41.8% favorable outcomes.
                    </p>
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>References:</strong>{' '}
                        <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000513" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">AHA/ASA 2026 Guidelines</a>
                        {' '}•{' '}
                        <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1804355" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">WAKE-UP Trial</a>
                        {' '}•{' '}
                        <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(14)60584-5/fulltext" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Emberson Meta-Analysis</a>
                      </p>
                    </div>
                  </div>
                </details>
              )}
              {workflowMode === 'study' && (
                <Suspense fallback={null}>
                  <DeepLearningModal
                    isOpen={step1ModalOpen}
                    onClose={() => setStep1ModalOpen(false)}
                    sectionTitle="1. Last Known Well & Eligibility"
                    pearls={pearls['step-1']?.deep || []}
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Card 2: CT & Treatment */}
          {activeCard === 2 && (
            <div>
              {workflowMode === 'study' && (
                <StudyPearlsButton count={pearls['step-2']?.deep?.length || 0} onClick={() => setStep2ModalOpen(true)} />
              )}
              <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading…</div>}>
                <CodeModeStep2
                  step1Data={step1DataLive || DEFAULT_STEP1_DATA}
                  eligibilityResult={eligibilityResult}
                  onIchSelected={() => setHemorrhageProtocolModalOpen(true)}
                  onComplete={(data) => setStep2Data(data)}
                  onOpenEVTPathway={() => setThrombectomyModalOpen(true)}
                  onOpenEligibility={() => setEligibilityModalOpen(true)}
                  onCtReadStamped={() => {
                    const now = new Date();
                    setCtReadExternalTime(now);
                    setMilestones(p => ({ ...p, ctInterpretedTime: now }));
                  }}
                />
              </Suspense>
              {workflowMode === 'study' && (
                <details className="mt-4 group rounded-lg border border-purple-200 bg-purple-50 overflow-hidden">
                  <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-purple-800 hover:bg-purple-100/60 transition-colors list-none">
                    <Eye className="w-4 h-4 text-purple-600 flex-shrink-0" aria-hidden />
                    <span>Evidence: Large Vessel Occlusion &amp; EVT Windows</span>
                    <ChevronDown className="w-4 h-4 text-purple-500 ml-auto group-open:rotate-180 transition-transform" aria-hidden />
                  </summary>
                  <div className="px-4 pb-4 pt-1 space-y-3">
                    <p className="text-sm text-purple-800 leading-relaxed">
                      Large vessel occlusion (LVO) occurs in approximately 30% of acute ischemic strokes. The HERMES meta-analysis (2016) demonstrated that mechanical thrombectomy achieves functional independence in 46% vs 29% with medical therapy alone (NNT = 2.6).
                    </p>
                    <p className="text-sm text-purple-800 leading-relaxed">
                      <strong>Extended Time Windows:</strong> The DAWN trial (2018) showed benefit up to 24 hours using clinical-core mismatch criteria (48.6% vs 13.1% good outcome, NNT=3). DEFUSE-3 demonstrated efficacy in 6-16 hour window with perfusion imaging.
                    </p>
                    <div className="pt-2 border-t border-purple-200">
                      <p className="text-xs text-purple-700">
                        <strong>References:</strong>{' '}
                        <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(15)01833-5/fulltext" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">HERMES Meta-Analysis</a>
                        {' '}•{' '}
                        <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1706442" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">DAWN Trial</a>
                        {' '}•{' '}
                        <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1713973" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">DEFUSE-3 Trial</a>
                      </p>
                    </div>
                  </div>
                </details>
              )}
              {workflowMode === 'study' && (
                <Suspense fallback={null}>
                  <DeepLearningModal
                    isOpen={step2ModalOpen}
                    onClose={() => setStep2ModalOpen(false)}
                    sectionTitle="2. LVO Screening"
                    pearls={pearls['step-2']?.deep || []}
                  />
                </Suspense>
              )}
              {thrombectomyModalOpen && (
                <Suspense fallback={null}>
                  <ThrombectomyPathwayModal
                    isOpen={thrombectomyModalOpen}
                    onClose={() => setThrombectomyModalOpen(false)}
                    onRecommendation={(r) => setThrombectomyRecommendation(r)}
                  />
                </Suspense>
              )}
            </div>
          )}

          {/* Card 3: Summary & Orders */}
          {activeCard === 3 && (
            <div>
              {workflowMode === 'study' && (
                <StudyPearlsButton
                  count={(pearls['step-3']?.deep?.length || 0) + (pearls['step-4']?.deep?.length || 0) + (pearls['step-5']?.deep?.length || 0)}
                  onClick={() => setStep3ModalOpen(true)}
                />
              )}
              {step2Data?.ctResult === 'bleed' ? (
                <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading ICH protocol…</div>}>
                  <StrokeIchProtocolStep
                    onComplete={() => { /* no-op */ }}
                    isLearningMode={workflowMode === 'study'}
                  />
                </Suspense>
              ) : (
                <div className="space-y-6">
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-1">Labs &amp; Treatment Orders</h3>
                    <p className="text-xs text-slate-500 mb-4">Point-of-care glucose is the only mandatory lab before tPA. Select remaining orders for post-code handoff. (AHA/ASA 2026)</p>
                    <Suspense fallback={<div className="p-4 text-slate-500 animate-pulse">Loading orders…</div>}>
                      <CodeModeStep4
                        step2Data={step2Data || { ctResult: 'no-bleed', treatmentGiven: 'none' }}
                        onComplete={(orders) => setStep4Orders(orders)}
                        onCopySuccess={() => {
                          setToastMessage('Orders copied to clipboard');
                          setTimeout(() => setToastMessage(null), 2500);
                        }}
                      />
                    </Suspense>
                  </section>
                  <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading summary…</div>}>
                    <CodeModeStep3
                      step1Data={step1DataLive || DEFAULT_STEP1_DATA}
                      step2Data={step2Data || DEFAULT_STEP2_DATA}
                      step4Orders={step4Orders || []}
                      milestones={milestones}
                      timerStartTime={milestones.doorTime ?? new Date()}
                      thrombectomyRecommendation={thrombectomyRecommendation ?? undefined}
                      onCopySuccess={() => {
                        setToastMessage('Code summary copied to clipboard');
                        setTimeout(() => setToastMessage(null), 2500);
                      }}
                    />
                  </Suspense>
                </div>
              )}
              {workflowMode === 'study' && (
                <div className="mt-4 space-y-3">
                  <details className="group rounded-lg border border-amber-200 bg-amber-50 overflow-hidden">
                    <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-amber-800 hover:bg-amber-100/60 transition-colors list-none">
                      <FlaskConical className="w-4 h-4 text-amber-600 flex-shrink-0" aria-hidden />
                      <span>Evidence: Laboratory Workup &amp; Treatment Orders</span>
                      <ChevronDown className="w-4 h-4 text-amber-500 ml-auto group-open:rotate-180 transition-transform" aria-hidden />
                    </summary>
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm text-amber-800 leading-relaxed">
                        Point-of-care <strong>glucose is the ONLY mandatory lab</strong> before thrombolysis (AHA/ASA 2026). Do not delay tPA for other labs if within 4.5h. Post-thrombolysis: neuro checks, BP &lt;180/105, NPO until swallow passed, no antithrombotics × 24h.
                      </p>
                    </div>
                  </details>
                  <details className="group rounded-lg border border-green-200 bg-green-50 overflow-hidden">
                    <summary className="flex cursor-pointer items-center gap-2 px-4 py-3 text-sm font-semibold text-green-800 hover:bg-green-100/60 transition-colors list-none">
                      <FileTextIcon className="w-4 h-4 text-green-600 flex-shrink-0" aria-hidden />
                      <span>Evidence: Documentation &amp; Quality Improvement</span>
                      <ChevronDown className="w-4 h-4 text-green-500 ml-auto group-open:rotate-180 transition-transform" aria-hidden />
                    </summary>
                    <div className="px-4 pb-4 pt-1 space-y-3">
                      <p className="text-sm text-green-800 leading-relaxed">
                        Comprehensive stroke code documentation serves multiple critical functions. Include precise LKW time, NIHSS subscores, contraindication assessment, door-to-needle time, and treatment rationale.
                      </p>
                      <p className="text-sm text-green-800 leading-relaxed">
                        <strong>Key Metrics:</strong> DTN &lt;60 min goal, &lt;30 min excellence. Dedicated stroke units reduce mortality by 18% (Stroke Unit Trialists Collaboration).
                      </p>
                    </div>
                  </details>
                </div>
              )}
              {workflowMode === 'study' && (
                <Suspense fallback={null}>
                  <DeepLearningModal
                    isOpen={step3ModalOpen}
                    onClose={() => setStep3ModalOpen(false)}
                    sectionTitle="3. Summary, Orders & Documentation"
                    pearls={[...(pearls['step-3']?.deep || []), ...(pearls['step-4']?.deep || []), ...(pearls['step-5']?.deep || [])]}
                  />
                </Suspense>
              )}
            </div>
          )}
        </div>

        {/* Thrombectomy Recommendation Card */}
        {thrombectomyRecommendation && (
          <div className="mt-4 mx-3 sm:mx-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-lg animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-md">
                <Brain size={24} className="text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-purple-900">Thrombectomy Assessment</h4>
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">EVT</span>
                </div>
                <p className="text-base text-purple-800 font-medium mb-3 leading-relaxed">{thrombectomyRecommendation}</p>
                <div className="flex flex-wrap gap-3">
                  <button onClick={() => setThrombectomyModalOpen(true)} className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
                    <ExternalLink size={16} />View Full Assessment
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`THROMBECTOMY ASSESSMENT:\n${thrombectomyRecommendation}\n\nAssessed at: ${new Date().toLocaleString()}`).then(() => {
                        setToastMessage('Thrombectomy recommendation copied to clipboard');
                        setTimeout(() => setToastMessage(null), 2500);
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 text-sm font-medium rounded-lg transition-colors border-2 border-purple-200 shadow-sm"
                  >
                    <Copy size={16} />Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-xs text-purple-600 flex items-center gap-2">
                <Info size={14} />Based on EVT Pathway criteria (DAWN, DEFUSE-3, SELECT2, ATTENTION/BAOCHE protocols)
              </p>
            </div>
          </div>
        )}

        {/* Emergency Protocols */}
        <section className="mt-8 mx-4 sm:mx-6 pt-8 border-t border-slate-200" aria-labelledby="emergency-protocols-heading">
          <h2 id="emergency-protocols-heading" className="text-lg font-bold text-slate-900 mb-2">Emergency Protocols</h2>
          <p className="text-sm text-slate-600 mb-4">Complication protocols for use during or after thrombolysis (AHA/ASA 2026).</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => setTpaReversalModalOpen(true)} className="min-h-[44px] flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-900 font-semibold text-left transition-colors" aria-label="Open tPA/TNK Reversal Protocol">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-700" aria-hidden /></span>
              <span>tPA/TNK Reversal Protocol</span>
            </button>
            <button type="button" onClick={() => setOrolingualEdemaModalOpen(true)} className="min-h-[44px] flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-left transition-colors" aria-label="Open Orolingual Angioedema Protocol">
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-700" aria-hidden /></span>
              <span>Orolingual Edema Protocol</span>
            </button>
          </div>
        </section>

        {/* Related Resources */}
        <section className="mt-8 mx-4 sm:mx-6 pt-8 border-t border-slate-200" aria-labelledby="related-resources-heading">
          <h2 id="related-resources-heading" className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Related Resources</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link to="/guide/iv-tpa" className="flex flex-col gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:bg-neuro-50 hover:border-neuro-300 transition-colors group">
              <span className="text-xs font-bold text-neuro-600 group-hover:text-neuro-700 uppercase tracking-wide">Protocol</span>
              <span className="text-sm font-semibold text-slate-900">IV tPA Guide</span>
            </Link>
            <Link to="/guide/thrombectomy" className="flex flex-col gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:bg-purple-50 hover:border-purple-300 transition-colors group">
              <span className="text-xs font-bold text-purple-600 group-hover:text-purple-700 uppercase tracking-wide">Protocol</span>
              <span className="text-sm font-semibold text-slate-900">EVT / Thrombectomy</span>
            </Link>
            <Link to="/guide/ich-management" className="flex flex-col gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:bg-red-50 hover:border-red-300 transition-colors group">
              <span className="text-xs font-bold text-red-600 group-hover:text-red-700 uppercase tracking-wide">Protocol</span>
              <span className="text-sm font-semibold text-slate-900">ICH Management</span>
            </Link>
            <Link to="/calculators" className="flex flex-col gap-1 p-3 rounded-xl border border-slate-200 bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-colors group">
              <span className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700 uppercase tracking-wide">Tools</span>
              <span className="text-sm font-semibold text-slate-900">All Calculators</span>
            </Link>
          </div>
        </section>

        {/* NIHSS Calculator Modal */}
        {nihssModalOpen && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col min-h-0">
              <div className="flex items-center justify-between h-12 px-4 border-b border-slate-100 flex-shrink-0">
                <span className="text-sm font-bold text-slate-700">NIHSS Calculator</span>
                <button onClick={() => setNihssModalOpen(false)} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label="Close NIHSS calculator">
                  <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
                <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading NIHSS calculator…</div>}>
                  <NihssCalculatorEmbed
                    initialScore={step1Data?.nihssScore ?? 0}
                    onApply={(score) => { setNihssFromModal(score); setNihssModalOpen(false); }}
                    onBack={() => setNihssModalOpen(false)}
                  />
                </Suspense>
              </div>
            </div>
          </div>
        )}

        {/* Eligibility Modal — BUG-05: lkwDate prop wired */}
        {eligibilityModalOpen && (
          <Suspense fallback={null}>
            <ThrombolysisEligibilityModal
              isOpen={eligibilityModalOpen}
              onClose={() => setEligibilityModalOpen(false)}
              lkwDate={step1Data?.lkwTimestamp ?? null}
              onComplete={(data) => {
                setEligibilityResult(data);
                setEligibilityCheckedByUser(true);
                if (step1Data) setStep1Data({ ...step1Data, eligibilityChecked: true });
                setEligibilityModalOpen(false);
              }}
            />
          </Suspense>
        )}

        {tpaReversalModalOpen && (
          <Suspense fallback={null}>
            <TpaReversalProtocolModal isOpen={tpaReversalModalOpen} onClose={() => setTpaReversalModalOpen(false)} onCopySuccess={() => { setToastMessage('Copied to EMR'); setTimeout(() => setToastMessage(null), 2500); }} />
          </Suspense>
        )}

        {orolingualEdemaModalOpen && (
          <Suspense fallback={null}>
            <OrolingualEdemaProtocolModal isOpen={orolingualEdemaModalOpen} onClose={() => setOrolingualEdemaModalOpen(false)} onCopySuccess={() => { setToastMessage('Copied to EMR'); setTimeout(() => setToastMessage(null), 2500); }} />
          </Suspense>
        )}

        {hemorrhageProtocolModalOpen && (
          <Suspense fallback={null}>
            <HemorrhageProtocolModal isOpen={hemorrhageProtocolModalOpen} onClose={() => setHemorrhageProtocolModalOpen(false)} onCopySuccess={() => { setToastMessage('Copied to EMR'); setTimeout(() => setToastMessage(null), 2500); }} />
          </Suspense>
        )}

        {doorTimePickerOpen && (
          <Suspense fallback={<div className="fixed inset-0 z-[90] bg-black/10 flex items-center justify-center" aria-label="Loading clock" />}>
            <AnalogClockPicker
              isOpen={doorTimePickerOpen}
              onClose={() => setDoorTimePickerOpen(false)}
              onTimeSelect={(h, m, p) => { setMilestones(prev => ({ ...prev, doorTime: doorTimeFrom12h(h, m, p) })); setDoorTimePickerOpen(false); }}
              initialHours={doorTimeTo12h(doorTimeForPicker).hour}
              initialMinutes={doorTimeTo12h(doorTimeForPicker).minute}
              initialPeriod={doorTimeTo12h(doorTimeForPicker).period}
            />
          </Suspense>
        )}

        <div className="h-24 safe-area-inset-bottom" />

        {toastMessage && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg bg-slate-800 text-white text-sm font-medium shadow-lg animate-in fade-in duration-200" role="status" aria-live="polite">
            {toastMessage}
          </div>
        )}
      </>
    </Suspense>
  );
};

// ── Default export — trivial wrapper (HIGH-03: no prop drilling) ─────────────

export default function StrokeBasicsWorkflowV2() {
  return (
    <StrokeBasicsLayout
      leftSidebar={null}
      mainContent={<MainContent />}
    />
  );
}
