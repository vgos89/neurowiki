/**
 * PathwayHeader — sticky compact header for Pattern A pathway pages.
 *
 * Spec source: PATHWAY_SPEC.md §2 anatomy. Do not modify class strings
 * without spec amendment.
 *
 * Anatomy (per §2): sticky compact bar with canonical back-arrow SVG +
 * identifier block (PATHWAY eyebrow + pathway label, two-line stack) +
 * right cluster (Favorite + Reset + Copy pill).
 *
 * Renders within `<div className="max-w-2xl ...">` wrapper; consumer
 * is responsible for the page-level wrapper width (§9).
 *
 * Extracted from the 3 identical header blocks in EvtPathway,
 * StatusEpilepticusPathway, MigrainePathway per
 * docs/reviews/arch-pathway-header-extraction.md (2026-05-17).
 */
import React from 'react';
import { Star, RotateCcw } from 'lucide-react';
import { ShareButton } from '../calculators/ShareButton';

export interface PathwayHeaderProps {
  /** Display label rendered after the PATHWAY eyebrow. */
  pathwayLabel: string;
  /** Back button handler. */
  onBack: () => void;
  /** aria-label for back button. Defaults to "Back". EVT uses "Back to Stroke Pathways". */
  backAriaLabel?: string;
  /** Favourite state — fills/clears the Star icon. */
  isFav: boolean;
  /** Favourite toggle handler. */
  onFavToggle: () => void;
  /** Reset handler. */
  onReset: () => void;
  /** Copy handler. */
  onCopy: () => void;
  /**
   * When true, Copy button label renders "Copied ✓" instead of "Copy".
   * Consumer controls the transient state; primitive is a pure renderer.
   */
  copyConfirm?: boolean;
  /** Optional Send-to text (string or lazy builder) for the share pill.
   *  When provided, a Send button appears next to Copy. On mobile opens
   *  the native share sheet; on desktop falls back to clipboard.
   *  Added 2026-05-17 per V direction. */
  shareText?: string | (() => string);
  /** Optional share-sheet title (defaults to pathwayLabel). */
  shareTitle?: string;
  /** Called after the share/copy action with the result. */
  onShareResult?: (result: 'shared' | 'copied' | 'cancelled' | 'failed') => void;
  /**
   * When true, primitive renders nothing. Used by EVT's `isInModal` mode
   * (calculator-embedded surface — host provides header).
   */
  hideHeader?: boolean;
}

export const PathwayHeader: React.FC<PathwayHeaderProps> = ({
  pathwayLabel,
  onBack,
  backAriaLabel = 'Back',
  isFav,
  onFavToggle,
  onReset,
  onCopy,
  copyConfirm = false,
  shareText,
  shareTitle,
  onShareResult,
  hideHeader = false,
}) => {
  if (hideHeader) return null;

  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm -mx-4 px-4 md:-mx-6 md:px-6">
      <div className="max-w-2xl mx-auto flex items-center justify-between h-14 gap-3">
        {/* Left: Back + Identifier */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label={backAriaLabel}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors shrink-0 text-slate-500 cursor-pointer bg-transparent border-0"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">PATHWAY</span>
            <span className="text-[15px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5 truncate">{pathwayLabel}</span>
          </div>
        </div>
        {/* Right: Favorite + Reset + Copy */}
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={onFavToggle} className="p-2 rounded-lg hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}>
            <Star size={16} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
          </button>
          <button onClick={onReset} className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center" aria-label="Reset">
            <RotateCcw size={16} />
          </button>
          <button onClick={onCopy} className="ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors min-h-[44px]" aria-label="Copy summary">
            {copyConfirm ? 'Copied ✓' : 'Copy'}
          </button>
          {shareText && (
            <ShareButton
              text={shareText}
              title={shareTitle ?? pathwayLabel}
              onResult={onShareResult}
              variant="pill"
              label="Send"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default PathwayHeader;
