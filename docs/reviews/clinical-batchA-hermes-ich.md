# Clinical review - Batch A (HERMES statistics + 2022 ICH reversal citation reconciliation)

**Decision:** approve (both changes)
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-01

## Scope
- Change 1 (Class E): HERMES study-mode evidence block, src/pages/guide/StrokeBasicsWorkflowV2.tsx line ~612
- Change 2 (Class D-clinical): 2022 ICH reversal citation consolidation, src/lib/citations/registry.ts + src/lib/citations/claims.ts
- Claims touched: patch-platelet-transfusion-harm-2016, annexa-4-fxa-reversal-2019, sarode-4fpcc-vka-reversal-2013, ich-anticoagulation-reversal-synthesis, fxa-reversal-4fpcc-andexanet-withdrawn (the HERMES block is untagged static study-mode prose)
- Citations affected: aha-asa-2022-ich-anticoag-reversal (canonical, consolidated); aha-asa-ich-2022-reversal (deleted duplicate)

## Section 1 - HERMES statistics (Change 1, Class E): approve
Verified against Goyal M et al., Lancet 2016;387:1723-1731 (PMID 26898852):
- Functional independence (mRS 0-2) 46.0% intervention vs 26.5% control at 90 days. CONFIRMED. The prior erroneous 29% control is corrected to 26.5%.
- Functional-independence NNT about 5. CONFIRMED (absolute difference about 19.5 points, NNT about 5.1).
- Primary outcome correctly identified as the ordinal outcome (reduced disability, a 1-point-or-greater mRS shift) with NNT 2.6. CONFIRMED (cOR 2.49, 95% CI 1.76-3.53). The sentence does not conflate the ordinal primary with functional independence.
No never-drift, no overstatement, no invented statistics, no em-dash.

## Section 2 - 2022 ICH reversal reconciliation (Change 2, Class D-clinical): approve
Canonical entry quoted_text grades verified against Greenberg SM et al., Stroke 2022;53:e282-e361 (PMID 35579034):
- VKA to 4F-PCC over FFP: Class 1, Level B-R (§5.2.1). CONFIRMED.
- Dabigatran to idarucizumab: Class 2a, Level B-NR (§5.2.1). CONFIRMED.
- FXa to andexanet alfa: Class 2a, Level B-NR (§5.2.1). CONFIRMED.
- FXa to 4F-PCC/aPCC: Class 2b, Level B-NR (§5.2.1). CONFIRMED.
- Antiplatelet to platelet transfusion (no emergency surgery): Class 3 Harm, Level B-R (§5.2.2). CONFIRMED.
Mechanics: three dependent claims repointed to the canonical id; sarode description corrected from the wrong "Class I, Level A" to "Class 1, Level B-R"; synthesis and fxa-withdrawn descriptions corrected from §7.3 to §5.2.1; deleted duplicate appears only in a historical comment (no dangling reference, check:claims passes); live bedside recommendation (4F-PCC first, andexanet withdrawn) unchanged.

## Freshness
Canonical citation last_reviewed 2026-07-01 (6-month window). Supporting trial citations within their 36-month landmark windows. Pass.

## Required follow-ups
1. Editorial (addressed in this commit): the sarode trial-level registry comment still read "AHA/ASA 2022 Class I, Level A"; normalized to "Class 1, Level B-R" for internal consistency.
2. Informational: the HERMES study-mode block and two guide-page Paragraph reversal surfaces remain untagged (Paragraph cannot spread data-claim); tracked under the Phase 3 composition-site tagging roadmap. No action for this PR.
