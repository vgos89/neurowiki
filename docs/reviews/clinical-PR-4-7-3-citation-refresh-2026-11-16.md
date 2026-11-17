# Clinical review — PR #4-7-3-citation-refresh

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-5-5)
**Date:** 2026-11-16

## Scope
- Claims touched (dependents re-verified; no claim text changed): `posterior-circulation-evt-quick-claim`, `baoche-posterior-evt`, `attention-posterior-evt`, `basilar-evt-guideline-summary`
- Citations affected: `aha-asa-2026-4.7.3`, `aha-asa-2026-4.7.3-nihss-6-9`
- Surfaces changed: none rendered. Citation-registry metadata only (`last_reviewed` 2026-07-30 → 2026-11-16 on both records, one comma removed from the `quoted_text` of `aha-asa-2026-4.7.3-nihss-6-9`, §13.6 comment entries added). Tagged surfaces re-read: structured data in `src/data/strokeClinicalPearls.ts` (lines 380, 578, 606), the BAOCHE bedsidePearl in `src/data/trialData.ts:8230-8231`, and `src/data/guidelineSummariesByQuestion.ts:41`, which renders the citation `quoted_text`.
- Evidence-verifier packet: not applicable (no trial data or statistics change). Supporting document: `docs/evidence-packets/2026-11-16-ais-2026-guideline-correction-summary.md`.
- Trial-statistician report: not applicable.

## Semantic validity
**Record 1 (`aha-asa-2026-4.7.3`).** The `quoted_text` body is character-identical to Rec 1 on page e56 of the held PDF (reading-order extract). The COR cell reads 1 and the LOE cell reads A, matching the "(COR 1, LOE A.)" annotation. Confirmed.

**Record 2 (`aha-asa-2026-4.7.3-nihss-6-9`).** After the comma removal, the `quoted_text` body is character-identical to Rec 2 on page e57. The page has no comma after "(mild ischemic damage)", so the removal is correct and changes no meaning. The COR cell reads 2b and the LOE cell reads B-R, matching the annotation. Confirmed.

**Step 3: dependent surfaces, checked against both strata on every never-drift point.**
- `posterior-circulation-evt-quick-claim` (strokeClinicalPearls.ts:380-382) states basilar AO, baseline mRS 0–1, NIHSS ≥10, PC-ASPECTS ≥6, "within 24h of onset", Class 1 / LOE A. It says there is one 24 h window and labels 12 h and 6–24 h as trial enrolment windows. Consistent. The title "EVT 0–24h, Class I" leaves out the gates, but the body carries all of them. This is not drift.
- `baoche-posterior-evt` content (strokeClinicalPearls.ts:580) states Rec 1 with all four gates, COR 1 / LOE A, within 24 h from symptom onset. It states NIHSS 6–9 as Class 2b / LOE B-R, "not well established", and marks BAOCHE's NIHSS ≥6 entry as broader than Class 1. Consistent.
- `baoche-posterior-evt` bedsidePearl (trialData.ts:8231) says "is recommended (COR 1, LOE A)" for mRS 0–1 / NIHSS ≥10 / PC-ASPECTS ≥6 within 24 h from symptom onset, and "COR 2b, LOE B-R (not well established)" for NIHSS 6–9. The earlier "is reasonable … COR 1" mismatch is gone. Consistent.
- `attention-posterior-evt` (strokeClinicalPearls.ts:608, 620) states Rec 1 with all four gates, Class 1 / LOE A, within 24 h of onset, "single 24h window measured from symptom onset". Consistent. Two notes that are not drift: clinicalTip :622 ("the recommendation does not extend to milder basilar syndromes") is true of the Class 1 recommendation but does not mention the 2b stratum. Tip :626 assigns ATTENTION to ≤12 h decisions and BAOCHE to 6–24 h decisions, but immediately says one Class 1 recommendation covers both.
- `basilar-evt-guideline-summary` (guidelineSummariesByQuestion.ts:41) maps only to these two citations and renders their `quoted_text`. Consistent by construction.

No dependent changes the action verb ("is recommended" vs "is not well established"), the grade for either NIHSS stratum, the basilar occlusion criterion, the mRS 0–1 gate, the PC-ASPECTS ≥6 threshold, or the 24 h-from-onset window. Step 3 is complete for the four mapped claims.

**Out-of-scope items raised by the author. All are confirmed, and none makes a mapped claim inconsistent with these citations.**
1. **strokeClinicalPearls.ts:580 "2:1 randomization" for BAOCHE: confirmed wrong.** The trial record (trialData.ts:8266) says "1:1 allocation (Thrombectomy vs. Medical)", and the arms are 110 vs 107 (trialData.ts:8208). 2:1 is ATTENTION's ratio (trialData.ts:8132). This is a trial-fact error that cites the trial, not the guideline. Separate task (C-clinical).
2. **"NNH ≈ 20" for BAOCHE sICH (strokeClinicalPearls.ts:580, 596, 600): confirmed as a statistics-display problem.** The trial record calls the difference "Trending higher but not statistically significant" (6/102 vs 1/88, RR 5.18, 95% CI 0.64–42.18; trialData.ts:8201) and "NS but wide CI" (trialData.ts:8228). Giving an NNH for a non-significant difference overstates certainty about the trial. It does not touch the guideline grade. Separate task for trial statistics review.
3. **strokeClinicalPearls.ts:587 plainEnglish "NIHSS ≥6 at entry … EVT works", without the mRS 0–1 gate: confirmed as weak wording, not drift.** The sentence describes the trial's overall result, which the guideline's own supporting text confirms ("EVT showed favorable outcomes that reached statistical significance"). It also says in a parenthesis that the recommendation is written at NIHSS ≥10. BAOCHE required mRS ≤1 at entry, so leaving it out does not misdescribe the trial. However, the plain-English field never states that benefit at NIHSS 6–9 is "not well established", and a reader may treat it as a treatment instruction. It should be reworded to name the 2b stratum and the mRS 0–1 gate. Separate C-clinical task.
4. **Untagged surfaces: confirmed untagged; wording checked.** `src/pages/guide/Thrombectomy.tsx:80` and `src/data/guideContent.ts:876` state both strata with the correct grades and all gates. `src/seo/routeMeta.ts:69` states the Class 1 gates and window correctly but leaves out the 2b stratum (snippet space, not drift). The trial narratives in `guideContent.ts:245-290` make no guideline-grade claim. Because these surfaces carry no claim tag, neither the hook nor this attestation covers them. This is the existing hook-coverage-gap item, not a block.

## Citation accuracy
- **Version.** Both records point to the 2026 AHA/ASA AIS guideline, which is the current edition per CLAUDE.md §13.9. The held PDF is the **first proof** (Stroke 2026;57:e00–e00, downloaded 2026-03-17). The final citation, Stroke 2026;57(8):e316–e436 (DOI 10.1161/STR.0000000000000513), is not held.
- **Section.** §4.7.3 "Recommendations for Posterior Circulation Stroke": Rec 1 on e56, Rec 2 on e57 (continued table). Correct.
- **Quotes.** Both are verbatim against the first proof (see Semantic validity).
- **Published correction** (Stroke 2026;57(8):e461–e467, DOI 10.1161/STR.0000000000000530, online 2026-07-27). The finding that "no item touches §4.7.3" rests on one reading of the publisher page **by the orchestrator, not by a clinical agent**. Medical-scientist got HTTP 403, and this reviewer cannot fetch. I weighed this as follows:
  - The summary lists all 34 items by section, and each section is plausible for its item number.
  - Its no-touch finding fits the record's history: the earlier mismatch was fixed on 2026-07-30 from the same first-proof cells, and no recommendation was renumbered.
  - Seven other sections are flagged as changed, which suggests the summary was not written to clear everything.

  I accept this as enough to refresh. It is still single-reader, non-clinical evidence that no clinical agent can check today. The residual risk is low but real, and it is recorded here.
- **Comment entries (verify item 3).** They accurately record:
  - the re-read off the held PDF, not the in-repo mirror
  - the COR/LOE cells
  - the first-proof status
  - that the 2026-07-30 review predated awareness of the correction
  - the comma removal
  - the four dependents and the newer-evidence search

  One gap: the comments say the correction "was read in full (34 items) on 2026-11-16" but **do not say who read it** or that the clinical agent could not open it. The audit trail overstates the provenance of that check. Condition 1 fixes this.
- **Not verifiable from the repo.** The newer-evidence statements in step 5 (ATTENTION LATE design and enrolment, no ESO 2026 revision, no AHA focused update) cannot be checked from repo files. They do not change the recommendation either way, and they are accepted as medical-scientist's attestation.

## Editorial / expert context (REQUIRED for new-trial-entry PRs)
not applicable — no new trial entry in this PR.

## Freshness
- `aha-asa-2026-4.7.3`: `last_reviewed` 2026-11-16, `review_window_months` 3 (thrombectomy indications are a fast-moving area, §13.7). Next due **2027-02-16**. Pass, with the condition and follow-ups below.
- `aha-asa-2026-4.7.3-nihss-6-9`: `last_reviewed` 2026-11-16, `review_window_months` 3. Next due **2027-02-16**. Pass, with the same condition and follow-ups.
- Mandatory-block check:
  - #1 (drift), #2 (conflict smoothing) and #4 (quote does not support claim): none found.
  - #3 (unresolvable source): no, the held PDF resolves both quotes.
  - #5 (artifact): satisfied by this document.
  - #6 (§13.6 six steps): documented in both comment blocks; step 6 is satisfied by this artifact.
  - #7 and #8: not applicable.

## Rationale
The refresh does what it claims. Both quotes are verbatim to the held source, the grade annotations match the COR/LOE cells read in page order, and the one text change (a stray comma) matches the page and changes no meaning. All five tagged dependent surfaces keep the grade for each NIHSS stratum, the basilar, mRS 0–1 and PC-ASPECTS ≥6 gates, the single 24 h-from-onset window, and the "is recommended" / "not well established" distinction. Two weaknesses lower confidence without blocking. First, the source is a first proof. Second, the check that the published correction leaves §4.7.3 alone rests on a reading by a non-clinical agent that no clinical agent can repeat right now. The correction summary is itemized, internally consistent, and flags seven other sections as changed, so I accept it. That limit must be recorded honestly in the record (condition 1), and it must be closed by re-checking against the final text (follow-up 1). The author's out-of-scope findings are real, and two of them are actual errors. They describe the trial, not the guideline grade, and none of them contradicts these two citations. They go to separate tasks, not this gate.

## Required follow-ups
- **Condition 1 (before commit; editorial).** In both registry comment entries, item 2, state who read the correction and how. Suggested wording: "read in full (34 items) on 2026-11-16 by the orchestrator from the publisher's free-access page; medical-scientist could not open it (HTTP 403) and clinical-reviewer cannot fetch, so this finding is single-reader and not yet independently checked by a clinical agent." No date, grade or `quoted_text` change.
- **Follow-up 1 (by 2027-02-16 or as soon as the final PDF is held, whichever comes first).** Once the final corrected guideline PDF (e316–e436, with corrections applied) replaces the first proof in the CLAUDE.md §13.9 register, medical-scientist re-checks both `quoted_text` bodies and both COR/LOE cells against it. If that is not possible by the next refresh, medical-scientist independently confirms the correction notice's item list before the next `last_reviewed` refresh. A second refresh may not rest on the orchestrator-only reading. (TASKS.md entry.)
- **Follow-up 2 (C-clinical, trial fact).** strokeClinicalPearls.ts:580: change BAOCHE "2:1 randomization" to 1:1 to match the trial record.
- **Follow-up 3 (statistics review).** strokeClinicalPearls.ts:580, 596, 600: remove or caveat "NNH ≈ 20" for BAOCHE sICH. The difference is not statistically significant (RR 5.18, 95% CI 0.64–42.18).
- **Follow-up 4 (C-clinical, wording).** strokeClinicalPearls.ts:587 plainEnglish: name the baseline mRS 0–1 gate and say benefit at NIHSS 6–9 is not well established (COR 2b). Optional at the same time: have ATTENTION clinicalTip :622 mention the 2b stratum.
- **Follow-up 5 (existing hook-coverage gap).** Tag the untagged basilar surfaces (`src/pages/guide/Thrombectomy.tsx:80`, `src/data/guideContent.ts:876`, and `src/seo/routeMeta.ts:69` if snippet surfaces come into scope) so they fall under the hook and future §13.6 refreshes. Their wording is consistent today.


---

## Orchestrator disposition (2026-11-16, pre-commit)

- **Condition 1: done.** Both registry comment entries now carry a "PROVENANCE OF THAT READING" note stating that the correction notice was read by the orchestrator from the publisher's free-access page, that medical-scientist received HTTP 403 and clinical-reviewer cannot fetch, that the finding is single-reader, and that a second refresh may not rest on it. No date, grade, or `quoted_text` changed by this edit.
- **Follow-up 1** (re-check against the final corrected PDF by 2027-02-16 or when held) and **follow-ups 2-5** are open entries in TASKS.md.

