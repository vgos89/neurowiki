# Clinical review — PR aspects-cor-2a-correction (pre-execution gate)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-22

## Scope
- Claims touched: `aspects-evt-eligibility-2026` (new)
- Citations affected: `aha-asa-2026-4.7.2` (quoted_text refresh, last_reviewed bump). New claim also cites `select2-trial-2023`, `angel-aspect-trial-2023`, `tension-trial-2023`, `laste-trial-2024` per Condition 2 option (a).
- Surfaces changed: ASPECTS interpretation strings returned from `getScoreInfo` in `src/pages/AspectScoreCalculator.tsx` (3–5 and 0–2 strata); citation registry entry; claims registry entry. Tagging mechanism: `data-claim` JSX attribute (Phase 1) on the rendered element, conditionally applied only to the 3–5 and 0–2 branches.
- Evidence-verifier packet: not applicable — guideline-text correction; no new trial entry.
- Trial-statistician report: not applicable — no statistics displayed.

## Semantic validity

Source verbatim confirmed against `src/data/aha2026StrokeGuideline.ts` lines 448–473. The new `aha-asa-2026-4.7.2` `quoted_text` is a faithful concatenation of the two row `text` fields (3–5 row line 453 and 0–2 row line 471), with COR/LOE labels appended verbatim. Pass.

Never-drift category audit on the proposed interpretation strings:

1. **Recommendation strength.** 3–5 stratum: source "EVT should be used" (COR 1) → string "EVT recommended" with adjacent COR 1 / LOE A label. 0–2 stratum: source "EVT can reasonably be considered" (COR 2a) → string "EVT can reasonably be considered" verbatim with adjacent COR 2a / LOE B-R label. Pass.
2. **Action verbs.** Both strings use guideline-canonical verbs ("recommended", "can reasonably be considered"). Pass.
3. **Qualifiers/gates.** Both strings carry all four mirror qualifiers (age <80, NIHSS ≥6, prestroke mRS 0–1, no significant mass effect) plus occlusion site (ICA/M1 anterior circulation) plus the correct time window. Pass — this is the central fix the audit demanded.
4. **Certainty markers.** 0–2 stratum keeps the derived "Outside these criteria, EVT is not routinely indicated; ASPECTS 0–2 carries a high futile-reperfusion risk in unselected patients" sentence with the antecedent explicitly anchored to "outside these criteria" per Condition 1. The inference is grounded and appropriately hedged. Pass.
5. **Temporal constraints.** 3–5: "6–24 hours from onset" verbatim. 0–2: "within 6 hours" verbatim. Pass.

## Citation accuracy

- `aha-asa-2026-4.7.2`: section 4.7.2 unchanged. New `quoted_text` is verbatim concatenation of mirror lines 453 and 471 with row-metadata COR/LOE labels appended. Title unchanged. Pass.
- `aspects-evt-eligibility-2026` claim: cites §4.7.2 + 4 large-core EVT trials. Trial-attribution sentence in the 3–5 string ("Supported by SELECT-2, ANGEL-ASPECT, TENSION, and LASTE") is now sourced via the citation_ids array per Condition 2 option (a). Pass.

## Editorial / expert context

Not applicable — no new trial entry in this PR. This is a guideline-text correction to an existing citation.

## Freshness

`aha-asa-2026-4.7.2` refresh to `last_reviewed: '2026-05-22'`. AHA/ASA 2026 is the current published version (March 2025 cut-off); 6-month freshness window per §13.7 → next review due 2026-11-22. §13.6 six-step checklist completed:
1. Source resolves — verified against in-repo mirror lines 448–473. Pass.
2. Guideline version current — AHA/ASA 2026 is current. Pass.
3. Dependent claims consistent — new `aspects-evt-eligibility-2026` is the only new mapping. Pass.
4. No wording drift — see semantic validity above; all three conditions addressed in the implementation diff.
5. Newer evidence considered — no post-March-2025 trial supersedes the COR 1 (3–5) or COR 2a (0–2) determinations. Pass.
6. Dual sign-off — medical-scientist authored; clinical-reviewer sign-off recorded here.

## Rationale

The fix carries all four mirror qualifiers in both strings, uses guideline-canonical recommendation verbs with adjacent COR/LOE labels, attaches the four foundational large-core EVT trial citations to source the trial-attribution sentence, and applies a conditional `data-claim` attribute scoped only to the 3–5 and 0–2 branches so the ≥6 and ≥8 branches are not falsely claimed by this citation. All three conditions from the pre-execution review (Condition 1 antecedent unambiguity, Condition 2 trial-citation attachment, Condition 3 scoped data-claim attribute) are addressed in the diff. Optional polish ("can reasonably be considered" verbatim) is also applied. Approve.

## Required follow-ups

- None blocking this PR. The calculator-wide "Class I / Class IIa" notation question (raised in the pre-execution review) remains an open follow-up for a future Class C-clinical harmonization task across all calculators; not scoped here.
