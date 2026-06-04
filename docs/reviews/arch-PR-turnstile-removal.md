# Architect review — PR #turnstile-removal

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect
**Date:** 2026-06-03

## Rationale

Removing Cloudflare Turnstile from the feedback path and replacing it with a
honeypot + same-origin guard fits the existing structure cleanly. Every handler
in `api/` (`feedback.ts`, `npi.ts`, `seo-weekly.ts`, `transfer-cleanup.ts`) is
self-contained — each imports `VercelRequest/Response`, defines its own consts and
helpers inline, and sets its own CORS headers. There is no `api/_lib` or shared
helper module today (`transfer-cleanup.ts` defines `safeCompare` locally), so the
established convention is **handler-local helpers**. Keeping the honeypot +
same-origin guards as pure functions inside `api/feedback.ts` matches that
convention; inventing a shared module for two single-consumer functions would be a
premature third pattern and would cross the serverless/browser boundary (`src/lib`
is browser code). Making them pure and unit-testable is the right shape — this is
the first `api/` handler to get test coverage, a net improvement. The frontend
honeypot is a net-new bespoke field on the one form with no duplication concern;
submit-enabled state stays local to the modal.

Rubric: duplication pass · boundary pass · composability pass · state-locality
pass · dependency-weight pass (removes a dependency, adds none) · migration-exit
pass (single-commit revert, 4 files, rollback noted).

## Required follow-ups

- ADR must record the **deliberate CORS divergence**: `feedback.ts` uses an Origin
  allowlist while other `api/` handlers stay `Access-Control-Allow-Origin: *`,
  with the rationale (POST-with-side-effect vs. read proxy), so it is not
  "consistency-fixed" back to `*` later. — **Done** (ADR-2026-06-03 § Consequences).
- Implementer: unify the OPTIONS-preflight and POST `Access-Control-Allow-Origin`
  values to the same computed result; do not leave a static `*` const for
  preflight while POST uses the allowlist. — **Done** (`allowedOriginHeader()`
  computed once at top of handler, applied before the OPTIONS branch and reused
  for POST).
- Security review (separate artifact) owns same-origin-bypass and silent-drop
  behavior. — Covered in `security-PR-turnstile-removal.md`.
- Shared CORS/origin helper across `api/` handlers is a separate, deliberate
  4-file refactor — out of scope here; parked.

## Blocking issues

None.
