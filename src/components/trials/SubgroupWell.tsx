/**
 * SubgroupWell — collapsible subgroup analysis section (TRIALS_SPEC v1.1 §3.4, §3.4a)
 *
 * Renders N GrottaBarChart pairs inside a collapsible well with a mandatory amber
 * caveat at the top. Used exclusively in Archetype B trial layouts.
 *
 * "Better outcome" pill and subgroup cobalt accent are delegated to GrottaBarChart
 * via isSubgroupPair=true + winnerArm prop (§3.4a scope rule).
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GrottaBarChart, GrottaBarArm } from './archetypes/GrottaBarChart';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SubgroupAnalysis {
  label: string;
  description?: string;
  winnerArm: 'intervention' | 'control' | null;
  armDistributions: { arm: string; n: number; pct: number[] }[];
  stats: {
    commonOR: number;
    ciLow: number;
    ciHigh: number;
    direction: 'positive' | 'negative' | 'neutral' | 'harm';
  };
}

export interface SubgroupWellProps {
  analyses: SubgroupAnalysis[];
  /** Amber caveat text. Required per §3.4a — must be present when this component is rendered. */
  caveat: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const wellStyle: React.CSSProperties = {
  background: '#f8fafc',
  borderLeft: '2px solid #1746A2',
  borderRadius: '0 8px 8px 0',
  overflow: 'hidden',
};

const amberCaveatStyle: React.CSSProperties = {
  background: '#fef3c7',
  borderLeft: '2px solid #fbbf24',
  borderRadius: 2,
  padding: '10px 12px',
  marginTop: 12,
  fontSize: 12,
  color: '#92400e',
  lineHeight: 1.5,
};

// ─── Component ────────────────────────────────────────────────────────────────

export const SubgroupWell: React.FC<SubgroupWellProps> = ({ analyses, caveat }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={wellStyle}>
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:ring-inset"
        aria-expanded={isOpen}
        aria-controls="subgroup-well-content"
      >
        <span className="text-sm font-semibold text-slate-700">
          Subgroup analyses
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
        )}
      </button>

      {isOpen && (
        <div id="subgroup-well-content" className="px-4 pb-4">
          {/* Amber caveat — mandatory first element per §3.4a */}
          <div style={amberCaveatStyle}>{caveat}</div>

          {analyses.map((analysis, idx) => (
            <div key={idx} style={{ marginTop: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: '#0f172a', marginBottom: 4 }}>
                {analysis.label}
              </p>
              {analysis.description && (
                <p style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                  {analysis.description}
                </p>
              )}
              <GrottaBarChart
                arms={analysis.armDistributions as [GrottaBarArm, GrottaBarArm]}
                ordinalStats={analysis.stats}
                winnerArm={analysis.winnerArm ?? 'none'}
                isSubgroupPair={true}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
