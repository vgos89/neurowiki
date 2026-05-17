import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import EvtPathway from '../../../pages/EvtPathway';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface EvtResult {
  status: string;
  criteriaName?: string;
  reason: string;
}

interface ThrombectomyPathwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRecommendation?: (recommendation: string) => void;
}

export const ThrombectomyPathwayModal: React.FC<ThrombectomyPathwayModalProps> = ({
  isOpen,
  onClose,
  onRecommendation,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // a11y: full modal focus + keyboard wiring per useModalFocusTrap.
  // Closes BLOCKER B-1 from audit-stroke-code-a11y-2026-05-17.md
  // (WCAG 2.4.3 + 4.1.2). Previously had only body-scroll lock — no
  // dialog role, no aria-modal, no focus trap.
  useModalFocusTrap(isOpen, onClose, dialogRef, closeButtonRef);

  // Body scroll lock (existing behavior — preserved)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleResultChange = (result: EvtResult | null) => {
    if (result && onRecommendation) {
      // Format the recommendation string
      const recommendation = `${result.status}${result.criteriaName ? ` (${result.criteriaName})` : ''}: ${result.reason}`;
      onRecommendation(recommendation);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.18)' }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="thrombectomy-modal-title"
        aria-describedby="thrombectomy-modal-desc"
      >
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 z-10">
          <div className="flex items-center justify-between h-14 px-5 gap-4">
            <div>
              <p id="thrombectomy-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">EVT / Thrombectomy</p>
              <p id="thrombectomy-modal-desc" className="text-xs text-slate-400">AHA/ASA 2019 · thrombectomy eligibility</p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
              aria-label="Close"
            >
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Modal Content - EvtPathway Component */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-8">
            <EvtPathway
              hideHeader={true}
              isInModal={true}
              onResultChange={handleResultChange}
              customActionButton={{
                label: 'Return to Stroke Workflow',
                onClick: onClose,
                icon: <ArrowLeft size={16} className="mr-2" />
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
