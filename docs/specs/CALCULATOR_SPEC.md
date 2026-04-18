# CALCULATOR_SPEC.md — NeuroWiki Calculator Design Specification

**Version:** 1.1
**Status:** Locked after PM approval
**Owner:** Design Guardian
**Mockup:** docs/specs/mockups/calculator-reference.html
**Scope:** All calculator pages in src/pages/*Calculator.tsx

This spec is the single source of truth for the anatomy, behavior, and SEO of every calculator in NeuroWiki. Every swarm touching a calculator must cite section IDs and line numbers from this file in pre-flight. The companion mockup is the visual ground truth; this prose is the behavioral ground truth. Neither is complete without the other.

---

## §1 Shared Anatomy

Every calculator has exactly these three elements, in this order, regardless of archetype. No additional top-level layout elements are permitted.

### 1.1 Sticky Top Header

**Mockup reference:** Lines 76–104 (ICH empty state), lines 228–252 (NIHSS two-row variant)

The header sticks to the top of the viewport at all times. It never scrolls away.

```
sticky top-0 z-40 bg-white/95 backdrop-blur-md
```

**Inner padding:**
- Single-row calculators (Archetype 1 + 3): `px-5 py-4`
- Two-row calculators (Archetype 2): `px-5 py-3` on outer wrapper, secondary row adds `mt-3 pt-3 border-t border-slate-100`

**Left cluster — back arrow + score block:**
```
flex items-center gap-3 min-w-0
```

Back arrow button:
```
p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors
```
Arrow SVG: 20×20, stroke-width 2, `M19 12H5M12 19l-7-7 7-7`

Calculator name label (above score):
```
text-[10px] font-bold text-slate-400 uppercase tracking-widest
```

Score display row:
```
flex items-baseline gap-1.5 mt-0.5
```

Score number:
```
text-2xl font-semibold text-slate-900 tabular-nums leading-none
```
- Incomplete state: renders an em dash (`—`), not zero
- Complete state: renders the numeric score

Score unit (e.g. `/ 6`, `/ 42`):
```
text-slate-400 text-sm leading-none
```

Severity text — rendered only when score is complete and severity is non-trivial:
```
text-xs font-medium [severity-color] ml-1.5
```
Severity colors:
- High / Severe: `text-red-600`
- Moderate: `text-amber-700`
- Low: no severity text shown (score alone is sufficient)

**Right cluster — action buttons:**
```
flex items-center gap-0.5 flex-shrink-0
```

Favorite button (star icon, 18×18):
```
p-2 rounded-full hover:bg-slate-50 transition-colors
```
- Unfavorited: `fill="none" stroke="currentColor" class="text-slate-400"`
- Favorited: `fill="currentColor" stroke="currentColor" class="text-amber-400"`

Reset button (rotate-ccw icon, 17×17):
```
p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400
```

Copy button — always present, always in header, regardless of completion state:
```
ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors
```
Label: `Copy` (plain text; no icon; no "Copy to clipboard" verbose text)

### 1.2 Main Scrollable Content

Content scrolls freely. No max-height on the main region. Bottom padding must account for drawer height.

Outer padding: `px-5 pt-6 pb-4`

Space between sections (Archetype 1): `space-y-10`

Page footer (citation + disclaimer), placed after all input sections:
```
mt-14 pt-6 border-t border-slate-100
```
Citation text: `text-xs text-slate-400 leading-relaxed`
Source link: `text-neuro-600 hover:underline ml-0.5`
Disclaimer: `mt-3 text-xs text-slate-400 leading-relaxed` — text: "Educational use only."

### 1.3 Persistent Bottom Drawer

The drawer is always rendered. It changes state (see §5) but never disappears from the DOM. It is positioned `absolute bottom-0 left-0 right-0` within the page wrapper.

The spacer div beneath main content must match drawer height to prevent content from hiding behind the drawer:
- Collapsed drawer: `.drawer-spacer-collapsed { height: 80px }`
- Expanded drawer: `.drawer-spacer-expanded { height: 380px }`

**Production implementation — React Portal:** In React production, implement the drawer via `createPortal(drawer, document.body)` with `position: fixed`. The `absolute bottom-0` annotation in the mockup HTML describes the static preview context only and does not work inside `overflow-y-auto` scroll containers. Production drawer positioning:
- `position: fixed`
- `bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))`
- `left: 0`, `right: 0`
- `z-index: 55` (above tab bar `z-50`, below toast `z-[60]`)

A spacer div inside `<main>` reserves vertical space equal to the drawer's collapsed height so final content is not hidden beneath the drawer. See §5.3 for the full positioning spec.

---

## §2 Archetype 1 — Single-Page Radio

**Applies to:** ICH Score, GCS, ABCD2, RoPE, Heidelberg Bleeding Classification
**Mockup reference:** ICH Score states, lines 68–208

In this archetype every input is a radio group — one answer per section, mutually exclusive.

### 2.1 Section Structure

Each question occupies one `<section>` element:

```html
<section>
  <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
    [Section label]
  </h2>
  <div role="radiogroup">
    <!-- option rows -->
  </div>
</section>
```

Sections are spaced with `space-y-10` on the parent container. Do not add margin to individual sections.

### 2.2 Option Row — Unselected State

```html
<button type="button"
  class="w-full flex items-baseline justify-between py-3.5 text-left hover:bg-slate-50/60 px-3 rounded-lg transition-colors">
  <span class="font-medium text-slate-900">[Option label]</span>
  <span class="text-sm text-slate-400">[N] pt</span>
</button>
```

Between consecutive options, a hairline divider:
```html
<div class="divider-hair"></div>
<!-- CSS: border-top: 1px solid #e2e8f0 -->
```

The divider sits between buttons, not inside them. It is not rendered before the first option or after the last option.

### 2.3 Option Row — Selected State

The `.selected-option` class replaces the hover/padding classes:

```html
<button type="button" aria-checked="true"
  class="selected-option w-full flex items-baseline justify-between py-3.5 pl-4 pr-3 text-left rounded-lg">
  <span class="font-semibold">[Option label]</span>
  <span class="text-sm opacity-75">[N] pt</span>
</button>
```

`.selected-option` CSS:
```css
.selected-option {
  background-color: var(--color-neuro-50);   /* #EEF2FF */
  color: var(--color-neuro-700);             /* #0E2D6B */
  position: relative;
}
.selected-option::before {
  content: '';
  position: absolute;
  left: 0;
  top: 6px;
  bottom: 6px;
  width: 2px;
  background-color: var(--color-neuro-500);  /* #1746A2 */
  border-radius: 1px;
}
```

The left accent (`::before`) replaces the `px-3` left padding; selected rows use `pl-4` to accommodate it.

Label font changes: unselected uses `font-medium text-slate-900`; selected uses `font-semibold` (inherits `text-neuro-700` from `.selected-option`).

Point value: unselected uses `text-slate-400`; selected uses `opacity-75` (inherits color from parent).

### 2.4 Touch Targets

`py-3.5` = 14px top + 14px bottom padding. Combined with ~20px line-height, each row reaches ≥48px height, exceeding the 44px minimum.

### 2.5 Hover Behavior

Unselected rows: `hover:bg-slate-50/60` with `transition-colors`. No hover effect on already-selected rows (they have a persistent background).

---

## §3 Archetype 2 — Multi-Item Assessment

**Applies to:** NIHSS, ASPECTS
**Mockup reference:** NIHSS moderate state, lines 209–290

This archetype shares the same option-row anatomy as Archetype 1, with three additions: a two-row header, per-item inline warnings, and a mode toggle.

### 3.1 Two-Row Sticky Header

The header has a primary row (score display + actions) and a secondary row (LVO probability + mode toggle), separated by a hairline divider. Both rows are inside the sticky header wrapper.

Secondary row:
```html
<div class="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
  <!-- LVO cluster left, mode toggle right -->
</div>
```

LVO cluster:
```html
<div class="flex items-baseline gap-2">
  <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">LVO</span>
  <span class="text-sm font-medium text-red-600">High · 85%</span>
  <button aria-label="LVO info"><!-- info circle SVG, 14×14, text-slate-300 --></button>
</div>
```

Mode toggle (Rapid / Detailed):
```html
<div class="flex items-center gap-0.5 bg-slate-100 rounded-full p-0.5">
  <button class="px-3 py-1 rounded-full text-xs font-medium bg-white text-slate-900">Rapid</button>
  <button class="px-3 py-1 rounded-full text-xs font-medium text-slate-500 hover:text-slate-900">Detailed</button>
</div>
```

Active mode: `bg-white text-slate-900`. Inactive mode: `text-slate-500 hover:text-slate-900`. Container: `bg-slate-100 rounded-full p-0.5`.

### 3.2 Item Numbering

NIHSS items use the official numbering convention (1a, 1b, 1c, 2, 3, 4, 5a, 5b, 6a, 6b, 7, 8, 9, 10, 11). ASPECTS items use anatomical region labels. Both appear in the section `<h2>` label:

```html
<div class="flex items-baseline justify-between mb-3">
  <h2 class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">1a · Level of consciousness</h2>
  <span class="text-[10px] font-medium text-slate-400">[current score for this item] pt</span>
</div>
```

The right-side score for the item updates as the user selects an answer.

### 3.3 Per-Item Warning Pattern

When a selected combination warrants a clinical note, a warning block appears immediately below the radio group for that item:

```html
<div class="mt-3 pl-3 border-l-2 border-amber-400">
  <p class="text-xs text-amber-700 leading-relaxed">[Warning text]</p>
</div>
```

Warnings are conditional — they render only when the relevant option is selected. Medical Scientist agent owns the trigger conditions and text.

### 3.4 Rapid vs Detailed Mode

**Rapid mode:** Each option is a single label. Layout is identical to Archetype 1.

**Detailed mode:** Each option renders a two-line layout:
```html
<button type="button" class="w-full flex flex-col gap-0.5 py-3 text-left px-3 rounded-lg ...">
  <span class="font-medium text-slate-900">[Short label]</span>
  <span class="text-xs text-slate-500">[Extended description from NIHSS manual]</span>
</button>
```

**Untestable option:** Available for items where amputation or injury prevents scoring.
```html
<button type="button" class="w-full flex items-baseline justify-between py-3 text-left px-3 ...">
  <span class="font-medium text-slate-500 italic">Untestable / amputation</span>
  <span class="text-sm text-slate-400">—</span>
</button>
```
An untestable selection scores 0 but marks the item with a flag for the Copy output.

### 3.5 Shortcut Buttons

Shortcut buttons appear below certain section groups (e.g., "Normal all motor" to zero out motor items):
```
text-[10px] font-semibold text-neuro-600 underline-offset-2 hover:underline
```
Placed flush left, below the last option in the relevant section group.

---

## §4 Archetype 3 — Mixed Input

**Applies to:** HAS-BLED; any future calculator with checkboxes plus optional radio subgroups
**Mockup reference:** HAS-BLED moderate state, lines 291–370

### 4.1 Checkbox Row Layout

```html
<label class="flex items-start gap-3 py-3.5 px-3 rounded-lg hover:bg-slate-50/60 cursor-pointer transition-colors [checked-bg]">
  <input type="checkbox" class="mt-0.5 w-5 h-5 rounded border-slate-300 accent-neuro-500" />
  <div class="flex-1 min-w-0 flex items-baseline justify-between">
    <span class="[label-classes]">[Label text]</span>
    <span class="text-sm [point-classes]">[N] pt</span>
  </div>
</label>
```

**Unchecked state:**
- Row background: none (transparent)
- Label: `font-medium text-slate-900`
- Points: `text-slate-400`

**Checked state:**
- Row background: `bg-neuro-50`
- Label: `font-semibold text-neuro-700`
- Points: `text-neuro-700 opacity-75`

The `<label>` wraps the entire row so the full touch target (entire row) toggles the checkbox.

`items-start` on the flex container aligns the checkbox to the top of the label text, which is correct for multi-line labels. For single-line labels this is visually identical to center alignment.

### 4.2 Checkbox Size

`w-5 h-5` = 20×20px native checkbox. `mt-0.5` nudges it down 2px to align with the cap-height of the label text. `accent-neuro-500` sets the browser's native checked color to cobalt.

### 4.3 Sub-Description Pattern

When a checkbox label is ambiguous (e.g., "Abnormal renal function" needs qualification):
```html
<div class="flex-1 min-w-0">
  <span class="[label-classes] block">[Primary label]</span>
  <span class="text-xs text-slate-500 mt-0.5">[Qualifying description]</span>
</div>
```

### 4.4 Radio Subgroup Pattern

Some HAS-BLED items have a sub-item that only activates when the parent checkbox is checked (e.g., INR lability unlocks a sub-radio for time-in-range). Sub-items follow Archetype 1 radio anatomy, indented with `ml-8 mt-2`.

### 4.5 Important Callout in Drawer

For calculators where the result is frequently misapplied (HAS-BLED, CHA₂DS₂-VASc), an "Important" callout lives inside the expanded drawer content, between the explanation paragraph and the "See also" section:

```html
<div class="mt-5 pl-3 border-l-2 border-amber-400">
  <div class="text-[10px] font-bold text-amber-700 uppercase tracking-widest mb-1">Important</div>
  <p class="text-sm text-slate-700 leading-relaxed">[Callout text]</p>
</div>
```

Content Writer owns the callout text. Medical Scientist verifies it.

---

## §5 Interaction Rules — Drawer State Machine

All calculators share a single four-state drawer. The state machine is owned by the calculator's React component and is the single source of truth for drawer rendering.

### State A — Empty (0 inputs selected)

Trigger: No input has been selected.

Drawer rendering:
```html
<div class="absolute bottom-0 left-0 right-0 bg-slate-100 drawer-collapsed">
  <div class="px-5 py-3.5 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interpretation</div>
      <div class="text-sm text-slate-500">0 of [N] selected</div>
    </div>
    <div class="text-xs text-slate-400">Appears when complete</div>
  </div>
</div>
```

`drawer-collapsed` shadow: `box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.08)`

The drawer is not interactive (no tap target). Background: `bg-slate-100`.

### State B — Partial (some inputs selected, not all)

Trigger: At least one input selected, not all required inputs complete.

Drawer rendering: identical structure to State A, with updated text:
- Count: `[X] of [N] selected` — `text-slate-600 font-medium`
- Right text: `[N-X] more to complete` — `text-xs text-slate-400`

Still not tappable. Still `bg-slate-100`.

### State C — Complete, Low or Moderate Risk

Trigger: All required inputs selected AND severity is Low or Moderate.

Drawer rendering:
```html
<div class="absolute bottom-0 left-0 right-0 bg-white drawer-collapsed"
     style="border-top: 1px solid [severity-border-color];">
  <button class="w-full flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 transition-colors">
    <div class="flex items-center gap-3">
      <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Interpretation</div>
      <div class="text-sm font-medium text-slate-900">[Severity label] · [Key stat]</div>
    </div>
    <svg class="text-slate-400 drawer-chevron-hint"><!-- chevron up --></svg>
  </button>
</div>
```

Border-top color by severity:
- Low: `#e2e8f0` (slate-200)
- Moderate: `#fed7aa` (amber-200)

The collapsed drawer is now tappable (full-width `<button>`). Tap → transitions to expanded view. Chevron points up (`18 15 12 9 6 15`).

`drawer-chevron-hint` animation:
```css
@keyframes chevron-bounce {
  0%, 60%, 100% { transform: translateY(0); }
  30% { transform: translateY(-3px); }
}
.drawer-chevron-hint {
  animation: chevron-bounce 2.4s ease-in-out infinite;
}
```

### State D — Complete, High Risk

Trigger: All required inputs selected AND severity is High or Severe.

**The drawer does NOT auto-expand.** State D differs from State C only in visual tokens (red severity colors). The discovery animation (§5.4) fires instead to signal completion. User must tap to expand.

Expanded drawer header bar (severity-tinted):
```html
<button class="w-full flex items-center justify-between px-5 py-3 bg-red-50 hover:bg-red-100 transition-colors">
  <div class="flex items-center gap-3">
    <div class="text-[10px] font-bold text-red-700 uppercase tracking-widest">Interpretation</div>
    <div class="text-sm font-medium text-red-700">[Severity] · [Key stat]</div>
  </div>
  <svg class="text-red-600"><!-- chevron down: 6 9 12 15 18 9 --></svg>
</button>
```

Border-top: `1px solid #fecaca` (red-200)

`drawer-expanded` shadow: `box-shadow: 0 -4px 24px rgba(15, 23, 42, 0.12)`

Note: the `drawer-just-available` CSS class (drawer-pulse keyframe) is retained in `index.css` for reference but is no longer applied by any component. See §5.4 for the replacement pattern.

### 5.1 Expanded Drawer Content Structure

Content appears in this order, with no exceptions:

```
1. Interpretation headline     text-slate-900 text-xl leading-tight font-semibold
2. Explanation paragraph       text-slate-600 leading-relaxed mt-3
3. Important callout           (if applicable — §4.5) mt-5
4. See also section            mt-5 pt-4 border-t border-slate-100
5. Citation + disclaimer       mt-5 pt-4 border-t border-slate-100
```

"See also" section:
```html
<div class="mt-5 pt-4 border-t border-slate-100">
  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">See also</div>
  <p class="text-sm text-slate-600 leading-relaxed">
    <a href="..." class="text-neuro-600 hover:underline">[Link]</a>
    <span class="text-slate-300 mx-2">·</span>
    <!-- additional links separated by · -->
  </p>
</div>
```

"See also" links must correspond to outbound edges in docs/link-graph.json for this calculator node. SEO Specialist maintains this mapping.

Max drawer height when expanded: `max-h-[60vh] overflow-y-auto` on the content div.

### 5.2 Drawer Header Text — Responsive Rules

The collapsed drawer header must render in a **single line at 375px viewport width** (iPhone SE, the minimum supported device).

**Format rule:**
```
{Severity label} · {primary stat}
```
- Severity label: "Low risk", "Moderate risk", "High risk"
- Primary stat: percentage only — `{N}%`. No descriptor ("30-day mortality", "per 100 pt-yr", etc.).
- Stat descriptors belong in the expanded drawer's `explanation` prose only.

**Width budget at 375px:**
- Viewport: 375px
- Drawer `px-5` padding: 40px (20px each side)
- "INTERPRETATION" label + `gap-3`: ~124px
- Chevron + spacing: ~32px
- Available for severity + stat text: ~179px

**Maximum collapsed header string: 40 characters.** This provides margin against font rendering variation.

Content Writer must verify character count before sign-off:
```bash
echo -n "Moderate risk · 26%" | wc -c  # → 19 — passes
```

Computed lengths for ICH Score (reference):
| Score range | Collapsed header string | Length |
|-------------|------------------------|--------|
| 0 | "Low risk · 0%" | 13 |
| 1 | "Low risk · 13%" | 14 |
| 2 | "Moderate risk · 26%" | 19 |
| 3 | "High risk · 72%" | 15 |
| 4 | "High risk · 97%" | 15 |
| 5–6 | "High risk · 100%" | 16 |

### 5.3 Drawer Vertical Positioning

The drawer portal must sit **above the global mobile tab bar**, not beneath it.

**CSS variable (defined in `index.css @theme {}`):**
```css
--tab-bar-height: 4.5rem;  /* 72px — mobile bottom nav measured height */
```

The Layout.tsx mobile nav does not have an explicit `h-16` class; its height is content-driven (~73px on non-safe-area devices). `4.5rem` is the canonical value.

**Drawer portal bottom offset:**
```tsx
style={{ bottom: 'calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))' }}
```

Do **not** hardcode a pixel value. If Layout.tsx changes the tab bar height, update `--tab-bar-height` in `index.css`; all calculator drawers inherit the fix automatically.

**Z-index:** The drawer portal must use `z-[55]` — above the tab bar (`z-50`) and below toast notifications (`z-[60]`). This is a gap in the CLAUDE.md z-index table; `z-[55]` is the designated slot for calculator drawer portals.

**Mobile-First Developer sign-off must verify:**
- No tab bar overlap on 375px, 390px, 414px viewports
- Drawer fully visible above tab bar in States C and D (both collapsed and expanded)

### 5.4 Discovery Animation

When the score transitions from incomplete to complete, a discovery animation plays once to signal the drawer is ready. The drawer stays collapsed — the user must tap to expand.

**Trigger:** `isComplete` changes from `false` to `true` (final input selected).
**Duration:** One-shot per completion event. Resets when user de-selects an input and re-completes.
**Loop:** Off. Three chevron iterations total (3 × 0.6s = 1.8s), then still.

**Animation pattern — chevron bounce only:**
```css
@keyframes discovery-chevron {
  0%, 100% { transform: translateY(0); }
  50%       { transform: translateY(-4px); }
}
.drawer-discovery-chevron {
  animation: discovery-chevron 0.6s ease-in-out 3;
}
@media (prefers-reduced-motion: reduce) {
  .drawer-discovery-chevron { animation: none; }
}
```

The chevron uses severity-tinted color (`tokens.chevronClass`) during the discovery bounce, providing a severity cue in the collapsed state. After 1.8s, the standard `drawer-chevron-hint` (subtle continuous bounce) takes over.

**State management in component:**
```typescript
const [justCompleted, setJustCompleted] = useState(false);
const wasCompleteRef = useRef(false);

useEffect(() => {
  if (isComplete && !wasCompleteRef.current) {
    wasCompleteRef.current = true;
    setJustCompleted(true);
    const timer = setTimeout(() => setJustCompleted(false), 1800);
    return () => clearTimeout(timer);
  }
  if (!isComplete && wasCompleteRef.current) {
    wasCompleteRef.current = false;
    setJustCompleted(false);
  }
}, [isComplete]);
```

**Applies when:** drawer is collapsed (`!drawerOpen`) AND `justCompleted === true`.
When drawer is open, the chevron is a static down-arrow; animation class is not applied.

**Replaces:** State D auto-expand + `drawer-just-available` pulse (both removed in v1.0.2).

---

## §6 Severity Threshold Rules

Thresholds are sourced from primary literature. Medical Scientist agent owns these values and must cite the source in pre-flight for any change.

| Calculator | Low | Moderate | High / Severe |
|------------|-----|----------|----------------|
| ICH Score | 0–1 | 2 | 3–6 |
| NIHSS | 0–4 | 5–15 | 16–42 |
| HAS-BLED | 0–1 | 2 | 3–9 |
| GCS | 13–15 (mild) | 9–12 | 3–8 (severe) |
| ABCD2 | 0–3 | 4–5 | 6–7 |
| ASPECTS | 8–10 (good) | 6–7 | 0–5 |
| RoPE | 7–10 (high cryptogenic probability) | 4–6 | 0–3 |

Note: GCS is inverse — lower score indicates worse severity. The severity mapping for drawer state follows the clinical severity direction (low GCS → high risk drawer state).

**Severity → drawer header color mapping:**

| Severity | Border-top | Header bg | Header text | Chevron |
|----------|-----------|-----------|-------------|---------|
| Low | slate-200 `#e2e8f0` | white | `text-slate-900` | `text-slate-400` |
| Moderate | amber-200 `#fed7aa` | amber-50 | `text-amber-700` | `text-amber-700` |
| High | red-200 `#fecaca` | red-50 | `text-red-700` | `text-red-600` |

---

## §7 SEO and Link Graph Requirements

Every calculator page must satisfy these requirements before any commit that touches it passes Gate 4 (SEO Specialist).

### 7.1 Route Metadata

Entry in `src/config/routeManifest.ts`:
- `title`: `"[Calculator Name] Calculator | NeuroWiki"` — 50–60 chars
- `description`: keyword-rich, 150–160 chars, includes primary search term and clinical use case
- `keywords`: primary term + "calculator", "score", "neurology", relevant condition

### 7.2 Structured Data

Two JSON-LD schema blocks per calculator page:

**SoftwareApplication** (the interactive calculator tool):
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "[Calculator Name] Calculator",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" },
  "description": "[same as meta description]"
}
```

**MedicalWebPage** (the clinical content):
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "[Calculator Name] Calculator | NeuroWiki",
  "description": "[same as meta description]",
  "lastReviewed": "2026-04-17",
  "reviewedBy": { "@type": "Organization", "name": "NeuroWiki Medical Team" },
  "medicalAudience": { "@type": "MedicalAudience", "audienceType": "Clinician" },
  "about": { "@type": "MedicalCondition", "name": "[Condition]" }
}
```

`lastReviewed` must be updated whenever the calculator's clinical content changes.

### 7.3 Link Graph

Each calculator registers in `docs/link-graph.json` as:
```json
"calc/[slug]": {
  "type": "calculator",
  "title": "[Calculator Name] Calculator",
  "route": "/calculators/[slug]",
  "references": ["[node IDs of related pathways, trials, articles]"],
  "referencedBy": ["[node IDs of pages that link to this calculator]"]
}
```

The "See also" links in the expanded drawer must exactly match the `references` array for that node. No link appears in the UI without a corresponding edge in the graph, and vice versa.

**Stub-node exception:** When a referenced node has no registered route in `src/config/routeManifest.ts`, the "See also" link may be omitted from the rendered UI to avoid dead links. However, the edge must remain in `link-graph.json` for graph integrity. Referenced node IDs without routes should be added to the `stubs` array at the top of `link-graph.json` so orphan checks can distinguish intentional stubs from bugs. See §7.4 for the stubs array format.

### 7.4 Link-Graph Stubs Array Convention

Top-level `stubs` array in `link-graph.json` lists node IDs that are intentionally unrouted (referenced in the graph but have no live page yet):

```json
{
  "stubs": [
    "trial/hemphill-2001",
    "guideline/aha-ich-2022"
  ],
  "nodes": { ... }
}
```

**Orphan check protocol:** For every node ID referenced in any node's `references` or `referencedBy` array, confirm it exists as either a key in `nodes` or a string in `stubs`. Anything else is a broken reference and must be flagged before merge.

### 7.5 Heading Hierarchy

Each calculator page must have:
- Exactly one `<h1>`: the calculator name (visually present or as screen-reader-only — consult with Accessibility Specialist)
- `<h2>` for each input section (already specified as the section label)
- No `<h3>` or deeper without a parent `<h2>`

### 7.6 Canonical Tags

Each calculator page must emit a canonical `<link>` pointing to its own URL. No calculator page should be reachable at more than one URL without a canonical redirect.

---

## §8 File Organization

| Artifact | Location |
|----------|----------|
| Calculator page component | `src/pages/{Name}Calculator.tsx` |
| Calculator score data | `src/data/{name}ScoreData.ts` |
| Calculator types | Defined in score data file: `CalculatorInputs`, `CalculatorResult`, `CalculatorSeverity` |
| Shared utilities | `src/utils/clipboard.ts` — `copyToClipboard()` |
| Route registration | `src/config/routeManifest.ts` |
| SEO metadata | `src/config/routeManifest.ts` |
| Link graph | `docs/link-graph.json` |

**Shared patterns — do not reinvent:**
- `copyToClipboard(text, onSuccess?)` from `src/utils/clipboard.ts` — used by all Copy buttons
- `useNavigationSource` — tracks how user arrived (from pathway, from calculators index, direct)
- `useFavorites` — heart icon state, persisted in localStorage
- Score data file exports a typed `calculateScore(inputs: CalculatorInputs): CalculatorResult` function; never inline scoring logic in the component

**Calculator result type pattern** (canonical):
```typescript
interface CalculatorResult {
  score: number;
  maxScore: number;
  severity: 'low' | 'moderate' | 'high' | 'severe';
  label: string;       // e.g. "High risk"
  stat: string;        // e.g. "72% 30-day mortality"
  interpretation: string;  // prose for drawer headline
  explanation: string;     // prose for drawer paragraph
  seeAlso: string[];       // link-graph node IDs
}
```

This interface is the contract between the score data file and the page component. Medical Scientist owns `interpretation` and `explanation` copy; Content Writer writes the first draft, Medical Scientist verifies.

---

## §9 Changelog

```
2026-04-17 · v1.1 · Five amendments based on first swarm run (ICH Score).
  §1.3: Production Portal guidance added — drawer must use createPortal(drawer,
    document.body) with position fixed; absolute bottom-0 is mockup-only.
    Bottom offset: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px)).
    z-index: 55 (above tab bar z-50, below toast z-[60]).
  §7 (§7.1, §8): SEO file path corrected from src/seo/routeMeta.ts to
    src/config/routeManifest.ts (old path does not exist in the repo).
  §1.1, §6: text-amber-600 changed to text-amber-700 throughout for WCAG AA
    compliance. amber-600 = 3.09:1 against white (FAIL); amber-700 = 5.14:1 (PASS).
  §7.3: Stub-node exception added — unrouted referenced nodes may be omitted
    from UI "See also" links; edge must remain in link-graph.json; node ID must
    appear in stubs array.
  §7.4: New section added documenting link-graph.json stubs array convention and
    orphan check protocol. Former §7.4 (Heading Hierarchy) → §7.5.
    Former §7.5 (Canonical Tags) → §7.6.

2026-04-17 · v1.0.2 · Patch release.
  Removed State D auto-expand behavior. Drawer now always defaults collapsed.
  Added §5.4: discovery animation (chevron bounce 3×0.6s) fires once when score
  completes. Replaces drawer-pulse + hasAutoExpanded pattern.
  Updated State D description: visual tokens unchanged; auto-expand removed.
  drawer-just-available CSS class retained in index.css for reference only.
  Humanizer pass on ICH Score copy (ichScoreData.ts):
    - Moderate explanation: 3 em-dashes removed; passive "was derived" → active
      "Hemphill et al. designed"; double em-dash construction eliminated.
    - High explanation: 2 em-dashes in final sentence → parentheses.
    - Low explanation: clean, no changes.

2026-04-17 · v1.0.1 · Patch release.
  Two additions to §5: drawer header text single-line rule (§5.2) and drawer
  vertical positioning above global tab bar (§5.3). Both surfaced as bugs
  during ICH Score rebuild browser testing on 375px viewport.
  §5.2: collapsed header stat format shortened to "{N}%" only; descriptor
    moves to expanded prose. 40-char maximum enforced.
  §5.3: --tab-bar-height CSS variable (4.5rem) added to index.css @theme;
    drawer portal uses calc(var(--tab-bar-height) + env(safe-area-inset-bottom))
    instead of hardcoded pixel value. Drawer z-index raised to z-[55] (above
    tab bar z-50, below toast z-[60]).

2026-04-17 · v1.0 · Initial spec locked.
  Three archetypes documented. Bottom drawer state machine established.
  Severity thresholds sourced from primary literature (see §6).
  SEO requirements codified (§7). File organization and type contracts defined (§8).
  Companion mockup: docs/specs/mockups/calculator-reference.html
  Author: Design Prototyper + UI Architect (Build Engineer install session)
  Approved by: PM (human) — pending
```
