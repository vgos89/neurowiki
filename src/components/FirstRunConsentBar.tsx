import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { loadGA, reportAiTrafficToGA, unloadGA, CONSENT_STORAGE_KEY } from '../utils/analytics';
import {
  DISCLAIMER_STORAGE_KEY,
  DISCLAIMER_VERSION,
  isDisclaimerAccepted,
  buildDisclaimerRecord,
  markDisclaimerAckFlag,
} from '../lib/consent';
import { useConsentRegion } from '../hooks/useConsentRegion';

/**
 * FirstRunConsentBar — non-blocking bottom bar that handles the medical
 * disclaimer acceptance and the analytics-cookie decision.
 *
 * Disclaimer acceptance is always an explicit healthcare-professional checkbox +
 * Continue (compliance-legal, 2026-06-05). Analytics is geo-gated:
 *   - strict regions (EU/EEA/UK/CH/BR, or unknown as fail-safe): opt-in only.
 *   - default-on regions (US, India, rest of world): on by default with an
 *     inline opt-out, plus the persistent footer Privacy choices control.
 * Region resolves via useConsentRegion; the analytics block waits for it so an
 * opt-in control never flashes before flipping. The two storage keys are kept
 * byte-compatible so already-decided users are never re-prompted.
 */

export const FirstRunConsentBar: React.FC = () => {
  const { region, resolved } = useConsentRegion();
  const [needsDisclaimer, setNeedsDisclaimer] = useState(false);
  const [needsAnalytics, setNeedsAnalytics] = useState(false);
  const [hcpChecked, setHcpChecked] = useState(false);
  const [analyticsOptIn, setAnalyticsOptIn] = useState(false); // strict opt-in checkbox
  const [analyticsOff, setAnalyticsOff] = useState(false); // default-on inline opt-out
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const accepted = isDisclaimerAccepted(getStorageItem(DISCLAIMER_STORAGE_KEY), DISCLAIMER_VERSION);
    const analyticsDecided = getStorageItem(CONSENT_STORAGE_KEY) !== null;
    setNeedsDisclaimer(!accepted);
    setNeedsAnalytics(!analyticsDecided);

    if (accepted) {
      markDisclaimerAckFlag();
    } else {
      import('../utils/analytics')
        .then(({ trackDisclaimerShown }) => trackDisclaimerShown())
        .catch(() => { /* best-effort */ });
    }
  }, []);

  const acceptAnalytics = () => {
    setStorageItem(CONSENT_STORAGE_KEY, 'accepted');
    loadGA();
    reportAiTrafficToGA();
  };
  const declineAnalytics = () => {
    setStorageItem(CONSENT_STORAGE_KEY, 'declined');
    unloadGA();
  };

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
    if (needsAnalytics && resolved) {
      if (region === 'default-on') {
        // GA is already on by default; persist 'accepted' so the notice stops,
        // unless the user turned it off inline (already 'declined').
        if (!analyticsOff) acceptAnalytics();
      } else if (region === 'strict') {
        analyticsOptIn ? acceptAnalytics() : declineAnalytics();
      }
      // unknown region → leave undecided (off, fail-safe); footer can opt in.
    }
    setDismissed(true);
  };

  const handleTurnOff = () => {
    declineAnalytics();
    setAnalyticsOff(true);
  };

  const handleAnalyticsOnly = (accept: boolean) => {
    accept ? acceptAnalytics() : declineAnalytics();
    setDismissed(true);
  };

  if (dismissed) return null;
  if (!needsDisclaimer && !needsAnalytics) return null;
  // Analytics-only bar must wait for the region so it shows the right variant.
  if (!needsDisclaimer && !resolved) return null;

  const wrap =
    'fixed bottom-0 left-0 right-0 z-[60] bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] px-4 py-3 sm:px-6 safe-area-pb';

  // ---- Analytics-only bar (disclaimer already accepted) --------------------
  if (!needsDisclaimer) {
    if (region === 'default-on') {
      return (
        <div className={wrap} role="region" aria-label="Cookie notice">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <p className="flex-1 text-sm text-slate-600">
              NeuroWiki uses anonymous analytics to understand how clinicians use the tool. No patient
              identifiers are collected.{' '}
              <Link to="/privacy" className="text-neuro-600 underline underline-offset-2">Privacy Policy</Link>
            </p>
            <div className="flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => handleAnalyticsOnly(false)}
                className="min-h-[44px] px-4 py-1.5 text-sm text-slate-600 border border-slate-300 rounded-md hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Analytics off
              </button>
              <button
                type="button"
                onClick={() => handleAnalyticsOnly(true)}
                className="min-h-[44px] px-4 py-1.5 text-sm text-white bg-neuro-600 rounded-md hover:bg-neuro-700 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      );
    }
    // strict / unknown → opt-in
    return (
      <div className={wrap} role="region" aria-label="Cookie consent">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <p className="flex-1 text-sm text-slate-600">
            NeuroWiki can use anonymous analytics to understand how clinicians use the tool and improve it.{' '}
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

  // ---- Full first-run bar (disclaimer acceptance required) -----------------
  return (
    <div className={wrap} role="region" aria-label="Terms and cookie consent">
      <div className="max-w-3xl mx-auto">
        <p className="text-[13px] text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-800">NeuroWiki is a clinical reference.</span> It does
          not substitute for your clinical judgment, current guidelines, or your institution's protocol.
          Verify before acting. <span className="font-semibold text-slate-700">Do not enter patient names,
          MRNs, or dates of birth.</span>{' '}
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

        {needsAnalytics && resolved && region !== 'default-on' && (
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

        {needsAnalytics && resolved && region === 'default-on' && (
          <p className="mt-2 text-[12px] text-slate-500 leading-snug">
            {analyticsOff ? (
              'Analytics off. You can turn it back on under Privacy choices in the footer.'
            ) : (
              <>
                NeuroWiki uses anonymous analytics to improve the tool. No patient identifiers are
                collected.{' '}
                <button
                  type="button"
                  onClick={handleTurnOff}
                  className="text-neuro-600 underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none rounded"
                >
                  Turn off
                </button>
              </>
            )}
          </p>
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
