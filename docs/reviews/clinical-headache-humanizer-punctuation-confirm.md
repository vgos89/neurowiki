# Punctuation-confirm — headache humanizer pass

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-05
**Type:** fast confirmation (not a full §17.2 gate) — zero-word punctuation edits on clinical-surface strings, per V's humanizer directive (no em-dashes in rendered UI text). Pairs with `clinical-headache-treatment-onrow-expander-postexec.md`.

## Changes confirmed (em-dash removal, every word identical)

1. **Partial-match caveat** (`HeadacheResultList.tsx`; claim `clinic-headache-partial-match-caveat`): "Partial match **—** confirm…" → "Partial match**:** confirm…". Registry description in `claims.ts` updated to match. The gate-fixed safety string retains full force: "confirm the diagnosis before initiating", "criteria are not yet met for this phenotype", and the "dosing is shown for reference" framing all stand intact and unsoftened; the colon is a slightly tighter label→instruction coupling than the em-dash.
2. **Differential caption** (`HeadacheResultList.tsx`, relocated reviewed copy): "…per patient **—** phenotypes labelled…" → "…per patient**.** Phenotypes labelled…" (period + capital P). Word-for-word identical.
3. **Drawer criterion annotation** (`ClinicHeadachePathway.tsx`, derived string): `${label} **—** your selections: ${chips}` → `${label} **(**your selections: ${chips}**)**`. The "your selections:" disambiguator (user input vs guideline-named features) is preserved.

## Rationale
All three changed only punctuation — zero words added, removed, or reordered. No never-drift category (recommendation strength, action verb, qualifier, certainty marker, temporal constraint) is touched. Approved.
