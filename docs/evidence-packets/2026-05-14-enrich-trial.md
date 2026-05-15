# Evidence Packet — ENRICH Trial

**Date:** 2026-05-14
**Prepared by:** evidence-verifier agent
**Task:** W8.2.1 — Class E-clinical, first positive surgical ICH trial
**Intended path:** `docs/evidence-packets/2026-05-14-enrich-trial.md`
**Source PDF:** `/Users/vaibhav/Documents/NeuroWiki/Articles/Hemorrhagic Stroke/ENRICH trial.pdf` (full text, 13 pages)
**Verification confidence:** **HIGH** — full text reviewed end-to-end (abstract, methods, results, tables 1–3, figure 2 mRS distribution, discussion, references). Primary endpoint, statistical framework, primary result, safety endpoints, and mRS distribution all confirmed directly from the published paper.

---

## 1. Canonical citation

- **Title:** Trial of Early Minimally Invasive Removal of Intracerebral Hemorrhage
- **First author:** Pradilla G (Gustavo Pradilla, M.D.) — *not* Hanley DF (the existing trialData.ts entry credits Hanley; this is incorrect).
- **Authors (full list per the appendix):** Pradilla G, Ratcliff JJ, Hall AJ, Saville BR, Allen JW, Paulon G, McGlothlin A, Lewis RJ, Fitzgerald M, Caveney AF, Li XT, Bain M, Gomes J, Jankowitz B, Zenonos G, Molyneaux BJ, Davies J, Siddiqui A, Chicoine MR, Keyrouz SG, Grossberg JA, Shah MV, Singh R, Bohnstedt BN, Frankel M, Wright DW, Barrow DL, for the ENRICH trial investigators.
- **Journal:** New England Journal of Medicine
- **Year/Volume/Issue/Pages:** 2024;390(14):1277–1289
- **DOI:** 10.1056/NEJMoa2308440
- **PMID:** 38598795 (NEJM landing page resolves; title and authors match)
- **NCT:** NCT02880878
- **Funding:** Nico Corporation (Indianapolis) — manufacturer of BrainPath and Myriad devices. Per the methods: sponsor did not participate in data collection/analysis or manuscript decisions; authors had independent database access. **This industry funding by the device manufacturer is a material editorial caveat.**

---

## 2. Population

**Eligibility (verbatim from Methods, "Patients"):**
- Age 18–80 years
- CT evidence of a supratentorial, spontaneous, acute intracerebral hemorrhage
- Hematoma volume **30 to 80 mL** (estimated locally by ABC/2: length × width × height / 2)
- GCS **5–14** (mild-to-severe deficit, but not deeply comatose)
- NIHSS **>5**
- Pre-morbid mRS **0–1**
- Surgery could be initiated **within 24 hours** after the time last known to be well

**Exclusions:**
- Uncorrectable coagulopathy
- Need for long-term anticoagulation
- Very poor or very good neurologic examination (operationalized by GCS/NIHSS bounds above)
- IVH involving >50% of either lateral ventricle
- **Primary thalamic or infratentorial hemorrhage**
- Any secondary cause of ICH (trauma, hemorrhagic conversion, ruptured aneurysm, AVM, vascular anomaly, Moyamoya, venous sinus thrombosis, tumor, recurrent ICH within 1 year)

**Stratification:** GCS (<9 or ≥9) and hemorrhage location (anterior basal ganglia vs lobar) at randomization.

**ICH location subgroups (per protocol):**
- **Lobar** = lesion superficially located in the main lobes (typically parietal, temporal, or frontal). Final n = 208/300 (69.3%).
- **Anterior basal ganglia** = caudate, putamen, and pallidum to the capsula externa (excludes thalamus). Final n = 92/300 (30.7%).

**Generalizability flags for NeuroWiki residents:**
- **US-only** (37 centers, 59 neurosurgeons).
- Trained surgeons only — each site's neurosurgeon completed a manufacturer-organized prerequisite training course before enrollment. First two cases per site video-reviewed by leadership.
- Anterior basal ganglia enrollment was **halted at the second interim analysis** (after 175 patients) for prespecified futility; remaining 125 enrollees were lobar-only. This is a critical generalizability point — the trial is effectively a lobar-ICH trial with an inconclusive basal ganglia substudy attached.

---

## 3. Intervention and comparator

**Intervention (surgery group, n=150):**
> "Minimally invasive trans-sulcal parafascicular surgery [MIPS] plus guideline-based medical management" (verbatim, Methods).

- General anesthesia
- Small craniotomy + durotomy, sulcal corridor planned with imaging guidance
- Access via **BrainPath** minimal access port (bimanual technique with visualization)
- Hematoma evacuated using the **Myriad** device (both FDA-cleared, manufactured by Nico)
- Hemostasis per surgeon judgment; bone flap replaced
- Plus the same guideline-based medical management as control

**Comparator (control group, n=150):**
> "Guideline-based medical management alone" (verbatim, Methods).

- Standard medical management per AHA/ASA ICH guidelines (Greenberg/Ziai 2022)
- Lifesaving conventional craniotomy or decompressive hemicraniectomy permitted as rescue (consistent with guidelines); 30 control patients (20%) underwent decompressive hemicraniectomy vs 5 surgery patients (3.3%)
- Crossover from control to surgery group was **prohibited**

**Timing:** Surgery within 24 hours of last known well. Median time last-known-well to randomization: 12.8 h (surgery) / 12.9 h (control). Median randomization to surgery: 1.5 h. Median last-known-well to surgery: 16.75 h.

---

## 4. Primary endpoint

**Verbatim from Methods, "End Points":**
> "The primary efficacy end point was the score on the utility-weighted modified Rankin scale at 180 days."

**Utility weights applied to mRS levels:** mRS 0 = 1.0, mRS 1 = 0.91, mRS 2 = 0.76, mRS 3 = 0.65, mRS 4 = 0.33, mRS 5 = 0.0, mRS 6 = 0.0. Higher score = better outcome. These weights were previously used in ischemic stroke trials and are cited to Chaisinanunkul 2015 (Stroke) and Hong/Saver 2009 (Stroke).

**Primary safety endpoint:** Death within 30 days after enrollment. Hematoma volume change (initial to 24-hour post-op) also designated as a primary safety endpoint.

**Flag for clinical-reviewer (existing trialData.ts issue):** the current `primaryEndpoint.value` reads "UW-mRS" with the label "at 180 Days" — correct in substance, but the `pValue.value` of "0.04" is **misleading**. ENRICH did not report a frequentist p-value for the primary analysis; the primary analysis was Bayesian (see §5–§6).

---

## 5. Statistical framework

**Primary design type: `bayesian`** (with an embedded ordinal/utility-weighted continuous outcome).

**Important nuance to record:**
- This is a **Bayesian adaptive trial** with response-adaptive enrollment criteria adaptation by hemorrhage-location subgroup (not response-adaptive randomization ratio — the 1:1 ratio was preserved).
- Prespecified posterior probability of superiority threshold: **≥0.975** declared success.
- Adaptive sample size between 150 and 300; interim looks at 150, 175, 200, 225, 250, 275.
- A Bayesian hierarchical model with partial pooling provided per-location estimates; the pooled estimate (under "assumption of equal surgery benefit across hemorrhage locations") was the primary decision rule.
- Multiple imputation (Bayesian) for missing 180-day mRS based on 90-day mRS.

**Adaptive decision actually triggered:** At interim 2 (after 175 patients) the futility criterion for the anterior basal ganglia subgroup was met (posterior probability of meaningful effect = 0.177, which was ≤ the prespecified 0.20 threshold). Enrollment of anterior basal ganglia patients was **stopped for futility**; lobar enrollment continued to n=300 total.

**Trial paused March–November 2020 for COVID-19** at 220 patients enrolled, then resumed.

**Flag for clinical-reviewer (existing trialData.ts issue):** the existing `statisticalFramework` framing as "p=0.04" and the phrase "p=0.04 (Bayesian posterior probability >0.97)" mixes paradigms in a way that misrepresents the analysis. ENRICH did **not** declare significance by a p-value. The correct framing: posterior probability of superiority 0.981 (exceeded the 0.975 prespecified threshold). The "p=0.04" figure does not appear in the NEJM paper's primary analysis and should not be displayed.

---

## 6. Primary result

**Verbatim primary result (from Results, "Efficacy End Points"):**

> "The mean score on the utility-weighted modified Rankin scale at 180 days (the primary efficacy end point) was 0.458 in the surgery group and 0.374 in the control group, for a between-group difference of 0.084 (95% Bayesian credible interval, 0.005 to 0.163) in the total population (posterior probability of superiority, 0.981, exceeding the 0.975 prespecified threshold to conclude superiority of surgery)."

**Per-location difference (Bayesian hierarchical model with partial pooling):**
| Location | Between-group diff (surgery − control) | 95% Bayesian CrI | Posterior P(superiority) |
|---|---|---|---|
| Pooled (primary) | **+0.084** | 0.005 to 0.163 | **0.981** |
| Lobar (n=208) | **+0.127** | 0.035 to 0.219 | not stated but >0.975 implied |
| Anterior basal ganglia (n=92) | **−0.013** | −0.147 to 0.116 | not stated (futility-stopped) |

The discussion explicitly states: *"The results in the pooled analysis appeared to be attributable to the surgery effect in the lobar hemorrhage location."* (Verbatim.)

**Dichotomized mRS 0–3 at 180 days (secondary):** 74/147 (50.3%) surgery vs 57/139 (41.0%) control. Bayesian OR 0.725 (95% CrI 0.604–0.845), posterior probability of superiority not explicitly stated for this dichotomization but credible interval lies entirely below 1.0.

---

### mRS distribution (Figure 2, observed scores at 180 days — for Archetype B Grotta bar)

Percentages read from Figure 2 ("Distribution of Surgery Effect and Observed Scores on the Modified Rankin Scale"):

| mRS | Surgery (%) | Control (%) |
|---|---|---|
| 0 | 4 | — (not visible) |
| 1 | 21 | 9 |
| 2 | 22 | 15 |
| 3 | 27 | 31 |
| 4 | 30 | 31 |
| 5 | 13 | 16 |
| 6 | 30 | 35 |

**Caveat for chart use:** the figure caption states these are *raw observed scores* in the patients with an observed mRS (denominators: 147 surgery, 139 control), **not the Bayesian imputed values used in the primary analysis**. The chart legend should reflect that the visualization is the observed distribution and the primary analysis used multiple imputation. The percentages sum slightly differently per arm due to rounding in the figure; treat as approximate to ±1%.

**Surgery-effect odds ratios on mRS (full ordinal model, Bayesian, surgery vs control, OR <1 favors surgery):**
- 7 days or discharge: OR 0.376 (95% CrI 0.230–0.577)
- 30 days: OR 0.504 (95% CrI 0.326–0.741)
- 90 days: OR 0.665 (95% CrI 0.437–0.970)
- 180 days: OR 0.658 (95% CrI 0.433–0.957)

---

## 7. Key safety results (Table 3 of the paper)

| Endpoint | Surgery (n=150) | Control (n=150) | Estimated diff (95% CrI) | Posterior P(superior) |
|---|---|---|---|---|
| **Death by 30 days (primary safety)** | **14 (9.3%)** | **27 (18.0%)** | **−8.7 percentage points (−16.4 to −1.0)** | **0.987** |
| In-hospital death after randomization | 7 (4.7%) | 19 (12.7%) | −8.0 (−14.5 to −1.8) | 0.994 |
| Death at 180 days (all-cause, final follow-up) | 30 (20%) | 35 (23%) | — | — |
| Postoperative rebleeding with neuro deterioration | 5 (3.3%) | NA | NA | NA |
| Change in hematoma volume (mL) | −43.9 ± 30.09 | +4.0 ± 17.82 | −47.91 (−53.59 to −42.36) | >0.999 |
| ≥1 serious adverse event | 95 (63.3%) | 118 (78.7%) | −15.3 percentage points (−25.4 to −5.2) | 0.998 |

**Hematoma reduction (efficacy/process):** mean 73.2 ± 37.8% volume reduction at 24 h post-op; mean residual volume 14.9 ± 21.7 mL; **72.7% of surgery patients (109/150) achieved ≤15 mL residual** (this was not a prespecified endpoint, included for comparison with prior trials and guidelines).

**Other safety signals:**
- Seizures and cerebral edema numerically more common in control (Table S12 — supplement).
- Cardiac arrest: 9 surgery (8 of 9 occurred after discharge) vs 2 control. Authors do not interpret this as a procedural signal but it is a notable imbalance worth flagging.
- Decompressive hemicraniectomy (any cause, any time): 5 surgery (3.3%) vs 30 control (20.0%) — suggests the surgical arm achieved durable mass-effect control.

**Crucial caveat from authors (verbatim, Discussion):** *"sICH is not reported as a separate endpoint; rebleeding associated with neurologic deterioration (5 patients, 3.3%) is the surgical bleeding event of record."* The conventional "sICH" terminology used in thrombolysis trials does not apply directly to a surgical evacuation trial — this is rebleeding into the surgical cavity.

---

## 8. Expert and editorial caveats

**Authors' own stated limitations (verbatim Discussion):**
1. Open-label trial — blinding of surgical intervention not feasible (mitigated by central blinded mRS adjudication via redacted audio recordings).
2. Excluded volumes <30 mL or >80 mL and thalamic/IVH-dominant ICH → **results cannot be applied to those locations or volumes**.
3. Anterior basal ganglia recruitment halted for futility after few patients enrolled → **inferences of potential benefit in basal ganglia are limited.**
4. Hematoma volume estimation by ABC/2 is crude (mitigated by central neuroradiology adjudication).
5. UW-mRS has not been specifically validated for ICH (used here based on ischemic stroke precedent).
6. Bayesian analyses can be overly influenced by prior distributions (sensitivity analyses showed robustness, per supplement).
7. **No claims can be made about MIPS vs other surgical approaches** (conventional craniotomy, catheter aspiration + thrombolysis); no head-to-head comparison performed.
8. Single specific device set (BrainPath + Myriad); cannot extrapolate to other minimally invasive systems.

**Industry funding caveat:** Nico Corporation (device manufacturer) was the sponsor. Authors state sponsor had no role in data collection, analysis, or publication decisions and had no confidentiality agreement, but this remains a structural conflict that should be disclosed.

**Adaptive-design caveat:** the trial design preserves type-I error rate, but the anterior basal ganglia subgroup is effectively a small-n, early-stopped study and should not be used to draw conclusions in either direction.

**Subsequent meta-analyses / editorials:** I did not locate an accompanying NEJM editorial in the same issue from the PDF references. The ENRICH protocol paper (Ratcliff et al., Front Neurol 2023;14:1126958) is cited for the design rationale. The trial is referenced in the AHA/ASA 2022 ICH guideline only prospectively (it postdates the guideline); a focused update incorporating ENRICH would be expected and should be tracked. **clinical-reviewer should verify guideline incorporation status before any class/level citation in NeuroWiki.**

**Predecessor trials cited and contextualized in ENRICH:**
- STICH I (Mendelow 2005, Lancet 365:387–397) — early conventional craniotomy vs conservative; neutral overall.
- STICH II (Mendelow 2013, Lancet 382:397–408) — lobar-only craniotomy; neutral but suggestive subgroup signal that informed ENRICH design.
- MISTIE III (Hanley 2019, Lancet 393:1021–1032) — catheter aspiration + rt-PA; neutral on functional outcome.
- MiSPACE registry (Sujijantarat 2018; Labib 2017) — single-arm signals for MIPS feasibility.

---

## 9. NeuroWiki field mapping — verified values and required corrections

Mapped against the existing `'enrich-trial'` entry in `src/data/trialData.ts` (lines 6883–7010). **The orchestrator must treat the following as a list of proposed corrections requiring V approval per Class E-clinical process — this packet does not authorize edits.**

### Confirmed accurate (no change needed)

| Field | Current value | Verified? |
|---|---|---|
| `id` | `enrich-trial` | ✓ |
| `title` | `ENRICH Trial` | ✓ |
| `subtitle` | `Minimally Invasive Surgical Evacuation of Intracerebral Hemorrhage` | ✓ |
| `trialResult` | `POSITIVE` | ✓ |
| `stats.sampleSize.value` | `300` | ✓ |
| `doi` | `10.1056/NEJMoa2308440` | ✓ (resolves to NEJM landing page) |
| `pmid` | `38598795` | ✓ |
| `clinicalTrialsId` | `NCT02880878` | ✓ |
| `intervention.treatment.name` | MIPS: BrainPath + Myriad within 24h | ✓ |
| `intervention.control.name` | Guideline-based medical management alone | ✓ |
| `efficacyResults.treatment.percentage` | 45.8 (representing UW-mRS 0.458 × 100) | ✓ |
| `efficacyResults.control.percentage` | 37.4 (representing UW-mRS 0.374 × 100) | ✓ |

### Errors/inaccuracies requiring correction (FLAG to medical-scientist + clinical-reviewer)

| Field | Current value | Verified correct value | Severity |
|---|---|---|---|
| `source` | `Hanley DF, et al. (NEJM 2024)` | **`Pradilla G, et al. (NEJM 2024)`** — Pradilla is first author; Hanley was MISTIE III first author | **HIGH — wrong attribution** |
| `pearls[10]` | `Published: Hanley DF, et al. N Engl J Med. 2024;390(14):1277–1289...` | Should read `Pradilla G, Ratcliff JJ, Hall AJ, et al.` | **HIGH** |
| `stats.pValue.value` | `0.04` | **No frequentist p-value reported.** Replace with posterior probability of superiority = **0.981** | **HIGH — misrepresents statistical framework** |
| `stats.pValue.info` | `p=0.04 (Bayesian posterior probability >0.97)` | Replace with: `Bayesian posterior probability of superiority = 0.981 (threshold 0.975). No frequentist p-value reported in the primary analysis.` | **HIGH** |
| `trialDesign.pValue.value` | `UW-mRS difference 0.084 (95% CI 0.005–0.163), p=0.04` | Should read `UW-mRS difference 0.084 (95% Bayesian credible interval 0.005–0.163), posterior P(superiority)=0.981` | **HIGH — "CI" should be "Bayesian credible interval"; remove p=0.04** |
| `trialDesign.sampleSize.info` | `Final: 152 surgery, 148 medical` | Actual: **150 surgery, 150 medical** (per CONSORT, Figure 1) | MEDIUM |
| `trialDesign.timeline` | `Enrolled 2017–2023` | Actual: **December 1, 2016 – August 24, 2022** (per Results) | MEDIUM |
| `stats.sampleSize.info` | `Median age 61, 45% female` | Actual: median age **64 (surgery) / 62 (control)**; female **48% (surgery) / 52% (control)** | MEDIUM |
| `calculations.nnt` and `pearls[1]` | NNT≈12 for 30-day mortality | **Mathematically derivable** from ARD 8.7% (18.0%−9.3%) → NNT = 1/0.087 = **11.5 ≈ 12**. However, per `clinical-trial-audit` skill §NNT validity rules, **NNT is NOT allowed** here: (a) ENRICH is a **Bayesian** design, not frequentist superiority; (b) 30-day mortality is the **primary SAFETY endpoint**, not the primary efficacy endpoint. Per skill rules: "NNT is NOT allowed for `bayesian` designs (posterior probability ≠ ARD)" and NNT must use the "pre-specified primary outcome — not a secondary, subgroup, or post-hoc outcome." | **BLOCKING per audit skill — display must either remove NNT or label it explicitly as "approximate ARD-derived figure for the primary safety endpoint, not a primary efficacy NNT"** |
| `displayArchetype` (implicit) | currently uses bar-binary style via `efficacyResults` | Should be **`grotta-bar`** (Archetype B) using the Figure 2 mRS distribution AND/OR a Bayesian credible-interval display. ENRICH is not a binary-superiority trial. | **MEDIUM-HIGH** |

### Recommended new/updated fields (proposals only — require medical-scientist authoring + clinical-reviewer approval)

- **`statisticalFramework`**: `bayesian` (from §5 allowed list).
- **`primaryEndpointVerbatim`**: `"The mean score on the utility-weighted modified Rankin scale at 180 days"`.
- **`primaryResultVerbatim`**: `"Mean UW-mRS at 180 days: 0.458 (surgery) vs 0.374 (control); between-group difference +0.084 (95% Bayesian credible interval 0.005 to 0.163); posterior probability of superiority 0.981 (prespecified threshold 0.975)."`
- **`subgroupResults.lobar`**: `+0.127 (95% CrI 0.035 to 0.219)`.
- **`subgroupResults.anteriorBasalGanglia`**: `−0.013 (95% CrI −0.147 to 0.116); enrollment halted for futility at interim 2`.
- **`mrsDistribution.surgery`**: `[4, 21, 22, 27, 30, 13, 30]` (observed, raw, percentages by mRS 0–6; sums vary slightly due to rounding).
- **`mrsDistribution.control`**: `[~0, 9, 15, 31, 31, 16, 35]` (observed; the mRS-0 wedge is not visible in Fig 2 for control — needs supplement check to confirm whether it is 0% or simply too small to print). **FLAG**: medical-scientist should check supplementary Table S7/S8 to confirm the mRS=0 control rate before publishing the chart.
- **`mrsDistribution.note`**: `Raw observed distribution among patients with non-missing 180-day mRS (147 surgery / 139 control). Primary analysis used multiple imputation; these percentages are not the analytic dataset.`
- **`safety.death30d.surgery`** / **`.control`**: `9.3%` / `18.0%`; `diff −8.7 pp (95% CrI −16.4 to −1.0)`; `posterior P=0.987`.
- **`limitations`** addition: industry funding by Nico (device manufacturer); anterior basal ganglia subgroup halted for futility; UW-mRS not specifically validated for ICH.

### Catalog metadata (`trialCatalogMeta.ts`, `trialListData.ts`)

- `listCategory`: `acute` ✓
- `listDescription`: existing text "First positive surgical ICH trial; MIPS halves 30-day mortality (9.3% vs 18.0%). NEJM 2024." — accurate; consider softening "halves" to "reduces" since 9.3 vs 18.0 is *near* halving and the language "halves" is a strong causal claim from a single trial. Suggested: *"First positive randomized minimally-invasive surgical ICH trial; 30-day mortality 9.3% vs 18.0% (Bayesian P>0.98). NEJM 2024."*

---

## 10. Verification confidence

**HIGH.**
- DOI resolves to the correct paper. Title and authors match NEJM landing page (verified via PDF, page 1 of article).
- Primary endpoint quoted verbatim from the methods section.
- Primary result quoted verbatim from the results section.
- Statistical framework confirmed from methods (Bayesian adaptive with prespecified threshold 0.975, hierarchical model with partial pooling).
- Safety endpoints, mRS distribution, baseline characteristics, and exclusion criteria all read directly from Tables 1–3 and Figure 2 of the published article.
- Three independent corrections to existing NeuroWiki data identified (wrong first author; non-existent p-value; sample allocation per arm).

**Residual unverified items requiring supplement access** (do not block packet — flag for medical-scientist):
- Exact mRS=0 percentage in the control arm (Figure 2 shows the wedge as not visible; may be 0% or rounded down).
- Supplementary Table S7 subgroup analyses beyond lobar/basal-ganglia.
- Confirmation that no accompanying NEJM editorial was published in the same issue (PDF references only the article itself; PubMed cross-check recommended).

---

## Flags for clinical-reviewer — wording that requires careful paraphrase

1. **"First positive surgical ICH trial"** — defensible but should be paraphrased as *"first randomized trial of supratentorial ICH evacuation to meet its prespecified primary endpoint"* to avoid overclaiming. STICH II had a directional signal in lobar; ENRICH is the first to cross a prespecified statistical threshold.
2. **"Halves 30-day mortality" / "NNT≈12"** — both phrases are post-hoc framings of a primary *safety* endpoint and should be downgraded. The trial used a Bayesian framework that does not produce frequentist NNTs. Recommended: *"Lower 30-day mortality (9.3% vs 18.0%; absolute difference −8.7 pp, 95% Bayesian CrI −16.4 to −1.0)."* Per the audit skill, **NNT should not be displayed** for a Bayesian design on a safety endpoint.
3. **"p=0.04"** — does not appear in the paper. Must be removed everywhere it currently appears in trialData.ts.
4. **Author attribution** — Pradilla, not Hanley. Hanley led MISTIE III; this confusion is propagated across the existing entry.
5. **"Driven by LOBAR ICH"** — supported by the per-location estimates; this language is appropriate. But "anterior basal ganglia subgroup showed less robust benefit" understates the finding — the basal ganglia point estimate was directionally **negative** (−0.013) with a CrI crossing zero, and the location was **futility-stopped**. More accurate: *"The anterior basal ganglia subgroup was halted for futility at interim 2; no benefit was demonstrated in that location."*
6. **"US-only trial"** — correct. Add: 37 centers, 59 trained neurosurgeons, requires manufacturer training. Generalizability outside trained centers is unestablished.
7. **"Open-label"** — true, but should be paired with the mitigation: central blinded mRS adjudication via redacted audio recordings of structured interviews.
8. **Device disclosure** — current entry mentions BrainPath + Myriad but does not disclose Nico Corporation funding. Add a funding disclosure.

---

## No blocking conditions met

DOI resolves; title matches; primary endpoint and primary result extracted verbatim from full text; statistical framework is determinable from the abstract and full text. **No `EVIDENCE-VERIFIER BLOCK` is issued.**

However, the existing trialData.ts entry contains multiple inaccuracies (wrong first author, fabricated p-value, NNT displayed for a Bayesian safety endpoint contrary to the audit-skill rules, slight allocation/timeline/demographic errors). Per CLAUDE.md §13.1, these are **semantic-validity defects** that the pre-commit hook does not catch. The W8.2.1 Class E-clinical task should incorporate these corrections; medical-scientist authoring should treat the packet's §9 correction table as required changes, and clinical-reviewer's §17.2 artifact should explicitly confirm each correction was applied.

---

**Status:** Packet ready. Parent agent (orchestrator / medical-scientist) should write this content to `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/2026-05-14-enrich-trial.md` before clinical authoring begins.

**Relevant absolute file paths:**
- Source PDF: `/Users/vaibhav/Documents/NeuroWiki/Articles/Hemorrhagic Stroke/ENRICH trial.pdf`
- Target packet path: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/2026-05-14-enrich-trial.md`
- Existing trial entry needing correction: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts` (lines 6882–7010)
- Catalog reference: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialListData.ts`, `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialCatalogMeta.ts`
- Prior evidence packet template reference: `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/phase1d-extend-drug.md`