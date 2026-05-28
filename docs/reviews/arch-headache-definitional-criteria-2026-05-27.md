# Architect review — headache evaluator definitional criteria

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-27

## Rationale

The plan adds an optional `definitional?: true` flag to the `Criterion` interface in `src/data/clinicHeadacheData.ts` and updates `evaluateHeadachePhenotypes` to drop a phenotype from matches when any definitional criterion fails. The change is correctly scoped: pure data + pure evaluator, no JSX, no cross-module reach. Page-level empty-match fallback lives in `src/pages/ClinicHeadachePathway.tsx`, not synthesized inside the evaluator.

Composability concern: after this change the evaluator has four phenotype-suppression mechanisms — `hiddenUntilTrial`, `episodicPhenotypes` continuous-suppression, §2.3 Note 1 chronic-migraine-suppresses-chronic-TTH, and now `definitional`. The `hiddenUntilTrial.gateChip` is semantically "the gate chip is a definitional criterion." A future refactor could unify, but doing so in this PR widens scope. Accept the redundancy with a code comment so the next maintainer does not add a fifth mechanism.

Boundary integrity passes. Migration exit clean (revert = `git revert`). No new dependencies. Pattern scales linearly to new phenotypes — risk is forgetting to tag definitionals on a new phenotype, mitigated by a dev-time assertion (Required follow-up #5).

Drop-entirely behavior (vs surfacing `matchStrength: 'none'` for explainability) is correct: the existing pipeline already filters `'none'` at the return site, and per-phenotype "you missed definitional X" UI would be scope creep. The page-level "No clean ICHD-3 primary-headache match" fallback covers the explainability need.

## Required follow-ups

1. **Document the redundancy.** Add a comment on the `Phenotype` interface noting that `hiddenUntilTrial.gateChip` and `definitional: true` criteria overlap for HC/PH (indomethacin) — both enforced is idempotent; future maintainer should consider unification rather than adding a fifth gating mechanism.
2. **Confirm idempotence on hc-D / ph-E.** These are both the `hiddenUntilTrial.gateChip` and would be tagged `definitional: true`. Both checks lead to "phenotype not in matches" — no conflict. Add a dedicated test row asserting the double-enforcement is harmless.
3. **Page-level fallback lives in the page.** Evaluator stays pure and returns `[]`. `ClinicHeadachePathway.tsx` renders "No clean ICHD-3 primary-headache match" when the result array is empty.
4. **Expand the test matrix** before merge:
   - V's exact failing input → vestibular migraine NOT in matches.
   - For each of 11 phenotypes: a row where exactly one definitional criterion fails → phenotype absent.
   - For each of 11 phenotypes: a row where all definitionals pass but a non-definitional fails → phenotype present as `partial` or `probable`.
   - Empty-matches input → page-level fallback path triggers (assert empty return).
   - NDPH `onset-single-sudden` regression: input `onset-single-sudden + dur-continuous + pattern-ge-3-months` → NDPH NOT a full match.
   - HC + PH: existing `hiddenUntilTrial` behavior unchanged after `definitional` tag.
5. **Dev-time guard for missing-definitional regression.** Add a test-level assertion: every phenotype in `HEADACHE_PHENOTYPES` must have ≥1 criterion with `definitional: true`. If a future phenotype is added without flagging any criterion definitional, the test fails and the author is forced to be explicit.
6. **Clinical sign-off required.** The *choice* of which criteria are definitional is a clinical judgment, not a structural one. Route to clinical-reviewer §17.2 (done in parallel with this review).

## Blocking issues

None.
