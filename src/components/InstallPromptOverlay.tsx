/**
 * InstallPromptOverlay — full-screen install prompt shown once after a
 * clinician acknowledges the disclaimer modal on first visit.
 *
 * V feedback 2026-05-20: "PWA prompt to add to homescreen needs to be
 * more flashy on first load. Like an overlay rather than a button on
 * the disclaimer modal."
 *
 * UX flow:
 *   1. First visit → DisclaimerModal renders → user acknowledges →
 *      neurowiki:disclaimer:v1 set in localStorage.
 *   2. This overlay mounts on the next render, checks: disclaimer
 *      acknowledged AND prompt not previously shown AND device is
 *      installable (Android/Chrome) or iOS Safari (manual).
 *   3. User taps "Add to home screen" → programmatic prompt fires
 *      (Android) or IosInstallSheet opens (iOS) → overlay closes.
 *   4. User taps "Maybe later" → overlay closes, never re-shows.
 *
 * Dedupe: localStorage key `neurowiki:install-overlay:v1` set as
 * soon as the overlay is shown. Even if the user dismisses without
 * interacting, the overlay does not re-appear — the InstallBubble
 * still surfaces later after the engagement threshold (separate hook).
 *
 * Hidden permanently when status is 'already-installed' or
 * 'unsupported'.
 */

import React, { useEffect, useState } from 'react';
import { X, Smartphone, Download, Bookmark, Zap } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { IosInstallSheet } from './IosInstallSheet';

const DISCLAIMER_KEY = 'neurowiki:disclaimer:v1';
const OVERLAY_SHOWN_KEY = 'neurowiki:install-overlay:v1';

export const InstallPromptOverlay: React.FC = () => {
  const { status, promptInstall } = usePwaInstall();
  const [eligible, setEligible] = useState(false);
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Check eligibility on mount + when status resolves.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const disclaimerAcked = window.localStorage.getItem(DISCLAIMER_KEY) === '1';
    const alreadyShown = window.localStorage.getItem(OVERLAY_SHOWN_KEY) === '1';
    const canInstall = status === 'installable' || status === 'ios-manual';
    setEligible(disclaimerAcked && !alreadyShown && canInstall);
  }, [status]);

  // Mark shown once we render — never re-prompt even if user does nothing.
  useEffect(() => {
    if (eligible && typeof window !== 'undefined') {
      window.localStorage.setItem(OVERLAY_SHOWN_KEY, '1');
    }
  }, [eligible]);

  if (!eligible || dismissed) {
    return (
      <IosInstallSheet isOpen={showIosSheet} onClose={() => { setShowIosSheet(false); setDismissed(true); }} />
    );
  }

  const handleInstall = async () => {
    if (status === 'ios-manual') {
      setShowIosSheet(true);
      return;
    }
    if (status === 'installable') {
      await promptInstall();
      setDismissed(true);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[95] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="install-overlay-title"
    >
      {/* Backdrop — opaque to keep the focus on the prompt */}
      <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm" aria-hidden="true" />

      {/* Card */}
      <div
        className="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Close install prompt"
          className="absolute top-3 right-3 z-10 p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero — cobalt header with app-icon halo */}
        <div className="bg-gradient-to-br from-neuro-500 to-neuro-700 px-6 pt-8 pb-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white shadow-lg mb-4">
            <Smartphone className="w-8 h-8 text-neuro-600" aria-hidden="true" />
          </div>
          <h2 id="install-overlay-title" className="text-xl font-bold text-white mb-1">
            Add NeuroWiki to your phone
          </h2>
          <p className="text-sm text-neuro-50 leading-relaxed">
            Bedside reference, one tap away. No login. Works offline.
          </p>
        </div>

        {/* Benefits */}
        <div className="px-6 py-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neuro-50 flex items-center justify-center">
              <Zap className="w-4 h-4 text-neuro-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Faster at the bedside</p>
              <p className="text-xs text-slate-500 leading-relaxed">Opens straight from your home screen — no browser, no tabs.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neuro-50 flex items-center justify-center">
              <Download className="w-4 h-4 text-neuro-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Works offline</p>
              <p className="text-xs text-slate-500 leading-relaxed">Calculators and pathways stay available even when you have no signal.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-neuro-50 flex items-center justify-center">
              <Bookmark className="w-4 h-4 text-neuro-600" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Your favorites, ready</p>
              <p className="text-xs text-slate-500 leading-relaxed">Pinned trials and recent calculators sync across sessions on this device.</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 pt-2 space-y-2">
          <button
            type="button"
            onClick={handleInstall}
            className="w-full min-h-[44px] px-6 py-3 rounded-full text-sm font-semibold bg-neuro-500 text-white hover:bg-neuro-600 active:bg-neuro-700 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {status === 'ios-manual' ? 'Show how to add' : 'Add to home screen'}
          </button>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="w-full min-h-[44px] px-6 py-2 rounded-full text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
          >
            Maybe later
          </button>
        </div>
      </div>

      <IosInstallSheet isOpen={showIosSheet} onClose={() => { setShowIosSheet(false); setDismissed(true); }} />
    </div>
  );
};

export default InstallPromptOverlay;
