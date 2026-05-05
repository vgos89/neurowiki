// HOME_SPEC §1.6 — Recently viewed section
// HOME_SPEC §1.6.1 — only rendered when populated (entire block omitted otherwise)
import React from 'react';
import type { RecentEntry } from '../../hooks/useRecents';
import ToolRowCard from '../hub/ToolRowCard';

interface Props {
  recents: RecentEntry[];
}

function hrefFor(entry: RecentEntry): string {
  switch (entry.type) {
    case 'trial':
      return `/trials/${entry.id}`;
    case 'calculator':
      return `/calculators/${entry.id}`;
    case 'pathway':
      return `/pathways/${entry.id}`;
    case 'guide':
      return `/guide/${entry.id}`;
  }
}

export const RecentlyViewed: React.FC<Props> = ({ recents }) => {
  if (recents.length === 0) return null;

  return (
    <section className="mt-9">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
        Recently viewed
      </div>
      <div className="rounded-xl border border-slate-100 overflow-hidden">
        {recents.slice(0, 5).map((entry) => (
          <ToolRowCard
            key={`${entry.id}-${entry.viewedAt}`}
            href={hrefFor(entry)}
            category={entry.category}
            title={entry.title}
            description={entry.subtitle}
            trail={
              entry.trail ? (
                <span className="text-[11.5px] text-slate-400 font-medium">
                  {entry.trail}
                </span>
              ) : undefined
            }
            isFavourited={false}
            onToggleFavourite={() => {}}
          />
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
