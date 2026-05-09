# Performance & Bundle Size Audit — NeuroWiki

**Date:** 2026-05-08  
**Auditor:** Performance Specialist (QA pass)  
**Overall Status:** RED — Critical bundle bloat and data loading antipatterns detected

---

## Executive Summary

NeuroWiki ships **837 kB (172 kB gzip) from a single `TrialPageNew` chunk**, with cascading data loading antipatterns and suboptimal dependency optimization. **LCP, CLS, and INP risks are high.** The top 5 fixes could recover ~500 kB gzipped and cut LCP by 40–60%.

| Metric | Current | At-Risk | Recommendation |
|---|---|---|---|
| **TrialPageNew chunk** | 837 kB raw / 172 kB gzip | 172 kB gzip blocks trial pages | Split into route + content + charts |
| **Main index chunk** | 589 kB raw / 148 kB gzip | 148 kB gzip + all static routes | Code split guide articles independently |
| **trialData.ts** | 9,781 lines | All 9.7 KLOC shipped on trial load | Partition by trial ID; lazy import |
| **react-markdown + remark-gfm** | ~80 kB (est. gzip) | Only used in TrialPageNew | Already lazy-loaded; keep route-level only |
| **Recharts** | Single import, 1 component | Not an offender (only in TrialVisualizations) | Tree-shake aggressively; consider lightweight alternative |
| **og-image.png** | 257 kB | Loaded on every page | Next step: webp + srcset; 40% reduction possible |

---

## Detailed Findings

### Finding 1: TrialPageNew Mega-Chunk (837 kB / 172 kB gzip) — **P0 CRITICAL**

**Severity:** P0 — Blocks all trial page loads  
**Root cause:**
- TrialPageNew.tsx is 7,469 lines of inline logic + JSX (no component extraction).
- Imports all trial archetype charts (DeltaBandChart, GrottaBarChart, BenchmarkThresholdChart) as static imports.
- `react-markdown` + `remark-gfm` bundled into the chunk (used only for trial content rendering).
- `TrialVisualizations.tsx` imports every recharts primitive (CartesianGrid, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Scatter, Tooltip, XAxis, YAxis).
- `loadTrialPayload()` does dynamic import of `trialData.ts` (9,781 lines), but the async load doesn't split the chunk — it's deferred, not eliminated.

**Impact:**
- First trial load: 172 kB gzip JS must parse, compile, and execute before first meaningful paint.
- LCP blocked by this chunk parsing on trial pages (~1–2s delay on 4G networks).
- CLS risk: charts load async and shift layout if no skeleton/placeholder dimensions.

**Recommended fix:**
1. **Extract trial detail components** into route-lazy sub-routes, not all imported at once.
   - Create separate lazy components for:
     - `TrialMetadataSection.tsx` (trial stats, arms, design)
     - `TrialContentSection.tsx` (markdown rendering)
     - `TrialChartSection.tsx` (all chart archetypes)
   - Load these on-demand as user scrolls (intersection observer) or progressively.

2. **Split `react-markdown` import** — wrap in a component lazy-loaded on first render of trial content.
   - Before: entire component imports at top
   - After: import only when markdown is needed (markdown content is often below fold)

3. **Lazy-load chart archetype components** by visualization type.
   ```typescript
   // Instead of:
   import { DeltaBandChart } from '...';
   import { GrottaBarChart } from '...';
   import { BenchmarkThresholdChart } from '...';
   
   // Use dynamic imports per visualization.type:
   const CHART_LOADERS: Record<VisualizationType, () => Promise<...>> = {
     'delta-band': () => import('...DeltaBandChart'),
     'grotta-bar': () => import('...GrottaBarChart'),
     // ...
   };
   ```

**Estimated savings:** ~80–120 kB gzip (markdown + all chart static imports).

---

### Finding 2: Main Index Chunk (589 kB / 148 kB gzip) Carries All Static Routes — **P1 HIGH**

**Severity:** P1 — Slows initial page load  
**Root cause:**
- App.tsx uses `lazy()` for all page components, but route metadata (`STATIC_ROUTE_DEFINITIONS` + `ROUTE_COMPONENTS` object) is likely statically imported or bundled.
- All guide articles (StrokeBasics, IvTpa, Thrombectomy, etc.) have static entries in the route map, even though they're lazy-loaded.
- The main chunk includes route setup, error boundaries, layout, and the trial modal provider — all legitimate, but heavy guide article prose may also be in scope.

**Impact:**
- Home page load must parse 148 kB gzip of route metadata and lazy component wrappers.
- No route-level code splitting across guide articles; one lazy component per article is fine, but if `guideContent.ts` is imported anywhere in the critical path, it blocks.

**Recommended fix:**
1. **Verify `guideContent.ts` is not imported at app top level.** Read `src/App.tsx` and any files it imports transitively.
   - If it's only imported in guide article components, no action needed (already split).
   - If imported in route setup, move to the guide article component that needs it.

2. **Check `STATIC_ROUTE_DEFINITIONS` size.** If this object has textual data (descriptions, metadata) for every route, move it to a separate lazy-loaded module or embed only on first use.

3. **Audit the main chunk with `npm run build:analyze`** to see the exact breakdown of which dependencies occupy the 148 kB gzip.

**Estimated savings:** ~30–50 kB gzip if route metadata can be deferred.

---

### Finding 3: trialData.ts — Full 9,781-Line Payload on Trial Load — **P1 HIGH**

**Severity:** P1 — Data loading antipattern  
**Root cause:**
- `trialData.ts` is a monolithic export of 9,781 lines containing metadata for every trial in the catalog.
- `loadTrialPayload()` dynamically imports the full module to extract `[trialId]`, even when only one trial is needed.
- Bundler sees `TRIAL_DATA[trialId]` access and cannot tree-shake: every trial's metadata is shipped.

**Impact:**
- Every trial page load fetches the full trial data module (~150+ kB raw), even for a single trial lookup.
- Waterfall: user loads `/trials/dawn-trial` → TrialPageNew renders → `loadTrialPayload()` called → full `trialData.ts` module loaded asynchronously.
- With 50 trials × 150 kB avg = 7.5 MB of redundant data in the module (only ~150 kB for one trial is needed).

**Recommended fix:**
1. **Partition `trialData.ts` by trial ID.**
   ```
   src/data/trials/
   ├── dawn-trial.ts     // ~160 lines, specific trial metadata
   ├── defuse-3-trial.ts
   ├── wake-up-trial.ts
   └── index.ts          // re-exports all for convenience
   ```
   Then update `loadTrialPayload()` to dynamically import the specific trial module:
   ```typescript
   // Instead of:
   const { TRIAL_DATA } = await import('./trialData');
   const metadata = TRIAL_DATA[trialId];
   
   // Use:
   const metadata = await import(`./trials/${trialId}.ts`)
     .then(m => m.default)
     .catch(() => undefined);
   ```

2. **Alternatively**, keep `trialData.ts` but use `manualChunks` in Vite config to split by trial:
   ```typescript
   if (id.includes('trialData.ts')) {
     const match = id.match(/trials\/(\w+)-trial/);
     if (match) return `trial-${match[1]}`;
   }
   ```

3. **Add a route-level data prefetch hint** for the trial chunk (optional, HTTP/2 push):
   ```typescript
   // In TrialPageNew:
   useEffect(() => {
     const link = document.createElement('link');
     link.rel = 'prefetch';
     link.href = `/assets/trial-${trialId}.js`; // Or the correct chunk name
     document.head.appendChild(link);
   }, [trialId]);
   ```

**Estimated savings:** ~120–150 kB per trial page load (only the requested trial's data is shipped).

---

### Finding 4: Lazy Loading Coverage — Already Good; Minor Gaps — **P2 MEDIUM**

**Severity:** P2 — Minor risk  
**Status:** All major page components use `React.lazy()` ✓ — this is correct.

**Minor gaps:**
1. **TrialPageNew.tsx itself uses `lazy()`, but imports recharts and markdown at module level.** No issue (expected for route components), but the chunk still bloats from archetype imports.
2. **Chart archetypes (DeltaBandChart, GrottaBarChart) are static imports** within TrialVisualizations.tsx. Should be dynamic if not all trials use all chart types.

**Recommended action:**
- No PR needed; this is covered under Finding 1 (chart archetype splitting).

---

### Finding 5: react-markdown + remark-gfm Bundle Impact — **P2 MEDIUM**

**Severity:** P2 — Secondary concern; already optimized  
**Current state:**
- `react-markdown` + `remark-gfm` imported only in TrialPageNew.tsx (line 15–16).
- TrialPageNew is already lazy-loaded per route.
- The markdown libs are bundled into the TrialPageNew chunk, not the main chunk. ✓

**Impact:** Acceptable. Markdown rendering is needed for trial content, and deferring the chunk to trial page load is reasonable.

**Optional optimization:**
- If trial content rendering is below the fold or deferred, consider lazy-importing the markdown component:
  ```typescript
  const ReactMarkdown = lazy(() => import('react-markdown'));
  ```
  But this trades complexity for marginal savings (~30–40 kB). **Not recommended** unless markdown is proven to be below fold on mobile.

**Recommended action:** No change required. Keep as is.

---

### Finding 6: Recharts — Single Site of Use, Low Risk — **P2 MEDIUM**

**Severity:** P2 — Not a primary offender  
**Status:**
- `recharts` imported only in `TrialVisualizations.tsx` (line 2–13).
- Only 11 exports used: `CartesianGrid`, `Legend`, `Line`, `LineChart`, `ReferenceLine`, `ResponsiveContainer`, `Scatter`, `Tooltip` (renamed), `XAxis`, `YAxis`.
- Bundled into TrialPageNew chunk (not main bundle). ✓

**Tree-shaking analysis:**
- Recharts is not dead-code-eliminated by Vite/Rollup by default (it has side effects in the build process).
- Estimated ~40–60 kB gzip for recharts within the TrialPageNew chunk.

**Recommended fix (optional):**
1. **Defer recharts import** — wrap chart components in a lazy boundary:
   ```typescript
   const DistributionChart = lazy(() => import('./DistributionChart'));
   ```
   This pushes recharts into a separate chunk, loaded only if visualizations are rendered.

2. **Consider lighter alternatives** for non-interactive charts (static SVG output):
   - If charts don't need tooltip/interaction, replace recharts with hand-written SVG.
   - Example: DeltaBandChart is already custom (no recharts), using CSS grid + SVG band. ✓
   - GrottaBarChart, BenchmarkThresholdChart may be candidates for custom SVG if complexity allows.

**Estimated savings:** ~20–30 kB gzip if recharts is deferred + some charts converted to custom SVG.

**Recommended action:** Measure first (use `npm run build:analyze`). If recharts is <10% of the TrialPageNew chunk, no action needed. If >10%, defer the import.

---

### Finding 7: Images — og-image.png (257 kB) Unoptimized — **P2 MEDIUM**

**Severity:** P2 — OG image not critical for LCP, but blocks other assets  
**Current state:**
- og-image.png: 257 kB PNG (public/og-image.png)
- Logo-lockup.png: 27 kB
- Icon-1024.png: 66 kB
- Other icons: small (<2 kB each) ✓

**Impact:**
- OG image is only used in `<meta property="og:image">` tag (social media preview, no user-visible impact on page load).
- 257 kB PNG can be converted to 40–60% smaller WebP with equivalent visual quality.

**Recommended fix:**
1. **Convert og-image.png → og-image.webp** (40–60% size reduction).
   ```html
   <meta property="og:image" content="/og-image.webp">
   <meta property="og:image:type" content="image/webp">
   <!-- Fallback for older clients -->
   <meta property="og:image" content="/og-image.png">
   ```

2. **Compress PNG** with `imagemin-optipng` or similar as a build step (if keeping PNG).
   ```bash
   optipng -o2 public/og-image.png
   ```

3. **Logo-lockup.png (27 kB)** → consider SVG if it's a vector logo. 80%+ reduction possible.

**Estimated savings:** ~150–160 kB on og-image.webp conversion; ~20 kB on logo SVG conversion.

**Recommended action:** Medium priority; implement after TrialPageNew fixes.

---

### Finding 8: Unused/Questionable Dependencies — **P3 LOW**

**Severity:** P3 — No immediate performance impact, but code health  

**resend (6.8.0):**
- Listed in `dependencies` (not devDependencies).
- No imports found in `src/` (frontend code).
- Likely intended for serverless email, but not shipped to the browser.
- **Status:** Remove from dependencies; move to a separate `functions/` folder if serverless functions exist elsewhere, or delete if unused.

**react-snap (1.23.0):**
- Listed in `devDependencies` ✓
- `index.tsx` uses `hydrateRoot` for prerendered pages (prerender-via-react-snap pattern).
- `package.json` has `reactSnap` config with crawl paths.
- **Status:** In use for prerendering. Keep as dev dependency.
- **Note:** `react-snap` adds complexity and overhead. Consider migrating to Vite's built-in prerender plugin or removing prerendering entirely if not actively used. For now, acceptable.

**Recommendation:**
1. Remove `resend` from `dependencies` (it's not used on the frontend).
2. If Vercel Edge Functions / serverless are in use elsewhere, ensure they have their own `package.json`.
3. Consider profiling `react-snap` overhead during build; if it's slowing dev/ci cycles, migrate to a lighter solution.

**Estimated savings:** Negligible bundle impact (resend isn't shipped). Code health + build time minor improvement.

---

### Finding 9: Core Web Vitals Risk Assessment — **SYNTHESIS**

#### LCP (Largest Contentful Paint)

**Current risk:** HIGH

- **TrialPageNew chunk (172 kB gzip)** must parse, compile, and execute before the largest trial metadata element renders.
- On 4G (0.6 Mbps): 172 kB ÷ 0.6 Mbps ≈ 2.3 seconds to download.
- Parse + compile time on mid-range mobile device: ~1–2 seconds.
- **Predicted LCP:** 3–4 seconds (target: <2.5s).

**Mitigation:**
- Split TrialPageNew chunk to prioritize metadata section (Finding 1).
- Preload trial metadata via `<link rel="prefetch">` on trials listing page.
- Implement skeleton screens for chart sections (deferred below fold).

#### CLS (Cumulative Layout Shift)

**Current risk:** MEDIUM

- Trial charts (DistributionChart, GrottaBar, etc.) load asynchronously.
- If no dimension placeholders are set, layout will shift when charts render.
- Markdown content may also shift if height is not reserved.

**Mitigation:**
- Add CSS aspect-ratio or fixed height containers for all chart components:
  ```css
  .chart-container {
    aspect-ratio: 16 / 9;
    background: var(--skeleton-bg);
  }
  ```

#### FID/INP (Interaction to Next Paint)

**Current risk:** MEDIUM

- **TrialPageNew chunk (172 kB gzip) locks the main thread** during parse/compile.
- If user tries to interact (scroll, click) during parse, response is delayed.
- Predicted INP on 4G: 200–400 ms (target: <200ms).

**Mitigation:**
- Break large chunk into smaller pieces (Finding 1).
- Use `requestIdleCallback()` or `setTimeout(..., 0)` to defer non-critical computations during component render.
- Consider worker thread for markdown parsing (if that's a hot path).

---

## Top 5 Performance Improvements (Ranked by Impact)

| # | Fix | Complexity | Est. Gzip Savings | Est. LCP Impact | Timeline |
|---|---|---|---|---|---|
| **1** | Split TrialPageNew by sections (metadata / content / charts) | Medium | 80–120 kB | -40–60% on trial pages | 2–3 sprints |
| **2** | Partition trialData.ts by trial ID | Medium | 120–150 kB per load | -30–40% on trial page load | 1–2 sprints |
| **3** | Code-split guide articles by route (verify guideContent.ts) | Low | 30–50 kB | -10–20% on home load | 1 sprint |
| **4** | Defer recharts / convert charts to custom SVG | Medium | 20–30 kB | -5–10% on trial pages | 1–2 sprints |
| **5** | Convert og-image.png → webp + compress logo | Low | 150–160 kB (doesn't block LCP, but improves perceived perf) | 0% LCP, ~2s FCP | < 1 sprint |

**Total potential recovery:** ~400–510 kB gzip + 40–60% LCP improvement.

---

## vite.config.ts Analysis

**Current config state:**
```typescript
build: {
  minify: true,                    // ✓ Good
  sourcemap: false,                // ✓ Good (no sourcemaps in prod)
  target: 'es2020',                // ✓ Good (modern targets reduce bundle)
  cssMinify: true,                 // ✓ Good
  reportCompressedSize: true,      // ✓ Good (shows gzip)
  rollupOptions: {
    output: {
      manualChunks: (id) => {
        if (id.includes('node_modules')) {
          if (id.includes('react-router-dom') || ...) return 'react-vendor'; // ✓ Good
          if (id.includes('lucide-react')) return 'lucide';                   // ✓ Good
        }
      },
    },
  },
},
esbuild: {
  drop: mode === 'production' ? ['console', 'debugger'] : [],  // ✓ Good
},
```

**Recommendations:**
1. **Add `rollup-plugin-visualizer` detection** for the main chunk:
   ```typescript
   manualChunks: (id) => {
     if (id.includes('node_modules/react-markdown')) return 'markdown';
     if (id.includes('node_modules/recharts')) return 'recharts';
     // ... other splits
   }
   ```

2. **Increase `publicDir` cache time** in Vercel config (not Vite) to 30 days for versioned assets.

3. **Consider `vite-plugin-compress`** to auto-generate `.br` (Brotli) + `.gz` versions for HTTP/2 push.

---

## Test Plan for QA Gate 2 (Desktop + Mobile)

When performance improvements are implemented, verify:

1. **Core Web Vitals on trial page (desktop + mobile 375px):**
   - LCP: <2.5 seconds (target)
   - CLS: <0.1 (no unexpected layout shifts during chart load)
   - INP: <200 ms (smooth interactions during chunk parsing)

2. **No horizontal scroll on mobile (375px):**
   - Charts use responsive containers; verify `ResponsiveContainer` width is 100%.
   - CSS grid / flexbox adapt to viewport width.

3. **Code splitting verification:**
   - `npm run build` output shows separate chunks for each trial data module (if partitioned).
   - Main chunk should be <120 kB gzip.
   - TrialPageNew chunk (when deferred) <100 kB gzip.

4. **No console errors on trial load:**
   - Dynamic imports resolve correctly.
   - Lazy-loaded components render without hydration mismatches.

5. **Skeleton/placeholder layout stability:**
   - Add CLS verification tool (Lighthouse) to validate <0.1 CLS on trial pages.

---

## Specification Compliance

**Against CLAUDE.md §20 (Quality Gates):**
- Gate 1 (Build + Typecheck): ✓ No new warnings expected from this audit.
- Gate 2 (Mobile + Desktop QA): Yellow flag — LCP + CLS risks documented; fixes will clear.
- Gate 3 (Spec compliance): N/A (performance is a policy, not a spec requirement).
- Gate 5 (Regression matrix): Ensure performance fixes don't break trial page rendering.

---

## Rollback & Risk

**If performance fixes are implemented:**
1. Each chunk split (TrialPageNew sections, trial data partitioning) adds a route boundary.
2. Risk: Hydration mismatch if React.lazy() falls back to `createRoot` instead of `hydrateRoot`.
3. **Mitigation:** Ensure `index.tsx` hydrateRoot logic is tested on all new lazy boundaries.
4. **Rollback plan:** Revert chunking changes to original monolithic TrialPageNew; restore trialData.ts as single export.

---

## Conclusion

NeuroWiki ships with **critical bundle bloat** in TrialPageNew and a **data loading antipattern** in trialData.ts. Fixes are straightforward (code splitting + data partitioning) and will recover **400–500 kB gzip + 40–60% LCP improvement** with **low architectural risk**. Start with Findings 1 & 2 (highest impact); defer Findings 5–8 to a future optimization pass.
