// HOME_SPEC §1.25 — Featured rail (3 V-curated tiles)
// HOME_SPEC §1.25.3 — horizontal scroll on mobile; flex row on desktop
import React from 'react';
import { FEATURED } from '../../data/featured';
import { FeaturedTile } from './FeaturedTile';

export const FeaturedRail: React.FC = () => {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">
        Featured
      </div>
      <div className="flex gap-[10px] overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden pb-0.5">
        {FEATURED.map((item) => (
          <FeaturedTile key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedRail;
