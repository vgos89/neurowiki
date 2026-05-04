// LAYOUT_SPEC §1
// 60px sticky header. Brand lockup left, search + star right.
// Search: stub only — no overlay (LAYOUT_SPEC §0.1 universal search rule).
import React from 'react';
import { Link } from 'react-router-dom';
import { FavouritesStarButton } from './FavouritesStarButton';

export const MobileHeader: React.FC = () => (
  <header
    className="md:hidden h-[60px] bg-white border-b border-slate-100 flex items-center justify-between px-5 sticky top-0 z-40"
  >
    {/* Brand lockup — LAYOUT_SPEC §1.2 */}
    <Link to="/" className="flex items-center gap-2.5">
      <div
        className="w-7 h-7 rounded-lg bg-neuro-500 flex items-center justify-center text-white font-semibold text-sm"
        style={{ fontFamily: 'serif', letterSpacing: '-0.04em' }}
      >
        N
      </div>
      <span className="text-base font-semibold tracking-tight text-slate-900">
        Neuro<span className="text-neuro-500">Wiki</span>
      </span>
    </Link>

    {/* Header actions — LAYOUT_SPEC §1.3 */}
    <div className="flex items-center gap-1">
      {/* Search — LAYOUT_SPEC §1.3.1 (stub) */}
      <button
        type="button"
        className="w-9 h-9 rounded-full flex items-center justify-center text-slate-700 hover:bg-slate-50 transition-colors"
        aria-label="Open search"
        onClick={() => {
          console.log('search clicked — overlay not implemented');
          // TODO(search-overlay): wire to global search overlay (separate spec)
        }}
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
