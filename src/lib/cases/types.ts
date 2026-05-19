/**
 * SavedCase — local-only patient case structure used by `/my-cases`.
 *
 * Designed for cross-calculator reuse: the `data` field is a discriminated
 * snapshot keyed by source.id so future calculators can save without changing
 * the type. The shape is also designed to survive cross-device transfer via
 * the Supabase relay — `schemaVersion` is the upgrade guard.
 *
 * Privacy guardrails (V direction 2026-05-19):
 *   - `initials` is the only identifier ever stored
 *   - Validated 2-4 uppercase letters at input (regex enforced on save)
 *   - The save UI explicitly tells the clinician "Initials only — never
 *     write the full name"
 *   - No DOB, no MRN, no full name, no SSN, no contact info
 *   - All storage is on-device (IndexedDB); never sent to a server unless
 *     the clinician explicitly initiates a transfer (which is encrypted
 *     client-side with a PIN)
 */

export interface SavedCase {
  /** UUID, generated locally on save. */
  id: string;
  /** Unix ms. */
  createdAt: number;
  /** Unix ms — bumps on edit. */
  updatedAt: number;
  /** 2-4 uppercase letters. The ONLY identifier. */
  initials: string;
  /** Optional short note from the clinician. Max ~120 chars. */
  note?: string;

  /** Where this case was saved from. */
  source: {
    type: 'calculator' | 'pathway';
    /** Stable id, e.g., 'nihss', 'stroke-code'. */
    id: string;
    /** Human label shown in the case list. */
    title: string;
  };

  /** Snapshot of the data needed to reconstruct or display the case.
   *  Keyed by source.id so a 'nihss' case has nihss-specific data,
   *  a 'stroke-code' case has stroke-code-specific data, etc. */
  data: SavedCaseData;

  /** Schema version. Bump when SavedCaseData shape changes. */
  schemaVersion: number;
}

/** Calculator-specific data captured at save time. */
export interface SavedCaseData {
  /** NIHSS calculator data. */
  nihss?: {
    score: number;
    values: Record<string, number>;
    mode: 'rapid' | 'detailed';
    severity: string;
    /** When the NIHSS exam was performed (auto-captured first-input time). */
    performedAt?: number;
  };

  /** Patient context (shared between NIHSS and Stroke Code per Q2 in 2026-05-19 design discussion). */
  patientContext?: {
    /** Unix ms; null = "Unknown / wake-up". */
    lkw?: number | null;
    systolic?: string;
    diastolic?: string;
    glucose?: string;
    /** Serialized as array because Set isn't JSON-friendly. */
    anticoag?: string[];
  };
}

export const SAVED_CASE_SCHEMA_VERSION = 1;

/** Initials validation. */
export const INITIALS_REGEX = /^[A-Z]{2,4}$/;

export function isValidInitials(s: string): boolean {
  return INITIALS_REGEX.test(s);
}
