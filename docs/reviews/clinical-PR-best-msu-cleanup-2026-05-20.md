# Clinical review — PR # BEST-MSU primaryDesign/primaryResult fill + grandfather cleanup (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none — taxonomy-only metadata fill on an existing trial entry.
- **Files changed:**
  - `src/data/trialData.ts` — BEST-MSU entry now has `primaryDesign: 'binary-superiority'` + `primaryResult: 'met'`.
  - `scripts/check-claims.ts` — BEST-MSU removed from `NNT_GRANDFATHERED` set; the trial no longer needs a workaround because the typed primaryDesign field places it in the allowed-NNT path naturally.

## Evidence trace

Grotta JC et al. **Prospective, Multicenter, Controlled Trial of Mobile Stroke Units.** NEJM 2021;385(11):971-981. DOI 10.1056/NEJMoa2103879. ClinicalTrials.gov NCT02190500.

PDF read on 2026-05-20 (V supplied PDF — full text available, not abstract-only).

**Primary endpoint (verbatim from Methods §Outcomes):**
> "The primary outcome was the score on the utility-weighted modified Rankin scale at 90 days in patients who were adjudicated to be eligible to receive t-PA on the basis of subsequent blinded review."

**Main analysis (verbatim):**
> "The main analysis involved dichotomized scores on the utility-weighted modified Rankin scale (≥0.91 or <0.91, approximating scores on the modified Rankin scale of ≤1 or >1) in patients eligible for t-PA."

**Result (Abstract / Results §):**
- Mean UW-mRS 0.73 (MSU) vs 0.67 (EMS).
- aOR for UW-mRS ≥0.91: **2.12 (95% CI 1.54–2.93), P<0.001** without IPW; aOR 2.14 (1.55–2.95), P<0.001 with inverse-probability weighting.
- mRS 0-1 at 90 days: 53.5% (MSU) vs 45.5% (EMS).
- Mortality at 90 days: 8.9% vs 11.9%.

## Semantic validity

The original audit (`docs/research/2026-05-19-trial-audit/02-statistical-interpretation-audit.md`) recorded BEST-MSU as ordinal-shift design and recommended NNT suppression. **The PDF refutes the audit's design call** — the primary is a binary dichotomization of the utility-weighted mRS at threshold ≥0.91 (approximates mRS 0-1 vs >1). This is a binary-superiority design, the NNT 12.5 derived from the 8% ARR on mRS 0-1 (53.5% vs 45.5%) is valid for the dichotomized primary.

Updates applied:
- `primaryDesign: 'binary-superiority'` — matches the published analysis (dichotomized primary, aOR framework).
- `primaryResult: 'met'` — aOR 2.12, P<0.001.
- `calculations.nnt: 12.5` retained as authored — clinically defensible for the dichotomized primary.

The remaining design caveats (alternating-week cluster allocation rather than patient-level randomization; observational comparison adjudicated for t-PA-eligibility post hoc) are already documented in `trialDesign.type[]` and `applicability.populationExclusions`. No prose changes needed.

## Editorial / expert context

§8 status: this is a **metadata-only cleanup on an existing entry** with no clinical interpretation change. The original BEST-MSU entry's pearls / bedsidePearl / howToInterpret prose is unchanged and already carries the appropriate editorial framing (MSU as a workflow innovation, not a new drug, with the alternating-week cluster as the key methodological caveat). No new claims are being made. Per the spirit of the editorial-context hard requirement (commit 479f100), §8 applies to clinical interpretation changes and new-trial entries, not to pure taxonomy fills. Documented here for traceability rather than re-fetching landmark-trial editorials that don't affect the field changes.

## Citation accuracy

No citation entries touched. Source field on the trial entry already cites Grotta JC et al. NEJM 2021.

## Freshness

No `last_reviewed` refresh needed — no clinical claim asserted that wasn't already in the catalog.

## Build-time guard cleanup

`scripts/check-claims.ts` previously listed BEST-MSU in `NNT_GRANDFATHERED` because the audit predicted an ordinal-shift design. With the correct binary-superiority taxonomy now set, the trial passes the NNT guard naturally via the allowed-design path. Removed from the grandfather set with an inline comment explaining the correction.

## Rationale

Resolves Tier 1 #8 from `docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md`. Closes the BEST-MSU portion of the deferred PDF-blocked queue.

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS (NNT guard passes via correct design tag, no grandfather needed)
- `npm run check:chains` → PASS

## Required follow-ups

None.

## Blocking issues

None.
