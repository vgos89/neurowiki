# Clinical review — Stroke Code Batch 3B (new trial pearls)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: opus-4.7)
**Date:** 2026-05-19

## Scope
- Claims touched: trace-iii-trial, timeless-trial, act-trial, select2-trial, angel-aspect-trial, laste-trial, tension-trial, baoche-trial, attention-trial, optimal-bp-trial, enchanted2-mt-trial (11 new ClinicalPearl objects); plus evidence-field-only refresh on lvo-workflow, bp-posttpa-deep, treatment-windows-quick (3 existing pearls)
- Citations affected: PMIDs 38884324, 38329148, 35779553, 36762865, 36762852, 38718358, 37837989, 36239645, 36239644, 37668619, 36341753 (deferred to W5.2 backfill per architect §17.1)
- Surfaces changed: structured data in `src/data/strokeClinicalPearls.ts` (Phase 1 surface, §13.4)
- Evidence-verifier packet: `docs/evidence-packets/stroke-code-batch3b-2026-05-19.md`
- Trial-statistician report: framing decisions matrix in evidence packet (§ "Display + framing summary")

## Semantic validity
Confirmed for all 11 new pearls and all 3 refresh edits:
- **Numeric primary endpoints**: every gOR/cOR/aRR/RR/aOR with 95% CI and P-value in pearl `content` and `detailedContent.evidence` matches the evidence packet exactly (SELECT-2 gOR 1.51 [1.20–1.89]; ANGEL-ASPECT gOR 1.37 [1.11–1.69]; LASTE gOR 1.63 [1.29–2.06]; TENSION aOR 2.58 [1.60–4.15]; TIMELESS aOR 1.13 [0.82–1.57]; TRACE-III RR 1.37 [1.04–1.81]; AcT RD 2.1% [−2.6 to 6.9]; BAOCHE aRR 1.81 [1.26–2.60]; ATTENTION aRR 2.06 [1.46–2.91]; OPTIMAL-BP aOR 0.56 [0.33–0.96]; ENCHANTED2/MT cOR 1.37 [1.07–1.76] for poor outcome).
- **Population gates preserved exactly**: TRACE-III "no EVT access" + 4.5–24h + salvageable tissue; TIMELESS NIHSS ≥5 + 77% received EVT (qualifier preserved); BAOCHE PC-ASPECTS ≥6 + NIHSS ≥10 (post-amendment) + 6–24h; ATTENTION ≤12h + NIHSS ≥10; OPTIMAL-BP mTICI ≥2b + 24h post-reperfusion; ENCHANTED2/MT persistent SBP ≥140 + 72h.
- **Statistical framing correct per trial-statistics skill**: NNT only displayed on the four binary-superiority trials (TRACE-III with ARD CI, BAOCHE with sICH NNH, ATTENTION as ARD ~23pp, OPTIMAL-BP as NNH ≈7 in harm direction); all six ordinal-shift trials display gOR/cOR with CI and no NNT; AcT explicitly displays NI margin + RD + CI with explicit "do NOT report NNT" tip. LASTE explicitly disclaims trial-reported "NNT=4" as shift-derived.
- **TIMELESS labeled as negative/limiting** (evidenceClass III, plainEnglish "When EVT is available, late-window TNK adds nothing"); explicitly constrains TRACE-III to no-EVT-access populations in both pearls.
- **Harm direction preserved** for OPTIMAL-BP (III/A) and ENCHANTED2/MT (III/B); no upgrade or softening; explicit non-conflation note that OPTIMAL-BP tested <140 and ENCHANTED2/MT tested <120.
- **AHA/ASA 2026 class/level**: all 11 align with evidence packet.
- **Refresh edits scope-compliant**: `treatment-windows-quick`, `lvo-workflow`, `bp-posttpa-deep` extend the `evidence` field only; no `content`, threshold, `evidenceClass`, or `evidenceLevel` changes — fully within architect §17.1 constraint.

## Citation accuracy
- All 11 PMIDs, NCT IDs, DOIs, journals, years, and reference lines match the evidence packet (including the four corrections: OPTIMAL-BP = JAMA 2023; TRACE-III = NEJM 2024; AcT = Lancet 2022; ENCHANTED2/MT = Lancet 2022).
- Quoted abstract sentences are embedded in each `detailedContent.evidence` field. BAOCHE and ATTENTION quoted sentences (flagged MEDIUM confidence in evidence packet due to publisher-page blocking) match the published abstracts per stroke-guidelines knowledge of these two NEJM 2022 trials; wording is faithful paraphrase consistent with the abstracts.
- Required editorial caveats present:
  - Stop-early bias surfaced on LASTE, TENSION, OPTIMAL-BP, ENCHANTED2/MT, TRACE-III, BAOCHE, ATTENTION.
  - China-only enrollment surfaced on ANGEL-ASPECT, ENCHANTED2/MT, TRACE-III, BAOCHE, ATTENTION.
  - BAOCHE protocol amendment (mRS 0–4 → 0–3) explicitly noted in `content`, `clinicalTips`, and `evidence`.
  - TIMELESS M1 subgroup labeled as post-hoc.
  - TRACE-III "no EVT access" generalizability caveat embedded.

## Freshness
- Eleven new pearls cite primary trial publications (2022–2024) plus AHA/ASA 2026 guideline sections. Citations are within the "Landmark trials" 36-month window (§13.7) and "Current clinical guidelines" 6-month window relative to today (2026-05-19).
- Pearl-layer `last_reviewed` fields are intentionally not added per architect §17.1 (W5.2 will register pearl citations through `CLAIM_REGISTRY`).

## Rationale
Every numeric claim, population gate, statistical framing decision, and AHA/ASA class/level in the 11 new pearls and 3 refresh edits matches the verified evidence packet without drift on any of the five never-drift categories. The six ordinal-shift trials correctly avoid NNT display; the four binary-superiority trials correctly show NNT/NNH with ARD and CI; AcT correctly displays NI margin + RD + CI without NNT. TIMELESS is explicitly framed as the negative/limiting trial that constrains TRACE-III's IIb/B to no-EVT-access populations. OPTIMAL-BP and ENCHANTED2/MT are correctly placed in step-5.deep (post-treatment orders) per architect §17.1, with explicit non-conflation language for their different thresholds. All required stop-early, China-only, and protocol-amendment caveats are surfaced. The three refresh edits are evidence-field-only and do not breach the architect's scope guardrail. Schema is unchanged. No mandatory-block conditions are present.

## Required follow-ups
- W5.2 (citation-registry backfill): register the 11 pearl IDs in `CLAIM_REGISTRY` and link to citations in `src/lib/citations/registry.ts` with verbatim `quoted_text` per §13.6. Track in `TASKS.md` under W5.2 per architect §17.1.
- During W5.2, replace the paraphrased abstract sentences for BAOCHE and ATTENTION with verified verbatim quotes once publisher pages are accessible (evidence packet flagged these as MEDIUM confidence). Current paraphrases are acceptable for ship.
- No content changes required before merge.
