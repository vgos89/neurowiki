// HUB_SPEC §1.5 — section header: colored dot + title + count + lede
// HUB_SPEC §1.6 — row cards: reuse ToolRowCard as-is (no fork)
// HUB_SPEC §1.6.4 — trail slot: score range (numeric max bolded) or scoreLabel
// HUB_SPEC §7 — empty state: muted italic message when favourites filter empties a section
//
// 2026-05-23: collapsible accordion pattern mirroring TrialsPage catalog
// (per V 2026-05-23 design request to harmonize catalog/calculator hub
// chrome). Categories collapse by default; auto-expand when a single
// category filter is active or favourites filter is on. Chevron rotates
// to indicate state. Lede shows in both collapsed and expanded states.
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
  /** When true, the calculator list is hidden and only the header shows. */
  isCollapsed: boolean;
  /** Toggle handler — parent owns the collapsed-categories Set. */
  onToggle: () => void;
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

interface SectionHeaderProps {
  meta: typeof FN_CATEGORIES[number];
  count: number;
  isCollapsed: boolean;
  onToggle: () => void;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ meta, count, isCollapsed, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    aria-expanded={!isCollapsed}
    aria-controls={`calc-section-body-${meta.id}`}
    className="w-full flex items-start justify-between gap-3 px-0 py-4 text-left hover:bg-slate-50/50 transition-colors min-h-[44px]"
  >
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2.5 mb-1">
        <div className={`w-2 h-2 rounded-full ${meta.dotClass} flex-shrink-0`} aria-hidden="true" />
        <h2 className="text-[15px] font-semibold flex-1 text-slate-900">{meta.label}</h2>
        <span className="text-[12px] text-slate-400 font-medium">{count}</span>
      </div>
      <div className="text-[12.5px] text-slate-500 pl-[18px] leading-snug">{meta.lede}</div>
    </div>
    <svg
      className="w-4 h-4 text-slate-400 flex-shrink-0 mt-1"
      style={{
        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
        transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  </button>
);

export const CategorySection: React.FC<Props> = ({
  fnCategory,
  calculators,
  isFavourited,
  onToggleFavourite,
  favsActive,
  isCollapsed,
  onToggle,
}) => {
  const meta = FN_CATEGORIES.find((c) => c.id === fnCategory)!;

  // HUB_SPEC §7 — empty state when favourites filter empties the section
  if (calculators.length === 0 && favsActive) {
    return (
      <section className="mt-[26px] first:mt-0 border-b border-slate-100" role="tabpanel">
        <SectionHeader meta={meta} count={0} isCollapsed={isCollapsed} onToggle={onToggle} />
        {!isCollapsed && (
          <div
            id={`calc-section-body-${meta.id}`}
            className="text-sm text-slate-400 italic px-[18px] pb-3"
          >
            No {meta.label.toLowerCase()} calculators in your favourites yet.
          </div>
        )}
      </section>
    );
  }

  if (calculators.length === 0) return null;

  return (
    <section className="mt-[26px] first:mt-0 border-b border-slate-100" role="tabpanel">
      <SectionHeader
        meta={meta}
        count={calculators.length}
        isCollapsed={isCollapsed}
        onToggle={onToggle}
      />

      {/* pl-[18px] nests the row list one level under the category label —
          each row's dot aligns beneath the category title rather than the
          category dot — so the hierarchy reads at a glance. (V direction
          2026-06-10.) */}
      {!isCollapsed && (
        <div id={`calc-section-body-${meta.id}`} className="pl-[18px]">
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
        </div>
      )}
    </section>
  );
};

export default CategorySection;
