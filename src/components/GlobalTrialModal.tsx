import React, { useEffect, useRef } from 'react';
import { X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TrialEmbed } from './article/stroke/TrialEmbed';

interface GlobalTrialModalProps {
  trialSlug: string; // e.g., 'dawn-trial' (without /trials/ prefix)
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalTrialModal: React.FC<GlobalTrialModalProps> = ({
  trialSlug,
  isOpen,
  onClose,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const prevFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    prevFocusRef.current = document.activeElement as HTMLElement;

    const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';
    const getFocusable = () => Array.from(modalRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? []);

    // Focus the close button (first focusable in header — always present)
    setTimeout(() => getFocusable()[0]?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
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
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      prevFocusRef.current?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Construct full path for TrialEmbed
  const fullTrialPath = `/trials/${trialSlug}`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 pointer-events-none">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="trial-modal-title"
          className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90dvh] flex flex-col pointer-events-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 id="trial-modal-title" className="text-xl font-bold text-slate-900">Clinical Trial</h2>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-md uppercase tracking-wide">
                Trial
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to={fullTrialPath}
                target="_blank"
                className="inline-flex items-center gap-2 text-sm font-medium text-neuro-600 hover:text-neuro-700 px-4 py-2 rounded-lg hover:bg-neuro-50 transition-colors"
                onClick={onClose}
              >
                <ExternalLink size={16} />
                View Full Page
              </Link>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X size={20} className="text-slate-500" />
              </button>
            </div>
          </div>

          {/* Content - Uses TrialEmbed for clean rendering */}
          <div className="flex-1 overflow-y-auto p-6">
            <TrialEmbed trialSlug={fullTrialPath} />
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 border-t border-slate-100 px-6 py-4 bg-slate-50">
            <p className="text-xs text-slate-500 text-center">
              Clinical guidance with trial references
            </p>
          </div>
        </div>
      </div>
    </>
  );
};
