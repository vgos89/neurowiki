# Clinical review — W8.2.5 ATTENTION + BAOCHE

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: ATTENTION + BAOCHE entries in `src/data/trialData.ts`
- Citations affected:
  - ATTENTION — Tao C, et al. NEJM 2022;387(15):1361–1372 (DOI 10.1056/NEJMoa2206317, PMID 36239644, NCT04751708)
  - BAOCHE — Jovin TG, et al. NEJM 2022;387(15):1373–1384 (DOI 10.1056/NEJMoa2207576, PMID 36239645 inferred sequentially, NCT02737189)
- Surfaces changed:
  - `attention-trial.pmid` added
  - `attention-trial.applicability.populationExclusions` — reworded mRS 0–3 rationale per packet's "anticipated poor prognosis" framing; added Chinese-enrollment generalizability caveat
  - `attention-trial.pearls` — reworded to call out secondary-outcome NNT (mortality) with explicit label; added PC-ASPECTS selection criteria
  - `baoche-trial.pmid` added
  - `baoche-trial.applicability.populationExclusions` — added protocol-amendment disclosure + early-stopping caveat + Han Chinese population caveat + inclusion thresholds
  - `baoche-trial.trialDesign.timeline` corrected from "Enrolled 2020–2021" to "Enrolled Aug 2016 – Jun 2021 (stopped early Apr 2022)"
  - `baoche-trial.trialDesign.type` — added early-stopping line
  - `baoche-trial.pearls` — added protocol-amendment disclosure pearl; reframed mortality pearl to reflect non-significant CI; added imaging selection details; updated guideline cross-reference
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-attention-baoche.md` (confidence HIGH; both PDFs verified end-to-end)
- Trial-statistician report: not applicable beyond packet's NNT validity ruling (NNT valid for ATTENTION primary; NNT for BAOCHE primary valid but requires amendment disclosure)

## Semantic validity

**ATTENTION mRS 0–3 rationale (`populationExclusions[1]`).** Prior text said "mRS 0-2 is unrealistically strict for BAO" — directionally correct but loose and non-attributable. New text uses the paper's own framing ("anticipated poor prognosis"; mRS 3 as ambulatory-with-assistance, a patient-meaningful threshold for posterior circulation). This is a `never-drift` improvement on the qualifier category.

**ATTENTION mortality pearl.** Prior text said "NNT ~5.5 to prevent death" without flagging that mortality was a secondary outcome. Per `clinical-trial-audit` skill: NNT must be derived from the primary endpoint; secondary-outcome NNTs require explicit label. New pearl text labels it explicitly: "Derived NNT ~5.6 is from a secondary outcome (mortality) — display with explicit secondary-outcome label." Also adds the adjusted RR 0.66 (0.52–0.82) which gives the CI evidence the prior pearl omitted.

**BAOCHE timeline.** Prior repo text "Enrolled 2020-2021" was factually wrong — the trial enrolled Aug 2016 – Jun 2021 and was stopped early Apr 2022 for efficacy at planned interim. Corrected.

**BAOCHE protocol-amendment disclosure.** This is the load-bearing semantic addition. Per packet §2.4 and §2.6, BAOCHE's primary outcome was amended mid-trial (Feb 23, 2021, after 215 of ~217 patients enrolled, before unblinding) from mRS 0–4 to mRS 0–3. The original mRS 0–4 primary was NEGATIVE (RR 1.21, 95% CI 0.95–1.54 — CI crosses 1). The revised mRS 0–3 result is positive (RR 1.81, CI 1.26–2.60). Without disclosure of the amendment, the displayed result is cleaner than the underlying evidence supports — a clinical-reviewer-grade concern flagged in the packet. Disclosure now added to `populationExclusions` and `pearls`.

**BAOCHE mortality.** Prior pearl stated "31% in EVT vs 42% in Control" without specifying that the difference is not statistically significant (adjusted RR 0.75, 95% CI 0.54–1.04, CI crosses 1). Reframed to flag the non-significant CI and warn against claiming a generic mortality benefit for BAOCHE alone (vs ATTENTION, where mortality benefit IS significant).

**Early-stopping caveat.** BAOCHE was stopped early for efficacy at planned interim. Early-stopping trials systematically overestimate effect size (truncation bias). Disclosure added.

All five never-drift categories: PASS.

## Citation accuracy

- ATTENTION DOI/NCT match packet; PMID 36239644 newly added (verified per PubMed search snippet in packet).
- BAOCHE DOI/NCT match packet; PMID 36239645 inferred from sequential NEJM issue placement (PubMed reCAPTCHA blocked direct lookup; flagged for librarian on next `/audit-citations`).
- Source strings unchanged ("Tao et al. (NEJM 2022)" and "Jovin et al. (NEJM 2022)") — accurate.

## Freshness

- ATTENTION (NEJM 2022): 6-month window per §13.7 (current major guideline-changing trial). `last_reviewed: 2026-05-14` upon registry-side checklist completion (W5.2).
- BAOCHE (NEJM 2022): 6-month window. Same.

## AHA 2026 guideline cross-reference

Per 2026 Guideline §4.7.3 Posterior Circulation Stroke (per "What is New and of High Impact" table):

> **COR 1.** "In patients with AIS, with basilar artery occlusion, a baseline mRS score of 0 to 1, NIHSS score ≥10 at presentation, and PC-ASPECTS ≥6 (mild ischemic damage), EVT within 24 hours from onset of symptoms is recommended to achieve better functional outcome and reduce mortality."

ATTENTION + BAOCHE are the two trials backing this COR 1. Top Take-Home Message #7 reinforces: "strong recommendation for EVT in patients with basilar artery occlusion presenting within 24 hours of symptom onset and NIHSS score ≥10."

Repo BAOCHE pearl now correctly cross-references §4.7.3. ATTENTION pearl could be extended similarly in a future minor edit; not blocking.

## Rationale

ATTENTION's existing content was substantively correct against the packet; this brings the qualifier framing and secondary-outcome NNT labeling into compliance with `clinical-trial-audit` and `trial-statistics` skill rules.

BAOCHE had a load-bearing protocol amendment that the prior repo text did not disclose, and a wrong enrollment timeline. Both are now corrected. The clinical-reviewer-grade concern (BAOCHE NNT 4.5 displayed without amendment disclosure) is now addressed by surfacing the amendment in `populationExclusions[1]` and `pearls[2]`.

No NNT, p-value, or efficacy number changed — those were already correct per packet. The two trials remain Class IIa-equivalent positive trials in repo display; the additions are scientific context, not result modification.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `tao-2022-attention` with DOI `10.1056/NEJMoa2206317`, PMID `36239644`, NCT `NCT04751708`, `quoted_text` from packet §1.4 primary endpoint, `last_reviewed: 2026-05-14`, `review_window_months: 6`.
  - Register `jovin-2022-baoche` with DOI `10.1056/NEJMoa2207576`, PMID `36239645` (re-verify), NCT `NCT02737189`, `quoted_text` from packet §2.4 (with amendment note), `last_reviewed: 2026-05-14`, `review_window_months: 6`.
- Confirm BAOCHE PMID 36239645 via PubMed once reCAPTCHA cleared (low-stakes; DOI is authoritative).
- Consider Grotta-bar secondary visualization using the 7-value mRS arrays from packet §1.7 and §2.7. Defer to a future Class C-clinical schema enrichment task.
- Both trials are currently `binary-superiority` `bar-binary`; this is correct for the primary display. The packet's recommendation to also surface ordinal-shift secondary OR (2.87 ATTENTION; 2.64 BAOCHE) is a UX-side enhancement, not a clinical correction.
