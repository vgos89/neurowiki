# Clinical review — ESCAPE-NA1 circulation territory fix

**Decision:** approve
**Reviewer:** clinical-reviewer (model: claude-opus-4-8)
**Date:** 2026-06-09

## Scope
- `escape-na1-trial` curated `inclusionCriteria` (1 line) in `src/data/trialData.ts` (~4841).
  - OLD: `'Acute ischemic stroke with LVO (anterior or posterior circulation)'`
  - NEW: `'Acute ischemic stroke with anterior-circulation LVO (intracranial ICA or M1)'`
- Pre-existing content (ESCAPE-NA1 was NOT part of the EVT enrichment wave; noticed incidentally). Surfaces: §13.3 structured data.

## Semantic validity
Accurate to source. ESCAPE-NA1 (Hill et al., Lancet 2020;395:878–887; NCT02930018, DOI 10.1016/S0140-6736(20)30258-0), p.880 Methods: eligibility required "a confirmed proximal intracranial artery occlusion, defined as an occlusion of the intracranial internal carotid artery, the first segment of the middle cerebral artery, or both" — anterior-circulation only; ASPECTS + MCA-pial collateral selection (anterior measures); no posterior/basilar enrollment. The prior "anterior or posterior" was a factual population error (same pattern as MR CLEAN-NO IV / RESCUE BT). Record now internally consistent on territory: no other ESCAPE-NA1 surface (clinicalContext, cautions, bottomLineSummary, howToInterpret, keyMessage) claims posterior circulation. No never-drift category affected; stats, null overall result, and alteplase-subgroup interpretation untouched.

## Citation accuracy
Hill Lancet 2020 p.880 supports anterior-only (ICA / M1). NCT/DOI in record resolve, untouched.

## Editorial / expert context (§8)
Not applicable — single-line copy correction to a pre-existing entry; no new-trial entry, no Class-E logic change.

## Freshness
n/a — no `last_reviewed`/citation record touched.

## Rationale
Confined one-line population correction removing a false posterior-circulation claim, source-verified, record internally consistent. No mandatory-block condition. Approve.

## Required follow-ups
None blocking. Parked lower-severity items (RESCUE BT NIHSS floor; SKIP mRS 0–1 vs 0–2; SELECT2 NIHSS-floor) remain parked.
