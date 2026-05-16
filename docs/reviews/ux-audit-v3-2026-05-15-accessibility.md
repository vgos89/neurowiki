# v3 EVT Demo — Focused Accessibility Audit (warmth additions only)

**Date:** 2026-05-15
**Auditor:** accessibility-specialist
**Scope:** Step icons + pearl `<details>` blocks + auto-scroll behavior (the three v3 additions)
**Out-of-scope:** v2 elements already audited and passed (branch chips, cascade notice, drawer, header, category rows, accordion options, numeric inputs, confirm dialog)

---

## Executive summary

- **Total findings:** 3 (1 Major, 1 Minor, 1 Informational/AAA)
- **AA pass verdict:** Conditional pass. The two icon findings and the scroll delay are minor or informational. The one Major finding — missing `focus-visible` ring on `<summary class="pearl-toggle">` — must be fixed before shipping. No Critical findings block the demo.
- **Critical findings:** None. The Major finding (no visible focus ring on pearl `<summary>`) is a real WCAG 2.4.7 violation that will be visible in keyboard testing and must be addressed in v4.

---

## Step icon audit

### Icon markup

All four step icons are rendered via the `STEP_ICONS` object as bare inline SVGs injected into `.step-eyebrow` spans:

```js
// STEP_ICONS[1] — representative
`<svg class="step-icon" width="14" height="14" viewBox="0 0 24 24"
  fill="none" stroke="currentColor" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round"
  aria-hidden="true">...</svg>`
```

All four icons carry `aria-hidden="true"`. The eyebrow text (`STEP 1 · TRIAGE`, etc.) is the adjacent text node inside the same `<span class="step-eyebrow ...">` element. Screen readers will read the text and skip the SVG. No role conflict. No screen-reader noise from the icons.

### Locked-state icon contrast (Finding 1 — Minor)

The locked eyebrow class `.eyebrow-locked` applies `opacity: 0.5`. The icon inherits this from the parent (the CSS comment at line 198 confirms this is intentional). The icon color at full opacity is `#64748b` (slate-500) on `#ffffff` white.

**At 100% opacity:**
- `#64748b` on `#ffffff` = **5.71:1** — passes AA non-text contrast (3:1) and AA normal-text contrast (4.5:1)

**At 50% opacity (locked state):**
- Effective blended color on white: approximately `#b3bac5`
- `#b3bac5` on `#ffffff` = approximately **1.98:1**
- WCAG 1.4.11 (Non-text contrast, AA) requires **3:1** for UI components and graphics that convey meaning
- Because these icons are `aria-hidden="true"` they are classified as **decorative** — purely visual, conveying no information that is not also available as text
- WCAG explicitly exempts decorative elements from 1.4.11

**Verdict:** The locked-state icon at 1.98:1 does not trigger a WCAG violation because it is decorative. The adjacent eyebrow text (`STEP 2 · CLINICAL`) also inherits `opacity: 0.5`. The eyebrow text color is `#94a3b8` (slate-400) at 100% opacity on white = **2.85:1**, which is already below AA text contrast even at full opacity. At 50% opacity the eyebrow text drops to ~1.42:1. This is a pre-existing condition of the locked step state carried over from v2 and is out of scope for this audit. The icon itself, being decorative, does not introduce a new violation.

**Severity: Minor** — flagged for design awareness only. No new WCAG failure introduced by the v3 icon addition.

### Eyebrow text with icon — screen-reader narration

The `<span class="step-eyebrow">` receives its accessible name from its text content. The inline SVG is `aria-hidden="true"`. The node button immediately before the eyebrow carries `aria-label="Step 1: TRIAGE (active)"` (or completed/locked variant). The eyebrow span itself is non-interactive and has no role, so it is read as plain text. NVDA/VoiceOver will read it as "STEP 1 · TRIAGE" or similar, with the SVG skipped. No confusion or role conflict.

---

## Pearl block audit

### Native `<details>`/`<summary>` semantics

`renderPearl()` produces:

```html
<details class="pearl-block">
  <summary class="pearl-toggle">
    <!-- lightbulb SVG aria-hidden="true" -->
    <span class="pearl-label">Evidence Landscape</span>
    <!-- chevron SVG aria-hidden="true" -->
  </summary>
  <div class="pearl-body">
    <p>...</p>
  </div>
</details>
```

**Keyboard behavior:** The `<summary>` element is natively interactive. All browsers expose it with `role="button"` implicitly via the disclosure widget pattern. Enter and Space activate it by default — no custom `onKeyDown` required or present. Correct.

**`aria-expanded`:** The `<details>`/`<summary>` pattern manages expanded state natively via the `open` attribute. Screen readers that support the disclosure widget pattern announce state correctly (NVDA with Firefox: "Evidence Landscape, button, collapsed/expanded"; VoiceOver: "Evidence Landscape, disclosure triangle, collapsed/expanded"). No `aria-expanded` attribute is needed or present — and adding one would be redundant. Correct.

**Lightbulb SVG:** `aria-hidden="true"` — decorative, correctly hidden. The pearl label text is the accessible name.

**Chevron SVG:** `aria-hidden="true"` — decorative. Its rotation via `details[open] .pearl-chevron { transform: rotate(180deg); }` is a CSS transform and produces no DOM change that a screen reader would announce. No screen-reader noise from chevron rotation.

**Accessible name:** The `<summary>` accessible name is computed from its text content, specifically the `.pearl-label` span (`"Evidence Landscape"`, `"Exclusions"`, etc.). Both lightbulb and chevron SVGs are excluded from the name computation via `aria-hidden`. The name is unambiguous and descriptive. Correct.

### Body text contrast

`.pearl-body` sets `color: #475569` (slate-600) on `background: white (#ffffff)`.

- Luminance of `#475569`: 0.0869
- Contrast ratio: (1.0 + 0.05) / (0.0869 + 0.05) = **7.61:1**
- Requirement: 4.5:1 (AA, normal text)
- **Passes.**

`.pearl-label` sets `color: #64748b` (slate-500) on white.

- Contrast ratio: 5.71:1
- **Passes AA** (normal text, though at 10px size this is small text — 10px is below the 18px / 14px bold thresholds. At 5.71:1 it exceeds the 4.5:1 minimum for normal text, but note it does not reach AAA 7:1. Flagged as informational.)

### Focus indicator on `<summary>` (Finding 2 — Major)

The CSS for `.pearl-toggle` is:

```css
.pearl-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  min-height: 32px;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  list-style: none;
}
.pearl-toggle:hover { background: #f8fafc; }
.pearl-toggle::-webkit-details-marker { display: none; }
.pearl-toggle::marker { display: none; }
```

**No `:focus-visible` rule exists for `.pearl-toggle`.** The file defines `focus-visible` rings for every other interactive element class (`.back-btn`, `.icon-btn`, `.copy-btn`, `.node-btn`, `.cat-row-btn`, `.cat-option-btn`, `.cat-row-completed-btn`, `.branch-chip`, `.cascade-undo-btn`, `.drawer-c-btn`). The `<summary>` element is the sole interactive element without a focus-visible ring.

Browsers apply a default focus outline to `<summary>` elements, but this default is inconsistent across browsers and often very faint (particularly in Chrome/Safari where the default ring may be a thin 1px blue border or none at all depending on OS). Relying on browser default focus styling while explicitly styling all other elements is inconsistent and will fail manual keyboard testing.

**WCAG criterion:** 2.4.7 Focus Visible (Level AA) — "Any keyboard operable user interface has a mode of operation where the keyboard focus indicator is visible."

**Required fix:**
```css
.pearl-toggle:focus-visible {
  outline: 2px solid var(--color-neuro-500);
  outline-offset: 2px;
  border-radius: 6px;
}
```

**Severity: Major** — WCAG 2.4.7 AA violation. Keyboard users tabbing through an active step that has pearl blocks will land on the `<summary>` without a visible focus ring. This is the one finding that must be fixed before shipping.

### Screen-reader narration walkthrough

A VoiceOver user navigating the active Step 1 body after selecting "LVO" would encounter:

1. Category rows (cat-row-btn elements, announced as buttons with labels)
2. `<details class="pearl-block">` — VoiceOver on Safari announces: "Evidence Landscape, collapsed, disclosure triangle" (or similar phrasing depending on OS version)
3. User presses Space/Enter → content expands → VoiceOver announces "expanded"
4. Arrow keys or Tab move into `.pearl-body` content
5. Second pearl block follows: "Exclusions, collapsed, disclosure triangle"

The narration is natural. The `<details>` group does not require `role="region"` or `aria-labelledby` because the disclosure widget pattern is self-labeling through the `<summary>` accessible name. Correct.

**One nuance:** `min-height: 32px` on `.pearl-toggle` is below the 44px touch target minimum recommended by WCAG 2.5.5 (AAA) and Apple HIG. The actual interactive surface is `0.5rem` (8px) vertical padding top and bottom plus approximately 14px of content height — total approximately 30px. This falls short of 44px. This is a AAA concern for touch users; it is not an AA violation. Flagged separately.

---

## Auto-scroll audit

### Reduced-motion handling

`scrollToNextField()`:

```js
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
setTimeout(() => {
  window.scrollTo({
    top: elTop - headerOffset,
    behavior: reducedMotion ? 'auto' : 'smooth'
  });
}, 120);
```

- `prefers-reduced-motion: reduce` is checked at scroll time via `window.matchMedia` — synchronous, always current
- When `reduce` is set, `behavior: 'auto'` (instant jump) is used instead of `'smooth'`
- The CSS block at lines 54-60 already suppresses transitions/animations globally under reduced-motion
- The CSS block and the JS check are redundant-in-the-right-direction: both fire, producing an instant scroll with no transition artifacts

**Verdict: Correct.** Reduced-motion is handled at both the CSS layer (transitions) and the JS layer (scroll behavior). No conflict.

### Focus management

`scrollToNextField()` does not call `.focus()` on any element. The `window.scrollTo()` call moves the viewport but does not alter the browser's focus. Keyboard users retain focus on the element they just activated (the `cat-option-btn` they pressed). The next field scrolls into view but does not receive focus programmatically.

**Consequence for keyboard users:** After pressing a category option button, focus stays on that button (or wherever the re-render places it). The page scrolls to the next unanswered field. The user must then Tab to navigate to the newly scrolled-into-view field. This is acceptable behavior — it does not yank focus or cause a keyboard trap. Focus remains predictable.

**Consequence for screen-reader users:** Viewport scroll without focus movement is transparent to screen readers. The user's virtual cursor position is unaffected. There is no announcement of the scroll event. Screen-reader users following their virtual cursor or Tab key will naturally arrive at the next field in DOM order, which matches the visual scroll target. No disorientation.

**One edge case:** The `setTimeout` of 120ms is used to allow the re-render cycle (`render()`) to complete before measuring element position. During this 120ms window, if a keyboard user presses Tab very quickly, they may Tab focus to the next element while the scroll is being calculated. The scroll will then fire and move the viewport to a different element than the one that currently holds focus. This is an unlikely but auditable race condition. Under `prefers-reduced-motion: reduce` the scroll is instant (`'auto'`), so the timing concern is moot for that cohort. For smooth-scroll users this is a minor risk rather than a systematic failure.

**ARIA live considerations:** No `aria-live` region is updated on scroll. The cascade notice `role="status"` live region fires only on cascade clears, not on auto-scroll. There is no live announcement of "next field: LVO Location" or similar. This is correct — announcing viewport position changes would be noisy and confusing for screen-reader users. Silence is appropriate here.

**Severity of focus management: Informational** — no WCAG violation. The 120ms race condition is noted but is not a systematic failure.

---

## Findings

### Finding F-1 — Major: Missing focus-visible ring on pearl `<summary>` element

**WCAG:** 2.4.7 Focus Visible (Level AA)
**Element:** `<summary class="pearl-toggle">` inside `.pearl-block <details>`
**Symptom:** All other interactive elements in the file have explicit `:focus-visible` rings at `2px solid #1746A2`. The `<summary>` element has no `:focus-visible` rule. Browser default focus styling for `<summary>` is inconsistent and often invisible in Chromium/Safari.
**Impact:** Keyboard users navigating through a step body that contains pearl blocks will lose track of focus when tabbing onto the pearl summary.
**Fix:**
```css
.pearl-toggle:focus-visible {
  outline: 2px solid var(--color-neuro-500);
  outline-offset: 2px;
  border-radius: 6px;
}
```

---

### Finding F-2 — Minor: Locked-state icon below non-text contrast threshold (decorative exemption applies)

**WCAG:** 1.4.11 Non-text Contrast (Level AA) — exemption applies
**Element:** `.step-icon` SVG inside `.eyebrow-locked` span (opacity 0.5)
**Symptom:** At 50% opacity, the effective icon color (`#64748b` at 0.5 opacity on white) resolves to approximately `#b3bac5` on white = 1.98:1, below the 3:1 UI component threshold.
**Why not a violation:** All four step icons carry `aria-hidden="true"`. They are purely decorative; the step identity is conveyed by the adjacent text. WCAG 1.4.11 explicitly exempts decorative or inactive UI components. No information is lost when the icons are invisible at reduced opacity.
**Action:** No code change required. Noted for design awareness — if icons are ever made non-decorative (e.g., given a title or used without adjacent text) this becomes a violation and must be fixed at that point.

---

### Finding F-3 — Informational (AAA): Pearl `<summary>` touch target below 44px

**WCAG:** 2.5.5 Target Size (Level AAA) — not an AA requirement
**Element:** `<summary class="pearl-toggle">` — `min-height: 32px`, effective click height approximately 30px
**Threshold:** WCAG 2.5.5 AAA recommends 44×44px; WCAG 2.5.8 AA (WCAG 2.2) recommends 24px minimum, which is met. Apple HIG recommends 44px.
**Action:** If targeting iOS WebKit specifically, increase `min-height` to 44px. Not required for AA compliance but beneficial for touch usability. At minimum, `min-height: 40px` would bring the element within comfortable reach.

---

## Direct answer

The three v3 additions — step icons, inline pearl `<details>` blocks, and auto-scroll behavior — are **conditionally AA-compliant**. Two additions pass cleanly: step icons are correctly marked `aria-hidden="true"` and introduce no screen-reader noise or new contrast violations; auto-scroll correctly branches on `prefers-reduced-motion`, does not move focus, and is transparent to screen readers. The pearl `<details>` blocks have correct native semantics, correct decorative SVG treatment, and passing body-text contrast. However, the `<summary class="pearl-toggle">` element is missing a `:focus-visible` ring — a WCAG 2.4.7 AA violation that is the sole blocking finding. This one CSS rule must be added in v4 before the pearl pattern ships. No Critical issues were found that require reverting any v3 work; the fix is a single CSS declaration.
