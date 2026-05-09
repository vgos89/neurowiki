# Mobile Audit — NeuroWiki Full-Repo Agent Review

**Agent:** mobile-first-developer  
**Date:** 2026-05-08  
**Viewport focus:** 375px (iPhone SE / smallest common phone)  
**Overall rating:** YELLOW — Core mobile scaffold is solid; several specific interaction patterns fall short of the 44px touch-target floor, one safe-area handling bug exists, and the 837 kB TrialPageNew chunk is a meaningful LCP risk on slow cellular.

---

## Summary

The layout chrome (MobileHeader + MobileBottomNav + Layout) is well-constructed. Safe-area insets are handled correctly on the bottom nav, and the `pb-[60px]` on the main scroll container clears the nav reliably. Lazy loading is used across all page-level routes. The main concerns are: (a) several interactive elements — favouites star in TrialLegendCard, close buttons in modal sheets, search button in MobileHeader, and the LVO info button in NihssCalculator — are under 44px in both dimensions; (b) the StrokeBasicsWorkflowV2 sticky header uses `top-16` (64px) but the main content panel adds `mt-16` on top of that, creating a potential double-offset on mobile; (c) `safe-area-inset-bottom` in StrokeBasicsWorkflowV2 is applied as a CSS class name (`safe-area-inset-bottom`) rather than a CSS value, so the home-indicator clearance is effectively 0px on iPhone; (d) TrialPageNew at ~837 kB gzipped is lazy-loaded but contains no internal code splitting, blocking LCP on slow 3G for the entire trial deep-link path.

---

## Finding 1 — Navigation (MobileBottomNav, MobileHeader)

**Severity:** P2

**MobileBottomNav** (`src/components/layout/MobileBottomNav.tsx`)

- The nav bar is `h-[60px]` with `paddingBottom: env(safe-area-inset-bottom, 0px)` applied inline. This is correct — the bar grows with the iPhone home indicator without losing the 60px visual area. Safe-area handling is **green** here.
- Each tab is a `<Link>` with `flex-1 flex flex-col items-center justify-center`. At 375px with 5 tabs, each tab is 75px wide. Height is 60px. Both dimensions clear the 44px minimum. **Green.**
- Icon size is `w-[22px] h-[22px]` and label is `text-[10px]`. The 10px label is below the 16px floor that prevents iOS auto-zoom, but since this is a non-editable `<span>` (not an input), it does not trigger zoom. Legibility at 10px is marginal but acceptable for a tab label. Borderline — **Yellow.**
- Tab order (Home, Trials, Calcs, Pathways, Guide) is locked per spec. Active state uses `aria-current="page"`. **Green.**

**MobileHeader** (`src/components/layout/MobileHeader.tsx`)

- The search button is `w-9 h-9` (36px × 36px) — below the 44px minimum on both axes. The padding does not compensate: `rounded-full flex items-center justify-center` with no additional `p-*` brings the tap target to exactly 36px. This is a touch target failure.
- The `FavouritesStarButton` is rendered adjacent. Its size was not directly readable from this file but follows the same pattern. Likely similar issue.
- The header brand `<Link>` (logo + wordmark) is adequately sized — the flex row spans enough width and height.
- The search button's `onClick` is a `console.log` stub — no overlay. This is a known `TODO(search-overlay)` and not a regression, but worth noting that mobile users tapping search get no feedback.

**Fix:** Increase the search button padding: add `p-2` to bring the tap zone to 40px, or add a `-m-1` negative margin on the parent to reach 44px effective tap area.

---

## Finding 2 — Touch Targets (Calculator and Trial Pages)

**Severity:** P1

**TrialLegendCard favourite star** (`src/components/trials/TrialLegendCard.tsx:92–110`)

The favourite star button uses `p-0.5` (2px padding) and renders a `w-3.5 h-3.5` (14px) SVG. The effective tap target is approximately 18px × 18px — far below the 44px minimum. In the trial catalog this star is the only interactive element besides the card link itself, and it sits flush against the right edge. On a phone, users will frequently miss-tap between the star and the card link.

**NihssCalculator LVO info button** (`src/pages/NihssCalculator.tsx:134–139`)

The `<button>` wrapping the `<Info>` icon uses `p-0.5` with a `w-2.5 h-2.5` icon on mobile (scales to `w-3.5 h-3.5` on `md:`). Tap target is approximately 11–15px — unusable at 375px. The LVO probability tooltip is a clinically meaningful affordance; an untappable trigger makes it inaccessible on mobile.

**Modal close buttons — stroke pathway modals**

Multiple modals use `w-8 h-8` (32px) close buttons:
- `src/components/article/stroke/ThrombectomyPathwayModal.tsx:55` — `w-8 h-8`
- `src/components/article/stroke/TpaReversalProtocolModal.tsx:99` — `w-8 h-8`
- `src/components/article/stroke/HemorrhageProtocolModal.tsx:90` — `w-8 h-8`
- `src/components/article/stroke/OrolingualEdemaProtocolModal.tsx:98` — `w-8 h-8`

All are 32px × 32px. The Apple HIG and Google Material Design both require 44px minimum. Closing a modal during a stroke code with imprecise taps on a 32px target introduces friction at the worst possible moment.

**NihssItemCard option buttons** (`src/components/NihssItemCard.tsx:136–148`)

On mobile the scoring buttons use `px-3 py-2` with `rounded-full text-xs`. Vertical padding of `py-2` gives 8px top + 8px bottom + font-size ≈ 12px ≈ 28px total height. Below the 44px floor. These are the primary interactive elements in the NIHSS calculator — every item requires tapping one of these options.

**CodeModeStep1 disabling-symptoms checkboxes** (`src/components/article/stroke/CodeModeStep1.tsx:380`)

Each symptom label uses `min-h-[40px]`. 40px is 4px under the minimum. The checkbox itself is `w-4 h-4` (16px) — the label text adjacent to it extends the tap area, but the label `for` association targets the checkbox; users may not reliably hit the text on a 375px screen with gloves or with imprecise touch.

---

## Finding 3 — Sticky Header / Footer Scroll Behavior

**Severity:** P2

**Layout main padding** (`src/components/layout/Layout.tsx:60`)

`<main>` uses `pb-[60px]` on mobile to clear the bottom nav. This is correct and sufficient.

**StrokeBasicsWorkflowV2 double-offset bug** (`src/pages/guide/StrokeBasicsWorkflowV2.tsx:281, 382`)

The sticky tab header is positioned `sticky top-16` (top: 64px) — accounting for the 60px MobileHeader plus 4px. The card content panel directly below uses `mt-16` (margin-top: 64px). These are both correct independently, but the `mt-16` is applied to the content that sits *below* the sticky header — not to compensate for it. The result is that card content has an extra 64px of margin above it even though the sticky header already pushes it down. At 375px this wastes approximately 12–15% of the visible viewport before any clinical content appears.

Additionally, `style={{ scrollMarginTop: '163px' }}` is hard-coded on the content panel (`src/pages/guide/StrokeBasicsWorkflowV2.tsx:382`). This value was likely measured on a specific device. If the QuickReferenceCard (`workflowMode === 'study'`) is visible, the sticky header height increases and 163px becomes incorrect, causing the auto-scroll on tab change to land under the sticky bar.

**NihssCalculator sticky header** (`src/pages/NihssCalculator.tsx:108–241`)

The NIHSS sticky header is `sticky top-0`. On mobile, `top-0` means it sits immediately below the MobileHeader (which is itself `sticky top-0 z-40`). The NIHSS header is `z-40` as well — same z-index as MobileHeader. If both are sticky and at the same z-index, the MobileHeader wins in DOM order (it comes first in Layout). The NIHSS header will correctly stack below the MobileHeader because it is inside the scrollable `<main>` element and the MobileHeader is outside it, so scroll behavior is correct. However, the offset calculation in `handleNihssChange` manually reads `mainNavHeight = 64` — this must match the actual MobileHeader height (also 60px, not 64px). A 4px discrepancy could cause the auto-scroll-to-next-item to land slightly under the NIHSS header on some phones.

---

## Finding 4 — Long-Form Reading on Mobile (Guide Pages)

**Severity:** P3

**ArticleLayout** (`src/components/article/ArticleLayout.tsx`)

- Max-width of `max-w-2xl` (672px) with `px-5` (20px) side padding gives a content column of 335px at 375px viewport. Comfortable reading width.
- Body text is `text-lg` (18px) for lead text and implied `text-sm` (14px) / `text-base` (16px) in body paragraphs — acceptable, above the 16px zoom floor.
- The article adds `h-20 md:h-0` bottom spacer for mobile — correct approach to ensure content clears the bottom nav.
- The back button (`p-1.5 -ml-1.5`) has an effective tap height of approximately 36px. Below the 44px target but unlikely to be a source of frustration since it is a large button row.
- The Quick/Detailed toggle buttons (`px-2.5 py-1`) are approximately 28px tall — undersized for touch.

**IvTpa.tsx** and other guide articles

These pages delegate entirely to `ArticleLayout` and add no custom layout. No overflow or viewport-escape issues were found in the content composition.

**StrokeBasics / StrokeBasicsWorkflowV2**

The tab bar (`flex border-b`) with three tabs (`Vitals`, `Imaging`, `Summary`) uses `py-2.5` — approximately 32px total height. Each tab is `flex-1` giving 125px width at 375px, which is adequate horizontal tap area but the height remains under 44px.

---

## Finding 5 — Trial Card and List Readability on Mobile

**Severity:** P3

**TrialLegendCard** (`src/components/trials/TrialLegendCard.tsx`)

- Trial cards use `pl-[34px] pr-5 py-3.5` — adequate vertical padding.
- Line 3 (mobile-only tag + keyStat) is correctly shown on mobile with `md:hidden`. Line 1 tags are `hidden md:inline-flex` — these do not appear on mobile at all. The mobile-only Line 3 correctly fills this gap.
- Trial names use `text-sm font-semibold whitespace-nowrap truncate`. At 375px, with the 6px category dot, 34px left-pad, and star button on the right, the available width for the trial name is approximately 260px. Long names (e.g., "THRACE") will be fine; longer descriptive names may truncate early. This is an acceptable trade-off given the scrollable list pattern.
- Finding text is `text-sm leading-[1.55]` — readable at 375px.
- The card itself is a `<Link>` that spans full width — adequate tap target height-wise (approximately 60–80px with Line 3).
- No horizontal overflow issues. Cards stack vertically as expected.

**TrialsPage filter chips** (`src/pages/TrialsPage.tsx:310`)

Filter chips use `px-3 py-[5px]` — approximately 28px height. Category filter chips are in a horizontally scrollable rail (`overflow-x-auto scrollbar-hide`). The scrollable container hides the scrollbar but is scrollable on touch. This pattern is acceptable though the chip height is below 44px. Since multiple chips are visible and the entire row is swipeable, miss-taps are less critical than for isolated small targets.

**TrialPageNew** — no table overflow issues found for trial content. The ReactMarkdown table renderer wraps tables in `overflow-x-auto` (`src/pages/trials/TrialPageNew.tsx:7270`). Correct.

---

## Finding 6 — Calculator Workflow on Small Screen (NIHSS)

**Severity:** P2

**NIHSS sticky header density at 375px**

The sticky header contains four UI zones across one row: Back button + NIHSS total score + LVO probability section + Rapid/Detailed toggle + Copy/Reset/Star buttons. At 375px, the header uses responsive sizing (`text-[8px] md:text-[10px]`, `text-2xl md:text-4xl`) which is appropriate. However, `text-[8px]` for the "NIHSS TOTAL" label and "LVO" label is extremely small — 8px text is difficult to read for any user and may be unreadable for users with visual impairments, even if it does not trigger iOS zoom (which requires `<16px` on inputs, not static text).

**NIHSS scoring buttons** (see Finding 2 above) — `py-2` gives 28px height. For 15 items requiring multiple button taps each, this is the dominant friction point in the entire calculator flow.

**Auto-advance scroll** (`src/pages/NihssCalculator.tsx:56–79`)

The auto-scroll uses a manual offset of `mainNavHeight = 64` (hardcoded). The MobileHeader is 60px. If there is a 4px discrepancy, the next NIHSS item card will scroll to 4px under the combined sticky (MobileHeader + NIHSS header), partially hidden. Low severity but observable on some devices.

**Mode toggle buttons** (Rapid/Detailed) use `px-2 py-1 text-[9px]` on mobile — 9px text, approximately 24px height. Functionally important toggle, substantially undersized.

**NIHSS item card padding** — cards use `p-6` (24px all sides). At 375px with 8px outer padding (`px-4`), the usable card width is 335px. Adequate for content display.

---

## Finding 7 — Stroke Pathway Sub-Components

**Severity:** P2

**CodeModeStep1** (`src/components/article/stroke/CodeModeStep1.tsx`)

- Input fields (BP, glucose, weight) all use `min-h-[44px]` — **green.**
- NIHSS number input uses `w-12 min-h-[44px]` — adequate.
- The CTA button uses `min-h-[52px]` — **green**, correctly over-sized for a primary action.
- LKW time picker trigger button (`text-2xl font-semibold`) is large enough to tap.
- Checkbox inputs are `w-4 h-4` (16px) with associated `<label>` using `min-h-[36px]`. The label is clickable and covers more area, but the overall row height of 36px is 8px below the minimum.

**StrokeBasicsWorkflowV2 sticky header stacking**

The sticky wrapper is `sticky top-16 z-20`. The MobileHeader is `sticky top-0 z-40`. The workflow page header stacks below the MobileHeader correctly because it is inside the scrollable main area. However, `top-16` assumes the MobileHeader is exactly 64px. The MobileHeader is declared as `h-[60px]`. On a device without notch, `env(safe-area-inset-top)` is 0, so `top-16` (64px) leaves a 4px gap between MobileHeader and the workflow header — a hairline white gap. On devices with a status bar (notch), the MobileHeader may actually render taller if the OS extends the safe area upward, which the current implementation does not account for.

**DeepLearningModal** (`src/components/article/stroke/DeepLearningModal.tsx:139`)

On mobile (`<lg`): `bottom-0 left-0 right-0 h-[90vh] rounded-t-2xl`. This is the correct bottom-sheet pattern for mobile — full-width, 90% of viewport height, rounded top corners. **Green** for modal UX pattern.

**ThrombolysisEligibilityModal** (`src/components/article/stroke/ThrombolysisEligibilityModal.tsx:222`)

Uses `items-end sm:items-center` — slides up from bottom on mobile, centered on small tablet+. This is the correct mobile-sheet pattern. Content uses `max-h-[92dvh]` with `dvh` units — correctly handles mobile URL bar height changes. **Green.**

**ThrombectomyPathwayModal** (`src/components/article/stroke/ThrombectomyPathwayModal.tsx:44–45`)

Uses `p-4` container with `max-w-6xl max-h-[95vh]` — this is a floating modal centered at all screen sizes. At 375px with 16px padding (p-4), the modal is 343px wide. The content is `EvtPathway` embedded inside — the pathway page is designed for mobile but now carries additional modal chrome overhead. No full-screen treatment on mobile. This is a missed opportunity: at 375px a floating modal with 4px side padding is functionally equivalent to full-screen but visually inferior (rounded corners and shadow visible). The pattern used by `ThrombolysisEligibilityModal` (bottom-sheet on mobile) is preferred. Low severity given the modal still works, but inconsistent with the better modal pattern used elsewhere.

---

## Finding 8 — Overflow and Horizontal Scrolling

**Severity:** P3

No uncontained fixed-width elements were found in the primary audit paths. Scrollable horizontal rails use `overflow-x-auto scrollbar-hide` or the equivalent hidden scrollbar pattern — all correctly handled.

The TrialVisualizations component (`src/components/trials/TrialVisualizations.tsx:173, 248, 585`) uses `overflow-x-auto` on chart containers. This is correct for chart elements that may have minimum widths wider than the viewport.

The `ReactMarkdown` table wrapper in TrialPageNew uses `overflow-x-auto` — correct.

One potential overflow source: `CodeModeStep3.tsx:348` uses `overflow-x-auto` on a `<pre>` block — correct.

No bare `<table>` elements without overflow wrappers were found in the audited paths.

---

## Finding 9 — Safe-Area Insets

**Severity:** P1

**MobileBottomNav** (`src/components/layout/MobileBottomNav.tsx:57`)

`style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}` — **correct.** The nav bar visually extends on iPhone to clear the home indicator.

**Layout main content** (`src/components/layout/Layout.tsx:60`)

`pb-[60px]` — accounts for the bottom nav height but does not separately add `env(safe-area-inset-bottom)`. Since the bottom nav already expands into the safe area via its own padding, content ends at the top of the home indicator zone, not beneath it. This is **correct** — the nav bar acts as the physical barrier.

**StrokeBasicsWorkflowV2 bottom spacer** (`src/pages/guide/StrokeBasicsWorkflowV2.tsx:772`)

```
<div className="h-24 safe-area-inset-bottom" />
```

`safe-area-inset-bottom` is not a valid Tailwind class. It will be ignored — no CSS will be applied for this class name. The intent was to add padding for the iPhone home indicator, but the actual effect is only the `h-24` (96px) fixed spacer. This is a **bug**: the safe area is not being applied. The correct implementation would be `style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}` on this div, or using the Tailwind plugin approach with `pb-safe`. The 96px fixed spacer may be sufficient visually in most cases but is semantically wrong and could be incorrect on iPads or future devices with different safe-area values.

**Calculators using CSS custom properties** (`src/pages/HeidelbergBleedingCalculator.tsx:663`, `src/pages/IchScoreCalculator.tsx:799`, etc.)

These pages use `calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))` for fixed result bars — the correct approach for elements that need to clear both the bottom nav and the iPhone home indicator simultaneously. **Green.**

**EvtPathway** (`src/pages/EvtPathway.tsx:1536`)

Uses `pb-[max(1rem,env(safe-area-inset-bottom,1rem))]` — correct, uses `max()` to ensure at minimum 1rem padding. **Green.**

---

## Finding 10 — Performance on Mobile

**Severity:** P2

**TrialPageNew chunk size**

`TrialPageNew` is lazy-loaded via `src/App.tsx:33`. The chunk is reported at approximately 837 kB (referenced in the audit brief). At slow 3G (750 Kbps), this chunk alone takes approximately 9 seconds to download — well above the 5-second TTI budget. The page has no internal code splitting or streaming. For users opening a direct trial link (common for shared links in clinical settings), the entire 837 kB must download before any content is shown.

The `ReactMarkdown` and `remarkGfm` imports, along with all chart components (`DeltaBandChart`, `GrottaBarChart`, `BenchmarkThresholdChart`), are bundled in the same chunk. These could be further lazy-loaded within TrialPageNew to reduce the critical path.

**StrokeBasicsWorkflowV2 — good lazy loading**

Modal components are correctly lazy-loaded (`src/pages/guide/StrokeBasicsWorkflowV2.tsx:18–32`). `DeepLearningModal`, `ThrombectomyPathwayModal`, `ThrombolysisEligibilityModal`, `CodeModeStep2/3/4`, and `NihssCalculatorEmbed` are all `React.lazy()`. This means the stroke workflow initial load does not include modal content — **good.**

**Clinical pearls lazy loading**

`strokeClinicalPearls` data is loaded dynamically via `import('../../data/strokeClinicalPearls')` on mount — **good** for reducing initial bundle.

**Font loading** (`index.html:45–48`)

Google Fonts are loaded via `media="print" onload="this.media='all'"` — non-render-blocking. **Green.**

**Material Symbols font**

The Material Symbols font is loaded the same way. However, the font-variation-settings range (`opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200`) loads a large variable font. On a cold load over slow 3G, the icon font may not be available for the first paint — icons will show as text characters until the font loads. This is a flash-of-unstyled-icons issue, not a layout-breaking bug.

**PWA manifest** (`public/manifest.json`)

The manifest is present and correctly configured with `"display": "standalone"`, correct icons (192px and 512px), and theme color. No service worker was found in the audit — the app is installable as a PWA but does not cache pages for offline use. On hospital WiFi drop-outs, the app will fail to load rather than serving from cache. This is a significant gap for the clinical use case described in the product intent.

**Viewport meta** (`index.html:5`)

`<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />` — `viewport-fit=cover` is present, required for `env(safe-area-inset-*)` to work on iOS. **Green.**

---

## Top 5 Mobile Fixes

### Fix 1 — P1: Touch targets below 44px floor

Files: `src/components/trials/TrialLegendCard.tsx:92`, `src/pages/NihssCalculator.tsx:134`, `src/components/article/stroke/ThrombectomyPathwayModal.tsx:55`, `src/components/article/stroke/TpaReversalProtocolModal.tsx:99`, `src/components/article/stroke/HemorrhageProtocolModal.tsx:90`, `src/components/article/stroke/OrolingualEdemaProtocolModal.tsx:98`, `src/components/NihssItemCard.tsx:136`, `src/components/layout/MobileHeader.tsx:28`

The favourite star in TrialLegendCard (`p-0.5`, 18px effective), the LVO info button in NihssCalculator (`p-0.5`, ~12px effective), and all four modal close buttons (`w-8 h-8`, 32px) need to reach 44px minimum. The NIHSS item option buttons (`py-2`, ~28px) are the most-used interactive elements in the app and should be prioritized.

Approach: replace `p-0.5` with `p-2.5` (10px padding each side + icon = ~34px, or add negative margin `-m-1` to reach 44px without altering visual layout). For modal close buttons, change `w-8 h-8` to `w-11 h-11` (44px). For NIHSS item buttons, change `py-2` to `py-3` (48px total with 12px font).

### Fix 2 — P1: Safe-area bug in StrokeBasicsWorkflowV2

File: `src/pages/guide/StrokeBasicsWorkflowV2.tsx:772`

`<div className="h-24 safe-area-inset-bottom" />` — `safe-area-inset-bottom` is not a valid CSS class and produces no style. Change to:

```tsx
<div className="h-24" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }} />
```

or use `pb-safe` if the Tailwind safe-area plugin is added. On iPhone the current code may clip the last card content behind the home indicator.

### Fix 3 — P2: StrokeBasicsWorkflowV2 double-offset and hardcoded scroll margin

File: `src/pages/guide/StrokeBasicsWorkflowV2.tsx:281, 382`

`sticky top-16` on the workflow header assumes the MobileHeader is 64px; it is 60px. The 4px hairline gap should be corrected to `top-[60px]` or a CSS custom property. The `mt-16` on the content panel is additive margin below the sticky header — verify this is intentional (it pushes content away from the sticky header by 64px even though the sticky header already positions itself above the content). If unintentional, remove or reduce it. The hardcoded `scrollMarginTop: '163px'` will be incorrect when `QuickReferenceCard` is visible — measure and update dynamically using a ref.

### Fix 4 — P2: NIHSS mode toggle and header label font sizes at 375px

File: `src/pages/NihssCalculator.tsx:203–216`, `src/pages/NihssCalculator.tsx:120`

`text-[8px]` for "NIHSS TOTAL" and "LVO" labels is below any reasonable legibility floor for clinical users. Increase to `text-[10px]` minimum (already used for md:). For the Rapid/Detailed toggle: `text-[9px] py-1` gives a 24px height target — increase to `py-1.5` and `text-[10px]` minimum.

### Fix 5 — P2: TrialPageNew bundle splitting

File: `src/pages/trials/TrialPageNew.tsx` (~7,469 lines)

The 837 kB chunk is entirely loaded before any trial content renders. Internal lazy loading of heavy chart components (`DeltaBandChart`, `GrottaBarChart`, `BenchmarkThresholdChart`, `TrialVisualizations`, `ReactMarkdown`) would split the critical render path from the visualization path. These components are only visible after scrolling, making them ideal candidates for lazy loading within the page. Target: reduce the critical-path chunk to under 300 kB gzipped, loading charts only when their section scrolls into view or after initial paint.

---

## Supplementary Notes

**MobileDrawer** (`src/components/layout/MobileDrawer.tsx`) is a stub — renders only a backdrop overlay with no drawer content. No issues to report; the file is clearly marked as reserved for future implementation.

**No service worker / offline support** — the PWA manifest is in place but no service worker was found. For a clinical tool used on hospital WiFi, adding a service worker that pre-caches the home page, NIHSS calculator, and stroke guide would materially improve reliability during network interruptions. This is a P3 enhancement, not a defect.

**Input font sizes** — number inputs in CodeModeStep1 use `text-lg font-bold` and `text-xl font-semibold` — well above the 16px floor that prevents iOS auto-zoom. **Green.**

**`touch-manipulation`** — correctly applied to trial cards (`TrialLegendCard.tsx:55`) and question list items (`TrialsPage.tsx:244`). Prevents the 300ms tap delay on mobile browsers. This should be verified on NIHSS item buttons (`NihssItemCard.tsx:136`) where it is not currently set.
