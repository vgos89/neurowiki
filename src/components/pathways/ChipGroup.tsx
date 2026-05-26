/**
 * ChipGroup — accessible multi-select chip selector for pathway feature pickers.
 *
 * Generic at the UI layer (no headache types in signature). First consumer:
 * ClinicHeadachePathway. Designed to be reusable by future diagnostic pathways
 * (vertigo, weakness, AMS) per system-architect plan-review guidance.
 *
 * Accessibility:
 *   - role="group" + aria-labelledby for the group container
 *   - Each chip is an aria-pressed toggle button (button role, not checkbox)
 *   - Keyboard: tab to enter, space/enter to toggle, focus ring on each chip
 *   - Collapsible: a <details>/<summary> when defaultCollapsed is set
 *
 * Design tokens: bg-white border-slate-200 unselected; bg-neuro-50
 * border-neuro-500 text-neuro-700 selected. Min-height 44px per
 * CALCULATOR_SPEC touch-target rule.
 */

import React from 'react';

export interface ChipGroupChip {
  id: string;
  label: string;
  /** Optional teaching microcopy shown only when Teach mode is on and chip is selected. */
  teachWhenSelected?: string;
}

export interface ChipGroupProps {
  /** Stable id used for aria-labelledby. */
  groupId: string;
  /** Group label (visible heading). */
  label: string;
  /** Eyebrow text shown only in Teach mode (why we ask this group). */
  eyebrow?: string;
  /** Chips to render. */
  chips: ChipGroupChip[];
  /** Set of currently-selected chip ids. */
  selected: Set<string>;
  /** Called when a chip is toggled. */
  onChange: (chipId: string, nowSelected: boolean) => void;
  /** Whether the group renders inside a collapsible details/summary. */
  defaultCollapsed?: boolean;
  /** Teach mode flag (page reads from useTeachMode and prop-drills). */
  teachMode?: boolean;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  groupId,
  label,
  eyebrow,
  chips,
  selected,
  onChange,
  defaultCollapsed = false,
  teachMode = false,
}) => {
  const labelId = `chip-group-${groupId}-label`;
  const selectedCount = chips.filter(c => selected.has(c.id)).length;

  const body = (
    <div role="group" aria-labelledby={labelId} className="space-y-2">
      {teachMode && eyebrow && (
        <p className="text-[12px] text-slate-500 leading-relaxed italic">
          {eyebrow}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {chips.map(chip => {
          const isSelected = selected.has(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              role="button"
              aria-pressed={isSelected}
              onClick={() => onChange(chip.id, !isSelected)}
              className={`
                rounded-full border px-3 py-2 text-[13px] font-medium min-h-[44px]
                transition-all touch-manipulation
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                ${isSelected
                  ? 'bg-neuro-50 border-neuro-500 text-neuro-700'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-neuro-200 hover:bg-slate-50'}
              `}
            >
              {chip.label}
            </button>
          );
        })}
      </div>
      {teachMode && (
        <div className="space-y-1 mt-1">
          {chips
            .filter(c => selected.has(c.id) && c.teachWhenSelected)
            .map(c => (
              <p key={`teach-${c.id}`} className="text-[11px] text-neuro-700 leading-relaxed pl-2 border-l-2 border-neuro-300">
                <span className="font-semibold">{c.label}:</span> {c.teachWhenSelected}
              </p>
            ))}
        </div>
      )}
    </div>
  );

  if (defaultCollapsed) {
    return (
      <details className="rounded-xl border border-slate-100 bg-white" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
        <summary
          className="
            flex items-center justify-between gap-3 px-4 py-3 cursor-pointer list-none select-none min-h-[44px]
            focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
            hover:bg-slate-50 transition-colors touch-manipulation
          "
        >
          <span id={labelId} className="text-[14px] font-semibold text-slate-900">
            {label}
            {selectedCount > 0 && (
              <span className="ml-2 inline-flex items-center justify-center text-[11px] font-bold text-neuro-700 bg-neuro-100 rounded-full px-2 py-0.5 min-w-[20px]">
                {selectedCount}
              </span>
            )}
          </span>
          <svg
            width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor"
            strokeWidth="2"
            className="text-slate-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none flex-shrink-0"
            aria-hidden="true"
          >
            <polyline points="6 8 10 12 14 8" />
          </svg>
        </summary>
        <div className="px-4 pb-4 pt-2 border-t border-slate-100">{body}</div>
      </details>
    );
  }

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4" style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.06)' }}>
      <h3 id={labelId} className="text-[14px] font-semibold text-slate-900 mb-3">
        {label}
        {selectedCount > 0 && (
          <span className="ml-2 inline-flex items-center justify-center text-[11px] font-bold text-neuro-700 bg-neuro-100 rounded-full px-2 py-0.5 min-w-[20px]">
            {selectedCount}
          </span>
        )}
      </h3>
      {body}
    </div>
  );
};

export default ChipGroup;
