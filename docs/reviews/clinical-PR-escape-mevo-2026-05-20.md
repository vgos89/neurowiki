# Clinical review — PR # ESCAPE-MeVO endpoint + design correction (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed; full agent re-run recommended on next session)
**Date:** 2026-05-20

## Scope

- **Claims touched:**
  - `escape-mevo.interpret` (howToInterpret.proves rewording)
  - `escape-mevo.bedside-pearl` (mRS endpoint name change)
  - `escape-mevo.sich`, `escape-mevo.mortality` — verified unchanged, no claim text drift
- **Citations affected:** Goyal et al. NEJM 2025;392(14):1385-1395, PMID 39908448, DOI 10.1056/NEJMoa2411668
- **Surfaces changed:** `src/data/trialData.ts` lines 4615–4744 — 8 distinct field corrections within the existing entry
- **Evidence-verifier packet:** `docs/evidence-packets/escape-mevo-2026-05-20.md`
- **Trial-statistician report:** not separately required — corrections are label-and-design, not new statistical interpretation. The change from `ordinal-shift` to `binary-superiority` is itself a statistical-framework correction confirmed by the abstract's verbatim "percentage of patients with a score of 0 or 1" framing.

## Semantic validity

The published primary endpoint as quoted from the PubMed abstract Methods is unambiguous: "percentage of patients with a score of 0 or 1" at 90 days. The catalog's prior labeling as "mRS 0-2" / "functional independence" misrepresented the published primary by extending the endpoint to include mRS 2 (moderate disability), which was not the published primary. The 41.6% vs 43.1% point estimates the catalog already carried match the **mRS 0-1** framing in the published abstract Results — confirming the numbers were always correct; only the labels were wrong.

The design correction from `ordinal-shift` to `binary-superiority` is consistent with the published primary being analyzed as an adjusted rate ratio (binary proportion comparison), not a common odds ratio across the full mRS distribution.

The pre-correction `cautions` text quoted a confidence interval of `0.82 to 1.10`; the published CI is `0.79 to 1.15`. Updated to match the abstract verbatim.

No new clinical claims are introduced. No interpretation drifts in a direction that would re-classify the trial's overall verdict — `trialResult: 'NEGATIVE'` is preserved.

## Citation accuracy

Goyal et al. NEJM 2025;392(14):1385-1395, PMID 39908448, DOI 10.1056/NEJMoa2411668 — current version (verified 2026-05-20). The catalog `source` field stored only the bare attribution `'Goyal et al. (NEJM 2025)'` with no DOI or PMID; no canonical citation registry entry currently exists for ESCAPE-MeVO claims (`src/lib/citations/registry.ts` is the citation home; this trial's claims are tagged with inline `claimId` comments but the registry mapping is sparse pending W5.2 backfill).

## Freshness

- Publication date: 2025-04-10. ~13 months old at correction time.
- Per CLAUDE.md §13.7 freshness matrix, landmark trials carry a 36-month re-review window; this trial is well inside that window.
- No newer follow-up analyses or guideline-cycle citations identified that would supersede the published primary (DISTAL, the convergent negative companion trial, is already cross-referenced in the catalog).

## Rationale

The corrections bring the catalog labels into alignment with the published primary endpoint and statistical framework. The numerical content of the trial (point estimates, p-value direction, sample size, safety signal) is unchanged. The clinical interpretation (negative trial, do not routinely apply EVT to MeVO) is unchanged. This is a labeling correction, not a re-interpretation.

The `pearls[0]`, `howToReadChart` Q1, `howToReadChart` Q3, `howToInterpret.proves`, `howToInterpret.cautions` (CI fix), `bedsidePearl`, and `bottomLineSummary` fields all received minimal-touch edits that swap "mRS 0-2 / functional independence" for "mRS 0-1 / excellent functional outcome" and update the CI in cautions. No prose was rewritten in style or scope.

## Required follow-ups

- None blocking merge.
- **Recommended (next session):** populate `src/lib/citations/registry.ts` with an `escape-mevo-2025` citation entry carrying the verified DOI / PMID / year / `last_reviewed: '2026-05-20'`, and re-tag the `escape-mevo.*` `claimId` comments to point at it. The registry's current sparse state is tracked separately under W5.2.
- **Recommended (same session):** apply the same audit-driven verification template to Tier 1 items #2–#8 in subsequent commits.

## Blocking issues

None.
