# Clinical review — PR #bp-alert

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-sonnet-4-5)
**Date:** 2026-05-27

## Scope
- Claims touched: `bp-ivt-threshold-185-110` (new)
- Citations affected: `aha-asa-ivt-bp-threshold` (new, PMID 31662037), `aha-asa-2026-4.6.1` (existing, supporting), `aha-asa-2026-4.6.2` (existing, supporting), `aha-asa-2026-4.3` (existing, related — post-IVT BP and post-EVT harm)
- Surfaces changed: §13.3 — static JSX (`data-claim` attribute on alert chip in `src/components/shared/PatientContextPanel.tsx`)
- Evidence-verifier packet: not applicable (single-threshold guideline-derived claim, not trial-data display)
- Trial-statistician report: not applicable

## Semantic validity

**Threshold (185/110 mmHg):** semantically correct. The ≤185/110 mmHg pre-treatment threshold for IV thrombolysis in acute ischemic stroke originates in the NINDS protocol (1995), is carried as an exclusion criterion in the 2013, 2018, and 2019 AHA/ASA Acute Ischemic Stroke guidelines (Powers et al., Stroke 2019, Table 5 — Eligibility Criteria for IV rtPA), and is preserved in the 2026 AHA/ASA Guideline as a Class I recommendation. The threshold applies to both alteplase and tenecteplase: TNK is administered under the same BP eligibility envelope as alteplase per AHA/ASA 2026 §4.6.2 and per the AcT and ATTEST-2 protocol designs.

Never-drift check on proposed alert text — *"BP above tPA/TNK threshold — lower to ≤185/110 before treatment"*:

- **Recommendation strength:** the guideline text is a Class I eligibility gate ("BP must be ≤185/110 before IV thrombolysis is initiated"). The alert language is informational ("above threshold — lower to ≤185/110 before treatment"), which preserves the Class I imperative without overstating it. No upgrade, no downgrade. Pass.
- **Action verbs:** "lower to ≤185/110 before treatment" preserves the guideline action (lower BP, then treat). Does not drift to *withhold permanently* or *do not treat* — both would be inaccurate (the patient remains eligible if BP can be safely lowered). Pass.
- **Qualifiers and gates:** the threshold (185 SBP / 110 DBP), the temporal gate (*before* treatment), and the agent scope (tPA/TNK) are preserved exactly. The alert correctly fires on SBP ≥185 OR DBP ≥110 — matching the OR-logic of the guideline exclusion. Pass.
- **Certainty markers:** "above threshold" is a factual statement about the entered values, not an epistemic claim about evidence. "Lower … before treatment" is the established protocol action. No silent upgrade. Pass.
- **Temporal constraints:** "before treatment" is the canonical pre-IVT window. Matches the guideline's *prior to administration* language. Pass.

**Semantic condition:** The alert text does not state the post-bolus monitoring threshold (≤180/105 for 24 hours post-IVT per AHA/ASA 2026 §4.3). This is acceptable for a pre-treatment alert scoped to the PatientContextPanel — which is used during initial assessment, not post-bolus monitoring. The alert is inherently pre-treatment in context. If the panel is ever used post-bolus, the threshold logic must switch to a separate claim with the 180/105 target.

## Citation accuracy

- **`aha-asa-ivt-bp-threshold` (proposed new, PMID 31662037):** Powers WJ et al., "Guidelines for the Early Management of Patients With Acute Ischemic Stroke: 2019 Update to the 2018 Guidelines." Stroke 2019;50(12):e344–e418. Table 5 explicitly lists "Blood pressure >185/110 mm Hg" as an exclusion criterion for IV alteplase, with the management directive that BP be lowered and maintained ≤185/110 mmHg prior to bolus. PMID resolves. Citation is appropriate as primary source.
- **`aha-asa-2026-4.6.1` (existing):** quoted_text covers IVT decision-making and 4.5-hour window — supporting context. Does not contain the 185/110 threshold in its quoted span. Acceptable as supporting citation; cannot stand alone as the primary source for this claim.
- **`aha-asa-2026-4.6.2` (existing):** quoted_text covers agent selection (TNK 0.25 mg/kg or alteplase 0.9 mg/kg). Establishes that TNK is in scope alongside alteplase, justifying "tPA/TNK" wording in the alert.
- **`aha-asa-2026-4.3` (existing, related):** quoted_text covers post-EVT intensive-lowering harm (Class III: Harm, Level A). Does NOT contain the pre-IVT 185/110 threshold in its quoted span — the threshold appears in the claim description at claims.ts as paraphrase. This is a pre-existing registry gap that this PR partially addresses by adding the explicit-quote citation.

## Editorial / expert context
not applicable — no new trial entry in this PR.

## Freshness

- `aha-asa-ivt-bp-threshold` (new): `last_reviewed` set to 2026-05-27 at creation. 2019 guideline is used as primary source because it contains the verbatim Table 5 threshold language; the 2026 guideline confirms this threshold unchanged. `review_window_months: 36` is appropriate (historical foundational threshold, cross-version stable) with inline comment documenting the rationale.
- `aha-asa-2026-4.6.1`: `last_reviewed: 2026-05-23` — within 6-month window. Pass.
- `aha-asa-2026-4.6.2`: `last_reviewed: 2026-05-19` — within 6-month window. Pass.
- `aha-asa-2026-4.3`: `last_reviewed: 2026-05-19` — within 6-month window. Pass.

## Rationale

The clinical content is correct: ≤185/110 mmHg is the unambiguous AHA/ASA pre-IVT BP eligibility gate for both alteplase and tenecteplase. The proposed alert wording preserves recommendation strength, action verbs, qualifiers, certainty, and temporal scope without drift. The proposed citation (PMID 31662037, 2019 guideline Table 5) is the correct primary source containing the explicit threshold in quoted_text. Approval is conditioned on the three blocking items below being satisfied before merge.

## Required follow-ups

- **Condition 1 (blocking for merge):** `aha-asa-ivt-bp-threshold` added to `src/lib/citations/registry.ts` with verbatim `quoted_text` from Powers WJ et al. 2019 Stroke Table 5. `review_window_months: 36` set with inline comment.
- **Condition 2 (blocking for merge):** claim `bp-ivt-threshold-185-110` registered in `CLAIM_REGISTRY` in `src/lib/citations/claims.ts` mapping to `['aha-asa-ivt-bp-threshold', 'aha-asa-2026-4.6.1', 'aha-asa-2026-4.6.2']`.
- **Condition 3 (blocking for merge):** alert rendered only when `PatientContextPanel` is used in pre-treatment context. Confirmed by the panel's role in initial assessment (not a post-bolus monitoring surface). Noted in PR body.
- **Follow-up (non-blocking):** expand `aha-asa-2026-4.3` `quoted_text` to include pre-IVT ≤185/110 and post-IVT ≤180/105 language directly. Pre-existing gap, separate Class C-clinical task.
