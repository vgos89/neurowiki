# Accessibility Specialist Audit — Full Repo Review
**Agent:** accessibility-specialist  
**Date:** 2026-05-08  
**Scope:** WCAG 2.1 AA compliance across layout shell, navigation, modals, calculators, trial cards, and chart components  
**Mode:** Read-only audit. No files changed.

---

## Overall Accessibility Rating: YELLOW

WCAG 2.1 AA compliance status: **Partial** — foundational patterns are in place but several critical gaps remain that would cause real failures for keyboard-only users and screen reader users in production.

**What is working well:**
- Skip link implemented in `Layout.tsx` (line 38–43) — present and functional
- `<main id="main">` landmark correctly placed in `Layout.tsx` (line 58–61)
- `aria-current="page"` on active nav links in both `MobileBottomNav` and `DesktopRail`
- `aria-label="Main"` on both nav components
- `DeltaBandChart` uses `role="img"` with descriptive `aria-label` on dot grids (lines 178–179, 247–248); individual dots are `aria-hidden="true"`
- `MedicalTooltip` has `aria-label`, `aria-expanded`, and Escape-key close handler
- Most newer calculators (ICH, GCS, ABCD2, HAS-BLED, ROPE, Boston) use `role="radiogroup"` + `role="radio"` + `aria-checked` patterns
- `aria-live="polite"` + `aria-atomic="true"` on score displays in most calculators
- `role="status"` on toast/copy-confirmation messages

**What is failing:**

---

## Finding 1 — NIHSS calculator: no fieldset/legend, no score aria-live region

**Severity:** P0  
**WCAG:** 1.3.1 Info and Relationships (Level A), 4.1.3 Status Messages (Level AA)  
**File:** `src/components/NihssItemCard.tsx`, `src/pages/NihssCalculator.tsx`

`NihssItemCard` renders scoring option buttons as plain `<button>` elements in a `<div>` wrapper with no `role="radiogroup"`, no `aria-labelledby`, and no `aria-checked` state. There is no `fieldset`/`legend` grouping. Screen readers have no way to associate the buttons with the item they belong to (e.g., "Level of Consciousness") or to understand that the buttons are mutually exclusive options.

Additionally, `NihssCalculator.tsx` (lines 120–124) renders the live score total in a plain `<div>` with no `aria-live` region. When a user selects an option and the score updates, screen readers receive no announcement.

Compared to newer calculators in the codebase (ICH Score, GCS, ABCD2) that correctly implement `role="radiogroup"` + `aria-labelledby` + `role="radio"` + `aria-checked`, NIHSS is the most-used calculator and has the weakest accessibility implementation.

**Recommended fix:**
- Add `role="radiogroup"` and `aria-labelledby={item.id + "-label"}` to the buttons container in `NihssItemCard`
- Add `role="radio"` and `aria-checked={isSelected(opt.value)}` to each option button
- Wrap the score total `<div>` in `NihssCalculator.tsx` with `role="status" aria-live="polite" aria-atomic="true"`

---

## Finding 2 — DisclaimerModal and GlobalTrialModal: no focus trap, no role="dialog", no focus return

**Severity:** P0  
**WCAG:** 2.1.2 No Keyboard Trap (Level A) inverse — the modal is unreachable by keyboard and does not trap focus; 2.4.3 Focus Order (Level A)  
**File:** `src/components/DisclaimerModal.tsx`, `src/components/GlobalTrialModal.tsx`

`DisclaimerModal` (lines 71–203): The modal container has no `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby`, and no focus management. When the modal opens, focus is not moved into it. A keyboard user tabbing through the page will tab straight past the modal into the obscured background content. Because the modal blocks background content visually, this creates a trap in the opposite sense: background content is tabbed to but is visually unusable. The `<h2>` "Medical Disclaimer" heading (line 83) exists but is never referenced via `aria-labelledby`.

`GlobalTrialModal` (lines 22–79): Same pattern. The outer `<div>` container has no modal semantics (`role="dialog"`, `aria-modal`, `aria-labelledby`). There is no `useEffect` that moves focus to the first focusable element inside the modal on open, and no handler that returns focus to the trigger element on close.

Contrast with `AspectsModal.tsx` and the stroke protocol modals (`OrolingualEdemaProtocolModal`, `ThrombolysisEligibilityModal`), which correctly implement `role="dialog" aria-modal="true"`. The two most prominent app-wide modals are the ones missing this.

**Recommended fix:**
- `DisclaimerModal`: Add `role="dialog" aria-modal="true" aria-labelledby="disclaimer-title"` to the inner panel div; add `id="disclaimer-title"` to the `<h2>`; add a `useEffect` that moves focus to the first focusable element (the scrollable content div or the "Accept" button) on open
- `GlobalTrialModal`: Same `role`/`aria-modal`/`aria-labelledby` additions; add a `useRef` for the close button and a `useEffect` to move focus to it on open; add a `onKeyDown` Escape handler; store the trigger element in a ref before opening and return focus to it on close
- Both modals need focus trap logic (cycle Tab/Shift+Tab within modal bounds)

---

## Finding 3 — DesktopRail brand link and footer link: no accessible names for icon-only/ambiguous interactive elements

**Severity:** P1  
**WCAG:** 2.4.6 Headings and Labels (Level AA), 4.1.2 Name, Role, Value (Level A)  
**File:** `src/components/layout/DesktopRail.tsx` line 58–68, line 93

The brand lockup `<Link to="/">` (line 58) contains a decorative `<div>` with the letter "N" and the text "NeuroWiki". The link has no `aria-label`. Screen readers will announce the link text as "N NeuroWiki" which is acceptable but suboptimal. More critically, the `<div>` logo container (line 59–64) is not `aria-hidden`, so the "N" is read separately from "NeuroWiki" creating a confusing announcement. Adding `aria-label="NeuroWiki home"` to the `<Link>` and `aria-hidden="true"` to the inner `<div>` logo mark would clean this up.

The footer `<a href="#">` (line 93) links to `#` — this is a no-op anchor that will confuse screen reader users. Announced text will be "About · Feedback, link" but clicking does nothing. This is a placeholder but is currently shipped in production.

**Recommended fix:**
- Add `aria-label="NeuroWiki home"` to the brand `<Link>` in `DesktopRail`; add `aria-hidden="true"` to the `<div>` logo mark
- Same fix needed in `MobileHeader.tsx` line 13 (same pattern)
- Replace the `<a href="#">` footer link with a `<button>` or real destination; mark as `aria-disabled="true"` if not yet implemented

---

## Finding 4 — GrottaBarChart: interactive bar segments have no keyboard access and no screen-reader alternative

**Severity:** P1  
**WCAG:** 2.1.1 Keyboard (Level A), 1.1.1 Non-text Content (Level A)  
**File:** `src/components/trials/archetypes/GrottaBarChart.tsx`

The stacked bar chart segments (lines 153–222) are rendered as `<div>` elements with `onClick` handlers for the tap-tooltip behavior. They have no `tabIndex`, no `role`, no `onKeyDown` handler, and no `aria-label`. Screen readers receive no information about what mRS scores are represented in each segment unless the percentage happens to be visible as inline text.

The containing bar row `<div>` (line 143–151) has no `role="img"` and no `aria-label` summarizing the distribution (compare: `DeltaBandChart` correctly uses `role="img"` with a descriptive `aria-label`).

The mRS legend (lines 229–242) uses color-coded `<div>` squares with text labels, but these are decorative `<div>` elements without ARIA — visually the legend explains the color coding, but it does not connect to the chart data in any machine-readable way.

**Recommended fix:**
- Add `role="img"` and `aria-label` to each arm's bar container summarizing the distribution (e.g., "Intervention arm mRS distribution: mRS 0: 20%, mRS 1: 25%, mRS 2: 15%, mRS 3: 18%, mRS 4: 10%, mRS 5: 8%, mRS 6: 4%")
- Add a visually-hidden `<table>` or `<dl>` below the chart with the same data for screen readers
- Individual segment `<div>` elements should be `aria-hidden="true"` once the accessible summary is in place
- The existing `title` attribute on each segment (line 177) is only useful on desktop hover and is not reliably announced by screen readers — it is not a substitute for ARIA

---

## Finding 5 — Color contrast: `text-slate-400` on white is a Level AA failure for normal-weight text

**Severity:** P1  
**WCAG:** 1.4.3 Contrast (Minimum), Level AA  
**File:** Multiple — `src/components/NihssItemCard.tsx` line 52, `src/components/layout/MobileBottomNav.tsx` line 67, `src/components/TrialLegendCard.tsx` line 71, `src/components/trials/archetypes/GrottaBarChart.tsx` lines 127, 239

`text-slate-400` resolves to `#94a3b8`. On a white (`#ffffff`) background, the contrast ratio is approximately **2.85:1** — below the 4.5:1 minimum required for normal text at Level AA (and below the 3:1 minimum for large/bold text).

Specific instances:
- `NihssItemCard.tsx` line 52: item ID number label in `text-slate-400` — reads "1a", "5b", etc. This is functional navigation information, not decorative.
- `MobileBottomNav.tsx` line 67: inactive tab labels in `text-slate-400` — "Home", "Trials", "Calcs", etc. at 10px font. At 10px, even 3:1 large-text exception does not apply; 4.5:1 is required.
- `TrialLegendCard.tsx` line 71: trial year metadata in `text-slate-400` at 11px.
- `GrottaBarChart.tsx` line 127: arm sample size "n=X" labels in `#94a3b8` at 10px.
- `GrottaBarChart.tsx` line 239: mRS legend text in `#64748b` (`slate-500`, ~4.5:1, borderline pass) — acceptable but worth monitoring.

`text-slate-500` (`#64748b`) has a contrast ratio of approximately **4.54:1** on white and is the minimum acceptable value for normal text. `text-slate-400` is consistently below threshold across the codebase.

**Recommended fix:**
- Replace `text-slate-400` with `text-slate-500` (or darker) for all non-decorative text — metadata labels, NIHSS item IDs, nav tab inactive labels, chart annotation text
- Decorative-only uses of `text-slate-400` (e.g., divider lines, background ornament text) should be accompanied by `aria-hidden="true"` on the element

---

## Finding 6 — MedicalTooltip: trigger only toggles on hover; focus-based disclosure is incomplete

**Severity:** P2  
**WCAG:** 2.1.1 Keyboard (Level A), 1.4.13 Content on Hover or Focus (Level AA)  
**File:** `src/components/MedicalTooltip.tsx` lines 205–216

The tooltip trigger button responds to `onMouseEnter`/`onMouseLeave` for hover (lines 209–210) and `onClick` for tap/click toggle. The button is a native `<button>` so it is keyboard reachable. Pressing Enter/Space when focused will toggle the tooltip via `onClick`. The Escape key closes it via the global handler (lines 117–126). This is partially correct.

However, the tooltip **does not open on focus** (`onFocus` handler is absent). WCAG 1.4.13 requires that content triggered by hover is also triggerable by keyboard focus. A keyboard user tabbing to the Info icon will not see the tooltip until they press Enter. For a purely informational tooltip (not a dialog), the expected pattern is: tooltip appears on focus, disappears on blur, also appears on hover. The current implementation requires an explicit keypress to trigger it.

Additionally, when the tooltip closes, focus does not return to the trigger (not required for tooltips — they are not modals — but worth noting for the click-toggle pattern which effectively acts modal-like on mobile).

The `Info` icon from Lucide React inside the button (line 215) is not `aria-hidden="true"`. The button carries its own `aria-label` so the icon text content is redundant; adding `aria-hidden="true"` would prevent double-announcement.

**Recommended fix:**
- Add `onFocus={() => setIsOpen(true)}` and `onBlur={() => setIsOpen(false)}` to the button (with care for the click-toggle mobile pattern — set a short blur delay to allow the toggle to register)
- Add `aria-hidden="true"` to the `<Info>` icon (line 215)
- Consider adding `role="tooltip"` is already present on the content `<div>` (line 183) — confirm `aria-describedby` linking from trigger to tooltip id for full compliance

---

## Finding 7 — DisclaimerModal: scroll-gate UX has no keyboard-accessible path to scroll completion

**Severity:** P2  
**WCAG:** 2.1.1 Keyboard (Level A)  
**File:** `src/components/DisclaimerModal.tsx` lines 90–93, 145, 159

The disclaimer modal requires the user to scroll to the bottom before the checkbox and accept button become active. The scroll detection (`handleScroll`, lines 43–53) fires on the `onScroll` event of the scrollable div. Keyboard users can scroll a focused overflow container with arrow keys and Page Down, so this is potentially reachable — but only if the scrollable container receives focus, which it does not: the `<div ref={scrollContainerRef}>` at line 90 has no `tabIndex` attribute, meaning keyboard users cannot focus it to scroll with keyboard commands.

The checkbox is `disabled={!hasScrolledToBottom}` and the parent `<label>` has `pointer-events-none` when not scrolled (line 145). A keyboard user who cannot reach the scroll container will be permanently blocked from accepting the disclaimer.

**Recommended fix:**
- Add `tabIndex={0}` to the scrollable content `<div>` (line 90) so keyboard users can focus and scroll it
- Add `aria-label="Disclaimer text, scroll to read"` to that div
- Consider adding a keyboard shortcut hint or a "Mark as read" alternative path for accessibility

---

## Finding 8 — TrialLegendCard: category dot has no accessible label; visual-only encoding

**Severity:** P2  
**WCAG:** 1.4.1 Use of Color (Level A)  
**File:** `src/components/trials/TrialLegendCard.tsx` lines 57–61

The category color dot (a 6px circle, `position: absolute`, `backgroundColor: dotColor`) is the sole visual indicator of trial category (IVT, EVT, Secondary Prevention, etc.). There is no `aria-label` on the dot element, no screen-reader text explaining the category, and the dot is not `aria-hidden="true"`. Screen readers will encounter the empty `<div>` and may announce nothing, or announce an unlabeled element.

The trial card itself (a `<Link>`) does not include the category name in its accessible description anywhere, meaning screen reader users browsing the trial list have no way to know a trial's category from the card alone — they must navigate into the trial detail page.

**Recommended fix:**
- Either add `aria-hidden="true"` to the dot `<div>` and add a visually-hidden `<span className="sr-only">{trial.category}</span>` within the card, or add `aria-label={trial.category}` directly to the dot
- Consider including the category in the `<Link>`'s `aria-label` if one is added (e.g., `aria-label={`${trial.name}, ${trial.year}, ${trial.category} trial`}`)

---

## Finding 9 — GrottaBarChart: mRS legend color swatches have no text alternative

**Severity:** P2  
**WCAG:** 1.4.1 Use of Color (Level A), 1.1.1 Non-text Content (Level A)  
**File:** `src/components/trials/archetypes/GrottaBarChart.tsx` lines 229–242

The mRS legend (lines 229–242) uses 7 color-coded squares (`<div>` with background colors) alongside text labels ("mRS 0", "mRS 1"…). While the text labels are present, the squares themselves convey information (the bar-to-legend mapping) through color alone. The squares lack `aria-hidden="true"`, `role`, or any ARIA. Screen readers will encounter 7 unlabeled `<div>` elements before the text labels.

More critically, the bar segments and the legend are not programmatically connected — a screen reader user cannot associate "the green portion of the bar" with "mRS 0" without independently reading the legend text. This is a color-as-sole-differentiator failure.

**Recommended fix:**
- Add `aria-hidden="true"` to each color swatch `<div>` in the legend
- Add the accessible summary table/description on the chart itself (see Finding 4) — this eliminates the need for screen reader users to parse the color-coded legend at all

---

## Finding 10 — NihssCalculator LVO tooltip: no keyboard access, no Escape handler

**Severity:** P2  
**WCAG:** 2.1.1 Keyboard (Level A)  
**File:** `src/pages/NihssCalculator.tsx` lines 133–142

The LVO Probability info button (line 134–139) and tooltip panel (lines 141–150+) implement a custom popover. The button has `aria-label="LVO Probability Information"` (good). However:
- The tooltip close behavior only handles `mousedown` outside (line 41–53 `handleClickOutside`) — no Escape key handler is present for this specific tooltip (unlike `MedicalTooltip` which does handle Escape)
- The tooltip panel itself has no `role`, no `aria-live`, and is not announced to screen readers when it opens
- The `Info` icon inside the button (line 139) is not `aria-hidden="true"` (minor — the button has its own `aria-label` but the icon path may be read)

**Recommended fix:**
- Add `onKeyDown` to the trigger button to close on Escape
- Add `role="tooltip"` or `role="dialog"` (with `aria-labelledby`) to the tooltip panel depending on whether it is informational or interactive
- Add `aria-hidden="true"` to the `Info` icon

---

## Top 5 Accessibility Fixes (Priority Order)

**Fix 1 (P0) — NIHSS calculator radio group semantics + live score region**  
`src/components/NihssItemCard.tsx` + `src/pages/NihssCalculator.tsx`  
Add `role="radiogroup"` + `aria-labelledby` to the options wrapper; add `role="radio"` + `aria-checked` to each option button; add `role="status" aria-live="polite" aria-atomic="true"` to the score total. This affects the most-used calculator in the app and is a Level A failure.

**Fix 2 (P0) — DisclaimerModal and GlobalTrialModal dialog semantics + focus management**  
`src/components/DisclaimerModal.tsx` + `src/components/GlobalTrialModal.tsx`  
Add `role="dialog" aria-modal="true" aria-labelledby` to modal panels; implement focus-move-on-open and focus-return-on-close; implement focus trap for Tab/Shift+Tab cycle; add Escape close handler to GlobalTrialModal. These are the two most prominent app-wide modals and currently fail Level A keyboard requirements.

**Fix 3 (P1) — GrottaBarChart accessible summary**  
`src/components/trials/archetypes/GrottaBarChart.tsx`  
Add `role="img"` + descriptive `aria-label` to each arm's bar container (or a visually-hidden data table). Mark individual segment `<div>` elements `aria-hidden="true"`. This is a Level A non-text content failure on every trial page that uses Archetype B charts.

**Fix 4 (P1) — Replace text-slate-400 with text-slate-500 for all functional text**  
Multiple files — highest impact in `MobileBottomNav.tsx` (nav labels), `NihssItemCard.tsx` (item IDs), `TrialLegendCard.tsx` (year metadata)  
`text-slate-400` (#94a3b8) on white fails 4.5:1 contrast at Level AA. Replace with `text-slate-500` (#64748b) at minimum for any text conveying meaning. This is a systemic issue across the design system.

**Fix 5 (P2) — DisclaimerModal scrollable container keyboard focus**  
`src/components/DisclaimerModal.tsx` line 90  
Add `tabIndex={0}` to the scrollable content `<div>` so keyboard users can focus and scroll it with arrow/Page Down keys. Without this, keyboard-only users are permanently blocked from completing the mandatory disclaimer acceptance flow — a gating accessibility failure.

---

## Summary Table

| # | Finding | Severity | WCAG | Primary File |
|---|---|---|---|---|
| 1 | NIHSS: no radiogroup semantics, no live score region | P0 | 1.3.1, 4.1.3 | NihssItemCard.tsx |
| 2 | DisclaimerModal + GlobalTrialModal: no dialog role, no focus trap | P0 | 2.1.2, 2.4.3 | DisclaimerModal.tsx, GlobalTrialModal.tsx |
| 3 | GrottaBarChart: no accessible summary for bar charts | P1 | 2.1.1, 1.1.1 | GrottaBarChart.tsx |
| 4 | text-slate-400 fails 4.5:1 contrast on white | P1 | 1.4.3 | MobileBottomNav.tsx, NihssItemCard.tsx, TrialLegendCard.tsx |
| 5 | MedicalTooltip: no onFocus trigger; icon not aria-hidden | P2 | 2.1.1, 1.4.13 | MedicalTooltip.tsx |
| 6 | DisclaimerModal: scroll container not keyboard-focusable | P2 | 2.1.1 | DisclaimerModal.tsx |
| 7 | TrialLegendCard: category dot color-only encoding | P2 | 1.4.1 | TrialLegendCard.tsx |
| 8 | GrottaBarChart: mRS legend swatches not aria-hidden | P2 | 1.4.1, 1.1.1 | GrottaBarChart.tsx |
| 9 | NihssCalculator LVO tooltip: no Escape handler | P2 | 2.1.1 | NihssCalculator.tsx |
| 10 | DesktopRail/MobileHeader: brand logo link unclear name | P3 | 2.4.6, 4.1.2 | DesktopRail.tsx, MobileHeader.tsx |

---

## Positive Findings (Do Not Regress)

The following patterns are correctly implemented and should be preserved as templates for future work:

- Skip link in `Layout.tsx` — correct `sr-only focus:not-sr-only` pattern with `href="#main"` matching `<main id="main">`
- `aria-current="page"` on active nav links in both `MobileBottomNav` and `DesktopRail`
- `DeltaBandChart` `role="img"` + `aria-label` on both dot grids, dots `aria-hidden="true"`
- `role="radiogroup"` + `role="radio"` + `aria-checked` pattern in ICH Score, GCS, ABCD2, HAS-BLED, ROPE, Boston Criteria calculators — this pattern should be retrofitted to NIHSS
- `role="status" aria-live="polite" aria-atomic="true"` on score displays in most calculators — retrofit NIHSS
- `MedicalTooltip` Escape key handler and `aria-expanded` on trigger — extend with `onFocus`/`onBlur`
- `role="dialog" aria-modal="true"` in AspectsModal, stroke protocol modals — this existing pattern should be applied to DisclaimerModal and GlobalTrialModal
