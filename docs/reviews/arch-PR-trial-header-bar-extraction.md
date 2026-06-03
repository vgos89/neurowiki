# Architect review — PR #trial-header-bar-extraction

**Decision:** approve-with-conditions
**Reviewed:** plan + touched file
**Reviewer:** system-architect (model: claude opus 4)
**Date:** 2026-06-03

## Rationale

`src/pages/trials/TrialPageNew.tsx` (11,012 lines) repeats a sticky header bar (back button + category badge) ~105 times — one per archetype branch — plus a title `<h1>` 107 times (uniform `title: subtitle` body in 66, four color-tone variants). This is the textbook duplication the composability rule exists to remove: extraction collapses a repeated pattern rather than adding a third way to do the same thing. `src/components/trials/` already holds presentational siblings, so `TrialHeaderBar` fits the established convention with no parallel infrastructure. Boundary integrity holds — the components take primitive props; the per-trial abbreviation literal and the `categoryBadgeLabel` derivation stay at the call site, so no clinical text is hoisted. The only real risk is mechanical, not architectural: 105 call-site edits in one file, where a single bad edit silently changes a clinical page's render. Mitigated by batching, a render snapshot test, and byte-identical HTML diffing on representatives. Phase 2 (title `<h1>` extraction) is deferred to its own PR because mixing 66 title swaps with 105 header swaps muddies byte-diff verification and the clinical-review surface.

## Required follow-ups (conditions — all must hold)

1. Target the full `sticky top-0 z-40` header JSX block, not bare `handleBack`; exclude the non-header `handleBack` call sites (~lines 399, 458) which use a different layout.
2. Phase 1 (TrialHeaderBar) only in this PR. Phase 2 (TrialTitleHeading, tone prop) deferred to a separate PR with the 41 variant titles explicitly enumerated.
3. Component at `src/components/trials/TrialHeaderBar.tsx`; props `{ abbreviation; categoryBadgeLabel; onBack }`. Do NOT lift the `categoryBadgeLabel` derivation — leave it at each branch to keep the diff mechanical.
4. Land in batches of ~30 sites; gates pass per batch. Add a render snapshot test over sampled trial IDs (one per title-color variant) before batch 1; byte-diff rendered HTML on 2–3 representatives pre/post.
5. Rollback note in PR body (single-file `git revert`) — required for Class D.
6. Clinical-reviewer gate before merge: confirm no `trialMetadata`-derived text changed (structural pass does not clear the clinical gate).

## Blocking issues

None. Conditions above are non-blocking but mandatory for the implementation PR.
