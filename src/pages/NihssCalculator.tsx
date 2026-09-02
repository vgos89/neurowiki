/**
 * NIHSS Calculator — rebuilt against CALCULATOR_SPEC.md v1.1 §3 (Archetype 2)
 *
 * Spec citations:
 *   §1.1 Sticky header tokens · §1.2 Main content · §1.3 Drawer (Portal)
 *   §3.1 Two-row header · §3.2 Item numbering · §3.3 Per-item warnings
 *   §3.4 Rapid/Detailed toggle · §3.5 Shortcut buttons · §5 Drawer state machine
 *
 * Drawer note: severity bracket from established NIHSS thresholds.
 *   The RACE-derived LVO probability block was REMOVED 2026-09-01 (V): its band
 *   percentages (20/55/85) had no source, and the composite summed aphasia AND
 *   agnosia additively while displaying "/9", so it could reach 10 and was not
 *   the published RACE scale. Sourced LVO guidance survives in the severity
 *   interpretation prose, which cites §4.7.2.
 *
 * NIHSS severity thresholds (Adams et al. 1999; standard clinical convention):
 *   0   → No stroke symptoms
 *   1–4 → Minor
 *   5–15 → Moderate
 *   16–20 → Moderate-to-severe
 *   21–42 → Severe
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useNavigationSource } from '../hooks/useNavigationSource';
import { getCase } from '../lib/cases/store';
import { CalculatorHeader } from '../components/calculators/CalculatorHeader';
import { CalculatorFooter } from '../components/calculators/CalculatorFooter';
import { CalculatorTrialEvidence } from '../components/calculators/CalculatorTrialEvidence';
import { CalculatorDrawer } from '../components/calculators/CalculatorDrawer';
import { CalculatorToast } from '../components/calculators/CalculatorToast';
import { useFavorites } from '../hooks/useFavorites';
import { useRecents } from '../hooks/useRecents';
import { useDrawerState } from '../hooks/useDrawerState';
import { useCalculatorAnalytics } from '../hooks/useCalculatorAnalytics';
import type { SeverityTokens } from '../lib/calculators/severityTokens';
import { NIHSS_ITEMS, calculateTotal, getItemWarning } from '../utils/nihssShortcuts';
import { getMainScrollElement, scrollWithinMainOrWindow } from '../utils/mainScroll';
import NihssItemCard from '../components/NihssItemCard';
import DiscreteFAQ from '../components/seo/DiscreteFAQ';
import { getFAQsForPath } from '../seo/schema';
import {
  PatientContextPanel,
  EMPTY_PATIENT_CONTEXT,
  type PatientContextValues,
  type Anticoag,
} from '../components/shared/PatientContextPanel';
import type { PathwayVerdict } from '../lib/pathwayVerdict';
const ExtendedIVTPathwayModal = React.lazy(() =>
  import('../components/article/stroke/ExtendedIVTPathwayModal').then((m) => ({ default: m.ExtendedIVTPathwayModal })),
);
const ThrombectomyPathwayModal = React.lazy(() =>
  import('../components/article/stroke/ThrombectomyPathwayModal').then((m) => ({ default: m.ThrombectomyPathwayModal })),
);
import { formatClinicalDateTime } from '../utils/clinicalDateTime';
import { copyToClipboard } from '../utils/clipboard';
import type { SavedCaseData } from '../lib/cases/types';
import { saveNihssDraft, loadNihssDraft, clearNihssDraft, draftHasContent } from '../lib/nihssDraft';
import { formatBpLine } from '../lib/cases/format';
import {
  TimestampBubble,
  STROKE_TIMESTAMP_EVENTS,
  EMPTY_STROKE_TIMESTAMPS,
  type StrokeTimestamps,
  type StrokeTimestampEvent,
} from '../components/article/stroke/TimestampBubble';

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

// ─── Disabling-features checklist — minor stroke (NIHSS 1–4) ─────────────────
// Six items the clinician checks at the bedside. Any "yes" → IVT indicated per
// AHA/ASA 2026 §4.6.1 regardless of NIHSS. No items → confirmed non-disabling →
// IVT not recommended per §4.6.1 COR 3 No Benefit (PRISMS 2018).
// Approved text (humanizer-clean, em-dash-free): 2026-06-01.

const DISABLING_CHECK_ITEMS = [
  'Dysphagia or swallowing difficulty',
  'Gait disturbance: unable to walk safely without assistance',
  'Arm or hand weakness affecting a hand the patient relies on for work or daily activities (either hand)',
  'Speech impairment: slurred speech or word-finding difficulty',
  'Persistent visual field loss (monocular or hemianopic) affecting reading, driving, or work',
  "Any other symptom the patient or clinician judges disabling for the patient's work, self-care, or daily activities",
] as const;

// Short labels used in the EMR copy/share output when items are checked.
const DISABLING_CHECK_SHORT = [
  'dysphagia',
  'gait disturbance',
  'hand/arm weakness',
  'speech impairment',
  'visual field loss',
  'other disabling symptom',
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

/**
 * Every item starts at 0 rather than unanswered.
 *
 * V direction 2026-09-01: most stroke exams score 0 on most items, so requiring
 * fifteen deliberate taps to record a normal exam is fatigue for no information
 * gain. The clinician now changes only what is abnormal.
 *
 * Consequence accepted with that decision: the tool can no longer distinguish
 * "assessed and normal" from "not assessed". That distinction was already
 * unreliable, because an unanswered item was exported as 0 and counted as 0 in
 * the total, so a partially-scored exam already produced a confident wrong
 * number. Defaulting makes the behaviour honest rather than changing it.
 */
const ALL_ZERO_NIHSS: Record<string, number> = Object.fromEntries(
  NIHSS_ITEMS.map((item) => [item.id, 0]),
);

const NihssCalculator: React.FC = () => {
  const [nihssValues, setNihssValues] = useState<Record<string, number>>({ ...ALL_ZERO_NIHSS });
  // True once the clinician has actually touched a score. Distinct from
  // isComplete, which is now true from mount and therefore no longer a usable
  // signal for "the clinician produced a result".
  const [hasScored, setHasScored] = useState(false);
  const [nihssMode, setNihssMode] = useState<'rapid' | 'detailed'>('rapid');
  const [userMode] = useState<'resident' | 'attending'>('resident');
  const [activePearl, setActivePearl] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  // Disabling-features check state — minor stroke (NIHSS 1–4).
  // disablingChecks: Set of item indices (0–5) the clinician marked as present.
  // confirmedNoDisabling: true when clinician tapped "None of the above apply".
  const [disablingChecks, setDisablingChecks] = useState<Set<number>>(new Set());
  const [confirmedNoDisabling, setConfirmedNoDisabling] = useState(false);

  // Auto-captured "Performed" timestamp — set on first NIHSS item input.
  // Reset clears this back to null along with the rest of the calculator state.
  const [performedAt, setPerformedAt] = useState<Date | null>(null);

  // Optional patient context — LKW + BP + glucose + anticoagulant class.
  // All optional; appears in EMR output only when populated.
  const [patientContext, setPatientContext] = useState<PatientContextValues>({
    ...EMPTY_PATIENT_CONTEXT,
    anticoag: new Set(),
  });

  // Stroke timestamps — same bubble FAB as Stroke Code pathway. Carried into
  // the EMR copy text (filled stamps only) and into the Save Case payload.
  // V workflow 2026-05-19: clinician sends NIHSS to attending mid-code,
  // finishes the timestamps later, hits Save again, and the record updates
  // in place via `currentCaseId` (no duplicate row).
  const [strokeTimestamps, setStrokeTimestamps] = useState<StrokeTimestamps>({
    ...EMPTY_STROKE_TIMESTAMPS,
  });

  // Set after the first successful save so subsequent saves overwrite the
  // same case row (preserves createdAt, bumps updatedAt). Cleared on Reset.
  const [currentCaseId, setCurrentCaseId] = useState<string | null>(null);


  // Pathway shortcuts surfaced in the Patient Context panel. Both modals already
  // exist and carry their own focus trap and Escape handling, so this is wiring
  // rather than new UI. One at a time: opening either closes the other.
  const [activePathwayModal, setActivePathwayModal] = useState<'ivt' | 'evt' | null>(null);
  // Latest determination from each pathway, kept so a clinician who closed the
  // modal can still see where it landed. REFERENCE ONLY: these must never be
  // read by buildText or reach the copy/share template (V direction 2026-09-01).
  // Locked by src/__tests__/nihssExportGuards.test.ts.
  const [ivtVerdict, setIvtVerdict] = useState<PathwayVerdict | null>(null);
  const [evtVerdict, setEvtVerdict] = useState<PathwayVerdict | null>(null);
  // Mount a pathway only once its shortcut has been tapped; keepMounted then
  // preserves the clinician's answers across close/reopen.
  const [pathwayEverOpened, setPathwayEverOpened] = useState<{ ivt: boolean; evt: boolean }>({ ivt: false, evt: false });
  // Draft restore/autosave. `draftHydrated` gates the autosave effect: on a cold
  // mount the calculator holds pristine defaults, and writing those before the
  // restore attempt would clobber the very draft being restored.
  const [draftHydrated, setDraftHydrated] = useState(false);

  const nihssHeaderRef = useRef<HTMLDivElement>(null);
  // Starts true: with every item defaulting to 0 the exam is complete from
  // mount, and neither the discovery animation nor the analytics event should
  // fire merely because someone opened the page.
  const wasCompleteRef = useRef(true);
  // Bug-1 fix (2026-07-01 audit): the case-load useEffect can complete
  // AFTER the clinician has started scoring on the freshly-mounted
  // (still-empty) calculator, wholesale-overwriting the tapped values
  // with the saved snapshot. `userHasInteractedRef` records "the user
  // has already put a value into this session"; any handler that
  // mutates clinical state sets it true. The case-load effect refuses
  // to overwrite when it is true — instead, it asks first.
  // `hydratedCaseIdRef` records "this case has already been hydrated
  // into this session" so a re-fire of the effect (e.g., searchParams
  // identity flip) can't re-hydrate over in-flight work.
  const userHasInteractedRef = useRef(false);
  const hydratedCaseIdRef = useRef<string | null>(null);

  const { toggleFavorite, isFavorite } = useFavorites();
  const { recordView } = useRecents();
  const { handleBack } = useNavigationSource();
  const [searchParams, setSearchParams] = useSearchParams();
  const { trackResult, resetTracking } = useCalculatorAnalytics('nihss');

  // ── Reload from saved case (V audit 2026-05-19: "Can you reload it
  //    into the calculator?"). When the URL carries ?caseId=<id>, fetch
  //    the saved case, restore the calculator state, and remember the
  //    case id so subsequent saves update in place.
  useEffect(() => {
    const caseId = searchParams.get('caseId');
    if (!caseId) return;
    // Bug-1 fix: strip ?caseId from the URL SYNCHRONOUSLY BEFORE the
    // await, so a re-fire of this effect (searchParams identity flip
    // for any reason) cannot re-enter the async body. Cleanup that
    // used to run after the destructive writes now runs first.
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('caseId');
      return next;
    }, { replace: true });
    // Bug-1 fix: idempotency — if we already hydrated this exact case
    // id into this session (e.g., user navigated away and came back
    // with the same caseId), do not overwrite in-flight work.
    if (hydratedCaseIdRef.current === caseId) return;
    let cancelled = false;
    void (async () => {
      try {
        const saved = await getCase(caseId);
        if (cancelled || !saved) return;
        // Bug-1 fix: if the clinician has already put values into this
        // session BEFORE the async load resolved (fast-typist-on-cold-
        // browser race), do NOT wholesale-overwrite. Ask first — a
        // clinician's in-flight scoring is more valuable than a mostly-
        // stale snapshot they can reload manually.
        if (userHasInteractedRef.current) {
          const proceed = window.confirm(
            `Load saved case for ${saved.initials}?\n\n` +
              `You have already entered scores in this session. Loading the saved case will replace them.`
          );
          if (!proceed) {
            showToast('Kept your in-progress scores. Saved case not loaded.', 3500);
            return;
          }
        }
        // Restore NIHSS scoring
        if (saved.data.nihss) {
          setNihssValues({ ...ALL_ZERO_NIHSS, ...saved.data.nihss.values });
          setNihssMode(saved.data.nihss.mode);
          if (saved.data.nihss.performedAt) {
            setPerformedAt(new Date(saved.data.nihss.performedAt));
          }
        }
        // Restore patient context
        if (saved.data.patientContext) {
          const pc = saved.data.patientContext;
          setPatientContext({
            lkw: typeof pc.lkw === 'number'
              ? new Date(pc.lkw)
              : pc.lkw === null
              ? null
              : undefined,
            systolic: pc.systolic ?? '',
            diastolic: pc.diastolic ?? '',
            glucose: pc.glucose ?? '',
            // Drop the legacy 'none' value (removed from Anticoag) so cases
            // saved before this change load cleanly.
            anticoag: new Set((pc.anticoag ?? []).filter((k) => k !== 'none') as Anticoag[]),
            lastAnticoagDose:
              typeof pc.lastAnticoagDose === 'number'
                ? new Date(pc.lastAnticoagDose)
                : pc.lastAnticoagDose === null
                ? null
                : undefined,
            preExistingDeficits: pc.preExistingDeficits ?? '',
            doacTiming: pc.doacTiming,
            doacDrug: pc.doacDrug,
            warfarinInr: pc.warfarinInr,
            heparinAptt: pc.heparinAptt,
            weightValue: pc.weightValue,
            weightUnit: pc.weightUnit ?? 'kg',
            prestrokeMrs: pc.prestrokeMrs,
          });
        }
        // Restore stroke timestamps — only in absolute mode. Relative-mode
        // cases preserved clinical timing but stripped wall-clock; we can't
        // re-display them as Date objects without inventing an anchor. We
        // skip restoration and toast a note. Clinician can re-stamp as
        // needed and re-save in absolute mode if they need wall-clock.
        const mode = saved.data.strokeTimestampsMode ?? 'absolute';
        if (saved.data.strokeTimestamps) {
          if (mode === 'absolute') {
            const restored: StrokeTimestamps = { ...EMPTY_STROKE_TIMESTAMPS };
            for (const event of STROKE_TIMESTAMP_EVENTS) {
              const t = saved.data.strokeTimestamps[event];
              if (typeof t === 'number') {
                restored[event] = new Date(t);
              }
            }
            setStrokeTimestamps(restored);
          } else {
            // Relative mode — leave stamps unset; the clinician can re-stamp
            // any events they want absolute times on, and opt into absolute
            // storage at next save.
            setStrokeTimestamps({ ...EMPTY_STROKE_TIMESTAMPS });
            showToast('Timestamps were saved as relative offsets; re-stamp if you need exact times.', 4000);
          }
        }
        // Bug-1 fix: also restore the minor-stroke disabling-features
        // assessment — previously this state was silently dropped on
        // reload, forcing the clinician to re-evaluate a case they
        // had already worked through.
        if (saved.data.disablingChecks) {
          setDisablingChecks(new Set(saved.data.disablingChecks));
        }
        if (typeof saved.data.confirmedNoDisabling === 'boolean') {
          setConfirmedNoDisabling(saved.data.confirmedNoDisabling);
        }
        // Capture the id so subsequent saves update in place
        setCurrentCaseId(saved.id);
        // Bug-1 fix: mark this session as hydrated so a re-fire cannot
        // re-enter. The URL was already cleared synchronously above.
        hydratedCaseIdRef.current = saved.id;
        showToast(`Opened ${saved.initials} from My Cases`, 2500);
      } catch {
        // Silent on lookup failure — clinician just sees a fresh calculator.
      }
    })();
    return () => { cancelled = true; };
    // We deliberately don't depend on showToast etc. — this effect should
    // only fire when caseId changes (i.e. once on navigation).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // ── Draft restore (in-progress exam survives a reload) ─────────────────────
  //
  // The service worker reloads every open tab when a deploy activates, and iOS
  // evicts backgrounded tabs. Neither asks first, and nothing here was persisted,
  // so an exam in progress simply vanished. See src/lib/nihssDraft.ts.
  //
  // An explicit ?caseId= load wins: the clinician asked for that specific case,
  // so it must not be shadowed by whatever draft the tab happened to hold.
  useEffect(() => {
    if (draftHydrated) return;
    setDraftHydrated(true);
    if (searchParams.get('caseId')) return;
    const d = loadNihssDraft();
    if (!d || !draftHasContent(d)) return;
    setNihssValues({ ...ALL_ZERO_NIHSS, ...d.nihssValues });
    setNihssMode(d.nihssMode);
    setHasScored(d.hasScored);
    setPerformedAt(d.performedAt === null ? null : new Date(d.performedAt));
    const pc = d.patientContext;
    setPatientContext({
      lkw: pc.lkw === undefined ? undefined : pc.lkw === null ? null : new Date(pc.lkw),
      systolic: pc.systolic ?? '',
      diastolic: pc.diastolic ?? '',
      glucose: pc.glucose ?? '',
      anticoag: new Set((pc.anticoag ?? []) as Anticoag[]),
      lastAnticoagDose:
        pc.lastAnticoagDose === undefined ? undefined : pc.lastAnticoagDose === null ? null : new Date(pc.lastAnticoagDose),
      prestrokeMrs: pc.prestrokeMrs as PatientContextValues['prestrokeMrs'],
      preExistingDeficits: pc.preExistingDeficits ?? '',
      doacTiming: pc.doacTiming as PatientContextValues['doacTiming'],
      doacDrug: pc.doacDrug,
      warfarinInr: pc.warfarinInr as PatientContextValues['warfarinInr'],
      heparinAptt: pc.heparinAptt as PatientContextValues['heparinAptt'],
      weightValue: pc.weightValue,
      weightUnit: pc.weightUnit ?? 'kg',
    });
    const restoredStamps: StrokeTimestamps = { ...EMPTY_STROKE_TIMESTAMPS };
    for (const event of STROKE_TIMESTAMP_EVENTS) {
      const t = d.strokeTimestamps?.[event];
      if (typeof t === 'number') restoredStamps[event] = new Date(t);
    }
    setStrokeTimestamps(restoredStamps);
    setDisablingChecks(new Set(d.disablingChecks ?? []));
    setConfirmedNoDisabling(Boolean(d.confirmedNoDisabling));
    setCurrentCaseId(d.currentCaseId ?? null);
    // Restored work is in-flight work: a late ?caseId= hydration must ask before
    // overwriting it, exactly as it would for values typed by hand.
    userHasInteractedRef.current = true;
    showToast('Restored your in-progress exam', 3500);
    // Mount-only. searchParams is read once here on purpose.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Draft autosave ─────────────────────────────────────────────────────────
  // Debounced so typing in the free-text deficits field does not write on every
  // keystroke. sessionStorage writes are synchronous.
  useEffect(() => {
    if (!draftHydrated) return;
    const t = setTimeout(() => {
      saveNihssDraft({
        nihssValues,
        nihssMode,
        hasScored,
        performedAt: performedAt ? performedAt.getTime() : null,
        patientContext: {
          lkw:
            patientContext.lkw === undefined ? undefined : patientContext.lkw === null ? null : patientContext.lkw.getTime(),
          systolic: patientContext.systolic,
          diastolic: patientContext.diastolic,
          glucose: patientContext.glucose,
          anticoag: Array.from(patientContext.anticoag),
          lastAnticoagDose:
            patientContext.lastAnticoagDose === undefined
              ? undefined
              : patientContext.lastAnticoagDose === null
              ? null
              : patientContext.lastAnticoagDose.getTime(),
          prestrokeMrs: patientContext.prestrokeMrs,
          preExistingDeficits: patientContext.preExistingDeficits,
          doacTiming: patientContext.doacTiming,
          doacDrug: patientContext.doacDrug,
          warfarinInr: patientContext.warfarinInr,
          heparinAptt: patientContext.heparinAptt,
          weightValue: patientContext.weightValue,
          weightUnit: patientContext.weightUnit,
        },
        strokeTimestamps: Object.fromEntries(
          STROKE_TIMESTAMP_EVENTS.map((e) => [e, strokeTimestamps[e] ? strokeTimestamps[e]!.getTime() : null]),
        ),
        disablingChecks: Array.from(disablingChecks),
        confirmedNoDisabling,
        currentCaseId,
      });
    }, 400);
    return () => clearTimeout(t);
  }, [
    draftHydrated, nihssValues, nihssMode, hasScored, performedAt, patientContext,
    strokeTimestamps, disablingChecks, confirmedNoDisabling, currentCaseId,
  ]);

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

  const total = calculateTotal(nihssValues);
  const answeredCount = NIHSS_ITEMS.filter(i => nihssValues[i.id] !== undefined).length;
  const totalItems = NIHSS_ITEMS.length;
  const isComplete = answeredCount === totalItems;
  const severity = getNihssSeverity(total);

  // Disabling-features verdict — drives checklist UI and EMR copy line.
  const hasAnyDisabling = disablingChecks.size > 0;
  const disablingVerdict: 'yes' | 'no' | 'unanswered' =
    hasAnyDisabling ? 'yes' : confirmedNoDisabling ? 'no' : 'unanswered';

  const { state: drawerState, drawerOpen, setDrawerOpen, reset, toast, toastTone, showToast } = useDrawerState({
    mode: 'partial-complete',
    // Not answeredCount: every item defaults to 0, so that is always 15 and the
    // drawer would present "No symptoms, NIHSS 0" before anyone had looked at
    // the patient. Gate on real interaction instead. State B is unreachable by
    // design now, since defaulting removes the partial-exam state entirely.
    selectedCount: hasScored ? totalItems : 0,
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

  // Usage analytics. Previously fired when the 15th item was scored; with every
  // item defaulting to 0 there is no completion event, so it fires on the first
  // real interaction instead. useCalculatorAnalytics dedupes to once per
  // session. Without this move, opening the page would log a score of 0 as a
  // completed use on every single view.
  useEffect(() => {
    if (hasScored) trackResult(total);
    // total is deliberately omitted: this must fire on the first score, not on
    // every subsequent one. The hook dedupes, but re-running is pointless work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasScored, trackResult]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleNihssChange = (id: string, val: number) => {
    // Bug-1 fix: mark this session as user-interacted so a pending
    // case-load can't wholesale-overwrite the values below.
    userHasInteractedRef.current = true;
    setHasScored(true);
    // Capture "Performed" timestamp on first input — clinical convention is
    // that NIHSS time = when the exam started, not when the page opened.
    // 2026-05-23 fix per V: keep performedAt and strokeTimestamps['Neurology
    // Evaluation'] coherent. They represent the same workflow event (the
    // neurologist's first NIHSS scoring action). When one is set and the
    // other is null OR later, propagate the earlier value to both. This
    // prevents the two from drifting (V example: Exam Performed 4:35 PM
    // vs Neurology Evaluation 4:42 PM when both should read 4:35 PM).
    if (performedAt === null) {
      const now = new Date();
      const existingNeuro = strokeTimestamps['Neurology Evaluation'];
      // "Earlier wins" reconciliation across both fields:
      //   - If Neuro Eval is already set and earlier than `now` (because
      //     autoStampNeuroEvalOnFirstInteraction fired on a prior document
      //     click), adopt that earlier value as performedAt. Leave Neuro
      //     Eval unchanged.
      //   - If Neuro Eval is null OR later than `now`, performedAt = now AND
      //     update Neuro Eval to `now` (the NIHSS-tap event IS the earlier
      //     value).
      // Net invariant: performedAt and Neuro Eval are always equal to the
      // earlier of the two underlying timestamps. V instruction
      // 'should be the same. or whichever one comes first.'
      if (existingNeuro !== null && existingNeuro < now) {
        setPerformedAt(existingNeuro);
      } else {
        setPerformedAt(now);
        setStrokeTimestamps((prev) => ({ ...prev, 'Neurology Evaluation': now }));
      }
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
    userHasInteractedRef.current = true; // Bug-1 fix
    setNihssValues((prev) => ({ ...prev, '5a': val, '5b': val, '6a': val, '6b': val }));
  };

  const buildText = () => {
    // Severity bracket (minor/moderate/severe) intentionally NOT included in
    // the exported summary — that interpretation tier lives in the in-app
    // drawer for clinical guidance. The export string carries the number and
    // the documentation block only. (V direction 2026-05-20.)
    // UN (untestable, internal value 9) is now available on 5a, 5b, 6a, 6b, 7 and
    // 10, matching the published scale. It must print as "UN" rather than the
    // internal 9, on every item that offers it.
    const EXPORT_ITEM_LABELS: ReadonlyArray<[string, string]> = [
      ['1a', '1a. LOC'],
      ['1b', '1b. LOC Questions'],
      ['1c', '1c. LOC Commands'],
      ['2', '2. Best Gaze'],
      ['3', '3. Visual Fields'],
      ['4', '4. Facial Palsy'],
      ['5a', '5a. Motor L Arm'],
      ['5b', '5b. Motor R Arm'],
      ['6a', '6a. Motor L Leg'],
      ['6b', '6b. Motor R Leg'],
      ['7', '7. Limb Ataxia'],
      ['8', '8. Sensory'],
      ['9', '9. Best Language'],
      ['10', '10. Dysarthria'],
      ['11', '11. Extinction/Neglect'],
    ];
    const itemLines = EXPORT_ITEM_LABELS.map(([id, label]) =>
      `${label}: ${nihssValues[id] === 9 ? 'UN' : (nihssValues[id] ?? 0)}`,
    );

    // ── Patient-context lines — always emit so the EMR record is complete.
    //    Empty value → "Not entered" (timestamps, BP, glucose) or "None"
    //    (anticoag/antiplatelet). V direction 2026-05-19: clinicians need
    //    a complete documentation block even when some fields weren't
    //    captured during the exam.
    const ANTICOAG_LABELS: Record<Anticoag, string> = {
      antiplatelet: 'Antiplatelet',
      doac: 'DOAC',
      warfarin: 'Warfarin',
      heparin: 'Heparin/LMWH',
    };
    // Time since onset for the copy export. Uses LKW as onset, shown only when
    // a witnessed LKW timestamp is set. Computed at copy time. The on-screen
    // within/beyond-4.5h chip is intentionally NOT exported (live bedside aid).
    // V direction 2026-06-10.
    const elapsedSinceOnset = (from: Date): string => {
      const min = Math.max(0, Math.floor((Date.now() - from.getTime()) / 60000));
      const hh = Math.floor(min / 60);
      const mm = min % 60;
      return hh > 0 ? `${hh} h ${mm} min` : `${mm} min`;
    };
    // Per-drug IV-thrombolysis eligibility detail for the copy export. Mirrors
    // the on-screen inputs (DOAC last-dose timing + drug name, warfarin INR,
    // heparin/LMWH aPTT). Emitted for every selected drug class; a class the
    // clinician selected but never answered reads "Not entered" rather than
    // vanishing, so the note distinguishes "asked and normal" from "not asked".
    const eligibilityLines: string[] = [];
    if (patientContext.anticoag.has('doac')) {
      const doacParts = [
        patientContext.doacDrug || undefined,
        patientContext.doacTiming === 'lt48h'
          ? 'last dose <48 h'
          : patientContext.doacTiming === 'gte48h'
          ? 'last dose ≥48 h'
          : undefined,
      ].filter(Boolean);
      eligibilityLines.push(`DOAC: ${doacParts.length ? doacParts.join(', ') : 'Not entered'}`);
    }
    if (patientContext.anticoag.has('warfarin')) {
      eligibilityLines.push(
        `Warfarin INR: ${
          patientContext.warfarinInr === undefined
            ? 'Not entered'
            : patientContext.warfarinInr === 'gt1_7'
            ? '>1.7'
            : '≤1.7'
        }`,
      );
    }
    if (patientContext.anticoag.has('heparin')) {
      eligibilityLines.push(
        `Heparin/LMWH aPTT: ${
          patientContext.heparinAptt === undefined
            ? 'Not entered'
            : patientContext.heparinAptt === 'gt40s'
            ? '>40 s'
            : '≤40 s'
        }`,
      );
    }
    const contextLines: string[] = [
      performedAt
        ? `Exam Performed: ${formatClinicalDateTime(performedAt)}`
        : `Exam Performed: Not entered`,
      patientContext.lkw === null
        ? `LKW: Unknown / wake-up`
        : patientContext.lkw instanceof Date
        ? `LKW: ${formatClinicalDateTime(patientContext.lkw)}`
        : `LKW: Not entered`,
      patientContext.lkw instanceof Date
        ? `~${elapsedSinceOnset(patientContext.lkw)} since onset`
        : null,
      formatBpLine(patientContext.systolic, patientContext.diastolic),
      patientContext.glucose
        ? `Glucose: ${patientContext.glucose} mg/dL`
        : `Glucose: Not entered`,
      // Weight documents the basis of any dose given. The computed doses are
      // deliberately NOT exported: a dose line in a chart note reads as an
      // order, and this calculator does not prescribe. Same principle as the
      // pathway verdicts (V direction 2026-09-01).
      patientContext.weightValue && patientContext.weightValue > 0
        ? `Weight: ${patientContext.weightValue} ${patientContext.weightUnit ?? 'kg'}`
        : `Weight: Not entered`,
      // Nothing selected means nobody recorded an answer, not a confirmed
      // negative. "None" asserted in an exported note that the patient is on
      // no anticoagulant when the question may never have been asked.
      patientContext.anticoag.size > 0
        ? `Anti-Coag/Antiplatelet: ${Array.from(patientContext.anticoag).map((k) => ANTICOAG_LABELS[k]).join(', ')}`
        : `Anti-Coag/Antiplatelet: Not entered`,
      // Per-drug eligibility detail (DOAC timing/drug, warfarin INR, heparin aPTT).
      ...eligibilityLines,
      // Legacy last-dose line: only fires for cases saved before the per-drug
      // inputs shipped (lastAnticoagDose is no longer set by the current UI).
      (patientContext.anticoag.has('doac') || patientContext.anticoag.has('warfarin')) &&
      patientContext.lastAnticoagDose !== undefined
        ? patientContext.lastAnticoagDose === null
          ? 'Last anticoag dose: Unknown'
          : `Last anticoag dose: ${formatClinicalDateTime(patientContext.lastAnticoagDose)}`
        : null,
      `Pre-stroke mRS: ${
        patientContext.prestrokeMrs !== undefined ? patientContext.prestrokeMrs : 'Not entered'
      }`,
      `Pre-existing deficits: ${
        patientContext.preExistingDeficits ? patientContext.preExistingDeficits : 'Not entered'
      }`,
    ].filter((line): line is string => line !== null);

    // ── Stroke timestamps block — only emit stamps that have actually been
    //    recorded. Empty stamps are silently omitted (V direction 2026-05-19:
    //    clinician may send NIHSS mid-code without timestamps; entering them
    //    later and re-sharing should include them automatically).
    const stampLines: string[] = [];
    const anchorMs = strokeTimestamps['Code Activation']?.getTime() ?? null;
    const fmtTime = (d: Date) =>
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    for (const event of STROKE_TIMESTAMP_EVENTS) {
      const stamp = strokeTimestamps[event];
      if (!stamp) continue;
      // Dedup vs the "Exam Performed" context line. "Neurology Evaluation" and
      // performedAt are kept in sync (see handleNihssChange) because they are
      // the same workflow event. With no Code Activation anchor the stamp shows
      // no elapsed offset, so printing it here just repeats "Exam Performed".
      // Skip it in that case so the EMR paste does not show the time twice.
      // (V flag 2026-06-10: "Neurology Evaluation" and "Exam Performed" both
      // read 7:31 AM.) When a Code Activation anchor exists the line carries a
      // useful "+Xm" door-to-eval offset, so it is kept.
      if (
        event === 'Neurology Evaluation' &&
        anchorMs === null &&
        performedAt !== null &&
        stamp.getTime() === performedAt.getTime()
      ) {
        continue;
      }
      if (event === 'Code Activation' || anchorMs === null) {
        stampLines.push(`${event}: ${fmtTime(stamp)}`);
      } else {
        const diffMin = Math.max(0, Math.floor((stamp.getTime() - anchorMs) / 60000));
        const hh = Math.floor(diffMin / 60);
        const mm = diffMin % 60;
        const elapsed = hh > 0 ? `+${hh}h ${mm}m` : `+${mm}m`;
        stampLines.push(`${event}: ${fmtTime(stamp)} (${elapsed})`);
      }
    }

    const header = `NIHSS: ${total}`;
    const blocks: string[] = [header, contextLines.join('\n')];

    // Disabling features line — only emitted when total is in the minor range
    // (1–4) and the clinician has made an explicit assessment.
    if (total >= 1 && total <= 4) {
      if (hasAnyDisabling) {
        const checkedLabels = [...disablingChecks]
          .sort((a, b) => a - b)
          .map((idx) => DISABLING_CHECK_SHORT[idx])
          .join(', ');
        blocks.push(
          `Disabling features: present (${checkedLabels}); IVT indicated per AHA/ASA 2026 §4.6.1 (Class I, Level A)`,
        );
      } else if (confirmedNoDisabling) {
        blocks.push(
          'Disabling features: none identified; IVT not recommended per AHA/ASA 2026 §4.6.1 (Class 3 No Benefit)',
        );
      }
    }

    if (stampLines.length > 0) {
      blocks.push(`Timestamps:\n${stampLines.join('\n')}`);
    }
    blocks.push(itemLines.join('\n'));
    return blocks.join('\n\n');
  };

  // The success toast is gated on the copy actually landing. Previously it
  // fired unconditionally, so a WebKit rejection showed "Copied to clipboard"
  // while the clipboard still held the previous patient's note (field report
  // 2026-07-27, iPhone). On failure we point at Send, which uses the native
  // share sheet and still works in the in-app browsers that block clipboard.
  const copyNihss = () => {
    copyToClipboard(
      buildText(),
      () => showToast('Copied to clipboard', 2000),
      () => showToast('Copy failed. Use Send instead.', 3500, 'assertive'),
    );
  };

  const handleFavToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const isNowFav = toggleFavorite('nihss');
    showToast(isNowFav ? 'Saved to favorites' : 'Removed from favorites', 2000);
  };

  const handleReset = () => {
    // Bug-1 fix: an explicit Reset means "start fresh" — a pending
    // case-load must not undo it. Mark interacted so the guard blocks
    // any late-arriving hydration; clear the hydrated-case ref so a
    // future ?caseId= on this session can load again if the user
    // navigates back with a new one.
    userHasInteractedRef.current = true;
    hydratedCaseIdRef.current = null;
    setNihssValues({ ...ALL_ZERO_NIHSS });
    setHasScored(false);
    setPerformedAt(null);
    setPatientContext({ ...EMPTY_PATIENT_CONTEXT, anticoag: new Set() });
    setStrokeTimestamps({ ...EMPTY_STROKE_TIMESTAMPS });
    setDisablingChecks(new Set());
    setConfirmedNoDisabling(false);
    // New patient / new exam → next save should create a fresh row.
    setCurrentCaseId(null);
    // New patient: drop the persisted draft too, or a reload would resurrect the
    // previous patient's exam after an explicit Reset.
    clearNihssDraft();
    // New patient means the previous patient's pathway determinations must go.
    setIvtVerdict(null);
    setEvtVerdict(null);
    setPathwayEverOpened({ ivt: false, evt: false });
    resetTracking();
    reset();
    showToast('Reset', 1500);
  };

  /** Normal exam shortcut — Phase 7E §3.5: set all 15 items to 0, open drawer */
  const handleNormalExam = () => {
    userHasInteractedRef.current = true; // Bug-1 fix
    const allZero = { ...ALL_ZERO_NIHSS };
    // Capture Performed timestamp on shortcut too — the exam was just done.
    if (performedAt === null) {
      setPerformedAt(new Date());
    }
    setNihssValues(allZero);
    setHasScored(true);
    setDrawerOpen(true);
  };

  // ── Drawer content ─────────────────────────────────────────────────────────

  /** Expanded drawer content — severity bracket + LVO label (Option A shell) */
  const DrawerContent: React.FC = () => (
    <div
      id="nihss-drawer-content"
      role="region"
      aria-label="NIHSS Score Interpretation"
      className="max-h-[60dvh] overflow-y-auto"
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

        {/* Severity interpretation — clinical prose tagged for claim registry.
            Source: AHA/ASA 2026 §4.6.1 (Thrombolysis Decision-Making) and
            §4.7.2 (EVT). Bands match nihssScoring (Adams 1999 conventions). */}
        <div
          data-claim="nihss-severity-interpretation-2026"
          className="text-xs text-slate-600 space-y-3 mb-4 pt-3 border-t border-slate-100"
        >
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            What this severity means
          </div>
          <p>
            <span className="font-semibold text-emerald-700">Minor (1–4).</span> Subtle deficit. The IVT decision turns on whether the deficit is disabling for that patient, not on the NIHSS number. Per AHA/ASA 2026 §4.6.1, IVT is not recommended for clearly non-disabling deficits within 4.5 h. DAPT (clopidogrel + aspirin × 21 days) is the preferred alternative for NIHSS ≤3 or high-risk TIA per §4.8.
          </p>
          <p>
            <span className="font-semibold text-amber-700">Moderate (5–15).</span> Disabling deficit. IVT is clearly indicated within 4.5 h absent contraindications. NIHSS ≥6 with cortical signs raises LVO probability and triggers urgent vascular imaging (CTA head and neck) for EVT triage per §4.7.2.
          </p>
          <p>
            <span className="font-semibold text-red-600">Moderate to severe (16–20).</span> Typical proximal LVO range. Expedite CTA, mobilize the EVT pathway, and confirm prestroke mRS 0–1 and ASPECTS 3–10 for standard 0–6 h selection (ASPECTS ≥6 applies to the 6–24 h window). Post-IVT BP target ≤180/105.
          </p>
          <p>
            <span className="font-semibold text-red-700">Severe (≥21).</span> Large-territory infarct risk. Reassess core size (ASPECTS), age, and prestroke function before EVT; large-core EVT (ASPECTS 3–5) remains supported per §4.7.2 in selected patients. Symptomatic hemorrhage risk after IVT is elevated; document the IVT discussion when proceeding.
          </p>
        </div>


        {/* Copy shortcut — the Save Case action moved to the sticky
            header (bookmark icon between Reset and Copy) so every
            calculator surfaces it in the same place. */}
        <button
          type="button"
          onClick={() => { copyNihss(); setDrawerOpen(false); }}
          className="w-full mt-1 min-h-[44px] bg-neuro-500 hover:bg-neuro-600 text-white py-2.5 rounded-full text-sm font-medium transition-colors"
        >
          Copy to clipboard
        </button>

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
      <h1 className="sr-only">NIHSS Calculator: NIH Stroke Scale Online</h1>

      {/* ── Sticky header — CALCULATOR_SPEC.md §1.1 + §3.1 ──────────────── */}
      {/* scoreDisplay omitted — NIHSS score lives in the interpretation bar at
          the bottom, not the sticky header. Rapid/Detailed toggle goes to the
          secondaryRow so the primary row stays within budget at 375px. */}
      <CalculatorHeader
        name="NIH Stroke Scale"
        headerRef={nihssHeaderRef}
        scoreAriaLabel={`NIH Stroke Scale. ${nihssMode} mode.`}
        secondaryRow={
          <div className="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5">
            <button
              type="button"
              onClick={() => setNihssMode('rapid')}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                nihssMode === 'rapid'
                  ? 'bg-white text-slate-900'
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
                  ? 'bg-white text-slate-900'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Detailed
            </button>
          </div>
        }
        onCopy={copyNihss}
        saveCase={{
          source: { type: 'calculator', id: 'nihss', title: 'NIHSS' },
          buildData: ({ saveAbsoluteTimestamps }): SavedCaseData => {
            const stamps: SavedCaseData['strokeTimestamps'] = {};
            const filledEntries = STROKE_TIMESTAMP_EVENTS
              .map((event) => [event, strokeTimestamps[event]] as const)
              .filter((e): e is readonly [StrokeTimestampEvent, Date] => e[1] instanceof Date);
            const hasAnyStamp = filledEntries.length > 0;
            if (hasAnyStamp) {
              if (saveAbsoluteTimestamps) {
                for (const [event, d] of filledEntries) {
                  stamps[event] = d.getTime();
                }
              } else {
                const anchorMs = Math.min(...filledEntries.map(([, d]) => d.getTime()));
                for (const [event, d] of filledEntries) {
                  stamps[event] = d.getTime() - anchorMs;
                }
              }
            }
            return {
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
                lastAnticoagDose:
                  patientContext.lastAnticoagDose instanceof Date
                    ? patientContext.lastAnticoagDose.getTime()
                    : patientContext.lastAnticoagDose,
                preExistingDeficits: patientContext.preExistingDeficits || undefined,
                doacTiming: patientContext.doacTiming,
                doacDrug: patientContext.doacDrug || undefined,
                warfarinInr: patientContext.warfarinInr,
                heparinAptt: patientContext.heparinAptt,
                weightValue: patientContext.weightValue,
                weightUnit: patientContext.weightUnit,
                prestrokeMrs: patientContext.prestrokeMrs,
              },
              strokeTimestamps: hasAnyStamp ? stamps : undefined,
              strokeTimestampsMode: hasAnyStamp
                ? (saveAbsoluteTimestamps ? 'absolute' : 'relative')
                : undefined,
              // Bug-1 fix: persist the disabling-features assessment
              // so reload can restore it. Undefined when there's
              // nothing meaningful to save.
              disablingChecks: disablingChecks.size > 0
                ? Array.from(disablingChecks)
                : undefined,
              confirmedNoDisabling: confirmedNoDisabling || undefined,
            };
          },
          existingCaseId: currentCaseId ?? undefined,
          onSaved: (id) => {
            setCurrentCaseId(id);
            showToast(currentCaseId ? 'Case updated' : 'Case saved', 2000);
          },
          hasStrokeTimestamps: true,
          hasFilledStrokeTimestamps: STROKE_TIMESTAMP_EVENTS.some(
            (event) => strokeTimestamps[event] instanceof Date
          ),
        }}
        shareText={buildText}
        shareTitle="NIHSS"
        onShareResult={(r) => {
          if (r === 'shared') showToast('Sent');
          else if (r === 'copied') showToast('Copied to clipboard');
          // 'failed' previously showed nothing, so a failed Send was
          // indistinguishable from a dead tap. That is the dead end the Copy
          // failure toast could send a clinician into, so it gets an honest
          // message and the one recovery that actually works: in-app browsers
          // block both clipboard and share, and opening in Safari/Chrome does not.
          else if (r === 'failed') showToast('Send failed. Open this page in your browser.', 4000, 'assertive');
        }}
        onBack={handleBack}
        onReset={handleReset}
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
          <PatientContextPanel
            values={patientContext}
            onChange={(next) => {
              // Bug-1 fix: any patient-context edit is a user interaction.
              userHasInteractedRef.current = true;
              setPatientContext(next);
            }}
            showThrombolysisTiming
            pathwayActions={[
              {
                id: 'ext-ivt',
                label: 'Late IVT pathway',
                onClick: () => { setPathwayEverOpened((p) => ({ ...p, ivt: true })); setActivePathwayModal('ivt'); },
                status: ivtVerdict
                  ? { label: ivtVerdict.status, tone: ivtVerdict.variant ?? 'neutral' }
                  : undefined,
              },
              {
                id: 'evt',
                label: 'LVO / thrombectomy pathway',
                onClick: () => { setPathwayEverOpened((p) => ({ ...p, evt: true })); setActivePathwayModal('evt'); },
                status: evtVerdict
                  ? { label: evtVerdict.status, tone: evtVerdict.variant ?? 'neutral' }
                  : undefined,
              },
            ]}
          />
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
            // No item is "required" now that all default to 0; the badge would
            // mark an item that already holds a value. Removed 2026-09-01.
            const isRequired = false;

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

        {/* Disabling features checklist — minor stroke only (total 1–4).
            Moved out of the pull-up drawer into the main flow 2026-09-01 (V):
            for a NIHSS 1–4 patient this is the decision that determines IVT vs
            DAPT, and it was reachable only by opening the drawer. Gated on a
            COMPLETE exam so it cannot appear while the running total is still
            climbing through 1–4 on its way to a higher score.
            Three verdict states drive the banner text.
            data-claim tags the clinical content for the claim registry.
            Approved text: docs/reviews/clinical-PR-nihss-low-score-checklist.md */}
        {isComplete && total >= 1 && total <= 4 && (
          <div
            data-claim="nihss-minor-disabling-check"
            className="bg-white rounded-xl border border-slate-100 p-5 mb-4"
          >
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Disabling features
            </div>

            {/* Verdict banner */}
            <div className={`rounded-lg px-3 py-2.5 mb-3 text-xs leading-relaxed ${
              disablingVerdict === 'yes'
                ? 'bg-emerald-50 text-emerald-800'
                : disablingVerdict === 'no'
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-slate-50 text-slate-500'
            }`}>
              {disablingVerdict === 'yes' && (
                'Disabling features present. Per AHA/ASA 2026, IVT is recommended for disabling deficits regardless of NIHSS, provided the time window and eligibility criteria are met (Class I, Level A).'
              )}
              {disablingVerdict === 'no' && (
                'No disabling features identified. AHA/ASA 2026 does not recommend IVT routinely for mild non-disabling stroke (Class 3 No Benefit, Level B-R). PRISMS trial (alteplase vs aspirin, stopped early, n=313) showed no functional benefit and higher sICH (3.2% vs 0%). Clinical judgment may still favor IVT in selected patients.'
              )}
              {disablingVerdict === 'unanswered' && (
                'Minor stroke. Check for disabling features below.'
              )}
            </div>

            {/* Checklist items */}
            <div className="space-y-1">
              {DISABLING_CHECK_ITEMS.map((item, idx) => (
                <label
                  key={idx}
                  className="flex items-start gap-3 cursor-pointer rounded-lg px-2.5 py-2 hover:bg-slate-50 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={disablingChecks.has(idx)}
                    onChange={(e) => {
                      userHasInteractedRef.current = true; // Bug-1 fix
                      setDisablingChecks((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) {
                          next.add(idx);
                        } else {
                          next.delete(idx);
                        }
                        return next;
                      });
                      if (e.target.checked) setConfirmedNoDisabling(false);
                    }}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-neuro-600 focus-visible:ring-2 focus-visible:ring-neuro-500 flex-shrink-0"
                    aria-label={item}
                  />
                  <span className="text-xs text-slate-700 leading-snug">{item}</span>
                </label>
              ))}
            </div>

            {/* "None of the above apply" — visible only while nothing is checked
                and the clinician hasn't yet confirmed. Tapping advances to the
                All-No verdict. */}
            {!hasAnyDisabling && !confirmedNoDisabling && (
              <button
                type="button"
                onClick={() => {
                  userHasInteractedRef.current = true; // Bug-1 fix
                  setConfirmedNoDisabling(true);
                }}
                className="mt-2 text-xs text-slate-400 hover:text-slate-600 transition-colors underline-offset-2 hover:underline"
              >
                None of the above apply
              </button>
            )}
          </div>
        )}

        {/* Trials informing thresholds — STRONG-confidence per
            calculatorTrialMap (V approval 2026-05-21). Renders nothing
            if confidence is not STRONG. */}
        <CalculatorTrialEvidence calculatorId="nihss" />

        {/* Footer — §1.2 */}
        <CalculatorFooter
          citation="Brott T et al. Measurements of acute cerebral infarction: a clinical examination scale. Stroke. 1989;20(7):864–870."
          disclaimer="Educational use only. Not a substitute for clinical judgment."
        />

        {/* Discrete FAQ — Option A (V approval 2026-05-21). Closed-by-default
            accordion at page bottom. Same data feeds JSON-LD FAQPage schema
            via getSchemaForRoute → both surfaces stay in sync. */}
        <DiscreteFAQ items={getFAQsForPath('/calculators/nihss')} />

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
        colorCollapsed={total > 0}
      >
        <DrawerContent />
      </CalculatorDrawer>

      {/* ── Stroke timestamps bubble — same FAB as Stroke Code pathway.
            Controlled mode: NIHSS owns the state so it round-trips into the
            EMR copy text + Save Case payload. Emergency FAB intentionally
            omitted in this surface (no tPA-reversal / orolingual-edema
            workflow lives in NIHSS standalone). */}
      <TimestampBubble
        value={strokeTimestamps}
        onChange={(next) => {
          // Sync Exam Performed (performedAt) with Neurology Evaluation —
          // they represent the same workflow event (neurologist's first
          // exam action). When Neuro Eval is set/edited via the bubble and
          // performedAt is null OR later than the new Neuro Eval value,
          // pull the earlier value into performedAt. Reverse direction
          // (NIHSS first tap → set Neuro Eval) is handled in
          // handleNihssChange. 2026-05-23 fix per V.
          const nextNeuro = next['Neurology Evaluation'];
          if (nextNeuro && (performedAt === null || nextNeuro < performedAt)) {
            setPerformedAt(nextNeuro);
          }
          setStrokeTimestamps(next);
        }}
        autoStampNeuroEvalOnFirstInteraction
      />

      {/* ── Pathway modals ───────────────────────────────────────────────── */}
      {/* Opened from the Patient Context panel shortcuts. Both wrap their full
          pathway page with hideHeader + isInModal and bring their own focus
          trap, so the clinician works the decision tree without losing the
          NIHSS scoring underneath. */}
      <React.Suspense fallback={null}>
        {pathwayEverOpened.ivt && (
          <ExtendedIVTPathwayModal
            isOpen={activePathwayModal === 'ivt'}
            onClose={() => setActivePathwayModal(null)}
            onVerdictChange={setIvtVerdict}
            keepMounted
          />
        )}
        {pathwayEverOpened.evt && (
          <ThrombectomyPathwayModal
            isOpen={activePathwayModal === 'evt'}
            onClose={() => setActivePathwayModal(null)}
            onVerdictChange={setEvtVerdict}
            keepMounted
          />
        )}
      </React.Suspense>

      {/* ── Toast ─────────────────────────────────────────────────────────── */}
      <CalculatorToast message={toast} tone={toastTone} />
    </>
  );
};

export default NihssCalculator;
