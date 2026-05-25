import React from 'react';
import { LegendTerm } from './LegendTerm';

type LoeValue = 'A' | 'B-R' | 'B-NR' | 'C-LD' | 'C-EO' | 'B' | 'C';

interface LoeBadgeProps {
  loe: LoeValue;
  withLegend?: boolean;
  className?: string;
}

function loeToTermId(loe: LoeValue): string {
  switch (loe) {
    case 'A': return 'loe-a';
    case 'B-R': return 'loe-b-r';
    case 'B-NR': return 'loe-b-nr';
    case 'C-LD': return 'loe-c-ld';
    case 'C-EO': return 'loe-c-eo';
    case 'B': return 'loe-b-r';
    case 'C': return 'loe-c-eo';
  }
}

export const LoeBadge: React.FC<LoeBadgeProps> = ({ loe, withLegend = true, className = '' }) => {
  const badgeClasses = `inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap ${className}`;

  const badge = <span className={badgeClasses}>LOE {loe}</span>;

  if (!withLegend) return badge;

  return (
    <LegendTerm termId={loeToTermId(loe)} variant="badge">
      {badge}
    </LegendTerm>
  );
};
