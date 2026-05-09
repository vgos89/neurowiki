# UI Architecture Audit — NeuroWiki Full-Repo Agent Audit

**Agent:** ui-architect  
**Date:** 2026-05-08  
**Commit audited:** 9627e0e  
**Branch:** main  

---

## Overall UI Consistency Rating: YELLOW

The design system has a well-defined token layer (`index.css` with `@theme` block, `--color-neuro-*` scale, `--tab-bar-height`, `--cobalt-soft`, row-card CSS classes) and the layout shell is coherent. However, three structural problems pull this below Green: (1) `TrialPageNew.tsx` at 7,470 lines is a monolithic if/else dispatch that embeds per-trial layout directly in JSX, making it unmaintainable and inconsistent across trials; (2) inline `style={}` objects are pervasive across 27 component files (153 occurrences) and 39+ page files, bypassing the token system for colors, spacing, and typography; (3) dark mode is partial — it is implemented in layout chrome, article components, and some calculators, but entirely absent from the trials component subtree (`TeachingWell`, `SubgroupWell`, `BottomLineDrawer`, `HistoricalContextSection`). The gap between the well-spec'd primitives and the actual implementation state is the defining finding.

---

## Finding 1 — Component Reuse

**Severity: P1**

**Description:** Hub hero components (`HomeHero`, `CalculatorsHero`, `GuideHero`, `PathwaysHero`) are four near-identical files each rendering a `div > [eyebrow div] > h1 > p` structure with identical token usage. The only variation is the eyebrow label string, the count source, and the subtitle copy. Similarly, `CategorySection` (Calculators), `AreaSection` (Guide), and `ScenarioSection` (Pathways) share the same HUB_SPEC §1.5 section-header markup — colored dot, title, count, lede — but are implemented as three separate components with duplicated JSX.

The `navHref` utility function that forwards `?scenario=` and `?favs=` URL params is copy-pasted verbatim between `DesktopRail.tsx` and `MobileBottomNav.tsx`. Any future change to forwarding rules must be made in two places.

`ToolRowCard` is correctly centralized as a shared primitive. The star/favourite icon SVG polygon, however, is duplicated inline in `ToolRowCard`, `TrialLegendCard`, and `NihssCalculator` rather than extracted to a shared `FavouriteIcon` component.

**Recommended fix:**
- Extract a `HubHero` primitive that accepts `eyebrow`, `title`, and `lede` props. All four hero components become single-line callers.
- Extract a `HubSectionHeader` primitive for the dot + title + count + lede pattern. `CategorySection`, `AreaSection`, and the Pathways equivalent all use it.
- Move `navHref` to `src/utils/navHref.ts` and import from both nav components.
- Extract a `StarIcon` component or use an existing icon library export consistently.

---

## Finding 2 — Design Token Consistency

**Severity: P1**

**Description:** The `@theme` block in `index.css` defines the canonical token set (`--color-neuro-50` through `--color-neuro-900`, `--tab-bar-height`, `--font-sans`). Additional design intent lives in CSS custom properties (`--cobalt-soft`, `--shadow-card-hover`, `--ease-discovery`). However, component files heavily bypass this system via inline `style={}` objects and hardcoded hex values in Tailwind class strings.

Specific violations found:

- `BottomLineDrawer.tsx`: The `RESULT_BADGE` constant is a plain JS object of `React.CSSProperties` with hardcoded hex values (`#EEF2FF`, `#1746A2`, `#dc2626`, `#fca5a5`, etc.) for 8 badge variants. The drawer container itself uses `style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}`. The bedside pearl block uses `style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 6px 6px 0', padding: '10px 12px' }}`.

- `SubgroupWell.tsx` and `TeachingWell.tsx` both declare `const wellStyle: React.CSSProperties = { background: '#f8fafc', borderLeft: '2px solid #1746A2', borderRadius: '0 8px 8px 0' }` — identical structures in two files with no shared definition.

- `TrialPageNew.tsx` (7,470 lines): Hundreds of inline style objects across per-trial JSX blocks. Examples: `style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}`, `style={{ background: '#EEF2FF', borderLeft: '3px solid #1746A2', borderRadius: '0 10px 10px 0', padding: '16px 18px' }}`, `style={{ color: '#1746A2', fontWeight: 600, textDecoration: 'underline' }}`.

- `Chip.tsx`: Active state uses `bg-[rgba(23,70,162,0.08)] border-[rgba(23,70,162,0.2)] text-[#1746A2]` — raw hex values rather than `bg-neuro-50 border-neuro-200 text-neuro-500` which the token scale supports.

- `TrialLegendCard.tsx`: `CAT_DOT_COLOR` record maps category keys to hardcoded hex values for most categories, with only `evt` using `var(--color-neuro-500)`.

- `tailwind.config.js` is effectively empty (`content` paths only, no `theme.extend`). All tokens live in `@theme` inside `index.css` per Tailwind v4 convention — this is correct. But the sparse config means there are no Tailwind-safe-listed class names for the token values, creating a risk that purging removes utility classes for values not used in className strings.

The Tailwind v4 `@theme` approach is correct. The violation is the parallel system of inline objects and hardcoded hex literals that bypass it. The goal should be: all colors reference `text-neuro-*` / `bg-neuro-*` / `border-neuro-*` from the token scale, and structural one-off styles (border-radius, custom padding) belong in CSS component classes in `index.css`, not inline.

**Recommended fix:**
- Replace `RESULT_BADGE` inline style objects in `BottomLineDrawer` with Tailwind utility class strings using the `neuro-*` scale and standard `red-`, `amber-`, `emerald-` palette classes.
- Extract the `wellStyle` constant to a shared CSS class in `index.css` (e.g., `.cobalt-well`) applied by both `TeachingWell` and `SubgroupWell`.
- Replace `text-[#1746A2]` with `text-neuro-500`, `bg-[#EEF2FF]` with `bg-neuro-50`, and `text-[#0E2D6B]` with `text-neuro-700` throughout — these all map directly to existing tokens.
- Audit `Chip.tsx` active state to use token class names.

---

## Finding 3 — Layout System

**Severity: P2**

**Description:** The layout shell is well-designed and well-documented. `Layout.tsx` is clean (76 lines), spec-cited, and correctly delegates to `DesktopRail`, `DesktopTopBar`, `MobileHeader`, and `MobileBottomNav`. The zone system (`zone-reading` / `zone-reference` in CSS, applied via `routeManifest`) is a sensible solution for width control. Dark mode on the shell (`bg-white dark:bg-slate-900`) is present and consistent.

Two structural issues:

1. `ArticleLayout.tsx` duplicates the sticky header pattern independently of the main layout shell. It renders its own `<header className="sticky top-0 z-20 ...">` with its own back button, view mode toggle, and breadcrumb. This means article pages have two stacked sticky headers — the global chrome from `Layout.tsx` (MobileHeader at z-40) plus the article's own at z-20. The z-index ordering works, but the composition model is fragile: any height change to MobileHeader requires a compensating change in `ArticleLayout`.

2. `NihssCalculator.tsx` also renders its own sticky header (`sticky top-0 z-40`) for the scoring tally bar. This is appropriate for the calculator's specialized chrome but uses `border-slate-200` while the global shell uses `border-slate-100` — a minor token inconsistency.

The `DesktopRail` and `MobileBottomNav` share the `RAIL_ITEMS` / `NAV_TABS` data in a copy-paste pattern (different variable names, same content). A shared `NAV_ITEMS` constant would be correct.

**Recommended fix:**
- Define a shared `NAV_ITEMS` constant in `src/config/navItems.ts` consumed by both rail and bottom nav.
- Document the sticky header composition model in LAYOUT_SPEC: when a page renders its own sticky sub-header, it should use `top-[60px]` (offset by the global header height) to avoid overlap risk.
- Standardize `border-slate-100` vs `border-slate-200` — pick one for internal chrome dividers and encode it in LAYOUT_SPEC.

---

## Finding 4 — Calculator UI Quality

**Severity: P2**

**Description:** The two sampled calculators (`NihssCalculator`, `IchScoreCalculator`) show meaningfully different implementation approaches:

`IchScoreCalculator` is the better-spec'd calculator. It cites `CALCULATOR_SPEC.md` throughout, uses `SEVERITY_TOKENS` for color mapping via Tailwind classes (not inline styles), has a clean 4-state drawer (`A/B/C` — note State D removed per spec), uses `createPortal` for the drawer (correct), and implements keyboard navigation with a roving tabindex. The section label pattern `text-[10px] font-bold text-slate-400 uppercase tracking-widest` matches the design system rule.

`NihssCalculator` diverges in several ways:
- The mode toggle (Rapid/Detailed) is a hand-rolled `div > button > button` using `bg-slate-100 dark:bg-slate-700 rounded-md` with active state as `bg-white dark:bg-slate-600 shadow-sm` — this is a parallel implementation of the `Toggle` primitive in `src/components/ui/Toggle.tsx`. The `Toggle` component exists precisely for this pattern.
- The LVO tooltip uses `fixed md:absolute inset-x-4 top-32` positioning — raw pixel offsets rather than a token-based approach. It also hardcodes `shadow-xl` which violates the design system rule (no arbitrary shadow classes; use `--shadow-card-hover`).
- Header label font size is inconsistently responsive: `text-[8px] md:text-[10px]` vs the design system rule `text-[10px]`. The 8px label is below the legibility floor for clinical use.
- The `NihssItemCard` uses `border-slate-200` for the card border, while CLAUDE.md rules specify `border-slate-100` for section cards. The card itself uses `rounded-2xl` where the design system specifies `rounded-xl`.
- The `p-6` padding on `NihssItemCard` is correct. The `bg-white` + `border` card structure is correct.

There is no shared `CalculatorShell` component. Each calculator page independently implements: sticky header with back button, score tally display, action buttons (copy/reset/fav), and drawer. The `IchScoreCalculator` pattern is the better template; it could be extracted as a `CalculatorShell` that other calculators compose.

**Recommended fix:**
- Replace the hand-rolled toggle in `NihssCalculator` with the `Toggle` primitive from `src/components/ui/Toggle.tsx`.
- Raise the minimum label font size to `text-[10px]` (remove `text-[8px]` responsive variant).
- Align card border to `border-slate-100` and radius to `rounded-xl` in `NihssItemCard`.
- Extract a `CalculatorShell` component capturing the sticky header + action bar pattern from `IchScoreCalculator` as the canonical template.

---

## Finding 5 — Trial UI Quality

**Severity: P0**

**Description:** `src/pages/trials/TrialPageNew.tsx` is 7,470 lines. It is a single component file containing per-trial JSX blocks for every shipped trial, dispatched via a sequential `if (trialId === '...')` chain. This is the most significant architectural problem in the entire UI layer.

Consequences:
- No visual consistency guarantee: each trial block is hand-authored with slightly different markup. Some use `bg-slate-50` backgrounds, some `bg-white`, some use `rounded-xl`, some `rounded-[10px]`. Some bedside pearl blocks use `border-radius: '0 10px 10px 0'` (inline style, 10px), others use `0 6px 6px 0` (inline style, 6px).
- Inline styles dominate: `style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', letterSpacing: '0.02em' }}` appears many times across different trial blocks — each is a siloed copy with no shared definition.
- The `BottomLineDrawer`, `TeachingWell`, `SubgroupWell`, and `HistoricalContextSection` components are the correct abstraction targets. They exist and are well-designed. The issue is that `TrialPageNew.tsx` is not composed from them consistently — some trial blocks use them, others re-implement equivalent patterns inline.
- The `TRIALS_SPEC v1.0 §10.*` components (`TeachingWell`, `SubgroupWell`, `BottomLineDrawer`) have no dark mode support. Their background colors (`#f8fafc`, `white`) and border colors (`#1746A2`, `#e2e8f0`) are hardcoded — they will render incorrectly in dark mode.

The correct architecture is a data-driven `TrialPage` that accepts a typed `TrialPayload` and renders a fixed template: `TrialHeader > TrialSummaryCard > PrimaryOutcomeSection > VisualizationSection > [optional HistoricalContextSection] > [optional SubgroupWell] > TeachingWell > BottomLineDrawer`. Per-trial variation lives in data, not in JSX branches.

**Recommended fix (Class D — requires architect review):**
- Define a `TrialPageTemplate` component that composes the canonical section sequence from existing primitives.
- Migrate per-trial JSX blocks to `TrialPayload` data entries.
- Add dark mode tokens to `TeachingWell`, `SubgroupWell`, `BottomLineDrawer`, and `HistoricalContextSection`.
- The 7,470-line file should ultimately reduce to ~150 lines of template + data imports.

---

## Finding 6 — Dark Mode

**Severity: P1**

**Description:** Dark mode is implemented via class-based `dark:` variant (`.dark` on html/body, per `index.css` `@custom-variant dark`). Coverage is uneven:

**Has dark mode:**
- `Layout.tsx` shell (`bg-white dark:bg-slate-900`)
- `ArticleLayout.tsx` (comprehensive — all surfaces covered)
- `NihssCalculator.tsx` and `NihssItemCard.tsx` (comprehensive)
- `IchScoreCalculator.tsx` (partial — drawer uses `bg-white` without dark variant via inline style)
- `TrialLegendCard.tsx` (good coverage)
- `TrialVisualizations.tsx` (41 dark: usages)
- `Chip.tsx` (dark variants present)
- Stroke sub-components (`SectionPearls`, `TimestampBubble`, `VitalsSection`, etc.)

**Missing dark mode:**
- `BottomLineDrawer.tsx`: drawer container uses `style={{ background: 'white', borderTop: '1px solid #e2e8f0' }}` — hardcoded white, no dark variant. Bedside pearl block hardcoded `#EEF2FF` background.
- `TeachingWell.tsx`: `wellStyle` has `background: '#f8fafc'` — hardcoded light surface.
- `SubgroupWell.tsx`: same `wellStyle` issue. `amberCaveatStyle` hardcoded `#fef3c7` background.
- `HistoricalContextSection.tsx`: no dark mode.
- Most `TrialPageNew.tsx` per-trial inline styles: `background: '#f8fafc'`, `background: 'white'`, etc.
- `DesktopRail.tsx`: `bg-white border-r border-slate-100` without dark variants (the rail appears white even in dark mode).
- `DesktopTopBar.tsx`: same issue — `bg-white border-b border-slate-100` without dark.

The layout shell's dark background is applied via `bg-white dark:bg-slate-900` on the outer container, but the inner `DesktopRail` and `DesktopTopBar` are not dark-aware, producing a white sidebar and topbar on a dark main area.

**Recommended fix:**
- Add `dark:bg-slate-800 dark:border-slate-700` to `DesktopRail` and `DesktopTopBar`.
- Replace `wellStyle` inline object in `TeachingWell`/`SubgroupWell` with a CSS class `.cobalt-well` that includes `@media` or dark variant handling.
- Replace hardcoded white `background` in `BottomLineDrawer` container with a Tailwind class: `bg-white dark:bg-slate-800`.

---

## Finding 7 — Visual Hierarchy

**Severity: P2**

**Description:** The hub pages (Calculators, Guide, Pathways) have coherent hierarchy: eyebrow label → H1 count → lede → pill filter row → section headers → row cards. The token usage is consistent within these pages: `text-[10px] font-bold text-slate-400 uppercase tracking-widest` for section labels; `text-[15px] font-semibold text-slate-900` for section titles; `text-[14.5px] font-semibold text-slate-900` for card titles.

Issues:
- The `Section` component in `src/components/article/Section.tsx` renders `<h2>` at `text-xl font-semibold`. The `ArticleLayout` renders `<h1>` at `text-3xl md:text-4xl font-bold`. This hierarchy is semantically correct but visually heavy relative to the hub pages, creating a tonal inconsistency between the article reading experience and the hub scanning experience.
- `ArticleLayout` uses `text-blue-600` (standard Tailwind palette) for the category breadcrumb — this is not from the `neuro-*` token scale. It should be `text-neuro-500`.
- `ArticleLayout` uses `text-blue-600` for related links as well. Same issue.
- `Warning` and `Note` in `Callouts.tsx` use `border-l-2` which the design rules flag as prohibited (`no border-2`). The `border-l-2` shorthand is not `border-2` exactly, but the spirit of the rule — no arbitrary border widths — applies. The system uses 1px borders everywhere else; 2px in callouts is intentional but undocumented.
- `Critical` in `Callouts.tsx` renders as `<strong className="text-red-700">` — this is a semantic inline element, not a block callout. It is inconsistent with the block patterns of `Warning` and `Note`.

**Recommended fix:**
- Change `text-blue-600` to `text-neuro-500` in `ArticleLayout` (breadcrumb, related links).
- Document the `border-l-2` usage in callouts as an intentional design decision in `LAYOUT_SPEC` or `index.css`.

---

## Finding 8 — Reusable UI Primitives

**Severity: P1**

**Description:** `src/components/ui/` contains only `Chip.tsx` and `Toggle.tsx`. This is insufficient for a tool of this complexity.

Observed reinventions across the codebase:

| Pattern | Where it appears | Should be |
|---|---|---|
| Segmented toggle / tab switcher | `NihssCalculator.tsx` (hand-rolled), `ArticleLayout.tsx` (hand-rolled Quick/Detailed), `Toggle.tsx` (canonical) | `Toggle` from `ui/` |
| Badge / pill (result tag) | `BottomLineDrawer.tsx` (JS object), `TrialPageNew.tsx` (inline Tailwind), `TrialLegendCard.tsx` (inline Tailwind) | A shared `Badge` primitive |
| Collapsible / accordion | `TeachingWell.tsx`, `SubgroupWell.tsx`, `CollapsibleSection.tsx` (root level), `ScenarioSection.tsx` | A shared `Accordion` or `CollapsiblePanel` primitive |
| Left-border well / callout block | `TeachingWell`, `SubgroupWell`, `BottomLineDrawer` bedside pearl, `TrialPageNew.tsx` bedside pearl blocks | A shared `CobaltWell` block |
| Toast notification | `NihssCalculator.tsx` (inline), `IchScoreCalculator.tsx` (inline) | A shared `Toast` primitive |
| Section label (eyebrow) | Used in 10+ components with exact same `text-[10px] font-bold text-slate-400 uppercase tracking-widest` | A `SectionLabel` component or documented CSS class |

The `ArticleLayout.tsx` view mode toggle uses plain text buttons with a pipe separator (`|`) rather than the `Toggle` component. This is a direct reuse opportunity that was missed.

`CollapsibleSection.tsx` exists at the root of `src/components/` and is a general-purpose accordion. `TeachingWell` and `SubgroupWell` could derive from it.

**Recommended fix (Class C, no clinical content):**
- Move `CollapsibleSection` into `src/components/ui/Accordion.tsx`.
- Add `Badge`, `Toast`, `SectionLabel`, and `CobaltWell` to `src/components/ui/`.
- Wire `ArticleLayout` quick/detailed toggle to `Toggle` primitive.
- Wire `NihssCalculator` mode toggle to `Toggle` primitive.

---

## Finding 9 — Article System

**Severity: P2**

**Description:** The `src/components/article/` primitives (`Section`, `SubSection`, `Paragraph`, `Trial`, `Callouts`, `ArticleLayout`) are clean and well-factored. The `index.ts` barrel export is correct. The components are appropriately small (all under 130 lines).

The `src/components/article/stroke/` subdirectory contains 29 sub-components for the stroke code workflow. These are meaningfully more complex — `CodeModeStep1.tsx` is 430 lines, `EligibilityCheckerV2.tsx` is ~335 lines, `CodeModeStep2.tsx` is ~300 lines. None of these are over the 500-line split threshold, but they are approaching it.

The `CodeModeStep1.tsx` component manages a large amount of local state (LKW time, NIHSS score, vitals, weight, BP, eligibility checkbox) and renders a complex multi-section form. This complexity is inherent to the clinical workflow it represents, but splitting the rendering into sub-sections (LKWSection, VitalsSection — which already exist as separate components) and keeping `CodeModeStep1` as an orchestrator would reduce the perceived cognitive load.

`ThrombolysisEligibilityModal.tsx` is a modal that is opened from inside `EligibilityCheckerV2`. Both are embedded inside `CodeModeStep1`. The nesting depth of workflow orchestration is high, but the separation between data flow and rendering is adequate.

The stroke sub-components use `text-red-`, `text-green-`, `text-amber-` Tailwind classes extensively (these are standard Tailwind semantic colors for clinical statuses — this is appropriate). They do not use `text-blue-*` in place of `text-neuro-*` (a distinction the article components get wrong, as noted in Finding 7).

**Recommended fix:**
- No split needed yet — all components are under 500 lines.
- Add `AnalogClockPicker` and `LKWTimePicker` to the barrel export in an `article/stroke/index.ts` if these are reused outside their immediate parent.
- Extract the remaining LKW orchestration from `CodeModeStep1` into the existing `LKWSection` component to reduce step 1's line count proactively.

---

## Finding 10 — Component File Size

**Severity: P0 (TrialPageNew.tsx only)**

**Description:**

| File | Lines | Status |
|---|---|---|
| `src/pages/trials/TrialPageNew.tsx` | 7,470 | Critical — split required |
| `src/components/trials/TrialVisualizations.tsx` | 719 | Yellow — approaching threshold |
| `src/pages/NihssCalculator.tsx` | 306 | Green |
| `src/pages/IchScoreCalculator.tsx` | ~500 | Yellow — at threshold |
| `src/components/article/stroke/CodeModeStep1.tsx` | 430 | Green |
| `src/components/article/stroke/EligibilityCheckerV2.tsx` | ~335 | Green |
| `src/components/trials/BottomLineDrawer.tsx` | 304 | Green |

`TrialPageNew.tsx` at 7,470 lines is the only file that requires an immediate split. It contains JSX for approximately 25-30 individual trial pages concatenated in a single file, dispatched via `if (trialId === '...')` branching. Each branch is itself a mini-page ranging from ~100 to ~400 lines.

`TrialVisualizations.tsx` at 719 lines contains multiple chart sub-components (`DistributionChart`, `ForestPlotSection`, `KaplanMeierSection`, etc.) as local functions. These could be split into named files in `src/components/trials/charts/` but this is not urgent.

**Recommended fix:**
- `TrialPageNew.tsx`: extract each trial's JSX into a `TrialPageTemplate` component and move per-trial data to `TrialPayload`. This is a Class D refactor requiring architect review.
- `TrialVisualizations.tsx`: promote internal chart functions to named exports in `src/components/trials/charts/` — Class C refactor.

---

## Top 5 UI Opportunities

1. **Extract `TrialPageTemplate` from `TrialPageNew.tsx`** — The 7,470-line file is a maintenance liability and a visual inconsistency source. A single-template approach with data-driven variation would enforce consistent card sizing, border radii, spacing, and dark mode support across all 25+ trial pages. This is the highest-leverage change in the UI layer. Class D.

2. **Expand `src/components/ui/` with 5 shared primitives** — `Badge`, `Toast`, `SectionLabel`, `CobaltWell`, `Accordion`. These patterns exist in 10+ places across the codebase today. Centralizing them would lock the visual contract for each pattern and eliminate divergence. Class C (no clinical content).

3. **Replace inline hex values in `BottomLineDrawer`, `TeachingWell`, `SubgroupWell` with token classes** — The `--color-neuro-*` scale maps directly to the hardcoded hex values in these files (`#EEF2FF` = `neuro-50`, `#1746A2` = `neuro-500`, `#0E2D6B` = `neuro-700`). Token alignment is a Class B/C change with no clinical content risk and immediate dark mode benefit.

4. **Complete dark mode for the layout chrome** — `DesktopRail` and `DesktopTopBar` are white in dark mode while the main content area is `slate-900`. Adding `dark:bg-slate-900 dark:border-slate-800` to both components is a 2-line change per file (Class B). The trials component subtree (`TeachingWell`, `SubgroupWell`, `BottomLineDrawer`) needs the same treatment (Class C).

5. **Wire existing `Toggle` primitive to its two missed call sites** — `NihssCalculator.tsx` (Rapid/Detailed mode) and `ArticleLayout.tsx` (Quick/Detailed view) both hand-roll segmented controls that duplicate the `Toggle` component already in `src/components/ui/Toggle.tsx`. Replacing them eliminates duplicate code and guarantees consistent animation and keyboard behavior. Class B each.

---

## @ui-architect — Sign-off

**Spec cited:**
- `index.css` — `@theme` token definitions, `@custom-variant dark`, `.rowcard`, `.cobalt-well`, `.selected-option`, `.drawer-*` classes
- `CLAUDE.md` §5 Rule "No arbitrary values. Tokens only." / "Every section card uses bg-white border border-slate-100 rounded-xl p-4" / "Every section label uses text-[10px] font-bold uppercase tracking-widest text-slate-400"
- `src/components/ui/Toggle.tsx` — canonical segmented control
- `src/components/trials/BottomLineDrawer.tsx` / `TeachingWell.tsx` / `SubgroupWell.tsx` — trials spec primitives
- `src/pages/trials/TrialPageNew.tsx` — monolithic trial dispatch file
- `src/components/layout/Layout.tsx`, `DesktopRail.tsx`, `DesktopTopBar.tsx`, `MobileBottomNav.tsx` — layout shell

**Layout decisions:**
- Zone system (`zone-reading` / `zone-reference`) is sound and well-implemented.
- Layout shell composition (DesktopRail + DesktopTopBar on md+, MobileHeader + MobileBottomNav on mobile) is clean and correct.
- Sticky header layering (global chrome at z-40, article sub-header at z-20, calculator tally at z-40) works but is fragile — any chrome height change creates cascading alignment issues.

**Deviations from spec:**
- `NihssItemCard` uses `border-slate-200` and `rounded-2xl` where spec mandates `border-slate-100` and `rounded-xl`. Minor but tracked.
- `ArticleLayout` uses `text-blue-600` (not `text-neuro-500`) for breadcrumb and links.
- Dark mode is absent from the full trials component subtree despite the shell supporting it.

**Risks flagged:**
- `TrialPageNew.tsx` at 7,470 lines is a build-time risk (tree-shaking effectiveness) and a correctness risk (visual drift between trial blocks is undetectable without manual review of every branch). Any refactor of this file is Class D and requires system-architect review.
- The `border-l-2` in `Callouts.tsx` — if this is intentional per spec, it should be explicitly listed as an approved deviation in LAYOUT_SPEC to prevent future linting false positives.
- Inline `style={}` objects in trials components bypass dark mode entirely. Any user enabling dark mode today sees a broken trials experience (white cards on dark background in `TeachingWell`, `SubgroupWell`, `BottomLineDrawer`).

**Status:** ready
