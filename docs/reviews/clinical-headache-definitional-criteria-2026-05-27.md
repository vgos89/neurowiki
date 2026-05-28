# Clinical review — clinic-headache-definitional-criteria

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-27

## Scope
- Claims touched: `clinic-headache-ichd3-*` phenotype evaluator (criterion gating logic only — no claim text rewrites). All criterion `label` and `description` strings remain unchanged; only the evaluator's treatment of a flagged subset of criteria changes from "contributory toward partial match" to "definitional / required for any match."
- Citations affected: `ichd3-2018` (read-only — verified against verbatim `quoted_text` block in registry; no refresh required).
- Surfaces changed: §13.3 — `src/data/clinicHeadacheData.ts` structured-data phenotype objects (criterion `definitional?: boolean` tag) + evaluator gating logic + page-level empty-match fallback string.
- Evidence-verifier packet: not applicable — no new trial, no new citation, no new statistic.
- Trial-statistician report: not applicable.

## Semantic validity

Every proposed definitional flag verified against verbatim ICHD-3 `quoted_text` in `registry.ts`. Standard applied: a criterion is "definitional" only if ICHD-3 phrases it such that, without it, the diagnosis cannot hold even probabilistically — i.e. not a 2-of-4 character pool, not an associated-symptom enrichment, but a gating element of the phenotype itself.

**Verified APPROVE for:** mig-B, mig-D, aura-B, cm-A, cm-C, tth-B, tth-D, ctth-A, ctth-B, ctth-D, cluster-B, cluster-C, ph-B, ph-C, ph-E, sunct-B, sunct-C, hc-A, hc-C, hc-D, ndph-A, ndph-B, vm-A.

**Counter-flag findings:**
- **mig-A (≥5 attacks)** is *also* definitional under ICHD-3 1.1 A, but flagging would block the §1.5 Probable migraine pathway that ICHD-3 explicitly provides for. Correctly left unflagged.
- **cm-B (≥5 prior migraine attacks)** is verbatim a "must have had" gate under ICHD-3 1.3 B. Preference: flag definitional + add test that cm-A → cm-B holds in chip vocabulary. **CONDITION 1.**
- **cluster-D / ph-D (bout-frequency)** are hard ICHD-3 criteria but cannot be surfaced via chips at a between-bouts encounter. Leaving unflagged is correct provided code comments document the rationale. **CONDITION 2.**

**NDPH-B tightening (drop `onset-single-sudden`):** verified against verbatim text "Distinct and clearly-remembered onset, with pain becoming continuous and unremitting within 24 hours." `onset-single-sudden` is thunderclap territory (SNNOOP10), not NDPH onset. APPROVE the drop.

**Vestibular migraine §A1.6.6:** flagging vm-A definitional closes V's reported bug. Full Bárány/Lempert 2012 expansion (criteria B and C) deferred to a separate Class E task. **CONDITION 3.**

## Citation accuracy

`ichd3-2018` — verified:
- Source resolves: ichd-3.org URL valid; PMID 29368949 valid.
- Year/section: 2018, sections in scope (1.1, 1.2, 1.3, 2.2, 2.3, 3.1, 3.2, 3.3, 3.4, 4.10, A1.6.6) all present.
- `quoted_text` verbatim: contains exact ICHD-3 wording for every section flagged. No paraphrase drift.
- `last_reviewed`: 2026-05-25 (2 days old). Window 24 months → expires 2028-05-25.
- No new citation IDs needed.

## Editorial / expert context

Not applicable — no new trial entry in this PR.

## Freshness

`ichd3-2018`: PASS. Within window by 23 months 28 days.

## Rationale

A clinically-sound correction of a known false-positive failure mode: equal-weighting criteria that ICHD-3 itself treats as gating produces partial matches on selections clinically incompatible with the diagnosis (V's reported phonophobia-only → vestibular migraine 50% example). Every proposed flag verified against verbatim ICHD-3 in `quoted_text`. NDPH-B tightening is a strict improvement. Vestibular migraine fix closes V's bug without requiring full Lempert 2012 expansion (appropriately deferred). No claim text modified — labels and descriptions unchanged.

## Required follow-ups

- **Condition 1 (cm-B):** flag definitional + add test demonstrating cm-A → cm-B in chip vocabulary.
- **Condition 2 (cluster-D / ph-D):** code comments on `cluster-headache` and `paroxysmal-hemicrania` phenotype objects noting frequency criteria D are intentionally non-definitional because between-bouts encounters cannot surface bout-frequency; clinician must verify D from history.
- **Condition 3 (vestibular migraine):** open TASKS.md PENDING/L4 item "vestibular-migraine §A1.6.6 full criteria expansion (Lempert 2012)" with status `blocked:awaiting-source-retrieval`.
- **Page-level fallback wording:** "No clean ICHD-3 primary-headache match — consider secondary causes or atypical phenotype" is **safe** and should remain neutral. Do NOT add an explicit SNNOOP10 pointer — red-flag chip group with own short-circuit already exists on the same page.
- **Test coverage** (Class D-clinical artifact requirement):
  (a) phonophobia-only + bilateral pressing + <15 min → vestibular migraine NOT in results;
  (b) every newly-flagged definitional: selection satisfies all OTHER criteria but fails the definitional one → phenotype excluded;
  (c) NDPH ndph-B with `onset-single-sudden` only → NDPH excluded;
  (d) Chronic migraine all met → 'full' + chronic TTH suppressed.
