# Clinical review — Stroke Code Batch 4 (voice + verbatim remediation)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: opus-4.7)
**Date:** 2026-05-19

## Scope
- Claims touched (pearl IDs): wake-up-trial, defuse3-trial, dawn-trial, doac-management-2026, stroke-mimics-safety, hemorrhage-reversal-protocol, anticoagulation-timing
- Study-mode blurbs touched: HERMES (StrokeBasicsWorkflowV2.tsx L543), DAWN/DEFUSE-3 extended-window (L546), Documentation paragraph 1 (L673), Documentation metrics paragraph 2 (L676)
- Citations affected (evidence-field tags, no formal registry entries): NEJM 2018 (WAKE-UP, DAWN, DEFUSE-3), AHA/ASA 2026 Guidelines, AHA/ASA 2022 ICH Guidelines §§5.1/6.2, TICH-2 2018, PATCH 2016 (Baharoglu et al, Lancet) — newly anchored, ELAN 2023 (now NEJM-tagged), HERMES Lancet 2016, Stroke Unit Trialists Collaboration Cochrane 2013 (year added), Zinkstok 2013, AHA/ASA 2019
- Surfaces changed: Phase-1 structured data in `src/data/strokeClinicalPearls.ts` (`content` strings on pearl objects); static JSX prose in `src/pages/guide/StrokeBasicsWorkflowV2.tsx` (study-mode evidence blurbs)
- Evidence-verifier packet: not applicable (no new claims; voice + suspected-verbatim remediation only)
- Trial-statistician report: not applicable (no statistics-display changes; trial percentages and NNTs preserved verbatim)

## Semantic validity

Verified each rewrite against the five never-drift categories (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints). Findings per passage:

1. **wake-up-trial** — All numeric thresholds preserved (53.3% vs 41.8%, mRS 0-1, OR 1.61, 25% sleep-onset prevalence). DWI-FLAIR mismatch criterion preserved. Class I / Level B / NEJM 2018 untouched. Added operational sentence ("if the bedtime LKW puts the patient outside 4.5h, MRI mismatch makes them eligible") restates trial use case; no new clinical claim. PASS.

2. **defuse3-trial** — 6–16h window, core <70 mL, mismatch ratio ≥1.8, penumbra ≥15 mL, 44.6% vs 16.7%, mRS 0-2 all preserved. Vague closing sentence removed; data unchanged. Class I / Level A intact. PASS.

3. **dawn-trial** — 6–24h, age/NIHSS/core selection, 48.6% vs 13.1%, NNT 3, mRS 0-2 preserved. Vague closing sentence removed. Class I / Level A intact. PASS.

4. **doac-management-2026** — Recommendation hedge strength preserved: "tPA may be considered" → "tPA is an option (Class IIb)" — same Class IIb force; "is an option" combined with explicit "(Class IIb)" tag carries identical clinical weight. 48h cutoff, renal function gate, drug-specific assay gate, and assay-drug mapping (anti-Xa for apixaban/rivaroxaban/edoxaban; ECT or dilute thrombin time for dabigatran) all preserved. `plainEnglish` field still uses "may be considered." Class IIb / Level C / AHA/ASA 2026 evidence intact. PASS.

5. **stroke-mimics-safety** — Numbers preserved verbatim (1–2% mimic rate, n=5,581, sICH 1.0% [CI 0.0–5.0], 7.9% [CI 7.2–8.7], no fatal ICH). Zinkstok 2013, AHA/ASA 2019 Class IIa preserved. Recommendation direction unchanged: "Don't delay tPA for extensive workup if stroke is likely" and "If stroke is the likely diagnosis, give tPA" carry identical clinical force — both are Class IIa "is reasonable" framing in different words. PASS.

6. **hemorrhage-reversal-protocol** — Every dose, threshold, and reversal agent preserved (cryo 10 U IV, fibrinogen >150 mg/dL, q30min, 4F-PCC 25–50 U/kg, vitamin K 10 mg IV, INR <1.4 goal, FFP fallback, idarucizumab 5 g IV, andexanet alfa for apixaban/rivaroxaban). TXA Class III Level A preserved (TICH-2 attribution). Platelet transfusion "not routinely recommended" preserved.

   **PATCH 2016 attribution assessed:** The original prose carried "(may worsen outcomes)" as an unattributed parenthetical against platelet transfusion. The rewrite anchors that claim to "PATCH 2016 showed worse outcomes in spontaneous ICH on antiplatelets." This is **not a new clinical claim** — it is the canonical citation for the Class III recommendation. The medical-scientist correctly scoped PATCH to "spontaneous ICH on antiplatelets" (the trial's actual population) rather than implying PATCH directly studied tPA-related ICH. AHA/ASA 2022 ICH §6.2 extrapolates the harm signal to the broader recommendation; this is the guideline's own logic, faithfully represented.

   **Minor preference-ordering change flagged:** Original "Xa inhibitors: andexanet alfa or 4-factor PCC" → rewrite "Apixaban/rivaroxaban: andexanet alfa, or 4-factor PCC if andexanet is unavailable." The rewrite adds a preference ordering (andexanet first-line, PCC if unavailable). This is consistent with AHA/ASA 2022 ICH Section 6.2 which positions andexanet as the preferred agent. The change is a clarification, not a strength upgrade. PASS.

7. **anticoagulation-timing** — 24h hold for antiplatelets and anticoagulants, fibrinolysis mechanism, 24h CT then aspirin 81–325 mg, AHA/ASA 2026 hedge ("supports earlier DOAC initiation in carefully selected patients" → "endorses earlier DOAC starts in selected patients" — same Class IIa hedge strength), ELAN timing (48h for TIA/minor/moderate stroke; day 6–7 for major stroke), repeat imaging, post-IVT/EVT caution — all preserved. ELAN now correctly tagged as NEJM 2023. The seam between guideline endorsement and trial-derived operational timing is now explicit. PASS.

8. **HERMES study-mode blurb (L543)** — 30% LVO prevalence, 46% vs 29% functional independence, NNT 2.6 preserved. Added "Lancet 2016, pooled 5 RCTs" — factually accurate (HERMES pooled MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT, n=1,287; confirmed against `hermes-meta-analysis` pearl at line 280). Added "If LVO is present, activate IR in parallel with IV thrombolysis" — consistent with AHA/ASA bridging-therapy standard; not a new threshold or recommendation. PASS.

9. **DAWN / DEFUSE-3 study-mode blurb (L546)** — DAWN 2018, 6-24h, clinical-core mismatch, 48.6%/13.1%, NNT 3 preserved. DEFUSE-3 2018, 6-16h, perfusion-mismatch selection preserved. Added 44.6%/16.7% for DEFUSE-3 — verified these numbers already exist in the `defuse3-trial` pearl (line 305) and on the trial detail page. This is **restoration of pre-existing audited numbers**, not introduction of a new claim. PASS.

10. **Documentation blurbs (L673 and L676)** — Active-voice "Document" preserves clinical force of "should capture." "NIHSS subscores" → "NIHSS total score" — this is a precision fix; subscore-level documentation is not the AHA/ASA standard, and the audit explicitly recommended this change. DTN <60 min goal, <30 min excellence, ~18% mortality reduction all preserved. "Stroke Unit Trialists Collaboration" now anchored to Cochrane Review 2013 (audit-requested). PASS.

No new clinical recommendations introduced. No threshold drift. No certainty-marker laundering. No temporal-constraint changes.

## Citation accuracy

Each cited source verified for preservation:
- NEJM 2018 — preserved on WAKE-UP, DAWN, DEFUSE-3
- AHA/ASA 2026 — preserved on doac-management-2026, anticoagulation-timing; section anchor unchanged
- AHA/ASA 2022 ICH Sections 5.1, 6.2 — preserved on hemorrhage-reversal-protocol
- TICH-2 2018 — preserved as evidence for TXA Class III Level A
- PATCH 2016 (Baharoglu et al, Lancet) — newly anchored. This is the canonical citation for Class III recommendation against routine platelet transfusion in ICH on antiplatelets. Appropriately scoped to spontaneous-ICH population in the prose.
- ELAN 2023 — now correctly tagged as NEJM 2023 in the prose. The `evidence` field still reads `'ELAN trial 2023'`; orchestrator should consider updating that field to `'ELAN, NEJM 2023'` for consistency, but this is editorial — not a clinical drift.
- HERMES Lancet 2016 — newly explicit in study-mode blurb (was already in pearl).
- Stroke Unit Trialists Collaboration Cochrane 2013 — year added, audit-requested fix.
- Zinkstok 2013, AHA/ASA 2019 Class IIa — preserved on stroke-mimics-safety.

No dead citations. No section-number drift.

## Freshness

The pre-commit hook (§13.5) currently enforces freshness on registered claims in `CLAIM_REGISTRY`. As of this review, `src/lib/citations/claims.ts` is a stub per W5.2 phasing, so no freshness window is presently enforced on these structured-data evidence fields. No claim required a `last_reviewed` refresh as a precondition of this batch — voice changes do not by themselves trigger §13.6.

## Rationale

This is a voice-only batch — 11 rewrites of passages flagged in the 2026-05-19 voice audit as either textbook register or as suspected verbatim lifts of guideline recommendation phrasing. Every numeric threshold, drug name, dose, route, time window, recommendation strength (Class I/IIa/IIb/III), evidence level (A/B/C), and trial citation has been preserved across the rewrite. Recommendation direction is unchanged in every passage. The one substantive attribution change — anchoring the previously unattributed "(may worsen outcomes)" platelet-transfusion claim to PATCH 2016 — is a clarifying citation, scoped accurately to the trial's spontaneous-ICH-on-antiplatelets population. The DEFUSE-3 outcome numbers added to the study-mode blurb (44.6% / 16.7%) restore data that already lived in the corresponding pearl. No new clinical claims, thresholds, or trial findings are introduced. Voice quality is materially improved. Approve.

## Required follow-ups

- Editorial sweep to update the `evidence` field on `anticoagulation-timing` from `'ELAN trial 2023'` to `'ELAN, NEJM 2023'` for prose-consistency. Non-blocking.
- When `src/lib/citations/registry.ts` is populated for stroke pearls (currently stubbed per W5.2), schedule a §13.6 refresh on the AHA/ASA 2019 Class IIa stroke-mimics citation to confirm it has not been superseded by AHA/ASA 2026.
- Out-of-scope carry-forward from the voice audit (track for subsequent batch): `lvo-workflow` (audit item 14 — "Sequential therapy outperforms either alone" needs HERMES attribution) and `neurosurgery-indications` (audit item 15 — inline COR/LOE format).
- Stream-1 (clinical accuracy) carry-over: `ThrombectomyPathwayModal` subtitle was fixed in Batch 1 (commit 1fe1dbf changed "AHA/ASA 2019" → "AHA/ASA 2026").
