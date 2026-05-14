# Design Critique — 2026-05-14 mockup proposals

**Date:** 2026-05-14
**Reviewer:** design-critique (via general-purpose agent, skill: `design:design-critique`)
**Status:** findings only — no mockup changes
**Inputs:** four Phase 3 proposal HTMLs + three locked references in `docs/specs/mockups/`, plus `.claude/skills/design-tokens/SKILL.md`.

A general note that applies to all four: each proposal opens with a clear `STATUS: PROPOSAL — NOT LOCKED` HTML comment, names the Phase 2 source-friction IDs it claims to fix, lists tokens used vs explicitly excluded, and uses a dark "annotation" panel below each frame to call out the diffs. The annotation-block convention is consistent across all four — that is real strength. The variance is in how much new design surface each proposal invents, which is where most of my concern sits.

---

## Mockup 1 — `trials-catalogue-2026-05-14-proposal.html`

### Usability
The proposal claims to fix four pieces of friction from Page2-D and Page2-G: dead chips, dead Year sort, arbitrary search focus shadow, and search scrolling away on mobile. It addresses all four concretely. The sticky search wrapper (lines 127–135) is the highest-leverage change — at 375px the search bar now persists once the hero scrolls off, which is exactly what a bedside clinician with one hand on the phone needs. Replacing the dead Year button with a real `Recent / Most Cited / A–Z` sort dropdown (lines 193–209, 604–632) turns a non-functional control into a useful one without inventing a new pattern. The catalog/Questions toggle is preserved from the existing TrialsPage anatomy. One usability gap: the chip rail (Favourites, Recent, New 2024–25, Guidelines) is shown only in mutually exclusive "active" snapshots — the mockup does not show whether chips compose (can I have Favourites + EVT?) or are radio-style. That ambiguity should be resolved in copy or a small comparison panel before lock.

### Visual hierarchy
The hero block ("89 trials. One search box.") at the top of both viewports is the strongest visual element, which is correct — the eye lands on the value proposition first, then the search bar, then the chips, then the catalog. The category section headers (lines 211–222) use a 6px colored dot + small uppercase name + count, which is restrained — they identify the section without competing with the trial cards. Trial-card hierarchy follows the trials-legend-reference: ID + year/journal on line 1, finding on line 2, NNT/baseline-risk tag on line 3. That is the right ladder for "scan in 5 seconds." The bl-tag color split (positive emerald vs neutral slate vs cobalt) is the only place where eye discrimination might break down with severity colorblindness, but text content carries the meaning.

### Consistency vs locked references
Strong alignment to `trials-legend-reference.html`. The cat-section header anatomy, trial-card layout, the `bl-tag` token, the cobalt-soft active state, and the `font-feature-settings: "cv11"` baseline are all carried forward verbatim from the reference (lines 224–259 mirror trial-card patterns). Divergences from the reference are deliberate and named: sticky search wrapper, sort dropdown, pagination control, and the catalog/Questions toggle. The desktop sidebar (lines 898–930) introduces a category list left rail — that is *new* anatomy not present in the reference. It is plausible and useful at 1240px, but it should get an explicit callout that this is invented for desktop and not derivative of the reference.

### Token discipline
Clean. The `:root` block (lines 25–40) declares cobalt, cobalt-50/100/700, cobalt-soft, hair, border, ease-discovery, shadow-card-hover, and the five category color tokens — all of these match `design-tokens` SKILL.md. The annotation block explicitly excludes `blue-*, teal-*, indigo-*, violet-*, font-extrabold, shadow-lg/xl/md, border-2, rounded-2xl` (line 16). Spot-checks: `bl-tag.negative` uses `#dc2626` (red-600) for negative trials and `bl-tag.positive` uses `#059669` (emerald-600) — both are legal tokens. Inline hexes like `#10b981` and `#7c3aed` appear for category dots, which is acceptable because the design-tokens skill itself defines those at "trial category dot colors" with raw hexes. One minor: `font-feature-settings "cv11"` (line 46) is duplicated from the reference rather than aliased — that is fine.

### Information density
On mobile the catalog shows hero + sticky search + chip rail + toggle + filter pills + sort + section header + three trial cards visible before pagination. That is dense — but the cards are short (3 lines each), spacing between cards is `border-bottom: 1px solid var(--hair)` only with no margin, and the design-tokens skill explicitly supports this density. At 375px the user sees value before the fold. The Questions view (lines 749–790) shows 8 question items in a single column — appropriate density. The desktop catalog (lines 933–1006) shows 6 trial cards across the visible viewport before pagination — could possibly fit more given the wide column, but the spacing is comfortable.

### Mobile/desktop equivalence
Mostly equivalent. Both viewports have the hero, search, chip rail, toggle, category sections, trial cards, and pagination. Two desktop-only affordances appear: (1) the persistent search box in the header (line 843–847) with a `⌘K` hint, and (2) the category sidebar (lines 898–930). Both are reasonable desktop-only patterns — the header search is a power-user shortcut and the sidebar is a navigation aid that mobile doesn't need because the category sections are inline. One asymmetry to flag: the mobile catalog shows only IVT and EVT sections fully before pagination, while desktop has the same. The Questions view appears in mobile but not in the desktop section shown — desktop is locked to Catalog view only. The desktop annotation block should explain why, or show the desktop Questions view too.

### Edge cases shown
Good coverage. Empty state shown explicitly (lines 803–822) — "No trials match 'cardiac MRI'" + Clear filters button — this addresses Phase 1 Pattern 9 by naming the filter responsible. Sort dropdown expanded state shown (lines 605–632). Active chip state with results shown (lines 635–693). Missing: long-trial-name truncation (NINDS-tPA is short; what about MRACE-CHINA-3 or similar?), what happens when a category has zero filtered trials, and the "Favourites = empty" state when user has zero favourites. These are realistic states for production.

### Annotation quality
Top-of-file comment (lines 2–17) names Phase 2 IDs (Page2-D, Page2-G, Page2-C) and Phase 1 patterns (P2, P4, P10) correctly. Per-frame annotations (lines 592–601, 626–632, 817–822) are specific and trace back to the rationale. The dark-panel format is consistent. One quibble: the catalog annotation doesn't call out that the desktop sidebar is invented anatomy.

### Verdict: **refine** (close to ready-to-lock — minor refinements)
- **Refinements requested:**
  - Clarify whether chip rail entries compose with category filter pills (radio vs multiselect)
  - Add edge cases: long trial ID truncation, zero-results-per-category, empty Favourites
  - Annotate the desktop category sidebar as invented anatomy, not derivative of the locked reference
  - Show desktop Questions view (or note explicit decision not to)
- **Strengths to preserve:**
  - Sticky search wrapper — addresses the worst mobile friction
  - Sort dropdown replacing dead Year button
  - All chips functional with representative results
  - Empty state with named filter and single recovery action
  - Token discipline is exemplary

---

## Mockup 2 — `resident-toolkit-2026-05-14-proposal.html`

### Usability
The proposal frames itself as a clean-slate alignment to `hub-reference.html` anatomy. The four toolkit categories (Quick Reference, Procedures, Communication Templates, Personal Tracker) are reasonable for the audience — a resident on call needs fast retrieval of drug dosing, procedure steps, and template language. The accordion pattern for templates (lines 393–442) is appropriate — full template content collapses by default and expands inline. The Personal Tracker empty state (lines 455–465) with a primary "Log a case" CTA is good UX. One usability gap: this is a much higher-information page than the current ResidentToolkit, which the audit flagged as needing polish, not a full rebuild. The proposal effectively re-invents the page rather than fixing it. That is a planning question, not a design defect, but the orchestrator should be aware before lock.

### Visual hierarchy
The eyebrow + H1 + sub at the top of mobile (lines 269–272) follow the hub spec exactly: `text-[10px] tracking-widest` eyebrow, `text-[24px] font-medium` H1 — these were the audit-flagged conformance issues (Page4-B, Page4-A). The stats strip (89 / 12 / 7) at lines 281–294 gives the user a sense of catalog size before they dive in. The numbered section labels (01, 02, 03, 04) before each section name are a slight overhead — they introduce a new visual element ("01" eyebrow inside the section header) that isn't in `hub-reference.html`. Plausible, but invented. The quick-access tile grid (lines 308–343) uses tinted backgrounds (`cat-cobalt`, `cat-emerald`, `cat-amber`, `cat-slate`) with a small icon, label, sub-line, and a corner "Calc/Ref/Path" badge — this is the densest unit on the page and works visually.

### Consistency vs locked references
Mixed. The H1 weight, eyebrow tokens, hairline borders, and Material Icons references all align to `hub-reference.html`. The pill-row pattern (lines 191–204) is faithful, with the `pill-cobalt-active` proposal noted as a divergence (and resolved explicitly in the pill states panel, lines 519–528). However, this page introduces multiple anatomy elements that are *not* in the hub reference: numbered section eyebrows (01/02/03/04), the stats strip box, the four-category quick-access grid with corner badges, the inline expanded accordion body with SBAR sections, the desktop right-rail "Landmark Trials" sidebar. None of these are wrong per se, but the proposal claim "clean-slate alignment to hub-reference anatomy" is overstated — it is *inspired by* the hub reference, with a lot of new anatomy added.

### Token discipline
The annotation block excludes the forbidden colors and weights (lines 17–19). Spot-checks of the CSS: cobalt, cobalt-50/100, cobalt-soft, hair, border — all defined and used (lines 31–37). The four card categories use emerald, amber, and a "slate" variant; the colors derive from category accent fills consistent with the home reference. One concern: the section eyebrow uses `text-[10px] font-bold tracking-widest` but the design-tokens skill defines eyebrow as `text-[11px] font-semibold tracking-[0.08em]` — there is a small drift (10 vs 11, bold vs semibold, widest vs 0.08em). This is the exact category of micro-drift the audit was trying to eliminate. The proposal annotation calls this "exact spec token" but doesn't match my reading of the design-tokens skill. Worth a 60-second reconciliation before lock.

### Information density
Mobile shows hero + search + stats strip + four sections (each with a 2-column or 1-column grid) inside a `padding-bottom:96px` main. That is a lot. From eyebrow to "Log a case" empty state the page is approximately 1500–1800 vertical pixels. For a clinician at the bedside this is too much to scroll for a single tool. Compare to the existing ResidentToolkit — the audit flagged it for token drift, not for being too sparse. Adding stats strip + four full sections + accordion expanded by default + tracker empty state is feature creep. The desktop variant fits the density better because the page can spread to two columns (main + sidebar), but on mobile the page becomes a long scroll.

### Mobile/desktop equivalence
Asymmetric — desktop adds a "Landmark Trials" right rail sidebar (lines 704–726) that does not exist on mobile. The sidebar shows three trial entries with NNT and a "View all 89 trials" link — this is a contextual rail that links the toolkit page into the trials registry. Functionally useful on desktop. The story works; the asymmetry is justified. The desktop hero stat strip is laid out horizontally (lines 594–608) vs vertical on mobile. Same content, different layout — that's correct responsive behavior.

### Edge cases shown
Personal Tracker empty state shown (lines 455–465) — good. Accordion expanded state shown (lines 407–417). Pill states (unselected/hover/selected) shown in a dedicated panel (lines 494–547). Missing: search "no results" state, accordion with very long template content (the SBAR shown is short — what about a 12-section consult note?), and the "Log a case" filled state once a resident has logged 5 cases. The empty state covers the first-load case but not the populated case.

### Annotation quality
Top-of-file comment (lines 2–20) names Page4-F, Page4-B, Page4-C, Page4-A, Page4-D — all correct Phase 2 IDs. Per-frame annotations are specific. The pill-states detail panel with side-by-side comparison is helpful. Three things missing from the annotations: (a) the numbered section eyebrows (01/02/03/04) are not flagged as invented anatomy; (b) the stats strip is not flagged as invented anatomy; (c) the desktop right-rail "Landmark Trials" is not flagged as invented anatomy. All are pictured but not annotated as additions beyond the audit scope.

### Verdict: **re-author** (mostly because scope crept beyond the audit's intent)
- **Refinements requested:**
  - Decide: is this a *polish* of the existing ResidentToolkit (audit intent) or a *rebuild* (current proposal)? If polish, strip out invented sections (stats strip, numbered eyebrows, landmark-trials rail) and keep token fixes only. If rebuild, escalate to a proper Class C+ planning gate with V approval before continuing.
  - Reconcile eyebrow token (text-[10px] tracking-widest vs design-tokens skill's text-[11px] tracking-[0.08em])
  - Reduce mobile information density — 4 sections + accordion + tracker is too long for a single page
  - Annotate invented anatomy in the dark panels
- **Strengths to preserve:**
  - Hub-reference H1 weight (font-medium), correct eyebrow weight intent
  - Material Icons over lucide-react (aligns to spec)
  - Hairline borders, rounded-xl, no shadows
  - Accordion-based template surfacing is the right pattern for templates
  - Pill state comparison panel is a clean way to document the proposal

---

## Mockup 3 — `resident-guide-2026-05-14-proposal.html`

### Usability
This is the most warranted proposal — Page5 had the most spec violations in the audit (no H1, `blue-*` active state, `teal-*` CTAs, `text-3xl md:text-5xl font-extrabold` article H1, `text-base leading-8` body, duplicate back button, FAB overlap). The proposal fixes each one explicitly. The landing state with a real H1 "Clinical Guides" + "Reference" eyebrow (lines 203–205) is correct — the prior state had no landing H1 at all, which the audit flagged as a heading-hierarchy break (Page5-A). The article view (lines 392–500) has a single back button in the sticky header (line 400) and removes the duplicate inside the article. CTAs use `neuro-*` for navigation and `emerald-*` for the positive-signal "Stroke Code Pathway" (lines 432–446) — that color split is meaningful and matches the design-tokens severity logic.

### Visual hierarchy
The landing state hierarchy is clean: eyebrow → H1 → sub → search → categorized list (Stroke / Seizure / Headache / Critical Care). The active item ("Stroke Basics") uses `bg-rgba(23,70,162,0.07)` + `border-left: 2px solid #1746A2` + cobalt text (lines 96–102) — strong but not garish. The article view hierarchy: eyebrow → H1 → last-reviewed meta → section headers → body text. The "Last reviewed 2026-02-14 · Reviewed by medical-scientist" line (line 415) is a clinical-safety affordance that lives where it should — directly under the title.

### Consistency vs locked references
This proposal has no direct locked reference for the article view (the audit references `hub-reference.html` for the landing state but no article reference exists in the mockup directory). The proposal therefore makes design decisions for the article surface based on spec language rather than reference comparison. The article-section-h pattern (font-semibold 17/18px), article body (text-sm leading-1.55), and the article-cta (cobalt-soft fill) are reasonable extensions but ultimately new anatomy. The desktop 3-column layout (sidebar nav + article body + ToC sidebar, lines 532–620) is a familiar pattern from doc-site UI (think MDN, Stripe docs) and works for long-form clinical content.

### Token discipline
Clean. The annotation block (lines 17–19) excludes the right tokens. CSS spot-checks: `var(--cobalt)`, `var(--cobalt-soft)`, `--hair`, `--border`, `--tab-bar-height` (line 35) all defined. The `article-cta.emerald` variant (lines 128–133) uses `rgba(16,185,129,0.06)` and `#059669` text — those are emerald-50/600 equivalents, consistent with severity tokens for "favorable" / positive signals. The FAB CSS comment (line 146) shows the production value: `bottom: calc(var(--tab-bar-height,0px) + env(safe-area-inset-bottom,0px) + 1rem)` — this matches the design-tokens skill's safe-area pattern exactly. One concern: the article-section-h font sizes (17 mobile / 18 desktop, lines 112–113) don't appear in design-tokens skill's typography scale. They are reasonable interpolations but technically invented. Not a blocker.

### Information density
Mobile landing shows hero + search + four categories with 12 guide items visible in a single screen — that is reasonable for a "directory" page. Article view shows H1 + 4 sections + related-trials list + tab bar — also reasonable. The desktop variants have appropriate density for the wider canvas. The article body at text-sm leading-1.55 is at the boundary of what is comfortable for long-form clinical prose — text-base (16px) might be marginally easier to read for a fatigued resident. The audit drove away from text-base because the existing was at `text-base leading-8` (which is too loose), but `text-sm leading-1.55` may have over-corrected. A `text-[15px]` middle ground might serve better at the bedside. Worth a 30-second eyeball check during V's review.

### Mobile/desktop equivalence
Both viewports have landing state and article view fully laid out. Desktop adds a left sidebar nav and a right ToC rail (lines 599–620) — both are appropriate desktop affordances. The desktop landing state shows the sidebar with an empty main area + 3 starter CTAs (lines 357–376) — that handles the "user lands on /guide with nothing selected" case well. Mobile uses the tab bar + a search bar at top of the directory; desktop puts the nav permanently in the sidebar and the search in the header. Both stories are coherent and complete.

### Edge cases shown
Two full states shown: landing (mobile + desktop) and article (mobile + desktop). The "Last reviewed" line addresses the citation-currency requirement. The FAB position (line 138, plus production-value CSS comment at line 146) addresses Page5-E. Missing: empty-search state, search-with-results, long-article-with-many-ToC-items, an article whose `last_reviewed` is past its review window (clinical-safety edge case from CLAUDE.md §13.7). The article-currency edge case is the highest-value missing state — a clinician should see a visible warning when an article's `last_reviewed` is past the window per the freshness matrix.

### Annotation quality
Top-of-file comment (lines 2–19) names Page5-A through Page5-G correctly. Per-frame annotations are specific (lines 290–297, 491–500, 626–633). The FAB production-value CSS comment is an unusually helpful detail — it lets the implementer copy the exact production token. One omission: the article-section-h font sizes (17/18) and the breadcrumb pattern on desktop (lines 525–529) are not flagged as invented anatomy.

### Verdict: **refine** (close to ready-to-lock — minor refinements)
- **Refinements requested:**
  - Add the article-stale-citation warning state (when `last_reviewed` past window)
  - Spot-check body text size — consider `text-[15px]` middle ground between text-sm (14) and text-base (16)
  - Annotate the desktop breadcrumb and the article-section-h font sizes as invented
  - Add a search-with-results state on mobile landing
- **Strengths to preserve:**
  - Landing state H1 fixes the heading hierarchy break — most important fix in this proposal
  - Single back button — removes the duplicate UX
  - FAB CSS comment with production value is exemplary documentation
  - Color discipline (neuro-* navigation, emerald-* positive-signal) is meaningful and correct
  - Last-reviewed line placement is correct clinical UX

---

## Mockup 4 — `home-2026-05-14-proposal.html`

### Usability
This is the smallest proposal by scope — it fixes two specific issues from Page1: the 16px star button (Page1-G) and the pill active state (Page1-D). The before/after comparison panels (lines 209–322 for the star button, lines 327–429 for the pill) are pedagogical and clear. The 44px touch target fix with `p-2 -m-1.5` negative-margin pattern (lines 264–289) is the standard NeuroWiki idiom from CALCULATOR_SPEC.md §2.4 and is reused correctly. The cobalt-fill pill active state aligns Home and Calcs to the TrialsPage pattern that already exists in production. Both fixes are surgical and have minimal blast radius.

### Visual hierarchy
The home page itself (lines 442–end) is essentially the locked `home-reference.html` anatomy, untouched. The hero "What's the case?" with "By case" eyebrow + sub is the visual focal point. The featured rail (lines 462–469) and the scenario expansion pattern are preserved from the reference. The before/after demo frames have their own internal hierarchy (red overlay for the broken 16px state, green overlay for the corrected 44px state) which makes the fix instantly readable. The pill-state comparison frames (lines 332–429) follow the same pattern — three states stacked vertically with the active state callout.

### Consistency vs locked references
This is the most faithful-to-reference proposal of the four. The annotation block explicitly states "All other anatomy kept identical to home-reference.html — no new sections invented" (line 11). The mobile and desktop home views appear to preserve the home-reference layout exactly. The pill active state proposal is *not* a divergence from the home reference but a deliberate override — the home reference uses `bg-slate-50` active (lines 47–51 of home-reference.html), the proposal changes it to cobalt-soft fill to match TrialsPage. That tension is exactly the cross-page consistency problem the audit flagged, and the proposal resolves it by choosing the TrialsPage pattern as the canonical winner. That is the right call given TrialsPage is the higher-traffic, more-mature surface.

### Token discipline
Clean. The `:root` block (lines 25–35) declares neuro-50/100/400/500/600/700/900, cobalt-soft, hair, border. The annotation block (lines 13–15) excludes forbidden colors. The proposal explicitly uses CSS variables `var(--color-neuro-500)` etc. rather than Tailwind utilities, which is consistent with the home-reference approach. The optional cmd-K search section (lines 167–180) uses tokens correctly. No invented values, no forbidden colors.

### Information density
Density is inherited from home-reference and is appropriate. The before/after demo frames are sparse on purpose — they isolate the fix. The full-page home view at the bottom shows the typical density of the production home page with both fixes applied. Mobile shows hero + featured rail + scenarios with one expanded + tab bar, which is the audit-blessed default.

### Mobile/desktop equivalence
The two fixes apply identically to both viewports. The before/after frames are shown only at 375px mobile because the touch-target fix is mobile-critical and the pill-state fix presents the same way on both viewports. A desktop full-page state showing both fixes applied would round out the deliverable but isn't strictly necessary — the fixes are conceptual and CSS-only.

### Edge cases shown
Star button fix shows: broken (16px), corrected (44px) with both unfavourited and favourited states. Pill state fix shows: unselected, hover, active across current and proposed patterns plus the TrialsPage reference. The cmd-K stretch goal is labeled `[OPTIONAL]` (line 12 of annotation) and shown as a distinct stretch surface. Missing: what happens to the negative-margin offset when the row card is at the very top or bottom of a scrolling list (does the expanded touch area overflow into adjacent content?). Spot-test the `-m-1.5` math in a real layout before lock.

### Annotation quality
Top-of-file comment (lines 2–16) names Page1-G and Page1-D correctly. Per-frame annotations (lines 241–244, 293–297, 362–365, 395–399, 422–425) explain each comparison panel clearly. The code snippet panel (lines 300–321) showing the before/after className strings is excellent — an implementer can copy/paste it. The cmd-K stretch is correctly labeled as optional and not part of the lock scope.

### Verdict: **ready-to-lock** (with one verification step)
- **Refinements requested:**
  - Verify the `-m-1.5` negative-margin offset behaves correctly at list edges (top/bottom row of a long list)
  - Optionally: add a desktop full-page view with both fixes applied to round out the artifact
- **Strengths to preserve:**
  - Smallest possible blast radius — two surgical fixes, nothing else
  - Before/after pedagogy with red/green overlays is instantly readable
  - Code snippet panel with concrete className strings
  - Cross-page consistency resolved by picking TrialsPage as canonical
  - cmd-K labeled as a stretch goal, not bundled into the lock

---

## Cross-cutting observations

1. **Annotation discipline is strong across all four.** The dark-panel format, the Phase 2 ID references in the top-of-file HTML comment, and the per-frame call-outs are consistent. This pattern should become the house style for future mockup proposals.

2. **Scope creep risk varies by proposal.** Mockup 4 (Home) is exemplary — two surgical fixes, no invented anatomy. Mockup 3 (Resident Guide) introduces some invented anatomy (article-section-h sizes, desktop breadcrumb) but it is bounded and necessary because no article-view reference exists. Mockup 1 (Trials Catalogue) introduces a desktop sidebar that should be annotated as invented. Mockup 2 (Resident Toolkit) introduces the most invented anatomy (stats strip, numbered eyebrows, landmark-trials rail) without flagging it — this is the proposal most at risk of "the polish became a rebuild."

3. **Eyebrow token has a small drift.** Mockup 2 declares the eyebrow as `text-[10px] font-bold tracking-widest`. The `design-tokens` SKILL.md defines eyebrow as `text-[11px] font-semibold tracking-[0.08em] text-slate-400`. The reference HTMLs also use 10px font-bold tracking-widest. This is a CLAUDE.md §3 conflict — references and SKILL.md disagree at the same tier. Should be resolved by an explicit ADR or SKILL.md update before mockups lock.

4. **Edge case coverage is uneven.** Empty states are covered in Mockup 1 (trials filter zero-results) and Mockup 2 (Personal Tracker). Stale-citation states are not covered in Mockup 3 despite being the most clinically consequential. Long-content overflow is not covered anywhere. A house standard for "minimum edge cases per mockup" would help.

5. **Production CSS hints when introduced are excellent.** The FAB `bottom: calc(...)` comment in Mockup 3 and the className code snippet in Mockup 4 are the most actionable parts of those mockups. Worth requiring this for any mockup that proposes a token-level production change.

---

## Overall recommendation

**Mockup 4 (Home) is ready to lock as-is** pending the `-m-1.5` edge-case verification. The other three need refinement before lock. **Mockup 1 (Trials Catalogue) is closest to ready** — small annotation additions (label the desktop sidebar as invented) plus a chip-rail composition decision will get it there. **Mockup 3 (Resident Guide) is the most clinically valuable** because Page5 had the worst spec violations, but it needs the stale-citation edge case and a body-text size spot-check before lock. **Mockup 2 (Resident Toolkit) should be sent back for re-authoring** — not because the design is bad, but because the scope drifted from "polish to spec" to "redesign the page," which is a Class C decision that needs V's explicit approval before the mockup proceeds. The eyebrow token drift in Mockup 2 should also be resolved at the SKILL.md / reference level before any of these mockups lock, because it is a cross-cutting issue.
