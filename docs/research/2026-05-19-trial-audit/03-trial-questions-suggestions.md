# Trial Questions — Audit and Suggestions

**Date:** 2026-05-19
**Reviewer:** medical-scientist
**Scope:** Audit of `src/data/trial-questions.ts` (13 existing questions) against `src/data/trialData.ts` (~80 trials) and `src/data/trialListData.ts` (catalog).
**Status:** READ-ONLY research output. No source files were edited.

## Summary

NeuroWiki currently ships 13 clinical questions covering tPA timing, EVT for LVO/basilar, anticoagulation timing, hemicraniectomy, BP control, DAPT, ICH surgery, MSU dispatch, ICAS stenting, TNK vs alteplase, and direct vs bridging. Across these 13 questions, this audit identified roughly 30 trials in the existing catalog that are clinically relevant to questions they are not currently linked to. Concentrations of missed cross-links: tPA-timing (missing the tenecteplase wake-up/late trials), DAPT (missing SOCRATES, SPS3, ARAMIS), EVT (missing bridging-strategy trials and ESCAPE-MeVO/DISTAL/THRACE), BP-control (missing RIGHT-2 and MR ASAP).

7 new bedside-style questions are proposed that the existing catalog can fully answer. 4 evidence gaps are flagged — questions the catalog cannot currently answer well (cryptogenic ESUS/PFO, lacunar/small-vessel secondary prevention, DOAC head-to-heads, AVM management). Orphan trials (PRISMS, ARAMIS, RAISE, PROST, RACECAT, TRIAGE-STROKE, ESCAPE-NA1, CHARM, CHOICE, COMPASS, ASTER, ASTER2, DEVT, SKIP, RESCUE BT, SPARCL, SOCRATES, SPS3, EAGLE, NOR-TEST 2 Part A, TWIST) are listed with disposition notes.

---

## Part A — Existing questions, missed cross-links

Format per missed link: **trial-id (NAME year)** — *direct* or *contextual* — one-sentence rationale.

### Q1 `tpa-timing` — "When can I give tPA?"

Currently links: NINDS, ECASS III, WAKE-UP, EXTEND, THAWS, ORIGINAL, AcT.

Missed cross-links:

- **twist-trial (TWIST 2022)** — *direct* — wake-up stroke treated with tenecteplase on non-contrast CT alone; negative result, but defines the boundary of when imaging-free wake-up IVT does not work.
- **trace-iii-trial (TRACE-III 2024)** — *direct* — late-window (4.5–24 h) tenecteplase for ICA/MCA occlusion when EVT is unavailable; directly addresses the tPA-timing question outside the AcT/ORIGINAL 0–4.5 h window.
- **timeless-trial (TIMELESS 2024)** — *direct* — perfusion-selected late-window tenecteplase in a largely EVT-treated LVO population; negative but defines the limit of late-window IVT when EVT is co-administered.
- **prisms-trial (PRISMS 2018)** — *contextual* — minor non-disabling stroke; alteplase did not outperform aspirin and caused more sICH — relevant boundary for the "when" question (severity threshold, not just time).
- **aramis-trial (ARAMIS 2023)** — *contextual* — DAPT non-inferior to alteplase in minor non-disabling stroke ≤4.5 h; reframes the "give tPA" decision in mild stroke.
- **raise-trial (RAISE 2024)** — *contextual* — reteplase superior to alteplase in early window; expands the agent-choice dimension of "when can I give a thrombolytic."
- **prost-trial (PROST 2023) / prost-2-trial (PROST-2 2024)** — *contextual* — rhPro-UK noninferior to alteplase with lower bleeding; adds agent options to the IVT decision.
- **nor-test-2-part-a-trial (NOR-TEST 2 Part A 2022)** — *contextual* — high-dose TNK 0.4 mg/kg worse than alteplase in moderate-severe stroke; defines safety boundary for dose escalation.

### Q2 `lvo-evt` — "Does my LVO patient need EVT?"

Currently links: MR CLEAN, ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT, DEFUSE-3, DAWN, LASTE, TENSION, SELECT2, ANGEL-ASPECT.

Missed cross-links:

- **thrace-trial (THRACE 2016)** — *direct* — French bridging-therapy trial showing EVT-on-top-of-alteplase benefit; foundational LVO-EVT evidence.
- **escape-mevo-trial (ESCAPE-MeVO 2024)** — *contextual* — extends the LVO question into M2/M3, ACA, PCA territory; resident asking "does my LVO need EVT" often actually has MeVO.
- **distal-trial (DISTAL 2024)** — *contextual* — same as ESCAPE-MeVO; defines the negative end of EVT-for-distal-occlusions.
- **direct-mt-trial, mr-clean-no-iv-trial, swift-direct-trial, direct-safe-trial, devt-trial, skip-trial** — *contextual* — all six bridging-vs-direct trials inform whether an LVO patient needs EVT *plus IVT* or EVT alone.

### Q3 `anticoagulation` — "Should I anticoagulate this patient?"

Currently links: TIMING, OPTIMAS, ELAN. The file itself flags the count as aspirational (target 9; no other AC-timing trials in catalog).

Missed cross-links from existing catalog: **none directly relevant**. Genuine content gap (NAVIGATE-ESUS, ARISTOTLE, RE-LY, ROCKET-AF, ENGAGE AF-TIMI 48, RESPECT, CLOSE, DEFENSE-PFO, REDUCE).

Recommend: keep trialCount at 3; track the gap as a data-layer task.

### Q4 `hemicraniectomy` — "Is hemicraniectomy indicated?"

Currently links: DECIMAL, DESTINY, HAMLET.

Missed cross-links:

- **destiny-ii-trial (DESTINY II 2014)** — *direct* — hemicraniectomy in patients >60 years; resident routinely needs the age-ceiling answer.
- **charm-trial (CHARM 2024)** — *contextual* — glibenclamide for malignant edema prevention; same patient population.

### Q5 `bp-control` — "How aggressive should BP control be?"

Currently links: ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, INTERACT4.

Missed cross-links:

- **right-2-trial (RIGHT-2 2019)** — *direct* — prehospital glyceryl trinitrate in presumed stroke; earliest-time-point BP-lowering evidence.
- **mr-asap-trial (MR ASAP 2022)** — *direct* — prehospital GTN stopped early after early harm signal in ICH; defines the harm boundary of prehospital BP lowering before imaging.

### Q6 `dapt` — "DAPT after stroke or TIA. Yes or no?"

Currently links: CHANCE, POINT, THALES, CHANCE-2, INSPIRES.

Missed cross-links:

- **socrates-trial (SOCRATES 2016)** — *contextual* — ticagrelor monotherapy vs aspirin (not DAPT) but answers the adjacent "if not DAPT, then what?" question.
- **sps3-trial (SPS3 2012)** — *contextual* — long-term DAPT for lacunar stroke showed harm without benefit; defines the duration boundary.
- **aramis-trial (ARAMIS 2023)** — *direct* — DAPT noninferior to alteplase in minor non-disabling stroke ≤4.5 h.

### Q7 `basilar-evt` — Complete, no misses identified.

### Q8 `ich-surgery` — Complete, no misses identified.

### Q9 `msu-dispatch` — "Does MSU dispatch improve outcomes?"

Currently links: B_PROUD, BEST-MSU.

Missed cross-links:

- **right-2-trial (RIGHT-2 2019)** — *contextual* — sham-controlled prehospital intervention via ambulance.
- **interact4-trial (INTERACT4 2023)** — *contextual* — prehospital BP lowering; same operational paradigm.

### Q10 `icas-stenting` — File's inline TODO already flags VISSIT and CASSISS as missing data-layer.

### Q11 `tnk-vs-alteplase` — "Tenecteplase or alteplase?"

Currently links: NOR-TEST, AcT, TASTE, ATTEST-2, ORIGINAL, TRACE-2.

Missed cross-links:

- **nor-test-2-part-a-trial** — *direct* — high-dose TNK harm.
- **timeless-trial** — *direct* — late-window TNK in LVO with EVT.
- **trace-iii-trial** — *direct* — late-window TNK for ICA/MCA when EVT unavailable.
- **twist-trial** — *direct* — TNK in wake-up stroke.
- **raise-trial** — *contextual* — reteplase reframes the agent-choice question.

### Q12 `direct-vs-bridging` — "Direct thrombectomy or bridging with IV thrombolysis first?"

Currently links: DIRECT-MT, MR CLEAN-NO IV, SWIFT DIRECT, DIRECT-SAFE.

Missed cross-links:

- **devt-trial (DEVT 2020)** — *direct*
- **skip-trial (SKIP 2020)** — *direct*
- **thrace-trial (THRACE 2016)** — *contextual* — comparator predecessor

---

## Part B — New question suggestions

### B1. "Should I do EVT for large-core stroke (low ASPECTS)?"
- **Trials:** LASTE, SELECT2, ANGEL-ASPECT, TENSION (+ RESCUE-Japan LIMIT once added per accuracy audit)
- **Icon:** `target`

### B2. "Perfusion imaging or non-contrast CT for late-window selection?"
- **Trials:** DAWN, DEFUSE-3, LASTE, TENSION, SELECT2, ANGEL-ASPECT, EXTEND
- **Icon:** `target` (or new `imaging`)

### B3. "Aspiration first or stent retriever first for thrombectomy?"
- **Trials:** ASTER, ASTER2, COMPASS
- **Icon:** `layers`

### B4. "Is neuroprotection or adjunct pharmacotherapy useful during EVT?"
- **Trials:** ESCAPE-NA1, RESCUE BT, CHOICE
- **Icon:** `pill`

### B5. "Minor non-disabling stroke — alteplase, DAPT, or aspirin?"
- **Trials:** PRISMS, ARAMIS, CHANCE, POINT, INSPIRES
- **Icon:** `pill`

### B6. "Does my MeVO or distal-occlusion patient benefit from EVT?"
- **Trials:** ESCAPE-MeVO, DISTAL
- **Icon:** `target`

### B7. "What's the post-EVT blood pressure target?"
- **Trials:** BP-TARGET, BEST-II, OPTIMAL-BP, ENCHANTED
- **Icon:** `waveform`

Optional B8 (lower priority): **"Should I treat my unknown-onset/wake-up stroke patient with thrombolysis?"** — WAKE-UP, THAWS, TWIST, EXTEND.

---

## Part C — Out of scope but worth surfacing

### C1. Evidence gaps — questions the catalog cannot currently answer

- **PFO closure for cryptogenic stroke** — need RESPECT, CLOSE, REDUCE, DEFENSE-PFO, CLOSURE I.
- **DOAC vs warfarin** — need RE-LY, ROCKET-AF, ARISTOTLE, ENGAGE AF-TIMI 48.
- **Lacunar/small-vessel secondary prevention** — SPS3 isolated; need SPARCL context + ESPS-2.
- **Anticoagulation for ESUS** — need NAVIGATE-ESUS, RE-SPECT ESUS.
- **Carotid endarterectomy vs stenting** — `carotid` listCategory exists but is empty (need NASCET, CREST, ICSS, ACAS).
- **AVM management — treat or observe?** — need ARUBA.

### C2. Orphan trials — in catalog but not linked to any question

| Trial ID | Year | Recommendation |
|---|---|---|
| `sparcl-trial` | 2006 | Future "secondary prevention — statin" question; or pair with SPS3 in a lacunar question |
| `socrates-trial` | 2016 | Add to `dapt` Q6 contextual |
| `sps3-trial` | 2012 | Add to `dapt` Q6 contextual; or anchor future lacunar question |
| `racecat-trial` | 2022 | Future "Where should the ambulance go — drip-and-ship or mothership?" prehospital-routing question (pairs with TRIAGE-STROKE) |
| `triage-stroke-trial` | 2023 | Pairs with RACECAT |
| `right-2-trial` | 2019 | Add to `bp-control` Q5 + `msu-dispatch` Q9 |
| `mr-asap-trial` | 2022 | Add to `bp-control` Q5 |
| `aramis-trial` | 2023 | Add to `dapt` Q6 + B5 |
| `prisms-trial` | 2018 | Add to B5 |
| `raise-trial` | 2024 | Anchor future "Reteplase, tenecteplase, or alteplase?" question; or contextual to Q11 |
| `prost-trial` | 2023 | Same as RAISE |
| `prost-2-trial` | 2024 | Same as PROST |
| `nor-test-2-part-a-trial` | 2022 | Add to Q11 |
| `timeless-trial` | 2024 | Add to Q1 + Q11 |
| `trace-iii-trial` | 2024 | Add to Q1 + Q11 |
| `twist-trial` | 2022 | Add to Q1 + Q11 |
| `escape-mevo-trial` | 2024 | Anchor B6 |
| `distal-trial` | 2024 | Anchor B6 |
| `thrace-trial` | 2016 | Add to Q2 + Q12 |
| `devt-trial` | 2020 | Add to Q12 |
| `skip-trial` | 2020 | Add to Q12 |
| `aster-trial` | 2017 | Anchor B3 |
| `aster2-trial` | 2021 | Anchor B3 |
| `compass-trial` | 2019 | Anchor B3 |
| `choice-trial` | 2022 | Anchor B4 |
| `rescue-bt-trial` | 2022 | Anchor B4 |
| `escape-na1-trial` | 2020 | Anchor B4 |
| `charm-trial` | 2024 | Add to Q4 contextual; or part of future "malignant edema management" question |
| `destiny-ii-trial` | 2014 | Add to Q4 (per Part A + file's inline TODO) |
| `eagle-trial` | 2010 | Genuinely orphan — CRAO, not ischemic stroke. Leave for category-browse only |

---

## Notes and caveats

- "Direct" vs "contextual" labels in Part A are judgment calls based on trial description metadata only; full claim-level review of each cross-link is a Class C-clinical editorial pass under `clinical-reviewer` gate, not the scope of this overnight research.
- Suggested icons use the existing `QuestionIconKey` union (`clock | target | pill | brain | waveform | layers`). If new questions push the icon set (e.g., an `imaging` icon for B2), that's a `ui-architect` task downstream.

Routing: ready for V review; if approved in whole or part, the implementation pass is **Class C-clinical-editorial** (multiple `trialIds[]` edits + 1–8 new `TrialQuestion` records) and should route through `medical-scientist` → `clinical-reviewer` per CLAUDE.md §6/§13.
