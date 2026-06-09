/**
 * EligibilityCriteriaCard
 *
 * Renders the "Population" card with:
 *   - Always-visible two-column curated summary (inclusion ✓ / exclusion ✕)
 *   - Per-column accordion: when fullEligibility has items for that side, a
 *     "Show all N criteria" / "Show fewer" toggle appears at the foot of each
 *     column. The two toggles are independent (Option B per the approved mockup
 *     at docs/specs/mockups/trials-eligibility-criteria-redesign.html).
 *   - Expanded state renders the FULL criteria for that side from fe.inclusion /
 *     fe.exclusion using the same ✓/✕ row anatomy as the curated summary.
 *   - CriteriaGroup labels render as eyebrow text above the group's items
 *     (text-[10px] font-bold uppercase tracking-widest text-slate-400), only in
 *     the expanded view.
 *   - Provenance (source / retrieved) is an always-visible card footer whenever
 *     fullEligibility is present. It is NOT inside any collapsible region.
 *
 * ARIA: two independent useState + useId pairs (one per column).
 *   aria-expanded / aria-controls on each toggle button.
 *   Controlled region uses the `hidden` attribute (display:none; SR skips it).
 *   accessibility-specialist will do a full pass; structure is correct here.
 *
 * Token rules (design-tokens skill):
 *   - Card: bg-white border border-slate-100 rounded-xl
 *   - Section eyebrow: text-[10px] font-bold uppercase tracking-widest text-slate-400
 *   - Column sub-label: text-xs font-semibold text-slate-500
 *   - Row item: flex items-start gap-2 text-xs text-slate-700 leading-relaxed
 *   - Included mark: text-emerald-500 ✓
 *   - Excluded mark: text-red-400 ✕
 *   - Toggle: text-xs font-medium text-neuro-500 hover:text-neuro-600
 *   - Provenance footer: px-4 py-2.5 border-t border-slate-100 text-[11px] text-slate-500
 *   - No arbitrary values; no gray-* / border-2 / shadow-sm / inline styles
 */

import React, { useState, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import type { TrialMetadata, CriteriaGroup } from '../../data/trialData';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Count total items across all groups on one side of fullEligibility */
function countItems(groups: CriteriaGroup[]): number {
  return groups.reduce((sum, g) => sum + g.items.length, 0);
}

// ─── Full criteria list — shared anatomy for both sides ───────────────────────

interface FullCriteriaListProps {
  groups: CriteriaGroup[];
  mark: '✓' | '✕';
  markClass: string; // text-emerald-500 or text-red-400
}

/**
 * Renders full criteria groups in the expanded state.
 * Each item uses the SAME ✓/✕ row anatomy as the curated summary.
 * Group labels (when present) render as eyebrow text above the group's items.
 */
function FullCriteriaList({ groups, mark, markClass }: FullCriteriaListProps) {
  return (
    <div className="space-y-2.5 mt-2.5 pt-2.5 border-t border-slate-100">
      {groups.map((group, gi) => (
        <div key={gi}>
          {group.label && (
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-3 mb-1">
              {group.label}
            </p>
          )}
          <ul className="space-y-1.5">
            {group.items.map((item, ii) => (
              <li key={ii} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                <span className={`${markClass} flex-shrink-0 mt-0.5`} aria-hidden="true">
                  {mark}
                </span>
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
  // Per-column accordion state — independent
  const [incExpanded, setIncExpanded] = useState(false);
  const [excExpanded, setExcExpanded] = useState(false);

  // Stable IDs for aria-controls
  const incRegionId = useId();
  const excRegionId = useId();

  const hasAnyCriteria =
    (tm.inclusionCriteria?.length ?? 0) > 0 ||
    (tm.exclusionCriteria?.length ?? 0) > 0;

  if (!hasAnyCriteria) return null;

  const fe = tm.fullEligibility;
  const hasFullInclusion =
    fe && fe.inclusion && fe.inclusion.length > 0;
  const hasFullExclusion =
    fe && fe.exclusion && fe.exclusion.length > 0;
  const hasFullEligibility = hasFullInclusion || hasFullExclusion;

  const incTotal = hasFullInclusion ? countItems(fe!.inclusion!) : 0;
  const excTotal = hasFullExclusion ? countItems(fe!.exclusion!) : 0;

  return (
    <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">

      {/* Card header */}
      <div className="px-4 py-3 border-b border-slate-100">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          Population
        </p>
      </div>

      {/* Two-column grid — curated summary + per-column accordion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

        {/* ── Included column ── */}
        {tm.inclusionCriteria && tm.inclusionCriteria.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Included</p>

            {/* Curated summary — always visible */}
            <ul className="space-y-1.5">
              {tm.inclusionCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="text-emerald-500 flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✓
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            {/* Full criteria — controlled region */}
            {hasFullInclusion && fe?.inclusion && (
              <div id={incRegionId} hidden={!incExpanded}>
                <FullCriteriaList
                  groups={fe.inclusion}
                  mark="✓"
                  markClass="text-emerald-500"
                />
              </div>
            )}

            {/* Per-column toggle */}
            {hasFullInclusion && (
              <button
                type="button"
                aria-expanded={incExpanded}
                aria-controls={incRegionId}
                aria-label={incExpanded ? 'Show fewer inclusion criteria' : `Show all ${incTotal} inclusion criteria`}
                onClick={() => setIncExpanded((prev) => !prev)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-neuro-500 hover:text-neuro-600 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-inset transition-colors"
              >
                {incExpanded ? 'Show fewer' : `Show all ${incTotal} criteria`}
                <ChevronDown
                  className="w-3 h-3 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: incExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        )}

        {/* ── Excluded column ── */}
        {tm.exclusionCriteria && tm.exclusionCriteria.length > 0 && (
          <div className="p-4">
            <p className="text-xs font-semibold text-slate-500 mb-2">Excluded</p>

            {/* Curated summary — always visible */}
            <ul className="space-y-1.5">
              {tm.exclusionCriteria.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700 leading-relaxed">
                  <span className="text-red-400 flex-shrink-0 mt-0.5" aria-hidden="true">
                    ✕
                  </span>
                  {c}
                </li>
              ))}
            </ul>

            {/* Full criteria — controlled region */}
            {hasFullExclusion && fe?.exclusion && (
              <div id={excRegionId} hidden={!excExpanded}>
                <FullCriteriaList
                  groups={fe.exclusion}
                  mark="✕"
                  markClass="text-red-400"
                />
              </div>
            )}

            {/* Per-column toggle */}
            {hasFullExclusion && (
              <button
                type="button"
                aria-expanded={excExpanded}
                aria-controls={excRegionId}
                aria-label={excExpanded ? 'Show fewer exclusion criteria' : `Show all ${excTotal} exclusion criteria`}
                onClick={() => setExcExpanded((prev) => !prev)}
                className="mt-2 flex items-center gap-1 text-xs font-medium text-neuro-500 hover:text-neuro-600 min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-inset transition-colors"
              >
                {excExpanded ? 'Show fewer' : `Show all ${excTotal} criteria`}
                <ChevronDown
                  className="w-3 h-3 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: excExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  aria-hidden="true"
                />
              </button>
            )}
          </div>
        )}

      </div>

      {/* Provenance footer — always visible when fullEligibility present */}
      {hasFullEligibility && fe && (fe.sourceLabel || fe.retrieved) && (
        <div className="px-4 py-2.5 border-t border-slate-100">
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Source:{' '}
            {fe.sourceUrl ? (
              <a
                href={fe.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block py-2 text-neuro-500 hover:underline break-all"
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
        </div>
      )}

    </div>
  );
}
