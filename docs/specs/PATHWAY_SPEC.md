# PATHWAY_SPEC.md — NeuroWiki Decision Pathway Design Specification

**Version:** 1.5 (draft — §4.7–§4.10 added: outcome row, dose result row, live cocktail summary, differential routing screen; pending design-guardian co-sign)
**Status:** Draft — locks when companion mockup ships at `docs/specs/mockups/pathway-evt-reference.html`
**Owner:** Design Guardian
**Companion mockup:** `docs/specs/mockups/pathway-evt-reference.html` (to be authored next; EVT is the canary)
**Scope:** All clinical decision pathway pages in `src/pages/*Pathway.tsx` (EVT, ELAN, Status Epilepticus, Migraine, GCA, Late-Window IVT, ICH Management, and any future pathway)

Pathways are the second member of the calculator-family of detail surfaces — they share width zone, header anatomy, drawer mechanics, and severity-token shape with CALCULATOR_SPEC.md v1.1. The differences are (a) pathways have **ordered multi-step decision flow** with a step-progress indicator and (b) pathway tier vocabulary is **action-oriented** (Eligible / Consult / Avoid; Low / Intermediate / High suspicion; Day-by-day windows) rather than severity-oriented (Low / Moderate / High risk).

This spec is the single source of truth for the anatomy, behavior, and SEO of every pathway page. Every swarm touching a pathway page must cite section IDs and line numbers from this file in pre-flight. The companion mockup is the visual ground truth; this prose is the behavioral ground truth. Neither is complete without the other.

**The EVT Pathway (`src/pages/EvtPathway.tsx`) is the Archetype 1 canary.** All other pathways are rebuilt against this spec in subsequent swarms after EVT is brought into compliance.

---

## §1 Shared Anatomy

Every pathway has exactly these five elements, in this order, regardless of pathway. No additional top-level layout elements are permitted.

```
1. Sticky top header                  (§2)
2. Step-progress strip                (§3)
3. Scrollable content                 (§4 — input controls per step)
4. Persistent interpretation drawer   (§5 — CalculatorDrawer, REUSE; no fork)
5. Page footer (citation + disclaimer)
```

The drawer is rendered via `CalculatorDrawer` from `src/components/calculators/CalculatorDrawer.tsx`. Pathways MUST NOT hand-roll a drawer. See §5 for the full mapping.

Width zone: `.zone-reference` width — content wrapper is `max-w-2xl mx-auto px-5` per CALCULATOR_SPEC §1.2 + design-tokens skill ("Content max-width"). Pathways read as part of the same surface family as calculators. The legacy `max-w-3xl` wrappers in current pathway files (see EvtPathway.tsx line 933) are out of spec and must be migrated to `max-w-2xl` during canary rebuild.

---

## §2 Sticky Top Header — Archetype 1 (single back-arrow)

**Mockup reference (canonical):** CALCULATOR_SPEC.md §1.1 lines 19–96 — pathway header is a strict instance of this pattern. Pathways do not have a NIHSS-style two-row variant.

**V decision 2026-05-15 (Option C):** pathways share the typography and chrome with calculators but reserve the prominent verdict for the drawer (where it updates live as the user works through the steps). Specifically, the pathway header carries an eyebrow + pathway name in the slot where a calculator carries the score numeral — there is no numeric verdict, no icon-tile flourish, no severity word in the header. The tier label lives in the drawer's `collapsedStat`, per §5.3. This is the canonical pattern; mockup `pathway-evt-reference.html` must reflect this.

```
sticky top-0 z-40 bg-white/95 backdrop-blur-md
```

Inner padding: `px-5 py-4`.

**Left cluster — back arrow + identifier block:**
```
flex items-center gap-3 min-w-0
```

Back arrow button: identical to CALCULATOR_SPEC §1.1.
- Hit target: `p-1.5 -m-1.5 text-slate-500 hover:text-slate-900 transition-colors`
- SVG: 20×20, stroke-width 2, path `M19 12H5M12 19l-7-7 7-7`

> Hard rule (§11): use this SVG, NOT `lucide-react`'s `ArrowLeft`. The EVT canary currently violates this (EvtPathway.tsx line 942 imports `ArrowLeft` from lucide-react). Migrate to the canonical SVG during rebuild.

Identifier block (two-line stack, replaces the calculator score block):
- Eyebrow label — pathway category: `text-[10px] font-bold text-slate-400 uppercase tracking-widest`
  - Content: `PATHWAY` (always plain text "Pathway", uppercased by class — never "Path", never the clinical-area label)
- Pathway name: `text-[15px] font-semibold text-slate-900 leading-tight tracking-tight mt-0.5`
  - Content: short name, e.g. `EVT Pathway`, `Status Epilepticus`, `Late-Window IVT`

**Right cluster — action buttons:**
```
flex items-center gap-0.5 flex-shrink-0
```

Three buttons, in this order:
1. Favorite (star, 18×18) — `p-2 rounded-full hover:bg-slate-50 transition-colors`
   - Unfavorited: `fill="none" stroke="currentColor" class="text-slate-400"`
   - Favorited: `fill="currentColor" stroke="currentColor" class="text-amber-400"`
2. Reset (rotate-ccw, 17×17) — `p-2 rounded-full hover:bg-slate-50 transition-colors text-slate-400`
3. Copy button — always present, regardless of completion state:
   ```
   ml-1.5 bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full
   text-sm font-medium transition-colors min-h-[44px]
   ```
   Label: `Copy` (plain text; no icon; no verbose label).

The right cluster matches calculator headers exactly. The icon-tile flourish on the current EVT canary (EvtPathway.tsx lines 944–948, `<div className="p-1.5 bg-neuro-100 text-neuro-700 rounded-md shrink-0">`) is out of spec and removed in the rebuild.

---

## §3 Step Progression — Vertical Decision-Tree Rail (Pattern A)

**V decision 2026-05-15 (Round 4 correction):** the horizontal dots strip described in the previous §3 draft was rejected. Pathways now use **Pattern A — a vertical connector rail** that reads as an interactive flowchart rather than a step counter. The rail IS the step-progress indicator. The horizontal strip is abolished; there is no strip element in the header or immediately below it.

**Canonical visual:** `docs/specs/mockups/pathway-evt-reference.html` — five frames showing every node and chip state. This prose is the behavioral complement; the mockup is the visual ground truth.

### 3.1 Vertical rail

A left-border line running down the content column communicates traversal state:

| Segment | CSS | When |
|---|---|---|
| Traversed (between a completed step and the next step's node) | `border-left: 2px solid var(--color-neuro-500)` | After the upstream step is completed |
| Untraversed (below the active node, or between any locked nodes) | `border-left: 1px solid #e2e8f0` | Before traversal |

The rail is implemented as a wrapper element on the body content column, not on the outer page container. Content (option rows, chips) sits to the right of the rail via `padding-left` (~20–21px depending on border width). The rail starts at the Step 1 node and extends to the bottom of the Step 4 node. There is no rail above Step 1.

Implementation note for the JSX build: use two CSS classes (`.rail-cobalt` and `.rail-slate`) applied to the wrapper `<div>` immediately below each node. The node itself uses a negative `margin-left` so its visual center sits on the rail border line. See mockup for exact pixel values.

### 3.2 Step nodes

One node per step, sitting on the rail at the top of that step's block:

| State | Visual | CSS anchor |
|---|---|---|
| **Completed** | Filled cobalt circle, 12×12 px | `w-3 h-3 bg-neuro-500 rounded-full`, `margin-left: -[offset]` to center on rail |
| **Active** (current step) | Hollow cobalt ring, 12×12 px, white fill | `w-3 h-3 border-2 border-neuro-500 bg-white rounded-full`, same offset |
| **Locked** (future, not reachable yet) | Hollow slate-300 circle, 10×10 px | `w-2.5 h-2.5 border border-slate-300 bg-white rounded-full`, same offset |

The cobalt dot is the only step-state indicator. No checkmarks. No numbered circles. No colored backgrounds on the step body based on state.

### 3.3 Step eyebrow

Sits inline to the right of the node on the same horizontal axis:

| State | Classes |
|---|---|
| Active or completed | `text-[10px] font-bold text-slate-400 uppercase tracking-widest` |
| Locked | `text-[10px] font-bold text-slate-400/50 uppercase tracking-widest` (50% opacity) |

Format: `STEP {N} · {TITLE}` in all-caps (the class handles uppercasing). Examples: `STEP 1 · CLINICAL DATA`, `STEP 2 · WINDOW CRITERIA`, `STEP 3 · IMAGING`, `STEP 4 · RESULT`.

### 3.4 Branch chips

A branch chip appears **between** a completed step's last option row and the next step's node. It summarizes the upstream decisions in human-readable form on the cobalt rail segment.

**Visual register (resting — unchanged from round 5):**
```
text-[11px] text-slate-600 bg-slate-50 px-2 py-0.5 rounded-full inline-block
```

Examples (EVT):
- After Step 1 complete: `Anterior LVO · 0–6 h · NIHSS 12 · age 71`
- After Step 2 complete: `Prestroke mRS 0–1 · Standard early window`
- After Step 3 complete: `ASPECTS 8 · Class I imaging`

Chips are visible only when the upstream step is complete and the downstream step has been reached. A chip never appears below an active or locked step's own node. When an upstream answer changes (cascade-clear — §3.6), the chip clears.

**Interactive variant (round 6 — tap-targetable):**

Every branch chip is a `<button>`, not a `<span>` or `<div>`. The visual register is identical to the resting state above. The chip becomes interactive per Klein RPD (situation re-examination) and Shneiderman Rule 6 (easy reversal).

```html
<!-- Hit target: 44×44 achieved via p-3 -m-3 on a wrapping div.
     The visible pill stays small; the tappable area expands. -->
<div class="p-3 -m-3" style="display:inline-block;">
  <button
    type="button"
    class="branch-chip"
    aria-label="Edit: {human-readable decision summary}"
  >
    {chip text}
  </button>
</div>
```

**Hover state:** `hover:bg-slate-100 hover:text-slate-900 hover:ring-1 hover:ring-neuro-200` (faint cobalt outline at hover; CSS equivalent: `box-shadow: 0 0 0 1px var(--color-neuro-200)`).

**Cursor:** `pointer`.

**Accessibility:** `role="button"` is implicit on `<button>` (no need to add explicitly); `aria-label="Edit: {decision summary}"` is required on every chip so screen-reader users know the destination.

**On activate (tap or keyboard Enter/Space):** the pathway scrolls to the source step in edit mode with the relevant category-row accordion pre-opened (the chosen value's row expanded). The rail and downstream chips do **NOT** collapse on chip-tap alone — only on actual answer change. Scroll-and-open is a view transition, not a state mutation.

**Anti-pattern (hard rule from round 6):** chips are NEVER plain `<span>` or `<div>` going forward. Every chip that is visually a pill must be a `<button>` to satisfy §8 touch target requirements and to close the gulf of execution (Norman) for reversing upstream decisions.

### 3.5 Locked step body

When a step is locked (its prior step is not yet complete), the step body renders as a single italic placeholder line rather than option rows:

```html
<p class="text-sm italic text-slate-400">Awaiting Step N ↑</p>
```

No option rows, no inputs, no labels render in a locked step body. The eyebrow renders at 50% opacity (§3.3).

### 3.6 Cascade-clear behavior

When a user changes an answer in a **completed** upstream step:

1. All downstream branch chips clear.
2. All downstream step bodies re-lock: options collapse, the italic "Awaiting Step N ↑" placeholder reappears.
3. All rail segments below the changed step return to `border-l border-slate-200` (untraversed slate) via a **250ms color fade** (not an abrupt switch).
4. The drawer returns to State A (muted, non-interactive) if the pathway result is no longer computable.
5. A **transient inline cascade-clear notice** appears immediately below the changed category-row (see anatomy below).

Re-completing the upstream step re-fills the cobalt rail forward, re-populates branch chips in sequence, and re-unlocks the next step's body. This is a downstream cascade, not a full reset — unchanged prior steps remain completed.

**Cascade-clear notice anatomy (round 6):**

The notice is an inline pill rendered directly in the step body, immediately below the changed category-row. It is **never** a toast, modal, or page-top banner — the notice must live inline so the user sees cause and effect in one visual sweep.

```html
<div class="cascade-notice mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
  <!-- Small counter-clockwise arrow icon representing "undo cascade" -->
  <svg class="w-3 h-3 text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M4 4v5h5"></path>
    <path d="M20 11A8 8 0 1 1 5 9"></path>
  </svg>
  <!-- Bold prefix names the cleared steps; varies by which upstream step changed -->
  <span><strong class="font-medium text-slate-700">{Cleared steps} cleared</strong> — re-confirm.</span>
  <!-- Undo button — see Undo behavior contract below -->
  <button class="ml-2 px-2 py-0.5 -my-0.5 bg-white border border-slate-300 rounded-full text-xs text-slate-700 hover:bg-slate-100 hover:border-slate-400">Undo</button>
</div>
```

**Cleared-steps prefix naming rules:**
- Step 1 change clears Steps 2, 3, 4 → prefix is `"Clinical, Imaging, and Result cleared"`
- Step 2 change clears Steps 3, 4 → prefix is `"Imaging and Result cleared"`
- Step 3 change clears Step 4 → prefix is `"Result cleared"`

**Notice timing and transition:**
- Slides in with **200ms** `transition-opacity` + slight upward translate on appear.
- Auto-dismisses after **4 seconds** OR on the user's next tap anywhere outside the notice.
- Slides out with the same 200ms reverse transition.
- The rail color fade (cobalt → slate) is a separate **250ms** CSS transition that runs simultaneously with the notice appearing.

**Undo behavior contract:**
- Tapping Undo restores the prior upstream answer **and** all downstream answers that were wiped (held in memory until the notice dismisses — the snapshot is discarded when the notice auto-dismisses).
- On Undo: notice disappears immediately; rail re-cobalts downstream (250ms fade); downstream chips re-appear; downstream step bodies re-unlock to their prior completed state; drawer returns to prior tier state.
- One tap reverses the entire cascade. There is no confirmation dialog.

**Anti-pattern (hard rule from round 6):** cascade-clear MUST NOT be silent. The user must see why steps re-locked. Toasts (`<div role="alert">` floating over content), page-top banners, and modal interruptions are all forbidden for this feedback — only the inline step-body notice is permitted.

### 3.7 Category-row anatomy (round 5 — iOS-Settings pattern)

**This is the pathway equivalent of the calculator's option-row.** Calculators render every option as a visible row because the user reads all options and adds a point (additive). Pathways render ONE row per decision category (e.g. "LVO Location") because the user picks one value and moves on — the next step's content depends on what was picked. Expanding every category's full option list simultaneously would collapse the flowchart metaphor.

**Canonical visual reference:** Frame 1 of `docs/specs/mockups/pathway-evt-reference.html` — the LVO Location row shown in its expanded state is the design ground truth for the open-accordion state.

#### Resting state (value selected)

One row per category. Label on the left, selected value + chevron on the right. Hairline `1px solid #e2e8f0` between rows.

```html
<button class="cat-row w-full">
  <span class="cat-row-label">LVO Location</span>
  <span class="cat-row-right">
    <span class="cat-row-value">Anterior</span>
    <svg class="cat-row-chevron" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="6 8 10 12 14 8"></polyline>
    </svg>
  </span>
</button>
```

Tokens: `.cat-row-label` = `font-weight:500; color:#0f172a; font-size:0.9375rem`. `.cat-row-value` = `font-size:0.875rem; color:#64748b`. `.cat-row-chevron` = `width:16px; height:16px; color:#94a3b8`.

#### Unselected state (no value chosen yet)

Right side reads `Select…` in italic slate-400. Chevron unchanged.

```html
<span class="cat-row-value-unset">Select…</span>
```

Token: `font-size:0.875rem; color:#94a3b8; font-style:italic`.

#### Expanded state (accordion open)

When tapped, the chevron rotates 180° (CSS transition) and an inline accordion expands below the row:

```html
<div class="cat-accordion">
  <button class="cat-option w-full">
    <span class="cat-option-label">Anterior Circulation</span>
    <span class="cat-option-sub">ICA / M1</span>
  </button>
  <button class="cat-option w-full">
    <span class="cat-option-label">Posterior Circulation</span>
    <span class="cat-option-sub">Basilar</span>
  </button>
</div>
```

Tokens: `.cat-option` = `padding:10px 12px 10px 16px; border-radius:8px`. `.cat-option-label` = `font-size:0.875rem; color:#334155`. `.cat-option-sub` = `font-size:0.75rem; color:#94a3b8`.

**Selection indicator inside the accordion:** the selected option receives a 2px cobalt left border (`border-left: 2px solid var(--color-neuro-500)`). No radio-button circles. No checkmarks. The left bar is the only selection indicator.

When the user picks an option: the accordion collapses, the row's right-side value updates to the chosen label, and the chevron rotates back to the down position.

#### Numeric input variant (ASPECTS, core volume, mismatch values)

For numeric inputs, the category row shows an inline number field instead of a value string + chevron:

```html
<div class="cat-input-row">
  <span class="cat-input-label">ASPECTS</span>
  <span class="cat-input-right">
    <input type="number" inputMode="numeric" class="cat-input-field" placeholder="—" />
    <span class="cat-input-unit">/ 10</span>
  </span>
</div>
```

Tokens: `.cat-input-field` = `width:48px; padding:4px 8px; font-size:0.875rem; border:1px solid #e2e8f0; border-radius:6px; text-align:center`. `.cat-input-unit` = `font-size:0.75rem; color:#94a3b8`. No chevron on numeric rows.

#### Completed-step row (after the step is submitted)

When a step is complete, its category rows collapse to a summary display: cobalt left bar (`border-left:2px solid var(--color-neuro-500)`), neuro-50 background, no chevron. The row is still tappable to go back and change the value (triggering cascade-clear, §3.6).

```html
<div class="cat-row-completed">
  <span class="cat-row-completed-label">LVO Location</span>
  <span class="cat-row-completed-value">Anterior</span>
</div>
```

Tokens: `.cat-row-completed-label` = `font-weight:600; color:var(--color-neuro-700)`. `.cat-row-completed-value` = `font-size:0.875rem; color:var(--color-neuro-700); opacity:0.75`. Background: `var(--color-neuro-50)`.

#### Anti-patterns for category rows

- Do NOT use a native HTML `<select>` element.
- Do NOT use a bottom-sheet modal for the options.
- Do NOT render radio-button circles inside the accordion.
- Do NOT add icons inside category rows.
- Do NOT show every option as a separate full-width row (this is the round-4 pattern, now obsolete).
- Do NOT render description text in a right column beside the label (see §3.7.1 below).

### 3.7.1 Option-row description text — two-line stacked (v1.4 standard)

When a category option carries a descriptive sub-text (e.g., "Dominant proximal M2" with "Supplies ≥50% of MCA territory"), the description MUST be rendered below the label in the same button, not to the right of it in a second column.

**Root cause of the old pattern's failure:** the two-column layout (label left / description right with `justify-content: space-between`) breaks when labels vary in length. "Non-dominant proximal M2" (24 chars) alongside "ACA" (3 chars) in the same accordion produces visually inconsistent right-column positions — the description floats to a different horizontal anchor on every row. On 360px viewports, long labels plus long descriptions overlap or wrap asymmetrically.

**The fix — two-line stacked anatomy:**

```css
/* Option button — stacked, not side-by-side */
.cat-option-btn {
  width: 100%;
  display: flex;
  flex-direction: column;      /* stacked: label above, description below */
  align-items: flex-start;     /* both left-anchored */
  padding: 12px 12px 12px 16px;
  text-align: left;
  background: none; border: none;
  cursor: pointer; border-radius: 8px; /* rounded-lg */
  transition: background-color 0.12s;
  min-height: 44px;            /* touch target preserved — §8 */
  position: relative;
  margin-bottom: 4px;
  gap: 2px;                    /* 2px between label and description */
}

/* Primary label */
.cat-option-label {
  font-size: 14px;             /* text-sm */
  color: #334155;              /* slate-700 — 10.7:1, passes AAA */
  font-weight: 500;
  line-height: 1.35;
  display: block;
  width: 100%;                 /* full width — no right-column competition */
}

/* Description — sits below label */
.cat-option-desc {
  font-size: 11px;             /* text-[11px] — visually subordinate to 14px label */
  color: #64748b;              /* slate-500 — 4.48:1 on white, passes WCAG AA */
  line-height: 1.4;
  display: block;
  width: 100%;
}
```

**Selection indicator:** unchanged — 2px cobalt left border on `.cat-option-selected`. Padding adjusts: `padding-left: 14px` (16px - 2px border).

```html
<!-- Correct anatomy: two-line stacked -->
<button class="cat-option-btn cat-option-selected">
  <span class="cat-option-label">Dominant proximal M2</span>
  <span class="cat-option-desc">Supplies ≥50% of MCA territory (not left/right dominance)</span>
</button>

<!-- Correct anatomy: label only (no description) -->
<button class="cat-option-btn">
  <span class="cat-option-label">ACA</span>
</button>
```

**When description is absent:** the `cat-option-desc` span is simply omitted. The button renders as a single-line 44px row — identical to the old pattern for short options. No visual regression on options without sub-text.

**Height implication:** a two-line option (12px padding + 14px label + 2px gap + ~14px description + 12px padding) is approximately 54px. The 44px floor is still met. The accordion grows ~10px per option with descriptions. For a 6-option accordion (MeVO Location), this is ~60px additional height — acceptable at all supported viewports.

**Research basis:** Material Design 3 two-line list pattern; Apple HIG subtitle cell; NN/g "Designing Efficient List UIs" (Budiu 2021); Wroblewski (2008) left-anchor principle; BMJ Best Practice and UpToDate observed CDS patterns. Full rationale in `docs/reviews/ux-content-density-pathway-2026-05-15.md`.

**Migration scope:** all 10 category-row accordions in the EVT pathway that carry description text. The complete list is in the review doc §5. This is the new standard for all future pathways — no two-column option rows.

### 3.8 Step labels

Step titles are short nouns owned by the pathway's data file. EVT canonical labels: `TRIAGE`, `CLINICAL`, `IMAGING`, `RESULT`. Other pathways define their own labels following the same all-caps single-noun pattern.

### 3.9 What replaced the horizontal strip

The horizontal dots strip (previous §3 draft) was rejected for the following reasons: it added a separate UI layer that competed with the rail's branching communication; it could not convey branch-chip summaries; it sat above the fold, redundantly, when the rail already communicates the same state inline. The rail approach was approved as Pattern A in the round-4 design review (2026-05-15).

---

## §4 Step Content — Input Controls

Only the **current** step's inputs render in the scroll container. Tapping a completed dot jumps back; tapping the current dot collapses nothing. There is no accordion stack. (The current EVT canary uses `CollapsibleSection` per step, EvtPathway.tsx lines 987–1402 — this is out of spec and rebuilt as a single-active-step view.)

### 4.1 Step section structure

```html
<section aria-labelledby="step-{n}-heading" class="px-5 pt-6 pb-4 space-y-8">
  <h2 id="step-{n}-heading" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    {step.title}
  </h2>
  <!-- one or more input groups (§4.2–§4.4) -->
</section>
```

`space-y-8` between input groups within a step (matches calculator `space-y-10` rhythm, slightly tighter because pathways stack more groups per step).

Group label (above each input):
```
text-sm font-semibold text-slate-700 mb-2
```
(Per design-tokens skill "Section header" row + the visual register used in EvtPathway lines 1000, 1010, 1019.)

### 4.2 Tri-button (Yes / No / Unknown)

The canonical pathway input. Used for ~70% of pathway questions (LVO confirmed? Disabling deficit? Mechanical valve? Significant mass effect?).

```html
<div role="radiogroup" aria-labelledby="..." class="grid grid-cols-3 gap-2">
  <button type="button" aria-checked="..." class="tri-btn ...">No</button>
  <button type="button" aria-checked="..." class="tri-btn ...">Yes</button>
  <button type="button" aria-checked="..." class="tri-btn ...">Unknown</button>
</div>
```

Order: `No · Yes · Unknown` (clinical default is "absent" — No reads first).

Tri-button anatomy (one canonical token set, no per-pathway variants):

| State | Classes |
|---|---|
| Unselected | `min-h-[44px] rounded-full border border-slate-200 bg-white text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none` |
| Selected (default) | `min-h-[44px] rounded-full border border-neuro-500 bg-neuro-50 text-neuro-700 font-semibold text-sm focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none` |
| Selected (danger answer, e.g. "Yes" to "Mechanical valve?") | Same chrome as default selected; the danger tone surfaces in the drawer (§5), not in the input. The previous EVT pattern of `variant="danger"` painting individual buttons red (e.g. EvtPathway.tsx line 1033) is **out of spec** — input state is only "selected/not selected"; consequence is in the drawer. |

Touch target: `min-h-[44px]` (CALCULATOR_SPEC §2.4) on every button; never `p-0.5` or smaller. `rounded-full` (per design-tokens skill "Card radius" row).

### 4.3 Age-group / NIHSS-band buttons

Multi-option grouped buttons (3–4 options) for discrete clinical ranges (Age: `<18`, `18–79`, `≥80`; NIHSS band: `0–5`, `6–9`, `10–19`, `≥20`).

```html
<div role="radiogroup" class="grid grid-cols-3 gap-2"><!-- or grid-cols-2 for 4-option NIHSS, wrapping -->
  <button type="button" class="band-btn ...">&lt; 18</button>
  ...
</div>
```

Anatomy: same as Tri-button (§4.2). Sizing: same `min-h-[44px] rounded-full`. The "p-4 rounded-xl border-2" pattern at EvtPathway.tsx lines 1041–1043 is out of spec — pathways use the same rounded-pill register as Tri.

For 4-option bands (NIHSS), use `grid-cols-2 sm:grid-cols-4` to keep two-per-row on iPhone SE.

### 4.4 Numeric inputs (ASPECTS, pc-ASPECTS, core volume, mismatch ratio)

Use the canonical CALCULATOR_SPEC §4.6 number input pattern verbatim — pathways do not reinvent it.

```html
<input
  type="number" inputMode="numeric" min="0" max="10"
  class="min-h-[44px] w-28 px-4 py-2 rounded-lg border border-slate-200 bg-white
         text-slate-900 font-medium
         focus:border-neuro-500 focus:outline-none focus:ring-2 focus:ring-neuro-500/20"
  aria-describedby="..."
/>
```

Helper text below: `text-xs text-slate-500 mt-2` (CALCULATOR_SPEC §4.6 verbatim).

The current EVT pattern (large `p-4 text-lg bg-white border` numeric inputs, EvtPathway.tsx line 1192, 1248) is replaced with the canonical narrow `w-28 min-h-[44px]` input.

### 4.5 In-step pearls / inline help

`LearningPearl` and amber `border-l-2 border-amber-400 pl-3` callouts may render **inside a step** when a clinical caveat applies to the current input set (matches CALCULATOR_SPEC §4.5 "Important callout" register). They MUST NOT render in the drawer.

### 4.6 Step Next / Back affordance

After all required inputs of the current step are filled, a `Next` button renders flush right under the last input:
```
bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium
min-h-[44px] inline-flex items-center gap-1.5
```
Label: `Next` + chevron-right SVG (use the shared `Chevron` component from `src/components/calculators/Chevron.tsx`, NOT `lucide-react`'s `ChevronRight`).

Back button (top-left of step, below the strip): `text-sm text-slate-500 hover:text-slate-900` with the canonical back-arrow SVG (§2).

Auto-advance (current EVT pattern, EvtPathway.tsx lines 914–930) is permitted only when the step has exactly one required field; otherwise the user must tap `Next`.

### 4.7 Outcome row (SE-specific, generalizable)

The outcome row is the pathway equivalent of a clinical state-transition button — it records *what happened* after a treatment, not *what was selected* as input. Used at the end of any stage where the clinician must answer "did the treatment work?" before the rail advances. The canonical use is Status Epilepticus: after a benzodiazepine is delivered, the clinician records whether seizures stopped or persist. Selecting "Persists" cascades the rail forward to the escalation stage; selecting "Stopped" terminates the active branch and routes to post-treatment monitoring.

This is a category-row variant — it occupies the same row slot as a §3.7 category row but renders two large equal-width state buttons in place of a label-value-chevron pattern. The two-button outcome row is distinct from the §4.2 Yes/No/Unknown tri-button, which captures clinical observation as input (Yes/No/Unknown reads "what is the case"); the outcome row captures clinical event as state transition ("what happened after the intervention").

**Canonical visual reference:** SE Pathway rebuild, Stage 1 Benzodiazepines step — the row immediately below the §4.8 dose-result row. (Companion mockup forthcoming alongside the SE pathway rebuild swarm.)

**Anatomy:**

```html
<div class="outcome-row">
  <span class="outcome-row-eyebrow">SEIZURE STATUS</span>
  <div class="outcome-row-buttons">
    <button type="button" class="outcome-btn outcome-btn-stopped" aria-pressed="...">
      Seizures Stopped
    </button>
    <button type="button" class="outcome-btn outcome-btn-persists" aria-pressed="...">
      Seizures Persist
    </button>
  </div>
  <!-- Optional auto-tracked caption — see "Time anchor caption" below -->
  <p class="outcome-row-caption">8 min since first BZD dose</p>
</div>
```

Tokens:

| Element | Classes |
|---|---|
| Eyebrow label | `text-[10px] font-bold text-slate-500 uppercase tracking-widest` (matches §3.3 active-state eyebrow; slate-500 — not 400 — because outcome rows must read prominent in active steps) |
| Button container | `grid grid-cols-2 gap-3 mt-2` (two equal-width columns, full row width) |
| Stopped button (resting) | `min-h-[60px] rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-semibold text-sm transition-all active:scale-[0.97]` |
| Stopped button (selected) | `bg-emerald-100 border-emerald-300 text-emerald-800 font-bold` |
| Persists button (resting) | `min-h-[60px] rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm transition-all active:scale-[0.97]` |
| Persists button (selected) | `bg-amber-100 border-amber-300 text-amber-800 font-bold` |
| Time-anchor caption | `text-[11px] text-slate-500 mt-2` |

**Sizing rationale:** `min-h-[60px]` exceeds the §8 baseline of 44px deliberately. Outcome buttons are clinical-stakes decisions ("did the seizure stop?") with downstream cascade consequences — escalating to Stage 2 or terminating treatment. The larger hit target reduces mis-tap risk under time pressure (Klein RPD recognition-primed decisions in code situations).

**Why amber, not red, for "Persists":** the Persists state is an escalation trigger, not a danger state. Red is reserved for §6 `high` tier ("Avoid EVT") and §11 alert states. Amber communicates "elevated, requires action" without claiming a clinical-emergency frame the binary outcome doesn't actually carry. The downstream cascade — Stage 2 with its own §6 tier tokens — surfaces the clinical-stakes hierarchy.

**Why emerald for "Stopped" (and why this is the only emerald in the pathway palette):** emerald is forbidden as a tier color (§6 — `low` is neuro-50 specifically because eligibility ≠ low-risk). But "Stopped" is not a tier outcome — it is a clinical-event success signal. Emerald reads "the intervention worked," which is exactly the message. This is the only sanctioned emerald usage in the pathway palette, and it is bound to this row pattern.

**Selection behavior:**
- Selecting "Stopped": the row collapses to a `cat-row-completed` style (§3.7) with `border-left:2px solid var(--color-emerald-500)` (the one place §6 emerald is permitted as a left bar; the row is recording a clinical event, not a tier). The pathway routes to post-treatment monitoring per the pathway's data file.
- Selecting "Persists": the row collapses similarly with `border-left:2px solid var(--color-amber-500)`. The next stage's locked body unlocks; rail color fades cobalt; the drawer updates `collapsedStat` to reflect the new active stage.

**Time-anchor caption (optional):** when the pathway tracks seizure-onset time (§4.5 in SE), the row renders a small auto-tracked caption beneath the buttons: `${minutes} min since first BZD dose`. This is informational only — it does not affect cascade. Format: `text-[11px] text-slate-500 mt-2`. Omit the caption when no time anchor is available.

**Anti-patterns:**
- Do NOT add a third "Unsure" button. The outcome row is binary by design — adding a third option recasts it as an input (re-introducing §4.2 tri-button semantics) and undermines the "state transition" model. If the answer is truly unknown, the clinician should not advance the rail.
- Do NOT use red (`bg-red-50 border-red-200`) for the Persists button. Red is reserved for §6 `high` tier in the drawer and for §3.6 cascade-clear-equivalent danger feedback. The outcome row's amber escalation tone hands off the danger frame to the drawer.
- Do NOT shrink the buttons below `min-h-[60px]`. The clinical-stakes premium over the §8 44px floor is the whole point.
- Do NOT render an outcome row before the corresponding intervention is fully delivered (e.g., before the §4.8 dose-result row exists in the step). Outcome recording is a temporal successor to dose calculation.
- Do NOT use the outcome row for non-clinical-event decisions (e.g., "Pick a drug" or "Confirm IV access"). Those are §3.7 category rows or §4.2 tri-buttons.

**Pattern intent:** outcome-recording, not input. The two-button binary mirrors the clinical reality (the seizure did or did not stop) and routes the rail accordingly. Selection is a state-transition event, not a value capture.

**Research basis:** Klein RPD (research synthesis Principle 4 — situation re-examination) for the binary "what happened" model; ISO 9241-110 self-descriptiveness via the time-anchor caption; Shneiderman rule 3 informative feedback when the row collapses to its left-bar completed state. Full rationale: `docs/reviews/ux-audit-se-pathway-2026-05-16.md` finding F-01 and recommended-workflow Priority 1.

### 4.8 Dose result row (SE-specific, generalizable)

The dose result row is a category-row variant that **displays a computed dose** as a first-class row in the step body — not buried in body prose, not hidden inside an expanded accordion, not waiting for a scroll-into-view animation. Once a drug agent is selected, the patient-specific dose (weight-based or otherwise computed) is the most important string on the screen; it deserves a dedicated row at the top of the active step body.

The canonical use is Status Epilepticus: after the clinician selects a benzodiazepine agent and the pathway has the patient weight, the calculated load dose ("4 mg IV") appears in this row at the top of the Stage 1 step. The row stays visible while the clinician interacts with the rest of the step (the §4.7 outcome row, the §4.5 pearl block).

**Canonical visual reference:** SE Pathway rebuild, Stage 1 Benzodiazepines step — the row immediately above the §4.7 outcome row.

**Anatomy:**

```html
<div class="dose-result-row">
  <span class="dose-result-row-eyebrow">DOSE</span>
  <div class="dose-result-row-body">
    <span class="dose-result-agent">Lorazepam IV</span>
    <span class="dose-result-value">4 mg</span>
    <button type="button" class="dose-result-copy" aria-label="Copy Lorazepam 4 mg IV to clipboard">
      <!-- Copy icon SVG (shared component) -->
    </button>
  </div>
  <p class="dose-result-hint">Computed from 70 kg patient · 0.1 mg/kg, max 4 mg</p>
</div>
```

Tokens:

| Element | Classes |
|---|---|
| Row container | `border-t border-b border-slate-200 px-5 py-3 -mx-5` (hairline-divided, full-bleed within the step body) |
| Eyebrow label | `text-[10px] font-bold text-slate-500 uppercase tracking-widest` (matches §4.7 outcome eyebrow) |
| Body row | `flex items-center justify-between gap-3 mt-1` |
| Agent label (left) | `text-sm text-slate-600 font-medium` |
| Computed dose value | `text-base font-mono font-semibold text-slate-900` (monospace because clinical doses must read as values, not prose; per design-tokens skill no-mono-for-prose rule, this is the sanctioned monospace usage in clinical surfaces) |
| Copy button | `p-3 -m-3` wrapper for 44×44 hit target; visible icon is `w-5 h-5 text-slate-400 hover:text-slate-700 transition-colors` ghost slate styling |
| Copy button success state | brief 1.2s `text-emerald-600` swap with check icon, then auto-revert to default (no toast, no `alert()`) |
| Computed-from hint | `text-[10px] text-slate-400 mt-1` (subordinate to dose, but always visible to confirm weight) |

**Persistence:** the dose result row stays visible while the clinician interacts with the rest of the active step. Two implementations are acceptable (author choice per pathway):

1. **Top-of-step placement (preferred for SE).** Render the row as the first child inside the step's `<section>` body, immediately below the §4.1 step `<h2>`. Natural document flow keeps it visible at top of step; the §4.7 outcome row and any §4.5 pearls render beneath it.
2. **Sticky-within-step placement.** Wrap the row in a `position: sticky; top: calc(var(--pathway-header-height) + var(--rail-node-height) + 8px)` container, allowing the rest of the step body to scroll under it. Reserved for pathways where the step body is long enough that the dose row would otherwise scroll out (uncommon — most pathway steps fit in viewport on mobile).

The pathway data file owns this choice. Either placement satisfies F-01 of the SE UX audit.

**Empty / error state:** when the dose cannot be computed (missing weight, no agent selected), the row renders an inline warning state instead of a numeric value:

```html
<div class="dose-result-row dose-result-row-empty">
  <span class="dose-result-row-eyebrow">DOSE</span>
  <div class="dose-result-body-empty">
    <!-- Small alert icon, slate-400 -->
    <span class="text-sm text-amber-700 font-semibold">Enter patient weight to calculate dose</span>
  </div>
</div>
```

The empty state uses `bg-amber-50 border-amber-200` instead of slate hairlines. The literal string "Enter weight" must NEVER render in `text-base font-mono font-semibold text-slate-900` — that is the dose token, and SE audit F-02 documents the patient-safety risk of displaying error strings in dose typography.

**Copy-to-clipboard behavior:**
- On tap, copies the agent + dose string (`"Lorazepam 4 mg IV"`) to the system clipboard.
- Success state: icon swap to checkmark + `text-emerald-600` for 1.2s, then auto-revert.
- No `alert()`, no toast, no modal. Per §11 anti-pattern principles, blocking dialogs at the bedside are forbidden.
- The header §2 Copy button copies the full pathway summary; this row's copy button copies only the dose string. Both must coexist without conflict — the row-level copy is scoped to its row.

**No chevron, no expansion.** This is a display row, not an input row. Tapping the row body (outside the copy button) does nothing. The pathway data file owns the dose computation; the user does not modify the dose from this row.

**Anti-patterns:**
- Do NOT bury the dose inside an accordion that requires expansion to read. The dose is the highest-priority string in the step body once it is computable.
- Do NOT render error strings ("Enter weight", "Select agent") in dose typography (`text-base font-mono font-semibold text-slate-900`). Errors render in the amber empty-state styling per anatomy above.
- Do NOT use `text-4xl` or `text-5xl` for the dose value. The §7 typography table has no entry for "huge dose" — `text-base font-mono font-semibold` is the spec-compliant register and reads correctly at 375px without crowding the row.
- Do NOT trigger an `alert()` or modal on copy. The copy button uses inline icon-swap feedback only.
- Do NOT omit the "Computed from {weight} patient" hint. The clinician must be able to verify weight correctness at every dose-display site without navigating back to Step 1.
- Do NOT add this row to non-dose contexts (e.g., to display NIHSS score). The dose result row is bound to weight-based or formula-computed drug dosing; other computed readouts use the §5.3 drawer `collapsedStat` or a §3.7 completed-step row.

**Pattern intent:** persistent dose visibility. The dose result row reduces the bedside "where's the dose?" friction documented in SE UX audit F-01 by eliminating scroll-to-find and post-selection animation latency. Once the agent is chosen, the dose is one fixation away — every time, regardless of step state.

**Research basis:** research synthesis Principle 7 (explicit feedback on state change — selecting an agent must produce an immediately visible dose) and Principle 4 (always-visible decision trail — the dose is the upstream answer the clinician must hold while making the outcome decision). Bates 2003 "anticipate needs in real time." Full rationale: `docs/reviews/ux-audit-se-pathway-2026-05-16.md` finding F-01.

### 4.9 Live cocktail summary row (Migraine-specific, generalizable to parallel-selection pathways)

The live cocktail summary is a composite row pattern that displays a running list of currently-selected drugs across multiple parallel category accordions. Used in pathways where the clinician picks several agents simultaneously rather than sequentially through a single decision tree. The canonical use is Migraine: the clinician selects antiemetic + NSAID + steroid + antihistamine in parallel during the COCKTAIL step, and the running cocktail must be visible without requiring the clinician to reach the final plan step.

This row addresses the Migraine UX audit's #1 critical finding (CW-1): the cocktail is invisible until Step 5, leaving the nurse-attending mid-pathway dialogue ("what are we giving?") with no answer.

**Primary rendering surface — the drawer (State B):** the live cocktail summary renders inside `<CalculatorDrawer>` as the expanded content during State B (partial inputs). This is the primary pattern. The drawer is already a persistent, scroll-independent surface (§5); rendering the cocktail there means it is always one tap away regardless of which step the clinician is on.

**Secondary rendering surface — sticky-within-step (optional fallback):** for pathways where the drawer is not yet wired or where a clinician-side preference favors inline rendering, the same row may render sticky at the top of the active step. Author should default to drawer-rendered; only fall back to sticky-inline if there is a documented reason in the pathway's data file.

**Canonical visual reference:** Migraine Pathway rebuild, Cocktail step — drawer in State B with the cocktail row rendered inside.

**Anatomy (drawer-rendered, primary):**

```html
<div class="cocktail-summary">
  <span class="cocktail-summary-eyebrow">COCKTAIL · 3 DRUGS</span>
  <div class="cocktail-summary-pills">
    <button type="button" class="cocktail-pill" aria-label="Edit Prochlorperazine 10mg IV — opens Antiemetic accordion">
      Prochlorperazine 10mg IV
    </button>
    <button type="button" class="cocktail-pill" aria-label="Edit Ketorolac 30mg IV — opens NSAID accordion">
      Ketorolac 30mg IV
    </button>
    <button type="button" class="cocktail-pill" aria-label="Edit Dexamethasone 10mg IV — opens Steroid accordion">
      Dexamethasone 10mg IV
    </button>
  </div>
  <button type="button" class="cocktail-copy-all" aria-label="Copy all 3 drugs as order set to clipboard">
    Copy all
  </button>
</div>
```

Tokens:

| Element | Classes |
|---|---|
| Container | `flex flex-col gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl` (when drawer-rendered, this matches §5.4 expanded-content rhythm) |
| Eyebrow + count | `text-[10px] font-bold text-slate-500 uppercase tracking-widest` |
| Pill row container | `flex flex-wrap gap-2` (horizontal flow; wraps to multiple lines if >3 drugs) |
| Cocktail pill (resting) | `inline-flex items-center px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium hover:bg-slate-100 hover:ring-1 hover:ring-neuro-200 transition-all min-h-[44px]` — wraps in `p-3 -m-3` to achieve 44px hit target without growing the visible pill (per §3.4 chip-as-button pattern) |
| Cocktail pill (about to be removed via cascade) | `bg-amber-50 border-amber-200 text-amber-700` for the 250ms before removal animation completes |
| Copy-all button | `inline-flex items-center px-3 py-1.5 rounded-full bg-neuro-500 text-white text-xs font-semibold hover:bg-neuro-600 transition-colors min-h-[44px]` (matches §2 header copy button, miniaturized for in-row use) |
| Empty state placeholder | `text-xs italic text-slate-400 py-1` (when no drugs selected: `Tap a drug to start the cocktail`) |
| Drawer header count badge | `text-[10px] font-medium text-slate-500` rendered next to the §5.3 `collapsedStat` separator: `Cocktail · 3 drugs · Tap to review` |

**Pill content format:** `{Agent} {dose} {route}` — concatenated with single spaces. Examples:
- `Prochlorperazine 10mg IV`
- `Diphenhydramine 50mg IV`
- `Ketorolac 30mg IV`

Ordering: pills appear in the order drugs were selected (latest selection appears rightmost in the wrap-flow). Re-selecting an agent in a category does NOT change pill order — the original selection slot is updated in place.

**Tap behavior on a pill:** opens the source category accordion in edit mode, scrolls to the category row, expands the accordion, and visually highlights the currently-selected option (per §3.4 chip-tap behavior). The pill itself stays selected throughout — no cascade-clear unless the user actually changes the value. This is the parallel-selection analog to §3.4 branch chips, which serve sequential-step decisions.

**Copy-all behavior:** on tap, copies the entire cocktail as a clipboard-ready order set, one drug per line:

```
Prochlorperazine 10mg IV
Ketorolac 30mg IV
Dexamethasone 10mg IV
Diphenhydramine 50mg IV
```

Format is intentionally bare (no dashes, no headings) — the output is intended to paste directly into an EHR order field or be read aloud to a nurse. Success state: button label swaps to `Copied` with `text-emerald-600` for 1.2s, then auto-reverts. No `alert()`, no toast.

**Empty state:** when no drugs are selected, the pill row renders the italic placeholder `Tap a drug to start the cocktail` in slate-400. The copy-all button is hidden (not just disabled) — there is nothing to copy. The eyebrow reads `COCKTAIL · 0 DRUGS` or, more cleanly, `COCKTAIL` (no count suffix when empty).

**Cocktail count badge in drawer header:** when the cocktail is non-empty and the drawer is collapsed, the `collapsedStat` includes a count suffix:
- `Cocktail · 3 drugs` (collapsed drawer header reads this; full §5.3 format is `{tier label} · {key fact}`, and "Cocktail" substitutes for tier when the pathway is in cocktail-assembly State B)
- After full cocktail assembled and transition to State C: `Full cocktail · 4 agents` or the §5.3 tier vocabulary if the pathway uses one

**Cascade-clear interaction with §3.6:** if a safety profile change (e.g., adding "Pregnancy" to a safety row) auto-removes a drug from the cocktail (per Migraine pathway's `useEffect` auto-deselect logic), the affected pill animates: 250ms amber-50 background flash, then slide-out to the right with the pill's width collapsing. The user sees which pill was removed and why (a §3.6 inline cascade-clear notice fires in the safety step body naming the removed drug). The notice copy: `Pregnancy added — {Drug} removed from cocktail.`

**Anti-patterns:**
- Do NOT render cocktail pills as plain `<span>` or `<div>` elements. Each pill is a `<button>` per §3.4 chip-as-button pattern.
- Do NOT show the cocktail only in the final plan step. The whole point of this pattern is persistence during cocktail assembly.
- Do NOT use `alert()` for copy-all feedback. Inline button state-swap only (per §11 and §4.8 dose-result-row copy behavior).
- Do NOT order pills by category-priority (antiemetic first, then NSAID, etc.). Selection-order is the correct ordering because it mirrors the clinician's working memory of "what I just picked."
- Do NOT render the cocktail in both the drawer AND inline on the step body simultaneously. Pick one rendering surface per pathway; double-rendering creates the same item in two visual locations and breaks the "single source of truth" rule.
- Do NOT show a "Clear cocktail" button at the row level. A bulk-clear action belongs to the §2 header reset button, which clears the entire pathway state including the cocktail.
- Do NOT exceed 40 chars in the `collapsedStat` count suffix (per §5.3 max-length rule). `Cocktail · 4 drugs` is 18 chars; safe.

**Pattern intent:** persistent cocktail visibility. The live cocktail row makes the running selection readable without requiring step navigation. Addresses Migraine UX audit CW-1 (cocktail invisible until Step 5) and aligns with the EVT-v3 "drawer as live summary" pattern adapted for parallel rather than sequential decisions.

**Research basis:** research synthesis Principle 4 (always-visible decision trail) extended to parallel-selection contexts; Bates 2003 "anticipate needs in real time"; Klein RPD situation visibility. Full rationale: `docs/reviews/ux-audit-migraine-pathway-2026-05-16.md` finding CW-1 and Priority 1 of the recommended rebuild plan.

### 4.10 Differential routing screen (Migraine-specific; generalizable to other pathways)

The differential routing screen is a Step-0 (or any-step) pattern that asks the clinician to confirm the diagnostic frame before proceeding with pathway-specific management. It is the structural answer to "what if this isn't actually the pathway-targeted diagnosis?" — a question that the rest of Pattern A does not address because Pattern A assumes the pathway diagnosis is correct.

The canonical use is Migraine: a patient with severe headache may have cluster headache, trigeminal neuralgia, or hemicrania continua — not migraine. Routing all severe-headache patients through the migraine cocktail misses, at minimum, the Level A high-flow oxygen for cluster headache. The differential routing screen is the structural pre-pathway gate that catches these patients.

The pattern is migraine-led but generalizable: any pathway whose target diagnosis has clinically common mimics with distinct management should consider a §4.10 screen as Step 0.

**Canonical visual reference:** Migraine Pathway rebuild, Step 0 (Differential) — the screen that precedes Step 1 (Red Flags).

**Anatomy:**

```html
<section aria-labelledby="step-0-heading" class="px-5 pt-6 pb-4 space-y-4">
  <h2 id="step-0-heading" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
    IS THIS MIGRAINE?
  </h2>
  <p class="text-sm text-slate-600">Quick screen for headache mimics before proceeding.</p>
  <div role="radiogroup" aria-labelledby="step-0-heading" class="grid grid-cols-1 sm:grid-cols-2 gap-3">
    <button type="button" class="diff-option diff-option-primary" aria-pressed="true">
      <span class="diff-option-icon"><!-- stethoscope SVG, w-4 h-4 text-slate-500 --></span>
      <span class="diff-option-stack">
        <span class="diff-option-label">Migraine — proceed</span>
        <span class="diff-option-desc">Typical episodic or chronic migraine features</span>
      </span>
    </button>
    <button type="button" class="diff-option" aria-pressed="false">
      <span class="diff-option-icon"><!-- wind SVG (cluster: O2 cue), w-4 h-4 text-slate-500 --></span>
      <span class="diff-option-stack">
        <span class="diff-option-label">Cluster headache features</span>
        <span class="diff-option-desc">Autonomic + restless + 15–180 min unilateral</span>
      </span>
    </button>
    <button type="button" class="diff-option" aria-pressed="false">
      <span class="diff-option-icon"><!-- zigzag SVG (TN: paroxysmal cue) --></span>
      <span class="diff-option-stack">
        <span class="diff-option-label">Trigeminal neuralgia features</span>
        <span class="diff-option-desc">Paroxysmal electric-shock unilateral facial pain</span>
      </span>
    </button>
    <button type="button" class="diff-option" aria-pressed="false">
      <span class="diff-option-icon"><!-- indo-tag SVG (PH/HC cue) --></span>
      <span class="diff-option-stack">
        <span class="diff-option-label">Indomethacin-responsive features</span>
        <span class="diff-option-desc">Side-locked + autonomic + brief or continuous</span>
      </span>
    </button>
  </div>
</section>
```

Tokens:

| Element | Classes |
|---|---|
| Step eyebrow (question) | `text-[10px] font-bold text-slate-400 uppercase tracking-widest` (matches §3.3 active-state eyebrow) |
| Prompt paragraph | `text-sm text-slate-600 leading-relaxed` |
| Grid | `grid grid-cols-1 sm:grid-cols-2 gap-3` (1-per-row mobile, 2×2 desktop ≥640px) |
| Option button (resting) | `min-h-[80px] rounded-2xl border border-slate-200 bg-white px-4 py-3 flex items-start gap-3 text-left hover:bg-slate-50 hover:border-slate-300 transition-colors focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none` |
| Option button (primary — "Migraine — proceed") | `border-neuro-500 bg-neuro-50 hover:bg-neuro-100 hover:border-neuro-600` — visually marked as the default/proceed option, but selection is still required (no auto-advance) |
| Option button (selected non-primary) | `border-neuro-500 bg-neuro-50 text-neuro-700` (same selected-tone as §4.2 tri-buttons) |
| Icon container | `flex-shrink-0 mt-0.5 w-4 h-4 text-slate-500` — inline-bare SVG only, no icon-tile background |
| Two-line stack (label + description) | `flex flex-col gap-1 min-w-0 flex-1` |
| Label | `text-sm font-semibold text-slate-900 leading-tight` |
| Description | `text-[11px] text-slate-500 leading-snug` (slate-500 per §3.7.1 WCAG AA ratio on white) |

**Sizing rationale:** `min-h-[80px]` exceeds both the §8 44px baseline and the §4.7 outcome-row 60px elevation. The differential options each represent a major diagnostic branch with downstream clinical-stakes consequences (cluster patient sent to migraine cocktail misses Level A oxygen; TN patient sent to migraine cocktail misses carbamazepine). The 80px floor signals "this is a high-stakes branch" and accommodates the two-line stacked label + description without crowding on 375px viewports.

**Two-line stacked label anatomy:** matches §3.7.1 exactly — label above (text-sm semibold slate-900), description below (text-[11px] slate-500), both left-anchored in a flex-column. No right-column description. No icon-tile wrapping. The icon is rendered inline-bare to the left of the stack per the design-tokens skill icon-bare convention.

**Icons:** small inline SVGs (`w-4 h-4 text-slate-500`), no container, no fill. The icons are semantic hints for novice clinicians (recognition over recall — research synthesis Principle 11) but never replace the label. The Migraine canonical icon set:

| Branch | Icon | Why this glyph |
|---|---|---|
| Migraine — proceed | stethoscope | generic clinical-evaluation cue; reads as "default clinical assessment" |
| Cluster headache | wind | semantic hint for high-flow oxygen (the Level A treatment) without explicitly naming it |
| Trigeminal neuralgia | zigzag | paroxysmal electric-shock visual metaphor |
| Indomethacin-responsive | indo-tag (small "Ix" badge or pill glyph) | direct nominal cue to the indomethacin trial |

Other pathways adapting §4.10 select icons appropriate to their differential set, following the same inline-bare slate-500 convention.

**Selection behavior — three modes:**

1. **Primary option ("Migraine — proceed") tapped:** the screen confirms the pathway frame and advances to Step 1 (Red Flags). No sub-screen, no drawer state change beyond `collapsedStat` updating to reflect the active step. This is the default forward flow.

2. **Non-primary option tapped (cluster / TN / indo):** the screen presents a brief sub-screen with confirmatory features for the selected differential. The sub-screen is rendered inline in the same step body (NOT a modal, NOT a separate route). Confirmatory features are 2–4 yes/no rows using §4.2 tri-buttons. Example for cluster:
   - "Autonomic features ipsilateral to pain (tearing, conjunctival injection, ptosis)?" — Yes/No/Unknown
   - "Restless / agitated during attack?" — Yes/No/Unknown
   - "Attack duration 15–180 min?" — Yes/No/Unknown

   After ≥2 yes answers, a `Confirm cluster headache` button advances to drawer State C terminal with the cluster-headache management card. ≤1 yes answers, a `Return to differential` button routes back to the screen with the primary option re-selectable.

3. **Drawer State C terminal for a non-migraine branch:** the drawer transitions to State C with tier tokens per §6 (typically `low` slot since the alternate diagnosis has its own established management) and `collapsedStat: "{Diagnosis} — separate protocol"`. Expanded drawer content (§5.4) carries:
   - Headline: e.g., `Cluster headache — Level A oxygen + SC sumatriptan`
   - Reasoning: brief clinical confirmation summary referencing the sub-screen answers
   - Evidence badge: source citation (e.g., `Robblee 2025 Table 3`)
   - Assessment summary: differential confirmation rows
   - "See also" links to the cluster-headache reference content (link-graph node)
   - Citation + disclaimer

   The pathway rail in §3 communicates the terminal state: the cluster branch chip reads `Cluster headache — separate protocol` and the §3 rail no longer advances past Step 0. The drawer is the output surface, the differential branch is terminal within the same pathway component.

**Default-selection behavior:** the primary "Migraine — proceed" option is visually marked as the default (neuro-50 background, neuro-500 border) but is NOT auto-selected on screen entry. The clinician must explicitly tap the primary option to advance — this is intentional. Auto-routing past a differential screen defeats the screen's purpose (catching mimics). A clinician who consciously taps `Migraine — proceed` has affirmed the diagnostic frame; a clinician who is auto-routed has not.

**Anti-patterns:**
- Do NOT render the differential as a modal, dialog, or separate route. The screen lives inline as Step 0 in the same pathway component. Modals violate the §1 anatomy contract.
- Do NOT auto-select the primary option on screen entry. The clinician must affirm the diagnostic frame with an explicit tap.
- Do NOT use icon-tiles (`p-1.5 bg-neuro-100 text-neuro-700 rounded-md`) wrapping the differential icons. Icons are inline-bare slate-500 per §3.3 anti-pattern and the design-tokens skill.
- Do NOT route non-primary branches to a separate page or route. Terminal differentials render in the drawer (§5.4 State C expanded). Same pathway, same component, different drawer state.
- Do NOT use red or amber for any differential option in the resting state. The differentials are alternate diagnoses, not warnings or escalations. Tier colors emerge only when the drawer reaches State C with the selected terminal management.
- Do NOT collapse the sub-screen on first sub-question answer. The clinician must answer the full confirmatory set (≥2 yes for activation, full panel for negation) before the screen routes.
- Do NOT shrink the option buttons below `min-h-[80px]`. The clinical-stakes premium over §4.7 60px and §8 44px is the whole point — these are diagnostic-branch decisions.
- Do NOT show more than 4 options in the differential grid. A 5+ option set indicates the screen is trying to do too much; refactor into a triage hierarchy (broad category first, sub-branches within selected category) rather than a flat option list.

**Pattern intent:** pre-pathway diagnostic gate. The differential routing screen catches the highest-clinical-stakes misrouting fix in Migraine — cluster patients sent to the migraine cocktail miss Level A oxygen, the single most impactful intervention for cluster headache. The screen generalizes to any pathway whose target diagnosis has clinically common mimics with distinct management (e.g., a syncope pathway with cardiac vs vasovagal vs orthostatic branches).

**Research basis:** research synthesis Principle 4 (decision-trail visibility — affirming the diagnostic frame is itself a decision worth surfacing) and Principle 11 (scaffolding for novices — the differential screen names the mimics the resident may not yet recognize from memory). Klein RPD situation re-examination — the screen forces a conscious frame-check before pattern-matching proceeds. Full rationale: `docs/reviews/ux-audit-migraine-pathway-2026-05-16.md` finding "Differential routing (cluster, MOH, indo, TN) — how to surface" and Priority 6 of the recommended rebuild plan.

---

## §5 Persistent Interpretation Drawer — REUSE CalculatorDrawer

**Hard rule:** Pathways render their interpretation through `<CalculatorDrawer>` from `src/components/calculators/CalculatorDrawer.tsx`. No hand-rolled drawer. The component already handles portal, fixed positioning above `--nav-rail-width`, z-[55], collapsed/expanded shadows, and State A/B/C semantics (CALCULATOR_SPEC §5).

The current `PathwayBottomDrawer` at `src/components/pathways/PathwayBottomDrawer.tsx` (introduced in commit 66769e6) is **deprecated** by this spec. It is to be retired in favor of `CalculatorDrawer` with the tier-to-severity mapping defined below. A migration ADR is required (`docs/adrs/ADR-XXX-pathway-drawer-unification.md`).

### 5.1 State mapping

Pathway state machine maps exactly onto the calculator State A/B/C machine (CALCULATOR_SPEC §5):

| Pathway condition | Drawer state | Drawer chrome |
|---|---|---|
| No step started, no inputs | **A** (empty, muted bar) | `bg-slate-100`, non-interactive, hint = `Appears when complete` |
| At least one input on any step, but pathway result not yet computed | **B** (partial, muted bar) | `bg-slate-100`, non-interactive (NOT `stateBTappable`) — pathway interim results are not clinically actionable until the full decision flow runs |
| Final step complete and `result.status !== 'Incomplete'` | **C** (complete, tappable, tier-tinted) | Tier tokens per §6 |

> Why pathways are NOT `stateBTappable`: unlike NIHSS where a partial score is still a number you can act on, a partial pathway has no actionable interpretation. Showing a tier color before the decision is computed misleads the clinician. Default is `stateBTappable={false}`.

### 5.2 Tier vocabulary → SeverityTokens map

Pathways carry one of three tier vocabularies. Each maps to the canonical `SeverityTokens` shape from `src/lib/calculators/severityTokens.ts`.

**Vocabulary A — Eligibility (EVT, MeVO, Late-Window IVT):**

| Tier label | Maps to severity slot | Token set |
|---|---|---|
| `Eligible` / `EVT Reasonable` | `low` | proceed tokens (§6) |
| `Consult` / `Clinical Judgment` / `Case-by-case` | `moderate` | consult tokens (§6) |
| `Avoid EVT` / `Not Eligible` / `Class III` | `high` | stop tokens (§6) |
| `Incomplete` / `Pending` | `none` | negative tokens (§6) |

**Vocabulary B — Risk stratification (GCA suspicion, vasculitis):**

| Tier label | Maps to severity slot |
|---|---|
| `Low` | `low` |
| `Intermediate` | `moderate` |
| `High` | `high` |
| `None` (insufficient data) | `none` |

**Vocabulary C — Day-by-day window (ELAN, Late-Window IVT):**

The drawer renders the computed day-range as the `collapsedStat` (e.g. `Day 3–4 · Minor stroke`); the tier slot is always `low` (proceed) once the date is computable, `none` otherwise. There is no "Avoid" branch — pathway already short-circuits to an ineligible-reason banner upstream.

A pathway data file MUST export a typed `pathwayTier: 'low' | 'moderate' | 'high' | 'none'` field on every result. Mapping pathway-native vocabulary → this slot is the pathway's own concern (see `evtStatusToTier` at EvtPathway.tsx lines 28–44 for an existing example).

### 5.3 Drawer header text — `collapsedStat`

Single line at 375px viewport (CALCULATOR_SPEC §5.2). Format:

```
{tier label} · {key fact}
```

Examples:
- `Eligible · ASPECTS 8, NIHSS 12`
- `Consult · mRS 2 with ASPECTS 5`
- `Avoid · Distal M3 (Class III)`
- `Day 3–4 · Minor stroke`

Max length 40 characters. `collapsedLabel` is always `Interpretation` (matches calculators).

### 5.4 Expanded drawer content

Renders inside `<CalculatorDrawer>` `children` slot per CALCULATOR_SPEC §5.1 ordered content:

```
1. Recommendation headline       text-xl font-semibold text-slate-900 leading-tight
2. Reasoning paragraph           text-slate-600 leading-relaxed mt-3
3. Evidence badge (optional)     inline pill, tier-tinted (§6)
4. Assessment summary            key-value rows (§5.5)
5. "See also" links              link-graph references (CALCULATOR_SPEC §7.3)
6. Citation + disclaimer         text-xs text-slate-400 leading-relaxed
```

The current EVT "Copy to EMR" black button (EvtPathway.tsx lines 1444–1451) is **out of spec** — copy lives in the header (§2), not in the drawer.

### 5.5 Assessment summary inside drawer

The drawer expanded content contains an Assessment Summary block (replacing the standalone white card at EvtPathway.tsx lines 1419–1440):

```html
<div class="mt-5 pt-4 border-t border-slate-100">
  <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
    Assessment summary
  </div>
  <dl class="space-y-2 text-sm">
    <div class="flex justify-between"><dt class="text-slate-500">Type</dt><dd class="text-slate-900 font-medium">LVO · Anterior</dd></div>
    <!-- one row per relevant input -->
  </dl>
</div>
```

---

## §6 Severity Tokens for Pathways

Pathway tier tokens follow the canonical `SeverityTokens` shape from `src/lib/calculators/severityTokens.ts` (see ABCD² at `src/pages/Abcd2ScoreCalculator.tsx` lines 55–80 for the existing reference instance). Pathways MUST NOT invent new token bundles; only the values change.

| Tier slot | Used for | borderColor | headerBg | headerHover | labelClass tone | statClass tone | chevronClass |
|---|---|---|---|---|---|---|---|
| `low` ("proceed / eligible") | Eligible, EVT Reasonable, Low suspicion | `#c7d2fe` (neuro-200) | `bg-neuro-50` | `hover:bg-neuro-100` | `text-neuro-700` | `text-neuro-700` | `text-neuro-700` |
| `moderate` ("consult / intermediate") | Consult, Clinical Judgment, Intermediate suspicion | `#fed7aa` (amber-200) | `bg-amber-50` | `hover:bg-amber-100` | `text-amber-700` | `text-amber-700` | `text-amber-700` |
| `high` ("stop / avoid / high suspicion") | Avoid EVT, Not Eligible, Class III, High suspicion | `#fecaca` (red-200) | `bg-red-50` | `hover:bg-red-100` | `text-red-700` | `text-red-700` | `text-red-600` |
| `none` ("negative / pending data") | Incomplete, Pending Imaging | `#e2e8f0` (slate-200) | `bg-white` | `hover:bg-slate-50` | `text-slate-400` | `text-slate-900` | `text-slate-400` |

> Why neuro-50 instead of emerald-50 for "proceed": pathway eligibility ≠ clinical low-risk. Emerald reads "the patient is fine" — wrong frame for "EVT is indicated." Cobalt reads "the system has a confident answer," matching the brand voice in the rest of the app (selected-option register, primary CTA register).

All token values reference design-tokens skill rows directly — no raw hex outside this table. Pathway data files import `SeverityTokens` and declare a typed `Record<PathwayTier, SeverityTokens>` per ADR-008 trade-off #1.

---

## §7 Typography

Per design-tokens skill (`SKILL.md` Typography scale). Pathways are a strict subset; no new tokens.

| Element | Classes |
|---|---|
| Page H1 (sr-only) | `text-[22px] md:text-[28px] font-medium tracking-[-0.01em] sr-only` |
| Header pathway name | `text-[15px] font-semibold text-slate-900 leading-tight tracking-tight` |
| Header eyebrow ("PATHWAY") | `text-[10px] font-bold text-slate-400 uppercase tracking-widest` |
| Step strip current label | `text-[11px] font-semibold text-slate-700 uppercase tracking-widest` |
| Step section H2 | `text-[10px] font-bold text-slate-400 uppercase tracking-widest` |
| Input group label | `text-sm font-semibold text-slate-700` |
| Tri / band button label | `text-sm font-medium` (unselected) / `font-semibold` (selected) |
| Inline helper text | `text-xs text-slate-500 leading-relaxed` |
| Drawer headline | `text-xl font-semibold text-slate-900 leading-tight` |
| Drawer body | `text-sm text-slate-600 leading-[1.55]` |
| Citation / disclaimer | `text-xs text-slate-400 leading-relaxed` |

The current EVT canary uses `text-5xl font-black` for the recommendation status (EvtPathway.tsx line 1469) and `font-black` widely — both are out of spec.

---

## §8 Touch Targets and Accessibility

Same rules as CALCULATOR_SPEC §2.4 + design-tokens skill ("Touch targets" row).

- Every interactive element: `min-h-[44px] min-w-[44px]`. The 8×8 future-step dots in §3.2 are wrapped in a `p-3 -m-3` button to reach 44×44 hit area without changing visual size.
- Focus rings on every button: `focus-visible:ring-2 focus-visible:ring-neuro-500 focus-visible:outline-none`.
- Tri-button group: `role="radiogroup"` on the container, `aria-checked` and `role="radio"` on each button, `aria-labelledby` pointing to the group label.
- Numeric inputs: `inputMode="numeric"` (iOS keypad) + `aria-describedby` pointing to the helper text (CALCULATOR_SPEC §4.6).
- Step dots: `aria-label="Step {N}: {title}"`, `aria-current="step"` on the active dot, `disabled` on un-reachable future steps.
- Drawer toggle: inherits `aria-expanded` / `aria-controls` from `CalculatorDrawer`.
- The pathway page emits exactly one `<h1>` (sr-only), one `<h2>` per step section, and `<h3>` for input group labels.

---

## §9 Width Zone and Layout

| Surface | Wrapper |
|---|---|
| Page root | `max-w-2xl mx-auto px-5` (calculator zone — `.zone-reading` family, NOT `.zone-reference`) |
| Sticky header inner | `max-w-2xl mx-auto` (so back arrow aligns with content) |
| Step strip inner | inherits page wrapper |

Pathways are detail pages (matching trial detail and calculator detail), not hubs — they use the `.zone-reading` width for line-length comfort on prose-heavy drawer content. The pathway list page at `/pathways` is governed by HUB_SPEC, not this spec.

Mobile: full viewport with safe-area-inset padding on the drawer (handled by `CalculatorDrawer`).
Desktop ≥ 768px: page wrapper centers; drawer is offset by `--nav-rail-width` (handled by `CalculatorDrawer`).

---

## §10 Mobile vs Desktop

Pathways are **Archetype 1** (single-row header) — same as ICH Score, GCS, ABCD². No mode toggle, no two-row header, no NIHSS-style "Rapid / Detailed" switch.

- Mobile (<768px): sticky header, step strip below, single-step content scrolls, drawer pinned above mobile nav (`--tab-bar-height`).
- Desktop (≥768px): same anatomy. The desktop nav rail (LAYOUT_SPEC §6.1) shifts the drawer right by `--nav-rail-width` automatically.
- No archetype-specific desktop layout. No two-column "inputs on left / drawer on right" treatment is permitted — the persistent bottom drawer is universal.

---

## §11 What Pathways Should NOT Do (Anti-patterns)

The current EVT canary (`src/pages/EvtPathway.tsx`, 1500+ lines) carries multiple violations that this spec explicitly forbids in v1.0. Every violation has a citation to the relevant spec section.

| # | Anti-pattern | Where it currently lives | Forbidden by |
|---|---|---|---|
| 1 | Hand-rolled drawer component (`PathwayBottomDrawer`) instead of `CalculatorDrawer` | `src/components/pathways/PathwayBottomDrawer.tsx`; imported at EvtPathway.tsx line 15 | §5 hard rule |
| 2 | Raw hex colors and `bg-emerald-50 border-emerald-500` for tier chrome | EvtPathway.tsx lines 1173–1176, 1454–1458 | §6 token table |
| 3 | `lucide-react`'s `ChevronRight` / `ArrowLeft` instead of the shared `Chevron` component and canonical back-arrow SVG | EvtPathway.tsx line 4 imports; line 942 uses `<ArrowLeft size={16} />`; line 1398 uses `<ChevronRight size={20} />` | §2, §4.6 |
| 4 | `CollapsibleSection` per step (accordion stack) instead of single-active-step view | EvtPathway.tsx lines 987, 1088, 1158, 1406 | §4.1 |
| 5 | Emerald complete-state dots in step strip | EvtPathway.tsx line 965 `bg-emerald-500` | §3.2 |
| 6 | Per-input `variant="danger"` red painting on Tri buttons | EvtPathway.tsx lines 1033, 1064, 1220 | §4.2 ("input state is selected/not selected; consequence in drawer") |
| 7 | Black "Copy to EMR" button inside the result card | EvtPathway.tsx lines 1444–1451 | §2 (Copy lives in header) + §5.4 (drawer content order) |
| 8 | `text-5xl font-black tracking-tight` recommendation typography | EvtPathway.tsx lines 1469–1473 | §7 typography scale |
| 9 | `max-w-3xl` page wrapper | EvtPathway.tsx line 933 | §9 (`max-w-2xl`) |
| 10 | Icon-tile flourish in header (`<div className="p-1.5 bg-neuro-100 text-neuro-700 rounded-md">`) wrapping `Zap` icon | EvtPathway.tsx lines 944–948 | §2 (left cluster is eyebrow + name only) |
| 11 | Cobalt full-bleed "Imaging complete — Tap Next" nudge card | EvtPathway.tsx lines 1389–1399 | §5.1 (State B is non-tappable, non-tinted, muted bar; no separate "you're done with imaging" treatment) |
| 12 | Custom `border-l-[8px]` result card with `text-emerald-900` / `text-red-900` body text | EvtPathway.tsx lines 1454–1497 | §5.4 (result lives in drawer, not in a step card) |
| 13 | `Material Symbols` font usage (e.g. `<span class="material-symbols-outlined">calculate</span>`) | EvtPathway.tsx line 1198, 1286 | design-tokens skill (icons are React components from `src/components/icons/` or shared `Chevron`) |
| 14 | Step content scrolled by section ref + `scroll-mt-4` | EvtPathway.tsx lines 986, 1087, 1157, 1405 | §4.1 (only current step renders; no in-page scroll-to-section) |
| 15 | Ignoring `--nav-rail-width` offset on drawer (current PathwayBottomDrawer does not honor it) | `src/components/pathways/PathwayBottomDrawer.tsx` | §5 (CalculatorDrawer handles this) |

When the EVT rebuild lands, this table becomes the regression-prevention checklist for every subsequent pathway.

---

## §12 SEO and Link Graph Requirements

Pathways follow CALCULATOR_SPEC §7 with two substitutions: schema type and route prefix.

### 12.1 Route metadata (per `src/config/routeManifest.ts`)

- `title`: `"{Pathway Name} Pathway | NeuroWiki"` (50–60 chars)
- `description`: keyword-rich, 150–160 chars, includes clinical scenario
- Route prefix: `/pathways/{slug}`

### 12.2 Structured data

Two JSON-LD blocks per pathway page:

- **MedicalGuideline** — the decision pathway as a clinical guideline excerpt
  - `evidenceLevel`, `guidelineSubject`, `recognizingAuthority` populated from the pathway's primary citation
- **MedicalWebPage** — same shape as calculators (CALCULATOR_SPEC §7.2)

### 12.3 Link graph

Each pathway registers in `docs/link-graph.json`:
```json
"pathway/{slug}": {
  "type": "pathway",
  "title": "{Pathway Name} Pathway",
  "route": "/pathways/{slug}",
  "references": ["calc/aspects", "trial/select2", "guideline/aha-asa-2026"],
  "referencedBy": [...]
}
```

"See also" links inside the drawer (§5.4 step 5) must exactly match `references`. Stub-node exception per CALCULATOR_SPEC §7.4 applies.

---

## §13 File Organization

| Artifact | Location |
|---|---|
| Pathway page component | `src/pages/{Name}Pathway.tsx` |
| Pathway logic & data | `src/data/{name}PathwayData.ts` (exports typed `Inputs`, `Result`, `STEPS`, `calculate()`, `tierMap`) |
| Pathway drawer | `src/components/calculators/CalculatorDrawer.tsx` — REUSE, no fork |
| Tier-to-severity mapping | inline helper in the data file (e.g. `evtStatusToTier` already exists at EvtPathway.tsx lines 28–44; move to `src/data/evtPathwayData.ts`) |
| Severity tokens | `src/lib/calculators/severityTokens.ts` (shared) |
| Route registration | `src/config/routeManifest.ts` |
| Link graph | `docs/link-graph.json` |

Pathway `Result` type contract:
```typescript
interface PathwayResult {
  pathwayTier: 'low' | 'moderate' | 'high' | 'none';   // → SeverityTokens slot
  tierLabel: string;        // human-readable, e.g. "Eligible", "Consult", "Avoid"
  collapsedStat: string;    // drawer header text (≤40 chars, §5.3)
  headline: string;         // drawer expanded headline (§5.4)
  reasoning: string;        // drawer expanded paragraph
  evidenceBadge?: string;   // e.g. "COR 1 · HERMES"
  assessmentSummary: Array<{ key: string; value: string }>;
  seeAlso: string[];        // link-graph node IDs
  status: 'Complete' | 'Incomplete' | 'Pending';   // drives State A/B/C
}
```

---

## §14 Canonical Pathway = EVT

The EVT Pathway is the v1.0 canary. The next step in this design-before-code cycle is:

1. **Design Prototyper** produces `docs/specs/mockups/pathway-evt-reference.html` with three frames:
   - Frame A: Step 1 (Triage), no inputs, drawer State A (muted bar)
   - Frame B: Step 3 (Imaging), some inputs filled, drawer State B (muted bar with progress count)
   - Frame C: Step 4 (Decision), result computed, drawer State C expanded (tier-tinted, full content)
2. **Design Guardian** co-signs this spec + mockup pair, locks v1.0.
3. **Calculator Engineer + UI Architect** rebuild `EvtPathway.tsx` against the locked spec, walking the §11 anti-pattern table as the regression checklist.
4. After EVT ships clean, the other six pathways (ELAN, Status Epilepticus, Migraine, GCA, Late-Window IVT, ICH Management) are rebuilt in subsequent swarms.

Until the EVT canary lands, this spec remains a v1.0 **draft** — open for amendment based on mockup-stage findings.

---

## §15 Changelog

```
2026-05-15 · v1.0 (draft) · Initial spec authored after V flagged that
  PathwayBottomDrawer (commit 66769e6) ships against the site's DNA.
  - §1 anatomy locked to 5 elements (header / step strip / step content / drawer / footer)
  - §2 single-row header pattern adopted from CALCULATOR_SPEC §1.1
  - §3 horizontal dot strip (not vertical timeline) per calculator section register
  - §4 single-active-step view (NOT accordion); Tri / band / number-input vocab locked
  - §5 hard rule: REUSE CalculatorDrawer; PathwayBottomDrawer deprecated
  - §6 tier→SeverityTokens map established (neuro-50 for proceed, NOT emerald-50)
  - §11 anti-pattern table captures 15 violations in the current EVT canary
  - Next: design-prototyper produces pathway-evt-reference.html, design-guardian locks v1.0
  Author: Design Guardian (this session)
  Approved by: pending (V — after mockup + co-sign)

2026-05-15 · v1.1 (draft) · §3 rewritten — Pattern A (vertical decision-tree rail)
  - §3 horizontal dot strip REPLACED by Pattern A: vertical connector rail.
  - Rail: cobalt border-l-2 (traversed) / slate-200 border-l (untraversed).
  - Nodes: filled cobalt (completed), hollow cobalt ring (active), slate-300 hollow (locked).
  - Branch chips: text-[11px] bg-slate-50 rounded-full inline summaries between steps.
  - Locked step body: eyebrow at 50% opacity, italic "Awaiting Step N ↑" placeholder.
  - Cascade-clear behavior fully specified (§3.6).
  - Canonical visual: docs/specs/mockups/pathway-evt-reference.html (five frames).
  - §1 anatomy note updated: "step-progress strip" element is now the rail (embedded in
    the scrollable content column), not a discrete horizontal strip element.
  Author: Design Prototyper (round 4, 2026-05-15)
  Approved by: pending (V)

2026-05-15 · v1.2 (draft) · §3.7 added — category-row (iOS-Settings) pattern
  - Round-4 option-grid (one row per option) replaced by category-row pattern (one row
    per category). This aligns with V's correction: "categories need a drop down instead
    of multiple listing."
  - §3.7 specifies: resting state (label + value + chevron), unselected state (Select…
    italic), expanded accordion (inline, below the row, with 2px cobalt left bar on the
    selected option), numeric-input variant (ASPECTS: inline bordered field + unit),
    and completed-step row (cobalt bar + neuro-50 bg, no chevron).
  - §3.8 step labels updated to EVT canonical: TRIAGE / CLINICAL / IMAGING / RESULT
    (matching EvtPathway.tsx STEPS array).
  - Old §3.8 "What replaced the strip" renumbered to §3.9.
  - Anti-pattern list in §3.7: no native <select>, no bottom-sheet modal, no radio
    circles, no icons inside rows, no one-row-per-option grid.
  - Canonical visual for expanded accordion: Frame 1, LVO Location row open.
  - mockup pathway-evt-reference.html updated to round 5 with all five frames revised.
  Author: Design Prototyper (round 5, 2026-05-15)
  Approved by: pending (V)

2026-05-15 · v1.4 (draft) · §3.7.1 added — two-line stacked option anatomy (content density fix)
  - Root cause: the two-column (label-left / description-right) option layout in §3.7
    breaks when labels vary in length (e.g. "Non-dominant proximal M2" vs "ACA" in the
    same MeVO Location accordion). V flagged: "content rich section is very cluttered...
    text is all misaligned."
  - §3.7.1 specifies the new standard: description sits below the label (flex-direction:
    column, align-items:flex-start, gap:2px) rather than beside it. Both left-anchored.
  - CSS: cat-option-btn changes from implicit row to column layout. cat-option-desc
    (renamed from cat-option-sub) uses font-size:11px and color:slate-500 (WCAG AA).
  - Touch target: min-height:44px preserved. Natural height ~54px per two-line option.
  - WCAG: cat-option-desc at slate-500 = 4.48:1 on white. Passes AA. Hard rule preserved.
  - Anti-pattern note added to §3.7: "Do NOT render description text in a right column."
  - Companion demo: docs/specs/mockups/pathway-evt-interactive-demo-v2-content-density.html
  - Research: Material Design 3 two-line list; Apple HIG subtitle cell; NN/g Budiu 2021;
    Wroblewski 2008; BMJ Best Practice / UpToDate observed CDS patterns.
  - Full rationale: docs/reviews/ux-content-density-pathway-2026-05-15.md
  - Migration: 10 accordions in EVT pathway, all future pathways follow this standard.
  Author: UI Architect (2026-05-15)
  Approved by: pending (V — after side-by-side demo comparison)

2026-05-16 · v1.5 (draft) · §4.7–§4.10 added — outcome row, dose result row,
  live cocktail summary, differential routing screen
  - §4.7 Outcome row: two-button binary state-transition pattern (Stopped/Persists)
    for clinical event recording at the end of a treatment stage. min-h-[60px],
    emerald-50/amber-50 token pair. Distinct from §4.2 tri-button (which captures
    input observation, not event outcome). Cascade-routes on Persists; terminates
    on Stopped. Optional time-anchor caption when seizure-onset is tracked.
    No third "Unsure" option — binary by design. Anti-patterns explicit.
    Surfaced by: docs/reviews/ux-audit-se-pathway-2026-05-16.md F-01, Priority 1.
  - §4.8 Dose result row: persistent computed-dose display row at top of active
    step (or sticky-within-step). text-base font-mono font-semibold dose value;
    text-[10px] computed-from hint always visible. Empty-state amber-50 warning
    when weight missing — error strings NEVER render in dose typography.
    Inline copy-to-clipboard with icon-swap feedback (no alert, no toast).
    Display row only — no chevron, no expansion.
    Surfaced by: docs/reviews/ux-audit-se-pathway-2026-05-16.md F-01, F-02.
  - §4.9 Live cocktail summary row: drawer-rendered (primary) running list of
    selected drugs across parallel category accordions. Pills are buttons per
    §3.4 chip-as-button pattern; tap routes back to source accordion. Copy-all
    emits one-drug-per-line clipboard format. Cocktail count badge in drawer
    collapsedStat. Cascade-clear animation when safety profile auto-removes
    a drug. Empty state placeholder "Tap a drug to start the cocktail."
    Surfaced by: docs/reviews/ux-audit-migraine-pathway-2026-05-16.md CW-1, Priority 1.
  - §4.10 Differential routing screen: Step-0 pre-pathway diagnostic gate.
    4-option grid (2×2 desktop / 1-per-row mobile), min-h-[80px] buttons,
    two-line stacked label + description per §3.7.1. Primary option visually
    default but never auto-selected. Non-primary routes to inline sub-screen
    with confirmatory tri-button questions, then drawer State C terminal.
    Inline-bare slate-500 icons only — no icon-tiles. Migraine canonical use:
    catches cluster (Level A oxygen miss), TN, indomethacin-responsive.
    Generalizable to any pathway with clinically common mimics.
    Surfaced by: docs/reviews/ux-audit-migraine-pathway-2026-05-16.md Priority 6.
  - All four patterns are additive — no existing §3 sections are modified.
  - All four patterns work within the existing palette (neuro/slate/amber/red/
    emerald). No new tokens introduced. The single emerald usage in §4.7
    "Stopped" button is bound to clinical-event-success state and remains
    forbidden as a tier color (§6 unchanged).
  - Companion mockups: forthcoming alongside SE and Migraine rebuild swarms.
  - Sign-off block at the bottom of this changelog lists the 4 new sections.
  Author: Design Guardian (2026-05-16)
  Approved by: pending (V — after SE and Migraine rebuild plans cite these sections)

2026-05-15 · v1.3 (draft) · §3.4 + §3.6 updated — tap-targetable chips + cascade-clear notice
  - §3.4 extended: every branch chip is now a <button> (never <span>/<div>). Hit target
    44×44 via p-3 -m-3 wrapper. Hover: hover:bg-slate-100 hover:text-slate-900
    hover:ring-1 hover:ring-neuro-200. On activate: scroll to source step in edit mode
    with relevant category-row accordion pre-opened. Rail and downstream chips do NOT
    collapse on chip-tap alone. aria-label="Edit: {decision summary}" required.
    Anti-pattern note added: chips are NEVER plain <span>/<div> going forward.
  - §3.6 extended: cascade-clear now fires an inline transient notice immediately below
    the changed category-row (never a toast/modal/page-top banner). Notice anatomy:
    slate-50 pill, slate-200 border, small CCW-arrow icon, bold prefix naming cleared
    steps, Undo button. Auto-dismiss: 4 seconds or next outside tap. Undo behavior:
    restores prior upstream answer + all downstream answers (memory held until dismiss).
    Transitions: 200ms fade/translate for notice in/out; 250ms rail color fade.
    Anti-pattern note added: cascade-clear MUST NOT be silent.
  - Rationale source: docs/research/2026-05-15-flowchart-pathway-design-research.md
    Evolutions 1, 2, and 4 (Klein RPD, Shneiderman Rule 6, Nielsen H#1/H#3,
    Norman gulf-of-evaluation, ISO 9241-110 use-error robustness).
  - Companion mockup updated to round 6: all 10 chips across 5 frames converted to
    buttons; Frame 6 added demonstrating cascade-clear in progress.
  Author: Design Prototyper (round 6, 2026-05-15)
  Approved by: pending (V)
```

---

### @design-guardian — Sign-off (v1.5)

**Spec being changed:** `docs/specs/PATHWAY_SPEC.md`
**Change type:** addition (four new sections added to §4; no existing sections modified)
**Sections added:**
- §4.7 Outcome row (SE-specific, generalizable)
- §4.8 Dose result row (SE-specific, generalizable)
- §4.9 Live cocktail summary row (Migraine-specific, generalizable to parallel-selection pathways)
- §4.10 Differential routing screen (Migraine-specific, generalizable)

**Rationale:** Unblock the SE and Migraine pathway rebuild plans. The Pattern A canon (§3.2–§3.7.1, §4.2–§4.6) was authored against the EVT canary, which is a sequential-decision pathway with a single eligibility output. SE and Migraine surface three structural gaps that the EVT-derived patterns do not cover: (1) clinical-event recording at the end of a stage (Stopped/Persists) — §4.7 fills this; (2) persistent computed-dose display so the dose is never one scroll away — §4.8 fills this; (3) parallel-selection drug cocktail visibility — §4.9 fills this; and (4) pre-pathway diagnostic gating to catch mimics whose management diverges — §4.10 fills this. All four were surfaced by independent UX audits dated 2026-05-16 (SE and Migraine), and all four are required before Phase C rebuild plans can be written for those pathways.

**Token discipline:** all four sections work within the existing palette (`neuro-*`, `slate-*`, `amber-*`, `red-*`, `emerald-*`). The single new sanctioned emerald usage in §4.7 (Stopped button) is bound to clinical-event-success and is explicitly NOT a tier color — §6 remains unchanged and emerald is still forbidden as a `low` tier alternative. No new tokens introduced.

**Cross-references:**
- §4.7 anchors to research synthesis Principles 4 (situation re-examination) and ISO 9241-110 self-descriptiveness.
- §4.8 anchors to research synthesis Principles 4 (always-visible trail) and 7 (explicit feedback on state change); Bates 2003 "anticipate needs in real time."
- §4.9 anchors to research synthesis Principle 4 extended to parallel selection; Bates 2003.
- §4.10 anchors to research synthesis Principles 4 (decision-trail visibility, frame-check as a surfaced decision) and 11 (scaffolding for novices via named mimics).

**Changelog entry drafted:** yes (v1.5 entry above; bumped from v1.4 since EVT rebuild has not yet merged, no v1.5 collision).

**Companion mockups:** forthcoming alongside the SE and Migraine rebuild swarms. The four sections name canonical visual references that will be authored by the design-prototyper as part of those swarms; the spec prose is intentionally complete enough to lock the patterns before mockups land, per the SE and Migraine audit recommendations to land spec extensions before Phase C plans.

**Hard rules locked in this version:**
- Outcome row is binary — no third "Unsure" option (anti-pattern explicit).
- Dose result row error strings NEVER render in dose typography (the SE F-02 patient-safety risk is closed).
- Cocktail pills are `<button>` not `<span>`/`<div>` (consistent with §3.4 chip-as-button).
- Differential primary option is visually default but never auto-selected (the whole point of the screen is conscious frame-check).
- No `alert()`, no modals, no toasts across any of the four sections — inline state-swap feedback only, consistent with §11 anti-patterns.

**Status:** ready

Notes:
- v1.5 supersedes v1.4 only by addition; v1.4 §3.7.1 two-line stacked anatomy remains the standard and is the structural basis for §4.10's option button.
- The EVT rebuild swarm may continue against v1.4 + v1.5 simultaneously — these new sections do not retrofit any existing EVT pattern.
- SE and Migraine rebuild plans must cite §4.7/§4.8 (SE) and §4.9/§4.10 (Migraine) in pre-flight per the hard-cite rule.

