// PATHWAY_SPEC §1.5 — Scenario section for Pathways hub
// Trail slot: "<N> steps" with N bolded per HUB_SPEC §1.6.4.
// Empty-state: shown only when favsActive is true and the list is empty.
import ToolRowCard from '../hub/ToolRowCard';
import type { PathwayEntry, PathwayScenarioMeta } from '../../data/pathways';

interface ScenarioSectionProps {
  scenario: PathwayScenarioMeta;
  pathways: PathwayEntry[];
  isFavourited: (id: string) => boolean;
  onToggleFavourite: (id: string) => void;
  favsActive: boolean;
}

export default function ScenarioSection({
  scenario,
  pathways,
  isFavourited,
  onToggleFavourite,
  favsActive,
}: ScenarioSectionProps) {
  // Non-favs mode with no rows → section is removed from DOM (HUB_SPEC §5)
  if (pathways.length === 0 && !favsActive) return null;

  return (
    <section className="mb-8" aria-label={scenario.pillLabel}>
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1">
        <span className={`dot ${scenario.dotClass}`} />
        <h2 className="text-[13px] font-bold uppercase tracking-[0.08em] text-slate-700">
          {scenario.pillLabel}
        </h2>
      </div>
      <p className="text-xs text-slate-400 mb-3 ml-4">{scenario.lede}</p>

      {pathways.length === 0 ? (
        /* Per-section empty state — only reachable when favsActive */
        <p className="text-sm text-slate-500 text-center py-6">
          No favourited pathways in this category.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-100 overflow-hidden">
          {pathways.map((p) => (
            <ToolRowCard
              key={p.id}
              href={p.path}
              category={p.rowCategory}
              title={p.name}
              description={p.description}
              trail={
                <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap">
                  <strong>{p.stepCount}</strong> steps
                </span>
              }
              isFavourited={isFavourited(p.id)}
              onToggleFavourite={() => onToggleFavourite(p.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
