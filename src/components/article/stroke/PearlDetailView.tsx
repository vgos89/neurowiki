import React from 'react';
import { X, BookOpen, Lightbulb, BookMarked, Link2 } from 'lucide-react';
import type { ClinicalPearl } from '../../../data/strokeClinicalPearls';
import { TrialEmbed } from './TrialEmbed';

interface PearlDetailViewProps {
  pearl: ClinicalPearl;
  isOpen: boolean;
  onClose: () => void;
  onBack: () => void;
}

/**
 * PearlDetailView — the "research tool" surface. Reached by tapping a
 * pearl card in DeepLearningModal/SectionPearls.
 *
 * Anatomy rebuilt 2026-05-19 (Batch 2) to match PathwayHeader anatomy
 * so the surface visually matches the rest of NeuroWiki:
 *
 *   - Sticky header: canonical back-arrow SVG (M19 12H5M12 19l-7-7 7-7) +
 *     "DEEP LEARNING" eyebrow + pearl title + right-cluster (X).
 *   - rounded-xl container, shadow-lg (was rounded-2xl + shadow-2xl).
 *   - Section labels: text-[10px] font-bold uppercase tracking-widest text-slate-400
 *     (was text-sm uppercase tracking-wide).
 *   - Evidence chips: rounded-lg (was rounded).
 *   - Key-takeaway callout: single-border severity-strip pattern
 *     (border-l-2 border-amber-400) matching ProtocolModal.
 *   - All interactive elements ≥44×44.
 *
 * Spec reference: design-tokens skill, PathwayHeader.tsx, ProtocolModal.tsx,
 * CALCULATOR_SPEC §1.5 (section labels) + §2.4 (touch targets).
 */
export const PearlDetailView: React.FC<PearlDetailViewProps> = ({
  pearl,
  isOpen,
  onClose,
  onBack,
}) => {
  // Close on escape
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
  const hasEvidenceChips = pearl.evidenceClass || pearl.evidenceLevel;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
        onClick={onBack}
        aria-hidden
      />

      {/* Modal container */}
      <div className="fixed inset-0 z-[70] overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 sm:p-6 md:p-8">
          <div
            className="relative bg-white rounded-xl shadow-lg border border-slate-100 w-full max-w-4xl max-h-[90dvh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="pearl-detail-title"
          >
            {/* Sticky header — PathwayHeader anatomy */}
            <header className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-slate-100 rounded-t-xl">
              <div className="flex items-center justify-between h-14 px-5 gap-3">
                {/* Left: canonical back-arrow + eyebrow + pearl title */}
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to pearls"
                    className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="min-w-0 flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {pearl.type === 'trial' ? 'Trial' : 'Study mode'}
                    </span>
                    <h2
                      id="pearl-detail-title"
                      className="text-[15px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5 truncate"
                    >
                      {pearl.title}
                    </h2>
                  </div>
                </div>

                {/* Right cluster: close */}
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-shrink-0 min-h-[44px] min-w-[44px] rounded-full bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
                  aria-label="Close pearl detail"
                >
                  <X className="w-4 h-4 text-slate-500" aria-hidden />
                </button>
              </div>

              {/* Evidence chips — canonical pill scale + rounded-lg */}
              {hasEvidenceChips && (
                <div className="flex items-center gap-2 px-5 pb-3 -mt-1 flex-wrap">
                  {pearl.evidenceClass && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-lg bg-slate-50 text-slate-700 border-slate-200">
                      Class {pearl.evidenceClass}
                    </span>
                  )}
                  {pearl.evidenceLevel && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest border rounded-lg bg-slate-50 text-slate-700 border-slate-200">
                      Level {pearl.evidenceLevel}
                    </span>
                  )}
                </div>
              )}
            </header>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-5">
              {/* Key takeaway — single-border severity-strip pattern (matches ProtocolModal) */}
              {pearl.plainEnglish && (
                <div className="mb-6 p-4 bg-amber-50 border-l-2 border-amber-400 rounded-lg">
                  <p className="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-2">
                    Key takeaway
                  </p>
                  <p className="text-sm text-amber-900 leading-[1.55] font-medium">
                    {pearl.plainEnglish}
                  </p>
                </div>
              )}

              {isLinkedTrial ? (
                <TrialEmbed trialSlug={pearl.trialSlug!} />
              ) : (
                <>
                  {pearl.detailedContent ? (
                    <>
                      {pearl.detailedContent.overview && (
                        <section className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-4 h-4 text-neuro-500" aria-hidden />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Overview
                            </h3>
                          </div>
                          <div className="p-4 bg-neuro-50 rounded-lg border-l-2 border-neuro-400">
                            <p className="text-sm text-slate-600 leading-[1.55]">
                              {pearl.detailedContent.overview}
                            </p>
                          </div>
                        </section>
                      )}

                      {pearl.detailedContent.clinicalTips && pearl.detailedContent.clinicalTips.length > 0 && (
                        <section className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Lightbulb className="w-4 h-4 text-amber-600" aria-hidden />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Clinical tips
                            </h3>
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
                        </section>
                      )}

                      {pearl.detailedContent.evidence && (
                        <section className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <BookMarked className="w-4 h-4 text-slate-500" aria-hidden />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Evidence
                            </h3>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-sm text-slate-600 leading-[1.55]">
                              {pearl.detailedContent.evidence}
                            </p>
                          </div>
                        </section>
                      )}

                      {pearl.detailedContent.reference && (
                        <section className="mb-6">
                          <div className="flex items-center gap-2 mb-3">
                            <Link2 className="w-4 h-4 text-slate-500" aria-hidden />
                            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                              Reference
                            </h3>
                          </div>
                          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {pearl.detailedContent.reference}
                            </p>
                          </div>
                        </section>
                      )}
                    </>
                  ) : (
                    /* Fallback: pearl with no detailed content */
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
            <footer className="px-5 py-4 border-t border-slate-100 flex-shrink-0 rounded-b-xl bg-slate-50">
              <p className="text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400 text-center">
                Clinical reference · trial citations included
              </p>
            </footer>
          </div>
        </div>
      </div>
    </>
  );
};
