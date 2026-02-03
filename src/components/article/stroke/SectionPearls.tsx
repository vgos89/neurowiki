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
        return <Award className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'guideline':
        return <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />;
      default:
        return <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
    }
  };

  const getPearlBadge = (type: ClinicalPearl['type']) => {
    switch (type) {
      case 'trial':
        return (
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
            TRIAL
          </span>
        );
      case 'guideline':
        return (
          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
            GUIDELINE
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded">
            PEARL
          </span>
        );
    }
  };

  return (
    <div className={`mt-6 p-6 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800 ${
      !showOnDesktop ? 'lg:hidden' : '' // Hide on desktop (lg and up) unless showOnDesktop=true
    }`}>
      {/* Header with Toggle */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-purple-200 dark:border-purple-800">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          Clinical Pearls
        </h3>
        
        {/* Quick vs Deep Toggle */}
        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium transition-colors ${
            !isDeepLearning ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'
          }`}>
            Quick
          </span>
          <button
            onClick={() => setIsDeepLearning(!isDeepLearning)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isDeepLearning ? 'bg-purple-600' : 'bg-gray-300 dark:bg-gray-600'
            }`}
            role="switch"
            aria-checked={isDeepLearning}
            aria-label="Toggle between quick and deep learning"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isDeepLearning ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-xs font-medium transition-colors ${
            isDeepLearning ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'
          }`}>
            Deep
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
              className="p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all hover:scale-[1.01]"
            >
              {/* Pearl Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getPearlIcon(pearl.type)}
                  <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                    {pearl.title}
                  </h4>
                </div>
                {getPearlBadge(pearl.type)}
              </div>

              {/* Pearl Content */}
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-2">
                {pearl.content}
              </p>

              {/* Evidence */}
              {pearl.evidence && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-2 pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="font-semibold">Evidence:</span> {pearl.evidence}
                </div>
              )}

              {/* Link */}
              {pearl.link && (
                <Link
                  to={pearl.link}
                  className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-xs font-semibold text-blue-600 dark:text-blue-400 rounded-md transition-colors"
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
      <div className="mt-4 pt-3 border-t-2 border-purple-200 dark:border-purple-800">
        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          {isDeepLearning 
            ? '🔬 Deep Learning Mode: Comprehensive evidence-based content with trials and citations' 
            : '⚡ Quick Learning Mode: Essential clinical pearls for rapid review'}
        </p>
      </div>
    </div>
  );
};
