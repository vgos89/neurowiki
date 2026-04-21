# Architect review — ABCD² Score calculator rebuild

**Decision:** approve
**Reviewed:** pre-flight plan + current repo state + Heidelberg reference (76fa99b) + ABCD2 data module + routeManifest + link-graph
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-04-21
**Task class:** D-clinical
**Scope:** Full structural rebuild of src/pages/Abcd2ScoreCalculator.tsx against CALCULATOR_SPEC.md v1.1 Archetype 1. Follows the Heidelberg rebuild pattern (76fa99b) as validated template. No scope-callout deviation, no new clinical categorization.

## Rationale

ABCD² is the cleanest Archetype 1 rebuild candidate in the L5.5 batch. It ships with a numeric score (0–7), three severity tiers already encoded in the data module from Johnston 2007, a proper citation object, and typed inputs with null-initial-state already in place via `Partial<ABCD2Inputs>`. The delta to compliance is pure visual/structural: grid-card → divide-y layout, dark-mode stripped, border-2 removed, Portal drawer added. No clinical categorization decisions required; no scope callout required.

The one piece of clinical prose currently living in the component (three short per-tier action directives) relocates to the data module byte-for-byte without any rewording. This is consistent with the Heidelberg pattern where prose lives in the data module and the component is presentation-only.

## Decisions

### Q1 — Shape adapter placement: extend data module (additive)

**Chosen:** Extend `src/data/abcd2ScoreData.ts` with additive exports (`ABCD2Severity`, `ABCD2_DRAWER_PROSE`, `ABCD2CalculatorResult`, `calculateABCD2()`). Existing exports (`ABCD2_CITATION`, `ABCD2Inputs`, `ABCD2Risk`, `ABCD2Result`, option arrays, `ABCD2_TWO_DAY_RISK`, `ABCD2_RISK_LABELS`, `calculateABCD2Score`) remain untouched.

**Why:** Same rationale as Heidelberg. §8 requires data module ownership of scoring logic. Additive extension preserves the "as-is" instruction. Sole consumer is the component being rewritten — confirmed by `grep calculateABCD2Score`.

### Q2 — No scope callout

**Chosen:** No Archetype 1 deviation for ABCD².

**Why:** ABCD² is a standard TIA risk-stratification tool. It has no scope-misuse vector comparable to Heidelberg's "post-reperfusion-only" gate. Applying ABCD² to a non-TIA patient is not a clinical-safety problem in the same way that applying Heidelberg to a spontaneous ICH is. The existing warnings in the component footer ("All TIA patients need urgent evaluation regardless of score. ABCD² does not include imaging; consider ABCD²-I if DWI available.") belong in the drawer explanation or footer disclaimer — they are *caveats*, not scope gates. No deviation from §2 Archetype 1 anatomy is warranted.

### Q3 — SEVERITY_MAP location: data module (implicit)

**Chosen:** No new `SEVERITY_MAP` export. `severity` passes through from the existing `risk` field in `ABCD2Result`. The existing `score <= 3 ? 'low' : score <= 5 ? 'moderate' : 'high'` tier logic inside `calculateABCD2Score()` already encodes the severity; the canonical wrapper simply aliases `risk` → `severity`.

**Why:** Unlike Heidelberg (classification tool with no native severity), ABCD² has numeric scoring with clinical tiers already in the data module. The tier boundaries (0–3 low, 4–5 moderate, 6–7 high) match CALCULATOR_SPEC.md §6 exactly and come directly from Johnston et al. Lancet 2007. No new clinical categorization decision is being made — `severity === risk` is a type alias, not a new mapping.

### Q4 — Medical-scientist clinical sign-off: NOT REQUIRED

**Chosen:** Skip medical-scientist Phase 1b gate.

**Why:** No new clinical categorization is introduced by this rebuild. The severity tier mapping (0–3 / 4–5 / 6–7) is:
- already present in `calculateABCD2Score()` in the data module
- sourced from Johnston et al. Lancet 2007 (the canonical ABCD² validation paper)
- identical to CALCULATOR_SPEC.md §6 tier boundaries

The canonical `calculateABCD2()` wrapper aliases `risk` → `severity` and does not alter the tier logic. This is structural refactoring, not clinical categorization. Heidelberg required medical-scientist sign-off because 8 classification codes had to be assigned to 3 severity tiers — a new clinical decision. ABCD² has no analogous decision; the tiers are pre-established.

Clinical-reviewer Phase 3 pre-execution and Phase 5 post-execution gates still run. If clinical-reviewer objects to the severity passthrough on any grounds, medical-scientist can be routed reactively.

### Q5 — Clinical prose relocation: byte-for-byte preserved

**Chosen:** Move the three per-tier action-directive strings from the component's inline `result.risk === '...'` ternaries into a new `ABCD2_DRAWER_PROSE` const in the data module. Text preserved byte-for-byte.

**Why:** The rebuild places these strings in the drawer's `explanation` field. §8 requires all clinical content to live in the data module. Moving string literals from component JSX to a data module const is relocation, not modification. Clinical-reviewer Phase 5 diff must confirm zero byte drift.

Three strings being relocated (verbatim from current component lines 147–149):
- low: `Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score.`
- moderate: `Consider admission or same-day/urgent evaluation.`
- high: `Admit for workup and stroke prevention.`

**Interpretation headline:** the drawer's xl bold `interpretation` field uses a template in the form `{ABCD2_RISK_LABELS[risk]} · 2-day stroke risk: {twoDayRiskPercent}%.` This matches the existing component's inline assembly exactly (lines 143–144: `{ABCD2_RISK_LABELS[result.risk]} · 2-day stroke risk: <strong>{result.twoDayRiskPercent}%</strong>`). The substring "2-day stroke risk" is existing text; the percent and label are existing data; the assembly format is existing. No new prose.

### Q6 — Link-graph promotion

**Chosen:** Add `calc/abcd2` as a new node to `docs/link-graph.json`. Empty `references`, empty `referencedBy`. Not currently in the stubs array either.

**Why:** §7.3 requires every calculator to have a link-graph node. Currently calc/abcd2 is absent entirely — the graph integrity check would not flag this because nothing references it, but it should be present for completeness. Empty reference arrays are the honest state: no existing calculator prose or article points to ABCD² yet. A future link-graph enrichment task can add clinical cross-references (e.g., stroke pathway step 1, if that node is ever promoted from stub).

### Q7 — routeManifest.ts update: NO CHANGE

**Chosen:** Leave the existing ABCD² entry in routeManifest.ts untouched for this PR.

**Why:** Existing entry has `title`, `description`, `keywords` already present. The description is 202 chars (§7.1 recommends 150–160). This is an SEO optimization opportunity but not a correctness gap. Fixing it would be orthogonal to the rebuild and arguably changes content (keyword compression). Flag as non-blocking follow-up; address in a separate Class B SEO-tightening task if desired.

## Rubric

**1. Duplication risk — PASS.**
No duplication. `calculateABCD2()` wraps `calculateABCD2Score()` and adds drawer-anatomy fields. The tier logic is not re-implemented. Clinical prose is relocated from component to data module, reducing duplication (component becomes pure presentation).

**2. Boundary integrity — PASS.**
Clean split: data module owns citation, options, tier logic, drawer prose, canonical calculator function. Component owns presentation, drawer state, keyboard nav, clipboard, analytics. Matches Heidelberg and ICH/GCS patterns.

**3. Composability — PASS.**
Clones the Heidelberg Archetype 1 template (imports, Portal drawer, discovery animation, roving tabindex, SEVERITY_TOKENS sub-component). Zero novel infrastructure. Future ABCD²-adjacent calculators (CHA₂DS₂-VASc, HAS-BLED) can mirror this file with small substitutions.

**4. State locality — PASS.**
`useState` for inputs, drawerOpen, justCompleted, toastMessage. `useRef` for 5 radiogroup refs + wasCompleteRef. No new hooks, no external state. Matches Heidelberg.

**5. Dependency weight — PASS.**
Zero new npm packages. Pure reuse of existing hooks (useNavigationSource, useFavorites, useCalculatorAnalytics), utils (copyToClipboard), and the GCS/ICH/Heidelberg component template.

**6. Migration exit — PASS.**
Three clean exit paths: (a) component-only revert leaves data module extension as dead code, removable later; (b) full revert — existing `calculateABCD2Score()` API unchanged throughout, no schema rollback; (c) interpretation/explanation text can be revised in the data module const without touching the component.

## Required follow-ups

- **Phase 5 post-execution diff (mandatory):** clinical-reviewer must diff `src/data/abcd2ScoreData.ts` and confirm (a) only additions below line 82 (existing `calculateABCD2Score` function end), (b) all three relocated strings match the component's pre-rebuild inline text byte-for-byte, (c) `ABCD2_CITATION` and all option arrays unchanged.
- **routeManifest description compression (non-blocking, future):** ABCD² description is 202 chars (§7.1 recommends 150–160). Orthogonal SEO task.
- **Link-graph enrichment (non-blocking, future):** calc/abcd2 ships with empty references. A future task can link to stroke pathway nodes once those are promoted from stubs to full nodes.
- **No ADR required.** Unlike Heidelberg (which needed ADR-004 for SEVERITY_MAP + scope-callout deviation), ABCD² has no structural deviations from Archetype 1 and no new clinical decisions. The architect review artifact itself is the decision record.

## Blocking issues

None.

## Sign-off

Approved for Phase 3 (clinical-reviewer pre-execution gate). No medical-scientist Phase 1b gate required — severity is a type alias of existing `risk` field, not a new mapping. No V decision pending — no scope callout, no new categorization. Implementation may proceed immediately after clinical-reviewer pre-execution approval.
