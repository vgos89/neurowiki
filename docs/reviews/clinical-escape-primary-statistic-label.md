# Clinical review — ESCAPE primary-statistic labeling

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-08

## Scope
- Claims touched: `escape-primary-result` (forward-tag on `howToInterpret.proves`); adjacent `escape-bedside-pearl` reviewed, unchanged.
- Citations affected: none (no citation-registry change; provenance Goyal NEJM 2015 p.1024 + Table 2 p.1025 + SAP p.1022 via packet Task C).
- Surfaces changed: structured data in `src/data/` — `stats.effectSize` (value unchanged; `info` field + guard comment added), chart Q&A string (`howToReadChart[1].answer`), interpretation string (`howToInterpret.proves`).
- Evidence-verifier packet: `docs/evidence-packets/2026-06-08-trial-pilot-arm-enrichment.md` (Task C).
- Trial-statistician report: not separately commissioned; statistical soundness assessed inline under the trial-statistics skill.

## Semantic validity
Label text is accurate. The displayed primary effect (common OR 2.6, 95% CI 1.7–3.8, P<0.001) is unchanged and correctly annotated as the unadjusted, pre-specified primary analysis (ITT). The adjusted common OR 3.1 (95% CI 2.0–4.7) is correctly recorded as a secondary/sensitivity estimate in all three edited surfaces, with no reversal of primary↔secondary anywhere. No drift in any never-drift category — the edit adds precision (primary vs secondary) without upgrading recommendation strength, certainty, or any qualifier. A guard comment hard-blocks the historically-recurring 2.6→3.1 inversion.

## Citation accuracy
Annotations match packet Task C verbatim sourcing: SAP p.1022 ("The primary analysis was unadjusted… in the ITT population"); primary-outcome text p.1024 (cOR 2.6, 95% CI 1.7–3.8, P<0.001); Table 2 p.1025 (unadjusted/primary 2.6; adjusted/secondary 3.1, 2.0–4.7). No citation `quoted_text` altered.

## Editorial / expert context
Not applicable — no new trial entry in this PR. Labeling clarification of a long-shipped record (no primary result, endpoint, framework, or guideline-class field changed); mandatory-block #8 not triggered.

## Freshness
n/a — no citation-registry entry created or refreshed; no `last_reviewed` touched.

## Rationale
Value-preserving labeling edit. `stats.effectSize.value 'OR 2.6'` and `ordinalStats { commonOR 2.6, ciLow 1.7, ciHigh 3.8 }` are byte-for-byte unchanged, so the rendered chart and headline are unaffected; the only additions are an `info` annotation, a protective guard comment, and parallel secondary-estimate annotations in the two interpretation strings — all faithful to packet Task C and Goyal 2015. No mandatory-block condition met.

## Required follow-ups
- Carry forward (NOT required here): the separately-flagged **ECASS III common-OR / recommendation-class drift** (page cites §4.6.3 COR 2a; repo's own newer entries + 2026 guideline put ≤4.5h thrombolysis at §4.6.2 COR 1). Needs the 2026 AHA/ASA §4.6.2/§4.6.3 recommendation tables to disambiguate, then a Class E decision — owner-routed.
- Out of scope, noted only: pre-existing `mrsDistribution` provisional-placeholder flag on `escape-trial` remains deferred to the W5.2 citation-registry milestone.
