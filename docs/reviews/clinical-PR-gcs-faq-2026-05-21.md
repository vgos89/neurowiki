# Clinical review — PR gcs-faq-2026-05-21

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-21

## Scope
- Claims touched: 6 new FAQ entries under `PAGE_FAQS['/calculators/glasgow-coma-scale']` (GCS normal score, coma threshold, intubated scoring, TBI severity bands, component reporting rationale, pediatric GCS)
- Citations affected: none new — content drawn from established textbook + Brain Trauma Foundation/AANS + Teasdale-Jennett source material. FAQ schema entries are SEO surfaces summarizing well-established clinical conventions, not novel claims requiring new registry IDs.
- Surfaces changed: structured data in `src/seo/schema.ts` (FAQPage JSON-LD) — non-rendered SEO surface, but user-facing via Google rich results, so reviewed as a clinical claim surface per §13.3. Also visible on the GCS calculator page via the DiscreteFAQ accordion at page bottom.
- Evidence-verifier packet: not applicable — no new trial data or guideline-version claims
- Trial-statistician report: not applicable

## Semantic validity
Confirmed all six entries:
- Q1: GCS 15 = maximum, components E/V/M reported separately — matches modern reporting standard.
- Q2: Coma conventionally ≤8 (Teasdale-Jennett 1974); intubation threshold heuristic correctly framed as multifactorial, not GCS-driven alone.
- Q3: Verbal = 1T notation, "GCS 7T (E2 V1T M4)" format correct; explicit prohibition against assigning V=5 in intubated patient matches standard practice.
- Q4: BTF/AANS bands mild 13–15 / moderate 9–12 / severe 3–8 are current and correct.
- Q5: Component-reporting rationale (same total ≠ same neurologic state) is textbook; aphasic-stroke vs metabolic-encephalopathy example is fair and educationally accurate.
- Q6: Pediatric GCS verbal modification (5=coos/babbles … 1=none) matches Reilly/Simpson pediatric scale; age cutoff "~2 years" appropriately hedged.

## Citation accuracy
No registry citations added or modified. The content is drawn from generally-accepted clinical reference (Teasdale & Jennett, Lancet 1974; Brain Trauma Foundation severity classification; Pediatric GCS per Reilly et al.). If a future Class E task elevates these FAQ entries to in-app calculator interpretation text, formal citation registry entries should be added then.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
No `last_reviewed` fields touched. New FAQ schema content authored 2026-05-21.

## Rationale
Six FAQ entries authored from established GCS reference material — Teasdale-Jennett coma definition, BTF/AANS TBI severity bands, standard T-suffix intubation convention, and Pediatric GCS verbal modifications. All five never-drift categories preserved: no recommendation-strength inflation (hedges "conventionally," "commonly cited," "informs … not rigid" are intact), no action-verb upgrades, qualifiers preserved (adult vs pediatric demarcated; intubation context gated), certainty markers maintained (no correlation→causation drift), and scoring conventions (T-suffix, ≤8, 13–15/9–12/3–8) match current standards. Content is well-established textbook material; surfaced via SEO FAQPage JSON-LD and visible DiscreteFAQ accordion. Approve.

## Required follow-ups
- If any of these Q&A entries later surface inside the GCS calculator interpretation card (rendered scoring-result surface), promote to Class E and add corresponding `CLAIM_REGISTRY` entries with citations to Teasdale-Jennett (1974) and BTF/AANS severity classification.

## Blocking issues
None.
