import React from 'react';
import { EligibilityCheckerV2 } from './EligibilityCheckerV2';

interface LKWSectionProps {
  onComplete?: () => void;
  isLearningMode?: boolean;
  onOutsideWindow?: (hoursElapsed: number) => void;
}

export const LKWSection: React.FC<LKWSectionProps> = ({ onComplete, isLearningMode = false, onOutsideWindow }) => {
  return (
    <div className="space-y-4">
      {isLearningMode && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <span className="material-icons-outlined text-lg text-slate-600 dark:text-slate-400">schedule</span>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              Establish last known well time—determines eligibility for IV thrombolysis (≤4.5h) and thrombectomy (up to 24h with imaging). Verify with family or records; use the most conservative estimate if unknown.
            </p>
          </div>
        </div>
      )}

      <div className="mt-4">
        <EligibilityCheckerV2 onOutsideWindow={onOutsideWindow} />
      </div>
    </div>
  );
};
