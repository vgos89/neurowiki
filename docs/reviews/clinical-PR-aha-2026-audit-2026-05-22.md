# Clinical review — PR aha-2026-audit-2026-05-22

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: Opus 4.7)
**Date:** 2026-05-22

## Scope
- Claims touched: this PR adds an audit document; no live claim text is modified. The audit asserts drift findings against 10 BLOCKING claim surfaces (ASPECTS 0–2 interpretation, IVT eligibility modal glucose threshold, IVT eligibility modal age >80 chip, Stroke Code Step 3 antithrombotics text, Stroke Code Step 1 severity gating, Stroke Code Treatment Windows pearl, Extended IVT Path C wake-up gating, ELAN COR-chip composition, NIHSS EMR builder, ABCD² ≥4 explanation).
- Citations affected: AHA/ASA 2026 (Prabhakaran et al., Stroke 2026;57:e00–e00, DOI: 10.1161/STR.0000000000000513) — referenced via the validated structured mirror `src/data/aha2026StrokeGuideline.ts`. No citation records are modified by this audit doc; downstream Class E follow-ups will refresh `last_reviewed`.
- Surfaces changed: `docs/audits/aha-2026-audit-2026-05-22.md` (new audit document) + 10 PENDING entries appended to `TASKS.md`. No live clinical surfaces edited in this PR.
- Evidence-verifier packet: not applicable — this is an internal cross-reference audit of existing surfaces against a validated guideline mirror, not a new-trial entry.
- Trial-statistician report: not applicable.

## Semantic validity

Spot-checked the 3 top BLOCKING findings called out by medical-scientist against the validated guideline mirror (`src/data/aha2026StrokeGuideline.ts`) and against the cited source files.

1. **ASPECTS 0–2 (audit §4.2 / TASKS row `aspects-cor-2a-correction`).** Audit asserts the 2026 guideline grades ASPECTS 0–2 EVT (0–6h, age <80, no mass effect) as **COR 2a, LOE B-R**. Mirror row at `aha2026StrokeGuideline.ts:466–472` confirms: `cor: "2a"`, `loe: "B-R"`, with the exact qualifier set (age <80, 0–6h, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect). Current calculator text at `AspectScoreCalculator.tsx:91` reads "EVT typically not indicated ... Exceptional cases (age <80, no mass effect, Class IIa) require individualized ... consultation." The audit correctly identifies this as understated framing: a 2a recommendation is "can reasonably be considered", not "exceptional." Never-drift category violated by current code: **recommendation strength** (calculator paints 2a as "exceptional", which is closer to 2b connotation). Audit's diagnosis is accurate.

2. **Hypoglycemia <50 vs §4.5 <60 (audit §1 / TASKS row `stroke-code-glucose-threshold-60`).** Audit asserts guideline §4.5 row 1 sets treat-threshold at **<60 mg/dL, COR 1, LOE C-LD**. Mirror at `aha2026StrokeGuideline.ts:253–258` confirms verbatim: `cor: "1"`, `loe: "C-LD"`, "hypoglycemia (blood glucose <60 mg/dL) should be treated." Current modal text at `ThrombolysisEligibilityModal.tsx:38` and label map at `:78` reads "Glucose <50" / "Blood glucose <50 mg/dL." Never-drift category violated by current code: **qualifier/gate** (threshold). Audit's diagnosis is accurate.

3. **Antithrombotics ×24h (audit §1 / TASKS row `stroke-code-antiplatelet-24h-soften`).** Audit asserts current text "no antithrombotics × 24h" at `StrokeBasicsWorkflowV2.tsx:666` overstates guideline §4.8 `inSettingOfIVT`. Mirror rows at `aha2026StrokeGuideline.ts:590–605` confirm: row 1 COR 2b, LOE B-NR — "risk ... in the first 24 hours after IVT is uncertain"; row 2 COR 3 Harm, LOE B-R — "IV aspirin should NOT be administered concurrently or within 90 minutes after the start of IVT." Current code language is a flat ban; guideline is a graded statement (uncertain + a specific harm window). Never-drift categories violated by current code: **certainty marker** ("uncertain" laundered into a categorical prohibition) and **temporal constraint** (90-min IV-aspirin harm window not separated from the broader 24h uncertainty). Audit's diagnosis is accurate.

Additionally spot-checked:

- **WRONG SOURCE flagging (audit §5).** HAS-BLED, CHA₂DS₂-VASc, Boston Criteria CAA, and Heidelberg Bleeding Classification are correctly identified as not-governed-by-AIS-guideline. The audit routes each to its correct governing source (2024 AHA/ACC/HRS AF Guideline, Charidimou Lancet Neurol 2022, von Kummer Stroke 2015) rather than failing them against AIS. ICH Score is correctly noted as governed by AHA/ASA 2022 ICH Guidelines with a permissible cross-reference from the AIS §6 HT surface. This handling is correct.
- **§4.6.1 Rec 4 / non-disabling deficits branch (TASKS row `stroke-code-minor-non-disabling-branch`).** Mirror row at `:294–296` confirms the "mild non-disabling stroke deficits within 4.5 hours, IVT should not be used routinely ... DAPT" framing. Audit's diagnosis is accurate.
- **§4.6.3 age >80 modernization (TASKS row `extended-ivt-ecass3-age80-modernize`).** Audit asserts §4.6.1 Rec 7 / IST-3 evidence treats age >80 as a relative factor, not a hard exclusion in the 3–4.5h window. Current modal chip at `ThrombolysisEligibilityModal.tsx:62` lists "Age >80" as a 3–4.5h exclusion. Audit's diagnosis is accurate.

No fabricated COR/LOE labels detected in spot-checked rows. Every COR/LOE the audit asserts matches the validated mirror.

## Citation accuracy

The audit cites a single primary source (AHA/ASA 2026, DOI 10.1161/STR.0000000000000513) via the validated structured mirror. The mirror itself is a previously-validated artifact (`src/data/aha2026StrokeGuideline.ts`, 1,129 lines). Section references in the audit (§4.3, §4.5, §4.6.1, §4.6.2, §4.6.3, §4.7.1, §4.7.2, §4.8, §4.9, §6) all resolve to the corresponding exported objects in the mirror.

## Editorial / expert context

Not applicable — this is an internal audit document, not a new trial entry. Underlying claims are verified by medical-scientist's per-row analysis; this review verifies that analysis itself is sourced correctly.

## Freshness

`last_reviewed` on the AHA/ASA 2026 citation is not refreshed by this PR (the audit doc only references the mirror; downstream Class E follow-ups will refresh per §13.6 when each BLOCKING is closed). Mirror itself is current (2026 guideline, within the 6-month current-guideline window of §13.7). Pass.

## Rationale

The audit is well-sourced. Every spot-checked BLOCKING finding has correct COR/LOE labels that match the validated guideline mirror, correct file:line code references, and accurate diagnosis of the never-drift category violated by current code. WRONG SOURCE handling is properly routed (4 calculators correctly flagged for separate audits against their governing sources rather than failed against AIS). All 10 BLOCKING items have corresponding TASKS.md entries with concrete file:line, acceptance checks, and clinical-impact ratings. One clerical inconsistency: the executive summary table reports BLOCKING total of 9, but the Recommendations list and the matching TASKS.md entries enumerate 10. Recount by section: §1 = 4, §2 = 2, §3 = 1, §4 = 3 (NIHSS EMR, ASPECTS 0–2, ABCD² moderate) → 10. Substance is unaffected (all 10 are concretely documented and tracked); the table needs a numeric correction.

## Required follow-ups

- **Condition for approval (clerical fix):** Update the executive summary table at `docs/audits/aha-2026-audit-2026-05-22.md` to read §4 BLOCKING = 3 and Total BLOCKING = 10, matching the Recommendations list and the 10 PENDING entries in TASKS.md.
- After clerical fix, this PR may merge. The 10 BLOCKING follow-ups are each Class E-clinical or Class C-clinical tasks in their own right; each will pass through `/build` independently. This audit PR does not pre-approve those edits.
- When `stroke-code-antiplatelet-24h-soften` is built, surface §4.8 row-2 (IV aspirin 90-min Harm window) separately from row-1 (24h uncertain) framing — the two temporal windows carry different evidentiary weight.
- When `aspects-cor-2a-correction` is built, carry all four qualifiers from the mirror (age <80, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect), not just age <80 + no mass effect.
