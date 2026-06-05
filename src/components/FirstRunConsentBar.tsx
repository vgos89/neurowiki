import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { loadGA, reportAiTrafficToGA, CONSENT_STORAGE_KEY } from '../utils/analytics';
import {
  DISCLAIMER_STORAGE_KEY,
  DISCLAIMER_VERSION,
  isDisclaimerAccepted,
  buildDisclaimerRecord,
  markDisclaimerAckFlag,
} from '../lib/consent';

/**
 * FirstRunConsentBar — non-blocking bottom bar that replaces the old blocking
 * DisclaimerModal AND the CookieConsentBanner. A first-time clinician can see
 * and use the site immediately; the bar sits at the bottom until resolved.
 *
 * Compliance contract (compliance-legal review 2026-06-05, approve-with-conditions):
 *  - Disclaimer acceptance stays EXPLICIT: required healthcare-professional
 *    checkbox + a Continue button disabled until it is checked. Not implied.
 *  - Analytics consent is UNBUNDLED (GDPR): a separate, pre-unchecked optional
 *    checkbox. Leaving it unchecked = declined; it never blocks Continue.
 *  - Two existing storage keys preserved byte-for-byte so already-accepted users
 *    are never re-prompted (no migration): the versioned JSON record under
 *    `neurowiki-disclaimer-accepted` and `neurowiki-analytics-consent`.
 *  - GA loads only when analytics consent is 'accepted'.
 *  - Required on-surface copy: not-medical-advice statement + "no names/MRN/DOB"
 *    + the HCP affirmation with Terms/disclaimer links. Full disclosure behind
 *    the linked Terms + Privacy pages.
 *  - Accessibility: role="region" (not dialog — non-blocking, no focus trap),
 *    no focus steal on mount, native <label>-wrapped checkboxes, disabled +
 *    aria-disabled Continue button.
 *  - Version bump (DISCLAIMER_VERSION) re-surfaces the disclaimer gate.
 */

export const FirstRunConsentBar: React.FC = () => {
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const [needsAnalytics, setNeedsAnalytics] = useState(false);
  const [hcpChecked, setHcpChecked] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false);
  const [resolved, setResolved] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const accepted = isDisclaimerAccepted(getStorageItem(DISCLAIMER_STORAGE_KEY), DISCLAIMER_VERSION);
    const analyticsDecided = getStorageItem(CONSENT_STORAGE_KEY) !== null;
    setNeedsDisclaimer(!accepted);
    setNeedsAnalytics(!analyticsDecided);

    if (accepted) {
      // Backfill the tour flag for users who accepted before it existed.
      markDisclaimerAckFlag();
    } else {
      // Best-effort funnel event. No-op unless analytics was already accepted
      // in a prior session (loadGA is gated on consent in App.tsx).
      import('../utils/analytics')
        .then(({ trackDisclaimerShown }) => trackDisclaimerShown())
        .catch(() => { /* best-effort */ });
    }
  }, []);

  if (resolved || (!needsDisclaimer && !needsAnalytics)) return null;

  const acceptAnalytics = () => {
    setStorageItem(CONSENT_STORAGE_KEY, 'accepted');
    loadGA();
    reportAiTrafficToGA();
  };
  const declineAnalytics = () => setStorageItem(CONSENT_STORAGE_KEY, 'declined');

  const acceptDisclaimer = () => {
    const record = buildDisclaimerRecord(new Date().toISOString(), navigator.userAgent);
    setStorageItem(DISCLAIMER_STORAGE_KEY, JSON.stringify(record));
    markDisclaimerAckFlag();
    import('../utils/analytics')
      .then(({ trackDisclaimerAcknowledged }) => trackDisclaimerAcknowledged())
      .catch(() => { /* best-effort */ });
  };

  const handleContinue = () => {
    if (!hcpChecked) return;
    acceptDisclaimer();
    if (needsAnalytics) {
      analyticsOptIn ? acceptAnalytics() : declineAnalytics();
    }
    setResolved(true);
  };

  const handleAnalyticsOnly = (accept: boolean) => {
    accept ? acceptAnalytics() : declineAnalytics();
    setResolved(true);
  };

  const wrap =
    'fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-4 py-3 sm:px-6 safe-area-pb';

  // Analytics-only bar — disclaimer already accepted (current version), only the
  // cookie decision is outstanding (e.g. user accepted disclaimer pre-analytics).
  if (!needsDisclaimer) {
    return (
      <div className={wrap} role="region" aria-label="Cookie consent">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="flex-1 text-sm text-slate-600">
            We use anonymous analytics cookies to understand how clinicians use NeuroWiki and improve the tool.{' '}
            <Link to="/privacy" className="text-neuro-600 underline underline-offset-2">Privacy Policy</Link>
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={() => handleAnalyticsOnly(false)}
              className="min-h-[44px] px-4 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => handleAnalyticsOnly(true)}
              className="min-h-[44px] px-4 py-1.5 text-sm text-white bg-neuro-600 rounded-md hover:bg-neuro-700 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Accept
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Full first-run bar — disclaimer acceptance (required) + optional analytics.
  return (
    <div className={wrap} role="region" aria-label="Terms and cookie consent">
      <div className="max-w-3xl mx-auto">
        <p className="text-[13px] text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">NeuroWiki is a clinical reference</span> — not a
          substitute for your clinical judgment, current guidelines, or your institution's protocol.
          Verify before acting. <span className="font-semibold text-slate-700">Do not enter patient
          names, MRNs, or dates of birth.</span>{' '}
          <Link to="/privacy" className="text-neuro-600 underline underline-offset-2">Privacy Policy</Link>
        </p>

        <label className="mt-3 flex items-start gap-2.5 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={hcpChecked}
            onChange={(e) => setHcpChecked(e.target.checked)}
            aria-required="true"
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-neuro-500 focus:ring-neuro-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
          />
          <span id="firstrun-hcp-affirmation" className="text-[13px] text-slate-700 leading-snug">
            I am a healthcare professional and I have read and agree to the{' '}
            <Link to="/terms" className="text-neuro-600 underline underline-offset-2">Terms of Use</Link>{' '}
            and{' '}
            <Link to="/terms" className="text-neuro-600 underline underline-offset-2">disclaimer</Link>.
          </span>
        </label>

        {needsAnalytics && (
          <label className="mt-2 flex items-start gap-2.5 cursor-pointer min-h-[44px]">
            <input
              type="checkbox"
              checked={analyticsOptIn}
              onChange={(e) => setAnalyticsOptIn(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-neuro-500 focus:ring-neuro-500 focus:ring-offset-0 cursor-pointer flex-shrink-0"
            />
            <span className="text-[13px] text-slate-500 leading-snug">
              Help improve NeuroWiki with anonymous analytics cookies. <span className="text-slate-500">(optional)</span>
            </span>
          </label>
        )}

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!hcpChecked}
            aria-disabled={!hcpChecked}
            aria-describedby="firstrun-hcp-affirmation"
            className={`min-h-[44px] px-6 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none ${
              hcpChecked
                ? 'bg-neuro-500 text-white hover:bg-neuro-600 active:bg-neuro-700'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {hcpChecked ? 'Continue' : 'Check the box to continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FirstRunConsentBar;
