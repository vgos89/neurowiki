// HOME_SPEC v1.4 — Home page body
// HOME_SPEC §3 — component decomposition
// HOME_SPEC §2 — state machine (pill URL-driven, showMore localStorage,
//                expansion React-local)
// LAYOUT_SPEC §7.2 — zone-reference applied by Layout shell (NOT in this file)
import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import HomeHero from '../components/home/HomeHero';
import FeaturedRail from '../components/home/FeaturedRail';
import SavedCasesTile from '../components/home/SavedCasesTile';
import ScenarioPillRow from '../components/home/ScenarioPillRow';
import ScenarioSection from '../components/home/ScenarioSection';
import ShowMoreToggle from '../components/home/ShowMoreToggle';
import RecentlyViewed from '../components/home/RecentlyViewed';
import TrendingTrials from '../components/home/TrendingTrials';
import { SCENARIOS, VISIBLE_BEFORE_FOLD } from '../data/scenarios';
import { useShowMore } from '../hooks/useShowMore';
import { useScenarioExpansion } from '../hooks/useScenarioExpansion';
import { useRecents } from '../hooks/useRecents';
import { useFavorites } from '../hooks/useFavorites';

const Home: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeScenarioId = searchParams.get('scenario');

  // HOME_SPEC §1.4.5 — unknown scenario id → fall back to All (with dev warning)
  const validScenarioId = SCENARIOS.find((s) => s.id === activeScenarioId)
    ? activeScenarioId
    : null;
  if (
    activeScenarioId &&
    !validScenarioId &&
    import.meta.env.DEV
  ) {
    console.warn(`[Home] Unknown scenario id: ${activeScenarioId}`);
  }

  const isAllView = !validScenarioId;
  const { isExpanded: showMoreExpanded, toggle: toggleShowMore } = useShowMore();
  const { expandedIds, toggle: toggleExpansion } =
    useScenarioExpansion(SCENARIOS);
  const { recents } = useRecents();
  const { isFavorite, toggleFavorite } = useFavorites();

  const handlePillSelect = (id: string | null) => {
    if (id === null) {
      setSearchParams({}, { replace: false });
    } else {
      setSearchParams({ scenario: id }, { replace: false });
    }
  };

  // HOME_SPEC §1.4.5 — sections to display
  const visibleScenarios = isAllView
    ? showMoreExpanded
      ? SCENARIOS
      : SCENARIOS.slice(0, VISIBLE_BEFORE_FOLD)
    : SCENARIOS.filter((s) => s.id === validScenarioId);

  // HOME_SPEC §9 gate 4 — dynamic SEO title for scenario active state
  useEffect(() => {
    if (validScenarioId) {
      const scenario = SCENARIOS.find((s) => s.id === validScenarioId);
      if (scenario) {
        document.title = `${scenario.title} tools — NeuroWiki`;
      }
    } else {
      document.title = 'NeuroWiki — Neurology Clinical Decision Support';
    }
    return () => {
      document.title = 'NeuroWiki';
    };
  }, [validScenarioId]);

  return (
    <div className="px-5 pt-7 pb-24">
      <HomeHero />

      {isAllView && <FeaturedRail />}
      {isAllView && <SavedCasesTile />}

      <ScenarioPillRow
        scenarios={SCENARIOS}
        activeId={validScenarioId}
        onSelect={handlePillSelect}
      />

      <div className="mt-4" role="tabpanel">
        {visibleScenarios.map((scenario, idx) => {
          // When a scenario pill is active, the matching scenario is always
          // expanded regardless of per-section state (HOME_SPEC §1.4.4).
          const isExpanded = isAllView
            ? expandedIds.has(scenario.id)
            : true;
          return (
            <ScenarioSection
              key={scenario.id}
              scenario={scenario}
              isExpanded={isExpanded}
              onToggle={() => toggleExpansion(scenario.id)}
              isFirstSection={idx === 0}
              isFavourited={(id) => isFavorite(id)}
              onToggleFavourite={(id) => toggleFavorite(id)}
            />
          );
        })}
      </div>

      {isAllView && SCENARIOS.length > VISIBLE_BEFORE_FOLD && (
        <ShowMoreToggle
          isExpanded={showMoreExpanded}
          onToggle={toggleShowMore}
        />
      )}

      {isAllView && recents.length > 0 && <RecentlyViewed recents={recents} />}

      {isAllView && <TrendingTrials />}
    </div>
  );
};

export default Home;
