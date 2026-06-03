# Clinical review — PR #trial-header-bar-extraction

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-06-03

## Scope
- Claims touched: none
- Citations affected: none
- Surfaces changed: none (presentational header-bar markup only — back-button label + category badge; no §13.3 clinical claim surface)
- Evidence-verifier packet: not applicable
- Trial-statistician report: not applicable

## Semantic validity
No clinical text changed. This is a mechanical component extraction (batch 1 of 30
sites) replacing a byte-identical inlined sticky header bar with a shared
presentational `<TrialHeaderBar>`. Each removed `<span>ABBR</span>` reappears
verbatim as `abbreviation="ABBR"` in the replacing call — spot-checked WAKE-UP,
ECASS III, NINDS, CHANCE-2, ESCAPE-MeVO, NOR-TEST 2, AcT; all preserve exact
casing, spaces, hyphens, and special characters. The category badge stays
`{categoryBadgeLabel}` in both the removed markup and the component, with the
derivation left at each call site (not lifted), per architect condition #3.
The new component reproduces the original markup byte-for-byte (same classes,
same inline span style, ArrowLeft aria-hidden); only the abbreviation literal and
back handler are parameterized. No titles, subtitles, sources, p-values, NNTs, or
eligibility text appear in the diff — `<h1>` and ternary lines are unchanged
context only. Title-heading extraction is correctly deferred to Phase 2.

## Citation accuracy
Not applicable — no citation-backed claim is touched by this PR. No claim-tagged
surface (`data-claim`, `claimId`, `claim()`) appears in the diff or in the new
component. The abbreviation is a presentational trial short-name label, not a
clinical claim.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
Not applicable — no citations touched; no `last_reviewed` field is affected.

## Rationale
The 522-line diff is purely mechanical: 30 verbatim header-bar blocks removed, 30
equivalent component calls plus one import added. All trialMetadata-derived
clinical content (titles, subtitles, sources, statistics, eligibility) is
untouched. No never-drift category is implicated because no clinical claim text
exists on this surface. None of the eight mandatory-block conditions apply. The
refactor preserves rendered output byte-for-byte. Approved.

## Required follow-ups
- Batches 2+ (remaining ~73 header sites) require the same clinical pass before merge. Because the transformation is identical and codemod-driven, this artifact's reasoning extends to them provided the per-batch render byte-diff stays clean.
- Phase 2 (TrialTitleHeading / tone-prop extraction) touches the title `<h1>`, which sits closer to trialMetadata; route it through this gate as its own PR with byte-diff verification.
