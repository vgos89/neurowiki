# NeuroWiki — Product Roadmap

## Facelift Legend
Every UI change follows this exact layer order. No layer starts until the previous is complete.

### Layer 1 — Foundation (COMPLETE)
The design system, brand, and agent infrastructure.
- [x] Cobalt design tokens (neuro-* values updated to #1746A2 scale)
- [x] Brain+circuit logo — nav, favicon, PWA manifest
- [x] System files — AGENTS.md, TASKS.md, ROADMAP.md, NEUROWIKI.md
- [x] Mobile+desktop QA checklist in AGENTS.md
- [x] Secrets removed from committed files

### Layer 2 — Stroke Pathway (IN PROGRESS)
The most important page. Must look exactly like the approved mockup before anything else.

Approved mockup spec (locked — all future stroke work matches this):
- Pure white page background, no grey
- Page header: "Stroke Code" title left, Code/Study pill toggle right — no subtitle clutter
- Quick Reference accordion removed from above tabs — moved to Study mode only
- Tab bar: Vitals | Imaging | Summary — sticky below header, cobalt active underline
- Step1 Vitals: LKW time large + Within 4.5h pill + Change link in one row; BP+Glucose as two colored side-by-side cards; NIHSS large score + severity + LVO probability + Calc button; Weight input + tPA/TNK colored pill cards; cobalt CTA full width
- Step2 Imaging: clean CT result radio cards, treatment decision cards
- Step3 Treatment: summary display, cobalt Copy EMR button
- All modals: white header, clean body, cobalt primary action, red/amber for danger actions
- Emergency strip: three compact buttons min-h-44px at bottom of every step

Progress:
- [x] Tab navigation (Vitals/Imaging/Summary replacing card grid)
- [x] Step1 visual rebuild — section cards, colored vitals, NIHSS row, dosing pills, cobalt CTA
- [x] All purple/violet → cobalt across stroke components
- [x] Compact emergency strip
- [x] Page header fix — remove subtitle clutter, clean Code/Study toggle, remove Quick Reference from code mode — commit c379146
- [ ] Step2 visual rebuild
- [ ] Step3 visual rebuild
- [x] Step4 visual polish — cobalt buttons, evidence badge tokens, shadow removed — commit 684bf89
- [ ] All stroke modals visual overhaul

### Layer 3 — Component Library (BLOCKED until Layer 2 complete)
Builds the shared UI primitives that make every future page update fast.
- [ ] src/components/ui/Button.tsx — primary, secondary, danger, ghost variants
- [ ] src/components/ui/Card.tsx — standard white card with border
- [ ] src/components/ui/Modal.tsx — standard modal shell, header pattern, cobalt/red actions
- [ ] src/components/ui/Badge.tsx — category labels, status pills
- [ ] src/components/ui/SectionHeader.tsx — consistent page section headers

### Layer 4 — Page by Page (BLOCKED until Layer 3 complete)
Systematic swap of custom elements for shared components. No page rebuilds from scratch — component swaps only.
- [ ] Layout.tsx — swap to use ui/ components
- [ ] Home.tsx — quick access cards, landmarks section
- [ ] TrialsPage.tsx + TrialPageNew.tsx — trial cards, visual redesign (name, finding, key number, guideline implication in 10 seconds)
- [ ] Calculators.tsx — calculator card grid
- [ ] EmBillingCalculator.tsx — guided decision flow UX rebuild
- [ ] ResidentToolkit.tsx — guide card grid
- [ ] All guide/* pages — consistent article layout
- [ ] StatusEpilepticusPathway.tsx — same visual treatment as stroke
- [ ] MigrainePathway.tsx — same visual treatment as stroke
- [ ] ExtendedIVTPathway.tsx — same visual treatment as stroke

### Layer 5 — Polish (BLOCKED until Layer 4 complete)
- [ ] Typography audit — consistent scale across all pages
- [ ] Spacing consistency audit — no arbitrary values remaining
- [ ] Full mobile QA pass — every page at 375px
- [ ] Full desktop QA pass — every page at 1280px
- [ ] Performance audit — no chunk over 150kb gzipped
- [ ] SEO audit — all route meta titles and descriptions
- [ ] JSON-LD structured data on all calculator and pathway pages

---

## Phase 2 — Stability (after Layer 5)
- [ ] Error monitoring (Sentry free tier)
- [ ] GitHub Actions CI — typecheck + build on every push
- [ ] Vitest smoke tests covering all calculators
- [ ] Source audit — every clinical claim has a traceable reference

## Phase 3 — Scale
- [ ] Next.js migration assessment for true SSR
- [ ] Performance budget enforced in CI
- [ ] Trials page SEO — server-rendered content

## Phase 4 — Moat
- [ ] Auth and user accounts
- [ ] Saved pathways and personalized EMR templates
- [ ] Residency program group accounts
- [ ] Event-level analytics per pathway step
- [ ] Mobile app (iOS first)
