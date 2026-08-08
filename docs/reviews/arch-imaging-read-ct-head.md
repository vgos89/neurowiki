# Architect review — PR #<pending> (imaging: read-the-scan / CT head v1)

**Decision:** approve-with-conditions
**Reviewed:** plan only (data model + routing + claim-surface reuse; no source exists yet — src/data/imaging/ is absent)
**Reviewer:** system-architect (model: claude-opus-4-8)
**Date:** 2026-07-09

## Rationale
The proposed "Read the Scan" subsystem is structurally clean and purely additive: new files under src/data/imaging/, two new StaticRouteKey union members, two STATIC_ROUTE_DEFINITIONS entries, and two lazy imports in App.tsx. Boundaries are respected (data in data/, clinical statements reach citations only via claimId → CLAIM_REGISTRY), state locality is a non-issue (static data; the two-modes-over-one-dataset design correctly reads a single steps[] for both Bedside and Learn), and no npm dependency is added. The migration exit is trivial (delete files, remove route entries). The risk is not in v1 correctness but in v1 *shape*: ctHead.ts becomes the template that CTA, MRI-brain, and MRI-spine copy, so a data model that only fits CT windows will force a rewrite when sequences arrive. Three composability fixes must land before ctHead.ts is authored. Two governance facts in the plan were stale and are corrected in the follow-ups. The prose surfaces (normal/abnormal/pitfalls/terminology, image captions/attribution) are clinical content and must additionally clear medical-scientist → clinical-reviewer; this artifact clears structure only.

## Required follow-ups
- C1 (blocking-for-shape): Replace `crossCutting: { windows?: WindowCard[]; sequences?: SequenceCard[] }` with a discriminated-union array `crossCutting: CrossCuttingCard[]`, each card carrying a `kind` discriminant. The parallel-optionals bag accretes a key per modality and pushes modality-awareness into every consumer; a closed discriminated union is the generalizing shape. This is the answer to "windows/sequences top-level typed variants?" — yes, as a union.
- C2 (blocking-for-shape): Rename `SearchStep.windowRefs` → `crossCuttingRefs` (or `cardRefs`). The current name hard-codes CT-window semantics into the generic step type; MRI steps reference sequences.
- C3 (blocking-for-shape): Promote `anatomy: string[]` → `{ structure: string; glossaryRef?: string; note?: string }[]`. Bare strings cannot carry the teaching or glossary link that "first-class anatomy layer" implies.
- C4 (duplication): Glossary — extend the existing flat MEDICAL_GLOSSARY (src/data/medicalGlossary.ts) with radiology terms for site-wide tooltips; do NOT build a dedicated imaging glossary structure (would be a third glossary pattern). Keep step-local teaching in learn.terminology; where a term is shared, reference it via glossaryRef rather than copying the definition (prevents inline-vs-glossary drift).
- Humanizer: NO registration step is required. scripts/check-humanizer.mjs walks SCAN_DIRS (includes src/data) and auto-discovers every .ts/.tsx; placing files under src/data/imaging/ gives automatic coverage. CLAUDE.md §10.3 and the scanner's own header comment (lines 14-24) still describe a named TARGETS list and are stale — hand to librarian to reconcile.
- Claim scanner holes: (a) check-claims.ts does not strip comments — never place a quoted `claimId:` literal in a JSDoc/comment in the imaging files or it fails the commit as an unregistered tag; (b) ImageLicense.attribution and caption are humanizer-scanned and have no em-dash exemption — normalize attribution punctuation (allowed) or extend EMDASH_ALLOWLIST for verbatim bylines.
- Routing: nesting under the existing `guide` tab (bottomNavTab/railItem = 'guide') is correct — a new NavTab member is invasive. Non-blocking: consider `/guide/read-the-scan/ct-head` over `/guide/read-ct-head` to reserve the hub namespace for CTA/MRI siblings.
- Make `SearchStep.mnemonicLetter` optional — not every modality has a per-step letter mnemonic.
- Clinical routing: flag the module `-clinical`; the normal/abnormal/pitfalls/terminology prose and image selection must clear medical-scientist (authoring) → clinical-reviewer (§17.2 artifact) before merge. This structural review does not clear clinical content.

## Blocking issues
None. Decision is approve-with-conditions; C1–C4 are shape conditions to satisfy before ctHead.ts is authored, not merge blockers on an existing diff.
