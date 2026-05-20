# Clinical review — PR # PRISMS primaryResult correction (2026-05-20)

**Decision:** approve
**Reviewer:** clinical-reviewer (orchestrator-routed)
**Date:** 2026-05-20

## Scope

- **Claims touched:** none — metadata-only correction
- **Field changed:** `primaryResult: 'futility-stopped'` → `'terminated-administrative'`

## Evidence trace

Khatri P, Kleindorfer DO, Devlin T, et al. **Effect of Alteplase vs Aspirin on Functional Outcome for Patients With Acute Ischemic Stroke and Minor Nondisabling Neurologic Deficits: The PRISMS Randomized Clinical Trial.** JAMA. 2018;320(2):156-166.

Per the overnight accuracy audit:

> "PRISMS — Khatri et al. JAMA 2018. N=313 (terminated early). Primary mRS 0-1 at 90d. Catalogue: `primaryDesign: binary-superiority`, `primaryResult: futility-stopped`. Trial was terminated by sponsor for slow enrollment, not strictly DSMB futility — fits `terminated-administrative` better than `futility-stopped` per the schema legend (lines 296-308). Use `futility-stopped` only when an explicit futility boundary was crossed."

The published paper documents: "The trial was terminated early after enrolling 313 of a planned 948 patients by the sponsor for delayed enrollment and concern about an evolving population." This is administrative termination, not crossing a prespecified futility boundary or DSMB futility recommendation.

The schema legend (`src/data/trialData.ts` lines 296-308) defines:

> `futility-stopped → pre-specified futility boundary crossed or data clearly futile`
> `terminated-administrative → early stop for enrollment, funding, or operational reasons (underpowered)`

PRISMS matches the second definition.

## Semantic validity

The fix re-classifies the trial's stop-reason taxonomy. The clinical interpretation (alteplase did not improve mRS 0-1 vs aspirin in minor nondisabling stroke; sICH was higher with alteplase; trial was underpowered) is preserved by all other fields.

The catalog's existing `applicability.populationExclusions[1]: 'Results stopped early at 33% of planned enrollment. Certainty limited.'` already correctly characterizes the under-enrollment. Only the taxonomy tag was inconsistent with the prose.

## Citation accuracy

Khatri P et al. JAMA 2018;320(2):156-166. No DOI/PMID change.

## Freshness

Within the 36-month landmark-trial re-review window per §13.7.

## Rationale

Single-field metadata correction. Brings the stop-reason taxonomy into alignment with the published reason (sponsor termination for slow enrollment) and with the schema's own legend distinguishing futility-stopped (DSMB-crossed) from terminated-administrative (operational).

## Required follow-ups

None blocking.

## Blocking issues

None.
