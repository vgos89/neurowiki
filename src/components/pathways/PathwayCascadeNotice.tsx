/**
 * PathwayCascadeNotice — inline cascade-clear feedback pill.
 *
 * ARCH-2 prop contract (binding):
 *   visible: boolean
 *   changedFieldLabel: string
 *   clearedFields: string[]
 *   onUndo: () => void
 *   onDismiss: () => void
 *
 * Placement: rendered INLINE at the field-row level by EvtPathway.tsx,
 * immediately below the changed category-row. NOT lifted into PathwayRail.
 * This is the ARCH-2 constraint — prevents the v4-1 placement bug.
 *
 * PATHWAY_SPEC §3.6:
 * - role="status" aria-live="polite" aria-atomic="true"
 * - 8-second auto-dismiss (plan spec; original spec says 4s — plan overrides)
 * - Undo restores upstream + downstream answers
 * - Slide in 200ms, slide out 200ms
 * - prefers-reduced-motion: collapses transitions to ≤0.01ms
 *
 * Design tokens: slate-50/200/600/700 neutral pill, white Undo button.
 */

import React, { useEffect, useRef } from 'react';

export interface PathwayCascadeNoticeProps {
  visible: boolean;
  changedFieldLabel: string;
  clearedFields: string[];
  onUndo: () => void;
  onDismiss: () => void;
}

const UndoIcon: React.FC = () => (
  <svg
    className="w-3 h-3 text-slate-400"
    viewBox="0 0 20 20"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    aria-hidden="true"
  >
    <path d="M4 4v5h5" />
    <path d="M20 11A8 8 0 1 1 5 9" />
  </svg>
);

const buildClearedPrefix = (clearedFields: string[]): string => {
  if (clearedFields.length === 0) return 'Downstream steps cleared';
  if (clearedFields.length === 1) return `${clearedFields[0]} cleared`;
  if (clearedFields.length === 2) return `${clearedFields[0]} and ${clearedFields[1]} cleared`;
  const last = clearedFields[clearedFields.length - 1];
  const rest = clearedFields.slice(0, -1).join(', ');
  return `${rest}, and ${last} cleared`;
};

export const PathwayCascadeNotice: React.FC<PathwayCascadeNoticeProps> = ({
  visible,
  changedFieldLabel: _changedFieldLabel,
  clearedFields,
  onUndo,
  onDismiss,
}) => {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 8-second auto-dismiss
  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => {
        onDismiss();
      }, 8000);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, onDismiss]);

  const clearedPrefix = buildClearedPrefix(clearedFields);

  return (
    /*
     * The notice is always in the DOM (a11y A-01: aria-live region must be
     * present from mount, not injected after the fact). It is visually hidden
     * when not visible. This matches the spec requirement that the live region
     * is wired up from page load.
     */
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`
        mt-2 transition-opacity motion-reduce:transition-none
        ${visible ? 'opacity-100 duration-200' : 'opacity-0 duration-200 pointer-events-none'}
      `}
    >
      {visible && (
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
          <UndoIcon />
          <span>
            <strong className="font-medium text-slate-700">{clearedPrefix}</strong>
            {' '}— re-confirm.
          </span>
          {/* Undo: p-3 -m-3 wrapper achieves 44px touch target without inflating
              the visible pill height (PATHWAY_SPEC §3.6 + §8). */}
          <button
            type="button"
            onClick={onUndo}
            className="ml-2 p-3 -m-3 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none touch-manipulation rounded-full"
            aria-label="Undo cascade clear"
          >
            <span className="inline-flex items-center px-2 py-0.5 bg-white border border-slate-300 rounded-full text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-400 active:scale-[0.98] transform-gpu transition-colors">
              Undo
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PathwayCascadeNotice;
