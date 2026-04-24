# Clinical review — W6.6.1 WEAVE Archetype G canary

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-sonnet-4-6)
**Date:** 2026-04-24

## Scope
- Claims touched:
  - weave-primary-result (comment-stub tagged in howToInterpret.proves)
  - Untagged claim surfaces reviewed semantically: bottomLineSummary, bedsidePearl, howToInterpret.doesNotProve, howToInterpret.cautions, howToReadChart Q1/Q2/Q3, question lede (TrialPageNew.tsx:3438), trialDesign narrative (TrialPageNew.tsx:3517), clinicalContext, pearls, inclusion/exclusion criteria
- Citations affected: Alexander MJ et al., Stroke 2019;50:889-894 (DOI 10.1161/STROKEAHA.118.023468). No citation registry entry exists — accepted under ADR-005 Option C hybrid; source is identified at the trial-object level (source, doi, clinicalTrialsId fields) and at comment-stub level.
- Surfaces changed (§13.3):
  - Structured data in src/data/trialData.ts (new WEAVE entry, Archetype G fields)
  - Static JSX in src/pages/trials/TrialPageNew.tsx (WEAVE id-gated branch)
  - Derived/template strings (BenchmarkThresholdChart label composition, caveat text)

## Semantic validity

Cross-checked against verified source statistics:

- **N=152 consecutive patients**: consistent across stats, observedEventRate.total, proves, bottomLineSummary, trialDesign narrative. Pass.
- **4 events / 2.6% event rate**: consistent across observedEventRate.numEvents/rate, efficacyResults.treatment.percentage, howToReadChart Q1, proves, bottomLineSummary, pearls. Pass.
- **95% CI 0.7–6.6% (Clopper-Pearson exact)**: stated correctly and with method in observedEventRate, proves, bottomLineSummary, howToReadChart Q2. Pass.
- **FDA benchmark <4%**: stated correctly and consistently. Direction ('below-is-good') correctly drives benchmarkMet derivation (TrialPageNew.tsx:3398-3402). Pass.
- **72-hour periprocedural window**: preserved in every surface (question lede, stats label, observedEventRate.description, proves, cautions, bottomLineSummary, howToReadChart, bedsidePearl). No drift to 30-day or in-hospital. Pass.
- **Single-arm, no efficacy claim**: howToInterpret.doesNotProve explicitly disavows superiority/equivalence to medical therapy. intervention.control correctly states "No randomized control arm. FDA pre-specified safety benchmark." Pass.
- **CI upper bound exceeds benchmark**: explicitly surfaced in cautions and howToReadChart Q2 ("upper CI bound (6.6%) exceeds it -- meaning the benchmark-met result has meaningful uncertainty at the boundary"). This is the correct, honest framing. Pass.
- **On-label inclusion criteria**: 70–99% symptomatic ICAD, at least 2 strokes in territory despite medical therapy, age 22–80, mRS 3 or less, more than 8 days from last stroke, vessel diameter 2.0–4.5 mm, lesion length 9 mm or less. Matches Wingspan HDE/IFU. Pass.
- **SAMMPRIS 14.7% periprocedural rate, stent arm**: consistent with published SAMMPRIS stopping data (Chimowitz NEJM 2011). Clinically plausible N=224 (SAMMPRIS randomized 451, stopped early with approximately 224 in stent arm). Pass.
- **IDE S140022, 24 US centers, Oct 2014–Mar 2017**: consistent with published study design. Pass.

Never-drift checks:
1. **Direction of effect**: "met" accurately represents a one-sample proportion test against a pre-specified upper bound; 2.6% < 4%. Correct.
2. **Action verbs**: "met", "does not demonstrate superiority", "cannot address whether stenting improves outcomes", "provides regulatory safety evidence" — no efficacy overreach, no softening of "safety benchmark" to "efficacy benchmark". Correct.
3. **Qualifiers**: on-label only, experienced centers, strict case selection, refractory medical therapy failure, more than 8-day waiting period, CI uncertainty at boundary — all preserved in cautions and bedsidePearl. Correct.
4. **Certainty markers**: "met" is categorical for the binary benchmark decision (correct for this test); limitations flagged with "statistically uncertain near the boundary", "does not generalize", "may not be reproducible in general practice". Correct.
5. **Temporal constraints**: "within 72 hours" / "periprocedural 72-hour" consistent across every surface. "More than 8 days since most recent qualifying ischemic event" preserved verbatim as an inclusion gate. Correct.

Historical context rows: per task brief, registry rows are out of scope for source-text verification. HDE 4.5% (N=44), NIH and US Wingspan Registries 6.2%, SAMMPRIS 14.7% fall within clinically plausible ranges for their eras and designs. No implausible figures flagged. The caveat text (TrialPageNew.tsx:3492) correctly frames these as non-randomized, non-contemporaneous context.

## Citation accuracy

Under ADR-005 Option C hybrid: comment-stub at howToInterpret.proves (`/* claimId: weave-primary-result | source: Alexander Stroke 2019 Table 1 */`) is the governing tagging mechanism. Source metadata is additionally captured at the trial-object level (source, doi, clinicalTrialsId). Registry entry is a deferred systemic condition under W5.2 and is not blocking per prior-review governance. The comment-stub references Table 1 of Alexander Stroke 2019, which is the correct primary-outcome table. Pass under ADR-005.

## Freshness

Source: Alexander Stroke 2019 (landmark post-market surveillance trial). Under §13.7 the applicable window is "Landmark trials" (36 months). Trial is stable, published once, no errata that change the primary result. No formal `last_reviewed` date exists because the citation registry entry is deferred (W5.2). Under ADR-005 Option C hybrid, this is accepted for canary content until W5.2 lands. Pass under the active governance.

## Rationale

Every primary claim (2.6% event rate, 4 events of 152, 95% CI 0.7–6.6% Clopper-Pearson, FDA below 4% benchmark, 72-hour window, single-arm design, on-label-only caveat) matches the verified source statistics and preserves clinical force. The content correctly distinguishes a one-sample safety benchmark from a comparative efficacy test, flags the CI upper bound exceeding the benchmark, and explicitly disavows any efficacy-vs-medical-therapy claim. Action verbs are calibrated — "met" (accurate for benchmark test), "does not demonstrate", "provides regulatory safety evidence" — with no drift to superiority or recommendation language. Temporal constraints (72-hour window, more than 8-day inclusion gate) are preserved verbatim across every claim surface. Inclusion/exclusion criteria match on-label Wingspan HDE/IFU. This is a faithful, appropriately cautious rendering of WEAVE that will not mislead a clinician at the bedside.

## Required follow-ups

**Conditions (deferred to W5.2; no re-review required):**
- `[medical-scientist, W5.2]` Once the citation registry module is live, register the Alexander Stroke 2019 citation, set `last_reviewed: 2026-04-24` with `review_window_months: 36` (landmark trial override), and map `weave-primary-result` in CLAIM_REGISTRY. Retrofit comment-stub surfaces to data-claim or claimId fields at that time.
- `[medical-scientist, W5.2]` Consider adding `weave-ci-uncertainty` claim ID on the cautions and howToReadChart Q2 surfaces — the "upper CI bound exceeds benchmark" observation is a second independent semantic claim from the benchmark-met result and deserves its own tag.

**Status:** ready_for_merge.
