import React from 'react';
import { Link } from 'react-router-dom';
import type { TrialItem, TrialCategoryKey } from '../../data/trialListData';

/**
 * v4 trial card anatomy. trials-legend-reference.html §Stage2/Stage3.
 *
 * Structure:
 *   pos:relative · pl-[34px] pr-5 py-3.5 · no border-radius (hairlines only)
 *   cat-dot:  absolute left-5 top-5 · 6px circle · category color
 *   Line 1:   trial name (14px/600/0.01em) + meta year (11px/500/0.04em uppercase)
 *             + [desktop: bl-tag + keyStat right-aligned] + star
 *   Line 2:   finding (14px/400/slate-600/1.55lh)
 *   Line 3:   bl-tag + keyStat — mobile only; desktop items sit in line 1 right
 *
 * Fallback: finding ← legend?.finding ?? description ?? name
 */

// HUB_SPEC Appendix A — canonical category colors (replaces --cat-* CSS custom properties)
const CAT_DOT_COLOR: Record<TrialCategoryKey, string> = {
  ivt:                    '#10b981',
  evt:                    'var(--color-neuro-500)',  // cobalt #1746A2
  'secondary-prevention': '#0891b2',
  'surgical-interventions': '#7c3aed',
  'acute-management':     '#f59e0b',
  'prehospital-triage':   '#f59e0b',
};

interface TrialLegendCardProps {
  trial: TrialItem;
  isFav: boolean;
  onFavToggle: (id: string, e: React.MouseEvent) => void;
}

export function TrialLegendCard({ trial, isFav, onFavToggle }: TrialLegendCardProps) {
  const finding = trial.legend?.finding ?? trial.description ?? trial.name;
  const tag = trial.legend?.bottomLineTag;
  const stat = trial.legend?.keyStat;
  const dotColor = CAT_DOT_COLOR[trial.category] ?? '#94a3b8';
  const hasLine3 = Boolean(tag || stat);

  return (
    <Link
      to={trial.path}
      className={`
        group block relative
        pl-[34px] pr-5 py-3.5
        border-b border-slate-100 dark:border-slate-700/60
        last:border-b-0
        bg-white dark:bg-slate-800
        hover:bg-slate-50 dark:hover:bg-slate-700/40
        hover:shadow-[0_2px_8px_rgba(15,23,42,0.06)]
        transition-[background,box-shadow] duration-[120ms] ease-out
        touch-manipulation
      `}
    >
      {/* Category dot — position-absolute at left:20px top:20px */}
      <div
        className="absolute left-5 top-5 w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: dotColor }}
      />

      {/* Line 1 */}
      <div className="flex items-center justify-between gap-2 mb-1">
        {/* Left: trial name + meta */}
        <div className="flex items-baseline gap-2 min-w-0 overflow-hidden">
          <span className="text-sm font-semibold tracking-[0.01em] text-slate-900 dark:text-white whitespace-nowrap truncate">
            {trial.name}
          </span>
          {trial.year > 0 && (
            <span className="text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400 whitespace-nowrap flex-shrink-0">
              {trial.year}
            </span>
          )}
        </div>

        {/* Right: [desktop tag+stat] + star */}
        <div className="flex items-center gap-3.5 flex-shrink-0">
          {/* Desktop-only bl-tag */}
          {tag && (
            <span className="hidden md:inline-flex text-[11px] font-semibold bg-[rgba(23,70,162,0.08)] text-[#1746A2] px-2 py-0.5 rounded whitespace-nowrap">
              {tag}
            </span>
          )}
          {/* Desktop-only keyStat */}
          {stat && (
            <span className="hidden md:inline text-[12px] text-slate-500 whitespace-nowrap">
              {stat}
            </span>
          )}
          {/* Favourite star — always visible */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFavToggle(trial.id, e); }}
            className={`p-0.5 flex-shrink-0 transition-colors ${
              isFav ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400 dark:hover:text-slate-400'
            }`}
            aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
          >
            <svg
              className="w-3.5 h-3.5"
              viewBox="0 0 24 24"
              fill={isFav ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={1.8}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Line 2: Finding */}
      <div
        className={`text-sm text-slate-600 dark:text-slate-300 leading-[1.55] ${
          hasLine3 ? 'mb-2 md:mb-0' : ''
        }`}
      >
        {finding}
      </div>

      {/* Line 3: Mobile-only bl-tag + keyStat */}
      {hasLine3 && (
        <div className="flex items-center gap-2.5 flex-wrap md:hidden">
          {tag && (
            <span className="text-[11px] font-semibold bg-[rgba(23,70,162,0.08)] text-[#1746A2] px-2 py-0.5 rounded whitespace-nowrap">
              {tag}
            </span>
          )}
          {stat && (
            <span className="text-[12px] text-slate-500 whitespace-nowrap">
              {stat}
            </span>
          )}
        </div>
      )}
    </Link>
  );
}
