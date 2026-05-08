# Clinical review — Wave 2 IVT schema redesign (design/result split re-submission)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-05-08

## Scope
- Schema surface: `src/data/trialData.ts` — `primaryDesign` / `primaryResult` / `secondaryDesign` / `secondaryResult` fields on the trial interface (replacing the previously blocked `primaryAnalysisType` mixed-axis enum).
- Trials re-coded under new schema: 21 IVT trials (NINDS, ORIGINAL, ECASS III, EXTEND, EAGLE, THAWS, TRACE-III, WAKE-UP, AcT, ARAMIS, ATTEST-2, NOR-TEST, NOR-TEST 2 Part A, PRISMS, PROST, PROST-2, RAISE, TASTE, TIMELESS, TRACE-2, TWIST).
- Claim surfaces affected (§13.3): structured data in `src/data/`. Any downstream renderer that converts these enum values to user-visible clinical language is a derived claim surface and must be verified separately when those renderers ship.
- Citations affected: trial-level PMIDs/DOIs already on each `trialData` entry; this PR does not touch citation records, only adds two enum fields per trial.

## Semantic validity

**Issue 1 (axis split) — RESOLVED.** `primaryDesign` enum members are all design descriptors (statistical framework + endpoint type); `primaryResult` enum members are all outcome descriptors (what happened). No member of either enum conflates the two axes. The split is clean.

**Issue 2 (`negative` removed) — RESOLVED.** Three replacement values cover the previously conflated cases without loss: `not-met` (superiority endpoint did not reach significance), `noninferiority-not-established` (NI margin not crossed), `terminated-administrative` (stopped before the question could be answered for non-clinical reasons). This vocabulary preserves clinical force across all 21 trials. A clinician reading these values arrives at meaningfully different conclusions — which is exactly what the never-drift discipline (certainty markers, qualifiers) requires.

**Issue 3 (PRISMS / THAWS — terminated-administrative) — PARTIALLY RESOLVED.** THAWS coding is accurate (stopped due to enrollment/funding after Japanese reimbursement of alteplase reduced eligible enrollment). PRISMS requires a change — see blocking condition below. After the PRISMS fix, both trials are correctly coded.

**Issue 4 (NOR-TEST NI framing) — RESOLVED.** Coding NOR-TEST as `noninferiority` / `noninferiority-not-established` correctly preserves the trial's actual claim: tenecteplase 0.4 mg/kg failed to demonstrate non-inferiority to alteplase on mRS 0-1 at 3 months. Under the prior schema this was flattened to "negative," which was a certainty-marker drift (a failed NI trial is not the same as a failed superiority trial — the clinical action implications differ).

**Issue 5 (`dose-finding-safety` / `harm-stopped` for NOR-TEST 2 Part A) — RESOLVED.** NOR-TEST 2 Part A tested tenecteplase 0.4 mg/kg and was stopped by the DSMB for excess sICH and worse functional outcomes vs alteplase. `dose-finding-safety` accurately captures the design; `harm-stopped` accurately captures the stop reason. This is a clinically meaningful distinction from `futility-stopped` — `harm-stopped` should change prescriber behavior in a way that `futility-stopped` does not.

**Issue 6 (renderer guardrail — JSDoc only) — ACCEPTABLE FOR SCHEMA PR.** The "Never render design without result" guardrail is documentation-only. This is acceptable as-is for the schema PR — type-system enforcement is a Class C follow-up to be created before the first renderer ships.

**Issue 7 (PRISMS — BLOCKING CONDITION).** PRISMS was stopped in 2018 by the sponsor (Genentech) for *both* slow enrollment *and* a planned interim analysis showing low conditional probability of demonstrating benefit (Khatri et al., *JAMA* 2018). Coding this as `terminated-administrative` understates the futility component. A clinician reading "terminated-administrative" reasonably infers "the question was never answered" — but PRISMS *was* answered to the extent that the prespecified futility look found low conditional power, and that signal is part of why the field has not pursued IV alteplase in NIHSS 0-5 nondisabling stroke. **Required change: PRISMS → `primaryResult: 'futility-stopped'`.** Applied before merge.

**Trial-by-trial verification (all 21 — post-PRISMS fix):**
- NINDS (binary-superiority / met): Correct.
- ORIGINAL (noninferiority / noninferiority-established): Correct.
- ECASS III (binary-superiority / met): Correct.
- EXTEND (binary-superiority / met): Correct.
- EAGLE (binary-superiority / futility-stopped): Correct — binary superiority design stopped at planned futility look.
- THAWS (binary-superiority / terminated-administrative): Correct — enrollment collapse after national alteplase reimbursement.
- TRACE-III (binary-superiority / met): Correct.
- WAKE-UP (binary-superiority / met): Correct — stopped early after efficacy signal; published primary endpoint met.
- AcT (noninferiority / noninferiority-established): Correct.
- ARAMIS (noninferiority / noninferiority-established): Correct.
- ATTEST-2 (ordinal-shift / not-met; secondary noninferiority / noninferiority-established): Correct — dual-axis encoding preserves both endpoints without erasure.
- NOR-TEST (noninferiority / noninferiority-not-established): Correct.
- NOR-TEST 2 Part A (dose-finding-safety / harm-stopped): Correct.
- PRISMS (binary-superiority / futility-stopped): Correct after fix.
- PROST (noninferiority / noninferiority-established): Correct.
- PROST-2 (noninferiority / noninferiority-established): Correct.
- RAISE (binary-superiority / met): Correct.
- TASTE (bayesian-noninferiority / noninferiority-established): Correct — Bayesian PP ≥ 0.975 NI criterion met in per-protocol population.
- TIMELESS (ordinal-shift / not-met): Correct.
- TRACE-2 (noninferiority / noninferiority-established): Correct.
- TWIST (ordinal-shift / not-met): Correct.

## Citation accuracy
This PR does not modify citation records — it adds two enum fields per trial entry. Existing PMIDs/DOIs on each `trialData` entry are unchanged from the prior verified state. Out of scope for this review.

## Freshness
No `last_reviewed` dates are touched by this PR. Trial citations carry the 36-month landmark-trial window (§13.7); none of the 21 trials are within their re-review window expiry. Pass.

## Rationale
The schema redesign cleanly resolves the mixed-axis enum that prompted the prior block. Design and result now occupy independent fields; the new vocabulary captures clinically meaningful distinctions (NI vs superiority, futility vs harm vs administrative termination, frequentist vs Bayesian NI) that the prior `negative`-style enum erased. Across 21 IVT trials, 20 of 21 assignments are clinically accurate. The PRISMS correction (administrative → futility-stopped) is a clear, isolated, low-risk fix applied before merge. After that fix, all 21 trials are correctly coded and no clinical framing is silently dropped.

## Required follow-ups
1. **[Blocking condition — applied before merge]** PRISMS `primaryResult: 'terminated-administrative'` → `primaryResult: 'futility-stopped'`. Applied.
2. **[Follow-up task, not blocking this PR]** Renderer-level safety net for the design/result pairing invariant: introduce a typed helper `getTrialAnalysis(trial): { design, result } | null` or tighten the type to a discriminated union. Track as Class C in `TASKS.md` under L3-P1.
3. **[Follow-up task, not blocking this PR]** When the first user-facing renderer of these enum values ships, treat it as a `C-clinical` task — the rendered prose for each `(design, result)` pair is a new claim surface (§13.3) requiring claim IDs and citation mapping.
4. **[Documentation]** Add a note to the schema JSDoc clarifying the `terminated-administrative` vs `futility-stopped` vs `harm-stopped` distinction, with PRISMS, THAWS, EAGLE, and NOR-TEST 2 Part A as worked examples, so future trial entries are coded consistently.
