# Clinical review — Prompt 5d.1: CHA₂DS₂-VASc Score Calculator

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: Opus 4.7)
**Date:** 2026-05-05
**Pass:** 2 (first pass blocked; three semantic violations corrected before second pass)

## Scope
- Claims touched: scoring weights, risk-tier guidance (4 tiers), sex-stratified threshold, annual stroke rate table, HAS-BLED cross-link, footer disclaimer
- Citations affected: Lip GY et al. Chest 2010;137(2):263-272 (DOI 10.1378/chest.09-1584); Joglar JA et al. JACC 2024;83(1):109-279 (DOI 10.1016/j.jacc.2023.08.017)
- Surfaces changed: structured data (`src/data/cha2ds2VascData.ts`); static JSX (`src/pages/Cha2ds2VascCalculator.tsx`)

## First-pass blocking issues (now resolved)

1. **RESOLVED — Never-drift violation (score 1, COR 2a).** "may be reasonable" → "is reasonable (COR 2a)". Guideline verbatim matched.
2. **RESOLVED — Never-drift violation (score ≥4, invented tier).** "strongly recommended" → "recommended (COR 1)". No non-guideline strength tier.
3. **RESOLVED — Never-drift violation (sex-stratified threshold).** `calculateCha2ds2Vasc()` now derives risk tier from `clinicalScore = score - (female ? 1 : 0)`. Women at total score=2 (sex + 1 factor) correctly receive COR 2a ("is reasonable"), not COR 1. Sex-only (total score=1, clinicalScore=0) correctly receives "not recommended" without a special-case branch.

## Semantic validity (second pass)

- **Score 1 guidance:** "Anticoagulation is reasonable (COR 2a)..." — COR 2a verbatim, no strength drift. Pass.
- **Score ≥2 (men) / ≥3 (women) guidance:** "Anticoagulation recommended (COR 1)..." — COR 1 verbatim, no invented tiers. Pass.
- **Sex-stratified logic:** clinicalScore derivation correctly implements men ≥2 / women ≥3 threshold. All 6 boundary cases verified. Pass.
- **Annual stroke rate table:** values match Lip 2010 Table 3 unadjusted rates; score-7 dip artifact preserved as published with explanatory comment. Caption correctly bounds to Euro Heart Survey cohort with "rates in other registries vary." Pass.
- **HAS-BLED cross-link:** "does not contraindicate anticoagulation" framing consistent with 2023 guideline. Pass.
- **Footer disclaimer:** sex-stratified threshold stated correctly ("COR 1 at total score ≥2 in men or ≥3 in women"). Pass.
- **Risk factor sub-labels (CHF, HTN, DM, Vascular, Stroke/TIA):** definitions match Lip 2010 component definitions. Pass.

## Citation accuracy

- Lip 2010 — author list, journal, volume, issue, pages, DOI verified correct.
- Joglar 2024 (2023 AF guideline) — JACC 2024;83(1):109-279; DOI 10.1016/j.jacc.2023.08.017 — correct.
- Supporting trial mentions (AFASAK, BAFTA, RE-LY, ARISTOTLE) — listed in footer as supporting context only, not used to support specific COR statements. Acceptable.

## Freshness

- Lip 2010: foundational landmark source; score weights are stable; 36-month review window applies.
- Joglar 2024 (2023 AF guideline): current US AF guideline as of review date 2026-05-05; no known superseding focused update.

## Rationale

All three first-pass semantic violations are resolved. Recommendation-strength language matches the 2023 ACC/AHA/ACCP/HRS guideline COR 1/COR 2a distinctions exactly. The sex-stratified threshold is implemented at the algorithm level (not as a UI patch), correctly handling all boundary cases. The remaining conditions (citation registry, claim tagging) are a systemic backlog gap predating this PR, shared by all 10 existing calculators. The reviewer acknowledges the explicit scoping decision to escalate the registry work separately rather than blocking this PR.

## Required follow-ups (conditions)

1. Register `lip-2010-eurohs` and `acc-aha-accp-hrs-af-2023` in `src/lib/citations/registry.ts` with `quoted_text` for each load-bearing claim (see claim IDs below).
2. Tag claim surfaces with `data-claim` (JSX) and `claimId` (structured data) per §13.4:
   - `cha2ds2vasc-cor2a-clinical-1` → `RISK_GUIDANCE.low_moderate`
   - `cha2ds2vasc-cor1-clinical-ge2` → `RISK_GUIDANCE.moderate_high` and `.high`
   - `cha2ds2vasc-very-low-no-anticoag` → `RISK_GUIDANCE.very_low`
   - `cha2ds2vasc-doac-preferred-nvaf` → DOAC preference clauses
   - `cha2ds2vasc-stroke-rate-table` → `ANNUAL_STROKE_RATE` + legend caption
   - `cha2ds2vasc-sex-threshold-disclaimer` → footer threshold clarification
   - `cha2ds2vasc-hasbled-not-contraindication` → HAS-BLED cross-link paragraph
3. Map claims in `CLAIM_REGISTRY` (`src/lib/citations/claims.ts`).
4. Run §13.6 six-step checklist at registry creation to set `last_reviewed = 2026-05-05`.
5. Systemic: repeat registry/tagging exercise for existing 10 calculators (V-escalated, tracked separately).
6. Editorial (non-blocking): consider an inline note in the interpretation panel noting that the rate table is indexed by total score while the recommendation tier reflects sex-stratified threshold.
