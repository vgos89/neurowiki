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

## Approved Mockup Spec (stroke pathway — locked)
This is the visual reference for all stroke pathway work. Claude Code must match this spec exactly.

Page structure top to bottom:
1. Nav bar — NeuroWiki logo left, search right (from Layout.tsx — do not touch)
2. Page header — "Stroke Code" title left, Code/Study pill toggle right. No subtitle. No "3 sections" text.
3. Tab bar — Vitals | Imaging | Summary. Sticky. Cobalt active underline. Freely tappable.
4. Step content — white cards with border-slate-100, rounded-xl, p-4, space-y-3
5. Emergency strip — always visible at bottom. Three compact buttons min-h-44px.

Step1 Vitals spec:
- LKW: time large (text-2xl font-semibold), Within 4.5h pill (emerald), Change link — all in one row
- LKW Unknown checkbox below
- BP + Glucose: grid-cols-2, each a colored card. BP red when systolic>185 or diastolic>110. Glucose amber when <50, red when >400, green when normal and entered.
- NIHSS: large score number left (text-4xl), severity label + LVO probability text right, input + Calc button far right
- Weight + Dosing: weight input + unit select, then grid-cols-2 tPA pill (neuro-50/neuro-700) and TNK pill (emerald-50/emerald-700) when weight entered
- Check eligibility: cobalt-tinted card when within window
- CTA: full-width bg-neuro-500, min-h-52px

Color rules for all pages:
- Page background: bg-white
- Section cards: bg-white border border-slate-100 rounded-xl p-4
- Primary action: bg-neuro-500 hover:bg-neuro-600 text-white
- Danger: border-red-200 bg-red-50 text-red-700
- Warning: border-amber-200 bg-amber-50 text-amber-700
- Success/safe: border-emerald-200 bg-emerald-50 text-emerald-700
- Info: border-neuro-200 bg-neuro-50 text-neuro-700

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

## Trial Data Schema (src/data/trialData.ts)
**Wave 3 schema (as of 2026-05-08):**
- **`primaryDesign`** (union): 'binary-superiority' | 'binary-noninferiority' | 'ordinal-shift' | 'bayesian-adaptive' | 'dose-finding-safety' | 'estimation-strategy' | 'single-arm-registry' — statistical framework for primary analysis
- **`primaryResult`** (union): 'met' | 'not-met' | 'inconclusive' | 'futility-stopped' | 'harm-stopped' | 'terminated-administrative' | 'noninferiority-established' | 'noninferiority-not-established' | 'safety-threshold-met' — outcome classification
- **`harmSignal?: string`** (optional): one-line safety-tradeoff annotation (e.g., "excess mortality in high-risk subgroup"); distinct from `safetyBrief` (summary) and `safetyData` (detail)
- **`archetypeId`** (string): 'A' | 'B' | 'G' — layout selector (Archetype A: binary outcome with DeltaBand; B: ordinal mRS shift with Grotta Bar; G: single-arm registry with benchmark threshold)
- **`trialResult`** (legacy, deprecated): 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HARM' — legacy classification being phased out in favor of primaryDesign + primaryResult
- **`specialDesign`** (legacy, deprecated): estimation-trial flag; use primaryDesign='estimation-strategy' instead

**Legal pairings:**
- `primaryDesign='noninferiority'` pairs with `primaryResult='noninferiority-established' | 'noninferiority-not-established'` only
- `primaryDesign='single-arm-registry'` pairs with `primaryResult='safety-threshold-met'` only (plus safety metadata: `benchmark`, `observedEventRate`, `historicalContext`)
- `primaryDesign='bayesian-adaptive'` pairs with `primaryResult='met'` only (Bayesian superiority trials use posterior probability decision rules, not frequentist p-values)

**Wave 3 renderer logic (TrialPageNew.tsx):**
- NNT card suppression (`suppressNNT` flag) targets: ordinal-shift, noninferiority, bayesian-adaptive, dose-finding-safety, estimation-strategy, single-arm-registry — card omitted, prose surfaces unaffected
- Display labels: harm-stopped → "stopped for harm" (distinct visual state); noninferiority-established/not-established → explicit NI qualifier (not generic positive/negative)
- Composition surfaces: Bayesian annotation on NNT must attribute correctly to posterior probability decision rule, not NNT derivation source

**Wave 3 follow-ups (non-blocking):**
- Vocabulary consolidation: four parallel classifiers (trialResult, specialDesign, primaryDesign+primaryResult, archetypeId) need consolidation ADR; no schema changes required, but renderer must pick one canonical path
- `classifyTrial.ts` extraction: classifier logic to move from TrialPageNew.tsx stats useMemo to `src/lib/trials/classifyTrial.ts` before Wave 4 component work
- EXTEND canary migration: decide whether legacy page route to schema-driven path or formal retirement

## Copy-to-EMR Rule
Copy-to-EMR output templates are locked once approved. No agent may modify EMR output format during unrelated work.

## Content Vetting Rule
All clinical content must be traceable to a named guideline with year. No content ships without a source field populated.

## Brand Colors
- Primary: `#1746A2` (neuro-500 — cobalt blue)
- Light accent: `#4A7FE5` (neuro-400)
- Fill / tint: `#EEF2FF` (neuro-50)
- Dark: `#06143D` (neuro-900)

## Logo Assets (public/)
- `favicon-16.png`, `favicon-32.png` — browser tab favicon
- `apple-touch-icon.png` — iOS home screen (192px source)
- `icon-192.png` — PWA icon
- `icon-512.png` — PWA icon + schema logo
- `icon-1024.png` — full resolution master
- `logo-lockup.png` — horizontal wordmark (icon + "NeuroWiki" text)
- Inline SVG logo mark used in Layout.tsx (desktop sidebar + mobile header) — brain+circuit mark, cobalt background `#1746A2`, white paths

## Fix History (never regress these)
- [2026-05-08] Wave 3 Batch 2 — schema-driven NNT suppression + result-type labeling — commit 3d571ac
  - Files: src/pages/trials/TrialPageNew.tsx, docs/reviews/arch-wave3-batch2-renderer.md, docs/reviews/clinical-wave3-batch2-renderer.md
  - Replaced p-value string-sniffing heuristics with `primaryDesign`/`primaryResult` schema-driven classification
  - NNT card suppression via suppressNNT flag (ordinal-shift, NI, bayesian-NI, dose-finding-safety, estimation-strategy, single-arm-registry)
  - New display branches: isHarmStopped (🛑 STOPPED FOR HARM), isNIFailed (❌ DID NOT ESTABLISH NON-INFERIORITY), isNIEstablished (✓ NON-INFERIORITY ESTABLISHED), isBayesianSuperiorityTrial (Bayesian annotation)
  - Clinical review: approve-with-conditions (5 mandatory conditions resolved pre-merge: harm-stopped distinct state, NI qualifier labels, Bayesian annotation wording, prose suppression targets card only, NOR-TEST data consistency fix)
- [2026-05-08] Batch 3 Wave 1 — schema extensions for estimation-strategy + single-arm-registry — commit 657f004
  - Files: src/data/trialData.ts, docs/reviews/arch-batch3-wave1-schema-extensions.md
  - `primaryDesign` union: +`'estimation-strategy'` (ELAN pattern), +`'single-arm-registry'` (WEAVE pattern)
  - `primaryResult` union: +`'safety-threshold-met'`; secondaryDesign/secondaryResult parity additions
  - New field: `harmSignal?: string` — one-line safety-tradeoff annotation; distinct from safetyBrief/safetyData
  - JSDoc: legal pairing table, Option Y suppression list, safety-prose-field distinction documented
  - Arch review: approve-with-conditions (vocabulary-consolidation ADR deferred as post-merge task)
- [2026-04-16] Calculator design system — cobalt tokens across 7 calculators — commit cff25ed
  - Files: Abcd2ScoreCalculator, GlasgowComaScaleCalculator, HasBledScoreCalculator, HeidelbergBleedingCalculator, RopeScoreCalculator, IchScoreCalculator, AspectScoreCalculator
  - Selected button: border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-800 → border-neuro-500 bg-neuro-50 text-neuro-700
  - Checkbox has-[:checked]: blue-500/blue-50 → neuro-500/neuro-50
  - Input elements: text-blue-600 focus:ring-blue-500 → text-neuro-600 focus:ring-neuro-500
  - Copy button: bg-slate-900 rounded-lg font-medium → bg-neuro-500 rounded-xl font-semibold
  - Interpretation card: border-2 border-slate-200 bg-slate-50/50 → border border-slate-100 bg-white
  - Citation links: text-blue-600 dark:text-blue-400 → text-neuro-600
  - 51 total replacements, zero blue-* remaining, zero logic changes
- [2026-04-16] NIHSS and EVT modal shells — commit dd5bddc
  - ThrombectomyPathwayModal: Zap icon badge removed from header, title "EVT / Thrombectomy" (text-base font-semibold) + subtitle "AHA/ASA 2019 · thrombectomy eligibility" (text-xs text-slate-400), close button → w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200, Zap removed from lucide import
  - StrokeBasicsWorkflowV2 NIHSS modal shell: close button → w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center
  - NihssItemCard: selected pill bg-slate-900 → bg-neuro-500 (cobalt active state matches design system)
- [2026-04-16] ThrombectomyPathwayModal + NihssCalculatorEmbed design system polish — commit 341d9a4
  - ThrombectomyModal: dark:bg-gray-900→dark:bg-slate-900, shadow-2xl removed, custom boxShadow '0 8px 40px rgba(0,0,0,0.18)', sticky header bg-white/95 backdrop-blur-sm shadow-sm → bg-white
  - NihssEmbed: X added to lucide imports, shadow-sm removed from sticky control bar, raw × char → circular X icon button (w-6 h-6 rounded-full bg-slate-100, aria-label="Close", <X w-3 h-3 text-slate-500>), CTA text → "Apply score — {total}"
- [2026-04-16] OrolingualEdemaProtocolModal + HemorrhageProtocolModal redesign — Stripe/Apple pattern: max-w-lg, custom shadow, circular close, no header divider, left-border callouts, cobalt numbered steps, cobalt Copy to EMR rounded-xl, unused icon imports removed — commit 10b6063
- [2026-04-16] TpaReversalProtocolModal redesign — Stripe/Apple pattern: max-w-lg, clean header, left-border callout, cobalt 01–07 numbered steps, cobalt CTA, AlertTriangle removed — commit baecb1c
- [2026-04-16] CodeModeStep4 design system polish — evidence badges (green→emerald-100/800, blue→neuro-50/700, yellow→amber-50/700, red→slate-100/600), Copy to EMR cobalt (slate-700→neuro-500), Save Orders cobalt (purple-606→neuro-500), shadow-lg removed, rounded-xl on both buttons, min-h-[44px] — commit 684bf89
- [2026-04-15] CodeModeStep3 visual rebuild — Code Summary card (emerald dot + duration), Clinical Summary grid-cols-2 (LKW/NIHSS/BP/Glucose/Weight/CT/Treatment, hasStep1+hasStep2 gated), GWTG Milestones (emerald/amber rounded-full pills, conditional), EMR Note (bg-slate-50 pre max-h-48, cobalt Copy to EMR + white Print), generateEMRNote() untouched — commit ad51b4d
- [2026-04-15] LKW time nowrap — whitespace-nowrap prevents time wrapping to two lines (CodeModeStep1.tsx) — commit 043556a
- [2026-04-15] Tab focus ring fix — focus:outline-none on stroke tab buttons (StrokeBasicsWorkflowV2.tsx) — commit 043556a
- [2026-04-15] Global white background — Layout.tsx bg-slate-50 → bg-white, all pages now pure white — commit 043556a
- [2026-04-15] CodeModeStep2 visual rebuild — card radio selectors, cobalt CTA, LVO pill buttons, compact summary bar — commit 27cf421
- [2026-04-15] Three targeted fixes — global bg-white (Layout.tsx main), tab focus:outline-none (StrokeBasicsWorkflowV2.tsx), LKW whitespace-nowrap (CodeModeStep1.tsx) — commit 043556a
- [2026-04-15] CodeModeStep2 visual rebuild — custom button-based radio cards (CT result + treatment decision), cobalt dot indicators, dose sub-lines, three LVO pill buttons, amber EVT Pathway button, cobalt Save CTA (was emerald), Brain icon removed — commit 27cf421
- [2026-04-15] Content area top margin — card-content-panel mt-3 → mt-16 (64px = sticky visual offset); scrollMarginTop 163px; content panel now starts exactly at sticky wrapper bottom (viewport y=163) — commit f2f4b8e
- [2026-04-15] Stroke layout fixes — context bar white (bg-white border-slate-100, all text-white → text-slate-900), window badges → semantic emerald/amber/red-50 pills, tab bar sticky top-14 → sticky top-[108px] — commit b41e644
- [2026-04-15] Stroke header redesign — compact sticky header: back arrow + "Stroke Code" title + Code/Study pill toggle. Subtitle and "3 sections" text removed. QuickReferenceCard gated to study mode only. sticky top-16 for global header clearance. Zap/BookOpen imports removed — commit c379146
- [2026-04-15] CodeModeStep1 visual rebuild — section cards (white + border-slate-100 + rounded-xl), LKW time+badge+change row, BP/Glucose side-by-side colored cards, NIHSS score+severity+LVO row, tPA/TNK dosing pills, full-width cobalt CTA, clamp() in NIHSS onChange — commit d996fdb
- [2026-04-14] Stroke pathway visual redesign — tab navigation (3 tabs: Vitals/Imaging/Summary), all purple/violet → cobalt, compact emergency protocol strip, white surfaces, mobile+desktop QA pass — commit 908916b
- [2026-04-14] Cobalt design system — neuro-* tokens updated to cobalt scale (#1746A2 primary), brain+circuit logo, favicon, PWA manifest, manifest.json — commit a9df0ce
- [2026-04-14] Mobile+desktop QA checklist added to AGENTS.md — commit d4ce376
- [2026-04-14] Stroke page consolidation — deleted StrokeBasicsDesktop.tsx and StrokeBasicsMobile.tsx (orphaned old UI with banned gray-* classes); removed routes /guide/stroke-basics-desktop and /guide/stroke-basics-mobile; StrokeBasicsWorkflowV2 via StrokeBasics.tsx is the single canonical stroke implementation — commit 2a53994
- [2025-04-14] Trials production crash — legacyTrialCategories undefined category fixed with ?? 'ivt' fallback; safeCategory guard added to TrialPageNew; useMemo hooks order corrected — commits 2a39731, 2cc2bab, 6667ec0
- ELAN pathway fix — commit 92e0a84
- Duplicate fix — commit 35325c8

## Current State (as of 2026-05-08)

**Layer 1 — Foundation:** COMPLETE
**Layer 2 — Stroke Pathway:** COMPLETE (all steps, modals, header, tabs shipped)
**Layer 3 — Component Library:** SKIPPED BY AGREEMENT (commit history shows this was deferred in favor of section specs)
**Layer 4 — Pages:** IN PROGRESS — Trials redesign (Waves 6–8) is the active workstream
**Layer 5 — Polish:** PENDING (W8.0+ language/navigation cleanup)

**Wave 6–8 Trial Redesign Status:**
- W6.1–W6.6.1: Spec, archetype design, and EXTEND/WEAVE canary implementations COMPLETE
- W6.4b–W6.4c: 23 trial pages rebuilt (Archetype A) COMPLETE
- W7.0: 10 predecessor stubs created (EVT 2015, basilar EVT, ICH surgery, antiplatelet chains) COMPLETE
- W8.1: Back-button navigation refactor COMPLETE (commit 6ffcc21)
- W8.2–W8.5: Legacy trial redesign program (14 trials), WCAG fixes, language cleanup PENDING
- **Wave 3 Batch 2 (renderer schema wiring):** SHIPPED 2026-05-08 (commit 3d571ac)
- **Batch 3 Wave 1 (data schema extensions):** SHIPPED 2026-05-08 (commit 657f004)
- **Batch 3 Wave 2 (13 secondary-prevention data population):** PLANNED

## Active Workstream
Trial data schema consolidation and secondary-prevention trial population:
1. Batch 3 Wave 2: data population for 13 secondary-prevention trials using Batch 3 Wave 1 schema fields (estimation-strategy, single-arm-registry, harmSignal)
2. Wave 4: Architecture extraction (classifyTrial.ts, vocabulary consolidation ADR)
3. Wave 8.2+: Legacy trial visual redesign (ENRICH, DEFUSE-3/DAWN, NINDS, SELECT2/ANGEL-ASPECT, ATTENTION/BAOCHE, INSPIRES/CHANCE-2, ECASS III, ORIGINAL, SAMMPRIS, B_PROUD)

## Swarm System (installed 2026-04-16, commits b502fea + db9c6af)
The project now uses a multi-agent swarm architecture. See ORCHESTRATION.md for the protocol. Agent roster in agents/active/ and agents/dormant/. Every swarm must cite the relevant spec file, pass all 5 gates, and update the link graph before commit.

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
