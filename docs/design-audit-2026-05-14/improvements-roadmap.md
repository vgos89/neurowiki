# Design Audit Recommendations Roadmap — 2026-05-14

**Date:** 2026-05-14
**Synthesized from:** Phase 1 (competitive-research.md) + Phase 2 (page-audit.md) + Phase 3 (4 HTML mockups)
**Status:** awaiting V triage; non-V-gated Phase 3.A items ready to execute immediately upon V approval of this document

---

## Executive summary

The five audited surfaces divide into two clear tiers. Home, Calculators, and TrialsPage are well-formed: they conform to their locked reference mockups with two shared mechanical failures (ToolRowCard star button at 16px, three non-functional TrialsPage chips). ResidentToolkit and ResidentGuide were authored independently from the hub-reference.html spec and carry a dense cluster of disallowed tokens (shadow-lg, shadow-xl, border-2, font-black, font-extrabold, teal-*, blue-*) that make them visually foreign to the rest of the app. The Phase 3 mockups resolve all of these with one architectural principle from competitive research: hairline borders beat shadows for dense clinical content, and full-fill cobalt active beats border-only for pill/chip rows.

Ship order: (1) ToolRowCard touch target fix (one file, affects three surfaces simultaneously), (2) cobalt-fill pill active cross-site, (3) TrialsPage non-functional affordances, (4) ResidentGuide token cleanup, (5) ResidentToolkit full token rebuild. The cmd-K global search and sticky-search-on-mobile are V-gated architectural decisions that need a product call before any UI work.

---

## Roadmap — Phase 3.A (no V triage, ship immediately)

Items with an unambiguous fix defined in the Phase 3 mockups. No clinical content changes. No new routes. No new dependencies.

### A1 — ToolRowCard star button: 16px → 44px touch target

- **What:** Replace `w-4 h-4` with `min-h-[44px] min-w-[44px] p-2 -m-1.5` on the star button in ToolRowCard, matching the pattern already used correctly in TrialLegendCard.tsx line 94.
- **Source friction:** Phase 2 finding Home-G at `src/components/hub/ToolRowCard.tsx:53` (16×16px touch target, below 44px minimum); also Calculators-G, confirmed shared component.
- **Proposed fix:** home-2026-05-14-proposal.html "FIX A" section — before/after comparison with annotated code pattern (`min-height:44px; min-width:44px; padding:10px; margin:-10px`).
- **Surface:** `src/components/hub/ToolRowCard.tsx` only. Fixes Home, Calculators, and TrendingTrials widget simultaneously.
- **Effort:** S
- **Impact:** High (mobile usability; accessibility — every row card on three pages fails the tap-target minimum)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A2 — Cobalt-fill active state: pill/chip rows on Home and Calculators

- **What:** Update the active pill class on ScenarioPillRow (Home) and CategoryPillRow (Calculators) from `bg-slate-50 border-slate-200 text-slate-900 font-semibold` to the cobalt-fill pattern `bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2] font-semibold`, resolving the three-page inconsistency.
- **Source friction:** Phase 2 cross-cutting finding §1 at `src/components/home/ScenarioPillRow.tsx` and `src/components/calculators/CategoryPillRow.tsx:17`; TrialsPage catalog chips already use the correct pattern at `TrialsPage.tsx:322–323`.
- **Proposed fix:** home-2026-05-14-proposal.html "FIX B" section — side-by-side comparison of border-only vs cobalt-fill, with TrialsPage as the reference that already passes.
- **Surface:** `src/components/home/ScenarioPillRow.tsx`, `src/components/calculators/CategoryPillRow.tsx`
- **Effort:** S
- **Impact:** Med (visual consistency across hubs; active state now clearly distinct on small screens)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A3 — Remove three non-functional chips from TrialsPage chip rail

- **What:** Remove or replace the "Recent," "New 2024–25," and "Guidelines" chip buttons that render with no onClick handlers and produce no feedback on tap. Options: (a) remove them and reduce to Favourites-only until the features are built, or (b) wire them to real filter states (see A4 for the functional version).
- **Source friction:** Phase 2 finding TrialsPage-D at `src/pages/TrialsPage.tsx:233–236` ("broken affordances that suggest features that don't exist").
- **Proposed fix:** trials-catalogue-2026-05-14-proposal.html "Chip rail" section shows all four chips as functional, each rendering a distinct filtered state. A3 is the minimum viable version: remove the dead chips. A4 adds the wired versions.
- **Surface:** `src/pages/TrialsPage.tsx:233–236`
- **Effort:** S
- **Impact:** High (currently misleads users into tapping affordances that do nothing)
- **Class:** B
- **Dependencies:** none (removal); A4 is the upgrade
- **V-gated:** no

---

### A4 — Wire non-functional Year sort button on TrialsPage catalog

- **What:** Replace the decorative "Year" sort button (no onClick, no handler) with a functional sort dropdown offering Recent / Most Cited / A-Z, as shown in the proposal mockup.
- **Source friction:** Phase 2 finding TrialsPage-D at `src/pages/TrialsPage.tsx:357` ("non-functional, no handler, no visual feedback on click").
- **Proposed fix:** trials-catalogue-2026-05-14-proposal.html "Sort dropdown" section — replaces the non-functional button with a sort-state driven by a `sortBy` useState hook; dropdown menu with three options, no external dependency.
- **Surface:** `src/pages/TrialsPage.tsx`
- **Effort:** M
- **Impact:** Med (catalog discoverability; currently "Year" button is a broken affordance)
- **Class:** C
- **Dependencies:** none
- **V-gated:** no

---

### A5 — Replace hardcoded "79" trial count in TrendingTrials

- **What:** Replace the hardcoded `79` in `TrendingTrials.tsx:54` with the live-computed `TRIAL_DATA.length` or equivalent import from `trialListData.ts`, so the count stays accurate as trials are added.
- **Source friction:** Phase 2 finding Home-B at `src/components/home/TrendingTrials.tsx:54` ("hardcoded '79' will drift as catalog grows").
- **Proposed fix:** home-2026-05-14-proposal.html displays "View all 89 trials →" as the correctly-computed string. Data source: `trialListData.ts` already exports trial list; import the length.
- **Surface:** `src/components/home/TrendingTrials.tsx`
- **Effort:** S
- **Impact:** Low (data hygiene; no user-facing breakage today but will drift)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A6 — Fix TrialsPage search focus: arbitrary rgba → `var(--cobalt-soft)`

- **What:** Replace `focus:shadow-[0_0_0_4px_rgba(23,70,162,0.08)]` with `focus:shadow-[0_0_0_4px_var(--cobalt-soft)]` (or equivalent CSS-variable-backed class) on the TrialsPage search input.
- **Source friction:** Phase 2 finding TrialsPage-F at `src/pages/TrialsPage.tsx:208` ("arbitrary value; should reference the CSS variable").
- **Proposed fix:** trials-catalogue-2026-05-14-proposal.html `.search-bar.focused { box-shadow: 0 0 0 4px var(--cobalt-soft); }` — consistent with all other search inputs in the proposals.
- **Surface:** `src/pages/TrialsPage.tsx:208`
- **Effort:** S
- **Impact:** Low (token hygiene; functionally identical today)
- **Class:** B
- **Dependencies:** `--cobalt-soft` must be declared in `tailwind.config.js` or global CSS if not already present
- **V-gated:** no

---

### A7 — Remove two empty `md:` class tokens in TrialsPage category container

- **What:** Remove the two dangling empty `md:` tokens in the category section container class string at `TrialsPage.tsx:396` (`md:bg-white md: md:border md:border-slate-100 md: md:rounded-lg md:overflow-hidden`).
- **Source friction:** Phase 2 finding TrialsPage-F at `src/pages/TrialsPage.tsx:396` ("two empty md: class tokens — harmless but a code smell").
- **Proposed fix:** Remove the two empty `md:` entries from the className string.
- **Surface:** `src/pages/TrialsPage.tsx:396`
- **Effort:** S
- **Impact:** Low (code hygiene only)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A8 — ResidentGuide: fix scroll-to-top FAB tab-bar overlap on mobile

- **What:** Update the FAB `fixed bottom-8 right-8` to `bottom: calc(var(--tab-bar-height,0px) + env(safe-area-inset-bottom,0px) + 1rem)` so it clears the mobile tab bar.
- **Source friction:** Phase 2 finding ResidentGuide-G at `src/pages/ResidentGuide.tsx:506` ("FAB at 32px from bottom is inside the tab bar zone on mobile").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html comment at line 146 shows the production CSS value. The mockup positions the FAB at `bottom:76px` (60px tab bar + 16px gap) in the frame.
- **Surface:** `src/pages/ResidentGuide.tsx:506`
- **Effort:** S
- **Impact:** High (mobile usability — FAB is currently inaccessible under the tab bar on 375px)
- **Class:** B
- **Dependencies:** `--tab-bar-height` CSS variable must be set (confirm with mobile-first-developer)
- **V-gated:** no

---

### A9 — ResidentGuide: replace `blue-*` active state with `neuro-*`

- **What:** Replace `bg-blue-50 text-blue-700 border-blue-500` on the active guide item at `ResidentGuide.tsx:361` with `bg-[rgba(23,70,162,0.07)] text-neuro-700 border-neuro-500` (or the CSS-variable equivalent).
- **Source friction:** Phase 2 finding ResidentGuide-F at line 361 ("`blue-*` is a disallowed color").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html `.guide-item.active { background: rgba(23,70,162,0.07); color:#1746A2; border-left:2px solid #1746A2; }` — exact token mapping shown.
- **Surface:** `src/pages/ResidentGuide.tsx:361`
- **Effort:** S
- **Impact:** Med (design system integrity; `blue-*` is explicitly forbidden)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A10 — ResidentGuide: replace `teal-*` with `neuro-*` / `emerald-*`

- **What:** Replace all `text-teal-500`, `hover:text-teal-500`, `hover:bg-teal-500`, `bg-teal-500` occurrences with neuro-* (for navigation/link CTAs) or emerald-* (for positive-signal pathway CTAs), per the proposal mockup's CTA color strategy.
- **Source friction:** Phase 2 finding ResidentGuide-F at lines 238, 259, 264, 429, 495 ("`teal-*` is the most pervasive off-token color").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html `.article-cta` (neuro-cobalt for nav CTAs) and `.article-cta.emerald` (emerald for positive-signal pathway CTAs like "Stroke Code Pathway"). See article view "Related tools" section.
- **Surface:** `src/pages/ResidentGuide.tsx` (multiple lines)
- **Effort:** M
- **Impact:** High (design system integrity; teal is not in the neuro-* palette)
- **Class:** C
- **Dependencies:** A9 (clean up blue-* first; ship together)
- **V-gated:** no

---

### A11 — ResidentGuide: fix article H1 and section header typography

- **What:** Replace `text-3xl md:text-5xl font-extrabold` article H1 with `text-[28px] md:text-[34px] font-semibold`; replace `text-xl font-bold` section headers with `text-[17px] md:text-[18px] font-semibold`; replace `text-base leading-8` body paragraphs with `text-sm leading-[1.55]`.
- **Source friction:** Phase 2 findings ResidentGuide-B at lines 401, 462, 248 (article H1 "severely outside spec scale"; body "too loose for clinical reference scanning").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html `.article-h1` (28px/600), `.article-section-h` (17px/600), `.article-body` (14px/1.55) — all shown in the article view "Stroke Basics" mobile and desktop frames.
- **Surface:** `src/pages/ResidentGuide.tsx:401, 462, 248`
- **Effort:** S
- **Impact:** High (typography currently signals a blog, not a clinical tool; 48px extrabold is the most visually jarring violation in the entire codebase)
- **Class:** C
- **Dependencies:** none
- **V-gated:** no

---

### A12 — ResidentGuide: add H1 to landing state at /guide

- **What:** Add a proper `<h1>` to the landing state (when no topic is selected), matching hub-reference.html anatomy: eyebrow "Reference" + H1 "Clinical Guides" + lede sentence.
- **Source friction:** Phase 2 finding ResidentGuide-A at `src/pages/ResidentGuide.tsx` lines 289–376 ("no H1 — heading hierarchy failure on the guide hub landing page").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html State 1 "Landing state at /guide" — mobile frame shows eyebrow + H1 + lede before the sidebar accordion; desktop frame shows the same in the main content area with "Select a guide from the sidebar" prompt.
- **Surface:** `src/pages/ResidentGuide.tsx` (landing state render block)
- **Effort:** S
- **Impact:** High (SEO — no H1 on the /guide route; accessibility — heading hierarchy failure)
- **Class:** C
- **Dependencies:** confirm with mobile-first-developer that the mobile landing state `max-h-[50vh]` constraint is sufficient for the added hero block
- **V-gated:** no

---

### A13 — ResidentGuide: fix duplicate back button in article view

- **What:** Remove the outer back button at `ResidentGuide.tsx:273` that renders when `currentTopic` is set, leaving only the header-bar back arrow at line 382. On desktop, use the breadcrumb pattern shown in the proposal (Clinical Guides → Stroke Basics) instead of a second back arrow.
- **Source friction:** Phase 2 finding ResidentGuide-E at lines 273 and 382 ("duplicate back button at the article view top").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html article view — "Single back button in header only — no duplicate inside article." Desktop frame shows breadcrumb navigation in the top-right header area.
- **Surface:** `src/pages/ResidentGuide.tsx:273`
- **Effort:** S
- **Impact:** Med (UX confusion; two back buttons with the same action in the same view)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A14 — ResidentGuide: fix category label eyebrow tokens

- **What:** Replace `text-xs font-semibold text-slate-500 uppercase tracking-wider` on category labels in the accordion with `text-[10px] font-bold text-slate-400 uppercase tracking-widest` (exact spec eyebrow token).
- **Source friction:** Phase 2 finding ResidentGuide-B at line 341 ("`text-xs tracking-wider` — should be `text-[10px] tracking-widest`").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html `.cat-label { font-size:10px; font-weight:700; color:#94a3b8; letter-spacing:0.12em; }` — same correction as ResidentToolkit.
- **Surface:** `src/pages/ResidentGuide.tsx:341`
- **Effort:** S
- **Impact:** Low (2px size, tracking mismatch — imperceptible but non-spec)
- **Class:** B
- **Dependencies:** none
- **V-gated:** no

---

### A15 — ResidentGuide: remove shadow tokens from CTAs and ToC sidebar

- **What:** Remove `shadow-lg` from CTA links at lines 406, 414, 426; remove `shadow-xl` from ToC sidebar at line 491; remove `shadow-sm` from section icons at line 463. Replace with hairline borders where visual separation is needed.
- **Source friction:** Phase 2 finding ResidentGuide-F ("`shadow-lg` / `shadow-xl` / `shadow-sm` on multiple elements — disallowed tokens").
- **Proposed fix:** resident-guide-2026-05-14-proposal.html ToC sidebar uses `border-left:1px solid #f1f5f9` only; article CTAs use `border:1px solid rgba(23,70,162,0.15)` only — "No shadow-lg/shadow-xl on CTAs or sidebar — hairline borders only."
- **Surface:** `src/pages/ResidentGuide.tsx:406, 414, 426, 463, 491`
- **Effort:** S
- **Impact:** Med (design system integrity; shadows are explicitly disallowed)
- **Class:** B
- **Dependencies:** ship with A9/A10 in the same PR
- **V-gated:** no

---

## Roadmap — Phase 3.B (V-gated, 30–60 days)

Items requiring V's specific product or clinical judgment call.

### B1 — Sticky search bar on TrialsPage mobile catalog view

- **What:** Persist the search bar on mobile when scrolling the trial catalog, so a user browsing a long category list can search without scrolling back to the top.
- **Source friction:** Phase 2 finding TrialsPage-D at `src/pages/TrialsPage.tsx` ("search scrolls away on mobile in catalog view"). Phase 1 Pattern 2 recommendation: "search must be persistent and one-tap-away on every catalogue page."
- **Proposed fix:** trials-catalogue-2026-05-14-proposal.html `.sticky-search-wrapper { position:sticky; top:0; z-index:20; background:white; border-bottom:1px solid var(--hair); }` shown above the toggle in the mobile catalog frame.
- **Surface:** `src/pages/TrialsPage.tsx` (search bar wrapper positioning)
- **Effort:** M
- **Impact:** High (mobile usability at the bedside — Phase 1 competitive research makes this the clearest bedside-UX gap)
- **Class:** C
- **Dependencies:** confirm sticky position interaction with the existing `sticky top-0 z-30` Toggle — both cannot be top:0 simultaneously; one must be `top:[header-height]`
- **V-gated:** yes — V call needed: does search stick above the Questions/Catalog toggle, or does the toggle stick and search float inside the hero?

---

### B2 — Wire "Recent," "New 2024–25," and "Guidelines" chip rail on TrialsPage

- **What:** Implement the three non-functional chip rail chips (after removing them per A3) with real filter logic: Recent = sorted by `year` descending; New 2024–25 = `year >= 2024`; Guidelines = trials tagged with `guidelineImplication !== null`.
- **Source friction:** Phase 2 finding TrialsPage-D at `src/pages/TrialsPage.tsx:233–236`.
- **Proposed fix:** trials-catalogue-2026-05-14-proposal.html "Chip rail" section — four chips, each shown with a filtered result set. Filter logic relies on `trialListData.ts` fields.
- **Surface:** `src/pages/TrialsPage.tsx`, `src/data/trialListData.ts` (confirm `guidelineImplication` field exists for all 89 trials)
- **Effort:** M
- **Impact:** High (discovery; bedside residents need to find guideline-relevant trials quickly — Phase 1 Pattern 3 recommendation)
- **Class:** C
- **Dependencies:** A3 (dead chips removed first); data audit of `guidelineImplication` field coverage; B1 (search should also work with active chip filter)
- **V-gated:** yes — V call needed on: (a) should "Recent" mean recent addition to NeuroWiki or recent publication year? (b) does "Guidelines" mean any AHA/ASA guideline citation or a specific subset?

---

### B3 — Expose Favourites filter as a UI chip on the Calculators hub

- **What:** Add a "Favourites" chip to `CategoryPillRow` on the Calculators page so users can filter to starred calculators without needing the `?favs=true` URL parameter.
- **Source friction:** Phase 2 finding Calculators-D ("Favourites filter not exposed as a UI chip; only accessible via URL param").
- **Proposed fix:** TrialsPage already shows a Favourites chip in the chip rail (functional). Apply the same pattern to Calculators `CategoryPillRow`.
- **Surface:** `src/pages/Calculators.tsx`, `src/components/calculators/CategoryPillRow.tsx`
- **Effort:** S
- **Impact:** Med (discoverability of a feature that already exists behind a URL param)
- **Class:** C
- **Dependencies:** A2 (cobalt-fill active state should be applied first so the chip renders correctly)
- **V-gated:** yes — V call needed: does favourites filter replace the "All" pill, or coexist alongside category pills?

---

### B4 — Calculators hub: visual empty state for Favourites

- **What:** Replace the plain `<p>` text empty state when `?favs=true` and no favourites are saved with a visual empty state card (icon + message + CTA to browse calculators), matching TrialsPage's visual empty state pattern.
- **Source friction:** Phase 2 finding Calculators-E ("Favs empty state is plain text, not a visual empty state card — inconsistency with TrialsPage").
- **Proposed fix:** TrialsPage empty state at `TrialsPage.tsx:459–477` (visual icon, message, "Clear filters" button) is the reference pattern.
- **Surface:** `src/pages/Calculators.tsx:107–112`
- **Effort:** S
- **Impact:** Low (polish; not a functional gap)
- **Class:** B
- **Dependencies:** B3
- **V-gated:** yes — V call: is the empty state the same every time ("No favourites yet — star a calculator to save it here") or context-dependent?

---

### B5 — cmd-K / global search affordance

- **What:** Add a global command-palette-style search overlay accessible from a persistent search icon on every page, or a `⌘K` shortcut on desktop. The overlay shows trending queries and filters across trials, calculators, guides, and pathways.
- **Source friction:** Phase 1 Pattern 2 ("search must be persistent and one-tap-away on every catalogue page"). Phase 2 finding Home-D and Calculators-D both note no search affordance on the hub pages.
- **Proposed fix:** home-2026-05-14-proposal.html "[OPTIONAL: cmd-K search]" section — explicitly labeled stretch goal. Shows a `⌘K`-hint input that opens a full-screen search overlay on tap.
- **Surface:** New component `src/components/search/CommandPalette.tsx`; integration into the global layout shell; potentially new route `/search`.
- **Effort:** L
- **Impact:** High (Phase 1 research identifies search persistence as the single biggest competitive gap vs MDCalc and UpToDate)
- **Class:** D
- **Dependencies:** routing changes; new component; potentially performance impact (bundle size) — needs system-architect review
- **V-gated:** yes — this is a new surface that V must approve before any design or engineering begins

---

## Roadmap — Phase 3.C (big-rock, 60–90+ days)

Items requiring architectural change or full page rebuild.

### C1 — ResidentToolkit full token compliance rebuild

- **What:** Rebuild ResidentToolkit to conform to hub-reference.html anatomy: remove all disallowed tokens (shadow-lg, shadow-xl, hover:shadow-md, hover:shadow-sm, border-2, font-black, rounded-2xl, teal-*, lucide-react), correct H1 to `font-medium`, eyebrow to `text-[10px] tracking-widest`, section anatomy to match hub-reference.html, stats strip to `font-semibold`, quick-access cards to `rounded-xl` with hairline borders.
- **Source friction:** Phase 2 finding ResidentToolkit-F (8+ disallowed token violations including `shadow-lg`, `shadow-xl`, `border-2`, `font-black`); ResidentToolkit-A (H1 `font-bold` vs spec `font-medium`); ResidentToolkit-B (eyebrow mismatch); ResidentToolkit-C (`rounded-2xl`).
- **Proposed fix:** resident-toolkit-2026-05-14-proposal.html — complete anatomy: eyebrow token, H1 font-medium, hairline card borders, Material Icons, stats strip font-semibold, 4 toolkit categories (Quick Reference / Procedures / Communication Templates / Personal Tracker), 2-col desktop grid with Landmark Trials sidebar.
- **Surface:** `src/pages/ResidentToolkit.tsx` (497 lines, full rebuild); `src/components/` for any extracted sub-components
- **Effort:** L
- **Impact:** High (ResidentToolkit is the most token-divergent page in the codebase; it looks visually foreign to the rest of the app)
- **Class:** D
- **Dependencies:** A2 (cobalt-fill pill active); C3 (icon library decision must be made before rebuild); confirm content for the 4 toolkit categories with V
- **V-gated:** yes — V approval needed on: (a) the 4-category structure (Quick Reference / Procedures / Templates / Tracker), (b) whether "Personal Tracker" is a real feature or placeholder, (c) which items populate each category

---

### C2 — ResidentToolkit: replace lucide-react with Material Icons (icon library consolidation)

- **What:** Remove the 19-import `lucide-react` block from ResidentToolkit (and the separate lucide-react usage in ResidentGuide) and replace all icons with Material Icons Round, the spec-mandated icon library (`@material-icons/font` or CDN link). This consolidates to one icon library across the codebase.
- **Source friction:** Phase 2 cross-cutting finding §5 ("ResidentToolkit and ResidentGuide use lucide-react icons; other pages use custom SVGs… adds a bundled icon library not referenced in the product stack").
- **Proposed fix:** resident-toolkit-2026-05-14-proposal.html uses `<span class="material-icons-round">medication</span>` inline — no JS import. All icon slots in C1 use Material Icons.
- **Surface:** `src/pages/ResidentToolkit.tsx`, `src/pages/ResidentGuide.tsx`
- **Effort:** M
- **Impact:** Med (bundle size; design system integrity; eliminates split icon dependency)
- **Class:** C
- **Dependencies:** ship as part of C1 rebuild; do not ship separately to avoid partial icon swap
- **V-gated:** no (technical consolidation; no visible product change if icon choices are equivalent)

---

### C3 — TrialsPage: wire chip filter states (Recent, New 2024–25, Guidelines)

This is the full implementation of B2, promoted to C-tier because it may require schema changes to `trialListData.ts` to add `guidelineImplication` coverage for all 89 trials.

See B2 for source friction, proposed fix, and surface. Effort is L if data schema work is required.

---

## 30/60/90 calendar

**Week 1–2 (immediate, no V gate):**
- A1 — ToolRowCard touch target (one file, three pages fixed)
- A2 — Cobalt-fill pill active on Home and Calculators
- A3 — Remove three dead chips from TrialsPage chip rail
- A5 — Fix hardcoded trial count in TrendingTrials
- A6 — Fix TrialsPage search focus arbitrary value
- A7 — Remove empty md: class tokens
- A8 — Fix FAB tab-bar overlap in ResidentGuide
- A9 — Replace blue-* active state in ResidentGuide
- A14 — Fix eyebrow tokens in ResidentGuide
- A13 — Remove duplicate back button in ResidentGuide article view

**Week 3–4 (same sprint, slightly more scope):**
- A10 — Replace teal-* with neuro-*/emerald-* in ResidentGuide
- A11 — Fix article H1 and body typography in ResidentGuide
- A12 — Add H1 to ResidentGuide landing state
- A15 — Remove shadow tokens from ResidentGuide CTAs and ToC
- A4 — Wire functional Year sort dropdown on TrialsPage

**Week 5–8 (V-gated, pending approval calls):**
- B1 — Sticky search on TrialsPage mobile (after V confirms toggle/search z-index resolution)
- B2/C3 — Wire chip rail filters (after V defines "Recent" and "Guidelines" semantics)
- B3/B4 — Calculators Favourites chip + empty state

**Week 9–12+ (big-rock, V approval required):**
- C1 — ResidentToolkit full token rebuild (after V approves 4-category content structure)
- C2 — Icon library consolidation (ships with C1)
- B5 — cmd-K global search (after V approves as a feature)

---

## TASKS.md updates proposed

**Close / mark done (already addressed by the audit + A-tier items above):**
- The "Design consistency audit" P1 PENDING item (`docs/AUDIT.md`) is now satisfied by the three-phase design audit (competitive-research.md + page-audit.md + this roadmap). Recommend marking `[x]` with a note pointing to `docs/design-audit-2026-05-14/`.

**Update (scope refined):**
- `[L4] Home.tsx visual rebuild` — Rescope to: "A1 (touch target) + A2 (cobalt-fill pill) + A5 (trial count)" as the bounded rebuild. Home conforms closely to spec; it does not need a full rebuild, only these three targeted fixes.
- `[L4] TrialsPage + TrialPageNew visual rebuild` — Split into two separate items: TrialsPage (A3 + A4 + A6 + A7 + B1 + B2 are the complete TrialsPage change set) and TrialPageNew (separate task, not covered by this audit).
- `[L4] ResidentToolkit.tsx rebuild` — Confirm the hub-reference.html as the locked spec before execution; the 4-category structure from the Phase 3 mockup is the proposed anatomy but requires V approval.

**Add as new PENDING items:**
- `[L4] ResidentGuide token cleanup` — Class C. Items A8–A15 as a single batched PR. No clinical content changes.
- `[L4] ResidentGuide landing state H1` — folded into the token cleanup PR (A12).
- `[L4] Calculators Favourites chip + empty state` — Class C. B3 + B4. Pending V call on chip coexistence pattern.
- `[L2] Icon library consolidation (lucide-react → Material Icons)` — Class C. C2. Ship with ResidentToolkit rebuild.
- `[P1] cmd-K global search` — Park for V triage. New Class D feature.

---

## Open questions for V (parked)

1. **Sticky search position on TrialsPage mobile (B1):** Should the search bar stick above the Questions/Catalog toggle (always visible), or should only the toggle stick and search remain in the hero (current behavior)? These two sticky elements cannot both sit at `top:0` simultaneously without a layout shell variable for header height.

2. **TrialsPage chip rail semantics (B2):** Does "Recent" mean recently added to NeuroWiki (curation date) or recently published (trial year)? Does "Guidelines" filter to trials cited in AHA/ASA guidelines specifically, or any trial with a `guidelineImplication` field?

3. **ResidentToolkit content structure (C1):** The Phase 3 mockup proposes four categories: Quick Reference, Procedures, Communication Templates, and Personal Tracker. Is "Personal Tracker" a real planned feature with data persistence, or should it be dropped in favor of a fourth content category? What items populate Quick Reference and Procedures?

4. **Calculators Favourites chip (B3):** Should the Favourites chip coexist in the category pill row alongside "All" / "Severity" / "Risk" / "Classification"? Or should it appear only when the user has starred at least one calculator?

5. **cmd-K global search (B5):** Is a command-palette-style global search approved as a feature for the next product cycle? This is the highest-impact competitive gap identified in Phase 1 research (Pattern 2). It requires a Class D plan, system-architect review, and new component work before any UI is built.

6. **ResidentToolkit lucide-react consolidation (C2):** Are there any lucide icons in ResidentToolkit whose Material Icons equivalents would be visually different in a meaningful way (e.g., the `Brain` icon has no Material Icons equivalent)? V to confirm acceptable icon substitutions before C1 rebuild begins.

---

### @ui-architect — Sign-off

**Spec cited:**
- `docs/design-audit-2026-05-14/competitive-research.md` (Phase 1, all 10 patterns)
- `docs/design-audit-2026-05-14/page-audit.md` (Phase 2, all 5 pages + cross-cutting findings)
- `docs/specs/mockups/home-2026-05-14-proposal.html` (Fix A + Fix B + mobile full-page)
- `docs/specs/mockups/trials-catalogue-2026-05-14-proposal.html` (chip rail, sort dropdown, sticky search, trial card anatomy)
- `docs/specs/mockups/resident-toolkit-2026-05-14-proposal.html` (full hub anatomy rebuild)
- `docs/specs/mockups/resident-guide-2026-05-14-proposal.html` (landing state H1, article typography, FAB, teal-* replacement)
- `.claude/skills/design-tokens/SKILL.md` (token constraints)
- `TASKS.md` L4 PENDING items (lines 118–128)

**Layout decisions:** Synthesis only — no layout changes made in this document.

**Deviations from spec:** None introduced. All proposals reference existing locked mockups or the Phase 3 proposals (status: awaiting V approval).

**Risks flagged:**
- B1 (sticky search) has a z-index conflict with the existing sticky Toggle that must be resolved before implementation. Needs mobile-first-developer confirmation.
- C1 (ResidentToolkit rebuild) is the largest single change in this roadmap. The 4-category content structure requires V approval before any engineering starts — the Phase 3 mockup uses placeholder content.
- B5 (cmd-K search) is new surface territory; will require system-architect review and performance audit given bundle impact.
- A8 (FAB) requires `--tab-bar-height` CSS variable to be defined in the layout shell. If it is not, the calc() will degrade to 0 and the fix won't work on all devices.

**Status:** ready
