# Compliance review — geo-gated analytics consent

**Decision:** approve-with-conditions (all blocking conditions resolved in build)
**Reviewer:** compliance-legal (model: claude-opus-4-8)
**Date:** 2026-06-05

## Decision summary

Default-on analytics outside the strict regions is lawful with the conditions
below. All four blocking findings are resolved in this build. India is default-on
as a current-state risk-acceptance with a monitoring trigger (see TASKS.md).

## Strict (opt-in) country list — hard-coded source of truth

EU-27 + EEA (Iceland, Liechtenstein, Norway) + UK + Switzerland + Brazil.
33 ISO codes in `STRICT_COUNTRIES` (src/lib/consent.ts). Brazil placed in strict
per V's decision (compliance recommendation). Everything else is default-on.
Unknown region resolves to strict (fail-safe).

## Blocking findings — resolution

1. **GA ad signals off (CPRA "sharing").** RESOLVED. `loadGA()` now sets
   `allow_google_signals: false` and `allow_ad_personalization_signals: false`
   (src/utils/analytics.ts).
2. **In-session opt-out effectiveness.** RESOLVED. `unloadGA()` sets
   `window['ga-disable-<ID>'] = true`, so opting out stops collection at once;
   `loadGA()` clears the flag on re-opt-in (src/utils/analytics.ts).
3. **CCPA section omitted "sharing" (CPRA).** RESOLVED. The Privacy Policy
   section is now "CCPA and CPRA: California residents" and states NeuroWiki does
   not sell or share personal information for cross-context behavioral
   advertising, referencing the Privacy choices opt-out (src/pages/PrivacyPage.tsx).
4. **No persistent opt-out control.** RESOLVED. `PrivacyChoices` renders in the
   global footer on every page (src/components/PrivacyChoices.tsx, Layout.tsx),
   with an analytics on/off toggle that writes an explicit decision and loads or
   disables GA.

## Advisory findings — resolution

- Privacy Policy stale opt-in model: RESOLVED (geo behavior, default-on, and the
  Privacy choices opt-out described; "Last updated" set to 2026-06-05).
- GA loads on first paint for default-on (before disclaimer acceptance):
  acceptable; consent is unbundled from the disclaimer. Disclosed in the Privacy
  Policy ("collection begins on the first visit").
- Switzerland in strict list: RESOLVED (CH in STRICT_COUNTRIES).
- Explicit geo-failure fallback: RESOLVED (unknown is a first-class value
  treated as strict).
- India DPDP monitoring: TASKS.md PARKING LOT entry added with a review trigger.

## Required follow-ups

1. Reassess India when the DPDP implementing rules are notified (tracked).
2. None blocking for ship.

## Blocking issues

None remaining. All four blocking findings resolved.
