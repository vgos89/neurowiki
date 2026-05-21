# Evidence packet — RESCUE-Japan LIMIT

**Date:** 2026-05-20
**Authoring agent:** medical-scientist
**Task class:** E-clinical
**Source PDF:** verified by V; full text read in this session

---

## 1. Trial identity

- **Title:** Endovascular Therapy for Acute Stroke with a Large Ischemic Region
- **Authors:** Yoshimura S, Sakai N, Yamagami H, Uchida K, Beppu M, Toyoda K, Matsumaru Y, Matsumoto Y, Kimura K, Takeuchi M, Yazawa Y, Kimura N, Shigeta K, Imamura H, Suzuki I, Enomoto Y, Tokunaga S, Morita K, Sakakibara F, Kinjo N, Saito T, Ishikura R, Inoue M, Morimoto T
- **Journal:** N Engl J Med 2022;386(14):1303-1313
- **Published online:** February 9, 2022 (updated February 17, 2022); print April 7, 2022
- **DOI:** 10.1056/NEJMoa2118191
- **PMID:** 35138767
- **ClinicalTrials.gov:** NCT03702413
- **Funding:** Mihara Cerebrovascular Disorder Research Promotion Fund and Japanese Society for Neuroendovascular Therapy. No industry involvement.

## 2. Design

- Multicenter, open-label, parallel-group, randomized clinical trial conducted at 45 hospitals in Japan.
- Enrollment November 2018 through September 2021.
- 1:1 randomization (stochastic minimization on age, LKW-to-arrival interval, NIHSS, rt-PA use).
- Trial group assignments not concealed from patients or treating physicians; mRS at 90 days assessed by trained physicians or physical therapists blinded to group assignment.
- Sample size 200 (final 203 randomized) for 90% power at two-sided α=0.05.

## 3. Population

- Age ≥18, NIHSS ≥6, pre-stroke mRS 0–1.
- Occlusion of ICA or M1 segment of MCA on CTA or MRA.
- ASPECTS 3–5 on CT or DWI-MRI.
- LKW to randomization ≤6 hours, OR 6–24 hours with no signal change on FLAIR (indicating recent infarction).
- EVT could be initiated within 60 minutes after randomization.
- ASPECTS 0–2 excluded (extensive infarction, unlikely to regain independence).

**Baseline characteristics:**
- Mean age 76 years (older than SELECT2, ANGEL-ASPECT cohorts).
- 44.3% women.
- Median NIHSS 22.
- Median ASPECTS 3.
- Median infarct volume 94 mL (EVT) and 110 mL (medical care).
- Atrial fibrillation in 59%.
- ASPECTS by MRI in 88% (EVT) and 87% (medical) — predominantly MRI-selected.

## 4. Intervention vs control

- **EVT arm (n=101):** endovascular therapy + medical care. Device choice at operator discretion (stent retriever, aspiration, balloon angioplasty, intracranial stent, carotid-artery stent allowed). TICI 2b reperfusion achieved in 86.0%.
- **Medical-care arm (n=102):** medical care alone per AHA/ASA guideline standards.
- **rt-PA use:** 26.7% (EVT) vs 28.4% (medical), Japanese low-dose alteplase 0.6 mg/kg (explicitly noted as lower than the dose recommended in some other guidelines).

## 5. Outcomes

**Primary (mRS 0–3 at 90 days):**
- EVT 31/100 (31.0%) vs medical 13/102 (12.7%).
- Relative risk 2.43 (95% CI 1.35–4.37).
- P = 0.002.
- Absolute risk difference 18.3 percentage points.
- NNT = 1 / 0.183 ≈ 5.5 (≈ 5–6).

**Secondary:**
- mRS 0–2 at 90 days: 14.0% vs 7.8% (RR 1.79, 95% CI 0.78–4.07).
- mRS 0–1 at 90 days: 5.0% vs 2.9% (RR 1.70, 95% CI 0.42–6.93).
- Ordinal shift across mRS: common OR 2.42 (95% CI 1.46–4.01).
- NIHSS improvement ≥8 points at 48h: 31.0% vs 8.8% (RR 3.51, 95% CI 1.76–7.00).

**Safety:**
- Symptomatic ICH within 48h: 9.0% vs 4.9% (RR 1.84, 95% CI 0.64–5.29; P=0.25). Not statistically significant.
- Any ICH within 48h: 58.0% vs 31.4% (RR 1.85, 95% CI 1.33–2.58; P<0.001). Statistically significant.
- Death within 90 days: 18.0% vs 23.5% (RR 0.77, 95% CI 0.44–1.32; P=0.33).
- Recurrent ischemic stroke within 90 days: 5.0% vs 6.9% (RR 0.73, 95% CI 0.24–2.22; P=0.58).
- Decompressive craniectomy within 7 days: 10.0% vs 13.7% (RR 0.73, 95% CI 0.34–1.56; P=0.41).

## 6. Statistical design classification

- **Primary design (trial-statistics taxonomy):** `binary-superiority`. Primary outcome is the binary proportion with mRS 0–3.
- **Primary result:** `met`. RR 2.43, P=0.002.
- **NNT validity:** NNT is appropriate here. Binary primary with a defined ARD (18.3 pp). NNT ≈ 5.5. Not an ordinal-shift primary, so the trial-statistics ban on NNT does NOT apply.
- **Secondary ordinal cOR 2.42** is also significant; the ordinal-shift result is supportive but secondary, and the renderer should drive off the binary primary.

## 7. Quoted text (verbatim from PDF for citation registry)

**Abstract conclusion:**
> "In a trial conducted in Japan, patients with large cerebral infarctions had better functional outcomes with endovascular therapy than with medical care alone but had more intracranial hemorrhages."

**Abstract results:**
> "The percentage of patients with a modified Rankin scale score of 0 to 3 at 90 days was 31.0% in the endovascular-therapy group and 12.7% in the medical-care group (relative risk, 2.43; 95% confidence interval [CI], 1.35 to 4.37; P=0.002)."

## 8. Editorial context (per CLAUDE.md hard requirement, commit 479f100)

### 8a. Accompanying NEJM editorial

**Finding:** RESCUE-Japan LIMIT was not paired with a dedicated NEJM editorial in the April 7, 2022 issue (Vol 386 No 14). The Fayad editorial titled "Improved Prospects for Thrombectomy in Large Ischemic Stroke" (NEJM 2023; DOI 10.1056/NEJMe2300193, PMID 36762847) was published with SELECT2 and ANGEL-ASPECT in February 2023, not with RESCUE-Japan LIMIT in 2022. That editorial synthesizes results across all three trials and references RESCUE-Japan LIMIT as the index trial that opened the question.

**TODO-VERIFY:** confirm via authenticated NEJM access that no companion editorial appeared in the April 7, 2022 issue. WebFetch was 403-blocked. If V has institutional access, request confirmation. If a 2022 editorial exists, it should be added to the citation registry.

### 8b. Post-publication letters and replies

Not located in this session. Search PubMed for "RESCUE-Japan LIMIT" letters and Yoshimura reply when authenticated access is available. TODO-VERIFY.

### 8c. Guideline incorporation

- **AHA/ASA 2019 Acute Ischemic Stroke Guideline** (Powers et al. Stroke 2019;50(12):e344-e418) recommends EVT for ASPECTS ≥6. RESCUE-Japan LIMIT, SELECT2, ANGEL-ASPECT, TENSION, and LASTE challenged this cutoff.
- **AHA/ASA 2023 Focused Update / Society of Vascular and Interventional Neurology 2024 Guideline** incorporates large-core EVT (ASPECTS 3–5) following these trials.
- **AHA/ASA 2026 Early Management of Acute Ischemic Stroke Guideline §4.7.2** (per NeuroWiki citation registry) cites large-core EVT trials including RESCUE-Japan LIMIT for the Class I large-core EVT recommendation.

### 8d. Subsequent meta-analyses and confirmatory evidence

- **SELECT2 (Sarraj et al., NEJM 2023;388:1259-1271; DOI 10.1056/NEJMoa2214403; PMID 36762865)** — confirmed benefit. ASPECTS 3–5 OR core ≥50 mL. International. Stopped early for efficacy.
- **ANGEL-ASPECT (Huo et al., NEJM 2023;388:1272-1283; DOI 10.1056/NEJMoa2213379; PMID 36762852)** — confirmed benefit in Chinese population.
- **TENSION (Bendszus et al., Lancet 2023;402:1753-1763; PMID 37837989)** — confirmed benefit in European population using non-contrast CT selection.
- **LASTE (Costalat et al., NEJM 2024;390:1677-1689; DOI 10.1056/NEJMoa2314063; PMID 38718358)** — confirmed benefit including ASPECTS 0–2.
- **Sarraj et al. systematic review and meta-analysis (J NeuroIntervent Surg 2020;12:1172-9)** — the registry-derived signal that RESCUE-Japan LIMIT was powered against.

All four subsequent RCTs reproduced the directional finding RESCUE-Japan LIMIT identified in 2022.

## 9. Limitations explicitly stated in the paper

1. Generalizability limited beyond Japanese population.
2. Open-label, pragmatic enrollment based on treating-neurologist judgment.
3. Low rt-PA use (~27%) and low-dose alteplase (0.6 mg/kg) may have disadvantaged the medical-care group; if more or higher-dose alteplase had been used, outcomes might have improved in both arms.
4. Perfusion imaging not available at most participating Japanese hospitals during trial conduct.
5. MRI-based ASPECTS may classify infarctions as one level lower (i.e., larger) than CT-based ASPECTS; CT-determined ASPECTS in equivalent patients might have been 3–5 mapped to 4–6.
6. 14 patients excluded from per-protocol analysis after adjudication (6 EVT, 8 medical) for inclusion-criteria violations.
7. Secondary outcomes were not adjusted for multiple comparisons; no definite conclusions from them.

## 10. Authoring decisions for trial entry

1. **Lead caveat in every applicable surface:** the any-ICH safety signal (58.0% vs 31.4%, P<0.001) is the primary safety trade-off. Surfaced in: pearls, bedsidePearl, safetyData, howToInterpret.cautions, applicability.
2. **NNT framing:** binary-superiority primary → NNT ≈ 5 is valid and clinically meaningful. Computed from the actual ARD (0.310 − 0.127 = 0.183 → NNT 5.5, displayed as 5).
3. **Japanese low-dose alteplase context:** flagged in applicability.doseSpecific and limitations.
4. **First-positive lineage prose:** RESCUE-Japan LIMIT was the index signal trial for large-core EVT; SELECT2 and ANGEL-ASPECT (2023) confirmed.
5. **No em-dashes in V-facing prose** per ongoing campaign: colons or rephrasing used.
6. **chainMembership omitted** — the `evt-anterior` and `large-core-evt` chains do not exist in trialChainRegistry.ts yet (only 'hemicraniectomy' and 'basilar-evt' shipped). Adding the chain is a separate Class D-clinical task.

## 11. Claim IDs registered

- `rescue-japan-limit-evt-large-core-2022` — primary efficacy claim.
- `rescue-japan-limit-ich-safety-2022` — any-ICH safety signal.

## 12. Citation registered

- `yoshimura-rescue-japan-limit-2022` — primary trial citation.
  - `source: 'trial'`, `year: 2022`, `pmid: '35138767'`, `last_reviewed: '2026-05-20'`, `review_window_months: 36` (landmark trial freshness window per §13.7).

## 13. Confidence and TODO-VERIFY

- **HIGH confidence:** all numerical results (Table 2 of the PDF read directly), study design, dosing, inclusion criteria, exclusion criteria, baseline characteristics, primary and secondary endpoints.
- **MEDIUM confidence — TODO-VERIFY:**
  - Existence (or absence) of an accompanying NEJM editorial in the April 7, 2022 issue. Authenticated NEJM access required.
  - Post-publication letters in NEJM. PubMed query needed when authenticated.
- **HIGH confidence — confirmed via published abstracts:** subsequent SELECT2, ANGEL-ASPECT, TENSION, LASTE results.

## 14. Routing

- Ready for clinical-reviewer §17.2 artifact.
- Orchestrator to gate per CLAUDE.md §20 quality gates after clinical-reviewer approval.
