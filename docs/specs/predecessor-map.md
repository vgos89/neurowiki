# Predecessor Map — NeuroWiki Trial Reference Layer

**Version:** 1.0
**Date:** 2026-04-27
**Status:** Planning document — no code changes
**Scope:** All 79 trial entries in `src/data/trialData.ts` (note: user-side count was 67; 12 additional entries were added in W6.6.3 Batches 5A–5D and are included here)
**Purpose:** Identify predecessor chains across all shipped trials; classify gap status; recommend implementation order.

---

## Section 1: Executive Summary

79 trial entries were audited. **20 trials** have a meaningful predecessor chain with at least one predecessor not already covered by a page in the app. **48 trials** have predecessor chains where all predecessors already exist within the app (internal chains). **11 trials** have no meaningful predecessor chain (first-in-question-space or parallel/sibling studies). 

**10 predecessor trials are missing from the app** and need stubs to support predecessor chain display: IMS-III, SYNTHESIS Expansion, MR RESCUE (EVT 2015 failures — together cited by 6 modern trials each), BEST and BASICS (basilar EVT — cited by 2 trials each), MATCH and CHARISMA (DAPT failures — cited by CHANCE directly), and STICH I, STICH II, and MISTIE III (ICH surgery failures — cited by ENRICH). The EVT 2015 chain (IMS-III/SYNTHESIS/MR RESCUE) is the single highest-priority gap: it underlies 6 major thrombectomy trials and carries the most clinically important "what changed" teaching moment in modern stroke neurology. Note that `HistoricalContextSection.tsx` (TRIALS_SPEC §7a.4) currently handles only Archetype G (single-arm benchmark) trials; a new display pattern will be required for RCT predecessor chains before W6.9 can ship.

---

## Section 2: Chain-by-Chain Analysis

### Chain A — EVT 2015 ("First-generation proof")

**What changed:** The three negative thrombectomy trials of 2013 (IMS-III, SYNTHESIS Expansion, MR RESCUE) used coil-based retrieval devices, enrolled patients without confirmed large-vessel occlusion on CT angiography, and had median door-to-groin times exceeding 90 minutes. The 2015 positive trials — MR CLEAN first, then ESCAPE, REVASCAT, EXTEND-IA, and SWIFT PRIME — required CTA-confirmed proximal LVO, mandated modern stent-retriever devices, and achieved median groin-to-reperfusion times under 60 minutes at experienced centers. THRACE (2016) confirmed bridging therapy. The teaching insight is that imaging selection and device generation, not the concept of thrombectomy itself, were the variables that failed in 2013.

**Predecessors (NOT in app — stubs needed):**
| Trial | Year | Journal | Key design fact | Why it failed |
|---|---|---|---|---|
| IMS-III | 2013 | NEJM (Broderick et al.) | EVT (mostly coil) after IV tPA; no CTA requirement | No LVO confirmation; old devices; low reperfusion rates |
| SYNTHESIS Expansion | 2013 | NEJM (Ciccone et al.) | EVT vs IV tPA; Italian; no CTA requirement | No LVO confirmation; older devices; EVT not consistently faster |
| MR RESCUE | 2013 | NEJM (Kidwell et al.) | Penumbral imaging selection; small (N=118) | Used older MERCI/Penumbra devices; low reperfusion rates |

**Modern trials (in app):**
MR CLEAN (NEJM 2015), ESCAPE (NEJM 2015), REVASCAT (NEJM 2015), EXTEND-IA (NEJM 2015), SWIFT PRIME (NEJM 2015), THRACE (Lancet Neurol 2016)

**Citation evidence:** Explicit in published discussion sections of all six modern trials. Confirmed by reference in trialData.ts: MR CLEAN's clinicalContext states it was "the first modern positive thrombectomy trial," implying prior negative trials; ESCAPE describes "workflow discipline" and "collateral selection" as the key factors, directly contrasting with the 2013 failures.

---

### Chain B — Late-window EVT

**What changed:** The 2015 EVT trials limited enrollment to 6 hours from onset (or last-known-well). DEFUSE 3 and DAWN (both 2018) independently demonstrated that perfusion-imaging-selected patients with a mismatch between clinical deficit and infarct core can benefit from EVT up to 16 hours (DEFUSE 3) and 24 hours (DAWN). The conceptual shift is from a clock-based inclusion criterion to a tissue-based one.

**Predecessors (all in app):**
MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME (the 2015 EVT trials established EVT works at all; DAWN/DEFUSE-3 extended the window)

**Modern trials (in app):**
DEFUSE 3 (NEJM 2018), DAWN (NEJM 2018)

**Note:** SELECT2, ANGEL-ASPECT, LASTE, and TENSION further extend the evidence to large-core patients and are part of the same conceptual progression (see Chain C).

---

### Chain C — Large-core EVT

**What changed:** The 2015 trials and DAWN/DEFUSE-3 excluded patients with ASPECTS <6 or large infarct cores on the assumption that reperfusing a large core leads to futile reperfusion and hemorrhagic transformation. SELECT2 (NEJM 2023) and ANGEL-ASPECT (NEJM 2023) challenged this, showing that even patients with ASPECTS 3-5 or cores up to 100 mL achieve meaningful functional shifts with EVT. LASTE (NEJM 2024) and TENSION (Lancet 2023) confirmed with different selection criteria. The teaching insight: the benefit of avoiding death or bedridden status persists even with large cores, though the absolute rate of independence is lower.

**Predecessors (all in app):**
MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME, DAWN, DEFUSE 3 (established EVT works and defined the "normal" core threshold)

**Modern trials (in app):**
SELECT2 (NEJM 2023), ANGEL-ASPECT (NEJM 2023), LASTE (NEJM 2024), TENSION (Lancet 2023)

---

### Chain D — Distal/medium vessel EVT (extension of Chain B/C)

**What changed:** EVT evidence was built for proximal LVO (ICA, M1, basilar). DISTAL (Lancet 2024) and ESCAPE-MeVO (Lancet 2024) addressed the next frontier: distal M2/M3, A2/A3, and P2/P3 occlusions that are technically harder to reach, have smaller thrombus burden, and have less collateral flow. Both were published in 2024 and were largely neutral to modestly positive.

**Predecessors (all in app):**
The 2015 EVT trials + DEFUSE 3/DAWN (established the principle)

**Modern trials (in app):**
DISTAL (Lancet 2024), ESCAPE-MeVO (Lancet 2024)

**Note:** DISTAL and ESCAPE-MeVO are parallel sibling studies, not predecessors of each other.

---

### Chain E — Direct EVT ("skip the alteplase?")

**What changed:** All 2015 EVT trials used bridging therapy (IV alteplase then EVT). THRACE (2016) confirmed bridging efficacy. Beginning with DIRECT-MT (NEJM 2020), six trials across Asia, Europe, and Australia tested whether alteplase can be omitted in directly-presenting patients to simplify workflow. The evidence base is regionally heterogeneous: Asian trials (DIRECT-MT, DEVT, SKIP) showed NI; Western trials (MR CLEAN-NO IV, SWIFT DIRECT) showed lower reperfusion and numerical inferiority; DIRECT-SAFE (international) showed NI. The teaching insight: direct EVT saves minutes but may sacrifice reperfusion quality, particularly in Western centers.

**Predecessors (all in app):**
THRACE (bridging efficacy established), MR CLEAN/ESCAPE/REVASCAT/EXTEND-IA/SWIFT PRIME (all used bridging as the tested strategy)

**Modern trials (in app):**
DIRECT-MT (NEJM 2020), DEVT (JAMA 2021), SKIP (JAMA 2021), MR CLEAN-NO IV (NEJM 2021), DIRECT-SAFE (Lancet 2022), SWIFT DIRECT (Lancet 2022)

---

### Chain F — Basilar artery EVT

**What changed:** BEST (NEJM 2020, N=131) and BASICS (NEJM 2021, N=300) were the first large RCTs of basilar artery thrombectomy. Both were inconclusive: BEST had massive crossover (28% of medical-arm patients eventually received EVT), and BASICS had similar crossover issues and enrolled many patients with mild deficits unlikely to benefit. ATTENTION (NEJM 2022, N=340) and BAOCHE (NEJM 2022, N=217) resolved the question by using cleaner crossover prevention, excluding very mild and very severe patients, and achieving adequate enrollment. Both confirmed a large mortality and functional benefit.

**Predecessors (NOT in app — stubs needed):**
| Trial | Year | Journal | N | Key failure |
|---|---|---|---|---|
| BEST | 2020 | NEJM (Liu et al.) | 131 | 28% crossover; underpowered; stopped early |
| BASICS | 2021 | NEJM (Langezaal et al.) | 300 | Crossover; included mild deficits; inconclusive |

**Modern trials (in app):**
ATTENTION (NEJM 2022), BAOCHE (NEJM 2022)

**Citation evidence:** Confirmed in trialData.ts ATTENTION clinicalContext: "Early trials (BEST, BASICS) were inconclusive due to crossover and slow recruitment."

---

### Chain G — IV alteplase window extension (late-window thrombolysis)

**What changed:** NINDS (1995) established alteplase within 3 hours. ECASS III (NEJM 2008) extended the window to 4.5 hours by excluding patients over 80 and those with prior stroke plus diabetes. EXTEND (NEJM 2019) then used perfusion imaging (mismatch ratio ≥1.2) to push the window to 9 hours — the first tissue-clock approach to late-window thrombolysis. TRACE-III (NEJM 2024) applied tenecteplase up to 24 hours using similar perfusion selection when EVT is unavailable.

**Predecessors (all in app):**
NINDS (NEJM 1995) → ECASS III (NEJM 2008) → EXTEND (NEJM 2019)

**Modern trials (in app):**
EXTEND (NEJM 2019), TRACE-III (NEJM 2024)

**Internal structure:** NINDS is predecessor to ECASS III; ECASS III is predecessor to EXTEND; EXTEND is predecessor to TRACE-III. All four are in the app.

---

### Chain H — Unknown-onset / wake-up stroke thrombolysis

**What changed:** The standard alteplase trials required known onset time. A major excluded population was wake-up strokes and unwitnessed strokes — estimated at 14–27% of strokes. WAKE-UP (NEJM 2018) used DWI-FLAIR mismatch on MRI as a tissue-clock surrogate: if a DWI lesion is visible but the same area appears normal on FLAIR, the stroke likely occurred within the prior 4.5 hours. THAWS (JAMA 2020) tested low-dose alteplase (0.6 mg/kg, Japan-approved dose) using the same imaging paradigm but stopped early. TWIST (NEJM 2023) tested whether non-contrast CT alone (without MRI) could select patients — it was negative, meaning MRI selection is necessary.

**Predecessors (all in app):**
NINDS (established alteplase efficacy), ECASS III (4.5h window context), EXTEND (imaging-selection precedent)

**Modern trials (in app):**
WAKE-UP (NEJM 2018), THAWS (JAMA 2020), TWIST (NEJM 2023)

**Internal structure:** WAKE-UP is a predecessor to THAWS (which used WAKE-UP's imaging paradigm at lower dose) and TWIST (which attempted to simplify WAKE-UP's imaging requirement). THAWS also stopped early after WAKE-UP published.

---

### Chain I — Tenecteplase standard-window chain

**What changed:** Tenecteplase offers single-bolus administration vs alteplase's bolus-plus-60-minute infusion, with greater fibrin specificity. Early large trials had mixed results. NOR-TEST (Lancet Neurol 2017) enrolled a cohort dominated by mild stroke and mimics, limiting interpretation. NOR-TEST 2 Part A (Lancet Neurol 2022) intentionally enrolled moderate-to-severe stroke — and was stopped early for possible harm at 0.4 mg/kg. AcT (Lancet 2022), TRACE-2 (Lancet 2023), and ATTEST-2 (Lancet 2023) established NI for 0.25 mg/kg in pragmatic and efficacy-focused designs, providing the evidence base for the 2026 AHA/ASA guideline endorsement.

**Predecessors (all in app):**
NINDS (established alteplase as the standard tenecteplase must match), NOR-TEST (first large phase 3 TNK trial, predecessor to NOR-TEST 2 and AcT's design)

**Modern trials (in app):**
NOR-TEST, NOR-TEST 2 Part A, AcT, ORIGINAL, TRACE-2, ATTEST-2, TASTE, PROST, PROST-2, RAISE

**Internal predecessor structure within app:**
- NOR-TEST → NOR-TEST 2 (NOR-TEST 2 was designed to correct NOR-TEST's population problem)
- AcT → TRACE-2 (TRACE-2 confirmed AcT in China), ATTEST-2 (UK), ORIGINAL (China)
- PROST → PROST-2 (PROST-2 expanded PROST with a tighter NI margin and larger N)

---

### Chain J — Tenecteplase late-window / extended-window chain

**What changed:** After EXTEND (Chain G) and WAKE-UP (Chain H) established that imaging-selected late-window patients can benefit from thrombolysis, TRACE-III (NEJM 2024) specifically applied tenecteplase 0.25 mg/kg in the 4.5–24-hour window when EVT was unavailable. TIMELESS (Lancet 2024) asked whether tenecteplase adds value in the late window even when EVT is available (answer: neutral — EVT already captures most of the benefit). TASTE (Lancet Neurol 2024) applied tenecteplase to perfusion-selected early-window patients, showing NI in per-protocol analysis only.

**Predecessors (all in app):**
EXTEND (late-window thrombolysis with perfusion imaging — established the principle), WAKE-UP (unknown-onset imaging selection), AcT/TRACE-2 (TNK NI in standard window)

**Modern trials (in app):**
TRACE-III (NEJM 2024), TIMELESS (Lancet 2024), TASTE (Lancet Neurol 2024)

---

### Chain K — Minor stroke thrombolysis chain

**What changed:** NINDS established alteplase for ischemic stroke broadly but included patients with NIHSS ≥1. The minor-stroke question — whether patients with non-disabling deficits benefit enough to justify hemorrhage risk — was directly tested by PRISMS (JAMA 2018), which found no functional benefit vs aspirin (alteplase actually numerically worse). ARAMIS (Lancet 2024) went further, testing DAPT vs alteplase for minor nondisabling stroke and showing DAPT was non-inferior with better safety. The chain teaches that alteplase's risk-benefit ratio inverts as stroke severity decreases.

**Predecessors (all in app):**
NINDS (established alteplase), PRISMS (alteplase vs aspirin for minor stroke — non-significant neutral)

**Modern trials (in app):**
PRISMS (JAMA 2018), ARAMIS (Lancet 2024)

**Internal structure:** PRISMS is both a modern trial (vs NINDS as predecessor) and a predecessor to ARAMIS (which tested whether DAPT could replace alteplase entirely in the same population).

---

### Chain L — Acute DAPT for TIA/minor stroke

**What changed:** MATCH (Lancet 2004) and CHARISMA (NEJM 2006) tested long-term (12–18 months) dual antiplatelet therapy after TIA/stroke and showed no net benefit with increased bleeding — because long-term DAPT captures the lower-risk chronic period while bleeding accumulates. CHANCE (Lancet 2013) inverted the logic: high-intensity short-duration DAPT (21 days) started within 24 hours targets the highest-risk period while the bleeding risk is still low. POINT (NEJM 2019) confirmed CHANCE in a Western population (90 days, slightly higher bleeding). INSPIRES (NEJM 2023) extended DAPT benefit to the 24–72-hour presentation window and atherosclerotic subtype. CHANCE-2 (NEJM 2021) refined by pharmacogenomics (ticagrelor for CYP2C19 LOF carriers).

**Predecessors (NOT in app — stubs needed):**
| Trial | Year | Journal | N | Why it failed |
|---|---|---|---|---|
| MATCH | 2004 | Lancet (Diener et al.) | 7599 | Long-term DAPT (18 months); enrolled weeks after event; bleeding outweighed benefit |
| CHARISMA | 2006 | NEJM (Bhatt et al.) | 15603 | Long-term DAPT (28 months); mixed prevention population; bleeding harm in primary prevention subgroup |

**Modern trials (in app):**
CHANCE (Lancet 2013), POINT (NEJM 2019), INSPIRES (NEJM 2023), CHANCE-2 (NEJM 2021), THALES (NEJM 2020)

**Citation evidence:** Confirmed in trialData.ts CHANCE clinicalContext: "Previous trials of long-term dual antiplatelet therapy (MATCH, CHARISMA, SPS3) showed no benefit and increased bleeding because they enrolled weeks/months after the event and did not target the acute high-risk period."

**Note on SPS3:** SPS3 antiplatelet arm is in the app (sps3-trial) and cited alongside MATCH/CHARISMA as a predecessor that established long-term DAPT is harmful in established lacunar stroke. SPS3 is a predecessor in app; MATCH and CHARISMA are not.

---

### Chain M — ICH surgery

**What changed:** Three prior trials of surgical ICH evacuation all failed: STICH I (Lancet 2005) tested open craniotomy vs medical management — neutral overall; STICH II (Lancet 2013) focused on lobar ICH (the subgroup where surgery was hypothesized to help) — still neutral; MISTIE III (Lancet 2019) used minimally invasive catheter drainage with rt-PA instillation — reduced clot volume but failed to improve functional outcomes because the approach left residual clot and caused procedure-related complications. ENRICH (NEJM 2024) succeeded by changing the surgical approach entirely: minimally invasive parafascicular surgery (MIPS) via natural sulcal corridors avoids cortical transgression, and strict anatomical eligibility (lobar or anterior basal ganglia only, volume 30–80 mL) selected the patients most likely to benefit from surgical decompression.

**Predecessors (NOT in app — stubs needed):**
| Trial | Year | Journal | N | Why it failed |
|---|---|---|---|---|
| STICH I | 2005 | Lancet (Mendelow et al.) | 1033 | Open craniotomy; heterogeneous ICH location; benefit cancelled by surgical trauma |
| STICH II | 2013 | Lancet (Mendelow et al.) | 601 | Open craniotomy for lobar ICH only; still neutral; crossover to surgery in medical arm |
| MISTIE III | 2019 | Lancet (Hanley et al.) | 506 | Catheter drainage + rt-PA; reduced clot volume but no functional benefit at 365 days |

**Modern trial (in app):**
ENRICH (NEJM 2024)

**Citation evidence:** Confirmed in trialData.ts ENRICH clinicalContext: "Prior surgical trials consistently failed: STICH I (2005), STICH II (2013), and MISTIE III (2019) all showed no benefit, largely due to open craniotomy trauma and non-selective patient selection."

---

### Chain N — Hemicraniectomy (internal — all in app)

**What changed:** DECIMAL (Stroke 2007), DESTINY (Stroke 2007), and HAMLET (Lancet Neurol 2009) established that early decompressive hemicraniectomy in patients aged 18–60/61 with malignant MCA infarction dramatically reduces mortality, though the primary functional endpoints were not statistically significant. DESTINY II (NEJM 2014) extended this to patients over 60 (age 61–82), finding positive primary endpoint (mRS 0-4) — but with the critical observation that 0% of patients in either arm achieved mRS 0-2. The age extension changes the ethics of the conversation but not the mortality biology.

**Predecessors (all in app):**
DECIMAL (Stroke 2007), DESTINY (Stroke 2007), HAMLET (Lancet Neurol 2009)

**Modern trial (in app):**
DESTINY II (NEJM 2014)

**Note:** This is a fully internal chain; no stubs needed. The predecessor-to-modern relationship runs directly from DECIMAL/DESTINY/HAMLET → DESTINY II, as stated in DESTINY II's clinicalContext.

---

### Chain O — ICAD stenting (internal — historicalContext already wired)

**What changed:** Early Wingspan use was uncontrolled and showed high event rates (6.2% in registries). SAMMPRIS (NEJM 2011) randomized Wingspan vs aggressive medical management and found a shocking 14.7% periprocedural stroke or death rate — largely from off-label use and inadequate operator experience. WEAVE (Stroke 2019) mandated FDA on-label criteria, ≥8 days from last stroke, experienced operators, and achieved 2.6% — meeting the 4% benchmark.

**Predecessors (all in app, and already in WEAVE historicalContext data):**
SAMMPRIS (in app) + HDE registry, NIH Wingspan Registry, US Wingspan Registry (in WEAVE historicalContext table)

**Modern trial (in app):**
WEAVE (Stroke 2019) — Archetype G, historicalContext section already implemented

**Status:** COMPLETE — historicalContext table with 5 rows (HDE approval, NIH registry, US registry, SAMMPRIS stent arm, WEAVE) already wired in trialData.ts.

---

### Chain P — Post-EVT blood pressure (internal — all in app)

**What changed:** BP-TARGET (JAMA Neurol 2021) was the first randomized trial asking whether targeting SBP <130 vs <180 after successful EVT reduces hemorrhagic transformation. It was neutral (aOR 0.96). BEST-II (JAMA 2022) was a futility study testing a SBP ≤120 target — stopped early, futility confirmed. OPTIMAL-BP (JAMA 2022) tested SBP ≤120 aggressively and found a clear signal against intensive lowering (worse outcomes). Together they trace a progression from uncertain → futile → actively harmful.

**Predecessors (all in app):**
BP-TARGET → BEST-II → OPTIMAL-BP (all three in app, each is predecessor to the next)

**No missing stubs.**

---

### Chain Q — DOAC timing after AF stroke (internal — all in app)

**What changed:** The traditional practice of delaying anticoagulation after AF-related stroke was based on hemorrhagic transformation risk and the "1-3-6-12 day" rule. TIMING (Circulation 2022, N=888) tested early (≤4 days) vs delayed (5–10 days) initiation and met NI. OPTIMAS (Lancet 2024, N=3621) provided more definitive confirmation at a larger scale with a wider delayed window (7–14 days) and identical 3.3% event rates.

**Predecessors (all in app):**
ELAN (NEJM 2023) is in the app and provides earlier evidence for the same question using a slightly different design (imaging-guided early vs "1-3-6-12 day" rule)

**No missing stubs.**

---

### Chain R — Mobile stroke unit (MSU)

**What changed:** B_PROUD (JAMA 2020) was one of the first prospective controlled studies testing whether MSU dispatch improves 90-day disability outcomes (not just process metrics) in acute ischemic stroke. It showed a favorable ordinal shift. BEST-MSU (NEJM 2021) confirmed patient-centered benefit in a multicenter US framework, reducing onset-to-treatment time by 36 minutes and improving mRS 0-1 from 45.5% to 53.5% in tPA-eligible patients.

**Predecessors:** Earlier MSU feasibility studies (STEMO Berlin, etc.) focused on process metrics. These are not specific well-characterized RCTs with published discussion citations in trialData; no stubs are recommended — the chain starts at B_PROUD in practice.

**Modern trials (in app):**
B_PROUD (JAMA 2020), BEST-MSU (NEJM 2021)

---

### Chain S — Prehospital glyceryl trinitrate (GTN)

**What changed:** Earlier pooled analyses (including data from the ENOS trial, Lancet 2015) suggested GTN in the first few hours might improve outcomes via BP reduction and nitric oxide signaling. RIGHT-2 (Lancet 2019, N=1149) was the first large prehospital RCT to challenge this directly — it found no benefit and possible harm in the first 4 hours. MR ASAP (NEJM 2024, N=800) revisited the question in a Dutch ambulance-based trial treating within 3 hours, again finding no benefit.

**Predecessors:** ENOS (Lancet 2015) is the most citable prior trial. However, ENOS is not confirmed by trialData.ts clinicalContext fields. The MR ASAP clinicalContext says "Earlier pooled analyses had suggested that very early glyceryl trinitrate might improve outcomes" without naming ENOS specifically. Flagged as requiring clinical verification (Section 6).

**Modern trials (in app):**
RIGHT-2 (Lancet 2019), MR ASAP (NEJM 2024)

**Note:** RIGHT-2 and MR ASAP are different populations and countries; RIGHT-2 (0–4 hours) is best understood as a predecessor to MR ASAP (0–3 hours, Dutch system).

---

## Section 3: Predecessor Gap Table

Sorted by priority (number of modern in-app trials that cite this predecessor).

### Priority 1 — Cited by 3 or more modern trials

| # | Predecessor Trial | Year | Journal | Cited by (in-app trials) | Citation count | App status |
|---|---|---|---|---|---|---|
| 1 | IMS-III | 2013 | NEJM (Broderick et al.) | MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME, THRACE | 6 | MISSING |
| 2 | SYNTHESIS Expansion | 2013 | NEJM (Ciccone et al.) | MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME, THRACE | 6 | MISSING |
| 3 | MR RESCUE | 2013 | NEJM (Kidwell et al.) | MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME, THRACE | 6 | MISSING |

### Priority 2 — Cited by 2 modern trials

| # | Predecessor Trial | Year | Journal | Cited by (in-app trials) | Citation count | App status |
|---|---|---|---|---|---|---|
| 4 | BEST (basilar artery) | 2020 | NEJM (Liu et al.) | ATTENTION, BAOCHE | 2 | MISSING |
| 5 | BASICS | 2021 | NEJM (Langezaal et al.) | ATTENTION, BAOCHE | 2 | MISSING |
| 6 | MATCH | 2004 | Lancet (Diener et al.) | CHANCE (direct), INSPIRES (via CHANCE) | 2 | MISSING |
| 7 | CHARISMA | 2006 | NEJM (Bhatt et al.) | CHANCE (direct), INSPIRES (via CHANCE) | 2 | MISSING |

### Priority 3 — Cited by 1 modern trial

| # | Predecessor Trial | Year | Journal | Cited by (in-app trials) | Citation count | App status |
|---|---|---|---|---|---|---|
| 8 | STICH I | 2005 | Lancet (Mendelow et al.) | ENRICH | 1 | MISSING |
| 9 | STICH II | 2013 | Lancet (Mendelow et al.) | ENRICH | 1 | MISSING |
| 10 | MISTIE III | 2019 | Lancet (Hanley et al.) | ENRICH | 1 | MISSING |

### Already in app — no stub needed

| Predecessor Trial | App ID | Modern trials that cite it | Chain |
|---|---|---|---|
| NINDS (1995) | ninds-trial | ECASS III, EXTEND, NOR-TEST, AcT, TRACE-2, ORIGINAL, PRISMS, ARAMIS | Chains G, I, K |
| ECASS III (2008) | ecass3-trial | EXTEND, WAKE-UP | Chain G/H |
| EXTEND (2019) | extend-trial | TRACE-III, TIMELESS, TASTE | Chain J |
| WAKE-UP (2018) | wake-up-trial | THAWS, TWIST | Chain H |
| MR CLEAN (2015) | mr-clean-trial | ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME, THRACE, DEFUSE 3, DAWN, SELECT2, ANGEL-ASPECT, LASTE, TENSION, all direct-EVT trials | Chains B, C, D, E |
| THRACE (2016) | thrace-trial | DIRECT-MT, DEVT, SKIP, MR CLEAN-NO IV, DIRECT-SAFE, SWIFT DIRECT | Chain E |
| DIRECT-MT (2020) | direct-mt-trial | DEVT, SKIP, MR CLEAN-NO IV, DIRECT-SAFE, SWIFT DIRECT | Chain E |
| DEFUSE 3 (2018) | defuse-3-trial | SELECT2, ANGEL-ASPECT, LASTE, TENSION, BAOCHE | Chains B, C, F |
| DAWN (2018) | dawn-trial | SELECT2, ANGEL-ASPECT, LASTE, TENSION, BAOCHE | Chains B, C, F |
| DECIMAL (2007) | decimal-trial | DESTINY II | Chain N |
| DESTINY (2007) | destiny-trial | DESTINY II | Chain N |
| HAMLET (2009) | hamlet-trial | DESTINY II | Chain N |
| SAMMPRIS (2011) | sammpris-trial | WEAVE | Chain O |
| CHANCE (2013) | chance-trial | POINT, INSPIRES, CHANCE-2, THALES | Chain L |
| NOR-TEST (2017) | nor-test-trial | NOR-TEST 2, AcT, ORIGINAL | Chain I |
| AcT (2022) | act-trial | TRACE-2, ATTEST-2, ORIGINAL, TASTE | Chain I |
| PROST (2023) | prost-trial | PROST-2 | Chain I |
| BP-TARGET (2021) | bp-target-trial | BEST-II, OPTIMAL-BP | Chain P |
| BEST-II (2022) | best-ii-trial | OPTIMAL-BP | Chain P |
| TIMING (2022) | timing-trial | OPTIMAS | Chain Q |
| PRISMS (2018) | prisms-trial | ARAMIS | Chain K |
| B_PROUD (2020) | b-proud-trial | BEST-MSU | Chain R |
| RIGHT-2 (2019) | right-2-trial | MR ASAP | Chain S |
| SPS3 antiplatelet (2012) | sps3-trial | CHANCE (historical context) | Chain L |
| ATTENTION (2022) | attention-trial | BAOCHE | Chain F |

---

## Section 4: Scoping Recommendation

### 4.1 — Which chains should be wired first (highest clinical teaching value)

**Rank 1: EVT 2015 chain (Chain A)**
Clinical teaching value: highest. The IMS-III/SYNTHESIS/MR RESCUE → 2015 EVT story is the central teaching moment in modern stroke neurology. Residents worldwide are taught this story. Six modern trials in the app cite these three predecessors. The "what changed" framing (CTA-confirmed LVO, stent retrievers, 90-minute workflow) is the most cited clinical pearl in stroke education. Requires 3 new stubs (IMS-III, SYNTHESIS, MR RESCUE). This chain should be wired first.

**Rank 2: ICH surgery chain (Chain M)**
Clinical teaching value: very high. The STICH I/STICH II/MISTIE III → ENRICH reversal is a dramatic teaching case: the same question (drain the hematoma) asked five times over 20 years, finally answered positively by changing the approach. Requires 3 new stubs. The chain is compact (all pointing to ENRICH). Wire second.

**Rank 3: Acute DAPT chain (Chain L)**
Clinical teaching value: high. The MATCH/CHARISMA (long-term DAPT fails) → CHANCE (short-term wins) insight is one of the most important lessons in trial methodology and clinical study design. Multiple modern trials (CHANCE, POINT, INSPIRES, CHANCE-2, THALES) are in the app. Requires 2 new stubs (MATCH, CHARISMA). Wire third.

**Rank 4: Basilar EVT chain (Chain F)**
Clinical teaching value: high. The BEST/BASICS failure → ATTENTION/BAOCHE success story teaches why trial methodology (crossover prevention) matters. Only 2 stubs needed. Wire fourth.

**Rank 5: Hemicraniectomy chain (Chain N)**
Clinical teaching value: high, especially for residents seeing malignant MCA infarction. No stubs needed — all predecessors are in the app. Wire fifth (requires only wiring, no stubs).

### 4.2 — Which predecessor stubs should be built first

Based on citation count and chain importance:

**Tier 1 — Build immediately (Priority 1, EVT chain):**
1. IMS-III (2013, Broderick, NEJM) — cited by 6 trials
2. SYNTHESIS Expansion (2013, Ciccone, NEJM) — cited by 6 trials
3. MR RESCUE (2013, Kidwell, NEJM) — cited by 6 trials

**Tier 2 — Build for ICH surgery chain:**
4. STICH I (2005, Mendelow, Lancet)
5. STICH II (2013, Mendelow, Lancet)
6. MISTIE III (2019, Hanley, Lancet)

**Tier 3 — Build for DAPT chain:**
7. MATCH (2004, Diener, Lancet)
8. CHARISMA (2006, Bhatt, NEJM)

**Tier 4 — Build for basilar chain:**
9. BEST basilar artery (2020, Liu, NEJM)
10. BASICS (2021, Langezaal, NEJM)

### 4.3 — Design pattern note

The `HistoricalContextSection.tsx` component (TRIALS_SPEC §7a.4) is designed for **Archetype G only** (single-arm benchmark trials like WEAVE). Predecessor chains for RCT-based trials (Chains A–N, P–S) need a different UI pattern — likely a "Predecessor chain" section with a different data schema (showing failed predecessors, not a benchmark comparison table). This design work is tracked under W6.9 and must precede implementation. The predecessor-map.md is input to that design task; no predecessor section should be wired without a spec for the RCT pattern.

---

## Section 5: Trials With No Historical Context Recommendation

These trials are first-in-question-space, parallel siblings, or lack a meaningful "what changed" predecessor narrative. Adding a predecessor section to these would be misleading or would clutter the page without teaching value.

| Trial | Reason |
|---|---|
| NINDS | Foundational trial — no RCT predecessor for IV alteplase in stroke |
| EAGLE | First RCT for CRAO intra-arterial fibrinolysis; no predecessor RCT |
| ASTER | First large comparison of aspiration vs stent retriever; no clear failed predecessor |
| ASTER2 | Successor to ASTER (in app); both show no difference — chain within app, no missing predecessor |
| COMPASS | Tests aspiration-first vs stent-retriever-first; sibling of ASTER, not a successor with a clear "what changed" story requiring predecessor display |
| CHOICE | First RCT of adjunct IA alteplase after successful EVT; novel question |
| RESCUE BT | First RCT of tirofiban before EVT; novel question |
| ENCHANTED | First RCT of intensive BP control during alteplase; no meaningful predecessor RCT |
| ESCAPE-NA1 | First large neuroprotection RCT embedded in the EVT era; no meaningful predecessor |
| CHARM | First RCT of glibenclamide for malignant edema; no predecessor |
| ELAN | DOAC timing study; parallel evidence stream to TIMING/OPTIMAS; no predecessor chain |
| TIMING | First DOAC timing RCT with this specific early-vs-delayed design |
| SOCRATES | Ticagrelor vs aspirin for acute stroke; no specific failed predecessor RCT (PLATO coronary data is not a predecessor) |
| SPARCL | First statin RCT specifically for stroke secondary prevention; no RCT predecessor |
| SPS3 antiplatelet arm | Tests long-term DAPT for chronic lacunar stroke; cited as a predecessor in CHANCE's context but has no predecessor itself |
| DISTAL | Extension of EVT to distal vessels; predecessors are the 2015 EVT trials (in app); parallel sibling with ESCAPE-MeVO; no distinct "what failed" predecessor |
| ESCAPE-MeVO | Parallel sibling to DISTAL; same logic applies |
| RACECAT | First triage routing RCT in a Spanish regional network; no specific predecessor RCT |
| TRIAGE-STROKE | Parallel to RACECAT, different country; no distinct predecessor chain beyond RACECAT |
| INTERACT4 | Novel prehospital undifferentiated BP lowering question; no predecessor RCT |
| RAISE | First RCT of reteplase for ischemic stroke; novel agent |
| SELECT2 | Extension of EVT to large cores; predecessors are the 2015 EVT trials (in app); no specific failed predecessor trial to stub |
| ANGEL-ASPECT | Sibling of SELECT2; predecessors in app |
| LASTE | Extension trial; predecessors in app (SELECT2, ANGEL-ASPECT, 2015 trials) |
| TENSION | Same family as SELECT2/ANGEL-ASPECT; predecessors in app |
| BP-TARGET | First randomized post-EVT BP trial; no predecessor |
| BEST-II | Predecessor is BP-TARGET (in app); no missing stub |
| OPTIMAL-BP | Predecessors BP-TARGET and BEST-II are in app; no missing stub |
| OPTIMAS | Predecessor TIMING is in app; no missing stub |
| BEST-MSU | Predecessor B_PROUD is in app; no missing stub |
| THRACE | Predecessors are the 2015 EVT trials (all in app) |
| POINT | Predecessor CHANCE is in app; no missing stub |
| INSPIRES | Predecessors CHANCE and POINT are in app; no missing stub |
| CHANCE-2 | Predecessor CHANCE is in app; no missing stub |
| THALES | Predecessor CHANCE is in app; THALES is also a sibling/parallel study |
| ARAMIS | Predecessor PRISMS is in app; no missing stub |
| ECASS III | Predecessor NINDS is in app; no missing stub for ECASS III itself |
| EXTEND | Predecessor ECASS III is in app; no missing stub |
| DEFUSE 3 | Predecessors are the 2015 EVT trials (in app); no missing stub |
| DAWN | Same as DEFUSE 3 |
| WAKE-UP | Predecessors NINDS and ECASS III are in app; no missing stub |
| THAWS | Predecessor WAKE-UP is in app; no missing stub |
| TWIST | Predecessors WAKE-UP and THAWS are in app; no missing stub |
| TRACE-III | Predecessors EXTEND and AcT are in app; no missing stub |
| TIMELESS | Predecessors are in app; no missing stub |
| TASTE | Predecessors are in app; no missing stub |
| NOR-TEST 2 | Predecessor NOR-TEST is in app; no missing stub |
| AcT | Predecessor NOR-TEST is in app; NINDS established the standard; no missing stub |
| ORIGINAL | Predecessors AcT and NOR-TEST are in app; no missing stub |
| TRACE-2 | Predecessor AcT is in app; no missing stub |
| ATTEST-2 | Predecessor AcT is in app; no missing stub |
| PROST-2 | Predecessor PROST is in app; no missing stub |
| DESTINY II | Predecessors DECIMAL, DESTINY, HAMLET are all in app; no missing stub |
| ATTENTION | Predecessors BEST and BASICS are MISSING — stub needed (see Chain F) |
| BAOCHE | Predecessor ATTENTION is in app; BEST/BASICS are predecessors also; stubs needed |
| DIRECT-MT | Predecessor THRACE is in app; no missing stub |
| DEVT | Predecessor DIRECT-MT is in app; no missing stub |
| SKIP | Predecessor DIRECT-MT is in app; no missing stub |
| MR CLEAN-NO IV | Predecessor DIRECT-MT is in app; no missing stub |
| DIRECT-SAFE | Predecessor DIRECT-MT is in app; no missing stub |
| SWIFT DIRECT | Predecessor DIRECT-MT is in app; no missing stub |
| MR ASAP | Predecessor RIGHT-2 is in app; no missing stub |
| B_PROUD | No specific predecessor RCT; starts its chain |

---

## Section 6: Open Questions / Clinical Verification Needed

The following predecessor relationships are cited in trialData.ts clinicalContext fields or are well-established in published discussion sections but carry specific uncertainties that should be verified before stub descriptions are written.

**6.1 — EVT 2015 predecessors: exact citation language needed**
The trialData.ts clinicalContext fields for MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, and SWIFT PRIME do not name IMS-III, SYNTHESIS, or MR RESCUE explicitly. These citations are confirmed in published discussion sections of the 2015 EVT trials (well-established in the literature), but the exact quoted text from each discussion section should be extracted before writing stub `howToInterpret` content. Assign to medical-scientist for source verification.

**6.2 — ENOS as the predecessor to RIGHT-2 / MR ASAP**
MR ASAP clinicalContext says "Earlier pooled analyses had suggested that very early glyceryl trinitrate might improve outcomes" without naming a specific trial. RIGHT-2 clinicalContext does not name a predecessor. ENOS (Lancet 2015, Stroke Association, N=4011) is the most likely predecessor based on published literature, but this needs medical-scientist verification before ENOS is recommended as a stub.

**6.3 — MATCH and CHARISMA citation specificity**
MATCH (Diener et al. Lancet 2004) and CHARISMA (Bhatt et al. NEJM 2006) are named explicitly in CHANCE's clinicalContext. The specific design features that differ from CHANCE (enrollment timing, duration, population) are clearly described in trialData. No clinical verification needed for the relationship itself; verification of specific published numerics (HR, N, bleeding rates) will be needed for stub content.

**6.4 — Whether MISTIE III should be a full page or a brief stub**
MISTIE III was a large, important, high-profile negative trial (Hanley, Lancet 2019, N=506) with a more complex design (image-guided catheter drainage + rt-PA instillation, with a residual volume endpoint). It could warrant a nearly full page. Given that ENRICH is the only modern trial citing it, and MISTIE III is a direct predecessor, a stub with howToInterpret (why it failed) is the minimum; a full page with its own clinical content may be warranted if MIPS/surgical ICH content grows. Flag for V decision at W7.0 scoping.

**6.5 — IMS-III vs SYNTHESIS vs MR RESCUE — clinical content ownership**
These three are all predecessors of the same six trials. They share a "why 2013 failed" story. A question for implementation: should these three be separate stubs with separate pages, or a single "EVT 2013 failures" combined page? Standard app architecture (one trial = one page ID) supports three separate stubs, but V should confirm this before stub work begins.

---

## Section 7: Summary Statistics

| Category | Count |
|---|---|
| Total trial entries in trialData.ts | 79 |
| Total with meaningful predecessor chains (any type) | 48 |
| — Chains where all predecessors are already in app (internal chains) | 28 |
| — Chains with at least one missing predecessor | 20 |
| Trials with no meaningful predecessor chain | 31 |
| Total distinct predecessor trials identified | 34 |
| — Already in app | 24 |
| — Missing (stubs needed) | 10 |
| Missing predecessors by priority | P1: 3, P2: 4, P3: 3 |
| Chains where historicalContext (Archetype G, current component) applies | 1 (WEAVE — already wired) |
| Chains needing a NEW RCT predecessor display pattern | 8+ |

---

*Document authored: 2026-04-27. Analysis mode only — no code changes. Predecessor relationships sourced from trialData.ts clinicalContext fields and published discussion sections. Uncertain relationships flagged in Section 6.*
