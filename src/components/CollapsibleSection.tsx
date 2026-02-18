import React from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface CollapsibleSectionProps {
  title: string;
  stepNumber: number;
  totalSteps: number;
  isCompleted: boolean;
  isActive: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  summary?: string; // Shows selected value when collapsed
  icon?: React.ReactNode; // Optional icon shown in step badge when active
  accentClass?: string; // Optional color override for active step badge e.g. "bg-teal-100 text-teal-600"
}

export const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  stepNumber,
  totalSteps,
  isCompleted,
  isActive,
  onToggle,
  children,
  summary,
  icon,
  accentClass,
}) => {
  return (
    <div
      className={[
        'border rounded-lg overflow-hidden',
        isActive ? 'border-neuro-200 bg-white shadow-sm' : 'border-slate-200 bg-slate-50/50',
      ].join(' ')}
    >
      {/* Header - Always visible */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isActive}
        className={[
          'w-full flex items-center justify-between',
          'p-4',
          'text-left',
          'hover:bg-slate-50',
          'transition-colors duration-150',
          'touch-manipulation',
          'min-h-[44px]',
          'focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none',
        ].join(' ')}
      >
        <div className="flex items-center gap-3">
          {/* Step indicator */}
          <div
            className={[
              'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0',
              isCompleted
                ? 'bg-emerald-100 text-emerald-600'
                : isActive
                  ? (accentClass ?? 'bg-neuro-100 text-neuro-500')
                  : 'bg-slate-200 text-slate-500',
            ].join(' ')}
            aria-label={`Step ${stepNumber} of ${totalSteps}`}
          >
            {isCompleted ? <Check className="w-4 h-4" /> : (isActive && icon) ? icon : stepNumber}
          </div>

          {/* Title and summary */}
          <div className="min-w-0">
            <span className={['text-sm font-semibold', isActive ? 'text-slate-900' : 'text-slate-700'].join(' ')}>
              {title}
            </span>
            {!isActive && summary && (
              <p className="text-xs text-slate-500 mt-0.5 truncate">{summary}</p>
            )}
          </div>
        </div>

        {/* Chevron */}
        <ChevronDown
          className={[
            'w-5 h-5 text-slate-400 shrink-0',
            'transition-transform duration-150',
            isActive ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {/* Content - Collapsible */}
      <div className={isActive ? 'block' : 'hidden'}>
        <div className="px-4 pb-4 pt-2">{children}</div>
      </div>
    </div>
  );
};

export default CollapsibleSection;
