# Clinical review — trial-pilot-arm-enrichment (PDF-sourced)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-08

## Scope
- Claims touched: per-arm protocol detail (`armDetails`) on 5 trial records — `ninds-trial`, `ecass3-trial`, `escape-trial`, `defuse-3-trial`, `dawn-trial`. No claimId-registered claim surface changed (arm-detail blocks carry no `claimId`; eligibility/stats/interpretation claim surfaces untouched).
- Citations affected: none changed. Source provenance per arm cited inline in `note` fields (NINDS NEJM 1995 p.1582; Hacke NEJM 2008 p.1318–1320; Goyal NEJM 2015 p.1021; Albers NEJM 2018 p.710; Nogueira NEJM 2018 p.13). ESCAPE `escape-primary-result` / `escape-bedside-pearl` claim surfaces verified UNCHANGED.
- Surfaces changed: §13.3 "Structured data in `src/data/*.ts`" — `armDetails[]` arrays only.
- Evidence-verifier packet: `docs/evidence-packets/2026-06-08-trial-pilot-arm-enrichment.md` (TASK A holds the transcribed blocks; HIGH confidence, page-cited).
- Trial-statistician report: not applicable — no statistic, p-value, NNT, ordinal stat, or display archetype changed. ESCAPE common-OR confirmed intact (see Citation accuracy).

## Semantic validity
Per-arm, per-trial — every arm object verified character-for-character against packet TASK A; never-drift categories (dose, route, frequency, temporal window, qualifier/gate, certainty) checked on each.

- **NINDS (`ninds-trial`):** Intervention — Alteplase 0.9 mg/kg (max 90 mg), IV, 10% bolus then remaining 90% as constant infusion over 60 min; co-interventions capture the 24-h prohibition of BOTH anticoagulants AND antiplatelet agents + BP control. Comparator — volume-matched placebo, identical schedule, identical 24-h prohibition. Dosing matches the canonical thrombolysis protocol exactly. Control arm now substantive. **Faithful.**
- **ECASS III (`ecass3-trial`):** Intervention — Actilyse rt-PA 0.9 mg/kg (limit 90 mg), same bolus-then-60-min-infusion; concomitant block faithfully reproduces the full prohibited list (IV heparin, oral anticoagulants, aspirin, volume expanders) AND the SC-heparin ≤10,000 IU DVT-prophylaxis allowance — the genuine enrichment. Comparator mirrors the prohibition + exception. 3→4.5 h amendment noted. **Faithful.**
- **ESCAPE (`escape-trial`):** Intervention — mechanical thrombectomy, retrievable stents + balloon-guide-catheter suction recommended (device-agnostic, no brand mandate), workflow targets NCCT-to-puncture ≤60 min / NCCT-to-reperfusion ≤90 min; IV alteplase within 4.5 h "given in BOTH arms" preserved. Control — current standard of care per Canadian/local guidelines, no protocol-mandated thrombectomy, same alteplase qualifier; substantive control arm with actual-alteplase rates and crossover noted. Appendix-deferred BP/glucose/antithrombotic granularity flagged in `note`, not fabricated. **Faithful.**
- **DEFUSE-3 (`defuse-3-trial`):** Intervention — any FDA-approved device at operator discretion, 6–16 h window, femoral puncture within 90 min of qualifying imaging, GA discouraged, no IA t-PA; IV t-PA gated to within 4.5 h, AHA-guideline medical therapy in BOTH groups. Control — AHA-guideline standard medical therapy, same t-PA gate. **Faithful.**
- **DAWN (`dawn-trial`):** Intervention — Trevo (Stryker Neurovascular), Trevo-only by protocol with explicit non-generalization caveat, rescue-device/pharmacologic prohibition, cervical-ICA stenting rules. Control — standard medical care per local guidelines, antiplatelet-within-24-h allowance for non-alteplase patients (correctly placed as main-text content). Appendix S6 deferral noted. **Faithful.**

No drift in any never-drift category on any arm. Device specificity (Trevo brand-locked vs ESCAPE/DEFUSE-3 device-agnostic) correctly differentiated. No fabrication, no dose/route error.

## Citation accuracy
- All arm `note` provenance citations are internally consistent with the packet's page-cited transcription. No URL/PMID/section to re-resolve (no citation-registry entry changed by this PR; provenance is inline).
- **ESCAPE statistic — verified UNCHANGED (mandatory check passed):** `effectSize` = `OR 2.6`; `ordinalStats` = commonOR 2.6 / ciLow 1.7 / ciHigh 3.8 / pValue 0.001; `howToInterpret.proves` cites common OR 2.6 (95% CI 1.7–3.8). 2.6 confirmed as the pre-specified unadjusted PRIMARY per packet Task C; the adjusted/secondary 3.1 (2.0–4.7) is NOT present and was NOT requested. No value change.
- Scope integrity confirmed: diff limited to `armDetails[]` on the 5 records. `fullEligibility`, `stats`, `efficacyResults`, `pearls`, `calculations`/NNT, `legend`, `ordinalStats`, `mrsDistribution`, `howToInterpret` intact on every record. `ArmDetail` type supports every field used; `role` values (`comparator` for NINDS/ECASS III placebo, `control` for the EVT-trial medical arms) are valid; optional `dose`/`frequency`/`duration` correctly omitted on device-control arms.

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
Not applicable — no new trial entry in this PR. Stated explicitly, not silently omitted: this is per-arm protocol enrichment of five long-shipped entries. No primary result, endpoint, statistical framework, display archetype, or guideline-class field changed (ESCAPE confirms an already-correct value rather than changing one). Mandatory-block condition #8 (§8 completeness) governs new-trial entries and is therefore not re-triggered; packet §8 records this non-re-trigger explicitly.

## Freshness
No `last_reviewed` field modified by this PR (no citation-registry write). Landmark-trial freshness windows (36 mo per §13.7) for the underlying publications are not implicated by structured-data enrichment. No refresh required, no §13.6 checklist triggered. Pass.

## Rationale
Each of the ten arm objects is a character-for-character match to the page-cited evidence packet, the control/comparator arms are now substantive and faithful (the explicit goal), and the load-bearing dosing (NINDS/ECASS III alteplase 0.9 mg/kg, 10% bolus + 60-min infusion) and device claims (Trevo-locked DAWN vs device-agnostic ESCAPE/DEFUSE-3) are clinically correct. The ESCAPE primary statistic is untouched, all temporal/qualifier/gate constraints preserved, scope strictly `armDetails` on the named 5 records, and the type contract holds. No mandatory-block condition fires. Remaining items are editorial/low-risk, so the gate is approve-with-conditions rather than block.

## Required follow-ups
- **ESCAPE statistic label clarification — pending owner sign-off (carried forward, not gating this merge).** Annotate the displayed 2.6 as "unadjusted, pre-specified primary" and optionally record the adjusted secondary 3.1 (2.0–4.7) as labeled secondary, to prevent a future editor "correcting" 2.6 → 3.1 the wrong way. Held per packet Task C; do not ship without V sign-off.
- **Optional Supplementary-Appendix request** for ESCAPE / DAWN / DEFUSE-3 control-arm granularity (BP / glucose / antithrombotic targets the main texts defer to appendices). Current main-article-level arm detail is acceptable to ship with appendix gaps explicitly noted in the `note` fields — not a block.
- **NINDS confidence upgrade Medium → High** confirmed (eligibility 13/13 exclusion + 4/4 inclusion and dosing verified against NEJM 1995 p.1582 per packet Task D). Carry into the catalog/ledger as a metadata update.
- **Pre-existing note (not introduced by this PR, outside `armDetails` scope):** ESCAPE `mrsDistribution` remains flagged as provisional placeholder pending primary-source Figure 2 extraction at milestone W5.2. Tracked separately.
