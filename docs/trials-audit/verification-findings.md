# NeuroWiki Trials Audit — Verification Findings

**Version:** 1.0  
**Date:** 2026-05-07  
**Auditor:** Claude Code (claude-sonnet-4-6) acting as orchestrator  
**Source files inspected:** `src/data/trialListData.ts`, `src/data/trialCatalogMeta.ts`, `src/data/trialData.ts`  
**PubMed verification:** All DOI claims verified against PubMed via live API query (DOI→PMID conversion + article metadata retrieval)  
**Status:** Source-integrity pass complete. Clinical/statistical interpretation flagged for physician review.

---

## 1. Corpus Count Verification

| Claim in audit | Verified result | Status |
|---|---|---|
| 79 visible trials in `/trials` catalog | **79 confirmed** — 55 `manualTrials` + 24 `LEGACY_TRIAL_CATALOG_META` (no overlap) | ✅ CONFIRMED |
| `TRIAL_DATA` contains 89 structured records | **89 confirmed** — grep of top-level keys in `trialData.ts` | ✅ CONFIRMED |
| 10 structured records not visible in `/trials` | **10 confirmed** — see list below | ✅ CONFIRMED |

### Data-only records (not visible in `/trials`)
| Trial ID | Title in `TRIAL_DATA` | Product decision |
|---|---|---|
| `ims-iii-trial` | IMS-III Trial | Pending |
| `synthesis-expansion-trial` | SYNTHESIS Expansion Trial | Pending |
| `mr-rescue-trial` | MR RESCUE Trial | Pending |
| `best-trial` | BEST Trial | Pending |
| `basics-trial` | BASICS Trial | Pending |
| `match-trial` | MATCH Trial | Pending |
| `charisma-trial` | CHARISMA Trial | Pending |
| `stich-i-trial` | STICH I Trial | Pending |
| `stich-ii-trial` | STICH II Trial | Pending |
| `mistie-iii-trial` | MISTIE III Trial | Pending |

---

## 2. P0 — ATTENTION/BAOCHE DOI Swap

### Issue
The `LEGACY_TRIAL_CATALOG_META` in `src/data/trialCatalogMeta.ts` has the DOIs swapped between ATTENTION and BAOCHE.

| Trial ID | Current catalog DOI (WRONG) | Correct DOI | PubMed confirmation |
|---|---|---|---|
| `attention-trial` | `10.1056/NEJMoa2207576` | `10.1056/NEJMoa2206317` | PMID 36239644 — "Trial of Endovascular Treatment of Acute Basilar-Artery Occlusion" (Tao et al., NEJM 2022, N=340, within 12h) |
| `baoche-trial` | `10.1056/NEJMoa2206317` | `10.1056/NEJMoa2207576` | PMID 36239645 — "Trial of Thrombectomy 6 to 24 Hours after Stroke Due to Basilar-Artery Occlusion" (Jovin et al., NEJM 2022, N=217, 6–24h window) |

### Resolution
**FIXED** in `src/data/trialCatalogMeta.ts`. Both DOIs corrected.

---

## 3. P1 — DOI Conflicts Between List/Catalog and `TRIAL_DATA`

In every case, **the catalog/list DOI was correct** and **the `TRIAL_DATA` `doi:` field was wrong**.  
All verified via PubMed DOI→PMID conversion and article metadata retrieval.

| Trial ID | Catalog DOI (CORRECT) | `TRIAL_DATA` `doi:` field (WRONG) | PubMed evidence | Fix applied |
|---|---|---|---|---|
| `devt-trial` | `10.1001/jama.2020.23523` | `10.1001/jama.2020.23092` | PMID 33464335 — "The DEVT Randomized Clinical Trial" (JAMA 2021); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:1583`) |
| `skip-trial` | `10.1001/jama.2020.23522` | `10.1001/jama.2021.4807` | PMID 33464334 — "Effect of Mechanical Thrombectomy Without vs With IV Thrombolysis" (JAMA 2021); **CRITICAL: wrong DOI maps to PMID 34003226, an entirely unrelated paper on hyperphosphatemia treatment with lanthanum carbonate in dialysis patients** | ✅ Fixed (`trialData.ts:1686`) |
| `mr-clean-no-iv-trial` | `10.1056/NEJMoa2107727` | `10.1056/NEJMoa2106494` | PMID 34758251 — "A Randomized Trial of Intravenous Alteplase before Endovascular Treatment for Stroke" (NEJM 2021); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:1788`) |
| `direct-safe-trial` | `10.1016/S0140-6736(22)00564-5` | `10.1016/S0140-6736(22)01564-5` | PMID 35810757 — "DIRECT-SAFE" (Lancet 2022); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:1891`) |
| `swift-direct-trial` | `10.1016/S0140-6736(22)00537-2` | `10.1016/S0140-6736(22)01622-5` | PMID 35810756 — "SWIFT DIRECT" (Lancet 2022); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:1992`) |
| `aster2-trial` | `10.1001/jama.2021.13827` | `10.1001/jama.2021.15004` | PMID 34581737 — "The ASTER2 Randomized Clinical Trial" (JAMA 2021); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:2517`) |
| `rescue-bt-trial` | `10.1001/jama.2022.12584` | `10.1001/jama.2022.9570` | PMID 35943471 — "Effect of Intravenous Tirofiban vs Placebo Before EVT" (JAMA 2022); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:2719`) |
| `escape-na1-trial` | `10.1016/S0140-6736(20)30258-0` | `10.1016/S0140-6736(20)30069-6` | PMID 32087818 — "ESCAPE-NA1" (Lancet 2020); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:3339`) |
| `decimal-trial` | `10.1161/STROKEAHA.107.485235` | `10.1161/STROKEAHA.106.483622` | PMID 17690311 — "DECIMAL Trial" (Stroke 2007, Vahedi et al.); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:3415`) |
| `destiny-ii-trial` | `10.1056/NEJMoa1311367` | `10.1056/NEJMoa1400249` | PMID 24645942 — "Hemicraniectomy in older patients with extensive MCA stroke" (NEJM 2014, Jüttler et al.); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:3714`) |
| `weave-trial` | `10.1161/STROKEAHA.118.023996` | `10.1161/STROKEAHA.118.023468` | PMID 31125298 — "WEAVE Trial: Final Results in 152 On-Label Patients" (Stroke 2019); wrong DOI returns no PubMed record | ✅ Fixed (`trialData.ts:5361`) |

### Critical SKIP note
The TRIAL_DATA `doi` for `skip-trial` (`10.1001/jama.2021.4807`) resolves to a completely unrelated paper: a nephrology trial on lanthanum carbonate vs calcium carbonate for hyperphosphatemia in dialysis patients. This is the most severe misidentification in the dataset — if the DOI were ever used to fetch or display citation context, it would show an entirely wrong paper.

---

## 4. PubMed Attribution

All DOI verifications performed using PubMed via the MCP server. DOI links for primary publications:

- ATTENTION: [10.1056/NEJMoa2206317](https://doi.org/10.1056/NEJMoa2206317) (PMID 36239644)
- BAOCHE: [10.1056/NEJMoa2207576](https://doi.org/10.1056/NEJMoa2207576) (PMID 36239645)
- DEVT: [10.1001/jama.2020.23523](https://doi.org/10.1001/jama.2020.23523) (PMID 33464335)
- SKIP: [10.1001/jama.2020.23522](https://doi.org/10.1001/jama.2020.23522) (PMID 33464334)
- MR CLEAN-NO IV: [10.1056/NEJMoa2107727](https://doi.org/10.1056/NEJMoa2107727) (PMID 34758251)
- DIRECT-SAFE: [10.1016/S0140-6736(22)00564-5](https://doi.org/10.1016/S0140-6736(22)00564-5) (PMID 35810757)
- SWIFT DIRECT: [10.1016/S0140-6736(22)00537-2](https://doi.org/10.1016/S0140-6736(22)00537-2) (PMID 35810756)
- ASTER2: [10.1001/jama.2021.13827](https://doi.org/10.1001/jama.2021.13827) (PMID 34581737)
- RESCUE BT: [10.1001/jama.2022.12584](https://doi.org/10.1001/jama.2022.12584) (PMID 35943471)
- ESCAPE-NA1: [10.1016/S0140-6736(20)30258-0](https://doi.org/10.1016/S0140-6736(20)30258-0) (PMID 32087818)
- DECIMAL: [10.1161/STROKEAHA.107.485235](https://doi.org/10.1161/STROKEAHA.107.485235) (PMID 17690311)
- DESTINY II: [10.1056/NEJMoa1311367](https://doi.org/10.1056/NEJMoa1311367) (PMID 24645942)
- WEAVE: [10.1161/STROKEAHA.118.023996](https://doi.org/10.1161/STROKEAHA.118.023996) (PMID 31125298)

---

## 5. Clinical/Statistical Interpretation Issues — Physician Review Required

These issues from §7.3 of the audit file **cannot be fully verified without full-text primary publication access**. They require physician review before any content changes.

| Trial ID | Issue type | Current app behavior (from source) | Review needed |
|---|---|---|---|
| `dawn-trial` | Statistical framework mismatch | `pValue: '<0.001'` rendered in a standard `pValue` card | DAWN used a Bayesian adaptive design; the ">99.9%" figure is a posterior probability of superiority, not a conventional p-value. Should not render as `pValue`. |
| `defuse-3-trial` | NNT derivation | Standard `pValue` card present | NNT shown should be verified as derived from 45% vs 17% (mRS 0–2). Confirm whether this is a teaching dichotomization from an ordinal primary. |
| `select2-trial` | Analysis type | `primaryEndpoint: 'mRS distribution'` in TRIAL_DATA | Primary was ordinal mRS shift (generalized OR). Should display as ordinal-shift, not reduce to NNT. |
| `angel-aspect-trial` | Analysis type | `primaryEndpoint: 'mRS distribution'` | Same — ordinal shift primary. Verify representation. |
| `tension-trial` | Analysis type | `primaryEndpoint: 'mRS Shift'` | Verify ordinal vs binary representation. |
| `laste-trial` | Analysis type | `primaryEndpoint: 'mRS Shift'` | Same — large-core EVT. Verify. |
| `distal-trial` | Neutral result framing | Has primary endpoint field | Verify negative primary outcome language is not overclaimed as positive. |
| `escape-mevo-trial` | Neutral result framing | Has primary endpoint field | Verify neutral MeVO language; app should not imply routine EVT benefit in all MeVO. |
| `elan-study` | Design misclassification risk | In `secondary-prevention` category | ELAN is an anticoagulation-timing trial (not antiplatelet). Verify design framing is clear. |
| `timing-trial` | Design misclassification risk | In `secondary-prevention` category | Same — NOAC timing, not antiplatelet. Verify. |
| `optimas-trial` | Design misclassification risk | In `secondary-prevention` category | Same — DOAC timing. Verify. |
| `socrates-trial` | Result framing | `trialResult` field needs checking | SOCRATES was negative overall (no superiority of ticagrelor). Verify app does not show as positive. |
| `weave-trial` | Registry vs RCT | `trialResult` field needs checking | WEAVE is a post-market safety surveillance study, not a randomized efficacy trial. App should distinguish. |
| `eagle-trial` | Intervention misclassification | Listed in `ivt` (IVT) category | EAGLE studied intra-arterial fibrinolysis for CRAO, not IV alteplase. Wrong category implies IV thrombolysis evidence that does not exist. Needs explicit disclaimer. |
| `enrich-trial` | Surgical grouping | In `surgical-interventions` | ENRICH is ICH evacuation (not ischemic hemicraniectomy). Verify clear grouping separation from DECIMAL/DESTINY/HAMLET. |

---

## 6. Unresolved Items — Requires Product Decision

| Item | Status |
|---|---|
| 10 data-only `TRIAL_DATA` records | Each needs a product decision: surface to catalog, keep as context-only, or remove |
| Validation script preventing DOI conflicts | Not yet created — see Batch A item 4 from audit work plan |
| `primaryAnalysisType` field on each trial | Not yet classified; required before UI graph/visualization work |

---

## 7. Summary

- **P0 confirmed and fixed:** ATTENTION/BAOCHE DOI swap in `trialCatalogMeta.ts`
- **P1 confirmed and fixed:** All 11 TRIAL_DATA DOI errors in `trialData.ts`
- **Critical find:** SKIP `doi` field pointed to an entirely unrelated nephrology paper
- **Corpus counts verified:** 79 visible, 89 total, 10 data-only
- **15 clinical/statistical issues flagged** for physician review — **no content changes made** pending that review
