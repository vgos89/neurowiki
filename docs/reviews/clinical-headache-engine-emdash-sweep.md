# Clinical gate — headache engine em-dash sweep

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05
**Class:** C-clinical (punctuation-only humanizer pass on engine clinical prose; no logic/threshold/wording change). Product-owner-requested dedicated review pass.

## Scope
- File: `src/data/clinicHeadacheData.ts` (headache diagnostic engine). Authored by `content-writer` (humanizer skill); gated here.
- 61 em-dashes inside clinical prose string values (`description`, `teachPearl`, `teachWhenSelected`, `eyebrow`, and 3 indomethacin `label` fields) replaced with colon / period / comma. 47 em-dashes in code comments left exempt.

## Mechanical evidence (orchestrator-verified before this gate)
- Word-content diff (old HEAD vs new), punctuation+case normalized: **IDENTICAL** — zero words, numbers, doses, drug names, thresholds, or section references changed; only em-dash → colon/period/comma + sentence-split casing.
- En-dash ranges unchanged (34 → 34): "15–180 min", "4–72 h", "B–D", "2–30 min", "1–600 sec" untouched.
- 84/84 engine regression tests pass; tsc clean; check:claims pass; check:humanizer PASS on the file.
- Only this file changed (no overreach).

## Condition verification (clinical-reviewer)
- **Rendered teach pearls** (migraine, TTH, chronic-TTH, cluster, hemicrania-continua, NDPH, paroxysmal, sunct, chronic-migraine, vestibular): all read as clinically sound prose under the new punctuation. No em-dash→period/comma split altered a clinical relationship.
- **Load-bearing contrasts preserved:** the TTH "…NOT aggravated by routine activity, the inverse of migraine…" appositive (line 584) and the migraine-with-aura "the aura symptom, not headache-pain location" contrast (line 557) were both converted to **comma**, keeping the contrast clauses attached to their referents. Period-splits (e.g. hemicrania-continua "…diagnostic test." / "Without it, the diagnosis cannot be made"; NDPH onset/exclusion) fall cleanly between independent clinical statements.
- **Three indomethacin labels (344–346):** "Therapeutic dose tried: complete / partial / no response" read correctly with the colon; the complete/partial/no gradation still maps to the suppress-gate logic (only `indo-tried-complete` satisfies hc-D / ph-E).
- **Criterion descriptions** spot-checked across phenotypes (mig-A, tth-D, ctth-D, ph-B, sunct-C, cm-C): colon after the "ICHD-3 X.Y Z" reference reads correctly; criterion definitions unchanged.
- All 47 remaining em-dashes are code comments / JSDoc / section banners (exempt); zero in any rendered string value.

## Rationale
Punctuation-only sweep; word-content proven byte-identical and clinically confirmed to preserve meaning on every rendered surface. No never-drift category (strength, action verb, qualifier, certainty, temporal, dose) touched. Approved.
