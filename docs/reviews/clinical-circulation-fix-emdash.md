# Clinical review — circulation corrections + em-dash cleanup

**Decision:** approve-with-conditions → **APPROVE (both conditions resolved, close-out 2026-06-09)**
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-09

> **Close-out (2026-06-09):** Both conditions resolved and re-gated (approve). (1) RESCUE BT verified anterior-circulation only against source (Qiu JAMA 2022 p.544–545; Sample Size Calculation explicitly excluded posterior circulation); the false `cautions` "includes posterior circulation" claim was corrected, so curated `inclusionCriteria` + `fullEligibility` + `cautions` now all agree (anterior-only). RESCUE BT result/sICH-harm message intact. (2) All em-dashes removed from `armDetails` prose (content-writer 19 + medical-scientist 3 + THRACE note 1 = 23 total; grep confirms zero remain). MR CLEAN-NO IV correction intact. Open (non-blocking): ESCAPE-NA1 circulation needs separate source verification; lower-severity parked items (RESCUE BT NIHSS floor, SKIP mRS, SELECT2 NIHSS-floor).

## Scope
- Change set A: curated `inclusionCriteria` circulation corrections on `mr-clean-no-iv-trial` + `rescue-bt-trial` ("anterior or posterior" → anterior-only).
- Change set B: em-dash → punctuation cleanup (humanizer skill, content-writer) across `armDetails` prose on pilot + EVT trials (~19 edits).
- Surfaces: structured data in `src/data/trialData.ts`. No citation records, stats, or `last_reviewed` touched.

## Semantic validity
**Change A — MR CLEAN-NO IV: ACCURATE.** Corrected curated text `'Anterior circulation LVO (intracranial ICA, M1, or proximal M2)'` matches the trial's own `fullEligibility.inclusion` (anterior circulation: ICA / M1 / proximal M2) and its `howToInterpret`/`bottomLineSummary`. Original "anterior or posterior" was a genuine error. No over-correction. Internally consistent. ✓

**Change A — RESCUE BT: correction matches `fullEligibility` but EXPOSES a pre-existing intra-record contradiction (CONDITION 1).** Corrected curated text + `fullEligibility` say anterior-only (ICA/M1/M2). But the UNTOUCHED `howToInterpret.cautions` (line ~4170) says the "population includes posterior circulation and broader LVO definitions." These two surfaces now make mutually exclusive population claims (never-drift category: qualifiers/gates). The publication main-text inclusion (ICA/M1/M2) and two independent prior reads point to anterior-only — making `cautions` the probable error — but this must be VERIFIED against source (Qiu JAMA 2022 / ChiCTR-IOR-17014167), not assumed. Must reconcile before the record is clean.

**Change B — em-dash cleanup: punctuation-only on the sampled surfaces; NO clinical drift.** Spot-checked DAWN `agent`, ANGEL-ASPECT/BAOCHE `coInterventions`, SWIFT DIRECT/ESCAPE: all numbers, doses, %, device names, NCTs, page cites preserved; en-dash numeric ranges intact; `fullEligibility`/curated/pre-existing prose untouched. ✓

## Citation accuracy
LeCouffe NEJM 2021 (MR CLEAN-NO IV) + Qiu JAMA 2022 (RESCUE BT) `fullEligibility` provenance intact; corrected curated text supported by each `fullEligibility.inclusion` quote. No citation record modified.

## Editorial / expert context (§8)
Not applicable — copy correction + cosmetic punctuation; no new trial entry, no Class-E logic change.

## Freshness
No `last_reviewed` touched. `retrieved: 2026-06-08` current. Pass.

## Rationale
Both corrections are factually sound vs each trial's `fullEligibility`; em-dash pass is punctuation-only. No hard-block trigger. approve-with-conditions because the RESCUE BT correction exposes a live intra-record population contradiction that must be source-verified and reconciled, and two named `note` em-dashes were missed.

## Required follow-ups
1. **CONDITION — RESCUE BT population reconcile (medical-scientist + source):** verify enrolled territory (anterior-only vs anterior+posterior) against Qiu JAMA 2022 / the uploaded PDF; reconcile curated `inclusionCriteria`, `fullEligibility`, AND `howToInterpret.cautions` to agree. Probable: anterior-only → fix the `cautions` line. Do not assume.
2. **CONDITION (editorial, low-risk) — em-dash pass incomplete:** residual em-dashes in ESCAPE `note` (~1570) and DAWN `note` (~6315). Remove.
3. **ESCAPE-NA1 (`escape-na1-trial`, ~line 4841):** curated still "(anterior or posterior circulation)" — OUT of the 2-trial scope, NOT verified. ESCAPE-NA1 (Hill Lancet 2020, nerinetide-in-EVT) used broader LVO/imaging selection and may legitimately include posterior — verify against source before any change. Separate pass.
4. **Parked (lower severity):** RESCUE BT curated "NIHSS 4+" vs source; SKIP curated mRS 0–1 vs pub 0–2; SELECT2 NIHSS-floor omission.
