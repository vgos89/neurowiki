# Evidence Packet — Phase 1C (NINDS pearl + Mimics pearl)

**Date:** 2026-05-11
**Prepared by:** evidence-verifier agent
**Task:** Phase 1C — Fix NINDS pearl Part 2 qualifier + mimics pearl directive language
**Files in scope:** `src/data/strokeClinicalPearls.ts` (id: ninds-trial, id: stroke-mimics-safety)

---

## Source 1 — NINDS rt-PA Stroke Study (1C-i)

- **Title:** Tissue plasminogen activator for acute ischemic stroke
- **Authors:** The National Institute of Neurological Disorders and Stroke rt-PA Stroke Study Group
- **Journal/Year:** N Engl J Med. 1995;333(24):1581-1587
- **PMID:** 7477192
- **DOI:** 10.1056/NEJM199512143332401
- **Access:** Full text verified from URMC archive copy of original NEJM PDF
- **Confidence:** HIGH

### Key verified findings

**Trial structure:** Two-part design with different primary endpoints.

**Part 1 (n=291):**
- Primary endpoint: NIHSS improvement ≥4 pts or complete resolution at 24 hours
- Result: 47% t-PA vs 39% placebo (RR 1.2, 95% CI 0.9-1.5, P=0.21) — **not statistically significant**

**Part 2 (n=333):**
- Primary endpoint: 3-month global test statistic across 4 scales (Barthel index, mRS, NIHSS, Glasgow Outcome Scale)
- Result: global OR 1.7 (95% CI 1.2-2.6, P=0.008)

**Part 2 specific outcomes (Table 4):**
| Scale | t-PA | Placebo |
|---|---|---|
| mRS 0-1 | **39%** | **26%** |
| Barthel ≥95 | **50%** | **38%** |
| NIHSS 0-1 | 31% | 20% |
| GOS = 1 | 44% | 32% |

**sICH (Table 6):** Part 1: 5.6%, Part 2: 7.1%, Combined: **6.4%** vs 0.6% placebo, P<0.001

**Pearl error confirmed:** The original pearl's "42.6% vs 27.2% mRS 0-1" does not match the published Part 2 mRS figures (39% vs 26%). The "50% vs 38% at <90min" conflated the Part 2 overall Barthel ≥95 result with a time-stratified subgroup analysis. The <90min time-benefit analysis is from Marler et al. 2000 (Neurology 2000;55:1649-1655, PMID 11113218).

---

## Source 2 — Zinkstok et al. 2013 (1C-ii)

- **Title:** Safety of thrombolysis in stroke mimics: results from a multicenter cohort study
- **Authors:** Zinkstok SM, Engelter ST, Gensicke H, et al.
- **Journal/Year:** Stroke. 2013;44(4):1080-1084
- **PMID:** 23444310
- **DOI:** 10.1161/STROKEAHA.111.000126
- **Access:** AHA Journals abstract + Amsterdam UMC research portal
- **Confidence:** HIGH

### Key verified findings

- Study design: **multicenter observational cohort** (n=5,581 consecutive IV thrombolysis patients) — NOT a meta-analysis
- Stroke mimics: 1.8% of cohort (n=100)
- sICH in mimics: **1.0% (95% CI 0.0-5.0)** using ECASS-II definition
- sICH in ischemic strokes: **7.9% (95% CI 7.2-8.7)** using ECASS-II definition
- No fatal ICH in mimics: confirmed

**Pearl errors confirmed:**
- Citation year "2021" is wrong → correct year is **2013**
- "meta-analysis" is wrong → correct design is **multicenter observational cohort**
- "sICH rate 1.0-2.0% in mimics" is imprecise → correct is **1.0% (95% CI 0.0-5.0)**
- "5.5-7.9% in true strokes" is wrong → correct is **7.9% (95% CI 7.2-8.7)** (ECASS-II definition)
- Note: sICH rates for both groups use the same ECASS-II definition — no definition mismatch

---

## Source 3 — AHA/ASA 2019 stroke guideline (1C-ii, mimics recommendation)

- **Citation:** Powers WJ, et al. Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update. Stroke. 2019;50(12):e344-e418
- **PMID:** 31662037
- **DOI:** 10.1161/STR.0000000000000211
- **Access:** Full text paywalled; Section 3.5.3 verified via 4+ consistent secondary summaries (PharmacyTimes, JournalFeed, Stroke-Manual, AHA Professional summary)
- **Confidence:** MEDIUM-HIGH on substance; verbatim quote not available from paywalled full text

### Key verified findings

- **COR: IIa** / **LOE: B-NR** for tPA use in suspected stroke when mimic cannot be excluded
- Guideline language (summary-attested, not verbatim): "In patients with suspected acute ischemic stroke, starting IV alteplase is probably recommended in preference to delaying treatment to pursue additional diagnostic studies"
- **"When in doubt, treat" does NOT appear in AHA/ASA guidelines** — confirmed across all sources reviewed
- The guideline frames the decision as a risk comparison, not a directive imperative

---

## Corrections summary

| Pearl | Field | Old value | Correct value | Source | Confidence |
|---|---|---|---|---|---|
| ninds-trial | content mRS % | "42.6% vs 27.2%" | "39% vs 26%" | NEJM 1995 Table 4 | HIGH |
| ninds-trial | content Barthel | "50% vs 38% at <90min" | "Barthel ≥95 50% vs 38%" (Part 2 overall) | NEJM 1995 Table 4 | HIGH |
| ninds-trial | content sICH attribution | unqualified | "Parts 1+2 combined" | NEJM 1995 Table 6 | HIGH |
| stroke-mimics-safety | evidence year | "Stroke 2021" | "Stroke 2013" | Zinkstok 2013 | HIGH |
| stroke-mimics-safety | content design | "meta-analysis" | "multicenter cohort" | Zinkstok 2013 | HIGH |
| stroke-mimics-safety | content sICH mimic | "1.0-2.0%" | "1.0% (95% CI 0.0-5.0)" | Zinkstok 2013 | HIGH |
| stroke-mimics-safety | content sICH stroke | "5.5-7.9%" | "7.9% (95% CI 7.2-8.7)" | Zinkstok 2013 | HIGH |
| stroke-mimics-safety | plainEnglish | "When in doubt, treat." | hedged AHA/ASA-aligned language | AHA/ASA 2019 | HIGH |
