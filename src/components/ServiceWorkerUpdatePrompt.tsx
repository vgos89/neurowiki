import React, { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { subscribeToPendingUpdate, applyPendingUpdate } from '../lib/swUpdate';

/**
 * "Update ready" prompt, shown only when a new build is waiting AND the
 * clinician has work in progress.
 *
 * With nothing in progress the app reloads itself silently, so this never
 * appears for the common case. It exists for the one case that matters: an exam
 * is open, we will not interrupt it, and without this the clinician has no way
 * to know an update exists or to take it deliberately.
 *
 * Deliberately not a modal and not dismissible-with-consequences. It sits out of
 * the way, and if it is ignored the pending update still lands the next time the
 * app is backgrounded.
 */
export const ServiceWorkerUpdatePrompt: React.FC = () => {
  const [pending, setPending] = useState(false);

  useEffect(() => subscribeToPendingUpdate(setPending), []);

  if (!pending) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[70] pointer-events-none px-4 w-full max-w-sm"
    >
      <div className="pointer-events-auto flex items-center gap-2 bg-slate-900/95 text-white rounded-full pl-4 pr-1.5 py-1.5 shadow-lg backdrop-blur-sm">
        <RefreshCw className="w-3.5 h-3.5 flex-shrink-0 text-slate-300" aria-hidden />
        <span className="text-xs leading-snug flex-1">
          A new version is ready. Your exam is kept.
        </span>
        <button
          type="button"
          onClick={applyPendingUpdate}
          className="flex-shrink-0 text-xs font-semibold bg-white text-slate-900 rounded-full px-3 py-1.5 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
        >
          Update
        </button>
      </div>
    </div>
  );
};
