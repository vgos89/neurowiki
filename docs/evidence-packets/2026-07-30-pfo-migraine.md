# Evidence Packet — PFO closure for migraine (Phase 3)

**Verifier:** evidence-verifier · **Date:** 2026-07-30 · **Skills:** clinical-trial-audit, trial-statistics
**Verdict:** proceed with corrections. No block condition, but **6 substantive errors and 1 misattribution** were found in the supplied source material. Two would have produced clinically misleading page copy.

---

## THE FRAMING THAT GOVERNS THE WHOLE PAGE

**Every randomized trial of PFO closure for migraine missed its primary endpoint. Without exception.** Every positive number in the source material is secondary, subgroup, or post-hoc.

| Trial | Pre-specified primary | Met? | Positive findings and their true status |
|---|---|---|---|
| **MIST 2008** | Cessation of migraine 91 to 180 days after the procedure | **NO** (3/74 vs 3/73, P=0.51) | Secondary endpoints also all negative. The only positive signal (total migraine days, P=0.027) came from an **EXPLORATORY post-hoc analysis that deleted 2 outlier patients**. |
| **PRIMA 2016** | Reduction in monthly migraine days, months 9-12 vs a 3-month baseline | **NO** (-2.9 vs -1.7 days, P=0.17) | Migraine-with-aura days (P=0.014) and aura attacks (P<0.01) are SECONDARY. Responder rate 38% vs 15% is SECONDARY. **Overall migraine attacks were NOT significant (P=0.09).** |
| **PREMIUM 2017** | Co-primary: responder rate (≥50% reduction in attacks) **and** adverse events | **Efficacy co-primary NO** (38.5% vs 32.0%, P=0.32). **Safety co-primary YES.** | Headache-day reduction (P=0.025) and complete remission (8.5% vs 1.0%, P=0.01) are SECONDARY. |
| **Mojadidi pooled 2021** | None. Post-hoc pooled analysis with **re-defined endpoints** | n/a | All findings post-hoc. **The conventional responder rate was 38% vs 29%, P=0.13, NOT significant**, and was omitted from the source material. |

**Bedside story:** three randomized trials, three missed primaries, one post-hoc pooled analysis that re-defined the endpoints and still could not make the conventional responder rate significant. Both guidelines that address it recommend against. Any framing that leads with "significant reduction in migraine days" without leading with "missed its primary endpoint" is a clinical-safety failure.

---

## Corrections to the supplied source material

| # | Source | Source material said | Verified truth | Severity |
|---|---|---|---|---|
| 1 | PRIMA | "PRIMA (2015)" | *Eur Heart J* **2016**;37(26):2029-2036 | metadata |
| 2 | PRIMA | aura days "P=0.01" | **P=0.014** | precision |
| 3 | PRIMA | "significant reduction in attacks" | Overall attacks **P=0.09, NS**. Only **aura** attacks P<0.01 | **clinical** |
| 4 | PRIMA | responder "38% vs 15% (P=0.02)" | Estimates confirmed; **P=0.02 UNVERIFIED**. Endpoint is ≥50% reduction in **days**, not attacks | unverified |
| 5 | PREMIUM | single primary endpoint | **Co-primary** efficacy + safety; **the safety co-primary WAS met** | **clinical** |
| 6 | PREMIUM | remission "8.5% vs 1.5%" | **8.5% (10/117) vs 1.0% (1/103)**, P=0.01 | statistic |
| 7 | Pooled | "pooled analysis of the sham-controlled trials" | **MISATTRIBUTION.** Pooled PRIMA (unblinded, no sham) + PREMIUM (sham). **MIST, the other sham trial, was EXCLUDED.** | **blocking if published** |
| 8 | Pooled | "N=303" | **N=337** (176 device / 161 control) | statistic |
| 9 | Pooled | "-1.2 days, P=0.02" | **-3.1 vs -1.9 days**, P=0.02. The 1.2 is the between-group difference, not an effect estimate | truncation |
| 10 | Pooled | (omitted) | **Responder rate 38% vs 29%, P=0.13, NOT significant** | **clinical omission** |
| 11 | VA/DoD | "insufficient evidence to recommend" | **Recommendation 40, "Weak against"** — an active recommendation against | **clinical** |
| 12 | MIST | "3/74 vs 3/73" | Confirmed; **P=0.51** was omitted | truncation |
| 13 | MIST | (not flagged) | The positive day-count signal is **EXPLORATORY and outlier-excluded** | **clinical** |
| 14 | SCAI | conditional rec against | Confirmed; add **"moderate certainty of evidence"** | completeness |

### The three that matter most
- **#7 the pooled analysis is not what it was called.** Describing it as pooled sham-controlled evidence overstates the rigour of the dataset: one of its two trials was open-label, and the other sham-controlled trial was left out.
- **#11 VA/DoD did not say "insufficient evidence."** That guideline has a distinct "neither for nor against" category for insufficient evidence, used for 19 other recommendations. PFO closure was not placed there. It got an active Weak against, the same class as its recommendations against gabapentin and IV ketamine.
- **#10 the pooled analysis's own conventional endpoint was null** and the source material omitted it while reporting the day and attack counts. That is the selective-reporting pattern this page must avoid.

---

## Verified sources

**MIST 2008** — Dowson A, Mullen MJ, Peatfield R, et al. *Circulation*. 2008;117(11):1397-1404. doi:10.1161/CIRCULATIONAHA.107.727271. PMID 18316488.
147 randomized, migraine with aura, failed ≥2 preventive classes, moderate or large shunt. STARFlex vs **sham**. 6-month follow-up. **A formal Correction was published (Circulation 2009, doi:10.1161/CIRCULATIONAHA.109.192626).** Co-principal investigator Peter Wilmshurst refused to sign the manuscript, is not an author, and objected specifically to the post-hoc exclusion of the two outliers. STARFlex is discontinued and the sponsor ceased operations in 2011, so this trial does not generalize to Amplatzer-era practice.

**PRIMA 2016** — Mattle HP, Evers S, Hildick-Smith D, et al. *Eur Heart J*. 2016;37(26):2029-2036. doi:10.1093/eurheartj/ehw027. PMID 26908949. NCT00505570.
107 randomized. Amplatzer vs medical therapy, **unblinded, no sham**. **Terminated early for slow enrolment.** Major internal-validity caveat: of 53 randomized to closure, the device was implanted in **41 (77%)** and successful closure adjudicated at 6 months in only **35 (66%)**.

**PREMIUM 2017** — Tobis JM, Charles A, Silberstein SD, et al. *J Am Coll Cardiol*. 2017;70(22):2766-2774. doi:10.1016/j.jacc.2017.09.1105. PMID 29191325. NCT00355056.
230 randomized (117 device / 103 control analyzed). **6 to 14 migraine days per month**, failed **≥3** preventives, TCD-defined shunt. Amplatzer vs **sham** (right heart catheterization), double-blind.

**Mojadidi pooled 2021** — Mojadidi MK, Kumar P, Mahmoud AN, et al. *J Am Coll Cardiol*. 2021;77(6):667-676. doi:10.1016/j.jacc.2020.11.068. PMID 33573735.
Post-hoc individual-patient pooled analysis of PRIMA + PREMIUM. **Steven Messé (lead author of the AAN PFO practice advisory) publicly criticized it:** the difference of "only 0.6 [attacks] ... and only 1.4 fewer migraine days is of uncertain clinical importance," responder rate is "typically seen as a more meaningful metric," and the outcomes were "selected in retrospect."

**SCAI 2022** — Kavinsky CJ, Szerlip M, Goldsweig AM, et al. *J Soc Cardiovasc Angiogr Interv*. 2022;1(4):100039. doi:10.1016/j.jscai.2022.100039. PMID 39131947. Verified verbatim from PMC open access:
> "In persons experiencing migraines without a prior PFO-associated stroke, the SCAI guideline panel **suggests against the routine use of PFO closure for the treatment of migraine (conditional recommendation, moderate certainty of evidence)**."
> "Patients, particularly those with debilitating migraines who have failed to benefit from conventional medical therapy, who place a high value on the uncertain benefits ... **may reasonably choose PFO closure**."

**VA/DoD 2023** — VA/DoD Clinical Practice Guideline for the Management of Headache, Version 2.0, September 2023. Read from the primary PDF:
> **Recommendation 40: "We suggest against patent foramen ovale closure for the treatment or prevention of migraine." Strength: Weak against.**

---

## Could NOT verify — do not publish these
1. PRIMA responder-rate **P=0.02** (abstract does not carry it; full text paywalled).
2. **Confidence intervals for any result in any of the four studies.** None recoverable. Per trial-statistics, no absolute risk difference may be displayed without a CI: obtain CIs or omit ARD displays.
3. Mojadidi complete-cessation denominators (9% vs 0.7% do not reconcile with 14/176 and 1/161; likely 12-month-completer denominators). Report as published, do not recompute.
4. Mojadidi funding source and COI statement (JACC returned 403). The device is Abbott's Amplatzer and Tobis is both a PREMIUM investigator and a co-author here.
5. Full text of all four accompanying editorials. All four located and identified by title/author/journal/volume/DOI; all paywalled or bot-gated. The PREMIUM editorial (Whisenant & Reisman, *JACC* 2017;70(22):2775-2777, "PFO and Migraine: The Blind Leading the Blinded") and the pooled-analysis editorial (Ahmed & Sommer, *JACC* 2021;77(6):677-679, PMID 33573736) carry the field's central critique and should be obtained before the interpretive framing is finalized.
6. **(added 2026-07-31)** Content of the MIST letter and author reply (Johansson et al., *Circulation* 2009;119(5):e193; author reply e194, PMID 19204311). Both paywalled. Do not state what the letter argued or whether the reply answered it.
7. **(added 2026-07-31)** What the MIST Correction (*Circulation* 2009;120(9):e71-2) actually corrected. Its existence and target are verified via Crossref; its substance is not. Do not characterise it beyond "a formal Correction was published."
8. **(added 2026-07-31)** The identity of the "principal headache specialist" found guilty of dishonesty by the GMC. Wilmshurst (*Eye* 2018) names a role, not a person, and BMJ 2015;350:h982 was not retrievable. **Do not name any individual.** Relatedly, do not imply the Circulation paper was retracted or flagged: no retraction and no Expression of Concern exist.
9. **(added 2026-07-31)** Effect estimates from the Kheiri 2018 RCT-only meta-analysis (*JACC Cardiovasc Interv* 2018;11(8):816-818, PMID 29673517). No abstract exists in any index and the item is closed access. This is the pooled analysis that **includes** MIST; obtaining it is the highest-value outstanding retrieval.
10. **(added 2026-07-31)** Full text of the Carroll 2008 (*Circulation*) and Luft 2016 (*Eur Heart J*) editorials. Not retrievable by any route on 2026-07-31. Do not attribute any position to either.
11. **(added 2026-07-31)** Exact wording of the Whisenant/Reisman 2017 and Ahmed/Sommer 2021 editorials. Their content is known only through named secondary reporting (TCTMD). Attribute as reported, never as directly quoted. Also unverified: the 2021 editorial's own COI statement.

## Display constraints
- **NNT is PROHIBITED for every source here.** No trial met its primary endpoint, so there is no valid superiority absolute risk difference.
- The pooled analysis has no clean framework fit; closest is `registry` and it **requires an explicit post-hoc disclaimer**.
- PRIMA's continuous mean-days primary does not fit the existing display archetypes. Do not force it into a binary bar. Escalated as a taxonomy gap.
- Required `howToInterpret` caveats: all three trials missed their primary · MIST's positive signal is exploratory and outlier-excluded · PRIMA was unblinded with 77% implantation and 66% adjudicated closure and stopped early · the pooled analysis re-defined endpoints post hoc and its responder rate was null · industry device sponsorship throughout · both current guidelines recommend against.

## Repo cross-check
**None of these six sources exist in the repo.** No duplication risk. The existing `pfo-closure-cryptogenic` synthesis is scoped to **stroke** and must not lend its citations to a migraine question; `aha-asa-2021-secondary-prevention-pfo` does not address migraine.

## Recommended IDs
Citations: `dowson-mist-2008`, `mattle-prima-2016`, `tobis-premium-2017`, `mojadidi-pfo-migraine-pooled-2021`, `kavinsky-scai-pfo-2022`, `vadod-headache-cpg-2023`.
Claims: `pfo-closure-migraine-synthesis`, `mist-pfo-migraine-2008`, `prima-pfo-migraine-2016`, `premium-pfo-migraine-2017`.
Trials: `mist-trial`, `prima-trial`, `premium-trial`. Question: `pfo-closure-migraine`, related to `pfo-closure-cryptogenic`.

---

## §8 — Expert and editorial caveats

> **Added 2026-07-31** in response to the clinical-reviewer block on this packet. The 2026-07-30 packet (everything above this line) carried §8a material inside "Could NOT verify" item 5, had §8c and §8d content present but unlabelled, and had **no §8b at all** for any of the four sources, which is a mandatory block. This section supplies §8b for all four sources, resolves the §8a precondition stated in item 5, and labels the pre-existing §8c/§8d content. **No text above this line has been altered**, other than six additions to the "Could NOT verify" list, each tagged `(added 2026-07-31)`.
>
> **Headline: no contradiction to the packet's interpretive framing was found.** Three sharpenings are required and are collected in §8e.

### §8a — Accompanying editorials

All four paired editorials are confirmed as *formally paired* by PubMed `CommentOn` linkage rather than by adjacency in the issue.

| Primary source | Editorialists | Citation | PMID | Full text |
|---|---|---|---|---|
| MIST 2008 | Carroll JD | *Circulation* 2008;117(11):1358-1360 | 18332260 | NOT obtained |
| PRIMA 2016 | Luft AR | "Closing PFO closure for migraine?" *Eur Heart J* 2016;37(26):2037-2039 | 26966147 | NOT obtained |
| PREMIUM 2017 | Whisenant B, Reisman M | "PFO and Migraine: The Blind Leading the Blinded." *JACC* 2017;70(22):2775-2777 | 29191326 | NOT obtained; content recovered via secondary reporting |
| Mojadidi 2021 | Ahmed Z, Sommer RJ | "Reassessing the PFO-Migraine Trials: Are We Closer to Closure?" *JACC* 2021;77(6):677-679 | 33573736 | NOT obtained; content recovered via secondary reporting |

**Retrieval attempts, all 2026-07-31.** jacc.org returned HTTP 403. Europe PMC REST indexes both JACC editorials with `isOpenAccess: N` and no `abstractText` (JACC editorials carry no abstract, so none exists to retrieve). Semantic Scholar returned `abstract: null` for both. The PMC ID converter confirms **none of the four editorials has a PMCID**. Carroll and Luft could not be recovered by any route and remain unread.

#### §8a precondition (packet "Could NOT verify" item 5) — RESOLVED

Neither JACC full text was obtained. Both were recovered in substance through named secondary reporting that quotes them directly (TCTMD).

**Whisenant & Reisman 2017, on PREMIUM.** As reported: PFO closure "is not a cure for migraine to be applied broadly, but may be an important therapy for some," and future research "must focus on removing the blinders and identifying those who may be most responsive."

**Verdict: SHARPENS, and SOFTENS in one direction that must be disclosed.** These are the two most device-favourable readers in the record, both interventional cardiologists, and they concede closure is not broadly applicable and that responders cannot yet be identified. They do not dispute that PREMIUM missed its efficacy co-primary. But "may be an important therapy for some" is **more permissive than the guidelines**, and NeuroWiki must not represent this editorial as an unqualified critique. The same coverage carries independent neurologist criticism (Nauman Tariq): the underlying theory "is flawed to begin with," and the observed reduction "is not significant enough to warrant this invasive treatment."

**Ahmed & Sommer 2021, on the pooled analysis.** As reported: "the underlying pathophysiologic mechanism linking migraine symptoms to PFO remains unknown"; a definitive trial "will require an inclusion or screening criterion that can reliably determine the causal or incidental nature of the PFO"; and once the causal subset can be identified, "screening and treatment of PFO for migraine can become a reality."

**Verdict: AGREES with and SHARPENS the framing.** "Can become a reality" is a statement that it is not one now. The same coverage **independently reproduces the pooled responder rate as 38% vs 29%, P=0.13, not significant**, double-sourcing packet correction #10. COI note: TCTMD's 2017 coverage reported Sommer was working with WL Gore on an upcoming PFO-migraine trial; Sommer co-authored the 2021 editorial.

**Does the interpretive framing stand without the full texts? Yes.** Three bases. (i) The load-bearing claims are arithmetic facts read from the trials' own results (primary endpoints, P values, arm counts), not interpretive positions an editorial could overturn. (ii) Both recovered editorials are by device-aligned interventional cardiologists, the most favourable possible readers, and **neither endorses current clinical use**. (iii) The framing's conclusion is anchored on guideline recommendations (§8c), which post-date all four editorials. The two unread editorials are both on trials whose primaries were unambiguously negative, so neither can supply a positive reading. **Precondition closed.**

### §8b — Post-publication letters, replies, corrections, expressions of concern

**Search method, all 2026-07-31.** (1) PubMed `efetch` retmode=xml on each primary PMID, reading the complete `CommentsCorrections` block (the authoritative Comment-in / Erratum-in / Expression-of-concern-in linkage). (2) Broad search `("foramen ovale"[tiab] AND migraine[tiab]) AND (letter[pt] OR comment[pt] OR editorial[pt])`, 50 records, each screened. (3) Targeted search on trial names plus letter/comment publication types, 4 records, all accounted for.

**MIST 2008 (PMID 18316488) — FINDINGS PRESENT.**

*Letter with author reply:* Johansson MC, Dellborg M, Eriksson P. *Circulation* 2009;119(5):e193; author reply e194. PMID 19204311. A formal author reply exists. **Content of neither obtained** (paywalled); no statement may be made about what the letter asserted or whether the critique survived. See Could-NOT-verify #6.

*Formal Correction:* *Circulation* 2009;120(9):e71-2. **Verified via Crossref**, which resolves the DOI to a Circulation item of type correction with `update-to` = the MIST paper. The packet's existing statement is confirmed. **What it corrected was not obtained** and must not be characterised (Could-NOT-verify #7).

*Status of the paper itself:* **No retraction. No Expression of Concern.** Verified from the complete CommentsCorrections block, which contains exactly three linked items: one ErratumIn and two CommentIn. This negative must be stated wherever the integrity record is used.

*The Wilmshurst dispute, properly characterised.* An authorship and research-integrity dispute conducted partly in the literature, partly in the courts, and partly before the UK regulator. Primary source: **Wilmshurst PT. "Migraine with aura and persistent foramen ovale." *Eye* (Lond) 2018;32(2):184-188. PMID 29219954, PMCID PMC5811737. Open access, read in full.** Corroborating: *BMJ* 2012;344:e2226 (PMID 22438388).

- **Two steering-committee members refused authorship, not one.** Verbatim: the paper "was so inaccurate that another member of the steering committee, Dr Simon Nightingale, and I refused to be authors of the paper." *(This expands packet line 52 and the shipped page text, both of which name only Wilmshurst.)*
- **Design objections, verbatim:** he "strongly advised NMT before the protocol was finalised that only patients with large shunts across a PFO should be included," and that the trial "needed a single echocardiography core laboratory. My advice was rejected." On execution: "Against the advice of the steering committee, NMT insisted that the implanting cardiologists should perform the final contrast echocardiograms."
- **Litigation:** the sponsor sued Wilmshurst for libel four times; litigation ended only when NMT Medical went into liquidation (*BMJ* 2011;342:d2646).
- **Regulatory finding, verbatim from the *Eye* 2018 COI statement:** he reported "the trial's principal headache specialist to the General Medical Council, where the principal headache specialist was found guilty of dishonesty in the trial and was suspended from the Medical Register." Reported in *BMJ* 2015;350:h982, PMID 25701580 (**full text not obtained**).

**Two hard constraints on any downstream use.** (i) **Do not name the individual** — Wilmshurst names a role, not a person, and the BMJ item naming them was not retrieved. Inferring identity from the author list is not verification. (ii) **Do not imply the paper was retracted or flagged.** The GMC finding concerns an individual's professional conduct; it is not a journal action against the publication. Conflating the two is a clinical-safety and defamation risk.

**PRIMA 2016 (PMID 26908949) — NO post-publication correspondence.** CommentsCorrections contains exactly one linked item, the Luft editorial. No letters, replies, erratum, EoC or retraction. Confirmed across all three search routes.

**PREMIUM 2017 (PMID 29191325) — NO post-publication correspondence.** CommentsCorrections contains exactly one linked item, the Whisenant & Reisman editorial. No letters, replies, erratum, EoC or retraction. Confirmed across all three routes.

**Mojadidi pooled 2021 (PMID 33573735) — NO post-publication correspondence.** The record carries **no CommentsCorrections block at all**. No letters, replies, erratum, EoC or retraction. The Messé criticism at packet line 61 is **press commentary, not indexed correspondence**, and must not be described as a letter to the editor.

*Interpretation for the bedside: the absence of correspondence on PRIMA, PREMIUM and the pooled analysis is not evidence of acceptance. All three reported negative or equivocal primaries, which attract little letter-writing. It does mean no published methodological critique survived a reply, because none was filed.*

### §8c — Subsequent guideline incorporation

*Pre-existing content at packet lines 63-68 is §8c and is hereby labelled as such:* **SCAI 2022** (conditional recommendation against routine use, moderate certainty, with the shared-decision carve-out, verbatim from PMC) and **VA/DoD 2023 Recommendation 40** (Weak against, read from the primary PDF). Both remain current; neither is superseded.

**NEW, post-2023 (added 2026-07-31):** Kim JS, Diener HC, Low TT, Albers B, Sharma VK, Kim BJ. "Asian-Pacific Expert Opinion on Patent Foramen Ovale Closure." *J Stroke* 2025;27(3):329-337. PMID 41084288, PMCID PMC12527585. Asia-Pacific Heart-Brain Summit, Bangkok, 3 October 2024. Verified verbatim from PMC full text:

> **"PFO closure should not be considered as a first-line/routine treatment for migraine."**
> "Patients undergoing PFO closure for other indications may experience a reduction in migraine symptoms."
> Rationale: "complete resolution of migraine was only observed in observational studies, not RCTs... These findings provide insufficient support for PFO closure as a standalone treatment for migraine."

**Classification and caveats.** This is an **expert opinion / consensus statement, not a graded practice guideline.** It carries no class, level or certainty rating and must not be displayed as one. Funding, verbatim: "Abbott provided funding to facilitate the Asia-Pacific Heart-Brain Summit. There was no involvement from industry in the content of this expert consensus." Diener discloses Abbott honoraria; Albers "received an honorarium from Abbott for the preparation of this manuscript." Abbott manufactures the Amplatzer occluder used in PRIMA and PREMIUM. **An Abbott-funded panel declining to endorse Abbott's device for migraine strengthens rather than weakens the recommendation-against position.**

**AHA/ASA and AAN: no recommendation on PFO closure for migraine was located.** Searched via guideline/practice-guideline/consensus publication-type filters, 2024-2026 and all-years. The AAN PFO practice advisory is scoped to stroke. This is a *not-located* result, **not a verified absence**; the page must not assert that no US neurology society has addressed it.

### §8d — Subsequent meta-analyses and contradicting evidence

*Pre-existing content at packet lines 17, 33-36 and 60-61 (the Mojadidi 2021 pooled analysis and its correction set) is §8d and is hereby labelled as such.*

**1. Most recent meta-analysis, and the one the 2025 consensus relied on.** Silalahi TDA, Hariyanto TI. *Ther Adv Neurol Disord* 2024;17:17562864241271033. PMID 39371639, PMCID PMC11450578. Search to 2024-03-12; 5 RCTs + 6 observational, random effects.
- Monthly migraine attacks: **SMD −0.34 (95% CI −0.51 to −0.18), p<0.0001, I²=19%**, favouring closure.
- Monthly migraine days: **SMD −0.30 (95% CI −0.53 to −0.08), p=0.009, I²=0%**, favouring closure.
- **Complete resolution of migraine: not significant, and specifically not significant on RCT evidence (p=0.24).**
- **HIT-6: not significant (p=0.08). MIDAS: not significant (p=0.15).**
- Authors' conclusion: "better efficacy of PFO closure in reducing monthly migraine attacks and days with similar safety profile when compared to control."

**Bedside interpretation, and this is the important one.** This does **not** contradict the packet framing and changed no guideline: the 2025 Asian-Pacific panel cited this exact paper and still recommended against. But it is the single most likely source of clinician pushback, because its headline reads positive and its p-values are small. The page's defence is already true and currently unstated: **the pooled continuous and count outcomes separate, while every dichotomous patient-relevant outcome (complete resolution, and both validated disability instruments, HIT-6 and MIDAS) is null.** A therapy that shifts a mean attack count by roughly a third of a standard deviation without moving migraine-specific disability is exactly the pattern guideline panels have declined to act on. Mixes RCT and observational data, itself a limitation.

**2.** Zhang QQ, Lu JJ, Yan MY, et al. *BioMed Res Int* 2021;2021:6643266. PMID 33748272. Seven studies (3 RCTs, 4 observational), 887 patients, strata analysed separately. Migraine cessation: RCTs OR 3.86 (95% CI 1.35-11.04, P=0.01). **Retraction/EoC status checked and clear.** Journal-quality caveat: a Hindawi title subject to large-scale integrity actions in 2022-2023; this paper is unaffected but it is a weaker vehicle than Silalahi 2024 and should not be the page's primary meta-analytic citation.

**3.** Kheiri B, Abdalla A, Osman M, et al. *JACC Cardiovasc Interv* 2018;11(8):816-818. PMID 29673517. Letter-format meta-analysis **restricted to RCTs**, i.e. the pooled analysis that **does include MIST**, unlike Mojadidi 2021. Potentially the most directly relevant counterweight to packet correction #7. **No effect estimates obtained** (no abstract in any index; closed access). See Could-NOT-verify #9.

**4. Adjacent 2026 evidence that must be ring-fenced, not cited as closure evidence.** Li Z, Wang C, Tang Y, et al. *BMJ* 2026;394:e100103. PMID 42526943. 1,000 adults with migraine and echocardiography-confirmed PFO, 39 centres in China, randomised 1:1:1:1 to aspirin, clopidogrel, rivaroxaban or metoprolol for 12 weeks. Responder rates 61.7% / 66.8% / 78.4% / 61.8%; rivaroxaban superior, absolute difference 16.2% (98.33% CI 6.0 to 26.4; P<0.001).

**This is a drug trial, not a closure trial: no device arm, no sham, no placebo, all four arms active.** It neither supports nor refutes device closure. Flagged because a clinician could read "rivaroxaban 78.4% responder rate in PFO plus migraine" as evidence that PFO-directed therapy, and therefore closure, works. **If the page mentions it at all, it must be explicitly separated from the closure question.** Open label with blinded outcome assessment, 12 weeks, single country, active comparator, so its absolute responder rates are not comparable to the sham-arm rates in MIST or PREMIUM.

**5.** De Santis F, Foschi M, Romoli M, et al. *Headache* 2025;65(4):709-727. PMID 39989443. Search to 2024-06-30. "Evidence supporting the effectiveness of antithrombotic drugs as a preventive treatment for patients with migraine is insufficient." The pre-2026 baseline against which item 4 should be read.

**Nothing newer contradicts the recommendation-against position.** No randomised trial of PFO *closure* for migraine has been published since PREMIUM 2017, and no meta-analysis of closure for migraine since Silalahi 2024. The claim that the aura-specific signals have never been tested as a pre-specified primary in an adequately powered blinded trial **remains true as of 2026-07-31**.

### §8e — Required sharpenings to already-shipped content

No shipped claim is contradicted. Three require updating.

1. **"both societies that have addressed it"** (synthesis headline, body paragraph 5, bottomLine, and the per-trial `cautions`). Now incomplete: a third society-level document, the Abbott-funded Asian-Pacific Expert Opinion (*J Stroke* 2025), addressed it and also recommends against. Direction unchanged and reinforced. Defensible only on a strict reading in which "society guideline" excludes summit expert opinion. **Reword to a form that does not depend on a count**, and disclose the Abbott funding if the 2025 document is cited.
2. **The most recent meta-analysis is unmentioned.** Silalahi 2024 reads positive and will be found by any clinician who searches. **Name it and state why it does not change the recommendation:** continuous and count outcomes separate, while complete resolution, HIT-6 and MIDAS are all null.
3. **"the co-principal investigator refused to sign the manuscript"** understates the record. **Two** steering-committee members refused authorship (Wilmshurst and Nightingale). Whether to surface the fuller integrity record (libel litigation, GMC dishonesty finding) is a medical-scientist and clinical-reviewer judgement; if surfaced, the two hard constraints in §8b apply without exception.

### §8 verification confidence

**HIGH** — all four editorial identifications and their formal pairing; the §8b negative findings for PRIMA, PREMIUM and Mojadidi (three independent routes); the existence and target of the MIST erratum (Crossref); the absence of retraction or EoC on all four sources; the Wilmshurst account (open-access primary read in full); the Asian-Pacific 2025 recommendation and disclosures (PMC full text); the Silalahi 2024, Zhang 2021, De Santis 2025 and BMJ 2026 abstract-level data.

**MEDIUM** — the Whisenant/Reisman and Ahmed/Sommer editorial content, quoted through named secondary reporting rather than read in the original. Direction is high-confidence; exact wording is not. Attribute as "as reported by TCTMD," never as directly quoted.

**Not established** — the content of the Carroll 2008 and Luft 2016 editorials; the MIST letter and its reply; what the MIST Correction corrected; the Kheiri 2018 effect estimates; the identity of the GMC-sanctioned individual.
