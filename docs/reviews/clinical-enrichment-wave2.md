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
