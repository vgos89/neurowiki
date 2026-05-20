import React from 'react';
import { Star, RefreshCw, Bookmark } from 'lucide-react';
import { BackArrow } from './BackArrow';
import { ShareButton } from './ShareButton';
import { SaveCaseModal } from '../cases/SaveCaseModal';
import type { SavedCase, SavedCaseData } from '../../lib/cases/types';

/**
 * Sticky top header for calculator pages per CALCULATOR_SPEC.md §1.1.
 * Extracted in L5.6 Phase 3 from 9 inline copies.
 *
 * Single-row variant (Archetype 1 + 3): just the primary row.
 * Two-row variant (Archetype 2 — NIHSS): primary row + secondaryRow slot.
 *
 * Score is rendered by the caller (ReactNode slot) because:
 *   - ASPECTS shows {10 - involved.size} / 10 with conditional severity badge
 *   - Boston shows result.label (string, not number)
 *   - NIHSS shows em-dash when incomplete
 *   - ABCD2/ICH/GCS/Heidelberg show numeric or em-dash
 * See ADR-008 trade-off #2.
 *
 * Shell owns aria-live="polite" + aria-atomic="true" on the score region
 * and accepts a scoreAriaLabel prop for screen-reader consistency (C3).
 */
export interface CalculatorHeaderProps {
  /** Calculator name label (e.g. "ABCD² Score", "ASPECTS Score"). */
  name: string;
  /** Visual score render: number, string, em-dash, plus any inline severity badge. */
  scoreDisplay: React.ReactNode;
  /** Screen-reader description of the current score state. */
  scoreAriaLabel: string;
  /** Optional secondary row (NIHSS LVO + mode toggle). Renders inside the same sticky header. */
  secondaryRow?: React.ReactNode;
  /** Back-button handler. */
  onBack: () => void;
  /** Reset handler. */
  onReset: () => void;
  /** Copy handler. */
  onCopy: () => void;
  /** Optional Send-to text (string or lazy builder) for the share pill.
   *  When provided, a Send button appears next to Copy. On mobile it
   *  opens the native share sheet; on desktop it falls back to clipboard.
   *  Added 2026-05-17 per V direction. */
  shareText?: string | (() => string);
  /** Optional title for the native share sheet (e.g. "NIHSS Score"). */
  shareTitle?: string;
  /** Called after the share/copy action with the result so the consumer
   *  can show an appropriate toast. */
  onShareResult?: (result: 'shared' | 'copied' | 'cancelled' | 'failed') => void;
  /** Favorite toggle handler. */
  onFavToggle: (e: React.MouseEvent) => void;
  /** Whether currently favorited. */
  isFav: boolean;
  /** Optional ref forwarded to the outer <header> element (NIHSS uses this for scroll offset).
   *  Typed as RefObject<HTMLElement> — NIHSS passes RefObject<HTMLDivElement> which is compatible
   *  at runtime since HTMLDivElement extends HTMLElement. The slight type widening is intentional.
   */
  headerRef?: React.RefObject<HTMLElement>;
  /** When provided, renders a Save Case icon button between Reset and Copy.
   *  Tapping opens the SaveCaseModal (managed internally). On success, the
   *  case lands in IndexedDB under /my-cases. Added 2026-05-19 to roll out
   *  case memory across all calculators. */
  saveCase?: {
    /** Where this case is being saved from. */
    source: SavedCase['source'];
    /** Snapshot the calculator's current state at the moment of save.
     *  Receives `{ saveAbsoluteTimestamps }` so the calculator can convert
     *  absolute Unix-ms timestamps to relative-offset storage when the
     *  clinician left the HIPAA-friendly default in place. Calculators
     *  without stroke timestamps may ignore the argument. */
    buildData: (opts: { saveAbsoluteTimestamps: boolean }) => SavedCaseData;
    /** When set, the next save updates this case row in place (same id,
     *  same createdAt, bumped updatedAt) instead of creating a new row.
     *  The consumer captures the id from `onSaved` after the first save
     *  and passes it back here so subsequent saves overwrite. Supports
     *  the "send mid-code, finish timestamps, re-save complete record"
     *  workflow (V direction 2026-05-19). */
    existingCaseId?: string;
    /** Called after a successful save with the case id (new or existing).
     *  The consumer typically stashes this so future saves update in place. */
    onSaved?: (id: string) => void;
    /** True for calculators that capture stroke timestamps and benefit from
     *  the absolute-vs-relative storage choice (currently NIHSS). The modal
     *  surfaces the toggle + disclosure only when this is true. */
    hasStrokeTimestamps?: boolean;
    /** True when at least one stroke-code timestamp has actually been
     *  stamped in the current session. Drives the smart default for the
     *  modal's "keep wall-clock times" checkbox per compliance-legal
     *  Finding 6 follow-up (2026-05-19): when a real code is in progress
     *  the default flips ON so the clinician doesn't have to tick a box
     *  to preserve quality-metric timing. */
    hasFilledStrokeTimestamps?: boolean;
  };
}

export const CalculatorHeader: React.FC<CalculatorHeaderProps> = ({
  name,
  scoreDisplay,
  scoreAriaLabel,
  secondaryRow,
  onBack,
  onReset,
  onCopy,
  shareText,
  shareTitle,
  onShareResult,
  onFavToggle,
  isFav,
  headerRef,
  saveCase,
}) => {
  const [saveCaseOpen, setSaveCaseOpen] = React.useState(false);
  // Wrap onCopy + onShareResult to fire GA4 events. Using the calculator's
  // display `name` as the identifier so all 14 calculators get telemetry
  // for free without each one having to opt in. Added 2026-05-18.
  const handleCopy = React.useCallback(() => {
    import('../../utils/analytics').then(({ trackCalculatorCopied }) => {
      trackCalculatorCopied(name);
    }).catch(() => { /* analytics is best-effort; never block UX */ });
    onCopy();
  }, [name, onCopy]);

  const handleShareResult = React.useCallback(
    (result: 'shared' | 'copied' | 'cancelled' | 'failed') => {
      if (result === 'shared' || result === 'copied') {
        import('../../utils/analytics').then(({ trackCalculatorShared }) => {
          trackCalculatorShared(name, result);
        }).catch(() => { /* best-effort */ });
      }
      onShareResult?.(result);
    },
    [name, onShareResult]
  );
  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-100"
      role="banner"
    >
      <div className={`max-w-2xl mx-auto px-5 ${secondaryRow ? 'py-3' : 'py-4'}`}>
        <div className="flex items-center justify-between gap-2">

          {/* Left cluster */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors flex-shrink-0 cursor-pointer bg-transparent border-0"
              aria-label="Back to calculators"
            >
              <BackArrow />
            </button>

            <div className="min-w-0">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {name}
              </div>

              <div
                className="flex items-baseline gap-1.5 mt-0.5"
                aria-live="polite"
                aria-atomic="true"
                aria-label={scoreAriaLabel}
              >
                {scoreDisplay}
              </div>
            </div>
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              type="button"
              onClick={onFavToggle}
              className="p-2 rounded-full hover:bg-slate-50 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
            >
              <Star
                size={18}
                className={isFav ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}
                aria-hidden="true"
              />
            </button>

            <button
              type="button"
              onClick={onReset}
              className="p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Reset calculator"
            >
              <RefreshCw size={17} aria-hidden="true" />
            </button>

            {/* Save Case — labeled pill between Reset and Copy. The label
                "Save" is visible alongside the bookmark icon so clinicians
                can see at a glance that this action saves the case rather
                than (e.g.) bookmarking the calculator. (V feedback
                2026-05-20: bookmark icon alone isn't obvious enough to
                suggest the save-pathway feature.)
                Visible only when the consumer passes a saveCase prop. */}
            {saveCase && (
              <button
                type="button"
                onClick={() => setSaveCaseOpen(true)}
                className="ml-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium text-slate-600 hover:text-neuro-700 hover:bg-neuro-50 transition-colors min-h-[44px]"
                aria-label="Save case"
              >
                <Bookmark size={16} aria-hidden="true" />
                <span>Save</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px] flex items-center"
            >
              Copy
            </button>
            {shareText && (
              <ShareButton
                text={shareText}
                title={shareTitle ?? name}
                onResult={handleShareResult}
                variant="pill"
                label="Send"
              />
            )}
          </div>
        </div>

        {/* Secondary row — NIHSS two-row variant (LVO + mode toggle) */}
        {secondaryRow && (
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            {secondaryRow}
          </div>
        )}
      </div>

      {/* Save Case modal — mounted here so any calculator that passes the
          saveCase prop gets the save flow for free. The modal is portal-less
          but uses fixed positioning + z-[80] which lifts above the sticky
          header (z-40) and CalculatorDrawer (z-40-ish). */}
      {saveCase && (
        <SaveCaseModal
          isOpen={saveCaseOpen}
          onClose={() => setSaveCaseOpen(false)}
          source={saveCase.source}
          buildData={saveCase.buildData}
          existingCaseId={saveCase.existingCaseId}
          onSaved={saveCase.onSaved}
          hasStrokeTimestamps={saveCase.hasStrokeTimestamps}
          hasFilledStrokeTimestamps={saveCase.hasFilledStrokeTimestamps}
        />
      )}
    </header>
  );
};

export default CalculatorHeader;
