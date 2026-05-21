// HOME_SPEC §1.1 — Home hero (eyebrow, title, lede)
// Identical across all 3 archetypes. State communication is in the pill row.
import React from 'react';

export const HomeHero: React.FC = () => {
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        By case
      </div>
      <h1 className="text-[24px] font-medium text-slate-900 leading-tight tracking-tight mb-2">
        What&apos;s the case?
      </h1>
      <p className="text-[14.5px] text-slate-500 leading-snug">
        Your neurology resident and attending guide. Pick a scenario or browse all the tools.
      </p>
    </div>
  );
};

export default HomeHero;
