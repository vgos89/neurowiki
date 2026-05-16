# Pattern A content audit — 2026-05-16

**Scope:** post-ship audit of v3 Pattern A rebuild (EVT 5810364, SE 52c8371, Migraine 03b55ab).
**Trigger:** V flagged the live SE pathway as visually broken — JSX shell rebuild did not audit inner content.
**Status:** findings only. Fix pass is the next swarm.

---

## A. Primitive-level findings

### A-1. PathwayRail — vertical rail segment is zero-height (primitive bug)

**File:** `src/components/pathways/PathwayRail.tsx` lines 179–181.

```tsx
{stepNumber > 1 && (
  <div className={`absolute left-[10px] top-0 bottom-[100%] w-0 ${segmentClass}`} style={{ height: '0' }} />
)}
```

The rail segment above each node is an absolute-positioned div with `bottom-[100%]` (which should grow upward into the parent's space) **and** `style={{ height: '0' }}` hardcoded inline — the inline style wins over `bottom-[100%]`, so the rail segment renders as zero height. The vertical connector line between steps is therefore invisible. The rail coloring (cobalt traversed / slate untraversed) works class-wise but the element is never visible.

**Classification:** primitive bug. Every pathway that uses `PathwayRailStep` is affected — all three pathway files have invisible inter-step rail segments.

**Spec reference:** PATHWAY_SPEC §3.1 — "A left-border line running down the content column communicates traversal state."

---

### A-2. PathwayRail — node not centered on rail line (primitive bug)

**File:** `src/components/pathways/PathwayRail.tsx` lines 186–191.

The node column is a flex column with `width: 20px` and the node uses `mt-0.5`. The spec (§3.2) requires the node center to sit on the rail border line via a negative `margin-left` offset. The current implementation never applies a negative margin-left — the node sits at the left edge of the 20px column, not centered on the rail. This means even if the rail segment were visible (A-1), the dot would not sit on the line.

**Classification:** primitive bug.

---

### A-3. PathwayLearningPearl — no Lightbulb / sparkle icon; small dot is not a pearl visual (primitive gap)

**File:** `src/components/pathways/PathwayLearningPearl.tsx` lines 53–57.

```tsx
<span className="w-1.5 h-1.5 rounded-full bg-neuro-500 flex-shrink-0" aria-hidden="true" />
<span className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
  {title}
```

The pearl summary trigger shows a 6px neuro-500 dot and the title in `text-[11px] uppercase slate-500`. There is no lightbulb, book, or sparkle icon that would make this element visually read as a "pearl" rather than a generic section label. V's finding: "ESETT pearl row has no Lightbulb icon, no pearl pill styling — generic bullet+chevron row." The primitive does use `<details>/<summary>` which at least provides chevron rotation, but the visual register does not communicate "pearl" at a glance — it reads as a hairline section.

The spec (§4.5) does not mandate a specific icon for pearls (it defers to visual register used in the EVT reference mockup). The v3 warmth mockup uses an inline sparkle/book SVG within the pearl summary. The current 6px dot is too small and too generic to read as the pearl differentiator.

**Classification:** primitive gap (the primitive renders correctly structurally, but the visual identity token is too weak — this is a primitive design decision, not a usage error by any pathway file).

---

### A-4. PathwayCategoryRow — `variant: 'danger'` is still functional inside the accordion (primitive deviation from spec)

**File:** `src/components/pathways/PathwayCategoryRow.tsx` lines 148–155.

The spec (PATHWAY_SPEC §4.2, §11 anti-pattern #6) explicitly states: "input state is only 'selected/not selected'; consequence is in the drawer. The previous EVT pattern of `variant='danger'` painting individual buttons red is **out of spec**."

The primitive `PathwayCategoryRow` still accepts and renders `variant: 'danger'` — it applies `border-red-500 bg-red-50` for selected danger options and `text-red-700` for unselected danger option labels. The option contract even has `variant?: 'default' | 'danger'` in `CategoryOption`. This means any pathway that passes `variant: 'danger'` on options will render red-tinted selections inside accordions — exactly the pattern the spec banned.

**Classification:** primitive bug (the primitive should not support the `danger` variant at all; its presence invites usage violations).

---

### A-5. PathwayCascadeNotice — Undo button min-h/min-w forces pill to be very tall (primitive layout bug)

**File:** `src/components/pathways/PathwayCascadeNotice.tsx` line 107.

```tsx
className="ml-2 px-2 py-0.5 -my-0.5 bg-white border border-slate-300 rounded-full text-xs text-slate-700
           hover:bg-slate-100 hover:border-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center ..."
```

The spec (§3.6) says the Undo button is `px-2 py-0.5 -my-0.5` — a small inline pill that sits inside the cascade notice. Adding `min-h-[44px] min-w-[44px]` to a button inside an `inline-flex` pill container forces the outer cascade notice pill to at least 44px tall — the spec intends a compact inline pill, not a 44px block inside the notice. The `-my-0.5` negative margin was supposed to compensate, but it does not fully cancel the `min-h-[44px]` overflow because flexbox ignores negative margins for size computation.

**Classification:** primitive bug (the 44px touch-target goal is correct per §8 but should be achieved via a `p-3 -m-3` wrapper on the Undo button, not by inflating the visible element height).

---

## B. Cross-pathway findings (apply to all 3 files)

### B-1. Duplicate step-progress indicators — header dots + PathwayRail (all 3 files)

All three files render their own step-progress dot strip inside the sticky header **in addition to** the `PathwayRailStep` vertical rail. The spec (§3 / §3.9) explicitly abolished the horizontal dots strip: "The rail IS the step-progress indicator. The horizontal strip is abolished; there is no strip element in the header or immediately below it."

| File | Header dots location | Lines |
|---|---|---|
| `StatusEpilepticusPathway.tsx` | Center cluster of sticky header, 4 `<button>` dots with emerald check + red active number | 264–283 |
| `MigrainePathway.tsx` | Center cluster of sticky header, 5 `<button>` dots with emerald check + cobalt active number | 451–466 |
| `EvtPathway.tsx` | Center cluster of sticky header, 4 `<button>` dots with emerald check + cobalt active number | 1029–1046 |

**Additionally**, EVT renders a second mobile progress strip at the bottom action bar (lines 1776–1784) — a 4-segment horizontal bar strip. That is a third step indicator on the same page.

**Classification:** usage bug × all 3 files. The header dot clusters and the bottom strip exist in the rebuilt JSX alongside `PathwayRailStep` and should be removed.

---

### B-2. Icon-tile flourish in sticky header (all 3 files)

All three files wrap an icon in a colored tile (`p-1.5 rounded-md`) in the header's left cluster. The spec (PATHWAY_SPEC §2 + §11 anti-pattern #10) forbids this: "The icon-tile flourish in header (`<div className="p-1.5 bg-neuro-100 text-neuro-700 rounded-md">`) wrapping the Zap icon is out of spec — left cluster is eyebrow + name only."

| File | Icon tile | Lines |
|---|---|---|
| `StatusEpilepticusPathway.tsx` | `<div className="p-1.5 bg-red-100 text-red-700 rounded-md shrink-0"><Activity size={16} /></div>` | 257–259 |
| `MigrainePathway.tsx` | `<div className="p-1.5 bg-neuro-100 text-neuro-700 rounded-md shrink-0"><Skull size={16} /></div>` | 443–445 |
| `EvtPathway.tsx` | `<div className="p-1.5 bg-neuro-100 text-neuro-700 rounded-md shrink-0"><Zap size={16} /></div>` | 1020–1022 |

**Classification:** usage bug × all 3 files.

---

### B-3. Header uses `lucide-react`'s `ArrowLeft` instead of canonical SVG (all 3 files)

Spec (§2 hard rule / §11 anti-pattern #3): "Use the canonical back-arrow SVG, NOT `lucide-react`'s `ArrowLeft`."

| File | Import | Back button | Lines |
|---|---|---|---|
| `StatusEpilepticusPathway.tsx` | `import { ArrowLeft, ... } from 'lucide-react'` | `<ArrowLeft size={16} aria-hidden="true" />` | line 3; 254 |
| `MigrainePathway.tsx` | `import { ArrowLeft, ... } from 'lucide-react'` | `<ArrowLeft size={16} aria-hidden="true" />` | line 3; 441 |
| `EvtPathway.tsx` | `import { ArrowLeft, ... } from 'lucide-react'` | `<ArrowLeft size={16} aria-hidden="true" />` | line 4; 1017 |

Canonical SVG: path `M19 12H5M12 19l-7-7 7-7`, 20×20, strokeWidth 2.

**Classification:** usage bug × all 3 files.

---

### B-4. Header title uses `font-black` instead of spec-compliant `font-semibold` (all 3 files)

Spec (PATHWAY_SPEC §7): pathway name class = `text-[15px] font-semibold text-slate-900 leading-tight tracking-tight`.

| File | Actual class | Lines |
|---|---|---|
| `StatusEpilepticusPathway.tsx` | `text-sm font-black text-slate-900 truncate` | 261 |
| `MigrainePathway.tsx` | `text-sm font-black text-slate-900 truncate` | 447 |
| `EvtPathway.tsx` | `text-sm font-black text-slate-900 truncate` | 1024 |

Also: `text-sm` (14px) is used instead of `text-[15px]`. Both weight and size deviate.

**Classification:** usage bug × all 3 files. Also a §7 / §11 anti-pattern #8 violation (font-black is explicitly called out as out of spec in the spec).

---

### B-5. Header eyebrow "PATHWAY" label entirely absent (all 3 files)

Spec (§2): "Identifier block (two-line stack): Eyebrow label — pathway category: `text-[10px] font-bold text-slate-400 uppercase tracking-widest`. Content: `PATHWAY`."

None of the three pathway files render an eyebrow label above the pathway name in the header. The header left cluster contains: back-arrow button → icon-tile → pathway name. The `PATHWAY` eyebrow is absent entirely.

**Classification:** usage bug × all 3 files.

---

### B-6. No `Copy` button in header right cluster (all 3 files)

Spec (§2): "Three buttons, in this order: Favorite, Reset, Copy button — always present, regardless of completion state. Label: `Copy` (plain text; no icon)."

| File | Right cluster | Lines |
|---|---|---|
| `StatusEpilepticusPathway.tsx` | Favorite + Reset only (no Copy) | 285–293 |
| `MigrainePathway.tsx` | Favorite + Reset only (no Copy) | 469–476 |
| `EvtPathway.tsx` | Favorite + Reset only (no Copy) | 1049–1056 |

EVT's Copy is only accessible after reaching Step 4 (bottom action bar `Copy to EMR` at line 1795) and inside the result card (line 1652) — both are out-of-spec locations per §5.4 and §2.

**Classification:** usage bug × all 3 files.

---

### B-7. `max-w-3xl` page wrapper instead of `max-w-2xl` (all 3 files)

Spec (§9 + §11 anti-pattern #9): "Page root: `max-w-2xl mx-auto px-5`."

| File | Actual wrapper | Lines |
|---|---|---|
| `StatusEpilepticusPathway.tsx` | `max-w-3xl mx-auto` | 247 |
| `MigrainePathway.tsx` | `max-w-3xl mx-auto` | 432 |
| `EvtPathway.tsx` | `max-w-3xl mx-auto` | 1009 |

**Classification:** usage bug × all 3 files.

---

### B-8. Step body cards use `bg-white border border-slate-100 rounded-xl p-4` — this is correct per design-tokens skill, but a flat `space-y-1` wrapper is used inconsistently

In SE (line 318), the step body is `<div className="space-y-1 bg-white border border-slate-100 rounded-xl p-4">` — the card and content are correct. However, in Migraine (line 516) and EVT (line 1095), the same `p-4 rounded-xl` card wraps the content correctly. This is **not a violation** but is noted for completeness — all three correctly use the section card token.

---

### B-9. PathwayCascadeNotice is placed outside the step body in EVT — wrong per spec (EVT-specific, noted here because SE skips it entirely)

Spec (§3.6): "The notice is rendered **inline** at the field-row level by EvtPathway.tsx, immediately below the changed category-row." In EVT (lines 1062–1071), the cascade notice is rendered at the **top of the rail container** — above all step blocks — not inline beneath the changed category-row. SE explicitly skips the cascade notice (comment at line 775 of SE file). Migraine places it correctly inside the Safety Profile panel (line 801 in Migraine).

**Classification:** EVT-specific usage bug (moved to Section C). Migraine is correct. SE skip is a documented decision.

---

## C. EVT-specific findings

### C-1. PathwayBottomDrawer still used — deprecated component (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 17, 1836–1845.

```tsx
import { PathwayBottomDrawer, type PathwayTier } from '../components/pathways/PathwayBottomDrawer';
...
{result && (
  <PathwayBottomDrawer
    pathwayName="EVT" tier={evtStatusToTier(result.status)}
    tierLabel={...} action={result.reason} notes={...}
  />
)}
```

PATHWAY_SPEC §5 hard rule: "Pathways MUST NOT hand-roll a drawer. Pathways render their interpretation through `<CalculatorDrawer>`." The `PathwayBottomDrawer` is explicitly deprecated. EVT is the only file still importing and using it.

**Classification:** EVT usage bug — severity: high (this is a §5 hard rule violation).

---

### C-2. Result card in Step 4 body — should live in the drawer, not the step body (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 1659–1705.

The Step 4 body renders a full result card with `border-l-[8px]` colored stripe, `text-5xl font-black` status headline (§11 anti-pattern #8), `text-emerald-900 / text-amber-900 / text-red-900` body text (§11 anti-pattern #12), and an embedded "Copy to EMR" button (§11 anti-pattern #7). Per spec §5.4, the result lives in the drawer's expanded content — not as a card inside the step.

**Specific token violations:**
- `border-l-[8px]` — arbitrary value (no token); spec uses `CalculatorDrawer` border, not arbitrary left-border on a result card (line 1660)
- `text-5xl font-black tracking-tight` for result.status — spec §7 / §11 #8 explicit violation (line 1675)
- `text-emerald-900 / text-amber-900 / text-red-900` — non-spec body text colors; spec §6 tier tokens do not include these body-text values (lines 1676–1679)
- Assessment Summary card as a separate white card inside Step 4 — should be inside drawer per §5.5 (lines 1624–1646)
- "Copy to EMR" black button inside Step 4 body (line 1652) — §11 anti-pattern #7: "copy lives in the header, not in the drawer"

**Classification:** EVT usage bugs — multiple, all within Step 4.

---

### C-3. Material Symbols font usage in Imaging step (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 1381, 1484.

```tsx
<span className="material-symbols-outlined text-[18px]">calculate</span>
```

PATHWAY_SPEC §11 anti-pattern #13: "Material Symbols font usage (`<span class="material-symbols-outlined">calculate</span>`) is out of spec — icons are React components from `src/components/icons/` or shared `Chevron`."

This renders the ASPECTS calculator button in both the 0–6h and 6–24h imaging sections. The icon may not render if the Material Symbols font is not loaded, falling back to a text glyph.

**Classification:** EVT usage bug.

---

### C-4. Mobile bottom action bar is a third step-progress indicator (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 1773–1798.

The `#evt-action-bar` contains a mobile-only 4-segment horizontal progress bar (lines 1776–1784) that colors segments emerald (complete), neuro-500 (active), or slate-200 (locked). This is redundant with: (1) the header dots (B-1) and (2) the PathwayRail. Three step indicators simultaneously. The spec has one: the vertical rail.

**Classification:** EVT usage bug (extension of B-1 finding).

---

### C-5. Back/Next navigation buttons in bottom action bar persist across all steps (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 1786–1798.

The bottom action bar provides persistent Back and Next buttons outside the Pattern A content container. Pattern A's navigation model is: category-row selections auto-advance within a step; branch chips allow backward navigation; there is no explicit Next/Back button outside of the `<section>` boundaries. The Next button at line 1789 is the primary navigation mechanism — meaning the auto-scroll-to-next-field behavior (cascade logic) is supplemental, not primary.

This is not explicitly named as an anti-pattern in the spec but conflicts with §4.1 ("the current EVT canary uses `CollapsibleSection` per step ... this is out of spec and rebuilt as a single-active-step view") — the implication being that step-level navigation is managed by the rail + category-row completion detection, not by explicit Back/Next buttons outside the content column.

**Classification:** EVT usage deviation. The bottom bar may have been retained intentionally for the EVT rebuild as a pragmatic accommodation; flag for fix-pass decision.

---

### C-6. Step content is wrapped in extra `<div ref={...} className="scroll-mt-4">` wrappers (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 1074, 1232, 1335, 1614.

Each `PathwayRailStep` is wrapped in a `<div ref={el => { sectionRefs.current[N] = el; }} className="scroll-mt-4">`. PATHWAY_SPEC §11 anti-pattern #14: "Step content scrolled by section ref + `scroll-mt-4`" is listed as out of spec. The spec's single-active-step view does not require scroll-to-section refs; the section refs are a relic of the old accordion-stack pattern.

**Classification:** EVT usage bug.

---

### C-7. CascadeNotice rendered at top of rail container, not inline below changed field (EVT only)

**File:** `src/pages/EvtPathway.tsx` lines 1062–1071.

```tsx
{cascadeEvent && (
  <PathwayCascadeNotice
    visible={true}
    changedFieldLabel={...}
    clearedFields={...}
    onUndo={handleCascadeUndo}
    onDismiss={handleCascadeDismiss}
  />
)}
```

This notice sits above all step blocks (before the `PathwayRailStep` for Step 1). Spec §3.6: "The notice is rendered **inline** in the step body, immediately below the changed category-row."

**Classification:** EVT usage bug.

---

## D. SE-specific findings

### D-1. Completed-summary renders as a PathwayBranchChip positioned as floating text (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 307–315.

```tsx
{isSection0Complete && activeSection !== 0 && getSummary(0) && (
  <div className="mb-3">
    <PathwayBranchChip
      targetFieldId="field-weight"
      label={getSummary(0)!}
      onClick={() => setActiveSection(0)}
    />
  </div>
)}
```

V's finding: "Step 2 completed-summary renders as floating text under the eyebrow. Should be the cobalt-left-bar summary pattern the EVT rebuild uses."

The `PathwayBranchChip` renders correctly as a spec-compliant pill. However the positioning is at the top of the step's child area, before the content card — which is correct per §3.4 (chip appears between completed step's last option row and the next step's node). The visual issue V observed is that when `activeSection !== 0` and the step is completed, the chip floats without visual connection to the rail. This is actually the intended Pattern A behavior, but the chip appears beneath the step eyebrow with no surrounding context since the `bg-white ... rounded-xl p-4` card is hidden. The floating appearance results from the chip having no visual card beneath it to anchor it spatially.

The spec's §3.7 "completed-step row" pattern calls for a cobalt-left-bar completed row (`border-l-2 border-neuro-500 bg-neuro-50`) — but in SE the step body card collapses entirely when `activeSection !== N`, leaving only the chip. The EVT rebuild (for comparison) shows the same pattern; the chip also floats in EVT when a step is complete and not active.

**Root cause:** Pattern A spec says the branch chip appears **between** the completed step's last row and the next step's node — but only if the step body collapses entirely. When no card is shown beneath the chip, the chip hangs visually. The fix-pass should decide: either keep the chip-only collapsed state (matching spec §3.4 exactly) or show the chip inside a minimal cobalt-row container.

**Classification:** SE usage ambiguity vs. spec interpretation. Not an outright violation but requires fix-pass decision.

---

### D-2. Dose display card uses `text-2xl font-black` — spec requires `text-base font-mono font-semibold` (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 436–449 (Stage 1 BZD dose) and lines 610–613 (Stage 2 ESETT dose) and lines 699–704 (Stage 3 infusion dose).

Stage 1 dose card:
```tsx
<div className="bg-slate-50 border border-slate-100 rounded-xl p-4 mt-1">
  <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Calculated Dose</div>
  <div className="text-2xl font-black text-slate-900 mb-1">
    {calculateDose(stage1Agent, patient.weight)}
  </div>
</div>
```

Stage 2 dose card (line 612):
```tsx
<div className="text-xl font-black text-slate-900">{calculateDose(finalStage2, patient.weight)}</div>
```

Stage 3 dose card (line 702):
```tsx
<div className="text-2xl font-black text-slate-900">{calculateDose(stage3Agent, patient.weight)}</div>
```

PATHWAY_SPEC §4.8 (Dose result row): "Computed dose value: `text-base font-mono font-semibold text-slate-900` (monospace because clinical doses must read as values, not prose)." The `font-black` + large size is not the spec token. Additionally, §4.8 anti-pattern: "Do NOT use `text-4xl` or `text-5xl` for the dose value. `text-base font-mono font-semibold` is the spec-compliant register."

While `text-2xl` is not `text-4xl`, it still deviates from the spec token.

**Classification:** SE usage bug × 3 dose display sites. Also violates the `font-black` prohibition that exists throughout the spec.

---

### D-3. Dose display card is not a §4.8 Dose Result Row — it is an ad-hoc card with wrong anatomy (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 436–449.

The spec (§4.8) defines the Dose Result Row as:
- Row container: `border-t border-b border-slate-200 px-5 py-3 -mx-5` (hairline-divided, full-bleed within the step body)
- Eyebrow: `text-[10px] font-bold text-slate-500 uppercase tracking-widest`
- Body row: `flex items-center justify-between gap-3 mt-1` with agent label left, dose value right
- Computed-from hint: `text-[10px] text-slate-400 mt-1`
- Copy button for dose string

The actual SE implementation uses a `bg-slate-50 border border-slate-100 rounded-xl p-4` card — not a full-bleed hairline-divided row. There is no agent label on the left, no computed-from hint, no dose copy button. The eyebrow uses `text-slate-400` (correct) but the dose value typography is wrong (D-2). The anatomy does not match §4.8 at all.

**Classification:** SE usage bug — the §4.8 Dose Result Row pattern was not applied; an ad-hoc card was used instead.

---

### D-4. "Mark First Dose Given" is a bespoke full-width red button — not a Pattern A element (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 455–458.

```tsx
<button
  onClick={() => setStage1FirstDoseGiven(true)}
  className="w-full mt-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 ..."
>
  Mark First Dose Given
</button>
```

This is a bespoke full-width red confirmation button. It is not a §4.7 Outcome Row (which captures "did the intervention work?"), not a §3.7 category row, and not a §4.2 tri-button. The spec §4.7 defines the outcome row as the Pattern A element for "what happened after the intervention" — a two-button binary grid (Stopped / Persists) at `min-h-[60px] rounded-2xl`. The "Mark First Dose Given" confirmation step is an intermediate state that has no spec-defined Pattern A analog. It adds a pre-outcome confirmation not in the spec and is visually inconsistent.

**Classification:** SE bespoke element without Pattern A mapping. Requires fix-pass decision on whether to fold this into the §4.7 Outcome Row or treat it as a transitional state.

---

### D-5. Outcome buttons are bespoke colored block buttons — not §4.7 Outcome Row anatomy (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 469–471 and 482–483.

```tsx
<button onClick={() => setStage1Success(true)}
  className="py-3 bg-emerald-500 text-white font-bold rounded-xl ...">Stopped</button>
<button onClick={() => setStage1SecondDoseGiven(true)}
  className="py-3 bg-red-500 text-white font-bold rounded-xl ...">Persists — Repeat Dose</button>
```

V's finding: "Bespoke 'Seizure Stopped' / 'Persists — Refractory' big block buttons — old outcome-button pattern."

The spec §4.7 defines the outcome row anatomy:
- Container: `grid grid-cols-2 gap-3 mt-2` (two equal-width columns)
- Stopped (resting): `min-h-[60px] rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm`
- Persists (resting): `min-h-[60px] rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm`
- Selected states use the filled version of the same color family

The actual buttons use `bg-emerald-500 text-white` (full fill, white text) and `bg-red-500 text-white` (full fill, red background — spec explicitly forbids red for Persists). They use `rounded-xl` not `rounded-2xl`, `font-bold` not `font-semibold`, `py-3` not `min-h-[60px]`, and there is no eyebrow label.

Also: §4.7 anti-pattern: "Do NOT use red (`bg-red-50 border-red-200`) for the Persists button." The actual implementation uses `bg-red-500 text-white` — even more severe than the forbidden subtle version.

The same bespoke pattern repeats at lines 482–483 (second dose outcome) and lines 617–618 (Stage 2 outcome).

**Classification:** SE usage bug × 3 outcome sites. Correcting to §4.7 anatomy is a moderate refactor.

---

### D-6. Stage 2 dose card is embedded inside `ref={stage2DoseRef}` inside a category-row div — wrong placement (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 594–613.

The Stage 2 ESETT agent selection row (`<PathwayCategoryRow label="Stage 2 ASM (ESETT-equivalent)" .../>`) and the dose card are both inside `<div id="field-stage2-agent" ref={stage2DoseRef}>`. The spec §4.8 says the dose result row should be the **first child** inside the step body, not embedded after the category-row. The dose is therefore hidden until the user scrolls — contradicting the §4.8 intent of persistent dose visibility.

**Classification:** SE usage bug — dose row placement.

---

### D-7. V's finding: "PathwayCategoryRow label/value hierarchy is inverted — large/bold on top, small/light/right-aligned for value" (SE — partial usage, partial correctness)

**File:** `src/components/pathways/PathwayCategoryRow.tsx` lines 114–128 (resting state).

```tsx
<span className="text-[0.9375rem] font-medium text-slate-900">{label}</span>
<span className="flex items-center gap-1.5 flex-shrink-0">
  {selectedOption ? (
    <span className="text-sm text-slate-500">{selectedOption.label}</span>
  ) : (
    <span className="text-sm italic text-slate-400">Tap to select</span>
  )}
```

In the resting state, the **left side** shows the category label (e.g., "Stage 2 ASM (ESETT-equivalent)") in `text-[0.9375rem] font-medium text-slate-900` and the **right side** shows the selected value in `text-sm text-slate-500`. Per spec §3.7: "`.cat-row-label` = `font-weight:500; color:#0f172a; font-size:0.9375rem`. `.cat-row-value` = `font-size:0.875rem; color:#64748b`."

The primitive is **correct** — label is prominent left, value is de-emphasized right. V's observation about inversion likely comes from what appears in a *completed step*, where `PathwayCategoryRow` with `stepCompleted={true}` (lines 93–103) renders:

```tsx
<span className="text-sm font-semibold text-neuro-700">{label}</span>
<span className="text-sm text-neuro-700 opacity-75 truncate">{selectedOption.label}</span>
```

In the SE context, when Step 3 is complete and `stepCompleted` is passed, the label ("Stage 2 ASM (ESETT-equivalent)") shows as `font-semibold text-neuro-700` and the value ("Valproate") shows as `text-neuro-700 opacity-75`. The label still dominates over the value — but because both are neuro-700 cobalt and the value is truncated, the selected value ("Valproate") looks subordinate to the long label. On a narrow screen, "Stage 2 ASM (ESETT-equivalent)" occupies most of the row and "Valproate" is clipped to the right, creating the perception that the important clinical value (the selected drug) is less prominent than the category label.

**Diagnosis:** the primitive hierarchy is technically correct per the spec token table, but the usability outcome is inverted when category labels are very long (>30 chars) and the value is a short drug name. This is a content/usage issue in SE, not a primitive bug. The fix is to shorten the SE category label: "Stage 2 ASM (ESETT-equivalent)" (34 chars) → "Stage 2 Agent" or "ESETT Agent".

**Classification:** SE usage bug (content — label too long for the row pattern).

---

### D-8. `copySummary` uses `alert()` for clipboard feedback — forbidden by spec (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` line 199.

```tsx
const copySummary = () => { navigator.clipboard.writeText(generateEMRText()); alert("Note copied to clipboard."); };
```

PATHWAY_SPEC §4.8 anti-pattern: "Do NOT trigger an `alert()` or modal on copy. The copy button uses inline icon-swap feedback only." The SE copy function uses `alert()` which blocks the UI and is explicitly forbidden.

**Classification:** SE usage bug.

---

### D-9. SE lacks the §4.8 "computed-from hint" on all dose displays (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 436–449, 610–613, 699–704.

The spec (§4.8): "Computed-from hint: `text-[10px] text-slate-400 mt-1` — always visible to confirm weight. Anti-pattern: Do NOT omit the 'Computed from {weight} patient' hint."

The SE dose cards show only the dose string (e.g., "4 mg IV"). None show a "Computed from 70 kg patient · 0.1 mg/kg, max 4 mg" hint. The formula is embedded in the dose string itself (e.g., "4 mg IV (0.1 mg/kg, max 4mg)") which provides partial information, but the patient weight confirmation is absent.

**Classification:** SE usage bug — three dose sites missing the hint.

---

### D-10. Glucose checkbox uses bespoke emerald/red toggle styling with `Check` lucide icon (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 349–360.

```tsx
<button className={`... ${patient.glucoseChecked ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-red-50 border-red-200 text-red-900'}`}>
  <div className={`w-5 h-5 rounded border ... ${patient.glucoseChecked ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-red-300'}`}>
    {patient.glucoseChecked && <Check size={13} className="text-white" />}
  </div>
```

The red default state of an unchecked safety item is a reasonable clinical intent (unchecked = risk unaddressed) but uses a bespoke color treatment that is not a §4.2 tri-button, not a §4.7 outcome row, and not a §3.7 category row. The `Check` icon from lucide is used inline. There is no spec precedent for a binary red/emerald checkbox toggle in Pattern A. The closest spec element would be a tri-button with "Checked / Not Checked" — or a category-row with two options.

**Classification:** SE usage bug — bespoke pattern without Pattern A mapping.

---

### D-11. Comorbidity chip cluster uses `min-h-[36px]` touch targets — below the 44px minimum (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` line 575.

```tsx
className={`px-3 py-1.5 text-xs font-bold rounded-full border ... min-h-[36px] ...`}
```

Spec (§8 + design-tokens skill "Touch targets"): "All interactive elements: `min-h-[44px] min-w-[44px]`." The comorbidity toggle chips use `min-h-[36px]` — 8px below the 44px minimum.

**Classification:** SE usage bug.

---

### D-12. "Proceed to BZD Stage" button uses `bg-red-600` and `rounded-xl` — not the spec Next button token (SE)

**File:** `src/pages/StatusEpilepticusPathway.tsx` lines 382–389.

```tsx
<button className="px-6 py-2.5 bg-red-600 text-white font-bold rounded-xl shadow-sm ...">
  Proceed to BZD Stage <ChevronRight size={16} />
```

Spec (§4.6) Next button: `bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium min-h-[44px]`. The SE button uses `bg-red-600` (not neuro-500), `rounded-xl` (not `rounded-full`), `font-bold` (not `font-medium`), and `shadow-sm` (not in spec — no arbitrary shadows). Also uses `ChevronRight` from lucide-react (§11 anti-pattern #3 — should use the shared `Chevron` component).

**Classification:** SE usage bug × 3 "Proceed" / "Next" buttons (also at lines 488, 617 pattern has similar non-spec treatment).

---

## E. Migraine-specific findings

### E-1. Safety Profile uses a native `<select>` for renal function — forbidden by spec (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 780–786.

```tsx
<select value={safety.renal} onChange={...} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 min-h-[44px]">
  <option value="normal">Normal (&gt;50)</option>
  ...
</select>
```

PATHWAY_SPEC §3.7 anti-pattern: "Do NOT use a native HTML `<select>` element." Renal function should be a `PathwayCategoryRow` with the four options as accordion entries.

**Classification:** Migraine usage bug.

---

### E-2. Care setting buttons use `border-2` — arbitrary class not in design tokens (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 704–714.

```tsx
<button className={`... border-2 transition-all ... ${careSetting === 'adequate' ? 'border-emerald-500 bg-emerald-50 ...' : 'border-slate-200 ...'}`}>
```

Design-tokens skill rule: "No `border-2`." These are the care-setting option buttons. They should use `border border-slate-200` (hairline, spec-compliant) or the §4.2 tri-button token for selected state: `border-neuro-500 bg-neuro-50`.

Also: `border-emerald-500 bg-emerald-50` for the "adequate" selected state deviates from the spec §6 tier tokens. Emerald is forbidden as a tier color in pathway outputs.

**Classification:** Migraine usage bug.

---

### E-3. Differential routing buttons use `border-2` and non-spec selection colors (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 595–617.

```tsx
<button className={`... border-2 transition-all touch-manipulation min-h-[44px] ${!differential.clusterPhenotype && ... ? 'border-neuro-500 bg-neuro-50' : 'border-slate-200 bg-white'}`}>
<button className={`... border-2 ... ${differential.clusterPhenotype ? 'border-amber-500 bg-amber-50' : 'border-slate-200 bg-white'}`}>
```

Spec §4.10 (Differential routing screen):
- Primary "Migraine — proceed" selected: `border-neuro-500 bg-neuro-50 hover:bg-neuro-100 hover:border-neuro-600` — correct (neuro selected).
- Non-primary selected: `border-neuro-500 bg-neuro-50 text-neuro-700` — the spec uses neuro tokens for selected non-primary, not amber.
- Resting buttons: `border border-slate-200 bg-white` (hairline) — not `border-2`.

The amber `border-amber-500 bg-amber-50` for cluster/TN selected state is non-spec; the spec says all selected differential options use neuro-50/neuro-500 tokens.

**Classification:** Migraine usage bug × differential routing section.

---

### E-4. Cluster terminal card uses `border-2 border-amber-300` — `border-2` not in tokens (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 640–661.

```tsx
<div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-4">
```

Design-tokens skill: no `border-2`. The cluster terminal card and TN terminal card both use `border-2`.

**Classification:** Migraine usage bug.

---

### E-5. Red flag buttons use `border` correctly but selected state uses `bg-red-100 border-red-300` (Migraine — potential spec deviation)

**File:** `src/pages/MigrainePathway.tsx` lines 537–545.

The red flag buttons for Step 1 use full-width toggle buttons with `bg-red-100 border-red-300 text-red-900` when flagged. This is a reasonable clinical design choice (red = danger flag) but deviates from §4.2 tri-button tokens (`border-neuro-500 bg-neuro-50 text-neuro-700` for selected). The selected state uses red rather than cobalt-selected.

**Rationale to potentially retain:** red for "danger flag activated" is semantically appropriate. However if the design system requires all selected states to use neuro-500/neuro-50 tokens (§4.2 spec says so), these need to be migrated.

**Classification:** Migraine usage deviation — clinically motivated but token-non-compliant.

---

### E-6. Safety toggles use a bespoke `SafetyToggle` component with `rounded-lg border` and `bg-red-100` active state — not a Pattern A element (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 390–400.

```tsx
const SafetyToggle = ({ label, active, onClick }) => (
  <button className={`px-3 py-3 rounded-lg text-sm font-bold border transition-all touch-manipulation ${
      active ? 'bg-red-100 text-red-800 border-red-200 shadow-inner' 
             : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
  }`}>
```

`rounded-lg` not `rounded-full` (spec: `rounded-full` for tri-buttons / §4.2). `shadow-inner` — not in design tokens. `font-bold` — not in spec (tri-button uses `font-semibold` selected). This is a chip cluster pattern (comorbidity toggles), not a tri-button, but the token deviations are present.

**Classification:** Migraine usage bug — bespoke component with non-spec tokens.

---

### E-7. `removedAlerts` legacy toast still present alongside `PathwayCascadeNotice` (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 480–490.

```tsx
{removedAlerts.length > 0 && (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
    <div className="bg-red-600 text-white px-4 py-3 rounded-xl shadow-2xl ...">
```

The file correctly wires `PathwayCascadeNotice` (line 801) for the §3.6 cascade behavior but **also** maintains a legacy fixed toast system (`removedAlerts` state, lines 258–305) that fires on the same safety→cocktail auto-deselect events. When a safety flag change removes a drug, both the red full-screen toast AND the `PathwayCascadeNotice` pill fire simultaneously.

PATHWAY_SPEC §3.6 anti-pattern: "cascade-clear MUST NOT be [a] toast, modal, or page-top banner — only the inline step-body notice is permitted." The `removedAlerts` toast is exactly the forbidden pattern. It was retained as a comment says "legacy fixed toast — keep for safety" (line 480).

**Classification:** Migraine usage bug — the cascade toast violates §3.6 and must be removed when `PathwayCascadeNotice` is the live replacement.

---

### E-8. Live cocktail summary (§4.9) absent — cocktail is invisible until Step 5 (Migraine)

**File:** `src/pages/MigrainePathway.tsx` — entire file.

The Migraine UX audit (CW-1) and PATHWAY_SPEC §4.9 require a live cocktail summary row rendering in the drawer (or sticky-within-step) during cocktail assembly in Step 3. The file has no `PathwayBottomDrawer` / `CalculatorDrawer` integration and no live cocktail row. The selected cocktail is only visible in Step 5's `generateSummary()` output rendered as a black card with `font-mono` text (lines 1213–1224).

This is the most clinically significant UX omission: the attending cannot answer "what are we giving?" without reaching Step 5.

**Classification:** Migraine usage gap — §4.9 pattern not implemented.

---

### E-9. Step 5 Treatment Plan uses `bg-slate-900 text-white ... font-mono` — not a Pattern A element (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 1213–1224.

```tsx
<div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden">
  <div className="relative z-10">
    <div className="flex items-center space-x-3 mb-4">
      <div className="p-2 bg-white/10 rounded-lg"><ClipboardCheck size={22} /></div>
      <h2 className="text-xl font-black">Treatment Plan</h2>
    </div>
    <div className="space-y-3 opacity-90 text-sm font-mono">
```

This is a bespoke dark card with `bg-slate-900`, `font-black`, `font-mono`, `shadow-xl`, and an `overflow-hidden` background glow (line 1225: `<div className="absolute top-0 right-0 w-64 h-64 bg-neuro-500 rounded-full blur-3xl opacity-20 ...">`). None of these are Pattern A elements. Per spec §5.4, the result lives in the `CalculatorDrawer` expanded content as plain text + assessment summary `<dl>` rows. The dark card + background glow are the old "hero result" design that was explicitly replaced.

Also: `text-xl font-black` for "Treatment Plan" — §7 and §11 anti-pattern #8 (`font-black` is out of spec throughout).

**Classification:** Migraine usage bug — the Plan step should surface in the drawer's expanded content, not a bespoke hero card.

---

### E-10. `ChevronRight` from lucide-react used in multiple step nav buttons (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 559, 740, 1013, 1148.

```tsx
<ChevronRight size={18} className="ml-2" />
```

PATHWAY_SPEC §4.6 / §11 anti-pattern #3: chevron-right should use the shared `Chevron` component from `src/components/calculators/Chevron.tsx`, not `lucide-react`'s `ChevronRight`.

**Classification:** Migraine usage bug × 4 sites.

---

### E-11. Step 2 two iconKey collision — both Step 1 and Step 2 use `iconKey="triage"` (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 499–502, 571–573.

Step 1 `iconKey="triage"` — correct (Safety Screen / triage).
Step 2 `iconKey="triage"` — incorrect (Triage/Differential should use a different icon; the `PathwayRail` `STEP_ICONS` keys are `triage | clinical | imaging | decision`).

Two consecutive steps with the same icon creates visual redundancy and undermines the icon's step-differentiation function. Step 2 should use `iconKey="clinical"` to signal the differential routing / care-setting decision.

**Classification:** Migraine usage bug.

---

### E-12. Step 5 uses `iconKey="decision"` but Step 4 also uses `iconKey="decision"` (Migraine)

**File:** `src/pages/MigrainePathway.tsx` lines 1025–1026, 1166–1168.

Both Step 4 (Response) and Step 5 (Plan) use `iconKey="decision"`. With 5 steps and only 4 icon keys (`triage`, `clinical`, `imaging`, `decision`), one collision is inevitable. However Step 4 should logically use `imaging` (response assessment) and Step 5 uses `decision` (final plan). A better assignment for 5 steps: Step 1 = triage, Step 2 = clinical, Step 3 = clinical or imaging, Step 4 = imaging, Step 5 = decision.

**Classification:** Migraine usage deviation — minor icon redundancy.

---

## F. v3 mockup → live render delta

The v3 canonical mockup (`pathway-evt-interactive-demo-v3-warmth.html`) defines these header elements: back-button SVG (canonical path `M19 12H5M12 19l-7-7 7-7`) → identifier block (eyebrow `PATHWAY` + name) → right cluster (star + rotate-ccw + `Copy` pill). No icon-tile. No step dots in the header.

| v3 Mockup element | What EVT renders | What SE renders | What Migraine renders |
|---|---|---|---|
| Header: canonical back arrow SVG | `<ArrowLeft size={16}>` from lucide (B-3) | Same (B-3) | Same (B-3) |
| Header: eyebrow "PATHWAY" | Absent (B-5) | Absent (B-5) | Absent (B-5) |
| Header: pathway name `text-[15px] font-semibold` | `text-sm font-black` (B-4) | `text-sm font-black` (B-4) | `text-sm font-black` (B-4) |
| Header: no icon-tile | Icon-tile present (B-2, C-1 in EVT) | Red icon-tile (B-2) | Neuro icon-tile (B-2) |
| Header: right cluster Copy pill | Absent (B-6) | Absent (B-6) | Absent (B-6) |
| Header: no step-dots strip | 4-button dot strip present (B-1) | 4-button dot strip present (B-1) | 5-button dot strip present (B-1) |
| Rail: cobalt connector segment visible | Zero-height (A-1, affects all) | Zero-height (A-1) | Zero-height (A-1) |
| Rail: node centered on rail line | Not centered (A-2) | Not centered (A-2) | Not centered (A-2) |
| Category row: resting state label/value | Correct per spec (primitive OK) | Correct | Correct |
| Pearl: sparkle/book visual | Small 6px neuro dot (A-3) | Same (A-3) | Same (A-3) |
| Outcome row: §4.7 emerald-50/amber-50 | Not present; old red/emerald buttons (D-5) | Same (D-5) | Not applicable |
| Drawer: CalculatorDrawer | PathwayBottomDrawer (C-1) | No drawer | No drawer |
| Result: in drawer expanded content | In step body bespoke card (C-2) | Not applicable (no result card) | Bespoke dark hero card (E-9) |
| Max-width: `max-w-2xl` | `max-w-3xl` (B-7) | `max-w-3xl` (B-7) | `max-w-3xl` (B-7) |

---

## G. Recommended fix sequencing

### Tier 1 — primitive bugs (fix first, unblocks everything downstream)

1. **A-1 + A-2: PathwayRail segment height and node centering** — single primitive fix; remove `style={{ height: '0' }}` from line 181 of PathwayRail.tsx, implement rail using `border-l` on the column div rather than an absolute-positioned zero-height element. Node needs `margin-left: -[offset]`. Without this fix the visual rail is invisible across all pathways regardless of usage fixes. **Complexity: trivial** (2–3 line fix in one primitive file).

2. **A-4: Remove `variant: 'danger'` from PathwayCategoryRow** — remove the `variant` prop from `CategoryOption` and all associated conditional classes in PathwayCategoryRow.tsx. Any pathway passing `variant: 'danger'` will need to be updated simultaneously (EVT mevoDependent option and SE ESETT options). **Complexity: trivial** (delete ~20 lines from primitive; update 2–3 call sites).

3. **A-3: PathwayLearningPearl visual identity** — replace the 6px dot with a small inline SVG icon (lightbulb or sparkle, `w-3.5 h-3.5 text-neuro-500`). **Complexity: trivial**.

4. **A-5: PathwayCascadeNotice Undo button sizing** — replace `min-h-[44px] min-w-[44px]` on the visible Undo button with a `p-3 -m-3` wrapper + smaller visible button. **Complexity: trivial**.

### Tier 2 — cross-pathway shell fixes (parallel across all 3 files after primitives ship)

5. **B-1 + B-4: Remove header dot strips, fix header font** — in all 3 files: remove the center dot cluster from the sticky header; change `text-sm font-black` → `text-[15px] font-semibold`. **Complexity: trivial per file, 3 files × parallel**.

6. **B-2: Remove icon-tiles from header** — in all 3 files: remove `<div className="p-1.5 ... rounded-md shrink-0">` wrapping the header icon. **Complexity: trivial per file**.

7. **B-3: Replace lucide `ArrowLeft` with canonical SVG** — in all 3 files. **Complexity: trivial per file**.

8. **B-5: Add "PATHWAY" eyebrow to header left cluster** — in all 3 files. **Complexity: trivial per file**.

9. **B-6: Add `Copy` pill to header right cluster** — in all 3 files; wire to each pathway's existing `copySummary` function. **Complexity: trivial per file**.

10. **B-7: `max-w-3xl` → `max-w-2xl`** — in all 3 files. **Complexity: trivial**.

### Tier 3 — SE-specific content fixes (after Tier 1 and 2)

11. **D-2 + D-3: Replace bespoke dose cards with §4.8 Dose Result Row anatomy** — 3 sites in SE. **Complexity: moderate** (new row anatomy per each Stage).

12. **D-4 + D-5: Replace "Mark First Dose Given" + bespoke outcome buttons with §4.7 Outcome Row** — Requires a design decision on the pre-outcome confirmation flow; moderate refactor of Stage 1 and Stage 2 BZD outcome UI. **Complexity: moderate**.

13. **D-8: Replace `alert()` with inline icon-swap feedback** — trivial to fix. **Complexity: trivial**.

14. **D-9: Add computed-from hints to all 3 SE dose sites** — **Complexity: trivial**.

15. **D-11: Fix comorbidity chip `min-h-[36px]` → `min-h-[44px]`** — **Complexity: trivial**.

16. **D-12: Fix "Proceed" Next buttons to spec token** — `bg-neuro-500 ... rounded-full font-medium`. **Complexity: trivial**.

17. **D-10: Glucose checkbox** — replace bespoke red/emerald toggle with a §4.2 tri-button or §3.7 category row. **Complexity: trivial**.

18. **D-7: Shorten "Stage 2 ASM (ESETT-equivalent)" label** → "Stage 2 Agent". **Complexity: trivial**.

### Tier 4 — EVT-specific content fixes (after Tier 1 and 2)

19. **C-1 + C-2: Migrate PathwayBottomDrawer → CalculatorDrawer; move result card into drawer** — this is the highest-complexity EVT fix. Requires mapping `PathwayTier` → `SeverityTokens`, wiring `CalculatorDrawer`'s State A/B/C, moving the assessment summary and result content into drawer `children`. **Complexity: requires-new-primitive** (new prop mapping; moderate-to-high structural change).

20. **C-7: Move CascadeNotice to inline position** — currently rendered at the top of the rail container; needs to be placed inside each step body immediately below each `PathwayCategoryRow`. **Complexity: moderate** (requires per-field cascade event scoping).

21. **C-3: Replace Material Symbols `calculate` with a spec-compliant icon** — **Complexity: trivial**.

22. **C-4 + C-5: Remove bottom action bar mobile progress strip; evaluate whether to remove Back/Next buttons** — the Back/Next outside-content nav is a pattern question. **Complexity: moderate**.

23. **C-6: Remove scroll-mt-4 wrapper divs** — **Complexity: trivial**.

### Tier 5 — Migraine-specific content fixes (after Tier 1 and 2)

24. **E-1: Replace native `<select>` with `PathwayCategoryRow`** — **Complexity: trivial**.

25. **E-2 + E-3 + E-4: `border-2` → `border` across differential, care-setting, cluster terminal card** — **Complexity: trivial**.

26. **E-7: Remove `removedAlerts` legacy toast** — remove the `removedAlerts` state, the `useEffect` that populates it, and the fixed-toast JSX. **Complexity: trivial**.

27. **E-8: Implement §4.9 live cocktail summary** — this is the highest-complexity Migraine fix; requires wiring `CalculatorDrawer` or implementing a sticky-within-step cocktail row that renders the running selection. **Complexity: requires-new-primitive** (new pattern implementation).

28. **E-9: Replace dark hero Plan card with Pattern A drawer content** — requires `CalculatorDrawer` integration similar to EVT (Tier 4, item 19). **Complexity: requires-new-primitive**.

29. **E-10: Replace lucide `ChevronRight` with shared `Chevron` component** — **Complexity: trivial × 4 sites**.

30. **E-11 + E-12: Fix icon key assignments** — Step 2 → `clinical`, Step 4 → `imaging`. **Complexity: trivial**.

31. **E-5 + E-6: Safety toggle token alignment** — evaluate whether red selected state for safety flags is a design exception or should use neuro tokens. **Complexity: trivial once decision is made**.

---

### Parallelization guidance

- Tiers 1 (primitives) must ship before Tiers 2–5.
- Tier 2 cross-pathway shell fixes can be done in a single commit across all 3 files after primitives pass.
- Tiers 3 (SE), 4 (EVT), and 5 (Migraine) can be parallelized after Tier 2 ships — they touch independent files.
- Within each pathway tier, the "requires-new-primitive" items (C-1/C-2, E-8/E-9) should be worked serially before the trivial token fixes in that same pathway, because the drawer migration changes the surrounding structure.

---

## Summary

**Total findings:** 31 discrete findings across sections A–F.

| Category | Count |
|---|---|
| Primitive bugs (A-1 through A-5) | 5 |
| Cross-pathway usage bugs (B-1 through B-9) | 9 |
| EVT-specific usage bugs (C-1 through C-7) | 7 |
| SE-specific usage bugs (D-1 through D-12) | 12 |
| Migraine-specific usage bugs (E-1 through E-12) | 12 |

*(Note: several findings span multiple sub-items counted together; EVT's bottom action bar finding B-1/C-4 is counted once in B-1 with extension noted in C-4.)*

**Primitive bugs:** 5 (in PathwayRail.tsx, PathwayCategoryRow.tsx, PathwayLearningPearl.tsx, PathwayCascadeNotice.tsx)
**Usage bugs:** 26+ (in the 3 pathway files, using the primitives incorrectly or with pre-rebuild bespoke elements unaddressed)

**Sequencing recommendation:** serial for Tier 1 (primitives), then parallel fan-out for Tier 2 (cross-pathway shell) + Tier 3/4/5 (per-pathway content). The primitive fixes are trivial but blocking — a zero-height rail is invisible regardless of color. The highest-complexity items (EVT drawer migration C-1/C-2, Migraine cocktail summary E-8, Migraine plan card E-9) require the most lead time and should be flagged to V as the dominant effort in the fix pass.
