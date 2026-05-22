# Architect review — PR # pathway-elan-and-ext-ivt-2026-05-22

**Decision:** approve-with-conditions
**Reviewed:** plan only
**Reviewer:** system-architect (orchestrator-routed)
**Date:** 2026-05-22

## Rationale

The plan is structurally sound. ExtendedIVTPathway already imports `CalculatorDrawer` and `NextStepsCard` and carries its own `TIER_TOKENS` (line 161 comment explicitly flags it as "4th copy; extraction deferred until PathwayBottomDrawer retires") — so the drawer migration on that page is a continuation of an existing pattern, not a new one. ElanPathway, by contrast, is still on the legacy bespoke result block (`SelectionCard`, inline `bg-red-50` panels, no portal drawer, no severity tokens), so it is the heavier lift and the real boundary work in this PR.

Two risks worth naming up-front: (1) `TIER_TOKENS` duplication — ELAN will become the 5th inline copy unless we either inline it consistently with the existing 4 and accept the deferred extraction, or extract `pathwayTierTokens.ts` now. Plan must pick one and state it; silently adding a 5th copy without acknowledging the trade-off is a composability miss. (2) ELAN currently uses an in-page `<div id="elan-action-bar">` for the result region. Migrating to the portal drawer means re-homing copy/share/reset actions and the EMR-text builder into `DrawerContent`. That is a real boundary change and earns the Class D label on its own.

## Required follow-ups

- State explicitly in the plan whether `TIER_TOKENS` for ELAN will be (a) inlined as 5th copy with a `// 5th copy — extraction deferred` comment matching ExtendedIVT line 161, or (b) extracted to `src/lib/calculators/pathwayTierTokens.ts` as a Class D sub-step. Default to (a) for tonight's scope; (b) becomes a parked TASKS.md item.
- Route the clinical portions to `clinical-reviewer` pre-execution (§19 step 6 pattern (a) — gate the medicine, then write the code). Produce one clinical review artifact per pathway commit.
- Each pathway commits as its own atomic change with its own `arch-PR<#>-*.md` + `clinical-PR<#>-*.md` artifacts in `docs/reviews/`. This review covers the structural shape for both; a fresh §17.1 artifact is NOT required per-pathway unless the plan changes shape mid-execution.
- Rollback note in each PR body: "single-pathway revert via `git revert <sha>`; no schema, no shared-abstraction change, no flag required."
- If `medical-scientist` surfaces any threshold/recommendation drift vs AHA/ASA 2026 (e.g., ELAN size-class day boundaries, late-window TNK eligibility), pause and re-classify the affected pathway to E-clinical before code. Do not silently absorb clinical-logic changes into D-clinical scope.

## Blocking issues

None.

## Answers to orchestrator's six questions

**1. Class D-clinical vs E-clinical.** D-clinical with E-clinical contingency. If verification surfaces a threshold or recommendation that needs to move, that finding promotes the affected pathway to E-clinical and triggers a fresh plan + clinical-reviewer pre-execution gate. Explicit checkpoint, not a discovered surprise.

**2. Per-page vs shared `PathwayInterpretationBar` primitive.** Per-page tonight, do not extract. `CalculatorDrawer` is already the shared primitive — both pathways will consume it directly. What differs is the *contents* of `DrawerContent` (page-specific). Extracting a wrapper adds a layer without a 3rd consumer.

**3. Separate vs bundled commits.** Separate, per V's directive. Cleaner revert + smaller per-commit artifacts + ELAN is the heavier migration so it deserves its own blame line.

**4. Clinical-reviewer gate timing.** Pre-code (pattern a). `medical-scientist` produces written fix proposals (claim text deltas, threshold confirmations, citation IDs). `clinical-reviewer` gates the proposals against evidence. Only then does code get written. Post-implementation gating forces reviewer to read diff + intent simultaneously — documented failure mode per §13.1.

**5. Rollback for algorithm changes.** Each pathway as standalone commit, `git revert` clean. For any algorithm-change finding: require clinical-reviewer + V re-approval before code, log as D→E promotion in TASKS.md, add one-line rollback note to PR body.

**6. Other concerns.** ELAN's `buildEmrText()` is a clinical-string builder living inline in the page. Moving it into `DrawerContent` is fine; moving into `src/lib/` is NOT in scope. `medical-scientist` + `evidence-verifier` must produce verification packet *before* `ui-architect` begins drawer migration — serial not parallel.
