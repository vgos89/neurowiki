# ADR 2026-06-05 — First-visit consent bar (replace blocking disclaimer modal)

**Status:** Accepted
**Date:** 2026-06-05
**Class:** D-clinical
**Deciders:** V (product), orchestrator, system-architect, compliance-legal, clinical-reviewer

## Context

The first-visit flow stacked up to five interruptions: the analytics cookie
banner, a **blocking** full-screen medical disclaimer modal (scroll-to-bottom →
checkbox → Accept), a flashy install overlay, the onboarding tour, and later an
install bubble. V reported it as "too much clicking before they can see or use
the website" and questioned whether the bottom cookie bar could replace the
blocking modal.

Key finding: the bottom bar was **analytics-cookie consent only** — a different
legal instrument from the medical/professional-use disclaimer (which carries the
healthcare-professional affirmation, liability exclusion, and the PHI/HIPAA
acknowledgment, and was made blocking by the 2026-05-19 HIPAA review,
`DISCLAIMER_VERSION = '3.0'`). The modal could not simply be deleted.

## Decision

Replace the blocking `DisclaimerModal` **and** `CookieConsentBanner` with one
non-blocking **`FirstRunConsentBar`** at the bottom of the viewport, and fold the
install prompt into the onboarding tour as a final slide. Net first-visit flow:
land on a usable site → one bottom bar (one explicit tap) → tour (with install)
auto-launches once on home, skippable.

Constraints (from compliance-legal, approve-with-conditions):
- Disclaimer acceptance stays **explicit**: required HCP checkbox + Continue
  disabled until checked. Not implied/continued-use.
- Analytics consent stays **unbundled** (GDPR): a separate pre-unchecked optional
  checkbox; declining never blocks Continue; GA loads only on explicit accept.
- The two existing storage keys are preserved byte-for-byte
  (`neurowiki-disclaimer-accepted` versioned JSON + `neurowiki-analytics-consent`)
  so already-accepted users are **never re-prompted** (zero migration).
- Required disclosures stay on-surface (not-medical-advice + no names/MRN/DOB +
  HCP affirmation with Terms/disclaimer links); full text behind linked
  Terms + Privacy.
- `DISCLAIMER_VERSION` mismatch re-surfaces the gate.

## Alternatives considered

- **One-tap modal** (keep blocking, strip scroll+checkbox to one tap) — lower
  compliance risk but still a gate; V chose the bottom-bar option.
- **Unified namespaced JSON consent key** — rejected by system-architect: forces
  a read-migration and risks re-prompting already-accepted users. Keeping the two
  existing keys is the migration-safe choice and maps cleanly to the two unbundled
  GDPR controls.

## Consequences

- Deleted: `DisclaimerModal.tsx`, `InstallPromptOverlay.tsx`,
  `CookieConsentBanner.tsx`. The overlay-vs-tour sequencing hack (the
  `ready`/`OVERLAY_SHOWN_KEY` handshake) is gone — a net simplification.
- New: `src/lib/consent.ts` (React-free, unit-tested logic + constants),
  `FirstRunConsentBar.tsx`, `InstallActions.tsx` (single source of truth for the
  install status→UI mapping, shared by the tour slide and `InstallBubble`).
- `OnboardingTour` adds a platform-aware install slide (Android prompt / iOS
  Safari steps / iOS-non-Safari Open-in-Safari) and gates only on
  disclaimer-accepted + tour-not-complete + on-home.
- `TermsPage` "No patient data" section reconciled with the v3.0 PHI language
  (was a compliance-legal blocking contradiction).

## Rollback

Single-commit `git revert` is safe **because the two consent keys keep their
exact names and JSON shape** — a user who accepted via the new bar has a record
the reverted DisclaimerModal reads correctly, so no re-prompt and no data loss.
Rollback note required in the commit body per §14.

## Verification

- typecheck clean; 159/159 unit tests (incl. 8 new `consent.test.ts`).
- Gates: build + prerender, claims/chains/routes/card-meta.
- Reviews (artifacts in `docs/reviews/`): system-architect approve-with-conditions;
  compliance-legal approve (9/9 conditions); clinical-reviewer approve (PHI copy);
  accessibility-specialist pass-with-conditions (conditions met); mobile-first
  pass-with-conditions at 375px (conditions met).

## Deferred follow-ups

- Class B: self-guard `trackDisclaimerShown`/`trackDisclaimerAcknowledged` on
  consent (compliance advisory — defensive against future GA pre-load).
- "Replay tour" affordance placement (helper `replayOnboardingTour()` retained
  and exported; no clean global footer exists — desktop rail vs mobile drawer).
- Privacy data-inventory completeness (already tracked as Phase 4F).
