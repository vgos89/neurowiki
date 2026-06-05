/**
 * HeadacheDifferentialPanel — Frame 2's persistent "Differential so far" panel.
 *
 * The live narrowing surface: each candidate renders as a row with band word +
 * dot meter + bare "N of M" (NO percentages — architect Q7.1). Bands come from
 * `bandPhenotypes` (the engine owns ranking; this only presents). The set-aside
 * (definitionallyExcluded) matches collapse into a demote-don't-delete tray.
 *
 * Architect Q4 resolution: this SUPERSEDES `HeadacheResultList` (the prior result
 * accordion) and is the single v4 differential renderer. `MapperPanel` (the older
 * generic primitive) is not consumed by v4; its only live consumer was the
 * superseded result list. A consolidation note is recorded in TASKS.md.
 *
 * Clinical B3: a promoted-probable in Leading renders its `displaySection` (the
 * §X.5 label) beside the name so a band word never reads as a bare confirmed
 * diagnosis. B2 is enforced upstream in `bandStrengthLabel` (chronic-migraine
 * never "Probable").
 */
import React from 'react';
import { Zap, ChevronDown } from 'lucide-react';
import type { BandedResult, BandedMatch, Band } from '../../../data/headacheBanding';
import { HeadacheDotMeter } from './HeadacheDotMeter';

const BAND_CHIP: Record<Exclude<Band, 'set-aside'>, string> = {
  leading: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  possible: 'text-amber-600 bg-amber-50 border-amber-300',
  'less-likely': 'text-slate-500 bg-slate-50 border-slate-200',
};
const BAND_WORD: Record<Exclude<Band, 'set-aside'>, string> = {
  leading: 'Leading',
  possible: 'Possible',
  'less-likely': 'Less likely',
};
const NAME_EMPHASIS: Record<Exclude<Band, 'set-aside'>, string> = {
  leading: 'text-sm font-semibold text-slate-900',
  possible: 'text-sm font-medium text-slate-700',
  'less-likely': 'text-sm font-medium text-slate-500',
};

function DifferentialRow({ bm }: { bm: BandedMatch }) {
  const band = bm.band as Exclude<Band, 'set-aside'>;
  const m = bm.match;
  return (
    <div className="border-t border-slate-100 px-4 py-2.5 flex items-center justify-between gap-2">
      <div className="min-w-0">
        <div className={`${NAME_EMPHASIS[band]} leading-tight truncate`}>{m.name}</div>
        {/* B3: promoted-probable surfaces its §X.5 label so the name is never bare-confirmed-looking. */}
        {bm.promoted && (
          <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{m.displaySection}</div>
        )}
      </div>
      <div className="flex items-center gap-2.5 shrink-0">
        <HeadacheDotMeter filled={m.criteriaMet} total={m.criteriaTotal} band={bm.band} />
        <span className="text-[12px] text-slate-500 tabular-nums w-[40px] text-right">
          {m.criteriaMet} of {m.criteriaTotal}
        </span>
        <span
          className={`inline-flex items-center rounded-full border text-[10.5px] font-semibold px-2 py-0.5 w-[66px] justify-center ${BAND_CHIP[band]}`}
        >
          {BAND_WORD[band]}
        </span>
      </div>
    </div>
  );
}

export interface HeadacheDifferentialPanelProps {
  banded: BandedResult;
  /** Set-aside tray toggle is owned by the page so it persists across re-renders. */
  setAsideOpen: boolean;
  onToggleSetAside: () => void;
}

export const HeadacheDifferentialPanel: React.FC<HeadacheDifferentialPanelProps> = ({
  banded,
  setAsideOpen,
  onToggleSetAside,
}) => {
  const rows: BandedMatch[] = [...banded.leading, ...banded.possible, ...banded.lessLikely];

  return (
    <section className="rounded-xl border border-slate-100 shadow-sm bg-white overflow-hidden">
      <div className="flex items-center justify-between px-4 pt-3 pb-2">
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Differential so far</div>
        <div className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
          <Zap className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
          narrows live
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="border-t border-slate-100 px-4 py-4 text-[13px] text-slate-400 leading-snug">
          Answer a question to start narrowing the differential.
        </div>
      ) : (
        rows.map(bm => <DifferentialRow key={bm.match.phenotypeId} bm={bm} />)
      )}

      {banded.setAside.length > 0 && (
        <button
          type="button"
          onClick={onToggleSetAside}
          aria-expanded={setAsideOpen}
          className="w-full border-t border-slate-100 px-4 py-2.5 min-h-[44px] flex items-center gap-1.5 text-[12px] text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors text-left"
        >
          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 transition-transform ${setAsideOpen ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
          <span>
            <span className="font-medium text-slate-600">{banded.setAside.length} set aside</span> · need confirmation
          </span>
        </button>
      )}

      {setAsideOpen &&
        banded.setAside.map(bm => (
          <div
            key={bm.match.phenotypeId}
            className="border-t border-slate-50 px-4 py-2 flex items-center justify-between gap-2 bg-slate-50/40"
          >
            <div className="text-[13px] text-slate-500 leading-tight truncate min-w-0">{bm.match.name}</div>
            {bm.match.exclusionReason && (
              <div className="text-[11px] text-slate-400 leading-tight shrink-0 max-w-[55%] text-right truncate">
                {bm.match.exclusionReason}
              </div>
            )}
          </div>
        ))}
    </section>
  );
};
