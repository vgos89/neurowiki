import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, Check, RotateCcw, Copy, Activity, Zap,
  AlertTriangle, Clock, ScanLine, Star,
} from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { CollapsibleSection } from '../components/CollapsibleSection';
import LearningPearl from '../components/LearningPearl';
import { useFavorites } from '../hooks/useFavorites';
import { LKWTimePicker } from '../components/article/stroke/LKWTimePicker';
import { copyToClipboard } from '../utils/clipboard';

/* ─── Types ─────────────────────────────────────────────────────── */

export interface ExtendedIVTPathwayProps {
  hideHeader?: boolean;
  isInModal?: boolean;
  onResultChange?: (result: IVTResult | null) => void;
}

export interface IVTResult {
  eligible: boolean;
  cor: '2a' | '2b';
  path: 'A' | 'B' | 'C-LVO';
  trialsBasis: string[];
}

type YesNo = boolean | null;
type ImagingModality = 'mri' | 'ctp' | null;
type OnsetMode = 'known' | 'unknown-lkw' | 'unknown-no-lkw' | 'wake-up' | null;
type PathStage = 'A' | 'B' | 'C' | 'standard' | 'outside' | 'lkw-required' | null;

interface IVTResultFull {
  eligible: boolean;
  status: string;
  reason: string;
  details: string;
  variant: 'success' | 'warning' | 'danger' | 'neutral';
  cor?: '2a' | '2b';
  path?: 'A' | 'B' | 'C-LVO';
  trialsBasis?: string[];
  showBothAgents?: boolean;
}

/* ─── Trials ─────────────────────────────────────────────────────── */

interface TrialInfo { journal: string; year: number; cor: string; }
const TRIALS: Record<string, TrialInfo> = {
  'WAKE-UP':  { journal: 'NEJM',   year: 2018, cor: '2a'  },
  'THAWS':    { journal: 'Stroke', year: 2018, cor: '2a'  },
  'EXTEND':   { journal: 'NEJM',   year: 2019, cor: '2a'  },
  'ECASS-4':  { journal: 'Stroke', year: 2019, cor: '—'   },
  'TIMELESS': { journal: 'NEJM',   year: 2024, cor: '2b'  },
  'TRACE-3':  { journal: 'NEJM',   year: 2023, cor: '2b'  },
};

/* ─── EVT barriers ───────────────────────────────────────────────── */

const EVT_BARRIERS = [
  { id: 'no-center',       label: 'No EVT-capable center accessible' },
  { id: 'contraindication', label: 'Medical contraindication to EVT' },
  { id: 'refusal',          label: 'Patient / surrogate declining EVT' },
  { id: 'anatomical',       label: 'Anatomical / technical barrier' },
] as const;
type EVTBarrierId = typeof EVT_BARRIERS[number]['id'];

/* ─── Helpers ────────────────────────────────────────────────────── */

function formatElapsed(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function getPathStage(
  onsetMode: OnsetMode,
  elapsedHours: number | null,
  imagingModality: ImagingModality,
  setupComplete: boolean,
  hoursSinceMidpoint: number | null,
  aRecognition: YesNo,
  aDwiSmall: YesNo,
  aFlair: YesNo,
  bCtpCore: YesNo,
  bCtpMismatch: YesNo,
  bMriPwi: YesNo,
  bMriMismatch: YesNo,
  bEvt: YesNo,
): PathStage {
  if (!setupComplete || imagingModality === null) return null;

  const hasKnownLkw = elapsedHours !== null;
  const isWakeUp = onsetMode === 'wake-up';
  const isUnknown = onsetMode === 'unknown-lkw' || onsetMode === 'unknown-no-lkw' || onsetMode === 'wake-up';
  const pathAAvailable = isUnknown && imagingModality === 'mri';
  const pathAFailed = aRecognition === false || aDwiSmall === false || aFlair === false;
  const pathAEligible = aRecognition === true && aDwiSmall === true && aFlair === true;

  const pathBAvailable = (() => {
    if (imagingModality === 'ctp' && isWakeUp && hoursSinceMidpoint !== null) return hoursSinceMidpoint <= 9;
    if (!hasKnownLkw) return false;
    return elapsedHours >= 4.5 && elapsedHours <= 9;
  })();
  const pathBFavorable = imagingModality === 'ctp'
    ? bCtpCore === true && bCtpMismatch === true
    : bMriPwi === true && bMriMismatch === true;
  const pathBFailed = imagingModality === 'ctp'
    ? bCtpCore === false || bCtpMismatch === false
    : bMriPwi === false || bMriMismatch === false;
  const pathBResolved = pathBFailed || (pathBFavorable && bEvt !== null);

  const pathCAvailable = hasKnownLkw && elapsedHours <= 24 && (
    onsetMode === 'known'
      ? elapsedHours > 9
      : onsetMode === 'unknown-lkw' || onsetMode === 'wake-up'
  );

  if (hasKnownLkw && onsetMode !== 'unknown-no-lkw' && elapsedHours < 4.5) return 'standard';
  if (hasKnownLkw && elapsedHours > 24) return 'outside';
  if (onsetMode === 'unknown-no-lkw' && imagingModality === 'ctp') return 'lkw-required';

  if (pathAAvailable) {
    if (!pathAFailed && !pathAEligible) return 'A';
    if (pathAEligible) return 'A';
  }

  if (pathBAvailable) {
    if (!pathBResolved) return 'B';
    if (pathBFavorable && bEvt !== null) return 'B';
  }

  if (pathCAvailable) return 'C';

  if (pathAAvailable && pathAFailed) return 'A';
  if (pathBAvailable && pathBFailed) return 'B';

  if (onsetMode === 'unknown-no-lkw') return 'lkw-required';
  return hasKnownLkw && elapsedHours > 24 ? 'outside' : null;
}

function trialList(names: string[]): string {
  return names.map(n => {
    const t = TRIALS[n];
    return t ? `${n} (${t.journal} ${t.year})` : n;
  }).join(', ');
}

/* ─── CompactSelectionCard (mirrors EVT) ─────────────────────────── */

interface CompactSelectionCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger' | 'warning';
}
const CompactSelectionCard = React.memo(({
  title, description, selected, onClick, variant = 'default',
}: CompactSelectionCardProps) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-colors duration-150
      active:scale-[0.99] transform-gpu touch-manipulation min-h-[44px]
      focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
      ${selected
        ? variant === 'danger'
            ? 'bg-red-50 border-red-500'
            : variant === 'warning'
              ? 'bg-amber-50 border-amber-400'
              : 'bg-neuro-50 border-neuro-500'
        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50'
      }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="flex-1 min-w-0">
        <span className={`block text-sm font-bold leading-tight ${
          selected
            ? variant === 'danger'   ? 'text-red-900'
              : variant === 'warning' ? 'text-amber-900'
              : 'text-neuro-700'
            : 'text-slate-900'
        }`}>{title}</span>
        {description && (
          <span className={`text-xs leading-tight block mt-0.5 ${
            selected
              ? variant === 'danger'   ? 'text-red-700'
                : variant === 'warning' ? 'text-amber-700'
                : 'text-neuro-600'
              : 'text-slate-500'
          }`}>{description}</span>
        )}
      </div>
      {selected && (
        <div className={`p-1 rounded-full shrink-0 ${
          variant === 'danger'   ? 'bg-red-500 text-white'
          : variant === 'warning' ? 'bg-amber-400 text-white'
          : 'bg-neuro-500 text-white'
        }`}>
          <Check size={12} />
        </div>
      )}
    </div>
  </button>
));

/* ─── Main Component ─────────────────────────────────────────────── */

const STEPS = [
  { id: 1, title: 'Setup' },
  { id: 2, title: 'Criteria' },
  { id: 3, title: 'Decision' },
];

const ExtendedIVTPathway: React.FC<ExtendedIVTPathwayProps> = ({
  hideHeader = false,
  isInModal = false,
  onResultChange,
}) => {
  const [activeSection, setActiveSection] = useState(0);
  const { getBackPath } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const isFav = isFavorite('ivt-extended-pathway');
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevSetupRef = useRef(false);
  const prevCriteriaRef = useRef(false);

  /* ── LKW / setup state ── */
  const [lkwPickerOpen, setLkwPickerOpen] = useState(false);
  const [lkwPickerMode, setLkwPickerMode] = useState<'specific' | 'sleep'>('specific');
  const [pendingOnsetMode, setPendingOnsetMode] = useState<Exclude<OnsetMode, 'unknown-no-lkw' | null>>('known');
  const [lkwTimestamp, setLkwTimestamp] = useState<Date | null>(null);
  const [onsetMode, setOnsetMode] = useState<OnsetMode>(null);
  const [elapsedHours, setElapsedHours] = useState<number | null>(null);
  const [imagingModality, setImagingModality] = useState<ImagingModality>(null);

  /* ── Sleep onset state (wake-up stroke) ── */
  const [wakeTimestamp, setWakeTimestamp] = useState<Date | null>(null);
  const [minutesSinceWaking, setMinutesSinceWaking] = useState<number | null>(null);
  const [hoursSinceMidpoint, setHoursSinceMidpoint] = useState<number | null>(null);

  /* ── Path A state ── */
  const [aRecognition, setARecognition] = useState<YesNo>(null);
  const [aDwiSmall, setADwiSmall] = useState<YesNo>(null);
  const [aFlair, setAFlair] = useState<YesNo>(null);

  /* ── Path B state ── */
  const [bCtpCore, setBCtpCore] = useState<YesNo>(null);
  const [bCtpMismatch, setBCtpMismatch] = useState<YesNo>(null);
  const [bMriPwi, setBMriPwi] = useState<YesNo>(null);
  const [bMriMismatch, setBMriMismatch] = useState<YesNo>(null);
  const [bEvt, setBEvt] = useState<YesNo>(null);

  /* ── Path C state ── */
  const [cPenumbra, setCPenumbra] = useState<YesNo>(null);
  const [cLvo, setCLvo] = useState<YesNo>(null);
  const [cLvoEvt, setCLvoEvt] = useState<YesNo>(null);
  const [cLvoBarrier, setCLvoBarrier] = useState<EVTBarrierId | null>(null);
  const [cExpertise, setCExpertise] = useState<YesNo>(null);

  /* ── Live elapsed timer (LKW → now) ── */
  useEffect(() => {
    if (!lkwTimestamp) { setElapsedHours(null); return; }
    const calc = () => Math.max(0, (Date.now() - lkwTimestamp.getTime()) / 3_600_000);
    setElapsedHours(calc());
    const id = setInterval(() => setElapsedHours(calc()), 30_000);
    return () => clearInterval(id);
  }, [lkwTimestamp]);

  /* ── Live timer: minutes since waking (sleep onset mode) ── */
  useEffect(() => {
    if (!wakeTimestamp) { setMinutesSinceWaking(null); return; }
    const calc = () => Math.max(0, (Date.now() - wakeTimestamp.getTime()) / 60_000);
    setMinutesSinceWaking(calc());
    const id = setInterval(() => setMinutesSinceWaking(calc()), 30_000);
    return () => clearInterval(id);
  }, [wakeTimestamp]);

  /* ── Live timer: hours since sleep midpoint (EXTEND criterion for CTP path) ── */
  useEffect(() => {
    if (!wakeTimestamp || !lkwTimestamp) { setHoursSinceMidpoint(null); return; }
    const midpoint = new Date((lkwTimestamp.getTime() + wakeTimestamp.getTime()) / 2);
    const calc = () => (Date.now() - midpoint.getTime()) / 3_600_000;
    setHoursSinceMidpoint(calc());
    const id = setInterval(() => setHoursSinceMidpoint(calc()), 30_000);
    return () => clearInterval(id);
  }, [wakeTimestamp, lkwTimestamp]);

  /* ── Auto-set aRecognition from wake-up time ── */
  useEffect(() => {
    if (onsetMode !== 'wake-up' || minutesSinceWaking === null) return;
    setARecognition(minutesSinceWaking <= 270); // 4.5h = 270 min
  }, [onsetMode, minutesSinceWaking]);

  /* ── Derived ── */
  const setupComplete = onsetMode === 'unknown-no-lkw' || lkwTimestamp !== null;

  const pathStage: PathStage = useMemo(
    () => getPathStage(
      onsetMode,
      elapsedHours,
      imagingModality,
      setupComplete,
      hoursSinceMidpoint,
      aRecognition,
      aDwiSmall,
      aFlair,
      bCtpCore,
      bCtpMismatch,
      bMriPwi,
      bMriMismatch,
      bEvt,
    ),
    [
      onsetMode, elapsedHours, imagingModality, setupComplete, hoursSinceMidpoint,
      aRecognition, aDwiSmall, aFlair,
      bCtpCore, bCtpMismatch, bMriPwi, bMriMismatch, bEvt,
    ],
  );

  const isSetupComplete = setupComplete && imagingModality !== null;

  const isCriteriaComplete = useMemo(() => {
    if (!pathStage) return false;
    // Redirect cases — no questions, instant complete
    if (['standard', 'outside', 'lkw-required'].includes(pathStage)) return true;
    if (pathStage === 'A') {
      if (aRecognition === false || aDwiSmall === false || aFlair === false) return true;
      return aRecognition === true && aDwiSmall === true && aFlair === true;
    }
    if (pathStage === 'B') {
      if (imagingModality === 'ctp') {
        if (bCtpCore === false || bCtpMismatch === false) return true;
        return bCtpCore === true && bCtpMismatch === true && bEvt !== null;
      } else {
        if (bMriPwi === false || bMriMismatch === false) return true;
        return bMriPwi === true && bMriMismatch === true && bEvt !== null;
      }
    }
    if (pathStage === 'C') {
      if (cPenumbra === false) return true;
      if (cPenumbra === null || cLvo === null) return false;
      if (cLvo === false) return true;
      if (cLvoEvt === true) return true; // redirect to EVT
      if (cLvoEvt === null) return false;
      if (cLvoBarrier === null) return false;
      return cExpertise !== null;
    }
    return false;
  }, [
    pathStage, imagingModality,
    aRecognition, aDwiSmall, aFlair,
    bCtpCore, bCtpMismatch, bMriPwi, bMriMismatch, bEvt,
    cPenumbra, cLvo, cLvoEvt, cLvoBarrier, cExpertise,
  ]);

  /* ── Result computation ── */
  const result: IVTResultFull | null = useMemo(() => {
    if (!isSetupComplete || !pathStage) return null;

    if (pathStage === 'standard') return {
      eligible: false, status: 'Standard Window', variant: 'neutral',
      reason: 'Within 4.5h of LKW',
      details: 'This patient falls within the standard 4.5-hour thrombolysis window. Use the standard IVT eligibility criteria — extended-window protocols do not apply.',
    };
    if (pathStage === 'outside') return {
      eligible: false, status: 'Outside Window', variant: 'danger',
      reason: 'Greater than 24h from LKW',
      details: 'The patient is outside all extended thrombolysis windows. No guideline-supported extended IVT indication exists beyond 24 hours from last known well.',
    };
    if (pathStage === 'lkw-required') return {
      eligible: false, status: 'LKW Required', variant: 'warning',
      reason: 'Unknown onset without usable LKW cannot enter late-window pathways',
      details: 'Without a usable last-known-well time, CT perfusion alone cannot support late-window IVT routing. Obtain a reliable LKW timestamp for 9–24h LVO assessment, or use MRI DWI-FLAIR criteria if available for the unknown-onset pathway.',
    };

    // Path A
    if (pathStage === 'A') {
      if (aRecognition === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'Outside recognition window', details: 'Patient not within 4.5h of symptom recognition. Path A (WAKE-UP/THAWS) requires treatment initiation within 4.5h of the time symptoms were first recognized (e.g., awakening).' };
      if (aDwiSmall === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'DWI lesion ≥ 1/3 MCA territory', details: 'DWI lesion size criterion not met. Both WAKE-UP and THAWS required a DWI lesion smaller than 1/3 of the MCA territory.' };
      if (aFlair === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'No DWI-FLAIR mismatch', details: 'DWI-FLAIR mismatch not present. A FLAIR-positive lesion in the DWI territory indicates established infarct (>4.5h estimated age) — tissue no longer viable for thrombolysis.' };
      if (aRecognition === true && aDwiSmall === true && aFlair === true) return {
        eligible: true, status: 'Eligible', variant: 'success', cor: '2a',
        path: 'A', trialsBasis: ['WAKE-UP', 'THAWS'], showBothAgents: true,
        reason: 'Unknown Onset — DWI-FLAIR Mismatch (COR 2a)',
        details: 'Patient meets imaging criteria for extended-window IVT in unknown-onset stroke. DWI-FLAIR mismatch confirms tissue viability. Administer thrombolytic therapy; document time of symptom recognition.',
      };
    }

    // Path B
    if (pathStage === 'B') {
      const isCtp = imagingModality === 'ctp';
      const coreInelig = isCtp ? bCtpCore === false : bMriPwi === false;
      const mismatchInelig = isCtp ? bCtpMismatch === false : bMriMismatch === false;
      if (coreInelig) return {
        eligible: false, status: 'Not Eligible', variant: 'danger',
        reason: isCtp ? 'Ischemic core ≥ 70 mL' : 'No PWI perfusion deficit beyond DWI',
        details: isCtp
          ? 'Core volume ≥ 70 mL indicates a large established infarct — EXTEND trial excluded patients with core ≥ 70 mL (CBF < 30%). Extended-window IVT not supported.'
          : 'No perfusion deficit beyond the DWI lesion — absence of diffusion-perfusion mismatch means no salvageable penumbra to treat.',
      };
      if (mismatchInelig) return {
        eligible: false, status: 'Not Eligible', variant: 'danger',
        reason: isCtp ? 'Mismatch criteria not met' : 'No diffusion-perfusion mismatch',
        details: isCtp
          ? 'Penumbral mismatch criteria not met (requires mismatch volume > 10 mL AND mismatch ratio > 1.2). No significant salvageable tissue to justify extended-window IVT.'
          : 'Diffusion-perfusion mismatch not confirmed on MRI PWI. No salvageable penumbra to treat.',
      };
      if (bEvt === true) return {
        eligible: false, status: 'EVT Preferred', variant: 'warning',
        reason: 'Rapid EVT planned — extended-window IVT not indicated',
        details: 'Extended-window IVT is intended for patients who cannot receive or will receive delayed EVT. If rapid thrombectomy is already planned and available, proceed to EVT without endorsing late-window IVT.',
      };
      const q1Done = isCtp ? bCtpCore !== null : bMriPwi !== null;
      const q2Done = isCtp ? bCtpMismatch !== null : bMriMismatch !== null;
      if (q1Done && q2Done && bEvt === false) return {
        eligible: true, status: 'Eligible', variant: 'success', cor: '2a',
        path: 'B', trialsBasis: ['EXTEND', 'THAWS', 'ECASS-4'], showBothAgents: true,
        reason: `4.5–9h Perfusion Mismatch — ${isCtp ? 'CT Perfusion' : 'MRI PWI'} (COR 2a)`,
        details: 'Salvageable penumbra confirmed on perfusion imaging. Patient meets EXTEND trial criteria for extended-window IVT. Proceed with thrombolytic therapy.',
      };
    }

    // Path C
    if (pathStage === 'C') {
      if (cPenumbra === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'No salvageable penumbra', details: 'Extended-window IVT (Path C) requires confirmed target mismatch on perfusion imaging. Without evidence of viable ischemic penumbra, thrombolytic risk outweighs benefit.' };
      if (cLvo === null || cPenumbra === null) return null;
      if (cLvo === false) return {
        eligible: false, status: 'Not Eligible', variant: 'danger',
        reason: 'Late-window IVT beyond 9h is limited to LVO',
        details: 'Current 2026 AHA/ASA late-window IVT guidance in the 9–24h range applies to patients with AIS due to LVO and salvageable penumbra when EVT cannot be performed. Non-LVO patients do not meet this Path C indication.',
      };
      if (cLvoEvt === true) return { eligible: false, status: 'EVT Preferred', variant: 'warning', reason: 'LVO — proceed to thrombectomy', details: 'EVT is the preferred treatment for LVO in the late window. Transfer to an EVT-capable center immediately. Path C applies only when EVT cannot be performed promptly.' };
      if (cLvoEvt === false && cLvoBarrier !== null && cExpertise === false) return {
        eligible: false, status: 'Not Eligible at Current Site', variant: 'warning',
        reason: 'Expert thrombolytic stroke care not available',
        details: 'The 2026 AHA/ASA Class 2b late-window IVT recommendation requires treatment directed by clinicians with expertise in thrombolytic stroke care. Obtain expert stroke guidance or transfer if feasible rather than endorsing IVT at the current site.',
      };
      if (cLvoEvt === false && cLvoBarrier !== null && cExpertise === true) return {
        eligible: true, status: 'Eligible', variant: 'warning', cor: '2b',
        path: 'C-LVO', trialsBasis: ['TIMELESS', 'TRACE-3'], showBothAgents: false,
        reason: 'LVO — Extended Window IVT (COR 2b)',
        details: 'Patient meets criteria for extended-window IVT with LVO, salvageable penumbra, no feasible EVT option, and expert thrombolytic stroke oversight. COR 2b — weaker evidence; document shared decision-making with patient/surrogate.',
      };
    }

    return null;
  }, [
    isSetupComplete, pathStage, imagingModality,
    aRecognition, aDwiSmall, aFlair,
    bCtpCore, bCtpMismatch, bMriPwi, bMriMismatch, bEvt,
    cPenumbra, cLvo, cLvoEvt, cLvoBarrier, cExpertise,
  ]);

  const isDecisionComplete = !!result && result.status !== 'Incomplete';

  /* ── onResultChange callback ── */
  useEffect(() => {
    if (!onResultChange) return;
    if (result?.eligible && result.cor && result.path && result.trialsBasis) {
      onResultChange({ eligible: true, cor: result.cor, path: result.path, trialsBasis: result.trialsBasis });
    } else {
      onResultChange(null);
    }
  }, [result, onResultChange]);

  /* ── Section scroll ── */
  useEffect(() => {
    if (activeSection >= 0 && activeSection <= 2) {
      const el = sectionRefs.current[activeSection];
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 120);
    }
  }, [activeSection]);

  /* ── Auto-advance: Setup → Criteria (or skip to Decision) ── */
  useEffect(() => {
    if (activeSection === 0 && isSetupComplete && !prevSetupRef.current) {
      prevSetupRef.current = true;
      const skipCriteria = pathStage === 'standard' || pathStage === 'outside' || pathStage === 'lkw-required';
      setTimeout(() => setActiveSection(skipCriteria ? 2 : 1), 280);
    }
    if (!isSetupComplete) prevSetupRef.current = false;
  }, [activeSection, isSetupComplete, pathStage]);

  /* ── Auto-advance: Criteria complete nudge (no auto — user clicks Next) ── */

  /* ── Section summaries ── */
  const getSummary = useCallback((idx: number): string | undefined => {
    if (idx === 0) {
      if (!isSetupComplete) return undefined;
      const lkwStr = onsetMode === 'wake-up'
        ? 'Wake-up stroke'
        : onsetMode === 'unknown-lkw'
          ? 'Unknown onset · LKW known'
          : onsetMode === 'unknown-no-lkw'
            ? 'Unknown onset · no usable LKW'
            : elapsedHours !== null
              ? `${formatElapsed(elapsedHours)} elapsed`
              : '';
      const imgStr = imagingModality === 'mri' ? 'MRI' : 'CT Perfusion';
      return `${lkwStr} · ${imgStr}`;
    }
    if (idx === 1) {
      if (!isCriteriaComplete) return undefined;
      if (pathStage === 'A') return 'Path A · DWI-FLAIR';
      if (pathStage === 'B') return `Path B · ${imagingModality === 'ctp' ? 'CTP' : 'MRI PWI'}`;
      if (pathStage === 'C') return 'Path C · Late LVO';
      return pathStage ?? undefined;
    }
    if (idx === 2 && result) return `${result.status} · ${result.reason.split('(')[0].trim()}`;
    return undefined;
  }, [isSetupComplete, onsetMode, elapsedHours, imagingModality, isCriteriaComplete, pathStage, result]);

  /* ── Handlers ── */
  const clearCriteriaAnswers = () => {
    setARecognition(null); setADwiSmall(null); setAFlair(null);
    setBCtpCore(null); setBCtpMismatch(null); setBMriPwi(null); setBMriMismatch(null); setBEvt(null);
    setCPenumbra(null); setCLvo(null); setCLvoEvt(null); setCLvoBarrier(null); setCExpertise(null);
  };

  const handleReset = () => {
    setLkwTimestamp(null); setOnsetMode(null); setElapsedHours(null); setImagingModality(null);
    setWakeTimestamp(null); setMinutesSinceWaking(null); setHoursSinceMidpoint(null);
    clearCriteriaAnswers();
    setActiveSection(0);
    prevSetupRef.current = false;
    prevCriteriaRef.current = false;
  };

  const handleSectionToggle = (idx: number) => {
    setActiveSection(prev => {
      if (prev === idx) {
        if (idx === 0) return 1;
        if (idx === 2) return 1;
        return idx - 1;
      }
      return idx;
    });
  };

  const copySummary = () => {
    if (!result) return;
    const lines = [
      'Late Window IVT Assessment',
      `Status: ${result.status.toUpperCase()}`,
      `Reason: ${result.reason}`,
      '',
      'Setup:',
      `  LKW: ${
        onsetMode === 'wake-up' && wakeTimestamp && lkwTimestamp && imagingModality === 'ctp'
          ? `Bedtime ${lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · Woke ${wakeTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (${hoursSinceMidpoint?.toFixed(1)}h since sleep midpoint — EXTEND)`
          : onsetMode === 'wake-up' && wakeTimestamp && lkwTimestamp
          ? `Bedtime ${lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} · Woke ${wakeTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (${Math.round(minutesSinceWaking ?? 0)} min since waking)`
          : onsetMode === 'unknown-lkw' && lkwTimestamp
          ? `${lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} last known well · onset unknown`
          : onsetMode === 'unknown-no-lkw'
          ? 'Unknown onset / no usable LKW'
          : elapsedHours !== null ? `${formatElapsed(elapsedHours)} elapsed` : ''
      }`,
      `  Imaging: ${imagingModality === 'mri' ? 'MRI (DWI + FLAIR / PWI)' : 'CT Perfusion (RAPID/equivalent)'}`,
      '',
      `Details: ${result.details}`,
    ];
    if (result.trialsBasis?.length) {
      lines.push('', `Evidence: ${trialList(result.trialsBasis)}`);
    }
    if (result.cor) {
      lines.push(`Guideline: COR ${result.cor} · LOE B-R · 2026 AHA/ASA`);
    }
    copyToClipboard(lines.join('\n'), () => {
      setShowCopyToast(true);
      setTimeout(() => setShowCopyToast(false), 2000);
    });
  };

  const handleFavToggle = () => {
    toggleFavorite('ivt-extended-pathway');
    setShowFavToast(true);
    setTimeout(() => setShowFavToast(false), 2000);
  };

  /* ── Elapsed time display ── */
  const elapsedBadge = (() => {
    if (onsetMode === 'wake-up' && wakeTimestamp && lkwTimestamp) {
      const bedStr  = lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      const wakeStr = wakeTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      // CTP path: show hours since sleep midpoint (EXTEND criterion)
      if (imagingModality === 'ctp' && hoursSinceMidpoint !== null) {
        const hrs = hoursSinceMidpoint.toFixed(1);
        const ok  = hoursSinceMidpoint <= 9;
        return {
          label: `Bedtime ${bedStr} · Woke ${wakeStr} · ${hrs}h since sleep midpoint`,
          cls: ok ? 'bg-amber-100 text-amber-800 border-amber-200'
                  : 'bg-red-100 text-red-800 border-red-200',
        };
      }
      // MRI path (or before imaging selected): show minutes since waking (WAKE-UP criterion)
      const mins = minutesSinceWaking !== null ? Math.round(minutesSinceWaking) : '—';
      return {
        label: `Bedtime ${bedStr} · Woke ${wakeStr} · ${mins} min since waking`,
        cls: 'bg-amber-100 text-amber-800 border-amber-200',
      };
    }
    if (onsetMode === 'unknown-no-lkw') return { label: 'Unknown onset · no usable LKW', cls: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (onsetMode === 'unknown-lkw' && lkwTimestamp) {
      const lkwStr = lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
      return { label: `LKW ${lkwStr} · onset unknown`, cls: 'bg-amber-100 text-amber-800 border-amber-200' };
    }
    if (elapsedHours === null) return null;
    if (elapsedHours < 4.5) return { label: `${formatElapsed(elapsedHours)} elapsed · Standard window`, cls: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (elapsedHours <= 9)   return { label: `${formatElapsed(elapsedHours)} elapsed · 4.5–9h window`, cls: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (elapsedHours <= 24)  return { label: `${formatElapsed(elapsedHours)} elapsed · Late-window LVO range`, cls: 'bg-blue-100 text-blue-800 border-blue-200' };
    return { label: `${formatElapsed(elapsedHours)} elapsed · Outside window`, cls: 'bg-red-100 text-red-800 border-red-200' };
  })();

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className={`max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${isInModal ? 'pb-8' : 'pb-32'} md:pb-20`}>

      <h1 className="sr-only">Late Window IVT — Wake-Up Stroke &amp; Thrombolysis Eligibility</h1>

      {/* ── Sticky header ── */}
      {!hideHeader && (
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm -mx-4 px-4 md:-mx-6 md:px-6">
          <div className="max-w-3xl mx-auto flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-2 min-w-0">
              <Link to={getBackPath()} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors shrink-0 text-slate-500">
                <ArrowLeft size={16} />
              </Link>
              <div className="flex items-center gap-2 min-w-0">
                <div className="p-1.5 bg-neuro-100 text-neuro-700 rounded-md shrink-0">
                  <Zap size={16} />
                </div>
                <span className="text-sm font-black text-slate-900 truncate">Late Window IVT</span>
              </div>
            </div>
            {/* Step dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              {([0, 1, 2] as const).map(i => {
                const completedFlags = [isSetupComplete, isCriteriaComplete, isDecisionComplete];
                const isComp = completedFlags[i];
                const isCurr = activeSection === i;
                const isClickable = isComp || isCurr || (i > 0 && completedFlags[i - 1]);
                return (
                  <button
                    key={i}
                    onClick={() => { if (isClickable) setActiveSection(i); }}
                    disabled={!isClickable}
                    aria-label={`Step ${i + 1}: ${STEPS[i].title}`}
                    className={`transition-all duration-200 rounded-full flex items-center justify-center touch-manipulation
                      focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
                      ${isComp ? 'w-7 h-7 bg-emerald-500 text-white' : isCurr ? 'w-7 h-7 bg-neuro-500 text-white ring-2 ring-neuro-200' : 'w-2 h-2 bg-slate-200'}`}
                  >
                    {isComp ? <Check size={12} /> : isCurr ? <span className="text-xs font-bold">{i + 1}</span> : null}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={handleFavToggle} className="p-2 rounded-lg hover:bg-slate-100 transition-colors" aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
                <Star size={16} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
              </button>
              <button onClick={handleReset} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400" aria-label="Reset">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 min-h-[300px]">

        {/* ════ SECTION 0: SETUP ════ */}
        <div ref={el => { sectionRefs.current[0] = el; }} className="scroll-mt-4">
          <CollapsibleSection
            title="Setup"
            stepNumber={1}
            totalSteps={3}
            isCompleted={isSetupComplete}
            isActive={activeSection === 0}
            onToggle={() => handleSectionToggle(0)}
            summary={getSummary(0)}
            icon={<Clock size={14} />}
            accentClass="bg-neuro-100 text-neuro-600"
          >
            <div className="space-y-6">
              {/* LKW time */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Last Known Well (LKW) Time</h3>
                {!setupComplete ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CompactSelectionCard
                        title="Known Onset / LKW"
                        description="Symptoms began at known time"
                        selected={false}
                        onClick={() => {
                          clearCriteriaAnswers();
                          setPendingOnsetMode('known');
                          setLkwPickerMode('specific');
                          setLkwPickerOpen(true);
                        }}
                      />
                      <CompactSelectionCard
                        title="Unknown Onset + Known LKW"
                        description="Unwitnessed stroke but last known well is known"
                        selected={false}
                        onClick={() => {
                          clearCriteriaAnswers();
                          setPendingOnsetMode('unknown-lkw');
                          setLkwPickerMode('specific');
                          setLkwPickerOpen(true);
                        }}
                        variant="warning"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <CompactSelectionCard
                        title="Unknown Onset / No Usable LKW"
                        description="Late-window routing will be blocked without LKW"
                        selected={false}
                        onClick={() => {
                          clearCriteriaAnswers();
                          setOnsetMode('unknown-no-lkw');
                          setLkwTimestamp(null);
                          setWakeTimestamp(null);
                          setMinutesSinceWaking(null);
                          setHoursSinceMidpoint(null);
                        }}
                        variant="warning"
                      />
                      <CompactSelectionCard
                        title="Sleep Onset (Wake-up Stroke)"
                        description="Enter bedtime + wake-up time"
                        selected={false}
                        onClick={() => {
                          clearCriteriaAnswers();
                          setPendingOnsetMode('wake-up');
                          setLkwPickerMode('sleep');
                          setLkwPickerOpen(true);
                        }}
                        variant="warning"
                      />
                    </div>
                  </div>
                ) : (
                  <div className={`flex items-center justify-between px-4 py-3 rounded-xl border-2 ${
                    onsetMode === 'known' ? 'bg-neuro-50 border-neuro-500' : 'bg-amber-50 border-amber-400'
                  }`}>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Clock size={16} className={onsetMode === 'known' ? 'text-neuro-600' : 'text-amber-600'} />
                      <span className={`text-sm font-bold truncate ${onsetMode === 'known' ? 'text-neuro-800' : 'text-amber-800'}`}>
                        {elapsedBadge?.label}
                      </span>
                    </div>
                    <button
                      onClick={() => {
                        clearCriteriaAnswers();
                        setOnsetMode(null); setLkwTimestamp(null); setElapsedHours(null);
                        setWakeTimestamp(null); setMinutesSinceWaking(null); setHoursSinceMidpoint(null); setARecognition(null);
                      }}
                      className="text-xs text-slate-500 hover:text-slate-700 underline transition-colors flex-shrink-0 ml-2"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>

              {/* Imaging modality */}
              {setupComplete && (
                <div className="animate-in slide-in-from-top-2">
                  <h3 className="text-sm font-semibold text-slate-700 mb-2">Facility Imaging Available</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <CompactSelectionCard
                      title="MRI"
                      description="DWI + FLAIR / PWI"
                      selected={imagingModality === 'mri'}
                      onClick={() => { clearCriteriaAnswers(); setImagingModality('mri'); }}
                    />
                    <CompactSelectionCard
                      title="CT Perfusion"
                      description="RAPID or equivalent"
                      selected={imagingModality === 'ctp'}
                      onClick={() => { clearCriteriaAnswers(); setImagingModality('ctp'); }}
                    />
                  </div>
                </div>
              )}

              {isSetupComplete && (
                <div className="pt-2 border-t border-slate-100">
                  <LearningPearl
                    title="Pathway Selection Logic"
                    content={
                      <span>
                        <strong>Unknown onset + MRI → Path A</strong> (DWI-FLAIR, COR 2a) ·{' '}
                        <strong>4.5–9h → Path B</strong> (perfusion mismatch, COR 2a) ·{' '}
                        <strong>9–24h or unknown onset within 24h from LKW → Path C</strong> (LVO only, COR 2b). Late Path C requires LVO, no feasible rapid EVT, and expert thrombolytic stroke care.
                      </span>
                    }
                    variant="neuro"
                  />
                </div>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* ════ SECTION 1: CRITERIA ════ */}
        <div ref={el => { sectionRefs.current[1] = el; }} className="scroll-mt-4">
          <CollapsibleSection
            title="Criteria"
            stepNumber={2}
            totalSteps={3}
            isCompleted={isCriteriaComplete}
            isActive={activeSection === 1}
            onToggle={() => handleSectionToggle(1)}
            summary={getSummary(1)}
            icon={<ScanLine size={14} />}
            accentClass="bg-teal-100 text-teal-600"
          >
            <div className="space-y-6">

              {/* Redirect states */}
              {pathStage === 'standard' && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm">
                  <Check size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Patient within standard 4.5h window</p>
                    <p className="text-xs mt-0.5 text-emerald-700">Apply standard IVT eligibility criteria. Extended-window protocols do not apply.</p>
                  </div>
                </div>
              )}
              {pathStage === 'outside' && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Outside all extended windows (&gt; 24h)</p>
                    <p className="text-xs mt-0.5 text-red-700">No guideline-supported IVT indication beyond 24 hours from last known well.</p>
                  </div>
                </div>
              )}
              {pathStage === 'lkw-required' && (
                <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Usable LKW required for late-window routing</p>
                    <p className="text-xs mt-0.5 text-amber-700">Without a reliable LKW, CT perfusion cannot support the 9–24h late-LVO pathway. Obtain LKW timing or use MRI DWI-FLAIR criteria if available for unknown-onset evaluation.</p>
                  </div>
                </div>
              )}

              {/* ── PATH A ── */}
              {pathStage === 'A' && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-neuro-600 bg-neuro-50 px-2 py-0.5 rounded">Path A — DWI-FLAIR Mismatch</span>
                    <span className="text-xs text-slate-400">COR 2a · LOE B-R</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Within 4.5h of symptom recognition?</h3>
                    <p className="text-xs text-slate-500 mb-2">Time of awakening with symptoms, or time witness first noticed deficit</p>

                    {/* Auto-computed badge when sleep onset mode was used */}
                    {onsetMode === 'wake-up' && wakeTimestamp && minutesSinceWaking !== null ? (
                      <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 mb-2 ${
                        minutesSinceWaking <= 270
                          ? 'bg-emerald-50 border-emerald-400'
                          : 'bg-red-50 border-red-400'
                      }`}>
                        <span className="text-lg mt-0.5">{minutesSinceWaking <= 270 ? '✅' : '❌'}</span>
                        <div className="min-w-0">
                          <p className={`text-sm font-bold ${minutesSinceWaking <= 270 ? 'text-emerald-800' : 'text-red-800'}`}>
                            {minutesSinceWaking <= 270
                              ? `Within 4.5h — ${Math.round(minutesSinceWaking)} min since waking`
                              : `Outside window — ${Math.round(minutesSinceWaking)} min since waking`}
                          </p>
                          <p className="text-xs text-slate-500 mt-0.5">Auto-calculated from entered wake-up time</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        <CompactSelectionCard title="Yes" description="Within 4.5h of recognition" selected={aRecognition === true} onClick={() => setARecognition(true)} />
                        <CompactSelectionCard title="No" description="More than 4.5h since recognition" selected={aRecognition === false} onClick={() => setARecognition(false)} variant="danger" />
                      </div>
                    )}

                    {aRecognition !== null && (
                      <LearningPearl title="WAKE-UP Trial" content="Thomalla et al., NEJM 2018. Alteplase vs placebo for unknown-onset stroke; required DWI-FLAIR mismatch AND treatment within 4.5h of awakening. mRS 0–1 at 90 days: 53.3% vs 41.8%." variant="indigo" />
                    )}
                  </div>

                  {aRecognition === true && (
                    <div className="animate-in slide-in-from-top-2">
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">DWI lesion smaller than 1/3 of the MCA territory?</h3>
                      <p className="text-xs text-slate-500 mb-2">Visually estimate on axial DWI sequence</p>
                      <div className="grid grid-cols-2 gap-2">
                        <CompactSelectionCard title="Yes" description="Small lesion — criteria met" selected={aDwiSmall === true} onClick={() => setADwiSmall(true)} />
                        <CompactSelectionCard title="No" description="Large lesion ≥ 1/3 MCA" selected={aDwiSmall === false} onClick={() => setADwiSmall(false)} variant="danger" />
                      </div>
                    </div>
                  )}

                  {aRecognition === true && aDwiSmall === true && (
                    <div className="animate-in slide-in-from-top-2">
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">DWI-FLAIR mismatch present?</h3>
                      <p className="text-xs text-slate-500 mb-2">DWI positive (acute stroke) + no marked FLAIR signal change in same territory</p>
                      <div className="grid grid-cols-2 gap-2">
                        <CompactSelectionCard title="Yes — Mismatch" description="DWI+ and FLAIR negative / subtle" selected={aFlair === true} onClick={() => setAFlair(true)} />
                        <CompactSelectionCard title="No — FLAIR positive" description="FLAIR shows established infarct" selected={aFlair === false} onClick={() => setAFlair(false)} variant="danger" />
                      </div>
                      {aFlair !== null && (
                        <LearningPearl title="DWI-FLAIR Mismatch Principle" content="DWI becomes positive within minutes of stroke onset. FLAIR signal changes emerge after ~4.5h. A DWI+/FLAIR− pattern suggests onset < 4.5h — the tissue is still viable." variant="indigo" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── PATH B ── */}
              {pathStage === 'B' && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                      Path B — {imagingModality === 'ctp' ? 'CT Perfusion' : 'MRI PWI'}
                    </span>
                    <span className="text-xs text-slate-400">COR 2a · LOE B-R</span>
                  </div>

                  {/* Auto-computed time badge — sleep onset + CTP (EXTEND criterion) */}
                  {onsetMode === 'wake-up' && wakeTimestamp && hoursSinceMidpoint !== null && imagingModality === 'ctp' && (
                    <div className={`flex items-start gap-3 px-4 py-3 rounded-xl border-2 ${
                      hoursSinceMidpoint <= 9
                        ? 'bg-emerald-50 border-emerald-400'
                        : 'bg-red-50 border-red-400'
                    }`}>
                      <span className="text-lg mt-0.5">{hoursSinceMidpoint <= 9 ? '✅' : '❌'}</span>
                      <div className="min-w-0">
                        <p className={`text-sm font-bold ${hoursSinceMidpoint <= 9 ? 'text-emerald-800' : 'text-red-800'}`}>
                          {hoursSinceMidpoint <= 9
                            ? `Within 9h of sleep midpoint — ${hoursSinceMidpoint.toFixed(1)}h elapsed`
                            : `Outside EXTEND window — ${hoursSinceMidpoint.toFixed(1)}h since sleep midpoint`}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Auto-calculated · EXTEND criterion: ≤9h from midpoint of sleep
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CTP branch */}
                  {imagingModality === 'ctp' && (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Ischemic core (CBF &lt;30%) &lt; 70 mL?</h3>
                        <p className="text-xs text-slate-500 mb-2">Measured on RAPID or equivalent automated software</p>
                        <div className="grid grid-cols-2 gap-2">
                          <CompactSelectionCard title="Yes — Core < 70 mL" description="Small core — criteria met" selected={bCtpCore === true} onClick={() => setBCtpCore(true)} />
                          <CompactSelectionCard title="No — Core ≥ 70 mL" description="Large established infarct" selected={bCtpCore === false} onClick={() => setBCtpCore(false)} variant="danger" />
                        </div>
                      </div>
                      {bCtpCore === true && (
                        <div className="animate-in slide-in-from-top-2">
                          <h3 className="text-sm font-semibold text-slate-700 mb-1">Mismatch volume &gt; 10 mL AND ratio &gt; 1.2?</h3>
                          <p className="text-xs text-slate-500 mb-2">Penumbra criteria from EXTEND trial (RAPID output)</p>
                          <div className="grid grid-cols-2 gap-2">
                            <CompactSelectionCard title="Yes — Mismatch met" description="Significant salvageable penumbra" selected={bCtpMismatch === true} onClick={() => setBCtpMismatch(true)} />
                            <CompactSelectionCard title="No — Mismatch not met" description="Insufficient penumbra" selected={bCtpMismatch === false} onClick={() => setBCtpMismatch(false)} variant="danger" />
                          </div>
                          {bCtpMismatch !== null && (
                            <LearningPearl title="EXTEND Trial" content="Ma et al., NEJM 2019. Alteplase 4.5–9h with RAPID-selected mismatch (core < 70 mL; mismatch > 10 mL, ratio > 1.2). mRS 0–1 at 90 days: 36% vs 29%. NNT ~14." variant="indigo" />
                          )}
                        </div>
                      )}
                    </>
                  )}

                  {/* MRI branch */}
                  {imagingModality === 'mri' && (
                    <>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">PWI shows perfusion deficit beyond DWI lesion?</h3>
                        <p className="text-xs text-slate-500 mb-2">Tmax &gt; 6s or equivalent perfusion delay extending beyond DWI abnormality</p>
                        <div className="grid grid-cols-2 gap-2">
                          <CompactSelectionCard title="Yes — PWI deficit present" description="Perfusion delay beyond DWI" selected={bMriPwi === true} onClick={() => setBMriPwi(true)} />
                          <CompactSelectionCard title="No — No PWI deficit" description="No perfusion abnormality" selected={bMriPwi === false} onClick={() => setBMriPwi(false)} variant="danger" />
                        </div>
                      </div>
                      {bMriPwi === true && (
                        <div className="animate-in slide-in-from-top-2">
                          <h3 className="text-sm font-semibold text-slate-700 mb-1">Diffusion-perfusion mismatch confirmed?</h3>
                          <p className="text-xs text-slate-500 mb-2">Penumbra volume (PWI − DWI) &gt; 10 mL with ratio &gt; 1.2</p>
                          <div className="grid grid-cols-2 gap-2">
                            <CompactSelectionCard title="Yes — Mismatch confirmed" description="Viable ischemic penumbra present" selected={bMriMismatch === true} onClick={() => setBMriMismatch(true)} />
                            <CompactSelectionCard title="No — No mismatch" description="No salvageable tissue" selected={bMriMismatch === false} onClick={() => setBMriMismatch(false)} variant="danger" />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* EVT question — shared for both CTP and MRI Path B */}
                  {((imagingModality === 'ctp' && bCtpCore === true && bCtpMismatch === true) ||
                    (imagingModality === 'mri' && bMriPwi === true && bMriMismatch === true)) && (
                    <div className="animate-in slide-in-from-top-2">
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">EVT (thrombectomy) also indicated?</h3>
                      <p className="text-xs text-slate-500 mb-2">LVO confirmed and EVT-capable center accessible</p>
                      <div className="grid grid-cols-2 gap-2">
                        <CompactSelectionCard title="Yes — Rapid EVT planned" description="Do not endorse extended IVT" selected={bEvt === true} onClick={() => setBEvt(true)} variant="warning" />
                        <CompactSelectionCard title="No — IVT only" description="No LVO or EVT not available" selected={bEvt === false} onClick={() => setBEvt(false)} />
                      </div>
                      {bEvt !== null && (
                        <LearningPearl title="Late IVT vs Rapid EVT" content="In the extended window, IVT should not be endorsed when rapid thrombectomy is already planned. The late-window recommendation is intended for patients who cannot receive or will receive delayed EVT." variant="amber" />
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── PATH C ── */}
              {pathStage === 'C' && (
                <div className="space-y-6 animate-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Path C — Late-Window LVO Only</span>
                    <span className="text-xs text-slate-400">COR 2b · LOE B-R</span>
                  </div>
                  <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                    <span><strong>COR 2b — Weaker Evidence.</strong> Path C is limited to LVO with salvageable penumbra when EVT cannot be performed promptly and treatment is directed by clinicians with expertise in thrombolytic stroke care.</span>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">Salvageable penumbra / target mismatch on perfusion imaging?</h3>
                    <p className="text-xs text-slate-500 mb-2">CT-P or MRI-PWI showing ischemic core with surrounding hypoperfused but viable tissue</p>
                    <div className="grid grid-cols-2 gap-2">
                      <CompactSelectionCard title="Yes — Penumbra confirmed" description="Target mismatch present" selected={cPenumbra === true} onClick={() => setCPenumbra(true)} />
                      <CompactSelectionCard title="No — No penumbra" description="No target mismatch" selected={cPenumbra === false} onClick={() => setCPenumbra(false)} variant="danger" />
                    </div>
                    {cPenumbra !== null && (
                      <LearningPearl title="Path C Trials" content="TRACE-3 (NEJM 2023) and TIMELESS (NEJM 2024) inform the 2026 AHA/ASA late-window Class 2b recommendation for patients with LVO, salvageable penumbra, and no feasible rapid EVT pathway. This branch does not support non-LVO treatment." variant="amber" />
                    )}
                  </div>

                  {cPenumbra === true && (
                    <div className="animate-in slide-in-from-top-2">
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">LVO (large vessel occlusion) confirmed on CTA / MRA?</h3>
                      <p className="text-xs text-slate-500 mb-2">Internal carotid, M1/M2 MCA, basilar, or other proximal occlusion</p>
                      <div className="grid grid-cols-2 gap-2">
                        <CompactSelectionCard title="Yes — LVO confirmed" description="TIMELESS + TRACE-3 pathway" selected={cLvo === true} onClick={() => setCLvo(true)} />
                        <CompactSelectionCard title="No — Non-LVO" description="Late Path C does not apply" selected={cLvo === false} onClick={() => setCLvo(false)} variant="danger" />
                      </div>
                    </div>
                  )}

                  {/* C-LVO branch */}
                  {cPenumbra === true && cLvo === true && (
                    <div className="space-y-4 pl-4 border-l-2 border-slate-200 animate-in slide-in-from-top-2">
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PATH C-LVO · TIMELESS + TRACE-3</p>
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Is EVT (thrombectomy) feasible?</h3>
                        <p className="text-xs text-slate-500 mb-2">Transfer to EVT-capable center possible within reasonable time window</p>
                        <div className="grid grid-cols-2 gap-2">
                          <CompactSelectionCard title="Yes — EVT feasible" description="Refer to EVT pathway" selected={cLvoEvt === true} onClick={() => setCLvoEvt(true)} variant="warning" />
                          <CompactSelectionCard title="No — EVT not possible" description="Proceed with extended IVT" selected={cLvoEvt === false} onClick={() => setCLvoEvt(false)} />
                        </div>
                      </div>
                      {cLvoEvt === false && (
                        <div className="animate-in slide-in-from-top-2">
                          <h3 className="text-sm font-semibold text-slate-700 mb-2">Reason EVT is not possible: <span className="text-xs font-normal text-slate-500">(select one)</span></h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {EVT_BARRIERS.map(b => (
                              <CompactSelectionCard key={b.id} title={b.label} selected={cLvoBarrier === b.id} onClick={() => setCLvoBarrier(b.id)} />
                            ))}
                          </div>
                        </div>
                      )}
                      {cLvoEvt === false && cLvoBarrier !== null && (
                        <div>
                          <h3 className="text-sm font-semibold text-slate-700 mb-1">Expertise in thrombolytic stroke care available?</h3>
                          <p className="text-xs text-slate-500 mb-2">Stroke expertise available on site or through tele-stroke support</p>
                          <div className="grid grid-cols-2 gap-2">
                            <CompactSelectionCard title="Yes — Expert available" description="Late IVT can be directed safely" selected={cExpertise === true} onClick={() => setCExpertise(true)} />
                            <CompactSelectionCard title="No — Expertise unavailable" description="Do not endorse late IVT at current site" selected={cExpertise === false} onClick={() => setCExpertise(false)} variant="warning" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Criteria complete — Next nudge */}
              {isCriteriaComplete && (
                <button
                  onClick={() => setActiveSection(2)}
                  className="w-full mt-4 py-3.5 bg-neuro-500 text-white rounded-2xl font-bold hover:bg-neuro-600 shadow-lg transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.99] transform-gpu min-h-[44px] touch-manipulation"
                >
                  <Check size={16} />
                  {result?.eligible ? 'See Dosing & Result' : 'See Assessment'}
                </button>
              )}
            </div>
          </CollapsibleSection>
        </div>

        {/* ════ SECTION 2: DECISION ════ */}
        <div ref={el => { sectionRefs.current[2] = el; }} className="scroll-mt-4">
          <CollapsibleSection
            title="Decision"
            stepNumber={3}
            totalSteps={3}
            isCompleted={isDecisionComplete}
            isActive={activeSection === 2}
            onToggle={() => handleSectionToggle(2)}
            summary={getSummary(2)}
            icon={<Activity size={14} />}
            accentClass={
              result?.variant === 'success' ? 'bg-emerald-100 text-emerald-600'
              : result?.variant === 'danger'  ? 'bg-red-100 text-red-600'
              : result?.variant === 'warning' ? 'bg-amber-100 text-amber-600'
              : 'bg-slate-200 text-slate-500'
            }
          >
            {result ? (
              <div className="space-y-6 animate-in zoom-in-95 duration-300">

                {/* Copy to EMR */}
                <button
                  onClick={copySummary}
                  className="w-full py-3.5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg transition-colors duration-150 flex items-center justify-center gap-2 active:scale-[0.99] transform-gpu min-h-[44px] touch-manipulation"
                >
                  <Copy size={16} />
                  Copy to EMR
                </button>

                {/* Result card — EVT-style border-l-[8px] */}
                <div className={`rounded-2xl border-l-[8px] shadow-md overflow-hidden p-5 md:p-8
                  ${result.variant === 'success' ? 'border-l-emerald-500 bg-emerald-50'
                  : result.variant === 'warning' ? 'border-l-amber-400 bg-amber-50'
                  : result.variant === 'danger'  ? 'border-l-red-500 bg-red-50'
                  : 'border-l-slate-400 bg-slate-50'}`}
                >
                  <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4
                    ${result.variant === 'success' ? 'bg-emerald-100 text-emerald-700'
                    : result.variant === 'warning' ? 'bg-amber-100 text-amber-700'
                    : result.variant === 'danger'  ? 'bg-red-100 text-red-700'
                    : 'bg-slate-100 text-slate-600'}`}
                  >
                    <Activity size={12} /><span>Recommendation</span>
                  </div>

                  <div className="mb-6">
                    <div className={`text-5xl font-black tracking-tight
                      ${result.variant === 'success' ? 'text-emerald-900'
                      : result.variant === 'warning' ? 'text-amber-900'
                      : result.variant === 'danger'  ? 'text-red-900'
                      : 'text-slate-900'}`}
                    >
                      {result.status}
                    </div>
                    {result.cor && (
                      <div className="text-lg font-medium text-slate-600 mt-1">
                        COR {result.cor} · LOE B-R · 2026 AHA/ASA
                      </div>
                    )}
                  </div>

                  <div className="pt-6 border-t border-slate-200">
                    <div className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-2">Reasoning</div>
                    <div className={`text-lg font-bold
                      ${result.variant === 'success' ? 'text-emerald-900'
                      : result.variant === 'warning' ? 'text-amber-900'
                      : result.variant === 'danger'  ? 'text-red-900'
                      : 'text-slate-900'}`}
                    >
                      {result.reason}
                    </div>
                    <div className="text-sm text-slate-700 mt-1 leading-relaxed">{result.details}</div>
                  </div>
                </div>

                {/* Dosing — only when eligible */}
                {result.eligible && result.cor && (
                  <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dosing</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-xl bg-neuro-50 border border-neuro-200">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Zap size={14} className="text-neuro-600" />
                          <span className="text-xs font-bold text-neuro-800">Tenecteplase (TNK)</span>
                          <span className="text-xs text-neuro-500 font-medium">Preferred</span>
                        </div>
                        <p className="text-base font-bold text-slate-800">0.25 mg/kg IV bolus</p>
                        <p className="text-xs text-slate-500 mt-0.5">Maximum: 25 mg · Single bolus over 5–10 sec</p>
                      </div>
                      {result.showBothAgents && (
                        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center gap-1.5 mb-2">
                            <Activity size={14} className="text-slate-500" />
                            <span className="text-xs font-bold text-slate-700">Alteplase (tPA)</span>
                          </div>
                          <p className="text-base font-bold text-slate-800">0.9 mg/kg IV infusion</p>
                          <p className="text-xs text-slate-500 mt-0.5">Maximum: 90 mg · 10% bolus + 90% over 60 min</p>
                        </div>
                      )}
                    </div>

                    {result.trialsBasis && result.trialsBasis.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 mb-2 uppercase tracking-wide">Evidence Basis</p>
                        <p className="text-xs text-slate-600">{trialList(result.trialsBasis)}</p>
                      </div>
                    )}

                    {result.cor === '2b' && (
                      <div className="flex items-start gap-2 pt-3 border-t border-slate-100 text-amber-700">
                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                        <p className="text-xs font-medium">COR 2b — document shared decision-making with patient/surrogate before administration</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Standard-window redirect pearls */}
                {pathStage === 'standard' && (
                  <LearningPearl title="Standard IVT Protocol" content="For patients within 4.5h, use the standard IVT eligibility checklist. Tenecteplase 0.25 mg/kg (max 25 mg) is COR 1 per 2026 AHA/ASA for the standard window." variant="neuro" />
                )}

                <button
                  onClick={handleReset}
                  className="w-full py-3 border border-slate-200 text-slate-600 rounded-2xl font-semibold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <RotateCcw size={14} />
                  New Patient
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-sm text-slate-400">
                Complete Setup and Criteria to see the assessment.
              </div>
            )}
          </CollapsibleSection>
        </div>
      </div>

      {/* LKW Picker modal */}
      <LKWTimePicker
        isOpen={lkwPickerOpen}
        onClose={() => setLkwPickerOpen(false)}
        onConfirm={(date) => {
          clearCriteriaAnswers();
          setLkwTimestamp(date);
          setOnsetMode(pendingOnsetMode);
          setWakeTimestamp(null);
          setMinutesSinceWaking(null);
          setHoursSinceMidpoint(null);
          setLkwPickerOpen(false);
        }}
        onUnknown={() => {
          clearCriteriaAnswers();
          setOnsetMode('unknown-no-lkw');
          setLkwTimestamp(null);
          setWakeTimestamp(null);
          setMinutesSinceWaking(null);
          setHoursSinceMidpoint(null);
          setLkwPickerOpen(false);
        }}
        showSleepOnset={true}
        defaultMode={lkwPickerMode}
        onSleepOnset={(bedtime, wakeTime) => {
          clearCriteriaAnswers();
          setLkwTimestamp(bedtime);
          setOnsetMode('wake-up');
          setWakeTimestamp(wakeTime);
          setMinutesSinceWaking(null);
          setLkwPickerOpen(false);
        }}
      />

      {/* Toast notifications */}
      {showCopyToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2">
          Copied to clipboard
        </div>
      )}
      {showFavToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {isFav ? 'Added to favorites' : 'Removed from favorites'}
        </div>
      )}
    </div>
  );
};

export default ExtendedIVTPathway;
