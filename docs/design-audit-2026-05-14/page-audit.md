# Page Audit — NeuroWiki listing + hub surfaces

**Date:** 2026-05-14
**Auditor:** ui-architect (model: claude-sonnet-4-6)
**Status:** findings only — translates to mockups in Phase 3 and recommendations in Phase 4
**Skills loaded:** design-tokens, design:design-system, design:design-critique, performance

---

## Executive summary

All five surfaces share a coherent information architecture (hero + pill row + section cards) and the Home, Calculators, and TrialsPage all conform closely to their locked reference mockups. The two sharpest gaps are structural: ResidentToolkit is a divergent page that does not follow the hub-reference.html anatomy at all (border-2 cards, shadow-lg, font-black, lucide-react icons, hardcoded teal and orange Tailwind colors, no spec cite), and ResidentGuide is a compound two-in-one component (landing list + article reader) whose landing state has no H1, whose article state uses `text-3xl md:text-5xl font-extrabold` (outside spec scale), and whose hover targets on the star button in ToolRowCard are 16×16px — well below the 44px minimum. The TrialsPage hero uses a hardcoded `focus:shadow-[0_0_0_4px_...]` inline value instead of the `--cobalt-soft` CSS variable. Pill active states across Home, Calculators, and TrialsPage use `bg-slate-50 border-slate-200` (border-only, no fill) rather than the spec's full-fill active pattern (`bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2]`). The Trending Trials hardcodes the trial count as 79, while the catalog count is live-computed.

---

## Page 1 — Home.tsx

**File:** `src/pages/Home.tsx`
**Lines:** 122 total
**Reference mockup:** `docs/specs/mockups/home-reference.html`
**Spec conformance:** High — composition pattern matches spec; pill active state partially diverges

### A — Above-the-fold

The page opens with `HomeHero` (`src/components/home/HomeHero.tsx`): eyebrow `text-[10px] font-bold text-slate-400 uppercase tracking-widest`, H1 `text-[24px] font-medium`, lede `text-[14.5px] text-slate-500`. This exactly matches `home-reference.html` (lines 179–181). No marketing hero copy — the H1 is action-framed ("What's the case?"). No search affordance on the Home page — the primary interaction is the pill row and scenario sections. This is intentional per HOME_SPEC and the hub pattern, though a bedside user wanting a specific tool must know to use the global search or navigate the scenario sections.

`FeaturedRail` sits between the hero and pill row (`Home.tsx` line 78), rendered only in the "All" view. The featured rail matches the `home-reference.html` `.featured-rail` pattern (eyebrow + horizontal scroll tile track).

No JS-fallback content or pre-rendered static shell. The page is client-rendered. This matches the SPA-level observation in the competitive research context; all five pages share this limitation.

### B — Hierarchy + scannability

One H1 in `HomeHero`. Section titles in `ScenarioSection` use `text-[18px] font-semibold` (HOME_SPEC tinted header), not a semantic H2 — the element **is** an `h2` (`ScenarioSection.tsx` line 59). Correct. Section subtitles use `text-[12.5px] text-slate-500`. Consistent with spec.

`FeaturedRail` eyebrow: `text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em]` — tracking value is `0.1em` vs spec `0.12em` / `tracking-widest`. Minor discrepancy in the eyebrow tracking; not visually significant at 10px but is technically non-spec.

`TrendingTrials` section eyebrow (`TrendingTrials.tsx` line 28): `text-[10px] font-bold text-slate-400 uppercase tracking-widest`. Correct token.

The hardcoded "79" trial count in `TrendingTrials.tsx` line 54 will drift as trials are added. This is not a hierarchy issue but a data hygiene issue worth noting.

### C — Information density

FeaturedRail tiles: `w-[200px]` with 3 lines (type label, name, description). Tile width is arbitrary but consistent with spec `featured-tile` (200px). Density is appropriate.

Scenario sections: each expanded section shows a list of row cards. ToolRowCard (`src/components/hub/ToolRowCard.tsx`) renders title + description inline. The `description` is truncated with `truncate` (line 69), which is correct for density management on mobile.

### D — Search + filter

No search bar on the Home page — the pill row is the filter affordance. This matches the home-reference.html mockup (§1.2 note: "mobile search box removed"). The global nav bar presumably carries search. Acceptable for the Home pattern.

Pill row: `ScenarioPillRow.tsx` uses `bg-slate-50 border-slate-200 text-slate-900 font-semibold` for the active state. The reference mockup uses `bg-slate-50 font-semibold color:#0f172a` (`.pill-active`). Both achieve visual distinction via font weight shift. However, the design token skill defines the full-fill active as `bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2]`. The live pill active state does not apply the cobalt tint — it stays slate. This is consistent with the home-reference.html pill spec but diverges from the TrialsPage catalog filter chips, which do use cobalt tint on active.

### E — Navigation + cross-linking

`TrendingTrials` at the bottom of the All view links to `/trials`. `ScenarioSection` row cards link to individual tool pages. No cross-links to `/calculators` hub or `/guide` hub from the Home page. A bedside user who wants to browse calculators must navigate via the global bottom tab bar, not from in-page content.

No empty state or loading state observed in source. RecentlyViewed and TrendingTrials are conditionally rendered; no loading skeleton.

### F — Token / spec conformance

- Eyebrow tracking: `tracking-[0.1em]` in FeaturedRail vs spec `tracking-widest` / `tracking-[0.12em]`. Minor.
- Pill active state: `bg-slate-50 border-slate-200` — border-only, no cobalt fill. Matches home-reference.html pill-active spec but not the full-fill pattern in design tokens.
- All custom inline-style uses (`backgroundColor: hexToRgba(...)` in `FeaturedTile.tsx` and `ScenarioSection.tsx`) are for dynamic alpha values. Justified since Tailwind cannot generate rgba with dynamic alpha.
- No `dark:*` classes found. Correct — codebase is light-only.
- No `gray-*`, `shadow-sm`, `border-2` tokens found in Home or its components.

### G — Mobile breakage

Outer wrapper: `px-5 pt-7 pb-24`. `pb-24` provides bottom tab bar clearance. FeaturedRail uses `overflow-x-auto` with hidden scrollbar — no overflow risk. ScenarioPillRow uses same pattern. ToolRowCard description uses `truncate` to prevent overflow.

`ToolRowCard` star button: `w-4 h-4 flex items-center justify-center` (line 53) — this is a 16×16px touch target. The design token skill specifies `min-h-[44px] min-w-[44px]` for interactive elements. The star button in `ToolRowCard.tsx` does not meet this minimum. High risk on mobile.

### Friction points (ranked)

- **High:** ToolRowCard star button (`src/components/hub/ToolRowCard.tsx` line 53) — 16×16px touch target, below 44px minimum. Affects every row card on Home, Calculators, and the Trending Trials widget.
- **Medium:** Hardcoded trial count "79" in `TrendingTrials.tsx` line 54 — will drift as catalog grows.
- **Medium:** Pill active state does not use cobalt fill — visual active state is weak (font-weight only difference from inactive). The active pill looks nearly identical to inactive on small screens.
- **Low:** FeaturedRail eyebrow tracking `0.1em` vs `tracking-widest` (0.12em equivalent). Imperceptible but non-spec.

---

## Page 2 — TrialsPage.tsx + TrialLegendCard.tsx

**File:** `src/pages/TrialsPage.tsx` (529 lines), `src/components/trials/TrialLegendCard.tsx` (140 lines)
**Reference mockup:** `docs/specs/mockups/trials-legend-reference.html`
**Spec conformance:** High for TrialLegendCard; TrialsPage hero diverges on H1 typography and chip rail has non-functional chips

### A — Above-the-fold

Hero block (`TrialsPage.tsx` lines 174–238):
- Eyebrow: `text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400` — matches spec `.hero-eyebrow` exactly.
- H1: `text-[22px] md:text-[32px] font-medium text-slate-900 tracking-[-0.01em]` — matches spec `.hero-h1` (22px mobile, 32px desktop).
- Sub copy: `text-sm text-slate-600 leading-[1.55]` — spec uses `text-[14px] color:#475569`. The live version uses `text-sm` (14px) with `text-slate-600` instead of `#475569` (slate-600 = #475569, correct mapping).
- Search bar: `h-11 md:h-12` — spec says 44px mobile / 48px desktop. `h-11` = 44px, `h-12` = 48px. Correct.

The search bar focus state: `focus:shadow-[0_0_0_4px_rgba(23,70,162,0.08)]` (line 208). This is an arbitrary value. The spec defines `--cobalt-soft` = `rgba(23,70,162,0.08)` as a CSS variable. The value is correct but should reference the CSS variable, not an inline arbitrary value.

On mobile, the hero scrolls out and only the `Toggle` sticks (`sticky top-0 z-30`). On desktop, the entire block sticks (`md:sticky md:top-0 md:z-30`). This matches TRIALS_SPEC §L2.

### B — Hierarchy + scannability

Single H1 in hero. Toggle (Questions/Catalog) provides the primary navigation split. Category section headers (`TrialsPage.tsx` lines 400–438) use `text-[13px] md:text-sm font-semibold` — these are `<button>` elements, not semantic heading elements. This is a heading hierarchy gap: category group names (IVT, EVT, etc.) should likely be `<h2>` elements for screen reader navigation, not buttons with text inside.

Section label (category collapse header): uses inline `style={{ color: catColor }}` for the category name text — not a token class. The dot and color both use `CAT_COLOR[cat]` (hex values). This matches the spec Appendix A colors but relies on inline styles rather than token classes.

### C — Information density

TrialLegendCard (`TrialLegendCard.tsx`): Three-line anatomy — Line 1 (name + year + desktop tag/stat), Line 2 (finding), Line 3 (mobile tag/stat). Matches trials-legend-reference.html §Stage2/Stage3 anatomy precisely. Dot at `left-5 top-5`, `pl-[34px]`, `py-3.5` — all per spec. No excess whitespace.

Catalog category headers include a description line (`categoryDescriptions[cat]`) when not collapsed, adding useful context without overwhelming density.

The Questions view mobile list: `py-3.5 border-b border-slate-100` rows with 36×36px icon block — touch target for the row itself is acceptable (full row is the tap target via `Link`). Desktop 2-col grid in a `border border-slate-100 rounded-lg` card — correct card token.

### D — Search + filter

Search bar is in the hero block above the Toggle — this is above-fold, always visible before scroll. The sticky Toggle means search scrolls away on mobile. A user who starts in Catalog view and scrolls down loses access to search unless they scroll back up. This is a friction point for long trial lists.

Chip rail (`TrialsPage.tsx` lines 220–236): 4 chips: Favourites (functional), Recent (non-functional placeholder), "New 2024–25" (non-functional), Guidelines (non-functional). The last three chips render but have no `onClick` handlers and no functional state. A user tapping "New 2024–25" or "Guidelines" gets no feedback or action. This is a broken affordance.

Catalog filter bar (lines 314–364): `All` + category pills + `Year` sort button. The `Year` sort button (line 357) is decorative only — no `onClick` handler. Another non-functional affordance.

Active chip/pill state in the catalog filter: `bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2] font-semibold` (lines 322–323). This is the correct full-fill cobalt active pattern — more correct than the Home/Calculators pill active.

### E — Navigation + cross-linking

Questions view links to `/trials/q/:id` routes. Category sections link to individual trial detail pages. No cross-links to calculators or guide pages. The Favorites banner (lines 367–382) is informative but provides a "Show all" affordance only.

Empty state (`TrialsPage.tsx` lines 459–477): visual icon, message, "Clear filters" button. Functional and correctly styled.

### F — Token / spec conformance

- TrialLegendCard uses inline `style={{ backgroundColor: dotColor }}` for the category dot — this is correct since `dotColor` is resolved from `CAT_DOT_COLOR` (spec Appendix A values).
- Active chip uses `bg-[rgba(23,70,162,0.08)]` — this is `--cobalt-soft` expressed as an arbitrary value. Should reference the CSS variable.
- Category section container class (`TrialsPage.tsx` line 396): `md:bg-white md: md:border md:border-slate-100 md: md:rounded-lg md:overflow-hidden` — there are two empty `md:` class tokens. These are harmless but a code smell.
- No `shadow-sm`, `border-2`, `gray-*`, or `dark:*` classes.

### G — Mobile breakage

Hero padded `px-5 py-6`, chip rail `flex gap-2 overflow-x-auto scrollbar-hide pb-0.5` — no overflow risk. The catalog filter bar chip rail is also overflow-x-auto. `h-24 md:h-0` spacer at bottom accounts for tab bar. Category section cards: no fixed widths. TrialLegendCard is full-width with `pl-[34px]`. No horizontal overflow risk observed.

Star button in TrialLegendCard: `p-2 -m-1.5 ... min-h-[44px] min-w-[44px]` (line 94) — correctly sized at 44px minimum. This is better than ToolRowCard.

### Friction points (ranked)

- **High:** Three non-functional Chip rail chips (Recent, "New 2024–25", Guidelines) — broken affordances that suggest features that don't exist. `TrialsPage.tsx` lines 233–236.
- **High:** Sort "Year" button (line 357) — non-functional, no handler, no visual feedback on click.
- **Medium:** Search scrolls away on mobile in catalog view — user must scroll back to top to search while browsing a long category.
- **Medium:** Category section headers (cat name buttons) are not semantic headings (`<h2>`) — only screen-reader impact but worth noting for accessibility.
- **Low:** Active chip/pill uses inline arbitrary rgba instead of `var(--cobalt-soft)` CSS variable.
- **Low:** Two empty `md:` class tokens in category container line 396.

---

## Page 3 — Calculators.tsx

**File:** `src/pages/Calculators.tsx` (128 lines)
**Reference mockup:** `docs/specs/mockups/hub-reference.html`
**Spec conformance:** High — composition matches hub-reference.html; pill active state uses border-only (not cobalt fill)

### A — Above-the-fold

`CalculatorsHero` (`src/components/calculators/CalculatorsHero.tsx`): eyebrow `text-[10px] font-bold text-slate-400 uppercase tracking-widest`, H1 `text-[24px] font-medium text-slate-900`, lede `text-[14.5px] text-slate-500`. Live count from `CALCULATORS.length` — not hardcoded. Correct.

Page wrapper: `px-5 pt-7 pb-24` — same pattern as Home. No sticky header, no search affordance at the top. The pill row is the primary filter. For a user arriving to find "NIHSS," there is no search — they must know to look in the Severity category or scroll.

### B — Hierarchy + scannability

H1 in `CalculatorsHero`. Category sections in `CategorySection.tsx` use `<h2>` elements (`text-[15px] font-semibold text-slate-900`). Correct semantic hierarchy. Section label pattern: `text-[15px] font-semibold` for the section name — this is not the 10px uppercase eyebrow pattern used in other specs. The section header here follows the hub-reference.html `sec-h` pattern (not eyebrow), which is intentional.

### C — Information density

Each `ToolRowCard` shows: title (14.5px semibold), titleMeta if present, description (truncated), trail (score range or label), and star. Well-calibrated density. No card-within-card nesting.

`CategorySection` also shows a `lede` description below the section heading. This adds contextual orientation without dense vertical content.

### D — Search + filter

`CategoryPillRow`: All + Severity + Risk + Classification + (category pills). Active state: `bg-slate-50 border-slate-200 text-slate-900 font-semibold` (line 17). This is the same border-only active pattern as Home — no cobalt fill. The hub-reference.html `pill-active` uses `bg-slate-50; color: #0f172a; font-weight: 600` which matches. Technically consistent with the locked mockup. However the TrialsPage catalog chips use cobalt fill. There is a three-page inconsistency in the pill active state treatment.

No search bar on the Calculators hub page. A bedside user wanting ABCD2 must scroll or use the global search.

Favourites filter via `?favs=true` URL param — this is not exposed as a UI chip on the page (unlike TrialsPage which has a Favourites chip). A user can only access favs filter via URL or from a deep link. Missing affordance.

### E — Navigation + cross-linking

No cross-links to trial pages or guide pages from the Calculators hub. `CategorySection` links to individual calculator pages. No "View related trials" or "See guideline context" affordance.

Empty state for favs (`Calculators.tsx` lines 107–112): plain `<p>` text, no visual empty state icon. Contrast with TrialsPage which has a visual empty state with icon and action. Inconsistency.

### F — Token / spec conformance

- No `shadow-sm`, `border-2`, `gray-*`, or `dark:*` classes in `Calculators.tsx`, `CalculatorsHero.tsx`, `CategoryPillRow.tsx`, or `CategorySection.tsx`.
- Score range trail uses `text-[11.5px]` (not a named token). Acceptable as a functional exception.
- Section lede uses `text-[12.5px]` — not a token. Consistent with `CategorySection.tsx` lede pattern across the codebase.

### G — Mobile breakage

Same wrapper pattern as Home (`px-5 pt-7 pb-24`). Pill row overflows horizontally with hidden scrollbar. `ToolRowCard` description truncated. No horizontal overflow risk observed.

Same `ToolRowCard` star button issue: `w-4 h-4` touch target (16px) — below 44px minimum.

### Friction points (ranked)

- **High:** Star button in `ToolRowCard` — 16×16px touch target. Affects all calculator row cards.
- **Medium:** No search affordance on the hub page — user must know category to filter to a specific calculator.
- **Medium:** Favourites filter not exposed as a UI chip; only accessible via URL param.
- **Medium:** Favs empty state is plain text, not a visual empty state card (inconsistency with TrialsPage).
- **Low:** Pill active state border-only (consistent with mockup but inconsistent with TrialsPage chips).

---

## Page 4 — ResidentToolkit.tsx

**File:** `src/pages/ResidentToolkit.tsx` (497 lines)
**Reference mockup:** `docs/specs/mockups/hub-reference.html` (this page does not cite a spec; no spec comment in file)
**Spec conformance:** Low — does not follow hub anatomy; uses multiple disallowed tokens

### A — Above-the-fold

Hero block (`ResidentToolkit.tsx` lines 226–283): uses `bg-white border-b border-slate-200` hero container. H1 is `text-2xl md:text-3xl font-bold text-slate-900`. This is the only one of the five pages that uses `font-bold` on H1 rather than `font-medium`. Hub-reference.html and all other hubs use `font-medium` for H1. Typography diverges from spec.

Hero has a Brain icon from `lucide-react` (line 8 import) with `shadow-lg shadow-neuro-200` (line 232). `shadow-lg` is a disallowed token per CLAUDE.md rules. The icon box is `hidden sm:flex` — invisible on mobile.

Search bar (`lines 247–281`): `focus:ring-2 focus:ring-neuro-400`. The ring approach differs from the TrialsPage search which uses `focus:shadow-[0_0_0_4px_rgba(23,70,162,0.08)]`. Inconsistent focus state.

### B — Hierarchy + scannability

H1 in hero (correct). Section labels: `text-xs font-bold text-slate-400 uppercase tracking-wider` (lines 289, 323) — `text-xs` is 12px, and `tracking-wider` is 0.05em. The spec eyebrow is `text-[10px]` / `tracking-widest` (0.12em). Discrepancy: 12px vs 10px, tracking-wider vs tracking-widest.

Section H2 elements (`id="featured-tools-heading"`, `id="guide-categories-heading"`, etc.) are semantically correct `<h2>` tags.

Stats strip (`lines 472–490`): `text-xl font-black` on the stat value. `font-black` is explicitly listed as a disallowed weight in the CLAUDE.md rules ("No visual weight escalation where spec says font-semibold / font-medium"). Spec says `text-2xl font-semibold` for score-style numbers.

### C — Information density

Quick-Access grid (`lines 292–315`): 2-col on mobile, 3-col on small screen. Cards use `rounded-2xl border-2 ${tool.ringColor...} ${tool.bgColor}`. `border-2` is a disallowed token (CLAUDE.md: "No border-2"). Card background uses category-specific color tokens (`bg-red-50`, `bg-neuro-50`, `bg-violet-50`, etc.) — this is a tinted card approach not defined in the hub-reference.html. The featured tile in Home uses a tinted bg from `hexToRgba`, but uses no border. These quick-access cards have both a tinted bg and a colored border (`border-2`) — double emphasis that is not in spec.

Tag badges (`lines 307–310`): `text-[9px] font-bold uppercase tracking-wider` absolute-positioned top-right on each card. The eyebrow token is `text-[10px]`, not `text-[9px]`.

### D — Search + filter

Search has an inline results dropdown with `shadow-xl` (line 262) — disallowed shadow token. The search is local (filters `ALL_SEARCH_ITEMS` in memory, max 8 results), not a hub-level filter for guide categories.

No pill row category filter on this page. The guide categories are represented as accordion sections, not filterable pills. This differs from the hub pattern used by Home and Calculators.

### E — Navigation + cross-linking

Strong cross-linking: Featured Trials sidebar links to trial detail pages; "All Calculators & Pathways" CTA links to `/calculators`; Guide Categories accordion items link to guide pages; "All Trials" links to `/trials`. Cross-linking is thorough.

Accordion for guide categories expands only one category at a time (`expandedCategory` state, line 219). Single-expand behavior is reasonable but not spec'd.

"Browse all guides link" (`lines 390–407`) incorrectly links to `/calculators` (`to="/calculators"`) instead of a guide index. This appears to be a data/content error — the label says "All Calculators & Pathways" which matches, but the section it appears in is "Clinical Guides." This may cause user confusion.

### F — Token / spec conformance

Violations observed:

| Token | Violation | Location |
|---|---|---|
| `shadow-lg shadow-neuro-200` | Disallowed shadow | Line 232 |
| `shadow-xl` | Disallowed shadow | Line 262 |
| `hover:shadow-md` | Disallowed shadow | Line 299 |
| `hover:shadow-sm` | Disallowed shadow | Line 431 |
| `border-2` | Disallowed border width | Line 299 |
| `font-black` | Disallowed font weight | Line 485 |
| `font-extrabold` | Disallowed (used in ResidentGuide, see Page 5) | — |
| `rounded-2xl` | Not in spec card anatomy (`rounded-xl` is spec) | Multiple |
| `text-xs` | Eyebrow should be `text-[10px]` | Lines 289, 323 |
| `tracking-wider` | Eyebrow should be `tracking-widest` | Lines 289, 323 |
| `teal-*` | Not a design system color (appears in related ResidentGuide hover states) | — |

`lucide-react` is used for icon imports (Brain, Zap, Activity, etc.) — 20 imports on lines 2–20. These are functional icons not in the Material Icons set referenced in the product stack. Not a blocking issue but creates a second icon dependency.

No dark: classes. bg-gradient-to-br used in About card (line 458) — gradient not in design token set.

### G — Mobile breakage

`grid-cols-2 sm:grid-cols-3` quick-access grid. At 375px, 2 columns with `gap-3` and `p-4` cards. Cards are ~170px wide after gutters — viable. Absolute-positioned tag badge at `top-3 right-3` inside `p-4` card — overlaps card name text potentially on narrow cards.

Hero icon `hidden sm:flex` — hidden on mobile, correct since it would overflow the title row at 375px.

Stats strip `grid-cols-3 gap-3` at 375px: each cell is ~115px. The stat value `text-xl` and label `text-[10px]` should fit. No overflow expected.

Sidebar "Landmark Trials" moves below guide categories on mobile (no right-rail separation). On desktop it's a `lg:col-span-1` sidebar. On mobile it's full-width stacked below guides. Acceptable.

### Friction points (ranked)

- **High:** Multiple disallowed token violations: `shadow-lg`, `shadow-xl`, `hover:shadow-md`, `hover:shadow-sm`, `border-2`, `font-black` — see table above.
- **High:** `font-bold` on H1 (should be `font-medium` per hub spec). Typography diverges from all other hubs.
- **High:** Section eyebrow uses `text-xs tracking-wider` instead of `text-[10px] tracking-widest` — 2px size difference and tracking mismatch.
- **Medium:** Quick-access card `rounded-2xl` — spec card radius is `rounded-xl`.
- **Medium:** Search dropdown `shadow-xl` — disallowed token.
- **Medium:** No spec citation in file header — this page was not built against hub-reference.html.
- **Low:** `lucide-react` as second icon library.
- **Low:** Background gradient in About card — not in token set.

---

## Page 5 — ResidentGuide.tsx

**File:** `src/pages/ResidentGuide.tsx` (514 lines)
**Reference mockup:** `docs/specs/mockups/hub-reference.html` (landing state); no locked article-view spec
**Spec conformance:** Mixed — landing state close to spec; article view has multiple violations

### A — Above-the-fold

ResidentGuide is a compound component: it renders differently based on `currentTopic` (whether a guide article is selected). The landing state (no topic selected, `!currentTopic`) shows a mobile sidebar legend — a category accordion with search. The article state renders a full article reader.

Landing state (lines 289–376): opens with a `bg-white` panel, `h2` "Resident Guide" + "Clinical Protocols" subtitle, search bar, then category accordion. No hero eyebrow, no H1 on the landing state. A user arriving at `/guide` sees "Resident Guide" as a base-level `text-base font-semibold` heading (line 296) — not the `text-[24px] font-medium` H1 pattern used on every other hub. The page has no H1 in its landing state. This is a heading hierarchy failure.

On desktop, the landing state (`lg:hidden`, line 290) is hidden — desktop users see nothing at `/guide` in this component (the desktop sidebar presumably lives in a Layout shell, not in this component). This means the component's "landing page" view is mobile-only.

### B — Hierarchy + scannability

Landing state search: `focus:ring-2 focus:ring-neuro-500` (line 311) — ring focus pattern. Inconsistent with TrialsPage search focus (shadow + border) and ResidentToolkit (ring-neuro-400).

Category labels in the accordion: `text-xs font-semibold text-slate-500 uppercase tracking-wider` (line 341). Same 12px / tracking-wider discrepancy as ResidentToolkit (spec: 10px / tracking-widest).

Active item in accordion: `bg-blue-50 text-blue-700 border-blue-500` (line 361). `blue-*` is a disallowed color — spec requires `neuro-*` for brand-cobalt. The active state should use `bg-neuro-50 text-neuro-700 border-neuro-500` (or equivalent).

Article state H1 (`line 401`): `text-3xl md:text-5xl font-extrabold text-slate-900`. This is the most severe typography violation: `font-extrabold` is outside the spec weight scale, and `text-5xl` (48px) is not on the typography scale. The spec's largest text element is `text-[22px] md:text-[28px] font-medium` (page H1). The article H1 at 48px extrabold is styled as a blog post, not a clinical decision tool. This also creates CLS: the heading size shifts on desktop breakpoint.

Article section headers: `text-xl font-bold` (desktop, line 462) — `font-bold` vs spec `font-semibold`.

### C — Information density

Landing accordion: each category item is `py-2` height — small but tappable via the full-width `Link` block. Guide items are `py-2 ml-2` with `text-sm` — adequate density.

Article view: paragraph text `text-base leading-8` (line 248) — `text-base` is 16px with `leading-8` (32px line height). This is very loose for a clinical reference that residents use to scan quickly. The spec body text is `text-sm leading-[1.55]`. The article reader uses significantly more vertical space per line, requiring more scrolling to reach the relevant clinical content.

Table of Contents sidebar (desktop, line 489): sticky, `max-h-[70vh] overflow-y-auto`, `text-sm` with 2.5px vertical padding. Compact and functional.

### D — Search + filter

Landing state search: local search filtering `GUIDE_NAVIGATION` items — `sidebarSearchQuery` state. Auto-expands categories matching the query. Well-implemented within the mobile panel pattern.

Article search: none. The accordion accordion (mobile) and ToC sidebar (desktop) provide section navigation, not search.

### E — Navigation + cross-linking

Back button appears in both states (`lines 273–283` in outer, `lines 382–391` in article). Redundant back button at line 273 (outer) and line 382 (article) — when `currentTopic` is set, both buttons appear. The outer back button at line 273 renders when `currentTopic` exists but is outside the article-specific block. This creates a duplicate back button at the article view top.

Backlinks: `lines 420–436` render related tool CTAs ("Launch Thrombectomy Pathway", etc.). Cross-linking to calculators and pathways is implemented.

Scroll-to-top FAB (`line 506`): `fixed bottom-8 right-8` — positioned at 32px from bottom. On mobile at 375px with a tab bar, this will overlap the tab bar unless the tab bar height is accounted for. No `safe-area-inset-bottom` or tab-bar height compensation observed at this element.

### F — Token / spec conformance

Violations observed:

| Token | Violation | Location |
|---|---|---|
| `text-3xl md:text-5xl font-extrabold` | H1 article view — outside spec scale | Line 401 |
| `text-xl font-bold` | Article section headers — `font-bold` vs `font-semibold` | Line 462 |
| `shadow-lg` on CTAs | Disallowed shadow | Lines 406, 414, 426 |
| `shadow-xl` on ToC sidebar | Disallowed shadow | Line 491 |
| `shadow-sm` on section icon | Disallowed shadow | Line 463 |
| `blue-50 text-blue-700 border-blue-500` | Active state: `blue-*` disallowed | Line 361 |
| `text-xs tracking-wider` | Eyebrow: should be `text-[10px] tracking-widest` | Line 341 |
| `teal-*` colors | Not in design system (`hover:bg-teal-500`, `hover:text-teal-500`, `text-teal-500`) | Lines 238, 259, 264, 429, 495 |
| `shadow-xl` | FAB scroll-to-top | Line 506 |
| `leading-8` on body paragraphs | Spec body is `leading-[1.55]` | Line 248 |
| `text-base` on body | Spec body is `text-sm` | Line 248 |

`teal-*` is the most pervasive off-token color: `text-teal-500`, `hover:text-teal-500`, `hover:bg-teal-500`, `bg-teal-500` appear across multiple class strings. This color is used as a hover-state variant of cobalt, but `teal` is not in the neuro-* palette.

### G — Mobile breakage

Scroll-to-top FAB: `fixed bottom-8 right-8` with no tab-bar compensation. If the bottom tab bar is 64px (estimate), the FAB at 32px from bottom is inside the tab bar zone. Potential overlap.

Mobile landing state is capped at `max-h-[50vh]` (line 317) — a viewport-height constraint that may be insufficient on very short devices (e.g. iPhone SE). Content may be cut off before the last category is visible.

The article body at `text-base leading-8` on mobile means each paragraph is very tall. On a 375px wide viewport with 32px line height, even a 4-sentence paragraph takes ~192px. Users must scroll substantially to reach subsequent sections.

### Friction points (ranked)

- **High:** `font-extrabold text-3xl md:text-5xl` article H1 — severely outside spec scale; styling signals a blog, not a clinical tool. Line 401.
- **High:** `blue-*` active state color — disallowed; should be `neuro-*`. Line 361.
- **High:** `teal-*` used as brand hover color throughout — not in design system. Lines 238, 259, 264, 406, 429, 495.
- **High:** Scroll-to-top FAB overlaps tab bar on mobile — no bottom compensation. Line 506.
- **High:** Landing state has no H1 — heading hierarchy failure on the guide hub landing page.
- **Medium:** Duplicate back button when article is open (lines 273 and 382 both render).
- **Medium:** `shadow-lg` / `shadow-xl` / `shadow-sm` on multiple elements — disallowed tokens.
- **Medium:** Article body `text-base leading-8` — too loose for clinical reference scanning; spec is `text-sm leading-[1.55]`.
- **Low:** Category label `text-xs tracking-wider` — should be `text-[10px] tracking-widest`.

---

## Cross-cutting patterns

**1. Pill active state inconsistency (3 of 5 pages).** Home and Calculators use `bg-slate-50 border-slate-200 text-slate-900 font-semibold` (border-only, no fill). TrialsPage catalog chips use `bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2]` (cobalt fill). The design token skill defines the full-fill cobalt pattern as the active state. This inconsistency should be resolved: the TrialsPage chip pattern is the more spec-correct approach.

**2. ToolRowCard star button touch target (16px) appears on Home, Calculators, TrendingTrials.** `src/components/hub/ToolRowCard.tsx` line 53 uses `w-4 h-4` with no `min-h-[44px]`. This is the shared row card component — fixing it fixes three pages simultaneously. The TrialLegendCard correctly uses `min-h-[44px] min-w-[44px]` on its star, demonstrating the pattern.

**3. Three different H1 typography patterns across the five pages.**
- Home, Calculators: `text-[24px] font-medium` (hub-reference.html pattern).
- TrialsPage: `text-[22px] md:text-[32px] font-medium` (trials-legend-reference.html pattern — correct for trials hero which is denser).
- ResidentToolkit: `text-2xl md:text-3xl font-bold` (diverges — `font-bold` vs `font-medium`, Tailwind utility vs pixel value).
- ResidentGuide landing: no H1.
- ResidentGuide article: `text-3xl md:text-5xl font-extrabold` (severely outside scale).

**4. Shadow token leakage concentrated in ResidentToolkit and ResidentGuide.** `shadow-lg`, `shadow-xl`, `shadow-md`, `shadow-sm` appear zero times on Home, Calculators, and TrialsPage. They appear 8+ times combined across ResidentToolkit and ResidentGuide. These two pages were likely authored independently from the hub-reference.html spec.

**5. ResidentToolkit and ResidentGuide use `lucide-react` icons; other pages use custom SVGs.** Home, Calculators, and TrialsPage all use hand-rolled SVG icons or a consistent SVG shape library. ResidentToolkit and ResidentGuide use the `lucide-react` package (19 distinct imports in ResidentToolkit alone). This adds a bundled icon library not referenced in the product stack (which cites Material Icons). Not blocking but creates a split icon strategy.

---

## Pages NOT audited

- **Calculator detail pages** (`src/pages/*Calculator.tsx`) — covered by CALCULATOR_SPEC.md v1.1; conform to that spec per Phase 7D findings.
- **Trial detail pages** (`src/pages/trials/TrialPageNew.tsx`) — covered by TRIALS_SPEC.md Parts I/II; in active implementation.
- **Pathway pages** (`src/pages/*Pathway.tsx`) — PATHWAY_SPEC.md pending; not in scope for this hub-level audit.
- **Article/guide content pages** (`src/pages/guide/`) — content layer; clinical surface governed by CLAUDE.md §13; layout not yet on a locked spec.

---

### @ui-architect — Sign-off

**Spec cited:**
- `docs/specs/mockups/home-reference.html`
- `docs/specs/mockups/hub-reference.html`
- `docs/specs/mockups/trials-legend-reference.html`
- `docs/specs/CALCULATOR_SPEC.md` §1.1, §1.5 (section label token)
- `docs/specs/TRIALS_SPEC.md` §L (Part II listing page)
- `.claude/skills/design-tokens/SKILL.md` (token constraints)

**Layout decisions:** Read-only audit — no layout changes made.

**Deviations from spec:** None introduced. Deviations found are documented above as findings.

**Risks flagged:**
- ResidentToolkit and ResidentGuide are the two pages most diverged from the design system. Any swarm touching these pages should treat them as a Class D rebuild target (cross-boundary: typography scale, token compliance, icon library, shadow system) rather than incremental fixes.
- The ToolRowCard star button (`w-4 h-4`, no min touch target) is a Class C accessibility fix that is low risk to ship independently.
- The non-functional chips in TrialsPage (Recent, New 2024–25, Guidelines, Year sort) should either be removed or wired before Phase 3 mockups assume they are real affordances.
- The scroll-to-top FAB overlap with the mobile tab bar in ResidentGuide may require a Layout shell variable (`--tab-bar-height`) to fix correctly — worth confirming with the mobile-first-developer before Phase 3.

**Status:** ready
