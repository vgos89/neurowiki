import React, { useState } from 'react';
import { Info, Award, FileText, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ClinicalPearl } from '../../../data/strokeClinicalPearls';

interface SectionPearlsProps {
  sectionId: string;
  quickPearls: ClinicalPearl[];
  deepPearls: ClinicalPearl[];
  isLearningMode: boolean;
  showOnDesktop?: boolean; // New prop
}

export const SectionPearls: React.FC<SectionPearlsProps> = ({
  sectionId,
  quickPearls,
  deepPearls,
  isLearningMode,
  showOnDesktop = false, // Default: hide on desktop
}) => {
  const [isDeepLearning, setIsDeepLearning] = useState(false);

  // Safety check: Return null if learning mode is off
  if (!isLearningMode) return null;

  // Safety check: Return null if pearls data is missing
  if (!quickPearls || !deepPearls) return null;

  // Safety check: Handle empty arrays
  const pearls = isDeepLearning ? deepPearls : quickPearls;
  if (!pearls || pearls.length === 0) return null;

  const getPearlIcon = (type: ClinicalPearl['type']) => {
    switch (type) {
      case 'trial':
        return <Award className="w-4 h-4 text-neuro-500" />;
      case 'guideline':
        return <FileText className="w-4 h-4 text-emerald-600" />;
      default:
        return <Info className="w-4 h-4 text-slate-500" />;
    }
  };

  const getPearlBadge = (type: ClinicalPearl['type']) => {
    switch (type) {
      case 'trial':
        return (
          <span className="px-2 py-0.5 bg-neuro-50 text-neuro-700 text-xs font-semibold rounded">
            TRIAL
          </span>
        );
      case 'guideline':
        return (
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded">
            GUIDELINE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-semibold rounded">
            PEARL
          </span>
        );
    }
  };

  return (
    <div className={`mt-6 bg-white border border-slate-100 rounded-xl p-4 ${
      !showOnDesktop ? 'lg:hidden' : ''
    }`}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Clinical Pearls
        </h3>

        {/* Quick vs Study Mode toggle. The internal state variable name
            `isDeepLearning` is preserved for analytics continuity (event
            `deep_learning_opened` already has ~3mo of historical data); only
            user-facing labels were renamed to "Study mode" (V call 2026-05-21). */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium transition-colors ${
            !isDeepLearning ? 'text-neuro-700' : 'text-slate-400'
          }`}>
            Quick
          </span>
          <button
            onClick={() => setIsDeepLearning(!isDeepLearning)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 ${
              isDeepLearning ? 'bg-neuro-500' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={isDeepLearning}
            aria-label="Toggle between quick and study mode"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDeepLearning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-medium transition-colors ${
            isDeepLearning ? 'text-neuro-700' : 'text-slate-400'
          }`}>
            Study
          </span>
        </div>
      </div>

      {/* Pearl Cards */}
      <div className="space-y-3">
        {pearls.map((pearl) => {
          // Safety check for pearl data
          if (!pearl || !pearl.id || !pearl.title || !pearl.content) return null;
          return (
            <div
              key={pearl.id}
              className="p-4 bg-white rounded-lg border border-slate-100 hover:shadow-md transition-shadow"
            >
              {/* Pearl Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getPearlIcon(pearl.type)}
                  <h4 className="text-sm font-semibold text-slate-900">
                    {pearl.title}
                  </h4>
                </div>
                {getPearlBadge(pearl.type)}
              </div>

              {/* Pearl Content */}
              <p className="text-sm text-slate-600 leading-[1.55] mb-2">
                {pearl.content}
              </p>

              {/* Evidence */}
              {pearl.evidence && (
                <div className="text-xs text-slate-400 mt-2 pt-2 border-t border-slate-100">
                  <span className="font-semibold">Evidence:</span> {pearl.evidence}
                </div>
              )}

              {/* Link */}
              {pearl.link && (
                <Link
                  to={pearl.link}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-neuro-50 hover:bg-neuro-100 text-xs font-semibold text-neuro-600 rounded-md transition-colors"
                >
                  <span>View Trial</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="mt-4 pt-3 border-t border-slate-100">
        <p className="text-xs text-slate-400 text-center">
          {isDeepLearning
            ? 'Study mode: full content with trials and citations'
            : 'Quick mode: essential clinical pearls for rapid review'}
        </p>
      </div>
    </div>
  );
};
