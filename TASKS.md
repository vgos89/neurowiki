# TASKS.md — NeuroWiki Task Ledger

## ACTIVE
- [ACTIVE] [L4] Calculator visual redesign — full rebuild against docs/specs/CALCULATOR_SPEC.md (pending draft). ICH Score is the reference implementation. Then batch: NIHSS, GCS, ASPECTS, HAS-BLED, ABCD2, ROPE, Heidelberg, Boston Criteria.

## BLOCKED
(none)

## PARKING LOT
Ideas deferred from in-progress sessions. Not yet triaged into PENDING.
Entries format: - [YYYY-MM-DD] <idea> (parked during: <task>)
(none yet)

## PENDING

### LAYER 2 — Stroke Pathway (do in order)
- [x] [L2] Fix stroke pathway page header — commit c379146
- [x] [L2] Fix stroke pathway layout — white context bar, correct tab sticky offset — commit b41e644
- [x] [L2] Step2 visual rebuild — CT result as clean radio cards, treatment decision cards, cobalt Save button — commit 27cf421
- [x] [L2] Fix "Stamp CT Time" button focus ring box in CodeModeStep2.tsx — commit 0bfea9a
- [x] [L2] Fix emergency strip text wrapping — whitespace-nowrap + text-center, "tPA/TNK reversal"→"tPA reversal" — commit 0bfea9a
- [x] [L2] Improve disabled CTA visual state — opacity-40→50, italic span on disabled text — commit 0bfea9a
- [x] [L2] Step3 visual rebuild — summary display, locked EMR template (Part B) — commit ad51b4d
- [x] [L2] Step4 visual polish — design system tokens, cobalt buttons, evidence badges — commit 684bf89
- [x] [L2] All stroke modals visual overhaul — use white header, clean body, cobalt primary action — commits baecb1c, 10b6063, fdec23f, 341d9a4

### LAYER 3 — Component Library (SKIPPED BY AGREEMENT)
Deferred in favor of section specs (docs/specs/*.md). Each section (calculators, pathways, trials, articles) gets its own locked master spec + HTML mockup. Component library can be revisited after section specs are mature.

### LAYER 4 — Pages (unblocked; Calculator redesign is active)
- [ ] [L4] Home.tsx visual rebuild
- [ ] [L4] TrialsPage + TrialPageNew visual rebuild
- [ ] [L4] EmBillingCalculator UX rebuild — guided decision flow
- [ ] [L4] Calculators.tsx rebuild
- [ ] [L4] ResidentToolkit.tsx rebuild
- [ ] [L4] StatusEpilepticusPathway visual rebuild
- [ ] [L4] MigrainePathway visual rebuild
- [ ] [L4] ExtendedIVTPathway visual rebuild
- [ ] [L4] All guide/* pages consistent layout

### LAYER 5 — Polish (blocked until Layer 4 complete)
- [ ] [L5] Typography audit
- [ ] [L5] Spacing consistency audit
- [ ] [L5] Full mobile + desktop QA pass all pages
- [ ] [L5] Performance audit

### OTHER P1 (not layer-blocked)
- [ ] [P1] Split TrialPageNew chunk (485kb) — lazy-load trial data
- [ ] [P1] Turnstile removal — Cloudflare account deleted, assess removing Turnstile from feedback form entirely
- [ ] [P1] Part B EMR template — replace three separate EMR generators with one locked template
- [ ] [P1] Full connectivity audit — verify every button, modal, tab transition, and data flow works end to end across all stroke pathway steps. Build a manual test checklist in docs/QA_CHECKLIST.md
- [ ] [P1] SEO agent setup — create docs/SEO_SPEC.md with meta title, description, and JSON-LD spec for every route. Implement missing meta tags and structured data across all calculator and pathway pages. Pull forward from Layer 5.
- [ ] [P1] Design consistency audit — read every calculator and pathway page, compare against docs/MOCKUPS.md design tokens, output full report to docs/AUDIT.md. No fixes in this session, audit only. Pages to cover: all src/pages/guide/*, all calculator pages, TrialsPage, Home.
- [ ] [P1] Trials page visual redesign — implement Screen 5 from docs/MOCKUPS.md. Trial card format: name, one-sentence finding, key stat (NNT or ARR), p-value, guideline implication. Readable in 10 seconds. Category filter pills. Left border color by category.
- [ ] [P1] Trial interpretation agent — AI-powered layer that explains what each trial means clinically for a practicing neurologist. Requires component library (Layer 3) before implementation. Use Anthropic API in artifact pattern.

### OTHER P2 (lower priority)
- [x] [P2] tPA Reversal, Orolingual Edema, ICH Protocol modals — Stripe/Apple redesign — commits baecb1c, 10b6063
- [x] [P2] Stroke modals remaining — Thrombectomy, Eligibility, NIHSS — apply same Stripe/Apple pattern — commits fdec23f, 341d9a4
- [ ] [P2] All other pathway pages visual rebuild — StatusEpilepticusPathway, MigrainePathway, ExtendedIVTPathway, GCAPathway, ElanPathway, EvtPathway — apply same visual treatment as stroke pathway after component library exists.
- [ ] [P2] Dedup content-writer.md 2026/2022 guideline templates against .claude/skills/stroke-guidelines.md. content-writer.md currently embeds its own copies of guideline text that duplicates stroke-guidelines.md. On a low-traffic session, strip the duplicated guideline blocks from content-writer.md and replace with a `skills: stroke-guidelines` frontmatter entry + a single line: "For stroke/ICH domain knowledge, load the stroke-guidelines skill."

### Future Refactors
- Skill-build tasks for other neurology domains as they are needed: seizure-guidelines, headache-guidelines, dementia-guidelines, etc. Build on demand, not preemptively.
- [ ] Migrate humanizer as a standalone skill — either from Anthropic's environment skill at /mnt/skills/user/humanizer or authored fresh by extracting content-writer's internal humanizer checklist (lines 319–417 of content-writer.md). Once the skill file exists at .claude/skills/humanizer.md, add it to the frontmatter of medical-scientist and content-writer.
- [ ] Archive /agents/dormant/compliance-legal.md and /agents/dormant/performance-optimizer.md to /agents/legacy/ once W3.6 completes and .claude/agents/ + .claude/skills/ are the canonical sources. Keep legacy copies untouched until then for rollback safety.
- [ ] Update .claude/agents/seo-specialist.md line references from routeMeta.ts → routeManifest.ts (content drift inherited from legacy source; canonical file is src/routeManifest.ts per commit 2a53994).
- [ ] Audit .claude/skills/performance.md for Next.js-specific code examples (next.config.js, next/font/google, pages/ router structure). Replace with Vite + React Router 7 equivalents where the pattern is transferable, or flag as non-applicable. Substantive performance knowledge (Core Web Vitals, code splitting, caching) applies regardless.
- [ ] Fix stray 'ç' character on line ~111 of .claude/skills/performance.md ("**Impact:**ç" → "**Impact:**") inherited from legacy source typo.
- [ ] Evaluate whether .claude/agents/accessibility-specialist.md should be split — ARIA patterns and code examples may belong in .claude/skills/accessibility.md, with the agent file reduced to role + activation triggers + decision rubric. Evaluate after W3.5 when the full agent roster is in place.

## CONFIRMED CLEAN
- [x] 2026-04-17 — GCS Calculator rebuild (Class D-clinical) — commit 0605c53 (feat/rebuild-gcs)
  - Full Archetype 1 rebuild per CALCULATOR_SPEC v1.1; first live Class D-clinical workflow
  - Files: GlasgowComaScaleCalculator.tsx (full rewrite), gcsScoreData.ts (threshold + types + citations),
    routeManifest.ts (GCS title/desc), link-graph.json (new nodes + stubs), ADR-001, arch review, clinical review
  - Key corrections: severity threshold >= 14 → >= 13 (ACRM 1993); 4-tier → 3-tier; pubmedId added;
    amber-700 for moderate; portal drawer (createPortal + position fixed); roving tabindex
  - Clinical-reviewer decision: approve-with-conditions (5 non-blocking follow-ups documented)
  - Wave 5 deviation: CLAIM_REGISTRY / citation registry pending; documented in clinical review artifact
  - 6/6 gates pass: no dark:, no border-2, createPortal ✓, amber-700 ✓, tsc clean, build 2.25s
- [x] 2026-04-17 — CALCULATOR_SPEC v1.1 consolidation — commit 71176ec
  - Five amendments: §1.3 drawer Portal (createPortal + position fixed), §7.1/§8 SEO path
    corrected (routeMeta.ts → routeManifest.ts), §1.1/§6 amber-600 → amber-700 (WCAG AA),
    §7.3 stub-node exception, §7.4 stubs array documentation
  - Based on ICH Score first swarm run findings
  - No clinical content changed; no clinical-reviewer gate required
- [x] Calculator design system — cobalt tokens across 7 calculators — commit cff25ed
  - Files: Abcd2, GCS, HAS-BLED, Heidelberg, ROPE, ICH Score, ASPECTS
  - Selected state: blue → neuro-500/neuro-50/neuro-700 (18×)
  - Checkbox has-[:checked]: blue → neuro (5×)
  - Input color: text-blue-600 focus:ring-blue-500 → neuro (7×)
  - Copy button: bg-slate-900 rounded-lg → bg-neuro-500 rounded-xl font-semibold (7×)
  - Interpretation card: border-2 border-slate-200 bg-slate-50/50 → border border-slate-100 bg-white (6×)
  - Citation links: text-blue-600 dark:text-blue-400 → text-neuro-600 (8×)
  - Zero blue-* remaining in all 7 files
  - Mobile QA: pass (ABCD2) · Desktop QA: pass (ICH Score, 1280×800)
- [x] NIHSS and EVT modal shells — circular close buttons, cobalt selected state, clean headers — commit dd5bddc
  - ThrombectomyPathwayModal: Zap badge removed, title+subtitle text pair, close button → w-8 h-8 rounded-full bg-slate-100, Zap import removed
  - StrokeBasicsWorkflowV2: NIHSS modal close button → w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center
  - NihssItemCard: selected pill bg-slate-900 → bg-neuro-500 (cobalt)
  - Mobile QA: pass · Desktop QA: pass (1280×800)
- [x] ThrombectomyPathwayModal + NihssCalculatorEmbed design system polish — commit 341d9a4
  - ThrombectomyModal: dark:bg-gray-900→slate-900, shadow-2xl→custom boxShadow style, sticky header bg-white/95 backdrop-blur shadow-sm removed
  - NihssEmbed: X import added, shadow-sm removed from sticky bar, × char→circular X icon button (rounded-full bg-slate-100 aria-label="Close"), CTA text "Apply score — {total}"
  - Mobile QA: pass · Desktop QA: pass
- [x] OrolingualEdema + HemorrhageProtocol modal redesign — commit 10b6063
  - Both: max-w-lg, custom shadow, no min-h, circular close button, no header divider
  - Left-border callouts (amber/red), cobalt numbered steps, cobalt Copy to EMR + rounded-xl
  - AlertCircle + AlertTriangle removed from imports
  - Mobile QA: pass · Desktop QA: pass
- [x] TpaReversalProtocolModal redesign — commit baecb1c
  - max-w-lg, clean header, left-border callout, cobalt numbered steps, cobalt CTA
  - Mobile QA: pass · Desktop QA: pass
- [x] Three L2 polish fixes — commit 0bfea9a
  - CodeModeStep2: Stamp CT Time + focus:outline-none (no focus box)
  - StrokeBasicsWorkflowV2: emergency strip text-center + whitespace-nowrap, "tPA/TNK reversal"→"tPA reversal"
  - CodeModeStep2: disabled CTA opacity-40→50, italic span on disabled text
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep4 design system polish — commit 684bf89
  - Evidence badges: green→emerald-100/800, blue→neuro-50/700, yellow→amber-50/700, red→slate-100/600
  - Copy to EMR button: bg-slate-700→bg-neuro-500, hover:neuro-600, green-600→emerald-500 (copied), rounded-xl, min-h-[44px]
  - Save Orders button: bg-purple-600→bg-neuro-500, hover:neuro-600, rounded-xl, shadow-lg removed, min-h-[44px]
  - Zero structural/logic changes — accordion, checkboxes, evidence expand all intact
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep3 visual rebuild — commit ad51b4d
  - Code Summary card: emerald dot status, duration badge right
  - Clinical Summary: grid-cols-2, text-[10px] uppercase labels, hasStep1/hasStep2 gates
  - GWTG Milestones: emerald/amber rounded-full pill badges, conditional
  - EMR Note: bg-slate-50 pre, cobalt Copy to EMR + white Print buttons
  - generateEMRNote() and all clinical logic untouched
  - Mobile QA: pass · Desktop QA: pass
- [x] Global white bg + tab focus ring + LKW nowrap — commit 043556a
  - Layout.tsx: bg-slate-50 → bg-white on main (all pages)
  - StrokeBasicsWorkflowV2.tsx: focus:outline-none on tab buttons
  - CodeModeStep1.tsx: whitespace-nowrap on LKW time display
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep2 visual rebuild — commit 27cf421
  - CT Head: custom button-based radio cards with cobalt dot indicators (was: native <input> labels)
  - Treatment Decision: custom radio cards with dose on sub-line (tPA: total / bolus / inf; TNK: single bolus)
  - CTA/LVO: three equal pill buttons (Yes/No/Pending) + amber EVT Pathway button when LVO=yes
  - Save CTA: bg-emerald-600 → bg-neuro-500, rounded-xl, min-h-[52px], "Save & Continue →"
  - Summary bar: multi-line blue → single-line slate-50 with · separators
  - BP alert: condensed to inline prose (no icon, no bullet list)
  - Brain icon removed from lucide import (was content-only, not logic)
  - Mobile QA: pass · Desktop QA: pass
- [x] Content area top margin fix — commit f2f4b8e
  - card-content-panel: mt-3 (12px) → mt-16 (64px); scrollMarginTop: 99px → 163px
  - mt-3 was insufficient — sticky visual offset is 64px, content was 52px inside sticky area
  - content now starts at viewport y=163, exactly flush with sticky wrapper bottom
  - Mobile QA: pass · Desktop QA: pass
- [x] Stroke page pt-16 gap fixed — commit 81e41b5
  - Layout.tsx: isStrokePage flag (pathname /guide/stroke-basics | /calculators/stroke-code)
  - main: pt-16 → pt-0 on stroke routes; all other pages unchanged
  - Stroke header now flush to nav (gap = 0px); Home + Trials pt-16 intact
  - Mobile QA: pass · Desktop QA: pass
- [x] Tab bar clip + layout padding fixes — commit a8c26dd
  - StrokeBasicsLayout desktop container: removed px-6 (over-padding)
  - StrokeBasicsLayout mobile wrapper: removed py-4 (unwanted vertical gap)
  - WorkflowV2 tab bar: sticky top-28 (112px) → top-32 (128px); actual stroke header is 61px tall, top-28 caused 13px overlap
  - Mobile QA: pass · Desktop QA: pass
- [x] Stroke layout fixes — commit b41e644
  - Context bar: bg-slate-800 → bg-white border-slate-100; all text tokens → light equivalents
  - Window badges: solid dark fills → semantic emerald/amber/red-50 pill style
  - Tab bar: sticky top-14 → sticky top-[108px] (global nav 64px + stroke header ~44px)
  - Mobile QA: pass · Desktop QA: pass
- [x] Stroke header redesign — commit c379146
  - "Stroke Code" title (text-lg font-semibold) + back arrow (w-8 h-8 icon) left
  - Code/Study pill toggle: bg-slate-100 container, bg-white active pill, text-neuro-500 active, text-slate-400 inactive
  - sticky top-16 clears global fixed header (h-16 = 64px)
  - Subtitle "3 sections · tap any to open" removed
  - "Fast-track decisions" / "Evidence + clinical pearls" caption removed
  - QuickReferenceCard gated to workflowMode === 'study' only
  - Zap + BookOpen imports removed (no longer used)
  - Mobile QA: pass · Desktop QA: pass
- [x] CodeModeStep1.tsx visual rebuild — commit d996fdb
  - Section cards: white bg, border-slate-100, rounded-xl
  - LKW: time display + WindowBadge pill + Change link in one row
  - BP/Glucose: side-by-side colored cards (red when above threshold, amber/red/emerald for glucose)
  - NIHSS: large score left, severity + LVO probability center, direct input + Calc button right
  - Weight & Dosing: tPA pill (bg-neuro-50) + TNK pill (bg-emerald-50) after weight entry
  - CTA: full-width bg-neuro-500 cobalt button
  - clamp() used in NIHSS onChange (no unused locals)
  - Zero changes to calculation logic, state, or modal handlers
  - Mobile QA: pass · Desktop QA: pass
- [x] Mobile/desktop QA checklist added to AGENTS.md — commit d4ce376
- [x] Stroke pathway visual redesign Part A — commit 908916b
  - StrokeCardGrid replaced with sticky 3-tab bar (Vitals/Imaging/Summary), cobalt active state
  - bg-slate-50 → bg-white in StrokeBasicsLayout (outer wrapper + desktop main)
  - gray-* → slate-* in StrokeBasicsLayout mobile close button
  - All purple/violet → cobalt: WorkflowV2 (study mode EVT block, thrombectomy card, related resources), CodeModeStep1 (NIHSS Calc), CodeModeStep2 (TNK radio), CodeModeStep3 (thrombectomy section), NihssCalculatorEmbed (Apply score button)
  - Emergency protocols: compact 3-button strip (added ICH protocol button)
  - Mobile QA: pass · Desktop QA: pass
- [x] Production crash on all /trials/:id pages — fixed commits 2a39731, 2cc2bab, 6667ec0
  - legacyTrialCategories undefined → 'ivt' fallback
  - safeCategory guard in TrialPageNew
  - useMemo hooks order violation corrected
- [x] Secrets gitignore — commit 5367e66
  - .env.local, .env.development, .env.production added to .gitignore
  - All three untracked from git index (git rm --cached)
  - .env.example created with placeholder values
  - NOTE: keys already in history must be rotated separately (Turnstile, Resend)
- [x] Brand implementation — commit a9df0ce
  - Cobalt neuro-* tokens (neuro-500: #1746A2), .active-pill updated
  - Brain+circuit inline SVG logo in desktop sidebar + mobile header
  - Brain and ChevronRight unused imports removed from Layout.tsx
  - bg-surface-50 ghost class fixed → bg-white
  - favicon-32.png, favicon-16.png, apple-touch-icon.png, icon-192.png, icon-512.png, icon-1024.png, logo-lockup.png added to public/
  - public/manifest.json created (PWA)
  - index.html: favicon links, manifest, theme-color meta, schema logo URL updated
- [x] Stroke page consolidation — commit 2a53994
  - Deleted StrokeBasicsDesktop.tsx (115 lines) and StrokeBasicsMobile.tsx (88 lines)
  - Removed lazy imports and ROUTE_COMPONENTS entries from App.tsx
  - Removed type union members and route objects from routeManifest.ts
  - StrokeBasicsWorkflowV2 (via StrokeBasics.tsx) is the canonical implementation

## POST-MORTEMS
Regressions that required rollback. Each entry links to a post-mortem
doc in docs/YYYY_MM_DD/post-mortem-<slug>.md.
(none yet)
