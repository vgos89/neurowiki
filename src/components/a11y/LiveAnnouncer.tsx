import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * LiveAnnouncer — screen-reader announcement channel for transient messages.
 *
 * Built 2026-07-27 after an accessibility review of the clipboard sweep found
 * that every copy-feedback surface announced unreliably or not at all.
 *
 * Three rules are load-bearing here. Breaking any one of them silently returns
 * us to "the clinician hears nothing":
 *
 * 1. BOTH regions are mounted for the lifetime of the page, empty when idle.
 *    Screen readers, iOS VoiceOver in particular, reliably notice text changing
 *    INSIDE a region that already exists, but frequently miss a region that is
 *    inserted into the accessibility tree and populated in the same commit.
 *    This is WCAG 2.1 SC 4.1.3, and the repo already learned it once: see the
 *    "a11y A-01" note in PathwayCascadeNotice.tsx. Never render these
 *    conditionally.
 *
 * 2. Polite and assertive are SEPARATE nodes rather than one node whose role
 *    is swapped. Some AT caches an element's role at first computation and does
 *    not recompute it, so a node that flips status -> alert can keep announcing
 *    politely (or stop announcing). Two nodes costs nothing and cannot regress.
 *
 * 3. Repeating the identical message clears the region first, then sets the
 *    text on a later tick. Writing the same string produces no DOM mutation and
 *    therefore no announcement, which bites exactly when a clinician taps Copy a
 *    second time because the first attempt seemed to do nothing.
 *
 * Visual presentation is NOT this component's job. Callers keep rendering their
 * own toast/label however they like; this only carries the text to the screen
 * reader. Keeping the two concerns apart is deliberate: the visible toast has
 * chrome (background, padding) that would show as an empty pill if it were
 * mounted permanently.
 */

export type AnnounceTone = 'polite' | 'assertive';

export interface LiveAnnouncerProps {
  /** Text to announce, or null when there is nothing to say. */
  message: string | null;
  /**
   * 'assertive' interrupts whatever the screen reader is currently saying.
   * Reserve it for failures the clinician has to act on (a copy that did not
   * reach the clipboard). Confirmations should stay 'polite'.
   */
  tone?: AnnounceTone;
}

/** Delay before re-setting an identical message. One frame is not always enough. */
const REPEAT_REANNOUNCE_MS = 60;

export const LiveAnnouncer: React.FC<LiveAnnouncerProps> = ({ message, tone = 'polite' }) => {
  const [rendered, setRendered] = useState('');
  // Last non-empty message, so a repeat can be detected after the caller has
  // already cleared back to null.
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    const next = message ?? '';

    if (!next) {
      setRendered('');
      return;
    }

    if (next === lastRef.current) {
      setRendered('');
      const id = window.setTimeout(() => setRendered(next), REPEAT_REANNOUNCE_MS);
      return () => window.clearTimeout(id);
    }

    lastRef.current = next;
    setRendered(next);
  }, [message]);

  // Prerender runs in a real browser, but guard anyway so this can never be the
  // thing that breaks a build.
  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {tone === 'polite' ? rendered : ''}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {tone === 'assertive' ? rendered : ''}
      </div>
    </>,
    document.body,
  );
};

export default LiveAnnouncer;
