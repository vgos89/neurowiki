# Architect review — trial full-eligibility + Study-Arms accordion

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (`trialData.ts` interface region; `TrialPageNew.tsx` 88–112, 500–546, 826–864, 9908–9970; `BottomLineDrawer.tsx`; `package.json`; `src/components/ui/`)
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-06-08

## Rationale

The schema shape is sound: optional, additive, backward-compatible; grouped
`CriteriaGroup[]` correctly preserves the source's general-vs-imaging structure that a
flat list would destroy. Boundary integrity, composability, state locality, and
dependency weight all pass — no new dependency (the existing bespoke `BottomLineDrawer`
chevron/`useState` pattern is reused; no Radix). Two facts in the original plan were
corrected during review: (a) the population render is one orphaned inline copy plus a
shared helper consumed by ~120 archetype call sites — the helper already *is* the
consolidation, so the edited surface is small; (b) a structured per-arm render already
exists in the legacy path (`TrialPageNew.tsx:9908–9970`), so `armDetails` would be a
third arm representation unless convergence is recorded. With the arm-representation
convergence decided and recorded (ADR), the structural shape is correct.

## Required follow-ups

1. **Duplication framing corrected** in plan + ADR §3: orphan inline copy is the only true
   duplicate; the helper (~120 call sites) is the consolidation target. ✔ recorded.
2. **Arm-representation convergence** decided + recorded: `armDetails` canonical; new
   accordion renders iff present; legacy `9908–9970` block guarded to render only when
   `armDetails` absent (no double display); legacy retired as trials migrate. ✔ ADR §2.
3. **ADR written** (`ADR-2026-06-08-trial-eligibility-and-arm-detail.md`) covering schema
   additions, arm convergence, rollback. ✔.
4. **Clinical gate before merge** (Class D-clinical): per-trial NCT-verification,
   verbatim-criteria fidelity, provenance/`retrieved` accuracy → `clinical-reviewer`
   §17.2 artifact for the pilot batch. NINDS forced down the publication branch (its
   `NCT00000292` resolves to an unrelated NIDA cocaine study). → obligation for execution.
5. **Accessibility sign-off** on the new disclosure must be explicit, not inherited:
   `BottomLineDrawer` is a portal drawer, not a semantic inline disclosure, so its ARIA is
   not a drop-in template. New component needs button + `aria-expanded` + controlled
   region + keyboard/focus, signed off by `accessibility-specialist`. → obligation for
   execution.

## Blocking issues

None. Conditions 1–3 resolved pre-execution (plan + ADR). Conditions 4–5 are routing
obligations for the clinical and accessibility gates during execution.
