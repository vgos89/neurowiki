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

  // Phase 3 rollout — 6 more questions (commit 2026-05-23). First multi-
  // citation card lands on minor-stroke-choice (§4.6.1 + §4.8). Skipped
  // questions that need §4.7.4 (Endovascular Techniques) data which the
  // structured mirror does not yet contain: aspiration-vs-stentriever,
  // evt-adjunct-pharmacotherapy. Those wait on a follow-up that populates
  // §4.7.4 in src/data/aha2026StrokeGuideline.ts first.
  'msu-dispatch': {
    claimId: 'msu-dispatch-guideline-summary',
  },
  'direct-vs-bridging': {
    claimId: 'direct-vs-bridging-guideline-summary',
  },
  'large-core-evt': {
    claimId: 'large-core-evt-guideline-summary',
  },
  'mevo-distal-evt': {
    claimId: 'mevo-distal-evt-guideline-summary',
  },
  'post-evt-bp-target': {
    claimId: 'post-evt-bp-target-guideline-summary',
  },
  'minor-stroke-choice': {
    claimId: 'minor-stroke-choice-guideline-summary',
  },
};

export function getGuidelineSummaryForQuestion(
  questionId: string,
): { claimId: string } | undefined {
  return GUIDELINE_SUMMARIES_BY_QUESTION[questionId];
}
