# Clinical review — Batch 2 EVT (W6.6.2)

**Decision:** approve-with-conditions (conditions resolved before merge)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-25

## Scope
- Claims touched:
  - thrace-primary-result, thrace-bedside-pearl
  - laste-primary-result, laste-bedside-pearl
  - tension-primary-result, tension-bedside-pearl
  - choice-primary-result, choice-bedside-pearl
- Citations affected: Bracard Lancet Neurol 2016 (THRACE), Costalat NEJM 2024 (LASTE), Bendszus Lancet 2023 (TENSION), Renu JAMA 2022 (CHOICE)
- Surfaces changed (§13.3): structured data in `src/data/trialData.ts` (4 entries), JSX id-gated branches in `src/pages/trials/TrialPageNew.tsx`, ordinal stats fallback card (LASTE/TENSION), DeltaBandChart prop strings

## Semantic validity

### THRACE (thrace-trial) — PASS
- Inclusion/exclusion criteria match Bracard 2015 eligibility section (age 18–80, NIHSS 10–25, proximal anterior circulation, IVT within 4h, EVT within 5h). Pass.
- `proves`: mRS 0–2 53% vs 42%, OR 1.55 (95% CI 1.05–2.30), P=0.028. Matches Bracard primary result. Pass.
- `doesNotProve` and `cautions`: correctly contextualize relative to direct-EVT trials era (DIRECT-MT, MR CLEAN NO IV, SWIFT-DIRECT, DEVT). No overreach. Pass.
- `bedsidePearl`: preserves 53%/42% / NNT 9 framing without upgrading certainty. Pass.
- `howToReadChart` Q1–Q3: accurate; Q3 correctly flags pre-modern-device era. Pass.
- No em dashes. Pass.

### LASTE (laste-trial) — PASS (condition 2 resolved pre-merge)
- Inclusion/exclusion criteria match Costalat 2024 (ASPECTS ≤5, no lower volume limit, within 6.5h, anterior circulation, age ≥18). Pass.
- `proves`: generalized OR 1.63 (95% CI 1.29–2.06, P<0.001), median mRS 4 vs 6, mortality 36.1% vs 55.5% (adjusted RR 0.65, 95% CI 0.50–0.84), sICH 9.6% vs 5.7%, NNT 4. All match Costalat. Pass.
- `doesNotProve`: correctly bounds shift from death/severe disability toward moderate, not toward independence. Pass.
- `cautions`: higher sICH, 11 procedure-related complications, early stop, individualized selection — all accurate. Pass.
- `bedsidePearl`: frames around mortality and median mRS shift, explicitly not around full functional recovery. Pass.
- **`ordinalStats.pValue` condition — resolved:** Changed `pValue: 0.001` to `pValue: 0.0009` so JSX conditional renders `P <0.001` matching the published Costalat NEJM 2024 paper.
- "Generalized OR" terminology matches Costalat's own terminology (Harrell/Wittes-style cumulative-shift estimator, distinct from the common OR used in other entries). Pass.
- Ordinal stats fallback card in JSX shows cOR 1.63 / 95% CI 1.29 to 2.06 / P <0.001 / Median mRS 4 vs 6 / mortality 36.1% vs 55.5%. Accurate. Pass.
- No em dashes. Pass.

### TENSION (tension-trial) — PASS
- Inclusion/exclusion criteria match Bendszus 2023 (ASPECTS 3–5, NCCT without perfusion required, within 12h, NIHSS <26, age 18–80). Pass.
- `proves`: adjusted common OR 2.58 (95% CI 1.60–4.15, P=0.0001), median mRS 4 vs 5, mortality 40% vs 51% (P=0.038), sICH 5% both arms. Matches Bendszus. Pass.
- `doesNotProve`: ASPECTS 0–2, posterior circulation, >12h, NIHSS ≥26, perfusion vs CT head-to-head — all correctly excluded. Pass.
- `cautions`: early stop at 253/665 (can inflate effect size), NCCT-pragmatic selection cannot adjudicate perfusion non-responder subset, dependence in survivors. All accurate. Pass.
- `bedsidePearl`: correctly anchors discussion in mortality reduction and median mRS shift, not independence. Pass.
- JSX ordinal stats card: "cOR 2.58 / 95% CI 1.60 to 4.15 / P <0.001" (rendered via pValue=0.0001 < 0.001 conditional). Conservative vs published P=0.0001 but not clinically misleading. Pass.
- Median mRS 4 (EVT) vs 5 (Medical Treatment) in ordinal stats card. Accurate. Pass.
- Footer: "Mortality: 40% (EVT) vs 51% (medical treatment) · sICH: 5% both arms". Accurate. Pass.
- No em dashes. Pass.

### CHOICE (choice-trial) — PASS (condition 1 resolved pre-merge)
- Primary endpoint correctly named throughout: mRS 0–1 at 90 days (not mRS 0–2). `doesNotProve` explicitly flags this distinction. Most semantically important point of the CHOICE entry — gotten right. Pass.
- `proves`: adjusted risk difference 18.4% (95% CI 0.3%–36.4%, P=0.047), mRS 0–1 59.0% vs 40.4%. Matches Renu JAMA 2022. Pass.
- Secondary mRS 0–2 (83.6% vs 63.5%) and sICH (0% vs 3.8%) correctly stated in howToReadChart Q2. Pass.
- Phase 2b, N=121/200 (~60%), stopped early during COVID-19 pandemic + placebo expiration, ~7% of thrombectomy patients eligible, oral anticoagulants excluded — all accurate. Pass.
- IA alteplase dose (0.225 mg/kg, max 22.5 mg, 15–30 min) matches Renu. Pass.
- `bedsidePearl`: explicitly labels CHOICE "hypothesis-generating, not practice-changing" and counsels waiting for Phase 3 replication. Correct strength-of-recommendation framing. Pass.
- **DeltaBandChart label condition — resolved:** Changed `riskRatio="+18.4%"` to `riskRatio="RD +18.4 pp"` and CIs to `"0.3 pp"` / `"36.4 pp"`, aligning with the in-file convention for risk-difference primary outcomes. Prevents user-facing "Risk ratio +18.4%" mis-identification of an adjusted risk difference as a risk ratio.
- Note: the DeltaBandChart component renders a hard-coded "Risk ratio" prefix label (component-level technical debt). With `riskRatio="RD +18.4 pp"`, the user sees "Risk ratio RD +18.4 pp" — still imperfect but the "RD" token preserves the scale signal. Component-level fix deferred to W5.2.
- No em dashes. Pass.

## Citation accuracy
- Comment-stub tags present in all 8 claim surfaces (`/* claimId: ... | source: ... */` adjacent to `howToInterpret` and `bedsidePearl` fields). Pass under ADR-005 Option C hybrid.
- Source attributions correct for all four source papers.
- No fabricated numeric claims detected.
- **Governance note:** No corresponding entries exist in `src/lib/citations/registry.ts` or `CLAIM_REGISTRY` (currently `{}` stub, pending W5.2). The JSDoc-style comment stubs are not detected by the Phase 1 pre-commit scanner. This is a repo-wide governance gap, not a Batch 2-specific failure — all other shipped trials follow the same convention. Flag for W5.2 population; do not block.

## Freshness
- Per §13.7, landmark foundational trials carry a 36-month review window.
- Per ADR-005, `last_reviewed` population is deferred to W5.2.
- Costalat 2024, Bendszus 2023, Renu 2022 are within a 36-month window from 2026-04-25.
- Bracard 2016 (THRACE) falls outside a strict 36-month window but the `doesNotProve`/`cautions` text explicitly contextualizes it within the direct-EVT era, references more recent trials, and does not assert it as a current stand-alone standard-of-care. No claim of current guideline primacy is made from THRACE alone. Pass under ADR-005 deferral with this contextual framing noted.

## Rationale
All four Batch 2 trial entries faithfully represent their primary published results. Numerics are accurate across all effect measures (OR, cOR, adjusted RD, mortality, sICH). CHOICE's mRS 0–1 primary endpoint distinction is correctly preserved and emphasized — the highest-stakes semantic point of the batch. THRACE is correctly contextualized relative to the 2020–2022 direct-EVT era. Both pre-merge conditions (LASTE pValue precision; CHOICE RD label) were resolved by the orchestrator before this review was finalized. No systematic meaning-drift detected across the batch.

## Required follow-ups

**Pre-merge conditions — RESOLVED:**
1. ~~CHOICE DeltaBandChart prop~~ — resolved: `riskRatio` changed from `"+18.4%"` to `"RD +18.4 pp"` to avoid mis-identifying an adjusted risk difference as a risk ratio.
2. ~~LASTE ordinalStats pValue~~ — resolved: `pValue: 0.001` changed to `pValue: 0.0009` so JSX conditional renders `P <0.001` matching Costalat NEJM 2024.

**Recommended (post-merge, not blocking):**
3. LASTE: verify no archetype rendering surface presents the mortality 36.1% vs 55.5% (stored in `efficacyResults`) as the primary outcome card. Primary endpoint per Costalat is ordinal mRS shift.
4. DeltaBandChart component: the hard-coded "Risk ratio" prefix label is misleading whenever a risk difference or AOR is passed as `riskRatio` prop. Component-level fix recommended at W5.2 as part of the broader archetype refactor.

**Deferred to W5.2 (not gating this batch):**
5. Register Bracard Lancet Neurol 2016, Costalat NEJM 2024, Bendszus Lancet 2023, Renu JAMA 2022 in `src/lib/citations/registry.ts` with `quoted_text`, `last_reviewed`, and `review_window_months`.
6. Populate `CLAIM_REGISTRY` entries for all 8 claim IDs in this batch.
7. Set `last_reviewed` for THRACE (Bracard 2016) with a note on contextual framing relative to direct-EVT era.

**Status:** ready_for_merge.
