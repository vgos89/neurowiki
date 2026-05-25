// HUB_SPEC §1.4 — pill row: All · Severity · Risk · Classification
// HUB_SPEC §1.4.2 — active pill = ?category={id}; re-clicking active pill → All
// Uses ?category= param (NOT ?fn= from HUB_SPEC §4 routing table — per Prompt 5d §2)
import React from 'react';
import type { FnCategory } from '../../data/calculators';
import { FN_CATEGORIES } from '../../data/calculators';

interface Props {
  activeCategory: FnCategory | null;
  onSelect: (id: FnCategory | null) => void;
}

export const CategoryPillRow: React.FC<Props> = ({ activeCategory, onSelect }) => {
  // py-2 + min-h-[44px] meets the WCAG 2.5.5 / Apple HIG 44pt floor.
  // Previously py-1.5 → effective ~32px height (UX-audit 2026-05-24
  // mobile-target sweep on non-pathway surfaces).
  const pillBase =
    'inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-full text-[13px] border transition-colors flex-shrink-0 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none';
  const inactive = 'bg-white border-slate-200 text-slate-600 font-medium hover:bg-slate-50';
  const active = 'bg-neuro-500 border-neuro-500 text-white font-semibold';

  return (
    <div
      role="tablist"
      aria-label="Calculator categories"
      className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 mb-6"
    >
      {/* All pill */}
      <button
        type="button"
        role="tab"
        aria-selected={activeCategory === null}
        onClick={() => onSelect(null)}
        className={`${pillBase} ${activeCategory === null ? active : inactive}`}
      >
        All
      </button>

      {/* Category pills */}
      {FN_CATEGORIES.map((cat) => {
        const isActive = activeCategory === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(isActive ? null : cat.id)}
            className={`${pillBase} ${isActive ? active : inactive}`}
          >
            <span
              className={`${cat.dotClass} inline-block w-1.5 h-1.5 rounded-full`}
              aria-hidden="true"
            />
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};

export default CategoryPillRow;
