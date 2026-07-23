# Clinical review — PFO closure history (Phase 1, cryptogenic-stroke question)

**Decision:** approve
**Reviewer:** clinical-reviewer (fresh-context subagent, this session)
**Date:** 2026-07-23

## Scope
- **Claims touched:** none created or edited. Surfaced via the question's `trialIds` (all pre-existing and previously reviewed): `closure-i-pfo-2012`, `pc-trial-pfo-2013`, `respect-original-pfo-2013`, `defense-pfo-2018`. Synthesis claim `pfo-closure-cryptogenic-synthesis` unchanged.
- **Citations affected:** none changed. Confirmed still resolvable: `furlan-closure-i-2012`, `meier-pc-trial-2013`, `carroll-respect-original-2013`, `lee-defense-pfo-2018`.
- **Surfaces changed:** structured data in `src/data/trial-questions.ts` — the `pfo-closure-cryptogenic` object only. Rendered effect: the question-card `meta`/eyebrow string, the `trialCount` badge (3 → 7), and the now-visible set of 7 trial cards on `/trials/q/pfo-closure-cryptogenic`. No trial record, statistic, display archetype, or citation created/edited.
- **Evidence-verifier packet:** not applicable (no new evidence; the four attached trials were verified when first authored).
- **Trial-statistician report:** not applicable (no statistics created or edited).

## Semantic validity
1. **Trial-set completeness & correctness — PASS.** The seven attached trials are exactly the canonical landmark PFO-closure RCTs for this question: CLOSURE-I (2012), PC (2013), RESPECT original (2013), CLOSE (2017), REDUCE (2017), RESPECT long-term (2017), DEFENSE-PFO (2018). No trial that does not belong; no core closure RCT missing. Pooled/PASCAL, migraine, and anticoagulation-vs-antiplatelet trials are deliberately deferred to later phases. Each newly-attached record matches its label, device, population, result, and headline stats against `trialData.ts`.
2. **Ordering — PASS.** Strictly chronological (2012 → 2013 → 2013 → 2017 → 2017 → 2017 → 2018); defensible arc (early ITT-negative → positive 2017 cluster → DEFENSE-PFO confirmation). `respect-original-trial` (2013, ITT not met) and `respect-trial` (2017 long-term, positive) shown as two cards of one cohort is acceptable and clearly disambiguated by title and inline comments; the conversion story is pedagogically valuable.
3. **`meta` string accuracy — PASS.** "From the early trials that missed their primary endpoint (CLOSURE-I, PC, RESPECT 2013) to the positive 2017 cluster and DEFENSE-PFO; AF excess is the trade-off" is clinically accurate: all three named trials missed their primary ITT endpoint; the 2017 cluster and DEFENSE-PFO were positive; AF/flutter excess is the central safety trade-off (CLOSURE-I 5.7% vs 0.7%, REDUCE 6.6% vs 0.4%, CLOSE 4.6%, DEFENSE-PFO 3.3%). Humanizer-compliant (semicolon, no em-dash). The reviewer's optional refinement ("missed their primary endpoint" over "negative trials," to mirror the NEUTRAL label on original RESPECT) was adopted in the shipped string.
4. **Consistency with existing synthesis — PASS.** `clinicalSynthesesByQuestion.ts` (`pfo-closure-cryptogenic`) discusses all seven by name and frames the same negative→positive arc with AF as the trade-off under the 2021 AHA/ASA Secondary Prevention Guideline (Class IIa, Level B-R). The now-visible 7-trial set matches the written guide exactly; no conflict smoothed over.

## Editorial / expert context
Not applicable — no new trial entry in this change (question-page wiring of pre-existing, previously-reviewed records).

## Citation accuracy
No citations changed. Rigor check performed anyway: all four wired claims resolve in `claims.ts`; their `citation_ids` (`furlan-closure-i-2012`, `meier-pc-trial-2013`, `carroll-respect-original-2013`, `lee-defense-pfo-2018`) exist in `registry.ts`. No dangling references. No `last_reviewed` touched.

## Freshness
Unchanged — no `last_reviewed` dates modified; no citation entered or exited its review window as a result of this change.

## Rationale
Low-risk question-page wiring that surfaces four fully-detailed, previously-reviewed PFO-closure records plus a one-line navigational `meta` summary and a corrected `trialCount`. The seven trials are the complete and correct landmark set for "PFO closure for cryptogenic stroke?"; chronological ordering tells an accurate negative-to-positive story; the same-cohort RESPECT two-card design is clearly disambiguated; the `meta` string is clinically accurate and consistent with the already-approved synthesis that names all seven. All eight mandatory-block conditions were checked and none apply.

## Required follow-ups
- none (the optional precision refinement was applied in the shipped string).
