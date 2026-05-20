# Clinical review — PR # Tier 4 #20 question cross-links (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none — metadata `trialIds[]` array fill. No claim text, no interpretation prose, no displayed numbers changed.
- **Surfaces changed:** `src/data/trial-questions.ts` — 8 of 13 existing question entries updated. Audit-recommended cross-links per `docs/research/2026-05-19-trial-audit/03-trial-questions-suggestions.md` Part A.
- **Trials newly linked (already in catalog, no new entries):** PRISMS, NOR-TEST 2 Part A, TWIST, ARAMIS, TIMELESS, TRACE-III, RAISE, THRACE, ESCAPE-MeVO, DISTAL, DESTINY-II, CHARM, RIGHT-2, MR ASAP, SPS3, SOCRATES, DEVT, SKIP, INTERACT4 (cross-question), AcT (cross-question — already present).

## Changes per question

| Question | Trial count | Net additions | Rationale (per audit) |
|---|---|---|---|
| Q1 tpa-timing | 7 → 14 | +7 (PRISMS, NOR-TEST 2 Part A, TWIST, ARAMIS, TIMELESS, TRACE-III, RAISE) | tPA-window question now spans severity threshold (PRISMS), wake-up (TWIST), late-window TNK (TIMELESS, TRACE-III), dose boundary (NOR-TEST 2 Part A), DAPT alternative in mild stroke (ARAMIS), agent-choice (RAISE). |
| Q2 lvo-evt | 11 → 14 | +3 (THRACE, ESCAPE-MeVO, DISTAL) | THRACE was the French foundational bridging-therapy trial. ESCAPE-MeVO + DISTAL define the MeVO/distal boundary where LVO becomes "not-LVO." |
| Q4 hemicraniectomy | 3 → 5 | +2 (DESTINY-II, CHARM) | Closes the audit's own inline TODO. DESTINY-II covers age-ceiling (>60 y); CHARM is adjacent malignant-edema management in the same population. |
| Q5 bp-control | 5 → 7 | +2 (RIGHT-2, MR ASAP) | Prehospital BP-lowering evidence (positive boundary and harm boundary respectively). |
| Q6 dapt | 5 → 8 | +3 (SPS3, SOCRATES, ARAMIS) | SPS3 defines the duration harm boundary in lacunar disease. SOCRATES is the adjacent "if not DAPT, then what?" monotherapy comparator. ARAMIS reframes DAPT vs alteplase in mild stroke. |
| Q9 msu-dispatch | 2 → 4 | +2 (RIGHT-2, INTERACT4) | Same prehospital operational paradigm; broadens the question from "MSU yes/no" to "what should the ambulance do?" |
| Q11 tnk-vs-alteplase | 6 → 11 | +5 (NOR-TEST 2 Part A, TWIST, TIMELESS, TRACE-III, RAISE) | Extends the TNK question across dose (NOR-TEST 2 Part A safety boundary), time-window (TWIST wake-up, TIMELESS + TRACE-III late-window), and agent (RAISE reteplase). |
| Q12 direct-vs-bridging | 4 → 7 | +3 (THRACE, DEVT, SKIP) | THRACE as comparator predecessor; DEVT (China, NI met) and SKIP (Japan, NI not met) complete the six-RCT direct-MT vs bridging dataset. |

**Total cross-link additions:** 27. Target was "30 cross-links" per V's approval and the audit's count, but the audit's enumeration overlapped (some trials appear in multiple questions and are counted once per question-link). My pragmatic exclusion of bloating contextuals — see below — brings the total to 27.

## Intentional exclusions from audit recommendations

These are documented for traceability — not all audit-suggested cross-links were applied. Rationale per exclusion:

1. **Q1 tpa-timing — PROST and PROST-2 NOT added.** Both are rhPro-UK noninferiority trials. They are "contextual" cross-links per the audit (they reframe the agent-choice dimension). Better surfaced via a future question anchored on agent choice (e.g., audit Part B's not-yet-built "Reteplase, tenecteplase, alteplase, or rhPro-UK?" question). Adding them to Q1 (already at 14 trials) would bloat the bedside utility of the question.

2. **Q2 lvo-evt — the six bridging-vs-direct trials NOT cross-linked.** The audit suggested adding DIRECT-MT, MR CLEAN-NO IV, SWIFT DIRECT, DIRECT-SAFE, DEVT, SKIP as "contextual" cross-links because they inform "EVT vs EVT + IVT." Those six are already grouped in Q12 (direct-vs-bridging). Cross-linking them to Q2 would create UI duplication and dilute Q2's "does my LVO need EVT?" focus. The audit's intent (these trials matter for LVO decisions) is preserved through the question hub linking Q12 to Q2.

3. **Q9 msu-dispatch — INTERACT4 added but contextual.** INTERACT4 is also in Q5 bp-control. Multi-question linkage is intentional per the audit and reflects the operational reality (one trial, multiple bedside questions).

## Trial count discipline

Every `trialCount` field has been updated to match the array length exactly. No drift between `trialCount` and `trialIds.length`. This is the kind of metadata gap that the build-time check could enforce — flagging as a candidate for a future Tier 3 scanner extension if `trialCount` desynchronization becomes a recurring issue.

## Semantic validity

Each cross-link was checked against the trial's actual primary endpoint and population to confirm clinical relevance to the linked question:

- **PRISMS in Q1:** primary outcome was mRS 0-1 at 90 days in minor non-disabling stroke; the trial failed superiority and showed harm (excess sICH with alteplase). This is directly the "should I give tPA in mild stroke?" decision — verified relevant.
- **NOR-TEST 2 Part A in Q1 and Q11:** stopped early for harm with TNK 0.4 mg/kg in moderate-severe stroke. Verified relevant to both "tPA-timing" (defining when TNK does not work) and "tnk-vs-alteplase" (dose-escalation boundary).
- **THRACE in Q2 and Q12:** primary outcome was mRS 0-2 at 90 days favoring EVT + IVT over IVT alone. Verified relevant to LVO-EVT decision (foundational) and direct-vs-bridging (historical comparator).
- **ESCAPE-MeVO + DISTAL in Q2:** the recent commit cluster verified both as MeVO/distal occlusion trials. Both negative or near-neutral on primary; they define the boundary where EVT does NOT improve LVO outcomes. Verified relevant.
- **DESTINY-II in Q4:** the recent Tier 3 #17 commit (`b61f7ef`) verified DESTINY-II as `binary-superiority / met` for survival without severe disability (mRS 0-4) at 6 months in patients >60. Directly answers "is hemicraniectomy indicated in older patients?" — verified relevant.
- **CHARM in Q4:** the recent Tier 3 #17 commit verified CHARM as `ordinal-shift / not-met` for glibenclamide in malignant edema. Same population as hemicraniectomy decision (large hemispheric stroke with edema). Verified relevant as adjunct context.
- **SPS3 in Q6:** primary outcome was recurrent stroke in lacunar disease; the trial showed harm with long-term DAPT (more bleeding without recurrence benefit). Directly defines the duration boundary for DAPT — verified relevant.
- **SOCRATES in Q6:** ticagrelor vs aspirin monotherapy. Adjacent to DAPT (it answers "if not DAPT") — verified relevant as contextual.
- **ARAMIS in Q1 and Q6:** DAPT noninferior to alteplase in minor non-disabling stroke. Verified relevant to both questions.
- **RIGHT-2 in Q5 and Q9:** prehospital GTN. Verified relevant to BP control (positive boundary) and MSU dispatch (operational analogue).
- **MR ASAP in Q5:** prehospital GTN stopped early for ICH harm. Verified relevant to BP control (harm boundary).
- **TIMELESS, TRACE-III, TWIST, RAISE:** all recent late-window or agent-comparison TNK/reteplase trials — verified relevant to tpa-timing and tnk-vs-alteplase.
- **DEVT, SKIP in Q12:** complete the six-RCT direct-vs-bridging dataset — verified relevant.

## Citation accuracy

No citations touched.

## Freshness

No `last_reviewed` refresh needed — no clinical claim asserted that wasn't already in the catalog.

## Rationale

Closes the largest catalog-wide cross-link gap flagged by the overnight audit. Each question now spans the major published evidence in its domain. Questions that the audit identified as "complete" (Q3 anticoagulation, Q7 basilar-evt, Q8 ich-surgery, Q10 icas-stenting) were left unchanged — the audit was right that those are catalog-bounded by which trials exist as catalog entries (e.g., anticoagulation cross-links require NAVIGATE-ESUS, RE-LY, ROCKET-AF, ARISTOTLE, ENGAGE AF-TIMI 48 to land as trial entries first).

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS

## Required follow-ups

1. **Tier 4 #21 — 7 new clinical questions** (audit Part B) — would close the remaining orphan-trial gaps: large-core EVT (B1), late-window selection (B2), aspiration-vs-stentriever (B3), neuroprotection (B4), minor stroke choice (B5), MeVO/distal (B6), post-EVT BP target (B7). Pending separate commit.
2. **Anticoagulation expansion (Q3)** is blocked on adding NAVIGATE-ESUS, RE-LY, ROCKET-AF, ARISTOTLE, ENGAGE AF-TIMI 48 as trial entries — most paywalled per V's PDF queue.
3. **icas-stenting expansion (Q10)** is blocked on adding VISSIT and CASSISS as trial entries.
4. **Future Tier 3 scanner extension:** enforce `trialCount` === `trialIds.length` as a build-time invariant to prevent drift.

## Blocking issues

None.
