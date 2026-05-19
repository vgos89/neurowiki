import React, { useEffect, useState } from 'react';
import { X, Download, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useInstallEngagement } from '../hooks/useInstallEngagement';
import { IosInstallSheet } from './IosInstallSheet';

/**
 * InstallBubble — small dismissible bubble that suggests installing
 * NeuroWiki as a home-screen app. Appears in the same screen quadrant as
 * the feedback button (bottom-right) but sits above it.
 *
 * Visibility logic (combines two hooks):
 *   - usePwaInstall: must be installable (Android) or iOS Safari; not
 *     already installed
 *   - useInstallEngagement: user has reached threshold (3 sessions or
 *     3 distinct calc/pathway uses), not permanently dismissed, not
 *     shown too recently, not shown too many times
 *
 * Wording: "Add NeuroWiki app to your phone" (V-approved, clearer than
 * "Add to home screen" for non-technical clinicians).
 */

export const InstallBubble: React.FC = () => {
  const { status, promptInstall } = usePwaInstall();
  const { shouldShowBubble, markBubbleShown, dismissPermanently } = useInstallEngagement();
  const [showIosSheet, setShowIosSheet] = useState(false);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false); // this-session dismissal

  const eligible =
    !dismissed &&
    shouldShowBubble &&
    (status === 'installable' || status === 'ios-manual');

  // Mark shown when the bubble first appears in this session
  useEffect(() => {
    if (eligible && !visible) {
      setVisible(true);
      markBubbleShown();
    }
  }, [eligible, visible, markBubbleShown]);

  if (!eligible || !visible) {
    return (
      <>
        {/* Keep IosInstallSheet mounted so close transitions work even after bubble hidden */}
        <IosInstallSheet isOpen={showIosSheet} onClose={() => setShowIosSheet(false)} />
      </>
    );
  }

  const handleInstall = async () => {
    if (status === 'ios-manual') {
      setShowIosSheet(true);
      dismissPermanently(); // user engaged with the install flow — don't pester again
      setDismissed(true);
      return;
    }
    if (status === 'installable') {
      const outcome = await promptInstall();
      if (outcome === 'accepted') {
        dismissPermanently();
      }
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
  };

  return (
    <>
      {/* Bubble — sits above FeedbackButton (which is bottom-24).
          Bottom-40 puts it above the feedback button without overlap. */}
      <div
        className="fixed bottom-40 right-4 md:right-6 z-40 w-[280px] bg-white border border-neuro-200 rounded-xl shadow-lg p-3 flex items-start gap-3"
        role="dialog"
        aria-labelledby="install-bubble-title"
      >
        <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-neuro-50 border border-neuro-100 flex items-center justify-center">
          <Smartphone className="w-4 h-4 text-neuro-600" aria-hidden />
        </div>
        <div className="flex-1 min-w-0">
          <p
            id="install-bubble-title"
            className="text-sm font-semibold text-slate-900 leading-snug"
          >
            Add NeuroWiki app to your phone
          </p>
          <p className="text-xs text-slate-500 mt-0.5 leading-snug">
            Open it instantly from your home screen, even offline.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={handleInstall}
              className="min-h-[36px] px-3 py-1.5 rounded-full bg-neuro-500 hover:bg-neuro-600 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3 h-3" aria-hidden />
              Add app
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="min-h-[36px] px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700 font-medium"
            >
              Not now
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 -mt-0.5 -mr-0.5 p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" aria-hidden />
        </button>
      </div>

      <IosInstallSheet isOpen={showIosSheet} onClose={() => setShowIosSheet(false)} />
    </>
  );
};

export default InstallBubble;
