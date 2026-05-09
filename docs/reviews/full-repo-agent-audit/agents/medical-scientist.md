# Medical-Scientist Audit — NeuroWiki Clinical Content

**Date:** 2026-05-08
**Auditor:** medical-scientist (read-only audit)
**Scope:** Sampling of guide content, clinical pearls, trial data, AHA 2026 guideline data, calculator interpretation, and citation governance

> READ-ONLY: No clinical data files were modified. Findings below are recommendations to feed into Class E or `-clinical` workstreams routed through evidence-verifier, trial-statistician, and clinical-reviewer.

---

## Overall rating: **YELLOW**

The clinical content in NeuroWiki is, on the whole, accurate, well-sourced at the prose level (named trials, dates, journals), and reflects current AHA/ASA 2026 (ischemic stroke) and AHA/ASA 2022 (ICH) frames. The 2026 guideline data file is the strongest artifact — verbatim recommendation text with COR/LOE preserved.

The reason this is **not Green**:

1. **No formal citation registry exists.** `src/lib/citations/` per CLAUDE.md §13.2 is not yet populated with `registry.ts` / `claims.ts`. Most clinical surfaces have no `claimId` registered. The `data-claim` JSX attribute pattern is not in use. Several inline `claimId:` comments exist in `trialData.ts` (CHANCE, MR CLEAN-NO IV, DIRECT-SAFE) but they point to a registry that does not exist. **This is the primary governance gap.**
2. A handful of **specific clinical statements are subtly wrong, outdated, or under-caveated** in the pearls and guide content (detailed in the Pearls and Guide Content sections below). These are P1 — clinician-reachable text that could mislead.
3. Several trial entries blur **noninferiority vs superiority framing**, and at least one shows NNT alongside a noninferiority result — a `trial-statistics` skill violation.

The application would not pass the §13.5 pre-commit claim hook today because the registry does not exist; it cannot enforce claim-ID-to-citation mapping until §13.2 is built. Until then, every clinical surface is governed by convention, not enforcement.

---

## Findings by category

### 1. Guide content (`src/data/guideContent.ts`)

| ID | Severity | Location | Description | Recommended next step |
|---|---|---|---|---|
| GC-1 | **P1** | `guideContent.ts:59` (ECASS III pearl) | "modern guidelines often permit treatment in these groups within 3-4.5h after individual risk assessment" — inconsistent with AHA/ASA 2026 framing. The 2026 guideline has updated guidance for age >80 and for patients on antiplatelets, but the prose is vague ("often permit") and unsourced to a specific COR/LOE. | Reword to specify which exclusions are still in force per AHA/ASA 2026 vs which were originally ECASS III protocol-only. Cite Section 4.6 directly. Route through evidence-verifier. |
| GC-2 | **P1** | `guideContent.ts:88` (EXTEND pearl: "Many centers now utilize this protocol for patients < 9 hours who are not thrombectomy candidates") | EXTEND used alteplase, not desmoteplase, despite the lede in the Clinical Context block ("EXTEND tested desmoteplase"). The text contradicts itself — Clinical Context says desmoteplase, Trial Summary correctly says alteplase. | **Factual error in Clinical Context paragraph.** Correct to: "EXTEND tested IV alteplase using perfusion-imaging selection in the 4.5–9h window." Desmoteplase was tested in DIAS/DEDAS, not EXTEND. Class E correction. |
| GC-3 | **P2** | `guideContent.ts:86` (EXTEND pearl: "Tissue Window … more relevant than the rigid time window") | Strong directive language. AHA/ASA 2026 rates extended-window IVT 2a, B-R — "may be considered." The pearl reads as a Class I recommendation. | Soften to match COR 2a / LOE B-R. Add citation to AHA/ASA 2026 Section 4.6 extended-windows. |
| GC-4 | **P2** | `guideContent.ts:115` (THAWS) | "Population Drift: Investigators noted milder strokes …" — paraphrases editorial commentary as a result. This is interpretation of the trial limitations, not a result. | Mark as commentary; cite the specific source for the population-drift observation if retained. |
| GC-5 | **P1** | `guideContent.ts:142` (TRACE-III pearl: "TRACE-III is the primary trial supporting thrombolysis beyond 9 hours for selected LVO patients") | TRACE-III tested 4.5–24h. The claim "beyond 9 hours" is technically correct (24h cap) but the framing implies TRACE-III is the only late-window evidence. AHA/ASA 2026 IVT extended-window recommendations for 4.5–24h LVO without EVT carry COR 2b, LOE B-R — i.e. "may be beneficial." Pearl reads as standard-of-care. | Soften to match COR 2b. Add applicability caveats: Chinese cohort, EVT-unavailable setting only. |

**General observation on guideContent.ts:** Sources cited as plain markdown links (`*Source: [Author Year](URL)*`). No structured citation IDs. Acceptable for a non-governed prose layer, but every clinical claim within these blocks would need a `claimId` per §13.4 once the markdown surface tagging strategy ships (Phase 2).

---

### 2. Clinical pearls (`src/data/strokeClinicalPearls.ts`)

| ID | Severity | Location | Description | Recommended next step |
|---|---|---|---|---|
| CP-1 | **P0** | `strokeClinicalPearls.ts:159` (`contraindications-relative` pearl: "Severe stroke NIHSS >25 (greatest benefit, NNT=3)") | **Clinically dangerous.** Severe stroke NIHSS >25 is a per-protocol exclusion for the 3–4.5h window in ECASS III, and current AHA/ASA 2026 still treats severe deficit as a relative consideration with elevated sICH risk. Stating "greatest benefit, NNT=3" without citation and without time-window qualification is misleading. The "NNT=3" figure is not from a primary trial — it appears to be a derived estimate from severity-stratified subgroup analysis and should not be presented as an established treatment effect. | **Block surface; route to evidence-verifier.** Verify the source for "NNT=3 in NIHSS>25." Either remove, restructure as "subgroup analysis, hypothesis-generating," or replace with a properly-cited figure. Do not ship until clinical-reviewer signs off. |
| CP-2 | **P1** | `strokeClinicalPearls.ts:167` (`doac-management-2026` pearl) tagged `evidenceClass: 'III'` | Class III in AHA framework means "no benefit" or "harm." The text describes when DOAC patients **may** be eligible for tPA — which is a 2a-style permissive recommendation, not a III-Harm. The class label is wrong. | Re-grade. Likely COR 2a/2b, LOE C-LD per AHA/ASA 2026. Confirm exact COR via Section 4.6. |
| CP-3 | **P1** | `strokeClinicalPearls.ts:191` (`stroke-mimics-safety` pearl) plain-English: "Giving tPA to a stroke mimic is safer than withholding tPA from a real stroke. When in doubt, treat." | Directive language overshoots the evidence. The Zinkstok meta-analysis shows low sICH in mimics, but "when in doubt, treat" is broader than what the data supports — and could be acted on at the bedside. | Reword to match evidence: "Diagnostic uncertainty alone should not delay tPA in suspected stroke when standard criteria are met." Remove blanket "treat" directive. |
| CP-4 | **P1** | `strokeClinicalPearls.ts:202` (`pregnancy-tpa` pearl) | "tPA does not cross placenta" — true for high-molecular-weight alteplase, but the cited "Case series: ~15 pregnant women treated, 2 sICH (13%), 8 healthy births (67%)" is a specific numerical claim with no source. | Add citation or remove the numerical case-series claim. Class IIb/Level C is appropriately hedged; the underlying numbers are not. |
| CP-5 | **P2** | `strokeClinicalPearls.ts:243` (`lvo-benefit-quick`: "HERMES: 46% vs 29% good outcome (NNT=2.6)") | HERMES is a meta-analysis of ordinal-shift trials. NNT in this context is reasonable from the binary mRS 0-2 secondary outcome but should be flagged that it derives from the dichotomized outcome, not the ordinal primary. | Add caveat per `trial-statistics` skill: "NNT derived from mRS 0-2 dichotomization; primary HERMES analysis was ordinal shift." |
| CP-6 | **P1** | `strokeClinicalPearls.ts:255` (`cortical-signs-deep`: "Multiple signs (≥2): 89% specificity for M1/M2 occlusion") cites Duvekot et al, Stroke 2021 and is graded Class I, Level B | Cortical-sign clinical assessment is a screening method, not a Class I/Level B recommendation per AHA/ASA. The 2026 guideline rates LVO screening tools (RACE, FAST-ED, etc.) — clinical sign-based detection is a teaching heuristic, not a guideline-graded recommendation. The Class I label is misapplied here. | Remove COR/LOE labels from teaching pearls that are not direct guideline recommendations. Keep the Duvekot citation as evidence for the diagnostic-test characteristics. |
| CP-7 | **P2** | `strokeClinicalPearls.ts:329` (`glucose-only-mandatory`: "Point-of-care glucose is the ONLY mandatory lab before tPA") | Aligns with AHA/ASA 2026 in spirit but is more directive than the guideline. AHA/ASA 2026 says IVT should be initiated as quickly as possible without waiting for additional labs in patients without suspicion of bleeding diathesis. The pearl's binary framing ("ONLY") may not match the guideline qualifier. | Reword to match Section 4.6 phrasing exactly. |
| CP-8 | **P0** | `strokeClinicalPearls.ts:373` (`anticoag-warfarin` pearl) tagged `evidenceClass: 'III'` | Mismatched class label — the pearl describes when warfarin patients **may** be treated, not what is harmful. III is reserved for harm/no-benefit. This is the same problem as CP-2 and recurs. | Audit all `evidenceClass: 'III'` tags across this file. Several are mislabeled. Class E task. |
| CP-9 | **P1** | `strokeClinicalPearls.ts:540` (`sparcl-trial`: "Start high-intensity statin immediately unless ICH") | "Immediately" is more directive than SPARCL evidence supports. Statins for secondary prevention are guideline-recommended; the precise timing ("day 1" in the plain-English) extrapolates beyond what SPARCL tested. | Reword: "Start high-intensity statin during the index hospitalization for ischemic stroke; avoid in ICH per AHA/ASA 2022." |
| CP-10 | **P1** | `strokeClinicalPearls.ts:594` (`artis-trial` evidenceClass: 'III') | This labeling is **correct** here (ARTIS demonstrated harm of early IV aspirin post-tPA). Use this as the calibration anchor when re-grading CP-2 and CP-8. | No change. Reference for re-grading. |
| CP-11 | **P2** | `strokeClinicalPearls.ts:48` (`time-is-brain`: "1.9 million neurons die per minute … Every 15-minute delay reduces probability of good outcome by 4%") | "1.9 million neurons/min" derives from Saver 2006 (Stroke). "4% per 15 min" is loosely from Emberson 2014 / Saver 2010 IST analyses but the exact coupling is not always cited cleanly. | Add explicit Saver 2006 citation for the neuron-loss figure; verify the 4% / 15 min figure source. |

**Pearls file overall:** evidence-class/level tagging is inconsistent. Several pearls labeled Class I that are teaching points, not guideline recommendations. Several labeled Class III that describe permissive use. **Recommend a Class E sweep to re-grade every COR/LOE tag against AHA/ASA 2026 / 2022 ICH source documents.**

---

### 3. Trial data (`src/data/trialData.ts`)

Sampled: NINDS, ORIGINAL, MR CLEAN-NO IV, DIRECT-SAFE, CHANCE, POINT.

| ID | Severity | Location | Description | Recommended next step |
|---|---|---|---|---|
| TR-1 | **P2** | `trialData.ts:441` (NINDS `calculations.nnt: 6.5`) | NINDS NNT calculated from the binary mRS 0-1 outcome (42.6% vs 27.2% → NNT 6.5). Acceptable; binary-superiority design supports NNT. | No change. Confirms the trial-statistics skill rule-set is being followed for NINDS. |
| TR-2 | **P1** | `trialData.ts:486` (ORIGINAL: noninferiority trial, `pValue.value: 'Non-inf', label: 'Margin Met (RR 0.937)'`) | Display labels NI margin met. Good. **However:** verify the trial does not have an NNT field surfaced anywhere in the page renderer for this entry. The trial-statistics skill bans NNT for NI designs. | Cross-check renderer output. If NNT card displays for any noninferiority entry (`primaryDesign: 'noninferiority'`), block. Confirm Option Y suppression rule is wired. |
| TR-3 | **P1** | `trialData.ts:472` (ORIGINAL `applicability.geography`: "China (domestic rhTNK-tPA formulation — not equivalent to international tenecteplase brands)") | Strong and important caveat — but this caveat needs to be visible on the page surface, not just the data layer. | Verify renderer surfaces this caveat in the trial page UI. Critical for clinician interpretation. |
| TR-4 | **P0** | `trialData.ts:2127` (DIRECT-SAFE `howToInterpret.proves`: "adjusted RD -5.1%, 95% CI -15.4% to 5.3%") and adjacent statement "lower CI bound (-15.4%) crossed the pre-specified non-inferiority margin of -12 percentage points" | Need to verify the trial's actual primary outcome wording. Mitchell et al. Lancet 2022 reported adjusted RD of -1.1%, not -5.1%, on the original primary endpoint depending on the analysis set; -5.1% is from a specific subgroup or complete-case analysis. Numbers should be cross-checked against the published paper precisely. | **Block: route to evidence-verifier.** Confirm the exact adjusted RD and CI from Mitchell 2022 primary publication. The figure quoted may be from a specific analysis (e.g. complete-case) rather than the headline result. |
| TR-5 | **P1** | `trialData.ts:5526` (CHANCE `pmid: '23803136'`) | PMID provided. Good. Most other trial entries do not have a `pmid` field populated despite the schema supporting it. | Class D-clinical task to backfill `pmid` and `doi` fields across all trial entries. |
| TR-6 | **P2** | `trialData.ts:5640` (POINT `calculations.nnt: 66.7` with `primaryDesign` not visible in this slice) | If POINT's primary endpoint is binary-superiority on the composite ischemic event, NNT is appropriate. Verify the design tag. | Read the full POINT entry, confirm `primaryDesign: 'binary-superiority'`. |
| TR-7 | **P1** | Multiple entries reference inline `/* claimId: ... */` comments (e.g. `mr-clean-no-iv-ordinal`, `direct-safe-noninferiority`, `chance.interpret`, `chance.bedside-pearl`, `chance.hemorrhage`) | These claim IDs reference a registry that does not exist (`src/lib/citations/registry.ts` and `claims.ts` are not built). The pre-commit hook cannot validate them. | Build §13.2 / §13.3 citation infrastructure before any further `claimId` tagging. Class D task — owned by data-architect, populated by medical-scientist. |
| TR-8 | **P2** | NINDS entry has `effectSize.value: '15.4%', label: 'Absolute Increase'` and a separate `pValue.value: '<0.05'` | NINDS published OR 1.7 (95% CI 1.2-2.6); reporting "<0.05" is correct but vague compared to OR + CI which the pearls block does record (`Odds Ratio: 1.7 (95% CI 1.2–2.6)`). Inconsistent precision across the same trial entry. | Standardize: use the published p-value (not "<0.05") and provide both OR with CI and ARD with CI per the trial-statistics skill. |

**Trial data file overall:** Schema is rich and modern (`primaryDesign`, `primaryResult`, `applicability`, `howToInterpret`, `mrsDistribution`, `ordinalStats`). The recent trial entries (CHANCE, MR CLEAN-NO IV, DIRECT-SAFE) are exemplary. Older entries (NINDS, ECASS III) likely predate the schema and have inconsistent statistical fields. Recommend a sweep to migrate older entries to the same archetype framework.

---

### 4. AHA 2026 guideline data (`src/data/aha2026StrokeGuideline.ts`)

| ID | Severity | Location | Description | Recommended next step |
|---|---|---|---|---|
| GL-1 | **P3** | File header (lines 1-26) | Citation: "Prabhakaran et al." but the canonical AHA/ASA 2026 author per the stroke-guidelines skill is Powers WJ et al. **Verify lead author.** Class E if wrong. | Route to evidence-verifier. Confirm against AHA Journals official citation. |
| GL-2 | **P0** | File overall — VALIDATION REFERENCE for all stroke content | The text quoted in this file is **verbatim recommendation language** from the published guideline. Each block needs:<br>(a) Section number from the published guideline<br>(b) DOI link per recommendation if possible<br>(c) `claimId` registration once the registry exists | This file is the foundation for §13.2 citation registration. Every recommendation here should produce a citation entry in `registry.ts` and a claim entry in `claims.ts`. **Single largest claim-tagging effort in the repo.** |
| GL-3 | **P1** | `aha2026StrokeGuideline.ts:78` (prehospital recommendation labeled "COR 3: Harm" for transdermal GTN) | "Prehospital initiation of stroke treatment with transdermal glyceryl trinitrate (GTN/nitroglycerin) has not improved outcomes and may cause harm." The wording "may cause harm" hedges what is graded as Class III: Harm. Verify the exact source guideline wording — sometimes quoted text omits or softens hedge language. | evidence-verifier check against the published guideline document. |
| GL-4 | **P2** | `aha2026StrokeGuideline.ts:280-301` (`ivtRecommendations.decisionMaking`) | Multiple verbatim recommendations with COR 1, A. The quoted text is reasonable; ensure no paraphrasing has crept in (compare verbatim against PDF). | Class E pre-merge: spot-check 5 recommendations against the source document. |
| GL-5 | **P1** | `aha2026StrokeGuideline.ts:318-323` (`ivtRecommendations.agentChoice`: tenecteplase 0.25 mg/kg max 25 mg) | Both the cap (25 mg) and the dose match the stroke-guidelines skill canonical reference. Good. **However:** the "Both agents are equivalent first-line choices" framing is stronger than what the guideline language typically says; verify it is verbatim. | evidence-verifier verification. If the guideline says "may be used" or "considered comparable," the JSX surface text must match. |
| GL-6 | **P2** | `aha2026StrokeGuideline.ts:402-406` (sICH management — TXA 1000mg IV, aminocaproic acid 4-5g) | Specific dosing in a structured format. Verify against published guideline; aminocaproic acid 4-5 g over 1h is consistent with AHA/ASA 2022 ICH framework. | evidence-verifier check; cross-reference with AHA/ASA 2022 ICH guideline § 5.1. |
| GL-7 | **P0** | Overall | This file claims to be VALIDATION REFERENCE for all stroke content but has no automated cross-check against actual rendered JSX. A drift between this file and the calculator interpretation strings (e.g. ABCD2, ICH Score) would be silent. | Class D task: build a unit test that asserts every clinically-bearing string in `pearls`/`guideContent` either contains a verbatim guideline phrase or carries a `claimId` mapped to a recommendation in this file. |

**Guideline data file overall:** This is the strongest clinical artifact in the repo. Verbatim recommendation text with COR/LOE preserved. The remaining work is governance scaffolding: section numbers, registry IDs, and a renderer-vs-data drift check.

---

### 5. Calculator interpretation text

Sampled: ABCD² (`abcd2ScoreData.ts`).

| ID | Severity | Location | Description | Recommended next step |
|---|---|---|---|---|
| CC-1 | **P1** | `abcd2ScoreData.ts:96-99` (`ABCD2_DRAWER_EXPLANATION`) — the "low/moderate/high" tier directives | "Low: Urgent outpatient workup within 48h. All TIA patients need urgent evaluation regardless of score." — directive language. The ABCD² score is **risk-stratification, not a triage directive.** AHA/ASA 2026 has moved toward "all TIA patients need urgent evaluation" generally; using ABCD² to justify low-risk outpatient workup is no longer concordant with current guidance in many settings. | Verify against AHA/ASA 2026 TIA management section. The "low risk → outpatient" recommendation may be outdated. The `daptForMinorAIS` table in the guideline file uses ABCD² ≥4 as the high-risk threshold for DAPT — that is concordant. But the calculator's drawer text ("urgent outpatient workup within 48h") needs verification against current guidance. |
| CC-2 | **P2** | `abcd2ScoreData.ts:56-60` (two-day risk percentages: low 1.0%, moderate 4.1%, high 8.1%) | Match the original Johnston 2007 paper. Good. | No change. Consider sourcing from the validated meta-analyses (Wardlaw et al.) for tighter intervals — but optional. |
| CC-3 | **P0** | `abcd2ScoreData.ts:138` (`interpretation: '${label} · 2-day stroke risk: ${base.twoDayRiskPercent}%.'`) | This is a **template-string composition site** — Phase 3 in the §13.4 surface-tagging table. Currently no `claim()` wrapper. The composition site renders a clinical claim that needs a `claimId`. | Block: this surface cannot ship under the §13.5 hook once Phase 3 is enforced. Wrap with `claim()` helper from `src/lib/citations/claim.ts` (which doesn't exist yet — pending §13.2 build). |

---

### 6. Citation coverage — **structural gap**

| ID | Severity | Description | Recommended next step |
|---|---|---|---|
| CIT-1 | **P0** | `src/lib/citations/registry.ts` does not exist. `src/lib/citations/claims.ts` does not exist. The `claim()` helper (§13.4 surface 3) does not exist. The pre-commit hook (§13.5) cannot enforce metadata completeness. | Class D task — `data-architect` builds the schema and registry; `medical-scientist` populates entries; `clinical-reviewer` gates. **This is the single largest blocking item for §13 governance.** |
| CIT-2 | **P0** | No `data-claim` attributes are present in JSX (Phase 1 surface). Per CLAUDE.md §13.3, every user-facing medical statement is a claim surface. The entire stroke guide, pearls, and calculator interpretation surfaces are currently unclaimed. | Build the registry first (CIT-1). Then sweep file by file. Estimated 200-400 claim IDs at minimum across guide content + pearls + trial data + calculator interpretation. |
| CIT-3 | **P1** | Inline `/* claimId: ... */` comments in `trialData.ts` reference IDs that are not yet registered. These will fail the §13.5 hook the moment it runs. | Either remove the comments until the registry exists, or accept they are dangling pointers. Recommend: keep them as authoring intent, document in TASKS.md that the registry build will activate them. |
| CIT-4 | **P1** | The `aha2026StrokeGuideline.ts` file functions as a *de facto* registry but does not match the §13.2 schema. It has no `id`, `last_reviewed`, or `quoted_text` fields per recommendation. | When building `registry.ts`, derive citation entries from this file's structure. Each recommendation block becomes a citation with `id: aha-asa-stroke-2026-<section>-<index>` and `quoted_text: <verbatim>`. |
| CIT-5 | **P2** | `last_reviewed` field per §13.2 is absent everywhere. No freshness tracking is possible until citations have dates. | Once registry exists, populate `last_reviewed: '2026-05-08'` for entries verified during the registry build, and apply the §13.7 freshness matrix. |

---

### 7. Missing contraindication caveats

| ID | Severity | Location | Description | Recommended next step |
|---|---|---|---|---|
| CON-1 | **P1** | `strokeClinicalPearls.ts:243` (`lvo-benefit-quick`: "LVO patients: poor outcomes with tPA alone, excellent with thrombectomy.") | Strong directive without contraindication context. Misses that thrombectomy candidacy depends on ASPECTS, NIHSS, prestroke mRS, time window, and large-core exclusions. "Excellent with thrombectomy" is unconditional language. | Reword to include candidate-criteria language. Cite AHA/ASA 2026 Section 4.7 EVT criteria. |
| CON-2 | **P1** | `strokeClinicalPearls.ts:317` (`lvo-workflow`: "If cortical signs present: (1) Give tPA if <4.5h (don't delay)") | Misses contraindication check. tPA is not given to all LVO patients within 4.5h — standard contraindications still apply. | Insert the contraindication-screening step before the give-tPA step. |
| CON-3 | **P2** | `guideContent.ts` (NINDS lede): "established intravenous alteplase (tPA) as the first FDA-approved treatment for acute ischemic stroke" | Pure history; fine. But adjacent pearls do not consistently cite the contraindication framework. | No immediate action. Note that NINDS-era contraindications (BP, INR, etc.) are still operative and should be linked from the trial summary card. |
| CON-4 | **P0** | `strokeClinicalPearls.ts:159` (`contraindications-relative`: "Severe stroke NIHSS >25 (greatest benefit, NNT=3)") | Already flagged (CP-1). The contraindication caveat is missing for what the original ECASS III protocol explicitly excluded as a 3–4.5h-window exclusion. Listing it under "often safe" without that distinction is dangerous. | See CP-1. |
| CON-5 | **P1** | `aha2026StrokeGuideline.ts:300-301` (DAPT in IVT setting) recommendations | The COR 2b "uncertain risk" recommendation is preserved verbatim (good), but downstream pearls/guides should mirror the uncertainty language rather than collapsing it into "give DAPT." | Audit pearls for any DAPT-after-IVT statements; ensure they match COR 2b "uncertain" framing. |

---

## Items needing evidence-verifier review (consolidated)

Before any of these are edited, route through evidence-verifier per the workflow defined in CLAUDE.md §11 and the agent's own brief:

1. **DIRECT-SAFE adjusted RD and CI numbers (TR-4)** — verify -5.1% / -15.4% / 5.3% against Mitchell et al. Lancet 2022 primary publication.
2. **AHA/ASA 2026 lead author (GL-1)** — confirm Powers WJ vs Prabhakaran; the file currently says Prabhakaran but the stroke-guidelines skill says Powers.
3. **Verbatim language for AHA/ASA 2026 IVT agent-choice and "equivalent first-line" framing (GL-5)** — pull the exact recommendation wording.
4. **TXA dosing in sICH management (GL-6)** — verify 1000 mg over 10 min and aminocaproic acid 4-5 g/h dosing against the published 2026 guideline.
5. **Section numbers** — every recommendation block in `aha2026StrokeGuideline.ts` needs section numbers attached (not just topical headers).
6. **NINDS NNT and OR (TR-8)** — verify against original NEJM 1995 publication — the published OR is 1.7 (95% CI 1.2–2.6) for favorable outcome (Part 2). Ensure that is the source of the displayed values.
7. **Severe-stroke NIHSS>25 NNT=3 figure (CP-1)** — find primary source. If from a subgroup analysis, mark as exploratory per the trial-statistics skill subgroup rule.
8. **Pregnancy tPA case-series numbers (CP-4)** — find or remove.
9. **PMID/DOI backfill (TR-5)** — every trial entry should have both fields populated. Many do not.

---

## Items needing trial-statistician review (consolidated)

Per the trial-statistics skill, these need explicit statistical-design review:

1. **NINDS (TR-1, TR-8)** — verify trial entry surfaces match binary-superiority framing (NNT, ARD, CI, OR all should be present and consistent).
2. **HERMES meta-analysis (CP-5)** — distinguish the ordinal-shift primary from the dichotomized mRS 0-2 secondary. NNT presented should be flagged as derived from the dichotomization.
3. **DAWN, DEFUSE-3** — primary outcome was ordinal mRS shift. Trial entries should use Grotta-bar archetype (B), not standard binary bars. Verify `mrsDistribution` is populated and `archetypeId: 'B'` is set. Ban NNT card.
4. **All noninferiority trial entries** — ORIGINAL, MR CLEAN-NO IV, DIRECT-SAFE, SWIFT DIRECT — confirm `primaryDesign: 'noninferiority'` and that NNT card is suppressed by Option Y rule. Verify NI-margin chart archetype (A or G) is selected.
5. **CHANCE / POINT** — binary-superiority composite. Confirm composite-endpoint caveat is shown (which component drove the result). POINT: stroke component drove the composite; bleeding rose. CHANCE: stroke component drove without bleeding rise. Both are appropriate to display.
6. **TICH-2** — composite endpoint, futility-stopped pattern? Verify primary design tag.
7. **Bayesian trials** — none in current sample, but ensure scanner is wired for posterior probability display when one ships.

---

## Summary of clinical risk areas

Ranked by urgency for clinician-visible risk:

1. **P0: Severe-stroke pearl framing (CP-1)** — clinician could read "NIHSS>25, greatest benefit, NNT=3" and treat against the relevant exclusion windows. Block until verified.
2. **P0: Citation governance gap (CIT-1, CIT-2)** — entire clinical surface is unenforced. The hook cannot fire. This is structural, not per-claim, but it means every other P1/P2 finding is currently un-detectable by automation.
3. **P0: Calculator interpretation composition site (CC-3)** — Phase 3 surface-tagging is required. Once enforced, ABCD² interpretation cannot ship.
4. **P0: DIRECT-SAFE primary-result numbers (TR-4)** — clinician reads the page and acts on a number that may be from a non-primary analysis.
5. **P0: AHA 2026 guideline file is the single source of truth but has no automated cross-check (GL-7)** — drift between pearls/guides and the file would be silent.
6. **P1: Multiple `evidenceClass: 'III'` pearls describe permissive use, not harm/no-benefit (CP-2, CP-8)** — class label is being used as a generic "evidence" tag rather than the AHA-defined COR. Sweep needed.
7. **P1: ECASS-III contradiction in EXTEND lede (GC-2)** — factual error: EXTEND was alteplase, not desmoteplase.
8. **P1: Missing contraindication caveats in LVO/EVT pearls (CON-1, CON-2)** — directive text without candidate-criteria framing.
9. **P1: Several pearls have directive plain-English lines that exceed evidence (CP-3, CP-9)** — "when in doubt, treat" / "start statin immediately" — soften.
10. **P2: Older trial entries (NINDS, ECASS III) lack the modern schema fields** — migration sweep recommended.

---

## Recommended next actions (orchestrator-facing)

1. **Class D task: build `src/lib/citations/` infrastructure** — `schema.ts`, `registry.ts`, `claims.ts`, `claim.ts` helper. Owner: data-architect. Blocks every other §13 enforcement.
2. **Class E task: claim-and-register the AHA 2026 guideline file** — produce one citation entry per recommendation block, with section numbers, `last_reviewed: 2026-05-08`, and `quoted_text` verbatim. Owner: medical-scientist. Gate: clinical-reviewer.
3. **Class E task: re-grade evidenceClass labels in `strokeClinicalPearls.ts`** — sweep all pearls; align COR/LOE labels with AHA-defined classes. Owner: medical-scientist. Gate: clinical-reviewer.
4. **Class E task: fix CP-1 (NIHSS>25 NNT=3) and GC-2 (EXTEND/desmoteplase contradiction) and TR-4 (DIRECT-SAFE numbers)** as a small bundled correction PR. Each requires evidence-verifier packet first.
5. **Class D-clinical task: backfill PMID/DOI across trial entries** (TR-5).
6. **Class C-clinical task: soften directive language in pearls** (CP-3, CP-9, CON-1, CON-2). Smaller scope; route to medical-scientist + clinical-reviewer.
7. **Class D task: build a guideline-file ↔ rendered-content drift test** (GL-7) so that quoted text used in pearls/guides is asserted to exist in `aha2026StrokeGuideline.ts`. Owner: quality-assurance.

All items above route through `clinical-reviewer` per CLAUDE.md §11 / §17.2. None of the recommended changes are made by this audit — all are deliverables for downstream Class E or `-clinical` tasks.

---

## Files reviewed

- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/guideContent.ts` (lines 1-200)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/strokeClinicalPearls.ts` (lines 1-824)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts` (lines 1-400, 2000-2200, 5500-5650 — schema and 6 sample trials)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/aha2026StrokeGuideline.ts` (lines 1-540)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/abcd2ScoreData.ts` (lines 1-143)

Sources of truth referenced:

- `.claude/skills/stroke-guidelines/SKILL.md` (AHA/ASA 2026 + 2022 ICH canonical references)
- `.claude/skills/trial-statistics/SKILL.md` (statistical-design display rules)
- CLAUDE.md §13 (clinical safety operational rules)
- `.claude/rules/clinical-surfaces.md`
- `.claude/rules/clinical-review-templates.md`
