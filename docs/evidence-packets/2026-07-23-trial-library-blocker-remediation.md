# Evidence Packet — trial-library BLOCKER remediation (15 findings)

**Date:** 2026-07-23 · **Verifiers:** evidence-verifier x13 (one per trial unit), independent contexts
**Skills:** clinical-trial-audit, trial-statistics
**Feeds:** remediation of the 15 BLOCKER findings in `docs/reviews/audit-trial-library-semantic-2026-07-23.md`

## Method
The audit produced a hypothesis list. Before any file was touched, each of the 13 trial units
(covering the 15 findings) was independently re-verified against the PRIMARY published source by a
separate verifier instructed to report `auditFindingCorrect: false` if the repo turned out to be
right. Verifiers were required to establish the exact primary endpoint, the effect estimate, the
interval AND ITS TYPE (two-sided 95% vs one-sided 97.5% vs one-sided 95%), the pre-specified
non-inferiority margin, and the timepoint.

## Outcome
**13 of 13 units confirmed the repo was wrong. Zero audit false positives.**

## Known verification limits (recorded, not hidden)
- NEJM returns 403 to automated fetch. DIRECT-MT decimal-level values (36.4 vs 36.5 for the
  direct-EVT arm) rest on convergent secondary sourcing; the clinically load-bearing fact (the two
  arms were near-identical at ~36-37%, not 62/58.5) is firm across all sources consulted.
- DIRECT-MT symptomatic ICH decimals (4.3% vs 6.1%) rest on two secondary sources plus an imaging
  substudy; all three agree the arms differed, so the prior "4.3% in both arms" was definitely wrong.
- HAMLET case-fatality P value could not be confirmed (abstract reports the ARR and CI, full text
  paywalled). It was therefore NOT corrected, and pooled DECIMAL/DESTINY/HAMLET figures were
  deliberately kept OUT of the HAMLET citation record; they live in
  `vahedi-pooled-decimal-destiny-hamlet-2007`.
- COMPASS statistical-analysis-plan detail (test type, covariates, CI level) is NOT sourced by any
  repo artifact. The remediation therefore states only the sourced margin (0.15) and P for NI
  (0.0014) and makes no SAP claim.
- HAMLET 3-year follow-up (PMID 23868265, Stroke 2014) was NOT reviewed. Together with the
  unconfirmed case-fatality P value above, this is why `hofmeijer-hamlet-2009.last_reviewed` was
  deliberately NOT refreshed: §13.6 steps 4 and 5 are open. Tracked in TASKS.md.
- COMPASS first-pass reperfusion "68.9% vs 76.3%" (trialData.ts, 3 fields plus a causal bedside
  framing) may be DIRECTION-INVERTED: the sponsor summary reports 57% vs 51% favouring aspiration,
  and 22 vs 33 min rather than 24 vs 35. NOT corrected in this pass (outside the approved 15) and
  needs journal access. Material; tracked in TASKS.md.
- COMPASS "95% CI -8 to 11" may in fact be a mislabelled 90% CI. Not corrected; needs journal access.
- DIRECT-SAFE control-arm "61.4%" does not reconcile with 89/147 (60.5%) and could not be sourced.
  NOT corrected in this pass; tracked in TASKS.md.
- ENRICH: ESO 2025 guidance referencing minimally invasive surgery on ENRICH criteria was identified
  but not retrievable. Considered and not incorporated; it does not supersede the trial result.
- HAMLET post-publication correspondence "Reassessment of the HAMLET study" (Mitchell P, Gregson BA,
  et al., Lancet Neurol 2009;8(7), PMID 19539229) and the authors' reply were identified but NOT read
  (paywalled). The §8a accompanying editorial is likewise unretrieved. Both are open §13.6 step-5
  items for `hofmeijer-hamlet-2009` and contribute to that record's date deliberately NOT being
  refreshed. Tracked in TASKS.md.
- **Recommendation-strength assertion standing on unconfirmed evidence (PRE-EXISTING, untouched by
  this pass):** `registry.ts` `aha-asa-2026-4.7.4` quoted_text asserts "COR 2b, LOE B-R per CHOICE"
  for intra-arterial thrombolytics, and `claims.ts` describes it, but `src/data/aha2026StrokeGuideline.ts`
  contains NO intra-arterial thrombolytic section, so the strength/level could not be independently
  confirmed against the in-repo guideline extract. This is the highest-consequence never-drift
  category (recommendation strength). No code change was made here because the entry is outside this
  diff and its `last_reviewed` was not refreshed. Tracked in TASKS.md for its own verification pass.

---

## percent (%) of patients; odds ratio (unitless) with two-sided 95% CI

**Confidence:** high

DIRECT-MT (Yang P et al., NEJM 2020;382:1981-1993; DOI 10.1056/NEJMoa2001123; PMID 32374959; NCT03469206; n=656, 41 Chinese tertiary centers).

PRIMARY ENDPOINT (verbatim intent): score on the modified Rankin scale at 90 days, analyzed as a full ordinal shift (adjusted common odds ratio), noninferiority framework. Adjusted common OR 1.07, two-sided 95% CI 0.81 to 1.40, P = 0.04 for noninferiority.

NON-INFERIORITY MARGIN: pre-specified as the lower boundary of the two-sided 95% CI of the adjusted common OR being at or above 0.80 (derived from an assumed common OR of 1.16; described in the accompanying commentary as a "20% margin"). Observed lower bound 0.81, i.e. the criterion was met by 0.01. The repo's margin sentence and lower-bound value (0.81) and P for NI (0.04) are CORRECT and require no change.

SECONDARY ENDPOINT, functional independence (mRS 0-2) at 90 days: approximately 36.4% with thrombectomy alone vs 36.8% with combination (bridging) therapy; approximately 36.6% overall in the trial. Independent summaries report the arms as roughly 37% vs 37% with an unadjusted OR of 0.97 (95% CI 0.68 to 1.37), i.e. no difference. The repo value of 62.0% vs 58.5% is wrong by about 25 absolute percentage points in both arms and falsely implies a numerical advantage for direct EVT.

SAFETY: symptomatic intracranial hemorrhage 4.3% (thrombectomy alone) vs 6.1% (combination), not significant (RR approximately 0.70, 95% CI 0.36 to 1.37, P = 0.30). 90-day mortality 17.7% vs 18.8%. Successful reperfusion before thrombectomy 2.4% vs 7.0%; overall successful reperfusion 79.4% vs 84.5%.

**Verifier notes:** AUDIT CONFIRMED on the primary flagged item; the NI-margin half of the audit request checks out as already correct.

1) mRS 0-2 value (audit's main claim): repo is wrong. Convergent sourcing: an independent trial summary reports mRS 0-2 of 37% vs 37% with unadjusted OR 0.97 (95% CI 0.68 to 1.37); a Frontiers paper quotes the DIRECT-MT bridging arm at 36.8%; another quotes the direct-MT arm rate at 36.5%; a third quotes the trial-wide functional-independence frequency as 36.6%. 36.4/36.8 reconciles all three (240/656 = 36.6%). Decimal-level caveat: I could not open the NEJM Table 2 directly (NEJM returns 403 to automated fetch), so the direct-EVT arm could be reported as 36.5% rather than 36.4%; the difference is immaterial clinically and both are consistent with "near-identical." If a reviewer has NEJM full-text access, confirm the exact decimal before commit.

2) NI margin sentence: VERIFIED CORRECT, no edit proposed. Pre-specified criterion was the lower boundary of the two-sided 95% CI of the adjusted common OR at or above 0.80; observed 0.81; P = 0.04 for NI. Interval type is a two-sided 95% CI (not one-sided 97.5% or one-sided 95%). The repo's phrasing "a lower 95% CI bound above 0.80" is a fair rendering of "at or above 0.8" and the result clears it either way.

3) CONCLUSION IMPACT: none of the corrected numbers overturn the noninferiority conclusion, because noninferiority rested on the ordinal common OR (1.07, 0.81 to 1.40), which is unchanged and correctly displayed elsewhere in the record (stats.effectSize, legend.keyStat, howToReadChart Q1, TrialPageNew DeltaBandChart riskRatio/CI/p). However, the OLD text created a false impression that direct EVT produced more functional independence; the corrected text removes that. No downstream interpretive sentence (howToInterpret, bottomLineSummary, bedsidePearl) asserts a functional-independence advantage, so no further prose correction is required.

4) SEPARATE DEFECT FOUND, not correctable as a unique-substring edit, needs its own task: the DIRECT-MT render block in src/pages/trials/TrialPageNew.tsx (lines 5384-5410) passes efficacyResults.treatment.percentage (79.4) and control.percentage (84.5), which are OVERALL SUCCESSFUL REPERFUSION rates, into DeltaBandChart while the chart is labeled endpoint="mRS 0-2 at 90 Days" and the section header reads "Primary Outcome: mRS Ordinal Shift at 90 Days". A clinician reading that chart will conclude 79.4% vs 84.5% achieved mRS 0-2, which is false and is the same class of error as the audited text defect. The string endpoint="mRS 0-2 at 90 Days" occurs 10 times in that file, so no verbatim-unique oldText exists; the fix must be made in the DIRECT-MT block by line, either by relabeling the endpoint to "Successful reperfusion (final angiography)" or by repointing efficacyResults to the mRS 0-2 rates (36.4/36.8). Recommend a scoped Class C-clinical task.

5) Scope check for repeated wrong values: I grepped src/ for 62.0 and 58.5. The only other hit (trialData.ts:6361) belongs to a different trial record and refers to IV thrombolysis use within an arm, unrelated. The wrong mRS 0-2 pair appears exactly once. trialListData.ts, trialListData.cardmeta.generated.ts, trial-questions.ts and seo/schema.ts carry no numeric mRS claims for this trial, so no regeneration of card meta is required for these two edits.

6) House style: neither replacement introduces a U+2014 em-dash; both preserve the surrounding hyphen/percent conventions and the existing en-dash usage elsewhere in the record (legend keyStat "cOR 1.07 (0.81–1.40)") is untouched. No NNT is introduced, correctly, since this is a noninferiority design with an ordinal primary outcome (NNT prohibited on both counts per the clinical-trial-audit skill).

7) Confidence in correction 2 (sICH 4.3% vs 6.1%) is slightly lower than correction 1: it rests on two independent secondary sources (a conference-coverage report giving 4.3% vs 6.1% and a trial summary giving 4% vs 6% with RR 0.70, 0.36 to 1.37), plus a DIRECT-MT imaging substudy reporting 4.0% (12/299) vs 6.8% (20/292) in the subset with follow-up imaging. All three agree the arms differed numerically, so "4.3% in both arms" is definitely wrong; a reviewer with NEJM access should confirm the exact bridging-arm decimal.

## Odds ratio for the binary primary endpoint (mRS 0-2 at 90 days), reported with a one-sided 97.5% confidence interval against a fixed non-inferiority margin expressed as an odds ratio.

**Confidence:** high

SKIP (Suzuki K, et al. JAMA. 2021 Jan 19;325(3):244-253; doi 10.1001/jama.2020.23522; PMID 33464334; UMIN000021488).

PRIMARY ENDPOINT (verbatim, Methods): "The primary efficacy end point was a favorable outcome defined as a modified Rankin Scale score (range, 0 [no symptoms] to 6 [death]) of 0 to 2 at 90 days." This is a BINARY dichotomized endpoint, not an ordinal mRS shift. The correct effect-measure label is therefore a plain odds ratio, NOT a "common OR" (a common OR arises only from ordinal/proportional-odds analysis).

STATISTICAL FRAMEWORK: noninferiority. "The noninferiority margin was set as the odds ratio of 0.74 using the fixed-margin approach" with "a 1-sided significance threshold of .025 (97.5% CI)."

PRIMARY RESULT: favorable outcome 60/101 (59.4%) with mechanical thrombectomy alone vs 59/103 (57.3%) with IV alteplase 0.6 mg/kg plus thrombectomy; odds ratio 1.09 (1-sided 97.5% CI, 0.63 to infinity); P = .18 for noninferiority. Because the lower bound 0.63 falls below the 0.74 margin, noninferiority was NOT demonstrated.

SAFETY (also verified, and also wrong in the repo): any intracerebral hemorrhage 34/101 (33.7%) vs 52/103 (50.5%), OR 0.50 (95% CI 0.28-0.88), P = .02. Symptomatic ICH 6 (5.9%) vs 8 (7.7%), OR 0.75 (95% CI 0.25-2.24), P = .78. Deaths within 90 days 8 (7.9%) vs 9 (8.7%), P > .99.

The repo's "common OR greater than 0.75" margin, "95% CI 0.72-1.64" two-sided interval, and "0.72" lower bound are all unsupported by the publication. So are the repo's safety percentages (19.6% vs 28.4%, P = 0.04; sICH 4.9% vs 7.8%; mortality 11.8% vs 13.7%).

**Verifier notes:** AUDIT VERDICT: correct on every point, and the defect is broader than the audit stated.

1. Margin: repo 0.75, published 0.74 (fixed-margin approach, one-sided alpha 0.025). Confirmed.
2. Interval: repo "95% CI 0.72-1.64", published one-sided 97.5% CI 0.63 to infinity. The upper bound 1.64 does not appear in the publication at all; it is fabricated. Confirmed.
3. Interval type: repo labels it two-sided 95%, published is one-sided 97.5%. Confirmed. (Note the numerical coincidence that a one-sided 97.5% lower bound equals a two-sided 95% lower bound, which is exactly why the repo's 0.72 cannot be defended as an alternative parameterization: the correct value under either reading is 0.63.)
4. Effect-measure label: repo calls it a "common OR". SKIP's primary endpoint was verbatim "a favorable outcome defined as a modified Rankin Scale score ... of 0 to 2 at 90 days", a binary dichotomization. A common OR requires an ordinal proportional-odds analysis. The label is wrong and is a design-taxonomy error, not just a wording nit. Confirmed.

CONCLUSION IS UNCHANGED. 0.63 still falls below 0.74, so "non-inferiority not met / inconclusive" remains correct. No interpretive sentence needed reversal, and no NNT is present (correct: NNT is prohibited for a noninferiority design per the audit skill). trialResult NEGATIVE, primaryDesign noninferiority, primaryResult noninferiority-not-established, specialDesign 'non-inferiority' are all correct and untouched.

SCOPE BEYOND THE AUDIT, two additional defects found:

(a) FIFTH AND SIXTH OCCURRENCES. The audit listed 4 locations. The wrong margin/interval also appears hardcoded in the SKIP render block at src/pages/trials/TrialPageNew.tsx:5778 (amber NI banner) and :5793-5794 (DeltaBandChart ciLow/ciHigh), plus twice in the generated mirror src/data/trialListData.cardmeta.generated.ts:1308 and :1315. Nine corrections total.

(b) SAFETY NUMBERS ARE ALSO WRONG (independent defect, not in the audit). Repo howToReadChart and howToInterpret.proves state any ICH 19.6% vs 28.4% (P = 0.04), sICH 4.9% vs 7.8%, mortality 11.8% vs 13.7%. Published: any ICH 33.7% vs 50.5% (OR 0.50, 95% CI 0.28-0.88, P = .02), sICH 5.9% vs 7.7% (P = .78), 90-day mortality 7.9% vs 8.7% (P > .99). The direction of every statement survives, but every number is wrong. Corrections included. Confirmed independently from the PubMed abstract, the PMC full text, and the JAMA Results paragraph.

REQUIRED COMPONENT FOLLOW-UP (blocking for display correctness, cannot be fixed by a data edit). src/components/trials/archetypes/DeltaBandChart.tsx:289-291 hardcodes the literal label "95% CI" and renders {ciLow}&ndash;{ciHigh}. After my prop correction the SKIP page will read "95% CI 0.63–∞", which is a mislabeled interval. The component needs an optional ciLabel prop (default "95% CI") so the SKIP block can pass "1-sided 97.5% CI". Route this to ui-architect / trial-statistician. DEVT is NOT affected: its displayed -2.9 to 18.2 genuinely is the two-sided 95% CI reported in that paper. Separately, the same component prints "Risk ratio {riskRatio}" while SKIP passes "OR 1.09", rendering "Risk ratio OR 1.09"; cosmetic, pre-existing, worth folding into the same follow-up.

SEPARATE DEFECT FLAGGED, NOT CORRECTED HERE (needs its own verification pass). src/data/trialData.ts:3028-3035 inclusionCriteria contradicts the verbatim fullEligibility block directly beneath it at :3044, which is sourced from the publication. Summary says "Age 18 or older" / "M1, M2, or basilar artery" / "NIHSS 6 to 29" / "Pre-stroke mRS 0 or 1"; the verbatim block says age 18 to 85, ICA or M1 only, NIHSS 6 or greater, pre-stroke mRS 0 to 2. exclusionCriteria repeats the same wrong mRS and NIHSS bounds. This is an internal contradiction on a clinical eligibility surface and should be a follow-up Class E item; I did not fold it into these corrections because it is outside the audited statistic and deserves its own primary-source pass against eBox 1 of Supplement 3.

HOUSE STYLE: no U+2014 em-dash introduced in any newText. En-dashes preserved where they remain correct; the keyStat en-dash range is intentionally removed because a one-sided interval has no upper bound. No NNT introduced (correctly prohibited for this NI design).

SECTION 8, EXPERT AND EDITORIAL CAVEATS (filled, not skipped):
8a. Accompanying editorial retrieved: Saver JL, Adeoye O. "Intravenous Thrombolysis Before Endovascular Thrombectomy for Acute Ischemic Stroke." JAMA. 2021;325(3):229-231. The editorialists judged that DEVT and SKIP "contribute to the mounting evidence that endovascular thrombectomy alone achieves outcomes that may be noninferior," that direct EVT "may be reasonable to consider for patients who present directly to thrombectomy-capable centers," while cautioning that ongoing trials are needed to establish whether the results apply to non-Asian populations. Note the tension with SKIP's own failed NI result: the editorial's optimism rests on the pooled DIRECT-MT/DEVT signal, not on SKIP, which is precisely why the repo's cautions field is directionally right.
8b. Post-publication letters: not exhaustively retrieved in this pass. The recurring methodological critique in the literature that survived is the low-dose (0.6 mg/kg) comparator, which weakens the control arm and makes SKIP's failure to show NI more, not less, notable. This is already captured in the repo's cautions field.
8c. Guideline incorporation: AHA/ASA 2026 §4.7.1, already registered in-repo as citation 'aha-asa-2026-4.7.1' (PMID 41582814), quoted_text: "In patients with AIS eligible for BOTH IVT and EVT, IVT is safe and recommended ... Do NOT skip IVT to facilitate EVT (COR 1, LOE A)." This directly ratifies the repo's bedsidePearl.
8d. Subsequent evidence: IRIS collaboration individual-participant-data meta-analysis of six randomised trials (Majoie et al., Lancet 2023;402:965-974; PMID 37640037; 2313 participants). Non-inferiority of EVT alone was NOT established; any intracranial hemorrhage occurred less frequently with EVT alone. Materially confirms rather than changes the bedside interpretation, and reinforces that SKIP must not be displayed as directionally reassuring. Relevant here because src/data/trialListData.ts:309 describes SKIP as "directionally reassuring but statistically inconclusive," which is softer than trialData.ts's own listDescription ("inconclusive for noninferiority") and softer than IRIS supports; flagging as a wording follow-up for medical-scientist, not corrected here.

DOWNSTREAM: this is a Class E clinical-logic change touching a clinical surface. Per CLAUDE.md §19 it needs a plan and V approval before any file is touched, and a clinical-reviewer artifact before merge. Post-edit, re-run 'npm run generate:card-meta', 'npm run check:trials', 'npm run check:humanizer', and Gate 6 live-verify on https://neurowiki.ai/trials/skip-trial.

## percentage points (absolute/adjusted risk difference in the proportion reaching mRS 0-2 at 90 days)

**Confidence:** high

SWIFT DIRECT (Fischer U, Kaesmacher J, Strbian D, et al. Lancet 2022;400:104-15; doi 10.1016/S0140-6736(22)00537-2; PMID 35810756; NCT03192332).

PRIMARY ENDPOINT (verbatim, Methods "Outcomes"): "The primary binary outcome was a score of 2 or less on the modified Rankin scale at 90 days (functional independence)."

STATISTICAL FRAMEWORK: noninferiority. Verbatim (Methods "Statistical analysis"): "The primary outcome was assessed for non-inferiority with the one-sided lower 95% confidence limit of the Mantel-Haenszel risk difference stratified according to randomisation strata. Non-inferiority would be claimed if it lay above -12% in both the intention-to-treat and per-protocol analyses." The margin was widened from ~-5% to -12% deliberately ("the non-inferiority margin was widened to 12% in absolute terms, reflecting preservation of approximately 50% of the treatment effect of thrombectomy observed in SWIFT PRIME"). Sample size 404 for 80% power at a one-sided alpha of 0.05.

PRIMARY RESULT: mRS 0-2 at 90 days reached by 114 (57%) of 201 assigned thrombectomy alone vs 135 (65%) of 207 assigned IV alteplase plus thrombectomy. Adjusted risk difference -7.3%, two-sided 95% CI -16.6 to 2.1; lower limit of the one-sided 95% CI -15.1%, crossing the prespecified non-inferiority margin of -12%. No primary p-value is reported (Table 2 p-value cell is blank; per the SAP the superiority test was gated on showing non-inferiority first and was therefore never performed).

So: the margin is -12 pp (not -10 pp), the two-sided 95% CI is -16.6% to +2.1% (not -14.0% to -0.6%), the interval CROSSES ZERO, and the correct decision-relevant bound is the one-sided 95% lower limit of -15.1%.

SECONDARY / SUPPORTING:
- mRS ordinal shift: common OR 0.75, 95% CI 0.53 to 1.06, p=0.10 (not significant).
- Mortality at 90 days: 22 (11%) of 201 vs 17 (9%) of 207; RD 2.3%, 95% CI -3.2 to 7.8, p=0.41.
- sICH (core-lab adjudicated, SICH-global): 5 (2%) of 201 vs 7 (3%) of 202; RD -1.0%, 95% CI -4.8 to 2.7, p=0.77.
- Final expanded TICI 2b50-3: 182 (91%) of 201 vs 199 (96%) of 207; RD -5.1%, 95% CI -10.2 to 0.0, p=0.047.
- Preinterventional cross-sectional eTICI 2b50-3: 2 (1%) vs 8 (4%); RD -2.9%, 95% CI -6.0 to 0.3, p=0.077 (NOT significant).
- Serious adverse events: 56 (28%) vs 54 (26%); RD 1.8%, 95% CI -6.8 to 10.3.
- Prespecified age subgroup: age >=70 RD -2.2% (95% CI -14.4 to 10.1); age <70 RD -18.9% (95% CI -32.2 to -5.7, p=0.0051, p-interaction=0.039). The margin was crossed in all subgroups.

POPULATION (Methods "Patients"): occlusion of the intracranial ICA, M1, or both; eligible for alteplase within 4 h 30 min; thrombectomy within 75 min of randomisation; NIHSS 5 or more with an upper limit of 30; ASPECTS 4 or more; "There was no upper age limit" (median age 73, IQR 64-81); advanced dementia or substantial pre-existing disability excluded; M2 occlusions, cervical tortuosity and multi-vessel occlusions specifically excluded. 423 randomised at 42 centres in Europe and Canada, Nov 29 2017 to May 7 2021; 408 in the full analysis set. Funded by Medtronic and University Hospital Bern.

**Verifier notes:** AUDIT CONFIRMED, and the defect is larger than the audit described.

1. CONCLUSION-LEVEL DEFECT (the important part). The repo did not merely mis-transcribe a CI. It invented an upper bound of -0.6% and then built an interpretive argument on top of it that appears in five separate fields: "the entire plausible range favors bridging" (howToReadChart), "the entire CI is negative: even the most optimistic plausible estimate favors bridging therapy" (proves), "it does rule out that thrombectomy alone is at least as good as bridging" (doesNotProve), "with the entire confidence interval favoring bridging therapy" (bedsidePearl), "the entire CI favors bridging" (bottomLineSummary), "entire CI favored alteplase + EVT" (legend.finding), plus the same sentence hard-coded in the TrialPageNew.tsx render block. The published two-sided 95% CI is -16.6 to +2.1, which crosses zero, and the ordinal mRS shift was non-significant (cOR 0.75, 95% CI 0.53-1.06, p=0.10). SWIFT DIRECT is NI-inconclusive-in-the-direction-of-harm, not a demonstration of inferiority. Every one of those sentences is corrected above; correcting only the numbers would have left a false clinical conclusion on the page.

2. THE MARGIN. Pre-specified margin is -12 percentage points, not -10. The paper is explicit that this was a deliberately liberal margin ("widened to 12% in absolute terms, reflecting preservation of approximately 50% of the treatment effect of thrombectomy observed in SWIFT PRIME"), and the discussion notes that even this liberal margin was not met. That nuance is worth keeping in mind for downstream authoring but I did not add it, to stay surgical.

3. INTERVAL TYPE. This is the classic NI failure mode the brief warned about. Two distinct intervals exist and the repo conflated them. The NI decision quantity is the LOWER LIMIT OF THE ONE-SIDED 95% CI = -15.1%, compared against -12%. The reported two-sided 95% CI is -16.6 to 2.1. My corrections state both explicitly and label which is which.

4. DEFECTS BEYOND THE AUDIT'S CLAIM (all verified against the Lancet full text, corrections included):
   - sICH stated as 4.4% vs 3.3%; published is 5/201 (2%) vs 7/202 (3%), RD -1.0% (95% CI -4.8 to 2.7).
   - 90-day mortality stated as "approximately 15% in both arms"; published is 22 (11%) vs 17 (9%), RD 2.3% (95% CI -3.2 to 7.8), p=0.41.
   - Pre-EVT vessel reopening stated as "significantly lower (1.4% vs 5.7%)"; published preinterventional cross-sectional eTICI 2b50-3 is 2 (1%) vs 8 (4%), RD -2.9% (95% CI -6.0 to 0.3), p=0.077, i.e. NOT significant. This was an incorrect significance claim, not just an incorrect number.
   - Eligibility: repo says "Age 18 to 80" and excludes "Age greater than 80". The paper says verbatim "There was no upper age limit" (median age 73, IQR 64-81), and this record's own fullEligibility block already quotes ClinicalTrials.gov "Age >= 18", so the record was internally contradictory.
   - Eligibility: repo says "NIHSS 2 or greater"; published is NIHSS 5 or more with an upper limit of 30. The "NIHSS 2 or greater" string is identical to the DIRECT-SAFE record immediately above it in trialData.ts, which suggests copy-paste contamination between adjacent records. Worth a spot-check of the other direct-EVT records (MR CLEAN-NO IV, SKIP, DEVT, DIRECT-MT) for the same pattern.
   - Enrolment window in the TrialPageNew.tsx design blurb says "2018 to 2021"; actual is Nov 29 2017 to May 7 2021.

5. FLAGGED, NOT CORRECTED (needs a decision by medical-scientist / clinical-reviewer, outside my remit):
   - inclusionCriteria says "Pre-stroke mRS 0 to 2" and exclusionCriteria says "Pre-stroke mRS greater than 2". The trial excluded "significant pre-stroke disability (mRS score of >=2)", and Table 1 shows pre-stroke mRS 0 in 83-86% and mRS 1 in 13-17%. The effective population was pre-stroke mRS 0-1. I left this because the record's fullEligibility block already carries the verbatim ClinicalTrials.gov wording and I did not want to silently overwrite a summarized field where protocol versions differ (the paper notes three protocol revisions, one of which changed inclusion/exclusion criteria).
   - The prespecified age-subgroup heterogeneity is a genuinely bedside-relevant caveat that the record omits entirely: age <70 RD -18.9% (95% CI -32.2 to -5.7, p=0.0051), age >=70 RD -2.2% (95% CI -14.4 to 10.1), p-interaction 0.039. The authors themselves urge caution ("non-negligible likelihood that the observed heterogeneity is due to chance"). Recommend medical-scientist add one sentence to cautions.
   - UI inconsistency, not clinical: TrialPageNew.tsx line 6018 renders TrialTitleHeading with tone="positive" while the record carries trialResult: 'NEGATIVE'. Flagging for ui-architect.

6. NNT / ARCHETYPE CHECK. No NNT is present anywhere in this record, which is correct for a noninferiority design, and none of my corrections introduces one. Note however that archetypeId is 'A' and the render block uses DeltaBandChart rather than an ni-margin-chart; per the clinical-trial-audit skill's archetype table, a noninferiority design should display the margin, the observed difference, and whether the CI crosses the margin. The current chart takes ciLow/ciHigh props so my correction keeps it functional and accurate, but a proper ni-margin-chart treatment is the correct long-term fix. That is a display-archetype question for medical-scientist and ui-architect, not a blocking factual error once the numbers are right.

7. HOUSE STYLE. No U+2014 em-dash was introduced in any newText. Prose fields use ASCII hyphen-minus, matching the surrounding record; legend.keyStat retains the U+2212 minus-sign convention already used in that field and in the neighbouring DIRECT-SAFE legend.

8. SECTION 8 EXPERT/EDITORIAL CONTEXT (for the packet that medical-scientist will consume).
   8a. Accompanying Comment located and cited: Khatri P. "Intravenous thrombolysis before thrombectomy for acute ischaemic stroke." Lancet 2022;400(10346):76-78, doi 10.1016/S0140-6736(22)01286-7, PMID 35810759. It is the paired Comment for both SWIFT DIRECT and DIRECT-SAFE (the Article carries "See Comment page 76"). PubMed lists no abstract and the Lancet full text is paywalled; I could not retrieve the body text on 2026-07-27 via PubMed or the Lancet site, so I am NOT quoting it. This is an explicit retrieval failure, not a silent omission. Substitute expert context retrieved instead: ESO commentary (Jensen) noting the point estimates favoured combined therapy and that patients under 70 had significantly lower odds of an independent outcome with thrombectomy alone.
   8b. Post-publication letters: not searched to completion in this pass. Two author-group sub-analyses were located (tandem lesions with emergent carotid stenting, PMC11235868; time-to-treatment sub-analysis, PMID 35902234); neither is a critical letter. Marked incomplete, not "none".
   8c. Guideline incorporation: the AHA/ASA position that patients eligible for IV thrombolysis should receive it even when EVT is being considered predates and survives SWIFT DIRECT; I did not locate the specific class/level string in the in-repo 2026 AHA guideline copy (grep for "SWIFT"/"bridging" returned only a pathway diagram line). Needs a targeted read of the guideline's reperfusion section before the packet is signed off.
   8d. Subsequent evidence: the IRIS individual-patient-data meta-analysis of the six direct-EVT trials (Majoie et al., Lancet 2023) likewise did not establish non-inferiority of direct EVT. I did not re-verify its effect estimate in this pass, so downstream authoring should treat that as unverified until confirmed.

Because 8a is paywalled-unretrieved and 8b/8c/8d are incomplete, this verification supports the numeric corrections at HIGH confidence but does NOT constitute a complete Section 8 packet. If the downstream task is scoped as a Class E numeric/interpretive correction to an existing entry, that is sufficient. If it is scoped as a new-trial entry or a full Class E re-review, Section 8 must be completed first per the block condition.

No evidence-packet file was written, since this task was returned as a structured verification and I was directed not to author report files.

## percentage points (absolute difference in the proportion achieving mRS 0–2 at 90 days)

**Confidence:** high

COMPASS pre-specified non-inferiority margin = 0.15 (15 percentage points), on the control-minus-treatment difference in the proportion with mRS 0–2 at 90 days. Primary endpoint: mRS 0–2 at the 90-day follow-up visit, intent to treat. Design: frequentist noninferiority, one-sided normal-approximation test, alpha 0.05, logistic regression adjusted for ASPECTS/age/sidedness, pre-specified 90% CI for the difference (no Bayesian analysis, no formal interim analyses). Result: aspiration-first 69/134 (52%; 95% CI 43.8–60.3) vs stent-retriever-first 67/136 (50%; 95% CI 41.6–57.4), difference about +2 percentage points, p(non-inferiority) = 0.0014; non-inferiority met with the difference interval well inside the 15-point margin. Safety: 90-day mortality 22% vs 22% (OR 1.02, 95% CI 0.57–1.81); sICH 6% vs 6% (OR 1.01, 95% CI 0.37–2.77); any ICH 36% vs 34%.

**Verifier notes:** AUDIT CONFIRMED. The repo stated a pre-specified NI margin of "-7 percentage points"; the true pre-specified margin is 0.15 (15 percentage points), a factor of >2 error, sourced directly from the trial's own Statistical Analysis Plan posted on ClinicalTrials.gov (NCT02466893, signed 5-6 Dec 2017 by Johnson, Poggio, Zhang, Mocco, Turk, Siddiqui) and corroborated by the Lancet abstract.

CONCLUSION CHANGE (flagged per instructions). The wrong margin propagated into a wrong interpretive conclusion in two places: the repo asserted the interval "marginally crossed" the NI threshold, implying non-inferiority was borderline or technically unmet. With the correct 15-point margin the observed difference (+2 pp favoring aspiration, lower bound about -8 pp) is comfortably inside the margin and non-inferiority was met without ambiguity. Both correction #1 and correction #2 therefore rewrite the interpretive sentence, not just the number. Note the direction of the error is unusual: the repo understated the trial's statistical success while simultaneously hiding the real caveat, which is that the margin was permissively wide.

SECOND ERROR FOUND AND CORRECTED: the record described "the primary Bayesian analysis". COMPASS had no Bayesian component. SAP §3.4 specifies a one-sided normal-approximation test at alpha 0.05; §10.1 specifies logistic regression adjusted for ASPECTS, age, and sidedness with a 90% CI on the difference; §5.4 states "No formal interim analyses will be conducted." Corrected in the same edit.

INTERVAL-TYPE ISSUE, NOT CORRECTED (needs its own verification). Line 3831 (howToReadChart, "What does the bar show?") reports "Difference +2 percentage points (95% CI -8 to 11)". The SAP mandates a 90% CI for the primary difference, and my recomputation from the published counts gives a 90% CI of roughly -7.8 to +12.2 versus a two-sided 95% CI of roughly -10.1 to +14.5, so the displayed bounds look like a 90% CI mislabeled as 95%. I could not retrieve the Lancet full text (thelancet.com, ScienceDirect, AJNR, Europe PMC all returned 403/blocked), so I did not edit a number I cannot confirm against the results section. Recommend a follow-up verification pass with journal access before relabeling. My corrected text deliberately says "the difference interval" rather than asserting an interval type at that spot.

THIRD SUSPECTED DEFECT, OUT OF SCOPE AND NOT CORRECTED. The record repeats "first-pass reperfusion was lower with aspiration first (68.9% vs 76.3% with stent retriever)" in three fields (howToReadChart Q3 at line 3839, howToInterpret.cautions at line 3846, bedsidePearl at line 3849), plus "Aspiration was faster (24 min vs 35 min...)". The sponsor's own COMPASS results summary citing Lancet 2019;393:998-1008 reports first-pass TICI 2b/3 success of 57% (75/131) with ADAPT vs 51% (65/129) with stent retriever (p=0.32), i.e. numerically HIGHER with aspiration, and median time to TICI >= 2b of 22 vs 33 minutes, not 24 vs 35. If that is right, the repo's first-pass claim is inverted in direction across three fields and the bedsidePearl's causal framing ("Lower first-pass reperfusion with aspiration ... did not translate to worse outcomes") is built on it. I did not edit these because I could not reach the Lancet results tables and a sponsor marketing sheet is not an adequate primary source for a directional reversal. This warrants a dedicated verification task with journal access; treat it as a probable defect, not a confirmed one.

EDITORIAL CONTEXT (packet §8a, relevant to the corrected caveat): the accompanying Lancet comment by Bijoy Menon and Mayank Goyal questioned whether COMPASS should change practice, arguing that neurointerventionists should measure their procedural outcomes against current benchmarks. Funding: research grant from Penumbra, Inc., manufacturer of the aspiration system tested. These support the replacement caveat in correction #2.

HOUSE STYLE: no U+2014 em-dash introduced in either replacement; both use commas, colons, semicolons and parentheses. Surrounding hyphen convention ("mRS 0-2", "-8 pp") preserved; no en-dash ranges were altered. No NNT introduced (correctly absent for this noninferiority design).

## percentage points (absolute risk difference, mRS 0-2 or return to baseline at 90 days)

**Confidence:** high

DIRECT-SAFE (Mitchell PJ et al., Lancet 2022;400(10346):116-125; PMID 35810757; DOI 10.1016/S0140-6736(22)00564-5; NCT03494920).

Primary endpoint: functional independence, defined as modified Rankin Scale 0-2 OR return to baseline, at 90 days.

Design: open-label, blinded-endpoint, randomised NON-INFERIORITY trial. Pre-specified non-inferiority margin = -0.1 on the risk difference, i.e. -10 percentage points (NOT -12 pp). Non-inferiority declared only if the lower bound of the TWO-SIDED 95% CI for the difference in proportions lay above -0.1 (design paper: Mitchell et al., J Stroke 2022, PMC8829478).

Primary result: functional independence 80/146 (55%) direct EVT vs 89/147 (61%) bridging; intention-to-treat risk difference -0.051, two-sided 95% CI -0.160 to 0.059 (i.e. -5.1%, 95% CI -16.0% to +5.9%). Non-inferiority NOT met: the lower bound (-16.0 pp) lies 6.0 percentage points below the -10 pp margin.

Safety: symptomatic ICH 2/146 (1%) direct vs 1/147 (1%) bridging, adjusted OR 1.70 (95% CI 0.22-13.04). 90-day mortality 22/146 (15%) vs 24/147 (16%), adjusted OR 0.92 (95% CI 0.46-1.84).

The repo's "-12 percentage point margin" and "95% CI -15.4% to 5.3%" are both wrong. The point estimate (-5.1%) and the sICH rates (1.0% vs 1.0%) in the repo are correct.

**Verifier notes:** VERDICT: the audit is correct on both counts. The repo states a -12 pp non-inferiority margin (published: -0.1, i.e. -10 pp) and a 95% CI of -15.4% to 5.3% (published two-sided 95% CI: -0.160 to 0.059, i.e. -16.0% to +5.9%). The point estimate (-5.1%), the direction, the "NI not met" conclusion, the sICH rates (1.0% vs 1.0%) and the design classification (noninferiority) are all correct as shipped.

CONCLUSION-LEVEL IMPACT (flagged as required): the headline conclusion "non-inferiority not met" is UNCHANGED and remains correct under the true numbers, but two derived interpretive sentences become wrong and are corrected above. The repo says the lower bound "crossed the margin by more than 3 percentage points" (from -15.4 vs -12); with the true values the miss is 6.0 percentage points (-16.0 vs -10). The trial therefore missed non-inferiority by twice as much as the repo currently claims. Both the howToInterpret.doesNotProve sentence and the bedsidePearl rest on that magnitude and are corrected.

SPREAD: the wrong pair of values is duplicated across 5 fields in the trialData.ts record (howToReadChart, howToInterpret.proves, howToInterpret.doesNotProve, bedsidePearl, bottomLineSummary, legend.keyStat = 6 edits), 3 hard-coded spots in the DIRECT-SAFE render block in TrialPageNew.tsx (NI callout banner + DeltaBandChart ciLow/ciHigh), and 2 spots in the generated card-meta file. 11 corrections total. If the generator is run, `npm run generate:card-meta` will reproduce the corrected card-meta from trialData.ts; the two generated-file edits are included so the shipped catalog card is right either way.

LIKELY ROOT CAUSE: value drift from the sibling SWIFT DIRECT record. SWIFT DIRECT (same repo file, line ~3399 onward) correctly uses a -10 pp margin with adjusted RD -7.3% (95% CI -14.0% to -0.6%). DIRECT-SAFE's margin appears to have been mis-transcribed and the CI half-width scaled to match the wrong margin.

INTERVAL TYPE (explicitly verified, since the brief asked): TWO-SIDED 95% CI. The DIRECT-SAFE design paper (Mitchell et al., J Stroke 2022, PMC8829478) states non-inferiority is established "if the lower bound of the two-sided 95% confidence interval ... was greater than the pre-defined non-inferiority margin" of -0.1. Not a one-sided 97.5% or one-sided 95% construction. The Lancet abstract reports the same interval as "95% CI -0.160 to 0.059".

SECONDARY FINDING, NOT CORRECTED (needs full-text access before anyone edits it): the record reports the arm rates as "55.0% vs 61.4%" in three fields. The published ITT rates are 80/146 = 54.8% (reported as 55%) and 89/147 = 60.5% (reported as 61%). 61.4% does not equal 89/147; it equals 89/145, so it may be a different denominator in a table, or drift from the ESCAPE-NA1 record in the same file which also carries 61.4%. I could not resolve this from the abstract (Lancet full text is paywalled, 403 on two fetch attempts), so I have deliberately left those values untouched rather than guess. Recommend medical-scientist confirm against Table 2 of the Lancet paper and correct to 55% vs 61% if 61.4% cannot be sourced. The chart data (efficacyResults 55 / 61) already matches the publication.

NNT CHECK: no NNT is present anywhere in the DIRECT-SAFE record, and none was introduced. Correct, an NNT is prohibited for a noninferiority design.

HOUSE STYLE: no U+2014 em-dash introduced in any replacement string. The U+2212 minus signs in the two keyStat fields are preserved exactly. All other fields use ASCII hyphen-minus for negative numbers, matching the surrounding convention.

ARCHETYPE NOTE (non-blocking, for clinical-reviewer): the record is archetypeId 'A' and renders a DeltaBandChart. Per the clinical-trial-audit skill, a noninferiority design maps to the `ni-margin-chart` archetype. The DeltaBandChart with an explicit NI callout banner is a reasonable functional equivalent here (it shows the RD, both CI bounds, and "NI not met"), but the margin line itself is only stated in prose, not drawn. Not a factual defect; noting it as a display observation, not a block.

SECTION 8 (expert and editorial caveats), completed as required:
8a ACCOMPANYING EDITORIAL: located. Khatri P. "Intravenous thrombolysis before thrombectomy for acute ischaemic stroke." Lancet 2022;400(10346):76-78, doi 10.1016/S0140-6736(22)01286-7, PMID 35810759. It is the paired Comment for both DIRECT-SAFE and SWIFT DIRECT in the same 9 July 2022 issue. FULL TEXT NOT RETRIEVED: thelancet.com returned HTTP 403 on 2026-07-27 and Europe PMC holds metadata only, no abstract body. I therefore cannot quote it verbatim and am not paraphrasing it as if I had. Downstream authoring should not attribute any specific critique to this editorial until someone with institutional access pulls it.
8b POST-PUBLICATION LETTERS: no correspondence specific to DIRECT-SAFE surfaced in PubMed's linked-comment records for PMID 35810757 as of 2026-07-27; the only linked comment is the Khatri editorial. Recorded as "none found on this search" rather than "none exists".
8c GUIDELINE INCORPORATION: not verified in this pass. The repo holds the full 2026 AHA/ASA stroke guideline locally (docs/2026-AHA-Stroke-guideline.md, src/data/aha2026StrokeGuideline.ts) and that is the correct source for the class/level assigned to bridging-before-EVT; I did not open it because the corrections above are purely numeric and do not touch a guideline claim. Any PR that changes the bridging RECOMMENDATION (as opposed to these statistics) must fill this sub-item first.
8d SUBSEQUENT EVIDENCE: the six-trial direct-vs-bridging body (DIRECT-MT, DEVT, SKIP, MR CLEAN-NO IV, SWIFT DIRECT, DIRECT-SAFE) and the IRIS individual-patient-data meta-analysis are the relevant synthesis layer; the repo already carries the sibling trials and a synthesis question page. Nothing here changes the bedside reading: DIRECT-SAFE remains a trial that failed to establish non-inferiority, and it now reads as failing by a wider margin than the repo currently shows.

SCOPE OF MY ROLE: these are proposed corrections only. Per CLAUDE.md §5 rule 6 and §19, this verification is a hypothesis-confirmation, not an approval to edit. src/data/trialData.ts, src/pages/trials/TrialPageNew.tsx, and the generated card-meta file are clinical surfaces, so applying these edits is a Class E change requiring a plan, V's explicit approval, and a clinical-reviewer artifact. I have not written to any source file.

## % of patients (proportion achieving mRS 0–2 at 90 days); risk differences in percentage points

**Confidence:** high

CHOICE (Renú A, et al. "Effect of Intra-arterial Alteplase vs Placebo Following Successful Thrombectomy on Functional Outcomes in Patients With Large Vessel Occlusion Acute Ischemic Stroke: The CHOICE Randomized Clinical Trial." JAMA. 2022 Mar 1;327(9):826-835. DOI 10.1001/jama.2022.1645; PMID 35143603; NCT03876119).

PRIMARY ENDPOINT (verbatim): "the proportion of patients with a score of 0 or 1 on the modified Rankin Scale at 90 days." Design: phase 2b randomized, double-blind, placebo-controlled SUPERIORITY trial (binary primary outcome), 7 centers in Catalonia, Spain, enrolled Dec 2018 to May 2021, terminated early at 60% of planned enrollment (121 randomized, 113 in the primary analysis) "for inability to maintain placebo availability and enrollment rate because of the COVID-19 pandemic."

PRIMARY RESULT: mRS 0–1 at 90 days 36/61 (59.0%) with intra-arterial alteplase vs 21/52 (40.4%) with intra-arterial placebo; adjusted risk difference 18.4 percentage points, two-sided 95% CI 0.3 to 36.4, P = 0.047. No noninferiority margin (superiority design), so no NI interval applies.

SECONDARY (the audited figure): 90-day mRS distribution, alteplase vs placebo: mRS 0 34.4% vs 23.1%; mRS 1 24.6% vs 17.3%; mRS 2 8.2% vs 23.1%; mRS 3 6.6% vs 9.6%; mRS 4 13.1% vs 11.5%; mRS 5–6 13.1% vs 15.4%. Therefore mRS 0–2 (functional independence) at 90 days = 41/61 (67.2%) with alteplase vs 33/52 (63.5%) with placebo, an absolute difference of 3.7 percentage points. The pre-specified ordinal shift analysis was also non-significant: adjusted common OR 1.54 (95% CI 0.79 to 2.94), P = 0.38.

SAFETY: symptomatic ICH at 24 h 0/61 (0%) vs 2/52 (3.8%), risk difference -3.8 (95% CI -13.2 to 2.5). 90-day mortality 5/61 (8.2%) vs 8/52 (15.4%), risk difference -7.2 (95% CI -19.2 to 4.8).

The repo's 83.6% for the alteplase mRS 0–2 rate corresponds to no published CHOICE value (51/61 would be 83.6%; the true numerator is 41/61). The placebo value of 63.5% in the repo is correct.

**Verifier notes:** AUDIT UPHELD. One occurrence only: `83.6` appears exactly once in the entire src/ tree (src/data/trialData.ts:4223, howToReadChart[1].answer). I grepped trialData.ts, trialCatalogMeta.ts, trialListData.ts, trialListData.cardmeta.generated.ts, trial-questions.ts, trialVisualizations.ts, TrialPageNew.tsx, registry.ts, claims.ts, routeMeta.ts and schema.ts; the wrong value is not duplicated anywhere else, so a single surgical correction fixes the whole record.

STRONG INTERNAL CROSS-CHECK: src/data/trialVisualizations.ts:212-213 already stores the correct published mRS distribution for CHOICE (treatment [34.4, 24.6, 8.2, 6.6, 13.1, 13.1], control [23.1, 17.3, 23.1, 9.6, 11.5, 15.4], sourced to "CHOICE, JAMA 2022, Table 2 and Figure 2"). These sum to 67.2% and 63.5% for mRS 0-2 and to 59.0% and 40.4% for mRS 0-1, matching JAMA exactly. The Grotta-bar chart on the live page was therefore already contradicting the prose beneath it: a clinician expanding "What do the numbers mean clinically?" saw 83.6% while the chart showed 67.2%. That is the strongest possible confirmation that the prose figure, not the chart, is the defect.

CONCLUSION-LEVEL IMPACT (flagged per instruction): the corrected number changes the qualitative reading of the secondary outcome, not the primary. Primary endpoint (mRS 0-1, aRD 18.4 pp, two-sided 95% CI 0.3 to 36.4, P=0.047) is correct everywhere in the record and remains nominally significant, so `primaryResult: 'met'`, `trialResult: 'POSITIVE'`, the stats block, efficacyResults, legend keyStat, bedsidePearl and bottomLineSummary all stand unchanged and need no edit. What changes is that the mRS 0-2 threshold now clearly shows near-parity (3.7 pp), which is why I extended the sentence rather than only swapping the digits. Helpfully, howToInterpret.doesNotProve already states "Because the primary endpoint was mRS 0 to 1 rather than mRS 0 to 2, CHOICE does not establish a benefit for the standard functional independence threshold" - that sentence was already correct and is now consistent with the corrected figure instead of contradicted by it.

NNT CHECK: no NNT is displayed for CHOICE anywhere in the record. Correct, and none should be added from the mRS 0-2 secondary.

SECONDARY DEFECTS FOUND WHILE READING THE FULL RECORD (outside this audit's scope, flagged for the orchestrator to route as separate Class E items, NOT included as corrections here):
1. src/data/trialData.ts:4122 - "stopped early due to alteplase supply shortage" is wrong. JAMA states the trial stopped early "for inability to maintain PLACEBO availability and enrollment rate because of the COVID-19 pandemic." It was the placebo, not the alteplase, that ran out. Line 4227 of the same record states this correctly ("placebo supply expiration"), so the record is internally inconsistent.
2. src/data/trialData.ts:4147 - "stopped early at planned interim due to COVID-19 enrollment challenges" is wrong on the mechanism. There was no stop at a planned interim analysis; enrollment was terminated administratively.
3. The record has no `doi` field (src/data/trialListData.ts:362 does carry the correct DOI 10.1001/jama.2022.1645). Adding `doi: '10.1001/jama.2022.1645'` to the TRIAL_DATA record would align it with sibling records such as rescue-bt-trial.
4. inclusionCriteria says "ASPECTS less than 6 ... exclusion" while ClinicalTrials.gov states ASPECTS >6 inclusion. Minor, low clinical impact, worth a look during the same pass.
5. Consider surfacing the non-significant ordinal shift result (adjusted common OR 1.54, 95% CI 0.79 to 2.94, P=0.38) in howToInterpret.cautions. It is the single most sobering statistic in the paper and is currently absent from the record.

SECTION 8 EXPERT/EDITORIAL CONTEXT (gathered for the downstream packet):
8a Editorial: JAMA ran an accompanying editorial by Pooja Khatri framing CHOICE around distal embolization and the no-reflow phenomenon, arguing the trial "suggests that additional reperfusion therapy may be warranted after relatively successful mechanical thrombectomy of large-vessel occlusions, whether to treat the residual primary thrombus, more distal arterial occlusions, or perhaps even microthromboses," while cautioning that larger cohorts with complete (eTICI 3) reperfusion are needed. I retrieved this via secondary reporting (tctmd) rather than the editorial full text, which is paywalled; the editorial's own DOI was not resolved on this pass.
8b Letters/replies: not retrieved on this pass. Should be searched on PubMed before the full packet ships.
8c Guideline incorporation: src/lib/citations/claims.ts:449 records AHA/ASA 2026 section 4.7.4 as assigning post-EVT adjunctive intra-arterial thrombolytics after successful TICI 2b+ reperfusion COR 2b, LOE B-R, citing CHOICE. I could not independently confirm this from the in-repo guideline extract (src/data/aha2026StrokeGuideline.ts contains no intra-arterial thrombolytic section), so the class/level should be re-verified against the full guideline text before the packet is finalized.
8d Subsequent evidence: CHOICE-2 (JAMA 2026) reported mRS 0-1 57.5% vs 42.5%, adjusted risk difference approximately 15 pp, directionally confirming the primary finding. Multiple 2025 systematic reviews (SVIN, Neurology, J Neuroimaging) pool CHOICE with newer trials; one notes that when the CHOICE risk difference is converted to a risk ratio it "shifted from positive to neutral" (RR 1.46, 95% CI 0.99 to 2.16). Intra-arterial tenecteplase trials (ANGEL-TNK) and at least one neutral intra-arterial lytic trial also now bear on this question. This does not change the correction above but is essential context for the record's cautions.

This is a verification packet only. Per my role I have made no edits to src/data/trialData.ts; the corrections above are for the orchestrator to route through the Class E plan-and-approval gate (CLAUDE.md section 19) with clinical-reviewer sign-off. Note also that the humanizer pre-commit hook will scan trialData.ts: the replacement text contains no U+2014 em-dash and preserves the file's existing "0 to 2" spelled-range convention.

## Absolute risk reduction in percentage points (with two-sided 95% confidence intervals)

**Confidence:** high

HAMLET (Hofmeijer J et al., Lancet Neurol 2009;8(4):326-333; DOI 10.1016/S1474-4422(09)70047-X; PMID 19269254; ISRCTN-registered Dutch multicentre open RCT, n=64, randomized within 96 h of onset).

PRIMARY ENDPOINT (verbatim from Methods): "The primary outcome measure was the modified Rankin scale (mRS) score at 1 year, which was dichotomised between good (0-3) and poor (4-6) outcome."

PRIMARY RESULT: Surgical decompression had NO effect on the primary outcome measure (poor outcome, mRS 4-6, at 1 year): absolute risk reduction 0%, two-sided 95% CI -21 to 21 percentage points. Not significant. This is a superiority design with a dichotomized binary primary outcome; there is no non-inferiority margin.

KEY SECONDARY / SAFETY RESULT: Case fatality at 1 year WAS reduced: ARR 38 percentage points, two-sided 95% CI 15 to 60 (surgery 22% dead vs best medical treatment 59% dead). The CI excludes zero.

PRE-SPECIFIED META-ANALYSIS (DECIMAL + DESTINY + HAMLET patients randomized within 48 h): poor outcome ARR 16%, 95% CI -0.1 to 33 (CI touches/crosses zero); case fatality ARR 50%, 95% CI 34 to 66.

INTERPRETATION (verbatim): "Surgical decompression reduces case fatality and poor outcome in patients with space-occupying infarctions who are treated within 48 h of stroke onset. There is no evidence that this operation improves functional outcome when it is delayed for up to 96 h after stroke onset."

The repo's registry.ts quoted_text has these exactly inverted: it states surgery "reduced poor outcome (mRS >3) but did not reduce mortality," attaching ARR 0% to mortality. Both the numbers and the resulting clinical conclusion are wrong.

**Verifier notes:** CONCLUSION-LEVEL CHANGE (flagged as required): this is not a numeric swap only. The old registry text asserted the opposite of the trial's finding on both endpoints, and the sentence resting on it ("surgery reduced poor outcome ... but did not reduce mortality") had to be rewritten, not just renumbered. HAMLET is a NEUTRAL trial on its functional primary endpoint whose only significant result is the case-fatality reduction. Any downstream copy derived from that quoted_text must be re-checked.

SECOND, INDEPENDENT DEFECT AT THE SAME RECORD: the PMID pointed to a different Lancet Neurology 2009 paper (Feigin's stroke-incidence systematic review). This is a citation-integrity failure the audit did not flag; it also means any prior "source still resolves" freshness check on this citation was passing against the wrong paper. Correction supplied.

WHAT IS ALREADY CORRECT (no corrections returned):
- src/data/trialData.ts 'hamlet-trial' (lines 5599-5754) attaches ARR 0% to the primary endpoint ("No Primary Benefit Overall") and ARR 38% to "Case Fatality Reduction". Correct attribution throughout stats, pearls, howToReadChart, howToInterpret, bottomLineSummary, legend, and the DESTINY-II rctChain predecessor block (line 5794). Event rates 78%/41% survival = 22%/59% case fatality reconcile exactly with the published ARR of 38 points.
- No NNT is displayed for HAMLET anywhere. Design is superiority with a pre-specified dichotomized binary primary outcome, so an NNT would be technically permissible, but the primary endpoint was not met, so none should be added.
- src/data/clinicalSynthesesByQuestion.ts (lines 90-97) and src/lib/citations/claims.ts (line 523) describe HAMLET correctly.
- Archetype A / binary-superiority / trialResult NEUTRAL / primaryResult not-met are all correct classifications.

ONE UNVERIFIED ITEM (Medium confidence on this sub-point only, NOT corrected): trialData.ts states "P=0.002" for the case-fatality reduction in four places (lines 5719, 5726 context, 5739, 5745, 5794 by implication). The published abstract reports only ARR 38% (95% CI 15 to 60) and gives no p-value; the full text is paywalled (thelancet.com and sciencedirect.com both returned HTTP 403). Back-calculating from the reported CI gives z = 3.3, p approximately 0.001, while a continuity-corrected chi-square on 7/32 vs 19/32 gives p approximately 0.003. P=0.002 sits between these and is plausible as the paper's reported value, so I did NOT change it, since altering a p-value without the source table would risk introducing a new error. Recommend a full-text retrieval to confirm before the next last_reviewed refresh; if the paper reports no p-value for case fatality, the CI should be displayed instead of a p-value.

SECTION 8 (expert and editorial caveats) STATUS, for downstream authoring:
8a Accompanying editorial: NOT RETRIEVED. Searched Lancet Neurology April 2009 issue on 2026-07-27; thelancet.com and sciencedirect.com both returned HTTP 403 (paywall), and PubMed's "comment in" links surfaced only the correspondence below, not a paired Comment piece. Stating this explicitly rather than omitting it. The related Lancet Neurol review "Malignant middle cerebral artery infarction: clinical characteristics, treatment strategies, and future perspectives" (Lancet Neurol 2009, DOI 10.1016/S1474-4422(09)70224-8) is a Review, not the accompanying editorial.
8b Post-publication letters: FOUND. "Reassessment of the HAMLET study," Mitchell P, Gregson BA, et al., Lancet Neurol 2009;8(7) (PMID 19539229), DOI 10.1016/S1474-4422(09)70157-7, published within 3 months. Content is behind the same paywall; the critique concerns patient selection and surgical timing/technique. An authors' reply exists in the same correspondence section. This sub-item is partially filled: the letter is identified but its specific methodological critique and whether it survived the reply could not be read. Downstream authoring should not assert what the letter concluded.
8c Guideline incorporation: AHA/ASA 2026 section 6.3 (full text in-repo at docs/2026-AHA-Stroke-guideline.md) gives early decompressive hemicraniectomy COR 1, LOE B-R for age 60 or under and COR 2a, LOE B-R with individualized decision-making for age over 60. HAMLET is one of the three trials underpinning the age-60-or-under recommendation.
8d Subsequent/contradicting evidence: Vahedi K et al., pooled analysis of DECIMAL/DESTINY/HAMLET within 48 h, Lancet Neurol 2007 (PMID 17303527), mortality 71% to 22%, ARR 50 points (95% CI 33 to 67), already in the registry. DESTINY II (Juttler E et al., NEJM 2014, PMID 24645942) extended to age 61-82. HAMLET 3-year follow-up exists (PMID 23868265, Stroke 2014) and was NOT reviewed here; recommend it before the next last_reviewed refresh. None of these change the bedside interpretation of HAMLET itself.

Because 8a is unretrievable and 8b is only partially readable, a full new-trial evidence packet for HAMLET would be Medium confidence on Section 8. This verification of the two flagged numeric/citation defects is High confidence: both were confirmed against the publisher-indexed abstract via Europe PMC and cross-checked by independent PMID resolution.

GOVERNANCE NOTE: these edits touch src/lib/citations/registry.ts, a clinical claim surface. Per CLAUDE.md this is a Class E change requiring plan approval, a clinical-reviewer gate, a clinical review artifact, and a last_reviewed refresh via the section 13.6 checklist. I have not edited any file; corrections above are proposals only.

## modified Rankin Scale (mRS) points, pre-stroke functional-status eligibility ceiling

**Confidence:** high

DEFUSE 3 (Albers GW et al., NEJM 2018;378(8):708-718; DOI 10.1056/NEJMoa1713973; PMID 29364767; NCT02586415) enrolled patients with a PRE-STROKE mRS of 0 to 2, not 0 to 1.

Verbatim clinical inclusion criterion (ClinicalTrials.gov NCT02586415, protocol section, and already quoted correctly inside the repo's own fullEligibility block): "Modified Rankin Scale less than or equal to 2 prior to qualifying stroke (functionally independent for all ADLs)." The corresponding exclusion ceiling is therefore pre-stroke mRS >= 3, not >= 2.

mRS 0-1 is the DAWN criterion (NCT02142283: "No significant pre-stroke disability (pre-stroke mRS 0 to 1)"), which is what appears to have been cross-contaminated into the DEFUSE 3 record.

All other verified DEFUSE 3 parameters in the repo are CORRECT against the NEJM full text:
- Design: ordinal-shift superiority. Primary efficacy outcome verbatim: "The primary efficacy outcome was the ordinal score on the modified Rankin scale (range, 0 [no symptoms] to 6 [death]) at day 90."
- Primary result: unadjusted common odds ratio 2.77, 95% CI 1.63 to 4.70, P<0.001. Interval type: TWO-SIDED 95% CI. The SAP "specified one-sided hypothesis testing for the Wilcoxon rank-sum test and a P value of less than 0.025 as a measure of statistical significance, but we report two-sided results and use a P value of less than 0.05 as a measure of statistical significance." Adjusted OR 3.36 (95% CI 1.96 to 5.77), P<0.001 (repo does not display this; not an error).
- No non-inferiority margin: this is a superiority design, so no margin applies.
- Secondary functional independence (mRS 0-2) at day 90: 45% (41/92) vs 17% (15/90); risk ratio 2.67, 95% CI 1.60 to 4.48, P<0.001. The repo correctly labels NNT 3.6 as derived from this SECONDARY dichotomization, which satisfies the ordinal-shift NNT-labeling rule.
- Safety: 90-day death 14% vs 26% (P=0.05); symptomatic ICH within 36 h 7% (6/92) vs 4% (4/90), RR 1.47 (95% CI 0.40 to 6.55), P=0.75; serious adverse events 43% vs 53% (P=0.18); parenchymal hematoma type 2 9% vs 3% (P=0.21).
- n=182 (92 EVT / 90 medical) at 38 U.S. centers, terminated early for efficacy against a planned maximal sample of 476 (prespecified efficacy boundary P<0.0025 crossed). Age 18-90, NIHSS >= 6, core <70 mL, mismatch ratio >= 1.8, mismatch volume >= 15 mL, RAPID/iSchemaView. Only one M2 occlusion enrolled (Table 1 footnote). All repo-displayed values match.

**Verifier notes:** AUDIT CONFIRMED. Exactly five rendered occurrences of the wrong pre-stroke mRS ceiling exist inside the 'defuse-3-trial' record in src/data/trialData.ts (inclusionCriteria ~6645, exclusionCriteria ~6651, howToInterpret.proves ~6752, applicability.imagingSelection ~6759, pearls ~6845). All five are corrected above.

SELF-CONTRADICTION INSIDE THE RECORD (strongest internal evidence the audit is right): the record's own fullEligibility block at line ~6668 already carries the CORRECT verbatim ClinicalTrials.gov criterion, "Modified Rankin Scale less than or equal to 2 prior to qualifying stroke (functionally independent for all ADLs)." So the trial page currently renders mRS 0-1 in five summary surfaces and mRS <= 2 in the expandable full-criteria block. That block is correct and must NOT be edited. (The task brief listed fullEligibility as one of the five wrong places; it is not, and touching it would break the verbatim-source contract.)

NO CONCLUSION CHANGE. This is a population/eligibility correction only. It does not touch any effect estimate, CI, p-value, or interval type, so no interpretive sentence that rests on a statistic needs rewriting. I re-verified every displayed statistic against the NEJM full text and all are correct: cOR 2.77 (two-sided 95% CI 1.63-4.70, P<0.001), mRS 0-2 45% vs 17% (RR 2.67, 95% CI 1.60-4.48), mortality 14% vs 26% (P=0.05), sICH 7% vs 4% (P=0.75), n=182 of a planned 476, stopped early for efficacy. No NNT was introduced; the existing NNT 3.6 is already explicitly labeled as derived from the SECONDARY mRS 0-2 dichotomization, which is the required treatment for an ordinal-shift primary.

HOUSE STYLE: no U+2014 em-dash is introduced by any of the five edits. The existing U+2013 en-dashes ("0–1" to "0–2", "6–16") and the existing spacing convention ("≥ 15 ml" with spaces in the pearls string, "≥15 mL" without in the others) are preserved exactly as found.

DELIBERATELY NOT CORRECTED, line ~6849, and this needs medical-scientist attention: the pearl 'AHA/ASA 2026 §4.7.2 COR 1: EVT recommended for anterior LVO 6–24h with imaging selection (NIHSS ≥6, ASPECTS ≥3, age <80, prestroke mRS 0–1)' is a GUIDELINE claim, not a DEFUSE 3 eligibility claim, and I verified it against the in-repo guideline source (src/data/aha2026StrokeGuideline.ts lines 438-459), which does specify prestroke mRS 0-1 for the 6-24 h recommendation. So the mRS value there is correct as a guideline restatement and I left it alone. But it creates a real bedside tension worth an explicit editorial note: DEFUSE 3 itself enrolled up to pre-stroke mRS 2, while the 2026 guideline's 6-24 h Class 1 wording is narrower at mRS 0-1 (the guideline handles mRS 2 separately, as a Class 2a within-6-hour recommendation, at aha2026StrokeGuideline.ts line ~480). Downstream authoring should say the trial enrolled 0-2 while the guideline recommendation is written at 0-1, rather than silently harmonizing the two. Separately, that same pearl's "ASPECTS ≥3" conflates the general 6-24 h recommendation (ASPECTS >= 6) with the large-core selected-patient recommendation (ASPECTS 3-5); that is a distinct pre-existing defect, out of scope here, and should be parked.

OUT-OF-RECORD OCCURRENCE OF THE SAME ERROR (out of scope for these corrections, should be parked as a follow-up): src/pages/MrsCalculator.tsx line 383 states "The landmark trials (DAWN, DEFUSE-3, SELECT-2) enrolled prestroke mRS 0–1". That is wrong for DEFUSE-3 for the same reason and appears on a live calculator interpretation surface. It needs its own -clinical task; I did not include it because the brief scoped corrections to the trial record.

ALSO NOTED, pre-existing and unrelated to this audit: stats.absoluteReduction.value renders the literal string '28 pp [verification pending]' to users (line ~6786). The NEJM paper genuinely does not publish a 95% CI for the mRS 0-2 absolute risk difference (only the RR CI 1.60-4.48), so the underlying caution is legitimate, but shipping an internal "[verification pending]" marker into rendered clinical content is a display defect. Recommend a separate task.

SECTION 8 (expert/editorial context), stated explicitly rather than skipped, since this is a defect-verification pass and not a new-trial packet: 8a, NEJM did not run a paired editorial with DEFUSE 3 in the 2018-02-22 issue that I could retrieve; nejm.org returned HTTP 403 on 2026-07-27 for the correspondence DOI 10.1056/NEJMc1803856, so I could not read the letters in full. 8b, post-publication correspondence does exist at NEJMc1803856 with an authors' reply; content unverified due to the 403, flagged as a gap rather than omitted. 8c, guideline incorporation is confirmed from the in-repo AHA/ASA source (§4.7.2, 6-24 h anterior LVO, Class 1) and the record's existing citation is consistent. 8d, the relevant subsequent synthesis is the AURORA individual-patient-data meta-analysis of late-window EVT (pooling DAWN, DEFUSE 3, POSITIVE, RESILIENT); I did not re-verify its effect estimate in this pass. If a full new-trial packet is required for this record, 8a/8b/8d must be completed before clinical-reviewer sign-off; for this narrow eligibility correction they are not blocking.

## Treatment-timing values are in hours / days after stroke onset; the primary effect estimate is in percentage points (absolute risk difference).

**Confidence:** high

ELAN (Fischer U et al., "Early versus Later Anticoagulation for Stroke with Atrial Fibrillation," N Engl J Med 2023;388(26):2411-2421; DOI 10.1056/NEJMoa2303048; PMID 37222476; NCT03148457).

EARLY ARM (DOAC start time, verbatim from the publication and registry): "within 48 hours after a minor or moderate stroke or on day 6 or 7 after a major stroke." There is no 6-to-24-hour DOAC start in ELAN for any severity stratum.

LATER ARM (control): "day 3 or 4 after a minor stroke, day 6 or 7 after a moderate stroke, or day 12, 13, or 14 after a major stroke" (the imaging-severity "1-3-6-12 day rule").

RANDOMIZATION / ENROLLMENT WINDOW: within 48 h after symptom onset for minor and moderate stroke, and at day 6-7 for major stroke (ELAN protocol paper: "Randomisation is performed within 48 h after symptom onset in participants with minor and moderate stroke and at day 6-7 in participants with major stroke"; ClinicalTrials.gov NCT03148457 arm text: "Early treatment will be started within 48 hours after symptom onset (minor and moderate ischaemic stroke) or at day 6 + 1 day after symptom onset (major ischaemic stroke)"). A "6 to 24 hour" randomization window for major stroke does not exist anywhere in ELAN; an exact-phrase web search for it returns only DAWN-trial material.

SEVERITY DEFINITIONS (imaging-based): minor = infarct 1.5 cm or smaller; moderate = infarct in the distribution of a cortical superficial branch of the MCA, ACA, or PCA; major = larger infarcts in those distributions, or a brainstem/cerebellar infarct larger than 1.5 cm.

PRIMARY ENDPOINT: composite of recurrent ischemic stroke, systemic embolism, major extracranial bleeding, symptomatic intracranial hemorrhage, or vascular death within 30 days after randomization.

PRIMARY RESULT: 29/1006 (2.9%) early vs 41/1007 (4.1%) later; risk difference -1.18 percentage points, two-sided 95% CI -2.84 to 0.47. Estimation design: no formal superiority or noninferiority hypothesis was tested and no noninferiority margin was pre-specified, so there is no p-value and no NNT.

SAFETY: symptomatic intracranial hemorrhage 2 patients (0.2%) in each arm by 30 days (OR 1.02, 95% CI 0.16-6.59); recurrent ischemic stroke 14 (1.4%) early vs 25 (2.5%) later; systemic embolism 0.4% vs 0.9%.

All of these repo values (2.9% vs 4.1%, -1.18 pp, 95% CI -2.84 to +0.47, sICH 0.2% both arms, n=2013, estimation design) are CORRECT as published. The only defect is the treatment/randomization timing for the MAJOR stroke stratum.

**Verifier notes:** SCOPE OF THE DEFECT. The wrong value appears three times in the ELAN record and nowhere else in the repo. I grepped the whole of src/ for "6-24", "6 to 24", and "6–24": every other hit belongs to DAWN, BAOCHE, RESCUE-Japan LIMIT, or the EVT pathway, where 6-24 h is correct. The ELAN entries in trialCatalogMeta.ts, trialListData.ts, trial-questions.ts, seo/schema.ts, and src/pages/ElanPathway.tsx all already state "day 6-7" for major stroke and need no change. src/pages/trials/TrialPageNew.tsx renders ELAN from data, so fixing trialData.ts fixes the page.

INTERNAL CONTRADICTION CONFIRMS THE DEFECT. Within the same record, intervention.treatment ("Day 6-7 for major stroke"), efficacyResults.treatment.name ("day 6-7 major"), and armDetails[0].note ("on day 6 or 7 after a major stroke... verbatim from Fischer NEJM 2023 p.2413") are all correct. Only the three strings above disagree.

THE AUDIT IS RIGHT ABOUT THE DEFECT BUT WRONG ABOUT THE EXPLANATION. The audit says 6-24 h is "the RANDOMIZATION window for major stroke." It is not. ELAN randomized major-stroke patients at day 6-7; minor/moderate within 48 h. So the two inclusion-criteria fields that the audit implicitly treated as correct are in fact also wrong, and I have included corrections for them. An exact-phrase search for "within 6 to 24 hours after a major stroke" returns zero ELAN sources, only DAWN material, which is the most likely origin of the error.

NO CONCLUSION CHANGE. The interpretive claims rest on the risk difference and its CI, which are correct as published (-1.18 pp, two-sided 95% CI -2.84 to 0.47). The "not significantly worse than delayed initiation" framing is unaffected by these timing corrections, so no interpretive sentence needs rewriting beyond the parenthetical itself.

DESIGN AND STATISTICS CHECKS (all pass). statisticalFramework: estimation design, correctly encoded as specialDesign: 'estimation-trial' with pValue "N/A" and calculations left empty. No NNT is shown anywhere for ELAN, which is correct for a non-hypothesis-testing design. No noninferiority margin was pre-specified, so the ni-margin display rules do not apply. The archetype A (bar-binary style) display with an explicit "estimation trial, not superiority" disclaimer in howToReadChart and applicability.populationExclusions satisfies the registry/non-superiority disclaimer rule. One minor, non-blocking wording flag for medical-scientist, outside the audit scope: the pearl "98% probability that early treatment increases risk by no more than 0.5 percentage points" is a Bayesian-sounding gloss on a frequentist one-sided tail of the 95% CI; consider rewording to "the upper 95% confidence limit is +0.47 percentage points" for precision. I did not correct it because it is arguable and not part of this audit item.

SECTION 8 (expert and editorial context), completed per the mandatory-block rule.
8a. Accompanying editorial EXISTS and was located: Uchino K. "Anticoagulation Conundrum in Acute Ischemic Stroke with Atrial Fibrillation." N Engl J Med 2023;388(26):2479-2480, DOI 10.1056/NEJMe2304801. Full text is paywalled (nejm.org returned HTTP 403 on 2026-07-27); I confirmed its existence, title, author, and page range from the ACC trial summary and NEJM listing, and read secondary summaries. Its central framing is that ELAN's estimation design cannot settle the timing question definitively and that the balance between hemorrhagic risk and recurrent-stroke prevention remains individualized, especially for large infarcts. Quote not reproduced because full text could not be retrieved.
8b. Post-publication letters and replies: PubMed and journal-site searching on 2026-07-27 surfaced no indexed NEJM correspondence specific to NEJMoa2303048. Marked "none located" rather than "none exists," since paywalled correspondence indexing is imperfect.
8c. Guideline incorporation: the 2026 AHA/ASA stroke guideline gives a Class 2a recommendation that earlier DOAC initiation is reasonable in carefully selected patients with AF-related ischemic stroke; the repo already surfaces this in ElanPathway.tsx and seo/schema.ts. The 2025 World Stroke Organization scientific statement (Sposato et al., Int J Stroke 2025) also incorporates ELAN.
8d. Subsequent evidence: OPTIMAS (Lancet 2024) and the CATALYST prospective individual-participant-data meta-analysis of TIMING, ELAN, OPTIMAS, and START (Lancet, published online 23 June 2025) both support early initiation. CATALYST found the composite of recurrent ischemic stroke, symptomatic ICH, or unclassified stroke at 30 days in 2.1% with early (within 4 days) vs 3.0% with delayed initiation. CATALYST explicitly notes that severe stroke and hemorrhagic-transformation patients were under-represented, which reinforces, and does not overturn, ELAN's own caution about very large infarcts. This does not change the bedside interpretation the repo already carries.

RETRIEVAL LIMITATION. NEJM full text (nejm.org) and two AHA-journal subanalyses returned HTTP 403. Ground truth for arm timing was therefore triangulated from four independent non-paywalled sources that agree exactly: the ClinicalTrials.gov NCT03148457 arm/intervention text, the open-access ELAN protocol paper (PMC9720853), the official trial site elan-trial.ch, and the JAMA Neurology post hoc analysis Methods (Goeldlin et al. 2024), plus the NEJM abstract as reproduced in several secondary sources. Confidence is High for the corrected timing values and for the primary result and CI.

## percentage points (absolute risk difference, tenecteplase minus alteplase)

**Confidence:** high

AcT (Menon BK et al., Lancet 2022;400(10347):161-169; DOI 10.1016/S0140-6736(22)01054-6; PMID 35779553; NCT03889249).

PRIMARY ENDPOINT (verbatim): "the proportion of patients who had a modified Rankin Scale (mRS) score of 0-1 at 90-120 days after treatment."

DESIGN: pragmatic, multicentre, open-label, registry-linked, randomised, controlled NON-INFERIORITY trial. Intention-to-treat.

PRE-SPECIFIED NI MARGIN: non-inferiority declared if the LOWER bound of the TWO-SIDED 95% CI of the unadjusted risk difference (tenecteplase minus alteplase) was MORE THAN -5% (i.e. margin = -5 percentage points, on the absolute risk-difference scale, favouring-alteplase direction). Criterion is CI-based; the paper does NOT report a non-inferiority p-value.

PRIMARY RESULT: mRS 0-1 in 296/802 (36.9%) tenecteplase vs 266/765 (34.8%) alteplase. Unadjusted risk difference 2.1%, 95% CI -2.6 to 6.9 (two-sided 95%). Lower bound -2.6% > -5%, therefore non-inferiority MET. p for superiority = 0.19 (superiority not shown).

SAFETY: sICH at 24 h 27/800 (3.4%) vs 24/763 (3.2%); 90-day all-cause mortality 122/796 (15.3%) vs 117/763 (15.4%); orolingual angioedema 1.1% vs 1.2%; extracranial bleeding requiring transfusion 0.8% vs 0.8%.

REPO IS WRONG on the interval: it states 95% CI -1.4 to +5.6 (width 7.0 pp) versus the published -2.6 to 6.9 (width 9.5 pp). The repo interval is ~26% too narrow in width and, more importantly, its lower bound is misstated by 1.2 pp in the direction that overstates the NI cushion. The repo also states a superiority p-value of 0.21 (published: 0.19) and asserts "NI P<0.001", a statistic AcT never reported.

**Verifier notes:** AUDIT VERDICT: correct. The repo overstates the precision of AcT's primary result and, in the same breath, overstates the non-inferiority cushion.

INTERNAL CORROBORATION: the repo already contains the correct figure elsewhere. `src/data/strokeClinicalPearls.ts:341` reads "RD 2.1% (95% CI −2.6 to 6.9), lower bound above margin, NI met" and correctly notes "Display: NI margin chart, not NNT". So trialData.ts and TrialPageNew.tsx are the drifted surfaces, not the pearls file. Leave the pearls entry alone.

DOES THE CONCLUSION CHANGE? No. Non-inferiority still holds: -2.6 pp is still above the -5 pp margin, and superiority is still not shown (CI crosses zero under both the wrong and the right interval). So no clinical recommendation flips. BUT the interpretive framing does need softening in one place: the answer at trialData.ts:13211 said the lower bound was "comfortably above" the margin. With the true bound the cushion is 2.4 pp, not 3.6 pp, so "comfortably" is dropped in the correction. Flagging this per instruction.

TWO DEFECTS BEYOND THE AUDIT'S CLAIM, both found while reading the whole record:
1. Superiority p-value stated as 0.21 in two fields (howToReadChart item 2 and howToInterpret.cautions). The published value is 0.19 (ACC trial summary of the Lancet primary report). Two corrections supplied.
2. "NI P<0.001" appears in howToInterpret.proves and as the howToReadChart item-3 question header. AcT declared non-inferiority by a confidence-interval rule and did not publish a non-inferiority p-value. This is an unsourced statistic on a rendered clinical surface. It is also internally inconsistent with the chart, which renders stats.pValue.value = 'NI Met'. Removed in the corrections.

NNT: none present in the AcT record, and none introduced. Correct for a noninferiority design.

HOUSE STYLE: no U+2014 em-dash introduced in any newText. The existing U+2212 minus sign (−) used for negative values and the surrounding punctuation convention are preserved verbatim.

DOWNSTREAM NOTE FOR THE ORCHESTRATOR: this is a Class E / clinical change touching trialData.ts, TrialPageNew.tsx and a generated data file. After the trialData.ts edit, prefer `npm run generate:card-meta` over hand-editing trialListData.cardmeta.generated.ts, then diff to confirm it matches the supplied correction. Gate 6 should fetch /trials/act-trial and confirm the chart now reads -2.6 to +6.9.

EVIDENCE PACKET SECTIONS 2-8 (packet file not written per harness instruction; content returned here):

2. POPULATION. Adults 18+, ischaemic stroke with disabling deficit, within 4.5 h of onset, eligible for thrombolysis under Canadian CSBPR 2018. EVT-eligible patients were NOT excluded (co-enrolment permitted). 22 Canadian centres, Dec 2019 to Jan 2022. Pragmatic all-comers, no imaging selection beyond ruling out haemorrhage. Generalisability caveat for NeuroWiki: Canadian routine practice, registry-linked outcome ascertainment, open-label. Repo inclusion/exclusion and fullEligibility fields match the publication and need no change.

3. INTERVENTION / COMPARATOR. Tenecteplase 0.25 mg/kg (max 25 mg) single IV bolus vs alteplase 0.9 mg/kg (max 90 mg), 0.09 mg/kg bolus then 60-min infusion of the remaining 0.81 mg/kg. Repo armDetails match.

4. PRIMARY ENDPOINT. "The proportion of patients who had a modified Rankin Scale (mRS) score of 0-1 at 90-120 days after treatment." Repo primaryEndpoint (mRS 0-1 at 90-120 days) matches.

5. STATISTICAL FRAMEWORK. noninferiority. Repo primaryDesign 'noninferiority' is correct; display archetype is an NI/delta-band chart, correct for the design.

6. PRIMARY RESULT. See trueValues.

7. KEY SAFETY. sICH 3.4% vs 3.2%; 90-day mortality 15.3% vs 15.4%; angioedema 1.1% vs 1.2%. Repo safetyProfile and pearls all match the publication. No change needed.

8. EXPERT AND EDITORIAL CAVEATS.
8a. Accompanying editorial: LOCATED but NOT QUOTABLE. Sandset EC, Tsivgoulis G. "Tenecteplase for acute ischaemic stroke." Lancet 2022;400(10347):138-139. DOI 10.1016/S0140-6736(22)01107-2, PMID 35779556. Identified via PubMed on 2026-07-27. The Lancet full text returned HTTP 403 (paywall) on two fetch attempts, and the PubMed record carries "No abstract available", so no verbatim critique sentence can be supplied. Stated explicitly rather than omitted. This does not block the numeric correction, which is fully verified from the primary report, but a downstream authoring task that wants to add editorial framing to the AcT entry should obtain the Comment full text first.
8b. Post-publication letters: Menon BK, Singh N, Sylaja PN. "Tenecteplase use in patients with acute ischaemic stroke." Lancet 2023;401(10377):618-619, PMID 36774934, DOI 10.1016/S0140-6736(22)02633-2. Correspondence in the post-TRACE-2 tenecteplase discussion; full text paywalled (HTTP 403 on 2026-07-27). No retrieved methodological critique of AcT's primary analysis survived to alter the published effect estimate, and no erratum to the primary report was found on PubMed.
8c. Guideline incorporation: 2026 AHA/ASA Guideline for the Early Management of Acute Ischemic Stroke. COR 1 that for adults with AIS within 4.5 h of onset or last known well who are IVT-eligible, tenecteplase 0.25 mg/kg (max 25 mg) OR alteplase 0.9 mg/kg is recommended to improve functional outcomes; tenecteplase 0.4 mg/kg is not recommended. AcT is named among the supporting trials (with EXTEND-IA TNK, ATTEST-2, NOR-TEST 2A, TASTE). Note: the in-repo guideline extract (docs/2026-AHA-Stroke-guideline.md) contains only the angioedema recommendation text for tenecteplase, so the COR 1 statement above is sourced externally and should be confirmed against the full guideline PDF before it is quoted verbatim on a claim surface.
8d. Subsequent evidence: Abuelazm M et al., systematic review with pairwise and network meta-analysis, 9 RCTs / 3707 patients (1967 TNK, 1740 alteplase). TNK 0.25 mg/kg vs alteplase for mRS 0-1: RR 1.03 (95% CI 0.96 to 1.10), p = 0.42. sICH: RR 1.15 (95% CI 0.80 to 1.67), p = 0.45. Subsequent confirmatory NI RCTs (TRACE-2 2023, ATTEST-2 2024, ORIGINAL 2024) are all directionally consistent. None of this materially changes the bedside interpretation of AcT, and none of it changes the numbers being corrected here.

9. NEUROWIKI FIELD MAPPING. Safe to update on the strength of this packet: trialData['act-trial'].howToReadChart[0].answer, [1].answer, [2].question, [2].answer; .howToInterpret.proves; .howToInterpret.cautions; .bottomLineSummary; TrialPageNew.tsx AcT DeltaBandChart ciLow/ciHigh; trialListData.cardmeta.generated.ts bottomLineSummary. Verified-unchanged (do not touch): doi, clinicalTrialsId, primaryEndpoint, primaryDesign, efficacyResults percentages, safetyProfile, pearls, inclusion/exclusion, fullEligibility, armDetails, stats.effectSize, legend.keyStat.

10. VERIFICATION CONFIDENCE: High for the numeric correction. Primary endpoint, design, effect estimate, interval type, NI margin, superiority p-value and safety all confirmed from the PubMed abstract of the primary report plus two independent trial summaries (ACC, REBEL EM) that quote the same figures verbatim, and corroborated by an existing correct entry inside this repo. Medium only for §8a/§8b, where the editorial and correspondence are paywalled and the gap is stated explicitly.

## percentage points (absolute risk difference in the proportion achieving mRS 0–1 at 90 days)

**Confidence:** high

ARAMIS (Chen HS et al., JAMA. 2023;329(24):2135-2144; DOI 10.1001/jama.2023.7827; PMID 37367978; NCT03661411).

PRIMARY ENDPOINT (verbatim, abstract/methods): "excellent functional outcome, defined as a modified Rankin Scale score of 0 or 1" at 90 days.

STATISTICAL FRAMEWORK: noninferiority (open-label, blinded-endpoint, multicenter RCT at 38 hospitals in China, Oct 2018 to Apr 2022; 760 randomized).

PRIMARY RESULT (verbatim): "At 90 days, 93.8% of patients (346/369) in the DAPT group and 91.4% (320/350) in the alteplase group had an excellent functional outcome (risk difference, 2.3% [95% CI, -1.5% to 6.2%])." P for noninferiority < .001. Adjusted 95% CI, -1.6% to 6.1%.

INTERVAL TYPE: the reported interval is a two-sided 95% CI on the risk difference. The prespecified noninferiority criterion was framed on the LOWER BOUNDARY OF THE 1-SIDED 97.5% CI of the risk difference, which is numerically identical to the lower bound of the two-sided 95% CI (-1.5%). Both framings therefore give -1.5% as the operative lower bound.

NONINFERIORITY MARGIN: -4.5 percentage points (i.e., NI declared if the lower boundary of the 1-sided 97.5% CI of the risk difference exceeded -4.5%). Margin justification derived from the Third International Stroke Trial (IST-3). Observed lower bound -1.5% > -4.5%, so noninferiority was met.

KEY SAFETY: symptomatic intracerebral hemorrhage AT 90 DAYS, 1/371 (0.3%) DAPT vs 3/351 (0.9%) alteplase. Early neurological deterioration at 24 h favored DAPT (adjusted risk difference -4.6%, 95% CI -8.3% to -0.9%). No significant difference in 90-day death. Crossover from alteplase was 20.4%.

**Verifier notes:** AUDIT IS CORRECT, and it undercounted. The audit flagged one defect (the chart CI); I found five distinct factual defects across nine occurrences in three files.

CONFIRMED DEFECTS
1. Fabricated confidence interval (the audit's finding). TrialPageNew.tsx:2980-2981 renders "−0.2 to +4.8". No published source contains this interval, and it appears nowhere else in the ARAMIS record. Published unadjusted two-sided 95% CI is -1.5% to 6.2% (adjusted -1.6% to 6.1%). The audit's stated true value is exactly right.
2. Wrong noninferiority margin. trialData.ts howToInterpret.proves states "prespecified margin of −3 percentage points". The published margin is -4.5 percentage points, prespecified as the lower boundary of the 1-sided 97.5% CI of the risk difference, justified from IST-3. This is the more clinically consequential error of the two, because the margin is the entire basis of the NI claim.
3. Wrong risk difference, repeated in 4 places. "RD +2.4 pp" appears in TrialPageNew.tsx:2979, trialData.ts howToReadChart, howToInterpret.proves, bottomLineSummary, plus the generated card-meta mirror. Published RD is 2.3%. The record is internally inconsistent: stats.effectSize and legend.keyStat already say "+2.3%".
4. Wrong site count. TrialPageNew.tsx:2991 says "28 centers in China"; published is 38 hospitals. The record's own armDetails note already says 38, so this was an internal contradiction too.
5. Mislabeled safety timepoint. safetyProfile.sICH label says "at 24 hours"; the 0.3% vs 0.9% figures are the 90-day sICH rates (1/371 vs 3/351).

CONCLUSION IMPACT: NONE, but read this carefully. The corrected CI lower bound (-1.5%) still sits well above the true margin (-4.5%), so "noninferiority met" remains valid and no interpretive sentence needs reversal. Two nuances the reviewer should register:
- The direction of the margin error made the trial look MORE stringent than it was. A -4.5 pp margin is materially more permissive than the -3 pp the repo claimed. Downstream authoring should not present ARAMIS as having cleared a tight margin. The -4.5% margin is the single most common post-publication criticism of this trial, repeatedly described in expert commentary as generous given alteplase's small absolute benefit in minor stroke.
- The corrected CI crosses zero (-1.5 to +6.2), as did the fabricated one. No superiority claim was or is being made, and the record already states this correctly in howToReadChart ("Does DAPT superiority follow from these rates? No.").

NOT CORRECTED, FLAGGED FOR medical-scientist (authoring judgment, outside my remit)
- bedsidePearl reads "(NNT context: both arms excellent, 93.8% vs 91.4%)". No NNT value is stated, so it does not breach the numeric NNT ban, but invoking NNT framing at all on a noninferiority design is against the clinical-trial-audit NNT rules and I recommend striking the phrase. I did not edit it because it requires a prose rewrite, not a value swap.
- The record nowhere states the crossover rate limitation in a user-facing field, though armDetails notes 20.4% crossover from alteplase. Consider surfacing it in cautions.

SECTION 8 (expert and editorial caveats) STATUS, for the downstream gate
- 8a Accompanying editorial: NOT LOCATED. Searched JAMA Network (jamanetwork.com, JAMA vol 329 issue 24) and PubMed on 2026-07-27; no paired JAMA editorial identified for this trial. Closest post-publication expert synthesis located: an AHA Blogs article commentary (ahajournals.org/do/10.1161/blog.20231017.748481), an ESO commentary ("Antiplatelet or Alteplase in minor stroke with nondisabling deficits: Do we have a definite answer now?"), and a J Transl Intern Med 2023 perspective ("Dual antiplatelet instead of intravenous thrombolysis for minor nondisabling acute ischemic stroke: A perspective from China"). State this explicitly as "no accompanying editorial found" rather than omitting.
- 8b Letters and replies: the surviving methodological critiques are (i) the -4.5% noninferiority margin, widely characterized as generous, (ii) 20.4% crossover from the alteplase arm, and (iii) open-label design with China-only enrollment.
- 8c Guideline incorporation: NOT VERIFIED in this pass. I did not confirm a specific AHA/ASA or ESO class/level assignment for ARAMIS. This sub-item is open and must be filled before a full new-trial packet ships. It does not block the numeric corrections above, which are verified directly against the primary source.
- 8d Subsequent evidence: prespecified post hoc analyses published in Stroke (2025) on early neurological deterioration with vs without LVO, and a post hoc renal-function analysis. Neither materially changes bedside interpretation.

HOUSE STYLE: no U+2014 em-dash is introduced by any correction. All minus signs in newText use U+2212 to match the file's existing convention (the repo already uses U+2212 in ciLow and in "−3 percentage points"). No NNT value is introduced.

PROCESS NOTE: src/data/trialListData.cardmeta.generated.ts is a generated artifact. Preferred path is to fix trialData.ts and re-run `npm run generate:card-meta`; the correction I supply for that file is byte-identical to what the generator will emit. All three touched files are clinical surfaces per .claude/rules/clinical-surfaces.md, so this is a Class E / -clinical change requiring a plan, V approval, and a clinical-reviewer artifact before any edit is applied. I have not edited any file.

## Patients randomised (count); primary endpoint = proportion (%) with visual-acuity gain ≥0.3 LogMAR; effect measures = percentage-point risk difference and adjusted odds ratio (two-sided 95% CI)

**Confidence:** high

THEIA (Préterre C et al., Lancet Neurol 2025;24(11):909-919; PMID 41109232; DOI 10.1016/S1474-4422(25)00308-4; NCT03197194).

CONDUCT: The trial was NOT stopped early. ClinicalTrials.gov records overall status "Completed" (16 Jan 2024) with Enrollment 70, type "Actual", and no "why stopped" field. Enrolment ran 8 June 2018 to 2 October 2023 across 16 French stroke units. 70 patients randomised, 35 per arm. There is no "planned 178" anywhere in the publication or registry; 178 is fabricated.

SAMPLE SIZE / POWER: The calculated sample size WAS 70. Assumptions: 10% improvement in the aspirin arm vs 40% in the alteplase arm (30 percentage-point absolute difference), two-sided alpha 0.05, 80% power, 10% anticipated dropout. The trial was underpowered because the assumed control-arm response rate was wrong: the observed aspirin improvement rate was 48%, not 10% (and dropout was 20%, not 10%). Underpowering is an assumption failure, not an enrolment shortfall.

STATISTICAL FRAMEWORK: frequentist binary superiority, two-sided alpha 0.05. No non-inferiority margin. Analysis by generalised linear mixed model with logit link (repeated binary measures). NNT is not appropriate (superiority not met; risk-difference CI crosses zero).

PRIMARY ENDPOINT (verbatim): "improvement in visual acuity of at least 0.3 logarithm of the minimum angle of resolution (LogMAR) from baseline to 1 month." Timepoint is 1 MONTH, not 90 days. (90 days / 3 months carried only secondary outcomes: visual field, foveal threshold, mRS, NEI-VFQ-25.)

PRIMARY RESULT (verbatim): "Among 56 patients with available data on the primary endpoint, 19 (66%) of 29 patients in the alteplase group and 13 (48%) of 27 patients in the aspirin group showed an improvement in visual acuity of at least 0.3 LogMAR at 1 month (unadjusted risk difference 17.4 [95% CI -11.8 to 46.5]; adjusted odds ratio 1.1 [95% CI 0.07 to 18.39]; p=0.95)." Both intervals are two-sided 95% CIs.

COMPARATOR: 300 mg oral aspirin plus IV saline placebo (ACTIVE comparator in a double-dummy design), NOT placebo. Intervention: IV alteplase 0.9 mg/kg (max 90 mg; 10% bolus, remainder over 1 h) plus oral placebo.

SAFETY: 0 symptomatic intracranial haemorrhage in both arms; 1 asymptomatic 15 mm right parietal haematoma on day-1 CT in the alteplase arm; 0 major extracranial bleeds related to study treatment; serious adverse events unrelated to treatment 5/35 (14%) alteplase vs 6/35 (17%) aspirin.

**Verifier notes:** AUDIT UPHELD. The defect is confined to the single synthesis paragraph at src/data/clinicalSynthesesByQuestion.ts:142 ('crao-management' bodyParagraphs[2]). I checked every other THEIA surface in the repo and all of them are correct, so no duplicated wrong values exist elsewhere:
- src/data/trialData.ts 'theia-trial' (lines 18585-18810): correctly states N=70 randomised, "Powered for a 30 pp absolute improvement (40% alteplase vs 10% aspirin). Observed aspirin improvement was 48%", primary at 1 month, aspirin comparator, adjusted OR 1.10 (95% CI 0.07-18.39), p=0.95. No early-stop claim anywhere in the record (limitations say "Slow recruitment over 5 years 4 months", which is accurate).
- src/lib/citations/registry.ts 'preterre-theia-2025' quoted_text: verbatim-correct against the published abstract.
- src/lib/citations/claims.ts 'theia-crao-alteplase-2025' description: correct.
- src/seo/routeMeta.ts and src/seo/schema.ts: correct.
- grep for "178" across src/ returns no other THEIA-linked hit (the only other hit is RESCUE-Japan LIMIT/SELECT2-style EVT arm counts in TrialPageNew.tsx, unrelated).

THREE distinct defects in one paragraph, all fabrications or misstatements rather than rounding:
1. Fabricated trial-conduct claim ("stopped early for slow recruitment") plus fabricated hard number ("planned 178"). The trial completed and hit its calculated N of 70.
2. Wrong timepoint: 90 days instead of 1 month for the primary endpoint.
3. Wrong comparator: "placebo" instead of the active 300 mg oral aspirin arm (double-dummy).

CONCLUSION IMPACT: the headline verdict does NOT change. THEIA remains neutral, underpowered, and must not be cited as positive evidence. The corrected text preserves that. What changes is the mechanistic explanation, and this matters clinically: the repo currently implies "if only they had finished enrolling, we would know", when the truth is that the control-arm assumption was wrong by a factor of nearly five (48% vs 10% assumed). That reframes the open question from "recruit more patients to the same design" to "the natural history / aspirin-arm recovery rate in CRAO is far better than historical cohorts suggested, so any successor trial needs a much larger N and a revised control-rate assumption." The corrected paragraph now carries that reasoning. The downstream sentences in the same paragraph ("the trial cannot establish efficacy", "should not be cited as positive evidence") and the synthesis headline and bottomLine remain valid as written and need no edit.

HOUSE STYLE: no U+2014 em-dash introduced. This file uses the word "to" for CI and numeric ranges (for example "95% CI 0.52 to 2.35", "10 to 100 mL"), so I matched that convention rather than inserting an en-dash. No NNT introduced (correctly so: superiority was not met and the risk-difference CI spans zero).

INTERVAL TYPE: both reported intervals are two-sided 95% CIs under a two-sided alpha of 0.05 superiority framework. There is no non-inferiority margin in THEIA, so no margin sign/direction issue applies here.

RESIDUAL ITEM (non-blocking, not part of this correction set): the in-repo evidence packet docs/evidence-packets/theia-2026-05-20.md still carries a TODO-VERIFY for the accompanying Lancet Neurology Comment (page 894, DOI 10.1016/S1474-4422(25)00352-7), which was paywalled at authoring time. I re-attempted thelancet.com full text today (2026-07-27) and received HTTP 403. A post-publication expert commentary IS now retrievable in open form: the American Academy of Ophthalmology "Editors' Choice" piece "Early Thrombolysis for Acute Central Retinal Artery Occlusion: No Answers Yet", which independently confirms the trial was not stopped early, that recruitment took over 5 years and was stalled by COVID-19, and that underpowering arose because improvement exceeded predictions in both arms (66% vs expected 40% alteplase; 48% vs expected 10% aspirin). That satisfies §8a in substance for this correction, but the packet's TODO should be closed by the librarian.

## Primary endpoint is a mean utility-weighted modified Rankin Scale (UW-mRS) score at 180 days: a dimensionless utility on a 0 to 1 scale (mRS 0=1.0, 1=0.91, 2=0.76, 3=0.65, 4=0.33, 5 and 6=0.0). Between-group differences are in utility points. Intervals are 95% Bayesian credible intervals (CrI), not frequentist confidence intervals. Mortality is in percent.

**Confidence:** high

ENRICH (Pradilla G, Ratcliff JJ, Hall AJ, et al. "Trial of Early Minimally Invasive Removal of Intracerebral Hemorrhage." N Engl J Med. 2024 Apr 11;390(14):1277-1289. DOI 10.1056/NEJMoa2308440. PMID 38598795. NCT02880878).

DESIGN: Multicenter, Bayesian response-adaptive, open-label superiority RCT; 37 US centers; 300 patients randomized 1:1 to minimally invasive trans-sulcal parafascicular surgery (BrainPath + Myriad, NICO Corporation) within 24 hours of last known well plus guideline-based medical management, vs guideline-based medical management alone. Randomization was STRATIFIED BY HEMATOMA LOCATION (anterior basal ganglia vs lobar) and by GCS, with PRE-SPECIFIED PER-STRATUM FUTILITY STOPPING RULES. This is a stratum-level adaptive design, not an unplanned post-hoc subgroup split.

PRIMARY ENDPOINT (verbatim intent): mean score on the utility-weighted modified Rankin scale at 180 days, analyzed with a Bayesian model; pre-specified posterior-probability-of-superiority threshold 0.975.

PRIMARY RESULT (overall population): UW-mRS 0.458 (surgery) vs 0.374 (control); difference 0.084; 95% Bayesian credible interval 0.005 to 0.163; posterior probability of superiority 0.981 (threshold 0.975). No frequentist p-value was reported for the primary analysis.

ADAPTATION / FUTILITY: At the second pre-specified interim analysis (after 175 patients had been enrolled), the adaptation rule was triggered and NEW ENROLLMENT OF PATIENTS WITH ANTERIOR BASAL GANGLIA HEMORRHAGE WAS STOPPED FOR FUTILITY. All subsequent enrollment was restricted to lobar hemorrhage. Final composition: 92 anterior basal ganglia, 208 lobar.

STRATUM RESULTS: Lobar, 0.513 (surgery) vs 0.371 (control), difference +0.127, 95% Bayesian CrI 0.035 to 0.219 (benefit). Anterior basal ganglia, 0.340 (surgery) vs 0.381 (control), difference -0.013, 95% Bayesian CrI -0.147 to 0.116 (no benefit; point estimate numerically favors medical management; CrI crosses zero).

SAFETY: 30-day mortality 9.3% (surgery) vs 18.0% (control). Postoperative rebleeding with neurologic deterioration in 5 surgical patients (3.3%). Mean hematoma-volume reduction 73.2%, mean residual 14.9 mL; residual 15 mL or less achieved in 109 patients (72.7%).

EDITORIAL (packet section 8a): The accompanying NEJM editorial is Mendelow AD, "New Hope for Adults with LOBAR Intracerebral Hemorrhage," N Engl J Med 2024;390:1328-1329, DOI 10.1056/NEJMe2401643. Its title alone adjudicates the question. It states that enrollment of patients with anterior basal ganglia hemorrhage was halted after 175 patients because of the futility of surgery in that group, and that the benefit "was not evident for patients with anterior basal ganglia hemorrhages."

CONCLUSION: The correct bedside statement is that minimally invasive parafascicular surgery within 24 hours is supported for LOBAR ICH of 30 to 80 mL only. Anterior basal ganglia ICH is the population where ENRICH stopped for futility, and it must not be offered as an indication.

**Verifier notes:** AUDIT CONFIRMED, AND THE BLAST RADIUS IS WIDER THAN THE ONE LINE FLAGGED.

The finding is correct and is the most serious kind of defect this repo can ship: the ich-surgery bottomLine recommended minimally invasive parafascicular surgery for anterior basal-ganglia ICH, which is precisely the stratum ENRICH closed for futility at its second interim analysis. A resident reading only the bottomLine would take a null, futility-stopped population as an indication.

DOES THE CORRECTION CHANGE A CONCLUSION? YES, and it is flagged here as required. This is not a numeric touch-up. The ABG stratum estimate is -0.013 UW-mRS points with a 95% credible interval of -0.147 to 0.116: the point estimate numerically favors medical management and the interval crosses zero. The interpretive sentences that rested on the wrong framing (the synthesis headline, the body paragraph, the registry quoted_text, the SEO answer, and four trialData fields) all had to change, not just the numbers. Corrections 1 through 5, 7, and 9 through 12 are conclusion-level, not cosmetic.

DESIGN NOTE THAT THE REPO GOT BACKWARD. The synthesis said "the trial was not designed to test these as independent populations." The opposite is true: randomization was stratified by location (ABG vs lobar) and by GCS, and the Bayesian adaptive design carried pre-specified per-stratum futility rules. That is exactly why the ABG stratum could be closed mid-trial. Calling it an underpowered incidental subgroup (guideContent) or an undesigned split (synthesis, registry) both understate how deliberate and how negative the ABG result is.

INTERNAL CONTRADICTIONS FOUND IN trialData.ts. The ENRICH record is mostly excellent and repeatedly and correctly states the futility stop (rctChain.currentTrialResult, fullEligibility exclusion item, howToInterpret.doesNotProve, trialDesign.type, limitations, pearls). But four bedside-facing fields lead with an ABG indication and then contradict the record's own futility language one or two sentences later: howToInterpret.proves, howToReadChart Q3, bedsidePearl, and keyMessage. Corrections 9 to 12 remove the contradiction. TrialPageNew.tsx:2014 was left alone on purpose: it states the research QUESTION as asked, which legitimately included both locations, and line 2028 already carries the futility banner.

TWO ADDITIONAL VERIFIED DEFECTS BEYOND THE AUDIT'S SCOPE, both included as corrections because they are citation-integrity or statistics-validity issues:
1. registry.ts carries pmid '38598229' for pradilla-enrich-2024. I resolved that PMID and it is a JAMA Dermatology guselkumab trial for pityriasis rubra pilaris, entirely unrelated. The correct ENRICH PMID is 38598795, which trialData.ts already has right. A wrong PMID on the citation registry entry is a hard citation-trail break.
2. guideContent.ts publishes "difference 0.084, p=0.04" for ENRICH. No frequentist p-value exists for this trial's primary analysis; this number appears to be invented or back-calculated. The same guide page also attributes ENRICH to "Hanley DF, et al." (that is MISTIE III's first author) and displays NNT approximately 12 twice with no safety-endpoint or Bayesian-invalidity label, which the clinical-trial-audit skill treats as a blocking NNT-validity violation.

SECONDARY FINDINGS FLAGGED BUT NOT CORRECTED (they need a medical-scientist judgment call, not an evidence correction):
- trialData.ts exclusionCriteria says "Deep ICH (thalamic/putaminal...)" and pearls say "NOT applicable to: deep (thalamic/putaminal) ICH". The published protocol excluded only primary thalamic and infratentorial hemorrhage; the putamen was explicitly INSIDE the anterior basal ganglia inclusion definition (caudate, putamen, pallidum to the capsula externa). So the trial-exclusion description is inaccurate even though the resulting clinical advice (do not operate on putaminal ICH) is now directionally right because of the futility stop. Recommend rewording to "thalamic and infratentorial ICH were excluded by protocol; anterior basal ganglia ICH including the putamen was enrolled and then stopped for futility."
- clinicalSynthesesByQuestion.ts line 108 states the ENRICH result "has not yet been formally incorporated into an updated AHA/ASA recommendation." That remains true for AHA/ASA (2022 ICH guideline, minimally invasive surgery COR 2b, pre-dates ENRICH). However secondary sources indicate ESO 2025 guidance now references minimally invasive surgery for selected supratentorial, especially lobar, hematomas using ENRICH criteria. I could not retrieve the ESO document text directly, so I did not write a guideline claim. Recommend a follow-up evidence-verifier pass to pull the ESO 2025 wording and class before anyone adds it.

HOUSE STYLE COMPLIANCE. No U+2014 em-dash was introduced in any newText. Existing U+2013 en-dashes in numeric ranges (30–80 mL, 0.035–0.219, 1277–1289) were preserved verbatim where the surrounding text already used them; the clinicalSynthesesByQuestion.ts and registry.ts prose uses spelled-out "to" for intervals and plain hyphen-minus for negative numbers, and the corrections match that local convention exactly. No new NNT was introduced anywhere; the two existing guideContent NNT mentions were labelled, not added.

EVIDENCE CONFIDENCE. High. NEJM full text is paywalled, but the numbers were corroborated across four independent sources that agree exactly: the PubMed record metadata for PMID 38598795, published abstract text (0.458 vs 0.374, difference 0.084, 95% Bayesian CrI 0.005 to 0.163, posterior probability 0.981; lobar +0.127, 95% CrI 0.035 to 0.219; ABG -0.013, 95% CrI -0.147 to 0.116; 30-day mortality 9.3% vs 18.0%), an independent trial appraisal giving the per-stratum means (lobar 0.513 vs 0.371; ABG 0.340 vs 0.381) and confirming the 175-patient futility adaptation, and the accompanying NEJM editorial by Mendelow, whose title is literally "New Hope for Adults with LOBAR Intracerebral Hemorrhage" and which states the benefit "was not evident for patients with anterior basal ganglia hemorrhages." The repo's own fullEligibility field already quotes the adaptation rule verbatim from the publication, so the correct fact was on disk the whole time; it just never propagated to the recommendation surfaces.

PROCESS REMINDER. This is a clinical-logic change (Class E territory: it changes who gets offered surgery). Per repo governance these corrections are a proposal only. They require a plan presented to V, V's explicit approval in session, and a clinical-reviewer artifact before any file is touched. I have not edited any source file.

