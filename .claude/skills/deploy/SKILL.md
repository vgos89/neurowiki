---
name: deploy
description: NeuroWiki deployment runbook — Vercel auto-deploy on push to main, preview deployments, environment variables, rollback procedure, post-deploy smoke test checklist. Load when deploying, releasing, or investigating a production incident.
---

# Deploy Runbook — NeuroWiki

## Architecture

**Host:** Vercel (static build)  
**Build command:** `npm run build` (Vite, output: `dist/`)  
**Framework preset:** Vite  
**Deployment model:** Push to `main` → automatic Vercel build → live within ~60–90 seconds  
**No staging environment** — main is production. Preview deployments available per PR.

## Deployment trigger

```bash
git push   # pushes to origin/main → Vercel webhook fires → build → deploy
```

Claude Code runs this after every quality gate pass. V never runs terminal commands.

## Environment variables (set in Vercel dashboard, not in code)

| Var | Purpose | Set where |
|---|---|---|
| `VITE_GA_MEASUREMENT_ID` | Google Analytics (G-XXXXXXXX) | Vercel → Settings → Environment Variables |
| `VITE_RESEND_API_KEY` | Feedback email via Resend | Vercel → Environment Variables |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile (pending removal — P1) | Vercel → Environment Variables |

**Rules:**
- Never commit `.env` files
- All client-side vars must be prefixed `VITE_` to be exposed by Vite
- Server-side vars (Vercel Edge Functions, if any) do NOT need `VITE_` prefix

## Preview deployments

Every PR creates a Vercel preview URL automatically. Format: `neurowiki-git-<branch>-<team>.vercel.app`.

**Use for:** visual QA before merge, stakeholder review, accessibility testing at real URL.

## Post-deploy smoke test checklist

After every production deploy (run mentally or via browser):

- [ ] Home page loads (`/`) — hero, scenario pills, recents section
- [ ] Stroke Code pathway loads (`/pathways/stroke-code`) — steps 1–4 render
- [ ] NIHSS calculator loads (`/calculators/nihss`) — score updates, drawer appears on completion
- [ ] GCS calculator loads (`/calculators/gcs`) — score updates, severity colors correct
- [ ] Trials page loads (`/trials`) — list renders, search works
- [ ] One trial detail page loads (`/trials/ninds-trial`) — data displays
- [ ] Cookie consent banner fires on first visit (clear localStorage first)
- [ ] Dark mode toggle works on mobile (375px viewport)
- [ ] No `console.error` in browser dev tools on any of the above

## Rollback procedure

**When:** broken deploy is live, cannot be fixed with a hotfix commit.

```bash
# Step 1: identify the last good commit
git log --oneline -10

# Step 2: revert (creates a new commit, does not rewrite history)
git revert <broken-commit-sha>

# Step 3: push — Vercel auto-deploys the revert
git push
```

**If revert is not clean:** Vercel dashboard → Deployments → select last good deployment → "Promote to Production." This bypasses git entirely and makes the prior build live immediately.

**Post-rollback:** create a `## POST-MORTEMS` entry in TASKS.md within the same session.

## Vercel dashboard access

URL: https://vercel.com/vgos89s-projects/neurowiki  
Log in with GitHub account. Build logs visible under "Deployments."

## Build failure diagnosis

If `npm run build` fails locally:
1. Run `npx tsc --noEmit` first — TypeScript errors are the most common cause
2. Run `npm run build` — Vite errors show file + line
3. Check for circular imports (Vite will say `Cannot resolve`)
4. Check chunk size warnings — not failures, but flag if any chunk exceeds 1MB

## What Claude Code never does

- Never push with `--force` (only V can approve force push, and only for history cleanup)
- Never commit directly to a production-only branch (all work on `main`)
- Never skip quality gates before push
- Never manually trigger Vercel builds (always go through git push)
