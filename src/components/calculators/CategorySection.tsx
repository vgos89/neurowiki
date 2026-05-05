// HUB_SPEC §1.5 — section header: colored dot + title + count + lede
// HUB_SPEC §1.6 — row cards: reuse ToolRowCard as-is (no fork)
// HUB_SPEC §1.6.4 — trail slot: score range (numeric max bolded) or scoreLabel
// HUB_SPEC §7 — empty state: muted italic message when favourites filter empties a section
import React from 'react';
import type { CalculatorEntry, FnCategory } from '../../data/calculators';
import { FN_CATEGORIES } from '../../data/calculators';
import ToolRowCard from '../hub/ToolRowCard';

interface Props {
  fnCategory: FnCategory;
  calculators: CalculatorEntry[];
  isFavourited: (id: string) => boolean;
  onToggleFavourite: (id: string) => void;
  favsActive: boolean;
}

function buildTrail(entry: CalculatorEntry): React.ReactNode {
  if (entry.scoreRange) {
    return (
      <span className="text-[11.5px] text-slate-500 font-medium">
        {entry.scoreRange.min}–
        <span className="text-slate-900 font-semibold">{entry.scoreRange.max}</span>
      </span>
    );
  }
  if (entry.scoreLabel) {
    return (
      <span className="text-[11.5px] text-slate-500">{entry.scoreLabel}</span>
    );
  }
  return null;
}

export const CategorySection: React.FC<Props> = ({
  fnCategory,
  calculators,
  isFavourited,
  onToggleFavourite,
  favsActive,
}) => {
  const meta = FN_CATEGORIES.find((c) => c.id === fnCategory)!;

  // HUB_SPEC §7 — empty state when favourites filter empties the section
  if (calculators.length === 0 && favsActive) {
    return (
      <section className="mt-[26px] first:mt-0" role="tabpanel">
        {/* Section header */}
        <div className="pb-3 mb-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5 mb-1">
            <div className={`w-2 h-2 rounded-full ${meta.dotClass}`} aria-hidden="true" />
            <h2 className="text-[15px] font-semibold flex-1 text-slate-900">{meta.label}</h2>
            <span className="text-[12px] text-slate-400 font-medium">0</span>
          </div>
          <div className="text-[12.5px] text-slate-500 pl-[18px] leading-snug">{meta.lede}</div>
        </div>
        {/* HUB_SPEC §7 empty state */}
        <div className="text-sm text-slate-400 italic px-[18px] py-3">
          No {meta.label.toLowerCase()} calculators in your favourites yet.
        </div>
      </section>
    );
  }

  if (calculators.length === 0) return null;

  return (
    <section className="mt-[26px] first:mt-0" role="tabpanel">
      {/* HUB_SPEC §1.5 section header */}
      <div className="pb-3 mb-0 border-b border-slate-200">
        <div className="flex items-center gap-2.5 mb-1">
          <div className={`w-2 h-2 rounded-full ${meta.dotClass}`} aria-hidden="true" />
          <h2 className="text-[15px] font-semibold flex-1 text-slate-900">{meta.label}</h2>
          <span className="text-[12px] text-slate-400 font-medium">{calculators.length}</span>
        </div>
        <div className="text-[12.5px] text-slate-500 pl-[18px] leading-snug">{meta.lede}</div>
      </div>

      {/* HUB_SPEC §1.6 row cards */}
      {calculators.map((calc) => (
        <ToolRowCard
          key={calc.id}
          href={calc.path}
          category={calc.fnCategory}
          title={calc.name}
          description={calc.description}
          trail={buildTrail(calc)}
          isFavourited={isFavourited(calc.id)}
          onToggleFavourite={() => onToggleFavourite(calc.id)}
        />
      ))}
    </section>
  );
};

export default CategorySection;
