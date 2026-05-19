# Clinical review — NIHSS per-score plain-English labels

**Decision:** approve
**Reviewer:** clinical-reviewer (model: opus-4.7)
**Date:** 2026-05-19

## Scope
- Claims touched: NIHSS per-item scoring labels (56 new `plainOptions` entries across 15 items: 1a, 1b, 1c, 2, 3, 4, 5a, 5b, 6a, 6b, 7, 8, 9, 10, 11). Paraphrase of on-file `detailedInfo` rubric — no new claim IDs introduced.
- Citations affected: none new. Source is the standard NIH Stroke Scale rubric already present in `detailedInfo` strings on each item. No `last_reviewed` field change.
- Surfaces changed: structured data in `src/utils/nihssShortcuts.ts` (`plainOptions` field on `NihssItemDef`). §13.3 category: structured data in `src/` consumed by calculator UI.
- Evidence-verifier packet: not applicable (paraphrase pass, no trial/statistics surface).
- Trial-statistician report: not applicable.

## Semantic validity

Verified all 56 labels against the matching `detailedInfo` rubric string.

- Score-mapping fidelity confirmed: `plainOptions[i].value` matches `rapidOptions[i].value` on every item; option count per item unchanged; ordering 0→max preserved; item 10 UN value `9` preserved on both option arrays.
- Items 1a/1b/1c/2/3/4/5a/5b/6a/6b/7/10 — paraphrase confirmed clinically faithful. The 10-second (arm) vs 5-second (leg) distinction is preserved in score 0 plain labels.
- Item 7 — additional rubric clauses ("score only if out of proportion to weakness", "score 0 if paralyzed") are not duplicated into the brief button label. Acceptable: preserved in `detailedInfo`, `pearl`, and `plainEnglish`, and operationally enforced by `getItemWarning` (alerts on Motor=4 + Ataxia>0).
- Item 8 score 2 (flagged) — "or" construction "No feeling on one side, or both sides numb" preserves both clinical scenarios in the rubric ("not aware of touch" and "bilateral loss"). Both scenarios still map to score 2. No drift.
- Item 9 score 1 (flagged) — "Words come out, but some are wrong or missing" simplifies "loss of fluency/comprehension but ideas conveyed." The score 1 vs score 2 differentiation (ideas conveyed vs inference needed) is operationally preserved by contrast against score 2's plain text "Only bits of speech, you have to guess." Full comprehension framing is preserved in `plainEnglish`. No drift in score boundary.
- Item 11 score 1 (flagged) — "Ignores one side when both are tested at once" captures the operational test signature (double simultaneous stimulation) that defines score 1. The modality list (visual/tactile/spatial) is preserved in `detailedInfo` and the testing guidance in `plainEnglish`. The brief label is sufficient at the button surface because the score boundary is defined by the test, not the modality. No drift.

No paraphrase introduces a new threshold, contraindication, recommendation, or population qualifier.

## Citation accuracy

No new citations introduced. The standard NIH Stroke Scale rubric is the de facto source and is already on file in `detailedInfo` for each item. Paraphrase preserves the rubric's clinical meaning across all 15 items. No section/version drift.

## Freshness

Not applicable — no citation record touched. NIHSS rubric itself is a stable calculator (§13.7 24-month window for scoring formulas); existing `detailedInfo` strings are unchanged.

## Rationale

This is a brevity layer over an already-on-file rubric. The plain-English labels paraphrase each rubric clause into a 4–10 word bedside button label without adding criteria, shifting thresholds, or changing score boundaries. The three flagged items (8 score 2, 9 score 1, 11 score 1) compress secondary detail but preserve the score-defining clinical signature; complementary detail remains accessible in `detailedInfo` and `plainEnglish` blocks already shown to the user, and `getItemWarning` continues to enforce cross-item consistency rules. Voice check passes (no em-dashes, no banned signal phrases, all labels within length budget). Score-to-meaning mapping verified identical to `rapidOptions` on every item including UN=9 on item 10.

## Required follow-ups

- None blocking. Suggest a one-line code comment near `plainOptions` definition stating "paraphrase of `detailedInfo` rubric — score boundaries must remain identical to `rapidOptions`" so future edits don't drift either array. Non-blocking, can be in this PR or a follow-up.
