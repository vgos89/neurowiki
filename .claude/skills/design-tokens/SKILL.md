---
name: design-tokens
description: NeuroWiki design token reference — neuro-* color palette, Tailwind conventions, component anatomy, CALCULATOR_SPEC.md v1.1 tokens, shadcn/ui usage rules. Load when implementing or auditing any UI component, calculator, or page layout.
---

# Design Tokens — NeuroWiki

## Brand palette (neuro-*)

These are the canonical brand colors. Never use raw hex in JSX when a token exists.

| Token | Hex | Usage |
|---|---|---|
| `neuro-50` | #EEF2FF | Tint backgrounds, cobalt-soft |
| `neuro-100` | #E0E7FF | Light accent backgrounds |
| `neuro-200` | #C7D2FE | Borders, dividers |
| `neuro-300` | #A5B4FC | Muted interactive |
| `neuro-400` | #818CF8 | Secondary interactive |
| `neuro-500` | #1746A2 | **Primary brand — cobalt** — CTAs, links, active states |
| `neuro-600` | #1239A0 | Hover on primary |
| `neuro-700` | #0F2D8A | Focus ring, pressed |
| `neuro-800` | #0A1F6B | Dark accents |
| `neuro-900` | #060E40 | Near-black brand text |

CSS variable aliases: `--color-neuro-500`, `--cobalt-soft` (rgba(23,70,162,0.08)).

**Forbidden**: `blue-*`, `indigo-*`, `violet-*`, `bg-blue-500` — always use `neuro-*`.

## Slate scale (neutral UI)

Use `slate-*` for all neutral UI. No `gray-*`, `zinc-*`, `neutral-*`, `stone-*`.

| Common tokens | Usage |
|---|---|
| `slate-50` | Page backgrounds (light) |
| `slate-100` | Hairline borders, card backgrounds |
| `slate-200` | Dividers |
| `slate-400` | Muted text, placeholders |
| `slate-500` | Secondary text |
| `slate-600` | Body text |
| `slate-700` | Dark mode borders |
| `slate-800` | Dark mode card backgrounds |
| `slate-900` | Headings, primary text |
| `white / dark:slate-800` | Card surface pattern |

## Severity tokens (CALCULATOR_SPEC.md v1.1 §6)

Used in GCS, ICH Score, NIHSS calculators. Never hardcode severity colors — always use the SEVERITY_TOKENS record.

| Severity | Label color class | Border | Header bg | Dark variants |
|---|---|---|---|---|
| `none` / `normal` | `text-slate-500` | `border-slate-200` | `bg-slate-50` | dark:border/bg equivalents |
| `minor` | `text-emerald-600` | `border-emerald-200` | `bg-emerald-50` | - |
| `moderate` | `text-amber-600` | `border-amber-300` | `bg-amber-50` | - |
| `moderate-severe` | `text-orange-600` | `border-orange-300` | `bg-orange-50` | - |
| `severe` | `text-red-600` | `border-red-300` | `bg-red-50` | - |
| `favorable` | `text-emerald-600` | `border-emerald-200` | `bg-emerald-50` | - |
| `unfavorable` | `text-red-600` | `border-red-300` | `bg-red-50` | - |

## Trial category dot colors (HUB_SPEC Appendix A)

Used in TrialLegendCard, TrialsPage filter chips.

| Category key | Color |
|---|---|
| `ivt` | `#10b981` (emerald-500) |
| `evt` | `var(--color-neuro-500)` |
| `secondary-prevention` | `#0891b2` (cyan-600) |
| `surgical-interventions` | `#7c3aed` (violet-700) |
| `acute-management` | `#f59e0b` (amber-400) |
| `prehospital-triage` | `#f59e0b` |

## Typography scale

| Element | Classes |
|---|---|
| Page H1 | `text-[22px] md:text-[28px] font-medium tracking-[-0.01em]` |
| Section header | `text-sm font-semibold tracking-[0.01em]` |
| Eyebrow label | `text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400` |
| Body text | `text-sm text-slate-600 dark:text-slate-300 leading-[1.55]` |
| Muted meta | `text-[11px] font-medium uppercase tracking-[0.04em] text-slate-400` |
| Key stat | `text-[12px] text-slate-500` |

## Component anatomy — CALCULATOR_SPEC.md v1.1

**Archetype 1** (GCS, ICH Score): single back-arrow header + content + portal drawer.
**Archetype 2** (NIHSS): two-row sticky header (Row 1: back+score+actions; Row 2: LVO+mode toggle, separated by `mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60`).

Key tokens:
- Back arrow SVG: `M19 12H5M12 19l-7-7 7-7`, 20×20, strokeWidth 2
- Score display: `—` (em dash) when incomplete
- Copy button: `bg-neuro-500 hover:bg-neuro-600 text-white px-4 py-2 rounded-full text-sm font-medium min-h-[44px]`
- Mode toggle: `rounded-full` container
- Content max-width: `max-w-2xl mx-auto px-5`
- Portal drawer: `createPortal()`, `position: fixed`, `bottom: calc(var(--tab-bar-height,0px) + env(safe-area-inset-bottom,0px))`

## Touch targets (CALCULATOR_SPEC.md §2.4)

All interactive elements: `min-h-[44px] min-w-[44px]`. Star/fav buttons: `p-2 -m-1.5`. Never `p-0.5` on a small icon button.

## shadcn/ui usage rules

- Import from `@/components/ui/<component>` — never duplicate primitive code
- Do not fork shadcn primitives; extend via `className` prop only
- Allowed: Button, Card, Dialog, Sheet, Tabs, Badge, Input, Select, Separator, Tooltip
- Dark mode: always pair light token with `dark:` equivalent (e.g., `bg-white dark:bg-slate-800`)

## Safe-area CSS

Correct: `pb-[env(safe-area-inset-bottom,0px)]`
Wrong: `safe-area-inset-bottom` as a Tailwind class (does not exist)

## Spacing

- Card padding: `px-5 py-3.5` or `p-4`
- Section gap: `mt-8` between major sections, `mt-3` between related elements
- Hairline border: `border border-slate-100 dark:border-slate-700/60`
- Card radius: `rounded-xl` for containers, `rounded-lg` for inner cards, `rounded-full` for pills/toggles
