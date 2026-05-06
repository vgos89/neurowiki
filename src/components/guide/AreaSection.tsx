// HUB_SPEC §1.5 — section header: colored dot + title + count + lede
// HUB_SPEC §1.6 — row cards via ToolRowCard
// Trail slot: read-time string (e.g. '4 min read', 'Interactive ref').
// Mirrors CategorySection (Calculators) and ScenarioSection (Pathways) patterns.
import React from 'react';
import type { GuideArea, GuideArticle } from '../../data/guideArticles';
import { AREA_META } from '../../data/guideArticles';
import ToolRowCard from '../hub/ToolRowCard';

interface Props {
  area: GuideArea;
  articles: GuideArticle[];
  isFavourited: (id: string) => boolean;
  onToggleFavourite: (id: string) => void;
  favsActive: boolean;
}

const AreaSection: React.FC<Props> = ({
  area,
  articles,
  isFavourited,
  onToggleFavourite,
  favsActive,
}) => {
  const meta = AREA_META.find((m) => m.id === area)!;

  // HUB_SPEC §7 — empty state when favourites filter empties the section
  if (articles.length === 0 && favsActive) {
    return (
      <section className="mt-[26px] first:mt-0" role="tabpanel">
        <div className="pb-3 mb-0 border-b border-slate-200">
          <div className="flex items-center gap-2.5 mb-1">
            <div className={`w-2 h-2 rounded-full ${meta.dotColor}`} aria-hidden="true" />
            <h2 className="text-[15px] font-semibold flex-1 text-slate-900">{meta.label}</h2>
            <span className="text-[12px] text-slate-400 font-medium">0</span>
          </div>
          <div className="text-[12.5px] text-slate-500 pl-[18px] leading-snug">{meta.lede}</div>
        </div>
        <div className="text-sm text-slate-400 italic px-[18px] py-3">
          No {meta.label.toLowerCase()} articles in your favourites yet.
        </div>
      </section>
    );
  }

  if (articles.length === 0) return null;

  return (
    <section className="mt-[26px] first:mt-0" role="tabpanel">
      {/* HUB_SPEC §1.5 section header */}
      <div className="pb-3 mb-0 border-b border-slate-200">
        <div className="flex items-center gap-2.5 mb-1">
          <div className={`w-2 h-2 rounded-full ${meta.dotColor}`} aria-hidden="true" />
          <h2 className="text-[15px] font-semibold flex-1 text-slate-900">{meta.label}</h2>
          <span className="text-[12px] text-slate-400 font-medium">{articles.length}</span>
        </div>
        <div className="text-[12.5px] text-slate-500 pl-[18px] leading-snug">{meta.lede}</div>
      </div>

      {/* HUB_SPEC §1.6 row cards */}
      {articles.map((article) => (
        <ToolRowCard
          key={article.id}
          href={article.path}
          category={meta.rowCategory}
          title={article.name}
          description={article.description}
          trail={
            <span className="text-[11.5px] text-slate-500 font-medium">{article.readTime}</span>
          }
          isFavourited={isFavourited(article.id)}
          onToggleFavourite={() => onToggleFavourite(article.id)}
        />
      ))}
    </section>
  );
};

export default AreaSection;
