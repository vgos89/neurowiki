# LAYOUT_SPEC v1.2

**Version:** 1.2
**Companion mockup:** `docs/specs/mockups/layout-reference.html`
**Status:** Locked
**Owner:** PM (V) · Engineering (Build Engineer / Class C)

---

## 0. Purpose

Defines the persistent application **chrome** — the surfaces that wrap every page on every viewport. There are exactly two chrome systems:

- **Mobile chrome**: 60px sticky header at top + 60px sticky bottom-nav with 5 tabs at bottom
- **Desktop chrome**: 224px fixed left rail + 60px top bar (centered search, no logo — logo lives in rail)

The chrome is unchanged across all pages. Page-level content is layered inside it.

## 0.1 Scope

This spec governs:
- Mobile header (logo, search trigger, favourites star)
- Mobile bottom nav (5 tabs, active state, icons)
- Desktop left rail (logo lockup, 5 nav items, active state, About/Feedback footer link)
- Desktop top bar (centered search, favourites star, no logo)
- Width zone utilities (`.zone-reading`, `.zone-reference`)
- The 5 tab icons (custom SVGs for Calcs / Pathways / Guide; lucide-react allowed for Home / Trials)
- The favourite-star button visual states

This spec does NOT govern:
- Any page body content (Home, hubs, detail pages) — see HOME_SPEC, HUB_SPEC, CALCULATOR_SPEC, TRIALS_SPEC
- Search overlay (future SEARCH_SPEC)
- Modal / drawer / overlay surfaces — these layer above the chrome but are owned by the page that opens them

> **Note on the companion mockup:** `layout-reference.html` includes representative body content inside the chrome frame so the chrome is not visually orphaned. **That body content is illustrative only — its anatomy is governed by HOME_SPEC and HUB_SPEC, not this spec.** The yellow placeholder note inside each archetype calls this out explicitly. If a body-level visual decision needs to be reviewed, it belongs in the corresponding page spec.

> **Universal search rule (added with HUB_SPEC v1.2 / HOME_SPEC v1.4):** Search is rendered ONLY in the application chrome — the mobile header search button (§1.3.1) and the desktop top bar centered search (§6.2.2). NO page body should contain an in-page search input. This applies to Home, every hub (Trials / Calcs / Pathways / Guide), and every detail page. If a future page needs scoped search (e.g. searching within a long article), open a feature-spec ADR rather than embedding a search input in the body.

---

## 1. Mobile chrome — header

Reference: layout-reference.html line 127 (Archetype 1, default state).

### 1.1 Container

```
height: 60px
background: white
border-bottom: 1px solid #f1f5f9 (slate-100)
display: flex
align-items: center
justify-content: space-between
padding: 0 20px (px-5)
position: sticky / fixed at top of viewport
z-index: above page body, below modals
```

### 1.2 Brand lockup (left)

- 28×28px square, `bg-neuro-500`, rounded-lg, white serif "N" with letter-spacing -0.04em
- Followed by wordmark: `Neuro` (slate-900 semibold) + `Wiki` (`text-neuro-500` semibold), `text-base tracking-tight`
- Gap between glyph and wordmark: 10px (`gap-2.5`)
- Tapping the lockup goes to `/`

### 1.3 Header actions (right)

Two buttons, 36×36px each, slate-700 default text color, with rounded-full hit target. Hover state adds `bg-slate-50`.

#### 1.3.1 Search button
- Magnifying glass icon, 20×20px (`w-5 h-5`)
- Tap opens the global search overlay (out of scope here)

#### 1.3.2 Favourites star button
Reference: layout-reference.html line 132 (inactive) and line 220 (active).

- 20×20px star icon
- Inactive: `text-slate-400 fill="none" stroke-width="1.6"`
- Active: `text-amber-400 fill="currentColor" stroke="currentColor" stroke-width="1.6"`
- Tapping toggles the URL query param `?favs=true` on the current route. The page body responds (filters its content) per HUB_SPEC §6.
- `aria-pressed={isFavsActive}` and `aria-label="Show only favourites" / "Show all"`
- The star REPLACES what would have been a 4th bottom-nav tab in earlier designs. It is intentionally NOT a tab — favourites is a **filter applied to the current hub**, not a destination.

### 1.4 Mobile header on desktop

The mobile header is hidden at `md:` breakpoint and above. Desktop chrome (§6) takes over.

---

## 2. Mobile bottom nav

Reference: layout-reference.html line 173.

### 2.1 Container

```
height: 60px
background: white
border-top: 1px solid #f1f5f9
display: flex (5 equal flex-1 children)
position: fixed at bottom of viewport
z-index: above page body, below modals
```

### 2.2 Tab order (left to right)

1. **Home** → `/`
2. **Trials** → `/trials`
3. **Calcs** → `/calculators`
4. **Pathways** → `/pathways`
5. **Guide** → `/guide`

This order is locked. Reordering requires a spec revision.

### 2.3 Tab anatomy

Each tab is a flex column, centered, gap-0.5:
- Icon (22×22px)
- Label (`text-[10px] font-medium`)
- Active: `text-neuro-500` and `aria-current="page"`
- Inactive: `text-slate-400`
- No hover state on mobile; tap target is the full tab cell (60×~76px including label)

### 2.4 Active tab matching

- `/` → Home active
- `/trials*` → Trials active
- `/calculators*` → Calcs active
- `/pathways*` → Pathways active
- `/guide*` → Guide active
- Detail pages within a hub keep their hub's tab active (e.g. `/trials/extend` → Trials active)
- Favourite filter (`?favs=true`) does NOT change the active tab

### 2.5 Bottom nav on desktop

Hidden at `md:` and above. Desktop rail takes over.

---

## 3. Custom icon: Calcs (3×3 numpad)

Reference: layout-reference.html line 183.

```svg
<svg viewBox="0 0 24 24" fill="currentColor">
  <circle cx="6" cy="7" r="1.4"/>  <circle cx="12" cy="7" r="1.4"/>  <circle cx="18" cy="7" r="1.4"/>
  <circle cx="6" cy="12" r="1.4"/> <circle cx="12" cy="12" r="1.4"/> <circle cx="18" cy="12" r="1.4"/>
  <circle cx="6" cy="17" r="1.4"/> <circle cx="12" cy="17" r="1.4"/> <circle cx="18" cy="17" r="1.4"/>
</svg>
```

9 dots in a 3×3 grid. Filled dots, 1.4 radius, evenly spaced at columns 6/12/18 and rows 7/12/17. **Filled** in both active and inactive states (color comes from CSS).

This icon is unique to NeuroWiki and lives at `src/components/icons/CalcsIcon.tsx`.

## 4. Custom icon: Pathways (branching nodes)

Reference: layout-reference.html line 192.

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <circle cx="5" cy="6" r="1.8"/>
  <circle cx="12" cy="12" r="1.8"/>
  <circle cx="19" cy="6" r="1.8"/>
  <circle cx="19" cy="18" r="1.8"/>
  <path d="M6.5 7.2L10.5 11"/>
  <path d="M13.5 11L17.5 7.2"/>
  <path d="M13.5 13L17.5 16.8"/>
</svg>
```

4 nodes, 3 edges, decision-tree topology. Stroked nodes (not filled), stroke-width 2. Lives at `src/components/icons/PathwaysIcon.tsx`.

## 5. Custom icon: Guide (document)

Reference: layout-reference.html line 200.

```svg
<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <rect x="4" y="3" width="16" height="18" rx="2"/>
  <line x1="8" y1="8" x2="16" y2="8"/>
  <line x1="8" y1="12" x2="16" y2="12"/>
  <line x1="8" y1="16" x2="13" y2="16"/>
</svg>
```

Document outline with 3 horizontal text lines, last line shorter. Lives at `src/components/icons/GuideIcon.tsx`.

(Home and Trials use lucide-react icons — `Home` and a flask analogue. Custom SVG only for the 3 above.)

---

## 6. Desktop chrome — left rail + top bar

Reference: layout-reference.html line 282.

### 6.1 Left rail

Reference: layout-reference.html line 286.

```
width: 224px (fixed, w-[224px], flex-shrink-0)
background: white
border-right: 1px solid #f1f5f9
display: flex flex-col
padding: 18px 14px
position: sticky / fixed at left edge, full viewport height
```

#### 6.1.1 Brand lockup (top of rail)

- 30×30px square (slightly larger than mobile), same cobalt + serif N
- Wordmark `NeuroWiki` to the right
- Bottom border (`border-b border-slate-100`) and bottom margin separating brand from nav
- Padding under the lockup: 20px

#### 6.1.2 Nav items

5 items, same destinations and order as mobile bottom nav (§2.2).

Each item:
```
display: flex
align-items: center
gap: 12px (gap-3)
padding: 10px 12px
border-radius: 8px (rounded-lg)
font-size: 13.5px
font-weight: 500
color: text-slate-700 (inactive) / text-neuro-500 (active)
hover: bg-slate-50 transition-colors
```

Icons are 18×18px (`w-[18px] h-[18px]`), `opacity-85` to soften against the cobalt active state.

#### 6.1.3 Active state — cobalt left edge

The active rail item uses `.rail-item-active`:
```css
.rail-item-active {
  background-color: var(--color-neuro-50);  /* #EEF2FF */
  color: var(--color-neuro-500);            /* #1746A2 */
  font-weight: 600;
  position: relative;
}
.rail-item-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  bottom: 8px;
  width: 2px;
  background-color: var(--color-neuro-500);
  border-radius: 1px;
}
```

The 2px cobalt left edge runs from 8px below the top of the item to 8px above the bottom (i.e. inset 8px). It marks the active item without competing with the bg-neuro-50 fill.

#### 6.1.4 Footer (bottom of rail)

Below the nav items, push to the bottom of the rail with `flex-1` spacer:
```
border-top: 1px solid #f1f5f9
padding-top: 14px
padding-left/right: 12px (px-3)
content: <a class="text-[11px] text-slate-500 hover:text-slate-700">About · Feedback</a>
```

### 6.2 Top bar

Reference: layout-reference.html line 338.

```
height: 60px
background: white
border-bottom: 1px solid #f1f5f9
display: flex
align-items: center
padding: 0 32px (px-8)
gap: 16px (gap-4)
```

#### 6.2.1 No logo

The desktop top bar does NOT contain the brand lockup. The logo lives only in the rail. This is intentional — duplicating the logo would visually weight the top-left corner.

#### 6.2.2 Centered search (max-width 520px)

Three-column flex layout:
- Left flex spacer (`flex-1`)
- Center: search input — `bg-slate-50 border border-slate-100 rounded-full px-4 py-2`, max-width 520px, full width within bounds
- Right flex container (`flex-1 flex justify-end`) holding the favourite star button

Search input contents:
- 14×14px magnifying glass icon (slate-400)
- Placeholder text: `Search trials, calculators, pathways, guides…` (slate-400, text-[13px])
- Right-aligned `⌘K` keyboard hint inside a thin border kbd element

Tapping the search opens the global search overlay (out of scope here).

#### 6.2.3 Favourites star button

36×36px. Same visual states as mobile (§1.3.2). Same URL toggle behaviour. Right-aligned in the right flex container.

### 6.3 Layout composition

The Layout shell renders:
```jsx
<div className="md:flex">
  <aside className="hidden md:block w-[224px] ...">{/* rail */}</aside>
  <div className="flex-1 flex flex-col min-w-0">
    <MobileHeader className="md:hidden" />
    <DesktopTopBar className="hidden md:flex" />
    <main className="flex-1 overflow-y-auto">{children}</main>
    <MobileBottomNav className="md:hidden" />
  </div>
</div>
```

The desktop main column scrolls independently of the rail. The mobile main column scrolls with the page (sticky header / fixed bottom nav).

---

## 7. Width zones

Reference: layout-reference.html lines 400 and 410.

The Layout does NOT enforce a max-width on the main column. Pages opt into a width zone via a wrapper class:

### 7.1 `.zone-reading` — long-form (768px)

Reference: layout-reference.html line 400.
```css
max-width: 48rem; /* max-w-3xl */
margin-left: auto;
margin-right: auto;
```
Used for: trial detail, calculator detail, guide article, question detail. Optimal line length for reading body copy.

### 7.2 `.zone-reference` — scanning (1024px)

Reference: layout-reference.html line 410.
```css
max-width: 64rem; /* max-w-5xl */
margin-left: auto;
margin-right: auto;
```
Used for: Home, Trials hub, Calculators hub, Pathways hub, Guide hub. Allows wider grids and parallel rows without exceeding comfortable scan width.

### 7.3 No-zone pages

Pages that need full width (e.g. a future map view) opt out of both zones and apply their own width logic.

The Layout never injects a zone class — it is always opt-in by the page.

---

## 8. localStorage cleanup

The previous design had a sidebar tools panel using `localStorage` key `neurowiki-sidebar-tools`. This panel is removed in v1.1. On Layout mount:
```ts
useEffect(() => {
  // One-shot cleanup — safe to remove this effect after 90 days
  localStorage.removeItem('neurowiki-sidebar-tools');
}, []);
```

---

## 9. Routes the Layout shell wraps

| Route | Renders |
|---|---|
| `/` | HOME_SPEC |
| `/trials` and `/trials/*` | TRIALS_SPEC |
| `/calculators` and `/calculators/*` | CALCULATOR_SPEC |
| `/pathways` and `/pathways/*` | future PATHWAY_SPEC |
| `/guide` and `/guide/*` | future GUIDE_SPEC |

The Layout wraps every route. Detail pages inside hubs use the same chrome.

---

## 10. Accessibility

- Mobile bottom nav: `<nav role="navigation" aria-label="Main">`. Each tab is `<a>` with `aria-current="page"` on the active tab.
- Desktop rail: same — `<aside><nav role="navigation" aria-label="Main">…</nav></aside>`.
- Header search button: `aria-label="Open search"`.
- Favourites star button: `aria-pressed` and `aria-label` per §1.3.2.
- Skip link: render a visually hidden `<a href="#main">Skip to main content</a>` as the first focusable element (per accessibility best practice).

---

## 11. Engineering notes

- All 3 custom icons (Calcs, Pathways, Guide) are React components in `src/components/icons/`. They forward all SVG props so callers can size and color them.
- The Layout shell uses CSS-driven responsive switching at the `md:` breakpoint (Tailwind default 768px). It does NOT branch on `useMediaQuery` — both chromes render and one is hidden via Tailwind `hidden md:block` / `md:hidden`.
- Sticky vs fixed: mobile header uses `sticky top-0`; bottom nav uses `fixed bottom-0` (so iOS keyboard does not push it). Desktop rail uses `sticky top-0 h-screen`.

---

## 12. Acceptance gates

A Layout implementation is considered v1.1-compliant when:

1. Build/typecheck pass
2. Visual QA: mobile chrome and desktop chrome render identically to layout-reference.html at 440px and 1280px viewports respectively
3. The 5 bottom-nav tabs and 5 rail items match the order in §2.2 / §6.1.2
4. The 3 custom icons render exactly as specified in §3, §4, §5 (path-level match)
5. Active state for both mobile tab and desktop rail behaves per §2.4 and §6.1.3
6. localStorage cleanup (§8) runs once and the key is gone
7. Width zones (§7) are utility classes available to consuming pages but not auto-applied
8. The favourites star toggles `?favs=true` on the current route without changing the active tab
9. TASKS.md entries are checked off

---

## Changelog

- **v1.0** (superseded) — same chrome anatomy, but companion mockup `layout-reference.html` rendered empty body slots that read as broken layout when viewed in isolation.
- **v1.1** (superseded) — companion mockup now includes representative body content inside each archetype with an explicit yellow note clarifying that bodies are illustrative only (governed by HOME_SPEC / HUB_SPEC). Spec text adds the same clarification in §0.1. No chrome anatomy changes.
- **v1.2** (current) — added a universal search-in-chrome rule note to §0.1, codifying the design constraint that search inputs only appear in the chrome (mobile header button §1.3.1, desktop top bar centered search §6.2.2). No body content (Home, hubs, detail pages) renders an in-page search input. Coordinates with HUB_SPEC v1.2 (in-page search removed) and HOME_SPEC v1.4 (in-page search removed). Chrome anatomy itself is unchanged.
