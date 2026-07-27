# Clinical review — PFO closure 2026 guide refresh (Phase 2)

**Decision:** approve-with-conditions (all 4 conditions cleared before commit; see Condition status)
**Reviewer:** clinical-reviewer (fresh-context re-review post-remediation)
**Date:** 2026-07-23

## Scope
- **Claims touched:** `pfo-closure-cryptogenic-synthesis`
- **Citations affected (15):** `aha-asa-2021-secondary-prevention-pfo`, `kent-scope-2021`, `saver-pascal-2026`, `furlan-closure-i-2012`, `meier-pc-trial-2013`, `carroll-respect-original-2013`, `mas-close-2017`, `sondergaard-reduce-2017`, `saver-respect-2017`, `lee-defense-pfo-2018`, `messe-reduce-mri-2021`, `vidal-cales-pfo-20yr-2026`, `bonnesen-pfo-danish-2024`, `zhang-biodegradable-pfo-2026`, `kent-pfo-review-2025` (7 newly registered)
- **Surfaces changed:** structured data in `src/data/` (DATA_SURFACE, `claimId` field); rendered via `ClinicalSynthesisCard` on `/trials/q/pfo-closure-cryptogenic`
- **Evidence-verifier packet:** `docs/evidence-packets/2026-07-23-pfo-closure-refresh.md`
- **Trial-statistician report:** none. Mandatory-block #7 second limb not triggered (no report exists to disagree). Packet authored with the trial-statistics skill; its guardrails (ni-margin-chart archetype, `nnt-not-appropriate`, observational disclaimers) are honored in the prose. A statistician pass is required before any dedicated trial page for Zhang 2026.

## Semantic validity
Fresh-context re-review post-remediation. All four prior BLOCK/HIGH/MEDIUM findings independently verified as resolved on disk, with no new inaccuracy introduced:

1. **DEFENSE-PFO "halted early for efficacy"** — removed from `bodyParagraphs[3]`. Replacement text ("subsequently confirmed benefit in patients with high-risk anatomy") is supported by `lee-defense-pfo-2018` quoted_text and the `trialData.ts` record (enrolled Sept 2011 to Oct 2017; no early termination recorded). No replacement assertion smuggled in.
2. **Fabricated cross-trial AF range** — replaced at `bodyParagraphs[4]`. Detected/resolved distinction explicitly checked for a number-swap: 83% DETECTED within 45 days, 59% RESOLVED within 2 weeks of onset, matching `trialData.ts` and the 2026-05-20 REDUCE evidence packet. Correctly attributed to REDUCE alone; no cross-trial generalization remains.
3. **Four precursor citations added** in chronological position.
4. **Class 2a re-attached to the joint decision process**, not the intervention alone (bottomLine). "is reasonable" preserves Class IIa strength; not upgraded to "is recommended"/"should".

**Never-drift categories** checked across all 7 paragraphs, headline, and bottomLine: recommendation strength (Class IIa preserved, no upgrade), action verbs (no upgrade to "treat"/"recommend"), qualifiers and gates (18 to 60, nonlacunar, undetermined cause, no competing etiology, high-risk anatomy, PASCAL category all preserved), certainty markers (association not laundered to causation; the SCOPE heterogeneity-of-treatment-effect caveat and the "awaiting prospective validation" limit are stated explicitly), temporal constraints (45-day, 2-week, 6-month, 24-month, 5.3y/5.9y/3.2y/20y all traced).

**Synthesis rules:** sources agree on strength, population, and direction. The 2021 guideline explicitly delegates to "the probability of a causal role for the PFO", so the PASCAL net-benefit stratification refines rather than contradicts it; no evidence conflict is smoothed over. The display gate on the 2026 category-level absolute percentages is honored on all three surfaces (prose, quoted_text, claim description).

## Citation accuracy
All 15 citation_ids resolve to entries in `registry.ts`. Every statistic in the prose was compared against its citation's quoted_text: SCOPE, the PASCAL distribution, Vidal-Calés, Bonnesen, Messé, and Zhang match verbatim in force. CLOSE/REDUCE/RESPECT numerics are not carried in those citations' quoted_text (conclusion sentences only) but trace to `trialData.ts` records and the 2026-05-20 evidence packets. Source resolution relies on the evidence packet's recorded verification.

## Editorial / expert context
Not a new-trial-entry PR; the packet header states this is a written-synthesis and citation-registry refresh, not a new trial page. Mandatory-block #8 does not fire. For the one genuinely new RCT (Source 6, Zhang 2026), packet §8 is complete and not silent: 8a editorial located but not retrieved (paywall; ACC Journal Scan framing recorded), 8b "none (too recent)", 8c "no guideline incorporates a biodegradable PFO device", 8d "none contradicting". Source 2 §8 also filled. The packet's pre-trial-page gate (NCT number + Circulation editorial) is mirrored in the registry comment and must be preserved.

## Freshness
All 15 within window per §13.7. `aha-asa-2021-secondary-prevention-pfo` 2026-05-23 (6mo) pass; `mas-close-2017`/`saver-respect-2017`/`sondergaard-reduce-2017` 2026-05-20 (36mo) pass; the four precursors 2026-05-23 (36mo) pass; the 7 new entries 2026-07-23 pass at their assigned windows. No §13.6 refresh required.

## Rationale
The remediation is sound: all four prior findings are genuinely fixed in the current text, the AF sentence is now correct in both figure and attribution, and the five hard constraints (no ESO PASCAL-guided-selection claim, no "0.47 per 100 person-years" on the Danish cohort, no NNT for the 7 new sources, biodegradable device bounded as an echocardiographic surrogate, no em-dash in rendered strings) all hold. The remaining defects were editorial rather than clinical: the removed DEFENSE-PFO assertion survived in two non-rendered code comments (one in the very file documenting its removal), a temporal anchor was dropped in a safety-narrative sentence, and a citation-count comment was stale. None changes what a clinician does for a given patient, and each fix was unambiguous and low-risk, hence approve-with-conditions rather than block. The comment residuals still had to be cleared: they are the mechanism by which a corrected claim gets re-authored.

**Note on provenance of the two BLOCKER defects:** both the fabricated AF range and the DEFENSE-PFO early-termination assertion were **pre-existing in committed, live text** and were carried forward into this refresh unchanged. They were not introduced by Phase 2. They were caught only by an adversarial fresh-context read; the mechanical gates (claims registry, freshness, humanizer) cannot detect a sentence that misstates what its source says. This is the §13.1 metadata-vs-semantic-validity gap operating exactly as documented.

## Condition status (all cleared before commit)
- **CONDITION 1 (blocking) — CLEARED:** `claims.ts` precursor block comment, "halted early for efficacy" replaced with "positive on the 2-year composite".
- **CONDITION 2 (blocking) — CLEARED:** `trial-questions.ts` `defense-pfo-trial` trailing comment, "stopped early for efficacy" replaced with "positive on the 2-year composite".
- **CONDITION 3 (blocking) — CLEARED:** `clinicalSynthesesByQuestion.ts`, restored "of onset" to the 2-week AF resolution figure.
- **CONDITION 4 (blocking) — CLEARED:** `claims.ts` "Citations (11)" updated to 15 with the precursor trials and DEFENSE-PFO added to the enumeration.

## Required follow-ups (non-blocking, parked to TASKS.md)
- `clinicalSynthesesByQuestion.ts` — attach the 24-month horizon to the REDUCE NNT ~28 figure (it is a 24-month KM-derived value, not a 3.2-year one).
- `clinicalSynthesesByQuestion.ts` — cite or soften "prolonged ECG monitoring must be completed before calling a stroke cryptogenic"; no registered quoted_text among the 15 covers cardiac monitoring. Direction is conservative, hence non-blocking.
- `clinicalSynthesesByQuestion.ts` — consider adding the RESPECT long-term exploratory / group-sequential-threshold caveat (P=0.046 vs threshold 0.043).
- **Pre-existing, outside this diff:** `trialData.ts` REDUCE `educationalContext` states REDUCE was "the strongest of the three 2017 trials", contradicting CLOSE (HR 0.03) and the synthesis's own text. Two rendered surfaces disagree; route to medical-scientist.
- `registry.ts` — consider an explicit `review_window_months` for the 2021 anchor guideline (§13.7 rapidly-evolving-area case).
- `ClinicalSynthesisCard.tsx` — with 15 citation chips, several render full long titles when a citation has no `section`. Cosmetic; route to ui-architect.
