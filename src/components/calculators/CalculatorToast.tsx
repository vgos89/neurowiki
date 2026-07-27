import React from 'react';
import { createPortal } from 'react-dom';
import { LiveAnnouncer, type AnnounceTone } from '../a11y/LiveAnnouncer';

/**
 * Toast notification for calculator pages. Rendered as portal at z-[60]
 * (above drawer at z-[55]). Extracted in L5.6 Phase 2 from 9 inline
 * copies — markup was byte-identical across all calculator pages.
 *
 * Usage:
 *   const { toast, toastTone, showToast } = useDrawerState({ ... });
 *   // ... in render:
 *   <CalculatorToast message={toast} tone={toastTone} />
 *
 * Two things here are deliberate and easy to undo by accident:
 *
 * - The VISIBLE bubble stays conditional, but the announcement region does
 *   not. LiveAnnouncer is rendered unconditionally so its live regions exist
 *   from page load (see LiveAnnouncer for why). The bubble cannot be made
 *   permanent the same way: it carries background and padding, so an empty
 *   one would park a small dark pill on every calculator page forever.
 * - pointer-events-none. This element sits at `fixed bottom-24 ... z-[60]`,
 *   above the drawer, and without this a visible toast can swallow a tap
 *   meant for the control underneath it. That was a live bug for sighted
 *   users too, unrelated to screen readers (2026-07-27).
 */
export interface CalculatorToastProps {
  /** Toast message, or null to show nothing. */
  message: string | null;
  /** 'assertive' for failures the clinician must act on. Defaults to polite. */
  tone?: AnnounceTone;
}

export const CalculatorToast: React.FC<CalculatorToastProps> = ({ message, tone = 'polite' }) => {
  return (
    <>
      <LiveAnnouncer message={message} tone={tone} />
      {message
        ? createPortal(
            <div
              // aria-hidden: LiveAnnouncer already carries this text to the
              // screen reader. Without this the message is announced twice.
              aria-hidden="true"
              className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium z-[60] pointer-events-none"
            >
              {message}
            </div>,
            document.body,
          )
        : null}
    </>
  );
};

export default CalculatorToast;
