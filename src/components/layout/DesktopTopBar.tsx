// LAYOUT_SPEC §6.2
// 60px top bar. No logo. Three-col flex: left spacer | centered search (max-w-520px) | right (star).
// Search opens the smart-search overlay via SearchProvider.
import React from 'react';
import { FavouritesStarButton } from './FavouritesStarButton';
import FeedbackButton from '../FeedbackButton';
import { useSearch } from '../search/SearchProvider';

export const DesktopTopBar: React.FC = () => {
  const { open: openSearch } = useSearch();
  return (
    <header className="hidden md:flex h-[60px] bg-white border-b border-slate-100 items-center px-8 gap-4">
      {/* Left spacer — LAYOUT_SPEC §6.2.2 */}
      <div className="flex-1" />

      {/* Centered search — LAYOUT_SPEC §6.2.2 */}
      <button
        type="button"
        className="flex items-center gap-2.5 bg-slate-50 border border-slate-100 rounded-full px-4 py-2 w-full max-w-[520px] text-left cursor-pointer hover:border-slate-200 hover:bg-white transition-colors"
        aria-label="Open search"
        onClick={openSearch}
      >
        <svg className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>
        </svg>
        <span className="flex-1 text-[13px] text-slate-400">
          Search trials, calculators, pathways, guides…
        </span>
        <kbd className="text-[11px] font-mono text-slate-400 px-1.5 py-0.5 border border-slate-200 rounded bg-white">
          ⌘K
        </kbd>
      </button>

      {/* Right: feedback + favourites star — LAYOUT_SPEC §6.2.3 */}
      <div className="flex-1 flex justify-end items-center gap-1">
        <FeedbackButton variant="header" />
        <FavouritesStarButton />
      </div>
    </header>
  );
};
