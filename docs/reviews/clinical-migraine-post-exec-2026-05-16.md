# Clinical review — Migraine Pathway surgical patch (post-execution)

**Decision:** approve-with-conditions. Ship.
**Reviewer:** clinical-reviewer
**Date:** 2026-05-16

## Verbatim phrase verification — all 12 CLIN-2 phrases PASS

| # | Phrase | Location | Match |
|---|---|---|---|
| 1 | "0.5–3 mL of 0.5% bupivacaine OR 1% lidocaine" | L303, L310, L834, L988 | Verbatim, volume range + agent choice both preserved |
| 2 | "Use if prochlorperazine unavailable or contraindicated" | L714 | Verbatim |
| 3 | "Should Offer for recurrence prevention" | L761 | Verbatim — Level B preserved, NOT laundered to acute-pain Level C |
| 4 | "first line for rescue" | L212, L213 | Verbatim |
| 5 | "may perform better" | L871 | Verbatim |
| 6 | "6–12 L/min" | L530, L531 | Verbatim — range NOT collapsed |
| 7 | "non-rebreather mask (NRB)" | L530 | Verbatim |
| 8 | "AHS Grade A" | L527, L531, L535, L539 | Verbatim |
| 9 | "≥15 days/month" + ">10 days/month" + ">15 days/month" + ">3 months" | L1040, L1051 | All thresholds verbatim |
| 10 | "25 mg TID → 50 mg TID → 75 mg TID" + "with PPI" | L570, L571 | Verbatim |
| 11 | "carbamazepine 300–800 mg/day" + "only FDA-approved" + "Avoid opioids" | L555, L558 | Verbatim |
| 12 | "Level U" + "needs better quality ED-specific studies" | L330, L580, L1003 | Verbatim |

## Ship-blockers — both PASS

- **A1 GONB Level A:** `gonb: boolean` added to `AddOnsState` (L54), GONB card L830-844 with verbatim dose range and "Robblee 2025 Level A — Must Offer".
- **A2 Antiemetic flip:** default `prochlorperazine` at L145, ordering at L699, Level A caption L713, Level B backup caption with verbatim qualifier L714.

## Class E + C-clinical items — all verified

A3 ketorolac type `15/30/60`; A4 dex `8/10/16`; A6 valproate `500/800/1000`; A5 sumatriptan-pregnancy WARNING; A7 second-line expansion (chlorpromazine + GONB-rescue + DHE admit); B1 cluster terminal; B2 MOH discharge screen; B3 indomethacin PH/HC; B4 TN route-out; B5 status migrainosus banner; B6 CV vasoconstrictor-free banner; B7 pregnancy first-line panel; B8 Step-0 differential routing (4 options); disclaimer refresh.

## Pregnancy gate consistency

Only sumatriptan downgraded to WARNING. Valproate, gepants, lasmiditan, ergots/DHE all remain hard-disabled per Burch Table 3-5 "always avoid" framing.

## Surface hygiene

- `indigo-*` tokens: 0 matches (full sweep clean)
- `alert()`: 0 matches (toast pattern)

## Never-drift categories

All 5 preserved (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints).

## Required follow-ups (W5.2)

1. CLIN-1 `last_reviewed` refresh for 7 new citations per §13.6.
2. Claim tagging additions to `src/lib/citations/claims.ts` for 18 actionable items.
3. Humanizer pass on new prose (verbatim PDF clauses exempt).
4. Pattern A visual rebuild when scheduled.

## Decision

**approve-with-conditions. Ship.**

- All 12 CLIN-2 verbatim phrases reproduced exactly.
- Both ship-blockers addressed; all 22 fix-manifest items verified.
- CLIN-1 freshness deferred to W5.2 per EVT + SE precedent — does not block this merge.
