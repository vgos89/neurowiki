/**
 * PathwayMultiCheckRow — multi-select sibling of PathwayCategoryRow.
 *
 * Same visual chrome as PathwayCategoryRow (PATHWAY_SPEC §3.7 / §3.7.1) but
 * supports a Set of selected values. Used when a category accepts multiple
 * answers (e.g. SNNOOP10 red flags, associated migraine symptoms).
 *
 * Visual:
 *   - Resting collapsed: label-left, summary-right (slate-500 "X present" or
 *     "None present" when explicitly recorded). Chevron rotates on open.
 *   - Resting unselected: italic slate-400 "Tap to select" placeholder.
 *   - Expanded: inline accordion with two-line stacked chip toggles, each
 *     showing a 2px cobalt left bar when selected.
 *   - Completed step: cobalt left bar, neuro-50 bg, summary value shown.
 *
 * a11y: role="group" wraps the chips, aria-pressed on each toggle.
 */

import React, { useState, useCallback } from 'react';

export interface MultiCheckOption {
  value: string;
  label: string;
  description?: string;
}

export interface PathwayMultiCheckRowProps {
  label: string;
  options: MultiCheckOption[];
  values: Set<string>;
  onChange: (values: Set<string>) => void;
  /** Whether the user has confirmed an empty selection (records "None present"). */
  explicitlyNone?: boolean;
  /** Called when the user taps the "None present" affordance. */
  onMarkNone?: () => void;
  stepCompleted?: boolean;
  locked?: boolean;
  defaultOpen?: boolean;
  /** Optional summary builder. Defaults to "{N} present" or "None present". */
  summary?: (values: Set<string>, explicitlyNone: boolean) => string;
}

const ChevronDown: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    width="16" height="16" viewBox="0 0 20 20" fill="none"
    stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true"
  >
    <polyline points="6 8 10 12 14 8" />
  </svg>
);

const defaultSummary = (values: Set<string>, explicitlyNone: boolean): string => {
  if (explicitlyNone) return 'None present';
  if (values.size === 0) return '';
  if (values.size === 1) return '1 present';
  return `${values.size} present`;
};

export const PathwayMultiCheckRow: React.FC<PathwayMultiCheckRowProps> = ({
  label,
  options,
  values,
  onChange,
  explicitlyNone = false,
  onMarkNone,
  stepCompleted = false,
  locked = false,
  defaultOpen = false,
  summary = defaultSummary,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleToggle = useCallback(() => {
    if (!locked) setIsOpen((prev) => !prev);
  }, [locked]);

  const toggleValue = useCallback(
    (v: string) => {
      const next = new Set(values);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      onChange(next);
    },
    [values, onChange],
  );

  if (locked) return null;

  const summaryText = summary(values, explicitlyNone);
  const hasAnyValue = values.size > 0 || explicitlyNone;

  // Completed state — cobalt left bar, neuro-50 bg, still tappable
  if (stepCompleted && hasAnyValue) {
    return (
      <button
        type="button"
        onClick={handleToggle}
        className="w-full text-left px-4 py-3 border-l-2 border-neuro-500 bg-neuro-50 rounded-r-lg min-h-[44px] flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors"
      >
        <span className="text-sm font-semibold text-neuro-700">{label}</span>
        <span className="text-sm text-neuro-700 opacity-75 truncate">{summaryText}</span>
      </button>
    );
  }

  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        type="button"
        onClick={handleToggle}
        aria-expanded={isOpen}
        className="w-full text-left px-0 py-3 min-h-[44px] flex items-center justify-between gap-3 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none active:scale-[0.98] transform-gpu touch-manipulation transition-colors hover:bg-slate-50 rounded-lg"
      >
        <span className="text-[0.9375rem] font-medium text-slate-900">{label}</span>
        <span className="flex items-center gap-1.5 flex-shrink-0">
          {hasAnyValue ? (
            <span className="text-sm text-slate-500">{summaryText}</span>
          ) : (
            <span className="text-sm italic text-slate-400">Tap to select</span>
          )}
          <ChevronDown
            className={`text-slate-400 motion-safe:transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen && (
        <div className="px-1 pb-3 pt-1 space-y-1" role="group" aria-label={label}>
          {options.map((opt) => {
            const selected = values.has(opt.value);
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleValue(opt.value)}
                className={`
                  w-full text-left rounded-lg px-3 py-2 min-h-[44px]
                  flex flex-col items-start gap-0.5
                  transition-colors touch-manipulation
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                  ${selected
                    ? 'border-l-2 border-neuro-500 bg-neuro-50/40 pl-[10px]'
                    : 'hover:bg-slate-50'}
                `}
              >
                <span className={`text-sm ${selected ? 'text-neuro-700 font-medium' : 'text-slate-700'}`}>
                  {opt.label}
                </span>
                {opt.description && (
                  <span className="text-[11px] text-slate-500 leading-relaxed">
                    {opt.description}
                  </span>
                )}
              </button>
            );
          })}

          {/* "None present" affordance — separate primary action, not mixed in */}
          {onMarkNone && (
            <button
              type="button"
              onClick={() => {
                onChange(new Set());
                onMarkNone();
                setIsOpen(false);
              }}
              className={`
                w-full text-left rounded-lg px-3 py-2 min-h-[44px]
                flex items-center justify-between
                border-t border-slate-100 mt-2 pt-3
                transition-colors touch-manipulation
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                ${explicitlyNone ? 'bg-emerald-50/40 border-l-2 border-emerald-500 pl-[10px]' : 'hover:bg-slate-50'}
              `}
            >
              <span className={`text-sm font-medium ${explicitlyNone ? 'text-emerald-700' : 'text-slate-700'}`}>
                None of the above
              </span>
              {explicitlyNone && (
                <span className="text-[11px] text-emerald-700">Selected</span>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default PathwayMultiCheckRow;
