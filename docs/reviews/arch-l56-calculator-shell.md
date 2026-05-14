# Architect review — PR L5.6 CalculatorShell extraction

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files (`src/pages/AspectScoreCalculator.tsx`, `src/pages/NihssCalculator.tsx`, `src/pages/Abcd2ScoreCalculator.tsx` representative reads; grep across all 9 for `drawerState`, `createPortal`, `hasInteracted`, `SEVERITY_TOKENS`, `dark:`; existing `src/components/calculators/` directory; prior arch review `docs/reviews/arch-l55c-aspects-boston-rebuild.md`)
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-13
**Task class:** D (no clinical content change; structural-only refactor across 9 page files)

## Rationale

The plan is structurally sound and is the right next move — the duplication flagged in L5.5c (eight pages of inline Chevron/BackArrow/drawer/SEVERITY_TOKENS/portal/toast) is the exact debt this PR retires, plus the ninth file (NIHSS) confirmed by grep. The 3-phase split is well-chosen because each phase isolates a different concern (pure-visual primitives → state-machine + drawer → header/footer chrome) and each phase's revert restores exactly one layer. The biggest live risks are not in the *decision to extract* — they're in the API choices for the three new shared abstractions (drawer hook shape, severity-token placement, header score-display flexibility). My answers to those are below in the Required follow-ups. Ship it with the conditions; the alternative is a tenth calculator on the inline pattern, which violates the L5.5c arch follow-up.

## Rubric scores

**1. Duplication risk — pass.** This PR's entire purpose is duplication retirement. The migration set (9 files) is correctly identified by grep. EmBilling and Cha2ds2Vasc are correctly excluded. No new parallel implementation is being created.

**2. Boundary integrity — pass.** New files land in correct locations: pure UI primitives → `src/components/calculators/`; hook → `src/hooks/`; severity-tokens interface → `src/lib/calculators/`. None of these crosses into clinical/data boundaries. Clinical interpretation strings stay in the page components as opaque ReactNode/string inputs.

**3. Composability — pass.** The plan correctly chooses three different consolidation levels for three different problems: full extraction for pure-visual primitives, full extraction for drawer chrome, and *interface-only* extraction for severity tokens. The severity unions genuinely differ; forcing them into a registry would create a wider type than any caller wants.

**4. State locality — pass.** The `useDrawerState` hook moves nothing out of the page that doesn't already need to be local to the drawer. Each page still owns its `inputs`/`involved`/`nihssValues` state.

**5. Dependency weight — pass.** No new packages.

**6. Migration exit — concern (resolved by conditions).** 3 commits × 9 files per phase. Phased-commit model is the rollback mechanism; works only if phases are genuinely independent. Make rollback order explicit (C1).

## Decisions on the ten questions asked

**Q1 — Phasing soundness.** Yes, 3 phases is right. Phase 1 safest, Phase 2 highest-risk, Phase 3 medium. Do not split further. Do not collapse into one mega-commit.

**Q2 — `useDrawerState` API.** One hook with a `mode` discriminator is correct, NOT two hooks. Suggested signature:

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

Discriminated union for the input is what makes this safe.

**Q3 — Severity tokens placement.** Keep interface-only consolidation; do not push to a registry. Shared module exports: `SeverityTokens` interface, `getInlineSeverityColor()` helper, and the shadow constants (`drawerCollapsedShadow`, `drawerExpandedShadow` — these are identical across 9 files).

**Q4 — `CalculatorHeader` with `scoreDisplay: ReactNode`.** Yes, flexibility wins. ASPECTS deduction baseline, Boston string label, NIHSS dual-row header all need the escape hatch. The shell still owns `aria-live="polite"` region + aria-label prop so screen-reader behavior is consistent.

**Q5 — NIHSS two-row header.** `secondaryRow?: ReactNode` slot on `<CalculatorHeader>`, not a `<NihssHeader>` subclass. Slot must render *inside* the same sticky `<header>` element and inside the same `max-w-2xl mx-auto px-5` container.

**Q6 — Inter-phase rollback independence.** Mostly safe with one dependency: Phase 2's `CalculatorDrawer` consumes `<Chevron>` from Phase 1. Pick option (b): "reverting Phase 1 also requires reverting Phase 2." Phase 3 → Phase 2 has the same dependency. Directional dependency is one-way (revert in reverse order).

**Q7 — Within-phase commit granularity.** One commit per phase covering all 9 files, NOT per-calculator sub-commits. Per-calculator sub-commits would produce 27 commits and intermediate states where half the calculators use the new shell.

**Q8 — ADR scope.** Single ADR-008 in the same PR as Phase 1. Not split.

**Q9 — Highest-risk regression vectors.** Three, ranked:
1. **`drawer-chevron-hint` animation timing.** Encode in a test or visual diff; do not assume "obviously same."
2. **Portal positioning constants.** After extraction these exist in one place — but the toast belongs in the shared shell too (not per-page).
3. **`hasInteracted` semantics across the binary→partial-complete shape change.** Keep `boolean` input native for binary callers via the discriminated union.

**Dark-mode footnote.** NIHSS, GCS, ICH, ABCD² have `dark:` classes. ASPECTS, Boston, RoPE, HasBled, Heidelberg are light-only. Shared shell must support both. Don't drop dark-mode handling during extraction.

**Q10 — Out-of-scope confirmations.**
- EmBillingCalculator — confirmed excluded.
- Cha2ds2VascCalculator — confirmed excluded. **C6:** file follow-up to bring it onto shell post-L5.6.
- Tests — confirmed excluded.

## Required follow-ups

- **C1 — Phase rollback ordering must be stated in PR body.** "Phase 3 depends on Phase 2 depends on Phase 1. Reverts must be applied in reverse order."
- **C2 — `useDrawerState` input must use a discriminated union** on the `mode` field, not optional fields gated by a string.
- **C3 — `<CalculatorHeader>` keeps `aria-live="polite"`, `aria-atomic="true"`, and accepts `scoreAriaLabel: string` as a prop** — the shell owns screen-reader semantics, the caller owns the visual score render.
- **C4 — ADR-008 lands in the Phase 1 commit**, not as a precursor commit and not deferred. Title: "ADR-008: Calculator shell decomposition — shared primitives, drawer hook, severity-token interface." Document three trade-offs: (a) why interface-only severity-token consolidation, not registry; (b) why ReactNode-slot header, not opinionated score-render API; (c) why one hook with discriminated-union mode, not two hooks.
- **C5 — Toast moves into the shared shell** (not per-page) since markup is byte-identical across 9 files. Hook returns `showToast(message, durationMs?)`; page calls `showToast('Copied to clipboard')`. Retires ~40 lines of duplication per calculator.
- **C6 — File a follow-up TASKS.md item** to migrate Cha2ds2VascCalculator onto the new shell.
- **Mobile-first-developer sign-off must verify** all 9 calculators after **each phase**: visual diff vs pre-L5.6 baseline, drawer animation timing, portal positioning at 375px, dark-mode parity on the 4 calculators that have dark classes today.
- **Test the discovery animation (`drawer-discovery-chevron` + `justCompleted` state) survives extraction.** NIHSS is the only file using it today; `<CalculatorDrawer>` must accept a `justCompleted?: boolean` prop.

## Blocking issues

None. The plan is sound; the conditions above are tightenings, not redirections.
