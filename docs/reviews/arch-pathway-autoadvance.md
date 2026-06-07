# Architect review — pathway auto-advance fix

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-06-07

## Rationale
The diagnosis is correct and verified: `PathwayCategoryRow.tsx` initializes `useState(defaultOpen)`, reading `defaultOpen` only at mount. Co-mounted sibling rows in an already-open step never re-read the prop, so they stay closed when they become the next-unfilled row — the reported "choppy" behavior. Option A (uncontrolled primitive + a transition-detecting effect + additive `defaultOpen` props on the pages) is structurally sound and correct over Option B (lifting open-state to a controlled `open`/`onToggle` model) on blast radius: A is a contained additive change to one primitive plus additive props on four pages, no API change; B rewrites the primitive contract and all four pages for a stricter one-open-at-a-time guarantee the stated problem does not require.

Three structural facts make A safe: the consumer set is exactly four pages (ElanPathway does NOT use this primitive — enumeration complete); the reduced-motion + `scrollIntoView` pattern already exists in `PathwayCascadeNotice.tsx`, so A reuses an in-repo pattern (no duplication); and A keeps open-state local to the primitive (B would over-hoist). The one genuine risk is the invariant "exactly one row's `defaultOpen` is true at a time within a visible step," which is upheld by author discipline, not enforced — a concern, not a block, because the worst case (two open rows) is strictly better than today's zero, and the clinical surface is untouched.

Rubric: duplication-risk pass · boundary-integrity pass · composability pass · state-locality pass · dependency-weight pass · migration-exit concern (5 files at the boundary → rollback note required).

## Required follow-ups (binding)
1. **Transition-detection, not level.** Track the previous `defaultOpen` (ref/usePrevious); call `setIsOpen(true)` only on `prev === false && defaultOpen === true`. A bare `useEffect(() => { if (defaultOpen) setIsOpen(true) }, [defaultOpen])` re-opens against `handleSelect`'s close-on-select — forbidden. Never auto-close on the true→false transition.
2. **Resolve the handleSelect ↔ effect race** via the transition-guard; test directly (select closes the row and it does not re-open).
3. **Convert Migraine's `defaultOpen={false}` (~line 996, Renal Function)** to a real gating expression — a deliberate conversion, not an additive-only edit.
4. **Document the one-true-at-a-time invariant** on the primitive's `defaultOpen` prop (opens on every false→true transition; callers ensure at most one row transitions true at a time within a visible step).
5. **§16 rollback note in the commit/PR body** — 5 files at the migration boundary; revert is `git revert <sha>`, one unit, no schema/API/data migration.
6. **scrollIntoView: keep, scope it.** `block: 'nearest'`; gated behind `prefers-reduced-motion` (`behavior: 'auto'` when reduced, else `'smooth'`); only on the auto-open transition, never on a manual toggle.
7. **Active-slot highlight optional + out of structural scope.** If included, token-only (route to ui-architect for token correctness). Do not expand blast radius.

## Classification (Class D, NOT D-clinical) + clinical watch item
Interaction-only: every `defaultOpen` to be added is derived from existing `inputs.*`/state that already gates row *mounting*; wiring it into `defaultOpen` changes only *which row is open*, never which options render, which branch fires, or what verdict shows. **Watch item:** each row's `defaultOpen` MUST read the same state its mount condition reads (e.g. ExtendedIVT "Imaging Modality" → gate on `setupComplete && imagingModality === null`, mirroring the mount gate). If any row's `defaultOpen` references a field its mount condition does not, STOP and route that row to `clinical-reviewer` — a new reachability condition would cross into clinical-logic territory.

## Regression scope to prove unchanged (all four pathways)
(1) selecting still closes that row; (2) a manually-closed row stays closed and does not auto-reopen on an unrelated state change (transition-guard); (3) `stepCompleted` rows remain reopenable/revisable; (4) locked steps render nothing and never auto-open; (5) cascade-clear + undo still works — auto-open must not interfere with cascade-driven resets; (6) EVT (already correct) shows no behavior change; (7) reduced-motion users get no scroll animation. Items 2 and 5 are highest-risk and need explicit test coverage.

## Blocking issues
None.
