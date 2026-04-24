# ADR-006 — TRIALS_SPEC v1.1: Archetype B (Grotta Bar) and Archetype G (Benchmark-Threshold)

**Date:** 2026-04-24
**Status:** accepted — ratified by design-guardian co-sign 2026-04-24
**Deciders:** V (product owner), orchestrator
**Replaces:** none
**Supersedes:** ADR-005 Decision 5 (six archetypes) — partially. Extends archetype count to eight; does not alter A–F decisions.

---

## Context

Wave 6.5 analysis of 21 EVT trial PDFs revealed two design gaps in TRIALS_SPEC v1.0:

1. **Archetype B (Grotta Bar)** was registered in §3 as a stub ("specified only") but carried no implementation-ready specification. Trials with ordinal mRS shift outcomes (14 of 21 EVT trials) require this visualization. Without a full spec, no implementation could begin.

2. **Archetype G (Benchmark-Threshold)** had no archetype at all. Single-arm registry studies with pre-specified safety benchmarks (e.g., WEAVE) do not fit any of the A–F archetypes: they have no control arm, no p-value from a randomized comparison, and their primary analysis is a one-sample test against a historical threshold.

This ADR records five decisions made while amending TRIALS_SPEC to v1.1.

Reference artifacts:
- Spec: `docs/specs/TRIALS_SPEC.md` v1.1
- Mockup: `docs/specs/mockups/trial-reference.html` (Stages 7–8 ground truth)
- PM mockup: `/Users/vaibhav/Downloads/archetype-b-g-mockup.html` (design source)

---

## Decision 1 — Archetype B uses stacked ordinal bars with subgroup analyses confined to teaching well

**Decision:** Archetype B (Grotta Bar) is a two-row stacked bar chart where each row represents one trial arm and each segment represents the proportion of patients achieving mRS 0–6. Subgroup analyses are rendered inside a collapsible `subgroup-well` section within the teaching well — not in the primary outcome section and not in the BottomLineDrawer.

**Visual rules (locked):**

| mRS | Fill color | Text color |
|---|---|---|
| 0 | `#10b981` | white |
| 1 | `#34d399` | `#0f172a` (dark — light background) |
| 2 | `#fbbf24` | `#0f172a` (dark — light background) |
| 3 | `#fb923c` | white |
| 4 | `#f97316` | white |
| 5 | `#ef4444` | white |
| 6 | `#991b1b` | white |

- Segment labels omitted when segment width < 5%
- Bar height: 28px mobile, 32px desktop (via `@media (min-width: 768px)` override)
- Winning arm (when `trialResult === 'POSITIVE'`): cobalt left-border accent per ADR-005 Decision 3
- Primary stat row: common odds ratio (cOR) with 95% CI and direction badge

**Stat row direction logic:**

| Condition | Badge text | Badge color |
|---|---|---|
| CI crosses 1.0 | "Not significant" | slate-500 `#64748b` |
| OR > 1, CI excludes 1 | "Favors treatment" | green `#047857` |
| OR < 1, CI excludes 1 | "Favors control" | red `#ef4444` |

**Subgroup confinement rationale:** Subgroup analyses in ordinal mRS trials are typically not pre-specified in the primary hierarchical testing plan. Surfacing them at the primary-outcome level or in the BottomLineDrawer would imply confirmatory evidence strength they do not carry. Confining them to a collapsible teaching-well section with an amber caveat communicates exploratory status visually and cannot be missed by a reader who expands the section.

**Subgroup accent rule (NEUTRAL primary — §3.4a):**

When the primary `trialResult` is NEUTRAL or NEGATIVE, the primary Grotta Bar pair carries no cobalt accent (§12.2 unchanged). However, individual subgroup pairs inside the subgroup well MAY apply the cobalt winning-arm accent to the subgroup-winning arm. This is the only override of the trial-level cobalt rule. Conditions: (1) amber caveat present in the subgroup well; (2) analyses appear in the primary paper. See §3.4a for the full rule.

**"Better outcome" pill (§3.4a):**

Each subgroup pair's winning arm carries a "Better outcome" pill (`background: #1746A2; color: white; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 4px`). The pill is scoped to subgroup pairs only — not on primary-bar arm labels. This pill is distinct from the §12.2 Intervention-section "Winning arm" tag.

**Alternatives rejected:**
- **Subgroups in primary section (collapsed):** Would appear at the same visual hierarchy as the primary result, implying equal evidential weight. Rejected.
- **Subgroups omitted entirely:** Would remove clinically useful context (e.g., benefit in hemorrhagic vs. ischemic subtypes). Rejected.
- **Subgroups in drawer:** Drawer is for the bottom line only; adding subgroup caveats there would require the drawer to carry its own amber caveat logic and diverge from the Archetype A pattern. Rejected.

---

## Decision 2 — Archetype G uses benchmark-threshold visualization with historical context promoted to first-class section

**Decision:** Archetype G (Benchmark-Threshold) renders a single horizontal track showing the observed event rate relative to a pre-specified safety/efficacy benchmark. The track includes: filled portion (observed rate), CI band (20% opacity), and a dashed vertical threshold line. Historical context (comparator rates from prior literature) is promoted to a **first-class section (section 2a)** immediately after the Primary Outcome section — not buried in the teaching well.

**Track visual rules (locked):**

| Element | Specification |
|---|---|
| Track height | 14px mobile, 18px desktop (via `@media (min-width: 768px)`) |
| Track background | `#f1f5f9` (slate-100) |
| Fill — benchmark met | `#10b981` (green) |
| Fill — benchmark failed | `#ef4444` (red) |
| CI band opacity | 20% |
| Threshold line | `border-left: 2px dashed #92400e`; `position: absolute; top: -6px; bottom: -20px` |
| Threshold label | `top: -22px; transform: translateX(-50%)`, centered on threshold |
| Scale labels | 3 ticks mobile (0%, midpoint, max); 5 ticks desktop (0%, 25%, 50%, 75%, max) |

**Historical context promotion rationale:** Single-arm studies cannot establish treatment effects; their clinical interpretation depends entirely on how the observed rate compares to historical benchmarks. Relegating historical context to the teaching well would force readers to expand a collapsible section to understand the primary result — the wrong information hierarchy for a bedside reference tool. Promoting it to a first-class section (with mandatory amber caveat at the top) preserves appropriate epistemic caution while making the comparison accessible.

**3-comparator minimum:** Historical context section requires at least 3 rows to render. Below this threshold the comparison is too sparse to be clinically informative and the section is omitted.

**Alternatives rejected:**
- **Historical context in teaching well (original plan):** Buries the primary interpretive frame for a single-arm study. Rejected.
- **Historical context as primary section with no caveat:** Would imply equivalence between the randomized historical rates and the current single-arm observation. Rejected — amber caveat is mandatory.
- **Overlay visualization (historical bars on same track):** Visually unclear; different denominators, different follow-up periods, different patient populations make a shared axis misleading. Rejected.

---

## Decision 3 — trialResult union extended with SAFETY_MET, SAFETY_FAILED, INCONCLUSIVE; stand-ins used until W6.6.1

**Decision:** The `trialResult` field in `TrialMetadata` will be extended from:
```typescript
'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HARM'
```
to:
```typescript
'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' | 'HARM' | 'SAFETY_MET' | 'SAFETY_FAILED' | 'INCONCLUSIVE'
```

The three new values are semantically correct for single-arm benchmark studies. Implementation is deferred to W6.6.1. Until then:
- Trials with `SAFETY_MET` outcome use `trialResult: 'POSITIVE'` as a stand-in
- Trials with `SAFETY_FAILED` outcome use `trialResult: 'NEGATIVE'` as a stand-in
- `INCONCLUSIVE` has no stand-in — trials with inconclusive outcomes omit `trialResult`

**Stand-in rationale:** `'POSITIVE'` and `'NEGATIVE'` drive cobalt accent and BottomLineDrawer badge rendering. The semantic mismatch (a safety study is not the same as a positive RCT) is acceptable as a temporary stand-in because the only user-visible effect is the drawer badge label — which for Archetype G trials will read "Safety benchmark met" or "Safety benchmark failed" in the `body` prop regardless of the `trialResult` value. The `trialResult` value only controls the badge color/label in the collapsed drawer handle.

**Rationale for extension:** The existing four values map onto the null-hypothesis-rejection framework of two-arm RCTs. Single-arm benchmark studies operate under a different statistical paradigm (one-sample test, Bayesian stopping rules). A coerced `'POSITIVE'` label on a benchmark study implies randomized-comparison evidence that does not exist. The extension is a semantic correction that future implementations will leverage for Archetype G-specific drawer styling.

---

## Decision 4 — Schema fields documented in spec; implementation deferred to W6.5.1 (Archetype B) and W6.6.1 (Archetype G)

**Decision:** The data contract fields for Archetypes B and G are fully specified in TRIALS_SPEC v1.1 (§3.6 and §7a.7 respectively) but are not added to `src/types/trial.ts` or any component until the implementation waves.

**Archetype B fields (W6.5.1):**
```typescript
mrsDistribution?: { arm: string; n: number; pct: number[] }[];
ordinalStats?: {
  commonOR: number;
  ciLow: number;
  ciHigh: number;
  direction: 'positive' | 'negative' | 'neutral' | 'harm';
};
subgroupAnalyses?: {
  label: string;
  treatment: { pct: number[] };
  control: { pct: number[] };
  ordinalStats?: { commonOR: number; ciLow: number; ciHigh: number; direction: string };
}[];
```

**Archetype G fields (W6.6.1):**
```typescript
benchmark?: { rate: number; label: string; scaleMax?: number };
observedEventRate?: {
  rate: number;
  ciLow: number;
  ciHigh: number;
  ciMethod: string;
  numEvents: number;
  total: number;
};
historicalContext?: {
  rows: {
    label: string;
    year: number;
    n: number;
    design: string;
    rate: number;
    isCurrentTrial?: boolean;
  }[];
} | null;
```

**Rationale:** Adding TypeScript fields before the component exists creates unused dead code that the type-checker cannot catch in practice. Spec-first, implement-second is the pattern established by the TRIALS_SPEC v1.0 archetypes B–F. The fields are locked in the spec so implementation can proceed without further design decisions.

---

## Decision 5 — B_PROUD remains parked; Archetype G applies only to single-arm studies with a pre-specified benchmark

**Decision:** B_PROUD (a prospective, observational, non-randomized cohort study of the Wingspan stent) does not receive an Archetype G visualization. Archetype G is scoped exclusively to single-arm studies where a safety or efficacy benchmark was pre-specified before enrollment began.

**B_PROUD exclusion rationale:**
- B_PROUD has no pre-specified benchmark rate — the primary analysis is descriptive, not a one-sample test against a threshold
- Applying Archetype G's track-and-threshold visualization would imply a pre-specified statistical test that was never conducted
- Without a denominator benchmark, the "threshold" line would be arbitrary — a design decision by NeuroWiki authors, not a trial-registered hypothesis

**Archetype G eligibility criteria (locked):**
1. Single-arm enrollment (no randomized comparator)
2. Pre-specified primary endpoint defined as a rate (proportion)
3. Pre-specified benchmark rate registered before enrollment began (trial protocol or FDA IDE)
4. One-sample statistical test (exact binomial, Bayesian stopping rule, or equivalent) as primary analysis

**B_PROUD status:** Parked. A separate archetype (prospective observational cohort, tentatively Archetype H) may be warranted if multiple similar studies enter the trial database. Decision deferred to W6.6.2.

**Alternatives rejected:**
- **Apply Archetype G to B_PROUD with an editorially-selected threshold:** Would misrepresent the study design. Rejected as a clinical accuracy violation.
- **Apply Archetype A (dot grids) with a single arm:** Archetype A requires two arms for the delta band; rendering one arm of dots with no comparator conveys no information. Rejected.

---

## Consequences

### Positive
- 14 ordinal mRS trials (the majority of EVT trials) now have a fully specified visualization path
- Single-arm benchmark studies have a dedicated archetype with correct epistemic framing
- Historical context is surfaced at the right visual hierarchy for single-arm studies
- Subgroup analyses are correctly contained — clinically useful but not over-weighted
- `trialResult` extension is documented and deferrable without breaking existing trials

### Negative / risks
- `trialResult` stand-ins (`'POSITIVE'` / `'NEGATIVE'`) will produce semantically incorrect badge labels on Archetype G drawer handles until W6.6.1 ships
- Historical context 3-comparator minimum may omit context for rare procedures with sparse literature — acceptable given the misleading alternative
- Archetype B implementation (GrottaBarChart component) is net-new UI; until W6.5.1 ships, ordinal-mRS trials cannot use the new trial page design

### Required follow-ups

- [ ] **W6.5.1** — Implement `GrottaBarChart` component; add `mrsDistribution`, `ordinalStats`, `subgroupAnalyses` to `TrialMetadata`; wire INTERACT4 as Archetype B canary
- [ ] **W6.6.1** — Implement `BenchmarkThresholdChart` component; extend `BottomLineDrawer` with `SAFETY_MET`/`SAFETY_FAILED`/`INCONCLUSIVE` badge variants; add Archetype G fields to `TrialMetadata`; wire WEAVE as Archetype G canary
- [ ] **W6.6.2** — Decide B_PROUD rebuild approach; evaluate whether a prospective-cohort archetype (tentatively H) is warranted given the EVT trial corpus
- [ ] **W5.2 upgrade** — INTERACT4 and WEAVE stub entries require upgrade to full registry citations when W5.2 lands (same obligation as EXTEND per ADR-005 Decision 1)
