# Clinical review — PR # 2015 EVT cluster NNT-from-secondary disclosure tightening (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

Editorial polish across four 2015 EVT trial entries to add explicit "secondary mRS 0-2 outcome" labeling everywhere NNT is mentioned in prose. The protocol-defined primaries of all four trials were ordinal mRS shift (common-OR designs); the NNT values displayed are derived from the secondary dichotomized mRS 0-2 outcome.

Trials touched (existing entries, prose updates only):
- **MR CLEAN** (Berkhemer NEJM 2015): `bedsidePearl` + `legend.keyStat`
- **ESCAPE** (Goyal NEJM 2015): `legend.keyStat` (bedsidePearl already avoided NNT framing — referenced mortality reduction without claiming NNT)
- **REVASCAT** (Jovin NEJM 2015): `bedsidePearl` (no `legend.keyStat` set on this entry)
- **SWIFT PRIME** (Saver NEJM 2015): `howToReadChart` Q&A + `bedsidePearl` (no `legend.keyStat` set on this entry)

## Resolves Tier 1 #7 from the audit

Per `docs/research/2026-05-19-trial-audit/02-statistical-interpretation-audit.md`:

> "MR CLEAN, ESCAPE, REVASCAT, SWIFT PRIME — primaryDesign is `ordinal-shift`. Primary endpoint = ordinal shift across mRS 0-6. NNT is computed from the SECONDARY dichotomized mRS 0-2 (DEFUSE-3, SELECT-2, ANGEL-ASPECT carry an explicit 'NNT from SECONDARY mRS 0-2' disclosure in cautions, bedsidePearl, pearls, and applicability — these four do not."

This commit applies the DEFUSE-3-pattern disclosure (explicit secondary-outcome labeling on every NNT mention) to the four 2015 trials. The structural `calculations.nnt` field remains unset on all four entries — the build-time NNT validity guard (commit `7956087`) does not need to fire here because there was no structural-field violation; the issue was prose-level labeling.

## Semantic validity

All edits are **disclosure additions**, not new claims:
- No NNT values were changed.
- No clinical interpretation was modified.
- The catalogue's existing pearls / howToInterpret / bottomLineSummary on each entry already cited the trials' ordinal-shift primary; the prose was just under-labeled at the NNT-display surfaces.

**Specific changes per entry:**

**MR CLEAN:**
- `bedsidePearl`: appended "derived from the secondary mRS 0-2 outcome; the protocol-defined primary was the ordinal mRS shift" to the "NNT about 7" mention.
- `legend.keyStat`: changed "NNT 7" → "NNT 7 (mRS 0–2 secondary)".

**ESCAPE:**
- `legend.keyStat`: changed "NNT 4.2" → "NNT 4.2 (mRS 0–2 secondary)".
- `bedsidePearl`: unchanged (already framed mortality reduction without claiming NNT).

**REVASCAT:**
- `bedsidePearl`: appended "derived from the secondary mRS 0-2 outcome; the protocol-defined primary was the ordinal mRS shift" to the "NNT about 7" mention.

**SWIFT PRIME:**
- `howToReadChart` Q&A: rewrote to make the secondary-outcome derivation explicit and to clarify that the ordinal shift was the protocol-defined primary.
- `bedsidePearl`: changed "NNT of 4" → "NNT of 4 from the secondary mRS 0-2 outcome".

## Per the trial-statistics skill

The "Option Y" rule in `.claude/skills/trial-statistics/SKILL.md` states that ordinal-shift primaries do not yield a valid NNT. The clinically-cited NNT values in the field for these trials come from the secondary mRS 0-2 dichotomization — clinically interpretable and routinely quoted in guidelines (AHA/ASA 2018-onward). The catalog continues to display these NNT values because they are clinically actionable, but with explicit labeling that distinguishes them from the protocol-defined primary frame. This matches the DEFUSE-3 / SELECT2 / ANGEL-ASPECT disclosure precedent already in the catalog.

## Citation accuracy

No citations touched.

## Freshness

No `last_reviewed` refresh needed — no clinical claim asserted that wasn't already in the catalog.

## Editorial / expert context (REQUIRED per commit 479f100)

This is a Class C-clinical editorial cleanup on existing entries — disclosure labeling only, no clinical interpretation change. Per the §8 rule's spirit, the requirement applies to new-trial-entry PRs and Class E re-reviews with new clinical claims; pure disclosure tightening is documented here but does not require fresh §8 fills (the underlying trials' editorial context is unchanged from the original entries).

Documented for traceability rather than fetching landmark-trial editorials that don't affect the label changes.

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Closes Tier 1 #7. The four 2015 trials now match the DEFUSE-3 disclosure pattern: clinicians see the NNT (because it's clinically useful) AND see the explicit derivation note (because the protocol-defined primary was ordinal shift, not the NNT denominator).

## Required follow-ups

None blocking. THRACE (2016) has a similar pattern ("NNT 9") that could benefit from the same disclosure — flag for a future polish pass.

## Blocking issues

None.
