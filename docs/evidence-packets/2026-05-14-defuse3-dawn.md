# Evidence Packet — DEFUSE-3 and DAWN (paired, late-window EVT)

**Packet path:** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/2026-05-14-defuse3-dawn.md`

**Scope:** Paired packet for W8.2.2. Both trials are Class E-clinical and are the evidentiary basis for AHA/ASA 2018+ Class I recommendations for EVT in the 6–24 hour window with imaging selection.

**Source documents reviewed:**
- DEFUSE-3 NEJM PDF (Albers et al., NEJM 2018;378(8):708–718) — 11 pages, full text including Tables 1–2, Figures 1–3
- DAWN NEJM PDF (Nogueira et al., NEJM 2018;378(1):11–21) — 11 pages, full text including Tables 1–3, Figures 1–2

---

## PART A — DEFUSE-3

### 1. Canonical citation

- **Title (verbatim):** "Thrombectomy for Stroke at 6 to 16 Hours with Selection by Perfusion Imaging"
- **First author:** Gregory W. Albers, M.D.
- **Year:** 2018 (published online Jan 24, 2018; updated Feb 16, 2018; print Feb 22, 2018)
- **Journal:** New England Journal of Medicine
- **Volume/issue/pages:** N Engl J Med 2018;378(8):708–718
- **DOI:** 10.1056/NEJMoa1713973
- **PMID:** 29364767
- **NCT number:** NCT02586415
- **Funding:** NIH/NINDS (StrokeNet); grants U10NS086487 and U01NS092076. RAPID software provided by iSchemaView.

### 2. Population (verbatim inclusion criteria + generalizability)

- **Time window:** 6–16 hours after last known well (LKW), inclusive of wake-up and unwitnessed onsets.
- **Age:** 18+ (no upper limit). Median 70 y (IQR 59–79) EVT arm; 71 y (59–80) control.
- **Geography:** 38 U.S. centers (single country).
- **Stroke subtype:** Anterior circulation LVO — cervical/intracranial ICA or proximal MCA (M1; one M2 in control arm).
- **NIHSS range:** No floor in protocol; observed median NIHSS 16 (IQR 10–20 EVT; 12–21 control).
- **Imaging selection (the DEFUSE-3 tissue criteria):**
  - Initial ischemic core volume **< 70 mL**
  - Mismatch ratio (perfusion lesion : core) **≥ 1.8**
  - Absolute mismatch volume **≥ 15 mL**
  - Quantified by RAPID software on CTP (75%/71% of arms) or DWI/PWI MRI (25%/29%)
  - LVO confirmed on CTA or MRA
- **Co-enrollment / treatment restrictions:**
  - IV t-PA only if begun within 4.5 h of onset; ~10% of enrolled patients received it.
  - Intra-arterial t-PA not allowed; general anesthesia discouraged.
- **Stratification:** age, core volume, time from onset to enrollment, NIHSS, trial site.

**Generalizability to NeuroWiki audience:** Strong U.S. comprehensive-stroke-center applicability. Requires on-site RAPID-based perfusion imaging. Does **not** generalize to: low-volume centers without automated perfusion software, posterior circulation, pediatric stroke, large established infarcts (core ≥ 70 mL), pre-stroke mRS > 2.

### 3. Intervention and comparator (verbatim)

- **Intervention:** "endovascular therapy plus standard medical therapy" — thrombectomy with any FDA-approved device, at the discretion of the neurointerventionalist; femoral puncture required within 90 minutes of qualifying imaging.
- **Comparator:** "standard medical therapy alone," administered per current American Heart Association guidelines (Jauch 2013) to both groups.
- **Randomization:** 1:1, Web-based dynamic randomization, open-label with blinded outcome assessment (PROBE).

### 4. Primary endpoint (verbatim)

> "The primary efficacy outcome was the ordinal score on the modified Rankin scale (range, 0 [no symptoms] to 6 [death]) at day 90."

- **Time horizon:** 90 days.
- **Assessment:** in-person or telephone by certified rater blinded to assignment.
- **Secondary efficacy:** functional independence (mRS 0–2) at 90 days.
- **Primary safety outcomes:** death within 90 days; symptomatic intracranial hemorrhage within 36 hours (defined as ≥4-point NIHSS increase with hemorrhage on imaging within 36 h of onset).

### 5. Statistical framework

**Primary design type:** `ordinal-shift` (with adaptive enrichment design feature).

Details from Methods:
- Adaptive enrichment design; max planned sample size 476; two pre-planned interim analyses at 200 and 350 evaluable patients.
- Plan modified June 2017 after DAWN results — early interim requested by NIH.
- Primary analysis: **ordinal regression on the full mRS** + stratified Cochran–Mantel–Haenszel test; one-sided Wilcoxon rank-sum testing per SAP, but two-sided p reported with α=0.05.
- **Trial halted early for efficacy** at the early interim: pre-specified efficacy boundary (P<0.0025) crossed at n=182.

### 6. Primary result (verbatim with units)

| Metric | Endovascular (n=92) | Medical (n=90) | Effect | 95% CI | P |
|---|---|---|---|---|---|
| **Primary — mRS shift at 90d** | median mRS 3 (IQR 1–4) | median mRS 4 (IQR 3–6) | **Unadjusted common OR 2.77** | 1.63–4.70 | <0.001 |
| Adjusted common OR | — | — | 3.36 | 1.96–5.77 | <0.001 |
| **Secondary — mRS 0–2 at 90d** | 45% (41/92) | 17% (15/90) | Risk ratio 2.67 | 1.60–4.48 | <0.001 |

**Verified mRS distribution per arm at 90 days (Figure 2, verbatim percent of arm):**

| Arm | mRS 0 | mRS 1 | mRS 2 | mRS 3 | mRS 4 | mRS 5 | mRS 6 |
|---|---|---|---|---|---|---|---|
| **Endovascular (n=92)** | 10 | 16 | 18 | 15 | 18 | 8 | 14 |
| **Medical (n=90)** | 8 | 4 | 4 | 16 | 27 | 16 | 26 |

(Sum-to-100 rounding consistent with NEJM Figure 2. Suitable for Archetype B Grotta Bar 7-value array.)

### 7. Key safety results

| Outcome | EVT | Medical | Effect | P |
|---|---|---|---|---|
| 90-day mortality | 14% (13/92) | 26% (23/90) | RR 0.55 (0.30–1.02) | 0.05 |
| Symptomatic ICH within 36h | 7% (6/92) | 4% (4/90) | RR 1.47 (0.40–6.55) | 0.75 |
| Parenchymal hematoma type 2 | 9% (8/92) | 3% (3/90) | — | 0.21 |
| Early neurologic deterioration | 9% (8/92) | 12% (11/90) | RR 0.71 (0.30–1.69) | 0.44 |
| Serious adverse events | 43% | 53% | — | 0.18 |
| Successful reperfusion (TICI 2b/3) | 76% (69/91) | NA | — | — |

### 8. Expert and editorial caveats

- **Trial stopped early for efficacy** — pre-specified boundary P<0.0025 crossed at n=182 (of 476 planned). Truncation bias risk: early-stopped trials for benefit tend to overestimate effect size. This is the primary caveat to surface in `legend` / `howToInterpret`.
- **Selection-enriched cohort.** Approximately 40% of DEFUSE-3 enrollees would NOT have met DAWN criteria (broader population than DAWN; also enrolled milder strokes and larger cores up to 70 mL). EVT effect was significant in both DAWN-eligible (OR 2.66, 95% CI 1.36–5.23) and DAWN-ineligible (OR 2.96, 95% CI 1.26–6.97) subgroups.
- **Control arm functional independence was unusually low (17%)** — Albers et al. note this may reflect low IV-tPA exposure (~10%) due to late presentation, contributing to large between-arm absolute difference (28 pp).
- **Subgroups underpowered** due to early termination; no heterogeneity detected across pre-specified subgroups (Figure 3).
- **Guideline incorporation:** AHA/ASA 2018 Focused Update on Early Management of AIS (Powers et al.) — **Class I, Level of Evidence A** for mechanical thrombectomy in 6–16h window with DAWN or DEFUSE-3 imaging criteria. Carried forward in 2019 and 2026 updates.

### 9. NeuroWiki field mapping (verified values)

The existing record is at `src/data/trialData.ts` line 4571 (`title: 'DEFUSE 3 Trial'`). Verified values:

| Field | Verified value |
|---|---|
| `doi` | `10.1056/NEJMoa1713973` |
| `pmid` | `29364767` |
| `nctNumber` | `NCT02586415` |
| `primaryEndpoint` (verbatim) | "Ordinal score on the modified Rankin scale (range, 0–6) at day 90" |
| `statisticalFramework` | `ordinal-shift` |
| `displayArchetype` | `grotta-bar` (primary). Secondary mRS 0–2 may be shown as `bar-binary` only with explicit "secondary outcome" label. |
| `primaryResult` (unadjusted common OR + 95% CI) | OR 2.77 (1.63–4.70), P<0.001 |
| `primaryResult.adjusted` | adjusted common OR 3.36 (1.96–5.77) |
| `secondaryResult.mRS02` | EVT 45% vs Medical 17%, RR 2.67 (1.60–4.48), P<0.001 |
| `mRSDistribution.evt` (7-value array) | `[10, 16, 18, 15, 18, 8, 14]` (percent at mRS 0,1,2,3,4,5,6) |
| `mRSDistribution.control` (7-value array) | `[8, 4, 4, 16, 27, 16, 26]` |
| `sich.rate.evt` / `sich.rate.control` | 7% / 4%, P=0.75 |
| `mortality.evt` / `mortality.control` | 14% / 26%, P=0.05 |
| `stoppedEarly.flag` | `true` |
| `stoppedEarly.reason` | "Halted at pre-specified early interim for efficacy (P<0.0025 boundary crossed at n=182 of planned 476)" |
| `timeWindow` | "6–16 hours from last known well" |
| `selectionCriteria` | "Core <70 mL, mismatch ratio ≥1.8, absolute mismatch ≥15 mL on RAPID CTP/MRI; proximal ICA or M1 occlusion" |
| `enrollment.n` | 182 (92 EVT / 90 medical) |
| `centers` | 38 U.S. centers |

**NNT field — DO NOT POPULATE for the primary outcome.** Per skill rule (`clinical-trial-audit/SKILL.md` NNT validity), NNT is not allowed for `ordinal-shift` designs. The common OR does not convert to NNT without a dichotomization assumption. If a sidebar wishes to display NNT, it must be:
- Computed from the **secondary** binary mRS 0–2 outcome only,
- Labelled "**Derived from secondary outcome, not primary**,"
- NNT = 1/(0.45 − 0.17) = 1/0.28 ≈ **3.6**, with explicit caveat that the trial's primary outcome was ordinal.

The existing TASKS.md parking-lot note (2026-05-11) is correct: DEFUSE-3's `nntExplanation` is statistically invalid against the primary outcome. Recommend either removing the NNT field or migrating to an explicitly-flagged "secondary-derived NNT" with the disclaimer above. This is a clinical-content decision for `medical-scientist` and `clinical-reviewer`; this packet flags the issue but does not author the fix.

### 10. doesNotProve framing — DEFUSE-3

DEFUSE-3 does NOT establish:
- Benefit beyond 16 hours from LKW (the upper window boundary tested).
- Benefit for cores ≥70 mL (excluded — see SELECT2, RESCUE-Japan LIMIT, ANGEL-ASPECT for large-core question).
- Benefit in posterior circulation occlusion (tested separately in BAOCHE, ATTENTION).
- Benefit in patients with pre-stroke mRS >2 or severe baseline disability (excluded).
- Benefit when imaging selection is performed without automated perfusion software (RAPID-specific population).
- Benefit in M2 or more distal occlusions in a meaningful proportion (only one M2 in control arm).
- Generalizability outside U.S. comprehensive stroke centers without similar imaging infrastructure.

---

## PART B — DAWN

### 1. Canonical citation

- **Title (verbatim):** "Thrombectomy 6 to 24 Hours after Stroke with a Mismatch between Deficit and Infarct"
- **First author:** Raul G. Nogueira, M.D.
- **Year:** 2018 (published online Nov 11, 2017; print Jan 4, 2018)
- **Journal:** New England Journal of Medicine
- **Volume/issue/pages:** N Engl J Med 2018;378(1):11–21
- **DOI:** 10.1056/NEJMoa1706442
- **PMID:** 29129157
- **NCT number:** NCT02142283
- **Funding:** Stryker Neurovascular (industry-funded; sponsor provided funding and the Trevo device; data managed by Stryker staff with independent statistician oversight). Disclose conflicts of interest in display.

### 2. Population

- **Time window:** 6–24 hours after LKW.
- **Age:** ≥18; stratified into <80y and ≥80y. Mean age 69.4 (EVT) vs 70.7 (control).
- **Geography:** 26 centers in U.S., Canada, Europe, Australia (international, vs DEFUSE-3 U.S.-only).
- **Stroke subtype:** Intracranial ICA or proximal MCA (M1) occlusion on CTA/MRA.
- **Pre-stroke mRS:** 0 or 1 required.
- **NIHSS range:** ≥10 required. Median 17 (IQR 13–21 EVT; 14–21 control).
- **Imaging selection — clinical-imaging mismatch (the DAWN criteria):**
  - **Group A:** age ≥80, NIHSS ≥10, infarct volume <21 mL
  - **Group B:** age <80, NIHSS ≥10, infarct volume <31 mL
  - **Group C:** age <80, NIHSS ≥20, infarct volume 31 to <51 mL
  - Infarct volume measured by DWI MRI or CTP via RAPID/iSchemaView.
- **Exclusions:** intracranial hemorrhage on baseline imaging; infarct involving >1/3 of MCA territory; patients eligible for IV alteplase per standard criteria (i.e., enrolled after the typical thrombolysis window or had persistent occlusion after alteplase).
- **Co-enrollment:** IV alteplase received by 5% (EVT) and 13% (control); most enrolled beyond standard tPA window.

**Generalizability:** International multicenter applicability, but population is narrowly enriched — small infarct cores with severe clinical deficits ("paradoxical mismatch"). Median infarct volume 7.6 mL (EVT) / 8.9 mL (control) — substantially smaller than DEFUSE-3 (median core 9.4 / 10.1 mL but range up to 70 mL).

### 3. Intervention and comparator (verbatim)

- **Intervention:** "thrombectomy plus standard medical care (the thrombectomy group)" — **Trevo device** specifically (Stryker Neurovascular); alternative reperfusion devices used in 3/105 only after Trevo failure (not protocol-permitted as primary).
- **Comparator:** "standard medical care alone (the control group)" per local guidelines; antiplatelet therapy allowed within 24h of randomization in patients without alteplase.
- **Randomization:** 1:1, central Web-based block minimization, stratified by mismatch group (A/B/C), interval to randomization (6–12h vs >12–24h), and occlusion site.

### 4. Primary endpoint (verbatim)

**Co-primary endpoints** (the second was upgraded from secondary to coprimary at FDA request 30 months in, while the trial was still blinded):

> "The first primary end point was the mean score for disability on the utility-weighted modified Rankin scale at 90 days."
>
> "The second primary end point was the rate of functional independence (defined as a score of 0, 1, or 2 on the modified Rankin scale) at 90 days."

- **Utility-weighted mRS (uw-mRS):** weights mRS 0→6 as 10.0, 9.1, 7.6, 6.5, 3.3, 0, 0 respectively (range 0–10; higher = better; opposite directionality from standard mRS).
- **Time horizon:** 90 days.
- **Primary safety:** stroke-related death at 90 days. Other safety: neurologic deterioration (NIHSS increase ≥4 within 5d), sICH per ECASS III definition within 24h.

### 5. Statistical framework

**Primary design type:** `bayesian` (Bayesian adaptive enrichment, with confirmatory analyses producing posterior probabilities of superiority).

- Adaptive enrichment design; sample size 150–500 patients; pre-specified interim analyses for futility, enrichment, success.
- Bayesian general linear model with adjustment for baseline infarct volume; assumed normal distribution for analysis.
- **Stopping threshold:** posterior probability of superiority **≥ 0.986** (one-sided, increased from 0.975 for enrichment and sample size variation).
- 86% power to detect a between-group difference of 1.0 on the uw-mRS.
- **Trial stopped early at 31 months** for **predictive probability of success (PPS) ≥ 95%** on the first primary endpoint — *interim success*, not futility. Per the article: "the results of an interim analysis met the prespecified criterion for trial discontinuation, which was a predictive probability of superiority of thrombectomy of at least 95% for the first primary end point."
- Sample at stopping: 206 patients (planned up to 500).

### 6. Primary result

**First primary — utility-weighted mRS at 90 days (Table 2):**

| Metric | Thrombectomy (n=107) | Control (n=99) | Adjusted difference | 95% Credible Interval | Posterior probability of superiority |
|---|---|---|---|---|---|
| Mean uw-mRS score | 5.5 ± 3.8 | 3.4 ± 3.1 | **+2.0 points** | 1.1 to 3.0 | **>0.999** |
| (Unadjusted absolute difference) | — | — | 2.1 | 1.2–3.1 | — |

**Second primary — functional independence (mRS 0–2) at 90 days:**

| Metric | Thrombectomy | Control | Adjusted difference | 95% CrI | Posterior probability |
|---|---|---|---|---|---|
| mRS 0–2 | 49% (52/107) | 13% (13/99) | **33 percentage points** | 21–44 | **>0.999** |

**Verified mRS distribution per arm at 90 days (Figure 1, Panel A, ITT population, percent of arm):**

The NEJM Figure 1 grouped mRS 5 and 6 into a single bar (mRS 5–6 combined). The DAWN paper does NOT publish the 7-value mRS distribution with mRS 5 and mRS 6 disaggregated in the main text. Verified 6-value array:

| Arm | mRS 0 | mRS 1 | mRS 2 | mRS 3 | mRS 4 | mRS 5–6 (combined) |
|---|---|---|---|---|---|---|
| **Thrombectomy (n=107)** | 9 | 22 | 17 | 13 | 13 | 25 |
| **Control (n=99)** | 4 | 4 | 5 | 16 | 34 | 36 |

(Note: the second-row "5" between "4" and "5" in Panel A reads from NEJM Figure 1 Panel A directly; arms sum to ~99–100% with rounding.)

**Blocking concern for Archetype B (Grotta Bar 7-value array):** DAWN's primary publication does not disaggregate mRS 5 vs mRS 6. To produce a 7-value array, the supplementary appendix (Table S2 referenced in the article) or DAWN secondary publications must be consulted. **Recommendation:** display DAWN as a 6-segment Grotta-style bar with mRS 5–6 fused, OR pull the disaggregated values from the Supplementary Appendix Section S1 (90-day mRS by ITT) before rendering a 7-value chart. **If a 7-value chart is rendered using a fabricated split between 5 and 6, that is a display error and must be blocked.**

For mortality disaggregation only, from Table 3: 90-day mortality 16% (stroke-related death) in EVT vs 18% control, total all-cause death 19% vs 18%. This permits an approximate split of the mRS 5–6 combined bar into mRS 6 ≈ 19% (EVT) / 18% (control) and mRS 5 ≈ 6% (EVT) / 18% (control), but **this is reconstructed and should be labelled as such or sourced from the supplement**.

### 7. Key safety results (Table 3)

| Outcome | Thrombectomy (n=107) | Control (n=99) | Absolute difference (95% CI) | Risk ratio (95% CI) |
|---|---|---|---|---|
| Stroke-related death at 90d | 16% (17) | 18% (18) | −2 pp (−13 to 8) | 1 (1–2) |
| All-cause death at 90d | 19% (20) | 18% (18) | +1 pp (−10 to 11) | 1 (1–2) |
| Symptomatic ICH at 24h | 6% (6) | 3% (3) | +3 pp (−3 to 8), P=0.50 | 2 (1–7) |
| Neurologic deterioration at 24h | 14% (15) | 26% (26) | −12 pp (−23 to −1), P=0.04 | 1 (0–1) |
| Procedure-related complications | 7% (7) | NA | — | — |

Mortality (16% vs 18%) and sICH (6% vs 3%) did **not** differ significantly. Neurologic deterioration was significantly reduced.

### 8. Expert and editorial caveats

- **Trial stopped early at 31 months for interim success** — same truncation-bias caveat as DEFUSE-3 (early stopping for benefit tends to overestimate effect size). Trial planned for up to 500 patients; stopped at 206.
- **Industry-funded (Stryker Neurovascular)** — sponsor provided funding, devices, and data management staff. Independent statistician oversight noted. Many investigators report financial relationships with Stryker, Medtronic, Penumbra, MicroVention. Disclose in surface text.
- **Trevo device only** in the protocol — generalization to other stent retrievers / aspiration catheters is inferential.
- **Narrow selection — only ~one-third of late-presenting LVO patients** would meet DAWN imaging criteria (per the discussion section, based on retrospective studies of late-window LVO populations).
- **Control-arm outcomes unusually low (13% mRS 0–2)** — authors note this may relate to low alteplase exposure (14% vs 88% in pooled 6-h thrombectomy trials) and to enrichment for adverse prognostic features (age ≥80, NIHSS ≥10 after alteplase).
- **Coprimary endpoint promotion** mid-trial: the second primary (mRS 0–2) was upgraded from secondary to coprimary 30 months in, while still blinded, at FDA request. No multiplicity adjustment was made for the coprimary or secondary endpoints (authors disclose this).
- **uw-mRS interpretation** is unfamiliar to most clinicians — the metric weights mild disability much more heavily than severe disability. A 2.0-point uw-mRS difference is clinically meaningful but is not equivalent to "2 fewer mRS grades."
- **Guideline incorporation:** AHA/ASA 2018 Focused Update (Powers et al.) — **Class I, Level of Evidence A** for mechanical thrombectomy in 6–24h window for patients meeting DAWN eligibility criteria. Reaffirmed in subsequent updates through 2026.

### 9. NeuroWiki field mapping (verified values)

The existing record is at `src/data/trialData.ts` line 4653 (`title: 'DAWN Trial'`). Verified values:

| Field | Verified value |
|---|---|
| `doi` | `10.1056/NEJMoa1706442` |
| `pmid` | `29129157` |
| `nctNumber` | `NCT02142283` |
| `primaryEndpoint` (verbatim) | "Mean score on the utility-weighted modified Rankin scale at 90 days (coprimary) AND rate of functional independence (mRS 0–2) at 90 days (coprimary)" |
| `statisticalFramework` | `bayesian` (with adaptive enrichment) |
| `displayArchetype` | `grotta-bar` for the mRS distribution (note 6-value array unless supplement consulted); a separate display panel may show uw-mRS as a mean-difference bar with credible interval, but **uw-mRS is not a standard bar-binary archetype** — this is the missing component flagged in the TASKS.md note. |
| `primaryResult.uwmRS` | Mean uw-mRS 5.5 vs 3.4; adjusted difference +2.0 (95% CrI 1.1–3.0); posterior probability of superiority >0.999 |
| `primaryResult.mRS02` | 49% vs 13%; adjusted difference +33 pp (95% CrI 21–44); posterior probability >0.999 |
| `mRSDistribution.evt` (6-value, mRS 5–6 fused) | `[9, 22, 17, 13, 13, 25]` |
| `mRSDistribution.control` (6-value, mRS 5–6 fused) | `[4, 4, 5, 16, 34, 36]` (rounded as published) |
| `sich.rate.evt` / `sich.rate.control` | 6% / 3%, P=0.50 |
| `mortality.evt` / `mortality.control` | 19% (all-cause) / 18%, P=1.00 |
| `stoppedEarly.flag` | `true` |
| `stoppedEarly.reason` | "Halted at pre-specified interim for success (predictive probability of superiority ≥ 0.95 for first primary endpoint, at 31 months / n=206 of planned up to 500)" |
| `timeWindow` | "6–24 hours from last known well" |
| `selectionCriteria` | "Clinical-imaging mismatch: Group A (≥80y, NIHSS ≥10, core <21 mL); Group B (<80y, NIHSS ≥10, core <31 mL); Group C (<80y, NIHSS ≥20, core 31–<51 mL); ICA or M1 occlusion; pre-stroke mRS 0–1; RAPID/iSchemaView quantification" |
| `enrollment.n` | 206 (107 EVT / 99 control) |
| `centers` | 26 centers in U.S., Canada, Europe, Australia |
| `funding.disclosure` | "Industry-funded (Stryker Neurovascular); sponsor provided funding, Trevo device, and data management with independent statistician oversight" |

**NNT field — DO NOT POPULATE in the conventional sense.** Per skill rule, NNT is not allowed for `bayesian` designs (posterior probability ≠ ARD). However:
- The **second coprimary** is a binary outcome (mRS 0–2) with an adjusted absolute difference of 33 pp (95% CrI 21–44). The trial discussion explicitly states "for every 2.8 patients who underwent thrombectomy, 1 additional patient had functional independence at 90 days," equating to **NNT ≈ 2.8** (= 1/0.36 from the unadjusted 49% − 13%; 1/0.33 from adjusted = 3.0).
- If displayed, this NNT must be:
  - Labelled as **derived from the binary coprimary (mRS 0–2)**, not the primary uw-mRS.
  - Accompanied by the credible-interval range and the Bayesian framework caveat (this NNT was reported by the trialists themselves and is acceptable to surface).
  - Not framed as a frequentist superiority NNT.

**TASKS.md note on uw-mRS:** Confirmed accurate. The uw-mRS is not used in any existing NeuroWiki page. To honestly display DAWN's primary result, a new teaching component is required — either an extended `howToReadChart` Q&A explaining utility weighting, or a dedicated uw-mRS panel. Until that component exists, DAWN can be safely displayed using the **second coprimary** (mRS 0–2 binary) as the headline result, with a footnote that "the trial's first primary endpoint was the utility-weighted mRS at 90 days; both coprimaries crossed the pre-specified Bayesian success threshold (posterior probability >0.999)."

### 10. doesNotProve framing — DAWN

DAWN does NOT establish:
- Benefit beyond 24 hours from LKW.
- Benefit in patients without clinical-imaging mismatch (i.e., concordant deficit-and-core, large cores ≥51 mL, or mild deficits below NIHSS 10).
- Benefit with stent retrievers or aspiration devices other than the Trevo (single-device protocol).
- Benefit in posterior circulation occlusion (anterior-circulation only; addressed by BAOCHE / ATTENTION).
- Generalizability outside high-volume centers with on-site automated perfusion software (RAPID/iSchemaView).
- A frequentist superiority effect size in the traditional sense — results are posterior probabilities under a Bayesian framework.
- Benefit in patients with pre-stroke mRS >1 (excluded).
- Whether the same effect would hold without the FDA-requested mid-trial coprimary promotion or without multiplicity adjustment.

---

## PART C — Paired analysis: where DEFUSE-3 and DAWN overlap and differ

### Selection-criteria contrast

| Dimension | DEFUSE-3 | DAWN |
|---|---|---|
| Time window from LKW | 6–16 h | 6–24 h |
| Selection paradigm | **Tissue mismatch** (penumbra-to-core) | **Clinical-imaging mismatch** (deficit-to-core) |
| Core volume cutoff | <70 mL | <21 / <31 / <51 mL (tiered by age and NIHSS) |
| Mismatch metric | Perfusion ≥1.8× core, absolute mismatch ≥15 mL | NIHSS severity vs core volume per Group A/B/C |
| NIHSS floor | None (no protocol floor) | ≥10 |
| Pre-stroke mRS | Not strictly specified | 0 or 1 only |
| Imaging modality | RAPID CTP or DWI/PWI MRI | RAPID CTP or DWI MRI |
| Population breadth | Broader — larger cores up to 70 mL, milder strokes | Narrower — small cores, severe deficits |
| Statistical design | Adaptive ordinal-shift (frequentist) | Bayesian adaptive enrichment |
| Primary outcome | Ordinal mRS shift at 90d | uw-mRS (primary) + mRS 0–2 (coprimary) |

### Overlap

- Both anterior-circulation LVO (ICA or M1).
- Both used automated perfusion software (RAPID / iSchemaView) for core quantification.
- Both stopped early for benefit — both subject to truncation-bias concerns.
- ~40% of DEFUSE-3 enrollees would NOT have met DAWN criteria (DEFUSE-3 subgroup analysis Figure 3: OR 2.66 in DAWN-eligible subgroup, OR 2.96 in DAWN-ineligible subgroup — both significant, supporting broader applicability of tissue-based selection).

### AHA/ASA guideline that combines them

**AHA/ASA 2018 Focused Update on Early Management of AIS (Powers et al., Stroke 2018; updated 2019, 2026):**
- **Class I, Level of Evidence A** — In selected patients with AIS within 6–16 hours of LKW who have LVO in the anterior circulation and meet **DAWN or DEFUSE-3 criteria**, mechanical thrombectomy is recommended.
- **Class IIa, Level of Evidence B-R** — In selected patients with AIS within 16–24 hours of LKW who have LVO in the anterior circulation and meet **DAWN criteria**, mechanical thrombectomy is reasonable.

The two trials are guideline-paired: neither is "preferred" over the other; **either set of imaging criteria** qualifies a late-presenting patient for EVT.

### Combined doesNotProve

Together, DEFUSE-3 and DAWN do **not** answer:
- Whether **non-mismatch** late-window LVO patients benefit from EVT (addressed for large cores by SELECT2, ANGEL-ASPECT, RESCUE-Japan LIMIT 2022–2023).
- Whether EVT is beneficial **without automated perfusion software** at centers lacking RAPID/iSchemaView (operational generalizability).
- Whether late-window EVT is beneficial in **posterior circulation** (BAOCHE, ATTENTION).
- Whether late-window EVT is beneficial **>24h** from LKW (no RCT evidence).
- The **comparative effectiveness** of tissue-based vs clinical-imaging selection — no head-to-head trial.

---

## Verification confidence

**HIGH** for both trials.

- DOIs both resolve to the cited NEJM articles.
- Trial titles match the repo's references exactly.
- Primary endpoints, statistical frameworks, point estimates, confidence/credible intervals, and safety outcomes all extracted verbatim from the published Methods and Results sections.
- PMIDs verified via DOI/PubMed cross-reference (29364767 for DEFUSE-3; 29129157 for DAWN — standard published values).
- Population, intervention, comparator, and editorial caveats all sourced from full-text Methods and Discussion sections.

**One MEDIUM-confidence flag for DAWN only:** the published Figure 1 does not disaggregate mRS 5 vs mRS 6, so a 7-value Grotta Bar array requires the Supplementary Appendix Section S1/Table S2 (not included in the 11-page PDF supplied for this packet). For Archetype B rendering, either consult the supplement or display as a 6-value (mRS 5–6 fused) bar with a clear label. **This is the only display-level limitation in the packet.**

---

## Blocking flags forwarded to downstream agents

1. **DEFUSE-3 NNT (`medical-scientist` / `clinical-reviewer` decision required):** Existing `nntExplanation` field, if computed against the primary ordinal outcome, is statistically invalid per skill rule. Resolution options: (a) remove NNT field, or (b) re-anchor NNT to the secondary binary outcome with explicit "secondary-derived" label and the 1/(0.45−0.17)≈3.6 derivation. This packet does not author the fix.

2. **DAWN 7-value Grotta Bar array (`evidence-verifier` follow-up):** Supplementary Appendix required to disaggregate mRS 5 vs mRS 6. Until then, display 6-value array (mRS 5–6 fused) or build a new uw-mRS teaching component as TASKS.md flagged.

3. **DAWN uw-mRS teaching component (`ui-architect` / `content-writer` task, Class C-clinical):** The first primary endpoint is uw-mRS, which has no existing surface in NeuroWiki. Faithful representation requires either an extended `howToReadChart` Q&A explaining the weights `[10.0, 9.1, 7.6, 6.5, 3.3, 0, 0]` for mRS 0→6, or a dedicated uw-mRS panel. Not blocking for DAWN's secondary mRS 0–2 display.

4. **DAWN industry-funding disclosure (`compliance-legal` / `content-writer`):** Stryker funded the trial, provided the device, and managed the data (with independent statistician oversight). The trial page must disclose this on the surface, not buried in a footer.

---

## Files referenced (read-only — no edits performed)

- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/DEFUSE 3 .pdf`
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/DAWN Trial.pdf`
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts` (existing DEFUSE-3 entry at line 4571; existing DAWN entry at line 4653 — read-only inspection only)

**Status:** Packet ready. Both trials verified at HIGH confidence (with one MEDIUM-confidence flag for DAWN's 7-value mRS disaggregation that does not block the packet but constrains downstream display choices). No source files edited. No commits made.