# Clinical review — W8.2.1 ENRICH

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: ENRICH trial entry in `src/data/trialData.ts`
- Citations affected: Pradilla G, Ratcliff JJ, Hall AJ, et al. NEJM 2024;390(14):1277–1289 (DOI 10.1056/NEJMoa2308440, PMID 38598795, NCT02880878)
- Surfaces changed:
  - `primaryDesign: 'bayesian-superiority'` added (was unset; existing TrialPageNew.tsx:249 renderer handles this)
  - `primaryResult: 'met'` added
  - `stats.sampleSize.info` corrected: 152/148 → 150/150; median age 61, 45% female → 64/62, 48%/52% (per packet §9 CONSORT)
  - `stats.pValue.value`: `'0.04'` → `'P(sup)=0.981'` (LOAD-BEARING; the frequentist p=0.04 does not appear in the paper)
  - `stats.pValue.label`: `'Statistically Sig.'` → `'Bayesian posterior'`
  - `stats.pValue.info`: replaced with Bayesian-framework wording, "no frequentist p-value reported"
  - `stats.effectSize.info`: replaced with Bayesian credible interval framing + 30-day mortality with CrI
  - `trialDesign.type`: refined dates (Dec 2016 – Aug 2022), added "industry-funded" disclosure, added "anterior basal ganglia subgroup halted for futility"
  - `trialDesign.timeline`: precise dates
  - `trialDesign.sampleSize.info`: 152/148 → 150/150
  - `trialDesign.pValue.value`: removed `p=0.04`, replaced "CI" with "Bayesian CrI", added posterior P(superiority)
  - `trialDesign.nnt`: relabeled "~12 (safety endpoint only)" with explicit Bayesian/safety disclaimer
  - `calculations.nntExplanation`: rewritten with the same disclaimer per packet §11
  - `pearls` rewritten: replaced "FIRST positive surgical ICH trial" with "first randomized trial of supratentorial ICH evacuation to meet its prespecified primary endpoint"; replaced "halves mortality / NNT≈12" with Bayesian CrI framing; clarified anterior basal ganglia was halted for futility; added Bayesian framework caveat; added AHA/ASA 2022 ICH Class IIb cross-reference; corrected pearl[10] citation to Pradilla G first author
  - `source`: `'Hanley DF, et al. (NEJM 2024)'` → `'Pradilla G, et al. (NEJM 2024)'` (LOAD-BEARING; Hanley led MISTIE III, not ENRICH)
  - `keyMessage`: rewritten — removed "halves mortality" overclaim; flagged anterior BG futility
  - `limitations`: anterior BG futility added; industry funding disclosed (NICO Corporation); blinded mRS adjudication mitigation added; UW-mRS validation caveat added
  - `listDescription`: "MIPS halves 30-day mortality" → "30-day mortality 9.3% vs 18.0% (Bayesian P>0.98)"
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-enrich-trial.md` (confidence HIGH; full PDF verified)
- Trial-statistician report: per packet — Bayesian adaptive primary; NNT for primary not formally valid; NNT 12 displayed must carry safety-endpoint label

## Semantic validity

**LOAD-BEARING FIX 1 — Author misattribution.** Per packet §1 and §9: first author is **Pradilla G**, not Hanley DF. Hanley DF led MISTIE III (Lancet 2019) — a different trial. The misattribution would have made downstream citations point to the wrong investigator team. Corrected in `source` and `pearls[10]`.

**LOAD-BEARING FIX 2 — Frequentist p-value misrepresentation.** Per packet §11 flag #3: the value `p=0.04` does not appear in the ENRICH paper. The trial used a Bayesian framework with posterior probability of superiority = 0.981 (prespecified threshold 0.975). Displaying a fabricated p-value misrepresents the statistical framework. Removed everywhere it appeared (3 places) and replaced with Bayesian posterior wording.

**LOAD-BEARING FIX 3 — NNT framing.** Per packet §11 flag #2 and clinical-trial-audit skill: NNT is not formally valid for Bayesian designs, and the NNT 12 in repo is derived from the primary SAFETY endpoint (30-day mortality), not the primary EFFICACY endpoint (UW-mRS at 180d). Numeric value retained (UI dependency) but explicitly labeled as "approximate, safety-endpoint" in `calculations.nntExplanation`, `trialDesign.nnt.info`, and `pearls[1]`. Existing TrialPageNew.tsx:249 renderer adds the Bayesian-posterior annotation automatically once `primaryDesign: 'bayesian-superiority'` is set.

**LOAD-BEARING FIX 4 — Anterior basal ganglia subgroup framing.** Per packet §11 flag #5: prior text said "less robust benefit"; reality is the subgroup was **halted for futility at interim 2** with a directionally negative point estimate (UW-mRS −0.013, 95% CrI crossing zero). This is a different category of finding from "less robust" — benefit was not demonstrated, full stop. Corrected.

**Sample-size and demographic corrections.** Final allocation was 150/150 (not 152/148), median age 64/62 (not 61/45), enrollment Dec 2016 – Aug 2022 (not 2017–2023). All per CONSORT Figure 1 in the paper. Corrected.

**Overclaim language.** Per packet §11 flags #1 and #2: "FIRST positive surgical ICH trial" softened to "first randomized trial of supratentorial ICH evacuation to meet its prespecified primary endpoint"; "halves 30-day mortality" replaced with absolute risk difference + Bayesian credible interval.

All five never-drift categories: PASS post-edit.

## Citation accuracy

- DOI 10.1056/NEJMoa2308440 verified per packet (resolves to correct paper).
- PMID 38598795 verified.
- NCT02880878 verified.
- Source string corrected (Pradilla G, not Hanley DF).
- Pearl citation updated to "Pradilla G, Ratcliff JJ, Hall AJ, et al."

## Freshness

- ENRICH (NEJM 2024): 6-month window per §13.7 (current major guideline-changing trial in ICH surgery). `last_reviewed: 2026-05-14` upon W5.2.

## AHA / 2022 ICH guideline cross-reference

ENRICH is **NOT** in the 2026 Acute Ischemic Stroke Guideline (this is an ICH trial). The governing reference is:

- **2022 AHA/ASA Guideline for the Management of Patients With Spontaneous Intracerebral Hemorrhage** (Greenberg SM et al., Stroke 2022;53(7):e282–e361; DOI 10.1161/STR.0000000000000407):
  - Section on supratentorial ICH surgical management: minimally invasive surgery is **Class IIb** in select cases (pre-ENRICH wording).
  - ENRICH (NEJM 2024) is the first positive RCT and may prompt a focused update; current 2022 wording does not yet reflect ENRICH.

Pearl now includes the AHA/ASA 2022 Class IIb cross-reference with note that ENRICH may prompt guideline update.

## Rationale

Four load-bearing fixes were needed:
1. Wrong first author (Hanley → Pradilla)
2. Fabricated frequentist p-value (`p=0.04` does not appear in paper)
3. NNT framing (Bayesian + safety endpoint disclaimers required by clinical-trial-audit)
4. Anterior basal ganglia overclaim (was halted for futility, not "less robust")

Plus four medium-severity demographic and date corrections (150/150 allocation, age 64/62, female 48/52%, Dec 2016–Aug 2022 dates), plus tone-hedging on "first" and "halves" overclaims per packet §11.

Existing `primaryDesign` was unset; now `bayesian-superiority`, which engages the existing TrialPageNew.tsx:249 NNT-annotation logic correctly.

No efficacy direction, UW-mRS values, or 30-day mortality numbers changed. The trial remains a positive Bayesian RCT with mortality reduction; this commit corrects the metadata and framing to match what the paper actually reports.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `pradilla-2024-enrich` with DOI `10.1056/NEJMoa2308440`, PMID `38598795`, NCT `NCT02880878`, `quoted_text` from packet §4 primary endpoint verbatim, `last_reviewed: 2026-05-14`, `review_window_months: 6`.
- Confirm exact mRS=0 percentage in the control arm (Figure 2 wedge not visible) via supplementary appendix. Class C-clinical task; not blocking.
- 7-value mRS arrays available per packet §9 — surgery `[4, 21, 22, 27, 30, 13, 30]`, control `[~0, 9, 15, 31, 31, 16, 35]` — Grotta-bar visualization is a future UX enhancement.
- When AHA/ASA issues an ICH guideline focused update incorporating ENRICH, refresh Class/Level cross-reference and update `last_reviewed`.
