# Clinical review — itemized cranial-autonomic chip split (Class D Stage 1)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** D-clinical (Stage 1 of ADR-2026-07-06 subtype-hierarchy build — condition #7 prerequisite)

## Scope
- Claims touched: none newly bound. Phenotype criteria affected (not new claim surfaces): `cluster-C`, `hc-C`, `ph-C`, `sunct-C` (present checks); `hypnic-E`, `psh-D` (absent checks).
- Citations affected: none (no citation record or `last_reviewed` touched).
- Surfaces changed: structured data in `src/data/` (chip defs + phenotype criteria), question-flow copy (`headacheQuestions.ts`) — teaching/label copy, not tagged claim surfaces.
- Evidence-verifier packet / trial-statistician: not applicable (structural chip split; no trial data or statistics).
- Files: `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/clinicHeadacheData.test.ts`.

## Semantic validity
Confirmed. `anyAutonomicFeature = bundled OR (three itemized)` makes the split purely additive: the bundled chip still satisfies every gate and itemized chips only add satisfaction paths, so no existing phenotype match changes (all 232 pre-existing tests pass unchanged; 4 new tests confirm itemized-chip parity for `cluster-C`/`sunct-C` and correct EMIT for `hypnic-E`/`psh-D`). Negated gates (`!anyAutonomicFeature`) correctly fail when ANY single itemized autonomic chip is present — a patient with only conjunctival injection is not mislabeled "no autonomic symptoms." Union of the three itemized chips reproduces the original bundled autonomic set with no ICHD-3 §3.3 C feature dropped or altered (conjunctival injection + lacrimation split out; nasal congestion, rhinorrhoea, eyelid oedema, sweating, miosis, ptosis all covered by `sym-other-cranial-autonomic`). Vocabulary is sufficient for the Stage-2 SUNCT-vs-SUNA resolver (§3.3.1 both CI+lacrimation vs §3.3.2 ≤1).

## Citation accuracy
No citation records changed. Chip labels/descriptions faithfully mirror the in-repo verified ICHD-3 §3.3 reference.

## Freshness
No `last_reviewed` field touched; no freshness refresh required for this structural change.

## Rationale
Backward-compatible additive refactor: the single bundled autonomic chip is split into three itemized chips whose OR-union equals the original, gated through a shared `anyAutonomicFeature` helper reused at every present- and absent-check. No phenotype match, claim binding, or citation changes; the split establishes the exact vocabulary ADR-2026-07-06 condition #7 requires for the Stage-2 SUNCT/SUNA resolver. Verified independently against repo files and the in-repo ICHD-3 reference; 236/236 tests green.

## Required follow-ups
- Stage 2 (SUBTYPE_RESOLVERS): the SUNCT-vs-SUNA resolver will introduce new subtype-label claim surfaces — those require §13.4 tagging and a fresh clinical-reviewer gate at that stage (ADR-2026-07-06 conditions 5–6). Not blocking for this PR.

## Verification state at gate time
- `npx vitest run` → 236/236 (232 pre-existing unchanged + 4 new itemized-parity tests); `tsc --noEmit` clean; `check:humanizer` PASS; `check:claims` pass.
