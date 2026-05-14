# Mobile QA — 2026-05-14 mockup proposals

**Date:** 2026-05-14
**Reviewer:** mobile-first-developer
**Viewport tested:** 375px (iPhone 14 Pro / iPhone SE width)
**Status:** findings only — no mockup changes made

---

## Mockup 1 — trials-catalogue-2026-05-14-proposal.html

| Check | Result | Line / section reference |
|---|---|---|
| 1. Touch targets ≥44px | PARTIAL PASS | Star buttons correctly use `min-h-[44px] min-w-[44px]` with `-10px` negative margin offset (lines 243–247). Header icon buttons are `width:36px height:36px` — 36px, below the 44px minimum (lines 363–368). |
| 2. No horizontal overflow | PASS | Main content frame is `width:375px` with `overflow:hidden` on `.mock-frame`. Hero, sticky search, cards, and pagination all fit within 375px. No element observed wider than frame. |
| 3. Sticky search persistence | PASS | `.sticky-search-wrapper` uses `position:sticky; top:0; z-index:20` (lines 127–135). Search + chip rail sticks after hero scrolls out of view. Directly addresses Phase 1 Pattern 2. |
| 4. No hidden content under tab bar | PASS | The tab bar sits at the bottom of `.mock-frame` as a standard block element. No `position:fixed` bottom sheet. Cards and pagination render above tab bar in document flow. Content area does not use a fixed bottom offset but mockup does not simulate real scrolling so no hidden-content risk introduced here. |
| 5. Long-content truncation | IMPROVEMENT | Trial IDs are short (NINDS-tPA, DEFUSE-3, MR CLEAN — all ≤10 chars). The `.trial-id` class uses `white-space: nowrap` (line 238) with no max-width or `overflow:hidden` / `text-overflow:ellipsis` guard. A 25+ char trial acronym would overflow the line-1 flex row. No example of long title tested. |
| 6. Filter chip wrapping | PASS | `.chip-rail` uses `overflow-x:auto; scrollbar-width:none` (lines 139–142). `.filter-pills` similarly uses `overflow-x:auto` (line 177). Both scroll horizontally without wrapping. Smooth on 375px. |
| 7. Hairline divider visibility | PASS | `--hair: #f1f5f9` is 1px solid; visible on white background. Trial cards use `border-bottom:1px solid var(--hair)`. Category section headers use same token. No divider collapse detected. |
| 8. Empty state legibility | PASS | Empty state at lines 304–312: centered layout, `padding:48px 24px`, 14px message text, 13px sub-text, and a `clear filters` button with `min-height` not specified but padding `8px 16px` at 13px font — visual height approx 36px. Legible but see Improvement below. |
| 9. iOS Safari quirks | IMPROVEMENT | The `sticky-search-wrapper` uses `position:sticky` which is safe. The `toggle-wrap` also uses `position:sticky; top:116px; z-index:29` (line 399). Neither uses `transform: translateZ(0)` for GPU compositing. On iOS Safari, stacking two `position:sticky` elements (`top:0` and `top:116px`) can cause repaint jank. No `transform` promotion is specified. Low severity but worth noting. |
| 10. Form input affordances | IMPROVEMENT | Search input is rendered as a `<div>` placeholder (not a real `<input>`). In the live implementation the input element must have `font-size:16px` minimum to prevent iOS auto-zoom on focus. The mockup shows `font-size:14px` for the placeholder text (line 124). If the live input inherits this value, iOS will zoom. |

### Blockers

- **Header icon buttons at 36px (lines 363–368).** The search and favourites icon buttons in the app header use `width:36px; height:36px` — 8px below the 44px minimum. These are primary navigation controls used on every page. Must reach 44px before approval. Pattern: use `min-height:44px; min-width:44px; display:flex; align-items:center; justify-content:center` (same pattern as the corrected star buttons).

### Improvements

- **Long trial ID overflow (line 238).** Add `overflow:hidden; text-overflow:ellipsis` to `.trial-id` and a `max-width` constraint so a 25+ char name does not break the line-1 flex row.
- **Empty state action button height (lines 308–312).** `.empty-action` has `padding:8px 16px` at 13px font — rendered height ~36px. Add `min-height:44px` to bring it to standard.
- **Search input font-size in live implementation (line 124).** The placeholder reads `font-size:14px`. The live `<input>` must use `font-size:16px` to prevent iOS Safari zoom. Add an explicit note to the implementation brief.
- **iOS sticky stack jank (lines 127–135, 399).** Two `position:sticky` elements stacked vertically. Consider adding `transform: translateZ(0)` or `will-change: transform` to the outermost sticky wrapper to promote a composited layer and avoid repaint on scroll on older iOS devices.

### Acceptable as-is

- Sticky search: correctly implemented per Phase 1 Pattern 2.
- Chip rail horizontal scroll: correct pattern.
- Trial star buttons: correctly fixed to 44px with negative margin offset.
- Hairline dividers: correct token usage.
- Category section headers: correct anatomy.
- Pagination controls (pg-btn at 32px height): pagination buttons at `min-width:32px; height:32px` are below 44px but are secondary controls grouped together and not primary CTAs. Acceptable given their row grouping provides cumulative tap area.

---

## Mockup 2 — resident-toolkit-2026-05-14-proposal.html

| Check | Result | Line / section reference |
|---|---|---|
| 1. Touch targets ≥44px | PARTIAL PASS | Header icon buttons explicitly use `min-height:44px; min-width:44px` (lines 257–261). "Log a case" button uses `min-height:44px` (line 461). Accordion triggers use `padding:14px 16px` — at 14px font with 28px total vertical padding, rendered height ≈56px. Pill buttons use `padding:6px 14px` — rendered height ≈31px at 13px font. Below 44px. Pill row is not a primary CTA (it's a filter) so borderline-acceptable, but warrants a note. |
| 2. No horizontal overflow | PASS | Mobile frame is `width:375px; overflow:hidden`. Content uses `padding:28px 20px` which gives 335px usable width. QA grid uses `grid-template-columns: 1fr 1fr; gap:10px` — each card ≈162px. Stats strip uses 3-col `grid-template-columns: 1fr 1fr 1fr`. No overflow detected. |
| 3. Sticky search persistence | N/A | Resident Toolkit does not have a sticky search requirement. The search bar is inside `<main>` and scrolls with content. Not flagged in Phase 1 as requiring sticky — acceptable. |
| 4. No hidden content under tab bar | PASS | `<main style="padding:28px 20px 96px">` — 96px bottom padding clears the tab bar height (approx 60px) plus safe area. Content does not get hidden under tab bar. |
| 5. Long-content truncation | IMPROVEMENT | Category section names: "Communication Templates" is 26 chars. The `.sec-name` class (line 106) has no `overflow:hidden` or `text-overflow:ellipsis`. At 15px font in a flex row with a "See all" CTA link on the right, this wraps to two lines on narrow viewports below 375px. At exactly 375px with 40px padding (20px each side), usable width is 335px — "Communication Templates" at 15px semibold measures approximately 220px, sufficient. Edge-case at 320px (iPhone SE 1st gen). |
| 6. Filter chip wrapping | PASS | `.pill-row` uses `overflow-x:auto; scrollbar-width:none` (lines 191–192). Pills use `white-space:nowrap; flex-shrink:0`. Horizontal scroll is correct and smooth. |
| 7. Hairline divider visibility | PASS | `.sec-h` uses `border-bottom:1px solid var(--hair)` (line 103). `.accord-item` uses `border-bottom:1px solid var(--hair)` (line 178). `.rowcard` uses `border-bottom:1px solid var(--hair)` (line 157). All hairline, all visible at 375px. |
| 8. Empty state legibility | PASS | Personal Tracker empty state (lines 455–465): 32px icon, 14px title at font-weight:500, 13px sub-text, 44px-height "Log a case" CTA button. Legible and correctly spaced at 375px. |
| 9. iOS Safari quirks | PASS | Header uses `position:sticky; top:0; z-index:40` (line 251). Single sticky element, no stacking issue. No `position:fixed` elements on mobile. Tab bar is a regular block element. No known iOS Safari quirks triggered. |
| 10. Form input affordances | IMPROVEMENT | Search bar is a `<div>` mock (lines 275–278). The placeholder text uses `font-size:14px` (line 98). Live implementation must set `font-size:16px` on the `<input>` to prevent iOS zoom. No `inputMode` specified. For a general-purpose search, `inputMode="search"` is appropriate. |

### Blockers

None. The two critical fixes from the Phase 1/2 audit (shadow tokens, font-weight, touch targets on primary CTA) are correctly applied.

### Improvements

- **Pill row touch height (line 194).** Pills use `padding:6px 14px` — rendered height ≈31px. For a filter rail used frequently during browsing, increase to `padding:10px 14px` to reach 44px, or add `min-height:44px` and use flex centering. The current height is acceptable for a secondary filter rail but borderline.
- **Search input font-size in live implementation (line 98).** Must be 16px on `<input>` to prevent iOS zoom.
- **"Communication Templates" section label at sub-375px.** The "See all" CTA is flex-row aligned to the right of the section name. On viewports below 340px the label may wrap. Not a 375px blocker but worth a defensive `min-width:0; overflow:hidden; text-overflow:ellipsis` on `.sec-name`.

### Acceptable as-is

- Header icon buttons: correctly at 44px.
- "Log a case" CTA: correctly at 44px minimum height.
- Accordion triggers: correctly tall (>44px with padding).
- Bottom padding (96px) clearing the tab bar.
- Hairline dividers: correct.
- QA card grid: correctly 2-column at 375px with adequate spacing.
- Stats strip: correctly 3-column with border separators.

---

## Mockup 3 — resident-guide-2026-05-14-proposal.html

| Check | Result | Line / section reference |
|---|---|---|
| 1. Touch targets ≥44px | PARTIAL PASS | Header search button uses `min-height:44px; min-width:44px` (line 196). Back button in article view uses `min-height:44px; min-width:44px` (line 399). Favourites button in article view uses `min-height:44px; min-width:44px` (line 404). `.guide-item` elements use `padding:9px 16px` — rendered height ≈34px at 14px font. Below 44px for the list navigation items. FAB is `width:44px; height:44px` (line 139). |
| 2. No horizontal overflow | PASS | Mobile frame `width:375px; overflow:hidden`. Landing state main uses `padding:28px 20px 96px`. Article main uses `padding:24px 20px 100px`. Content stays within bounds. Article CTA links use `flex-wrap:wrap` (line 432). No overflow detected. |
| 3. Sticky search persistence | N/A | Resident Guide does not have a sticky search requirement. Search is in the landing content area and scrolls with page. Not flagged as Phase 1 pattern 2 requirement for this page. |
| 4. No hidden content under tab bar | PASS | Phase 2 flagged this as a FAB-breaking issue. The proposal explicitly addresses it: FAB positioned at `bottom:76px` (60px tab bar + 16px gap) in the mockup (lines 137–143). Production CSS template is provided: `bottom: calc(var(--tab-bar-height,0px) + env(safe-area-inset-bottom,0px) + 1rem)` (line 146). Article main padding is `100px` — sufficient clearance. |
| 5. Long-content truncation | IMPROVEMENT | Article header in article view shows title in header bar: `white-space:nowrap; overflow:hidden; text-overflow:ellipsis` (line 402). Correctly truncated. Landing guide list items: "Anti-epileptic Dosing", "Thunderclap Headache", "Migraine Management" — all fit at 14px in 295px usable width (375 - 40px padding - 24px chevron - ~16px guide-item margin). Longest entry is approx 22 chars, fine at 375px. |
| 6. Filter chip wrapping | N/A | No chip/filter row on Resident Guide. Not applicable. |
| 7. Hairline divider visibility | PASS | No explicit hairline dividers between guide items on mobile (guide items use `border-radius:8px` blocks, not row dividers). Category labels (`cat-label`) visually separate sections. The absence of hairlines is intentional — guide items are spaced tiles, not divided rows. No collapse concern. |
| 8. Empty state legibility | N/A | No empty state shown for Resident Guide mobile. Not applicable to this mockup. |
| 9. iOS Safari quirks | IMPROVEMENT | Header uses `position:sticky; top:0; z-index:40`. FAB uses `position:absolute` within the mock frame (line 137) for mockup purposes, with a comment noting production value uses `position:fixed`. Production `position:fixed` without `transform: translateZ(0)` can cause rendering issues on iOS Safari when the virtual keyboard appears — the FAB may jump. The production CSS template should include `transform: translateZ(0)` on the FAB. No `safe-area-inset-bottom` is applied to the tab bar itself (the tab bar is a plain block element in the mockup). In production, the tab bar needs `padding-bottom: env(safe-area-inset-bottom)` for iPhone 14 Pro and newer. |
| 10. Form input affordances | IMPROVEMENT | Sidebar search is `height:40px` (line 77) — below 44px minimum touch target height. Placeholder text is `font-size:14px` (line 205). In the live implementation: input needs `font-size:16px` and `height:44px` minimum. |

### Blockers

- **`.guide-item` touch height at 34px (line 93).** Guide navigation items are the primary interactive elements on the landing state. `padding:9px 16px` at 14px font gives rendered height ≈34px — 10px below the 44px minimum. These are used in a list where the resident taps to open a clinical guide. Must reach 44px. Fix: increase to `padding:13px 16px` or add `min-height:44px` with flex alignment.
- **Sidebar search height at 40px (line 77).** The search input affordance is 40px tall — below 44px. Fix: set `height:44px`.

### Improvements

- **iOS tab bar safe-area inset.** In production, the tab bar needs `padding-bottom: env(safe-area-inset-bottom)` to avoid the home indicator bar on iPhone 14 Pro (notch/island devices). The mockup does not show this — acceptable for a static mockup but must be noted for implementation.
- **FAB production CSS needs `transform: translateZ(0)`.** The production `position:fixed` FAB should add `transform: translateZ(0)` to force GPU compositing and prevent iOS virtual keyboard interaction issues.
- **Search input height.** Increase to `height:44px` in the live implementation.
- **Search input font-size.** Must be 16px on `<input>` to prevent iOS zoom.

### Acceptable as-is

- FAB positioning: correctly addresses Phase 2 blocker — `bottom:76px` clears tab bar, production CSS template provided.
- Single back button: Phase 2 duplicate back button correctly removed.
- Article H1: correctly `font-size:28px; font-weight:600` (not extrabold).
- Article body: correctly `font-size:14px; line-height:1.55` (not leading-8).
- Active guide item: correctly uses neuro-* tokens (not blue-*).
- Header back button and favourites button: correctly at 44px.
- Article CTA links: `flex-wrap:wrap` prevents overflow.
- Bottom padding (100px) clears tab bar and FAB.

---

## Mockup 4 — home-2026-05-14-proposal.html

| Check | Result | Line / section reference |
|---|---|---|
| 1. Touch targets ≥44px | PARTIAL PASS | Desktop header icon buttons use `min-height:44px; min-width:44px` (lines 645–649). ToolRowCard star buttons use `min-height:44px; min-width:44px` with negative margin offset (lines 511–513, 524, 537). Mobile header icon buttons use `width:36px; height:36px` — 36px, below the 44px minimum (lines 449–451). Pill buttons: `padding:6px 12px` at 13px font — approx 31px height. Below 44px. |
| 2. No horizontal overflow | PASS | Mobile frame `width:375px; overflow:hidden`. Main `padding:28px 20px 96px` gives 335px usable width. Featured rail uses `overflow-x:auto` for horizontal card scroll. Pill row uses `overflow-x:auto`. Scenario content fits within frame. No overflow detected. |
| 3. Sticky search persistence | N/A | Home page does not have a sticky search in the proposal (the cmd-K optional is shown as a stretch goal, explicitly labeled). Not required here. |
| 4. No hidden content under tab bar | PASS | Main uses `padding:28px 20px 96px` — 96px bottom padding correctly clears the tab bar (≈60px) and provides comfortable spacing. No content hidden under tab bar. |
| 5. Long-content truncation | IMPROVEMENT | Scenario headers use `.title { font-size:18px; font-weight:600 }` (line 116). "Intracerebral haemorrhage" is 25 chars — at 18px semibold in a flex row with an 18px chevron, it measures approximately 300px. In a 335px usable width this is tight but fits on one line. The `.subtitle` is 13px at `line-height:1.4`. "ICH management pathway" fits. No overflow. Trending trial section: trial names with metadata on one line — "NINDS-tPA" + year chip — fits at 375px. |
| 6. Filter chip wrapping | PASS | Pill row uses `display:flex; gap:10px; overflow-x:auto` (line 484). Pills use `flex-shrink:0`. Scrolls horizontally, no wrapping. "Headache" and "AMS" pills remain accessible via scroll. |
| 7. Hairline divider visibility | PASS | `.rowcard` uses `border-bottom:1px solid #f1f5f9` (line 124). Visible against white background. No collapse detected. |
| 8. Empty state legibility | N/A | No empty state shown for Home. Not applicable. |
| 9. iOS Safari quirks | IMPROVEMENT | Header uses `position:sticky; top:0; z-index:40` (line 443) — safe. No `position:fixed` elements on mobile. Tab bar is a regular block element. The cmd-K search bar is rendered as a non-interactive `<div>` in the mockup and explicitly labeled as optional/stretch. No iOS Safari quirks introduced by the mockup itself. Note: the `⌘K` hint badge (line 589) is a desktop-only pattern — on mobile, `⌘K` has no meaning. If the cmd-K search is implemented, the mobile affordance should use a different hint ("tap to search" or none). |
| 10. Form input affordances | N/A | No actual form inputs on Home (search is a non-interactive div in this mockup). Not applicable here. |

### Blockers

- **Mobile header icon buttons at 36px (lines 449–451).** The search and favourites icon buttons in the mobile header use `width:36px; height:36px` — same issue as trials-catalogue. These appear on every page. Must reach 44px before approval. Fix is identical to trials-catalogue: use `min-height:44px; min-width:44px; display:flex; align-items:center; justify-content:center`.

### Improvements

- **Pill button height (line 75).** Pills use `padding:6px 12px` — approx 31px height. For a filter rail tapped frequently, increase to `padding:10px 12px` or `min-height:44px`. Lower priority than header buttons.
- **cmd-K hint on mobile (line 589).** The `⌘K` shortcut label has no meaning on mobile. If the optional cmd-K search is implemented, either hide the hint on mobile or replace with a different label. Mark as stretch-goal implementation note.

### Acceptable as-is

- ToolRowCard star buttons: correctly fixed to 44px with negative margin offset — the primary fix for this page.
- Cobalt-fill active pill: correctly applied to the "All" pill — the second primary fix for this page.
- Featured rail: `width:200px` tiles scroll horizontally, no overflow.
- Bottom padding (96px): correctly clears tab bar.
- Hairline dividers: correct.
- Scenario headers: font-weight corrected (semibold, not black/extrabold).
- Trending trials section: correctly truncates with `border-bottom:none` on last item.

---

## Overall mobile-fitness verdict

**trials-catalogue-2026-05-14-proposal.html** — One blocker (header icon buttons at 36px). All Phase 1/2 findings addressed: sticky search correctly implemented, star buttons correctly sized, shadow tokens removed. Lock pending one fix.

**resident-toolkit-2026-05-14-proposal.html** — No blockers. All Phase 1/2 improvements correctly applied. Minor improvements noted (pill height, search font-size) but none blocking. Ready to lock as-is.

**resident-guide-2026-05-14-proposal.html** — Two blockers: (1) `.guide-item` touch height at 34px — primary navigation controls must reach 44px; (2) sidebar search height at 40px — below minimum. FAB positioning correctly addresses Phase 2 blocker. Cannot lock until both blockers are resolved.

**home-2026-05-14-proposal.html** — One blocker (header icon buttons at 36px — same cross-page issue as trials-catalogue). Both targeted fixes (star button 44px, cobalt-fill pill) are correctly applied. Lock pending the shared header icon button fix.

**Cross-page note:** The header icon buttons (`width:36px; height:36px`) appear to be a shared component defect inherited from the reference design — it appears identically in trials-catalogue and home, and likely in all pages. A single fix to the shared `<header>` component resolves it across all four mockups simultaneously.
