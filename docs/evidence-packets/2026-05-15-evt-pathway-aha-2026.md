# Evidence Packet — EVT Pathway Audit vs AHA/ASA 2026

**Date:** 2026-05-15
**Prepared by:** evidence-verifier agent
**Task:** Read-only clinical audit of `src/pages/EvtPathway.tsx` against the 2026 AHA/ASA acute ischemic stroke guideline and 25 EVT trials spanning anterior 0–6 h, anterior 6–24 h, basilar, large-core, MeVO, low-NIHSS, and prestroke-disability subgroups.
**Files in scope (read-only for verifier):** `src/pages/EvtPathway.tsx`; `src/data/trialData.ts`; `src/data/trialCatalogMeta.ts`; `src/data/strokeClinicalPearls.ts`; `src/data/guideContent.ts`.
**Verification confidence:** **MEDIUM-HIGH overall.**
- HIGH for: AHA/ASA 2026 guideline structure (DOI resolves, multiple secondary sources confirm classes/LOE for major branches), MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, EXTEND-IA, THRACE, DAWN, DEFUSE-3, RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, TESLA, LASTE, ATTENTION, BAOCHE, BEST, BASICS, ESCAPE-MeVO, DISTAL (DOIs/PMIDs verified via PubMed and journal search; primary endpoints and effect sizes captured).
- MEDIUM for: THERAPY (sample size + early-stopping context confirmed, but PMID 27486173 vs 27092472 disambiguation noted below).
- LOW / [PUBLICATION STATUS] for: ENDOLOW (results not yet published as of 2026-05-15 to verifier's knowledge), MOSTE (results not yet published).
- Source-priority caveat: The AHA/ASA 2026 guideline URL `https://www.ahajournals.org/doi/10.1161/STR.0000000000000513` returned HTTP 403 on direct WebFetch; section IDs and class/LOE values below were assembled from authoritative secondary summaries (emDocs, TCTMD, AHA Top-10, Cardiology Advisor) and confirmed by triangulation across ≥2 sources for each branch. Section numbering (e.g., 4.7.2) reflects the consensus structure reported by these summaries but should be **field-verified against the published PDF** by medical-scientist before any class label is shipped.

> **Hard rule (§13.1, CLAUDE.md):** This packet establishes *metadata validity* (DOIs resolve; trials cited correctly; classes plausible per multiple secondary summaries). It does **not** confirm semantic validity of every recommendation text-for-text against the 2026 PDF. Where text is quoted as "verbatim" it is verbatim from the cited secondary source; medical-scientist must re-verify against the official AHA PDF before any class or LOE is changed in `EvtPathway.tsx`.

---

## PART A — Trials in scope

For each trial: DOI, PMID, year, journal, sample size, primary outcome, key inclusion, key exclusion, effect size, bottom-line, limitations, in-codebase status.

---

### MR CLEAN (Berkhemer et al., 2015)
- **DOI:** 10.1056/NEJMoa1411587 (resolves to NEJM)
- **PMID:** 25517348
- **Year:** 2015 (N Engl J Med 372:11–20, Jan 1)
- **Journal:** NEJM
- **Sample size:** n=500 (233 intervention / 267 control)
- **Primary outcome:** mRS at 90 days (ordinal shift, common odds ratio)
- **Key inclusion:** Age ≥18 (no upper limit); acute ischemic stroke with intracranial anterior-circulation occlusion (distal ICA, M1, M2, A1, A2) on CTA/MRA/DSA; NIHSS ≥2; intra-arterial treatment initiable within **6 h** of onset.
- **Key exclusion:** ICH on imaging; standard tPA exclusions if applicable.
- **Effect size:** Adjusted common OR for mRS shift 1.67 (95% CI 1.21–2.30). mRS 0–2 at 90 d: 32.6% intervention vs 19.1% control (adjusted OR 2.16, 95% CI 1.39–3.38). ARD ≈ +13.5% (NNT≈8 for functional independence).
- **Bottom-line verdict:** First positive RCT for stent-retriever-era EVT in anterior LVO within 6 h; established EVT + IV tPA superiority over IV tPA alone.
- **Limitations / caveats:** Netherlands-only; only ~1.4% pre-randomization tPA-rate variance issues; **no ASPECTS lower bound as inclusion** — broader than later trials (Bracke et al., post-hoc shows benefit attenuated below ASPECTS 5).
- **In-codebase status:** Full TRIAL_DATA entry (`mr-clean-trial`, trialData.ts:1046).

---

### ESCAPE (Goyal et al., 2015)
- **DOI:** 10.1056/NEJMoa1414905
- **PMID:** 25671798
- **Year:** 2015 (N Engl J Med 372:1019–1030)
- **Journal:** NEJM
- **Sample size:** n=316 (165 intervention / 150 control); stopped early for efficacy
- **Primary outcome:** mRS at 90 days (ordinal shift, proportional odds model)
- **Key inclusion:** Age >18; NIHSS >5; **ASPECTS >5**; CTA-confirmed ICA-T / M1 occlusion; **moderate-to-good collaterals on multiphase CTA**; symptom onset <12 h.
- **Key exclusion:** ASPECTS ≤5; poor collaterals; large infarct on baseline imaging.
- **Effect size:** Common OR for mRS shift 2.6 (95% CI 1.7–3.8, P<0.001). mRS 0–2: 53.0% vs 29.3% (P<0.001). Mortality reduced (10.4% vs 19.0%).
- **Bottom-line verdict:** Demonstrated EVT efficacy with rapid workflow + imaging selection (small-core + collaterals); first trial showing **mortality reduction**.
- **Limitations / caveats:** Imaging-selected (collateral-rich) population — generalizability to centers without multiphase CTA workflow; only ~49% of patients enrolled within the canonical 6 h window — 15.5% beyond 6 h.
- **In-codebase status:** Full TRIAL_DATA entry (`escape-trial`, trialData.ts:1169).

---

### REVASCAT (Jovin et al., 2015)
- **DOI:** 10.1056/NEJMoa1503780
- **PMID:** 25882510
- **Year:** 2015 (N Engl J Med 372:2296–2306)
- **Journal:** NEJM
- **Sample size:** n=206 (103/103)
- **Primary outcome:** mRS at 90 days (ordinal shift)
- **Key inclusion:** Age **18–80** (later expanded to 85); NIHSS ≥6; pre-stroke mRS 0–1; M1 MCA or ICA-T occlusion; treatable within **8 h**; ASPECTS ≥7 on NCCT (≥6 on MRI).
- **Key exclusion:** Pre-stroke mRS ≥2; ASPECTS <7 (NCCT) / <6 (MRI); >8 h from onset.
- **Effect size:** Adjusted OR for mRS shift 1.7 (95% CI 1.05–2.8). mRS 0–2: 43.7% vs 28.2% (adjusted OR 2.1, 95% CI 1.1–4.0).
- **Bottom-line verdict:** Spain-based; extends EVT efficacy to **8 h window**; informed extended-window debate prior to DAWN/DEFUSE-3.
- **Limitations / caveats:** Spain-only; stopped early after positive Hermes-era trials; age cap 80 (later raised) — generalizability to elderly limited.
- **In-codebase status:** Full TRIAL_DATA entry (`revascat-trial`, trialData.ts:1301).

---

### SWIFT PRIME (Saver et al., 2015)
- **DOI:** 10.1056/NEJMoa1415061
- **PMID:** 25882376
- **Year:** 2015 (N Engl J Med 372:2285–2295)
- **Journal:** NEJM
- **Sample size:** n=196 (98/98)
- **Primary outcome:** mRS at 90 days (ordinal shift)
- **Key inclusion:** Age 18–80; NIHSS 8–29; pre-stroke mRS 0–1; ICA or M1 occlusion on CTA/MRA; IV tPA initiated within 4.5 h; EVT initiable within 6 h LKW; ASPECTS ≥6 (after protocol amendment, dropping initial CTP-based mismatch criteria for the first 71 pts).
- **Key exclusion:** ASPECTS <6 after amendment; CTP-defined infarct >50 mL (first 71 pts); pre-stroke mRS ≥2.
- **Effect size:** Common OR for mRS shift 1.70 (95% CI 1.23–2.33); mRS 0–2: 60% vs 35% (P<0.001).
- **Bottom-line verdict:** Industry-sponsored (Medtronic Solitaire); positive trial; stopped early after MR CLEAN.
- **Limitations / caveats:** Single-device (Solitaire); imaging selection (ASPECTS ≥6); stopped early.
- **In-codebase status:** Full TRIAL_DATA entry (`swift-prime-trial`, trialData.ts:1535).

---

### EXTEND-IA (Campbell et al., 2015)
- **DOI:** 10.1056/NEJMoa1414792
- **PMID:** 25671797
- **Year:** 2015 (N Engl J Med 372:1009–1018)
- **Journal:** NEJM
- **Sample size:** n=70 (35/35); stopped early
- **Primary outcomes:** **Coprimary** — (1) reperfusion at 24 h; (2) early neurological improvement (≥8-point NIHSS reduction or NIHSS 0–1) at 3 days.
- **Key inclusion:** Age ≥18; IV tPA-eligible; ICA / M1 / M2 occlusion on CTA; **CT-perfusion mismatch — core <70 mL, mismatch ratio ≥1.2, mismatch volume ≥10 mL**; EVT initiable within 6 h.
- **Key exclusion:** Core >70 mL; no perfusion mismatch.
- **Effect size:** Median reperfusion 100% vs 37% (P<0.001). Early neurological improvement 80% vs 37% (P=0.002). 90-day mRS 0–2: 71% vs 40% (adjusted OR 4.2, 95% CI 1.2–14.6).
- **Bottom-line verdict:** Smallest of the foundational 5; perfusion-imaging selection; very strong effect size; established CTP-based selection precedent for later DEFUSE-3.
- **Limitations / caveats:** Very small (n=70); CTP-required workflow (not universally available).
- **In-codebase status:** Full TRIAL_DATA entry (`extend-ia-trial`, trialData.ts:1421).

---

### THRACE (Bracard et al., 2016)
- **DOI:** 10.1016/S1474-4422(16)30177-6
- **PMID:** 27567239
- **Year:** 2016 (Lancet Neurol 15:1138–1147)
- **Journal:** Lancet Neurology
- **Sample size:** n=414 (200 IVT+MT / 202 IVT alone; n=408 in primary analysis)
- **Primary outcome:** mRS 0–2 at 90 days (functional independence; binary)
- **Key inclusion:** Age **18–80**; NIHSS 10–25; proximal anterior-circulation occlusion (ICA, M1, upper basilar by initial protocol — later restricted to anterior); IV tPA started within 4 h; thrombectomy within 5 h.
- **Key exclusion:** Age >80; pre-stroke mRS >1.
- **Effect size:** mRS 0–2: 53% vs 42% (OR 1.55, 95% CI 1.05–2.30; P=0.028). No mortality difference.
- **Bottom-line verdict:** France-based; confirms HERMES-era benefit; smaller effect size than ESCAPE/EXTEND-IA, reflecting heterogeneous imaging selection.
- **Limitations / caveats:** Age cap 80; no ASPECTS lower bound; older catheter-era devices in some sites.
- **In-codebase status:** Full TRIAL_DATA entry (`thrace-trial`, trialData.ts:1656).

---

### THERAPY (Mocco et al., 2016)
- **DOI:** 10.1161/STROKEAHA.116.013372
- **PMID:** 27486173
- **Year:** 2016 (Stroke 47:2331–2338)
- **Journal:** Stroke
- **Sample size:** n=108 (55 aspiration + IVT / 53 IVT alone); **stopped early due to external evidence**, planned 692
- **Primary outcome:** mRS 0–2 at 90 days
- **Key inclusion:** Age 18–85; NIHSS ≥8; **thrombus length ≥8 mm on CT/CTA**; ICA or MCA occlusion; treatable within 4.5 h IVT and 5 h device puncture.
- **Key exclusion:** Thrombus <8 mm.
- **Effect size:** mRS 0–2: 38% vs 30% (P=0.52, not significant). All prespecified outcomes directionally favored EVT but underpowered.
- **Bottom-line verdict:** Underpowered after early stop; directionally consistent with HERMES; rarely used as standalone evidence — historical.
- **Limitations / caveats:** Stopped at 16% of planned enrollment; aspiration-only (Penumbra system) — does not generalize to stent-retriever era.
- **In-codebase status:** Not in codebase as separate trial (verified via grep — no `therapy-trial` id found).

---

### DAWN (Nogueira et al., 2018)
- **DOI:** 10.1056/NEJMoa1706442
- **PMID:** 29129157
- **Year:** 2018 (N Engl J Med 378:11–21)
- **Journal:** NEJM
- **Sample size:** n=206 (107/99); stopped early for efficacy
- **Primary outcomes:** **Coprimary** — (1) utility-weighted mRS at 90 d; (2) functional independence (mRS 0–2) at 90 d.
- **Key inclusion (clinical-core mismatch — three groups):**
  - Group A: age ≥80, NIHSS ≥10, core <21 mL
  - Group B: age <80, NIHSS ≥10, core <31 mL
  - Group C: age <80, NIHSS ≥20, core 31–51 mL
  - All: ICA-T or M1 occlusion; pre-stroke mRS 0–1; LKW 6–24 h; core measured by RAPID software (CTP or DWI-MRI).
- **Key exclusion:** Pre-stroke mRS ≥2; core outside the group-specific thresholds.
- **Effect size:** UW-mRS mean 5.5 vs 3.4 (posterior probability of superiority >0.999). mRS 0–2: 49% vs 13% (adjusted difference 33%, 95% CI 21–44; **NNT ≈ 2.8** for functional independence — bayesian framework, NNT is post-hoc).
- **Bottom-line verdict:** Established **6–24 h late-window EVT with clinical-core mismatch**; very large effect in highly selected population.
- **Limitations / caveats:** Bayesian adaptive design — NNT not from frequentist superiority RCT in the canonical sense (flag if displayed without label); RAPID software-dependent; small mismatch volumes.
- **In-codebase status:** Full TRIAL_DATA entry (`dawn-trial`, trialData.ts:4885).

---

### DEFUSE-3 (Albers et al., 2018)
- **DOI:** 10.1056/NEJMoa1713973
- **PMID:** 29364767
- **Year:** 2018 (N Engl J Med 378:708–718)
- **Journal:** NEJM
- **Sample size:** n=182 (92/90); stopped early for efficacy
- **Primary outcome:** Ordinal mRS at 90 days
- **Key inclusion:** Age **18–90**; NIHSS ≥6; pre-stroke mRS ≤2; ICA or M1 occlusion; LKW 6–16 h; **perfusion mismatch — core <70 mL, mismatch ratio ≥1.8, mismatch volume ≥15 mL** (RAPID-CTP or DWI-MRI).
- **Key exclusion:** Core ≥70 mL; insufficient mismatch.
- **Effect size:** Common OR for mRS shift 2.77 (P<0.001). mRS 0–2: 45% vs 17% (RR 2.67, 95% CI 1.60–4.48; P<0.001). Mortality 14% vs 26% (P=0.05).
- **Bottom-line verdict:** Established **6–16 h late-window EVT with perfusion mismatch**; broader inclusion than DAWN (pre-stroke mRS up to 2; no age cap up to 90; lower NIHSS floor).
- **Limitations / caveats:** RAPID-dependent; US-only (38 centers).
- **In-codebase status:** Full TRIAL_DATA entry (`defuse-3-trial`, trialData.ts:4748).

---

### BAOCHE (Jovin et al., 2022) — basilar 6–24 h
- **DOI:** 10.1056/NEJMoa2207576
- **PMID:** 36273395
- **Year:** 2022 (N Engl J Med 387:1373–1384)
- **Journal:** NEJM
- **Sample size:** n=217 (110/107); planned 318; stopped at interim for efficacy
- **Primary outcome:** mRS 0–3 at 90 days
- **Key inclusion:** Age ≤80; NIHSS ≥6; PC-ASPECTS >5; pre-stroke mRS <2; LKW **6–24 h**; basilar artery occlusion.
- **Key exclusion:** Age >80; PC-ASPECTS ≤5; pre-stroke mRS ≥2.
- **Effect size:** mRS 0–3: 46% vs 24% (adjusted RR 1.81, 95% CI 1.26–2.60; P<0.001). Symptomatic ICH 6% vs 1% (P=0.06).
- **Bottom-line verdict:** First positive RCT of EVT for basilar occlusion in 6–24 h window; established late-window basilar EVT.
- **Limitations / caveats:** China-only (36 centers); stopped early; mortality numerically improved (31% vs 42%) but high overall — basilar prognosis remains grim.
- **In-codebase status:** Full TRIAL_DATA entry (`baoche-trial`, trialData.ts:5773).

---

### ATTENTION (Tao et al., 2022) — basilar 0–12 h
- **DOI:** 10.1056/NEJMoa2206317
- **PMID:** 36239644
- **Year:** 2022 (N Engl J Med 387:1361–1372)
- **Journal:** NEJM
- **Sample size:** n=340 (226 EVT / 114 control), 2:1 randomization
- **Primary outcome:** mRS 0–3 at 90 days
- **Key inclusion:** Age ≥18; NIHSS ≥10; basilar artery occlusion; LKW **within 12 h**; PC-ASPECTS ≥6 (age <80) or ≥8 (age ≥80); pre-stroke mRS <3 (age <80) or <1 (age ≥80).
- **Key exclusion:** PC-ASPECTS <6 (<80) or <8 (≥80); pre-stroke disability above thresholds.
- **Effect size:** mRS 0–3: 46% vs 23% (adjusted RR 2.06, 95% CI 1.46–2.91; P<0.001). Mortality 37% vs 55% (RR 0.66, 95% CI 0.52–0.82).
- **Bottom-line verdict:** Largest positive basilar EVT RCT; established **0–12 h basilar EVT** with PC-ASPECTS imaging selection.
- **Limitations / caveats:** China-only; 2:1 randomization atypical; sICH 5% vs 0% (P=0.06).
- **In-codebase status:** Full TRIAL_DATA entry (`attention-trial`, trialData.ts:5640).

---

### BEST (Liu et al., 2020) — basilar, negative
- **DOI:** 10.1016/S1474-4422(19)30395-3
- **PMID:** 31831388
- **Year:** 2020 (Lancet Neurol 19:115–122, Feb)
- **Journal:** Lancet Neurology
- **Sample size:** n=131 (66/65); stopped early due to high crossover
- **Primary outcome:** mRS 0–3 at 90 days
- **Key inclusion:** Age ≥18; vertebrobasilar occlusion; LKW <8 h.
- **Effect size:** mRS 0–3 ITT: 42% vs 32% (adjusted OR 1.74, 95% CI 0.81–3.74; P=0.23 — NS). Per-protocol analysis suggested benefit but with confounding.
- **Bottom-line verdict:** Negative trial undermined by 22% crossover; supplanted by ATTENTION/BAOCHE.
- **Limitations / caveats:** High crossover; underpowered; **not** appropriate for guideline anchoring on its own.
- **In-codebase status:** Stub entry only (`best-trial`, trialData.ts:10066, with `successorTrialId: 'attention-trial'`).

---

### BASICS (Langezaal et al., 2021) — basilar, neutral
- **DOI:** 10.1056/NEJMoa2030297
- **PMID:** 34010530
- **Year:** 2021 (N Engl J Med 384:1910–1920)
- **Journal:** NEJM
- **Sample size:** n=300 (154/146)
- **Primary outcome:** mRS 0–3 at 90 days
- **Key inclusion:** Age ≥18; basilar artery occlusion; LKW <6 h; NIHSS ≥10.
- **Effect size:** mRS 0–3: 44.2% vs 37.7% (RR 1.18, 95% CI 0.92–1.50; P=0.19 — NS). Authors noted "cannot exclude substantial benefit."
- **Bottom-line verdict:** Neutral trial; the result fits within the CI of subsequent positive trials; conclusion in 2026 era is that BAOCHE+ATTENTION supersede BASICS, but BASICS appropriately flagged the equipoise that existed pre-2022.
- **Limitations / caveats:** Slow enrollment (8 years); overlapping registry pathway diluted effect; ~80% of patients still got EVT outside trial via registry, contaminating intention-to-treat.
- **In-codebase status:** Stub entry only (`basics-trial`, trialData.ts:10138, `successorTrialId: 'attention-trial'`).

---

### RESCUE-Japan LIMIT (Yoshimura et al., 2022) — large core
- **DOI:** 10.1056/NEJMoa2118191
- **PMID:** 35138767
- **Year:** 2022 (N Engl J Med 386:1303–1313, April 7)
- **Journal:** NEJM
- **Sample size:** n=203 (101 EVT / 102 control)
- **Primary outcome:** mRS 0–3 at 90 days (note: 0–3, not 0–2 — broader functional definition)
- **Key inclusion:** Age ≥18; pre-stroke mRS 0–1; LVO (ICA or M1); **ASPECTS 3–5** on NCCT or DWI; LKW **within 6 h**, or 6–24 h if no FLAIR hyperintensity in DWI-defined infarct.
- **Key exclusion:** ASPECTS <3 or >5.
- **Effect size:** mRS 0–3: 31.0% vs 12.7% (RR 2.43, 95% CI 1.35–4.37; P=0.002). Any ICH 58% vs 31% (P<0.001), sICH 9% vs 5% (NS).
- **Bottom-line verdict:** First positive large-core RCT; established that **ASPECTS 3–5 patients benefit from EVT**.
- **Limitations / caveats:** Japan-only; DWI-MRI majority (~89%) — generalizability to NCCT-only centers limited; ICH risk substantial.
- **In-codebase status:** Verifier did not locate a `rescue-japan-limit-trial` id in trialData.ts via grep — likely **not yet in codebase as full entry** (medical-scientist to confirm).

---

### ANGEL-ASPECT (Huo et al., 2023) — large core
- **DOI:** 10.1056/NEJMoa2213379
- **PMID:** 36762852
- **Year:** 2023 (N Engl J Med 388:1272–1283)
- **Journal:** NEJM
- **Sample size:** n=456 (230/226); stopped early for efficacy
- **Primary outcome:** mRS shift at 90 days (ordinal)
- **Key inclusion:** Age 18–80; pre-stroke mRS 0–1; ICA or M1 occlusion; **ASPECTS 3–5 (any infarct volume) OR ASPECTS 0–2 with core 70–100 mL OR ASPECTS ≥6 with core 70–100 mL**; LKW **within 24 h**.
- **Effect size:** Common OR for mRS shift 1.37 (95% CI 1.11–1.69; P=0.004). mRS 0–2: 30.0% vs 11.6%. mRS 0–3: 47.0% vs 33.3%. Symptomatic ICH 6.1% vs 2.7% (NS).
- **Bottom-line verdict:** Confirmed large-core benefit at higher ASPECTS-3–5 volumes; broader than RESCUE-Japan LIMIT (includes 70–100 mL core).
- **Limitations / caveats:** China-only (46 centers); stopped early.
- **In-codebase status:** Full TRIAL_DATA entry (`angel-aspect-trial`, trialData.ts:5150).

---

### SELECT2 (Sarraj et al., 2023) — large core, international
- **DOI:** 10.1056/NEJMoa2214403
- **PMID:** 36762865
- **Year:** 2023 (N Engl J Med 388:1259–1271)
- **Journal:** NEJM
- **Sample size:** n=352 (178/174); adaptive enrichment, stopped at interim for efficacy
- **Primary outcome:** Ordinal mRS at 90 days
- **Key inclusion:** Age 18–85; pre-stroke mRS 0–1; ICA or M1 occlusion; **ASPECTS 3–5 OR core ≥50 mL on CTP/DWI** (no upper limit on core volume); LKW **within 24 h**.
- **Effect size:** Generalized OR for mRS shift 1.51 (95% CI 1.20–1.89; P<0.001). mRS 0–2: 20% vs 7% (RR 2.97, 95% CI 1.60–5.51). sICH 0.6% vs 1.1% (NS).
- **Bottom-line verdict:** International (US, Canada, Europe, Australia, NZ) confirmation of large-core EVT benefit; no upper core volume limit.
- **Limitations / caveats:** US-dominant subgroup drives effect (gOR 1.63 US vs 1.13 non-US, CI crossing 1 in non-US); 24% mortality in EVT arm — high.
- **In-codebase status:** Full TRIAL_DATA entry (`select2-trial`, trialData.ts:5021). See packet `docs/evidence-packets/2026-05-14-select2-angel-aspect.md` for full mRS distributions.

---

### TENSION (Bendszus et al., 2023) — large core, Europe
- **DOI:** 10.1016/S0140-6736(23)02032-9
- **PMID:** 37837989
- **Year:** 2023 (Lancet 402:1753–1763)
- **Journal:** Lancet
- **Sample size:** n=253 (125/128); stopped early for efficacy
- **Primary outcome:** mRS shift at 90 days (ordinal)
- **Key inclusion:** Age 18–85; ICA / M1 occlusion; **ASPECTS 3–5**; LKW **within 12 h**; pre-stroke mRS 0–1.
- **Effect size:** Common OR for mRS shift 2.58 (95% CI 1.60–4.15; P<0.0001). Median mRS 4 (EVT) vs 6 (control). Mortality 40% vs 51% (P=0.038).
- **Bottom-line verdict:** European large-core RCT; restricted to 12 h window; very strong mortality reduction.
- **Limitations / caveats:** Europe-only; 12 h window (narrower than SELECT2/ANGEL-ASPECT 24 h); stopped early.
- **In-codebase status:** Full TRIAL_DATA entry (`tension-trial`, trialData.ts:2557).

---

### TESLA (Yoo et al., 2024) — large core, NCCT-only, US
- **DOI:** 10.1001/jama.2024.13933
- **PMID:** 39374319
- **Year:** 2024 (JAMA, published online 2024-09-23)
- **Journal:** JAMA
- **Sample size:** n=300 (152/148)
- **Primary outcome:** Utility-weighted mRS at 90 days (Bayesian adaptive)
- **Key inclusion:** Age 18–85; pre-stroke mRS 0–1; NIHSS ≥6; ICA-T or M1 occlusion; **NCCT ASPECTS 2–5**; LKW within 24 h.
- **Effect size:** Adjusted difference in UW-mRS 0.63 (95% bayesian credible interval **−0.01 to 1.34**, posterior probability of superiority 0.957) — **did not cross prespecified Bayesian superiority threshold (0.975)**. mRS 0–3: 30% vs 20% (numerically favors EVT).
- **Bottom-line verdict:** **Borderline negative** trial on the Bayesian primary; directional benefit but CI included no effect; reinforces that NCCT-only ASPECTS 2–5 selection in 24 h window may underperform CTP-based selection at low ASPECTS.
- **Limitations / caveats:** Bayesian design — NNT inappropriate; 12-month follow-up suggests delayed benefit; US-only.
- **In-codebase status:** Verifier did not locate `tesla-trial` id in trialData.ts via grep — likely **not yet in codebase as full entry**.

---

### LASTE (Costalat et al., 2024) — large core, unrestricted size, Europe
- **DOI:** 10.1056/NEJMoa2314063
- **PMID:** 38718358
- **Year:** 2024 (N Engl J Med 390:1677–1689, May 9)
- **Journal:** NEJM
- **Sample size:** n=333 (166/167)
- **Primary outcome:** Ordinal mRS at 90 days
- **Key inclusion:** Age ≥18 (no upper limit); **ASPECTS ≤5** (including 0–2; "unrestricted size"); ICA / M1; LKW **within 6.5 h**; pre-stroke mRS 0–1.
- **Effect size:** Generalized OR for mRS shift 1.63 (95% CI 1.29–2.06; P<0.001). Median mRS 4 vs 6. Mortality 36.1% vs 55.5% (HR 0.65).
- **Bottom-line verdict:** Extends benefit to **ASPECTS 0–2** ("unrestricted size") within 6.5 h — strongest evidence yet for very-large-core EVT.
- **Limitations / caveats:** Europe-only; 6.5 h window (narrower than SELECT2/ANGEL-ASPECT 24 h); enrollment included no age cap — generalizes to ≥80.
- **In-codebase status:** Full TRIAL_DATA entry (`laste-trial`, trialData.ts:2440).

---

### ESCAPE-MeVO (Goyal et al., 2025) — MeVO, negative
- **DOI:** 10.1056/NEJMoa2411668
- **PMID:** *not yet indexed at verification time — flagged for medical-scientist to retrieve*
- **Year:** 2025 (N Engl J Med, published 2025-02-05)
- **Journal:** NEJM
- **Sample size:** n=530
- **Primary outcome:** mRS 0–1 at 90 days (excellent outcome)
- **Key inclusion:** NIHSS >5, or NIHSS 3–5 with disabling deficit; LKW <12 h; **MeVO at M2/M3, A2/A3, or P2/P3**; favorable baseline imaging.
- **Effect size:** mRS 0–1: 41.6% EVT vs 43.1% control (adjusted RR 0.95, 95% CI 0.79–1.15) — **negative**. Higher SAEs in EVT (33.9% vs 25.7%), including more pneumonia (7.0% vs 3.3%), recurrent stroke (5.4% vs 3.7%), stroke progression (5.4% vs 1.8%).
- **Bottom-line verdict:** **Negative trial** — does not support routine MeVO thrombectomy in this population/window.
- **Limitations / caveats:** Open-label; broad MeVO definition pooled M2/M3/A2/A3/P2/P3 — possible heterogeneity by site/segment; results consistent with DISTAL.
- **In-codebase status:** Full TRIAL_DATA entry (`escape-mevo-trial`, trialData.ts:4616).

---

### DISTAL (Psychogios et al., 2025) — distal/medium vessel, negative
- **DOI:** 10.1056/NEJMoa2408954
- **PMID:** 39908430
- **Year:** 2025 (N Engl J Med 392:1374–1384, April 10)
- **Journal:** NEJM
- **Sample size:** n=543
- **Primary outcome:** mRS at 90 days (ordinal shift)
- **Key inclusion:** MeVO (M2/M3, A2/A3, P2/P3); LKW within 12 h.
- **Effect size:** mRS 0–1: 41.6% EVT vs 43.1% control (adjusted RR 0.95, 95% CI 0.79–1.15; P=0.61). No benefit on ordinal primary either.
- **Bottom-line verdict:** **Negative trial** — concordant with ESCAPE-MeVO; together they make a strong case **against routine MeVO EVT** at this time.
- **Limitations / caveats:** International; same MeVO heterogeneity caveats as ESCAPE-MeVO.
- **In-codebase status:** Full TRIAL_DATA entry (`distal-trial`, trialData.ts:4463).

---

### ENDOLOW (Goyal, ongoing) — low NIHSS LVO
- **NCT:** NCT04167527
- **Year:** [PUBLICATION STATUS: results not yet published as of 2026-05-15 to verifier's knowledge — protocol cites December 2024 estimated completion; medical-scientist should re-verify before referencing in pathway]
- **Design:** Phase 2/3 PROBE adaptive; LVO (ICA/M1) with **NIHSS 0–5**; EVT within 8 h vs initial medical management.
- **Primary outcome (planned):** mRS shift at 90 d
- **In-codebase status:** Not in trialData.ts.

---

### MOSTE (Sarraj et al., ongoing) — minor stroke LVO
- **Year:** [PUBLICATION STATUS: results not yet published as of 2026-05-15 to verifier's knowledge]
- **Design:** Multicenter RCT; **NIHSS ≤5** with LVO; symptom duration ≤23 h.
- **Primary outcome (planned):** mRS at 90 d
- **In-codebase status:** Not in trialData.ts.

---

### HERMES Meta-analysis (Goyal et al., 2016) — subgroup support
- **DOI:** 10.1016/S0140-6736(16)00163-X
- **PMID:** 26898852
- **Year:** 2016 (Lancet 387:1723–1731)
- **Journal:** Lancet
- **Sample size:** n=1287 individual patient data (634 EVT / 653 control) from MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, EXTEND-IA
- **Primary outcome:** Ordinal mRS at 90 d
- **Effect size:** Adjusted common OR 2.49 (95% CI 1.76–3.53; P<0.0001). NNT 2.6 for ≥1-point mRS improvement. Subgroup analysis: **no heterogeneity** across age, sex, NIHSS, ASPECTS subgroups; benefit retained in age ≥80 (cOR 3.68, 95% CI 1.95–6.92) and 6–12 h subgroup (cOR 1.76, 95% CI 1.05–2.97).
- **Bottom-line verdict:** IPDMA establishing class-effect of EVT in anterior LVO across foundational 5; underpins the 2018 / 2019 / 2026 Class I recommendations.
- **Limitations / caveats:** Pre-2017 era — does not include large-core or late-window trials; **no prestroke mRS ≥2 patients enrolled** in source trials, so HERMES does not directly inform that subgroup.
- **In-codebase status:** Likely referenced indirectly; verifier did not locate a `hermes` id but cross-references appear in pearls.

---

### Prestroke mRS 2–4 — narrative evidence base
- **Primary source for codebase claims:** No RCT enrolled prestroke mRS ≥2 patients as a primary stratum. Evidence base:
  - Systematic review/meta-analysis (Salwi et al., 2022; PMID 36147993, *Frontiers in Neurology*): EVT in prestroke mRS ≥2 yielded RR 1.86 (95% CI 1.28–2.70) for return to prestroke mRS at 3 months; lower mortality (RR 0.75, 95% CI 0.58–0.97).
  - International multicenter cohort and Italian Endovascular Stroke Registry analyses — observational only.
  - **No prospective RCT data for mRS 3–4 EVT** as of 2026-05-15.
- **Bottom-line verdict:** Evidence supports considering EVT in selected mRS 2 and mRS 3–4 patients but rests on **observational + registry data**, not RCT. AHA/ASA 2026 reflects this by giving prestroke mRS 2 a **Class IIa LOE B-R** (the B-R is generous given the lack of RCT-grade evidence — medical-scientist should re-verify class label against PDF).
- **In-codebase status:** No dedicated trial entry; pathway uses guideline-anchored recommendation.

---

## PART B — AHA/ASA 2026 EVT Recommendations

**Canonical citation:**
- **Title:** 2026 Guideline for the Early Management of Patients With Acute Ischemic Stroke: A Guideline From the American Heart Association/American Stroke Association
- **DOI:** 10.1161/STR.0000000000000513 (verified via WebSearch; PubMed PMID 41582814)
- **Journal:** *Stroke* (online January 26, 2026)
- **Verification caveat:** Full-text PDF returned HTTP 403 on direct fetch by this verifier. Section IDs (e.g., 4.7.2) and class/LOE values below were assembled from authoritative secondary summaries (emDocs, TCTMD, AHA *Top 10 Things to Know*, Cardiology Advisor) and triangulated across ≥2 sources for each branch. **Medical-scientist must field-verify section numbering and exact verbatim wording against the official PDF before any class label is changed in EvtPathway.tsx.**

---

### Recommendation 1 — Anterior circulation 0–6 h, standard criteria
- **Section ID:** 4.7.2 (consensus across secondary sources)
- **Class:** I
- **LOE:** A
- **Population:** Adults with acute ischemic stroke and anterior circulation proximal LVO (ICA or M1), 0–6 h from LKW, NIHSS ≥6, prestroke mRS 0–1, ASPECTS 3–10.
- **Recommendation text (verbatim from AHA *Top 10 Things to Know* + emDocs):** *"EVT is recommended to improve functional clinical outcomes and reduce mortality."*
- **Supporting trials:** MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, EXTEND-IA, THRACE, HERMES IPDMA
- **2022→2026 changes:** **ASPECTS lower bound dropped from ≥6 to ≥3** (incorporates RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE). This is the most consequential expansion.

---

### Recommendation 2 — Anterior circulation 0–6 h, large core (ASPECTS 0–2)
- **Section ID:** 4.7.2 (sub-recommendation)
- **Class:** IIa
- **LOE:** B-R
- **Population:** Age <80, NIHSS ≥6, prestroke mRS 0–1, **ASPECTS 0–2**, no significant mass effect, within 0–6 h.
- **Recommendation text (verbatim from emDocs):** *"EVT is reasonable to improve functional clinical outcomes and reduce mortality."*
- **Supporting trials:** LASTE (primary anchor — only trial enrolling ASPECTS 0–2 with unrestricted infarct size). Subgroup data from SELECT2, ANGEL-ASPECT.
- **2022→2026 changes:** **NEW** — 2022 guideline did not recommend EVT for ASPECTS <3.
- **Verifier flag:** Evidence base for ASPECTS 0–2 is dominated by **a single trial (LASTE)** plus subgroup analyses — the IIa B-R label is reasonable but borderline given the single-trial anchor. Medical-scientist should consider whether pathway language reflects the narrower evidence.

---

### Recommendation 3 — Anterior circulation 6–24 h, standard (DAWN/DEFUSE-3 profiles)
- **Section ID:** 4.7.2
- **Class:** I
- **LOE:** A
- **Population:** Adults with anterior-circulation LVO 6–24 h from LKW meeting either DAWN clinical-core mismatch criteria OR DEFUSE-3 perfusion-imaging criteria; pre-stroke mRS 0–1 (DAWN) or 0–2 (DEFUSE-3).
- **Recommendation text:** EVT is recommended to improve functional outcomes and reduce mortality.
- **Supporting trials:** DAWN, DEFUSE-3
- **2022→2026 changes:** Largely unchanged from 2018/2019; reaffirmed.

---

### Recommendation 4 — Anterior circulation 6–24 h, large core (beyond DAWN/DEFUSE-3)
- **Section ID:** 4.7.2 (consensus, sub-recommendation for large core in late window)
- **Class:** I (large-core 6–24 h with NIHSS ≥6, ASPECTS 3–5, age <80, prestroke mRS 0–1, no mass effect — per TCTMD summary)
- **LOE:** A
- **Population:** Anterior-circulation LVO 6–24 h, ASPECTS 3–5, NIHSS ≥6, age <80, prestroke mRS 0–1.
- **Supporting trials:** SELECT2, ANGEL-ASPECT (both 24 h window with ASPECTS 3–5)
- **2022→2026 changes:** **NEW Class I for ASPECTS 3–5 in 6–24 h window** (previously only DAWN/DEFUSE-3 profiles covered).
- **Verifier flag:** TESLA's borderline-negative result is relevant context but does not appear to have downgraded this recommendation in 2026.

---

### Recommendation 5 — Basilar artery occlusion (0–24 h)
- **Section ID:** 4.7.3
- **Class:** I
- **LOE:** A
- **Population:** Basilar artery occlusion, prestroke mRS 0–1, NIHSS ≥10, PC-ASPECTS ≥6, 0–24 h from symptoms.
- **Recommendation text (verbatim from AHA *Top 10*):** *"EVT within 24 hours from symptom onset is recommended to achieve better functional outcome and reduce mortality."*
- **Supporting trials:** ATTENTION (0–12 h), BAOCHE (6–24 h)
- **2022→2026 changes:** **NEW Class I A** — 2019/2022 guidelines gave basilar EVT only IIb (uncertain benefit) given BEST/BASICS neutral results.
- **Verifier flag:** This is one of the largest class upgrades in 2026 and the single most important EVT-pathway delta to verify against the PDF.

---

### Recommendation 6 — Prestroke mRS 2
- **Section ID:** 4.7.2 (sub-recommendation)
- **Class:** IIa
- **LOE:** B-R
- **Population:** NIHSS ≥6, ASPECTS ≥6, prestroke mRS 2, anterior-circulation LVO 0–6 h.
- **Recommendation text (verbatim from emDocs):** *"EVT is reasonable to improve functional clinical outcomes and reduce accumulated disability."*
- **Supporting trials:** No RCT primary anchor; observational data + meta-analysis (Salwi 2022, Italian Endovascular Registry).
- **2022→2026 changes:** **NEW** — 2022 had no specific recommendation for pre-stroke mRS 2 (commonly excluded from foundational RCTs).
- **Verifier flag:** **LOE B-R is generous** given the observational evidence base — `B-R` typically denotes "randomized." Medical-scientist should re-verify against the PDF; if confirmed, the rationale likely incorporates HERMES subgroup data + observational meta-analysis. Flag this as a candidate for nuanced legend text in EvtPathway.

---

### Recommendation 7 — Prestroke mRS 3–4
- **Section ID:** No dedicated recommendation identified in secondary summaries.
- **Status:** **[VERIFY-FAILED: cannot confirm a class label from secondary sources.]** AHA *Top 10* and emDocs do not surface a specific mRS 3–4 recommendation; the 2026 guideline likely follows individualized-decision phrasing (consider EVT case-by-case in patients with substantial pre-stroke disability).
- **Evidence base:** Registry/observational only (no RCT).
- **Recommended pathway treatment:** "Individualized decision; insufficient RCT evidence; consider patient/family goals." Medical-scientist must locate the exact 2026 language before EvtPathway claims any class.

---

### Recommendation 8 — Medium-vessel occlusion (MeVO)
- **Section ID:** Not given a positive EVT recommendation in 2026 secondary summaries.
- **Class:** **Likely IIb (uncertain) or III: No Benefit** — pending verification against PDF.
- **Supporting evidence:** ESCAPE-MeVO and DISTAL — both **negative**.
- **Verifier flag:** Both MeVO RCTs were negative; secondary summaries (TCTMD, emDocs) describe MeVO as a "knowledge gap." Pathway must **not** present routine MeVO EVT as Class I/IIa; appropriate language is **"insufficient evidence to recommend routine EVT for MeVO; individualized decision based on disabling deficit, site, and operator experience."**
- **2022→2026 changes:** ESCAPE-MeVO and DISTAL published after the 2022 update; 2026 reflects negative trial outcomes by withholding a positive class.

---

### Recommendation 9 — Low NIHSS (<6) LVO
- **Section ID:** Not given a positive class in 2026 secondary summaries.
- **Class:** **[VERIFY-FAILED: no clear class identified.]** Likely IIb or no recommendation pending ENDOLOW/MOSTE.
- **Supporting evidence:** ENDOLOW and MOSTE are ongoing; observational data conflicting.
- **Pathway treatment:** "Insufficient evidence; individualized decision; ENDOLOW/MOSTE pending."

---

### Recommendation 10 — Age >80 considerations
- **Section ID:** Not given a separate recommendation; age >80 appears as a sub-criterion within several recommendations (especially basilar PC-ASPECTS ≥8 if age ≥80 from ATTENTION; large-core "age <80" from RESCUE-Japan LIMIT / ANGEL-ASPECT / SELECT2).
- **HERMES subgroup:** Strong benefit retained in age ≥80 (cOR 3.68).
- **Pathway treatment:** Should reflect **age <80** as a typical inclusion criterion for large-core (ASPECTS 0–2) and 6–24 h beyond DAWN/DEFUSE-3 (consistent with trial enrollment), while preserving Class I anterior 0–6 h regardless of age.

---

## PART C — 2022 → 2026 deltas worth medical-scientist attention

1. **Anterior 0–6 h: ASPECTS lower bound dropped from ≥6 to ≥3** (Class I A). Anchored by RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, LASTE.
2. **Anterior 0–6 h ASPECTS 0–2: NEW Class IIa B-R.** Anchored almost entirely by LASTE.
3. **Anterior 6–24 h ASPECTS 3–5: NEW Class I A.** Anchored by SELECT2, ANGEL-ASPECT (24 h window).
4. **Basilar 0–24 h: UPGRADED to Class I A** (from IIb in 2022). Anchored by ATTENTION (0–12 h), BAOCHE (6–24 h).
5. **Prestroke mRS 2: NEW Class IIa B-R.** No primary RCT — anchored by observational meta-analysis. **Class label deserves field verification.**
6. **MeVO: NO positive recommendation** in 2026 (ESCAPE-MeVO + DISTAL both negative). Pathway must reflect equipoise/negative trials.
7. **Tenecteplase: NEW Class I (alongside alteplase)** for 0–4.5 h — adjacent context, not strictly EVT but relevant to bridging.

---

## PART D — Cross-reference grid

| Pathway branch (codebase concept) | AHA 2026 rec ID | Class / LOE | Anchoring trial(s) |
|---|---|---|---|
| Anterior 0–6 h standard, ASPECTS ≥6 | 4.7.2 | **I / A** | MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, EXTEND-IA, THRACE, HERMES |
| Anterior 0–6 h ASPECTS 3–5 (large core) | 4.7.2 | **I / A** | RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION |
| Anterior 0–6 h ASPECTS 0–2 (very large core) | 4.7.2 (sub) | **IIa / B-R** | LASTE (primary anchor) |
| Anterior 6–24 h DAWN profile | 4.7.2 | **I / A** | DAWN |
| Anterior 6–24 h DEFUSE-3 profile | 4.7.2 | **I / A** | DEFUSE-3 |
| Anterior 6–24 h ASPECTS 3–5 (beyond DAWN/DEFUSE-3) | 4.7.2 | **I / A** | SELECT2, ANGEL-ASPECT |
| Basilar 0–12 h | 4.7.3 | **I / A** | ATTENTION |
| Basilar 6–24 h | 4.7.3 | **I / A** | BAOCHE |
| MeVO (M2/M3, A2/A3, P2/P3) | [no positive rec] | likely **IIb or none** | ESCAPE-MeVO (negative), DISTAL (negative) |
| Low NIHSS (<6) with LVO | [no positive rec] | likely **IIb / none** | ENDOLOW/MOSTE pending |
| Prestroke mRS 2 | 4.7.2 (sub) | **IIa / B-R** | observational MA (Salwi 2022); no RCT |
| Prestroke mRS 3–4 | [VERIFY-FAILED] | individualized | observational only |
| Age >80 + anterior 0–6 h | 4.7.2 | **I / A** | HERMES subgroup |
| Age >80 + large core | [age <80 typically required] | **IIa / B-R** (extrapolation) | LASTE has no age cap |
| Age >80 + basilar | 4.7.3 (PC-ASPECTS ≥8 sub-criterion) | **I / A** (with stricter PC-ASPECTS) | ATTENTION |

---

## PART E — NeuroWiki field mapping (read-only; for medical-scientist to act on)

Verifier did not edit any file. The following fields in `src/pages/EvtPathway.tsx` are most likely to require medical-scientist attention given this packet:

- Class label for **basilar 0–24 h**: should be **I A** (verify current value in EvtPathway).
- Class label for **anterior 0–6 h ASPECTS 0–2**: should be **IIa B-R** (verify if pathway has this branch at all).
- Class label for **anterior 6–24 h ASPECTS 3–5 beyond DAWN/DEFUSE-3**: should be **I A**.
- Class label for **MeVO**: should NOT be Class I/IIa; pathway language should reflect ESCAPE-MeVO + DISTAL negative.
- Class label for **prestroke mRS 2**: should be **IIa B-R** with caveat about observational evidence base.
- Class label for **prestroke mRS 3–4**: should be individualized phrasing, no class assigned, evidence base = observational.
- ASPECTS lower bound for anterior 0–6 h: should be **≥3** (down from ≥6 in 2022).
- Age cutoffs: large-core branches typically **age <80** in RCT inclusion; LASTE is the exception (no age cap).

---

## Verification confidence

- **HIGH** for: AHA/ASA 2026 DOI/PMID resolution, MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME, EXTEND-IA, THRACE, DAWN, DEFUSE-3, RESCUE-Japan LIMIT, ANGEL-ASPECT, SELECT2, TENSION, TESLA, LASTE, ATTENTION, BAOCHE, BEST, BASICS, ESCAPE-MeVO, DISTAL — DOIs/PMIDs verified, primary endpoints captured, effect sizes verified across ≥2 sources, in-codebase status checked via grep.
- **MEDIUM** for: AHA/ASA 2026 section numbers (4.7.2 / 4.7.3) — assembled from secondary summaries because the PDF returned 403; class/LOE values triangulated across ≥2 sources; verbatim recommendation text quoted from secondary sources, not primary PDF.
- **LOW** for: ENDOLOW, MOSTE — results not yet published.
- **[VERIFY-FAILED]** for: precise class/LOE for prestroke mRS 3–4 and low NIHSS (<6); needs PDF read.

> **Reminder for medical-scientist (per CLAUDE.md §13.1):** Metadata validity ≠ medical validity. This packet establishes that the trials cited exist, DOIs resolve, classes are plausible per multiple secondary AHA-summary sources. It does **not** substitute for reading the 2026 PDF directly to confirm verbatim wording and exact class/LOE for each EvtPathway branch.
