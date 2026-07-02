# WAVE 1 REMEDIATION REPORT - NeuroWiki High-Severity Audit Fixes
**Date:** 2026-07-01

## 1. Summary counts

| Category | Count |
|---|---|
| Fixed (edit applied) | 18 |
| Needs-decision (escalated to V) | 8 |
| False-positive (does not reproduce) | 4 |
| Reviewer-flagged (wrong/incomplete) | 3 |

Of the 18 fixes, the clinical-reviewer verdict was **confirmed** on 15 and **incomplete** on 2 (both in `strokeClinicalPearls.ts`). One additional file-scope path-resolution block sits in needs-decision. The 3 reviewer-flagged items below (2 incomplete fixes + 1 unremediated finding the reviewer surfaced) must be re-checked before any commit.

---

## 2. Fixed (grouped by file)

### src/data/trialData.ts

| # | Locus | Old to new | Verdict |
|---|---|---|---|
| 1 | ninds-trial (efficacy, chart, legend, stats, calculations) | mRS 0-1 42.6% vs 27.2% to **39% vs 26%**; ARD 15.4pp to 13pp; NNT 6.5 to 7.7; +15/100 to +13/100. Global OR 1.7 retained as four-scale composite | **confirmed** - all dependent surfaces consistent; no orphaned 42.6/27.2 values; sICH/mortality untouched |
| 2 | devt-trial (howToReadChart Q1/Q2, legend.keyStat) | NI decision now uses one-sided 97.5% CI lower bound **-5.1 pp** (was two-sided 95% -2.9); two-sided 95% CI relabeled descriptive | **confirmed** - matches PMC7816099; CI-method distinction preserved |
| 3 | devt-trial (howToReadChart Q3) | sICH 4.3/3.4 and mortality 14.7/18.8 to **sICH 6.1% vs 6.8%, mortality 17.2% vs 17.8%** | **confirmed** - matches PMC7816099; inverted mortality direction corrected |
| 4 | optimal-bp-trial (Q3 answer + howToInterpret.proves) | Cerebral-edema 95% CI 1.05-59.0 to **1.57-39.39** (both occurrences); OR 7.88 and P=0.01 unchanged | **confirmed** - matches PMC10481233 |
| 5 | enchanted-trial (stats.effectSize) | `OR 0.75 / Less Any ICH` to **`cOR 1.01 / Primary mRS Shift (Null)`** | **confirmed** - primary null now in the primary slot; secondary ICH stays labeled secondary |
| 6 | elan-study (legend finding/tag/keyStat) | `non-inferior / NI met` to **`RD -1.18 pp (95% CI -2.84 to +0.47) / Early start safe`** | **confirmed** - no NI language remains; matches estimation-trial design (Fischer NEJM 2023) |
| 7 | enrich-trial (legend.bottomLineTag) | `NNT 12` to **`P(sup)=0.981`** | **confirmed** - Bayesian primary now surfaced; safety-endpoint NNT stays in prose with disclaimer |
| 8 | prisms-trial (Q answer, proves, bottomLineSummary) | Adjusted RD 95% CI -5.6/+3.4% to **-9.4/+7.3%** (all three; CI newly added to summary) | **confirmed** - matches PMC6583516; overstated precision resolved |
| 9 | raise-trial (applicability.populationExclusions[1]) | sICH `3.1% vs 2.0%` to **`2.4% vs 2.0%, RR 1.21, NS`**; adds any-ICH 7.7% vs 4.9% signal | **confirmed** - matches Li NEJM 2024; now internally consistent across RAISE surfaces |
| 10 | annexa-4-trial (trialResult) | `POSITIVE` to **`SAFETY_MET`** | **confirmed** - legal enum value; matches WEAVE single-arm-registry precedent; bedside andexanet guidance intact |

### src/lib/citations/claims.ts

| # | Locus | Old to new | Verdict |
|---|---|---|---|
| 11 | claims.ts:939 - `mrs-prestroke-evt-eligibility` | mRS 2 = `borderline/relative contraindication` to **mRS 2 = guideline-permissive, COR 2a/LOE B-NR "can reasonably be considered"**; mRS 3-4 = COR 2b; DAWN/DEFUSE-3/SELECT-2 demoted to study-population fact | **confirmed** - removes patient-safety recommendation-strength inversion; matches aha2026StrokeGuideline.ts:475-489. Follow-up: parallel JSX MrsCalculator.tsx:383 already fixed (see false-positives) |

### src/data/strokeClinicalPearls.ts

| # | Locus | Old to new | Verdict |
|---|---|---|---|
| 12 | ist3-trial (254-263) | `1,617 pts >80y, 37% vs 35%` to **`1,617 (53%) of 3,035 >80y; overall 37% vs 35% (OHS 0-2; adj OR 1.13, 95% CI 0.95-1.35, P=0.18)`** | **confirmed** - separates subgroup from overall primary outcome; names OHS scale; matches IST-3 Lancet 2012 |
| 13 | sich-definition (1092-1101) | Removes fabricated `within 24h` window + `any ICH requiring surgical intervention` criterion; restores 7-day window + `predominant cause of neurological deterioration` clause | **INCOMPLETE** (see §4) - this edit correct, but same fabricated definition survives verbatim at ct-protocol-deep (line 970) |
| 14 | hemorrhage-reversal-protocol STEP 3 + evidence (1122-1131) | `Do not give TXA routinely (TICH-2)` to **give TXA 1000 mg IV / aminocaproic acid 4-5 g IV + cryoprecipitate for post-IVT sICH (COR 1, LOE C-EO, AHA/ASA 2026)**; TICH-2 confined to spontaneous ICH | **INCOMPLETE** (see §4) - core fix correct, but tich2-trial pearl (line 1135) still says `Not recommended for tPA-related ICH`, contradicting the fix |

### src/pages/guide/Meningitis.tsx

| # | Locus | Old to new | Verdict |
|---|---|---|---|
| 15 | Meningitis.tsx:64 (visible) + :62 (detail prop) | CT-before-LP `GCS <10` (ESCMID) to **`altered level of consciousness (GCS <15)`** (IDSA 2004) | **confirmed** - corrects under-triage of GCS 10-14; both surfaces updated in lockstep; no residual `<10`. Merge prerequisite: citation + claimId + review artifact still required (Class E) |

### src/pages/guide/IchManagement.tsx

| # | Locus | Old to new | Verdict |
|---|---|---|---|
| 16 | IchManagement.tsx:74 (+ detail prop :72) | SBP `<140 within 1h (Class I, Level A)` to **`SBP 140, goal 130-150, may be reasonable (Class IIb, Level B-R)`**; harm floor `<110` to **`<130 (Class III)`**; adds "INTERACT-2/ATACH-2 did not meet primary endpoints" | **confirmed** - corrects materially overstated grade per 2022 AHA/ASA ICH guideline; bedside reversal guidance untouched. Non-blocking: SKILL.md carries same error, register ICH-BP citation |

### src/pages/guide/Thrombectomy.tsx

| # | Locus | Old to new | Verdict |
|---|---|---|---|
| 17 | Thrombectomy.tsx:62 (Early Window 0-6h) | Early-window `ASPECTS ≥6 (small core)` to **`ASPECTS 3-10 (COR 1, LOE A; with NIHSS ≥6, prestroke mRS 0-1)`**; SELECT2/ANGEL-ASPECT reframed as in-recommendation large-core benefit | **confirmed** - corrects wrong early-window threshold per aha2026StrokeGuideline.ts:417-431. Merge prerequisite: untagged claim surface must be tagged + citation registered (Class E) |

*(Item 11 is the single claims.ts fix; items 12-14 are the three strokeClinicalPearls.ts fixes; the count of 18 reflects 10 trialData + 1 claims + 3 pearls + Meningitis + IchManagement + Thrombectomy + the MrsCalculator.tsx already-correct state is counted as a false-positive, not a fix.)*

---

## 3. Needs-decision - precise question for V

1. **swift-prime-trial ordinalStats / legend.keyStat** (trialData.ts) - Repo value commonOR **2.75 (1.53-4.95) is confirmed wrong** (matches no published source), but the proposed replacement **2.63 (1.57-4.40)** lives only in paywalled NEJM full text and could not be independently verified (an open-source "cOR 2.6, 1.7-3.8" was a conflation with ESCAPE). **Q:** Confirm the SWIFT PRIME primary mRS-shift common OR + 95% CI from Saver NEJM 2015 (PMID 25882376, DOI 10.1056/NEJMoa1415061) full text, or confirm that 2.63 (1.57-4.40) is correct. pValue stays <0.001. *Reviewer note: repo is knowingly-wrong at lines 2445-2454 and must not merge until V confirms.*

2. **basilar-evt-guideline-summary description** (claims.ts:296) - Sources genuinely disagree. **Q(a):** Is basilar-artery EVT a **single COR 1** across the whole 0-24h window (per published-guideline secondary summaries), or a **COR 1 (<6h) / COR 2a (6-24h) split** (as the repo's own aha2026StrokeGuideline.ts posteriorCirculation encodes)? **Q(b):** Is the LOE **A or B-R** (BAOCHE/ATTENTION are two RCTs, favoring B-R; but registry.ts:604 and this claim currently say Level A)? Once confirmed, reconcile claims.ts:296, registry.ts:604 quoted_text, aha2026StrokeGuideline.ts posteriorCirculation, and the basilar pearls to one value (Class E, multi-file).

3. **aspects-evt-eligibility-2026 description** (claims.ts:201-218) - The description at :217 frames the ASPECTS 3-5 stratum only as `(COR 1, LOE A, 6-24h)`, omitting the 0-6h ASPECTS 3-10 COR 1/LOE A coverage. The finding gates the correction behind clinical authoring. **Q:** Approve authoring the two-tier ASPECTS 3-5 EVT interpretation (0-6h ASPECTS 3-10 COR 1/LOE A ungated on age/mass-effect; 6-24h ASPECTS 3-5 COR 1/LOE A with age<80 / NIHSS≥6 / prestroke mRS 0-1 / no-significant-mass-effect gates) across **both** AspectScoreCalculator.tsx evtText and claims.ts:217, routed through medical-scientist + clinical-reviewer (Class E)?

4. **Path-resolution block - StrokeBasicsWorkflowV2.tsx** - The assigned file `src/components/article/stroke/StrokeBasicsWorkflowV2.tsx` **does not exist**; all findings target the real file `src/pages/guide/StrokeBasicsWorkflowV2.tsx`. **Q:** Re-scope to edit `src/pages/guide/StrokeBasicsWorkflowV2.tsx`, or was the assigned path a typo for a different intended file? No edit will be made outside the assigned path without explicit approval. *(This block gates items 5-7 below.)*

5. **HERMES NNT (StrokeBasicsWorkflowV2.tsx:L612, high)** - `46% vs 29% functional independence (NNT 2.6)` pairs an ordinal ≥1-level mRS-shift NNT with a binary-independence claim (verified against Goyal Lancet 2016). **Q:** If re-scoped, separate the metrics: functional independence 46% vs 26.5% (mRS 0-2, NNT ~5) and present NNT 2.6 as the ordinal shift (cOR 2.49, 95% CI 1.76-3.53); register a claim ID.

6. **HERMES control rate (StrokeBasicsWorkflowV2.tsx:L612, medium)** - Control mRS 0-2 written as `29%`; published HERMES control is **26.5%** (thrombectomy 46.0%, ARD 19.5pp). Coupled to the NNT fix on the same line. **Q:** If re-scoped, change 29% to 26.5% as part of the coupled correction. (Rejected the finder's alternate 31.8% - that is the DEFUSE-3 rate at L615.)

7. **WAKE-UP threshold label (StrokeBasicsWorkflowV2.tsx:L523, low)** - `53.3% vs 41.8% favorable outcomes` numbers are correct but omit the mRS 0-1 threshold. **Q:** If re-scoped, add the threshold word (`mRS 0-1`); otherwise leave to the owner of the real file.

8. **(Freshness / cross-file, embedded in several fixes)** - Multiple confirmed fixes (optimal-bp, prisms, meningitis, ich-management, thrombectomy) carry a **cross-file remainder**: register/refresh the relevant citation `last_reviewed` per §13.6 and add claim tagging in `src/lib/citations/` before these Class E changes can merge. **Q:** Confirm these governance steps (citation registration + claimId tagging + `docs/reviews/` artifacts + clinical-reviewer gate) are authorized as the follow-on Class E merge cycle.

---

## 4. Reviewer-flagged (wrong/incomplete) - re-check before commit

1. **sich-definition fix is INCOMPLETE (strokeClinicalPearls.ts)** - The edit at line 1095 is correct, but the **same fabricated ECASS-3 definition is duplicated verbatim** in the `ct-protocol-deep` pearl at **line 970**: `"ECASS-3 definition of sICH: Any ICH + NIHSS ↑≥4 points, OR any ICH + death, OR ICH requiring surgical intervention."` This still contains the fabricated `requiring surgical intervention` criterion, still omits the 7-day window, and still omits the `predominant cause` clause. **The file now carries two contradictory sICH definitions.** Fix line 970 to match line 1095 before commit.

2. **hemorrhage-reversal-protocol fix is INCOMPLETE (strokeClinicalPearls.ts)** - STEP 3 is correctly fixed, but the `tich2-trial` pearl at **line 1135** (which this finding's own locus cross-references) still ends `"Not recommended for tPA-related ICH as routine therapy."` - now **directly contradicting** the corrected STEP 3, the quick pearl (line 1085), and the 2026 COR 1 recommendation. Correct the tich2-trial `tPA-related ICH` clause to close the finding before commit.

3. **Unremediated confirmed finding on same file - NOT in the fixer's set (strokeClinicalPearls.ts:200-208, `contraindications-relative`)** - Reviewer scope-gap flag: this file carries **another confirmed high/medium audit finding** (audit-findings.json:856-864) - the fabricated clause `"Severe stroke NIHSS >25 (greatest benefit, NNT=3)"` at **line 202**, whose cited source (Fugate & Rabinstein 2015, PMC4530420) reports no such NNT. It is still present verbatim and was **not** among the three reported edits. Do not assume this file's high-severity findings are fully remediated. Recommend a follow-up Class E fix: remove the false-precision `NNT=3`, keep the qualitative point.

---

## 5. False-positives on re-check (nothing to fix in the assigned file)

1. **claims.ts:639/647 - `nihss-severity-interpretation-2026` (16-20 band)** - The audit flagged an `ASPECTS ≥6 for standard early-window selection` error, but that clause lives only in the rendered JSX at `NihssCalculator.tsx:684`, **not** in the registry description. claims.ts:647 says only "typical proximal LVO range; expedite EVT pathway per §4.7.2; post-IVT BP ≤180/105." Nothing to fix in claims.ts. Real fix is cross-file in NihssCalculator.tsx (Class E). *Verdict: not-applicable, agreed.*

2. **NihssCalculator.tsx:684 (audit line 469)** - The erroneous text does **not reproduce**. Line 684 already reads `"...ASPECTS 3-10 for standard 0-6 h selection (ASPECTS ≥6 applies to the 6-24 h window)"` - correct per aha2026StrokeGuideline.ts. Already remediated by a prior correction (clinical-PR-aspects-cor-2a-correction-2026-05-22.md). *Verdict: not-applicable, agreed.*

3. **NihssCalculator.tsx:684 (audit line 620)** - Duplicate of the line-469 finding, same locus and fix. Current file already correct (corroborated by the ≥21 band at line 687). *Verdict: not-applicable, agreed.*

4. **MrsCalculator.tsx:383 (grade===2 branch)** - Does **not reproduce**. The branch contains no `relative contraindication`/`borderline` language; it already reads `"EVT can reasonably be considered (COR 2a)... Prestroke mRS 2 is not a contraindication (COR 2a, Level B-NR)..."`, matching aha2026StrokeGuideline.ts:474-481 exactly. Audit was written against a superseded revision. *Verdict: not-applicable, confirmed. Cross-file note: the parallel claims.ts:939 was the actual stale surface - and that one WAS fixed (item 11 above).*

---

**Files touched (absolute paths):**
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/trialData.ts` (10 fixes; swift-prime blocked)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/lib/citations/claims.ts` (1 fix; 2 needs-decision; 1 false-positive)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/data/strokeClinicalPearls.ts` (3 fixes - 2 flagged incomplete; 1 unremediated finding)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/guide/Meningitis.tsx` (1 fix)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/guide/IchManagement.tsx` (1 fix)
- `/Users/vaibhav/Documents/NeuroWiki/Cursor/Neurowiki/neurowiki/src/pages/guide/Thrombectomy.tsx` (1 fix)

**Commit-blocking items:** the 2 incomplete `strokeClinicalPearls.ts` fixes (§4.1, §4.2) leave live internal contradictions and one unremediated fabricated claim (§4.3) in the same file - resolve all three before staging `strokeClinicalPearls.ts`. The swift-prime trialData.ts entry is in a knowingly-wrong state and must not merge until V confirms the value (§3.1). All Class E fixes still require the §13.6 citation/artifact governance cycle before merge.