# Clinical review — PR faq-phase2-2026-05-21

**Decision:** approve (both conditions resolved before merge)
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-21

## Scope

- Claims touched: 20 new clinical Q&A entries in `src/seo/schema.ts`
  - PAGE_FAQS additions (4 routes × 3 Q&A = 12 pairs): `/guide/meningitis`, `/guide/gbs`, `/guide/multiple-sclerosis`, `/guide/headache-workup`
  - QUESTION_META additions (16 entries): tpa-timing, lvo-evt, anticoagulation, hemicraniectomy, bp-control, dapt, basilar-evt, ich-surgery, msu-dispatch, icas-stenting, tnk-vs-alteplase, direct-vs-bridging, pfo-closure-cryptogenic, asymptomatic-carotid, ich-anticoagulation-reversal, crao-management
- Citations affected: implicit references to AHA/ASA 2026 stroke guideline, AHA/ASA 2022 ICH guideline, IDSA 2004 bacterial meningitis, McDonald 2017, AAN 2011 PLEX, AAN 2018 MS relapse, and named trials whose PMIDs already exist in trialData.ts (NINDS, ECASS-3, WAKE-UP, EXTEND, TRACE-III, TIMELESS, HERMES, DAWN, DEFUSE-3, SELECT2, ANGEL-ASPECT, LASTE, TENSION, RESCUE-Japan LIMIT, ELAN, TIMING, OPTIMAS, DECIMAL, DESTINY, HAMLET, DESTINY II, CHARM, ENCHANTED, INTERACT4, OPTIMAL-BP, BP-TARGET, BEST-II, INTERACT-2, ATACH-2, CHANCE, POINT, THALES, CHANCE-2, INSPIRES, SPS3, BEST, BASICS, ATTENTION, BAOCHE, STICH I/II, MISTIE III, ENRICH, B-PROUD, BEST-MSU, SAMMPRIS, WEAVE, AcT, TRACE-2, ORIGINAL, EXTEND-IA TNK, NOR-TEST 2 Part A, RAISE, DIRECT-MT, DEVT, SKIP, MR CLEAN-NO IV, SWIFT-DIRECT, DIRECT-SAFE, CLOSE, RESPECT, REDUCE, CLOSURE-I, CREST, CREST-2, Sarode 2013, PATCH, ANNEXA-4, ANNEXA-I, EAGLE, THEIA, de Gans/van de Beek 2002, Perry BMJ 2011, Walgaard EGRIS, Hughes Cochrane IVIG/PLEX, TREAT-MS).
- Surfaces changed: §13.3 — JSON structured data (PAGE_FAQS, QUESTION_META) rendering both visible FAQ accordion text and FAQPage JSON-LD.
- Evidence-verifier packet: not applicable (synthesis FAQ; no new trial-data display archetypes added)
- Trial-statistician report: not applicable (no new NNT, p-value, or trial display archetype)

## Semantic validity

Confirmed across all 20 entries — no never-drift category violations:

1. **Recommendation strength.** COR/Class language preserved exactly where used. EVT large-core as COR 1 (matches 2026 AHA/ASA). Hemicraniectomy ≤60y COR 1, >60y COR 2a (matches guideline). Late-window IVT COR 2a (DWI-FLAIR, perfusion) vs COR 2b (LVO-no-EVT-expertise) preserved. AAN 2011 PLEX as Class I, Level A (accurate). PATCH platelet transfusion as COR 3: Harm per AHA/ASA 2022 ICH (condition #2 — applied).
2. **Action verbs.** Appropriately hedged: "can be considered," "is reasonable," "is recommended," "supports," "may benefit" — no upgrade of "consider/suggest" to "treat/administer."
3. **Qualifiers and gates.** Eligibility constraints preserved: pre-stroke mRS 0–2 for EVT, ASPECTS ranges, age stratification for hemicraniectomy, CYP2C19 LOF for CHANCE-2, PFO closure age <60 with shunt/septal aneurysm criteria, minor stroke NIHSS ≤3 / TIA ABCD2 ≥4 for DAPT, SPS3 lacunar-stroke duration boundary, CT-before-LP criteria from IDSA — all intact.
4. **Certainty markers.** "Directionally favored" for THEIA, "Neutral" for BEST/BASICS, "Pooled evidence favors" for direct-vs-bridging, "Supports an early high-efficacy strategy" for TREAT-MS — all appropriate hedges. No correlation→causation laundering.
5. **Temporal constraints.** All windows preserved precisely: 0–3h, 3–4.5h, 4.5–9h, 6–24h; ≤6h CT sensitivity for SAH (Perry); 12h–2w xanthochromia; 48h hemicraniectomy; 21-day DAPT; ELAN day-3-4/6-7/12-14 framework; 60-min antibiotic target for meningitis; 10–20 min dexamethasone pre-antibiotic; no window swaps.

Where trials disagreed (direct-vs-bridging 6 RCTs; basilar EVT BEST/BASICS vs ATTENTION/BAOCHE), the Q&A explicitly names the disagreement rather than averaging it.

## Citation accuracy

Each named trial maps to a known publication with correct year and primary-endpoint summary. Trial-name spellings verified (RESCUE-Japan LIMIT, ESCAPE-MeVO, MR CLEAN-NO IV, ANNEXA-I). Numeric spot-checks: SAMMPRIS 14.7%/5.8% at 30 days; WEAVE 2.6% at 72h; Sarode 4F-PCC vs FFP noninferiority; CREST-2 P=0.02 stenting / P=0.24 CEA; PATCH harm signal — all accurate.

Implicit guideline references (AHA/ASA 2026 stroke, AHA/ASA 2022 ICH, IDSA 2004 bacterial meningitis, McDonald 2017 MS, AAN 2011 PLEX) correctly map to current canonical sources.

## Editorial / expert context

Not applicable — no new trial-entry surface in this PR. These are synthesis Q&A across the established evidence base for SEO-visible FAQ surfaces. Trial-detail pages and evidence-verifier packets unchanged.

## Freshness

- AHA/ASA 2026 stroke guideline (6-month window §13.7) — within window.
- AHA/ASA 2022 ICH guideline (6-month window) — within window.
- IDSA 2004 bacterial meningitis — past conventional window but remains canonical US source; no superseding update. Flag for monitoring.
- AAN 2011 PLEX — reaffirmed 2016; within reaffirmation cycle.
- McDonald 2017 MS criteria — current standard.
- THEIA Lancet Neurol 2025 — N=70 confirmed via PubMed lookup 2026-05-21 (matches Q&A text).

No `last_reviewed` fields needed on PAGE_FAQS/QUESTION_META records themselves (SEO surfaces, not citation records). Underlying guideline citations remain governed by `src/lib/citations/registry.ts`.

## Conditions resolved before merge

1. **THEIA N verification (`crao-management`)** — resolved. Q&A states N=70; confirmed against Lancet Neurol 2025 publication (70 randomized; 56 with complete primary outcome data). No edit required.
2. **PATCH COR-3 language (`ich-anticoagulation-reversal`)** — resolved. Changed "Class III recommendation against routine use" to "COR 3: Harm per AHA/ASA 2022 ICH guideline" for precision matching the 2022 ICH guideline force-language.

## Rationale

Twenty FAQ entries spanning bacterial meningitis, GBS, MS, headache workup, and 16 high-volume stroke/cerebrovascular question pages. Content is well-established guideline material faithfully paraphrased with appropriate hedging. No drift in recommendation strength, action verbs, qualifiers, certainty, or temporal constraints. Both editorial conditions applied before merge. Approve.

## Required follow-ups

1. **Optional, non-blocking:** Append "(reaffirmed 2016)" after "AAN 2011" for the MS PLEX citation in `/guide/multiple-sclerosis` Q&A to signal continued currency.
2. **Optional, non-blocking:** Track IDSA 2004 bacterial meningitis citation for monitoring — past conventional refresh window. Suggest a `last_reviewed` discipline pass in the next citation audit cycle.
3. When PAGE_FAQS / QUESTION_META become tagged claim surfaces (Phase 2 of §13.4 scanner — JSON content blob `claim_id`), each entry should wire to underlying citation IDs in `CLAIM_REGISTRY`. Currently consistent with existing PAGE_FAQS entries (not yet in shipped scanner phase for `src/seo/schema.ts`).

## Blocking issues

None — both editorial conditions resolved before merge.
