# Architect review — Headache primary-trial citation rewire (no PR # yet)

**Decision:** approve-with-conditions
**Reviewed:** plan only
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-27

## Rationale

The plan is structurally clean: pure additions to two data files (`src/lib/citations/registry.ts`, `src/lib/citations/claims.ts`) plus an append to `docs/MISSING_TRIALS.md`. No page, evaluator, component, scanner, or schema changes. The work respects the existing citations boundary (rubric item 2): registry holds Citation records, claims.ts holds claimId→citation_ids[] mappings, and the existing patterns in claims.ts already demonstrate multi-citation arrays mixing trials + guidelines + reviews — so this is not a new pattern (no duplication risk, rubric item 1; no composability miss, rubric item 3).

State locality (rubric item 4) is not applicable — pure data layer. Dependency weight (rubric item 5) is zero. Migration exit (rubric item 6) is the live risk: the plan touches >5 files when counting all 10 claim entries plus registry.ts plus MISSING_TRIALS.md, and the rewrites of `description` text are user-perceived. However, the change is additive (existing Continuum IDs stay, just reordered) and a clean revert is `git revert` of the single commit. Acceptable without a feature flag given the additive shape, but the PR body must carry an explicit rollback note per §16 D-clinical requirements.

The biggest structural call concerns the **ordering convention** (primary trials first, then guidelines, then reviews). The current convention in claims.ts is mixed. Adopting this forward standard is reasonable, but applying it only to the 10 headache claims creates a third implicit pattern in the file. Recommendation: add a one-line comment block at the top of claims.ts stating the canonical ordering.

The MEDIUM-confidence items (Mulleners CONQUER PMID unresolved; Cohen Brain 2006 abstract-level verbatim) are acceptable as approve-with-conditions, not blockers.

## Required follow-ups

1. **Add ordering-convention comment** at the top of `claims.ts` codifying: primary trials first (chronologically), then guidelines (newest first), then review articles.
2. **Explicit rollback note in PR body** per §16 D-clinical: "`git revert <sha>` is safe; change is additive (no existing citation IDs removed, no schema change). Continuum reviews retained as secondary citations."
3. **PMID resolution for Mulleners CONQUER 2020** before merge: (a) resolve PMID via PubMed direct fetch, OR (b) ship with DOI-only and `// TODO: PMID pending` comment, OR (c) drop CONQUER from this PR and ship in a follow-up. Choose one — do not merge with `blocked:source-not-resolved` literal in field.
4. **Route to clinical-reviewer §17.2** before merge. Architect covers structural shape only; semantic validity of new claim-to-evidence mappings (PREEMPT-1 primary-endpoint-not-met caveat, AAN-AHS 2012 episodic-vs-chronic scope, SUNCT lamotrigine case-series-level framing) is clinical-reviewer's gate.
5. **Confirm no `description` text changes amount to new clinical claims.** Rewriting "(Scher Continuum 2024)" to "(Cohen JAMA 2009)" is attribution, not recommendation. Clinical-reviewer must confirm none of the 10 rewrites silently changes threshold, dose, line-of-therapy, or contraindication. If any does, PR promotes to Class E.
6. **MISSING_TRIALS.md append** follows existing template (Full citation / PMID / What it showed / Why neurology cares / Identified during).

## Blocking issues

None. Class D-clinical correct (citation-graph change, not clinical-logic change).
