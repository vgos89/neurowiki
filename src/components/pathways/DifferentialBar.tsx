/**
 * DifferentialBar — horizontal candidate-phenotype probability bars.
 *
 * Generic at the UI layer. Takes a typed array of { id, name, section,
 * percent } and renders sorted bars. First consumer: ClinicHeadachePathway
 * State B drawer content.
 *
 * Accessibility:
 *   - role="list" + role="listitem"
 *   - aria-valuenow for screen-reader percentage announcement
 *   - aria-live="polite" so updates announce as the user answers questions
 *
 * Visual: a short label + a horizontal track + a fill bar whose width
 * encodes percent. Color encodes match strength: emerald ≥80%, amber 40–79%,
 * slate <40% (faded).
 */

import React from 'react';

export interface DifferentialItem {
  id: string;
  name: string;
  section?: string;
  /** 0–100. */
  percent: number;
}

export interface DifferentialBarProps {
  items: DifferentialItem[];
  /** Optional heading override. Defaults to "Differential". */
  heading?: string;
}

const trackBg = (percent: number): string => {
  if (percent >= 80) return 'bg-emerald-500';
  if (percent >= 40) return 'bg-amber-500';
  return 'bg-slate-300';
};

const labelColor = (percent: number): string => {
  if (percent >= 80) return 'text-emerald-700';
  if (percent >= 40) return 'text-amber-700';
  return 'text-slate-500';
};

export const DifferentialBar: React.FC<DifferentialBarProps> = ({ items, heading = 'Differential' }) => {
  const sorted = [...items].sort((a, b) => b.percent - a.percent);
  return (
    <div role="region" aria-live="polite" aria-label="Phenotype differential" className="space-y-2">
      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{heading}</p>
      {sorted.length === 0 ? (
        <p className="text-[12px] text-slate-500">Answer the first question to see candidate phenotypes.</p>
      ) : (
        <ul role="list" className="space-y-1.5">
          {sorted.map(item => (
            <li key={item.id} role="listitem" className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <span className={`text-[12px] font-semibold truncate ${labelColor(item.percent)}`}>
                    {item.name}
                  </span>
                  {item.section && (
                    <span className="text-[10px] text-slate-400 flex-shrink-0">{item.section}</span>
                  )}
                </div>
                <div
                  role="progressbar"
                  aria-valuenow={item.percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${item.name} match strength`}
                  className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1"
                >
                  <div
                    className={`h-full ${trackBg(item.percent)} transition-all duration-300 motion-reduce:transition-none`}
                    style={{ width: `${Math.max(2, item.percent)}%` }}
                  />
                </div>
              </div>
              <span className={`text-[11px] font-bold tabular-nums w-10 text-right ${labelColor(item.percent)}`}>
                {item.percent}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DifferentialBar;
