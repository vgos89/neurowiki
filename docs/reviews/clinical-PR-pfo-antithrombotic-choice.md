# Clinical review — PFO antithrombotic choice (Phase 4)

**Decision (round 1):** block · **Reviewer:** clinical-reviewer, fresh context · **Date:** 2026-07-31
**Remediation:** all three blocks and both conditions cleared before commit. Append-only.

## Scope
- Claims: `picss-pfo-warfarin-2002`, `navigate-esus-pfo-2018`, `respect-esus-pfo-2021`, `pfo-antithrombotic-choice-synthesis`
- Citations: 14 new. Deliberately unmapped and scope-walled: `mas-close-2017`
- Surfaces: `src/data/trialData.ts` · `TrialPageNew.tsx` (one shared config-driven block) · `clinicalSynthesesByQuestion.ts` · `registry.ts` + `claims.ts` · `trialCatalogMeta.ts` · `trial-questions.ts` · `src/seo/` · `QuestionDetailPage.tsx` · `calculatorTrialMap.ts`
- Evidence packet: `docs/evidence-packets/2026-07-31-pfo-anticoagulation.md`
- Trial-statistician report: not commissioned; packet §10 carries the archetype and NNT determinations and was treated as governing

## What passed
The reviewer traced, and cleared, the things this page was most likely to get wrong:
- **NNT suppression is total** on the three new records. No `calculations` block exists on any of them.
- **All three display-trap decisions are correct**, and the reviewer traced every consumer of `efficacyResults` to confirm the RE-SPECT placeholder zeros reach no render path. `buildHouseConclusion` *would* compute "0% versus 0%" from them, but its only render site is the generic fallback these records never reach.
- **The paired-display rule holds on roughly thirty surfaces.** Every `OR 0.48` sits with `OR 0.70`; every Ghannam `RR 0.59` sits with Chi's `p=0.28`.
- **Attribution discipline exceeds what the packet demanded**: RE-SPECT's HR 0.88 carries AAN provenance on nine surfaces, prespecification is disclaimed on six, and three surfaces warn against citing the NEJM parent.
- **The within-trial / study-level split was kept**: 0.18 and 0.8290 are within-trial; Chi's 0.28 is study-level and is never presented as a within-trial test.

## BLOCK 1 — the defect reappeared on the fourth trial
The three new records were clean. **CLOSE was not.**

CLOSE is listed on this question only for its anticoagulation arm, but its canonical legend describes the comparison it is famous for. On a page headed *"PFO and stroke: anticoagulate or antiplatelet?"*, its card was rendering:

> **NNT 20** · **HR 0.03 (0.00–0.26)** · "PFO closure abolished recurrent stroke vs antiplatelet alone."

Read in context, that says the anticoagulation comparison has an NNT of 20 and a hazard ratio of 0.03. The figure that actually belongs to this question is **HR 0.44 (0.11 to 1.48), not significant**. Three independent grounds: the packet prohibits NNT for every source here *without exception*; the packet's scope wall forbids lending the closure citations to this question; and `mas-close-2017` is deliberately unmapped, so no mapped citation supports any of the three displayed figures.

**Fixed with a new per-question `legendOverrides` mechanism**, display-only, which never edits the canonical record. CLOSE now presents "Underpowered arm · HR 0.44 (0.11 to 1.48)" here. **Control check in the built HTML: the closure question still shows its canonical NNT 20 and HR 0.03**, which are correct there.

This is a reusable fix, not a patch: any multi-arm trial listed under a question about one of its other comparisons can now be scoped.

## BLOCK 2 — my own remediation was five surfaces short
The author published "a general-population PFO prevalence of roughly 25%" on eleven surfaces. The packet asserts it but attributes it to nothing, so I replaced it with an in-repo sourced comparator: PICSS detected a PFO in **33.8%** of a cohort that *did* undergo transesophageal echocardiography, against 7.4% and 12.6% in the two ESUS trials that did not mandate it.

The reviewer confirmed the substitution is exact and the argument is **stronger** than the original, because both sides are now stroke cohorts and the contrast is imaging protocol rather than population. But my regex missed five variants — "general-population **figure**", "**background** prevalence", and "roughly a **quarter of the population**" — which left `navigate-esus-trial` arguing the same point with two different denominators inside one record. All five now cleared; verified zero remaining in the built pages.

## BLOCK 3 — RoPE was described as a gate
The tie-in overclaimed. The synthesis said RoPE "is the gate on whether any of the evidence above applies", then contradicted itself four sentences later with "not as a switch". The JSON-LD answer said it "determines whether any of this evidence applies", with no corrective clause.

RoPE estimates a probability, and the packet verifies **no cut-point exists** to make gate-hood coherent. All surfaces reworded to a probability formulation; the schema answer now states outright that it is "a probability estimate, not a threshold, and none of these trials stratified by it". The correct framing already present in `calculatorTrialMap` ("the premise every PFO management decision rests on") and in the bottom line was left alone.

## Conditions, both cleared
- **The NAVIGATE-ESUS catalogue card carried the parent DOI** (`10.1056/NEJMoa1802686`) while its description quoted a subgroup figure that paper does not report. Corrected to the Kasner subgroup DOI.
- **Huang's RR 0.61 is not on the packet's §10 display whitelist.** The reviewer judged it "not selective reporting in effect" because it sits inside the decay paragraph. Kept, because packet §1 lists it as one of three positive poolings that must be *reported rather than suppressed*, and bound explicitly: the paragraph now states that all three are study-level poolings of subgroup estimates rather than interaction tests, and all three are subject to the decay that follows. A binding display rule is recorded at the citation, flagged for evidence-verifier sign-off to add an explicit pairing to §10.

## Display decisions on the three new records
None uses the dot chart, each for a different reason, all three confirmed:

| Trial | Why not a dot grid |
|---|---|
| PICSS | 98 patients, 14 events. One patient is 2.4 percentage points in the warfarin arm, so a 100-dot grid implies precision the data cannot support. Also a non-prespecified subgroup of a substudy, which must never render in a superiority frame. |
| NAVIGATE-ESUS | 2.6 and 4.8 are **events per 100 patient-years**, not percentages. The same class of defect as PRIMA's migraine-days: a dot grid would render "2.6%". |
| RE-SPECT ESUS | `efficacyResults` holds **placeholder zeros**. Per-arm rates were never published for this subgroup; only a hazard ratio exists, and it is an AAN extraction. Drawing anything per-arm would invent data. |

## Carried to TASKS.md
- `safetyData` (a string) has no render path anywhere in the app; only `safetyProfile` does. All three records populate the former, so `renderSafetySection` returns null for them. No clinical content is lost, because the NAVIGATE bleeding HR 2.05 (0.51 to 8.18) reaches the page through the footnote, pearls, limitations and bedside pearl, always with its interval in the same sentence. Pre-existing schema quirk, not introduced here.
- Confirm `clinicalSynthesesByQuestion.ts` and `src/seo/schema.ts` are inside the humanizer scanner's targets. No em-dash was found in any new rendered string, but the synthesis body is authored prose on a public-indexable surface and deserves mechanical coverage.
- Evidence-verifier sign-off on the Huang pairing rule.
