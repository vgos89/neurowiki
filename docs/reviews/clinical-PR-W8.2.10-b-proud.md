# Clinical review — W8.2.10 B_PROUD

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator, acting from packet)
**Date:** 2026-05-14

## Scope
- Claims touched: B_PROUD trial entry in `src/data/trialData.ts`; new `designDisclaimer` field added to `TrialMetadata` interface
- Citations affected: Ebinger M, et al. JAMA 2021;325(5):454–466 (DOI 10.1001/jama.2020.26345, PMID 33528537, NCT03027453 — B-SPATIAL parent registry)
- Surfaces changed:
  - `TrialMetadata` interface — added optional `designDisclaimer?: { category, text, source? }` field per TRIALS_SPEC §1.6 schema. Data-only carrier; UI rendering is a separate ui-architect task. No existing trials populate the field.
  - B_PROUD: `doi` retained; `pmid` added (33528537); `clinicalTrialsId` added (NCT03027453 = B-SPATIAL parent registry); `primaryDesign: 'estimation-strategy'` added (closest fit in allowed list for quasi-experimental observational; documented choice)
  - `designDisclaimer` populated: category `quasi-experimental`, 216-char wording paraphrased from Ebinger 2021 Methods + Limitations
  - `trialDesign.type` rewritten to lead with "quasi-experimental" framing + MSU staffing detail
  - `trialDesign.timeline` corrected: "February 2017 to May 2019" → "February 1, 2017 to October 30, 2019 (final inclusion target reached May 8, 2019)" per packet §2
  - `clinicalContext` extended to flag association-not-causation
  - `calculations.nnt` REMOVED (was 43.5); `calculations.nntExplanation` rewritten with packet-mandated disclaimer per clinical-trial-audit skill (NNT not allowed for observational/quasi-experimental designs). NNT card now omits because `nnt` is undefined
  - `pearls` rewritten: leads with primary common OR 0.71 (95% CI 0.58–0.86, P<0.001); enumerates workflow gains with adjusted ORs; explicit quasi-experimental caveat; AHA/ASA 2026 §2.5 COR 1 verbatim wording; BEST-MSU companion-trial cross-reference
  - `source` corrected from "Ebinger M, et al. (JAMA 2020)" to "Ebinger M, et al. (JAMA 2021;325(5):454–466)" per packet §1 (accepted Dec 2020; published Feb 2021)
  - `applicability` block added: geography (Berlin daytime-only), six population/generalizability exclusions per packet §8 limitations
- Evidence-verifier packet: `docs/evidence-packets/2026-05-14-b-proud.md` (confidence HIGH; full PDF verified end-to-end)
- Trial-statistician report: per packet §5 — `registry` framework per clinical-trial-audit skill taxonomy; mapped to `estimation-strategy` in repo's allowed list (closest fit; documented). NNT suppressed.

## Semantic validity

**LOAD-BEARING FIX 1 — NNT suppression.** Per packet §10.5 and clinical-trial-audit skill: NNT is not allowed for observational/`registry` studies. The prior value `nnt: 43.5` derived from the coprimary dichotomized outcome (80.3% vs 78.0%) would imply a causal absolute risk difference that the underlying study cannot support (allocation by MSU availability, not patient-level randomization; residual confounding cannot be excluded). The numeric value is now removed; the renderer guard at `TrialPageNew.tsx:566` (`nnt != null && !suppressNNT`) ensures the NNT card is omitted. Disclaimer added to `nntExplanation` for any future surface that consumes the prose.

**LOAD-BEARING FIX 2 — Design-quality disclaimer.** Per packet §10.2 and TRIALS_SPEC §1.6: B_PROUD's allocation mechanism (MSU availability) constitutes quasi-experimental design and triggers the §1.6 amber callout. The disclaimer wording (216 chars, within the 220-char spec limit) is paraphrased from Ebinger 2021's own Methods + Limitations sections; `source` pointer documents the paraphrase. Schema field added to `TrialMetadata`; UI rendering will be a separate ui-architect task.

**Source year correction.** Repo said "(JAMA 2020)" — accepted Dec 2020 but published Feb 2021. Corrected to "(JAMA 2021;325(5):454–466)" per packet §1.

**Enrollment timeline correction.** Repo said "February 2017 to May 2019". Per packet §2: "February 1, 2017 to October 30, 2019 (final inclusion criteria target reached May 8, 2019)". Both dates retained for clarity.

**Primary design framework.** Per packet §5: `registry` is the best-fit framework code in clinical-trial-audit taxonomy. Repo's allowed list (`primaryDesign` enum) does not include `registry`; closest match is `estimation-strategy` ("exploratory estimation design not formally powered for NI or superiority"). I chose `estimation-strategy` to engage the existing NNT-suppression behavior in the renderer; `primaryResult` left unset per the type comment ("estimation-strategy → leave both null"). A future schema enhancement could add `quasi-experimental` or `registry` as explicit primaryDesign values; not blocking.

**doesNotProve framing.** Per packet §10.3: the `doesNotProve` framing must lead with the design limitation. Repo previously had no `applicability` block at all. New `applicability.populationExclusions[0]` reads: "Allocation was by MSU availability, NOT patient-level randomization — association rather than causation. Treatment effect may include unmeasured site-level confounding despite multivariable adjustment." Five additional exclusions follow with Berlin specificity, daytime-only hours, stroke-mimic exclusion, low-severity cohort, and workflow-vs-effect-estimate distinction.

**Pearl rewrite.** Prior pearls were factually correct but didn't lead with the primary statistic and didn't carry the AHA 2026 §2.5 COR 1 verbatim wording. New pearls lead with common OR 0.71 (95% CI 0.58–0.86, P<0.001), enumerate the workflow gains with adjusted ORs from packet §6, and include the verbatim 2026 guideline COR 1 wording for MSUs.

**Companion-trial cross-reference.** Added BEST-MSU pointer per packet §8 — same direction of effect, different allocation mechanism (alternating-week cluster vs MSU availability).

All five never-drift categories: PASS post-edit.

## Citation accuracy

- DOI 10.1001/jama.2020.26345 verified per packet.
- PMID 33528537 added.
- NCT03027453 (B-SPATIAL parent registry — note that B_PROUD is the prospective evaluation embedded within B-SPATIAL) added.
- Source string corrected to 2021.

## Freshness

- B_PROUD (JAMA 2021): 24-month window per §13.7 (landmark prehospital trial, stable result). `last_reviewed: 2026-05-14` upon W5.2.

## AHA 2026 guideline cross-reference

Per 2026 Guideline §2.5 Role of Mobile Stroke Units (per "What is New and of High Impact" table):

> **COR 1.** "In patients with suspected AIS, the use of MSUs over conventional EMS where available is recommended for the transport and management of thrombolytic-eligible patients to ensure the fastest achievable onset-to-treatment time and improve functional outcomes."

Top Take-Home Message #1 reinforces: "Mobile stroke units (MSUs) enable rapid identification and treatment of thrombolytic-eligible patients with acute ischemic stroke (AIS). Recent studies have highlighted the benefit of MSUs over conventional emergency medical services and, when available, the guideline now includes recommendations related to the implementation of MSUs, based on their safety and benefit."

B_PROUD + BEST-MSU + Kunz 2016 cohort are the evidence base supporting this COR 1. Pearl now includes the verbatim COR 1 wording.

## Rationale

The packet flagged three clinical-reviewer-grade concerns: (1) NNT 43.5 displayed for an observational design (not allowed per clinical-trial-audit), (2) absent §1.6 design-quality disclaimer for a quasi-experimental trial, (3) `doesNotProve` framing not leading with non-randomized allocation. All three now addressed. The schema-level addition of `designDisclaimer` enables this and future quasi-experimental / single-arm-vs-historical / stopped-early trials to carry the §1.6 callout data; UI implementation is a separate ui-architect task.

No efficacy direction, common OR, p-value, or guideline COR/LOE changed. The trial remains a positive observational study supporting MSU dispatch (AHA/ASA 2026 §2.5 COR 1).

## Required follow-ups

- When `src/lib/citations/registry.ts` ships (W5.2):
  - Register `ebinger-2021-bproud` with DOI `10.1001/jama.2020.26345`, PMID `33528537`, NCT `NCT03027453` (with note that this is the B-SPATIAL parent registry), `quoted_text` from packet §4 primary outcome, `last_reviewed: 2026-05-14`, `review_window_months: 24`.
- **ui-architect task (new):** implement TRIALS_SPEC §1.6 amber-callout rendering. The `designDisclaimer` field is now wired in the data type but no component reads it yet. Spec gives the exact HTML/Tailwind: `<aside class="border-l-2 border-amber-400 pl-3 mt-3 mb-6">...`. Class C task.
- **system-architect task (new):** consider adding `quasi-experimental` and/or `registry` as explicit `primaryDesign` enum values to better represent observational trials. Current B_PROUD uses `estimation-strategy` as closest fit; this drift is documented but is a future cleanup. Class D structural change; not blocking.
- TASKS.md W6.6.2 note (per packet): the prior task description mislabeled B_PROUD as a "Wingspan stent" study — housekeeping fix. Already noted in packet §1; address in next librarian sweep.
