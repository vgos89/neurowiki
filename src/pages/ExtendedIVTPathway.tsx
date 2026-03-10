import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock, AlertTriangle, CheckCircle, XCircle, RotateCcw,
  Activity, Info, Brain, Zap, ArrowRight, ChevronRight,
} from 'lucide-react';
import { LKWTimePicker } from '../components/article/stroke/LKWTimePicker';

/* ─── Types ─────────────────────────────────────────────────────── */

export interface ExtendedIVTPathwayProps {
  hideHeader?: boolean;
  isInModal?: boolean;
  onResultChange?: (result: IVTResult | null) => void;
}

export interface IVTResult {
  eligible: boolean;
  cor: '2a' | '2b';
  path: 'A' | 'B' | 'C-LVO' | 'C-NonLVO';
  trialsBasis: string[];
}

type ImagingModality = 'mri' | 'ctp' | null;
type ActivePath = 'A' | 'B' | 'C' | null;
type YesNo = boolean | null;

/* ─── Trial registry ──────────────────────────────────────────── */

interface TrialInfo { journal: string; year: number; cor: string; loe: string; }

const TRIALS: Record<string, TrialInfo> = {
  'WAKE-UP': { journal: 'NEJM', year: 2018, cor: '2a', loe: 'B-R' },
  'THAWS':   { journal: 'Stroke', year: 2018, cor: '2a', loe: 'B-R' },
  'EXTEND':  { journal: 'NEJM', year: 2019, cor: '2a', loe: 'B-R' },
  'ECASS-4': { journal: 'Stroke', year: 2019, cor: '—', loe: 'B-R' },
  'TIMELESS':{ journal: 'NEJM', year: 2024, cor: '2b', loe: 'B-R' },
  'TRACE-3': { journal: 'NEJM', year: 2023, cor: '2b', loe: 'B-R' },
  'OPTION':  { journal: 'JAMA', year: 2024, cor: '2b*', loe: 'B-R' },
};

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatElapsed(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

type ElapsedWindow = 'standard' | 'B' | 'C' | 'outside';
function getWindow(hours: number): ElapsedWindow {
  if (hours < 4.5) return 'standard';
  if (hours <= 9)  return 'B';
  if (hours <= 24) return 'C';
  return 'outside';
}

const WINDOW_LABELS: Record<ElapsedWindow, string> = {
  standard: 'Within standard 4.5h window',
  B: '4.5–9h window',
  C: '4.5–24h window',
  outside: 'Outside extended window (>24h)',
};

function elapsedBadgeCls(hours: number): string {
  if (hours < 4.5) return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700';
  if (hours <= 9)  return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700';
  if (hours <= 24) return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700';
  return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700';
}

/* ─── Sub-components ──────────────────────────────────────────── */

const TrialBadge: React.FC<{ name: string }> = ({ name }) => {
  const t = TRIALS[name];
  if (!t) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2 py-0.5 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700">
      {name} · {t.journal} {t.year}
      {t.cor !== '—' && (
        <span className="opacity-60 ml-0.5">· COR {t.cor}</span>
      )}
    </span>
  );
};

const CORBadge: React.FC<{ cor: string; loe: string }> = ({ cor, loe }) => {
  const isWeak = cor === '2b';
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-bold rounded px-2 py-0.5 border ${
      isWeak
        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700'
        : 'bg-neuro-100 text-neuro-700 border-neuro-200 dark:bg-neuro-900/20 dark:text-neuro-300 dark:border-neuro-700'
    }`}>
      COR {cor} · LOE {loe}
    </span>
  );
};

const YesNoButtons: React.FC<{
  value: YesNo;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  yesLabel?: string;
  noLabel?: string;
}> = ({ value, onChange, disabled, yesLabel = 'Yes', noLabel = 'No' }) => (
  <div className="flex gap-2 shrink-0">
    <button
      onClick={() => !disabled && onChange(true)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
        value === true
          ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-emerald-400 hover:text-emerald-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {yesLabel}
    </button>
    <button
      onClick={() => !disabled && onChange(false)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border-2 ${
        value === false
          ? 'bg-red-600 border-red-600 text-white shadow-sm'
          : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-red-400 hover:text-red-700'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {noLabel}
    </button>
  </div>
);

interface DecisionRowProps {
  question: string;
  helpText?: string;
  trials?: string[];
  value: YesNo;
  onChange: (v: boolean) => void;
  ineligibleReason?: string;
  eligibleNote?: string;
  hidden?: boolean;
}

const DecisionRow: React.FC<DecisionRowProps> = ({
  question, helpText, trials, value, onChange,
  ineligibleReason, eligibleNote, hidden,
}) => {
  if (hidden) return null;
  return (
    <div className={`p-4 rounded-lg border transition-all ${
      value === false
        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
        : value === true
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10'
          : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30'
    }`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{question}</p>
          {helpText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helpText}</p>
          )}
          {trials && trials.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {trials.map(t => <TrialBadge key={t} name={t} />)}
            </div>
          )}
        </div>
        <YesNoButtons value={value} onChange={onChange} />
      </div>
      {value === false && ineligibleReason && (
        <div className="mt-3 flex items-center gap-2 text-red-700 dark:text-red-300">
          <XCircle className="w-4 h-4 shrink-0" />
          <p className="text-xs font-semibold">{ineligibleReason}</p>
        </div>
      )}
      {value === true && eligibleNote && (
        <div className="mt-3 flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
          <Info className="w-4 h-4 shrink-0" />
          <p className="text-xs font-medium">{eligibleNote}</p>
        </div>
      )}
    </div>
  );
};

const Cor2bBanner: React.FC<{ optionNote?: boolean }> = ({ optionNote }) => (
  <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-700 dark:text-amber-300">
    <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
    <div>
      <p className="text-xs font-bold">COR 2b — Weaker Evidence · Expert Discretion Required</p>
      <p className="text-xs mt-0.5">Document shared decision-making with patient/surrogate before administration.</p>
      {optionNote && (
        <p className="text-xs mt-1 font-semibold pt-1 border-t border-amber-200 dark:border-amber-700">
          ★ OPTION trial (non-LVO extended window) was published after the 2026 AHA/ASA Guideline — not yet formally incorporated.
        </p>
      )}
    </div>
  </div>
);

const SectionCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => (
  <div className={`rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm ${className}`}>
    {children}
  </div>
);

const SectionHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  badge?: React.ReactNode;
}> = ({ icon, title, badge }) => (
  <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
    <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
      {icon}
    </div>
    <span className="text-sm font-bold text-slate-900 dark:text-white flex-1">{title}</span>
    {badge}
  </div>
);

/* ─── EVT barrier selector ────────────────────────────────────── */

const EVT_BARRIERS = [
  { id: 'no-center', label: 'No EVT-capable center accessible' },
  { id: 'contraindication', label: 'Medical contraindication to EVT' },
  { id: 'refusal', label: 'Patient / surrogate declining EVT' },
  { id: 'anatomical', label: 'Anatomical / technical barrier' },
] as const;

type EVTBarrierId = typeof EVT_BARRIERS[number]['id'];

/* ─── Dosing card ─────────────────────────────────────────────── */

const DosingCard: React.FC<{ cor: '2a' | '2b'; trialsBasis: string[]; showBothAgents: boolean }> = ({
  cor, trialsBasis, showBothAgents,
}) => (
  <div className="space-y-3">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <div className="p-3 rounded-lg bg-neuro-50 border border-neuro-200 dark:bg-neuro-900/20 dark:border-neuro-700">
        <div className="flex items-center gap-1.5 mb-1.5">
          <Zap className="w-3.5 h-3.5 text-neuro-600 dark:text-neuro-400" />
          <p className="text-xs font-bold text-neuro-800 dark:text-neuro-300">Tenecteplase (TNK)</p>
          <span className="text-xs text-neuro-600 dark:text-neuro-400 font-medium">Preferred</span>
        </div>
        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">0.25 mg/kg IV bolus</p>
        <p className="text-xs text-slate-600 dark:text-slate-400">Maximum dose: 25 mg</p>
        <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">Single bolus over 5–10 sec</p>
      </div>
      {showBothAgents && (
        <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-800 dark:border-slate-600">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Activity className="w-3.5 h-3.5 text-slate-500" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Alteplase (tPA)</p>
          </div>
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">0.9 mg/kg IV infusion</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">Maximum dose: 90 mg</p>
          <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">10% bolus + 90% over 60 min</p>
        </div>
      )}
    </div>
    <div>
      <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">Evidence basis:</p>
      <div className="flex flex-wrap gap-1">
        {trialsBasis.map(t => <TrialBadge key={t} name={t} />)}
      </div>
    </div>
    {cor === '2b' && (
      <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
        ⚠️ COR 2b — document shared decision-making before administration
      </p>
    )}
  </div>
);

/* ─── Main component ──────────────────────────────────────────── */

const ExtendedIVTPathway: React.FC<ExtendedIVTPathwayProps> = ({
  hideHeader = false,
  isInModal = false,
  onResultChange,
}) => {
  /* ── Setup state ── */
  const [lkwPickerOpen, setLkwPickerOpen] = useState(false);
  const [lkwTimestamp, setLkwTimestamp] = useState<Date | null>(null);
  const [lkwUnknown, setLkwUnknown] = useState(false);
  const [elapsedHours, setElapsedHours] = useState<number | null>(null);
  const [imagingModality, setImagingModality] = useState<ImagingModality>(null);

  /* ── Path A state ── */
  const [aRecognition, setARecognition] = useState<YesNo>(null);
  const [aDwiSmall, setADwiSmall] = useState<YesNo>(null);
  const [aFlair, setAFlair] = useState<YesNo>(null);

  /* ── Path B state ── */
  const [bCtpCore, setBCtpCore] = useState<YesNo>(null);
  const [bCtpMismatch, setBCtpMismatch] = useState<YesNo>(null);
  const [bMriPerfusion, setBMriPerfusion] = useState<YesNo>(null);
  const [bMriMismatch, setBMriMismatch] = useState<YesNo>(null);
  const [bEvt, setBEvt] = useState<YesNo>(null);

  /* ── Path C state ── */
  const [cPenumbra, setCPenumbra] = useState<YesNo>(null);
  const [cLvo, setCLvo] = useState<YesNo>(null);
  const [cLvoEvt, setCLvoEvt] = useState<YesNo>(null);
  const [cLvoBarrier, setCLvoBarrier] = useState<EVTBarrierId | null>(null);
  const [cNonLvoExpertise, setCNonLvoExpertise] = useState<YesNo>(null);

  /* ── Live elapsed time counter ── */
  useEffect(() => {
    if (!lkwTimestamp || lkwUnknown) {
      setElapsedHours(null);
      return;
    }
    const calc = () => Math.max(0, (Date.now() - lkwTimestamp.getTime()) / 3_600_000);
    setElapsedHours(calc());
    const id = setInterval(() => setElapsedHours(calc()), 30_000);
    return () => clearInterval(id);
  }, [lkwTimestamp, lkwUnknown]);

  /* ── Determine active path ── */
  const setupComplete = lkwUnknown || lkwTimestamp !== null;
  const modalitySet = imagingModality !== null;

  const activePath: ActivePath = (() => {
    if (!setupComplete || !modalitySet) return null;
    if (lkwUnknown) return 'A';
    if (elapsedHours === null) return null;
    const w = getWindow(elapsedHours);
    if (w === 'B') return 'B';
    if (w === 'C') return 'C';
    return null; // 'standard' or 'outside' handled separately
  })();

  /* ── Path A ineligible chain ── */
  const aIneligible: string | null = (() => {
    if (aRecognition === false) return 'Not within 4.5h of symptom recognition — not eligible for Path A';
    if (aDwiSmall === false) return 'DWI lesion ≥ 1/3 MCA territory — infarct too large';
    if (aFlair === false) return 'No DWI-FLAIR mismatch — tissue no longer viable for thrombolysis';
    return null;
  })();

  const aEligible = aRecognition === true && aDwiSmall === true && aFlair === true;

  /* ── Path B ineligible chain ── */
  const bIneligible: string | null = (() => {
    if (imagingModality === 'ctp') {
      if (bCtpCore === false) return 'Ischemic core ≥ 70 mL — infarct too large, high hemorrhage risk';
      if (bCtpMismatch === false) return 'Mismatch criteria not met — no significant salvageable penumbra';
    } else {
      if (bMriPerfusion === false) return 'No MRI perfusion deficit beyond DWI lesion';
      if (bMriMismatch === false) return 'Diffusion-perfusion mismatch not confirmed';
    }
    return null;
  })();

  const bCriteriaComplete = imagingModality === 'ctp'
    ? (bCtpCore === true && bCtpMismatch === true)
    : (bMriPerfusion === true && bMriMismatch === true);

  const bEligible = bCriteriaComplete && bEvt !== null;

  /* ── Path C-LVO / C-NonLVO ineligible chain ── */
  const cIneligible: string | null = (() => {
    if (cPenumbra === false) return 'No salvageable penumbra on perfusion imaging — not eligible';
    if (cLvo === true && cLvoEvt === true) return null; // redirect handled separately
    return null;
  })();

  const cLvoEligible = cPenumbra === true && cLvo === true && cLvoEvt === false && cLvoBarrier !== null;
  const cNonLvoEligible = cPenumbra === true && cLvo === false && cNonLvoExpertise !== null;

  /* ── Notify parent of result changes ── */
  useEffect(() => {
    if (!onResultChange) return;
    if (aEligible) {
      onResultChange({ eligible: true, cor: '2a', path: 'A', trialsBasis: ['WAKE-UP', 'THAWS'] });
    } else if (bEligible) {
      onResultChange({ eligible: true, cor: '2a', path: 'B', trialsBasis: ['EXTEND', 'THAWS'] });
    } else if (cLvoEligible) {
      onResultChange({ eligible: true, cor: '2b', path: 'C-LVO', trialsBasis: ['TIMELESS', 'TRACE-3'] });
    } else if (cNonLvoEligible) {
      onResultChange({ eligible: true, cor: '2b', path: 'C-NonLVO', trialsBasis: ['OPTION', 'TRACE-3'] });
    } else {
      onResultChange(null);
    }
  }, [aEligible, bEligible, cLvoEligible, cNonLvoEligible, onResultChange]);

  /* ── Reset handler ── */
  const handleReset = useCallback(() => {
    setLkwTimestamp(null); setLkwUnknown(false); setElapsedHours(null);
    setImagingModality(null);
    setARecognition(null); setADwiSmall(null); setAFlair(null);
    setBCtpCore(null); setBCtpMismatch(null); setBMriPerfusion(null); setBMriMismatch(null); setBEvt(null);
    setCPenumbra(null); setCLvo(null); setCLvoEvt(null); setCLvoBarrier(null); setCNonLvoExpertise(null);
  }, []);

  /* ── LKW handlers ── */
  const handleLKWConfirm = useCallback((date: Date) => {
    setLkwTimestamp(date);
    setLkwUnknown(false);
    // Reset downstream path state
    setARecognition(null); setADwiSmall(null); setAFlair(null);
    setBCtpCore(null); setBCtpMismatch(null); setBMriPerfusion(null); setBMriMismatch(null); setBEvt(null);
    setCPenumbra(null); setCLvo(null); setCLvoEvt(null); setCLvoBarrier(null); setCNonLvoExpertise(null);
  }, []);

  const handleLKWUnknown = useCallback(() => {
    setLkwUnknown(true);
    setLkwTimestamp(null);
    setARecognition(null); setADwiSmall(null); setAFlair(null);
    setBCtpCore(null); setBCtpMismatch(null); setBMriPerfusion(null); setBMriMismatch(null); setBEvt(null);
    setCPenumbra(null); setCLvo(null); setCLvoEvt(null); setCLvoBarrier(null); setCNonLvoExpertise(null);
  }, []);

  /* ─── Render ─────────────────────────────────────────────────── */

  const containerCls = isInModal
    ? 'flex flex-col h-full overflow-hidden'
    : 'min-h-screen bg-slate-50 dark:bg-slate-950';

  const contentCls = isInModal
    ? 'flex-1 overflow-y-auto p-4 space-y-4'
    : 'max-w-2xl mx-auto px-4 py-6 space-y-4';

  return (
    <div className={containerCls}>
      {/* Header */}
      {!hideHeader && (
        <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-4">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-neuro-500 flex items-center justify-center shrink-0">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold text-slate-900 dark:text-white">
                  Extended Window IVT Pathway
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  AIS · Beyond standard 4.5h · 2026 AHA/ASA Guideline
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      )}

      <div className={contentCls}>

        {/* ── SECTION 0: PATIENT SETUP ───────────────────────── */}
        <SectionCard>
          <SectionHeader
            icon={<Clock className="w-4 h-4 text-white" />}
            title="Patient Setup"
            badge={setupComplete && modalitySet
              ? <CheckCircle className="w-4 h-4 text-emerald-500" />
              : undefined}
          />
          <div className="p-4 space-y-4">

            {/* LKW time */}
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Last Known Well (LKW) Time
              </p>
              {!lkwTimestamp && !lkwUnknown ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setLkwPickerOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neuro-500 text-white text-sm font-semibold hover:bg-neuro-600 transition-colors shadow-sm"
                  >
                    <Clock className="w-4 h-4" />
                    Set LKW Time
                  </button>
                  <button
                    onClick={handleLKWUnknown}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:border-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                  >
                    Unknown / Wake-up Stroke
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3 flex-wrap">
                  {lkwUnknown ? (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-100 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-700">
                      <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-300" />
                      <span className="text-sm font-semibold text-amber-800 dark:text-amber-300">Unknown / Wake-up stroke</span>
                    </div>
                  ) : elapsedHours !== null ? (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border font-semibold text-sm ${elapsedBadgeCls(elapsedHours)}`}>
                      <Clock className="w-4 h-4" />
                      <span>{formatElapsed(elapsedHours)} elapsed</span>
                      <span className="font-normal text-xs opacity-70">· {WINDOW_LABELS[getWindow(elapsedHours)]}</span>
                    </div>
                  ) : null}
                  <button
                    onClick={() => {
                      setLkwTimestamp(null);
                      setLkwUnknown(false);
                      setElapsedHours(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 underline transition-colors"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Imaging modality */}
            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Facility Imaging Available
              </p>
              <div className="flex gap-2 flex-wrap">
                {(['mri', 'ctp'] as const).map(m => (
                  <button
                    key={m}
                    onClick={() => {
                      setImagingModality(m);
                      // Reset path-specific imaging state when modality changes
                      setBCtpCore(null); setBCtpMismatch(null);
                      setBMriPerfusion(null); setBMriMismatch(null);
                    }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all border-2 ${
                      imagingModality === m
                        ? 'bg-neuro-500 border-neuro-500 text-white shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-neuro-400'
                    }`}
                  >
                    {m === 'mri' ? (
                      <>
                        <Brain className="w-4 h-4" />
                        MRI <span className="font-normal opacity-80 text-xs">(DWI + FLAIR / PWI)</span>
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        CT Perfusion <span className="font-normal opacity-80 text-xs">(RAPID / equivalent)</span>
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── STATUS MESSAGES (when setup is complete) ────────── */}

        {/* Not in extended window */}
        {setupComplete && modalitySet && !lkwUnknown && elapsedHours !== null && getWindow(elapsedHours) === 'standard' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-700">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                Patient is within the standard 4.5h window
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                Use the standard IVT eligibility pathway. Extended window criteria do not apply.
              </p>
            </div>
          </div>
        )}

        {/* Outside all windows */}
        {setupComplete && modalitySet && !lkwUnknown && elapsedHours !== null && getWindow(elapsedHours) === 'outside' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border-2 border-red-200 dark:bg-red-900/10 dark:border-red-700">
            <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-red-800 dark:text-red-300">
                Outside extended window — &gt;24h from last known well
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-0.5">
                Patient is beyond all evidence-supported extended thrombolysis windows. IV thrombolysis is not indicated.
              </p>
            </div>
          </div>
        )}

        {/* Unknown onset + CTP only */}
        {setupComplete && modalitySet && lkwUnknown && imagingModality === 'ctp' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border-2 border-amber-200 dark:bg-amber-900/10 dark:border-amber-700">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">MRI Required for Unknown-Onset Pathway</p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                The WAKE-UP and THAWS trials require <strong>DWI + FLAIR MRI</strong> to demonstrate DWI-FLAIR mismatch.
                CT Perfusion alone cannot replace this criterion for unknown-onset stroke.
              </p>
            </div>
          </div>
        )}

        {/* ── PATH A ───────────────────────────────────────────── */}
        {activePath === 'A' && imagingModality === 'mri' && (
          <SectionCard>
            <SectionHeader
              icon={<Brain className="w-4 h-4 text-white" />}
              title="Path A — Unknown Onset: DWI-FLAIR Mismatch"
              badge={<CORBadge cor="2a" loe="B-R" />}
            />
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1 mb-1">
                <TrialBadge name="WAKE-UP" />
                <TrialBadge name="THAWS" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                For patients with unknown onset or wake-up stroke, IVT is guided by MRI DWI-FLAIR mismatch
                (DWI positive = acute ischemia; FLAIR negative = tissue still viable). All criteria below must be met.
              </p>

              <DecisionRow
                question="Are you within 4.5h of when symptoms were first recognized?"
                helpText="E.g., time of awakening with symptoms, or time witness noticed deficit"
                trials={['WAKE-UP']}
                value={aRecognition}
                onChange={setARecognition}
                ineligibleReason="Must treat within 4.5h of symptom recognition — not first last-seen-well time"
              />

              <DecisionRow
                question="DWI lesion smaller than 1/3 of the MCA territory?"
                helpText="Visually estimate on axial DWI sequence"
                trials={['WAKE-UP', 'THAWS']}
                value={aDwiSmall}
                onChange={setADwiSmall}
                hidden={aRecognition === null || aRecognition === false}
                ineligibleReason="DWI lesion ≥ 1/3 MCA territory — infarct volume too large for safe thrombolysis"
              />

              <DecisionRow
                question="DWI-FLAIR mismatch present? (DWI positive / no marked FLAIR signal change)"
                helpText="DWI positive = acute stroke; FLAIR negative in same territory = tissue still viable (not yet infarcted)"
                trials={['WAKE-UP']}
                value={aFlair}
                onChange={setAFlair}
                hidden={aDwiSmall === null || aDwiSmall === false}
                ineligibleReason="FLAIR already positive — tissue is established infarct, thrombolysis is unlikely to benefit"
                eligibleNote="DWI-FLAIR mismatch confirmed — patient meets imaging criteria"
              />

              {/* Eligible result */}
              {aEligible && !aIneligible && (
                <div className="mt-1 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-600">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Eligible — Extended Window IVT (COR 2a)
                    </p>
                  </div>
                  <DosingCard cor="2a" trialsBasis={['WAKE-UP', 'THAWS']} showBothAgents={true} />
                  <div className="mt-3 flex justify-end">
                    <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> New patient
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── PATH B ───────────────────────────────────────────── */}
        {activePath === 'B' && (
          <SectionCard>
            <SectionHeader
              icon={<Activity className="w-4 h-4 text-white" />}
              title={`Path B — 4.5–9h: Perfusion Mismatch ${imagingModality === 'ctp' ? '(CT Perfusion)' : '(MRI-PWI)'}`}
              badge={<CORBadge cor="2a" loe="B-R" />}
            />
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-1 mb-1">
                <TrialBadge name="EXTEND" />
                <TrialBadge name="THAWS" />
                <TrialBadge name="ECASS-4" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Salvageable ischemic penumbra must be demonstrated on automated perfusion imaging. Criteria differ by modality.
              </p>

              {imagingModality === 'ctp' ? (
                <>
                  <DecisionRow
                    question="Ischemic core (CBF &lt;30%) &lt; 70 mL?"
                    helpText="Measured on RAPID or equivalent automated software. Core ≥ 70 mL indicates large established infarct."
                    trials={['EXTEND']}
                    value={bCtpCore}
                    onChange={setBCtpCore}
                    ineligibleReason="Ischemic core ≥ 70 mL — infarct too large, high risk of hemorrhagic transformation"
                  />
                  <DecisionRow
                    question="Mismatch volume > 10 mL AND mismatch ratio > 1.2?"
                    helpText="Mismatch = Tmax >6s volume minus core. Volume >10mL AND ratio (mismatch/core) >1.2 required."
                    trials={['EXTEND']}
                    value={bCtpMismatch}
                    onChange={setBCtpMismatch}
                    hidden={bCtpCore === null || bCtpCore === false}
                    ineligibleReason="Mismatch criteria not met — insufficient salvageable penumbra to justify extended window IVT"
                    eligibleNote="Perfusion mismatch confirmed — significant salvageable penumbra present"
                  />
                </>
              ) : (
                <>
                  <DecisionRow
                    question="MRI-PWI perfusion deficit beyond the DWI lesion?"
                    helpText="Perfusion-weighted imaging (PWI) shows area of hypoperfusion larger than the DWI lesion"
                    trials={['THAWS']}
                    value={bMriPerfusion}
                    onChange={setBMriPerfusion}
                    ineligibleReason="No perfusion deficit beyond DWI — no salvageable penumbra"
                  />
                  <DecisionRow
                    question="Diffusion-perfusion mismatch confirmed? (Mismatch ratio > 1.2)"
                    helpText="PWI lesion volume / DWI lesion volume > 1.2"
                    trials={['THAWS']}
                    value={bMriMismatch}
                    onChange={setBMriMismatch}
                    hidden={bMriPerfusion === null || bMriPerfusion === false}
                    ineligibleReason="Diffusion-perfusion mismatch insufficient — does not meet THAWS criteria"
                    eligibleNote="Diffusion-perfusion mismatch confirmed — salvageable penumbra present"
                  />
                </>
              )}

              {/* EVT question — shown after imaging criteria met */}
              {bCriteriaComplete && !bIneligible && (
                <div className={`p-4 rounded-lg border transition-all ${
                  bEvt === true
                    ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
                    : bEvt === false
                      ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10'
                      : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30'
                }`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Is EVT (thrombectomy) also indicated for this patient?
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        LVO confirmed on CTA/MRA + eligible for thrombectomy
                      </p>
                    </div>
                    <YesNoButtons value={bEvt} onChange={setBEvt} />
                  </div>
                  {bEvt === true && (
                    <div className="mt-3 flex items-start gap-2 text-blue-700 dark:text-blue-300">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">
                        EVT is the preferred reperfusion strategy. IVT may be given as a bridge if door-to-groin &gt;30 min and no delay anticipated. Proceed to EVT pathway.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Eligible result */}
              {bEligible && !bIneligible && (
                <div className="mt-1 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-600">
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-bold text-emerald-800 dark:text-emerald-300">
                      Eligible — Extended Window IVT (COR 2a)
                    </p>
                  </div>
                  <DosingCard cor="2a" trialsBasis={['EXTEND', 'THAWS']} showBothAgents={imagingModality === 'mri'} />
                  {bEvt === true && (
                    <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-2">
                      ℹ️ EVT also indicated — coordinate with endovascular team. IVT as bridge only if no delay to EVT.
                    </p>
                  )}
                  <div className="mt-3 flex justify-end">
                    <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                      <RotateCcw className="w-3.5 h-3.5" /> New patient
                    </button>
                  </div>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── PATH C ───────────────────────────────────────────── */}
        {activePath === 'C' && (
          <SectionCard>
            <SectionHeader
              icon={<Zap className="w-4 h-4 text-white" />}
              title="Path C — 4.5–24h: LVO or Non-LVO Extended Window"
              badge={<CORBadge cor="2b" loe="B-R" />}
            />
            <div className="p-4 space-y-3">
              <Cor2bBanner optionNote={false} />
              <div className="flex flex-wrap gap-1 mb-1">
                <TrialBadge name="TIMELESS" />
                <TrialBadge name="TRACE-3" />
                <TrialBadge name="OPTION" />
              </div>

              {/* Shared entry: perfusion mismatch */}
              <DecisionRow
                question="Salvageable penumbra / target mismatch confirmed on perfusion imaging?"
                helpText="Required for all Path C sub-pathways. CT-P or MRI-PWI showing ischemic core with surrounding hypoperfused but viable tissue."
                trials={['TIMELESS', 'TRACE-3', 'OPTION']}
                value={cPenumbra}
                onChange={setCPenumbra}
                ineligibleReason="No salvageable penumbra — extended window IVT not supported without target mismatch"
              />

              {/* LVO question */}
              <DecisionRow
                question="LVO (large vessel occlusion) confirmed on CTA or MRA?"
                helpText="Internal carotid artery, M1/M2 MCA, basilar artery, or other proximal occlusion"
                trials={['TIMELESS', 'TRACE-3']}
                value={cLvo}
                onChange={(v) => {
                  setCLvo(v);
                  setCLvoEvt(null); setCLvoBarrier(null); setCNonLvoExpertise(null);
                }}
                hidden={cPenumbra === null || cPenumbra === false}
              />

              {/* ── PATH C-LVO branch ── */}
              {cPenumbra === true && cLvo === true && (
                <div className="space-y-3 pl-4 border-l-2 border-neuro-300 dark:border-neuro-700">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-neuro-500" />
                    <p className="text-xs font-bold text-neuro-700 dark:text-neuro-300">
                      PATH C-LVO · TIMELESS + TRACE-3
                    </p>
                    <TrialBadge name="TIMELESS" />
                    <TrialBadge name="TRACE-3" />
                  </div>

                  <div className={`p-4 rounded-lg border transition-all ${
                    cLvoEvt === true
                      ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/10'
                      : cLvoEvt === false
                        ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30'
                        : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Is EVT (thrombectomy) feasible for this patient?
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Transfer to EVT-capable center possible within reasonable time window
                        </p>
                      </div>
                      <YesNoButtons value={cLvoEvt} onChange={setCLvoEvt} />
                    </div>
                    {cLvoEvt === true && (
                      <div className="mt-3 flex items-start gap-2 text-blue-700 dark:text-blue-300">
                        <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="text-xs font-semibold">
                          EVT is preferred for LVO in this time window. Transfer to EVT-capable center immediately.
                          This extended IVT pathway applies only when EVT is <em>not</em> possible.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Barrier selection */}
                  {cLvoEvt === false && (
                    <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/30 space-y-2">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                        Reason EVT is not possible: <span className="text-xs font-normal text-slate-500">(select one)</span>
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                        {EVT_BARRIERS.map(b => (
                          <button
                            key={b.id}
                            onClick={() => setCLvoBarrier(b.id)}
                            className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                              cLvoBarrier === b.id
                                ? 'bg-neuro-500 border-neuro-500 text-white'
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:border-neuro-400'
                            }`}
                          >
                            {b.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* C-LVO eligible result */}
                  {cLvoEligible && (
                    <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 dark:bg-amber-900/20 dark:border-amber-600 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                          Eligible — Extended Window IVT for LVO (COR 2b)
                        </p>
                      </div>
                      <Cor2bBanner />
                      <DosingCard cor="2b" trialsBasis={['TIMELESS', 'TRACE-3']} showBothAgents={false} />
                      <div className="mt-3 flex justify-end">
                        <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5" /> New patient
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── PATH C-NonLVO branch ── */}
              {cPenumbra === true && cLvo === false && (
                <div className="space-y-3 pl-4 border-l-2 border-slate-300 dark:border-slate-600">
                  <div className="flex items-center gap-1.5">
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      PATH C-NonLVO · OPTION + TRACE-3
                    </p>
                  </div>
                  <Cor2bBanner optionNote={true} />

                  <div className={`p-4 rounded-lg border transition-all ${
                    cNonLvoExpertise === null
                      ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900/30'
                      : cNonLvoExpertise === false
                        ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-900/10'
                        : 'border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/10'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Expertise in thrombolytic stroke care available?
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          Neurologist or stroke physician directing care. If no, consider TeleStroke consultation.
                        </p>
                        <div className="mt-1.5"><TrialBadge name="OPTION" /></div>
                      </div>
                      <YesNoButtons value={cNonLvoExpertise} onChange={setCNonLvoExpertise} />
                    </div>
                    {cNonLvoExpertise === false && (
                      <div className="mt-3 flex items-center gap-2 text-amber-700 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 shrink-0" />
                        <p className="text-xs font-semibold">
                          Strongly recommended — obtain TeleStroke / neurology consultation before proceeding
                        </p>
                      </div>
                    )}
                  </div>

                  {/* C-NonLVO eligible result */}
                  {cNonLvoEligible && (
                    <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-300 dark:bg-amber-900/20 dark:border-amber-600 space-y-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                          Eligible — Extended Window IVT for Non-LVO (COR 2b)
                        </p>
                      </div>
                      <Cor2bBanner optionNote={true} />
                      <DosingCard cor="2b" trialsBasis={['OPTION', 'TRACE-3']} showBothAgents={false} />
                      <div className="mt-3 flex justify-end">
                        <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                          <RotateCcw className="w-3.5 h-3.5" /> New patient
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ineligible inline */}
              {cIneligible && (
                <div className="flex items-center gap-2 text-red-700 dark:text-red-300 px-1">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <p className="text-xs font-semibold">{cIneligible}</p>
                </div>
              )}
            </div>
          </SectionCard>
        )}

        {/* ── GUIDELINE NOTE ───────────────────────────────────── */}
        {setupComplete && modalitySet && activePath !== null && (
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 dark:bg-slate-900 dark:border-slate-700">
            <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Based on <strong className="text-slate-600 dark:text-slate-300">2026 AHA/ASA Guidelines for Early Management of AIS</strong> (Prabhakaran et al., DOI: 10.1161/STR.0000000000000513).
              Standard IVT contraindications apply to all extended window patients. Always check eligibility criteria and weigh risks/benefits individually.
            </p>
          </div>
        )}

      </div>

      {/* LKW Picker */}
      <LKWTimePicker
        isOpen={lkwPickerOpen}
        onClose={() => setLkwPickerOpen(false)}
        onConfirm={(date) => { handleLKWConfirm(date); setLkwPickerOpen(false); }}
        onUnknown={() => { handleLKWUnknown(); setLkwPickerOpen(false); }}
      />
    </div>
  );
};

export default ExtendedIVTPathway;
