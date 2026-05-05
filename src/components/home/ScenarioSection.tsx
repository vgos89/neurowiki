// HOME_SPEC §1.4 — collapsible scenario section
// HOME_SPEC §1.4.1 — section header visual contract (tinted, no dot, two-line)
// HOME_SPEC §1.4.2 — section body with row cards (HUB_SPEC §1.6)
import React, { useState } from 'react';
import type { Scenario } from '../../data/scenarios';
import { resolveTool } from '../../data/scenarios';
import ToolRowCard from '../hub/ToolRowCard';

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface ScenarioSectionProps {
  scenario: Scenario;
  isExpanded: boolean;
  onToggle: () => void;
  isFirstSection: boolean;
  isFavourited: (id: string) => boolean;
  onToggleFavourite: (id: string) => void;
}

export const ScenarioSection: React.FC<ScenarioSectionProps> = ({
  scenario,
  isExpanded,
  onToggle,
  isFirstSection,
  isFavourited,
  onToggleFavourite,
}) => {
  const [hovered, setHovered] = useState(false);
  // 8% collapsed / 12% expanded; +2% on hover (10% / 14%).
  const baseAlpha = isExpanded ? 0.12 : 0.08;
  const hoverAlpha = isExpanded ? 0.14 : 0.1;
  const headerBg = hexToRgba(
    scenario.categoryColor,
    hovered ? hoverAlpha : baseAlpha,
  );

  const bodyId = `scenario-${scenario.id}-body`;
  const subtitle = `${scenario.lede} · ${scenario.tools.length} tools`;

  return (
    <section className={isFirstSection ? '' : 'mt-[10px]'}>
      <button
        type="button"
        aria-expanded={isExpanded}
        aria-controls={bodyId}
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="flex items-center justify-between w-full px-4 py-[14px] border-0 rounded-[10px] cursor-pointer text-left transition-colors"
        style={{ backgroundColor: headerBg }}
      >
        <div className="min-w-0">
          <h2 className="text-[18px] font-semibold text-slate-900 leading-[1.25] tracking-[-0.01em]">
            {scenario.title}
          </h2>
          <div className="text-[12.5px] text-slate-500 leading-[1.4] mt-0.5">
            {subtitle}
          </div>
        </div>
        <svg
          className="w-[18px] h-[18px] text-slate-400 flex-shrink-0 transition-transform duration-[160ms] ease-out"
          style={{
            transform: isExpanded ? 'rotate(180deg)' : 'none',
          }}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isExpanded && (
        <div id={bodyId} role="region" className="px-1 pt-1">
          {scenario.tools.map((ref) => {
            const data = resolveTool(ref);
            if (!data) return null;
            const refKey = `${ref.type}:${ref.id}`;
            return (
              <ToolRowCard
                key={refKey}
                href={data.href}
                category={data.category}
                title={data.title}
                titleMeta={data.titleMeta}
                description={data.description}
                isFavourited={isFavourited(ref.id)}
                onToggleFavourite={() => onToggleFavourite(ref.id)}
              />
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ScenarioSection;
