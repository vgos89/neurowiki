# Clinical review — Migraine Pathway JSX rebuild (pre-execution)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer
**Date:** 2026-05-16

## Scope

- **Claims touched:** `gonb` (NEW Level A "Must Offer"); antiemetic default flip (`metoclopramide` → `prochlorperazine`); `KetorolacDose` set drop 45 add 60; `DexDose` set drop 4 add 16; `ValproateDose` set replace 750 with 800; sumatriptan-pregnancy hard-disable → WARNING; second-line rescue expansion (chlorpromazine / DHE / GONB-rescue); cluster terminal triad card (O2 6–12 L/min via NRB + SC sumatriptan 6 mg + zolmitriptan nasal 5–10 mg); MOH discharge screen (ICHD-3 8.2); status migrainosus DHE inpatient banner; indomethacin trial (25→50→75 mg TID + PPI); TN route-out (carbamazepine 300–800 mg/day + opioid avoidance); pregnancy first-line panel; CV vasoconstrictor-free banner; disclaimer refresh.
- **Citations:** 7 NEW records — Robblee 2025 (DOI 10.1111/head.70016), AHS 2021 (DOI 10.1111/head.14153), Burch 2024, Burish 2024, Rizzoli 2024, Goadsby 2024, Nahas 2024.

## Semantic validity

Per-item check confirmed all Class E changes match dossier verbatim. Highlights:

- A1 GONB Level A "Must Offer" with verbatim "0.5–3 mL 0.5% bupivacaine OR 1% lidocaine"
- A2 prochlorperazine Level A + metoclopramide Level B with verbatim "if prochlorperazine unavailable or contraindicated" qualifier
- A4 dexamethasone Level B **recurrence prevention** preserved (NOT laundered to Level C acute pain)
- A5 sumatriptan-pregnancy: Burch's "first line for rescue" qualifier preserved (NOT generalized to "first-line in pregnancy")
- A6 valproate "may perform better" certainty marker preserved
- B1 cluster: O2 "6–12 L/min" range must NOT collapse to single value
- B2 MOH: all three thresholds (>10/>15/>3 months) preserved
- B3 indomethacin: titration + PPI preserved
- B4 TN: 300–800 mg/day + "only FDA-approved" + opioid avoidance preserved
- B5 DHE: Robblee "Level U" preserved

**Never-drift category audit:**
1. Recommendation strength — preserved (Level A/B/C/U distinctions intact)
2. Action verbs — preserved (Must/Should/May Offer not interchanged)
3. Qualifiers/gates — preserved ("if prochlorperazine unavailable" / age 65 / weight 50 / pregnancy DHE exclusions)
4. Certainty markers — preserved ("may perform better" / "Level U" / "first line for rescue")
5. Temporal — preserved (15–180 min cluster / ≥15 days/month MOH / ≥72 h status migrainosus / 5–7 d → 5–7 d → 2 wks indomethacin)

## Ship-blockers addressed

| Ship-blocker | Plan reference | Status |
|---|---|---|
| **A1** GONB Level A missing | Patch 1 bullet 1 — new `gonb` state field + Level A card | Addressed |
| **A2** Antiemetic default inverted | Patch 1 bullet 2 — flip with Level B backup qualifier preserved | Addressed |

## Required conditions (must be met during execution)

1. **`last_reviewed` refresh per §13.6 — 6-step checklist** for all 7 new citation records. Dual sign-off required on Robblee 2025 + AHS 2021 in post-execution review.

2. **Verbatim caveat preservation:**
   - A1 GONB: *"0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine"* + *"Level A — Must Offer"* (volume range MUST NOT collapse to single value; agent choice MUST NOT collapse to single drug)
   - A2 metoclopramide caption: *"Use if prochlorperazine unavailable or contraindicated"*
   - A4 dexamethasone: *"Should Offer for recurrence prevention"* (NOT laundered to acute pain Level C)
   - A5 sumatriptan: *"first line for rescue"* (NOT *"first-line in pregnancy"*)
   - A6 valproate: *"may perform better"* (NOT *"performs better"*)
   - B1 cluster O2: *"6–12 L/min"* range preserved (NOT collapsed to 12 L/min); *"via non-rebreather mask"* or *"NRB"* required; *"AHS Grade A"* attribution
   - B2 MOH: all three thresholds (*">10 days/month"*, *">15 days/month"*, *"for >3 months"*) preserved
   - B3 indomethacin: *"25 mg TID → 50 mg TID → 75 mg TID"* + *"with PPI"*
   - B4 TN: *"carbamazepine 300–800 mg/day"* + *"only FDA-approved"* + *"avoid opioids"*
   - B5 DHE: Robblee *"Level U"* with *"needs better quality ED-specific studies"* attribution
   - Disclaimer: Robblee DOI 10.1111/head.70016 + AHS 2021 DOI 10.1111/head.14153

3. **Humanizer pass** on all new prose; verbatim PDF clauses exempt.

4. **Claim tagging** per §13.4 — claims registry additions in `src/lib/citations/claims.ts` batched into same atomic commit.

5. **Pregnancy gate consistency.** Only sumatriptan moves hard-disable → WARNING. All other "always avoid" agents (valproate, gepants, lasmiditan, ergots/DHE) stay hard-disabled.

6. **Post-execution clinical re-review** required as merge gate.

7. **B1 cluster branch architecture.** Terminate at Drawer State C terminal card. NO cluster cocktail-assembly, preventive workflow, or SUNCT/SUNA logic through a side door.

8. **B5 status-migrainosus framing.** Advisory banner producing admit-trigger. Cocktail remains valid as first-line. Robblee *"DHE Level U in ED"* caveat accompanies DHE inpatient recommendation.

## Blocking issues

None.
