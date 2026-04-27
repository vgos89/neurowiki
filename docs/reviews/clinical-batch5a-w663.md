# Clinical review — W6.6.3 Batch 5A (BP-TARGET, BEST-II, OPTIMAL-BP)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-27

## Scope

- **Claims touched:** `best-ii-interpret`, `best-ii-pearl`, `bp-target-interpret`, `bp-target-pearl`, `optimal-bp-interpret`, `optimal-bp-pearl` (6 claim stubs; tagged via `/* claimId: ... */` adjacent comments per ADR-005 Option C hybrid pattern)
- **Citations affected:** Mistry et al. JAMA 2023 (BEST-II, NCT04116112, doi:10.1001/jama.2023.14330); Mazighi et al. Lancet Neurol 2021 (BP-TARGET, NCT03160677, doi:10.1016/S1474-4422(20)30483-X); Nam et al. JAMA 2023 (OPTIMAL-BP, NCT04205305, doi:10.1001/jama.2023.14590)
- **Surfaces changed (per §13.3):** Structured data in `src/data/trialData.ts` — adds `howToReadChart`, `howToInterpret` (proves/doesNotProve/cautions), `bedsidePearl`, `bottomLineSummary`, `inclusionCriteria`, `exclusionCriteria`. OPTIMAL-BP also has `trialResult` changed from `'NEGATIVE'` to `'HARM'`.

## Semantic validity

Reviewed each `howToInterpret` and `bedsidePearl` against published numbers and the never-drift categories: recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints.

### BP-TARGET (Mazighi 2021)

- Numbers: 324 patients, 4 French centers, iPH 42% intensive vs 43% standard, aOR 0.96 (95% CI 0.60–1.51, P=0.84) — all match published figures. ✓
- Population qualifiers preserved: successful EVT, anterior circulation LVO, SBP target windows (100–129 vs 130–185 mm Hg), 24-hour maintenance. ✓
- `proves` correctly states "no reduction" rather than "no effect"; uses "trended numerically lower without statistical significance" for the secondary functional signal, preserving the underpowered-secondary qualifier. ✓
- `doesNotProve` correctly flags that BP-TARGET was underpowered for functional harm and was a hemorrhage-reduction design — matches the trial's own framing. ✓
- `bedsidePearl` attributes the functional-harm conclusion to OPTIMAL-BP, not to BP-TARGET alone. Synthesis is legitimate and accurately qualified. ✓

### BEST-II (Mistry 2023)

- Numbers: 120 patients, 3 US centers, 3 arms (<140/<160/≤180), futility P=0.93, predicted success 14–25%, utility-weighted mRS 0.51 vs 0.58 (shown as 51 vs 58 ×100 in chart) — all match. ✓
- `proves` says "no lower target formally crossed the futility boundary" — matches futility-design semantics exactly; does not overclaim harm. ✓
- `doesNotProve` correctly states BEST-II "does not prove that lower BP targets cause harm" — this critical distinction between futility-not-met and harm-demonstrated is preserved. ✓
- Cross-reference to OPTIMAL-BP in `cautions` correctly labels it as "stronger and more definitive evidence" (306 patients, primary functional endpoint vs futility design). ✓
- Synthesis in `bedsidePearl` ("BEST-II showed low predicted benefit; OPTIMAL-BP confirmed functional harm") — the two trials agree in direction; BEST-II is suggestive, OPTIMAL-BP is confirmatory. No smoothing over conflict. ✓

### OPTIMAL-BP (Nam 2023) — HARM classification

This is the load-bearing call in Batch 5A. Assessed against Modification 2 / NOR-TEST 2 Part A precedent.

- Numbers: 306 patients (stopped at 68% of 450 planned), 19 South Korean centers, mRS 0–2: 39.4% intensive vs 54.4% conventional, aOR 0.56 (95% CI 0.33–0.96, P=0.03), malignant edema aOR 7.88 (CI 1.05–59.0, P=0.01), absolute difference -15.1 pp (CI -26.2 to -3.9 pp). All match. ✓
- DSMB stoppage explicitly stated and correctly attributed as the basis for early termination. ✓

HARM classification meets the Modification 2 / NOR-TEST 2 Part A standard:
1. Stopped by DSMB for safety. ✓
2. Functional independence reduced on the primary endpoint (not a surrogate) — 15.1 pp absolute reduction with adjusted OR significant at P=0.03. ✓
3. Mechanistic safety signal corroborates: malignant cerebral edema 8-fold higher in the intensive arm. ✓
4. sICH rates were not significantly different — correctly stated in `doesNotProve`. ✓

Classification is correct.

- `proves` opens with "STOPPED FOR SAFETY" in caps — appropriate semantic banner consistent with the evidence. ✓
- `doesNotProve` correctly scopes the harm to targeting SBP <140 mm Hg and notes the conventional arm allowed 140–180 mm Hg, so the trial cannot speak to intermediate targets. ✓
- `cautions` flags early stopping, open-label design, single-country cohort, and mechanism as "biologically plausible but not definitively established." Certainty markers correctly preserved. ✓
- `bedsidePearl` says "Do not target SBP below 140 mm Hg" — strength matches the evidence (primary-endpoint harm in a DSMB-stopped trial). No upgrade from the source. ✓

JSX framing (red HARM header, "STOPPED FOR SAFETY" banner, `winnerArm="control"`) is semantically consistent with the evidence and the HARM classification.

## Citation accuracy

- **BEST-II** (Mistry 2023, JAMA, doi:10.1001/jama.2023.14330, NCT04116112): Quoted figures are consistent with the published trial. DOI and ClinicalTrials ID are resolvable. ✓
- **BP-TARGET** (Mazighi 2021, Lancet Neurol, doi:10.1016/S1474-4422(20)30483-X, NCT03160677): iPH 42% vs 43%, aOR 0.96 (0.60–1.51), P=0.84 are consistent with published primary outcome. ✓
- **OPTIMAL-BP** (Nam 2023, JAMA, doi:10.1001/jama.2023.14590, NCT04205305): mRS 0–2 39.4% vs 54.4%, aOR 0.56 (0.33–0.96), P=0.03; malignant edema aOR 7.88 (1.05–59.0), P=0.01 are consistent with the published trial. ✓

All three sources are resolvable from repository fields (DOI + ClinicalTrials.gov ID + journal/year). No dead references, no missing identifiers, no unsupported quoted text.

## Freshness

`last_reviewed` field is deferred per W5.2 (claims registry is a stub, citations not yet wired to schema). Not blocking this batch.

For the record when freshness goes live: BP-TARGET (2021), BEST-II (2023), OPTIMAL-BP (2023) are landmark RCTs in the actively-evolving post-EVT BP management space. All three remain the definitive trials in their domain as of 2026-04-27. No newer trial supersedes any of them. No proactive refresh required at first sweep.

## Rationale

All three entries paraphrase their sources accurately and preserve all five never-drift categories. Syntheses between trials (BEST-II with OPTIMAL-BP; BP-TARGET with OPTIMAL-BP) are correctly qualified without smoothing over absent conflicts. The OPTIMAL-BP HARM classification is the most consequential call in this batch and meets the Modification 2 / NOR-TEST 2 Part A standard: DSMB-stopped, primary-endpoint harm, mechanistic corroboration. The JSX framing is semantically consistent with the evidence. The `doesNotProve` and `cautions` blocks correctly scope the claims; bedside pearls are actionable and match evidence strength.

## Required follow-ups

- **Editorial (non-blocking):** OPTIMAL-BP carries `specialDesign: 'negative-trial'` while `trialResult: 'HARM'`. The orchestrator should confirm with the schema owner whether a `'harm-trial'` `specialDesign` value should be added, or whether `'negative-trial'` is the intended archetype for safety-stopped trials. Either resolution is acceptable; this is not a clinical-content issue.
- **W5.2 wire-up (already tracked):** The six `claimId:` comment stubs will migrate to `CLAIM_REGISTRY` and `src/lib/citations/registry.ts` when W5.2 lands. No action required in this batch.
