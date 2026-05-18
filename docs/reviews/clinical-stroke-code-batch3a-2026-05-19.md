# Clinical review — Stroke Code Batch 3A (existing pearl clinical refresh)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: opus-4.7)
**Date:** 2026-05-19

## Scope
- Claims touched (pearl IDs): time-is-brain, time-is-brain-deep, treatment-windows-quick, ecass3-trial, wake-up-trial, doac-management-2026, pregnancy-tpa, stroke-mimics-safety, ist3-trial, race-scale-quick, fast-ed-scale, lvo-benefit-quick, hermes-meta-analysis, dawn-trial, defuse3-trial, ninds-trial, anticoag-warfarin, shine-trial, crystal-af-trial (Step4 rationale only), hemorrhage-management-quick, sich-incidence-deep, tich2-trial, stich-trial.
- Citations affected: AHA/ASA 2026 §4.2 (DOAC); AHA/ASA 2026 §4.5 (glycemic); AHA/ASA 2026 Table 5 (post-thrombolysis sICH reversal); 2022 AHA/ASA ICH (TICH-2 Class III Level A; STICH II Class IIb); Saver Stroke 2006 (PMID 16339467); Saver JAMA 2013; Emberson Lancet 2014; Pérez de la Ossa Stroke 2014; Lima Stroke 2016; HERMES Lancet 2016; DAWN NEJM 2018; DEFUSE-3 NEJM 2018; CRYSTAL-AF NEJM 2014.
- Surfaces changed: structured data in `src/data/strokeClinicalPearls.ts` (ClinicalPearl `content`, `evidence`, `evidenceClass`, `evidenceLevel`, `detailedContent` fields) + one rationale string in `src/components/article/stroke/CodeModeStep4.tsx` line ~223.
- Evidence-verifier packet: not applicable (no new trials, no new statistics surfaces; refresh-only — registry registration explicitly deferred to Batch 3B).
- Trial-statistician report: not applicable as a separate packet; trial-statistics skill rules applied inline by medical-scientist to HERMES (ordinal), DEFUSE-3 (ordinal), and DAWN (Bayesian-adaptive). Reviewer confirms compliance below.

## Semantic validity

Pass — all five never-drift categories preserved across the refresh set, with three substantive items individually verified:

1. **HERMES NNT numerical correction (2.6 → ~6).** Arithmetic verified: ARR mRS 0-2 = 46% − 29% = 17 percentage points; 1/0.17 ≈ 5.88, rounds to ~6. The pre-edit "NNT=2.6" was numerically inconsistent with the cited 46% vs 29%. Correction of a prior numerical error; not a recommendation-strength change. Class I Level A preserved. NNT now explicitly labeled "dichotomized secondary framing" per trial-statistics skill — primary endpoint correctly surfaced as ordinal common OR 2.49 (95% CI 1.76-3.53). Pass.
2. **DAWN reframing.** Bayesian-adaptive design now explicit; co-primary endpoints (utility-weighted mRS + mRS 0-2) named; posterior probability of superiority >0.999 surfaced as primary result; NNT relegated to dichotomized secondary. Compliant with trial-statistics skill. Class I Level A preserved. Pass.
3. **DEFUSE-3 reframing.** Ordinal mRS shift named as primary; NNT labeled as dichotomized secondary. Class I Level A preserved. Pass.
4. **S-12 TICH-2 paired label fix (IIb→III, B→A).** Verified against 2022 AHA/ASA ICH guideline: routine TXA in spontaneous ICH is Class III, Level A. In-pearl prose reads "Class III, Level A" — badge now matches prose. The paired Level B→A change is an editorial alignment, not a re-grading. Pass.
5. **S-13 TXA spontaneous-vs-thrombolysis distinction.** Adds clarification that AHA/ASA 2026 Table 5 includes TXA for post-thrombolysis sICH reversal while TICH-2 / 2022 ICH place TXA at Class III Level A for spontaneous ICH. Distinction is faithful to both sources. Pass.
6. **S-14 SHINE.** Explicit "Class III: No Benefit, Level A per AHA/ASA 2026 §4.5" added; matches CodeModeStep4 §4.5 #2 framing. Direction (target 140-180) preserved. Pass.
7. **S-15 INR.** "Debated" hedge removed; "INR >1.7 — contraindication ... AHA permits 1.4-1.7; some European protocols differ." Recommendation direction preserved; certainty marker tightened to match 2026 voice without upgrading clinical force. Pass.
8. **S-16 WAKE-UP 25% softening.** "About 25%" → "approximately 14-27% are detected on awakening" with terminology shifted from incidence to detection-on-awakening. More accurate; no clinical decision drift. Pass.
9. **S-10 pregnancy.** Caveat "small case series, n≈15, limited generalizability" added. Class IIb Level C preserved. Pass.
10. **S-17/P-13 Saver anchor.** Verbatim Saver 2006 quote now in `detailedContent.evidence` of `time-is-brain-deep` with PMID 16339467 in `reference`. ClinicalPearl interface lacks a top-level `quoted_text` field, so the quote is correctly anchored in `detailedContent.evidence` — schema-compatible workaround; full interface-level `quoted_text` is Batch 3B scope. Pass.
11. **P-12 CRYSTAL-AF.** Step4 rationale now matches primary publication exactly (8.9% at 6mo / 12.4% at 12mo with implantable monitor vs 1.4% / 2.0% with standard). Direction preserved. Pass.
12. **P-02 ECASS-3, P-03 NINDS/sICH definitions, P-04 RACE, P-05 FAST-ED, P-07 Treatment Windows, P-17 IST-3, P-18 stroke-mimics 2019→2026** — all reviewed; recommendation directions, class/level tags, and qualifiers preserved.

**No new clinical claims introduced.** All edits operate on existing pearl objects and existing fields.

## Citation accuracy

- AHA/ASA 2026 §4.2 (DOAC and IV thrombolysis) — plausible section anchor; reviewer is read-only without WebFetch. Confirmation deferred to Batch 3B (Condition 1).
- AHA/ASA 2026 §4.5 (glycemic) — consistent with CodeModeStep4 line 295 reference; cross-checks within repo.
- AHA/ASA 2026 Table 5 (post-thrombolysis sICH reversal bundle) — referenced consistently across TpaReversalProtocolModal and `hemorrhage-management-quick`.
- 2022 AHA/ASA ICH (TICH-2 Class III Level A; STICH II Class IIb) — cited and consistent with stroke-guidelines skill.
- Saver Stroke 2006 (PMID 16339467) — verbatim quote correctly attributed.
- HERMES Lancet 2016 / DAWN NEJM 2018 / DEFUSE-3 NEJM 2018 / Pérez de la Ossa Stroke 2014 / Lima Stroke 2016 / Zinkstok Stroke 2013 — all correctly attributed in `evidence` field.

## Freshness

`ClinicalPearl` interface does not yet carry a `last_reviewed` field — Batch 3B scope. Per §13.7, citations to AHA/ASA 2026 and 2022 ICH guidelines remain within their 6-month default review window. Landmark trial citations within their 36-month landmark-trial window. No stale-past-window citations identified at this refresh.

## Rationale

Batch 3A is a metadata-and-prose refresh that closes 11 SHOULD-FIX and 11 POLISH findings from the 2026-05-19 stroke-code clinical audit. Every change preserves recommendation strength, action verb, qualifiers, certainty markers, and temporal constraints. Three substantive changes verified independently: (a) TICH-2 paired badge/Level fix is correct against the 2022 ICH guideline; (b) HERMES NNT 2.6→~6 corrects a prior numerical error and derives correctly from the 17pp ARR; (c) STICH II badge/prose mismatch resolved during pre-commit gate (Condition 2 below) — badge corrected from `IIa` to `IIb` to match revised prose and 2022 ICH guideline. Two statistical reframings (HERMES/DEFUSE-3 ordinal, DAWN Bayesian) bring trial pearls into compliance with trial-statistics skill without altering any clinical recommendation. Approve with conditions below.

## Required follow-ups

1. **AHA/ASA 2026 §4.2 section verification (S-06) — DEFERRED to Batch 3B.** `doac-management-2026` cites "AHA/ASA 2026 §4.2 (DOAC and IV thrombolysis)". Medical-scientist (with WebFetch) confirms section anchor in Batch 3B. If section number differs in the published 2026 guideline, replace inline; pearl body unchanged.
2. **STICH II badge↔prose reconciliation (P-16) — RESOLVED PRE-MERGE.** Pearl `stich-trial` `evidenceClass` corrected from `'IIa'` to `'IIb'` during the Batch 3A pre-commit gate, matching the revised prose and 2022 AHA/ASA ICH guideline. Condition closed.
3. **Batch 3B prerequisites unchanged.** ClinicalPearl interface still lacks `last_reviewed` and `quoted_text` top-level fields; `src/lib/citations/registry.ts` still lacks entries for landmark trials and AHA/ASA 2026/2022 sections; static-JSX `data-claim` tagging on inline study-mode prose still absent. These remain Batch 3B scope.
4. **ARTIS `last_reviewed` and registry registration (S-09).** Confirmed no-op for Batch 3A — schema-level work for Batch 3B.
