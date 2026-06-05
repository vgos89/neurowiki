# Clinical spec — Headache pathway v4 ("live differential narrowing")

**Author:** medical-scientist
**Date:** 2026-06-05
**Status:** ready for clinical-reviewer
**Scope:** authoring-side clinical correctness of how the FIXED ICHD-3 evaluator's output is *presented* in v4. The evaluator (`src/data/clinicHeadacheData.ts`, 84-test suite) is not changed by this spec.
**Primary source anchor:** ICHD-3 (Headache Classification Committee of the IHS. The International Classification of Headache Disorders, 3rd edition. *Cephalalgia.* 2018;38(1):1-211. PMID 29368949). Citation ID `ichd3-2018`, already registered and within window.
**Build targets fed by this spec:** `bandPhenotypes.ts` (§1), `headacheQuestions.ts` (§2), Frame-3 conflict line (§3), management-link destination (§4).

---

## Engine facts this spec is built on (load-bearing)

Established by reading the evaluator, not assumed:

- **11 concrete phenotypes** live in `HEADACHE_PHENOTYPES`: migraine-without-aura (§1.1), migraine-with-aura (§1.2), chronic-migraine (§1.3), episodic-tth (§2.2), chronic-tth (§2.3), cluster-headache (§3.1), paroxysmal-hemicrania (§3.2), sunct-suna (§3.3), hemicrania-continua (§3.4), ndph (§4.10), vestibular-migraine (§A1.6.6). The `PhenotypeId` union *also* lists `probable-migraine`, `probable-tth`, `probable-tac` — these are **vestigial union members with no phenotype object**. "Probable" is expressed at runtime as `matchStrength: 'probable'` + a `displaySection` remap via `PROBABLE_SECTION_FOR`, not as a separate phenotype. The banding layer must never look for a "probable-migraine" match — it will not exist.
- `evaluateHeadachePhenotypes(selected)` returns a **pre-sorted** `PhenotypeMatch[]`: `full > probable > partial` (strength), then by `criteriaMet/criteriaTotal` ratio descending. `definitionallyExcluded:true` entries carry `matchStrength:'none'` and sort **last**.
- The sort has **no tertiary tie-break** beyond the ratio. Two matches with the same strength and the same ratio arrive in `HEADACHE_PHENOTYPES` declaration order (stable sort). The banding layer therefore must define its own deterministic tie-break (§1.4) — it cannot rely on the engine to disambiguate equal candidates.
- `matchStrength` values and what produces them:
  - `'full'` — every criterion met.
  - `'probable'` — exactly one criterion missed (either a demote-gate miss or a scorable miss). Carries the §X.5 `displaySection` when one exists in `PROBABLE_SECTION_FOR`; otherwise falls back to the parent section (the chronic-migraine case — see §1.5).
  - `'partial'` — ≥1 met but ≥2 missing.
  - `'none'` — only on `definitionallyExcluded:true` EMIT entries (`tth-D`, `ctth-D`, `cm-C`). Real non-matches never enter the array.
- **Suppress-gate split:** EMIT set (`tth-D`, `ctth-D`, `cm-C`) surfaces with `definitionallyExcluded:true` + `exclusionReason`. DROP set (aura-B, cm-A, ctth-A, sunct-C, hc-A, hc-D, ph-E, ndph-A, ndph-B, vm-A, vm-history) is silently absent from the array.
- `hiddenUntilTrial` phenotypes (hemicrania-continua, paroxysmal-hemicrania) do not appear at all until `indo-tried-complete` is selected.
- The §X.5 exclusion clause is already applied inside the engine: **if any `full` match exists, all `probable` matches are removed from the array.** The banding layer receives a post-exclusion array — it does not re-run this.
- `anyRedFlagActive(selected)` is the SNNOOP10 short-circuit. It is independent of pattern-matching and is the gate before any banding is shown (§2.0).

Nothing below changes any of these. Every rule is a presentation rule over this output.

---

# 1. BANDING — Leading / Possible / Less likely / Set aside

## 1.1 What banding is, and the one safety invariant

`bandPhenotypes(matches: PhenotypeMatch[])` is a **pure, deterministic** function that assigns each `PhenotypeMatch` to exactly one of four bands and returns them grouped and ordered. It introduces **no new clinical claim** — a band is a presentation label over `matchStrength` + criteria-fraction + rank that the engine already computed. Display is dot meter + bare "N of M" + the band word. **No percentages anywhere** (mockup hard rule; preserved).

**Safety invariant (non-negotiable, applies to all four bands):** a band word is a *ranking label, never a diagnosis*. "Leading" means "the pattern that currently fits the most criteria," not "the diagnosis is X." Every band-bearing surface in v4 already carries the standing "matches features to criteria to narrow the differential. Not a diagnosis." caption (mockup ICHD-3 context row) and the permanent dangerous-mimic strip (Frame 3 item 6). The band words must be readable only as positions in a differential. This is the one rule clinical-reviewer should treat as a tripwire: if any copy built from a band word reads as a verdict ("You have migraine"), it fails.

## 1.2 The deterministic banding rule

Apply in order, per match. The first matching clause wins.

```
bandPhenotypes(matches):
  # matches arrives engine-sorted: full > probable > partial, ratio desc, none last.
  # Step 0 — partition out the demote tray first.
  SET ASIDE   := every match with definitionallyExcluded === true
  CANDIDATES  := every match with definitionallyExcluded === false
                 (matchStrength ∈ {full, probable, partial})

  # Step 1 — apply the per-band cut points to CANDIDATES, in engine-sorted order.
  LEADING     := []
  POSSIBLE    := []
  LESS LIKELY := []

  for each m in CANDIDATES (engine order):
    if m.matchStrength === 'full':
        → LEADING
    else if m.matchStrength === 'probable' AND m is rank-0 of CANDIDATES
            AND no 'full' match exists:
        → LEADING        # top-ranked probable becomes the actionable lead
                         # ONLY when nothing reached full (no-clean-lead promotion)
    else if m.matchStrength === 'probable':
        → POSSIBLE
    else:  # 'partial'
        if m.criteriaMet >= 2:
            → POSSIBLE   # partial but substantive (≥2 criteria met)
        else:
            → LESS LIKELY   # partial on a single criterion
```

**`criteriaMet >= 2` cut for partial.** A partial match that has cleared ≥2 ICHD-3 criteria is meaningfully on the table and bands **Possible**. A partial match resting on a single met criterion bands **Less likely**. This cut is reinforced upstream by the engine's minimum-evidence floors for §1.1/§2.2/§3.1 (a feature-only phenotype cannot even surface off one incidental chip), so a `criteriaMet === 1` partial that *does* reach the array is a genuine but weak signal — correctly **Less likely**, not hidden.

## 1.3 Each band — definition and ICHD-3 rationale

### Leading (emerald)
**Definition:** a `full` match (every criterion met), OR — when no `full` match exists — the single top-ranked `probable` candidate (rank-0 after the engine sort).
**Clinical meaning:** the actionable top of the differential. The clinician reads this first (Frame 3 opens it by default).
**ICHD-3 rationale:** a `full` match means every encoded A–D criterion for that phenotype is satisfied by the patient's features — the strongest statement the engine can make short of a clinician's diagnosis. The no-clean-lead promotion of the top `probable` is faithful to the ICHD-3 §X.5 *Probable* framework, which exists precisely so that a patient who meets "all but one" criterion is still recognised as that phenotype-in-waiting (e.g. §1.5.1 Probable migraine without aura). Promoting it to Leading when nothing is `full` keeps the actionable slot filled by the best-supported pattern rather than leaving the result empty. The Leading badge for a promoted probable must carry its §X.5 `displaySection` (e.g. "Leading · ICHD-3 §1.5 Probable migraine"), so the clinician sees it is a probable-tier lead, not a full diagnosis.

### Possible (amber)
**Definition:** a `probable` match that is **not** the promoted lead, OR a `partial` match with `criteriaMet >= 2`.
**Clinical meaning:** genuinely in contention, close but not the lead — the runner-up zone. Frame 3 renders the top Possible as candidate 2 with its conflict line (§3).
**ICHD-3 rationale:** a `probable` that is not rank-0 is a real "all but one" near-miss but ranks below a stronger candidate — exactly the second-line position. A `partial` with ≥2 criteria met has cleared a substantive part of the phenotype definition (and the minimum-evidence floor) but is missing two or more criteria, so it cannot claim "all but one"; "Possible" states that honestly.

### Less likely (slate)
**Definition:** a `partial` match with `criteriaMet === 1`.
**Clinical meaning:** present in the differential but weakly supported — visible so the clinician isn't blind to it, demoted so it doesn't compete with the lead.
**ICHD-3 rationale:** a single met criterion is, by ICHD-3's own structure, far from a diagnosis (most phenotypes require ≥2 character features plus duration plus associated-symptom criteria). "Less likely" keeps it on screen for completeness without overstating it. Suppressing it entirely would hide a pattern the clinician might want to probe with a follow-up question (§2).

### Set aside (the demote tray)
**Definition:** every match with `definitionallyExcluded === true` (the EMIT set: `tth-D`, `ctth-D`, `cm-C` failures, `matchStrength:'none'`).
**Clinical meaning:** "considered and set aside" — the phenotype was evaluated and ruled out *by a specific contradicting feature the patient reported*, not merely un-matched. Demote-don't-delete: shown in a collapsible tray with the reason, never silently dropped.
**ICHD-3 rationale:** the EMIT criteria are ICHD-3 *exclusion* criteria whose failure is positive evidence for a different phenotype. `tth-D` / `ctth-D` fail when the patient has nausea/vomiting, which is migraine-defining (§1.1 D); `cm-C` fails when the chronic pattern is TTH-type rather than migraine-type. Surfacing these as "set aside because you noted nausea" is clinically honest and teaches the discriminator. The DROP set (substrate-absence: no aura, no vertigo, no continuous-unilateral pattern, no indomethacin response) is correctly *absent* from the array entirely and therefore from every band — there is nothing to set aside when the substrate of the phenotype was never present.

## 1.4 Tie-break — the gap the engine sort leaves open

The engine sort does not disambiguate two candidates of equal strength and equal `criteriaMet/criteriaTotal` ratio. The banding layer **must** impose a deterministic, reproducible tie-break so the same input always yields the same Leading/order (a clinician re-running the tool must see a stable result). Apply within each band, after the engine sort, as a stable secondary sort:

**Tie-break order (higher wins the higher rank):**
1. **Higher absolute `criteriaMet`** (4-of-5 outranks 3-of-4 even though the ratio is lower — more confirmed criteria is more clinical support). *Within the existing strength tier only — never promote across `full`/`probable`/`partial`.*
2. **Higher `criteriaTotal`** (a phenotype with more criteria that you've met more of is the more fully-characterised pattern).
3. **Fixed ICHD-3 chapter order** as the final, fully-deterministic fallback: §1 < §2 < §3 < §4 < appendix; within a chapter, by section number ascending. This makes the result reproducible and clinically conventional (migraine before TTH before TACs), and removes any dependence on `HEADACHE_PHENOTYPES` array order, which is an implementation detail, not a clinical ranking.

**Leading-tie safety rule.** If two candidates tie for rank-0 *and* both are `full` (a true two-full-match state), **both render in Leading, side by side, with no single "the answer."** This is the migraine+TTH co-diagnosis case ICHD-3 General Principles explicitly permits (a patient can carry §1.1 and §2.2 concurrently). The headline copy in this state must be plural and non-committal ("Two patterns fully match the features so far." — mockup Frame 3 already models the two-pattern headline). Never let the tie-break silently pick one full match as Leading and bury the other — that would manufacture a verdict the engine did not make.

## 1.5 Edge cases — explicit rulings

**(a) Ties at the top (covered above).** Two `full` → both Leading, plural headline. Two `probable` at rank-0/rank-1 with no full → the tie-break (§1.4) selects which single probable is promoted to Leading; the other bands Possible. The promotion is deterministic, so it is reproducible, but because both are probable the Leading badge still shows the §X.5 label and the Possible runner-up still shows its conflict line — the clinician sees it was a close call, not a clean win.

**(b) The chronic-migraine-`probable` case (no §1.5.3 in ICHD-3).** ICHD-3 has **no** "Probable chronic migraine" entity — `chronic-migraine` is deliberately omitted from `PROBABLE_SECTION_FOR`. When chronic-migraine returns `matchStrength:'probable'` (one of its scorable criteria missed, with `cm-A` and `cm-C` both passing), its `displaySection` falls back to the parent "ICHD-3 §1.3". The banding layer treats it like any other probable for *placement* (Possible, or Leading if rank-0 with no full), but the **headline/label must read "Partial match for Chronic migraine," never "Probable Chronic migraine."** Rationale: naming a "Probable Chronic migraine" would assert an ICHD-3 entity that does not exist — a fabricated classification. The engine already guards this by withholding the §1.5 label; the copy layer must not reintroduce the word "Probable" for this phenotype. (This mirrors the engine comment at `PROBABLE_SECTION_FOR` and is the single most important do-not-fabricate rule in the banding layer.)

**(c) No-clean-match state (nothing reaches Leading via `full`).** Two sub-cases:
- *At least one `probable` exists:* the top-ranked probable is promoted to Leading per §1.2, labelled with its §X.5 section (or "Partial match for…" for chronic-migraine per (b)). The result is honest: a probable-tier lead, clearly badged.
- *Only `partial` (and/or Set-aside) exist — nothing reached `full` or `probable`:* **no band is labelled Leading.** The top `partial` (highest tie-break) is the strongest item but bands **Possible**, not Leading. The Frame 3 headline must state the unresolved state plainly: e.g. "No single pattern stands out yet — the closest is below." The result must not invent a Leading where the criteria do not support one. The standing "answer a few more features to narrow this" affordance (skip/See-result/back-to-questions) is the correct next step, and the SNNOOP10 strip remains. An entirely empty `CANDIDATES` array (only Set-aside, or nothing) shows no bands and a "nothing matched yet — keep describing features, and rule out secondary causes" empty state.

**(d) A band word must never be mistaken for a diagnosis (safety, restated as an edge case).** Three guards, all required: (i) the band word is always adjacent to the "Not a diagnosis" caption; (ii) Leading on a promoted-probable always shows the §X.5 / "Partial match for…" qualifier, never a bare phenotype name as if confirmed; (iii) the permanent dangerous-mimic strip is non-collapsible on the result. clinical-reviewer should verify all three are present in the built Frame 3 before approving.

## 1.6 Summary cut-point table

| Engine output | Band | Display |
|---|---|---|
| `matchStrength === 'full'` | **Leading** (emerald) | full dot meter, "N of N met", parent §; plural headline if ≥2 full |
| `matchStrength === 'probable'`, rank-0, no full exists | **Leading** (emerald) | dots, "M of N", **§X.5 label** (or "Partial match for…" if chronic-migraine) |
| `matchStrength === 'probable'`, not promoted | **Possible** (amber) | dots, "M of N", §X.5 label; conflict line if top Possible |
| `matchStrength === 'partial'`, `criteriaMet >= 2` | **Possible** (amber) | dots, "M of N", parent § |
| `matchStrength === 'partial'`, `criteriaMet === 1` | **Less likely** (slate) | dots, "1 of N", parent § |
| `definitionallyExcluded === true` (EMIT set) | **Set aside** (tray) | reason from `exclusionReason`, collapsed tray |
| DROP-set suppression / not in array | — | not shown (substrate absent) |

---

# 2. QUESTION-FLOW COVERAGE

## 2.0 The SNNOOP10 short-circuit comes first — always

Before any question in §2.1 is asked and before any band is computed, the safety screen (Frame 1) runs. It is a **read-then-decide** list of SNNOOP10 warning signs (Do et al., *Neurology* 2019, citation `do-snnoop10-2019`), not a tap-to-select grid. If the clinician routes to "go to workup," pattern-matching does not proceed. The engine's `anyRedFlagActive(selected)` is the programmatic equivalent and remains the gate: **whenever any red-flag chip is set, the result must lead with the secondary-workup message, and banding is secondary to it.** This is unchanged by the question redesign and is a hard precondition of everything below. No core or conditional question may run ahead of the safety gate.

## 2.1 The core question sequence (~6 questions)

Six questions, one per screen, mapped from `HEADACHE_CHIP_GROUPS`. Each answer option lists the `ChipId[]` it contributes. **Many-to-one contributions are preserved exactly** where the engine's criteria require a chip pair — dropping either chip of a pair is a clinical regression because the corresponding criterion evaluator would never fire. Pairs are flagged **[PAIR — preserve both]**.

Selection model: single-select where ICHD-3 features are mutually exclusive (location, quality), multi-select where they co-occur (associated symptoms). "Skip (unsure)" is always available and contributes nothing.

### Q1 — Pattern over time (group `pattern`)
*"How does the headache behave over time?"*
| Answer option | Contributes |
|---|---|
| Comes in separate attacks, same pattern each time | `onset-recurrent-same` |
| New, started in the last 3 months | `onset-new-within-3-months` |
| One sudden first-ever episode | `onset-single-sudden` (→ also nudges the safety gate) |
| Continuous, never fully goes away | `dur-continuous` [drives continuous-pattern phenotypes; suppresses purely-episodic ones in the engine] |

### Q2 — How often / how long (group `pattern`)
*"How often do attacks happen, and how long does each last?"* (two linked selects on one screen — frequency + per-attack duration)
| Answer option (frequency) | Contributes |
|---|---|
| 1–4 days/month | `freq-1-4-per-month` |
| 5–14 days/month | `freq-5-14-per-month` |
| ≥15 days/month | `freq-ge-15-per-month` [chronic threshold] |
| Answer option (duration) | Contributes |
| Under 15 minutes | `dur-lt-15-min` |
| 4–72 hours | `dur-4-to-72-hours` |
| 30 minutes – 7 days | `dur-30min-to-7days` |
Plus a quiet "this pattern has been going ≥3 months" toggle → `pattern-ge-3-months` (required for chronic-TTH, NDPH, hemicrania-continua criteria).

### Q3 — Pain quality (group `pain-character`) — single-select
*"How would the patient describe the pain?"* (mockup Frame 2 models this exact question)
| Answer option | Contributes |
|---|---|
| Throbbing or pulsating | `qual-pulsating` |
| Pressing or tightening | `qual-pressing-tightening` |
| Sharp or stabbing | `qual-sharp-stabbing` |

### Q4 — Location + severity (group `pain-character`)
*"Where is the pain, and how severe?"* (location single-select + severity single-select on one screen)
| Answer option (location) | Contributes |
|---|---|
| One-sided | `loc-unilateral` |
| Both sides | `loc-bilateral` |
| **Around or behind one eye / temple** | `loc-unilateral` + `loc-orbital-temporal` **[PAIR — preserve both]** |
| Answer option (severity) | Contributes |
| Mild | `sev-mild` |
| Moderate | `sev-moderate` |
| Severe | `sev-severe` |
| Very severe / excruciating | `sev-very-severe` |

> **[PAIR — preserve both] rationale:** the "around/behind one eye" answer must add **both** `loc-unilateral` and `loc-orbital-temporal`. Cluster `cluster-B`, paroxysmal-hemicrania `ph-B`, and SUNCT `sunct-B`/`sunct-C` all require the unilateral-orbital constellation; the orbital chip alone does not satisfy the unilateral requirement those evaluators check. This is the canonical many-to-one the brief flags. Likewise the continuous answer in Q1 plus a unilateral location in Q4 jointly satisfy `hc-A` / `ndph-A` substrate — preserve the continuous→`dur-continuous` mapping.

### Q5 — Activity effect (group `pain-character`) — single-select
*"What does routine activity (walking, stairs) do to it?"*
| Answer option | Contributes |
|---|---|
| Makes it worse / makes them avoid activity | `act-aggravated` |
| No effect | `act-not-aggravated` |

### Q6 — Associated symptoms (group `associated`) — multi-select
*"What comes with the headache? (select all that apply)"*
| Answer option | Contributes |
|---|---|
| Mild nausea | `sym-nausea-mild` |
| Moderate/severe nausea | `sym-nausea-moderate-severe` |
| Vomiting | `sym-vomiting` |
| Light bothers them | `sym-photophobia` |
| Sound bothers them | `sym-phonophobia` |
| Restless / can't stay still | `sym-restlessness` |
| Watery eye, runny nose, droopy lid on the painful side | `sym-autonomic-ipsilateral` |

> The engine needs **attack-count** chips (`attacks-5-to-10`, `attacks-gt-10`, `attacks-ge-2`) for the §X.1 A-criteria of migraine/cluster/TTH. Fold a single attack-count question into Q2 (a "roughly how many attacks in your life?" select → `attacks-lt-5` / `attacks-5-to-10` / `attacks-gt-10`; and `attacks-ge-2` for the migraine-with-aura ≥2 floor) so the six-screen budget holds. Without an attack-count chip, migraine/cluster/TTH cap at `probable` (their A-criterion never fires), which is a *defensible* near-miss but blocks `full`. Including it is preferred.

## 2.2 The conditional branches — and the decisive ruling

Five engine chip-groups are **not** reachable from the six core questions: `aura`, `vestibular`, `tac-detail`, `chronic-migraine-detail`, `indomethacin`. The phenotypes that *depend* on them — migraine-with-aura, vestibular-migraine, paroxysmal-hemicrania, SUNCT/SUNA, chronic-migraine, cluster-headache (autonomic detail), hemicrania-continua — therefore **cannot reach Leading under a fixed six-question flow**, because their gating criteria (aura-B, vm-A/vm-history, ph-B/ph-E, sunct-C, cm-C, the indomethacin suppress-gates) are never offered a chip.

### Ruling: branching is REQUIRED for clinical safety, not optional.

A fixed six-question flow that permanently bands cluster, the indomethacin-TACs, SUNCT, aura, vestibular, and chronic migraine as "Less likely" is **not** clinically acceptable as the only path, for two reasons:

1. **Cluster headache and the short-attack TACs are the dangerous-to-miss primary headaches.** Cluster is the "suicide headache"; SUNCT/PH masquerade as trigeminal neuralgia; all are treatable with phenotype-specific therapy (high-flow O₂, verapamil, indomethacin, lamotrigine). A tool that structurally caps them at "Less likely" regardless of how cluster-typical the presentation is would systematically under-rank exactly the phenotypes where correct early recognition changes management most. That is a clinical regression versus the current evaluator, which *can* reach these phenotypes when the relevant chips are set.
2. **The engine was deliberately built to reach these phenotypes** (the `tac-detail`, `aura`, `chronic-migraine-detail`, `indomethacin` groups exist precisely so cluster/PH/SUNCT/aura/CM can be fully characterised). Hiding those groups behind an unreachable wall throws away encoded clinical capability.

**Therefore: the six core questions are the default spine; conditional follow-ups fire when the core answers point toward a phenotype that needs them.** A fixed flow that bands the rare phenotypes "Less likely" *until a branch fires* is acceptable **only because the branch is guaranteed to fire when warranted** — the "Less likely" state is transient, not terminal. The branch triggers below are the safety mechanism that makes the limited core flow safe.

### Conditional branch triggers (surface the follow-up only when the trigger is met)

| Branch (chip-group) | Fires when core answers include… | Follow-up asks → contributes | Phenotype(s) it unlocks |
|---|---|---|---|
| **TAC short-attack detail** (`tac-detail`) | very short attacks (`dur-lt-15-min`) **AND** strictly unilateral (`loc-unilateral` ± `loc-orbital-temporal`) **AND** autonomic or restless (`sym-autonomic-ipsilateral` or `sym-restlessness`) | "How many attacks total / per day, and exactly how long?" → `attacks-ge-20`, `dur-2-to-30-min` (PH) or `dur-1-to-600-sec` (SUNCT), `freq-gt-5-per-day` (PH) / `freq-ge-1-per-day` (SUNCT) | paroxysmal-hemicrania (§3.2), SUNCT/SUNA (§3.3) |
| **Indomethacin response** (`indomethacin`) | unilateral + autonomic/restless pattern that points to an indomethacin-responsive TAC (HC: `dur-continuous` + `loc-unilateral`; PH: short unilateral autonomic attacks) | "Has a full-dose indomethacin trial been done, and what happened?" → `indo-not-tried` / `indo-tried-complete` / `indo-tried-partial` / `indo-tried-no-response` | hemicrania-continua (§3.4), paroxysmal-hemicrania (§3.2) — both `hiddenUntilTrial` on `indo-tried-complete` |
| **Aura detail** (`aura`) | patient reports transient neurologic symptoms before/with headache (offer this branch when migraine is already in contention, i.e. a migraine band is present) | the 6 §1.2 C-characteristic chips + aura-type + `aura-fully-reversible` + `aura-symptom-unilateral` | migraine-with-aura (§1.2) |
| **Chronic-migraine detail** (`chronic-migraine-detail`) | `freq-ge-15-per-month` **AND** any migraine-pointing feature/symptom (so chronic-migraine vs chronic-TTH is live) | "On how many days/month is it migraine-like, and does a triptan/ergot relieve it?" → `migraine-features-ge-8-per-month`, `triptan-response-positive` | chronic-migraine (§1.3) — unlocks `cm-C`, the migraine-vs-TTH discriminator |
| **Vestibular detail** (`vestibular`) | patient reports vertigo/dizziness with headache | vertigo + migraine-history chips → `vest-vertigo-migrainous`, `vest-motion-sensitivity`, `migraine-history-established` | vestibular-migraine (§A1.6.6) |

**Branch UX (preserve the mockup's "narrows live" idiom):** a fired branch appears as one additional question screen inserted after the core six (or inline when triggered), and the live-differential zone (Frame 2) re-ranks as its answers land. The 6-dot progress indicator extends to show the branch as an appended step rather than renumbering the core spine. The Set-aside tray's "needs [X] to confirm" copy (mockup Frame 3 item 5: "needs attack duration to confirm") is the honest signal that a phenotype is gated behind an un-fired branch — it tells the clinician exactly which follow-up would move it up.

**Why "Less likely until branch fires" is safe here:** the triggers are tied to the *substrate* features each phenotype requires (short unilateral autonomic attacks for the TACs; vertigo for VM; ≥15 days + migraine features for CM; transient neuro symptoms for aura). If those substrate features are absent, the phenotype genuinely should be low in the differential, and banding it "Less likely" (or, for DROP-set substrate-absence, not at all) is correct. If they are present, the branch fires and the phenotype can climb to Possible/Leading. The clinician is never in a state where a cluster-typical or PH-typical presentation is silently capped — the presence of the trigger features *forces* the disambiguating question.

---

# 3. CONFLICT TEXT (Frame 3 runner-up "the reason it is not leading")

## 3.1 What it is and the do-no-new-claim rule

On Frame 3, the runner-up (top Possible) shows, *first on expand*, the single feature that keeps it out of Leading, in red, quoting the patient's own answer — the mockup's "No nausea or vomiting / Conflicts with the nausea you noted." This line is derived **entirely from the runner-up's own `PhenotypeMatch`** and the patient's selected chips. It must state a fact the engine already determined and add **no new clinical claim**. It names *why this phenotype is not leading*, using existing criterion text + the contributing chip the patient actually selected.

## 3.2 Derivation — two sources, one template

A runner-up is not Leading for one of exactly two reasons the engine exposes:

**Source A — `definitionallyExcluded === true` (EMIT set; the Set-aside-tier conflict).** The blocking feature is `exclusionReason` (the failed exclusion criterion's label), and the contradicting chip is the patient-selected chip that triggered the failure. This is the strongest conflict — the phenotype was actively ruled out by a feature the patient reported.

**Source B — a `missingCriteria` entry on a `probable`/`partial` runner-up (the ordinary near-miss).** The blocking feature is the single highest-priority missing criterion. When the runner-up is `probable`, there is exactly one missing criterion — use it. When `partial` with several missing, pick the **most discriminating** missing criterion: prefer a missed character/associated-symptom criterion (the migraine-vs-TTH discriminators) over a missed count/duration window, because that is the feature a clinician reasons about. The line states what is *missing*, optionally contrasted with the conflicting feature the patient gave for the leading phenotype.

### Template

> **[Criterion-derived blocking statement].** [Conflict clause tying it to the patient's own answer.]

- Line 1 (slate): the criterion in plain language — from `missingCriteria[].label` (Source B) or `exclusionReason` (Source A). No new claim; it is the engine's own criterion text simplified.
- Line 2 (red): the conflict clause — *"Conflicts with the [feature] you noted."* where `[feature]` is the **label of the patient-selected chip** (via `getChip(id).label`) that the runner-up's exclusion criterion contradicts, or *"Not noted yet"* / *"You haven't described [feature]"* when it is a plain absence (Source B with no contradicting positive). Pull the chip label verbatim from the engine (`metCriteria[].contributingChipLabels` on the *leading* phenotype, or the runner-up's contradicting chip), so the quote is the patient's actual selection, never paraphrased into a new assertion.

**Hard constraint for clinical-reviewer:** the red clause may only reference a chip the patient actually selected and a criterion the engine actually evaluated. It must never introduce a feature, threshold, or recommendation not already in the criterion text or the chip label. If a draft conflict line says anything the engine did not compute, it fails.

## 3.3 Worked examples

**Example 1 — Migraine leads, TTH runner-up set-aside (Source A; the mockup case).**
- Leading: migraine-without-aura (`full`). Patient selected `sym-nausea-moderate-severe` (label "Moderate or severe nausea during attacks"), satisfying `mig-D`.
- Runner-up: episodic-tth surfaces `definitionallyExcluded:true`, `exclusionReason` = "No nausea/vomiting; ≤1 of photophobia or phonophobia" (`tth-D` label).
- Conflict line:
  > **No nausea or vomiting.** Conflicts with the moderate/severe nausea you noted.
- Faithful because: `tth-D` is a real ICHD-3 §2.2 D exclusion the engine failed on the patient's own nausea chip. No new claim — it restates the exclusion + the patient's selection.

**Example 2 — Cluster leads (promoted probable), paroxysmal-hemicrania runner-up missing a window (Source B).**
- Leading: cluster-headache (`probable`, promoted; missed `cluster-D` bout-frequency, which is un-chip-able between bouts) → "Leading · ICHD-3 §3.5 Probable trigeminal autonomic cephalalgia."
- Runner-up: paroxysmal-hemicrania (`partial`), `missingCriteria` includes `ph-D` ("> 5 attacks per day for more than half the time") and `ph-B` (the 2–30 min window). Most-discriminating pick = the attack-duration/frequency that separates PH from cluster.
- Conflict line:
  > **Attacks 2–30 minutes, more than 5 per day.** Not noted yet — your attacks were described as 15–180 minutes.
- Faithful because: it names a real `ph-B`/`ph-D` criterion the patient has not met and contrasts it with the patient's own selected duration chip (`dur-15-to-180-min`, label quoted from the engine). It explains the ranking without diagnosing.

**Example 3 — Chronic migraine leads, chronic-TTH runner-up set-aside (Source A; the CM-vs-CTTH discriminator).**
- Leading: chronic-migraine (`full`).
- Runner-up: chronic-tth surfaces `definitionallyExcluded:true` only if its `ctth-D` failed on a positive contradicting chip; otherwise chronic-TTH is suppressed by the engine's §2.3-Note-1 rule (when full chronic-migraine is met, chronic-TTH is skipped). If it surfaces via EMIT, `exclusionReason` = `ctth-D` label.
- Conflict line (EMIT case):
  > **No moderate/severe nausea or vomiting.** Conflicts with the nausea you noted on migraine days.
- Note: if chronic-TTH was suppressed by Note-1 rather than EMIT, it does not appear as a runner-up at all — there is no conflict line to render, which is correct (ICHD-3 says code §1.3 in preference, full stop).

---

# 4. MANAGEMENT-CLAIM DESTINATION (the ~20 dosing claims)

## 4.1 The problem and the recommendation

Today the per-phenotype dosing renders inline (HeadacheManagement) under registered `clinic-headache-*` `data-claim` surfaces. The v4 mockup replaces inline dosing with "See also" management **links** (Frame 3 item 7: "Migraine management · Tension-type management"). The risk: if the links navigate somewhere that does not render the existing dosing, every one of those claims silently disappears from the rendered surface — a claim-coverage regression and a §13.3 violation (a registered claim that no longer renders anywhere).

**Recommendation: the "See also" links open a management view/section that renders the EXISTING `HeadacheManagement` dosing for the relevant phenotype(s), unchanged. Every `clinic-headache-*` management claim keeps its registered `data-claim` surface and continues to render — only its *location* moves from inline-on-result to one tap away.** No dosing text is re-authored; the existing component is reused verbatim. This preserves every claim, keeps the result screen short (the mockup's intent), and adds no new clinical claim.

Concretely, two acceptable implementations (build/UI to choose; both preserve claims):
- **(a) Same-route disclosure:** "See also" expands a collapsed `HeadacheManagement` section lower on the result page (the dosing still mounts in the DOM under its `data-claim` surfaces; the result just doesn't lead with it).
- **(b) Dedicated management view:** the link routes to a management section/page keyed by `phenotypeId` that mounts the same `HeadacheManagement` block. The `data-claim` surfaces move with the component.

Either way the rule is identical: **the `HeadacheManagement` dosing block for each top-candidate phenotype must mount and render under its existing `clinic-headache-*` `data-claim` attribute.** If a link points at a phenotype whose dosing block does not render at the destination, that is a `blocked:awaiting-scanner-support`-class regression and must not ship.

## 4.2 Which claims map to which top-candidate links

The "See also" links are generated from the banded result — one link per Leading/Possible phenotype that has management content. Mapping (claim IDs verbatim from `src/lib/citations/claims.ts`):

| Phenotype (band-eligible) | "See also" link | Management claim(s) it must render |
|---|---|---|
| migraine-without-aura (§1.1) | "Migraine management" | acute: *(see flag 4.4)*; preventive: `clinic-headache-preventive-threshold`, `clinic-headache-cgrp-escalation`, `clinic-headache-moh-gepant-safe` |
| migraine-with-aura (§1.2) | "Migraine management" | same migraine management set as §1.1 *(see flag 4.4)* |
| chronic-migraine (§1.3) | "Chronic migraine management" | `clinic-headache-chronic-migraine-acute`, `clinic-headache-chronic-migraine-preventive` |
| episodic-tth (§2.2) | "Tension-type management" | `clinic-headache-tension-acute-management`, `clinic-headache-tension-preventive` |
| chronic-tth (§2.3) | "Tension-type management" | `clinic-headache-tension-acute-management`, `clinic-headache-tension-preventive` |
| cluster-headache (§3.1) | "Cluster management" | `clinic-headache-cluster-acute-management`, `clinic-headache-cluster-preventive` |
| paroxysmal-hemicrania (§3.2) | "Paroxysmal hemicrania management" | `clinic-headache-ph-indomethacin-protocol` |
| sunct-suna (§3.3) | "SUNCT/SUNA management" | `clinic-headache-sunct-lamotrigine` |
| hemicrania-continua (§3.4) | "Hemicrania continua management" | `clinic-headache-hc-indomethacin-protocol` |

**Shared discriminator surface:** when both a migraine band and a TTH band are present, the `clinic-headache-pitfall-mig-vs-tth` claim must still render (mockup-equivalent of the MapperPanel discriminator). Route it as a one-line note adjacent to the "See also" links, not buried in a management view — it is the discriminator the clinician needs *at the differential*, not inside a treatment page.

**Partial-match guard preserved:** `clinic-headache-partial-match-caveat` must render at the top of the management body for any phenotype shown at `partial` strength (Possible-via-partial or Less-likely). Its anti-anchoring text ("Partial match: confirm the diagnosis before initiating; criteria are not yet met; dosing is shown for reference") is required wherever partial-strength dosing is exposed. Carry it into whichever destination (4.1a or 4.1b) renders the dosing.

**Criteria claims (`ichd3-*-criteria`) are unaffected.** The 8 `clinic-headache-ichd3-*-criteria` claims belong to the *result/drawer criteria checklist* (Frame 3 candidate accordions show "✓ matched / ✗ unmatched" criteria), not to management. They continue to render on the result surface via the per-criterion checklist. This spec does not move them; it only confirms they remain the source of the matched/unmatched criterion rows the banding displays.

## 4.3 Verbatim-reuse confirmation

No management/dosing text is re-authored in v4. Every dosing string already passed dual sign-off and carries primary-trial + guideline citations (e.g. `clinic-headache-cluster-acute-management` → Sumatriptan Cluster Headache Study Group 1991 + Cohen 2009; `clinic-headache-hc-indomethacin-protocol` → Newman 1994 + Antonaci 1998 + Goadsby Continuum 2024). v4 reuses these strings **verbatim** by mounting the existing `HeadacheManagement` block. The only change is placement (inline → "See also" disclosure/view). Because the text and its `citation_ids` are untouched, no new `quoted_text` capture or re-verification is required for the move itself.

## 4.4 Flags (gaps clinical-reviewer must rule on)

1. **No dedicated acute-migraine dosing claim is registered for §1.1 / §1.2.** The registry has migraine *preventive*-threshold, CGRP-escalation, and gepant-MOH claims, plus ED-acute-migraine claims under `migraine-sonb-level-b` / `migraine-opioid-must-not-offer` / `migraine-dex-recurrence-level-b-pain-level-c` / `migraine-magnesium-level-u-aura` (AHS 2025, `robblee-ahs-2025`) — but those are scoped to the **ED acute-migraine** surface, not the clinic-headache pathway's "Migraine management" link. **Ruling needed:** does the "Migraine management" link reuse the AHS-2025 ED acute set, reuse the chronic-migraine-acute set, or does §1.1/§1.2 need a clinic-acute-migraine management claim authored before v4 ships? If the link would render with *no* acute-migraine dosing for the single most common phenotype, that is a content gap to close, not silently ship. I recommend the migraine link surface the existing preventive trio + the gepant-MOH claim and explicitly reuse `clinic-headache-chronic-migraine-acute` for acute steps (its stepwise NSAID/triptan/gepant framework applies to episodic migraine too), OR author a dedicated `clinic-headache-migraine-acute` claim. Flagging for clinical-reviewer's call.
2. **Vestibular migraine (§A1.6.6) has no management claim.** No `clinic-headache-vm-*` management content exists. If vestibular-migraine reaches a band, its "See also" link has nothing to render. **Ruling needed:** suppress the management link for vestibular-migraine (acceptable — it is an appendix research-criteria entity; the result can state "appendix entity; manage the underlying migraine and refer"), or author VM management. I recommend no management link for VM in v4 (route the clinician to migraine management + ENT/vestibular referral via a short note), and tracking VM-specific management as a future task — not a blocker, but state it explicitly in the result so nothing reads as missing.
3. **NDPH (§4.10) has no management claim** — consistent with it being a diagnosis of exclusion requiring workup. Its result should carry the "diagnosis of exclusion; pursue secondary workup" message (its `teachPearl`) rather than a dosing link. No claim disappears because none was registered; confirm the result copy makes the no-dosing state intentional, not an omission.
4. **Probable/Leading-promoted phenotypes** render management at the same claim as their parent phenotype (a "Probable migraine" Leading promotes the migraine management link, gated by the partial-match caveat from §4.2). No separate probable-tier management claims exist or are needed.

---

## Deliverable summary (routing block)

- **Claim/spec text:** §1–§4 above.
- **Source anchor:** `ichd3-2018` (ICHD-3, *Cephalalgia* 2018;38(1):1-211, PMID 29368949) — registered, within window; PMID re-confirmed against PubMed during authoring.
- **Class/Level:** ICHD-3 is a diagnostic *classification*, not a graded treatment recommendation — no AHA/ASA COR/LOE applies to the banding/criteria logic. Management claims carry their own existing class/level via their registered citations (unchanged by this spec).
- **Contraindications / limitations stated:** SNNOOP10 short-circuit precedes all banding (§2.0); band words are ranking labels not diagnoses (§1.1, §1.5d); no "Probable chronic migraine" may be named (§1.5b); conflict text adds no new claim (§3.2); every management claim must continue to render (§4.1); four content-gap flags requiring a ruling (§4.4).
- **Routing:** ready for clinical-reviewer.
