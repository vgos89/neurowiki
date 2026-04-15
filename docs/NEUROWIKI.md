# NeuroWiki — Master Context Document

## What This App Is
NeuroWiki.ai is a bedside neurology decision support tool for neurologists — attendings, residents, and fellows. It is not a study app. It is not a wiki. It is a clinical workflow tool used during active patient care.

The core insight: 80% of a neurologist's daily decisions are routine but time-pressured. NeuroWiki handles those 80% with speed and accuracy.

## Users
- Neurology residents (primary)
- Neurology fellows
- Attending neurologists
- No login required (free, open access)

## The Six Features That Must Be Perfect
1. Stroke workflow — progressive decision pathway, not a reference page
2. Status epilepticus pathway
3. Migraine pathway
4. 2026 AHA Guideline pathway
5. Long window IVT (Extended IVT) pathway
6. E/M billing calculator — guided decision flow

## Tech Stack
- React 19 + TypeScript
- Vite 6, React Router 7, Tailwind CSS 4
- Hosting: Vercel
- Serverless: api/feedback.ts, api/npi.ts
- No database — all content is static TypeScript data files
- Pre-rendering: react-snap (40 routes)

## Key Files
- src/App.tsx — route definitions
- src/data/ — all clinical content
- src/pages/ — one file per route
- src/components/ — shared components
- src/seo/routeMeta.ts — SEO titles and descriptions
- src/config/routeManifest.ts — validated route list
- api/ — Vercel serverless functions
- CLAUDE.md — design system rules (colors, typography, z-index)

## Design Direction
- Clean minimal white, premium, fast
- Benchmark: would a tired resident understand this in under 3 seconds?
- No dark gradients, no heavy shadows, no cluttered layouts
- Use only tokens defined in CLAUDE.md

## Critical Never-Do Rules
- Never rebuild a component that already exists
- Never add clinical content without a source
- Never modify Copy-to-EMR templates without PM Agent approval
- Never commit secrets or API keys
- Never push with a failing build or typecheck
- Never add a new page file for a route that already has one
- Never use arbitrary Tailwind values
- Never load trialData.ts on a page that does not display trials

## Architecture Rules
- All clinical content belongs in src/data/ — not hardcoded in components
- One page file per route — no duplicate page implementations
- Lazy-load any chunk over 50 kB
- Every new page must be registered in src/config/routeManifest.ts and src/seo/routeMeta.ts

## Copy-to-EMR Rule
Copy-to-EMR output templates are locked once approved. No agent may modify EMR output format during unrelated work.

## Content Vetting Rule
All clinical content must be traceable to a named guideline with year. No content ships without a source field populated.

## Fix History (never regress these)
- [2025-04-14] Trials production crash — legacyTrialCategories undefined category fixed with ?? 'ivt' fallback; safeCategory guard added to TrialPageNew; useMemo hooks order corrected — commits 2a39731, 2cc2bab, 6667ec0
- ELAN pathway fix — commit 92e0a84
- Duplicate fix — commit 35325c8

## Performance Targets
- TrialPageNew: under 150 kB gzipped (currently at limit — do not increase)
- Any chunk regression over 20% must be flagged before commit

## Environment Variables (Vercel dashboard only — never in committed files)
- VITE_SHOW_DRAFTS
- VITE_TURNSTILE_SITE_KEY
- TURNSTILE_SECRET_KEY
- RESEND_API_KEY
- FEEDBACK_EMAIL

## Manual Test Checklist (run before every production deploy)
- [ ] Home page loads under 2 seconds
- [ ] Stroke pathway loads and all steps are clickable
- [ ] NIHSS calculator scores correctly
- [ ] Copy to EMR produces correct output on stroke pathway
- [ ] E/M billing calculator reaches a result
- [ ] Trials page loads — check on slow connection
- [ ] /trials/extend-trial loads without error
- [ ] Feedback button submits without error
- [ ] No console errors on any of the above
