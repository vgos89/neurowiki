# Feedback System Setup

The floating Feedback button uses **Cloudflare Turnstile** and sends submissions via **Resend** to your email.

## 1. Cloudflare Turnstile

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com) → **Turnstile**
2. Add a site, choose **Invisible** or **Managed**
3. Copy the **Site Key** and **Secret Key**

## 2. Resend

1. Sign up at [resend.com](https://resend.com)
2. Create an API key
3. For production: add and verify a domain; use it in `RESEND_FROM`

## 3. Environment variables

Add to `.env` / `.env.local` and to your host (e.g. Netlify env):

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_TURNSTILE_SITE_KEY` | Yes | Turnstile site key (client) |
| `TURNSTILE_SECRET_KEY` | Yes | Turnstile secret (server only) |
| `RESEND_API_KEY` | Yes | Resend API key |
| `FEEDBACK_EMAIL` | Yes | Email address to receive feedback |
| `RESEND_FROM` | No | From address (default: `onboarding@resend.dev`; use a verified domain in production) |
| `VITE_FEEDBACK_API_URL` | No | Override API URL (default: `/.netlify/functions/feedback`) |

## 4. Netlify

- Functions live in `netlify/functions/feedback.js`
- Ensure `TURNSTILE_SECRET_KEY`, `RESEND_API_KEY`, and `FEEDBACK_EMAIL` are set in **Site settings → Environment variables**
- For local testing: `netlify dev` (requires [Netlify CLI](https://docs.netlify.com/cli/get-started/))

## 5. Other hosts

If you are not using Netlify:

1. Set `VITE_FEEDBACK_API_URL` to your feedback API URL.
2. Implement an endpoint that:
   - Accepts `POST` JSON: `{ type, message, email?, pageTitle, pageType, pagePath, turnstileToken, timestamp }`
   - Verifies the token with `https://challenges.cloudflare.com/turnstile/v0/siteverify`
   - Sends an email (e.g. via Resend, SendGrid, or Nodemailer) and returns `{ success: true }` or an error.
