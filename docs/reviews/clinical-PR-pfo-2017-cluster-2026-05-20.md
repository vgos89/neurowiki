# Clinical review — PR # PFO closure cluster (CLOSE + RESPECT long-term + REDUCE) (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

Three new trial entries authored together — the 2017 NEJM PFO closure cluster:
- **CLOSE** (Mas JL et al., NEJM 2017;377:1011-1021; DOI 10.1056/NEJMoa1705915; PMID 28902593; NCT00562289)
- **RESPECT long-term** (Saver JL et al., NEJM 2017;377:1022-1032; DOI 10.1056/NEJMoa1610057; PMID 28902590; NCT00465270)
- **REDUCE** (Søndergaard L et al., NEJM 2017;377:1033-1042; DOI 10.1056/NEJMoa1707404; PMID 28902580; NCT00738894)

Surfaces changed:
- `src/data/trialData.ts` — three new entries (`'close-trial'`, `'respect-trial'`, `'reduce-trial'`).
- `src/data/trialListData.ts` — three `manualTrials` registrations under `secondary-prevention`.
- `src/lib/citations/registry.ts` — three new citations.
- `src/lib/citations/claims.ts` — three single-claim mappings on DATA_SURFACE.
- `TASKS.md` — parking-lot entry for a future "PFO closure for cryptogenic stroke" question.
- Three evidence packets in `docs/evidence-packets/`.

## Per-trial primary endpoint summary

**CLOSE** — Population: 16-60y, cryptogenic stroke + PFO with **atrial septal aneurysm OR large shunt (>30 microbubbles)**. PFO closure + antiplatelet vs antiplatelet alone (N=238 vs 235, mean follow-up 5.3y). **Recurrent stroke: 0/238 (0%) vs 14/235 (6.0%), HR 0.03 (0.00-0.26), P<0.001. NNT 20 over 5y.** Atrial fibrillation/flutter 4.6% vs 0.9% (P=0.02), transient periprocedural in 10/11 cases.

**RESPECT long-term** — Population: 18-60y, cryptogenic stroke + TEE-confirmed PFO (no morphology requirement). Amplatzer Occluder vs medical therapy (N=499 vs 481, median 5.9y). **Recurrent ischemic stroke composite: 3.6% vs 5.8%, HR 0.55 (0.31-0.999), P=0.046.** NNT 42 over 5y. Borderline P at group-sequential threshold (0.043) — surfaced in `cautions` and `limitations`. VTE excess (PE HR 3.48).

**REDUCE** — Population: 18-59y, cryptogenic stroke + TEE-confirmed PFO (81% moderate/large shunt). Gore HELEX/Cardioform + antiplatelet vs antiplatelet alone (2:1, N=441 vs 223, median 3.2y, **clean antiplatelet comparator, no anticoagulation permitted**). **Coprimary 1 (clinical stroke): 1.4% vs 5.4%, HR 0.23 (0.09-0.62), P=0.002.** NNT ~28 over 24 months. **Coprimary 2 (new brain infarction at 24 months): 4.7% vs 10.7%, RR 0.44 (0.24-0.81), multiplicity-adjusted P=0.048.** Silent-infarct subcomponent alone did NOT differ (P=0.75) — surfaced in `howToInterpret.doesNotProve`. **Atrial fibrillation/flutter 6.6% vs 0.4% (P<0.001) — largest AF signal of the three trials.** 83% within 45d, 59% resolved in 2 weeks.

## Semantic validity

All three trials taxonomy verified:
- `primaryDesign: 'binary-superiority'` ✓
- `primaryResult: 'met'` ✓ (all three primary endpoints met)
- `trialResult: 'POSITIVE'` ✓
- `listCategory: 'antiplatelets'` — judgment call documented (no exact-match TrialCategoryKey for "PFO closure"; antiplatelet best matches the medical comparator arm)

**Honest framing checks per trial:**
- **CLOSE**: high-risk PFO feature requirement (ASA or large shunt) prominently disclosed in `applicability.populationExclusions` — central generalizability point.
- **RESPECT**: borderline-P caveat (0.046 vs 0.043 group-sequential threshold) surfaced in `howToInterpret.cautions` and `limitations`.
- **REDUCE**: silent-infarct coprimary subcomponent that did NOT differ surfaced in `howToInterpret.doesNotProve` — prevents over-claiming.
- **AF safety signal**: prominent in `harmSignal`, `pearls`, `bedsidePearl`, `safetyData`, `howToInterpret.cautions` on all three entries — the central trade-off.
- **Cryptogenic stroke ONLY**: disclosed in all three `applicability.populationExclusions`.
- **Age caps**: disclosed per trial (CLOSE 16-60, REDUCE 18-59, RESPECT 18-60).

## Editorial / expert context (REQUIRED per commit 479f100)

§8 satisfied identically across all three entries since they share the same 2017 NEJM issue:
- **§8a** Ropper AH, "Tipping Point for Patent Foramen Ovale Closure," NEJM 2017;377:1093-1095 (DOI 10.1056/NEJMe1709637) — quoted per-trial.
- **§8b** Shared cluster critiques (variable high-risk-feature definitions across trials; device heterogeneity; AF detection methodology) plus trial-specific letters documented.
- **§8c** AHA/ASA 2021 Secondary Prevention (Kleindorfer DO et al., Stroke 2021;52:e364-e467) Class IIa Level B-R; AAN 2020 Practice Advisory (Messé SR et al., Neurology 2020;94:876-885); ESO 2019 (Pristipino C et al.); FDA approvals (Amplatzer Oct 2016, Gore Cardioform Mar 2018) cited.
- **§8d** Mir H et al., BMJ 2018;362:k2515 (IPD pooled meta-analysis of 6 RCTs, HR 0.36, AF OR ~4.7); Kent DM et al., PASCAL classification, JAMA 2021;326:2277-2286.

## Citation accuracy

All three citations: `last_reviewed: '2026-05-20'`, `review_window_months: 36`, `quoted_text` verbatim from each NEJM PDF abstract Conclusions.

## Freshness

New entries. First review. Within 36-month landmark-trial window (2017 trials are at the edge but established as guideline foundation).

## Conditions for approval (non-blocking)

1. **`source` field missing in author's initial draft** — required by TrialMetadata interface. Added during gate review (one line per trial citing the NEJM volume/pages). **Fixed during this commit.**

2. **Em-dash policy nuance**: author used em-dashes in long-form scientific narrative (`clinicalContext`, `conclusion`, `educationalContext`) per the CREST-2 template precedent. Short V-facing fields (`bedsidePearl`, `bottomLineSummary`, `legend.finding`, `keyMessage`) are em-dash-free. This is consistent with the prior commits' interpretation of the em-dash policy — it targets V-facing summary surfaces, not all prose. **Acceptable.**

3. **No question hub integration** — no existing "PFO closure for cryptogenic stroke" question in `trial-questions.ts`. Parking-lot follow-up logged in TASKS.md (matches the ANNEXA-I and CREST-2 precedent). A future question hub rebuild should group these three trials.

4. **`chainMembership` deliberately omitted** — Phase 2 timeline work.

## Schema compliance per entry

- `claimId` (single) ✓
- `conclusion` field set ✓
- `source` field set (after gate-time correction) ✓
- `listCategory: 'antiplatelets'` (valid TrialCategoryKey) ✓
- No em-dashes in short V-facing fields ✓
- `harmSignal` populated (AF excess) ✓

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Closes a known major catalog gap (per audit artifact 01 line 30 — "PFO closure trials missing"). These three trials are clinically inseparable — clinicians read them as a body of evidence, the AHA/ASA Class IIa recommendation is based on their joint signal, and the AF safety trade-off applies uniformly. Authoring them in one paired session preserves the clinical coherence and minimizes context-switching cost.

## Required follow-ups

1. **Add "PFO closure for cryptogenic stroke" question** to `trial-questions.ts` — would group these three trials. Class C-clinical-editorial.
2. **Cross-link** in each entry's `historicalContext` could optionally cite the other two as paired trials. Optional polish.
3. **Mir 2018 IPD pooled analysis** is a candidate for its own entry — it's the clinical-action evidence the guidelines cite. Class C-clinical follow-up.

## Blocking issues

None.
