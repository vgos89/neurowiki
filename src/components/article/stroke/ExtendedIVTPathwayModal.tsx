import React from 'react';
import { X, Brain } from 'lucide-react';
import ExtendedIVTPathway, { IVTResult } from '../../../pages/ExtendedIVTPathway';

interface ExtendedIVTPathwayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult?: (result: IVTResult | null) => void;
}

export const ExtendedIVTPathwayModal: React.FC<ExtendedIVTPathwayModalProps> = ({
  isOpen,
  onClose,
  onResult,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-100 dark:border-slate-700 flex-shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
              Extended Window IVT Pathway
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <ExtendedIVTPathway
            hideHeader
            isInModal
            onResultChange={onResult}
          />
        </div>
      </div>
    </div>
  );
};
