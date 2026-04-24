/**
 * BenchmarkThresholdChart — Archetype G visualization (TRIALS_SPEC v1.1 §7a)
 *
 * Single-arm benchmark-threshold track. Renders:
 *   - Horizontal filled track (observed event rate)
 *   - CI band at 20% opacity spanning [ciLow, ciHigh]
 *   - Dashed vertical threshold line at the pre-specified benchmark
 *   - Threshold label centered above the line
 *   - Scale ticks: 3 mobile (0%, midpoint, max), 5 desktop
 *   - Stat row: events/n + CI + result pill
 *
 * Color rules (ADR-006 Decision 2, locked):
 *   Benchmark met (observed < benchmark): fill #10b981
 *   Benchmark failed (observed >= benchmark): fill #ef4444
 *   CI band: fill color at 20% opacity
 *   Threshold line: 2px dashed #92400e
 *
 * Heights (locked):
 *   14px mobile, 18px desktop (@media min-width 768px)
 *
 * §15.3 constraint: no em dashes in text content.
 */

import React from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BenchmarkThresholdChartProps {
  /** Observed event rate as a percentage, e.g. 2.6 for 2.6%. */
  observedRate: number;
  /** Lower bound of the confidence interval, e.g. 0.7. */
  ciLow: number;
  /** Upper bound of the confidence interval, e.g. 6.6. */
  ciHigh: number;
  /** Pre-specified safety/efficacy benchmark rate, e.g. 4.0. */
  benchmarkRate: number;
  /** Short label for the benchmark, e.g. "FDA pre-specified benchmark". */
  benchmarkLabel: string;
  /**
   * Scale maximum in percentage points.
   * Defaults to max(benchmarkRate * 2, ciHigh * 1.6) rounded to nearest 5.
   */
  scaleMax?: number;
  /** True when observedRate < benchmarkRate. Controls fill color. */
  benchmarkMet: boolean;
  /** Primary endpoint description, e.g. "Stroke or death within 72 hours". */
  endpoint: string;
  /** CI method label, e.g. "Clopper-Pearson exact". */
  ciMethod?: string;
  /** Number of events, e.g. 4. */
  numEvents: number;
  /** Total patients, e.g. 152. */
  total: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INLINE_STYLES = `
  @media (min-width: 768px) {
    .btc-track { height: 18px !important; }
    .btc-tick-mid { display: block !important; }
  }
  @media (max-width: 767px) {
    .btc-tick-mid { display: none !important; }
  }
`;

function computeScaleMax(benchmarkRate: number, ciHigh: number, provided?: number): number {
  if (provided != null) return provided;
  const raw = Math.max(benchmarkRate * 2, ciHigh * 1.6);
  return Math.ceil(raw / 5) * 5;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const BenchmarkThresholdChart: React.FC<BenchmarkThresholdChartProps> = ({
  observedRate,
  ciLow,
  ciHigh,
  benchmarkRate,
  benchmarkLabel,
  scaleMax: scaleMaxProp,
  benchmarkMet,
  endpoint,
  ciMethod,
  numEvents,
  total,
}) => {
  const scaleMax = computeScaleMax(benchmarkRate, ciHigh, scaleMaxProp);

  // Pixel percentages on the scale axis
  const fillPct        = Math.min((observedRate / scaleMax) * 100, 100);
  const ciLowPct       = Math.min((ciLow / scaleMax) * 100, 100);
  const ciHighPct      = Math.min((ciHigh / scaleMax) * 100, 100);
  const thresholdPct   = Math.min((benchmarkRate / scaleMax) * 100, 100);

  // Colors
  const fillColor = benchmarkMet ? '#10b981' : '#ef4444';
  const ciColor   = benchmarkMet ? 'rgba(16,185,129,0.20)' : 'rgba(239,68,68,0.20)';

  // Result pill
  const pillText  = benchmarkMet ? 'Benchmark met' : 'Benchmark failed';
  const pillColor = benchmarkMet ? '#047857' : '#dc2626';
  const pillBg    = benchmarkMet ? '#ecfdf5'  : '#fef2f2';

  // Scale tick values (5 values evenly spaced)
  const tick0   = 0;
  const tick25  = Math.round(scaleMax * 0.25);
  const tick50  = Math.round(scaleMax * 0.50);
  const tick75  = Math.round(scaleMax * 0.75);
  const tick100 = scaleMax;

  return (
    <div>
      <style>{INLINE_STYLES}</style>

      {/* Track area — padding accommodates threshold label above and scale below */}
      <div style={{ position: 'relative', paddingTop: 30, paddingBottom: 32 }}>

        {/* Threshold label — centered over dashed line */}
        <span
          style={{
            position: 'absolute',
            top: 0,
            left: `${thresholdPct}%`,
            transform: 'translateX(-50%)',
            fontSize: 9,
            fontWeight: 700,
            color: '#92400e',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            textTransform: 'uppercase',
          }}
          aria-hidden="true"
        >
          {benchmarkLabel} ({benchmarkRate}%)
        </span>

        {/* Track */}
        <div
          className="btc-track"
          style={{
            position: 'relative',
            height: 14,
            background: '#f1f5f9',
            borderRadius: 3,
            overflow: 'visible',
          }}
          role="img"
          aria-label={`${numEvents} of ${total} patients had the primary outcome (${observedRate}%), below the ${benchmarkRate}% benchmark`}
        >
          {/* Fill — observed rate */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              height: '100%',
              width: `${fillPct}%`,
              background: fillColor,
              borderRadius: '3px 0 0 3px',
            }}
            aria-hidden="true"
          />

          {/* CI band — 20% opacity */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              height: '100%',
              left: `${ciLowPct}%`,
              width: `${Math.max(ciHighPct - ciLowPct, 0)}%`,
              background: ciColor,
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />

          {/* Threshold dashed line — extends above (-6px) and below (-20px) per spec */}
          <div
            style={{
              position: 'absolute',
              left: `${thresholdPct}%`,
              top: -6,
              bottom: -20,
              width: 0,
              borderLeft: '2px dashed #92400e',
              pointerEvents: 'none',
            }}
            aria-hidden="true"
          />
        </div>

        {/* Scale ticks — 3 mobile (0, mid, max), 5 desktop (+25%, +75%) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            fontSize: 9,
            color: '#94a3b8',
          }}
          aria-hidden="true"
        >
          <span>{tick0}%</span>
          <span className="btc-tick-mid" style={{ display: 'none' }}>{tick25}%</span>
          <span>{tick50}%</span>
          <span className="btc-tick-mid" style={{ display: 'none' }}>{tick75}%</span>
          <span>{tick100}%</span>
        </div>
      </div>

      {/* Endpoint label */}
      <p
        className="text-[10px] font-semibold uppercase tracking-widest text-slate-400"
        style={{ marginTop: 4, marginBottom: 12 }}
      >
        {endpoint}
      </p>

      {/* Stat row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '8px 16px',
          paddingTop: 12,
          borderTop: '1px solid #f1f5f9',
        }}
      >
        {/* Events / n */}
        <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
          {numEvents}/{total} patients ({observedRate}%)
        </span>

        {/* CI */}
        <span style={{ fontSize: 11, color: '#64748b' }}>
          95% CI {ciLow}&#8211;{ciHigh}%
          {ciMethod && (
            <span style={{ color: '#94a3b8', marginLeft: 4 }}>
              ({ciMethod})
            </span>
          )}
        </span>

        {/* Result pill */}
        <span
          style={{
            fontSize: 10,
            fontWeight: 600,
            color: pillColor,
            background: pillBg,
            padding: '2px 8px',
            borderRadius: 9999,
            flexShrink: 0,
          }}
        >
          {pillText}
        </span>
      </div>
    </div>
  );
};
