Now I'll produce the report. I have all the data I need in the task input.

# Clinical Semantic-Validity Audit - NeuroWiki

**Date:** 2026-07-01
**Scope:** Semantic layer only (the layer the pre-commit hook cannot check, per CLAUDE.md §13.1)

---

## 1. Executive summary

The sweep produced **73 candidate findings**. After adversarial verification on Fable, the breakdown is:

| Disposition | Count |
|---|---|
| **Confirmed** | 63 |
| **Uncertain / needs human review** | 10 |
| False-positive (rejected outright) | 0 |

Every candidate that survived to this report was independently reproduced against a load-bearing source. Candidates whose proposed fix was itself wrong were downgraded to **uncertain** rather than discarded, because the underlying smell was real even when the finder's correction was not. No candidate was a clean false-positive, but several confirmed findings carry a narrower defect than the finder originally claimed, and several finder-proposed severities and fixes were corrected during verification.

### Confirmed findings by severity

| Severity | Count |
|---|---|
| High | 24 |
| Medium | 26 |
| Low | 13 |

### Confirmed findings by domain

| Domain | Count |
|---|---|
| Trial data (`src/data/trialData.ts`) | 33 |
| Guide pages (`src/pages/guide/`) | 13 |
| Citation registry / claims (`src/lib/citations/`) | 7 |
| Calculators (`src/pages/*Calculator.tsx`) | 6 |
| Stroke pearls (`src/data/strokeClinicalPearls.ts`) | 5 |
| Calculator data modules (`src/data/*ScoreData.ts`, `cha2ds2VascData.ts`) | 5 |
| Authored clinical prose (`src/data/clinicalSynthesesByQuestion.ts`) | 2 |

*(Domain counts sum above 63 because a few findings span two surfaces; each is counted under its primary home.)*

### Single most important finding

The deep stroke pearl `hemorrhage-reversal-protocol` (`src/data/strokeClinicalPearls.ts:1122-1131`, Step 3) actively instructs clinicians to **withhold tranexamic acid** in post-thrombolysis symptomatic ICH - citing TICH-2, which studied spontaneous ICH - directly contradicting the AHA/ASA 2026 COR 1 recommendation to give TXA 1000 mg IV for post-IVT sICH and contradicting the tool's own quick pearl, meaning the platform tells a clinician to skip a guideline-endorsed therapy in a life-threatening bleed.

---

## 2. Confirmed findings

### 2.1 High severity

**H1 - NINDS mRS 0-1 rate mislabeled**
- **Locus:** `src/data/trialData.ts` / `ninds-trial` / efficacyResults + howToReadChart + bottomLineSummary + bedsidePearl + legend (lines ~568, 576, 585, 620-627, 660, 674-678)
- **What is wrong:** 42.6% vs 27.2% is labeled "Minimal disability (mRS 0-1) at 3 months" throughout, but the published NINDS Part 2 mRS 0-1 rate was 39% vs 26%. The 42.6%/27.2% pair matches no single published scale proportion, and the entry's own `absoluteReduction.info` already concedes the OR 1.7 is the global composite across four scales.
- **Source:** NINDS rt-PA Study Group, NEJM 1995;333:1581-1587; PMID 7477192 (per-scale table via WikiJournalClub reproduction).
- **Proposed fix:** Either correct the mRS 0-1 rates to 39% vs 26% (OR 1.7, 95% CI 1.1-2.6, P=0.019) with internally consistent NNT, or relabel 42.6%/27.2% as the global favorable-outcome composite citing all four scales. Do not mix a composite-labeled OR with an mRS-labeled percentage. Resolve the provenance of 42.6%/27.2% before writing.
- **Class:** E

**H2 - SWIFT PRIME common OR wrong**
- **Locus:** `src/data/trialData.ts` / `swift-prime-trial` / ordinalStats + legend.keyStat (lines 2444-2455)
- **What is wrong:** ordinalStats records commonOR 2.75 (95% CI 1.53-4.95); the published mRS-shift common OR was 2.63 (95% CI 1.57-4.40). Neither the point estimate nor either CI bound matches. The error is duplicated in legend.keyStat.
- **Source:** Saver et al., NEJM 2015;372:2285-2295; PMID 25882376; DOI 10.1056/NEJMoa1415061.
- **Proposed fix:** Set ordinalStats to commonOR 2.63, ciLow 1.57, ciHigh 4.40 (pValue stays <0.001); update legend.keyStat to "cOR 2.63 (1.57-4.40)".
- **Class:** E

**H3 - DEVT noninferiority bound misstated**
- **Locus:** `src/data/trialData.ts` / `devt-trial` / howToReadChart Q1+Q2 (lines 2898, 2902) + legend.keyStat (line 2921)
- **What is wrong:** The NI decision is described with a two-sided 95% CI lower bound of -2.9%; the published NI test uses a one-sided 97.5% CI lower bound of -5.1% (P for NI=0.003). Displaying -2.9 as the decisive bound understates how close the trial ran to the -10 pp margin and misstates the method.
- **Source:** PMC7816099 / JAMA 2021;325:234-243 (DEVT primary results).
- **Proposed fix:** Present the NI decision using the one-sided 97.5% CI lower bound -5.1% (P for NI=0.003); keep the two-sided 95% CI (-2.9 to 18.2) only as a separately labeled descriptive estimate. Update Q2 and legend.keyStat.
- **Class:** E

**H4 - DEVT safety figures do not match published values**
- **Locus:** `src/data/trialData.ts` / `devt-trial` / howToReadChart Q3 (line 2906)
- **What is wrong:** Repo shows sICH 4.3% vs 3.4% and mortality 14.7% vs 18.8%; published values are sICH 6.1% vs 6.8% and 90-day mortality 17.2% vs 17.8%. The repo even inverts the mortality direction (shows control higher).
- **Source:** PMC7816099 / JAMA 2021;325:234-243, Table 2.
- **Proposed fix:** Replace Q3 numbers with sICH 6.1% (direct EVT) vs 6.8% (alteplase+EVT) and 90-day mortality 17.2% vs 17.8%. Verify no other DEVT surface carries the erroneous figures.
- **Class:** E

**H5 - OPTIMAL-BP malignant-edema CI wrong**
- **Locus:** `src/data/trialData.ts` / `optimal-bp-trial` / howToReadChart Q3 (line 4892) + howToInterpret.proves (line 4897)
- **What is wrong:** Malignant cerebral edema 95% CI shown as 1.05-59.0; published value is 1.57-39.39 (adjusted OR 7.88, P=.01). Both CI bounds are wrong; the OR and P-value are correct, so this is an isolated CI transcription error. The defect appears on 2 surfaces, not the 5 the finder claimed.
- **Source:** PMC10481233 (JAMA 2023 OPTIMAL-BP full text): "adjusted OR, 7.88 [95% CI, 1.57-39.39]; P=.01".
- **Proposed fix:** Replace "95% CI 1.05-59.0" with "95% CI 1.57-39.39" at lines 4892 and 4897. Refresh `last_reviewed` on the optimal-bp citation per §13.6.
- **Class:** E

**H6 - ENCHANTED secondary result in primary stat slot**
- **Locus:** `src/data/trialData.ts` / `enchanted-trial` / stats.effectSize (lines 4396-4399)
- **What is wrong:** stats.effectSize headlines the secondary any-ICH outcome (OR 0.75, "Less Any ICH") while stats.pValue shows the primary p (0.87). The renderer pairs these in the headline TrialStats block, so a null primary trial is displayed as if it had a positive secondary result - the exact misrepresentation the entry's own howToReadChart Q2 warns against.
- **Source:** `trialData.ts` lines 4392-4399/4442/4446/4450; `TrialPageNew.tsx` lines 307-308; Anderson et al. Lancet 2019 (S0140-6736(19)30038-8), primary ordinal mRS neutral (cOR 1.01, 95% CI 0.87-1.17, P=0.87).
- **Proposed fix:** Set stats.effectSize to the primary endpoint (value "cOR 1.01", label "No Functional Difference"); relabel the secondary ICH OR 0.75 as secondary wherever displayed.
- **Class:** E

**H7 - PATCH primaryResult mislabeled "not-met"**
- **Locus:** `src/data/trialData.ts` / `patch-trial` / primaryResult (line 18443)
- **What is wrong:** primaryResult:"not-met" implies a null result, but the pre-specified ordinal-shift primary was met with significance in the **harm** direction (aOR 2.05, 95% CI 1.18-3.56, P=0.0114). The value also excludes PATCH from the isHarmStopped display branch, so it renders as a plain miss rather than significant harm.
- **Source:** Baharoglu et al., Lancet 2016; PMID 27178479; `trialData.ts` primaryResult type comment; `TrialPageNew.tsx` display logic.
- **Proposed fix:** Requires an enum/medical-scientist decision. Options: (a) extend the primaryResult enum with a "met-harm"/"significant-harm" value added to NEGATIVE_RESULTS plus a harm display branch, or (b) reuse "harm-stopped" and relax its comment to cover completed trials with significant primary harm. Do not leave "not-met".
- **Class:** E

**H8 - ANNEXA-4 registry mislabeled POSITIVE**
- **Locus:** `src/data/trialData.ts` / `annexa-4-trial` / trialResult (line 18589)
- **What is wrong:** trialResult:"POSITIVE" on a single-arm registry (primaryDesign:"single-arm-registry", primaryResult:"safety-threshold-met") drives comparative winning-arm styling across ~40 render sites that a no-comparator cohort cannot support. The repo's own convention (WEAVE) uses "SAFETY_MET" for the identical design pairing.
- **Source:** `trialData.ts` trialResult type (line 204), WEAVE trialResult:"SAFETY_MET" (line 9022); `TrialPageNew.tsx` isPositive styling.
- **Proposed fix:** Change trialResult to "SAFETY_MET" (existing enum, matches WEAVE and primaryResult:"safety-threshold-met"). No prose change. Verify BottomLineDrawer/TrialPageNew render "SAFETY_MET" acceptably.
- **Class:** D-clinical

**H9 - ELAN legend claims non-inferiority**
- **Locus:** `src/data/trialData.ts` / `elan-study` / legend.finding + legend.bottomLineTag (lines 9975-9977)
- **What is wrong:** The legend labels an estimation-trial result "NI met" / "non-inferior", but ELAN tested no NI hypothesis. Every other field in the entry frames it correctly as an estimation trial; only the load-bearing legend (rendered on clinician-facing cards) contradicts.
- **Source:** Fischer NEJM 2023; PMID 37222476; `TrialLegendCard.tsx` L48-49, 191.
- **Proposed fix:** Change bottomLineTag to a design-honest tag ("Early start safe" or "CI reassuring") and rewrite legend.finding to describe the CI result (RD -1.18 pp, 95% CI -2.84 to +0.47; sICH 0.2% both arms) rather than claim non-inferiority.
- **Class:** E

**H10 - ENRICH Bayesian NNT chip without caveat**
- **Locus:** `src/data/trialData.ts` / `enrich-trial` / legend.bottomLineTag (line 11585)
- **What is wrong:** NNT 12 (derived from the primary safety endpoint of a Bayesian trial) is shown as an unqualified headline legend chip. Every other surface in the entry carries the disclaimer; the chip is the sole surface without it, so a card reader sees "NNT 12" as the trial's bottom line.
- **Source:** `trialData.ts` L11354, L11504-11505, L11547; `TrialLegendCard.tsx` L49; trial-statistics skill (NNT invalid for Bayesian primaries).
- **Proposed fix:** Replace bottomLineTag "NNT 12" with a Bayesian-appropriate headline (e.g., "P(sup)=0.981" or "UW-mRS +0.084"). Keep the approximate safety-endpoint NNT only in prose with its existing disclaimer.
- **Class:** E

**H11 - PRISMS CI understated**
- **Locus:** `src/data/trialData.ts` / `prisms-trial` / howToReadChart.answer (~line 13640) + howToInterpret.proves (~line 13655) + bottomLineSummary
- **What is wrong:** Adjusted risk-difference 95% CI stated as -5.6% to +3.4% when the published CI is -9.4% to +7.3%, roughly twice as wide, overstating precision. Point estimate (-1.1%) and sICH (3.2% vs 0%) match.
- **Source:** Khatri et al., JAMA 2018; PMC6583516 (CI -9.4% to +7.3%).
- **Proposed fix:** Change all PRISMS CI occurrences to "95% CI -9.4% to +7.3%". Refresh `last_reviewed` per §13.6.
- **Class:** E

**H12 - RAISE reteplase sICH figure wrong and internally inconsistent**
- **Locus:** `src/data/trialData.ts` / `raise-trial` / applicability.populationExclusions[1] (line 14028)
- **What is wrong:** Field states "Higher sICH rate than alteplase (3.1% vs 2.0%)", contradicting the published 2.4% vs 2.0% and the same entry's own safetyProfile (2.4%) and pearls (2.4% vs 2.0%). The true 2.4% vs 2.0% is not clearly higher (P=0.64), so the "warrants caution" framing also needs softening.
- **Source:** Li et al., NEJM 2024 (NEJMoa2400314): sICH 2.4% vs 2.0%, RR 1.21 (0.54-2.75), P=0.64; internal cross-check vs lines 14076, 14087.
- **Proposed fix:** Change to 2.4% vs 2.0% and soften the framing, e.g., "sICH was similar to alteplase (2.4% vs 2.0%, P=0.64); any ICH was higher (7.7% vs 4.9%), which warrants caution outside trial context." Refresh `last_reviewed`.
- **Class:** E

**H13 - Basilar-EVT claim overstates class and LOE**
- **Locus:** `src/lib/citations/claims.ts:296` (claim `basilar-evt-guideline-summary` description) + `src/lib/citations/registry.ts:604` (citation `aha-asa-2026-4.7.3` quoted_text)
- **What is wrong:** The GuidelineSummaryCard states "within 24h... (COR 1, LOE A)", overstating both the class (COR 1 applies only to <6h in the repo's own mirror) and the LOE (no Level A for posterior-circulation EVT; it is B-R). Contradicts the repo's own `aha2026StrokeGuideline.ts` posteriorCirculation array.
- **Source:** `aha2026StrokeGuideline.ts` posteriorCirculation (lines 506-517); BAOCHE PMID 36239645 / ATTENTION PMID 36239644 (RCT evidence = B-R). *(Note: the LOE for posterior EVT is also flagged in the uncertain section - see U4-U7; the internal contradiction here is confirmed even where the exact published LOE is not.)*
- **Proposed fix:** Rewrite to a two-tier presentation: within 6h EVT recommended (COR 1, LOE B-R); 6-24h can reasonably be considered with salvageable tissue (COR 2a, LOE B-R). Remove "Level A". Refresh `last_reviewed`.
- **Class:** E

**H14 - FXa-reversal grade wrong in ICH citation**
- **Locus:** `src/lib/citations/registry.ts:733` (citation `aha-asa-2022-ich-anticoag-reversal` quoted_text)
- **What is wrong:** For FXa-inhibitor ICH, this citation states andexanet/4F-PCC "may be considered (Class 2b, Level C-LD)", while the published guideline and the duplicate entry `aha-asa-ich-2022-reversal` say Class 2a, Level B-NR. The 2b/C-LD value is erroneous and underwrites bedside FXa-reversal claims (indices 38, 39).
- **Source:** Greenberg et al., Stroke 2022;53:e282-e361; PMID 35579034; in-repo `docs/evidence-packets/annexa-i-2026-05-20.md` §8c line 122.
- **Proposed fix:** Correct the FXa clause to "andexanet alfa can be useful for reversal (Class 2a, Level B-NR)"; reconcile the VKA-reversal LOE at the same time; consolidate the two duplicate same-PMID citations as a separate D-clinical dedup task. Clinical-reviewer gate required.
- **Class:** E

**H15 - NIHSS calculator: ASPECTS ≥6 misapplied to early window**
- **Locus:** `src/pages/NihssCalculator.tsx` line 684 + claim `nihss-severity-interpretation-2026` (NIHSS 16-20 band)
- **What is wrong:** States "ASPECTS ≥6 for standard early-window selection", but AHA/ASA 2026 early-window (0-6h) EVT criterion is ASPECTS 3-10; ≥6 is the 6-24h threshold. This would wrongly exclude ASPECTS 3-5 patients from 0-6h EVT consideration.
- **Source:** `aha2026StrokeGuideline.ts` line 423 (0-6h EVT: ASPECTS 3-10, COR 1 LOE A) and line 438 (6-24h: ≥6).
- **Proposed fix:** Change to "ASPECTS 3-10 for standard 0-6h selection (≥6 applies to the 6-24h window)". Update the claim text.
- **Class:** E

**H16 - ASPECTS calculator: 3-5 band omits early-window indication**
- **Locus:** `src/pages/AspectScoreCalculator.tsx` getScoreInfo() score 3-5 branch (~lines 91-92) / claim `aspects-evt-eligibility-2026`
- **What is wrong:** The "Large Core" interpretation states EVT is COR 1, LOE A only for 6-24h presentation, omitting the 0-6h COR 1, LOE A indication that also covers ASPECTS 3-5 under "ASPECTS 3-10". A clinician with ASPECTS 4 at 2h reads only late-window framing and may infer weaker early-window support.
- **Source:** `aha2026StrokeGuideline.ts` evtRecommendations.adults[0] (0-6h ASPECTS 3-10, COR 1 LOE A) vs adults[2] (6-24h ASPECTS 3-5).
- **Proposed fix:** Amend the 3-5 evtText to state both COR 1/LOE A indications: (1) 0-6h as part of ASPECTS 3-10 (no age/mass-effect gate), and (2) 6-24h with the added age<80/mass-effect selection criteria.
- **Class:** E

**H17 - mRS calculator: prestroke mRS 2 mislabeled contraindication**
- **Locus:** `src/pages/MrsCalculator.tsx` line 383 / claim `mrs-prestroke-evt-eligibility` (grade===2 branch) + `claims.ts` line 939
- **What is wrong:** Describes prestroke mRS 2 as "a relative contraindication" to EVT; AHA/ASA 2026 gives prestroke mRS 2 a COR 2a ("can reasonably be considered") recommendation. Labeling a COR 2a recommendation a "relative contraindication" inverts the guidance and may discourage guideline-endorsed treatment.
- **Source:** `aha2026StrokeGuideline.ts` evtRecommendations lines 475-481 (COR 2a, LOE B-NR).
- **Proposed fix:** Reframe mRS 2 as guideline-permissive (COR 2a, LOE B-NR for anterior LVO with NIHSS≥6, ASPECTS≥6, <6h). Keep the accurate trial-inclusion history (DAWN/DEFUSE-3/SELECT-2 used mRS 0-1) but distinguish it from current guidance. Update both JSX and the claim description.
- **Class:** E

**H18 - HERMES NNT 2.6 misattributed to functional independence**
- **Locus:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:612`
- **What is wrong:** HERMES NNT 2.6 (the ordinal ≥1-level mRS-shift NNT) is presented paired with binary mRS 0-2 functional-independence percentages ("46% vs 29% functional independence ... (NNT 2.6)"). The binary independence NNT is ~5. Compound-statistic error.
- **Source:** Goyal HERMES, Lancet 2016;387:1723-31; PMID 26898852 (direct quote: NNT 2.6 = one mRS-level improvement).
- **Proposed fix:** Separate the metrics - functional independence 46% vs 26.5% (mRS 0-2, NNT ~5); present NNT 2.6 (with cOR 2.49, 95% CI 1.79-3.53) as the ordinal shift. Register/verify a claim ID. *(This finding was submitted twice as two loci; treat as one fix at line 612.)*
- **Class:** E

**H19 - Meningitis CT-before-LP threshold under-triages**
- **Locus:** `src/pages/guide/Meningitis.tsx:64`
- **What is wrong:** CT-before-LP threshold uses "GCS <10" (ESCMID 2016). IDSA 2004 (dominant US standard) indicates CT for any altered level of consciousness (effectively GCS <15), so GCS 10-14 patients with raised ICP could get an unscanned LP - a herniation-risk safety gap.
- **Source:** IDSA 2004 (Tunkel, CID 2004;39:1267): indications include abnormal level of consciousness, immunocompromise, seizure, papilledema, focal deficit.
- **Proposed fix:** Change threshold to reflect IDSA ("depressed/altered level of consciousness (GCS <15)"), or explicitly cite ESCMID and add a note that IDSA uses altered mental status. Register the meningitis citation (IDSA 2004 or ESCMID 2016).
- **Class:** E

**H20 - ICH management: SBP <140 overgraded to Class I, Level A**
- **Locus:** `src/pages/guide/IchManagement.tsx:74`
- **What is wrong:** SBP <140 within 1h graded "Class I, Level A". The 2022 AHA/ASA ICH guideline grades acute SBP lowering to 140 (mild-moderate ICH, SBP 150-220) as COR 2b, LOE B-R; both cited trials (INTERACT-2 binary P=0.06; ATACH-2 negative) missed their primary endpoints. Overstates the evidence and could drive inappropriately aggressive BP lowering.
- **Source:** Greenberg, Stroke 2022 (COR 2b, LOE B-R; harm statement for <130).
- **Proposed fix:** Change grade to "COR 2b, LOE B-R"; state target as SBP 140 (goal range 130-150) for mild-moderate ICH with SBP 150-220; add caution against lowering <130; note INTERACT-2/ATACH-2 primary endpoints not met. Register the 2022 ICH guideline citation with correct COR/LOE.
- **Class:** E

**H21 - Thrombectomy guide: early-window ASPECTS understated**
- **Locus:** `src/pages/guide/Thrombectomy.tsx:60-62` (Section 2 - Early Window 0-6h)
- **What is wrong:** Early-window criterion stated as "ASPECTS ≥6" with ASPECTS 3-5 framed as a SELECT2/ANGEL-ASPECT exception; the 2026 guideline recommends EVT for ASPECTS 3-10 at COR 1, LOE A in the 0-6h window, understating that 3-10 is the primary indication.
- **Source:** `aha2026StrokeGuideline.ts:417-430` (evtRecommendations.adults[0]).
- **Proposed fix:** State the early-window criterion as "NCCT ASPECTS 3-10 (COR 1, LOE A)" with NIHSS ≥6 and mRS 0-1; retain SELECT2/ANGEL-ASPECT as the evidence for the 3-5 large-core subset rather than as an exception.
- **Class:** E

**H22 - NIHSS 16-20 band ASPECTS misattribution (second calculator surface)**
- **Locus:** `src/pages/NihssCalculator.tsx` line 684 - `nihss-severity-interpretation-2026` claim, "Moderate to severe (16-20)" block
- **What is wrong:** States "confirm prestroke mRS 0-1 and ASPECTS ≥6 for standard early-window selection", misattributing the extended-window (6-24h) cutoff to the early window and understating EVT eligibility for ASPECTS 3-5 patients presenting <6h. *(Distinct block from H15, same underlying error class; verify both are corrected together.)*
- **Source:** `aha2026StrokeGuideline.ts` evtRecommendations lines 419-445; `docs/reviews/clinical-PR-aspects-cor-2a-correction-2026-05-22.md`.
- **Proposed fix:** Reflect early-window ASPECTS 3-10 (COR 1, LOE A) for 0-6h and note large-core (3-5) support; reserve ASPECTS ≥6 for the 6-24h window. Update the claim text.
- **Class:** E

**H23 - IST-3 outcome rates misattributed to the >80 subgroup**
- **Locus:** `src/data/strokeClinicalPearls.ts:254-263` (id: `ist3-trial`)
- **What is wrong:** IST-3 outcome rates 37% vs 35% are juxtaposed with "1,617 patients >80 years", reading as if they describe the >80 stratum; they are the overall n=3035 primary-outcome rates (measured on the Oxford Handicap Scale, not mRS).
- **Source:** IST-3, Lancet 2012;379:2352-63; PMID 22632908 (37% vs 35% overall, OHS 0-2, adjusted OR 1.13, 95% CI 0.95-1.35, P=0.181).
- **Proposed fix:** Separate the figures: "1,617 (53%) of 3035 were >80y. Overall: 37% vs 35% alive & independent at 6 months (OHS 0-2; adjusted OR 1.13, 95% CI 0.95-1.35, P=0.18). Benefit did not diminish in the elderly." Refresh citation/`last_reviewed`; register claim.
- **Class:** E

**H24 - ECASS-3 sICH definition wrong window and fabricated criterion**
- **Locus:** `src/data/strokeClinicalPearls.ts:1092-1101` (id: `sich-definition`)
- **What is wrong:** The ECASS-3 sICH definition carries a wrong time window ("within 24h" - should be 7 days), a fabricated third criterion ("any ICH requiring surgical intervention"), and omits the required "predominant cause of deterioration" clause.
- **Source:** Hacke et al., NEJM 2008;359:1317-29; PMID 18815396; corroborated via Karger CED review and PMC6613400.
- **Proposed fix:** Rewrite to the true definition: any hemorrhage on CT/MRI with an NIHSS increase ≥4 vs baseline or the lowest value within the first 7 days, OR any hemorrhage leading to death, where the hemorrhage is the predominant cause of deterioration. Remove the surgical-intervention criterion. Refresh citation/`last_reviewed`; register claim.
- **Class:** E

**H25 - Deep pearl instructs withholding TXA in post-IVT sICH**
- **Locus:** `src/data/strokeClinicalPearls.ts:1122-1131` (id: `hemorrhage-reversal-protocol`, Step 3), cross-referenced with `hemorrhage-management-quick` (1083-1089) and `tich2-trial` (1133-1142)
- **What is wrong:** Step 3 says "Do not give TXA routinely" (citing TICH-2, which studied **spontaneous** ICH) for the post-thrombolysis sICH reversal protocol, contradicting the AHA/ASA 2026 COR 1 recommendation to give TXA 1000 mg IV for post-IVT sICH and contradicting the tool's own quick pearl.
- **Source:** `aha2026StrokeGuideline.ts` lines 879-895 (hemorrhagicTransformationRecommendations, COR 1, LOE C-EO) + 398-408; `docs/2026-AHA-Stroke-guideline.md` lines 125-132. *(Severity upgraded from finder's medium to high because the pearl actively instructs withholding a COR 1 therapy in a life-threatening bleed.)*
- **Proposed fix:** Rewrite Step 3 to give TXA 1000 mg IV over 10 min (or aminocaproic acid 4-5 g IV) alongside cryoprecipitate for post-IVT sICH (COR 1, LOE C-EO, AHA/ASA 2026). Confine the TICH-2 "do not use TXA" statement explicitly to spontaneous ICH. Update the evidence field to reference 2026.
- **Class:** E

---

### 2.2 Medium severity

**M1 - EXTEND-IA secondary effect size under co-primary label**
- **Locus:** `src/data/trialData.ts` / `extend-ia-trial` / stats.effectSize (lines 2092-2095)
- **What is wrong:** stats.effectSize shows "+31% mRS 0-2 Benefit" (a secondary 90-day outcome) while stats.primaryEndpoint is labeled "Reperfusion / 24-Hour Coprimary Endpoint". The value 31 pp is correct; the pairing conflates a secondary effect with the co-primary.
- **Source:** Campbell et al., NEJM 2015;372:1009-1018; PMID 25671797.
- **Proposed fix:** Relabel stats.effectSize as "Secondary mRS 0-2 benefit", or replace with a co-primary measure (e.g., "+63% median reperfusion" or "+43 pp early neuro improvement"). Prefer explicit "secondary" labeling.
- **Class:** C-clinical

**M2 - DIRECT-MT headlines reperfusion instead of primary functional endpoint**
- **Locus:** `src/data/trialData.ts` / `direct-mt-trial` / efficacyResults (lines 2664-2675)
- **What is wrong:** efficacyResults headlines "Overall successful reperfusion" (79.4% vs 84.5%, a procedural surrogate that favors the control arm) rather than the primary mRS-shift endpoint. Functional independence exists only inside howToReadChart[1].
- **Source:** Yang et al., NEJM 2020;382:1981-1993; PMID 32374959 (noninferiority mRS-shift, cOR 1.07, 95% CI 0.81-1.40).
- **Proposed fix:** Move reperfusion into safetyProfile or a procedural-metrics field; populate efficacyResults with the functional endpoint (mRS 0-2, with a source-consistency check on 62.0/58.5 vs 65/57) or a descriptive cOR 1.07 presentation. Verify the exact mRS 0-2 numbers against the primary paper before writing.
- **Class:** C-clinical

**M3 - EXTEND p=0.04 shown as unqualified "Statistically Sig."**
- **Locus:** `src/data/trialData.ts` / `extend-trial` / stats.pValue (lines 1089-1092) + pearls (line 1134)
- **What is wrong:** p=0.04 is shown as "Statistically Sig." in the headline stats without the qualifier that significance is adjusted-analysis-only (unadjusted RR 1.2, P=0.35; prespecified logistic OR 1.88, P=0.056). The nuance appears only lower in howToInterpret.cautions.
- **Source:** thebottomline.org.uk EXTEND summary (mirrors Ma et al., NEJM 2019).
- **Proposed fix:** Change stats.pValue.label to a qualified form (e.g., "Adjusted analysis (unadjusted P=0.35)") and append the unadjusted/logistic values to the pearl. Do not alter the value "0.04".
- **Class:** E

**M4 - RESCUE BT direction "positive" on a null trial**
- **Locus:** `src/data/trialData.ts` / `rescue-bt-trial` / ordinalStats.direction (line 4326)
- **What is wrong:** direction labeled "positive" for a null trial (OR 1.08, CI crosses 1.0, P=0.51). Latent data-integrity defect: the sole consumer (getDirectionBadge in `GrottaBarChart.tsx`) short-circuits to "Not significant" when the CI crosses 1.0, so it does not render as "Favors treatment" today.
- **Source:** `trialData.ts` line 4326 + `GrottaBarChart.tsx` lines 75-97; Qiu/RESCUE BT JAMA 2022.
- **Proposed fix:** Change direction to "negative" or "neutral"; add a code comment noting the CI-crosses-1.0 guard currently masks this. No user-visible change today.
- **Class:** E

**M5 - RESCUE BT CI and p-value off from published**
- **Locus:** `src/data/trialData.ts` / `rescue-bt-trial` / ordinalStats (line 4326) + mirrored prose
- **What is wrong:** ciLow 0.87 / ciHigh 1.34 / pValue 0.51 deviate from published 0.86 / 1.36 / 0.50. Small but consistent across GrottaBar display, howToReadChart, howToInterpret, bottomLine; no clinical conclusion changes (still null).
- **Source:** PMC9364124 / JAMA 2022;328:543-553 (adjusted cOR 1.08, 95% CI 0.86-1.36, P=.50).
- **Proposed fix:** Correct to ciLow 0.86, ciHigh 1.36, pValue 0.50 at line 4326 and in mirrored prose. Separately log: repo cites sICH P=0.04 but the primary source reports adjusted sICH OR 1.56 (0.97-2.56) P=0.07 (out of scope of this finding).
- **Class:** E

**M6 - MR CLEAN-NO IV headlines mortality instead of primary ordinal endpoint**
- **Locus:** `src/data/trialData.ts` / `mr-clean-no-iv-trial` / efficacyResults (lines 3095-3106)
- **What is wrong:** efficacyResults displays 90-day mortality (20.5% vs 15.8%, a secondary/safety outcome) as the primary visual result rather than the primary ordinal mRS endpoint (cOR 0.84). The renderer builds the results string directly from efficacyResults.
- **Source:** `trialData.ts` lines 3059/3095-3106/3134/3146; `TrialPageNew.tsx` line 105; LeCouffe NEJM 2021 (NEJMoa2107727).
- **Proposed fix:** Repopulate efficacyResults with the primary ordinal mRS surface (mRS 0-2 ~39.7% vs ~44.3%, or the cOR); move mortality to a clearly labeled secondary/safety slot.
- **Class:** E

**M7 - BEST-II schema-illegal design pairing and inaccurate "futility-stopped"**
- **Locus:** `src/data/trialData.ts` / `best-ii-trial` / primaryDesign + primaryResult (lines 4527-4528)
- **What is wrong:** Schema-illegal pairing of estimation-strategy + futility-stopped (schema requires estimation-strategy → leave both null). "futility-stopped" is also factually wrong: the trial enrolled its full 120 patients, was not stopped early, and the futility test (P=0.93) did not cross the boundary.
- **Source:** `trialData.ts` lines 338-339/355/4527-4528; Mistry et al. JAMA 2023 BEST-II (PMC10481231).
- **Proposed fix:** Retain primaryDesign "estimation-strategy" and set primaryResult to null (document the futility non-crossing in applicability prose). Do not use "futility-stopped". If the renderer requires a result label, escalate to add a schema-legal option; do not adopt the finder's dose-finding-safety suggestion without architect review.
- **Class:** E

**M8 - CHARM inclusion age summary inconsistent with eligibility**
- **Locus:** `src/data/trialData.ts` / `charm-trial` / inclusionCriteria vs fullEligibility (lines 5049 vs 5069)
- **What is wrong:** inclusionCriteria caps age at 18-80, but fullEligibility and the publication state 18-85; internal inconsistency and factual error.
- **Source:** Sheth et al., Lancet Neurol 2024;23(12):1205-1213; PMID 39577921; in-repo fullEligibility.
- **Proposed fix:** Change inclusionCriteria[0] to "Age 18-85 years (primary efficacy analysis restricted to 18-70)".
- **Class:** C-clinical

**M9 - TIMING ARD without a confidence interval**
- **Locus:** `src/data/trialData.ts` / `timing-trial` / stats.effectSize + legend.keyStat + howToInterpret.proves (lines 5966-5969, 6116, 6092)
- **What is wrong:** The primary NI absolute risk difference (-1.79%) is displayed without any CI anywhere, violating the ARD-requires-CI rule for a noninferiority trial.
- **Source:** Oldgren et al., Circulation 2022; PMID 36065821 (ARD -1.79%, 95% CI -5.31% to +1.74%); trial-statistics skill L13, L126.
- **Proposed fix:** Add the CI wherever the ARD appears (e.g., effectSize "ARD -1.79 pp (95% CI -5.31 to +1.74)"; legend.keyStat "RD -1.79% (95% CI -5.3 to +1.7)"); quote the +1.74 pp upper bound vs the 3 pp NI margin.
- **Class:** C-clinical

**M10 - TRACE-III ARD without a confidence interval**
- **Locus:** `src/data/trialData.ts` / `trace-iii-trial` / stats.effectSize (lines 7613-7616)
- **What is wrong:** ARD (8.8 pp) shown without a CI; the only CI present is the relative rate ratio (1.37, 95% CI 1.04-1.81), not the ARD. NNT 11.4 likewise has no CI.
- **Source:** Repo lines 7600-7747 + trial-statistics skill; ARD CI not independently retrieved from Xiong NEJM 2024 (recommend evidence-verifier pull).
- **Proposed fix:** Add the 95% CI for the 8.8 pp ARD (or a new stats.absoluteReduction field with a CI). Pull the ARD CI from Xiong NEJM 2024; if unavailable, derive from the control rate (24.2%) and rate-ratio CI and note the derivation. Do not display a hand-derived ARD CI without evidence-verifier sign-off.
- **Class:** E

**M11 - ATTENTION pre-stroke mRS eligibility inconsistent across fields**
- **Locus:** `src/data/trialData.ts` / `attention-trial` / inclusionCriteria[4] vs inclusionCriteria[0] and fullEligibility.exclusion (lines 8005-8022)
- **What is wrong:** inclusionCriteria[4] says "pre-stroke mRS ≤2" with no age qualifier, but the age-stratified rule (≥80y requires mRS 0) is encoded in inclusionCriteria[0] and fullEligibility. A reader using criteria[4] alone would wrongly accept mRS 1-2 in patients ≥80y.
- **Source:** Repo lines 8004-8023 (fullEligibility from ClinicalTrials.gov NCT04751708).
- **Proposed fix:** Revise inclusionCriteria[4] to "...pre-stroke mRS ≤2 (<80y) or mRS 0 only (≥80y)". Cross-check final wording against Tao NEJM 2022 during clinical review.
- **Class:** C-clinical

**M12 - ELAN listCategory mislabels DOAC as antiplatelet**
- **Locus:** `src/data/trialData.ts` / `elan-study` / listCategory (line 9963)
- **What is wrong:** listCategory is "antiplatelets"; ELAN tests DOACs (anticoagulants). The renderer shows a capitalized mechanism badge ("Antiplatelets") that is factually wrong. The listing-page placement is already correct via a separate `trialListData.ts` "secondary-prevention" mapping, and the finder's proposed value "anticoagulants" is not a member of the listCategory union (would not typecheck).
- **Source:** `trialData.ts` L214 (type union), L9963; `trialListData.ts` L574; `TrialPageNew.tsx` L451-452.
- **Proposed fix:** Either extend the listCategory union to add "anticoagulants" plus badge label and mapping (wider blast radius), or correct to the closest valid value and rely on the existing secondary-prevention listing mapping.
- **Class:** D-clinical

**M13 - REDUCE tagged binary-superiority despite time-to-event primary**
- **Locus:** `src/data/trialData.ts:17204-17384` / `reduce-trial` - listDescription (17217), legend (17379), primaryDesign (17218)
- **What is wrong:** primaryDesign tagged "binary-superiority" and NNT ~28 shown in one-liners without a KM-derivation caveat, but the pre-specified primary is time-to-event (log-rank p, HR 0.23). The detail view is caveated; only the summary surfaces are not.
- **Source:** `trialData.ts:17303-17306` (primaryEndpoint "Time-to-event through ≥24 months", HR 0.23) + clinical-trial-audit and trial-statistics skills.
- **Proposed fix:** Set primaryDesign to a time-to-event framework (or the repo's nearest value); append "(derived from 24-month KM rates)" to the NNT in listDescription and legend.
- **Class:** E

**M14 - RAISE primaryDesign loses the noninferiority-first design**
- **Locus:** `src/data/trialData.ts` / `raise-trial` / primaryDesign (line 14022) + stats.pValue.label (line 14042)
- **What is wrong:** primaryDesign tagged "binary-superiority" when RAISE was a phase 3 noninferiority trial with pre-specified hierarchical superiority testing (RR 1.13, 95% CI 1.05-1.21, P<0.001 NI then P=0.002 superiority, NI margin 0.93). Tagging loses the NI-first design and the ni-margin display archetype.
- **Source:** Li et al., NEJM 2024 (NEJMoa2400314); RAISE design paper PMID 38286482.
- **Proposed fix:** Per repo schema (lines 348-356), "noninferiority" cannot pair with "met"; route to medical-scientist. Options: primaryDesign "noninferiority" + primaryResult "noninferiority-established" with secondary capturing superiority, or a design note. Clarify pValue label to "NI established (P<0.001); superior (P=0.002)".
- **Class:** E

**M15 - IMS-III RR CI lower bound inconsistent within the entry**
- **Locus:** `src/data/trialData.ts` / `ims-iii-trial` / pearls[1] (14840) vs listDescription (14813), stats.effectSize.label (14818), primaryOutcomeProse (14847), bottomLineSummary (14856)
- **What is wrong:** pearls[1] states "adjusted RR 1.05, 95% CI 0.85-1.30" while four other fields say "0.83-1.30". A single statistic cannot have two lower bounds. The published RR CI could not be confirmed from the abstract (NEJM 2013 reports the primary as absolute adjusted difference 1.5%, 95% CI -6.1 to 9.1%), so which bound is correct is uncertain, but the inconsistency is confirmed.
- **Source:** Direct file read (lines 14813, 14818, 14840, 14847, 14856); NEJM 2013 IMS-III.
- **Proposed fix:** Harmonize pearls[1] to "0.83-1.30" (the 3-of-4 majority + stat card). Before finalizing, have evidence-verifier confirm the published RR CI lower bound against the NEJM 2013 full text/supplement.
- **Class:** E

**M16 - MR RESCUE center count and geography wrong**
- **Locus:** `src/data/trialData.ts:15082` / `mr-rescue-trial` / trialDesign.type[0]
- **What is wrong:** "Multicenter phase 2 RCT, 9 US centers" should be 22 North American centers (both count and geography wrong).
- **Source:** Endovascular Today MR RESCUE report + Kidwell NEJM 2013 (DOI 10.1056/NEJMoa1212793).
- **Proposed fix:** Change to "Multicenter phase 2b RCT, 22 North American centers". Verify exact wording against Kidwell NEJM 2013 methods before applying.
- **Class:** C-clinical

**M17 - BAOCHE/ATTENTION citations carry an unresolved verbatim-quote flag**
- **Locus:** `src/lib/citations/registry.ts:93` and `:103` - citations `baoche-trial-2022` and `attention-trial-2022` quoted_text
- **What is wrong:** Both quoted_text fields literally append "[Secondary-source synthesis pending verbatim NEJM access.]" - §13.6 checklist item 1 (verbatim primary-source text) never completed. The synthesized content is clinically accurate; the verbatim-quote paperwork is incomplete.
- **Source:** registry.ts lines 85-104; NEJM abstract conclusions for BAOCHE (PMID 36239645) and ATTENTION (PMID 36239644).
- **Proposed fix:** Replace both quoted_text values with verbatim conclusion sentences from the published NEJM abstracts, drop the flag, and complete §13.6 item 1. No clinical-logic change.
- **Class:** C-clinical

**M18 - Duplicate CREST-2 registry entries with split source-of-truth**
- **Locus:** `src/lib/citations/registry.ts` - `brott-crest-2-2025` (line 930) and `brott-crest-2-2026` (line 686)
- **What is wrong:** Two registry entries map to the identical CREST-2 publication (DOI 10.1056/NEJMoa2508800, PMID 41269206) with inconsistent IDs, titles, last_reviewed dates, and quoted_texts; two separate claims each point to a different ID.
- **Source:** registry.ts lines 686-696 and 930-940; claims.ts lines 372-381 and 513-517.
- **Proposed fix:** Retire "brott-crest-2-2025"; keep "brott-crest-2-2026" as canonical. Redirect claim "crest-2-asymptomatic-2025" citation_ids to "brott-crest-2-2026".
- **Class:** D-clinical

**M19 - BP-control guideline card omits promised targets**
- **Locus:** `src/lib/citations/claims.ts` (claim `bp-control-guideline-summary`, line 306) + citation `aha-asa-2026-4.3` (registry.ts line 256)
- **What is wrong:** The claim description promises the card surfaces pre-IVT ≤185/110 and post-IVT ≤180/105 BP targets, but the only mapped citation's quoted_text contains only the post-EVT <140 harm finding; the card renders quoted_text verbatim, so the promised targets never appear.
- **Source:** `GuidelineSummaryCard.tsx`; registry.ts:264; `aha2026StrokeGuideline.ts` lines 193, 198, 205, 210, 217.
- **Proposed fix:** Either expand aha-asa-2026-4.3 quoted_text to include the pre-IVT and post-IVT targets, or add additional §4.3 citations to the claim's citation_ids so the card renders all three rows; then correct the description.
- **Class:** E

**M20 - THEIA first author misattributed**
- **Locus:** `src/data/clinicalSynthesesByQuestion.ts` / `crao-management` bodyParagraphs[2] (line 140)
- **What is wrong:** THEIA first author listed as "Sibon et al."; the verified first author is Préterre C. The repo's own evidence packet and registry id already say Préterre.
- **Source:** PubMed PMID 41109232; `docs/evidence-packets/theia-2026-05-20.md:14`; registry.ts:1081, 1089.
- **Proposed fix:** Change "THEIA (Sibon et al., Lancet Neurology 2025)" to "THEIA (Préterre et al., Lancet Neurology 2025)".
- **Class:** C-clinical

**M21 - CREST-2 stenting benefit labeled with wrong statistical measure**
- **Locus:** `src/data/clinicalSynthesesByQuestion.ts` / `asymptomatic-carotid` bodyParagraphs (line 62)
- **What is wrong:** CREST-2 stenting benefit labeled "HR 0.45" (endarterectomy "HR 0.69") - wrong measure and wrong value; the paper reports absolute risk difference (primary) and relative risk, not a hazard ratio. "0.45" is the crude inverted rate ratio (2.8/6.0).
- **Source:** PubMed PMID 41269206; `docs/evidence-packets/crest-2-2026-05-20.md:42, 52, 67`.
- **Proposed fix:** Replace "HR 0.45" with "ARD 3.2 pp (95% CI 0.6-5.9), RR 2.13 (medical/stenting), P=0.02" and "HR 0.69" with "ARD 1.6 pp (95% CI -1.1 to 4.3), RR 1.43, P=0.24 (not met)"; drop the HR label.
- **Class:** E

**M22 - NIHSS calculator vascular-imaging trigger mis-cited**
- **Locus:** `src/pages/NihssCalculator.tsx` line 681 + claim `nihss-severity-interpretation-2026` (claims.ts:639)
- **What is wrong:** The vascular-imaging trigger (CTA head/neck for EVT triage) is attributed to §4.7.2 (EVT eligibility), which does not cover imaging acquisition. The CTA-for-thrombectomy recommendation lives in Section 3 (Imaging).
- **Source:** registry.ts:555-568 (aha-asa-2026-4.7.2 quoted_text) + `aha2026StrokeGuideline.ts:141-146` (vascular imaging rec).
- **Proposed fix:** Re-cite the imaging-trigger clause to a Section-3 imaging citation, not §4.7.2. Note: the finder's proposed §4.4 is itself wrong (§4.4 is Temperature Management); create a new registry citation (e.g., aha-asa-2026-3.x "Vascular imaging for EVT candidates"), add it to the claim's citation_ids, and update the visible "§4.7.2" text.
- **Class:** E

**M23 - mRS calculator lists NINDS under mRS 0-2 threshold**
- **Locus:** `src/pages/MrsCalculator.tsx:391` + claim `mrs-outcome-context` (claims.ts:942-947)
- **What is wrong:** NINDS is listed among trials using mRS 0-2 as the "good outcome" threshold; NINDS's primary used mRS dichotomized at 0-1 within a global statistic. Grouping it with DAWN/DEFUSE-3/SELECT-2 mis-states the endpoint. The claim description repeats the error.
- **Source:** `MrsCalculator.tsx:391` + claims.ts:946 + NINDS NEJM 1995 (Part II global statistic, mRS 0-1).
- **Proposed fix:** Remove NINDS from the mRS 0-2 list (or annotate "NINDS used mRS 0-1 within a 4-scale global statistic"); correct claims.ts:946.
- **Class:** E

**M24 - mRS calculator misframes prestroke mRS as an IVT eligibility gate**
- **Locus:** `src/pages/MrsCalculator.tsx` line 380 (prestroke mRS 0-1 body) + claim `mrs-prestroke-evt-eligibility` (claims.ts:935-940) + citation `aha-asa-2026-4.6.1`
- **What is wrong:** Text asserts prestroke mRS 0-1 "satisfies the baseline-function criterion for EVT ... and for IVT within 4.5 h", and the claim maps to §4.6.1 (IVT decision-making). But §4.6.1 lists no prestroke-mRS criterion; prestroke mRS 0-1 is an EVT-only criterion.
- **Source:** `aha2026StrokeGuideline.ts` §4.6 IVT recommendations (lines 272-411) + evtRecommendations (415-500); registry.ts aha-asa-2026-4.6.1 quoted_text.
- **Proposed fix:** Remove or requalify "...and for IVT within 4.5 h"; drop aha-asa-2026-4.6.1 from the claim's citation_ids, leaving aha-asa-2026-4.7.2.
- **Class:** E

**M25 - HAS-BLED four-tier scheme not sourced to the on-file citation**
- **Locus:** `src/data/hasBledScoreData.ts` lines 31/53-57/73 - HASBLED_RISK_LABELS + 4-tier scheme (very_high at ≥4)
- **What is wrong:** The four-tier scheme (low/moderate/high/very_high) with "very high" at ≥4 is not sourced to the on-file citation (Pisters 2010), which uses three tiers (low 0-1, intermediate 2, high ≥3). No primary source places a "very high" band at ≥4.
- **Source:** Repo lines 7-16, 53-57, 73; Pisters 2010 (3-tier via MDCalc/Wikipedia/MedCalcu).
- **Proposed fix:** Either collapse to the Pisters 3-tier scheme, or retain 4 tiers and register a secondary citation defining the ≥4/≥5 "very high" band, with a code comment attributing the 4th tier.
- **Class:** C-clinical

**M26 - HERMES control rate stated as 29%**
- **Locus:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:612`
- **What is wrong:** HERMES mRS 0-2 control rate stated as 29%; published rate is 26.5% (thrombectomy 46% is correct). The finder's own proposed correction (44.6% vs 31.8%) is also wrong - 44.6% is the DEFUSE-3 thrombectomy rate one line below, so the finder conflated sources. Correct fix is 46% vs 26.5%.
- **Source:** Concordant summaries of Goyal HERMES 2016 (46.0% vs 26.5%, ARD 19.5%); PMID 26898852.
- **Proposed fix:** Change the control rate from 29% to 26.5%. Do not apply the finder's 44.6%/31.8%. Pair with H18 and register a claim ID + HERMES citation.
- **Class:** E

*(Note: H18 and M26 are two findings on the same line 612 - the NNT misattribution and the control-rate error. A separate duplicate submission also flagged both at line 612 as one compound finding; consolidate into a single line-612 fix.)*

**M27 - Emberson "4% per 15 min" figure misattributed**
- **Locus:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:520`
- **What is wrong:** "Every 15-minute delay reduces probability of good outcome by 4% (Emberson et al, Lancet 2014)" - that specific per-15-min metric is not a primary result of the cited paper, which reports proportional benefit by time window and absolute gains of ~10% (<3h) / ~5% (3-4.5h). The per-15-min metric traces to other analyses (e.g., Saver).
- **Source:** Emberson et al., Lancet 2014;384:1929-35; PMID 25106063.
- **Proposed fix:** Re-source the figure to the correct paper, relabel it a modeled/derived estimate, or replace it with a statement Emberson supports. Register the claim in CLAIM_REGISTRY.
- **Class:** E

**M28 - Hemicraniectomy age cutoff off-by-one and missing branch**
- **Locus:** `src/pages/guide/AcuteStrokeMgmt.tsx:93`
- **What is wrong:** Hemicraniectomy stated as "<60 y" with midline shift as trigger; the guideline and the repo's own 2026 data use "≤60 years" with "malignant cerebral edema / neurological deterioration" as the trigger, plus a separate >60y (COR 2a) recommendation the guide omits. "<60" excludes exactly-age-60 patients whom the COR 1 rec includes.
- **Source:** `aha2026StrokeGuideline.ts:800` (≤60y, COR 1) and line 805 (>60y, COR 2a).
- **Proposed fix:** Change "<60 y" to "≤60 y"; reframe the trigger to malignant cerebral edema with neurological deterioration despite medical therapy; add a brief ">60y: individualized" note.
- **Class:** E

**M29 - Cerebellar ICH surgery omits the >15 mL indication and downgrades LOE**
- **Locus:** `src/pages/guide/IchManagement.tsx:87,89` (Surgery subsection - cerebellar threshold)
- **What is wrong:** Cerebellar ICH surgical indication stated as ">3 cm WITH neurological decline OR brainstem compression OR hydrocephalus"; the 2022 AHA/ASA guideline added large volume (>15 mL) as an independent indication (Class 1, LOE B-NR). The page uses a generic "Level B" and a diameter-only framing.
- **Source:** 2022 AHA/ASA ICH guideline; `registry.ts:374-383` (aha-asa-2022-ich-surgery quoted_text, Class 1, Level B-NR).
- **Proposed fix:** Reword to include volume >15 mL as a standalone trigger with Class 1, LOE B-NR; keep >3 cm only as an informal bedside proxy if desired, not as the governing criterion.
- **Class:** E

**M30 - STICH II characterized as showing benefit**
- **Locus:** `src/pages/guide/IchManagement.tsx:87` (Surgery subsection - STICH II detail prop)
- **What is wrong:** STICH II characterized as "surgery within 12 h had small benefit" - the trial did not meet its primary endpoint (41% vs 38%, OR 0.86, 95% CI 0.62-1.20, P=0.367) and the mortality signal was non-significant (P=0.095).
- **Source:** `registry.ts:396-405`; `clinicalSynthesesByQuestion.ts:108` (Mendelow 2013, Lancet, PMID 23726393).
- **Proposed fix:** Change the detail to state the trial missed its primary endpoint with a non-significant mortality trend; "benefit not proven".
- **Class:** E

**M31 - Thrombectomy guide omits NIHSS ≥6 from the indications list**
- **Locus:** `src/pages/guide/Thrombectomy.tsx:50-52` (Section 1 - Indications)
- **What is wrong:** NIHSS ≥6 is absent from the EVT indication list (occlusion, mRS, time only); the 2026 guideline requires NIHSS ≥6 across all anterior-circulation windows.
- **Source:** `aha2026StrokeGuideline.ts:423-460` (every anterior entry carries nihss ≥6).
- **Proposed fix:** Add "NIHSS ≥6" and "ASPECTS 3-10 (early) / ≥6 (late)" to the Indications summary alongside occlusion, mRS, and time.
- **Class:** E

**M32 - Thrombectomy guide over-mandates perfusion mismatch for late window**
- **Locus:** `src/pages/guide/Thrombectomy.tsx:67-71` (Section 2 - Late Window 6-24h)
- **What is wrong:** Late-window selection framed as requiring DAWN/DEFUSE-3 criteria with CTP or MRI clinical-core mismatch; the 2026 guideline selects late-window EVT by ASPECTS (≥6, or 3-5 selected) at COR 1, LOE A and does not mandate perfusion mismatch for anterior-circulation EVT.
- **Source:** `aha2026StrokeGuideline.ts:432-463` (6-24h) and 143-145 (vascular imaging COR 1 LOE A).
- **Proposed fix:** Reframe late-window selection around ASPECTS ≥6 (COR 1, LOE A) or ASPECTS 3-5 in selected patients (age <80, NIHSS ≥6, no significant mass effect), with CTA/MRA to confirm LVO. Present DAWN/DEFUSE-3 as the historical trial basis and CTP/MRI mismatch as optional, not mandatory.
- **Class:** E

**M33 - Thrombectomy guide softens a COR 3 (No Benefit) recommendation**
- **Locus:** `src/pages/guide/Thrombectomy.tsx:80` (Section 3 - Distal/MeVO)
- **What is wrong:** Non-dominant M2/ACA/PCA EVT described as "evidence for routine EVT is limited"; the 2026 AHA/ASA rates it COR 3: No Benefit, LOE A (a strong negative recommendation), which reads as equipoise rather than a positive-against recommendation.
- **Source:** `aha2026StrokeGuideline.ts:490-503`.
- **Proposed fix:** Distinguish the categories: dominant M2 = COR 2a, LOE B-NR ("benefit uncertain"); nondominant/codominant M2, distal MCA, ACA, PCA = COR 3 No Benefit, LOE A ("should not be used routinely; DISTAL, ESCAPE-MeVO negative"). Surface the hidden detail tooltip's DISTAL/ESCAPE-MeVO note in the visible prose.
- **Class:** E

**M34 - IV-tPA door-to-needle headline uses recognition threshold, not guideline benchmark**
- **Locus:** `src/pages/guide/IvTpa.tsx:41`
- **What is wrong:** Door-to-needle headline stated as "<45 min"; the 2026 AHA/ASA benchmark is <60 min (90th pct) with a median ≤30 min goal. The 45-min figure is the Target: Stroke Honor Roll Elite Plus recognition tier, not the guideline standard. Internal contradiction: `medicalGlossary.ts:125-126` and `StrokeBasicsWorkflowV2.tsx:793` both say <60 min.
- **Source:** 2026 AHA/ASA stroke guideline (DTN median ≤30 / 90th pct ≤60); AHA Target: Stroke Elite Plus criteria; in-repo cross-refs.
- **Proposed fix:** Change the headline to "Door-to-needle <60 min (goal ≤30 min)". If <45 min is kept, label it explicitly as a Target: Stroke Elite Plus stretch goal.
- **Class:** E

**M35 - Untagged clinical prose bypasses the registry (guide batch 1)**
- **Locus:** `src/pages/guide/AlteredMentalStatus.tsx`, `IchManagement.tsx`, `MultipleSclerosis.tsx`, `SeizureWorkup.tsx`, `Thrombectomy.tsx` - clinical prose
- **What is wrong:** These five pages carry zero `data-claim` tags; `scripts/check-claims.ts` validates only tags that are present and has no untagged-prose coverage check, so these claims are invisible to the hook (matches CLAUDE.md §13.1). This is a coverage gap, not a hard-rule breach - tagging is phased/opt-in, so no commit is currently blocked. (Finder's "high/every element MUST be tagged" framing overstated enforcement; downgraded to medium.)
- **Source:** grep `data-claim` src/pages/guide/*.tsx (only PostStrokeLipidManagement matches); `scripts/check-claims.ts` lines 52-99.
- **Proposed fix:** Governance decision, not a mechanical code fix: either add `data-claim` tags mapping each actionable statement to a CLAIM_REGISTRY entry, or accept phased rollout and track these pages as an untagged-backlog item in TASKS.md. Do not bulk-tag without medical-scientist authoring each claim→citation mapping. Consolidate with M36 into a single backlog task.
- **Class:** D-clinical

**M36 - Untagged clinical prose bypasses the registry (guide batch 2)**
- **Locus:** `src/pages/guide/IvTpa.tsx`, `Gbs.tsx`, `MyastheniaGravis.tsx`, `StatusEpilepticus.tsx`, `Vertigo.tsx` - clinical prose
- **What is wrong:** Same mechanism as M35 on a second page set: zero `data-claim` tags, claims bypass the hook. Coverage gap, not a blocked-merge condition. (Finder's "high" downgraded to medium for the same reason as M35.)
- **Source:** grep `data-claim` src/pages/guide/*.tsx; `scripts/check-claims.ts` lines 52-99.
- **Proposed fix:** Same as M35 - track as a phased coverage-backlog item or author claim→citation mappings per page. This finding and M35 are the same governance gap on different page sets; merge into one backlog task.
- **Class:** D-clinical

---

### 2.3 Low severity

**L1 - EAGLE effectSize is an unlabeled secondary outcome**
- **Locus:** `src/data/trialData.ts` / `eagle-trial` / stats (lines 1345-1362) + efficacyResults (1371-1382)
- **What is wrong:** stats.primaryEndpoint labels "BCVA Change at 1 Month" (continuous primary, P=0.69) while stats.effectSize shows "-2.9% No Benefit" derived from the secondary dichotomized outcome (57.1% vs 60.0%); the two stats fields reference different outcomes without labeling. The trial is negative on both endpoints, so no clinical action is misdirected.
- **Source:** Schumacher M et al., Ophthalmology 2010;117:1367-1375; DOI 10.1016/j.ophtha.2010.03.061.
- **Proposed fix:** Label the effectSize explicitly as the secondary dichotomized outcome, or replace it with a primary-endpoint descriptor (mean BCVA/logMAR change, NS, P=0.69).
- **Class:** C-clinical

**L2 - INSPIRES publication-year error in timeline**
- **Locus:** `src/data/trialData.ts` / `inspires-trial` / trialDesign.timeline (line 10409)
- **What is wrong:** timeline says "published NEJM 2024"; the paper was published December 28, 2023. Every other field agrees (2023); only timeline is wrong.
- **Source:** PubMed PMID 38157499 (publication_date 2023-12-28); N Engl J Med 2023;389(26):2413-2424.
- **Proposed fix:** timeline: "Enrolled 2019-2023; published NEJM December 2023".
- **Class:** C-clinical

**L3 - CREST secondary HR without a CI**
- **Locus:** `src/data/trialData.ts` / `crest-trial` / pearls entry 8 (line 11147)
- **What is wrong:** Secondary endpoint HR 1.50 cited without its 95% CI (1.05-2.15). The lower bound of 1.05 barely clears 1.00, which materially affects how robust the signal reads.
- **Source:** Brott NEJM 2010; PMC2932446 (6.4% vs 4.7%, HR 1.50, 95% CI 1.05-2.15, P=0.03).
- **Proposed fix:** "Stroke or death at 4 years (secondary): 6.4% CAS vs 4.7% CEA, HR 1.50 (95% CI 1.05-2.15), P=0.03."
- **Class:** C-clinical

**L4 - NOR-TEST 2 Part A OR CI upper bound off by 0.02**
- **Locus:** `src/data/trialData.ts:13479, 13481` / `nor-test-2-part-a-trial` / howToInterpret.proves and .cautions
- **What is wrong:** Repo states "OR 0.45, 95% CI 0.25-0.82"; primary source gives 0.25-0.80.
- **Source:** PubMed PMID 35525250 (Kvistad, Lancet Neurol 2022): "unadjusted OR 0.45 [95% CI 0.25-0.80]; p=0.0064".
- **Proposed fix:** Change "0.25-0.82" to "0.25-0.80" at both lines. Point estimate and p-value are already correct.
- **Class:** E

**L5 - TIMELESS pearl quotes TRACE-III numbers without attribution**
- **Locus:** `src/data/trialData.ts:14490` / `timeless-trial` / bedsidePearl
- **What is wrong:** The pearl quotes "late-window tenecteplase improved mRS 0-1 from 24.2% to 33.0% (NNT 11)" - these are TRACE-III numbers, not TIMELESS (which is neutral). The figure is accurate but unattributed, so a skimming reader could attribute NNT 11 to TIMELESS.
- **Source:** Direct read of TIMELESS bedsidePearl (14490) and TRACE-III entry (7744-7749).
- **Proposed fix:** Add explicit attribution ("The contrast is TRACE-III (Lancet 2024): ..."). No NNT should be attributed to TIMELESS itself.
- **Class:** C-clinical

**L6 - RESCUE-Japan LIMIT NNT stated inconsistently across fields**
- **Locus:** `src/data/trialData.ts` / `rescue-japan-limit-trial` (listDescription L15884, calculations.nnt L15953, pearl L15959, bedsidePearl L15976, howToReadChart L15985, howToInterpret.proves L15997, bottomLineSummary L15977)
- **What is wrong:** calculations.nnt=5.5 and howToReadChart say "NNT 5.5 / 5 to 6", but multiple narrative surfaces say a bare "NNT 5" and absoluteReduction.info says "approximately 5". ARD 18.3 pp gives 1/0.183 = 5.46; round-up convention gives 6, so a bare "NNT 5" is the least defensible variant.
- **Source:** Repo fields above; arithmetic; NNT rounding convention.
- **Proposed fix:** Standardize every narrative surface to "NNT 5-6" (or "NNT ~6"). Do not leave a bare "NNT 5".
- **Class:** E

**L7 - REDUCE nntExplanation arithmetically inconsistent**
- **Locus:** `src/data/trialData.ts` / `reduce-trial` / calculations.nntExplanation (~line 17326)
- **What is wrong:** nntExplanation says NNT ~28 was "Computed from the 24-month event-rate difference of approximately 4 percentage points", but 1/0.04 = 25, not 28. The displayed NNT (28) is the authors' correct KM-derived figure (~3.6 pp); the explanatory clause conflates two different rate differences. Only the explanatory sentence is wrong.
- **Source:** Repo entry + web corroboration of the authors' NNT 28 at 2y.
- **Proposed fix:** Reword nntExplanation to state the NNT 28 derives from the KM 24-month event-rate difference (~3.6 pp), not the crude 4.0 pp 3.2-year difference. Do not change the displayed NNT.
- **Class:** C-clinical

**L8 - robblee-ahs citation year mismatch**
- **Locus:** `src/lib/citations/registry.ts:1323-1333` (`robblee-ahs-2025`)
- **What is wrong:** Year field is 2025 while the journal of record is Headache 2026;66:53-76 (online-first 2025). Bibliographic mismatch; clinical Levels match the quoted_text.
- **Source:** registry.ts:1326-1328 (title cites "Headache 2026;66:53-76"; year: 2025).
- **Proposed fix:** Set year: 2026 to match the citable print volume (or add an explicit online-first date field), keeping the section note. Metadata-only.
- **Class:** C-clinical

**L9 - WAKE-UP favorable-outcome threshold omitted**
- **Locus:** `src/pages/guide/StrokeBasicsWorkflowV2.tsx:523`
- **What is wrong:** WAKE-UP "favorable outcomes" (53.3% vs 41.8%) omits the mRS 0-1 threshold, allowing readers to assume the more common mRS 0-2 standard and mis-compare with other trials. Numbers are exactly correct; the label is incomplete.
- **Source:** WAKE-UP NEJM 2018 (NEJMoa1804355); repo lines 523, 530.
- **Proposed fix:** Amend to "resulted in 53.3% vs 41.8% achieving an excellent outcome (mRS 0-1) at 90 days." No number changes.
- **Class:** C-clinical

**L10 - PRISMS on-screen sICH rate not in the cited quote**
- **Locus:** `src/pages/NihssCalculator.tsx` line 717 + claim `nihss-minor-disabling-check` (claims.ts:960-968) + citation `prisms-trial-2018`
- **What is wrong:** The verdict asserts "PRISMS ... higher sICH (3.2% vs 0%)", but the registered prisms-trial-2018 quoted_text says only "increased the risk of symptomatic intracranial hemorrhage" - the specific rates are not in the cited quote. The statistic is accurate; this is a traceability gap (§13.1). PRISMS also enrolled NIHSS 0-5 while the UI activates at NIHSS 1-4.
- **Source:** PubMed PMID 29998337 (Khatri JAMA 2018): 5/156 alteplase [3.2%] vs 0/157 aspirin, n=313, NIHSS 0-5.
- **Proposed fix:** Add the verbatim sICH rates to prisms-trial-2018 quoted_text; optionally note the NIHSS 0-5 range.
- **Class:** C-clinical

**L11 - Verapamil ECG-monitoring instruction unsourced in registry**
- **Locus:** `src/components/pathways/headache/HeadacheManagement.tsx` line 134 + claim `clinic-headache-cluster-preventive` (claims.ts:850-855)
- **What is wrong:** "Verapamil 80 mg TID, titrate to 360 mg/day with baseline and follow-up ECG" - the ECG-monitoring instruction is not present in any of the three cited quoted_texts. The instruction is clinically correct but unsourced in the registry (traceability gap).
- **Source:** registry.ts quoted_texts for leone-verapamil-cluster-2000 / bussone-1990 / burish-2024-continuum-cluster; web (Delphi cardiac-monitoring consensus PMID 26868817).
- **Proposed fix:** Register a primary source that explicitly recommends verapamil ECG monitoring in cluster headache and bind it to the claim, or remove the ECG note until sourced.
- **Class:** C-clinical

**L12 - Chronic-migraine preventive cites an episodic-only guideline**
- **Locus:** `src/components/pathways/headache/HeadacheManagement.tsx` line 189 + claim `clinic-headache-chronic-migraine-preventive` (claims.ts:876-881) + citation `silberstein-aan-ahs-migraine-prevention-2012`
- **What is wrong:** The chronic-migraine preventive claim cites the AAN-AHS 2012 guideline, whose own quoted_text carries "CAVEAT: this guideline strictly applies to episodic migraine prevention." Partially offset because ailani-ahs-2021 (also cited) covers chronic-migraine preventives, so the ladder is not left unsourced.
- **Source:** registry.ts silberstein-aan-ahs-migraine-prevention-2012 + ailani-ahs-2021 quoted_texts; claims.ts:876-881.
- **Proposed fix:** Remove silberstein-aan-ahs-migraine-prevention-2012 from the citation_ids (the rest support on ailani-ahs-2021), or retain it explicitly labeled as an episodic-only historical reference.
- **Class:** C-clinical

**L13 - ABCD2 moderate-tier explanation opens with a conflicting label**
- **Locus:** `src/data/abcd2ScoreData.ts` / ABCD2_DRAWER_EXPLANATION.moderate (line 103)
- **What is wrong:** The moderate-risk tier explanation opens with the guideline term "High-risk TIA", conflicting with the "Moderate risk" tier label displayed for the same score. DAPT content is clinically correct (score 4-5 is genuinely ≥4); this is a copy/labeling clarity issue. (Finder's medium corrected to low.)
- **Source:** `aha2026StrokeGuideline.ts:570` (daptForMinorAIS, ABCD2 ≥4) + abcd2ScoreData.ts lines 62-66, 103.
- **Proposed fix:** Reword the moderate-tier explanation to bridge the labels, e.g., "ABCD2 ≥4 - meets the high-risk TIA threshold for DAPT per AHA/ASA 2026 §4.8..." rather than the bare "High-risk TIA".
- **Class:** C-clinical

**L14 - ABCD2 low-tier explanation omits the DAPT-not-indicated statement**
- **Locus:** `src/data/abcd2ScoreData.ts` / ABCD2_DRAWER_EXPLANATION.low (line 102)
- **What is wrong:** The low-risk explanation (score 0-3) does not explicitly state DAPT is not indicated below ABCD2 4. SAPT is the correct call for this tier and is stated, so this is a completeness/clarity gap, not a misstatement. (Finder's medium corrected to low.)
- **Source:** `aha2026StrokeGuideline.ts:570` + abcd2ScoreData.ts lines 78, 102.
- **Proposed fix:** Add a clause: "DAPT is not indicated below ABCD2 4; single antiplatelet therapy is appropriate for this tier."
- **Class:** C-clinical

**L15 - CHA₂DS₂-VASc score-7 non-monotonic dip without an in-table caveat**
- **Locus:** `src/pages/Cha2ds2VascCalculator.tsx` lines 457-467 + `src/data/cha2ds2VascData.ts` ANNUAL_STROKE_RATE lines 67-78
- **What is wrong:** Score-7 annual rate (9.6%) is displayed lower than score-6 (9.8%) in the UI table without an in-table caveat explaining the non-monotonic dip (a Euro Heart Survey small-sample artifact). The data-module comment acknowledges the artifact, but the UI footnote only mentions registry variation. Limitations-note gap, not a data error.
- **Source:** cha2ds2VascData.ts lines 64-78 + Cha2ds2VascCalculator.tsx lines 457-485.
- **Proposed fix:** Add a footnote marker to the score-7 row noting the rate appears below score-6 due to small-sample variability in the original cohort, not a true risk decrease.
- **Class:** C-clinical

**L16 - HAS-BLED bleed rates floored at 8.70 for scores 5-9**
- **Locus:** `src/data/hasBledScoreData.ts` lines 45-50 - HASBLED_BLEEDS_PER_100
- **What is wrong:** Scores 5-9 are all set to 8.70/100py (the score-4 rate) without disclosing this is an extrapolation beyond the sparse Pisters 2010 cohort, and it conflicts with the commonly-cited score-5 rate (~12.5, n=1 in the derivation cohort).
- **Source:** Repo lines 39-51; Pisters 2010 (score 5 ~12.5, none ≥6).
- **Proposed fix:** Either use the published score-5 value (~12.5) and mark scores ≥6 as extrapolated, or keep a conservative floor but add display text / a code comment stating the original cohort had very few (score 5) or no (≥6) patients, so rates are extrapolated.
- **Class:** C-clinical

**L17 - Deep pearl NNT=3 for NIHSS >25 unsupported by cited source**
- **Locus:** `src/data/strokeClinicalPearls.ts` / id: `contraindications-relative` (lines 200-208)
- **What is wrong:** "Severe stroke NIHSS >25 (greatest benefit, NNT=3)" cites Fugate & Rabinstein 2015, which reports no NNT for NIHSS >25. The ~3.6 NNT is the 0-90 min time-window figure (Lansberg/Saver 2009); neither is a severity-specific NNT.
- **Source:** Fugate & Rabinstein, Neurohospitalist 2015 (PMC4530420); Lansberg/Saver 2009 Stroke (PMID 19372447).
- **Proposed fix:** Remove the "NNT=3" from the NIHSS >25 clause; replace with a qualitative statement ("benefit appears magnified even within 6h; IST-3 - no severity-specific NNT established"). Keep the clinical point; drop the false-precision number. Register a claimId + citation if retained.
- **Class:** E

---

## 3. Uncertain / needs human review

These candidates reproduced a real smell but could not be closed either because the finder's proposed correction was itself refuted, or because the load-bearing value could not be verified from an accessible primary source. None should be edited without a human decision.

**U1 - LASTE ordinal NNT chip in legend**
- **Locus:** `src/data/trialData.ts` / `laste-trial` / legend.bottomLineTag (line 3585) + howToReadChart Q2 (line 3560)
- **Why uncertain:** The legend chip surfaces an NNT for an ordinal-shift primary, bypassing the repo's suppressNNT convention. But NNT 4 (95% CI 3-8) is the trialists' own published figure (Costalat NEJM 2024), not a fabrication. This is a presentation-convention call, not a medical correction - needs V's convention decision.
- **Options:** (a) accept as the trialists' published NNT with an exploratory marker, or (b) replace bottomLineTag with the primary metric "gOR 1.63 (1.29-2.06)".
- **Class:** E

**U2 - ANNEXA-I POSITIVE badge on a surrogate-only-positive, harm-flagged trial**
- **Locus:** `src/data/trialData.ts` / `annexa-i-trial` / trialResult (L16371) + calculations (L16456-16457)
- **Why uncertain:** All facts verify (NEJM 2024, PMID 38749032: hemostatic composite met P=0.003; no mRS/mortality benefit; ischemic stroke 6.5% vs 1.5%). "POSITIVE" is technically correct (primary met) and the entry caveats the surrogate exhaustively, but standalone programmatic consumers of trialResult would read clinical benefit for a surrogate-positive, function-null, harm-flagged agent since withdrawn from the US market. A labeling-convention judgment for a human clinical-reviewer.
- **Options:** Do not change mechanically. Escalate whether a "MIXED"/surrogate-only badge is warranted; if retained as POSITIVE, require every standalone render to pair with harmSignal/legend bottomLineTag.
- **Class:** E

**U3 - PATCH binary mRS proxy in efficacyResults**
- **Locus:** `src/data/trialData.ts` / `patch-trial` / efficacyResults (lines 18498-18509)
- **Why uncertain:** Primary is ordinal shift (aOR 2.05, verified), and the effect measure sits correctly in stats.effectSize. Both efficacyResults labels already say "proxy for death or dependence", so the numbers are flagged. The residual question is display-archetype fidelity (binary bar vs Grotta full-mRS bar), which depends on renderer behavior a ui/medical review should confirm.
- **Options:** Keep the binary numbers but ensure the visualization renders them as clearly-labeled secondary/proxy; if a full mRS distribution exists, prefer the Grotta archetype for the primary. ui-architect + medical-scientist confirm.
- **Class:** D-clinical

**U4 - Basilar-EVT citation quoted_text COR structure and LOE**
- **Locus:** `src/lib/citations/registry.ts:604` - citation `aha-asa-2026-4.7.3` quoted_text
- **Why uncertain:** The finder's proposed COR 1/COR 2a split is refuted - multiple concordant summaries of the published 2026 guideline (Endovascular Today, emDocs, Cardiology Advisor) describe a single COR 1 for basilar EVT across the whole within-24h window. So the quoted_text's "Class I within 24h" framing matches the real guideline. The LOE (A vs B-R) is unverifiable - the AHA full text is paywalled and the abstract lacks the recommendation table. The repo is internally inconsistent (aha2026StrokeGuideline.ts encodes COR 1/2a + B-R; registry says single Class I, Level A).
- **Action:** Do NOT apply the COR 2a split. A human with paywalled AHA table access must confirm the real COR structure (likely single COR 1 within 24h) and the true LOE, then reconcile aha2026StrokeGuideline.ts and every downstream surface to one verified value. Blocked pending primary-source LOE confirmation.
- **Class:** E

**U5 - BAOCHE pearl COR/LOE**
- **Locus:** `src/data/strokeClinicalPearls.ts:583-593` - pearl `baoche-trial` / claim `baoche-posterior-evt`
- **Why uncertain:** Same pattern as U4. The finder's COR 2a correction is refuted (published guideline supports a single COR 1 to 24h). The in-repo aha2026StrokeGuideline.ts:512-515 COR 2a value conflicts with the published guideline and cannot be trusted as ground truth. LOE A vs B-R is unverifiable.
- **Action:** Do NOT downgrade to COR 2a. A human with AHA table access confirms the true LOE; if B-R, correct evidenceLevel "A"→"B-R" and the content/evidence strings; do not touch COR/evidenceClass "I". Blocked:awaiting-review on LOE.
- **Class:** E

**U6 - ATTENTION pearl COR/LOE**
- **Locus:** `src/data/strokeClinicalPearls.ts:611-621` - pearl `attention-trial` / claim `attention-posterior-evt`
- **Why uncertain:** Same refutation as U4/U5. The pearl's own detailedContent (line 632) already states "AHA/ASA 2026 covers both within a single Class 1 recommendation", aligning with the externally verified single-COR-1 structure. Only the LOE needs a human primary-source check.
- **Action:** Do not split into COR 1 (0-6h) vs COR 2a (6-24h). If a human confirms LOE B-R, correct evidenceLevel "A"→"B-R" and the "LOE A" mentions. Blocked:awaiting-review on LOE.
- **Class:** E

**U7 - Posterior-circulation-EVT quick pearl COR/LOE**
- **Locus:** `src/data/strokeClinicalPearls.ts:385-394` - pearl `posterior-circulation-evt-quick` / claim `posterior-circulation-evt-quick-claim`
- **Why uncertain:** Same pattern. COR 1 for the 6-24h window is supported (not refuted) by the published single-COR-1-to-24h structure; the finder's COR 2a correction is wrong. LOE A vs B-R remains unverifiable.
- **Action:** Keep "Class 1" for both windows. If a human confirms LOE B-R, correct "Class 1, LOE A" → "Class 1, LOE B-R". Blocked:awaiting-review on LOE.
- **Class:** E

**U8 - HAS-BLED score-1 tier assignment and non-monotonic rate**
- **Locus:** `src/data/hasBledScoreData.ts` line 73 - calculateHASBLEDScore() risk assignment
- **Why uncertain:** Score 1 is labeled "Moderate risk" while its displayed bleed rate (1.02/100py) is lower than score-0 "Low risk" (1.13/100py). The per-score rates are faithful to Pisters 2010 (a documented Table-4 derivation-cohort artifact), so the display inconsistency is real. But the finder's proposed "0-1 low, 2 moderate, ≥3 high" is not a settled standard - Pisters published no tier scheme and web sources give conflicting schemes. Needs a human to pick the tier convention. (Finder's high downgraded to medium.)
- **Action:** A human selects a documented tier convention and cites it; at minimum move score 1 out of "Moderate" or add a small-sample caveat, and reconsider the unsourced "very_high" (≥4) tier. (Related to M25.)
- **Class:** E

**U9 - GBS treatment-window "possibly" qualifier**
- **Locus:** `src/pages/guide/Gbs.tsx:81`
- **Why uncertain:** AAN 2003 recommends IVIg "within 2 or possibly 4 weeks" - the "possibly" does qualify the 4-week bound, but the repo's 2-4 week range, IVIG=PEX equivalence, and "IVIG easier" are all substantively accurate and standard. The concern is editorial emphasis, not a factual error; the range itself is correct.
- **Source:** Hughes et al., Neurology 2003;61:736-740; PMID 14504313.
- **Action:** Optional editorial refinement (e.g., "Start within 2 weeks (benefit possibly up to 4 weeks per AAN 2003)"). Not a required correction.
- **Class:** C-clinical

*(Note: U4-U7 are four surfaces of one underlying open question - the true published COR structure and LOE for posterior-circulation/basilar EVT in the 2026 guideline. They should be resolved as a single blocked citation-reconciliation task once a human obtains the paywalled AHA recommendation table, then propagated to all four surfaces plus H13.)*

---

## 4. Method and coverage note

Parallel Sonnet finders swept the full semantic surface of the platform: **108 trials, 108 claims against 217 citations, 12 calculators, 19 guide pages, and the stroke clinical pearls.** Each candidate was then adversarially verified on Fable against repo sources, the in-repo 2026 AHA/ASA guideline (`docs/2026-AHA-Stroke-guideline.md` and `src/data/aha2026StrokeGuideline.ts`), the in-repo evidence packets, and primary literature (PubMed, NEJM/JAMA/Lancet full text, and reputable secondary reproductions) where needed. Verification was deliberately hostile: candidates whose proposed fix was itself wrong were downgraded to uncertain rather than confirmed, and several finder-assigned severities and proposed values were corrected (for example, the HERMES control-rate finder proposed a figure that turned out to be the DEFUSE-3 rate, and several posterior-circulation COR corrections were refuted by the published guideline).

The **deterministic floor is green.** `tsc`, `check:claims`, `check:chains`, `check:routes`, `check:card-meta`, `check:humanizer`, and `build` all pass. This audit therefore covers **only the semantic layer the hooks cannot check** - whether claim text matches what the evidence actually says, whether an interpretation is fair, whether a guideline section is relevant, whether a displayed statistic is the right measure, and whether newer or conflicting evidence exists. Per CLAUDE.md §13.1, a green hook confirms metadata completeness (every claim registered, every citation present, every `last_reviewed` populated); it does not and cannot confirm that the medicine is correct. Every finding here lives in that gap.

---

## 5. Closing

Per CLAUDE.md §19.0, these findings are **HYPOTHESES, not approved fixes.** No file is touched until each finding independently passes classify → plan → V approval in this session → specialist verification (medical-scientist authoring plus clinical-reviewer gate for Class E and any `-clinical` item, system-architect review for Class D). The audit is a briefing, not a work order; the volume or apparent obviousness of these findings does not waive the approval gate.