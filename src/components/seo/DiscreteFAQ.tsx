/**
 * DiscreteFAQ — single bottom-of-page accordion for SEO-friendly Q&A.
 *
 * Renders a closed-by-default `<details>` element with a flat list of Q&A
 * pairs inside. Each page that needs FAQPage rich-result eligibility passes
 * its FAQ data to this component AND to its JSON-LD schema (handled
 * separately in src/seo/schema.ts so the schema and the visible content
 * stay in sync — Google requires the FAQ content to be visible on page
 * load for FAQ rich results, which native `<details>` satisfies).
 *
 * Design — V approval 2026-05-21 (Option A from FAQ-pattern discussion):
 *   - Single accordion at the very bottom of the page
 *   - Closed by default — one line of subtle text + chevron
 *   - Opens to flat Q&A list (no nested accordions)
 *   - Standard mobile pattern, low visual weight
 *
 * Source: docs/audits/seo-analytics-audit-2026-05-21.md (Finding 8d + 8e);
 *   GA4 AI audit follow-up 2026-05-21 (E-E-A-T AI-overview optimization).
 *
 * Citation safety: this component surfaces existing clinical content. Each
 * call site passes Q&A authored from already-citation-tagged content; the
 * component itself adds no new clinical claims.
 */

import React from 'react';

export interface DiscreteFAQItem {
  /** The question text. Rendered inside the accordion as a strong header. */
  question: string;
  /** The answer text. May be multi-paragraph — pass as a single string with `\n\n` for paragraph breaks. */
  answer: string;
}

export interface DiscreteFAQProps {
  /** Heading shown on the accordion toggle (closed state). */
  label?: string;
  /** Ordered list of Q&A pairs. 3–6 items is the sweet spot for FAQ rich results. */
  items: DiscreteFAQItem[];
}

export const DiscreteFAQ: React.FC<DiscreteFAQProps> = ({
  label = 'Frequently asked questions',
  items,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <section
      aria-label={label}
      className="mt-8 mb-4 border-t border-slate-100 dark:border-slate-700/60 pt-4"
    >
      <details className="group">
        <summary
          className="flex items-center justify-between cursor-pointer list-none text-[13px] font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition-colors min-h-[44px] py-2 px-3 -mx-1 rounded-md bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500"
        >
          <span>{label}</span>
          <svg
            className="w-4 h-4 text-slate-400 transition-transform group-open:rotate-180"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </summary>

        <div className="mt-4 space-y-5">
          {items.map((item, idx) => (
            <div key={idx}>
              <h3 className="text-[13.5px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                {item.question}
              </h3>
              {item.answer.split('\n\n').map((para, pIdx) => (
                <p
                  key={pIdx}
                  className="text-[13.5px] text-slate-600 dark:text-slate-400 leading-[1.55] mb-1.5 last:mb-0"
                >
                  {para}
                </p>
              ))}
            </div>
          ))}
        </div>
      </details>
    </section>
  );
};

export default DiscreteFAQ;
