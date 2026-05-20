# Evidence Packet — ESCAPE-MeVO endpoint + design correction

**Date:** 2026-05-20
**Author:** evidence-verifier (orchestrator-routed)
**Purpose:** Class E correction to existing ESCAPE-MeVO trial entry. Source verification for the §17.2 clinical-reviewer artifact.

## Citation

Goyal M, Ospel JM, Ganesh A, et al. **Endovascular Treatment of Stroke Due to Medium-Vessel Occlusion.** N Engl J Med. 2025 Apr 10;392(14):1385-1395.

- **DOI:** 10.1056/NEJMoa2411668
- **PMID:** 39908448
- **Trial registration:** NCT05151172

## Primary endpoint (verbatim from PubMed abstract Methods)

> "modified Rankin scale score (range, 0 [no symptoms] to 6 [death]) at 90 days, reported as the percentage of patients with a score of 0 or 1."

## Primary statistical framework

Binary superiority on the proportion of patients with **mRS 0–1** at 90 days. Analyzed as an adjusted rate ratio (aRR) with a p-value. An ordinal-shift analysis (common odds ratio across the full mRS 0–6 distribution) is NOT the primary; it would appear as a secondary if reported.

## Primary result (verbatim from abstract Results)

- **EVT:** 106/255 = 41.6% achieved mRS 0–1 at 90 days
- **Control:** 118/274 = 43.1%
- **Adjusted rate ratio:** 0.95 (95% CI 0.79–1.15)
- **P-value:** 0.61
- **Direction:** negative (no benefit; numerical signal toward harm)

## Safety signal

- **sICH:** EVT 5.4% vs control 2.2%
- **90-day mortality:** EVT 13.3% vs control 8.4% (adjusted HR 1.82)

## What the catalog had wrong (pre-correction)

1. `stats.primaryEndpoint.value: 'mRS 0-2'` — wrong; should be `'mRS 0-1'`
2. `primaryDesign: 'ordinal-shift'` — wrong; should be `'binary-superiority'`
3. `efficacyResults.{treatment,control}.label: 'Functional independence (mRS 0-2) at 90 days'` — wrong outcome label
4. `pearls[0]` referenced mRS 0-2
5. `howToReadChart` Q1 + Q3 referenced mRS 0-2
6. `howToInterpret.proves` framed result as "did not improve 90-day functional independence" — wrong endpoint name
7. `howToInterpret.cautions` cited "rate ratio 0.95 (95% CI 0.82 to 1.10)" — wrong CI; published CI is 0.79–1.15
8. `bottomLineSummary` referenced "functional independence" — wrong endpoint name
9. `effectSize.value: 'Possible Harm'` + `label: '41.6% vs 43.1%'` — preserved as it carried the right intuition but updated to publication-accurate `aRR 0.95 / 95% CI 0.79–1.15` for clarity

## What was correct (verified)

- The percentages 41.6% vs 43.1% match the published mRS 0–1 framing (the numbers were always correct; only the label was wrong)
- `primaryResult: 'not-met'` — correct (trial was negative)
- `trialResult: 'NEGATIVE'` — correct
- `safetyProfile` sICH and mortality values match published
- Sample size 530 (catalog) approximates 529 randomized (published) — minor rounding only

## Confidence

**High** for endpoint label, design type, and percentage corrections — all confirmed verbatim from PubMed abstract Methods and Results sections.

## Caveats

- Abstract-level source. Full text paywalled (NEJM). Per V's rule, abstract is sufficient evidence for a correction (not new authoring) when the primary endpoint definition is stated verbatim in the abstract Methods.
- Original repo DOI/page reference (if any other place in the codebase stores them) should be cross-checked. Catalog `source` field only carries the bare `Goyal et al. (NEJM 2025)` string with no DOI; no change needed there.
