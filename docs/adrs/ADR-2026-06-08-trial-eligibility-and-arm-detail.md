# ADR — Trial full-eligibility disclosure + structured Study-Arms accordion

**Date:** 2026-06-08
**Status:** Accepted
**Class:** D-clinical
**Deciders:** orchestrator + system-architect (structural review: approve-with-conditions, `docs/reviews/arch-trial-eligibility-arms.md`)
**Supersedes:** none

---

## Context

Trial detail pages (`src/pages/trials/TrialPageNew.tsx`, driven by `TRIAL_DATA` in
`src/data/trialData.ts`) show a curated 4–8 bullet inclusion/exclusion summary and a
single flattened "treatment vs control" intervention line. Residents using the trials
surface as an education tool asked for (1) the ability to expand to the full verbatim
eligibility criteria, and (2) a per-arm breakdown of exactly what each arm received
(agent, dose, route, frequency, duration, co-interventions).

The full criteria and arm protocols are available from ClinicalTrials.gov for the 79 of
108 trials carrying a registry ID, cross-checked against the publication; the remaining
trials (and any with an invalid registry ID) source from the publication.

This is delivered pilot-first (5 landmark trials: DAWN, DEFUSE-3, ECASS III, ESCAPE,
NINDS) to validate the UX and the per-trial clinical-verification pipeline before
batching the remainder.

## Decision

### 1. Schema additions to `TrialMetadata` (all optional, additive, backward-compatible)

- `CriteriaGroup { label?: string; items: string[] }` — grouped to preserve the source's
  own structure (CT.gov splits inclusion/exclusion into labeled blocks such as
  "general" vs "imaging", e.g. DAWN/DEFUSE-3). Flattening to a single `string[]` would
  destroy that structure irreversibly on ingest, so grouped is canonical.
- `FullEligibility { inclusion: CriteriaGroup[]; exclusion: CriteriaGroup[]; source;
  sourceUrl?; sourceLabel?; retrieved? }` — provenance fields carry the source trail a
  clinical surface requires (§13).
- `ArmDetail { arm; role; agent?; dose?; route?; frequency?; duration?;
  coInterventions?; note? }` — "structured fields + note".
- New optional fields on `TrialMetadata`: `fullEligibility?: FullEligibility` and
  `armDetails?: ArmDetail[]`. The existing `intervention: TrialIntervention` summary is
  **retained unchanged** (drives the facts-list one-liner).

### 2. Arm-representation convergence (system-architect condition)

The structural review found arm data is already represented twice: the `formatTrialArm`
summary string, and an **existing structured per-arm block** in the legacy/default render
path of `TrialPageNew.tsx` (treatment/control with `name`/`description`/`details[]`).
Adding a third uncoordinated representation is the failure mode the review exists to
catch. Decision:

- **`armDetails` is the canonical structured arm source going forward.**
- The new `InterventionArmsAccordion` renders **iff `armDetails` is present**.
- The legacy structured arm block (driven by the old `intervention` object) is **guarded
  to render only when `armDetails` is absent** — so no trial ever displays arm detail
  twice. It is retained for not-yet-migrated trials and retired as trials gain
  `armDetails`.
- The `formatTrialArm` one-liner is unchanged (different surface: the compact facts list).

### 3. Population-criteria render consolidation (corrects the plan's blast-radius framing)

The population card is **not** two equal duplicates. `renderPopulationSection(tm)` (the
shared helper) is already consumed by ~120 archetype call sites and **is** the
consolidation point; the only true duplicate is one orphaned inline copy. Decision:
delete the orphan inline copy, route that one surface through the helper, and promote the
helper into `EligibilityCriteriaCard` (curated summary always visible + "Show full
criteria" disclosure when `fullEligibility` present). The ~120 existing call sites
continue to consume the (now-promoted) component and gain the disclosure automatically.

### 4. Tagging / scanner

`fullEligibility` and `armDetails` are the already-shipped "structured data in
`src/data`" claim surface (§13.3/§13.4 Phase 1), not a new surface. They are
source-attributed trial-descriptive content (provenance carried inline), consistent with
the existing untagged `inclusionCriteria`/`exclusionCriteria`. The opt-in claims scanner
is not tripped and requires no extension. Semantic validity is enforced by the
`evidence-verifier → medical-scientist → clinical-reviewer` pipeline, **not** the hook
(§13.1).

## Consequences

**Positive:** richer, provenance-backed reference content for residents; one consolidated
eligibility component instead of an orphan + helper; arm data converges on a single
canonical structured source.

**Negative / watch:** the legacy arm block lingers until all trials migrate to
`armDetails` (tracked); per-trial content is a real clinical-verification effort, hence
the pilot. Stored registry IDs are **not** trustworthy as-is (NINDS `NCT00000292`
resolves to an unrelated NIDA cocaine study) — a per-trial NCT-verification step is
mandatory before any registry pull, and NINDS sources from publication.

## Rollback (§14)

All additions are optional and additive. To roll back: remove `EligibilityCriteriaCard`'s
disclosure + `InterventionArmsAccordion` from `TrialPageNew.tsx`, remove the `armDetails`
guard on the legacy arm block (restoring unconditional legacy render), and the new schema
fields go unused. No data migration, no destructive change; trials render exactly as they
did pre-change. Revert is a clean `git revert` of the feature commit.
