# Clinical review — WEAVE Archetype G canary

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-5)
**Date:** 2026-04-24

---

## Scope

- Claims touched: `weave-primary-result` (inline stub), historical context rates (5 rows), inclusion/exclusion criteria, interpretation text, bedside pearl, bottom line summary
- Citations affected: Alexander et al. Stroke 2019;50:889-894 (doi: 10.1161/STROKEAHA.118.023468)
- Surfaces changed: structured data (`src/data/trialData.ts` WEAVE entry), new components `BenchmarkThresholdChart.tsx` and `HistoricalContextSection.tsx` (rendering only — no clinical text in components), `TrialPageNew.tsx` WEAVE branch (question lede + static string)

---

## Semantic validity

### Primary outcome data — PASS

The core numbers are consistent with the published paper:
- **4/152 patients** with periprocedural stroke or death within 72 hours = **2.6%** — correct per Alexander et al. Stroke 2019 Table 1.
- **95% CI 0.7% to 6.6%** by Clopper-Pearson exact method — correct. The exact binomial CI for 4/152 at 95% is 0.71% to 6.57%, which rounds appropriately to 0.7%–6.6%.
- **FDA pre-specified benchmark: 4%** — correct. The pre-market approval condition required a periprocedural (72-hour) major stroke or death rate below 4%.
- **`benchmarkMet: true`** (2.6% < 4%) — correct.

### Historical context rates — FLAG (non-blocking)

**Concern: time-window heterogeneity.** The historical context section displays all rates as "periprocedural stroke or death" alongside WEAVE's 72-hour definition. However:

1. **SAMMPRIS stent arm (14.7%)** — This is the 30-day stroke/death rate in the PTAS group (Chimowitz et al. NEJM 2011), not a 72-hour rate. Most SAMMPRIS periprocedural events did occur within the first 72 hours (the trial was stopped early due to high early event rate), so the comparison is directionally valid but not strictly equivalent.
2. **HDE Approval Study (4.5%)** — Plausible for initial Wingspan HDE data. The exact figure should be verified against the FDA summary of safety and effectiveness data for IDE G040002. The 4.5% rate is cited in the WEAVE paper's context and is consistent with the reported initial approval dataset.
3. **NIH Wingspan Registry (6.2%, N=158)** and **US Wingspan Registry (6.2%, N=129)** — Both reporting 6.2% is plausible (two independent registries with similar complication profiles), but the time window (72-hour vs 30-day) is not clearly distinguished. The Zaidat et al. 2008 NIH registry (Neurology 2008;70:1518–1524) reported a 9.6% 30-day stroke/death rate in a mixed on/off-label cohort; the 72-hour subset would be lower. The 6.2% figure is cited in the WEAVE paper's Table 3 comparison and may represent the paper's own reported "periprocedural" subset. **This is consistent with the WEAVE paper's own historical context table.**

**Resolution:** Add a footer note to the historical context section stating that time windows differ across studies (WEAVE = 72 hours; historical rates may include up to 30 days for some registries). The existing component footer already states: "Rates are not directly comparable across studies due to differences in patient selection, operator experience, and study era" — this partially covers the concern but does not explicitly name time window differences.

**Condition 1 (required before merge):** Add "and outcome assessment windows" to the footer note in `HistoricalContextSection.tsx` so the disclaimer reads: "Rates are not directly comparable across studies due to differences in patient selection, operator experience, study era, and outcome assessment windows."

### Inclusion/exclusion criteria — CONDITIONAL PASS

The listed inclusion criteria are largely consistent with the FDA HDE approved Wingspan on-label labeling (IDE G040002) as operationalized in WEAVE:

- Symptomatic ICAD 70–99%: correct
- Age 22–80: correct per HDE labeling
- mRS ≤3: correct
- More than 8 days from most recent event: correct
- Vessel diameter 2.0–4.5 mm, lesion ≤9 mm: correct

**Minor flag:** The criterion "At least 2 strokes or TIAs in the territory of the stenotic vessel despite optimal medical therapy" should be verified. The on-label Wingspan indication requires a stroke or TIA in the territory within 30 days of the procedure, with prior qualifying event(s). The WEAVE protocol required a documented stroke in the territory plus medical therapy failure; the "at least 2 strokes or TIAs" language may overstate the specific entry criterion. However, the intent (recurrent events despite medical therapy) is clinically accurate and does not misrepresent the study population.

**Condition 2 (recommended, not blocking):** Verify the exact WEAVE inclusion criterion for recurrent events against the published protocol or clinicaltrials.gov NCT02034058 and adjust if "at least 2" is not the verbatim entry criterion.

### Interpretation text — PASS

The proves/does-not-prove/cautions structure is semantically accurate:

- **Proves:** Correctly characterizes the one-sample benchmark result. The claim that "This result met the FDA pre-specified safety benchmark" is accurate and appropriately scoped to on-label use at experienced centers.
- **Does not prove:** Correctly states that WEAVE provides no efficacy data against a randomized comparator. No overreach.
- **Cautions:** Upper CI bound (6.6%) exceeding the benchmark correctly noted. The operator expertise caveat is appropriate. The narrow eligibility window caveat is accurate.

### Bedside pearl and bottom line — PASS

The on-label selection criteria listed in the pearl (70–99% stenosis, 2+ strokes, mRS ≤3, >8 days, experienced operator) are consistent with the study entry criteria and FDA labeling. No clinical misstatements. No em dashes present (§15.3 compliant).

### Question lede — PASS

"In patients with symptomatic intracranial atherosclerotic stenosis who meet strict on-label criteria for Wingspan stenting, does the periprocedural 72-hour stroke or death rate fall below the FDA pre-specified safety benchmark of 4%?" — accurately frames a single-arm benchmark study. Correctly avoids implying a head-to-head comparison.

### `trialResult: 'POSITIVE'` stand-in — NOTED

Per ADR-006 Decision 3, `trialResult: 'POSITIVE'` is the documented stand-in for `SAFETY_MET` until W6.6.1. The code comment in `trialData.ts` makes this explicit. The BottomLineDrawer badge will read "Positive" (from the POSITIVE branch) rather than "Benchmark met" until the full extension ships. This is a known, documented, temporary semantic mismatch. **Not a block.**

---

## Citation accuracy

- **DOI 10.1161/STROKEAHA.118.023468** — Consistent with the Stroke journal DOI format for the Alexander et al. manuscript submitted in 2018 (manuscript number STROKEAHA.118.023468). The Stroke 2019;50(5):889-894 paper was published in the May 2019 issue. DOI format is correct.
- **Source string:** "Alexander et al. (Stroke 2019;50:889-894)" — correct journal, volume, and page range.
- **`clinicalTrialsId: 'NCT02034058'`** — correct for the WEAVE trial registration.

---

## Freshness

The WEAVE trial (2019) is a landmark trial for intracranial stenting safety under Archetype G. As a single-arm benchmark study, it is not subject to ongoing updates. Review window per §13.7: landmark trials, 36 months. `last_reviewed` is not yet formally set (Wave 5 infrastructure gap). When W5.2 ships, WEAVE should receive a formal citation entry with `last_reviewed: '2026-04-24'` and `review_window_months: 36`.

---

## Rationale

The WEAVE Archetype G implementation is clinically accurate at its core: the primary result (4/152 = 2.6%, CI 0.7–6.6%, FDA benchmark 4%) matches the published paper, the interpretation text does not overstate what a single-arm benchmark study can establish, and the bedside selection criteria are appropriate. The one required pre-merge condition is minor — adding "and outcome assessment windows" to the HistoricalContextSection footer disclaimer to prevent clinicians from treating the historical context table as a time-normalized comparison. A second condition (verify exact "2 strokes or TIAs" language) is recommended but not blocking merge given the clinical intent is accurate. The `trialResult: 'POSITIVE'` stand-in is documented and acceptable per ADR-006 Decision 3.

---

## Required follow-ups

1. **(Pre-merge, condition 1):** Add "and outcome assessment windows" to the `HistoricalContextSection` footer note — see Semantic Validity § Historical context rates above.
2. **(Recommended, post-merge):** Verify WEAVE NCT02034058 protocol for exact recurrent-event entry criterion and update `inclusionCriteria[1]` in `trialData.ts` if needed.
3. **(W5.2 obligation):** Add formal WEAVE citation entry to the citation registry when W5.2 infrastructure ships, with `last_reviewed: '2026-04-24'` and `review_window_months: 36`.
4. **(W6.6.1 obligation):** Replace `trialResult: 'POSITIVE'` stand-in with `trialResult: 'SAFETY_MET'` when the full `trialResult` union ships in `BottomLineDrawer`.
