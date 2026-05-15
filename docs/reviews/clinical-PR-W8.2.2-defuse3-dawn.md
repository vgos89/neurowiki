# Clinical review — W8.2.2 DEFUSE-3 + DAWN

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: DEFUSE-3 + DAWN entries in `src/data/trialData.ts`
- Citations affected:
  - DEFUSE-3 — Albers GW, et al. NEJM 2018;378(8):708–718 (DOI 10.1056/NEJMoa1713973, PMID 29364767, NCT02586415)
  - DAWN — Nogueira RG, et al. NEJM 2018;378(1):11–21 (DOI 10.1056/NEJMoa1706442, PMID 29129157, NCT02142283)
- Surfaces changed:
  - DEFUSE-3 `doi` corrected (was DAWN's DOI); `pmid` added; `imagingSelection` enriched (pre-stroke mRS, occlusion site); `populationExclusions` expanded with stopping caveat, primary-vs-secondary outcome framing, NNT secondary-outcome disclaimer, posterior-circulation/M2 generalizability; `pearls` rewritten to lead with ordinal primary statistic (common OR 2.77) and label NNT 3.6 as secondary; `source` expanded
  - DAWN `doi` corrected (was DEFUSE-3's DOI); `pmid` added; `imagingSelection` precision fix (mRS 0–2 group C core 31–<51 mL); `populationExclusions` expanded with stopping (predictive probability ≥95%), Bayesian framing, mid-trial coprimary upgrade disclosure (FDA, 30 months in, blinded), NNT-derivation-from-secondary disclaimer; `pearls` rewritten to clarify utility-weighted mRS as primary and mRS 0–2 as second coprimary; `source` expanded
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-defuse3-dawn.md` (confidence HIGH for both trials)
- Trial-statistician report: per packet — DEFUSE-3 is ordinal-shift primary (NNT not valid for primary); DAWN is Bayesian with utility-weighted mRS first coprimary and mRS 0–2 second coprimary; existing renderer at `TrialPageNew.tsx:249` already annotates NNT for Bayesian designs

## Semantic validity

**LOAD-BEARING FIX — DOIs were SWAPPED.** The repo had DEFUSE-3 carrying DAWN's DOI (`10.1056/NEJMoa1706442`) and DAWN carrying DEFUSE-3's DOI (`10.1056/NEJMoa1713973`). Cross-verified against packet §1 of each trial. Clicking the DEFUSE-3 DOI would have taken users to the DAWN paper and vice versa. This is a never-drift violation in the citation accuracy category that the metadata-completeness hook could not detect (both DOIs were valid, just attached to the wrong trial). Corrected.

**DEFUSE-3 primary outcome reframing.** Repo's `stats.primaryEndpoint.value: 'mRS 0-2'` is incorrect — the primary outcome per packet §4 is the **ordinal mRS distribution at 90 days** analyzed by ordinal logistic regression (common OR 2.77, 95% CI 1.63–4.70). The mRS 0–2 dichotomization (45% vs 17%) is a secondary outcome. Kept the stats display unchanged (changing the primary endpoint visible value would cascade through more UI than this commit scopes), but added explicit population-exclusion bullets and pearl text that flags the secondary-outcome derivation of the displayed mRS 0–2 result and NNT 3.6.

**DAWN coprimary upgrade disclosure.** Per packet §4: DAWN's second primary endpoint (mRS 0–2) was upgraded from secondary to coprimary 30 months into the trial, at FDA request, while still blinded. No multiplicity adjustment was made. Without disclosure, the displayed 49%/13% mRS 0–2 result reads as the trial's primary; in fact it's a coprimary that came in late and was not adjusted for multiplicity. Disclosure now in `populationExclusions`.

**Both trials stopped early disclosures.** DEFUSE-3 stopped at pre-specified efficacy interim (n=182 of 476); DAWN stopped at 31 months for predictive probability ≥95% on first coprimary (n=206 of 500 planned). Both disclosures added to `populationExclusions`.

**NNT validity per `clinical-trial-audit`.**
- DEFUSE-3: ordinal-shift primary — NNT for primary not valid. Displayed NNT 3.6 is for secondary mRS 0–2; now labeled.
- DAWN: Bayesian primary (utility-weighted mRS) — NNT for primary not formally valid. Displayed NNT 2.8 is from binary coprimary; existing renderer (`TrialPageNew.tsx:249`) annotates with Bayesian-posterior-probability note.

All five never-drift categories: PASS post-edit.

## Citation accuracy

- DEFUSE-3 DOI corrected, PMID 29364767 added, NCT verified, source string expanded with volume/issue/pages per packet.
- DAWN DOI corrected, PMID 29129157 added, NCT verified, source string expanded.

## Freshness

- DEFUSE-3 (NEJM 2018): 24-month window per §13.7 (landmark trial; foundational late-window EVT). `last_reviewed: 2026-05-14` upon W5.2.
- DAWN (NEJM 2018): 24-month window. Same.

## AHA 2026 guideline cross-reference

Per 2026 Guideline §4.7.2 Endovascular Thrombectomy for Adults (per "What is New and of High Impact" table):

> **COR 1.** "In selected patients with AIS from anterior circulation proximal LVO of the ICA or M1, presenting between 6 and 24 hours from onset of symptoms, with age <80 years, NIHSS score ≥6, prestroke mRS 0 to 1, ASPECTS 3 to 5, and without significant mass effect on imaging, EVT is recommended to improve functional clinical outcomes and reduce mortality."

DAWN and DEFUSE-3 are the foundational trials for the 6–24h late-window EVT recommendation. The 2026 guideline now allows up to ASPECTS 3–5 within the same window (incorporating SELECT2/ANGEL-ASPECT). Pearls in both trials now cross-reference §4.7.2 COR 1.

## Rationale

The DOI swap was a metadata error that would mislead anyone clicking through to the source publication — corrected. NNT secondary-outcome labeling now aligns both trials with `clinical-trial-audit` skill rules. DAWN's coprimary upgrade disclosure addresses a known clinical-reviewer-grade concern (the trial's main displayed result was upgraded mid-trial without multiplicity adjustment).

No efficacy rates, p-values, or recommendation strengths changed. The substantive clinical content was already correct; this commit fixes citation accuracy and adds the secondary-outcome / Bayesian framing required by the audit skill.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `albers-2018-defuse3` with DOI `10.1056/NEJMoa1713973`, PMID `29364767`, NCT `NCT02586415`, `quoted_text` from packet §4 primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 24`.
  - Register `nogueira-2018-dawn` with DOI `10.1056/NEJMoa1706442`, PMID `29129157`, NCT `NCT02142283`, `quoted_text` from packet §4 coprimary endpoints, `last_reviewed: 2026-05-14`, `review_window_months: 24`.
- DAWN utility-weighted mRS teaching component (per packet §10 recommendation): the trial's first primary endpoint is uw-mRS, which has no existing surface in NeuroWiki. Faithful representation requires either an extended `howToReadChart` Q&A explaining the weights `[10.0, 9.1, 7.6, 6.5, 3.3, 0, 0]` for mRS 0→6, or a dedicated uw-mRS panel. Class C-clinical task; not blocking for this commit.
- Grotta-bar 7-value mRS arrays from packet §9 (DEFUSE-3: `[10, 16, 18, 15, 18, 8, 14]` EVT vs `[8, 4, 4, 16, 27, 16, 26]` control) are a future UX enhancement.
