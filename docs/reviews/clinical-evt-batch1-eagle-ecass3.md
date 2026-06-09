# Clinical review — EVT batch-1 enrichment + EAGLE link removal + ECASS III COR alignment

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-08

## Scope
- **Change sets:** 3 — (A) EVT batch-1 `fullEligibility` + `armDetails` enrichment of 6 trials; (B) EAGLE wrong-NCT registry-link removal; (C) ECASS III `bottomLineSummary` recommendation-class alignment.
- **Trials touched:** `mr-clean-trial`, `extend-ia-trial`, `swift-prime-trial`, `revascat-trial`, `thrace-trial`, `direct-mt-trial`, `eagle-trial`, `ecass3-trial` (all in `src/data/trialData.ts`).
- **Claims touched:** no registered `claimId`-tagged surface text altered. New `fullEligibility`/`armDetails` are structured trial-protocol descriptors. The ECASS III edit touched `bottomLineSummary` (guideline-currency restatement).
- **Citations (reference only):** `aha-asa-2026-4.6.2` (governs ECASS III change), `aha-asa-2026-4.6.3` (confirmed NOT applicable to ECASS III standard population), `aha-asa-2026-4.6.1`.
- **Surfaces changed:** §13.3 structured data in `trialData.ts` (`fullEligibility`, `armDetails`); one `bottomLineSummary` string (ECASS III).
- **Evidence-verifier packet:** `docs/evidence-packets/2026-06-08-evt-batch1.md` (Change set A). B and C are data-integrity / guideline-currency alignments.
- **Trial-statistician:** n/a — no stats/p-value/NNT/mRS-shift/archetype changes.

## Semantic validity
### A — EVT batch-1 enrichment (6 trials)
1. **Arm fidelity (both arms): CONFIRMED.** MR CLEAN (IA-treatment+usual-care / usual-care-alone; IA-thrombolytic dose caps; both-arm IV-alteplase rates), EXTEND-IA (Solitaire FR + alteplase / alteplase alone), SWIFT PRIME (Solitaire FR/2 + t-PA / t-PA alone; cervical-stenting-not-permitted nuance), REVASCAT (Solitaire + medical therapy / medical-therapy-alone, no crossovers) — all match packet page-cites.
2. **Design fidelity (highest-risk): CONFIRMED, not conflated.** THRACE = bridging (intervention "IV alteplase + thrombectomy"; control "IV alteplase ALONE" — note states "NOT thrombectomy alone"). DIRECT-MT = direct-vs-bridging (intervention "thrombectomy ALONE"; control "IV alteplase + thrombectomy"). Roles correct; the overlapping arm types distinguished.
3. **MR CLEAN provenance: CONFIRMED.** `source: 'publication'`, NTR1804 / ISRCTN10888758, no NCT; exclusion = single appendix-deferred note; curated `exclusionCriteria[]` retained as summary, not relabeled verbatim.
4. **REVASCAT exclusion verbatim re-pull: CONFIRMED.** Two registry-labeled groups, registry's own wording incl. the European-decimal typo "4,5 hours" — unmistakably the raw CT.gov string, not the condensed packet summary. Preserve the typo (verbatim contract).
5. **Eligibility groups/provenance: CONFIRMED** for all 6 (EXTEND-IA dual-target imaging group; SWIFT PRIME clinical+imaging exclusion groups; THRACE terse registry block + curated richer layer; DIRECT-MT "according to AHA guidelines" parent framing preserved).
6. **Scope: CONFIRMED.** Only `fullEligibility` + `armDetails` added, plus verified backfills — THRACE `doi 10.1016/S1474-4422(16)30177-6` + `pmid 27567239`; DIRECT-MT `pmid 32374959`. No stats/efficacy/ordinalStats/interpretation altered.

### B — EAGLE registry-link removal: CONFIRMED
`clinicalTrialsId: 'NCT00622778'` removed (resolved to unrelated "Minor Head Injury" study); explanatory comment added; repo-wide grep confirms no residual deep-link; trial keeps `source` + resolvable `doi 10.1016/j.ophtha.2010.03.061`. Mirrors the NINDS fix.

### C — ECASS III recommendation-class alignment: CONFIRMED CORRECT
New text: "ECASS III established the 3–4.5h extension; AHA/ASA 2026 §4.6.2 now recommends IV thrombolysis within 4.5h (COR 1) for standard-eligible patients."
Verified against `registry.ts`: `aha-asa-2026-4.6.2.quoted_text` = within 4.5h, tenecteplase or alteplase "is recommended (Class I, Level A)" — exact match. **Block-condition check:** `aha-asa-2026-4.6.3` governs the 4.5–24h EVT-ineligible LVO "may be considered (Class IIb, Level B-R)" scenario — NOT ECASS III's standard 3–4.5h population. The prior "§4.6.3 COR 2a" was wrong on BOTH section and class; the correction (§4.6.2 COR 1) is consistent with the codebase framing (NINDS §4.6.1 0–3h; ECASS III §4.6.2 ≤4.5h COR 1; ORIGINAL/EXTEND-IA TNK §4.6.2 Class I Level A). No never-drift violation (strength corrected to the source's actual COR 1, not an unsupported upgrade).

## Citation accuracy
§4.6.2 current/correct (ECASS III restatement matches `quoted_text`). §4.6.3 confirmed NOT governing for ECASS III's standard population. Change set A citations = CT.gov NCT pages + page-cited NEJM/Lancet Neurol PDFs (all NCTs resolve except MR CLEAN, by-design publication source). EAGLE retains resolvable DOI.

## Editorial / expert context (mandatory-block #8)
**Not re-triggered.** A = enrichment of long-shipped entries (no new-trial entry, no Class-E logic change). C = guideline-currency alignment using the codebase's own already-cited 2026 guideline (no new evidence claim). B = data-integrity removal. §8 not applicable to any — stated explicitly, not silently omitted.

## Freshness
§4.6.2 `last_reviewed 2026-05-19` (within 6-mo window). §4.6.3 / §4.6.1 within window (reference-only). Trial citations (2015–2020 landmark EVT, 36-mo window); CT.gov + PDF retrieved 2026-06-08. No `last_reviewed` edited → no §13.6 refresh triggered.

## Rationale
All three change sets clinically faithful. A preserves design fidelity (THRACE/DIRECT-MT not conflated), records both-arm IV-thrombolytic co-treatment, REVASCAT verbatim re-pull, MR CLEAN publication provenance; scope confined. B cleanly removes a wrong-trial link. C corrects ECASS III against the codebase's own cited guideline (§4.6.2 COR 1 for ≤4.5h; §4.6.3 = distinct 4.5–24h Class IIb). approve-with-conditions solely because a generated mirror still carries pre-change text (mechanical fix).

## Required follow-ups
1. **[condition — fix before clean merge] Regenerate `src/data/trialListData.cardmeta.generated.ts`** (line 594 carries the stale ECASS III "§4.6.3 COR 2a" text). Mechanical — the build's `gen-trial-card-meta` prebuild regenerates it; `check:card-meta` confirms sync. The single gating condition.
2. **[carry — do NOT "fix"]** REVASCAT exclusion "4,5 hours" is the registry's verbatim typo; preserve it.
3. **[carry — acceptable]** Control-arm BP/glucose/antithrombotic granularity for MR CLEAN/THRACE/SWIFT PRIME/EXTEND-IA is appendix-deferred at main-article depth; appendix backfill optional.
4. **[done]** THRACE/DIRECT-MT doi/pmid backfills verified and in place.
