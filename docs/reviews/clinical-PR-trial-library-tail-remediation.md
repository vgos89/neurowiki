# Clinical review — trial-library tail remediation (audit findings beyond the first 15)

**Decision:** approve-with-conditions (all conditions cleared before commit)
**Reviewer:** clinical-reviewer, six fresh-context rounds
**Date:** 2026-07-23

## Scope
- **Findings addressed:** 62 of the 160 non-BLOCKER audit findings were re-verified against primary sources; 57 confirmed wrong, **4 confirmed as audit false positives** (the repo was already correct), 133 corrections applied.
- **Surfaces changed:** `src/data/trialData.ts`, `src/data/clinicalSynthesesByQuestion.ts`, `src/data/guideContent.ts`, `src/data/strokeClinicalPearls.ts`, `src/data/trial-questions.ts`, `src/data/trialListData.ts`, `src/data/trialCatalogMeta.ts`, `src/data/trialListData.cardmeta.generated.ts` (regenerated), `src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`, `src/pages/trials/TrialPageNew.tsx`, `src/seo/schema.ts`, `src/components/trials/archetypes/DeltaBandChart.tsx`.
- **Evidence:** `docs/reviews/audit-trial-library-semantic-2026-07-23.md`; `docs/evidence-packets/decimal-2026-05-20.md`; `docs/evidence-packets/2026-07-23-trial-library-blocker-remediation.md`.

## Incomplete coverage, stated plainly
**98 of the 160 findings were never examined.** Eleven of twenty verification shards failed on API connection errors mid-run. Those findings remain open and are tracked in TASKS.md under `trial-library-audit-remaining`. Nothing in this change should be read as clearing them.

## Review history: six rounds, five of which found a newly-introduced defect
This is recorded because it is the governing lesson, not an incidental detail.

| Round | Outcome |
|---|---|
| 1 | **block** — fix scoped to the files the findings named while the same wrong values lived on derived and public surfaces (catalog cards, guide page, structured-data answer, generated mirror). |
| 2 | **block** — 11 blockers, several newly introduced: two fabricated statistics substituted for old ones, a fabricated CI left live on a chart whose prose had just disowned it, an unsupported stopping reason, Bayesian posteriors rendered in p-value slots. |
| 3 | **block** — the orchestrator's own hand-written repairs introduced a desynchronised endpoint pair (two arms compared across different mRS dichotomies) and a hedge that asserted a direction as fact while disclaiming its own evidence in the same sentence. |
| 4 | **block** — two named must-fixes executed on only one of the surfaces carrying the value; the identical Round-1 failure mode. |
| 5 | **approve-with-conditions** — both blockers cleared; three residuals including a missing terminal period newly introduced and propagated into a generated file. |
| 6 | conditions cleared; gates green. |

**Governance conclusion.** Bulk agent-driven correction of clinical prose carries a measurable defect-injection rate. Fresh-context adversarial review is the only control that caught any of it: the mechanical gates (claims registry, freshness window, humanizer, card-meta sync) passed on every one of these defects in every round, because they verify that metadata exists, never that a sentence matches what its source says. This is §13.1 operating exactly as written. **The two rounds in this program that produced no new defect were both single-topic and corrected every surface of that topic at once.** The remaining 98 findings should be worked trial-by-trial, not in a wide sweep.

## Representative corrections verified
- **DECIMAL** temporal window: an unsupported "30 to 35 hours" surgical window removed from every surface; randomization (within 24 h of onset) and surgery (within 6 h of randomization, within 30 h of onset) now distinguished consistently across nine surfaces, with the observed range labelled separately so a protocol deviation is not laundered into a permitted window.
- **COMPASS** first-pass reperfusion: the "68.9% vs 76.3%" pair, which the repo's own task list flags as possibly direction-inverted, removed from all four data surfaces plus the rendered banner, along with the directional implicature that survived in two rescue-crossover clauses. Confirmed figures (mortality 22% both arms; overall mTICI 2b-3 ~83% both arms) retained.
- **PATCH**: both efficacy arms now declare the same mRS dichotomy (an earlier revert had left them comparing mRS 3-6 against mRS 4-6), and the unsupportable "published dichotomy" attribution was softened pending sourcing.
- **DEVT / SKIP**: one-sided 97.5% bounds now labelled as such rather than as two-sided 95% CIs, with a tooltip explaining that an NI bound is compared with the margin, not with 1.0.
- **DAWN / ENRICH**: Bayesian posteriors moved out of the p-value and risk-ratio slots; the frequentist-CI tooltip no longer fires on a posterior.
- **Nine degenerate chart call sites** rendering "95% CI N/A-N/A" or "95% CI —–—" now suppress the row entirely. This also removed three U+2014 em-dashes that the humanizer hook cannot see (its 10-character length floor skips single-glyph strings).

## Shared-component safety
`DeltaBandChart` is used by ~90 callers. All four `intervalLabel` call sites were enumerated and each routes to the correct tooltip branch; a normal caller passing a two-sided CI and a p-value renders byte-identically to before. Placeholder strings are now treated as absent at the component so the degenerate-render class cannot recur at any call site.

## Never-drift and house style
No drift in recommendation strength, action verbs, qualifiers and gates, certainty markers, or temporal constraints across the changed strings. The COMPASS and PATCH edits move from unsourced assertion to explicit non-assertion, which is a certainty downgrade and the safe direction. No U+2014 entered any rendered string.

## Condition status (all cleared before commit)
- **C1 CLEARED** — residual directional clauses removed from the COMPASS howToReadChart and cautions surfaces.
- **C2 CLEARED** — missing terminal period restored and the generated card meta regenerated.
- **C3 CLEARED** — the surviving `p = N/A` placeholder blanked, and the component hardened to treat placeholder strings as absent.

## Required follow-ups (tracked in TASKS.md)
- `trial-library-audit-remaining`: **98 findings never examined**, plus the lower-severity tail. Work trial-by-trial.
- `compass-directsafe-unsourced-values`: confirm the COMPASS first-pass direction and the 95%-vs-90% CI label against Lancet 2019; source DIRECT-SAFE 61.4%.
- `patch-mrs-dichotomy-sourcing`: neither 72 nor 76 is sourced in-repo; the verifier must confirm whether 72 is a count (72/97) or a percentage.
- `decimal-pvalue-endpoint-corrections`: mortality P=0.001 vs the packet's P<0.0001; the primary is a survival-conditional composite rendered as a plain mRS threshold.
- `decimal-pmid-conflict`: `registry.ts` 17761921 vs packet 17690311.
- `deltabandchart-direction-awareness`: the component calls any difference under 2 points "negligible" with no direction awareness, so ENRICH (9.3% vs 18.0% mortality) and DEFENSE-PFO (0% vs 12.9%) both render "negligible" under large benefits; the band aria-label says "extra recoveries" on harm trials.
- `deltabandchart-effect-labels`: the "Risk ratio" prefix is hardcoded, so `Risk ratio aOR 2.05`, `Risk ratio ARR 52.8 pp`, `Risk ratio RD +7.7 pp` all render.
- `trialpage-duplicate-render-blocks`: eight trials have duplicate unreachable render blocks; for IST and CAST the **live** block is the degraded one while real intervals sit in the dead duplicate.
- `humanizer-short-string-gap`: `check-humanizer.mjs` skips strings under 10 characters, so a bare em-dash passes.
- `claims-hook-comment-annotations`: trial-record `/* claimId: … */` comments are not matched by `check-claims.ts`, whose data regex requires a quoted field; those IDs are absent from `CLAIM_REGISTRY` and COMPASS has no citation record at all. Trial clinical prose is an uncovered §13.3 claim surface.
- `aha2026-guideline-mirror-basilar`: `src/data/aha2026StrokeGuideline.ts` renders §4.7.3 as COR 1/B-R within 6 h plus COR 2a/B-R for 6-24 h, contradicting the PDF-verified packet and `registry.ts` (COR 1/LOE A within 24 h). It is described as a validation reference, so auditors keep deriving false positives from it.
