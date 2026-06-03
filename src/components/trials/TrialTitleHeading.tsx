import React from 'react';

/**
 * TrialTitleHeading — the page-level <h1> shared by every trial archetype page.
 *
 * Extracted from 105 byte-identical copies inlined across TrialPageNew.tsx
 * (Class D-clinical refactor, Phase 2 of arch-PR-trial-header-bar-extraction.md).
 * It is purely presentational: the trial title and subtitle (both flowing from
 * `trialMetadata`) and the resolved heading color are passed in. The body is
 * always `{title}: {subtitle}`.
 *
 * Tone is passed as the resolved `color` string rather than a tone enum, so the
 * per-branch `isPositive` / `isHarm` derivation stays at the call site (the same
 * principle that kept `categoryBadgeLabel` un-lifted in Phase 1). The four colors
 * observed across the 105 call sites are:
 *   - '#1746A2' (cobalt — default)                       79×
 *   - isPositive ? '#1746A2' : '#1e293b'                 12×
 *   - '#1e293b' (ink)                                    11×
 *   - isHarm ? '#7f1d1d' : '#1e293b'                      3×
 *
 * Markup is reproduced verbatim from the inlined original so rendered output is
 * byte-identical; do not restyle here without a design pass. No clinical text
 * lives here — title/subtitle strings stay at the call site.
 */
interface TrialTitleHeadingProps {
  /** Trial title, e.g. trialMetadata.title. */
  title: string;
  /** Trial subtitle, e.g. trialMetadata.subtitle. Rendered after "title: ". */
  subtitle: string;
  /** Resolved heading color. Derivation (isPositive/isHarm ternaries) stays at the call site. */
  color: string;
}

export function TrialTitleHeading({ title, subtitle, color }: TrialTitleHeadingProps) {
  return (
    <h1 className="text-[19px] sm:text-[22px] font-medium tracking-[-0.01em] leading-[1.3]" style={{ color }}>
      {title}: {subtitle}
    </h1>
  );
}
