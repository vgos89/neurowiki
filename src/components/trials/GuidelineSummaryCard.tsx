/**
 * GuidelineSummaryCard — surfaces the AHA/ASA 2026 (or equivalent) clinical
 * recommendation(s) relevant to a trial-question page, at the top of the
 * page above the trial evidence list.
 *
 * Composition pattern: ADR-2026-05-22-guideline-summary-card-composition.md
 *   - One claim → one or more citations.
 *   - Card iterates `citation_ids` and renders one row per resolved citation.
 *
 * Data flow:
 *   QuestionDetailPage → getGuidelineSummaryForQuestion(questionId)
 *     → claim id  → CLAIM_REGISTRY[claimId].citation_ids
 *     → CITATION_REGISTRY[citationId].{section, year, quoted_text, ...}
 *
 * The card renders zero clinical text of its own — all visible recommendation
 * prose is read from the registry. This keeps the source-of-truth inside the
 * citation registry, where it is auditable and subject to the §13.6
 * `last_reviewed` checklist.
 *
 * data-claim attribute on the wrapper enables the pre-commit claim scanner.
 *
 * Spec references:
 *   - CLAUDE.md §13.3 / §13.4 — claim surface tagging (static JSX)
 *   - design-tokens skill — neuro-* tokens, eyebrow scale, hairline borders
 */

import React from 'react';
import { CLAIM_REGISTRY } from '../../lib/citations/claims';
import { CITATION_REGISTRY } from '../../lib/citations/registry';

interface GuidelineSummaryCardProps {
  /** Claim ID from CLAIM_REGISTRY. Resolves to one or more citations. */
  claimId: string;
}

export const GuidelineSummaryCard: React.FC<GuidelineSummaryCardProps> = ({ claimId }) => {
  const claim = CLAIM_REGISTRY[claimId];
  if (!claim) {
    // Fail-safe: never crash a page because a claim id was deleted.
    // Returning null lets the QuestionDetailPage fall back to its prior banner.
    return null;
  }

  const citations = claim.citation_ids
    .map((id) => CITATION_REGISTRY[id])
    .filter((c): c is NonNullable<typeof c> => c !== undefined);

  if (citations.length === 0) return null;

  return (
    <section
      data-claim={claimId}
      className="rounded-xl border border-slate-100 bg-white overflow-hidden"
      aria-label="Guideline summary"
    >
      {/* Header */}
      <div
        className="px-4 py-2.5 border-b border-slate-100"
        style={{
          background: 'var(--cobalt-soft)',
        }}
      >
        <p
          className="text-[10px] font-bold uppercase tracking-widest"
          style={{ color: 'var(--color-neuro-500)' }}
        >
          {citations.length === 1
            ? 'What does the guideline say?'
            : `What does the guideline say? (${citations.length} sections)`}
        </p>
      </div>

      {/* One row per cited section */}
      <ul className="divide-y divide-slate-100">
        {citations.map((c) => {
          // Extract COR/LOE from the quoted_text trailing parenthetical if
          // present. The registry convention is to put "(COR X, LOE Y.)" or
          // "(COR X.)" at the end of quoted_text. We surface the COR as a
          // colored badge; LOE is rendered as plain text alongside.
          const corMatch = c.quoted_text?.match(/\(COR\s+([0-9a-z: -]+?)(?:,\s*LOE\s+([A-Z-]+))?\.?\)\s*$/i);
          const cor = corMatch?.[1]?.trim();
          const loe = corMatch?.[2]?.trim();
          // Strip the trailing parenthetical from the displayed recommendation
          // text so we don't duplicate "(COR 2a.)" inline.
          const recText = c.quoted_text
            ? c.quoted_text.replace(/\s*\(COR[^)]+\)\s*$/i, '').trim()
            : '';

          return (
            <li key={c.id} className="px-4 py-3.5">
              {/* Section + COR/LOE badges row */}
              <div className="flex items-center flex-wrap gap-2 mb-2">
                <span
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-500"
                >
                  {c.section ?? c.title.split(' — ')[0]}
                </span>
                {cor && <CorBadge cor={cor} />}
                {loe && (
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    LOE {loe}
                  </span>
                )}
                <span className="text-[10px] text-slate-400">
                  · {c.year}
                </span>
              </div>

              {/* Verbatim recommendation text */}
              {recText && (
                <p className="text-sm text-slate-700 leading-relaxed">
                  {recText}
                </p>
              )}

              {/* Source link */}
              {c.url && (
                <p className="mt-2">
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] font-medium text-slate-500 hover:text-slate-700 underline-offset-2 hover:underline"
                  >
                    Source: {c.title}
                  </a>
                </p>
              )}
            </li>
          );
        })}
      </ul>

      {/* Footer hint */}
      <div className="px-4 py-2 bg-slate-50/50 border-t border-slate-100">
        <p className="text-[10px] text-slate-400 italic">
          The trials cited in the guideline&apos;s supportive text appear below.
        </p>
      </div>
    </section>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// COR badge — colored pill matching AHA/ASA convention.
// ─────────────────────────────────────────────────────────────────────────────

interface CorBadgeProps {
  cor: string;
}

const CorBadge: React.FC<CorBadgeProps> = ({ cor }) => {
  // Color map matches AHA/ASA recommendation-table convention used elsewhere
  // in NeuroWiki (e.g., EVT recommendation tables on TrialPageNew).
  let className =
    'inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ';

  const normalized = cor.toLowerCase().replace(/\s+/g, '');
  if (normalized === '1') {
    className += 'bg-emerald-50 text-emerald-700 border border-emerald-200';
  } else if (normalized === '2a') {
    className += 'bg-amber-50 text-amber-700 border border-amber-200';
  } else if (normalized === '2b') {
    className += 'bg-orange-50 text-orange-700 border border-orange-200';
  } else if (normalized.startsWith('3')) {
    className += 'bg-red-50 text-red-700 border border-red-200';
  } else {
    className += 'bg-slate-50 text-slate-600 border border-slate-200';
  }

  return <span className={className}>COR {cor}</span>;
};
