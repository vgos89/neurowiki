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
  /** Names the interval figure. Defaults to '95% CI', or 'NI bound' when ciHigh is
   *  empty. Bayesian designs should pass e.g. 'Bayesian' so a posterior probability
   *  is not misread as a frequentist confidence interval. */
  intervalLabel?: string;
  /** Names the effect figure. Defaults to 'Risk ratio'. Bayesian designs should pass
   *  e.g. 'Posterior P(superiority)' so a probability is not labelled a risk ratio. */
  effectLabel?: string;
  /** P-value string, e.g. "0.04". Values < 0.05 render green. */
  pValue: string;
  /**
   * Force-suppress the delta band. Pass `true` when a rendered difference would
   * assert a comparative benefit the design cannot support.
   * A null-but-randomized comparison does NOT need this: an explicitly
   * non-significant `pValue` suppresses the band on its own.
   */
  suppressBand?: boolean;
  /**
   * WHY the band is suppressed. Drives the explanatory line under the grids, so
   * it must match the actual design or the page contradicts itself.
   * - `'no-comparator'` (default): the two grids are not a randomized
   *   comparison at all. Single-arm cohorts with a placeholder `controlPct`,
   *   quasi-experimental allocation, benchmark and observational displays.
   * - `'noninferiority'`: a perfectly good RCT whose conclusion is "not worse
   *   by more than the margin", not "better". Required for NI call sites:
   *   telling the reader an NI trial was "not a randomized comparison" is false,
   *   and sits a few lines from copy on the same page calling it an RCT.
   * - `'ordinal-primary'`: the primary was an ordinal shift and the grids show a
   *   dichotomization of it, so a band would be an absolute risk difference over
   *   a cut point the trial did not test.
   *
   * Pass this WHENEVER it applies, not only alongside `suppressBand`: a call
   * site suppressed by the p-value rule still needs an accurate reason, and the
   * component cannot infer the design from numbers.
   *
   * PRECEDENCE for the rendered line: harm-direction wins first (that the
   * intervention arm did worse is the most important thing to say), then this
   * explicit reason, then `suppressBand`'s default, then the p-value branches.
   * So a harm-direction site passing `'ordinal-primary'` renders the harm line;
   * that is intended, and both statements are true of it.
   */
  suppressReason?: 'no-comparator' | 'noninferiority' | 'ordinal-primary';
  /**
   * The record's `primaryResult`, passed straight through. Required for any
   * call site that says the intervention did WORSE, because that is an
   * evidentiary claim and must come from the record rather than be inferred.
   *
   * `winnerArm` is a STYLING prop: its own contract is "which arm gets the
   * cobalt accent", and some call sites use `'control'` merely as a direction
   * hint. Reading it as a harm verdict put "the intervention arm did worse" on
   * PRISMS, whose interval crosses zero, whose p is NS, whose result is
   * `terminated-administrative` (stopped for slow enrolment at 33% of planned
   * enrolment), and whose own pearl says only that the direction "did not
   * favor" alteplase. Found 2026-07-31.
   */
  primaryResult?: string;
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
  intervalLabel,
  effectLabel,
  pValue,
  winnerArm = 'none',
  suppressBand = false,
  suppressReason = 'no-comparator',
  primaryResult,
}) => {
  // Math.floor per spec — matches mockup "35 of 100" / "29 of 100" for EXTEND
  const treatmentFilled = Math.floor(treatmentPct);
  const controlFilled = Math.floor(controlPct);

  // Treat placeholder strings as absent so a degenerate call site cannot render
  // "95% CI N/A-N/A" or "p = N/A" on a clinical surface.
  const PLACEHOLDERS = ['N/A', 'n/a', '—', '–', '-', ''];
  const isBlank = (v: string) => PLACEHOLDERS.includes((v ?? '').trim());
  const hasInterval = !isBlank(ciLow);

  // Band spans from the first "extra" dot to the last "extra" dot
  const startIdx = Math.floor(controlPct);          // e.g. 29 for EXTEND
  const endIdx = Math.floor(treatmentPct) - 1;      // e.g. 34 for EXTEND
  const arr = treatmentPct - controlPct;            // absolute risk reduction in pp

  // A p-value that does NOT positively establish a difference. "<0.001" and
  // friends do; a parseable value below 0.05 does. Everything else does not,
  // and that deliberately includes UNPARSEABLE strings: the call sites pass
  // things like "NI met", "Non-inf" and "Met per-protocol", which parseFloat
  // turns into NaN. Treating NaN as significant let every one of those draw a
  // superiority band off a noninferiority conclusion, which is a no-difference
  // finding. A blank p is left alone (Bayesian and single-arm call sites
  // legitimately pass none) and is handled by suppressBand where needed.
  const pTrimmed = (pValue ?? '').trim();
  // Three states, not two. Several call sites put a DESIGN VERDICT in this slot
  // ("NI met", "Non-inf", "Met per-protocol") rather than a number. Those must
  // suppress the band, because a noninferiority verdict is a no-difference
  // conclusion, but they must never be described as "not statistically
  // significant" and must never be printed after "p =": "p = NI met" is not a
  // p-value, and it rendered three lines above copy stating noninferiority WAS
  // established. Found 2026-07-31 on SARODE, ORIGINAL, ACT, TRACE-2 and TASTE.
  const pIsNumeric = !isBlank(pValue) && Number.isFinite(parseFloat(pTrimmed));
  const pIsUnparseable = !isBlank(pValue) && !pTrimmed.startsWith('<') && !pIsNumeric;
  const pEstablishesDifference =
    !isBlank(pValue) && (pTrimmed.startsWith('<') || parseFloat(pTrimmed) < 0.05);
  const pIsNonSignificant = !isBlank(pValue) && !pEstablishesDifference;

  // The band is drawn on the TREATMENT grid and announced as "extra
  // recoveries". When the control arm is the winner the extra dots are extra
  // BAD outcomes, so that framing inverts the meaning of the trial: SAMMPRIS
  // was reading "9 extra recoveries per 100 patients" for 9 extra strokes and
  // deaths, and PATCH "16 extra recoveries" for 16 extra death-or-dependence
  // outcomes. Both are harm results, significant, and stopped or published as
  // such. Suppress rather than relabel: a harm-coloured band would still be an
  // absolute risk difference, and these call sites do not all have an interval.
  const bandWouldInvertHarm = winnerArm === 'control' && arr > 0;

  // ADR-005 Decision 5 threshold table, plus two safety preconditions.
  //
  // The band IS an absolute-risk-difference display: it highlights the extra
  // dots and announces "N extra recoveries per 100 patients" to assistive
  // technology. That is an unqualified causal-benefit claim, and arithmetically
  // an NNT. It must not draw when the trial did not establish a difference.
  //
  // Two ways that goes wrong, both found live on 2026-07-31:
  //   1. A null result. PREMIUM's efficacy co-primary was NOT met (38.5% vs
  //      32.0%, P=0.32) and the page drew a 6-dot band reading "7 extra
  //      recoveries per 100 patients", directly above its own caption stating
  //      the between-arm difference is not given as a number. Any explicitly
  //      non-significant p-value now suppresses the band.
  //   2. No comparator at all. ANNEXA-4 is a single-arm cohort whose call site
  //      passes controlPct={0} as a placeholder, so the band read "82 extra
  //      recoveries per 100 patients" against an arm that does not exist. That
  //      cannot be inferred from the numbers, so those call sites pass
  //      suppressBand explicitly.
  //
  // Deliberately NOT gated on hasInterval alone: DAWN (Bayesian posterior
  // >0.999) and LASTE (P<0.001) pass no CI to this component and their
  // differences are real. Suppressing those would be the opposite error.
  const showBand =
    arr >= 2 &&
    startIdx <= endIdx &&
    !suppressBand &&
    !pIsNonSignificant &&
    !bandWouldInvertHarm;

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

  const showP = !isBlank(pValue);
  const showInterval = hasInterval;
  // A gap big enough to have drawn a band, that we chose not to draw.
  const bandSuppressedDespiteGap = arr >= 2 && startIdx <= endIdx && !showBand;
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

      {/* ARR threshold notes (ADR-005 Decision 5).
          Gated with the band: when the band is suppressed, telling the reader
          there is "a small absolute difference to interpret with caution" is
          the same over-claim in words that the band made in pixels. Suppression
          is also explained rather than silent, so a missing band reads as a
          deliberate decision and not as a rendering fault. */}
      {bandSuppressedDespiteGap ? (
        <p className="text-xs text-slate-500 italic mt-1">
          {/* Precedence, deliberate and documented on the suppressReason prop:
              harm-direction first (it is the most clinically important thing to
              say), then any EXPLICIT reason the call site gave, then the
              inferred ones. An explicit reason beats an inferred one because the
              call site knows the design and the component only sees numbers. */}
          {bandWouldInvertHarm
            ? 'The intervention arm did worse on this endpoint, so no benefit band is drawn.'
            : suppressReason === 'noninferiority'
              ? 'Noninferiority design, so no superiority band is drawn: this trial tested whether one arm is not worse than the other by more than a pre-set margin, not whether it is better. Whether that margin was met is stated above.'
              : suppressReason === 'ordinal-primary'
                ? 'The primary outcome was an ordinal shift across the whole scale, so no band is drawn over this dichotomized view of it.'
                : suppressBand
                  ? 'Not a randomized comparison, so no difference band is drawn.'
                  : pIsUnparseable
                    ? // The reported value is not a number, so nothing can be
                      // concluded from it here. Do NOT guess at the design: an
                      // earlier version assumed "unparseable implies
                      // noninferiority verdict", which would be false for a
                      // record whose p-value field simply holds a malformed
                      // string. Call sites that know the design pass
                      // suppressReason and never reach this branch.
                      ''
                    : `Difference not statistically significant${showP ? ` (p = ${pTrimmed})` : ''}; no difference band is drawn.`}
        </p>
      ) : (
        <>
          {/* Guard on the ABSOLUTE gap. This branch used to fire on any arr < 2,
              including large NEGATIVE ones, so OPTIMAL-BP (39.4% vs 54.4%,
              arr -15.0) printed "Negligible absolute difference" directly under
              its own STOPPED FOR SAFETY callout reporting that exact deficit.
              Found 2026-07-31. */}
          {Math.abs(arr) < 2 && (
            <p className="text-xs text-slate-500 italic mt-1">
              Negligible absolute difference
            </p>
          )}
          {/* A NEGATIVE gap does not mean the intervention did worse: on a
              bad-outcome endpoint (recurrent stroke, death, sICH) a lower number
              is BETTER. CLOSE is 0% vs 6% recurrent stroke, DEFENSE-PFO 0% vs
              12.9%, REDUCE 1.4% vs 5.4% — all wins for the intervention. The
              component sees only two numbers and cannot know the polarity, so it
              says nothing directional unless the CALL SITE has declared it via
              winnerArm. Caught pre-merge 2026-07-31 after an earlier version of
              this branch told six positive trials their intervention did worse. */}
          {arr <= -2 && primaryResult === 'harm-stopped' && (
            <p className="text-xs text-amber-600 italic mt-1">
              The intervention arm did worse on this endpoint; no benefit band is drawn.
            </p>
          )}
          {arr >= 2 && arr < 5 && (
            <p className="text-xs text-amber-600 italic mt-1">
              Small absolute difference, interpret with caution
            </p>
          )}
        </>
      )}

      {/* Endpoint label */}
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mt-3">
        {endpoint}
      </p>

      {/* Stat row: Risk ratio | 95% CI [tooltip] | p-value */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm mt-4 pt-4 border-t border-slate-100">
        <span className="text-slate-700">
          {effectLabel ?? 'Risk ratio'}{' '}
          <span className="font-semibold tabular-nums">{riskRatio}</span>
        </span>
        {/* One-sided noninferiority trials publish only a lower bound. Passing an empty
            ciHigh renders the bound alone instead of a dangling en-dash, and relabels the
            row so it is not misread as a two-sided 95% interval. */}
        {showInterval ? (
        <span className="flex items-center text-slate-600">
          {intervalLabel ?? (ciHigh ? '95% CI' : 'NI bound')}{' '}
          <span className="font-semibold tabular-nums ml-1">
            {ciHigh ? <>{ciLow}&ndash;{ciHigh}</> : ciLow}
          </span>
          {/* Only attach the frequentist-CI definition to an actual confidence interval.
              A Bayesian posterior or credible interval gets its own wording. */}
          {(!intervalLabel || intervalLabel === '95% CI') ? (
            <MedicalTooltip
              term="Confidence Interval"
              definition={
                MEDICAL_GLOSSARY['confidence-interval'] ||
                'Range of values consistent with the study data. A 95% CI that excludes 1.0 (for a ratio) indicates statistical significance.'
              }
            />
          ) : intervalLabel.includes('sided') ? (
            <MedicalTooltip
              term="One-sided confidence bound"
              definition="A one-sided confidence bound. In a noninferiority trial this bound is compared with the pre-specified noninferiority margin, not with 1.0 or 0."
            />
          ) : (
            <MedicalTooltip
              term="Bayesian posterior"
              definition="Probability, given the trial data and the pre-specified prior, that the treatment is superior. It is not a p-value and not a frequentist confidence interval."
            />
          )}
        </span>
        ) : null}
        {/* Bayesian designs report a posterior probability, not a frequentist p-value.
            Passing an empty pValue omits the row instead of rendering a misleading "p = ". */}
        {showP ? (
          <span
            className="font-bold tabular-nums"
            style={{ color: pSig ? '#16a34a' : '#94a3b8' }}
          >
            p&nbsp;=&nbsp;{pValue}
          </span>
        ) : null}
      </div>
    </div>
  );
};
