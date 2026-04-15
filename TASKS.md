# TASKS.md — NeuroWiki Task Ledger

## ACTIVE
(none)

## BLOCKED
(none)

## PENDING

### P1 — Critical
- [ ] [P1] Consolidate stroke page: delete StrokeBasicsDesktop, StrokeBasicsMobile, StrokeBasicsLayout, StrokeBasicsWorkflowV2 — one canonical StrokeBasics only
- [ ] [P1] Redesign stroke pathway UX — progressive disclosure, one step at a time
- [ ] [P1] Audit and fix all Copy to EMR outputs — one locked template per pathway
- [ ] [P1] Split TrialPageNew chunk (485 kB) — lazy-load trial data
- [ ] [P1] Fix E/M billing calculator UX — guided decision flow

### P2 — Stability
- [ ] [P2] Add error monitoring (Sentry free tier)
- [ ] [P2] Set up GitHub Actions CI — typecheck + build on every push to main
- [ ] [P2] Install Vitest and write smoke tests for all calculator pages
- [ ] [P2] Enforce design token usage — audit for arbitrary Tailwind values
- [ ] [P2] Add source field to every clinical claim in pathway data files

### P3 — Growth
- [ ] [P3] Trials page visual redesign — name, finding, key number, guideline implication in 10 seconds
- [ ] [P3] SEO audit — all route meta titles and descriptions
- [ ] [P3] Add JSON-LD structured data to all calculator and pathway pages
- [ ] [P3] Lazy-load all page chunks over 50 kB

### P4 — Future
- [ ] [P4] Auth system design
- [ ] [P4] Event-level analytics per pathway step
- [ ] [P4] Next.js migration assessment
- [ ] [P4] Mobile app evaluation

## CONFIRMED CLEAN
- [x] Production crash on all /trials/:id pages — fixed commits 2a39731, 2cc2bab, 6667ec0
  - legacyTrialCategories undefined → 'ivt' fallback
  - safeCategory guard in TrialPageNew
  - useMemo hooks order violation corrected
- [x] Secrets gitignore — commit 5367e66
  - .env.local, .env.development, .env.production added to .gitignore
  - All three untracked from git index (git rm --cached)
  - .env.example created with placeholder values
  - NOTE: keys already in history must be rotated separately (Turnstile, Resend)
