import React from 'react';
import { X, Check, Lightbulb } from 'lucide-react';
import type { ClinicalPearl } from '../../../data/strokeClinicalPearls';
import { PearlDetailView } from './PearlDetailView';
import { useModalFocusTrap } from '../../../hooks/useModalFocusTrap';

const getEvidenceBadgeColors = (evidenceClass?: string) => {
  switch (evidenceClass) {
    case 'I':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'IIa':
      return 'bg-neuro-100 text-neuro-800 border-neuro-200';
    case 'IIb':
      return 'bg-amber-50 text-amber-700 border-amber-300';
    case 'III':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-slate-100 text-slate-800 border-slate-300';
  }
};

const EvidenceBadge: React.FC<{ evidenceClass?: string; evidenceLevel?: string }> = ({
  evidenceClass,
  evidenceLevel,
}) => {
  if (!evidenceClass && !evidenceLevel) return null;

  return (
    <div className="flex items-center gap-2 mt-2">
      {evidenceClass && (
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-bold border rounded ${getEvidenceBadgeColors(evidenceClass)}`}
        >
          Class {evidenceClass}
        </span>
      )}
      {evidenceLevel && (
        <span className="inline-flex items-center px-2 py-1 text-xs font-bold bg-slate-100 text-slate-800 border border-slate-300 rounded">
          Level {evidenceLevel}
        </span>
      )}
    </div>
  );
};

interface DeepLearningModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  pearls: ClinicalPearl[];
}

export const DeepLearningModal: React.FC<DeepLearningModalProps> = ({
  isOpen,
  onClose,
  sectionTitle,
  pearls,
}) => {
  // Refs for focus trap (B-4 a11y fix)
  const dialogRef = React.useRef<HTMLDivElement>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  useModalFocusTrap(isOpen, onClose, dialogRef, closeButtonRef);

  // State to track expanded pearl
  const [expandedPearlId, setExpandedPearlId] = React.useState<string | null>(null);

  // Filter state: evidence class (I, IIa, IIb, III, none) and trials-only
  const [selectedFilters, setSelectedFilters] = React.useState<Set<string>>(
    new Set(['I', 'IIa', 'IIb', 'III', 'none'])
  );
  const [showTrialsOnly, setShowTrialsOnly] = React.useState(false);

  const toggleFilter = (filterClass: string) => {
    const newFilters = new Set(selectedFilters);
    if (newFilters.has(filterClass)) {
      newFilters.delete(filterClass);
    } else {
      newFilters.add(filterClass);
    }
    setSelectedFilters(newFilters);
  };

  const clearAllFilters = () => {
    setSelectedFilters(new Set());
  };

  const selectAllFilters = () => {
    setSelectedFilters(new Set(['I', 'IIa', 'IIb', 'III', 'none']));
  };

  // Handler to close expanded view
  const handleBackToPearls = () => {
    setExpandedPearlId(null);
  };

  // Reset expanded pearl when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setExpandedPearlId(null);
    }
  }, [isOpen]);

  // Body scroll lock
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter pearls by selected evidence classes and trials-only
  const filteredPearls = pearls.filter((pearl) => {
    if (showTrialsOnly && pearl.type !== 'trial') {
      return false;
    }
    const pearlClass = pearl.evidenceClass || 'none';
    return selectedFilters.has(pearlClass);
  });

  const filteredCount = filteredPearls.length;
  const totalCount = pearls.length;

  const expandedPearl = expandedPearlId ? pearls.find((p) => p.id === expandedPearlId) : null;

  return (
    <>
      {/* Main Pearl List Modal */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dlm-title"
        className="fixed bg-white shadow-lg z-50 lg:top-0 lg:right-0 lg:h-screen lg:w-[400px] bottom-0 left-0 right-0 h-[90vh] lg:h-screen rounded-t-2xl lg:rounded-none overflow-hidden"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 z-10">
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close deep learning panel"
          >
            <X className="w-5 h-5 text-slate-500" aria-hidden="true" />
          </button>

          <div className="pr-12">
            <h3 id="dlm-title" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Deep Learning
            </h3>
            <p className="text-sm font-bold text-slate-900 mt-1">
              {sectionTitle}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {pearls.length} {pearls.length === 1 ? 'pearl' : 'pearls'} • with trial citations
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="px-4 py-4 bg-slate-50 border-b border-slate-200">
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Filter by evidence strength
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={selectAllFilters}
                    className="text-xs font-medium text-neuro-500 hover:underline"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    onClick={clearAllFilters}
                    className="text-xs font-medium text-slate-600 hover:underline"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => toggleFilter('I')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('I')
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedFilters.has('I') ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('I') && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  Class I
                  <span className="text-[10px] font-normal opacity-75">Strong</span>
                </button>

                <button
                  onClick={() => toggleFilter('IIa')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('IIa')
                      ? 'bg-neuro-100 text-neuro-800 border-neuro-200'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedFilters.has('IIa') ? 'border-neuro-600 bg-neuro-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('IIa') && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  Class IIa
                  <span className="text-[10px] font-normal opacity-75">Moderate</span>
                </button>

                <button
                  onClick={() => toggleFilter('IIb')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('IIb')
                      ? 'bg-amber-50 text-amber-700 border-amber-300'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedFilters.has('IIb') ? 'border-amber-600 bg-amber-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('IIb') && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  Class IIb
                  <span className="text-[10px] font-normal opacity-75">Weak</span>
                </button>

                <button
                  onClick={() => toggleFilter('III')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('III')
                      ? 'bg-red-100 text-red-800 border-red-300'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedFilters.has('III') ? 'border-red-600 bg-red-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('III') && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  Class III
                  <span className="text-[10px] font-normal opacity-75">Harmful</span>
                </button>

                <button
                  onClick={() => toggleFilter('none')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('none')
                      ? 'bg-slate-100 text-slate-800 border-slate-300'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border flex items-center justify-center ${
                    selectedFilters.has('none') ? 'border-slate-600 bg-slate-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('none') && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </span>
                  Unclassified
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showTrialsOnly}
                  onChange={(e) => setShowTrialsOnly(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-neuro-500 focus:ring-neuro-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Show trials only
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-neuro-100 text-neuro-800 rounded">
                  {pearls.filter((p) => p.type === 'trial').length} trials
                </span>
              </label>
              <span className="text-sm text-slate-600">
                Showing <span className="font-semibold text-slate-900">{filteredCount}</span> of {totalCount} pearls
              </span>
            </div>
          </div>
        </div>

        {/* Pearl list */}
        <div className="overflow-y-auto h-full pb-20 p-4">
          <div className="space-y-3">
            {filteredPearls.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <svg
                  className="w-12 h-12 text-slate-300 mx-auto mb-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                  <line x1="2" y1="2" x2="22" y2="22" />
                </svg>
                <p className="text-base font-medium text-slate-600 mb-2">
                  No pearls match your filters
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Try adjusting evidence class filters or turn off "Show trials only".
                </p>
                <button
                  onClick={selectAllFilters}
                  className="px-4 py-2 bg-neuro-500 text-white text-sm font-medium rounded-lg hover:bg-neuro-600 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredPearls.map((pearl) => (
                <button
                  key={pearl.id}
                  onClick={() => {
                    // Track pearl open (best-effort; never block UX).
                    import('../../../utils/analytics').then(({ trackDeepLearningOpened }) => {
                      trackDeepLearningOpened(pearl.id, pearl.title);
                    }).catch(() => { /* noop */ });
                    setExpandedPearlId(pearl.id);
                  }}
                  className="w-full text-left p-4 bg-white rounded-lg border border-slate-200 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-base text-slate-900">
                        {pearl.title}
                      </h4>
                      <EvidenceBadge
                        evidenceClass={pearl.evidenceClass}
                        evidenceLevel={pearl.evidenceLevel}
                      />
                    </div>
                    {pearl.type && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded flex-shrink-0 ${
                          pearl.type === 'trial'
                            ? 'bg-neuro-100 text-neuro-800'
                            : pearl.type === 'guideline'
                              ? 'bg-neuro-50 text-neuro-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {pearl.type === 'trial' ? 'Trial' : pearl.type === 'guideline' ? 'Guideline' : 'Pearl'}
                      </span>
                    )}
                  </div>

                  <p className="mt-3 text-sm text-slate-700 leading-relaxed line-clamp-3">
                    {pearl.content}
                  </p>

                  {pearl.plainEnglish && (
                    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <div className="flex gap-2">
                        <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-900 leading-relaxed">
                          <span className="font-semibold">Key takeaway:</span> {pearl.plainEnglish}
                        </p>
                      </div>
                    </div>
                  )}

                  {pearl.evidence && (
                    <p className="mt-2 text-xs text-slate-500">
                      {pearl.evidence}
                    </p>
                  )}

                  <div className="mt-3 flex items-center gap-2 text-xs text-neuro-500 font-medium">
                    <span>Tap to expand</span>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pearl Detail Modal - Renders on top when pearl is expanded */}
      {expandedPearl && (
        <PearlDetailView
          pearl={expandedPearl}
          isOpen={!!expandedPearlId}
          onClose={onClose}
          onBack={handleBackToPearls}
        />
      )}
    </>
  );
};
