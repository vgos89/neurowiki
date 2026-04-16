# TASKS.md — NeuroWiki Task Ledger

## ACTIVE
(none)

## BLOCKED
(none)

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
- [ ] [L2] All stroke modals visual overhaul — use white header, clean body, cobalt primary action

### LAYER 3 — Component Library (blocked until Layer 2 complete)
- [ ] [L3] src/components/ui/Button.tsx
- [ ] [L3] src/components/ui/Card.tsx
- [ ] [L3] src/components/ui/Modal.tsx
- [ ] [L3] src/components/ui/Badge.tsx
- [ ] [L3] src/components/ui/SectionHeader.tsx

### LAYER 4 — Pages (blocked until Layer 3 complete)
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
- [ ] [P1] Calculator UI/UX fixes — after audit, fix every calculator page that does not match design system. Priority order: NIHSS, ICH Score, GCS, ASPECTS, HAS-BLED, ABCD2, ROPE, Heidelberg, Boston Criteria.
- [ ] [P1] Trials page visual redesign — implement Screen 5 from docs/MOCKUPS.md. Trial card format: name, one-sentence finding, key stat (NNT or ARR), p-value, guideline implication. Readable in 10 seconds. Category filter pills. Left border color by category.
- [ ] [P1] Trial interpretation agent — AI-powered layer that explains what each trial means clinically for a practicing neurologist. Requires component library (Layer 3) before implementation. Use Anthropic API in artifact pattern.

### OTHER P2 (lower priority)
- [ ] [P2] Stroke modals visual overhaul — after Step3/Step4 done, audit all stroke modals (tPA Reversal, Orolingual Edema, ICH Protocol, Thrombectomy, Eligibility, NIHSS) and apply design system consistently.
- [ ] [P2] All other pathway pages visual rebuild — StatusEpilepticusPathway, MigrainePathway, ExtendedIVTPathway, GCAPathway, ElanPathway, EvtPathway — apply same visual treatment as stroke pathway after component library exists.

## CONFIRMED CLEAN
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
