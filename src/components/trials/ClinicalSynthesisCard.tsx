/**
 * ClinicalSynthesisCard — surfaces an editorial clinical-synthesis on a
 * trial-question page where no AHA/ASA / equivalent guideline directly
 * answers the question.
 *
 * Companion to GuidelineSummaryCard. Decision rule (QuestionDetailPage):
 *   - If getGuidelineSummaryForQuestion(id) exists → render GuidelineSummaryCard
 *   - Else if getClinicalSynthesisForQuestion(id) exists → render this card
 *   - Else → render the existing "Curated answer in progress" placeholder
 *
 * Data flow:
 *   ClinicalSynthesis (claimId, headline, bodyParagraphs, bottomLine)
 *     → CLAIM_REGISTRY[claimId].citation_ids
 *     → CITATION_REGISTRY[citationId].{title, section, year, url, …}
 *
 * The card renders the prose authored in clinicalSynthesesByQuestion.ts;
 * the citation chips at the bottom are resolved at render time from the
 * registry so a citation rename automatically propagates.
 *
 * Spec references:
 *   - CLAUDE.md §13.3 / §13.4 — claim surface tagging (data field)
 *   - design-tokens skill — neuro-* tokens, hairline borders, slate scale
 */

import React from 'react';
import { CLAIM_REGISTRY } from '../../lib/citations/claims';
import { CITATION_REGISTRY } from '../../lib/citations/registry';
import type { ClinicalSynthesis } from '../../data/clinicalSynthesesByQuestion';

interface ClinicalSynthesisCardProps {
  synthesis: ClinicalSynthesis;
}

export const ClinicalSynthesisCard: React.FC<ClinicalSynthesisCardProps> = ({ synthesis }) => {
  const claim = CLAIM_REGISTRY[synthesis.claimId];
  if (!claim) {
    // Fail-safe: never crash a page because a claim id was deleted.
    return null;
  }

  const citations = claim.citation_ids
    .map((id) => CITATION_REGISTRY[id])
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  return (
    <section
      className="rounded-xl border border-slate-100 bg-white overflow-hidden"
      aria-label="Clinical synthesis"
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-slate-100"
        style={{ background: 'var(--cobalt-soft)' }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-neuro-500)' }}
        >
          Clinical Synthesis
        </p>
      </div>

      {/* Headline */}
      <div className="px-4 pt-4 pb-1">
        <p className="text-base font-semibold text-slate-900 leading-snug">
          {synthesis.headline}
        </p>
      </div>

      {/* Body paragraphs */}
      <div className="px-4 py-3 space-y-3">
        {synthesis.bodyParagraphs.map((para, i) => (
          <p
            key={i}
            className="text-sm text-slate-700 leading-relaxed"
          >
            {para}
          </p>
        ))}
      </div>

      {/* Bottom-line callout */}
      <div className="px-4 pb-4">
        <div
          className="rounded-lg px-4 py-3"
          style={{
            background: 'var(--cobalt-soft)',
            borderLeft: '3px solid var(--color-neuro-500)',
          }}
        >
          <p
            className="text-[10px] font-bold uppercase tracking-widest mb-1"
            style={{ color: 'var(--color-neuro-500)' }}
          >
            Bottom line
          </p>
          <p className="text-sm text-slate-800 leading-relaxed font-medium">
            {synthesis.bottomLine}
          </p>
        </div>
      </div>

      {/* Citation chips */}
      {citations.length > 0 && (
        <div className="px-4 py-3 bg-slate-50/50 border-t border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
            Sources
          </p>
          <div className="flex flex-wrap gap-1.5">
            {citations.map((c) => (
              <a
                key={c.id}
                href={c.url ?? '#'}
                target={c.url ? '_blank' : undefined}
                rel={c.url ? 'noopener noreferrer' : undefined}
                className="inline-flex items-center gap-1 text-[11px] text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-1 hover:border-slate-300 hover:text-slate-800 transition-colors"
                title={c.title}
              >
                <span className="font-medium">
                  {c.section ?? c.title.split(' — ')[0].split(':')[0]}
                </span>
                <span className="text-slate-400">· {c.year}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

export default ClinicalSynthesisCard;
