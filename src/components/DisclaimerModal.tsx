import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Smartphone, Download, Compass } from 'lucide-react';
import { getStorageItem, setStorageItem } from '../utils/storage';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { IosInstallSheet } from './IosInstallSheet';

const DISCLAIMER_STORAGE_KEY = 'neurowiki-disclaimer-accepted';
const DISCLAIMER_VERSION = '3.0'; // Bumped from 2.0 to force re-acceptance per compliance-legal HIPAA review (2026-05-19): the "no identifiable patient data" claim was revised to "no name, MRN, or DOB" + an honest acknowledgement that clinical context stored via Save Case may constitute PHI under the clinician's hospital's HIPAA policy.

// The JSON acceptance record above lives under DISCLAIMER_STORAGE_KEY. The
// install overlay (InstallPromptOverlay) and onboarding tour (OnboardingTour)
// instead gate on this simple '1' flag. We write it on accept AND backfill it
// on mount for users who accepted before the flag existed — without it, those
// first-run surfaces silently never appear. The event lets them surface
// immediately, without waiting for a reload.
const DISCLAIMER_ACK_FLAG_KEY = 'neurowiki:disclaimer:v1';
const DISCLAIMER_ACCEPTED_EVENT = 'neurowiki:disclaimer-accepted';

/** Mirror disclaimer acceptance into the first-run flag + notify listeners. */
function markDisclaimerAckFlag(): void {
  if (typeof window === 'undefined') return;
  if (window.localStorage.getItem(DISCLAIMER_ACK_FLAG_KEY) === '1') return;
  window.localStorage.setItem(DISCLAIMER_ACK_FLAG_KEY, '1');
  window.dispatchEvent(new Event(DISCLAIMER_ACCEPTED_EVENT));
}

interface StoredDisclaimer {
  version: string;
  acceptedAt: string;
  userAgent: string;
}

export const DisclaimerModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [canAccept, setCanAccept] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // PWA install — surfaced inside the disclaimer modal so first-time
  // visitors are nudged to add the app immediately after they accept terms.
  const { status, promptInstall, openInSafari, copyAppLink } = usePwaInstall();
  const [copiedLink, setCopiedLink] = useState(false);
  const canShowInstall =
    status === 'installable' || status === 'ios-manual' || status === 'ios-other-browser';

  const handleAddApp = async () => {
    if (status === 'ios-other-browser') {
      openInSafari();
      return;
    }
    if (status === 'ios-manual') {
      setShowIosSheet(true);
      return;
    }
    if (status === 'installable') {
      await promptInstall();
    }
  };

  const handleCopyLink = async () => {
    const ok = await copyAppLink();
    if (ok) {
      setCopiedLink(true);
      window.setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Check if already accepted
  useEffect(() => {
    const stored = getStorageItem(DISCLAIMER_STORAGE_KEY);
    if (stored) {
      try {
        const data: StoredDisclaimer = JSON.parse(stored);
        if (data.version === DISCLAIMER_VERSION) {
          setIsOpen(false);
          // Backfill the first-run flag for users who accepted before it
          // existed, so the install overlay + onboarding tour can light up.
          markDisclaimerAckFlag();
          return;
        }
      } catch {
        // Invalid data, show modal
      }
    }
    setIsOpen(true);
    import('../utils/analytics').then(({ trackDisclaimerShown }) => {
      trackDisclaimerShown();
    }).catch(() => { /* best-effort */ });
  }, []);

  useEffect(() => {
    setCanAccept(hasScrolledToBottom && checkboxChecked);
  }, [hasScrolledToBottom, checkboxChecked]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 20;
    if (scrolledToBottom && !hasScrolledToBottom) {
      setHasScrolledToBottom(true);
    }
  }, [hasScrolledToBottom]);

  // If content fits without scrolling, treat as already scrolled (no forced scroll on short viewport)
  useEffect(() => {
    if (!isOpen) return;
    const container = scrollContainerRef.current;
    if (!container) return;
    if (container.scrollHeight <= container.clientHeight + 4) {
      setHasScrolledToBottom(true);
    }
  }, [isOpen]);

  // Focus trap — mandatory modal, no Escape dismiss
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;
    const modal = modalRef.current;
    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(modal.querySelectorAll<HTMLElement>(focusableSelector));

    scrollContainerRef.current?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const els = getFocusable();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleAccept = () => {
    if (!canAccept) return;
    const data: StoredDisclaimer = {
      version: DISCLAIMER_VERSION,
      acceptedAt: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };
    setStorageItem(DISCLAIMER_STORAGE_KEY, JSON.stringify(data));
    // Light up the first-run install overlay + onboarding tour immediately.
    markDisclaimerAckFlag();
    // Fire GA4 compliance event. Lazy-import keeps modal bundle small.
    import('../utils/analytics').then(({ trackDisclaimerAcknowledged }) => {
      trackDisclaimerAcknowledged();
    }).catch(() => { /* best-effort */ });
    setIsOpen(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disclaimer-modal-title"
        aria-describedby="disclaimer-modal-body"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100"
      >
        {/* Header — brand-lockup + title */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <img
              src="/icon-192.png"
              alt=""
              width={36}
              height={36}
              className="w-9 h-9 rounded-lg flex-shrink-0"
            />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-0.5">For Clinicians</p>
              <h2 id="disclaimer-modal-title" className="text-[17px] font-semibold text-slate-900 leading-tight">
                Welcome to NeuroWiki
              </h2>
            </div>
          </div>
        </div>

        {/* Scrollable content — plain-language version */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          tabIndex={0}
          aria-label="Disclaimer content"
          id="disclaimer-modal-body"
          className="px-6 py-5 max-h-72 overflow-y-auto text-[14px] text-slate-700 leading-relaxed focus:outline-none focus:bg-slate-50/30"
        >
          <p className="mb-4 text-slate-900 font-medium">
            NeuroWiki is a bedside reference for neurology clinicians. It is not a substitute for your clinical training, the patient in front of you, or current guidelines.
          </p>

          <div className="space-y-4">
            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">What this tool is</p>
              <p className="text-[13.5px]">
                Calculators, pathways, and trial summaries based on published guidelines and primary literature. Every clinical claim is cited.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">What it is not</p>
              <p className="text-[13.5px]">
                Not a diagnostic tool. Not for patient self-use. Not a replacement for guideline review or institutional protocol. Verify thresholds and dosing against current sources before acting at the bedside.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Currency</p>
              <p className="text-[13.5px]">
                Guidelines change. Content here reflects the cited publication date. Check AHA/ASA, AAN, and your institutional references for the most recent updates.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Emergencies</p>
              <p className="text-[13.5px]">
                In a medical emergency, call your local emergency services. Do not use this site for time-critical decisions without verifying against current guidelines and your team.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Liability</p>
              <p className="text-[13.5px]">
                The NeuroWiki team is not liable for clinical decisions made using this content. Decisions remain the responsibility of the treating clinician.
              </p>
            </div>

            <div>
              <p className="text-[13px] font-semibold text-slate-900 mb-1">Patient data</p>
              <p className="text-[13.5px]">
                Calculator inputs run locally in your browser. NeuroWiki does not collect names, MRNs, or dates of birth. The Save Case feature stores patient initials plus the clinical context you enter (scores, vitals, timestamps) on this device only — that combination may constitute PHI under your hospital's HIPAA policy, and you remain responsible for using the tool in a way consistent with your institution's rules. See the privacy policy for the full data inventory.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll cue (only if content overflows + not yet scrolled) */}
        {!hasScrolledToBottom && (
          <div className="px-6 py-2.5 bg-neuro-50 border-t border-neuro-100 flex items-center justify-center gap-2">
            <svg className="w-3.5 h-3.5 text-neuro-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
            <span className="text-xs text-neuro-700 font-medium">Scroll to continue</span>
          </div>
        )}

        {/* Footer */}
        <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
          <label className={`flex items-start gap-3 mb-4 cursor-pointer ${!hasScrolledToBottom ? 'opacity-50 pointer-events-none' : ''}`}>
            <input
              type="checkbox"
              checked={checkboxChecked}
              onChange={(e) => setCheckboxChecked(e.target.checked)}
              disabled={!hasScrolledToBottom}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 text-neuro-500 focus:ring-neuro-500 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[13.5px] text-slate-700 leading-relaxed">
              I am a healthcare professional and I have read and agree to the terms above.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!canAccept}
            className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
              canAccept
                ? 'bg-neuro-500 text-white hover:bg-neuro-600 active:bg-neuro-700'
                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
            }`}
          >
            {!hasScrolledToBottom ? 'Scroll to read the terms'
              : !checkboxChecked ? 'Check the box to continue'
              : 'Accept and continue'}
          </button>

          {/* Add-to-phone option — only shown when the device can install
              (Android Chrome with the prompt captured, or iOS Safari which
              gets the manual instructions sheet). Already-installed users
              don't see this row. */}
          {canShowInstall && (
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-neuro-50 border border-neuro-100 flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-neuro-600" aria-hidden />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  Add NeuroWiki app to your phone
                </p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                  {status === 'ios-other-browser'
                    ? 'Add to Home Screen works in Safari on iPhone. Open it there to install.'
                    : 'Open it instantly from your home screen, even offline.'}
                </p>
                {status === 'ios-other-browser' ? (
                  <>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddApp}
                        className="min-h-[36px] px-3 py-1.5 rounded-full bg-neuro-500 hover:bg-neuro-600 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        <Compass className="w-3 h-3" aria-hidden />
                        Open in Safari
                      </button>
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="min-h-[36px] px-3 py-1.5 rounded-full bg-white border border-neuro-300 hover:bg-neuro-50 text-neuro-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                      >
                        {copiedLink ? 'Link copied' : 'Copy link'}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-snug">
                      Then in Safari tap Share &rarr; Add to Home Screen.
                    </p>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddApp}
                    className="mt-2 min-h-[36px] px-3 py-1.5 rounded-full bg-white border border-neuro-300 hover:bg-neuro-50 text-neuro-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                  >
                    <Download className="w-3 h-3" aria-hidden />
                    Add app
                  </button>
                )}
              </div>
            </div>
          )}

        </div>
      </div>

      <IosInstallSheet isOpen={showIosSheet} onClose={() => setShowIosSheet(false)} />
    </div>
  );
};

export default DisclaimerModal;
