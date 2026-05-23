// HUB_SPEC v1.2 — Calculators hub page
// HUB_SPEC §1 — universal hub anatomy: hero + pill row + category sections
// HUB_SPEC §1.4.2 — ?category= URL param drives active pill (per Prompt 5d §2)
//   NOTE: HUB_SPEC §4 routing table shows ?fn= for Calculators; Prompt 5d §2
//   overrides to ?category= to avoid collision with Home's ?scenario= param.
//   ADR: this deviation is intentional and PM-approved per prompt execution.
// HUB_SPEC §6 — favourites filter via ?favs=true URL param
// LAYOUT_SPEC §7.2 — zone: 'reference' applied by Layout shell; no wrapper here
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CalculatorsHero from '../components/calculators/CalculatorsHero';
import CategoryPillRow from '../components/calculators/CategoryPillRow';
import CategorySection from '../components/calculators/CategorySection';
import { CALCULATORS, FN_CATEGORIES } from '../data/calculators';
import type { FnCategory } from '../data/calculators';
import { useFavorites } from '../hooks/useFavorites';

// HUB_SPEC §9 gate 4 — dynamic SEO title
const BASE_TITLE = 'Neurology Calculators — NIHSS, ICH Score, GCS & More | NeuroWiki';

export default function Calculators() {
  const [searchParams, setSearchParams] = useSearchParams();

  // HUB_SPEC §1.4.2 — active category from URL; null = All
  const rawCat = searchParams.get('category');
  const activeCat: FnCategory | null =
    rawCat && FN_CATEGORIES.some((c) => c.id === rawCat)
      ? (rawCat as FnCategory)
      : null;

  // HUB_SPEC §6 — ?favs=true
  const favsActive = searchParams.get('favs') === 'true';

  const { isFavorite, toggleFavorite } = useFavorites();

  // Collapsed-by-default category accordions, mirroring the trials catalog
  // pattern. Single Set holds the categories that the user has explicitly
  // collapsed; combined with the auto-expand rules below, this lets a single
  // active pill or favourites filter override the default-collapsed state.
  const [collapsedCategories, setCollapsedCategories] = useState<Set<FnCategory>>(
    () => new Set(FN_CATEGORIES.map((c) => c.id)),
  );

  const toggleCategory = (cat: FnCategory) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };

  // HUB_SPEC §1.4.2 — pill selection updates URL; re-clicking active pill → All
  const handlePillSelect = (id: FnCategory | null) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (id === null) {
          next.delete('category');
        } else {
          next.set('category', id);
        }
        return next;
      },
      { replace: false },
    );
  };

  // HUB_SPEC §1.4.2 — dev warning for unknown category param
  useEffect(() => {
    if (rawCat && !FN_CATEGORIES.some((c) => c.id === rawCat) && import.meta.env.DEV) {
      console.warn(`[Calculators] Unknown category param: ${rawCat}`);
    }
  }, [rawCat]);

  // HUB_SPEC §9 gate 4 — dynamic SEO title
  useEffect(() => {
    if (activeCat) {
      const meta = FN_CATEGORIES.find((c) => c.id === activeCat);
      if (meta) {
        document.title = `${meta.label} Calculators — NeuroWiki`;
      }
    } else {
      document.title = BASE_TITLE;
    }
    return () => {
      document.title = 'NeuroWiki';
    };
  }, [activeCat]);

  // Determine which sections to render (HUB_SPEC §5 — non-matching removed from DOM)
  const visibleCategories = activeCat
    ? FN_CATEGORIES.filter((c) => c.id === activeCat)
    : FN_CATEGORIES;

  // Per-section calculator lists (alphabetical sort per HUB_SPEC §5)
  function getCalcsForCategory(cat: FnCategory): typeof CALCULATORS {
    let list = CALCULATORS.filter((c) => c.fnCategory === cat);
    // HUB_SPEC §6 — favourites filter applied within section
    if (favsActive) {
      list = list.filter((c) => isFavorite(c.id));
    }
    // HUB_SPEC §5 — alphabetical by name
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }

  // Global empty state — favourites active, no results in any visible section
  const totalVisible = visibleCategories.reduce(
    (sum, cat) => sum + getCalcsForCategory(cat.id).length,
    0,
  );
  const showGlobalEmpty = favsActive && totalVisible === 0;

  return (
    <div className="px-5 pt-7 pb-24">
      {/* HUB_SPEC §1.1 — Hero */}
      <CalculatorsHero />

      {/* HUB_SPEC §1.4 — Pill row */}
      <CategoryPillRow activeCategory={activeCat} onSelect={handlePillSelect} />

      {/* HUB_SPEC §1.5 / §1.6 — Category sections */}
      <div role="tabpanel">
        {showGlobalEmpty ? (
          <p className="text-sm text-slate-500 text-center py-12">
            You haven&apos;t favourited any calculators yet. Tap the star on any calculator to add it
            here.
          </p>
        ) : (
          visibleCategories.map((cat) => {
            // Auto-expand when a single pill is active or favourites is on:
            // user has narrowed scope, so hiding the matching rows would be
            // hostile. Otherwise honour the per-category collapsed state
            // (default: all collapsed for a tidy hub).
            const isCollapsed =
              !activeCat && !favsActive && collapsedCategories.has(cat.id);
            return (
              <CategorySection
                key={cat.id}
                fnCategory={cat.id}
                calculators={getCalcsForCategory(cat.id)}
                isFavourited={isFavorite}
                onToggleFavourite={toggleFavorite}
                favsActive={favsActive}
                isCollapsed={isCollapsed}
                onToggle={() => toggleCategory(cat.id)}
              />
            );
          })
        )}
      </div>
    </div>
  );
}
