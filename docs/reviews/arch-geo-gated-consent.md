# Architect review — geo-gated analytics consent

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-06-05

## Rationale

The shape fits the existing seams. A new `/api/geo.ts` mirrors the established
`api/npi.ts` serverless pattern; the region helpers extend `consent.ts`, which
already declares itself a home for React-free testable helpers; and the bar
consumes a default without changing the stored-consent path. The change is
additive and revert-safe.

## Recommended mechanism

`/api/geo.ts` serverless function reading `x-vercel-ip-country`, not Edge
Middleware. Middleware runs on the HTML request and is the classic way to break
CDN caching of a prerendered static build. The function never touches
`index.html`, so the HTML stays byte-identical and cacheable. Region is mapped
client-side via `STRICT_COUNTRIES` (single source of truth) and the country is
cached so later visits resolve synchronously.

## Conditions — status

1. Route the default-on posture change to compliance-legal. **Met** (compliance
   review approve-with-conditions; all blocking items resolved — see
   compliance-geo-gated-consent.md).
2. `/api/geo` response is `Cache-Control: no-store`. **Met** (api/geo.ts).
3. `App.tsx` GA load keyed on the effective decision, not a silent region check.
   **Met** via `analyticsEnabled(consent, region)` as the single rule; region
   only changes what counts as the default, and the bar still writes an explicit
   decision.
4. `analyticsEnabled(consent, region)` is the single source of the default rule.
   **Met** (used by App.tsx; the bar writes explicit decisions through it).
5. Flash mitigation: the disclaimer renders immediately; the analytics block
   waits for `resolved`; region is cached after the first fetch. **Met**
   (`useConsentRegion` returns `resolved`; the bar gates the analytics block on
   it).
6. Rollback line + `analyticsEnabled` unit tests (eu/row/unknown x accepted/
   declined/null). **Met** (ADR rollback section; consent.test.ts covers the
   matrix; 166 tests pass).
7. Fail-safe: unknown region and fetch failure both resolve to strict opt-in.
   **Met** (`regionForCountry(null) === 'unknown'`; `analyticsEnabled(null,
   'unknown') === false`; the hook defaults to 'unknown' until resolved).

## Dead code / boundary integrity

No duplication: region detection is server-side, region consumption is in
`consent.ts` + the bar + `PrivacyChoices`. No new dependency. Blast radius is
contained and additive.

## Blocking issues

None. The structural shape is sound; the compliance posture was the deferred
gate and is signed off separately.
