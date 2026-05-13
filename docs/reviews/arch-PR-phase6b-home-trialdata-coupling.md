# Architect review — Phase 6B: Break trialData home-route coupling

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-12

## Rationale
The structural intent is sound: `trialListData.ts` is the unique cross-cutting module that touches both the home bundle (via `scenarios.ts` → `findTrialById` and `useTrending` → `trials`) and every trial surface, and its eager `import { TRIAL_DATA } from './trialData'` is the only thing dragging the 9,781-line trial corpus into the index chunk. Removing the two `legend: TRIAL_DATA[id]?.legend` lines breaks the coupling exactly at the right seam, and the existing `legend?.finding ?? description ?? name` fallback chain in `scenarios.ts:182` and `TrendingTrials.tsx:42` was written for this scenario — those surfaces degrade gracefully by design. However, the original plan's consumer inventory was incomplete: it listed `TrialsPage.tsx` and `TrialLegendCard.tsx` but missed **`src/pages/QuestionDetailPage.tsx`**, which resolves trials via `findTrialById` (line 109) and renders `TrialLegendCard` (line 191). Under the fix, `bottomLineTag` and `keyStat` chips on the question-detail surface would silently disappear without the same enrichment patch applied there. The implementation corrects this by adding the `TRIAL_DATA` enrichment to all three lazy consumers. Boundary integrity, state locality, and migration exit are all clean — no new dependencies, revert is two/three files, no clinical data is rewritten.

## Required follow-ups
- **Verify after build** that no other module reaches `trialListData.trials[*].legend` — run a post-change `grep -rn "\.legend" src/` to catch any consumer the inventory missed.
- **Acknowledge the home-page content drop in the PR body**: `TrendingTrials` and scenario cards on the home page will lose curated `legend.finding` copy and fall back to `description`. Not a regression in the fallback-chain sense, but a content quality change — state the trade-off explicitly so future readers understand `legend` was always undefined on these home surfaces after this commit.
- **Consider extracting a `findEnrichedTrialById()` / `getEnrichedTrials()` helper** in a new module (e.g. `src/data/trialListData.enriched.ts`) instead of inlining `trials.map(...)` in each page. Acceptable to defer to a follow-up Class C — flag in TASKS.md to prevent a third pattern by accretion.
- **Rollback note**: `git revert` of 3 files; no data migration.

## Blocking issues
None — conditions above are correctness verifications and forward work, not blockers for this commit.
