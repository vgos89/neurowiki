/**
 * Maps trial-question slug → GuidelineSummaryCard claim ID.
 *
 * Per ADR-2026-05-22-guideline-summary-card-composition.md:
 *   - Each entry's claim resolves via CLAIM_REGISTRY → one or more
 *     CITATION_REGISTRY entries (one per AHA/ASA 2026 section the card cites).
 *   - Questions with NO guideline match are simply absent from this map —
 *     the card renders nothing, the existing "Curated answer in progress"
 *     banner remains.
 *
 * Phase 1A (this commit): pilot with one question — `anticoagulation`.
 * Validates the rendering layer in the single-citation case.
 *
 * Phase 2 (next): expand to 5–8 high-traffic questions, including one
 * multi-citation card to validate that path.
 *
 * Phase 3+ (rolling): remaining 9–11 questions.
 */

export const GUIDELINE_SUMMARIES_BY_QUESTION: Record<string, { claimId: string }> = {
  // Phase 1A pilot (commit 00199fb)
  anticoagulation: {
    claimId: 'anticoagulation-guideline-summary',
  },

  // Phase 2 rollout — 7 questions mapped to the AHA/ASA 2026 section that
  // directly answers them (commit 2026-05-23).
  'tpa-timing': {
    claimId: 'tpa-timing-guideline-summary',
  },
  'tnk-vs-alteplase': {
    claimId: 'tnk-vs-alteplase-guideline-summary',
  },
  'late-window-selection': {
    claimId: 'late-window-selection-guideline-summary',
  },
  'lvo-evt': {
    claimId: 'lvo-evt-guideline-summary',
  },
  'basilar-evt': {
    claimId: 'basilar-evt-guideline-summary',
  },
  dapt: {
    claimId: 'dapt-guideline-summary',
  },
  'bp-control': {
    claimId: 'bp-control-guideline-summary',
  },
};

export function getGuidelineSummaryForQuestion(
  questionId: string,
): { claimId: string } | undefined {
  return GUIDELINE_SUMMARIES_BY_QUESTION[questionId];
}
