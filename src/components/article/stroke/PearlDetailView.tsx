import React from 'react';
import { X, ArrowLeft, BookOpen, Lightbulb, BookMarked, Link2 } from 'lucide-react';
import type { ClinicalPearl } from '../../../data/strokeClinicalPearls';
import { TrialEmbed } from './TrialEmbed';

interface PearlDetailViewProps {
  pearl: ClinicalPearl;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

export const PearlDetailView: React.FC<PearlDetailViewProps> = ({
  pearl,
  isOpen,
  onClose,
  onBack,
}) => {
  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isLinkedTrial = pearl.type === 'trial' && pearl.trialSlug;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
        onClick={onBack}
      />

      {/* Modal Container - Centered with Flexbox */}
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-8">
          {/* Modal Content */}
          <div
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 p-4 sm:p-6 flex-shrink-0 rounded-t-2xl">
              {/* Back and Close Buttons */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Pearls</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                  aria-label="Close all"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              {/* Title, Evidence class/level, and Badge */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {pearl.title}
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full flex-shrink-0 ${
                  pearl.type === 'trial'
                    ? 'bg-neuro-50 text-neuro-700'
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {pearl.type === 'trial' ? 'TRIAL' : 'PEARL'}
                </span>
              </div>
              {(pearl.evidenceClass || pearl.evidenceLevel) && (
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {pearl.evidenceClass && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-bold border rounded bg-slate-100 text-slate-800 border-slate-300">
                      Class {pearl.evidenceClass}
                    </span>
                  )}
                  {pearl.evidenceLevel && (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-bold border rounded bg-slate-100 text-slate-800 border-slate-300">
                      Level {pearl.evidenceLevel}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6">
              {pearl.plainEnglish && (
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 border-l-4 border-l-amber-500 rounded-lg">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Key takeaway</h4>
                  <p className="text-sm text-amber-900 leading-relaxed font-medium">{pearl.plainEnglish}</p>
                </div>
              )}
              {isLinkedTrial ? (
                <TrialEmbed trialSlug={pearl.trialSlug!} />
              ) : (
                /* Regular pearl content */
                <>
                  {pearl.detailedContent ? (
                    <>
                      {/* Overview Section */}
                      {pearl.detailedContent.overview && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-neuro-500" aria-hidden="true" />
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                              Overview
                            </h4>
                          </div>
                          <div className="p-4 bg-neuro-50 rounded-lg border-l-4 border-neuro-500">
                            <p className="text-sm text-slate-600 leading-[1.55]">
                              {pearl.detailedContent.overview}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Clinical Tips Section */}
                      {pearl.detailedContent.clinicalTips && pearl.detailedContent.clinicalTips.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden="true" />
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                              Clinical Tips
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {pearl.detailedContent.clinicalTips.map((tip, index) => (
                              <div
                                key={index}
                                className="flex gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100"
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-neuro-500 text-white flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <p className="text-sm text-slate-600 leading-[1.55]">
                                  {tip}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Evidence Section */}
                      {pearl.detailedContent.evidence && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <BookMarked className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                              Evidence
                            </h4>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-sm text-slate-600 leading-[1.55]">
                              {pearl.detailedContent.evidence}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Reference Section */}
                      {pearl.detailedContent.reference && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Link2 className="w-4 h-4 text-slate-500" aria-hidden="true" />
                            <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">
                              Reference
                            </h4>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {pearl.detailedContent.reference}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback if no detailed content */
                    <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                      <p className="text-sm text-slate-600 leading-[1.55]">
                        {pearl.content}
                      </p>
                      {pearl.evidence && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                          <p className="text-xs text-slate-400">
                            <span className="font-semibold">Evidence:</span> {pearl.evidence}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 flex-shrink-0 rounded-b-2xl">
              <p className="text-xs text-slate-400 text-center">
                Clinical guidance with trial references
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
