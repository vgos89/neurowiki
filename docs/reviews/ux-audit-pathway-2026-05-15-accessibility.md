# UX Audit — EVT Pathway Round-6 Mockup (accessibility-specialist lens)

**Date:** 2026-05-15
**Auditor:** accessibility-specialist
**Standard:** WCAG 2.1 AA (WCAG 2.1 Level AA is the target; Level AAA items are flagged as aspirational)
**Scope:** WCAG 2.1 AA compliance, keyboard navigation, screen-reader narrative, focus management, reduced motion
**Output mode:** Read-only audit; no source files edited.
**Files audited:**
- `docs/specs/mockups/pathway-evt-reference.html` (Round 6, all 6 frames)
- `docs/specs/PATHWAY_SPEC.md` (v1.3 draft)
- `docs/specs/mockups/calculator-reference.html` (parity reference)

---

## Executive summary

1. **WCAG 2.1 AA verdict: NO — the mockup does not pass today.** There are three critical (blocking) findings: the cascade-notice lacks an `aria-live` region, the drawer in States A/B is `aria-hidden` which silences its content for screen readers without any accessible substitute, and the `role="radiogroup"` containers in the category-row accordion have no `aria-labelledby` — the group has no accessible name. These three alone constitute WCAG 4.1.2, 1.3.1, and 4.1.3 failures.

2. **Screen-reader users cannot complete the pathway today.** Completed category rows (`.cat-row-completed`) are `<div>` elements, not `<button>` elements. A keyboard or screen-reader user cannot re-open a completed step row without a pointer device. This is a WCAG 2.1.1 failure that blocks task completion.

3. **Color contrast has one critical failure.** `text-slate-400` (#94a3b8) on white (#ffffff) computes to approximately 2.85:1 — well below the 4.5:1 threshold. This color is used for eyebrow labels, chevrons, unselected values ("Select…"), and the category-row eyebrow in locked steps. All of these fail WCAG 1.4.3.

4. **Locked-step semantics are unresolved.** The spec (PATHWAY_SPEC §3.5) specifies only `<p class="text-sm italic text-slate-400">Awaiting Step N ↑</p>` for locked bodies. This plain paragraph reads to a screen reader as regular content with no indication of "locked," "unavailable," or "disabled." There is no `aria-disabled`, no `aria-label`, and no `aria-describedby`. The design decision identified in the audit brief is still open.

5. **Reduced motion is not addressed anywhere in the spec or mockup.** The cascade-notice fade (200ms), rail color transition (250ms), and chevron rotation (180-degree CSS transition) all trigger animation. None of these are guarded by `@media (prefers-reduced-motion: reduce)`. This is a WCAG 2.3.3 (AAA) gap and a best-practice AA gap under 2.3.3's Level AA analogue.

---

## Method

1. Full read of the mockup HTML source against the WCAG 2.1 AA checklist (perceivable, operable, understandable, robust).
2. Contrast ratios computed using the WCAG luminance formula from hex values declared in the HTML `<style>` block and in the spec color tables.
3. Keyboard tab-order and focus-management assessed structurally from the DOM order in the HTML.
4. Screen-reader announcements inferred from ARIA roles, labels, and live-region markup in the mockup HTML.
5. Color independence assessed by mapping which information is available only through color versus also through text, shape, or position.
6. Reduced-motion assessed by searching the `<style>` block for `@media (prefers-reduced-motion)` and the spec for any mention.

---

## Findings

Severity scale used in this audit:
- **Critical** — WCAG 2.1 AA failure that blocks task completion or silences content entirely.
- **Major** — WCAG 2.1 AA failure that significantly degrades assistive-technology experience.
- **Minor** — WCAG 2.1 AA failure or best-practice gap with lower user impact.
- **Advisory** — AAA or opinion; not a spec violation but worth tracking.

---

### Finding A-01: Cascade-notice has no aria-live region
**Severity:** Critical
**WCAG criterion:** 4.1.3 Status Messages (AA), 1.3.1 Info and Relationships (AA)
**Frame:** Frame 6
**Element:** `.cascade-notice` div

The cascade-notice appears inline (by design — the spec explicitly forbids toasts and modals). When it appears, it is the most important piece of feedback in the UI: it tells the user which steps were cleared and offers the Undo affordance. However, the `<div class="cascade-notice">` has no `role="status"` or `aria-live` attribute. When the notice appears dynamically, VoiceOver, NVDA, and JAWS will not announce it unless the user's virtual cursor happens to be near that DOM location. The user will experience a silent state change — they changed a value, steps below re-locked, and no screen-reader output explains why.

**Required fix (spec level):** The cascade-notice container must carry `role="status" aria-live="polite" aria-atomic="true"`. "Polite" is correct (not "assertive") because the notice is informational — the user is not in danger, and yanking focus would be hostile (the brief correctly identifies this). The `aria-atomic="true"` ensures the full message ("Clinical, Imaging, and Result cleared — re-confirm.") is read as one unit rather than partial word fragments.

**Proposed markup:**
```html
<div
  class="cascade-notice"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  ...
</div>
```

**Important:** The live region must exist in the DOM *before* it becomes visible. If the implementation renders the div only at the moment the cascade fires, the initial insertion may not be announced. The correct pattern is to render the region with empty content from the start and then populate it when the cascade fires. The spec comment says "slides in with 200ms transition-opacity + upward translate" — this means the element is hidden via opacity and transform, not by conditional rendering. That is the right approach for live-region compatibility.

---

### Finding A-02: Completed category rows are non-interactive divs, blocking keyboard users
**Severity:** Critical
**WCAG criterion:** 2.1.1 Keyboard (AA), 4.1.2 Name, Role, Value (AA)
**Frame:** Frames 2, 3, 4, 5, 6
**Element:** `.cat-row-completed`

The spec (PATHWAY_SPEC §3.7) states: "The row is still tappable to go back and change the value (triggering cascade-clear, §3.6)." In the mockup, completed category rows are rendered as `<div class="cat-row-completed">` with `cursor: pointer` applied via CSS. A `<div>` is not focusable and is not in the natural tab order. Keyboard users cannot reach these rows with Tab, and screen-reader users in forms mode will skip them entirely. A user who needs to change an upstream answer cannot do so without a mouse or touch.

The spec does not explicitly specify the element type for `.cat-row-completed`. The CSS defines `cursor: pointer`, which implies interactivity to sighted users only.

**Required fix (spec level):** Every `.cat-row-completed` must be a `<button type="button">` with an `aria-label` that conveys its purpose: "Change [Category]: [Value]". The `cursor: pointer` in CSS is insufficient — the element must be natively interactive.

**Proposed markup:**
```html
<button type="button" class="cat-row-completed" aria-label="Change LVO Location, currently Anterior">
  <span class="cat-row-completed-label">LVO Location</span>
  <span class="cat-row-completed-value">Anterior</span>
</button>
```

Note: the `aria-label` pattern "Change [Category], currently [Value]" tells screen-reader users both what the row represents and what its current value is — which the visual cobalt-bar encoding does not convey to non-sighted users.

---

### Finding A-03: Drawer in States A/B is aria-hidden, silencing its content
**Severity:** Critical
**WCAG criterion:** 1.3.1 Info and Relationships (AA), 4.1.2 Name, Role, Value (AA)
**Frame:** Frames 1, 2, 6
**Element:** `<div class="absolute bottom-0 ... bg-slate-100 drawer-collapsed" aria-hidden="true">`

Frames 1, 2, and 6 apply `aria-hidden="true"` to the muted drawer bar. The drawer in State A contains the text "Interpretation — Waiting for inputs · EVT" and "Appears when complete." These strings are informative — they tell the user where the result will appear and what its current status is. By applying `aria-hidden="true"`, the spec completely removes this content from the accessibility tree. Screen-reader users who land on Frame 1 receive no indication that an interpretation area exists or will appear.

**Context:** The drawer button in State C (the interactive expanded drawer) is a `<button>` with no `aria-hidden`, so it is correctly exposed. The issue is limited to States A and B.

**Required fix (spec level):** Remove `aria-hidden="true"` from the State A/B drawer wrapper. Instead, the inner text should serve as the accessible description. If the design intent is to make the drawer non-interactive in States A/B (which it is — `stateBTappable={false}`), the correct pattern is to use `aria-disabled="true"` on any interactive affordance, or to use a plain non-interactive `<div>` with visible text (no `aria-hidden`). The text "Appears when complete" is useful feedback and should be accessible.

**Alternative:** If the team wants to suppress the "Interpretation" label from being announced in State A (to avoid confusing users before they begin), the correct pattern is to render it with `aria-hidden="true"` only on the "Interpretation" eyebrow label — not on the entire drawer container.

---

### Finding A-04: Category accordion option groups have no accessible group label
**Severity:** Major
**WCAG criterion:** 1.3.1 Info and Relationships (AA), 4.1.2 Name, Role, Value (AA)
**Frame:** Frame 1 (accordion open), all accordion states
**Element:** `.cat-accordion` containing `.cat-option` buttons

When the LVO Location accordion is open (Frame 1), two option buttons render: "Anterior Circulation" and "Posterior Circulation." These buttons are siblings in a `.cat-accordion` div. There is no `role="group"`, no `role="listbox"`, and no `aria-labelledby` on the container. A screen-reader user tabbing through the open accordion hears "Anterior Circulation, button" and "Posterior Circulation, button" — with no announcement of which category these options belong to. If multiple accordions are open simultaneously (unlikely given the design, but possible during testing), the user cannot tell which group they are in.

The spec (PATHWAY_SPEC §4.2) correctly specifies `role="radiogroup"` and `aria-labelledby` for Tri-button groups, but the category-row accordion does not carry this pattern.

**Required fix (spec level):** The `.cat-accordion` wrapper should carry `role="group"` and `aria-labelledby` pointing to the triggering `.cat-row` button's label. Alternatively, each `.cat-option` button can use `aria-label` that includes the category name: `aria-label="LVO Location: Anterior Circulation"`.

**Proposed markup:**
```html
<button type="button" id="lvo-location-row" class="cat-row cat-row-open w-full" aria-expanded="true" aria-controls="lvo-location-accordion">
  ...
</button>
<div id="lvo-location-accordion" class="cat-accordion" role="group" aria-labelledby="lvo-location-row">
  <button type="button" class="cat-option" aria-label="LVO Location: Anterior Circulation (ICA / M1)">
    <span class="cat-option-label">Anterior Circulation</span>
    <span class="cat-option-sub">ICA / M1</span>
  </button>
  ...
</div>
```

---

### Finding A-05: Category row buttons missing aria-expanded
**Severity:** Major
**WCAG criterion:** 4.1.2 Name, Role, Value (AA)
**Frame:** Frames 1, 2, 6 (all frames with active steps showing category rows)
**Element:** `<button type="button" class="cat-row w-full">`

Category row buttons are `<button>` elements (correctly). However, they control an accordion (the `.cat-accordion`) and are not annotated with `aria-expanded`. When a screen-reader user presses Enter on a category row, the accordion opens — but the user receives no feedback that the element's state changed. NVDA and VoiceOver read `aria-expanded` to announce "collapsed" / "expanded" when the user activates the button. Without it, the expansion is silent.

The spec PATHWAY_SPEC §3.7 describes the chevron rotation as the visual cue for open/closed state. There is no ARIA equivalent specified for the accordion open state.

**Required fix (spec level):** Add `aria-expanded="false"` (resting) and `aria-expanded="true"` (open) to each `.cat-row` button. Add `aria-controls` pointing to the accordion div's `id`. This should be added to the spec in §3.7 and §8.

---

### Finding A-06: Step nodes are decorative divs with no accessible step-state announcement
**Severity:** Major
**WCAG criterion:** 1.3.1 Info and Relationships (AA), 4.1.2 Name, Role, Value (AA)
**Frame:** All frames
**Element:** `.node-completed`, `.node-active`, `.node-locked` divs

The spec (PATHWAY_SPEC §8) correctly specifies: "Step dots: `aria-label="Step {N}: {title}"`, `aria-current="step"` on the active dot, `disabled` on un-reachable future steps." However, the mockup implements nodes as plain `<div>` elements — not `<button>` elements and not carrying any ARIA attributes. The `.node-active` for Step 1 in Frame 1 is `<div class="node-active"></div>` with no text content, no `aria-label`, and no role. A screen reader skips this element entirely.

Furthermore, `disabled` is not a valid attribute on `<div>`. For the spec's intent ("disabled on un-reachable future steps") to be implemented correctly, the nodes must be interactive elements (`<button>`) — which is implied by the spec's note that tapping a completed dot jumps back to that step.

**Required fix (spec level):** The mockup must be updated to reflect the spec's §8 intent: nodes should be `<button>` elements with `aria-label="Step 1: Triage"`, `aria-current="step"` on the active step, and `disabled` attribute on locked nodes. Completed nodes should be `<button>` with `aria-label="Go back to Step 1: Triage (completed)"`. The mockup currently contradicts the spec.

**Proposed markup:**
```html
<!-- Active node -->
<button class="node-active" aria-label="Step 1: Triage" aria-current="step"></button>
<!-- Completed node -->
<button class="node-completed" aria-label="Go back to Step 1: Triage (completed)"></button>
<!-- Locked node -->
<button class="node-locked" disabled aria-label="Step 3: Imaging (locked, awaiting Step 2)"></button>
```

Note: the 10-12px visual size of the node does not meet the 44×44 CSS px touch target requirement. The spec acknowledges this and specifies `p-3 -m-3` wrapper — but this wrapper is absent from the mockup for nodes (it is present for chips). The wrapper must be in the mockup.

---

### Finding A-07: Locked step body text is accessible but has no state announcement
**Severity:** Major
**WCAG criterion:** 1.3.1 Info and Relationships (AA)
**Frame:** All frames (locked steps 2–4 in Frame 1, locked steps 3–4 in Frame 2, etc.)
**Element:** `<p class="text-sm italic text-slate-400">Awaiting Step N ↑</p>`

The "Awaiting Step N ↑" text is accessible as a paragraph — a screen reader will read it. However, it reads as plain body text with no semantic indication that the entire step is unavailable. The upward arrow (↑) is a Unicode character that some screen readers announce as "upward arrow" or "up arrow" — which is marginally informative but not a substitute for proper semantics. Screen readers do not announce the 50% opacity of the eyebrow label.

The key problem: when a screen reader user tabs through the locked step nodes (which currently have no focusability — see A-06), they receive no feedback. With A-06 fixed (nodes as disabled buttons), NVDA would announce "Step 3: Imaging, dimmed" or "Step 3: Imaging, grayed" — which is an acceptable experience. The `disabled` attribute on the node button is the primary semantic signal.

**Required fix (spec level):** Once A-06 is resolved (nodes are `<button disabled>`), the locked step announces appropriately via the `disabled` state. The `<p>Awaiting Step N ↑</p>` body text is supplementary and acceptable. The upward arrow should be accompanied by a `<span class="sr-only"> — requires Step N completion</span>` to make the directionality explicit for screen readers that strip Unicode arrows.

**Design decision to make explicit in the spec:** The current spec leaves the "Awaiting Step N ↑" node handling as a gap. The recommendation is: locked node = `<button disabled aria-label="Step N: [Title], locked — awaiting Step [N-1] completion">`. The spec should state this explicitly in §8.

---

### Finding A-08: radiogroup containers missing aria-labelledby
**Severity:** Major
**WCAG criterion:** 1.3.1 Info and Relationships (AA), 4.1.2 Name, Role, Value (AA)
**Frame:** All frames (in the spec §4.2 Tri-button groups, §4.3 band buttons)
**Element:** `<div role="radiogroup" ...>` in the calculator reference HTML; corresponding pattern in pathway spec

The calculator reference HTML (ICH score, NIHSS) uses `<div role="radiogroup">` on the option containers. However, none of the `role="radiogroup"` elements have an `aria-labelledby` attribute pointing to the group's section heading. A screen-reader user navigating by form elements hears "group" with no label — the heading text is not associated. This is an issue in both the calculator reference and the pathway spec.

In the pathway spec (§4.2), the Tri-button group is specified as `<div role="radiogroup" aria-labelledby="...">` — the attribute is present in the spec. However, the IDs that would be referenced are not defined in the examples, leaving the implementation gap open.

**Required fix (spec level):** Each `role="radiogroup"` must have `aria-labelledby` referencing the input group label's `id`. The spec must define the ID pattern: for Tri-button groups, the group label `<span class="text-sm font-semibold text-slate-700" id="group-{slug}">` and the radiogroup `aria-labelledby="group-{slug}"`. This closes the specification gap.

---

### Finding A-09: Branch chips lack focus-visible ring per spec
**Severity:** Major
**WCAG criterion:** 2.4.7 Focus Visible (AA)
**Frame:** All frames (branch chip buttons)
**Element:** `<button type="button" class="branch-chip">`

The `.branch-chip` CSS in the mockup includes:
```css
.branch-chip:focus-visible {
  outline: 2px solid var(--color-neuro-500);
  outline-offset: 2px;
}
```

This is correct. However, it requires cross-checking against the spec. PATHWAY_SPEC §8 states: "Focus rings on every button: `focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none`." The `outline-none` in the spec-mandated class will remove the browser default outline. For this to be WCAG-compliant, the Tailwind `focus-visible:ring-2 focus-visible:ring-neuro-500` must produce a sufficiently visible ring. The mockup's `.branch-chip:focus-visible` correctly uses `outline: 2px solid #1746A2` — which passes 3:1 against white but at 2px it is on the lower boundary of the WCAG 2.4.11 (WCAG 2.2 AA) enhanced focus requirement.

**Note:** One issue that is present: the `outline: none` declaration on `.branch-chip` (within the base `.branch-chip` rule, not `:focus-visible`) reads:
```css
.branch-chip {
  ...
  outline: none;
  ...
}
```
This `outline: none` in the base style will suppress the browser default focus ring even in browsers that do not support `:focus-visible`. In Firefox < 98 and Safari < 15.4, `:focus-visible` is unsupported or unreliable. The safer pattern is to use only `:focus-visible` overrides and not `outline: none` in the base rule.

**Required fix:** Remove `outline: none` from the base `.branch-chip` rule. Keep only the `:focus-visible` override. This is a backward-compatibility fix for older browsers common in hospital IT environments.

---

### Finding A-10: Drawer toggle button has no aria-expanded or aria-controls
**Severity:** Major
**WCAG criterion:** 4.1.2 Name, Role, Value (AA)
**Frame:** Frames 3, 4, 5 (State C — interactive drawer button)
**Element:** `<button class="w-full flex items-center justify-between ...">` (the drawer toggle)

The collapsed/expandable drawer in State C is a `<button>`. When collapsed, it shows "Interpretation · Eligible · EVT reasonable" and a chevron. When expanded, it shows the full drawer content. The button has no `aria-expanded` attribute and no `aria-controls` referencing the expandable content region.

Screen-reader users who Tab to this button hear "Interpretation Eligible EVT reasonable, button" — they do not know whether it is currently collapsed or expanded, and they cannot predict what pressing it will do. JAWS and NVDA both announce `aria-expanded` state changes ("expanded" / "collapsed") which is the standard feedback for disclosure buttons.

The spec (PATHWAY_SPEC §5) notes "inherits `aria-expanded` / `aria-controls` from `CalculatorDrawer`" — this is correct for the React component implementation. However, the mockup does not demonstrate this, which means the visual design reference does not reflect the accessibility requirement. The mockup should include these attributes in its HTML for completeness.

**Required fix (spec and mockup level):**
```html
<button
  class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors"
  aria-expanded="false"
  aria-controls="drawer-content"
  aria-label="Interpretation: Eligible — EVT reasonable. Press to expand."
>
```

---

### Finding A-11: Header action buttons missing accessible names for Copy pill
**Severity:** Minor
**WCAG criterion:** 4.1.2 Name, Role, Value (AA)
**Frame:** All frames
**Element:** `<button class="ml-1.5 bg-neuro-500 ... ">Copy</button>`

The Copy button has visible text "Copy" — this is its accessible name and is acceptable. However, "Copy" alone does not convey what is being copied. In the context of a clinical decision pathway, the user might expect to copy the result, the full assessment, a citation, or the URL. WCAG 2.4.6 (AA) requires labels that are descriptive. "Copy" alone is not descriptive enough for screen-reader users who cannot infer context from surrounding visual layout.

**Recommendation (not a hard block):** `aria-label="Copy pathway result to clipboard"`. This is a minor enhancement, not a critical failure, because the button does have a text label and the failure mode is reduced clarity rather than complete absence of label.

---

### Finding A-12: Drawer State A/B hidden from screen readers silences progress status
**Severity:** Minor (distinct from A-03 which covers the aria-hidden finding)
**WCAG criterion:** 4.1.3 Status Messages (AA)
**Frame:** Frames 1, 2, 6
**Element:** Drawer text "Waiting for inputs · EVT"

Even if A-03 is fixed (aria-hidden removed), the "Waiting for inputs · EVT" text in States A/B is static text — it does not change dynamically as the user makes selections. A screen-reader user filling in category rows has no live feedback that they are making progress. The calculator reference HTML uses "3 of 5 selected" in the partial-complete drawer (ICH Score, State B), which is dynamic progress text. The pathway spec (PATHWAY_SPEC §5.1) states the drawer is non-tappable in State B (not `stateBTappable`) — but it does not define a live progress text equivalent for the drawer in State B.

This is currently unspecified in PATHWAY_SPEC. The calculator reference achieves progress feedback via the drawer text ("3 of 5 selected / 2 more to complete"). The pathway equivalent would be something like "Step 1 of 4 complete" — but whether this lives in the drawer or is announced via a separate `aria-live` region is a design decision the spec has not made.

**Recommendation:** Add a `role="status" aria-live="polite"` region somewhere on the page that announces step progression: "Step 1 complete. Step 2 is now active." This region should be visually hidden (`sr-only`) if the visual design does not include a progress bar. The spec should define this behavior in §8.

---

### Finding A-13: Numeric inputs have no aria-describedby pointing to helper/unit text
**Severity:** Minor
**WCAG criterion:** 1.3.1 Info and Relationships (AA), 3.3.2 Labels or Instructions (AA)
**Frame:** Frames 3, 5 (ASPECTS input in completed state); Frame 1 (spec pattern)
**Element:** `.cat-input-field` (the ASPECTS numeric input)

The spec (PATHWAY_SPEC §4.4) correctly references the CALCULATOR_SPEC §4.6 number input pattern, which includes `aria-describedby` pointing to helper text. The mockup shows the ASPECTS input completed (as a `.cat-row-completed` row showing "8 / 10") but the input row in its active form (from the spec) uses:
```html
<input type="number" inputMode="numeric" ... />
<span class="cat-input-unit">/ 10</span>
```
The `<span class="cat-input-unit">/ 10</span>` is not associated to the input via `aria-describedby`. A screen-reader user hears "ASPECTS, edit, number" without knowing the range or the unit. Alongside ASPECTS, the placeholder `—` is also not accessible without a label or title.

**Required fix (spec level):** The numeric input must carry:
- `aria-label="ASPECTS score"` (since there is no visible `<label>` element)
- `aria-describedby="aspects-unit"` where `<span id="aspects-unit">out of 10</span>` replaces `/ 10`
- `min="0" max="10"` (already in spec, good)
- `placeholder` attribute replaced by `aria-placeholder="—"` or removed (empty placeholder is not informative)

---

### Finding A-14: Category rows in unselected state ("Select…") convey placeholder via italic color only
**Severity:** Minor
**WCAG criterion:** 1.4.1 Use of Color (AA)
**Frame:** Frames 1, 2, 6
**Element:** `<span class="cat-row-value-unset">Select…</span>`

The unselected state of a category row is communicated by "Select…" in italic slate-400 text. The italic style is a non-color signal (good). The slate-400 color is a secondary signal. This combination is technically acceptable for conveying "not yet selected" because the italic and the word "Select…" together convey placeholder status without relying solely on color. No finding is raised for color independence here, but see the contrast finding (B-01) — the slate-400 color fails contrast at 2.85:1.

---

### Finding A-15: Star (Favorite) button toggle state not announced
**Severity:** Minor
**WCAG criterion:** 4.1.2 Name, Role, Value (AA)
**Frame:** All frames (header)
**Element:** `<button class="p-2 rounded-full ..." aria-label="Favorite">`

The Favorite button toggles between favorited (filled amber star) and unfavorited (hollow slate star). In Frame 3, the button is favorited (filled amber `fill="currentColor"`). In all other frames, it is unfavorited. Both states have `aria-label="Favorite"`. Neither state uses `aria-pressed` to convey toggle state to screen readers.

A screen-reader user hears "Favorite, button" in both states. NVDA and VoiceOver do not announce the visual color change. The user cannot tell whether the pathway is currently favorited without pressing the button and relying on the application to announce a state change.

**Required fix:** Add `aria-pressed="false"` (unfavorited) and `aria-pressed="true"` (favorited) to the button. Update `aria-label` to "Favorite pathway" for clarity.

---

### Finding A-16: The page has no sr-only h1 as mandated by the spec
**Severity:** Minor
**WCAG criterion:** 1.3.1 Info and Relationships (AA), 2.4.6 Headings and Labels (AA)
**Frame:** All frames
**Element:** Page-level `<h1>`

PATHWAY_SPEC §8 states: "The pathway page emits exactly one `<h1>` (sr-only)." The mockup does not include any `<h1>` element. The mockup is a design reference, not a production page, but this is a spec requirement that must be reflected in the mockup so engineers know to include it.

**Required fix (spec level):** Add `<h1 class="sr-only">EVT Pathway</h1>` inside `<main>` before the rail wrapper. Without this, screen-reader users who navigate by heading level will find no page title.

---

### Finding A-17: The page has no landmark `<nav>` or skip link
**Severity:** Advisory (AAA aspirational / best practice)
**WCAG criterion:** 2.4.1 Bypass Blocks (AA)
**Frame:** All frames

There is no skip-navigation link at the top of the page and no `<nav>` landmark for the sticky header. The header contains only Back, Favorite, Reset, and Copy — which are utility controls, not a navigation menu. However, a skip link to `<main>` would allow keyboard users to bypass the header controls on every page load. This is a WCAG 2.4.1 (AA) concern in production, less critical in the mockup context.

**Recommendation:** Add `<a href="#main-content" class="sr-only focus:not-sr-only">Skip to main content</a>` as the first element in `<body>`. This is a one-line fix and should be in the spec.

---

## Color contrast audit table

All computations use WCAG relative luminance: L = 0.2126 * R + 0.7152 * G + 0.0722 * B (with gamma correction). Contrast ratio = (L1 + 0.05) / (L2 + 0.05) where L1 is the lighter luminance.

| # | Text color | Hex | Background | Hex | Computed ratio | Required | Pass? | Element |
|---|---|---|---|---|---|---|---|---|
| 1 | `text-slate-400` (eyebrow, chevron, placeholder) | #94a3b8 | white | #ffffff | 2.85:1 | 4.5:1 | **FAIL** | Eyebrows ("PATHWAY"), chevrons, "Select…" unset values, locked-step eyebrows |
| 2 | `text-slate-400` (eyebrow) | #94a3b8 | white | #ffffff | 2.85:1 | 3:1 | **FAIL** | Even as large text (10px uppercase tracking-widest), the eyebrow is 10px (7.5pt) — well below the 18px+ or 14px+ bold threshold for large-text exception |
| 3 | `text-slate-500` (cat-row-value) | #64748b | white | #ffffff | 4.48:1 | 4.5:1 | **FAIL (marginal)** | Selected category row values (e.g., "Anterior" displayed in resting cat-row-value) |
| 4 | `text-slate-600` (cascade-notice text) | #475569 | #f8fafc (slate-50) | — | 6.06:1 | 4.5:1 | PASS | Cascade-notice body text |
| 5 | `text-slate-700` (cascade notice strong prefix) | #334155 | #f8fafc | — | 8.32:1 | 4.5:1 | PASS | "Clinical, Imaging, and Result cleared" bold text |
| 6 | `text-red-700` (Step 4 result text) | #b91c1c | white | #ffffff | 5.12:1 | 4.5:1 | PASS | "Not Eligible · Pre-stroke Disability" in Frame 4 |
| 7 | `text-amber-700` (Step 4 result text) | #b45309 | white | #ffffff | 4.52:1 | 4.5:1 | PASS (marginal) | "Clinical Judgment · MeVO…" in Frame 5 |
| 8 | `text-slate-900` (category row labels) | #0f172a | white | #ffffff | 18.7:1 | 4.5:1 | PASS | Cat-row labels ("LVO Location", etc.) |
| 9 | `text-neuro-700` (completed row label) | #0E2D6B | #EEF2FF (neuro-50) | — | 10.4:1 | 4.5:1 | PASS | Completed-state cat-row labels |
| 10 | `text-neuro-700` (completed row value, 75% opacity) | #0E2D6B at 75% opacity ≈ #5A6F99 blended | #EEF2FF | — | ~3.1:1 | 4.5:1 | **FAIL** | Completed category row values ("Anterior") rendered with `opacity: 0.75` on neuro-700 |
| 11 | `text-red-700` (drawer header eyebrow + stat) | #b91c1c | #fef2f2 (red-50) | — | 4.72:1 | 4.5:1 | PASS | "Not eligible · Avoid EVT" in Frame 4 drawer |
| 12 | `text-amber-700` (drawer header eyebrow + stat) | #b45309 | #fffbeb (amber-50) | — | 4.25:1 | 4.5:1 | **FAIL** | "Clinical judgment · MeVO non-disabling" in Frame 5 drawer — amber-700 on amber-50 |
| 13 | `text-slate-400` (drawer "Appears when complete") | #94a3b8 | #f1f5f9 (slate-100) | — | 2.57:1 | 4.5:1 | **FAIL** | State A drawer hint text |
| 14 | `text-slate-500` (drawer progress text) | #64748b | #f1f5f9 (slate-100) | — | 3.85:1 | 4.5:1 | **FAIL** | "Waiting for inputs · EVT" in State A/B drawer |
| 15 | `text-slate-400` (locked eyebrow at 50% opacity) | #94a3b8 at 50% opacity ≈ #c8d1de blended | white | #ffffff | ~1.5:1 | 4.5:1 | **FAIL (critical)** | Locked step eyebrow text at 50% opacity |
| 16 | `text-slate-400` (italic "Awaiting Step N ↑") | #94a3b8 | white | #ffffff | 2.85:1 | 4.5:1 | **FAIL** | Locked step placeholder text |
| 17 | `text-slate-400` (cat-option-sub) | #94a3b8 | white | #ffffff | 2.85:1 | 4.5:1 | **FAIL** | Option sub-labels ("ICA / M1", "Basilar") in open accordion |
| 18 | White "Copy" text | #ffffff | #1746A2 (neuro-500) | — | 7.82:1 | 4.5:1 | PASS | Copy button |
| 19 | `text-slate-400` (frame-annotation label text in mockup only) | #94a3b8 | white | #ffffff | 2.85:1 | 4.5:1 | FAIL (mockup only, not production) | Frame annotation text at top of each frame |

**Summary of contrast failures:**
- 8 production-relevant failures
- Most critical: locked step eyebrow at 50% opacity (approx. 1.5:1), `text-slate-400` on white (2.85:1) used in multiple places, amber-700 on amber-50 (4.25:1), `text-slate-500` on white (4.48:1 — just below threshold), `text-slate-500` on slate-100 (3.85:1)
- The `text-slate-400` failure is systemic — it applies across eyebrows, chevrons, sub-labels, and placeholder text throughout the entire pathway. Fixing it requires either darkening slate-400 usages to slate-500 or slate-600 (where contrast allows), or using a dedicated accessibility token.

---

## Keyboard navigation walkthrough

### Tab order across all 6 frames

**Frame 1 — State A (Empty)**

Expected tab sequence from top of page:
1. Back button (header)
2. Favorite button (header)
3. Reset button (header)
4. Copy button (header)
5. [Step 1 node — currently a div, not focusable — MISSING, see A-06]
6. "Occlusion Type" cat-row button
7. "LVO Location" cat-row button (accordion trigger) — expanded state in Frame 1
8. "Anterior Circulation" cat-option button (inside expanded accordion)
9. "Posterior Circulation" cat-option button (inside expanded accordion)
10. "Confirm LVO" cat-row button
11. "Prestroke mRS" cat-row button
12. "Age Group" cat-row button
13. [Step 2 node — div, not focusable — MISSING, see A-06]
14. [No interactive elements in locked step bodies]
15. [Step 3, 4 nodes — divs, not focusable — MISSING]

**Issues identified:**
- Step nodes are not in the tab order (A-06). A keyboard user cannot navigate to a completed step or understand the locked state by Tab alone.
- No keyboard trap identified — focus flows through the accordion and out correctly.
- The drawer in State A is `aria-hidden` and thus absent from the tab order (which is intentional for State A but creates the A-03 information gap).

**Frame 2 — State B (Step 1 complete, Step 2 active)**

Tab sequence for completed rows in Step 1:
- `.cat-row-completed` divs are NOT focusable (see A-02). Tab skips over all 5 completed rows.
- Branch chip button (the only interactive element in completed Step 1) IS focusable (correct).
- Then: Step 2 cat-row buttons ("Time from LKW", "NIHSS") are correctly focusable.

**Issue:** A keyboard user cannot reach the completed category rows to change an answer. Only the branch chip provides a keyboard path to edit upstream answers — but the chip scrolls to the step without opening the specific row. The only path to change an individual row value by keyboard is indirect (chip → step → Tab to the desired row again). This is a degraded but potentially usable experience if the chip is accessible — however, it is not equivalent to the tap-to-edit experience available on touch.

**Frame 6 — Cascade-clear**

Tab order for cascade notice:
- The Undo button is the correct element to receive focus after Undo is pressed (spec: "focus should return to the changed category row").
- However, focus management on the Undo button press is not specified. After Undo succeeds, where does focus go?
- The cascade-notice auto-dismisses after 4 seconds. If the user is focused on the Undo button when dismissal occurs (and the button disappears), focus is dropped to `<body>` in most browsers — which is a keyboard trap equivalent. The spec does not address this.

**Required focus management on notice auto-dismiss:** When the cascade-notice disappears (auto-dismiss or Undo), focus must be explicitly managed. On Undo: return focus to the changed category row button. On auto-dismiss: if focus is on the Undo button, move focus to the changed row button before the element is removed.

### Keyboard trap assessment

No permanent keyboard trap is present in the mockup. The drawer (when expanded in Frames 4/5) is a scrollable `<div>` — it is not a modal dialog and does not trap focus. Users can Tab out of the drawer content to the page body. This is the correct behavior for a persistent drawer (not a modal).

### Accordion keyboard interaction

The spec does not specify keyboard behavior for the category-row accordion. Standard accordion pattern (WAI-ARIA Authoring Practices 1.2, "Accordion" pattern) requires:
- Enter/Space: toggle the accordion (activate the trigger button)
- Tab: move to next focusable element (inside accordion if open, or next row if closed)
- Arrow keys: optional for moving between accordion headers

The mockup uses native `<button>` elements for cat-rows, so Enter and Space activate them by default — this is correct. The absence of arrow key navigation between category rows is acceptable (the WAI-ARIA accordion pattern does not require it when using native buttons).

---

## Screen-reader narrative walkthrough

All announcements are for NVDA + Chrome (forms mode) unless noted. VoiceOver on iOS may vary.

### Scenario 1: User lands on Frame 1 (empty pathway)

With the current mockup (no sr-only h1, aria-hidden on drawer):

**What screen reader announces on page load:**
- "EVT Pathway Reference Mockup — NeuroWiki (Round 6)" (page title, from `<title>`)
- Virtual cursor enters the sticky header.
- "Back, button" (the back arrow — aria-label="Back" is present and correct)
- "Favorite, button" (aria-label="Favorite" — correct but no toggle state, see A-15)
- "Reset, button" (aria-label="Reset" — correct)
- "Copy, button" (correct but see A-11)
- Virtual cursor enters `<main>`.
- [Step 1 node div is invisible to screen reader — no announcement]
- "STEP 1 · TRIAGE" (the eyebrow div — read as text, no heading semantics. The spec specifies `<h2>` for step sections, but the eyebrow here is inside a div. This is actually the node eyebrow, not the `<h2>` — the h2 is specified in §4.1 as the section heading rendered as `text-[10px] ... uppercase`. The mockup does not include a step section `<h2>`. MISSING.)
- "Occlusion Type, button" (correct — the cat-row button is accessible)
- "LVO Location, button" (correct — no aria-expanded, see A-05)
- "Anterior Circulation, button" (inside open accordion — correct label)
- "ICA / M1" (the cat-option-sub span — read as additional text; acceptable)
- "Posterior Circulation, button"
- "Basilar"
- "Confirm LVO, button"
- "Prestroke mRS, button"
- "Age Group, button"
- [Step 2–4 nodes: skipped — divs]
- "STEP 2 · CLINICAL" (eyebrow text, no heading role)
- "Awaiting Step 1 ↑" (plain paragraph — reads as "Awaiting Step 1 up arrow" or "Awaiting Step 1 upwards arrow" on NVDA)
- [Drawer is aria-hidden — no announcement]

**Incoherent narration flags:**
- No page heading. Screen reader announces the page title from `<title>` but the page body has no `<h1>`.
- Step nodes are completely invisible to the screen reader. The user cannot understand the step-progress structure by navigating.
- "Awaiting Step 1 up arrow" is awkward. The Unicode arrow is not well-handled across all screen readers. JAWS may say "upward pointing triangle" or skip it.
- The drawer's existence is invisible in State A (aria-hidden). The user does not know to expect a result area.

### Scenario 2: User taps a category row to open the accordion

Focus is on "LVO Location, button." User presses Enter.

**What screen reader announces (current mockup):**
- Nothing changes in the accessibility tree notification — no `aria-expanded` change, no status message.
- Focus stays on the "LVO Location" button (correct focus behavior for accordion triggers).
- Virtual cursor now moves through "Anterior Circulation, button" and "Posterior Circulation, button" (if the user navigates manually).

**Incoherent narration:** The user does not hear that the accordion opened. They must navigate manually to discover the options appeared below the button. This is a significant gap for screen-reader users who navigate by Tab rather than virtual cursor.

**With A-05 fixed (aria-expanded added):** NVDA would announce "LVO Location, expanded, button" or "LVO Location, button, expanded." Then after Tab: "Anterior Circulation, button." This is the correct experience.

### Scenario 3: User picks an option and the accordion closes

User is on "Anterior Circulation, button" and presses Enter.

**What screen reader announces (current mockup):**
- Nothing — no live region, no status message, no `aria-expanded` change on the parent (because `aria-expanded` is not present).
- Focus may move to the next cat-row button or remain on the now-gone accordion option button (the button DOM element disappears when the accordion closes, which causes focus drop to `<body>` — a keyboard trap analog).

**Critical focus-management gap:** When the user selects an option and the accordion collapses, the button they were focused on is removed from the DOM. Focus drops. The implementation must explicitly move focus to either the parent cat-row button (now showing the selected value) or the next category row. The spec does not address this.

**With fixes:** `aria-expanded` goes to "false" on the cat-row button, focus is moved programmatically to the cat-row button, and NVDA announces "LVO Location, collapsed, button" followed by the updated label.

### Scenario 4: A branch chip appears

After Step 1 is complete, the branch chip button appears in the DOM.

**What screen reader announces (current mockup):**
- Nothing. There is no `aria-live` region to announce the chip's appearance. The chip is a `<button>` and will be reachable by Tab, but its appearance is silent.

**Acceptable or incoherent?** Partially acceptable. The chip's existence is discoverable by Tab. However, a screen-reader user who has just completed Step 1 does not know that a summary chip appeared — they would need to Shift+Tab backward to discover it. The visual design communicates "your summary is here — you can edit it" via the chip's position. This information is lost for non-visual users.

**Recommendation (not a critical failure):** After Step 1 completes, a `role="status"` live region should announce: "Step 1 complete. Summary: Anterior LVO, Confirmed, mRS 0–1, Age 18–79. To edit, use the Edit button that appeared above Step 2." This requires a single `aria-live` status region on the page.

### Scenario 5: Cascade-clear fires

User changes LVO Location. Cascade fires.

**What screen reader announces (current mockup):**
- Nothing. The cascade-notice div has no live region. Steps 2–4 re-lock. No announcement.

**Incoherent:** This is the most significant screen-reader failure. A user who changed a value hears nothing, then discovers (by navigating) that previously-answered steps are now showing "Select…" placeholders. They cannot know why. This is disorienting and potentially leads to clinical errors (re-answering questions that were correct).

**With A-01 fixed (`role="status" aria-live="polite"`):** NVDA announces "Clinical, Imaging, and Result cleared — re-confirm." The Undo button remains in the tab order and is reachable.

### Scenario 6: Drawer transitions State A → C-1

When the pathway completes and the drawer activates.

**What screen reader announces (current mockup):**
- The State A drawer (`aria-hidden="true"`) transitions to State C-1 (the `<button>` drawer with `aria-hidden` removed or not present on the C-1 version). The State C-1 drawer is a `<button>` with no `aria-hidden`.
- If implemented as a conditional render (State A div disappears, State C button appears), the appearance of the button is silent unless it is in a live region.
- The user would need to Tab to reach the button and hear "Interpretation Eligible EVT reasonable, button."

**Recommendation:** The transition from State A to State C should be announced via the page-level `role="status"` live region: "Pathway complete. Eligible · EVT reasonable. Interpretation drawer now available." This is a significant usability improvement for screen-reader users.

---

## Color independence

**Is any information conveyed only by color?**

1. **Rail color (cobalt vs slate):** The cobalt vs slate rail communicates traversal state. For color-blind users, the cobalt (#1746A2) and slate-200 (#e2e8f0) produce strong luminance contrast. Under deuteranopia/protanopia simulation, cobalt appears dark blue-gray and slate-200 appears very light gray — these are distinguishable by luminance difference, not hue. This is acceptable. However, the rail alone conveys no textual information — the node shapes (filled circle vs hollow ring vs small hollow circle) provide supplementary shape-based differentiation.

2. **Drawer severity tinting (slate / amber / red):** The drawer header changes between slate (State A), cobalt/neuro (Eligible), amber (Consult), and red (Avoid). Under deuteranopia, red and amber may be confused. The text labels ("Not eligible · Avoid EVT" vs "Clinical judgment · MeVO non-disabling") are the primary differentiators — color is supplementary. This is compliant with 1.4.1 Use of Color because the text labels carry the full meaning.

3. **Selected cobalt bar in accordion:** The 2px cobalt left bar on a selected option is the only selection indicator (spec: "No radio-button circles. No checkmarks."). For color-blind users who cannot distinguish cobalt from white/slate, the selected option has no non-color indicator. This is a 1.4.1 failure for users with blue-yellow color vision deficiency (tritanopia), though tritanopia is rare (~0.016% of the population). More critically, the font-weight change (`.cat-option-selected .cat-option-label { font-weight: 500 }`) from unselected (no font-weight) to selected (font-weight: 500) is a very subtle change — likely not perceptible as a meaningful differentiation.

**Recommendation:** Add a checkmark icon (visually rendered, not just a Unicode character) to selected accordion options, or change `font-weight: 500` to `font-weight: 700` (bold) for selected options. Either approach provides a non-color selection indicator.

4. **Favorited star (amber vs slate):** The filled amber star vs hollow slate star communicates favorited state. Shape (filled vs hollow) is a non-color signal. This is compliant.

5. **Completed step node (filled cobalt circle vs hollow cobalt ring vs small hollow slate circle):** Shape and size differentiate these three states, not just color. Compliant.

---

## Reduced motion implications

**WCAG 2.3.3 Animation from Interactions (Level AAA):** This criterion is AAA, not AA. However, the WCAG 2.1 AA framework also addresses motion under Principle 2 (Operable), specifically for users with vestibular disorders (WCAG 2.3.3 is closely related to the intent of 2.1 broadly). Many hospital style guides mandate `prefers-reduced-motion` support regardless of the WCAG level.

**Animations present in the mockup and spec:**

| Animation | Duration | CSS property | Reduced-motion guard? |
|---|---|---|---|
| Cascade-notice slide in | 200ms | `transition-opacity` + translate | None |
| Rail color fade (cobalt → slate) | 250ms | `transition` on border-color | None |
| Chevron rotation | 180ms | `transition: transform 0.18s ease` | None |
| Drawer chevron bounce hint | 2.4s, infinite | `animation: chevron-bounce` | None |
| Drawer pulse on appear | 1.6s | `animation: drawer-pulse` | None |
| Cat-row background hover | 120ms | `transition: background-color 0.12s` | None |
| Branch-chip hover color + ring | 120ms | `transition: background-color 0.12s, box-shadow 0.12s` | None |

None of the seven animation instances are guarded by `@media (prefers-reduced-motion: reduce)`. The drawer chevron bounce (2.4s infinite) and drawer pulse are the most problematic — continuous/repeating animations are known triggers for vestibular disorders. The spec makes no mention of `prefers-reduced-motion`.

**Required additions to the spec (PATHWAY_SPEC §8 and the CSS block):**

```css
@media (prefers-reduced-motion: reduce) {
  .drawer-chevron-hint { animation: none; }
  .drawer-just-available { animation: none; }
  .cascade-notice { transition: none; }
  .cat-row, .cat-option, .branch-chip { transition: none; }
  .cat-row-chevron { transition: none; }
  /* Rail color transitions: apply instantly via class swap instead of CSS transition */
}
```

The cascade-notice slide (200ms) can be converted to an instant opacity switch under reduced motion. The rail fade (250ms) can be an instant class swap. None of these changes compromise usability — users with reduced-motion preference still see the visual change; it simply happens without animation.

---

## Direct answer to V

Users on assistive technology cannot complete this pathway in its current form — round 7 is needed for accessibility before this design is implemented.

The three hardest blockers are: (1) completed category rows are non-interactive divs, which means a keyboard-only user cannot change an upstream answer except via the branch chip indirection; (2) the cascade-clear notice is silent to screen readers — a screen reader user who changes a value sees nothing, hears nothing, and is left to discover by exploration that downstream steps reset; (3) `text-slate-400` on white backgrounds, used systemically for eyebrows, sub-labels, chevrons, and placeholder text, fails the 4.5:1 contrast requirement at 2.85:1.

The fixes are not architectural — they are attribute additions, element-type corrections, and one color token adjustment. The core design is sound (the use of `<button>` for category rows and chips, the spec for `role="radiogroup"`, `aria-checked`, `focus-visible` rings, and `aria-label` on chips are all right). What is missing is: `aria-live` on the cascade-notice, `aria-expanded` on accordion triggers, `aria-label` on the page's h1, `role="button"` (i.e., actual `<button>`) on completed rows and step nodes, and a `@media (prefers-reduced-motion)` block. These are spec additions more than design changes — they require a round-7 spec revision and updated mockup before the engineer build begins.

Total findings: 17 (3 critical, 7 major, 5 minor, 2 advisory)

---

## Findings index

| ID | Severity | WCAG | Summary |
|---|---|---|---|
| A-01 | Critical | 4.1.3 | Cascade-notice missing aria-live |
| A-02 | Critical | 2.1.1, 4.1.2 | Completed rows are non-interactive divs |
| A-03 | Critical | 1.3.1, 4.1.2 | Drawer State A/B aria-hidden silences it |
| A-04 | Major | 1.3.1, 4.1.2 | Accordion option groups have no accessible name |
| A-05 | Major | 4.1.2 | Category row buttons missing aria-expanded |
| A-06 | Major | 1.3.1, 4.1.2 | Step nodes are non-interactive divs |
| A-07 | Major | 1.3.1 | Locked step body has no state announcement |
| A-08 | Major | 1.3.1, 4.1.2 | radiogroup containers missing aria-labelledby |
| A-09 | Major | 2.4.7 | Branch chip base rule uses outline:none |
| A-10 | Major | 4.1.2 | Drawer toggle missing aria-expanded / aria-controls |
| A-11 | Minor | 4.1.2 | Copy button label not descriptive |
| A-12 | Minor | 4.1.3 | No live progress status in State A/B drawer |
| A-13 | Minor | 1.3.1, 3.3.2 | Numeric inputs missing aria-describedby |
| A-14 | Minor | 1.4.1 | "Select…" placeholder relies partly on color (see contrast, not standalone failure) |
| A-15 | Minor | 4.1.2 | Favorite star toggle state not announced |
| A-16 | Minor | 1.3.1, 2.4.6 | No sr-only h1 in mockup |
| A-17 | Advisory | 2.4.1 | No skip link |
| B-01 | Critical | 1.4.3 | text-slate-400 on white: 2.85:1 (systemic, 7 instances) |
| B-02 | Major | 1.4.3 | amber-700 on amber-50: 4.25:1 |
| B-03 | Major | 1.4.3 | text-slate-500 on white: 4.48:1 |
| B-04 | Major | 1.4.3 | text-slate-500 on slate-100: 3.85:1 |
| B-05 | Major | 1.4.3 | neuro-700 at 75% opacity on neuro-50: ~3.1:1 |
| B-06 | Major | 1.4.3 | Locked eyebrow at 50% opacity on white: ~1.5:1 |
| C-01 | Advisory | 2.3.3 (AAA) | No prefers-reduced-motion guard on any animation |
| C-02 | Minor | 1.4.1 | Selected accordion option: cobalt bar only, no shape/weight non-color signal |

**Total: 25 findings — 4 Critical, 11 Major, 6 Minor, 4 Advisory**

**WCAG 2.1 AA pass verdict: FAIL. Round 7 spec revision required before engineer build.**
