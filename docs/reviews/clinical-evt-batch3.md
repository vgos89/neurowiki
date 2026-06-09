# Clinical review — EVT wave batch 3 (direct-vs-bridging + RESCUE BT)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-08

## Scope
- Trials: `devt-trial`, `direct-safe-trial`, `swift-direct-trial`, `mr-clean-no-iv-trial`, `skip-trial`, `rescue-bt-trial`. Two new fields each (`fullEligibility` + `armDetails`); curated summaries, stats, interpretation, `clinicalTrialsId` untouched.
- Surfaces: §13.3 structured data in `src/data/trialData.ts`. Evidence packet: `docs/evidence-packets/2026-06-08-evt-batch3.md`.
- Trial-statistician: n/a — no stats/archetype touched.

## Semantic validity (design fidelity = the high-risk check; all verified)
- **Design roles NOT inverted (all 6):** DEVT / DIRECT-SAFE / SWIFT DIRECT / MR CLEAN-NO IV / SKIP → `role:'intervention'` = thrombectomy ALONE (no IV thrombolysis); `role:'control'` = IV thrombolysis + thrombectomy. RESCUE BT → `role:'intervention'` = EVT + tirofiban / `role:'comparator'` = EVT + placebo; both arms' `coInterventions` open "All patients underwent rapid endovascular thrombectomy" (adjunct design, correctly modeled).
- **Doses:** SKIP control = **0.6 mg/kg low-dose** (explicitly flagged NOT 0.9) ✓. DEVT/MR CLEAN-NO IV/SWIFT DIRECT control = 0.9 mg/kg ✓. DIRECT-SAFE = mixed agent (alteplase 0.9 83% / TNK 17%, site-standard, Table 1) ✓. RESCUE BT tirofiban 10 µg/kg bolus → 0.15 µg/kg/min ≤24h ✓.
- Time windows, NIHSS/ASPECTS gates, occlusion sites, mRS limits transcribed verbatim; no never-drift violation.

## Citation accuracy
DIRECT-SAFE NCT03494920 / SWIFT DIRECT NCT03192332 `source:'clinicaltrials.gov'` match each record's `clinicalTrialsId`. DEVT/SKIP/MR CLEAN-NO IV/RESCUE BT `source:'publication'` with correct registry ids (ChiCTR-IOR-17013568 / UMIN000021488 / ISRCTN80619088 / ChiCTR-IOR-17014167) in `sourceLabel` — no fabricated NCT for registry-only trials. No citation re-mapped.

## Editorial / expert context (§8)
Not re-triggered — enrichment of shipped entries; no new-trial entry, no Class-E logic change. Stated explicitly.

## Freshness
No `last_reviewed` touched. `retrieved: '2026-06-08'` accurate. Landmark direct-EVT trials (2021–2022) within 36-month window. Pass.

## Rationale
Faithful, character-accurate transcription into two descriptive structured-data fields; the dangerous failure mode (inverting an arm role, or mislabeling RESCUE BT as direct-vs-bridging) checked on every arm and clean, including correct `comparator` role for the adjunct design. SKIP 0.6 mg/kg low-dose and RESCUE BT tirofiban regimen correct. No mandatory-block condition met. approve-with-conditions only because the enrichment surfaces pre-existing curated-summary factual errors that must be logged.

## Required follow-ups
1. **[CONDITION — file before PR close] Curated `inclusionCriteria` "posterior circulation" factual errors — escalate to a separate Class E/`-clinical` fix:**
   - **MR CLEAN-NO IV** curated says "Anterior or posterior circulation LVO" — the trial was **anterior-circulation only** (intracranial ICA / M1 / proximal M2). New `fullEligibility` correctly states anterior-only; the card is now internally contradictory.
   - **RESCUE BT** curated says "anterior or posterior circulation" — the trial was **anterior-circulation only** (ICA / M1 / M2). New `fullEligibility` correct.
   - **Severity: medium-high.** A clinician triaging a posterior/basilar LVO could misread either curated card as evidence governing their patient when the trial population excludes them (population/never-drift concern). These pre-exist this PR (not introduced by it) but must not be lost. Fix via a dedicated Class E gate, not here. RESCUE BT "NIHSS 4+" vs source "NIHSS 0–42" is lower-severity (defensible floor paraphrase) and can ride the same fix.
2. **[Parked]** SKIP curated "Pre-stroke mRS 0 or 1" vs publication mRS 0–2; SELECT2 curated NIHSS-floor omission (batch 2). Same separate-review cluster.
3. **[Accepted, no action]** Appendix-deferred control/criteria granularity (eMethods/Supplements) honestly disclosed in the `fullEligibility` exclusion blocks; main-article depth acceptable.
