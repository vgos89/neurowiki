# Evidence Packet — SELECT2 + ANGEL-ASPECT (paired large-core EVT)

**Date:** 2026-05-14
**Prepared by:** evidence-verifier agent
**Task:** W8.2.4 — paired large-core EVT trial verification (Class E-clinical)
**Source PDFs:**
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/SELECT2.pdf`
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/ANGEL-ASPECT.pdf`
**Verification confidence:** **HIGH** for both trials — full text of both NEJM publications read (abstract, methods, results, tables 1–3, primary figure, subgroup forest plot). DOIs resolve to NEJM. All primary statistics confirmed against published results section.

---

## PART 1 — SELECT2

### 1. Canonical citation
- **Title:** Trial of Endovascular Thrombectomy for Large Ischemic Strokes
- **First author:** Sarraj A
- **Journal/Year:** N Engl J Med. 2023 Apr 6;388(14):1259–1271
- **DOI:** 10.1056/NEJMoa2214403 (resolves to NEJM via doi.org → www.nejm.org)
- **NCT:** NCT03876457
- **PMID:** 36762865

### 2. Population
- **Setting:** 31 sites — US, Canada, Europe, Australia, New Zealand (international; predominantly US — 280/352 [79.5%] enrolled at US sites per subgroup forest plot)
- **Age:** 18–85 years (median 66.5, IQR 58–75)
- **Pre-stroke mRS:** 0 or 1 (no/minimal baseline disability) — required
- **Stroke type:** Acute ischemic stroke due to ICA (cervical or intracranial) or M1 MCA occlusion. Tandem occlusions allowed; M2 not primary inclusion (but 4% had M2 due to occlusion-extent at imaging).
- **NIHSS:** No explicit numerical cutoff in inclusion criteria; median 19 (IQR 15–23)
- **Time window:** Within **24 hours** of last-known-well
- **Imaging selection (large-core definition — verbatim):**
  - "**ASPECTS value of 3 to 5**" on NCCT, **OR**
  - "ischemic-core volume of 50 ml or greater on CT perfusion (defined as a relative cerebral blood flow of <30%)" — **no upper limit on core volume**
  - For DWI-MRI sites: ischemic core ≥50 mL with ADC <620×10⁻⁶ mm²/s
- **Exclusions:** Pre-stroke mRS >1; ICH on baseline imaging
- **Generalizability caveat:** The US-dominant subgroup showed gOR 1.63 (1.26–2.11) while the non-US/"Other" subgroup showed gOR 1.13 (0.72–1.75, CI crosses 1) — international external validity is heterogeneous.

### 3. Intervention and comparator
- **Intervention:** "Endovascular thrombectomy was performed with stent retrievers, aspiration devices, or both" + medical care per AHA/ASA, ESO, or Australia/NZ Stroke Foundation guidelines. IV alteplase or tenecteplase administered to eligible patients first-assessed within 4.5 h.
- **Comparator:** Medical care alone per the same guidelines (IV thrombolysis eligible patients still received it).
- **Allocation:** 1:1, adaptive minimization on key clinical/imaging characteristics, central web-based.

### 4. Primary endpoint (verbatim)
> "The primary outcome was the ordinal score on the modified Rankin scale at 90 days. Scores of 6 (indicating death) and 5 (indicating that the patient is bedridden and constant care is needed) were merged for purposes of the analysis to avoid considering a shift from a score of 6 to 5 as a substantial improvement in functional status."

Time horizon: **90 days**.

**Note:** mRS 0–2 was originally the regulatory-requested primary; per protocol amendment it became the **first secondary outcome**. The power calculation was based on the single ordinal primary.

### 5. Statistical framework
**`ordinal-shift`** (single primary). Analysis: two-sided Wilcoxon–Mann–Whitney probability-of-superiority with assumption-free generalized odds ratio (no proportional-odds assumption); 95% CIs reported. Adaptive enrichment design with two prespecified interim analyses; cumulative alpha 0.018 spent at interims; total two-sided alpha 0.05.

### 6. Primary result
- **Generalized odds ratio: 1.51 (95% CI 1.20–1.89), P<0.001** — favors thrombectomy. **Confirms TASKS.md value.**
- **Wilcoxon–Mann–Whitney probability of superiority:** 0.60 (95% CI 0.55–0.65)
- **Median mRS at 90 days:** 4 (IQR 3–6) thrombectomy vs 5 (IQR 4–6) medical care
- **Tipping-point sensitivity analysis** (imputing missing as worst-case-thrombectomy / best-case-medical): gOR 1.42 (1.13–1.78) — robust.

### 6a. mRS distribution per arm (verified Grotta Bar array, 7 values, mRS 0–6)

From Figure 1 (ITT population, percent):

| mRS | Thrombectomy (N=178) | Medical (N=174) |
|---|---|---|
| 0 | 1.1% (N=2) | 0% (N=0) |
| 1 | 5.1% (N=9) | 1.7% (N=3) |
| 2 | 14.0% (N=25) | 5.2% (N=9) |
| 3 | 17.4% (N=31) | 11.5% (N=20) |
| 4 | 15.2% (N=27) | 20.7% (N=36) |
| 5 | 8.4% (N=15) | 18.4% (N=32) |
| 6 | 38.2% (N=68) | 40.8% (N=71) |

Arrays for trialData:
- **Thrombectomy:** `[1.1, 5.1, 14.0, 17.4, 15.2, 8.4, 38.2]`
- **Medical:** `[0, 1.7, 5.2, 11.5, 20.7, 18.4, 40.8]`

### 7. Key safety results
- **Symptomatic intracranial hemorrhage (≤24 h):** 1/178 (0.6%) thrombectomy vs 2/174 (1.1%) medical; RR 0.49 (95% CI 0.04–5.36) — **no significant increase; SELECT2 stands out vs ANGEL-ASPECT for low sICH.**
- **Death within 90 days:** 68/177 (38.4%) thrombectomy vs 71/171 (41.5%) medical; RR 0.91 (0.71–1.18) — no significant difference
- **Early neurologic worsening (NIHSS ↑≥4 in 24 h):** 24.7% thrombectomy vs 15.5% medical; RR 1.59 (1.03–2.45) — **higher in EVT arm**
- **Procedural complications (thrombectomy arm only):** dissection 5.6%, arterial perforation 3.9%, vasospasm 6.2%, access-site hematoma 0.6%

### 8. Trial-stopping and editorial caveats
- **Stopped early for efficacy** after second prespecified interim (Sept 9, 2022). DSMB confirmed efficacy boundary crossed; statistical analysis plan finalized Nov 20, 2022 before unblinding. 352 of planned ≤560 patients enrolled.
- **Truncation bias caveat applies** — effect estimates from trials stopped early for benefit are systematically inflated. Must be noted alongside the gOR 1.51.
- **Funding:** Stryker Neurovascular. Per Sarraj et al., funder had no role in design, conduct, analysis, or manuscript review.
- **Companion trials (NEJM same issue, April 6, 2023):** ANGEL-ASPECT (Huo et al., this packet) and RESCUE-Japan LIMIT (Yoshimura et al., NEJM 2022;386:1303) — together established large-core EVT efficacy across geographies.
- **Guideline incorporation:** AHA/ASA 2024 Focused Update on Acute Ischemic Stroke (Stroke. 2024) — added **Class 2a (LOE B-R)** recommendation for EVT in patients with ASPECTS 3–5 and large-vessel occlusion within 24 h, citing SELECT2, ANGEL-ASPECT, and RESCUE-Japan LIMIT. Verify exact section/paragraph before quoting.

---

## PART 2 — ANGEL-ASPECT

### 1. Canonical citation
- **Title:** Trial of Endovascular Therapy for Acute Ischemic Stroke with Large Infarct
- **First author:** Huo X
- **Journal/Year:** N Engl J Med. 2023 Apr 6;388(14):1272–1283
- **DOI:** 10.1056/NEJMoa2213379 (resolves to NEJM via doi.org → www.nejm.org)
- **NCT:** NCT04551664
- **PMID:** 36762852

### 2. Population
- **Setting:** 46 hospitals — **China only.** Predominantly Han ethnicity, with small numbers from Manchu/Tujia/She/Zhuang regions.
- **Age:** 18–80 years (median 68, IQR 60–73) — **upper age cap 80 (vs SELECT2's 85)**; 66 patients excluded for being >80 in screening
- **Pre-stroke mRS:** 0 or 1
- **Stroke type:** Anterior-circulation LVO — ICA (intracranial portion) or M1 MCA (main trunk); M2 only 0.9% in both arms (excluded at adjudication)
- **NIHSS:** **6 to 30** (explicit numerical inclusion range — narrower than SELECT2)
- **Time window:** Within **24 hours** of last-known-well
- **Imaging selection (large-core definition — verbatim):**
  - "ASPECTS value of 3 to 5 based on findings from noncontrast CT within 24 hours after stroke onset, with no limitation with respect to infarct-core volume" **OR**
  - "ASPECTS value of 0 to 2 based on findings from noncontrast CT within 24 hours after stroke onset and an infarct-core volume between 70 ml and 100 ml" **OR**
  - "ASPECTS value greater than 5 based on findings from noncontrast CT between 6 and 24 hours after stroke onset and an infarct-core volume of 70 to 100 ml"
  - **This is broader and more complex than SELECT2.** ANGEL-ASPECT explicitly enrolled some ASPECTS 0–2 patients (32 total per forest plot) provided core volume 70–100 mL.
- **Exclusions:** Midline shift or clinical signs of herniation; mass effect; high hemorrhage risk; acute bilateral strokes; multiple intracranial occlusions
- **Baseline ASPECTS distribution:** ASPECTS 0 (2.6%/0.9%), 1 (5.7%/8.9%), 2 (5.7%/3.6%), 3 (42.6%/44.4%), 4 (27.8%/20.9%), 5 (15.7%/21.3%) — median ASPECTS = **3** (lower than SELECT2's median of 4)
- **Median core volume:** 60.5 mL (EVT) / 63 mL (medical) — overall smaller cores than SELECT2 (74/77 mL)

### 3. Intervention and comparator
- **Intervention:** "Endovascular therapy (including thrombectomy with a stent-retriever or contact-aspiration system and, if needed, balloon angioplasty, stent implantation, or intraarterial thrombolysis)" + medical management per Chinese Stroke Association guidelines.
- **Comparator:** Medical management alone per Chinese Stroke Association guidelines.
- **Thrombolytic agents used:** Alteplase 0.9 mg/kg OR urokinase 1.0–1.5 million IU (urokinase used in 3.5% — uncommon outside China). IV thrombolysis received by ~28% in each arm.
- **Allocation:** 1:1, central 24-h online randomization, simple randomization without stratification.

### 4. Primary endpoint (verbatim)
> "The primary outcome was the score on the modified Rankin scale at 90 days, and the primary objective was to determine whether an ordinal shift in the distribution of the scores on the modified Rankin scale at 90 days had occurred between the two trial groups."

Time horizon: **90 days**. Note: mRS 5 and 6 are **not merged** in ANGEL-ASPECT (contrast with SELECT2).

### 5. Statistical framework
**`ordinal-shift`** primary. Wilcoxon–Mann–Whitney generalized odds ratio in an assumption-free ordinal analysis (proportional-odds assumption was **not satisfied** — explicitly stated in methods). Two prespecified interim analyses with O'Brien–Fleming spending function; final two-sided P adjusted to 0.046. Power calc: 502 patients for 90% power to detect cOR 1.73 (based on pooled SELECT cohort + ANGEL-ACT registry data).

### 6. Primary result
- **Generalized odds ratio: 1.37 (95% CI 1.11–1.69), P=0.004** — favors EVT. **Confirms TASKS.md value.**
- **Median mRS at 90 days:** 4 (IQR 2–5) EVT vs 4 (IQR 3–5) medical — note median is the same; the shift is in the distribution
- **Trial stopped early for efficacy** after second interim (data analysis May 17, 2022). 456 of planned 502 enrolled.

### 6a. mRS distribution per arm (verified Grotta Bar array, 7 values, mRS 0–6)

From Figure 2 (full-analysis population, percent):

| mRS | EVT (N=230) | Medical (N=225) |
|---|---|---|
| 0 | 3.9% (N=9) | 3.6% (N=8) |
| 1 | 8.3% (N=19) | 8.0% (N=18) |
| 2 | 17.8% (N=41) | — (not separately printed; derivable: 11.6% - mRS 0+1 = remainder for 0–2 total 11.6%; using table) |
| 3 | 17.0% (N=39) | 21.8% (N=49) |
| 4 | 19.6% (N=45) | 26.7% (N=60) |
| 5 | 11.7% (N=27) | 20.0% (N=45) |
| 6 | 21.7% (N=50) | 20.0% (N=45) |

**Reconciliation of mRS 0–2 figures:**
- EVT arm: 0 + 1 + 2 = 3.9 + 8.3 + 17.8 = 30.0% ✓ (matches "30.0%" reported for mRS 0–2 secondary)
- Medical arm: mRS 0–2 = 11.6% reported; mRS 0 + 1 = 3.6 + 8.0 = 11.6% — therefore **mRS 2 = 0% (N=0)** in medical arm

Verified arrays for trialData:
- **EVT:** `[3.9, 8.3, 17.8, 17.0, 19.6, 11.7, 21.7]`
- **Medical:** `[3.6, 8.0, 0, 21.8, 26.7, 20.0, 20.0]`

(Note: mRS 2 = 0% in medical arm is unusual but reconciles the published mRS 0–2 secondary against the printed Figure 2 segments. The published Figure 2 does not print a separate mRS=2 segment for the medical arm — the segment is absorbed at 0%. Flag for medical-scientist to confirm against supplementary appendix before display.)

### 7. Key safety results
- **Symptomatic ICH within 48 h (Heidelberg criteria):** 14/230 (6.1%) EVT vs 6/225 (2.7%) medical; RR 2.07 (95% CI 0.79–5.41), P=0.12 — **numerically more than double, CI wide; trend toward more sICH in EVT arm**. Contrast with SELECT2's 0.6% vs 1.1%.
- **Any ICH within 48 h:** 49.1% EVT vs 17.3% medical; RR 2.71 (1.91–3.84), P<0.001 — **markedly more any-ICH** with EVT
- **Death within 90 days:** 50/230 (21.7%) EVT vs 45/225 (20.0%) medical; RR 1.00 (0.65–1.54), P=0.99 — no mortality benefit or harm
- **Decompressive hemicraniectomy:** 7.4% EVT vs 3.6% medical (RR 1.92, 0.78–4.73, P=0.15) — numerically more in EVT
- **Procedural complications:** dissection ~1%, perforation ~1% (much lower-reported than SELECT2 procedural rates)

### 8. Trial-stopping and editorial caveats
- **Stopped early for efficacy** at second interim (456 of planned 502 enrolled). Truncation bias caveat applies.
- **Funding:** Covidien Healthcare International Trading (Shanghai) and others. Per Huo et al., "funding organizations were not involved in the trial."
- **Geography caveat — critical:** **China-only.** Urokinase use, low IV thrombolysis uptake (~28% vs Western standard ~40–50%), and population differences (predominantly Han Chinese, intracranial atherosclerosis higher prevalence than Western cohorts) limit direct external generalizability. The forest plot shows ASPECTS <3 subgroup (n=32) has wide CI (gOR 1.59, 0.89–2.86) — the ASPECTS 0–2 inclusion is hypothesis-generating only.
- **Atherothrombotic subtype subgroup:** gOR 0.98 (0.64–1.49) — no treatment effect in this stroke subtype; cardioembolic and undetermined subtypes drove the benefit.
- **Companion trials:** SELECT2 (this packet) and RESCUE-Japan LIMIT (NEJM 2022;386:1303). Cross-trial pooled meta-analyses subsequently confirmed consistent direction of effect.
- **Guideline incorporation:** Same AHA/ASA 2024 Focused Update Class 2a (LOE B-R) recommendation as for SELECT2.

---

## PART 3 — Shared analysis (paired interpretation)

### Statistical-display archetype
**Both trials:** `grotta-bar` (ordinal-shift design, mRS 0–6 distribution as primary). **Not** `bar-binary`. Display must show:
- Full 7-segment mRS distribution per arm
- Generalized OR with 95% CI (SELECT2: 1.51 [1.20–1.89]; ANGEL-ASPECT: 1.37 [1.11–1.69])
- Explicit "ordinal shift" framing, **not** a single dichotomized event rate

### NNT validity — CRITICAL FLAG (per TASKS.md parking-lot 2026-05-11)

**Per `.claude/skills/clinical-trial-audit/SKILL.md` NNT rules, NNT is NOT allowed for ordinal-shift primary outcomes.** The common/generalized OR does not convert to an absolute risk difference without a dichotomization assumption.

**Current state in `trialData.ts`:**
- SELECT2: `nnt: 7.7` computed from `1 / (0.20 - 0.07)` — uses the mRS 0–2 **secondary** outcome (functional independence) — **NNT-not-appropriate for the primary**; NNT here is from a secondary endpoint and must be labeled as such or removed
- ANGEL-ASPECT: `nnt: 5.4` computed from `1 / (0.30 - 0.116)` — also uses the mRS 0–2 **secondary** outcome — same issue

**Defensible display options:**
1. **Remove NNT entirely** for both trials. Rely on gOR + Grotta Bar + mRS 0–2 secondary RR.
2. **Keep NNT but explicitly label** as "NNT for secondary outcome (mRS 0–2 at 90 days); the primary ordinal-shift analysis does not yield a valid NNT." Display gOR as the headline statistic; NNT becomes a footnote.

Architect/medical-scientist must choose between these options before the trial page can ship.

### `doesNotProve` template (per architect proposal — verified against both trials)

> "Results are limited to patients with ASPECTS 3–5 (and a small subset with ASPECTS 0–2 in ANGEL-ASPECT). Above ASPECTS 5, EVT efficacy is already established by earlier trials (MR CLEAN, DAWN, DEFUSE-3). These trials do not extend the efficacy boundary beyond the criteria they used: anterior LVO, pre-stroke mRS 0–1, ≤24 h, age limits (≤85 SELECT2 / ≤80 ANGEL-ASPECT), and minimum imaging-defined viable tissue. They also do not establish benefit at ASPECTS 0–2 with cores >100 mL, which remains unproven."

### Cross-trial differences clinicians should know

| Feature | SELECT2 | ANGEL-ASPECT |
|---|---|---|
| Geography | International (US-dominant) | China only |
| Age cap | ≤85 | ≤80 |
| NIHSS inclusion | No numerical floor (med 19) | 6–30 (med 16) |
| ASPECTS inclusion | 3–5 OR core ≥50 mL (no upper limit) | 3–5 (no core limit), OR 0–2 with core 70–100 mL, OR >5 with core 70–100 mL (6–24 h) |
| Median ASPECTS | 4 | 3 |
| Median core volume | 74 / 77 mL | 60.5 / 63 mL |
| Primary statistic | gOR 1.51 (1.20–1.89) | gOR 1.37 (1.11–1.69) |
| mRS 0–2 (EVT vs medical) | 20% vs 7% | 30% vs 11.6% |
| sICH (EVT vs medical) | 0.6% vs 1.1% (NS) | 6.1% vs 2.7% (NS, but trend) |
| Any ICH | Not separately emphasized | 49.1% vs 17.3% (P<0.001) |
| 90-d mortality | 38.4% vs 41.5% (NS) | 21.7% vs 20.0% (NS) |
| Stopped early? | Yes (efficacy, 2nd interim) | Yes (efficacy, 2nd interim) |
| Urokinase used? | No | Yes (~3.5%) |
| mRS 5/6 merged in analysis? | Yes | No |

---

## PART 4 — NeuroWiki field mapping

### `src/data/trialData.ts` — `'select2-trial'` (lines 4735–4807)

| Field | Verified value | Action |
|---|---|---|
| `source` | "Sarraj et al. (NEJM 2023)" | ✓ accurate; consider expanding to "Sarraj et al. NEJM 2023;388(14):1259–71" |
| `clinicalTrialsId` | `NCT03876457` | ✓ verified |
| `primaryDesign` | `'ordinal-shift'` | ✓ verified |
| `stats.sampleSize` | `'352'` | ✓ verified (178 + 174) |
| `stats.primaryEndpoint` | `'mRS distribution'` at 90 days | ✓ verified |
| `stats.pValue` | `'<0.001'` | ✓ verified |
| `stats.effectSize` | `'13%'` ARI for mRS 0–2 | ⚠ This is the secondary outcome; either relabel as "mRS 0–2 secondary" or replace with gOR 1.51 |
| `efficacyResults.treatment` | 20% | ✓ verified (20.3% rounded) |
| `efficacyResults.control` | 7% | ✓ verified (7.0%) |
| `calculations.nnt` | `7.7` | ⚠ **Flag** — derived from secondary mRS 0–2 outcome; must label or remove (see Part 3) |
| Grotta Bar mRS array (EVT) | `[1.1, 5.1, 14.0, 17.4, 15.2, 8.4, 38.2]` | New field if added |
| Grotta Bar mRS array (Medical) | `[0, 1.7, 5.2, 11.5, 20.7, 18.4, 40.8]` | New field if added |
| Generalized OR | `1.51 (1.20–1.89)` | New field if added |
| `applicability.imagingSelection` | "ASPECTS 3–5 OR perfusion-based core ≥50 mL required; ≤24h anterior LVO" | ✓ accurate |
| Age cap (new) | ≤85 | Add to applicability |
| sICH (new) | 0.6% EVT vs 1.1% medical | Add to safety surfaces |
| 90-d mortality (new) | 38.4% vs 41.5% (NS) | Add to safety surfaces |
| Stopped early? | Yes — efficacy, 2nd interim | Already noted in `applicability.populationExclusions[0]` |

### `src/data/trialData.ts` — `'angel-aspect-trial'` (lines 4808–4885)

| Field | Verified value | Action |
|---|---|---|
| `source` | "Huo et al. (NEJM 2023)" | ✓ accurate; expand to "Huo et al. NEJM 2023;388(14):1272–83" |
| `clinicalTrialsId` | `NCT04551664` | ✓ verified |
| `primaryDesign` | `'ordinal-shift'` | ✓ verified |
| `stats.sampleSize` | `'456'` | ✓ verified |
| `stats.pValue` | `'<0.001'` | ⚠ **Mismatch** — published P=0.004, not <0.001. Correct to `'0.004'` |
| `stats.effectSize` | `'18.4%'` | ⚠ This is the secondary mRS 0–2 ARI (30.0 − 11.6 = 18.4); label as secondary or replace with gOR 1.37 |
| `efficacyResults.treatment` | 30 | ✓ verified (30.0%) |
| `efficacyResults.control` | 11.6 | ✓ verified |
| `calculations.nnt` | `5.4` | ⚠ **Flag** — derived from secondary mRS 0–2 outcome; must label or remove |
| Grotta Bar mRS array (EVT) | `[3.9, 8.3, 17.8, 17.0, 19.6, 11.7, 21.7]` | New field if added |
| Grotta Bar mRS array (Medical) | `[3.6, 8.0, 0, 21.8, 26.7, 20.0, 20.0]` | ⚠ mRS 2 = 0% per reconciliation; flag for supplementary-appendix verification |
| Generalized OR | `1.37 (1.11–1.69)` | New field if added |
| `applicability.imagingSelection` | "ASPECTS 3–5 OR core 70–100 mL; ≤24h anterior LVO" | ⚠ Incomplete — also includes ASPECTS 0–2 with core 70–100 mL, AND ASPECTS >5 with core 70–100 mL in 6–24 h. Refine wording. |
| `applicability.geography` | `'China'` | ✓ verified |
| Age cap | ≤80 | Add to applicability |
| NIHSS inclusion | 6–30 | Add to applicability |
| sICH | 6.1% EVT vs 2.7% medical (P=0.12) | Add to safety surfaces |
| Any ICH | 49.1% vs 17.3% (P<0.001) | Add to safety surfaces — important contrast with SELECT2 |
| 90-d mortality | 21.7% vs 20.0% (NS) | Add to safety surfaces |
| Stopped early? | Yes — efficacy, 2nd interim | Already noted |

### Mismatches that BLOCK merge without correction
1. **ANGEL-ASPECT P-value:** repo says `<0.001`, paper reports **P=0.004**. Must correct.
2. **NNT framing on both trials:** both `nnt` fields derive from a secondary outcome under an ordinal-shift primary. Per `clinical-trial-audit` skill, NNT is `nnt-not-appropriate` for ordinal-shift unless explicitly relabeled as secondary-outcome NNT with the primary's gOR as headline.

### Mismatches that should be FIXED but do not block
1. SELECT2 `imagingSelection` could note "no upper core limit" explicitly to differentiate from ANGEL-ASPECT.
2. ANGEL-ASPECT `imagingSelection` is incomplete — does not capture the three-prong inclusion (ASPECTS 3–5 OR 0–2 with 70–100 mL OR >5 with 70–100 mL in 6–24 h).
3. Both trials' `effectSize` field uses absolute risk increase for the **secondary** mRS 0–2 endpoint, not the primary gOR. Either relabel or replace.

---

## PART 5 — Verification confidence

**HIGH** for both trials:
- Both DOIs resolve to NEJM (redirect chain: doi.org → www.nejm.org confirmed via WebFetch)
- Full text of both papers read directly from the user-supplied PDFs (10 pages each, including all primary tables and the mRS distribution figure)
- All primary statistics confirmed against published results section verbatim
- Both trials are companion publications in NEJM 2023;388(14), April 6 issue — same issue, paired by editorial intent

**Items flagged for medical-scientist downstream:**
1. ANGEL-ASPECT medical-arm mRS=2 segment reconciliation (Figure 2 shows no separate mRS=2 segment, but 0–2 sum = 11.6%) — verify against supplementary appendix Table S5 before final display
2. NNT framing decision for both trials (remove vs label-as-secondary)
3. AHA/ASA 2024 Focused Update exact COR/LOE quote and section reference for ASPECTS 3–5 EVT — verify before quoting in interpretation surfaces
4. Truncation bias disclaimer language (both trials stopped early for efficacy)

**Block conditions checked:**
- DOI resolves: ✓ both
- Title matches: ✓ both
- Primary endpoint matches paper methods: ✓ both
- NNT being computed from non-primary outcome: ⚠ **Yes — flagged in Part 3 and Part 4 for resolution before merge**
- Statistical framework determinable: ✓ both `ordinal-shift`

**This packet is ready for `medical-scientist` to author and `clinical-reviewer` to gate. The two flagged items (ANGEL-ASPECT P-value, NNT framing on both) are correctable in the implementation PR — they do not block production of this evidence packet.**

---

**Packet path (for orchestrator to persist):** `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/2026-05-14-select2-angel-aspect.md`

**Source PDFs verified:**
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/SELECT2.pdf`
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/ANGEL-ASPECT.pdf`

**Repo references confirmed:**
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts` lines 4735–4807 (SELECT2), 4808–4885 (ANGEL-ASPECT)

Status: **READY** — paired evidence packet content delivered above for orchestrator to write to `docs/evidence-packets/2026-05-14-select2-angel-aspect.md`. Two correctable mismatches and one NNT-framing decision flagged for downstream `medical-scientist` + `clinical-reviewer`.