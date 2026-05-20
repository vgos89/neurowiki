# Clinical review — PR # LASTE primaryDesign correction (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none textually — metadata-only correction to `primaryDesign` field
- **Surfaces changed:** `src/data/trialData.ts` LASTE entry (~line 2444)
- **Evidence trace:** Costalat et al., NEJM 2024. Per the overnight accuracy audit (`docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md`): "Published primary endpoint is the mRS distribution at 90 days analyzed as an ordinal shift (generalized OR 1.63, 95% CI 1.29–2.06). Catalogue even stores `ordinalStats: { commonOR: 1.63, ciLow: 1.29, ciHigh: 2.06 }`." Internal consistency confirmed — the catalog's `stats.primaryEndpoint.value` was already `'mRS Shift'` and `effectSize.value` was already `'OR 1.63'`.

## Semantic validity

The catalog stored `primaryDesign: 'binary-superiority'` while every other field of the same trial entry was consistent with an ordinal-shift design (primaryEndpoint = "mRS Shift", effectSize = "OR 1.63", ordinalStats populated with cOR). The fix brings the design tag into alignment with what the catalog's own data already represented and what the published primary endpoint is.

No textual claims, no patient-impacting numbers, no clinical interpretation drifts. The trial's verdict (POSITIVE, primaryResult: met) is preserved.

The change has a downstream effect when the upcoming `scripts/check-claims.ts` NNT guard lands (Tier 3 #18): LASTE will then be tagged as an ordinal-shift design, and any future PR that attempts to set `calculations.nnt` on LASTE will be blocked at build time. This is the intended behavior.

## Citation accuracy

Costalat et al., NEJM 2024. Citation already present in catalog `source` field. Re-verification against publication: out of scope for this metadata fix (the design type, not the citation, is what's being corrected). The audit cited the published primary endpoint verbatim.

## Freshness

Within the 36-month landmark-trial re-review window per §13.7.

## Rationale

Single-field metadata correction. No prose drift. Brings the trial entry's design tag into alignment with its own stored ordinalStats and primary endpoint label. Closes one of the 6 BLOCKING items from the overnight audit.

## Required follow-ups

None blocking. Note recommended for next session: when Tier 3 #18 (build-time NNT guard) lands, run it against the full catalog to confirm LASTE has no NNT set anywhere (audit indicates none, but the guard will confirm).

## Blocking issues

None.
