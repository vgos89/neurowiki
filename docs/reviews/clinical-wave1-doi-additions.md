# Clinical review — Wave 1: DOI additions to trialData.ts

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-05-07

## Scope
- Claims touched: none (no claim text, interpretation, threshold, qualifier, certainty marker, or temporal constraint modified)
- Citations affected: `doi:` identifier field added to `ninds-trial`, `original-trial`, `ecass3-trial`, `eagle-trial`
- Surfaces changed: structured data in `src/data/trialData.ts` — identifier field only, not a claim text field

## Semantic validity
N/A. The diff adds a `doi:` identifier field to four trial entries. No rendered clinical claim text is altered. DOIs are stable, opaque resolver identifiers; they do not encode clinical force.

Spot-check confirms each DOI is added to the correct trial entry:
- `ninds-trial` subtitle "IV tPA for Acute Ischemic Stroke (0-3 Hours)" → NEJM 1995 NINDS ✅
- `original-trial` subtitle "Tenecteplase vs Alteplase for Acute Ischemic Stroke (0–4.5 Hours)" → JAMA 2024 tenecteplase ✅
- `ecass3-trial` subtitle "IV tPA for Acute Ischemic Stroke (3-4.5 Hours)" → Hacke NEJM 2008 ✅
- `eagle-trial` subtitle "Intra-Arterial tPA for Central Retinal Artery Occlusion" → Schumacher Ophthalmology 2010 ✅

## Citation accuracy
DOIs verified by medical-scientist against PubMed in this session:
- NINDS → PMID 7477192 (NEJM 1995;333:1581–1587)
- ORIGINAL → JAMA 2024;332(18):1550–1559
- ECASS III → PMID 18815396 (NEJM 2008;359:1317–1329)
- EAGLE → PMID 20417561 (Ophthalmology 2010)

## Freshness
Not applicable. `doi:` is an identifier, not a citation under §13.2 schema. No `last_reviewed` obligation triggered.

## Rationale
Pure identifier-metadata addition. Four DOI fields, all PubMed-verified, all placed on the correct trial entries. No clinical content altered.

## Required follow-ups
- None blocking. When these DOIs flow into rendered citation records with `quoted_text`, that future change will require full §13.1 semantic review.
