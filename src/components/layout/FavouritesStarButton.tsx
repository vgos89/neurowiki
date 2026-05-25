// LAYOUT_SPEC §1.3.2 + 2026-05-24 My Favorites feature.
// Shared between mobile header and desktop top bar.
//
// Behavior:
//   - On filterable routes (currently /trials), the star toggles the
//     existing ?favs=true URL filter that scopes the page to favorited
//     items only. Preserves the prior contract.
//   - On every other route, the star navigates the user to /favorites,
//     the dedicated My Favorites page that aggregates starred
//     calculators / pathways / trials in one categorized list.
//
// Active state (amber fill) applies in both modes — on /trials it
// reflects the ?favs filter; on /favorites it reflects that the user
// is currently viewing the favorites surface.
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useFavoritesFilter } from '../../hooks/useFavoritesFilter';

interface Props { className?: string; }

const FILTERABLE_ROUTES = new Set(['/trials']);

export const FavouritesStarButton: React.FC<Props> = ({ className = '' }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isActive: isFilterActive, toggle: toggleFilter } = useFavoritesFilter();

  const isOnFavoritesPage = location.pathname === '/favorites';
  const isOnFilterableRoute = FILTERABLE_ROUTES.has(location.pathname);

  const isActive = isFilterActive || isOnFavoritesPage;

  const handleClick = () => {
    if (isOnFilterableRoute) {
      // Preserve existing TrialsPage filter behavior.
      toggleFilter();
    } else if (isOnFavoritesPage) {
      // Already on /favorites — go back one step in history if possible.
      navigate(-1);
    } else {
      // Default: open the My Favorites page.
      navigate('/favorites');
    }
  };

  const ariaLabel = isOnFilterableRoute
    ? (isFilterActive ? 'Show all trials' : 'Show only favorite trials')
    : (isOnFavoritesPage ? 'Close favorites' : 'View my favorites');

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={isActive}
      aria-label={ariaLabel}
      className={`min-h-[44px] min-w-[44px] rounded-full flex items-center justify-center hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none ${isActive ? 'text-amber-400' : 'text-slate-400'} ${className}`}
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
