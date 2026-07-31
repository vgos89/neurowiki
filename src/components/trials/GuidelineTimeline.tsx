/**
 * GuidelineTimeline — renders how society positions on one intervention moved
 * over time, and how they diverge by indication.
 *
 * Data: src/data/guidelineTimelines.ts. Quotes are NOT authored here; each
 * entry reads `quoted_text` from CITATION_REGISTRY, so a correction in the
 * registry propagates and no verbatim guideline text can drift on this surface.
 *
 * data-claim IS applied: the `whatChanged` and `takeaway` lines are authored
 * clinical prose describing movement between recommendations, which §13.3
 * treats as a claim surface.
 */

import React from 'react';
import { CITATION_REGISTRY } from '../../lib/citations/registry';
import { GUIDELINE_TIMELINES, type GuidelineStance } from '../../data/guidelineTimelines';

// Chip labels carry a VERB, and the indication renders above the chip, because
// "Recommends" means anticoagulation on one entry and a shared decision about
// closure on another. An objectless coloured chip is the leakage risk on a
// surface whose whole purpose is keeping the indications apart.
const STANCE: Record<GuidelineStance, { label: string; cls: string }> = {
  for: { label: 'Recommends it', cls: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  against: { label: 'Recommends against it', cls: 'bg-rose-50 text-rose-800 border-rose-200' },
  equipoise: { label: 'Either option acceptable', cls: 'bg-slate-100 text-slate-700 border-slate-300' },
  'shared-decision': { label: 'Decide jointly', cls: 'bg-sky-50 text-sky-800 border-sky-200' },
};

export const GuidelineTimeline: React.FC<{ timelineId: string }> = ({ timelineId }) => {
  const timeline = GUIDELINE_TIMELINES[timelineId];
  if (!timeline) return null;

  // Drop entries whose citation no longer resolves rather than crashing.
  // Require quoted_text, not merely a resolving citation: the authored
  // whatChanged line is a gloss ON the quote, and without the quote beside it
  // nothing governs it. quoted_text is optional in the schema, so this is a
  // real path, not a theoretical one.
  const entries = timeline.entries
    .map((e) => ({ entry: e, citation: CITATION_REGISTRY[e.citationId] }))
    .filter((x): x is { entry: typeof x.entry; citation: NonNullable<typeof x.citation> } =>
      Boolean(x.citation?.quoted_text),
    );
  if (entries.length === 0) return null;

  return (
    <section
      className="rounded-xl border border-slate-100 bg-white overflow-hidden mt-6"
      aria-label={timeline.title}
      data-claim={timeline.claimId}
    >
      <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Guideline timeline
        </p>
        <h2 className="text-[15px] font-semibold text-slate-900 mt-0.5">{timeline.title}</h2>
      </div>

      <p className="px-4 pt-3 text-[13px] text-slate-600 leading-relaxed">{timeline.intro}</p>

      <ol className="px-4 py-3 space-y-3">
        {entries.map(({ entry, citation }) => {
          const stance = STANCE[entry.stance];
          return (
            <li
              key={entry.citationId}
              className="relative pl-4 border-l-2 border-slate-200 pb-1"
            >
              <div className="flex items-baseline gap-2 flex-wrap mb-1">
                <span className="text-sm font-bold text-slate-900 tabular-nums">
                  {citation.year}
                </span>
                <span className="text-sm font-semibold text-slate-700">{entry.society}</span>
              </div>

              {/* Indication FIRST, and at readable contrast: the chip below is
                  meaningless without it. */}
              <p className="text-[12px] font-medium text-slate-600 mb-1.5">
                {entry.indication}
              </p>

              <div className="flex items-baseline gap-2 flex-wrap mb-1.5">
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 border rounded ${stance.cls}`}
                >
                  {stance.label}
                </span>
                <span className="text-[11px] text-slate-500">{entry.strength}</span>
              </div>

              <blockquote className="text-[13px] text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-3 my-2 italic">
                {citation.quoted_text}
              </blockquote>

              <p className="text-[13px] text-slate-600 leading-relaxed">{entry.whatChanged}</p>

              {entry.notGraded && (
                <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-2 leading-relaxed">
                  {entry.notGraded}
                </p>
              )}

              {citation.url && (
                <a
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[11px] text-neuro-600 hover:underline mt-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 rounded"
                >
                  {citation.title}
                </a>
              )}
            </li>
          );
        })}
      </ol>

      <div className="px-4 pb-4">
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
            What to carry away
          </p>
          <p className="text-[13px] text-slate-800 leading-relaxed">{timeline.takeaway}</p>
        </div>
      </div>
    </section>
  );
};

export default GuidelineTimeline;
