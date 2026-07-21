# NeuroWiki — Android (Play Store) setup via Trusted Web Activity

> Approach: wrap the existing PWA (neurowiki.ai) as a **Trusted Web Activity (TWA)** using **PWABuilder**. The app runs the live site full-screen; content updates ship automatically with the website, no re-submission for content changes.

This doc is the operator checklist. Site-side prep (manifest + Digital Asset Links) is already done in the repo; the Play Console steps are yours (account-bound).

---

## 0. Prerequisites (already true)

- HTTPS on neurowiki.ai ✔
- Web manifest with `standalone` display, `scope: "/"`, 192/512 + maskable icons ✔ (`public/manifest.json`)
- Service worker ✔ (vite-plugin-pwa)
- Domain-verification file scaffolded ✔ (`public/.well-known/assetlinks.json`) — needs the signing fingerprint (Step 3)
- Google Play Console developer account ✔ (you have this)

## 1. Confirm the package name (PERMANENT once published)

Proposed: **`ai.neurowiki.app`** (reverse-domain of neurowiki.ai). This can never change after the first release, so confirm it before building. It must also match the `package_name` in `assetlinks.json`.

## 2. Build the Android package with PWABuilder

1. Go to https://www.pwabuilder.com and enter `https://neurowiki.ai`.
2. It scores the PWA and offers **"Package for stores" → Android**.
3. Options to set:
   - **Package ID:** `ai.neurowiki.app` (must match Step 1)
   - **App name:** NeuroWiki
   - **Launcher name:** NeuroWiki
   - **Display mode:** standalone (fullscreen)
   - **Signing key:** let PWABuilder **create a new signing key** (download and store the `.keystore` + passwords somewhere safe, or use Play App Signing in Step 4). PWABuilder shows you the **SHA-256 fingerprint** of this key — copy it, you need it in Step 3.
4. Download the generated `.zip`. It contains the **`.aab`** (upload to Play), the signing key, and a copy of the `assetlinks.json` it expects.

## 3. Fill in the domain-verification fingerprint, then deploy

1. Take the **SHA-256 fingerprint** from PWABuilder (Step 2) — or, better, from Play Console → **App → Setup → App signing** after you upload (Play App Signing re-signs, and the fingerprint that matters for verification is the **App signing key** one shown there).
2. Paste it into `public/.well-known/assetlinks.json`, replacing `REPLACE_WITH_PLAY_APP_SIGNING_SHA256_FINGERPRINT`. Multiple fingerprints are allowed (add both the upload key and the Play App Signing key to be safe).
3. Redeploy the site. Verify it serves as raw JSON:
   `https://neurowiki.ai/.well-known/assetlinks.json` must return the JSON (not the SPA HTML) with `content-type: application/json`.
   (Repo is already configured so Vercel serves this static file before the SPA rewrite.)
4. If the fingerprint and package name match, the app installs with **no URL bar**. A mismatch just shows a Chrome address bar; it does not break the app.

## 4. Play Console: create + upload

1. Create app → NeuroWiki, Free, default language English.
2. **App integrity / signing:** enroll in **Play App Signing** (recommended). Upload the `.aab`.
3. Fill the store listing (Section A below), Data Safety (Section B), Content rating (Section C), Target audience, and the **Health apps declaration** (Section D).
4. Add screenshots (in `docs/android/screenshots/` — 9:16 phone frames) and an icon (use `public/icon-512.png`). A 1024×500 **feature graphic** is required; generate from the logo/brand.
5. Submit for review. First review for a health app can take several days.

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

1. Confirm the package name `ai.neurowiki.app` (permanent).
2. Run PWABuilder to produce the `.aab` and get the signing SHA-256 fingerprint.
3. Send me the fingerprint so I can drop it into `assetlinks.json` and deploy (or you paste + redeploy).
4. Decide on the compliance/regulatory sign-off (Section D) before publishing.

Everything else (manifest, verification-file serving, listing copy, Data Safety draft, screenshots) is prepared in the repo.
