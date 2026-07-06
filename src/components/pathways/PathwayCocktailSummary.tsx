/**
 * PathwayCocktailSummary — drawer-rendered live cocktail summary.
 *
 * Implements PATHWAY_SPEC §4.9 (lines 639-725). Composite row showing
 * a running list of currently-selected drugs across multiple parallel
 * category accordions. Used by Migraine (canonical); generalizable to
 * any parallel-selection pathway.
 *
 * Primary rendering surface: <CalculatorDrawer> State B children.
 *
 * Tap-to-edit: each pill is a <button> (chip-as-button per §3.4).
 * Tap calls onEditDrug(pillId); consumer maps pillId to source accordion.
 *
 * Copy-all: primitive owns the clipboard call to enforce the
 * §4.9 anti-pattern (no alert(), inline button state-swap only).
 *
 * Tokens: see PATHWAY_SPEC §4.9 lines 677-684.
 */

import React, { useState, useCallback } from 'react';

export interface CocktailPill {
  pillId: string;   // e.g., 'antiemetic', 'nsaid', 'steroid', 'antihistamine'
  label: string;    // pre-concatenated by consumer: "Prochlorperazine 10mg IV (max 2 doses)"
}

export interface PathwayCocktailSummaryProps {
  drugs: CocktailPill[];            // selection-order; consumer pre-derives + pre-formats with max-dose suffix
  pendingRemoval?: string[];        // pillIds animating out (250ms amber flash + slide-out)
  onEditDrug: (pillId: string) => void;  // consumer scrolls to + opens the source accordion
  emptyStateText?: string;          // default: "Tap a drug to start the cocktail"
}

export const PathwayCocktailSummary: React.FC<PathwayCocktailSummaryProps> = ({
  drugs,
  pendingRemoval = [],
  onEditDrug,
  emptyStateText = 'Tap a drug to start the cocktail',
}) => {
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle');

  const handleCopyAll = useCallback(() => {
    // Primitive owns clipboard call — §4.9 line 717 anti-pattern (no alert(), inline state-swap only)
    navigator.clipboard.writeText(drugs.map(d => d.label).join('\n')).then(() => {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1200);
    });
  }, [drugs]);

  const eyebrow = drugs.length > 0
    ? `COCKTAIL · ${drugs.length} DRUG${drugs.length === 1 ? '' : 'S'}`
    : 'COCKTAIL';

  return (
    <div className="flex flex-col gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl">
      {/* Eyebrow */}
      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
        {eyebrow}
      </div>

      {/* Pill row or empty state */}
      {drugs.length === 0 ? (
        <div className="text-xs italic text-slate-400 py-1">
          {emptyStateText}
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {drugs.map(pill => {
            const isPendingRemoval = pendingRemoval.includes(pill.pillId);
            return (
              // p-3 -m-3 wrap achieves 44px hit target without growing the visible pill (per §3.4)
              <span key={pill.pillId} className="inline-flex p-3 -m-3">
                <button
                  type="button"
                  onClick={() => onEditDrug(pill.pillId)}
                  aria-label={`Edit ${pill.label}, opens ${pill.pillId} accordion`}
                  className={`inline-flex items-center px-3 py-1.5 rounded-full border text-xs font-medium transition-all min-h-[44px] ${
                    isPendingRemoval
                      ? 'bg-amber-50 border-amber-200 text-amber-700 animate-pulse'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:ring-1 hover:ring-neuro-200'
                  }`}
                >
                  {pill.label}
                </button>
              </span>
            );
          })}

          {/* Copy-all button — hidden when no drugs (§4.9 line 706) */}
          <span className="inline-flex p-3 -m-3">
            <button
              type="button"
              onClick={handleCopyAll}
              aria-label={`Copy all ${drugs.length} drug${drugs.length === 1 ? '' : 's'} as order set to clipboard`}
              className="inline-flex items-center px-3 py-1.5 rounded-full bg-neuro-500 text-white text-xs font-semibold hover:bg-neuro-600 transition-colors min-h-[44px]"
            >
              {copyState === 'copied' ? (
                <span className="text-emerald-300 font-semibold">Copied</span>
              ) : (
                'Copy all'
              )}
            </button>
          </span>
        </div>
      )}
    </div>
  );
};

export default PathwayCocktailSummary;
