# Clinical review — PR: ASCVD PCE Calculator

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: `ascvd-pce-formula-2013`, `ascvd-risk-tiers-2019`
- Citations affected: `goff-2014-pce-pooled-cohort-equations` (PMID 24222018), `arnett-2019-prevention-risk-tiers` (PMID 30879355)
- Surfaces changed: static JSX (`data-claim` attribute) on result card + tier recommendation paragraph in `src/pages/AscvdRiskCalculator.tsx`
- Evidence-verifier packet: not applicable (no new trial entry; calculator implements a published, well-established risk equation from a registered guideline citation)
- Trial-statistician report: not applicable (no trial-statistics display)

## Semantic validity

**Claim `ascvd-pce-formula-2013` — PCE formula and scope.**
Confirmed. The implementation in `calculatePce()` faithfully encodes the published equation `risk = 1 − S₀^exp(Σ(βᵢ·xᵢ) − mean)`. The four sex/race-specific coefficient sets (whiteFemale, aaFemale, whiteMale, aaMale) match Goff 2014 Appendix 7, Tables A and B, value-for-value, including the cross-product terms (lnAge×lnTC, lnAge×lnHDL, lnAge×lnSBP, lnAge×smoker), the group means, and the baseline survival probabilities. All sixteen spot-checked values match. The treated-vs-untreated BP branching correctly uses only one SBP-coefficient pair per evaluation, matching the published model specification. Scope of applicability ("adults 40–79 without prior clinical ASCVD") is preserved exactly.

**Claim `ascvd-risk-tiers-2019` — tier thresholds and statin recommendations.**
Confirmed. `tierOf()` encodes Arnett 2019 thresholds exactly: low <5%, borderline ≥5 to <7.5%, intermediate ≥7.5 to <20%, high ≥20%. Tier-specific recommendations preserve clinical force:
- Low: "Statin not recommended on risk basis alone" matches Arnett 2019.
- Borderline: "may be reasonable if risk-enhancing factors are present" matches Arnett 2019 §4.2 (COR IIb language preserved). Enumerated risk enhancers (family history, persistent LDL-C ≥160, metabolic syndrome, CKD, chronic inflammatory disease, Lp(a) ≥50, ApoB ≥130, ABI <0.9) match the guideline list.
- Intermediate: "Moderate-intensity statin recommended (COR 1, LOE A)" with conditional escalation to high-intensity if risk enhancers — matches Arnett 2019. Strength (Class I), evidence level (A), and qualifier gate preserved.
- High: "High-intensity statin (COR 1, LOE A). Target ≥50% LDL-C reduction" matches Arnett 2019 and the 2018 ACC/AHA Cholesterol Guideline LDL-C reduction target.

No drift detected in any of the five never-drift categories (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints).

## Citation accuracy

- `goff-2014-pce-pooled-cohort-equations`: registry entry correctly cites Circulation 2014;129(Suppl 2):S49–S73, Appendix 7, Tables A and B; PMID 24222018; DOI 10.1161/01.cir.0000437741.48606.98. Quoted coefficients in code are the canonical published values.
- `arnett-2019-prevention-risk-tiers`: registry entry correctly cites Circulation 2019;140:e596–e646; PMID 30879355; §4.1/§4.2. Tier thresholds and COR I LOE A statin recommendation at intermediate or high risk match this source.

## Editorial / expert context
Not applicable — no new trial entry in this PR. This is a calculator built on a long-established guideline-recommended risk equation; the surrounding editorial and meta-analytic context is well represented in the limitations panel (race-coefficient critique, contemporary-cohort overestimation, ongoing revision).

## Freshness
- `goff-2014-pce-pooled-cohort-equations`: `last_reviewed` 2026-05-25, window 24 months — pass.
- `arnett-2019-prevention-risk-tiers`: `last_reviewed` 2026-05-25, window 24 months — pass.

## Rationale
The calculator is a faithful implementation of the 2013 ACC/AHA Pooled Cohort Equations as published in Goff 2014 Appendix 7, with risk-tier interpretation and statin recommendations drawn correctly from Arnett 2019. All sixteen spot-checked coefficients across the four sex/race groups match the published source; the formula structure and treated-vs-untreated BP branching are implemented correctly. Tier thresholds and recommendation language preserve the strength, certainty, and qualifier structure of the 2019 guideline without drift. The primary-prevention scope notice and limitations panel are clear and clinically appropriate; the "Other race" caveat correctly states that the PCE has no coefficients for non-White, non-AA populations and that White coefficients are applied per the 2013 guidance, with explicit acknowledgement that this may misestimate risk. The result card uses `data-claim` tags on both the result block and the tier recommendation paragraph. No mandatory-block conditions are triggered.

## Required follow-ups
- None required for merge.
- Suggested (non-blocking): when the 2018 ACC/AHA Cholesterol Guideline (Grundy et al.) is added to the registry, link the "Target ≥50% LDL-C reduction" qualifier in the high-risk recommendation to that citation in addition to Arnett 2019.
- Suggested (non-blocking): consider surfacing a lifetime-risk framing note when calculated 10-year risk is very low at the youngest end of the eligible age range.
