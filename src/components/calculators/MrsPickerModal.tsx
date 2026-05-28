import React from 'react';
import { X } from 'lucide-react';
import type { MRSGrade } from '../shared/PatientContextPanel';

interface MrsPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  value: MRSGrade | undefined;
  onChange: (grade: MRSGrade | undefined) => void;
}

const GRADES: { grade: MRSGrade; label: string; sublabel: string }[] = [
  { grade: 0, label: 'No symptoms',                sublabel: 'Fully active, no restrictions' },
  { grade: 1, label: 'No significant disability',  sublabel: 'Symptoms present but manages all usual activities' },
  { grade: 2, label: 'Slight disability',           sublabel: 'Cannot manage all previous activities, but independent' },
  { grade: 3, label: 'Moderate disability',         sublabel: 'Needs some help, but walks without physical assistance' },
  { grade: 4, label: 'Moderately severe disability',sublabel: 'Cannot walk or manage personal care without assistance' },
  { grade: 5, label: 'Severe disability',           sublabel: 'Bedridden, incontinent, needs constant nursing care' },
  { grade: 6, label: 'Dead',                        sublabel: '' },
];

export const MrsPickerModal: React.FC<MrsPickerModalProps> = ({
  isOpen,
  onClose,
  value,
  onChange,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">Pre-stroke mRS</p>
            <p className="text-xs text-slate-400 mt-0.5">Baseline function before this event</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 -mr-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
            aria-label="Close"
          >
            <X className="w-4 h-4" aria-hidden />
          </button>
        </div>

        {/* Grade list */}
        <div className="divide-y divide-slate-200">
          {GRADES.map((g) => {
            const isSelected = value === g.grade;
            return (
              <button
                key={g.grade}
                type="button"
                onClick={() => onChange(isSelected ? undefined : g.grade)}
                className={
                  isSelected
                    ? 'selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left'
                    : 'w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 transition-colors'
                }
              >
                <span className="flex-1 min-w-0 pr-3">
                  <span className={isSelected ? 'block font-semibold' : 'block font-medium text-slate-900'}>
                    {g.label}
                  </span>
                  {g.sublabel && (
                    <span className={`block text-xs mt-0.5 leading-snug ${isSelected ? 'opacity-75' : 'text-slate-400'}`}>
                      {g.sublabel}
                    </span>
                  )}
                </span>
                <span className={isSelected ? 'text-sm font-medium opacity-75 flex-shrink-0' : 'text-sm text-slate-400 flex-shrink-0'}>
                  {g.grade}
                </span>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <button
          type="button"
          onClick={onClose}
          className="w-full bg-neuro-500 hover:bg-neuro-600 text-white py-3 text-sm font-medium transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
};
