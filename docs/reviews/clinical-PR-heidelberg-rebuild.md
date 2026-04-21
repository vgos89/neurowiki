# Clinical review — Heidelberg Bleeding Classification rebuild (pre-execution)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-04-21
**Phase:** 3 — pre-execution gate (Phase 5 post-execution diff to follow)

## Scope
- Claims touched: none (zero prose changes). All eight `clinicalSignificance` strings, all eight `managementNote` strings, the runtime SICH append string in `classifyHeidelbergBleeding()`, the scope callout, and `HEIDELBERG_CITATION` are preserved byte-for-byte. No claim IDs are created or modified by this rebuild; Heidelberg claim tagging (`data-claim` / `claimId` fields per §13.4) is out of scope here and tracked separately for Wave 5 backfill.
- Citations affected: `HEIDELBERG_CITATION` (von Kummer R et al., Stroke 2015;46(10):2981–2986, doi 10.1161/strokeaha.115.010049) — unchanged.
- Surfaces changed: structured data in `src/data/heidelbergBleedingData.ts` (additive exports only — `HEIDELBERG_SEVERITY_MAP`, `HeidelbergSeverity`, `HeidelbergCalculatorResult`, `calculateHeidelberg()`); static JSX in `src/pages/HeidelbergBleedingCalculator.tsx` (full rebuild to Archetype 1). No new claim surfaces introduced — the rebuild moves existing claim text between presentation slots, it does not create derived clinical language, template-string composition, or new prose. §13.3 coverage is unchanged.

## Semantic validity

Reviewed the proposed drawer-field mapping against all eight classification entries:

```
label          ← classification        (e.g. "Class 2 (PH2)")
stat           ← SICH status           ("Symptomatic (SICH)" | "Asymptomatic (aSICH)" | null)
interpretation ← clinicalSignificance  (passthrough)
explanation    ← managementNote        (passthrough, SICH-appended at runtime)
```

**Per-class headline test (`clinicalSignificance` → drawer `interpretation`):** all eight read as appropriate headlines. Each begins with a factual anatomic/morphologic descriptor and ends with a relatedness statement — this is the correct shape for a bedside headline: *what is it?* followed by *what does it mean?* No fragments, no lost context. Classes 1a, 1b, 1c, 2, 3a, 3b, 3c, 3d all confirmed.

**Per-class paragraph test (`managementNote` → drawer `explanation`):** all eight read as coherent single paragraphs. When `symptomatic = true`, the runtime append — *"Symptomatic ICH (SICH): consider ≥4 pt NIHSS increase or ≥2 pt in one subcategory or intervention (intubation, hemicraniectomy, EVD); document relatedness to reperfusion."* — extends the paragraph cleanly; the leading space and capitalized "Symptomatic" make the concatenation grammatical. No truncation, no orphaned clauses. The SICH text is medically accurate per ECASS II / Heidelberg consensus and correctly names the ≥4 NIHSS / ≥2 single-subcategory / intervention thresholds.

**Drawer-header `label` test:** using `classification` (e.g., "Class 2 (PH2)") as the drawer-collapsed label is clinically appropriate. The parenthetical anchors the item to its literature identifier (PH1, PH2, HI1, HI2), which is the form trainees will encounter in published papers. Combined with the SEVERITY_MAP-driven border color, a collapsed drawer showing "Class 2 (PH2) · Symptomatic" communicates tier, identity, and SICH status in one glance — sufficient for bedside triage. Approved.

**SICH stat rendering:** when `symptomatic = null` (no toggle interaction), `stat` is null and the drawer header omits the ` · ` separator and right-side text. When true/false, stat reads "Symptomatic (SICH)" or "Asymptomatic (aSICH)". This is the semantically correct disambiguation — "Class 2 (PH2) · Symptomatic (SICH)" tells the clinician this is PH2-with-deterioration, which is the most-feared post-tPA outcome. Approved.

**Flagged item (non-blocking):** The 3c entry contains the phrase *"distinguish from aneurysm rupture if convexity/circumstantial"* — the word "circumstantial" is awkward and likely intended to mean "if the clinical circumstances suggest non-reperfusion etiology." This prose is preserved byte-for-byte under the rebuild contract and is NOT a block for this PR. Logging as a follow-up for a future Class C-clinical copy-polish task routed through `content-writer`.

## Citation accuracy

`HEIDELBERG_CITATION` is unchanged by this rebuild. Source attribution (von Kummer R, Broderick J, Campbell B et al., *The Heidelberg Bleeding Classification*, Stroke 2015;46(10):2981–2986, DOI 10.1161/strokeaha.115.010049) is correct per PubMed and matches the original consensus paper. The existing citation rendering in the result card footer will continue to render this object through the same pattern that GCS/ICH Score use after the rebuild — confirmed appropriate; no schema mismatch. No quoted-text fields are in use for this citation, so no byte-for-byte quote check is applicable.

## Freshness

`HEIDELBERG_CITATION` does not currently carry a `last_reviewed` field — this is consistent with the pre-Wave-5 citation shape used by GCS, ICH, and the other currently-shipped calculators, which predate §13 citation schema adoption. This rebuild is structural/visual and deliberately does not alter citation metadata. Freshness backfill for pre-Wave-5 citations is tracked separately under the W5.x citation-registry migration task; blocking this rebuild on the backfill would scope-creep an Archetype 1 visual rebuild into a citation-schema migration, which is the wrong shape.

Per §13.7, landmark classification-establishing trials have a 36-month default window; the Heidelberg consensus paper (2015) is the foundational classification itself and is stable. When the W5.x backfill task reaches Heidelberg, the reviewer should confirm (a) the classification has not been superseded by a newer consensus document (as of 2026-04-21 it has not), (b) URL/DOI still resolves, (c) the eight class definitions in `RESULT_MAP` still match the 2015 paper. That check is not a blocker for the present rebuild.

## Rationale

The rebuild is a visual/structural refactor against CALCULATOR_SPEC v1.1 Archetype 1 with zero clinical prose changes. Every clinical sentence — the eight `clinicalSignificance` strings, the eight `managementNote` strings, the SICH append, the scope callout, and the citation — is preserved byte-for-byte. The architect's decision to extend the data module additively (rather than in-component adaptation) means all clinical content continues to live in one auditable file next to its citation. The drawer-field mapping is clinically sound across all eight classes: headlines read as headlines, paragraphs read as paragraphs, and the SICH append concatenates grammatically. The SEVERITY_MAP has already been approved by `medical-scientist` against primary literature and is clinically appropriate for bedside color-token triage. No semantic risks identified.

## Required follow-ups

- **Phase 5 post-execution diff gate (mandatory):** clinical-reviewer must diff `src/data/heidelbergBleedingData.ts` before/after to confirm only additions at the bottom of the file — no deletions, no edits to `HEIDELBERG_CITATION`, `HEIDELBERG_OPTIONS`, `RESULT_MAP`, `classifyHeidelbergBleeding`, or the SICH append string. Any non-additive change flips this approval to block.
- **Scope callout verbatim preservation:** confirm in Phase 5 that the exact text (*"This classification is for hemorrhagic transformation after ischemic stroke and reperfusion therapy (tPA or thrombectomy). It is not for spontaneous ICH location. Use brain imaging within 48 hours of reperfusion and as needed for new symptoms."*) is rendered unchanged at top-of-main.
- **SICH toggle rendering:** Phase 5 must visually verify that when the symptomatic toggle is null the drawer header omits the ` · ` separator, and when toggled the stat text reads "Symptomatic (SICH)" / "Asymptomatic (aSICH)" exactly.
- **3c copy-polish follow-up (non-blocking):** open a Class C-clinical task for `content-writer` to propose a revision of *"distinguish from aneurysm rupture if convexity/circumstantial"*. Out of scope for this rebuild.
- **Heidelberg claim tagging (non-blocking):** tracked under the W5.x claim-registry backfill. Not a blocker because no new claim surfaces are introduced by this rebuild.

## Blocking issues

None for Phase 3. The approve-with-conditions decision is conditioned on the Phase 5 post-execution diff gate confirming zero prose drift; if the diff shows any non-additive change to existing clinical strings, the clinical-reviewer Phase 5 artifact will flip to `block` and the merge is halted pending correction.

---

# Clinical review — Heidelberg Bleeding Classification rebuild (post-execution)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-sonnet-4-6)
**Date:** 2026-04-21
**Phase:** 5 — post-execution diff gate

## Scope re-verified

- Files touched: `src/data/heidelbergBleedingData.ts` (additive), `src/pages/HeidelbergBleedingCalculator.tsx` (full rewrite), `docs/link-graph.json` (calc/heidelberg promoted from stubs to nodes).
- No new claim surfaces introduced.
- No changes to `HEIDELBERG_CITATION` fields.

## Prose preservation verification

### `src/data/heidelbergBleedingData.ts` — additive-only diff

`git diff HEAD -- src/data/heidelbergBleedingData.ts` diff header: `@@ -109,3 +109,73 @@`. This header means: 3 lines of unchanged context at line 109, then 73 lines added. **Zero deletions, zero modifications above line 109.** All existing exports are byte-for-byte preserved:

- `HEIDELBERG_CITATION` object — unchanged
- `HeidelbergClass` type — unchanged
- `HeidelbergInputs` type — unchanged
- `HeidelbergResult` interface — unchanged
- `HEIDELBERG_OPTIONS` array (8 entries with `label` + `description`) — unchanged
- `RESULT_MAP` (8 entries with `classification` + `shortLabel` + `clinicalSignificance` + `managementNote`) — unchanged
- `classifyHeidelbergBleeding()` function including the SICH append string — unchanged

New additive exports at lines 110+:
- `HeidelbergSeverity` type
- `HEIDELBERG_SEVERITY_MAP` const (approved mapping, 3c=high)
- `HeidelbergCalculatorResult` interface
- `calculateHeidelberg()` function (wraps `classifyHeidelbergBleeding()`; passthrough for `interpretation` ← `clinicalSignificance`, `explanation` ← `managementNote`)

**Conclusion:** additive-only. No clinical prose drift.

### Scope callout — verbatim preservation

The rebuilt component at `src/pages/HeidelbergBleedingCalculator.tsx` renders the scope callout text exactly:

> This classification is for hemorrhagic transformation after ischemic stroke and reperfusion therapy (tPA or thrombectomy). It is not for spontaneous ICH location. Use brain imaging within 48 hours of reperfusion and as needed for new symptoms.

Verified by `grep -A 4 "This classification is for"`. Text matches Phase 3 conditioning byte-for-byte. Callout uses the approved §4.5-style anatomy in the top-of-main position documented in ADR-004.

### SICH stat rendering — exact strings

`grep "Symptomatic (SICH)\|Asymptomatic (aSICH)"`:
- `src/data/heidelbergBleedingData.ts:167` — `? 'Symptomatic (SICH)'`
- `src/data/heidelbergBleedingData.ts:169` — `? 'Asymptomatic (aSICH)'`
- `src/pages/HeidelbergBleedingCalculator.tsx:92` — `label: 'Asymptomatic (aSICH)'`
- `src/pages/HeidelbergBleedingCalculator.tsx:93` — `label: 'Symptomatic (SICH)'`

All four sites render the exact strings specified in the Phase 3 mapping. When `symptomatic` is undefined, `calculateHeidelberg()` returns `stat: null` and the drawer header omits the ` · ` separator (verified in component's drawer render logic: `{result.stat && (<>...</>)}`).

### Spec-compliance secondary checks (not clinical but relevant)

- `grep -c "dark:\|border-2" HeidelbergBleedingCalculator.tsx` → 0. Compliance gates pass.
- Component uses `.selected-option` class, `divide-y divide-slate-200` for option rows, `createPortal` for drawer, `neuro-500` Copy button. Matches GCS/ICH template.

## Rationale

The post-execution diff confirms every Phase 3 precondition: (a) existing clinical prose byte-for-byte preserved — no edits to RESULT_MAP, HEIDELBERG_OPTIONS, classifyHeidelbergBleeding, SICH append, or HEIDELBERG_CITATION; (b) scope callout text verbatim in the rebuilt component; (c) SICH stat strings exactly "Symptomatic (SICH)" / "Asymptomatic (aSICH)". The additive extension pattern honored the "preserve as-is" instruction strictly — new exports sit below existing code and wrap rather than replace. No clinical review conditions triggered.

## Decision

Approve. The rebuild preserves all clinical prose byte-for-byte. Merge may proceed after Phase 6 QA gates pass.

## Follow-ups carried forward (non-blocking, not for this PR)

- Class C-clinical copy-polish task for `content-writer` on "distinguish from aneurysm rupture if convexity/circumstantial" (class 3c clinicalSignificance) — carried forward.
- W5.x claim-tagging backfill for Heidelberg prose surfaces — carried forward.
- W5.x citation-registry migration to add `last_reviewed` to `HEIDELBERG_CITATION` — carried forward.
