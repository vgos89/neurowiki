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

## Recent Work (2026-05-28)

**Calculator + Pathway UI enhancements:**
- **Pre-stroke mRS chips:** PatientContextPanel now displays 7 compact number circles (mRS 0–6) for selection. Type: `MRSGrade` (union of 0–6). State tracked via `PatientContextValues.prestrokeMrs`. Enables quick mRS entry alongside other patient context fields (BP, glucose, NIHSS).
- **NIHSS header redesign:** Fixed crowded header layout — truncated patient-name div, moved Rapid/Detailed mode toggle + Save + Send buttons to secondaryRow, restored total score display prominence in scoreDisplay area. Improves mobile usability on small viewports.
- **BP tPA threshold alert:** PatientContextPanel emits amber inline chip when SBP ≥185 OR DBP ≥110. Citation: aha-asa-ivt-bp-threshold (PMID 31662037) registered in citations/registry.ts. Clinical review approved (docs/reviews/clinical-PR-bp-alert.md).
- **Timestamp popovers:** 4 GWTG event timestamps (Door-to-CT, Door-to-Needle, Door-to-Puncture, Groin-to-Reperfusion) now have clickable CheckCircle icons that expand inline popovers showing metric name, threshold windows (green/amber/red), and source citation.
- **mRS picker modal:** New `MrsPickerModal.tsx` primitive — bottom-sheet modal listing full 7-grade mRS scale with descriptions. Opens from "Pre-stroke mRS" label in PatientContextPanel. Bidirectional sync with inline chips via `setPrestrokeMrs`.
- **Sitemap fix:** /calculators/mrs was missing from public/sitemap.xml (never prerendered on Vercel — served as CSR). Now in sitemap + PHASE_1_ROUTES. Prerender coverage: 170 routes.

## Recent Work (2026-05-17)
- **EMR-text doctor-tone rewrite:** 10 calculators + 5 pathway pages + 6 modals rewritten per approved voice standard (docs/reviews/emr-text-standard-2026-05-17.md). NIHSS exception: all 15 items preserved as numbered list. No clinical thresholds or interpretation logic changed across 9 implementation commits (f8b8a2f, 5a5fca7, f87eea1).
- **Share Button primitive:** New `ShareButton` component + `shareOrCopy` utility deployed across 21 surfaces (CalculatorHeader × 10 + PathwayHeader × 5 + Stroke Code result sections × 6). Enables native share sheet on mobile + copy fallback.
- **Stroke Code feature enhancements:** Wake-up stroke cross-link to Extended IVT Pathway (f343370); Extended IVT outcome feeds back to Stroke Code summary + EMR copy (010bc15); TimestampBubble adds 2 new event types — Neuro IR Contacted + NCC/ICU Sign-out (d17a782).
- **Accessibility remediation:** 10 HIGH-severity a11y findings closed across Stroke Code modals + components (b11y batch 75b0ddf); 0 BLOCKERs remain on Stroke Code.
- **Governance:** Plain-English communication rule added to CLAUDE.md §10.2 for V-facing summaries (commit 3525667).

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

## Recent Work (post-ship fixes — 2026-05-16)

**Pattern A post-ship fix series:** 5-commit series addressing 31 violations + 26 usage bugs from Pattern A v3 content audit. All three pathways now consume spec-mandated `CalculatorDrawer` (EVT retired `PathwayBottomDrawer`, Migraine migrated bespoke hero card). New `PathwayCocktailSummary` primitive shipping with Migraine pathway (handles live-cocktail state, clipboard, animation). All primitives (PathwayRail, PathwayLearningPearl, PathwayCascadeNotice, PathwayCategoryRow) patched for zero-height, icon sizing, button state consistency. Cross-pathway header sweep removes visual duplicates (step-dot clusters, icon-tile flourish) and adds canonical PATHWAY eyebrow + Copy pill, max-w-2xl, font-semibold. SE content rebuild fixes anatomy mismatch in Dose/Outcome rows, glucose check tri-button, and "Stage 2 ASM"→"Stage 2 Agent" wording. No clinical text changes — render-surface and primitive consolidation only. Gate 6 live-verify: PASS on all three pathway routes post-deploy.

- Commits: 19f2a47 (audit doc), 0078c3b (Tier 1–2), bfa5c6d (Tier 3 SE), 1e4eecf (Tier 4 EVT), 77ce4e8 (Tier 5 Migraine)
- Architects: arch-pattern-a-fix-tier-1-2.md, arch-pattern-a-fix-tier-4.md, arch-pattern-a-fix-tier-5.md
- Clinical reviewers: clinical-pattern-a-fix-tier-4.md, clinical-pattern-a-fix-tier-5.md (both approve-with-conditions resolved)

## Recent Work (2026-06-07)

**EVT result/action de-clutter to PM spec:**
- Decision step result surface consolidated from four competing layouts (floating "Decision Support" card, fixed action bar with legacy button, eligibility drawer, tab bar) to ONE: the drawer's expanded panel (68dvh) holding the verdict + single house-style "Copy to EMR" button + folded clinical content (MeVO risk gated, "Decision Support Only" disclaimer with trial links, 3x 2026 peri-procedural pearls, Clinical Context Summary).
- File: `src/pages/EvtPathway.tsx` — UI consolidation only. EMR-note logic + verdict logic byte-identical. Drawer pattern established by the Pattern A fix series (2026-05-16) and matches ELAN/ExtendedIVT architecture.

## Recent Work (2026-06-05)

**Headache Pathway v4 rebuild — live differential narrowing (commit 5e26727):**
- **New route:** `/pathways/headache-clinic` (route key `pathways-headache-clinic`) — now using `ClinicHeadachePathwayV4.tsx` (imported in `src/App.tsx` line 54)
- **New page:** `src/pages/ClinicHeadachePathwayV4.tsx` — 3-phase state machine (safety screen → question flow → ranked result)
- **New frame components:** 5 new presentational components wired in v4 rebuild
  - `src/components/pathways/headache/HeadacheSafetyScreen.tsx` — SNNOOP10 read-then-decide gate
  - `src/components/pathways/headache/HeadacheDifferentialPanel.tsx` — live banding display (Leading/Possible/Less-likely bands with dot-meter progress)
  - `src/components/pathways/headache/HeadacheQuestion.tsx` — single-question-per-screen flow
  - `src/components/pathways/headache/HeadacheDotMeter.tsx` — visual progress meter for question completion
  - `src/components/pathways/headache/HeadacheResultV4.tsx` — result presentation (mounted verbatim: HeadacheManagement + CriteriaList)
- **New data layer:** 3 React-free clinical-presentation modules (each with test suite)
  - `src/data/headacheBanding.ts` — maps engine output to (Leading/Possible/Less-likely/Set-aside) bands per threshold
  - `src/data/headacheQuestions.ts` — question-flow configuration (read sequence, display logic, no-percentage rule)
  - `src/data/headacheConflict.ts` — runner-up conflict derivation (C1 pattern)
- **Retired files:**
  - `src/pages/ClinicHeadachePathway.tsx` (v3 rail-step page — DELETED)
  - `src/components/pathways/headache/HeadacheResultList.tsx` (v3 result accordion — DELETED, superseded by HeadacheDifferentialPanel + HeadacheResultV4)
- **Unchanged + still in use:**
  - `src/data/clinicHeadacheData.ts` (ICHD-3 engine, 84-test suite intact, zero logic changes)
  - `src/components/pathways/headache/HeadacheManagement.tsx` + `CriteriaList.tsx` (mounted verbatim by HeadacheResultV4)
- **Architecture note:** `MapperPanel.tsx` is now unused (its only consumer was the deleted HeadacheResultList) — parked as a retirement candidate
- **Specifications:** Design mockup: `docs/specs/mockups/headache-pathway-v4-flow.html` (approved). Clinical review: `docs/reviews/clinical-headache-v4-postexec.md` (approve-with-conditions, all conditions resolved).

## Current State (as of 2026-06-05)

**Headache Pathway v4 Live** — `/pathways/headache-clinic` now uses the 3-phase "live differential narrowing" model: SNNOOP10 safety screen → ICHD-3 question flow → ranked phenotype results with management behind links. 206 unit tests pass (banding cut-points, question drift-guard, conflict C1 derivation, no-percentage invariants, safety-strip always-on). Mobile-first-developer sign-off complete (375px bottom-bar/tab-bar coexistence per EvtPathway pattern). Clinical pre-gate + post-gate both approve-with-conditions (all conditions resolved, `docs/reviews/clinical-headache-v4-postexec.md`). Architect review approve-with-conditions (`docs/reviews/arch-headache-v4-full-rebuild.md`).

**Patient Context Panel modernization complete** — pre-stroke mRS chips, BP alert, NIHSS header redesign, timestamp popovers, mRS picker modal all live.
**Sitemap prerender coverage:** 171 routes (all clinical surfaces pre-rendered on Vercel deploy).

**Pattern A post-ship fixes landed** (2026-05-16) — all three pathways now on spec-mandated CalculatorDrawer; PathwayCocktailSummary new primitive shipped; all primitive render bugs fixed.

**Layer 1 — Foundation:** COMPLETE
**Layer 2 — Stroke Pathway:** COMPLETE (all steps, modals, header, tabs shipped)
**Layer 3 — Component Library:** SKIPPED BY AGREEMENT (commit history shows this was deferred in favor of section specs)
**Layer 4 — Pages:** IN PROGRESS — Trials redesign (Waves 6–8) is the active workstream; Headache Pathway v4 LIVE
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
1. **EVT enrichment wave COMPLETE (2026-06-08):** all 24 thrombectomy trials now carry `fullEligibility` (PDF-sourced, chapter-and-verse eligibility criteria) + `armDetails` (control/comparator arm protocols transcribed character-for-character from publication PDFs as source-of-truth over registries). Study Arms accordion repositioned directly under Primary Outcome (single render per page, cross-archetype consistency). Batches: pilot 4fbb914/c1146eb (5 trials: NINDS, ECASS III, ESCAPE, DEFUSE-3, DAWN — High confidence on NINDS eligibility, Medium→High upgrade after full-text verify), batch 1 b83af5d (6 EVT trials), batch 2 d2abd41 (6 EVT large-core), batch 3 8bf31e8 (6 EVT basilar/bridging), batch 4 6f3e9d1 (6 technique/adjunct/medium-vessel). All 24 ship with Gate 6 live-verify PASS; clinical review approve/approve-with-conditions per batch. Registry-link safety sweep run on all 78 trials checked; EAGLE wrong-link fixed (commit b83af5d). ECASS III recommendation class (COR 2a LOE B-R, §4.6.2) verified correct. Post-flight follow-ups: evt-curated-circulation-fix (MR CLEAN-NO IV + RESCUE BT anterior-only source-alignment, P1 medium-high), evt-curated-summary-cluster (SELECT2/RESCUE BT summary reconciliation, P2 low), compass-registry-vs-conduct (optional documentation, P3).
2. Remaining ~74 NCT-linked trials (IVT, secondary prevention, other modalities) eligible for backfill in future reviewed waves. Schema is stable, components reusable.
3. Batch 3 Wave 2: data population for 13 secondary-prevention trials using Batch 3 Wave 1 schema fields (estimation-strategy, single-arm-registry, harmSignal) — planned
4. Wave 4: Architecture extraction (classifyTrial.ts, vocabulary consolidation ADR)
5. Wave 8.2+: Legacy trial visual redesign (ENRICH, DEFUSE-3/DAWN, NINDS, SELECT2/ANGEL-ASPECT, ATTENTION/BAOCHE, INSPIRES/CHANCE-2, ECASS III, ORIGINAL, SAMMPRIS, B_PROUD)

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
