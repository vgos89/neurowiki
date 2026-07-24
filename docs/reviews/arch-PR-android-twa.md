# Architect review - Android Trusted Web Activity

**Decision:** approve-with-conditions  
**Reviewed:** plan only  
**Reviewer:** system-architect (model: GPT-5)  
**Date:** 2026-07-21

## Rationale

The plan is structurally sound for a Class D packaging change. The generated Android project remains isolated under `android/**`, PWA identity changes remain localized to the web manifest and Digital Asset Links, and signing material is external to git. No clinical-content surface is changed.

## Rubric

- Duplication risk: low
- Boundary integrity: pass with conditions
- Composability: pass
- State locality: pass with conditions
- Dependency weight: acceptable
- Migration exit: acceptable; the TWA wrapper can be removed without changing the web runtime

## Required follow-ups

- Preserve and do not stage unrelated working-tree files.
- Keep generated Android files under `android/**`.
- Keep keystores and passwords outside git with defensive ignore rules.
- Verify `targetSdkVersion` against the current Google Play requirement and document it.
- Keep the Play App Signing placeholder valid JSON; put human instructions in documentation, not JSON comments.
- Confirm the production build emits a valid `dist/.well-known/assetlinks.json`.
- Preserve clinical prose and citations byte-for-byte.
- Run the web gates and `bubblewrap build`; document any local Android-tooling blocker.

## Conditions resolved during implementation

- V approved the one-time branch/PR workflow exception on 2026-07-21.
- The upload key and password are stored in the ignored `.android-secrets/` directory.
- The generated project uses `compileSdkVersion 36` and `targetSdkVersion 36`, matching the Google Play requirement effective August 31, 2026.
- Notification delegation is disabled, so the wrapper does not request an unused notification permission.

## Blocking issues

None.
