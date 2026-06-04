# ADR 2026-06-03 — Remove Cloudflare Turnstile from feedback; replace with honeypot + same-origin guard

**Status:** accepted
**Date:** 2026-06-03
**Class:** D (security surface — `api/**`, removes an anti-abuse control)
**Deciders:** V (product owner), system-architect, security-engineer

## Context

The page-level feedback form (`src/components/FeedbackModal.tsx` → `POST /api/feedback`)
gated submission behind a Cloudflare Turnstile CAPTCHA. The Cloudflare account
backing Turnstile was deleted. Consequences observed in code:

- Frontend: the submit button was disabled until the Turnstile widget produced a
  token (`disabled={... || !turnstileToken}`, label stuck on "Verifying…"), and
  `handleSubmit` early-returned without a token. With the account gone the widget
  cannot mint a token, so **the button is permanently disabled — no clinician can
  submit feedback in production.**
- Backend: `api/feedback.ts` required `TURNSTILE_SECRET_KEY` (500 if missing) and
  verified the token against `challenges.cloudflare.com/siteverify` (400 on
  failure). Both paths now fail.

Removing Turnstile restores the form but turns `POST /api/feedback` into an
unauthenticated endpoint that sends email via the paid Resend API to a
server-fixed recipient — a spam / quota-burn vector that needs a replacement
control.

## Decision

Remove Turnstile from both the modal and the serverless handler. Replace it with
two lightweight, **no-third-party-dependency** controls, chosen by V over (a) no
replacement and (b) swapping in another CAPTCHA provider:

1. **Honeypot** — a hidden, off-screen, non-tabbable, `aria-hidden` input
   (`company`). Real users never see it; naive bots auto-fill it. A non-empty
   value makes the server return `200 {success:true}` **without sending email**
   (silent drop, so a bot learns nothing).
2. **Same-origin guard** — the handler resolves the request host from `Origin`
   (fallback `Referer`) and accepts only an allowlist
   (`neurowiki.ai`, `www.neurowiki.ai`, `localhost`, `127.0.0.1`). Missing/
   unparseable → **fail closed** (403).

The guards are pure, exported helper functions, unit-tested in
`src/__tests__/feedbackGuards.test.ts` (17 cases).

A pre-existing weakness was hardened in the same change: every user/context field
is now **HTML-escaped** before interpolation into the feedback email body, and the
optional reply-`email` is validated (CR/LF rejected, basic shape, ≤254 chars).
Turnstile previously masked the reachability of this email-injection sink.

## Consequences

- Feedback submission works again with no user-visible CAPTCHA step.
- `api/feedback.ts` becomes the **only** `api/` handler enforcing a same-origin
  allowlist; the others (`npi.ts`, `seo-weekly.ts`) keep `Access-Control-Allow-Origin: *`.
  This divergence is **deliberate** — feedback is the only POST-with-side-effect
  (email) endpoint; the others are read proxies / cron. **Do not "consistency-fix"
  feedback back to `*`.** The CORS `Allow-Origin` is now computed once and shared
  by the OPTIONS preflight and the POST response so they never disagree.
- Residual risk (accepted): the same-origin guard stops bots and casual
  cross-site abuse but **not** a determined scripted attacker who spoofs `Origin`
  outside a browser. Mitigated by the server-fixed recipient (no open relay).

## Alternatives considered

- **No replacement** — fastest, but leaves the email sink fully open to bots.
- **Different CAPTCHA provider (hCaptcha/reCAPTCHA)** — reintroduces a third-party
  dependency and account to maintain; counter to the move away from Cloudflare.

## Follow-ups (parked, non-blocking)

1. **Server-side rate-limiting** on `POST /api/feedback` — needs shared state
   (Vercel KV); deferred as its own change.
2. **Delete unused env vars** `TURNSTILE_SECRET_KEY` and `VITE_TURNSTILE_SITE_KEY`
   from the Vercel project. **Deploy-ordering:** safe to delete only *after* this
   code ships — the old handler 500s without `TURNSTILE_SECRET_KEY`; the new one
   never reads it. (Config change, not code.)
3. **Shared CORS/origin helper** across `api/` handlers — a deliberate 4-file
   refactor, out of scope here.

## Rollback

`git revert <commit>` — single commit, four files (`api/feedback.ts`,
`src/components/FeedbackModal.tsx`, the new test, docs). Reverting restores the
Turnstile code; the form would return to its broken state, so rollback is only
appropriate if the new guards themselves regress.
