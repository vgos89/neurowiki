# NeuroWiki Content Audit — Build Roadmap
> Created: 2026-05-13. Updated each session by librarian post-flight.
> Purpose: living checklist of what's missing, what's pending, what's ready to build.
> Source documents: 2026 AHA/ASA Guideline (DOI 10.1161/STR.0000000000000513), TASKS.md, git log.

---

## 1. Calculator Audit Status

> Reference spec: docs/specs/CALCULATOR_SPEC.md v1.1. Last full audit: 2026-05-13.
> Full-spec calculators (Archetype 1 or 2 with portal drawer, two-row header, severity tokens): GCS, ICH Score, NIHSS.

| Calculator | Page file | Spec-compliant | Portal drawer | Known issues | Priority |
|---|---|---|---|---|---|
| GCS | GlasgowComaScaleCalculator.tsx | YES — reference Archetype 1 | YES | None | - |
| ICH Score | IchScoreCalculator.tsx | YES — Archetype 1 | YES | None | - |
| NIHSS | NihssCalculator.tsx | YES — Archetype 2, rebuilt 2026-05-13 | YES | UX: "normal exam" shortcut missing (see §1.1) | P1 |
| ABCD2 | Abcd2ScoreCalculator.tsx | Appears compliant per screenshot (2026-05-13) | Unknown | Desktop drawer left-0 bug (parked 2026-04-21) | P2 |
| ASPECTS | AspectScoreCalculator.tsx | Unknown — not audited | Unknown | Needs L5.5 audit | P2 |
| HAS-BLED | HasBledScoreCalculator.tsx | Unknown — not audited | Unknown | Needs L5.5 audit | P2 |
| Heidelberg | HeidelbergBleedingCalculator.tsx | Unknown — not audited | Unknown | Desktop drawer left-0 bug (parked 2026-04-21) | P2 |
| ROPE Score | RopeScoreCalculator.tsx | Unknown — not audited | Unknown | Needs L5.5 audit | P2 |
| Boston Criteria CAA | BostonCriteriaCaaCalculator.tsx | Unknown — not audited | Unknown | Needs L5.5 audit | P2 |
| CHA2DS2-VASc | Cha2ds2VascCalculator.tsx | Unknown — not audited | Unknown | Needs L5.5 audit | P2 |

### 1.1 NIHSS UX Issue — Normal Exam Shortcut

**Problem:** NIHSS items default to 0, but the drawer's completion state machine requires an active click on each item before it counts as "answered." A clinician with a completely normal exam must click fifteen "0" options to trigger the severity bracket. This defeats the purpose of the drawer.

**Recommended fix:** Add a "Mark as Normal Exam" shortcut button in the header or at the top of the item list. Clicking it sets all items to 0 and marks all as answered. This already has a precedent in the existing "Normal all motor" shortcut button (spec §3.5). Classification: Class C.

**V must approve before implementation.**

---

## 2. Trial Question Taxonomy

> Current state: 6 questions in src/data/trial-questions.ts. Target: ~24 questions.
> V-requested new questions (2026-05-13): intracranial stenosis, ICH surgery, basilar EVT, MVO, extended TNK/tPA window, PFO secondary prevention.

### 2.1 Existing Questions (6)

| ID | Question text | Trials linked | Missing trials |
|---|---|---|---|
| tpa-timing | When can I give tPA? | 7 (NINDS, ECASS3, WAKE-UP, EXTEND, THAWS, ORIGINAL, ACT) | NOR-TEST, ATTEST-2, TRACE-III (optional add) |
| lvo-evt | Does my LVO patient need EVT? | 11 (MR CLEAN thru ANGEL-ASPECT) | THRACE (bridging), DIRECT-MT, ESCAPE-NA1 — possible separate EVT-strategy question |
| anticoagulation | Should I anticoagulate this patient? | 3 (TIMING, OPTIMAS, ELAN) | NAVIGATE-ESUS, ENGAGE AF-TIMI 48, ARISTOTLE, ROCKET-AF (need data layer first) |
| hemicraniectomy | Is hemicraniectomy indicated? | 3 (DECIMAL, DESTINY, HAMLET) | DESTINY II (add to raise count to 4) |
| bp-control | How aggressive should BP control be? | 5 (ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, INTERACT4) | None missing — complete |
| dapt | DAPT after stroke or TIA? | 4 (CHANCE, POINT, THALES, INSPIRES) | CHANCE-2 (CYP2C19 subgroup — optional add) |

### 2.2 New Questions to Add (V-approved 2026-05-13)

These require: (a) trials added to data layer, (b) question entry in trial-questions.ts, (c) clinical-reviewer sign-off. Classification: Class C-clinical-editorial per question.

| # | Question | Key trials needed | Data layer status | Priority |
|---|---|---|---|---|
| 7 | Intracranial stenosis — stent or medicine? | SAMMPRIS, WASID, WEAVE (already in app), B_PROUD, VISSIT | SAMMPRIS needs rebuild (W8.2.9); WASID, VISSIT need stubs | P1 |
| 8 | ICH surgery — who benefits? | STICH I, STICH II, MISTIE III, ENRICH, (MIND future) | Stubs done; ENRICH needs rebuild (W8.2.1 — highest priority) | P1 |
| 9 | Basilar EVT — when is it indicated? | BEST, BASICS, ATTENTION, BAOCHE | Stubs done; ATTENTION + BAOCHE need rebuild (W8.2.5) | P1 |
| 10 | Medium vessel occlusion (MVO) — EVT yes or no? | ESCAPE-MeVO, DISTAL, ASTER 2 | ESCAPE-MeVO done; DISTAL (Archetype B parked W6.5); ASTER 2 needs stub | P2 |
| 11 | Extended TNK window (beyond 4.5 h without EVT candidate) | THAWS, TRACE-III | Both in app | P1 |
| 12 | PFO — close or anticoagulate? | RESPECT, REDUCE, CLOSE, DEFENSE-PFO | Need stubs/rebuilds — V to provide PDFs | P1 |
| 13 | Large-core EVT — push the threshold? | TENSION, SELECT2, ANGEL-ASPECT | All in app | P2 |
| 14 | Early vs delayed anticoagulation after AF stroke | TIMING, OPTIMAS, ELAN | All in app — already partially in question 3; may split | P2 |
| 15 | Bridging vs direct-to-EVT — skip tPA? | THRACE, DIRECT-MT, DEVT, DIRECT-SAFE, SKIP, MR CLEAN NO-IV, SWIFT-DIRECT | THRACE in app; others need stubs or rebuilds | P2 |
| 16 | Blood pressure target after successful EVT | BEST-II, BP-TARGET, OPTIMAL-BP | All in app — subset of question 5; may split | P2 |
| 17 | Hemicraniectomy — does age matter? | DESTINY, DESTINY II | DESTINY in app; DESTINY II done | P2 |
| 18 | Dual antiplatelet in high-risk TIA/minor stroke with CYP2C19 LOF | CHANCE-2 | In app | P2 |
| 19 | Secondary prevention in atherosclerotic stroke — statin intensity | SPARCL | In app | P2 |
| 20 | Ticagrelor vs aspirin for secondary prevention | SOCRATES | In app | P2 |
| 21 | Intensive BP lowering during IV thrombolysis | ENCHANTED | In app | P2 |
| 22 | Mobile stroke units — do they improve outcomes? | BEST-MSU | In app | P2 |
| 23 | Prehospital blood pressure lowering before stroke diagnosis | INTERACT4, RIGHT-2, RACECAT | In app | P2 |
| 24 | IV thrombolysis in wake-up and unknown-onset stroke | WAKE-UP, THAWS, TRACE-III | All in app | P2 |

---

## 3. Missing Trial Stubs (Needed for New Questions)

> V will provide PDFs for these trials. Classification per trial: Class C-clinical (stub) or E-clinical (full rebuild).

### Priority 1 — needed for new questions 7–12

| Trial | Year | Question | Data in app? | Action needed |
|---|---|---|---|---|
| WASID | 2005, NEJM | Intracranial stenosis | No | Stub needed. V to provide PDF. |
| VISSIT | 2015, Stroke | Intracranial stenosis | No | Stub needed. V to provide PDF. |
| RESPECT | 2013 (extended 2017), NEJM | PFO closure | No | Stub needed. V to provide PDF. |
| REDUCE | 2017, NEJM | PFO closure | No | Stub needed. V to provide PDF. |
| CLOSE | 2017, NEJM | PFO closure | No | Stub needed. V to provide PDF. |
| DEFENSE-PFO | 2018, Circulation | PFO closure | No | Stub needed. V to provide PDF. |
| NAVIGATE-ESUS | 2018, NEJM | Anticoag in ESUS | No | Stub needed. V to provide PDF. |
| ASTER 2 | 2022 | MVO EVT | No | Stub needed. V to provide PDF. |

### Priority 2 — needed for extended question taxonomy

| Trial | Year | Question | Data in app? | Action needed |
|---|---|---|---|---|
| DEVT | 2021, JAMA | Bridging vs direct | Partial (legend only) | Full rebuild needed. |
| DIRECT-MT | 2021, NEJM | Bridging vs direct | Partial (legend only) | Full rebuild needed. |
| DIRECT-SAFE | 2022, Lancet Neurol | Bridging vs direct | Partial (legend only) | Full rebuild needed. |
| MR CLEAN NO-IV | 2022, Lancet | Bridging vs direct | Partial (legend only) | Full rebuild needed. |
| SWIFT-DIRECT | 2022, Lancet Neurol | Bridging vs direct | Partial (legend only) | Full rebuild needed. |
| ENGAGE AF-TIMI 48 | 2013, NEJM | AF anticoag | No | Stub needed. |
| ARISTOTLE | 2011, NEJM | AF anticoag | No | Stub needed. |

---

## 4. Legacy Trial Rebuilds

> Source: W8.2 in TASKS.md. 14 trials on the rebuild list. V will provide PDFs for each.
> Classification per trial: Class E-clinical. Each requires evidence-verifier + medical-scientist + clinical-reviewer.

| # | Trial | Archetype | Priority | Status | PDF status |
|---|---|---|---|---|---|
| 1 | ENRICH | B (Grotta Bar) | P0 — highest urgency | W8.2.1 planned | V to provide |
| 2 | DEFUSE-3 | A | P1 | W8.2.2 planned | V to provide |
| 3 | DAWN | A (utility-weighted mRS) | P1 | W8.2.2 planned | V to provide |
| 4 | NINDS | A | P1 | W8.2.3 planned | V to provide |
| 5 | SELECT2 | B | P1 | W8.2.4 planned | V to provide |
| 6 | ANGEL-ASPECT | B | P1 | W8.2.4 planned | V to provide |
| 7 | ATTENTION | A | P2 | W8.2.5 planned | V to provide |
| 8 | BAOCHE | A | P2 | W8.2.5 planned | V to provide |
| 9 | INSPIRES | A | P2 | W8.2.6 planned | V to provide |
| 10 | CHANCE-2 | A | P2 | W8.2.6 planned | V to provide |
| 11 | ECASS III | A | P2 | W8.2.7 planned | V to provide |
| 12 | ORIGINAL | A (NI) | P2 | W8.2.8 planned | V to provide |
| 13 | SAMMPRIS | A (harm framing) | P2 | W8.2.9 planned | V to provide |
| 14 | B_PROUD | B or A TBD | P3 | W8.2.10 planned | V to provide |

### 4.1 Blocked Archetype B (Grotta Bar) Dependency

ENRICH, SELECT2, ANGEL-ASPECT, and B_PROUD all require GrottaBarChart.tsx (W6.5.1).
W6.5.1 is planned but not yet built. GrottaBarChart must land before any Archetype B rebuild can begin.

---

## 5. Clinical Question Shell — Synthesis Paragraphs

> Each question-detail page currently shows "Curated answer in progress."
> These synthesis paragraphs are Class D-clinical, gated by clinical-reviewer.
> V must provide the clinical framing (or approve medical-scientist drafts) before authoring begins.

| Question ID | Status | Notes |
|---|---|---|
| tpa-timing | Not started | Requires AHA/ASA 2026 §3 framing (COR 1 alteplase/TNK 0-4.5 h; COR 2a imaging-selected extended window) |
| lvo-evt | Not started | Requires 2026 AHA/ASA §5 framing (COR 1 anterior LVO; COR 1 basilar with NIHSS ≥10 + PC-ASPECTS ≥6) |
| anticoagulation | Not started | Requires 2026 AHA/ASA §4.6 framing (early NOAC timing after AF stroke; PFO anticoag vs closure) |
| hemicraniectomy | Not started | Requires reference to HAMLET/DECIMAL/DESTINY pooled analysis |
| bp-control | Not started | Requires framing post-EVT BP: intensive NOT recommended (2026 AHA COR 3 Harm) |
| dapt | Not started | Requires CHANCE/POINT/THALES framing + CYP2C19 LOF note |

---

## 6. W6.9 Predecessor Chain Wiring

> RCTChainSection.tsx component EXISTS at src/components/trials/RCTChainSection.tsx.
> Dev test route EXISTS at /dev/rct-chain-test.
> All 10 predecessor stubs exist (W7.0 complete 2026-04-28).
> Status: UNBLOCKED — ready to wire.

| Chain | Predecessor stubs | Target trial(s) | Wiring done? |
|---|---|---|---|
| EVT 2015 chain | IMS-III, SYNTHESIS, MR RESCUE | MR CLEAN, ESCAPE, REVASCAT, EXTEND-IA, SWIFT PRIME, THRACE | No |
| ICH surgery chain | STICH I, STICH II, MISTIE III | ENRICH | No |
| Acute DAPT chain | MATCH, CHARISMA | CHANCE, POINT, INSPIRES | No |
| Basilar EVT chain | BEST, BASICS | ATTENTION, BAOCHE | No |
| Hemicraniectomy chain | DECIMAL, DESTINY, HAMLET | DESTINY II | No |

Classification: Class C. No clinical content changes — structural wiring only.

---

## 7. Legend Slice Backfill

> 7 trials already have legend slice (ECASS III, EXTEND, MR CLEAN, NINDS, ESCAPE, DEFUSE-3, DAWN).
> ~24 trials in the catalog have no legend slice. Card renders gracefully without it (falls back to listDescription).

Highest-value backfills (trials most likely to appear in questions or be searched):

| Trial | Has legend slice? | Notes |
|---|---|---|
| SWIFT PRIME | No | EVT 2015 wave — high traffic |
| REVASCAT | No | EVT 2015 wave |
| EXTEND-IA | No | EVT 2015 wave |
| THRACE | No | Bridging question |
| INSPIRES | No | DAPT question — in app |
| CHANCE | No | DAPT question — in app |
| POINT | No | DAPT question — in app |
| ENCHANTED | No | BP question |
| ENRICH | No | ICH surgery — pending rebuild |
| SAMMPRIS | No | Intracranial stenosis — pending rebuild |

Classification per trial: Class C-clinical-editorial. NNT-as-stat pattern from TRIALS_SPEC §L6.1.

---

## 8. Compliance Pages (Phase 4D)

> Status: planned. Not yet built. /privacy, /terms, /accessibility routes do not exist.

**What's needed:**
- `/privacy` — disclose: Google Analytics (anonymize_ip), Resend feedback email, NPI proxy (not stored), localStorage (recents/favorites/disclaimer), data deletion contact
- `/terms` — standard medical disclaimer, no warranty, not a substitute for clinical judgment
- `/accessibility` — WCAG 2.1 AA commitment, known issues, contact for accessibility assistance

Classification: Class C. Agents: content-writer + ui-architect + compliance-legal sign-off.

---

## 9. Open Issues Parked by V

| Issue | Parked date | Notes |
|---|---|---|
| SSH private key in git history (SEC-1) | 2026-05-13 | V must revoke key at GitHub Settings first; orchestrator then executes git filter-repo. Parked pending V action. |
| `time-is-brain-deep` pearl misattribution | 2026-05-11 | 50%/38% from Marler 2000, not NINDS trial. Fix: re-source or replace with Emberson 2014 pooled framing. Class E follow-up. |
| Data-layer NNT prose for ordinal-shift trials | 2026-05-11 | DEFUSE-3, SELECT2, ANGEL-ASPECT nntExplanation/keyStat still contain invalid NNT statements. Class E. Requires trial-statistician sign-off. |
| NOR-TEST data inconsistency | 2026-05-08 | Tagged noninferiority+noninferiority-not-established but doesNotProve says superiority trial. Class C-clinical data fix. |
| Vocabulary consolidation ADR | 2026-05-08 | Four parallel vocabularies in codebase (legacy/deprecated/Wave 2/Wave 3). Class D. |

---

## 10. Recommended Build Order (next 8 tasks)

This is a suggestion. V approves each task before it starts.

1. **NIHSS normal exam shortcut (Class C)** — quick UX fix, no clinical content. Unblocks the drawer for bedside use.
2. **L5.5 calculator compliance audit (Class B read-only)** — identify which of the 6 unaudited calculators need rebuilds. No code written; just a report.
3. **Phase 4D compliance pages (Class C)** — /privacy, /terms, /accessibility. P0 compliance.
4. **GrottaBarChart component W6.5.1 (Class C)** — unlocks all Archetype B rebuilds (ENRICH, SELECT2, ANGEL-ASPECT).
5. **ENRICH rebuild W8.2.1 (Class E-clinical)** — highest urgency legacy trial. Requires PDF from V.
6. **W6.9 predecessor chain wiring (Class C)** — component and stubs exist; just wiring.
7. **PFO trial stubs (Class C-clinical)** — RESPECT, REDUCE, CLOSE, DEFENSE-PFO. Requires PDFs from V.
8. **Expand question taxonomy from 6 → ~12 (Class C-clinical-editorial)** — wire new questions once trials exist in data layer.

---

*This file is updated by the librarian agent after each work session. Add new trials, questions, and findings here as V provides PDFs and approves build tasks.*
