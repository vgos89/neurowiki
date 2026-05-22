# Clinical review — PR pathway-ext-ivt-2026-05-22

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-22

## Scope
- Claims touched: Path A WAKE-UP eligibility (DWI-FLAIR ≤4.5h since recognition), Path B EXTEND/perfusion eligibility (4.5–9h or wake-up sleep-midpoint ≤9h, CTP core <70 mL, mismatch >10 mL, ratio >1.2), Path C TRACE-III (9–24h LVO ICA/M1/M2 no-EVT-feasible, COR 2b/B-R), TIMELESS-neutral handling, tenecteplase agent preference by path.
- Citations affected: WAKE-UP 2018 (PMID 30133737), EXTEND 2019, EPITHET, ECASS-4 EXTEND, TRACE-III 2024, TIMELESS 2024, THAWS 2021, AHA/ASA 2026 §4.6.3.
- Surfaces changed: §13.3 — static JSX result text, structured `details` strings, derived-language verdict composition, pearl content, trial-table cells.
- Evidence-verifier packet: medical-scientist verification 2026-05-22 (inline, pre-code).
- Trial-statistician report: EXTEND truncation-bias concern flagged (F2); TIMELESS ordinal-OR interpretation confirmed neutral.

## Semantic validity

Confirmed across all 10 medical-scientist items. Time-window decision tree faithful to source trials; the never-drift categories survive:

- **Recommendation strength:** Path A and Path B both 2a/B-R; Path C 2b/B-R with explicit SDM gate. No upgrade.
- **Action verbs:** "Eligible" verdict in Path C requires expertise gating and SDM — preserves *consider/offer* register, does not drift to *treat*.
- **Qualifiers and gates:** CTP thresholds (core <70 mL, mismatch >10 mL, ratio >1.2) preserved exactly. TRACE-III population restriction (ICA/M1/M2, no-EVT-feasible) preserved at L1067.
- **Certainty markers:** TIMELESS handled as neutral (ordinal OR 1.13, 95% CI crosses 1). Correct.
- **Temporal constraints:** ≤4.5h (Path A), 4.5–9h or sleep-midpoint ≤9h (Path B), 9–24h (Path C) — match source windows. No swaps.

## Citation accuracy

WAKE-UP, EXTEND, TRACE-III, TIMELESS PMIDs match canonical (per packet). AHA/ASA 2026 §4.6.3 mapping correct. No `quoted_text` drift identified at this pre-execution stage; clinical-reviewer will re-check post-implementation against `data-claim` tags before merge.

## Editorial / expert context

Not applicable — no new-trial entries. Existing trial citations already carry editorial context.

## Freshness

All affected citations within window per §13.7 (landmark trials: 36 months; AHA/ASA 2026 guideline: 6 months, current). No `last_reviewed` refresh required.

## Rationale

Algorithm is medically sound; never-drift categories survive scrutiny. Two flagged items rise to merge-blockers because they touch clinical safety (F1) and statistical certainty (F2) directly — §13.1 semantic-validity concerns the hook cannot catch. F1: an "Eligible" verdict that does not, on the same surface, remind the clinician that standard IVT contraindications must still be cleared is a confident-but-incomplete output. Routing to /guide/iv-tpa via NextStepsCard is not sufficient because the verdict can be read and acted on without that navigation. F2 is a one-line edit preventing an overstated effect-size claim from shipping. F4, F5, F7, F8 are editorial / boundary-setting items safe as follow-ups. F3 and F6 confirmed correct as-is.

## Required follow-ups

**Blocking — must land in this PR before merge:**

1. **F1 (BLOCKER):** On every "Eligible" verdict surface (Paths A, B, C), add explicit selection-only callout in `details` or as a sibling alert near the verdict. Suggested text: *"Late-window selection criteria met. Standard IV thrombolysis contraindications (BP >185/110, INR >1.7, platelets <100k, DOAC within window, recent surgery/ICH, active bleeding) must still be verified before administration — see IV tPA exclusions."*

2. **F2 (BLOCKER):** On the EXTEND pearl at L970, append truncation-bias caveat: *"EXTEND was stopped early after WAKE-UP published; effect size (NNT ≈17) may be overestimated."*

**Non-blocking — follow-ups in TASKS.md:**

3. **F4 (follow-up):** Rename `cor` field to `pathwayCor` in TRIALS table schema to disambiguate trial-evidence-weight vs. recommendation-contribution.

4. **F5 (follow-up):** Add inline note where Path B MRI mismatch criteria (L998) extends EXTEND's CTP thresholds to MRI. *"Threshold harmonized from EXTEND CTP criteria; EPITHET/ECASS-4 used different MRI mismatch definitions."*

5. **F8 (follow-up):** Document the wake-up-time = symptom-recognition-time default assumption in a pearl or `details` line.

**Confirmed acceptable as-is:**

6. **F7 (confirmed):** TIMELESS-neutral handling — surfacing `eligible: false` with `variant: 'warning'` and "EVT Preferred" when rapid EVT is planned is clinically correct. Not surfacing a bridging-TNK option for late-window LVO+EVT is defensible: TIMELESS was neutral and the 2026 guideline does not endorse routine bridging in this scenario.

**Re-review checkpoint:** post-implementation, before `/pr-ready`, clinical-reviewer must re-verify that F1 and F2 fixes preserve exact recommendation strength and certainty markers, and the new callout language does not drift (e.g., does not upgrade "verify exclusions" to "rule out exclusions").

## Blocking issues

F1 and F2 are merge-blockers — must land in same PR before any further clinical-content updates ship for this pathway.
