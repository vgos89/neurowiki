import React from 'react';
import { X } from 'lucide-react';
import type { ClinicalPearl } from '../../../data/strokeClinicalPearls';
import { PearlDetailView } from './PearlDetailView';

const getEvidenceBadgeColors = (evidenceClass?: string) => {
  switch (evidenceClass) {
    case 'I':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'IIa':
      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'IIb':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
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

  // Close on escape key
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedPearlId(null);
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

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
        className="fixed inset-0 bg-black/40 z-40 transition-opacity"
        onClick={onClose}
      />

      <div className="fixed bg-white shadow-2xl z-50 lg:top-0 lg:right-0 lg:h-screen lg:w-[400px] bottom-0 left-0 right-0 h-[90vh] lg:h-screen rounded-t-2xl lg:rounded-none overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b-2 border-purple-200 p-4 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>

          <div className="pr-12">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              🔬 Deep Learning
            </h3>
            <p className="text-sm font-bold text-gray-900 mt-1">
              {sectionTitle}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {pearls.length} {pearls.length === 1 ? 'pearl' : 'pearls'} • Evidence-based
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
                    className="text-xs font-medium text-blue-600 hover:underline"
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
                      ? 'bg-green-100 text-green-800 border-green-300'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedFilters.has('I') ? 'border-green-600 bg-green-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('I') && <span className="material-icons-outlined text-white text-[10px]">check</span>}
                  </span>
                  Class I
                  <span className="text-[10px] font-normal opacity-75">Strong</span>
                </button>

                <button
                  onClick={() => toggleFilter('IIa')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('IIa')
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedFilters.has('IIa') ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('IIa') && <span className="material-icons-outlined text-white text-[10px]">check</span>}
                  </span>
                  Class IIa
                  <span className="text-[10px] font-normal opacity-75">Moderate</span>
                </button>

                <button
                  onClick={() => toggleFilter('IIb')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border rounded-lg transition-all ${
                    selectedFilters.has('IIb')
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                      : 'bg-white text-slate-400 border-slate-300 opacity-50'
                  }`}
                >
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedFilters.has('IIb') ? 'border-yellow-600 bg-yellow-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('IIb') && <span className="material-icons-outlined text-white text-[10px]">check</span>}
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
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedFilters.has('III') ? 'border-red-600 bg-red-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('III') && <span className="material-icons-outlined text-white text-[10px]">check</span>}
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
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                    selectedFilters.has('none') ? 'border-slate-600 bg-slate-600' : 'border-slate-300'
                  }`}>
                    {selectedFilters.has('none') && <span className="material-icons-outlined text-white text-[10px]">check</span>}
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
                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  Show trials only
                </span>
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-800 rounded">
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
                <span className="material-icons-outlined block text-5xl text-slate-300 mb-4">
                  filter_alt_off
                </span>
                <p className="text-base font-medium text-slate-600 mb-2">
                  No pearls match your filters
                </p>
                <p className="text-sm text-slate-500 mb-4">
                  Try adjusting evidence class filters or turn off “Show trials only”.
                </p>
                <button
                  onClick={selectAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredPearls.map((pearl) => (
                <button
                  key={pearl.id}
                  onClick={() => setExpandedPearlId(pearl.id)}
                  className="w-full text-left p-4 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg border border-purple-200 hover:shadow-md transition-all hover:scale-[1.01] cursor-pointer"
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
                            ? 'bg-purple-100 text-purple-800'
                            : pearl.type === 'guideline'
                              ? 'bg-blue-100 text-blue-800'
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
                        <span className="material-icons-outlined text-sm text-amber-600 mt-0.5 flex-shrink-0">
                          lightbulb
                        </span>
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

                  <div className="mt-3 flex items-center gap-2 text-xs text-purple-600 font-medium">
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
