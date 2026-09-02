/**
 * Crash-and-reload survival for an in-progress NIHSS exam.
 *
 * WHY THIS EXISTS
 * ---------------
 * Nothing in the calculator was persisted until the clinician explicitly hit
 * Save Case, so any reload silently discarded the whole exam. Three ways that
 * happened, none of them rare:
 *
 *  1. A deploy. The service worker registers with skipWaiting + clientsClaim and
 *     calls window.location.reload() the moment a new worker activates, in every
 *     open tab. Nine deploys shipped on 2026-09-01 alone. A clinician scoring a
 *     patient during any of them lost the exam mid-code, with no prompt.
 *  2. Tab eviction. iOS Safari discards backgrounded tabs aggressively. Switching
 *     to the EMR app and back is enough.
 *  3. An accidental refresh, or a browser crash.
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
 */

const KEY = 'neurowiki:nihss-draft:v1';

/** Bump when the payload shape changes. A mismatched version is discarded. */
const SCHEMA_VERSION = 1;

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
    preExistingDeficits: string;
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
  currentCaseId: string | null;
}

export function saveNihssDraft(draft: Omit<NihssDraft, 'v' | 'savedAt'>): void {
  try {
    const payload: NihssDraft = { ...draft, v: SCHEMA_VERSION, savedAt: Date.now() };
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
      pc.preExistingDeficits ||
      pc.weightValue ||
      d.disablingChecks.length > 0 ||
      d.confirmedNoDisabling ||
      Object.values(d.strokeTimestamps).some((t) => t !== null),
  );
}
