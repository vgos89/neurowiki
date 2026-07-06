# Clinical review — Hemicrania continua §3.4 C.2, Fix A-m6 (movement-aggravation satisfier)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (diagnostic-logic change) · headache clinic pathway engine

## Scope
- **Claims touched:** `clinic-headache-ichd3-hc-criteria` (§3.4 Hemicrania continua), criterion C. Anchors to `ichd3-2018`.
- **Citations affected:** `ichd3-2018` (within window; no `last_reviewed` refresh triggered — the change makes existing logic match an already-registered displayed claim).
- **Surfaces changed:** structured data in `src/data/` — the `hc-C` `Criterion.evaluate`/`contributingChips`, plus an editorial `teachWhenSelected` cross-reference on the shared `act-aggravated` chip.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/clinicHeadacheData.test.ts`.
- **Evidence-verifier packet / trial-statistician report:** not applicable.

## Semantic validity
ICHD-3 §3.4 C (verified reference, "## 3.4 Hemicrania continua" block): *"Either or both of: (1) ≥1 ipsilateral cranial autonomic symptom/sign; (2) a sense of restlessness or agitation, **or aggravation of the pain by movement**."* Pre-fix, `hc-C` displayed the movement-aggravation alternative in its label ("…OR restlessness/movement aggravation") and description ("…or aggravation by movement") but never honored it in `evaluate` (only `sym-autonomic-ipsilateral || sym-restlessness`). This under-called HC for any patient whose only C-feature was movement aggravation — a claim-vs-logic mismatch (§13.1) and the documented **m6** finding. The post-fix `evaluate` adds `|| has(s,'act-aggravated')`, making the logic match the displayed claim and the source disjunction.

**Semantic judgment on chip reuse (approved).** Reusing the existing `act-aggravated` chip is clinically acceptable and preferable to a dedicated chip: (a) faithful fit — the chip surfaces as "Makes it worse, or makes them avoid activity" and ICHD-3's own parallel §1.1 C.4 gloss is "aggravation by / causing avoidance of routine physical activity"; §3.4 C.2's "aggravation of the pain by movement" is the same clinical construct (physical activity/movement worsens the pain); (b) no conflation — `hc-C` is a demote-gate scoped to `hemicrania-continua` only, and cross-phenotype chip reuse is the engine's normal design (`sev-moderate`, `loc-unilateral` are shared), each phenotype gating independently on its own criteria; (c) a dedicated chip would add a redundant clinician-facing question with no discriminative gain. The reference's "add a movement-aggravation chip" note was a suggestion, not a mandate.

## Citation accuracy
No source, section, version, or quote changed. §3.4 C.2's "aggravation of the pain by movement" is explicit in the source and is exactly what `act-aggravated` now honors. The change reduces claim-vs-source drift.

## Freshness
`ichd3-2018` within its 24-month window. No `last_reviewed` refresh required or performed.

## Regression safety (confirmed by reviewer)
- **Scope containment holds.** A migraine patient who ticks `act-aggravated` cannot spuriously reach HC: `hc-A` (suppress-gate: `loc-unilateral && dur-continuous && pattern-ge-3-months`) and `hc-D` (suppress-gate + `hiddenUntilTrial: indo-tried-complete`, absolute indomethacin) both still apply as DROP-semantics gates.
- **Existing demote test still demotes** (§3.4 HC → Probable §3.5): selects no `act-aggravated`/autonomic/restlessness → `hc-C` still fails → probable at §3.5.
- **New positive test is sound:** hc-A trio + `sev-moderate` + `act-aggravated` (no autonomic/restlessness) + `indo-tried-complete` → full HC via the movement disjunct.

## Mandatory-block check
No conditions triggered. Source resolvable (pass); `quoted_text` supports the claim — §3.4 C.2 names "aggravation of the pain by movement" as an alternative satisfier (pass). Never-drift categories (strength/verbs/qualifiers/certainty/temporal) all unchanged or made *more* faithful.

## Rationale
Closes a claim-vs-logic mismatch by making `hc-C` honor the §3.4 C.2 movement-aggravation alternative it already advertised, via the already-surfaced `act-aggravated` chip. Regression-safe (HC laterality/continuity and indomethacin gates intact); faithful to the source disjunction; no never-drift violation; no mandatory-block condition.

## Required follow-ups
- None blocking.
- **Applied (was optional):** added a `teachWhenSelected` cross-reference on the `act-aggravated` chip noting it also satisfies §3.4 C.2, mirroring how `sym-restlessness` cross-references its multi-phenotype role.

## Verification state at gate time
- `npx vitest run src/data/clinicHeadacheData.test.ts` → 86/86 pass (incl. the new movement-path full-match test); full suite green.
- `npx tsc --noEmit` clean; `check:humanizer` PASS.
