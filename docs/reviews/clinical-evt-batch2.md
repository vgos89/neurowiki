# Clinical review — EVT wave batch 2 (large-core + basilar)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-08

## Scope
- Trials: `select2-trial`, `angel-aspect-trial`, `tension-trial`, `laste-trial`, `attention-trial`, `baoche-trial`. Two new fields each: `fullEligibility` + `armDetails`. No registered claim mutated; no stats/interpretation/curated-summary/`clinicalTrialsId` changed (one NCT per record, no duplication).
- Surfaces: §13.3 structured data in `src/data/trialData.ts`.
- Evidence packet: `docs/evidence-packets/2026-06-08-evt-batch2.md` (evidence-verifier ×3, schema-normalized, CT.gov-verbatim eligibility + PDF-cited arms).
- Trial-statistician: n/a — no stats/NNT/CI/archetype touched.

## Semantic validity (per trial — verified vs packet; never-drift categories intact)
- **SELECT2 (NCT03876457):** age 18–85, NIHSS ≥6, 0–24h LKW→puncture, pre-mRS 0–1, ASPECTS 3–5 OR core ≥50cc; control = medical-management-alone; IV thrombolysis (alteplase/TNK) both arms ≤4.5h. Substantive control. No drift.
- **ANGEL-ASPECT (NCT04551664):** age 18–80, NIHSS 6–30, ≤24h, ASPECTS 3–5 any core / >5 (6–24h) 70–100ml / <3 70–100ml; full-dose alteplase 0.9mg/kg or urokinase ~28% both groups. No drift.
- **TENSION (NCT03094715):** dual windows preserved — randomization ≤11h AND EVT completion ≤12h; NIHSS <26; ASPECTS 3–5; alteplase 39%/34% (Table 1 p.1757). No temporal drift.
- **LASTE (NCT03811769):** onset ≤6.5h; ASPECTS ≤5 (≥80y: 3–5); imaging ≤3h pre-randomization; procedure start ≤30min; NIHSS >6; thrombolysis ~34.6%/~35.2% (Table 1 p.1681). No drift.
- **ATTENTION (NCT04751708):** basilar occlusion confirmed; ≤12h (wake-up = LKW); NIHSS ≥10; PC-ASPECTS gate <6 (<80y)/<8 (≥80y); thrombolysis 31%/34%; 2:1 randomization. No drift.
- **BAOCHE (NCT02737189):** basilar/bilateral-vertebral TIMI 0–1; 6–24h; age 18–80; NIHSS ≥6; PC-ASPECTS <6 + Pons-Midbrain Index ≥3 exclusion; Solitaire-only with rescue-device restriction; thrombolysis 14%/21%. No drift.

## Citation accuracy
Each `fullEligibility.source: 'clinicaltrials.gov'` with `sourceUrl` NCT matching the record's `clinicalTrialsId` (1:1 verified) + `retrieved: '2026-06-08'`. Each `armDetails` note carries author/year/page anchors to the primary publication (Sarraj/Huo/TENSION-Lancet/Costalat/Tao/Jovin). No registry citation mutated; no dead reference.

## Editorial / expert context (§8)
Not re-triggered — long-shipped entries, non-logic enrichment (verbatim eligibility + arm disclosure only); no new-trial entry, no Class-E logic change. Stated explicitly.

## Freshness
No `last_reviewed` refreshed → §13.6 not invoked. `fullEligibility.retrieved` = first-capture provenance (2026-06-08). Underlying landmark/foundational trial citations within 36-month window.

## Rationale
Faithful, in-scope enrichment of six already-reviewed large-core/basilar EVT records, transcribed verbatim from a triple-verified packet against CT.gov + primary publications. Time windows (incl. TENSION 11h/12h, BAOCHE 6–24h), age caps, NIHSS floors, ASPECTS/core gates, and both-arm dose/route preserved exactly; substantive standard-of-care controls correctly distinguished. No mandatory-block condition met. Approve.

## Required follow-ups
- **(Parked — do not fix here)** SELECT2 curated `inclusionCriteria` omits the NIHSS ≥6 floor that the new `fullEligibility` carries. Separate `-clinical` item.
- **(Acceptable, appendix-deferred)** Control-arm BP/glucose/antithrombotic granularity at main-article depth; full peri-procedural detail in each Supplementary Appendix.
- **(Audit note)** TENSION exclusion "less than 12 months" is a deliberate normalization of a CT.gov data-entry artifact ("less than 6 Months12 months") to the published value. No action.
