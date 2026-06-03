# Clinical review — PR #trial-title-tone-enum

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-03

## Scope
- Claims touched: none — no claim-tagged surface (data-claim / claimId / claim()) appears in the diff
- Citations affected: none
- Surfaces changed: §13.3 — only the presentational `tone` attribute on `<TrialTitleHeading>` call sites in TrialPageNew.tsx (a clinical-surface file) plus the component's internal color resolver. No title/subtitle text, no clinical prose, no statistics.
- Evidence-verifier packet: not applicable — no trial data, statistics, or new trial entry
- Trial-statistician report: not applicable

## Semantic validity
Confirmed mechanical and render-preserving. The change renames the `color` prop to a semantic `tone` prop whose three values (`positive` / `neutral` / `harm`) resolve, inside the component, to the exact three hex values previously passed inline (`#1746A2` / `#1e293b` / `#7f1d1d`). The trial title and subtitle remain untouched expression bindings (`{trialMetadata.title}`/`{tm.title}` and `.subtitle`) — no string literal is introduced or altered, so no `trialMetadata`-derived clinical text is rewritten. The four conversions are exact-literal and disjoint; the two ternary forms preserve their original `isPositive` / `isHarm` predicates verbatim, only relabeling the branch *outputs* from hex to tone. Because each tone maps back to the identical color, the rendered heading is byte-identical — independently verified by diffing the extracted title-`<h1>` region across all 108 prerendered trial pages (MATCH=108, DIFF=0). The tone label is an internal prop value, never user-visible; a clinician sees the same heading text in the same color as before. No never-drift category is in scope (recommendation strength, action verbs, qualifiers, certainty markers, temporal constraints) because no claim text exists on this surface.

## Citation accuracy
Not applicable — no citations are mapped to the heading surface and none are touched.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
Not applicable — no citations touched; no `last_reviewed` field is read or written.

## Rationale
A presentational prop rename (`color` string → `tone` enum) with an internal color resolver that reproduces the prior colors exactly. No clinical claim, citation, title/subtitle text, or never-drift category is affected, and the 108/108 byte-identical render comparison confirms zero output drift. None of the eight mandatory-block conditions apply. Approve.

## Required follow-ups
- None.
