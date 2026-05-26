/**
 * PhenotypePickerSheet — modal sheet for the "I already know the diagnosis"
 * power-user exit on adaptive-interview pathways.
 *
 * Accessibility:
 *   - role="dialog" + aria-modal="true" + aria-labelledby
 *   - Focus trap: first focusable element gets focus on open; Tab and
 *     Shift+Tab cycle within the dialog; Escape closes
 *   - Click outside (backdrop) closes
 *   - Restores focus to the trigger on close
 *
 * Generic at the UI layer. Takes a typed array of phenotype options.
 */

import React, { useEffect, useRef } from 'react';

export interface PhenotypePickerOption {
  id: string;
  label: string;
  section?: string;
}

export interface PhenotypePickerSheetProps {
  open: boolean;
  options: PhenotypePickerOption[];
  onPick: (id: string) => void;
  onClose: () => void;
  heading?: string;
}

export const PhenotypePickerSheet: React.FC<PhenotypePickerSheetProps> = ({
  open,
  options,
  onPick,
  onClose,
  heading = 'I already know the diagnosis',
}) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    // Focus the first interactive button on open
    setTimeout(() => firstButtonRef.current?.focus(), 0);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab' || !sheetRef.current) return;
      // Focus trap
      const focusable = sheetRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      previouslyFocusedRef.current?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="phenotype-picker-heading"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="
          relative w-full sm:max-w-md bg-white sm:rounded-2xl shadow-xl
          rounded-t-2xl max-h-[85vh] overflow-y-auto
          animate-in slide-in-from-bottom-4
        "
        style={{ boxShadow: '0 -4px 24px rgba(15,23,42,0.18)' }}
      >
        <header className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex items-baseline justify-between">
          <h2 id="phenotype-picker-heading" className="text-[15px] font-semibold text-slate-900">
            {heading}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              text-[12px] text-slate-500 hover:text-slate-700
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 rounded
              min-h-[44px] min-w-[44px] px-2
            "
          >
            Cancel
          </button>
        </header>

        <p className="px-5 pt-3 text-[12px] text-slate-500 leading-relaxed">
          Skip the interview and jump directly to a phenotype's management plan. Confirm the patient's history matches the ICHD-3 criteria before treating.
        </p>

        <ul className="px-5 py-3 space-y-2">
          {options.map((opt, idx) => (
            <li key={opt.id}>
              <button
                ref={idx === 0 ? firstButtonRef : undefined}
                type="button"
                onClick={() => onPick(opt.id)}
                className="
                  w-full text-left rounded-xl border border-slate-200 bg-white
                  px-4 py-3 hover:border-neuro-300 hover:bg-neuro-50 transition-colors
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500
                  min-h-[56px]
                "
              >
                <p className="text-[14px] font-semibold text-slate-900">{opt.label}</p>
                {opt.section && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{opt.section}</p>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PhenotypePickerSheet;
