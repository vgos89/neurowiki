<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# NeuroWiki

Neurology calculators, clinical pathways, and trial summaries built with Vite, React, and TypeScript.

## Run Locally

**Prerequisites:** Node.js

1. Install dependencies:
   `npm install`
2. Start the app:
   `npm run dev`

## Deploy on Vercel

Build output is `dist`, and API routes live under [`api/`](/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/api).

Set these environment variables in Vercel if you want the feedback form enabled:

- `TURNSTILE_SECRET_KEY`
- `RESEND_API_KEY`
- `FEEDBACK_EMAIL`
- `VITE_TURNSTILE_SITE_KEY`

Optional:

- `VITE_FEEDBACK_API_URL` if you want the frontend to post somewhere other than `/api/feedback`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run build:analyze`
- `npm run preview`
- `npm run typecheck`
