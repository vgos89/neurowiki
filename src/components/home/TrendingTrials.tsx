// HOME_SPEC §1.7 — Trending trials section
// HOME_SPEC §1.7.4 — daily-seeded selection (from useTrending hook)
// HOME_SPEC §1.7.6 — "View all 101 trials →" link (count refreshed 2026-05-21)
import React from 'react';
import { Link } from 'react-router-dom';
import { useTrending } from '../../hooks/useTrending';
import { useFavorites } from '../../hooks/useFavorites';
import ToolRowCard from '../hub/ToolRowCard';

const TRIAL_CATEGORY_TO_ROW: Record<string, string> = {
  ivt: 'ivt',
  evt: 'evt',
  'secondary-prevention': 'prevention',
  'surgical-interventions': 'surgical',
  'acute-management': 'status',
  'prehospital-triage': 'status',
};

export const TrendingTrials: React.FC = () => {
  const trending = useTrending();
  const { isFavorite, toggleFavorite } = useFavorites();

  return (
    <section className="mt-9 pb-8">
      <div className="flex items-baseline justify-between mb-1">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          Trending trials
        </div>
        <div className="text-[10px] text-slate-400 font-medium">
          Refreshes daily
        </div>
      </div>
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        {trending.map((trial) => (
          <ToolRowCard
            key={trial.id}
            href={trial.path}
            category={TRIAL_CATEGORY_TO_ROW[trial.category] ?? 'general'}
            title={trial.name}
            titleMeta={trial.year > 0 ? String(trial.year) : undefined}
            description={
              trial.legend?.finding ?? trial.description ?? trial.name
            }
            isFavourited={isFavorite(trial.id)}
            onToggleFavourite={() => toggleFavorite(trial.id)}
          />
        ))}
      </div>
      <Link
        to="/trials"
        className="block text-center mt-3 text-[13px] font-medium text-[var(--color-neuro-500)] hover:text-[var(--color-neuro-600)]"
      >
        View all 79 trials →
      </Link>
    </section>
  );
};

export default TrendingTrials;
