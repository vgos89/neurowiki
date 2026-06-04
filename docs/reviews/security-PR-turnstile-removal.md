# Security review — PR #turnstile-removal

**Decision:** approve-with-conditions (all blocking conditions addressed)
**Reviewer:** security-engineer
**Date:** 2026-06-03
**Surface:** `api/feedback.ts` (api/**), `src/components/FeedbackModal.tsx`

## Threat model

Attacker: unauthenticated internet client (casual cross-site form abuser →
scripted attacker with curl). Asset: the paid Resend email quota and the
server-fixed `FEEDBACK_EMAIL` inbox (spam / phishing-content target, and content
injection into the email reader's client). Recipient is fixed server-side, so this
is quota-burn + inbox pollution + content injection — **not** an open relay or
data-exfil surface. Boundary: `POST /api/feedback`.

## Findings

1. **Honeypot + same-origin adequacy.** Adequate as the chosen baseline for a
   low-traffic bedside tool with a fixed recipient. Honest residual risk: both
   controls are bypassable by a scripted attacker who omits the trap field and
   spoofs `Origin: https://neurowiki.ai`. They stop bots and casual cross-site
   POSTs — the actual current threat. Rate-limiting is **not** a blocker given the
   fixed recipient caps blast radius and no shared-KV state exists on Vercel today;
   accepted as a parked follow-up.
2. **Origin/Referer correctness.** Design is correct: Origin is hard to spoof from
   a browser, trivial from a script — documented. Fail-closed on missing
   Origin **and** Referer is implemented; host parsed via `new URL()` in
   try/catch; unparseable → reject.
3. **CORS `*`.** Tightened to the allowlist (echoes the request Origin only when
   allow-listed). Defense-in-depth; not load-bearing once the server-side guard
   exists.
4. **HTML/email injection** (the real gate). With Turnstile gone, unauthenticated
   reach to the HTML-email sink widens. Addressed: all interpolated fields
   (`type`, `message`, `email`, `pageTitle`, `pageType`, `pagePath`, `timestamp`,
   subject) are HTML-escaped; the `email` field is additionally validated.
5. **Honeypot silent-200.** Returning `200 {success:true}` without emailing is
   correct — denies the bot the signal that the trap exists. Kept.

## Conditions and disposition

- **MUST-1 — HTML-encode every interpolated field before insertion into the email
  body.** ✅ Addressed — `htmlEscape()` applied to `type`/`message`/`pageTitle`/
  `pageType`/`pagePath`/`timestamp` and the subject line.
- **MUST-2 — Validate/neutralize the `email` field** (reject CR/LF, basic shape;
  encode in `mailto:` href and link text). ✅ Addressed — `isValidOptionalEmail()`
  rejects CR/LF, enforces basic shape and ≤254 chars; `email` is `htmlEscape`d in
  both href and text; invalid → 400.
- **MUST-3 — Deny on missing Origin AND missing Referer (fail closed); localhost
  dev allowance explicit; parse via `new URL()` try/catch.** ✅ Addressed —
  `resolveRequestHost()` returns null when both absent → `isAllowedFeedbackHost`
  returns false → 403; `hostFromUrl()` uses `new URL()` in try/catch; `localhost`/
  `127.0.0.1` are on the allowlist.
- **SHOULD-1 — Tighten CORS to the allowlist.** ✅ Done.
- **SHOULD-2 — Honeypot inert to AT (`aria-hidden`, `tabIndex={-1}`,
  `autocomplete="off"`, excluded from focus trap); remove dead `turnstile` global
  + script injector.** ✅ Done — honeypot wrapper is `aria-hidden`, input is
  `tabIndex={-1}` + `autoComplete="off"`; all Turnstile globals, the script
  injector, and the loader effect are removed (no third-party script loads).

## Parked follow-ups (non-blocking)

- Server-side rate-limiting (needs Vercel KV).
- Delete unused env vars `TURNSTILE_SECRET_KEY` / `VITE_TURNSTILE_SITE_KEY`.
  **Deploy-ordering:** delete only *after* this code ships — the new handler no
  longer reads `TURNSTILE_SECRET_KEY`, so there is no remaining 500-on-missing
  coupling, but do not delete before the deploy lands.

## Rationale

A broken anti-abuse control is being replaced with a proportionate one, and a
pre-existing email-injection sink is closed in the same change. All MUST conditions
are satisfied in the committed code. Residual scripted-attacker risk is explicitly
accepted given the fixed recipient and the low-traffic profile.
