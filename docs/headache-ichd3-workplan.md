# Headache Clinic Pathway — ICHD-3 Coverage & Correctness Work Plan (living rubric)

> Updated after each work run. Source of truth for criteria: the official ICHD-3 (2018) text +
> [ichd3-criteria-verified-reference.md](2026_07_01/ichd3-criteria-verified-reference.md) (per-criterion verification) and
> [ichd3-coverage-audit.md](2026_07_01/ichd3-coverage-audit.md) (taxonomy gaps). Engine: `src/data/clinicHeadacheData.ts`,
> `headacheBanding.ts`, `headacheConflict.ts`, `headacheQuestions.ts`.
>
> **Status legend:** ✅ done (committed) · 🔨 in progress · 📋 planned (spec ready) · ⏳ pending (blocked/queued) · ⏸️ reviewed — no change needed
>
> **Governance:** every code item here is **Class E** (diagnostic-logic change) → make fix → run headache test suite → clinical-reviewer gate → commit. Criteria rest on the source-verified reference, not memory.

**Last updated:** 2026-07-06 · after run 3 (A-m6 shipped; A-M1 source retrieval in flight)

---

## Track A — Correctness fixes to the current 11 phenotypes
*(from the discrepancy report; brings the engine into line with the verified official criteria)*

| ID | Item | ICHD-3 | Severity | Status | Notes |
|---|---|---|---|---|---|
| A-m4 | Frequent episodic TTH accepts exactly 10 episodes | §2.2 A ("≥10") | minor (bug) | ✅ done (run 2) | attack-count options relabeled non-overlapping "5 to 9" / "10 or more"; `tth-A`'s `attacks-gt-10` now means ≥10 (inclusive of 10); no evaluate logic changed; ≥5/≥2 checks unaffected (they OR both chips). Clinical-reviewer: approve. |
| A-M3 | NDPH: enforce clearly-remembered onset + continuous within 24 h | §4.10 B | **material** | ✅ done (run 2) | new `onset-abrupt-continuous-24h` chip + question option; `ndph-B` now requires the §4.10 B 24 h signature, not recency; over-call regression test added. Clinical-reviewer: approve (verified §4.10 B verbatim vs `ichd3-2018`). |
| A-M2 | SUNCT vs SUNA distinction (split bundled autonomic chip) | §3.3.1/3.3.2 | **material** | ⏳ pending | **reclassified (run 2): NOT a quick fix.** Needs distinct SUNCT vs SUNA *outputs* → coupled to the Phase-1 subtype-hierarchy layer + ADR, not a standalone chip split. The itemized autonomic chips (conjunctival-injection / lacrimation / other) are a prerequisite but touch cluster + HC + PH too. Moved to Phase 1. |
| A-M1 | Vestibular migraine: add ≥5-episode, 5min–72h, mod/severe, ≥50%-of-episodes gates | A1.6.6 | **material** | 🔨 in progress | over-calls VM; evidence-verifier retrieving verbatim §A1.6.6 (Bárány/Lempert 2012) criteria (run 3). Encoding needs new episode-count/duration/intensity/≥50% chips once source confirmed. |
| A-m6 | Hemicrania continua: add "aggravation by movement" alternative to criterion C | §3.4 C.2 | minor | ✅ done (run 3) | `hc-C` now honors the §3.4 C.2 movement clause via the already-surfaced `act-aggravated` chip (closed a claim-vs-logic mismatch: label promised it, logic did not). Reused existing chip rather than adding a redundant one. Clinical-reviewer: approve. |
| A-m5 | Paroxysmal hemicrania severity accepts "very severe" | §3.2 B | minor | ⏸️ no change | permissive superset, no false negatives — safe as-is |
| A-m7 | Migraine-without-aura pediatric 2–72 h window | §1.1 Note 3 | minor | ⏸️ deferred | out of adult-clinic scope; revisit only if pediatric use added |
| A-m8 | Chronic TTH lower duration bound widened to 30 min | §2.3 B | minor | ⏸️ no change | demote-gate approximation, negligible impact |
| A-s9–s13 | Criterion-E-per-phenotype, HC A/B bundling, morphology clauses | various | cosmetic | ⏸️ no change | delegated to red-flag layer / label-mapping only |

## Track B — Chip-taxonomy & red-flag fixes (Phase 0 — prerequisites, mostly safety)

| ID | Item | Status | Notes |
|---|---|---|---|
| B-1 | `rf-positional` conflates upright-worse (SIH) with recumbent-worse (raised pressure) | 📋 planned | opposite mechanisms; split the chip |
| B-2 | Pull `rf-painkiller-overuse` out of the red-flag short-circuit (MOH is reversible, not "danger workup") | ⏳ pending | prerequisite for MOH overlay (B-Phase1) |
| B-3 | Split benign trigger chips (cough/exertion) from red-flag `rf-valsalva` | ⏳ pending | prerequisite for §4 cough/exercise |
| B-4 | Red-flag suspect naming: each flag → named must-not-miss suspect + first test (SAH/RCVS, GCA, IIH/CVST, SIH, meningitis) | 📋 planned | interpretation-text only; high teaching/safety value |

## Track C — New diagnoses (coverage gaps), by build phase
*(criteria for must-adds are source-verified in the reference doc)*

| ID | Item | ICHD-3 | Phase | Status |
|---|---|---|---|---|
| C-MOH | Medication-overuse headache as an **overlay** (≥15 d/mo simple vs ≥10 d/mo triptan/ergot/opioid/combo/multiple; >3 mo; code alongside primary) | §8.2 | 1 | ⏳ pending (criteria verified; needs overlay mechanism + ADR) |
| C-aura | Migraine-with-aura subtype emission (typical / brainstem / hemiplegic / retinal) | §1.2.1–1.2.4 | 1 | ⏳ pending (needs subtype-hierarchy layer + ADR); retinal exclusion + hemiplegic-refer are safety wins |
| C-cluster-sub | Cluster episodic vs chronic | §3.1.1/3.1.2 | 1 | ⏳ pending (falls out of hierarchy layer) |
| C-TN | Trigeminal neuralgia (idiopathic leaf; classical→imaging; secondary→refer) | §13.1 | 2 | ⏳ pending (criteria verified; new chip vocabulary) |
| C-ON | Occipital neuralgia (nerve-block gate reuses `hiddenUntilTrial`) | §13.4 | 2 | ⏳ pending (criteria verified) |
| C-stab | Primary stabbing headache (chip `qual-sharp-stabbing` already exists, unused) | §4.7 | 2 | ⏳ pending |
| C-hypnic | Hypnic ("alarm-clock") headache | §4.9 | 2 | ⏳ pending |
| C-status | Status migrainosus (consumes existing `dur-gt-72-hours` chip) | §1.4.1 | 2 | ⏳ pending |
| C-pNDPH | Probable NDPH (fix wrong in-code comment; stop dropping ndph-B near-miss) | §4.10.1 | 2 | ⏳ pending |
| C-tenderness | Pericranial-tenderness subform label for TTH | §2.x.1/.2 | 2 | ⏳ pending |
| C-more | §4.1 cough / §4.2 exercise / §4.8 nummular / §13.1.2 painful trigeminal neuropathy / §13.11 BMS / §13.12 PIFP / §2.1 infrequent TTH / §3.2 ep-chronic / complete Bárány VM | various | 3 | ⏳ pending |

## Architecture notes (from the feasibility assessment)
- **Chip/`Criterion` model = strong/extensible** → neuralgias + §4 others drop in with new chips (additive, Class E).
- **`Phenotype` array = weak for non-flat** → subtypes (no hierarchy) + MOH (no co-occurrence) both need **structural changes + an ADR each** (Class D-carrying-E). Do NOT bolt boolean flags onto `Phenotype` (spreads special-casing across ~6 switch sites).
- Build order: Phase 0 (chip/red-flag fixes) → Phase 1 (MOH overlay ∥ subtype layer ∥ red-flag naming) → Phase 2 (§4 + neuralgias + contained fixes) → Phase 3 (completeness).

## Run log
- **Run 1 (2026-07-06):** created this rubric; verified reference + coverage audit saved. Next: confirm vestibular appendix source, then execute Track A correctness fixes (A-m4, A-m6, A-M3, A-M2) test-gated.
- **Run 2 (2026-07-06):** shipped **A-M3** (NDPH §4.10 B onset gate — new `onset-abrupt-continuous-24h` chip + question option; `ndph-B` no longer fires on recency; over-call regression test added) and **A-m4** (§2.2 TTH ≥10 boundary relabel, inclusive of exactly 10). 207/207 tests pass, tsc clean. Clinical-reviewer **approved** (§4.10 B + §2.2 A verified verbatim vs `ichd3-2018`; artifact `docs/reviews/clinical-PR-headache-ndph-tth-boundary-fixes.md`). Reclassified **A-M2** (SUNCT/SUNA) as coupled to the Phase-1 subtype-hierarchy layer — not a standalone quick fix. Next: **A-m6** (HC §3.4 C.2 movement-aggravation alternative — genuinely quick), then confirm the vestibular appendix source for **A-M1**. Commit `c6885dd`, pushed (Gate 6 green).
- **Run 3 (2026-07-06):** shipped **A-m6** (HC §3.4 C.2 — `hc-C` now honors the movement-aggravation clause via `act-aggravated`; added a positive full-match test + a teaching cross-reference on the chip). 86/86 headache tests pass, tsc + humanizer clean. Clinical-reviewer **approved** (artifact `docs/reviews/clinical-PR-hemicrania-continua-hc-c-movement.md`). Launched an evidence-verifier in parallel to retrieve the verbatim **§A1.6.6 vestibular migraine** criteria (unblocks **A-M1**). Next: on the packet, encode A-M1 (the last material Track A fix), then Track A is complete and Phase 0 / Phase 1 structural work (Track B red-flags, subtype-hierarchy for A-M2 + C-aura + C-cluster-sub) begins.
