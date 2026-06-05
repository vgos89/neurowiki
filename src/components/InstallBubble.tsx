import React, { useEffect, useState } from 'react';
import { X, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';
import { useInstallEngagement } from '../hooks/useInstallEngagement';
import { InstallActions } from './InstallActions';

/**
 * InstallBubble — small dismissible bubble that suggests installing
 * NeuroWiki as a home-screen app. Appears in the same screen quadrant as
 * the feedback button (bottom-right) but sits above it.
 *
 * Visibility logic (combines two hooks):
 *   - usePwaInstall: must be installable (Android) or iOS Safari; not
 *     already installed. (Narrower than the tour, which also handles iOS
 *     non-Safari — the bubble keeps its historical installable/ios-manual scope.)
 *   - useInstallEngagement: user has reached threshold (3 sessions or
 *     3 distinct calc/pathway uses), not permanently dismissed, not
 *     shown too recently, not shown too many times
 *
 * The install buttons themselves come from the shared <InstallActions>
 * component (single source of truth for the status → UI mapping). Any install
 * interaction permanently dismisses the bubble so we don't pester.
 */

export const InstallBubble: React.FC = () => {
  const { status } = usePwaInstall();
  const { shouldShowBubble, markBubbleShown, dismissPermanently } = useInstallEngagement();
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

  if (!eligible || !visible) return null;

  const handleInteract = () => {
    // User engaged with the install flow — don't pester again.
    dismissPermanently();
    setDismissed(true);
  };

  const handleDismiss = () => setDismissed(true);

  return (
    <div
      className="fixed bottom-40 right-4 md:right-6 z-40 w-[280px] bg-white border border-neuro-200 rounded-xl shadow-lg p-3 flex items-start gap-3"
      role="dialog"
      aria-labelledby="install-bubble-title"
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-neuro-50 border border-neuro-100 flex items-center justify-center">
        <Smartphone className="w-4 h-4 text-neuro-600" aria-hidden />
      </div>
      <div className="flex-1 min-w-0">
        <p id="install-bubble-title" className="text-sm font-semibold text-slate-900 leading-snug">
          Add NeuroWiki app to your phone
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug">
          Open it instantly from your home screen, even offline.
        </p>
        <div className="mt-2">
          <InstallActions variant="bubble" onInteract={handleInteract} />
        </div>
      </div>
      <button
        type="button"
        onClick={handleDismiss}
        className="flex-shrink-0 -mt-2 -mr-2 w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-600 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" aria-hidden />
      </button>
    </div>
  );
};

export default InstallBubble;
