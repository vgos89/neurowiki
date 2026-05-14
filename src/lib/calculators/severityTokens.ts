/**
 * Shared severity-token interface and constants for calculator drawers.
 * Extracted in L5.6 Phase 2 from 9 inline duplicates (each calculator
 * carried its own typed SEVERITY_TOKENS map). The interface lives here;
 * each calculator keeps its own severity-union and corresponding map
 * locally because severity vocabularies vary by calculator
 * (3 levels in ABCD², 4 in ASPECTS, 5 in Boston, etc.).
 *
 * See ADR-008 trade-off #1.
 */

/**
 * Visual tokens for a drawer in State C (complete). One severity level
 * maps to one token bundle. The shape is the same across all calculators
 * even though the keys differ.
 */
export interface SeverityTokens {
  borderColor: string;
  headerBg: string;
  headerHover: string;
  labelClass: string;
  statClass: string;
  chevronClass: string;
}

/** Drawer shadow constants — identical across all 9 calculators. */
export const DRAWER_COLLAPSED_SHADOW = '0 -2px 12px rgba(15,23,42,0.08)';
export const DRAWER_EXPANDED_SHADOW = '0 -4px 24px rgba(15,23,42,0.12)';

/**
 * Inline severity color for the header severity badge.
 * Returns a Tailwind text-color utility based on a coarse severity scheme.
 * Calculators with non-standard severity vocabularies should compute this
 * inline; this util covers the common low/moderate/high case.
 */
export type CoarseSeverity = 'low' | 'moderate' | 'high' | 'very-high';

export function getInlineSeverityColor(severity: CoarseSeverity): string {
  switch (severity) {
    case 'low': return 'text-emerald-700';
    case 'moderate': return 'text-amber-700';
    case 'high':
    case 'very-high':
      return 'text-red-600';
  }
}
