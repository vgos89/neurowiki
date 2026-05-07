# Architect review — PR #pending (back-button-refactor-and-audits)

**Decision:** approve-with-conditions
**Reviewed:** stash diff (pre-application) — `git stash show stash@{0} -p` (2266 lines, 26 files)
**Reviewer:** system-architect (model: claude-sonnet-4-5)
**Date:** 2026-05-07

---

## Rationale

The refactor correctly identifies a real duplication problem: 22+ pages each had a hardcoded `<Link to="...">` back-button pointing to a static parent path, which breaks when a user arrives via direct URL from a different surface (e.g., arriving at a calculator from a trial detail page — the back-button would navigate to `/calculators` even though the user came from `/trials`). Replacing these with `navigate(-1)` + sensible fallback is the right architectural call.

**Composability:** The new `useBackNavigation` hook is 12 lines — a clean, single-purpose function. No per-page variants created. The `useNavigationSource.handleBack` alias composes the same pattern inside the existing navigation abstraction, which is appropriate since `useNavigationSource` already owns back-navigation semantics for ArticleLayout and calculator pages.

**Duplication — two hook paths (approve-with-conditions):** The refactor introduces two routes to the same behavior:
1. `useBackNavigation(fallback)` — imported directly in `TrialPageNew.tsx`
2. `handleBack` from `useNavigationSource` — used by all other 21 files

Both produce identical runtime behavior. The split is defensible: `TrialPageNew` is a complex page that already manages its own navigation state outside `useNavigationSource`, so a direct import is cleaner than threading it through the shared hook. Not a blocking issue, but the boundary should be documented.

**Third pattern — ResidentGuide.tsx inlines the logic (condition):** `ResidentGuide.tsx` drops `useNavigationSource` entirely and inlines a bespoke `handleBack` closure with the `window.history.length > 1` check. This is the only file that doesn't use either hook. It is functionally correct but violates the "single source of truth" intent of the refactor. Future maintainers will not know this file is off-pattern. **Required follow-up (Class B):** Refactor `ResidentGuide.tsx` to use `useBackNavigation` with a context-aware fallback (`isTrialMode ? '/trials' : '/guide'`). This is the only condition.

**Boundary integrity:** `useBackNavigation` uses `window.history.length > 1` as the signal for "has history." This is a known SPA limitation — `window.history.length` includes pre-app browser history entries (e.g., a user who types the URL directly after 5 other tabs may have `length > 1`). The fallback will rarely fire incorrectly in practice, and the fallback routes are all sensible parent hubs. Acceptable for this project's risk profile; noted for future refinement with `useNavigationState` from React Router if needed.

**State scope:** No state lifted higher than necessary. The hook returns a callback; no context or global state introduced.

**Regression risk:** The 22-file blast radius is real but the per-file change is mechanical and consistent: `<Link to={path}>` → `<button onClick={handleBack}>`. Each file's visual and interactive contract is preserved. The only behavioral difference is that the back-button now follows the actual browser history rather than a hardcoded path — which is the intended improvement. Rollback: `git revert <commit-sha>` restores all 22 files atomically. Low rollback complexity.

**TrialPageNew blast radius note:** The TrialPageNew.tsx diff shows 303 lines changed but inspection confirms these are back-button replacements across multiple rendered archetype branches (the file has many independent JSX branches for different trial archetypes). The same 4-line pattern repeats per branch. No logic changes in the trial archetype rendering.

---

## Required follow-ups

1. **(Class B — park as TASKS item)** Refactor `ResidentGuide.tsx` to use `useBackNavigation(isTrialMode ? '/trials' : '/guide')` from `../../hooks/useBackNavigation` instead of the inline closure. Aligns `ResidentGuide` with the pattern used by `TrialPageNew`. Removes the third duplication vector.

2. **(PM-attention — documentation)** Document the two-hook boundary in a code comment in `useNavigationSource.ts`: note that `useBackNavigation` is the preferred hook for pages that don't need the full `source`/`getBackLabel` context, and `handleBack` from `useNavigationSource` is for pages that already consume that hook. Prevents future contributors from adding a fourth pattern.

---

## Blocking issues

None. The functional behavior is correct, consistent, and reversible. The `ResidentGuide.tsx` inline pattern is a follow-up condition, not a blocker.
