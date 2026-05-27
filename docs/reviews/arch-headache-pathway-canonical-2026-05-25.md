# Architect review — Clinic Headache Pathway canonical rebuild (2026-05-25)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (PATHWAY_SPEC.md v1.5, ClinicHeadachePathway.tsx, PathwayBottomDrawer.tsx, EvtPathway.tsx, src/components/pathways/*)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-25

## Rationale
The plan is structurally sound and is the right corrective move after two rejected attempts. It grounds the rebuild in PATHWAY_SPEC.md v1.5 (the documented blueprint) rather than inventing a third bespoke UX shape, retires three orphaned UI primitives (QuestionScreen, DifferentialBar, PhenotypePickerSheet) that exist only because the previous attempt expanded the drawer API to host them, and reverts that drawer API expansion (commit 3bf411f added `state`, `customContent`, `stateBText` to PathwayBottomDrawer — those props are headache-only scope creep). What's right: the plan respects existing module boundaries (UI primitives stay in `src/components/pathways/`, clinical data stays in `src/data/`, drawer chrome stays in `CalculatorDrawer` via the thin wrapper), and the cascade-clear/branch-chip/category-row pattern it adopts is the same one EvtPathway already uses. What's risky: one of the questions reflects a missed pre-existing primitive (`PathwayCategoryRow.tsx` already exists and is consumed by EVT — there is nothing to "factor"), and the claim-ID count is off by three. These are easily fixed conditions, not blockers. The call is approve-with-conditions; the structural shape of the plan is correct.

## Required follow-ups

1. **PathwayCategoryRow already exists.** Q2 in the plan asks whether to "factor a shared CategoryRow primitive." It is already factored at `src/components/pathways/PathwayCategoryRow.tsx` and consumed by `src/pages/EvtPathway.tsx` (line 13 import). The plan should consume the existing primitive verbatim, not introduce a new one. If the existing primitive is missing capabilities headache needs, the plan should enumerate the gaps and extend the existing component — not fork. This converts Q2 from an open question into a constraint: "reuse `PathwayCategoryRow` as-is; document any extension in the same PR."

2. **Inventory the existing pathway primitives before re-authoring.** `src/components/pathways/` already contains `PathwayRail.tsx`, `PathwayBranchChip.tsx`, `PathwayCascadeNotice.tsx`, `PathwayLearningPearl.tsx`, `PathwayHeader.tsx`, `PathwayCategoryRow.tsx`, and `PathwayCocktailSummary.tsx`. EVT consumes most of them. The headache rebuild must consume the same set; the plan should add a one-line "primitives consumed" inventory to the implementation brief so we don't accidentally re-author any of them.

3. **Claim ID count is off.** The plan states "11 registered claim IDs" — actual count via `data-claim=` in the current file is 14: `clinic-headache-pitfall-mig-vs-tth`, plus per-phenotype `ichd3-{migraine,tension,cluster,hemicrania,ndph}-criteria` (5), plus the management blocks `moh-gepant-safe`, `preventive-threshold`, `cgrp-escalation`, `tension-acute-management`, `tension-preventive`, `cluster-acute-management`, `cluster-preventive`, `hc-indomethacin-protocol` (8). Fix the count in the preservation map; route the corrected list to `clinical-reviewer` for the §17.2 artifact.

4. **Claim preservation map must be authored before code lands, not after.** The plan correctly identifies that 14 data-claim attributes must surface in the new layout (category-row accordions and/or drawer State C). The preservation map — one line per claim ID stating which JSX node in the new file carries the literal `data-claim=` attribute — should be a written artifact reviewed by `clinical-reviewer` before implementation. The static scanner (`scripts/check-claims.ts`) checks presence, not semantics; clinical-reviewer is the gate that confirms the claim still surfaces in a clinically appropriate context.

5. **Route clinical portions of this plan to clinical-reviewer before execution.** This is Class D-clinical. The shape of the rebuild does not change clinical thresholds, but the relocation of claim surfaces (e.g., moving the MOH gepant text from the migraine block to a category-row accordion) is a semantic move clinical-reviewer must approve. The clinical-reviewer artifact at `docs/reviews/clinical-PR<#>-headache-pathway-canonical.md` is required before merge per §16.

6. **Answer to plan Q1 — adopt PATHWAY_SPEC v1.5 fully.** Concur with the plan's instinct. The spec is the source of truth (CLAUDE.md §3 hierarchy: spec > task notes); building headache to a known-out-of-compliance shipping shape would lock in tech debt the EVT rebuild will then have to undo. Headache becoming the first v1.5-compliant pathway is the correct outcome.

7. **Answer to plan Q3 — drawer API revert is safe.** Confirmed via Grep: no file outside `ClinicHeadachePathway.tsx` consumes the `state`, `customContent`, or `stateBText` props on `PathwayBottomDrawer`. The revert is clean. Verify with a final grep before commit; if any consumer surfaces, escalate.

8. **Answer to plan Q4 — delete the decision tree in the same commit.** Concur. `src/data/clinicHeadacheQuestions.ts` becomes unreachable from page consumption. Orphan data files are a known duplication-risk vector (rubric item 1). If a future flow needs a decision tree, it should be authored fresh against then-current requirements rather than resurrected from a rejected design. Tests for the module should be deleted alongside the module; otherwise the test file references a non-existent import.

9. **Migration exit / rollback note.** Plan touches >5 files (page rewrite + drawer revert + delete 4 primitives + delete data module + delete tests + author mockups + rewrite spec doc) and modifies a shared abstraction (`PathwayBottomDrawer`). Rollback plan required in PR body per §16: state explicitly that revert is `git revert` of the merge commit, that there is no schema migration, and that the previous (adaptive interview) shape is preserved in git history at commit a8117aa for reference only — not as a rollback target, since V has rejected it.

10. **Mockup-before-code ordering.** The plan lists 6 mockup frames as item 5. These must ship and be V-approved before the page rewrite begins, not in parallel. The two prior failures were UX-shape failures; the mockups are the V-side gate that catches a third one before code is written. Sequence: mockups → V approval → spec doc rewrite → V approval → page rewrite.

## Blocking issues
None. The plan's structural shape is correct; the conditions above are corrective, not load-bearing.

## Rubric scoring

| # | Item | Score | Note |
|---|---|---|---|
| 1 | Duplication risk | concern | Q2 missed that `PathwayCategoryRow` already exists. Conditions 1–2 resolve. |
| 2 | Boundary integrity | pass | Plan keeps UI in components/, data in data/, drawer chrome in CalculatorDrawer. Reverts the prior boundary-bleed (drawer hosting question-screen UI). |
| 3 | Composability | pass | Reuses 7 existing pathway primitives. Headache becomes the second consumer of `PathwayCategoryRow`, validating the abstraction. |
| 4 | State locality | pass | State machine collapses from `FlowState` + `pendingAnswers` + `history` + `selectedChips` (4 stores) to the per-step category-row pattern EVT uses. |
| 5 | Dependency weight | pass | No new packages. Removes runtime references to 3 components. |
| 6 | Migration exit | concern | >5 files + shared abstraction modified. Condition 9 (rollback note) resolves. |
