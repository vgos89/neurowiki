// HUB_SPEC v1.3 — Guide hub page
// Anatomy: hero → featured strip → pill row → area sections.
// ?area= URL param drives active pill (null = All).
// ?favs=true URL param drives favourites filter via useFavorites.
// Replaces ResidentToolkit.tsx as the /guide route component.
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import GuideHero from '../components/guide/GuideHero';
import GuideFeaturedStrip from '../components/guide/GuideFeaturedStrip';
import AreaPillRow from '../components/guide/AreaPillRow';
import AreaSection from '../components/guide/AreaSection';
import { GUIDE_ARTICLES, AREA_META } from '../data/guideArticles';
import type { GuideArea } from '../data/guideArticles';
import { useFavorites } from '../hooks/useFavorites';

// HUB_SPEC §9 gate 4 — dynamic SEO title
const BASE_TITLE = 'Neurology Guide: Clinical Protocols & References | NeuroWiki';

export default function Guide() {
  const [searchParams, setSearchParams] = useSearchParams();

  // HUB_SPEC §1.4.2 — active area from URL; null = All
  const rawArea = searchParams.get('area');
  const activeArea: GuideArea | null =
    rawArea && AREA_META.some((a) => a.id === rawArea)
      ? (rawArea as GuideArea)
      : null;

  // HUB_SPEC §6 — ?favs=true
  const favsActive = searchParams.get('favs') === 'true';

  const { isFavorite, toggleFavorite } = useFavorites();

  // Pill selection updates URL; re-clicking active pill → All
  const handleAreaSelect = (id: GuideArea | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === null) {
          next.delete('area');
        } else {
          next.set('area', id);
        }
        return next;
      },
      { replace: false },
    );
  };

  // Dev warning for unknown area param
  useEffect(() => {
    if (rawArea && !AREA_META.some((a) => a.id === rawArea) && import.meta.env.DEV) {
      console.warn(`[Guide] Unknown area param: ${rawArea}`);
    }
  }, [rawArea]);

  // HUB_SPEC §9 gate 4 — dynamic document title
  useEffect(() => {
    if (activeArea) {
      const meta = AREA_META.find((a) => a.id === activeArea);
      if (meta) {
        document.title = `${meta.label}: Guide | NeuroWiki`;
      }
    } else {
      document.title = BASE_TITLE;
    }
    return () => {
      document.title = 'NeuroWiki';
    };
  }, [activeArea]);

  // Determine which sections to render
  const visibleAreas = activeArea
    ? AREA_META.filter((a) => a.id === activeArea)
    : AREA_META;

  function getArticlesForArea(area: GuideArea): typeof GUIDE_ARTICLES {
    let list = GUIDE_ARTICLES.filter((a) => a.area === area);
    if (favsActive) {
      list = list.filter((a) => isFavorite(a.id));
    }
    return list;
  }

  // Global empty state — favourites active, no results in any visible section
  const totalVisible = visibleAreas.reduce(
    (sum, area) => sum + getArticlesForArea(area.id).length,
    0,
  );
  const showGlobalEmpty = favsActive && totalVisible === 0;

  return (
    <div className="px-5 pt-7 pb-24">
      {/* HUB_SPEC §1.1 — Hero */}
      <GuideHero />

      {/* Quick-access strip */}
      <GuideFeaturedStrip />

      {/* HUB_SPEC §1.4 — Pill row */}
      <AreaPillRow activeArea={activeArea} onSelect={handleAreaSelect} />

      {/* HUB_SPEC §1.5 / §1.6 — Area sections */}
      <div role="tabpanel">
        {showGlobalEmpty ? (
          <p className="text-sm text-slate-500 text-center py-12">
            You haven&apos;t favourited any articles yet. Tap the star on any article to add it
            here.
          </p>
        ) : (
          visibleAreas.map((area) => (
            <AreaSection
              key={area.id}
              area={area.id}
              articles={getArticlesForArea(area.id)}
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
