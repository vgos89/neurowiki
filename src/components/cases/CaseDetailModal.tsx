import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { X, Copy, ExternalLink, Trash2, FileText, Calendar, Activity, Shield } from 'lucide-react';
import { useModalFocusTrap } from '../../hooks/useModalFocusTrap';
import { ShareButton } from '../calculators/ShareButton';
import type { SavedCase } from '../../lib/cases/types';
import { formatSavedCaseAsEmrText, getSavedCaseHeadline, getSavedCaseSubline } from '../../lib/cases/format';
import { formatClinicalDateTime } from '../../utils/clinicalDateTime';

/**
 * CaseDetailModal — opens when the clinician taps a row in /my-cases.
 * Read-only view of the full case + actions: Copy EMR text, Send via
 * native share, Edit (initials + note via the existing SaveCaseModal
 * with `existingCaseId`), Delete.
 *
 * V audit 2026-05-19: clicking a saved row was previously a no-op —
 * delete was the only available action. This modal closes that gap.
 */

interface CaseDetailModalProps {
  isOpen: boolean;
  caseData: SavedCase | null;
  onClose: () => void;
  /** Called when the user confirms delete from inside the modal. */
  onRequestDelete?: (id: string) => void;
}

export const CaseDetailModal: React.FC<CaseDetailModalProps> = ({
  isOpen,
  caseData,
  onClose,
  onRequestDelete,
}) => {
  const navigate = useNavigate();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useModalFocusTrap(isOpen, onClose, dialogRef);

  React.useEffect(() => {
    if (!isOpen) {
      setConfirmDelete(false);
      setToast(null);
    }
  }, [isOpen]);

  if (!isOpen || !caseData) return null;

  const emrText = formatSavedCaseAsEmrText(caseData);
  const headline = getSavedCaseHeadline(caseData);
  const subline = getSavedCaseSubline(caseData);

  const flashToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1800);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(emrText);
      flashToast('Copied to clipboard');
    } catch {
      flashToast('Copy failed');
    }
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onRequestDelete?.(caseData.id);
    onClose();
  };

  // Open the case back into the originating calculator with a ?caseId
  // query param. The calculator restores its state from the saved case
  // and the update-in-place save flow (existingCaseId) ties any re-save
  // back to the same row. Only NIHSS implements reload today; other
  // calculators receive the param but ignore it (they open fresh — the
  // clinician can re-save manually if needed).
  const handleOpenInCalculator = () => {
    const calcPath = caseData.source.type === 'calculator'
      ? `/calculators/${caseData.source.id}`
      : `/pathways/${caseData.source.id}`;
    onClose();
    navigate(`${calcPath}?caseId=${encodeURIComponent(caseData.id)}`);
  };

  const content = (
    <div
      className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="case-detail-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-xl sm:rounded-xl shadow-lg border border-slate-100 max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3 border-b border-slate-100">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Saved case
            </p>
            <h2 id="case-detail-title" className="text-base font-semibold text-slate-900 tracking-tight">
              {caseData.initials} · {caseData.source.title}
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden />
              {formatClinicalDateTime(new Date(caseData.createdAt))}
              {caseData.updatedAt !== caseData.createdAt && (
                <span className="text-slate-400">· updated {formatClinicalDateTime(new Date(caseData.updatedAt))}</span>
              )}
            </p>
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

        {/* Headline result */}
        <div className="px-5 pt-4 pb-2">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-neuro-600" aria-hidden />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Result
            </span>
          </div>
          <p className="text-base font-semibold text-slate-900">{headline}</p>
          {subline && <p className="text-sm text-slate-500 mt-0.5">{subline}</p>}
        </div>

        {/* Note */}
        {caseData.note && (
          <div className="px-5 py-3 mx-5 mb-3 bg-amber-50 border-l-2 border-amber-300 rounded-lg flex items-start gap-2">
            <FileText className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" aria-hidden />
            <p className="text-xs text-amber-900 leading-relaxed">{caseData.note}</p>
          </div>
        )}

        {/* Full EMR text — read-only preview */}
        <div className="px-5 pb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              EMR copy
            </span>
            <span className="text-[10px] text-slate-400">tap Copy to capture</span>
          </div>
          <pre className="text-[11px] text-slate-700 bg-slate-50 border border-slate-100 rounded-lg p-3 whitespace-pre-wrap font-mono leading-relaxed max-h-[40dvh] overflow-y-auto">
            {emrText}
          </pre>
        </div>

        {/* Privacy reminder */}
        <div className="mx-5 mb-3 p-2.5 bg-slate-50 rounded-lg flex items-start gap-2">
          <Shield className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" aria-hidden />
          <p className="text-[11px] text-slate-500 leading-relaxed">
            On-device only. To edit scores or timestamps, reopen the calculator and re-save.
          </p>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleCopy}
            className="flex-1 min-h-[44px] px-4 py-2 rounded-full bg-neuro-500 hover:bg-neuro-600 text-white text-sm font-semibold inline-flex items-center justify-center gap-1.5 transition-colors"
          >
            <Copy className="w-4 h-4" aria-hidden />
            Copy
          </button>
          <ShareButton
            text={emrText}
            title={`${caseData.initials} · ${caseData.source.title}`}
            onResult={(r) => {
              if (r === 'shared') flashToast('Sent');
              else if (r === 'copied') flashToast('Copied to clipboard');
            }}
            variant="pill"
            label="Send"
          />
          <button
            type="button"
            onClick={handleOpenInCalculator}
            className="min-h-[44px] px-4 py-2 rounded-full text-sm font-medium border border-slate-200 hover:bg-slate-100 text-slate-700 inline-flex items-center gap-1.5 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden />
            Open in calculator
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className={`min-h-[44px] px-4 py-2 rounded-full text-sm font-medium inline-flex items-center gap-1.5 transition-colors ${
              confirmDelete
                ? 'bg-rose-500 hover:bg-rose-600 text-white border border-rose-500'
                : 'border border-slate-200 hover:bg-slate-100 text-slate-500 hover:text-rose-600'
            }`}
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden />
            {confirmDelete ? 'Confirm' : 'Delete'}
          </button>
        </div>

        {/* Inline toast */}
        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs px-4 py-2 rounded-full shadow-lg pointer-events-none">
            {toast}
          </div>
        )}
      </div>

    </div>
  );

  return createPortal(content, document.body);
};

export default CaseDetailModal;
