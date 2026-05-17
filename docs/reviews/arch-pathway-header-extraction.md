# Architect review — Pathway header extraction (Commit 1 of ExtendedIVT Pattern A series)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-17

## Rationale

This extraction is overdue and structurally correct. The three header blocks (EvtPathway.tsx:1046–1075, StatusEpilepticusPathway.tsx:258–285, MigrainePathway.tsx:531–558) are anatomically identical post-Tier-2 down to the exact Tailwind class strings on the wrapper, identifier block, icon button paddings, and Copy pill. The audit table in `arch-pattern-a-fix-tier-1-2.md` condition 4 explicitly parked this work until "Tier 5 lands" and "next edit pass triggers extraction" — Tier 5 has landed and the ExtendedIVT rebuild is the trigger.

Three real divergences the plan partially acknowledges but doesn't fully resolve (all addressable as conditions):

1. **Back aria-label is genuinely divergent.** EVT uses `"Back to Stroke Pathways"`; SE and Migraine use `"Back"`. Expose `backAriaLabel?` with default `"Back"`.
2. **Copy button label state is divergent.** Only SE renders `{copyConfirm ? 'Copied ✓' : 'Copy'}`. Expose `copyConfirm?: boolean`, default false.
3. **The `sr-only` h1 is NOT part of the header block in either EVT or Migraine.** Both render it as a sibling of the sticky div. SE has no sr-only h1 — pre-existing a11y gap. Do NOT absorb into primitive.

The combined 4-file commit (1 new primitive + 3 retro-wires) is acceptable. Single-commit risk covered by Gate 6.

## Rubric scores

| # | Item | Score | Rationale |
|---|---|---|---|
| 1 | Duplication risk | pass | Extraction collapses 3 identical header blocks into 1 primitive. Net negative. |
| 2 | Boundary integrity | pass | UI primitive — callbacks are pass-through. No clinical logic enters. |
| 3 | Composability | pass | Explicit-prop shape right for spec-locked surface. |
| 4 | State locality | pass | Primitive is stateless. No hoisting. |
| 5 | Dependency weight | pass | Reuses existing lucide imports + inline back-arrow SVG. No new deps. |
| 6 | Migration exit | pass | 4 files (within §6 threshold). `git revert` clean. |

## Required follow-ups (conditions for approve)

1. **Add `backAriaLabel?: string` prop, default `"Back"`.** EVT passes `"Back to Stroke Pathways"`.

2. **Add `copyConfirm?: boolean` prop, default `false`.** SE passes existing `copyConfirm` state through. Migraine's toast pattern stays at consumer level.

3. **Do NOT absorb the `sr-only` h1 into the primitive.** Leave as sibling at consumer level. SE's missing h1 is a separate a11y task.

4. **Rename `pathwayName` → `pathwayLabel`.** Matches display-string role; avoids confusion with route id / favourites key.

5. **JSDoc header on PathwayHeader.tsx** matching PathwayCascadeNotice precedent. State: "Spec source: PATHWAY_SPEC §2 anatomy. Do not modify class strings without spec amendment."

6. **Confirm ExtendedIVTPathway Commit 2 imports the primitive (does not fork).** Orchestrator ensures Commit 2 plan states "import PathwayHeader from Commit 1."

7. **Gate 6 live verify on EVT canary + one non-canary** (SE or Migraine). Three consumers swap simultaneously — verify at least one non-canary.

8. **No clinical-reviewer routing needed.** Pure structural refactor — no claim text changes. Do NOT apply `-clinical` flag.

## Blocking issues

None.

---

**Files inspected**
- `docs/reviews/arch-pattern-a-fix-tier-1-2.md` (parent review, condition 4 deferral)
- `src/pages/EvtPathway.tsx` (lines 1044–1075)
- `src/pages/StatusEpilepticusPathway.tsx` (lines 258–285)
- `src/pages/MigrainePathway.tsx` (lines 528–558)
- `src/pages/ExtendedIVTPathway.tsx` (lines 17–21, `hideHeader` precedent)
- `src/components/pathways/PathwayCascadeNotice.tsx` (JSDoc/contract precedent)
