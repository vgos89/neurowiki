# Clinical review — PR # IST + CAST paired authoring (foundational 1997 aspirin) (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

Two new trial entries — the 1997 foundational aspirin-in-acute-stroke pair:
- **IST** (Sandercock PAG et al., for the IST Collaborative Group. Lancet 1997;349:1569-1581; DOI 10.1016/S0140-6736(97)04011-7; PMID 9174558; N=19,435)
- **CAST** (CAST Collaborative Group. Lancet 1997;349:1641-1649; DOI 10.1016/S0140-6736(97)04010-5; PMID 9186381; N=21,106)

Combined N≈40,500 — among the largest stroke RCTs in history and the foundation of every modern aspirin-in-acute-stroke recommendation.

## Per-trial primary endpoints (verified from PDFs)

**IST** — co-primary: (1) death within 14 days; (2) death or dependency at 6 months. Aspirin signal: 14-day death/non-fatal recurrent stroke 11.3% vs 12.4% (2p=0.02, 11 fewer per 1000); 6-month death/dependence 62.2% vs 63.5% (adjusted 2p=0.03, 14 fewer per 1000). Heparin signal: NO net 6-month benefit, +8 per 1000 hemorrhagic stroke, +9 per 1000 transfused/fatal extracranial bleeds.

**CAST** — co-primary: (1) 4-week mortality; (2) death or dependence at discharge. Mortality 3.3% vs 3.9% (2p=0.04, 14% proportional reduction). Combined 4-week death or non-fatal stroke 5.3% vs 5.9% (2p=0.03). Discharge dead-or-dependent 30.5% vs 31.6% (2p=0.08, trend).

## Semantic validity

- `primaryDesign: 'binary-superiority'` ✓ (both)
- `primaryResult: 'met'` ✓ (both)
- `trialResult: 'POSITIVE'` ✓ (both)
- `listCategory: 'antiplatelets'` ✓
- Small absolute benefits at massive N — robust evidence despite small individual ARR.
- Heparin arm context in IST: factorial 2x2 design; heparin arms showed no net benefit + increased ICH. Documented as the central "IST argued AGAINST routine heparin" framing in `keyMessage`, `pearls`, `safetyData`, `harmSignal`, `conclusion`, `educationalContext`.
- Pre-NINDS / pre-alteplase context: modern aspirin timing (delay 24h after IV thrombolysis) explicitly stated in both entries.
- Geographic generalizability disclosed (IST 36 countries Western/Australasian; CAST 413 Chinese hospitals).

## Editorial / expert context (REQUIRED per commit 479f100)

- **§8a Lancet 1997 companion editorials** — page references captured (IST: "See Commentary page 1564"; CAST: parallel commentary same June 1997 cluster). Author-level citation TODO-VERIFY (Tier 2 paywalled).
- **§8b Post-publication Lancet letters** — Lancet vol. 350, 1997 cluster noted; specific letter-level citations TODO-VERIFY (non-blocking; Chen 2000 pooled analysis is the canonical modern reference).
- **§8c Guideline incorporation** — progressive chain documented: Adams 1997 → Adams 2007 → Jauch 2013 → Powers 2018/2019 → 2026 (placeholder §4.10 pending WebFetch). ESO and Chinese Stroke Association also cite.
- **§8d Meta-analyses** — **Chen ZM et al., Stroke 2000;31:1240-1249, PMID 10835439** is the THE canonical IST+CAST pooled analysis (modern guideline citation). Plus Antithrombotic Trialists' Collaboration BMJ 2002. Plus Sandercock Cochrane 2014 (PMID 24668137).

§8 satisfied; TODO-VERIFY items are paywalled-historical-commentary or pending-recheck.

## Citation accuracy

`sandercock-ist-1997`: DOI 10.1016/S0140-6736(97)04011-7, PMID 9174558. `cast-1997`: DOI 10.1016/S0140-6736(97)04010-5, PMID 9186381. Both `last_reviewed: '2026-05-20'`, `review_window_months: 36`. Quoted text verbatim from each PDF abstract.

## Freshness

New entries. Historic landmark trials (1997). Within 36-month landmark window per §13.7.

## Schema compliance

- `source` field set on both ✓
- `conclusion` field set on both ✓
- Single `claimId` per entry ✓
- `harmSignal` populated on IST (heparin caveat); omitted on CAST (no harm at that level) ✓
- No em-dashes in short V-facing fields ✓
- No `archetypeId` (legacy layout — acceptable for 1997 historic landmarks pending Archetype rebuild) ✓
- No `chainMembership` (Phase 2 timeline work) ✓

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Foundational addition. The audit (artifact 01 line 29) explicitly called for IST + CAST as foundational antiplatelet timeline predecessors. With these landed, the antiplatelet chain can be wired in Timeline Phase 2 (CAPRIE → ESPS-2 → PRoFESS → IST/CAST → CHANCE/POINT → THALES → CHANCE-2 → INSPIRES).

## Required follow-ups

1. **"Should I give aspirin in the ED for acute ischemic stroke?" question** — does not exist in `trial-questions.ts`. IST/CAST belong there + CHANCE/POINT/THALES for DAPT contrast. Class C-clinical follow-up.
2. **Chen 2000 pooled IST+CAST analysis** is a candidate for its own entry — it's the clinically-cited evidence the guidelines use. Class C-clinical.
3. **AHA/ASA 2026 section number** for the early-aspirin Class I, Level A — TODO-VERIFY at next WebFetch of the full guideline.

## Blocking issues

None.
