# Architect review — PR #TBD (pre-implementation plan review)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: Claude Opus 4.7)
**Date:** 2026-06-04

## Scope

Stage One of the clinic headache pathway rebuild — Class D (experience/wiring only).

- Rewrite `src/pages/ClinicHeadachePathway.tsx` to the approved v4 mockup (`docs/specs/mockups/headache-pathway-v4-flow.html`, Frames 1 Safety / 2 Question+live-differential / 3 Result).
- Wire the existing matching engine `src/data/clinicHeadacheData.ts` behind new screens. Engine and its 66-test contract `src/data/clinicHeadacheData.test.ts` are untouched (the import boundary enforces this — the test imports only from the engine).
- New pathway-specific components under a greenfield `src/components/pathways/headache/`. Shared `src/components/pathways/Pathway*` primitives are composed, never edited.
- Route unchanged: `App.tsx` line 53 (lazy default import) / line 106 (slug map) — in-place rewrite of the same default-exported component needs no route change (verified).
- No clinical logic and no new clinical *wording* in Stage One. All new result/safety sentences and the band words ("Leading/Possible/Less likely") are deferred to Stage Two (Class E-clinical, clinical-reviewer pre-execution gate).

## Rationale

The plan's spine is structurally sound and low-risk. The engine is a genuinely pure, React-free module with a table-driven 66-test contract that imports only from `clinicHeadacheData.ts`; a front-end rewrite cannot touch the regression contract as long as the engine file and its public exports (`evaluateHeadachePhenotypes`, `anyRedFlagActive`, `HEADACHE_CHIP_GROUPS`, `RED_FLAG_CHIPS`, `HEADACHE_PHENOTYPES`, `getChip`, the `PhenotypeMatch` shape) are not edited. "Engine untouched, tests green" is enforced by the import boundary, not just discipline. The single most valuable move in the plan — deleting the parallel display constants (`RED_FLAGS`, `PATTERN_OPTIONS`, `DURATION_*`) and the `chipsFromState()` translator (page line 171) — retires a real second source of truth that today silently re-encodes chip semantics (e.g. `chipsFromState` maps `location==='orbital'` to two chips and collapses `onset-recurrent-same` onto a UI toggle). The plan removes that duplication rather than adding a fourth way to do the same thing.

Risk is concentrated in two new config files. `headacheInterviewQuestions.ts` reintroduces a structure over the chip vocabulary — benign only if it carries pure `ChipId[]` references and zero chip semantics, pinned by a drift guard; without the guard a renamed/removed chip id compiles cleanly and fails silently at runtime. The clinical-claim boundary is the second risk: the mockup's band words and "set aside — needs confirmation" tray copy are new display vocabulary that does not exist anywhere in the engine (confirmed: zero matches). The engine exposes neutral, already-reviewed primitives (`matchStrength`, `criteriaMet`/`criteriaTotal`, `displaySection`). The D-vs-D-clinical boundary is holdable but convention-enforced, so it must be made checkable: every word a clinician could act on lives in `headacheResultCopy.ts`, and the four components import copy rather than inlining it. Both risks convert from honor-based to checkable via the conditions below. No structural blockers.

## Required follow-ups (all folded into the Stage One plan before execution)

1. **Drift-guard test for the question config.** Add a test asserting (i) every `ChipId` referenced in `headacheInterviewQuestions.ts` resolves in `HEADACHE_CHIP_GROUPS`, and (ii) the referenced chips cover every non-red-flag scorable chip. Mirrors the engine's existing data-integrity block (`clinicHeadacheData.test.ts:300-311`). *Checkable: test exists and fails when a referenced id is renamed.*
2. **Answer-card labels resolve through `getChip(id).label`** at render — never copied into the question config. *Checkable: grep `headacheInterviewQuestions.ts` for chip label strings; there should be none (ids + UI metadata only).*
3. **Clinical-copy isolation made checkable.** The four components in `src/components/pathways/headache/` contain no clinical sentences and no band words; all such strings live in `headacheResultCopy.ts`. *Checkable at Stage Two: grep the four component files for guideline/management prose.*
4. **Band-label decision — RESOLVED: defer to Stage Two.** "Leading/Possible/Less likely" do NOT ship in Stage One. Stage One renders the neutral, already-claim-reviewed primitives (`criteriaMet of criteriaTotal` + `displaySection`) as placeholders; band words and all result sentences are ratified under the Stage Two clinical-reviewer gate. This keeps Stage One Class D (no new clinical claim).
5. **State shape — RESOLVED: flat siblings + orchestrator `useState`.** Orchestrator owns `selected: Set<ChipId>`, a `phase` enum, and a current-question index; derived `matches` via `useMemo(() => evaluateHeadachePhenotypes(selected), [selected])`. The four components are flat siblings under the page; props pass one level. No module-level store, no page-outliving React context.
6. **Specialist-group disclosure — RESOLVED: always-available optional, static core.** The core ~6 questions are a fixed, static sequence (matches the mockup's fixed 6-dot progress + always-on "See result"). The engine's six `defaultCollapsed` specialist groups (`aura`, `vestibular`, `indomethacin`, `tac-detail`, `chronic-migraine-detail`, `red-flags`) surface as an always-available optional "add detail" disclosure — never as answer-dependent path branching. This deliberately avoids the rejected a8117aa adaptive-interview failure mode.
7. **Claim-surface continuity + cross-cutting wiring.** Treatment links out (product owner's call), so the result panel ships no management claim prose; the inline management cards (~13 `data-claim` surfaces in the current page) are replaced by links to existing management content. Continuity (no clinical claim lost) is verified at the Stage Two clinical-reviewer gate, and that gate owns all Stage Two clinical surfaces (result sentences, band words, secondary-cause disclaimer, citation footer). Cross-cutting wiring (`recordView`, `useFavorites`, `useNavigationSource`, `useRecents`) is preserved through the rewrite. *Checkable: grep the new orchestrator for all four hooks.*

## Blocking issues

None. The plan is structurally approvable; the seven conditions are folded into the plan and convert the two real risks (config drift, clinical-copy leakage) to checkable gates before Stage One execution begins.
