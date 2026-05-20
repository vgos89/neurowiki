# Clinical review — PR # CREST (2010) trial entry authoring (2026-05-20)

**Decision:** approve-with-conditions
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **New trial entry:** CREST (Brott et al. NEJM 2010;363(1):11–23) added to `src/data/trialData.ts` at key `'crest-trial'` (~205 lines), inserted after PRoFESS. First entry to populate the previously empty `listCategory: 'carotid'` slot.
- **Citation registry:** new entry `crest-brott-2010` added to `src/lib/citations/registry.ts`.
- **Claim registry:** new claim `crest-cas-vs-cea-superiority-not-met-2010` → `[crest-brott-2010]` mapping added to `src/lib/citations/claims.ts` on `DATA_SURFACE`.
- **Typed claim tagging:** uses the `TrialMetadata.claimId?` field added in the PRoFESS commit (`dbf6106`).
- **Evidence packet:** `docs/evidence-packets/crest-2010-2026-05-20.md` (releasable, all primary/component/subgroup numbers verified against PMC2932446 — the correct PMC, supersedes the audit's erroneous PMC3058352).

## Semantic validity

Every primary and component number traces to PMC2932446:

- n=2,502 (CAS 1,262; CEA 1,240); 117 sites; symptomatic 52.7% / asymptomatic 47.3%
- **Primary composite (4y stroke/MI/death periprocedural + ipsilateral stroke):** CAS 7.2% vs CEA 6.8%, HR 1.11 (95% CI 0.81–1.51), P=0.51 → `not-met` for superiority
- Periprocedural any-stroke: CAS 4.1% vs CEA 2.3%, HR 1.79 (1.14–2.82), P=0.01
- Periprocedural MI: CAS 1.1% vs CEA 2.3%, HR 0.50 (0.26–0.94), P=0.03
- Cranial nerve palsy: CAS 0.3% vs CEA 4.7%, HR 0.07 (0.02–0.18), P<0.001
- Age × treatment interaction P=0.02 at ~70-year crossover
- Symptomatic subgroup HR 1.08, asymptomatic HR 1.17; interaction P=0.84

**Failed-superiority framing:** verified in `howToInterpret.proves` and `bottomLineSummary`. The honest "no significant difference; the trial failed to demonstrate superiority of either approach" framing is explicitly used. Banned paraphrases ("equivalent", "as good as", "comparable" on primary, "non-inferior to") are absent. The entry includes explicit warnings against those paraphrases.

**Signal split prominence:** the CAS↑stroke / CEA↑MI / CEA↑cranial-nerve-palsy tradeoff is the lead story in `pearls`, `bedsidePearl`, `howToInterpret`, `bottomLineSummary`, and `safetyData`. Not buried.

**Age interaction language:** described as "planned before unblinding but not specified in the original protocol" — neither fully prespecified nor truly post-hoc, per the published authors' own framing.

**Industry transparency:** Abbott Vascular ~15% in-kind donation (correct value from primary paper, not the Mantese supplement's 20%), nonvoting Executive Committee seat, manuscript pre-submission review, NINDS R01 NS 38384 primary funding — all disclosed in `pearls[9]`, `limitations`, and `howToInterpret.cautions`.

**Operator credentialing caveat:** real-world generalizability flag (CREST operators were rigorously credentialed; out-of-trial CAS series have higher periprocedural stroke rates) appears in `pearls[8]`, `limitations`, `clinicalApplication`, and `howToInterpret.cautions`.

**Lineage placement:** SAPPHIRE → EVA-3S → SPACE → ICSS → CREST → ACT-1 → CREST-2 present in `clinicalContext` and `educationalContext`. Explicit non-mixing note for the 2016 10-year extended follow-up and for ACT-1 — those are separate datasets and would be separate entries.

## NNT compliance with build-time guard

The `calculations` block is **omitted entirely** with an inline comment explaining the Option Y rule (failed-superiority composite + no NI claim → NNT not defensible). `trialDesign.nnt` also omitted with explanatory comment. The Tier 3 #18 NNT guard does NOT trip because `calculations.nnt` is unset. Verified by `npm run check:claims` → PASS.

## Citation accuracy

Brott TG et al. NEJM 2010;363(1):11–23. DOI 10.1056/NEJMoa0912321. PMID 20505173. **PMCID PMC2932446** (corrected from the audit's erroneous PMC3058352, which was the Mantese AHA-supplement summary — a different paper). NCT00004732. `last_reviewed: 2026-05-20`, `review_window_months: 36` (landmark-trial default).

## Freshness

New entry; first review of source; within 36-month landmark-trial window.

## Conditions for approval (must be addressed in this commit)

These are advisory — the entry approves on its own merits. No blocking issues.

1. **SafetyProfile.majorBleeding slot reused for MI signal.** The `SafetyProfile` type does not have an MI key. Author placed the periprocedural MI signal in `majorBleeding` with an explicit tooltip disclaimer that the row is MI, not bleeding. This is a defensible workaround but creates a schema-fidelity debt. **Acceptable for this commit** because the tooltip prevents reader confusion, but a follow-up Class C task should extend `SafetyProfile` with an `mi?: SafetyMetricEntry` slot and migrate this entry. **Not blocking.**

2. **Per-stratum age HRs in Figure 2B** were not extracted from the primary paper (the figure shows interaction graphically, not as discrete per-stratum HR/CI values). The entry uses the verified interaction P=0.02 + the qualitative direction (CAS favors younger, CEA favors older) but does not quote specific <70 / ≥70 HRs. **Acceptable** — the qualitative finding is well-known and clinically actionable as authored. **Not blocking.**

3. **NEJM accompanying editorial** (Lal/Brott, p.80) not retrieved. No editorial-quoted language used in the entry; the prose stands on the primary paper. **Acceptable.**

## Quality gates

- `tsc --noEmit` → PASS
- `npm run build` → PASS (2.8s)
- `npm run check:claims` → PASS (all four checks, including NNT guard and surface cross-check)

## Rationale

CREST closes the second of two Tier 2 PMC-open authoring tasks (PRoFESS was the first, shipped in `dbf6106`). It populates the `listCategory: 'carotid'` slot that audit artifact 01 line 31 flagged as empty. The honest failed-superiority framing with the signal-split lead is the clinically responsible reading — clinicians need to know that the choice between CAS and CEA is not "which works better" but "which periprocedural harm is acceptable for this specific patient at this specific age." That clinical decision is now correctly framed on the trial detail page.

Three corrections to the audit's working assumption are documented for traceability: (a) design is superiority, not NI; (b) PMC is PMC2932446, not PMC3058352; (c) Abbott in-kind contribution is 15%, not 20%. All three originated in evidence-verifier's PMC full-text reading and are reflected in both the packet and the entry.

## Required follow-ups

1. Class C task: extend `SafetyProfile` type with an `mi?: SafetyMetricEntry` slot and migrate CREST to use it.
2. SEO sweep: add CREST to sitemap.xml and add JSON-LD MedicalStudy structured data for the trial detail page (tracked as part of the ongoing per-trial SEO deployment per V's instruction).
3. The carotid lineage cluster (SAPPHIRE, EVA-3S, SPACE, ICSS, ACT-1, CREST-2) is now visibly missing from the catalog. Tier 2 carotid backfill should be queued — most of these are paywalled and will need V's PDFs. CREST-2 is awaiting publication.
4. The CREST 2016 10-year extended follow-up (Brott TG et al. NEJM 2016;374:1021) is a candidate for a separate entry, but is paywalled and out of this commit's scope.

## Blocking issues

None.
