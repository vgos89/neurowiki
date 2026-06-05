# ADR: Headache result screen — ranked phenotype accordions (Stage One)

**Date:** 2026-06-05
**Status:** Accepted
**Class:** D-clinical (presentation increment; verbatim string relocation only)
**Supersedes / relates:** broader Stage One plan `docs/reviews/arch-headache-pathway-rewrite-stage-one.md`; pairs with this increment's review `docs/reviews/arch-headache-result-accordions-stage-one.md`.

## Context

The clinic headache pathway result screen (`src/pages/ClinicHeadachePathway.tsx`) stacked three diagnosis blocks — a large headline card, a "differential ranking" ribbon, and a multi-diagnosis banner — above inline per-phenotype treatment cards. V found the result "too big" and "tiring to read," and asked that it match the trials/calculator density with each phenotype rendered as an accordion ("'Possible 3 of 4 met Tension-type (episodic)' should be an accordion along with migraine etc"). The ICHD-3 evaluator (`src/data/clinicHeadacheData.ts`) already returns a ranked `PhenotypeMatch[]`; this is a presentation problem, not an engine problem.

## Decision

1. **Collapse the three stacked diagnosis blocks into one ranked accordion list.** New presentational component `src/components/pathways/headache/HeadacheResultList.tsx`, props `{ matches: PhenotypeMatch[] }`. One accordion per phenotype; the top match opens by default; trials/calculator type density (name `text-[14px]`, meta `text-[11px]`, tag `text-[10px]`, 3px `--color-neuro-500` left accent on the top row).

2. **Build headache-specific rather than reuse the generic `MapperPanel`.** `MapperPanel`'s local `MapperMatch` type cannot represent two things this surface requires: (a) `metCriteria.contributingChipLabels` — the "Based on your selection: …" audit trail a prior clinical-reviewer condition mandated; and (b) the chronic-migraine-probable section/label exception (chronic migraine at `'probable'` must not read "Probable" because ICHD-3 §1.5 does not cover §1.3). Reuse would force a lossy adapter or an edit to a shared primitive. **Consolidation exit** (documented in the component header): when `MapperMatch` is widened to carry `contributingChipLabels` and a section/label-exception hook, or when a second pathway needs this exact renderer, converge the two.

3. **Extract `CriteriaList` into `src/components/pathways/headache/CriteriaList.tsx`** as the single source consumed by both the page's inline treatment cards and the new accordion (was a page-local duplicate-risk helper).

4. **Scope discipline — verbatim only.** Every displayed clinical string is relocated byte-for-byte (headline disclaimer, differential caption, multi-diagnosis guidance, chronic-migraine exception). No clinical wording authored. Deferred to **Stage Two (Class E-clinical):** band words (Leading / Possible / Less likely), treatment link-out, the always-on non-collapsible SNNOOP10 disclaimer, and the "considered and set aside" tray (consuming `definitionallyExcluded` / `exclusionReason`). Untouched: engine, state, `chipsFromState`, questionnaire (Frames 1–2), red-flag short-circuit, bottom drawer, citation footer, and the inline `data-claim` treatment cards.

## Consequences

- The result reads as a short, scannable accordion list in the NeuroWiki house design; the long-scroll fatigue V flagged is resolved for the diagnosis surface.
- Two accordion renderers (`MapperPanel` + `HeadacheResultList`) coexist by intent; the fork is named with a consolidation trigger so it does not become silent drift.
- Accessibility (per fresh-context review): the criteria-met bar is decorative (`aria-hidden`) so it does not pollute the disclosure button's name; the result live region was narrowed to an `sr-only` status node so accordion expand/collapse no longer re-announces the whole result; `focus-visible` ring + `touch-manipulation` added to the trigger.
- **Rollback:** revert the single page edit and delete the two new component files (`HeadacheResultList.tsx`, `CriteriaList.tsx`); engine, drawer, and treatment cards are untouched, so revert is clean and carries no clinical-data risk.

## References

- Architect review (this increment): `docs/reviews/arch-headache-result-accordions-stage-one.md` — approve-with-conditions, all conditions reflected.
- Engine rank-and-flag (prior, landed): `docs/reviews/clinical-headache-engine-rank-and-flag.md`; commit `6585a71`.
