# Compliance review — Phase 4F Privacy data-inventory completeness

**Decision:** approve (advisory finding applied)
**Reviewer:** compliance-legal (model: claude-opus-4-8)
**Date:** 2026-06-05

## Scope
- `src/pages/PrivacyPage.tsx` — the "What data we collect" table + intro line.

## Outcome
The table is category-complete. Every persistent-storage category is either
itemized or honestly covered by the new grouped row "App preferences and
first-run flags." The restored intro claim ("Every category of data NeuroWiki
collects or stores is listed below") is now true. Grouping the trivial,
non-identifying UI/feature-state flags into one row (rather than listing each
localStorage key) is acceptable disclosure under GDPR Art. 13 and is more
readable + less drift-prone than per-key enumeration.

## Inventory reconciled
- Itemized rows: GA events; consent (`neurowiki-analytics-consent`); favorites
  (`neurowiki:favorites:v1`); recents (`neurowiki:recents:v1`); disclaimer
  (`neurowiki-disclaimer-accepted`); feedback (Resend); NPI (not stored); saved
  cases (IndexedDB); cross-device transfer (Supabase relay, ciphertext).
- Grouped row covers (all non-identifying): `neurowiki:disclaimer:v1`,
  `neurowiki:install-overlay:v1/v2/v3`, `neurowiki:tour-complete:v1`,
  `neurowiki:install-engagement:v1`, `neurowiki:session-counted:v1`,
  `neurowiki:home:hasVisited`, `neurowiki:home:showMoreExpanded`,
  `neurowiki:search:recents`, `neurowiki:geo-country`,
  `neurowiki:em-billing:provider` (sessionStorage billing ROLE enum, not a
  name), plus per-tab sessionStorage UI-state flags.

## Corrections to the earlier Phase 4F note
- `neurowiki:em-billing:provider` is a billing ROLE enum in sessionStorage, NOT
  a clinician name and NOT PII.
- `neurowiki-case-transfer-v1` is an HKDF crypto domain-separation constant and
  `neurowiki-json-ld` is a DOM element id. Neither is a stored data key; neither
  belongs in the inventory.

## Findings
1. Advisory (APPLIED): the grouped row now states recent searches are "terms you
   typed, stored only on this device," to satisfy GDPR Art. 13 transparency for
   user-entered text.
2. Advisory (declined, editorial only): disambiguating the two disclaimer-related
   keys. The grouped row does not surface the word "disclaimer," so there is no
   visible reader overlap with the "Disclaimer acknowledged" row.

## Blocking issues
None. No PII item requires separate itemization; no name/MRN/DOB is stored in
any grouped key.
