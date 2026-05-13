/**
 * GrottaBarChart — Archetype B visualization (TRIALS_SPEC v1.1 §3)
 *
 * Two-row stacked bar chart: mRS 0-6 distribution per arm.
 * Heights: 28px mobile, 32px desktop (@media min-width 768px).
 * Segment labels: omit when < 5% (< 9% on ≤375px; tooltip shown on tap).
 * Winning arm gets cobalt left-border accent when winnerArm !== 'none'.
 * Colors locked per ADR-006 Decision 1.
 */

import React, { useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GrottaBarArm {
  arm: string;
  n: number;
  /** Length 7. Index 0–6 = mRS 0–6. Values are percentages; should sum to ~100. */
  pct: number[];
}

export interface GrottaBarOrdinalStats {
  commonOR: number;
  ciLow: number;
  ciHigh: number;
  direction: 'positive' | 'negative' | 'neutral' | 'harm';
  pValue?: number;
}

export interface GrottaBarChartProps {
  arms: [GrottaBarArm, GrottaBarArm];
  ordinalStats: GrottaBarOrdinalStats;
  /**
   * Which arm receives cobalt left-border accent (ADR-006 Decision 1).
   * 'none' = NEGATIVE / NEUTRAL primary — no accent on either arm.
   */
  winnerArm?: 'intervention' | 'control' | 'none';
  /**
   * When true, renders "Better outcome" pill on winning arm label.
   * Scoped to subgroup pairs only per §3.4a — never set on primary bars.
   */
  isSubgroupPair?: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

// ADR-006 Decision 1 — color table locked
const MRS_COLORS: { fill: string; text: string }[] = [
  { fill: '#10b981', text: '#ffffff' },  // mRS 0
  { fill: '#34d399', text: '#0f172a' },  // mRS 1 — light fill, dark text
  { fill: '#fbbf24', text: '#0f172a' },  // mRS 2 — light fill, dark text
  { fill: '#fb923c', text: '#ffffff' },  // mRS 3
  { fill: '#f97316', text: '#ffffff' },  // mRS 4
  { fill: '#ef4444', text: '#ffffff' },  // mRS 5
  { fill: '#991b1b', text: '#ffffff' },  // mRS 6
];

const INLINE_STYLES = `
  @media (min-width: 768px) {
    .gb-bar { height: 32px !important; }
    .gb-stat-full { display: inline !important; }
    .gb-stat-short { display: none !important; }
  }
  @media (max-width: 767px) {
    .gb-stat-full { display: none !important; }
    .gb-stat-short { display: inline !important; }
  }
  @media (max-width: 375px) {
    .gb-seg-narrow { display: none !important; }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDirectionBadge(or: number, ciLow: number, ciHigh: number, direction?: string) {
  if (ciLow <= 1.0 && ciHigh >= 1.0) {
    return { text: 'Not significant', color: '#64748b', bg: '#f1f5f9' };
  }
  // Use explicit direction when set — handles "for poor outcome" OR convention
  if (direction === 'positive') return { text: 'Favors treatment', color: '#047857', bg: '#ecfdf5' };
  if (direction === 'negative') return { text: 'Favors control', color: '#ef4444', bg: '#fef2f2' };
  if (direction === 'harm') return { text: 'Harm signal', color: '#7f1d1d', bg: '#fef2f2' };
  // Fallback: standard "for good outcome" OR convention
  if (or > 1 && ciLow > 1.0) return { text: 'Favors treatment', color: '#047857', bg: '#ecfdf5' };
  return { text: 'Favors control', color: '#ef4444', bg: '#fef2f2' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export const GrottaBarChart: React.FC<GrottaBarChartProps> = ({
  arms,
  ordinalStats,
  winnerArm = 'none',
  isSubgroupPair = false,
}) => {
  const [tappedSeg, setTappedSeg] = useState<{ arm: number; mrs: number } | null>(null);
  const badge = getDirectionBadge(ordinalStats.commonOR, ordinalStats.ciLow, ordinalStats.ciHigh, ordinalStats.direction);

  return (
    <div
      role="figure"
      aria-label={`mRS distribution chart: ${arms[0].arm} vs ${arms[1].arm}`}
    >
      <style>{INLINE_STYLES}</style>

      {arms.map((arm, armIdx) => {
        const isWinner =
          (armIdx === 0 && winnerArm === 'intervention') ||
          (armIdx === 1 && winnerArm === 'control');

        const wrapStyle: React.CSSProperties = isWinner
          ? {
              borderLeft: '3px solid #1746A2',
              background: '#EEF2FF',
              borderRadius: '0 6px 6px 0',
              padding: '8px 10px 8px 12px',
              marginBottom: 8,
            }
          : { padding: '8px 10px', marginBottom: 8 };

        const armNameColor = isWinner ? '#0E2D6B' : '#64748b';

        return (
          <div key={armIdx} style={wrapStyle} role="group" aria-label={arm.arm}>
            {/* Arm label row */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4, marginBottom: 6 }}>
              <span style={{ fontSize: 11, fontWeight: 500, color: armNameColor }}>
                {arm.arm}
              </span>
              <span style={{ fontSize: 10, color: '#94a3b8' }}>n={arm.n}</span>
              {isSubgroupPair && isWinner && (
                <span style={{
                  background: '#1746A2',
                  color: 'white',
                  fontSize: 10,
                  fontWeight: 500,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>
                  Better outcome
                </span>
              )}
            </div>

            {/* Stacked bar */}
            <div
              className="gb-bar"
              role="group"
              aria-label={`${arm.arm} mRS distribution`}
              style={{
                display: 'flex',
                height: 28,
                borderRadius: 3,
                overflow: 'visible',
                position: 'relative',
              }}
            >
              {arm.pct.map((pct, mrsIdx) => {
                if (pct === 0) return null;
                const color = MRS_COLORS[mrsIdx];
                // Label visibility: <5% never shown; 5–8% desktop-only; ≥9% always
                const showLabel = pct >= 5;
                const isNarrow = pct >= 5 && pct < 9;
                const isActive =
                  tappedSeg?.arm === armIdx && tappedSeg?.mrs === mrsIdx;

                const isInteractive = !showLabel || isNarrow;

                return (
                  <div
                    key={mrsIdx}
                    role={isInteractive ? 'button' : 'img'}
                    aria-label={`mRS ${mrsIdx}: ${pct}%`}
                    tabIndex={isInteractive ? 0 : undefined}
                    style={{
                      width: `${pct}%`,
                      background: color.fill,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      flexShrink: 0,
                      overflow: 'hidden',
                      cursor: isInteractive ? 'pointer' : 'default',
                    }}
                    title={`mRS ${mrsIdx}: ${pct}%`}
                    onClick={() => {
                      if (isInteractive) {
                        setTappedSeg(isActive ? null : { arm: armIdx, mrs: mrsIdx });
                      }
                    }}
                    onKeyDown={isInteractive ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setTappedSeg(isActive ? null : { arm: armIdx, mrs: mrsIdx });
                      }
                    } : undefined}
                  >
                    {showLabel && (
                      <span
                        className={isNarrow ? 'gb-seg-label gb-seg-narrow' : 'gb-seg-label'}
                        style={{
                          fontSize: 10,
                          fontWeight: 600,
                          color: color.text,
                          userSelect: 'none',
                          lineHeight: 1,
                          pointerEvents: 'none',
                        }}
                      >
                        {pct}%
                      </span>
                    )}

                    {/* Tap tooltip for narrow / unlabeled segments */}
                    {isActive && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '110%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#1e293b',
                          color: 'white',
                          fontSize: 11,
                          padding: '3px 7px',
                          borderRadius: 4,
                          whiteSpace: 'nowrap',
                          zIndex: 10,
                          pointerEvents: 'none',
                        }}
                      >
                        mRS {mrsIdx}: {pct}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* mRS legend — flex-wrap, same layout mobile and desktop */}
      <div aria-hidden="true" style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10, marginBottom: 14 }}>
        {MRS_COLORS.map((color, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <div style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: color.fill,
              flexShrink: 0,
            }} />
            <span style={{ fontSize: 10, color: '#64748b' }}>mRS {idx}</span>
          </div>
        ))}
      </div>

      {/* Primary stat row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 8,
        borderTop: '1px solid #f1f5f9',
      }}>
        <div>
          <span style={{ fontSize: 10, color: '#94a3b8', display: 'block', marginBottom: 2 }}>
            <span className="gb-stat-full">Shift in distribution</span>
            <span className="gb-stat-short" style={{ display: 'none' }}>Shift</span>
          </span>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
            cOR {ordinalStats.commonOR.toFixed(2)}
          </span>
          <span style={{ fontSize: 11, color: '#64748b', marginLeft: 4 }}>
            (95% CI {ordinalStats.ciLow.toFixed(2)}{'\u2013'}{ordinalStats.ciHigh.toFixed(2)})
          </span>
          {ordinalStats.pValue !== undefined && (
            <span style={{ fontSize: 11, color: '#94a3b8', marginLeft: 6 }}>
              p={ordinalStats.pValue < 0.001 ? '<0.001' : ordinalStats.pValue.toFixed(3)}
            </span>
          )}
        </div>

        <span style={{
          fontSize: 10,
          fontWeight: 600,
          color: badge.color,
          background: badge.bg,
          padding: '2px 8px',
          borderRadius: 9999,
          flexShrink: 0,
          marginLeft: 8,
        }}>
          {badge.text}
        </span>
      </div>
    </div>
  );
};
