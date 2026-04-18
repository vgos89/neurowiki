import { CLAIM_REGISTRY } from './claims';

/**
 * Wrap clinical claim text with its registry ID.
 *
 * Runtime: returns text unchanged.
 * Development: warns via console.warn if claimId is not in CLAIM_REGISTRY.
 * Build-time: scripts/check-claims.ts (W5.3) verifies all claim IDs
 *   resolve and all surfaces are tagged.
 *
 * NOTE: CLAIM_REGISTRY is populated in W5.2. Until then, every
 * claim() invocation triggers a dev-mode warning (registry is
 * empty). This is expected. W5.2 backfills the registry with real
 * entries as clinical content is migrated.
 *
 * Usage:
 *   interpretation: claim("Mild impairment of consciousness", "gcs-mild-threshold")
 *
 * See CLAUDE.md §13.4 for tagging mechanism details.
 */
export function claim(text: string, claimId: string): string {
  if (
    typeof process !== 'undefined' &&
    process.env?.NODE_ENV === 'development' &&
    !CLAIM_REGISTRY[claimId]
  ) {
    console.warn(`[claim] Unregistered claim ID: ${claimId}`);
  }
  return text;
}
