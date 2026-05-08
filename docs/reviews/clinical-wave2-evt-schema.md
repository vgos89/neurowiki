# Clinical review — Wave 2 of Batch 2 EVT audit (`primaryDesign` / `primaryResult` / `applicability`)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4)
**Date:** 2026-05-08

## Scope
- Claims touched: none — no rendered clinical-language claim text edited. Structural metadata authoring only.
- Citations affected: none — no citation IDs, `last_reviewed` dates, or `claims.ts` entries altered.
- Surfaces changed: §13.3 "Structured data in `src/data/*.ts`" — three new typed fields (`primaryDesign`, `primaryResult`, `applicability`) populated on 27 EVT trial entries; one new enum literal `bayesian-superiority` added to `primaryDesign` and `secondaryDesign` union types.

## Semantic validity

All five never-drift categories checked against each of the 27 trials. Medical-scientist independently verified all DOIs and design classifications against PubMed in this session.

**Recommendation strength:** No recommendation strength markers authored. `applicability.populationExclusions` notes use scoping language that downgrades extrapolation (safe direction). No upgrade detected.

**Action verbs:** No treatment-imperative language in new fields.

**Qualifiers and gates:** Every flagged trial preserves critical qualifiers in `applicability`:
- DAWN: age-strata/NIHSS/core-volume gates spelled out exactly; Trevo-only caveat; 6–24h window explicit
- DIRECT-MT / DEVT: geography (China), permissive NI margins, explicit "not adopted in US/European guidelines" present
- LASTE / TENSION: ASPECTS thresholds, time windows, early-stop caveats preserved
- ATTENTION/BAOCHE: BAO-only, NIHSS ≥10, windows (≤12h vs 6–24h), mRS 0-3 endpoint justified explicitly
- CHOICE: N=121, COVID early-stop, eTICI ≥2b post-EVT only — every fragility flag present
- ESCAPE-MeVO / DISTAL: sICH signals (5.9% vs 2.6%) carried into structured data; negative result not laundered

**Certainty markers:** `noninferiority-established` correctly distinguished from `met`; `noninferiority-not-established` correctly distinguished from `not-met`. DAWN's `bayesian-superiority` corrects a pre-existing semantic ambiguity — `bayesian-noninferiority` would have been a certainty-marker drift violation (non-inferiority ≠ superiority).

**Temporal constraints:** All time windows preserved across all 27 trials.

**Specific items from brief:**

1. **EXTEND-IA dual-primary** — `primaryDesign: 'binary-superiority'` (reperfusion) + `secondaryDesign: 'ordinal-shift'` (mRS) faithful to published design. Acceptable.

2. **THRACE** — `populationExclusions` entry "NOT a direct-EVT vs bridging-EVT comparison" present in uppercase at top of list. Load-bearing clinical clarification is present. Acceptable.

3. **DIRECT-MT / DEVT `noninferiority-established`** — clinically defensible because applicability notes carry the limitations (permissive margins, China-only, Western guidelines caveats) explicitly. Acceptable.

4. **CHOICE `binary-superiority` / `met`** — trial did meet its registered primary endpoint. Fragility captured in `populationExclusions` and unchanged prose. `not-met` would misrepresent the published result. Acceptable.

5. **DAWN `bayesian-superiority`** — correct. `bayesian-noninferiority` would have been a certainty-marker drift violation. Applicability note flags "not a frequentist p-value." Acceptable.

6. **ATTENTION / BAOCHE `mRS 0-3`** — mRS 0-3 appropriate for BAO natural history; explicit justification in applicability note ("unrealistically strict for BAO"). Acceptable.

## Citation accuracy
No citation records modified. PubMed DOI verification completed by medical-scientist this session.

## Freshness
No `last_reviewed` dates touched. Not applicable.

## Rationale
Structural metadata PR adding design/result/applicability fields to 27 EVT trials. Five never-drift categories checked across all 27 — no drift detected. New `bayesian-superiority` enum value corrects a pre-existing semantic ambiguity. `applicability` notes preserve the clinical caveats (geography, NI margins, early-stopping fragility, device generalizability, time windows, BAO endpoints) that downstream renderers will need. No mandatory-block conditions triggered.

## Required follow-ups
- None blocking. When renderer consuming `primaryDesign`/`primaryResult` ships, route that PR to clinical-reviewer to verify `noninferiority-established` does not visually equate to `met` and `bayesian-superiority` does not render as a frequentist p-value.
- Recommend adding an ADR note documenting why `bayesian-superiority` is a distinct enum value from `bayesian-noninferiority` — non-blocking Class B-clinical doc task.
