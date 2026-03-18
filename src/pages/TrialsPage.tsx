import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import {
  trials,
  categoryStyles,
  categoryNames,
  categoryDescriptions,
  groupTrialsByCategory,
  TRIAL_CATEGORY_IDS,
  type TrialItem,
  type TrialCategoryKey,
} from '../data/trialListData';

const categoryShortNames: Record<TrialCategoryKey, string> = {
  'prehospital-triage': 'Prehospital',
  ivt: 'IVT',
  evt: 'EVT',
  'acute-management': 'In-Hospital',
  'surgical-interventions': 'Surgical',
  'secondary-prevention': 'Prevention',
};

export default function TrialsPage() {
  const [searchParams] = useSearchParams();
  const [activeCategory, setActiveCategory] = useState<TrialCategoryKey | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<TrialCategoryKey>>(new Set());
  const [openContextId, setOpenContextId] = useState<string | null>(null);
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

  const toggleCategory = (category: TrialCategoryKey) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) next.delete(category);
      else next.add(category);
      return next;
    });
  };

  const handleContextClick = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setOpenContextId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-2xl mx-auto px-5 md:px-8">
          <div className="flex items-center justify-between py-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">Stroke Trials</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Grouped by trial category</p>
            </div>
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

          {/* Filters row: All tab + category pills in one compact scrollable line */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
            <button
              onClick={() => { setShowFavoritesOnly(false); setActiveCategory(null); }}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all touch-manipulation ${
                !activeCategory
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 border-slate-800 dark:border-slate-200'
                  : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
              }`}
            >
              All {trials.length}
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-600 shrink-0" />

            {TRIAL_CATEGORY_IDS.map((category) => {
              const count = trials.filter((t) => t.category === category).length;
              if (count === 0) return null;
              const styles = categoryStyles[category];
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all touch-manipulation ${
                    isActive ? styles.pillActive : `${styles.pillBg} ${styles.pillText} hover:opacity-80`
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? 'bg-white' : styles.dot}`} />
                  {categoryShortNames[category]}
                  <span className={`${isActive ? 'text-white/70' : 'opacity-50'}`}>{count}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
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

        {TRIAL_CATEGORY_IDS.map((category) => {
          const categoryTrials = groupedTrials[category];
          if (!categoryTrials || categoryTrials.length === 0) return null;
          // When a filter is active, always show trials (ignore collapsed state)
          const isCollapsed = !activeCategory && collapsedCategories.has(category);

          return (
            <div key={category} className="mb-8">
              {!activeCategory && (
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full mb-3 pl-1 text-left flex items-start justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${categoryStyles[category].dot}`} />
                      <h2 className={`text-sm font-semibold tracking-wide ${categoryStyles[category].text} dark:text-slate-300`}>
                        {categoryNames[category]}
                      </h2>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{categoryTrials.length}</span>
                    </div>
                    {!isCollapsed && (
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 pl-4">
                        {categoryDescriptions[category]}
                      </p>
                    )}
                  </div>
                  <svg
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 mt-0.5 ${isCollapsed ? '-rotate-90' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}

              {!isCollapsed && (
                <div className="space-y-2">
                  {categoryTrials.map((trial: TrialItem) => {
                    const isContextOpen = openContextId === trial.id;
                    return (
                      <div key={trial.id}>
                        <Link
                          to={trial.path}
                          className={`group flex items-center justify-between p-4 bg-white dark:bg-slate-800 ${isContextOpen ? 'rounded-t-xl' : 'rounded-xl'} border-l-4 ${categoryStyles[trial.category].border} border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 hover:shadow-sm dark:hover:shadow-slate-900/50 transition-all min-h-[44px] touch-manipulation`}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                {trial.name}
                                {trial.year > 0 && <span className="ml-1 font-normal text-slate-400 dark:text-slate-500">({trial.year})</span>}
                              </h3>
                              <span
                                className={`px-2 py-0.5 text-xs font-medium rounded ${
                                  trial.isPlaceholder
                                    ? 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                                    : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                }`}
                              >
                                {trial.isPlaceholder ? 'Coming soon' : 'Available'}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">DOI: {trial.doi}</p>
                          </div>
                          <div className="flex items-center gap-0.5 ml-3 shrink-0">
                            {trial.clinicalContext && (
                              <button
                                onClick={(e) => handleContextClick(trial.id, e)}
                                className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                                  isContextOpen
                                    ? 'text-neuro-500 dark:text-neuro-400'
                                    : 'text-slate-300 dark:text-slate-600 hover:text-neuro-400 dark:hover:text-neuro-400'
                                }`}
                                aria-label="Show clinical context"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                            <button
                              onClick={(e) => handleFavoriteClick(trial.id, e)}
                              className={`p-2 rounded-lg transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center ${
                                isFavorite(trial.id) ? 'text-amber-500 dark:text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400'
                              }`}
                              aria-label={isFavorite(trial.id) ? 'Remove from favorites' : 'Add to favorites'}
                            >
                              <svg className="w-4 h-4" fill={isFavorite(trial.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                              </svg>
                            </button>
                            <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </Link>
                        {isContextOpen && trial.clinicalContext && (
                          <div className={`px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-t-0 border-l-4 ${categoryStyles[trial.category].border} border-slate-100 dark:border-slate-700 rounded-b-xl text-sm text-slate-600 dark:text-slate-300 leading-relaxed`}>
                            {trial.clinicalContext}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {Object.values(groupedTrials).every((g) => !g || g.length === 0) && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No trials found</p>
            <p className="text-sm text-slate-400">{showFavoritesOnly ? 'No favorites match' : 'Try a different filter'}</p>
            <button
              onClick={() => { setShowFavoritesOnly(false); setActiveCategory(null); }}
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
