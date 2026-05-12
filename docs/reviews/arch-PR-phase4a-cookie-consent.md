# Architect review — PR #phase4a

**Decision:** approve-with-conditions (conditions resolved in implementation)
**Reviewed:** plan + implementation
**Reviewer:** system-architect (model: claude-sonnet-4-6)
**Date:** 2026-05-11

## Rationale

Plan approved with two structural corrections applied before code was written:

1. `src/utils/analytics.ts` already existed — `loadGA()` and `CONSENT_STORAGE_KEY` were added there rather than creating a duplicate `src/lib/analytics.ts`. This preserves the single analytics module and avoids the fan-out that a second module would create.
2. `src/utils/storage.ts` helpers (`getStorageItem`/`setStorageItem`) are used in both the banner component and App.tsx — no raw `localStorage` calls. This keeps localStorage access consistent with the rest of the codebase.

Implementation is structurally sound: consent check runs once in a `useEffect` on mount in `App.tsx`; `loadGA()` is idempotent via `window.__gaLoaded` guard; the banner component is lazy-loaded and conditionally rendered; z-index set to `z-[60]` to clear the trial page Bottom Line bar (z-55). GA scripts are removed from `index.html` — no GA fires without explicit consent.

`CONSENT_STORAGE_KEY` is a named export constant, enabling future consumers (settings page, privacy revocation) to reference it without re-declaring the string.

## Required follow-ups

- Phase 4D (Privacy Policy route `/privacy`) must ship before the "Privacy Policy" link in the banner resolves to real content. Currently redirects to `/` via the catch-all route. Tracked in TASKS.md.
- Mobile-first sign-off: mobile-first-developer confirmed banner renders correctly at 375px via Tailwind responsive classes (`flex-col sm:flex-row`, `items-start sm:items-center`).

## Blocking issues

None.
