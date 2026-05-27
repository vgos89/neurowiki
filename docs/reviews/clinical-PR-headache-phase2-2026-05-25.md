# Clinical review — Headache ICHD-3 rebuild Phase 2 (multi-diagnosis + selection→criterion surfacing)

**Decision:** approve (all 4 conditions resolved inline before commit)
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-25

## Scope
- Claims touched: none added or modified
- Citations affected: none
- Surfaces changed: PhenotypeMatch shape (added `displaySection`, `contributingChipLabels`); CriteriaList rendering ("Based on your selection:" under each met criterion); drawer reasons (chip labels embedded inline); drawer action label uses `displaySection`; multi-diagnosis banner above management section
- Evidence-verifier packet: not applicable
- Trial-statistician report: not applicable

## Semantic validity

Phase 2 is a presentation layer over Phase 1's already-approved evaluator. Walked each of the six review focuses against the never-drift categories. Four conditions identified, all resolved inline:

### A. ICHD-3 §X.5 Probable framework — pass with Condition 1 resolved
- §1.5 Probable migraine covers only 1.5.1 (Probable migraine without aura) and 1.5.2 (Probable migraine with aura). ICHD-3 has NO §1.5.3 Probable chronic migraine.
- Condition 1 fix: `chronic-migraine` removed from `PROBABLE_SECTION_FOR` map. When chronic-migraine matches as 'probable', displaySection falls through to §1.3 parent. The page headline renders "Partial match for Chronic migraine" instead of "Probable Chronic migraine" (an ICHD-3 entity that does not exist).
- Inline comment added documenting the §1.5 scope (Condition 4 also resolved).

### B. Multi-diagnosis banner wording — pass with Condition 2 resolved
- Original: "The patient may also carry:" — too soft against ICHD-3 General Principles.
- Fixed: "ICHD-3 General Principles require that each headache type the patient meets criteria for is separately diagnosed and coded. The patient also meets criteria for the following additional phenotype(s):" — matches ICHD-3's "must be separately diagnosed and coded" force.

### C. Selection→criterion phrasing — pass with Condition 3 resolved
- CriteriaList line "Based on your selection: X, Y, Z" — kept (honest input-echo on the criteria list surface).
- Drawer reasons line: changed from `"Criterion C met — selected: ..."` to `"Criterion C met — your selections: ..."` to disambiguate user-input from guideline-named features.

### D. Drawer reasons mutation — pass
For §1.1 C the chip labels happen to match guideline-named features (unilateral, pulsating, severe, aggravated). For §2.3 D the chip set maps one-to-one to the ≤1 pool members. Passes the paraphrase standard.

### E. No-claim-fabrication — pass
Phase 2 framing strings ("ICHD-3 General Principles require...", "meets criteria for", "Based on your selection") are tool-behavior language, not new clinical claims.

### F. Suppression-rule precedence — pass with Condition 6 (non-blocking) resolved
- Verified: chronic-TTH dropped from `matches` BEFORE the banner reads it when chronic-migraine is a full match.
- Test added: `§2.3 Note 1 — chronic-migraine full match strips chronic-TTH from matches before banner reads it`.

## Citation accuracy

No citations touched. `ichd3-2018` Phase 1 quoted_text expansion already covers the §X.5 framework via the chapter-3 verbatim extension.

## Editorial / expert context

Not applicable — no new trial entry.

## Freshness

No `last_reviewed` field touched.

## Rationale

Phase 2 surfaces the audit trail from chip selection to phenotype match without fabricating new clinical claims. Two never-drift violations identified in the initial review (§1.5 → chronic-migraine mapping; "may also carry" softening) are corrected inline. The X.5 framework relabel is clinically appropriate when scoped correctly. The multi-diagnosis surfacing precedence with §2.3 Note 1 suppression is verified correct and now covered by a regression test.

## Required follow-ups (Conditions — all resolved inline before commit)

1. ✅ **§1.5 → chronic-migraine mapping removed.** ICHD-3 has no §1.5.3 Probable chronic migraine. `PROBABLE_SECTION_FOR` updated; comment documents the scope. Page headline falls through to "Partial match for Chronic migraine" with §1.3 parent label.
2. ✅ **Multi-diagnosis banner wording strengthened.** "May also carry" → "meets criteria for" matching ICHD-3 General Principles force.
3. ✅ **Drawer reasons word swap.** "selected:" → "your selections:" to disambiguate user-input from guideline content.
4. ✅ **Inline comment added** in `PROBABLE_SECTION_FOR` documenting that §1.5 scope is 1.5.1 / 1.5.2 only (prevents drift recurrence).
5. ✅ (Non-blocking) Test added: chronic-migraine §1.3 probable does NOT map to §1.5 displaySection.
6. ✅ (Non-blocking) Test added: chronic-migraine + chronic-TTH suppression precedence verified at evaluator-output level.
