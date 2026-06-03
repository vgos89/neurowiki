# Accessibility Re-Audit — NeuroWiki Pathway Surfaces
**Date:** 2026-06-03
**Auditor:** accessibility-specialist (claude-sonnet-4-6)
**Scope:** Fresh WCAG 2.1 AA re-audit of pathway surfaces; supersedes stale findings from `docs/L5-accessibility-audit.md` (2026-05-13) for the surfaces listed below.
**Audit type:** Manual code review (read-only). No source files modified.
**WCAG target:** Level AA

---

## Files audited

| File | Lines read | Notes |
|---|---|---|
| `src/pages/MigrainePathway.tsx` | 1–890 / 1590 | Truncated — result rendering after step 4 not reached |
| `src/pages/ClinicHeadachePathway.tsx` | 1–1068 / 1291 | Replacement for deleted `GCAPathway.tsx` |
| `src/pages/StatusEpilepticusPathway.tsx` | 1–828 (full) | — |
| `src/pages/ElanPathway.tsx` | 1–747 (full) | — |
| `src/pages/ExtendedIVTPathway.tsx` | 1–1014 / 1480 | Truncated |
| `src/pages/EvtPathway.tsx` | 1–880 / 2000 | Truncated |
| `src/pages/guide/StrokeBasicsWorkflowV2.tsx` | 1–1064 (full) | — |
| `src/components/article/stroke/LKWTimePicker.tsx` | 1–1217 (full) | — |

---

## Resolved findings from old audit (2026-05-13)

The following old findings are confirmed RESOLVED as of this re-audit:

| Old ID | Description | Resolution |
|---|---|---|
| H1 | Modal focus trap missing | `useModalFocusTrap` hook present throughout. RESOLVED. |
| H2 | Modal dialog missing `role="dialog"` / `aria-modal` | All inspected modals have correct attributes. RESOLVED. |
| H5 | Code/Study toggle and Vitals/Imaging/Summary tabs — incorrect ARIA | `StrokeBasicsWorkflowV2.tsx` uses `role="radiogroup"` + `role="radio"` + `aria-checked` for toggle; correct `role="tablist"`/`role="tab"` for tabs. RESOLVED. |
| H6 | LKWTimePicker scroll columns not keyboard operable | `ScrollCol` now has `role="listbox"`, `aria-activedescendant`, `role="option"`, `aria-selected`, full keyboard handler. SUBSTANTIALLY RESOLVED (see RH9 for residual). |
| H7 | Modal keyboard (Escape to close) missing | All modals use `useModalFocusTrap` which handles Escape. RESOLVED. |

---

## Open findings

### RH1 — MigrainePathway: No aria-live region around recommendation output
**File:** `src/pages/MigrainePathway.tsx`
**Approximate line:** ~697–702 (red-flag result div); further recommendation content beyond line 890 (not reached)
**WCAG criterion:** 4.1.3 Status Messages (Level AA)
**Status vs old audit:** Old H3 referenced `GCAPathway.tsx` (deleted). Equivalent gap now confirmed in `MigrainePathway.tsx`. Still open.

**Current state (line 697–702):**
```tsx
{Object.values(redFlags).some(v => v) ? (
  <div className="mt-4 p-5 bg-red-600 text-white rounded-xl shadow-lg text-center">
    <AlertTriangle size={28} className="mx-auto mb-2" />
    <h2 className="text-lg font-black mb-1">STOP: Red Flag Headache</h2>
    <p className="text-sm opacity-90">Do not proceed with migraine pathway...</p>
  </div>
) : (
```

**Expected state:** Wrap the conditionally-rendered result/recommendation block in `<div role="status" aria-live="polite" aria-atomic="true">`. The red-flag alert (`bg-red-600`) is safety-critical and should use `role="alert"` (assertive) rather than `role="status"` (polite).

**Impact:** Screen reader users do not hear the recommendation when it appears after answering questions. A clinician using a screen reader completes the pathway and receives no output.

**Fix complexity:** S — add wrapper div with ARIA attributes around the dynamic result sections.

---

### RH2 — MigrainePathway: SafetyToggle button missing `aria-pressed`
**File:** `src/pages/MigrainePathway.tsx`
**Line:** 522–534
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)
**Status vs old audit:** New finding — not in old audit.

**Current state:**
```tsx
const SafetyToggle = ({ label, active, onClick }: { label: string, active: boolean, onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`...${active ? 'bg-red-100 text-red-800 border-red-200' : 'bg-white text-slate-500...'}`}
  >
    {label}
  </button>
);
```

**Expected state:**
```tsx
<button
  type="button"
  onClick={onClick}
  aria-pressed={active}
  className={...}
>
```

**Impact:** Toggle state (active/inactive) is communicated only through color. Screen readers announce this as a plain button with no indication of whether it is pressed/selected.

**Fix complexity:** S — add `aria-pressed={active}` to the button element.

---

### RH3 — MigrainePathway: Red-flag checkbox buttons missing `role="checkbox"` / `aria-checked`
**File:** `src/pages/MigrainePathway.tsx`
**Line:** 683–693
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)
**Status vs old audit:** New finding — not in old audit.

**Current state:**
```tsx
<button
  key={key}
  onClick={() => setRedFlags({...redFlags, [key]: !redFlags[key as keyof RedFlags]})}
  className={`...${redFlags[key as keyof RedFlags] ? 'bg-red-100 border-red-300 text-red-900' : 'bg-slate-50...'}`}
>
  <span className="font-medium text-sm">{labels[key]}</span>
  <div className={`w-5 h-5 rounded border... ${redFlags[key] ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>
    {redFlags[key] && <Check size={14} className="text-white" />}
  </div>
</button>
```

**Expected state:** These controls are checkboxes semantically (multi-select, independent toggles). Either:
- Use `<input type="checkbox">` with a `<label>` wrapping the visual content, OR
- Add `role="checkbox"` and `aria-checked={redFlags[key]}` to the `<button>`, and wrap the group in `role="group"` with `aria-labelledby` referencing the section heading.

**Impact:** Critical — red-flag screening is safety-critical. Screen reader announces each item as "button" with no checked/unchecked state. A visually impaired clinician cannot determine which red flags they have selected.

**Fix complexity:** S — add `role="checkbox" aria-checked={redFlags[key as keyof RedFlags]}` to each button. Also add `role="group"` wrapper with `aria-labelledby`.

---

### RH4 — ClinicHeadachePathway: Result section dynamically inserted with no aria-live wrapper
**File:** `src/pages/ClinicHeadachePathway.tsx`
**Line:** 695–696
**WCAG criterion:** 4.1.3 Status Messages (Level AA)
**Status vs old audit:** Old H3 referenced the now-deleted `GCAPathway.tsx`. The equivalent gap is confirmed in `ClinicHeadachePathway.tsx` (the current file containing headache pathway logic). Still open.

**Current state:**
```tsx
{step4Complete && topMatch && !redFlagActive && (
  <section aria-labelledby="management-heading" className="mt-8 space-y-4">
    <h2 id="management-heading" ...>Result</h2>
    {/* result content */}
  </section>
)}
```

**Expected state:** Outer container should add `role="status" aria-live="polite" aria-atomic="true"` so the section's appearance (when `step4Complete` flips) is announced:
```tsx
<div role="status" aria-live="polite" aria-atomic="true">
  {step4Complete && topMatch && !redFlagActive && (
    <section ...>
```

**Impact:** The diagnostic classification result (e.g. "Features consistent with Migraine without Aura") appears silently for screen reader users after they complete all four steps.

**Fix complexity:** S — add aria-live wrapper around the conditional result `<section>`.

---

### RH5 — ClinicHeadachePathway: Differential ranking progressbars missing `aria-label`
**File:** `src/pages/ClinicHeadachePathway.tsx`
**Line:** 809–815
**WCAG criterion:** 4.1.2 Name, Role, Value (Level AA)
**Status vs old audit:** New finding — not in old audit.

**Current state:**
```tsx
<div
  role="progressbar"
  aria-valuenow={p}
  aria-valuemin={0}
  aria-valuemax={100}
  className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
>
```

**Expected state:**
```tsx
<div
  role="progressbar"
  aria-valuenow={p}
  aria-valuemin={0}
  aria-valuemax={100}
  aria-label={`${m.name} criteria match: ${p} percent`}
  className="h-1.5 bg-slate-100 rounded-full overflow-hidden"
>
```

Note: The primary result progressbar (line ~750) correctly has `aria-label`. The differential ranking progressbars in the secondary list do not.

**Impact:** Screen readers announce "progressbar, value 47" with no context for which diagnosis the bar represents.

**Fix complexity:** S — add `aria-label` referencing the diagnosis name and percentage.

---

### RH6 — ElanPathway: Star (favorite) button missing `aria-label` and `aria-pressed`
**File:** `src/pages/ElanPathway.tsx`
**Line:** 289–294
**WCAG criterion:** 4.1.2 Name, Role, Value (Level A)
**Status vs old audit:** Old H4, still open. Not fixed in the 2026-05-17 modal-focus pass.

**Current state:**
```tsx
<button onClick={handleFavToggle} className="p-3 rounded-full hover:bg-slate-100 transition-colors">
  <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} />
</button>
```

**Expected state:**
```tsx
<button
  onClick={handleFavToggle}
  aria-pressed={isFav}
  aria-label={isFav ? 'Remove from favorites' : 'Add to favorites'}
  className="p-3 rounded-full hover:bg-slate-100 transition-colors"
>
  <Star size={24} className={isFav ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'} aria-hidden="true" />
</button>
```

**Impact:** Icon-only button. Screen reader announces "button" with no name and no state. `StrokeBasicsWorkflowV2.tsx` (line 158–177) implements this pattern correctly — `ElanPathway.tsx` is inconsistent with the established pattern.

**Fix complexity:** S — add `aria-pressed={isFav}`, `aria-label`, and `aria-hidden="true"` on `<Star>`.

---

### RH7 — StatusEpilepticusPathway: Weight input label not associated via `htmlFor`/`id`
**File:** `src/pages/StatusEpilepticusPathway.tsx`
**Line:** 299–309
**WCAG criterion:** 1.3.1 Info and Relationships (Level A); 2.4.6 Headings and Labels (Level AA)
**Status vs old audit:** New finding — not in old audit.

**Current state:**
```tsx
<label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Patient Weight (kg)</label>
<input
  type="text"
  inputMode="decimal"
  className="w-32 p-3..."
  value={patient.weight || ''}
  onChange={...}
  placeholder="kg"
  min="0"
/>
```

**Expected state:**
```tsx
<label htmlFor="patient-weight" className="...">Patient Weight (kg)</label>
<input
  id="patient-weight"
  type="number"
  inputMode="decimal"
  ...
/>
```

**Impact:** Screen readers do not associate the visible label "Patient Weight (kg)" with the input field. When focus lands on the input, only "edit text" is announced (no label). Weight drives all dose calculations — if a clinician misunderstands which field they are editing, incorrect weight entry could produce a dangerous dose.

**Fix complexity:** S — add matching `htmlFor`/`id` pair.

---

### RH8 — StatusEpilepticusPathway: Stage 3 (Refractory) dose result row missing aria-live
**File:** `src/pages/StatusEpilepticusPathway.tsx`
**Line:** 744–754
**WCAG criterion:** 4.1.3 Status Messages (Level AA)
**Status vs old audit:** Old H3 (dose result announcement) was partially addressed — Stage 2 dose row (line 623–635) was fixed with `role="status" aria-live="polite" aria-atomic="true"`. Stage 3 dose row was not fixed and is inconsistent. Still open.

**Current state (Stage 3 — line 744–754):**
```tsx
{stage3Agent && (
  <div className="border-t border-b border-slate-200 px-5 py-3 -mx-5 my-2 animate-in zoom-in-95">
    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Calculated Load</div>
    <div className="flex items-center justify-between gap-3 mt-1">
      <span className="text-sm text-slate-600">{stage3Agent...}</span>
      <span className="text-base font-mono font-semibold text-slate-900">{calculateDose(stage3Agent, patient.weight)}</span>
    </div>
    <div className="text-[10px] text-slate-400 mt-1">Computed from {patient.weight} kg patient</div>
  </div>
)}
```

**Reference (Stage 2 — correctly fixed, line 623–635):**
```tsx
<div
  className="border-t border-b border-slate-200 px-5 py-3 -mx-5 my-2"
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
```

**Expected state:** Add `role="status" aria-live="polite" aria-atomic="true"` to the Stage 3 dose result `<div>` to match Stage 2.

**Impact:** In a status epilepticus resuscitation, computed drug doses are safety-critical. Screen reader users selecting a Stage 3 agent hear no dose announcement — they must manually navigate back to find the computed value.

**Fix complexity:** S — add three attributes to the existing `<div>`.

---

### RH9 — LKWTimePicker: Mobile date accordion button missing `aria-expanded`
**File:** `src/components/article/stroke/LKWTimePicker.tsx`
**Line:** 1106–1119
**WCAG criterion:** 4.1.2 Name, Role, Value (Level AA)
**Status vs old audit:** Old H6 (scroll column keyboard) is substantially resolved. This is a new, related finding in the same component — the mobile date accordion toggle.

**Current state:**
```tsx
<button
  type="button"
  onClick={() => setDateExpanded(x => !x)}
  className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50..."
>
  <div className="flex items-center gap-2">
    <span className="text-xs font-bold...">Date</span>
    <span className="text-sm font-semibold...">{dateLabelShort}</span>
  </div>
  {dateExpanded ? <ChevronUp .../> : <ChevronDown .../>}
</button>
```

**Expected state:**
```tsx
<button
  type="button"
  onClick={() => setDateExpanded(x => !x)}
  aria-expanded={dateExpanded}
  aria-controls="date-calendar-panel"
  className="..."
>
  ...
</button>
{dateExpanded && (
  <div id="date-calendar-panel" className="px-4 pb-4 overflow-y-auto">
    <CalendarGrid {...calendarProps} />
  </div>
)}
```

**Impact:** Screen readers cannot determine whether the date calendar is expanded or collapsed without visually inspecting the chevron icon. The chevrons are not `aria-hidden`, compounding the issue.

**Fix complexity:** S — add `aria-expanded={dateExpanded}` and `aria-controls` referencing a panel `id`.

---

## Pattern gap — PathwayHeader star button (shared component, not directly audited)

Several pathways (`ExtendedIVTPathway.tsx`, `EvtPathway.tsx`, others) delegate the favorite star to a shared `PathwayHeader` component via `isFav` / `onFavToggle` props. This component was not directly audited in this pass.

If `PathwayHeader` has the same gap as `ElanPathway.tsx` (RH6) — i.e., missing `aria-label` and `aria-pressed` — then all pathways using `PathwayHeader` share the same defect. Recommend auditing `PathwayHeader` as part of the RH6 fix batch; a single fix propagates to all consumers.

**Action required:** Read `src/components/` for `PathwayHeader` before marking RH6 as resolved.

---

## Summary table

| ID | File | WCAG | Criterion | Complexity | Status vs old audit |
|---|---|---|---|---|---|
| RH1 | MigrainePathway.tsx ~697 | 4.1.3 | Status Messages — no aria-live on result | S | H3 variant — still open |
| RH2 | MigrainePathway.tsx 522 | 4.1.2 | Name, Role, Value — SafetyToggle missing aria-pressed | S | New |
| RH3 | MigrainePathway.tsx 683 | 4.1.2 | Name, Role, Value — red-flag buttons missing role=checkbox/aria-checked | S | New |
| RH4 | ClinicHeadachePathway.tsx 695 | 4.1.3 | Status Messages — no aria-live on diagnostic result | S | H3 variant (file renamed) — still open |
| RH5 | ClinicHeadachePathway.tsx 809 | 4.1.2 | Name, Role, Value — differential progressbars missing aria-label | S | New |
| RH6 | ElanPathway.tsx 289 | 4.1.2 | Name, Role, Value — star button missing aria-label + aria-pressed | S | H4 — still open |
| RH7 | StatusEpilepticusPathway.tsx 299 | 1.3.1 | Info and Relationships — weight label not associated to input | S | New |
| RH8 | StatusEpilepticusPathway.tsx 744 | 4.1.3 | Status Messages — Stage 3 dose row missing aria-live | S | H3 partially fixed (Stage 2 fixed, Stage 3 not) — still open |
| RH9 | LKWTimePicker.tsx 1106 | 4.1.2 | Name, Role, Value — date accordion missing aria-expanded | S | New (H6 residual) |

All 9 findings have fix complexity S (small — ≤5 lines per finding, attribute additions only, no logic changes).

---

## Recommended batches

### Batch A — Safety-critical dose and toggle state (ship first)
Findings: **RH7, RH8, RH3**

Rationale: These three touch drug-dose display and safety-critical flag state in a resuscitation pathway. RH7 (weight label) and RH8 (Stage 3 dose aria-live) are in `StatusEpilepticusPathway.tsx` — ship together. RH3 (red-flag checkboxes in MigrainePathway) is safety-critical screening. All three are S-complexity attribute additions with no behavior change.

Files touched: `src/pages/StatusEpilepticusPathway.tsx`, `src/pages/MigrainePathway.tsx`

### Batch B — Result announcement across headache pathways
Findings: **RH1, RH4, RH5**

Rationale: All three are in the headache pathway pair (MigrainePathway, ClinicHeadachePathway) and share the same pattern defect — dynamic content appearing without aria-live. Group into one PR for consistency review.

Files touched: `src/pages/MigrainePathway.tsx`, `src/pages/ClinicHeadachePathway.tsx`

### Batch C — Star button and toggle state (shared pattern)
Findings: **RH2, RH6**

Rationale: RH2 (SafetyToggle aria-pressed in MigrainePathway) and RH6 (star button in ElanPathway) are both missing `aria-pressed`. Audit `PathwayHeader` first — if the gap exists there too, fix in the shared component and propagate. One PR fixes the pattern across all consumers.

Files touched: `src/pages/ElanPathway.tsx`, `src/pages/MigrainePathway.tsx`, and potentially a shared `PathwayHeader` component.

### Batch D — LKWTimePicker accordion (lowest risk, isolated)
Findings: **RH9**

Rationale: Isolated to one component, no clinical logic. Ship last or combine with next LKWTimePicker maintenance PR.

Files touched: `src/components/article/stroke/LKWTimePicker.tsx`

---

## Executive summary

Of the seven high-priority findings in the 2026-05-13 audit (H1–H7), five are fully resolved (H1, H2, H5, H6-substantially, H7) following the 2026-05-17 focus-trap and ARIA pattern pass. The remaining old high-priority finding (H3, dose result announcement) is partially resolved — Stage 2 in the Status Epilepticus pathway was fixed, but Stage 3 was not (now RH8). The old H4 (ElanPathway star button) remains open (now RH6).

This re-audit identified 9 open findings total: the 2 carry-forwards (RH6, RH8) plus 7 new findings (RH1–RH5, RH7, RH9) discovered by reading current file state. All 9 are small fixes (attribute additions only, S complexity), with no logic or behavior changes required. Three are safety-adjacent: RH3 (red-flag checkbox state), RH7 (weight input label for dose calculation), and RH8 (Stage 3 drug dose announcement in a resuscitation pathway). These three should ship first. The remaining 6 affect discoverability and result announcement but do not block core pathway operation.
