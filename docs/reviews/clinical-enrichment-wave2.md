# Clinical review — Trial enrichment wave 2 (running log)

Additive enrichment of existing trial records with `fullEligibility` + `armDetails` (full criteria + study-arm protocols), sourced from uploaded PDFs via evidence-verifier (page-cited) → medical-scientist authoring → clinical-reviewer gate. No stats/interpretation/recommendation text changed in any record. Em-dash wall (check:humanizer) enforced on every commit.

---

## Batch 1 — Decompressive hemicraniectomy (DECIMAL, DESTINY, DESTINY II, HAMLET)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `decimal-trial`, `destiny-trial`, `hamlet-trial`, `destiny-ii-trial`. No claim/stat/interpretation changed.
- **Fidelity (source-verified, incl. direct PDF spot-check of the two swap-risk outliers):** age bands correctly distinct and not swapped — DECIMAL 18–55, DESTINY 18–60, HAMLET 18–60, DESTINY II ≥61 (61–82). Time windows correct and not swapped — DESTINY II <48 h vs HAMLET 96 h (widest). NIHSS hemisphere-dependent thresholds verbatim. HAMLET-specific "alteplase within 12 h" exclusion correctly isolated to HAMLET.
- **Arm roles:** intervention = decompressive hemicraniectomy (+duraplasty); control = conservative/medical management. Not inverted in any record. DECIMAL discretionary duraplasty (11/20), DESTINY/DESTINY II/HAMLET mandated augmented duraplasty — correct.
- **Internal consistency:** no contradiction with existing curated inclusion/exclusion or bottomLineSummary (DECIMAL 145 mL = 145 cm³; NIHSS >15 = >=16; windows align). No RESCUE-BT-style contradiction.
- **Never-drift:** no recommendation/stat/interpretation text altered (additive only).
- **Em-dash:** zero in added blocks; en-dash only in numeric ranges.
- **Follow-ups:** none blocking.

---

## Batch 2 — Antiplatelet / DAPT (CHANCE, CHANCE-2, POINT, INSPIRES, THALES, SOCRATES)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `chance-trial`, `chance-2-trial`, `point-trial`, `inspires-trial`, `thales-trial`, `socrates-trial`. No claim/stat/interpretation changed.
- **Regimen fidelity (source-verified):** loading doses correct and NOT cross-contaminated — POINT clopidogrel 600 mg vs CHANCE/INSPIRES 300 mg; ticagrelor 180 mg load uniform. DAPT durations correct per trial — CHANCE 21d, POINT 90d, INSPIRES 21d then clopidogrel to 90, THALES 30d, CHANCE-2 21d then ticagrelor to 90, SOCRATES 90d monotherapy. Time windows — POINT within 12 h, INSPIRES 24 to 72 h, others within 24 h. Age gates — POINT ≥18, INSPIRES 35–80, others ≥40; THALES ABCD2 ≥6 distinct.
- **Arm roles:** CHANCE-2 ticagrelor+ASA = intervention / clopidogrel+ASA = comparator (NOT inverted, explicitly annotated). SOCRATES = ticagrelor vs aspirin monotherapy (NOT framed as DAPT). DAPT trials = combination intervention / aspirin control.
- **SOCRATES negative status preserved:** no benefit/NNT framing introduced (it was P=0.07, NS).
- **Never-drift:** no existing stat/interpretation/recommendation altered (additive only).
- **Em-dash:** zero in added blocks.
- **Follow-ups:** none blocking.

---

## Batch 3 — Acute blood-pressure management (BP-TARGET, OPTIMAL-BP, BEST-II, ENCHANTED)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `bp-target-trial`, `optimal-bp-trial`, `best-ii-trial`, `enchanted-trial`. No stats/interpretation changed.
- **BP target fidelity (source-verified against PDFs):** BP-TARGET intensive 100–129 vs standard 130–185; OPTIMAL-BP intensive <140 vs conventional 140–180; BEST-II three-arm <140 / <160 / ≤180 guideline; ENCHANTED intensive 130–140 (within 1 h) vs guideline <180, over 72 h. Each exact to source; no cross-contamination of targets or windows (24 h post-EVT trials, 72 h ENCHANTED).
- **Role mapping:** intensive/lower = intervention; higher/standard = control; BEST-II ≤180 = control, <160 = comparator. Not inverted.
- **ENCHANTED arm:** correctly enriched to the BP-lowering comparison (cOR 1.01 mRS shift), not the alteplase-dose comparison. Confirmed.
- **No false benefit framing:** BP-TARGET neutral, OPTIMAL-BP harm-stopped, BEST-II futility, ENCHANTED neutral, all preserved.
- **Never-drift / em-dash:** additive only; zero em-dash in added blocks.
- **Follow-ups (non-blocking, editorial):** BEST-II shows two sourced reperfusion floors (curated "mTICI 2c+" vs fullEligibility "2b/2c/3") and two clocks (randomization ≤45 min vs BP-initiation ≤60 min); both correct and sourced. A future pass could reconcile wording. Deferred.

---

## Batch 4 — Secondary prevention (SPARCL, SPS3) + OPTIMAS/TIMING note

**Decision:** approve (SPARCL, SPS3)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `sparcl-trial`, `sps3-trial`.
- **SPARCL:** atorvastatin 80 mg/day (intervention) vs placebo (control); entry stroke/TIA 1–6 months, LDL 100–190, no known CHD, ambulatory. Regimen + criteria verbatim; DOI 10.1056/NEJMoa061894 confirmed. Roles not inverted.
- **SPS3 (high-risk, cleared):** ANTIPLATELET arm encoded (aspirin 325 + clopidogrel 75 = intervention/DAPT vs aspirin 325 + placebo = control), matching the record's existing harm framing (mortality HR 1.52, major hemorrhage HR 1.97, recurrent-stroke HR 0.92 NS). NOT the BP arm (2x2 BP target mentioned only as context). No false benefit framing introduced. DOI 10.1056/NEJMoa1204133.
- **Never-drift / em-dash:** additive only; zero em-dash in added blocks.
- **Follow-ups:** none blocking for SPARCL/SPS3.

### OPTIMAS + TIMING — completion needed (not enrichable as-is)
`optimas-trial` (line ~5767) and `timing-trial` (line ~5653) exist as records with stats/design/results bodies but NO curated `inclusionCriteria`/`exclusionCriteria` fields (so the eligibility card renders nothing for them). Completing them requires adding curated criteria + `fullEligibility` + `armDetails`. Evidence extracted + verified from PDFs: OPTIMAS (Werring Lancet 2024, NCT03759938) early DOAC ≤4 days vs delayed 7–14 days, NI margin 2pp, adjusted RD 0.000; TIMING (Oldgren Circulation 2022, NCT02961348) early ≤4 days vs delayed 5–10 days, NI margin 3%, 6.89% vs 8.68% ARD −1.79%. Handled in a dedicated completion pass.

---

## Batch 5 — Prehospital / triage (B_PROUD, BEST-MSU, MR ASAP, RACECAT)

**Decision:** approve (condition resolved)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `b-proud-trial`, `best-msu-trial`, `mr-asap-trial`, `racecat-trial`. Strategy-arm mapping correct (MSU dispatch / mothership = intervention; conventional ambulance / drip-and-ship = control). No inversion, no cross-contamination.
- **MR ASAP threshold CORRECTION (condition resolved):** clinical-reviewer confirmed against `MR ASAP.pdf` (van den Berg, Lancet Neurol 2022) in 3 places that enrollment required SBP ≥140 mm Hg. The existing curated `inclusionCriteria`/`exclusionCriteria` said 120 (a pre-existing error, likely RIGHT-2 contamination). Corrected 120 → 140 in both (lines 11236, 11239); curated + fullEligibility + source now agree. Drug = transdermal glyceryl trinitrate 5 mg/day patch for 24 h vs standard care; negative/harm framing preserved.
- **BEST-MSU:** t-PA per-kg dose intentionally NOT fabricated (not stated in read pages); arm note discloses this. Acceptable.
- **RACECAT neutral preserved** (cOR 1.03, no benefit asserted); strategy-only comparison.
- **Never-drift / em-dash:** additive plus the one source-verified threshold correction; zero em-dash in added blocks.
- **Follow-ups:** none blocking.

---

## Batch 6 — Prehospital GTN/triage/BP + ICAD (RIGHT-2, TRIAGE-STROKE, INTERACT4, WEAVE)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `right-2-trial`, `triage-stroke-trial`, `interact4-trial`, `weave-trial`.
- **Fidelity:** RIGHT-2 transdermal GTN 5 mg/day vs sham (SBP ≥120, distinct from MR ASAP 140 and INTERACT4 150); TRIAGE-STROKE CSC-first bypass vs PSC-first (CSC higher EVT 63% vs 53%, IVT 78% vs 67%); INTERACT4 urapidil intensive SBP 130–140 vs usual care; WEAVE single-arm Wingspan registry. Roles correct, no cross-contamination.
- **INTERACT4 no false benefit:** overall null (cOR 1.00) with diagnosis-differential (hemorrhagic benefit, ischemic harm) preserved; additive only.
- **WEAVE single-arm preserved:** one intervention entry, no fabricated comparator; on-label criteria match source.
- **Never-drift / em-dash:** additive only; zero em-dash in added blocks.
- **Follow-ups (pre-existing TRIAGE-STROKE errors, NOT introduced here; flag for a focused cleanup):** curated `inclusionCriteria` says "RACE score 5 or higher" but the trial used PASS ≥2 (subtitle "suspected LVO" is fine, only the scale name is wrong); pre-existing prose says "planned 424" but source states 600. Deferred.

---

## Batch 7 — Wake-up thrombolysis, edema, neuroprotection, ICH surgery (WAKE-UP, CHARM, ESCAPE-NA1, ENRICH)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8) · **Date:** 2026-06-09

- **Scope:** additive `fullEligibility` + `armDetails` on `wake-up-trial`, `charm-trial`, `escape-na1-trial`, `enrich-trial`. (Note: the batch-7 authoring agent mis-located CHARM/ESCAPE-NA1/ENRICH on its first pass and reported them "not found"; orchestrator confirmed via grep they exist at lines 4784/4893/10559 and re-authored at exact coordinates.)
- **WAKE-UP (Thomalla NEJM 2018):** IV alteplase 0.9 mg/kg vs placebo; DWI-positive/FLAIR-negative mismatch selection; positive-as-published preserved (early funding stop caveat intact).
- **CHARM (Sheth Lancet Neurol 2024):** IV glibenclamide/BIIB093 8.6 mg over 72 h vs placebo; NEUTRAL preserved (common OR 1.17, 95% CI 0.80–1.71, p=0.42); mortality/hypoglycemia signals carried; no benefit framing.
- **ESCAPE-NA1 (Hill Lancet 2020):** nerinetide 2.6 mg/kg (max 270 mg) vs saline, both underwent EVT; ANTERIOR-circulation only CONFIRMED (intracranial ICA or M1; arm note states posterior not enrolled), consistent with the prior circulation correction; NEGATIVE preserved (aRR 1.04); alteplase subgroup labeled hypothesis-generating.
- **ENRICH (Pradilla NEJM 2024):** minimally invasive trans-sulcal parafascicular evacuation (BrainPath + Myriad) vs guideline medical management; Bayesian primary (posterior 0.981, lobar-driven, basal-ganglia futile); NO frequentist p-value/NNT on the primary (NNT only on the safety endpoint); positive preserved.
- **Never-drift / em-dash:** additive only; zero em-dash (en-dash ranges + U+2212 minus signs only).
- **Follow-ups (non-blocking):** (1) verify the CHARM Dec-2024 Lancet Neurology Correction does not alter eligibility (needs WebFetch; current eligibility does not depend on it). (2) ESCAPE-NA1 aRR CI in the new arm note reconciled to the record's published 0.96–1.13 (fixed).
