# NeuroWiki - Android (Play Store) setup via Trusted Web Activity

> Approach: wrap the existing PWA (`neurowiki.ai`) as a **Trusted Web Activity (TWA)** using **Bubblewrap**. The app runs the live site full-screen; ordinary web-content updates ship with the website without a new Android release.

This is the operator and handoff checklist. The generated Android project lives in `android/`. Play Console submission remains account-bound and must be completed by a human.

---

## 0. Fixed app identity

- App name and launcher name: **NeuroWiki**
- Package/application ID: **`ai.neurowiki.app`**
- Web origin: **`https://neurowiki.ai/`**
- Display mode: **standalone**
- Android version: name `1`, code `1`
- SDK: `compileSdkVersion 36`, `targetSdkVersion 36`, `minSdkVersion 21`

The package ID is permanent after the first Play release. It must continue to match `android/twa-manifest.json`, `android/app/build.gradle`, and `public/.well-known/assetlinks.json`.

## 1. Local tools and generated project

The project was generated with Bubblewrap CLI `1.24.1`. Bubblewrap's managed JDK 17 and Android SDK are under `~/.bubblewrap/`; the CLI is installed under `~/.local/bin/bubblewrap`.

To regenerate from the live web manifest:

```bash
export PATH="$HOME/.local/bin:$PATH"
bubblewrap init --manifest=https://neurowiki.ai/manifest.json --directory=android
```

Do not regenerate casually after manual Android changes. Bubblewrap `1.24.1` generated `targetSdkVersion 35`; this project intentionally sets it to `36` for the Google Play requirement effective August 31, 2026.

## 2. Upload signing key (local secret)

The upload key is intentionally excluded from git:

- Keystore: `.android-secrets/neurowiki-upload.jks`
- Password file: `.android-secrets/neurowiki-upload.password`
- Alias: `neurowiki-upload`
- Upload certificate SHA-256:
  `EF:93:24:B2:A4:94:54:F6:F5:BF:EB:7B:2A:EA:54:72:21:08:52:90:3F:E6:90:41:E8:B8:BF:C5:A3:D0:C9:5A`

Back up the keystore and password in the team's password manager or encrypted vault before the first upload. Losing the upload key complicates future releases. Never commit either file.

## 3. Build the signed APK and App Bundle

Run from the repository root:

```bash
cd android
export BUBBLEWRAP_KEYSTORE_PASSWORD="$(tr -d '\n' < ../.android-secrets/neurowiki-upload.password)"
export BUBBLEWRAP_KEY_PASSWORD="$BUBBLEWRAP_KEYSTORE_PASSWORD"
$HOME/.local/bin/bubblewrap build
unset BUBBLEWRAP_KEYSTORE_PASSWORD BUBBLEWRAP_KEY_PASSWORD
```

Expected ignored outputs:

- `android/app-release-signed.apk` for device testing
- `android/app-release-bundle.aab` for Google Play upload

The committed Gradle project can also be opened in Android Studio. PWABuilder remains a GUI fallback: package `https://neurowiki.ai` for Android, use package ID `ai.neurowiki.app`, and supply the same upload key. Do not create a second production upload identity unless the original key has been formally reset.

## 4. Digital Asset Links and deployment

`public/.well-known/assetlinks.json` currently contains the upload-key fingerprint plus a clearly labeled placeholder for the Play App Signing fingerprint.

1. Upload the `.aab` and enroll in **Play App Signing**.
2. In Play Console, open **App integrity -> App signing** and copy the **SHA-256 certificate fingerprint** under **App signing key certificate**. This is not the upload-key certificate shown above.
3. Replace `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT_AFTER_FIRST_UPLOAD` in `public/.well-known/assetlinks.json` with that fingerprint. Keep both fingerprints.
4. Redeploy the website.
5. Verify `https://neurowiki.ai/.well-known/assetlinks.json` returns raw JSON with an `application/json` content type, not the SPA HTML shell.

Until the Play App Signing fingerprint is deployed, a Play-installed build can fall back to a Custom Tab with a visible browser bar. The app remains usable, but TWA verification is incomplete.

## 5. Play Console: create and upload

1. Create app -> NeuroWiki, Free, default language English.
2. Enroll in Play App Signing and upload `android/app-release-bundle.aab` to an internal-testing release first.
3. Complete the store listing (Section A), Data Safety (Section B), Content rating (Section C), Target audience, and Health apps declaration (Section D).
4. Add the six phone screenshots from `docs/android/screenshots/`, use `public/icon-512.png` for the icon, and provide a required 1024x500 feature graphic.
5. Install the internal-test build on an Android device and confirm the app opens `neurowiki.ai` without browser chrome after the Play signing fingerprint is deployed.
6. Obtain compliance/legal sign-off on device classification and store claims before public submission.

---

## Section A — Store listing copy

- **App name (max 30):** `NeuroWiki`
- **Short description (max 80):**
  `Bedside neurology tools: stroke pathways, calculators, and trial reference.`
- **Full description (max 4000):**

```
NeuroWiki is a fast, evidence-based neurology reference for clinicians at the bedside: residents, fellows, and attendings.

WHAT'S INSIDE
- Dynamic clinical workflows: Stroke Code, endovascular thrombectomy (EVT) triage, late-window IV thrombolysis, seizure, headache, and intracerebral hemorrhage pathways.
- Medical calculators with guideline-linked interpretation: NIHSS, ASPECTS, ABCD2, HAS-BLED, GCS, ICH Score, and more.
- A trial reference layer with the landmark evidence behind each recommendation.
- Study Mode pearls for teaching and review.

BUILT FOR SPEED AND ACCURACY
Every clinical statement is tied to a source, aligned to current AHA/ASA and related guidelines, with a visible citation trail. The tool is designed to be used in seconds, not minutes.

IMPORTANT
NeuroWiki is a clinical reference and educational tool. It does not replace your clinical judgment, current guidelines, or your institution's protocols, and it is not a diagnostic device. Always verify before acting. Do not enter patient names, medical record numbers, or dates of birth.
```

- **Category:** Medical
- **Tags:** neurology, stroke, clinical reference, medical calculator
- **Contact email:** (your support email)
- **Privacy policy URL:** `https://neurowiki.ai/privacy` (confirm this route is live)

## Section B — Data Safety form (DRAFT — verify with compliance before submitting)

> This is a legal attestation. The answers below are a best-effort draft from the app's known behavior and MUST be confirmed by the privacy/compliance owner against the actual data flows before you submit.

- **Does the app collect or share user data?**
  - Analytics: **App interactions / diagnostics**, collected only with consent (opt-in in EU/UK/CH/BR, notice + opt-out elsewhere). Not linked to an identity. Not sold.
  - No account, no name/email login.
  - No health information is collected server-side: clinical inputs are processed on-device; the optional case-transfer feature is transient and end-to-end encrypted.
- **Data shared with third parties:** analytics provider (Google Analytics), anonymized, per the privacy policy.
- **Data encrypted in transit:** Yes (HTTPS).
- **Users can request deletion:** describe per privacy policy.
- **Confirm:** whether the geo/consent endpoint or case-transfer relay changes any of the above. Route this section through the `compliance-legal` review before submission.

## Section C — Content rating

Complete the IARC questionnaire honestly. Expected outcome: **Everyone**. Note the app contains references to medical procedures and medications in an **educational/professional** context (not instructions for misuse). No violence, sexual, or gambling content.

## Section D — Health apps declaration + regulatory note

- Play requires a **Health apps declaration** for medical apps. Declare NeuroWiki as a **clinician-facing medical reference / educational tool** (not a diagnostic device, no patient data storage).
- **Regulatory flag (do not skip):** a clinical decision-support tool can, depending on framing and jurisdiction, fall under medical-device rules (US FDA, EU MDR). NeuroWiki's reference/education positioning and disclaimers are intended to keep it out of device scope, but publishing to an app store is a public distribution act. Get a compliance/legal sign-off on device-classification and the store claims **before** the first release. Tracked as a `compliance-legal` item.

---

## What is still needed from you

1. Back up `.android-secrets/neurowiki-upload.jks` and its password in an encrypted team vault.
2. Create the Play Console app with permanent package ID `ai.neurowiki.app` and upload `android/app-release-bundle.aab` to internal testing.
3. Paste the Play App Signing SHA-256 fingerprint into `public/.well-known/assetlinks.json`, redeploy, and verify TWA full-screen behavior.
4. Complete the listing, declarations, feature graphic, and compliance/regulatory sign-off before publishing.

The Android project, upload-key fingerprint, web manifest, verification-file serving, listing copy, Data Safety draft, and phone screenshots are prepared in the repo.
