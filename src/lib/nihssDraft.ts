/**
 * Crash-and-reload survival for an in-progress NIHSS exam.
 *
 * WHY THIS EXISTS
 * ---------------
 * Nothing in the calculator was persisted until the clinician explicitly hit
 * Save Case, so any reload silently discarded the whole exam. Three ways that
 * happened, none of them rare:
 *
 *  1. A deploy. The service worker uses skipWaiting + clientsClaim, so a new
 *     worker takes over every open tab. index.tsx supplies `onNeedReload`, which
 *     DEFERS the resulting reload until the tab is hidden, so a clinician is not
 *     yanked out mid-scoring. But "reload while hidden" is precisely the case
 *     where they are not watching: they background the app, it reloads, and they
 *     return to an empty calculator with no indication anything happened.
 *  2. Tab eviction. iOS Safari discards backgrounded tabs aggressively. Switching
 *     to the EMR app and back is enough, and the deferral above does not help.
 *  3. An accidental refresh, or a browser crash.
 *
 *  (Corrected 2026-09-01: an earlier version of this comment, and the commit
 *  message of bf03b0a, claimed the deploy reload was UNGUARDED and had been
 *  wiping exams mid-code. That was wrong. The guard was added 2026-07-01, uses
 *  the documented `onNeedReload` option, and ships. The error came from grepping
 *  only src/ for the registration, which lives in index.tsx at the repo root,
 *  then reading the minified bundle rather than the source. The draft remains
 *  worth having for reasons 1-through-3 as restated above.)
 *
 * STORAGE CHOICE: sessionStorage, deliberately, not localStorage.
 * The draft holds clinical observations (last known well, BP, glucose, weight,
 * free-text pre-existing deficits). sessionStorage is origin-scoped, tab-scoped,
 * and dies when the tab closes, so a shared ward workstation does not accumulate
 * one patient's data for the next clinician to find. localStorage would persist
 * it indefinitely, which is the wrong trade for this content.
 *
 * The draft holds NO patient identifier. Initials are collected by SaveCaseModal
 * at save time and never live in calculator state, so there is nothing here that
 * names a person.
 *
 * Every read and write is wrapped: sessionStorage throws outright in some
 * privacy modes, and a storage failure must never break the calculator.
 *
 * TWO DELIBERATE OMISSIONS, both from the compliance review of 2026-09-01.
 *
 * 1. NO SAVED-CASE ID. An earlier version persisted `currentCaseId`, which
 *    created a cross-patient data-corruption path: save patient A, navigate
 *    away without tapping Reset, return for patient B, and the restore silently
 *    reapplied patient A's case id. The next Save was then an UPDATE, and it
 *    overwrote patient A's stored record with patient B's exam. Restoring a
 *    draft now always produces a DETACHED exam: saving it creates a new case
 *    rather than updating an old one. A duplicate row is visible and
 *    recoverable; overwriting the wrong patient's record is neither.
 *
 * 2. NO FREE-TEXT DEFICITS. `preExistingDeficits` is unconstrained, is
 *    dictation-enabled, and carries no identifier warning, and this app has
 *    direct precedent: a free-text "Note" field was removed in May 2026 because
 *    nothing stopped a clinician typing a full name into it. It is
 *    simultaneously the highest-risk field to store and the cheapest to lose,
 *    since re-typing a sentence is trivial next to re-scoring 15 items. It is
 *    autosaved nowhere and restored nowhere.
 */

const KEY = 'neurowiki:nihss-draft:v1';

/** Bump when the payload shape changes. A mismatched version is discarded. */
const SCHEMA_VERSION = 2;

/**
 * Drafts older than this are discarded on load.
 *
 * sessionStorage lives as long as the tab, and a ward workstation tab can stay
 * open across a whole shift. Without a ceiling, a draft can sit for hours and
 * then restore onto a completely unrelated patient. Defence in depth only: the
 * real protection against cross-patient contamination is that the draft no
 * longer carries a saved-case id (see below).
 */
const MAX_AGE_MS = 4 * 60 * 60 * 1000;

type Millis = number;

export interface NihssDraft {
  v: number;
  savedAt: Millis;
  nihssValues: Record<string, number>;
  nihssMode: 'rapid' | 'detailed';
  hasScored: boolean;
  performedAt: Millis | null;
  /** Dates flattened to epoch ms; Sets flattened to arrays. */
  patientContext: {
    lkw?: Millis | null;
    systolic: string;
    diastolic: string;
    glucose: string;
    anticoag: string[];
    lastAnticoagDose?: Millis | null;
    prestrokeMrs?: number;
    doacTiming?: string;
    doacDrug?: string;
    warfarinInr?: string;
    heparinAptt?: string;
    weightValue?: number;
    weightUnit?: 'kg' | 'lbs';
  };
  strokeTimestamps: Record<string, Millis | null>;
  disablingChecks: number[];
  confirmedNoDisabling: boolean;
}

export function saveNihssDraft(draft: Omit<NihssDraft, 'v' | 'savedAt'>): void {
  try {
    // Explicit allow-list, NOT a spread of the caller's object.
    //
    // The type already excludes preExistingDeficits and currentCaseId, but types
    // vanish at runtime: a caller spreading a wider object would serialise them
    // anyway, and the two fields this module refuses to store are the two whose
    // absence is a safety and privacy guarantee rather than a preference. Naming
    // every field here makes the guarantee real, and makes adding a new field a
    // deliberate act rather than a side effect of a spread somewhere else.
    const pc = draft.patientContext;
    const payload: NihssDraft = {
      v: SCHEMA_VERSION,
      savedAt: Date.now(),
      nihssValues: draft.nihssValues,
      nihssMode: draft.nihssMode,
      hasScored: draft.hasScored,
      performedAt: draft.performedAt,
      patientContext: {
        lkw: pc.lkw,
        systolic: pc.systolic,
        diastolic: pc.diastolic,
        glucose: pc.glucose,
        anticoag: pc.anticoag,
        lastAnticoagDose: pc.lastAnticoagDose,
        prestrokeMrs: pc.prestrokeMrs,
        doacTiming: pc.doacTiming,
        doacDrug: pc.doacDrug,
        warfarinInr: pc.warfarinInr,
        heparinAptt: pc.heparinAptt,
        weightValue: pc.weightValue,
        weightUnit: pc.weightUnit,
      },
      strokeTimestamps: draft.strokeTimestamps,
      disablingChecks: draft.disablingChecks,
      confirmedNoDisabling: draft.confirmedNoDisabling,
    };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Private mode, quota, or storage disabled. A draft is a convenience, not a
    // contract: failing to write must never surface to the clinician.
  }
}

export function loadNihssDraft(): NihssDraft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as NihssDraft;
    if (!parsed || parsed.v !== SCHEMA_VERSION) return null;
    if (typeof parsed.nihssValues !== 'object' || parsed.nihssValues === null) return null;
    if (typeof parsed.savedAt !== 'number' || Date.now() - parsed.savedAt > MAX_AGE_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function clearNihssDraft(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // as above
  }
}

/**
 * True when the draft holds anything a clinician would be upset to lose.
 *
 * Every item defaults to 0 as of 2026-09-01, so a draft always contains a full
 * set of scores and "has values" cannot mean "is worth restoring". Restoring a
 * pristine all-zero exam over a fresh page would be noise, and would suppress
 * the drawer's empty state for no reason.
 */
export function draftHasContent(d: NihssDraft): boolean {
  if (d.hasScored) return true;
  const pc = d.patientContext;
  return Boolean(
    pc.lkw !== undefined ||
      pc.systolic ||
      pc.diastolic ||
      pc.glucose ||
      (pc.anticoag && pc.anticoag.length > 0) ||
      pc.prestrokeMrs !== undefined ||
      pc.weightValue ||
      d.disablingChecks.length > 0 ||
      d.confirmedNoDisabling ||
      Object.values(d.strokeTimestamps).some((t) => t !== null),
  );
}
