import React from 'react';

/**
 * TrialTitleHeading — the page-level <h1> shared by every trial archetype page.
 *
 * Extracted from 105 byte-identical copies inlined across TrialPageNew.tsx
 * (Class D-clinical refactor, Phase 2 of arch-PR-trial-header-bar-extraction.md).
 * It is purely presentational: the trial title and subtitle (both flowing from
 * `trialMetadata`) and the heading tone are passed in. The body is always
 * `{title}: {subtitle}`.
 *
 * Tone, not raw color. The component owns its color vocabulary — callers pass a
 * semantic `tone` and the component resolves it to the heading color. This is the
 * Phase-2 follow-up (arch-PR-trial-title-heading-extraction.md condition #6):
 * the four colors that were re-typed at every call site now live here once.
 *
 *   - positive → '#1746A2' (cobalt) — landmark / positive-result emphasis    79×
 *   - neutral  → '#1e293b' (ink)    — neutral / no-emphasis (default)        11×
 *   - isPositive ? positive : neutral                                        12×
 *   - isHarm    ? harm     : neutral                                          3×
 *
 * The per-branch `isPositive` / `isHarm` derivation stays at the call site (the
 * same principle that kept `categoryBadgeLabel` un-lifted in Phase 1) — only the
 * tone→color mapping is centralized here.
 *
 * Markup is reproduced verbatim from the inlined original and each tone resolves
 * to the exact hex previously passed inline, so rendered output is byte-identical;
 * do not restyle here without a design pass. No clinical text lives here —
 * title/subtitle strings stay at the call site.
 */
export type TrialTitleTone = 'positive' | 'neutral' | 'harm';

const TONE_COLORS: Record<TrialTitleTone, string> = {
  positive: '#1746A2', // cobalt — landmark / positive-result emphasis
  neutral: '#1e293b', // ink — neutral / no-emphasis (default)
  harm: '#7f1d1d', // maroon — harm signal
};

interface TrialTitleHeadingProps {
  /** Trial title, e.g. trialMetadata.title. */
  title: string;
  /** Trial subtitle, e.g. trialMetadata.subtitle. Rendered after "title: ". */
  subtitle: string;
  /** Semantic heading tone. Derivation (isPositive/isHarm ternaries) stays at the call site. */
  tone: TrialTitleTone;
}

export function TrialTitleHeading({ title, subtitle, tone }: TrialTitleHeadingProps) {
  return (
    <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color: TONE_COLORS[tone] }}>
      {title}: {subtitle}
    </h1>
  );
}
