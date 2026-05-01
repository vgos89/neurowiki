# Clinical review — W7.0 Sub-batch 1: Basilar Chain (BEST + BASICS)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-28

## Scope

- **Trials reviewed:** BEST, BASICS
- **Claims touched:** `best-outcomes`, `best-design`, `best-bottom-line`, `basics-outcomes`, `basics-design`, `basics-bottom-line`
- **Citations affected:**
  - Liu et al., Lancet Neurol 2020 (doi: 10.1016/S1474-4422(19)30395-3) — BEST
  - Langezaal et al., NEJM 2021 (doi: 10.1056/NEJMoa2030297) — BASICS
- **Surfaces changed (per §13.3):** Structured data fields in `src/data/trialData.ts` (`primaryOutcomeProse`, `trialDesignNarrative`, `safetyBrief`, `bottomLineSummary`, `questionLede`); JSX stub branches in `src/pages/trials/TrialPageNew.tsx` (2 new id-gated branches)
- **Governance note:** ADR-005 Option C hybrid — `CLAIM_REGISTRY` is an empty stub pre-W5.2. Inline `/* claimId: id | source: citation */` comment tagging used throughout; not scanned by `check-claims.ts` (which detects object-key syntax only). Pre-commit hook passes per established canary-batch precedent. Clinical review operates on semantic validity using reviewer knowledge of published papers.

## Semantic validity

### BEST

1. **trialResult: NEUTRAL** — PASS. Confirmed correct. ITT primary endpoint (mRS 0-3 at 90 days) non-significant (OR 1.74, CI 0.81–3.74, P=0.23). Trial terminated early at 131/240 planned patients with 22/65 medical-arm crossovers. High crossover + early termination made the ITT analysis inconclusive rather than falsifying a directional hypothesis. Per-protocol OR 2.90 (CI 1.20–7.03, P=0.016) was nominally significant, further supporting inconclusive rather than negative classification. Mirrors MR RESCUE precedent from canary batch: uninformative result → NEUTRAL, not NEGATIVE.
2. **primaryOutcomeProse numerics** — PASS. N=131 ✓; planned 240 ✓; 42% vs 32% ✓; OR 1.74 ✓; 95% CI 0.81 to 3.74 ✓; P=0.23 ✓; 22 crossovers ✓; per-protocol OR 2.90 (CI 1.20–7.03, P=0.016) ✓. No directional overclaim. Early termination and crossover framing accurate.
3. **trialDesignNarrative** — PASS. 28 Chinese centers ✓; CTA-confirmed ✓; 8-hour window ✓; crossover mechanism (reluctance to randomize to medical arm for high-mortality condition) accurately described. No overstatement.
4. **safetyBrief** — PASS with minor note. sICH approximately 14% EVT vs approximately 3% medical; 90-day mortality approximately 32% EVT vs 35% medical non-significant. Use of "approximately" is acceptable for stub-level content; exact values should be populated at W5.2 from Table 2 of Liu 2020.
5. **bottomLineSummary** — PASS. All numerics match. No prohibited language. No em dashes.
6. **Prohibited language scan** — PASS. No "equivalent," "as effective as," "non-inferior to" misuse.

### BASICS

7. **trialResult: NEUTRAL** — PASS. Confirmed correct. Primary endpoint RR 1.18 (CI 0.92–1.50, P=0.19) not significant. Upper CI bound 1.50 did not exclude a clinically meaningful 50% relative increase in favorable outcome — the trial was underpowered to falsify a directional hypothesis. ATTENTION and BAOCHE (NEJM 2022) subsequently validated the treatment effect BASICS could not detect. Underpowered inconclusive → NEUTRAL.
8. **primaryOutcomeProse numerics** — PASS. N=300 ✓; 44.2% (68/154) EVT vs 37.7% (55/146) medical ✓; RR 1.18 ✓; 95% CI 0.92 to 1.50 ✓; P=0.19 ✓; mortality 38.0% vs 43.2% ✓. CI upper bound framing ("not ruled out 50% relative increase") accurately preserved.
9. **trialDesignNarrative** — PASS. 11-country multinational ✓; CTA or MRA confirmed ✓; 6-hour window ✓; ~40% medical arm received alteplase ✓; underpowered to detect 10-pp difference caveat accurately included.
10. **safetyBrief** — PASS. sICH 4.5% EVT vs 0.7% medical (P=0.07) ✓; mortality 38.0% vs 43.2% non-significant ✓.
11. **bottomLineSummary** — PASS. All numerics match. No prohibited language. No em dashes.
12. **Prohibited language scan** — PASS.

### Amber banner check

13. **successorTrialClause accuracy** — PASS. "for the modern successor trial that established endovascular thrombectomy for basilar artery occlusion" is historically accurate for both BEST and BASICS. ATTENTION (Li et al., NEJM 2022) established EVT benefit in basilar occlusion with a positive primary endpoint. ✓
14. **successorTrialDisplay** — PASS. "ATTENTION (2022)" correctly identifies the successor trial. ✓

### Stub scope compliance

15. **No howToInterpret, no bedsidePearl, no howToReadChart** in either data entry — PASS per §7c.3.
16. **No subgroup analyses, no RCTChainSection** — PASS.

## Citation accuracy

- **BEST (Liu Lancet Neurol 2020, doi: 10.1016/S1474-4422(19)30395-3):** N=131 ✓; planned 240 ✓; terminated early ✓; 28 centers China ✓; mRS 0-3 42% vs 32% ✓; OR 1.74 (0.81–3.74) ✓; P=0.23 ✓; per-protocol OR 2.90 (1.20–7.03, P=0.016) ✓; 22/65 medical-arm crossovers ✓.
- **BASICS (Langezaal NEJM 2021, doi: 10.1056/NEJMoa2030297):** N=300 ✓; 11 countries ✓; mRS 0-3 44.2% vs 37.7% ✓; RR 1.18 (0.92–1.50) ✓; P=0.19 ✓; ~40% alteplase in medical arm ✓; sICH 4.5% vs 0.7% (P=0.07) ✓; mortality 38.0% vs 43.2% ✓.

## Freshness

Both are recent landmark trials (2020, 2021). Per §13.7: 36-month default review window for landmark trials. Citations newly created — within window. `last_reviewed` to be populated when W5.2 citation registry lands.

## Classification judgment

**BEST NEUTRAL vs NEGATIVE:** NEUTRAL confirmed. ITT non-significant result in the context of 34% crossover contamination (22/65 medical-arm patients) and early termination at 55% of planned enrollment constitutes an inconclusive result — not a falsified directional hypothesis. The per-protocol signal (OR 2.90, P=0.016) further supports inconclusive rather than negative. This mirrors the MR RESCUE canary precedent.

**BASICS NEUTRAL vs NEGATIVE:** NEUTRAL confirmed. CI 0.92–1.50 with upper bound excluding neither null nor 50% relative benefit in an underpowered trial is inconclusive. ATTENTION/BAOCHE retrospective validation of the treatment effect further confirms the trial could not detect rather than disproved the benefit.

## Rationale

All 16 enumerated checks pass. Both stubs are classification-accurate, numerically correct per published papers, and appropriately scoped per §7c. The NEUTRAL classification for both trials is the substantive judgment call of this review and is confirmed correct on the same grounds as MR RESCUE in the canary batch: inconclusive evidence from underpowered or contaminated trials is NEUTRAL, not NEGATIVE. The safetyBrief "approximately" language for BEST is acceptable at stub granularity; exact values should be tightened at W5.2.

## Required follow-ups

- When W5.2 lands, populate `last_reviewed` for `best-outcomes`, `best-design`, `best-bottom-line`, `basics-outcomes`, `basics-design`, `basics-bottom-line`. Register citations in `src/lib/citations/registry.ts`.
- Per §13.7: both are landmark trials — apply 36-month default review window.
- At W5.2, tighten BEST safetyBrief "approximately" placeholders to exact values from Liu 2020 Table 2.
