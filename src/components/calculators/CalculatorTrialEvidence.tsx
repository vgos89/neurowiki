/**
 * CalculatorTrialEvidence — renders the list of trials that informed a
 * calculator's clinical thresholds, sourced from src/lib/calculatorTrialMap.ts.
 *
 * Rendered on STRONG-confidence calculators per V approval 2026-05-21
 * ("same thing with the calculators page trials that inform the thresholds")
 * and the link-graph audit's §4.3 recommendation. WEAK / MEDIUM / NA
 * calculators are NOT rendered through this component — the data module
 * carries the confidence annotation but the rendering layer enforces the
 * STRONG-only display rule.
 *
 * Surface anatomy (mobile-first):
 *   - Eyebrow label "Trials informing thresholds"
 *   - Short note paragraph (from CALCULATOR_TRIAL_MAP[id].note)
 *   - Chip-grid of trial cards: trial name, year, one-line description,
 *     each chip links to /trials/<trial-id>
 *
 * The chip text is derived from findTrialById at render time so trial
 * renames automatically propagate — no clinical content authored in this
 * component.
 *
 * data-claim NOT applied: this component renders trial pointers (links),
 * not clinical claims. The trial pages themselves carry the registered
 * clinical claims.
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  CALCULATOR_TRIAL_MAP,
  type CalculatorId,
} from '../../lib/calculatorTrialMap';
import { findTrialById } from '../../data/trialListData';

interface CalculatorTrialEvidenceProps {
  calculatorId: CalculatorId;
}

export const CalculatorTrialEvidence: React.FC<CalculatorTrialEvidenceProps> = ({
  calculatorId,
}) => {
  const entry = CALCULATOR_TRIAL_MAP[calculatorId];
  if (!entry || entry.confidence !== 'strong') {
    // Fail-safe: non-STRONG calculators (WEAK / MEDIUM / NA) do not render
    // this surface. Render nothing.
    return null;
  }

  // Resolve each trial id to its catalog entry. Silently drop unresolved
  // ids so a stale mapping doesn't crash the calculator page.
  const trials = entry.trialIds
    .map((id) => ({ id, item: findTrialById(id) }))
    .filter((t): t is { id: string; item: NonNullable<ReturnType<typeof findTrialById>> } =>
      t.item !== undefined,
    );

  if (trials.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-slate-100 bg-white overflow-hidden mt-4"
      aria-label="Trials informing this calculator's thresholds"
    >
      <div className="px-4 py-2.5 border-b border-slate-100 bg-slate-50/60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Trials informing thresholds
        </p>
      </div>

      {entry.note && (
        <p className="px-4 pt-3 text-xs text-slate-600 leading-relaxed">
          {entry.note}
        </p>
      )}

      <ul className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {trials.map(({ id, item }) => (
          <li key={id}>
            <Link
              to={`/trials/${id}`}
              className="block rounded-lg border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 transition-colors px-3 py-2.5"
            >
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-sm font-semibold text-slate-900 truncate">
                  {item.name}
                </span>
                {item.year > 0 && (
                  <span className="text-[11px] text-slate-400 tabular-nums flex-shrink-0">
                    {item.year}
                  </span>
                )}
              </div>
              {item.description && (
                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                  {item.description}
                </p>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default CalculatorTrialEvidence;
