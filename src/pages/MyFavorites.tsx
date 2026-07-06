// MyFavorites — categorized view of every calculator, pathway, and trial
// the user has starred. Powered by useFavorites (localStorage) +
// favoritesRegistry (id → metadata resolver). Reachable via the
// FavouritesStarButton in the header on non-/trials routes.
//
// Empty state explains how to add favorites. Stale IDs (calculator or
// pathway that no longer exists in the registry, or a trial that's been
// removed from TRIAL_DATA) are silently dropped — they aren't shown but
// also aren't auto-removed from storage.

import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Calculator, GitBranch, BookOpen, ArrowRight } from 'lucide-react';
import { useFavorites } from '../hooks/useFavorites';
import { categorizeFavorites, type FavoriteEntry, type FavoriteKind } from '../lib/favoritesRegistry';

const KIND_LABEL: Record<FavoriteKind, string> = {
  calculator: 'Calculators',
  pathway: 'Pathways',
  trial: 'Trials',
};

const KIND_ICON: Record<FavoriteKind, React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>> = {
  calculator: Calculator,
  pathway: GitBranch,
  trial: BookOpen,
};

interface FavoriteRowProps {
  entry: FavoriteEntry;
  onRemove: () => void;
}

const FavoriteRow: React.FC<FavoriteRowProps> = ({ entry, onRemove }) => {
  const Icon = KIND_ICON[entry.kind];
  return (
    <li className="flex items-stretch gap-2">
      <Link
        to={entry.path}
        className="flex-1 min-w-0 flex items-center gap-3 px-4 py-3 rounded-xl bg-white border border-slate-100 hover:bg-slate-50 hover:border-slate-200 transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none group"
        aria-label={`${entry.title}, ${entry.eyebrow ?? entry.kind}`}
      >
        <Icon className="w-4 h-4 text-slate-400 flex-shrink-0" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{entry.title}</p>
          {entry.eyebrow && (
            <p className="text-xs text-slate-500 truncate mt-0.5">{entry.eyebrow}</p>
          )}
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 group-hover:text-slate-500 transition-colors" aria-hidden />
      </Link>
      <button
        type="button"
        onClick={onRemove}
        className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl text-amber-400 hover:text-slate-400 hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
        aria-label={`Remove ${entry.title} from favorites`}
        title="Remove from favorites"
      >
        <Star className="w-5 h-5" fill="currentColor" strokeWidth={1.6} />
      </button>
    </li>
  );
};

interface SectionProps {
  kind: FavoriteKind;
  entries: FavoriteEntry[];
  onRemove: (id: string) => void;
}

const Section: React.FC<SectionProps> = ({ kind, entries, onRemove }) => {
  if (entries.length === 0) return null;
  return (
    <section>
      <div className="px-1 mb-2 flex items-baseline justify-between">
        <h2 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {KIND_LABEL[kind]}
        </h2>
        <span className="text-xs text-slate-400">{entries.length}</span>
      </div>
      <ul className="space-y-2">
        {entries.map((entry) => (
          <FavoriteRow key={entry.id} entry={entry} onRemove={() => onRemove(entry.id)} />
        ))}
      </ul>
    </section>
  );
};

export const MyFavorites: React.FC = () => {
  const { favorites, toggleFavorite, isLoaded } = useFavorites();
  const { calculators, pathways, trials } = categorizeFavorites(favorites);
  const totalKnown = calculators.length + pathways.length + trials.length;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <header className="flex items-center gap-3">
        <Star className="w-6 h-6 text-amber-400 flex-shrink-0" fill="currentColor" strokeWidth={1.6} aria-hidden />
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-semibold text-slate-900 tracking-tight">My Favorites</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {totalKnown === 0
              ? 'Star a calculator, pathway, or trial to pin it here for quick access.'
              : `${totalKnown} item${totalKnown === 1 ? '' : 's'} starred · saved on this device`}
          </p>
        </div>
      </header>

      {!isLoaded && (
        <div className="text-sm text-slate-400 px-1">Loading…</div>
      )}

      {isLoaded && totalKnown === 0 && (
        <div className="rounded-xl bg-white border border-slate-100 overflow-hidden">
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 min-h-[40px] flex items-center">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">No Favorites Yet</p>
          </div>
          <div className="px-4 py-4 space-y-3">
            <p className="text-sm text-slate-700">
              Tap the <Star className="inline w-4 h-4 text-amber-400 align-text-bottom" fill="currentColor" strokeWidth={1.6} aria-hidden /> star icon on any calculator, pathway, or trial page to add it here.
            </p>
            <p className="text-xs text-slate-500">
              Favorites are stored on this device and survive app reloads. Clear browser storage or sign out to reset.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link
                to="/calculators"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold text-neuro-700 bg-neuro-50 border border-neuro-200 rounded-full hover:bg-neuro-100 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              >
                Browse Calculators
              </Link>
              <Link
                to="/pathways"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold text-neuro-700 bg-neuro-50 border border-neuro-200 rounded-full hover:bg-neuro-100 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              >
                Browse Pathways
              </Link>
              <Link
                to="/trials"
                className="inline-flex items-center gap-1.5 min-h-[44px] px-4 py-2 text-sm font-semibold text-neuro-700 bg-neuro-50 border border-neuro-200 rounded-full hover:bg-neuro-100 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none"
              >
                Browse Trials
              </Link>
            </div>
          </div>
        </div>
      )}

      {isLoaded && totalKnown > 0 && (
        <div className="space-y-6">
          <Section kind="calculator" entries={calculators} onRemove={toggleFavorite} />
          <Section kind="pathway" entries={pathways} onRemove={toggleFavorite} />
          <Section kind="trial" entries={trials} onRemove={toggleFavorite} />
        </div>
      )}
    </div>
  );
};

export default MyFavorites;
