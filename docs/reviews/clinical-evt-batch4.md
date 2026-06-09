# Clinical review — EVT wave batch 4 (final: technique + adjunct + medium-vessel)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-09

## Scope
- Trials: `aster-trial`, `aster2-trial`, `compass-trial`, `choice-trial`, `distal-trial`, `escape-mevo-trial`. Two new fields each (`fullEligibility` + `armDetails`); no curated summary, stats, interpretation, or citation `last_reviewed` changed. DISTAL/ESCAPE-MeVO `clinicalTrialsId` present-once (not duplicated).
- Surfaces: §13.3 structured data in `src/data/trialData.ts`. Evidence packet: `docs/evidence-packets/2026-06-08-evt-batch4.md`.
- Trial-statistician: n/a — no stats/archetype touched. ESCAPE-MeVO 2026-05-20 Class E stats correction + DISTAL `ordinalStats` intact, undisturbed.

## Semantic validity (design roles = high-risk; all verified NOT inverted)
- **ASTER:** `intervention` = first-line contact aspiration (ADAPT); `comparator` = first-line stent retriever. Technique-under-test → intervention. ✓
- **ASTER2:** `intervention` = combined aspiration + stent retriever; `comparator` = stent retriever alone. ✓
- **COMPASS:** `intervention` = aspiration-first (ADAPT); `comparator` = stent-retriever-first. ✓
- **CHOICE (adjunct):** `intervention` = EVT + IA alteplase; `comparator` = EVT + placebo (both arms had EVT first). **Dose confirmed = IA 0.225 mg/kg (max 22.5 mg)**, NOT the IV 0.9 mg/kg; internally consistent with untouched curated copy. ✓
- **DISTAL / ESCAPE-MeVO (standard EVT-vs-medical, distal/medium-vessel):** `intervention` = EVT + medical; `control` = medical alone. ✓
Procedural metadata (device choice, balloon-guide, IV-thrombolysis co-rates, reperfusion %, page cites) faithful. No never-drift violation.

## Citation accuracy
All six `fullEligibility`: `source: 'clinicaltrials.gov'`, NCT `sourceUrl` matches the record's `clinicalTrialsId` (ASTER NCT02523261, ASTER2 NCT03290885, COMPASS NCT02466893, CHOICE NCT03876119, DISTAL NCT05029414, ESCAPE-MeVO NCT05151172). Registry verbatim (incl. documented OCR fix "Cons-indication" → "Contraindication" on ASTER). No registry citation altered.

## Editorial / expert context (§8)
Not re-triggered — enrichment of established records; no new-trial entry, no Class-E logic change. Stated explicitly.

## Freshness
No `last_reviewed` touched. `retrieved: '2026-06-08'` registry-snapshot, in window. Trial citations untouched.

## Rationale
Clean, scope-disciplined enrichment of six EVT records; design-role direction correct on all six (the one dangerous failure mode), CHOICE dose is the correct IA 0.225 mg/kg, provenance resolves, NCTs present-once. COMPASS registry-vs-publication divergence is legitimate protocol-vs-conduct layering, parked. No mandatory-block condition met. Approve.

## Required follow-ups
- **COMPASS registry-vs-publication nuance (acceptable-as-documented; not blocking).** `fullEligibility` = registry protocol (NIHSS ≥8 / ASPECTS<7); curated `inclusionCriteria` = published conduct (NIHSS ≥6 / ASPECTS >6). Both legitimately sourced. Optional low-priority UI hygiene: a "registered protocol vs as-conducted" label if both ever render adjacent. Park; no decision needed.
- **DISTAL time-window granularity (informational).** Same layering: `fullEligibility` carries "within 6 h, OR 6–24 h with mismatch"; curated rolls up to "within 24 hours." Legitimate/consistent; awareness only.
