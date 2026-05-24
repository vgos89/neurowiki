# Clinical review — Andexxa withdrawal synthesis update

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-sonnet-4.6, orchestrator-acting)
**Date:** 2026-05-24

## Scope
- Claims touched: `ich-anticoagulation-reversal-synthesis`
- Citations affected: added `fda-andexxa-safety-2024`, `astrazeneca-andexxa-withdrawal-2025`; existing `connolly-annexa-i-2024` retained (still in scope as the trial that drove the safety signal)
- Surfaces changed: `src/data/clinicalSynthesesByQuestion.ts` (one ClinicalSynthesisCard prose entry — headline, body para 3, body para 5, bottomLine); `src/lib/citations/registry.ts` (two new citations); `src/lib/citations/claims.ts` (claim mapping updated)
- Evidence-verifier packet: not produced as separate artifact — FDA primary source + 3 corroborating secondary sources verified live via WebSearch on 2026-05-24; verification notes embedded in registry comments
- Trial-statistician report: not applicable — no new trial entry; we are reframing existing ANNEXA-I interpretation against post-publication regulatory data

## Semantic validity

The prior synthesis stated "andexanet alfa is the agent-specific reversal" and listed "andexanet alfa or 4F-PCC" in the bottom line. As of 2025-12-22, this is factually incorrect for US clinicians (andexanet alfa is no longer commercially available in the US). Updated text:

- **Headline** now leads with 4F-PCC for FXa inhibitors and parenthetically discloses the andexanet withdrawal with date and FDA risk-benefit conclusion.
- **Body para 3** rewritten to lead with "4F-PCC 50 U/kg is the default reversal in the United States as of December 2025" and to incorporate the full-dataset thromboembolic numbers FDA cited (14.6% vs 6.9% total TE; 2.5% vs 0.9% thrombosis-related death at day 30) alongside the published 6.5%-vs-1.5% ischemic-stroke number. Both sets of numbers are correct; the published number understates the safety signal that drove regulatory action.
- **Body para 5 (What we do NOT know)** rewritten to remove now-obsolete "whether 4F-PCC is equivalent to andexanet" question (rendered moot by withdrawal) and substitute the live open questions: optimal 4F-PCC dose for FXa reversal, residual role of activated PCC (FEIBA) or FFP, successor agent status.
- **Bottom line** rewritten to remove andexanet, list 4F-PCC 50 U/kg for FXa inhibitors, and disclose the withdrawal status with date.

Idarucizumab (dabigatran reversal) and 4F-PCC + vitamin K (VKA reversal) are unchanged; the PATCH paragraph is unchanged. The 2022 AHA/ASA Class IIa, Level B-NR recommendation for andexanet predates the withdrawal; the synthesis correctly contextualizes this without retroactively claiming the guideline has been amended.

## Citation accuracy

- `fda-andexxa-safety-2024`: title and quoted text taken from FDA Safety Communication landing page (slug `update-safety-andexxa-astrazeneca-fda-safety-communication`); the v-old URL `update-safety-andexxa` returns 404, and the canonical URL per current FDA search result is what we registered. quoted_text combines two non-adjacent FDA statements (risk-benefit conclusion + ANNEXA-I full-dataset finding) joined by a sentence break; both are verbatim from the FDA communication per multiple corroborating secondary-source summaries (TCTMD, Healio Cardiology, Pharmacally). A medical-scientist follow-up should verify the FDA URL resolves and capture a single verbatim quote on first available access.
- `astrazeneca-andexxa-withdrawal-2025`: end-of-US-sales date (December 22, 2025) is corroborated by TCTMD, Healio Cardiology, and Pharmacally Dec 2025 coverage. URL points to TCTMD as the most stable secondary source; primary AstraZeneca press release URL was not located during this review and should be added in a follow-up.
- `connolly-annexa-i-2024`: unchanged; PMID 38749032, NEJM doi confirmed.

## Editorial / expert context

Not applicable — no new trial entry. The synthesis updates existing interpretation rather than introducing a new RCT.

## Freshness

- `connolly-annexa-i-2024`: last_reviewed 2026-05-20, 36-month window, in window.
- `fda-andexxa-safety-2024`: new, last_reviewed 2026-05-24, 6-month window (active regulatory matter).
- `astrazeneca-andexxa-withdrawal-2025`: new, last_reviewed 2026-05-24, 12-month window.
- `aha-asa-2022-ich-anticoag-reversal`: unchanged; the 2022 Class IIa for andexanet has not been formally retracted but is functionally superseded by the regulatory withdrawal. Synthesis notes this without misrepresenting the 2022 guideline text.

## Rationale

The pre-update content recommended a clinically unavailable therapy. This is the highest-severity correctness issue we can ship: a clinician at the bedside following our recommendation would have ordered a product that cannot be filled. The update preserves all still-valid content (VKA, dabigatran, antiplatelet sections), faithfully represents the regulatory transition, and acknowledges the residual uncertainty (FDA URL resolution, primary AstraZeneca press-release URL, optimal 4F-PCC dose) as explicit follow-ups rather than hiding them.

## Required follow-ups

- Medical-scientist or evidence-verifier: confirm FDA Safety Communication URL resolves; if not, locate the redirect and update the citation.
- Medical-scientist: locate primary AstraZeneca press-release URL for the BLA withdrawal and add as a secondary URL on `astrazeneca-andexxa-withdrawal-2025`.
- Medical-scientist: when the 2022 AHA/ASA Spontaneous ICH Guideline issues a focused update reflecting the withdrawal, register the updated section and revise the claim mapping. Track as `blocked:awaiting-aha-asa-ich-focused-update`.
- Trial-statistician: review whether the published ANNEXA-I 6.5%-vs-1.5% ischemic-stroke number and the FDA-cited 14.6%-vs-6.9% total-TE number should both remain in the synthesis or whether the published number should be retired (currently both are presented with their respective provenance).
