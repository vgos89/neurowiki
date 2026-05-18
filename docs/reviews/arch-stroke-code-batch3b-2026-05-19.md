# Architect review — Stroke Code Batch 3B

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: opus-4.7)
**Date:** 2026-05-19

## Rationale
Batch 3B is additive: 11 new `ClinicalPearl` objects appended into existing `quick`/`deep` arrays in `src/data/strokeClinicalPearls.ts`, plus minor `evidence`-field extensions on three existing pearls. The file is 800 lines and a single flat `STROKE_CLINICAL_PEARLS` map keyed by `step-1`…`step-6`; all five consumer surfaces (`StrokeBasicsWorkflowV2.tsx`, `PearlDetailView.tsx`, `SectionPearls.tsx`, `DeepLearningModal.tsx`) read from this one export. Adding ~150–200 lines into the existing pattern is the correct, lowest-risk move — splitting the file now would force a parallel import path with no consumer change requested, and the natural split (by section) is already encoded by the top-level keys. The structural risk is not where this batch goes; it is the unchanged citation-debt floor: 140 existing pearls have no `data-claim` tags and `CLAIM_REGISTRY` is `{}` (W5.2 stub). Batch 3B extends that debt by 11 entries, which is acceptable only because W5.2 is the named owner — but the deferral must be tracked, not absorbed silently.

## Required follow-ups
- **Section placement, locked:** SELECT-2 / ANGEL-ASPECT / LASTE / TENSION → `step-2.deep` (LVO/EVT cluster with HERMES/DAWN/DEFUSE-3). TRACE-III / TIMELESS → `step-1.deep` (extended-window IVT, alongside EXTEND/WAKE-UP). BAOCHE / ATTENTION → `step-2.deep` (posterior LVO is still LVO; step-2 is the LVO section). AcT / EXTEND-IA TNK → `step-1.deep` (treatment-agent selection). **OPTIMAL-BP and ENCHANTED-2 → `step-5.deep` (Treatment Orders), not step-4.** Rationale: step-4 is pre-treatment vitals targets; post-EVT BP management is a post-treatment order and belongs adjacent to `bp-maintenance-deep`, `anticoagulation-timing`, and `monitoring-protocol-deep`.
- **Refresh-only edits stay refresh-only.** The three pearls being touched (`lvo-workflow` step-2, `bp-posttpa-deep` step-4, `treatment-windows-quick` step-1) may extend the `evidence` string and `detailedContent.evidence` only. No `content` text changes, no threshold changes, no `evidenceClass`/`evidenceLevel` shifts in this batch — those are clinical-logic edits and must route through a separate Class E.
- **Schema change deferred, intentionally.** Do NOT add `last_reviewed` or `quoted_text` to the `ClinicalPearl` interface in Batch 3B. The `Citation` interface in `src/lib/citations/schema.ts` already carries both fields canonically; the right move is for pearls to *reference* a citation ID (via `CLAIM_REGISTRY`) rather than duplicate the metadata on the pearl object. Adding these fields to `ClinicalPearl` now would create a third parallel home for citation metadata (after `Citation` and `detailedContent.evidence`) and would have to be unwound in W5.2. Note this trade-off in the PR body so it is not re-litigated.
- **Citation-debt ledger.** Add a `TASKS.md` line under W5.2 noting that Batch 3B extends the untagged-pearl count from 140 → 151 and lists the 11 new pearl IDs to be backfilled when `CLAIM_REGISTRY` is populated.
- **Composability:** the new pearls are correctly scoped to the pearl layer. Do not also surface them in `StrokeBasicsWorkflowV2.tsx` step components in this batch — the `SectionPearls` consumer already renders by section ID, so visibility is automatic. Duplicating into the step JSX would create the third-pattern problem.
- **Route clinical portions to clinical-reviewer.** Per §17.2, every pearl text, `evidenceClass`, `evidenceLevel`, `plainEnglish`, and `detailedContent.evidence` string is a clinical claim. This artifact does not approve any of that — it approves the shape of the change only.

## Blocking issues
None.
