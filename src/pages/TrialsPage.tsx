import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import {
  trials,
  categoryStyles,
  categoryNames,
  groupTrialsByCategory,
  TRIAL_CATEGORY_IDS,
  type TrialItem,
  type TrialCategoryKey,
} from '../data/trialListData';

export default function TrialsPage() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<TrialCategoryKey | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { toggleFavorite, isFavorite } = useFavorites();

  useEffect(() => {
    const fav = searchParams.get('favorites');
    if (fav === 'true') setShowFavoritesOnly(true);
    else setShowFavoritesOnly(false);
  }, [searchParams]);

  let filteredTrials = trials;
  if (showFavoritesOnly) filteredTrials = filteredTrials.filter((t) => isFavorite(t.id));
  if (activeCategory) filteredTrials = filteredTrials.filter((t) => t.category === activeCategory);

  const groupedTrials = groupTrialsByCategory(filteredTrials);

  const filterByCategory = (category: TrialCategoryKey) => {
    setActiveCategory((prev) => (prev === category ? null : category));
  };

  const handleFavoriteClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header with integrated filters — same layout as Clinical Tools */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between py-3">
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">Landmark Trials</h1>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
                showFavoritesOnly
                  ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              aria-label={showFavoritesOnly ? 'Show all trials' : 'Show favorites only'}
            >
              <svg className="w-4 h-4 shrink-0" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>

          {/* Single tab: All (count) — matches Calculators pattern */}
          <div className="flex gap-1 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg mb-3">
            <button
              onClick={() => setShowFavoritesOnly(false)}
              className="flex-1 py-2 text-sm font-medium rounded-md transition-all bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm"
            >
              All ({trials.length})
            </button>
          </div>

          {/* Category pills — horizontal scroll, touch-friendly */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-1 px-1 scrollbar-hide">
            {TRIAL_CATEGORY_IDS.map((category) => {
              const count = trials.filter((t) => t.category === category).length;
              if (count === 0) return null;
              const styles = categoryStyles[category];
              return (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border transition-all min-h-[44px] touch-manipulation ${
                    activeCategory === category ? styles.pillActive : `${styles.pillBg} ${styles.pillText} hover:opacity-80`
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${activeCategory === category ? 'bg-white' : styles.dot}`} />
                  <span>{categoryNames[category]}</span>
                  <span className={`text-xs shrink-0 ${activeCategory === category ? 'text-white/70' : 'opacity-60'}`}>{count}</span>
                </button>
              );
            })}
            {activeCategory && (
              <button
                onClick={() => setActiveCategory(null)}
                className="flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 transition-all min-h-[44px] touch-manipulation"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content — card list with left border, title, Trial tag, blurb, star, arrow */}
      <main className="max-w-2xl mx-auto px-5 md:px-8 py-6">
        {showFavoritesOnly && (
          <div className="mb-4 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
              <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">Showing favorites only</span>
            </div>
            <button onClick={() => setShowFavoritesOnly(false)} className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium">
              Show all
            </button>
          </div>
        )}

        {Object.entries(groupedTrials).map(([category, categoryTrials]) => (
          <div key={category} className="mb-8">
            {!activeCategory && (
              <div className="flex items-center gap-2 mb-3 pl-1">
                <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${categoryStyles[category].dot}`} />
                <h2 className={`text-sm font-semibold tracking-wide ${categoryStyles[category].text} dark:text-slate-300`}>
                  {categoryNames[category as TrialCategoryKey]}
                </h2>
                <span className="text-xs text-slate-400 dark:text-slate-500">{categoryTrials.length}</span>
              </div>
            )}
            <div className="space-y-2">
              {categoryTrials.map((trial: TrialItem) => (
                <Link
                  key={trial.id}
                  to={`${trial.path}${trial.path.includes('?') ? '&' : '?'}from=trials&category=${encodeURIComponent(categoryNames[trial.category])}`}
                  className={`group flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border-l-4 ${categoryStyles[trial.category].border} border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm dark:hover:shadow-slate-900/50 transition-all min-h-[44px] touch-manipulation`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {trial.name}
                      </h3>
                      <span className="px-2 py-0.5 text-xs font-medium rounded bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                        Trial
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{trial.description}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-3 shrink-0">
                    <button
                      onClick={(e) => handleFavoriteClick(trial.id, e)}
                      className={`p-2 rounded-lg transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center ${
                        isFavorite(trial.id) ? 'text-amber-500 dark:text-amber-400' : 'text-slate-300 dark:text-slate-500 hover:text-slate-400 dark:hover:text-slate-400'
                      }`}
                      aria-label={isFavorite(trial.id) ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <svg className="w-5 h-5" fill={isFavorite(trial.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                    <svg className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {Object.keys(groupedTrials).length === 0 && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No trials found</p>
            <p className="text-sm text-slate-400">{showFavoritesOnly ? 'No favorites match' : 'Try a different filter'}</p>
            <button
              onClick={() => {
                setShowFavoritesOnly(false);
                setActiveCategory(null);
              }}
              className="mt-4 px-4 py-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </main>

      <div className="h-24 md:h-0" />
    </div>
  );
}
