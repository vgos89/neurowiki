# Clinical review — Class D Stage 2: ICHD-3 subtype resolver (SUNCT/SUNA + cluster episodic/chronic)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** D (structural, ADR-2026-07-06 Stage 2) · clinical-correctness gate (ADR conditions 5-6)
**Architect artifact:** [arch-headache-subtypes-moh-overlay.md](arch-headache-subtypes-moh-overlay.md)

## Scope
- **Claims touched:** `clinic-headache-ichd3-tac-subtypes` (new).
- **Citations affected:** `ichd3-2018` (`quoted_text` + `section` expanded with §3.1.1/§3.1.2/§3.3.1/§3.3.2).
- **Surfaces changed:** static JSX (`data-claim` span in `HiddenClaimMarkers`), structured data (`SUBTYPE_RESOLVERS` + subtype labels/sections), derived language at render (`HeadacheResultV4.tsx` "Subtype: {label} · {section}"), chip `teachWhenSelected` for the 2 new cluster chips.
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/clinicHeadacheData.test.ts`, `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/components/pathways/headache/HeadacheResultV4.tsx`.
- **Evidence-verifier packet / trial-statistician:** not applicable (guideline-criteria classification pass from the in-repo verbatim ICHD-3 text).

## Semantic validity
All four subtype discriminators are verbatim-faithful to the `ichd3-2018` `quoted_text`, across all five never-drift categories:
- **§3.3.1 SUNCT** — resolver requires BOTH `sym-conjunctival-injection` AND `sym-lacrimation`. Source: "with both conjunctival injection AND lacrimation." Conjunctive qualifier preserved.
- **§3.3.2 SUNA** — resolver returns SUNA when the SUNCT conjunction fails but `anyAutonomicFeature` is true. Source: "one or neither of conjunctival injection and lacrimation, plus other cranial autonomic features." Confirmed: because the parent only matches when `sunct-C` (suppress-gate, `anyAutonomicFeature`) passes, a matched parent always yields sunct or suna and is never subtype-less — a §3.3 match with autonomic-but-not-both-CI+lacrimation is genuinely SUNA by definition.
- **§3.1.1 Episodic cluster** — keys on `cluster-remission-ge-3mo`; label "bouts separated by pain-free remissions of 3 months or more." Source: "separated by pain-free remission periods of 3 months or more." Temporal endpoint (≥3 months) preserved.
- **§3.1.2 Chronic cluster** — keys on `cluster-no-remission-or-lt-3mo`; label "a year or more with no remission, or remissions shorter than 3 months." Source: "for 1 year or more without remission, or with remission periods lasting less than 3 months." Both temporal constraints + disjunction preserved.

No fabricated criteria. **No drift in the parent §3.1/§3.3 criteria** — the parent evaluators (`cluster-A/B/C/D`, `sunct-A/B/C/D`) are unchanged; `anyAutonomicFeature` still OR-includes the bundled chip, so no prior TAC match identity or count changes.

**Parent never suppressed:** confirmed structurally. The resolver runs only after `strength` is finalized (full/probable), is spread as `...(subtype ? { subtype } : {})`, and touches neither `phenotypeId`, `matchStrength`, `criteriaMet/Total`, nor removes the match. The parent-fallback test (no remission chip → `matchStrength: 'full'`, `subtype: undefined`) proves a subtype-less parent still surfaces as full. Not forcing a subtype when the bout/remission pattern is unknown is clinically correct.

## Citation accuracy
`ichd3-2018` `quoted_text` contains the verbatim §3.1.1/§3.1.2/§3.3.1/§3.3.2 definitions; `section` lists them. The claim maps to `ichd3-2018` and the source text supports every clause of the `description` and every rendered label. The `HiddenClaimMarkers` `data-claim="clinic-headache-ichd3-tac-subtypes"` span binds the derived subtype language at the composition site (per §13.4 template-string rule — tag at the composition site, not the fragments).

## Freshness
`ichd3-2018` `last_reviewed: 2026-05-25`, window 24 months — within window; §3.1.1/.2/.3.3.1/.2 read verbatim from the in-repo source this session; no §13.6 refresh triggered.

## Rationale
Every discriminator is a verbatim-faithful mapping of the ICHD-3 §3.1.1/§3.1.2/§3.3.1/§3.3.2 definitions now in `quoted_text`; the two temporal cluster gates and the SUNCT conjunction are preserved exactly with no drift. The pass is purely additive — never mutating parent identity, strength, or membership (proven by the unchanged 236 prior tests + the parent-fallback test) — and the new claim surface is correctly bound. No mandatory-block condition triggered.

## Required follow-ups
- None blocking. **Advisory:** when Stage 3 adds the migraine-with-aura subtypes, route them through this same gate — the §1.2.x hemiplegic/retinal safety-referral copy is a higher-drift-risk surface than the TAC subtypes reviewed here.

## Verification state at gate time
- `npx vitest run` → 242/242 (236 prior unchanged + 6 new: SUNCT/SUNA/cluster-episodic/chronic + parent-fallback); `tsc --noEmit` clean; `check:humanizer` PASS; `check:claims` pass; production build 171/171 prerendered.
