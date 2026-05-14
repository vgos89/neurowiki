# L5 Spacing Consistency Audit — NeuroWiki

**Date:** 2026-05-13
**Reviewer:** design-guardian (model: claude-opus-4-7)
**Status:** findings only — no code changes
**Scope:** padding, margin, and gap utilities across calculators, pages, article components, and layout shells. Read-only.

---

## Summary

The 10 calculators on the L5.6 shell hold up well against `CALCULATOR_SPEC.md` §1–§5: the shared `CalculatorHeader`, `CalculatorFooter`, and `CalculatorDrawer` correctly apply `px-5 py-4` / `px-5 py-3`, `mt-14 pt-6 border-t`, and the portal positioning math. Most drift is concentrated in two areas:

1. **Per-calculator drift inside `space-y-10` blocks** — ASPECTS uses `py-3` instead of the `py-3.5` standard option-row padding (§2.2), and NIHSS sits entirely outside the option-row anatomy by rendering large `p-6` cards with pill buttons.
2. **Legacy non-calculator pages** — Home, Calculators hub, ResidentToolkit, TrialsPage, and the five pathways use their own ad-hoc spacing scales (`px-5 pt-7 pb-24`, `bottom-[4.5rem]`, `space-y-8`, `space-y-6`, `gap-8`, `px-8 py-3`). None of these are governed by CALCULATOR_SPEC, but the visual rhythm reads as a different product when navigating between hub and calculator.

Two spec-vs-code drifts also exist:
- `index.css` sets `--tab-bar-height: 60px` while `CALCULATOR_SPEC.md` §5.3 documents `4.5rem` (72px). The variable is the source of truth, the spec is stale.
- NIHSS uses inline `style={{ height: ... }}` instead of `drawer-spacer-collapsed` / `drawer-spacer-expanded` (one-off vs. the other 9 calculators).

No safety-critical findings. No clinical content affected.

---

## Audited surfaces

- All 10 L5.6 calculators: `src/pages/{Abcd2,AspectScore,BostonCriteriaCaa,Cha2ds2Vasc,GlasgowComaScale,HasBledScore,HeidelbergBleeding,IchScore,Nihss,RopeScore}Calculator.tsx`
- Shared shell: `src/components/calculators/{CalculatorHeader,CalculatorDrawer,CalculatorFooter,CalculatorToast,BackArrow,Chevron}.tsx`
- Hubs / non-calc pages: `src/pages/{Home,Calculators,TrialsPage,ResidentToolkit,ResidentGuide}.tsx`
- Pathways: `src/pages/{EvtPathway,MigrainePathway,ElanPathway,StatusEpilepticusPathway,GCAPathway,ExtendedIVTPathway}.tsx`
- Article components: `src/components/article/ArticleLayout.tsx` and 29 files under `src/components/article/stroke/*`
- Layout: `src/components/layout/{Layout,MobileBottomNav,MobileHeader,DesktopRail,DesktopTopBar}.tsx`
- Tokens: `index.css`

---

## Findings — High priority

### H1. ASPECTS option rows use `py-3` instead of `py-3.5`
**Files:** `src/pages/AspectScoreCalculator.tsx:310–311, 358–359`
**Spec:** CALCULATOR_SPEC.md §2.2 (option row `py-3.5`) and §2.4 (touch target rationale).
ASPECTS renders both the cortical and subcortical region rows with `py-3` on both selected and unselected states. Every other Archetype 1 / 2 / 3 calculator (ICH, GCS, ABCD2, RoPE, HAS-BLED, Heidelberg, Boston, CHA₂DS₂-VASc) uses `py-3.5` per spec — verified across 17 occurrences. The 4px difference produces a visibly shorter row in ASPECTS than its peers. Touch target is still ≥44px (≈48px at `py-3`), so this is a consistency finding rather than an accessibility one.

### H2. NIHSS renders cards, not option rows — entire §2.2 anatomy bypassed
**File:** `src/components/NihssItemCard.tsx:48, 50, 66, 124, 132, 141`
**Spec:** CALCULATOR_SPEC.md §3.4 (Rapid mode "identical to Archetype 1"; Detailed mode `py-3` two-line buttons).
`NihssItemCard` wraps each item in `bg-white rounded-2xl border border-slate-200 p-6` with `mb-6` headers and a `grid grid-cols-1 md:grid-cols-2 gap-8` rubric area. Rapid-mode answers render as `flex-wrap gap-2` pill buttons with `px-3 py-2 md:px-5 md:py-3` — at 375px viewport these pills are ~32px tall, well below the 44px minimum and far from the spec's vertical `py-3.5` row layout. This is the largest single deviation from CALCULATOR_SPEC §3.

### H3. NIHSS drawer spacer uses inline style instead of the shared CSS class
**File:** `src/pages/NihssCalculator.tsx:530`
**Spec:** CALCULATOR_SPEC.md §1.3; CSS classes defined in `index.css:328–329`.
NIHSS writes `<div style={{ height: drawerOpen ? '380px' : '80px' }} aria-hidden="true" />` while the other 9 calculators consistently use `<div className={drawerOpen ? 'drawer-spacer-expanded' : 'drawer-spacer-collapsed'} />` (AspectScore:438, Heidelberg:467, IchScore:586, Rope:349, Cha2ds2Vasc:479, HasBled:369, Abcd2:562, Gcs:542, Boston:544). Values agree numerically, but the divergence means a future `index.css` tweak to either spacer would silently miss NIHSS.

### H4. Spec freshness drift — `--tab-bar-height` 60 vs 72
**Files:** `index.css:18` (`--tab-bar-height: 60px`), `src/components/layout/MobileBottomNav.tsx:2,56` (`h-[60px]`).
**Spec:** CALCULATOR_SPEC.md §5.3 documents `--tab-bar-height: 4.5rem; /* 72px — mobile bottom nav measured height */` and §9 changelog v1.0.1 cites it as the canonical value.
Code consensus is 60px; spec is stale at 72px. This is a Design Guardian item: either the variable bumps to 4.5rem (with safe-area), or the spec changelog amends §5.3 to 60px. Not a code bug — the system is self-consistent — but the spec must follow.

---

## Findings — Medium priority

### M1. Hub pages use a different main-padding scale than calculators
**Files:** `src/pages/Home.tsx:75` (`px-5 pt-7 pb-24`), `src/pages/Calculators.tsx:98` (`px-5 pt-7 pb-24`).
**Spec contrast:** CALCULATOR_SPEC.md §1.2 specifies `px-5 pt-6 pb-4` on calculator main content; CalculatorHeader applies `px-5 py-4`.
Home and Calculators hub add 4px top padding (`pt-7` vs `pt-6`) and a 96px bottom padding (`pb-24`) for the mobile tab bar. The bottom padding is intentional (they have no portal drawer reserving space), but the top scale break is gratuitous — either the hubs adopt `pt-6` or the spec adds a "hub" archetype that documents `pt-7`. Currently it's undocumented drift.

### M2. Pathway action bars use `bottom-[4.5rem]` without `env(safe-area-inset-bottom)`
**Files:**
- `src/pages/MigrainePathway.tsx:422, 655`
- `src/pages/StatusEpilepticusPathway.tsx:253, 382, 434`
- `src/pages/ElanPathway.tsx:479`
- `src/pages/GCAPathway.tsx:534` (`bottom-[4.5rem]`)
- `src/pages/EvtPathway.tsx:1523` (`bottom-[4.5rem]`)
- `src/pages/ExtendedIVTPathway.tsx:1307, 1312` (`bottom-20`)
On iPhones with a home indicator (393px+), these fixed bars sit flush against the tab bar but the bar itself adds its own `env(safe-area-inset-bottom)`. The action bar ends up slightly low/clipped on devices with non-zero safe-area. Compare with `CalculatorDrawer.tsx:106,141,207` which uses `calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))` correctly. Also note: the hardcoded `4.5rem` agrees with the spec's stale `--tab-bar-height` value (72px) rather than the actual 60px nav — so these bars sit ~12px higher than they need to.

### M3. Spec drift — `bottom-20` in `ExtendedIVTPathway` toast (80px vs 60px nav)
**File:** `src/pages/ExtendedIVTPathway.tsx:1307, 1312`
Two toast pills sit at `bottom-20` (80px), neither matches the 60px tab-bar nor the 72px spec value, nor uses the `--tab-bar-height` variable. They appear ~20px above the nav rather than seated against it.

### M4. ResidentToolkit option rows use `py-3` and `py-3.5` inconsistently
**File:** `src/pages/ResidentToolkit.tsx:338, 366`
The category header button uses `px-4 py-3.5` while the nested guide links use `px-5 py-3`. Both are in the same expanded category card; this produces a slight rhythm break (56px header → 48px child). Either both should be `py-3.5` or both `py-3`. The spec doesn't govern ResidentToolkit specifically, but consistency within the same component should hold.

### M5. NIHSS item-internal margins use `mb-6` everywhere — heavier than peers
**File:** `src/components/NihssItemCard.tsx:50, 66, 124`
The header, rubric grid, and warning all use `mb-6` (24px) between blocks inside a `p-6` card. Section gap is then a grid `gap-6` between cards (NihssCalculator.tsx:472). Cumulative vertical rhythm reads as significantly looser than the other calculators where sections sit at `space-y-10` between `mb-3` h2s. This pairs with H2 — both are symptoms of NIHSS not having been migrated to the §3 option-row pattern.

### M6. CalculatorToast vs EmBillingCalculator toast positioning split
**Files:** `src/components/calculators/CalculatorToast.tsx:25` (`fixed bottom-24 ... z-[60]`), `src/pages/EmBillingCalculator.tsx:2474` (`fixed bottom-24 ... z-[60]`).
Both consistent at `bottom-24` (96px) for toasts above the tab bar. However, `ExtendedIVTPathway.tsx:1307, 1312` toasts use `bottom-20` (80px), creating three different "toast above nav" offsets across the app: 80, 96, and the calc drawer's `calc(--tab-bar-height + env(...))`. Standardize on one value.

### M7. ArticleLayout header height vs CalculatorHeader
**File:** `src/components/article/ArticleLayout.tsx:32` (`h-14` = 56px).
CalculatorHeader's single-row variant uses `py-4` which yields ~56–60px depending on inner content. Close but not identical. If an article and a calculator are reached from the same nav, the sticky-header heights wobble by 2–4px on transition. Cosmetic but visible.

---

## Findings — Low priority

### L1. CookieConsentBanner uses custom `safe-area-pb` class
**File:** `src/components/CookieConsentBanner.tsx:22`; class defined `index.css:189–191`.
The class exists and works; just worth noting it's a NeuroWiki-local utility rather than a Tailwind plugin. Other fixed-bottom elements (`MobileBottomNav`, `EvtPathway` action bar) use the inline `style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}` form. Single rendering pattern would tidy this up.

### L2. Pill row paddings differ by ~2px between scenarios
**Files:**
- `src/components/home/ScenarioPillRow.tsx:21` (`px-3 py-1.5`)
- `src/pages/TrialsPage.tsx:319, 338, 357` (`px-3 py-[5px]`)
- `src/components/calculators/CategoryPillRow.tsx` (uses similar pattern — verified via Glob earlier)
`py-1.5` = 6px, `py-[5px]` = 5px. Visually similar but technically three different "pill" sizes. Picking one (recommend `py-1.5`) would unify the chip system referenced in TRIALS_SPEC.md §L3.

### L3. NihssItemCard pill buttons fall below the 44px touch minimum at mobile
**File:** `src/components/NihssItemCard.tsx:141` (`px-3 py-2 md:px-5 md:py-3`).
At 375px viewport (mobile), height ≈ 32px (`py-2` = 8px + line-height). At md: breakpoint they grow to ≈40px. Neither meets the §2.4 minimum. Tagged Low because the field-input path on the dedicated NIHSS page may be intended for tap-and-roll-through and the spec migration in H2 will fix this incidentally.

### L4. `space-y-3`/`space-y-4`/`space-y-6` heavy use in pathways without a documented scale
**Files (representative):** `src/pages/StatusEpilepticusPathway.tsx` (`space-y-6` × 4, `space-y-3` × 5), `src/pages/EvtPathway.tsx` (`space-y-6` × 10, `space-y-3` × 4), `src/pages/MigrainePathway.tsx` (`space-y-4` × 5).
The calculator spec uses `space-y-10` as its single section-spacing primitive. Pathways use 3/4/6/8 ad-hoc. There is no PATHWAY_SPEC.md authority for what "between two pathway steps" should be — so this is parking-lot for whenever a pathway spec is drafted, not a fix-now finding.

### L5. NihssCalculator footer placement relative to drawer spacer
**File:** `src/pages/NihssCalculator.tsx:523–530`
Footer renders inside main, immediately above the drawer spacer. Other calcs place the spacer outside the `space-y-10` block but inside `<main>`. Cosmetically equivalent but the structural difference is worth aligning if NIHSS is ever refactored toward the option-row pattern (H2).

### L6. `gap-3.5` in TrialsPage list rows is unique in the codebase
**File:** `src/pages/TrialsPage.tsx:249, 280`
`gap-3.5` = 14px appears only on these two `Link` rows. Everywhere else uses `gap-3` or `gap-4`. Either round to `gap-3` (12px) or document as a deliberate trial-list spacing.

### L7. Modal footer paddings vary
**Files:** `src/components/AspectsModal.tsx:244` (`sticky bottom-0 ... px-5 py-4`), `src/components/article/stroke/ThrombolysisEligibilityModal.tsx`, `TpaReversalProtocolModal.tsx`, `HemorrhageProtocolModal.tsx` (`flex-shrink-0 w-8 h-8` close, internal `p-4` or `p-5`).
No spec governs these modals. Internal padding ranges between `p-4` and `p-5`. Worth a one-time tidy.

### L8. Mobile-first developer concern — pathway action bars block content
Same files as M2. With `bottom-[4.5rem]` and `p-4` the action bar is ~64–72px tall plus tab bar — without a corresponding spacer div above main content, the last paragraph of pathway steps can be hidden behind the bar on short viewports. Calc pages solve this with `drawer-spacer-*`; pathways do not.

---

## Recommended next steps

1. **Open a `C-clinical` task** to migrate NIHSS to CALCULATOR_SPEC §3 — converts `NihssItemCard` to the §2.2 option-row anatomy, replaces the inline drawer-spacer with the shared CSS class, brings `py-3.5` consistency. Addresses H2, H3, M5, L3, L5 together. (NIHSS content is clinical so any restructure inherits `-clinical`.)
2. **Open a `C` task** to fix ASPECTS option rows `py-3 → py-3.5` (H1). One-line per occurrence × 4. Pure design fix, no clinical impact.
3. **Open a spec changelog task** for CALCULATOR_SPEC §5.3 — reconcile `--tab-bar-height` documentation with the actual `60px` value, or change the variable to `4.5rem` and update Layout.tsx accordingly (H4).
4. **Open a `C` task** for pathway action bars (M2, M3) — adopt `calc(var(--tab-bar-height) + env(safe-area-inset-bottom, 0px))` everywhere, deprecate `bottom-[4.5rem]` and `bottom-20` literals. Standardize toast at `bottom-24`. Addresses M2, M3, M6.
5. **Parking lot** the hub padding scale (M1) and pathway spacing vocabulary (L4) for a future PATHWAY_SPEC / HUB_SPEC amendment — these are vocabulary gaps, not bugs.
6. **Parking lot** L1, L2, L6, L7 as a single "spacing-utilities cleanup" sweep to schedule after the higher-priority items land.

No clinical content was reviewed. No code changes were made.
