# Compliance review — first-visit consent bar

**Decision:** approve
**Reviewer:** compliance-legal (model: claude-opus-4-8)
**Date:** 2026-06-05

Re-verification of the implemented `FirstRunConsentBar` against the nine
conditions set in the prior approve-with-conditions review (2026-06-05).

## Scope
- `src/components/FirstRunConsentBar.tsx`
- `src/lib/consent.ts`
- `src/App.tsx` (consent effect + mounts)
- `src/utils/analytics.ts` (CONSENT_STORAGE_KEY, loadGA gating)
- `src/pages/TermsPage.tsx` ("Patient data and PHI")

## Condition-by-condition

1. **Explicit HCP acceptance** — PASS. Required checkbox + Continue disabled until
   checked (`disabled` + `aria-disabled`); `handleContinue` also guard-returns if
   unchecked. No implied/continued-use path.
2. **GDPR unbundled analytics** — PASS. Separate pre-unchecked optional checkbox;
   declining (unchecked) does not block Continue; accepting terms does not force
   analytics.
3. **GA gated on 'accepted'** — PASS. `loadGA()` only from App.tsx (consent ===
   'accepted') and `acceptAnalytics()`. Decline writes 'declined', no GA.
4. **Two keys preserved; no re-prompt** — PASS. Exact keys + `{version,
   acceptedAt, userAgent}` shape; `isDisclaimerAccepted` returns true for an
   existing current-version record with no migration write.
5. **Version re-acceptance** — PASS. Stale `version` → `needsDisclaimer` true →
   full gate re-surfaces.
6. **Required on-surface copy** — PASS. Not-medical-advice statement + "no names,
   MRNs, or dates of birth" + HCP affirmation with Terms/disclaimer links +
   Privacy link.
7. **markDisclaimerAckFlag preserved** — PASS. Flag + event fire on Continue
   (before unmount) and backfill on mount; idempotent.
8. **Bar persists until resolved** — PASS. Only dismissal path is `setResolved`;
   no timer/scroll/route auto-dismiss.
9. **TermsPage PHI reconciled (prior blocking issue)** — PASS. "Patient data and
   PHI" now matches the v3.0 disclaimer + Privacy Policy; the contradictory "not
   approved for handling PHI" language is removed.

## Residual risk
`trackDisclaimerShown`/`trackDisclaimerAcknowledged` call `gtag` without an
internal consent check. Safe today (gtag is undefined until consent-gated
`loadGA`), but latent if GA is ever pre-loaded. Advisory only.

## Required follow-ups
1. (Advisory, Class B) Add a `getStorageItem(CONSENT_STORAGE_KEY) === 'accepted'`
   guard inside `trackDisclaimerShown`/`trackDisclaimerAcknowledged`.

## Blocking issues
None. All nine conditions satisfied; prior blocking issue resolved.
