# Clinical review — trialData.ts em-dash typography sweep (W8.3)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: Claude Opus 4.7)
**Date:** 2026-06-03

## Scope
- Claims touched: none
- Citations affected: none
- Surfaces changed: user-facing trial write-up fields in `src/data/trialData.ts` (conclusion, clinicalContext, educationalContext, safetyData, cautions, bottomLineSummary, info, answer, and similar prose fields). Change is punctuation-only — spaced em-dashes (` — `, U+0020 U+2014 U+0020) replaced with meaning-preserving punctuation. No claim text, interpretation string, threshold, dose, statistic, or citation modified.
- Evidence-verifier packet: not applicable — no trial/guideline data or numeric values touched.
- Trial-statistician report: not applicable — no statistic, CI, p-value, NNT, or range altered.

## Semantic validity
Confirmed. The sweep is typography-only and applied by an idempotent codemod (`scripts/codemod-emdash-sweep.mjs`) under three field-scoped heuristics: a single spaced em-dash on a line → semicolon (clause join); a pair → commas (parenthetical); three or more → commas (each of the 15 dense clinical-prose lines was individually human-reviewed on 2026-06-03 and confirmed to use every em-dash as an appositive/explanatory/parenthetical separator, so a comma preserves meaning exactly). 97 content lines changed; every change is one-for-one with no line added or removed. No number, fact, drug name, dose, threshold, percentage, hazard ratio, confidence interval, p-value, or word was added, removed, or reworded — the clinical meaning of every field is byte-identical apart from the substituted punctuation character.

## Citation accuracy
Not applicable — no citations in scope. Citation strings embedded in prose (author, journal, year, PMID, page range) were not altered; en-dashes inside page ranges and confidence intervals (U+2013, unspaced) were explicitly excluded from the sweep and verified preserved (104 en-dashes present on both the removed and added sides of the diff — perfectly balanced, zero net change).

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
Not applicable — no `last_reviewed` fields touched.

## Rationale
Pure typography standardization on clinical-surface prose: spaced em-dashes were removed from user-facing trial write-ups and replaced with semicolons/commas that preserve meaning exactly. Developer code comments (26 lines) were intentionally left untouched. En-dashes in CIs, page ranges, and numeric ranges were preserved by design and verified. Typecheck clean; production build prerendered all 170 routes with 0 failures, confirming no rendering regression. The `-clinical` flag applies because `src/data/trialData.ts` is an enumerated clinical surface, but no clinical content, claim, citation, dose, threshold, or statistic was altered. Approve.

## Required follow-ups
- none
