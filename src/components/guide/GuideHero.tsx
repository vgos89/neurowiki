// HUB_SPEC §1.1 — Guide hub hero
// Eyebrow "Guide" / H1 "{count} articles." / subtitle.
// Mirrors CalculatorsHero and PathwaysHero patterns exactly.
import React from 'react';
import { GUIDE_ARTICLES } from '../../data/guideArticles';

const GuideHero: React.FC = () => {
  const count = GUIDE_ARTICLES.length;
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Guide</div>
      <h1 className="text-[24px] font-medium text-slate-900 leading-tight tracking-tight mb-2">
        {count} articles.
      </h1>
      <p className="text-[14.5px] text-slate-500 leading-snug">
        Evidence-linked clinical protocols and reference guides.
      </p>
    </div>
  );
};

export default GuideHero;
