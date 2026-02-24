# NeuroWiki — Stroke Code Workflow UI/UX & Performance Audit
**Date:** 2026-02-24
**Auditor:** Claude Sonnet
**Scope:** `/guide/stroke-basics` → `StrokeBasicsWorkflowV2` + all child components
**Mode:** Read-only analysis — no code was modified during this audit

---

## Executive Summary

The stroke code workflow is a clinically sophisticated, well-architected tool. The dual Code/Study mode design, GWTG milestone tracking, and evidence-rich orders panel are genuine differentiators. However, the audit uncovered **5 functional bugs** (including one that silently discards all GWTG milestone data), **4 high-priority UX issues** with direct patient safety implications, and **10+ medium/low issues** spanning design consistency, DRY violations, and missing Polish. Critical fixes should ship before this tool is used in a live stroke code.

---

## Phase 1 — User Flow Map

### Entry Points
| Route | How reached |
|-------|-------------|
| `/guide/stroke-basics` | Sidebar → Vascular Neurology → Stroke Code Basics |
| `/guide/stroke-basics` | Homepage featured tool |
| `/guide/stroke-basics` | Deep link from clinical calculators |

### Journey A — Active Stroke Code (CODE MODE)
```
Page load → CODE MODE (default)
  → Card 1 active

[Card 1: LKW & Vitals]
  → Tap LKW button → LKWTimePicker modal opens
     → Set date/time → Confirm → lkwDate saved → lkwHours calculated
  → Enter NIHSS (type OR tap "Calc" → NihssCalculatorEmbed modal)
  → Enter BP / Glucose / Weight
  → If BP > 185/110: Labetalol/Nicardipine inline guidance + "BP being controlled" checkbox
  → If glucose < 50: hypoglycemia guidance inline
  → If NIHSS 1–5 within 4.5h: "Disabling symptoms" checklist appears
  → If within 4.5h window: primary CTA = "Save & Check Eligibility →"
     → Triggers handleComplete() + openEligibility()
     → ThrombolysisEligibilityModal opens (z-[100])
  → Else: primary CTA = "Save →"
  → After save → Clinical Context Bar appears (NIHSS / BP / Glucose / LKW / window badge)

[Card 2: CT & Treatment]
  → "Stamp CT Read Time" button → fires DOM event → TimestampBubble records CT Read Time
  → Select CT result:
     ├─ "No acute hemorrhage" → Treatment Decision section appears
     │   → Select tPA / TNK / None
     │   → If treatment selected + no eligibility check → amber warning shown
     │   → If eligibility result = absolute contraindication → red warning shown
     │   → If eligibility result = relative contraindication → amber warning shown
     ├─ "ICH detected" → HemorrhageProtocolModal auto-opens + ICH callout shown
     └─ "Other finding" → can save directly
  → CTA & LVO Screening checkbox
     → If CTA ordered: LVO Yes/No/Pending radio
     → If LVO Yes: "EVT Pathway" button → ThrombectomyPathwayModal opens
  → Save button

[Card 3: Summary & Orders]  (if no ICH)
  → Labs & Treatment Orders (CodeModeStep4)
     → 24 order checkboxes pre-selected, grouped by category
     → Each order has "Why? Evidence & Rationale" collapsible
     → Copy to EMR / Save Orders buttons
  → Code Summary (CodeModeStep3)
     → Clinical data, milestones timeline, orders summary, EMR note preview
     → Copy to EMR / Print buttons

[Card 3: ICH Protocol]  (if ICH)
  → StrokeIchProtocolStep (separate protocol flow)

[Always available — FABs]
  → Bottom-right: Clock FAB (TimestampBubble)
     → Expands upward: Code Activation / Neurology Evaluation / CT Read Time stamps
  → Bottom-left: Emergency FAB (red)
     → Expands upward: tPA/TNK Reversal / Orolingual Edema buttons
  → Emergency Protocols section at page bottom (same buttons, scrollable)
```

### Journey B — Study Mode
Same 3-card flow but:
- "Clinical Pearls" button appears above each card → opens `DeepLearningModal`
- Collapsible evidence accordions appear below each card
- NIHSS modal still works; eligibility modal still works

### Journey C — ICH Pathway
```
Card 1 → Save
Card 2 → "ICH detected" → HemorrhageProtocolModal auto-opens
Card 3 → StrokeIchProtocolStep (ICH protocol, not AIS orders)
```

---

## Phase 2 — Audit Findings

---

### 🔴 CRITICAL — Functional Bugs

---

#### BUG-01: Duplicate `hba1c` Order ID Breaks Selection Logic
**File:** `src/components/article/stroke/CodeModeStep4.tsx` — Lines 82, 235
**Severity:** Critical (silent functional bug)

`ORDERS` array contains two entries with `id: 'hba1c'`:
```ts
// Line 82 — Labs category
{ id: 'hba1c', label: 'Hemoglobin A1c', category: 'labs', ... }

// Line 235 — Stroke-workup category
{ id: 'hba1c', label: 'HbA1c and fasting glucose', category: 'stroke-workup', ... }
```

**Impact:**
- `selectedOrders.includes('hba1c')` returns true for both, so toggling one entry de-selects both
- `onComplete()` will emit the label of whichever one `displayOrders.filter(o => selectedOrders.includes(o.id))` returns first
- The EMR note will have one of them duplicated or missing depending on which category renders first

**Fix:** Rename the second `id` to `'hba1c_workup'`.

---

#### BUG-02: TimestampBubble State Never Reaches GWTG Milestones
**Files:** `TimestampBubble.tsx`, `StrokeBasicsWorkflowV2.tsx`, `CodeModeStep3.tsx`
**Severity:** Critical (core feature silently broken)

`TimestampBubble` has its own **isolated local state** for the 3 timestamps it manages:
```ts
const [timestamps, setTimestamps] = useState<Record<EventName, Date | null>>({...})
```

These timestamps are **never surfaced** to `GWTGMilestones` in the parent. The only integration is a one-way DOM event for "CT Read Time" fired from `CodeModeStep2`. Meanwhile, `GWTGMilestones` has fields for `neurologistEvaluationTime`, `ctFirstImageTime`, `ctInterpretedTime`, `groinPunctureTime`, etc. — none of which are ever populated.

**Result:** The `CodeModeStep3` Milestones section will almost always display:
> *"No milestone times recorded."*

...even when the clinician has carefully stamped all events in the clock widget.

**Fix:** Lift TimestampBubble's timestamp state into the parent (or pass `setMilestones` as a prop callback) so stamps flow into `GWTGMilestones`. Map:
- "Code Activation" → `milestones.doorTime`
- "Neurology Evaluation" → `milestones.neurologistEvaluationTime`
- "CT Read Time" → `milestones.ctInterpretedTime`

---

#### BUG-03: Material Icons Dependency — Icons Will Not Render
**Files:** `CodeModeStep3.tsx` (lines 207, 382, 400, 411), `CodeModeStep4.tsx` (lines 494, 570–572)
**Severity:** Critical (invisible icons in prod if font not loaded)

Both components rely on `<span className="material-icons-outlined">icon_name</span>`, a Google Fonts icon family. If `@import url('https://fonts.googleapis.com/icon?family=Material+Icons+Outlined')` is not in the global stylesheet, these render as blank text. CLAUDE.md designates **lucide-react** as the project's icon system.

Affected icons and their lucide equivalents:

| Material Icon name | Lucide replacement |
|---|---|
| `info` | `<Info />` |
| `check_circle` | `<CheckCircle />` |
| `content_copy` | `<Copy />` |
| `check` | `<Check />` |
| `print` | `<Printer />` |
| `expand_more` / `expand_less` | `<ChevronDown />` (with `rotate-180`) |
| `water_drop` | `<Droplets />` |
| `medication` | `<Pill />` |
| `science` | `<FlaskConical />` (already imported in Step2) |
| `local_hospital` | `<Hospital />` |

---

#### BUG-04: `eligibilityChecked` Flag Has Incorrect Semantics
**File:** `CodeModeStep1.tsx` — Line 126
**Severity:** High (misleading clinical data in EMR export)

```ts
eligibilityChecked: !!onOpenEligibility,
```

This sets `eligibilityChecked: true` if the `onOpenEligibility` **prop exists** — not if the user actually opened and completed the eligibility modal. A clinician who skips eligibility on a 4.5h patient will still have `eligibilityChecked: true` in the exported GWTG note.

**Fix:** Add a local `const [eligibilityActuallyChecked, setEligibilityActuallyChecked] = useState(false)` in Step1 and set it to `true` only when the user opens and completes the eligibility modal (via the `onComplete` callback surfaced from the eligibility modal back to Card 1).

---

#### BUG-05: `lkwTime` and `timeDifferenceHours` Always Null in ThrombolysisEligibilityData
**File:** `ThrombolysisEligibilityModal.tsx` — Lines 150–153
**Severity:** High (EMR export missing data)

```ts
const handleComplete = () => {
  onComplete?.({
    lkwTime: null,            // always null
    timeDifferenceHours: null, // always null
    ...
  });
};
```

The `ThrombolysisEligibilityData` interface includes `lkwTime` and `timeDifferenceHours` for the EMR export, but the modal doesn't receive LKW data as a prop and never populates these fields.

**Fix:** Pass `lkwDate` and `lkwHours` from `CodeModeStep1` into `ThrombolysisEligibilityModal` as optional props, and populate them in `handleComplete`.

---

### 🟠 HIGH — UX Issues with Clinical Impact

---

#### HIGH-01: LKW Hours Are a Snapshot, Not Live
**File:** `CodeModeStep1.tsx` — Line 62; `StrokeBasicsWorkflowV2.tsx` — Line 294
**Severity:** High (stale clinical data during active code)

`lkwHours` is calculated once at the moment of save:
```ts
setLkwHours(Math.max(0, (now.getTime() - lkwDate.getTime()) / (1000 * 60 * 60)));
```

The Clinical Context Bar then shows `step1Data.lkwHours.toFixed(1)h ago` — a frozen snapshot. If a code runs for 30 more minutes after Step 1 is saved, the context bar still shows the original value. For clinical decision-making (tPA window), this is a meaningful discrepancy.

**Fix:** Store the `lkwDate` (a `Date` object) in `step1Data`, and compute `lkwHours` live in the Clinical Context Bar using `(new Date().getTime() - lkwDate.getTime()) / 3600000`. Re-render every 30s via `useEffect` with a `setInterval`.

---

#### HIGH-02: No State Persistence Across Refresh
**File:** `StrokeBasicsWorkflowV2.tsx` — all `useState` calls
**Severity:** High (data loss during active clinical use)

All workflow state lives in React component memory. A browser refresh, tab close, or navigation away wipes:
- LKW time, NIHSS, BP, glucose, weight
- CT result, treatment decision
- All selected orders
- GWTG milestones

For a tool that could be used during a real stroke code on a shared workstation, losing all data on refresh is a significant risk. A typical real-world scenario: nurse opens the page, enters data, browser refreshes automatically, all gone.

**Fix:** Serialize the entire workflow state to `sessionStorage` on every state change (debounced 500ms), restore on mount. Use a unique session key per page load (store in `sessionStorage` itself) so separate codes don't collide. Add a "clear session" button visible at the top.

---

#### HIGH-03: Massive Prop-Drilling in `StrokeBasicsWorkflowV2` / Dead Props
**File:** `StrokeBasicsWorkflowV2.tsx` — Lines 105–153, 200–202
**Severity:** High (performance and maintainability)

`MainContent` accepts **35+ individual props**, all passed from the top-level state. This means any state change anywhere (e.g. `toastMessage`) causes `MainContent` to re-render in full, and all lazy-loaded children via `Suspense` re-evaluate their prop equality.

Additionally, lines 201–202 explicitly suppress TypeScript unused-variable warnings for two props:
```ts
void setTimerStartTime;
void setTimerRunning;
```
These props are passed all the way down the prop chain but are never used inside `MainContent`. Dead code being taxied around at every render.

**Fix:** Extract workflow state into a `useStrokeWorkflow` custom hook or a React context provider. Consume state locally at the leaf components rather than drilling through 35 props. Remove the two unused props.

---

#### HIGH-04: 3–4.5h Extended Window Exclusions Are Not Evaluated
**File:** `ThrombolysisEligibilityModal.tsx` — Lines 56–62, 339–354
**Severity:** High (patient safety gap)

The "3–4.5h Window — Additional Exclusions" section lists 5 criteria (age >80, oral anticoagulant, NIHSS >25, diabetes + prior stroke, >1/3 MCA on imaging) as static text inside a `<details>` element. They are **not togglable chips** and do **not affect** the computed `eligibilityStatus`.

A patient who is 81 years old and within the 3–4.5h window would show `eligibilityStatus: 'eligible'` even though they are actually excluded from the extended window. The clinician would have to notice the static fine-print text themselves.

**Fix:** Add a second chip grid for the 3–4.5h exclusions (only visible when `lkwHours > 3.0`). When any are toggled, output `eligibilityStatus: 'relative-contraindication'` with a specific message. These map to `EXTENDED_WINDOW_ITEMS`.

---

### 🟡 MEDIUM — Design & Code Quality

---

#### MED-01: Red Active State on `StrokeCardGrid` — Semantic Color Conflict
**File:** `StrokeCardGrid.tsx` — Lines 88–91, 98–102, 111–113, 126–129

The active card uses `border-red-500 bg-red-50 text-red-700` with a red circle badge. In this app's color system, **red = danger/ICH**. An active (selected) state should use `neuro-*` (brand accent) to avoid the red → "ICH" association confusion at a glance during a real code.

**Fix:** Swap active state to `border-neuro-500 bg-neuro-50 text-neuro-700` and `bg-neuro-500` badge.

---

#### MED-02: `getTNKDose` Duplicated Across Two Components (DRY Violation)
**Files:** `CodeModeStep1.tsx` line 76, `CodeModeStep2.tsx` line 54

Identical function, identical thresholds, two separate copies. If TNK dosing guidelines change, both need updating.

**Fix:** Extract to `src/utils/strokeDosing.ts` and import in both components. Also consider adding the tPA formula there too.

---

#### MED-03: ThoughtBubble Arrow Uses Inline Styles (CLAUDE.md Violation)
**File:** `TimestampBubble.tsx` — Lines 32–38

```tsx
style={{
  width: 0, height: 0,
  borderTop: '6px solid transparent',
  borderBottom: '6px solid transparent',
  borderLeft: '7px solid white',
}}
```

CLAUDE.md bans inline styles except for dynamic progress bar widths. CSS triangle arrows are a special case not expressible in pure Tailwind. Options:
1. Use an SVG arrow instead (fully expressible in Tailwind)
2. Add a custom `arrow-right` utility class in `index.css`
3. Document this as an explicit exception in CLAUDE.md

---

#### MED-04: Chip Click Simultaneously Toggles and Expands in Eligibility Modal
**File:** `ThrombolysisEligibilityModal.tsx` — Lines 248–251, 313–316

Clicking a chip both **activates** the contraindication and **opens** the detail text. If a clinician clicks to *deselect* a chip, the detail stays visible — which is confusing because the action was removal, not inquiry. There's also no way to read the chip detail without activating the contraindication.

**Fix:** Separate the two interactions. Use a small `ⓘ` info icon next to each chip label to expand the detail without toggling. The main chip click should only toggle active state.

---

#### MED-05: Two Independent EMR Note Generators
**Files:** `CodeModeStep3.tsx` (GWTG full note), `CodeModeStep4.tsx` (treatment plan note)

Both generate separate clipboard-ready text. The clinician must click "Copy to EMR" twice and paste into the EMR in two separate steps. It would be better UX to have a single "Copy Full Note" button at the Card 3 level that merges both into one document.

---

#### MED-06: No "Saved" State Visual Feedback in Card Navigation
**File:** `StrokeCardGrid.tsx`, `CodeModeStep1.tsx`

After the user saves Card 1 and switches to Card 2, returning to Card 1 shows the same unfilled form (data is not persisted back into form fields). The card tab shows a summary string but the form appears blank. This could cause the user to re-enter data thinking it was lost.

The `hasData[1] = step1Data !== null` check shows a filled border on the card tab, which is subtle. A clearer "✓ Saved" badge on the card or repopulating form fields from saved data would reduce confusion.

---

#### MED-07: `window.dispatchEvent` as Integration Mechanism
**Files:** `CodeModeStep2.tsx` line 92, `TimestampBubble.tsx` line 86

```ts
window.dispatchEvent(new CustomEvent('stroke:stamp-ct-read'));
```

Using DOM events as a cross-component communication channel bypasses React's data flow, makes the system harder to test, and will silently break if either component is refactored to not be in the same window context (e.g. micro-frontends, SSR). This is the one integration between the CT stamp button and the clock widget.

**Fix:** Pass a callback prop `onCtReadStamped` from `StrokeBasicsWorkflowV2` down to both `CodeModeStep2` and `TimestampBubble`, which also resolves BUG-02.

---

#### MED-08: Emergency FAB on Desktop Placed at `bottom-4`
**File:** `TimestampBubble.tsx` — Line 117

The Emergency FAB (bottom-left) is `fixed bottom-24 md:bottom-4 left-4`. At `bottom-4` on desktop it is extremely close to the browser chrome / taskbar, and its expand-upward submenus (tPA Reversal, Orolingual Edema) will appear near the very bottom of the viewport. This is especially cramped on 1280px height screens. The Clock FAB at `md:bottom-20` has better clearance.

**Fix:** Raise Emergency FAB to `md:bottom-20` to match the clock FAB's vertical position.

---

### 🔵 LOW — Polish & Cosmetic

---

#### LOW-01: "Complete →" Button Label on Eligibility Modal
**File:** `ThrombolysisEligibilityModal.tsx` — Line 398
Label `Complete →` is vague. Prefer `Save & Return →` or `Confirm Assessment →` for clarity about what the button does.

---

#### LOW-02: CodeModeStep2 Save Button Always `bg-emerald-600`
**File:** `CodeModeStep2.tsx` — Line 371
Even when ICH is selected (danger path), the Save button is green. On the ICH path, amber or red would reinforce urgency and distinguish the emergency workflow visually.

---

#### LOW-03: `step4ModalOpen` / `setStep4ModalOpen` State Is Defined But Never Used
**File:** `StrokeBasicsWorkflowV2.tsx` — Lines 811–812, 866–869
```ts
const [step4ModalOpen, setStep4ModalOpen] = useState(false);
...
step4ModalOpen={step4ModalOpen}
setStep4ModalOpen={setStep4ModalOpen}
```
These are passed into `MainContent` as props but no `DeepLearningModal` for step 4 is ever rendered with these values. Dead state that adds cognitive overhead.

---

#### LOW-04: Clinical Context Bar Uses `emerald-600` / `amber-500` / `red-600` Hardcoded
**File:** `StrokeBasicsWorkflowV2.tsx` — Lines 301–308
These window-badge colors are written as string conditionals:
```ts
step1Data.lkwHours <= 4.5 ? 'bg-emerald-600' : step1Data.lkwHours <= 9 ? 'bg-amber-500' : 'bg-red-600'
```
Tailwind JIT purges classes it doesn't see as complete strings. These ternaries may not be picked up reliably. Prefer explicit class lists or `cn()` with full class names.

---

#### LOW-05: Missing `aria-label` on Code/Study Mode Toggle Buttons
**File:** `StrokeBasicsWorkflowV2.tsx` — Lines 227–248
The mode toggle buttons have no `aria-label`. Screen reader users will hear "CODE MODE" / "STUDY MODE" which is acceptable, but the toggle group has no `role="radiogroup"` or wrapping `<fieldset>` to announce the selection context.

---

## Phase 3 — Quick Wins Summary

Issues that take < 30 minutes each and deliver immediate value:

| # | File | Fix | Time |
|---|------|-----|------|
| Q1 | `CodeModeStep4.tsx:235` | Rename duplicate `hba1c` id to `hba1c_workup` | 2 min |
| Q2 | `CodeModeStep3.tsx` | Replace all `material-icons-outlined` spans with lucide-react components | 15 min |
| Q3 | `CodeModeStep4.tsx` | Replace all `material-icons-outlined` spans with lucide-react components | 20 min |
| Q4 | `StrokeCardGrid.tsx` | Swap red active state to `neuro-*` colors | 5 min |
| Q5 | `TimestampBubble.tsx:117` | Change `md:bottom-4` → `md:bottom-20` | 1 min |
| Q6 | `StrokeBasicsWorkflowV2.tsx:201` | Remove dead `void setTimerStartTime; void setTimerRunning;` + dead state `step4ModalOpen` | 5 min |
| Q7 | `ThrombolysisEligibilityModal.tsx:398` | Rename "Complete →" to "Save & Return →" | 1 min |
| Q8 | Extract `getTNKDose` to `src/utils/strokeDosing.ts` | Import in both Step1 and Step2 | 10 min |

---

## Recommended Fix Order

### Sprint 1 — Critical & Safety (before live use)
1. **BUG-01** — Fix duplicate `hba1c` ID
2. **BUG-02** — Wire TimestampBubble → GWTGMilestones via callbacks
3. **BUG-03** — Replace Material Icons with Lucide in Step3 + Step4
4. **HIGH-02** — Add `sessionStorage` persistence
5. **HIGH-04** — Make 3–4.5h window exclusions interactive chips

### Sprint 2 — UX Quality
6. **HIGH-01** — Live LKW hours (re-compute from stored `lkwDate`)
7. **HIGH-03** — Prop drilling refactor (custom hook or context)
8. **BUG-04 & BUG-05** — Fix `eligibilityChecked` and null `lkwTime`
9. **MED-04** — Separate chip toggle from chip detail in Eligibility modal
10. **MED-07** — Replace DOM event with callback prop

### Sprint 3 — Polish & Consistency
11. **MED-01** — Red → neuro active state on StrokeCardGrid
12. **MED-02** — Extract `getTNKDose` to shared util
13. **MED-03** — Resolve ThoughtBubble inline style (SVG or CSS class)
14. **MED-05** — Single unified "Copy Full Note" at Card 3
15. **LOW-01 to LOW-05** — Label fixes, dead state removal, accessibility

---

## Files Audited

| File | Lines | Status |
|------|-------|--------|
| `src/pages/guide/StrokeBasicsWorkflowV2.tsx` | 910 | ✅ Full read |
| `src/pages/guide/StrokeBasicsLayout.tsx` | ~150 | ✅ Structure reviewed |
| `src/components/article/stroke/CodeModeStep1.tsx` | 414 | ✅ Full read |
| `src/components/article/stroke/CodeModeStep2.tsx` | 378 | ✅ Full read |
| `src/components/article/stroke/CodeModeStep3.tsx` | 418 | ✅ Full read |
| `src/components/article/stroke/CodeModeStep4.tsx` | 586 | ✅ Full read |
| `src/components/article/stroke/ThrombolysisEligibilityModal.tsx` | 407 | ✅ Full read |
| `src/components/article/stroke/TimestampBubble.tsx` | 296 | ✅ Full read |
| `src/components/article/stroke/StrokeCardGrid.tsx` | 141 | ✅ Full read |
| `src/components/article/stroke/LKWTimePicker.tsx` | ~280 | ✅ Full read (prior session) |
| `src/App.tsx` | 174 | ✅ Routes reviewed |
| `src/config/contentStatus.ts` | 262 | ✅ Reviewed |
| `src/components/Layout.tsx` | ~830 | ✅ Structure reviewed |
| 27 remaining stroke component files | varies | 🔍 Summary review via agent |
