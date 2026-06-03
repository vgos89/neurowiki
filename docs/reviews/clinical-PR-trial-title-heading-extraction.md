# Clinical review — PR #trial-title-heading-extraction

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-03

## Scope
- Claims touched: none — no claim-tagged surface (data-claim / claimId / claim()) appears in the diff
- Citations affected: none
- Surfaces changed: §13.3 static JSX (page-level <h1> title heading only), §13.4 Phase-1 structured-data binding rendered into JSX — title/subtitle remain expression bindings, no literal clinical text
- Evidence-verifier packet: not applicable — no trial data, statistics, or new trial entry
- Trial-statistician report: not applicable

## Semantic validity
Confirmed mechanical. All 105 call sites swap a byte-identical inlined `<h1>` for a single `<TrialTitleHeading>` call. The trial title and subtitle remain expression bindings (`{trialMetadata.title}`/`{tm.title}` and `.subtitle`) — no string literal is introduced or altered, so no `trialMetadata`-derived clinical text is rewritten. Both bindings in each call reference the same per-branch metadata object (`trialMetadata` or its local alias `tm`); the codemod's same-object capture guarantees this. The four heading-color expressions (`'#1746A2'`, `'#1e293b'`, `isPositive ? '#1746A2' : '#1e293b'`, `isHarm ? '#7f1d1d' : '#1e293b'`) pass through verbatim as the `color` prop; the isPositive/isHarm derivation stays at each call site. The page title is a descriptive trial-name + subtitle pair (e.g. "WAKE-UP Trial: MRI-Guided Thrombolysis for Stroke with Unknown Time of Onset") — descriptive, not a recommendation requiring citation; this holds across all sampled titles. No never-drift category is in scope: recommendation strength, action verbs, qualifiers, certainty markers, and temporal constraints are untouched because no claim text exists on this surface. Question ledes, sources, statistics, and eligibility prose are outside the diff (the `{tm.questionLede}` conditional is preserved).

## Citation accuracy
Not applicable — no citations are mapped to the heading surface and none are touched.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
Not applicable — no citations touched; no `last_reviewed` field is read or written.

## Rationale
This is a purely mechanical component extraction: 105 byte-identical title `<h1>` blocks collapsed into one presentational component, with title/subtitle data bindings and color expressions passed through unchanged. No clinical claim, citation, or never-drift category is affected, and the author's 108/108 byte-identical render comparison confirms zero output drift. None of the eight mandatory-block conditions apply. Approve.

## Required follow-ups
- None blocking. (Architect condition #6 — replace color-as-prop with a tone enum — is a non-clinical tech-debt item tracked separately.)
