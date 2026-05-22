# Architect review — PR (citation correction: aha-asa-2026-4.8 → 4.9)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-22

## Rationale

The rename is structurally clean and low-risk. The existing `aha-asa-2026-4.8` entry in `src/lib/citations/registry.ts` (lines 259–282) is explicitly registered for "Early DOAC initiation after cardioembolic ischemic stroke" with a placeholder `quoted_text` pending V's verbatim text — i.e., this entry was *always* the early-DOAC recommendation, only misnumbered. The plan therefore corrects metadata for an existing entry rather than introducing a parallel one, which is the right shape. Source-tree consumers of the ID are limited to `src/lib/citations/registry.ts` (definition site, lines 272–273), `src/lib/citations/claims.ts` (line 162, single mapping under claim `early-doac-af-stroke-recommendation`), and `src/pages/ElanPathway.tsx` (three prose references to "§4.8" on lines 472, 484, 558 — these are human-readable section labels, not ID references; grep for `aha-asa-2026-4.8` returns zero matches in `ElanPathway.tsx`). Five files touch the string `aha-asa-2026-4.8` overall, but three of those are docs/reviews and TASKS-tracking markdown that record historical state and should be left as-is (rewriting historical review artifacts would be a worse pattern than leaving stale IDs in audit trail prose). The schema (`Citation.section?: string`, single-valued) and the section-as-suffix-of-ID convention (`aha-asa-2026-<section>`) both assume one section per citation entry — this is fine for the rename but is a real constraint for the `<GuidelineSummaryCard>` Phase 1 effort (see Required follow-ups). State locality, dependency weight, composability, and migration cost are all green: no new deps, three-file diff well under the §6 D-class file-count threshold, revert is `git revert` clean.

## Rubric

1. **Duplication risk — pass.** The plan modifies the existing §4.8 entry's key/section/title rather than creating a parallel §4.9 entry. No third pattern introduced.
2. **Boundary integrity — pass.** Citation data stays in `src/lib/citations/`; the soft-label prose change stays in the UI file. No cross-boundary leak.
3. **Composability — concern.** The soft-label text in `ElanPathway.tsx` (lines 472 / 558) is duplicated across the result card and the accordion guideline box. The current plan updates both occurrences manually. If a `<GuidelineSummaryCard>` primitive is on the roadmap (it is, per the user's note), the rewrite would benefit from co-locating the citation lookup (`CITATION_REGISTRY['aha-asa-2026-4.9'].section + ' — COR/LOE ...'`) so the label string derives from registry data instead of being inlined twice. Not a blocker for the rename, but flag it so the duplication is not re-cemented.
4. **State locality — pass.** No state being moved.
5. **Dependency weight — pass.** No new dependency.
6. **Migration exit — pass.** Three files, reversible with `git revert`. Rollback note in the plan is implicit but adequate for this surface area (well under the §6 D-class "more than five files" threshold).

## Phase 1 schema observation — `<GuidelineSummaryCard>` multi-section references

The current `Citation` schema (src/lib/citations/schema.ts line 39) declares `section?: string` — singular, optional. The ID convention `aha-asa-2026-<section>` further bakes the one-section-per-citation assumption into the registry key. A summary card that cites "§4.9 + §4.8 + §4.7.2 together" has three structurally valid options under the current schema:

(a) **Compose at the claim level, not the citation level.** Add a new claim ID (e.g., `early-doac-af-summary`) whose `citation_ids: ['aha-asa-2026-4.9', 'aha-asa-2026-4.8-antiplatelet', 'aha-asa-2026-4.7.2']`. The existing `ClaimEntry.citation_ids: string[]` already supports many-to-many — this is the lowest-friction path and matches how the registry already composes multi-trial claims (e.g., `late-window-tnk-quick-claim` cites TRACE-III + TIMELESS + §4.6.3).
(b) **Widen `Citation.section` to `string | string[]`.** Allows one citation entry to span sections, but breaks the kebab-case ID-as-section-anchor convention and complicates UI rendering of section badges.
(c) **Introduce a `CitationGroup` aggregate.** Heaviest — new type, new registry, scanner support required.

**Recommendation:** option (a). The schema already supports it; no Phase 1 schema change is foreseeable for the `<GuidelineSummaryCard>` use case as described, provided summary-card consumers compose via a new claim ID rather than expecting a single citation to carry multiple `section` values. This should be recorded as an ADR before `<GuidelineSummaryCard>` lands.

## Required follow-ups

- **Verify with grep before commit.** Run `rg -F 'aha-asa-2026-4.8' src/` and confirm only the two expected consumers (`registry.ts`, `claims.ts`) are touched; `ElanPathway.tsx` should have zero ID-string hits and three prose `§4.8` hits to be rewritten to `§4.9`.
- **Decide on note 4.8-antiplatelet placeholder.** The previous §4.8 entry was titled "Early DOAC initiation" — i.e., the *real* §4.8 (Antiplatelet Treatment / DAPT-for-minor-stroke) has never been registered. If any current pearl or pathway claims DAPT thresholds from AHA/ASA 2026, those are currently *uncited*. Audit `src/data/strokeClinicalPearls.ts` and the DAPT pathway (if it exists) for the dangling reference before this PR merges; if found, file a separate Class E follow-up to register the real §4.8 entry.
- **Update the placeholder banner in the registry comment.** Lines 260–268 reference "evidence-verifier blocked on AHA/ASA 2026 §4.8" — this comment must be updated to reflect that V has now supplied the verbatim text and the citation has been re-keyed to §4.9, and the corresponding TASKS.md entry must be marked resolved/superseded so a future reviewer does not chase a phantom block.
- **Route the new `quoted_text`, COR/LOE assertion, and the §4.9-vs-§4.8 disambiguation to `clinical-reviewer` per §17.2.** Semantic correctness — does the verbatim quote actually live at page e68 §4.9, does COR 2a/LOE A match the guideline box, are ELAN/OPTIMAS/TIMING the cited trials — is not in scope for this review.
- **Tighten `ElanPathway.tsx` soft-label duplication when `<GuidelineSummaryCard>` lands.** Replace the inlined "AHA/ASA 2026 §4.9 — COR 2a, LOE A. …" string at lines 472 and 558 with a `<GuidelineSummaryCard citationId="aha-asa-2026-4.9" />` render that pulls `section`, `quoted_text`, and (future) `cor`/`loe` fields from the registry. Composability concern, not a blocker for the rename.
- **Pre-emptive ADR for `<GuidelineSummaryCard>` composition pattern.** Before Phase 1 implementation begins, write a brief ADR locking in option (a) above — multi-section summary cards compose via a new claim ID that lists multiple citation IDs, not via a widened `Citation.section` field. Prevents schema drift later.

## Blocking issues

None.
