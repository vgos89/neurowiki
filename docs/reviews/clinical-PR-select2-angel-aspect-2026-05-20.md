# Clinical review — PR # SELECT2 + ANGEL-ASPECT NNT field nulling (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Trials touched:** SELECT2, ANGEL-ASPECT (parallel large-core ordinal-shift EVT trials)
- **Field changed in each:** `calculations.nnt` (numeric) and `calculations.nntExplanation` (prose) → both nulled / removed
- **Surfaces changed:** `src/data/trialData.ts` two entries
- **What did NOT change:** the secondary-NNT disclosure prose in pearls, cautions, bedsidePearl, bottomLineSummary, applicability.populationExclusions — all of which already correctly label NNT as derived from the secondary mRS 0-2 outcome with explicit ordinal-shift caveat

## Evidence trace

- **SELECT2** — Sarraj et al. NEJM 2023;388(14):1259–1271. Primary design: ordinal mRS shift at 90 days, gOR 1.51 (95% CI 1.20–1.89). The 20% vs 7% mRS 0-2 secondary outcome yields ARR 13% → NNT 7.7.
- **ANGEL-ASPECT** — Huo et al. NEJM 2023. Primary design: ordinal mRS shift, gOR 1.37 (P=0.004). The 30% vs 11.6% mRS 0-2 secondary outcome yields ARR 18.4% → NNT 5.4.

Per the trial-statistics skill (`.claude/skills/trial-statistics/`) "Option Y" rule and the trial-statistician's audit (`docs/research/2026-05-19-trial-audit/02-statistical-interpretation-audit.md`):

> "Per `clinical-trial-audit` skill **NNT validity rules**, NNT for ordinal-shift designs is **not allowed**. The catalogue does flag this clearly in pearls and `applicability.populationExclusions`, but the numeric field `calculations.nnt = 7.7` still renders. Risk: a clinician sees 'NNT 7.7' without context."

## Semantic validity

The numeric NNT field is removed. The prose disclosure remains. A reader on the trial detail page sees:

> "NNT 7.7 is from the SECONDARY mRS 0–2 outcome. The ordinal-shift primary does not yield a valid NNT per clinical-trial-audit." (pearls + cautions + bedsidePearl + bottomLineSummary)

This is the canonical disclosure pattern already used by DEFUSE-3 with explicit secondary-outcome labeling. SELECT2 and ANGEL-ASPECT now match DEFUSE-3's full pattern: prose discloses + numeric field is null.

The decision to null the numeric (rather than add a renderer-level guard that surfaces NNT-with-secondary-label) is the safer fix: it eliminates any quick-scan summary chip risk regardless of which renderer surface displays the trial. The build-time NNT guard (Tier 3 #18) when it lands will then enforce this rule at the codebase level, preventing the field from being re-added without scrutiny.

The clinical interpretation of both trials (POSITIVE on ordinal mRS shift in large-core LVO; ~80% of patients still moderately-to-severely disabled at 90 days; AHA/ASA 2026 COR 1) is fully preserved.

## Citation accuracy

Sarraj et al. NEJM 2023;388(14):1259–1271 — verified
Huo et al. NEJM 2023 — verified

## Freshness

Both within the 36-month landmark-trial re-review window per §13.7.

## Rationale

Removes the only remaining display surface where a clinician could read "NNT 7.7" or "NNT 5.4" as if it were a primary-endpoint outcome from these ordinal-shift trials. The same numbers remain visible in prose with explicit secondary-outcome labeling — clinical context preserved, statistical-framework integrity restored.

## Required follow-ups

- **Tier 3 #18 build-time NNT guard** in `scripts/check-claims.ts` is the structural lock that prevents this regression class. Recommended next commit after this and after Tier 1 #7 (2015 EVT cluster) + #8 (BEST-MSU) land — otherwise the guard would fail on those existing entries.
- DAWN's `calculations.nnt: 2.8` is intentionally preserved because DAWN is `bayesian-superiority` not `ordinal-shift`; the trial-statistics skill explicitly notes DAWN as the canonical exception. No change needed.
- ENRICH's `calculations.nnt: 12` is preserved because it derives from the bayesian-superiority safety endpoint, with explicit prose disclosure. No change needed.
- DEFUSE-3's `calculations.nnt: 3.6` is the reference disclosure pattern; the numeric is preserved because the trial explicitly has a coprimary mRS 0-2 binary endpoint. SELECT2 and ANGEL-ASPECT do not — hence the differential treatment.

## Blocking issues

None.
