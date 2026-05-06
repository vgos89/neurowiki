// PATHWAY_SPEC §1.4 — Scenario pill row for Pathways hub
// URL param: ?scenario= (matches Home's ?scenario= vocabulary per HUB_SPEC §1.4.2 note)
// Re-clicking the active pill resets to All (null).
// Visual contract: explicit Tailwind matching Home ScenarioPillRow / CategoryPillRow (no shared abstraction).
import React from 'react';
import { PATHWAY_SCENARIOS } from '../../data/pathways';
import type { PathwayScenarioId } from '../../data/pathways';

interface ScenarioPillRowProps {
  activeScenario: PathwayScenarioId | null;
  onSelect: (id: PathwayScenarioId | null) => void;
}

const pillBase =
  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] border transition-colors flex-shrink-0';
const pillInactive =
  'bg-white border-slate-200 text-slate-600 font-medium hover:bg-slate-50';
const pillActive =
  'bg-slate-50 border-slate-200 text-slate-900 font-semibold';

export default function ScenarioPillRow({ activeScenario, onSelect }: ScenarioPillRowProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by clinical scenario"
      className="flex gap-2 overflow-x-auto pb-1 mb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {/* All pill */}
      <button
        role="tab"
        aria-selected={activeScenario === null}
        onClick={() => onSelect(null)}
        className={`${pillBase} ${activeScenario === null ? pillActive : pillInactive}`}
      >
        All
      </button>

      {PATHWAY_SCENARIOS.map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={activeScenario === s.id}
          onClick={() => onSelect(activeScenario === s.id ? null : s.id)}
          className={`${pillBase} ${activeScenario === s.id ? pillActive : pillInactive}`}
        >
          <span className={`${s.dotClass} inline-block w-1.5 h-1.5 rounded-full`} />
          {s.pillLabel}
        </button>
      ))}
    </div>
  );
}
