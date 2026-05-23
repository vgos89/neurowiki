/**
 * PathwayRecommendationDrawer — slide-up bottom drawer for pathway result
 * surfaces, mirroring the calculator drawer pattern (CalculatorDrawer +
 * severity tokens) but with pathway-specific semantics:
 *
 *   - Only mounts when the pathway has produced a final decision. During
 *     stepwise navigation no drawer appears (per V direction 2026-05-22:
 *     "For the pathways it should only open at the end of the pathway").
 *   - Variant → severity-token mapping (success / warning / danger / info)
 *     drives the drawer color treatment.
 *   - Renders verdict (status string) + COR badge as the collapsed header.
 *   - Expanded body renders arbitrary children (reasoning, dosing,
 *     next-steps callouts, contraindication reminders).
 *
 * Architecture: thin wrapper around portal positioning constants identical
 * to CalculatorDrawer (CALCULATOR_SPEC §5). State machine simpler than the
 * calculator State A/B/C because pathways have a binary "no result / result"
 * state; once a result exists, the drawer is always in the equivalent of
 * State C (tappable, expand/collapse).
 *
 * Closes Task B Phase 1A from V's 2026-05-22 redesign request.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { Chevron } from '../../calculators/Chevron';
import {
  DRAWER_COLLAPSED_SHADOW,
  DRAWER_EXPANDED_SHADOW,
} from '../../../lib/calculators/severityTokens';

export type PathwayDrawerVariant = 'success' | 'warning' | 'danger' | 'info';

interface VariantTokens {
  borderColor: string;
  headerBg: string;
  headerHover: string;
  badgeBg: string;
  badgeText: string;
  statClass: string;
}

const VARIANT_TOKENS: Record<PathwayDrawerVariant, VariantTokens> = {
  success: {
    borderColor: '#10b981',
    headerBg: 'bg-emerald-50',
    headerHover: 'hover:bg-emerald-100',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    statClass: 'text-base font-bold text-emerald-900',
  },
  warning: {
    borderColor: '#f59e0b',
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    statClass: 'text-base font-bold text-amber-900',
  },
  danger: {
    borderColor: '#ef4444',
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    statClass: 'text-base font-bold text-red-900',
  },
  info: {
    borderColor: '#94a3b8',
    headerBg: 'bg-slate-50',
    headerHover: 'hover:bg-slate-100',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-600',
    statClass: 'text-base font-bold text-slate-900',
  },
};

export interface PathwayRecommendationDrawerProps {
  /** When false, drawer does not render. Set true only when pathway result exists. */
  hasResult: boolean;
  /** Color treatment for the verdict. */
  variant: PathwayDrawerVariant;
  /** Verdict text shown collapsed (e.g. "Eligible · Path B", "Not Eligible"). */
  status: string;
  /** Optional COR badge text (e.g. "COR 2a"). Shown next to verdict when present. */
  corBadge?: string;
  /** Drawer expand/collapse state — caller owns. */
  isExpanded: boolean;
  /** Toggle handler. */
  onToggle: () => void;
  /** aria-controls id for the expanded body. */
  ariaContentId?: string;
  /** aria-label for the toggle button. */
  ariaLabel?: string;
  /** Expanded body content. */
  children?: React.ReactNode;
}

export const PathwayRecommendationDrawer: React.FC<PathwayRecommendationDrawerProps> = ({
  hasResult,
  variant,
  status,
  corBadge,
  isExpanded,
  onToggle,
  ariaContentId,
  ariaLabel,
  children,
}) => {
  if (!hasResult) return null;
  const tokens = VARIANT_TOKENS[variant];

  const drawer = (
    <div
      style={{
        borderTop: `2px solid ${tokens.borderColor}`,
        boxShadow: isExpanded ? DRAWER_EXPANDED_SHADOW : DRAWER_COLLAPSED_SHADOW,
      }}
    >
      {/* Expanded body renders ABOVE the toggle button so the handle stays
          pinned to the viewport bottom (mirrors CalculatorDrawer §1.3). */}
      {isExpanded && (
        <div
          id={ariaContentId}
          role="region"
          aria-label="Pathway recommendation details"
          className="max-h-[70dvh] overflow-y-auto bg-white"
        >
          {children}
        </div>
      )}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isExpanded}
        aria-controls={ariaContentId}
        aria-label={ariaLabel ?? 'Toggle pathway recommendation'}
        className={`w-full flex items-center justify-between px-5 py-3.5 transition-colors ${
          isExpanded ? `${tokens.headerBg} ${tokens.headerHover}` : 'bg-white hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex-shrink-0">
            Recommendation
          </div>
          <div className={`${tokens.statClass} truncate`}>{status}</div>
          {corBadge && (
            <div
              className={`flex-shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${tokens.badgeBg} ${tokens.badgeText}`}
            >
              {corBadge}
            </div>
          )}
        </div>
        <Chevron
          direction={isExpanded ? 'down' : 'up'}
          className="text-slate-400 flex-shrink-0"
        />
      </button>
    </div>
  );

  return createPortal(
    <div
      className="fixed right-0 z-[55] bg-white"
      style={{
        bottom: 'calc(var(--tab-bar-height, 0px) + env(safe-area-inset-bottom, 0px))',
        left: 'var(--nav-rail-width, 0px)',
      }}
    >
      {drawer}
    </div>,
    document.body,
  );
};

export default PathwayRecommendationDrawer;
