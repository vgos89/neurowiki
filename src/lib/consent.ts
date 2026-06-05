/**
 * Consent state — shared, React-free logic for the first-run consent bar.
 *
 * Two independent, separately-stored decisions (GDPR requires them UNBUNDLED):
 *   1. Medical / professional-use disclaimer acceptance → versioned JSON record
 *      under `neurowiki-disclaimer-accepted`. Bumping DISCLAIMER_VERSION forces
 *      re-acceptance (per the compliance-legal HIPAA review, 2026-05-19).
 *   2. Analytics-cookie consent → `neurowiki-analytics-consent`
 *      (analytics.ts CONSENT_STORAGE_KEY). Declining analytics must NEVER block
 *      disclaimer acceptance / site use.
 *
 * The onboarding tour gates on a simple `neurowiki:disclaimer:v1` flag plus a
 * `neurowiki:disclaimer-accepted` event (markDisclaimerAckFlag) — preserved from
 * the old DisclaimerModal so the tour still launches the instant Continue is
 * tapped (no reload).
 *
 * This module is intentionally free of React/DOM-render imports so the pure
 * helpers (isDisclaimerAccepted, installApplies) are unit-testable in the
 * node test environment.
 */

export const DISCLAIMER_STORAGE_KEY = 'neurowiki-disclaimer-accepted';

// Bumped 2.0 → 3.0 per compliance-legal HIPAA review (2026-05-19): the PHI
// language was revised to "no name, MRN, or DOB" plus an honest acknowledgment
// that Save Case data may constitute PHI under the clinician's hospital policy.
// Bump on any MATERIAL change to the PHI disclosure, the liability clause, or
// the healthcare-professional affirmation — that forces re-acceptance. Wording
// clarifications that do not change scope do NOT require a bump.
export const DISCLAIMER_VERSION = '3.0';

// Simple flag + event the onboarding tour reads. Distinct from the JSON record.
export const DISCLAIMER_FLAG_KEY = 'neurowiki:disclaimer:v1';
export const DISCLAIMER_ACCEPTED_EVENT = 'neurowiki:disclaimer-accepted';

// Onboarding tour completion + the dedicated install pop-up that fires AFTER it
// (so the two first-run modals never stack). The overlay shown-once key is v3 —
// bumped from the deleted overlay's v2 so every user gets one shot at the new,
// correctly-sequenced pop-up.
export const TOUR_COMPLETE_KEY = 'neurowiki:tour-complete:v1';
export const TOUR_COMPLETE_EVENT = 'neurowiki:tour-complete';
export const INSTALL_OVERLAY_SHOWN_KEY = 'neurowiki:install-overlay:v3';

export interface StoredDisclaimer {
  version: string;
  acceptedAt: string;
  userAgent: string;
}

/**
 * Pure: has the user accepted the CURRENT disclaimer version? A missing record,
 * a malformed record, or a stale version all return false — which re-surfaces
 * the consent bar's disclaimer gate. This is the no-re-prompt guarantee: an
 * existing current-version record returns true with zero migration.
 */
export function isDisclaimerAccepted(
  raw: string | null,
  version: string = DISCLAIMER_VERSION,
): boolean {
  if (!raw) return false;
  try {
    const data = JSON.parse(raw) as Partial<StoredDisclaimer>;
    return data.version === version;
  } catch {
    return false;
  }
}

/**
 * Pure: does the install tour-slide / bubble apply for this PWA status? Desktop
 * ('unsupported') and 'already-installed' get no install affordance.
 */
export function installApplies(status: string): boolean {
  return (
    status === 'installable' ||
    status === 'ios-manual' ||
    status === 'ios-other-browser'
  );
}

/**
 * Build the JSON acceptance record. Pure given the two inputs (caller supplies
 * the timestamp + UA so this stays testable and side-effect-free).
 */
export function buildDisclaimerRecord(acceptedAt: string, userAgent: string): StoredDisclaimer {
  return { version: DISCLAIMER_VERSION, acceptedAt, userAgent };
}

/**
 * Mirror disclaimer acceptance into the simple flag the onboarding tour reads,
 * and notify listeners so the tour launches immediately (no reload). Idempotent
 * — a no-op if the flag is already set, so it is safe to call on every mount as
 * a backfill for users who accepted before the flag existed.
 */
export function markDisclaimerAckFlag(): void {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(DISCLAIMER_FLAG_KEY) === '1') return;
  window.localStorage.setItem(DISCLAIMER_FLAG_KEY, '1');
  window.dispatchEvent(new Event(DISCLAIMER_ACCEPTED_EVENT));
}
