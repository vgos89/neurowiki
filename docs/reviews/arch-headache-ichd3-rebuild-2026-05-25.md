# Architect review — Headache ICHD-3 rebuild (no PR # yet, pre-execution Class D-clinical)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (medsci audit 2026-05-25 + `src/data/clinicHeadacheData.ts` + `src/pages/ClinicHeadachePathway.tsx` + `PathwayCategoryRow.tsx` + `PathwayMultiCheckRow.tsx` + `PathwayRail.tsx`)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-27

## Rationale

The audit's clinical fixes are sound and the existing data shape carries most of them without restructuring. The `Phenotype` interface (id, ichd3Section, criteria[], hiddenUntilTrial, suppressIfContinuous) already has the right joints — adding three phenotypes (1.3, 3.2, 3.3), six chips, and one section-label fix is a pure additive change on a clean shape. The harder structural choices are (1) generalising the `hiddenUntilTrial` gate, which today is a literal lookup of `hc-D`'s first contributing chip and will break the moment a second indomethacin phenotype appears, (2) the multi-diagnosis surfacing, which is page-layer not evaluator-layer and is the only real cross-boundary question in scope, and (3) the evaluator API extension to return contributing chip labels per met criterion. Recommended: ship the new phenotypes + section-label fixes + suppression-narrowing + indomethacin multi-gate refactor as Phase 1; ship the multi-diagnosis page rebuild + selection-mapping drawer as Phase 2 behind the same `main` deploy but with a phased commit boundary so a revert of either phase is clean. The §1.4.1 status migrainosus add is the cleanest deferral — it shares chips with §1.3 but adds nothing the §1.3 fix doesn't already exercise, so defer per the audit's "should add" framing.

## Rubric scoring

1. **Duplication risk — pass.** No parallel infra. New phenotypes slot into `HEADACHE_PHENOTYPES`, new chips into the `ChipId` union + `HEADACHE_CHIP_GROUPS`. The evaluator API extension (per-criterion `contributingChipLabels`) reuses the existing `contributingChips: ChipId[]` field — no new shape.
2. **Boundary integrity — pass with one note.** Evaluator stays pure (React-free, JSX-free). Adding `contributingChipLabels` to the returned `metCriteria` is a legitimate evaluator concern: the evaluator already owns the criterion→chip map; resolving the *labels* belongs in the same module, not in the page.
3. **Composability — pass.** Three phenotypes + six chips. The new TAC duration chips fit cleanly under a new `tac-detail` chip group with `defaultCollapsed: true`.
4. **State locality — pass.** No new global state. `HeadacheState` in the page already holds everything; new fields for §1.3 belong next to existing `lifetimeAttacks`.
5. **Dependency weight — pass.** No new packages.
6. **Migration exit — concern.** Phase 1 touches ~5 files; Phase 2 adds drawer + row component changes. Rollback path is a single `git revert` on each phase commit. Required: phase boundary in commits + rollback note in PR body per §16.

## Required follow-ups

- **Condition 1 (blocking before execution):** convert `hiddenUntilTrial?: boolean` to `hiddenUntilTrial?: { gateChip: ChipId }` and update the evaluator gate accordingly. Without this, adding 3.2 PH alongside 3.4 HC will silently never surface either, because the current literal lookup hardcodes `hc-D`.
- **Condition 2:** PR must be split into two phase commits — (a) evaluator + chips + tests + citations + reopen-bug + scroll-margin; (b) multi-diagnosis page surfacing + selection→criterion mapping in drawer. Each commit independently passes Gate 6 live-verify. Each commit independently revertable.
- **Condition 3:** add a `describe('Suppression rules', …)` cross-phenotype test block covering the four phenotypes that must NOT be suppressed on `dur-continuous` (1.3, 3.4, 4.10) and the four that MUST (1.1, 1.2, 2.2, 3.1).
- **Condition 4:** new TAC chips land in a new `tac-detail` chip group with `defaultCollapsed: true` rather than appended to the existing `pattern` group.
- **Condition 5:** route clinical portions to `clinical-reviewer` per §17.2 before execution. The §2.3 D fix and §1.3 add are the highest-risk surfaces. Specifically verify: (a) the §2.3 D `sym-nausea-mild` / `sym-nausea-moderate-severe` split against the ICHD-3 verbatim in the audit; (b) the §1.3 criterion C disjunction; (c) the §4.10 section-label change does not break any existing `data-claim` mapping in `claims.ts`.
- **Condition 6:** confirm the `ichd3-2018` `quoted_text` expansion vs entry-splitting decision with `data-architect` per audit recommendation. Either is acceptable; the decision must be recorded in the PR body so §13.6 review-checklist tracking is unambiguous.
- **Non-blocking:** §1.4.1 Status migrainosus deferral confirmed.
- **Non-blocking:** §A1.6.6 vestibular migraine criteria expansion needs Lempert 2012 retrieval; mark `blocked:awaiting-source` in TASKS.md. Section-number relabel ships in Phase 1 regardless.

## Blocking issues

None — decision is approve-with-conditions. Conditions 1–3 must be addressed in the implementation plan before code is written; conditions 4–6 must be addressed before merge.
