# Architect review — Migraine pathway JSX rebuild

**Decision:** approve-with-conditions
**Reviewed:** plan only + spot reads of `MigrainePathway.tsx`, `PathwayBottomDrawer.tsx`, `CalculatorDrawer.tsx`, `PATHWAY_SPEC.md` §4.9/§4.10, EVT architect review precedent, migraine fix manifest, migraine UX audit
**Reviewer:** system-architect
**Date:** 2026-05-16

## Rationale

The plan is well-scoped, names a single file rewrite (`src/pages/MigrainePathway.tsx`), explicitly consumes (does not extend) existing `src/components/pathways/*` primitives, and routes through both §17.1 and §17.2 gates before execution. It correctly cites spec §4.9 (live cocktail summary in drawer State B) and §4.10 (differential routing screen) as architectural anchors for the two genuinely new patterns, and it keeps state colocated rather than extracting `usePathwayState` — matching the EVT review's ruling that n=1 cross-pathway state shapes are structurally distinct and don't justify a shared hook. The state shapes the plan retains (`RedFlags`, `SafetyState`, `CocktailState`, `AddOnsState`) confirm that ruling: nothing in migraine's tri-valued safety + parallel cocktail state maps to EVT's `Inputs` shape.

Structural risks concentrated in three places: (1) the plan's step order places safety screening *after* cocktail assembly, which contradicts the UX audit's explicit Step 3 (safety) → Step 4 (cocktail) sequencing; (2) `PathwayBottomDrawer`'s current prop contract does not accept arbitrary children, but §4.9 requires the drawer to render a custom cocktail summary inside State B — the plan is silent on whether `PathwayBottomDrawer` grows a new content slot; (3) the plan lists 7 Class E items but tags itself "D-clinical with Class E aspects" — that's more Class E content than EVT's 4 items, and the §17.2 pre-execution gate must list them by claim ID before any code is touched.

None are blockers — all are answerable in plan revisions before V approves execution.

## Composability assessment

- **Rail at 7 steps** — acceptable but at upper edge. Locked-state placeholder discipline becomes load-bearing.
- **Drawer composition** — `PathwayBottomDrawer` needs `customContent?: React.ReactNode` slot for §4.9 cocktail rendering (Path A — the right call). Path B (compose `CalculatorDrawer` directly) violates EVT architect follow-up #8.
- **Cluster card extraction** — inline-keep in `MigrainePathway.tsx` for n=1; flag as trade-off; extract to shared module if future cluster pathway emerges.
- **Differential routing terminal vs in-pathway** — clean composition via §4.10 prescription (same component, drawer state distinguishes terminal vs in-pathway). Pass.
- **State shape divergence** — `SafetyState` + `CocktailState` + `AddOnsState` (with `gonb`) does not converge with EVT's `Inputs` shape. ARCH-3 ruling holds: no `usePathwayState` extraction until n≥3 pathways with overlapping shapes.

## Required follow-ups

1. **Reconcile step order with UX audit.** Plan order is "differential → red flags → triage → cocktail → safety → response → discharge." UX audit places SAFETY as Step 3 *before* cocktail. Either move safety to Step 3 (matches audit + 4C/ID scaffolding rationale), or document explicit rationale for keeping safety post-cocktail (e.g., auto-deselect cascade preserves UX). Don't ship inversion silently.

2. **`PathwayBottomDrawer` extension contract for §4.9.** Commit to Path A: add `customContent?: React.ReactNode` slot to `PathwayBottomDrawerProps`. Migraine passes cocktail summary node; other pathways continue using `reasons`/`notes`. `PathwayBottomDrawer.tsx` moves from "consumed" to "Files touched" (one new optional prop + conditional render branch).

3. **List Class E claim IDs in §17.2 pre-execution artifact.** 7 Class E items minimum: A1 GONB Level A, A2 antiemetic flip, A3 ketorolac 45→60, A4 dex 4→8 floor, A6 valproate 750→800, B1 cluster terminal content, B2 MOH screening logic, B5 second-line rescue expansion (chlorpromazine/DHE/GONB-rescue). Each gets a claim ID + citation. C-clinical items can gate post-implementation per §11.

4. **Logic-preservation rule** (mirror EVT ARCH-1). The migraine file has ~600 lines of existing clinical logic (`generateSummary`, the `useEffect` at line 189 that cascades safety→cocktail removal, the 11 safety→drug rules). State: this logic is **lifted verbatim first**, then mutated for the 7 Class E items. The 15 C-clinical items are append-only. A reviewer must be able to diff old and new and see one Class E change at a time.

5. **Scope the indigo→neuro sweep explicitly.** Plan says "throughout" but Files touched lists only `MigrainePathway.tsx`. Indigo also appears in `LearningPearl.tsx`, `Thrombectomy.tsx`, `StatusEpilepticusPathway.tsx`, `article/Trial.tsx`. State: "Sweep scoped to `MigrainePathway.tsx` only; cross-file indigo usage tracked separately." Avoid half-done migration creating cobalt-vs-indigo pathway inconsistency.

6. **Vitest unit test coverage.** Test file `src/pages/__tests__/MigrainePathway.interpret.test.ts` must cover: (a) safety state auto-removes contraindicated drugs from cocktail; (b) differential routing terminal-state transitions; (c) MOH screen trigger conditions; (d) second-line rescue gating logic. Pure-function tests, no React rendering.

7. **`last_reviewed` §13.6 checklist** — 6-step checklist (source resolves, version current, dependent claims consistent, no wording drift, newer evidence considered, dual sign-off) documented before refresh.

8. **Drawer cocktail count `collapsedStat` budget.** §4.9 requires `collapsedStat: "Cocktail · {N} drugs"` (≤40 chars per §5.3). Worst case ~"Cocktail · 8 agents" — 19 chars, safe. Note in brief.

## Blocking issues

None.
