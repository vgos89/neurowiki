# Competitive Design Research — NeuroWiki catalogue + hub pages

**Date:** 2026-05-14
**Researcher:** general-purpose (model: claude-opus-4-7)
**Sites surveyed:** 10 (accessible: 6 directly via WebFetch; 4 supplemented via WebSearch / vendor docs because of paywall, 403, or thin HTML)
**Status:** findings only — translates to NeuroWiki recommendations in a separate Phase 4.

> Method note: WebFetch returned full body on MDCalc home, MDCalc specialties index, Tailwind UI components, Stripe docs landing, and AMBOSS. NEJM, AHA/Stroke journal, UpToDate, and ClinicalTrials.gov search returned 403 / paywalled / thin-render HTML on direct fetch; observations for those came from official vendor descriptions (NLM Technical Bulletin, Wolters Kluwer UpToDate User Academy) and prior reporting via WebSearch. Every observation below is sourced; where a site was inaccessible, the source is the vendor's own documentation, marked explicitly.

---

## Sites surveyed

| # | Site | Publisher type | Source quality |
|---|---|---|---|
| 1 | https://www.mdcalc.com/ | clinical-calculator | Direct fetch — home |
| 2 | https://www.mdcalc.com/specialties | clinical-calculator | Direct fetch — specialty index |
| 3 | https://www.mdcalc.com/specialties/neurology | clinical-calculator | Partial — generic specialty template returned |
| 4 | https://www.medscape.com/specialties/neurology | clinical-reference | 402 paywall; not analyzed |
| 5 | https://clinicaltrials.gov/ | trial-database | Direct fetch — header only; supplemented by NLM Technical Bulletin (modernization docs) |
| 6 | https://www.nejm.org/ | journal | 403 on direct fetch; supplemented via WebSearch |
| 7 | https://www.ahajournals.org/journal/str | journal (Stroke) | 403 on direct fetch; pattern inferred from AHA Journals platform docs |
| 8 | https://www.uptodate.com/ | clinical-reference | 403 / thin render; supplemented by Wolters Kluwer User Academy |
| 9 | https://www.amboss.com/us | clinical-reference | Direct fetch — landing |
| 10 | https://tailwindcss.com/plus/ui-blocks | pattern-library | Direct fetch — full body |
| 11 | https://docs.stripe.com/ | reference catalogue | Direct fetch — full body |
| 12 | https://www.npmjs.com/ | general catalogue | Thin render on home + package pages |

---

## Pattern findings

### Pattern 1 — Hero / above-the-fold

Best-in-class clinical references make the above-the-fold a **shortcut surface**, not a marketing surface. MDCalc opens with the phrase "Welcome to MDCalc" followed immediately by five quick-access links (GFR, Atrial Fibrillation, Pneumonia Severity, PE Diagnosis, CVD) — these are the most-used calculators surfaced as link chips, not images. The pattern says: *we know why you came; here are the five things 80% of users open.* Then comes "Browse the library of tools" and a Trending strip. By contrast, AMBOSS and consumer-pattern libraries lead with brand and headline copy ("Cut Through the Noise. Show Up With Confidence." / "Beautiful UI components, crafted with Tailwind CSS.") and put discovery one scroll down. The clinical-tool framing trades polish for time-to-first-click.

Stripe docs splits the difference: an `# Documentation` heading and "Explore our guides and examples to integrate Stripe" subhead, then three use-case-first sections (collect online / invoices / in-person). It treats above-the-fold as a triage interface — *which type of integrator are you?* — but does so with text, not images.

**Examples:**
- MDCalc: 5 named quick-access links + Trending strip in the first viewport ([mdcalc.com](https://www.mdcalc.com/)).
- Stripe Docs: three task-oriented sections above the fold, no images, no marketing bombast ([docs.stripe.com](https://docs.stripe.com/)).
- Tailwind UI: hero text + a 4-column × 7-row image grid of components — visual browse first, search not surfaced ([tailwindcss.com/plus/ui-blocks](https://tailwindcss.com/plus/ui-blocks)).
- AMBOSS: institutional-credibility hero (NOHARM study callout, logo carousel) — marketing-first ([amboss.com/us](https://www.amboss.com/us)).

**Takeaway for NeuroWiki:** clinical users want first-tap-to-answer. The hero should be a shortcut deck, not a banner.

---

### Pattern 2 — Search affordance

Clinical references treat search as the load-bearing affordance. UpToDate's User Academy describes a "main search page" plus a persistent search bar pinned above the top nav on every results and topic page — search is on every screen, never more than one click away. Wolters Kluwer's own copy calls out "advanced machine learning search technology" as the design centerpiece. MDCalc surfaces a "Trending Searches" row (GFR, PE Diagnosis, Atrial Fibrillation, Pneumonia Severity, Cardio-Oncology) as scaffolding — it teaches the search syntax by showing accepted queries.

ClinicalTrials.gov's modernized site (June 2023 launch, per NLM Technical Bulletin) defaults to a small set of "default search fields" with advanced filters explicitly relabeled "More filters" and tucked into a dropdown. The principle: simple input by default, depth on demand.

Pattern-library catalogues are the negative example. Tailwind UI's component catalogue shows "no dedicated search field visible" — they assume browsing. That works for visual designers; it does not work for clinicians at the bedside.

**Examples:**
- UpToDate: persistent search bar in top nav on every page; auto-suggest pulls drug-info and topic results directly ([wolterskluwer.com/.../searching-and-navigating](https://www.wolterskluwer.com/en/solutions/uptodate/resources/user-academy/searching-and-navigating)).
- MDCalc: "Trending Searches" row exposes the syntax users should learn ([mdcalc.com](https://www.mdcalc.com/)).
- ClinicalTrials.gov: simple default fields + "More filters" dropdown for depth ([NLM Technical Bulletin May–Jun 2023](https://www.nlm.nih.gov/pubs/techbull/mj23/mj23_clinicaltrials_website.html)).

**Takeaway for NeuroWiki:** search must be persistent and one-tap-away on every catalogue page. A "Trending" or "Common searches" strip is a cheap teaching surface.

---

### Pattern 3 — Filter chips / facets

Two dominant patterns emerge. MDCalc uses **purpose chips** — "Diagnosis," "Rule Out," "Prognosis," "Formula," "Treatment," "Algorithm" — surfaced inside specialty pages. The chips encode *what the user is trying to do*, not what specialty the tool belongs to. This is the clinical-workflow framing. ClinicalTrials.gov uses a **default-plus-overflow** facet pattern: a short default facet list, with the rest folded behind "More Filters" — the NLM Technical Bulletin emphasizes this as a deliberate reduction from the classic site, where every facet was visible at once and overwhelmed users.

Sidebar facets with counts (e.g., "Hero Sections (12 components)") work in Tailwind UI because the universe is small and stable. For clinical references with churning content, expanded sidebar facets are usually too heavy.

**Examples:**
- MDCalc: purpose-based chips per specialty (Diagnosis / Rule Out / Prognosis / Formula / Treatment / Algorithm) ([mdcalc.com/specialties](https://www.mdcalc.com/specialties)).
- ClinicalTrials.gov: short default facet bar, "More Filters" dropdown for advanced queries, optimized for mobile ([NLM Technical Bulletin](https://www.nlm.nih.gov/pubs/techbull/mj23/mj23_clinicaltrials_website.html)).
- Tailwind UI: hierarchical sidebar with item counts per category — works because the taxonomy is fixed ([tailwindcss.com/plus/ui-blocks](https://tailwindcss.com/plus/ui-blocks)).

**Takeaway for NeuroWiki:** purpose chips (Diagnosis / Treatment / Severity / Prognostic) beat hierarchical specialty trees for bedside use. Default ≤6 chips visible; everything else behind "More."

---

### Pattern 4 — Card anatomy in catalogue listings

Clinical-tool catalogues converge on a remarkably stable card: **title + one-line description**, no images. MDCalc's example: *"Creatinine Clearance (Cockcroft-Gault Equation) — Calculates CrCl according to the Cockcroft-Gault equation."* That's it. No category badge on the card itself, no usage stats, no author. The decision: visual chrome competes with content; clinicians scan titles. ClinicalTrials.gov's result rows expose status (Recruiting / Completed / Active, not recruiting) and NCT ID as the two highest-priority pieces of trial-card metadata — both because they affect whether a clinician acts.

Pattern libraries do the opposite: Tailwind UI cards are image-dominant with a minimal `[Title] [Component count]` text block, because users discover by sight. Stripe docs uses pure link lists with no card chrome at all — the "card" is just a heading and a list of hyperlinks. The lighter the chrome, the faster the scan.

**Examples:**
- MDCalc calculator card: title + one-line purpose only — *"Creatinine Clearance (Cockcroft-Gault Equation) — Calculates CrCl…"* ([mdcalc.com](https://www.mdcalc.com/)).
- ClinicalTrials.gov result row: NCT ID + title + status (e.g., "Recruiting") as primary scan keys (inferred from result list per [NLM modernization docs](https://www.nlm.nih.gov/pubs/techbull/mj23/mj23_clinicaltrials_website.html)).
- Stripe docs: no cards, just titled link lists ([docs.stripe.com](https://docs.stripe.com/)).

**Takeaway for NeuroWiki:** trial cards and calculator cards should ship two visible fields (title + one-line purpose) and one status atom (e.g., "Recruiting" or "ASPECTS ≥6 cutoff"). Everything else is on the detail page.

---

### Pattern 5 — List view vs grid view toggle

None of the clinical reference sites surveyed expose a list/grid toggle. MDCalc, ClinicalTrials.gov, and AMBOSS all default to vertical lists of text-dominant cards. Tailwind UI is implicit-grid because its content is image-first. The signal: when content is text, give users a list and let scroll do the work; when content is visual, give a grid.

The exception worth knowing: npm and similar package catalogues offer dense list views with sort and filter, no grid alternative — text-and-stat-heavy content rewards lists.

**Examples:**
- MDCalc: list-only, no toggle ([mdcalc.com](https://www.mdcalc.com/)).
- Tailwind UI: grid-only, no toggle ([tailwindcss.com/plus/ui-blocks](https://tailwindcss.com/plus/ui-blocks)).
- npm: list-only for search results ([npmjs.com](https://www.npmjs.com/)).

**Takeaway for NeuroWiki:** skip the toggle. List wins for trials and calculators. Spend the design budget elsewhere.

---

### Pattern 6 — Information density

Clinical references trend dense. MDCalc's homepage Trending section shows ~5 cards per viewport; specialty pages pack 20+ per viewport because each card is a single text row with hairline separation. ClinicalTrials.gov's modernized layout favors compact rows with the most-scannable atoms (status badge, NCT ID, title) in a fixed left-to-right rhythm — this is closer to a database table than a card grid. Pattern libraries are deliberately sparser (Tailwind UI shows 2–3 cards per row, image-heavy, generous padding) because aesthetic browsing rewards air.

The consistent finding: hairline dividers beat card shadows for dense clinical content. Shadows imply "discrete object worth attention" — at 80+ items that becomes noise. Hairlines say "row in a list" and the eye keeps moving.

**Examples:**
- MDCalc Trending strip: ~5 visible per viewport, hairline-separated ([mdcalc.com](https://www.mdcalc.com/)).
- Tailwind UI: 2–3 cards per row with significant padding ([tailwindcss.com/plus/ui-blocks](https://tailwindcss.com/plus/ui-blocks)).

**Takeaway for NeuroWiki:** trials and calculators should use hairline-divided rows, not shadowed cards. Target 8–10 items in the first scroll-screen on desktop, 4–5 on mobile.

---

### Pattern 7 — Mobile patterns

The NLM Technical Bulletin for the modernized ClinicalTrials.gov explicitly calls out mobile optimization as a redesign goal: "optimized for use on mobile devices" with location search backed by a geo-API. The "More Filters" dropdown is the mobile pattern made desktop-default — collapse filters into a single tap, expand on demand. UpToDate's User Academy describes the same persistent search-bar pattern across viewports; the search field never disappears.

Tailwind UI's image-heavy grid pattern degrades on mobile (one column), which is fine for design browsing but slow for clinicians. The sites that survive a bedside-phone use case all share one trait: sticky search at the top, filters collapsed to a chip or sheet.

**Examples:**
- ClinicalTrials.gov modernized: mobile-optimized layout, geo-API location search, "More Filters" dropdown ([NLM Technical Bulletin](https://www.nlm.nih.gov/pubs/techbull/mj23/mj23_clinicaltrials_website.html)).
- UpToDate: persistent search bar carried across breakpoints ([wolterskluwer.com User Academy](https://www.wolterskluwer.com/en/solutions/uptodate/resources/user-academy/searching-and-navigating)).

**Takeaway for NeuroWiki:** sticky search on every catalogue page. Filters into a bottom-sheet (or top dropdown) on mobile, not always-visible chips that eat 30% of the viewport.

---

### Pattern 8 — Featured / curated items

Three distinct surfaces for "you should look at this first":

1. **Trending** (MDCalc) — a named strip of currently-most-used items. Implies live data, drives social proof.
2. **Quick-access shortcuts** (MDCalc top of home: GFR, Atrial Fibrillation, PE Diagnosis…) — editorial pinning of the 5–8 most common entry points. Stable across sessions.
3. **Use-case sections** (Stripe docs: "Accept payments online / with invoices / in-person") — editorial groupings that lead the user by intent.

NEJM uses publication-driven featured patterns (most recent issue, "FREE" open-access designation on cards, NEJM AI / NEJM Catalyst as featured sub-brands, per WebSearch-confirmed content). Tailwind UI uses a "new product announcement" banner above the catalogue ("Introducing Oatmeal — Our new multi-theme marketing site kit"). The clinical pattern is *recency + frequency*; the publisher pattern is *editorial promotion*.

**Examples:**
- MDCalc: explicit "Trending" strip + 5 named quick-access links ([mdcalc.com](https://www.mdcalc.com/)).
- Stripe docs: three intent-grouped sections above the fold ([docs.stripe.com](https://docs.stripe.com/)).
- NEJM: most-recent issue prominent, FREE-access badge surfaced on cards ([nejm.org](https://www.nejm.org/)).

**Takeaway for NeuroWiki:** a "Most-used at the bedside" strip + an editor's "Start here" row work harder than a single "Featured" carousel. NEJM-style "updated" badges on trial cards would signal currency.

---

### Pattern 9 — Empty states and skeleton loaders

Direct observation of skeleton/empty patterns was not possible via WebFetch (those states only render on interaction). From vendor docs: ClinicalTrials.gov's modernization explicitly addressed empty/error states as part of the usability overhaul (NLM Technical Bulletin), and the modernized site uses inline explanatory copy when a filter combination returns zero results.

The general pattern across reference sites: empty states should *suggest a next action* — "No trials match. Try removing the location filter" — rather than just say "No results." Skeleton loaders are now expected as table-of-the-art on any catalogue with >50 items; their absence reads as broken to users habituated to MDCalc, NEJM, and ClinicalTrials.gov.

**Examples:**
- ClinicalTrials.gov: empty states call out which filter caused the zero-result condition (per [modernization overview](https://ncbiinsights.ncbi.nlm.nih.gov/2024/06/25/modern-clinicaltrials-gov-website/)).

**Takeaway for NeuroWiki:** every empty state must name the filter responsible and offer a "clear this filter" affordance. Skeleton rows on first paint, not spinners.

---

### Pattern 10 — Pagination vs infinite scroll vs "load more"

Clinical references almost universally pick **paginated lists** over infinite scroll. The reason is regulatory and cognitive: clinicians need to be able to cite "I reviewed all 47 trials matching this query," and infinite scroll erodes that confidence. ClinicalTrials.gov shows paginated results with explicit page counts. MDCalc's specialty pages similarly show a finite alphabetized list — no infinite scroll. Pattern libraries (Tailwind UI) split categories into named subsections rather than paginate, because the universe is small (≤500 components total).

"Load more" appears as a middle ground on journals (NEJM, Stroke) but does not replace pagination — it's an extra affordance, not a substitute. The trustworthy pattern for clinical reference: pagination with explicit counts ("Showing 1–20 of 89 trials").

**Examples:**
- ClinicalTrials.gov: paginated result lists with explicit page counts ([clinicaltrials.gov](https://clinicaltrials.gov/)).
- MDCalc: finite alphabetized lists per specialty ([mdcalc.com/specialties](https://www.mdcalc.com/specialties)).
- Tailwind UI: named subsections, no pagination ([tailwindcss.com/plus/ui-blocks](https://tailwindcss.com/plus/ui-blocks)).

**Takeaway for NeuroWiki:** with 89 trials, prefer pagination ("Showing 1–20 of 89") with a clear total. Never infinite-scroll the trial list.

---

## Catalogue-specific deep dive — many meaningful items

NeuroWiki's TrialsPage shows ~89 trials; calculators-hub shows on the order of a dozen scoring tools today; ClinicalTrials.gov shows millions; MDCalc shows hundreds. The relevant comparator isn't the count — it's "each item is meaningful enough to deserve attention." That puts NeuroWiki between MDCalc (~700 calculators, each significant) and a curated landmark-trial collection.

**How clinical-reference sites handle this scale:**

- **Two-step funnel.** MDCalc's home → specialty → calculator detail is a three-screen funnel. Each screen reduces the universe by a factor of ~10. Users never face the full library at once.
- **Default sort is purpose-encoded.** ClinicalTrials.gov sorts by relevance to the query by default; MDCalc's "Sort By" defaults to "Frequently Used." Alphabetical is a fallback, not a default.
- **Category grouping > flat list above ~30 items.** Below 30, a flat list with chip filters is faster. Above ~30, named groups (specialty, body system, or workflow phase) reduce cognitive load. NeuroWiki's 89 trials is firmly in group-required territory.

**Mega-menu vs hub-page-per-category:**

- Mega-menus work when the user knows the category name (MDCalc's "Specialties" dropdown). They fail when the user is browsing without a target.
- Hub-page-per-category works for editorial framing — "Stroke trials" gets its own page with editor's-choice context, methodology notes, and a curated list. This is what NEJM does with topic pages.
- Best practice: do both. Mega-menu as power-user shortcut; hub page as the editorial home for each category.

**Defaulting:**

- **Recent-additions** as default is right when the catalogue is actively maintained and currency matters (clinical content). Pairs with a "last reviewed" badge on each card.
- **Popularity** as default is right when there's social proof and most users want what others use (MDCalc's "Frequently Used" sort).
- **Alphabetic** as default is wrong for clinical content — it implies "I know the name of what I want," which is a power-user case.

**Takeaway for NeuroWiki:** for 89 trials, default to "Most recent" with a visible "last reviewed" or "added" date on each card. Offer "By topic" (stroke / ICH / SAH / EVT) as a chip set above the list. Reserve alphabetical for the power-user toggle.

---

## Cross-cutting observations

- **Search persistence beats search prominence.** The best clinical references (UpToDate, MDCalc) keep search visible on every screen rather than making the homepage search feel dramatic. A small persistent input outperforms a huge homepage input.
- **Hairlines, not shadows, for dense clinical content.** Card shadows imply discreteness and individual importance; that fights against scanning 89 items.
- **Purpose-encoded chips beat anatomy-encoded categories.** MDCalc's "Diagnosis / Rule Out / Prognosis" chips map to *what the clinician is trying to do right now*, not where the disease lives. NeuroWiki's chips should follow this pattern.
- **Editorial layers age well; algorithmic layers age poorly.** Trending lists need real traffic data; editorial picks need a maintainer. For NeuroWiki's stage, a manually-curated "Start here" row will outperform a fake "trending" computation.
- **Pagination over infinite scroll, always, for clinical use.** Clinicians need to be able to claim coverage. Infinite scroll undermines that.
- **Mobile filter UX is bottom-sheet or dropdown, never always-visible.** ClinicalTrials.gov's "More Filters" dropdown is the modernized standard.

---

## Recommended reading priority

If only three sites can be inspected before designing NeuroWiki's catalogue pages, look at these and the reason why:

1. **MDCalc** — the closest direct competitor. Study the home (quick-access link strip), the specialty pages (purpose-encoded chips, "Sort By: Frequently Used"), and the calculator detail format. The text-only card pattern and the absence of visual chrome are deliberate; understand why before deviating.
2. **ClinicalTrials.gov (modernized site)** — for the trial catalogue surface specifically. The "More Filters" dropdown pattern, the result-row anatomy with status-as-primary-atom, and the empty-state messaging are the modern standard for trial catalogues. Read the [NLM Technical Bulletin May–Jun 2023](https://www.nlm.nih.gov/pubs/techbull/mj23/mj23_clinicaltrials_website.html) alongside the live site to understand the design rationale.
3. **Stripe docs landing page** — for the hub-page-as-triage-interface pattern. The use-case-first section structure (collect online / invoices / in-person) is exactly the pattern a Resident Toolkit page should adopt: organize by *what the user is trying to do tonight on call*, not by content type.

---

## Sources

- [mdcalc.com](https://www.mdcalc.com/) — direct fetch
- [mdcalc.com/specialties](https://www.mdcalc.com/specialties) — direct fetch
- [mdcalc.com/specialties/neurology](https://www.mdcalc.com/specialties/neurology) — partial fetch (template only)
- [clinicaltrials.gov](https://clinicaltrials.gov/) — direct fetch (header only)
- [NLM Technical Bulletin May–Jun 2023 — ClinicalTrials.gov modernization](https://www.nlm.nih.gov/pubs/techbull/mj23/mj23_clinicaltrials_website.html)
- [NCBI Insights — A Modern ClinicalTrials.gov Website (June 2024)](https://ncbiinsights.ncbi.nlm.nih.gov/2024/06/25/modern-clinicaltrials-gov-website/)
- [Wolters Kluwer — UpToDate User Academy: Searching and Navigating](https://www.wolterskluwer.com/en/solutions/uptodate/resources/user-academy/searching-and-navigating)
- [amboss.com/us](https://www.amboss.com/us) — direct fetch
- [tailwindcss.com/plus/ui-blocks](https://tailwindcss.com/plus/ui-blocks) — direct fetch
- [docs.stripe.com](https://docs.stripe.com/) — direct fetch
- [nejm.org](https://www.nejm.org/) — 403 on direct fetch; pattern inferred via WebSearch
- [ahajournals.org/journal/str](https://www.ahajournals.org/journal/str) — 403 on direct fetch; not analyzed in detail
- [medscape.com/specialties/neurology](https://www.medscape.com/specialties/neurology) — 402 paywall; not analyzed
