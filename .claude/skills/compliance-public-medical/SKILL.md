---
name: compliance-public-medical
description: HIPAA/GDPR/CCPA/ADA compliance guide for NeuroWiki as a public-facing medical reference tool. Covers data collection, medical disclaimers, cookie consent, accessibility commitment, and regulatory scope. Load for any auth, privacy, legal-copy, or PHI-adjacent task.
---

# Compliance — NeuroWiki Public Medical Tool

## Regulatory scope

NeuroWiki is a **clinical decision-support reference tool**, not a covered entity under HIPAA (no patient data collected or stored). However, it is subject to:

- **GDPR** — EU users, Google Analytics data collection
- **CCPA** — California users
- **ADA / WCAG 2.1 AA** — Accessibility requirement for public health tools
- **FTC / medical disclaimer norms** — "Not a substitute for clinical judgment"

## What data NeuroWiki collects

| Data | Where stored | Purpose | Retention |
|---|---|---|---|
| Google Analytics events | Google servers | Usage analytics | GA default (26 months) |
| Cookie consent decision | `localStorage: neurowiki:consent` | Gate GA loading | Until cleared |
| Favorite trials | `localStorage: neurowiki:favs` | User preference | Until cleared |
| Recently viewed | `localStorage: neurowiki:recents:v1` | Recent items list | Until cleared |
| Disclaimer acknowledged | `localStorage: neurowiki:disclaimer:v1` | Don't re-show | Until cleared |
| Feedback submissions | Resend (email relay) → vaibhav's inbox | User feedback | Email provider retention |
| NPI proxy results | NOT stored — session-only | Doctor name lookup | Never persisted |

**No PHI collected. No account system. No server-side user data store.**

## GDPR compliance (shipped Phase 4A — commit 6356c59)

- Cookie consent banner required before GA fires
- `anonymize_ip: true` set in GA config
- Consent stored in localStorage; GA disabled if consent not given
- Consent can be revoked (clear localStorage)
- Privacy Policy must disclose all items in the data table above
- Data deletion contact: info@tidbithealth.in

## Medical disclaimer requirements

Every calculator and pathway page must carry a disclaimer. Current pattern (from Phase 4B, 4C):

**Calculator footer:** "For clinical reference only. Verify scores against patient examination. Not a substitute for clinical judgment."

**Dosing displays (stroke code):** "Reference only — verify against institutional protocol before administration."

**Global disclaimer modal:** fires on first visit; acknowledged = `neurowiki:disclaimer:v1` set in localStorage.

These are not negotiable. Any new calculator or dosing display needs the same treatment.

## Privacy Policy minimum disclosures (/privacy — Phase 4D)

The `/privacy` page must disclose:
- Google Analytics (with anonymize_ip, and link to GA opt-out)
- Feedback email via Resend (what data is sent, where it goes)
- NPI proxy: not stored, session-only
- localStorage usage (keys, purpose, how to clear)
- Data deletion contact: info@tidbithealth.in
- No server-side user accounts
- No sale of data to third parties
- Cookie consent mechanism and how to revoke

## Terms of Use minimum content (/terms — Phase 4D)

- Not a substitute for clinical judgment
- No warranty of accuracy or completeness
- Not for emergency use without clinical verification
- Governed by Indian law (jurisdiction: India)
- Contact: info@tidbithealth.in

## Accessibility Statement (/accessibility — Phase 4D)

- WCAG 2.1 AA compliance target
- Known issues (if any — list by component)
- Keyboard navigation supported
- Screen reader support (ARIA implemented on calculators)
- Contact for accessibility issues: info@tidbithealth.in

## ADA / WCAG obligations

- All interactive elements: minimum 44×44px touch target
- All images: alt text
- All form controls: associated labels
- Color contrast: minimum 4.5:1 for normal text, 3:1 for large text
- Focus management: modals trap focus; Escape closes
- Screen readers: ARIA roles on calculators (`radiogroup`, `radio`, `aria-live`)

## CCPA

- No sale of personal information
- No targeted advertising
- Users can request data deletion (email info@tidbithealth.in)
- Privacy Policy satisfies CCPA if it includes the above

## iOS / Android future (parked)

When native apps are built, additional requirements apply:
- App Store: medical disclaimer in app description
- Google Play: medical / health app declaration
- Push notifications: explicit consent required
- HealthKit / Health Connect: additional PHI handling rules apply

## What compliance-legal owns

compliance-legal is read-only. It produces findings and required copy. It delegates actual copy drafting to content-writer and page implementation to ui-architect. It must sign off on the final Privacy Policy, Terms, and Accessibility Statement copy before merge.
