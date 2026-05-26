# Architect review — Headache adaptive interview (no PR #)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-26

## Rationale
The plan is structurally sound and respects the boundary established in the prior architect review: the engine (`clinicHeadacheData.ts` + `evaluateHeadachePhenotypes`) stays unchanged, the interaction surface is rewritten on top of it. Decision tree as pure data + helpers in `src/data/` is the right call — it mirrors the existing pattern (data module pure, page consumes), it's table-testable, and the rollback story is clean (revert one commit; the new files are orphaned but inert).

Two real issues. **First and most important:** the plan proposes consuming `CalculatorDrawer` directly from `src/components/calculators/`, but `src/components/pathways/PathwayBottomDrawer.tsx` already exists as the canonical pathway wrapper around `CalculatorDrawer` (header comment: "Composes (does not fork) the calculator drawer pattern… Migration order: EVT → ExtendedIVT → ELAN → SE → Migraine"). Importing `CalculatorDrawer` directly from a pathway would be the third way to do the same thing and bypass an existing abstraction designed for exactly this case. This is a duplication-risk block until resolved — but resolvable cheaply by routing through (or extending) `PathwayBottomDrawer` instead. The plan's own reuse-question #2 raises this concern; the answer is already in the tree, the plan just hadn't found it.

**Second:** the current page (500 LOC) carries a large `Management options` JSX block with seven claim-tagged data-claim divs (preventive threshold, CGRP escalation, TTH acute, TTH preventive, MOH gepant, cluster protocol, hemicrania protocol) plus hidden scanner anchors for ICHD-3 criteria claims. The plan says these "stay" but the rewrite to a state machine surfacing State C as a single phenotype's decision card means the static management block either (a) gets retired entirely — which orphans 7 registered claim IDs and loses content, or (b) moves into the drawer's State C content, in which case the plan must say which claim tag travels with which phenotype. Without that mapping, the rewrite risks dropping claim tags below the scanner's view and the pre-commit hook will fail or, worse, the content silently disappears.

Everything else is acceptable. State machine in the page (vs extracting to a hook for v1) is fine — composability is preserved by keeping `QuestionScreen` and `DifferentialBar` generic in `src/components/pathways/`. Power-user modal sheet is a reasonable v1. Keeping prompts neutral and claims on the answer-selected chips is the correct call.

## Rubric scores

1. **Duplication risk — block.** `PathwayBottomDrawer` exists and is the canonical pathway-side abstraction over `CalculatorDrawer`. Importing `CalculatorDrawer` directly from a pathway creates a parallel pattern. Resolve before execution.
2. **Boundary integrity — pass.** Engine stays in `src/data/`, evaluator stays pure, UI primitives in `src/components/pathways/`, page wires state. Question tree is pure data — same boundary discipline as `clinicHeadacheData.ts`.
3. **Composability — pass.** `QuestionScreen` and `DifferentialBar` are typed generically and live in `src/components/pathways/`. Future vertigo/AMS/weakness pathways can consume both. The prior architect ruling ("engine specific, UI primitives generic") is honored.
4. **State locality — pass.** `FlowState` lives in the page where it is consumed; chip set lives there too. Not over-hoisted. Selected chips are still the single source of truth for the evaluator.
5. **Dependency weight — pass.** No new external packages. All primitives reuse existing in-tree code.
6. **Migration exit — concern.** Touches ≥5 files (page rewrite + 2 new components + 1 new data module + 1 new test file + claims.ts verification). Rollback plan is stated and is genuinely clean (single-commit revert; new files orphaned but inert). Concern, not block, because the rollback is genuinely trivial — but only if the management-block claim coverage doesn't silently regress before revert (see Required follow-ups).

## Required follow-ups

1. **Reuse `PathwayBottomDrawer`, not `CalculatorDrawer` directly.** Read `src/components/pathways/PathwayBottomDrawer.tsx` and `docs/reviews/arch-pathway-elan-and-ext-ivt-2026-05-22.md`. Decide one of:
   a. Use `PathwayBottomDrawer` as-is, mapping each FlowState to its props (`tier`, `tierLabel`, `action`, `reasons`, `notes`, `expandedSummary`). This is the cheapest path.
   b. If `PathwayBottomDrawer`'s API can't express State A "answer the first question" plus State B with a `DifferentialBar`, extend `PathwayBottomDrawer` (add a `customContent` slot or a `differentialBar` prop) rather than bypassing it. Architectural cost: small. Architectural gain: every pathway page continues to share one drawer abstraction.
   c. Only if both (a) and (b) are genuinely infeasible, lift `PathwayBottomDrawer` + `CalculatorDrawer` shared shell to `src/components/shared/InterpretationDrawer.tsx` and migrate both consumers. This is a separate D-class refactor, not in scope here. If the plan reaches this option, park the headache redesign and do the extraction first.

2. **Claim-tag mapping for the management content must be explicit before execution.** The current page carries seven `data-claim` divs and six hidden scanner anchors. Produce a one-screen mapping:
   - For each existing `data-claim` ID: does it (i) move into the new phenotype's State C decision card, (ii) move into a new "Management" subsection within State C, (iii) retire — and if retire, is the claim registry entry removed in the same commit?
   - For each hidden ICHD-3 scanner anchor: does the rewrite still surface the claim ID visibly via the new components (`QuestionScreen` teach-mode expander seems like the right home for ICHD-3 reasoning), or does the hidden anchor block stay?
   - Pre-commit hook MUST pass after the rewrite. If any registered claim ID has no consumer in the new tree, retire it from `claims.ts` in the same commit.

3. **Route clinical portions to clinical-reviewer.** Per failure-modes guidance: the plan's reuse question #5 (prompts as claim surfaces) is a clinical-reviewer call, not an architect call. Architect's view: keeping prompts neutral and claim-tagging the answer-selected chips is consistent with how the codebase handles other interview-style surfaces. Final call belongs to clinical-reviewer.

4. **State-machine testing.** Plan's question #6 — defer state-machine integration tests to a follow-on Playwright/RTL pass is acceptable for v1, IF the table-driven tree-walk tests in `clinicHeadacheQuestions.test.ts` cover at least: (i) every terminal branch, (ii) red-flag short-circuit at every question that can pivot to `workup`, (iii) chip accumulation across the longest walk. State this explicitly in the test plan.

5. **Power-user exit accessibility.** Modal sheet must use the existing focus-trap pattern (check `src/components/ui/` for current implementation — if none exists, this becomes a `-clinical` blocker because the power-user exit otherwise routes around the interview and accessibility-specialist needs to sign off).

6. **Page LOC target.** Plan estimates ~350-450 LOC. If the rewrite lands above 500, that's a signal the state machine should be extracted to `src/hooks/useHeadacheInterview.ts`. Not a v1 requirement, but flag if hit.

## Blocking issues

**Issue 1 — Duplicate drawer pattern.** `src/components/pathways/PathwayBottomDrawer.tsx` already exists and is the documented composition wrapper around `CalculatorDrawer` for exactly this kind of consumer. Plan must adopt it (or extend it) before execution begins.

Resolution path: update the plan to import `PathwayBottomDrawer` instead of `CalculatorDrawer`. If `PathwayBottomDrawer`'s current API (`tier`, `tierLabel`, `action`, `reasons`, `notes`, `expandedSummary`, `collapsedLabel`) cannot express the three FlowStates (intro / question-with-differential-bar / result-or-workup), present a minimal API extension to architect for sign-off before writing the new page. Either resolution unblocks; raw direct-import of `CalculatorDrawer` does not.
