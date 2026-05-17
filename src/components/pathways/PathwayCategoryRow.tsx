/**
 * PathwayCategoryRow — iOS-Settings-style accordion option row.
 *
 * Implements the §3.7 / §3.7.1 category-row anatomy from PATHWAY_SPEC.md v1.4:
 * - Resting: label left, selected value + chevron right
 * - Unselected: "Tap to select" italic slate-400 placeholder + neuro-300 chevron
 * - Expanded: inline accordion with two-line stacked option buttons (§3.7.1)
 * - Completed-step: cobalt left bar, neuro-50 bg, value displayed, still tappable
 *
 * Design tokens: neuro-500 cobalt selection bar, slate-200 hairline dividers,
 * slate-400/slate-500 text hierarchy, neuro-300 unselected chevron.
 *
 * a11y: aria-expanded on accordion trigger, keyboard Enter/Space toggles.
 */

import React, { useState, useCallback } from 'react';

export interface CategoryOption {
  value: string;
  label: string;
  /** Optional 11px description below the label (two-line stacked per §3.7.1). */
  description?: string;
}

export interface PathwayCategoryRowProps {
  /** Field label shown on the left of the collapsed row. */
  label: string;
  /** All options in this category. */
  options: CategoryOption[];
  /** Currently selected value (matched against option.value). */
  value: string | null;
  /** Callback when a value is selected. */
  onChange: (value: string) => void;
  /**
   * Whether the parent step is in "completed" state.
   * Completed rows render with cobalt styling and remain tappable.
   */
  stepCompleted?: boolean;
  /**
   * Whether the parent step is "locked" (upstream step not done).
   * Locked rows render nothing — the parent PathwayRailStep handles the placeholder.
   */
  locked?: boolean;
  /** Whether this row is initially open. */
  defaultOpen?: boolean;
}

const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    className={className}
    aria-hidden="true"
  >
    <polyline points="6 8 10 12 14 8" />
  </svg>
);

export const PathwayCategoryRow: React.FC<PathwayCategoryRowProps> = ({
  label,
  options,
  value,
  onChange,
  stepCompleted = false,
  locked = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const selectedOption = options.find((o) => o.value === value) ?? null;

  const handleToggle = useCallback(() => {
    if (!locked) setIsOpen((prev) => !prev);
  }, [locked]);

  const handleSelect = useCallback(
    (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
    },
    [onChange]
  );

  if (locked) return null;

  // Completed state — cobalt left bar, neuro-50 bg, still tappable
  if (stepCompleted && selectedOption) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="w-full text-left px-4 py-3 border-l-2 border-neuro-500 bg-neuro-50 rounded-r-lg min-h-[44px] flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
      >
        <span className="text-sm font-semibold text-neuro-700">{label}</span>
        <span className="text-sm text-neuro-700 opacity-75 truncate">{selectedOption.label}</span>
      </button>
    );
  }

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      {/* Collapsed row trigger */}
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-0 py-3 min-h-[44px] flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors hover:bg-slate-50 rounded-lg"
      >
        <span className="text-[0.9375rem] font-medium text-slate-900">{label}</span>
        <span className="flex items-center gap-1.5 flex-shrink-0">
          {selectedOption ? (
            <span className="text-sm text-slate-500">{selectedOption.label}</span>
          ) : (
            <span className="text-sm italic text-slate-400">Tap to select</span>
          )}
          <ChevronDown
            className={`transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            } ${selectedOption ? 'text-slate-400' : 'text-neuro-300'}`}
          />
        </span>
      </button>

      {/* Expanded accordion */}
      {isOpen && (
        <div className="pb-2 space-y-0.5 animate-in slide-in-from-top-1 duration-150">
          {options.map((option) => {
            const isSelected = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`
                  w-full flex flex-col items-start text-left rounded-lg min-h-[44px]
                  px-3 py-2.5 gap-0.5 transition-colors duration-100
                  focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
                  active:scale-[0.98] transform-gpu touch-manipulation
                  ${
                    isSelected
                      ? 'border-l-2 border-neuro-500 bg-neuro-50'
                      : 'hover:bg-slate-50 border-l-2 border-transparent'
                  }
                `}
              >
                <span
                  className={`text-sm font-medium leading-snug ${
                    isSelected ? 'text-neuro-800' : 'text-slate-700'
                  }`}
                >
                  {option.label}
                </span>
                {option.description && (
                  <span
                    className={`text-[11px] leading-snug ${
                      isSelected ? 'text-neuro-600' : 'text-slate-400'
                    }`}
                  >
                    {option.description}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PathwayCategoryRow;
