# Clinical review — Clinic Headache Pathway redesign (Phase 3 cutover)

**Decision:** approve-with-conditions (all six conditions resolved inline before commit; decision upgrades to approve)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: `clinic-headache-ichd3-migraine-criteria`, `clinic-headache-ichd3-tension-criteria`, `clinic-headache-ichd3-cluster-criteria`, `clinic-headache-ichd3-hemicrania-criteria`, `clinic-headache-ichd3-ndph-criteria`, `clinic-headache-preventive-threshold`, `clinic-headache-cgrp-escalation`, `clinic-headache-tension-acute-management`, `clinic-headache-tension-preventive`, `clinic-headache-moh-gepant-safe`, `clinic-headache-pitfall-mig-vs-tth` (new this PR)
- Citations affected: `ichd3-2018`, `do-snnoop10-2019` (new this PR), `scher-tth-2024-continuum`, `goadsby-2024-continuum-indomethacin`, `lipton-2024-continuum-preventive`, `ailani-ahs-2021`, `rizzoli-2024-continuum-moh`, `burish-2024-continuum-cluster`
- Surfaces changed: static JSX (`data-claim`), structured data in `src/data/clinicHeadacheData.ts` (criteria evaluator + chip groups + phenotypes), computed strings rendered through MapperPanel/PitfallNotice
- Evidence-verifier packet: not applicable — guideline-criteria classifier built on already-registered citations
- Trial-statistician report: not applicable

## Semantic validity

The encoded ICHD-3 criteria are faithful to the source on every load-bearing dimension verified: never-drift categories (recommendation strength, action verbs, qualifiers, certainty markers, temporal constraints) preserved. The Probable framework correctly implements ICHD-3 X.5's "all but one" rule with the exclusion clause now enforced by the inter-phenotype suppression added in Condition 4. Red-flag short-circuit suppresses phenotype matching and routes to workup. Output language avoids "diagnosis" on the mapper surface and (after Condition 5 resolution) on the management surface. Management dosing matches registered claims and citation quoted text. Pitfall surfaces are accurate paraphrases.

## Citation accuracy

All eight citations resolve in `src/lib/citations/registry.ts` with populated `quoted_text`, URLs, PMIDs. `ichd3-2018` section list covers every phenotype encoded. `do-snnoop10-2019` (PMID 30587518) verified. `goadsby-2024-continuum-indomethacin` dose range 75-150 mg/day — the page protocol now caps at 50 mg TID (150 mg/day) to align with the cited source.

## Editorial / expert context

Not applicable — no new trial entry in this PR. The classifier and management content are built on already-registered guideline and review citations.

## Freshness

All eight citations carry `last_reviewed: 2026-05-25`, refreshed as part of this Phase 3 cutover. Per §13.7: ICHD-3 2018 (24-month window) — pass; Do 2019 SNNOOP10 (24-month window) — pass; Ailani 2021 (6-month window) — refreshed today, pass; four Continuum 2024 reviews (12-month windows) — pass.

## Rationale

Six finite issues warranted conditions, not a block. None reached a never-drift category violation. All six are resolved inline in this commit:

1. **Pitfall claim ID registered.** `clinic-headache-pitfall-mig-vs-tth` added to claims.ts with `citation_ids: ['ichd3-2018']` and JSX surface.

2. **Chronic TTH criterion D under-specification acknowledged.** ctth-D criterion description now explicitly notes the chip picker does not distinguish nausea severity and prompts clinician confirmation. Code comment at ctth-D records the limitation and the path to tightening (future sym-nausea-mild / sym-nausea-severe chips).

3. **NDPH within-24-hour temporal qualifier preserved.** ndph-B criterion description now reads "becoming continuous and unremitting within 24 hours. Confirm with patient that they can pinpoint the exact day or hour of onset." Code comment acknowledges the chip-vocabulary limitation.

4. **X.5 exclusion-against-fulfilled-X enforced.** `evaluateHeadachePhenotypes` now suppresses all Probable matches when any phenotype is a full match. Matches ICHD-3 X.5's exclusion clause ("does not fulfil criteria for another ICHD-3 disorder").

5. **"Diagnosis" word removed from management copy.** Hemicrania protocol now reads "confirms the hemicrania continua phenotype" and "reconsider the working phenotype." Consistent with disclaimer banner ("The tool does not diagnose").

6. **Indomethacin upper bound lowered to 50 mg TID (150 mg/day).** Aligns with `goadsby-2024-continuum-indomethacin` quoted_text upper bound of 150 mg/day. Inline pitfall prompt and management section both updated.

After resolution, no further clinical-reviewer pass is required for this PR.

## Required follow-ups

None — all six conditions resolved inline before commit. Decision upgrades to approve.
