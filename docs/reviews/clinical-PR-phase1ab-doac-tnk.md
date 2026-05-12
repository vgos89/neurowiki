# Clinical review — PR #phase1ab

**Decision:** approve-with-conditions (conditions resolved pre-merge — see §Rationale)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-11

## Scope
- Claims touched: `doac-management-2026` pearl (untagged in registry — manual §17.2 sign-off per full-repo audit P0); TNK paragraph in `IvTpa.tsx` (untagged)
- Citations affected: AHA/ASA 2026 Guidelines (DOI `10.1161/STR.0000000000000513`, PMID 41582814) — registry.ts not yet shipped (W5.2)
- Surfaces changed: structured data (`src/data/strokeClinicalPearls.ts` — Phase 1 surface); static JSX (`src/pages/guide/IvTpa.tsx` — Phase 1 surface)
- Evidence-verifier packet: inline (no docs/evidence-packets/ file — accessible summaries only; full text paywalled)
- Trial-statistician report: not applicable — guideline recommendation language, not trial statistics

## Semantic validity

**Edit 1A (DOAC pearl):**
- `evidenceClass: 'III'` (no benefit/harm) was semantically incoherent with permissive content ("may consider tPA"). Corrected to `'IIb'`. Direction: high confidence. Exact COR value (IIb vs IIa) is inferential from 2019 framework + 2026 summaries — to be confirmed against full text when accessible (deferred follow-up).
- Content restructured to lead with the absolute prohibition, then the permissive carve-out. All original qualifiers preserved: >48h window, normal renal function, normal drug-specific assay, anti-Xa for apixaban/rivaroxaban/edoxaban, ECT or dilute thrombin time for dabigatran.
- Idarucizumab sentence (added by medical-scientist, not in original pearl) removed pre-merge — 2026 endorsement not confirmable from accessible summaries. Tracked as deferred follow-up.

**Edit 1B (TNK paragraph):**
- "preferred for LVO" removed — not present in any accessible 2026 guideline summary. High confidence.
- 2026 guideline positions TNK and alteplase as co-equal alternatives (COR 1): "...tenecteplase ... or alteplase ... is recommended." Replacement "Equivalent first-line alternative to alteplase (AHA/ASA 2026, Class I)" accurately reflects this.
- "Non-inferior" (statistical trial language) replaced by "Equivalent" (guideline-level prose). Appropriate for bedside decision-support context.
- "Class 1" corrected to "Class I" for schema consistency.
- Dose (0.25 mg/kg, max 25 mg, single bolus) confirmed accurate.

## Citation accuracy
- AHA/ASA 2026 Guidelines DOI `10.1161/STR.0000000000000513` — full text paywalled. TNK co-equal first-line confirmed across 4+ independent accessible summaries (AHA Professional, TCTMD, UIC Drug Information Group, emDocs, NeurologyLive). DOAC carve-out directionally confirmed from same sources. Exact COR/LOE for DOAC pearl to be verified against full text post-W5.2 (see follow-ups).
- No `data-claim` tags or registry entries added — W5.2 not yet landed; by design for this task.

## Freshness
- AHA/ASA 2026 Guidelines: published 2026. Within 6-month default window (§13.7). Pass.
- `last_reviewed` cannot be set — registry.ts not yet shipped. Deferred to W5.2.

## Rationale
These edits resolve two P0 clinical findings from the full-repo agent audit: the DOAC pearl Class III mislabel (internally contradictory badge) and the TNK "preferred for LVO" overclaim (unsupported by 2026 guideline language). Both corrections move the content closer to the guideline, not further from it. The idarucizumab pre-merge condition was resolved by removing the unconfirmed sentence rather than retaining it. The Class I style condition was resolved by the orchestrator before committing. All other qualifiers and clinical gates from the original text are preserved. The clinical-reviewer is satisfied that neither edit introduces a new never-drift violation.

## Required follow-ups
**Deferred (post-merge):**
1. When registry.ts ships (W5.2), backfill AHA/ASA 2026 citation entry with `quoted_text` for TNK co-equal first-line statement and DOAC >48h permissive recommendation.
2. Confirm exact COR/LOE for DOAC pearl (IIb vs IIa) against full text when accessible; update `evidenceClass` if needed.
3. Assess idarucizumab reversal pathway for dabigatran against 2026 full text; add back to pearl if 2026 confirms endorsement (Class E follow-up task).
4. Add `claimId` fields and `data-claim` attributes once registry exists (W5.2 / Phase 3B work).
5. Verify DOI `10.1161/STR.0000000000000513` resolves to 2026 publication (not 2019 update) when full text becomes accessible.
