# Architect review — PR # (Stroke Code Refactor 2026-05-19)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: Opus 4.7)
**Date:** 2026-05-19

## Rationale

The plan is structurally sound and well-scoped. It converges Stroke Code onto the already-shipped `PathwayRailStep` primitive (rubric 1: duplication risk — strong pass, retires `CodeMode*` and `NihssCalculatorEmbed`), adopts the existing `PatientContextPanel`/`TimestampBubble` donors via their existing controlled-component APIs (rubric 3: composability — pass), and slices migration into three independently revertable commits (rubric 6: migration exit — pass for the commit shape, conditional on schema details below). The introduction of `StrokeCodeContext` is the right call given the cross-component sharing pattern (Stroke Code parent + embedded NIHSS modal + 5 rail steps), and React Context is the appropriate primitive — no new dependency, matches what `TrialModalContext` already does in this codebase (rubric 5: dependency weight — pass). The risk surface is concentrated in two places that need to be tightened before code: (a) the schema-vs-context mapping is asserted to be unchanged but is not demonstrated, and (b) the retirement of `CodeModeStep1/2/3/4` includes clinical-content surfaces that the plan promises to "lift verbatim" without a verification mechanism. Both are addressable in the plan itself, not blockers.

## Required follow-ups

1. **Boundary (Q1) — Context vs. alternative primitives.** Approve Context. Zustand would be over-tooling for state that only one provider tree consumes; a reducer is fine but adds boilerplate without benefit since the slices are independent. Add a one-line note in the plan stating the explicit decision and rationale so this doesn't become a future "third pattern" discussion. (rubric 1, soft)

2. **Embedded prop vs. composition split (Q2).** Approve the `embedded` prop. Extracting a `<NihssScoreGrid>` primitive is the theoretically cleaner shape, but the standalone NIHSS page and the embedded modal share 90%+ of the score-grid behavior including LVO tooltip, mode toggle, item warnings, auto-scroll, and pearls. A split creates two consumers that must stay in lockstep — a higher long-term maintenance cost than a single component with one boolean. The prop is the right call **provided** the conditional rendering is centralized (one `if (!embedded)` block per hidden region, not scattered). Add this constraint to the plan. (rubric 3)

3. **Session persistence schema (Q6) — BLOCKING-ADJACENT.** The plan asserts the schema (`step1Data`, `step2Data`, `step4Orders`, `milestones`, `eligibilityResult`) is unchanged. But Commit 1 collapses the state into a `StrokeCodeContext` that the plan describes with a different shape (`patientContext: PatientContextValues`, `nihss: {...}`, `strokeTimestamps`). These are not the same shape as `Step1Data` (which carries `lkwHours`, `nihssScore`, `systolicBP`, `diastolicBP`, `glucose`, `weightValue`, `weightUnit`, `bpControlled`, `eligibilityChecked`). The plan must specify *exactly* one of: (a) the provider serializes back to the legacy schema on write for forward-compat, (b) a one-way migration on load translates legacy → new, (c) the legacy schema is preserved verbatim inside the provider's persist function. Without this, Commit 1's "no user-visible change" claim is not enforceable and mid-session reloads during the rollout could lose state. Add an explicit serialization contract to the plan before code. (rubric 6)

4. **Clinical content verbatim-preservation (Q4, Q5).** "Lift content as section bodies" and "preserved verbatim" are not enforceable as written. Add to each commit's gate-pass criteria: a literal text-diff comparison (`git diff --word-diff` or equivalent script) of clinical strings between the retired component and the new rail-step body. The `data-claim` attributes and any `claim()` calls must follow the text 1:1. Route the clinical portions of Commits 2 and 3 to `clinical-reviewer` before merge — not just at PR time, but per-commit, since each retirement is its own clinical-surface change. Note: the plan's "clinical impact: none" is *only* true if this is enforced; otherwise this rises toward Class E. (rubric 2)

5. **PathwayBottomDrawer convergence (Q7).** Out of scope for this refactor. Stay with the current inline drawer. Convergence to `CalculatorDrawer` is a separate Class D that touches the same delicate clinical content surface and would muddy this PR's revert story. Add to "Out of scope" in the plan. (rubric 1, deferred)

6. **`embeddedAction` prop forethought (Q8).** A single `embedded` boolean with a hardcoded "Use this score" CTA is acceptable for the one consumer today. If a second embedder appears, refactor at that time — YAGNI applies. Add a TODO comment near the conditional, no plan change. (rubric 3)

7. **Class boundary (Q10).** Class D-clinical is correct **only if** follow-up #4 is enforced. If any clinical string text drifts during the lift, the commit becomes Class E and requires the full E gating (medical-scientist + pre-execution clinical-reviewer approval). State this trigger explicitly in the plan so the discipline is visible to reviewers.

8. **Failure mode I'd surface (Q9).** The 5-step train (Triage / Exam / Imaging / Decision / Orders) introduces a new step boundary that didn't exist before (4 steps → 5 steps). `activeStep` persistence on a mid-session reload after Commit 2 could land users on a step number that no longer maps to the same UI. Either: (a) bump the `SESSION_KEY` to invalidate old sessions on the Commit-2 deploy, or (b) add a migration shim that maps legacy step indices to the new train. Pick one and document in the plan.

## Blocking issues

None. Decision is approve-with-conditions; all follow-ups are addressable in the plan document before Commit 1 begins. Re-review not required if the follow-ups are folded into the plan — orchestrator confirms inline.
