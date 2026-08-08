# ADR-2026-07-09 — Imaging "Read the Scan" cross-modality data model

**Date:** 2026-07-09
**Status:** Proposed

## Context
NeuroWiki is adding a hybrid imaging-interpretation teaching surface, "Read the Scan."
v1 is non-contrast CT head, using the validated "Blood Can Be Very Bad" search
choreography (Blood → Cisterns → Brain → Ventricles → Bone). Two modes (Bedside:
terse ordered checklist; Learn: each step expands into anatomy, terminology, normal
vs abnormal, pitfalls, license-clean images) render over ONE dataset. CTA head/neck,
MRI brain, and MRI spine are planned to reuse the same skeleton later, so the data
model must generalize across modalities (windows for CT, sequences for MRI, phases
for CTA) without a rewrite. Clinical statements in the module are claim surfaces and
must integrate with the existing citation governance (src/lib/citations, §13).

## Decision
1. Data lives in a new directory src/data/imaging/ — types.ts (shared types) plus one
   instance file per modality (ctHead.ts first). This inherits automatic humanizer
   coverage (scripts/check-humanizer.mjs walks src/data) and automatic claim-scanning
   (scripts/check-claims.ts Phase-1 `data` surface matches `claimId:` literals).
2. Clinical statements are modeled as leaf `{ text, claimId }` objects (normal, each
   abnormal, each pitfall). Each leaf registers a claim in CLAIM_REGISTRY declaring a
   `{ type:'data', field:'claimId' }` surface. No scanner change is required.
3. Cross-cutting teaching cards (CT windows, MRI sequences, CTA phases) are a single
   discriminated-union array `crossCutting: CrossCuttingCard[]`, each card carrying a
   `kind` discriminant — NOT parallel optional fields. SearchStep references them by id
   through a modality-neutral `crossCuttingRefs` (not `windowRefs`).
4. Anatomy is a first-class per-step layer modeled as
   `{ structure: string; glossaryRef?: string; note?: string }[]`, able to link into
   the glossary rather than a bare string list.
5. Routing nests under the existing `guide` nav tab to avoid an invasive NavTab-union
   change: two StaticRouteKey members (imaging-hub, imaging-ct-head), two
   STATIC_ROUTE_DEFINITIONS entries (bottomNavTab/railItem = 'guide'), two lazy imports
   in App.tsx.
6. Glossary: radiology terms needing site-wide tooltips extend the existing flat
   MEDICAL_GLOSSARY (src/data/medicalGlossary.ts). No dedicated imaging-glossary
   structure is created. Step-local teaching stays inline in learn.terminology; shared
   terms are referenced via glossaryRef to avoid duplicate/divergent definitions.

## Consequences
Easier: adding CTA/MRI/spine becomes a new instance file plus (if needed) a new
CrossCuttingCard kind — ImagingModule stays closed for modification; rendering switches
on `kind`. Clinical statements are governed by the existing hook with zero new
infrastructure. The feature is fully additive and cheaply revertible.
Harder / watch: the discriminated union costs a small amount of up-front type design
versus the optional-bag; authors must avoid quoted `claimId:` literals in comments
(check-claims.ts does not strip comments); image attribution/caption strings must obey
the em-dash ban (no exemption exists) — normalize punctuation or extend
EMDASH_ALLOWLIST.The normal/abnormal/pitfalls/terminology prose and image selection
are clinical content requiring medical-scientist authoring and clinical-reviewer gating
(§17.2); metadata-passing does not imply clinical correctness (§13.1).

## Scope
New: src/data/imaging/ (types.ts, ctHead.ts). Modified additively:
src/config/routeManifest.ts (2 keys + 2 route entries), src/App.tsx (2 lazy imports),
optionally src/data/medicalGlossary.ts (radiology terms). Governance touchpoints
(no code change): scripts/check-claims.ts and scripts/check-humanizer.mjs both cover
the new files automatically. Doc reconciliation (librarian): CLAUDE.md §10.3 and the
check-humanizer.mjs header comment still describe a named TARGETS list that the scanner
no longer uses.

## Rollback
Purely additive change. Revert = delete src/data/imaging/, remove the two route entries
and two StaticRouteKey members from routeManifest.ts, remove the two lazy imports and
their <Route> elements from App.tsx, and revert any MEDICAL_GLOSSARY additions. No
shared abstraction is modified and no data schema migrates, so a single `git revert` of
the feature commit restores prior behavior with no data or state cleanup.
