# Clinical review — SELECT2 / RESCUE BT NIHSS inclusion-chip correction

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-22

## Scope
- Claims touched: none in `CLAIM_REGISTRY` re-mapped. Two `inclusionCriteria` display chips corrected on curated trial records `select2-trial` and `rescue-bt`. No `claimId`-tagged surface altered (RESCUE BT's tagged surfaces `rescue-bt-ordinal` and `rescue-bt-bedside` untouched).
- Citations affected: none re-pointed. SELECT2 (NCT03876457, `fullEligibility` retrieved 2026-06-08); RESCUE BT (JAMA 2022, DOI 10.1001/jama.2022.12584, ChiCTR-IOR-17014167, retrieved 2026-06-08).
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts`, inclusion-criteria chip arrays only.
- Evidence-verifier packet: this session (SELECT2 PMID 36762865 / NCT03876457 registry + NEJM Methods; RESCUE BT JAMA Methods), source-anchored, High confidence.
- Trial-statistician report: not applicable — no statistic, effect size, or archetype touched.

## Semantic validity
Both edits are qualifier corrections that move the chips toward source truth and now agree with the previously verified `fullEligibility` blocks:
- **SELECT2:** added `'NIHSS ≥6'`. Matches `fullEligibility` Clinical item `'NIHSS score ≥ 6'` and the Sarraj NEJM 2023 Methods. Chip placement is cosmetic. The pre-stroke mRS chip was correctly left at `0–1` per source; the batch-3 review's separate 0–2 concern did not reproduce and no mRS change was made.
- **RESCUE BT:** replaced unsupported `'NIHSS 4 or greater'` with `'NIHSS ≤30'`. Matches `fullEligibility` item `'NIHSS score 30 or less (range 0 to 42)'`. The removed lower floor was a curation artifact with no source support; removing it corrects a fabricated qualifier rather than dropping a real one.

No recommendation strength, action verb, certainty marker, temporal constraint, scoring, statistic, effect size, archetype, or citation was modified (confirmed by reading the surrounding `safetyProfile`, `howToInterpret`, `bedsidePearl`, `legend`, and `fullEligibility` blocks, all unchanged).

## Citation accuracy
No citation re-pointed or re-worded. Both corrected chips are consistent with the source Methods already cited on each record.

## Editorial / expert context
Not applicable — no new-trial entry; enrichment/correction of two shipped records, no Class-E logic change.

## Freshness
No `last_reviewed` touched. Landmark 2022–2023 trials within window. Pass.

## Rationale
Low-risk display-string accuracy correction bringing two curated inclusion chips into agreement with their own June-verified `fullEligibility` blocks and the cited source Methods. One edit restores an omitted real criterion (SELECT2 NIHSS ≥6); the other deletes an unsupported fabricated floor (RESCUE BT NIHSS lower bound). Both improve fidelity to the evidence. No never-drift violation, no unresolved-source or synthesis conflict. Approve, no conditions.

## Required follow-ups
- Optional (non-blocking): consider rendering the RESCUE BT chip as `'NIHSS ≤30 (no lower limit)'` for bedside clarity. Current chip is source-accurate and the `fullEligibility` range note already disambiguates.
