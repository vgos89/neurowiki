# Clinical review — Wave 2 IVT schema enum (`primaryAnalysisType` / `secondaryAnalysisType`)

**Decision:** block
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-05-08

## Scope
- Claims touched: enum vocabulary for `primaryAnalysisType` and `secondaryAnalysisType` on `TrialMetadata`; 21 IVT trial assignments listed in the brief.
- Citations affected: none directly mutated in this review, but every IVT trial citation that backs `primaryAnalysisType` for the 21 trials is in the blast radius (NINDS, ECASS III, EXTEND, EAGLE, THAWS, TRACE-III, WAKE-UP, AcT, ARAMIS, ATTEST-2, NOR-TEST, NOR-TEST 2 Part A, PRISMS, PROST, PROST-2, RAISE, TASTE, TIMELESS, TRACE-2, TWIST, plus ORIGINAL).
- Surfaces changed: §13.3 "Structured data in `src/data/*.ts`" — the enum will resolve to display labels and/or render logic keys in trial cards, hub filters, and downstream computed strings. That makes every enum value a *claim surface* once it reaches a clinician's eye.

## Semantic validity

The enum mixes two orthogonal axes and that mixing is **not editorial — it is clinical**. A clinician reading "negative" on a trial card and "ordinal-shift" on the next card will reasonably assume these are values on the same axis. They are not.

Specific findings against the rubric:

**1. Action verb / framing drift (never-drift category 2).** `negative` is a *result* claim. `binary-superiority`, `ordinal-shift`, `noninferiority`, `bayesian-noninferiority` are *design* claims. `futility` is design-adjacent but in practice a *stopping/result* claim. `dose-harm` is a *result/safety* claim. A clinical decision-support tool that labels a trial with a single value drawn from this mixed set will, in some cases, hide the design. NOR-TEST was a non-inferiority design that did not meet its NI margin — labeling it `negative` silently drops the NI framing, which is the clinically load-bearing piece.

**2. Certainty / qualifier drift (never-drift categories 3 and 4).**
- **NOR-TEST** — published as a non-inferiority trial of tenecteplase 0.4 mg/kg vs alteplase; primary endpoint (mRS 0–1 at 3 months) did not meet the pre-specified non-inferiority margin. Coding it as `negative` (with no `noninferiority` anywhere) erases the NI framing a clinician needs to interpret the result. A reader sees "negative" and concludes "didn't work"; the actual clinical message is "did not establish non-inferiority at the tested dose," which is a different statement.
- **PRISMS** — terminated early for administrative/enrollment reasons with a primary endpoint that did not show benefit; calling this `negative` without any signal that the trial was underpowered/terminated is a certainty upgrade. ("Adequately powered, completed trial where benefit was not demonstrated" per the brief's own definition does not match PRISMS.)
- **THAWS** — stopped early for slow enrollment; same concern as PRISMS. The brief's definition of `negative` ("adequately powered, completed trial") does not fit. Mapping it to `negative` is a qualifier drop.
- **TWIST** — `ordinal-shift` (design) is correct; the result was null. A renderer that displays "ordinal-shift" with no result framing will leave the reader unable to tell whether the shift favoured treatment. That is a *missing* qualifier on a result-relevant surface.
- **EAGLE** — `futility` is defensible as a result class, but the brief's gloss conflates "stopped for futility" with "primary analysis crossed the futility threshold." Those are not the same operationally.

**3. Mutual exclusivity / collective sufficiency.** The set is **not mutually exclusive**: NOR-TEST is simultaneously `noninferiority` (design) and `negative` (result). ATTEST-2 carries `ordinal-shift` as primary and `noninferiority` as secondary — which is a legitimate dual-design trial, but the same field name is being asked to express "design" in one slot and "design+result" in another. The set is also **not collectively sufficient on a single axis**: there is no "superiority-not-met" value, no "noninferiority-not-met" value, no value for "early termination — administrative." The current enum forces those into `negative`, which is the drift documented above.

**4. Synthesis-smoothing risk.** Coding NOR-TEST, PRISMS, and THAWS all as `negative` smooths over a real evidence-conflict between three different published interpretations (NI not established / underpowered / stopped early). This is a qualifier drop on each distinct trial.

## Citation accuracy

Not assessed at the citation-text level for this review — the artifact under review is a *schema vocabulary*, not a set of claim strings. When the Wave 2 data commit lands, every `primaryAnalysisType` assignment becomes a paraphrase of the trial publication's framing. The current enum makes that check impossible for the trials flagged above because the enum cannot represent what the publication actually says.

## Freshness

Not applicable — no `last_reviewed` dates moved in this change.

## Rationale

The enum as written conflates *design* (`binary-superiority`, `ordinal-shift`, `noninferiority`, `bayesian-noninferiority`) with *result* (`negative`, `futility`, `dose-harm`) on a single field. For roughly half the 21 trials this is harmless; for at least four (NOR-TEST, PRISMS, THAWS, TWIST) the single-axis label drops a clinically load-bearing qualifier — most notably NOR-TEST, where the NI framing is the entire point of the trial and is erased by `negative`. That is a never-drift category 3 and 4 violation and a mandatory block. The fix is structural: separate the two axes into two fields, each with its own closed vocabulary, so a trial can carry both *design = noninferiority* and *result = NI margin not met* without one overwriting the other.

## Blocking issues

1. **Mixed-axis enum.** Split into two fields:
   - `primaryDesign?: 'binary-superiority' | 'ordinal-shift' | 'noninferiority' | 'bayesian-noninferiority' | 'dose-finding-safety'`
   - `primaryResult?: 'met' | 'not-met' | 'noninferiority-established' | 'noninferiority-not-established' | 'futility-stopped' | 'harm-stopped' | 'terminated-administrative'`
   The two-field shape lets NOR-TEST be `{ design: 'noninferiority', result: 'noninferiority-not-established' }` without either piece of information being lost.

2. **`negative` is not a precise enough value to ship.** Even within a result-only field, "negative" hides the difference between (a) adequately powered superiority trial that missed, (b) NI trial that failed to establish NI, (c) trial terminated for enrollment. Replace with the four specific result values listed in blocking issue 1.

3. **PRISMS and THAWS classification.** Both were terminated early and are mis-coded as `negative` per the brief's own definition ("adequately powered, completed trial"). Recode to `result: 'terminated-administrative'`.

4. **NOR-TEST classification.** Must carry `design: 'noninferiority'`. Currently coded only as `negative`, which drops the NI framing. This is the single most clinically consequential miscoding in the table.

5. **`dose-harm` rename.** Acceptable as a concept (NOR-TEST 2 Part A). Under the two-field shape this becomes `design: 'dose-finding-safety'`, `result: 'harm-stopped'`.

6. **Renderer guardrail.** Once the schema is split, the brief should specify how the two fields combine into any user-facing string. A clinician must never see only `design = noninferiority` without the paired result, or only `result = not-met` without the paired design. This is a §13.3 derived-language claim surface and needs its own tagging strategy at the composition site.

## Required follow-ups
- Re-submit the schema for clinical-reviewer sign-off after splitting into `primaryDesign` / `primaryResult` fields per blocking issue 1.
- Confirm with `system-architect` that splitting one optional field into two does not break the schema approval already granted — a fresh §17.1 architect artifact is likely required.
- For each of the 21 trials, the Wave 2 data commit must include support from the trial's primary publication for both the assigned `primaryDesign` and `primaryResult`. NOR-TEST, PRISMS, THAWS, and TWIST require explicit attention.
- Add a renderer-side policy (ADR or component spec) that design and result fields are always displayed together or both omitted; never one without the other.
