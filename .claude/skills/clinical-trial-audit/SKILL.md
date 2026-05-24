---
name: clinical-trial-audit
description: Verification workflow for trial DOI/PMID, endpoint accuracy, display archetypes, and NNT validity. Load when verifying or editing trial data entries in trialData.ts, trialCatalogMeta.ts, or trial legend fields.
paths:
  - src/data/trialData.ts
  - src/data/trialCatalogMeta.ts
  - src/data/trialListData.ts
  - src/data/trial-questions.ts
  - src/pages/trials/**
---

# Clinical Trial Audit Skill

## DOI/PMID verification workflow

1. Resolve the DOI or PMID. Confirm the landing page title matches the trial name in the repo.
2. Verify: first author, year, journal, volume/issue if available.
3. Locate the methods section. Extract the primary endpoint verbatim.
4. Compare to the `primaryEndpoint` field in trialData.ts. Flag any discrepancy — even minor phrasing changes matter.
5. Locate the results section. Extract the primary statistic (point estimate, CI, p-value or NI margin or posterior probability).
6. Compare to the displayed statistics. Flag rounding beyond 1 decimal place on p-values, or truncated CIs.
7. Confirm the statistical design type (see allowed list below) matches the `statisticalFramework` field and the display archetype.

---

## Trial audit table template

Complete this table for every trial being verified:

| Field | Published value | NeuroWiki value | Match? |
|---|---|---|---|
| Trial name / acronym | | | |
| First author + year | | | |
| DOI | | | |
| PMID | | | |
| NCT number | | | |
| Primary endpoint (verbatim) | | | |
| Design type | | | |
| Primary result (estimate) | | | |
| CI | | | |
| p-value / posterior / NI margin | | | |
| NNT (if shown) | | | |
| Display archetype | | | |

Flag every row with a mismatch. A mismatch in primary endpoint, design type, or primary result is a blocking issue.

---

## Required fields for every trial entry

The following fields must be populated and verified before a trial entry can merge:

- `doi` or `pmid` (at least one required; both preferred)
- `primaryEndpoint` (verbatim from paper)
- `statisticalFramework` (from allowed list below)
- `primaryResult` (point estimate + CI)
- `displayArchetype` (from allowed list below)
- `claimId` (required for any field that constitutes a clinical claim surface per §13.3)

---

## Statistical framework allowed list

| Code | Description |
|---|---|
| `superiority` | RCT powered to show treatment is better than control |
| `noninferiority` | RCT with pre-specified noninferiority margin Δ |
| `bayesian` | Bayesian adaptive or confirmatory; results are posterior probabilities |
| `ordinal-shift` | Primary outcome is ordinal (e.g., mRS), analyzed with ordinal logistic regression |
| `registry` | Observational; no randomization |
| `futility` | Stopped at interim for futility |
| `safety-only` | Powered for safety endpoints; no efficacy claim |
| `dose-finding` | Phase 2, dose-escalation |
| `workflow` | Tests process or logistics |
| `imaging-selection` | Validates or compares imaging selection criteria |

---

## Display archetype taxonomy

| Archetype | When to use | What to show |
|---|---|---|
| `bar-binary` | Binary primary, superiority RCT | Absolute risk difference + CI; event rates in each arm |
| `grotta-bar` | Ordinal primary (mRS), ordinal-shift design | Full mRS distribution (0–6) for each arm; common OR with CI |
| `forest-row` | Subgroup or meta-analysis | Point estimate + CI per row; I² if meta-analysis |
| `ni-margin-chart` | Noninferiority design | NI margin Δ, observed treatment difference, CI; note whether CI crosses Δ |
| `risk-table-km` | Time-to-event primary | Kaplan-Meier curve or risk table; HR + CI |
| `registry-safety` | Registry or observational | Safety event rates; no efficacy bars or NNT |
| `no-efficacy` | Futility, safety-only, dose-finding | Design context only; safety profile; no outcome bars |

Choosing the wrong archetype is a display error even if the statistics themselves are correct. Flag and block.

---

## NNT validity rules

NNT is **allowed** only when ALL of the following are true:
1. Trial design: `superiority` RCT
2. Primary outcome: binary (or explicitly pre-specified dichotomization with the cutpoint stated in the protocol)
3. Outcome used: the pre-specified primary outcome — not a secondary, subgroup, or post-hoc outcome
4. ARD confidence interval is shown alongside the NNT

NNT is **NOT allowed** for:
- `noninferiority` designs (NI trials do not establish a superiority effect size)
- `ordinal-shift` primary outcomes (the common OR does not convert to NNT without a dichotomization assumption)
- `bayesian` designs (posterior probability ≠ ARD)
- `registry` / observational studies (confounding prevents causal ARD interpretation)
- Subgroup analyses used as the primary displayed result

If NNT appears for a trial not meeting the above, flag as `nnt-not-appropriate` and block the PR.

---

## Editorial caveat checklist

For each trial being audited, check:

- [ ] Accompanying editorial in the same journal issue? Summarize the key caveat.
- [ ] AHA/ASA or AAN guideline incorporated this trial? State recommendation class/level.
- [ ] Conflicting trials or meta-analyses? State the conflict and which guideline adjudicates.
- [ ] Population generalizability issue? (e.g., Asia-only, single-center, enriched by imaging selection, LMIC only)
- [ ] Trial stopped early for benefit or harm? Note truncation bias if stopped early for benefit.
- [ ] Industry funding with relevant conflicts of interest? Note if funder had role in design or analysis.
- [ ] Subsequent reanalysis or erratum? Note if results were materially changed.

Required caveats must appear in the `legend` or `howToInterpret` field. Missing required caveats = block.
