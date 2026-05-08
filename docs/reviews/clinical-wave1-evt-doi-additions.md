# Clinical review — Wave 1, Batch 2 EVT audit (DOI additions)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-05-08

## Scope
- Claims touched: none (no clinical claim text, threshold, qualifier, or interpretation modified)
- Citations affected: none in `src/lib/citations/registry.ts`; identifier-only enrichment of four trial records in `src/data/trialData.ts`
- Surfaces changed: structured data in `src/data/` (§13.3) — `doi` field additions only

## Semantic validity
No semantic surface changed. The four `doi:` fields are identifier metadata adjacent to existing trial records. None of the five never-drift categories (recommendation strength, action verbs, qualifiers/gates, certainty markers, temporal constraints) is in scope, because no human-facing clinical sentence is added, removed, or paraphrased.

Subtitle ↔ DOI cross-check confirmed:
- `defuse-3-trial`: "Thrombectomy for Ischemic Stroke (6-16 Hours)" ↔ 6-16h window ✅
- `dawn-trial`: "Thrombectomy for Ischemic Stroke (6-24 Hours)" ↔ 6-24h window ✅
- `attention-trial`: "Basilar Artery EVT" ↔ basilar artery trial ✅
- `baoche-trial`: "Basilar EVT 6-24 Hours" ↔ basilar artery late-window trial ✅

## Citation accuracy

| Trial entry | DOI added | Maps to |
|---|---|---|
| `defuse-3-trial` | `10.1056/NEJMoa1706442` | DEFUSE 3 primary publication, Albers et al., NEJM 2018 (PMID 29364767) |
| `dawn-trial` | `10.1056/NEJMoa1713973` | DAWN primary publication, Nogueira et al., NEJM 2018 (PMID 29129157) |
| `attention-trial` | `10.1056/NEJMoa2206317` | ATTENTION primary publication, Li et al., NEJM 2022 (PMID 36239644) |
| `baoche-trial` | `10.1056/NEJMoa2207576` | BAOCHE primary publication, Jovin et al., NEJM 2022 (PMID 36239645) |

All four verified by medical-scientist against PubMed in this session. No protocol papers, design papers, or secondary analyses substituted. No cross-wiring between entries.

## Freshness
Not applicable. No `last_reviewed` field refreshed; no `src/lib/citations/registry.ts` entries touched.

## Rationale
Pure identifier-metadata addition. Four DOI fields, all PubMed-verified, all placed on the correct trial entries. No clinical content altered.

## Required follow-ups
- None blocking. When these DOIs flow into rendered citation records with `quoted_text`, that future change will require full §13.1 semantic review.
