# ADR-008 — Calculator shell decomposition: shared primitives, drawer hook, severity-token interface

**Date:** 2026-05-13
**Status:** accepted
**Deciders:** V (product owner), orchestrator, system-architect
**Replaces:** none
**Supersedes:** none
**Architect review:** `docs/reviews/arch-l56-calculator-shell.md`

---

## Context

Nine calculator pages (`Abcd2ScoreCalculator`, `IchScoreCalculator`, `GlasgowComaScaleCalculator`,
`HeidelbergBleedingCalculator`, `NihssCalculator`, `AspectScoreCalculator`,
`BostonCriteriaCaaCalculator`, `HasBledScoreCalculator`, `RopeScoreCalculator`) each
contained byte-for-byte duplicate implementations of:

- Inline `BackArrow` SVG component (~12 lines each)
- Inline `Chevron` SVG component (~18 lines each)
- Drawer state machine (`drawerState: 'A' | 'B' | 'C'`) and `drawerOpen` useState
- Per-page `SEVERITY_TOKENS` record (identical shape, different union key sets)
- Portal-mounted drawer markup with fixed positioning constants
- Toast portal markup (byte-identical across all 9)
- Sticky header markup with back-arrow, score-display, fav/reset/copy cluster
- Page footer markup

The arch follow-up at `docs/reviews/arch-l55c-aspects-boston-rebuild.md` required L5.6
extraction before any 10th calculator could ship on the inline-everything pattern.

The L-dm-cleanup commit retired dark-mode support across the codebase, removing `dark:`
class variants and simplifying the shell extraction — no dark-mode parity concerns remain
for Phases 2 and 3.

---

## Decision

Phased extraction across 3 commits on `main`. Each phase is a self-contained commit;
reverts apply in reverse order (Phase 3 first, then Phase 2, then Phase 1).

**Phase 1 (this ADR):** Pure UI primitives — `Chevron` and `BackArrow` extracted to
`src/components/calculators/`. All 9 calculator pages migrated to import from the shared
components. ADR-008 lands in this commit.

**Phase 2:** Drawer state hook (`useDrawerState`) + `CalculatorDrawer` component + shared
toast portal extracted to `src/hooks/` and `src/components/calculators/`. Per-page
`drawerOpen` useState, `justCompleted` state, toast state, and portal markup retire.

**Phase 3:** Sticky header (`CalculatorHeader`) + page footer (`CalculatorFooter`) extracted.
Per-page header and footer markup retire. New calculator authoring becomes a slot-filling
exercise against the shared shell.

Phase 3 depends on Phase 2 depends on Phase 1. Reverts must be applied in reverse order.

---

## Trade-off 1 — Severity tokens: interface-only consolidation, not a generic registry

Each calculator defines its own `SEVERITY_TOKENS` record mapping a local severity union
to a `{ borderColor, headerBg, headerHover, labelClass, statClass, chevronClass }` shape.
The severity unions differ in both key names and cardinality:

| Calculator | Severity union |
|---|---|
| ABCD², ICH, GCS, Heidelberg | `'low' \| 'moderate' \| 'high'` |
| ASPECTS | `'small' \| 'moderate' \| 'large' \| 'extensive'` |
| Boston CAA | `'very-high' \| 'high' \| 'moderate' \| 'low' \| 'n/a'` |
| HAS-BLED | `'low' \| 'moderate' \| 'high' \| 'very_high'` |
| RoPE | `'high' \| 'moderate' \| 'low'` |
| NIHSS | `'none' \| 'minor' \| 'moderate' \| 'moderate-severe' \| 'severe'` |

A shared registry would require a union of all keys across all calculators. Every caller
would receive a type that includes severity keys from other calculators — leaking vocabulary
across domains and requiring TS narrowing that provides no safety guarantee.

**Decision:** Phase 2 ships a `SeverityTokens` interface (the shared token shape) and
`getInlineSeverityColor()` utility, plus shared shadow constants (`drawerCollapsedShadow`,
`drawerExpandedShadow` — identical across all 9). Each calculator retains its own
`SEVERITY_TOKENS` record locally, typed against the shared interface.

**Rejected alternative:** A generic registry keyed on `string` with the full union type.
This defeats TypeScript's exhaustiveness checking at the call site — a newly added severity
value would not produce a compile error if the registry key is missing.

---

## Trade-off 2 — Header score display: ReactNode slot, not opinionated score-render API

`CalculatorHeader` (Phase 3) accepts `scoreDisplay: ReactNode` — the caller renders the
score display, the shell renders the surrounding chrome (sticky positioning, back button,
fav/reset/copy cluster, `aria-live` region).

Each calculator's score display has structural differences that cannot be unified:

- **ASPECTS:** Deducts from a baseline of 10; includes a conditional severity badge that
  uses `yellow-*` tokens distinct from the standard `amber-*`/`red-*` palette.
- **Boston CAA:** Shows a string label (`'Definite CAA'`, etc.) not a numeric score.
- **NIHSS:** Shows em-dash when incomplete; Archetype 2 requires a second header row for
  LVO probability and mode toggle — rendered inside the same `<header>` element.
- **GCS:** Score display uses a T-suffix when a verbal channel is not testable.

A baked-in score renderer would require three or more escape hatches to cover these cases,
recreating the complexity it was meant to remove.

**Decision:** `scoreDisplay: ReactNode` slot. The shell owns `aria-live="polite"`,
`aria-atomic="true"`, and `scoreAriaLabel: string` prop — screen-reader semantics are
enforced at the shell level; visual rendering is the caller's responsibility.

**Rejected alternative:** A `score: number | string | null` prop with a `severity` prop
and built-in `/ max` denominator rendering. Rejected because ASPECTS and Boston CAA
require non-numeric output, and NIHSS's second header row cannot be modeled this way.

---

## Trade-off 3 — Drawer state: one hook with discriminated-union input, not two hooks

Two behavioral modes exist across the 9 calculators:

- **Binary** (RoPE, HAS-BLED, Boston CAA): Drawer transitions directly from State A
  (no interaction yet) to State C (any answer given). Uses `hasInteracted: boolean`.
- **Partial-complete** (ABCD², ICH, GCS, ASPECTS, Heidelberg, NIHSS): Drawer shows
  State B (partial) between empty and complete. Uses `selectedCount / totalRequired`.

Both modes share: `drawerOpen` state, `setDrawerOpen`, reset, and toast side-effects.
Splitting into two hooks (`useBinaryDrawerState` and `usePartialCompleteDrawerState`)
would duplicate the shared logic and force callers to import the correct hook by name —
a runtime error waiting to happen when a calculator is refactored.

**Decision:** One `useDrawerState` hook with a discriminated union on `mode`:

```ts
type DrawerStateInput =
  | { mode: 'binary'; hasInteracted: boolean }
  | { mode: 'partial-complete'; selectedCount: number; totalRequired: number };

function useDrawerState(input: DrawerStateInput): {
  state: 'A' | 'B' | 'C';
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean | ((p: boolean) => boolean)) => void;
  reset: () => void;
};
```

TypeScript's discriminated union ensures `selectedCount` cannot be passed to a binary-mode
call site and `hasInteracted` cannot be passed to a partial-complete call site.

**Rejected alternative:** Two separate hooks. Would share ~60% of code between them with
no type-level guarantee of correct selection. Merging back into one hook later would
require a second migration pass across the same 9 files.

---

## Consequences

### Positive

- ~600 lines of duplication retire across 3 commits.
- New calculator authoring: import shell components, fill slots, write clinical logic. No
  boilerplate duplication.
- Spec compliance (CALCULATOR_SPEC.md §1, §5) enforceable at the shell level rather than
  per-file.
- Phase 1 is zero-risk: pure import replacement, byte-for-byte identical render output.

### Negative / risks

- Callers must learn the shell API (one hook, one drawer component, one header, one footer).
  Cost is bounded — 9 existing callers, well-understood scope.
- Per-calc severity token maps remain in page files after Phase 2. Acceptable: the shared
  `SeverityTokens` interface still provides the shape contract.
- Phase 2 is the highest-risk phase: `useDrawerState` changes the state ownership boundary.
  Discovery animation (`drawer-discovery-chevron` / `justCompleted`) must survive extraction.

### Migration

3 commits, all on `main`. **Phase 3 depends on Phase 2 depends on Phase 1. Reverts must
be applied in reverse order.**

---

## Out of scope for L5.6

- `EmBillingCalculator` — different shell (guided decision flow, not portal drawer). Not in migration set.
- `Cha2ds2VascCalculator` — inline-everything pattern but not yet on CALCULATOR_SPEC v1.1.
  Follow-up task filed in TASKS.md post-L5.6.
- Test infrastructure — covered by `.claude/skills/testing-patterns`, not drawer chrome.
