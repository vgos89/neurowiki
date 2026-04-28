# TRIALS_SPEC.md — NeuroWiki Trial Page Design Specification

**Version:** 1.0 — locked 2026-04-21 | v1.1 — locked 2026-04-24
**Status:** Locked — design-guardian co-sign issued 2026-04-21; v1.1 co-sign APPROVED 2026-04-24 (14/14 conditions resolved)
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
- All eight visualization archetypes (§2-§7a)
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

**Status: SPECIFIED — implementation pending (W6.5.1)**
**Applies to:** Trials where the primary outcome is a shift across the full modified Rankin Scale distribution (mRS 0-6), analyzed via ordinal logistic regression or common odds ratio.
**Example trials:** MR CLEAN, ESCAPE, SWIFT PRIME, REVASCAT, INTERACT4
**Mockup reference:** Stage 7 (INTERACT4 reference)

### 3.1 When to Use

- Trials with ordinal mRS distribution as the primary outcome
- Primary statistic is a common odds ratio (cOR) from ordinal logistic regression
- Always prefer Archetype B over dichotomizing a 7-level scale to a binary endpoint when ordinal data are available

### 3.2 Visual Anatomy

Two stacked horizontal bars, one per arm, each rendered at 100% container width. Seven segments per bar represent mRS 0 through 6, with widths proportional to the observed percentage in each category.

**Segment color gradient (mRS 0 to 6):**

| mRS | Hex | Clinical meaning |
|---|---|---|
| 0 | `#10b981` | No symptoms |
| 1 | `#34d399` | No significant disability |
| 2 | `#fbbf24` | Slight disability |
| 3 | `#fb923c` | Moderate disability |
| 4 | `#f97316` | Moderately severe disability |
| 5 | `#ef4444` | Severe disability |
| 6 | `#991b1b` | Death |

**Segment text color:** mRS 0 and mRS 3-6 use white text. mRS 1 (`#34d399`) and mRS 2 (`#fbbf24`) are lighter fills and require dark text: `color: #0f172a`.

**Label rule:** Show the percentage text centered inside the segment when the segment width is at least 5% of the bar. Segments narrower than 5% render no label. Exception: on mobile viewports (≤375px), segments narrower than 9% may be unlabeled; their value is shown in a tooltip on tap instead. This exception accommodates the physical width of narrow segments at 375px — a 7% segment at 375px renders at roughly 19px wide, insufficient for a legible percentage. The 5% rule governs all other viewports.

**Bar height:** 28px base (mobile). Desktop override: 32px via `@media (min-width: 768px)`.

**Legend:** Below both bars, a flex-wrap row of seven color chips with mRS level number and brief plain-text meaning. Both mobile and desktop use the same `display: flex; flex-wrap: wrap; gap: 4px` layout — no two-column grid.

**Arm label:** Arm name renders above its bar in `font-size: 12px`. For a POSITIVE trial, the winning arm name renders in cobalt `#0E2D6B` (font-weight 600); the other arm renders in slate-500 `#64748b` (font-weight 500). For NEGATIVE and NEUTRAL trials, both primary-bar arm names render in slate-500 (font-weight 500). Per §12.2 cobalt accent rule. Exception for subgroup pairs: see §3.4a.

### 3.3 Stat Row

Immediately below the bars and legend, a hairline-top stat row:

```
border-top: 1px solid #f1f5f9; padding-top: 12px; margin-top: 10px;
```

Three items, mobile stacked (label left, value right) / desktop inline (flex row, gap 32px):

1. **Common OR** — point estimate, labeled `"Common OR"`
2. **95% CI** — with info tooltip icon (§9)
3. **Shift in distribution** (desktop) / **Shift** (mobile ≤375px) — one of three states:

| CI position relative to 1 | Text | Color |
|---|---|---|
| CI crosses 1 | "Not significant" | `#64748b` |
| OR > 1 and CI excludes 1 | "Favors treatment" | `#047857` |
| OR < 1 and CI excludes 1 | "Favors control" | `#ef4444` |

For HARM-coded trials (where OR > 1 but the primary outcome is an adverse event), the direction text color is red `#ef4444`. The winning-arm rule (§12.2) inverts to accent the control arm.

### 3.4 Subgroup Handling

When a trial has clinically meaningful subgroup analyses that appear in the primary paper (for example, hemorrhagic vs ischemic stroke in INTERACT4), render subgroup Grotta Bar pairs inside a collapsible teaching well below the primary result section. Default state: collapsed.

**Subgroup well header:** "Subgroup analyses" with chevron (same visual treatment as §8.1).

**Each subgroup pair renders (in order):**
1. Heading label (e.g., "Hemorrhagic stroke subgroup")
2. Treatment bar + arm label
3. Control bar + arm label
4. Stat row (common OR, 95% CI, direction)

**Mandatory amber caveat** at the bottom of the subgroup well, after all pairs:

```css
background: #fef3c7;
border-left: 2px solid #fbbf24;
border-radius: 2px;
padding: 10px 12px;
margin-top: 12px;
font-size: 12px;
color: #92400e;
line-height: 1.5;
```

Caveat text pattern: "These subgroup analyses were not part of the pre-specified hierarchical testing plan. They are hypothesis-generating only and should not be used to guide treatment decisions independently of the primary result." Adapt hedge language to match the paper's own framing exactly.

**Constraints:**
- Do NOT render subgroup analyses outside this teaching well
- Do NOT surface subgroup results in the bedsidePearl or bottom-line drawer unless the paper's abstract or conclusions lead with the subgroup finding

### 3.4a Subgroup Accent Rule and "Better Outcome" Pill

**Subgroup accent rule (NEUTRAL primary exception):**

When a trial's overall primary result is NEUTRAL (or NEGATIVE), the primary-bar pair follows §12.2 strictly — no cobalt accent on either arm. However, each subgroup Grotta Bar pair inside the collapsible subgroup well MAY apply the cobalt winning-arm accent (§12.2) to the subgroup-winning arm, independent of the primary `trialResult`. This is the only case where §12.2's trial-level rule is overridden at the subgroup level.

Conditions for applying the subgroup accent:
1. The subgroup analyses appear explicitly in the primary paper's methods or results
2. The subgroup well is rendered with the mandatory amber caveat (§3.4)
3. The primary bar pair retains the trial-level rule — no accent for NEUTRAL/NEGATIVE primary

Rationale: Surfacing directional signals within a constrained, caveat-wrapped teaching well is clinically useful without implying confirmatory evidence. The amber caveat is the guard; the subgroup scope boundary (collapsible well) is the container.

Cross-reference: §12.2 Winning-Arm Cobalt Accent Rule. §12.2 governs the §12 Intervention section rows; this section (§3.4a) governs Grotta Bar pair rows within the §3.4 subgroup well.

**"Better outcome" pill:**

Each subgroup Grotta Bar pair's winning arm also carries a "Better outcome" pill adjacent to the arm name, to the right of the arm label:

```css
background: #1746A2;    /* cobalt */
color: white;
font-size: 10px;
font-weight: 500;
padding: 2px 8px;
border-radius: 4px;
white-space: nowrap;
```

Display text: "Better outcome" (title case). This pill is shown only inside the subgroup well — never on primary-bar arm labels.

When the primary result is POSITIVE, the primary-bar arm labels do NOT carry this pill; the §12.2 cobalt row accent on the §12 Intervention section already signals the winning arm. The "Better outcome" pill is scoped to subgroup pairs where the primary layout provides no arm-level accent.

### 3.5 Teaching Well: "How to Read This Chart"

Same visual treatment as §8.1. Three mandatory Q&A pairs:

1. Q: "What does each colored bar show?"
   A: Each bar represents 100% of patients in that arm, divided into seven color segments by final mRS score at 90 days. Greener segments (left) indicate better outcomes; darker red and dark red (right) indicate severe disability or death.

2. Q: "What is a shift in the distribution?"
   A: A leftward shift means more patients ended up with lower (better) mRS scores in one arm compared to the other. The common odds ratio captures this shift across the entire scale, not just at one threshold.

3. Q: "What does the common odds ratio mean?"
   A: A common OR greater than 1 means the treatment arm had consistently better outcomes across the scale. An OR of 1.5 means each mRS level was approximately 1.5 times more likely to be achieved (or surpassed) in the treatment arm. Values near 1 with CI crossing 1 indicate no significant shift.

Content ownership follows §8.3.

### 3.6 Data Contract

The following fields drive Archetype B rendering. They are documented here and added to `TrialMetadata` in the W6.5.1 implementation prompt (see §18.3):

```typescript
mrsDistribution?: {
  arm: string;    // arm name, e.g. "EVT" or "Medical"
  n:   number;    // patients enrolled in this arm
  pct: number[];  // exactly 7 values: mRS 0-6 percentages (must sum to ~100)
}[];

ordinalStats?: {
  commonOR:  number;    // common odds ratio point estimate
  ciLow:     number;    // lower bound of 95% CI
  ciHigh:    number;    // upper bound of 95% CI
  direction: 'positive' | 'negative' | 'neutral' | 'harm';
};

subgroupAnalyses?: {
  label:        string;                // subgroup name, e.g. "Hemorrhagic stroke"
  treatment:    { pct: number[] };     // 7-value mRS pct array for treatment arm
  control:      { pct: number[] };     // 7-value mRS pct array for control arm
  ordinalStats?: {
    commonOR: number;
    ciLow:    number;
    ciHigh:   number;
    direction: string;
  };
}[];
```

No additional data fields are required for bar rendering beyond `mrsDistribution[].pct`.

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

## §7a Archetype G — Single-Arm / Benchmark-Threshold

**Status: SPECIFIED — implementation pending (W6.6.1)**
**Applies to:** Single-arm prospective studies (typically FDA 522 post-market studies or prospective registries) with a pre-specified safety or efficacy threshold that the observed event rate must meet or beat.
**Example trials:** WEAVE (Wingspan intracranial stent post-market study)
**Mockup reference:** Stage 8 (WEAVE reference)

### 7a.1 When to Use

- Single-arm studies where no concurrent randomized control arm exists
- The study protocol pre-specified a numerical benchmark before enrollment began
- The primary analysis is whether the observed event rate meets (or beats) the benchmark

Does NOT apply to:
- Non-randomized comparison studies that compare observed rates to historical cohorts without a pre-specified threshold
- Registries without a protocol-specified benchmark (archetype H or future pattern required)
- The B_PROUD cohort study — no pre-specified threshold exists; remains parked pending a separate pattern

### 7a.2 Visual Anatomy

A horizontal track visualization representing the event rate on a linear scale from 0% to 2x the benchmark (minimum scale max: 10%).

**Track specification:**

```css
height: 14px;           /* base (mobile) */
border-radius: 4px;
background: #f1f5f9;    /* slate-100 — unfilled track */
overflow: visible;       /* allows CI band and threshold line to extend */
position: relative;
```

Desktop override via `@media (min-width: 768px)`: `height: 18px`.

**Filled portion:** width = (observedRate / scaleMax) * 100%. `border-radius: 4px 0 0 4px` (rounds only the left edge).

- Color when rate is below benchmark (benchmark met): `#10b981`
- Color when rate is at or above benchmark (benchmark failed): `#ef4444`

**Confidence interval band:** a semi-transparent band at 20% opacity of the fill color, spanning (ciLow / scaleMax) to (ciHigh / scaleMax) as a percentage of track width. Renders behind the filled portion as an absolutely-positioned overlay.

**Threshold line:** a dashed vertical line at (benchmark / scaleMax) * 100% of track width:

```css
border-left: 2px dashed #92400e;
position: absolute; top: -6px; bottom: -20px;
```

**Callout labels:**
- Observed rate: above the fill's right edge at `top: -22px; transform: translateX(-50%)` — `font-size: 12px; font-weight: 600`
- Benchmark label: above the threshold line at `top: -22px; transform: translateX(-50%)` — `font-size: 11px; color: #92400e; font-weight: 600`
- Scale ticks: below the track — `font-size: 11px; color: #94a3b8`
  - Mobile: 3 ticks at 0%, midpoint, and scale maximum
  - Desktop: 5 ticks at 0%, 25%, 50%, 75%, and scale maximum (expressed as percentages of the scale range)

### 7a.3 Stat Row

Immediately below the track, two lines of plain text:

```
font-size: 13px; color: #475569; line-height: 1.8;
```

1. **CI line:** `"95% CI: X% to Y% ([method])"` — method is the construction method used, e.g. "Clopper-Pearson exact"
2. **Result line:** benchmark-met pill followed by a plain sentence

**Benchmark-met pill:**

```css
/* Met */
background: rgba(16, 185, 129, 0.12);
color: #047857;
border-radius: 4px;
padding: 3px 10px;
font-size: 11px;
font-weight: 600;
/* No text-transform — render as title case: "Benchmark met" */

/* Failed */
background: rgba(239, 68, 68, 0.12);
color: #991b1b;
border-radius: 4px;
padding: 3px 10px;
font-size: 11px;
font-weight: 600;
/* No text-transform — render as title case: "Benchmark failed" */
```

Plain sentence pattern: `"The observed [event label] rate of [X]% met the pre-specified benchmark of [Y]% (upper CI [Z]%, below benchmark)."`

### 7a.4 Historical Context Section

This section is **promoted** — it renders as a first-class section immediately after Primary Outcome and before Population in the §1.2 mandatory section order, NOT inside a teaching well.

**Mandatory section order amendment for Archetype G:**

```
1.  Title block                (§1.3)
2.  Primary Outcome            (§7a: track + stat row + teaching well)
2a. Historical Context         (§7a.4 — Archetype G only, 3+ comparators required)
3.  Population                 (§11.1)
...
```

If fewer than 3 historical comparators can be identified, omit the section entirely. Do not render a partial table.

**Visual treatment:**

```css
background: #f8fafc;
border-top: 1px solid #f1f5f9;    /* section separator — no border-radius, no margin-bottom */
padding: 20px;
```

**Mandatory amber caveat (first element in the section, before the table):**

```css
background: #fef3c7;
border-left: 2px solid #fbbf24;
border-radius: 2px;
padding: 10px 12px;
font-size: 12px;
color: #92400e;
margin-bottom: 14px;
line-height: 1.5;
```

Caveat text pattern: "These historical trials differ in patient selection, enrollment era, operator experience, device generation, and study design. They are shown for orientation only and do not represent a randomized comparison."

**Table columns:**
- Desktop: Trial | Year | N | Design | Rate
- Mobile: Design column is omitted

**Current trial row highlighting:**

```css
background: #EEF2FF;    /* cobalt-50 */
color: #0E2D6B;         /* cobalt-700 */
font-weight: 600;
```

All other rows: `font-size: 13px; color: #475569`.

Table header: `font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #64748b`.

### 7a.5 Teaching Well: "How to Read This Chart"

Same visual treatment as §8.1. Three mandatory Q&A pairs:

1. Q: "What is different about a single-arm trial?"
   A: There is no concurrent randomized control group. All patients received the device or treatment. A pre-specified benchmark (set before enrollment) serves as the reference instead of a control arm.

2. Q: "What is a pre-specified benchmark?"
   A: Before the study began, the investigators and regulators agreed on a threshold that the observed event rate must meet. Meeting the benchmark is not the same as proving superiority over another treatment.

3. Q: "Why can we not compare this directly to other trials?"
   A: Different trials enroll different patients, use different levels of operator experience and device generations, and measure events differently. Historical rates in the table are shown for orientation, not for statistical comparison.

Content ownership follows §8.3.

### 7a.6 Drawer Behavior and trialResult Extension

`trialResult` values for Archetype G extend the union (implementation deferred to W6.6.1):

| Value | Result word in collapsed bar |
|---|---|
| `'SAFETY_MET'` | Safety benchmark met |
| `'SAFETY_FAILED'` | Safety benchmark exceeded |
| `'INCONCLUSIVE'` | Inconclusive |

Until W6.6.1 ships: use `'POSITIVE'` as a stand-in for `'SAFETY_MET'` and `'NEGATIVE'` for `'SAFETY_FAILED'`. The BottomLineDrawer rebuild is tracked as W6.6.1; do NOT implement prematurely.

### 7a.7 Data Contract

The following fields drive Archetype G rendering. Added to `TrialMetadata` in the W6.6.1 implementation prompt (see §18.3):

```typescript
benchmark?: {
  rate:       number;    // pre-specified threshold percentage, e.g. 4.0
  label:      string;    // short event description, e.g. "72-hr stroke/death/MI"
  scaleMax?:  number;    // override auto-computed scale max (2x benchmark) if needed
};

observedEventRate?: {
  rate:       number;    // observed percentage, e.g. 2.6
  ciLow:      number;    // lower bound of 95% CI, e.g. 1.8
  ciHigh:     number;    // upper bound of 95% CI, e.g. 3.6
  ciMethod:   string;    // CI construction method, e.g. "Clopper-Pearson exact"
  numEvents:  number;    // count of events
  total:      number;    // total patients in denominator
};

historicalContext?: {
  rows: {
    label:          string;    // trial or study name
    year:           number;
    n:              number;
    design:         string;    // e.g. "RCT" or "Registry"
    rate:           number;    // event rate percentage
    isCurrentTrial?: boolean;  // true highlights the row in cobalt-50
  }[];
} | null;    // null explicitly omits the section
```

---

## §7b RCT Chain Section

### 7b.1 When to use

Use `RCTChainSection` when the current trial is the endpoint of a series of **RCTs that progressively improved on each other** (e.g., IMS-III → SYNTHESIS → MR RESCUE → ESCAPE chain). Each predecessor is a real randomized trial, not a historical cohort or registry benchmark.

**Decision rule — RCTChainSection vs HistoricalContextSection:**

| Scenario | Component |
|---|---|
| Predecessors are single-arm cohorts, registries, or surgical case series | `HistoricalContextSection` (§7a) |
| Predecessors are RCTs that directly precede this one in a design evolution | `RCTChainSection` (this section) |
| Both types exist for one trial | Use only `RCTChainSection`; do not wire both |

**No amber caveat** for `RCTChainSection`. Comparing RCT to RCT is epistemically valid; no equivalence-of-arms warning is needed. (Contrast with §7a where the amber caveat is **mandatory**.)

### 7b.2 Data shape

```typescript
rctChain?: {
  chainName: string;            // e.g. "EVT 2015 Wave"
  chainNarrative: string;       // 2-4 sentence prose; renders above card stack
  predecessors: Array<{
    trialId?: string;           // absent = stub; no link rendered
    trialName: string;
    year: number;
    journal: string;
    n?: number;
    designNotes?: string;       // e.g. "open-label RCT"
    keyResult: string;          // one sentence of headline numbers
    whatWasMissing: string;     // what gap this trial left open
  }>;
  currentTrialResult: string;   // one sentence -- matches trial's proves field
  whatChanged: string;          // one sentence -- why this trial resolved the gap
};
```

`rctChain` and `historicalContext` are mutually exclusive. A trial may have one or the other, not both.

### 7b.3 Visual pattern

**Container:** `bg-white dark:bg-slate-800 rounded-xl border border-slate-200`

**Section header row** (identical treatment to §7a.4 header):
- Left: uppercase label `HISTORICAL CONTEXT` — `font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.08em; text-transform: uppercase`
- Right: `"{N} trials · {year_range}"` — `font-size: 11px; color: #94a3b8`
- `year_range` = earliest predecessor year to current trial year

**Title:** `<h3>` — `"The road to {currentTrialName}"` — `font-size: 15px; font-weight: 500; color: #0f172a`

**Chain narrative:** prose paragraph — `font-size: 14px; color: #475569; line-height: 1.55; margin-top: 8px`

**Card stack:** vertical, `gap: 14px`

### 7b.4 Card content rules — predecessor cards

Each predecessor renders as a two-column row:

**Year column:** `width: 56px; flex-shrink: 0`
- Year label: `font-size: 12px; font-weight: 600; color: #64748b`
- Connector line below: `width: 2px; background: #cbd5e1; flex: 1; min-height: 20px; margin: 4px auto 0`
- No connector below the last predecessor card (or below card 4 when capped — connector resumes at the expand button)

**Card body:** `border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px`

**Card header row:**
- Trial name: `font-size: 13px; font-weight: 600; color: #0f172a`
- Right metadata: `journal · year · N={n}` (omit N if absent) — `font-size: 11px; color: #94a3b8`
- Design note below trial name (if present): `font-size: 11px; color: #64748b; margin-top: 2px`

**Result line:** `font-size: 13px; color: #374151; margin-top: 6px`

**"What was missing" footer:**
```css
border-left: 2px solid #cbd5e1;
background: #f8fafc;
color: #64748b;
font-size: 12px;
padding: 6px 10px;
border-radius: 0 4px 4px 0;
margin-top: 8px;
```
Label prefix: `"What was missing: "` — `font-weight: 600; color: #475569`

**Link behaviour:** if `trialId` is present, the trial name is a `<Link>` to `/trials/{trialId}`. If absent (stub), render as `<span>` — no link; no visual indication of absence beyond the section-level footnote.

### 7b.5 Current trial card (cobalt)

The current trial always renders at the bottom of the stack.

```css
border: 2px solid #185FA5;         /* cobalt-700 */
background: #E6F1FB;               /* cobalt-50 */
border-radius: 8px;
padding: 10px 12px;
```

**"THIS TRIAL" pill:** inline beside the trial name
```css
background: #1746A2;               /* cobalt-600 */
color: #ffffff;
font-size: 10px;
font-weight: 500;
letter-spacing: 0.05em;
text-transform: uppercase;
padding: 1px 6px;
border-radius: 4px;
```

**Year column:** `color: #0C447C` (cobalt-800) — same width/connector rules as predecessor year column; no connector below (last card)

**Trial name:** `font-size: 13px; font-weight: 600; color: #042C53` (cobalt-900)

**Result line:** `font-size: 13px; color: #1e3a5f`

**"What changed" footer** (not "what was missing"):
```css
border-left: 2px solid #185FA5;
background: #cce0f5;               /* cobalt-100 */
color: #0C447C;
font-size: 12px;
padding: 6px 10px;
border-radius: 0 4px 4px 0;
margin-top: 8px;
```
Label prefix: `"What changed: "` — `font-weight: 600`

### 7b.6 No amber caveat

`RCTChainSection` **never** renders an amber caveat. RCT-to-RCT comparison is epistemically valid. Any caveat about the current trial's result scope belongs in the trial's `doesNotProve` field and amber banners in the primary outcome section -- not here.

### 7b.7 Chain narrative authoring

The `chainNarrative` string (2--4 sentences) renders as a prose paragraph above the card stack. It explains:
1. What clinical problem the chain was trying to solve
2. Why the earlier RCTs failed (shared design flaw or technology gap)
3. What this trial did differently to resolve that gap

The chain narrative is authored by `medical-scientist` and gated by `clinical-reviewer` before merge (§6 Class E workflow).

### 7b.8 Mobile behaviour

At ≤375px viewport:
- Year column narrows to `44px`
- Card body font sizes unchanged (13px / 12px / 11px)
- Connector line hidden on mobile -- vertical rhythm is preserved by card gap alone
- "THIS TRIAL" pill wraps to a new line below the trial name if the trial name exceeds approximately 160px

### 7b.9 Edge cases

**5-card visible cap:** If `predecessors.length >= 5`, render the first 4 predecessor cards, then an expand button, then the current trial card. Clicking the expand button inserts the remaining predecessor cards between card 4 and the current trial card.

Expand button spec:
```
"Show all {N} predecessors"
font-size: 12px; color: #1746A2; font-weight: 500
border: 1px solid #bfdbfe; border-radius: 6px
padding: 6px 14px; background: #eff6ff
```

No collapse-back affordance; once expanded, stays expanded.

**Stub footnote:** If any predecessor in the array has no `trialId`, render a footnote **below the current trial card**:
```
"Some predecessor trial pages are forthcoming."
font-size: 11px; color: #94a3b8; margin-top: 12px; text-align: center
```
This footnote is always shown when stubs are present -- not dev-only.

**Empty predecessors array:** Do not render the section at all (treat as null / absent).

**Single predecessor:** Render normally; connector line and 5-card cap are irrelevant; section renders correctly.

---

## §7c Stub Trials (Predecessor References)

### 7c.1 Why stubs exist

Predecessor trials cited by modern trials need **linkable, content-rich pages** that a clinician can navigate to from a predecessor chain card (§7b) or from a cross-reference link. They do not need the full new-design archetype treatment. Stubs carry enough content for understanding historical context -- population, primary outcome, trial design, safety brief -- without teaching wells or archetype-specific visualizations that require full editorial effort and clinical-reviewer investment.

Any stub may be upgraded to a full page later. The schema accommodates upgrade: full-page fields (howToReadChart, howToInterpret, bedsidePearl) are simply absent on stubs and added during upgrade.

### 7c.2 What stubs contain

1. **Sticky header** -- same as full trial pages (trial abbreviation + category badge)
2. **Mandatory amber "historical reference" banner** -- rendered at the very top of the content area, above the H1. Required, not optional. See §7c.5.
3. **Cobalt H1 + question lede** -- question lede stored in `questionLede` field
4. **Source line** -- author, journal, year, DOI link, N patients
5. **Population** -- inclusion and exclusion criteria rendered via `renderPopulationSection` helper
6. **Primary outcome -- prose-narrative variant** -- prose paragraph stored in `primaryOutcomeProse` + a stat row with effect measure, 95% CI, and significance badge. No DeltaBandChart, GrottaBar, or BenchmarkThresholdChart.
7. **Trial design** -- one paragraph from `trialDesignNarrative`
8. **Safety brief** -- 1--2 sentences from `safetyBrief` in a prose card
9. **BottomLineDrawer** -- rendered with correct `trialResult` badge; `bedsidePearl` slot receives a fixed historical-reference note (not a data field -- see §7c.4)

### 7c.3 What stubs do NOT contain

- Teaching wells (`howToReadChart`, `howToInterpret` are absent from data and not rendered)
- Bedside pearl (no `bedsidePearl` data field; the BottomLineDrawer `bedsidePearl` prop receives a fixed "Historical reference" note)
- Subgroup analyses
- `RCTChainSection` or `HistoricalContextSection` (stubs ARE predecessors -- they are not their own chain endpoints)
- Archetype-specific visualizations (DeltaBandChart, GrottaBar, BenchmarkThresholdChart)

### 7c.4 TrialMetadata stub schema fields

Stubs add the following optional fields to `TrialMetadata` (all optional; absent on full-page trials):

```typescript
isStub?: boolean;             // marks page as a stub; used for display and query filtering
questionLede?: string;        // PICO-style question lede rendered below H1
primaryOutcomeProse?: string; // prose paragraph for the primary outcome card (no chart)
trialDesignNarrative?: string;// one paragraph trial design (replaces structured rendering)
safetyBrief?: string;         // 1-2 sentence safety summary
successorTrialId?: string;    // ID of the representative successor trial (used for Link href)
successorTrialDisplay?: string;// Display name for amber banner + see-also chip, e.g. "ESCAPE (2015)"
```

Stubs still provide the base required fields (`stats`, `trialDesign`, `efficacyResults`, `intervention`, `clinicalContext`, `pearls`, `conclusion`, `source`) to satisfy the TypeScript interface. These are used by the BottomLineDrawer and by any fallback path that loads the legacy page layout.

`trialResult` and `archetypeId` must be correctly populated on stubs. Classification accuracy is gated by `clinical-reviewer` (same as full pages).

### 7c.5 Mandatory amber banner

The amber "historical reference" banner renders **above the H1**, first in the content area.

Required text: `"This is a historical reference page. This trial preceded the modern evidence base for [clinical area]. See [successor trial name] for current evidence."` where `[successor trial name]` is a `<Link>` to `/trials/{successorTrialId}`.

```css
background: #fffbeb;
border-left: 3px solid #f59e0b;
border-radius: 0 6px 6px 0;
padding: 10px 14px;
```

Banner is mandatory for all stubs. A stub without a `successorTrialId` should render the banner with generic text (no link).

### 7c.6 Classification

`trialResult` values for stubs follow the same taxonomy as full pages:
- `NEGATIVE` -- trial designed to show benefit, failed to do so (primary endpoint not met)
- `NEUTRAL` -- trial found no meaningful difference; underpowered or effect size zero
- `POSITIVE` -- rarely applicable to stubs (stubs are predecessor trials, not landmark positive trials)

`archetypeId` is populated for schema completeness but drives no rendering on stub pages (the archetype-specific visualization is absent).

Clinical-reviewer gating applies: classification accuracy is verified before merge.

### 7c.7 Upgrade path

To upgrade a stub to a full page:
1. Add `howToReadChart`, `howToInterpret`, `bedsidePearl` to the `TrialMetadata` entry
2. Add the trial's id-gated JSX branch using the appropriate archetype pattern (§3 Archetype A, §3b Archetype B, §7a Archetype G)
3. Remove the stub `if` branch that renders the abbreviated stub layout
4. Run clinical-reviewer gate on the new clinical content
5. Mark `isStub: false` or remove the field

The stub branch and full-page branch are mutually exclusive by id-gate. Upgrade is a single PR.

### 7c.8 Claim surface handling

Stubs are abbreviated but still contain clinical claims:
- `primaryOutcomeProse` -- tagged with `/* claimId: {id}-outcomes | source: {citation} */` inline comment above the field
- `trialDesignNarrative` -- tagged with `/* claimId: {id}-design | source: {citation} */`
- `bottomLineSummary` -- tagged with `/* claimId: {id}-bottom-line | source: {citation} */`

W5.2 registry wiring is deferred for stubs (same as full pages) -- inline comment stubs are the current standard until the citation registry builds out.

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

For archetypes B-G, the Q&A content is archetype-specific (see §3, §4, §5, §6, §7, §7a).

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

**Exception for Grotta Bar subgroup pairs:** inside the §3.4 subgroup well, individual subgroup pairs may apply the cobalt accent to the subgroup-winning arm even when the primary `trialResult` is NEUTRAL or NEGATIVE, provided the mandatory amber caveat is present. This is the only override of the trial-level rule. See §3.4a for the full Subgroup Accent Rule.

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

Archetype A reuses existing components. Archetypes B and G require new components (tracked as W6.5.1 and W6.6.1 respectively):

| Component | Archetype | Task |
|---|---|---|
| `GrottaBarChart.tsx` | B — Ordinal Shift | W6.5.1 |
| `BenchmarkThresholdChart.tsx` | G — Single-Arm Benchmark | W6.6.1 |

The primary change for Archetype A canary is a rebuild of `TrialPageNew.tsx` to implement this spec's anatomy and section order.

### 18.3 TrialMetadata Schema Extensions

The following fields are added to `TrialMetadata` in Prompt 3. They are optional in the interface; all existing trials continue to render without them.

```typescript
// To be added to TrialMetadata in src/data/trialData.ts

inclusionCriteria?: string[];   // §11.2: one string per criterion
exclusionCriteria?: string[];   // §11.3: one string per criterion

// Teaching well content
howToReadChart?: {
  archetypeId: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
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

### 18.3a Schema Extensions for Archetype B (Grotta Bar) — Flagged for W6.5.1

These fields are documented here and added to `TrialMetadata` in the W6.5.1 implementation prompt. Do NOT add them before that prompt.

```typescript
// Archetype B: ordinal mRS distribution data
mrsDistribution?: {
  arm: string;    // arm name, e.g. "EVT" or "Medical"
  n:   number;    // patients enrolled in this arm
  pct: number[];  // exactly 7 values for mRS 0-6; must sum to ~100
}[];

// Archetype B: ordinal shift statistics
ordinalStats?: {
  commonOR:  number;    // common odds ratio point estimate
  ciLow:     number;    // lower bound of 95% CI
  ciHigh:    number;    // upper bound of 95% CI
  direction: 'positive' | 'negative' | 'neutral' | 'harm';
};

// Archetype B: subgroup pairs for teaching well (§3.4)
subgroupAnalyses?: {
  label:         string;
  treatment:     { pct: number[] };
  control:       { pct: number[] };
  ordinalStats?: { commonOR: number; ciLow: number; ciHigh: number; direction: string };
}[];
```

### 18.3b Schema Extensions for Archetype G (Benchmark-Threshold) — Flagged for W6.6.1

These fields are documented here and added to `TrialMetadata` in the W6.6.1 implementation prompt. Do NOT add them before that prompt.

```typescript
// Archetype G: pre-specified benchmark
benchmark?: {
  rate:      number;   // threshold percentage, e.g. 4.0
  label:     string;   // event description, e.g. "72-hr stroke/death/MI"
  scaleMax?: number;   // override auto-computed scale max (2x benchmark)
};

// Archetype G: observed event rate
observedEventRate?: {
  rate:      number;   // observed percentage, e.g. 2.6
  ciLow:     number;   // lower bound of 95% CI
  ciHigh:    number;   // upper bound of 95% CI
  ciMethod:  string;   // e.g. "Clopper-Pearson exact"
  numEvents: number;
  total:     number;
};

// Archetype G: historical comparators (§7a.4)
historicalContext?: {
  rows: {
    label:          string;
    year:           number;
    n:              number;
    design:         string;
    rate:           number;
    isCurrentTrial?: boolean;
  }[];
} | null;
```

### 18.3c trialResult Union Extension — Flagged for W6.6.1

The `BottomLineDrawer` `trialResult` union adds three values in W6.6.1:

```typescript
trialResult?: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HARM'
            | 'SAFETY_MET' | 'SAFETY_FAILED' | 'INCONCLUSIVE';
```

Until W6.6.1: use `'POSITIVE'` as stand-in for `'SAFETY_MET'`, `'NEGATIVE'` for `'SAFETY_FAILED'`.

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
| 1.1 | 2026-04-24 | orchestrator | Expanded §3 Archetype B (Grotta Bar) from stub to full spec: visual anatomy, 7-segment color gradient, label rules, stat row with direction logic, subgroup handling in teaching well, data contract. Added §7a Archetype G (benchmark-threshold): track viz, CI band, threshold line, historical context as promoted first-class section, drawer extension. Added §18.3a-c schema fields (Archetype B fields, Archetype G fields, trialResult union extension) flagged for W6.5.1 and W6.6.1. Companion mockup: Stage 7 (INTERACT4) + Stage 8 (WEAVE) added to trial-reference.html. ADR-006 records decisions. Design-guardian co-sign issued 2026-04-24 (APPROVE-WITH-CONDITIONS, 14 conditions). |
| 1.1 patch | 2026-04-24 | orchestrator | Resolved all 14 design-guardian conditions. §3.2: corrected bar height (28px mobile / 32px desktop), added mRS text-color rule (mRS 1+2 dark text), aligned label threshold (5% rule + mobile ≤375px exception at 9%), fixed legend to flex-wrap row. §3.3: stat-row label standardized to "Shift in distribution" (desktop) / "Shift" (mobile). §3.4: amber caveat CSS aligned to mockup (left-border, #fef3c7, border-radius 2px). §3.4a (new): Subgroup Accent Rule (NEUTRAL primary exception) and "Better outcome" pill documented. §7a.2: track height (14px mobile / 18px desktop), background (#f1f5f9), threshold line (top:-6px bottom:-20px), callout label positions, scale tick counts. §7a.3: benchmark-met pill aligned to mockup (rgba bg, #047857, fw 600, title case). §7a.4: historical-section container (border-top, no border-radius), caveat CSS unified to left-border treatment. §8.1: "B-F" → "B-G". §12.2: cross-ref to §3.4a subgroup exception. §18.2: updated component table (GrottaBarChart, BenchmarkThresholdChart). §18.3: archetypeId union includes 'G'. ADR-006 updated (bar height, track dims, §3.4a decisions). |
| 1.3 | 2026-04-27 | orchestrator | Added §7c Stub Trials (Predecessor References): why stubs exist, what stubs contain (sticky header, mandatory amber banner, H1+lede, population, prose-narrative primary outcome, design narrative, safety brief, BottomLineDrawer), what stubs do NOT contain (teaching wells, bedsidePearl field, subgroup analyses, RCTChainSection, archetype viz), TrialMetadata stub schema fields (isStub, questionLede, primaryOutcomeProse, trialDesignNarrative, safetyBrief, successorTrialId), mandatory amber banner spec, classification rules (trialResult/archetypeId still required), upgrade path, claim surface handling. |
| 1.2 | 2026-04-27 | orchestrator | Added §7b RCT Chain Section: when-to-use decision rule (RCT chain vs §7a benchmark), data shape (rctChain? field, mutually exclusive with historicalContext), visual pattern (container, header row, title, narrative, card stack), card content rules (year column 56px, connector line, card body, result line, "what was missing" footer, link/stub behaviour), current-trial cobalt card (cobalt-700 border, cobalt-50 bg, cobalt-900 text, THIS TRIAL pill, "what changed" footer), no-amber-caveat rationale, chain narrative authoring rules, mobile behaviour at 375px, edge cases (5-card cap with expand button, stub footnote always-shown, empty array guard, single-predecessor). |
