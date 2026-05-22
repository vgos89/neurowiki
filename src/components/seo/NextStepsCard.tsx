/**
 * NextStepsCard — contextual "where to go next" card for clinical decision pages.
 *
 * Surfaces 2–3 internal navigation links AFTER the user has interacted with
 * a decision tool, giving them a natural continuation path rather than exiting
 * the site. Placed above DiscreteFAQ so it reads as the primary CTA.
 *
 * Design tokens: design-tokens SKILL.md + CALCULATOR_SPEC.md v1.1.
 * Card surface one notch stronger than related-trials sidebar:
 *   bg-white + border border-slate-100 + rounded-xl p-5
 * Eyebrow: text-[10px] font-bold uppercase tracking-widest text-neuro-500
 *   (cobalt signals CTA, not decoration — contrast with text-slate-400 used for
 *   purely decorative section labels).
 * Touch targets: min-h-[48px] per item (one notch above the 44px floor per
 *   CALCULATOR_SPEC §2.4 — this is the primary action, deserves prominence).
 *
 * Usage: mount after the eligibility result / decision surface, before DiscreteFAQ.
 * Pass 2–3 items; beyond 3 dilutes the CTA signal.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/* ─── Types ──────────────────────────────────────────────────────── */

export interface NextStepsItem {
  /** Primary label. e.g. "Walk through the IV tPA protocol" */
  label: string;
  /** Optional one-line context shown below the label. */
  description?: string;
  /** Internal route. e.g. "/guide/iv-tpa" */
  to: string;
}

export interface NextStepsCardProps {
  /** Optional heading. Defaults to "Next steps". */
  heading?: string;
  /** 2–3 items. Beyond 3 dilutes the call-to-action signal. */
  items: NextStepsItem[];
}

/* ─── Component ─────────────────────────────────────────────────── */

export const NextStepsCard: React.FC<NextStepsCardProps> = ({
  heading = 'Next steps',
  items,
}) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="mt-6 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/60 rounded-xl p-5">
      {/* Eyebrow — cobalt signals CTA affordance, not decoration */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-neuro-500 dark:text-neuro-300">
        Next steps
      </p>

      {/* Heading */}
      <h2 className="text-[15px] font-semibold text-slate-900 dark:text-slate-100 mt-1.5 mb-3">
        {heading}
      </h2>

      {/* Item list — hairline dividers between items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center justify-between min-h-[48px] py-3 gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-2 rounded-sm"
          >
            {/* Text block */}
            <div className="flex-1 min-w-0">
              <span className="block text-[14px] font-semibold text-slate-900 dark:text-slate-100 group-hover:text-neuro-600 dark:group-hover:text-neuro-300 transition-colors">
                {item.label}
              </span>
              {item.description && (
                <span className="block text-[12px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {item.description}
                </span>
              )}
            </div>

            {/* Right chevron */}
            <svg
              className="w-4 h-4 flex-shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-neuro-500 dark:group-hover:text-neuro-400 transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NextStepsCard;
