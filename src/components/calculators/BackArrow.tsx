import React from 'react';

/**
 * BackArrow — 20×20 inline SVG per CALCULATOR_SPEC.md §1.1.
 * Path: M19 12H5M12 19l-7-7 7-7. Stroke 2, round caps + joins.
 *
 * Extracted in L5.6 Phase 1 from 9 inline copies across calculator pages
 * (some pages previously imported lucide-react ArrowLeft — replaced by
 * this canonical inline SVG to match the spec exactly).
 *
 * See ADR-008.
 */
export const BackArrow: React.FC = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export default BackArrow;
