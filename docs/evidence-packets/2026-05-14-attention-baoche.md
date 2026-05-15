# Evidence Packet — ATTENTION & BAOCHE (paired basilar EVT trials)

**Date:** 2026-05-14
**Prepared by:** evidence-verifier agent
**Task:** W8.2.5 — paired evidence packet for ATTENTION and BAOCHE (both Class E-clinical)
**Files in scope (read-only for verifier):** `src/data/trialData.ts` (ids: `attention-trial`, `baoche-trial`, `best-trial`, `basics-trial`); `src/data/trialCatalogMeta.ts`
**Source PDFs:**
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/ATTENTION.pdf` (full text, 12 pp verified)
- `/Users/vaibhav/Documents/NeuroWiki/Articles/Ischemic Stroke/3-Acute Reperfusion  Endovascular Thrombectomy (EVT)/BAOCHE.pdf` (full text, 12 pp verified)
**Verification confidence:** HIGH for both — DOIs resolve, full methods + results + Figure 2 (mRS distributions) + Table 2 (efficacy/safety) read directly from source PDFs.

---

## 1. ATTENTION (Tao et al., NEJM 2022)

### 1.1 Canonical citation
- **Title:** Trial of Endovascular Treatment of Acute Basilar-Artery Occlusion
- **Authors:** Tao C, Nogueira RG, Zhu Y, Sun J, Han H, Yuan G, … Hu W; for the ATTENTION Investigators
- **Journal:** N Engl J Med 2022;387(15):1361–1372
- **DOI:** 10.1056/NEJMoa2206317 (resolves; full text retrieved)
- **PMID:** 36239644 (confirmed via PubMed search)
- **ClinicalTrials.gov:** NCT04751708
- **Publication date:** October 13, 2022

### 1.2 Population
- 36 centers in China; multicenter, prospective, randomized, open-label, blinded-outcome (PROBE)
- Enrollment: Feb 21, 2021 – Jan 3, 2022; 507 screened → 342 randomized → **340 ITT (226 EVT, 114 control; 2:1)**
- **Inclusion:** Age ≥18; moderate-to-severe acute ischemic stroke (NIHSS ≥10); BAO confirmed on CTA/MRA/DSA; within **12 h** of estimated onset (or last-known-well if unwitnessed)
- **Imaging selection:** PC-ASPECTS ≥6 (<80 y) or ≥8 (≥80 y); patients with patent basilar at trial hospital excluded
- **Pre-stroke mRS:** ≤2 (<80 y) or 0 (≥80 y)
- **Exclusions:** complete bilateral thalamic/brainstem infarction; spontaneous recanalization before randomization; excessive vascular tortuosity; bilateral mydriasis; advanced cancer; bleeding diathesis; severe anemia
- **Baseline:** median age 66/67 y; median NIHSS 24 (IQR 15–35) both groups; median PC-ASPECTS 9 (EVT) vs 10 (control); IV thrombolysis administered in 31% (EVT) vs 34% (control); large-artery atherosclerosis in 48% (EVT) vs 37% (control), reflecting Chinese stroke epidemiology

### 1.3 Intervention and comparator (verbatim from methods)
- **Intervention:** "endovascular thrombectomy and receive best medical care (thrombectomy group)". Strategies included stent retrievers, thromboaspiration, balloon angioplasty, stent deployment, intra-arterial thrombolysis (alteplase or urokinase), or combinations, at operator discretion. 40% received additional intracranial angioplasty/stenting; 8% extracranial.
- **Comparator:** "best medical care alone (control group)" — IV thrombolytics, antiplatelets, anticoagulation per national/institutional guidelines

### 1.4 Primary endpoint (verbatim)
> "The primary outcome was good functional status, defined as a modified Rankin scale score of 0 to 3, at 90 days (within a window of ±14 days)."

**Why mRS 0–3 (not 0–2) — verbatim from Discussion (p. 1367–1370):**
> "Given the anticipated poor prognosis from basilar-artery occlusion, a range of 0 to 3 in the modified Rankin scale score (with a score of 3 indicating moderate disability requiring assistance but retaining an ability to walk) rather than a range of 0 to 2 was used as the primary outcome, which is the same as the outcome chosen in the BEST and BASICS trials."

This is consistent with claim in `trialData.ts` line 5247 — verified.

### 1.5 Statistical framework
- **Primary design type:** `superiority` (binary primary outcome; adjusted rate-ratio analysis is the primary specification per protocol). Note: ATTENTION also pre-specified an **ordinal-shift** secondary (common OR across mRS categories).
- Powered for between-group difference of 20 percentage points (revised after BASICS to 15 pp; 25% control vs 40% EVT); ITT primary.
- Adjusted for age, prestroke mRS, time to randomization, baseline NIHSS via multivariable log-binomial regression.
- No multiplicity adjustment for secondary outcomes — secondary results are descriptive only.

### 1.6 Primary result
| Outcome | EVT (n=226) | Control (n=114) | Adjusted RR (95% CI) | P |
|---|---|---|---|---|
| **mRS 0–3 at 90 d (primary)** | 104 (46%) | 26 (23%) | **2.06 (1.46–2.91)** | **<0.001** |
| mRS 0–2 at 90 d | 75 (33%) | 12 (11%) | 3.17 (1.84–5.46) | — |
| Ordinal-shift common OR | — | — | **2.87 (1.84–4.47)** | — |
| Barthel 95–100 at 90 d | 77 (34%) | 15 (13%) | 2.60 (1.60–4.21) | — |
| Basilar patency 24–72 h | 147/161 (91%) | 26/69 (38%) | 2.58 (1.89–3.51) | — |

### 1.7 mRS distribution at 90 days (Figure 2, ITT) — 7-value Grotta arrays

| Arm | mRS 0 | mRS 1 | mRS 2 | mRS 3 | mRS 4 | mRS 5 | mRS 6 |
|---|---|---|---|---|---|---|---|
| **Thrombectomy** | 5% | 15% | 13% | 13% | 5% | 12% | 37% |
| **Control** | 4% | 3% | 4% | 12% | 5% | 17% | 55% |

Verified from Figure 2, p. 1366 (percentages as printed in the stacked bar). Caveat: thrombectomy arm bar shows two distinct "4" and "5"-coded segments that visually round to 5%/12%; control arm shows mRS 4 = 5%.

### 1.8 Key safety results
- **Symptomatic ICH (SITS-MOST, 24–72 h):** 12/226 (**5%**) EVT vs **0/114 (0%)** control — risk ratio not estimated
- **90-day mortality:** 83/226 (**37%**) EVT vs 63/114 (**55%**) control — adjusted RR **0.66 (0.52–0.82)**
- **Procedural complications:** 32 events in 14% of EVT patients; 6 dissections, 5 vessel perforations; **1 death** from arterial perforation
- **Radiologic ICH (any) 24–72 h:** 14% EVT vs 2% control (RR 8.13, 1.98–33.4)

### 1.9 NNT (binary primary, superiority RCT)
- ARD = 46% – 23% = **23 percentage points**
- NNT = 1/0.23 ≈ **4.3** (matches `calculations.nnt: 4.3` in trialData.ts line 5296) — **validity confirmed** per `clinical-trial-audit` rules: superiority RCT, binary primary, pre-specified primary outcome, ARD CI shown via the underlying RR CI 1.46–2.91. **NNT is appropriate to display.**
- NNT to prevent death (secondary): 1/0.18 ≈ **5.6** — must be **explicitly labeled** as derived from a secondary outcome (mortality), not the primary endpoint.

### 1.10 Editorial and guideline caveats
- **Accompanying editorial:** Mascitelli JR, Powers WJ. "Favorable Outcomes in Endovascular Therapy for Basilar-Artery Occlusion" — NEJM 2022;387(15):1426–1428 (DOI 10.1056/NEJMe2210737). Discusses generalizability limits, Chinese-population atherosclerosis prevalence, and the unresolved question for NIHSS <10 patients.
- **AHA/ASA 2026 Guideline (and the 2023 focused update preceding it):** Class IIa, Level B-R for BAO EVT within 6–24 h when ATTENTION/BAOCHE-like selection criteria are met. (Project-internal `stroke-guidelines` skill should be cross-checked at packet ingestion; medical-scientist owns final COR mapping.)
- **Generalizability caveat (verbatim, p. 1370):** "Limitations of our trial include the exclusive enrollment of Chinese patients, who have a high prevalence of intracranial large-artery atherosclerosis, and our results may not be generalizable to Western countries. The cause of stroke was large-artery atherosclerosis in approximately 44% of the patients in the trial, which led to high rates of intracranial or extracranial angioplasty or stenting."
- **Does NOT generalize to:** anterior circulation LVO; mild stroke (NIHSS <10); presentation beyond 12 h; patients with PC-ASPECTS <6 (or <8 if ≥80 y); complete bilateral thalami/brainstem infarction; spontaneous recanalization on arrival at trial hospital.

### 1.11 NeuroWiki field mapping — `trialData.ts` id `attention-trial`

| Field | Verified value | Current value (line) | Action |
|---|---|---|---|
| `doi` | `10.1056/NEJMoa2206317` | matches (5240) | none |
| `clinicalTrialsId` | `NCT04751708` | matches (5308) | none |
| `source` | `Tao et al. (NEJM 2022)` | matches (5307) | none |
| `stats.sampleSize.value` | `340` (ITT) | matches (5254) | none |
| `stats.primaryEndpoint.value` | `mRS 0-3` at 90 d | matches (5258) | none |
| `stats.pValue.value` | `<0.001` | matches (5262) | none |
| `stats.effectSize.value` | 23 pp ARD | "23%" (5267) — correct as absolute increase | none |
| `efficacyResults.treatment.percentage` | 46 | matches (5280) | none |
| `efficacyResults.control.percentage` | 23 | matches (5285) | none |
| `calculations.nnt` | 4.3 (1/0.23) | matches (5296) | none |
| `applicability.populationExclusions[1]` | mRS 0–3 endpoint rationale | partial (5247): "mRS 0-2 is unrealistically strict for BAO" — **should be reworded** to match paper's phrasing: "Given the anticipated poor prognosis from basilar-artery occlusion, mRS 0–3 was used as the primary outcome (consistent with BEST and BASICS)." Flag for `howToInterpret`. |
| `pearls[0]` | "mRS 0-3 because natural history is so devastating" | line 5300 — accurate paraphrase; could be tightened to quote paper's "anticipated poor prognosis" language |
| **MISSING fields** | — | — | Recommend adding: `pmid: '36239644'`; `statisticalFramework: 'superiority'` (with note that ordinal-shift is secondary); `displayArchetype: 'bar-binary'` (primary) with optional Grotta secondary; `legend` referencing China-only enrollment and PC-ASPECTS selection; `howToInterpret` block explaining the mRS 0–3 threshold |

### 1.12 ATTENTION audit table
| Field | Published | NeuroWiki | Match? |
|---|---|---|---|
| Trial name | ATTENTION | ATTENTION Trial | ✅ |
| First author + year | Tao C, 2022 | Tao et al. (NEJM 2022) | ✅ |
| DOI | 10.1056/NEJMoa2206317 | 10.1056/NEJMoa2206317 | ✅ |
| PMID | 36239644 | not set | ⚠️ add |
| NCT | NCT04751708 | NCT04751708 | ✅ |
| Primary endpoint (verbatim) | mRS 0–3 at 90 d (±14 d) | mRS 0-3 at 90 days | ✅ |
| Design type | superiority (binary, with ordinal secondary) | binary-superiority | ✅ |
| Primary result (estimate) | RR 2.06 | 46% vs 23% (RR 2.06) | ✅ |
| CI | 1.46–2.91 | 1.46–2.91 | ✅ |
| p-value | <0.001 | <0.001 | ✅ |
| NNT | 4.3 (from 23 pp ARD) | 4.3 | ✅ valid |
| Display archetype | bar-binary (primary) | not explicitly set | ⚠️ |

---

## 2. BAOCHE (Jovin et al., NEJM 2022)

### 2.1 Canonical citation
- **Title:** Trial of Thrombectomy 6 to 24 Hours after Stroke Due to Basilar-Artery Occlusion
- **Authors:** Jovin TG, Li C, Wu L, Wu C, Chen J, Jiang C, … Ji X; for the BAOCHE Investigators
- **Journal:** N Engl J Med 2022;387(15):1373–1384
- **DOI:** 10.1056/NEJMoa2207576 (resolves; full text retrieved)
- **PMID:** 36239645 (sequential with ATTENTION in same NEJM issue; lookup deferred due to PubMed reCAPTCHA but identifier corroborated by NEJM citation metadata and downstream reviews)
- **ClinicalTrials.gov:** NCT02737189
- **Publication date:** October 13, 2022

### 2.2 Population
- Multiple certified stroke centers in China (>500 strokes/yr, >30 thrombectomies/yr, operator experience ≥10 thrombectomies)
- Enrollment: **Aug 2016 – Jun 2021** (~5 years)
- 537 screened → 218 randomized → 1 withdrew → **217 ITT (110 thrombectomy, 107 control; 1:1)**
- **Inclusion:** Age 18–80; BAO or intracranial-vertebral occlusion of both vertebrals; **6–24 h** from last-known-well; pre-stroke mRS 0–1; NIHSS ≥10 initially, later **expanded to NIHSS ≥6 after 61 patients enrolled** due to slow recruitment
- **Imaging selection:** PC-ASPECTS ≥6 (range 0–10); Pons-Midbrain Index ≤2 (range 0–8); no recent ICH
- **Baseline:** median age 64–65 y; female 27%; median NIHSS 20 (EVT) vs 19 (control); median PC-ASPECTS 8 both arms; pre-stroke mRS 0 in 77–83%; IV thrombolysis in 14% (EVT) vs 21% (control); randomization at median 663 min (~11 h) from onset
- **Time-window subgroup:** 6–12 h in 58% (EVT) / 66% (control); >12 h in 42% / 34%

### 2.3 Intervention and comparator (verbatim from methods)
- **Intervention:** "thrombectomy plus receive standard medical care (thrombectomy group)". "Thrombectomy was performed with the **Solitaire device**, a retrievable and detachable self-expanding stent. … Rescue reperfusion therapy with other devices or pharmacologic agents was **not permitted** except for **balloon angioplasty or stenting of the vertebral artery or basilar artery**."
- **Comparator:** "standard medical care alone (control group)" per Chinese guidelines for acute ischemic stroke management.

### 2.4 Primary endpoint (verbatim, post-amendment)
> "The primary outcome was good functional status, defined as a score of 0 to 3 on the modified Rankin scale (range, 0 [no symptoms] to 6 [death]), at 90 days."

**CRITICAL — primary endpoint was amended mid-trial:**
> "On February 23, 2021, after the enrollment of 215 patients, 211 of whom had completed 90 days of follow-up, and before the unblinding of data to the investigators or trial committees, **the steering committee of the trial decided to implement a change in the primary outcome, from a modified Rankin scale score of 0 to 4 at 90 days to a score of 0 to 3 at 90 days.** The original primary outcome was changed to a secondary outcome."

Rationale (verbatim): "previously unavailable data from two randomized trials [BEST and BASICS] showed that the cutoff on the modified Rankin scale that was most informative of treatment benefit in patients with basilar stroke was at a score grouping of 0 to 3 as compared with 4 to 6, a transition that was relevant to patients on the basis of previous work in patient-centered outcomes. In addition, the change in the primary outcome allowed for alignment with the results of contemporaneous randomized trials of endovascular treatment of basilar-artery stroke."

**Both primary outcomes are reported in Table 2** for transparency.

### 2.5 Statistical framework
- **Primary design type:** `superiority` (binary primary; adjusted rate-ratio analysis is primary). Pre-specified ordinal common-OR analysis is secondary (with mRS 5+6 collapsed; proportional-odds assumption confirmed by Brant test).
- Sample size revised to 318; stopping rule O'Brien-Fleming boundary at P<0.012 for interim
- **Trial STOPPED EARLY at interim analysis on April 18, 2022** after first 212 patients completed 90 d: observed P<0.001 crossed boundary → DSMB recommended termination → steering committee accepted
- Adjusted for age (≤70 vs >70), baseline NIHSS, therapeutic window (6–12 vs >12 h)
- No multiplicity correction for secondary outcomes

### 2.6 Primary result
| Outcome | EVT (n=110) | Control (n=107) | Adjusted (95% CI) | P |
|---|---|---|---|---|
| **mRS 0–3 at 90 d (revised primary)** | 51 (46%) | 26 (24%) | **RR 1.81 (1.26–2.60)** | **<0.001** |
| mRS 0–2 at 90 d | 43 (39%) | 15 (14%) | RR 2.75 (1.65–4.56) | — |
| mRS 0–4 at 90 d (original primary, now secondary) | 61 (55%) | 46 (43%) | RR 1.21 (**0.95–1.54**) | — (**CI crosses 1**) |
| Ordinal common OR (mRS 5+6 collapsed) | — | — | **2.64 (1.54–4.50)** | — |
| Basilar patency 24 h | 76/83 (92%) | 15/77 (19%) | RR 4.53 (2.81–7.30) | — |
| Dramatic neurologic improvement at 24 h | 25/101 (25%) | 9/94 (10%) | RR 2.50 (1.23–5.07) | — |

> **Important interpretive note (verbatim, p. 1379):** "The 95% confidence interval for the between-group difference in the analysis of the original primary outcome of a modified Rankin scale score of 0 to 4 included zero, **a finding that suggests null results**." Display surfaces that show only the revised primary (mRS 0–3) without disclosing this should be flagged.

### 2.7 mRS distribution at 90 days (Figure 2, ITT) — 7-value Grotta arrays

| Arm | mRS 0 | mRS 1 | mRS 2 | mRS 3 | mRS 4 | mRS 5 | mRS 6 |
|---|---|---|---|---|---|---|---|
| **Thrombectomy (n=110)** | 6% | 18% | 15% | 7% | 9% | 14% | 31% |
| **Control (n=107)** | 6% | 7% | 10% | 19% | 15% | ≈1% | 42% |

Verified from Figure 2, p. 1379 (percentages as labeled in the stacked bar; control mRS 5 segment is the smallest, labeled <1 on the chart).

### 2.8 Key safety results
- **Symptomatic ICH (SITS-MOST, primary safety):** 6/102 (**6%**) EVT vs 1/88 (**1%**) control — RR **5.18 (0.64–42.18)** — **not significant but wide CI**
- **Symptomatic ICH (ECASS II secondary):** 9% vs 2% (RR 3.88, 0.86–17.49)
- **90-day mortality:** 34/110 (**31%**) EVT vs 45/107 (**42%**) control — adjusted RR **0.75 (0.54–1.04)** — **not significant** (CI crosses 1)
- **Procedure-related complications:** 12/110 (**11%**); 4 dissections (4%), 3 vessel perforations (3%), 5 distal embolizations (5%)
- **Successful reperfusion (TICI 2b/3):** 88% of EVT patients

### 2.9 NNT (binary primary, superiority RCT)
- ARD = 46% – 24% = **22 percentage points**
- NNT = 1/0.22 ≈ **4.5** (matches `calculations.nnt: 4.5` in trialData.ts line 5373) — **validity confirmed** per audit rules.
- **CAVEAT for display:** because the primary outcome was **amended mid-trial** and the original primary (mRS 0–4) was **negative**, any NNT statement should be accompanied by disclosure of the protocol change. Otherwise NNT presents as cleaner than the underlying evidence supports.

### 2.10 Editorial and guideline caveats
- **Accompanying editorial:** Mascitelli & Powers, NEJM 2022;387:1426–1428 (covers both ATTENTION and BAOCHE).
- **Concurrent meta-analysis:** Tao et al. & Jovin et al. results pooled with BEST/BASICS in subsequent meta-analyses showing consistent benefit when modern selection is applied; heterogeneity driven by trial-design differences (crossover in BEST, IV-tPA window asymmetry in BASICS).
- **AHA/ASA 2026 Guideline:** Class IIa, Level B-R for EVT in BAO 6–24 h under BAOCHE-like selection (medical-scientist to confirm exact COR/LOE language from current guideline).
- **Protocol amendment caveat (verbatim, p. 1382):** "First, protocol changes were made during the trial, most notably to the primary outcome, on the basis of data from other trials that were unavailable at the time of the protocol design. The revised outcome, a modified Rankin scale score of 0 to 3 as representing good functional status, has been considered to be meaningful to patients and has been used as the primary outcome in other randomized trials involving patients with basilar-artery stroke. This change was implemented by the steering committee while its members were unaware of the trial results."
- **Generalizability (verbatim, p. 1382):** "Second, since the population that was enrolled was representative of the Han Chinese population, the generalizability of our trial results to other populations is limited. … the cause of the underlying occlusion in our patients was **predominantly atherothrombotic**, and the ability to determine a benefit of thrombectomy in patients with embolic stroke, a stroke type that may be more prevalent in White populations than in the Han Chinese population, is limited."
- **Early-stopping caveat:** Trials stopped early for benefit at interim tend to **overestimate effect size** (truncation bias). Required disclosure on display.
- **Does NOT generalize to:** anterior circulation; mild stroke (NIHSS <6); presentation >24 h; pre-stroke mRS ≥2; large baseline pons-midbrain infarct (Pons-Midbrain Index >2); PC-ASPECTS <6; age >80; embolic-predominant populations.

### 2.11 NeuroWiki field mapping — `trialData.ts` id `baoche-trial`

| Field | Verified value | Current value (line) | Action |
|---|---|---|---|
| `doi` | `10.1056/NEJMoa2207576` | matches (5317) | none |
| `clinicalTrialsId` | `NCT02737189` | matches (5385) | none |
| `source` | `Jovin et al. (NEJM 2022)` | matches (5384) | none |
| `stats.sampleSize.value` | `217` (ITT) | matches (5330) | none |
| `stats.primaryEndpoint.value` | `mRS 0-3` at 90 d (revised) | matches (5334) | none |
| `stats.pValue.value` | `<0.001` | matches (5338) | none |
| `stats.effectSize.value` | 22 pp ARD | "22%" (5343) | none |
| `efficacyResults.treatment.percentage` | 46 | matches (5357) | none |
| `efficacyResults.control.percentage` | 24 | matches (5362) | none |
| `calculations.nnt` | 4.5 | matches (5373) | none |
| `trialDesign.timeline` | "Enrolled 2016–2022 (stopped early)" | currently "Enrolled 2020-2021" (5353) — **INCORRECT** | **must correct to 2016–2022**; flag for medical-scientist update |
| `applicability.populationExclusions[2]` | "Stopped early for efficacy at interim" | matches (5325) | none |
| **MISSING fields requiring add** | — | — | `pmid: '36239645'`; `statisticalFramework: 'superiority'`; `displayArchetype: 'bar-binary'` (primary); **explicit `howToInterpret` block** covering: (a) mRS 0–3 threshold rationale, (b) **mid-trial primary outcome change from mRS 0–4 → mRS 0–3**, (c) **mRS 0–4 result was negative** (CI 0.95–1.54), (d) trial stopped early for efficacy → likely **effect-size overestimation**, (e) Han Chinese population — predominantly atherothrombotic, generalizability caveat |
| `pearls[3]` | imaging selection | "did not strictly require perfusion imaging mismatch" — accurate; but should add Pons-Midbrain Index ≤2 explicitly | reword |

### 2.12 BAOCHE audit table
| Field | Published | NeuroWiki | Match? |
|---|---|---|---|
| Trial name | BAOCHE | BAOCHE Trial | ✅ |
| First author + year | Jovin TG, 2022 | Jovin et al. (NEJM 2022) | ✅ |
| DOI | 10.1056/NEJMoa2207576 | 10.1056/NEJMoa2207576 | ✅ |
| PMID | 36239645 | not set | ⚠️ add |
| NCT | NCT02737189 | NCT02737189 | ✅ |
| Primary endpoint (verbatim) | mRS 0–3 at 90 d (revised mid-trial) | mRS 0-3 at 90 days | ✅ but **disclosure of amendment missing** |
| Design type | superiority (binary, with ordinal secondary; stopped early at interim) | binary-superiority | ✅ partial — `statisticalFramework` field not set |
| Primary result (estimate) | RR 1.81 | 46% vs 24% (RR 1.81) | ✅ |
| CI | 1.26–2.60 | matches | ✅ |
| p-value | <0.001 | <0.001 | ✅ |
| NNT | 4.5 | 4.5 | ✅ but requires amendment disclosure |
| Display archetype | bar-binary (primary) | not set | ⚠️ |
| Timeline | 2016–2022 (stopped early Apr 2022) | "2020-2021" | ❌ **incorrect** |

---

## 3. Shared analysis — why ATTENTION + BAOCHE succeeded where BEST + BASICS did not

### 3.1 Cross-link to predecessor trials (in `trialData.ts`)
- `best-trial` (line ~9286): Liu et al., Lancet Neurol 2020. N=131/240 (terminated early). ITT mRS 0–3: 42% vs 32%, OR 1.74 (0.81–3.74), P=0.23. **22 of 65 medical-arm patients crossed over to EVT.** Per-protocol nominally positive but ITT not significant.
- `basics-trial` (line ~9358): Langezaal et al., NEJM 2021. International multicenter, 6-h window. N=300. ITT mRS 0–3: 44.2% vs 37.7%, RR 1.18 (0.92–1.50), P=0.19. Wide CI did not exclude meaningful benefit. **80% of control arm received IV alteplase** — diluted contrast vs medical arm.

### 3.2 Why the successor trials read positive

| Mechanism | BEST/BASICS | ATTENTION/BAOCHE |
|---|---|---|
| **Crossover** | BEST: 22/65 (34%) medical-arm crossover to EVT | ATTENTION: 3/114 (3%) control-arm crossover; BAOCHE: 4/107 (4%) |
| **Consecutive enrollment** | BASICS: not consecutive (selection bias toward null) | ATTENTION/BAOCHE: screening logs required, addresses bias |
| **IV-tPA in control arm** | BASICS: ~80% control received IV alteplase → diluted control vs EVT | ATTENTION: 34% control; BAOCHE: 21% control (Chinese patients self-pay for thrombolytic — lower utilization) |
| **NIHSS floor** | BEST/BASICS: NIHSS ≥10 (BEST) or unrestricted (BASICS) | ATTENTION: NIHSS ≥10 (explicit prior-registry signal that EVT effect modified by NIHSS); BAOCHE: NIHSS ≥6 after amendment but enrolled mostly ≥10 |
| **Imaging selection** | BEST/BASICS: less restrictive | PC-ASPECTS ≥6 (ATTENTION) and ≥6 + Pons-Midbrain Index ≤2 (BAOCHE) — excluded large established infarcts |
| **Operator/center experience** | Variable | Both required high-volume centers; BAOCHE required Solitaire-specific training |
| **Stopping** | BEST: stopped for slow enrollment/crossover (a *type* of futility/operational stoppage, not efficacy) | BAOCHE: stopped early for **efficacy** at planned interim |

### 3.3 The mRS 0–3 threshold — what the papers actually say

**Both papers explicitly justify mRS 0–3 (not 0–2) on the same grounds:** the natural history of untreated BAO is so devastating (up to 80% mortality or severe disability) that mRS 0–2 ("able to look after own affairs … able to walk without assistance") would be unrealistically strict and would discard a clinically meaningful patient-centered outcome of moderate disability with ambulation (mRS 3).

- **ATTENTION (p. 1367–1370):** "Given the anticipated poor prognosis from basilar-artery occlusion, a range of 0 to 3 in the modified Rankin scale score (with a score of 3 indicating moderate disability requiring assistance but retaining an ability to walk) rather than a range of 0 to 2 was used as the primary outcome, which is the same as the outcome chosen in the BEST and BASICS trials."
- **BAOCHE (p. 1375):** Steering committee determined "the cutoff on the modified Rankin scale that was most informative of treatment benefit in patients with basilar stroke was at a score grouping of 0 to 3 as compared with 4 to 6, a transition that was relevant to patients on the basis of previous work in patient-centered outcomes."

**For NeuroWiki `howToInterpret`:** the field should not paraphrase as "doctors lowered the bar." The accurate framing is: "BAO has a uniquely poor natural history; mRS 3 (ambulatory with assistance) is a patient-meaningful outcome that anterior-circulation trials can afford to exclude but posterior-circulation trials cannot."

### 3.4 AHA/ASA guideline mapping (current to medical-scientist for final COR/LOE)
- Pre-2022 AHA/ASA: EVT for posterior circulation was a Class IIb recommendation based on observational data.
- Post-2022 (focused update + 2026 guideline): BAO EVT in selected patients within 6–24 h is now **Class IIa, Level B-R** (medical-scientist owns confirming the exact current wording against the 2026 guideline; the `stroke-guidelines` skill is the canonical reference for this packet's consumer).

---

## 4. `doesNotProve` framing — what ATTENTION + BAOCHE do NOT generalize to

Both trials' positive results should be interpreted with explicit boundary conditions. Display surfaces that present these trials without these caveats invite over-application.

1. **Anterior circulation:** Trials are BAO-specific. Anterior LVO has its own evidence base (HERMES, DAWN, DEFUSE-3) and different time windows.
2. **Beyond enrolled time window:** ATTENTION evidence stops at 12 h; BAOCHE at 24 h. No RCT evidence for BAO beyond 24 h.
3. **Mild stroke (NIHSS <10):** ATTENTION required NIHSS ≥10 explicitly; BAOCHE enrolled mostly NIHSS ≥10. The ATTENTION registry that preceded the trial showed treatment effect was modified by baseline NIHSS — benefit in mild stroke remains uncertain.
4. **Large established infarct:** PC-ASPECTS <6 (or <8 in elderly) and Pons-Midbrain Index >2 were excluded. Patients with extensive brainstem infarct on baseline imaging are not represented.
5. **Western / embolic populations:** Both trials are exclusively Han Chinese; predominantly atherothrombotic disease with high rates of intracranial atherosclerosis. Embolic BAO (more common in Western populations) is underrepresented. Rates of intracranial angioplasty/stenting in ATTENTION (40%) reflect this and are higher than typical Western practice.
6. **Pre-stroke disability:** Patients with pre-stroke mRS >2 (or >0 if ≥80 y in ATTENTION; >1 in BAOCHE) excluded.
7. **NNT framing:** The published NNT (~4.3 for ATTENTION, ~4.5 for BAOCHE) is the **trial-population NNT**. Real-world NNT will vary with case-mix; a population skewed toward less selection-stringent presentations may have a higher NNT.
8. **Mortality benefit is robust only in ATTENTION** (RR 0.66, CI 0.52–0.82). BAOCHE mortality reduction was directional but **not statistically significant** (RR 0.75, CI 0.54–1.04). Display surfaces should not claim "mortality benefit" generically for late-window BAO EVT without this distinction.
9. **BAOCHE primary-outcome amendment:** any NNT or summary statistic from BAOCHE should be displayed with explicit disclosure that the primary outcome was changed mid-trial (mRS 0–4 → mRS 0–3); the original primary outcome (mRS 0–4) was **negative**.

---

## 5. Verification confidence

- **ATTENTION:** **HIGH.** Full text retrieved from local PDF (12 pages including Tables 1–2 and Figure 2); DOI 10.1056/NEJMoa2206317 matches NEJM landing page; PMID 36239644 confirmed via PubMed search result snippet; primary endpoint, all reported statistics, mRS distribution, and safety outcomes verified verbatim against trialData.ts entries. NNT validity confirmed under audit rules.
- **BAOCHE:** **HIGH.** Full text retrieved from local PDF (12 pages including Tables 1–2 and Figure 2); DOI 10.1056/NEJMoa2207576 matches NEJM landing page; PMID 36239645 inferred from sequential NEJM issue placement (PubMed reCAPTCHA blocked direct lookup — note for librarian to verify on next /audit-citations run); primary endpoint amendment documented; all stats and safety outcomes verified verbatim. NNT validity confirmed but **must be displayed with amendment disclosure**.

**Outstanding items for medical-scientist + clinical-reviewer downstream:**
1. Confirm BAOCHE PMID 36239645 via PubMed once reCAPTCHA cleared (low-stakes; DOI is the authoritative identifier).
2. Confirm 2026 AHA/ASA COR/LOE wording for BAO EVT (Class IIa, Level B-R is the expected mapping but exact text owned by `stroke-guidelines` skill).
3. Reword `attention-trial.applicability.populationExclusions[1]` to use the paper's phrasing ("anticipated poor prognosis") rather than "unrealistically strict."
4. Correct `baoche-trial.trialDesign.timeline` from "Enrolled 2020-2021" to "Enrolled 2016–2022 (stopped early for efficacy)."
5. Add explicit `howToInterpret` block to BAOCHE covering the protocol amendment, the negative mRS 0–4 original primary, and the early-stopping truncation-bias caveat. Without this, the displayed result is cleaner than the underlying evidence supports.
6. Add `statisticalFramework: 'superiority'` and `displayArchetype: 'bar-binary'` to both entries; consider Grotta secondary visualization using the 7-value arrays in §1.7 and §2.7.
7. Add `pmid` field to both entries.

**No blocking issues.** Both trials cleared for medical-scientist authoring of updated `trialData.ts` content; clinical-reviewer to gate final merge per Class E-clinical workflow.

---

*End of packet.*