# TRIALS_SPEC.md — NeuroWiki Trial Page Design Specification

**Version:** 1.0 — locked 2026-04-21
**Status:** Locked — design-guardian co-sign issued 2026-04-21
**Owner:** Design Guardian
**Mockup:** docs/specs/mockups/trial-reference.html
**ADR:** docs/adrs/ADR-005-trials-spec-v1.md
**Scope:** Trial detail pages rendered by `src/pages/trials/TrialPageNew.tsx` at route `/trials/:topicId`

This spec is the single source of truth for the anatomy, behavior, and SEO of every trial detail page in NeuroWiki. Every swarm touching a trial page must cite section IDs and line numbers from this file in pre-flight. The companion mockup (`trial-reference.html`) is the visual ground truth; this prose is the behavioral ground truth. Neither is complete without the other.

The EXTEND trial (slug `extend-trial`) is the **Archetype A canary**: the first fully implemented trial under this spec. All other trials are rebuilt against this spec in subsequent swarms after the canary ships.

---

## §0 Scope and Non-Goals

### 0.1 In scope

- Trial detail pages at `/trials/:topicId`
- All six visualization archetypes (§2-§7)
- Bottom-line drawer behavior (§10)
- Population, inclusion, exclusion, intervention, safety, pearls, source sections (§11-§14)
- Teaching surfaces: "How to read this chart" and "How to interpret this trial" (§8)
- Inline statistical tooltips (§9)
- Citation and paraphrase rules for trial content (§15)
- SEO metadata and JSON-LD schema for trial pages (§16)
- Agent ownership matrix (§17)
- TrialMetadata schema extensions required by this spec (§18)
- Acceptance checklist (§19)

### 0.2 Not in scope (explicit exclusions)

- `/trials` listing page — separate spec pending
- Trial agent (AI-powered interpretation layer) — separate spec pending
- Pathway pages (`src/pages/guide/`) — PATHWAY_SPEC.md pending (Wave 6)
- Article pages — ARTICLE_SPEC.md pending
- Calculator pages — governed by CALCULATOR_SPEC.md v1.1
- Clinical content authoring — governed by CLAUDE.md §13 and medical-scientist agent brief
- Citation registry population — governed by ADR-002 and the W5.2 task
- The dark right-side sidebar from the legacy `TrialPageNew.tsx` — **removed in this redesign**. The sidebar (`bg-slate-900` panel) does not appear in any state of the redesigned trial page.

---

## §1 Shared Anatomy

Every trial detail page has exactly these elements, in this order. No additional top-level layout elements are permitted.

```
1. Sticky top header
2. Scrollable content (sections 1-10 in mandatory order, §1.2)
3. Mobile tab bar (mobile only, sticky bottom)
4. Bottom-line drawer (sticky, above tab bar)
```

### 1.1 Sticky Top Header

**Mockup reference:** Stage 1 (default view), both frames

```
sticky top-0 z-40 bg-white/95 backdrop-blur-md
```

Border: `border-bottom: 1px solid #f1f5f9`

**Inner padding:**
- Mobile (< 768px): `px-5 py-3`
- Desktop (>= 768px): `px-7 py-3`

**Left cluster — back arrow + trial identifier:**
```
display: flex; align-items: center; gap: 12px
```

Back arrow button: identical to CALCULATOR_SPEC §1.1. SVG: 20×20, `M19 12H5M12 19l-7-7 7-7`.

Trial identifier block (two lines):
- Short identifier: `font-size: 13px; font-weight: 700; color: #0f172a; letter-spacing: 0.02em; line-height: 1.2`
  - Content: short trial name, e.g. "EXTEND Trial"
- Eyebrow meta: `font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.04em; color: #94a3b8; margin-top: 1px`
  - Content: `[YYYY] · [Journal short name]`, e.g. "2019 · NEJM"

**Right cluster:** Empty. Trial pages carry no star, no reset, no Copy button in the header. Right side of the header row is unused.

### 1.2 Scrollable Content — Mandatory Section Order

Content scrolls freely. No max-height on the main region. Bottom padding must account for drawer height (collapsed: 60px; expanded: varies).

Outer padding:
- Mobile: `padding: 20px 20px 16px`
- Desktop: `padding: 28px 32px 16px`

**Mandatory section order (do not reorder):**

```
1.  Title block           (§1.3)
2.  Primary Outcome       (§2–§7, archetype-dependent)
3.  Population            (§11.1)
4.  Inclusion Criteria    (§11.2)
5.  Exclusion Criteria    (§11.3)
6.  Intervention          (§12)
7.  Trial at a Glance     (§1.4)
8.  Safety                (§13)
9.  How to Interpret      (§8.2 — collapsible teaching well)
10. Clinical Pearls       (§14.1)
11. Source footer         (§14.2)
```

Sections 3 and 4 (Population, Inclusion) may be omitted only if both `population` description and `inclusionCriteria` array are absent from the trial's data object. Omitting one while the other is present is not permitted.

### 1.3 Title Block

**Mockup reference:** Stage 1, both frames

The title block is the first element of scrollable content. It is separated from section 2 by a hairline bottom divider.

```
padding-bottom: 20px; margin-bottom: 24px; border-bottom: 1px solid #f1f5f9
```

**Eyebrow line** (above H1):
```
font-size: 11px; font-weight: 500; text-transform: uppercase;
letter-spacing: 0.12em; color: #94a3b8; margin-bottom: 10px
```
Content: `[Trial name] · [Author et al] · [Year]`
Example: `EXTEND Trial · Ma et al · 2019`

**H1 — full descriptive title:**
```
font-size: 19px (mobile) / 22px (desktop);
font-weight: 500;
color: #1746A2;            /* cobalt — see ADR-005 §4 for rationale */
letter-spacing: -0.01em;
line-height: 1.3;
margin: 0 0 12px (mobile) / 0 0 14px (desktop)
```

Exactly one H1 per page. The H1 text is the full descriptive title of the trial publication, not the trial acronym. See §16.2.

**Question lede** (below H1, not a separate section):
```
font-size: 14px (mobile) / 15px (desktop);
color: #475569;
line-height: 1.6;
margin: 0
```

The question lede is a plain paragraph that frames the clinical question the trial answers. It is not wrapped in a `<section>` or given a section label. There is no section titled "The question."

### 1.4 Trial at a Glance

Section label: `TRIAL AT A GLANCE` (standard section label, §1.5)

Key-value row anatomy:
```
display: flex; justify-content: space-between; align-items: baseline;
padding: 9px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px
```
Key: `color: #64748b`
Value: `color: #0f172a; font-weight: 500; text-align: right; max-width: 60%`

The final row has no bottom border.

**Required rows (in order):**
1. Type — trial design string(s) from `trialDesign.type[]`, comma-joined
2. Enrolled — from `trialDesign.timeline`
3. Sites — if available in `trialDesign`
4. Sample size — from `stats.sampleSize.value` + label
5. Primary endpoint — from `stats.primaryEndpoint.value` + label

Additional rows may be added but must appear after the five required rows.

### 1.5 Section Label Convention

All section labels use:
```
font-size: 10px; font-weight: 700; text-transform: uppercase;
letter-spacing: 0.1em; color: #94a3b8; margin-bottom: 10px
```

Exception: Clinical Pearls section label uses `color: #7c3aed` (purple). See §14.1.

---

## §2 Archetype A — Two-Group Comparison (Delta Band)

**Status: IMPLEMENTED**
**Applies to:** Any trial with two arms and a binary endpoint (mRS 0-1, mRS 0-2, death, recurrence, etc.)
**Canary trial:** EXTEND (slug: `extend-trial`)
**Mockup reference:** Stage 1 and Stage 2

This archetype renders a pair of 100-dot icon arrays representing the two arms of the trial, with an absolute-difference delta band overlaid on the treatment arm.

### 2.1 Dot Grid

Each arm renders exactly 100 dots in a 20-column × 5-row grid.

```css
.dot-grid {
  display: grid;
  grid-template-columns: repeat(20, 1fr);
  gap: 3px;
}
.dot {
  border-radius: 50%;
  aspect-ratio: 1 / 1;
}
```

Dot colors:
- Treatment arm, filled: `#1746A2` (cobalt)
- Control arm, filled: `#64748b` (slate-500)
- Either arm, empty: `#e2e8f0`

The number of filled dots equals `Math.round(efficacyResults.treatment.percentage)` for the treatment arm and `Math.round(efficacyResults.control.percentage)` for the control arm.

**Desktop layout:** Treatment arm and control arm grids render side by side in a two-column grid (`grid-template-columns: 1fr 1fr; gap: 28px`).

**Mobile layout:** Treatment arm above, control arm below, full width, gap 10px.

### 2.2 Arm Labels and Sample Counts

Above each grid, a flex row with two items:
- Left: arm name — treatment uses `font-weight: 600; color: #0E2D6B`; control uses `font-weight: 500; color: #475569`
- Right: "N of 100" — `font-size: 11px (mobile) / 12px (desktop); color: #94a3b8`

Label font sizes: 11px (mobile), 12px (desktop).

### 2.3 Delta Band

**Mockup reference:** Stage 1 dot grid; delta band positioned by inline JS

The delta band is an absolute-positioned overlay on the treatment arm's grid container. It marks the dots that represent the absolute benefit over control.

The band spans from the (control%) dot to the (treatment%) dot within the treatment row where those dots fall.

```css
.delta-band {
  position: absolute;
  background: rgba(23, 70, 162, 0.12);
  border-top: 1.5px solid #1746A2;
  border-bottom: 1.5px solid #1746A2;
  border-radius: 4px;
  pointer-events: none;
}
```

Positioning offsets: `-4px` horizontal extension on each side of the spanned dots; `-3px` vertical extension top and bottom.

Positioning is computed at runtime via `getBoundingClientRect()`. See the inline `<script>` at the end of `trial-reference.html` for the reference implementation. Production implementation replicates this logic in a `useEffect` hook with a `ResizeObserver`.

**Small-effect threshold rules:**

| Absolute difference | Band behavior |
|---|---|
| ≥ 5 percentage points | Render delta band normally |
| 2–4 percentage points | Render delta band + append note: "(small absolute difference)" in `font-size: 11px; color: #94a3b8; margin-top: 6px` |
| < 2 percentage points | Omit delta band entirely; show "Negligible absolute difference" note instead |

### 2.4 Legend

Below both grids, a flex row:
```
display: flex; gap: 16px; margin-bottom: 10px
```

Each legend item: 10×10px circle swatch + label.
- "Recovered" (or endpoint-appropriate label): cobalt swatch `#1746A2`
- "Did not": empty swatch `#e2e8f0`

The legend label text uses the endpoint's short name from `stats.primaryEndpoint.label`.

### 2.5 Caption

Below the legend, a plain paragraph:
```
font-size: 12px (mobile) / 13px (desktop); color: #64748b; line-height: 1.5; margin-bottom: 12px
```

Pattern: `"The cobalt band covers the [N] extra [endpoint-label] from [treatment name] compared with [control name]."`

The number N and its phrase are wrapped in `font-weight: 500; color: #1746A2`.

### 2.6 Stat Ratio Block

Below the caption, a hairline-top block:
```
border-top: 1px solid #f1f5f9; padding-top: 12px
```

**Mobile layout:** Three stacked rows (label left, value right).
**Desktop layout:** Three items in a flex row with `gap: 32px; flex-wrap: wrap`.

Required rows, in order:
1. Risk ratio (or odds ratio, as appropriate)
2. 95% CI — accompanied by an info tooltip icon (see §9)
3. p-value — rendered in `color: #059669` when statistically significant (p < 0.05); `color: #64748b` when not

Row anatomy (mobile stacked):
```
display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px
```
Label: `font-size: 12px; color: #64748b`
Value: `font-size: 12px; font-weight: 500; color: #0f172a`

### 2.7 Data Contract

The following fields from `TrialMetadata` drive Archetype A rendering:

```typescript
efficacyResults: {
  treatment: { percentage: number; name: string; label: string }
  control:   { percentage: number; name: string; label: string }
}
stats: {
  primaryEndpoint: { value: string; label: string }
  pValue:          { value: string }
  effectSize:      { value: string; label: string }
}
trialResult: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
```

The `effectSize.value` is used as the risk ratio or odds ratio display value.

No additional data fields are required for the dot grid beyond `efficacyResults.treatment.percentage` and `efficacyResults.control.percentage`.

### 2.8 Teaching Well

The "How to read this chart" teaching well appears immediately below the stat ratio block. Default state: collapsed. See §8.1 for full contract.

---

## §3 Archetype B — Ordinal Shift (Grotta Bar)

**Status: SPECIFIED — not yet implemented**
**Applies to:** Trials where the primary outcome is a shift across the full modified Rankin Scale distribution (mRS 0-6), analyzed via ordinal logistic regression or common odds ratio.
**Example trials:** MR CLEAN, DAWN, ESCAPE, DEFUSE-3

### 3.1 Description

Two stacked horizontal bar charts, one per arm, each divided into seven color-coded bands representing mRS 0-6. The bands are color-coded by functional outcome severity. A connecting line between the two bars at each mRS threshold boundary shows the shift.

This visualization uses the existing `GrottaBarChart` component in `src/components/trials/TrialVisualizations.tsx`.

### 3.2 Data Contract

```typescript
// Requires a visualizations entry of type 'grotta' in TRIAL_VISUALIZATIONS
// with mRS band percentages for treatment and control arms
```

The `howToReadChart` data for Archetype B must include an explanation of how to read stacked proportions and what a leftward shift indicates.

### 3.3 Teaching Well

Q&A pairs (minimum 3) must explain: what the bars show, what a left-shift means, and what the common odds ratio captures that the bar does not.

---

## §4 Archetype C — Forest Plot (Subgroup)

**Status: SPECIFIED — not yet implemented**
**Applies to:** Trials with pre-specified subgroup analyses presented as a forest plot.
**Example trials:** ENCHANTED, BP-TARGET

### 4.1 Description

A vertical list of subgroups. Each row has a subgroup label (left), a horizontal confidence interval bar with a square marker sized proportional to N (center), and the point estimate with CI (right). A vertical null-effect line runs at the reference value (typically 1.0 for odds ratios, 0 for differences).

This visualization uses the existing `SubgroupForestPlot` component.

### 4.2 Data Contract

Requires `visualizations` entry of type `subgroup-forest-plot`. Subgroup rows include: label, n, estimate, ci_lower, ci_upper, favors_treatment (boolean).

### 4.3 Teaching Well

Q&A pairs must explain: what the square size means, how to read the CI bar, what crossing the null line means, and the limitation of subgroup analyses.

---

## §5 Archetype D — Kaplan-Meier Survival Curve

**Status: SPECIFIED — not yet implemented**
**Applies to:** Trials where the primary outcome is time-to-event (mortality, recurrence, functional recovery over time).

### 5.1 Description

Two step-function curves on a shared time-axis. Censored events rendered as tick marks crossing the curve line. X-axis: time in days or months. Y-axis: survival probability (0-1) or cumulative event rate.

This visualization uses the existing `KaplanMeierCurve` component (Recharts LineChart, `type="stepAfter"`).

### 5.2 Teaching Well

Q&A pairs must explain: what the curves represent, what the tick marks mean, how to read the separation, and what the log-rank p-value tests.

---

## §6 Archetype E — Categorical Grades (TICI, AOL)

**Status: SPECIFIED — not yet implemented**
**Applies to:** Thrombectomy trials where the primary procedural outcome is a graded reperfusion scale (TICI 0-3, AOL 0-3).

### 6.1 Description

Horizontal bar chart with one row per TICI/AOL grade. Bar width proportional to percentage. Color-coded: successful reperfusion grades (TICI 2b-3) in cobalt; partial (TICI 2a) in cobalt-100; failure (TICI 0-1) in slate-200.

This visualization uses the existing `TICIBarChart` component.

### 6.2 Teaching Well

Q&A pairs must explain: what the grades mean clinically, what constitutes successful reperfusion, and why TICI 2b or better is the accepted threshold.

---

## §7 Archetype F — Continuous Over Time (Longitudinal Box Plot)

**Status: SPECIFIED — not yet implemented**
**Applies to:** Trials measuring a continuous outcome at multiple time points (e.g., BP, cognitive score, biomarker).

### 7.1 Description

Box-whisker plots at each time point for treatment and control arms, side by side. Boxes show IQR, whiskers show range (or 1.5×IQR), median line shown.

This visualization uses the existing `LongitudinalBoxPlot` component.

### 7.2 Teaching Well

Q&A pairs must explain: how to read a box plot, what the whiskers represent, and what the separation between arms at each time point means.

---

## §8 Teaching Surfaces

Trial pages have two collapsible teaching wells. Both use the same visual treatment. Neither auto-expands on page load. Both expand on tap/click.

### 8.1 "How to Read This Chart" Teaching Well

**Mockup reference:** Stage 2 (expanded state)

**Placement:** Immediately below the stat ratio block, within the Primary Outcome section. Not a standalone section — it is part of the visualization section.

**Visual treatment:**
```css
background: #f8fafc;
border-left: 2px solid #1746A2;
border-radius: 0 8px 8px 0;
padding: 14px 16px;
margin-top: 16px;
```

**Collapsed header row:**
- Label: `font-size: 13px; font-weight: 500; color: #0f172a` — "How to read this chart"
- Chevron: cobalt `#1746A2`, points down when collapsed, up when expanded

**Expanded content — Q&A format:**

Each entry is a question/answer pair. Minimum 3 pairs per archetype. Question style:
```
font-size: 13px; font-weight: 500; color: #0f172a; margin-bottom: 4px
```
Answer style:
```
font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 12px
```
Last answer: `margin-bottom: 0`

**Archetype A — required Q&A content:**
1. Q: "What does the chart show?" A: explains that 100 dots = 100 patients, filled = endpoint achieved, empty = did not
2. Q: "What should I look at first?" A: explains counting filled dots per group, delta = absolute benefit, cobalt band marks the extra patients
3. Q: "What does it mean for my patient?" A: states the absolute difference and NNT in plain language

For archetypes B-F, the Q&A content is archetype-specific (see §3-§7).

**Content ownership:** content-writer drafts all Q&A pairs. medical-scientist source-backs any claim made in the answer text. clinical-reviewer verifies that no answer text overstates the evidence or introduces hedging drift. See §8.3.

**Data field:** `howToReadChart` — see §18.3 for schema.

### 8.2 "How to Interpret This Trial" Teaching Well

**Mockup reference:** Stage 4 (expanded state)

**Placement:** Section 9 in the mandatory section order (§1.2). It is a standalone section with its own section label: `HOW TO INTERPRET THIS TRIAL`.

Same visual treatment as §8.1 (identical CSS). Collapsed header: "How to interpret this trial".

**Expanded content — three-section format (not Q&A):**

Each of the three sections has a label and a body paragraph.

Label style:
```
font-size: 10px; font-weight: 700; text-transform: uppercase;
letter-spacing: 0.08em; color: #64748b; margin-bottom: 4px
```
Body style:
```
font-size: 13px; color: #475569; line-height: 1.6; margin-bottom: 14px
```
Last body: `margin-bottom: 0`

**Required three sections (in order):**
1. "What this trial proves" — states what the trial demonstrates, scoped to the enrolled population
2. "What this trial does not prove" — explicitly states limitations: generalizability, endpoints not reached, populations excluded
3. "Cautions" — methodological concerns: early stopping, wide CI, unblinding issues, surrogate endpoints, etc.

**Content ownership:** Same as §8.1. clinical-reviewer is the merge gate.

**Data field:** `howToInterpret` — see §18.3 for schema.

### 8.3 Teaching Surface Ownership Matrix

| Task | Agent | Gate |
|---|---|---|
| Draft Q&A pairs and 3-section text | content-writer | None (drafting role) |
| Source-back any factual claim in the text | medical-scientist | clinical-reviewer |
| Verify that paraphrase does not drift from evidence | clinical-reviewer | Blocks merge |
| Verify hedges are preserved (five never-drift categories) | clinical-reviewer | Blocks merge |
| Final HTML/JSX implementation | build-engineer | quality-assurance |

The content-writer and medical-scientist collaborate on a single draft per trial per teaching well. The draft is submitted to clinical-reviewer as part of the -clinical PR gate. There is no separate "statistician" agent — statistical interpretation is owned jointly by medical-scientist (accuracy) and clinical-reviewer (drift check). See ADR-005 §2.

---

## §9 Inline Statistical Tooltips

Certain terms in the stat ratio block and section text are annotated with inline tooltip triggers (a 14×14px info icon button).

**Tooltip trigger anatomy:**
```html
<button style="
  width: 14px; height: 14px; border-radius: 50%;
  border: 1px solid #cbd5e1; color: #94a3b8;
  font-size: 9px; display: inline-flex; align-items: center;
  justify-content: center; background: white; cursor: pointer;
">i</button>
```

**Tooltip card anatomy:**
```css
background: white;
border: 1px solid #e2e8f0;
border-radius: 10px;
padding: 12px 14px;
box-shadow: 0 8px 28px rgba(15, 23, 42, 0.08);
width: 260px;
position: absolute; /* portal in production */
z-index: 50;
```

Arrow: `::before` pseudo-element, 10×10px white square, `border-left: 1px solid #e2e8f0; border-top: 1px solid #e2e8f0; transform: rotate(45deg); top: -6px`.

**Tooltip content source:** All tooltip definitions are sourced from `src/data/medicalGlossary.ts`. The tooltip text for a term is the glossary entry for that term. Do not hard-code tooltip text in JSX.

**Terms requiring a tooltip trigger on the stat ratio block:**
- 95% CI — always shows trigger
- Risk ratio / odds ratio / hazard ratio — shows trigger when the effect measure might be unfamiliar to a resident
- p-value — optional trigger; use judgment per trial

**Glossary gap — required additions before Archetype A ships:**

The following terms appear in trial stat blocks but are absent from `src/data/medicalGlossary.ts` as of the audit (2026-04-21). These entries must be added before the EXTEND canary merges. This is a `src/data/` change; it is not within this spec's scope to author the entries, but it is within scope to require them.

| Term key(s) | Definition scope |
|---|---|
| `arr` / `absolute-risk-reduction` | Arithmetic difference between event rates in control vs treatment |
| `rrr` / `relative-risk-reduction` | Proportional reduction in risk relative to the control rate |
| `nnh` / `number-needed-to-harm` | Number of patients treated to cause one additional adverse outcome |
| `rr` / `risk-ratio` | Ratio of event rate in treatment to event rate in control (standalone entry, distinct from `odds-ratio`) |

These additions are tracked as a Prompt 3 pre-condition. See §19 acceptance checklist item 9.4.

---

## §10 Bottom-Line Drawer

**Mockup reference:** Stage 1 (collapsed), Stage 5 (expanded)

The bottom-line drawer is always rendered. It sticks to the bottom of the viewport, above the mobile tab bar.

**Production positioning:**
```css
position: fixed;
bottom: calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px));
left: 0; right: 0;
z-index: 55;
```

On desktop (no tab bar), `bottom: 0`.

**Collapsed bar anatomy:**
```css
border-top: 1px solid #e2e8f0;
box-shadow: 0 -2px 12px rgba(15, 23, 42, 0.08);
background: white;
padding: 14px 20px (mobile) / 14px 28px (desktop);
display: flex; align-items: center; justify-content: space-between;
cursor: pointer;
```

Left cluster:
- "BOTTOM LINE" label: `font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 3px`
- Result word: `font-size: 14px; font-weight: 500; color: #0f172a`

Right: chevron pointing up (collapsed) or down (expanded). Cobalt when expanded, slate-400 when collapsed.

### 10.1 State Machine

Four states, keyed to page lifecycle:

| State | Trigger | Drawer appearance |
|---|---|---|
| A — Loading | Page is fetching trial data | Collapsed bar; result word replaced by a skeleton pulse |
| B — Collapsed default | Data loaded, user has not tapped | Collapsed bar, result word from §10.2 |
| C — Collapsed, discovery hint | 3 seconds after page load completes | Same as B + chevron animates once (3 × 0.6s bounce, then stops). Only fires once per session. |
| D — Expanded | User taps the collapsed bar | Bar header remains; content region slides open below it |

State A to B: transition when `loadTrialPayload()` resolves.
State B to C: 3-second `setTimeout` from data-loaded moment. Does not repeat if user has already opened the drawer.
State C to D: user tap on collapsed bar.
State D to B/C: user taps open drawer header again (toggle).

Animation on D entry: `max-height` transition from 0 to content height, `overflow: hidden`, `transition: max-height 0.28s ease-out`.

### 10.2 Result Word

The result word in the collapsed bar is determined by `trialResult`:

| `trialResult` value | Result word |
|---|---|
| `'POSITIVE'` | Positive trial |
| `'NEGATIVE'` | No benefit shown |
| `'NEUTRAL'` | Mixed signal |
| `undefined` | (omit result word; show only "BOTTOM LINE" label) |

A `'HARM'` literal is not currently in the `TrialMetadata` enum. If a trial causes net harm, use `'NEGATIVE'` and note the direction of harm in the expanded content.

### 10.3 Expanded Content

**Mockup reference:** Stage 5

Expanded content renders below the collapsed header row (which remains visible as a tap-to-collapse target).

```
padding: 16px 20px 20px (mobile) / 20px 28px 24px (desktop)
max-height: 55vh; overflow-y: auto
```

Elements in order:

**Headline:**
```
font-size: 18px; font-weight: 500; color: #0f172a; line-height: 1.3; margin-bottom: 10px
```
One sentence summarizing the trial's practical conclusion.

**Explanation paragraph:**
```
font-size: 14px; color: #475569; line-height: 1.6; margin-bottom: 14px
```
2-4 sentences. Includes population scoping, time window, key caveats.

**Cobalt bedside pearl block:**
```css
border-left: 2px solid #1746A2;
padding: 8px 0 8px 14px;
margin-bottom: 16px;
```
Pearl label: `font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.12em; color: #0E2D6B; margin-bottom: 5px` — text: `"BEDSIDE PEARL"`

Pearl body: `font-size: 13px; color: #334155; line-height: 1.6`

The bedside pearl is a single clinical insight that a resident should quote at the bedside: typically the most important safety trade-off, consent figure, or selection criterion. Data field: `bedsidePearl` — see §18.3.

**"See also" section:**
```
border-top: 1px solid #f1f5f9; padding-top: 12px; margin-bottom: 12px
```
Label: `font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; margin-bottom: 6px` — text: `"See also"`

Links: cobalt `#1746A2`, no underline by default, separated by muted middots (`color: #cbd5e1; margin: 0 6px`).

**Citation line:**
```
border-top: 1px solid #f1f5f9; padding-top: 12px;
font-size: 12px; color: #94a3b8; line-height: 1.6
```
Content: short citation (Author et al. Journal Year;vol:pages) + "Educational use only."

Desktop 2-col exception: the citation element omits border-top and padding-top when it appears in the right column of the 2-col drawer layout (§10.3 desktop variant). Visual separation is provided by the See also block's border-bottom above.

**Desktop layout variant:** On >= 768px viewports, headline + explanation + pearl render in left column; "see also" + citation render in right column (`grid-template-columns: 1fr 1fr; gap: 28px`).

### 10.4 Spacer

A spacer div inside `<main>` reserves vertical space equal to the collapsed drawer height (approximately 60px) so the source footer is not hidden beneath the drawer.

---

## §11 Population, Inclusion, Exclusion

### 11.1 Population

Section label: `POPULATION`

A single paragraph (`font-size: 13px; color: #475569; line-height: 1.6`). Sourced from `clinicalContext` or a dedicated `population` field. The paragraph describes who was enrolled: age range, clinical presentation, imaging or biomarker selection criteria, time windows.

### 11.2 Inclusion Criteria

Section label: `INCLUSION CRITERIA`

Rendered as an unstyled list. Each item:
```
font-size: 13px; color: #475569; line-height: 1.6;
padding: 5px 0 5px 14px; border-bottom: 1px solid #f1f5f9;
position: relative;
```
Bullet: absolute-positioned at `left: 0`, `color: #94a3b8`, character `•`.
Last item: no bottom border.

Data source: `inclusionCriteria: string[]` — see §11.4.

### 11.3 Exclusion Criteria

Section label: `EXCLUSION CRITERIA`

Same anatomy as §11.2. Data source: `exclusionCriteria: string[]` — see §11.4.

### 11.4 Schema Additions Required

The following fields do not currently exist in `TrialMetadata` and must be added in Prompt 3:

```typescript
inclusionCriteria?: string[];   // Each string is one criterion
exclusionCriteria?: string[];   // Each string is one criterion
```

These fields are optional. When absent, the Population, Inclusion, and Exclusion sections are omitted from the rendered page. When present, all three sections render.

If `inclusionCriteria` is present but `exclusionCriteria` is absent (or vice versa), both sections still render; the absent one renders with a placeholder note "(Not yet populated)".

---

## §12 Intervention Section

Section label: `INTERVENTION`

### 12.1 Arm Rows

Two arm rows, always in this order: treatment arm first, control arm second.

Each arm row has:
- Arm name: `font-size: 13px; font-weight: 600 (treatment) / 500 (control)`
- Arm description: `font-size: 12px; color: #1746A2 (treatment) / #64748b (control)`

Arm descriptions are sourced from `intervention.treatment` and `intervention.control`. When these fields are objects (`{name, description, details[]}`), render `name` as the primary label and `description` as the sub-label.

### 12.2 Winning-Arm Cobalt Accent Rule

**This rule is tied to `trialResult`. See ADR-005 §3.**

| `trialResult` | Cobalt accent applied to |
|---|---|
| `'POSITIVE'` | Treatment arm row |
| `'NEGATIVE'` | Neither arm (both plain) |
| `'NEUTRAL'` | Neither arm (both plain) |
| Harm condition (see §10.2) | Control arm row (visually marks the safer arm) |

**Cobalt-accented arm row:**
```css
background: #EEF2FF;          /* neuro-50 */
color: #0E2D6B;               /* neuro-700 */
position: relative;
padding: 12px 12px 12px 16px;
border-radius: 8px;
margin-bottom: 8px;
```
```css
/* Left accent pseudo-element */
::before {
  content: '';
  position: absolute;
  left: 0; top: 6px; bottom: 6px;
  width: 2px;
  background: #1746A2;
  border-radius: 1px;
}
```

The right side of the accented arm row carries a "Winning arm" tag:
```
font-size: 10px; font-weight: 700; text-transform: uppercase;
letter-spacing: 0.08em; color: #0E2D6B; opacity: 0.75;
white-space: nowrap; flex-shrink: 0
```

**Plain arm row (non-winning or neutral):**
```css
padding: 12px 12px 12px 16px;
color: #475569;
/* no background, no accent, no tag */
```

Rule comment required in JSX: `{/* Winning-arm accent: applies only when trialResult === 'POSITIVE'. Negative/neutral: both arms plain. Harm: control arm gets accent. */}`

---

## §13 Safety Section

**Required for all new trials and all trial rebuilds.**

Section label: `SAFETY`

This section is omitted only when no safety data exists in the trial's data object. It may not be omitted for trials where sICH or mortality data is available.

### 13.1 sICH Comparison

When `safetyProfile.sICH` is present:

Label: `SYMPTOMATIC ICH` (`font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px`)

Two bar rows (treatment then control):
```
display: flex; align-items: center; gap: 10px; margin-bottom: 6px
```
- Arm label: `font-size: 12px; font-weight: 500 (treatment) / normal (control); color: #0E2D6B (treatment) / #64748b (control); width: 72px`
- Track: `flex: 1; height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden`
- Fill: `height: 100%; border-radius: 3px; background: #ef4444 (treatment) / #fca5a5 (control)` — bar width is proportional to percentage of a 10% max
- Percentage label: `font-size: 12px; font-weight: 600; color: #dc2626 (treatment) / #f87171 (control); width: 36px`

### 13.2 Mortality Row

When `safetyProfile.mortality` is present:

```
display: flex; justify-content: space-between; align-items: center;
padding: 10px 0; border-top: 1px solid #f1f5f9;
font-size: 13px; color: #475569
```
Left text: `"Mortality (90 days): [treatment arm name] [evt]% vs [control arm name] [control]%"`
Right: `"Not significant"` badge when the difference is not statistically significant.

Badge:
```
font-size: 10px; font-weight: 600; color: #64748b; background: #f1f5f9;
border-radius: 4px; padding: 2px 6px; text-transform: uppercase; letter-spacing: 0.04em
```

---

## §14 Pearls and Source Footer

### 14.1 Clinical Pearls

Section label: `CLINICAL PEARLS` — rendered in `color: #7c3aed` (purple, not the standard slate-400). This is the only section label that deviates from the standard token.

Each pearl is a flex row:
```
display: flex; gap: 10px; margin-bottom: 10px;
font-size: 13px; color: #475569; line-height: 1.6
```
Bullet dot: `width: 6px; height: 6px; border-radius: 50%; background: #a78bfa; flex-shrink: 0; margin-top: 7px`

Last pearl: `margin-bottom: 0`

Data source: `pearls: string[]` from `TrialMetadata`.

### 14.2 Source Footer

```
border-top: 1px solid #e2e8f0; padding-top: 18px; margin-top: 32px
```

Three paragraphs in order:
1. Full citation: `font-size: 12px; color: #64748b; line-height: 1.6; margin-bottom: 6px`
   Pattern: `[Authors]. [Full title]. [Journal] [Year];[Vol]:[Pages].`
2. DOI + NCT line: `font-size: 12px; color: #94a3b8; margin-bottom: 12px`
   Pattern: `DOI: [doi] · ClinicalTrials.gov: [NCT number]`
   Omit NCT line if `clinicalTrialsId` is absent.
3. Disclaimer: `font-size: 12px; color: #94a3b8; margin: 0`
   Text: `"Educational use only."` Verbatim. No variation.

---

## §15 Citation and Paraphrase Rules

### 15.1 Clinical Reviewer Five Never-Drift Categories

All trial content — teaching well prose, pearl text, bedside pearl, intervention descriptions, population descriptions — is subject to clinical-reviewer's five never-drift categories (defined in `.claude/agents/clinical-reviewer.md`):

1. Recommendation strength — do not strengthen or weaken
2. Action verbs — do not soften (e.g., "should" must not become "may")
3. Qualifiers and gates — all eligibility criteria, time windows, and contraindications preserved verbatim in meaning
4. Certainty markers — do not soften (e.g., "is effective" must not become "may be effective")
5. Temporal constraints — trial time windows must not be widened or narrowed

This spec does not reproduce the full standard. For the operative definition, read `.claude/agents/clinical-reviewer.md`. That document governs; this section is a pointer.

### 15.2 Pragmatic Plagiarism Rule

Source text falls into two categories:

**Structured facts** (numerical outcomes, time windows, eligibility thresholds, sample sizes, p-values, effect sizes): copy as-is. Do not paraphrase. The number "4.5 hours" must not become "approximately five hours." The number "6.2%" must not become "about 6%."

**Explanatory prose** (how to interpret, clinical context, mechanism): accurate paraphrase is required. Direct quotation of copyrighted journal prose is not permitted in app-rendered text. The paraphrase must preserve all hedges (e.g., "in patients selected by perfusion imaging" may not be dropped). See clinical-reviewer §15.1 for hedge-preservation rules.

### 15.3 No Em Dashes

Em dashes (`—`) are prohibited in all trial page content: teaching well text, pearl text, bedside pearl, population description, intervention descriptions, source footer. Use commas, parentheses, periods, or colons instead.

This rule applies to spec-authored example text and to all clinical content authored under this spec.

### 15.4 Option C — Hybrid Citation-Registry Path

**Context:** The citation registry (`src/lib/citations/registry.ts`) does not yet exist. W5.2 is in progress. See ADR-005 §1 for the full decision record.

**For EXTEND (Archetype A canary):** Clinical content (teaching well text, pearl text, bedside pearl) ships without formal citation registry entries. The content is reviewed by clinical-reviewer under standard -clinical PR gate. Registry entries for EXTEND content are created as a W5.2 follow-up, not as a pre-condition of the canary merge. This is the stub-ready path.

**For all subsequent trial rebuilds:** New clinical content must be registered in `src/lib/citations/registry.ts` before the PR can merge. The pre-commit hook (W5.3/W5.4) will enforce this once it ships. Until it ships, clinical-reviewer's manual review is the enforcement mechanism.

**Claim surfaces for trial content:**

| Content location | Tagging mechanism (per CLAUDE.md §13.4) |
|---|---|
| `pearls[]` strings in `trialData.ts` | Phase 1: `data` surface — add `claimId` field alongside each pearl string (schema change required) |
| `howToInterpret` prose | Phase 2: `computed` surface — `claim()` helper |
| `howToReadChart` prose | Phase 2: `computed` surface — `claim()` helper |
| `bedsidePearl` string | Phase 2: `computed` surface |
| Stat block values (p-value, RR, CI) | Not a claim surface — these are raw data, not interpreted prose |

---

## §16 SEO and Link Graph

### 16.1 Activation

seo-specialist runs on every new or rebuilt trial page. The agent is invoked at the PR gate, not during implementation. Every trial page must pass Gate 4 (SEO validation) before merge.

### 16.2 H1 Rule

Exactly one `<h1>` per trial page. The H1 text is the full descriptive title of the trial publication (not the acronym). The H1 is rendered in cobalt `#1746A2` per §1.3. See ADR-005 §4 for the decision record on cobalt H1.

The H1 must match or be a close paraphrase of the title field in `trialCatalogMeta.ts` for the corresponding trial.

### 16.3 Meta Title

Pattern: `[Full descriptive title] | [Acronym] Trial | NeuroWiki`

Length: 50-60 characters. The full title is truncated to fit; do not truncate "| NeuroWiki".

Example: `"Thrombolysis 4.5-9h with perfusion imaging | EXTEND Trial | NeuroWiki"` — 67 chars, too long. Target compression: `"Late-window thrombolysis with perfusion imaging | EXTEND | NeuroWiki"` — 68 chars. Adjust per trial.

seo-specialist owns the final character-count verification.

### 16.4 Meta Description

150-160 characters. Paraphrased (not quoted). Must include: what the trial tested, primary outcome result in plain language, key selection criterion or population gate.

Example for EXTEND: `"EXTEND trial: IV alteplase 4.5-9h after stroke onset improved excellent recovery in imaging-selected patients. mRS 0-1 at 90 days: 35% vs 29%, NNT 17."` — 158 chars.

### 16.5 MedicalScholarlyArticle JSON-LD

Required fields:

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalScholarlyArticle",
  "name": "[Full trial title]",
  "headline": "[Short trial name] — [one-sentence finding]",
  "alternativeHeadline": "[Trial acronym]",
  "datePublished": "[YYYY]",
  "author": {
    "@type": "Person",
    "name": "[First author last name] et al"
  },
  "citation": "[Full citation string]",
  "about": {
    "@type": "MedicalCondition",
    "name": "[Disease/condition studied]"
  },
  "audience": {
    "@type": "MedicalAudience",
    "audienceType": "Clinician"
  }
}
```

### 16.6 Link-Graph Node

When a trial page is added or rebuilt, `docs/link-graph.json` must be updated with a node entry. The librarian agent owns this update post-flight.

Node format:
```json
{
  "id": "trial/[slug]",
  "title": "[Trial acronym]",
  "path": "/trials/[slug]",
  "type": "trial",
  "references": [],
  "referencedBy": []
}
```

`references`: paths to related trials, calculator pages, or pathway pages linked from the "See also" block. `referencedBy`: paths of pages that link to this trial.

---

## §17 Agent Ownership Matrix

| Domain | Agent | Authority |
|---|---|---|
| Visual layout, tokens, section composition | ui-architect | Owns page-level composition; signs off every UI PR |
| Mobile UX, 375px viewport | mobile-first-developer | Signs off every UI-touching PR |
| Teaching well prose (drafting) | content-writer | Drafts; does not gate |
| Statistical accuracy, source-backing | medical-scientist | Authors claims; routes to clinical-reviewer |
| Clinical paraphrase and drift check | clinical-reviewer | Merge gate on all -clinical PRs |
| Glossary definitions | medical-scientist | Authors medicalGlossary.ts entries |
| SEO metadata and JSON-LD | seo-specialist | Gate 4; required on every trial page add/rebuild |
| Accessibility (ARIA, keyboard nav) | accessibility-specialist | Activates on interactive UI; drawer and collapsible wells require ARIA |
| Spec file governance | design-guardian | Locks spec and mockup together; changelog required for any spec change |
| Post-flight doc coherence | librarian | Updates TASKS.md, link-graph.json after every trial swarm |
| Build, typecheck, regression | quality-assurance | Gates 1, 2, 3, 5 |
| Structural review (D/E plans) | system-architect | Required on Class D/E plan before execution |

No standalone statistician agent. Statistical interpretation is owned jointly by medical-scientist (source accuracy) and clinical-reviewer (drift check). This is a deliberate decision; see ADR-005 §2.

---

## §18 File Organization and Schema Extensions

### 18.1 Existing files used by trial pages

| File | Purpose |
|---|---|
| `src/pages/trials/TrialPageNew.tsx` | Main page component (to be rebuilt in Prompt 3) |
| `src/data/trialData.ts` | `TrialMetadata` interface + `TRIAL_DATA` map |
| `src/data/trialPayload.ts` | `loadTrialPayload()` async loader |
| `src/components/trials/TrialVisualizations.tsx` | Five existing chart components |
| `src/components/TrialStats.tsx` | Four stat cards |
| `src/data/medicalGlossary.ts` | Tooltip definitions |
| `src/components/MedicalTooltip.tsx` | Tooltip rendering |
| `src/utils/addTooltips.tsx` | Auto-scan wrapper |

### 18.2 New files required (authored in Prompt 3)

None required at the component level — the existing component set covers all six archetypes. The primary change is a rebuild of `TrialPageNew.tsx` to implement this spec's anatomy and section order.

### 18.3 TrialMetadata Schema Extensions

The following fields are added to `TrialMetadata` in Prompt 3. They are optional in the interface; all existing trials continue to render without them.

```typescript
// To be added to TrialMetadata in src/data/trialData.ts

inclusionCriteria?: string[];   // §11.2: one string per criterion
exclusionCriteria?: string[];   // §11.3: one string per criterion

// Teaching well content
howToReadChart?: {
  archetypeId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  pairs: Array<{ q: string; a: string }>;  // Minimum 3 pairs
};

howToInterpret?: {
  proves: string;       // "What this trial proves"
  doesNotProve: string; // "What this trial does not prove"
  cautions: string;     // "Cautions"
};

bedsidePearl?: string;  // §10.3: single plain-text string, no em dashes
```

For the EXTEND canary, all five fields are populated. For all other trials, the fields are omitted until that trial's rebuild swarm.

### 18.4 Data Population for EXTEND Canary

The EXTEND `howToReadChart`, `howToInterpret`, and `bedsidePearl` values are sourced from `trial-reference.html` Stage 2, Stage 4, and Stage 5 respectively. The exact text in the mockup is the approved draft; Prompt 3 copies it verbatim into `trialData.ts`. No rewording in Prompt 3 without a separate -clinical PR.

---

## §19 Acceptance Checklist

Every trial page rebuild must pass all items before the PR opens. Partial passes are not accepted. Items labeled "(canary)" apply only to the EXTEND trial; all items apply to subsequent rebuilds unless noted.

**9.1 Visual anatomy**
- [ ] Sticky header: back arrow, short identifier (13px bold), eyebrow meta (11px uppercase). No star, no reset, no Copy.
- [ ] No dark right-side sidebar (`bg-slate-900` panel absent from DOM)
- [ ] Section order matches §1.2 exactly
- [ ] H1 is cobalt `#1746A2`, single instance per page
- [ ] Title block hairline divider present (`border-bottom: 1px solid #f1f5f9`)

**9.2 Primary outcome visualization**
- [ ] Archetype A: 100 dots per arm, 20-column grid, gap 3px
- [ ] Delta band renders correctly (JS positions it within ±1px of spec)
- [ ] Small-effect threshold respected (§2.3)
- [ ] Stat ratio block: risk ratio, 95% CI with info icon, p-value (green when significant)
- [ ] Desktop: two grids side by side; mobile: stacked

**9.3 Teaching wells**
- [ ] "How to read" well: collapsed default, expands on tap, minimum 3 Q&A pairs, chevron toggles
- [ ] "How to interpret" well: collapsed default, 3 sections (proves / does not prove / cautions)
- [ ] No em dashes in either well's text

**9.4 Glossary**
- [ ] `arr` / `absolute-risk-reduction` entry exists in `medicalGlossary.ts`
- [ ] `rrr` / `relative-risk-reduction` entry exists
- [ ] `nnh` / `number-needed-to-harm` entry exists
- [ ] `rr` / `risk-ratio` standalone entry exists
- [ ] Tooltip trigger on 95% CI row is functional

**9.5 Winning-arm rule**
- [ ] Cobalt accent on treatment arm (EXTEND: `trialResult === 'POSITIVE'`)
- [ ] "Winning arm" tag rendered at correct opacity
- [ ] Rule comment present in JSX

**9.6 Population / Inclusion / Exclusion**
- [ ] `inclusionCriteria` and `exclusionCriteria` fields populated for EXTEND (canary)
- [ ] List anatomy matches §11.2 (bullet, hairline dividers, no bottom border on last item)

**9.7 Bottom-line drawer**
- [ ] State machine: A (loading skeleton), B (collapsed), C (discovery chevron after 3s), D (expanded)
- [ ] Discovery chevron fires once per session, then stops
- [ ] Expanded content: headline, explanation, bedside pearl (cobalt left accent), see also, citation line
- [ ] Bedside pearl block has 2px cobalt left border, correct label and body styles
- [ ] No em dashes in any drawer text

**9.8 Safety section**
- [ ] sICH bars rendered (EXTEND: 6.2% vs 0.9%)
- [ ] Mortality row with "Not significant" badge
- [ ] Bar fill colors: `#ef4444` treatment, `#fca5a5` control

**9.9 Clinical pearls and source footer**
- [ ] Section label is purple `#7c3aed`
- [ ] Bullet dots are `#a78bfa`
- [ ] Source footer: three paragraphs in exact order (full citation, DOI+NCT, disclaimer)
- [ ] Disclaimer text exactly: "Educational use only."

**9.10 Clinical content gate**
- [ ] teaching well text, bedside pearl, pearls reviewed by clinical-reviewer
- [ ] clinical-reviewer decision: approve or approve-with-conditions
- [ ] clinical review artifact exists at `docs/reviews/clinical-PR-[number]-extend-rebuild.md`

**9.11 SEO**
- [ ] Meta title 50-60 chars (seo-specialist verified)
- [ ] Meta description 150-160 chars
- [ ] MedicalScholarlyArticle JSON-LD present with all required fields
- [ ] Link-graph node added for this trial

**9.12 Build gates**
- [ ] `npm run typecheck` passes (no new errors)
- [ ] `npm run build` passes
- [ ] `npm run check:claims` passes (stub-ready: empty registry still passes)
- [ ] Mobile QA at 375px: no horizontal scroll, touch targets ≥44px, drawer functional
- [ ] Desktop QA at 1280px: two-column dot grid, drawer 2-column expanded layout

---

## §20 Changelog

| Version | Date | Author | Changes |
|---|---|---|---|
| 1.0 | 2026-04-21 | orchestrator | Initial authoring. Six archetypes specified; Archetype A fully implemented. Companion mockup: trial-reference.html. ADR-005 records major decisions. Pending design-guardian mockup co-sign. |
