# Clinical review — W7.0 sub-batch 2 (antiplatelet predecessors: MATCH, CHARISMA)

**Decision:** approve (conditions resolved before artifact commit — see §Condition resolution)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-28

## Scope

- **Trials reviewed:** MATCH, CHARISMA
- **Claims touched:** `match-outcomes`, `match-design`, `match-bottom-line`, `charisma-outcomes`, `charisma-design`, `charisma-bottom-line`
- **Citations affected:**
  - Diener et al., Lancet 2004 (doi: 10.1016/S0140-6736(04)16721-4) — MATCH
  - Bhatt et al., NEJM 2006 (doi: 10.1056/NEJMoa060989) — CHARISMA
  - Johnston et al., NEJM 2018 — POINT (successor)
- **Surfaces changed (per §13.3):** Structured data fields in `src/data/trialData.ts` (`primaryOutcomeProse`, `trialDesignNarrative`, `safetyBrief`, `bottomLineSummary`, `questionLede`); JSX stub branches in `src/pages/trials/TrialPageNew.tsx` (2 new id-gated branches)
- **Governance note:** ADR-005 Option C hybrid — `CLAIM_REGISTRY` is an empty stub pre-W5.2. Inline `/* claimId: id | source: citation */` comment tagging used throughout; not scanned by `check-claims.ts` (which detects object-key syntax only). Pre-commit hook passes per established canary-batch precedent. Clinical review operates on semantic validity using reviewer knowledge of published papers.

## Semantic validity

### MATCH

1. **trialResult: NEGATIVE** — PASS. MATCH tested a directional superiority hypothesis (DAPT vs clopidogrel monotherapy on the composite); primary endpoint not met (P=0.244, CI 0.84–1.05 crosses 1); clear harm signal (life-threatening bleeding nearly doubled). Adequately powered (N=7,599); no crossover or power argument for inconclusive. NEGATIVE is correct.
2. **primaryOutcomeProse numerics** — PASS. N=7,599 ✓; 15.7% vs 16.7% ✓; RR 0.94 ✓; 95% CI 0.84 to 1.05 ✓; P=0.244 ✓; life-threatening bleeding 2.6% vs 1.3% ✓. No directional overclaim.
3. **Comparator framing** — PASS. "Clopidogrel monotherapy, not aspirin monotherapy" explicitly preserved — a load-bearing accuracy point that many secondary sources mis-frame.
4. **trialDesignNarrative** — PASS. 3-month qualifying event window ✓; clopidogrel monotherapy comparator accurately distinguished from CHARISMA ✓; 18-month duration ✓.
5. **safetyBrief** — PASS. Life-threatening bleeding 2.6% vs 1.3% (absolute difference 1.3%) ✓; major bleeding similarly doubled ✓; intracranial hemorrhage numerically higher ✓.
6. **bottomLineSummary** — PASS after condition resolution. Em dashes and double-hyphens removed; text finalized as: "POINT (2018) subsequently showed short-duration DAPT (21 days) is beneficial; duration is the key variable."
7. **Prohibited language scan** — PASS. No "equivalent," "non-inferior," "as effective as." "No significant reduction" and harm signal correctly characterized without equivalence framing.

### CHARISMA

8. **trialResult: NEGATIVE** — PASS. Superiority hypothesis (clopidogrel + aspirin vs aspirin alone); not met (P=0.22, CI 0.83–1.05 crosses 1); clear bleeding excess; adequately powered (N=15,603, median 28-month follow-up). NEGATIVE is correct. Pre-specified symptomatic subgroup signal does not convert overall trial to POSITIVE.
9. **primaryOutcomeProse numerics** — PASS. N=15,603 ✓; 6.8% vs 7.3% ✓; RR 0.93 ✓; 95% CI 0.83 to 1.05 ✓; P=0.22 ✓; symptomatic subgroup RR 0.88 (CI 0.77–0.99) ✓; asymptomatic subgroup RR 1.20 (CI 0.91–1.59) ✓.
10. **Subgroup reporting within stub scope** — PASS after condition resolution. Pre-specified subgroup numbers embedded in `primaryOutcomeProse` (not a dedicated subgroup section, which §7c prohibits). CHARISMA cannot be honestly summarized without the symptomatic-vs-asymptomatic split; inclusion is defensible. Language softened from "showed a modest benefit" to "showed a nominally favorable signal... interpreted as hypothesis-generating" — prevents reading the pre-specified subgroup result as a clinical endorsement.
11. **trialDesignNarrative** — PASS after condition resolution. Double-hyphen `--` removed: "median 28-month follow-up, far longer than the short-duration DAPT studied in CHANCE (2013) and POINT (2018)." 768 centers / 45 countries ✓; duration contrast with short-term trials accurately preserved.
12. **safetyBrief** — PASS. Moderate bleeding 2.1% vs 1.3% (P<0.001) ✓; severe bleeding similar ✓; no significant fatal bleeding difference ✓.
13. **bottomLineSummary** — PASS after condition resolution. Em dash "P=0.22) — not significant overall" → "P=0.22), not significant overall." Symptomatic subgroup: "nominally favorable signal (RR 0.88, hypothesis-generating)." All numerics match.
14. **Prohibited language scan** — PASS. No "equivalent," "non-inferior," "as effective as."

### Cross-trial: successor mapping to POINT

15. **MATCH → POINT defensibility** — PASS. MATCH's lesson (long-duration DAPT causes net harm) directly set up POINT's question (does short-duration DAPT in the early high-risk window work?). Duration contrast is the key learning. `chainContext` "short-duration dual antiplatelet therapy after minor stroke or high-risk TIA" fits MATCH cleanly.
16. **CHARISMA → POINT scope** — PASS after condition resolution. CHARISMA's primary population was broader CV prevention (only ~26% cerebrovascular); POINT addressed the cerebrovascular subset in the early window. `successorTrialClause` updated to: "for the modern successor trial that defined the appropriate short-duration window for DAPT in the cerebrovascular subset of patients CHARISMA studied" — accurately preserves scope without implying POINT is the direct successor to CHARISMA's full CV-prevention question.

### Amber banner check

17. **successorTrialDisplay** — PASS. "POINT (2018)" correctly identifies the successor for both stubs. POINT (Johnston et al., NEJM 2018) positive for ischemic composite in high-risk TIA/minor stroke. ✓

### Stub scope compliance

18. **No howToInterpret, no bedsidePearl, no howToReadChart** in either entry — PASS per §7c.3.
19. **No dedicated subgroup section, no RCTChainSection** — PASS.

## Citation accuracy

- **MATCH (Diener Lancet 2004, doi: 10.1016/S0140-6736(04)16721-4):** N=7,599 ✓; composite 15.7% vs 16.7% ✓; RR 0.94 (CI 0.84–1.05) ✓; P=0.244 ✓; life-threatening bleeding 2.6% vs 1.3% ✓; 18-month duration ✓; 3-month qualifying event window ✓.
- **CHARISMA (Bhatt NEJM 2006, doi: 10.1056/NEJMoa060989):** N=15,603 ✓; 6.8% vs 7.3% ✓; RR 0.93 (CI 0.83–1.05) ✓; P=0.22 ✓; symptomatic subgroup RR 0.88 (CI 0.77–0.99) ✓; asymptomatic subgroup RR 1.20 (CI 0.91–1.59) ✓; moderate bleeding 2.1% vs 1.3% (P<0.001) ✓; 768 centers, 45 countries, median 28-month follow-up ✓.

## Freshness

Both are landmark trials (MATCH 2004, CHARISMA 2006). Per §13.7: 36-month default review window for landmark trials. Citations newly created — within window. `last_reviewed` to be populated when W5.2 citation registry lands.

## Condition resolution

Three conditions were raised; all resolved before artifact commit:

1. **CHARISMA successorTrialClause scoping** — Updated to "for the modern successor trial that defined the appropriate short-duration window for DAPT in the cerebrovascular subset of patients CHARISMA studied." Resolves the imprecision of implying POINT is the full successor to CHARISMA's broad CV-prevention question.
2. **CHARISMA symptomatic subgroup language** — "showed a modest benefit" changed to "showed a nominally favorable signal... interpreted as hypothesis-generating" in both `primaryOutcomeProse` and `bottomLineSummary`. Prevents subgroup result from reading as a clinical endorsement.
3. **Double-hyphens and em dashes** — Removed from all clinical prose fields (MATCH `trialDesignNarrative`, MATCH `bottomLineSummary`, CHARISMA `trialDesignNarrative`, CHARISMA `bottomLineSummary`). All instances replaced with commas or semicolons per project style.

Decision upgrades to **approve** at commit.

## Rationale

All 19 enumerated checks pass (12 immediately; 7 after condition resolution). Both stubs are classification-accurate, numerically correct against the published papers, and appropriately scoped per §7c. NEGATIVE classification is confirmed correct for both — directional superiority hypotheses tested and not met in adequately powered trials, with bleeding excess in both cases; neither qualifies as NEUTRAL/inconclusive. The CHARISMA subgroup handling (pre-specified data embedded in primary outcome prose with explicit hypothesis-generating framing) is the substantive judgment call of this review and is confirmed appropriate. The successor mapping chain is historically accurate with the scope caveat addressed. No prohibited language detected.

## Required follow-ups

- When W5.2 lands, populate `last_reviewed` for `match-outcomes`, `match-design`, `match-bottom-line`, `charisma-outcomes`, `charisma-design`, `charisma-bottom-line`. Register Diener 2004, Bhatt 2006, and Johnston 2018 (POINT) in `src/lib/citations/registry.ts`.
- Per §13.7: both are landmark trials — apply 36-month default review window.
- CHARISMA broader CV-prevention successor narrative (THEMIS, COMPASS) is out of scope for this stub but could be added as a `chainContext` enhancement at W5.2+.
