# Evidence Packet — INSPIRES + CHANCE-2 (paired secondary-prevention DAPT)

**Packet date:** 2026-05-14
**Trials:** INSPIRES (Gao 2023) and CHANCE-2 (Wang 2021)
**Context:** W8.2.6 — paired Class E-clinical. Completes the CHANCE → POINT → INSPIRES → CHANCE-2 short-term DAPT chain.
**Verifier:** evidence-verifier (Opus 4.7)
**Source PDFs verified against:**
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/6 - Secondary Prevention/INSPIRES.pdf` (NEJM print pages 2413–2424)
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/6 - Secondary Prevention/CHANCE-2.pdf` (NEJM print pages 2520–2530)

---

## TRIAL 1 — INSPIRES

### 1. Canonical citation
- **Title:** Dual Antiplatelet Treatment up to 72 Hours after Ischemic Stroke
- **First author:** Y. Gao (Gao Y, Chen W, Pan Y, et al., for the INSPIRES Investigators)
- **Year:** 2023 (published online December 28, 2023)
- **Journal:** New England Journal of Medicine
- **Volume/issue/pages:** 389(26):2413–2424
- **DOI:** 10.1056/NEJMoa2309137 (verified on PDF p.1 of source)
- **PMID:** 38157499 (per task brief; not visible on PDF but DOI resolves to the matching title)
- **ClinicalTrials.gov:** NCT03635749 (verified on PDF abstract)

### 2. Population
Patients aged 35–80 with:
- **Acute mild ischemic stroke (NIHSS ≤5)** OR **high-risk TIA (ABCD² ≥4)**
- **Within 24–72 hours** of symptom onset (12.8% randomized ≤24h, 41.1% 24–48h, 45.7% 48–72h in DAPT arm)
- **Presumed atherosclerotic mechanism**, defined as ≥50% stenosis of a major intracranial or extracranial artery ipsilateral to the ischemic field, OR new multiple infarctions of presumed large-artery atherosclerotic origin (including non-stenotic unstable plaque ipsilateral to infarct)
- Conducted at 222 hospitals in **China**; baseline median age 65, 35.8% women, **98.5% Han Chinese**

**Key exclusions:**
- Received thrombolysis or endovascular therapy
- Presumed cardioembolic cause (e.g., AF, prosthetic valve)
- Other determined cause (e.g., dissection, vasculitis)
- Pre-existing disability (mRS ≥2)
- ICH history; planned surgery/revascularization within 90 days
- Dual antiplatelet or intensive statin therapy within 2 weeks pre-randomization

**Generalizability flag:** Chinese-only enrollment. ~67.6% had multiple acute infarctions on imaging. Trial protocol was amended in 2019 to exclude patients eligible for CHANCE-style ≤24h NIHSS≤3 dosing (to avoid overlap with existing 24h guideline window).

### 3. Intervention and comparator
Verbatim from Methods (Trial Procedures):
- **Clopidogrel–aspirin arm:** "clopidogrel at a loading dose of 300 mg on the first day, followed by 75 mg daily on days 2 to 90, plus aspirin at a dose of 100 to 300 mg on the first day, then 100 mg daily for days 2 to 21 and then a matching aspirin placebo for days 22 to 90"
- **Aspirin arm:** "matching clopidogrel placebo for 90 days, plus aspirin at a dose of 100 to 300 mg on day 1, then 100 mg daily for days 2 to 90"
- **2×2 factorial:** Co-randomized to immediate vs delayed intensive atorvastatin (statin results reported separately; no interaction with antiplatelet, P=0.16)

**Duration of DAPT:** 21 days, then clopidogrel monotherapy through day 90 in DAPT arm. Aspirin arm received aspirin monotherapy throughout. (Critical clinical point — distinct from CHANCE/POINT short-course but with extended window to 72h.)

### 4. Primary endpoint
Verbatim from Outcomes: **"The primary efficacy outcome was any new stroke (ischemic or hemorrhagic) within 90 days."**

Primary safety outcome (verbatim): **"moderate-to-severe bleeding as defined according to criteria from the Global Utilization of Streptokinase and Tissue Plasminogen Activator for Occluded Coronary Arteries (GUSTO) trial."**

### 5. Statistical framework
**`superiority`** — Standard frequentist superiority RCT. Sample size of 6100 powered at 80% to detect HR 0.80 in favor of DAPT, two-sided alpha 0.05, assuming 11.5% baseline 90-day stroke risk and 22% relative reduction. Marginal Cox proportional-hazards model with adjustment for pooled trial centers. ITT analysis. Hierarchy not specified for secondary outcomes — secondary CIs are unadjusted for multiplicity and **cannot be used for hypothesis testing** (explicitly stated by authors).

### 6. Primary result
**New stroke at 90 days:**
- Clopidogrel–aspirin: 222/3050 = **7.3%**
- Aspirin: 279/3050 = **9.2%**
- **HR 0.79, 95% CI 0.66–0.94, P=0.008** (marginal Cox model)
- ARR ≈ 1.9 percentage points
- **NNT ≈ 53** (1/0.019) — qualifies for NNT display per §clinical-trial-audit rules: superiority design, binary primary, primary outcome itself, ARD CI not directly stated but derivable

Random-effects sensitivity model: HR 0.79 (95% CI 0.66–0.94). Per-protocol consistent.

### 7. Key safety results
**Primary safety — moderate-to-severe bleeding (GUSTO) at 90 days:**
- Clopidogrel–aspirin: 27/3050 = **0.9%**
- Aspirin: 13/3050 = **0.4%**
- **HR 2.08, 95% CI 1.07–4.04, P=0.03** (verified — matches the parking-lot 2026-05-08 flag exactly)

**Secondary safety:**
- Any bleeding: 3.1% vs 2.1% (HR 1.50, 95% CI 1.09–2.06)
- Intracranial hemorrhage: 0.6% vs 0.3% (HR 2.13, 95% CI 0.92–4.93) — not significant
- Hemorrhagic stroke (secondary efficacy): 0.5% vs 0.2% (HR 3.01, 95% CI 1.09–8.28) — uncommon but elevated
- Death from any cause: 1.2% vs 1.0% (HR 1.24, 95% CI 0.76–2.00) — not significant

**NNH (moderate-to-severe bleeding):** 1/(0.009−0.004) = **NNH ≈ 200**. Pair against efficacy NNT ≈ 53 → favorable net clinical benefit, but bleeding risk is real (HR doubled).

### 8. Expert and editorial caveats
- **Population is Asian-only (98.5% Han Chinese).** ICAS prevalence is higher in this group; effect size may not transfer 1:1 to Western populations.
- **Window extension from 24h → 72h is the principal contribution.** Prior CHANCE (2013, ≤24h, NIHSS≤3) and POINT (2018, ≤12h) established the ≤24h evidence base; INSPIRES extends acceptable initiation window for atherosclerotic minor stroke/high-risk TIA to 72h.
- **Atherosclerotic-mechanism enrichment:** unlike CHANCE/POINT (general noncardioembolic), INSPIRES required imaging or clinical evidence of large-artery atherosclerotic cause. Generalizing INSPIRES to non-atherosclerotic minor stroke is unsupported.
- **DAPT duration 21 days (not 90).** Aligns with POINT subgroup analyses showing benefit accrues by day 21 with bleeding signal beyond. Authors did not directly test other durations.
- **Hemorrhagic stroke signal (HR 3.01).** Wide CI but the lower bound (1.09) excludes 1. This is the dominant clinical caveat for patient selection — exclude ICH history, uncontrolled hypertension, microbleeds on MRI when feasible.
- **Subgroup pattern (Figure 3):** point estimate appears most favorable in the 48–72h window (HR 0.70, 95% CI 0.53–0.93) and ≥50% symptomatic stenosis subgroup (HR 0.77, 95% CI 0.64–0.94). No statistically significant heterogeneity but the result reinforces atherosclerotic-mechanism targeting.
- **Funded by National Natural Science Foundation of China and others; Sanofi and Beijing Jialin Pharmaceutical supplied drug and placebo with no role in design/conduct/analysis.**
- **AHA/ASA 2026 status:** Repo's `aha2026StrokeGuideline.ts` lists INSPIRES with NNT 53 and 72h window as part of the secondary prevention DAPT chain. Specific COR/LOE assignment was not extractable from the page-range I have; the repo language ("AHA/ASA 2026 COR 3 No Benefit" applies to **THALES**, not INSPIRES). **Medical-scientist should confirm the explicit COR/LOE for INSPIRES from the AHA/ASA 2026 secondary-prevention guideline section before publishing.** — *citation registry handoff item.*

### 9. NeuroWiki field mapping (INSPIRES)
Target file: `src/data/trialData.ts` (entry id `inspires-trial`).

| Field | Verified value |
|---|---|
| `doi` | `10.1056/NEJMoa2309137` |
| `pmid` | `38157499` (per task brief; not on PDF) |
| `nctId` | `NCT03635749` |
| `firstAuthor` | `Y. Gao` |
| `year` | `2023` |
| `journal` | `N Engl J Med` |
| `volume/issue/pages` | `389(26):2413–2424` |
| `primaryEndpoint` | `Any new stroke (ischemic or hemorrhagic) within 90 days` |
| `statisticalFramework` | `superiority` |
| `displayArchetype` | `bar-binary` (binary primary, superiority; optional `risk-table-km` if KM curve rendered) |
| `primaryResult.intervention` | `7.3% (222/3050)` |
| `primaryResult.comparator` | `9.2% (279/3050)` |
| `primaryResult.effectSize` | `HR 0.79 (95% CI 0.66–0.94), P=0.008` |
| `primaryResult.arr` | `1.9 percentage points` |
| `calculations.nnt` | `53` |
| `safetyTradeoff.bleedingHR` | `2.08 (95% CI 1.07–4.04), P=0.03` |
| `safetyTradeoff.modSevereBleeding` | `0.9% vs 0.4%` |
| `safetyTradeoff.nnh` | `~200` |
| `inclusionCriteria` | `Age 35–80; NIHSS ≤5 ischemic stroke OR high-risk TIA (ABCD² ≥4); within 24–72h of onset; presumed atherosclerotic cause (≥50% intra/extracranial stenosis ipsilateral OR multiple acute infarcts of presumed large-artery origin); no thrombolysis/EVT; pre-existing mRS ≤1` |
| `regimen` | `Clopidogrel 300 mg load → 75 mg daily × days 2–90 + aspirin 100–300 mg load → 100 mg daily × days 2–21, then aspirin placebo days 22–90` (i.e., 21-day DAPT then clopidogrel monotherapy through day 90) |
| `howToInterpret` | "INSPIRES extends the acceptable initiation window for short-course clopidogrel + aspirin to **72 hours** for minor stroke (NIHSS ≤5) or high-risk TIA of presumed **atherosclerotic** cause. Effect size (HR 0.79) and NNT ≈ 53 are clinically meaningful but accompanied by a 2-fold increase in moderate-to-severe bleeding (NNH ≈ 200). Hemorrhagic stroke signal (HR 3.01, CI 1.09–8.28) warrants patient selection against ICH risk factors." |
| `bedsidePearl` | "For atherosclerotic minor stroke or high-risk TIA presenting **24–72 hours** after onset, INSPIRES supports starting clopidogrel + aspirin × 21 days, then clopidogrel alone through day 90. Within 24h, CHANCE/POINT remain the primary evidence base. Exclude patients with ICH history, uncontrolled hypertension, or planned surgery — bleeding risk doubles." |
| `caveats` | `Asian-only enrollment (98.5% Han Chinese); atherosclerotic-mechanism enrichment; 21-day DAPT duration; hemorrhagic stroke HR 3.01 (CI 1.09–8.28)` |
| `last_reviewed` | `2026-05-14` (write only after §13.6 checklist completion by medical-scientist + clinical-reviewer) |

### 10. Verification confidence — **High**
DOI matches title verbatim on PDF cover; methods and results sections read; primary endpoint extracted verbatim; primary statistics confirmed from Table 2 and Figure 2. PMID stated in task brief but not visible on the print PDF (DOI is the canonical identifier here).

---

## TRIAL 2 — CHANCE-2

### 1. Canonical citation
- **Title:** Ticagrelor versus Clopidogrel in *CYP2C19* Loss-of-Function Carriers with Stroke or TIA
- **First author:** Y. Wang (Wang Y, Meng X, Wang A, et al., for the CHANCE-2 Investigators)
- **Year:** 2021 (published online October 28, 2021; print December 30, 2021)
- **Journal:** New England Journal of Medicine
- **Volume/issue/pages:** 385(27):2520–2530
- **DOI:** 10.1056/NEJMoa2111749 (verified on PDF p.1)
- **PMID:** (not stated in task brief; medical-scientist to look up — search engine and PubMed verification not run for this packet)
- **ClinicalTrials.gov:** NCT04078737 (verified on PDF abstract)

### 2. Population
Patients aged **≥40** carrying **at least one CYP2C19 loss-of-function allele (*2, *3, or *17 considered)** — specifically *2 or *3 alleles defining LOF (intermediate metabolizer = one LOF allele; poor metabolizer = two LOF alleles). Determined by **point-of-care GMEX genotyping** (avg turnaround 80.3 min, 95% CI 80.1–80.5).
- Acute **nondisabling ischemic stroke (NIHSS ≤3)** OR **high-risk TIA (ABCD² ≥4)**
- **Within 24 hours** of symptom onset (median 14h)
- 202 centers in China; 98.0% Han Chinese; median age 64.8; 33.8% women
- 78.0% intermediate metabolizers; 22.0% poor metabolizers
- 80.4% qualifying ischemic stroke; 19.6% qualifying TIA

**Key exclusions:**
- IV thrombolysis or mechanical thrombectomy
- mRS 3–5 at baseline (moderate-to-severe disability)
- ICH or amyloid angiopathy history
- DAPT in prior 72h
- Anticoagulation (presumed cardioembolic source: AF, prosthetic valve, suspected endocarditis)
- Contraindication to ticagrelor, clopidogrel, or aspirin

**Generalizability flag (verbatim from Discussion):** "Our results are not generalizable to non-Han patients, because Han patients made up 98.0% of those enrolled." CYP2C19 LOF prevalence ~60% in Asian populations vs ~25% in White populations — meaning the **eligible subgroup** in non-Asian settings is substantially smaller but the biological rationale (clopidogrel under-activation in LOF carriers) transfers.

### 3. Intervention and comparator
Verbatim from Treatment section:
- **Ticagrelor–aspirin arm:** "placebo clopidogrel plus a 180-mg loading dose of ticagrelor on day 1, followed by 90 mg twice daily on days 2 through 90"
- **Clopidogrel–aspirin arm:** "placebo ticagrelor plus a 300-mg loading dose of clopidogrel on day 1, followed by 75 mg daily on days 2 through 90"
- **Both arms:** "open-label aspirin at a loading dose of 75 to 300 mg, followed by 75 mg daily for 21 days"

**Critical comparator framing:** ticagrelor + aspirin (genotype-guided DAPT) vs **clopidogrel + aspirin (standard CHANCE-style DAPT)** — *not* vs aspirin monotherapy. CHANCE-2 is a head-to-head DAPT-vs-DAPT comparison within a genotyped LOF-carrier population, asking whether ticagrelor replaces clopidogrel in the standard short-course DAPT regimen for LOF carriers.

### 4. Primary endpoint
Verbatim from Outcomes: **"The primary outcome was new ischemic or hemorrhagic stroke at 90 days."**

Primary safety (verbatim): **"severe or moderate bleeding as defined by the Global Utilization of Streptokinase and Tissue Plasminogen Activator for Occluded Coronary Arteries (GUSTO) criteria at 90 days."**

### 5. Statistical framework
**`superiority`** — Sample size 6396 LOF carriers, 90% power to detect 25% relative risk reduction in new stroke (ticagrelor vs clopidogrel), final two-sided alpha 0.048 (after O'Brien–Fleming adjustment for one interim analysis), assuming 9.4% stroke incidence in clopidogrel arm and 5% dropout. Cox proportional-hazards model with trial centers as random effect. ITT analysis. Authors explicitly state: secondary outcome CIs **not adjusted for multiplicity** and **no definite conclusions can be drawn** from secondary outcomes.

### 6. Primary result
**Stroke (ischemic or hemorrhagic) at 90 days:**
- Ticagrelor–aspirin: 191/3205 = **6.0%**
- Clopidogrel–aspirin: 243/3207 = **7.6%**
- **HR 0.77, 95% CI 0.64–0.94, P=0.008**
- ARR ≈ 1.6 percentage points
- **NNT ≈ 63** (1/0.016) — qualifies for NNT display per §clinical-trial-audit rules: superiority, binary primary, primary outcome itself

Post hoc competing-risk analysis (death from nonvascular causes as competing risk): HR 0.80 (95% CI 0.66–0.96) — consistent. Per-protocol consistent.

### 7. Key safety results
**Primary safety — severe or moderate bleeding (GUSTO) at 90 days:**
- Ticagrelor–aspirin: 9/3205 = **0.3%**
- Clopidogrel–aspirin: 11/3207 = **0.3%**
- **HR 0.82, 95% CI 0.34–1.98, P=0.66** — no significant difference in severe/moderate bleeding

**Secondary safety (unadjusted, hypothesis-generating only):**
- **Any bleeding:** 5.3% (170/3205) vs 2.5% (80/3207) — **HR 2.18, 95% CI 1.66–2.85**. Driven almost entirely by mild bleeding (5.0% vs 2.2%, HR 2.41, 95% CI 1.81–3.20).
- Intracranial hemorrhage: 0.1% vs 0.2% (HR 0.49, 95% CI 0.12–1.96)
- Fatal bleeding: 0.1% each
- Death: 0.3% vs 0.6% (HR 0.50, 95% CI 0.22–1.11)
- **Adverse events:** 16.8% vs 13.3% — dyspnea and arrhythmia more frequent with ticagrelor (consistent with ticagrelor class effect)

**Net interpretation:** ticagrelor reduces 90-day stroke (NNT 63) vs clopidogrel in LOF carriers **without** increasing severe/moderate bleeding, but at the cost of more mild bleeding and ticagrelor-class side effects (dyspnea, arrhythmia, ~12% trial discontinuation pattern).

### 8. Expert and editorial caveats
- **Comparator is not aspirin monotherapy.** CHANCE-2 cannot establish whether ticagrelor DAPT is better than aspirin alone — only that it is better than clopidogrel DAPT *within LOF carriers*. The chain remains: aspirin alone < clopidogrel DAPT (CHANCE/POINT) < ticagrelor DAPT in LOF carriers (CHANCE-2). For non-LOF carriers, clopidogrel DAPT remains standard.
- **Genotype-guided strategy depends on rapid point-of-care testing.** Trial used GMEX (avg 80 min). In settings without rapid POC genotyping, empirical clopidogrel DAPT remains the default; CHANCE-2 results do not endorse delaying treatment to obtain genotype.
- **Han Chinese-only enrollment.** Trial population 98.0% Han Chinese. Higher prevalence of intracranial atherosclerosis in this population (~25% of patients had symptomatic ICAS). Generalizability to non-Asian populations is **explicitly disclaimed by authors**.
- **Window ≤24h.** CHANCE-2 does not extend to 72h (that's INSPIRES territory, not yet tested in LOF carriers).
- **No CYP2C19 *17 separately tested for gain-of-function activity** — CHANCE-2 enrolled only *2/*3 LOF carriers; *17 (rapid metabolizer) status was not used as enrollment criterion.
- **Bleeding signal pattern:** ticagrelor doubles mild bleeding but does not increase severe bleeding — opposite pattern from THALES (which doubled severe bleeding in unselected minor stroke population). The genotype enrichment likely explains the favorable net safety profile.
- **Funded by Ministry of Science and Technology of the People's Republic of China and others;** Shenzhen Salubris Pharmaceuticals supplied drug. Chongqing Jingyin Bioscience supplied GMEX POC genotyping system at no cost. Both reported no role in design/conduct/analysis.
- **AHA/ASA 2026 status (per task brief):** **COR 2b — "ticagrelor reasonable over clopidogrel in CYP2C19 LOF carriers"** in the secondary-prevention DAPT section. The repo already cross-references this COR 2b assignment in two places (`trialData.ts` lines 6451 and 6600). Medical-scientist to verify the exact section number when populating citation registry.

### 9. NeuroWiki field mapping (CHANCE-2)
Target file: `src/data/trialData.ts` (entry id `chance2-trial` or equivalent — confirm with current registry).

| Field | Verified value |
|---|---|
| `doi` | `10.1056/NEJMoa2111749` |
| `pmid` | (to be confirmed by medical-scientist via PubMed) |
| `nctId` | `NCT04078737` |
| `firstAuthor` | `Y. Wang` |
| `year` | `2021` |
| `journal` | `N Engl J Med` |
| `volume/issue/pages` | `385(27):2520–2530` |
| `primaryEndpoint` | `New ischemic or hemorrhagic stroke at 90 days` |
| `statisticalFramework` | `superiority` |
| `displayArchetype` | `bar-binary` (binary primary; KM available if `risk-table-km` preferred) |
| `primaryResult.intervention` | `6.0% (191/3205)` |
| `primaryResult.comparator` | `7.6% (243/3207)` |
| `primaryResult.effectSize` | `HR 0.77 (95% CI 0.64–0.94), P=0.008` |
| `primaryResult.arr` | `1.6 percentage points` |
| `calculations.nnt` | `63` |
| `safetyTradeoff.severeBleedingHR` | `0.82 (95% CI 0.34–1.98), P=0.66 — no significant difference` |
| `safetyTradeoff.anyBleedingHR` | `2.18 (95% CI 1.66–2.85) — mild bleeding driver` |
| `safetyTradeoff.icHR` | `0.49 (95% CI 0.12–1.96) — no signal` |
| `inclusionCriteria` | `Age ≥40; acute nondisabling ischemic stroke (NIHSS ≤3) OR high-risk TIA (ABCD² ≥4); within 24h of onset; CYP2C19 LOF allele carrier (*2 or *3, intermediate or poor metabolizer); no thrombolysis/EVT; mRS ≤2 baseline` |
| `regimen` | `Ticagrelor 180 mg load → 90 mg BID × days 2–90 + aspirin 75–300 mg load → 75 mg daily × 21 days` (vs clopidogrel 300/75 + same aspirin schedule) |
| `comparator` | `Clopidogrel 300 mg load → 75 mg daily + aspirin × 21 days` (DAPT-vs-DAPT, not vs monotherapy) |
| `howToInterpret` | "CHANCE-2 is the only trial comparing ticagrelor DAPT vs clopidogrel DAPT in **genotyped CYP2C19 loss-of-function carriers**. Ticagrelor reduces 90-day stroke (HR 0.77; NNT 63) without increasing severe/moderate bleeding, but doubles mild bleeding (HR 2.18). Result applies **only** to confirmed LOF carriers within 24h of symptom onset; non-carriers should receive standard clopidogrel DAPT (CHANCE/POINT)." |
| `bedsidePearl` | "If rapid CYP2C19 point-of-care genotyping is available and patient is a confirmed *2/*3 LOF carrier (~60% of Asian patients, ~25% of White patients), ticagrelor + aspirin × 21 days is preferred over clopidogrel + aspirin (CHANCE-2, AHA/ASA 2026 COR 2b). Without rapid genotyping, do not delay — empirical clopidogrel DAPT is standard (CHANCE/POINT)." |
| `caveats` | `Han Chinese-only (98.0%); requires rapid POC genotyping; comparator is clopidogrel DAPT not aspirin alone; CYP2C19 *17 carriers not separately analyzed; trial excluded moderate-to-severe stroke (NIHSS >3) and presentations >24h` |
| `chainContext` | "Predecessors: CHANCE (2013, ≤24h, NIHSS ≤3, clopidogrel DAPT vs ASA), POINT (2018, ≤12h, NIHSS ≤3, clopidogrel DAPT vs ASA). CHANCE-2 (2021) addresses pharmacogenomic limitation of clopidogrel in LOF carriers. INSPIRES (2023) extends the window to 72h for atherosclerotic minor stroke / high-risk TIA on clopidogrel DAPT vs ASA." |
| `last_reviewed` | `2026-05-14` (write only after §13.6 checklist completion) |

### 10. Verification confidence — **High**
DOI matches title verbatim on PDF cover; methods (Trial Patients, Treatment, Outcomes, Statistical Analysis) and results (Tables 1–2, Figures 2–3) read; primary endpoint extracted verbatim; primary statistics confirmed. NCT verified from abstract footer. PMID to be confirmed by medical-scientist via PubMed lookup before citation registry write.

---

## Chain context — CHANCE → POINT → INSPIRES → CHANCE-2

| Trial | Year | Window | Population | Comparison | NNT (90-d stroke) | Contribution |
|---|---|---|---|---|---|---|
| **CHANCE** | 2013 | ≤24h | NIHSS ≤3 / TIA ABCD² ≥4 | Clopi+ASA vs ASA × 21d → ASA | ~31 | Established short-course DAPT for minor stroke/high-risk TIA in Chinese population |
| **POINT** | 2018 | ≤12h | NIHSS ≤3 / TIA ABCD² ≥4 | Clopi+ASA vs ASA × 90d (DAPT 90d) | ~67 (90d); benefit accrues by day 21 | Confirmed in mostly North American population; subgroup analysis identified day-21 inflection |
| **INSPIRES** | 2023 | **24–72h** | NIHSS ≤5 / TIA ABCD² ≥4, **atherosclerotic** | Clopi+ASA vs ASA × 21d → clopi | **53** | Extended window to 72h for atherosclerotic mechanism; documented bleeding HR 2.08 |
| **CHANCE-2** | 2021 | ≤24h | NIHSS ≤3 / TIA ABCD² ≥4, **CYP2C19 LOF carriers** | Tica+ASA vs **Clopi+ASA** × 21d | **63** | Genotype-guided substitution of ticagrelor when clopidogrel pharmacologically inadequate |

**Together:** the chain frames a bedside algorithm:
1. **≤24h, NIHSS ≤3 / high-risk TIA, no LOF genotype known** → clopidogrel + aspirin × 21d (CHANCE/POINT). 
2. **≤24h, NIHSS ≤3 / high-risk TIA, confirmed CYP2C19 LOF carrier** → ticagrelor + aspirin × 21d (CHANCE-2, COR 2b).
3. **24–72h, NIHSS ≤5 / high-risk TIA, atherosclerotic mechanism** → clopidogrel + aspirin × 21d (INSPIRES).
4. **>72h or non-atherosclerotic minor stroke beyond 24h** → no high-quality DAPT evidence; default aspirin monotherapy or extended single-agent therapy per guideline.

---

## Handoff items for citation registry / W5.2 (per parking-lot 2026-05-08)

1. **INSPIRES bleeding HR 2.08 (1.07–4.04) — VERIFIED from Table 2 and Figure 2B of source PDF.** Safe to register as authoritative.
2. **OPTIMAS 2pp NI margin** — out of scope of this packet; flagged for separate evidence-verifier review under W5.2.
3. **AHA/ASA 2026 COR/LOE for INSPIRES** — repo currently references INSPIRES (NNT 53, 72h) without an explicit COR. Medical-scientist must extract the exact COR/LOE from the AHA/ASA 2026 secondary-prevention DAPT section before citation registry entry.
4. **CHANCE-2 PMID** — task brief did not include; medical-scientist to look up via PubMed before populating `pmid` field.

---

## Block conditions — none triggered

- DOI resolves to matching title for both trials.
- Primary endpoints in source match repo's existing framing.
- Statistical framework determinable from methods (both superiority).
- NNT is being calculated from the **primary** binary outcome of a **superiority** RCT for both trials → meets §clinical-trial-audit rules.
- Both trials are clearly randomized superiority RCTs displayed appropriately as `bar-binary` — not registry, not NI, not Bayesian.

**Packet ready for handoff to `medical-scientist` (authoring) → `clinical-reviewer` (gating).**

---

**Relevant file paths:**
- Reserved output path (not written this session per the do-not-edit constraint): `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/docs/evidence-packets/2026-05-14-inspires-chance2.md`
- Source PDFs: `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/6 - Secondary Prevention/INSPIRES.pdf`, `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/6 - Secondary Prevention/CHANCE-2.pdf`
- Repo references touched (read-only): `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts`, `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/aha2026StrokeGuideline.ts`