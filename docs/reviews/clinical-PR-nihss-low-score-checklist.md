# Clinical review — PR #nihss-low-score-checklist (pre-execution)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-06-01

## Scope
- Claims touched: `nihss-minor-disabling-check` (new, proposed)
- Citations affected: `aha-asa-2026-4.6.1` (existing); `prisms-trial` (new, proposed — not yet in registry)
- Surfaces changed: Static JSX inside NIHSS interpretation drawer (§13.3 Phase 1 or Phase 3 composition site)
- Evidence-verifier packet: required before merge (see Required follow-ups)
- Trial-statistician report: required before merge (see Required follow-ups)

## Semantic validity

**Checklist items:** Items 1 (dysphagia), 2 (gait), and 4 (speech) are appropriate. Three items require revision before implementation:

- Item 3 — "Arm or hand weakness affecting the dominant hand" is too narrow. Weakness of either hand may be disabling depending on the patient's occupation and self-care needs. Recommend: "Arm or hand weakness affecting a hand the patient relies on for work or daily activities (either hand)."
- Item 5 — "Visual disturbance (monocular or hemianopic)" should clarify that a resolved transient symptom is not disabling on its own. Recommend: "Persistent visual field loss (monocular blindness or hemianopia) affecting reading, driving, or work."
- Item 6 — "Symptoms the patient considers disabling" understates the clinician's role in the PRISMS adjudication construct. Recommend: "Any other symptom the patient or clinician judges disabling for the patient's work, self-care, or daily activities."

**"Minor — disabling" verdict:** The proposed text "IVT eligibility should be discussed" downgrades a Class I (COR 1, LOE A) recommendation to a discussion-level statement — a never-drift category 1 violation. AHA/ASA 2026 §4.6.1 states IVT is recommended for disabling deficits regardless of NIHSS. The claim must preserve Class I strength while acknowledging that the checklist does not evaluate time-window or other contraindications. Required wording: "Disabling features present. Per AHA/ASA 2026, IVT is recommended for patients with disabling deficits regardless of NIHSS, provided time-window and other eligibility criteria are met (Class I, Level A)."

**"Minor — non-disabling" verdict:** Two drift issues. (1) Comparator drift: the proposed text says "not superior to aspirin" but AHA/ASA 2026 §4.6.1 names the comparator as dual antiplatelet treatment (DAPT). The PRISMS trial itself compared alteplase against aspirin — naming DAPT is required for the guideline-level framing. (2) Strength drift: Class 3 No Benefit is an active recommendation against routine use, not a tie-breaker. Required wording: "No disabling features identified. Per AHA/ASA 2026 §4.6.1, IVT is not recommended routinely for mild non-disabling deficits within 4.5h, as it has not shown superiority over dual antiplatelet treatment (Class 3 No Benefit, Level B-R; PRISMS trial). Clinical judgment may still favor IVT in selected patients."

**Unanswered default:** Neutral prompt only — no clinical claim. No `data-claim` tag needed on the unanswered state.

## Citation accuracy

- `aha-asa-2026-4.6.1`: `last_reviewed: 2026-05-23` — within 6-month window. `quoted_text` covers both disabling and non-disabling branches directly. Appropriate as primary citation.
- `prisms-trial` (proposed): Not yet in registry. The brief's attribution ("Johnston et al., NEJM 2016") is internally inconsistent with the canonical PRISMS authorship. Evidence-verifier must confirm authorship, journal, year, PMID, primary endpoint, comparator, and early-stopping context before the citation is added. Until confirmed, this is a mandatory-block condition per registry integrity rules.

## Editorial / expert context

Not applicable — no new trial-detail page entry in this PR. PRISMS is being added as a citation supporting a guideline-aligned recommendation only. Evidence-verifier must cover PMID/journal/year/authorship and PRISMS statistical caveats (early stopping, underpowering). Full §8 editorial enumeration applies if PRISMS later gets its own trial detail page.

## Freshness

- `aha-asa-2026-4.6.1`: `last_reviewed: 2026-05-23` — within 6-month window. Pass.
- `prisms-trial`: new entry, `last_reviewed` set on creation. Pending evidence-verifier confirmation.

## Rationale

The feature is clinically valuable and correctly identifies the disabling-vs-non-disabling dichotomy that AHA/ASA 2026 §4.6.1 turns on. The checklist construct faithfully operationalizes the PRISMS eligibility design. Three blocking issues prevent unconditional approval: (a) the "Minor — disabling" verdict downgrades a Class I recommendation; (b) the "Minor — non-disabling" verdict names the wrong comparator and softens a Class 3 No Benefit recommendation; (c) the proposed PRISMS citation has an inconsistent attribution that must be resolved by evidence-verifier. Items (a) and (b) have unambiguous corrections derived from the registered quoted_text. Item (c) requires external verification. The NIHSS trigger range 1–4 is correct: NIHSS 0 is asymptomatic and does not warrant a disabling check.

## Required follow-ups

**Blocking (must be resolved before any file is touched):**

1. Reword "Minor — disabling" verdict per §Semantic validity above (preserve Class I strength).
2. Reword "Minor — non-disabling" verdict per §Semantic validity above (DAPT comparator + Class 3 No Benefit strength).
3. Reword checklist item 3 (dominant-hand → either hand per function).
4. Reword checklist items 5 and 6 per §Semantic validity above.
5. `evidence-verifier` to produce citation packet for `prisms-trial`: confirm authorship, journal, year, PMID, primary endpoint, comparator, early-stopping context, and supply `quoted_text` for registry entry.
6. `trial-statistician` to confirm "not superior" framing is statistically appropriate given PRISMS early stopping and resulting underpowering.
7. Register `nihss-minor-disabling-check` in `CLAIM_REGISTRY` mapped to `aha-asa-2026-4.6.1` and the verified `prisms-trial` citation.
8. Second clinical-reviewer pass post-implementation (§18 writer/reviewer pattern).

**Non-blocking:**
- Consider citing the guideline's shared-decision-making footnote for borderline cases to prevent the "non-disabling" verdict from reading as more deterministic than clinical reality warrants.
- Visually distinguish the unanswered-default state from the "all No" answered state to prevent misreading.
