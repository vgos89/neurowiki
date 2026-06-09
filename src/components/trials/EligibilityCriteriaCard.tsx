/**
 * EligibilityCriteriaCard
 *
 * Renders the "Population" card that already appears at ~120 archetype call sites
 * via renderPopulationSection(tm). Promotes that helper into a named component that:
 *   - Always shows the curated inclusion / exclusion summary (existing layout, unchanged)
 *   - When tm.fullEligibility is present, adds a "Show full criteria" inline disclosure
 *     below the summary (collapsed by default)
 *
 * ARIA: inline disclosure, NOT a portal drawer. Uses a real <button> with
 * aria-expanded / aria-controls pointing at the controlled region via id.
 * Accessibility-specialist will do a full pass; this component gets the structure right.
 *
 * Token rules (design-tokens skill):
 *   - Card: bg-white border border-slate-100 rounded-xl
 *   - Section label: text-[10px] font-bold uppercase tracking-widest text-slate-400 (eyebrow at card header — matches all sibling sections)
 *   - Body text: text-xs text-slate-700 / text-sm text-slate-600 leading-[1.55]
 *   - Muted provenance: text-[11px] text-slate-500 (slate-400 fails 4.5:1 on white)
 *   - No arbitrary values; no gray-* / border-2 / shadow-sm
 */

import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TrialMetadata, CriteriaGroup } from '../../data/trialData';

// ─── Sub-components ──────────────────────────────────────────────────────────

interface CriteriaGroupListProps {
  groups: CriteriaGroup[];
}

/** Renders a list of CriteriaGroup entries. Flat list when no label. */
function CriteriaGroupList({ groups }: CriteriaGroupListProps) {
  return (
    <div className="space-y-3">
      {groups.map((group, gi) => (
        <div key={gi} role={group.label ? 'group' : undefined} aria-label={group.label ?? undefined}>
          {group.label && (
            /* h4: within a card that sits under an h2/h3 in the trial page.
               Using a heading makes the group programmatically distinguishable
               to screen-reader users navigating by heading inside the disclosure. */
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              {group.label}
            </h4>
          )}
          <ul className="space-y-1.5">
            {group.items.map((item, ii) => (
              <li key={ii} className="text-xs text-slate-700 leading-relaxed">
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface EligibilityCriteriaCardProps {
  tm: TrialMetadata;
}

export function EligibilityCriteriaCard({ tm }: EligibilityCriteriaCardProps) {
  const [expanded, setExpanded] = useState(false);
  const regionId = useId();

  const hasAnyCriteria =
    (tm.inclusionCriteria?.length ?? 0) > 0 ||
    (tm.exclusionCriteria?.length ?? 0) > 0;

  if (!hasAnyCriteria) return null;

  const fe = tm.fullEligibility;
  const hasFullEligibility =
    fe &&
    ((fe.inclusion?.length ?? 0) > 0 || (fe.exclusion?.length ?? 0) > 0);

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
      {/* Card header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Population
        </p>
      </div>

      {/* Curated summary — two-column grid, unchanged styling */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {tm.inclusionCriteria && tm.inclusionCriteria.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Included</p>
            <ul className="space-y-1.5">
              {tm.inclusionCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
        {tm.exclusionCriteria && tm.exclusionCriteria.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Excluded</p>
            <ul className="space-y-1.5">
              {tm.exclusionCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✕
                  </span>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Full criteria disclosure — only rendered when fullEligibility is present */}
      {hasFullEligibility && fe && (
        <div className="border-t border-slate-100">
          {/* Disclosure toggle button */}
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={regionId}
            onClick={() => setExpanded((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 text-left min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#1746A2] focus-visible:ring-inset hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-medium text-[#1746A2]">
              {expanded ? 'Hide full criteria' : 'Show full criteria'}
            </span>
            <ChevronDown
              className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform duration-200"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
              aria-hidden="true"
            />
          </button>

          {/* Controlled region */}
          <div
            id={regionId}
            hidden={!expanded}
            className="px-4 pb-4 space-y-5"
          >
            {/* Inclusion block */}
            {fe.inclusion && fe.inclusion.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Full inclusion criteria
                </p>
                <CriteriaGroupList groups={fe.inclusion} />
              </div>
            )}

            {/* Exclusion block */}
            {fe.exclusion && fe.exclusion.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-2">
                  Full exclusion criteria
                </p>
                <CriteriaGroupList groups={fe.exclusion} />
              </div>
            )}

            {/* Provenance line */}
            {(fe.sourceLabel || fe.retrieved) && (
              <p className="text-[11px] text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
                Source:{' '}
                {fe.sourceUrl ? (
                  <a
                    href={fe.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#1746A2] hover:underline break-all"
                  >
                    {fe.sourceLabel ?? fe.sourceUrl}
                  </a>
                ) : (
                  <span>{fe.sourceLabel}</span>
                )}
                {fe.retrieved && (
                  <span className="ml-1">· Retrieved {fe.retrieved}</span>
                )}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
