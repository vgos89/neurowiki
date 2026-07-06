# Clinical review — em-dash / AI-style cleanup, clinical surfaces (2026-07-02)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-fable-5); punctuation-appropriateness gate after a deterministic content-identity proof
**Date:** 2026-07-02

## Classification
**Class C-clinical.** A broad but non-structural copy edit: em-dashes (—) in user-facing prose replaced with meaning-preserving punctuation. No refactor, boundary-cross, breaking change, dependency, or schema change → not Class D despite the file count. The `-clinical` flag applies because the copy sits on clinical surfaces; hence this §17.2 review. No architect artifact required (§17.1 is D/E only).

## Scope
- Surfaces: trial pages, clinical pathways, calculators, guide content (the clinical batch of the app-wide em-dash hunt). SEO metadata + billing calculator + the humanizer-gate change ship separately.
- Files (23): `src/pages/trials/TrialPageNew.tsx`; pathways `EvtPathway.tsx`, `ExtendedIVTPathway.tsx`, `StatusEpilepticusPathway.tsx`, `ElanPathway.tsx`, `MigrainePathway.tsx`; calculators `MrsCalculator.tsx`, `IchScoreCalculator.tsx`, `HeidelbergBleedingCalculator.tsx`, `HasBledScoreCalculator.tsx`, `NihssCalculator.tsx`, `GlasgowComaScaleCalculator.tsx`, `Abcd2ScoreCalculator.tsx`; `src/data/guideContent.ts`; `src/components/article/stroke/*` (CodeModeStep1/2/3, LKWTimePicker, NihssCalculatorEmbed, QuickReferenceCard, StrokeIchProtocolStep, ThrombolysisEligibilityModal); `src/components/shared/PatientContextPanel.tsx`.
- 248 em-dashes replaced. Claims/citations touched: none. `last_reviewed`: not touched (no claim text, threshold, dose, or grade changed).

## Content-identity proof (pre-review gate)
Every removed/added line pair was normalized by stripping `[— : ; , ( ) whitespace]` and confirmed **byte-identical in remaining alphanumerics** — i.e., no word, number, drug name, dose, threshold, CI, time window, or COR/LOE grade was added, removed, re-cased, or reordered anywhere. Only em-dashes were replaced by colon / semicolon / comma / parentheses. En-dashes in ranges/CIs (`6–24 h`, `ASPECTS 3–5`, `95% CI 0.97–1.09`) were left untouched. Two fixer overreaches were caught and reverted before this review: a title-casing sweep on 17 pathway option-labels and one inserted word ("a") in a MigrainePathway pearl.

## Semantic validity / punctuation appropriateness
Because content-identity is proven, the review scope was narrow: does any chosen punctuation create clinical ambiguity or shift emphasis? **No.** Every contrastive/negation site (the main risk, e.g. "give X — not Y" → colon reading as elaboration) is anchored by an explicit lexical negation ("not", "avoid", "does NOT", "never", "instead") that fixes the reading independent of the connector. All dosing, eligibility, and contraindication strings keep their qualifiers correctly bound (e.g. midazolam IV-vs-IM alternative preserved by "or" + parentheses; anticoagulation-reversal agent→regimen colons untouched; `COR 3: No Benefit; stent retriever...` reads correctly). Certainty markers ("association, not causation", "no efficacy inference possible") and temporal/COR-LOE grades are intact. Connector choices are structurally appropriate (semicolons between independent clauses, colons before elaborations/labels, commas for appositives). Two swaps are minor improvements over the original em-dash.

## Freshness
Not applicable — no citation or claim was touched; this is not a §13.6 `last_reviewed` refresh.

## Rationale
An em-dash-only punctuation normalization on clinical copy, deterministically proven content-preserving and confirmed free of punctuation-induced ambiguity. Clinically inert; improves the house style (reduces the AI-fingerprint em-dash density the humanizer skill targets).

## Required follow-ups
- None for this batch. The companion humanizer-gate tightening (widen scanned files + make em-dash density a real check) ships as a separate change and prevents regression.

---

## Wave 2 addendum (2026-07-02) — remaining clinical surfaces + comprehensive gate

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-fable-5), punctuation-appropriateness gate after the same deterministic content-identity proof.

After wave 1 + SEO/billing, a glob-scan of the whole app surfaced **96 more real em-dashes** (the earlier per-line count overcounted comment interiors). Wave 2 cleaned **110 em-dashes across 42 more files**: guide disease-pages (IvTpa, IchManagement, StrokeBasics, MS, MG, GBS, Meningitis, Seizure/Weakness/AMS/Vertigo workups, StatusEpilepticus, Thrombectomy, guideline mindmap), the authoritative guideline mirror `src/data/aha2026StrokeGuideline.ts` (9 — recommendation-text punctuation only), CHA2DS2-VASc / Boston / ROPE calculators, clinical data (gcsScoreData, calculators, trialChainRegistry, mindmap data), and shared components.

Content-identity proven the same way (byte-identical alphanumerics after stripping punctuation). The reviewer scrutinized the highest-risk sites — the guideline mirror's COR 3 negations ("streptokinase should not be administered: does not improve…", "should not be used routinely: did not increase…"), the alteplase dosing line ("0.9 mg/kg IV (max 90 mg): 10% as bolus, 90% over 60 min"), IvTpa dosing/exclusion strings, COR badge displays, and list-flattening commas — and found **no line where the punctuation choice creates clinical ambiguity or inverts a contrast**. Every contrastive-looking em-dash preceded an elaboration or a coordinate independent clause, for which colon/semicolon is correct. Two COR-label changes are minor consistency improvements. No conditions.

**Gate made comprehensive:** `scripts/check-humanizer.mjs` TARGETS is now glob-based over all user-facing dirs (skips tests/dev/generated/verbatim-citation quotes); it passes on the whole cleaned app (0 ERROR) and is negative-tested to catch a regression in any guide page. Total across all waves: ~470 em-dashes removed; the user-facing app is em-dash-clean end-to-end.
