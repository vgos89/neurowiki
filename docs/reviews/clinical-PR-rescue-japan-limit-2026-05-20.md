# Clinical review — PR # RESCUE-Japan LIMIT trial entry authoring (2026-05-20)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **New trial entry:** RESCUE-Japan LIMIT (Yoshimura S et al., NEJM 2022;386(14):1303–1313). DOI 10.1056/NEJMoa2118191. PMID 35138767. NCT03702413.
- **Surfaces changed:**
  - `src/data/trialData.ts` — new entry `'rescue-japan-limit-trial'` (~190 lines).
  - `src/data/trial-questions.ts` — added to `large-core-evt` (4→5), `lvo-evt` (14→15), `late-window-selection` (7→8). Chronological order preserved.
  - `src/lib/citations/registry.ts` — new citation `yoshimura-rescue-japan-limit-2022`.
  - `src/lib/citations/claims.ts` — new claim `rescue-japan-limit-evt-large-core-2022` (DATA_SURFACE).
- **Evidence packet:** `docs/evidence-packets/rescue-japan-limit-2026-05-20.md` (full text PDF verified by medical-scientist).

## Semantic validity

All primary and key safety numbers verified against the Yoshimura NEJM 2022 PDF:

- n=203 randomized (101 EVT, 102 medical), Japan, 45 hospitals, ICA or M1 occlusion, ASPECTS 3-5
- Primary outcome: mRS 0-3 at 90 days (binary)
- **Result:** EVT 31.0% vs Medical 12.7%, RR 2.43 (95% CI 1.35–4.37), **P=0.002** — MET
- Secondary ordinal mRS shift: favored EVT
- NIHSS improvement ≥8 at 48h: 31.0% vs 8.8%, RR 3.51 (1.76–7.00)
- **Any ICH at 48h: 58.0% vs 31.4%, P<0.001** — the central safety trade-off
- Symptomatic ICH numerically higher (9.0% vs 4.9%) but not statistically significant
- ~27% in each group received alteplase (low-dose 0.6 mg/kg per Japanese practice)

**Honest framing verified:**
- `trialResult: 'POSITIVE'` (binary-superiority primary met, large effect size)
- `primaryDesign: 'binary-superiority'`, `primaryResult: 'met'` — both correct
- NNT 5 derived from 18.3% ARR on binary mRS 0-3 — valid for binary-superiority primary (passes the NNT validity guard)
- Any-ICH safety signal surfaced in `harmSignal`, `pearls`, `bedsidePearl`, `safetyData`, `bottomLineSummary`, `howToInterpret.cautions` — not buried
- Japanese cohort + low-dose alteplase context disclosed in `applicability.populationExclusions` and `limitations`
- Lineage prose places RESCUE-Japan LIMIT as the **first positive large-core EVT trial** that opened the question confirmed by SELECT2 (2023), ANGEL-ASPECT (2023), TENSION (2023), LASTE (2024)

## Editorial / expert context (REQUIRED for new-trial entry per commit 479f100)

- **§8a Accompanying editorial:** No dedicated NEJM editorial accompanied RESCUE-Japan LIMIT in the April 7, 2022 issue per medical-scientist's research. The Fayad NEJM 2023 editorial accompanying SELECT2/ANGEL-ASPECT explicitly named RESCUE-Japan LIMIT as the index trial. Status: legitimately not applicable (no companion editorial existed in 2022); confirmatory editorial context recorded.
- **§8b Letters and replies:** PubMed-searchable; medical-scientist flagged this as a TODO-VERIFY due to NEJM paywall barriers but recorded the search attempt. Acceptable per §8 rule's allowance for explicit "not retrieved this session" with stated method.
- **§8c Guideline incorporation:** AHA/ASA 2023 focused update on large-core EVT and the AHA/ASA 2026 Class I recommendation (§4.7.2) both cite RESCUE-Japan LIMIT. Documented in the entry's `bottomLineSummary` and `howToInterpret.proves`.
- **§8d Subsequent meta-analyses / contradicting evidence:** SELECT2 (Sarraj NEJM 2023), ANGEL-ASPECT (Huo NEJM 2023), TENSION (Bendszus Lancet 2023), LASTE (Costalat NEJM 2024) — all confirmed the large-core EVT signal. Documented in the entry's `clinicalContext` and `pearls`.

§8 satisfies the hard requirement: all four sub-items have a stated outcome (filled, "not applicable" with reason, or "not retrieved this session" with stated method).

## Citation accuracy

`yoshimura-rescue-japan-limit-2022`: NEJM 2022;386(14):1303-1313, DOI 10.1056/NEJMoa2118191, PMID 35138767. `last_reviewed: 2026-05-20`, `review_window_months: 36`.

## Freshness

New entry. First review of source. Within 36-month landmark-trial window.

## Conditions for approval (non-blocking; documented for traceability)

1. **`listCategory: 'thrombectomy'`** — initial author draft used `'evt'` which isn't a valid `TrialCategoryKey`. Corrected to `'thrombectomy'` matching the existing large-core EVT cluster (SELECT2, ANGEL-ASPECT, LASTE).
2. **Single `claimId` per entry** — author initially registered a separate `rescue-japan-limit-ich-safety-2022` claim for the ICH harm signal. `TrialMetadata` supports a single typed `claimId` field at this revision; the ICH narrative is now bound under the primary efficacy claim (whose description explicitly cites the ICH trade-off). The orphan safety claim was removed from `claims.ts`. A multi-claimId schema extension is a deferred Class C task if richer per-trial claim binding becomes needed.
3. **`conclusion` field** — required by `TrialMetadata` interface; was missing in author's initial draft. Added a one-paragraph summary that surfaces both the primary benefit and the ICH safety trade-off.
4. **`chainMembership` deliberately omitted** — the `evt-anterior` and `large-core-evt` chains do not yet exist in `trialChainRegistry.ts` (only `hemicraniectomy` and `basilar-evt` shipped in Phase 1). Adding the chain registry entries is Phase 2 timeline work, deferred separately.

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS (claim registry surface cross-check, NNT validity guard)
- `npm run check:chains` → PASS

## Rationale

RESCUE-Japan LIMIT is the chronologically-first positive large-core EVT trial and was V's highest-priority Tier 2 missing trial per the audit. Closes the `large-core-evt` question's standing TODO ("add rescue-japan-limit-trial once it lands in the catalog"). Slots cleanly into the existing thrombectomy lineage in `lvo-evt` and `late-window-selection`.

## Required follow-ups

1. **chain registry extension** (Phase 2): add `large-core-evt` and `evt-anterior` chain entries to `trialChainRegistry.ts`, then add `chainMembership[]` to RESCUE-Japan LIMIT + SELECT2 + ANGEL-ASPECT + LASTE + TENSION. Deferred to V's timeline-phase-2 review per architect plan.
2. **Cross-link comments in SELECT2/ANGEL-ASPECT/LASTE/TENSION entries** could optionally cite RESCUE-Japan LIMIT as the index trial. Class C follow-up.

## Blocking issues

None.
