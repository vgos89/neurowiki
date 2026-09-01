/**
 * A pathway's current determination, surfaced to a HOST surface (currently the
 * NIHSS calculator) so the clinician can see where a pathway landed without
 * reopening it.
 *
 * Deliberately separate from `ExtendedIVTPathway`'s `IVTResult`, which reports
 * ONLY eligible outcomes and sends null otherwise. Stroke Code depends on that
 * behaviour, and a host that wants to display "Not Eligible" needs the opposite.
 * Rather than widen the existing contract and change Stroke Code's Step 3
 * summary, pathways expose this as an additional, opt-in channel.
 *
 * V direction 2026-09-01: this is for on-screen REFERENCE only. It must never
 * reach the NIHSS copy/share template, which documents the clinician's own NIHSS
 * exam and patient context, not a pathway's conclusion. Enforced by
 * src/__tests__/nihssExportGuards.test.ts.
 */
export interface PathwayVerdict {
  /** Short verdict label, e.g. "Eligible", "Not Eligible", "EVT Preferred". */
  status: string;
  /** One-line rationale shown beneath the status. */
  reason: string;
  eligible: boolean;
  variant?: 'success' | 'warning' | 'danger' | 'neutral';
}
