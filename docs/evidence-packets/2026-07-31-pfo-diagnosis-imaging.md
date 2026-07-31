# Evidence Packet — PFO Phase 5: how a PFO is actually detected

**Verifier:** evidence-verifier · **Date:** 2026-07-31 · **Skills:** clinical-trial-audit, trial-statistics
**Verdict:** the shipped 33.8% versus 7.4%/12.6% ascertainment argument **HOLDS**. Its conclusion is sound and on one axis understated. But the comparator we use is the weakest available, it carried an arithmetic defect, and a far stronger within-trial number exists that we are not yet using.

---

## §0 DEFECTS IN SHIPPED CONTENT

### §0A CLINICAL-SAFETY TIER — the stroke-code checklist called a 45%-sensitive test the one that "detects PFO" · **CORRECTED 2026-07-31**

`src/components/article/stroke/CodeModeStep4.tsx`, the transthoracic-echo item, shipped:

> "Bubble study detects PFO (present in 25% of population, 40% of cryptogenic strokes in young patients)."

**Transthoracic echocardiography with contrast has pooled sensitivity 45.1% (95% CI 30.8 to 60.3) and specificity 99.6% (96.5 to 99.9) against transesophageal echocardiography** (Katsanos, *Ann Neurol* 2016, 35 studies, 3,067 patients with cryptogenic cerebral ischaemia). Negative likelihood ratio 0.55. **A negative transthoracic bubble study excludes very little.** Presenting it on a bedside checklist as the test that detects PFO is bedside-actionable and wrong.

Four defects, all now fixed:
1. The rule-out implication. Corrected text states the rule-IN direction, gives the sensitivity, and routes to TEE with agitated saline and Valsalva when the answer would change management (AAN 2020 Statement 1f, Level B).
2. **Untagged claim surface** — no `claimId`. Now tagged `pfo-bubble-study-rules-in-not-out`, with `katsanos-pfo-echo-accuracy-2016`, `messe-aan-pfo-advisory-2020` and `meissner-sparc-outcome-2006` registered.
3. **"40% of cryptogenic strokes in young patients" is unverified.** REMOVED rather than re-sourced. The nearest retrieved statement is a background sentence about "up to 43% of patients with cryptogenic cerebral ischemia undergoing investigation with TEE" — neither a result nor age-restricted.
4. The 25% figure was shipped unsourced. It is now supportable and RETAINED, at AAN Level B ("about 1 in 4 adults"), corroborated by SPARC population TEE (25.6% ± 1.9%) and Hagen 1984 autopsy (27.3%). **Binding pairing rule: a prevalence figure never travels without the causal correction** — adjusted for age and comorbidity, PFO does not independently predict stroke (SPARC 2006, HR 1.46, 95% CI 0.74 to 2.88). Prevalence alone leads a resident to conclude the PFO explains the stroke.

### §0B The ascertainment argument: sound in conclusion, weak in construction

**Nothing contradicts it. The NAVIGATE-ESUS authors say it themselves**, verbatim from PMC6662613: the protocol *"did not require a standardised approach to the diagnosis of PFO, and therefore we are likely to have underestimated the prevalence of PFO."*

**A much stronger, within-trial number exists and is unused:** NAVIGATE-ESUS detected PFO in **313 patients (4.6%) by TTE and 379 (27.4%) by TOE** — same patients, same era, a roughly six-fold gradient, inside the very trial whose subgroup we caution about.

Where the current comparator is weak: cross-trial and cross-decade; PICSS's own TEE referral was clinician-driven; and it mildly **overstates** the counterfactual, since NAVIGATE-ESUS's own fully-imaged patients showed 27.4%, not 33.8%. Where it is **understated**: ESUS is a subset of cryptogenic stroke and is therefore more PFO-enriched than PICSS's all-comers population.

**Status: the replacement is BLOCKED.** The 4.6%/27.4% figures come from an article carrying a formal erratum (*Lancet Neurol* 2018;17(12):e1, PMID 30366869) that has not been read. Tracked.

### §0C PICSS arithmetic · **CORRECTED 2026-07-31**
We shipped "203 of 630 (33.8%)". **203/630 = 32.2%.** The literature reports both figures, so the inconsistency is upstream; the 33.8% denominator is probably the number with interpretable TEE (203/601 = 33.8%). The *Circulation* full text is unretrievable (403, no PMCID). **Fixed by never presenting a divisible fraction whose division disagrees with the published percentage.**

### §0D CLOSE carried REDUCE's grading scale · **CORRECTED 2026-07-31**
The CLOSE record shipped the "0 / 1-5 / 6-25 / >25" scale. That is **REDUCE's published scale**, and it produced an internally contradictory sentence: a scale calling >25 "large" beside a CLOSE inclusion threshold of >30. Removed rather than re-attributed. CLOSE's verified criteria remain: ASA with septum primum excursion >10 mm, or >30 microbubbles within 3 cardiac cycles.

---

## §1 THE ANSWER

**There is no gold standard in routine use.** Every published PFO prevalence, every trial inclusion criterion and every trial PFO subgroup is a function of which test was done, how it was performed, and where the threshold was set. Those three choices move detected prevalence from roughly 5% to roughly 50% **in the same patients** — a larger swing than any treatment effect in this literature.

1. **TEE is the working reference standard and is not a gold standard.** Against autopsy, surgery or catheterization: sensitivity 89.2% (81.1 to 94.7), specificity 91.4% (82.3 to 96.8) — from 4 studies and 164 patients. Every TTE and TCD figure is measured against a reference that itself misses about one PFO in ten.
2. **TTE is a rule-in test.** 45.1% (30.8 to 60.3) sensitivity, 99.6% (96.5 to 99.9) specificity.
3. **Technique moves the answer as much as modality.** In the same 44 patients, TEE detection was 11.4% with antecubital injection and 50% with femoral plus Valsalva (Hamann 1998). Adding the patient's own blood to agitated saline roughly doubled positive rates (Gentile 2014, 18.8% to 31.3% at rest, p<0.0001).
4. **The trials did not use one definition.** AAN 2020 verbatim: *"The definition of large shunt varied across studies but ranged from identifying >20-30 microbubbles in the left atrium within 3 cardiac cycles."* DEFENSE-PFO used no microbubble threshold at all; it used anatomy.

**Bedside consequence: "PFO present" and "PFO absent" are not properties of the patient. They are properties of the study that was ordered.**

---

## §2 MODALITY ACCURACY — figures that may ship

| Modality | Reference standard | Sensitivity (95% CI) | Specificity (95% CI) | Source |
|---|---|---|---|---|
| TEE with contrast | Autopsy / surgery / catheterization | **89.2% (81.1-94.7)** | **91.4% (82.3-96.8)** | Mojadidi 2014, 4 studies, 164 pts |
| TCD with contrast | TEE | **96.1% (93.0-97.8)** | **92.4% (85.5-96.1)** | Katsanos 2016, 35 studies, 3,067 pts |
| TTE with contrast | TEE | **45.1% (30.8-60.3)** | **99.6% (96.5-99.9)** | Katsanos 2016, same set |
| Cardiac CT | TEE | **70% (58-79)** | **97% (95-99)** | Lou 2022 — **low-impact journal, caveat required** |

Also shippable: TCD negative LR 0.04 (0.02-0.08) vs TTE 0.55 (0.42-0.72), p<0.001; AUC 0.98 (0.97-0.99) vs 0.86 (0.82-0.89), p<0.001.

**Figures that may NOT ship** (no recoverable CI): Mojadidi's TCD 97%/93%, conventional TTE 46%/99%, TTE second-harmonic 91%/93%; BSE 2026's TTE 88%/82% and TCD 94%/92%; Lee & Oh 85%/98%; Ravi 2026's four-modality figures (composite reference standard, single-centre, authors' own stated referral and selection bias).

**No well-established figure exists for:** non-contrast TTE, intracardiac echocardiography, cardiac MRI, or power m-mode TCD specifically.

---

## §3 TECHNIQUE

- **Valsalva is mandated at guideline level.** AAN 2020 Statement 1f (Level B): studies *"should use bubble contrast, with and without Valsalva maneuver."* Effect: bubble counts 10 ± 11 to 20 ± 19, p<0.005 (Clarke 2004, n=110).
- **Contrast composition matters.** Blood added to agitated saline: TCD sensitivity 100% vs 96% for saline alone — **p = 0.161, NOT significant**; significant only against Echovist (p=0.044) and gelatin (p=0.041). Gentile 2014 (n=80, same patients): 31.3% vs 18.8% at rest, 46.3% vs 35% with Valsalva, p<0.0001.
- **Injection site: large effect, thin evidence, and guidelines do not follow it.** Hamann 1998 (n=44): femoral plus Valsalva 50% vs antecubital alone 11.4%, p<0.01. **BSE 2026 nonetheless recommends an arm vein.** Report the finding; do not turn it into a recommendation.
- **The 3-cycle convention is a convention, not a validated cutoff.** The only study that optimised it (Bhatia 2014, n=95) found the **4th**-cycle rule most accurate for PFO and the 5th for intrapulmonary shunt. Every closure trial used 3. This does not invalidate the trials; it means their shunt classification carries an unquantified misclassification rate. Intrapulmonary shunt is common (26% in ARDS, Boissier 2015) and is the dominant false-positive route, which is exactly why AAN caps TCD at Level C.

---

## §4 SHUNT GRADING AND ASA — the trials did not agree

| Trial | Threshold | Status |
|---|---|---|
| **CLOSE** | ASA with septum primum excursion >10 mm, **OR** >30 microbubbles within 3 cycles | VERIFIED |
| **REDUCE** | Max microbubbles in any single frame in the first 3 cycles: 0 none, 1-5 small, 6-25 moderate, >25 large. No minimum for enrolment; 81% moderate or large | MEDIUM (snippet, not direct read) |
| **RESPECT** | **NOT VERIFIED.** No threshold confirmable from any primary or guideline source. Secondary sources report 1-9 / 10-20 / >20; **must not be published** | NOT VERIFIED |
| **DEFENSE-PFO** | **No microbubble threshold.** ASA, septal hypermobility (excursion ≥10 mm), or PFO size ≥2 mm | consistent with repo |
| **CLOSURE-I, PC** | No ASA or shunt threshold for enrolment | consistent |

**The substantive finding: CLOSE and DEFENSE-PFO both enrolled "high-risk PFO" using non-overlapping definitions.** CLOSE used a flow threshold; DEFENSE-PFO used anatomy and no flow threshold. A patient with a 2 mm separation and 10 microbubbles is high-risk in DEFENSE-PFO and ineligible for CLOSE. **Any page pooling them under one label elides a real difference.**

TCD scales run to >300 microbubbles while TEE scales top out at >25: **a TCD grade and a TEE grade are not the same measurement and must never be cross-walked.**

**ASA is defined inconsistently.** Hanley 1985 original: ≥15 mm. The stroke trials used **≥10 mm**, which is more permissive. ASA prevalence figures are threshold-dependent and not comparable without the threshold stated.

---

## §5 PREVALENCE — a citable source now exists

- **Hagen 1984** (*Mayo Clin Proc*, PMID 6694427), 965 autopsy hearts: **27.3% overall**; 34.3% in decades 1-3, 25.4% in 4-8, 20.2% in 9-10. Mean size 4.9 mm, increasing with age. **Anatomic probe patency at post-mortem is not the same as a demonstrable shunt in a living patient.**
- **SPARC** (*Mayo Clin Proc* 1999, PMID 10488786; *JACC* 2006, PMID 16412874): random population sample aged 45+, **25.6% ± 1.9%** by TEE (1999) and **24.3%** (2006).
- **AAN 2020, Level B, verbatim:** *"having a PFO is common; ... it occurs in about 1 in 4 adults in the general population; ... it is difficult to determine with certainty whether their PFO caused their stroke."*

**The correction that must travel with every prevalence figure:**
- SPARC 2006: adjusted for age and comorbidity, **PFO was not a significant independent predictor of stroke, HR 1.46 (0.74-2.88), p=0.28.**
- Overell 2000: the association is **confined to the young** — under 55, OR 3.10 (2.29-4.21); over 55, OR 1.27 (0.80-2.01).

---

## §6 WHAT THE GUIDELINES SAY ABOUT HOW TO LOOK

**AAN 2020 is the governing document** (read in full, PMC7526671). Statements 1a-1i cover the workup. The two that matter here, verbatim:

> **1f (Level B):** "clinicians should assess for cardioembolic sources using TTE followed by TEE assessment if the first study does not identify a high-risk stroke mechanism. Studies should use bubble contrast, with and without Valsalva maneuver, to assess for right-to-left shunt and determine degree of shunting"

> **1h (Level C):** "clinicians may use TCD agitated saline contrast as a screening evaluation for right-to-left shunt, but this does not obviate the need for TTE and TEE to rule out alternative mechanisms of cardio embolism and confirm that right-to-left shunting is intracardiac and transseptal"

**SCAI 2022 makes NO diagnostic recommendation.** All 13 recommendations reviewed; none addresses modality, contrast, manoeuvre, cycles or grading. **Do not attribute one to it.**

**AHA/ASA 2021: NOT RETRIEVED** (403, no PMCID). Not verified present or absent. **Do not publish any AHA/ASA statement on diagnostic modality.**

**ASE/SCAI 2015** is the standing technique authority and **was not read** (403; the open PDF exceeded the fetch limit). The commonly-repeated "8 mL saline with 0.5 mL air" protocol is a **secondary paraphrase and must not be quoted as ASE text.** Any technique statement must be sourced to AAN 2020 or BSE 2026.

---

## §8 EXPERT AND EDITORIAL CAVEATS

Method: PubMed `efetch` on every PMID reading the complete `CommentsCorrectionsList`, plus targeted searches for the editorial slot. **All 29 sources carry a finding or an explicit non-applicability statement.**

**§8a** — Editorials found and identified for Mojadidi TCD 2014 (Zoghbi, PMID 24651099), SPARC 1999 (Blackshear & Brott, PMID 10488801), SPARC 2006 (PMID 16412875), and Kasner 2018 (Meier, PMID 30340930, **COI: a prominent PFO-closure interventionalist and PC-trial investigator, never a neutral voice**). **None obtained. Attribute nothing.** Explicit NONE for 19 further sources. AHA/ASA 2021 and Pristipino 2019 not checked — **stated as known gaps, not silent omissions.**

**§8b** — **SPARC 2006 has two indexed letters with author replies** (PMID 17084270, 17084271), contents unobtained. **This is the highest-priority outstanding retrieval**, because SPARC 2006 is the source of the null causal finding. **SCAI 2022 carries an erratum** (PMID 39132358) republishing conflict-of-interest statements; characterise it as no more than that. **Kasner 2018 carries an unread erratum** constraining §0B. Nineteen sources have empty blocks: **that silence is not endorsement** — diagnostic-accuracy meta-analyses in specialty journals attract few letters because few people read them.

**§8c** — AAN 2020 is the incorporation and it is explicit and quotable. SCAI 2022 is explicit non-incorporation. AHA/ASA 2021 unknown. BSE 2026 is the most recent technique incorporation and does **not** adopt femoral injection.

**§8d** — Five findings, three material: the 3-cycle convention is contradicted by the only study that tested it; TTE sensitivity is technique-dependent, not a fixed property (a 2026 cohort found 83.3%, but with no CIs and a composite reference standard, so neither figure ships); technique-level improvements postdate the pooled estimates, so a modern well-performed study probably outperforms them. **No Cochrane review of PFO diagnostic accuracy exists.**

---

## §10 COULD NOT VERIFY — DO NOT PUBLISH

1. RESPECT's shunt grading and any "substantial shunt" threshold.
2. CLOSE's grading scale as distinct from its >30 threshold.
3. REDUCE's grading at HIGH confidence (snippet, not direct read).
4. The PICSS denominator (203/630 ≠ 33.8%).
5. **What the *Lancet Neurol* 2018;17(12):e1 erratum corrected. Every NAVIGATE-ESUS figure here, including 4.6% and 27.4%, is provisional against it.**
6. The content of every editorial in §8a.
7. The SPARC 2006 letters and replies.
8. Any AHA/ASA 2021 diagnostic statement.
9. Any Pristipino 2019/2021 diagnostic text.
10. Any ASE/SCAI 2015 text.
11. Accuracy for non-contrast TTE, intracardiac echo, cardiac MRI.
12. Accuracy for power m-mode TCD specifically.
13. **"40% of cryptogenic strokes in young patients."** Was shipped; now removed.
14. "TTE 14.9% vs TEE 24.3% general-population prevalence."
15. Hanley's exact 15 mm criteria.
16. Spencer scale grade boundaries.
17. Whether the SCAI erratum changed anything substantive.

---

## §11 DISPLAY CONSTRAINTS

**Governing rule: a sensitivity or specificity figure ships only with (a) its 95% CI and (b) its reference standard, in the same sentence or adjacent cell. A figure lacking either does not ship.**

**And: any general-population prevalence figure ships ONLY paired with SPARC 2006 (HR 1.46, 0.74-2.88) or Overell 2000 (under 55 OR 3.10; over 55 OR 1.27). Prevalence without the causal correction is the specific error this packet exists to prevent.**

No NNT, absolute risk difference or efficacy statistic from any source here: none is a therapeutic trial. Nothing renders as `bar-binary`, `grotta-bar`, `risk-table-km` or `ni-margin-chart`.

**Packet-internal, DO NOT PUBLISH:** applying 45.1% TTE sensitivity to an expected ~27% prevalence predicts ~12% detected, almost exactly RE-SPECT ESUS's 12.6%. Arithmetically suggestive, but it is the verifier's calculation, not a published finding. Relatedly: because TTE preferentially detects large shunts, the ESUS PFO subgroups are probably enriched for exactly the anatomy CLOSE and DEFENSE-PFO selected — which would change the caveat from "the subgroup is too small" to "the subgroup is the wrong shape." Coherent, consequential, and still an inference. Needs its own verification pass.

---

## §12 VERDICT ON THE SHIPPED COMPARISON

| Dimension | Verdict |
|---|---|
| Direction | **Sound.** The authors say it themselves. |
| Magnitude | **Sound, if anything conservative.** |
| 33.8% as the counterfactual | **Mildly overstated.** 27.4% is the trial's own figure. |
| PICSS as the comparator at all | **Weak but not wrong.** A within-trial comparator exists and is unused. |
| The published fraction | **Defective. Corrected.** |
| Anything contradicting | **Nothing.** The strongest nuance against us is a refinement of the same argument. |

**One direction we do not state and should:** under-ascertainment does not merely shrink the subgroup, it **selects**. That changes the caveat from "too small" to "the wrong shape," which is more damaging. Blocked pending verification.
