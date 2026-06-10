# Clinical review — PR (anticoag-eligibility-redesign)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-10

## Scope
- Claims touched: `ivt-anticoag-antiplatelet-ok`, `ivt-anticoag-doac-48h`, `ivt-anticoag-warfarin-inr`, `ivt-anticoag-ufh-aptt`; removed claim `ivt-anticoag-lmwh-24h` (now a code comment)
- Citations affected: `aha-asa-2026-4.6.1-antiplatelet`, `aha-asa-2026-4.6.5-doac-relative`, `aha-asa-2026-4.6.5-coagulopathy`; orphaned legacy citation `aha-asa-2026-4.2` assessed for retire/correct
- Surfaces changed: static JSX (`data-claim` attributes) in `src/components/shared/PatientContextPanel.tsx` (per-drug IV-thrombolysis eligibility sub-rows; §13.3 "Static JSX text" + "String literals inside components")
- Evidence-verifier packet: not applicable (guideline-text feature, not a trial-data or statistics-display change)
- Trial-statistician report: not applicable

## Semantic validity

All four rendered strings were checked against the verbatim 2026 AHA/ASA guideline full text read directly from the local PDF (`2026-Guideline-for-acute-ischemic-stroke.pdf`, Prabhakaran et al., DOI 10.1161/STR.0000000000000513, FIRST PROOF). Source pages: e38 (§4.6.1 Rec 9), e48 (§4.6.5 + Table 8 lead-in), e49 to e52 (Table 8 in full). Each string was run through the five never-drift categories.

**1. `ivt-anticoag-antiplatelet-ok` (rendered: "Single or dual antiplatelet use is not a contraindication to IV thrombolysis.")** PASS (fair paraphrase).
- Source §4.6.1 Rec 9 (COR 1, LOE B-NR, verbatim e38): single or DAPT, otherwise eligible, IVT is recommended despite a small increase in sICH risk. The rendered string restates a Class I permit as "not a contraindication" without upgrading strength or inventing a "should treat" imperative. The "single or dual" scope now matches the source enumeration exactly (copy nicety adopted). No drift.

**2. `ivt-anticoag-doac-48h` (rendered: "DOAC <48h: individualize, IV thrombolysis safety unknown.")** PASS.
- Source §4.6.5 / Table 8 Relative Contraindications, DOAC exposure (verbatim e50): "the safety of IV thrombolysis is unknown… may be considered after a thorough benefit vs risk analysis on an individual basis." Rendered "safety unknown" + "individualize" preserves the epistemic uncertainty exactly and does not present DOAC <48h as an absolute block. This is the load-bearing distinction in the PR and it is correct. Cites the verbatim relative citation, not the retired absolute one.

**3. `ivt-anticoag-warfarin-inr` (rendered: "INR >1.7: excluded from IV thrombolysis.")** PASS.
- Source §4.6.5 / Table 8 Absolute Contraindications (verbatim e52): platelets <100,000/mm³, INR>1.7, aPTT>40s, or PT>15s "should not be administered." Rendered "excluded" faithfully renders an absolute exclusion; ">1.7" matches the source threshold exactly.

**4. `ivt-anticoag-ufh-aptt` (rendered: "IV heparin, aPTT >40 s: excluded from IV thrombolysis.")** PASS.
- Same Table 8 absolute row. ">40 s" matches the source threshold exactly; attributing the elevated aPTT to IV heparin is consistent with the source "without recent use of warfarin or heparin" carve-out.

**Synthesis check.** Claims 3 and 4 both map to `aha-asa-2026-4.6.5-coagulopathy` (one Table 8 row carries all four lab thresholds). Each sub-claim is drawn verbatim from the same row without averaging. No synthesis violation.

**LMWH-claim removal (confirmed correct).** All four Table 8 sub-tables were read end to end. There is no standalone treatment-dose-LMWH-<24h row in the 2026 Table 8 (the 2019 row is gone). Heparin-class agents are captured solely by the aPTT>40s absolute threshold and the "without recent use of warfarin or heparin" carve-out. Making the Heparin/LMWH input aPTT-only, with no LMWH-timing rule, is faithful to the 2026 guideline. Removing `ivt-anticoag-lmwh-24h` rather than re-citing it to a nonexistent row is correct and avoids a fabricated-claim surface. No residual UI surface references the removed claim (the heparin chip routes only to `ivt-anticoag-ufh-aptt`).

## Citation accuracy
- `aha-asa-2026-4.6.1-antiplatelet` — §4.6.1 confirmed against TOC (p.2) and header (e38); Rec 9 verbatim (COR 1, LOE B-NR). PASS.
- `aha-asa-2026-4.6.5-doac-relative` — §4.6.5 confirmed; `quoted_text` is a verbatim transcription of the Table 8 DOAC cell under Relative Contraindications (e50). Classification as relative is correct. PASS.
- `aha-asa-2026-4.6.5-coagulopathy` — §4.6.5 confirmed; `quoted_text` is a verbatim transcription of the Table 8 coagulopathy cell under Absolute Contraindications (e52); INR>1.7 and aPTT>40s both present. PASS.
- `aha-asa-2026-4.2` (legacy DOAC citation) — CONFIRMED DEFECTIVE and ORPHANED: wrong section title (§4.2 is Head Positioning per TOC p.2), non-verbatim, and overstates DOAC <48h as absolute. No claim mapped to it. Disposition: retire (delete). A correct verbatim replacement already exists and is in use, so deletion is cleaner than correct-in-place.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
- All three citations under review carry `last_reviewed: 2026-06-10`, source = current clinical guideline, default 6-month window (§13.7). Within window (reviewed today). The §13.6 six-point check is satisfied: source resolves in-repo, version is the current 2026 guideline, dependent claims are consistent, no wording drift found, no newer superseding guideline exists, and this review is the clinical-reviewer half of dual sign-off.

## Rationale
All four rendered strings faithfully represent the verbatim 2026 AHA/ASA guideline sections they cite, with the load-bearing distinctions preserved exactly: antiplatelet use is a COR 1 permit (not a contraindication), DOAC <48h is a relative/individualized contraindication with "safety unknown" intact (not an absolute block), and INR>1.7 and aPTT>40s are absolute exclusions drawn verbatim from the Table 8 Absolute-Contraindications coagulopathy row. No drift exists in any of the five never-drift categories, and the LMWH-claim removal is confirmed faithful to a guideline that carries no LMWH-timing row. The conditions below are registry hygiene and minor; none are clinical drift on a shipped surface, so approve-with-conditions is the correct disposition.

## Required follow-ups (conditions)
1. **Retire the orphaned `aha-asa-2026-4.2` citation** from `src/lib/citations/registry.ts`. ADDRESSED in this PR (deleted; replaced with a retirement note).
2. **Comment-syntax check in `src/lib/citations/claims.ts`.** VERIFIED CLEAN: the lines in question are valid `//   • …` bullet comments (misread as single-slash); tsc and the production build both pass.
3. **Antiplatelet copy nicety.** ADOPTED in this PR ("Single or dual antiplatelet use is not a contraindication to IV thrombolysis.").
4. **Housekeeping (separate item, out of scope):** `src/data/aha2026StrokeGuideline.ts` labels Head Positioning as "SECTION 4.3" whereas the published TOC numbers it §4.2. Pre-existing mislabel in a different file; tracked separately so the section-numbering drift does not propagate into future citations.
