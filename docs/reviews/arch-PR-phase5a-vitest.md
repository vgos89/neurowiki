# Architect review — Phase 5A: Vitest setup + calculator scoring tests

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-sonnet-4-6)
**Date:** 2026-05-11

## Rationale

Vitest is the right test runner for a Vite 6 + TypeScript repo. Co-locating `.test.ts` files next to their source files (rather than a separate `__tests__/` mirror) is idiomatic for this setup and keeps the coverage path clean. The `/// <reference types="vitest" />` directive in `vite.config.ts` is the correct Vite 6 pattern — avoids polluting `tsconfig.json` with test-only globals.

Test scope (pure utility functions — `calculateTotal`, `getItemWarning`, `calculateLvoProbability`, `getTNKDose`, `getTpaDoses`, `toKg`) is appropriate for Phase 5A. Hook tests (`useRecents`, `useFavorites`) correctly deferred to Phase 5B pending `@testing-library/react`.

The `toBeCloseTo(x, 0)` approach for rounding edge cases (bolus+infusion sum) is correct — each component is independently rounded to 1 decimal, so the sum may differ from `total` by up to 0.1mg, which is clinically irrelevant.

## Required follow-ups
- Phase 5B: add `@testing-library/react` + hook tests for `useRecents` and `useFavorites`
- CI gate: `npm test` must pass in CI pipeline (add to `.github/workflows` if one exists)
- Coverage threshold: consider adding `coverageThreshold` to `vite.config.ts` test block (≥70% line coverage for src/utils/) as a future gate

## Blocking issues

None. Conditions above are forward work, not blockers for merging Phase 5A.
