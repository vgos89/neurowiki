# Clinical review — Batch 3 Wave 2 (data population: 13 secondary-prevention trials)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-08

## Scope

- **Trials touched (13):** TIMING, OPTIMAS, ELAN, CHANCE, POINT, SAMMPRIS, WEAVE, SOCRATES, SPS3, SPARCL, THALES, INSPIRES, CHANCE-2
- **Fields populated:** `primaryDesign` + `primaryResult` (12 trials; ELAN omitted by schema contract); `harmSignal` (6 trials: POINT, SAMMPRIS, SPS3, SPARCL, THALES, INSPIRES); `applicability` (most trials)
- **Citations affected (PMIDs, all attested by medical-scientist this session):** 36065821, 39491870, 37222476, 23803136, 29766750, 21899409, 31125298, 27160892, 22931315, 16899775, 32668111, 38157499, 34708996
- **Surfaces changed (§13.3):** structured data in `src/data/trialData.ts` — Phase 1 surface (adjacent `claimId` tagging method per §13.4; claim registry is empty-stub state W5.2 not yet landed; see follow-up #5)

## Semantic validity

### `harmSignal` text — five never-drift categories

| Trial | Rec. strength | Action verbs | Qualifiers/gates | Certainty markers | Temporal constraints |
|---|---|---|---|---|---|
| POINT | None | None | "~21d crossover" preserved | HR 2.32, p=0.02 correct | "~21d" preserved |
| SAMMPRIS | None | None | "Stenting arm" gate explicit | 14.7% vs 5.8%, p=0.002 correct | "30-day" preserved |
| SPS3 | None | None | "Long-term DAPT (mean 3.4y)" gate preserved | HR 1.52 (CI 1.14–2.04) + HR 1.97 (CI 1.41–2.71) correct | "mean 3.4y" preserved |
| **SPARCL** | None | None | "atorvastatin vs placebo" preserved | 55 vs 33 counts correct — **BUT "2.2% absolute stroke reduction" conflicts with this record's own efficacyResults (11.2% vs 13.1% = 1.9pp) and existing pearls/NNT.** | N/A |
| **THALES** | None | None | "noncardioembolic stroke only" preserved | **`p=0.001` must be `P<0.001` — this record's existing safetyProfile tooltip and Johnston NEJM 2020 both report P<0.001; `=` is not equivalent to `<`.** | N/A |
| INSPIRES | None | None | "Moderate-severe bleeding (GUSTO)" criterion preserved | HR 2.08 (95% CI 1.07–4.04) rests on medical-scientist PubMed attestation; internally consistent with rates | N/A |

**Mandatory fixes identified for SPARCL and THALES before merge — see conditions #1 and #2.**

### `primaryDesign`/`primaryResult` classifications

- **TIMING + OPTIMAS (`noninferiority` / `noninferiority-established`):** Concordant with existing records. OPTIMAS NI margin (2pp) not yet in the existing record — must be added to `applicability` in this wave, resting on medical-scientist's Werring Lancet 2024 attestation.
- **SAMMPRIS (`binary-superiority` / `harm-stopped`):** Correct — DSMB stopped enrollment for safety signal in the stenting (intervention) arm; matches schema definition. Approved.
- **SPS3 (`binary-superiority` / `not-met`):** Defensible — trial *completed* enrollment; harm (mortality + bleeding excess) was a *result*, not a stopping reason. The `harmSignal` field carries the harm context. The alternative (`harm-stopped`) would be misleading because SPS3 was not stopped for harm. `not-met` + `harmSignal` is the correct combination. Code comment required documenting the rationale. **Condition #3.**
- **SPARCL (`binary-superiority` / `met`):** Correct — primary endpoint (fatal/nonfatal stroke) was met (HR 0.84, p=0.03). Hemorrhagic stroke signal handled by `harmSignal`. Approved.

### ELAN special handling

`specialDesign: 'estimation-trial'` preserved; `primaryDesign`/`primaryResult` left null per schema contract (line 285). Only `applicability.populationExclusions` added with estimation-design caveat. Approved.

### DAPT group internal consistency (CHANCE / POINT / THALES / INSPIRES / CHANCE-2)

Reviewed against existing inclusionCriteria, intervention, and pearls fields. Qualifiers are internally consistent at the data level. **Duration discrepancy in the planning brief:** the brief describes INSPIRES and CHANCE-2 as "90d DAPT" — incorrect. Both use 21-day DAPT followed by monotherapy continuation to 90d. POINT's 90-day DAPT is distinct and is the primary reason the guideline caps DAPT at 21 days. The implementation must state "21-day DAPT then [agent] monotherapy to 90d" for INSPIRES and CHANCE-2 in `applicability`. **Condition #4.**

## Citation accuracy

- **SPARCL `harmSignal` numeric error:** "2.2% absolute stroke reduction" ≠ published Amarenco NEJM 2006 or this record's own data. Correct value is 1.9pp. **Condition #1.**
- **THALES `harmSignal` p-value error:** `p=0.001` → `P<0.001` per Johnston NEJM 2020 and existing safetyProfile tooltip. **Condition #2.**
- All other `harmSignal` numerics (POINT, SAMMPRIS, SPS3) verified against existing record fields and match.
- OPTIMAS NI margin (2pp) and INSPIRES bleeding HR (2.08, 1.07–4.04) rest on session-level medical-scientist attestation; full citation records with `quoted_text` needed when W5.2 lands.

## Freshness

No `last_reviewed` fields touched. N/A.

## Rationale

The proposed data population is clinically faithful across the majority of trials. `primaryDesign`/`primaryResult` classifications are accurate, ELAN's estimation-trial omission is correct, and DAPT-group qualifiers are present at the data level. Two `harmSignal` strings contain specific numeric errors that contradict the published source and/or the same trial's existing data fields — these are never-drift category 4 violations (certainty markers) and must be corrected before merge. The INSPIRES/CHANCE-2 duration framing must explicitly distinguish 21-day DAPT from POINT's 90-day course. All other conditions are documentation or tagging follow-ups.

## Required follow-ups (conditions for merge)

1. **Mandatory — SPARCL `harmSignal`:** replace `2.2%` with `1.9%`. Correct text: `"Hemorrhagic stroke: 55 vs 33 events (atorvastatin vs placebo) despite 1.9% absolute overall stroke reduction"`.
2. **Mandatory — THALES `harmSignal`:** replace `p=0.001` with `P<0.001`. Correct text: `"Severe bleeding 0.5% vs 0.1% (P<0.001); noncardioembolic stroke only"`.
3. **Mandatory — SPS3 `not-met` classification:** add inline comment adjacent to `primaryResult: 'not-met'` — e.g., `// harm-stopped considered; not-met chosen: trial completed enrollment; mortality+bleeding excess were results, not a stopping reason; harm context carried by harmSignal`.
4. **Mandatory — INSPIRES + CHANCE-2 applicability duration:** proposed `doseSpecific`/`populationExclusions` must explicitly state "21-day DAPT then [agent] monotherapy to 90d" — NOT "90-day DAPT." POINT's 90-day protocol is clinically distinct and the guideline's 21-day cap derives from this distinction.
5. **Advisory — `harmSignal` claim tagging:** six new `harmSignal` strings ship untagged (no adjacent `claimId` per §13.4 Phase 1). The empty CLAIM_REGISTRY (W5.2 not landed) means the §13.5 hook passes by omission. When W5.2 populates the registry, each `harmSignal` entry needs a `claimId` and a registry record with `quoted_text`. Track as `blocked:awaiting-registry-population` in TASKS.md.
6. **Advisory — OPTIMAS 2pp and INSPIRES HR citation trail:** when W5.2 lands, add full citation records (Werring Lancet 2024 PMID 39491870; Gao NEJM 2023 PMID 38157499) with `quoted_text` so subsequent reviewers can verify without re-running PubMed.
