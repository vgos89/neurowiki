# Evidence Packet — ICAD Trial Refresh (Class E)

**Date:** 2026-07-22 · **Verifier chain:** evidence-verifier + trial-statistician, metadata re-confirmed against PubMed (get_article_metadata) by orchestrator.
**Scope:** CASSISS (existing citation correction + new trial card), BASIS (new), WOVEN (new), Gutierrez 2022 Lancet Neurol review (new supporting reference).
**Attribution:** all metadata below verified against PubMed abstract records; DOIs resolve to the stated article.

---

## 1. CASSISS — Gao P et al., JAMA 2022

| Field | Verified value |
|---|---|
| PMID | **35943472** (authoritative — see correction below) |
| DOI | 10.1001/jama.2022.12000 · PMC9364128 · JAMA article 2795028 |
| Citation | JAMA 2022;328(6):534–542 (Aug 9 2022) |
| NCT | NCT01763320 |
| First author | Peng Gao (Xuanwu Hospital, Beijing) |
| Design | Multicenter (8 centers, China) open-label, outcome-assessor-blinded superiority RCT; stenting + AMM vs AMM alone |
| Enrollment | Mar 5 2014 – Nov 10 2016; 3-year follow-up |
| N | 380 randomized; **358 eligible (176 stenting, 182 medical)**; 343 (95.8%) completed. Mean age 56.3; 73.5% male |
| Population | TIA or nondisabling nonperforator ischemic stroke, 70–99% intracranial stenosis, **≥3 weeks** from qualifying event |
| Primary endpoint | Composite of stroke or death within 30 days OR stroke in the qualifying-artery territory beyond 30 days through **1 year** |
| Primary result | **8.0% (14/176) vs 7.2% (13/181); difference 0.4% (95% CI −5.0 to 5.9); HR 1.10 (95% CI 0.52–2.35); P = .82** — superiority NOT met |
| 30-day stroke/death | 5.1% (stenting) vs 2.2% (medical) |
| 2-yr territory stroke | 9.9% vs 9.0% (HR 1.10, 0.56–2.16, P = .80) |
| 3-yr territory stroke | 11.3% vs 11.2% (HR 1.00, 0.53–1.90, P > .99) |
| 3-yr mortality | 4.4% (7/160) vs 1.3% (2/159); HR 3.75 (0.77–18.13); P = .08 |
| Symptomatic ICH | 2.3% (stenting) vs 0% (medical) |
| Statistical read | archetype **A** · `binary-superiority` · `not-met` · `NEUTRAL`. Negative despite lower periprocedural rate than SAMMPRIS because modern AMM performed very well (7.2% at 1yr) and the trial was underpowered (wide CI 0.52–2.35). No NNT (NS, time-to-event HR). |

**CORRECTION REQUIRED to existing `gao-cassiss-2022` citation:**
- `pmid`: `35943471` → **`35943472`**. The old value points to a *different* article — RESCUE BT (IV tirofiban, Qiu Z et al., JAMA 2022;328(6):543–553, DOI 10.1001/jama.2022.12584). Confirmed via PubMed.
- `url`: anchor on DOI `https://doi.org/10.1001/jama.2022.12000` (or verified article 2795028); the previous `…/fullarticle/2794780` is unconfirmed.
- `quoted_text`: correct "380 … randomized" → "358 eligible (176 stenting, 182 medical)"; correct endpoint to include territorial stroke; optionally add P = .82.

**Verbatim quote (results):** "The primary outcome occurred in 8.0% … vs 7.2% … (hazard ratio, 1.10 [95% CI, 0.52-2.35]; P = .82)."

---

## 2. BASIS — Sun X et al., JAMA 2024 (pivotal positive trial)

| Field | Verified value |
|---|---|
| PMID | **39235816** · PMC11378071 · JAMA article 2823274 |
| DOI | 10.1001/jama.2024.12829 |
| Citation | JAMA 2024;332(13):**1059–1069** (Oct 1 2024) |
| NCT | NCT03703635 |
| Byline | Xuan Sun, Yiming Deng, Yong Zhang … Zhongrong Miao (senior). User byline confirmed. |
| Design | Multicenter (**31 centers, China**) open-label, blinded-endpoint (PROBE) superiority RCT; **submaximal balloon angioplasty + AMM vs AMM alone** |
| Enrollment | Nov 8 2018 – Apr 2 2022; final follow-up Apr 3 2023 |
| N | 512 randomized; **501 eligible (249 angioplasty, 252 medical)**; mean age 58.0; 31.5% women; age 35–80 |
| Population | sICAS: TIA <90 d or ischemic stroke 14–90 d, attributed to 70–99% intracranial atherosclerotic stenosis |
| Primary endpoint | Composite of any stroke or death within 30 days after enrollment/angioplasty, OR any ischemic stroke in the qualifying-artery territory, OR revascularization of the qualifying artery, 30 days through 12 months |
| Primary result | **4.4% vs 13.5%; HR 0.32 (95% CI 0.16–0.63); P < .001** — superiority MET (ARD ≈ 9.1 pts) |
| 30-day stroke/death | 3.2% (angioplasty) vs 1.6% (medical) — front-loaded procedural risk |
| Territory ischemic stroke 30d–1yr | 0.4% vs 7.5% |
| Revascularization of qualifying artery | 1.2% vs 8.3% |
| Symptomatic ICH | 1.2% vs 0.4% |
| Procedural complications | 17.4%; arterial dissection **14.5%** |
| Statistical read | archetype **A** · `binary-superiority` · `met` · `POSITIVE`. First positive endovascular ICAS RCT. **No unqualified NNT** — composite includes the softer, unblinded revascularization component; benefit persists when revascularization removed (territory-stroke 0.4% vs 7.5%). Lead with HR + CI. |

**Guardrails (must appear in `howToInterpret.cautions`):** single-country (China), open-label, experienced high-volume operators; **balloon angioplasty, NOT stenting** (does not license Wingspan/primary stenting; 14.5% dissection); real upfront risk (30-day 3.2% vs 1.6%, sICH 1.2%); composite includes revascularization; awaits US/multinational replication; not yet guideline-endorsed.

**Verbatim quote (results):** "The incidence of the primary outcome was lower in the balloon angioplasty group than the medical management group (4.4% vs 13.5%; hazard ratio, 0.32 [95% CI, 0.16-0.63]; P < .001)."

**Accompanying editorial (context, paywalled):** Turan TN, Derdeyn CP. "Is Balloon Angioplasty the Future for Intracranial Stenosis?" JAMA 2024, PMID 39235792 — central caveat: positive BASIS results will likely need replication in a US/multinational population before widespread adoption.

---

## 3. WOVEN — Alexander MJ et al., JNIS 2021 (single-arm follow-up of WEAVE)

| Field | Verified value |
|---|---|
| PMID | **32561658** |
| DOI | 10.1136/neurintsurg-2020-016208 |
| Citation | J Neurointerv Surg 2021;13(4):307–310 (epub Jun 19 2020) |
| Byline | Alexander MJ, Zauner A, Gupta R, et al. (confirmed) |
| Design | **Single-arm** 1-year follow-up of the WEAVE on-label Wingspan cohort; **no control arm**. 12 of 24 original sites |
| N followed | **129** of the WEAVE 152 on-label patients (~85% retention) |
| 1-yr result | 7 strokes during follow-up (6 minor, 1 major); **no deaths beyond the periprocedural period**. Including the 4 WEAVE periprocedural events: **11 strokes or deaths of 129 (8.5%)** at 1 year |
| Statistical read | archetype **G** · `single-arm-registry` · `SAFETY_MET`. Descriptive only; **cannot establish efficacy**. Unlike WEAVE there was **no pre-specified 1-year FDA threshold** — any benchmark line must be labeled historical/illustrative (e.g. SAMMPRIS medical-arm ~12.2% at 1yr), not a formal pass/fail. Clopper-Pearson exact CI for 11/129 ≈ 4.3%–14.8% (compute + label if displayed). |

**Verbatim quote:** "there were 11 strokes or deaths of the 129 patients (8.5%) at the 1-year follow-up."

---

## 4. Gutierrez J et al., Lancet Neurology 2022 (supporting review reference)

| Field | Verified value |
|---|---|
| PMID | **35143758** |
| DOI | 10.1016/S1474-4422(21)00376-8 |
| Citation | Lancet Neurol 2022;21(4):355–368 (Feb 7 2022) |
| Authors | Gutierrez J, Turan TN, Hoh BL, Chimowitz MI |
| Type | Narrative review |

**Abstract-anchored summary points (usable for a review `quoted_text`):**
1. ICAS is "one of the most frequent causes of stroke worldwide" and confers one of the greatest recurrent-stroke risks; asymptomatic ICAS is increasingly recognized as a risk factor for silent infarction and dementia.
2. ICAS is a lumen-based diagnosis; high-resolution vessel-wall MRI is highlighted to identify high-risk subgroups.
3. Secondary prevention rests on intensive risk-factor modification plus dual antiplatelet therapy reduced to aspirin; despite this, recurrent stroke exceeds 20% at 1 year in 70–99% ICAS. Angioplasty, submaximal balloon angioplasty, bypass, and ischemic conditioning are under investigation.

---

## 5. Guideline anchor (existing, verified)

2021 AHA/ASA Secondary Prevention §5.5 Intracranial Atherosclerosis (PMID 34024117): for 70–99% intracranial stenosis, aggressive medical management is recommended over angioplasty/stenting (Class 1, Level B-R, based on SAMMPRIS); stenting after recurrent events is Class 2b, Level B-R (WEAVE). **CASSISS (2022) reinforces the Class-1-medical recommendation. BASIS (2024) is not yet incorporated into AHA/ASA or ESO guidance** — treat as practice-informing, not guideline-endorsed.

---

## 6. Cross-trial synthesis guardrails (from trial-statistician)

Two axes, must not be flattened onto one bar:
- **Axis 1 (randomized, endovascular vs medical):** SAMMPRIS 2011 stenting → HARM; CASSISS 2022 stenting → no benefit; BASIS 2024 submaximal balloon angioplasty → benefit. These are NOT contradictory: the *initial-stenting strategy* fails while a *different, gentler technique* tips the 12-month balance.
- **Axis 2 (single-arm safety benchmarks, no efficacy):** WEAVE 2019 (2.6% 72h) and WOVEN 2021 (8.5% 1yr). Safety only; cannot carry an efficacy claim or a class above IIb.
- **Fair synthesis CAN say:** AMM is the first-line foundation; stenting-as-initial-therapy is unsupported by two RCTs; periprocedural risk is modifiable (14.7% → ~5% → 2.6%); BASIS is a genuine first-of-kind positive signal for submaximal balloon angioplasty at expert Chinese centers.
- **Fair synthesis CANNOT say:** BASIS "overturns SAMMPRIS" or "proves stenting works"; WEAVE/WOVEN show efficacy; BASIS generalizes outside China / to non-expert operators; or that the headline percentages are directly comparable (different windows, denominators, composite definitions).

---

## 7. Confidence summary

**Fully verified (PubMed + publisher):** all metadata, DOIs, PMIDs, NCTs, sample sizes, primary endpoints, and primary statistics for CASSISS, BASIS, WOVEN, and the Gutierrez review. BASIS secondary/safety figures (30-day 3.2%/1.6%, sICH 1.2%/0.4%, dissection 14.5%, territory stroke 0.4%/7.5%) confirmed from the JAMA abstract. The CASSISS citation PMID error (35943471 → 35943472) is definitively identified and must be fixed before merge.

---

## Section 8 — Editorial & expert context

**Shipping scope note (2026-07-22):** Phase 1 ships CASSISS + BASIS trial cards + the synthesis rewrite + the CASSISS PMID correction. WOVEN is deferred to Phase 2 (its single-arm data cannot render safely through the current trial-page renderer, which is hardcoded to WEAVE for the archetype-G benchmark chart; see clinical review). WOVEN remains cited in the synthesis prose as single-arm safety context. §8 below covers the two Phase-1 new-trial entries. Searches run 2026-07-22 against PubMed, JAMA Network, AHA journals, and PMC free full text.

### CASSISS — Gao P et al., JAMA 2022 (PMID 35943472)
- **§8a Accompanying editorial.** No same-issue JAMA editorial paired to CASSISS confirmed in free sources. Downstream expert synthesis exists (ESO commentary "Should We Be Stenting Symptomatic Atherosclerotic Intracranial Stenoses?"; Stroke commentary, PMID 40113622). Recorded as "no verified paired editorial located," not silently omitted.
- **§8b Post-publication letters / replies.** None located in free sources, searched 2026-07-22 (PubMed comment-linkage and JAMA letters section). Fill-or-declare satisfied.
- **§8c Guideline incorporation.** CASSISS reinforces the AHA/ASA 2021 SP §5.5 stance (aggressive medical management over angioplasty/stenting, Class 1 Level B-R; post-recurrence stenting Class 2b). No reclassification triggered; confirmatory.
- **§8d Subsequent evidence.** CASSISS 3-year follow-up (Stroke 2022, PMID 36367102): durable no-benefit at 3 years. CASSISS long-term follow-up to ~7 years (Stroke 2024, STROKEAHA.124.049602): no benefit sustained (located via search; not full-text-verified — flag). Pooled analyses of SAMMPRIS + VISSIT + CASSISS (systematic review PMC12191942; network meta-analysis PMID 35150413): stenting adds no long-term benefit while raising early periprocedural risk. Robust, stable.

### BASIS — Sun X et al., JAMA 2024 (PMID 39235816)
- **§8a Accompanying editorial.** Turan TN, Derdeyn CP, "Is Balloon Angioplasty the Future for Intracranial Stenosis?" JAMA 2024 (PMID 39235792, DOI 10.1001/jama.2024.13547). Full text paywalled. Open-access synthesis (ACC.org journal scan): positive result "will likely need to be replicated in a US or multinational population before widespread adoption"; >85% of the medical-only arm avoided recurrent events at 1 year.
- **§8b Post-publication letters / replies.** None located in free sources, searched 2026-07-22 (recent trial; correspondence may not yet be indexed). Fill-or-declare satisfied.
- **§8c Guideline incorporation.** Not yet incorporated into any AHA/ASA, AAN, or ESO guideline as of 2026-07-22. Current guidance still advises against routine intracranial angioplasty/stenting. Practice-informing, not guideline-endorsed.
- **§8d Subsequent evidence.** No confirmatory or refuting RCT to date; BASIS is the sole positive endovascular ICAS trial. Pooled/systematic reviews including BASIS (e.g. PMC12191942) frame it as first-positive but emphasize submaximal balloon angioplasty (not stenting), China-only. A timing signal is noted: median symptom-to-intervention ~7, 9, 35, 34 days for SAMMPRIS, VISSIT, CASSISS, BASIS with periprocedural complication rates 14.7%, 24.1%, 5.1%, 3.2%, suggesting later (post-acute) intervention may partly explain BASIS's low periprocedural risk.

**§8 verification note:** §8a/§8c for both trials and the BASIS editorial identity are fully verified. §8b for both is an explicit "searched, none located" declaration. §8d is verified at abstract/summary level; the CASSISS long-term Stroke 2024 paper and pooled effect framings were located via search but not full-text-read (flagged; none of this §8d material is quoted in rendered trial-card content).
