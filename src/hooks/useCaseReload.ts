/**
 * useCaseReload — restore a calculator's state when navigated to with
 * `?caseId=<id>`.
 *
 * Used by every calculator that supports the "Open in calculator" action
 * from CaseDetailModal. Each calc supplies:
 *   - `payloadKey` — the key under `c.data.payload` it owns
 *   - `restore(payload)` — function that maps the saved payload back
 *      into local component state via the calc's existing setters
 *
 * The hook handles the boilerplate: read query param → fetch case →
 * call restore → set currentCaseId → clear the query param so a page
 * reload doesn't re-trigger and the URL stays clean while the clinician
 * works.
 *
 * 2026-05-19: extracted while wiring case reload for ICH, ABCD2, ASPECTS,
 * HAS-BLED, GCS, Boston, CHA2DS2-VASc, RoPE, and Heidelberg. NIHSS uses
 * its own inline restore because its payload lives outside the generic
 * `payload[<id>]` shape (it has top-level `nihss`, `patientContext`, and
 * `strokeTimestamps` keys).
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getCase } from '../lib/cases/store';
import type { GenericCasePayload } from '../lib/cases/types';

interface UseCaseReloadOpts {
  /** The payload key this calculator owns under `c.data.payload`. */
  payloadKey: string;
  /** Restore the calculator's state from the saved payload. */
  restore: (payload: GenericCasePayload) => void;
  /** Called with the resolved case id so the calc can wire update-in-place. */
  onCaseLoaded: (caseId: string) => void;
  /** Optional toast / side-effect once restore completes. */
  onSuccess?: (initials: string) => void;
}

export function useCaseReload(opts: UseCaseReloadOpts): void {
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const caseId = searchParams.get('caseId');
    if (!caseId) return;
    let cancelled = false;
    void (async () => {
      try {
        const saved = await getCase(caseId);
        if (cancelled) return;
        if (!saved) {
          clearParam();
          return;
        }
        const payload = saved.data.payload?.[opts.payloadKey];
        if (payload) {
          opts.restore(payload);
        }
        opts.onCaseLoaded(saved.id);
        opts.onSuccess?.(saved.initials);
        clearParam();
      } catch {
        // Silent on lookup failure — clinician just sees a fresh calculator.
      }
    })();
    function clearParam() {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.delete('caseId');
        return next;
      }, { replace: true });
    }
    return () => { cancelled = true; };
    // Effect fires only on caseId change (navigation in/out of a reload),
    // not on every render. Deps locked accordingly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('caseId')]);
}
