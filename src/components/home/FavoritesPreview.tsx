// FavoritesPreview — homepage preview of the user's starred items.
// Mirrors the RecentlyViewed pattern: only renders when there's at
// least one favorite, otherwise the entire block is omitted.
//
// Shows the most recently starred 5 items across all kinds
// (calculators / pathways / trials) in a compact list, with a
// "View all (N)" link to /favorites when there are more.
//
// Added 2026-05-24 per V feature request to make the new Favorites
// system discoverable from the home page.

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ChevronRight } from 'lucide-react';
import { useFavorites } from '../../hooks/useFavorites';
import { resolveFavorite, type FavoriteEntry } from '../../lib/favoritesRegistry';

const KIND_LABEL: Record<FavoriteEntry['kind'], string> = {
  calculator: 'Calc',
  pathway: 'Pathway',
  trial: 'Trial',
};

export const FavoritesPreview: React.FC = () => {
  const { favorites, isLoaded } = useFavorites();
  if (!isLoaded) return null;
  if (favorites.length === 0) return null;

  // Resolve to known entries, drop unknowns, surface most-recent first.
  // useFavorites stores in insertion order (oldest first); reverse for
  // "most recently starred" display.
  const entries = favorites
    .map(resolveFavorite)
    .filter((e): e is FavoriteEntry => e !== null)
    .reverse();
  if (entries.length === 0) return null;

  const preview = entries.slice(0, 5);
  const extraCount = entries.length - preview.length;

  return (
    <section className="mt-9">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[10px] font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
          <Star className="w-3 h-3 text-amber-400" fill="currentColor" strokeWidth={1.6} aria-hidden />
          My Favorites
        </div>
        <Link
          to="/favorites"
          className="text-[11px] font-semibold text-neuro-700 hover:underline focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none rounded px-1"
        >
          View all{extraCount > 0 ? ` (${entries.length})` : ''}
        </Link>
      </div>
      <ul className="rounded-xl border border-slate-100 overflow-hidden divide-y divide-slate-50 bg-white">
        {preview.map((entry) => (
          <li key={entry.id}>
            <Link
              to={entry.path}
              className="flex items-center justify-between gap-3 px-4 py-3 min-h-[44px] hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neuro-500 focus-visible:outline-none"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{entry.title}</p>
                {entry.eyebrow && (
                  <p className="text-xs text-slate-500 truncate mt-0.5">{entry.eyebrow}</p>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-400 bg-slate-50 border border-slate-200 rounded px-1.5 py-0.5 flex-shrink-0">
                {KIND_LABEL[entry.kind]}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-300 flex-shrink-0" aria-hidden />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default FavoritesPreview;
