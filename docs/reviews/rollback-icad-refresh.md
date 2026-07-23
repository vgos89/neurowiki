# Rollback note — ICAD trial refresh (Phase 1)

**Class:** E · **Date:** 2026-07-22 · **Clinical impact:** low (additive trial content + one citation correction + one synthesis rewrite; no calculator or algorithm threshold changed)

## What shipped
- Two new trial cards: `cassiss-trial` (CASSISS 2022, archetype A, NEUTRAL/not-met), `basis-trial` (BASIS 2024, archetype A, POSITIVE/met).
- `icas-stenting` question: trialCount 2 → 4, trialIds add cassiss + basis, meta updated.
- `icas-stenting` clinical synthesis rewritten to incorporate BASIS 2024 (bottom-line shift), plus WOVEN and Gutierrez 2022 as cited context.
- Citations: `gao-cassiss-2022` corrected (PMID 35943471 → 35943472, url, quoted_text); added `sun-basis-2024`, `alexander-woven-2021`, `gutierrez-icas-review-2022`.
- Claims: `icas-stenting-synthesis` +3 citations; new `cassiss-primary-result`, `basis-primary-result` on the bedside-pearl surface.

## Rollback trigger
Any of: a clinician-facing factual error in a rendered CASSISS/BASIS card or the synthesis; a broken `/trials/cassiss-trial` or `/trials/basis-trial` route; the `icas-stenting` question page failing to render; a claims/humanizer/card-meta gate regression discovered post-merge.

## Rollback procedure
1. `git revert <merge-commit>` and push. The change is a single additive commit with no schema migration and no shared-abstraction edit, so the revert is clean: the two cards drop out of the catalog and the question rail, the synthesis reverts to its CASSISS-era text, the CASSISS citation reverts to its (incorrect) prior PMID, and the three added citations/two added claims disappear.
2. If only one card is faulty, prefer a targeted follow-up fix over a full revert: remove that trial's ID from `icas-stenting` trialIds (decrement trialCount), its record from trialData.ts, its trialCatalogMeta / trialListData / claims entries, then `npm run generate:card-meta` and re-run gates.
3. Regenerate `trialListData.cardmeta.generated.ts` after any revert or targeted removal (`npm run generate:card-meta`) so the drift guard stays green.
4. No feature flag is involved (data-layer change). No database migration to reverse.

## Re-enable gate
Per §14: `clinical-reviewer` + `system-architect` sign-off before the change re-enters.

## Note on the CASSISS citation correction
The `gao-cassiss-2022` PMID fix (35943471 → 35943472) corrects a reference that previously resolved to a different trial (RESCUE BT, tirofiban). A full revert would reintroduce that error. If reverting for an unrelated reason, re-apply the PMID correction as a standalone fix.
