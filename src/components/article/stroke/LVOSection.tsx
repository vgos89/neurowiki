import React from 'react';
import { LVOScreenerV2 } from './LVOScreenerV2';

interface LVOSectionProps {
  onComplete?: () => void;
  isLearningMode?: boolean;
  onCorticalSignsYes?: () => void;
}

export const LVOSection: React.FC<LVOSectionProps> = ({ onComplete, isLearningMode = false, onCorticalSignsYes }) => {
  return (
    <div className="space-y-4">
      {isLearningMode && (
        <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-lg text-slate-600">psychology</span>
            <p className="text-sm text-slate-700 leading-relaxed">
              Screen for LVO using cortical signs (aphasia, neglect, gaze deviation, hemianopia). LVO patients benefit from thrombectomy up to 24h with appropriate imaging; RACE/FAST-ED can quantify probability.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <LVOScreenerV2 onCorticalSignsYes={onCorticalSignsYes} />
      </div>
    </div>
  );
};
