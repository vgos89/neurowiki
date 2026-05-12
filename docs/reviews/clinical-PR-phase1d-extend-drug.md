# Clinical review — PR #phase1d

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-7)
**Date:** 2026-05-11

## Scope
- Claims touched: EXTEND trial Clinical Context sentence (intervention, time window, imaging selection) in `guideContent.ts` and `trialData.ts`
- Citations affected: Ma et al. NEJM 2019;380(19):1795-1803 (PMID 31067369, DOI 10.1056/NEJMoa1813046)
- Surfaces changed: structured data in `src/data/guideContent.ts` (template-string clinical copy + source link); structured data in `src/data/trialData.ts` (`clinicalContext` field)
- Evidence-verifier packet: `docs/evidence-packets/phase1d-extend-drug.md`
- Trial-statistician report: not applicable (statistics display unchanged; mRS 0-1 and sICH values untouched)

## Semantic validity

**Edit 1 — guideContent.ts:70 and trialData.ts:666 (clinicalContext sentence):**
- Prior text stated EXTEND tested desmoteplase — factually incorrect. EXTEND tested IV alteplase (confirmed HIGH confidence against NEJM 2019 primary source). Desmoteplase was the DIAS/DIAS-2 agent.
- New text accurately states drug (IV alteplase), time window (4.5–9 hours; wake-up within 9 hours of sleep midpoint), and selection method (CT or MR perfusion, small core, salvageable penumbra) — all verified against the primary publication and internally consistent with other fields in both data objects (intervention.treatment: "IV Alteplase (0.9 mg/kg)" in trialData.ts; Population row in guideContent.ts).
- All five never-drift categories: PASS. This is a correction of a never-drift violation in the prior text (wrong drug identity = never-drift category: intervention).

**Edit 2 — guideContent.ts:89 (DOI):**
- DOI `NEJMoa1910355` pointed to a different NEJM paper. Corrected to `NEJMoa1813046` (Ma et al. EXTEND primary publication). Citation accuracy fix only; no clinical claim change.

**aha2026StrokeGuideline.ts:353** (not changed): the statement "IV desmoteplase should not be used routinely for eligible patients with AIS presenting 3–9 hours from last known normal" is a correct guideline statement per AHA/ASA 2026 — desmoteplase is referenced in the guideline precisely because it should NOT be used. This file was correctly left untouched.

## Citation accuracy
- Ma et al. NEJM 2019 (PMID 31067369): title, DOI, year, and results all consistent with corrected text. Source link now resolves to correct paper. Results block (35.4% vs 29.5% mRS 0-1, adj RR 1.44, P=0.04; sICH 6.2% vs 0.9%) was already accurate and untouched.
- Pooled ECASS-4/EPITHET reference removed from clinicalContext — correctly identified as a separate IPD meta-analysis (Campbell et al. Lancet 2019, PMID 31128925), not part of EXTEND. If surfaced in future, should be a distinct entry.

## Freshness
- EXTEND (NEJM 2019): landmark trial; 36-month window (§13.7). Stable results, no superseding evidence identified. PASS.

## Rationale
Two edits across two files (plus a DOI fix) correct a factual error — wrong drug attribution — that contradicted the trial's own intervention field in the same data object. The correction is internally consistent, HIGH confidence from primary source, and moves content from factually wrong to factually correct without any drift. Clinical-reviewer decision: approve without conditions.

## Required follow-ups
- When registry.ts ships (W5.2), register `extend-2019` citation with correct DOI `10.1056/NEJMoa1813046`, PMID `31067369`, and `quoted_text` from the primary results.
- If Campbell et al. 2019 IPD meta-analysis (PMID 31128925) is to be surfaced, open a separate Class C-clinical task for a new entry in guideContent.ts and/or trialData.ts — do not re-attach to EXTEND entry.
