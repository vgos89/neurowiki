import React from 'react';
import { X, ArrowLeft, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
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
        className="fixed inset-0 bg-black/70 z-[60]"
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
            <div className="bg-white border-b-2 border-purple-200 p-4 sm:p-6 flex-shrink-0 rounded-t-2xl">
              {/* Back and Close Buttons */}
              <div className="flex items-center justify-between mb-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Pearls</span>
                </button>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close all"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Title, Evidence class/level, and Badge */}
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {pearl.title}
                </h3>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full flex-shrink-0 ${
                  pearl.type === 'trial'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-purple-100 text-purple-700'
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
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg border-l-4 border-l-amber-500">
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide mb-2">Key takeaway</h4>
                  <p className="text-sm text-amber-900 leading-relaxed font-medium">{pearl.plainEnglish}</p>
                </div>
              )}
              {isLinkedTrial ? (
                <TrialEmbed trialSlug={pearl.trialSlug!} />
              ) : (
                /* Regular pearl content - keep existing code */
                <>
                  {pearl.detailedContent ? (
                    <>
                      {/* Overview Section */}
                      {pearl.detailedContent.overview && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">📖</span>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                              Overview
                            </h4>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                            <p className="text-sm text-gray-700 leading-relaxed">
                              {pearl.detailedContent.overview}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Clinical Tips Section */}
                      {pearl.detailedContent.clinicalTips && pearl.detailedContent.clinicalTips.length > 0 && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">💡</span>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                              Clinical Tips
                            </h4>
                          </div>
                          <div className="space-y-2">
                            {pearl.detailedContent.clinicalTips.map((tip, index) => (
                              <div
                                key={index}
                                className="flex gap-3 p-3 bg-purple-50 rounded-lg"
                              >
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold">
                                  {index + 1}
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">
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
                            <span className="text-2xl">📚</span>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                              Evidence
                            </h4>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {pearl.detailedContent.evidence}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Reference Section */}
                      {pearl.detailedContent.reference && (
                        <div className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-2xl">🔗</span>
                            <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                              Reference
                            </h4>
                          </div>
                          <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600 leading-relaxed">
                              {pearl.detailedContent.reference}
                            </p>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    /* Fallback if no detailed content */
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {pearl.content}
                      </p>
                      {pearl.evidence && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <p className="text-xs text-gray-500">
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
            <div className="p-4 bg-gradient-to-t from-white to-transparent border-t border-gray-200 flex-shrink-0 rounded-b-2xl">
              <p className="text-xs text-gray-500 text-center">
                Evidence-based clinical guidance
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
