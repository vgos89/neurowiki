import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Check,
  RotateCcw, Copy, Activity, Zap,
  AlertTriangle, Clock,
} from 'lucide-react';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { PathwayRailStep } from '../components/pathways/PathwayRail';
import { PathwayCategoryRow } from '../components/pathways/PathwayCategoryRow';
import { PathwayLearningPearl } from '../components/pathways/PathwayLearningPearl';
import { PathwayBranchChip } from '../components/pathways/PathwayBranchChip';
import { PathwayHeader } from '../components/pathways/PathwayHeader';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { useFavorites } from '../hooks/useFavorites';
import { LKWTimePicker } from '../components/article/stroke/LKWTimePicker';
import { copyToClipboard } from '../utils/clipboard';
import { useRecents } from '../hooks/useRecents';
import type { SeverityTokens } from '../lib/calculators/severityTokens';
import DiscreteFAQ from '../components/seo/DiscreteFAQ';
import { getFAQsForPath } from '../seo/schema';
import NextStepsCard from '../components/seo/NextStepsCard';

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
  'THAWS':    { journal: 'Stroke', year: 2020, cor: '2a'  }, // Koga et al., Stroke 2020;51:1530-8 (DOI 10.1161/STROKEAHA.119.028127)
  'EXTEND':   { journal: 'NEJM',   year: 2019, cor: '2a'  },
  'EPITHET':  { journal: 'Lancet Neurol', year: 2008, cor: '—' },
  'ECASS-4':  { journal: 'Int J Stroke', year: 2019, cor: '—' }, // Ringleb et al., Int J Stroke 2019;14:483-490 (PMID 30947642)
  'TIMELESS': { journal: 'NEJM',   year: 2024, cor: '—'   }, // limiting/negative trial — NOT positive evidence for late TNK
  'TRACE-III': { journal: 'NEJM',  year: 2024, cor: '2b'  }, // NEJM 2024 (Xiong et al.)
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

/* ─── TIER_TOKENS — inlined (4th copy; extraction deferred until PathwayBottomDrawer retires) ─── */

type ExtendedIVTTier = 'Low' | 'Intermediate' | 'High' | 'Negative' | 'None';

const TIER_TOKENS: Record<Exclude<ExtendedIVTTier, 'None'>, SeverityTokens> = {
  Low: {
    borderColor: '#c7d2fe',         // neuro-200
    headerBg: 'bg-neuro-50',
    headerHover: 'hover:bg-neuro-100',
    labelClass: 'text-[10px] font-bold text-neuro-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-neuro-700',
    chevronClass: 'text-neuro-600',
  },
  Intermediate: {
    borderColor: '#fcd34d',         // amber-300
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-700',
  },
  High: {
    borderColor: '#fca5a5',         // red-300
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
  Negative: {
    borderColor: '#e2e8f0',         // slate-200
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-900',
    chevronClass: 'text-slate-400',
  },
};

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
  const { recordView } = useRecents();
  useEffect(() => {
    recordView({
      type: 'pathway',
      id: 'late-window-ivt',
      title: 'Late-Window IVT',
      subtitle: 'tPA eligibility in 4.5–9 h window or wake-up stroke',
      category: 'acute-stroke',
      trail: '3 steps',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [activeSection, setActiveSection] = useState(0);
  const { handleBack } = useNavigationSource();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [showFavToast, setShowFavToast] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [drawerExpanded, setDrawerExpanded] = useState(false);
  // Auto-expand drawer on first transition to a final verdict so clinicians
  // discover the recommendation surface. Subsequent toggles are user-driven.
  // Audit 2026-05-22 Task B Phase 1A.
  const hasAutoExpandedRef = useRef(false);
  const isFav = isFavorite('ivt-extended-pathway');
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
      details: 'This patient falls within the standard 4.5-hour thrombolysis window. Use the standard IVT eligibility criteria; extended-window protocols do not apply.',
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
      if (aRecognition === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'Outside recognition window', details: 'Path A (WAKE-UP/THAWS) requires treatment within 4.5h of symptom recognition; this window has passed.' };
      if (aDwiSmall === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'DWI lesion ≥ 1/3 MCA territory', details: 'DWI lesion size criterion not met. Both WAKE-UP and THAWS required a DWI lesion smaller than 1/3 of the MCA territory.' };
      if (aFlair === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'No DWI-FLAIR mismatch', details: 'DWI-FLAIR mismatch not present. A FLAIR-positive lesion in the DWI territory indicates established infarct (>4.5h estimated age); tissue no longer viable for thrombolysis.' };
      if (aRecognition === true && aDwiSmall === true && aFlair === true) return {
        eligible: true, status: 'Eligible', variant: 'success', cor: '2a',
        path: 'A', trialsBasis: ['WAKE-UP', 'THAWS'], showBothAgents: true,
        reason: 'Path A: Unknown onset with MRI DWI-FLAIR mismatch',
        details: 'In wake-up or unknown-onset stroke, a DWI lesion without FLAIR hyperintensity suggests onset within 4.5 hours. IVT is reasonable when treatment starts within 4.5 hours of symptom recognition.',
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
          ? 'Core volume ≥ 70 mL indicates a large established infarct: EXTEND trial excluded patients with core ≥ 70 mL (CBF < 30%). Extended-window IVT not supported.'
          : 'No perfusion deficit beyond the DWI lesion; absence of diffusion-perfusion mismatch means no salvageable penumbra to treat.',
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
        reason: 'Path B/C redirect: rapid EVT planned',
        details: 'For patients beyond 4.5 hours with salvageable penumbra and rapid thrombectomy access, extended-window IVT is not indicated and should not delay mechanical reperfusion. TIMELESS did not show a functional-outcome benefit from tenecteplase when rapid EVT was already available.',
      };
      const q1Done = isCtp ? bCtpCore !== null : bMriPwi !== null;
      const q2Done = isCtp ? bCtpMismatch !== null : bMriMismatch !== null;
      if (q1Done && q2Done && bEvt === false) return {
        eligible: true, status: 'Eligible', variant: 'success', cor: '2a',
        path: 'B', trialsBasis: ['EXTEND', 'EPITHET', 'ECASS-4'], showBothAgents: true,
        reason: `Path B: 4.5–9h perfusion mismatch on ${isCtp ? 'CT perfusion' : 'MRI DWI-PWI'}`,
        details: 'IVT is reasonable 4.5 to 9 hours from last known well, or in wake-up stroke within 9 hours of the sleep midpoint, when automated perfusion imaging confirms salvageable ischemic penumbra.',
      };
    }

    // Path C
    if (pathStage === 'C') {
      if (cPenumbra === false) return { eligible: false, status: 'Not Eligible', variant: 'danger', reason: 'No salvageable penumbra', details: 'Extended-window IVT (Path C) requires confirmed target mismatch on perfusion imaging. Without evidence of viable ischemic penumbra, thrombolytic risk outweighs benefit.' };
      if (cLvo === null || cPenumbra === null) return null;
      if (cLvo === false) return {
        eligible: false, status: 'Not Eligible', variant: 'danger',
        reason: 'Path C requires an ICA or MCA (M1/M2) occlusion',
        details: 'Patients presenting beyond 9 hours from last known well without a qualifying large-vessel occlusion are not eligible for Path C IVT. Current 2026 AHA/ASA late-window thrombolysis support is limited to ICA or MCA (M1/M2) occlusions, based on TRACE-III.',
      };
      if (cLvoEvt === true) return {
        eligible: false, status: 'EVT Preferred', variant: 'warning',
        reason: 'Path B/C redirect: rapid EVT planned',
        details: 'When a patient in the extended window has salvageable tissue and prompt thrombectomy access, EVT should proceed without endorsing late-window IVT. Extended-window thrombolysis in this setting is not supported as beneficial and should not delay mechanical reperfusion.',
      };
      if (cLvoEvt === false && cLvoBarrier !== null && cExpertise === false) return {
        eligible: false, status: 'Not Eligible at Current Site', variant: 'warning',
        reason: 'Late-window IVT requires expert stroke-thrombolysis oversight',
        details: 'Late-window IVT from 9 to 24 hours carries a higher symptomatic intracranial hemorrhage risk and should be directed by clinicians with specialized thrombolytic stroke expertise. If that expertise is not available locally, do not endorse IVT at the current site; obtain telestroke support or transfer if feasible.',
      };
      if (cLvoEvt === false && cLvoBarrier !== null && cExpertise === true) {
        // Audit 2026-05-22 BLOCKING extended-ivt-path-c-wake-up-caveat: TRACE-III
        // enrolled witnessed-onset patients only. Wake-up applicability is an
        // extrapolation; surface that caveat in the result details rather than
        // implying TRACE-III directly supports wake-up use.
        const isWakeUpC = onsetMode === 'wake-up';
        return {
          eligible: true, status: 'Eligible', variant: 'warning', cor: '2b',
          path: 'C-LVO', trialsBasis: ['TRACE-III'], showBothAgents: false,
          reason: isWakeUpC
            ? 'Path C: 9–24h LVO with no feasible EVT (wake-up extrapolation)'
            : 'Path C: 9–24h LVO with no feasible EVT',
          details: isWakeUpC
            ? 'IVT with tenecteplase may be considered for acute ischemic stroke caused by an ICA or MCA (M1/M2) occlusion 9 to 24 hours from last known well. Wake-up application is an extrapolation from TRACE-III, which enrolled witnessed-onset patients only; expert oversight and individualized risk discussion are warranted. Requires salvageable penumbra, no feasible rapid EVT pathway, and treatment directed by clinicians with expertise in thrombolytic stroke care.'
            : 'IVT with tenecteplase may be considered for acute ischemic stroke caused by an ICA or MCA (M1/M2) occlusion 9 to 24 hours from last known well. This requires salvageable penumbra, no feasible rapid EVT pathway, and treatment directed by clinicians with expertise in thrombolytic stroke care.',
        };
      }
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

  /* ── Auto-advance: Setup → Criteria (or skip to Decision) ── */
  useEffect(() => {
    if (activeSection === 0 && isSetupComplete && !prevSetupRef.current) {
      prevSetupRef.current = true;
      const skipCriteria = pathStage === 'standard' || pathStage === 'outside' || pathStage === 'lkw-required';
      setTimeout(() => setActiveSection(skipCriteria ? 2 : 1), 280);
    }
    if (!isSetupComplete) prevSetupRef.current = false;
  }, [activeSection, isSetupComplete, pathStage]);

  /* ── Section summaries (used for BranchChip labels) ── */
  const getSetupSummary = useCallback((): string => {
    if (!isSetupComplete) return 'Setup';
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
  }, [isSetupComplete, onsetMode, elapsedHours, imagingModality]);

  const getCriteriaSummary = useCallback((): string => {
    if (!isCriteriaComplete) return 'Criteria';
    if (pathStage === 'A') return 'Path A · DWI-FLAIR';
    if (pathStage === 'B') return `Path B · ${imagingModality === 'ctp' ? 'CTP' : 'MRI PWI'}`;
    if (pathStage === 'C') return 'Path C · Late LVO';
    return pathStage ?? 'Criteria';
  }, [isCriteriaComplete, pathStage, imagingModality]);

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
    setDrawerExpanded(false);
    prevSetupRef.current = false;
    prevCriteriaRef.current = false;
  };

  const buildEmrText = (): string => {
    if (!result) return '';

    // Line 1: pathway name + eligibility verdict + path context
    const pathLabel = result.path
      ? result.path === 'A'     ? 'Path A, WAKE-UP / DWI-FLAIR mismatch'
      : result.path === 'B'     ? `Path B, perfusion mismatch on ${imagingModality === 'mri' ? 'MRI DWI-PWI' : 'CT perfusion'}`
      : result.path === 'C-LVO' ? 'Path C-LVO, 9–24h with no feasible EVT'
      : ''
      : '';
    const corLabel = result.cor ? `, Class ${result.cor}` : '';
    const line1Parts = [pathLabel, corLabel].filter(Boolean).join('');
    const line1 = line1Parts
      ? `Extended IVT eligibility: ${result.status} (${line1Parts})`
      : `Extended IVT eligibility: ${result.status}`;

    // Line 2: compressed clinical inputs (LKW state + imaging modality)
    const lkwStr = onsetMode === 'wake-up' && wakeTimestamp && lkwTimestamp && imagingModality === 'ctp'
      ? `bedtime ${lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, woke ${wakeTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (${hoursSinceMidpoint?.toFixed(1)}h since sleep midpoint)`
      : onsetMode === 'wake-up' && wakeTimestamp && lkwTimestamp
      ? `bedtime ${lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, woke ${wakeTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })} (${Math.round(minutesSinceWaking ?? 0)} min since waking)`
      : onsetMode === 'unknown-lkw' && lkwTimestamp
      ? `LKW ${lkwTimestamp.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}, onset unknown`
      : onsetMode === 'unknown-no-lkw'
      ? 'unknown onset, no usable LKW'
      : elapsedHours !== null ? `${formatElapsed(elapsedHours)} elapsed` : '';
    const imgStr = imagingModality === 'mri' ? 'MRI (DWI+FLAIR/PWI)' : 'CT perfusion (RAPID/equivalent)';
    const line2Parts = [lkwStr, imgStr].filter(Boolean);
    const line2 = line2Parts.join(', ') + (line2Parts.length ? '.' : '');

    // Line 3: result.reason verbatim (CLIN-2 preserved by construction — not mutated)
    // Line 4: result.details verbatim (CLIN-2 preserved by construction — not mutated)
    // Line 5 (optional): trial basis
    const lines: string[] = [line1, line2];
    if (result.reason) lines.push(result.reason);
    if (result.details && result.details !== result.reason) lines.push(result.details);
    if (result.trialsBasis?.length) {
      lines.push(`Basis: ${result.trialsBasis.join(', ')}`);
    }
    if (result.cor) {
      lines.push(`AHA/ASA 2026: COR ${result.cor}, LOE B-R`);
    }
    return lines.filter(Boolean).join('\n');
  };

  const copySummary = () => {
    if (!result) return;
    copyToClipboard(buildEmrText(), () => {
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

  /* ── Drawer tokens ── */
  const drawerState: 'A' | 'C' = result !== null ? 'C' : 'A';

  // Auto-expand drawer the first time a verdict appears.
  useEffect(() => {
    if (drawerState === 'C' && !hasAutoExpandedRef.current) {
      hasAutoExpandedRef.current = true;
      setDrawerExpanded(true);
    }
    if (drawerState === 'A') {
      hasAutoExpandedRef.current = false;
    }
  }, [drawerState]);

  const drawerTokens: SeverityTokens | null = drawerState === 'C'
    ? (result?.variant === 'success'
        ? TIER_TOKENS.Low
        : result?.variant === 'warning'
          ? TIER_TOKENS.Intermediate
          : result?.variant === 'danger'
            ? TIER_TOKENS.High
            : TIER_TOKENS.Negative)
    : null;

  /* ── Node states ── */
  const step1Node = isSetupComplete ? 'completed' : 'active';
  const step2Node = isSetupComplete
    ? (isCriteriaComplete ? 'completed' : 'active')
    : 'locked';
  const step3Node = isCriteriaComplete ? (isDecisionComplete ? 'completed' : 'active') : 'locked';

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <div className={`max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 ${isInModal ? 'pb-8' : 'pb-32'} md:pb-20`}>

      <h1 className="sr-only">Late Window IVT: Wake-Up Stroke &amp; Thrombolysis Eligibility</h1>

      {/* ── Sticky header ── */}
      <PathwayHeader
        pathwayLabel="Extended IVT Pathway"
        onBack={handleBack}
        backAriaLabel="Back to Stroke Pathways"
        isFav={isFav}
        onFavToggle={handleFavToggle}
        onReset={handleReset}
        onCopy={copySummary}
        copyConfirm={showCopyToast}
        hideHeader={hideHeader}
        shareText={buildEmrText}
        shareTitle="Extended IVT Pathway"
        onShareResult={(r) => {
          if (r === 'shared' || r === 'copied') { setShowCopyToast(true); setTimeout(() => setShowCopyToast(false), 2000); }
        }}
      />

      <div className="space-y-0 min-h-[300px] mt-6 px-4 md:px-0">

        {/* ════ STEP 1: SETUP ════ */}
        <PathwayRailStep
          stepNumber={1}
          title={STEPS[0].title.toUpperCase()}
          iconKey="clinical"
          nodeState={step1Node}
          segmentAboveTraversed={false}
        >
          <div className="space-y-6">
            {/* LKW time */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-2">Last Known Well (LKW) Time</h3>
              {!setupComplete ? (
                <div className="space-y-2">
                  <div className="bg-white border border-slate-100 rounded-xl p-4">
                    <PathwayCategoryRow
                      label="Known Onset / LKW"
                      options={[
                        { value: 'known', label: 'Known Onset', description: 'Symptoms began at known time' },
                        { value: 'unknown-lkw', label: 'Unknown Onset + Known LKW', description: 'Unwitnessed stroke but last known well is known' },
                        { value: 'unknown-no-lkw', label: 'Unknown Onset / No Usable LKW', description: 'Late-window routing will be blocked without LKW' },
                        { value: 'wake-up', label: 'Sleep Onset (Wake-up Stroke)', description: 'Enter bedtime + wake-up time' },
                      ]}
                      value={onsetMode}
                      defaultOpen={onsetMode === null}
                      onChange={(val) => {
                        clearCriteriaAnswers();
                        if (val === 'unknown-no-lkw') {
                          setOnsetMode('unknown-no-lkw');
                          setLkwTimestamp(null);
                          setWakeTimestamp(null);
                          setMinutesSinceWaking(null);
                          setHoursSinceMidpoint(null);
                        } else {
                          setPendingOnsetMode(val as Exclude<OnsetMode, 'unknown-no-lkw' | null>);
                          setLkwPickerMode(val === 'wake-up' ? 'sleep' : 'specific');
                          setLkwPickerOpen(true);
                        }
                      }}
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
                <div className="bg-white border border-slate-100 rounded-xl p-4">
                  <PathwayCategoryRow
                    label="Imaging Modality"
                    options={[
                      { value: 'mri', label: 'MRI', description: 'DWI + FLAIR / PWI' },
                      { value: 'ctp', label: 'CT Perfusion', description: 'RAPID or equivalent' },
                    ]}
                    value={imagingModality}
                    defaultOpen={imagingModality === null}
                    onChange={(val) => { clearCriteriaAnswers(); setImagingModality(val as ImagingModality); }}
                  />
                </div>
              </div>
            )}

            {isSetupComplete && (
              <div className="pt-2 border-t border-slate-100">
                <PathwayLearningPearl
                  title="Pathway Selection Logic"
                  content={
                    <span>
                      <strong>Unknown onset + MRI → Path A</strong> (DWI-FLAIR, COR 2a) ·{' '}
                      <strong>4.5–9h → Path B</strong> (perfusion mismatch, COR 2a) ·{' '}
                      <strong>9–24h or unknown onset within 24h from LKW → Path C</strong> (LVO only, COR 2b). Late Path C requires LVO, no feasible rapid EVT, and expert thrombolytic stroke care.
                    </span>
                  }
                />
              </div>
            )}
          </div>
        </PathwayRailStep>

        {/* Branch chip: Setup → Criteria */}
        {isSetupComplete && (
          <div className="ml-8 my-2">
            <PathwayBranchChip
              targetFieldId="extivt-setup-summary"
              label={getSetupSummary()}
              onClick={() => setActiveSection(0)}
            />
          </div>
        )}

        {/* ════ STEP 2: CRITERIA ════ */}
        <PathwayRailStep
          stepNumber={2}
          title={STEPS[1].title.toUpperCase()}
          iconKey="imaging"
          nodeState={step2Node}
          segmentAboveTraversed={isSetupComplete}
          lockedAriaLabel="Step 2, locked, awaiting completion of Step 1"
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
                  <span className="text-xs font-bold uppercase tracking-wider text-neuro-600 bg-neuro-50 px-2 py-0.5 rounded">Path A: DWI-FLAIR Mismatch</span>
                  <span className="text-xs text-slate-400">COR 2a · LOE B-R</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Within 4.5h of symptom recognition?</h3>
                  <p className="text-xs text-slate-500 mb-2">Time of awakening with symptoms, or time witness first noticed deficit</p>

                  {/* Auto-computed badge when sleep onset mode was used — §4.7 Outcome Row */}
                  {onsetMode === 'wake-up' && wakeTimestamp && minutesSinceWaking !== null ? (
                    <div className={`grid grid-cols-[auto_1fr] gap-3 items-center px-4 py-3 rounded-2xl border mb-2 ${
                      minutesSinceWaking <= 270
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-red-50 border-red-200 text-red-700'
                    }`}>
                      {minutesSinceWaking <= 270
                        ? <Check size={20} className="text-emerald-500" aria-hidden="true" />
                        : <AlertTriangle size={20} className="text-red-500" aria-hidden="true" />
                      }
                      <span className="text-sm font-medium">
                        {minutesSinceWaking <= 270
                          ? `Within 4.5h: ${Math.round(minutesSinceWaking)} min since waking`
                          : `Outside window: ${Math.round(minutesSinceWaking)} min since waking`}
                      </span>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <PathwayCategoryRow
                        label="Within 4.5h of recognition"
                        options={[
                          { value: 'yes', label: 'Yes', description: 'Within 4.5h of recognition' },
                          { value: 'no', label: 'No', description: 'More than 4.5h since recognition' },
                        ]}
                        value={aRecognition === null ? null : aRecognition ? 'yes' : 'no'}
                        defaultOpen={aRecognition === null}
                        onChange={(val) => setARecognition(val === 'yes')}
                      />
                    </div>
                  )}

                  {aRecognition !== null && (
                    <PathwayLearningPearl title="WAKE-UP Trial" content="Thomalla et al., NEJM 2018. Alteplase vs placebo for unknown-onset stroke; required DWI-FLAIR mismatch AND treatment within 4.5h of awakening. mRS 0–1 at 90 days: 53.3% vs 41.8%." />
                  )}
                </div>

                {aRecognition === true && (
                  <div className="animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">DWI lesion smaller than 1/3 of the MCA territory?</h3>
                    <p className="text-xs text-slate-500 mb-2">Visually estimate on axial DWI sequence</p>
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <PathwayCategoryRow
                        label="DWI lesion size"
                        options={[
                          { value: 'yes', label: 'Yes, Small lesion', description: 'Small lesion, criteria met' },
                          { value: 'no', label: 'No, Large lesion', description: 'Large lesion ≥ 1/3 MCA' },
                        ]}
                        value={aDwiSmall === null ? null : aDwiSmall ? 'yes' : 'no'}
                        defaultOpen={aDwiSmall === null}
                        onChange={(val) => setADwiSmall(val === 'yes')}
                      />
                    </div>
                  </div>
                )}

                {aRecognition === true && aDwiSmall === true && (
                  <div className="animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">DWI-FLAIR mismatch present?</h3>
                    <p className="text-xs text-slate-500 mb-2">DWI positive (acute stroke) + no marked FLAIR signal change in same territory</p>
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <PathwayCategoryRow
                        label="DWI-FLAIR mismatch"
                        options={[
                          { value: 'yes', label: 'Yes, Mismatch', description: 'DWI+ and FLAIR negative / subtle' },
                          { value: 'no', label: 'No, FLAIR positive', description: 'FLAIR shows established infarct' },
                        ]}
                        value={aFlair === null ? null : aFlair ? 'yes' : 'no'}
                        defaultOpen={aFlair === null}
                        onChange={(val) => setAFlair(val === 'yes')}
                      />
                    </div>
                    {aFlair !== null && (
                      <PathwayLearningPearl title="DWI-FLAIR Mismatch Principle" content="DWI becomes positive within minutes of stroke onset. FLAIR signal changes emerge after ~4.5h. A DWI+/FLAIR− pattern suggests onset < 4.5h; the tissue is still viable." />
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
                    Path B: {imagingModality === 'ctp' ? 'CT Perfusion' : 'MRI PWI'}
                  </span>
                  <span className="text-xs text-slate-400">COR 2a · LOE B-R</span>
                </div>

                {/* Auto-computed time badge — sleep onset + CTP (EXTEND criterion) — §4.7 Outcome Row */}
                {onsetMode === 'wake-up' && wakeTimestamp && hoursSinceMidpoint !== null && imagingModality === 'ctp' && (
                  <div className={`grid grid-cols-[auto_1fr] gap-3 items-center px-4 py-3 rounded-2xl border ${
                    hoursSinceMidpoint <= 9
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {hoursSinceMidpoint <= 9
                      ? <Check size={20} className="text-emerald-500" aria-hidden="true" />
                      : <AlertTriangle size={20} className="text-red-500" aria-hidden="true" />
                    }
                    <span className="text-sm font-medium">
                      {hoursSinceMidpoint <= 9
                        ? `Within 9h of sleep midpoint: ${hoursSinceMidpoint.toFixed(1)}h elapsed`
                        : `Outside EXTEND window: ${hoursSinceMidpoint.toFixed(1)}h since sleep midpoint`}
                    </span>
                  </div>
                )}

                {/* CTP branch */}
                {imagingModality === 'ctp' && (
                  <>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">Ischemic core (CBF &lt;30%) &lt; 70 mL?</h3>
                      <p className="text-xs text-slate-500 mb-2">Measured on RAPID or equivalent automated software</p>
                      <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <PathwayCategoryRow
                          label="Ischemic core volume"
                          options={[
                            { value: 'yes', label: 'Yes, Core < 70 mL', description: 'Small core, criteria met' },
                            { value: 'no', label: 'No, Core ≥ 70 mL', description: 'Large established infarct' },
                          ]}
                          value={bCtpCore === null ? null : bCtpCore ? 'yes' : 'no'}
                          defaultOpen={bCtpCore === null}
                          onChange={(val) => setBCtpCore(val === 'yes')}
                        />
                      </div>
                    </div>
                    {bCtpCore === true && (
                      <div className="animate-in slide-in-from-top-2">
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Mismatch volume &gt; 10 mL AND ratio &gt; 1.2?</h3>
                        <p className="text-xs text-slate-500 mb-2">Penumbra criteria from EXTEND trial (RAPID output)</p>
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                          <PathwayCategoryRow
                            label="Mismatch criteria"
                            options={[
                              { value: 'yes', label: 'Yes, Mismatch met', description: 'Significant salvageable penumbra' },
                              { value: 'no', label: 'No, Mismatch not met', description: 'Insufficient penumbra' },
                            ]}
                            value={bCtpMismatch === null ? null : bCtpMismatch ? 'yes' : 'no'}
                            defaultOpen={bCtpMismatch === null}
                            onChange={(val) => setBCtpMismatch(val === 'yes')}
                          />
                        </div>
                        {bCtpMismatch !== null && (
                          <PathwayLearningPearl title="EXTEND Trial" content="Ma et al., NEJM 2019. Alteplase 4.5–9h with RAPID-selected mismatch (core < 70 mL; mismatch > 10 mL, ratio > 1.2). mRS 0–1 at 90 days: 35.4% vs 29.5%; adjusted RR 1.44 (95% CI 1.01–2.06; P=0.04). NNT ≈ 17 from absolute risk reduction. EXTEND was stopped early after WAKE-UP published; effect size (NNT ≈17) may be overestimated." />
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
                      <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <PathwayCategoryRow
                          label="PWI perfusion deficit"
                          options={[
                            { value: 'yes', label: 'Yes, PWI deficit present', description: 'Perfusion delay beyond DWI' },
                            { value: 'no', label: 'No, No PWI deficit', description: 'No perfusion abnormality' },
                          ]}
                          value={bMriPwi === null ? null : bMriPwi ? 'yes' : 'no'}
                          defaultOpen={bMriPwi === null}
                          onChange={(val) => setBMriPwi(val === 'yes')}
                        />
                      </div>
                    </div>
                    {bMriPwi === true && (
                      <div className="animate-in slide-in-from-top-2">
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Diffusion-perfusion mismatch confirmed?</h3>
                        <p className="text-xs text-slate-500 mb-2">Penumbra volume (PWI − DWI) &gt; 10 mL with ratio &gt; 1.2</p>
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                          <PathwayCategoryRow
                            label="Diffusion-perfusion mismatch"
                            options={[
                              { value: 'yes', label: 'Yes, Mismatch confirmed', description: 'Viable ischemic penumbra present' },
                              { value: 'no', label: 'No, No mismatch', description: 'No salvageable tissue' },
                            ]}
                            value={bMriMismatch === null ? null : bMriMismatch ? 'yes' : 'no'}
                            defaultOpen={bMriMismatch === null}
                            onChange={(val) => setBMriMismatch(val === 'yes')}
                          />
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
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <PathwayCategoryRow
                        label="EVT indication"
                        options={[
                          { value: 'yes', label: 'Yes, Rapid EVT planned', description: 'Do not endorse extended IVT' },
                          { value: 'no', label: 'No, IVT only', description: 'No LVO or EVT not available' },
                        ]}
                        value={bEvt === null ? null : bEvt ? 'yes' : 'no'}
                        defaultOpen={bEvt === null}
                        onChange={(val) => setBEvt(val === 'yes')}
                      />
                    </div>
                    {bEvt !== null && (
                      <PathwayLearningPearl title="Late IVT vs Rapid EVT" content="In the extended window, IVT should not be endorsed when rapid thrombectomy is already planned. This pathway applies only when prompt EVT is unavailable." />
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── PATH C ── */}
            {pathStage === 'C' && (
              <div className="space-y-6 animate-in slide-in-from-top-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">Path C: Late-Window LVO Only</span>
                  <span className="text-xs text-slate-400">COR 2b · LOE B-R</span>
                </div>
                <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                  <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                  <span><strong>COR 2b: Weaker Evidence.</strong> Path C is limited to LVO with salvageable penumbra when EVT cannot be performed promptly and treatment is directed by clinicians with expertise in thrombolytic stroke care.</span>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-700 mb-1">Salvageable penumbra / target mismatch on perfusion imaging?</h3>
                  <p className="text-xs text-slate-500 mb-2">CT-P or MRI-PWI showing ischemic core with surrounding hypoperfused but viable tissue</p>
                  <div className="bg-white border border-slate-100 rounded-xl p-4">
                    <PathwayCategoryRow
                      label="Salvageable penumbra"
                      options={[
                        { value: 'yes', label: 'Yes, Penumbra confirmed', description: 'Target mismatch present' },
                        { value: 'no', label: 'No, No penumbra', description: 'No target mismatch' },
                      ]}
                      value={cPenumbra === null ? null : cPenumbra ? 'yes' : 'no'}
                      defaultOpen={cPenumbra === null}
                      onChange={(val) => setCPenumbra(val === 'yes')}
                    />
                  </div>
                  {cPenumbra !== null && (
                    <PathwayLearningPearl title="Path C Trials" content="TRACE-III (NEJM 2024, Xiong et al.) supports the 2026 AHA/ASA §4.6.3 Rec 3 Class 2b recommendation: in AIS due to LVO with salvageable penumbra, 4.5–24h from onset, who cannot receive EVT, IVT directed by clinicians with thrombolytic expertise may be beneficial. TRACE-III's inclusion was restricted to ICA/M1/M2; this pathway uses that trial population as its evidence base, though the guideline is broader (any LVO). TIMELESS (NEJM 2024) was negative when rapid EVT was available, supporting the redirect away from extended-window IVT in EVT-feasible patients." />
                  )}
                </div>

                {cPenumbra === true && (
                  <div className="animate-in slide-in-from-top-2">
                    <h3 className="text-sm font-semibold text-slate-700 mb-1">LVO (large vessel occlusion) confirmed on CTA / MRA?</h3>
                    <p className="text-xs text-slate-500 mb-2">Qualifying Path C occlusion: internal carotid or MCA M1/M2</p>
                    <div className="bg-white border border-slate-100 rounded-xl p-4">
                      <PathwayCategoryRow
                        label="LVO status"
                        options={[
                          { value: 'yes', label: 'Yes, LVO confirmed', description: 'ICA or MCA (M1/M2) occlusion' },
                          { value: 'no', label: 'No, Non-LVO', description: 'Late Path C does not apply' },
                        ]}
                        value={cLvo === null ? null : cLvo ? 'yes' : 'no'}
                        defaultOpen={cLvo === null}
                        onChange={(val) => setCLvo(val === 'yes')}
                      />
                    </div>
                  </div>
                )}

                {/* C-LVO branch */}
                {cPenumbra === true && cLvo === true && (
                  <div className="space-y-4 pl-4 border-l-2 border-slate-200 animate-in slide-in-from-top-2">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">PATH C-LVO · TRACE-III late-window pathway</p>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-1">Is EVT (thrombectomy) feasible?</h3>
                      <p className="text-xs text-slate-500 mb-2">Transfer to EVT-capable center possible within reasonable time window</p>
                      <div className="bg-white border border-slate-100 rounded-xl p-4">
                        <PathwayCategoryRow
                          label="EVT feasibility"
                          options={[
                            { value: 'yes', label: 'Yes, EVT feasible', description: 'Refer to EVT pathway' },
                            { value: 'no', label: 'No, EVT not possible', description: 'Proceed with extended IVT' },
                          ]}
                          value={cLvoEvt === null ? null : cLvoEvt ? 'yes' : 'no'}
                          defaultOpen={cLvoEvt === null}
                          onChange={(val) => setCLvoEvt(val === 'yes')}
                        />
                      </div>
                    </div>
                    {cLvoEvt === false && (
                      <div className="animate-in slide-in-from-top-2">
                        <h3 className="text-sm font-semibold text-slate-700 mb-2">Reason EVT is not possible: <span className="text-xs font-normal text-slate-500">(select one)</span></h3>
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                          <PathwayCategoryRow
                            label="EVT barrier"
                            options={EVT_BARRIERS.map(b => ({ value: b.id, label: b.label }))}
                            value={cLvoBarrier}
                            defaultOpen={cLvoBarrier === null}
                            onChange={(val) => setCLvoBarrier(val as EVTBarrierId)}
                          />
                        </div>
                      </div>
                    )}
                    {cLvoEvt === false && cLvoBarrier !== null && (
                      <div>
                        <h3 className="text-sm font-semibold text-slate-700 mb-1">Expertise in thrombolytic stroke care available?</h3>
                        <p className="text-xs text-slate-500 mb-2">Stroke expertise available on site or through tele-stroke support</p>
                        <div className="bg-white border border-slate-100 rounded-xl p-4">
                          <PathwayCategoryRow
                            label="Thrombolytic expertise"
                            options={[
                              { value: 'yes', label: 'Yes, Expert available', description: 'Late IVT can be directed safely' },
                              { value: 'no', label: 'No, Expertise unavailable', description: 'Do not endorse late IVT at current site' },
                            ]}
                            value={cExpertise === null ? null : cExpertise ? 'yes' : 'no'}
                            defaultOpen={cExpertise === null}
                            onChange={(val) => setCExpertise(val === 'yes')}
                          />
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
        </PathwayRailStep>

        {/* Branch chip: Criteria → Decision */}
        {isCriteriaComplete && (
          <div className="ml-8 my-2">
            <PathwayBranchChip
              targetFieldId="extivt-criteria-summary"
              label={getCriteriaSummary()}
              onClick={() => setActiveSection(1)}
            />
          </div>
        )}

        {/* ════ STEP 3: DECISION ════ */}
        <PathwayRailStep
          stepNumber={3}
          title={STEPS[2].title.toUpperCase()}
          iconKey="decision"
          nodeState={step3Node}
          segmentAboveTraversed={isCriteriaComplete}
          lockedAriaLabel="Step 3, locked, awaiting completion of Step 2"
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

              {/* Inline result card retired 2026-05-22 per Task B Phase 1A.
                  Recommendation now lives in the slide-up CalculatorDrawer
                  pinned to viewport bottom (auto-expands on first verdict).
                  Reasoning + details + contraindication callout moved into
                  the drawer expanded body (search for drawer-content-extivt
                  below). Dosing block continues to render inline as a
                  separate section. */}

              {/* Dosing — only when eligible */}
              {result.eligible && result.cor && (
                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dosing</h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl bg-neuro-50 border border-neuro-200">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Zap size={14} className="text-neuro-600" />
                        <span className="text-xs font-bold text-neuro-800">Tenecteplase (TNK)</span>
                        {result.path === 'A' && (
                          <span className="text-xs text-neuro-500 font-medium" title="Within 4.5h of symptom recognition: §4.6.2 Rec 1 applies">Preferred</span>
                        )}
                        {result.path !== 'A' && (
                          <span className="text-xs text-slate-500 font-medium" title="AHA 2026 §4.6.2 Rec 1 scopes TNK preference to <4.5h; §4.6.3 (4.5h+) is agent-neutral. Extended-window evidence (EXTEND, EPITHET, ECASS-4) is alteplase-based.">§4.6.3 agent-neutral</span>
                        )}
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
                      <p className="text-xs font-medium">COR 2b: document shared decision-making with patient/surrogate before administration</p>
                    </div>
                  )}
                </div>
              )}

              {/* Standard-window redirect pearl */}
              {pathStage === 'standard' && (
                <PathwayLearningPearl title="Standard IVT Protocol" content="For patients within 4.5h, use the standard IVT eligibility checklist. Tenecteplase 0.25 mg/kg (max 25 mg) is COR 1 per 2026 AHA/ASA for the standard window." />
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
        </PathwayRailStep>
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

      {/* Next steps — contextual navigation after eligibility decision. Surfaces before FAQ so CTA gets visual priority.
          GA4 baseline: /pathways/late-window-ivt 80% exit rate despite 14.7s avg engagement — clinicians get their
          answer then leave. This card gives them a natural continuation path. V approval 2026-05-22. */}
      <NextStepsCard
        heading="Continue with this patient"
        items={[
          {
            label: "Walk through the IV tPA protocol",
            description: "Dosing, contraindications, and monitoring for alteplase and tenecteplase",
            to: "/guide/iv-tpa"
          },
          {
            label: "Check EVT eligibility for this patient",
            description: "Large-vessel occlusion thrombectomy decision tool",
            to: "/pathways/evt"
          },
          {
            label: "Review the trials behind late-window IVT",
            description: "WAKE-UP, EXTEND, TIMELESS, TRACE-3 evidence summaries",
            to: "/trials/q/late-window-selection"
          },
        ]}
      />

      {/* Trials NextStepsCard — V directive 2026-05-22: surface trial links for further reading.
          Option A chosen: separate card keeps clinical-continuation CTA (above) clean and the
          trial set distinct. 6 trials — all route targets exist in /trials/*. */}
      <NextStepsCard
        heading="Trials informing this pathway"
        items={[
          {
            label: "WAKE-UP",
            description: "DWI-FLAIR mismatch in unknown-onset stroke",
            to: "/trials/wake-up-trial"
          },
          {
            label: "EXTEND",
            description: "Perfusion-selected 4.5–9h IV alteplase",
            to: "/trials/extend-trial"
          },
          {
            label: "TIMELESS",
            description: "Late-window tenecteplase with EVT (neutral)",
            to: "/trials/timeless-trial"
          },
          {
            label: "TRACE-III",
            description: "Late-window tenecteplase without EVT",
            to: "/trials/trace-iii-trial"
          },
          {
            label: "EXTEND-IA TNK",
            description: "TNK 0.25 mg/kg vs alteplase before thrombectomy",
            to: "/trials/extend-ia-tnk-trial"
          },
          {
            label: "THAWS",
            description: "Alteplase in wake-up stroke",
            to: "/trials/thaws-trial"
          },
        ]}
      />

      {/* Discrete FAQ — V approval 2026-05-21 Option A. Same data feeds JSON-LD FAQPage schema via getSchemaForRoute. */}
      <DiscreteFAQ items={getFAQsForPath('/pathways/late-window-ivt')} />

      {/* CalculatorDrawer — States A (pending) + C (verdict). No State B — result is null
          until path-specific criteria complete, so there is no provisional-verdict surface.
          This differs from Tier 4 EVT and is correct for ExtendedIVT. */}
      <CalculatorDrawer
        state={drawerState}
        tokens={drawerTokens}
        isExpanded={drawerExpanded}
        onToggle={() => setDrawerExpanded(v => !v)}
        ariaContentId="extivt-drawer-content"
        ariaLabel="Extended IVT eligibility drawer"
        stateAText={{ label: 'Eligibility', hint: 'Complete steps to see verdict' }}
        collapsedLabel="Eligibility"
        colorCollapsed={drawerState === 'C'}
        collapsedStat={
          drawerState === 'C' && result
            ? `${result.status} · ${result.reason.split('(')[0].trim()}`
            : ''
        }
      >
        {drawerState === 'C' && result && (
          <div id="extivt-drawer-content" data-drawer="content-extivt" className="px-5 pt-4 pb-4 space-y-4">
            {/* Verdict + COR badge */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest
                  ${result.variant === 'success' ? 'bg-emerald-100 text-emerald-700'
                  : result.variant === 'warning' ? 'bg-amber-100 text-amber-700'
                  : result.variant === 'danger'  ? 'bg-red-100 text-red-700'
                  : 'bg-slate-100 text-slate-600'}`}
                >
                  <Activity size={10} aria-hidden="true" />
                  Recommendation
                </span>
                {result.cor && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 uppercase tracking-widest">
                    COR {result.cor} · LOE B-R · 2026 AHA/ASA
                  </span>
                )}
              </div>
              <div className={`text-2xl font-black tracking-tight
                ${result.variant === 'success' ? 'text-emerald-900'
                : result.variant === 'warning' ? 'text-amber-900'
                : result.variant === 'danger'  ? 'text-red-900'
                : 'text-slate-900'}`}
              >
                {result.status}
              </div>
            </div>

            {/* Reasoning + details */}
            <div className="pt-3 border-t border-slate-100">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Reasoning</div>
              <div className={`text-base font-semibold leading-snug
                ${result.variant === 'success' ? 'text-emerald-900'
                : result.variant === 'warning' ? 'text-amber-900'
                : result.variant === 'danger'  ? 'text-red-900'
                : 'text-slate-900'}`}
              >
                {result.reason}
              </div>
              <div className="text-sm text-slate-700 mt-1.5 leading-relaxed">{result.details}</div>
            </div>

            {/* Contraindication-verification callout (eligible only) */}
            {result.eligible && (
              <div className="flex items-start gap-2.5 px-3 py-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>
                  Late-window selection criteria met. Standard IV thrombolysis contraindications (BP &gt;185/110, INR &gt;1.7, platelets &lt;100k, DOAC within window, recent surgery/ICH, active bleeding) must still be verified before administration, see{' '}
                  <Link to="/guide/iv-tpa" className="font-semibold underline underline-offset-2 hover:text-amber-900">IV tPA exclusions</Link>.
                </span>
              </div>
            )}
          </div>
        )}
      </CalculatorDrawer>

      {/* Toast notifications */}
      {showFavToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-[60] bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg animate-in fade-in slide-in-from-bottom-2">
          {isFav ? 'Added to favorites' : 'Removed from favorites'}
        </div>
      )}
    </div>
  );
};

export default ExtendedIVTPathway;
