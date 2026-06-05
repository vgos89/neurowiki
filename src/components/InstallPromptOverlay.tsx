import React, { useEffect, useRef, useState } from 'react';
import { X, Smartphone, Zap, Download, Bookmark } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { InstallActions } from './InstallActions';
import {
  installApplies,
  DISCLAIMER_FLAG_KEY,
  DISCLAIMER_ACCEPTED_EVENT,
  TOUR_COMPLETE_KEY,
  TOUR_COMPLETE_EVENT,
  INSTALL_OVERLAY_SHOWN_KEY,
} from '../lib/consent';

/**
 * InstallPromptOverlay — a single flashy "add to your phone" pop-up that fires
 * ONCE, AFTER the onboarding tour finishes or is skipped (TOUR_COMPLETE_EVENT),
 * on installable devices only. Sequenced after the tour so the two first-run
 * modals never stack — the prior version fired before the tour and collided,
 * which is the bug this placement fixes.
 *
 * Eligibility: disclaimer accepted (flag) + tour complete + install applies
 * (status installable / ios-manual / ios-other-browser) + not already shown.
 * Already-installed and desktop ('unsupported') never qualify. The action
 * buttons come from the shared InstallActions component (variant="tour" renders
 * inline iOS steps, correct for this high z-index surface). The InstallBubble
 * remains as the later, engagement-gated re-prompt for anyone who dismisses.
 *
 * Accessibility mirrors OnboardingTour's dialog pattern: role="dialog",
 * aria-modal, aria-labelledby, Escape to close, focus moved into the card on
 * open and returned on close.
 */
export const InstallPromptOverlay: React.FC = () => {
  const { status } = usePwaInstall();
  const [eligible, setEligible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [entered, setEntered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Re-check after the tour completes, after disclaimer acceptance, and when the
  // PWA status resolves (Android's beforeinstallprompt is async).
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const recheck = () => {
      const disclaimerAcked = window.localStorage.getItem(DISCLAIMER_FLAG_KEY) === '1';
      const tourDone = window.localStorage.getItem(TOUR_COMPLETE_KEY) === '1';
      const alreadyShown = window.localStorage.getItem(INSTALL_OVERLAY_SHOWN_KEY) === '1';
      setEligible(disclaimerAcked && tourDone && installApplies(status) && !alreadyShown);
    };
    recheck();
    window.addEventListener(TOUR_COMPLETE_EVENT, recheck);
    window.addEventListener(DISCLAIMER_ACCEPTED_EVENT, recheck);
    return () => {
      window.removeEventListener(TOUR_COMPLETE_EVENT, recheck);
      window.removeEventListener(DISCLAIMER_ACCEPTED_EVENT, recheck);
    };
  }, [status]);

  // On show: mark shown-once, move focus in, and trigger the entrance transition.
  useEffect(() => {
    if (!eligible) return;
    window.localStorage.setItem(INSTALL_OVERLAY_SHOWN_KEY, '1');
    restoreFocusRef.current = (document.activeElement as HTMLElement) ?? null;
    cardRef.current?.focus();
    const id = window.setTimeout(() => setEntered(true), 10);
    return () => window.clearTimeout(id);
  }, [eligible]);

  const close = () => {
    setDismissed(true);
    const prev = restoreFocusRef.current;
    const target = prev && document.contains(prev) ? prev : document.querySelector('main');
    if (target instanceof HTMLElement) {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus();
    }
  };

  if (!eligible || dismissed) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-overlay-title"
      onKeyDown={(e) => { if (e.key === 'Escape') close(); }}
    >
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" aria-hidden="true" onClick={close} />

      <div
        ref={cardRef}
        tabIndex={-1}
        className={`relative max-w-md w-full bg-white rounded-2xl shadow-2xl max-h-[85dvh] overflow-y-auto focus:outline-none transition-all duration-200 ${entered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          type="button"
          onClick={close}
          aria-label="Close install prompt"
          className="absolute top-2 right-2 z-10 w-11 h-11 flex items-center justify-center rounded-lg text-white/80 hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          <X className="w-5 h-5" aria-hidden />
        </button>

        {/* Hero */}
        <div className="bg-gradient-to-br from-neuro-500 to-neuro-700 px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4">
            <Smartphone className="w-8 h-8 text-neuro-600" aria-hidden />
          </div>
          <h2 id="install-overlay-title" className="text-xl font-bold text-white mb-1">
            Add NeuroWiki to your phone
          </h2>
          <p className="text-sm text-white/90 leading-relaxed">
            Bedside reference, one tap away. No login. Works offline.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neuro-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-neuro-600" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Faster at the bedside</p>
              <p className="text-xs text-slate-500 leading-relaxed">Opens straight from your home screen — no browser, no tabs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neuro-50 flex items-center justify-center">
              <Download className="w-4 h-4 text-neuro-600" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Works offline</p>
              <p className="text-xs text-slate-500 leading-relaxed">Calculators and pathways stay available even with no signal.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neuro-50 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-neuro-600" aria-hidden />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Your favorites, ready</p>
              <p className="text-xs text-slate-500 leading-relaxed">Pinned trials and recent calculators stay on this device.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-1 space-y-3">
          <div className="flex flex-col items-center">
            <InstallActions variant="tour" />
          </div>
          <button
            type="button"
            onClick={close}
            className="w-full min-h-[44px] px-6 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptOverlay;
