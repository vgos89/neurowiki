# ADR 2026-06-05 — Geo-gated analytics consent

**Status:** Accepted
**Date:** 2026-06-05
**Class:** D
**Deciders:** V (product), orchestrator, system-architect, compliance-legal

## Context

After the first-visit consent bar shipped (ADR-2026-06-05-first-visit-consent-bar),
analytics was opt-in for every visitor. Most visitors do not opt in, so Google
Analytics coverage dropped. V asked whether opt-in is legally required given the
existing GA + Search Console setup.

Finding: opt-in is required only in some regions. The EU, EEA, UK, Switzerland,
and Brazil require opt-in for analytics cookies (GDPR/ePrivacy and equivalents).
The US, India, and most of the world allow analytics on by default with notice
and an opt-out. Google Search Console is unaffected throughout (it does not track
individual users).

## Decision

Geo-gate the analytics consent:
- Strict regions (EU-27, EEA, UK, Switzerland, Brazil): opt-in, unchanged.
- Rest of world: analytics on by default, with an inline notice and a persistent
  opt-out.
- Fail-safe: if the region cannot be determined, treat the visitor as strict.

Region is detected by a serverless function (`/api/geo`) that reads Vercel's
`x-vercel-ip-country` header. The function returns only the country; the
country-to-region mapping is the hard-coded `STRICT_COUNTRIES` set in
`src/lib/consent.ts` (single source of truth). The country is cached client-side
so later visits resolve the region without a fetch.

Brazil: placed in the strict (opt-in) bucket per V's decision, following the
compliance recommendation (LGPD treats analytics consent as unsettled).

## Compliance requirements built in (compliance-legal review)

Default-on analytics in the US is lawful only with these, all included:
1. GA loads with `allow_google_signals: false` and
   `allow_ad_personalization_signals: false`, so default-on is not "sharing"
   under CPRA.
2. An in-session opt-out (`unloadGA` sets `window['ga-disable-<ID>'] = true`) so
   opting out takes effect at once, without a reload.
3. A persistent "Privacy choices" control in the site footer on every page,
   which writes an explicit decision and loads or disables GA.
4. The Privacy Policy describes the geo behavior, the default-on collection, and
   the Privacy choices opt-out, and the CCPA section now covers "sale or share"
   (CPRA).

## State model

Two existing keys, unchanged shape (no migration, no re-prompt):
- `neurowiki-disclaimer-accepted` (versioned JSON) for the disclaimer.
- `neurowiki-analytics-consent` ('accepted' | 'declined') for analytics.

`analyticsEnabled(consent, region)` is the single rule: 'accepted' is on
everywhere, 'declined' is off everywhere, and no choice is on for default-on
regions and off for strict/unknown. `App.tsx` loads GA when this returns true;
the bar writes the explicit decision.

## Alternatives considered

- Vercel Edge Middleware setting a region cookie: rejected. It runs on the HTML
  request and risks breaking the CDN cache of the prerendered static build. The
  `/api/geo` function fits the existing serverless pattern and never touches the
  cached HTML.
- Keep opt-in everywhere: rejected by V (loses most analytics coverage).
- Default-on everywhere with opt-out: rejected (not lawful for the EU/UK/CH/BR).

## Consequences

- New: `api/geo.ts`, `useConsentRegion` hook, `PrivacyChoices` footer control,
  region helpers + tests in `consent.ts`, `unloadGA` in `analytics.ts`.
- Changed: `FirstRunConsentBar` (region branch), `App.tsx` (region-aware GA
  load), `Layout` (global footer), `PrivacyPage` (geo + CPRA copy).
- US/India/rest-of-world visitors are tracked by default again; EU/UK/CH/BR stay
  opt-in. Search Console is unaffected.

## Rollback

Revert-safe and additive: remove `api/geo.ts`, drop the region helpers and their
call sites, and the bar falls back to opt-in everywhere (the strict default). No
storage migration, so no re-prompt on revert.

## Follow-up

India DPDP Act: default-on is a current-state risk-acceptance because India's
implementing rules are not yet in force. Tracked in TASKS.md PARKING LOT with a
review trigger for when the rules are notified.
