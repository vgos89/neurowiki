---
name: accessibility-audit
description: WCAG 2.1 AA compliance checklist and ARIA patterns for NeuroWiki UI work. Load when reviewing or implementing interactive components, forms, modals, calculators, or keyboard navigation. Activates with accessibility-specialist.
---

# Accessibility Audit Skill

## Target: WCAG 2.1 Level AA

Required: Level A (minimum) + Level AA (target). Level AAA is aspirational.

---

## Four Principles (POUR)

1. **Perceivable** — Information must be presentable in ways users can perceive.
2. **Operable** — UI components must be operable.
3. **Understandable** — Information and operation must be understandable.
4. **Robust** — Content must work with assistive technologies.

---

## Implementation checklist

### Keyboard navigation
- [ ] All interactive elements reachable by Tab / Shift+Tab
- [ ] Focus order is logical (matches visual flow)
- [ ] No keyboard traps
- [ ] Enter/Space activates buttons; arrow keys navigate radio groups, tabs, menus
- [ ] Escape closes modals and dropdowns

### Screen reader support
- [ ] All images have meaningful `alt` text; decorative images have `alt=""`
- [ ] Form inputs have `<label>` or `aria-label`
- [ ] Icon-only buttons have `aria-label`
- [ ] Dynamic content changes are announced via `aria-live` or `role="alert"`
- [ ] Score updates in calculators are announced via `role="status" aria-live="polite" aria-atomic="true"`

### Color contrast
- [ ] Normal text: ≥ 4.5:1 against background
- [ ] Large text (18px+ or 14px+ bold): ≥ 3:1
- [ ] UI components (borders, focus indicators): ≥ 3:1

### Focus indicators
- [ ] Visible on all interactive elements — never `outline: none` without a replacement
- [ ] `focus-visible` ring: `2px solid #2b8cee`, `outline-offset: 2px`

### Semantic HTML
- [ ] Buttons are `<button>`, not `<div onClick>`
- [ ] Headings use `<h1>`–`<h6>` in logical hierarchy
- [ ] Lists use `<ul>` / `<ol>` / `<li>`
- [ ] Page uses landmark elements: `<header>`, `<main>`, `<nav>`, `<footer>`, `<aside>`

### Forms
- [ ] Every input has a `<label htmlFor>` or `aria-label`
- [ ] Required fields have `aria-required="true"`
- [ ] Error states use `aria-invalid="true"` and `aria-describedby` pointing to the error message
- [ ] Error messages use `role="alert"` or `aria-live="assertive"`
- [ ] Radio groups use `<fieldset>` + `<legend>` or `role="radiogroup"` + `aria-labelledby`

### Modals and dialogs
- [ ] `role="dialog"` and `aria-modal="true"`
- [ ] `aria-labelledby` pointing to the dialog title
- [ ] Focus is trapped inside modal when open
- [ ] First focusable element receives focus on open
- [ ] Escape key closes the modal
- [ ] Focus returns to trigger element on close

### Tables
- [ ] `<caption>` describing the table's purpose
- [ ] `<th scope="col">` for column headers, `<th scope="row">` for row headers
- [ ] No layout tables (use CSS for layout)

### Calculator-specific patterns
- [ ] Score updates announced: `<div role="status" aria-live="polite" aria-atomic="true">`
- [ ] Progress indicator: `role="progressbar"` with `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, `aria-label`
- [ ] Each question group has a `<fieldset>` + `<legend>`

---

## Common issues and fixes

**Icon-only button:**
```tsx
// Bad
<button onClick={handleEdit}><PencilIcon /></button>
// Good
<button onClick={handleEdit} aria-label="Edit NIHSS score">
  <PencilIcon aria-hidden="true" />
</button>
```

**Loading state:**
```tsx
<div role="status" aria-live="polite">
  {isLoading ? "Loading trial data..." : null}
</div>
```

**Dynamic score announcement:**
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {score !== null && `Current NIHSS Score: ${score} out of 42`}
</div>
```

---

## Testing methods

1. **Keyboard test** — Unplug mouse. Navigate the entire component by keyboard only. Check all items in the checklist above.
2. **Automated scan** — Run axe DevTools browser extension. Zero violations required for merge.
3. **Screen reader spot-check** — VoiceOver (Mac) or NVDA (Windows). Navigate by headings, landmarks, forms. Confirm all content is announced correctly.

---

## Pre-merge gate

Before any interactive UI PR merges:
- Zero axe DevTools violations
- Manual keyboard navigation verified
- Screen reader spot-check passed on at least one reader (VoiceOver or NVDA)
- All checklist items above confirmed
