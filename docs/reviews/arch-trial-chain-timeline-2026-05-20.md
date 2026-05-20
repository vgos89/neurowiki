# Architect review — Trial-chain timeline at bottom of trial pages

**Decision:** block
**Reviewed:** plan only (V approval recorded in-session 2026-05-20) + touched files (`src/data/trialData.ts`, `src/data/trialListData.ts`, `src/pages/trials/TrialPageNew.tsx`, `src/components/trials/RCTChainSection.tsx`, `src/components/trials/HistoricalContextSection.tsx`, `src/pages/dev/RCTChainTest.tsx`, `TASKS.md` lines 338–456, `docs/research/2026-05-19-trial-audit/00-README.md`, `docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md`)
**Reviewer:** system-architect
**Date:** 2026-05-20

## Rationale

V's feature ask is legitimate and the audit-derived chains in `docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md` §"Cross-trial timeline observations" (antiplatelet-acute, EVT five eras, EVT posterior, EVT MeVO, bridging-vs-direct, IVT tenecteplase, DOAC timing after AF) are the right product. The structural problem is that the plan proposes net-new primitives — `src/data/trialChains.ts` with a `TRIAL_CHAINS` map and a new `<TrialChainTimeline />` — when the repo already contains a TRIALS_SPEC v1.2 §7b implementation of the same idea:

1. `TrialMetadata.rctChain` field (`src/data/trialData.ts` lines 387–404) — typed predecessor list with `trialId`, `trialName`, `year`, `journal`, `n`, `designNotes`, `keyResult`, `whatWasMissing`, plus `chainName`, `chainNarrative`, `currentTrialResult`, `whatChanged`.
2. `RCTChainSection.tsx` — full component, vertical timeline, 4-card visible cap with expand, stub-footnote, mobile-aware. Dev harness at `src/pages/dev/RCTChainTest.tsx` and route `/dev/rct-chain-test`.
3. `TASKS.md` entries (lines 338–456) already enumerate the rollout: EVT 2015 chain (IMS-III/SYNTHESIS/MR RESCUE → MR CLEAN/ESCAPE/REVASCAT/EXTEND-IA/SWIFT PRIME/THRACE), ICH surgery chain, acute DAPT chain (MATCH/CHARISMA → CHANCE/POINT/INSPIRES), basilar EVT chain, hemicraniectomy chain. Predecessor trial stubs (W7.0 Priority 1–3) are scoped against the same primitive.
4. The primitive is, by design from TRIALS_SPEC §7b, **mutually exclusive with `historicalContext`** (Archetype G's single-arm benchmark surface) — that boundary is already drawn and respected in `TrialPageNew.tsx`.

What's missing — and what V's three shape questions actually surface — is **not a new primitive**; it is three targeted gaps in the existing one:

- **No bidirectional navigation.** `rctChain` lists predecessors. There is no `successorTrials[]` field, and the existing `successorTrialId` is a stub-page-only single-link mechanism. V's ask ("see what prior and next trial they want to read") needs forward links too.
- **No multi-chain membership.** A trial like THRACE belongs to both EVT-evolution and direct-vs-bridging chains. Current schema scopes one chain per trial as a 1:N relationship from current → predecessors.
- **No fork / parallel-cohort representation.** The 2015 EVT cluster (MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT) is functionally a parallel-publication cohort, not a strict linear chain. Honest representation needs a cohort/cluster marker.

Picking option (a) "new `trialChains.ts`" or option (c) "both" would create the third way to express trial lineage in this codebase, next to `rctChain` and the Archetype G `historicalContext` rows. Option (b) "fields on `trialData.ts`" is closer to the existing pattern but, as written, ignores that the typed nested structure already exists. The correct move is **(b)-modified: extend `rctChain` in place to cover successors + multi-chain + forks, and render the existing `RCTChainSection` from `TrialPageNew.tsx` (currently unwired).** This converts a green-field build (~7 files, new map, new component, new tests) into a scoped schema extension on a primitive that is already specced, built, and queued for rollout.

On the three options as posed:

- **#1 Data location.** None of (a/b/c) as worded. **(b')** Extend `rctChain` on `TrialMetadata`. Add an optional **`chainMembership: { chainId: string; role: 'predecessor' | 'cohort-member' | 'successor' | 'current' }[]`** sidecar field, keyed by a small enumerated `chainId` registry in `src/data/trialChainRegistry.ts` (chain *metadata* — name, narrative, ordering rule — only, no per-trial duplication). This (a) keeps trial-level claims with the trial (rubric 2), (b) supports multi-chain membership via array, (c) lets the timeline component derive prev/next by `chainId` lookup, (d) allows a chain registry of ~7 chains (89-trial backfill is bounded — most trials are 0- or 1-chain members; the audit doc already names every chain).

- **#2 Primitive shape.** None of (a/b/c) as worded. The clinical reality V correctly described — "somewhere between linear and graph" — is best served by **linear-with-cohort-markers** (option (c) "hybrid" in spirit, but expressed as `role` on `chainMembership` rather than divergence markers). Cohort members at the same era render as a row of sibling cards; predecessors and successors render as linear above/below. THRACE in two chains is handled by appearing in two `chainMembership` rows. This avoids a true graph (where prev/next become arrays and rendering complexity rises sharply) while still being honest about the 2015 cluster and the THRACE crossover.

- **#3 Composition.** Closest to **(a) shared component**, but use the existing `RCTChainSection` rather than a new `<TrialChainTimeline />`. The component already lazy-loads cleanly via React's existing patterns in `TrialPageNew.tsx` (sibling lazy charts at lines 14–30). Lazy (option c) is good practice and matches the existing precedent — fold it into the shared-component answer, no need to treat it as a separate option. Bundle-size impact: `RCTChainSection` is ~370 LOC, similar to `HistoricalContextSection`, well within budget if route-lazy. No new fetching needed — trial metadata for prev/next labels comes from `findTrialById` in `trialListData.ts`, which `TrialPageNew.tsx` already imports.

Audit chains to wire up (from `docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md`):
- **antiplatelet-acute**: MATCH/CHARISMA → CHANCE → POINT → THALES → CHANCE-2 → INSPIRES (CAPRIE, ESPS-2, PRoFESS as foundational stubs per the audit's "missing trials")
- **evt-anterior**: IMS-III/SYNTHESIS/MR RESCUE → {MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT, THRACE} → {DAWN, DEFUSE-3} → {SELECT2, ANGEL-ASPECT, RESCUE-Japan LIMIT} → {LASTE, TENSION}
- **evt-mevo**: ESCAPE-MeVO, DISTAL (sibling pair, 2025)
- **evt-bridging**: DIRECT-MT → DEVT → {SKIP, MR CLEAN-NO IV, SWIFT-DIRECT, DIRECT-SAFE}
- **hemicraniectomy**: DECIMAL, DESTINY, HAMLET → DESTINY II
- **basilar-evt**: BEST → BASICS → {ATTENTION, BAOCHE}
- **carotid**: SAPPHIRE → EVA-3S → SPACE → ICSS → CREST → ACT-1 → CREST-2 (NB: audit flags CREST/CREST-2 as not yet in catalogue — schema lands first, data follows per §6 Class E)
- **ivt-tenecteplase** and **doac-after-af** also documented in the audit, can ship in a second wave

Rubric scoring:

| # | Item | Score | Rationale |
|---|---|---|---|
| 1 | Duplication risk | **block** | Plan introduces a third trial-lineage primitive next to `rctChain` (TRIALS_SPEC §7b, fully built, in `RCTChainSection.tsx`) and Archetype G `historicalContext`. No migration path proposed for `rctChain` — it would silently become dead code. |
| 2 | Boundary integrity | **concern** | New `trialChains.ts` puts chain narrative copy (a clinical claim surface per §13.3) in a fresh data file outside the established `trialData.ts` ↔ `TrialMetadata` ↔ `claims.ts` triangle. The existing `rctChain.chainNarrative` field already lives where claim tagging conventions point. |
| 3 | Composability | **concern** | New `<TrialChainTimeline />` solves a problem `RCTChainSection` already solves (vertical timeline, predecessor cards, expand cap, stub footnote, mobile). No note in the plan acknowledging the existing component or stating why it cannot be extended. |
| 4 | State locality | **pass** | Plan keeps state local to the chain component (read-only data + expand toggle). No global store or context proposed. Matches existing component pattern. |
| 5 | Dependency weight | **pass** | No new external packages proposed. Routing and lazy-loading patterns reuse existing React/Vite primitives in `TrialPageNew.tsx`. |
| 6 | Migration exit | **block** | 89 trial entries in `trialData.ts`; plan does not state how many will be touched, in what order, or what the rollback looks like if the schema choice proves wrong. `TASKS.md` already records that the related W7.0 stubs (CAPRIE/ESPS-2/PRoFESS analogues for other chains) are queued as separate Class E tasks. Touching schema + data + UI + a new file in one PR is an explicit §6 Class D criterion and needs a phased rollout or feature flag, neither of which is in the plan. |

One block in rubric item 1 and one in item 6 → overall **block**. Both are resolvable.

## Required follow-ups

1. **Revise the plan to extend `rctChain` rather than create `trialChains.ts`.** Specifically: (a) add optional `chainMembership[]` to `TrialMetadata` (chainId + role); (b) add a small `src/data/trialChainRegistry.ts` exporting `TRIAL_CHAINS: Record<ChainId, { name; narrative; orderingHint; }>` for chain *metadata only*; (c) wire `RCTChainSection` (or a thin successor-aware extension of it) into `TrialPageNew.tsx` driven by `chainMembership`; (d) leave existing `rctChain.predecessors[]` in place — `chainMembership` can be derived from it for predecessors, while successors are looked up at render time across other trials' `chainMembership` arrays.
2. **State the cohort representation explicitly.** Plan should specify whether cohort members (MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT, THRACE in 2015) render as a horizontal row or as collapsible group. Component change to `RCTChainSection` is small but needs design intent stated before code.
3. **State multi-chain rendering explicitly.** When a trial is rendered at the bottom of its detail page, does it show one chain ("primary"), all chains tabbed, or stacked? V's THRACE example forces a decision.
4. **Phase the rollout.** Land schema + registry first behind a per-trial render guard (`if (trial.chainMembership?.length) render`), then wire chains one at a time per audit doc order, smallest first (hemicraniectomy: 4 trials, all already present). The audit-documented hemicraniectomy and basilar-EVT chains are good first migrations because every member is already in the catalogue — no predecessor-stub work blocking. Antiplatelet and EVT-anterior require resolving the audit's "missing trials" list (CAPRIE, ESPS-2, PRoFESS, RESCUE-Japan LIMIT, EXTEND-IA TNK) first, which is **already queued as separate Class E tasks** in `TASKS.md` and should not be conflated with the timeline-component work.
5. **Out-of-scope flag honored.** Plan correctly excludes visual mockup. Confirm the mockup will run through `design-prototyper` → `ui-architect` per §19, and that any new clinical claim text in `chainName` / `chainNarrative` / per-cohort copy routes through `medical-scientist` → `clinical-reviewer`. Each chain narrative is a clinical claim surface (§13.3) and needs a registered `claimId` mapped through `src/lib/citations/claims.ts`. **Route the clinical portions of this plan (chain narratives, cohort descriptions, per-trial keyResult/whatWasMissing strings) to `clinical-reviewer` before execution.**
6. **Build-time drift check.** A `scripts/check-trial-chains.ts` (Node, no new deps) that asserts every `chainMembership.chainId` exists in `trialChainRegistry.ts` and every `successor` referenced by a chain points to a real `TRIAL_DATA[id]`. Hooks-vs-CI per §13.5: run in pre-commit since it is fast.
7. **TASKS.md reconciliation.** The existing W6.9 / W7.0 entries (lines 338–456) are scoped against `rctChain` predecessors only. If this work proceeds, those entries need an explicit "extended to cover successors via `chainMembership`" note, or a §3 supersession statement, to keep the §7 ledger consistent.

## Blocking issues

1. **Parallel implementation of a primitive that already exists.** TRIALS_SPEC v1.2 §7b primitive (`TrialMetadata.rctChain` + `RCTChainSection.tsx` + dev harness) is shipped but unwired. The plan does not acknowledge it. Resolution path: revise plan per Required follow-up #1 above. The extension approach delivers V's stated feature (prev + next navigation, lineage view at bottom of trial page) using the existing primitive plus a narrow `chainMembership` addition for forward links and multi-chain membership. Estimated change in scope: ~one schema field + one registry file + wiring in `TrialPageNew.tsx` + minor `RCTChainSection` extension for successors, vs the plan's new file + new component + new map.

2. **No migration / rollback note for a change spanning schema + data + UI across 89 trials.** §6 Class D requires this; §17.1 reviewer cannot approve without it. Resolution path: add a phased rollout per Required follow-up #4 above, plus a per-trial render guard so partial rollout never breaks a trial page that lacks chain data.
