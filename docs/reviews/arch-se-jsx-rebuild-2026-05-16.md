# Architect review — SE pathway JSX rebuild

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect
**Date:** 2026-05-16

## Rationale

The plan inherits all the right scaffolding from EVT — Pattern A primitives reused without re-fork, state colocated per ARCH-3, atomic single-commit Patch Strategy 2, rollback-by-revert clean because the surface is stateless. The fix manifest is comprehensive and the dependence on `humanizer` + verbatim caveat preservation is correctly imported from the EVT precedent. Structural risk is concentrated in four places: (1) the `calculateDose(agent, weight)` signature change to take `patient` reads as cleaner than the alternatives but couples a pure formula function to a UI state shape — a separate `calculateBzdDose(patient, agent)` is the better cut because RAMPART is a *categorically different dosing scheme* (fixed-dose-by-band, not weight×coefficient) and conflating them inside one function buries the clinical model; (2) `getRecommendedAgent` is being replaced by an unspecified function — the plan says "remove the hierarchy" but never states what the new function returns, which matters because the §4.7 outcome row, the §4.8 dose row, and the Stage 2 override picker all consume its output; (3) the new Stage 4 super-refractory branch + B2 NORSE routing card + B3 eclampsia branch + B4 thiamine/pyridoxine empiric flags add three to four new top-level decision branches in one commit, and the plan currently treats them as inline patches rather than as a stage shape — without a stated `Stage` discriminated-union or equivalent, the file risks growing a fourth ad-hoc state pattern that the next pathway (Migraine) inherits; (4) §4.7 outcome row and §4.8 dose result row are spec-canonical *visual patterns* and the plan correctly consumes them in JSX, but the plan does not state whether they get extracted to `src/components/pathways/PathwayOutcomeRow.tsx` + `PathwayDoseResultRow.tsx` primitives — and Migraine's §4.9 (live cocktail) explicitly cross-references §4.8's copy behavior, so leaving §4.7/§4.8 inline-only in SE re-introduces the duplication risk the EVT primitive extraction was designed to prevent. None are blockers; all are answerable in plan revisions before V approves execution.

## Required follow-ups

1. **CALC-1 — Split, do not extend `calculateDose`.** Keep `calculateDose(agent, weight)` for 11 weight×coefficient cases. Add NEW `calculateBzdFixedDose(patient, agent)` for RAMPART band-scheme (10 mg if >40 kg, 5 mg if 13–40 kg, "consult pediatrics" if <13 kg). Two named functions, separate Vitest cases.

2. **CALC-2 — Specify `getEligibleAgents` return shape:**
   ```ts
   type EligibleAgent = {
     id: Agent;
     name: string;
     status: 'preferred' | 'avoid' | 'caution';
     reason?: string;
   };
   const getEligibleAgents = (comorbidities: Comorbidities): EligibleAgent[]
   ```
   Returns Tier-1 ESETT-equivalent options (lev/fos/VPA). No hierarchy implied by array order. Lacosamide added to Stage 3 adjunct only.

3. **STAGE-1 — Name state discriminator before rebuild:**
   ```ts
   type Stage = 'stabilization' | 'benzo' | 'urgent' | 'refractory' | 'super-refractory';
   type Branch = 'eclampsia' | 'norse' | 'ncse-routeout' | null;
   ```
   Eclampsia → parallel terminal (mag load → 1g/h). NCSE → terminal route-out. NORSE → inline modifier within Stage 3+. Add non-goal: "No `usePathwayState` hook at n=2."

4. **PRIM-1 — Extract `PathwayOutcomeRow.tsx` + `PathwayDoseResultRow.tsx`** as primitives in `src/components/pathways/`. Migraine §4.9 cross-references §4.8 copy behavior; inline-keeping re-introduces duplication risk. Prop contracts specified in full review text.

5. **STATE-1 — Restate "no `usePathwayState` hook" as binding for SE.** ARCH-3 ruling stands at n=2.

6. **NCSE-1 — `patient.convulsive` verified local-only.** No external readers. Safe to remove. Add to acceptance checks.

7. **TEST-1 — Augment Vitest coverage** with 6 specific test cases: (a) `getEligibleAgents` no-hierarchy baseline; (b) `getEligibleAgents` lacosamide `avoid` flag under cardiac; (c) `calculateBzdFixedDose` band edges; (d) Stage 4 transitions reachable from Stage 3 failure; (e) NCSE route-out terminates rail; (f) Eclampsia branch produces mag load before benzo escalation.

8. **CLIN-ROUTE — 10 Class E items** (not 2): A1, A2, A3, A4, A5, A6, B1, B2, B3, B4. Clinical-reviewer §17.2 must cover all 10.

## Composability assessment

- **Right cut:** Rail, CategoryRow, BranchChip, CascadeNotice, LearningPearl, BottomDrawer — all reusable as-is.
- **Extract before SE ships, not after:** §4.7 OutcomeRow and §4.8 DoseResultRow per PRIM-1.
- **No `usePathwayState` at n=2:** SE state shape (Stage + Branch + 3 stage-agent slots + 2 success booleans + comorbidities + renal + step3-checklist) is structurally distinct from EVT.
- **Split `calculateDose`:** RAMPART is fixed-dose, not weight-based — different clinical model.
- **State-machine shape — named before rebuild, not discovered during it.**

## Blocking issues

None.
