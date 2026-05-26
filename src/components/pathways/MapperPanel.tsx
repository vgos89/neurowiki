/**
 * MapperPanel — live diagnostic-phenotype mapper UI.
 *
 * Renders the top-ranked PhenotypeMatch results from a pure evaluator
 * function (e.g. evaluateHeadachePhenotypes). Output language never says
 * "Diagnosis" — always "Features consistent with X" or "Features consistent
 * with Probable X (one criterion short)."
 *
 * Generic-shape inputs: takes a typed matches array, not a headache-specific
 * type. Each match carries phenotype name, ICHD-3 section, criteria
 * met/missing detail, and optional appendix flag.
 *
 * Accessibility:
 *   - aria-live="polite" region announces match changes to screen readers
 *   - Each match card is a button when expandable
 *
 * Teach mode integration: the per-match learn-pearl is rendered by the
 * caller via the optional `pearlsByPhenotype` slot. Pitfalls (typed as
 * react nodes) are also caller-provided so this primitive stays generic.
 */

import React from 'react';
import { CheckCircle, Circle } from 'lucide-react';

export interface MapperMatch {
  phenotypeId: string;
  name: string;
  /** Source section reference, e.g. "ICHD-3 §1.1". */
  section: string;
  /** 'full' | 'probable' | 'partial'. Sort + label rendering depends on this. */
  matchStrength: 'full' | 'probable' | 'partial';
  criteriaMet: number;
  criteriaTotal: number;
  metCriteria: { id: string; label: string }[];
  missingCriteria: { id: string; label: string; description: string }[];
  /** When true, render an "Appendix entity" badge on the match. */
  isAppendix?: boolean;
}

export interface MapperPanelProps {
  /** Ranked matches from the evaluator. */
  matches: MapperMatch[];
  /** Optional per-phenotype "Learn this pattern" pearl content, shown when teachMode is on. */
  pearlsByPhenotype?: Record<string, React.ReactNode>;
  /** Optional pitfall notices to render above the matches list. */
  pitfalls?: React.ReactNode;
  /** Teach mode flag, propagated from the page. */
  teachMode?: boolean;
  /**
   * Optional header label override (default "Mapping against ICHD-3 criteria").
   */
  heading?: string;
  /**
   * Optional empty-state message when no matches yet.
   * Default: "Select features above to see candidate phenotypes."
   */
  emptyMessage?: string;
}

const StrengthChip: React.FC<{ strength: MapperMatch['matchStrength'] }> = ({ strength }) => {
  const tokens =
    strength === 'full'
      ? { bg: 'bg-emerald-100', text: 'text-emerald-800', label: 'Consistent with' }
      : strength === 'probable'
        ? { bg: 'bg-amber-100', text: 'text-amber-800', label: 'Consistent with Probable' }
        : { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Partial match' };
  return (
    <span className={`inline-flex items-center text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 ${tokens.bg} ${tokens.text}`}>
      {tokens.label}
    </span>
  );
};

const AppendixBadge: React.FC = () => (
  <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-widest rounded-full px-2 py-0.5 bg-slate-100 text-slate-600 ml-2" title="ICHD-3 appendix entity (research criteria)">
    Appendix entity
  </span>
);

export const MapperPanel: React.FC<MapperPanelProps> = ({
  matches,
  pearlsByPhenotype,
  pitfalls,
  teachMode = false,
  heading = 'Mapping against ICHD-3 criteria',
  emptyMessage = 'Select features above to see candidate phenotypes.',
}) => {
  return (
    <section
      aria-label="Phenotype mapper"
      aria-live="polite"
      className="rounded-xl border border-slate-200 bg-white p-4 space-y-3"
      style={{ boxShadow: '0 4px 16px rgba(15,23,42,0.10)' }}
    >
      <header className="flex items-baseline justify-between">
        <h2 className="text-[14px] font-semibold text-slate-900">{heading}</h2>
        {matches.length > 0 && (
          <span className="text-[11px] text-slate-500">{matches.length} candidate{matches.length === 1 ? '' : 's'}</span>
        )}
      </header>

      {pitfalls && <div className="space-y-2">{pitfalls}</div>}

      {matches.length === 0 ? (
        <p className="text-[13px] text-slate-500 leading-relaxed">{emptyMessage}</p>
      ) : (
        <div className="space-y-3">
          {matches.map(match => (
            <details
              key={match.phenotypeId}
              className="group rounded-lg border border-slate-100 bg-slate-50 overflow-hidden"
              {...(match.matchStrength === 'full' ? { open: true } : {})}
            >
              <summary
                className="
                  flex items-center justify-between gap-3 px-3 py-2.5 cursor-pointer list-none select-none min-h-[44px]
                  focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
                  hover:bg-slate-100 transition-colors touch-manipulation
                "
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <StrengthChip strength={match.matchStrength} />
                    {match.isAppendix && <AppendixBadge />}
                  </div>
                  <p className="text-[14px] font-semibold text-slate-900 truncate">
                    {match.name}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {match.section} · {match.criteriaMet} of {match.criteriaTotal} criteria met
                  </p>
                </div>
                <svg
                  width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor"
                  strokeWidth="2"
                  className="text-slate-400 transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none flex-shrink-0"
                  aria-hidden="true"
                >
                  <polyline points="6 8 10 12 14 8" />
                </svg>
              </summary>

              <div className="px-3 pb-3 pt-2 border-t border-slate-100 space-y-2">
                {match.metCriteria.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700 mb-1">Criteria met</p>
                    <ul className="space-y-1">
                      {match.metCriteria.map(c => (
                        <li key={c.id} className="flex items-start gap-2 text-[12px] text-slate-800">
                          <CheckCircle size={13} className="text-emerald-600 shrink-0 mt-0.5" aria-hidden="true" />
                          <span>{c.label}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {match.missingCriteria.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Still needed</p>
                    <ul className="space-y-1">
                      {match.missingCriteria.map(c => (
                        <li key={c.id} className="flex items-start gap-2 text-[12px] text-slate-700">
                          <Circle size={13} className="text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                          <div>
                            <p className="font-medium">{c.label}</p>
                            {teachMode && (
                              <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{c.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {teachMode && pearlsByPhenotype?.[match.phenotypeId] && (
                  <div className="pt-1">{pearlsByPhenotype[match.phenotypeId]}</div>
                )}
              </div>
            </details>
          ))}
        </div>
      )}
    </section>
  );
};

export default MapperPanel;
