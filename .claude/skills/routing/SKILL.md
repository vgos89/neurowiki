---
name: routing
description: NeuroWiki routing conventions — routes defined in src/App.tsx (NOT router.tsx), route manifest at src/config/routeManifest.ts, lazy import pattern, check:routes validator, current route count. Load when adding routes, new pages, or investigating navigation issues.
---

# Routing Conventions — NeuroWiki

## Critical: routes live in src/App.tsx

**NOT** `src/router.tsx` (that file does not exist).  
**NOT** `src/pages/` (no file-based routing — this is a SPA).

The canonical files are:
- `src/App.tsx` — React Router 7 `<Routes>` config with lazy imports
- `src/config/routeManifest.ts` — metadata manifest (title, description, zone, navTab, etc.)

## How to add a new route

### Step 1: Create the page component

```typescript
// src/pages/MyNewPage.tsx
export default function MyNewPage() {
  return <div>content</div>;
}
```

### Step 2: Add lazy import to src/App.tsx

```typescript
const MyNewPage = lazy(() => import('./pages/MyNewPage'));
```

Then add the `<Route>` inside the existing `<Routes>`:

```jsx
<Route path="/my-new-path" element={<Suspense fallback={<PageLoader />}><MyNewPage /></Suspense>} />
```

### Step 3: Add entry to src/config/routeManifest.ts

```typescript
{
  path: '/my-new-path',
  title: 'Page Title · NeuroWiki',           // ≤60 chars total
  description: 'Plain English description',   // ≤160 chars
  zone: 'reading',                            // 'reading' | 'reference' | 'pathways' | 'trials'
  bottomNavTab: null,                         // or 'trials' | 'calculators' | 'pathways' | 'guide'
  railItem: null,                             // desktop rail item key or null
}
```

### Step 4: Run check:routes

```bash
npm run check:routes
```

This runs `scripts/validateRouteManifest.mjs` which enforces:
- Every route in App.tsx has a matching manifest entry
- Every route has title, description, zone, bottomNavTab, railItem
- No two routes share the same title
- No stale entries in manifest for routes that no longer exist

**Route count as of 2026-05-13: 39 routes.** The validator reports the count. If your change adds routes, the count increases.

## Zone system (CLAUDE.md §5b)

| Zone | CSS class | Usage |
|---|---|---|
| `reading` | `.zone-reading` | Guide pages, articles, long-form content |
| `reference` | `.zone-reference` | Calculators, quick lookups |
| `pathways` | `.zone-pathways` | Clinical decision workflows |
| `trials` | (implied by tab) | Trials, questions, trial detail pages |

## Bottom nav tabs (mobile)

| Tab key | Icon | Path prefix |
|---|---|---|
| `pathways` | Pathways icon | `/pathways/*` |
| `trials` | Trials icon | `/trials/*` |
| `calculators` | Calc icon | `/calculators/*` |
| `guide` | Guide icon | `/guide/*` |
| `null` | (no highlight) | Home, legal pages, dev routes |

## Redirect pattern

```typescript
// In App.tsx for legacy URL redirect:
<Route path="/calculators/nihss" element={<Navigate to="/pathways/nihss" replace />} />
```

Also add to `vercel.json` for pre-JS redirects:
```json
{ "source": "/calculators/nihss", "destination": "/pathways/nihss", "permanent": true }
```

## Dev routes

`/dev/*` routes exist for component testing. They do NOT appear in the route manifest and are excluded from sitemap. Current: `/dev/rct-chain-test`.

## Lazy loading pattern

All page components must be lazy-imported. The pattern established in Phase 6A:
```typescript
const TrialPageNew = lazy(() => import('./pages/trials/TrialPageNew'));
```

For sub-components that are large (chart archetypes, etc.), use `React.lazy()` internally in the page file.

## routeManifest vs routeMeta.ts

`routeMeta.ts` does not exist. The canonical file is `src/config/routeManifest.ts`. Any agent referencing `routeMeta.ts` is using stale documentation.

## What the seo-specialist owns here

seo-specialist reviews that every new route has: correct title/description lengths, JSON-LD structured data (for trial/calculator pages), sitemap.xml inclusion, no duplicate titles. Invoke seo-specialist on every new public route.
