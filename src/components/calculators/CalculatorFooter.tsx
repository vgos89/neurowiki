import React from 'react';

/**
 * Footer for calculator pages per CALCULATOR_SPEC.md §1.2.
 * Extracted in L5.6 Phase 3 from 9 inline copies.
 *
 * Caller provides the citation (with embedded DOI link) and disclaimer
 * as ReactNode slots — they vary per calculator (different cite formats,
 * different disclaimer wording, optional "Updated per..." suffix).
 * Optional `related` slot for cross-links to related calculators.
 */
export interface CalculatorFooterProps {
  /** Citation paragraph including embedded DOI link. */
  citation: React.ReactNode;
  /** Disclaimer paragraph (e.g. "Educational use only. ..."). */
  disclaimer: React.ReactNode;
  /** Optional related-calculators paragraph (e.g. "Related: HAS-BLED · ICH Score"). */
  related?: React.ReactNode;
}

export const CalculatorFooter: React.FC<CalculatorFooterProps> = ({
  citation,
  disclaimer,
  related,
}) => {
  return (
    <footer className="mt-14 pt-6 border-t border-slate-100">
      <p className="text-xs text-slate-400 leading-relaxed">
        {citation}
      </p>
      <p className="mt-3 text-xs text-slate-400 leading-relaxed">
        {disclaimer}
      </p>
      {related && (
        <p className="mt-3 text-xs text-slate-400">
          {related}
        </p>
      )}
    </footer>
  );
};

export default CalculatorFooter;
