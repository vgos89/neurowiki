// HOME_SPEC §1.25 — Featured rail (3–4 V-curated tiles)
// 2026-05-19 (V direction): switched from horizontal-scroll to grid so all
// featured tiles are visible at once on a single screen without sliding.
//   - mobile: 2 columns (2×2 for 4 tiles)
//   - sm and up: 4 columns (single row)
// Tile sizing reduced in FeaturedTile.tsx to keep total visual weight modest.
import React from 'react';
import { FEATURED } from '../../data/featured';
import { FeaturedTile } from './FeaturedTile';

export const FeaturedRail: React.FC = () => {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-2">
        Featured
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {FEATURED.map((item) => (
          <FeaturedTile key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default FeaturedRail;
