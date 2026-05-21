# Clinical review — PR # CREST-2 trial entry authoring (2026-05-20)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **New trial entry:** CREST-2 (Brott TG, Howard G, Lal BK, et al. for the CREST-2 Investigators. NEJM 2026;394(3):219–231; online 2025-11-21; DOI 10.1056/NEJMoa2508800; PMID 41269206; NCT02089217).
- **Surfaces changed:**
  - `src/data/trialData.ts` — new `'crest-2-trial'` entry.
  - `src/data/trialListData.ts` — `manualTrials` registration (`surgical-interventions` category, matching CREST 2010 precedent).
  - `src/lib/citations/registry.ts` — new `brott-crest-2-2025` citation.
  - `src/lib/citations/claims.ts` — single claim `crest-2-asymptomatic-2025` on DATA_SURFACE.
- **Evidence packet:** `docs/evidence-packets/crest-2-2026-05-20.md`.

## Structural choice: Option A (single entry, both arms documented)

CREST-2 published as TWO parallel RCTs: a stenting trial (CAS vs intensive medical management) and an endarterectomy trial (CEA vs intensive medical management), both in asymptomatic ≥70% stenosis. The two arms have **different primary results**:

- **Stenting trial (N=1,245):** medical 6.0% vs stenting 2.8%, RR 2.13 (1.15–4.39), **P=0.02** — stenting reduced 4-year composite, primary MET in favor of stenting.
- **Endarterectomy trial (N=1,240):** medical 5.3% vs CEA 3.7%, RR 1.43 (0.78–2.72), **P=0.24** — primary NOT met.

Option A chosen: single entry with `primaryDesign: 'binary-superiority'`, `primaryResult: 'met'`, `trialResult: 'POSITIVE'` reflecting the stenting arm's significant result. The CEA arm's not-met result is surfaced exhaustively in `clinicalContext`, `pearls`, `safetyData`, `limitations`, `howToInterpret`, `bottomLineSummary`, and `conclusion`. Both arms equally visible.

**Acceptable for shipping.** If a future clinical-reviewer pass prefers Option B (split into two entries), the refactor is straightforward.

## Semantic validity

PDF-verified per medical-scientist's read. Composite primary endpoint = any stroke or death through day 44 OR ipsilateral ischemic stroke through 4 years. Final α=0.047 after pre-specified interim adjustment. All numbers cited match the PDF.

**Honest framing checks:**
1. Both arms surfaced (not just the positive stenting result).
2. The modern-medical-management context is the clinical lead — CREST-2 effectively asks whether revascularization adds anything over current statin + antithrombotic + BP control + lifestyle modification. Stenting passed; CEA did not.
3. Operator credentialing caveat (same as CREST 2010) flagged — real-world CAS/CEA outcomes outside credentialed environments may differ.
4. Lineage placement: SAPPHIRE (2004) → ACAS (1995) → ACST (2004/2010, ACST-2 2021) → CREST 2010 (mixed symptomatic + asymptomatic) → ACT-1 (2016) → CREST 2016 extended → **CREST-2 (2026)** closes the asymptomatic question vs modern medical management.
5. No em-dashes in V-facing prose.

## Editorial / expert context (REQUIRED per commit 479f100)

- **§8a Accompanying NEJM editorial:** DOI 10.1056/NEJMe2515725 referenced from the audit. Full citation TODO-VERIFY (NEJM 403 + PubMed not yet indexing the editorial as of 2026-05-20). Acceptable per §8 rule — "stated method" documented.
- **§8b Post-publication NEJM letters:** none retrievable yet (six months post-online publication). TODO-VERIFY at next freshness review.
- **§8c Subsequent guideline incorporation:** pre-CREST-2 framing documented (AHA/ACC 2017 hypertension; SVS 2022; ESVS 2023). Post-CREST-2 guideline updates TODO-VERIFY at next freshness review — too recent.
- **§8d Lineage and contradicting evidence:** ACAS, ACST, ACST-2, ACT-1, SPACE-2, ECST-2, Oxford Vascular Study, CREST 2010 — all cited with PMIDs/DOIs in the packet.

§8 satisfies the hard requirement with explicit TODO-VERIFY annotations for the three sub-items that are timing-blocked rather than missing.

## Citation accuracy

`brott-crest-2-2025`: DOI 10.1056/NEJMoa2508800. PMID 41269206. `last_reviewed: '2026-05-20'`. `review_window_months: 36`.

## Freshness

New entry. Within 36-month landmark-trial window. Multiple TODO-VERIFY items flagged for the next 36-month review cycle because the trial is recent and downstream literature is still landing.

## Conditions for approval (non-blocking)

1. **Option A vs Option B**: V or a future clinical-reviewer may prefer Option B (two separate entries) if the catalog grows to need per-arm question hub linkage. Documented refactor path in the entry's file comment. **Not blocking** — current Option A surfaces both arms.
2. **archetypeId omitted**: legacy layout used. Acceptable because A (DeltaBand), B (GrottaBar), G (Benchmark) don't cleanly fit a two-arm parallel-trial design. Rationale documented in the entry's file comment.
3. **Trial-questions integration**: no existing "asymptomatic carotid stenosis" question. Parking-lot follow-up similar to ANNEXA-I.

## Schema compliance

- `listCategory: 'carotid'` — valid TrialCategoryKey ✓
- `conclusion` field set ✓
- Single `claimId` per entry ✓
- `chainMembership` deliberately omitted (Phase 2 timeline work) ✓
- No em-dashes ✓

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Closes the carotid chain that CREST 2010 opened. CREST-2 is THE trial that addresses whether modern intensive medical management has caught up with revascularization for asymptomatic disease. The differential result (stenting met, CEA not met) creates a fascinating clinical decision space that NeuroWiki should surface honestly.

## Required follow-ups

1. NEJM editorial + post-publication letters + post-CREST-2 guideline updates — fill at next 36-month freshness review.
2. Consider adding an "asymptomatic carotid stenosis" question — Class C-clinical-editorial follow-up.
3. Consider Option B refactor (per-arm entries) if catalog needs per-arm question hub linkage.

## Blocking issues

None.
