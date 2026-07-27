import { useState, useCallback } from 'react';
import type { AnnounceTone } from '../components/a11y/LiveAnnouncer';

/**
 * Drawer state hook for calculator pages. Extracted in L5.6 Phase 2.
 * See ADR-008 trade-off #3.
 *
 * Two state modes:
 *   - 'binary': State A (not-interacted) / State C (interacted). Used by
 *     calculators where any input is a meaningful result (ASPECTS deduct
 *     baseline 10, HAS-BLED running score, RoPE preselected age, Boston
 *     defaults) or where a single required slot gates completion (Heidelberg).
 *   - 'partial-complete': State A (0 items) / State B (some items)
 *     / State C (all items). Used by NIHSS, ABCD², ICH, GCS, Heidelberg.
 *
 * Note on Heidelberg: uses 'binary' with hasInteracted = isComplete because
 * it has a single required slot. No State B exists for Heidelberg.
 */

export type DrawerStateInput =
  | { mode: 'binary'; hasInteracted: boolean }
  | { mode: 'partial-complete'; selectedCount: number; totalRequired: number };

export type DrawerStateValue = 'A' | 'B' | 'C';

export interface UseDrawerStateReturn {
  /** Computed state. 'A' = empty, 'B' = partial (partial-complete only), 'C' = complete. */
  state: DrawerStateValue;
  /** Whether the user has expanded the drawer. */
  drawerOpen: boolean;
  setDrawerOpen: (next: boolean | ((prev: boolean) => boolean)) => void;
  /** Resets drawerOpen to false. Caller is responsible for resetting their own input state. */
  reset: () => void;
  /** Current toast message, or null. */
  toast: string | null;
  /** Screen-reader urgency for the current toast. Pass to CalculatorToast. */
  toastTone: AnnounceTone;
  /**
   * Show a toast message. Auto-dismisses after durationMs (default 2000).
   * Pass tone 'assertive' for failures the clinician has to act on, so the
   * screen reader interrupts rather than waiting for a pause.
   */
  showToast: (message: string, durationMs?: number, tone?: AnnounceTone) => void;
  /** Dismiss the current toast immediately. */
  dismissToast: () => void;
}

export function useDrawerState(input: DrawerStateInput): UseDrawerStateReturn {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [toastTone, setToastTone] = useState<AnnounceTone>('polite');

  let state: DrawerStateValue;
  if (input.mode === 'binary') {
    state = input.hasInteracted ? 'C' : 'A';
  } else {
    if (input.selectedCount === 0) state = 'A';
    else if (input.selectedCount < input.totalRequired) state = 'B';
    else state = 'C';
  }

  const reset = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const showToast = useCallback(
    (message: string, durationMs = 2000, tone: AnnounceTone = 'polite') => {
      setToast(message);
      setToastTone(tone);
      setTimeout(() => setToast((current) => (current === message ? null : current)), durationMs);
    },
    [],
  );

  const dismissToast = useCallback(() => setToast(null), []);

  return { state, drawerOpen, setDrawerOpen, reset, toast, toastTone, showToast, dismissToast };
}
