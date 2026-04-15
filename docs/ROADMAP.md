# NeuroWiki — Product Roadmap

## Phase 1 — Foundation (current)
Fix what is broken today. Lock the design system. One canonical version of every page.

- [x] Rotate secrets out of committed files
- [ ] Consolidate stroke page files (5 → 1)
- [ ] Redesign stroke pathway UX (progressive disclosure)
- [ ] Fix all Copy to EMR outputs
- [ ] Split TrialPageNew bundle
- [ ] Fix E/M billing calculator UX
- [ ] Enforce design token system

## Phase 2 — Stability
No more blind deploys. Tests and monitoring before any new feature.

- [ ] Error monitoring live (Sentry)
- [ ] CI/CD via GitHub Actions
- [ ] Vitest smoke tests covering all calculators
- [ ] Source audit — every clinical claim has a traceable reference
- [ ] Design token audit — zero arbitrary values

## Phase 3 — Scale
Ready for thousands of users.

- [ ] Trials page visual redesign
- [ ] SEO audit and structured data on all pages
- [ ] Performance budget enforced in CI (no chunk over 150 kB)
- [ ] Evaluate Next.js migration

## Phase 4 — Moat
Features competitors cannot copy quickly.

- [ ] Auth and user accounts
- [ ] Saved pathways and personalized EMR templates
- [ ] Residency program group accounts
- [ ] Event-level analytics per pathway step
- [ ] Mobile app (iOS first)
