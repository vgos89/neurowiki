import React, { useState, useEffect, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import {
  trials,
  categoryNames,
  categoryDescriptions,
  groupTrialsByCategory,
  TRIAL_CATEGORY_IDS,
  type TrialItem,
  type TrialCategoryKey,
} from '../data/trialListData';
import { Toggle, type ToggleOption } from '../components/ui/Toggle';
import { Chip } from '../components/ui/Chip';
import { TrialLegendCard } from '../components/trials/TrialLegendCard';
import { TRIAL_QUESTIONS, type QuestionIconKey } from '../data/trial-questions';

// ── View toggle options ─────────────────────────────────────────────────────
const TOGGLE_OPTIONS: [ToggleOption, ToggleOption] = [
  { value: 'questions', label: 'Questions' },
  { value: 'catalog', label: 'Catalog' },
];

// ── Category v4 colors ──────────────────────────────────────────────────────
const CAT_COLOR: Record<TrialCategoryKey, string> = {
  ivt: '#10b981',
  evt: '#1746A2',
  'secondary-prevention': '#0891b2',
  'surgical-interventions': '#7c3aed',
  'acute-management': '#f59e0b',
  'prehospital-triage': '#f59e0b',
};

const CAT_SHORT: Record<TrialCategoryKey, string> = {
  ivt: 'IVT',
  evt: 'EVT',
  'secondary-prevention': 'Prevention',
  'surgical-interventions': 'Surgical',
  'acute-management': 'In-Hosp',
  'prehospital-triage': 'Prehospital',
};

// ── Question icons ──────────────────────────────────────────────────────────
function QuestionIcon({ type }: { type: QuestionIconKey }) {
  const props = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  switch (type) {
    case 'clock':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'target':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <circle cx="12" cy="12" r="8" strokeDasharray="3 2" />
        </svg>
      );
    case 'pill':
      return (
        <svg {...props}>
          <rect x="2" y="8" width="20" height="8" rx="4" />
          <line x1="12" y1="8" x2="12" y2="16" />
        </svg>
      );
    case 'brain':
      return (
        <svg {...props}>
          <path d="M12 2a7 7 0 017 7c0 4-3 6-3 9H8c0-3-3-5-3-9a7 7 0 017-7z" />
          <line x1="9" y1="21" x2="15" y2="21" />
        </svg>
      );
    case 'waveform':
      return (
        <svg {...props}>
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      );
    case 'layers':
      return (
        <svg {...props}>
          <rect x="1" y="8" width="9" height="5" rx="2.5" />
          <rect x="14" y="11" width="9" height="5" rx="2.5" />
        </svg>
      );
  }
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function TrialsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [view, setView] = useState<'questions' | 'catalog'>('questions');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<TrialCategoryKey | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Set<TrialCategoryKey>>(new Set());
  const searchRef = useRef<HTMLInputElement>(null);

  const { toggleFavorite, isFavorite } = useFavorites();

  // Sync ?favorites=true from URL
  useEffect(() => {
    const fav = searchParams.get('favorites');
    if (fav === 'true') {
      setShowFavoritesOnly(true);
      setView('catalog');
    }
  }, [searchParams]);

  // When searching, force catalog view
  const effectiveView = searchQuery ? 'catalog' : view;

  // ── Filtering ─────────────────────────────────────────────────────────────
  let filteredTrials = trials;
  if (showFavoritesOnly) {
    filteredTrials = filteredTrials.filter((t) => isFavorite(t.id));
  }
  if (activeCategory) {
    filteredTrials = filteredTrials.filter((t) => t.category === activeCategory);
  }
  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase();
    filteredTrials = filteredTrials.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q) ||
        t.legend?.finding?.toLowerCase().includes(q)
    );
  }

  const groupedTrials = groupTrialsByCategory(filteredTrials);
  const isEmpty = Object.values(groupedTrials).every((g) => !g || g.length === 0);

  const handleFavToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleFavorite(id);
  };

  const toggleCategory = (cat: TrialCategoryKey) => {
    setCollapsedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const handleViewChange = (v: string) => {
    setView(v as 'questions' | 'catalog');
    if (v === 'catalog') setSearchQuery('');
  };

  // ── Hero content (shared, sized via responsive classes) ───────────────────
  const heroContent = (
    <>
      {/* Eyebrow */}
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400 dark:text-slate-500 mb-2.5">
        NeuroWiki · Trials Reference
      </p>

      {/* H1 */}
      <h1 className="text-[22px] md:text-[32px] font-medium text-slate-900 dark:text-white tracking-[-0.01em] leading-[1.25] md:leading-[1.2] mb-2 md:mb-2.5">
        {trials.length} trials.
        <br className="md:hidden" />{' '}
        One search box.
      </h1>

      {/* Sub copy */}
      <p className="text-sm text-slate-600 dark:text-slate-400 leading-[1.55] mb-4 md:max-w-[540px] md:mb-5">
        Evidence summaries, organized by clinical question or category.
        <span className="hidden md:inline"> Updated with each major guideline cycle.</span>
      </p>

      {/* Search bar */}
      <div className="relative mb-3.5 md:max-w-[600px] md:mb-4">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
        </div>
        <input
          ref={searchRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search trials, conditions, authors…"
          className="w-full h-11 md:h-12 pl-9 pr-12 rounded-xl border border-slate-200 dark:border-slate-600 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 bg-white dark:bg-slate-700 focus:outline-none focus:border-[#1746A2] focus:shadow-[0_0_0_4px_rgba(23,70,162,0.08)] transition-[border-color,box-shadow] duration-150"
          aria-label="Search trials"
        />
        {/* ⌘K hint — desktop only */}
        <div className="hidden md:flex absolute right-3.5 top-1/2 -translate-y-1/2 items-center pointer-events-none">
          <span className="text-[11px] font-medium text-slate-300 dark:text-slate-500 bg-slate-50 dark:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded px-[7px] py-0.5 tracking-[0.04em]">
            ⌘K
          </span>
        </div>
      </div>

      {/* Chip rail */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        <Chip
          active={showFavoritesOnly}
          onClick={() => {
            setShowFavoritesOnly((v) => !v);
            if (!showFavoritesOnly) setView('catalog');
          }}
        >
          <svg width="11" height="11" viewBox="0 0 24 24" fill={showFavoritesOnly ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Favourites
        </Chip>
        <Chip>Recent</Chip>
        <Chip>New 2024–25</Chip>
        <Chip>Guidelines</Chip>
      </div>
    </>
  );

  // ── Questions view ────────────────────────────────────────────────────────
  const questionsView = (
    <>
      {/* Mobile: single-column list */}
      <div className="md:hidden bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700">
        {TRIAL_QUESTIONS.map((q) => (
          <Link
            key={q.id}
            to={`/trials/q/${q.id}`}
            className="flex items-center gap-3.5 px-5 py-3.5 border-b border-slate-100 dark:border-slate-700 last:border-b-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors touch-manipulation"
          >
            <div className="w-9 h-9 rounded-[10px] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
              <QuestionIcon type={q.icon} />
            </div>
            <div className="flex-1 text-sm font-medium text-slate-900 dark:text-white leading-[1.4]">
              {q.text}
            </div>
            <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400 whitespace-nowrap">
              {q.trialCount} trials
            </span>
            <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </Link>
        ))}
      </div>

      {/* Desktop: 2-col grid inside a white card */}
      <div className="hidden md:block p-6">
        <div className="max-w-[800px] mx-auto">
          <div className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
            <div className="grid grid-cols-2">
              {TRIAL_QUESTIONS.map((q, i) => {
                const isRightCol = (i + 1) % 2 === 0;
                const isLastRow = i >= TRIAL_QUESTIONS.length - 2;
                return (
                  <Link
                    key={q.id}
                    to={`/trials/q/${q.id}`}
                    className={`
                      flex items-center gap-3.5 px-6 py-4
                      hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors touch-manipulation
                      ${!isRightCol ? 'border-r border-slate-100 dark:border-slate-700' : ''}
                      ${!isLastRow ? 'border-b border-slate-100 dark:border-slate-700' : ''}
                    `}
                  >
                    <div className="w-9 h-9 rounded-[10px] bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0 text-slate-500 dark:text-slate-400">
                      <QuestionIcon type={q.icon} />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900 dark:text-white leading-[1.4]">
                        {q.text}
                      </div>
                    </div>
                    <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400 whitespace-nowrap">
                      {q.trialCount} trials
                    </span>
                    <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // ── Catalog view ──────────────────────────────────────────────────────────
  const catalogView = (
    <>
      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-5 py-3 md:px-6 flex items-center gap-2.5">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide flex-1">
          {/* All pill */}
          <button
            onClick={() => { setActiveCategory(null); setShowFavoritesOnly(false); }}
            className={`inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 transition-colors ${
              !activeCategory && !showFavoritesOnly
                ? 'bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2] font-semibold'
                : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
            }`}
          >
            All
          </button>

          {/* Category pills */}
          {TRIAL_CATEGORY_IDS.map((cat) => {
            const count = trials.filter((t) => t.category === cat).length;
            if (count === 0) return null;
            const isActive = activeCategory === cat;
            const color = CAT_COLOR[cat];
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory((prev) => (prev === cat ? null : cat))}
                className={`inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-xs font-medium border whitespace-nowrap flex-shrink-0 transition-colors ${
                  isActive
                    ? 'bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2] font-semibold'
                    : 'bg-white dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600'
                }`}
                role="radio"
                aria-checked={isActive}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isActive ? color : color }}
                />
                {CAT_SHORT[cat]}
              </button>
            );
          })}
        </div>

        {/* Sort — display only */}
        <button className="inline-flex items-center gap-[5px] px-3 py-[5px] rounded-full text-xs font-medium border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-700 whitespace-nowrap flex-shrink-0">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <polyline points="19 12 12 19 5 12" />
          </svg>
          Year
        </button>
      </div>

      {/* Favorites banner */}
      {showFavoritesOnly && (
        <div className="mx-5 mt-4 mb-0 px-4 py-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-sm text-amber-800 dark:text-amber-300 font-medium">Showing favorites only</span>
          </div>
          <button
            onClick={() => setShowFavoritesOnly(false)}
            className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 font-medium"
          >
            Show all
          </button>
        </div>
      )}

      {/* Category sections */}
      <div className="md:py-6">
        <div className="md:max-w-[800px] md:mx-auto md:px-6">
          {TRIAL_CATEGORY_IDS.map((cat) => {
            const catTrials = groupedTrials[cat];
            if (!catTrials || catTrials.length === 0) return null;
            const isCollapsed = !activeCategory && !searchQuery && collapsedCategories.has(cat);
            const catColor = CAT_COLOR[cat];

            return (
              <div
                key={cat}
                className="mb-0 md:mb-4 md:bg-white md:dark:bg-slate-800 md:border md:border-slate-100 md:dark:border-slate-700 md:rounded-lg md:overflow-hidden"
              >
                {/* Section header */}
                {!activeCategory && !searchQuery && (
                  <button
                    onClick={() => toggleCategory(cat)}
                    className="w-full flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 md:px-6 text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span
                          className="text-[13px] md:text-sm font-semibold"
                          style={{ color: catColor }}
                        >
                          {categoryNames[cat]}
                        </span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {catTrials.length}
                        </span>
                      </div>
                      {!isCollapsed && (
                        <p className="text-xs text-slate-400 dark:text-slate-500 pl-4">
                          {categoryDescriptions[cat]}
                        </p>
                      )}
                    </div>
                    <svg
                      className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5 transition-transform duration-200"
                      style={{
                        transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
                        transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
                      }}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                  </button>
                )}

                {/* Trial cards */}
                {!isCollapsed && (
                  <div className="bg-white dark:bg-slate-800">
                    {catTrials.map((trial: TrialItem) => (
                      <TrialLegendCard
                        key={trial.id}
                        trial={trial}
                        isFav={isFavorite(trial.id)}
                        onFavToggle={handleFavToggle}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Empty state */}
          {isEmpty && (
            <div className="text-center py-16 px-5">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium mb-1">No trials found</p>
              <p className="text-sm text-slate-400">
                {searchQuery ? `No results for "${searchQuery}"` : showFavoritesOnly ? 'No favorites yet' : 'Try a different filter'}
              </p>
              <button
                onClick={() => { setShowFavoritesOnly(false); setActiveCategory(null); setSearchQuery(''); }}
                className="mt-4 px-4 py-2 text-sm text-[#1746A2] hover:text-[#0E2D6B] font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  // ── Page render ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">

      {/*
        HEADER BLOCK
        Desktop (md+): entire block is sticky (hero + toggle as one unit)
        Mobile:        hero scrolls; only the toggle-wrap sticks via its own sticky
      */}
      <div className="md:sticky md:top-0 md:z-30 bg-white dark:bg-slate-800">

        {/* Hero */}
        <div className="border-b border-slate-100 dark:border-slate-700 md:border-b-0">
          <div className="px-5 py-6 md:max-w-[800px] md:mx-auto md:px-6 md:pt-12 md:pb-6">
            {heroContent}
          </div>
        </div>

        {/*
          Toggle wrap
          On mobile: sticky (hero is outside this, scrolls away)
          On desktop: relative (parent md:sticky handles the sticking)
        */}
        <div className="sticky top-0 z-30 md:relative md:top-auto md:z-auto bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-5 py-5 md:px-0 md:py-0">
          <div className="md:max-w-[800px] md:mx-auto md:px-6 md:py-4">
            <Toggle
              options={TOGGLE_OPTIONS}
              value={effectiveView}
              onChange={handleViewChange}
              className="md:max-w-[320px]"
            />
          </div>
        </div>

      </div>

      {/* Main content */}
      <main>
        {effectiveView === 'questions' ? questionsView : catalogView}
      </main>

      {/* Bottom padding for mobile tab bar */}
      <div className="h-24 md:h-0" />
    </div>
  );
}
