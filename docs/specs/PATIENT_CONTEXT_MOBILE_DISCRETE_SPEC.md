# PATIENT_CONTEXT_MOBILE_DISCRETE_SPEC.md — Mobile-Discrete Anticoag/Eligibility Controls

**Version:** 1.0
**Status:** Draft — pending design-guardian lock
**Owner:** UI Architect
**Scope:** `PatientContextPanel.tsx` — anticoag class selector, per-class binary toggles, pre-stroke mRS row, and caution treatment. Applies only when `showThrombolysisTiming={true}`. All other consumers are unaffected.
**Viewport target:** 375px mobile-first
**Date:** 2026-06-10

This spec proposes three distinct variations to replace the 44px pill vocabulary for the IV-thrombolysis eligibility controls. It is a design proposal only. No implementation should begin until V approves one variation and the design-guardian locks this file. The component must not be edited until that approval.

---

## §1 Problem Statement

At 375px the existing pill vocabulary creates three compounding height problems:

1. The four class-selector pills render at `min-h-[44px]` with `-my-1` overlap. When pills wrap (they can at narrow widths or after zooming), the row grows to ~90px.
2. Each selected class adds a full 44px sub-row. With two or three classes selected, the panel can grow by 130px or more before any caution boxes appear.
3. The amber caution box (`bg-amber-50 border border-amber-200 rounded-lg px-3 py-2`) adds approximately 44px per adverse state selected.

The result is a panel that can reach 350-400px in height (nearly the full viewport) when a patient is on multiple anticoagulants. This is confirmed by the live component at `showThrombolysisTiming={true}` in the NIHSS calculator view.

V's direction: move away from the pill format for these controls specifically and towards "something more discrete so on mobile it looks good." The amber caution box and the underlined-input pattern (BP, glucose) are established vocabulary that may be reused or adapted.

---

## §2 Constraints That Apply to All Variations

- No arbitrary Tailwind values. All tokens from `design-tokens` skill, `index.css @theme`, and the standard Tailwind v4 slate/amber/emerald/neuro scale.
- No `shadow-sm`, no `border-2`, no `gray-*`.
- Every selected state uses full fill (border + background), not border-only.
- Touch-target floor: WCAG 2.1 SC 2.5.5 AA requires 44x44 CSS px. Any rendered element shorter than 44px must compensate with invisible padding via `py-*` or a wrapper with `min-h-[44px]`. The techniques are noted per variation.
- The amber caution treatment survives in some form in all three variations. Clinical urgency must be legible.
- `data-claim` attributes, `role="status"`, `aria-live="polite"` on caution elements are unchanged across all variations.
- `aria-pressed` on all toggle buttons.
- `role="group"` with `aria-labelledby` or `aria-label` on all toggle groups.

---

## §3 Shared Vocabulary Reference

**What the current pills look like (baseline for comparison):**

| State | Classes |
|---|---|
| Unselected | `min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border bg-white border-slate-200 text-slate-500` |
| Selected (neuro) | `min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border bg-neuro-50 border-neuro-200 text-neuro-700` |
| Selected (caution) | `min-h-[44px] py-1.5 px-3 -my-1 text-xs font-semibold rounded-full border bg-amber-50 border-amber-200 text-amber-700` |

**Existing underlined-input vocabulary (BP/glucose):**

```
border-b border-slate-200 focus:border-neuro-500 focus:outline-none
bg-transparent text-sm text-slate-900 px-1 py-1
```

---

## §4 Variation A — Segmented Bar

### 4.1 Concept

A horizontal bar split into labelled segments, visually unified into one element. The bar reads as a single decision surface rather than a row of independent buttons. For the class selector, four segments in one bar. For each binary, two segments. For mRS, six segments. Total rendered height per row: approximately 30-32px for the bar element, contained in a 44px row via `py` padding.

### 4.2 Bar container

```
rounded-lg overflow-hidden border border-slate-200 flex
```

This replaces the `gap-1.5 flex-wrap` pill group container. The border is the container border, not per-segment.

No `bg-slate-100` container fill. Segments provide their own fill.

### 4.3 Segment anatomy

Each segment is a `<button type="button">` that fills one cell of the bar using `flex-1`.

**Unselected segment:**

```
flex-1 h-[30px] flex items-center justify-center
text-[11px] font-semibold text-slate-500
bg-white
border-r border-slate-200 last:border-r-0
transition-colors
focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neuro-500 focus-visible:outline-none
```

`h-[30px]` is an explicit height token. At 30px the element itself is below the 44px WCAG floor. Touch target is preserved by the row container: the row is `min-h-[44px] flex items-center px-4 py-2 gap-3`, so the effective tap area is the full row height for the label side, and the bar's own row padding (`py-2` on the row container) adds at least 8px above and 8px below the 30px bar = 46px tappable height. This satisfies the 44px floor for a grouped selection element where the hit area includes the row padding. Note in the accessible name: the `role="group"` label covers the group; individual segments have their own `aria-pressed` and visible text.

**Selected segment (neuro):**

```
flex-1 h-[30px] flex items-center justify-center
text-[11px] font-semibold text-neuro-700
bg-neuro-50
border-r border-slate-200 last:border-r-0
transition-colors
focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Selected segment (caution amber) — for DOAC `<48 h`, Warfarin `>1.7`, Heparin `>40 s`:**

```
flex-1 h-[30px] flex items-center justify-center
text-[11px] font-semibold text-amber-700
bg-amber-50
border-r border-slate-200 last:border-r-0
transition-colors
focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 focus-visible:outline-none
```

### 4.4 Class selector (4-segment bar)

**Row container:**

```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3
```

**Label (left):**

```
text-xs font-medium text-slate-600 flex-shrink-0
```

Content: "Anti-coag"

**Bar (right):** a `rounded-lg overflow-hidden border border-slate-200 flex` container holding four segments: Antiplatelet, DOAC, Warfarin, Heparin/LMWH. Multi-select: each segment has independent `aria-pressed`. The container is `role="group" aria-labelledby="anticoag-label"`.

At 375px: available right-side width is approximately 375 - 32px padding - ~70px label - 12px gap = ~261px. Four segments each flex-1 = ~65px per segment. Segment text: "Antiplatelet" is 10 chars at `text-[11px]` = approximately 60px. This fits if the label is abbreviated. Abbreviations for this variation: **APlt · DOAC · Warf · Hep**. Full labels are preserved in the `aria-label` attribute on each segment button. If full labels are required visually, see Variation B.

**ARIA on segments:** `aria-pressed={selected}`, `aria-label="Antiplatelet"` (full label, not abbreviated).

### 4.5 Binary toggles (2-segment bar)

Same bar anatomy, two segments. `rounded-lg overflow-hidden border border-slate-200 flex`.

**DOAC row:**

- Left label: "Last dose" — `text-xs font-medium text-slate-600 flex-shrink-0`
- Bar: segments `<48 h` (caution when selected) and `>=48 h` (neuro when selected)
- Drug-name input: rendered on a second line below the row using the existing underlined pattern `border-b border-slate-200 bg-transparent text-sm text-slate-900 px-1 py-1 placeholder:text-slate-300 focus:border-neuro-500 focus:outline-none w-full` wrapped in `px-4 pb-2`

The drug-name input moving to a second line is a minor vocabulary extension. It is justified: with the narrower bar occupying the right side, the input cannot share horizontal space without wrapping anyway.

**Warfarin row:**

- Left label: "INR"
- Bar: segments `<=1.7` (neuro when selected) and `>1.7` (caution when selected)

**Heparin row:**

- Left label: "aPTT"
- Bar: segments `<=40 s` (neuro when selected) and `>40 s` (caution when selected)

### 4.6 mRS (6-segment bar)

```
rounded-lg overflow-hidden border border-slate-200 flex
```

Six segments (0-5), each `flex-1 h-[30px]`. At 375px with 343px content width, minus ~95px for label "Pre-stroke mRS" and 12px gap = ~236px for the bar. Six segments = ~39px each. Digits "0"-"5" at `text-[11px]` fit comfortably.

Single-select: tapping a selected segment deselects it (returns to `undefined`). All six segments use `aria-pressed`. `role="group" aria-labelledby="prestroke-mrs-label"`. Each segment `aria-label="Pre-stroke mRS 0"` etc.

### 4.7 Caution treatment

The existing amber box is replaced with a thinner inline note:

```
px-4 pt-0 pb-2 flex items-start gap-1.5
```

Note text element:

```
text-xs text-amber-700 leading-snug
```

Warning glyph: `text-amber-500 flex-shrink-0 text-[11px]` containing "!".

This keeps caution visible while reducing height from approximately 44px (filled box) to approximately 28px. The amber color and the exclamation character preserve the urgency signal without the box. The `data-claim`, `role="status"`, and `aria-live="polite"` attributes are unchanged.

### 4.8 Per-row height summary (Variation A)

| Row | Rendered height |
|---|---|
| Class selector | 44px min (label + 30px bar in 44px row) |
| DOAC sub-row | 44px + ~28px for drug input line |
| DOAC caution | ~28px |
| Warfarin sub-row | 44px |
| Warfarin caution | ~28px |
| Heparin sub-row | 44px |
| Heparin caution | ~28px |
| mRS | 44px |

**Height saving vs baseline (all 3 classes + 3 cautions selected):** baseline approximately 7 x 44px + 3 x 44px = 440px; Variation A approximately 7 x 44px + 3 x 28px + 28px drug input = 420px. Modest saving, but the visual weight is reduced considerably because pills disappear in favour of flat-fill bars.

### 4.9 Touch-target note

Segments render at 30px height. The row padding (`py-2`) extends the tap zone to approximately 46px. For the binary bars (2 segments at ~130px wide / 2 = ~65px per segment), the 65px wide x 46px tall tap target exceeds the 44x44 floor. For the mRS bar (6 segments at ~39px wide x 46px tall), width is below 44px. Mitigation: the height is 46px (satisfies one dimension); the user does not need pixel-precise tapping on a number they can see. The `aria-label` on each segment provides the accessible name for switch access. Flag for accessibility review before implementation.

### 4.10 Vocabulary departure

Segmented bar is not currently used in the panel. The closest precedent is the CALCULATOR_SPEC §3.1 mode-toggle (`bg-slate-100 rounded-full p-0.5`), which this spec explicitly does NOT replicate. Variation A uses `rounded-lg` (not `rounded-full`), no container fill (not `bg-slate-100`), and a plain border container. This is a new pattern for the panel and requires design-guardian sign-off before use. PATIENT_CONTEXT_ELIGIBILITY_SPEC §1 bans "segmented-toggle bars" defined as `bg-slate-100 rounded-full p-0.5` containers. Variation A uses `bg-white border border-slate-200 rounded-lg` — the structural difference is material. However, the spirit of §1 is to preserve the panel's thin vocabulary. This variation introduces the most departure and should be flagged explicitly.

---

## §5 Variation B — Underlined Value/Select

### 5.1 Concept

Each control reads like the BP and glucose rows: a label on the left, a tappable underlined value or dropdown affordance on the right. The right side shows the current value (or a placeholder like "select") underlined in `border-b border-slate-200`. Tapping opens a thin inline expand or cycles the value. No buttons with visible borders; the border-bottom is the only UI chrome. This is the most conservative vocabulary extension — it extends the pattern already used by four rows in the panel rather than introducing any new shape.

### 5.2 Class selector row (underlined multi-select)

This row cannot use a literal `<select>` because it is multi-select. Instead, the right side shows a compact value string that is the tappable element.

**Row container:**

```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3
```

**Label (left):**

```
text-xs font-medium text-slate-600 flex-shrink-0
```

Content: "Anti-coag"

**Right-side tap target:**

```
flex items-center gap-1 cursor-pointer
border-b border-slate-200
focus-visible:border-neuro-500 focus-visible:outline-none
pb-0.5
```

This element is a `<button type="button">` with `aria-haspopup="listbox"` or `aria-expanded`. Tapping it reveals an inline panel (see below).

**Value display text:**

```
text-sm text-slate-900
```

When nothing selected: `text-sm text-slate-400` placeholder "None". When classes are selected: the selected class names joined with ", " e.g. "DOAC, Warfarin".

**Chevron icon:** `w-3 h-3 text-slate-400` rotating `rotate-180` when open.

**Inline multi-select panel (expanded state):**

The panel expands below the row, occupying `px-4 pb-3`. It renders four rows, each a `min-h-[36px] flex items-center gap-3` row. Each row is a tappable area (the full row width = 343px x 36px; padding expands effective target to 36px height; pairing with text keeps label readable).

**Class row anatomy:**

Left: a small filled indicator square `w-3.5 h-3.5 rounded-sm border` — when selected: `bg-neuro-50 border-neuro-200` with a centered `text-neuro-700 text-[9px] font-bold` checkmark "v"; when unselected: `bg-white border-slate-300`.

Right: class name `text-xs font-medium text-slate-600`.

**Touch target for class rows:** 36px rendered height x 343px width. Height is below 44px. Mitigation: the label text is wide (the full row width is the tap zone), and the 36px row in a list is a well-established mobile-list pattern (iOS Settings rows are 44px, but selection lists within expanded sections commonly use 36px). Flag for accessibility review. An alternative: increase to `min-h-[44px]` per row, which adds 4 x 44px = 176px to the expanded class panel.

**ARIA for expanded panel:** `role="listbox"`, `aria-multiselectable="true"`, each row is `role="option" aria-selected={selected}`.

### 5.3 Binary controls (underlined select)

Each binary row is a single label-left / underlined-value-right row. The underlined value cycles through three states: nothing selected (placeholder), option A selected, option B selected. Tapping the value element cycles forward. Tapping again cycles back to nothing.

**Row container:**

```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3
```

**Underlined value element (the interactive right side):**

```
border-b border-slate-200 pb-0.5 cursor-pointer
focus-visible:border-neuro-500 focus-visible:outline-none
text-sm font-medium
```

When nothing selected: `text-slate-400` text "select". When safe option selected: `text-slate-900`. When caution option selected: `text-amber-700 border-amber-300`.

The caution amber border-bottom replaces the visible pill's amber fill. This is a vocabulary extension: the existing `border-b` uses only `border-slate-200` or `border-neuro-500`. Adding `border-amber-300` for caution state is a minimal, token-valid extension.

Cycle behavior (DOAC): nothing -> `>=48 h` -> `<48 h` -> nothing. Puts the safe option first in the cycle so a quick tap selects the typical safe state.

**ARIA on the underlined element:** `role="button"`, `aria-label="Last DOAC dose: [current value or not set]"`, `aria-pressed` is not appropriate for a cycling control; `aria-describedby` pointing to the caution note (when visible) is appropriate.

**DOAC drug-name input:** unchanged underlined pattern, rendered on a second line `px-4 pb-2` below the binary row.

### 5.4 mRS (underlined select)

Same single-row pattern. The right side shows a `<select>` element styled to look like the underlined value, or a tappable value that opens a native picker.

**Option A — native `<select>`:**

```
bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none
text-sm text-slate-900 pr-4 py-0.5 cursor-pointer appearance-none
```

This is the lowest-effort implementation and uses the device's native picker, which has full accessibility support and familiar UX on mobile. The selected grade appears as "0", "1", etc. Unset state: `<option value="">--</option>` showing "--" in `text-slate-400`.

**Option B — tappable cycling value:** same as binary controls above, cycling through 0-5 and back to unset. Requires six taps maximum to reach grade 5. Less ideal for mRS than a native picker.

Recommended for this variation: native `<select>` (Option A).

**Touch target:** native `<select>` inherits the row's `min-h-[44px]`.

### 5.5 Caution treatment

Identical to Variation A: thin inline note without the amber box.

```
px-4 pt-0 pb-2 flex items-start gap-1.5
```

```
text-xs text-amber-700 leading-snug
```

Warning glyph: `text-amber-500 flex-shrink-0` "!"

`data-claim`, `role="status"`, `aria-live="polite"` unchanged.

### 5.6 Per-row height summary (Variation B)

| State | Height |
|---|---|
| Class selector (collapsed) | 44px |
| Class selector (expanded) | 44px + 4 x 36px = 188px |
| Any binary sub-row | 44px |
| DOAC drug input line | ~28px |
| Any caution note | ~28px |
| mRS row | 44px |

**Tradeoff:** when the class selector is collapsed, the panel is the most compact of the three variations. When expanded (the user is actively selecting classes), it adds 144px for the class-option list. That 144px is transient. Compared to the baseline's permanent pill rows, the panel height is significantly lower for a single-class patient and comparable for a three-class patient during selection.

### 5.7 Vocabulary departure

The underlined-value pattern for class selection (with an inline expand) is new. The `border-b` interactive element extends the existing BP/glucose pattern. The native `<select>` for mRS is the most conservative control in the entire spec. The cycling tap-to-change binary is a new micro-interaction with no current panel precedent.

---

## §6 Variation C — Dense Quiet Chips

### 6.1 Concept

Keeps a button identity (visible chip shape) but shrinks height to 28px and reduces contrast to feel like secondary controls rather than primary CTAs. Each chip is visually quieter than the existing pills: smaller type, thinner border, less padding. The caution note becomes a single line of inline text rather than a box. This variation is closest to the current vocabulary while achieving the mobile density goal.

### 6.2 Chip anatomy

**Base classes (both selected and unselected):**

```
h-7 px-2.5 flex items-center justify-center
text-[11px] font-medium rounded-md border transition-colors
focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

Note: `h-7` = 28px. `rounded-md` (not `rounded-full`) reduces pill identity and lowers visual weight. `font-medium` (not `font-semibold`) further quiets the chip.

**Unselected:**

```
bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500
```

The unselected state uses `text-slate-400` (lighter than the current `text-slate-500`) to further de-emphasize unselected options.

**Selected (neuro):**

```
bg-neuro-50 border-neuro-200 text-neuro-700
```

Same fill tokens as current spec. Full fill is preserved.

**Selected (caution):**

```
bg-amber-50 border-amber-200 text-amber-700
```

Same caution fill tokens as PATIENT_CONTEXT_ELIGIBILITY_SPEC.

**Touch target at 28px height:** chips render at 28px. The row container is `min-h-[44px]` and the row vertical padding `py-2` (8px top + 8px bottom) plus content = 44px. The chips are vertically centered within the 44px row. The touch target for a chip includes the chip's own height (28px) plus vertical space above and below it within the row. In practice on mobile, touches within a few pixels of a visible element register on that element. However, the effective tap zone is not formally 44px on the chip itself. Mitigation: the chips have `px-2.5`, so horizontal tap area is chip text width + 20px. For the binary pairs, each chip is wide enough. For accessibility switch access, `aria-pressed` and visible text are sufficient. Flag for accessibility review: if the WCAG 2.5.5 floor is strictly enforced at element level (not row level), 28px height does not pass without explicit invisible padding. To satisfy strictly: add `py-2 -my-2` to each chip (adds 16px invisible tap area above/below while keeping visual height 28px via `h-7` being overridden by `py-2`). The correct approach: **use a wrapper technique** -- remove `h-7` and instead use `py-1 px-2.5` with an inner span carrying the visual `h-7` appearance via line-height, or use the `min-h-[44px]` on the row and accept that the chip visual and the tap zone are different. This is called out explicitly because V should decide whether strict chip-level 44px is required.

### 6.3 Class selector

**Row container:**

```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap
```

**Chip group:**

```
role="group"
aria-labelledby="anticoag-label"
className="flex items-center gap-1 flex-wrap"
```

`gap-1` (4px) instead of the current `gap-1.5` (6px) to tighten the group.

Four chips: Antiplatelet, DOAC, Warfarin, Heparin/LMWH.

**Width at 375px:** chip widths at `text-[11px] px-2.5` approx: Antiplatelet ~68px, DOAC ~36px, Warfarin ~50px, Heparin/LMWH ~82px. Total: ~236px + 3 x 4px gap = ~248px. Fits in a single row within the ~270px available right-side space. No wrapping.

### 6.4 Binary toggles

**Row container:** unchanged `min-h-[44px] flex items-center justify-between px-4 py-2 gap-3`.

**Binary chip group:** `flex items-center gap-1`.

Two dense chips per row. Each chip approximately 40-50px wide at `text-[11px] px-2.5`. Row fits comfortably.

**DOAC drug-name input:** shares the right side, same underlined pattern, `w-[96px]`. Still fits because the two binary chips are narrower than before (combined ~90px + gap + input ~96px = ~200px vs available ~220px right-side space).

### 6.5 mRS

**Chip group:** `flex items-center gap-1` — same as current but using the dense chip token instead of `w-8 h-8 rounded-full`.

Dense chip for mRS:

```
h-7 w-7 flex items-center justify-center
text-[11px] font-medium rounded-md border transition-colors
focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

`w-7 h-7` = 28x28px square (with `rounded-md`, visually a rounded square rather than a circle). This is a vocabulary change from `rounded-full` circles to `rounded-md` squares. Functionally identical; visually slightly quieter.

Six chips (0-5) at 28px + `gap-1` (4px): 6 x 28 + 5 x 4 = 188px. With "Pre-stroke mRS" label (~96px) + gap-3 (12px): ~296px total. Fits within 343px.

**Unselected mRS chip:** same as Variation C unselected tokens above.
**Selected mRS chip:** `bg-neuro-50 border-neuro-200 text-neuro-700` — same neuro fill.

### 6.6 Caution treatment

Inline text note, no box:

```
px-4 pt-0 pb-2 flex items-center gap-1.5
```

Warning glyph: `text-amber-500 text-[11px] flex-shrink-0` "!"

Note text:

```
text-xs text-amber-700 leading-snug
```

Height: approximately 20-24px. The most compact caution treatment of the three variations.

`data-claim`, `role="status"`, `aria-live="polite"` unchanged.

### 6.7 Per-row height summary (Variation C)

| Row | Rendered height |
|---|---|
| Class selector (all 4 classes fit one row) | 44px |
| DOAC sub-row (chips + drug input in-row) | 44px |
| DOAC caution | ~24px |
| Warfarin sub-row | 44px |
| Warfarin caution | ~24px |
| Heparin sub-row | 44px |
| Heparin caution | ~24px |
| mRS | 44px |

**Saving vs baseline (3 classes + 3 cautions):** baseline ~440px; Variation C ~380px. The visual weight is significantly lower because the 28px chips appear airy within the 44px rows, rather than the current pills which span most of the row height.

### 6.8 Vocabulary departure

Dense chips introduce `h-7 rounded-md` as new chip tokens. Current chips are either `min-h-[44px] rounded-full` (existing pills) or `w-8 h-8 rounded-full` (existing mRS). The `rounded-md` shape is a deliberate departure to signal a secondary/quiet control. This is the least structural departure (still chip-based) but does introduce a new shape. The mRS change from circles to rounded-squares is the most visually noticeable difference from the current spec.

---

## §7 Recommendation

**Recommended: Variation C (Dense Quiet Chips)**

Rationale:

1. Vocabulary continuity. Chips remain chips. The clinician's mental model (tap to select/deselect) is unchanged. The panel does not need a new interaction pattern.
2. Height saving is sufficient. The caution treatment drops from ~44px box to ~24px inline note, and the chips themselves at 28px within 44px rows appear visually lighter without the dense pill packing that currently strains the viewport.
3. Implementation risk is lowest. No new component types. The existing `PILL_BASE / PILL_ON / PILL_OFF` constants become `CHIP_BASE / CHIP_ON / CHIP_OFF`; values change, structure does not.
4. Accessibility is solvable. The touch-target question (chip at 28px vs 44px row) is the same question for all three variations and is an implementation detail that the accessibility specialist must confirm. Variation C is not worse than Variation A (which also uses 30px bars) on this dimension.
5. The mRS `rounded-md` vs `rounded-full` change is the only visible break from the existing vocabulary. If V prefers to keep circles for mRS, `rounded-full` can be substituted with no other changes.

Variation B (Underlined) is the fallback if V wants the absolute flattest visual treatment. The class-selector expansion interaction is the key risk there.

Variation A (Segmented Bar) is the most visually opinionated and introduces the most vocabulary departure. Appropriate if V wants the panel to feel distinctly different from its current state.

---

## §8 Touch-Target Handling Summary

All three variations render some interactive elements below 44px visual height. The approach in every case:

- The row container is `min-h-[44px]`, providing a 44px tap zone that the small control lives inside.
- For grouped controls (class bars, binary bars, mRS), the group as a whole exceeds 44x44 because the row height is 44px and the group width far exceeds 44px.
- For individual segment/chip tap targets narrower than 44px (mRS segments in Variations A/C; individual class chips in Variation C), the narrow dimension is width (for mRS) or height (for chips). The other dimension exceeds 44px.
- Strictly speaking, WCAG 2.5.5 Level AA requires each target to be at least 44x44 independently. None of these patterns fully satisfy that at the element level.
- WCAG 2.5.5 Level AAA (the stricter requirement) requires 44x44. The current pill vocabulary with `min-h-[44px]` satisfies AA for height but the 44px pills at narrow widths (e.g. "DOAC" pill is approximately 42px wide) also fail for width.
- Practical recommendation: flag for accessibility specialist review. The current spec already has the same gap for narrow pills. These variations do not make accessibility worse; they make it more honest.

---

## §9 Exact Token Set Per Variation (HTML Comparison Reference)

This section provides the precise class strings needed to render a 375px interactive comparison without referencing component source code.

### Variation A — Segmented Bar

**Binary bar container:**
```
rounded-lg overflow-hidden border border-slate-200 flex
```

**Segment, unselected:**
```
flex-1 h-[30px] flex items-center justify-center text-[11px] font-semibold text-slate-500 bg-white border-r border-slate-200 last:border-r-0 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Segment, selected (neuro):**
```
flex-1 h-[30px] flex items-center justify-center text-[11px] font-semibold text-neuro-700 bg-neuro-50 border-r border-slate-200 last:border-r-0 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Segment, selected (caution):**
```
flex-1 h-[30px] flex items-center justify-center text-[11px] font-semibold text-amber-700 bg-amber-50 border-r border-slate-200 last:border-r-0 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400 focus-visible:outline-none
```

**Row container (class selector + each sub-row):**
```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3
```

**Row label:**
```
text-xs font-medium text-slate-600 flex-shrink-0
```

**mRS bar:** same bar container; 6 segments using neuro tokens.

**Caution note wrapper:**
```
px-4 pt-0 pb-2 flex items-start gap-1.5
```

**Caution glyph:**
```
text-amber-500 flex-shrink-0 text-[11px]
```

**Caution text:**
```
text-xs text-amber-700 leading-snug
```

**CSS variable for neuro-50/200/700** (needed for the HTML comparison since Tailwind CDN won't have neuro-*):
```css
--color-neuro-50: #EEF2FF;
--color-neuro-200: #C7D2FE;
--color-neuro-700: #0E2D6B;
--color-neuro-500: #1746A2;
```

---

### Variation B — Underlined Value/Select

**Underlined trigger (class selector collapsed):**
```
flex items-center gap-1 cursor-pointer border-b border-slate-200 pb-0.5 focus-visible:border-neuro-500 focus-visible:outline-none
```

**Value text, nothing selected:**
```
text-sm text-slate-400
```

**Value text, value selected:**
```
text-sm text-slate-900
```

**Value text, caution value selected:**
```
text-sm text-amber-700 border-amber-300
```

**Expanded class-option row:**
```
min-h-[36px] flex items-center gap-3 cursor-pointer
```

**Option indicator, unselected:**
```
w-3.5 h-3.5 rounded-sm border bg-white border-slate-300 flex-shrink-0
```

**Option indicator, selected:**
```
w-3.5 h-3.5 rounded-sm border bg-neuro-50 border-neuro-200 flex-shrink-0 flex items-center justify-center
```

**Option label:**
```
text-xs font-medium text-slate-600
```

**mRS native select:**
```
bg-transparent border-b border-slate-200 focus:border-neuro-500 focus:outline-none text-sm text-slate-900 pr-4 py-0.5 cursor-pointer appearance-none
```

**Caution note wrapper, text, glyph:** same as Variation A.

---

### Variation C — Dense Quiet Chips

**Chip base:**
```
h-7 px-2.5 flex items-center justify-center text-[11px] font-medium rounded-md border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Chip, unselected:**
```
bg-white border-slate-200 text-slate-400 hover:border-slate-300 hover:text-slate-500
```

**Chip, selected (neuro):**
```
bg-neuro-50 border-neuro-200 text-neuro-700
```

**Chip, selected (caution):**
```
bg-amber-50 border-amber-200 text-amber-700
```

**mRS chip base (square variant):**
```
h-7 w-7 flex items-center justify-center text-[11px] font-medium rounded-md border transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none
```

**Chip group:**
```
flex items-center gap-1 flex-wrap
```

**Row container:**
```
min-h-[44px] flex items-center justify-between px-4 py-2 gap-3 flex-wrap
```

**Row label:**
```
text-xs font-medium text-slate-600 flex-shrink-0
```

**Caution note wrapper:**
```
px-4 pt-0 pb-2 flex items-center gap-1.5
```

**Caution glyph:**
```
text-amber-500 text-[11px] flex-shrink-0
```

**Caution text:**
```
text-xs text-amber-700 leading-snug
```

---

## §10 Spec Format Notes

- This spec does not duplicate the PATIENT_CONTEXT_ELIGIBILITY_SPEC sections it does not change (LKW row, BP row, glucose row, timing chip, pre-existing deficits).
- Data-claim attributes, clinical content, and ARIA roles are unchanged from PATIENT_CONTEXT_ELIGIBILITY_SPEC §9 and §8. This spec governs only the visual/token layer.
- Once V selects a variation, a revised PATIENT_CONTEXT_ELIGIBILITY_SPEC (or an amendment section) should incorporate the chosen token set and the design-guardian should lock both files together.
