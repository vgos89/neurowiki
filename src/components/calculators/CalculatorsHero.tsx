// HUB_SPEC §1.1 — Calculators hub hero
// Eyebrow: "Calculators" | Title: "{N} calculators." | Lede: tagline
// Count is computed from CALCULATORS array, never hardcoded.
import React from 'react';
import { CALCULATORS } from '../../data/calculators';

export const CalculatorsHero: React.FC = () => {
  const count = CALCULATORS.length;
  return (
    <div className="mb-5">
      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
        Calculators
      </div>
      <h1 className="text-[24px] font-medium text-slate-900 leading-tight tracking-tight mb-2">
        {count} calculators.
      </h1>
      <p className="text-[14.5px] text-slate-500 leading-snug">
        Validated clinical scoring and prediction tools.
      </p>
    </div>
  );
};

export default CalculatorsHero;
