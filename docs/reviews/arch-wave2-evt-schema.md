# Architect review — Wave 2 EVT trials (data population + `bayesian-superiority` enum addition)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4)
**Date:** 2026-05-08

## Rationale
The change is the right shape and the right size. Adding `bayesian-superiority` to the `primaryDesign` and `secondaryDesign` enums is a faithful extension of the orthogonal-axes model approved in `arch-wave2-schema-redesign.md` — a single trial (DAWN) needed an enum value the original five did not provide, the existing `bayesian-noninferiority` would have been a semantic miscoding, and the addition is a strictly additive union widening with no impact on existing trials. The parallel inclusion in `secondaryDesign` is correct for symmetry.

The 27-trial data population is purely value-additive: every modified trial gets `primaryDesign`, `primaryResult`, and `applicability` populated; no required field is altered; no new field is introduced; no boundary is crossed. Clinical data continues to live in `src/data/trialData.ts`, the citation registry is untouched, and no UI or scoring logic moves.

The design distribution is plausible: DAWN as the lone Bayesian-superiority entry; SWIFT DIRECT et al. as noninferiority; EXTEND-IA carrying both a `binary-superiority` primary and an `ordinal-shift` secondary following the ATTEST-2 precedent from the prior approval. On distinguishability: `bayesian-superiority` and `bayesian-noninferiority` pair with structurally different `primaryResult` values (DAWN: `met`; TASTE: `noninferiority-established`) and will require distinct renderer branches — this is the correct outcome.

The one structural gap: the JSDoc on `primaryDesign` does not mention `bayesian-superiority` in its rendering hints, and the Option Y NNT-suppression rule does not address the new value. `bayesian-superiority` likely *should* show NNT (DAWN had an absolute risk difference of 36pp and a calculable NNT), unlike `bayesian-noninferiority`. That decision belongs in the data-layer documentation now, not in renderer code later. Comment-only fix, hence approve-with-conditions rather than block.

## Required follow-ups
- Update the JSDoc block on `primaryDesign` to: (a) add a rendering hint for `bayesian-superiority` — likely "posterior probability of superiority + risk-difference bars + NNT" (paralleling `binary-superiority`), and (b) state explicitly whether `bayesian-superiority` is included in or excluded from the Option Y NNT-suppression list. The `secondaryDesign` JSDoc inherits the clarification implicitly but a cross-reference is welcome.
- When the trial-card renderer ships, confirm `bayesian-superiority` and `bayesian-noninferiority` route through distinct display branches and not a shared "bayesian" path.
- Route clinical correctness of the 27 trial classifications (especially the noninferiority cluster and the EXTEND-IA dual-primary split) to `clinical-reviewer` per §6. *(Completed in this session — see `clinical-wave2-evt-schema.md`.)*
- Earlier follow-up from `arch-wave2-schema-redesign.md` (note listing ordinal-shift/not-met trials) is now actionable with EVT examples — DISTAL, ESCAPE-MeVO, RESCUE BT — consider folding in when the JSDoc is updated.

## Blocking issues
None.
