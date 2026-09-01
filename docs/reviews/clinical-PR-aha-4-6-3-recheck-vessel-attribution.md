# Clinical review — §4.6.3 freshness re-review + vessel-attribution correction

**Decision:** approve-with-conditions (re-ruled 2026-09-01 after HOPE full text; original decision was `block`)
**Reviewer:** clinical-reviewer (model: claude-opus-5), independent second read by medical-scientist (model: claude-opus-5)
**Date:** 2026-09-01

## Scope
- Claims touched: `trace-iii-late-window-tnk`, `timeless-late-window-negative`, `extended-ivt-sich-caution`, `trace-iii-late-tnk-sich`, `late-window-tnk-quick-claim`
- Citations affected: `aha-asa-2026-4.6.3` (corrected), `trace-iii-trial-2024` (corrected)
- Surfaces changed: citation registry; structured data in `src/data/strokeClinicalPearls.ts` (Phase 1 `claimId`); static JSX + computed verdict strings in `src/pages/ExtendedIVTPathway.tsx`
- Evidence-verifier packet: `docs/evidence-packets/2026-09-01-aha-4.6.3-recheck-and-eagle-comparison.md`
- Trial-statistician report: not applicable (no statistics display changed)

## Semantic validity

Both reviewers independently re-extracted §4.6.3 from the governing PDF, binding each COR/LOE cell to its own table row rather than by proximity (§13.9.1 rule 2), and by two different extraction methods. Both reproduced the orchestrator's transcription of all three recommendations character for character. Rec 3 is **COR 2b / LOE B-R**; the previously recorded grade was CORRECT.

The prior `quoted_text` was a paraphrase with three material deviations, all confirmed as qualifier drift:
1. "tenecteplase" for "treatment with IVT" (narrows an agent-agnostic recommendation)
2. "anterior-circulation large vessel occlusion" for "AIS due to LVO" (adds a restriction the source does not make)
3. "directed by individuals with expertise in thrombolytic stroke care" dropped (removes a care-delivery gate)

Corroboration from the guideline's own drafting practice: §4.7.2 writes "anterior circulation proximal LVO of the ICA or M1" in every row, §4.7.3 names basilar separately, §4.7.4 uses bare "LVO" for a recommendation covering basilar technique. Bare "LVO" in this document is not shorthand for anterior circulation.

**Provenance:** `src/data/aha2026StrokeGuideline.ts` does not contain §4.6.3 at all, so unlike the §4.7.1/§4.7.2 defects this was NOT mirror-circularity. It was unattributed free-hand paraphrase, a distinct failure mode the existing corrective would not have caught.

## Citation accuracy
- `aha-asa-2026-4.6.3`: retitled to the true section name, `section` expanded, `pmid: '41582814'` added, all three recommendations transcribed verbatim with house-format grades. This also retro-sources the previously unsourced COR 2a badges on Paths A and B.
- `trace-iii-trial-2024`: editorial annotation removed from inside `quoted_text` (it was not NEJM text) and moved to the comment. Medium-confidence hedge CLOSED against the open-access NEJM abstract (PMID 38884324), which supplies both sICH figures and the 36-hour definition window verbatim.

## Editorial / expert context
Not applicable. No new trial entry in this change. HOPE registration (C4) is deliberately excluded and queued as a separate Class E task.

## Freshness
§13.6 six-step audit:
1. Source resolves — PASS
2. Version current — **PASS WITH CAVEAT.** The held PDF is the FIRST PROOF ("Stroke. 2026;57:e00-e00", "TBD 2026"). The published article is Stroke 2026;57(8):e316-e436 and is not held; no guideline PDF is checked into this repo. Re-verification trigger recorded in the citation comment.
3. Dependent claims consistent — PASS after this change (two rendered defects found by clinical-reviewer and fixed: a COR 2b bound to a narrowed "anterior LVO" population, and a false statement about where the guideline discusses TIMELESS)
4. No wording drift — PASS after this change
5. Newer evidence considered — PASS. HOPE (JAMA 2025;334(9):788-797, PMID 40773205), full text held, retrieval confidence High. Permitted affirmatively for: no vessel/circulation restriction, and that the agent was alteplase. NOT permitted: any posterior-specific estimate (none published), any change to COR.
6. Dual sign-off — medical-scientist authored; clinical-reviewer gated.

`last_reviewed` refreshed to 2026-09-01, `review_window_months: 3` retained.

## Rationale
The grade was never wrong; the population and agent description were. The correction moves every affected surface toward the source text. The highest-consequence item was not the citation record (which renders nowhere) but `ExtendedIVTPathway.tsx`, which told clinicians the guideline restricts late-window IVT to two arteries and, on the other branch, could return an affirmative verdict whose justification named an artery the patient did not have, exported verbatim to the chart by `buildEmrText`. Both branches are now correct.

An affirmative "Eligible" verdict for posterior-circulation LVO was requested by the product owner and is **NOT approved**. HOPE enrolled 29 posterior-circulation patients but published no posterior-specific effect or safety estimate; its reported subgroup partition ("other arteries") reconstructs to 123 patients of whom only 24% are posterior, and HOPE's own anatomic split was proximal versus distal, never by circulation. Independent of the evidence, a basilar occlusion sits inside a COR 1 / LOE A EVT recommendation (§4.7.3) while Path C's precondition is "cannot receive EVT", so widening Path C risks an off-ramp from a Class I pathway. Path C also dispenses tenecteplase only while HOPE is alteplase. The shipped neutral scope-limited verdict states the guideline position, the trial limit, and the §4.7.3 routing, and invents nothing.

No NIHSS or prestroke-mRS gate was added. §4.7.2 and §4.7.3 both write such gates explicitly and §4.6.3 does not; an NIHSS floor would additionally contradict §4.6.1 rec 1 (COR 1, LOE A, disabling deficits "regardless of NIHSS score") and an mRS gate would contradict the registered claim `mrs-prestroke-evt-eligibility`.

## Required follow-ups
- **C4** Register HOPE and map to `extended-ivt-sich-caution` only. Separate Class E task with its own packet. Binding: no NNT display without co-located NNH.
- **C6** Path C entry floor 9 h vs the source's 4.5 h. Control-flow change in `getPathStage` creating a Path B/C overlap; wants system-architect on the shape.
- **Posterior affirmative verdict** blocked pending a posterior-specific effect estimate. HOPE supplementary appendix or SAP is the gating retrieval; Figure 3's "other arteries" row will NOT answer it.
- **Published guideline retrieval** (Stroke 2026;57(8):e316-e436) to clear the step-2 caveat across all eight `aha-asa-2026-*` citations.
- **`aha-asa-2026-4.6.2` provenance re-check** — same 2026-05-19 authoring batch, same paraphrase shape, no `pmid`. Not stale, not mapped here.
- **Tag the pathway's computed verdict strings** with the `claim()` helper; every defect found here was invisible to the pre-commit hook.
