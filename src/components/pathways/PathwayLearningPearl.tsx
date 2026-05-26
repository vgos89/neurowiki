/**
 * PathwayLearningPearl — inline collapsible pearl block.
 *
 * ARCH-5: pearl content stays inline (not extracted to a data array).
 * PATHWAY_SPEC §4.5: default-closed <details>; max 2 per active step.
 * V4-2: pearls appear only after the second field in a step is answered,
 *       controlled by the parent via the `visible` prop.
 *
 * a11y: :focus-visible ring on the summary toggle per round-7 audit.
 * prefers-reduced-motion: collapses transition to ≤0.01ms.
 *
 * Design tokens: slate-50 bg, slate-200 border, neuro-500 accent on title.
 */

import React from 'react';

export interface PathwayLearningPearlProps {
  title: string;
  content: React.ReactNode;
  /**
   * Controls visibility — V4-2: parent gates pearl display until second
   * field in the step is answered, preventing layout-shift-on-first-tap.
   * Defaults to true so existing callers that omit this prop still work.
   */
  visible?: boolean;
  /** data-claim attribute for JSX-phase claim tagging (CLAUDE.md §13.4). */
  claimId?: string;
  /**
   * When true, the pearl only renders if Teach mode is on. Used by
   * ClinicHeadachePathway for "Learn this pattern" pedagogy pearls that
   * are educational, not clinical, and should be hidden in tool mode.
   * Default false (existing callers unaffected).
   */
  teachOnly?: boolean;
  /**
   * Current Teach mode state. Only consulted when teachOnly is true.
   * Read from useTeachMode() at the page level and prop-drilled.
   */
  teachMode?: boolean;
}

export const PathwayLearningPearl: React.FC<PathwayLearningPearlProps> = ({
  title,
  content,
  visible = true,
  claimId,
  teachOnly = false,
  teachMode = false,
}) => {
  if (!visible) return null;
  if (teachOnly && !teachMode) return null;

  return (
    <details
      className="group rounded-xl border border-slate-100 bg-slate-50 overflow-hidden"
      {...(claimId ? { 'data-claim': claimId } : {})}
    >
      <summary
        className={`
          flex items-center justify-between gap-3 px-4 py-3 cursor-pointer
          list-none select-none min-h-[44px]
          focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
          hover:bg-slate-100 transition-colors touch-manipulation
          active:scale-[0.98] transform-gpu motion-reduce:transition-none
        `}
      >
        <div className="flex items-center gap-2">
          {/* Lightbulb icon — pearl visual identifier (PATHWAY_SPEC §4.5).
              Inline SVG matches STEP_ICONS convention in PathwayRail.tsx
              (avoids new lucide import). */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-neuro-500 flex-shrink-0"
            aria-hidden="true"
          >
            <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
            <path d="M9 18h6" />
            <path d="M10 22h4" />
          </svg>
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {title}
          </span>
        </div>
        {/* Chevron rotates when open */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-slate-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none flex-shrink-0"
          aria-hidden="true"
        >
          <polyline points="6 8 10 12 14 8" />
        </svg>
      </summary>

      <div className="px-4 pb-4 pt-2 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
        {content}
      </div>
    </details>
  );
};

export default PathwayLearningPearl;
