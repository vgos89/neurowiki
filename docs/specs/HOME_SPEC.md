# HOME_SPEC v1.4

**Version:** 1.4
**Companion mockup:** `docs/specs/mockups/home-reference.html`
**Status:** Locked
**Owner:** PM (V) · Engineering (Build Engineer / Class C)

---

## 0. Purpose

Defines the anatomy of the Home page (`/`) — the application's launcher. Home is a **hub** in the same architectural family as Trials, Calculators, Pathways, and Guide hubs (see `HUB_SPEC.md`), with two differences from those hubs: (a) its row sections are **scenarios** (clinical case bundles) rather than tools of one type, and (b) it has two non-scenario discovery surfaces below the fold — Recently viewed and Trending trials — that exist only on Home.

Home does NOT use the Toggle component. It uses pills only. The Toggle is reserved for the Trials hub (Questions / Catalog).

## 0.1 Scope

This spec governs:
- The Home route at `/` and `/?scenario={id}`
- The Featured rail (top-of-page editorial pinned tiles), the pill row, scenario sections (collapsible, with tinted header), Show more behaviour, Recently viewed, Trending trials
- Four hooks: `useRecents`, `useTrending`, `useScenarios`, `useScenarioExpansion`
- Two data files: `src/data/scenarios.ts` and `src/data/featured.ts`
- Two localStorage keys: `neurowiki:home:hasVisited` and `neurowiki:home:showMoreExpanded`

This spec does NOT govern:
- The mobile header, bottom nav, desktop rail (see `LAYOUT_SPEC.md`)
- Per-tool row card anatomy (see `HUB_SPEC.md` §1.6 — same row card is reused here)
- Trial detail, calculator detail, pathway player (separate specs)

---

## 1. Page anatomy

Reference mockup archetype: home-reference.html line 267 (Archetype 1, default first-visit state).

Home is a single scrollable column, ordered top to bottom:

1. **Hero** (§1.1) — eyebrow, title, lede
2. **Featured rail** (§1.25) — 3 editorial pinned tiles (calc / pathway only) — ONLY on All view
3. **Pill row** (§1.3) — `All · {scenarios…}` — exactly 6 pills total
4. **Scenario sections** (§1.4) — all collapsible by default; on first ever visit only, scenario 1 auto-expands. First 3 sections rendered always; 4th and 5th hidden until Show more is tapped.
5. **Show more / Show less button** (§1.5) — between scenarios, ONLY on All view, dismissable only by tapping Show more itself
6. **Recently viewed** (§1.6) — ONLY on All view, ONLY when populated
7. **Trending trials** (§1.7) — ONLY on All view, always rendered, daily-seeded random sample

Search is NOT part of the Home page body. Search lives only in the application chrome (mobile header search button per LAYOUT_SPEC §1.3.1, desktop top bar centered search per LAYOUT_SPEC §6.2.2). This is a universal rule applied across Home and all hubs as of HUB_SPEC v1.2 / HOME_SPEC v1.4.

Width zone: `.zone-reference` (max-w-5xl / 1024px). See LAYOUT_SPEC §7.2.

## 1.1 Hero

Reference: home-reference.html line 283.

```
[eyebrow]   By case
[title]     What's the case?
[lede]      Pick a scenario or browse all the tools.
```

- Eyebrow: `text-[10px] font-bold text-slate-400 uppercase tracking-widest`
- Title: `text-[24px] font-medium text-slate-900 leading-tight tracking-tight`
- Lede: `text-[14.5px] text-slate-500 leading-snug`
- The hero is **identical** across all 3 archetypes (default, scenario-active, show-more-expanded). The pill row underneath does the state communication.

## 1.2 Mobile search box — REMOVED in v1.4

Search lives in the application chrome only — not in the Home body. See LAYOUT_SPEC §1.3.1 (mobile header search button) and §6.2.2 (desktop top bar centered search).

(Section number preserved as a tombstone so cross-references in other specs and prior commits remain intact. Skip to §1.25.)

## 1.25 Featured rail

Reference: home-reference.html line 290 (Archetype 1, Featured rail present) and line 515 (Archetype 2, scenario pill active — Featured is absent, marked with explicit comment).

The Featured rail is a top-of-page editorial surface. V curates exactly 3 pinned tools (calculators or pathways) that represent the app's most distinctive content. The rail sits above the pill row so it is read before the user picks a case.

### 1.25.1 Visibility rule

Rendered ONLY when pill = `All`. NEVER rendered when a scenario pill is active.

Rationale: when a user has explicitly selected a case via the pill row, Featured becomes noise — the user has already declared their intent. Featured is for the "what does NeuroWiki do?" reader, not the "what do I need right now?" reader. Same visibility rule as Recently viewed (§1.6) and Trending (§1.7).

The rail is **always rendered on All view**, even on a user's first ever visit (no localStorage gate, no empty state).

### 1.25.2 Section header

```
[eyebrow]   Featured
```
- Same eyebrow style as Recently viewed and Trending: `text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2`
- No microcopy, no count, no "View all" link
- Top margin: `0` (sits flush below the mobile search box, or below the hero on desktop)

### 1.25.3 Tile count and layout

- Exactly **3 tiles**, in the order V defines in `featured.ts`
- Mobile: horizontal-scroll all 3 tiles (`overflow-x: auto`, scrollbar hidden via `scrollbar-width: none`). Snap behaviour optional (acceptable to omit).
- Desktop: all 3 tiles visible in a row at the `.zone-reference` width. Use `display: flex; gap: 10px` — the tiles are fixed-width and wrap naturally if the viewport narrows.
- Tile width: `200px` fixed on mobile (so the user sees ~2 tiles plus a hint of the 3rd peeking off the right edge); `1fr` (equal share of the row) on desktop ≥ 1024px.

### 1.25.4 Tile visual contract

Tinted card, no border, no dot.

```css
.featured-tile {
  flex-shrink: 0;
  width: 200px;          /* mobile */
  padding: 14px 14px 16px;
  background-color: rgba({category-rgb}, 0.08);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  text-align: left;
}
@media (min-width: 1024px) {
  .featured-tile {
    width: auto;
    flex: 1;             /* desktop: equal-width */
  }
}
```

The category color follows the same mapping used by row cards and scenario headers (see HUB_SPEC Appendix A). For pathways and calculators, the most common values will be:
- EVT-class pathway → cobalt (`#1746A2`)
- IVT-class pathway → IVT green (`#10b981`)
- Severity / classification calculators → cobalt (`#1746A2`)
- Status epilepticus pathway → status amber (`#f59e0b`)

### 1.25.5 Tile content

Three lines of content, top to bottom:

```
[type label]   PATHWAY    or    CALCULATOR
[name]         EVT Pathway
[description]  LVO triage from imaging to decision in under 60 seconds.
```

- **Type label**: `text-[10.5px] font-semibold uppercase text-slate-600 tracking-[0.06em] mb-2`. Always exactly `Pathway` or `Calculator` (NOT `Calc`, NOT `Path`, NOT plural). Trials and guide articles cannot be Featured (see §1.25.7).
- **Name**: `text-[16px] font-semibold text-slate-900 leading-tight tracking-tight mb-1`. Should match the canonical name from the underlying tool's manifest entry.
- **Description**: `text-[12.5px] text-slate-600 leading-snug`. One-line elevator pitch (max ~80 chars). Should answer "what makes this worth pinning?" — not duplicate the row card's lede verbatim.

No score chip, no year-venue trail, no count badge. The tile is intentionally simpler than the row card so the difference between "Featured" and "scenario list item" is obvious at a glance.

### 1.25.6 Hover and tap

- Hover (desktop): bump tint from 8% to 10% (same step as scenario-header hover). No transform, no shadow.
- Tap: navigates to the tool's detail route (`/calculators/{slug}` or `/pathways/{slug}`).
- Active/pressed state: same 10% bump for ~80ms, then route transition.

### 1.25.7 Data — `src/data/featured.ts`

V curates the list. Hardcoded TS array, no admin UI, no CMS. Updated when V publishes something new.

```ts
export type FeaturedItem = {
  id: string;                          // slug, e.g. 'evt-pathway'
  type: 'pathway' | 'calculator';      // ONLY these two — see §1.25.7.1
  name: string;                        // 'EVT Pathway'
  description: string;                 // one-line elevator pitch (max ~80 chars)
  categoryColor: string;               // hex, e.g. '#1746A2' — drives 8% rgba tint
  href: string;                        // '/pathways/evt' (canonical route)
};

export const FEATURED: FeaturedItem[] = [
  { id: 'evt-pathway',     type: 'pathway',    name: 'EVT Pathway',
    description: 'LVO triage from imaging to decision in under 60 seconds.',
    categoryColor: '#1746A2', href: '/pathways/evt' },
  { id: 'late-window-ivt', type: 'pathway',    name: 'Late-Window IVT',
    description: 'tPA in 4.5–9 h or wake-up window with imaging.',
    categoryColor: '#10b981', href: '/pathways/late-window-ivt' },
  { id: 'nihss',           type: 'calculator', name: 'NIHSS',
    description: '15-item stroke severity exam. Range 0–42.',
    categoryColor: '#1746A2', href: '/calculators/nihss' },
];
```

Initial v1.3 list (subject to V's editorial control, not part of the spec lock):
1. EVT Pathway
2. Late-Window IVT
3. NIHSS

#### 1.25.7.1 Type restriction

`featured.ts` accepts ONLY `pathway` or `calculator`. The TypeScript type union enforces this at compile time. Trials are not featurable because Trending already surfaces them via daily rotation; guide articles are not featurable because they are reference reading rather than bedside differentiators.

If V wants to feature a trial or article in the future, that is a v2 spec change — do not weaken the type union to allow it without re-opening this design.

#### 1.25.7.2 Length contract

The array MUST contain exactly 3 entries. A build-time check should fail the build if `FEATURED.length !== 3`. Rationale: the layout assumes 3 (mobile-scroll math, desktop flex math). Adding a 4th item without redesigning the rail produces a broken row on desktop.

If V wants to rotate the list (e.g. retire one item and add another), that is a single PR that swaps array entries — never adds or removes positions.

### 1.25.8 No analytics in v1.3

We do NOT track Featured-tile clicks, impressions, or scroll depth. If the editorial list isn't working (no clicks), V will notice in user feedback or instinct, and rotate the list. This is an editorial surface, not a programmatic one — analytics would create false precision.

If/when we need Featured analytics, that is a v2 spec change.

## 1.3 Pill row — scenarios as pills

Reference: home-reference.html line 312.

The pill row contains **exactly 6 pills**, in this order:

1. `All` — no dot, default active
2. `Acute stroke` — green dot (.dot-ivt)
3. `ICH` — violet dot (.dot-surgical)
4. `Status` — amber dot (.dot-status)
5. `Headache` — teal dot (.dot-prevention)
6. `AMS` — slate dot (.dot-general)

### 1.3.1 Pill visual contract

Identical to HUB_SPEC §1.4:
- Inactive: white bg, slate-200 1px border, slate-600 text
- Active: slate-50 bg, no border colour change, slate-900 text, semibold
- 6×6px coloured dot inside each non-All pill

> **Implementation note (2026-06-29):** Home's active pill currently uses the solid cobalt fill (neuro-500 bg, white text), not slate-50, per V's explicit decision for at-a-glance wayfinding. This is an intentional deviation from the shared slate-50 contract above. Whether the hubs also adopt cobalt or Home is formally documented as an exception is a separate design-guardian reconciliation (see docs/AUDIT.md P1 #4). Do not revert to slate-50 without V.

### 1.3.2 Pill state and URL

- The active pill is determined by `?scenario={id}` query param
- Default state (no query param) = `All` pill active
- Tapping a pill updates the URL via `useSearchParams` (no full nav)
- Tapping the active pill again returns to `All` (clears the query param)
- Browser back/forward must restore the previous pill state correctly

### 1.3.3 Scenario IDs and slugs

Scenario IDs are stable strings used in the URL:

| Pill label | Scenario ID | Dot |
|---|---|---|
| All | (none — default) | — |
| Acute stroke | `acute-stroke` | dot-ivt |
| ICH | `ich` | dot-surgical |
| Status | `status-epilepticus` | dot-status |
| Headache | `severe-headache` | dot-prevention |
| AMS | `altered-mental-status` | dot-general |

Defined in `src/data/scenarios.ts` (§4 below). Renaming a scenario or changing its ID requires a migration entry in `routeManifest.ts`.

### 1.3.4 Pill row mobile behaviour

Horizontal scroll with hidden scrollbar (matches HUB_SPEC §1.4):
```css
overflow-x: auto;
scrollbar-width: none;
```
On overflow, the active pill auto-scrolls into view on mount.

## 1.4 Scenario sections

Reference: home-reference.html line 322 (Archetype 1, scenario 1 expanded with 12% IVT tint) and lines 365, 374 (Archetype 1, scenarios 2-3 collapsed with 8% tint).

Each scenario is a **collapsible** section with a tinted header and a body of row cards. The user expands and collapses sections by tapping the header.

### 1.4.1 Section header — visual contract

Two-line content, no dot, with a tinted background that uses the scenario's category color at one of two opacity levels (8% collapsed, 12% expanded).

```
┌─────────────────────────────────────────────────────┐
│  Acute ischemic stroke                          ▼   │
│  Within 24 h of onset · 5 tools                     │
└─────────────────────────────────────────────────────┘
```

- Container: `display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 14px 16px; border: none; border-radius: 10px; cursor: pointer; text-align: left;`
- Background — collapsed: `rgba({category-rgb}, 0.08)` (8% tint of the scenario's category color)
- Background — expanded: `rgba({category-rgb}, 0.12)` (12% tint of the same color)
- Top margin between sections: `10px` (collapses to `0` on first section via `:first-of-type` or equivalent — the first section header has no top margin)
- No left edge, no border, no dot, no count badge inside the header
- The tint color comes from the `categoryColor` property in the scenario's manifest entry (see §1.4.3) — engineering must compute the rgba string from the hex value, not hardcode it per scenario

#### Title (line 1)
- `font-size: 18px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; line-height: 1.25`
- Sentence case (e.g. `Acute ischemic stroke`, not `Acute Ischemic Stroke`, not `ACUTE ISCHEMIC STROKE`)

#### Subtitle (line 2)
- `font-size: 12.5px; color: #64748b; line-height: 1.4; margin-top: 2px`
- Format: `{scenario lede} · {N} tools` (e.g. `Within 24 h of onset · 5 tools`)
- Always rendered, both in collapsed and expanded states (collapsed density was considered and rejected — see Changelog)

#### Chevron
- 18×18px, `color: #94a3b8`
- Collapsed: chevron-down (▼), `transform: none`
- Expanded: chevron-up (▲), `transform: rotate(180deg)`
- Smooth transition allowed: `transition: transform 160ms ease`

#### Hover (desktop)
- Background gets a subtle bump: collapsed 8% → 10%, expanded 12% → 14%
- No other change (no border, no shadow)

#### Accessibility
- The header is a `<button>` with `aria-expanded={isExpanded}` and `aria-controls={`scenario-${id}-body`}`
- The body region has `id={`scenario-${id}-body`}` and `role="region"`
- Tapping the header toggles `isExpanded` for that scenario only — does not affect other scenarios
- Keyboard: `Enter` and `Space` both toggle when focused

### 1.4.2 Section body — row cards

Each scenario contains an ordered list of mixed-type tools. A scenario can include any combination of:
- Pathway row (links to `/pathways/{slug}`)
- Calculator row (links to `/calculators/{slug}`)
- Trial row (links to `/trials/{slug}`)
- Guide article row (links to `/guide/{slug}`)

The body is rendered ONLY when the section is expanded. Collapsed sections render only the header (no rows, no body wrapper, no border).

When expanded:
- Body wrapper: `padding: 4px 4px 0` (modest indent from the tinted header)
- Each row uses the **identical row card** defined in HUB_SPEC §1.6 — same padding, same dot-as-`::before` mechanism, same hover state
- The row's left dot color reflects the **tool's own category** (`.row-{slug}`), not the scenario it appears under (e.g. NIHSS appearing in the Acute Stroke scenario uses `.row-cobalt`, not `.row-ivt`)
- The last row in a body has its bottom hairline border removed (so the body terminates cleanly above the next collapsed header)

### 1.4.3 Scenario contents (v1.2 baseline)

Defined in `src/data/scenarios.ts`. The data shape:

```ts
type Scenario = {
  id: string;                  // URL slug, e.g. 'acute-stroke'
  title: string;               // 'Acute ischemic stroke'
  lede: string;                // 'Within 24 h of onset.'
  categoryColor: string;       // hex, e.g. '#10b981' — used for tinted header background
  pillDotClass: string;        // '.dot-ivt' — used in pill row
  tools: Array<ToolRef>;       // see ToolRef in HUB_SPEC
};
```

Initial v1.2 contents (counts derived from `tools.length`, NOT hardcoded):

**Acute ischemic stroke** (id: `acute-stroke`, color: `#10b981` / IVT green)
- Stroke Code (pathway, .row-evt)
- Late-Window IVT (pathway, .row-ivt)
- EVT Pathway (pathway, .row-evt)
- NIHSS (calculator, .row-cobalt)
- ASPECTS (calculator, .row-cobalt)

**ICH** (id: `ich`, color: `#7c3aed` / surgical violet)
- ICH Management (pathway, .row-surgical)
- ICH Score (calculator, .row-cobalt)
- Heidelberg Bleeding (calculator, .row-cobalt)
- ENRICH (trial, .row-surgical)

**Status epilepticus** (id: `status-epilepticus`, color: `#f59e0b` / status amber)
- SE Pathway (pathway, .row-status)
- Status Epilepticus Mgmt (guide article, .row-status)
- Seizure Workup (guide article, .row-status)

**Severe headache** (id: `severe-headache`, color: `#0891b2` / prevention teal)
- Migraine Pathway (pathway, .row-prevention)
- GCA Pathway (pathway, .row-prevention)
- Headache Workup (guide article, .row-prevention)
- Boston CAA Criteria (calculator, .row-cobalt)

**Altered mental status** (id: `altered-mental-status`, color: `#94a3b8` / general slate)
- Glasgow Coma Scale (calculator, .row-cobalt)
- AMS Workup (guide article, .row-cobalt)
- Meningitis (guide article, .row-cobalt)

Adding/removing items from a scenario or adding a new scenario is a content change tracked in `src/data/scenarios.ts` and does NOT require a spec change unless the structural rules below are violated.

### 1.4.4 Default expansion state — `useScenarioExpansion()` hook

Each scenario has a per-section `isExpanded` boolean held in React state. Initial values are computed at mount time:

```ts
function useScenarioExpansion(scenarios: Scenario[]): {
  expandedIds: Set<string>;
  toggle: (id: string) => void;
} {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // First visit detection
    const hasVisited = localStorage.getItem('neurowiki:home:hasVisited') === 'true';
    if (!hasVisited) {
      localStorage.setItem('neurowiki:home:hasVisited', 'true');
      // First visit: auto-expand the first scenario only
      return scenarios[0] ? new Set([scenarios[0].id]) : new Set();
    }
    // All subsequent visits: all collapsed
    return new Set();
  });

  const toggle = (id: string) =>
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return { expandedIds, toggle };
}
```

Important behavior contracts:
- The `hasVisited` flag is set on the **very first mount of Home in this browser**, regardless of whether the user actually interacts with anything. Visiting Home is itself the visit.
- Multiple sections can be expanded simultaneously — there is no accordion-style "only one open at a time" rule
- Expansion state is React-local only (not localStorage, not URL). Refreshing the page returns to the default (all collapsed except on first visit). Rationale: persisting per-section state across refreshes adds complexity without clear user benefit, and the per-page session state matches the calculator pattern (CALCULATOR_SPEC §6).
- When the user activates a non-All scenario pill (`/?scenario={id}`), the matching scenario MUST render expanded regardless of the user's current expansion state. The pill is the explicit case selector, so its scenario opens unconditionally.

### 1.4.5 Section visibility rules

| Pill state | Sections visible | Default expansion (per section) |
|---|---|---|
| `All` (default), Show more collapsed | First 3 scenarios in defined order | Per `useScenarioExpansion` (first scenario expanded on first visit only; otherwise all collapsed) |
| `All`, Show more expanded | All 5 scenarios in defined order | Per `useScenarioExpansion` (no scenarios beyond the first 3 are auto-expanded, ever) |
| Any scenario pill active | Only the matching scenario | Always expanded |

If a scenario's URL slug does not match any scenario in `scenarios.ts`, fall back to `All` (treat the unknown query param as cleared) and log a console warning in dev. Do NOT 404.

## 1.5 Show more / Show less

Reference: home-reference.html line 382 (collapsed state — "Show more scenarios", Archetype 1) and line 682 (expanded state — "Show less", Archetype 3).

### 1.5.1 Visibility

- Rendered ONLY when pill = `All` AND `scenarios.length > VISIBLE_BEFORE_FOLD` (where VISIBLE_BEFORE_FOLD = 3)
- NEVER rendered when a scenario pill is active
- NEVER rendered when there are 3 or fewer scenarios total

### 1.5.2 Visual contract

```css
.show-more-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%;
  padding: 13px 0;
  margin-top: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 500;
  color: #475569;
}
.show-more-btn:hover {
  border-color: var(--color-neuro-500);
  color: var(--color-neuro-500);
}
```

Visually distinct from a scenario header: the Show more button is a **white** rectangular button with a slate border, no tint. It is never confused with a section.

### 1.5.3 Label and chevron

- Collapsed state: label = `Show more scenarios`, chevron = down (▼)
- Expanded state: label = `Show less`, chevron = up (▲)

### 1.5.4 Dismissal logic and state persistence

The Show more / Show less state is persisted to **localStorage** under key `neurowiki:home:showMoreExpanded` (boolean string `'true'` | `'false'`). The state has exactly two ways to change:

1. **User taps the Show more button** while it reads "Show more scenarios" → state flips to `true`, button label becomes "Show less", scenarios 4 and 5 render below the first 3.
2. **User taps the Show less button** while it reads "Show less" → state flips back to `false`, button label becomes "Show more scenarios", scenarios 4 and 5 are removed from the DOM.

Critical: Section collapse/expand interactions (§1.4.4) do **NOT** dismiss the Show more state. The user can collapse all 5 scenarios while Show more is in its expanded state, and the 5 collapsed headers remain visible. The Show more button is a content-visibility control; per-section expansion is a body-visibility control. They are orthogonal.

The `useShowMore()` hook:

```ts
function useShowMore(): { isExpanded: boolean; toggle: () => void } {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    return localStorage.getItem('neurowiki:home:showMoreExpanded') === 'true';
  });

  const toggle = () => {
    setIsExpanded(prev => {
      const next = !prev;
      localStorage.setItem('neurowiki:home:showMoreExpanded', String(next));
      return next;
    });
  };

  return { isExpanded, toggle };
}
```

Notes:
- Default value when localStorage is empty: `false` (collapsed). On a fresh browser, the user sees Show more in its collapsed state on every visit until they tap it.
- Once tapped to `true`, the value persists across reloads, sessions, and even crossover into private/incognito only if the user has localStorage there too. Clearing site data resets it to `false`.
- The state is **not** scoped per-pill; once expanded on All view, it stays expanded if the user navigates to a scenario pill and back. (When a non-All pill is active, the button is not rendered, but the state persists.)

### 1.5.5 Animation

Smooth height transition is OPTIONAL in v1.2 (allowed if zero-cost using `<details>`-style approach or a small height transition; do not introduce a layout library). MUST NOT cause layout shift on the rest of the page (Recently viewed and Trending below should slide down with the same easing or appear instantly). If in doubt, instant show/hide is acceptable for v1.2.

## 1.6 Recently viewed

Reference: home-reference.html line 388.

### 1.6.1 Visibility rule

Rendered ONLY when **all** of the following are true:
1. Pill = `All`
2. `useRecents()` returns at least 1 item

If either condition fails, the entire Recently viewed block (including its eyebrow header) is omitted from the DOM. Do NOT render an empty section header with "no recent items" — the section simply does not exist.

### 1.6.2 Header

```
[eyebrow]   Recently viewed
```
- Same eyebrow style as the hero eyebrow: `text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1`
- No section dot, no section count, no lede (this is a flat list, not a scenario)
- Top margin: `mt-9` (36px) from the Show more button or, if Show more not rendered, from the last scenario

### 1.6.3 Items

Display the **5 most recently viewed items** from the `useRecents()` hook, newest first. Each item is rendered as a row card identical to HUB_SPEC §1.6, with `.row-{category}` matching the item's own category. Do not deduplicate by category. Do not group by type.

### 1.6.4 The `useRecents()` hook

Spec:
```ts
type RecentEntry = {
  id: string;        // tool slug (e.g. "nihss")
  type: 'trial' | 'calculator' | 'pathway' | 'guide';
  title: string;     // display title cached at write time
  subtitle: string;  // 1-line description cached at write time
  category: string;  // dot color class fragment, e.g. "ivt", "cobalt"
  trail?: string;    // e.g. "0–42", "+6 / 100", "8 min" — cached
  viewedAt: number;  // ms epoch
};

function useRecents(): {
  recents: RecentEntry[];      // sorted newest-first, capped at 5
  recordView: (entry: Omit<RecentEntry, 'viewedAt'>) => void;
  clear: () => void;
};
```

- Storage key: `neurowiki:recents:v1` (matches the existing `:v1` convention from `useFavorites`)
- Storage format: JSON array of RecentEntry objects
- Cap: store at most **20 entries** in localStorage (older entries dropped LIFO); display only the first 5
- `recordView` is called from each detail page's mount effect. Calling `recordView` for an `id` that already exists in storage updates `viewedAt` to now and moves the entry to the front (no duplicates).
- `recents` is sorted by `viewedAt DESC`
- The hook subscribes to `storage` events so that recording a view in one tab updates the other tab's Home page on focus

### 1.6.5 Privacy

Recently viewed is local-only. There is no server-side recording. `clear()` removes the localStorage key entirely.

## 1.7 Trending trials

Reference: home-reference.html line 417.

### 1.7.1 Visibility rule

Rendered ONLY when pill = `All`. NEVER rendered when a scenario pill is active. Trending is **always present** on All view (unlike Recently viewed, which requires population) — even on the user's first ever visit.

### 1.7.2 Header

```
[eyebrow]   Trending trials                    [microcopy]   Refreshes daily
```
- Left: same eyebrow style as Recently viewed
- Right: `text-[10px] text-slate-400 font-medium`, copy = `Refreshes daily`
- The two are arranged with `flex items-baseline justify-between mb-1`
- Top margin: `mt-9`

### 1.7.3 Item count

Exactly **5 trial row cards**.

### 1.7.4 Selection mechanism — daily seeded

Implementation lives in `src/hooks/useTrending.ts`:

```ts
function useTrending(): TrialRow[] {
  // 1. Get today's date in YYYY-MM-DD using the user's local timezone
  // 2. Hash that string to a numeric seed (e.g. djb2 or simple FNV-1a)
  // 3. Use the seed to drive a deterministic PRNG (e.g. mulberry32)
  // 4. Fisher-Yates shuffle the full trial catalog (clone first)
  // 5. Take the first 5 entries
  // 6. Memoize the result for the lifetime of the page (it can't change today)
  // Return the 5 trials with the same row-shape as TrialLegendCard expects.
}
```

- Source list: full trial catalog from `src/data/trialListData.ts` (currently 79 trials)
- Date string format: `YYYY-MM-DD` (e.g. `2026-05-02`), local time at app boot
- Same date → same 5 trials, in the same order, for everyone
- Crossing midnight does NOT auto-refresh the page; the change appears on next reload
- Implementation MUST NOT use `Math.random()` directly anywhere in the selection path (deterministic only)

### 1.7.5 Item rendering

Each trial uses the row card from HUB_SPEC §1.6 with the standard trial trail slot (year · venue, effect chip if available). Same anatomy as the Trials hub list. No special "trending" badge or treatment — these rows look indistinguishable from rows in the Trials hub.

### 1.7.6 "View all" link

Below the 5 trending rows, render:
```html
<a href="/trials" class="block text-center mt-3 text-[13px] font-medium text-neuro-500 hover:text-neuro-600">
  View all 79 trials →
</a>
```
- The trial count `79` is computed at build time from `trialListData.ts.length`
- Clicking goes to the Trials hub (Catalog tab default)

### 1.7.7 No analytics in v1.1

We do NOT track which trending trials get clicked, nor cycle them on impression. Selection is purely deterministic per day. If/when we add an editorial layer or impression-weighted rotation, that is a v2 spec change.

---

## 2. State machine

The Home page has three orthogonal state dimensions:

1. **Pill state** (URL-driven): `All` | `{scenario-id}` — derived from `?scenario=` query param
2. **Show more state** (localStorage-persisted): `false` | `true` — see §1.5.4
3. **Per-section expansion state** (React-local, per scenario): `Set<string>` of expanded scenario IDs — see §1.4.4

```
                          ┌─────────────────────────────────────────┐
                          │  pill = 'All' (default URL: /)          │
                          │                                         │
                          │  Sections rendered:                     │
                          │   • showMoreExpanded=false → first 3    │
                          │   • showMoreExpanded=true  → all 5      │
                          │                                         │
                          │  Per-section expansion (independent):   │
                          │   • First visit ever → scenario 1 open  │
                          │   • All other visits → all collapsed    │
                          │   • User taps any header → toggles that │
                          │     section only; never affects other   │
                          │     sections, never affects Show more   │
                          │                                         │
                          │  Show more button:                      │
                          │   • Tapping is the ONLY way to flip it  │
                          │                                         │
                          │  Recently viewed: shown if populated    │
                          │  Trending trials: always shown          │
                          │  Featured rail: always shown            │
                          └────────────────┬────────────────────────┘
                                           │
                              user clicks scenario pill
                                           │
                                           ▼
                          ┌─────────────────────────────────────────┐
                          │  pill = '{scenario-id}'                 │
                          │  URL: /?scenario={id}                   │
                          │                                         │
                          │  Sections rendered:                     │
                          │   • ONLY the matching scenario          │
                          │                                         │
                          │  That scenario is ALWAYS expanded       │
                          │  (overrides per-section state)          │
                          │                                         │
                          │  Show more button: NOT rendered         │
                          │  Recently viewed: NOT rendered          │
                          │  Trending trials: NOT rendered          │
                          │  Featured rail: NOT rendered            │
                          └─────────────────────────────────────────┘
```

Transitions:
- User clicks `All` pill → URL becomes `/`, returns to All view; `showMoreExpanded` and per-section state are preserved exactly as they were
- User clicks active scenario pill → returns to `All` (i.e. pill toggles off → `/`)
- Browser back/forward must traverse this graph correctly via URL state alone
- No React state should be derived from URL state via `useEffect` followed by a `setState` — read URL directly via `useSearchParams` to avoid reconciliation loops

---

## 3. Component decomposition

```
src/pages/Home.tsx                       (top-level page, reads URL state)
├── components/home/HomeHero.tsx         (eyebrow + title + lede)
├── components/home/MobileSearchBox.tsx  (mobile-only search trigger)
├── components/home/FeaturedRail.tsx     (eyebrow + 3 FeaturedTile from FEATURED array)
├── components/home/FeaturedTile.tsx     (single tinted tile — type label, name, description)
├── components/home/ScenarioPillRow.tsx  (6 pills, manages URL via useSearchParams)
├── components/home/ScenarioSection.tsx  (header + row list for one scenario)
├── components/home/ShowMoreToggle.tsx   (the chevron button + its state)
├── components/home/RecentlyViewed.tsx   (eyebrow + 5 row cards from useRecents)
└── components/home/TrendingTrials.tsx   (eyebrow + 5 row cards from useTrending + view-all link)
```

Row cards inside scenarios, recents, and trending all reuse a single shared `ToolRowCard` component (defined in HUB_SPEC; not Home-owned). The FeaturedTile is a separate primitive (`src/components/home/FeaturedTile.tsx`) — it does NOT reuse ToolRowCard, because Featured tiles are intentionally a different shape and visual treatment from row cards. See §1.25.4.

---

## 4. Data files

### 4.1 `src/data/scenarios.ts`

```ts
export type ScenarioId =
  | 'acute-stroke'
  | 'ich'
  | 'status-epilepticus'
  | 'severe-headache'
  | 'altered-mental-status';

export type ScenarioToolType = 'trial' | 'calculator' | 'pathway' | 'guide';

export type ScenarioToolRef = {
  type: ScenarioToolType;
  id: string;          // slug used to look up in trialListData / calculator data / pathway / guide
};

export type Scenario = {
  id: ScenarioId;
  pillLabel: string;   // short label for the pill
  title: string;       // section header title
  lede: string;        // section header sub-tagline
  pillDotClass: string;// "dot-ivt", "dot-surgical", etc
  tools: ScenarioToolRef[];
};

export const SCENARIOS: Scenario[] = [
  { id: 'acute-stroke',           pillLabel: 'Acute stroke', /*...*/ },
  { id: 'ich',                    pillLabel: 'ICH',          /*...*/ },
  { id: 'status-epilepticus',     pillLabel: 'Status',       /*...*/ },
  { id: 'severe-headache',        pillLabel: 'Headache',     /*...*/ },
  { id: 'altered-mental-status',  pillLabel: 'AMS',          /*...*/ },
];

export const VISIBLE_BEFORE_FOLD = 3;
```

The component renders **in the order defined in this array**. To rearrange scenarios, edit this file.

### 4.2 Lookup helpers

`scenarios.ts` exports `getScenario(id: ScenarioId): Scenario | undefined` and `resolveTool(ref: ScenarioToolRef): ToolRowProps | null`. The latter dispatches by `ref.type` to the appropriate data source (trial / calc / pathway / guide) and returns the props needed by `ToolRowCard`. If a referenced tool is missing, `resolveTool` returns `null` and the row is skipped (with a dev console warning).

---

## 5. Routing

| URL | Behaviour |
|---|---|
| `/` | All pill active, Show more collapsed |
| `/?scenario={id}` | Matching scenario pill active, single scenario in view |
| `/?scenario={unknown}` | Treat as `/` (clear param, console warning in dev) |

Home is the index route (`/`). No nested routes.

---

## 6. Accessibility

- Pill row: `role="tablist"`, each pill `role="tab"`, with `aria-selected="true"` on the active one. The corresponding scenario section receives `role="tabpanel"` and `aria-labelledby`.
- Show more button: `aria-expanded={showMoreExpanded}` and `aria-controls` pointing to the wrapper that holds the hidden scenarios.
- Recently viewed and Trending eyebrow headers use `<h2>` (page title is `<h1>` in the hero).
- Each scenario section header uses `<h2>` as well; row card titles use `<h3>` (matching HUB_SPEC).
- Star icon in the page header (when active) has `aria-pressed="true"` (LAYOUT_SPEC).

---

## 7. Engineering notes

- Page uses `react-router-dom` `useSearchParams` for pill state — never `useState` for the active scenario.
- Scenario data MUST be statically importable (no async fetch); SSR/SSG-safe.
- `useTrending` MUST run in a single render with no flicker. Result is computed in `useMemo(() => …, [todayKey])` where `todayKey` is the date string.
- `useRecents` MUST hydrate from localStorage in a `useEffect`, not during render, to avoid SSR mismatch. Initial render returns `[]`; if first paint matters, accept the one-tick delay.
- The 5-tab bottom nav, mobile header, and desktop rail are NOT owned by this spec. Home renders inside the Layout shell. See LAYOUT_SPEC.

---

## 8. Out of scope (parked)

- Editorial picks for Trending (manual override of the daily-seeded selection)
- Long-press to favourite a tool from a row card (mobile)
- Saved searches surfaced on Home
- Cross-scenario tagging UI for content authors
- A "Bring me back to where I was" deep link from the last viewed detail page

---

## 9. Acceptance gates

A Home implementation is considered v1.1-compliant when ALL of the following hold:

1. **Build/typecheck**: `npm run build` and `npm run typecheck` pass clean
2. **Visual QA**: each of the 3 archetypes in `home-reference.html` renders identically (pixel-perfect to the row card / pill / section header level) when viewed at 440px viewport width
3. **Spec compliance**: every claim in this spec that is observable in the DOM/CSS/network is verified; deviations are documented in the implementation report
4. **SEO**: the `/` route emits the correct `<title>` and meta description; `/?scenario=acute-stroke` emits a scenario-specific title (e.g. "Acute stroke tools — NeuroWiki") and meta description
5. **Regression**: existing routes (`/trials`, `/calculators`, `/pathways/*`, `/guide/*`) continue to work; `useFavorites` continues to function unchanged
6. **TASKS.md**: the matching task entry is checked off and any deviations are logged

---

## Appendix A — Category dot reference

This is duplicated from HUB_SPEC §A for convenience. Source of truth: HUB_SPEC.md.

| Class | Color | Used for |
|---|---|---|
| `.dot-ivt` / `.row-ivt` | #10b981 emerald | IVT trials, Acute stroke scenario pill |
| `.dot-evt` / `.row-evt` | var(--color-neuro-500) cobalt | EVT trials, stroke pathways |
| `.dot-prevention` / `.row-prevention` | #0891b2 teal | Prevention trials, headache scenario, risk calcs |
| `.dot-surgical` / `.row-surgical` | #7c3aed violet | Surgical trials, ICH scenario, classification calcs |
| `.dot-status` / `.row-status` | #f59e0b amber | Status epilepticus, epilepsy guide |
| `.dot-general` / `.row-general` | #94a3b8 slate-400 | AMS scenario, general guide |
| `.dot-cobalt` / `.row-cobalt` | var(--color-neuro-500) cobalt | Severity calcs, vascular guide |

Critical naming rule (v1.1 bug fix): `.dot-*` is for color utility on dot elements; `.row-*` is for row-card category indicator (scoped to `::before` only). Never apply `.dot-*` to a row card directly.

---

## Changelog

- **v1.0** (superseded) — Home was a tile-grid scenario launcher with a flip-to-list secondary state. Replaced because the flip felt heavy and broke the universal hub pattern.
- **v1.1** (superseded) — Single-state hub anatomy: scenarios as pills, Show more fold between scenarios, Recently viewed and Trending visible only on All view, daily-seeded Trending mix of 5 trials. Section headers used a small left dot + 15px title. Show more was session-local React state.
- **v1.2** (superseded) — Section header redesign and collapsibility:
  - Scenario sections are now **collapsible**. Each header is a `<button>` that toggles its body's visibility. Multiple sections can be open simultaneously.
  - Section header **drops the left dot entirely**. Title is bumped to 18px / weight 600 / sentence case to read as a heading rather than a list item.
  - Section header gets a **tinted background** matching the scenario's category color: 8% opacity when collapsed, 12% opacity when expanded. No border, no left edge.
  - Subtitle (line 2) combines lede + tool count as `{lede} · {N} tools`. Always visible (collapsed-density variant was considered and rejected).
  - **Default collapse state**: all scenarios collapsed by default. On the user's very first visit (detected via `localStorage:neurowiki:home:hasVisited`), scenario 1 is auto-expanded as a discoverability hint; all subsequent visits open with everything collapsed.
  - **Show more state is now persistent** in `localStorage:neurowiki:home:showMoreExpanded` (was session-local in v1.1). Dismissable only by tapping the button itself; section collapse/expand interactions do not affect it.
  - When a non-All pill is active, the matching scenario is rendered always-expanded regardless of per-section state.
  - New hook: `useScenarioExpansion(scenarios)`. Updated hook: `useShowMore()` now reads/writes localStorage.
- **v1.3** (superseded) — Featured rail added:
  - New top-of-page **Featured rail** (§1.25), sitting between mobile search and pill row, surfacing 3 V-curated pinned tools (calculators or pathways only — no trials, no guide articles).
  - Tile treatment: 8% category-color tint (matches scenario header collapsed state visually but is its own primitive), no border, no dot, no score chip. Three lines of content: type label, name, description.
  - Mobile: horizontal-scroll all 3 tiles. Desktop: 3 tiles in a row at `.zone-reference` width.
  - Visibility: ONLY on All view. Hidden when any scenario pill is active (same rule as Recently viewed and Trending).
  - Curation: hardcoded array in `src/data/featured.ts`. TypeScript type union enforces calc/pathway only. Build-time check enforces exactly 3 entries.
  - New components: `FeaturedRail.tsx`, `FeaturedTile.tsx`. Featured tiles do NOT reuse ToolRowCard — different visual primitive on purpose.
  - State machine updated: Featured rail visibility added to both All view (always shown) and scenario-active view (NOT rendered).
- **v1.4** (current) — In-page search box removed. The mobile search box previously rendered between hero and pills (and on every hub) is removed. Search lives only in the application chrome (mobile header search button per LAYOUT_SPEC §1.3.1, desktop top bar centered search per LAYOUT_SPEC §6.2.2). §1.2 is preserved as a tombstone to keep the §1.25 / §1.3 / §1.4 numbering stable across cross-references. Featured rail (§1.25) now sits directly below the hero. This is a universal rule applied to HUB_SPEC v1.2 as well.
