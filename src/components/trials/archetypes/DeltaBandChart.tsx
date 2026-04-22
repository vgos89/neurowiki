/**
 * DeltaBandChart — Archetype A visualization (TRIALS_SPEC v1.0 §14)
 *
 * Renders two 100-dot grids (treatment vs control), each dot representing one
 * patient. Filled dots = outcome achieved. A translucent cobalt band overlays
 * the treatment grid, spanning exactly the "extra" patients that the control
 * arm did not reach (dots[startIdx]..dots[endIdx]).
 *
 * Band positioning uses getBoundingClientRect() via useLayoutEffect +
 * ResizeObserver so it recalculates on every layout change.
 *
 * ADR-005 Decision 5 (locked): 20-column CSS grid, 8x8px dots, band offsets
 * ±4px horizontal / ±3px vertical, rgba(23,70,162,0.12) fill.
 */

import React, { useRef, useLayoutEffect, useState } from 'react';
import { MedicalTooltip } from '../../MedicalTooltip';
import { MEDICAL_GLOSSARY } from '../../../data/medicalGlossary';

export interface DeltaBandChartProps {
  /** Treatment arm outcome rate as a percentage, e.g. 35.4 for 35.4%. */
  treatmentPct: number;
  /** Control arm outcome rate as a percentage, e.g. 29.5 for 29.5%. */
  controlPct: number;
  /** Display label for the treatment arm, e.g. "Alteplase Group". */
  treatmentLabel: string;
  /** Display label for the control arm, e.g. "Placebo Group". */
  controlLabel: string;
  /** Primary endpoint description shown below the grids, e.g. "mRS 0-1 at 90 days". */
  endpoint: string;
  /** Risk ratio point estimate, e.g. "1.44". */
  riskRatio: string;
  /** Lower bound of the 95% confidence interval, e.g. "1.01". */
  ciLow: string;
  /** Upper bound of the 95% confidence interval, e.g. "2.06". */
  ciHigh: string;
  /** P-value string, e.g. "0.04". Values < 0.05 render green. */
  pValue: string;
  /**
   * Which arm receives the winning-arm cobalt accent (ADR-005 Decision 3).
   * - 'treatment': intervention arm won (trialResult POSITIVE, normal case).
   * - 'control': control arm favored (POSITIVE trial where intervention caused harm).
   * - 'none': no accent (NEGATIVE / NEUTRAL / undefined trialResult).
   */
  winnerArm?: 'treatment' | 'control' | 'none';
}

const TOTAL_DOTS = 100;
const GRID_COLS = 20; // Locked per mockup ground truth (ADR-005 §5 note)

const cobaltAccentStyle: React.CSSProperties = {
  background: '#EEF2FF',
  color: '#0E2D6B',
  borderLeft: '2px solid #1746A2',
  borderRadius: '0 8px 8px 0',
  padding: '12px 14px',
  marginBottom: '12px',
};

const neutralWrapStyle: React.CSSProperties = {
  padding: '12px 14px',
  marginBottom: '12px',
};

export const DeltaBandChart: React.FC<DeltaBandChartProps> = ({
  treatmentPct,
  controlPct,
  treatmentLabel,
  controlLabel,
  endpoint,
  riskRatio,
  ciLow,
  ciHigh,
  pValue,
  winnerArm = 'none',
}) => {
  // Math.floor per spec — matches mockup "35 of 100" / "29 of 100" for EXTEND
  const treatmentFilled = Math.floor(treatmentPct);
  const controlFilled = Math.floor(controlPct);

  // Band spans from the first "extra" dot to the last "extra" dot
  const startIdx = Math.floor(controlPct);          // e.g. 29 for EXTEND
  const endIdx = Math.floor(treatmentPct) - 1;      // e.g. 34 for EXTEND
  const arr = treatmentPct - controlPct;            // absolute risk reduction in pp

  // ADR-005 Decision 5 threshold table
  const showBand = arr >= 2 && startIdx <= endIdx;

  const treatmentGridRef = useRef<HTMLDivElement>(null);
  const dotRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [bandStyle, setBandStyle] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  useLayoutEffect(() => {
    if (!showBand) {
      setBandStyle(null);
      return;
    }

    function computeBand() {
      const grid = treatmentGridRef.current;
      const dStart = dotRefs.current[startIdx];
      const dEnd = dotRefs.current[endIdx];
      if (!grid || !dStart || !dEnd) return;

      const rs = dStart.getBoundingClientRect();
      const re = dEnd.getBoundingClientRect();
      const rc = grid.getBoundingClientRect();

      // Exact offsets per mockup ground truth (ADR-005 §5, locked)
      setBandStyle({
        left: rs.left - rc.left - 4,
        top: rs.top - rc.top - 3,
        width: re.right - rs.left + 8,
        height: re.bottom - rs.top + 6,
      });
    }

    computeBand();

    const ro = new ResizeObserver(computeBand);
    if (treatmentGridRef.current) ro.observe(treatmentGridRef.current);
    window.addEventListener('resize', computeBand);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeBand);
    };
  }, [startIdx, endIdx, showBand]);

  const pSig = parseFloat(pValue) < 0.05;
  const treatmentIsWinner = winnerArm === 'treatment';
  const controlIsWinner = winnerArm === 'control';

  return (
    <div>
      {/* Treatment arm */}
      <div style={treatmentIsWinner ? cobaltAccentStyle : neutralWrapStyle}>
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: treatmentIsWinner ? '#0E2D6B' : '#1e293b' }}
            >
              {treatmentLabel}
            </span>
            {treatmentIsWinner && (
              <span
                className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#1746A2', color: 'white' }}
              >
                Better outcome
              </span>
            )}
          </div>
          <span
            className="tabular-nums text-xl font-bold shrink-0"
            style={{ color: treatmentIsWinner ? '#1746A2' : '#1e293b' }}
          >
            {treatmentFilled}
            <span className="text-sm font-normal text-slate-400"> / 100</span>
          </span>
        </div>

        {/* Treatment dot grid with delta band overlay */}
        <div
          ref={treatmentGridRef}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gap: 3,
            position: 'relative',
          }}
          role="img"
          aria-label={`${treatmentFilled} of 100 patients in the ${treatmentLabel} achieved the outcome`}
        >
          {Array.from({ length: TOTAL_DOTS }, (_, i) => (
            <div
              key={i}
              ref={(el) => { dotRefs.current[i] = el; }}
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i < treatmentFilled ? '#1746A2' : '#e2e8f0',
              }}
            />
          ))}

          {/* Delta band overlay (ADR-005 Decision 5, locked) */}
          {showBand && bandStyle && (
            <div
              aria-label={`Delta band: ${Math.round(arr)} extra recoveries per 100 patients`}
              style={{
                position: 'absolute',
                left: bandStyle.left,
                top: bandStyle.top,
                width: bandStyle.width,
                height: bandStyle.height,
                background: 'rgba(23,70,162,0.12)',
                border: '1.5px solid #1746A2',
                borderRadius: 4,
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>

      {/* Control arm */}
      <div style={controlIsWinner ? cobaltAccentStyle : neutralWrapStyle}>
        <div className="flex items-center justify-between mb-2 gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="text-sm font-semibold truncate"
              style={{ color: controlIsWinner ? '#0E2D6B' : '#475569' }}
            >
              {controlLabel}
            </span>
            {controlIsWinner && (
              <span
                className="shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{ background: '#1746A2', color: 'white' }}
              >
                Better outcome
              </span>
            )}
          </div>
          <span className="tabular-nums text-xl font-bold text-slate-400 shrink-0">
            {controlFilled}
            <span className="text-sm font-normal text-slate-300"> / 100</span>
          </span>
        </div>

        {/* Control dot grid (no band, no refs needed) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
            gap: 3,
          }}
          role="img"
          aria-label={`${controlFilled} of 100 patients in the ${controlLabel} achieved the outcome`}
        >
          {Array.from({ length: TOTAL_DOTS }, (_, i) => (
            <div
              key={i}
              aria-hidden="true"
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: i < controlFilled ? '#64748b' : '#e2e8f0',
              }}
            />
          ))}
        </div>
      </div>

      {/* ARR threshold notes (ADR-005 Decision 5) */}
      {arr < 2 && (
        <p className="text-xs text-slate-500 italic mt-1">
          Negligible absolute difference
        </p>
      )}
      {arr >= 2 && arr < 5 && (
        <p className="text-xs text-amber-600 italic mt-1">
          Small absolute difference — interpret with caution
        </p>
      )}

      {/* Endpoint label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-3">
        {endpoint}
      </p>

      {/* Stat row: Risk ratio | 95% CI [tooltip] | p-value */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm mt-4 pt-4 border-t border-slate-100">
        <span className="text-slate-700">
          Risk ratio{' '}
          <span className="font-semibold tabular-nums">{riskRatio}</span>
        </span>
        <span className="flex items-center text-slate-600">
          95%&nbsp;CI{' '}
          <span className="font-semibold tabular-nums ml-1">
            {ciLow}&ndash;{ciHigh}
          </span>
          <MedicalTooltip
            term="Confidence Interval"
            definition={
              MEDICAL_GLOSSARY['confidence-interval'] ||
              'Range of values consistent with the study data. A 95% CI that excludes 1.0 (for a ratio) indicates statistical significance.'
            }
          />
        </span>
        <span
          className="font-bold tabular-nums"
          style={{ color: pSig ? '#16a34a' : '#94a3b8' }}
        >
          p&nbsp;=&nbsp;{pValue}
        </span>
      </div>
    </div>
  );
};
