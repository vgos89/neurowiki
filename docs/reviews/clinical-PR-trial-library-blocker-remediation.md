# Clinical review — trial-library BLOCKER remediation (15 findings)

**Decision:** approve-with-conditions (all conditions cleared before commit; see Condition status)
**Reviewer:** clinical-reviewer, three fresh-context rounds
**Date:** 2026-07-23

## Scope
- **Claims touched:** `hemicraniectomy-synthesis`, `ich-surgery-synthesis`, `crao-management` synthesis, plus the trial records listed below.
- **Citations affected:** `hofmeijer-hamlet-2009` (quoted_text + pmid corrected; `last_reviewed` deliberately NOT refreshed), `pradilla-enrich-2024` (quoted_text + pmid corrected, `last_reviewed` refreshed with documented rationale), `vahedi-pooled-decimal-destiny-hamlet-2007` (consulted for conflict check, unchanged).
- **Surfaces changed:** `src/data/trialData.ts`, `src/data/clinicalSynthesesByQuestion.ts`, `src/lib/citations/registry.ts`, `src/pages/trials/TrialPageNew.tsx`, `src/data/guideContent.ts`, `src/seo/schema.ts`, `src/data/trialCatalogMeta.ts`, `src/data/trialListData.cardmeta.generated.ts` (regenerated).
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-23-trial-library-blocker-remediation.md`
- **Source audit:** `docs/reviews/audit-trial-library-semantic-2026-07-23.md`

## Method
The audit produced 175 verified findings; V approved remediating the 15 BLOCKER (patient-facing) items. Per §5 rule 6 the audit was treated as a hypothesis list: each of the 13 trial units was independently re-verified against the PRIMARY published paper by a separate evidence-verifier instructed to report the repo as correct if that was the truth. **13 of 13 confirmed the repo was wrong; zero audit false positives.**

## Corrections verified faithful
| Trial | Correction |
|---|---|
| DIRECT-MT | mRS 0-2 at 90 d 36.4% vs 36.8% (was 62.0/58.5, wrong by ~25 points and inventing an advantage). NI margin/bound 0.80/0.81 verified already correct and unchanged. |
| SKIP | margin OR 0.74 (was 0.75); one-sided 97.5% CI lower bound 0.63 (was a fabricated two-sided 0.72-1.64); "OR" not "common OR" (binary primary). |
| SWIFT DIRECT | margin -12 pp (was -10); CI -16.6 to +2.1 (was -14.0 to -0.6). The corrected CI crosses zero, so all assertions that the interval favoured bridging were removed. |
| DIRECT-SAFE | margin -10 pp; CI -16.0 to +5.9; estimate relabelled intention-to-treat (was "adjusted"). |
| COMPASS | margin 0.15 (was wrong by >2x); unsourced statistical-analysis-plan sentence removed. |
| CHOICE | mRS 0-2 corrected off the unsourced 83.6%. |
| DEFUSE 3 | pre-stroke mRS ceiling 0-2 in all five places (0-1 is DAWN's criterion; clinically actionable, could have wrongly excluded an eligible thrombectomy candidate). |
| ELAN | major-stroke DOAC start timing corrected (6-24 h was the randomization window, not the start time). |
| AcT | CI -2.6 to +6.9 (was -1.4 to +5.6) in the record and the chart. |
| ARAMIS | risk difference and CI aligned to published; chart bounds corrected. |
| HAMLET | the two headline results were SWAPPED, inverting the conclusion; ARR 0% (95% CI -21 to 21) restored to the primary poor-outcome endpoint and ARR 38% (95% CI 15 to 60) to case fatality. pmid corrected (had resolved to a Feigin review). |
| THEIA | fabricated trial-conduct claim and fabricated number removed; the trial was not stopped early. |
| ENRICH | no surface now recommends or implies benefit for anterior basal-ganglia ICH, the stratum stopped for futility. Fabricated frequentist "p=0.04" replaced with the Bayesian credible interval and posterior probability. pmid corrected (had resolved to a JAMA Dermatology trial). First author corrected (was MISTIE-III's). |

Additionally, the DIRECT-MT primary-outcome chart was being fed `efficacyResults` (79.4% / 84.5%, which are **overall successful reperfusion** rates) under an "mRS 0-2 at 90 Days" label, a ~43-point overstatement on the most prominent element of the page. It now plots the published functional-independence rates and the caption states that the non-inferiority test applies to the ordinal shift, not the dichotomy.

## Review history: the remediation twice introduced new defects
This is recorded because it is the central lesson, not an incidental detail.

- **Round 1 — block.** The fixer had been scoped to 4 files while the same wrong values also lived on derived and public surfaces (`trialCatalogMeta.ts`, `guideContent.ts`, `seo/schema.ts`, and the generated card-meta mirror), leaving the library half-corrected and self-contradicting. The public structured-data answer still claimed ENRICH benefit for the futility-stopped stratum.
- **Round 2 — block.** The fix itself introduced two new defects of the class it existed to remove: an unapproved sentence appended to the HAMLET citation carrying pooled figures that were internally impossible (a subgroup CI narrower than the parent trial's), misattributed (one trial's subgroup merged with a pooled result), and contradicting another entry in the same registry. Separately, an NNT shipped without the validity disclosure every other ENRICH surface carries.
- **Round 3 — block.** The hand-written repair of the above drifted on certainty ("showed a reduction" where the verified CI touches zero) and on analysis unit (a pooled three-trial meta-analysis described as HAMLET's own subgroup). Separately, a `last_reviewed` refresh asserted "no newer evidence supersedes" while the accompanying packet recorded an unreviewed follow-up study and an unconfirmable statistic, i.e. the certification claimed more than the work supported.
- **Round 4 — approve-with-conditions.** Both blocks resolved; four documentation-tier conditions, all cleared below.

**Governance conclusion:** correcting clinical content is itself clinical authoring, and carries the same fabrication risk as original authoring. Fresh-context adversarial review is load-bearing at every round, including on hand-written orchestrator edits. The mechanical gates (claims registry, freshness window, humanizer) passed on every one of these defects; they verify that a citation exists, never that a sentence matches what its source says. This is §13.1 operating exactly as documented.

## Freshness
`hofmeijer-hamlet-2009` **deliberately NOT refreshed**, held at 2026-05-23 with the corrected quoted_text and pmid retained, because §13.6 is incomplete: the case-fatality `P=0.002` rendered on four surfaces could not be confirmed (full text 403), the 3-year follow-up (PMID 23868265) is unreviewed, and the post-publication correspondence (PMID 19539229) plus reply are unread. Tracked as `blocked:awaiting-clinical-review`. `pradilla-enrich-2024` refreshed to 2026-07-23 with ESO 2025 recorded as considered-and-not-incorporated with rationale and a follow-up task.

## Condition status (all cleared before commit)
- **C1 CLEARED:** HAMLET sentence 3 now distinguishes the 2007 Vahedi pooled figures (n=93, held in the sibling record) from the HAMLET 2009 pooled figures, so a future auditor is not sent to the wrong record.
- **C2 CLEARED:** the third open §13.6 step-5 item (Mitchell/Gregson correspondence PMID 19539229 and reply) added to both the inline rationale and TASKS.md, with the unretrieved §8a editorial noted for any future full re-review.
- **C3 CLEARED:** the packet's limits block now carries every material limit that was previously body-only, including the pre-existing `aha-asa-2026-4.7.4` "COR 2b, LOE B-R per CHOICE" assertion that could not be confirmed against the in-repo guideline extract. Tracked as its own task.
- **C4 CLEARED:** this artifact.

## Required follow-ups (tracked in TASKS.md)
- `trial-library-audit-remaining`: 160 findings remain (52 HIGH, 84 MEDIUM, 24 LOW). Re-verify each against the primary paper before editing; batch by trial so all fields of a record are corrected together.
- `hamlet-citation-13.6-completion`: three open items before the date may be refreshed.
- `aha-2026-4.7.4-strength-unconfirmed`: recommendation-strength assertion standing on unconfirmed evidence.
- `compass-directsafe-unsourced-values`: COMPASS first-pass reperfusion possibly direction-inverted (material), COMPASS 90%-vs-95% CI label, DIRECT-SAFE 61.4% unsourced, ENRICH ESO 2025 retrieval.
