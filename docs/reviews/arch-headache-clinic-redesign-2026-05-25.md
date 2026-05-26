# Architect review — Headache Clinic Pathway redesign

**Decision:** approve-with-conditions
**Reviewed:** plan only
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-25

## Rationale

The plan's instinct is sound: the current `ClinicHeadachePathway.tsx` is a 1,332-line monolith where ICHD-3 criteria, scoring thresholds, drug cards, JSX, and clinical copy are all interleaved inside one component. Extracting structured data into `src/data/clinicHeadacheData.ts` and a pure `evaluatePhenotypes()` engine is the right boundary move (rubric 2 and 4 pass cleanly), and matches existing precedent in the trials / calculators layers where structured data lives in `src/data/` and components consume it. Pure-function mapper over a hook is also correct — testability is much higher and there is no need for component-tree reactivity beyond what `useMemo` over `selectedChips` already gives you.

The risk is on rubric 1 (duplication) and rubric 3 (composability). The plan proposes four new primitives (`ChipGroup`, `MapperPanel`, `LearnPearl`, `PitfallNotice`) in `src/components/pathways/` but does not state whether they are diagnostic-pathway primitives or headache-only components. `src/components/pathways/` already contains 11 shared primitives (`PathwayRail`, `PathwayBranchChip`, `PathwayLearningPearl`, `PathwayCascadeNotice`, `PathwayCategoryRow`, etc.) and the directory's prior convention is generic primitives consumed by multiple pathways (`MigrainePathway`, `EvtPathway`, `ElanPathway`, etc.). Two specific duplication concerns:

1. **`LearnPearl` vs `PathwayLearningPearl`.** `src/components/pathways/PathwayLearningPearl.tsx` already exists, is used inline in `ClinicHeadachePathway.tsx` (lines 561–567, 944–952) and `MigrainePathway.tsx`, and has a `visible` prop that gates display. The plan's `LearnPearl` ("collapsible card visible only when Teach mode on") looks like a wrapper over the same idea with a different gate. Adding a second pearl primitive without retiring or extending the first is the canonical duplication-risk pattern in rubric 1. Either extend `PathwayLearningPearl` with a `teachOnly?: boolean` prop wired to a Teach-mode context, or rename the new component and explicitly state that `PathwayLearningPearl` is being retired.

2. **`PitfallNotice` vs `PathwayCascadeNotice`.** These are different roles (overlap warning vs cascade-clear notice), but the visual / accessibility shape (role="status", aria-live, slate pill, dismiss action) is identical. Worth confirming `PitfallNotice` is a distinct semantic surface, not a re-skin.

The plan also references "Teach mode in localStorage with stroke-code precedent." I searched `src/components/article/stroke/**` and `src/pages/guide/StrokeBasics*.tsx` and found **no existing Teach-mode toggle, no `nw:teach-mode` localStorage key, and no `Teach` component anywhere in the stroke surfaces**. The only "teach"-adjacent code is `TeachingWell.tsx` in trials, which is a static collapsible component without a persistence layer. The stated precedent does not exist. Either (a) the plan is referring to a precedent that has not landed yet, (b) the precedent lives somewhere I didn't find, or (c) it is a misremembered detail. Resolve this before execution — the design of the Teach-mode toggle (context vs hook vs prop-drilling) should follow precedent if one exists, or set precedent deliberately if not.

On rubric 6 (migration exit): the plan touches 7 files including a major refactor of a 1,332-line page, introduces a new module of 400–600 LOC of structured clinical data, and adds 15–20 new claim IDs. This is a high-cost revert. The plan contains no rollback note. Per §6 / §16, Class D-clinical requires a rollback plan in the PR body before merge.

On the explicit question the orchestrator asked — generic primitives now vs scoped-to-headache and refactor later: **design `evaluatePhenotypes` and the data shape as headache-specific now, design `ChipGroup` + `MapperPanel` + `PitfallNotice` as headache-aware-but-data-driven now, and defer the generalization to a future diagnostic-pathway abstraction**. Concretely:

- The **mapper engine** (`evaluatePhenotypes`, `MAPPING_RULES`, `PHENOTYPES`, `CHIP_GROUPS`) should be headache-specific. Generalizing across vertigo / weakness / AMS before we have one working diagnostic pathway is premature abstraction — the criteria shapes (ICHD-3 ≥N-of-M with optional groups vs HINTS for vertigo vs MRC grading for weakness vs AMS feature clusters) will not share a type. Pick a concrete name (`evaluateHeadachePhenotypes`, `HEADACHE_MAPPING_RULES`) so the eventual second diagnostic pathway forces the abstraction rather than guessing at it now.
- The **chip-group component** can be reasonably generic at the UI layer because "ordered groups of selectable chips with eyebrow + collapsible body + optional teach microcopy" is a generally useful primitive that will recur. Build `ChipGroup` as a generic accessible chip selector that takes `{ groupId, label, eyebrow, chips, selected, onChange, teachExplanation?, defaultCollapsed? }` — no headache types in its signature.
- The **mapper panel** is harder. Layout (sticky panel showing top 1–3 ranked matches with criteria-met / criteria-missing expanders) is generic, but the result shape `PhenotypeMatch` is going to leak domain. Build `MapperPanel` to take a render-prop or a typed `matches: Array<{ id, name, criteria: { met, missing }, pitfalls?, pearl? }>` so its shape is data-driven, then keep the headache-specific result-projection in the page component.
- The **pearl** belongs inside `PathwayLearningPearl` (extended), not a new primitive.
- The **pitfall notice** can be generic at the UI layer for the same reason as `ChipGroup` — it is a contextual warning pattern, not a clinical pattern.

Net: **engine = headache-specific (boundary), UI primitives = generic (composability)**. This avoids both the "third pattern" risk and the premature-abstraction risk.

On rubric 2 (boundary): the boundary the plan draws (data module + pure mapper function + React component) is the correct one. The one thing to call out is that **`MAPPING_RULES` should not import any React types and `evaluatePhenotypes` must not return JSX** — only data. Pearls and pitfall *text* live in the data module; rendering them lives in the components. This is the line that has been blurred in the current `ClinicHeadachePathway.tsx` (clinical copy interleaved with JSX) and must not be reintroduced.

On rubric 4 (state locality): teach-mode in localStorage is fine, but the plan asks "context or hook?" without picking. Default posture: **a `useTeachMode()` hook backed by localStorage**, no context provider unless more than one branch of the tree needs to read it without prop-drilling becoming awkward. Three components (`ChipGroup`, `MapperPanel`, `LearnPearl`) reading the flag at the page level and prop-drilling one boolean is not awkward. Add the context only if the eventual surface count grows. Selected-chips state stays local to `ClinicHeadachePathway.tsx` and is passed to `MapperPanel` as a prop.

On rubric 5 (dependency weight): no new packages proposed. Pass.

## Required follow-ups

- **Resolve the `LearnPearl` vs `PathwayLearningPearl` duplication** before execution. Either extend the existing primitive with a `teachOnly` prop wired to `useTeachMode()`, or retire `PathwayLearningPearl` and migrate its call sites in `ClinicHeadachePathway.tsx` and `MigrainePathway.tsx` as part of this PR.
- **Resolve the stroke-code Teach-mode precedent claim.** Either point to the file where it lives, link the prior PR/ADR that established it, or remove the precedent claim and design Teach-mode deliberately as new precedent (with a one-paragraph note in the plan stating the design choice).
- **Name the headache-specific surface concretely.** `evaluateHeadachePhenotypes`, `HEADACHE_MAPPING_RULES`, `HEADACHE_PHENOTYPES`, `HEADACHE_CHIP_GROUPS`. Reserves room for `evaluateVertigoPhenotypes` etc. without forcing a shared abstraction now.
- **Keep `MAPPING_RULES` and `evaluateHeadachePhenotypes` JSX-free and React-free.** Stated as a hard rule on the data module — enforceable by lint or just by code review.
- **Add a test plan to the brief for the mapper.** Vitest table-driven tests with selected-chip sets as input and expected `PhenotypeMatch[]` as output, one row per ICHD-3 phenotype + at least one Probable case + at least one red-flag short-circuit. The pure-function design makes this cheap; not having the test plan in the brief means it tends to slip.
- **Add a rollback note to the PR body.** This is a 7-file Class D-clinical change; §16 requires it. Suggested form: "revert the merge commit; the old `ClinicHeadachePathway.tsx` is fully restored; no schema or claim-registry pruning required because new claim IDs sit alongside old ones and the old ones are still referenced after revert." Confirm the second clause is actually true by checking what existing claim IDs are removed by this change.
- **Confirm `PitfallNotice` is semantically distinct from `PathwayCascadeNotice`.** If yes, ship as planned. If no, parameterize `PathwayCascadeNotice` instead.
- **Route the clinical portions of this plan to `clinical-reviewer` before execution.** The 15–20 new claim IDs, the ICHD-3 criteria thresholds, the Probable-match rules, and the red-flag short-circuit logic are all clinical-validity questions outside this review's scope. Class D-clinical requires the §17.2 artifact pre-execution per §19 step 5.

## Blocking issues

None — decision is approve-with-conditions. The plan's shape is correct; the conditions above are concrete and addressable in the brief refinement step before V's approval.
