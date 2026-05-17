/**
 * PathwayRail — vertical connector rail for Pattern A pathway pages.
 *
 * Renders the left-border rail segment (cobalt traversed / slate untraversed)
 * and a step node (filled cobalt / hollow cobalt ring / slate-300 hollow) with
 * an inline step eyebrow label and step icon.
 *
 * ARCH-bonus: STEP_ICONS constant is colocated here; consumers pass
 * iconKey: 'triage' | 'clinical' | 'imaging' | 'decision'. No separate
 * PathwayStepIcon.tsx file.
 *
 * Design contract: PATHWAY_SPEC.md §3.1 (rail), §3.2 (nodes), §3.3 (eyebrow).
 * Tokens: design-tokens skill — neuro-500 cobalt, slate-300 slate, slate-400 label.
 */

import React from 'react';

// ─── Step icon SVGs ─────────────────────────────────────────────────────────
// Bare inline SVGs. All text-slate-500. No lucide imports here — bare SVG
// avoids the bundle cost for 4 small paths.
export const STEP_ICONS: Record<string, React.ReactElement> = {
  triage: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* UserCheck */}
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <polyline points="16 11 18 13 22 9" />
    </svg>
  ),
  clinical: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Clock */}
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  imaging: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* ScanLine */}
      <path d="M3 7V5a2 2 0 0 1 2-2h2" />
      <path d="M17 3h2a2 2 0 0 1 2 2v2" />
      <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
      <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
      <line x1="7" y1="12" x2="17" y2="12" />
    </svg>
  ),
  decision: (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* ListChecks */}
      <line x1="10" y1="6" x2="21" y2="6" />
      <line x1="10" y1="12" x2="21" y2="12" />
      <line x1="10" y1="18" x2="21" y2="18" />
      <polyline points="3 6 4 7 6 5" />
      <polyline points="3 12 4 13 6 11" />
      <polyline points="3 18 4 19 6 17" />
    </svg>
  ),
};

// ─── Node state types ────────────────────────────────────────────────────────

export type PathwayNodeState = 'completed' | 'active' | 'locked';

export interface PathwayRailStepProps {
  /**
   * Step number (1-indexed) for eyebrow label.
   */
  stepNumber: number;
  /**
   * Short step title in ALL CAPS, e.g. "TRIAGE", "CLINICAL".
   * The eyebrow renders as: STEP N · TITLE.
   */
  title: string;
  /** Icon key — one of the 4 supported icons in STEP_ICONS. */
  iconKey: 'triage' | 'clinical' | 'imaging' | 'decision';
  /** Node visual state. */
  nodeState: PathwayNodeState;
  /**
   * Whether the rail segment ABOVE this node (i.e., between the
   * previous step's node and this one) is traversed (cobalt) or not.
   * For step 1, this is always false (no rail above the first node).
   */
  segmentAboveTraversed?: boolean;
  /** Content rendered in the step body (below the eyebrow row). */
  children: React.ReactNode;
  /**
   * aria-label for the step container when locked.
   * E.g. "Step 2, locked, awaiting completion of Step 1".
   */
  lockedAriaLabel?: string;
}

/**
 * PathwayRail renders a single step block in the vertical rail:
 *   [cobalt/slate segment] ─ [node dot] ─ [eyebrow + icon] ─ [children]
 *
 * The rail is implemented as a left-border on the content wrapper per
 * PATHWAY_SPEC §3.1. The node uses negative margin-left to center on the rail.
 */
export const PathwayRailStep: React.FC<PathwayRailStepProps> = ({
  stepNumber,
  title,
  iconKey,
  nodeState,
  segmentAboveTraversed = false,
  children,
  lockedAriaLabel,
}) => {
  const isLocked = nodeState === 'locked';
  const isCompleted = nodeState === 'completed';
  const isActive = nodeState === 'active';

  // Node classes
  const nodeClass = isCompleted
    ? 'w-3 h-3 bg-neuro-500 rounded-full flex-shrink-0'
    : isActive
    ? 'w-3 h-3 border-2 border-neuro-500 bg-white rounded-full flex-shrink-0'
    : 'w-2.5 h-2.5 border border-slate-300 bg-white rounded-full flex-shrink-0';

  // Eyebrow label classes
  const eyebrowClass = isLocked
    ? 'text-[10px] font-bold text-slate-400/50 uppercase tracking-widest'
    : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest';

  // Icon color
  const iconColorClass = isLocked ? 'text-slate-300' : 'text-slate-500';

  // Above-segment color (cobalt if previous step completed, slate otherwise)
  const aboveSegmentColor = segmentAboveTraversed ? 'bg-neuro-500' : 'bg-slate-200';
  // Below-segment color (cobalt if THIS step completed, slate otherwise)
  const belowSegmentColor = isCompleted ? 'bg-neuro-500' : 'bg-slate-200';

  return (
    <div
      className="relative"
      {...(isLocked && lockedAriaLabel ? { 'aria-label': lockedAriaLabel } : {})}
      {...(isActive ? { 'aria-current': 'step' as React.AriaAttributes['aria-current'] } : {})}
    >
      {/* Vertical rail — continuous line at x=10, split above/below the node.
          Rail width 2px (w-0.5), positioned left-[9px] so center sits at x=10.
          Node column is 20px wide with items-center → node center at x=10.
          Result: node sits exactly on the rail line per PATHWAY_SPEC §3.1+§3.2. */}
      {stepNumber > 1 && (
        <div
          className={`absolute left-[9px] top-0 w-0.5 ${aboveSegmentColor} transition-colors duration-[250ms]`}
          style={{ height: '14px' }}
          aria-hidden="true"
        />
      )}
      <div
        className={`absolute left-[9px] w-0.5 ${belowSegmentColor} transition-colors duration-[250ms]`}
        style={{ top: '22px', bottom: '0' }}
        aria-hidden="true"
      />

      {/* Rail + node row */}
      <div className="flex items-start gap-3 pt-2">
        {/* Left column: node sits on the rail line (centered at x=10 in 20px column) */}
        <div className="flex flex-col items-center flex-shrink-0 relative z-10" style={{ width: '20px' }}>
          {/* Node dot — opaque background covers the rail line at the node position */}
          <div className={`${nodeClass} mt-0.5`} />
        </div>

        {/* Right column: eyebrow + icon + children */}
        <div className="flex-1 min-w-0 pb-6">
          {/* Eyebrow row */}
          <div className={`flex items-center gap-1.5 mb-3 ${eyebrowClass}`}>
            <span className={iconColorClass}>{STEP_ICONS[iconKey]}</span>
            <span>
              STEP {stepNumber} · {title}
            </span>
          </div>

          {/* Step body */}
          {isLocked ? (
            <p className="text-sm italic text-slate-400">Awaiting Step {stepNumber - 1} ↑</p>
          ) : (
            children
          )}
        </div>
      </div>
    </div>
  );
};

export default PathwayRailStep;
