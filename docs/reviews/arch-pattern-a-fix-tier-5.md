# Architect review — Pattern A fix Tier 5 (Migraine drawer migration + PathwayCocktailSummary)

**Decision:** approve-with-conditions
**Reviewed:** plan + touched files
**Reviewer:** system-architect (model: claude-opus-4-7)
**Date:** 2026-05-16

## Rubric scoring

| # | Item | Score | Rationale |
|---|---|---|---|
| 1 | Duplication risk | concern | TIER_TOKENS will exist in two inlined copies (EVT lines 120–153 and new Migraine inline) plus PathwayBottomDrawer.tsx lines 54–87. Three copies. Acceptable for Tier 5 single-file scope; needs explicit follow-up to extract after PathwayBottomDrawer.tsx retires. |
| 2 | Boundary integrity | pass | `PathwayCocktailSummary` is a UI primitive; consumer maps pillId → category accordion; clinical logic untouched. Drawer is UI primitive; result content moves into it as `children`. |
| 3 | Composability | pass | `PathwayCocktailSummary` is shaped to be reused on any parallel-selection pathway (per §4.9 generalizability). Drawer composition mirrors Tier 4 EVT. State C uses fixed `TIER_TOKENS.Low` (neuro-blue) — clean default for a pathway with no tier vocabulary. |
| 4 | State locality | pass | Cocktail state stays in MigrainePathway; primitive is stateless presentational. `drawerExpanded` lives at drawer call site, matching Tier 4. `pendingRemoval` lives in MigrainePathway since cascade `useEffect` owns timing. |
| 5 | Dependency weight | pass | No new external deps. See condition 2 — shared Chevron doesn't expose `right`, requires E-10 path decision. |
| 6 | Migration exit | concern | Single-file Migraine scope. Dark hero card removal + legacy toast removal + CLIN-2 preservation through `generateSummary` consumption surface change. Risk moderate — all content lives in unchanged `generateSummary`; revert restores prior render path cleanly. Needs explicit rollback note. |

## Rationale

The shape fits. Migraine adopts the same Tier 4 composition (CalculatorDrawer + inlined TIER_TOKENS + inline call-site state) and adds one new primitive (`PathwayCocktailSummary`) whose §4.9 spec is unusually well-specified. The 9 token-level fixes are mechanical and pattern-match Tier 4 cleanups.

Three structural issues need to land in the plan before execution:

1. **TIER_TOKENS triplication.** Tier 4 inlined the constant at the EVT call site rather than extracting to `src/lib/pathways/tierTokens.ts`. Tier 5 should NOT extract now — that change touches EVT and violates the single-file scope discipline. Accept triplication for Tier 5; file follow-up: "Extract TIER_TOKENS to `src/lib/pathways/tierTokens.ts` after PathwayBottomDrawer.tsx retirement (1 week post Tier 4)."

2. **Shared Chevron doesn't support `right`.** Shared `src/components/calculators/Chevron.tsx` only exposes `up | down`. E-10 instructs replacing 4 `lucide ChevronRight` sites with shared Chevron. Three options: (a) extend Chevron to support `right | left` (small, low-risk single-file edit), (b) keep `lucide ChevronRight`, (c) inline SVG at each call site. **Recommend (a)** — extends the shared primitive without forking.

3. **State B trigger rule** — pin deterministically: `drawerState = 'B' if step === 3 && (cocktail.antiemetic || cocktail.ketorolac || cocktail.dexamethasone || cocktail.benadryl)`; State C at `step >= 4`; State A otherwise. State C with `TIER_TOKENS.Low` for both Step 4 and Step 5.

## Required follow-ups (conditions for approve)

1. **State B trigger rule** — adopt as stated above.

2. **Chevron API** — extend shared Chevron with `right | left` directions (single-file primitive extension, no fork). Update E-10 to consume the extended API.

3. **PathwayCocktailSummary contract** — explicit prop shape:
   - `drugs: { pillId: string; label: string }[]` (consumer pre-concatenates "Prochlorperazine 10mg IV")
   - `pendingRemoval: string[]` (pillIds animating out)
   - `onEditDrug(pillId: string): void`
   - Primitive internally calls `navigator.clipboard.writeText(drugs.map(d => d.label).join('\n'))` for copy-all (matches §4.9 line 717 anti-pattern enforcement on `alert()`)
   - `emptyStateText?: string` (default per §4.9 line 706)

4. **Cocktail state → pills derivation** — inline in MigrainePathway near `getStep3Summary` (line 423). Order: selection-order per §4.9 line 691.

5. **TIER_TOKENS triplication** — accept inlined copy at Migraine call site. File explicit follow-up: "Extract TIER_TOKENS to `src/lib/pathways/tierTokens.ts` after PathwayBottomDrawer.tsx retirement." Do NOT extract in Tier 5.

6. **`removedAlerts` removal (E-7)** — also remove the `removedAlerts` state declaration, the `setRemovedAlerts` calls in cascade useEffect (lines 297–298), and the corresponding reset call at line 321. Don't leave dangling state.

7. **SafetyToggle keeps red color (E-5/E-6)** — clinically-motivated retention. `bg-red-100 text-red-800 border-red-200` selected state STAYS; only fix `rounded-lg → rounded-full`, `font-bold → font-semibold`, drop `shadow-inner`. Flag for clinical-reviewer (red affordance retained).

8. **iconKey collisions (E-11/E-12)** — Step 2 → `clinical`, Step 4 → `imaging`. `PathwayRail.tsx` STEP_ICONS already supports all 4 keys; no extension needed.

9. **CLIN-2 phrase preservation note in PR body** — state explicitly: "Treatment Plan content is sourced from unchanged `generateSummary` (line 324). All 12+ CLIN-2 verbatim phrases preserved by construction. Hero card chrome removed; phrase text unchanged."

10. **Rollback note in PR body** — "Migraine drawer migration is a single-file change. `git revert <SHA>` restores prior render path in one step. `PathwayCocktailSummary.tsx` is additive — its presence after revert is dead code, deletable in a follow-up commit."

11. **Route the §17.2 clinical-reviewer artifact** for: (a) CLIN-2 preservation in result content, (b) SafetyToggle red-affordance retention, (c) cocktail copy-format change (header copy = full EMR summary; drawer copy = bare lines — verify both paths are clinically appropriate). **Tier 5 is Class D-clinical.**

12. **Tap-to-edit refs** — Migraine's existing `setStep(N)` + ref-scroll pattern is the model. Quick scan shows `antiemeticRef`, `ketorolacRef`, `cocktailRef` exist; **dexamethasone needs a ref added** for tap-to-edit support.

## Blocking issues

None. Conditions above are clarifications, not structural rebuilds.

---

**Files inspected**

- `docs/specs/PATHWAY_SPEC.md` §4.9 (lines 639–725)
- `docs/reviews/arch-pattern-a-fix-tier-4.md`
- `src/components/calculators/CalculatorDrawer.tsx`
- `src/components/calculators/Chevron.tsx` (confirmed: only `up | down`)
- `src/components/pathways/PathwayBottomDrawer.tsx` (TIER_TOKENS source lines 54–87)
- `src/components/pathways/PathwayRail.tsx` (iconKey vocabulary)
- `src/components/pathways/PathwayCocktailSummary.tsx` (confirmed: does not exist — Tier 5 creates it)
- `src/pages/EvtPathway.tsx` (Tier 4 inlined TIER_TOKENS at lines 120–153)
- `src/pages/MigrainePathway.tsx` (full file scan completed)
- `src/lib/pathways/` (confirmed: directory does not exist)
