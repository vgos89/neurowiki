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
 * Layout (V request 2026-05-23): collapsed-by-default. When collapsed,
 * the card surfaces only the headline + the bottom-line callout + the
 * source chips — the actionable content a clinician needs at the
 * bedside. The 4–6 body paragraphs hide behind a "Read the full
 * synthesis" disclosure that toggles inline expansion. This prevents
 * the synthesis prose from taking over the entire viewport while
 * keeping the full analysis one tap away.
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

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { CLAIM_REGISTRY } from '../../lib/citations/claims';
import { CITATION_REGISTRY } from '../../lib/citations/registry';
import type { ClinicalSynthesis } from '../../data/clinicalSynthesesByQuestion';

interface ClinicalSynthesisCardProps {
  synthesis: ClinicalSynthesis;
  /** Override the default-collapsed initial state. Tests / future call-sites only. */
  defaultExpanded?: boolean;
}

export const ClinicalSynthesisCard: React.FC<ClinicalSynthesisCardProps> = ({
  synthesis,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const bodyId = `synthesis-body-${synthesis.claimId}`;

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
      {/* Header eyebrow */}
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

      {/* Headline — always visible */}
      <div className="px-4 pt-4 pb-2">
        <p className="text-base font-semibold text-slate-900 leading-snug">
          {synthesis.headline}
        </p>
      </div>

      {/* Bottom-line callout — always visible (the actionable answer the
          clinician needs at the bedside). Moved above the body paragraphs
          so it stays surfaced in the collapsed state. */}
      <div className="px-4 pb-3">
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

      {/* Read-full-synthesis disclosure — toggles body paragraph block.
          Hidden if there are no body paragraphs (defensive). */}
      {synthesis.bodyParagraphs.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setIsExpanded((v) => !v)}
            aria-expanded={isExpanded}
            aria-controls={bodyId}
            className="w-full min-h-[44px] flex items-center justify-between px-4 py-2.5 border-t border-slate-100 bg-slate-50/40 hover:bg-slate-50 transition-colors text-left"
          >
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
              {isExpanded
                ? 'Hide full synthesis'
                : `Read the full synthesis · ${synthesis.bodyParagraphs.length} paragraphs`}
            </span>
            <ChevronDown
              className="w-4 h-4 text-slate-400 flex-shrink-0 transition-transform"
              style={{
                transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 200ms cubic-bezier(0.16,1,0.3,1)',
              }}
              aria-hidden
            />
          </button>

          {isExpanded && (
            <div id={bodyId} className="px-4 py-4 space-y-3 border-t border-slate-100">
              {synthesis.bodyParagraphs.map((para, i) => (
                <p
                  key={i}
                  className="text-sm text-slate-700 leading-relaxed"
                >
                  {para}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {/* Citation chips — always visible. Sources stay surfaced even when
          the body is collapsed so clinicians can verify attribution
          without expanding the prose. */}
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
