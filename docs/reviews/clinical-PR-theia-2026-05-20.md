# Clinical review — PR # THEIA trial entry authoring (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

New trial entry — THEIA (Préterre C, Gaultier A, Obadia M et al. on behalf of THEIA collaborators. Lancet Neurology 2025;24(11):909-919; DOI 10.1016/S1474-4422(25)00308-4; PMID 41109232; NCT03197194).

Surfaces changed:
- `src/data/trialData.ts` — new `'theia-trial'` entry.
- `src/data/trialListData.ts` — registered in `manualTrials`.
- `src/lib/citations/registry.ts` — new citations `preterre-theia-2025` and `mac-grory-aha-nanos-crao-2021` (the AHA/NANOS 2021 scientific statement that frames the pre-THEIA management).
- `src/lib/citations/claims.ts` — single claim `theia-crao-alteplase-2025` on DATA_SURFACE.
- `docs/evidence-packets/theia-2026-05-20.md`.

## Two task-list corrections recorded

1. **Journal/year**: V's earlier task list said "JAMA Neurology 2024." Verified citation is **Lancet Neurology 2025;24(11):909-919**. Documented in packet §1.
2. **Authorship**: V's earlier task list said "Mac Grory" as first author. Verified first author is **Préterre C**. Mac Grory wrote the 2021 AHA/NANOS scientific statement on CRAO management (co-cited as guideline anchor) — easy to confuse since both works are on CRAO.

## Semantic validity

PDF-verified per medical-scientist:
- Phase 3, multicenter (16 French stroke units), double-dummy, patient- + assessor-blinded, 1:1 randomised
- N=70 randomized; primary endpoint available for 56 (29 alteplase, 27 aspirin)
- **Primary endpoint:** visual acuity improvement ≥0.3 LogMAR (≥3 ETDRS Snellen lines / 15 letters) at 1 month
- **Result:** 19/29 (66%) alteplase vs 13/27 (48%) aspirin; unadjusted RD +17.4 pp (95% CI -11.8 to +46.5); adjusted OR 1.10 (95% CI 0.07-18.39); **P=0.95**
- Safety: 0 symptomatic ICH in both arms; 1 asymptomatic incidental haematoma (alteplase); 0 major bleeding related to treatment

**Taxonomy:**
- `primaryDesign: 'binary-superiority'`
- `primaryResult: 'not-met'`
- `trialResult: 'NEUTRAL'` — directionally favoring alteplase but underpowered (CI -11.8 to +46.5).

**NNT suppression**: correctly applied per `trial-statistics` skill. Primary did not meet superiority and CI spans the no-effect line widely. Reporting NNT would be misleading. `calculations` field omitted entirely.

**Honest framing checks:**
- Underpowered NEUTRAL framing is correct — directional favor for alteplase reported in pearls but not over-claimed.
- CRAO ischemia-tolerance window (~90-100 min vs brain's 4.5h) surfaced as a key clinical caveat.
- EAGLE (intra-arterial tPA for CRAO, 2010, harm signal) referenced as `historicalContext`.
- Ophthalmology + neurology intersection disclosed.
- Future trials TenCRAOS (NCT04526951) and REVISION (NCT04965038) flagged as forthcoming.

## Editorial / expert context (REQUIRED per commit 479f100)

- **§8a** Paired Lancet Neurology editorial "Treatment of acute central retinal artery occlusion: light at the end of the tunnel?" (Lancet Neurol 2025;24(11):894, DOI 10.1016/S1474-4422(25)00352-7) referenced. TODO-VERIFY: paywalled, author list not yet captured.
- **§8b** No post-publication letters within 6 months of November 2025 publication confirmed at authoring time. TODO-VERIFY for 2026.
- **§8c** AHA/NANOS 2021 Scientific Statement (Mac Grory et al., Stroke 2021;52:e282-e294, PMID 33677974) registered. ESO and AAO statements noted. Post-THEIA AAO update TODO-VERIFY (too recent).
- **§8d** EAGLE (Schumacher 2010) referenced; Schrag 2015 + Mac Grory 2020 IPD meta-analyses cited; TenCRAOS + REVISION named as the IPD partners pending.

§8 satisfied with explicit TODO-VERIFY annotations for timing-blocked items.

## Citation accuracy

`preterre-theia-2025`: DOI 10.1016/S1474-4422(25)00308-4, PMID 41109232. `mac-grory-aha-nanos-crao-2021`: PMID 33677974 (added as supporting guideline citation). Both with `last_reviewed: '2026-05-20'`, `review_window_months: 36`.

## Freshness

New entry. Within 36-month landmark-trial window.

## Schema compliance

- `source` field set ✓
- `conclusion` field set ✓
- Single `claimId` ✓
- `listCategory: 'thrombolysis'` (clean fit — IV alteplase trial) ✓
- No em-dashes in short V-facing fields ✓
- `calculations` field omitted (no NNT for underpowered non-significant primary — `trial-statistics` skill rule) ✓
- No `chainMembership` (Phase 2 timeline work) ✓

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS
- `npm run check:claims` → PASS
- `npm run check:chains` → PASS

## Rationale

Closes the THEIA gap V flagged as the last Tier 2 missing trial. The trial is small (N=70) and underpowered (CI extremely wide), but it's the first RCT in CRAO IV alteplase and the directional signal + safety profile (zero sICH) inform a forthcoming IPD meta-analysis with TenCRAOS and REVISION. Catalog now correctly frames it as NEUTRAL/directionally-favorable rather than POSITIVE.

## Required follow-ups

1. **Add "CRAO management" clinical question** to `trial-questions.ts` — would group THEIA + EAGLE + future TenCRAOS/REVISION. Class C-clinical-editorial follow-up.
2. **Update EAGLE entry** to cross-reference THEIA (different intervention IA vs IV; different outcome). Class C polish.
3. **Lancet Neurology editorial author** TODO-VERIFY at next freshness review.
4. **TenCRAOS/REVISION IPD meta-analysis** — add as entry when published. Future Class E task.

## Blocking issues

None.
