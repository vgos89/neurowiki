// HUB_SPEC §1.6 — universal ToolRowCard
// Used by scenario sections (HOME), Recently viewed (HOME), Trending (HOME),
// and future hubs. Single source of truth for row-card visual contract.
import React from 'react';
import { Link } from 'react-router-dom';

interface ToolRowCardProps {
  href: string;
  category: string; // 'ivt' | 'evt' | 'cobalt' | 'surgical' | 'status' | 'prevention' | ...
  title: string;
  titleMeta?: string;
  description: string;
  trail?: React.ReactNode;
  isFavourited: boolean;
  onToggleFavourite: (e: React.MouseEvent) => void;
}

export const ToolRowCard: React.FC<ToolRowCardProps> = ({
  href,
  category,
  title,
  titleMeta,
  description,
  trail,
  isFavourited,
  onToggleFavourite,
}) => {
  return (
    <Link
      to={href}
      className={`rowcard row-${category} block last:border-b-0`}
    >
      <div className="flex items-center gap-2 pr-3">
        <span className="text-[14.5px] font-semibold text-slate-900 truncate">
          {title}
        </span>
        {titleMeta && (
          <span className="text-[11.5px] text-slate-400 font-medium ml-2 flex-shrink-0">
            {titleMeta}
          </span>
        )}
        <div className="ml-auto flex items-center gap-2 flex-shrink-0">
          {trail && <span className="flex-shrink-0">{trail}</span>}
          <button
            type="button"
            aria-pressed={isFavourited}
            aria-label={isFavourited ? 'Remove favourite' : 'Add favourite'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleFavourite(e);
            }}
            className={`w-4 h-4 flex items-center justify-center ${
              isFavourited ? 'text-amber-400' : 'text-slate-300'
            }`}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill={isFavourited ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <polygon points="12 2 15 9 22 9.5 17 14.5 18.5 22 12 18 5.5 22 7 14.5 2 9.5 9 9 12 2" />
            </svg>
          </button>
        </div>
      </div>
      <div className="text-sm text-slate-600 leading-snug pr-3 mt-0.5 truncate">
        {description}
      </div>
    </Link>
  );
};

export default ToolRowCard;
