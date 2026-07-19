# Clinical review — Extended IVT: Path C reorder + sICH caution

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-07-19

## Scope
- Claims touched: extended-ivt-sich-caution (new), trace-iii-late-tnk-sich (new)
- Citations affected: aha-asa-2026-4.6.1, aha-asa-2026-4.6.3, extend-trial-2019, wake-up-trial-2018, trace-iii-trial-2024
- Surfaces changed (§13.3): static JSX text (Path A criteria question header + option descriptions), string literals inside the `result` useMemo (Path A `aDwiSmall===false` reason/details; Path C non-LVO reason/details), and two new static-JSX `data-claim` drawer elements (shared sICH caution; Path-C-only TRACE-III numeric line). No structured-data or markdown surfaces.
- Evidence-verifier packet: docs/evidence-packets/2026-07-19-extended-late-window-ivt-sich-caution.md (overall confidence MEDIUM)
- Trial-statistician report: not applicable — the only displayed statistic is a descriptive sICH proportion reported directly by TRACE-III (no NNT, NI margin, Bayesian, ordinal-shift, or registry computation). (If a future edit adds a magnitude/definition or NNT claim, statistician review is required.)

## Semantic validity

**EDIT 1 — Path A territory-agnostic DWI-size reword (CONFIRMED).** The WAKE-UP/THAWS "smaller than one third of the MCA territory" threshold is preserved exactly at all three co-located surfaces (question header, both option descriptions, `aDwiSmall===false` result). No numeric or clinical-meaning drift; the guideline (aha2026StrokeGuideline.ts line 335) frames the threshold as "an MRI-DWI lesion smaller than one-third of the MCA territory," supporting the volume-yardstick reading. Now reads correctly for PCA/ACA-territory strokes. Non-blocking: the affirmative instruction to apply the yardstick to PCA/ACA is a mild operational extrapolation beyond WAKE-UP/THAWS's predominantly anterior enrollment; acceptable because the threshold value is unchanged and does not loosen eligibility.

**EDIT 2 — Path C LVO-before-penumbra reorder (CONFIRMED).** (a) Exit-on-LVO verified: `isCriteriaComplete` short-circuits `if (cLvo === false) return true`; the `result` useMemo returns the non-LVO verdict first. (b) The non-LVO verdict conveys both requirements and does not imply LVO alone qualifies ("A qualifying occlusion alone is not sufficient: salvageable penumbra on perfusion imaging is also required"). Downstream eligible verdict still requires penumbra, no feasible EVT, and expert oversight, so the penumbra gate remains load-bearing. "may be considered" = COR 2b preserved, matches §4.6.3. Non-blocking: the non-LVO reason opens "beyond 9 hours from last known well," slightly imprecise for the unknown-onset/wake-up sub-route; generalize at next edit.

**EDIT 3a — Shared qualitative sICH caution (CONFIRMED).** Each mapped source supports the qualitative direction (EXTEND "more cases of symptomatic cerebral hemorrhage," WAKE-UP "numerically more intracranial hemorrhages," TRACE-III "sICH appeared to be higher"). Correct synthesis, not a smoothed-over conflict: sources differ in magnitude (~1.4%–6.2%), and going qualitative rather than averaging is the correct handling. "Beyond 4.5 hours" is defensible for the wake-up/unknown-onset path: it characterizes the window (time from last-known-well), not the treatment clock.

**EDIT 3b — Path-C-only TRACE-III numeric line (defensible; citation-record condition).** At MEDIUM confidence, the wording is defensible for a bedside surface: names the trial, approximate phrasing ("about"/"under"), no definition-label claim, explicitly non-generalized to Paths A/B. Reporting observed event rates is descriptive and does not upgrade the source's hedged inferential language. Figures (3.0% vs 0.8%) round correctly. Residual gap is citation substantiation, not clinical drift — resolvable by a low-risk citation-record edit (Condition 1).

## Citation accuracy
- aha-asa-2026-4.6.1 — resolves; correct section. Pass.
- aha-asa-2026-4.6.3 — resolves; matches "4.5–24 hour … tenecteplase may be considered (Class IIb)"; app's narrowing to "9 to 24 hours" for Path C is a within-window operational partition (4.5–9h is Path B), not drift. Pass.
- extend-trial-2019 — resolves; sICH direction substantiated. Pass.
- wake-up-trial-2018 — resolves; sICH direction substantiated. Pass.
- trace-iii-trial-2024 — resolves (PMID 38884324); quoted_text supported qualitative direction only. Numeric figure substantiation added per Condition 1.

## Editorial / expert context
Not applicable — no new trial entry in this PR. All five citations pre-exist in registry.ts; no TRIAL_DATA record added. Mandatory-block #8 does not apply. Evidence packet §8 is substantively filled: guideline incorporation confirmed (COR 2a extended-window; COR 2b late-window TNK §4.6.3); TIMELESS named as limiting/negative comparator; TRACE-III accompanying editorial and post-publication letters recorded as not retrievable this session with stated reason (NEJM/PubMed HTTP 403) plus one located critical appraisal (PMID 39503377); HOPE (JAMA 2025, PMID 40773205) flagged as emerging updating evidence not changing the qualitative caution. Stated-reason entries, not silent omissions.

## Freshness (§13.7)
- aha-asa-2026-4.6.1 — last_reviewed 2026-05-23, 6-month default → in window. Pass.
- aha-asa-2026-4.6.3 — last_reviewed 2026-05-19; emerging-therapy category → `review_window_months: 3` set per Condition 2, next re-review 2026-08-19.
- extend-trial-2019 — last_reviewed 2026-06-10, window 36 → in window. Pass.
- wake-up-trial-2018 — last_reviewed 2026-06-10, window 36 → in window. Pass.
- trace-iii-trial-2024 — last_reviewed 2026-05-19 → in window under current default. Pass; a matching 3-month override is a non-blocking follow-up.

No `last_reviewed` date is refreshed in this PR, so §13.6 is not triggered. Adding `review_window_months` is not a `last_reviewed` refresh.

## Rationale
All three edits are clinically faithful. The Path A size threshold is preserved verbatim across every co-located surface while correctly generalizing to non-MCA territories; the Path C reorder produces the correct non-LVO exit and its new verdict conveys both requirements while denying LVO-alone sufficiency; the shared sICH caution is a correct qualitative synthesis that avoids a false single number, with a defensible "beyond 4.5 hours" parenthetical. No drift in any never-drift category; no mandatory-block condition triggered. Both conditions are editorial, unambiguous, low-risk, so approve-with-conditions is calibrated; safety is not compromised by merging once they are met.

## Required follow-ups
1. **(Condition — met before merge)** Substantiate the displayed TRACE-III figure in the citation record so "about 3% vs under 1%" is traceable, carrying secondary-source provenance and Medium-confidence / definition-UNVERIFIED flag. Done: `trace-iii-trial-2024.quoted_text` extended 2026-07-19. Rendered string unchanged.
2. **(Condition — met before merge)** Add `review_window_months: 3` with rationale to `aha-asa-2026-4.6.3`. Done 2026-07-19; next re-review 2026-08-19.
3. (Non-blocking) Consider the same 3-month override on `trace-iii-trial-2024` for consistency; currently in-window.
4. (Non-blocking) Schedule medical-scientist re-review of §4.6.3 / TRACE-III when primary NEJM full text and HOPE (JAMA 2025, PMID 40773205) become retrievable, to elevate the sICH figure from Medium to High and verify the sICH definition label.
5. (Non-blocking) At next §4.6 refresh: note the Path A PCA/ACA extrapolation and generalize the Path C non-LVO reason's "beyond 9 hours from last known well" wording for the unknown-onset/wake-up sub-route.
