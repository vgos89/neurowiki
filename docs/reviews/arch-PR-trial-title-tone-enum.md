# Architect review — PR #trial-title-tone-enum

**Decision:** approve
**Reviewed:** plan + implementation
**Reviewer:** system-architect (model: claude opus 4)
**Date:** 2026-06-03

## Rationale

This discharges condition #6 of arch-PR-trial-title-heading-extraction.md — the tone-enum cleanup deferred from Phase 2. Phase 2 intentionally passed the *resolved color string* through as a `color` prop to keep that diff mechanical and render-identical; the cost was a leaky abstraction (the component did not own its color vocabulary, and the four-color tuple was re-typed at every call site). This PR closes that gap exactly as the Phase 2 review prescribed: `TrialTitleHeading` now exposes `tone: 'positive' | 'neutral' | 'harm'` and resolves it internally via a single `TONE_COLORS` map (`positive`→`#1746A2` cobalt, `neutral`→`#1e293b` ink, `harm`→`#7f1d1d` maroon). The component owns its color vocabulary; the per-branch `isPositive` / `isHarm` derivation correctly stays at the call site, preserving the same un-lifting principle that kept `categoryBadgeLabel` at the call site in Phase 1.

The conversion is a four-way exact-literal substitution applied by codemod (scripts/codemod-trial-title-tone.mjs), not hand-edited: `color={'#1746A2'}`→`tone="positive"` (79×), `color={'#1e293b'}`→`tone="neutral"` (11×), `color={isPositive ? '#1746A2' : '#1e293b'}`→`tone={isPositive ? 'positive' : 'neutral'}` (12×), `color={isHarm ? '#7f1d1d' : '#1e293b'}`→`tone={isHarm ? 'harm' : 'neutral'}` (3×); 105 total, matching the Phase 2 call-site count. Each tone resolves to the identical hex previously passed inline, so the mapping is provably render-preserving — confirmed by byte-diff of the extracted title-`<h1>` region across all 108 prerendered trial pages (MATCH=108, DIFF=0). The codemod is idempotent (converted sites carry `tone=`, not `color=`) and self-checks for any residual `color=` prop on the component (zero remaining). TypeScript now enforces the tone vocabulary at every call site — an invalid tone is a compile error, which the old free-string `color` prop could not catch.

Boundary integrity holds: the only files touched are the component (which gains the enum + resolver) and its call sites (prop rename). No new module, no new convention, no clinical text in scope. This is strictly less abstraction-debt than before, with no behavioral change.

## Required follow-ups
- None. This was itself the Phase 2 follow-up; the chain is now closed.

## Blocking issues
None.
