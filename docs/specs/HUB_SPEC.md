# HUB_SPEC v1.2

**Version:** 1.2
**Companion mockup:** `docs/specs/mockups/hub-reference.html`
**Status:** Locked
**Owner:** PM (V) · Engineering (Build Engineer / Class C)

---

## 0. Purpose

Defines the universal **hub** pattern shared by 4 top-level destinations:

| Hub | Route | Tools shown | Toggle? | Pill grouping | Trail slot |
|---|---|---|---|---|---|
| Trials | `/trials` | Trial papers (79) | YES (Questions / Catalog) | Category (IVT / EVT / Prevention / Surgical) | Year · venue · effect chip |
| Calculators | `/calculators` | Validated scoring tools (10) | NO | Function (Severity / Risk / Classification) | Score range (e.g. 0–42) |
| Pathways | `/pathways` | Decision pathways (7) | NO | Scenario (Acute stroke / Status / Headache) | Step count |
| Guide | `/guide` | Guide articles (~30) | NO | Clinical area (Vascular / Epilepsy / etc) | Read time |

Home (`/`) shares 80% of this anatomy but adds Recently viewed and Trending sections; see HOME_SPEC for those Home-specific overlays.

This spec is the **source of truth for shared hub mechanics**: hero, mobile search, pill row, section headers, row cards, and the favourite-star filter.

## 0.1 Scope

This spec governs:
- The shared anatomy used by all 4 hubs and reused by Home
- The `ToolRowCard` component (the universal row)
- The `useFavoritesFilter` hook (URL `?favs=true`)
- Per-hub variations are documented in §2 with cross-references to per-hub specs

This spec does NOT govern:
- Mobile header, bottom nav, desktop rail (LAYOUT_SPEC)
- Per-tool detail pages (CALCULATOR_SPEC, TRIALS_SPEC, future PATHWAY_SPEC, future GUIDE_SPEC)
- Search overlay UI (future SEARCH_SPEC)

---

## 1. Universal hub anatomy

Reference mockup archetype: hub-reference.html line 157 (Archetype 1 — Trials hub canary).

Top to bottom:

1. **Hero** (§1.1) — eyebrow + title + lede
2. **Toggle** (§1.3) — Trials hub ONLY (Questions / Catalog)
3. **Pill row** (§1.4) — `All · {category-pills…} · | · Year` (Trials only)
4. **Section header** (§1.5) — colored dot + title + count + lede
5. **Row cards** (§1.6) — universal ToolRowCard
6. **Favourites filter** (§6) — star toggle in page header → URL `?favs=true`

Search is NOT part of the hub anatomy. Search lives only in the application chrome (mobile header search button per LAYOUT_SPEC §1.3.1, desktop top bar centered search per LAYOUT_SPEC §6.2.2). Hubs do not render an in-page search box. This is a universal rule applied across Home and all hubs as of v1.2.

Width zone: `.zone-reference` (1024px). See LAYOUT_SPEC §7.2.

## 1.1 Hub hero

Reference: hub-reference.html line 173.

```
[eyebrow]   {hub label}
[title]     {N} {tool noun}.
[lede]      {one-line tagline}
```

Per-hub instances:
| Hub | Eyebrow | Title | Lede |
|---|---|---|---|
| Trials | `Trials reference` | `79 trials.` | `Evidence summaries by clinical question or category.` |
| Calculators | `Calculators` | `10 calculators.` | `Validated clinical scoring and prediction tools.` |
| Pathways | `Pathways` | `7 decision pathways.` | `Step-through workflows for time-critical decisions.` |
| Guide | `Resident guide` | `Deep reading.` | `In-depth chapters on neurology topics. Updated for the 2026 AHA cycle.` |

Counts (`79`, `10`, `7`) are computed at build time from each data source, not hardcoded in the JSX.

Same typography rules as HOME_SPEC §1.1 (eyebrow / title / lede stack).

## 1.2 Mobile search box — REMOVED in v1.2

Search lives in the application chrome only — not in the hub body. See LAYOUT_SPEC §1.3.1 (mobile header search button) and §6.2.2 (desktop top bar centered search). Hubs do not render an in-page search box.

(Section number preserved as a tombstone so cross-references in other specs and prior commits remain intact. Skip to §1.3.)

## 1.3 Toggle (Trials only)

Reference: hub-reference.html line 184.

ONLY the Trials hub renders the Toggle. Two segments: `Questions` / `Catalog`. Catalog is default. Spec for the Toggle component lives in `src/components/ui/Toggle.tsx` and is unchanged in v1.1.

The other three hubs (Calculators, Pathways, Guide) **do NOT render the Toggle**, even hidden — the DOM omits it entirely.

## 1.4 Pill row

Reference: hub-reference.html line 190.

Pill anatomy is identical to HOME_SPEC §1.3.1.

### 1.4.1 Per-hub pill content

**Trials** (Catalog tab):
```
All · IVT · EVT · Prevention · Surgical · | · ▼ Year
```
The `Year` pill is a dropdown filter (multi-select years). The vertical divider before Year separates category pills from the secondary filter.

**Calculators**:
```
All · Severity · Risk · Classification
```

**Pathways**:
```
All · Acute stroke · Status · Headache
```

**Guide**:
```
All · Vascular · Epilepsy · Critical care · General
```

### 1.4.2 Pill state and URL

The active pill writes to `?cat={slug}` (or `?fn={slug}` for Calculators, etc — see per-hub spec for the exact param name). Default state = `All` = no query param. Pills cleared by re-tapping the active pill. Browser back/forward must restore.

## 1.5 Section header

Reference: hub-reference.html line 204.

```
[6px coloured dot]  [Section title]                    [count]
                    [section lede / sub-tagline]
```
- Title: `text-[15px] font-semibold flex-1`. Color is `text-cat-{slug}` for Trials hub category sections (e.g. emerald for IVT to match section identity); `text-slate-900` for Calc/Pathway/Guide section headers.
- Count: `text-[12px] text-slate-400 font-medium`
- Lede: `text-[12.5px] text-slate-500 pl-[18px] leading-snug`
- Bottom border: `1px solid #f1f5f9`
- Top margin: `26px` on Trials hub, otherwise per per-hub spec; `:first-of-type` collapses to 0.

## 1.6 Row card — the universal `ToolRowCard`

Reference: hub-reference.html line 214.

### 1.6.1 Visual contract

```
┌──────────────────────────────────────────────────────┐
│ ●  TITLE              [trail-slot]  [meta][⭐]        │
│    one-line description                               │
└──────────────────────────────────────────────────────┘
```

The leftmost dot indicates **category** and is rendered as a `::before` pseudo-element on the row, not as a separate child.

### 1.6.2 CSS contract (v1.1 — bug-fix locked)

```css
.rowcard {
  padding: 14px 0;
  padding-left: 18px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  position: relative;
  width: 100%;
  text-align: left;
  background-color: transparent;
}
.rowcard:hover {
  background-color: rgba(248, 250, 252, 0.6);
}
.rowcard::before {
  content: '';
  position: absolute;
  left: 0; top: 21px;
  width: 6px; height: 6px;
  border-radius: 50%;
  background-color: #94a3b8;  /* fallback slate-400 */
}

/* Category indicator on the row — scoped to ::before ONLY. NEVER sets row background. */
.rowcard.row-ivt::before        { background-color: #10b981; }
.rowcard.row-evt::before        { background-color: var(--color-neuro-500); }
.rowcard.row-prevention::before { background-color: #0891b2; }
.rowcard.row-surgical::before   { background-color: #7c3aed; }
.rowcard.row-status::before     { background-color: #f59e0b; }
.rowcard.row-cobalt::before     { background-color: var(--color-neuro-500); }
.rowcard.row-vascular::before   { background-color: var(--color-neuro-500); }
.rowcard.row-epilepsy::before   { background-color: #f59e0b; }
.rowcard.row-critical::before   { background-color: #7c3aed; }
.rowcard.row-general::before    { background-color: #94a3b8; }
.rowcard.row-acute::before      { background-color: var(--color-neuro-500); }
.rowcard.row-severity::before   { background-color: var(--color-neuro-500); }
.rowcard.row-risk::before       { background-color: #0891b2; }
.rowcard.row-classification::before { background-color: #7c3aed; }
```

**v1.1 BUG FIX, IMPORTANT:**
The category class on the row card is `row-{slug}`, NOT `cat-{slug}`. The `cat-{slug}` and `dot-{slug}` utility classes (used by the standalone dot element on pills and section headers) set `background-color` directly on whatever element they are applied to. Applying them to a `.rowcard` previously painted the entire row background. The `row-{slug}` class is scoped to `::before` only and cannot bleed onto the row.

### 1.6.3 Title slot

`<span class="text-[14.5px] font-semibold text-slate-900">{toolName}</span>`

For trials, optionally followed inline by `<span class="text-[11.5px] text-slate-400 font-medium ml-2">{year} · {venue}</span>`.

### 1.6.4 Trail slot

Right of the title row, before the favourite star, an optional trail slot per hub:
- Trials: effect chip (e.g. `+6 / 100`) and/or NNT — see TRIALS_SPEC §X.Y
- Calculators: score range (e.g. `0–42`) with the maximum bolded — `<span class="text-[11.5px] text-slate-500 font-medium">0–<span class="text-slate-900 font-semibold">42</span></span>`
- Pathways: step count — `<span class="text-[11.5px] text-slate-500 font-medium"><span class="text-slate-900 font-semibold">4</span> steps</span>`
- Guide: read time — `<span class="text-[11.5px] text-slate-400 font-medium">12 min</span>`

### 1.6.5 Favourite star

Right-most element. 16px (`w-4 h-4`):
- Inactive: `text-slate-300 fill="none" stroke-width="1.5"` (filled by user click, not by hover)
- Active: `text-amber-400 fill="currentColor" stroke="currentColor" stroke-width="1.5"`

The star is rendered inside the row card. Clicking the star MUST stop event propagation so the row navigation does not trigger.

### 1.6.6 One-line description

`<div class="text-sm text-slate-600 leading-snug">{description}</div>` — single line, truncate with ellipsis if it overflows on mobile.

### 1.6.7 Click target

The entire row card is the navigation click target (it is rendered as `<button>` or `<a>` per route). Hovering the row gives a faint background tint (`#f8fafc60`). The star and any future inline action buttons must `e.stopPropagation()`.

---

## 2. Per-hub variations summary

| Aspect | Trials | Calculators | Pathways | Guide |
|---|---|---|---|---|
| Toggle | YES | NO | NO | NO |
| Pill grouping | Category | Function | Scenario | Clinical area |
| Section header text color | `text-cat-{slug}` | `text-slate-900` | `text-slate-900` | `text-slate-900` |
| Trail slot | Effect chip / NNT | Score range | Step count | Read time |
| Bottom nav active tab | Trials | Calcs | Pathways | Guide |

Reference: hub-reference.html lines 281 (Calculators), 383 (Pathways), 484 (Guide).

---

## 3. Component decomposition

```
src/components/hub/
├── HubHero.tsx           (eyebrow + title + lede)
├── HubMobileSearch.tsx
├── HubPillRow.tsx        (variants per hub)
├── HubSection.tsx        (header + body slot)
└── ToolRowCard.tsx       (universal row card — used by HUB and Home)
```

`ToolRowCard` accepts:
```ts
type ToolRowProps = {
  href: string;
  category: string;        // produces .row-{category} class
  title: string;
  titleMeta?: string;      // e.g. "2024 · NEJM" for trials
  description: string;
  trail?: ReactNode;       // hub decides what to render here
  isFavourited: boolean;
  onToggleFavourite: () => void;
};
```

The same `ToolRowCard` renders inside scenario sections on Home (HOME_SPEC §1.4.2). No fork.

---

## 4. Routing per hub

| Hub | Route | Default pill | Filtered URL |
|---|---|---|---|
| Trials | `/trials` | All | `/trials?cat=ivt&year=2024` |
| Calculators | `/calculators` | All | `/calculators?fn=severity` |
| Pathways | `/pathways` | All | `/pathways?scenario=acute-stroke` |
| Guide | `/guide` | All | `/guide?area=vascular` |

Each hub supports `?favs=true` (§6 below).

---

## 5. Section ordering and sort behaviour

Within a section, rows sort by:
- Trials: `effectMagnitude DESC, year DESC, name ASC` (high-impact first; ties broken by recency, then alpha)
- Calculators: alphabetical by name
- Pathways: editorial order (per `pathwayOrder` in `pathwayData.ts`)
- Guide: editorial order (per `guideOrder` in `guideData.ts`)

When the user activates a category pill, only matching sections render — other sections are removed from the DOM, not just hidden. When `All` is active, all sections render in the order defined by each hub's data file.

---

## 6. Favourites filter — the star toggle

The amber star icon in the page header (LAYOUT_SPEC §1) toggles the URL query parameter `?favs=true`. When that param is present:

- Each hub renders **only** rows whose `id` is in `useFavorites().favorites`
- The hero count updates to reflect the filtered count (e.g. "2 trials.")
- Section headers without any matching rows are hidden
- The pill row remains active (you can combine `?favs=true&cat=ivt`)
- The Toggle, where present, remains active too (favourites within Questions vs Catalog)

The star icon visual states (slate-400 default, amber-400 when active) are defined in LAYOUT_SPEC §1.

### 6.1 The `useFavoritesFilter()` hook

```ts
function useFavoritesFilter(): {
  isActive: boolean;        // true when ?favs=true
  toggle: () => void;       // adds or removes ?favs=true preserving other params
};
```

Implementation note: this hook composes `useSearchParams` and the existing `useFavorites` hook. It does NOT duplicate favourite storage — it only filters the in-memory list at render time.

---

## 7. Empty states

When a filter combination produces zero results:
- `?cat=surgical&favs=true` and the user has no surgical favourites → render section with a single muted slate row: `<div class="text-sm text-slate-400 italic px-[18px] py-3">No surgical trials in your favourites yet.</div>`
- Pill remains active so the user can clear it
- Do NOT render an illustrated empty-state graphic (out of scope v1.1)

---

## 8. Accessibility

- Pill row: `role="tablist"`, pills `role="tab"`, sections `role="tabpanel"` (same as HOME_SPEC §6).
- Section header: `<h2>`. Row title: `<h3>`. Hub title: `<h1>`.
- Star button on each row: `aria-pressed={isFavourited}` and `aria-label="Add to favourites" / "Remove from favourites"`.
- Hub header star: same `aria-pressed` pattern (LAYOUT_SPEC §1).

---

## 9. Engineering notes

- Each hub page is a thin shell that composes the components in §3 with hub-specific data and pill manifest.
- All hubs use `useSearchParams` for filter state — no `useState` for active pill / favs.
- ToolRowCard MUST be the only place row card markup is generated. Per-hub forks are forbidden.
- The category-to-class mapping is a pure function in `src/utils/category.ts`. New categories require an entry in this file PLUS a CSS rule in `src/index.css` for `.row-{slug}::before` (and optionally `.dot-{slug}` if used in pills).

---

## 10. Acceptance gates

A hub implementation is considered v1.1-compliant when:

1. Build/typecheck pass
2. Visual QA: each archetype renders identically to hub-reference.html at 440px viewport (and the desktop chrome layer renders correctly per LAYOUT_SPEC)
3. The trial row green-bleed bug from v1.0 does NOT regress: confirmed by visual inspection AND by a CSS audit verifying no `.cat-{slug}` class is applied directly to a `.rowcard` element anywhere
4. SEO: each hub emits the correct `<title>`, meta description, and an itemList schema
5. Regression: `useFavorites` continues to work; existing trial data displays without changes; the redirected `/calculators/{pathway-slug}` URLs from the calc→pathway split (Phase 5e) 301 to `/pathways/{slug}`
6. TASKS.md entries are checked off

---

## Appendix A — Category color reference (canonical)

This is the source of truth for category colors. Cross-referenced from HOME_SPEC §A.

| `.dot-{slug}` | `.row-{slug}` | Color | Used for |
|---|---|---|---|
| `.dot-ivt` | `.row-ivt` | #10b981 emerald | IVT trials, Acute stroke scenario pill |
| `.dot-evt` | `.row-evt` | var(--color-neuro-500) cobalt | EVT trials, stroke pathways |
| `.dot-prevention` | `.row-prevention` | #0891b2 teal | Prevention trials, Headache scenario, risk calcs |
| `.dot-surgical` | `.row-surgical` | #7c3aed violet | Surgical trials, ICH scenario, classification calcs |
| `.dot-status` | `.row-status` | #f59e0b amber | Status epilepticus, epilepsy guide |
| `.dot-general` | `.row-general` | #94a3b8 slate-400 | AMS scenario, general guide |
| `.dot-cobalt` | `.row-cobalt` | var(--color-neuro-500) cobalt | Severity calcs, vascular guide |
| `.dot-vascular` | `.row-vascular` | var(--color-neuro-500) cobalt | Vascular guide |
| `.dot-epilepsy` | `.row-epilepsy` | #f59e0b amber | Epilepsy guide |
| `.dot-critical` | `.row-critical` | #7c3aed violet | Critical care guide |
| `.dot-acute` | `.row-acute` | var(--color-neuro-500) cobalt | Acute pathways |
| `.dot-severity` | `.row-severity` | var(--color-neuro-500) cobalt | Severity calcs |
| `.dot-risk` | `.row-risk` | #0891b2 teal | Risk calcs |
| `.dot-classification` | `.row-classification` | #7c3aed violet | Classification calcs |

**Naming rule (locked):**
- `.dot-{slug}` = sets `background-color` directly on the element. Use ONLY on the small dot element inside pills and on the small dot element inside section headers.
- `.row-{slug}` = applies a category indicator to a row card via `::before`. Sets ONLY the pseudo-element's color, never the row's background.

Dropped in v5g (per Phase 2 plan): `.dot-prehospital` was unused; `.row-acute` survives (used for pathway hub) but `.row-prehospital` does not exist.

---

## Changelog

- **v1.0** (superseded) — used `.cat-{slug}` for both standalone color utilities AND row-card category indicator, causing background-color bleed when both class systems matched the same element.
- **v1.1** (superseded) — split into `.dot-{slug}` (utility) and `.row-{slug}` (row-card scoped to ::before). All other anatomy unchanged.
- **v1.2** (current) — removed in-page mobile search box from hub anatomy. Search now lives only in the application chrome (mobile header button, desktop top bar). §1.2 is preserved as a tombstone so subsequent section numbering (§1.3 Toggle, §1.4 Pill row, etc.) remains stable across cross-references in HOME_SPEC and TRIALS_SPEC.
