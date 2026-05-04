// LAYOUT_SPEC §1.3.2
// Shared between mobile header and desktop top bar.
// Inactive: text-slate-400, fill=none, stroke-width=1.6
// Active: text-amber-400, fill=currentColor, stroke=currentColor
import React from 'react';
import { useFavoritesFilter } from '../../hooks/useFavoritesFilter';

interface Props { className?: string; }

export const FavouritesStarButton: React.FC<Props> = ({ className = '' }) => {
  const { isActive, toggle } = useFavoritesFilter();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isActive}
      aria-label={isActive ? 'Show all' : 'Show only favourites'}
      className={`w-9 h-9 rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors ${isActive ? 'text-amber-400' : 'text-slate-400'} ${className}`}
    >
      <svg
        className="w-5 h-5"
        viewBox="0 0 24 24"
        fill={isActive ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.6"
      >
        <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2"/>
      </svg>
    </button>
  );
};
