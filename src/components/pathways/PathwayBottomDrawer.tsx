/**
 * PathwayBottomDrawer — thin pathway wrapper around CalculatorDrawer.
 *
 * Composes (does not fork) the calculator drawer pattern from
 * src/components/calculators/CalculatorDrawer.tsx per CALCULATOR_SPEC v1.1 §5
 * and the design-tokens skill. State A / B / C semantics, portal positioning,
 * severity-colored chrome, shadow constants, and chevron component are all
 * reused from the calculator system — the only thing this wrapper adds is the
 * tier→severity-tokens map and the pathway-specific DrawerContent renderer.
 *
 * Canary deployment: EvtPathway (reassigned from GCA on 2026-05-15 after the
 * GCA pathway was retired as non-validated). Migration order:
 *   EVT → ExtendedIVT → ELAN → SE → Migraine.
 */

import React from 'react';
import { CalculatorDrawer } from '../calculators/CalculatorDrawer';
import type { SeverityTokens } from '../../lib/calculators/severityTokens';

export type PathwayTier = 'Low' | 'Intermediate' | 'High' | 'Negative' | 'None';

export interface PathwayBottomDrawerProps {
  /** Short pathway name shown in the collapsed handle (e.g. "EVT"). */
  pathwayName: string;
  /** Current interpretation tier. Drives severity-token selection (color). */
  tier: PathwayTier;
  /**
   * Optional badge/stat label override. Used when the pathway's verdict
   * vocabulary does not map cleanly to Low/Intermediate/High (e.g. EVT uses
   * Eligible / Consult / Avoid). Rendered in the drawer header next to the
   * eyebrow. Defaults to the tier name.
   */
  tierLabel?: string;
  /** One-line action sentence shown after the tier label in the collapsed header. */
  action: string;
  /** Optional list of contributing reasons, shown in the expanded body. */
  reasons?: { label: string; points?: number }[];
  /** Optional notes/cautions, shown in the expanded body. */
  notes?: string[];
  /** Optional summary paragraph shown above reasons/notes when expanded. */
  expandedSummary?: string;
  /**
   * Optional eyebrow label override. Defaults to "Interpretation" to match
   * the calculator drawer's default.
   */
  collapsedLabel?: string;
}

/**
 * Map pathway tier to calculator SeverityTokens. Same shape as ABCD²/ICH/etc.
 * so the visual chrome (border, header bg + hover, label + stat color, chevron)
 * is identical to a tier-colored calculator drawer.
 */
const TIER_TOKENS: Record<Exclude<PathwayTier, 'None'>, SeverityTokens> = {
  Low: {
    borderColor: '#c7d2fe',         // neuro-200
    headerBg: 'bg-neuro-50',
    headerHover: 'hover:bg-neuro-100',
    labelClass: 'text-[10px] font-bold text-neuro-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-neuro-700',
    chevronClass: 'text-neuro-600',
  },
  Intermediate: {
    borderColor: '#fcd34d',         // amber-300
    headerBg: 'bg-amber-50',
    headerHover: 'hover:bg-amber-100',
    labelClass: 'text-[10px] font-bold text-amber-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-amber-700',
    chevronClass: 'text-amber-700',
  },
  High: {
    borderColor: '#fca5a5',         // red-300
    headerBg: 'bg-red-50',
    headerHover: 'hover:bg-red-100',
    labelClass: 'text-[10px] font-bold text-red-700 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-red-700',
    chevronClass: 'text-red-600',
  },
  Negative: {
    borderColor: '#e2e8f0',         // slate-200
    headerBg: 'bg-white',
    headerHover: 'hover:bg-slate-50',
    labelClass: 'text-[10px] font-bold text-slate-400 uppercase tracking-widest',
    statClass: 'text-sm font-medium text-slate-900',
    chevronClass: 'text-slate-400',
  },
};

export const PathwayBottomDrawer: React.FC<PathwayBottomDrawerProps> = ({
  pathwayName,
  tier,
  tierLabel,
  action,
  reasons,
  notes,
  expandedSummary,
  collapsedLabel = 'Interpretation',
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  // State A (no result) is handled by the parent passing tier='None' AND
  // empty action. State C (tappable) requires tokens. Fall back to slate.
  const tokens: SeverityTokens | null =
    tier === 'None' ? null : TIER_TOKENS[tier];

  // Collapsed stat string: "<tierLabel> · <action>"
  const labelText = tierLabel ?? (tier === 'None' ? '—' : tier);
  const collapsedStat = action
    ? `${labelText} · ${action}`
    : labelText;

  // CalculatorDrawer takes care of portal, positioning, shadows, chevron,
  // and the State A / B / C anatomy. We hand it tokens + the collapsed
  // stat + the expanded DrawerContent.
  return (
    <CalculatorDrawer
      state={tier === 'None' ? 'A' : 'C'}
      tokens={tokens}
      isExpanded={isExpanded}
      onToggle={() => setIsExpanded((open) => !open)}
      ariaContentId={`${pathwayName.toLowerCase()}-pathway-drawer-content`}
      ariaLabel={`${pathwayName} interpretation drawer`}
      stateAText={{ label: 'Waiting for inputs', hint: pathwayName }}
      collapsedLabel={collapsedLabel}
      collapsedStat={collapsedStat}
    >
      <PathwayDrawerContent
        pathwayName={pathwayName}
        reasons={reasons}
        notes={notes}
        expandedSummary={expandedSummary}
      />
    </CalculatorDrawer>
  );
};

// ─── Expanded body content ─────────────────────────────────────────────────

interface DrawerContentProps {
  pathwayName: string;
  reasons?: { label: string; points?: number }[];
  notes?: string[];
  expandedSummary?: string;
}

const PathwayDrawerContent: React.FC<DrawerContentProps> = ({
  pathwayName,
  reasons,
  notes,
  expandedSummary,
}) => {
  const hasReasons = reasons && reasons.length > 0;
  const hasNotes = notes && notes.length > 0;

  return (
    <div
      id={`${pathwayName.toLowerCase()}-pathway-drawer-content`}
      className="bg-white border-t border-slate-100 px-5 py-4 max-h-[40vh] overflow-y-auto"
    >
      {expandedSummary && (
        <p className="text-sm text-slate-700 leading-relaxed mb-3">
          {expandedSummary}
        </p>
      )}

      {hasReasons && (
        <div className={expandedSummary ? 'mt-3' : ''}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Reasons
          </p>
          <ul className="space-y-1">
            {reasons!.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                <span className="text-slate-300 mt-0.5 flex-shrink-0" aria-hidden="true">·</span>
                <span className="flex-1">{r.label}</span>
                {typeof r.points === 'number' && (
                  <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">
                    +{r.points}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasNotes && (
        <div className={hasReasons || expandedSummary ? 'mt-3' : ''}>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
            Notes
          </p>
          <ul className="space-y-1">
            {notes!.map((n, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-600 leading-relaxed">
                <span className="text-slate-300 mt-0.5 flex-shrink-0" aria-hidden="true">·</span>
                <span className="flex-1">{n}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default PathwayBottomDrawer;
