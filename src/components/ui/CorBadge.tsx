import React from 'react';
import { LegendTerm } from './LegendTerm';

type CorValue = 'I' | '2a' | '2b' | '3' | '3-harm';

interface CorBadgeProps {
  cor: CorValue;
  withLegend?: boolean;
  className?: string;
}

function corToTermId(cor: CorValue): string {
  switch (cor) {
    case 'I': return 'cor-1';
    case '2a': return 'cor-2a';
    case '2b': return 'cor-2b';
    case '3': return 'cor-3-no-benefit';
    case '3-harm': return 'cor-3-harm';
  }
}

function corColorClass(cor: CorValue): string {
  switch (cor) {
    case 'I': return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case '2a': return 'bg-amber-50 text-amber-700 border border-amber-200';
    case '2b': return 'bg-orange-50 text-orange-700 border border-orange-200';
    case '3': return 'bg-red-50 text-red-700 border border-red-200';
    case '3-harm': return 'bg-red-50 text-red-700 border border-red-200';
  }
}

function corDisplayLabel(cor: CorValue): string {
  switch (cor) {
    case 'I': return 'COR 1';
    case '2a': return 'COR 2a';
    case '2b': return 'COR 2b';
    case '3': return 'COR 3';
    case '3-harm': return 'COR 3 — Harm';
  }
}

export const CorBadge: React.FC<CorBadgeProps> = ({ cor, withLegend = true, className = '' }) => {
  const badgeClasses = `inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${corColorClass(cor)} ${className}`;

  const badge = <span className={badgeClasses}>{corDisplayLabel(cor)}</span>;

  if (!withLegend) return badge;

  return (
    <LegendTerm termId={corToTermId(cor)} variant="badge">
      {badge}
    </LegendTerm>
  );
};
