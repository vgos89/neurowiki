/**
 * PathwayBranchChip — tap-targetable summary chip between completed steps.
 *
 * Implements PATHWAY_SPEC.md §3.4 branch-chip anatomy.
 * Visual: small pill (11px text, slate-50 bg, rounded-full).
 * Interactive: <button> with 44×44 hit target via p-3 -m-3 wrapper.
 * Hover: slate-100 bg + neuro-200 ring.
 *
 * ARCH-6 prop contract: uses `targetFieldId` (NOT targetStepIndex).
 * The chip tap scrolls to the field that produced the branch, not
 * to the step boundary — per the v4-1 adjacency requirement.
 *
 * Design tokens: slate-50/100/600 neutral, neuro-200 hover ring.
 */

import React from 'react';

export interface PathwayBranchChipProps {
  /**
   * The DOM ID of the field that produced this branch decision.
   * Used by the parent (EvtPathway) to scroll into view and open the
   * relevant accordion on chip-tap. ARCH-6: NOT targetStepIndex.
   */
  targetFieldId: string;
  /** Human-readable label summarizing the upstream decision. */
  label: string;
  /** Callback fired when the chip is activated. */
  onClick: () => void;
}

export const PathwayBranchChip: React.FC<PathwayBranchChipProps> = ({
  label,
  onClick,
}) => {
  return (
    /* Hit-target wrapper: p-3 -m-3 expands tap area to 44×44 without
       affecting the visual pill size. See PATHWAY_SPEC §3.4 and §8. */
    <div className="inline-block p-3 -m-3">
      <button
        type="button"
        onClick={onClick}
        aria-label={`Edit: ${label}`}
        className={`
          text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full
          inline-block cursor-pointer transition-colors duration-100
          hover:bg-slate-100 hover:text-slate-900 hover:ring-1 hover:ring-neuro-200
          focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
          active:scale-[0.98] transform-gpu touch-manipulation
        `}
      >
        {label}
      </button>
    </div>
  );
};

export default PathwayBranchChip;
