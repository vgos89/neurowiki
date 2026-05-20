# Clinical review — PR # NOR-TEST primaryDesign correction (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none — metadata-only correction
- **Surfaces changed:** `src/data/trialData.ts` NOR-TEST entry (~line 8785-8786)
- **Fields changed:**
  - `primaryDesign`: `'noninferiority'` → `'binary-superiority'`
  - `primaryResult`: `'noninferiority-not-established'` → `'not-met'`

## Evidence trace

Logallo V, Novotny V, Assmus J, et al. Tenecteplase versus alteplase for management of acute ischaemic stroke (NOR-TEST): a phase 3, randomised, open-label, blinded endpoint, non-inferiority trial. **Lancet Neurol. 2017;16(10):781-788.**

Note: the published title carries "non-inferiority" but the analysis was performed under a superiority frame with a chi-square test for mRS 0-1 at 3 months. Per the overnight accuracy audit (`docs/research/2026-05-19-trial-audit/01-trial-accuracy-audit.md`):

> "Catalogue calls it `primaryDesign: noninferiority, primaryResult: noninferiority-not-established` — this is wrong. The published primary was superiority for an excellent outcome at 3 months; the trial result was equivalent rates but the formal frame was superiority not met."

The catalog itself reinforces this — `trialDesign.type[0]` reads `'Phase 3, randomized, open-label, blinded-endpoint superiority trial'` and `stats.pValue.label` reads `'Not Superior'`. Only the `primaryDesign` taxonomy tag was misaligned with these other fields.

## Semantic validity

Internal consistency restored. No textual claims, no patient-impacting numbers, no clinical interpretation drifts. The widespread clinical reading of NOR-TEST as "TNK 0.4 mg/kg shows equivalent rates of mRS 0-1 to alteplase, mostly in mild stroke" is unchanged. The catalog's existing `applicability.populationExclusions` already captures the mild-cohort + dose caveats.

The clinical interpretation in the field is mixed (some call it a noninferiority-like read because rates were equivalent; the published primary frame is superiority that did not meet). The catalog's job is to track the published primary frame, not a secondary clinical interpretation — that's now corrected.

## Citation accuracy

Logallo et al., Lancet Neurol 2017. Already attributed in catalog; no DOI/PMID change.

## Freshness

Within the 36-month landmark-trial re-review window per §13.7. NOR-TEST is now ~9 years old but remains historically referenced in the TNK-vs-alteplase chain.

## Rationale

Two-field metadata correction. Brings the trial entry's design + result tags into alignment with the catalog's own trialDesign and pValue.label text, and with the published primary frame per Lancet Neurol 2017.

## Required follow-ups

- The catalog's `applicability.populationExclusions` mentions "Severe stroke patients" as a population NOT generalizable to. Strictly accurate; no change needed in this commit.
- The recommendation to verify NOR-TEST 2 Part A (which is correctly tagged as 'binary-superiority' for the harm-stopped high-dose trial) is already correct in the catalog — no follow-up needed.

## Blocking issues

None.
