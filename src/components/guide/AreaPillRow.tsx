// HUB_SPEC §1.4 — Guide hub pill row
// Uses ?area= URL param. Active pill = selected area; re-clicking active → All.
// Mirrors CategoryPillRow (Calculators) and ScenarioPillRow (Pathways) patterns.
import React from 'react';
import type { GuideArea } from '../../data/guideArticles';
import { AREA_META } from '../../data/guideArticles';

interface Props {
  activeArea: GuideArea | null;
  onSelect: (id: GuideArea | null) => void;
}

const AreaPillRow: React.FC<Props> = ({ activeArea, onSelect }) => {
  const pillBase =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-colors flex-shrink-0';
  const inactive = 'bg-white border-slate-200 text-slate-600 font-medium hover:bg-slate-50';
  const active = 'bg-slate-50 border-slate-200 text-slate-900 font-semibold';

  return (
    <div
      role="tablist"
      aria-label="Guide areas"
      className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1 mb-6"
    >
      {/* All pill */}
      <button
        type="button"
        role="tab"
        aria-selected={activeArea === null}
        onClick={() => onSelect(null)}
        className={`${pillBase} ${activeArea === null ? active : inactive}`}
      >
        All
      </button>

      {/* Area pills */}
      {AREA_META.map((area) => {
        const isActive = activeArea === area.id;
        return (
          <button
            key={area.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(isActive ? null : area.id)}
            className={`${pillBase} ${isActive ? active : inactive}`}
          >
            <span
              className={`${area.dotColor} inline-block w-1.5 h-1.5 rounded-full`}
              aria-hidden="true"
            />
            {area.label}
          </button>
        );
      })}
    </div>
  );
};

export default AreaPillRow;
