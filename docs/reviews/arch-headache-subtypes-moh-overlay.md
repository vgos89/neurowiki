# Architect review — headache ICHD-3 subtypes + MOH overlay (design-only)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (design review; no implementation exists yet)
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-07-06
**ADR:** [ADR-2026-07-06-headache-subtypes-moh-overlay.md](../adrs/ADR-2026-07-06-headache-subtypes-moh-overlay.md)

## Rationale
The recommended design is a **post-evaluation subtype pass** for subtypes and a **separate overlay-detector pass** for MOH — both additive, both operating on the engine's existing `PhenotypeMatch[]` output rather than mutating the phenotype loop or the `Phenotype` record shape. This is the right call: (1) **Duplication (pass)** — it reuses the proven `evaluate → band → deriveConflict` separation (each a pure, React-free pass introducing no new clinical claim); a subtype pass and overlay pass are the same pattern applied twice more, not a third competing classifier. (2) **Boundary integrity (pass)** — the engine stays the single owner of "does this phenotype match"; subtype resolution is a refinement over an already-matched parent and MOH is a co-occurrence overlay, so both belong downstream, keeping clinical logic out of UI (`HeadacheManagement.tsx`/`HeadacheResultV4.tsx` consume `subtype?`/`overlay?`, they don't compute it). (3) **Boolean-flag anti-pattern avoided** — subtype/overlay data attaches to the *output* via a dedicated resolver, so no `isSUNCT`/`isHemiplegic` on the `Phenotype` record and no new `case` per subtype in the six `phenotypeId` switch sites.

The reason this is approve-with-conditions rather than approve: the subtype pass **must not change the identity or count of existing matches** (the 211-test suite is the contract). Adding a subtype label to the single `sunct-suna` parent match is additive; but migraine-with-aura subtypes touch safety (hemiplegic → genetic referral, retinal → exclusion), so the pass must degrade gracefully to the parent label when discriminating chips are absent, never suppress the parent. MOH-as-overlay is blocked on two tracked prerequisites (B-2 + overuse-days vocabulary). This is Class D that additionally touches clinical logic, so the clinical portions must clear the `clinical-reviewer` gate before execution.

## Required follow-ups
1. Prerequisite ordering non-negotiable — MOH overlay blocked until B-2 + overuse-days chips (`blocked:awaiting-B-2`).
2. `subtype` = new optional field on `PhenotypeMatch`; do NOT overload `phenotypeId` (all six switch sites assume it is parent identity).
3. Extend the dev-time invariant to the resolver (defined parent fallback for every input; emitted subtype `section` resolves).
4. Overlay = distinct field/structure (`overlays` beside `matches`), NOT a 12th phenotype.
5. Route clinical portions to `clinical-reviewer` (§17.2): SUNCT/SUNA discriminator verbatim vs §3.3.1/.2; hemiplegic/retinal safety copy; MOH thresholds + "code alongside."
6. New claim-surface check (§13.3/§13.4) for subtype labels + MOH banner; tag at composition site if assembled from fragments.
7. Itemize the autonomic chip once (`sym-conjunctival-injection` + `sym-lacrimation` + other), backward-compatible (bundled = OR of itemized); verify no existing TAC match changes.

## Blocking issues
None. The design fits the existing engine → pass → display layering, avoids the boolean-flag anti-pattern, and is additive. The conditions must be satisfied during implementation, but none is a structural defect in the recommended approach.
