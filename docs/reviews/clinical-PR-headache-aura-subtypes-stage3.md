# Clinical review — Class D Stage 3a: migraine-with-aura subtypes (§1.2.1–.4)

**Decision:** approve-with-conditions (condition C1 + advisory-2 applied pre-commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** D (structural, ADR-2026-07-06 Stage 3) · clinical-correctness gate (safety-copy focus)

## Scope
- **Claims touched:** `clinic-headache-ichd3-aura-subtypes` (new).
- **Citations affected:** `ichd3-2018` (`quoted_text` + `section` expanded with §1.2.1–.4).
- **Surfaces changed:** static JSX (`data-claim` span), structured data (`SUBTYPE_RESOLVERS` + subtype labels/sections/notes), derived language at render (`HeadacheResultV4.tsx` subtype label + amber safety-note line), `q-aura` options.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`, `src/data/clinicHeadacheData.test.ts`.

## The two SAFETY notes (highest-stakes item) — both CONFIRMED sound
- **Hemiplegic (§1.2.3):** "Motor-weakness aura. Exclude stroke or a structural cause first; refer for genetic evaluation (familial hemiplegic migraine) and specialist review." Faithful — the FHM genetic dimension is supported by the named subforms; the stroke-exclusion steer is a correct diagnosis-of-exclusion posture ("exclude … first"), appropriately urgent without over-claiming. Action verbs "exclude"/"refer" are safety-additive, not diagnostic verdicts.
- **Retinal (§1.2.4):** "Monocular visual disturbance. Exclude other causes of transient monocular visual loss (amaurosis fugax, retinal artery occlusion, optic neuropathy) before attributing it to migraine." Faithful and appropriately conservative — §1.2.4 requires excluding amaurosis fugax; the two additional named mimics are standard members of the transient-monocular-visual-loss differential; correctly encodes retinal migraine's diagnosis-of-exclusion nature. No never-drift-category drift.

Neither note over-reaches into treatment or fabricates urgency.

## Semantic validity — precedence, parent, binding
- **Precedence** (motor → retinal → brainstem → typical) is clinically correct: §1.2.2 brainstem aura requires "no motor or retinal symptoms," so ranking hemiplegic and retinal ahead honors both exclusions (motor+brainstem → hemiplegic; retinal+brainstem → retinal; both asserted/derivable from tests).
- **Parent never suppressed:** resolver runs after `strength` is finalized, spread as `...(subtype ? { subtype } : {})`; never touches `phenotypeId`/`matchStrength`/membership. Parent §1.2 criteria (aura-A/B/C) unchanged. The aura resolver always returns a subtype for a matched parent (every matched aura is at least typical) — correct.
- **Claim binding resolves:** `clinic-headache-ichd3-aura-subtypes` → `ichd3-2018`; `quoted_text` + `section` (1.2.1–1.2.4) present; `HiddenClaimMarkers` span present.

## Condition + advisories — resolved pre-commit
- **C1 (condition, resolved):** the §1.2.2 `quoted_text` clause had dropped the source's "at least two brainstem symptoms" gate. **Fixed:** `quoted_text` now reads "aura with at least two fully reversible brainstem symptoms (…), but no motor or retinal symptoms."
- **Advisory 2 (resolved):** the resolver discriminated brainstem on a single `aura-brainstem` boolean, which the verified reference warns over-calls. **Fixed:** the `aura-brainstem` chip + `q-aura` option are reframed to "Two or more brainstem symptoms (…)" with a `teachWhenSelected` stating "ICHD-3 1.2.2 requires at least two brainstem symptoms; a single brainstem symptom does not qualify." The single boolean now legitimately encodes the ≥2 gate as a clinician-judged composite (the same pattern the pre-itemization autonomic chip used), and this brainstem subtype carries no safety note. The claim description also updated to "at least two brainstem symptoms."
- **Advisory 3 (no action):** the `aura-retinal` single-boolean coarsening is safe-direction — it can only over-apply the conservative "exclude vascular causes" note, the correct posture for an under-specified monocular presentation.

## Freshness
`ichd3-2018` `last_reviewed: 2026-05-25`, window 24 months — within window; no §13.6 refresh triggered.

## Mandatory-block check
None triggered — the safety copy is faithful, no evidence conflict smoothed, citation resolves, `quoted_text` supports the safety claims as written (and now the brainstem clause verbatim), the review artifact exists, no trial/statistics packet applies.

## Rationale
The two safety-referral notes — the highest-stakes surface — are clinically sound and faithful, the precedence honors the ICHD-3 exclusions, and the pass is purely additive (parent untouched, 242 prior tests unchanged, 5 new subtype tests). The single fidelity gap (brainstem "≥2" dropped from `quoted_text` + the coarse boolean) was corrected pre-commit at both the citation record and the chip encoding.

## Verification state at gate time (post-fix)
- `npx vitest run` → 247/247; `tsc --noEmit` clean; `check:humanizer` PASS; `check:claims` pass; production build 171/171 prerendered (subtype + amber safety-note render).
