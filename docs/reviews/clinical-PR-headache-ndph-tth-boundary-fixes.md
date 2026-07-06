# Clinical review — headache phenotype engine, Fixes A-M3 (NDPH onset gate) + A-m4 (TTH ≥10 boundary)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-06
**Class:** E (diagnostic-logic change) · headache clinic pathway engine

## Scope
- **Claims touched:** `clinic-headache-ichd3-ndph-criteria` (§4.10 NDPH), `clinic-headache-ichd3-tension-criteria` (§2.2 frequent episodic TTH). Both anchor to citation `ichd3-2018`.
- **Citations affected:** `ichd3-2018` (`last_reviewed` 2026-05-25, `review_window_months` 24 → within window; freshness pass, no refresh triggered).
- **Surfaces changed:** structured data in `src/data/` (§13.3 — `Chip` labels, `Criterion` evaluators + descriptions, `AnswerOption` question copy; all clinical claim surfaces per `.claude/rules/clinical-surfaces.md`).
- **Files:** `src/data/clinicHeadacheData.ts`, `src/data/headacheQuestions.ts`, `src/data/clinicHeadacheData.test.ts`.
- **Evidence-verifier packet:** not applicable (diagnostic-criteria logic; no trial datum, statistic, or numeric outcome touched).
- **Trial-statistician report:** not applicable.

## Semantic validity

**Fix A-M3 (NDPH §4.10 B) — CORRECT.** The source-verified reference and the `ichd3-2018` `quoted_text` both give §4.10 B verbatim: *"Distinct and clearly-remembered onset, with pain becoming continuous and unremitting within 24 hours."* The prior `ndph-B` fired on `onset-new-within-3-months` (mere recency) — the documented **M3 (material)** deviation, which encoded neither the clearly-remembered onset nor the 24-hour-to-continuous gate and over-called NDPH against any long-standing continuous headache. The new `onset-abrupt-continuous-24h` chip and rewritten `ndph-B` now require exactly the §4.10 B signature. Chip label and criterion description faithfully paraphrase the source with no drift. `ndph-B` correctly remains a **suppress-gate/DROP** (§4.10 has no §X.5 Probable home, so a single miss must drop, not demote; consistent with `EMIT_CRITERION_IDS` excluding `ndph-B`).

No new false-negative introduced: a genuine NDPH patient reaches full match via the new onset option (`new-continuous-24h`), which bundles `onset-abrupt-continuous-24h` + `dur-continuous`, plus `pattern-ge-3-months` — precisely §4.10 A+B+C. The tightening excludes only patients who never met criterion B. Bundling `dur-continuous` into the onset option is clinically sound: §4.10 B by definition means the pain *became continuous*, so the option cannot truthfully be selected for a non-continuous headache. Question wording ("New, with a clearly-remembered start that became constant within 24 hours") conveys the signature without inviting misinterpretation.

**Fix A-m4 (§2.2 A count boundary) — CORRECT.** Reference + `quoted_text` confirm §2.2 A = *"At least 10 episodes"* (≥10, inclusive of 10); `tth-A` requiring `attacks-gt-10` was the documented **m4** off-by-one. The relabel makes the two options non-overlapping at 10 (`attacks-5-to-10` → "5 to 9"; `attacks-gt-10` → "10 or more"). A patient with exactly 10 now selects "10 or more" → `attacks-gt-10` → satisfies `tth-A`; §2.2 is correctly inclusive of 10. No `evaluate` logic changed.

No ≥5 / ≥2 regression — verified by reading every affected evaluator. All downstream count checks OR both attack chips, so their union is unaffected: `mig-A` (≥5), `cluster-A` (≥5), `cm-B` (≥5) use `attacks-5-to-10 || attacks-gt-10`; `aura-A` (≥2) adds `attacks-ge-2`. A patient with exactly 10 lands in `attacks-gt-10` and still satisfies every ≥5 check; 5-9 lands in `attacks-5-to-10` and still satisfies them. No gap opens at n=10 for any phenotype.

## Citation accuracy
`ichd3-2018` resolves (PMID 29368949, ichd-3.org). Its `quoted_text` contains both governing criteria verbatim. Claim descriptions in `claims.ts` match the quoted source with no wording drift. Both fixes move the *code* closer to the already-verbatim citation text — this change reduces claim-vs-source drift rather than introducing it.

## Freshness
`ichd3-2018` `last_reviewed` 2026-05-25, window 24 months → current (pass). No `last_reviewed` refresh required or performed: the change corrects the encoding to match the existing verbatim `quoted_text`; it does not restate or re-source the citation. §13.6 six-step refresh not triggered.

## Mandatory-block check (all eight → pass)
1. Never-drift drift — none. Recommendation strength / action verbs / qualifiers-and-gates / certainty / temporal all preserved. The load-bearing edits ("within 24 hours"; "at least 10") match the source *more* faithfully, not less.
2. Synthesis smoothing a conflict — n/a (single source).
3. Source unresolvable — no; resolves.
4. `quoted_text` doesn't support the claim — no; supports both verbatim.
5. `-clinical`/Class E without review artifact — this review is the gate output (artifact = this file).
6. `last_reviewed` refresh without §13.6 — no refresh performed.
7. Trial-data/statistics PR without evidence-verifier packet — n/a.
8. New-trial-entry packet with incomplete §8 — n/a.

## Rationale
Both edits are verified-correct corrections of two documented deviations (M3 material, m4 minor) in the source-verified ICHD-3 reference, and both move the engine encoding into closer literal agreement with the `ichd3-2018` verbatim `quoted_text` — the §4.10 B "continuous and unremitting within 24 hours" gate and the §2.2 A "at least 10 episodes" boundary. The NDPH change tightens an over-call without creating any new false-negative for genuine NDPH, and the TTH relabel closes the off-by-one at n=10 without disturbing any ≥5/≥2 phenotype. No never-drift category is violated; no mandatory-block condition applies. The intentional id/label mismatch (`attacks-5-to-10` labeled "5 to 9") is a functional boundary relabel documented in a code comment, internally consistent across chip label, question option, and criterion semantics, and carries no clinical risk.

## Required follow-ups
- None blocking.
- **Optional (parking-lot candidate, not a condition):** `attacks-5-to-10` now semantically means 5-9. Consider renaming the id to `attacks-5-to-9` in a future non-clinical Class D refactor to remove the id/label mismatch (documentation-only; no behavior change).

## Verification state at gate time
- `npx vitest run` → 207/207 pass, including the new NDPH over-call regression test (`clinicHeadacheData.test.ts`, "recency alone … no longer satisfies ndph-B → absent").
- `npx tsc --noEmit` → clean (new `ChipId 'onset-abrupt-continuous-24h'` typechecks across the engine).
