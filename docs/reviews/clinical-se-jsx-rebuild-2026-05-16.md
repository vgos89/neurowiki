# Clinical review — SE Pathway JSX rebuild (pre-execution)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer
**Date:** 2026-05-16

## Scope

- **Claims touched:** `getRecommendedAgent` rewrite (ESETT equivalence); `PatientData.convulsive` removed + NCSE terminal route-out; `calculateDose` signature refactor (RAMPART fixed-dose IM midazolam: 10 mg >40 kg / 5 mg 13–40 kg); lacosamide cap 400 mg + pre-load ECG; ketamine 1–2.5 mg/kg; phenobarbital 15 mg/kg; cardiac flag split (`avoidLacosamide` / `avoidPhenytoin`); Stage 1/2/3 time labels per Glauser 2016; new branches Stage 4 (super-refractory) + NORSE/FIRES + eclampsia (magnesium 4g→1g/h) + empiric thiamine/pyridoxine.
- **Citations:** Glauser 2016, ESETT 2019, Vossler 2025, Rubinos 2024, Mullhi 2025 + new: RAMPART, VA Cooperative, PHTSE, EcLiPSE, ConSEPT.
- **Surfaces:** interpretation function, branch criteriaName/reason/details, dropdown options, new branches, pearls, references.

## Semantic validity

Per-item check confirmed all Class E changes match dossier verbatim:
- A1 ESETT equivalence framing (Bayesian posteriors 0.41/0.46/0.13 confirmed) — recommendation strength preserved
- A2 NCSE Option 1 (terminal route-out) closes silent-misdosing safety gap
- A3/A6 lacosamide 400 mg + 2°/3° AV block reclassified "avoid" (not "caution") — strength upgrade tracks Vossler 2025 + FDA verbatim
- A4 RAMPART fixed-dose verbatim from PMID 22335736; <13 kg fallback is conservative trial-protocol extrapolation
- A14 Stage 1 split: "Stabilization (0–5 min)" + "Initial Therapy (5–20 min)" per Glauser 2016
- A17 Lacosamide cardiac monitoring as row-level safety
- B1 Stage 4 super-refractory branch — MEDIUM confidence per dossier §7; must be framed as workup/checklist NOT Class I/IIa recommendations (see condition 4)
- B3 Eclampsia magnesium 4g → 1g/h verbatim from Mullhi 2025 — MEDIUM confidence (Mullhi excludes obstetric SE; primary obstetric guideline backstop required — see condition 3)
- B4 Pyridoxine range per dossier is **50–100 mg IV**, not fixed 100 mg (plan summary error — see condition 5)

**Never-drift category audit:**
1. Recommendation strength — preserved (ESETT equivalence Class I; lacosamide "contraindicated" verbatim)
2. Action verbs — preserved ("AVOID" / "exclude" / "requires pre-load ECG")
3. Qualifiers/gates — preserved (13/40 kg bands; 400 mg lacosamide cap; max doses on lev/fos/VPA)
4. Certainty markers — preserved ("equivalent" / "insufficient evidence" / "diagnostic and therapeutic")
5. Temporal — preserved ("within 72 hours" / "5–20 min" / "20–40 min" / "40+ min" / "≥24 h")

## Ship-blockers addressed

| Ship-blocker | Plan reference | Status |
|---|---|---|
| **A1** ESETT equivalence + lacosamide removed from Stage 2 | Patch 1 bullet 1 | Addressed |
| **A2** NCSE toggle removed + terminal route-out | Patch 1 bullet 2 (Option 1) | Addressed; closes silent-misdosing gap |

## Required conditions (must be met during execution)

1. **`last_reviewed` refresh per §13.6** — all 10 citations updated to 2026-05-16 with 6-step checklist documented.
2. **Per-citation freshness override on Glauser 2016** — `review_window_months: 60` with comment explaining foundational-guideline rationale.
3. **Eclampsia obstetric-guideline backstop citation** — B3 currently only Mullhi 2025 (excludes obstetric); add ACOG or RCOG primary citation before merge OR surface limitation in tooltip.
4. **Stage 4 framing as workup/checklist NOT Class I/IIa.** AES 2020 "insufficient evidence" preserved. Use "consider" / "may be considered" / "expert consensus" language. NO "is recommended" verbs.
5. **Pyridoxine dose correction:** plan summary says "100 mg" — final B4 string must read **"50–100 mg IV"**.
6. **Stage time labels:** Plan §3 Patch 3 incorrectly states "Stage 2: 10–30 min; Stage 3: 30–60 min" (Rubinos 2024) — execute the Glauser 2016 TIER 0 numbers per manifest A15: **"Stage 2: 20–40 min; Stage 3: 40+ min"**. Document the Rubinos/Glauser differential in citation comment.
7. **Verbatim caveat preservation** (must appear in rebuilt strings):
   - Glauser 2016 NCSE scope: *"the treatment of refractory status epilepticus, including refractory non-convulsive status epilepticus, is not examined in this guideline"*
   - Vossler 2025 NCSE: *"NCSE without coma is an active condition but does not mandate ICU-level care or anesthetic infusion"*
   - Vossler 2025 lacosamide: *"lacosamide is contraindicated in patients with second- or third-degree AV block without pacemaker"*
   - RAMPART: *"Intramuscular midazolam in a fixed dose of 10 mg (>40 kg) or 5 mg (13–40 kg) was at least as effective as intravenous lorazepam"*
   - ESETT equivalence: *"levetiracetam, fosphenytoin, and valproate are equivalent for benzodiazepine-refractory status epilepticus"*
   - AES 2020 super-refractory: *"insufficient evidence"*
   - Mullhi 2025 eclampsia: *"Benzodiazepine escalation is NOT first-line for eclamptic seizures"*
   - PHTSE underdosing: *">75% of patients underdosed"*
8. **Humanizer pass** on all new prose; verbatim PDF clauses exempt.
9. **Claim tagging** per §13.4 — 7 claim IDs registered in `src/lib/citations/claims.ts`.
10. **No `usePathwayState` hook** at n=2 (architect ARCH-3 ruling transfers).
11. **Post-execution clinical re-review** required as merge gate.

## Blocking issues

None.
