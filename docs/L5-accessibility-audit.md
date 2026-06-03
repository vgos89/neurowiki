# L5 Accessibility Audit — NeuroWiki (WCAG 2.1 AA)

**Date:** 2026-05-13
**Reviewer:** accessibility-specialist (model: claude-sonnet-4-6)
**Status:** findings only — no code changes
**Standard:** WCAG 2.1 AA

> **STALENESS NOTE (2026-06-03):** The safety-critical batch (H1, H2, H7) was
> resolved by a later focus-trap consolidation pass (the `useModalFocusTrap`
> hook, created 2026-05-17, plus the "B-1"/"B-3" stroke-code a11y fixes) and is
> marked RESOLVED inline below. Several remaining findings reference files that
> have since been renamed or removed (e.g. `GCAPathway.tsx` no longer exists at
> the cited path) and the pathway `aria-live` findings (H3) are now partially
> addressed. **This document is stale for H3–H6 and the Medium/Low findings — a
> fresh re-audit is required before acting on them. Do not treat the remaining
> line numbers as current.**

---

## Executive summary

NeuroWiki's L5.6 shell extraction is a meaningful accessibility win: the shared `CalculatorHeader`, `CalculatorDrawer`, and `CalculatorToast` components deliver consistent `aria-live`, `aria-atomic`, roving-tabindex keyboard navigation, and touch-target minimums across all ten calculators. The global `<html lang="en">`, skip-link, and landmark structure in `Layout.tsx` are correctly implemented. The biggest gaps are concentrated in the older pathway pages (MigrainePathway, GCAPathway, StatusEpilepticusPathway, ElanPathway), where interactive toggle buttons lack ARIA semantics and score-change feedback is invisible to screen readers. The ThrombectomyPathwayModal and ThrombolysisEligibilityModal are missing focus trapping. A handful of contrast edge cases exist with `text-slate-400` label text at small sizes. No `prefers-reduced-motion` guard exists for page-transition animations injected inline by pathway pages.

---

## Audited surfaces

- `src/components/calculators/` — CalculatorHeader, CalculatorDrawer, CalculatorToast, CalculatorFooter
- `src/pages/` — NihssCalculator, IchScoreCalculator, Abcd2ScoreCalculator, GlasgowComaScaleCalculator (representative L5.6 calculators)
- `src/pages/` — EvtPathway, MigrainePathway, ExtendedIVTPathway, GCAPathway, ElanPathway, StatusEpilepticusPathway
- `src/pages/guide/StrokeBasicsWorkflowV2.tsx`
- `src/pages/trials/TrialPageNew.tsx`
- `src/components/article/ArticleLayout.tsx`
- `src/components/layout/Layout.tsx`, `DesktopRail.tsx`, `MobileBottomNav.tsx`, `MobileHeader.tsx`
- `src/components/AspectsModal.tsx`
- `src/components/MedicalTooltip.tsx`
- `src/components/article/stroke/ThrombectomyPathwayModal.tsx`
- `src/components/article/stroke/ThrombolysisEligibilityModal.tsx`
- `src/components/article/stroke/LKWTimePicker.tsx`
- `src/components/trials/BottomLineDrawer.tsx`
- `src/components/CollapsibleSection.tsx`
- `src/components/FeedbackModal.tsx`
- `src/components/DisclaimerModal.tsx`
- `src/components/GlobalTrialModal.tsx`
- `index.css`

---

## Findings — High priority

### H1 — ThrombectomyPathwayModal missing focus trap and aria-labelledby — ✅ RESOLVED (2026-05-17)

> Fixed: the modal now uses `useModalFocusTrap` and carries `role="dialog" aria-modal="true" aria-labelledby="thrombectomy-modal-title" aria-describedby`. Verified 2026-06-03.


- **Surface:** `src/components/article/stroke/ThrombectomyPathwayModal.tsx:44–79`
- **WCAG criterion:** 2.4.3 Focus Order; 4.1.2 Name, Role, Value
- **Current state:** The modal renders `role="dialog"` is absent — the outer wrapper has no `role`, no `aria-modal`, no `aria-labelledby`, and no focus trap. The only keyboard accommodation is body-scroll lock. The close button's `aria-label` is the generic `"Close"` with no modal context. When the modal opens, focus is not moved into it.
- **Expected state:** Outer container needs `role="dialog" aria-modal="true" aria-labelledby="thrombectomy-modal-title"`. The title element (`<p className="text-base font-semibold">EVT / Thrombectomy</p>`) needs `id="thrombectomy-modal-title"`. Focus must move to the first focusable child on open and return to the trigger on close. Tab/Shift+Tab must cycle within the modal. Escape must close it.
- **Impact:** Screen reader users are not informed they entered a modal context. Keyboard users may tab out of the overlay into the obscured background. Motor-impaired users relying on keyboard cannot reliably navigate within the modal.
- **Fix complexity:** M

### H2 — ThrombolysisEligibilityModal chip buttons missing focus-visible ring — ✅ RESOLVED (2026-05-17)

> Fixed: all chip body buttons and info-icon buttons now carry `focus-visible:ring-2 focus-visible:ring-neuro-500` (B-3 a11y fix). Verified 2026-06-03.


- **Surface:** `src/components/article/stroke/ThrombolysisEligibilityModal.tsx:275–299, 315–330`
- **WCAG criterion:** 2.4.7 Focus Visible
- **Current state:** The chip body buttons (`flex-1 px-3 py-2.5 … focus-visible:outline-none`) and the info-icon buttons (`focus-visible:outline-none`) both suppress the focus ring without providing any replacement. The classes are `focus-visible:outline-none` with no `focus-visible:ring-*` counterpart.
- **Expected state:** Chip buttons need a visible focus indicator. At minimum: `focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:ring-offset-1`. Both the body button and the info-icon button are affected.
- **Impact:** Keyboard users cannot see which contraindication chip is currently focused. This is a safety-relevant UI — a clinician using keyboard cannot see which chip they are about to activate.
- **Fix complexity:** S

### H3 — Pathway pages (MigrainePathway, GCAPathway, StatusEpilepticusPathway, ElanPathway) have no aria-live score or result region

- **Surface:** `src/pages/MigrainePathway.tsx`, `src/pages/GCAPathway.tsx`, `src/pages/StatusEpilepticusPathway.tsx`, `src/pages/ElanPathway.tsx`
- **WCAG criterion:** 4.1.3 Status Messages; 4.1.2 Name, Role, Value
- **Current state:** None of these pathway pages emit an `aria-live` region when the clinical decision output updates. For example, in MigrainePathway the result/recommendation shown to the clinician after Step 5 has no live region. In GCAPathway the tier result and action recommendation update silently. Results appear visually but are never announced to screen readers.
- **Expected state:** Each pathway needs at minimum one `role="status" aria-live="polite" aria-atomic="true"` region that updates with the current recommendation text whenever the result changes. Calculator-shell pages do this correctly via `CalculatorHeader`'s `aria-live` div; pathway pages are not on the shell and have no equivalent.
- **Impact:** Screen reader users following the pathway receive no feedback when their selections produce a clinical result. They cannot know the decision without manually navigating to find it.
- **Fix complexity:** M

### H4 — MigrainePathway and GCAPathway favorite star button missing aria-label

- **Surface:** `src/pages/MigrainePathway.tsx:311–316`; `src/pages/GCAPathway.tsx` (equivalent pattern)
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The favorite toggle button renders only the `<Star>` icon with no `aria-label`. The button reads as "button" with no accessible name to screen readers.
- **Expected state:** `aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}`. The `Star` icon should have `aria-hidden="true"`. (The L5.6 calculator shell gets this right in `CalculatorHeader.tsx:101–109` — pathways need the same treatment.)
- **Impact:** Screen reader users cannot identify the purpose of the star button.
- **Fix complexity:** S

### H5 — StrokeBasicsWorkflowV2 mode-toggle buttons use aria-checked without role

- **Surface:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:296–320`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The Code/Study toggle buttons use `aria-checked` (a state attribute valid only on checkboxes, radios, gridcells, menuitemcheckbox, menuitemradio, option, switch, and treeitem). The buttons have `type="button"` — no appropriate role is set. Similarly, the tab-style Vitals/Imaging/Summary buttons (line 330–341) use `focus:outline-none` without a replacement ring.
- **Expected state:** The Code/Study toggle should use `role="radio"` inside a `role="radiogroup"` with `aria-label="Workflow mode"`, or use `role="tab"` + `role="tabpanel"` if the intent is a tab widget. The Vitals/Imaging/Summary buttons need `role="tab"`, `aria-selected`, and matching `role="tabpanel"` regions, plus a visible focus ring (remove bare `focus:outline-none`).
- **Impact:** Assistive technologies misinterpret the state attributes. VoiceOver/NVDA will not correctly announce the current selection mode.
- **Fix complexity:** M

### H6 — LKWTimePicker scroll drum is inaccessible to keyboard users

- **Surface:** `src/components/article/stroke/LKWTimePicker.tsx:88–115`
- **WCAG criterion:** 2.1.1 Keyboard
- **Current state:** The `ScrollCol` time-drum widget is a scrollable `div` containing clickable `div` children. Scroll columns for hour, minute, and period have no `tabIndex`, no keyboard event handlers, and no ARIA role. They are mouse/touch-only.
- **Expected state:** Each scroll column should be operable via arrow keys. The containing element needs `role="spinbutton"` (or `role="listbox"`) with `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`. Arrow up/down must change the selection. The selected item needs `aria-selected="true"`.
- **Impact:** Keyboard users and switch-access users cannot set the LKW time — a core bedside workflow step. This is one of the highest-impact missing interactions in the codebase.
- **Fix complexity:** L

### H7 — FeedbackModal missing aria-modal and focus trap — ✅ RESOLVED (2026-05-17)

> Fixed: the modal now uses `useModalFocusTrap` and carries `role="dialog" aria-modal="true" aria-labelledby="feedback-modal-title"`. Verified 2026-06-03.


- **Surface:** `src/components/FeedbackModal.tsx:191–193`
- **WCAG criterion:** 2.4.3 Focus Order; 4.1.2 Name, Role, Value
- **Current state:** The modal container has `role="dialog" aria-labelledby="feedback-title"` but is missing `aria-modal="true"`. More critically, there is no focus trap implementation — the modal uses no `ref`, no keydown handler for Tab cycling, and does not move focus to the first element on open.
- **Expected state:** Add `aria-modal="true"`. Add focus trap: on open, move focus to the first interactive element; trap Tab/Shift+Tab within the modal; on close, return focus to the trigger element.
- **Impact:** Screen reader users in browse mode will continue reading document content behind the modal. Keyboard users can tab out of the overlay.
- **Fix complexity:** M

---

## Findings — Medium priority

### M1 — CollapsibleSection content hidden with CSS `display:none` without aria-expanded on content region

- **Surface:** `src/components/CollapsibleSection.tsx:90`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The collapsible content is hidden via `className={isActive ? 'block' : 'hidden'}`. The toggle button correctly uses `aria-expanded={isActive}`. However, the hidden content region has no `id` referenced by `aria-controls` on the button, and no `role` or `id` to allow the button to programmatically identify its controlled region.
- **Expected state:** Content wrapper needs a stable `id` (e.g., derived from `title`). Button needs `aria-controls={contentId}`. Used by EVT Pathway, GCA Pathway, SE Pathway, Extended IVT Pathway.
- **Impact:** Screen readers cannot navigate directly to the controlled content when expanding. The association between button and panel is implicit only.
- **Fix complexity:** S

### M2 — AspectsModal region section labels use `<p>` not semantic headings

- **Surface:** `src/components/AspectsModal.tsx:153, 190`
- **WCAG criterion:** 1.3.1 Info and Relationships
- **Current state:** "Cortical (M1–M6)" and "Subcortical" section labels are `<p>` elements styled as labels. The two-column grid has no semantic structure to identify regions.
- **Expected state:** Use `<h3>` for the column headers, or wrap each column in a `<fieldset>` with a `<legend>`. This enables heading/section navigation for screen reader users.
- **Impact:** Screen reader users navigating by heading will miss the section structure of the ASPECTS tool.
- **Fix complexity:** S

### M3 — ArticleLayout view-mode toggle buttons missing aria semantics

- **Surface:** `src/components/article/ArticleLayout.tsx:50–71`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The Quick/Detailed toggle buttons have no `aria-pressed` or `role="radio"` semantics. The active state is conveyed only by color and font weight — not programmatically.
- **Expected state:** Add `aria-pressed={viewMode === 'quick'}` / `aria-pressed={viewMode === 'detailed'}` to signal current selection. Alternatively, use `role="radio"` with `aria-checked` inside a `role="radiogroup"`.
- **Impact:** Screen reader users cannot determine which view mode is currently active.
- **Fix complexity:** S

### M4 — DisclaimerModal scrollable content region missing visible focus ring

- **Surface:** `src/components/DisclaimerModal.tsx:127–129`
- **WCAG criterion:** 2.4.7 Focus Visible
- **Current state:** The scrollable content div uses `tabIndex={0}` (correct — it must receive focus to be scrollable via keyboard) but also applies `focus:outline-none` without replacement. Keyboard users who tab to the scroll region see no visible focus indicator.
- **Expected state:** Replace `focus:outline-none` with `focus:ring-2 focus:ring-neuro-500 focus:ring-inset` or equivalent.
- **Impact:** Keyboard users cannot see that the scrollable region is focused before pressing arrow keys.
- **Fix complexity:** S

### M5 — BottomLineDrawer ExternalLink icons in expanded content lack aria-label

- **Surface:** `src/components/trials/BottomLineDrawer.tsx:265–273`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** See-also links render as `<a>` with label text + an `<ExternalLink>` icon. The icon itself has no `aria-hidden="true"`. Some link text is short (e.g., a trial name) and the `ExternalLink` icon announces as an extra unnamed element to screen readers.
- **Expected state:** Add `aria-hidden="true"` to all decorative `ExternalLink` icons inside `<a>` tags. Also consider appending `" (opens in new tab)"` to `aria-label` on external links since they use `target="_blank"`.
- **Fix complexity:** S

### M6 — MedicalTooltip trigger size is below 44×44px minimum

- **Surface:** `src/components/MedicalTooltip.tsx:205–216`
- **WCAG criterion:** 2.5.5 Target Size
- **Current state:** The tooltip trigger button renders an `Info` icon at `w-3.5 h-3.5` (14px) with `ml-1` padding and no explicit min-width/min-height. The effective touch target is approximately 22×22px.
- **Expected state:** Add `min-w-[44px] min-h-[44px]` or increase padding so the button's tap target meets the 44×44px minimum.
- **Impact:** Affects motor-impaired users on touch devices. The tooltip is used frequently in TrialPageNew.
- **Fix complexity:** S

### M7 — MobileDrawer stub missing aria-labelledby

- **Surface:** `src/components/layout/MobileDrawer.tsx:13`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The stub has `role="dialog" aria-modal="true"` but no `aria-labelledby` or `aria-label`. If this drawer is ever activated, assistive technologies will announce it as an unnamed dialog.
- **Expected state:** Add `aria-label="Navigation menu"` or a titled heading with `aria-labelledby`.
- **Fix complexity:** S

### M8 — CalendarGrid in LKWTimePicker day-of-week header cells use div, not th

- **Surface:** `src/components/article/stroke/LKWTimePicker.tsx:178–182`
- **WCAG criterion:** 1.3.1 Info and Relationships
- **Current state:** The Mon–Sun day headers are plain `<div>` elements in a CSS grid rather than `<th scope="col">` elements in an HTML `<table>`. There is no caption identifying the grid as a date picker.
- **Expected state:** The calendar grid should use `<table>`, `<caption>`, `<thead>/<th scope="col">`, `<tbody>/<td>`. Alternatively, if CSS grid is retained, use `role="grid"`, `role="columnheader"` on day labels, and `role="gridcell"` on day buttons.
- **Impact:** Screen readers cannot announce the column semantics when reading individual date cells.
- **Fix complexity:** M

### M9 — NihssItemCard radio button options missing keyboard-accessible tabIndex when no value is selected

- **Surface:** `src/components/NihssItemCard.tsx:133–151`
- **WCAG criterion:** 2.1.1 Keyboard
- **Current state:** The rapid-mode options in `NihssItemCard` render `<button role="radio" aria-checked={isActive}>` but there is no roving tabIndex implementation (unlike the L5.6 shell calculators which implement it). When no option is selected, every button defaults to `tabIndex=0` (browser default), meaning Tab visits all 15 items × N options — many keypresses for keyboard users.
- **Expected state:** Apply the same roving-tabindex pattern used in `GlasgowComaScaleCalculator` and `Abcd2ScoreCalculator`: only the selected (or first unselected) option in each group has `tabIndex={0}`; all others have `tabIndex={-1}`. Arrow keys move within the group.
- **Impact:** Keyboard navigation through a full NIHSS is significantly more burdensome than necessary.
- **Fix complexity:** M

---

## Findings — Low priority

### L1 — text-slate-400 on white background at 10px label size is borderline on contrast

- **Surface:** Multiple files — representative: `src/components/calculators/CalculatorHeader.tsx:81`, `src/pages/IchScoreCalculator.tsx:328`, `src/pages/Abcd2ScoreCalculator.tsx:303`
- **WCAG criterion:** 1.4.3 Contrast (Minimum)
- **Current state:** Section labels like "ICH Score", "Age", "GCS Range" use `text-[10px] font-bold text-slate-400` (approximately #94a3b8) on white (#ffffff). The contrast ratio is approximately 2.54:1. At 10px, even bold text does not qualify as "large text" (which requires 18px or 14px bold at normal size). The 4.5:1 threshold applies.
- **Expected state:** Use `text-slate-500` (#64748b, approximately 4.6:1) or `text-slate-600` (#475569, approximately 5.9:1) for these labels. The text-slate-400 color is fine for purely decorative separators but not for label text clinicians read.
- **Impact:** Users with moderate low vision may not be able to read section labels, particularly on mobile.
- **Fix complexity:** S
- **Note:** This is a systemic pattern across nearly all calculator and article pages. A single token change in the design system would fix all instances.

### L2 — MigrainePathway progress step labels hidden below sm: breakpoint have no screen-reader equivalent

- **Surface:** `src/pages/MigrainePathway.tsx:330`
- **WCAG criterion:** 1.3.1 Info and Relationships
- **Current state:** Step labels (e.g., "Safety Screen", "Care Setting") use `hidden sm:block` — they are hidden on mobile. On mobile, screen readers using linear reading will encounter the step indicator dots without any text label.
- **Expected state:** Add an `<span className="sr-only">` inside each step indicator with the step title, so screen readers announce it on all viewport sizes.
- **Fix complexity:** S

### L3 — inline `animate-in slide-in-from-*` animations on pathway pages have no reduced-motion guard

- **Surface:** `src/pages/MigrainePathway.tsx:292, 351, 405`; `src/pages/ElanPathway.tsx` (similar); `src/pages/StatusEpilepticusPathway.tsx`
- **WCAG criterion:** 2.3.3 Animation from Interactions (AAA) — noted here because it is a user-facing risk
- **Current state:** Step transitions use `animate-in slide-in-from-right-4 duration-500` (and similar Tailwind classes). The global `index.css` correctly disables `.drawer-chevron-hint`, `.drawer-discovery-chevron`, and `.drawer-just-available` animations under `prefers-reduced-motion: reduce`, but these inline animation classes are not covered.
- **Expected state:** Tailwind's `motion-reduce:` prefix should be applied: `motion-reduce:animate-none` alongside each `animate-in` class, or a global rule `@media (prefers-reduced-motion: reduce) { [class*="animate-"] { animation: none; } }` added to `index.css`.
- **Impact:** Vestibular disorder users may be affected by sliding transitions.
- **Fix complexity:** S

### L4 — CalculatorHeader "Copy" button has no aria-label beyond button text

- **Surface:** `src/components/calculators/CalculatorHeader.tsx:121–127`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The Copy button has the visible text "Copy" with no `aria-label` and no accessible description of what is being copied. Screen readers will announce "Copy, button."
- **Expected state:** `aria-label="Copy score to clipboard"` would give sufficient context. This is low priority because the word "Copy" is present, but additional context improves the experience in a multi-tool context where "Copy" is ambiguous.
- **Fix complexity:** S

### L5 — DesktopRail logo lockup link lacks accessible label

- **Surface:** `src/components/layout/DesktopRail.tsx:58–68`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The brand lockup `<Link to="/">` contains a styled "N" div and the text "NeuroWiki". Because the text is present, the link has an accessible name. However, the "N" logo div has no `aria-hidden="true"`, so screen readers may announce it redundantly ("N NeuroWiki" link).
- **Expected state:** Add `aria-hidden="true"` to the decorative "N" logo div. Consider adding `aria-label="NeuroWiki home"` to the Link for clarity.
- **Fix complexity:** S

### L6 — CollapsibleSection step indicator renders aria-label on a non-interactive div

- **Surface:** `src/components/CollapsibleSection.tsx:63`
- **WCAG criterion:** 4.1.2 Name, Role, Value
- **Current state:** The step number circle div has `aria-label={`Step ${stepNumber} of ${totalSteps}`}` on a non-interactive, non-landmark `<div>`. `aria-label` on a plain `<div>` has no effect in most browsers because the element has no implicit or explicit ARIA role that can carry an accessible name.
- **Expected state:** Either move the step context into the parent button's accessible name (e.g., via `aria-label` on the `<button>`) or use `aria-describedby` to associate the step text with the button. The `aria-label` on the div should be removed as it currently does nothing.
- **Fix complexity:** S

---

## Strengths (what is working)

- **`<html lang="en">`** is set correctly in `index.html`.
- **Skip link** is implemented in `Layout.tsx` with `#main` target and correct sr-only → focus-visible pattern.
- **`<main id="main">`** landmark is present; desktop rail uses `<aside>` with an `aria-label`; mobile nav uses `<nav role="navigation" aria-label="Main">`.
- **CalculatorHeader** correctly implements `aria-live="polite" aria-atomic="true"` on the score region and accepts a `scoreAriaLabel` prop. All ten L5.6 calculators produce meaningful score announcements.
- **CalculatorToast** uses `role="status" aria-live="polite"` — toast messages are announced.
- **CalculatorDrawer** uses `aria-expanded`, `aria-controls`, `aria-label` on the toggle button. States A and B are correctly `aria-hidden="true"`.
- **Roving tabindex keyboard navigation** is implemented in GCS, ABCD2, ICH Score, and NIHSS calculators with arrow-key support inside radiogroups.
- **AspectsModal** has `role="dialog" aria-modal="true" aria-labelledby="aspects-modal-title"`, Escape key close, body-scroll lock, and `aria-live` on the live score display.
- **GlobalTrialModal** has a complete focus trap implementation: saves previous focus, moves focus on open, cycles Tab/Shift+Tab, restores focus on close.
- **CollapsibleSection** toggle button correctly uses `aria-expanded` and `focus-visible:ring-2`.
- **MedicalTooltip** has `aria-label`, `aria-expanded`, Escape-key close, and click-outside dismissal.
- **DesktopRail and MobileBottomNav** nav links use `aria-current="page"` for the active item.
- **DisclaimerModal** has `role="dialog" aria-modal="true" aria-labelledby` and a focus-on-open pattern via ref.
- **Reduced-motion guards** exist in `index.css` for all three drawer animation classes (chevron-bounce, drawer-pulse, discovery-chevron).
- **Touch targets** on calculator header action buttons meet 44×44px via `min-h-[44px] min-w-[44px]`.
- **iOS zoom prevention** for inputs is handled via `@media (max-width: 768px) { input, select, textarea { font-size: 16px !important; } }`.

---

## Recommended next steps

**Batch 1 — Safety-critical (fix together, one PR):**
- H1: Add `role="dialog" aria-modal="true" aria-labelledby` + focus trap to `ThrombectomyPathwayModal`
- H7: Add `aria-modal="true"` + focus trap to `FeedbackModal`
- H2: Add `focus-visible:ring-2` to all chip buttons in `ThrombolysisEligibilityModal`

**Batch 2 — Pathway ARIA gap (one PR per pathway or combined):**
- H3: Add `role="status" aria-live="polite"` result region to MigrainePathway, GCAPathway, StatusEpilepticusPathway, ElanPathway
- H4: Add `aria-label` to all favorite star buttons in pathway pages
- H5: Fix Code/Study and Vitals/Imaging/Summary tab semantics in StrokeBasicsWorkflowV2

**Batch 3 — Component-level fixes (can be bundled):**
- M1: Add `id` + `aria-controls` to CollapsibleSection
- M3: Add `aria-pressed` to ArticleLayout view-mode toggle
- M4: Fix focus ring on DisclaimerModal scroll region
- M5: Add `aria-hidden` to decorative icons in BottomLineDrawer links
- M9: Implement roving tabindex in NihssItemCard radiogroup
- L1: Systematically replace `text-slate-400` on label text with `text-slate-500`/`text-slate-600`
- L3: Add `motion-reduce:animate-none` to pathway step transition animations
- L5: Add `aria-hidden` to decorative logo div in DesktopRail

**Batch 4 — Complex rebuild (separate task, requires design input):**
- H6: LKWTimePicker scroll drum keyboard accessibility (spinbutton or listbox pattern)
- M8: LKWTimePicker CalendarGrid semantic table structure
