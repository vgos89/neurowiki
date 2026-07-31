# Evidence Packet — PFO Phase 4: anticoagulation vs antiplatelet in PFO-associated cryptogenic stroke

**Verifier:** evidence-verifier · **Date:** 2026-07-31 · **Skills:** clinical-trial-audit, trial-statistics
**Feeds:** the existing `anticoagulation` question at /trials/q/anticoagulation
**Verdict:** proceed with corrections. **One blocking contradiction with already-shipped content** (CLOSE anticoagulation CI, 6 occurrences — CORRECTED 2026-07-31, see §0). Confidence **HIGH** for the interpretive framing; **MEDIUM** for two numeric fields named in §9.

---

## 0. CONTRADICTION WITH SHIPPED CONTENT — read first

**The CLOSE anticoagulation-arm confidence interval shipped on /trials/q/pfo-closure-cryptogenic was wrong.**

Shipped: `HR 0.44 (95% CI 0.11–1.85)`. Published: **HR 0.44 (95% CI 0.11–1.48)**.

Two independent sources, one of them the CLOSE investigators themselves:
- Turc G, Calvet D, Guérin P, Sroussi M, Chatellier G, **Mas JL** (CLOSE Investigators). *JAHA* 2018;7(12):e008356. PMC6220551, open access, read in full: anticoagulation "3 out of 187 patients (1011 patient-years)" vs antiplatelet "7 out 174 patients (926 patient-years)", **HR 0.44 (95% CI, 0.11–1.48)**.
- AAN 2020 Practice Advisory Update, full manuscript PDF read directly: "**HR 0.44 (95% CI 0.11 to 1.48)**."

`1.85` appears in neither source and in no other retrieved source.

**STATUS: CORRECTED 2026-07-31** across all six occurrences (`claims.ts`, and five in `trialData.ts`). Provenance recorded in a comment above `pfo-closure-cryptogenic-synthesis` in `claims.ts`. The NEJM primary text was not retrievable, so confidence that 1.85 is WRONG is HIGH and confidence that 1.48 is exact is MEDIUM-HIGH; full-text confirmation is tracked in TASKS.md.

**Secondary flag — ALSO CORRECTED.** The repo said of the anticoagulation-vs-antiplatelet comparison: "statistical significance was not analysed." The AAN's non-comparison statement is scoped to **anticoagulation vs PFO CLOSURE**, a different pair. This comparison has a published interval. Reworded on all four surfaces to "the trial was not powered for this comparison and the interval includes 1."

**Third flag.** `src/data/trial-questions.ts` carries a stale TODO asking for RESPECT, REDUCE, CLOSE and DEFENSE-PFO to be added; all four already exist in the data layer under `pfo-closure-cryptogenic`.

**No other shipped claim on /trials/q/pfo-closure-cryptogenic is contradicted by this packet.**

---

## 1. THE ANSWER TO THE CLINICAL QUESTION

**Q: In a patient with PFO and cryptogenic stroke, when closure is not chosen or not available, does anticoagulation beat antiplatelet therapy?**

**A: This has never been established by an adequately powered trial. Every dataset in the record is a subgroup analysis or an underpowered arm. There is, however, a reproducible directional signal favouring anticoagulation in pooled subgroups, and it must be reported rather than suppressed. The signal does not survive the tests that matter.**

### Confirmed
- **No trial has ever randomised anticoagulation against antiplatelet therapy in a PFO-selected population as its primary question.** PICSS is a substudy of a trial designed for a different question. CLOSE's anticoagulation arm is a parallel comparison the trial was explicitly not powered for. NAVIGATE-ESUS and RE-SPECT ESUS are ESUS trials in which PFO is a subgroup.
- **Every within-trial interaction test is null.** NAVIGATE-ESUS p-interaction = 0.18. RE-SPECT ESUS p-interaction = 0.8290.
- **The largest and most recent study-level meta-analysis finds no interaction.** Chi et al., *Heart* 2025, 9 RCTs, 15,451 patients: "There was no significant interaction by PFO status (p interaction=0.28)."
- **The AAN, the only major neurology society whose recommendation on this exact question was verified verbatim, declares equipoise, not superiority.** Statement 3a, Level C.

### Refined, point 1 — there IS a signal, and clinicians will find it

Three pooled analyses put the PFO-subgroup estimate below 1 with a CI excluding 1:

| Pooled analysis | Year | Pooled | PFO estimate | Significant? |
|---|---|---|---|---|
| Kasner (inside the NAVIGATE-ESUS PFO paper) | 2018 | PICSS + CLOSE + NAVIGATE-ESUS TOE | **OR 0.48 (0.24–0.96), p=0.04, I²=0%** | YES |
| Huang WY, *Eur J Intern Med* | 2022 | 6 analyses / 5 trials, 2,282 pts | **RR 0.61 (0.41–0.91), p=0.02** | YES |
| Ghannam, *Neurology* | 2024 | 7 ESUS RCTs, 14,804 pts, PFO stratum | **RR 0.59 (0.35–0.98), I²=0%** | YES |

And three put it above:

| Pooled analysis | Year | Pooled | PFO estimate | Significant? |
|---|---|---|---|---|
| AAN 2020 advisory | 2020 | 5 studies | HR 0.73 (0.45–1.17) | NO |
| Diener (inside the RE-SPECT ESUS PFO paper) | 2021 | Kasner's set + RE-SPECT ESUS | OR 0.70 (0.43–1.14) | NO |
| Chi KY, *Heart* | 2025 | 9 RCTs, 15,451 pts | p-interaction **0.28** | NO |

**The pattern is the page's central teaching point.** Kasner's 2018 pooled OR of 0.48 was significant. Adding RE-SPECT ESUS to the same pool in 2021, by the same method, moved it to 0.70 and it stopped being significant. The signal is not robust to the next trial. Meanwhile every within-trial interaction test is null: a significant subgroup effect with a null interaction test is the textbook weak-subgroup pattern. Chi's own authors call their subgroup findings "hypothesis-generating."

### Refined, point 2 — one guideline DID recommend anticoagulation

The statement "guidelines do not recommend anticoagulation over antiplatelets" is **not universally true and must not be published in that form.**

**Kuijpers T, Spencer FA, Siemieniuk RAC, et al. BMJ Rapid Recommendations. *BMJ* 2018;362:k2515.** Verbatim: *"We make a weak recommendation for anticoagulant therapy rather than antiplatelet therapy."* Low-quality evidence; the panel estimated a 7.1% absolute reduction in ischaemic stroke over 5 years alongside a 1.2% absolute increase in major bleeding.

Corroboration that this was a live guideline position: the RE-SPECT ESUS PFO paper's own Background opens *"Guidelines suggest anticoagulation may be more effective than antiplatelets in preventing stroke in patients with ESUS and PFO when interventional closure is not performed."*

**Defensible published framing:** no major neurology or cardiology society recommends anticoagulation **over** antiplatelet therapy; the AAN treats the two as equally acceptable (Level C); a 2018 BMJ Rapid Recommendation made a **weak** recommendation for anticoagulation on low-quality evidence, and no society has adopted it.

### The bedside bottom line
Antiplatelet therapy is the default because it is simpler, safer, and no trial has shown anticoagulation to be better. Anticoagulation is not wrong: the AAN explicitly permits it, and it becomes preferred when an independent indication exists (defined thrombophilia, unprovoked DVT or PE). **CLOSE-2 (NCT05387954)** is recruiting: 792 patients aged 60–80, three arms, primary completion July 2031.

---

## 2. SOURCE 1 — PICSS

Homma S, Sacco RL, Di Tullio MR, Sciacca RR, Mohr JP; PICSS Investigators. *Circulation* 2002;105(22):2625-2631. **DOI 10.1161/01.CIR.0000017498.88393.44. PMID 12045168.**
Parent: Mohr JP, et al.; WARSS. *NEJM* 2001;345(20):1444-1451. **DOI 10.1056/NEJMoa011258. PMID 11794192.**

**Population.** WARSS enrolled non-cardioembolic ischaemic stroke, excluding AF and extracranial carotid stenosis. PICSS is the TEE substudy: **630 patients**, warfarin 312 / aspirin 318. **PFO in 203/630 (33.8%).** **Cryptogenic stroke + PFO: n=98** (warfarin 42, aspirin 56). US, 42 centres, 1993–2000. **TEE referral was clinician-driven, not protocolised**, so PICSS is a selected subset of WARSS.

**Intervention.** Warfarin to **INR 1.4 to 2.8** vs **aspirin 325 mg/day**, double-blind.

> **The single most important caveat on PICSS, required on the page.** WARSS used **low-intensity** warfarin. Not the INR 2–3 of CLOSE, and not a DOAC. PICSS supports no inference about standard-intensity VKA or any direct oral anticoagulant.

**Primary endpoint (verbatim).** "recurrent ischemic stroke or death from any cause within two years."

**Framework.** `superiority` for the parent. **The PFO analysis is a non-prespecified subgroup of a substudy and must display as `forest-row`, never as a superiority result.**

**Result.** Cryptogenic + PFO (n=98), 2-year: **warfarin 4/42 (9.5%) vs aspirin 10/56 (17.9%); HR 0.52 (95% CI 0.16–1.67); P=0.28.**

PICSS's own headline (PFO status, not treatment): no difference between PFO-positive and PFO-negative overall (HR 0.96, 0.62–1.48) or within cryptogenic stroke (HR 1.17, 0.60–2.37). Conclusion verbatim: *"On medical therapy, the presence of PFO in stroke patients did not increase the chance of adverse events regardless of PFO size or the presence of atrial septal aneurysm."*

### ⚠ UNRESOLVED ENDPOINT CONFLICT — do not publish either number without resolving

| Source | Endpoint as labelled | Warfarin | Aspirin | HR (95% CI) |
|---|---|---|---|---|
| Turc/Mas, *JAHA* 2018 | recurrent stroke **or death**, 2y | **4/42 (9.5%)** | **10/56 (17.9%)** | 0.52 (0.16–1.67), P=0.28 |
| AAN 2020 advisory | "recurrent **stroke** at 2 years" | **2/42 (4.8%)** | **8/56 (14.3%)** | 0.52 (0.16 to 1.67) |

Both attach the **identical HR and CI** to different numerators, which cannot both be right. Turc states *"No separate information on recurrent stroke was provided."* **Publish the Turc/Mas composite (4/42 vs 10/56), because it matches PICSS's actual primary endpoint.** Record the AAN discrepancy in `cautions`.

**Safety.** Not obtained for the PFO subgroup.

**What it can and cannot support.** CAN: that having a PFO did not raise 2-year recurrence risk on medical therapy. CANNOT: that warfarin beats aspirin in PFO-associated cryptogenic stroke. 98 patients, 14 events, CI 0.16–1.67, non-prespecified subgroup of a substudy, low-intensity warfarin. **Hypothesis-generating only, and the page must say so in those words.**

---

## 3. SOURCE 2 — CLOSE, anticoagulation arm

Mas JL, Derumeaux G, Guillon B, et al.; CLOSE Investigators. *NEJM* 2017;377(11):1011-1021. **DOI 10.1056/NEJMoa1705915. PMID 28902593. NCT00562289.**

**Population.** 663 patients aged 16–60, ischaemic stroke within 6 months, no cause other than a PFO with **either** an atrial septal aneurysm (excursion >10 mm) **or** a large shunt (>30 microbubbles within 3 cycles).

**Randomisation structure — why the comparison is underpowered.** 1:1:1 into three restricted groups. **The anticoagulation-vs-antiplatelet comparison uses groups 1 + 3 only:** anticoagulation **n=187 (1,011 patient-years)** vs antiplatelet alone **n=174 (926 patient-years)**. Patients with a contraindication to anticoagulation were never randomised into it. A parallel question, not the trial's hypothesis.

**Intervention.** VKA to INR 2–3, or a DOAC at standard dose; **93% received a VKA** (AAN 2020). Comparator: antiplatelet monotherapy, site-chosen.

**Result.** **3/187 (1.5%) vs 7/174 (4.0%). HR 0.44 (95% CI 0.11–1.48).** ACC: *"Anticoagulation versus antiplatelet therapy was inconclusive."* AAN 2020: *"There was no significant difference in stroke recurrence rate."*

**Safety.** AF 0% vs 1.1%, P=0.23 (secondary source). **Major bleeding in the anticoagulation arm NOT retrieved — must not be stated.** The trial's headline AF signal (4.6% vs 0.9%) belongs to the **closure** arm and must not be attached to this comparison.

**Powered? NO.** Ten events across 1,937 patient-years. The CLOSE investigators' own systematic review pooled nothing for this comparison and reported it descriptively.

---

## 4. SOURCE 3 — NAVIGATE-ESUS PFO subgroup

Kasner SE, Swaminathan B, Lavados P, et al. *Lancet Neurol* 2018;17(12):1053-1060. **DOI 10.1016/S1474-4422(18)30319-3. PMID 30274772. PMCID PMC6662613 (open access, read in full).**
Parent: Hart RG, et al. *NEJM* 2018;378(23):2191-2201. **DOI 10.1056/NEJMoa1802686. PMID 29766772. NCT02313909.**

**Population.** 7,213 ESUS patients, 459 centres, 31 countries. **Terminated early**, median follow-up **11 months**. **PFO in 534/7,213 (7.4%)**: rivaroxaban 259, aspirin 275.

> **Ascertainment caveat, required on the page.** Neither ESUS trial mandated TEE or bubble contrast. Population PFO prevalence is ~25%. A detected 7.4% means the subgroup is incompletely and non-randomly ascertained. This is not a PFO-selected population.

**Intervention.** **Rivaroxaban 15 mg once daily** vs **aspirin 100 mg**. Note the dose: 15 mg, not the 20 mg used in AF.

**Framework.** `superiority`, stopped at interim for **futility plus excess bleeding**. The PFO analysis is **prespecified** (verbatim: *"planned before completion of the trial"*).

**Result.** Aspirin 13 events (4.8/100 py); rivaroxaban 7 (2.6/100 py). **HR 0.54 (95% CI 0.22–1.36). p-interaction = 0.18.**

**Power — stated by the authors.** *"Because of early termination of the trial, the power of this study was limited"* — **45% power**; results *"interpreted with caution"*; *"substantial imprecision remains."*

**Safety.** PFO subgroup major bleeding **HR 2.05 (95% CI 0.51–8.18)** — directionally toward harm, wildly imprecise. Parent-trial major bleeding was significantly higher with rivaroxaban and is the fact that matters at the bedside.

**The embedded meta-analysis — report it, and report what happened to it.** Pooled with PICSS and CLOSE: **OR 0.48 (0.24–0.96, p=0.04), I²=0%**. **This is the strongest single number in the entire record and it did not survive: adding RE-SPECT ESUS moved it to OR 0.70 (0.43–1.14) in 2021.** Publishing 0.48 without 0.70 immediately alongside would be selective reporting of the same class as the migraine-packet problem.

**⚠ Erratum outstanding.** *Lancet Neurol* 2018;17(12):e1, PMID 30366869. Content not obtained. Every number above is provisional until it is read.

---

## 5. SOURCE 4 — RE-SPECT ESUS PFO subgroup

### ⚠ CORRECTION TO THE BRIEF
**The PFO subgroup is NOT reported in the 2019 NEJM paper. It has a dedicated publication in *Stroke* two years later.** Citing NEJM 2019 for it would be a misattribution.

Diener HC, Chutinet A, Easton JD, et al. *Stroke* 2021;52(3):1065-1068. **DOI 10.1161/STROKEAHA.120.031237. PMID 33504190.**
Parent: Diener HC, Sacco RL, Easton JD, et al. *NEJM* 2019;380(20):1906-1917. **DOI 10.1056/NEJMoa1813959. PMID 31091372. NCT02239120.**

**Population.** 5,390 randomised. **PFO in 680/5,388 (12.6%).** Same ascertainment caveat.

**Intervention.** **Dabigatran 150 or 110 mg twice daily** vs **aspirin 100 mg**.

**Framework.** `superiority`, ran to completion. **Whether the PFO subgroup was prespecified was NOT established — do not claim it was.**

**Result.** **PFO-by-treatment interaction p = 0.8290.** Arm-level **HR 0.88 (95% CI 0.45–1.71)** — from the **AAN 2020 extraction**, not confirmed against the *Stroke* primary. Label its provenance if published.

**Safety.** Not presented for the PFO subgroup. Overall no difference: RD 0.5% (−0.4% to 1.3%). Clinically relevant non-major bleeding more common with dabigatran.

**Updated meta-analysis and conclusion.** **OR 0.70 (95% CI 0.43–1.14)**, not significant. Verbatim: **"There is insufficient evidence to recommend anticoagulation over antiplatelet therapy for patients with ESUS and a PFO."**

---

## 6. SOURCE 5 — meta-analyses 2023–2026 and the full pooled record

**Governing, most recent.** Chi KY, El Zarif T, Varrias D, et al. *Heart* 2025;111(11):495-505. **DOI 10.1136/heartjnl-2024-325288. PMID 39915077. PMCID PMC12068992.** 9 RCTs, 15,451 participants.
- Recurrent ischaemic stroke overall: **RR 0.90 (0.79–1.02); I²=0%.**
- **"There was no significant interaction by PFO status (p interaction=0.28)."**
- Major bleeding other than ICH higher with OACs: **RR 1.69 (1.18–2.43).**
- Authors' caveat: subgroup findings "could be due to random variations given the post-hoc nature", "viewed as hypothesis-generating."

**The one that reads positive and will be quoted at you.** Ghannam M, Al-Qudah AM, et al. *Neurology* 2024;103(9):e209949. **DOI 10.1212/WNL.0000000000209949. PMID 39365971.** 7 RCTs, 14,804 patients.
- Overall **RR 0.91 (0.80–1.05); I²=0%.**
- **PFO stratum: RR 0.59 (0.35–0.98); I²=0%** — significant.
- Authors: *"an empiric anticoagulation approach is not beneficial for patients with ESUS... Anticoagulation treatment showed promise in patients with medically treated PFO... Large prospective studies within ESUS subgroups are needed to validate our findings."*
- **Critical read:** study-level meta-analysis of subgroup point estimates, reporting a within-stratum RR, **not an interaction test.** Chi 2025 is larger, tests the interaction, and finds none.

**Older, for completeness.**
- Hariharan NN, et al. *Eur Stroke J* 2022;7(2):92-98. DOI 10.1177/23969873221076971. PMID 35647310. Overall RR 0.96 (0.76–1.20); PFO subgroup consistent (null). Bleeding RR 1.57 (1.26–1.97).
- Huang WY, et al. *Eur J Intern Med* 2022;95:44-49. DOI 10.1016/j.ejim.2021.08.002. PMID 34419310. **RR 0.61 (0.41–0.91), P=0.02** favouring OAC. Major bleeding RR 1.61 (0.76–3.40).
- Turc G, et al. *JAHA* 2018;7(12):e008356. DOI 10.1161/JAHA.117.008356. PMID 29910193. **"Three RCTs compared anticoagulation versus antiplatelet therapy, with none showing a significant difference."**

**A fifth randomised dataset the brief did not name.** 47 patients with cryptogenic stroke and PFO randomised to aspirin 240 mg/d vs warfarin INR 2–3, 18 months. AAN: *"HR combined stroke and TIA favoring aspirin 3.03, 95% CI 0.59 to 16.7."* Turc reports the reciprocal, 0.33 (0.06–1.7), with different arm sizes. Attributed as "Shariat et al." **Full citation, DOI and PMID NOT retrieved.** **This trial's direction FAVOURS ASPIRIN and it is routinely omitted from summaries. It should be named.**

**The trial that will settle it.** **CLOSE-2, NCT05387954.** Phase 3, RECRUITING, 792 patients aged 60–80, high-risk PFO, three arms (antiplatelet / oral anticoagulant / closure plus antiplatelet). Primary outcome: *"Time to recurrent stroke (ischemic or hemorrhagic fatal or non-fatal)"* over 4–8 years. Primary completion 7 July 2031.

---

## 7. §8 — Expert and editorial caveats

Method for §8b, all 2026-07-31: PubMed `efetch` on each primary PMID reading the complete `CommentsCorrections` block, plus targeted searches by journal, year and page.

### §8a — Accompanying editorials

| Primary source | Editorial | Citation | PMID | Linkage | Full text |
|---|---|---|---|---|---|
| PICSS 2002 | Halperin JL, Fuster V | *Circulation* 2002;105(22):2580-2582 | 12045158 | formal `CommentIn` | **NOT obtained** |
| CLOSE 2017 | Ropper AH, "Tipping Point for PFO Closure" | *NEJM* 2017;377(11):1093-1095 | 28902592 | same issue, no linkage | **NOT obtained** |
| CLOSE 2017 | Farb A, Ibrahim NG, Zuckerman BD (FDA) | *NEJM* 2017;377(11):1006-1009 | 28902595 | same issue, no linkage | **NOT obtained** |
| NAVIGATE-ESUS PFO 2018 | Meier B | *Lancet Neurol* 2018;17(12):1027-1028 | 30340930 | formal `CommentIn` | **NOT obtained** |
| RE-SPECT ESUS PFO 2021 | **NONE** — no CommentsCorrections block at all | — | — | — | n/a |
| RE-SPECT ESUS parent 2019 | **NONE located** | — | — | — | n/a |
| Ghannam 2024 | **NONE** | — | — | — | n/a |
| Chi 2025 | not checked — stated as a known gap, not a silent omission | — | — | — | n/a |

**Retrieval attempts, all 2026-07-31.** `ahajournals.org` 403 on the Halperin/Fuster editorial and on PICSS itself. `nejm.org` not retrievable. `thelancet.com` / `sciencedirect.com` not retrievable for the Meier comment.

> **⚠ COI note required with any use of the Meier comment.** Bernhard Meier is one of the field's most prominent PFO-closure interventionalists and was a PC-trial investigator. His comment on the NAVIGATE-ESUS PFO subgroup is the most device-and-anticoagulation-favourable reading in the record and must never be presented as a neutral editorial voice. Its content is unread; **attribute nothing to it.**

### §8b — Post-publication letters, replies, corrections, expressions of concern

**PICSS 2002 (PMID 12045168) — FINDINGS PRESENT.** Letter with author reply: McGaw DJ, Ugoni AM. *Circulation* 2003;107(7):e51; **author reply e51**. PMID 12600929. **Content of neither obtained.** *Integrity: no erratum, no retraction, no expression of concern* — verified from the complete block (exactly two items, both `CommentIn`).

**CLOSE 2017 (PMID 28902593) — FINDINGS PRESENT, not via CommentsCorrections.** No block on the CLOSE record, but a correspondence block covering all three 2017 NEJM PFO trials exists under DOI 10.1056/NEJMc1714320, *NEJM* 2017;377(26):2598-2601: letters by Cosmi (PMID 29281581) and Braemswig (PMID 29282963); **reply by Mas JL, Derumeaux G, Chatellier G — the CLOSE authors — PMID 29281580**; replies by Saver (29300445) and Kasner/Søndergaard (29300446). **Contents NOT obtained.** *Integrity: clean.*

**NAVIGATE-ESUS PFO subgroup 2018 (PMID 30274772) — FINDINGS PRESENT, and one is material.**
- **`ErratumIn`: *Lancet Neurol* 2018;17(12):e1. PMID 30366869.** A formal correction to this exact paper. **What it corrected was NOT obtained.** Highest-priority outstanding retrieval in this packet, because every subgroup number in §4 comes from the corrected article.
- **`CommentIn`: Melis M, Ricci S, Toni D; editorial committee of the Italian National Guidelines on Stroke. *Lancet Neurol* 2019;18(3):231. PMID 30784551.** A national guideline committee filed a methodological comment. **No indexed author reply exists.** Content NOT obtained; do not state what it argued.
- *Integrity: no retraction, no expression of concern.*

**NAVIGATE-ESUS parent 2018 (PMID 29766772) — FINDINGS PRESENT.** Correspondence block *NEJM* 2018;379(10):986-987 with **authors' reply by Hart RG, Connolly SJ, Mundl H (PMID 30184459)**. Contents NOT obtained.

**RE-SPECT ESUS PFO 2021 (PMID 33504190) — NO post-publication correspondence.** No CommentsCorrections fields of any type.
**RE-SPECT ESUS parent 2019 (PMID 31091372) — NO post-publication correspondence.**
**Ghannam 2024 (PMID 39365971) — NO post-publication correspondence.**

*Interpretation: silence on the two ESUS trials and the 2024 meta-analysis is not evidence of acceptance — all three reported neutral primaries, which attract little letter-writing. It does mean no published methodological critique survived a reply, because none was filed. The one place a critique WAS filed and not answered is the NAVIGATE-ESUS PFO subgroup — also the paper carrying an unread erratum and the paper that produced the most positive number in this literature. Treat that combination as a caution, not a smoking gun.*

### §8c — Subsequent guideline incorporation

**AAN 2020 practice advisory update — the governing verified guideline.** Messé SR, Gronseth GS, Kent DM, et al. *Neurology* 2020;94(20):876-885. DOI 10.1212/WNL.0000000000009443. **Endorsed by SCAI, AHA/ASA, and the European Academy of Neurology.** Read verbatim from the full manuscript PDF. Its clinical question 2 is literally NeuroWiki's question.

> **Conclusion:** "For patients with cryptogenic stroke and PFO, anticoagulation medication and antiplatelet medication are possibly equally effective at reducing recurrent stroke (HR 0.73, 95% CI 0.45 to 1.17). Of note, the high end of the CI does rule out a clinically important benefit for aspirin."

> **Statement 3a (Level C):** "In patients who opt to receive medical therapy alone without PFO closure, clinicians may recommend either an antiplatelet medication such as aspirin or anticoagulation (using a vitamin K antagonist, a direct thrombin inhibitor, or a factor Xa inhibitor)."

> **Statement 3b (Level B):** "In patients who would otherwise be considered good candidates for PFO closure but require long-term anticoagulation because of suspected or proven hypercoagulability (defined thrombophilia, unprovoked deep venous thrombosis, or unprovoked pulmonary embolism), clinicians should counsel the patient that the efficacy of PFO closure in addition to anticoagulation cannot be confirmed or refuted."

> **⚠ NNT WARNING.** The AAN computed an NNT of 21 with a confidence interval of **19 to −60**, which crosses infinity and includes net harm. **This is exactly why NNT must not be displayed for this question.** If 21 appears anywhere it must carry the full interval and an explicit statement that it includes harm.

Sentence worth quoting, because clinicians misread the AAN as endorsing aspirin: **"the high end of the CI does rule out a clinically important benefit for aspirin."** The AAN did not conclude aspirin is better; it concluded neither is shown better.

**AAN 2016 advisory.** Messé SR, et al. DOI 10.1212/WNL.0000000000002961. Citation verified; **recommendation text NOT obtained**. Superseded by 2020 — do not cite for this question.

**AHA/ASA 2021 Secondary Prevention — PARTIAL.** Kleindorfer DO, et al. *Stroke* 2021;52(7):e364-e467. Already registered as `aha-asa-2021-secondary-prevention-pfo`, scoped to the **closure** decision. **No AHA/ASA 2021 recommendation on antithrombotic CHOICE was verified verbatim** (`ahajournals.org` 403, no PMCID). **Do not publish any AHA/ASA 2021 statement on antithrombotic choice until the primary text is read.**

**BMJ Rapid Recommendations 2018 — the dissenting guideline, must be disclosed.** Kuijpers T, et al. *BMJ* 2018;362:k2515. PMC6058599, read in full. **"We make a weak recommendation for anticoagulant therapy rather than antiplatelet therapy."** Low quality; panel estimates 7.1% absolute stroke reduction and 1.2% absolute major-bleeding increase over 5 years. A BMJ Rapid Recommendation panel, not a neurology or cardiology society; evidence base predates RE-SPECT ESUS; no society has adopted it.

**European position paper (Pristipino 2019), SCAI 2022 — identified, recommendation text NOT obtained.** Attribute nothing.

**2022–2026 sweep.** No new society guideline on this question located. **Not-located, not verified absent.**

### §8d — Subsequent meta-analyses and contradicting evidence

Enumerated in §6. Three findings change bedside interpretation:
1. **The signal decayed as trials accumulated.** OR 0.48 (2018) → OR 0.70 (2021), same pool, same method. Any page showing 0.48 without 0.70 is selectively reporting.
2. **The interaction tests are uniformly null.** 0.18, 0.83, 0.28.
3. **Bleeding is the consistent, reproducible finding, and it goes the other way.** Chi 2025 RR 1.69 (1.18–2.43); Hariharan 2022 RR 1.57 (1.26–1.97); NAVIGATE-ESUS parent 1.8%/yr vs 0.7%/yr. **The efficacy signal is fragile and the harm signal is not.** This asymmetry is the strongest argument for antiplatelet as default and belongs in the bottom line.

**Adjacent evidence to ring-fence.** Siegler JE, et al. *Neurology* 2025;105(3):e213876. PMID 40609061. **Retrospective cohort**, 2,328 patients, Class III, aHR 1.00 (0.69–1.45), no PFO stratum. **Observational; must not be displayed as trial evidence and must not be used for this question.**

---

## 8. NeuroWiki field mapping

### Corrections to existing records
| File | Field | Was | Verified | Status |
|---|---|---|---|---|
| `claims.ts` | claim text | `0.11–1.85` | `0.11–1.48` | **DONE 2026-07-31** |
| `trialData.ts` ×5 | armDetails / safetyData / pearls / doesNotProve / conclusion | `0.11–1.85` | `0.11–1.48` | **DONE 2026-07-31** |
| `trialData.ts` ×3 + `claims.ts` ×1 | "significance not analysed" | — | "not powered; interval includes 1" | **DONE 2026-07-31** |
| `trial-questions.ts` | stale TODO | lists 4 already-shipped trials | rewrite | open |

### New citations safe to register
`homma-picss-2002` · `mohr-warss-2001` · `kasner-navigate-esus-pfo-2018` · `hart-navigate-esus-2018` · `diener-respect-esus-pfo-2021` · `diener-respect-esus-2019` · `messe-aan-pfo-advisory-2020` · `chi-anticoag-cryptogenic-2025` · `ghannam-esus-subgroups-2024` · `turc-close-meta-2018` · `kuijpers-bmj-rapidrec-pfo-2018`

`review_window_months`: 36 for the trials (landmark), 6 for the AAN advisory, the BMJ rapid recommendation, and the meta-analyses.

### New trial records (full §21.1 five-surface wiring each)
| Trial id | Archetype | Framework | primaryResult |
|---|---|---|---|
| `picss-trial` | `forest-row` | `superiority` (parent) + **mandatory non-prespecified-substudy disclaimer** | subgroup, not met |
| `navigate-esus-trial` | `risk-table-km` parent, `forest-row` subgroup | `futility` (stopped for futility + bleeding) | not met |
| `respect-esus-trial` | `risk-table-km` parent, `forest-row` subgroup | `superiority` | not met |

**`close-trial` needs no new record** — only the CI corrections (done) and an expanded anticoagulation-arm narrative.

### Question wiring — ORCHESTRATOR DECISION REQUIRED
The `anticoagulation` question currently holds three **AF-timing** trials. AF-timing and PFO-antithrombotic-choice are different bedside decisions sharing only the verb. **Recommend a distinct question rather than a seven-trial mixed bag. This is a product call.**

---

## 9. Could NOT verify — do not publish these

1. **The CLOSE NEJM primary text.** `nejm.org` not retrievable. The 0.11–1.48 correction rests on two secondary sources (one by the CLOSE PI). Confirm against the NEJM PDF.
2. **PICSS full text.** `ahajournals.org` 403. All of §2 is secondary extraction.
3. **The PICSS endpoint conflict** (4/42 vs 10/56 composite versus 2/42 vs 8/56 stroke-only). Publish the composite; flag the conflict.
4. **PICSS PFO-positive-overall arm rates** (16.5% vs 13.2%, 13.4% vs 17.4%). Surfaced only in an AI-summarised snippet. **Do not publish.**
5. **PICSS bleeding and safety data.** Not obtained at any level.
6. **RE-SPECT ESUS PFO-stratum HR 0.88 (0.45–1.71).** AAN extraction only; attribute to the AAN, not to Diener 2021.
7. **Whether the RE-SPECT ESUS PFO analysis was prespecified.** **Do not claim it was.**
8. **What the *Lancet Neurol* 2018;17(12):e1 erratum corrected.** Existence verified; substance not. Do not characterise beyond "a formal correction was published."
9. **Content of every editorial in §8a.** All identified; none read. Attribute nothing to Halperin & Fuster, Ropper, Farb, or Meier.
10. **Content of every letter and reply in §8b.** In particular, do not state what the Italian National Guidelines committee argued.
11. **Any AHA/ASA 2021 recommendation on antithrombotic choice.** The existing repo quote is scoped to closure and **must not be stretched.**
12. **AAN 2016 recommendation text.** Superseded anyway.
13. **SCAI 2022 and Pristipino 2019 statements on this question.**
14. **Full citation, DOI and PMID for the 47-patient Shariat trial.** Sources disagree on arm sizes.
15. **Chi 2025's within-PFO stratified estimates.** Only the headline `p interaction=0.28` is safe.
16. **CLOSE anticoagulation-arm major bleeding.** Do not state that anticoagulation was safe in CLOSE.
17. **Whether *Heart* published an editorial with Chi 2025.**

---

## 10. Display constraints

**NNT is PROHIBITED for every source in this packet, without exception.**

| Source | NNT? | Reason |
|---|---|---|
| PICSS | **NO** | Non-prespecified subgroup of a substudy; 98 patients; CI includes 1 |
| CLOSE anticoagulation arm | **NO** | Not the primary comparison; underpowered; CI includes 1 |
| NAVIGATE-ESUS PFO | **NO** | Subgroup; 45% power; stopped for futility; CI includes 1 |
| RE-SPECT ESUS PFO | **NO** | Subgroup; interaction p=0.83; CI includes 1 |
| Every meta-analysis | **NO** | Study-level pooling of subgroup estimates; not a superiority RCT primary |

The AAN's own NNT of 21 carries a CI of **19 to −60**, which includes net harm.

**Confidence intervals available for display:** PICSS HR 0.52 (0.16–1.67) with the substudy and low-intensity-warfarin disclaimers · CLOSE HR 0.44 (**0.11–1.48**) with "underpowered" · NAVIGATE-ESUS HR 0.54 (0.22–1.36) with p-interaction 0.18 and "45% power" · NAVIGATE-ESUS bleeding HR 2.05 (0.51–8.18) only if the imprecision is in the same sentence · RE-SPECT ESUS HR 0.88 (0.45–1.71) with AAN attribution · **Kasner OR 0.48 (0.24–0.96) ONLY alongside Diener 0.70 (0.43–1.14)** · **Ghannam RR 0.59 (0.35–0.98) ONLY alongside Chi p-interaction 0.28** · Chi RR 0.90 (0.79–1.02) · Chi bleeding RR 1.69 (1.18–2.43) · Hariharan bleeding RR 1.57 (1.26–1.97).

**Archetype constraints.** PICSS and both ESUS PFO subgroups must render as `forest-row`, never `bar-binary`. **A subgroup result must never display in a superiority frame** without an explicit disclaimer.

**Required `howToInterpret` caveats, all five mandatory:**
1. Not one of these is an adequately powered trial of this question.
2. Every within-trial interaction test is null.
3. PICSS used low-intensity warfarin (INR 1.4–2.8), not modern anticoagulation.
4. Neither ESUS trial mandated TEE or bubble study; 7.4% and 12.6% detected versus ~25% population prevalence means incomplete ascertainment.
5. The efficacy signal is fragile across pooling choices; the bleeding excess is not.

---

## 11. Repo cross-check

| Source | In repo? |
|---|---|
| **PICSS** | **NO** — genuinely new (no match for `picss`, `homma`, `warss` anywhere in `src/`) |
| **CLOSE (whole trial)** | **YES** — `close-trial`, citation `mas-close-2017` |
| **CLOSE anticoagulation arm** | **YES, with a wrong CI in 6 places — now corrected** |
| **NAVIGATE-ESUS** | **NO** — genuinely new |
| **RE-SPECT ESUS** | **NO** — genuinely new |
| **Kasner 2018 PFO subgroup** | **NO** |
| **Any meta-analysis in §6** | **NO** |
| **AAN 2020 advisory** | **NO as a citation** (prose mention only, in an older evidence packet) |
| **AHA/ASA 2021 §5.2.2 PFO** | **YES**, scoped to the **closure** decision only |
| **CLOSE-2 (NCT05387954)** | **NO** |

**Duplication risk: none.** **Scope wall:** the `pfo-closure-cryptogenic` citations answer a different question (device vs medicine) and must not be lent to the antithrombotic-choice question.

---

## 12. Verification confidence

**HIGH** — all canonical citations, DOIs and PMIDs; the AAN 2020 text on this question read verbatim from the full manuscript PDF including Statements 3a/3b, the HR 0.73 (0.45–1.17) pooled estimate and the NNT 21 (19 to −60) warning; NAVIGATE-ESUS PFO subgroup in full from PMC6662613 open access; RE-SPECT ESUS PFO prevalence, p-interaction 0.8290, OR 0.70 (0.43–1.14) and the verbatim conclusion; Chi 2025 and Ghannam 2024 headline figures; WARSS design and primary endpoint verbatim; the BMJ Rapid Recommendation verbatim from PMC; every §8b finding and non-finding from complete CommentsCorrections blocks; CLOSE-2 from the ClinicalTrials.gov API; the repo cross-check.

**MEDIUM** — the CLOSE CI of 0.11–1.48 (two independent sources agree, one by the CLOSE PI; NEJM primary not read: confidence that 1.85 is WRONG is HIGH, that 1.48 is exact is MEDIUM-HIGH) · PICSS subgroup counts (conflicts with the AAN extraction) · RE-SPECT ESUS PFO HR 0.88 (AAN extraction only).

**LOW / not established** — every editorial's content; every letter's content; what the *Lancet Neurol* erratum corrected; any AHA/ASA 2021, SCAI 2022, Pristipino 2019 or AAN 2016 statement on antithrombotic choice; PICSS safety data; the Shariat citation.

**Overall verdict: proceed.** The §1 framing is HIGH confidence and rests on arithmetic facts and verbatim guideline text, not on the unread editorials. **§8 is complete: every source has a finding or an explicit stated reason for non-applicability.**
