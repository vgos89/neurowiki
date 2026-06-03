# Clinical review — pathway a11y re-audit fixes (RH1–RH9)

**Decision:** approve
**Reviewer:** clinical-reviewer (model: Claude Opus 4.7)
**Date:** 2026-06-03

## Scope
- Claims touched: none
- Citations affected: none
- Surfaces changed: pathway interactive controls and result regions on three clinical-surface files (`src/pages/MigrainePathway.tsx`, `src/pages/ClinicHeadachePathway.tsx`, `src/pages/StatusEpilepticusPathway.tsx`), one article component (`src/components/article/stroke/LKWTimePicker.tsx`), one pathway page (`src/pages/ElanPathway.tsx`), and one shared header primitive (`src/components/pathways/PathwayHeader.tsx`). Change is ARIA-attribute-only — no clinical claim text, no interpretation strings, no thresholds, no doses, no citations modified.
- Evidence-verifier packet: not applicable — no trial/guideline data touched.
- Trial-statistician report: not applicable.

## Semantic validity
Confirmed. No user-facing clinical statement was added, removed, or reworded. The edits add accessibility semantics (`aria-pressed`, `role="checkbox"`/`aria-checked`, `role="group"`/`aria-labelledby`, `role="status"`/`role="alert"` live regions, `aria-label` on a differential progressbar, `aria-expanded`/`aria-controls`, `htmlFor`/`id` label association, and `aria-hidden` on decorative icons). The `aria-label` strings introduced are derived purely from already-displayed values (phenotype name + computed percentage; favorites state; "Patient Weight") and assert nothing clinically new. The Stage 3 dose row and migraine red-flag STOP block gained live-region roles so screen readers announce the *same* computed values already shown on screen — no value or recommendation changed.

## Citation accuracy
Not applicable — no citations in scope.

## Editorial / expert context
Not applicable — no new trial entry in this PR.

## Freshness
Not applicable — no `last_reviewed` fields touched.

## Rationale
This is an accessibility-semantics-only change on clinical-surface files. The `-clinical` flag applies because the files are enumerated clinical surfaces, but no clinical content, claim, citation, dose, or threshold was altered — the rendered clinical text is byte-identical. Typecheck clean; production build prerendered all 170 routes with 0 failures, confirming no rendering regression. Approve.

## Required follow-ups
- none
