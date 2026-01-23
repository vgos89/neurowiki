import React from 'react';
import { Check } from 'lucide-react';

interface SelectionCardProps {
  label: string;
  value: string | number;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  score?: number;
}

export const SelectionCard: React.FC<SelectionCardProps> = ({
  label,
  description,
  isSelected,
  onClick,
  score,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isSelected}
      className={[
        'w-full text-left p-3 rounded-lg border-2',
        'touch-manipulation min-h-[44px]',
        'transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none',
        isSelected
          ? 'border-neuro-500 bg-neuro-50'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50',
      ].join(' ')}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <span className={['text-sm font-medium', isSelected ? 'text-teal-500' : 'text-slate-700'].join(' ')}>
            {label}
          </span>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>

        <div className="flex items-center gap-2">
          {score !== undefined && (
            <span
              className={[
                'text-xs font-bold px-2 py-0.5 rounded',
                isSelected ? 'bg-neuro-100 text-teal-500' : 'bg-slate-100 text-slate-500',
              ].join(' ')}
            >
              {score}
            </span>
          )}
          {isSelected && <Check className="w-4 h-4 text-neuro-600" />}
        </div>
      </div>
    </button>
  );
};

export default SelectionCard;
