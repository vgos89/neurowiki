/**
 * ExtendedIVTPathwayModal — embeds ExtendedIVTPathway inside Stroke Code.
 *
 * Mirrors ThrombectomyPathwayModal pattern (wraps EvtPathway with
 * hideHeader + isInModal). Used by CodeModeStep1 when the clinician
 * enters LKW > 4.5h ago or marks LKW unknown — Extended IVT decision
 * tree (WAKE-UP / EXTEND / TRACE-III + DWI-FLAIR mismatch) renders
 * in-context without taking the clinician away from Stroke Code.
 *
 * Created 2026-05-17 per V direction (replaces the prior react-router
 * Link in CodeModeStep1 with an in-page modal).
 *
 * a11y: full dialog ARIA + focus trap via useModalFocusTrap (the
 * shared hook used by ProtocolModal / ThrombectomyPathwayModal /
 * inline NIHSS modal). Closes WCAG 2.4.3 + 4.1.2 by construction.
 */
import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft } from 'lucide-react';
import ExtendedIVTPathway, { type IVTResult } from '../../../pages/ExtendedIVTPathway';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

interface ExtendedIVTPathwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Called with the current Extended IVT verdict whenever it changes
   *  inside the modal. Parent (StrokeBasicsWorkflowV2) maps the verdict
   *  to a readable recommendation string and feeds it into the Step 3
   *  summary + EMR copy text. Optional — standalone /pathways/extended-ivt
   *  usage doesn't need this. Added 2026-05-17 per V direction. */
  onResultChange?: (result: IVTResult | null) => void;
}

export const ExtendedIVTPathwayModal: React.FC<ExtendedIVTPathwayModalProps> = ({
  isOpen,
  onClose,
  onResultChange,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Full modal focus + keyboard wiring per useModalFocusTrap (WCAG 2.4.3 + 4.1.2)
  useModalFocusTrap(isOpen, onClose, dialogRef, closeButtonRef);

  // Body scroll lock (preserves background context when modal open)
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        ref={dialogRef}
        className="relative w-full max-w-6xl max-h-[95dvh] bg-white rounded-xl shadow-lg border border-slate-100 flex flex-col overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="extivt-modal-title"
        aria-describedby="extivt-modal-desc"
      >
        {/* Modal Header — chassis-aligned 2026-05-24: slate-50 tint to
            match the chassis card header bars used across the pathway. */}
        <div className="sticky top-0 bg-slate-50 border-b border-slate-100 z-10">
          <div className="flex items-center justify-between h-14 px-5 gap-4">
            <div>
              <p id="extivt-modal-title" className="text-base font-semibold text-slate-900 tracking-tight">
                Extended IVT Pathway
              </p>
              <p id="extivt-modal-desc" className="text-xs text-slate-400">
                Wake-up / unknown-onset / 4.5–24h windows · AHA/ASA 2026
              </p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={onClose}
              className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center"
              aria-label="Close Extended IVT pathway"
            >
              <X className="w-4 h-4 text-slate-500" aria-hidden />
            </button>
          </div>
        </div>

        {/* Modal Content — ExtendedIVTPathway in modal mode */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 pb-8">
            <ExtendedIVTPathway
              hideHeader={true}
              isInModal={true}
              onResultChange={onResultChange}
            />
          </div>
        </div>

        {/* Footer with Return-to-Stroke-Workflow CTA */}
        <div className="flex-shrink-0 border-t border-slate-100 bg-white px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-full transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Return to Stroke Workflow
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExtendedIVTPathwayModal;
