# Clinical review — PR # PRoFESS trial entry authoring (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **New trial entry:** PRoFESS (Sacco et al. NEJM 2008;359(12):1238–1251) added to `src/data/trialData.ts` at key `'profess-trial'` (~205 lines), inserted after the CHANCE-2 entry to keep antiplatelet cluster together.
- **Citation registry:** new entry `profess-sacco-2008` added to `src/lib/citations/registry.ts`.
- **Claim registry:** new claim `profess-clopidogrel-vs-asa-erdp-ni-2008` → `[profess-sacco-2008]` mapping added to `src/lib/citations/claims.ts` on the `DATA_SURFACE`.
- **Schema change:** `TrialMetadata.claimId?: string` field added to the interface in `src/data/trialData.ts` to support CLAUDE.md §13.4 Phase 1 data-surface tagging. Backwards-compatible (optional).
- **Evidence packet:** `docs/evidence-packets/profess-2026-05-20.md` (releasable, all primary and key safety numbers verified against PMC2714259).

## Semantic validity

Every primary and key safety number in the entry traces to the verified PMC2714259 full text per the evidence packet:

- n=20,332 (ASA–ERDP 10,181; clopidogrel 10,151)
- Primary outcome: first recurrent stroke any type — 9.0% vs 8.8%, HR 1.01 (95% CI 0.92–1.11)
- NI margin pre-specified at HR 1.075; upper CI bound 1.11 exceeded margin → NI NOT established
- ICH: 1.4% vs 1.0%, HR 1.42 (1.11–1.83) — significant harm signal with ASA–ERDP
- Discontinuation: 29.1% vs 22.6%, P<0.001
- Mean follow-up 2.5 years
- AHA/ASA 2021 Secondary Prevention Guideline Class I monotherapy framing preserved

**NI-not-established framing:** verified in both required surfaces. `howToInterpret.proves` and `bottomLineSummary` both state explicitly that the upper CI bound crossed the prespecified margin and noninferiority was not formally established. Banned terms ("equivalent", "as good as", "comparable", "non-inferior to") do not appear in V-facing prose regarding the primary outcome. ("Comparable" appears once in `safetyData` describing all-cause mortality 7.3% vs 7.4%, a separate secondary safety outcome — acceptable scoped use.)

**Lineage placement:** CAPRIE (1996) → ESPS-2 (1996) → PRoFESS (2008) → CHANCE (2013) / POINT (2018) — placed in `clinicalContext`, `educationalContext`, `pearls`, and `howToInterpret.doesNotProve`. PRoFESS is correctly framed as the head-to-head of two long-term monotherapies, NOT a DAPT trial.

**Sponsor disclosure:** Boehringer Ingelheim role appears in `limitations` and `pearls`.

## NNT compliance with build-time guard

The `calculations` block is **omitted entirely** with an inline code comment marking the deliberate omission. `trialDesign.nnt` is also omitted with explanatory comment. The Tier 3 #18 build-time NNT guard (commit `7956087`) does NOT trip on PRoFESS because `calculations.nnt` is unset and `primaryDesign: 'noninferiority'` is in the disallowed set — the guard only fails if both conditions hold. Verified by running `npm run check:claims` to PASS.

## Citation accuracy

Sacco RL et al. NEJM 2008;359(12):1238–1251. DOI 10.1056/NEJMoa0805002. PMID 18753638. PMCID PMC2714259. NCT00153062. All verified by evidence-verifier against the live PMC resource. `last_reviewed: 2026-05-20`. `review_window_months: 36` (trial default per §13.7).

## Freshness

New entry; `last_reviewed: 2026-05-20`; first review of source; within 36-month landmark-trial window. No staleness concern.

## Citation surface tagging

Per CLAUDE.md §13.4 Phase 1, the `data` surface uses adjacent `claimId: string` field. The `TrialMetadata` interface previously did not expose this field — added as `claimId?: string` (optional, backwards-compatible). The PRoFESS entry carries `claimId: 'profess-clopidogrel-vs-asa-erdp-ni-2008'` which registers in `CLAIM_REGISTRY` and resolves to citation `profess-sacco-2008`. Pre-commit hook `npm run check:claims` PASSES.

This is the first TrialMetadata entry to use the typed `claimId` field. Future trial entries with clinical claims should follow the same pattern. Existing trials with JSDoc-style claim comments (e.g., CHANCE's `/* claimId: chance.hemorrhage */`) are not scanner-matched and would need conversion to typed fields before their claims can be registered — out of scope for this commit.

## Editorial caveats handled

- NEJM accompanying editorial text not retrieved this session — flagged in evidence packet §11 as informational. Entry's V-facing prose relies on the verified full text plus AHA/ASA 2021 Class I monotherapy framing. No editorial-quoted language used. Acceptable.
- Headache-specific discontinuation granularity not extracted — aggregate discontinuation rate is verified and used. Pearl-level granularity gap noted in `limitations`. Acceptable.

## Quality gates

- `tsc --noEmit` → PASS (added `claimId?: string` to TrialMetadata interface to satisfy the type system).
- `npm run build` → PASS (3.0s, no errors).
- `npm run check:claims` → PASS (all four checks — including NNT guard and surface cross-check).

## Rationale

PRoFESS was the highest-priority Tier 2 missing trial per audit artifact 01 line 29 ("Antiplatelet timeline foundational trials"). PMC open-access permitted full-text verification rather than abstract drafting per V's "DO NOT DRAFT TRIALS FROM ABSTRACTS" rule. The honest noninferiority-not-established framing closes a real catalog gap — clinicians reading about CHANCE/POINT now have the long-term monotherapy comparator they need to contextualize when DAPT does NOT apply (severe stroke, beyond 21-day window, etc.).

## Required follow-ups

- Existing antiplatelet-cluster trials (CHANCE, POINT, THALES, INSPIRES, CHANCE-2) carry JSDoc-style claim comments that are not scanner-matched. Converting them to typed `claimId` fields is a separate Class C task — out of scope for this commit and not blocking.
- The `seo-specialist` should add PRoFESS to `src/seo/structured-data` (JSON-LD MedicalStudy) and ensure the trial detail page renders in sitemap.xml. Tracked as part of the ongoing SEO sweep per V's "deploy SEO while doing this" instruction.

## Blocking issues

None.
