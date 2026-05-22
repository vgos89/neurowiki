# Clinical review — PR #citation-aha-2026-4.9-2026-05-22

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-22

## Scope
- Claims touched: `early-doac-af-stroke-recommendation`
- Citations affected: `aha-asa-2026-4.8` → renamed to `aha-asa-2026-4.9` (id, section, title, quoted_text, last_reviewed all change; URL/year unchanged)
- Surfaces changed: static JSX (`src/pages/ElanPathway.tsx` soft-label strings, three on-screen + one in `buildEmrText` EMR string), citation registry (`src/lib/citations/registry.ts`), claim registry (`src/lib/citations/claims.ts`)
- Evidence-verifier packet: not applicable — citation hardening from primary source PDF directly read by reviewer; V supplied PDF on 2026-05-22
- Trial-statistician report: not applicable — this PR is a citation rename + recommendation hardening, no trial-statistics surface is being changed

## Semantic validity

Confirmed against page e68 of the 2026 AHA/ASA AIS Guideline (Prabhakaran et al., Stroke 2026;57:e00-e00, DOI 10.1161/STR.0000000000000513):

- **Source section**: §4.9 Anticoagulants — confirmed.
- **Verbatim quote**: matches PDF page e68 table cell character-for-character.
- **Recommendation strength (Class) — never-drift category #1**: source says **COR 2a** ("reasonable"). Soft-label says "is reasonable" — exact match.
- **Action verb — never-drift category #2**: exact match ("is reasonable").
- **Qualifiers/gates — never-drift category #3**: source says "carefully selected (eg, milder severity) patients with AIS with atrial fibrillation." Original soft-label proposal said "AF patients" — dropped "AIS" gate. Flagged as condition C1.
- **Certainty marker — never-drift category #4**: faithful contraction; certainty preserved.
- **Temporal constraint — never-drift category #5**: no drift; no new temporal constraint introduced.

Supportive text page e69 §1 confirmed: ELAN risk difference −1.18 (95% CI −2.84 to 0.47), framed as "numerical (but not statistically significant) reduction"; OPTIMAS and TIMING described as noninferiority RCTs. Consistent with existing ELAN trial entry framing.

## Citation accuracy

- `id`: `aha-asa-2026-4.9` — matches source §4.9.
- `title`: current registry title still says "§4.8 (Early DOAC initiation after cardioembolic ischemic stroke)." Must be updated. Flagged as condition C2.
- `section`: `§4.9 Anticoagulants` — matches.
- `year`: 2026 — matches PDF cover page.
- `url`: unchanged AHA professional landing page — acceptable.
- `pmid`: 41582814 — carried over; citation is for the whole guideline document, so PMID validity is not section-dependent. Acceptable.
- `quoted_text`: verbatim — matches PDF.
- `last_reviewed`: 2026-05-22 — date of this review.

**LOE clarification needed.** I can confirm COR 2a from the table image. I cannot independently confirm "LOE A" from the page-e68 crop. Per the F8 Option B precedent (2026-05-21 ELAN review), LOE stays out of the soft label until independently verified. Flagged as condition C3.

## Editorial / expert context

Not applicable — no new trial entry in this PR. This is a citation rename plus on-screen recommendation hardening for an existing claim. ELAN, OPTIMAS, TIMING are already registered as their own trial entries.

## Freshness

`aha-asa-2026-4.9` `last_reviewed: 2026-05-22`. Default 6-month window for current clinical guideline (§13.7). 2026 AHA/ASA AIS Guideline is the current version, March 2025 evidence cut-off. Well inside freshness window. Pass.

## Rationale

The semantic core of the proposed change — surfacing COR 2a "reasonable" framing for early oral anticoagulation in carefully selected AF/AIS patients with the explicit "efficacy not established" qualifier — is a faithful paraphrase of §4.9 page e68 and resolves the §4.8/§4.9 misnumbering. None of the five never-drift categories is violated, except a contained drop of "AIS" from the population gate that the result card should restore. Four execution-side conditions must be addressed before code merge.

## Required follow-ups (conditions — must be addressed before merge)

- **C1.** In the soft-label string, write "patients with AIS and atrial fibrillation" rather than "AF patients." Acceptable wording: "AHA/ASA 2026 §4.9 — COR 2a. Early oral anticoagulation is reasonable in carefully selected (eg, milder severity) patients with AIS and atrial fibrillation. Efficacy for early recurrence prevention not established."
- **C2.** In `src/lib/citations/registry.ts`, update the entry `title` from "2026 AHA/ASA Guideline — §4.8 (Early DOAC initiation after cardioembolic ischemic stroke)" to "2026 AHA/ASA Guideline — §4.9 (Anticoagulants — early oral anticoagulation after AF-related ischemic stroke)." Also update the inline comment block at the top of the entry — it references "§4.8" three times and a TASKS.md row about §4.8.
- **C3.** Do **not** put "LOE A" into the on-screen soft label or any user-facing prose in this PR. Keep Option B framing. LOE inclusion would require separate verification of the LOE column from the PDF.
- **C4.** Update the **fourth** "§4.8" occurrence at `src/pages/ElanPathway.tsx:242` inside `buildEmrText`. Failing to update it would mean on-screen labels say §4.9 while EMR clipboard text still says §4.8 — a silent drift surface.
- **C5 (informational, not blocking).** No pre-existing claim maps to the real §4.8 (Antiplatelet — DAPT for minor stroke). The real §4.8 recommendation remains unregistered. Open a fresh TASKS.md item under PENDING to author a §4.8 Antiplatelet citation + claim when that recommendation is next touched. Not a blocker.

Once C1, C2, C3, C4 are reflected in the diff presented to V, this gate converts from approve-with-conditions to approve.
