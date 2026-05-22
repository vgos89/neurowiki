// LAYOUT_SPEC §1
// 60px sticky header. Brand lockup left, search + star right.
// Search: opens the smart-search overlay via SearchProvider (was a console.log stub).
import React from 'react';
import { Link } from 'react-router-dom';
import { FavouritesStarButton } from './FavouritesStarButton';
import { useSearch } from '../search/SearchProvider';

export const MobileHeader: React.FC = () => {
  const { open: openSearch } = useSearch();
  return (
    <header
      className="md:hidden h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-40"
    >
      {/* Brand lockup — LAYOUT_SPEC §1.2 */}
      <Link to="/" className="flex items-center gap-2.5" aria-label="NeuroWiki home">
        <img
          src="/icon-192.png"
          alt=""
          width={28}
          height={28}
          className="w-7 h-7 rounded-lg flex-shrink-0"
        />
        <span className="text-base font-semibold tracking-tight text-slate-900">
          Neuro<span className="text-neuro-500">Wiki</span>
        </span>
      </Link>

      {/* Header actions — LAYOUT_SPEC §1.3 */}
      <div className="flex items-center gap-1">
        {/* Search — opens smart-search overlay. 44×44 touch target per
            design-tokens skill (was 36×36 — below threshold + harder to
            discover for new users; GA4 showed 2 search events / 28 days).
            Subtle slate background makes the affordance pop against the
            white header. */}
        <button
          type="button"
          className="min-w-[44px] min-h-[44px] rounded-full flex items-center justify-center text-slate-700 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
          aria-label="Open search — find any trial, calculator, pathway, or guide"
          onClick={openSearch}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
          </svg>
        </button>
        {/* Favourites star — LAYOUT_SPEC §1.3.2 */}
        <FavouritesStarButton />
      </div>
    </header>
  );
};
