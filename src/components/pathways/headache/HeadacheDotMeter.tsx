/**
 * HeadacheDotMeter — presentation-only criteria meter for the v4 headache
 * pathway (Frame 2 differential rows + Frame 3 result candidates).
 *
 * Renders `filled` of `total` ICHD-3 criteria as small dots, the filled ones
 * tinted to the band. Architect §17.1 Q4: presentation-only, props
 * `{ filled, total, band }`, NO clinical text and NO percentages — the bare
 * "N of M" lives next to the meter in the consumer, never a fraction or percentage.
 *
 * The accessible name is the literal "N of M criteria matched" (integers only),
 * satisfying the no-percentages invariant (architect Q7.1) at the a11y layer too.
 */
import React from 'react';
import type { Band } from '../../../data/headacheBanding';

// Band → filled-dot color. Mirrors the approved mockup dot tokens
// (leading emerald-500 · possible amber-500 · less-likely neuro-500 brand).
const ON_DOT: Record<Band, string> = {
  leading: 'bg-emerald-500',
  possible: 'bg-amber-500',
  'less-likely': 'bg-neuro-500',
  'set-aside': 'bg-slate-300',
};

export interface HeadacheDotMeterProps {
  filled: number;
  total: number;
  band: Band;
  className?: string;
}

export const HeadacheDotMeter: React.FC<HeadacheDotMeterProps> = ({ filled, total, band, className }) => {
  const safeTotal = Math.max(0, Math.floor(total));
  const safeFilled = Math.max(0, Math.min(Math.floor(filled), safeTotal));
  const on = ON_DOT[band];

  return (
    <span
      role="img"
      aria-label={`${safeFilled} of ${safeTotal} criteria matched`}
      className={`inline-flex items-center gap-[3px] ${className ?? ''}`}
    >
      {Array.from({ length: safeTotal }).map((_, i) => (
        <span
          key={i}
          aria-hidden="true"
          className={`w-[7px] h-[7px] rounded-full ${i < safeFilled ? on : 'bg-slate-200'}`}
        />
      ))}
    </span>
  );
};
