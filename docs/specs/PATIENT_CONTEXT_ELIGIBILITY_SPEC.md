# PATIENT_CONTEXT_ELIGIBILITY_SPEC.md — Anticoag Eligibility + mRS Redesign

**Version:** 1.0
**Status:** Draft — pending design-guardian lock
**Owner:** UI Architect
**Scope:** `PatientContextPanel.tsx` — anticoag class selector and per-class inputs, pre-stroke mRS row. Applies only when `showThrombolysisTiming={true}` (NIHSS calculator surface). All other consumers of `PatientContextPanel` (Stroke Code, EVT, ELAN) are unaffected.
**Date:** 2026-06-10

This spec governs the anatomy, tokens, show/hide rules, 375px behavior, a11y contracts, and data-claim mapping for the redesigned anticoagulant eligibility section and the refined pre-stroke mRS row inside `PatientContextPanel`. It does not govern the LKW row, BP row, glucose row, thrombolysis timing chip, or pre-existing deficits textarea — those are unchanged.

---

## §1 Design Vocabulary Constraint

**This section is the guard rail for every decision that follows.**

The panel's existing vocabulary is thin-outlined pills: `rounded-full` pill borders, `bg-neuro-50 border-neuro-200 text-neuro-700` for selected, `bg-white border-slate-200 text-slate-500` for unselected. Every new element introduced by this spec must read as the same family. Specifically:

- No segmented-toggle bars (`bg-slate-100 rounded-full p-0.5` containers wrapping pill buttons). That pattern belongs to the calculator mode-toggle (CALCULATOR_SPEC §3.1), not to patient context inputs.
- No filled heavy elements. No boxes around pill groups.
- No arbitrary Tailwind values. All tokens from the design-tokens skill and CALCULATOR_SPEC.md v1.1.
- Every selected state uses full fill: `bg-neuro-50 border-neuro-200 text-neuro-700` (or the amber caution variant below). Never border-only selected state.
- Amber caution-state pill: `bg-amber-50 border-amber-200 text-amber-700`. Used only for the three clinically adverse binary choices (DOAC `<48 h`, Warfarin `>1.7`, Heparin `>40 s`).

---

## §2 Data Model Changes

The following TypeScript changes are implied by this spec. They are documented here for the implementing engineer; the spec does not execute them.

### 2.1 Anticoag type

Remove `'none'` from the `Anticoag` union. The new set is:

```typescript
export type Anticoag = 'antiplatelet' | 'doac' | 'warfarin' | 'heparin';
```

`'heparin'` replaces the absent Heparin/LMWH class. An empty `Set<Anticoag>` is the "none selected" state.

### 2.2 Per-class sub-inputs

Add the following optional fields to `PatientContextValues`:

```typescript
doacLastDose?: '<48h' | '>=48h';        // DOAC last-dose binary
doacDrugName?: string;                  // free-text, optional, placeholder "drug, optional"
warfarinInr?: '<=1.7' | '>1.7';         // Warfarin INR binary
heparinAptt?: '<=40' | '>40';           // Heparin/LMWH aPTT binary
```

These fields are always `undefined` if the corresponding anticoag class is not in `values.anticoag`. Consumers must not read them without first checking class membership.

### 2.3 mRS range

The `MRSGrade` type remains `0 | 1 | 2 | 3 | 4 | 5 | 6`. The UI renders only grades 0 through 5 when `showThrombolysisTiming={true}` (pre-stroke baseline cannot be 6 — the patient would already be dead). Grade 6 is still present in the type for non-thrombolysis consumers; the panel simply does not render a grade-6 chip on the NIHSS surface.

---

## §3 Anticoag Class Selector Row

### 3.1 Row structure

The existing anticoag row label changes from "Anti-coag/Antiplatelet" to "Anti-coag". The four pills in the pill group change to: **Antiplatelet · DOAC · Warfarin · Heparin/LMWH**. The "None" pill is removed. The row is multi-select; there is no mutual-exclusion logic for the four classes (a patient may genuinely be on both an antiplatelet and a DOAC).

Row chrome: unchanged from the existing panel row.

```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap
```

Label:

```
text-xs font-medium text-slate-600 flex-shrink-0
```

Pill group container:

```
role="group"
aria-labelledby="anticoag-label"
className="flex items-center gap-1.5 flex-wrap"
```

### 3.2 Pill anatomy — class selector pills

Each class-selector pill is a `<button type="button">` with `aria-pressed`.

**Unselected pill:**
```
min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors
bg-white border-slate-200 text-slate-500 hover:border-slate-300
focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Selected pill (standard — Antiplatelet, DOAC, Warfarin, Heparin/LMWH when no adverse sub-input selected):**
```
min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors
bg-neuro-50 border-neuro-200 text-neuro-700
focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

Both states are identical to the existing anticoag pill token set — this row does not change appearance.

### 3.3 Pill labels

| Anticoag key | Pill label |
|---|---|
| `antiplatelet` | Antiplatelet |
| `doac` | DOAC |
| `warfarin` | Warfarin |
| `heparin` | Heparin/LMWH |

### 3.4 Show/hide of per-class rows

When a class is selected, its sub-row renders immediately below the anticoag class selector row (in DOM order, separated by the standard `divide-y divide-slate-50` hairline). When a class is deselected, its sub-row and any caution note are removed from the DOM. Multiple classes may be selected simultaneously; their sub-rows stack in the order: Antiplatelet note, DOAC row, Warfarin row, Heparin row.

---

## §4 Per-Class Sub-Rows

All sub-rows occupy the same row container as standard panel rows:

```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap
```

### 4.1 Antiplatelet — note only (no input)

No binary input. A single muted inline note renders in the row body instead of a right-side control. The note is not a caution note (amber treatment) because antiplatelet use is not a contraindication.

**Row structure:**

```
min-h-[44px] flex items-center px-4 py-2 gap-3
```

Left label:
```
text-xs font-medium text-slate-400 italic
```

Content: "Antiplatelet use is not a contraindication to IV thrombolysis."

This text is tagged `data-claim="ivt-anticoag-antiplatelet-ok"`. No amber treatment. No pill pair.

### 4.2 DOAC row

**Row left label:** "Last dose" — `text-xs font-medium text-slate-600 flex-shrink-0`

**Right side — pill pair + drug-name input:**

The right side is a `flex items-center gap-2 flex-wrap` container holding two pills and one underlined text input.

Binary pills:

```
role="group"
aria-label="DOAC last dose"
className="flex items-center gap-1.5"
```

Pill `<48 h` (caution pill when selected):

- Unselected: `min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors bg-white border-slate-200 text-slate-500 hover:border-slate-300 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none`
- Selected (caution amber): `min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors bg-amber-50 border-amber-200 text-amber-700 focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:outline-none`
- `aria-pressed={selected}`

Pill `>=48 h` (standard selected state):

- Unselected: same unselected tokens as above
- Selected (standard neuro): `min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border transition-colors bg-neuro-50 border-neuro-200 text-neuro-700 focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none`
- `aria-pressed={selected}`

Drug-name underlined input:

```
w-[96px] text-right text-sm text-slate-900 bg-transparent
border-b border-slate-200 focus:border-neuro-500 focus:outline-none
px-1 py-1 placeholder:text-slate-300
```

Placeholder: "drug, optional". `aria-label="DOAC drug name"`. No `min-h-[44px]` on the input itself — the row container provides the 44px target. `inputMode="text"`.

**Caution note — renders only when `doacLastDose === '<48h'` is selected:**

```
px-4 pt-0 pb-2
```

Inner note element:

```
border-l-2 border-amber-300 pl-3
```

Note text:

```
text-xs text-amber-700 leading-snug
```

Content: "DOAC <48h: individualize, IV thrombolysis safety unknown."

The note element carries `data-claim="ivt-anticoag-doac-48h"`, `role="status"`, `aria-live="polite"`.

### 4.3 Warfarin row

**Row left label:** "INR" — `text-xs font-medium text-slate-600 flex-shrink-0`

Binary pills:

```
role="group"
aria-label="Warfarin INR"
className="flex items-center gap-1.5"
```

Pill `<=1.7` (standard selected state):

- Selected: `bg-neuro-50 border-neuro-200 text-neuro-700` (standard tokens)
- Unselected: standard unselected tokens

Pill `>1.7` (caution amber when selected):

- Selected: `bg-amber-50 border-amber-200 text-amber-700`, `focus-visible:ring-2 focus-visible:ring-amber-400`
- Unselected: standard unselected tokens

`aria-pressed` on both pills.

**Caution note — renders only when `warfarinInr === '>1.7'`:**

```
px-4 pt-0 pb-2
```

Inner note:

```
border-l-2 border-amber-300 pl-3
```

Note text (same size/color as DOAC note):

```
text-xs text-amber-700 leading-snug
```

Content: "INR >1.7: excluded from IV thrombolysis."

The note carries `data-claim="ivt-anticoag-warfarin-inr"`, `role="status"`, `aria-live="polite"`.

### 4.4 Heparin/LMWH row

**Row left label:** "aPTT" — `text-xs font-medium text-slate-600 flex-shrink-0`

Binary pills:

```
role="group"
aria-label="Heparin aPTT"
className="flex items-center gap-1.5"
```

Pill `<=40 s` (standard selected state):

- Selected: `bg-neuro-50 border-neuro-200 text-neuro-700`
- Unselected: standard unselected tokens

Pill `>40 s` (caution amber when selected):

- Selected: `bg-amber-50 border-amber-200 text-amber-700`, `focus-visible:ring-2 focus-visible:ring-amber-400`
- Unselected: standard unselected tokens

`aria-pressed` on both pills.

**Caution note — renders only when `heparinAptt === '>40'`:**

```
px-4 pt-0 pb-2
```

Inner note:

```
border-l-2 border-amber-300 pl-3
```

Note text:

```
text-xs text-amber-700 leading-snug
```

Content: "IV heparin, aPTT >40 s: excluded from IV thrombolysis."

The note carries `data-claim="ivt-anticoag-ufh-aptt"`, `role="status"`, `aria-live="polite"`.

---

## §5 Pre-Stroke mRS Row

### 5.1 Summary of changes

- Render grades 0 through 5 only (six chips) when `showThrombolysisTiming={true}`. Grade 6 is omitted on this surface.
- Remove the modal-open interaction on the label. The left label becomes a static `<span>` element, not a button. The `(full scale)` sub-label is also removed on this surface; it existed to invoke the modal, which is no longer the primary path for this limited-grade range.
- The `MrsPickerModal` is still rendered in the DOM for the non-thrombolysis consumer path; when `showThrombolysisTiming={true}`, the label no longer opens it. The modal itself is unmodified.
- Inline circle chips remain the only control on the NIHSS surface.

### 5.2 Chip sizing

Chip size is unchanged: `w-8 h-8`. At six chips with `gap-1`, the total right-side width is approximately 6 x 32px + 5 x 4px = 212px. This fits comfortably at 375px within the panel row (approximately 164px available for label + chips on the right side after `px-4` padding).

### 5.3 Row anatomy

Left side — static label:

```
text-xs font-medium text-slate-600 flex-shrink-0
```

Content: "Pre-stroke mRS"

Right side — chip group:

```
role="group"
aria-labelledby="prestroke-mrs-label"
className="flex items-center gap-1"
```

Each chip `<button type="button">`:

```
w-8 h-8 flex items-center justify-center rounded-full text-xs font-semibold border transition-colors
focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Unselected:**
```
bg-white border-slate-200 text-slate-500 hover:border-slate-300
```

**Selected:**
```
bg-neuro-50 border-neuro-200 text-neuro-700
```

`aria-pressed={selected}`, `aria-label="Pre-stroke mRS {grade}"`.

Tapping a selected chip deselects it (sets `prestrokeMrs` back to `undefined`).

---

## §6 Show/Hide Rules

| Condition | What shows |
|---|---|
| `showThrombolysisTiming={false}` (default) | Existing behavior unchanged. Original anticoag pills (None/DOAC/Warfarin/Antiplatelet). mRS 0-6 with modal-label button. No per-class sub-rows. |
| `showThrombolysisTiming={true}` and no class selected | Anticoag row with 4 pills (Antiplatelet/DOAC/Warfarin/Heparin/LMWH). No sub-rows visible. mRS 0-5 with static label. |
| `showThrombolysisTiming={true}` and Antiplatelet selected | Antiplatelet note row renders below the class selector row. |
| `showThrombolysisTiming={true}` and DOAC selected | DOAC binary-pill row renders. If `<48h` is selected, DOAC caution note renders immediately below the DOAC row. |
| `showThrombolysisTiming={true}` and Warfarin selected | Warfarin INR binary-pill row renders. If `>1.7` is selected, Warfarin caution note renders. |
| `showThrombolysisTiming={true}` and Heparin/LMWH selected | Heparin aPTT binary-pill row renders. If `>40 s` is selected, Heparin caution note renders. |
| Multiple classes selected | Sub-rows stack in the fixed order: Antiplatelet note, DOAC row (+note), Warfarin row (+note), Heparin row (+note). |

The existing `showLastDoseRow` logic (opens a datetime-picker modal for last-DOAC-dose) is replaced by the binary `<48h` / `>=48h` pill pair on the DOAC sub-row. The `lastAnticoagDose` field in `PatientContextValues` remains in the data model for the non-thrombolysis consumer path but is no longer surfaced in the thrombolysis UI.

---

## §7 375px Viewport Behavior

At 375px, the panel has `px-4` on each side, leaving 343px of content width. The anticoag row uses `flex-wrap` on both the outer row and the pill group, so pills wrap to a second line if needed.

### 7.1 Class selector row

Four pills at `px-3 py-1.5` with `text-xs`. Approximate pill widths: Antiplatelet ~82px, DOAC ~42px, Warfarin ~58px, Heparin/LMWH ~95px. Total: ~277px plus `gap-1.5` (3 x 6px = 18px) = ~295px. This fits in 343px on a single line. No wrapping expected in normal operation.

### 7.2 DOAC sub-row

The right side contains two pills (`<48 h` ~42px, `>=48 h` ~46px) plus `gap-1.5` plus the drug-name input (`w-[96px]`). Total right side: approximately 194px. With a flex-shrink-0 label "Last dose" (~52px), plus `gap-3` (12px), total: ~258px. Fits in 343px. No wrapping expected.

### 7.3 Warfarin and Heparin sub-rows

Two pills each. Short labels. Both rows are narrower than the DOAC row and fit comfortably.

### 7.4 mRS row

Six chips at `w-8` (32px) with `gap-1` (4px): 6 x 32 + 5 x 4 = 212px. Label "Pre-stroke mRS" (~96px). Gap-3 (12px). Total: ~320px. Fits without wrapping.

---

## §8 Accessibility

### 8.1 Anticoag class selector

```
role="group"
aria-labelledby="anticoag-label"
```

`<span id="anticoag-label" ...>` on the label. Every pill button has `aria-pressed`. Screen reader announces: "Anti-coag group. Antiplatelet, not pressed. DOAC, not pressed. …"

### 8.2 Per-class sub-row pill pairs

Each binary pill pair uses:

```
role="group"
aria-label="[field name]"
```

e.g., `aria-label="DOAC last dose"`, `aria-label="Warfarin INR"`, `aria-label="Heparin aPTT"`.

Both pills carry `aria-pressed`. This is the correct pattern for a persistent binary toggle where both options can be unset (neither pressed). The group label provides context that the two pills belong together.

### 8.3 Caution notes

Each caution note carries `role="status"` and `aria-live="polite"`. When a caution-state pill is selected and the note appears, the screen reader will announce the note content after the current interaction completes. This is intentional: the clinician selecting `<48 h` receives the caution as a follow-on announcement, not an interruption.

No `aria-atomic` is needed — the note renders as a single atomic unit.

### 8.4 mRS chip group

```
role="group"
aria-labelledby="prestroke-mrs-label"
```

`<span id="prestroke-mrs-label" ...>` on the static label. Each chip carries `aria-pressed` and `aria-label="Pre-stroke mRS {grade}"`.

### 8.5 Drug-name input

`aria-label="DOAC drug name"`. No `aria-required` — this field is optional.

### 8.6 Focus order

DOM order determines tab order. The class-selector pills come first; sub-rows are inserted in DOM order below their parent class row. Within the DOAC row, the pills precede the drug-name input. Focus order within the mRS row is left-to-right chips (0 through 5).

---

## §9 Data-Claim Mapping

| Claim ID | Surface | Trigger |
|---|---|---|
| `ivt-anticoag-antiplatelet-ok` | Antiplatelet note row | Always visible when Antiplatelet class is selected |
| `ivt-anticoag-doac-48h` | DOAC caution note | Only when `doacLastDose === '<48h'` |
| `ivt-anticoag-warfarin-inr` | Warfarin caution note | Only when `warfarinInr === '>1.7'` |
| `ivt-anticoag-ufh-aptt` | Heparin caution note | Only when `heparinAptt === '>40'` |

The `data-claim` attribute is placed on the element containing the claim text (the note container, not the pill). For the antiplatelet note, the `data-claim` goes on the row element itself since the entire row is the claim surface. All four claim IDs must be registered in `src/lib/citations/claims.ts` before any implementation PR can merge. The pre-commit hook (CLAUDE.md §13.5) will block on unregistered claim IDs.

---

## §10 Interaction Rules

### 10.1 Class selector — multi-select, no mutual exclusion

Tapping a class pill toggles that class in `values.anticoag`. No other pill is affected. A second tap on a selected class deselects it and removes its sub-row (and any filled sub-values are cleared from state on deselection — `doacLastDose` reverts to `undefined`, etc.).

### 10.2 Binary pill pairs — single-select within pair

Within each binary pair, tapping a pill selects it and deselects the other if the other was selected. Tapping a selected pill deselects it (returns the field to `undefined`). This matches the behavior of the existing mRS chips.

### 10.3 Caution note timing

The caution note enters the DOM on the same render pass as the pill selection. There is no delay or animation. The `aria-live="polite"` ensures the screen reader announces after the tap interaction completes.

### 10.4 State cleanup on class deselection

When a class is removed from `values.anticoag`:
- DOAC removed: `doacLastDose` and `doacDrugName` reset to `undefined`
- Warfarin removed: `warfarinInr` resets to `undefined`
- Heparin removed: `heparinAptt` resets to `undefined`

This prevents stale sub-values from persisting invisibly in state.

---

## §11 Summary of Changes from Existing Implementation

This section is a delta reference for the engineer; it does not repeat full token specs.

| Element | Before | After (showThrombolysisTiming=true only) |
|---|---|---|
| Anticoag pill set | None / DOAC / Warfarin / Antiplatelet | Antiplatelet / DOAC / Warfarin / Heparin/LMWH |
| Anticoag pill count | 4 (None + 3 classes) | 4 (4 classes, no None) |
| None pill | Present | Removed |
| DOAC sub-row | Absent (last-dose modal triggered by separate row) | Binary `<48h` / `>=48h` pills + drug-name input |
| Warfarin sub-row | Absent | Binary `<=1.7` / `>1.7` pills |
| Heparin sub-row | Absent | Binary `<=40 s` / `>40 s` pills |
| Antiplatelet sub-row | Absent | Static muted note |
| Caution notes | Absent | Inline `border-l-2 border-amber-300` notes for 3 adverse states |
| Caution pill appearance | N/A | Amber fill when adverse state selected |
| mRS grade range | 0 through 6 | 0 through 5 |
| mRS label interaction | Button (opens modal) | Static span |
| Last-dose modal row (showLastDoseRow) | Present when DOAC or Warfarin selected | Absent (replaced by binary pills) |
