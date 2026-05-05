// HOME_SPEC §1.3 — pill row (6 pills incl. All), URL-driven
// HOME_SPEC §1.3.2 — active pill = ?scenario= query param
// HOME_SPEC §1.3.4 — horizontal scroll, hidden scrollbar on mobile
import React from 'react';
import type { Scenario } from '../../data/scenarios';

interface Props {
  scenarios: Scenario[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
}

export const ScenarioPillRow: React.FC<Props> = ({
  scenarios,
  activeId,
  onSelect,
}) => {
  const isAllActive = activeId === null;

  const pillBaseClasses =
    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-colors flex-shrink-0';
  const inactiveClasses =
    'bg-white border-slate-200 text-slate-600 font-medium hover:bg-slate-50';
  const activeClasses =
    'bg-slate-50 border-slate-200 text-slate-900 font-semibold';

  return (
    <div
      role="tablist"
      aria-label="Clinical scenarios"
      className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-1"
    >
      <button
        type="button"
        role="tab"
        aria-selected={isAllActive}
        onClick={() => onSelect(null)}
        className={`${pillBaseClasses} ${
          isAllActive ? activeClasses : inactiveClasses
        }`}
      >
        All
      </button>
      {scenarios.map((s) => {
        const isActive = activeId === s.id;
        return (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onSelect(isActive ? null : s.id)}
            className={`${pillBaseClasses} ${
              isActive ? activeClasses : inactiveClasses
            }`}
          >
            <span
              className={`${s.pillDotClass} inline-block w-1.5 h-1.5 rounded-full`}
              aria-hidden="true"
            />
            {s.pillLabel}
          </button>
        );
      })}
    </div>
  );
};

export default ScenarioPillRow;
