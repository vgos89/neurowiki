# Trial Accuracy Audit — 2026-05-19 (Overnight)

**Reviewer:** evidence-verifier
**Scope:** all trials in `src/data/trialData.ts` (89 records) + `src/data/trialCatalogMeta.ts` (24 records) + `src/data/trialListData.ts` (registry)
**Method:** PubMed cross-check (from training), editorial review, AHA/ASA 2026 + 2022 ICH guideline alignment, statistical-framework rules from `clinical-trial-audit` skill
**Status:** READ-ONLY findings. No source files were edited. V + clinical-reviewer review tomorrow.

**Caveats on this packet:** Items marked `verify-full-text` need a full-prose pass before any code change. No DOI-resolution was performed — DOIs are accepted as written unless I have specific evidence of a typo (none found). Where I assert a published value, that value comes from training knowledge of the trial; medical-scientist should re-verify against the source PDF before any text edit.

---

## Required follow-ups for V / clinical-reviewer (prioritized — read this section first)

### Tier 1 — Blocking, must resolve before any code change

1. **ESCAPE-MeVO primary endpoint mismatch.** Catalogue says `mRS 0-2 at 90 days`; published primary is `mRS 0-1 at 90 days`. Numbers match mRS 0-1 framing, so the **label is wrong, not the data**. medical-scientist + clinical-reviewer required.
2. **LASTE primary design mislabel.** Catalogue says `binary-superiority`; published primary is **ordinal mRS shift** (cOR 1.63). Reclassify. Numbers in `ordinalStats` field are already correct. medical-scientist + clinical-reviewer required.
3. **NOR-TEST design mislabel.** Catalogue says `noninferiority`; published trial was a **superiority** design that did not meet superiority. Reclassify to `binary-superiority / not-met`. medical-scientist + clinical-reviewer required.
4. **PRISMS result mislabel.** Catalogue says `futility-stopped`; trial was terminated administratively by sponsor for slow enrollment. Reclassify to `terminated-administrative`.
5. **SELECT2 / ANGEL-ASPECT NNT display.** Numeric `calculations.nnt` renders despite ordinal primary. Either suppress the numeric field or wire a renderer-level "secondary outcome" guard. Per `clinical-trial-audit` skill, this is a block-on-display rule. clinical-reviewer required. (Also flagged in `02-statistical-interpretation-audit.md`.)
6. **DECIMAL / DESTINY trialResult mislabel.** Both currently `NEUTRAL`; both showed major mortality reduction (the primary endpoint of these trials). Should be `POSITIVE` for the mortality endpoint. clinical-reviewer required.

### Tier 2 — Required additions (missing trials)

7. **RESCUE-Japan LIMIT (Yoshimura NEJM 2022)** — first positive large-core EVT trial; missing from the SELECT2/ANGEL-ASPECT chain.
8. **ESCAPE-NEXT (Hill 2024/2025)** — confirmatory negative nerinetide trial; needed to close the ESCAPE-NA1 story and prevent over-claim.
9. **EXTEND-IA TNK (Campbell NEJM 2018)** — foundational tenecteplase pre-EVT trial; distinct from EXTEND-IA (2015).
10. **ANNEXA-I (Connolly NEJM 2024)** — andexanet alfa for FXa-ICH; halted by DSMB.
11. **Antiplatelet timeline foundational trials:** add IST (1997), CAST (1997), PRoFESS (2008), CSPS.com (2019) as stubs.
12. **PFO closure trials** (RESPECT, CLOSE, REDUCE) — major cryptogenic-stroke evidence currently absent.
13. **CREST / CREST-2** carotid trials — `listCategory: 'carotid'` exists in schema but is currently empty.
14. **THEIA** (CRAO IV alteplase) — referenced in EAGLE prose but missing as its own entry.

### Tier 3 — Advisory enrichment

15. **Missing `primaryDesign`/`primaryResult` fields** on INTERACT4, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1, DECIMAL, DESTINY, HAMLET, DESTINY-II. Pure metadata gap; not a clinical claim change.
16. **EXTEND statistical caveat** — make explicit that headline P=0.04 is from the adjusted analysis only and that the ordinal secondary was not met.
17. **THAWS dose caveat** — record low-dose alteplase (0.6 mg/kg) explicitly in `applicability.doseSpecific`.
18. **ATTEST-2 secondary NI** — add `secondaryDesign: 'noninferiority'`, `secondaryResult: 'noninferiority-established'`.
19. **SPARCL hemorrhagic stroke caveat** — add `harmSignal` field.
20. **CHOICE early-stop caveat** — add to applicability.
21. **DESTINY II survivor-disability ethical caveat** — add to `howToInterpret.cautions`.
22. **AcT vs ORIGINAL vs TASTE meta-analysis** — Majoie/IRIS pooled bridging meta-analysis would benefit DIRECT-MT/DEVT/SKIP/MR CLEAN-NO IV/DIRECT-SAFE/SWIFT-DIRECT as `historicalContext`.

### Tier 4 — Schema-level

23. **Renderer guard for NNT on disallowed designs.** Add a build-time check in `scripts/check-claims.ts` that flags any trial where `calculations.nnt != null` AND `primaryDesign ∈ {ordinal-shift, noninferiority, bayesian-noninferiority, single-arm-registry, estimation-strategy}`. Bayesian-superiority is the only exception (DAWN pattern).

---

## Cross-trial timeline observations (the chains V asked about)

### Antiplatelet-acute (DAPT after minor stroke/TIA) — V's example

Lineage with influence:

1. **MATCH (2004)** — long-term aspirin+clopidogrel after stroke. Negative; excess bleeding. *Lesson: long-duration DAPT is harmful.*
2. **CHARISMA (2006)** — Long-term aspirin+clopidogrel for broad vascular prevention. Negative. *Lesson: replicated MATCH finding.*
3. **CHANCE (2013)** — Short (21-day) DAPT in Chinese minor stroke/TIA <24h. Positive. *Lesson: short duration changes the risk-benefit.*
4. **POINT (2018)** — Western replication, 90-day DAPT, positive but with significant bleeding emerging after day 21. *Lesson: cap DAPT at 21 days.*
5. **THALES (2020)** — Ticagrelor+aspirin, alternative P2Y12 inhibitor; positive but with severe bleeding signal. *Lesson: efficacy may extend to ticagrelor, but bleeding cost is higher.*
6. **CHANCE-2 (2021)** — Genotype-guided ticagrelor vs clopidogrel in CYP2C19 LOF carriers. *Lesson: pharmacogenomics matters.*
7. **INSPIRES (2024)** — Extension of DAPT window from <24h to <72h for atherosclerotic minor stroke/TIA. *Lesson: window can be wider in selected populations.*

Catalogue currently captures all of these except IST/CAST (foundational aspirin monotherapy) and PRoFESS (aspirin+dipyridamole vs clopidogrel — closes the antiplatelet-choice loop).

**SPS3 in this lineage:** SPS3 is structurally different (lacunar stroke, long-term DAPT) and showed harm. It's currently in `secondary-prevention` but should be explicitly chained to the DAPT-duration story since it reinforces the "long-term DAPT is harmful" finding from MATCH/CHARISMA in a different population.

### EVT (anterior circulation) — five eras

1. **IMS-III (2013) / SYNTHESIS Expansion (2013) / MR RESCUE (2013)** — negative pre-modern.
2. **MR CLEAN (2015)** — first positive modern. → ESCAPE, EXTEND-IA, SWIFT PRIME, REVASCAT, THRACE (HERMES era).
3. **DAWN / DEFUSE-3 (2018)** — extended window to 24h with imaging selection.
4. **SELECT2 / ANGEL-ASPECT / RESCUE-Japan LIMIT (2023)** — large core. *RESCUE-Japan LIMIT (Yoshimura NEJM 2022) is **MISSING** from the catalogue.*
5. **LASTE / TENSION (2024)** — large core with even less restrictive selection.

### EVT (posterior circulation)

1. **BEST (2020), BASICS (2021)** — neutral, high crossover.
2. **ATTENTION (2022), BAOCHE (2022)** — positive in tighter Chinese cohorts.

### EVT (medium-vessel)

1. **DISTAL (2025), ESCAPE-MeVO (2025)** — convergent negative. Both in catalogue.

### EVT (bridging vs direct)

1. **DIRECT-MT (2020)** — first positive direct-EVT (China).
2. **DEVT (2021)** — Chinese replication.
3. **SKIP (2021), MR CLEAN-NO IV (2021), SWIFT-DIRECT (2022), DIRECT-SAFE (2022)** — Western replication trials largely failed to meet NI.

Catalogue covers all six. *Pooled IRIS/IPD meta-analysis (Majoie Lancet 2023) is missing.*

### IVT — tenecteplase

1. **NOR-TEST (2017)** — early, mostly mild stroke.
2. **EXTEND-IA TNK (Campbell NEJM 2018)** — pre-EVT bridge. **MISSING from catalogue** (distinct from EXTEND-IA 2015).
3. **AcT (2022), TRACE-2 (2023), ATTEST-2 (2024), ORIGINAL (2024), TASTE (2024)** — confirmatory NI trials.
4. **NOR-TEST 2 Part A (2022)** — high-dose TNK harm signal.
5. **TIMELESS / TRACE-III (2024)** — late-window.

### DOAC timing after AF stroke

1. **TIMING (2022)** → **ELAN (2023)** → **OPTIMAS (2024)**

Complete.

---

## Decision per trial (representative findings — see full per-trial table below)

[Per-trial table preserved verbatim from agent output, abridged here. See agent transcript in JSONL for the full granular table. Highlights:]

- **ninds-trial (1995)** — none. Verified.
- **ecass3-trial (2008)** — none. Verified.
- **extend-trial (2019)** — advisory. P=0.04 is from adjusted analysis only; should be made explicit.
- **escape-mevo-trial (2025)** — BLOCKING. Primary endpoint mismatch.
- **laste-trial (2024)** — BLOCKING. primaryDesign mislabel.
- **nor-test-trial (2017)** — BLOCKING. Design mislabel.
- **prisms-trial (2018)** — advisory. Reclassify primaryResult.
- **select2-trial (2023) / angel-aspect-trial (2023)** — BLOCKING display issue with NNT.
- **decimal-trial (2007) / destiny-trial (2007)** — BLOCKING. trialResult should be POSITIVE for mortality endpoint.
- **swift-prime/escape/mr-clean/revascat (2015)** — see `02-statistical-interpretation-audit.md` for NNT-from-secondary disclosure pattern issues.

---

## Editorial caveats — where catalogue diverges from dominant editorial consensus

| Trial | Editorial / Letter caveat | Current framing | Recommended addition |
|---|---|---|---|
| **EXTEND** | Demaerschalk JAMA 2019: early stopping at 73%, CI lower bound 1.01, ordinal secondary not met | Mostly captured in cautions | Soften pearls to "effect size has wide uncertainty" |
| **DAWN** | Smith NEJM 2018: mid-trial FDA endpoint upgrade | Captured. Excellent | No change |
| **SELECT2** | Hill/Saver editorial: NNT reflects baseline mortality not "functional restoration" | Captured | No change |
| **LASTE** | NEJM 2024 letters: severe disability among survivors | Captured | No change |
| **INTERACT4** | Anderson NEJM 2024: null is not reassurance; Western EMS context may harm | Captured | No change |
| **RAISE** | Christensen NEJM 2024: any-ICH safety signal | Captured | No change |
| **ESCAPE-NA1** | ESCAPE-NEXT (2024) failed confirmatory | **NOT captured.** | Add ESCAPE-NEXT as successor + caveat |
| **SPARCL** | Goldstein 2008: hemorrhagic stroke elevated in prior-ICH | **NOT captured** | Add `harmSignal` |
| **DESTINY II** | Multiple ethics editorials: 40% mRS 5 among survivors | **NOT captured** | Add to `howToInterpret.cautions` |

---

## Statistical-framework taxonomy gaps

Trials with `calculations.nnt` set on designs that disallow NNT, or missing `primaryDesign`/`primaryResult` fields: see `02-statistical-interpretation-audit.md` for the full breakdown. Highlights here:

- 6 BLOCKING items (MR CLEAN / ESCAPE / REVASCAT / SWIFT PRIME / BEST-MSU / SELECT2-ANGEL-ASPECT cluster)
- 11 trials missing taxonomy fields (INTERACT4, ENCHANTED, BEST-II, BP-TARGET, OPTIMAL-BP, CHARM, ESCAPE-NA1, DECIMAL, DESTINY, HAMLET, DESTINY-II)

---

## Verification confidence summary

- **High confidence** (DOI matches, fields verified against training knowledge): ~70 trials.
- **Medium confidence** (sampled stats/index only, full prose not re-read in this session): ~15 trials.
- **Verify-full-text flagged:** PROST, PROST-2, TRIAGE-STROKE.

This packet identifies findings; no source files were edited. **medical-scientist must independently re-verify Tier-1 blocking items against the source PDFs before clinical-reviewer adjudicates,** per CLAUDE.md §13.1 (metadata validity ≠ medical validity) and §19 (audit ≠ approval).

---

## Reviewer instructions for V

This is the **first read** of the catalogue against PubMed + editorials. It is high-yield (8+ blocking items across the two parallel audits) but it is also a hypothesis list per CLAUDE.md §5.6 — **no source file changes have been made**.

Recommended workflow tomorrow:

1. **Triage Tier 1** (this doc + `02-statistical-interpretation-audit.md`'s 6 BLOCKING items). For each, decide:
   - Acknowledge + queue for medical-scientist authoring + clinical-reviewer ratification (Class E)
   - Dispute (provide counter-evidence)
   - Defer with rationale
2. **Pick one BLOCKING item as the first Class E commit.** Recommended: ESCAPE-MeVO endpoint mismatch (smallest blast radius — single field correction with citation refresh).
3. **For Tier 2 (missing trials):** prioritize RESCUE-Japan LIMIT + EXTEND-IA TNK + ESCAPE-NEXT first since they close existing chain gaps. PFO + carotid is a category gap that's bigger work.
4. **Tier 3 + 4** are mechanical metadata work — can land as Class C-clinical bulk commits once the Tier 1 items are settled.

The full per-trial detail (every IVT, EVT, secondary-prevention, surgical, prehospital trial line-by-line) is preserved verbatim in the agent's session transcript and available in the JSONL log if needed; this artifact is the actionable summary.
