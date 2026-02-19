import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, Zap } from 'lucide-react';
import EvtPathway from '../../../pages/EvtPathway';

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
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white dark:bg-gray-900 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
        {/* Modal Header — matches standalone EVT Pathway header style */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm z-10">
          <div className="flex items-center justify-between h-14 px-4 gap-3">
            {/* Left: Icon badge + Title */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center shrink-0">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-slate-900 truncate">EVT / Thrombectomy</span>
            </div>
            {/* Right: Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-100 transition-colors shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-slate-500" />
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
