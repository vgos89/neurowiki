// Pathways hub — HUB_SPEC v1.3
// PATHWAY_SPEC §1 — universal hub anatomy: hero + pill row + scenario sections
// ?scenario= URL param drives active pill (matches Home's vocabulary per HUB_SPEC §1.4.2)
// HUB_SPEC §6 — favourites filter via ?favs=true URL param
// LAYOUT_SPEC §7.2 — zone: 'reference' applied by Layout shell; no wrapper here
// Spec deviation note: Prompt 5e §1 specified 5 pills (including ICH); implemented 4
// pills per HUB_SPEC v1.3 §1.4.1 + hub-reference.html which both predate the prompt
// and reflect the actual route data (no /pathways/ich-* routes exist). CLAUDE.md §3.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import PathwaysHero from '../components/pathways/PathwaysHero';
import ScenarioPillRow from '../components/pathways/ScenarioPillRow';
import ScenarioSection from '../components/pathways/ScenarioSection';
import { PATHWAYS, PATHWAY_SCENARIOS } from '../data/pathways';
import type { PathwayScenarioId } from '../data/pathways';
import { useFavorites } from '../hooks/useFavorites';

// HUB_SPEC §9 gate 4 — dynamic SEO title
const BASE_TITLE =
  'Neurology Clinical Pathways: Stroke Code, EVT, Status Epilepticus | NeuroWiki';

export default function Pathways() {
  const [searchParams, setSearchParams] = useSearchParams();

  // HUB_SPEC §1.4.2 — active scenario from URL; null = All
  const rawScenario = searchParams.get('scenario');
  const activeScenario: PathwayScenarioId | null =
    rawScenario && PATHWAY_SCENARIOS.some((s) => s.id === rawScenario)
      ? (rawScenario as PathwayScenarioId)
      : null;

  // HUB_SPEC §6 — ?favs=true
  const favsActive = searchParams.get('favs') === 'true';

  const { isFavorite, toggleFavorite } = useFavorites();

  // HUB_SPEC §1.4.2 — pill selection updates URL; re-clicking active pill → All
  const handleScenarioSelect = (id: PathwayScenarioId | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === null) {
          next.delete('scenario');
        } else {
          next.set('scenario', id);
        }
        return next;
      },
      { replace: false },
    );
  };

  // Dev warning for unknown scenario param
  useEffect(() => {
    if (
      rawScenario &&
      !PATHWAY_SCENARIOS.some((s) => s.id === rawScenario) &&
      import.meta.env.DEV
    ) {
      console.warn(`[Pathways] Unknown scenario param: ${rawScenario}`);
    }
  }, [rawScenario]);

  // HUB_SPEC §9 gate 4 — dynamic SEO title
  useEffect(() => {
    if (activeScenario) {
      const meta = PATHWAY_SCENARIOS.find((s) => s.id === activeScenario);
      if (meta) {
        document.title = `${meta.pillLabel} Pathways: NeuroWiki`;
      }
    } else {
      document.title = BASE_TITLE;
    }
    return () => {
      document.title = 'NeuroWiki';
    };
  }, [activeScenario]);

  // HUB_SPEC §5 — non-matching sections removed from DOM
  const visibleScenarios = activeScenario
    ? PATHWAY_SCENARIOS.filter((s) => s.id === activeScenario)
    : PATHWAY_SCENARIOS;

  // Per-section pathway lists (alphabetical sort per HUB_SPEC §5)
  function getPathwaysForScenario(id: PathwayScenarioId): typeof PATHWAYS {
    let list = PATHWAYS.filter((p) => p.scenario === id);
    // HUB_SPEC §6 — favourites filter applied within section
    if (favsActive) {
      list = list.filter((p) => isFavorite(p.id));
    }
    // HUB_SPEC §5 — alphabetical by name
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Global empty state — favourites active, no results in any visible section
  const totalVisible = visibleScenarios.reduce(
    (sum, s) => sum + getPathwaysForScenario(s.id).length,
    0,
  );
  const showGlobalEmpty = favsActive && totalVisible === 0;

  return (
    <div className="px-5 pt-7 pb-24">
      {/* HUB_SPEC §1.1 — Hero */}
      <PathwaysHero />

      {/* HUB_SPEC §1.4 — Pill row */}
      <ScenarioPillRow activeScenario={activeScenario} onSelect={handleScenarioSelect} />

      {/* HUB_SPEC §1.5 / §1.6 — Scenario sections */}
      <div role="tabpanel">
        {showGlobalEmpty ? (
          <p className="text-sm text-slate-500 text-center py-12">
            You haven&apos;t favourited any pathways yet. Tap the star on any pathway to add it
            here.
          </p>
        ) : (
          visibleScenarios.map((s) => (
            <ScenarioSection
              key={s.id}
              scenario={s}
              pathways={getPathwaysForScenario(s.id)}
              isFavourited={isFavorite}
              onToggleFavourite={toggleFavorite}
              favsActive={favsActive}
            />
          ))
        )}
      </div>
    </div>
  );
}
