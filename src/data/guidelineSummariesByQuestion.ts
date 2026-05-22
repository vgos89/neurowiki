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
  // Phase 1A pilot
  anticoagulation: {
    claimId: 'anticoagulation-guideline-summary',
  },

  // Phase 2 candidates (NOT yet wired). When authoring Phase 2, add a
  // claim entry to claims.ts first, then add the question → claim mapping
  // here. Candidate questions and the AHA/ASA 2026 sections they map to:
  //
  //   tpa-timing                  → §4.6.1 (thrombolysis decision-making)
  //   tnk-vs-alteplase            → §4.6.2 (thrombolytic agent choice)
  //   late-window-selection       → §4.6.3 (extended-window IVT)
  //   lvo-evt                     → §4.7.2 (anterior-circulation EVT)
  //   basilar-evt                 → §4.7.3 (posterior-circulation EVT)
  //   dapt                        → §4.8   (DAPT for minor noncardioembolic AIS)
  //   bp-control                  → §4.3   (BP management)
};

export function getGuidelineSummaryForQuestion(
  questionId: string,
): { claimId: string } | undefined {
  return GUIDELINE_SUMMARIES_BY_QUESTION[questionId];
}
