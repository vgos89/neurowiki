// PATHWAY_SPEC §1.4 — Scenario pill row for Pathways hub
// URL param: ?scenario= (matches Home's ?scenario= vocabulary per HUB_SPEC §1.4.2 note)
// Re-clicking the active pill resets to All (null).
import React from 'react';
import { PATHWAY_SCENARIOS } from '../../data/pathways';
import type { PathwayScenarioId } from '../../data/pathways';

interface ScenarioPillRowProps {
  activeScenario: PathwayScenarioId | null;
  onSelect: (id: PathwayScenarioId | null) => void;
}

export default function ScenarioPillRow({ activeScenario, onSelect }: ScenarioPillRowProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter by clinical scenario"
      className="flex gap-2 overflow-x-auto pb-1 mb-6 scrollbar-none"
    >
      {/* All pill */}
      <button
        role="tab"
        aria-selected={activeScenario === null}
        onClick={() => onSelect(null)}
        className={`pill flex-shrink-0 ${activeScenario === null ? 'pill-active' : ''}`}
      >
        All
      </button>

      {PATHWAY_SCENARIOS.map((s) => (
        <button
          key={s.id}
          role="tab"
          aria-selected={activeScenario === s.id}
          onClick={() => onSelect(activeScenario === s.id ? null : s.id)}
          className={`pill flex-shrink-0 flex items-center gap-1.5 ${
            activeScenario === s.id ? 'pill-active' : ''
          }`}
        >
          <span className={`dot ${s.dotClass}`} />
          {s.pillLabel}
        </button>
      ))}
    </div>
  );
}
