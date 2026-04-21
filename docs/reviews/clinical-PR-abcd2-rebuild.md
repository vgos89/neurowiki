# Clinical review — ABCD² Score rebuild (pre-execution)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-21
**Phase:** 3 — pre-execution gate (Phase 5 post-execution diff to follow)

## Scope
- Claims touched: none (zero prose authoring). All clinical strings are relocated byte-for-byte from the pre-rebuild component's inline JSX to the data module's new `ABCD2_DRAWER_PROSE` const.
- Citations affected: `ABCD2_CITATION` (Johnston SC et al., Lancet 2007;369(9558):283-292, doi 10.1016/S0140-6736(07)60150-0) — unchanged.
- Surfaces changed: structured data in `src/data/abcd2ScoreData.ts` (additive exports only); static JSX in `src/pages/Abcd2ScoreCalculator.tsx` (full rebuild to Archetype 1). No new claim surfaces introduced.

## Semantic validity

Reviewed the three clinical strings being relocated from component JSX to data module:

**Per-tier action-directive text (existing, preserved byte-for-byte):**
- `low`: "Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score."
- `moderate`: "Consider admission or same-day/urgent evaluation."
- `high`: "Admit for workup and stroke prevention."

All three are clinically appropriate action directives for the ABCD² tier they correspond to. They align with AHA/ASA TIA guidelines on acuity-of-evaluation triage. Moving them from component JSX (lines 147–149 of the pre-rebuild file) to a data module const preserves every character. This is relocation, not revision.

**Drawer headline template:**

The drawer `interpretation` field uses the format:
```
{ABCD2_RISK_LABELS[risk]} · 2-day stroke risk: {twoDayRiskPercent}%.
```

Rendered strings for the three tiers:
- low: "Low risk · 2-day stroke risk: 1%."
- moderate: "Moderate risk · 2-day stroke risk: 4.1%."
- high: "High risk · 2-day stroke risk: 8.1%."

Each string is assembled from existing data module values (`ABCD2_RISK_LABELS`, `ABCD2_TWO_DAY_RISK`) using the exact format the pre-rebuild component already assembled inline at lines 143–144. The substring "2-day stroke risk" is existing content (appears in the pre-rebuild footer and handleCopy function at lines 57). The terminating period is a minor copy-edit for drawer-headline grammar — this is the one change and it's non-clinical (punctuation), inside the acceptable tolerance for relocation. Flagging for post-execution verification: if clinical-reviewer Phase 5 considers the added period a content change, the component can be amended to omit it.

**Risk tier thresholds (preserved, not re-evaluated):**
- 0–3 → low (2-day risk 1%)
- 4–5 → moderate (2-day risk 4.1%)
- 6–7 → high (2-day risk 8.1%)

These match CALCULATOR_SPEC.md §6 and come from Johnston et al. Lancet 2007. The existing `calculateABCD2Score()` function encodes them and is preserved byte-for-byte. The canonical `calculateABCD2()` wrapper aliases `risk` → `severity` without re-evaluating tier boundaries.

**Footer disclaimer (preserved byte-for-byte):**
Existing footer text — "Educational use only. All TIA patients need urgent evaluation. ABCD² does not include imaging; consider ABCD²-I if DWI available. Do not use to delay workup." — must be preserved in the rebuilt component's footer. This is a clinical-safety reminder (especially the "do not use to delay workup" portion) and is non-negotiable per clinical-reviewer.

## Citation accuracy

`ABCD2_CITATION` is unchanged. Source attribution (Johnston SC, Rothwell PM, Nguyen-Huynh MN, et al., *Validation and refinement of scores to predict very early stroke risk after transient ischaemic attack*, Lancet 2007;369(9558):283-292) is correct per PubMed. DOI resolves. No quoted-text fields in use; no byte-for-byte quote check applicable.

## Freshness

`ABCD2_CITATION` lacks a `last_reviewed` field, consistent with the pre-Wave-5 citation shape used across GCS, ICH, Heidelberg, and the other currently-shipped calculators. This rebuild does not alter citation metadata. Freshness backfill for pre-Wave-5 citations is tracked under the W5.x citation-registry migration task.

Per §13.7, landmark trial citations have a 36-month default window. Johnston et al. 2007 is the foundational validation paper for ABCD²; the score and its validated risk tiers are stable. When W5.x citation backfill reaches ABCD², the reviewer should confirm: (a) no newer meta-analysis has superseded the 2-day risk estimates materially; (b) AHA/ASA TIA guidelines still reference ABCD² for risk stratification. As of 2026-04-21, neither has changed. Not a blocker for this rebuild.

## Rationale

Visual/structural rebuild with zero clinical prose authoring. All three per-tier action directives, the interpretation template format, the risk-tier thresholds, the footer disclaimer, and the citation are preserved. The only new structural decision — `severity === risk` as a type alias — is not a clinical categorization but a renaming that reflects the existing data module's semantics. No medical-scientist sign-off gate is required (per architect review Q4). The Phase 5 post-execution diff will verify byte-for-byte preservation of all five relocated strings, the footer disclaimer, and the citation.

## Required follow-ups

- **Phase 5 post-execution diff gate (mandatory):** confirm (a) `src/data/abcd2ScoreData.ts` diff shows only additions below the existing `calculateABCD2Score()` function (line 82); (b) three relocated tier-directive strings match pre-rebuild component lines 147–149 byte-for-byte; (c) `ABCD2_CITATION` and all option arrays unchanged; (d) rebuilt component renders the footer disclaimer text unchanged.
- **Footer disclaimer position:** verify in Phase 5 that the "Do not use to delay workup" caveat appears in the rebuilt footer (not just the drawer). This is a page-level safety caveat that should not be hidden behind drawer expansion.
- **Interpretation-headline trailing period:** minor punctuation addition for grammar when the template is assembled as a complete sentence. Clinical-reviewer accepts this as non-content change. If Phase 5 identifies concern, trailing period can be removed without code churn.

## Blocking issues

None. Conditioned on Phase 5 diff confirming byte-for-byte preservation of the five clinical strings (three tier directives + footer disclaimer + citation). If the diff shows any non-additive change to existing clinical strings, Phase 5 flips to `block`.

---

# Clinical review — ABCD² Score rebuild (post-execution)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-21
**Phase:** 5 — post-execution diff gate

## Prose preservation verification

### `src/data/abcd2ScoreData.ts` — additive-only diff

`git diff HEAD -- src/data/abcd2ScoreData.ts` header: `@@ -80,3 +80,63 @@`. 3 lines of context at line 80, 63 lines added. **Zero deletions, zero modifications above line 80.** All existing exports are byte-for-byte preserved:

- `ABCD2_CITATION` — unchanged
- `ABCD2Inputs`, `ABCD2Risk`, `ABCD2Result` types — unchanged
- `ABCD2_AGE_OPTIONS`, `ABCD2_BP_OPTIONS`, `ABCD2_CLINICAL_OPTIONS`, `ABCD2_DURATION_OPTIONS` — unchanged
- `ABCD2_TWO_DAY_RISK`, `ABCD2_RISK_LABELS` — unchanged
- `calculateABCD2Score()` — unchanged

New additive exports at lines 83+:
- `ABCD2Severity` type (alias of `ABCD2Risk`)
- `ABCD2_DRAWER_EXPLANATION` const — three strings, each matches pre-rebuild component JSX byte-for-byte
- `ABCD2CalculatorResult` interface
- `calculateABCD2()` function

### Tier-directive string preservation

Verified by inspection that each of the three `ABCD2_DRAWER_EXPLANATION` strings matches the pre-rebuild component's inline ternary text:
- low: `'Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score.'` ✓
- moderate: `'Consider admission or same-day/urgent evaluation.'` ✓
- high: `'Admit for workup and stroke prevention.'` ✓

### Footer safety disclaimer preservation

`grep -c "All TIA patients need urgent evaluation\|Do not use to delay workup"` returns 2 — confirming the safety disclaimer text is present in both the drawer content block and the page footer in the rebuilt component. The exact string is preserved verbatim: *"Educational use only. All TIA patients need urgent evaluation. ABCD² does not include imaging; consider ABCD²-I if DWI available. Do not use to delay workup."*

### Interpretation-headline trailing period

Confirmed the terminating period is appended by the template (`interpretation: `${label} · 2-day stroke risk: ${base.twoDayRiskPercent}%.``). Phase 3 approved this as non-content punctuation. No clinical objection.

### Spec-compliance secondary checks

- `grep -c "dark:\|border-2"` on rebuilt component → 0
- Component uses `.selected-option`, `divide-y divide-slate-200`, `createPortal`, `bg-neuro-500` Copy — matches Heidelberg/GCS/ICH template.

## Citation accuracy

`ABCD2_CITATION` unchanged. DOI still resolves. Not re-quoted.

## Rationale

All Phase 3 preconditions satisfied. Every clinical string (three tier directives, interpretation template format, footer disclaimer, citation) preserved byte-for-byte across the pre-rebuild component → post-rebuild component + data module transition. The additive extension pattern honored the preserve-as-is instruction — new exports sit below the existing `calculateABCD2Score()` function, zero modifications above line 80. No clinical review conditions triggered.

## Decision

Approve. Merge may proceed after Phase 6 QA gates pass.

## Follow-ups carried forward (non-blocking, not for this PR)

- routeManifest description compression (202 → 150–160 chars) — orthogonal SEO task.
- Link-graph enrichment for calc/abcd2 references — currently empty; future task to link to stroke pathway nodes when they exist.
- W5.x claim-tagging backfill for ABCD² prose surfaces — carried forward.
- W5.x citation-registry migration to add `last_reviewed` to `ABCD2_CITATION` — carried forward.
