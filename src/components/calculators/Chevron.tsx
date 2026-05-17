import React from 'react';

/**
 * Chevron — direction up (^), down (v), right (>), or left (<).
 * Used in calculator drawer headers per CALCULATOR_SPEC.md §5
 * (collapsed=up, expanded=down). Extended in Tier 5 to add right/left
 * for inline navigation chips (PATHWAY_SPEC §4, Migraine E-10).
 *
 * Extracted in L5.6 Phase 1 from 9 inline copies across calculator pages.
 * See ADR-008. Extended with right/left in Tier 5 Pattern A fix.
 */
export type ChevronDirection = 'up' | 'down' | 'right' | 'left';

export type ChevronProps = {
  direction: ChevronDirection;
  className?: string;
};

const POINTS: Record<ChevronDirection, string> = {
  up:    '18 15 12 9 6 15',
  down:  '6 9 12 15 18 9',
  right: '9 18 15 12 9 6',
  left:  '15 18 9 12 15 6',
};

export const Chevron: React.FC<ChevronProps> = ({ direction, className = '' }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    className={className}
  >
    <polyline points={POINTS[direction]} />
  </svg>
);

export default Chevron;
