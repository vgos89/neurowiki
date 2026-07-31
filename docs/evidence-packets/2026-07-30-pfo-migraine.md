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
