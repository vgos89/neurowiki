# Architect review — W5.1 Citation schema foundation

**Decision:** approve
**Reviewed:** plan + touched files (src/lib/ does not yet exist; reviewed plan against codebase structure)
**Reviewer:** system-architect (model: claude-sonnet-4-6)
**Date:** 2026-04-17

## Rationale

The plan introduces two new files (`schema.ts`, `claim.ts`) inside a new module `src/lib/citations/`. No existing infrastructure is being replaced or duplicated — `src/lib/` does not exist, so this is greenfield placement with no migration burden. The boundary is correct: citation data belongs in `src/lib/citations/` per the system-architect rubric, and the `claim()` helper is a pure pass-through with zero runtime behavior beyond a dev-mode warn. No state is introduced; no external dependencies are added. All six rubric items pass with one structural condition.

The one condition: `claim.ts` imports `CLAIM_REGISTRY` from `./claims`, which will not exist until W5.2. This produces a known build failure between W5.1 commit and W5.2 commit. The plan explicitly acknowledges this as the "forcing function for W5.2" and V has approved it. The condition is structural, not a block: the wave is being executed in sequence and W5.2 must land before any §20 build gate can be satisfied. Confirm that no other PR is opened against main between W5.1 and W5.2 while the build is red.

## Rubric

**1. Duplication risk — PASS.**
`src/lib/` is new territory; no parallel citation utility exists in the codebase. No consolidation required.

**2. Boundary integrity — PASS.**
`src/lib/citations/` is the correct location per the system-architect brief ("Citation data belongs in `src/lib/citations/`, not inlined in JSX"). The `claim()` helper touches only strings; it does not import UI concerns or scoring logic. `ClaimSurface` describes locations without coupling to any component.

**3. Composability — PASS.**
`Citation`, `ClaimEntry`, `ClaimSurface`, and `claim()` are fully general — no surface, component, or calculator is privileged in the type definitions. All future calculator rebuilds (NIHSS, ASPECTS, HAS-BLED, ABCD2, RoPE, Heidelberg, Boston Criteria) and all pathway pages will use the same types.

**4. State locality — PASS.**
No runtime state. `schema.ts` is compile-time types only. `claim()` is a pure function — input string in, same string out. No store, no context, no hoisting.

**5. Dependency weight — PASS.**
No new packages. `process.env.NODE_ENV` is a Node.js built-in available in the Vite dev environment. No `package.json` changes.

**6. Migration exit — PASS with condition.**
Three new files, one TASKS.md update. No existing files modified. `git revert` on the W5.1 commit is clean and side-effect-free — no downstream consumers exist until W5.2+. The condition: `claim.ts`'s broken import means the build is red from W5.1 commit until W5.2 lands. This is documented in the plan and approved by V. It does not affect production (the module is unused until W5.5+), but it means the §20 build gate cannot pass on any PR opened while W5.2 is outstanding. W5.2 must follow without an intervening unrelated PR on main.

## Required follow-ups

- W5.2 must land before any PR attempts to satisfy the §20 build gate. Do not open any other PR between W5.1 and W5.2 commits.
- When `ClaimEntry.surfaces` is first populated in W5.2, verify the discriminated union arms in `ClaimSurface` cover all Phase 1 surfaces (jsx + data) without requiring a schema change. Phase 2/3 arms (computed, markdown, json) are already defined — confirm they do not require additional fields as the scanner is built in W5.3.
- `definition` as a fifth source type is an extension beyond CLAUDE.md §13.2 (which lists 4 types). The addition is architecturally sound (it resolves the ACRM 1993 ambiguity surfaced in the GCS clinical review) but should be noted in ADR-002 as a deliberate extension so future sessions know it was intentional.

## Blocking issues

None.

## Updates

**2026-04-17 — V revised the plan to use stub CLAIM_REGISTRY instead of intentional build-break.** Required follow-up #1 (no other PR during W5.1→W5.2 gap) is obsolete — main stays green across the boundary. Required follow-ups #2 (surfaces coverage verification) and #3 (document `definition` in ADR-002) are still valid; #3 addressed in updated ADR-002. Decision upgraded from `approve-with-conditions` to `approve`.
