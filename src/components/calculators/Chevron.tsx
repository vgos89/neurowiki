import React from 'react';

/**
 * Chevron — direction up (^) or down (v). Used in calculator drawer headers
 * per CALCULATOR_SPEC.md §5 (collapsed=up, expanded=down).
 *
 * Extracted in L5.6 Phase 1 from 9 inline copies across calculator pages.
 * See ADR-008.
 */
export type ChevronProps = {
  direction: 'up' | 'down';
  className?: string;
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
    {direction === 'up'
      ? <polyline points="18 15 12 9 6 15" />
      : <polyline points="6 9 12 15 18 9" />}
  </svg>
);

export default Chevron;
