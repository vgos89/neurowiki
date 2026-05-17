# Stroke Code accessibility audit — 2026-05-17

**Scope:** WCAG 2.1 AA audit of /pathways/stroke-code surface (~5000 LOC across 20+ files).
**Trigger:** V requested swarm audit; Stroke Code is known a11y debt area per L5 a11y audit.
**Status:** findings only. No code edits in this pass.
**Out of scope:** PM/connectivity (parallel QA audit), Design/UI-UX (parallel ui-architect audit), clinical content.
**Cross-reference baseline:** docs/L5-accessibility-audit.md (2026-05-13).

## Severity legend

- BLOCKER: WCAG 2.1 AA Level A failure (cannot complete with assistive tech)
- HIGH: WCAG 2.1 AA Level AA failure (substantial barrier)
- MEDIUM: usability gap, partial AA compliance
- LOW: best-practice improvement

---

## A. Keyboard accessibility

### A-1 — LKWTimePicker ScrollCol drum is mouse/touch-only (BLOCKER)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:87–115`
**WCAG:** 2.1.1 Keyboard (Level A)

The `ScrollCol` component renders a scrollable `<div>` containing clickable child `<div>` elements for hour, minute, and period selection. None of these `<div>` children has a `tabIndex`, keyboard event handler (`onKeyDown`), or ARIA role. The outer scroll container (line 87–95) accepts `onScroll` only. A keyboard user pressing Tab will skip entirely past all three drum columns — the time cannot be set.

This is the primary LKW entry point for the entire Stroke Code bedside workflow. Being unable to set LKW by keyboard blocks the core triage calculation.

**Required fix:** Each `ScrollCol` container needs `role="spinbutton"` (or `role="listbox"` with options), `tabIndex={0}`, `aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and `onKeyDown` handling ArrowUp/ArrowDown to change the selection. The selected child item needs `aria-selected="true"`.

---

### A-2 — AnalogClockPicker clock face is mouse-drag-only (BLOCKER)

**File:** `src/components/article/stroke/AnalogClockPicker.tsx:180–183`
**WCAG:** 2.1.1 Keyboard (Level A)

The analog clock face is a `<div>` with `onClick` and `onMouseDown` handlers. It handles `mousemove` and `mouseup` via window listeners (lines 86–95). There are no touch-equivalent `onPointerDown`/`onPointerMove` or keyboard equivalents. A keyboard user cannot interact with the clock at all — there is no `tabIndex`, no `role`, no `onKeyDown`.

The footer buttons ("Cancel", "OK") and the hour/minute display toggle buttons at lines 129–174 are proper `<button>` elements and are keyboard reachable. However the core time-setting mechanism (dragging the hand) is completely inaccessible. The hour and minute display buttons (`setMode('hour')` / `setMode('minute')`) allow toggling the mode but provide no mechanism to actually change the time value by keyboard.

**Required fix:** Keyboard users must be able to change the time. Minimum: the clock face container should accept `tabIndex={0}` and `onKeyDown` that increments/decrements the current mode's value via ArrowUp/ArrowDown. Better: replace the clock face with a `role="spinbutton"` pair for hour and minute.

---

### A-3 — Code/Study mode toggle: `aria-checked` on `role="button"` (HIGH)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:296–319`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The Code/Study toggle buttons at lines 296–319 use `aria-checked` (an attribute valid only on `role="checkbox"`, `role="radio"`, `role="menuitemcheckbox"`, `role="menuitemradio"`, `role="option"`, `role="switch"`, and `role="treeitem"`). The buttons have `type="button"` with no additional role, so `aria-checked` is invalid and ignored by assistive technologies. VoiceOver and NVDA will announce these as plain buttons with no state.

**Required fix:** Wrap in `role="radiogroup" aria-label="Workflow mode"` and set `role="radio"` with `aria-checked` on each button, or switch to `role="tab"` / `role="tabpanel"` pattern. The roving-tabindex pattern (only active tab at `tabIndex={0}`) should be applied.

---

### A-4 — Vitals/Imaging/Summary tab bar: missing tab semantics and focus ring (HIGH)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:324–342`
**WCAG:** 4.1.2 Name, Role, Value (Level A); 2.4.7 Focus Visible (Level AA)

The three step-navigation buttons at lines 324–342 visually function as a tab bar (one active at a time, switching content panels). They use `focus:outline-none` (line 333) with no replacement ring. They have no `role="tab"`, no `aria-selected`, and the content region below has no `role="tabpanel"` or `aria-labelledby` association.

Additionally, the active tab is communicated only via color change (`text-neuro-500` vs `text-slate-400`) and a bottom border — zero programmatic state.

**Required fix:** Add `role="tablist"` to the container, `role="tab"` and `aria-selected` to each button, `id` attributes on buttons, `role="tabpanel"` with `aria-labelledby` pointing to the tab button id on the content region. Replace `focus:outline-none` with `focus-visible:ring-2 focus-visible:ring-neuro-500`.

---

### A-5 — CalendarGrid month navigation buttons missing aria-label (MEDIUM)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:156–174`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The previous-month and next-month buttons in the `CalendarGrid` component render only a `ChevronLeft`/`ChevronRight` icon with no `aria-label`. Screen readers will announce them as "button" with no accessible name.

**Required fix:** `aria-label="Previous month"` and `aria-label="Next month"` on the respective buttons.

---

### A-6 — CalendarGrid day cells: disabled future dates missing `aria-disabled` (MEDIUM)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:192–210`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

Future dates are disabled via `disabled={future}` on the `<button>` (correct), but the `aria-label` on each button does not include the full date (only the day number). Screen reader users navigating by day number cannot determine the month/year context of the cell.

**Required fix:** Add `aria-label={`${day} ${MONTHS[viewMonth]} ${viewYear}${future ? ', unavailable' : isTod ? ', today' : ''}`}` to each calendar button.

---

### A-7 — LKWTimePicker outer container backdrop onClick does not Escape-close (MEDIUM)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:546–553`
**WCAG:** 2.1.1 Keyboard (Level A)

The close button (line 562–568) has a `focus-visible:ring-2` style (good). However, the LKWTimePicker has no `onKeyDown` Escape handler at the modal level — pressing Escape does not close the picker. The close button at line 563 only closes on click. The inner `div` at line 551 calls `e.stopPropagation()` but there is no keyboard close path.

**Required fix:** Add `useEffect` with `keydown` listener for `Escape` → `onClose()`, following the pattern used in `TpaReversalProtocolModal` (lines 36–44).

---

### A-8 — SleepTimeRow day toggle pills: keyboard reachable but no aria state (MEDIUM)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:252–267`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The "Today / Yesterday / 2 days ago" pill buttons inside `SleepTimeRow` are proper `<button>` elements (keyboard reachable), but the currently selected day offset is indicated only by background color change (`bg-amber-500 text-white` vs `bg-slate-100 text-slate-600`). There is no `aria-pressed` or `aria-selected` attribute communicating the active state programmatically.

**Required fix:** Add `aria-pressed={dayOffset === i}` to each pill button.

---

## B. Focus management

### B-1 — ThrombectomyPathwayModal: no focus trap, no role="dialog", no aria-labelledby (BLOCKER)

**File:** `src/components/article/stroke/ThrombectomyPathwayModal.tsx:44–79`
**WCAG:** 2.4.3 Focus Order (Level A); 4.1.2 Name, Role, Value (Level A)

This is a direct re-confirmation of L5 finding H1. The outer container at line 45 has no `role="dialog"`, no `aria-modal="true"`, no `aria-labelledby`. There is no focus trap — Tab can escape into the obscured background. Focus is not moved into the modal on open, and is not returned to the trigger on close.

The close button (lines 53–59) has `aria-label="Close"` (present) but the modal context is absent. Since this modal overlays the full screen and contains clinical decision support for thrombectomy candidacy, a screen reader user will receive no signal that a modal has opened.

**Status relative to L5 baseline:** STILL OPEN — not fixed since 2026-05-13.

**Required fix:** Outer `div` needs `role="dialog" aria-modal="true" aria-labelledby="thrombectomy-modal-title"`. Add `id="thrombectomy-modal-title"` to the title `<p>` element. Add focus trap (save `previousActiveElement`, `useRef` on first focusable child, trap Tab/Shift+Tab, Escape closes and restores focus). Pattern reference: `HemorrhageProtocolModal.tsx` implements this correctly.

---

### B-2 — NIHSS Calculator Modal: no role="dialog", no aria-modal, no aria-labelledby, no focus trap (BLOCKER)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:703–722`
**WCAG:** 2.4.3 Focus Order (Level A); 4.1.2 Name, Role, Value (Level A)

The inline NIHSS modal at lines 703–722 is a `<div className="fixed inset-0 bg-black/70 …">` with no ARIA modal attributes:
- No `role="dialog"`
- No `aria-modal="true"`
- No `aria-labelledby` (the "NIHSS Calculator" label at line 706 is an unassociated `<span>`)
- No focus trap (keyboard Tab will escape into background)
- No Escape-to-close at the modal level (only a close button exists)

The close button at line 707 has `aria-label="Close NIHSS calculator"` (good). The content is otherwise inaccessible as a modal.

**Required fix:** Wrap inner content `div` in a container with `role="dialog" aria-modal="true" aria-labelledby="nihss-modal-title"`. Add `id="nihss-modal-title"` to the "NIHSS Calculator" span. Implement focus trap and Escape-close.

---

### B-3 — ThrombolysisEligibilityModal: focus trap present via Escape; Tab cycling not implemented (HIGH)

**File:** `src/components/article/stroke/ThrombolysisEligibilityModal.tsx:141–144`
**WCAG:** 2.4.3 Focus Order (Level A)

Progress since L5 audit: `role="dialog"`, `aria-modal="true"`, `aria-labelledby="eligibility-modal-title"` are all correctly present (lines 226–229). Escape key closes the modal (lines 141–144).

However, focus is not moved into the modal on open — there is no `useRef` or `useEffect` focusing the first focusable element when `isOpen` becomes true. Tab will reach the modal's elements through normal document flow only if the trigger happens to be near the modal in DOM order. Since the modal is appended after the main workflow content via the `Suspense` boundary, a keyboard user must Tab through the entire workflow to reach modal elements.

Additionally, Tab cycling is not trapped — a user can Tab past the last element in the modal footer and return to background content.

**Status relative to L5 baseline:** PARTIALLY FIXED — role/aria attributes are now correct; focus trap and focus-on-open are still missing.

**Required fix:** Use `useRef` to move focus to the first focusable element on open (pattern: `HemorrhageProtocolModal.tsx:33`). Add Tab-cycling trap using a `keydown` listener on the modal container.

---

### B-4 — DeepLearningModal: no role="dialog", no focus trap, no return-focus-on-close (HIGH)

**File:** `src/components/article/stroke/DeepLearningModal.tsx:134–396`
**WCAG:** 2.4.3 Focus Order (Level A); 4.1.2 Name, Role, Value (Level A)

The DeepLearningModal renders as a side-panel drawer (lines 139–384). The backdrop div at line 135 and the panel div at line 139 have no `role="dialog"`, no `aria-modal`, no `aria-labelledby`. The header `<h3>` at line 152 is a heading but is not connected to the container. Escape closes the modal (lines 98–113) — that part is correct. Body scroll is locked on open (line 107).

No focus-on-open or return-focus-on-close mechanism exists.

The Study Mode pearls are a learning tool, so this is a HIGH rather than BLOCKER — but screen reader users in Study Mode receive no modal announcement.

**Required fix:** Outer panel `div` needs `role="dialog" aria-modal="true" aria-labelledby="deep-learning-modal-title"`. Add `id` to the `<h3>`. Add `useRef` focus-on-open and restore-focus-on-close.

---

### B-5 — HemorrhageProtocolModal, TpaReversalProtocolModal, OrolingualEdemaProtocolModal: Tab cycling not trapped (MEDIUM)

**Files:**
- `src/components/article/stroke/HemorrhageProtocolModal.tsx:26–144`
- `src/components/article/stroke/TpaReversalProtocolModal.tsx:35–153`
- `src/components/article/stroke/OrolingualEdemaProtocolModal.tsx:34–152`
**WCAG:** 2.4.3 Focus Order (Level A)

These three modals are the best-implemented in the surface: they all have `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`, Escape-to-close, focus-on-open via `closeButtonRef`, and return-focus-on-close.

However, none of them trap Tab/Shift+Tab cycling within the modal. A user who presses Tab past the last focusable element (the "Close" button in the footer) will exit the modal into background content. The Tab-cycle trap is the missing piece from a complete focus-management implementation.

**Status relative to L5 baseline:** BETTER than prior baseline — these were not reviewed in L5 (not in scope). They are substantially correct but missing the Tab-cycle trap.

**Required fix:** Add a `keydown` listener on the modal container that intercepts `Tab` and `Shift+Tab` to cycle focus within the modal (standard focus-trap-within-dialog pattern).

---

## C. ARIA roles, states, properties

### C-1 — ThrombolysisEligibilityModal chip buttons: focus-visible ring suppressed (HIGH)

**File:** `src/components/article/stroke/ThrombolysisEligibilityModal.tsx:275–299, 315–330, 352–375, 399–415`
**WCAG:** 2.4.7 Focus Visible (Level AA)

This is a direct re-confirmation of L5 finding H2. All chip body buttons — Hard Stops (line 275), Bleeding/Labs (line 315), Relative (line 352), Extended Window (line 399) — have `focus-visible:outline-none` with no replacement ring. The info-icon buttons alongside each chip also have `focus-visible:outline-none`.

These are safety-relevant toggle buttons (a clinician marks contraindications for tPA). A keyboard user cannot determine which chip is currently focused.

**Status relative to L5 baseline:** STILL OPEN — not fixed since 2026-05-13.

**Required fix:** Replace `focus-visible:outline-none` with `focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-neuro-500` (or `focus-visible:ring-red-500` for hard-stop chips, `focus-visible:ring-amber-500` for relative chips) on all chip body buttons and info-icon buttons.

---

### C-2 — ThrombolysisEligibilityModal chip toggle buttons: no aria-pressed state (HIGH)

**File:** `src/components/article/stroke/ThrombolysisEligibilityModal.tsx:275–299`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The chip body buttons (e.g., "ICH on CT", "BP >185/110") are toggle buttons — clicking sets or unsets a contraindication. The active state is communicated only via background color change (`bg-red-500` vs `bg-white`). No `aria-pressed` attribute is set. A screen reader user toggling chips receives no state announcement.

The button accessible name is the chip label text (e.g., "ICH on CT") — that part is fine. The missing piece is the current pressed/toggled state.

**Required fix:** Add `aria-pressed={active}` to each chip body button across all four chip sections.

---

### C-3 — NihssCalculatorEmbed score display not in an aria-live region (HIGH)

**File:** `src/components/article/stroke/NihssCalculatorEmbed.tsx:86–94`
**WCAG:** 4.1.3 Status Messages (Level AA)

The NIHSS total score display (lines 86–94) updates dynamically as items are scored, but the score is in a plain `<div>` with no `role="status"`, `aria-live`, or `aria-atomic`. Screen readers do not announce score changes. In the standalone NIHSS calculator, this is handled by the `CalculatorHeader` shell's `aria-live` div — but the embed does not use that shell and has no equivalent.

The LVO probability region (lines 97–111) has the same problem — `lvoData.label` and `lvoData.probability` update silently.

**Required fix:**
```tsx
<div role="status" aria-live="polite" aria-atomic="true" aria-label={`NIHSS score: ${total} out of 42`}>
  {/* existing score display */}
</div>
```
Similarly wrap the LVO display or combine both into a single live region announcement.

---

### C-4 — NihssCalculatorEmbed Rapid/Detailed mode toggle: no aria-pressed (MEDIUM)

**File:** `src/components/article/stroke/NihssCalculatorEmbed.tsx:156–177`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The Rapid/Detailed toggle buttons (lines 156–177) communicate active state only via visual styling. No `aria-pressed` attribute exists. Same pattern as C-3 above — the standalone calculator shell handles this; the embed does not.

**Required fix:** Add `aria-pressed={nihssMode === 'rapid'}` and `aria-pressed={nihssMode === 'detailed'}`.

---

### C-5 — NihssCalculatorEmbed Copy and Reset icon-only buttons: no aria-label (MEDIUM)

**File:** `src/components/article/stroke/NihssCalculatorEmbed.tsx:180–196`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The Copy button (line 181) uses only `title="Copy to EMR"` — `title` is not a substitute for `aria-label` (it is not reliably announced by all screen readers, and is not announced on keyboard focus in NVDA/JAWS). The Reset button (line 188) has `title="Reset"` with the same problem. Both are icon-only buttons.

**Required fix:** Add `aria-label="Copy NIHSS to EMR"` and `aria-label="Reset NIHSS"` respectively. The `Copy` and `RefreshCw` icons should have `aria-hidden="true"`.

---

### C-6 — Clinical Context Bar: status region label reads as "Clinical context summary" but contents are unlabeled key-value pairs (MEDIUM)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:347–380`
**WCAG:** 1.3.1 Info and Relationships (Level A)

The clinical context bar at lines 347–380 has `role="status" aria-label="Clinical context summary"` (good). However, the individual data pairs inside ("NIHSS 5", "BP 140/90", "Glucose 100", "LKW 2.1h ago") are structured as adjacent `<span>` elements with no semantic association between label and value. Screen readers reading through the element will announce "NIHSS 5 BP 140/90 Glucose 100 LKW 2.1h ago" as a continuous stream without clear label-value pairing.

The decorative pipe separators use `aria-hidden` correctly (line 352).

**Required fix:** Either use `<dl>/<dt>/<dd>` pairs, or add `aria-label` to each value span (e.g., `aria-label="NIHSS score: 5"`). The current approach is acceptable for sighted users but sub-optimal for screen reader linear reading.

---

### C-7 — CodeModeStep2 CT Result radio group: custom radio pattern missing radiogroup role (HIGH)

**File:** `src/components/article/stroke/CodeModeStep2.tsx:137–169`
**WCAG:** 1.3.1 Info and Relationships (Level A); 4.1.2 Name, Role, Value (Level A)

The CT Result selection (lines 137–169) renders three `<button>` elements that function as a radio group (one option selected at a time). The visual radio indicator (a circle with a filled center) is purely presentational CSS divs (lines 155–160) with no ARIA. There is no `role="radiogroup"` wrapper, no `role="radio"` on options, no `aria-checked`, and no keyboard arrow-key navigation between options.

The same pattern repeats in the Treatment Decision section (lines 242–268) and in CodeModeStep2 LVO detection buttons (lines 291–304).

**Required fix:** Wrap in a container with `role="radiogroup" aria-labelledby` pointing to the section label. Each option button needs `role="radio"` and `aria-checked={ctResult === option.value}`. Arrow keys must navigate between options (roving tabindex).

---

### C-8 — CodeModeStep4 rationale expand button nested inside `<label>` (HIGH)

**File:** `src/components/article/stroke/CodeModeStep4.tsx:504–530`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The rationale expand button at line 516 (`"Why? Evidence & Rationale"` / `"Hide Evidence & Rationale"`) is nested inside a `<label>` element (line 504). Clicking the `<label>` triggers the associated `<input type="checkbox">` (line 505). The `<button>` nested inside the `<label>` fires its own `onClick` with `e.preventDefault()` to stop checkbox toggling — this creates an unpredictable interaction. In some browsers and assistive tech configurations, clicking the button will also check the checkbox.

Additionally, the `<label>` element's accessible name includes both the order label text and the "Why?" button text — screen readers may announce the full label concatenation when the checkbox is focused.

**Required fix:** Move the rationale expand button outside the `<label>` element entirely. The expand button can remain adjacent and reference the order label text via `aria-label` or `aria-describedby`.

---

### C-9 — EligibilityCheckerV2 time input pair: no `<label>` association (MEDIUM)

**File:** `src/components/article/stroke/EligibilityCheckerV2.tsx:125–168`
**WCAG:** 1.3.1 Info and Relationships (Level A); 3.3.2 Labels or Instructions (Level A)

The hour and minute inputs at lines 129–140 are `<input type="number">` elements with no associated `<label htmlFor>` and no `aria-label`. The section label at line 120 (`"Last Known Well Time"`) is a `<label>` element but its `htmlFor` is empty — it does not associate with either input. The inputs will be announced as "number edit blank" with no context by screen readers.

Similarly, the AM/PM toggle buttons (lines 143–166) have no `aria-pressed` state.

This component appears to be a legacy version (`EligibilityCheckerV2`) superseded by the `ThrombolysisEligibilityModal` in the main workflow. However it remains in the codebase and should be corrected if used.

**Required fix:** Add `aria-label="Hour"` and `aria-label="Minute"` to the respective inputs (or use `id` and `<label htmlFor>`). Add `aria-pressed` to AM/PM buttons.

---

### C-10 — LVOScreenerV2 Yes/No decision buttons: no aria state (MEDIUM)

**File:** `src/components/article/stroke/LVOScreenerV2.tsx:135–160`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The "YES - Present" and "NO - Absent" buttons (lines 135–160) communicate their selected state only via background color. No `aria-pressed` attribute exists. A screen reader user pressing these buttons hears "YES - Present, button" with no confirmation whether it is currently selected.

**Required fix:** Add `aria-pressed={decision === 'yes'}` and `aria-pressed={decision === 'no'}`.

---

### C-11 — VitalsInputV2 BP input pair: no label for systolic/diastolic split (MEDIUM)

**File:** `src/components/article/stroke/VitalsInputV2.tsx:156–169`
**WCAG:** 3.3.2 Labels or Instructions (Level A)

The `<label>` at line 155 ("Blood Pressure (mmHg)") is a block-level label but does not associate with either individual input via `htmlFor`. The two inputs (lines 159 and 165, with placeholders "SBP" and "DBP") have no `aria-label`. Screen readers will announce them only as "number edit, SBP" (using placeholder as accessible name) — placeholder is not a reliable accessible name and disappears on input.

**Required fix:** Add `aria-label="Systolic blood pressure in mmHg"` and `aria-label="Diastolic blood pressure in mmHg"` to the respective inputs.

---

### C-12 — CodeModeStep4 orders section category headers not announced as region landmarks (LOW)

**File:** `src/components/article/stroke/CodeModeStep4.tsx:481–494`
**WCAG:** 1.3.1 Info and Relationships (Level A)

The category headers (`Lab work`, `Post-Thrombolysis Monitoring`, etc.) inside CodeModeStep4 are rendered as `<h4>` elements (line 487) — heading level is appropriate. However the content divs at line 496 (`<div className="divide-y divide-slate-100">`) have no `role="group"` or `aria-labelledby` pointing to the category heading. This is a low-priority structural gap; the headings are present so navigation by heading works.

---

## D. Semantic HTML

### D-1 — CodeModeStep1 LKW time display button: no accessible label for the displayed time value (HIGH)

**File:** `src/components/article/stroke/CodeModeStep1.tsx:149–155`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The LKW time display at line 149–155 is a `<button>` whose accessible name is the raw time string (e.g., "9:30 AM"). Screen readers will announce "9:30 AM, button" — no context that this is the Last Known Well time or that clicking it opens a time picker.

**Required fix:** Add `aria-label={`Last Known Well time: ${lkwTimeDisplay}. Tap to change.`}` to the button. The adjacent "Change" button (lines 158–164) similarly has no accessible name beyond "Change" — add `aria-label="Change Last Known Well time"`.

---

### D-2 — StrokeBasicsWorkflowV2 Emergency Protocol buttons: generic labels (MEDIUM)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:654–675`
**WCAG:** 2.4.6 Headings and Labels (Level AA)

The emergency protocol buttons ("tPA reversal", "Orolingual edema", "ICH protocol") have descriptive text labels — this is fine. However they lack `aria-label` supplementation to clarify they open protocol dialogs. A screen reader user hears "tPA reversal, button" — acceptable, but "Open tPA reversal protocol" would be more descriptive in context.

This is a LOW-severity issue since the text is present. Noted for completeness.

---

### D-3 — LKWTimePicker CalendarGrid: CSS grid instead of semantic table (MEDIUM)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:178–210`
**WCAG:** 1.3.1 Info and Relationships (Level A)

This is a direct re-confirmation of L5 finding M8. The day-of-week headers (Mon–Sun) are plain `<div>` elements (lines 178–182) inside a CSS grid. The day cells are `<button>` elements inside another CSS grid (lines 185–210). There is no `<table>`, `<caption>`, `<th scope="col">`, or grid role semantics.

Screen readers cannot announce "Wednesday, 14 May" because the column header relationship is absent.

**Status relative to L5 baseline:** STILL OPEN.

**Required fix:** Convert to `<table role="grid">` with `<caption>`, `<thead>/<tr>/<th scope="col">`, and `<tbody>/<tr>/<td>/<button>`. Alternatively apply `role="grid"`, `role="columnheader"` on the day header divs, and `role="gridcell"` on the cell wrappers.

---

### D-4 — StudyPearlsButton: button has no aria-label context (LOW)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:142–152`
**WCAG:** 4.1.2 Name, Role, Value (Level A)

The `StudyPearlsButton` renders as `"{count} Clinical Pearl{s}"` text. The accessible name is the count + label text, e.g., "4 Clinical Pearls". This is acceptable but has no indication it opens a modal. Consider `aria-haspopup="dialog"` and `aria-label="Open 4 Clinical Pearls dialog"`.

---

### D-5 — CodeModeStep3 milestone status badges use emoji tick marks as content (LOW)

**File:** `src/components/article/stroke/CodeModeStep3.tsx:280–305`
**WCAG:** 1.3.1 Info and Relationships (Level A)

The milestone status badges at lines 280–305 include "✓" characters as text content alongside time values. Unicode tick marks are announced by screen readers (VoiceOver announces "check mark") which is acceptable, but the semantic meaning is "target met." An `aria-label` on the badge that includes the interpretation would be clearer (e.g., `aria-label="CT first image: 22 min, target met"`).

Low priority since the checkmark character does have semantic meaning to screen readers.

---

## E. Visual / cognitive

### E-1 — WindowBadge and clinical context bar: color is sole status conveyor (HIGH)

**File:** `src/components/article/stroke/CodeModeStep1.tsx:131–138`; `src/pages/guide/StrokeBasicsWorkflowV2.tsx:372–378`
**WCAG:** 1.4.1 Use of Color (Level A)

The `WindowBadge` component renders three states:
- Within 4.5h: green (`bg-emerald-50 text-emerald-700`) with "Within 4.5h" text
- Extended window: amber (`bg-amber-50 text-amber-700`) with "Extended window" text
- Outside tPA window: rose (`bg-rose-50 text-rose-700`) with "Outside tPA window" text

The text labels are present — this part is good. However the filled circle glyph (`●`) in each badge (line 134) uses color alone to convey the urgency distinction (green dot vs amber dot vs red dot). For colorblind users (red-green colorblindness affects ~8% of males), the dot itself conveys no status without the surrounding text.

The clinical context bar at lines 372–378 renders a window classification badge that uses only color (emerald/amber/red background) plus text — the text label is sufficient per WCAG 1.4.1. No issue here.

**Required fix for WindowBadge:** Replace the colored `●` circle with a shape-differentiated icon per status (e.g., `✓` for in-window, `~` or `!` for extended, `✕` for outside). Or add `aria-label` on the badge span that includes the status text.

---

### E-2 — Inline `animate-in` animations on thrombectomy recommendation card: no prefers-reduced-motion guard (MEDIUM)

**File:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:613`
**WCAG:** 2.3.3 Animation from Interactions (AAA — noted as user-facing risk)

The thrombectomy recommendation card at line 613 uses `animate-in slide-in-from-bottom-4 duration-500`. Per L5 finding L3, the global `index.css` does not cover `animate-in` class patterns. Users with vestibular disorders (who have enabled `prefers-reduced-motion: reduce`) will see the slide-in animation.

**Required fix:** Add `motion-reduce:animate-none` alongside `animate-in slide-in-from-bottom-4 duration-500`. Or add a global rule in `index.css`:
```css
@media (prefers-reduced-motion: reduce) {
  [class*="animate-"] { animation: none !important; }
}
```

---

### E-3 — EligibilityCheckerV2 status result icon uses emoji characters (MEDIUM)

**File:** `src/components/article/stroke/EligibilityCheckerV2.tsx:73–94`
**WCAG:** 1.3.1 Info and Relationships (Level A)

The `getStatus` function returns `icon: '✓'`, `icon: 'ⓘ'`, `icon: '❌'` raw emoji/Unicode characters at lines 73–94. These are rendered inside the result card at line 212. Screen readers will announce these as "check mark", "information", "cross mark" — which is acceptable for `✓` and `❌` but `ⓘ` may be announced inconsistently. More critically, the result card's color is the primary urgency conveyor (`status.color === 'green'` / `'yellow'` / `'red'` at lines 194–197) — the color alone determines the red/yellow/green tint. Per WCAG 1.4.1, the color distinction must have a non-color equivalent. The text title (`status.title`) is also present, which mitigates the issue, but the `icon` characters add an implicit status that relies on color interpretation.

---

### E-4 — `text-[10px]` / `text-[9px]` label text throughout Step components: below minimum contrast at these sizes (MEDIUM)

**Files:** `CodeModeStep1.tsx:146`, `CodeModeStep2.tsx:122`, `CodeModeStep4.tsx:488`; multiple occurrences
**WCAG:** 1.4.3 Contrast (Level AA)

Multiple section labels use `text-[10px] font-bold text-slate-400` (the `text-slate-400` color is approximately `#94a3b8`, giving approximately 2.54:1 contrast on white). At 10px, even bold text does not qualify as "large text" (which requires 18px normal or 14px bold at CSS pixel size). WCAG requires 4.5:1 for normal text.

Additionally, `text-[9px]` appears in `CodeModeStep4.tsx:488` for the evidence class badge label — this is even smaller.

This is a systemic pattern across the Step components (confirmed by L5 finding L1). It is HIGH in this surface specifically because these labels introduce clinical decision category context ("CT Head Result", "Treatment Decision", "Labs") that clinicians must read quickly.

**Status relative to L5 baseline:** STILL OPEN (identified as L1 in L5 audit as LOW; raising to MEDIUM here given the clinical context labels involved).

**Required fix:** Replace `text-slate-400` with `text-slate-500` (#64748b, approximately 4.6:1) or `text-slate-600` on all clinical label text. The smallest acceptable size at 4.5:1 is `text-xs` (12px) with `text-slate-500`.

---

## F. Touch targets

### F-1 — HemorrhageProtocolModal and TpaReversalProtocolModal close button: 32×32px (MEDIUM)

**Files:**
- `src/components/article/stroke/HemorrhageProtocolModal.tsx:86–93`
- `src/components/article/stroke/TpaReversalProtocolModal.tsx:95–102`
- `src/components/article/stroke/OrolingualEdemaProtocolModal.tsx:97–104`
**WCAG:** 2.5.5 Target Size (Level AA)

The close buttons in these three modals use `w-8 h-8` (32×32px) — below the 44×44px minimum. These are emergency-critical modals opened during active stroke codes; clinicians may be wearing gloves or using the device with impaired fine motor control.

**Required fix:** Change to `w-11 h-11` (44×44px) or add padding to expand the tap target to at least 44×44px.

---

### F-2 — ThrombolysisEligibilityModal info-icon buttons: approximately 24×24px tap target (HIGH)

**File:** `src/components/article/stroke/ThrombolysisEligibilityModal.tsx:283–289`
**WCAG:** 2.5.5 Target Size (Level AA)

The chip info-icon buttons (`px-2 flex items-center shrink-0`) at lines 283–289 render an `Info` icon at `w-3.5 h-3.5` (14px) with `px-2` padding on each side — approximately 28px total width, 52px height. Width is below the 44px minimum. The `px-2` padding brings it to roughly 28px wide — insufficient.

**Required fix:** Increase to `px-3 py-3` or set `min-w-[44px]` on the info button container.

---

### F-3 — NihssCalculatorEmbed Copy and Reset buttons: approximately 30×30px tap target (MEDIUM)

**File:** `src/components/article/stroke/NihssCalculatorEmbed.tsx:180–196`
**WCAG:** 2.5.5 Target Size (Level AA)

The Copy (`p-1.5`) and Reset (`p-1.5`) icon buttons render at approximately 30×30px including padding. Below the 44×44px minimum.

**Required fix:** Change to `p-2.5` or add `min-h-[44px] min-w-[44px]`.

---

### F-4 — LKWTimePicker "Change" link button: below 44px minimum (LOW)

**File:** `src/components/article/stroke/CodeModeStep1.tsx:159–164`
**WCAG:** 2.5.5 Target Size (Level AA)

The "Change" button at line 159 is styled as `text-xs text-slate-400 hover:text-slate-600` with no padding. Its tap target is approximately 14px × 20px.

**Required fix:** Add `min-h-[44px] px-2` or at minimum `py-2` to expand the tap target.

---

## G. Form validation feedback

### G-1 — CodeModeStep1 "Still needed" disabled CTA: validation state communicated only via button text (MEDIUM)

**File:** `src/components/article/stroke/CodeModeStep1.tsx:411–419`
**WCAG:** 3.3.1 Error Identification (Level A); 4.1.3 Status Messages (Level AA)

When the form is incomplete, the CTA button at lines 411–419 displays `"Still needed: LKW time · NIHSS · BP"` inside the button. This is a partial solution — the user can read the missing fields. However:

1. The missing fields are never announced to screen readers as they change — there is no `aria-live` region that announces when fields become incomplete or complete.
2. The field inputs themselves have no `aria-invalid="true"` or `aria-describedby` connecting them to the error message.
3. The `disabled` state on the button alone does not tell screen reader users what the problem is.

**Required fix:**
- Add `aria-live="polite"` to a region near the button that updates with the `missingFields` text when validation state changes.
- Add `aria-invalid={systolicBP <= 0}` to blood pressure inputs and `aria-describedby` pointing to an error message.

---

### G-2 — LKWTimePicker sleep onset wake-time validation error: not announced to screen readers (MEDIUM)

**File:** `src/components/article/stroke/LKWTimePicker.tsx:537–542`
**WCAG:** 3.3.1 Error Identification (Level A)

The `sleepError` state at lines 537–542 renders a `<p>` element with red text when validation fails (wake-up time before bedtime, or in the future). This error is not in an `aria-live` region. Screen reader users will not hear the error message when it appears unless they navigate to that area.

**Required fix:** Change the error `<p>` to use `role="alert"` (which creates an implicit `aria-live="assertive"` region and forces immediate announcement):
```tsx
{sleepError && (
  <p role="alert" className="mx-4 mb-2 text-xs text-red-600 …">
    {sleepError}
  </p>
)}
```

---

### G-3 — VitalsInputV2 BP inputs: no aria-describedby for inline error/alert content (MEDIUM)

**File:** `src/components/article/stroke/VitalsInputV2.tsx:159–196`
**WCAG:** 3.3.1 Error Identification (Level A)

When `isBPElevated` is true, a red/orange alert box appears below the BP inputs. The inputs themselves have no `aria-invalid="true"` or `aria-describedby` pointing to the alert. Screen reader users who are focused on the input will not discover the alert unless they navigate away.

**Required fix:** Add `aria-invalid={isBPElevated}` to both BP inputs, and `aria-describedby="bp-alert-text"` pointing to an `id="bp-alert-text"` on the alert paragraph.

---

## H. L5 baseline reconciliation

The following are the 7 HIGH-priority findings from `docs/L5-accessibility-audit.md` (2026-05-13) that are in Stroke Code scope. Status is assessed from the code reviewed in this audit.

| L5 ID | L5 Finding | This audit status |
|-------|------------|-------------------|
| H1 | ThrombectomyPathwayModal — no role="dialog", aria-modal, aria-labelledby, no focus trap | **STILL OPEN** — no change since L5. See B-1. |
| H2 | ThrombolysisEligibilityModal chip buttons — focus-visible ring suppressed | **STILL OPEN** — `focus-visible:outline-none` unchanged. See C-1. |
| H3 | Pathway pages — no aria-live result region | **OUT OF SCOPE** — MigrainePathway/GCAPathway/SE/ElanPathway are not in this surface. StrokeBasicsWorkflowV2 does have `role="status"` on the clinical context bar (line 347); no equivalent for the tab panel content changes. Partial gap. |
| H4 | MigrainePathway/GCAPathway favorite star button — no aria-label | **OUT OF SCOPE** — not in Stroke Code surface. |
| H5 | StrokeBasicsWorkflowV2 mode-toggle and tabs — invalid ARIA | **STILL OPEN** — Code/Study uses `aria-checked` on plain button (no role); tab bar has `focus:outline-none` with no ring and no role="tab". See A-3 and A-4. |
| H6 | LKWTimePicker scroll drum — keyboard inaccessible | **STILL OPEN** — no keyboard support added. See A-1. |
| H7 | FeedbackModal — focus trap + aria-modal | **OUT OF SCOPE** — FeedbackModal is not in Stroke Code surface. |

**In-scope L5 HIGH items still open: 4 of 4 in-scope items** (H1, H2, H5, H6 are all unresolved).

Additional L5 Medium finding in scope:
- **M8** (CalendarGrid CSS grid vs semantic table): **STILL OPEN** — see D-3.

---

## I. Triage punch list (sorted by severity)

**BLOCKER**
- A-1: LKWTimePicker ScrollCol drum — keyboard inaccessible — `LKWTimePicker.tsx:87–115`
- A-2: AnalogClockPicker clock face — mouse-drag-only, no keyboard path — `AnalogClockPicker.tsx:180–183`
- B-1: ThrombectomyPathwayModal — no role="dialog", no focus trap, no focus-on-open — `ThrombectomyPathwayModal.tsx:44–79`
- B-2: NIHSS Calculator inline modal — no role="dialog", no aria-modal, no focus trap — `StrokeBasicsWorkflowV2.tsx:703–722`

**HIGH**
- A-3: Code/Study toggle — aria-checked on bare button (no role) — `StrokeBasicsWorkflowV2.tsx:296–319`
- A-4: Vitals/Imaging/Summary tab bar — no role="tab", aria-selected, focus ring suppressed — `StrokeBasicsWorkflowV2.tsx:324–342`
- B-3: ThrombolysisEligibilityModal — no focus-on-open, no Tab-cycle trap — `ThrombolysisEligibilityModal.tsx`
- B-4: DeepLearningModal — no role="dialog", no focus trap — `DeepLearningModal.tsx:134–139`
- C-1: ThrombolysisEligibilityModal chip buttons — focus-visible ring suppressed (safety-critical) — `ThrombolysisEligibilityModal.tsx:275–415`
- C-2: ThrombolysisEligibilityModal chip buttons — no aria-pressed state — `ThrombolysisEligibilityModal.tsx:275–415`
- C-3: NihssCalculatorEmbed score display — no aria-live announcement — `NihssCalculatorEmbed.tsx:86–94`
- C-7: CodeModeStep2 CT Result radio group — custom radio pattern, no ARIA semantics — `CodeModeStep2.tsx:137–169` (and Treatment Decision at 242–268)
- C-8: CodeModeStep4 rationale button nested inside `<label>` — unpredictable interaction — `CodeModeStep4.tsx:504–530`
- D-1: CodeModeStep1 LKW time display button — no accessible label for time value — `CodeModeStep1.tsx:149–155`
- E-1: WindowBadge — color-only status conveyor for urgency dot — `CodeModeStep1.tsx:131–138`
- E-4: `text-[10px] text-slate-400` clinical labels — 2.54:1 contrast (fails 4.5:1) — multiple Step files
- F-2: ThrombolysisEligibilityModal info-icon buttons — approximately 28px tap target — `ThrombolysisEligibilityModal.tsx:283–289`

**MEDIUM**
- A-5: CalendarGrid month navigation — icon-only buttons, no aria-label — `LKWTimePicker.tsx:156–174`
- A-6: CalendarGrid date cells — no full-date aria-label — `LKWTimePicker.tsx:192–210`
- A-7: LKWTimePicker — no Escape-to-close keyboard path — `LKWTimePicker.tsx:546–553`
- A-8: SleepTimeRow day offset pills — no aria-pressed state — `LKWTimePicker.tsx:252–267`
- B-5: HemorrhageProtocolModal, TpaReversalProtocolModal, OrolingualEdemaProtocolModal — Tab-cycle not trapped — all three files
- C-4: NihssCalculatorEmbed Rapid/Detailed toggle — no aria-pressed — `NihssCalculatorEmbed.tsx:156–177`
- C-5: NihssCalculatorEmbed Copy and Reset — icon-only, no aria-label — `NihssCalculatorEmbed.tsx:180–196`
- C-6: Clinical context bar — unlabeled key-value pairs in status region — `StrokeBasicsWorkflowV2.tsx:347–380`
- C-9: EligibilityCheckerV2 time inputs — no label association, no AM/PM aria-pressed — `EligibilityCheckerV2.tsx:125–168`
- C-10: LVOScreenerV2 Yes/No buttons — no aria-pressed state — `LVOScreenerV2.tsx:135–160`
- C-11: VitalsInputV2 BP inputs — no aria-label for systolic/diastolic split — `VitalsInputV2.tsx:156–169`
- D-3: LKWTimePicker CalendarGrid — CSS grid instead of semantic table — `LKWTimePicker.tsx:178–210`
- E-2: Thrombectomy recommendation card — slide-in animation, no prefers-reduced-motion guard — `StrokeBasicsWorkflowV2.tsx:613`
- E-3: EligibilityCheckerV2 status icon — emoji used as status indicator — `EligibilityCheckerV2.tsx:73–94`
- F-1: HemorrhageProtocolModal, TpaReversalProtocolModal, OrolingualEdemaProtocolModal close buttons — 32×32px, below 44px minimum — three files
- F-3: NihssCalculatorEmbed Copy and Reset — approximately 30×30px tap target — `NihssCalculatorEmbed.tsx:180–196`
- G-1: CodeModeStep1 validation state — missing fields not announced to screen readers — `CodeModeStep1.tsx:411–419`
- G-2: LKWTimePicker sleep error — no aria-live announcement — `LKWTimePicker.tsx:537–542`
- G-3: VitalsInputV2 BP alert — no aria-invalid, no aria-describedby — `VitalsInputV2.tsx:159–196`

**LOW**
- A-5 (secondary): StrokeBasicsLayout mobile overlay backdrop — no Escape-to-close — `StrokeBasicsLayout.tsx:119–143`
- C-12: CodeModeStep4 category divs — no role="group" or aria-labelledby — `CodeModeStep4.tsx:481–494`
- D-2: Emergency protocol buttons — generic label, no aria-haspopup="dialog" — `StrokeBasicsWorkflowV2.tsx:654–675`
- D-4: StudyPearlsButton — no aria-haspopup or context — `StrokeBasicsWorkflowV2.tsx:142–152`
- D-5: Milestone status badges — emoji tick character, no structured label — `CodeModeStep3.tsx:280–305`
- F-4: CodeModeStep1 "Change" button — approximately 14×20px tap target — `CodeModeStep1.tsx:159–164`

---

## J. Summary stats

- **Total findings:** 38
- **BLOCKER:** 4
- **HIGH:** 14
- **MEDIUM:** 17
- **LOW:** 6 (including secondary items)
- **L5 baseline items still open (in-scope):** 4 of 4 (H1, H2, H5, H6 — all four Stroke Code-scoped L5 HIGH items remain unresolved)
- **Files inspected:** 20

### Notable positives since L5 audit

- `ThrombolysisEligibilityModal` now has `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, and Escape-to-close (partial resolution of L5 H2 and related).
- `HemorrhageProtocolModal`, `TpaReversalProtocolModal`, `OrolingualEdemaProtocolModal` all implement `role="dialog"`, `aria-modal`, `aria-labelledby`, `aria-describedby`, Escape-to-close, focus-on-open via `closeButtonRef`, and return-focus-on-close — strong modal implementation (Tab-cycle trap is the only gap).
- Clinical context bar uses `role="status"` with `aria-label`.
- Toast notifications use `role="status" aria-live="polite"`.
- Emergency protocol buttons meet 44px minimum height.
- LKWTimePicker close button has `focus-visible:ring-2`.
