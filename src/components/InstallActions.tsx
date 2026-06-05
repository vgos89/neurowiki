import React, { useState } from 'react';
import { Download, Compass, Smartphone, Share, Plus } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { IosInstallSheet } from './IosInstallSheet';

/**
 * InstallActions — single source of truth for the install-status → button
 * mapping, shared by the onboarding tour's install slide and the engagement
 * InstallBubble. Replaces the three hand-rolled copies that used to live in
 * DisclaimerModal, InstallPromptOverlay, and InstallBubble.
 *
 * Renders nothing for 'already-installed' / 'unsupported' — callers should use
 * `installApplies(status)` from lib/consent to decide whether to surface it.
 *
 * iOS-Safari ('ios-manual') differs by variant on purpose:
 *   - bubble: a button that opens the IosInstallSheet overlay (z-80, above the
 *     bubble's z-40).
 *   - tour: inline Share → Add steps, because the tour itself sits at z-94 —
 *     above the sheet — so opening the sheet would render it behind the tour.
 */

interface Props {
  variant?: 'tour' | 'bubble';
  /** Fired when the user takes any install action (tap Install / open Safari /
   *  open the iOS sheet / copy link). The bubble uses this to stop pestering. */
  onInteract?: () => void;
}

export const InstallActions: React.FC<Props> = ({ variant = 'tour', onInteract }) => {
  const { status, promptInstall, openInSafari, copyAppLink } = usePwaInstall();
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [copied, setCopied] = useState(false);

  const primaryBtn =
    'min-h-[44px] px-5 py-2.5 rounded-full bg-neuro-500 hover:bg-neuro-600 active:bg-neuro-700 text-white text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 focus-visible:outline-none';
  const secondaryBtn =
    'min-h-[44px] px-4 py-2.5 rounded-full bg-white border border-neuro-300 hover:bg-neuro-50 text-neuro-700 text-sm font-semibold transition-colors inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none';

  const handleCopy = async () => {
    const ok = await copyAppLink();
    if (ok) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
    onInteract?.();
  };

  // Android / desktop Chrome — native install prompt
  if (status === 'installable') {
    return (
      <button
        type="button"
        onClick={async () => {
          await promptInstall();
          onInteract?.();
        }}
        className={primaryBtn}
      >
        <Download className="w-4 h-4" aria-hidden /> Install app
      </button>
    );
  }

  // iOS non-Safari (Chrome/Firefox/Edge/in-app) — bounce to Safari + fallback
  if (status === 'ios-other-browser') {
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => {
              openInSafari();
              onInteract?.();
            }}
            className={primaryBtn}
          >
            <Compass className="w-4 h-4" aria-hidden /> Open in Safari
          </button>
          <button type="button" onClick={handleCopy} className={secondaryBtn}>
            {copied ? 'Link copied' : 'Copy link'}
          </button>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed text-center">
          On iPhone, Add to Home Screen only works in Safari. Open it there, then tap
          Share &rarr; Add to Home Screen.
        </p>
      </div>
    );
  }

  // iOS Safari — manual Add to Home Screen
  if (status === 'ios-manual') {
    if (variant === 'tour') {
      return (
        <div className="rounded-xl bg-neuro-50 border border-neuro-100 px-4 py-3 text-left space-y-2">
          <p className="text-sm text-slate-700 leading-snug flex items-center gap-1.5">
            <span className="font-semibold">1.</span> Tap
            <Share className="inline w-4 h-4 text-neuro-600" aria-hidden /> Share in Safari
          </p>
          <p className="text-sm text-slate-700 leading-snug flex items-center gap-1.5">
            <span className="font-semibold">2.</span> Choose
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-white rounded text-slate-700 text-xs border border-slate-200">
              <Plus className="w-3 h-3" aria-hidden /> Add to Home Screen
            </span>
          </p>
        </div>
      );
    }
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setShowIosSheet(true);
            onInteract?.();
          }}
          className={primaryBtn}
        >
          <Smartphone className="w-4 h-4" aria-hidden /> Add to Home Screen
        </button>
        <IosInstallSheet isOpen={showIosSheet} onClose={() => setShowIosSheet(false)} />
      </>
    );
  }

  // already-installed / unsupported
  return null;
};

export default InstallActions;
