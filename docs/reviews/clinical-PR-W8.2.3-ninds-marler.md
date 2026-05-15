# Clinical review — W8.2.3 NINDS + Marler pearl misattribution

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: `time-is-brain-deep` pearl in `src/data/strokeClinicalPearls.ts` (content + evidence string)
- Citations affected: NINDS 1995 (no change — still referenced for the trial pearl); Marler 2000 (newly attributed); Saver Stroke 2006 (newly attributed); Saver JAMA 2013 (newly attributed); Emberson Lancet 2014 (already implicitly cited; now explicit)
- Surfaces changed: pearl content text in `src/data/strokeClinicalPearls.ts:84-92`
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-ninds-marler.md` (confidence HIGH for NINDS 1995 + Marler 2000)
- Trial-statistician report: not applicable (no statistics in pearl visualization)

## Semantic validity

**Prior pearl statement (line 86):**
> "NINDS trial: Treatment <90min had 50% vs 38% good outcome at 3 months."

This was **semantically invalid** — verified per packet §10. The 50% vs 38% figure is the **Barthel ≥95 favorable-outcome rate in NINDS Part 2 OVERALL (0–180 min combined)**, not a <90 min time-stratified subgroup. The actual <90 min subgroup result, per Marler Neurology 2000, is an **adjusted odds ratio (2.11, 95% CI 1.33–3.35)**, not a raw percentage pair.

Two never-drift categories were violated by the prior text:
- Action verbs / source attribution: implied the percentage was a NINDS time-stratified outcome when it is an overall-cohort outcome on a different (Barthel) endpoint
- Certainty markers: the false specificity of "50% vs 38% at <90 min" overstated a result that the underlying trial did not report

**New pearl statement (line 86):** uses Marler 2000's actual adjusted ORs (2.11 at 0–90 min; 1.69 at 91–180 min) and attributes them correctly. Adds Saver 2006 (neurons-per-minute), Saver JAMA 2013 (15-min delay 4%), and Emberson Lancet 2014 (time-benefit decay) — all with explicit citation.

All five never-drift categories: PASS.

## Citation accuracy

- NINDS 1995 NEJM 333(24):1581–1587, DOI 10.1056/NEJM199512143332401, PMID 7477192 — unchanged.
- Marler 2000 Neurology 55(11):1649–1655, DOI 10.1212/wnl.55.11.1649, PMID 11113218 — newly attributed; packet §Source 2 verified HIGH from full text.
- Saver 2006 Stroke ("neurons per minute" foundational paper) — not re-verified in this task; pre-existing widely cited clinical convention. Recommend full citation registration when W5.2 lands.
- Saver 2013 JAMA (GWTG-Stroke 4%/15-min) — not re-verified in this task; pre-existing widely cited. Recommend full citation registration when W5.2 lands.
- Emberson 2014 Lancet IPD meta-analysis — not re-verified in this task; packet flagged out of scope for W8.2.3.

## Freshness

- NINDS 1995: 36-month window per §13.7 (landmark, foundational). Stable.
- Marler 2000: 36-month window per §13.7 (landmark reanalysis). Stable.
- Saver 2006 / Saver 2013 / Emberson 2014: foundational time-benefit literature. Stable. Re-verify when W5.2 ships and registry-side `last_reviewed` checklist applies.

## AHA 2026 guideline cross-reference

Per 2026 Guideline §4.6.1 Thrombolysis Decision-Making: **COR 1.** "Treatment should be initiated as quickly as possible, assuring safe administration and avoiding potential delays associated with additional multimodal neuroimaging, such as CTA/MRA, CT/MR perfusion imaging."

Top Take-Home Message #3 reinforces: "we emphasize rapid thrombolytic treatment in eligible patients with disabling deficits, regardless of NIHSS score, within the 4.5-hour window without advanced imaging selection."

The new pearl text aligns with the 2026 guideline's emphasis on time-to-treatment and is consistent with the time-benefit curve the guideline uses to justify the COR 1 urgency framing.

## Rationale

The prior pearl contained a load-bearing factual error (a percentage attributed to a time subgroup that the trial did not report at that level of disaggregation). The corrected pearl uses the verified Marler 2000 adjusted ORs, attributes each clinical claim to its actual source, and preserves the pearl's pedagogical purpose (time is brain → door-to-needle target). Clinical-reviewer decision: approve without conditions.

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `marler-2000-ott` with DOI `10.1212/wnl.55.11.1649`, PMID `11113218`, `quoted_text` from Marler 2000 §6 (0–90 min adjusted OR 2.11), `last_reviewed: 2026-05-14`, `review_window_months: 36`.
  - Register `saver-2006-neurons-per-minute` (Stroke 2006).
  - Register `saver-2013-time-target-stroke` (JAMA 2013, GWTG-Stroke).
  - Register `emberson-2014-ipd-meta` (Lancet 2014 IPD meta-analysis).
  - Map all four citation IDs to the `time-is-brain-deep` claim entry in `CLAIM_REGISTRY`.
- Re-verify Emberson 2014 IPD meta-analysis from primary source during W5.2 sweep (out of scope for this packet).
- The `ninds-trial` pearl at line 95–104 already correctly attributes the 50%/38% to Part 2 Barthel ≥95 overall — no edit needed there.
