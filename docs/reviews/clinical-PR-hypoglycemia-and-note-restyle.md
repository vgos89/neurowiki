# Clinical review — PR hypoglycemia-and-note-restyle

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-10

## Scope
- Claims touched: `ivt-hypoglycemia-60` (new)
- Claims indirectly in blast radius (rendered-string-unchanged, no re-review of binding): `bp-ivt-threshold-185-110`, `ivt-anticoag-doac-48h`, `ivt-anticoag-warfarin-inr`, `ivt-anticoag-ufh-aptt`, `ivt-anticoag-antiplatelet-ok`
- Citations affected: `aha-asa-2026-4.5`
- Surfaces changed (§13.3):
  - Static JSX with `data-claim`: new hypoglycemia caution in `PatientContextPanel.tsx` (NIHSS surface, gated `showThrombolysisTiming`)
  - Computed/threshold logic in clinical components: `CodeModeStep1.tsx` (`glucoseLow` trigger), `CodeModeStep3.tsx` (EMR-copy string)
  - Presentation-only restyle of existing `data-claim` surfaces (BP + 3 per-drug cautions): rendered strings unchanged
- Evidence-verifier packet: not applicable (no new trial entry; single guideline citation already in registry with verbatim text)
- Trial-statistician report: not applicable

## Semantic validity

**Claim `ivt-hypoglycemia-60` (new panel note). PASS.**
Rendered string: "Hypoglycemia (glucose <60): treat with D50 50 mL IV, recheck, reassess for tPA if symptoms persist."
Source `aha-asa-2026-4.5` verbatim: "For AIS, hypoglycemia (blood glucose <60 mg/dL) should be treated to avoid complications (COR 1, LOE C-LD)."
Five never-drift categories: recommendation strength (COR 1 "should be treated" rendered as bare imperative "treat", no upgrade/downgrade), action verbs ("treat" identical; "recheck"/"reassess" are operational supportive steps), qualifiers/gates (threshold <60 faithful; trigger `glu > 0 && glu < 60` excludes blank), certainty markers (categorical in both), temporal (none imposed). The "reassess for tPA if symptoms persist" language and the D50 50 mL IV dose are byte-faithful mirrors of the already-reviewed Stroke Code `CodeModeStep1` alert, not new free-floating claims; acceptable provenance. D50 50 mL IV = 25 g dextrose, the standard adult IV rescue dose; no separate citation required.

**Threshold alignment `CodeModeStep1` <50 -> <60 and `CodeModeStep3` copy. PASS, clinically correct.**
The COR 1 treat-threshold per §4.5 is <60 mg/dL. The legacy <50 sat below guideline and would have suppressed the treat prompt for a hypoglycemic 50-59 mg/dL patient. Raising to <60 matches the verbatim source; the EMR-copy string now matches the trigger.

**Scope completeness of the <50 -> <60 change. PASS.**
Residual `<50` occurrences split into two clinically distinct concepts and the boundary is correct:
- Treat-hypoglycemia triggers (intervention = give dextrose): all moved to <60 (`CodeModeStep1`, `CodeModeStep3`, `ThrombolysisEligibilityModal` already <60, new panel note). Complete.
- Hypoglycemia-as-tPA-exclusion / stroke-mimic-rule-out (separate concept): left at <50 in `QuickReferenceCard.tsx` (150), `guideContent.ts` (781), `strokeClinicalPearls.ts` (193/669/809). Conflating the NINDS-derived <50 exclusion threshold with the 2026 §4.5 <60 treat-threshold would itself be a drift error; leaving them unchanged is correct (see Condition 2).
- `CompactVitals.tsx` <70 (line 13): legacy/unused, different concept, out of scope.

**Presentation-only restyle (BP + 3 per-drug cautions). PASS, no clinical-meaning change.**
Box -> thin inline "!" note. Rendered strings byte-identical; `data-claim` bindings intact. No never-drift category touched by a color/container change.

## Citation accuracy
`aha-asa-2026-4.5`: current 2026 guideline, correct section (§4.5 Blood Glucose Management, row 1), `quoted_text` matches in-repo source `src/data/aha2026StrokeGuideline.ts` line 257 verbatim, COR 1 / LOE C-LD grading consistent across registry/source/claim. Mapping `ivt-hypoglycemia-60` -> `['aha-asa-2026-4.5']` bidirectionally intact. PASS.

## Editorial / expert context
Not applicable: no new trial entry in this PR.

## Freshness
`aha-asa-2026-4.5`: `last_reviewed: 2026-05-22`, current guideline, 6-month window (§13.7). Elapsed ~0.6 months. Within window. PASS.

## Rationale
The new hypoglycemia caution is a faithful COR-1-register paraphrase of §4.5 with threshold (<60), action verb ("treat"), and certainty (categorical) preserved; the operational "recheck / reassess for tPA" language and the D50 dose are byte-faithful mirrors of the already-reviewed Stroke Code surface. The <50 -> <60 corrections are clinically correct and scope-complete for the treat-hypoglycemia concept, with the IVT-exclusion/mimic <50 surfaces correctly carved out as a separate concept. The box -> thin-note restyle changes zero rendered clinical text and leaves all `data-claim` bindings intact. Held at approve-with-conditions only for two low-risk editorial items, neither a clinical-force defect.

## Required follow-ups
- **Condition 1 (editorial, waivable):** the rendered note states the dose flatly ("treat with D50 50 mL IV") while the claim description frames it as "eg, D50 50 mL IV". Recommended alignment: "treat (eg, D50 50 mL IV)" so D50 does not read as the only acceptable agent. Reviewer states this is waivable by explicit V direction if the flat bedside dose is preferred; it is not a clinical-force defect.
  - **RESOLUTION (orchestrator, 2026-06-10): WAIVED.** V directed the panel note to give "the same notification as the Stroke Code pathway hypoglycemia caution," which ships the flat "Give D50 50 mL IV." The reviewer confirmed the flat dose is clinically appropriate and acceptable. The flat string is retained to mirror the reviewed Stroke Code surface per V direction.
- **Condition 2 (consistency follow-up, does NOT block):** three surfaces still render hypoglycemia at <50 as an IVT-exclusion / stroke-mimic concept (`QuickReferenceCard.tsx` 150, `guideContent.ts` 781, `strokeClinicalPearls.ts` 193/669/809). Distinct concept; correctly out of scope here. A separate Class E-clinical task should decide deliberately whether that exclusion/mimic threshold also moves to <60 (substantive evidence question requiring medical-scientist adjudication and its own citation; must not be bundled into a restyle PR).
  - **RESOLUTION (orchestrator): TRACKED** as a separate follow-up task; not addressed in this PR.
- **Process note (not blocking):** the new caution lives only on the NIHSS `showThrombolysisTiming` surface and is suppressed on the Stroke Code surface (which has its own `CodeModeStep1` alert), so the two do not double-prompt for the same patient. Confirmed correct.
