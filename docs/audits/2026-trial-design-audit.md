# Trial Design Audit — 2026-05-06

> **Scope:** Complete inventory of all trials in `src/data/trialData.ts`, classified by rendering pattern in `src/pages/trials/TrialPageNew.tsx`. Read-only — no code changes.

---

## 1. Summary Table

| Design Pattern | Count | Description |
|---|---|---|
| **modern-A** | 45 | DeltaBandChart — binary/rate outcome visualization |
| **modern-B** | 19 | GrottaBarChart + ordinalStats — mRS ordinal distribution |
| **modern-G** | 1 | BenchmarkThresholdChart + HistoricalContextSection — single-arm registry |
| **modern-stub** | 10 | renderStubPage helper — minimal content, full rebuild deferred |
| **legacy** | 14 | No explicit branch — falls through to stats-cards + progress-bars fallback |
| **TOTAL** | **89** | |

**Key structural observation:** TrialPageNew.tsx dispatches on individual `if (trialId === '...')` branches, not on the `archetypeId` field in trialData.ts. The archetypeId field records the *intended* archetype for a trial but does not drive rendering. Trials without an explicit JSX branch fall through to the legacy layout at line 6708.

---

## 2. Modern-Design Trials

### 2a. Archetype A — DeltaBandChart (45 trials)

**Group 1: archetypeId 'A' present in trialData.ts + explicit branch (23 trials)**

| Trial ID | Title | Category |
|---|---|---|
| extend-ia-trial | EXTEND-IA | Thrombectomy |
| thrace-trial | THRACE | Thrombectomy |
| direct-mt-trial | DIRECT-MT | Thrombectomy (direct vs bridging) |
| devt-trial | DEVT | Thrombectomy (direct vs bridging) |
| skip-trial | SKIP | Thrombectomy (direct vs bridging) |
| direct-safe-trial | DIRECT-SAFE | Thrombectomy (direct vs bridging) |
| swift-direct-trial | SWIFT DIRECT | Thrombectomy (direct vs bridging) |
| compass-trial | COMPASS | Thrombectomy (direct vs bridging) |
| aster-trial | ASTER | Thrombectomy (aspiration vs stent-retriever) |
| aster2-trial | ASTER 2 | Thrombectomy (aspiration vs stent-retriever) |
| choice-trial | CHOICE | Adjunct IA alteplase post-EVT |
| best-ii-trial | BEST-II | Neuroprotection (futility design) |
| bp-target-trial | BP-TARGET | Post-EVT BP management |
| optimal-bp-trial | OPTIMAL-BP | Post-EVT BP management (HARM signal) |
| escape-na1-trial | ESCAPE-NA1 | Neuroprotection (negative) |
| decimal-trial | DECIMAL | Hemicraniectomy (malignant MCA) |
| destiny-trial | DESTINY | Hemicraniectomy (malignant MCA) |
| hamlet-trial | HAMLET | Hemicraniectomy (malignant MCA) |
| destiny-ii-trial | DESTINY II | Hemicraniectomy (≥60 years) |
| timing-trial | TIMING | NOAC timing after AF-related stroke (NI) |
| optimas-trial | OPTIMAS | NOAC timing (NI, N=3621) |
| escape-mevo-trial | ESCAPE-MEVO | MeVO thrombectomy (negative, NEJM 2025) |
| elan-study | ELAN | Early DOAC initiation (estimation trial) |

**Group 2: explicit JSX branch with DeltaBandChart, no archetypeId in trialData.ts (22 trials)**

These trials are rendered in modern-A layout but their archetypeId field in trialData.ts is absent. They are invisible to any generic archetype dispatch logic that may be added later.

| Trial ID | Title | Notes |
|---|---|---|
| extend-trial | EXTEND | Canary trial (W6.4 first rebuild) |
| wake-up-trial | WAKE-UP | Unknown-onset MRI-guided tPA |
| eagle-trial | EAGLE | IA tPA for CRAO (negative/harm) |
| chance-trial | CHANCE | DAPT for TIA/minor stroke (China) |
| point-trial | POINT | DAPT for TIA/minor stroke (Western) |
| socrates-trial | SOCRATES | Ticagrelor vs aspirin monotherapy |
| sps3-trial | SPS3 | DAPT in lacunar stroke (negative) |
| sparcl-trial | SPARCL | High-dose statin secondary prevention |
| thales-trial | THALES | Ticagrelor+aspirin (AHA 2026 COR 3: No Benefit) |
| best-msu-trial | B_PROUD / BEST-MSU | MSU trial |
| thaws-trial | THAWS | Low-dose alteplase wake-up stroke (inconclusive) |
| act-trial | AcT | Tenecteplase vs alteplase (NI, Canada) |
| aramis-trial | ARAMIS | Alteplase in minor/nondisabling stroke |
| nor-test-trial | NOR-TEST | Tenecteplase 0.4 mg/kg (no benefit) |
| nor-test-2-part-a-trial | NOR-TEST 2 Part A | Tenecteplase 0.4 mg/kg (HARM signal) |
| prisms-trial | PRISMS | Alteplase in minor stroke (stopped early) |
| prost-trial | PROST | Prourokinase vs alteplase (China, NI) |
| prost-2-trial | PROST-2 | Prourokinase vs alteplase (NI, larger) |
| raise-trial | RAISE | Reteplase vs alteplase (positive) |
| taste-trial | TASTE | Tenecteplase in perfusion-selected stroke (NI borderline) |
| trace-2-trial | TRACE-2 | Tenecteplase vs alteplase (NI, China) |
| trace-iii-trial | TRACE-III | Late-window tenecteplase without EVT access |

> **Flag — potential data inconsistency:** `best-msu-trial` appears to carry `archetypeId: 'B'` in the vicinity of line 6758 in trialData.ts, but its JSX branch (TrialPageNew.tsx ~line 1656) uses DeltaBandChart, consistent with Archetype A. The archetypeId value at line 6758 likely belongs to `interact4-trial` (id at line 6700). Warrants direct inspection before any generic archetype dispatch is wired.

> **Flag — potential data inconsistency:** `thaws-trial` mapping returned archetypeId 'B' from the automated scan, but its JSX branch uses DeltaBandChart. Same root cause suspected (Python scan read past the next trial boundary). Verify before any schema-driven dispatch.

### 2b. Archetype B — GrottaBarChart + ordinalStats (19 trials)

All 19 have `archetypeId: 'B'` in trialData.ts and `mrsDistribution` + `ordinalStats` populated.

| Trial ID | Title | Category |
|---|---|---|
| mr-clean-trial | MR CLEAN | Thrombectomy (pivotal 2015) |
| escape-trial | ESCAPE | Thrombectomy (pivotal 2015) |
| revascat-trial | REVASCAT | Thrombectomy (pivotal 2015) |
| swift-prime-trial | SWIFT PRIME | Thrombectomy (pivotal 2015) |
| laste-trial | LASTE | Adjunct alteplase vs heparin post-EVT |
| tension-trial | TENSION | Thrombectomy for malignant MCA (positive) |
| rescue-bt-trial | RESCUE-BT | Balloon vs aspiration thrombectomy |
| enchanted-trial | ENCHANTED | Intensive BP + low-dose alteplase (null) |
| charm-trial | CHARM | Glibenclamide in large hemispheric stroke |
| mr-clean-no-iv-trial | MR CLEAN NO-IV | Direct thrombectomy (NI) |
| distal-trial | DISTAL | MeVO EVT (negative/NI, NEJM 2025) |
| interact4-trial | INTERACT4 | Intensive BP lowering in ICH |
| mr-asap-trial | MR ASAP | Prehospital nitrate in stroke (stopped for harm) |
| racecat-trial | RACECAT | Mothership vs drip-and-ship (nonurban) |
| right-2-trial | RIGHT-2 | Prehospital transdermal nitrate (negative) |
| triage-stroke-trial | TRIAGE-STROKE | Helsinki prehospital triage protocol |
| attest-2-trial | ATTEST-2 | Tenecteplase vs alteplase (NI, Archetype B) |
| timeless-trial | TIMELESS | Late-window bridging tenecteplase (negative) |
| twist-trial | TWIST | Tenecteplase in wake-up/unknown-onset (NI) |

### 2c. Archetype G — BenchmarkThresholdChart + HistoricalContextSection (1 trial)

| Trial ID | Title | Notes |
|---|---|---|
| weave-trial | WEAVE | Wingspan stent post-market surveillance (single-arm benchmark design) |

### 2d. Modern-stub — renderStubPage helper (10 trials)

These trials have `archetypeId: 'A'` in trialData.ts (the intended archetype for eventual full rebuild), but are currently rendered via `renderStubPage`. Full clinical content (howToInterpret, howToReadChart, etc.) is absent.

| Trial ID | Title | Chain |
|---|---|---|
| ims-iii-trial | IMS-III | Predecessor EVT trials |
| synthesis-expansion-trial | SYNTHESIS Expansion | Predecessor EVT trials |
| mr-rescue-trial | MR RESCUE | Predecessor EVT trials |
| best-trial | BEST | Basilar EVT chain |
| basics-trial | BASICS | Basilar EVT chain |
| match-trial | MATCH | Antiplatelet chain |
| charisma-trial | CHARISMA | Antiplatelet chain |
| stich-i-trial | STICH I | ICH surgical chain |
| stich-ii-trial | STICH II | ICH surgical chain |
| mistie-iii-trial | MISTIE III | ICH surgical chain |

---

## 3. Legacy Trials — Redesign Target List (14 trials)

These trials have no explicit `if (trialId === '...')` branch in TrialPageNew.tsx and fall through to the legacy stats-cards + progress-bars fallback layout (TrialPageNew.tsx line 6708+). All lack `archetypeId`, `howToInterpret`, `bedsidePearl`, `bottomLineSummary`, `inclusionCriteria`, `exclusionCriteria`, and `howToReadChart`.

---

### 3.1 NINDS Trial (`ninds-trial`, 1995)
**Source:** NEJM 1995 · **Journal:** NEJM · **Category:** thrombolysis  
**Primary outcome:** mRS 0-1 at 90 days (binary) → **Target archetype: A**  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, doi, pmid. Has `legend` field (bottomLineTag +15/100, NNT 6.5).  
**Complexity:** Two-part trial design (Part 1 neurological improvement at 24h; Part 2 functional outcome at 90 days). Historically foundational — narrative needs to address the two-part structure, the simultaneous ICH risk framing, and the context that this is THE trial that established the field. High teaching priority.

---

### 3.2 ECASS III Trial (`ecass3-trial`, 2008)
**Source:** NEJM 2008 · **Category:** thrombolysis  
**Primary outcome:** mRS 0-1 at 90 days (binary) → **Target archetype: A**  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, doi, pmid. Has `legend` field.  
**Complexity:** Simple A — extension of tPA window from 3h to 4.5h. Straightforward DeltaBandChart (52.4% vs 45.2% mRS 0-1). Clean binary outcome. Lower narrative complexity than NINDS.

---

### 3.3 DEFUSE 3 Trial (`defuse-3-trial`, 2018)
**Source:** Albers et al. NEJM 2018 · **Category:** thrombectomy  
**Primary outcome:** mRS 0-2 at 90 days (binary) → **Target archetype: A**  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, doi, pmid. Has `legend` field (bottomLineTag +28/100, NNT 3.6).  
**Complexity:** Late-window (6–16h), perfusion imaging selection (RAPID software), stopped early for benefit. Pair-teaching with DAWN (companion trial, same session). The howToInterpret needs to address why perfusion-mismatch selection matters and why the trial was stopped early (implication for effect size estimates).

---

### 3.4 DAWN Trial (`dawn-trial`, 2018)
**Source:** Nogueira et al. NEJM 2018 · **Category:** thrombectomy  
**Primary outcome:** Utility-weighted mRS at 90 days (unusual primary) → **Target archetype: A** (needs custom explanation for uwmRS)  
**Schema gaps:** Same as DEFUSE-3. Has `legend` field (bottomLineTag +36/100, NNT 2.8).  
**Complexity:** Bayesian adaptive design, clinical-imaging mismatch selection (DWI + clinical criteria), utility-weighted mRS as primary (not standard mRS 0-2). The howToReadChart and howToInterpret will need to explain uwmRS — a teaching challenge not present in other trials. Pair with DEFUSE-3.

---

### 3.5 SELECT2 Trial (`select2-trial`, 2023)
**Source:** Sarraj et al. NEJM 2023 · **Category:** thrombectomy  
**Primary outcome:** mRS distribution at 90 days (ordinal shift) → **Target archetype: B** (needs mrsDistribution + ordinalStats)  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, mrsDistribution, ordinalStats, doi, pmid.  
**Complexity:** Companion to ANGEL-ASPECT — both should be rebuilt together and cross-linked. Large core selection (ASPECTS 3–5 or core ≥50ml). Generalized OR is available (1.51) and mRS distribution data can be extracted from Figure 2 of NEJM publication. Moderate B complexity.

---

### 3.6 ANGEL-ASPECT Trial (`angel-aspect-trial`, 2023)
**Source:** Huo et al. NEJM 2023 · **Category:** thrombectomy  
**Primary outcome:** mRS distribution at 90 days (ordinal shift) → **Target archetype: B**  
**Schema gaps:** Same as SELECT2. Generalized OR 1.37 in data.  
**Complexity:** China cohort, ASPECTS 3–5 OR core 70–100ml (different volume threshold from SELECT2). Should be rebuilt as companion to SELECT2. Higher sICH signal (6.1% vs 2.7%) needs prominent placement in doesNotProve/cautions.

---

### 3.7 ATTENTION Trial (`attention-trial`, 2022)
**Source:** Tao et al. NEJM 2022 · **Category:** thrombectomy (basilar)  
**Primary outcome:** mRS 0-3 at 90 days (binary) → **Target archetype: A** (with note on mRS 0-3 threshold vs 0-2 convention)  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, doi, pmid.  
**Complexity:** Basilar artery occlusion context requires explaining the mRS 0-3 threshold (not standard 0-2 — different because baseline outcome is so catastrophic). Pair with BAOCHE. China trial; 340 patients. NNT 4.3 in data.

---

### 3.8 BAOCHE Trial (`baoche-trial`, 2022)
**Source:** Jovin et al. NEJM 2022 · **Category:** thrombectomy (basilar)  
**Primary outcome:** mRS 0-3 at 90 days (binary, 6-24h window) → **Target archetype: A**  
**Schema gaps:** Same as ATTENTION. NNT available in data (needs reading to confirm).  
**Complexity:** Extended window (6-24h) basilar EVT. Companion to ATTENTION. China multicenter. 217 patients.

---

### 3.9 SAMMPRIS Trial (`sammpris-trial`, 2011)
**Source:** Chimowitz et al. NEJM 2011 · **Category:** carotid/intracranial stenosis  
**Primary outcome:** Stroke/death within 30 days (event rate, not mRS) → **Target archetype: A** (with custom explanation — unusual endpoint and different natural history)  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, doi, pmid.  
**Complexity:** Very different from other trials — intracranial atherosclerotic disease (ICAD), stenting vs medical management, HARM signal. Primary endpoint is event rate (stroke/death at 30 days), not functional outcome. The DeltaBandChart framing would need to show *worse* outcomes in the intervention arm. Unique "harm" teaching (14.7% vs 5.8%). Related to WEAVE (archetype G) — they form a chain.

---

### 3.10 INSPIRES Trial (`inspires-trial`, 2024)
**Source:** NEJM 2024 · **Category:** antiplatelets  
**Primary outcome:** New stroke at 90 days (binary, event rate) → **Target archetype: A**  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart. **Partially modernized** — has rich trialDesign with structured `nnt`, `primaryEndpoint`, and `pValue` fields; has `trialResult: 'POSITIVE'`.  
**Complexity:** 2×2 factorial design (antiplatelet + statin — the statin arm is independent and not the main teaching). Atherosclerotic-etiology-specific DAPT (extends CHANCE/POINT from 24h to 72h). Pair with CHANCE and CHANCE-2 to complete the DAPT chain. Factual setup is largely present — needs howToInterpret, bedsidePearl, inclusionCriteria most urgently.

---

### 3.11 CHANCE-2 Trial (`chance-2-trial`, 2023)
**Source:** NEJM (CHANCE-2) · **Category:** antiplatelets  
**Primary outcome:** New stroke at 90 days (binary) → **Target archetype: A**  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart.  
**Complexity:** CYP2C19 loss-of-function genotype-stratified design — the most complex antiplatelet trial. Ticagrelor DAPT vs clopidogrel DAPT specifically in CYP2C19 LOF carriers. The howToInterpret needs to address: what the LOF subgroup means for bedside practice, why normal metabolizers should NOT use this data, and the "don't delay for genotyping" pearl. Chain: CHANCE → POINT → INSPIRES → CHANCE-2.

---

### 3.12 ENRICH Trial (`enrich-trial`, 2024)
**Source:** NEJM 2024 · **Category:** acute (ICH surgery)  
**Primary outcome:** Utility-weighted mRS at 180 days (ordinal, UW-mRS) → **Target archetype: B** (mRS distribution data available; UW-mRS difference 0.084 as primary; GrottaBarChart for distribution)  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, mrsDistribution, ordinalStats.  
**Complexity:** First positive surgical ICH trial (2024). Overturns decades of negative evidence. Minimally invasive trans-sulcal surgery (MIPS). Companion context: STICH I (negative), STICH II (negative), MISTIE III (negative) — all stubs. The highest clinical urgency in the legacy list because it changes practice. UW-mRS as primary needs explanation. Lobar vs basal ganglia subgroup matters for bedsidePearl.

---

### 3.13 ORIGINAL Trial (`original-trial`, 2024)
**Source:** Meng X et al. JAMA 2024 · **Category:** thrombolysis  
**Primary outcome:** mRS 0-1 at 90 days (non-inferiority) → **Target archetype: A** (NI framing)  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, doi, pmid.  
**Complexity:** NI design (tenecteplase vs alteplase). 72.7% vs 70.3% mRS 0-1 — a success story for TNK. The NI framing has already been used in TIMING and OPTIMAS pages — patterns exist. China trial. Should be rebuilt as pair with AcT (the Western TNK vs alteplase NI trial, which is already modern-A). Relatively low visual complexity.

---

### 3.14 B_PROUD Trial (`b-proud-trial`, 2020)
**Source:** Ebinger M, et al. JAMA 2020 · **Category:** acute (prehospital/MSU)  
**Primary outcome:** Ordinal mRS shift at 90 days (common OR 0.71) → **Target archetype: B** (has mRS shift primary; would need mrsDistribution data extraction)  
**Schema gaps:** archetypeId, howToInterpret, bedsidePearl, bottomLineSummary, inclusionCriteria, exclusionCriteria, howToReadChart, mrsDistribution, ordinalStats. Has `trialResult: 'POSITIVE'`, `doi`, `safetyProfile` already.  
**Complexity:** Non-randomized prospective design (not strict RCT — important for doesNotProve framing). MSU dispatch vs conventional ambulance. Berlin prehospital system. 1543 patients. Companion to MR ASAP and TRIAGE-STROKE which are already modern-B. Should note design limitation prominently.

---

## 4. Missing or Broken

No trials exist in trialData.ts without any branch in TrialPageNew.tsx beyond the 14 identified legacy trials. All 89 trials in trialData.ts result in some rendered output (14 via legacy fallback, 75 via explicit branch). No "missing" branches detected.

---

## 5. Prioritization Recommendation

Listed in order of clinical rebuild priority.

**Tier 1 — High clinical urgency (do first, each changes practice or is foundational):**
1. **ENRICH** — First positive surgical ICH trial (2024). Overturns 20 years of negative evidence. Residents need this page to counsel families correctly. ICH chain (STICH I, STICH II, MISTIE III) are stubs with no context.
2. **DEFUSE 3 + DAWN** — Rebuild together. These are the twin pillars of the 6-24h EVT window and are cited in every consult. Having them in the legacy layout while companion trials (TIMING, OPTIMAS) are fully modern creates a jarring experience.
3. **NINDS** — The foundational trial. Every tPA consent conversation references it. Should have been rebuilt first but was deferred.

**Tier 2 — High clinical value, clear archetype target (do after Tier 1):**
4. **SELECT2 + ANGEL-ASPECT** — Rebuild together as companion trials. Large-core EVT decisions are now standard of care. Both are Archetype B (GrottaBar) — scope the two simultaneously to share mrsDistribution patterns.
5. **ATTENTION + BAOCHE** — Rebuild together as basilar EVT pair. Complete the basilar chain (BEST, BASICS are already stubs — ATTENTION and BAOCHE provide the positive evidence).
6. **INSPIRES + CHANCE-2** — Complete the antiplatelet DAPT chain (CHANCE and POINT are already modern-A; INSPIRES and CHANCE-2 are the 2023-2024 additions). INSPIRES is partially modernized (rich trialDesign data) and should be fastest to rebuild.

**Tier 3 — Important but less urgent or higher complexity:**
7. **ECASS III** — Historical but clinically routine. Simple Archetype A. Low complexity.
8. **ORIGINAL** — Recent TNK vs alteplase NI trial. Pairs with AcT which is already modern.
9. **SAMMPRIS** — Important for ICAD/stenting teaching. Atypical design makes it harder to template. Archetype A with harm framing.
10. **B_PROUD** — Non-randomized design warrants careful doesNotProve framing. Lower bedside urgency than therapeutic trials.

---

## Appendix: Schema field presence across legacy trials

| Field | ninds | ecass3 | defuse3 | dawn | select2 | angel | attention | baoche | sammpris | inspires | chance2 | enrich | original | bproud |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| archetypeId | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| howToInterpret | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| bedsidePearl | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| bottomLineSummary | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| inclusionCriteria | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| exclusionCriteria | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| howToReadChart | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| trialResult | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✗ | ✗ | ✓ | ✓ |
| mrsDistribution | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| ordinalStats | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| legend | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ |
| doi | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| safetyProfile | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ |
| structured trialDesign | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✗ | ✓ | ✓ | ✗ | ✗ | ✗ |

> **Note:** `structured trialDesign` = trialDesign with nnt/primaryEndpoint/pValue fields beyond the basic type[]/timeline. INSPIRES and CHANCE-2 already have this partially populated.

---

*Audit produced: 2026-05-06. Read-only scan of trialData.ts and TrialPageNew.tsx. No code changes made.*
