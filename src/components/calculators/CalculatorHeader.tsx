import React from 'react';
import { Star, RefreshCw } from 'lucide-react';
import { BackArrow } from './BackArrow';
import { ShareButton } from './ShareButton';

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
}) => {
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
    </header>
  );
};

export default CalculatorHeader;
