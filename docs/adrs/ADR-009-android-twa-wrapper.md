# ADR-009 - Package NeuroWiki for Android as a Trusted Web Activity

**Date:** 2026-07-21
**Status:** accepted
**Deciders:** V (product owner), orchestrator, system-architect
**Replaces:** none
**Supersedes:** none
**Architect review:** `docs/reviews/arch-PR-android-twa.md`

---

## Context

NeuroWiki is already a production Progressive Web App at `https://neurowiki.ai/`. Publishing it through Google Play requires an Android package, but maintaining a second native presentation or clinical-content implementation would duplicate logic and create a clinical drift risk.

Google's Trusted Web Activity model opens a verified web origin full-screen from a small Android wrapper. Domain ownership is established through Digital Asset Links using the Android signing-certificate fingerprint.

## Decision

Package NeuroWiki as a Bubblewrap-generated Trusted Web Activity with these fixed boundaries:

- Android package ID: `ai.neurowiki.app`
- Trusted origin and scope: `https://neurowiki.ai/`
- Generated Android source: `android/**`
- Web manifest and Digital Asset Links: `public/manifest.json` and `public/.well-known/assetlinks.json`
- Upload keystore and password: ignored local state under `.android-secrets/`
- Google Play upload artifact: ignored `android/app-release-bundle.aab`
- SDK baseline: minimum API 21, compile and target API 36
- Native notification delegation, billing, and geolocation permissions: disabled

The upload-key fingerprint remains in Digital Asset Links for local/upload-signed testing. After the first Play upload, the Play App Signing fingerprint must be added alongside it and the website redeployed.

## Alternatives considered

### Fully native Android client

Rejected because it would duplicate the React application, clinical presentation, and release process. It would increase the chance that web and Android users receive different clinical content.

### WebView wrapper

Rejected because a WebView adds a separate browser runtime and more native security, storage, and navigation ownership. TWA keeps the live PWA as the single runtime and requires verified domain ownership.

### PWABuilder-only generated package

Retained as a GUI fallback, but not the canonical path. Committing the Bubblewrap project makes package identity, SDK level, permissions, and Gradle inputs reviewable and reproducible.

## Consequences

### Positive

- The website remains the single clinical-content implementation.
- Ordinary web releases do not require a new Play submission.
- The Android project is isolated from the Vite/React runtime.
- Signing identity and Play handoff steps are explicit and auditable.

### Negative / risks

- Full-screen TWA behavior depends on a correct Play App Signing fingerprint at the live `.well-known/assetlinks.json` endpoint.
- The upload keystore is durable external state and must be backed up securely.
- Bubblewrap regeneration can overwrite the manually raised API 36 target; maintainers must review generated diffs.
- Major Android wrapper or dependency changes still require a new Play release.

## Migration and rollback

There is no web-runtime migration. The Android package is additive. If the Play release is abandoned, revert the Android packaging commits and delete the ignored local APK, AAB, and signing material after confirming no future release needs the upload key. The existing PWA continues operating independently.

## Scope

This decision affects Android packaging, signing, Digital Asset Links, and Play Store operations only. Clinical prose, citations, pathway logic, calculators, and the React application runtime are out of scope.
