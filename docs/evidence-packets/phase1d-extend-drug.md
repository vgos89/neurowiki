# Evidence Packet — Phase 1D (EXTEND trial drug correction)

**Date:** 2026-05-11
**Prepared by:** evidence-verifier agent
**Task:** Phase 1D — Fix EXTEND trial description (desmoteplase → alteplase)
**Files in scope:** `src/data/guideContent.ts` · `src/data/trialData.ts`

---

## Source — EXTEND primary publication

- **Title:** Thrombolysis Guided by Perfusion Imaging up to 9 Hours after Onset of Stroke
- **Authors:** Ma H, Campbell BCV, Parsons MW, et al.
- **Journal/Year:** N Engl J Med. 2019;380(19):1795-1803
- **PMID:** 31067369
- **DOI:** 10.1056/NEJMoa1813046
- **Access:** PubMed abstract confirmed; results corroborated by Campbell et al. IPD meta-analysis (PMID 31128925)
- **Confidence:** HIGH

---

## Key verified findings

**Intervention:** IV alteplase 0.9 mg/kg vs placebo. **Desmoteplase was NOT tested in EXTEND.** Desmoteplase was the agent in the DIAS/DIAS-2 trials (Hacke 2005/2009).

**Population:** Ischemic stroke 4.5–9.0 hours after onset OR wake-up stroke within 9 hours of sleep midpoint, with automated CT or MR perfusion imaging showing: core <70 mL; mismatch >10 mL and >1.2× core volume.

**Results (NEJM 2019 Table 2 / abstract):**
- mRS 0-1 at 90 days: **35.4%** (alteplase) vs **29.5%** (placebo); adj RR 1.44 (95% CI 1.01–2.06), P=0.04
- sICH: **6.2%** (alteplase) vs **0.9%** (placebo)

**Pooled ECASS-4/EPITHET claim:** The pooling is from a separate IPD meta-analysis (Campbell et al. Lancet 2019, PMID 31128925) — not part of the EXTEND trial itself. The EXTEND entry should describe only the EXTEND trial; the meta-analysis is a distinct publication.

**DOI error:** The source link previously used DOI `10.1056/NEJMoa1910355` which points to a different NEJM paper. Correct DOI: `10.1056/NEJMoa1813046`.

---

## Corrections applied

| File | Field | Old | Correct | Confidence |
|---|---|---|---|---|
| `guideContent.ts:70` | clinicalContext intro | "tested desmoteplase (and pooled data...)" | "tested IV alteplase between 4.5 and 9 hours..." | HIGH |
| `guideContent.ts:89` | source DOI | `NEJMoa1910355` | `NEJMoa1813046` | HIGH |
| `trialData.ts:666` | clinicalContext | "tested desmoteplase (and pooled data...)" | "tested IV alteplase between 4.5 and 9 hours..." | HIGH |

**Not changed:** all other fields in both files (results, population, intervention arm label, pearls) were verified accurate and left untouched.
