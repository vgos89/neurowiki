/**
 * PitfallNotice — contextual warning about clinical overlap or common error.
 *
 * Distinct from PathwayCascadeNotice (transient cascade-clear feedback with
 * undo/dismiss). PitfallNotice is a non-dismissible inline notice surfaced
 * by the mapper when feature overlap suggests a common diagnostic pitfall.
 *
 * First consumer: ClinicHeadachePathway MapperPanel. Generic enough to be
 * reused by future diagnostic pathways.
 *
 * Accessibility:
 *   - role="note" (not "alert" — these are educational, not urgent)
 *   - aria-label encodes the pitfall title for screen-reader context
 *
 * Design tokens: amber-50 background, amber-200 border, amber-900 text.
 */

import React from 'react';
import { AlertTriangle } from 'lucide-react';

export interface PitfallNoticeProps {
  /** Short label, e.g. "Migraine vs TTH overlap". */
  title: string;
  /** Pitfall body — usually a single sentence stating the discriminator. */
  children: React.ReactNode;
  /** data-claim attribute for JSX-phase claim tagging. */
  claimId?: string;
}

export const PitfallNotice: React.FC<PitfallNoticeProps> = ({ title, children, claimId }) => (
  <div
    role="note"
    aria-label={`Pitfall: ${title}`}
    className="rounded-xl border border-amber-200 bg-amber-50 p-3"
    {...(claimId ? { 'data-claim': claimId } : {})}
  >
    <div className="flex items-start gap-2">
      <AlertTriangle size={14} className="text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
      <div>
        <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-0.5">
          {title}
        </p>
        <p className="text-[12px] text-amber-900 leading-relaxed">{children}</p>
      </div>
    </div>
  </div>
);

export default PitfallNotice;
