import React from 'react';
import { X, Share, Plus } from 'lucide-react';
import { useModalFocusTrap } from '../hooks/useModalFocusTrap';

/**
 * IosInstallSheet — bottom-sheet modal that walks an iOS Safari user through
 * adding NeuroWiki to their home screen. iOS doesn't fire `beforeinstallprompt`
 * and doesn't allow programmatic install, so we surface the manual steps
 * instead. Designed to feel like a native iOS share/install sheet.
 */

interface IosInstallSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IosInstallSheet: React.FC<IosInstallSheetProps> = ({ isOpen, onClose }) => {
  const dialogRef = React.useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="ios-install-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-slate-100 max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
              Add to phone
            </p>
            <h2 id="ios-install-title" className="text-base font-semibold text-slate-900 tracking-tight">
              Add NeuroWiki app to your iPhone
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" aria-hidden />
          </button>
        </div>

        {/* Steps */}
        <div className="px-5 pb-5 space-y-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neuro-500 text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-slate-900 font-medium leading-snug">
                Tap the <Share className="inline w-4 h-4 mx-0.5 -mt-0.5 text-neuro-600" aria-label="Share" /> Share button
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                It's at the bottom of Safari (or top-right on iPad). Looks like a square with an arrow pointing up.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neuro-500 text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-slate-900 font-medium leading-snug">
                Scroll and tap <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 rounded text-slate-700 text-xs"><Plus className="w-3 h-3" aria-hidden /> Add to Home Screen</span>
              </p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                In the share menu, scroll down until you see this option.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-neuro-500 text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div className="flex-1 pt-0.5">
              <p className="text-sm text-slate-900 font-medium leading-snug">Tap Add</p>
              <p className="text-xs text-slate-500 mt-1 leading-snug">
                The NeuroWiki icon appears on your home screen. Tap it any time to launch like a regular app.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 rounded-full text-sm font-semibold bg-neuro-500 hover:bg-neuro-600 text-white transition-colors"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default IosInstallSheet;
