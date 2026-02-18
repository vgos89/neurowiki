import React, { useState, useEffect, lazy, Suspense } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Copy, Brain, Info, AlertTriangle, AlertCircle, InfoIcon, FlaskConical, Eye, FileText as FileTextIcon, Zap, BookOpen } from 'lucide-react';
import { StrokeBasicsLayout } from './StrokeBasicsLayout';
import { ProtocolSection } from '../../components/article/stroke/ProtocolSection';
import { TimestampBubble } from '../../components/article/stroke/TimestampBubble';
import { ProtocolStepsNav, Step as ProtocolStep } from '../../components/article/stroke/ProtocolStepsNav';
import { QuickToolsGrid } from '../../components/article/stroke/QuickToolsGrid';
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

/** Lazy-load heavy step components and NIHSS embed to shorten critical path and improve LCP */
const CodeModeStep2 = lazy(() => import('../../components/article/stroke/CodeModeStep2').then(m => ({ default: m.CodeModeStep2 })));
const CodeModeStep3 = lazy(() => import('../../components/article/stroke/CodeModeStep3').then(m => ({ default: m.CodeModeStep3 })));
const CodeModeStep4 = lazy(() => import('../../components/article/stroke/CodeModeStep4').then(m => ({ default: m.CodeModeStep4 })));
const StrokeIchProtocolStep = lazy(() => import('../../components/article/stroke/StrokeIchProtocolStep').then(m => ({ default: m.StrokeIchProtocolStep })));
const NihssCalculatorEmbed = lazy(() => import('../../components/article/stroke/NihssCalculatorEmbed').then(m => ({ default: m.NihssCalculatorEmbed })));

/** Fallback Step 1 data for Study Mode when user hasn't completed Step 1 (all steps visible) */
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
  eligibilityChecked: false
};

/** Fallback Step 2 data for Study Mode when user hasn't completed Step 2 */
const DEFAULT_STEP2_DATA: Step2Data = {
  ctResult: 'no-bleed',
  treatmentGiven: 'none',
  ctaOrdered: false,
  lvoPresent: null
};

/** Get With The Guidelines (GWTG) stroke metrics – single source of truth for timestamps */
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

type StepStatus = 'completed' | 'active' | 'locked';

interface Step {
  id: number;
  title: string;
  subtitle: string;
  status: StepStatus;
  isExpanded: boolean;
  completionSummary?: string;
  startedAt?: Date;
  completedAt?: Date;
}

const TimerDisplay: React.FC<{ startTime: Date; running: boolean }> = ({ startTime, running }) => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!running) return;

    const interval = setInterval(() => {
      setElapsed(Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime, running]);

  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;

  return (
    <span className="text-xl font-mono font-semibold tabular-nums leading-tight text-slate-900">
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </span>
  );
};

// Main content component that uses the layout hook (must be inside StrokeBasicsLayout)
const MainContent: React.FC<{
  workflowMode: 'code' | 'study';
  setWorkflowMode: (value: 'code' | 'study') => void;
  steps: Step[];
  toggleStep: (id: number) => void;
  completeStep: (id: number, summary?: string) => void;
  activeStepNumber: number | null;
  getProtocolStatus: (step: Step) => 'in-progress' | 'pending' | 'completed';
  handleStepClick: (stepId: number) => void;
  step1ModalOpen: boolean;
  setStep1ModalOpen: (value: boolean) => void;
  step2ModalOpen: boolean;
  setStep2ModalOpen: (value: boolean) => void;
  step3ModalOpen: boolean;
  setStep3ModalOpen: (value: boolean) => void;
  step4ModalOpen: boolean;
  setStep4ModalOpen: (value: boolean) => void;
  thrombectomyModalOpen: boolean;
  setThrombectomyModalOpen: (value: boolean) => void;
  onThrombectomyRecommendation?: (recommendation: string) => void;
  thrombectomyRecommendation: string | null;
  timerStartTime: Date;
  setTimerStartTime: (d: Date) => void;
  timerRunning: boolean;
  setTimerRunning: (v: boolean) => void;
  /** GWTG-aligned milestones: door time, LKW, imaging, treatment, thrombectomy */
  milestones: GWTGMilestones;
  setMilestones: React.Dispatch<React.SetStateAction<GWTGMilestones>>;
  setStep1Data: (d: Step1Data | null) => void;
  step1Data: Step1Data | null;
  setStep2Data: (d: Step2Data | null) => void;
  step2Data: Step2Data | null;
  step4Orders: string[];
  setStep4Orders: (orders: string[]) => void;
  setSteps: React.Dispatch<React.SetStateAction<Step[]>>;
  scrollToStep: (stepId: number, delay?: number) => void;
  nihssModalOpen: boolean;
  setNihssModalOpen: (value: boolean) => void;
  eligibilityModalOpen: boolean;
  setEligibilityModalOpen: (value: boolean) => void;
  doorTimePickerOpen: boolean;
  setDoorTimePickerOpen: (value: boolean) => void;
  nihssFromModal: number | null;
  setNihssFromModal: (v: number | null) => void;
  eligibilityResult: ThrombolysisEligibilityData | null;
  setEligibilityResult: React.Dispatch<React.SetStateAction<ThrombolysisEligibilityData | null>>;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;
  tpaReversalModalOpen: boolean;
  setTpaReversalModalOpen: (value: boolean) => void;
  orolingualEdemaModalOpen: boolean;
  setOrolingualEdemaModalOpen: (value: boolean) => void;
  hemorrhageProtocolModalOpen: boolean;
  setHemorrhageProtocolModalOpen: (value: boolean) => void;
  /** Loaded async to reduce initial bundle (strokeClinicalPearls ~110KB) */
  pearlsData: ClinicalPearlsData | null;
}> = ({ workflowMode, setWorkflowMode, steps, toggleStep, completeStep, activeStepNumber, getProtocolStatus, handleStepClick, step1ModalOpen, setStep1ModalOpen, step2ModalOpen, setStep2ModalOpen, step3ModalOpen, setStep3ModalOpen, step4ModalOpen, setStep4ModalOpen, thrombectomyModalOpen, setThrombectomyModalOpen, onThrombectomyRecommendation, thrombectomyRecommendation, timerStartTime, setTimerStartTime, timerRunning, setTimerRunning, milestones, setMilestones, setStep1Data, step1Data, setStep2Data, step2Data, step4Orders, setStep4Orders, setSteps, scrollToStep, nihssModalOpen, setNihssModalOpen, eligibilityModalOpen, setEligibilityModalOpen, doorTimePickerOpen, setDoorTimePickerOpen, nihssFromModal, setNihssFromModal, eligibilityResult, setEligibilityResult, toastMessage, setToastMessage, tpaReversalModalOpen, setTpaReversalModalOpen, orolingualEdemaModalOpen, setOrolingualEdemaModalOpen, hemorrhageProtocolModalOpen, setHemorrhageProtocolModalOpen, pearlsData }) => {
  const pearls = pearlsData ?? {};
  const doorTimeForPicker = milestones.doorTime ?? timerStartTime;
  const doorTimeTo12h = (d: Date) => {
    let h = d.getHours();
    const period: 'AM' | 'PM' = h >= 12 ? 'PM' : 'AM';
    h = h % 12;
    if (h === 0) h = 12;
    return { hour: h, minute: d.getMinutes(), period };
  };
  const doorTimeFrom12h = (hour: number, minute: number, period: 'AM' | 'PM'): Date => {
    let hour24 = hour;
    if (period === 'PM' && hour !== 12) hour24 += 12;
    if (period === 'AM' && hour === 12) hour24 = 0;
    const d = new Date();
    d.setHours(hour24, minute, 0, 0);
    if (d > new Date()) d.setDate(d.getDate() - 1);
    return d;
  };

      return (
        <Suspense fallback={null}>
        <>
          {/* Timestamp Bubble */}
          <TimestampBubble />

          {/* Back + Header: compact on mobile */}
          <div className="mb-3 sm:mb-6 px-3 sm:px-6 pt-2 sm:pt-6">
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
              <div className="inline-flex rounded-2xl bg-slate-100/80 p-1 flex-shrink-0">
                <button
                  onClick={() => setWorkflowMode('code')}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-8 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    workflowMode === 'code'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="hidden sm:inline">CODE MODE</span>
                  <span className="sm:hidden">Code</span>
                </button>
                <button
                  onClick={() => setWorkflowMode('study')}
                  className={`min-h-[40px] sm:min-h-[44px] px-3 sm:px-8 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    workflowMode === 'study'
                      ? 'bg-white shadow-sm text-slate-900'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <span className="hidden sm:inline">STUDY MODE</span>
                  <span className="sm:hidden">Study</span>
                </button>
              </div>
            </div>
            <h1 className="text-xl sm:text-3xl font-black text-gray-900 mb-0 sm:mb-1">
              Stroke Code Basics
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0 sm:mt-0 flex items-center gap-1.5">
              <span className="sm:hidden">{steps.length} steps</span>
              <span className="hidden sm:inline items-center gap-1.5 flex">
                {workflowMode === 'code'
                  ? <><Zap className="w-3.5 h-3.5 inline-block" /> Fast-track clinical decisions during active stroke code &bull; {steps.length} essential steps</>
                  : <><BookOpen className="w-3.5 h-3.5 inline-block" /> Evidence-based learning with trials and clinical pearls &bull; {steps.length} comprehensive steps</>}
              </span>
            </p>
          </div>

      {/* Protocol Sections - tighter spacing on mobile */}
      <article className="space-y-8 sm:space-y-12" aria-label="Stroke code protocol">
        {/* Step 1: Clinical Assessment & Data Collection (same component for both modes) */}
        <section id="step-1" aria-labelledby="step-1-title">
          <ProtocolSection
            number={1}
            title="Clinical Assessment & Data Collection"
            status={getProtocolStatus(steps[0])}
            isActive={activeStepNumber === 1}
            showCompleteButton={false}
            showDeepLearningBadge={workflowMode === 'study'}
            pearlCount={pearls['step-1']?.deep?.length || 0}
            onDeepLearningClick={() => setStep1ModalOpen(true)}
          >
            {workflowMode === 'study' && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex gap-3">
                  <InfoIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-2">Last Known Well & Treatment Windows</h4>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        The &quot;last known well&quot; (LKW) time is the most critical piece of information in acute stroke management, determining eligibility for time-sensitive reperfusion therapies. For IV thrombolysis (tPA/TNK), the standard window is <strong>0-4.5 hours</strong>, with extended windows possible up to 9 hours using perfusion imaging (EXTEND trial). For mechanical thrombectomy, treatment is possible <strong>up to 24 hours</strong> with appropriate imaging showing salvageable tissue (DAWN/DEFUSE-3 trials).
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>Time is Brain:</strong> During untreated stroke, 1.9 million neurons die per minute. Every 15-minute delay in treatment reduces the probability of good outcome by 4% (Emberson et al, Lancet 2014). The NINDS trial demonstrated that patients treated within 90 minutes had 50% vs 38% excellent outcomes compared to those treated later in the 3-hour window.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-blue-800 leading-relaxed">
                        <strong>Wake-Up Strokes:</strong> If the patient woke with symptoms, LKW is when they were last seen normal before sleep (bedtime), NOT when they woke up. This represents 25% of all ischemic strokes. The WAKE-UP trial (2018) showed that MRI-guided treatment using DWI-FLAIR mismatch in unknown-onset strokes resulted in 53.3% vs 41.8% favorable outcomes.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <p className="text-xs text-blue-700">
                        <strong>References:</strong> <a href="https://www.ahajournals.org/doi/10.1161/STR.0000000000000513" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">AHA/ASA 2026 Guidelines</a> • <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1804355" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">WAKE-UP Trial</a> • <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(14)60584-5/fulltext" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-900">Emberson Meta-Analysis</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <CodeModeStep1
              onComplete={(data) => {
                setStep1Data(data);
                setMilestones(prev => ({
                  ...prev,
                  doorToData: new Date(),
                  lkwTime: data.lkwTimestamp ?? null,
                  symptomDiscoveryTime: data.symptomDiscoveryTime ?? null
                }));
                completeStep(1, data.lkwUnknown ? `LKW: Unknown • NIHSS: ${data.nihssScore} • BP: ${data.systolicBP}/${data.diastolicBP} • Weight: ${data.weightValue}${data.weightUnit}` : `LKW: ${data.lkwHours}h • NIHSS: ${data.nihssScore} • BP: ${data.systolicBP}/${data.diastolicBP} • Weight: ${data.weightValue}${data.weightUnit}`);
                scrollToStep(2, 400);
              }}
              onOpenNIHSS={() => setNihssModalOpen(true)}
              onOpenEligibility={() => setEligibilityModalOpen(true)}
              nihssScoreFromModal={nihssFromModal}
            />
          </ProtocolSection>

          {workflowMode === 'study' && (
            <DeepLearningModal
              isOpen={step1ModalOpen}
              onClose={() => setStep1ModalOpen(false)}
              sectionTitle="1. Last Known Well & Eligibility"
              pearls={pearls['step-1']?.deep || []}
            />
          )}
        </section>

        {/* Step 2: Imaging & Treatment Decision (same component for both modes) */}
        <section id="step-2" aria-labelledby="step-2-title">
          <ProtocolSection
            number={2}
            title="Imaging & Treatment Decision"
            status={getProtocolStatus(steps[1])}
            isActive={activeStepNumber === 2}
            showCompleteButton={false}
            showDeepLearningBadge={workflowMode === 'study'}
            pearlCount={pearls['step-2']?.deep?.length || 0}
            onDeepLearningClick={() => setStep2ModalOpen(true)}
          >
            {workflowMode === 'study' && (
              <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex gap-3">
                  <Eye className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-purple-900 mb-2">Large Vessel Occlusion Detection</h4>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        Large vessel occlusion (LVO) occurs in approximately 30% of acute ischemic strokes and represents the most time-sensitive neurological emergency. Without treatment, LVO strokes result in severe disability or death in &gt;80% of cases. The HERMES meta-analysis (2016) demonstrated that mechanical thrombectomy achieves functional independence in 46% vs 29% with medical therapy alone (NNT = 2.6, one of the best in medicine).
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        <strong>Cortical Signs:</strong> Aphasia, neglect, gaze deviation, hemianopia, and apraxia strongly suggest LVO. Multiple cortical signs (≥2) have 89% specificity for M1/M2 occlusion (Duvekot et al, Stroke 2021). Even with mild NIHSS, presence of cortical signs warrants urgent CTA and interventional radiology activation.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-purple-800 leading-relaxed">
                        <strong>Extended Time Windows:</strong> The DAWN trial (2018) showed benefit up to 24 hours using clinical-core mismatch criteria (48.6% vs 13.1% good outcome, NNT=3). DEFUSE-3 demonstrated efficacy in 6-16 hour window with perfusion imaging. Sequential therapy (tPA + thrombectomy) is superior to either alone—never delay tPA to wait for thrombectomy.
                      </p>
                    </div>
                    <div className="pt-2 border-t border-purple-200">
                      <p className="text-xs text-purple-700">
                        <strong>References:</strong> <a href="https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(15)01833-5/fulltext" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">HERMES Meta-Analysis</a> • <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1706442" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">DAWN Trial</a> • <a href="https://www.nejm.org/doi/full/10.1056/NEJMoa1713973" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-900">DEFUSE-3 Trial</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(workflowMode === 'code' && !step1Data) ? (
              <button
                type="button"
                onClick={() => scrollToStep(1)}
                className="w-full p-6 text-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mx-auto mb-2 rotate-90 group-hover:text-blue-600" />
                <p className="text-sm font-medium">Step 1 is in progress — tap to jump up</p>
                <p className="text-xs mt-1 text-slate-400">Complete LKW, vitals, NIHSS & weight</p>
              </button>
            ) : (
              <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading step…</div>}>
                <CodeModeStep2
                  step1Data={step1Data || DEFAULT_STEP1_DATA}
                  eligibilityResult={eligibilityResult}
                  onIchSelected={() => setHemorrhageProtocolModalOpen(true)}
                  onComplete={(data) => {
                    setStep2Data(data);
                    const summary = [
                      data.ctResult === 'bleed' ? 'CT: Bleed' : 'CT: No bleed',
                      data.treatmentGiven !== 'none' ? `${data.treatmentGiven.toUpperCase()} given` : null,
                      data.ctaOrdered ? 'CTA ordered' : null
                    ].filter(Boolean).join(' • ');
                    completeStep(2, summary);
                    scrollToStep(3, 400);
                  }}
                  onOpenEVTPathway={() => setThrombectomyModalOpen(true)}
                />
              </Suspense>
            )}
          </ProtocolSection>

          {workflowMode === 'study' && (
            <DeepLearningModal
              isOpen={step2ModalOpen}
              onClose={() => setStep2ModalOpen(false)}
              sectionTitle="2. LVO Screening"
              pearls={pearls['step-2']?.deep || []}
            />
          )}

          {/* Thrombectomy Pathway Modal - lazy when opened */}
          {thrombectomyModalOpen && (
            <Suspense fallback={null}>
              <ThrombectomyPathwayModal
                isOpen={thrombectomyModalOpen}
                onClose={() => setThrombectomyModalOpen(false)}
                onRecommendation={onThrombectomyRecommendation}
              />
            </Suspense>
          )}
        </section>

        {/* Thrombectomy Recommendation Card - Shows after Step 2 completion */}
        {thrombectomyRecommendation && steps[1]?.status === 'completed' && (
          <div className="mt-6 mx-6 p-5 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl shadow-lg animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className="flex-shrink-0 p-3 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl shadow-md">
                <Brain size={24} className="text-white" />
              </div>
              
              {/* Content */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="text-lg font-bold text-purple-900">
                    Thrombectomy Assessment Complete
                  </h4>
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full uppercase tracking-wide">
                    EVT
                  </span>
                </div>
                
                <p className="text-base text-purple-800 font-medium mb-3 leading-relaxed">
                  {thrombectomyRecommendation}
                </p>
                
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={() => setThrombectomyModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                  >
                    <ExternalLink size={16} />
                    View Full Assessment
                  </button>
                  
                  <button
                    onClick={() => {
                      const text = `THROMBECTOMY ASSESSMENT:\n${thrombectomyRecommendation}\n\nAssessed at: ${new Date().toLocaleString()}`;
                      navigator.clipboard.writeText(text).then(() => {
                        setToastMessage('Thrombectomy recommendation copied to clipboard');
                        setTimeout(() => setToastMessage(null), 2500);
                      });
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-purple-50 text-purple-700 text-sm font-medium rounded-lg transition-colors border-2 border-purple-200 shadow-sm"
                  >
                    <Copy size={16} />
                    Copy to Clipboard
                  </button>
                </div>
              </div>
            </div>
            
            {/* Footer note */}
            <div className="mt-4 pt-4 border-t border-purple-200">
              <p className="text-xs text-purple-600 flex items-center gap-2">
                <Info size={14} />
                Based on EVT Pathway criteria (DAWN, DEFUSE-3, SELECT2, ATTENTION/BAOCHE protocols)
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Labs & Treatment Orders (or ICH protocol when ICH detected) */}
        <section id="step-3" aria-labelledby="step-3-title">
          <ProtocolSection
            number={3}
            title={steps[2].title}
            status={getProtocolStatus(steps[2])}
            isActive={activeStepNumber === 3}
            showCompleteButton={false}
            showDeepLearningBadge={workflowMode === 'study'}
            pearlCount={(pearls['step-3']?.deep?.length || 0) + (pearls['step-4']?.deep?.length || 0)}
            onDeepLearningClick={() => setStep3ModalOpen(true)}
          >
            {workflowMode === 'study' && (
              <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex gap-3">
                  <FlaskConical className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <h4 className="font-semibold text-amber-900 mb-2">Laboratory Workup & Treatment Orders</h4>
                    <p className="text-sm text-amber-800 leading-relaxed">
                      Point-of-care <strong>glucose is the ONLY mandatory lab</strong> before thrombolysis (AHA/ASA 2026). Do not delay tPA for other labs if within 4.5h. Post-thrombolysis: neuro checks, BP &lt;180/105, NPO until swallow, no antithrombotics × 24h. Evidence: Fonarow, ARTIS, SITS-ISTR.
                    </p>
                  </div>
                </div>
              </div>
            )}
            {(workflowMode === 'code' && !step2Data) ? (
              <button
                type="button"
                onClick={() => scrollToStep(2)}
                className="w-full p-6 text-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mx-auto mb-2 rotate-90 group-hover:text-blue-600" />
                <p className="text-sm font-medium">Step 2 is in progress — tap to jump up</p>
                <p className="text-xs mt-1 text-slate-400">Complete CT result and treatment decision</p>
              </button>
            ) : step2Data?.ctResult === 'bleed' ? (
              <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading ICH protocol…</div>}>
                <StrokeIchProtocolStep
                  onComplete={() => {
                    completeStep(3, 'ICH protocol completed');
                    scrollToStep(4, 400);
                  }}
                  isLearningMode={workflowMode === 'study'}
                />
              </Suspense>
            ) : (
              <div className="space-y-6">
                <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 mb-2">Laboratory workup & treatment orders</h3>
                  <p className="text-sm text-slate-700 mb-4">
                    <strong>Evidence &amp; rationale (AHA/ASA 2026):</strong> Point-of-care <strong>glucose is the only mandatory lab</strong> before thrombolysis; do not delay tPA for other labs if within 4.5h (NINDS, ECASS III). Post-thrombolysis: neuro checks, BP &lt;180/105, NPO until swallow passed, no antithrombotics × 24h. SITS-ISTR, Fonarow GWTG, ARTIS.
                  </p>
                  <Suspense fallback={<div className="p-4 text-slate-500 animate-pulse">Loading orders…</div>}>
                  <CodeModeStep4
                    step2Data={step2Data || { ctResult: 'no-bleed', treatmentGiven: 'none' }}
                    onComplete={(orders) => {
                      setStep4Orders(orders);
                      completeStep(3, `Labs ordered • ${orders.length} orders selected`);
                      scrollToStep(4, 400);
                    }}
                    onCopySuccess={() => {
                      setToastMessage('Orders copied to clipboard');
                      setTimeout(() => setToastMessage(null), 2500);
                    }}
                  />
                  </Suspense>
                </section>
              </div>
            )}
          </ProtocolSection>

          {workflowMode === 'study' && (
            <DeepLearningModal
              isOpen={step3ModalOpen}
              onClose={() => setStep3ModalOpen(false)}
              sectionTitle="3. Labs & Treatment Orders"
              pearls={[...(pearls['step-3']?.deep || []), ...(pearls['step-4']?.deep || [])]}
            />
          )}
        </section>

        {/* Step 4: Code Summary & Documentation */}
        <section id="step-4" aria-labelledby="step-4-title">
          <ProtocolSection
            number={4}
            title="Code Summary & Documentation"
            status={getProtocolStatus(steps[3])}
            isActive={activeStepNumber === 4}
            showCompleteButton={false}
            showDeepLearningBadge={workflowMode === 'study'}
            pearlCount={pearls['step-5']?.deep?.length || 0}
            onDeepLearningClick={() => setStep4ModalOpen(true)}
          >
            {workflowMode === 'study' && (
              <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex gap-3">
                  <FileTextIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 space-y-3">
                    <div>
                      <h4 className="font-semibold text-green-900 mb-2">Documentation & Quality Improvement</h4>
                      <p className="text-sm text-green-800 leading-relaxed">
                        Comprehensive stroke code documentation serves multiple critical functions: medical-legal protection, quality improvement tracking, accurate billing (E/M level 5 + critical care time if applicable), and seamless care transitions. Include precise LKW time with source (family, EMS, records), NIHSS score with subscores, contraindication assessment, door-to-needle time, and detailed treatment rationale.
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-800 leading-relaxed">
                        <strong>Key Performance Metrics:</strong> National benchmarks track door-to-needle time (&lt;60 min goal, &lt;30 min excellence), imaging-to-needle time (&lt;20 min), and thrombolysis rates (8-12% of all stroke admissions). Dedicated stroke units reduce mortality by 18% and improve functional outcomes through protocol adherence, early complication detection, and coordinated multidisciplinary care (Stroke Unit Trialists Collaboration).
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-green-800 leading-relaxed">
                        <strong>Outcome Prediction:</strong> Modified Rankin Scale (mRS) at 90 days is the primary outcome measure. mRS 0-2 represents functional independence (living at home, performing all usual activities). Predictors of good outcome: lower NIHSS, shorter time to treatment, younger age, absence of diabetes, and successful recanalization. The &quot;golden hour&quot; (treatment &lt;60 minutes from onset) yields the best outcomes—50% achieve mRS 0-1 vs 38% when treated later (NINDS subgroup analysis).
                      </p>
                    </div>
                    <div className="pt-2 border-t border-green-200">
                      <p className="text-xs text-green-700">
                        <strong>References:</strong> <a href="https://www.bmj.com/content/346/bmj.f2422" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Stroke Unit Trialists Meta-Analysis</a> • <a href="https://www.ahajournals.org/doi/10.1161/STROKEAHA.118.020203" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">Get With The Guidelines Quality Metrics</a> • <a href="https://www.nejm.org/doi/full/10.1056/NEJM199512143332401" target="_blank" rel="noopener noreferrer" className="underline hover:text-green-900">NINDS tPA Trial</a>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {(workflowMode === 'code' && (!step1Data || !step2Data || steps[2]?.status !== 'completed')) ? (
              <button
                type="button"
                onClick={() => scrollToStep(!step1Data ? 1 : !step2Data ? 2 : 3)}
                className="w-full p-6 text-center text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-300 transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 mx-auto mb-2 rotate-90 group-hover:text-blue-600" />
                <p className="text-sm font-medium">Step {!step1Data ? 1 : !step2Data ? 2 : 3} is in progress — tap to jump up</p>
                <p className="text-xs mt-1 text-slate-400">Complete {!step1Data ? 'LKW, vitals, NIHSS & weight' : !step2Data ? 'CT result and treatment decision' : 'Labs & Treatment Orders or ICH protocol'}</p>
              </button>
            ) : (
              <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading summary…</div>}>
                <CodeModeStep3
                  step1Data={step1Data || DEFAULT_STEP1_DATA}
                  step2Data={step2Data || DEFAULT_STEP2_DATA}
                  step4Orders={step4Orders || []}
                  milestones={milestones}
                  timerStartTime={timerStartTime}
                  thrombectomyRecommendation={thrombectomyRecommendation ?? undefined}
                  onCopySuccess={() => {
                    setToastMessage('Code summary copied to clipboard');
                    setTimeout(() => setToastMessage(null), 2500);
                  }}
                />
              </Suspense>
            )}
          </ProtocolSection>

          {workflowMode === 'study' && (
            <DeepLearningModal
              isOpen={step4ModalOpen}
              onClose={() => setStep4ModalOpen(false)}
              sectionTitle="4. Code Summary & Documentation"
              pearls={pearls['step-5']?.deep || []}
            />
          )}
        </section>

        {/* Emergency Protocols - after code ends, near Copy to EMR */}
        <section className="mt-8 mx-4 sm:mx-6 pt-8 border-t border-slate-200" aria-labelledby="emergency-protocols-heading">
          <h2 id="emergency-protocols-heading" className="text-lg font-bold text-slate-900 mb-2">
            Emergency Protocols
          </h2>
          <p className="text-sm text-slate-600 mb-4">
            Complication protocols for use during or after thrombolysis (AHA/ASA 2026).
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setTpaReversalModalOpen(true)}
              className="min-h-[44px] flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-900 font-semibold text-left transition-colors"
              aria-label="Open tPA/TNK Reversal Protocol for symptomatic intracranial bleeding"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-red-200 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-700" aria-hidden />
              </span>
              <span>tPA/TNK Reversal Protocol</span>
            </button>
            <button
              type="button"
              onClick={() => setOrolingualEdemaModalOpen(true)}
              className="min-h-[44px] flex items-center gap-3 px-5 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-left transition-colors"
              aria-label="Open Orolingual Angioedema Protocol"
            >
              <span className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-200 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-700" aria-hidden />
              </span>
              <span>Orolingual Edema Protocol</span>
            </button>
          </div>
        </section>
      </article>

      {/* NIHSS Calculator Modal - embedded calculator; Apply syncs score to workflow, Back closes */}
      {nihssModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-xl font-bold text-slate-900">NIHSS Calculator</h2>
              <button
                onClick={() => setNihssModalOpen(false)}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close NIHSS calculator"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <Suspense fallback={<div className="p-6 text-slate-500 animate-pulse">Loading NIHSS calculator…</div>}>
                <NihssCalculatorEmbed
                  initialScore={step1Data?.nihssScore ?? 0}
                  onApply={(score) => {
                    setNihssFromModal(score);
                    setNihssModalOpen(false);
                  }}
                  onBack={() => setNihssModalOpen(false)}
                />
              </Suspense>
            </div>
          </div>
        </div>
      )}

      {/* Inclusion/Exclusion Criteria Modal - lazy when opened */}
      {eligibilityModalOpen && (
        <Suspense fallback={null}>
          <ThrombolysisEligibilityModal
            isOpen={eligibilityModalOpen}
            onClose={() => setEligibilityModalOpen(false)}
            onComplete={(data) => {
              setEligibilityResult(data);
              setEligibilityModalOpen(false);
            }}
          />
        </Suspense>
      )}

      {/* Emergency protocol modals - tPA/TNK Reversal & Orolingual Edema */}
      {tpaReversalModalOpen && (
        <Suspense fallback={null}>
          <TpaReversalProtocolModal
            isOpen={tpaReversalModalOpen}
            onClose={() => setTpaReversalModalOpen(false)}
            onCopySuccess={() => {
              setToastMessage('Copied to EMR');
              setTimeout(() => setToastMessage(null), 2500);
            }}
          />
        </Suspense>
      )}
      {orolingualEdemaModalOpen && (
        <Suspense fallback={null}>
          <OrolingualEdemaProtocolModal
            isOpen={orolingualEdemaModalOpen}
            onClose={() => setOrolingualEdemaModalOpen(false)}
            onCopySuccess={() => {
              setToastMessage('Copied to EMR');
              setTimeout(() => setToastMessage(null), 2500);
            }}
          />
        </Suspense>
      )}

      {/* Hemorrhage protocol modal - opens when ICH detected is selected */}
      {hemorrhageProtocolModalOpen && (
        <Suspense fallback={null}>
          <HemorrhageProtocolModal
            isOpen={hemorrhageProtocolModalOpen}
            onClose={() => setHemorrhageProtocolModalOpen(false)}
            onCopySuccess={() => {
              setToastMessage('Copied to EMR');
              setTimeout(() => setToastMessage(null), 2500);
            }}
          />
        </Suspense>
      )}

      {/* Door time analogue clock picker (same as LKW) */}
      {doorTimePickerOpen && (
        <Suspense fallback={<div className="fixed inset-0 z-[90] bg-black/10 flex items-center justify-center" aria-label="Loading clock" />}>
          <AnalogClockPicker
            isOpen={doorTimePickerOpen}
            onClose={() => setDoorTimePickerOpen(false)}
            onTimeSelect={(h, m, p) => {
              const doorTime = doorTimeFrom12h(h, m, p);
              setMilestones(prev => ({ ...prev, doorTime }));
              setDoorTimePickerOpen(false);
            }}
            initialHours={doorTimeTo12h(doorTimeForPicker).hour}
            initialMinutes={doorTimeTo12h(doorTimeForPicker).minute}
            initialPeriod={doorTimeTo12h(doorTimeForPicker).period}
          />
        </Suspense>
      )}

      {/* Bottom spacing + safe area for mobile (sticky CTA, notch) */}
      <div className="h-24 safe-area-inset-bottom" />

      {/* Toast for copy / reset */}
      {toastMessage && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-lg bg-slate-800 text-white text-sm font-medium shadow-lg animate-in fade-in duration-200"
          role="status"
          aria-live="polite"
        >
          {toastMessage}
        </div>
      )}
    </>
    </Suspense>
  );
};

export default function StrokeBasicsWorkflowV2() {
  const [workflowMode, setWorkflowMode] = useState<'code' | 'study'>('code'); // Default to CODE MODE
  const [pearlsData, setPearlsData] = useState<ClinicalPearlsData | null>(null);
  const [step1ModalOpen, setStep1ModalOpen] = useState(false);
  const [step2ModalOpen, setStep2ModalOpen] = useState(false);
  const [step3ModalOpen, setStep3ModalOpen] = useState(false);
  const [step4ModalOpen, setStep4ModalOpen] = useState(false);
  const [nihssModalOpen, setNihssModalOpen] = useState(false);
  const [nihssFromModal, setNihssFromModal] = useState<number | null>(null);
  const [eligibilityModalOpen, setEligibilityModalOpen] = useState(false);
  const [eligibilityResult, setEligibilityResult] = useState<ThrombolysisEligibilityData | null>(null);
  const [thrombectomyModalOpen, setThrombectomyModalOpen] = useState(false);
  const [thrombectomyRecommendation, setThrombectomyRecommendation] = useState<string | null>(null);
  const [doorTimePickerOpen, setDoorTimePickerOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [tpaReversalModalOpen, setTpaReversalModalOpen] = useState(false);
  const [orolingualEdemaModalOpen, setOrolingualEdemaModalOpen] = useState(false);
  const [hemorrhageProtocolModalOpen, setHemorrhageProtocolModalOpen] = useState(false);

  // Timer system (door time = hospital arrival; default same as timer start)
  const [timerStartTime, setTimerStartTime] = useState<Date>(new Date());
  const [timerRunning, setTimerRunning] = useState(true);
  const [milestones, setMilestones] = useState<GWTGMilestones>({ doorTime: new Date() });

  // Step 1, Step 2, Step 4 collected data (CODE MODE)
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [step4Orders, setStep4Orders] = useState<string[]>([]);

  const [steps, setSteps] = useState<Step[]>([
    { 
      id: 1, 
      title: 'Last Known Well & Eligibility', 
      subtitle: 'Treatment window & eligibility assessment', 
      status: 'active', 
      isExpanded: true,
      startedAt: new Date() // Workflow start time
    },
    { id: 2, title: 'LVO Screening', subtitle: 'Large vessel occlusion detection', status: 'locked', isExpanded: false },
    { id: 3, title: 'Labs & Treatment Orders', subtitle: 'Laboratory workup and orders (evidence-based)', status: 'locked', isExpanded: false },
    { id: 4, title: 'Code Summary & Documentation', subtitle: 'GWTG note & hemorrhage protocol', status: 'locked', isExpanded: false },
  ]);

  useEffect(() => {
    // Initialize timer on mount (door time already set in initial milestones state)
    const now = new Date();
    setTimerStartTime(now);
    setTimerRunning(true);
  }, []);

  // Load clinical pearls async to reduce initial bundle (~110KB) and improve LCP
  useEffect(() => {
    import('../../data/strokeClinicalPearls').then((m) => setPearlsData(m.STROKE_CLINICAL_PEARLS));
  }, []);

  // When ICH is detected in Step 2, update Step 3 title to ICH Protocol
  useEffect(() => {
    if (step2Data?.ctResult === 'bleed') {
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, title: 'ICH Protocol', subtitle: 'Acute ICH management (AHA/ASA)' } : s));
    } else {
      setSteps(prev => prev.map(s => s.id === 3 ? { ...s, title: 'Labs & Treatment Orders', subtitle: 'Laboratory workup and orders (evidence-based)' } : s));
    }
  }, [step2Data?.ctResult]);

  // Find the active step (the one that's "active" or in-progress)
  const activeStep = steps.find(s => s.status === 'active') || steps[0];
  const activeStepNumber = activeStep.id;

  const toggleStep = (id: number) => {
    setSteps(prev => prev.map(step => {
      if (step.id === id && step.status !== 'locked') {
        return { ...step, isExpanded: !step.isExpanded };
      }
      return step;
    }));
  };

  const handleThrombectomyRecommendation = (recommendation: string) => {
    setThrombectomyRecommendation(recommendation);
    // Update step 2 completion summary to include the recommendation
    setSteps(prev => prev.map(step => {
      if (step.id === 2) {
        return {
          ...step,
          completionSummary: `LVO screening completed • Thrombectomy recommendation: ${recommendation}`
        };
      }
      return step;
    }));
  };

  const completeStep = (id: number, summary?: string) => {
    const completionTime = new Date(); // Capture completion timestamp
    
    setSteps(prev => {
      const newSteps = prev.map(step => {
        if (step.id === id) {
          // If this is step 2 and we have a thrombectomy recommendation, include it
          const finalSummary = (id === 2 && thrombectomyRecommendation && !summary?.includes('Thrombectomy recommendation'))
            ? `${summary || 'LVO screening completed'} • Thrombectomy recommendation: ${thrombectomyRecommendation}`
            : summary;
          return { 
            ...step, 
            status: 'completed' as StepStatus, 
            isExpanded: false,
            completionSummary: finalSummary,
            completedAt: completionTime // Record completion time
          };
        }
        // Unlock next step and record start time
        if (step.id === id + 1) {
          return { 
            ...step, 
            status: 'active' as StepStatus, 
            isExpanded: true,
            startedAt: completionTime // Record when next step starts
          };
        }
        return step;
      });
      return newSteps;
    });
    
    // Auto-scroll to next step if it exists - use longer delay to ensure DOM updates
    if (id < 4) {
      scrollToStep(id + 1, 300);
    }
  };

  // Utility function to scroll to a step - works on both web and mobile
  // Scrolls so the bottom of the clock (sticky header) aligns with the top of the next section
  const scrollToStep = (stepId: number, delay: number = 150) => {
    setTimeout(() => {
      const element = document.getElementById(`step-${stepId}`);
      if (element) {
        // Dynamically measure the sticky header height (bottom of clock)
        // Look for the sticky header by data attribute or class
        const stickyHeader = document.querySelector('[data-header-height]') as HTMLElement || 
                            document.querySelector('.sticky.top-0') as HTMLElement;
        let headerOffset = 120; // Default fallback
        
        if (stickyHeader) {
          // Get the actual height of the sticky header (this includes the clock row)
          // Use data attribute if available, otherwise measure directly
          const dataHeight = stickyHeader.getAttribute('data-header-height');
          headerOffset = dataHeight ? parseInt(dataHeight, 10) : stickyHeader.offsetHeight;
        }
        
        // Calculate target scroll position
        const elementRect = element.getBoundingClientRect();
        const currentScrollY = window.pageYOffset || document.documentElement.scrollTop || window.scrollY || 0;
        const elementTop = elementRect.top + currentScrollY;
        // Use the bottom of the clock (header height) as the stop point
        const targetScroll = Math.max(0, elementTop - headerOffset);
        
        // Use requestAnimationFrame for smoother scrolling
        requestAnimationFrame(() => {
          window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
          });
          
          // Double-check and force scroll if needed (for mobile browsers)
          setTimeout(() => {
            const actualScroll = window.pageYOffset || document.documentElement.scrollTop || 0;
            if (Math.abs(actualScroll - targetScroll) > 100) {
              // Force scroll using scrollIntoView as fallback
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              // Adjust for header
              requestAnimationFrame(() => {
                window.scrollBy({ top: -headerOffset, behavior: 'smooth' });
              });
            }
          }, 300);
        });
      }
    }, delay);
  };

  // Handler for step navigation clicks
  const handleStepClick = (stepId: number) => {
    const step = steps.find(s => s.id === stepId);
    if (step && step.status !== 'locked') {
      // Mark this step as active and update others
      setSteps(prev => prev.map(s => ({
        ...s,
        status: s.id === stepId ? 'active' : (s.status === 'active' ? 'completed' : s.status)
      })));
      
      // Scroll to the step section
      scrollToStep(stepId);
    }
  };

  // Convert step status to protocol section status
  const getProtocolStatus = (step: Step): 'in-progress' | 'pending' | 'completed' => {
    if (step.status === 'completed') return 'completed';
    if (step.status === 'active') return 'in-progress';
    return 'pending';
  };

  return (
    <StrokeBasicsLayout
      leftSidebar={null}
      mainContent={
        <MainContent
          workflowMode={workflowMode}
          setWorkflowMode={setWorkflowMode}
          steps={steps}
          toggleStep={toggleStep}
          completeStep={completeStep}
          activeStepNumber={activeStepNumber}
          getProtocolStatus={getProtocolStatus}
          handleStepClick={handleStepClick}
          step1ModalOpen={step1ModalOpen}
          setStep1ModalOpen={setStep1ModalOpen}
          step2ModalOpen={step2ModalOpen}
          setStep2ModalOpen={setStep2ModalOpen}
          step3ModalOpen={step3ModalOpen}
          setStep3ModalOpen={setStep3ModalOpen}
          step4ModalOpen={step4ModalOpen}
          setStep4ModalOpen={setStep4ModalOpen}
          thrombectomyModalOpen={thrombectomyModalOpen}
          setThrombectomyModalOpen={setThrombectomyModalOpen}
          onThrombectomyRecommendation={handleThrombectomyRecommendation}
          thrombectomyRecommendation={thrombectomyRecommendation}
          timerStartTime={timerStartTime}
          setTimerStartTime={setTimerStartTime}
          timerRunning={timerRunning}
          setTimerRunning={setTimerRunning}
          milestones={milestones}
          setMilestones={setMilestones}
          setStep1Data={setStep1Data}
          step1Data={step1Data}
          setStep2Data={setStep2Data}
          step2Data={step2Data}
          step4Orders={step4Orders}
          setStep4Orders={setStep4Orders}
          setSteps={setSteps}
          scrollToStep={scrollToStep}
          nihssModalOpen={nihssModalOpen}
          setNihssModalOpen={setNihssModalOpen}
          eligibilityModalOpen={eligibilityModalOpen}
          setEligibilityModalOpen={setEligibilityModalOpen}
          doorTimePickerOpen={doorTimePickerOpen}
          setDoorTimePickerOpen={setDoorTimePickerOpen}
          nihssFromModal={nihssFromModal}
          setNihssFromModal={setNihssFromModal}
          eligibilityResult={eligibilityResult}
          setEligibilityResult={setEligibilityResult}
          toastMessage={toastMessage}
          setToastMessage={setToastMessage}
          tpaReversalModalOpen={tpaReversalModalOpen}
          setTpaReversalModalOpen={setTpaReversalModalOpen}
          orolingualEdemaModalOpen={orolingualEdemaModalOpen}
          setOrolingualEdemaModalOpen={setOrolingualEdemaModalOpen}
          hemorrhageProtocolModalOpen={hemorrhageProtocolModalOpen}
          setHemorrhageProtocolModalOpen={setHemorrhageProtocolModalOpen}
          pearlsData={pearlsData}
        />
      }
    />
  );
}
