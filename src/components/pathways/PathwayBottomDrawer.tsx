/**
 * PathwayBottomDrawer — persistent interpretation drawer at the bottom of a
 * pathway page. Pattern forked from src/components/trials/BottomLineDrawer.tsx,
 * adapted for live clinical-interpretation content (updates as the user fills
 * out the pathway form, rather than showing a static trial summary).
 *
 * Canary deployment: GCAPathway. Migration order per
 * docs/audits/2026-05-14/pathways-design-audit.md:
 *   GCA → ELAN → SE → Migraine → ExtendedIVT → EVT.
 *
 * State machine (simplified vs BottomLineDrawer):
 *   collapsed — handle bar + tier badge + one-line action (default)
 *   expanded  — full reasons + notes + action
 *
 * Position: fixed, bottom = calc(var(--tab-bar-height) + safe-area-inset-bottom).
 * z-index: 55 (matches BottomLineDrawer; lifts FeedbackButton via published
 * drawer floor height — see FeedbackButton.tsx fix 3).
 */

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronUp, ChevronDown } from 'lucide-react';

export type PathwayTier = 'Low' | 'Intermediate' | 'High' | 'Negative' | 'None';

export interface PathwayBottomDrawerProps {
  /** Short pathway name shown in the collapsed handle. */
  pathwayName: string;
  /** Current interpretation tier — drives badge color and prominence. */
  tier: PathwayTier;
  /** One-line action sentence shown in collapsed state. */
  action: string;
  /** Optional list of contributing reasons, shown in expanded state. */
  reasons?: { label: string; points?: number }[];
  /** Optional notes/cautions, shown in expanded state. */
  notes?: string[];
  /** Optional brief shown above the action when expanded. */
  expandedSummary?: string;
}

const TIER_BADGE: Record<PathwayTier, { bg: string; color: string; border: string }> = {
  High: { bg: '#FEF2F2', color: '#991b1b', border: '#fca5a5' },
  Intermediate: { bg: '#FFFBEB', color: '#92400e', border: '#fcd34d' },
  Low: { bg: '#EEF2FF', color: '#1746A2', border: '#c7d2fe' },
  Negative: { bg: '#F8FAFC', color: '#64748b', border: '#e2e8f0' },
  None: { bg: '#F8FAFC', color: '#64748b', border: '#e2e8f0' },
};

export const PathwayBottomDrawer: React.FC<PathwayBottomDrawerProps> = ({
  pathwayName,
  tier,
  action,
  reasons,
  notes,
  expandedSummary,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Publish drawer floor height so FeedbackButton lifts above it (same pattern
  // as BottomLineDrawer.tsx fix 3 and CalculatorDrawer).
  useEffect(() => {
    const el = drawerRef.current;
    if (!el) return;
    const setHeight = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--drawer-floor-height', `${h}px`);
    };
    setHeight();
    const ro = new ResizeObserver(setHeight);
    ro.observe(el);
    return () => {
      ro.disconnect();
      document.documentElement.style.setProperty('--drawer-floor-height', '0px');
    };
  }, []);

  const badge = TIER_BADGE[tier];
  const isNeutralTier = tier === 'None' || tier === 'Negative';

  const drawer = (
    <div
      ref={drawerRef}
      role="region"
      aria-label={`${pathwayName} live interpretation`}
      className="fixed left-0 right-0 z-[55] bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]"
      style={{ bottom: `calc(var(--tab-bar-height, 60px) + env(safe-area-inset-bottom, 0px))` }}
    >
      {/* Handle / collapsed row */}
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-controls="pathway-drawer-body"
        className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            className="text-[11px] font-semibold uppercase tracking-widest rounded-full px-2 py-0.5"
            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
          >
            {tier === 'None' ? '—' : tier}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 hidden sm:inline">
            {pathwayName}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-[13.5px] leading-snug truncate ${isNeutralTier ? 'text-slate-500' : 'text-slate-700 font-medium'}`}>
            {action}
          </p>
        </div>
        <div className="flex-shrink-0 text-slate-400">
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </button>

      {/* Expanded body */}
      {isOpen && (
        <div
          id="pathway-drawer-body"
          className="px-4 pb-4 max-h-[40vh] overflow-y-auto border-t border-slate-100"
        >
          {expandedSummary && (
            <p className="mt-3 text-[13px] text-slate-600 leading-relaxed">{expandedSummary}</p>
          )}
          {reasons && reasons.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Reasons</p>
              <ul className="space-y-1">
                {reasons.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-700">
                    <span className="text-slate-300 mt-0.5 flex-shrink-0" aria-hidden="true">·</span>
                    <span className="flex-1">{r.label}</span>
                    {typeof r.points === 'number' && (
                      <span className="text-[11px] font-mono text-slate-400 flex-shrink-0">+{r.points}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {notes && notes.length > 0 && (
            <div className="mt-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-1.5">Notes</p>
              <ul className="space-y-1">
                {notes.map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed">
                    <span className="text-slate-300 mt-0.5 flex-shrink-0" aria-hidden="true">·</span>
                    <span className="flex-1">{n}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(drawer, document.body);
};

export default PathwayBottomDrawer;
