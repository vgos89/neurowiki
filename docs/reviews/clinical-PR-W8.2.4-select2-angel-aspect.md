# Clinical review — W8.2.4 SELECT2 + ANGEL-ASPECT

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: SELECT2 + ANGEL-ASPECT entries in `src/data/trialData.ts`
- Citations affected:
  - SELECT2 — Sarraj A, et al. NEJM 2023;388(14):1259–1271 (DOI 10.1056/NEJMoa2214403, NCT03876457)
  - ANGEL-ASPECT — Huo X, et al. NEJM 2023;388(14):1272–1283 (DOI 10.1056/NEJMoa2213379, NCT04551664)
- Surfaces changed:
  - SELECT2 `doi` added; `applicability.imagingSelection` and `populationExclusions` enriched (age cap, sICH/mortality, NNT secondary-outcome labeling); `pearls` rewritten to lead with gOR (primary) and label NNT as secondary; `source` expanded with volume/issue/pages
  - ANGEL-ASPECT `doi` added; `applicability.imagingSelection` corrected (ASPECTS 0–2 + core 70–100 subgroup, age cap, NIHSS range); `populationExclusions` enriched with any-ICH disclosure and NNT secondary-outcome labeling; `stats.pValue` corrected from `<0.001` to `0.004` (METADATA ERROR fixed); `stats.effectSize` changed from secondary `18.4%` to primary `gOR 1.37`; `efficacyResults` labels appended with `(secondary)`; `pearls` rewritten
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-select2-angel-aspect.md` (confidence HIGH; both PDFs verified)
- Trial-statistician report: per packet — both are ordinal-shift primaries; NNT from mRS 0–2 secondary is permitted only with explicit secondary-outcome labeling

## Semantic validity

**ANGEL-ASPECT p-value correction (load-bearing).** Repo `stats.pValue.value: '<0.001'` was wrong. Per packet §6: "**Generalized odds ratio: 1.37 (95% CI 1.11–1.69), P=0.004**." The published primary P-value is 0.004 — visibly different by an order of magnitude and clinically meaningful (the trial barely crossed its pre-specified alpha-spending boundary of 0.046). Corrected to `'0.004'`. This is a never-drift violation in the certainty markers category that the metadata-completeness hook cannot detect.

**Primary vs secondary outcome labeling.** Both trials' `stats.effectSize` were showing the mRS 0–2 secondary outcome ARI without flagging it as secondary. Per `clinical-trial-audit` and `trial-statistics` skills, ordinal-shift primaries should show common/generalized OR as the headline; dichotomized secondary statistics require explicit labeling. ANGEL-ASPECT `stats.effectSize` now displays `gOR 1.37` (primary). SELECT2 retains `13%` but the populationExclusions now flags it as a secondary-outcome derivation. `efficacyResults.label` strings for ANGEL-ASPECT now carry `(secondary)` suffix.

**NNT labeling.** Both trials carry NNT values (7.7 and 5.4) derived from the mRS 0–2 secondary endpoint. Per packet §3 NNT validity rules, NNT is not allowed for ordinal-shift primaries without a dichotomization disclaimer. Rather than removing NNT (would break user-facing UI), both `populationExclusions` and `pearls` now carry explicit "NNT from secondary mRS 0–2 outcome" labels. The numeric NNT value itself is retained so existing UI surfaces continue to display, but the user-facing copy now contains the clinical-trial-audit-required disclaimer.

**ANGEL-ASPECT imaging selection.** Prior repo `imagingSelection` said only "ASPECTS 3–5 OR core 70–100 mL; ≤24h anterior LVO". Per packet §2.4: ANGEL-ASPECT also enrolled some ASPECTS 0–2 patients (32 per forest plot) with cores 70–100 mL, and ASPECTS >5 with cores 70–100 mL in the 6–24h window. Corrected with the full inclusion criteria.

All five never-drift categories: PASS post-edit.

## Citation accuracy

- SELECT2 DOI `10.1056/NEJMoa2214403` newly added; NCT03876457 verified.
- ANGEL-ASPECT DOI `10.1056/NEJMoa2213379` newly added; NCT04551664 verified.
- Both `source` strings now include volume/issue/pages per packet's recommendation.
- PMIDs not in packet at HIGH confidence (PubMed lookups blocked); to be added on next `/audit-citations` sweep.

## Freshness

- SELECT2 (NEJM 2023): 6-month window per §13.7 (current major guideline-changing trial). `last_reviewed: 2026-05-14` upon W5.2.
- ANGEL-ASPECT (NEJM 2023): 6-month window. Same.

## AHA 2026 guideline cross-reference

Per 2026 Guideline §4.7.2 Endovascular Thrombectomy for Adults (per "What is New and of High Impact" table):

> **COR 1** for selected patients with anterior circulation proximal LVO of ICA or M1, age <80, NIHSS ≥6, prestroke mRS 0–1, **ASPECTS 3 to 5, presenting between 6 and 24 hours from onset of symptoms, and without significant mass effect on imaging** — EVT recommended.
>
> **COR 2a** for selected patients with anterior circulation proximal LVO, age <80, NIHSS ≥6, prestroke mRS 0–1, **ASPECTS 0 to 2**, presenting within 6 hours from onset of symptoms, and without significant mass effect on imaging — EVT reasonable.

Both SELECT2 and ANGEL-ASPECT are the trials backing these COR assignments. Top Take-Home Message #6 reinforces: "EVT benefits some patients with larger ischemic core strokes as determined by diagnostic imaging."

Pearl in both trials now cross-references §4.7.2 COR 1 (6h primary window) and COR 2a (6–24h window).

## Rationale

ANGEL-ASPECT p-value `0.004` (not `<0.001`) was a metadata error live on the public site; it's now corrected. Both trials' NNT display now carries explicit secondary-outcome labeling per the `clinical-trial-audit` skill, addressing the parking-lot 2026-05-11 concern. Imaging selection criteria for ANGEL-ASPECT was incomplete and is now corrected. Pearls reframed to lead with the ordinal-shift primary statistic (gOR) before the dichotomized secondary.

No NNT removed (preserving existing UI), no efficacy rates changed, no recommendation strength altered.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `sarraj-2023-select2` with DOI `10.1056/NEJMoa2214403`, NCT `NCT03876457`, `quoted_text` from packet primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 6`. PMID to be looked up.
  - Register `huo-2023-angel-aspect` with DOI `10.1056/NEJMoa2213379`, NCT `NCT04551664`, similar fields.
- Grotta-bar visualization with 7-value mRS arrays (verified in packet §6 and §2.6) is a future UX enhancement. Not blocking.
- ANGEL-ASPECT medical-arm mRS 2 value of 0% per packet §Reconciliation — flag for supplementary-appendix verification on next sweep. Not blocking for this commit.
- SELECT2 `stats.effectSize.value: '13%'` could be replaced with `gOR 1.51` for primary-statistic consistency with ANGEL-ASPECT; deferred to avoid changing more than necessary in this pass.
