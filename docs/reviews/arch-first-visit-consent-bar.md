# Architect review — first-visit consent bar restructure

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-06-05

## Rationale

The direction is structurally sound and reduces complexity. Today three first-run
surfaces (DisclaimerModal, InstallPromptOverlay, OnboardingTour) coordinate
through a fragile shared-flag + event + `ready`-timer + `OVERLAY_SHOWN_KEY`
handshake purely to stop two modals stacking. Collapsing the blocking modal into
a non-blocking bar and folding install into the tour deletes an entire overlay
and that handshake. Two real risks, both managed: (a) the install status→UI
mapping was triplicated — resolved by extracting the shared `InstallActions`
component used by the tour slide and `InstallBubble`; (b) the consent state model
spans two persisted keys with a no-re-prompt constraint and (previously) no test
coverage — resolved by keeping the two existing keys byte-compatibly and adding
`consent.ts` pure-function tests.

## Recommended component + state model (adopted)

- **New `FirstRunConsentBar`** supersedes `CookieConsentBanner`; old banner +
  DisclaimerModal deleted in the same change.
- **Keep the two existing keys** (`neurowiki-disclaimer-accepted` versioned JSON +
  `neurowiki-analytics-consent`). No unified key, no migration, no re-prompt.
- **Preserve `markDisclaimerAckFlag()`** (flag + event) so the tour still
  launches; logic moved into `src/lib/consent.ts`.
- **Tour gating** reduced to disclaimer-accepted + tour-not-complete + on-home;
  `usePwaInstall` status used only to pick the install-slide variant (gated on
  `ready` for the slide, never for tour launch).

## Required follow-ups (conditions) — status

1. Preserve the disclaimer storage contract (version gating + re-surface). **Met**
   (`consent.ts` `isDisclaimerAccepted` + `DISCLAIMER_VERSION`).
2. Two unbundled keys; `markDisclaimerAckFlag` preserved. **Met.**
3. Shared `InstallActions` consumed by tour slide + bubble; bubble keeps its
   narrower `installable`/`ios-manual` eligibility. **Met.**
4. Delete dead code (InstallPromptOverlay, CookieConsentBanner, DisclaimerModal;
   App lazy imports + mounts; OnboardingTour `OVERLAY_SHOWN_KEY`/`ready`-gate).
   **Met** (grep for `InstallPromptOverlay`/`OVERLAY_SHOWN_KEY` returns no refs).
5. Tests for consent/migration logic. **Met** (`src/lib/consent.test.ts`, 8 tests).
6. Rollback note. **Met** (byte-compatible records → revert-safe; documented in
   ADR + commit body).
7. Route TermsPage PHI reconciliation to clinical-reviewer + compliance-legal;
   `-clinical` flag. **Met** (artifacts: `clinical-first-visit-consent-bar.md`,
   `compliance-first-visit-consent-bar.md`).
8. Non-blocking-bar a11y confirmed by accessibility-specialist. **Met**
   (pass-with-conditions; all conditions applied — contrast, aria-describedby,
   live region, Escape, focus return, 44px targets).

## Blocking issues

None. Conditions 5 (tests) and 6 (rollback) — the two items that make migration
exit safe — are both satisfied, so the decision stands at approve-with-conditions
with all conditions met.
