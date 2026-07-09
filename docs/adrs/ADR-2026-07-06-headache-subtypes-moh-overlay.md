# ADR-2026-07-06: Headache ICHD-3 subtype resolution + MOH overlay via post-evaluation passes

**Status:** Accepted (V-approved 2026-07-06; fully implemented Stages 1–4, 2026-07-06→08)
**Date:** 2026-07-06
**Deciders:** V (final), system-architect (structural, approve-with-conditions), clinical-reviewer + medical-scientist (clinical gate on the clinical portions)
**Architect review artifact:** [arch-headache-subtypes-moh-overlay.md](../reviews/arch-headache-subtypes-moh-overlay.md)

## Context

`evaluateHeadachePhenotypes` (`src/data/clinicHeadacheData.ts`) returns a ranked list of **independent, mutually-exclusive-at-the-primary-level** `PhenotypeMatch` objects, one per ICHD-3 primary entity. The `Chip`/`Criterion` model is strong and extensible — new diagnoses drop in as new phenotypes with new chips (additive, Class E). Two ICHD-3 shapes do **not** fit the flat phenotype array:

- **Subtypes** — a matched parent must resolve to a leaf *output*: SUNCT vs SUNA (§3.3.1/.2, the blocked A-M2), migraine-with-aura typical/brainstem/hemiplegic/retinal (§1.2.1–.4, with hemiplegic/retinal carrying referral + safety implications), cluster episodic vs chronic (§3.1.1/.2). The array has no hierarchy.
- **MOH** (§8.2) — a *co-occurrence overlay* coded **alongside** the primary phenotype, not instead of it. The engine loop assumes primary entities are independent/exclusive; MOH is neither.

The workplan feasibility note is explicit: both need structural change + an ADR, and **boolean flags on `Phenotype` must be avoided** — they spread special-casing across ~6 switch sites (`HeadacheManagement.tsx` `switch(phenotypeId)` + `MANAGED` set; `headacheBanding.ts` `CHAPTER_ORDER`/`STRENGTH_RANK`; `PROBABLE_SECTION_FOR`; `EMIT_CRITERION_IDS`; the `episodicPhenotypes` list; `deriveHeadacheConflict`; `HeadacheResultV4.tsx` keying/`hasVM`).

## Decision

Add two **additive, pure, post-evaluation passes** over the engine's existing output, mirroring the established `evaluate → band → deriveConflict` layering:

1. **Subtype resolver pass.** For parents that declare subtypes, a resolver keyed off criteria/chips the engine already evaluates emits an optional `subtype?: { id: SubtypeId; label; section }` field on the `PhenotypeMatch`. `phenotypeId` is unchanged (parent identity preserved for all downstream keying). The resolver **always** returns a defined parent fallback when subtype-discriminating chips are absent — it never suppresses the parent. SUNCT vs SUNA: both `sym-conjunctival-injection` AND `sym-lacrimation` → SUNCT; ≤1 → SUNA (requires the itemized-autonomic-chip split, A-M2 prerequisite). Implemented as an external map `SUBTYPE_RESOLVERS: Partial<Record<PhenotypeId, (selected) => Subtype>>` — no new `case` arm per subtype in any of the six switch sites.

2. **Overlay detector pass.** `detectOverlays(selected)` returns `Overlay[]` (initially just MOH) as a **separate structure beside `matches`**, not a 12th phenotype and not a flag on any `PhenotypeMatch`. MOH surfaces alongside whatever primary the engine ranked. **Blocked** until Track B-2 (remove `rf-painkiller-overuse` from the red-flag short-circuit) and the overuse-days chip vocabulary land.

Both passes extend the dev-time module-load invariant (defined-fallback / resolvable-section guarantees).

## Consequences

**Easier:** subtypes/overlays become additive (a new subtype = one resolver entry; a future overlay = one `detectOverlays` branch); safety wins (hemiplegic/retinal referral copy, MOH "code alongside") hang off new optional fields without touching the ranking engine; the 211-test engine contract is preserved (passes run *after* the engine, whose match identities/counts do not change).

**Harder / to revisit:** two new optional fields widen the display contract (`HeadacheResultV4.tsx` + `HeadacheManagement.tsx` render them, additive JSX); new claim surfaces (subtype labels, MOH banner) require §13.4 tagging; the itemized-autonomic chip split touches cluster/HC/PH `contributingChips` and must be backward-compatible (bundled chip = OR of itemized) and re-verified against the suite.

## Alternatives considered

- **A. Post-evaluation subtype pass + separate overlay pass (RECOMMENDED)** — additive; mirrors existing `band`/`conflict` passes; parent identity + test-contract preserved; avoids boolean flags.
- **B. Parent-child `Phenotype` records** — rejected: explodes the flat array, forces new arms in every switch site, collides with the X.5 exclusion clause + maps, changes match counts (breaks the 211-test contract), and still doesn't solve MOH.
- **C. Subtype resolver attached to the `Phenotype` record** — viable, kept as fallback; the external `SUBTYPE_RESOLVERS` map (A) is preferred so phenotype declarations stay pure ICHD-3 criteria and the resolver layer is independently testable/removable.
- **D. Boolean flags on `Phenotype`** — rejected per the workplan's explicit anti-pattern warning.

## Migration / rollback

Additive — no existing `PhenotypeMatch` identity, `matchStrength`, or count changes, so the 211-test contract holds unchanged (new tests added; none edited). Subtype is a new optional field and overlays are a new sibling structure, so both passes are independently revertible (delete resolver/detector modules + their two render sites → today's parent-only behavior, zero engine change). `git revert` is clean (no schema migration, no shared-abstraction rename). A per-pass config boolean each is recommended as cheap insurance for the first ship given the safety-relevant subtypes.

## Conditions (from the architect review — must be satisfied during implementation)

1. **Prerequisite ordering:** MOH overlay blocked until B-2 + overuse-days chips ship (`blocked:awaiting-B-2`).
2. **`subtype` is a new optional field on `PhenotypeMatch`; do not overload `phenotypeId`** (all six switch sites assume `phenotypeId` = parent identity).
3. **Extend the dev-time invariant** to the resolver (defined parent fallback for every input; emitted subtype `section` must resolve).
4. **Overlay is a distinct field/structure, not a phenotype** (`overlays` beside `matches`, via `detectOverlays`).
5. **Route the clinical portions to `clinical-reviewer`** (§17.2): SUNCT/SUNA discriminator verbatim vs §3.3.1/.2; hemiplegic/retinal safety copy; MOH thresholds + "code alongside" instruction.
6. **New claim surface check** (§13.3/§13.4) for subtype labels + MOH banner; tag at the composition site if assembled from fragments.
7. **Itemize the autonomic chip once, reuse everywhere:** split `sym-autonomic-ipsilateral` into `sym-conjunctival-injection` + `sym-lacrimation` (+ other) as a backward-compatible additive change (bundled = OR of itemized); verify no existing TAC match changes.

## Action items (build order)

1. [ ] A-M2 prerequisite: itemized-autonomic chip split (backward-compatible).
2. [ ] `SubtypeId` union + optional `subtype?` on `PhenotypeMatch`; `SUBTYPE_RESOLVERS` map + defined fallback; extend dev-time invariant. Ship SUNCT/SUNA + cluster ep/chronic + aura subtypes.
3. [ ] Track B-2 (remove `rf-painkiller-overuse` from red-flag short-circuit) + overuse-days chips, THEN `detectOverlays` → MOH overlay.
4. [ ] Additive render in `HeadacheResultV4.tsx` + `HeadacheManagement.tsx`; tag new claim surfaces.
5. [ ] `clinical-reviewer` §17.2 gate on SUNCT/SUNA, hemiplegic/retinal copy, MOH thresholds before merge.
