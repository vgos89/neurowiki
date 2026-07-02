# WAVES 2-3 REMEDIATION REPORT - NeuroWiki Medium/Low Audit
**Date:** 2026-07-01
**Scope:** Medium/low-severity findings from the external audit, executed as file-scoped single-value edits. High-severity and cross-file structural findings deferred per class rules.

---

## 1. Summary Counts

| Category | Count |
|---|---|
| **Fixed** (applied, single-file value edits) | 32 |
| **Needs-decision** (escalated to V) | 8 |
| **Structural-skipped** (become separate data-architect / architect tasks) | 15 |
| **Already-fixed** (false-positive; confirmed correct in live file, no edit) | 6 |
| **Reviewer-flagged** (wrong or incomplete; orchestrator re-check required before commit) | 4 |

Reviewer-flagged breakdown: 2 marked `wrong` (block), 2 marked `incomplete`.

---

## 2. Fixed (grouped by file, old to new + clinical-reviewer verdict)

### src/data/trialData.ts
- **extend-ia / effectSize.label** (~2094): `mRS 0-2 Benefit` to `Secondary: mRS 0-2 benefit`. **Verdict: confirmed** (+31% is the secondary 90-day outcome; aligns with howToReadChart/howToInterpret).
- **eagle / effectSize.label** (~1360): `No Benefit` to `Secondary: visual improvement rate, no benefit`. **Verdict: confirmed** (-2.9% is secondary dichotomized; both endpoints negative).
- **extend / pValue.label** (~1091): `Statistically Sig.` to `Adjusted only (unadjusted P=0.35)`. **Verdict: confirmed** (surfaces adjustment-dependence at headline).
- **rescue-bt / ordinalStats.direction** (4326): `positive` to `neutral`. **Verdict: confirmed** (null trial; direction now matches result).
- **rescue-bt / ordinalStats CI+pValue + 4 prose mirrors** (4326/4334/4343/4349/4372): `0.87-1.34, P 0.51` to `0.86-1.36, P 0.50`. **Verdict: confirmed** (matches PMC9364124; all five mirrors consistent, ASCII hyphen).
- **best-ii / primaryResult** (4528): `'futility-stopped'` to omitted (schema-contract comment). **Verdict: confirmed** (estimation-strategy leaves field unset; no futility boundary crossed).
- **charm / inclusionCriteria[0]** (~5049): `Age 18-80` to `Age 18-85 years (primary efficacy analysis restricted to 18-70)`. **Verdict: confirmed** (matches fullEligibility + Sheth Lancet Neurol 2024).
- **timing / effectSize.label, legend.keyStat, proves** (5968/6116/6092): ARD `-1.79%` (no CI) to `-1.79% (95% CI -5.31 to +1.74)` with NI-margin framing. **Verdict: confirmed** (Oldgren Circulation 2022 PMID 36065821; satisfies ARD-requires-CI).
- **attention / inclusionCriteria[4]** (~8009): `pre-stroke mRS ≤2` to `pre-stroke mRS ≤2 (<80y) or mRS 0 only (≥80y)`. **Verdict: confirmed** (internal consistency; in-repo only).
- **inspires / trialDesign.timeline** (~10409): `published NEJM 2024` to `published NEJM December 2023`. **Verdict: confirmed** (PMID 38157499 = 2023-12-28).
- **nor-test-2-part-a / proves + cautions** (13479/13481): `95% CI 0.25-0.82` to `0.25-0.80`. **Verdict: confirmed** (PMID 35525250).
- **timeless / bedsidePearl** (~14490): `TRACE-III:` to `TRACE-III (Xiong et al., Lancet 2024):`. **Verdict: confirmed** (attribution fix, no numeric change).
- **rescue-japan-limit / NNT across 6 surfaces**: bare `NNT 5` to `NNT 5-6`. **Verdict: confirmed** (18.3 pp ARD -> 5.46; matches calculations.nnt=5.5).
- **ims-iii / pearls[1] CI** (~14840): `95% CI 0.85-1.30` to `0.83-1.30`. **Verdict: confirmed** (internal consistency; external bound flagged for evidence-verifier follow-up - documented, not silent).
- **reduce / nntExplanation** (~17326): `~4 percentage points` to KM `~3.6 pp; 1/0.036 ≈ 28`. **Verdict: confirmed** (NNT 28 value unchanged; corrects arithmetic error).
- **mr-rescue / trialDesign.type[0]** (~15082): `9 US centers` to `22 North American centers`. **Verdict: confirmed** (Kidwell NEJM 2013; count + geography corrected).

### src/lib/citations/claims.ts
- **mrs-outcome-context / description** (946): removed NINDS from mRS 0-2 primary list, added 4-scale global-statistic note. **Verdict: confirmed** (NINDS NEJM 1995 PMID 7477192; caveat - routing note re "MrsCalculator.tsx out of scope" is stale, that surface is already corrected).
- **mrs-prestroke-evt-eligibility / citation_ids + description** (936-939): removed `aha-asa-2026-4.6.1`, rewrote to scope prestroke-mRS to EVT-only. **Verdict: confirmed** (verified against aha2026StrokeGuideline.ts §4.6 has no prestroke gate; reported oldText may be stale but final state correct).
- **nihss-severity-interpretation-2026 / description** (647): CTA head/neck trigger re-attributed from §4.7.2 to Section 3 Imaging, flags outstanding registry gap. **Verdict: confirmed** (imagingRecommendations.vascular COR 1 LOE A; one style-consistent em-dash noted, non-blocking).

### src/lib/citations/registry.ts
- **robblee-ahs-2025 / year** (1316): `2025` to `2026` (print-volume year). **Verdict: confirmed** (matches entry's own title/section; ID string retained; clinical Levels untouched).

### src/data/clinicalSynthesesByQuestion.ts
- **asymptomatic-carotid / bodyParagraphs[1]** (62): CREST-2 `HR 0.45 / HR 0.69` to `ARD 3.2 pp (95% CI 0.6 to 5.9) / ARD 1.6 pp (95% CI -1.1 to 4.3)`. **Verdict: confirmed** (crest-2 evidence packet §2; paper reports ARD/RR, no HR; NNT 31 / P=0.02 retained).
- **crao-management / bodyParagraphs[2]** (140): THEIA `Sibon et al.` to `Préterre et al.`. **Verdict: confirmed** (theia evidence packet; PMID 41109232).

### src/data/abcd2ScoreData.ts
- **DRAWER_EXPLANATION.low** (102): added `DAPT is not indicated below ABCD2 4; single antiplatelet therapy is appropriate`. **Verdict: confirmed** (closes tier-boundary ambiguity; additive only).
- **DRAWER_EXPLANATION.moderate** (103): bare `High-risk TIA` to `ABCD2 score 4-5 meets the guideline threshold for high-risk TIA (ABCD2 >=4)`. **Verdict: confirmed** (resolves moderate-tier-label conflict; DAPT rec unchanged).

### src/data/hasBledScoreData.ts
- **HASBLED_BLEEDS_PER_100 scores 5-9** (39-58): added block + inline comments disclosing 8.70 is an extrapolated floor (Pisters 2010 n=1 at score 5, none >=6). **Verdict: confirmed** (no numeric change; value change deferred to Class E; residual: disclosure is comment-only, bedside surfaces still render bare 8.70 - flagged for later Class E).

### src/pages/MrsCalculator.tsx
- **:380 grade<=1 body**: removed `and for IVT within 4.5 h`, added `IVT carries no prestroke-mRS eligibility gate`. **Verdict: confirmed** (aha2026StrokeGuideline.ts IVT section; minor headline nit line 379 flagged non-blocking).
- **:391 grade<=2 body**: removed NINDS from mRS 0-2 list, added mRS 0-1 global-statistic note. **Verdict: confirmed**.

### src/pages/guide/StrokeBasicsWorkflowV2.tsx
- **:520 Emberson 2014**: `4% per 15-min delay` to window-based `~10% within 3h vs ~5% at 3-4.5h`. **Verdict: confirmed** (Emberson Lancet 2014 PMID 25106063; matches approved proposed fix).
- **:523 WAKE-UP**: `favorable outcomes` to `excellent outcome (mRS 0-1) at 90 days`. **Verdict: confirmed** (Thomalla NEJM 2018; numbers unchanged; process note - fixer's "PMID 30so verified" is garbled, edit itself correct).

### src/pages/guide/IvTpa.tsx
- **:41 door-to-needle**: `<45 min` to `<60 min (goal ≤30 min)`. **Verdict: confirmed** (matches GWTG plan, schema.ts, medicalGlossary.ts; 45 min is Honor Roll tier, not guideline).

### src/pages/guide/AcuteStrokeMgmt.tsx
- **:91-93 hemicraniectomy**: `<60 y with midline shift` to `malignant cerebral edema with neurological deterioration: COR 1 if ≤60y; COR 2a if >60y (individualized)`. **Verdict: confirmed** (aha2026StrokeGuideline.ts brainSwelling[0-1]; off-by-one and trigger fixed, >60y arm added; non-blocking: guide surface still untagged).

---

## 3. Needs-Decision (each with the precise question for V)

1. **trialData.ts / trace-iii / stats.effectSize** (7613-7616) - ARD 8.8pp shown without CI.
   **Q for V:** Authorize evidence-verifier to pull the ARD/risk-difference CI from Xiong NEJM 2024 (TRACE-III)? No hand-derived CI may be displayed without evidence-verifier sign-off.

2. **trialData.ts / raise / primaryDesign** (14022) - `binary-superiority` tag loses the hierarchical NI-then-superiority structure.
   **Q for V:** Which schema resolution - (a) add a new design value, (b) `noninferiority` + a secondaryDesign/Result for superiority, or (c) accept `binary-superiority` with a note? Requires medical-scientist for the pairing.

3. **registry.ts / baoche-trial-2022 / quoted_text** (93) - flagged `[Secondary-source synthesis pending verbatim NEJM access]`; §13.6 item 1 incomplete.
   **Q for V:** Provide the verbatim NEJM abstract conclusion for BAOCHE (Zi et al., NEJM 2022;387:1373-1384, PMID 36239645) so the flag can be removed. (Paywalled Tier 2.)

4. **registry.ts / attention-trial-2022 / quoted_text** (103) - same paywall flag, §13.6 item 1 incomplete.
   **Q for V:** Provide the verbatim NEJM abstract conclusion for ATTENTION (Tao et al., NEJM 2022;387:1361-1372, PMID 36239644).

5. **registry.ts / aha-asa-2026-4.3 / quoted_text** (256-265) - bp-control claim promises pre-IVT ≤185/110 and post-IVT <180/105, but quoted_text carries only the post-EVT <140 harm finding, so promised targets never render.
   **Q for V:** (a) Expand aha-asa-2026-4.3 quoted_text with verbatim §4.3 pre/post-IVT rows, or (b) register separate citation rows (e.g., -pre-ivt-bp, -post-ivt-bp)? Class E - verbatim §4.3 sourcing + clinical-reviewer gate required.

6. **hasBledScoreData.ts / 4-tier scheme, `very_high` at score >=4** (31/53-57/73) - fourth tier not sourced to Pisters 2010 (which uses 3 tiers).
   **Q for V:** Adopt which tier convention - (a) collapse to Pisters 3-tier (changes the TS type contract + risk output for all >=4), or (b) retain 4 tiers and register a secondary citation defining the >=4 band? Also entangled with the score-1 monotonicity artifact. medical-scientist authors, clinical-reviewer gates.

7. **Thrombectomy.tsx / Section 2 Late Window** (67-71) - frames late-window selection as requiring DAWN/DEFUSE-3 + CTP/MRI mismatch; 2026 selects anterior LVO by ASPECTS and does not mandate perfusion mismatch.
   **Q for V:** Retire DAWN/DEFUSE-3 criteria entirely from this paragraph, or retain as a parenthetical historical note alongside 2026 ASPECTS-based text? Class E - medical-scientist rewrite + clinical-reviewer gate.

8. **Thrombectomy.tsx / Section 3 Distal/MeVO** (80) - collapses two distinct 2026 categories (dominant-M2 COR 2a vs nondominant/codominant M2/distal MCA/ACA/PCA COR 3 No Benefit LOE A) into one soft "evidence limited" statement.
   **Q for V:** Confirm the detail tooltip ("consider by technical feasibility and deficit") should be revised to reflect COR 3 language for nondominant vessels (the tooltip may be the only text a bedside reader sees). Class E rewrite.

---

## 4. Structural-Skipped (each becomes a separate data-architect / architect task)

1. **trialData.ts / direct-mt / efficacyResults** (2664-2675) - displays reperfusion (79.4% vs 84.5%) not primary mRS-shift. Multi-field restructure; sources disagree on mRS 0-2 (62.0/58.5 vs 65/57). Needs evidence-verifier before restructuring.
2. **trialData.ts / mr-clean-no-iv / efficacyResults** (3095-3106) - displays 90-day mortality not primary ordinal mRS. Multi-field restructure assembled by TrialPageNew.tsx:105; needs primary-paper mRS 0-2 verification + medical-scientist/clinical-reviewer gate.
3. **trialData.ts / elan / listCategory** (~9963) - `antiplatelets` mislabels a DOAC/anticoagulant trial; `anticoagulants` not in the union type. D-clinical: extend union + badge renderer + trialListData mapping.
4. **claims.ts / CREST-2 duplicate citation** (372-381, 513-517) - two claims point to `brott-crest-2-2025` vs `brott-crest-2-2026`. Atomic claims.ts + registry.ts dedup. D-clinical.
5. **registry.ts / duplicate brott-crest-2-2026 + -2025** (686, 930) - same DOI/PMID 41269206, inconsistent metadata. Multi-file dedup; keep the richer figure-accurate line-695 text as canonical. Route to data-architect (D-clinical).
6. **registry.ts / aha-asa-2026-4.7.3 basilar-EVT grade** (604) - quoted_text says "Class I, Level A"; correct is COR 1 LOE B-R (<6h) + COR 2a LOE B-R (6-24h). Blocked per explicit task constraint (V decision pending); audit is internally split, needs medical-scientist to confirm true COR/LOE from primary table. `blocked:awaiting-clinical-review`.
7. **cha2ds2VascData.ts / ANNUAL_STROKE_RATE** (67-78; joint Cha2ds2VascCalculator.tsx 457-467) - data-side already documented (JSDoc); actionable remainder is a UI footnote marker in the .tsx file. Separate -clinical UI pass.
8. **MrsCalculator.tsx:383 / grade===2 body** - prestroke mRS 2 "relative contraindication" framing vs COR 2a. HIGH severity, out of medium/low scope; paired MrsCalculator.tsx + claims.ts:939 edit. (Note: reviewer found this already corrected in the live file - orchestrator should confirm and close.) Class E.
9. **NihssCalculator.tsx:681 / §4.7.2 vascular-imaging misattribution** - needs new Section-3 registry citation + claims.ts citation_ids + visible section-ref update. Editing the .tsx alone = metadata-integrity violation. Class E, multi-file.
10. **NihssCalculator.tsx:717 / PRISMS sICH traceability** - statistic (3.2% vs 0%) is accurate; fix lives entirely in registry.ts prisms-trial-2018 quoted_text. No .tsx change. C-clinical registry update.
11. **IchManagement.tsx / untagged claim surfaces** - no data-claim tags; requires medical-scientist to author each claim-citation mapping + register IDs. Phased coverage-backlog (TASKS.md).
12. **Thrombectomy.tsx (+AlteredMentalStatus/IchManagement/MultipleSclerosis/SeizureWorkup) / untagged surfaces** - zero data-claim tags across guide pages except PostStrokeLipidManagement. D-clinical coverage backlog; no partial tagging without full mapping.
13. **IvTpa.tsx / untagged clinical prose** - zero data-claim attributes; bulk-tagging prohibited without medical-scientist authoring. C-clinical/D-clinical TASKS.md item.

*(Note: items 11-13 are the same governance class - untagged-surface coverage - and can be consolidated into one phased tagging backlog epic.)*

---

## 5. Reviewer-Flagged (wrong / incomplete - orchestrator re-check REQUIRED before commit)

### WRONG (block - do not commit as-is)

1. **src/data/strokeClinicalPearls.ts - file-level "false-positive" judgment is WRONG.**
   The fixer claimed "zero confirmed medium/low findings target this file." False. Audit finding `contraindications-relative` (confirmed, MEDIUM) targets `strokeClinicalPearls.ts / id: contraindications-relative (line 200-208)`. Line 202 still reads `Severe stroke NIHSS >25 (greatest benefit, NNT=3)`. Per Fugate & Rabinstein (PMC4530420) the source reports **no NIHSS-severity NNT** - the ~3 figure is a time-window value (0-90 min, Lansberg/Saver 2009). This is false-precision / source-misattribution (never-drift qualifier + certainty violation) and **remains unfixed**. **Action:** route back for NNT=3 removal (proposedFix: replace with qualitative "no severity-specific NNT established"). Class E.

2. **src/pages/guide/IchManagement.tsx:87,89 - cerebellar threshold edit is WRONG (BLOCK).**
   Bundles two correct fixes (grade `Class I, Level B` -> `Class 1, Level B-NR`; STICH II "small benefit" -> "did not meet primary endpoint, 41% vs 38%, P=0.367") with one **fabricated gate**: it added `volume >=15 mL` as a standalone cerebellar evacuation indication and **deleted the sourced `>3 cm` threshold**. The cited quoted_text (registry.ts:383) contains no "15 mL" figure; every other in-repo surface says ">3 cm"; "15 mL" is almost certainly a conflation with MISTIE-III's supratentorial target. Violates never-drift (fabricated quantitative gate) + mandatory-block condition #4 (quoted_text mismatch), and creates cross-surface inconsistency. **Action:** revert size gate to `>3 cm` (or escalate to medical-scientist to source a mL equivalent and reconcile all three surfaces). The B-NR grade fix and STICH II fix may stand.

### INCOMPLETE (correct direction, but not clean - reconcile before commit)

3. **src/pages/guide/PostStrokeLipidManagement.tsx:819 - SPARCL NNT value is INCOMPLETE.**
   Direction correct (crude NNT 53 rightly removed, "~5 years" replaces mean follow-up, HR 1.66 preserved), but the new value **`~45` is wrong**: SPARCL (Amarenco NEJM 2006) reports NNT = **46** (1/0.022 rounds up to 46), and the repo's own `strokeClinicalPearls.ts:848` already says NNT=46 (mapped to a registered claim). The edit widened the internal contradiction instead of closing it. **Action before commit:** converge on **NNT 46** across all three SPARCL surfaces (this .tsx, strokeClinicalPearls.ts:848, trialListData.cardmeta.generated.ts); optionally register a SPARCL/Amarenco citation and tag the untagged pearl.

4. **src/pages/guide/Thrombectomy.tsx:51 - NIHSS ≥6 addition is INCOMPLETE.**
   The applied `NIHSS: ≥6` addition is clinically correct and source-accurate (evtRecommendations all carry nihss:'≥6'). But the corresponding audit finding scoped the Indications fix to add **both** NIHSS ≥6 **and** ASPECTS (3-10 early / ≥6 late). ASPECTS - the most load-bearing EVT selection gate, subject of a separate confirmed high-severity finding - is **still absent** from the Indications list. **Action:** complete the ASPECTS gate addition; because adding a required selection gate is Class E clinical logic, route through medical-scientist authoring + clinical-reviewer gate.

---

**Governance note:** Findings marked "already-fixed"/false-positive that reviewers independently confirmed correct in the live file (extend-ia was reported both as a fix and re-confirmed; direct-mt, mr-clean-no-iv, elan legend, aha-asa-2022-ich-anticoag-reversal, HERMES control rate, NihssCalculator ASPECTS 3-10 line 684) require no action. Two of the reviewer-flagged items (#1, #2) are **blocking** and must be resolved before any Waves 2-3 commit. Per CLAUDE.md §5 Rule 7 / §20, all gates, commit, and push remain Claude-owned once V approves the corrected set.