# Clinical review — citation registry em-dash cleanup (DAPT "Source" display)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-fable-5)
**Date:** 2026-07-05

## Scope
- Class: C-clinical. Punctuation-only typography change on citation **labels** and five **synthesis** `quoted_text` fields, plus a matching parser-delimiter update. No claim mapping changed.
- Files: `src/lib/citations/registry.ts` (40 `title`, 3 `section`, 29 em-dashes across 5 `quoted_text`), `src/components/trials/GuidelineSummaryCard.tsx` (source-label parse), `src/components/trials/ClinicalSynthesisCard.tsx` (source-label parse). Companion: `src/seo/routeMeta.ts` trial-title separator.
- quoted_text fields cleaned (synthesis, not verbatim): do-snnoop10-2019 (SNNOOP10 mnemonic), ichd3-2018 (ICHD-3 criteria summary), robblee-ahs-2025, ailani-ahs-2021 (AHS migraine drug lists), scher-tth-2024-continuum (review).
- Evidence-verifier / trial-statistician: not applicable (no trial datum, statistic, or numeric value touched).

## Semantic validity
Confirmed. Every change is a punctuation-only substitution (` — ` → ` · ` in labels; ` — ` → `: ` at heading/label→expansion boundaries in synthesis text), deterministically proven content-identical (alphanumerics byte-identical after stripping punctuation) and independently re-checked against the five never-drift categories: recommendation strength (AHA/ASA COR/LOE, AAN Level A/B/C/U all preserved), action verbs, qualifiers/gates (all doses, thresholds, windows intact; hyphenated numeric ranges like 4-72 h and criteria B-D are hyphens and were not touched), certainty markers, and temporal constraints — none altered.

Colon-ambiguity check on the two dense lists: **SNNOOP10** — "S — Systemic symptoms" → "S: Systemic symptoms"; colon is standard mnemonic letter→expansion punctuation and the semicolon item delimiters are preserved, so no two red flags merge. **ICHD-3** — the em-dash appeared only at the diagnosis-name→criteria boundary ("1.1 Migraine without aura — At least five attacks" → "…without aura: At least five attacks"); internal "B)"/"C)"/numbered connectors and hyphen-ranges are untouched, so no attachment ambiguity. One cosmetic (non-clinical) readability note: `ailani-ahs-2021` now has two colons in one sentence; the comma-delimited drug list makes attachment unambiguous — acceptable, not blocking.

Verbatim-vs-synthesis classification confirmed correct: the five cleaned fields are the platform's own formatted synthesis (a mnemonic, criteria summaries, drug-annotation lists), so punctuation edits are in-bounds. The genuinely verbatim trial-abstract quotes (BAOCHE, ATTENTION, CREST-2, EAGLE, PRISMS) contain no em-dashes and were left byte-stable, which independently corroborates the classification.

## Citation accuracy
No citation's source, version, section identity, URL, PMID, year, COR, or LOE changed; only the separator glyph between the guideline name and its section descriptor moved. Parser source-label extraction verified — `c.section ?? c.title.split(' · ')[0].split(':')[0]` yields correct labels ("2026 AHA/ASA Guideline", "CREST-2", "EAGLE"), and section-bearing citations (the majority) display the unchanged `c.section`.

## Freshness
No `last_reviewed` field was modified (all occurrences in the diff are unchanged context lines). Typography PR, not a §13.6 refresh; freshness checklist and mandatory-block condition #6 do not apply.

## Rationale
Punctuation-only standardization of citation labels and platform-authored synthesis fields with a matching parser delimiter update, addressing V's report of em-dashes in the DAPT question "Source" display. Content identity deterministically proven and re-confirmed; colon substitutions sit only at label/heading→expansion boundaries; verbatim external quotes untouched; parser produces correct labels. Directly parallels the approved trial-data em-dash sweep.

## Required follow-ups
- Optional (non-blocking): add an explicit `section` field to `silberstein-aan-ahs-2012` so its GuidelineSummaryCard fallback label reads as a real source name rather than "Evidence-based guideline update" (pre-existing behavior in ClinicalSynthesisCard; not a clinical-force change).
