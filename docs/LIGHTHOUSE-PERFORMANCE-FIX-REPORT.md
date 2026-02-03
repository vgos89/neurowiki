# Lighthouse Performance Fix Report

**Date:** 2026-02-03  
**Goal:** Address 5 critical Lighthouse issues (Performance 55 → 90+)

---

## Summary of Fixes Implemented

### ISSUE 1: Render blocking (900ms delay)

**Changes:**
- **Google Analytics** moved from `<head>` to end of `<body>`. The main gtag script remains `async`; the inline config runs after DOM is available, reducing parse blocking.
- **Font stylesheets** (Inter, Material Symbols) made non-render-blocking using the `media="print" onload="this.media='all'"` pattern. `<noscript>` fallbacks keep fonts working when JS is disabled.
- **Vite** already emits the main script as `type="module"` (deferred by default) and injects `rel="modulepreload"` for `react-vendor` and `lucide` in production build.

**Expected:** Less main-thread blocking and faster first paint.

---

### ISSUE 2: Unused JavaScript (1,600 KB wasted)

**Changes:**
- **guideContent (Layout):** `GUIDE_CONTENT` is no longer imported in `Layout.tsx`. It is loaded only when the user navigates to a path under `/guide` or `/trials` via `import('../data/guideContent')` in a `useEffect`. This removes ~63 KB (20 KB gzipped) from the initial bundle.
- **Already in place (Phase 2):** Routes, modals (Disclaimer, GlobalTrial, ToolManager, Feedback), and vendor splitting keep the initial shell small; route and modal chunks load on demand.

**Lazy-loaded pieces (not on initial load):**
- All route pages (Home, Calculators, Guide articles, Trials, etc.)
- Modals: DisclaimerModal, GlobalTrialModal, ToolManagerModal, FeedbackModal
- guideContent (only when user visits /guide or /trials)
- **Stroke Basics workflow (for 95+ target):** On `/guide/stroke-basics`, `strokeClinicalPearls` (~110 KB) is loaded asynchronously after mount; `CodeModeStep2`, `CodeModeStep3`, `CodeModeStep4`, `StrokeIchProtocolStep`, and `NihssCalculatorEmbed` are lazy-loaded with `Suspense`, so the initial Stroke Basics route chunk is much smaller and LCP improves.

**Expected:** Large reduction in “unused” JS on the first page, since guide/trials data and route code load only when needed.

---

### ISSUE 3: Unminified JavaScript (1,555 KB bloat)

**Changes in `vite.config.ts`:**
- **`build.minify: true`** (explicit; Vite’s default for production).
- **`build.sourcemap: false`** so source maps are not emitted or served, reducing payload and avoiding “unminified” signals from map-backed sources.
- **`build.cssMinify: true`** for CSS minification.
- **`esbuild.drop: ['console', 'debugger']`** in production to strip `console.*` and `debugger` and slightly reduce size.

**Expected:** All production JS is minified; no source maps in the deployed bundle.

---

### ISSUE 4: Large network payload (4,325 KB total)

**Changes:**
- **Smaller initial bundle:** guideContent removed from Layout (see Issue 2). Main entry chunk is now ~44 KB gzip; second shared chunk ~36 KB gzip; react-vendor ~74 KB gzip; lucide ~4.6 KB gzip; CSS ~19 KB gzip → **~178 KB gzip** for the critical path (excluding route-specific chunks).
- **No source maps** in production (see Issue 3).
- **Fonts** non-blocking and loaded asynchronously (see Issue 1).

**Build output (gzip):**
- Main entry: index-9RpUIRcH.js ~11.45 KB (part of initial load)
- index-RDanohsv.js ~36.16 KB
- react-vendor ~73.58 KB
- lucide ~4.61 KB
- index CSS ~18.85 KB  
- guideContent only when needed: ~20 KB gzip

**Expected:** Total initial transfer well under 1 MB; further reduction vs. previous 4.3 MB.

---

### ISSUE 5: Network dependency tree (serial vs parallel)

**Changes:**
- **Preload:** Vite injects `rel="modulepreload"` for `react-vendor` and `lucide` in the built `index.html`, so the browser can fetch them in parallel with the main module.
- **GA** at end of body and fonts with `media="print"` reduce head blocking so critical resources can start earlier.
- **Vendor splitting** (react-vendor, lucide, genai) keeps a stable cache and clear loading order.

**Expected:** Better parallelization of critical JS and less serial blocking.

---

## Files Touched

| File | Change |
|------|--------|
| `vite.config.ts` | `build.minify`, `sourcemap: false`, `cssMinify`, `esbuild.drop`; `rollup-plugin-visualizer` when `ANALYZE=true` |
| `index.html` | GA moved to end of body; font links use `media="print" onload="this.media='all'"` + noscript |
| `src/components/Layout.tsx` | Static `GUIDE_CONTENT` import removed; `guideContent` state + `useEffect` dynamic `import('../data/guideContent')` when path is /guide or /trials; use `guideContent ?? {}` for trial orphans and sidebar |
| `package.json` | `build:analyze` script for `ANALYZE=true vite build` |

---

## Bundle Size (After Fixes)

Approximate **gzipped** sizes for the main path and key chunks:

| Chunk | Size (gzip) | When loaded |
|-------|-------------|-------------|
| index (main) | ~11 KB + ~36 KB | Initial |
| react-vendor | ~74 KB | Initial (preloaded) |
| lucide | ~4.6 KB | Initial (preloaded) |
| index.css | ~19 KB | Initial |
| **Initial total** | **~145–180 KB** | First load |
| guideContent | ~20 KB | When user visits /guide or /trials |
| Route chunks | 2–36 KB each | When user visits that route |

---

## How to Verify

1. **Build**
   ```bash
   npm run build
   ```

2. **Bundle analysis (optional)**
   ```bash
   npm run build:analyze
   # Open dist/stats.html in a browser
   ```

3. **Lighthouse**
   - Deploy or run `npm run preview` and open the production URL.
   - Chrome DevTools → Lighthouse → Performance.
   - Target: Performance score **90+**, total transfer **&lt; 1 MB** for initial load.

4. **Checks**
   - Homepage and /calculators load without requesting `guideContent-*.js` until user navigates to /guide or /trials.
   - No `.map` files under `dist/`.
   - `index.html` has GA at end of body and font links with `media="print" onload="this.media='all'"`.

---

## Expected Lighthouse Results

| Metric | Before | After (expected) |
|--------|--------|-------------------|
| Performance score | 55 | 90+ |
| Total transfer (initial) | 4,325 KB | &lt; 1 MB |
| Unused JS | 1,600 KB | &lt; 100 KB (on homepage) |
| Unminified JS | 1,555 KB | 0 (minified, no source maps) |
| Render blocking | 900 ms | &lt; 100 ms |

Re-run Lighthouse on the deployed (or preview) URL to capture the actual new score and metrics.

---

## Critical: Run Lighthouse on production, not dev

If your report shows **development** React builds (`react-dom-client.development.js`, `react-router/dist/development/`), **Vite client** (`/@vite/client`), or **unminified** JS/CSS, the audit was run against `npm run dev`. That will keep the score low no matter how much we optimize.

- **Do:** `npm run build` then `npm run preview` (or deploy `dist/`), and run Lighthouse on that URL.
- **Do:** Use an **Incognito** window (or disable extensions); extensions can add 1 MB+ of script and skew “Reduce unused JavaScript” and total payload.

See **`docs/LIGHTHOUSE-AUDIT-INSTRUCTIONS.md`** for step-by-step instructions and compression (e.g. Cloudflare Brotli) for deployed production.
