import React, { useEffect, useState } from 'react';
import type { PhenotypeMatch } from '../../../data/clinicHeadacheData';
import { CriteriaList } from './CriteriaList';

/**
 * HeadacheResultList — ranked ICHD-3 phenotype matches as a compact accordion
 * list in trials/calculator density. One accordion per phenotype; the top match
 * opens by default, the rest stay collapsed so the result reads short instead of
 * a long scroll.
 *
 * WHY THIS IS NOT MapperPanel (architect §17.1 condition 1 — named, intentional
 * fork). The generic src/components/pathways/MapperPanel.tsx renders the same
 * shape, but its local MapperMatch type cannot carry two things this surface
 * requires: (1) metCriteria.contributingChipLabels — the "Based on your
 * selection: …" audit trail a prior clinical-reviewer condition mandated; and
 * (2) the chronic-migraine-probable exception (chronic migraine at 'probable'
 * must NOT read "Probable", because ICHD-3 §1.5 does not cover §1.3). Reusing
 * MapperPanel would force a lossy adapter or an edit to a shared primitive.
 * CONSOLIDATION EXIT: when MapperMatch is widened to carry contributingChipLabels
 * and a section/label-exception hook (or a second pathway needs this exact
 * renderer), collapse the two into MapperPanel.
 *
 * Stage One scope: presentation only. Every displayed string is relocated
 * verbatim from the headline card, differential ribbon, and multi-diagnosis
 * banner it replaces in ClinicHeadachePathway.tsx. No clinical wording is
 * authored here. Band words (Leading/Possible/Less likely), the treatment
 * link-out, and the "considered and set aside" tray are later stages.
 */

interface HeadacheResultListProps {
  matches: PhenotypeMatch[];
}

export const HeadacheResultList: React.FC<HeadacheResultListProps> = ({ matches }) => {
  const topId = matches[0]?.phenotypeId;
  const matchKey = matches.map((m) => m.phenotypeId).join('|');

  // Top match open by default; reset to that whenever the evaluation changes.
  const [openIds, setOpenIds] = useState<Set<string>>(() => new Set(topId ? [topId] : []));
  useEffect(() => {
    setOpenIds(new Set(topId ? [topId] : []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchKey]);

  if (matches.length === 0) return null;

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const significantMatches = matches.filter(
    (m) => m.matchStrength === 'full' || m.matchStrength === 'probable',
  );

  return (
    <div className="space-y-3">
      {/* Ranked accordion list — one row per phenotype, top match open */}
      <div className="rounded-xl border border-slate-100 bg-white overflow-hidden divide-y divide-slate-50">
        {matches.map((m, index) => {
          const isOpen = openIds.has(m.phenotypeId);
          const percent = Math.round((m.criteriaMet / m.criteriaTotal) * 100);
          // Chronic-migraine-probable exception (prior clinical-reviewer
          // condition): §1.5 does not cover §1.3, so render "Partial"/slate,
          // never "Probable". Tag + color logic relocated verbatim from the
          // page's differential ribbon.
          const isChronicMigraineProb = m.phenotypeId === 'chronic-migraine' && m.matchStrength === 'probable';
          const tag = m.matchStrength === 'full' ? 'Consistent'
            : isChronicMigraineProb ? 'Partial'
            : m.matchStrength === 'probable' ? 'Probable'
            : 'Partial';
          const tagColor = m.matchStrength === 'full' ? 'text-emerald-700 bg-emerald-50'
            : m.matchStrength === 'probable' && !isChronicMigraineProb ? 'text-amber-800 bg-amber-50'
            : 'text-slate-600 bg-slate-100';
          const barColor = m.matchStrength === 'full' ? 'bg-emerald-500'
            : m.matchStrength === 'probable' && !isChronicMigraineProb ? 'bg-amber-500'
            : 'bg-slate-400';
          const panelId = `headache-match-panel-${m.phenotypeId}`;
          const accent = index === 0 ? { borderLeft: '3px solid var(--color-neuro-500)' } : undefined;

          return (
            <div key={m.phenotypeId} style={accent}>
              <h3 className="m-0">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggle(m.phenotypeId)}
                  className="w-full min-h-[44px] flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50/70 transition-colors motion-reduce:transition-none touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-inset"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-widest rounded-full px-2 py-0.5 flex-shrink-0 ${tagColor}`}>
                        {tag}
                      </span>
                      <span className="text-[14px] font-semibold text-slate-900 truncate">
                        {m.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {m.criteriaMet} of {m.criteriaTotal} criteria · {m.displaySection}
                      {m.isAppendix && <span className="italic"> · appendix entity</span>}
                    </p>
                    {/* Decorative criteria-met bar. aria-hidden so it does not
                        pollute the button's accessible name — the visible
                        "{percent}%" text carries the proportion to AT
                        (accessibility review: progressbar-inside-button). */}
                    <div
                      aria-hidden="true"
                      className="h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1.5"
                    >
                      <div
                        className={`h-full ${barColor} transition-all duration-300 motion-reduce:transition-none`}
                        style={{ width: `${Math.max(2, percent)}%` }}
                      />
                    </div>
                  </div>
                  <span className="flex items-center gap-2 flex-shrink-0 mt-0.5">
                    <span className="text-[12px] font-semibold tabular-nums text-slate-700">{percent}%</span>
                    <svg
                      aria-hidden="true"
                      viewBox="0 0 16 16"
                      className={`w-4 h-4 text-slate-400 transition-transform duration-200 motion-reduce:transition-none ${isOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.75}
                    >
                      <path d="M4 6l4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>
              </h3>
              <div id={panelId} role="region" aria-label={`${m.name} criteria detail`} hidden={!isOpen}>
                <CriteriaList match={m} />
              </div>
            </div>
          );
        })}
      </div>

      {/* General disclaimer — relocated verbatim from the former headline card */}
      <p className="text-[11px] text-slate-500 leading-relaxed px-1">
        Confirm pattern across multiple attacks and review the patient&apos;s history before treating. This tool maps features against ICHD-3 criteria; the diagnosis remains a clinical judgement.
      </p>

      {/* Differential caption — relocated verbatim; shown when >1 match */}
      {matches.length > 1 && (
        <p className="text-[11px] text-slate-500 leading-relaxed px-1">
          Higher percentages indicate stronger criterion fulfilment. ICHD-3 General Principles allow more than one primary headache code per patient — phenotypes labelled &quot;Consistent&quot; or &quot;Probable&quot; should each be considered as part of the patient&apos;s diagnosis.
        </p>
      )}

      {/* Multi-diagnosis block — relocated verbatim from the former banner;
          shown when ≥2 phenotypes are full or probable matches. */}
      {significantMatches.length > 1 && (() => {
        const additional = significantMatches.slice(1);
        return (
          <div className="rounded-xl border border-neuro-200 bg-neuro-50 p-3" role="note" aria-label="Multiple phenotypes consistent">
            <p className="text-[11px] font-bold uppercase tracking-widest text-neuro-700 mb-1">
              Multiple phenotypes consistent
            </p>
            <p className="text-[12px] text-slate-700 leading-relaxed mb-2">
              ICHD-3 General Principles require that each headache type the patient meets criteria for is separately diagnosed and coded. The drawer below shows management for the top match. The patient also meets criteria for the following additional phenotype{additional.length === 1 ? '' : 's'}:
            </p>
            <ul className="space-y-1">
              {additional.map((m) => {
                const isChronicMigraineProbable = m.phenotypeId === 'chronic-migraine' && m.matchStrength === 'probable';
                const prefix = m.matchStrength === 'full' ? 'Features consistent with '
                  : isChronicMigraineProbable ? 'Partial match for '
                  : 'Features consistent with Probable ';
                return (
                  <li key={m.phenotypeId} className="text-[12px] text-slate-800 flex items-start gap-2">
                    <span aria-hidden="true" className="text-neuro-600 mt-0.5">·</span>
                    <span>
                      <span className="font-semibold">{prefix}{m.name}</span>
                      <span className="text-slate-500"> · {m.displaySection}</span>
                      {m.isAppendix && <span className="text-slate-500 italic"> · appendix entity</span>}
                    </span>
                  </li>
                );
              })}
            </ul>
            <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
              Treat each phenotype that meets criteria separately. Acute and preventive plans may overlap.
            </p>
          </div>
        );
      })()}
    </div>
  );
};

export default HeadacheResultList;
