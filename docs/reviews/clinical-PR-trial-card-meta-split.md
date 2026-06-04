# Clinical review — PR #trial-card-meta-split

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-03

## Scope
- Claims touched: none (no tagged claim surface moved; annexa-i `claimId` remains in trialData.ts, not projected)
- Citations affected: none
- Surfaces changed: structured data in src/data/ (generated projection file src/data/trialListData.cardmeta.generated.ts); consumers src/pages/TrialsPage.tsx, src/pages/QuestionDetailPage.tsx
- Evidence-verifier packet: not applicable — no trial-data authoring, structure-neutral projection
- Trial-statistician report: not applicable

## Semantic validity
Confirmed. The change projects a whitelist of fields (legend{finding,bottomLineTag,keyStat}, title, subtitle, source, timeline, listCategory, listDescription, bottomLineSummary, doi) from trialData.ts via JSON.stringify with no transformation. Spot-checked 8 trials (act, dawn, weave, annexa-i, best, basics, stich-i, mistie-iii): every legend.finding/bottomLineTag/keyStat string is byte-identical to source. Non-ASCII clinical characters preserved literally (en-dashes in "clinical–core", ≤6 h, ≥30 mL, mRS 0–3; literal "<4%"). No paraphrase, truncation, or punctuation drift. trialData.ts itself unedited.

## Citation accuracy
Not applicable — no citation records or quoted_text touched by this PR.

## Editorial / expert context
Not applicable — no new trial entry in this PR. This is a build-time projection of existing, previously-reviewed trial content.

## Completeness
Source has 108 `legend:` blocks; generated file has 108 `"legend"` blocks — none dropped. All 8 stub trials (extend-ia-tnk, rescue-japan-limit, best, basics, stich-i, stich-ii, mistie-iii, annexa-i) present in the projection; prerendered /trials/q/basilar-evt confirms BEST and BASICS render.

## Drift guard
scripts/check-card-meta.ts regenerates the projection in-memory from trialData.ts and fails on any byte difference; wired into .husky/pre-commit (line 6) and reported PASS. This is a deterministic, single-source-of-truth staleness control — the generated file cannot be committed stale relative to trialData.ts. Adequate to control the architect-flagged staleness hazard.

## Freshness
Not applicable — no `last_reviewed` field touched; no citation freshness window engaged. Underlying trial content freshness is unchanged from its prior review state.

## Rationale
This is a performance refactor with zero clinical-content impact: a byte-faithful, whitelist-scoped projection of already-reviewed trial fields, guarded by a pre-commit byte-diff check that makes staleness impossible to ship. The sample confirms exact-match clinical legend text including all special characters; completeness confirms no trial dropped; no claim tag, citation, threshold, dose, statistic, or interpretation string is altered. No mandatory-block condition (§17.2 #1–8) is triggered.

## Required follow-ups
- (none)
