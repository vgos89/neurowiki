import React from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast notification for calculator pages. Rendered as portal at z-[60]
 * (above drawer at z-[55]). Extracted in L5.6 Phase 2 from 9 inline
 * copies — markup was byte-identical across all calculator pages.
 *
 * Usage:
 *   const { toast, showToast } = useDrawerState({ ... });
 *   // ... in render:
 *   <CalculatorToast message={toast} />
 */
export interface CalculatorToastProps {
  /** Toast message, or null to render nothing. */
  message: string | null;
}

export const CalculatorToast: React.FC<CalculatorToastProps> = ({ message }) => {
  if (!message) return null;
  return createPortal(
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-5 py-2.5 rounded-full text-sm font-medium z-[60]"
    >
      {message}
    </div>,
    document.body,
  );
};

export default CalculatorToast;
