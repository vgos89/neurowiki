import React from 'react';
import { createPortal } from 'react-dom';
import { Chevron } from './Chevron';
import type { SeverityTokens } from '../../lib/calculators/severityTokens';
import { DRAWER_COLLAPSED_SHADOW, DRAWER_EXPANDED_SHADOW } from '../../lib/calculators/severityTokens';

/**
 * Persistent bottom drawer for calculator pages per CALCULATOR_SPEC.md §5.
 * Always renders via createPortal into document.body with fixed positioning
 * above mobile nav (z-[55]).
 *
 * Renders State A (muted, non-interactive) / State B (partial, muted by
 * default) / State C (complete, tappable) based on `state`.
 *
 * State A and B render a muted bar — non-interactive, aria-hidden — unless
 * `stateBTappable` is true (NIHSS: State B is live like State C because the
 * drawer shows a partial score that is clinically useful even before all
 * items are answered).
 *
 * State C renders a tappable header that toggles `isExpanded`. When
 * expanded, `children` (the DrawerContent) renders ABOVE the button
 * so the handle stays pinned to the viewport bottom (§1.3).
 *
 * Portal wrapper:
 *   The component handles its own portal wrapping with the fixed positioning
 *   constants that are identical across all 9 calculators:
 *     bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))
 *     left: var(--nav-rail-width, 0px)
 *   This retires the per-page portal wrapper (~5 lines per file).
 */
export interface CalculatorDrawerProps {
  /** State A (empty), B (partial), or C (complete). */
  state: 'A' | 'B' | 'C';
  /** Visual tokens for State C (and State B when stateBTappable) border + header bg + label/stat/chevron colors. */
  tokens: SeverityTokens | null;
  /** Whether the drawer is expanded. State C only (and State B when stateBTappable). */
  isExpanded: boolean;
  /** Toggle handler. State C only (and State B when stateBTappable). */
  onToggle: () => void;
  /** Aria id for the expanded content region (e.g. "abcd2-drawer-content"). */
  ariaContentId?: string;
  /** Accessible label for the toggle button. */
  ariaLabel?: string;
  /**
   * When true, State B renders a tappable header (same chrome as State C)
   * instead of a muted non-interactive bar. Used by NIHSS where a partial
   * score is clinically meaningful.
   */
  stateBTappable?: boolean;
  /** State A text: left count label, right hint. */
  stateAText: { label: string; hint: string };
  /** State B text: left count label, right hint. Used when state === 'B' and !stateBTappable. */
  stateBText?: { label: string; hint: string };
  /** State C collapsed label (e.g. "Interpretation"). Also used as State B label when stateBTappable. */
  collapsedLabel?: string;
  /** State C collapsed stat text (e.g. "Moderate · 2-day risk 4.1%"). */
  collapsedStat: string;
  /**
   * When true, applies the severity tokens (headerBg + statClass) to the
   * collapsed bar as well as the expanded bar. Used by NIHSS so the bar
   * shifts color (green → amber → orange → red) as the clinician scores
   * items, drawing their eye to the result. Off by default so other
   * calculators are unaffected.
   */
  colorCollapsed?: boolean;
  /**
   * When true, applies `drawer-discovery-chevron` animation (NIHSS only).
   * Ignored when isExpanded is true.
   */
  justCompleted?: boolean;
  /** Expanded drawer content (DrawerContent). Renders above the toggle button when isExpanded. */
  children?: React.ReactNode;
}

export const CalculatorDrawer: React.FC<CalculatorDrawerProps> = ({
  state,
  tokens,
  isExpanded,
  onToggle,
  ariaContentId,
  ariaLabel,
  stateBTappable = false,
  stateAText,
  stateBText,
  collapsedLabel = 'Interpretation',
  collapsedStat,
  justCompleted = false,
  colorCollapsed = false,
  children,
}) => {
  // State A: muted bar, non-interactive
  if (state === 'A') {
    const drawer = (
      <div
        className="bg-slate-100"
        style={{ boxShadow: DRAWER_COLLAPSED_SHADOW }}
        aria-hidden="true"
      >
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {collapsedLabel}
            </div>
            <div className="text-sm text-slate-500">{stateAText.label}</div>
          </div>
          <div className="text-xs text-slate-400">{stateAText.hint}</div>
        </div>
      </div>
    );

    return createPortal(
      <div
        className="fixed right-0 z-[55] bg-white"
        style={{
          bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
          left: 'var(--nav-rail-width, 0px)',
        }}
      >
        {drawer}
      </div>,
      document.body,
    );
  }

  // State B non-tappable: muted bar, non-interactive (like State A but with progress count)
  if (state === 'B' && !stateBTappable) {
    const text = stateBText ?? stateAText;
    const drawer = (
      <div
        className="bg-slate-100"
        style={{ boxShadow: DRAWER_COLLAPSED_SHADOW }}
        aria-hidden="true"
      >
        <div className="px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {collapsedLabel}
            </div>
            <div className="text-sm text-slate-600 font-medium">{text.label}</div>
          </div>
          <div className="text-xs text-slate-400">{text.hint}</div>
        </div>
      </div>
    );

    return createPortal(
      <div
        className="fixed right-0 z-[55] bg-white"
        style={{
          bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
          left: 'var(--nav-rail-width, 0px)',
        }}
      >
        {drawer}
      </div>,
      document.body,
    );
  }

  // State C (or State B with stateBTappable): tappable header + content above button
  if (!tokens) return null;

  const drawer = (
    <div
      style={{
        borderTop: `1px solid ${tokens.borderColor}`,
        boxShadow: isExpanded ? DRAWER_EXPANDED_SHADOW : DRAWER_COLLAPSED_SHADOW,
      }}
    >
      {/* Content renders ABOVE the button so the handle stays at viewport bottom — §1.3 */}
      {isExpanded && children}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={ariaContentId}
        aria-label={ariaLabel}
        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
          isExpanded
            ? `${tokens.headerBg} ${tokens.headerHover}`
            : colorCollapsed
              ? `${tokens.headerBg} hover:brightness-95`
              : 'bg-white hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className={
            isExpanded || colorCollapsed
              ? tokens.labelClass
              : 'text-[10px] font-bold text-slate-400 uppercase tracking-widest'
          }>
            {collapsedLabel}
          </div>
          <div className={
            isExpanded || colorCollapsed ? tokens.statClass : 'text-sm font-medium text-slate-900'
          }>
            {collapsedStat}
          </div>
        </div>
        <Chevron
          direction={isExpanded ? 'down' : 'up'}
          className={
            isExpanded
              ? tokens.chevronClass
              : justCompleted
                ? `${tokens.chevronClass} drawer-discovery-chevron`
                : 'text-slate-400 drawer-chevron-hint'
          }
        />
      </button>
    </div>
  );

  return createPortal(
    <div
      className="fixed right-0 z-[55] bg-white"
      style={{
        bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))',
        left: 'var(--nav-rail-width, 0px)',
      }}
    >
      {drawer}
    </div>,
    document.body,
  );
};

export default CalculatorDrawer;
